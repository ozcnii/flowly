import { and, desc, eq } from "drizzle-orm";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { getD1 } from "@/lib/cloudflare";
import type { HabitOccurrenceStatus } from "@/features/rhythm/model/occurrences";

export const loadOwnedHabitOccurrence = async (db: Database, userId: string, id: string) => {
  const occurrence = (await db.select().from(schema.activityOccurrences).where(and(
    eq(schema.activityOccurrences.id, id),
    eq(schema.activityOccurrences.userId, userId),
    eq(schema.activityOccurrences.entityType, "habit"),
  )).limit(1))[0];
  if (!occurrence) return null;
  const habit = (await db.select().from(schema.habits).where(and(
    eq(schema.habits.id, occurrence.entityId),
    eq(schema.habits.ownerId, userId),
  )).limit(1))[0];
  return habit ? { occurrence, habit } : null;
};

export const loadOwnedHabit = async (db: Database, userId: string, id: string) =>
  (await db.select().from(schema.habits).where(and(eq(schema.habits.id, id), eq(schema.habits.ownerId, userId))).limit(1))[0] ?? null;

export const getOccurrenceHistory = (db: Database, occurrenceId: string) =>
  db.select().from(schema.statusHistory).where(eq(schema.statusHistory.occurrenceId, occurrenceId)).orderBy(desc(schema.statusHistory.createdAt));

export type TransitionResult =
  | { kind: "not_found" }
  | { kind: "invalid"; message: string }
  | { kind: "ok"; occurrence: typeof schema.activityOccurrences.$inferSelect; idempotent: boolean };

export async function transitionHabitOccurrence(
  db: Database,
  userId: string,
  id: string,
  status: HabitOccurrenceStatus,
  comment: string | null,
  source: string,
): Promise<TransitionResult> {
  const target = await loadOwnedHabitOccurrence(db, userId, id);
  if (!target || target.habit.status === "archived") return { kind: "not_found" };
  if (status === "skipped" && !target.habit.allowSkip) return { kind: "invalid", message: "Для этой привычки пропуск недоступен." };
  if (status === "rest" && !target.habit.allowRest) return { kind: "invalid", message: "Для этой привычки отдых недоступен." };
  if (target.occurrence.status === status) return { kind: "ok", occurrence: target.occurrence, idempotent: true };

  const ts = nowIso(), historyId = generateId(), raw = getD1();
  const result = await raw.batch([
    raw.prepare(`INSERT INTO status_history (id,occurrence_id,old_status,new_status,changed_by_user_id,source,comment,created_at) SELECT ?,id,status,?,?,?,?,? FROM activity_occurrences WHERE id=? AND user_id=? AND entity_type='habit' AND status=?`).bind(historyId, status, userId, source, comment, ts, id, userId, target.occurrence.status),
    raw.prepare(`UPDATE activity_occurrences SET status=?, completed_at=?, source=?, updated_at=? WHERE id=? AND user_id=? AND entity_type='habit' AND status=?`).bind(status, ts, source, ts, id, userId, target.occurrence.status),
    raw.prepare(`UPDATE reminder_jobs SET status='cancelled', error_code='occurrence_terminal' WHERE occurrence_id=? AND user_id=? AND status='pending'`).bind(id, userId),
  ]);
  if (!result[1]?.meta.changes) {
    const current = await loadOwnedHabitOccurrence(db, userId, id);
    return current ? { kind: "ok", occurrence: current.occurrence, idempotent: current.occurrence.status === status } : { kind: "not_found" };
  }
  const occurrence = (await db.select().from(schema.activityOccurrences).where(eq(schema.activityOccurrences.id, id)).limit(1))[0];
  return occurrence ? { kind: "ok", occurrence, idempotent: false } : { kind: "not_found" };
}
