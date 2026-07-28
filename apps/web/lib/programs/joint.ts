import { and, eq, inArray } from "drizzle-orm";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { areAcceptedFriends } from "@/lib/shares/service";

export async function shareEnrollment(db: Database, enrollmentId: string, ownerId: string, withUserId: string) {
  const enrollment = (
    await db
      .select()
      .from(schema.programEnrollments)
      .where(
        and(
          eq(schema.programEnrollments.id, enrollmentId),
          eq(schema.programEnrollments.userId, ownerId),
          eq(schema.programEnrollments.status, "active"),
        ),
      )
      .limit(1)
  )[0];
  if (!enrollment) return { kind: "not_found" as const };
  if (withUserId === ownerId) return { kind: "invalid" as const, message: "Нельзя пригласить себя." };
  if (!(await areAcceptedFriends(db, ownerId, withUserId))) {
    return { kind: "invalid" as const, message: "Только друзья." };
  }
  const existing = (
    await db
      .select()
      .from(schema.programEnrollmentShares)
      .where(
        and(
          eq(schema.programEnrollmentShares.enrollmentId, enrollmentId),
          eq(schema.programEnrollmentShares.userId, withUserId),
        ),
      )
      .limit(1)
  )[0];
  const ts = nowIso();
  if (existing) {
    if (existing.status === "accepted" || existing.status === "invited") {
      return { kind: "ok" as const, idempotent: true };
    }
    await db
      .update(schema.programEnrollmentShares)
      .set({ status: "invited", createdAt: ts })
      .where(
        and(
          eq(schema.programEnrollmentShares.enrollmentId, enrollmentId),
          eq(schema.programEnrollmentShares.userId, withUserId),
        ),
      );
  } else {
    await db.insert(schema.programEnrollmentShares).values({
      enrollmentId,
      userId: withUserId,
      status: "invited",
      createdAt: ts,
    });
  }
  return { kind: "ok" as const, idempotent: false, programId: enrollment.programId, startLocalDate: enrollment.startLocalDate };
}

/** Accept joint invite: mark accepted; create own enrollment with same start date if needed (no schedule shift of owner). */
export async function acceptEnrollmentShare(db: Database, enrollmentId: string, userId: string) {
  const share = (
    await db
      .select()
      .from(schema.programEnrollmentShares)
      .where(
        and(
          eq(schema.programEnrollmentShares.enrollmentId, enrollmentId),
          eq(schema.programEnrollmentShares.userId, userId),
        ),
      )
      .limit(1)
  )[0];
  if (!share) return { kind: "not_found" as const };
  if (share.status === "accepted") return { kind: "ok" as const, idempotent: true };
  if (share.status !== "invited") return { kind: "invalid" as const, message: "Приглашение недоступно." };

  const ownerEnrollment = (
    await db.select().from(schema.programEnrollments).where(eq(schema.programEnrollments.id, enrollmentId)).limit(1)
  )[0];
  if (!ownerEnrollment || ownerEnrollment.status !== "active") return { kind: "not_found" as const };

  await db
    .update(schema.programEnrollmentShares)
    .set({ status: "accepted" })
    .where(
      and(
        eq(schema.programEnrollmentShares.enrollmentId, enrollmentId),
        eq(schema.programEnrollmentShares.userId, userId),
      ),
    );

  const own = (
    await db
      .select()
      .from(schema.programEnrollments)
      .where(
        and(
          eq(schema.programEnrollments.userId, userId),
          eq(schema.programEnrollments.programId, ownerEnrollment.programId),
          eq(schema.programEnrollments.status, "active"),
        ),
      )
      .limit(1)
  )[0];
  let enrollmentOwnId = own?.id;
  if (!own) {
    enrollmentOwnId = generateId();
    await db.insert(schema.programEnrollments).values({
      id: enrollmentOwnId,
      programId: ownerEnrollment.programId,
      userId,
      startLocalDate: ownerEnrollment.startLocalDate,
      reminderPolicyId: ownerEnrollment.reminderPolicyId,
      reminderLocalTime: ownerEnrollment.reminderLocalTime,
      status: "active",
      createdAt: nowIso(),
      completedAt: null,
    });
  }
  return {
    kind: "ok" as const,
    idempotent: false,
    enrollmentId: enrollmentOwnId!,
    programId: ownerEnrollment.programId,
    startLocalDate: ownerEnrollment.startLocalDate,
  };
}

