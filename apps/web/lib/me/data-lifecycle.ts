import { and, eq, inArray, isNotNull, lt, or } from "drizzle-orm";
import { nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";

const GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export const deletionDeadline = (deletedAt: string) => new Date(Date.parse(deletedAt) + GRACE_MS).toISOString();
export const inGrace = (deletedAt: string | null | undefined) => {
  if (!deletedAt) return false;
  return Date.now() < Date.parse(deletedAt) + GRACE_MS;
};

/** DEC-020: clear history keeps account/settings/objects. */
export async function clearUserHistory(db: Database, userId: string) {
  const occ = await db.select({ id: schema.activityOccurrences.id }).from(schema.activityOccurrences).where(eq(schema.activityOccurrences.userId, userId));
  const occIds = occ.map((r) => r.id);
  if (occIds.length) {
    await db.delete(schema.statusHistory).where(inArray(schema.statusHistory.occurrenceId, occIds));
    await db.delete(schema.activityOccurrences).where(eq(schema.activityOccurrences.userId, userId));
  }
  await db.delete(schema.workoutSessions).where(eq(schema.workoutSessions.userId, userId));
  await db.delete(schema.reminderJobs).where(eq(schema.reminderJobs.userId, userId));
  return { removedOccurrences: occIds.length };
}

export async function requestAccountDeletion(db: Database, userId: string) {
  const ts = nowIso();
  await db.update(schema.users).set({ deletedAt: ts, updatedAt: ts }).where(eq(schema.users.id, userId));
  // Keep sessions so in-app cancel works; DEC-020 also allows cancel via Telegram re-auth.
  await db
    .update(schema.reminderJobs)
    .set({ status: "cancelled" })
    .where(and(eq(schema.reminderJobs.userId, userId), inArray(schema.reminderJobs.status, ["pending", "sending"])));
  return { deletedAt: ts, purgeAt: deletionDeadline(ts) };
}

export async function cancelAccountDeletion(db: Database, userId: string) {
  const user = (await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0];
  if (!user?.deletedAt || !inGrace(user.deletedAt)) return { cancelled: false as const, reason: "not_in_grace" as const };
  const ts = nowIso();
  await db.update(schema.users).set({ deletedAt: null, updatedAt: ts }).where(eq(schema.users.id, userId));
  return { cancelled: true as const, reason: "ok" as const };
}

/** After grace: anonymize for joint integrity, delete private data. */
export async function purgeExpiredDeletions(db: Database) {
  const cutoff = new Date(Date.now() - GRACE_MS).toISOString();
  const expired = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(and(isNotNull(schema.users.deletedAt), lt(schema.users.deletedAt, cutoff)));
  let purged = 0;
  for (const { id } of expired) {
    await clearUserHistory(db, id);
    await db.delete(schema.favorites).where(eq(schema.favorites.userId, id));
    const ownedHabits = await db.select({ id: schema.habits.id }).from(schema.habits).where(eq(schema.habits.ownerId, id));
    if (ownedHabits.length) await db.delete(schema.habitShares).where(inArray(schema.habitShares.habitId, ownedHabits.map((h) => h.id)));
    await db.delete(schema.habitShares).where(eq(schema.habitShares.sharedWithUserId, id));
    await db.delete(schema.workoutShares).where(or(eq(schema.workoutShares.sharedByUserId, id), eq(schema.workoutShares.sharedWithUserId, id)));
    await db.delete(schema.friendships).where(or(eq(schema.friendships.requesterId, id), eq(schema.friendships.addresseeId, id)));
    await db.delete(schema.inviteLinks).where(eq(schema.inviteLinks.ownerId, id));
    await db.delete(schema.programEnrollmentShares).where(eq(schema.programEnrollmentShares.userId, id));
    await db.delete(schema.programEnrollments).where(eq(schema.programEnrollments.userId, id));
    await db.delete(schema.partnerReminds).where(or(eq(schema.partnerReminds.senderId, id), eq(schema.partnerReminds.recipientId, id)));
    const ts = nowIso();
    await db
      .update(schema.users)
      .set({
        telegramId: `deleted:${id}`,
        username: null,
        firstName: "Удалённый",
        lastName: null,
        onboardingCompletedAt: null,
        updatedAt: ts,
      })
      .where(eq(schema.users.id, id));
    if (ownedHabits.length) {
      await db.delete(schema.habitScheduleRules).where(inArray(schema.habitScheduleRules.habitId, ownedHabits.map((h) => h.id)));
      await db.delete(schema.habits).where(eq(schema.habits.ownerId, id));
    }
    await db.delete(schema.workouts).where(eq(schema.workouts.ownerId, id));
    await db.delete(schema.userSettings).where(eq(schema.userSettings.userId, id));
    await db.delete(schema.authSessions).where(eq(schema.authSessions.userId, id));
    purged += 1;
  }
  return purged;
}

