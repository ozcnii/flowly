import { and, eq, isNull } from "drizzle-orm";
import { expandHabitSlots, generateId, localDateInTimezone, localDateTimeToUtcIso, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";

const TERMINAL = new Set(["completed", "partial", "rest", "skipped", "no_response", "cancelled", "expired"]);
const HABIT_SOURCE = "habit_schedule";

type UserHabit = typeof schema.habits.$inferSelect;
type HabitRule = typeof schema.habitScheduleRules.$inferSelect;

const parseRule = (rule: HabitRule) => ({ ruleType: rule.ruleType as "exact_times" | "weekdays" | "weekly_target" | "interval", configuration: JSON.parse(rule.configurationJson) as Record<string, unknown> });

const insertReminderJobs = async (db: Database, habit: UserHabit, occurrence: typeof schema.activityOccurrences.$inferSelect, timezone: string) => {
  if (TERMINAL.has(occurrence.status) || !habit.reminderPolicyId) return 0;
  const policy = (await db.select().from(schema.reminderPolicies).where(eq(schema.reminderPolicies.id, habit.reminderPolicyId)).limit(1))[0];
  if (!policy) return 0;
  const steps = (await db.select().from(schema.reminderPolicySteps).where(eq(schema.reminderPolicySteps.policyId, policy.id)))
    .sort((a, b) => a.stepNumber - b.stepNumber).slice(0, policy.maxMessages);
  const baseMs = Date.parse(occurrence.scheduledAtUtc);
  let created = 0;
  for (const step of steps) {
    const dueAtUtc = step.delayMinutes === null
      ? policy.lastMessageLocalTime ? localDateTimeToUtcIso(occurrence.scheduledLocalDate, policy.lastMessageLocalTime, timezone) : null
      : new Date(baseMs + step.delayMinutes * 60_000).toISOString();
    if (!dueAtUtc || Date.parse(dueAtUtc) < baseMs) continue;
    const idempotencyKey = `${occurrence.id}:${step.stepNumber}:${dueAtUtc}`;
    const result = await db.insert(schema.reminderJobs).values({
      id: generateId(), occurrenceId: occurrence.id, userId: habit.ownerId, policyId: policy.id,
      stepNumber: step.stepNumber, dueAtUtc, status: "pending", attemptCount: 0, lockedAt: null,
      sentAt: null, telegramMessageId: null, idempotencyKey, errorCode: null, createdAt: nowIso(),
    }).onConflictDoNothing();
    if (result.meta.changes) created += result.meta.changes;
  }
  return created;
};

/** Materialize the concrete habit executions for one profile-local calendar date. */
export async function ensureHabitScheduleForDate(db: Database, userId: string, date: string) {
  const user = (await db.select({ timezone: schema.users.timezone }).from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0];
  if (!user) return { occurrencesCreated: 0, jobsCreated: 0, timezone: null };
  const habits = await db.select().from(schema.habits).where(and(eq(schema.habits.ownerId, userId), eq(schema.habits.status, "active")));
  let occurrencesCreated = 0;
  let jobsCreated = 0;
  for (const habit of habits) {
    if (habit.startLocalDate > date || (habit.endLocalDate !== null && habit.endLocalDate < date)) continue;
    const rule = (await db.select().from(schema.habitScheduleRules).where(and(eq(schema.habitScheduleRules.habitId, habit.id), isNull(schema.habitScheduleRules.validUntil))).limit(1))[0];
    if (!rule || rule.validFrom > date) continue;
    for (const slot of expandHabitSlots(parseRule(rule), date, date)) {
      const scheduledAtUtc = localDateTimeToUtcIso(slot.localDate, slot.localTime, user.timezone);
      const result = await db.insert(schema.activityOccurrences).values({
        id: generateId(), userId, entityType: "habit", entityId: habit.id, parentEntityId: null,
        scheduledLocalDate: slot.localDate, scheduledLocalTime: slot.localTime, timezone: user.timezone,
        scheduledAtUtc, status: "scheduled", completedAt: null, durationSeconds: 0, source: HABIT_SOURCE,
        createdAt: nowIso(), updatedAt: nowIso(),
      }).onConflictDoNothing();
      if (result.meta.changes) occurrencesCreated += result.meta.changes;
      const occurrence = (await db.select().from(schema.activityOccurrences).where(and(
        eq(schema.activityOccurrences.userId, userId), eq(schema.activityOccurrences.entityType, "habit"),
        eq(schema.activityOccurrences.entityId, habit.id), eq(schema.activityOccurrences.scheduledLocalDate, slot.localDate),
        eq(schema.activityOccurrences.scheduledLocalTime, slot.localTime),
      )).limit(1))[0];
      if (occurrence) jobsCreated += await insertReminderJobs(db, habit, occurrence, user.timezone);
    }
  }
  return { occurrencesCreated, jobsCreated, timezone: user.timezone };
}

export async function ensureHabitScheduleForToday(db: Database, userId: string, now = new Date()) {
  const user = (await db.select({ timezone: schema.users.timezone }).from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0];
  return user ? ensureHabitScheduleForDate(db, userId, localDateInTimezone(now, user.timezone)) : { occurrencesCreated: 0, jobsCreated: 0, timezone: null };
}
