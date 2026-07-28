import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { areAcceptedFriends } from "@/lib/shares/service";
import { GOAL_TYPES, REACTION_EMOJIS, type GoalType } from "./types";

export type { GoalType } from "./types";
export { GOAL_TYPES, REACTION_EMOJIS };
export type MemberStatus = "owner" | "invited" | "accepted" | "left" | "declined";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function listChallengesForUser(db: Database, userId: string) {
  const memberships = await db
    .select()
    .from(schema.challengeMembers)
    .where(
      and(
        eq(schema.challengeMembers.userId, userId),
        inArray(schema.challengeMembers.status, ["owner", "accepted", "invited"]),
      ),
    );
  if (memberships.length === 0) return [];
  const ids = memberships.map((m) => m.challengeId);
  const challenges = await db.select().from(schema.challenges).where(inArray(schema.challenges.id, ids));
  const byId = new Map(challenges.map((c) => [c.id, c]));
  return memberships
    .map((m) => {
      const c = byId.get(m.challengeId);
      if (!c) return null;
      return { challenge: c, membership: { status: m.status as MemberStatus, joinedAt: m.joinedAt } };
    })
    .filter(Boolean);
}

export async function getChallenge(db: Database, challengeId: string, userId: string) {
  const membership = (
    await db
      .select()
      .from(schema.challengeMembers)
      .where(
        and(eq(schema.challengeMembers.challengeId, challengeId), eq(schema.challengeMembers.userId, userId)),
      )
      .limit(1)
  )[0];
  if (!membership || membership.status === "left" || membership.status === "declined") {
    return { kind: "not_found" as const };
  }
  const challenge = (
    await db.select().from(schema.challenges).where(eq(schema.challenges.id, challengeId)).limit(1)
  )[0];
  if (!challenge) return { kind: "not_found" as const };

  const members = await db
    .select()
    .from(schema.challengeMembers)
    .where(eq(schema.challengeMembers.challengeId, challengeId));
  const userIds = members.map((m) => m.userId);
  const users =
    userIds.length > 0
      ? await db
          .select({ id: schema.users.id, firstName: schema.users.firstName, username: schema.users.username })
          .from(schema.users)
          .where(inArray(schema.users.id, userIds))
      : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const progress = await Promise.all(
    members
      .filter((m) => m.status === "owner" || m.status === "accepted")
      .map(async (m) => ({
        userId: m.userId,
        value: await progressForMember(db, challenge, m.userId),
        peer: userMap.get(m.userId) ?? null,
        status: m.status as MemberStatus,
      })),
  );

  return {
    kind: "ok" as const,
    challenge,
    membership: { status: membership.status as MemberStatus, joinedAt: membership.joinedAt },
    members: members.map((m) => ({
      userId: m.userId,
      status: m.status as MemberStatus,
      joinedAt: m.joinedAt,
      peer: userMap.get(m.userId) ?? null,
    })),
    progress,
  };
}

async function progressForMember(
  db: Database,
  challenge: typeof schema.challenges.$inferSelect,
  memberId: string,
) {
  const { startsOn, endsOn, goalType } = challenge;
  if (goalType === "workout_count") {
    const rows = await db
      .select({ n: sql<number>`count(*)` })
      .from(schema.activityOccurrences)
      .where(
        and(
          eq(schema.activityOccurrences.userId, memberId),
          eq(schema.activityOccurrences.entityType, "workout"),
          eq(schema.activityOccurrences.status, "completed"),
          gte(schema.activityOccurrences.scheduledLocalDate, startsOn),
          lte(schema.activityOccurrences.scheduledLocalDate, endsOn),
        ),
      );
    return Number(rows[0]?.n ?? 0);
  }
  if (goalType === "habit_count") {
    const rows = await db
      .select({ n: sql<number>`count(*)` })
      .from(schema.activityOccurrences)
      .where(
        and(
          eq(schema.activityOccurrences.userId, memberId),
          eq(schema.activityOccurrences.entityType, "habit"),
          inArray(schema.activityOccurrences.status, ["completed", "partial"]),
          gte(schema.activityOccurrences.scheduledLocalDate, startsOn),
          lte(schema.activityOccurrences.scheduledLocalDate, endsOn),
        ),
      );
    return Number(rows[0]?.n ?? 0);
  }
  if (goalType === "daily") {
    const rows = await db
      .select({ d: schema.activityOccurrences.scheduledLocalDate })
      .from(schema.activityOccurrences)
      .where(
        and(
          eq(schema.activityOccurrences.userId, memberId),
          inArray(schema.activityOccurrences.status, ["completed", "partial"]),
          gte(schema.activityOccurrences.scheduledLocalDate, startsOn),
          lte(schema.activityOccurrences.scheduledLocalDate, endsOn),
        ),
      );
    return new Set(rows.map((r) => r.d)).size;
  }
  if (goalType === "total_time") {
    const rows = await db
      .select({ s: sql<number>`coalesce(sum(${schema.workoutSessions.accumulatedSeconds}), 0)` })
      .from(schema.workoutSessions)
      .where(
        and(
          eq(schema.workoutSessions.userId, memberId),
          gte(schema.workoutSessions.startedAt, `${startsOn}T00:00:00.000Z`),
          lte(schema.workoutSessions.startedAt, `${endsOn}T23:59:59.999Z`),
        ),
      );
    return Math.floor(Number(rows[0]?.s ?? 0) / 60);
  }
  return 0;
}

