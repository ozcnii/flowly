import { expandHabitSlots, generateId, localDateInTimezone, localDateTimeToUtcIso, nowIso } from "@flowly/core";

type UserRow = { id: string; timezone: string };
type HabitRow = { id: string; owner_id: string; reminder_policy_id: string | null; configuration_json: string; rule_type: string; start_local_date: string; end_local_date: string | null; valid_from: string };
type OccurrenceRow = { id: string; status: string; scheduled_at_utc: string; scheduled_local_date: string };
type PolicyRow = { id: string; max_messages: number; last_message_local_time: string | null };
type StepRow = { step_number: number; delay_minutes: number | null };

const TERMINAL = new Set(["completed", "partial", "rest", "skipped", "no_response", "cancelled", "expired"]);

const createJobs = async (db: D1Database, habit: HabitRow, occurrence: OccurrenceRow, timezone: string) => {
  if (TERMINAL.has(occurrence.status) || !habit.reminder_policy_id) return 0;
  const policy = await db.prepare("SELECT id, max_messages, last_message_local_time FROM reminder_policies WHERE id = ? LIMIT 1").bind(habit.reminder_policy_id).first<PolicyRow>();
  if (!policy) return 0;
  const { results: steps } = await db.prepare("SELECT step_number, delay_minutes FROM reminder_policy_steps WHERE policy_id = ? ORDER BY step_number LIMIT ?").bind(policy.id, policy.max_messages).all<StepRow>();
  let created = 0;
  const baseMs = Date.parse(occurrence.scheduled_at_utc);
  for (const step of steps) {
    const dueAtUtc = step.delay_minutes === null
      ? policy.last_message_local_time ? localDateTimeToUtcIso(occurrence.scheduled_local_date, policy.last_message_local_time, timezone) : null
      : new Date(baseMs + step.delay_minutes * 60_000).toISOString();
    if (!dueAtUtc || Date.parse(dueAtUtc) < baseMs) continue;
    const result = await db.prepare("INSERT OR IGNORE INTO reminder_jobs (id, occurrence_id, user_id, policy_id, step_number, due_at_utc, status, attempt_count, locked_at, sent_at, telegram_message_id, idempotency_key, error_code, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', 0, NULL, NULL, NULL, ?, NULL, ?)")
      .bind(generateId(), occurrence.id, habit.owner_id, policy.id, step.step_number, dueAtUtc, `${occurrence.id}:${step.step_number}:${dueAtUtc}`, nowIso()).run();
    created += result.meta.changes ?? 0;
  }
  return created;
};

export async function generateHabitDataForToday(db: D1Database, now = new Date()) {
  const { results: users } = await db.prepare("SELECT id, timezone FROM users WHERE deleted_at IS NULL").all<UserRow>();
  let occurrencesCreated = 0;
  let jobsCreated = 0;
  for (const user of users) {
    const date = localDateInTimezone(now, user.timezone);
    const { results: habits } = await db.prepare("SELECT h.id, h.owner_id, h.reminder_policy_id, h.start_local_date, h.end_local_date, r.rule_type, r.configuration_json, r.valid_from FROM habits h JOIN habit_schedule_rules r ON r.habit_id = h.id AND r.valid_until IS NULL WHERE h.owner_id = ? AND h.status = 'active' AND h.start_local_date <= ? AND (h.end_local_date IS NULL OR h.end_local_date >= ?) AND r.valid_from <= ?")
      .bind(user.id, date, date, date).all<HabitRow>();
    for (const habit of habits) {
      const slots = expandHabitSlots({ ruleType: habit.rule_type as "exact_times" | "weekdays" | "weekly_target" | "interval", configuration: JSON.parse(habit.configuration_json) }, date, date);
      for (const slot of slots) {
        const scheduledAtUtc = localDateTimeToUtcIso(slot.localDate, slot.localTime, user.timezone);
        const occurrenceResult = await db.prepare("INSERT OR IGNORE INTO activity_occurrences (id, user_id, entity_type, entity_id, parent_entity_id, scheduled_local_date, scheduled_local_time, timezone, scheduled_at_utc, status, completed_at, duration_seconds, source, created_at, updated_at) VALUES (?, ?, 'habit', ?, NULL, ?, ?, ?, ?, 'scheduled', NULL, 0, 'habit_schedule', ?, ?)")
          .bind(generateId(), user.id, habit.id, slot.localDate, slot.localTime, user.timezone, scheduledAtUtc, nowIso(), nowIso()).run();
        occurrencesCreated += occurrenceResult.meta.changes ?? 0;
        const occurrence = await db.prepare("SELECT id, status, scheduled_at_utc, scheduled_local_date FROM activity_occurrences WHERE user_id = ? AND entity_type = 'habit' AND entity_id = ? AND scheduled_local_date = ? AND scheduled_local_time = ? LIMIT 1")
          .bind(user.id, habit.id, slot.localDate, slot.localTime).first<OccurrenceRow>();
        if (occurrence) jobsCreated += await createJobs(db, habit, occurrence, user.timezone);
      }
    }
  }
  return { occurrencesCreated, jobsCreated, users: users.length };
}