export async function leaveEnrollmentShare(db: Database, enrollmentId: string, userId: string) {
  const share = (
    await db
      .select()
      .from(schema.programEnrollmentShares)
      .where(
        and(
          eq(schema.programEnrollmentShares.enrollmentId, enrollmentId),
          eq(schema.programEnrollmentShares.userId, userId),
        ),
      )
      .limit(1)
  )[0];
  if (!share) return { kind: "not_found" as const };
  if (share.status === "left" || share.status === "revoked") return { kind: "ok" as const, idempotent: true };
  await db
    .update(schema.programEnrollmentShares)
    .set({ status: "left" })
    .where(
      and(
        eq(schema.programEnrollmentShares.enrollmentId, enrollmentId),
        eq(schema.programEnrollmentShares.userId, userId),
      ),
    );
  return { kind: "ok" as const, idempotent: false };
}

export async function listJointMembers(db: Database, enrollmentId: string, requesterId: string) {
  const enrollment = (
    await db.select().from(schema.programEnrollments).where(eq(schema.programEnrollments.id, enrollmentId)).limit(1)
  )[0];
  if (!enrollment) return { kind: "not_found" as const };
  const isOwner = enrollment.userId === requesterId;
  const share = (
    await db
      .select()
      .from(schema.programEnrollmentShares)
      .where(
        and(
          eq(schema.programEnrollmentShares.enrollmentId, enrollmentId),
          eq(schema.programEnrollmentShares.userId, requesterId),
          inArray(schema.programEnrollmentShares.status, ["invited", "accepted"]),
        ),
      )
      .limit(1)
  )[0];
  if (!isOwner && !share) return { kind: "not_found" as const };

  const shares = await db
    .select()
    .from(schema.programEnrollmentShares)
    .where(
      and(
        eq(schema.programEnrollmentShares.enrollmentId, enrollmentId),
        inArray(schema.programEnrollmentShares.status, ["invited", "accepted"]),
      ),
    );
  const userIds = [enrollment.userId, ...shares.map((s) => s.userId)];
  const users = await db
    .select({ id: schema.users.id, firstName: schema.users.firstName, username: schema.users.username })
    .from(schema.users)
    .where(inArray(schema.users.id, userIds));
  const map = new Map(users.map((u) => [u.id, u]));

  type Member = {
    userId: string;
    role: "owner" | "member";
    status: "accepted" | "invited";
    peer: { id: string; firstName: string; username: string | null } | null;
    completedDays: number;
  };
  const members: Member[] = [
    {
      userId: enrollment.userId,
      role: "owner",
      status: "accepted",
      peer: map.get(enrollment.userId) ?? null,
      completedDays: await completedProgramDays(db, enrollment.userId, enrollment.programId),
    },
  ];
  for (const s of shares) {
    members.push({
      userId: s.userId,
      role: "member",
      status: s.status === "accepted" ? "accepted" : "invited",
      peer: map.get(s.userId) ?? null,
      completedDays:
        s.status === "accepted" ? await completedProgramDays(db, s.userId, enrollment.programId) : 0,
    });
  }
  return { kind: "ok" as const, enrollment, members, myStatus: isOwner ? "owner" : share!.status };
}

async function completedProgramDays(db: Database, userId: string, programId: string) {
  const own = (
    await db
      .select()
      .from(schema.programEnrollments)
      .where(
        and(
          eq(schema.programEnrollments.userId, userId),
          eq(schema.programEnrollments.programId, programId),
          eq(schema.programEnrollments.status, "active"),
        ),
      )
      .limit(1)
  )[0];
  if (!own) return 0;
  const rows = await db
    .select()
    .from(schema.activityOccurrences)
    .where(
      and(
        eq(schema.activityOccurrences.userId, userId),
        eq(schema.activityOccurrences.parentEntityId, own.id),
        eq(schema.activityOccurrences.entityType, "workout"),
        inArray(schema.activityOccurrences.status, ["completed", "partial"]),
      ),
    );
  return rows.length;
}