export async function createChallenge(
  db: Database,
  ownerId: string,
  input: {
    title: string;
    description: string;
    goalType: GoalType;
    goalValue: number;
    startsOn: string;
    endsOn: string;
    memberIds?: string[];
  },
) {
  if (!DATE.test(input.startsOn) || !DATE.test(input.endsOn) || input.endsOn < input.startsOn) {
    return { kind: "invalid" as const, message: "Некорректные даты." };
  }
  if (!GOAL_TYPES.includes(input.goalType)) return { kind: "invalid" as const, message: "Неизвестный тип цели." };
  if (input.goalValue < 1) return { kind: "invalid" as const, message: "Цель должна быть ≥ 1." };
  const title = input.title.trim().slice(0, 120);
  if (title.length < 1) return { kind: "invalid" as const, message: "Название обязательно." };

  const memberIds = [...new Set((input.memberIds ?? []).filter((id) => id !== ownerId))];
  for (const mid of memberIds) {
    if (!(await areAcceptedFriends(db, ownerId, mid))) {
      return { kind: "invalid" as const, message: "Участники — только друзья." };
    }
  }

  const id = generateId();
  const ts = nowIso();
  await db.insert(schema.challenges).values({
    id,
    ownerId,
    title,
    description: (input.description ?? "").trim().slice(0, 2000),
    goalType: input.goalType,
    goalValue: input.goalValue,
    startsOn: input.startsOn,
    endsOn: input.endsOn,
    createdAt: ts,
  });
  await db.insert(schema.challengeMembers).values({
    challengeId: id,
    userId: ownerId,
    status: "owner",
    joinedAt: ts,
  });
  for (const mid of memberIds) {
    await db.insert(schema.challengeMembers).values({
      challengeId: id,
      userId: mid,
      status: "invited",
      joinedAt: ts,
    });
  }
  return { kind: "ok" as const, id };
}

export async function joinChallenge(db: Database, challengeId: string, userId: string) {
  const row = (
    await db
      .select()
      .from(schema.challengeMembers)
      .where(and(eq(schema.challengeMembers.challengeId, challengeId), eq(schema.challengeMembers.userId, userId)))
      .limit(1)
  )[0];
  if (!row) return { kind: "not_found" as const };
  if (row.status === "owner" || row.status === "accepted") return { kind: "ok" as const, idempotent: true };
  if (row.status !== "invited" && row.status !== "left" && row.status !== "declined") {
    return { kind: "invalid" as const, message: "Нельзя вступить." };
  }
  await db
    .update(schema.challengeMembers)
    .set({ status: "accepted", joinedAt: nowIso() })
    .where(and(eq(schema.challengeMembers.challengeId, challengeId), eq(schema.challengeMembers.userId, userId)));
  return { kind: "ok" as const, idempotent: false };
}

