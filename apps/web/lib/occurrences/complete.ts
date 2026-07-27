import { and, eq } from "drizzle-orm";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { getD1 } from "@/lib/cloudflare";
import { loadOwnedHabitOccurrence, transitionHabitOccurrence, type TransitionResult } from "@/lib/habits/occurrence-status";

export async function loadOwnedOccurrence(db: Database, userId: string, id: string) {
  return (
    (await db
      .select()
      .from(schema.activityOccurrences)
      .where(and(eq(schema.activityOccurrences.id, id), eq(schema.activityOccurrences.userId, userId)))
      .limit(1))[0] ?? null
  );
}

export async function loadWorkoutTitle(db: Database, workoutId: string) {
  return (
    (await db.select({ title: schema.workouts.title, durationSeconds: schema.workouts.durationSeconds }).from(schema.workouts).where(eq(schema.workouts.id, workoutId)).limit(1))[0] ?? null
  );
}

/** Complete habit or workout occurrence for Telegram callbacks (DEC-015 terminal). */
export async function transitionOccurrenceCompleted(
  db: Database,
  userId: string,
  id: string,
  source: string,
): Promise<TransitionResult & { entityType?: string; title?: string }> {
  const occ = await loadOwnedOccurrence(db, userId, id);
  if (!occ) return { kind: "not_found" };

  if (occ.entityType === "habit") {
    const result = await transitionHabitOccurrence(db, userId, id, "completed", null, source);
    if (result.kind !== "ok") return result;
    const owned = await loadOwnedHabitOccurrence(db, userId, id);
    return {
      ...result,
      entityType: "habit",
      title: owned?.habit.title ?? "Привычка",
    };
  }

  if (occ.entityType !== "workout") return { kind: "not_found" };

  if (occ.status === "completed") {
    const w = await loadWorkoutTitle(db, occ.entityId);
    return { kind: "ok", occurrence: occ, idempotent: true, entityType: "workout", title: w?.title ?? "Тренировка" };
  }

  const ts = nowIso(), historyId = generateId(), raw = getD1();
  const result = await raw.batch([
    raw
      .prepare(
        `INSERT INTO status_history (id,occurrence_id,old_status,new_status,changed_by_user_id,source,comment,created_at)
         SELECT ?,id,status,?,?,?,?,? FROM activity_occurrences WHERE id=? AND user_id=? AND entity_type='workout' AND status=?`,
      )
      .bind(historyId, "completed", userId, source, null, ts, id, userId, occ.status),
    raw
      .prepare(
        `UPDATE activity_occurrences SET status=?, completed_at=?, source=?, updated_at=? WHERE id=? AND user_id=? AND entity_type='workout' AND status=?`,
      )
      .bind("completed", ts, source, ts, id, userId, occ.status),
    raw
      .prepare(`UPDATE reminder_jobs SET status='cancelled', error_code='occurrence_terminal' WHERE occurrence_id=? AND user_id=? AND status='pending'`)
      .bind(id, userId),
  ]);

  if (!result[1]?.meta.changes) {
    const current = await loadOwnedOccurrence(db, userId, id);
    if (!current) return { kind: "not_found" };
    const w = await loadWorkoutTitle(db, current.entityId);
    return {
      kind: "ok",
      occurrence: current,
      idempotent: current.status === "completed",
      entityType: "workout",
      title: w?.title ?? "Тренировка",
    };
  }

  const occurrence = (await db.select().from(schema.activityOccurrences).where(eq(schema.activityOccurrences.id, id)).limit(1))[0];
  if (!occurrence) return { kind: "not_found" };
  const w = await loadWorkoutTitle(db, occurrence.entityId);
  return { kind: "ok", occurrence, idempotent: false, entityType: "workout", title: w?.title ?? "Тренировка" };
}
