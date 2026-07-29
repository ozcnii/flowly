import { and, eq, inArray } from "drizzle-orm";
import { localDateTimeToUtcIso, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";

const OPEN = ["scheduled", "due", "notified", "snoozed"] as const;
const OPEN_JOBS = ["pending", "sending"] as const;

/** When profile timezone changes, re-anchor open habit slots + pending jobs (keep local wall times). */
export async function recomputeOpenHabitTimesForTimezone(db: Database, userId: string, timezone: string) {
  const rows = await db
    .select()
    .from(schema.activityOccurrences)
    .where(
      and(
        eq(schema.activityOccurrences.userId, userId),
        eq(schema.activityOccurrences.entityType, "habit"),
        inArray(schema.activityOccurrences.status, [...OPEN]),
      ),
    );
  let occurrences = 0;
  let jobs = 0;
  const ts = nowIso();
  for (const row of rows) {
    const oldUtc = row.scheduledAtUtc;
    const newUtc = localDateTimeToUtcIso(row.scheduledLocalDate, row.scheduledLocalTime, timezone);
    if (newUtc === oldUtc && row.timezone === timezone) continue;
    await db
      .update(schema.activityOccurrences)
      .set({ timezone, scheduledAtUtc: newUtc, updatedAt: ts })
      .where(eq(schema.activityOccurrences.id, row.id));
    occurrences += 1;
    const pending = await db
      .select()
      .from(schema.reminderJobs)
      .where(and(eq(schema.reminderJobs.occurrenceId, row.id), inArray(schema.reminderJobs.status, [...OPEN_JOBS])));
    const oldMs = Date.parse(oldUtc);
    const newMs = Date.parse(newUtc);
    for (const job of pending) {
      const delta = Date.parse(job.dueAtUtc) - oldMs;
      const dueAtUtc = new Date(newMs + delta).toISOString();
      await db.update(schema.reminderJobs).set({ dueAtUtc }).where(eq(schema.reminderJobs.id, job.id));
      jobs += 1;
    }
  }
  return { occurrences, jobs };
}
