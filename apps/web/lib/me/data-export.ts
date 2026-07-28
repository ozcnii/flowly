import { eq, inArray, or } from "drizzle-orm";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { sendMessage } from "@/lib/telegram/outbound";

/** §51.2 protected user export JSON. */
export async function buildUserExport(db: Database, userId: string) {
  const user = (await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0];
  if (!user) return null;
  const settings = (await db.select().from(schema.userSettings).where(eq(schema.userSettings.userId, userId)).limit(1))[0];
  const habits = await db.select().from(schema.habits).where(eq(schema.habits.ownerId, userId));
  const habitIds = habits.map((h) => h.id);
  const schedules = habitIds.length
    ? await db.select().from(schema.habitScheduleRules).where(inArray(schema.habitScheduleRules.habitId, habitIds))
    : [];
  const workouts = await db.select().from(schema.workouts).where(eq(schema.workouts.ownerId, userId));
  const occurrences = await db.select().from(schema.activityOccurrences).where(eq(schema.activityOccurrences.userId, userId));
  const sessions = await db.select().from(schema.workoutSessions).where(eq(schema.workoutSessions.userId, userId));
  const favorites = await db.select().from(schema.favorites).where(eq(schema.favorites.userId, userId));
  const friendships = await db
    .select()
    .from(schema.friendships)
    .where(or(eq(schema.friendships.requesterId, userId), eq(schema.friendships.addresseeId, userId)));
  const habitShares = habitIds.length
    ? await db.select().from(schema.habitShares).where(inArray(schema.habitShares.habitId, habitIds))
    : [];
  const enrollments = await db.select().from(schema.programEnrollments).where(eq(schema.programEnrollments.userId, userId));
  return {
    exportedAt: nowIso(),
    version: 1,
    profile: {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: user.timezone,
      locale: user.locale,
      onboardingCompletedAt: user.onboardingCompletedAt,
      createdAt: user.createdAt,
    },
    settings: settings ?? null,
    workouts,
    habits,
    schedules,
    history: { occurrences, sessions },
    friends: friendships,
    habitShares,
    favorites,
    reports: { enrollments },
  };
}

export async function createAndNotifyExport(db: Database, userId: string) {
  const jobId = generateId();
  const ts = nowIso();
  await db.insert(schema.userExportJobs).values({ id: jobId, userId, status: "running", createdAt: ts, completedAt: null, sizeBytes: null, error: null });
  try {
    const payload = await buildUserExport(db, userId);
    if (!payload) throw new Error("user_not_found");
    const body = JSON.stringify(payload);
    const size = body.length;
    await db
      .update(schema.userExportJobs)
      .set({ status: "ready", completedAt: nowIso(), sizeBytes: size })
      .where(eq(schema.userExportJobs.id, jobId));
    const user = (await db.select({ telegramId: schema.users.telegramId }).from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0];
    if (user?.telegramId) {
      try {
        await sendMessage(user.telegramId, `Flowly: экспорт данных готов (${Math.round(size / 1024)} КБ). Скачайте его в приложении: Профиль → Данные.`);
      } catch {
        /* bot notice best-effort */
      }
    }
    return { jobId, payload, sizeBytes: size };
  } catch (e) {
    await db
      .update(schema.userExportJobs)
      .set({ status: "failed", completedAt: nowIso(), error: String(e).slice(0, 200) })
      .where(eq(schema.userExportJobs.id, jobId));
    throw e;
  }
}