export async function leaveChallenge(db: Database, challengeId: string, userId: string) {
  const challenge = (
    await db.select().from(schema.challenges).where(eq(schema.challenges.id, challengeId)).limit(1)
  )[0];
  if (!challenge) return { kind: "not_found" as const };
  if (challenge.ownerId === userId) {
    return { kind: "invalid" as const, message: "Владелец не может выйти — удалите челлендж." };
  }
  const row = (
    await db
      .select()
      .from(schema.challengeMembers)
      .where(and(eq(schema.challengeMembers.challengeId, challengeId), eq(schema.challengeMembers.userId, userId)))
      .limit(1)
  )[0];
  if (!row) return { kind: "not_found" as const };
  if (row.status === "left") return { kind: "ok" as const, idempotent: true };
  await db
    .update(schema.challengeMembers)
    .set({ status: "left" })
    .where(and(eq(schema.challengeMembers.challengeId, challengeId), eq(schema.challengeMembers.userId, userId)));
  return { kind: "ok" as const, idempotent: false };
}

export async function declineChallenge(db: Database, challengeId: string, userId: string) {
  const row = (
    await db
      .select()
      .from(schema.challengeMembers)
      .where(and(eq(schema.challengeMembers.challengeId, challengeId), eq(schema.challengeMembers.userId, userId)))
      .limit(1)
  )[0];
  if (!row) return { kind: "not_found" as const };
  if (row.status === "declined") return { kind: "ok" as const, idempotent: true };
  if (row.status !== "invited") return { kind: "invalid" as const, message: "Можно отклонить только приглашение." };
  await db
    .update(schema.challengeMembers)
    .set({ status: "declined" })
    .where(and(eq(schema.challengeMembers.challengeId, challengeId), eq(schema.challengeMembers.userId, userId)));
  return { kind: "ok" as const, idempotent: false };
}

export async function setReaction(
  db: Database,
  senderId: string,
  input: { recipientId: string; entityType: string; entityId: string; emoji: string },
) {
  if (!REACTION_EMOJIS.includes(input.emoji as (typeof REACTION_EMOJIS)[number])) {
    return { kind: "invalid" as const, message: "Недоступная реакция." };
  }
  if (input.entityType !== "challenge") return { kind: "invalid" as const, message: "Тип не поддерживается." };
  if (senderId === input.recipientId) return { kind: "invalid" as const, message: "Нельзя реагировать себе." };
  const members = await db
    .select()
    .from(schema.challengeMembers)
    .where(
      and(
        eq(schema.challengeMembers.challengeId, input.entityId),
        inArray(schema.challengeMembers.userId, [senderId, input.recipientId]),
        inArray(schema.challengeMembers.status, ["owner", "accepted"]),
      ),
    );
  if (members.length < 2) return { kind: "forbidden" as const };

  const existing = (
    await db
      .select()
      .from(schema.reactions)
      .where(
        and(
          eq(schema.reactions.senderId, senderId),
          eq(schema.reactions.entityType, input.entityType),
          eq(schema.reactions.entityId, input.entityId),
        ),
      )
      .limit(1)
  )[0];
  const ts = nowIso();
  if (existing) {
    if (existing.emoji === input.emoji) {
      await db.delete(schema.reactions).where(eq(schema.reactions.id, existing.id));
      return { kind: "ok" as const, action: "removed" as const };
    }
    await db
      .update(schema.reactions)
      .set({ emoji: input.emoji, recipientId: input.recipientId, createdAt: ts })
      .where(eq(schema.reactions.id, existing.id));
    return { kind: "ok" as const, action: "changed" as const };
  }
  await db.insert(schema.reactions).values({
    id: generateId(),
    senderId,
    recipientId: input.recipientId,
    entityType: input.entityType,
    entityId: input.entityId,
    emoji: input.emoji,
    createdAt: ts,
  });
  return { kind: "ok" as const, action: "added" as const };
}

export async function listReactions(db: Database, entityType: string, entityId: string, userId: string) {
  if (entityType === "challenge") {
    const m = (
      await db
        .select()
        .from(schema.challengeMembers)
        .where(
          and(
            eq(schema.challengeMembers.challengeId, entityId),
            eq(schema.challengeMembers.userId, userId),
            inArray(schema.challengeMembers.status, ["owner", "accepted", "invited"]),
          ),
        )
        .limit(1)
    )[0];
    if (!m) return { kind: "not_found" as const };
  } else return { kind: "invalid" as const };
  const rows = await db
    .select()
    .from(schema.reactions)
    .where(and(eq(schema.reactions.entityType, entityType), eq(schema.reactions.entityId, entityId)));
  return { kind: "ok" as const, reactions: rows };
}
