import { and, eq } from "drizzle-orm";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { scheduleLocalDate } from "@/features/programs/model/program-dates";

/** Deterministic UTC marker for a local calendar date (noon Z) — stable for TZ-agnostic ordering. */
export const scheduledAtUtcForLocalDate = (localDate: string, localTime = "00:00") =>
  `${localDate}T${localTime.length === 5 ? localTime : "00:00"}:00.000Z`;

type DayRow = { id: string; dayNumber: number; type: string; workoutId: string | null };

/**
 * Ensure one occurrence per enrollment program day (PRD §26 / E3-D4-T06).
 * Workout days: entity_type=workout, status scheduled until terminal.
 * Planned rest: entity_type=program_day, status rest (not skip).
 * Never overwrites terminal statuses; never mutates startLocalDate.
 */
export async function ensureProgramOccurrences(
  db: Database,
  input: {
    userId: string;
    enrollmentId: string;
    startLocalDate: string;
    timezone: string;
    days: DayRow[];
  },
) {
  const { userId, enrollmentId, startLocalDate, timezone, days } = input;
  const existing = await db.select({
    id: schema.activityOccurrences.id,
    entityType: schema.activityOccurrences.entityType,
    entityId: schema.activityOccurrences.entityId,
    scheduledLocalDate: schema.activityOccurrences.scheduledLocalDate,
    status: schema.activityOccurrences.status,
    parentEntityId: schema.activityOccurrences.parentEntityId,
  }).from(schema.activityOccurrences).where(and(
    eq(schema.activityOccurrences.userId, userId),
    eq(schema.activityOccurrences.parentEntityId, enrollmentId),
  ));

  const byKey = new Map(existing.map((row) => [`${row.entityType}|${row.entityId}|${row.scheduledLocalDate}`, row]));
  const ts = nowIso();
  let created = 0;

  for (const day of days) {
    const scheduledLocalDate = scheduleLocalDate(startLocalDate, day.dayNumber);
    if (day.type === "rest") {
      const entityType = "program_day";
      const entityId = day.id;
      const key = `${entityType}|${entityId}|${scheduledLocalDate}`;
      if (byKey.has(key)) continue;
      const id = generateId();
      await db.insert(schema.activityOccurrences).values({
        id,
        userId,
        entityType,
        entityId,
        parentEntityId: enrollmentId,
        scheduledLocalDate,
        scheduledLocalTime: "00:00",
        timezone,
        scheduledAtUtc: scheduledAtUtcForLocalDate(scheduledLocalDate),
        status: "rest",
        completedAt: null,
        durationSeconds: 0,
        source: "program_enroll",
        createdAt: ts,
        updatedAt: ts,
      });
      byKey.set(key, { id, entityType, entityId, scheduledLocalDate, status: "rest", parentEntityId: enrollmentId });
      created += 1;
      continue;
    }
    if (!day.workoutId) continue;
    const entityType = "workout";
    const entityId = day.workoutId;
    const key = `${entityType}|${entityId}|${scheduledLocalDate}`;
    if (byKey.has(key)) continue;
    // also skip if another occurrence exists for same workout+date (e.g. session finish without parent)
    const orphan = (await db.select({ id: schema.activityOccurrences.id }).from(schema.activityOccurrences).where(and(
      eq(schema.activityOccurrences.userId, userId),
      eq(schema.activityOccurrences.entityType, entityType),
      eq(schema.activityOccurrences.entityId, entityId),
      eq(schema.activityOccurrences.scheduledLocalDate, scheduledLocalDate),
    )).limit(1))[0];
    if (orphan) {
      await db.update(schema.activityOccurrences).set({ parentEntityId: enrollmentId, updatedAt: ts }).where(eq(schema.activityOccurrences.id, orphan.id));
      byKey.set(key, { id: orphan.id, entityType, entityId, scheduledLocalDate, status: "linked", parentEntityId: enrollmentId });
      continue;
    }
    const id = generateId();
    await db.insert(schema.activityOccurrences).values({
      id,
      userId,
      entityType,
      entityId,
      parentEntityId: enrollmentId,
      scheduledLocalDate,
      scheduledLocalTime: "00:00",
      timezone,
      scheduledAtUtc: scheduledAtUtcForLocalDate(scheduledLocalDate),
      status: "scheduled",
      completedAt: null,
      durationSeconds: 0,
      source: "program_enroll",
      createdAt: ts,
      updatedAt: ts,
    });
    byKey.set(key, { id, entityType, entityId, scheduledLocalDate, status: "scheduled", parentEntityId: enrollmentId });
    created += 1;
  }

  return { created, total: byKey.size };
}
