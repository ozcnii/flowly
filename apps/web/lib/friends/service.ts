import { and, eq, or, inArray, sql } from "drizzle-orm";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";

const INVITE_TTL_MS = 7 * 24 * 60 * 60_000;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type FriendshipStatus = "pending" | "accepted" | "rejected" | "removed" | "blocked";

export function randomInviteCode(len = 8) {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  return out;
}

export async function listFriends(db: Database, userId: string) {
  const rows = await db
    .select()
    .from(schema.friendships)
    .where(
      and(
        or(eq(schema.friendships.requesterId, userId), eq(schema.friendships.addresseeId, userId)),
        inArray(schema.friendships.status, ["accepted", "pending"]),
      ),
    );
  const peerIds = rows
    .map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId))
    .filter((id): id is string => Boolean(id));
  const peers =
    peerIds.length > 0
      ? await db
          .select({
            id: schema.users.id,
            firstName: schema.users.firstName,
            username: schema.users.username,
            telegramId: schema.users.telegramId,
          })
          .from(schema.users)
          .where(inArray(schema.users.id, peerIds))
      : [];
  const peerMap = new Map(peers.map((p) => [p.id, p]));
  return rows.map((r) => {
    const peerId = r.requesterId === userId ? r.addresseeId : r.requesterId;
    const peer = peerId ? peerMap.get(peerId) : null;
    return {
      id: r.id,
      status: r.status as FriendshipStatus,
      role: r.requesterId === userId ? ("requester" as const) : ("addressee" as const),
      createdAt: r.createdAt,
      acceptedAt: r.acceptedAt,
      inviteCode: r.inviteCode,
      peer: peer
        ? { id: peer.id, firstName: peer.firstName, username: peer.username, telegramId: peer.telegramId }
        : null,
    };
  });
}

export async function createInvite(db: Database, ownerId: string) {
  const ts = nowIso();
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomInviteCode();
    const inviteId = generateId();
    const friendshipId = generateId();
    try {
      await db.insert(schema.inviteLinks).values({
        id: inviteId,
        ownerId,
        code,
        expiresAt,
        maxUses: 1,
        useCount: 0,
        createdAt: ts,
      });
      await db.insert(schema.friendships).values({
        id: friendshipId,
        requesterId: ownerId,
        addresseeId: null,
        status: "pending",
        inviteCode: code,
        createdAt: ts,
        acceptedAt: null,
        removedAt: null,
      });
      return { code, expiresAt, friendshipId, inviteId };
    } catch {
      // unique code collision — retry
    }
  }
  throw new Error("invite_code_collision");
}

async function claimInvite(db: Database, inviteId: string) {
  const result = await db
    .update(schema.inviteLinks)
    .set({ useCount: sql`${schema.inviteLinks.useCount} + 1` })
    .where(and(eq(schema.inviteLinks.id, inviteId), sql`${schema.inviteLinks.useCount} < ${schema.inviteLinks.maxUses}`));
  return (result.meta.changes ?? 0) > 0;
}

export async function acceptInvite(db: Database, code: string, userId: string) {
  const normalized = code.toUpperCase();
  const invite = (
    await db.select().from(schema.inviteLinks).where(eq(schema.inviteLinks.code, normalized)).limit(1)
  )[0];
  if (!invite) return { kind: "not_found" as const };
  if (invite.ownerId === userId) return { kind: "invalid" as const, message: "Нельзя принять своё приглашение." };
  if (invite.expiresAt < nowIso()) return { kind: "invalid" as const, message: "Приглашение истекло." };

  const existing = (
    await db
      .select()
      .from(schema.friendships)
      .where(
        and(
          eq(schema.friendships.status, "accepted"),
          or(
            and(eq(schema.friendships.requesterId, invite.ownerId), eq(schema.friendships.addresseeId, userId)),
            and(eq(schema.friendships.requesterId, userId), eq(schema.friendships.addresseeId, invite.ownerId)),
          ),
        ),
      )
      .limit(1)
  )[0];
  if (existing) {
    if (invite.useCount < invite.maxUses) await claimInvite(db, invite.id);
    return { kind: "ok" as const, friendshipId: existing.id, idempotent: true };
  }

  if (invite.useCount >= invite.maxUses) {
    return { kind: "invalid" as const, message: "Приглашение уже использовано." };
  }
  if (!(await claimInvite(db, invite.id))) {
    return { kind: "invalid" as const, message: "Приглашение уже использовано." };
  }

  const pending = (
    await db
      .select()
      .from(schema.friendships)
      .where(and(eq(schema.friendships.inviteCode, invite.code), eq(schema.friendships.status, "pending")))
      .limit(1)
  )[0];

  const ts = nowIso();
  let friendshipId = pending?.id;
  if (pending) {
    await db
      .update(schema.friendships)
      .set({ addresseeId: userId, status: "accepted", acceptedAt: ts })
      .where(eq(schema.friendships.id, pending.id));
  } else {
    friendshipId = generateId();
    await db.insert(schema.friendships).values({
      id: friendshipId,
      requesterId: invite.ownerId,
      addresseeId: userId,
      status: "accepted",
      inviteCode: invite.code,
      createdAt: ts,
      acceptedAt: ts,
      removedAt: null,
    });
  }

  return { kind: "ok" as const, friendshipId: friendshipId!, idempotent: false };
}

export async function rejectInvite(db: Database, code: string, userId: string) {
  const invite = (
    await db.select().from(schema.inviteLinks).where(eq(schema.inviteLinks.code, code.toUpperCase())).limit(1)
  )[0];
  if (!invite) return { kind: "not_found" as const };
  if (invite.ownerId === userId) return { kind: "invalid" as const, message: "Нельзя отклонить своё приглашение." };
  const pending = (
    await db
      .select()
      .from(schema.friendships)
      .where(and(eq(schema.friendships.inviteCode, invite.code), eq(schema.friendships.status, "pending")))
      .limit(1)
  )[0];
  const ts = nowIso();
  if (pending) {
    await db
      .update(schema.friendships)
      .set({ addresseeId: userId, status: "rejected", removedAt: ts })
      .where(eq(schema.friendships.id, pending.id));
  }
  return { kind: "ok" as const };
}

export async function removeFriendship(db: Database, friendshipId: string, userId: string) {
  const row = (await db.select().from(schema.friendships).where(eq(schema.friendships.id, friendshipId)).limit(1))[0];
  if (!row) return { kind: "not_found" as const };
  if (row.requesterId !== userId && row.addresseeId !== userId) return { kind: "forbidden" as const };
  if (row.status === "removed") return { kind: "ok" as const, idempotent: true };
  await db
    .update(schema.friendships)
    .set({ status: "removed", removedAt: nowIso() })
    .where(eq(schema.friendships.id, friendshipId));
  // Immediate access revoke (PRD §32.4 / §33.3 / DEC-019)
  if (row.addresseeId) {
    const { revokeAllSharesBetween } = await import("@/lib/shares/service");
    await revokeAllSharesBetween(db, row.requesterId, row.addresseeId);
  }
  return { kind: "ok" as const, idempotent: false };
}
