import { eq } from "drizzle-orm";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { getD1 } from "@/lib/cloudflare";
import { transitionHabitOccurrence } from "@/lib/habits/occurrence-status";
import { loadOwnedOccurrence, loadWorkoutTitle, transitionOccurrenceCompleted } from "@/lib/occurrences/complete";

const TERMINAL = new Set(["completed", "partially_completed", "rest", "skipped", "no_response", "cancelled", "expired"]);

export type ActionResult =
  | { kind: "not_found" }
  | { kind: "invalid"; message: string }
  | { kind: "ok"; title: string; status: string; idempotent?: boolean; detail?: string };

async function titleFor(db: Database, occ: typeof schema.activityOccurrences.$inferSelect): Promise<string> {
  if (occ.entityType === "habit") {
    const h = (await db.select({ title: schema.habits.title, emoji: schema.habits.emoji }).from(schema.habits).where(eq(schema.habits.id, occ.entityId)).limit(1))[0];
    return h ? `${h.emoji?.trim() || "📌"} ${h.title}` : "Привычка";
  }
  const w = await loadWorkoutTitle(db, occ.entityId);
  return w ? `🧘 ${w.title}` : "Тренировка";
}

/** Preset snooze: cancel pending jobs, set snoozed, insert one deferred job. */
export async function snoozeOccurrence(
  db: Database,
  userId: string,
  occurrenceId: string,
  minutes: number,
): Promise<ActionResult> {
  const occ = await loadOwnedOccurrence(db, userId, occurrenceId);
  if (!occ) return { kind: "not_found" };
  if (TERMINAL.has(occ.status) && occ.status !== "snoozed") {
    return { kind: "ok", title: await titleFor(db, occ), status: occ.status, idempotent: true };
  }

  const dueAtUtc = new Date(Date.now() + minutes * 60_000).toISOString();
  const ts = nowIso();
  const raw = getD1();
  const policyId =
    occ.entityType === "habit"
      ? (
          await db
            .select({ reminderPolicyId: schema.habits.reminderPolicyId })
            .from(schema.habits)
            .where(eq(schema.habits.id, occ.entityId))
            .limit(1)
        )[0]?.reminderPolicyId
      : "rp-program-default";
  const usePolicy = policyId || "rp-program-default";
  const jobId = generateId();
  const historyId = generateId();
  const idempotencyKey = `snooze:${occurrenceId}:${dueAtUtc}`;

  await raw.batch([
    raw
      .prepare(
        `INSERT INTO status_history (id,occurrence_id,old_status,new_status,changed_by_user_id,source,comment,created_at)
         SELECT ?,id,status,?,?,?,?,? FROM activity_occurrences WHERE id=? AND user_id=? AND status!=?`,
      )
      .bind(historyId, "snoozed", userId, "telegram_snooze", `${minutes}m`, ts, occurrenceId, userId, "snoozed"),
    raw
      .prepare(`UPDATE activity_occurrences SET status='snoozed', source='telegram_snooze', updated_at=? WHERE id=? AND user_id=?`)
      .bind(ts, occurrenceId, userId),
    raw
      .prepare(`UPDATE reminder_jobs SET status='cancelled', error_code='snoozed' WHERE occurrence_id=? AND user_id=? AND status='pending'`)
      .bind(occurrenceId, userId),
    raw
      .prepare(
        `INSERT OR IGNORE INTO reminder_jobs (id,occurrence_id,user_id,policy_id,step_number,due_at_utc,status,attempt_count,locked_at,sent_at,telegram_message_id,idempotency_key,error_code,created_at)
         VALUES (?,?,?,?,90,?,?,0,NULL,NULL,NULL,?,NULL,?)`,
      )
      .bind(jobId, occurrenceId, userId, usePolicy, dueAtUtc, "pending", idempotencyKey, ts),
  ]);

  return {
    kind: "ok",
    title: await titleFor(db, occ),
    status: "snoozed",
    detail: `Напомним через ${minutes} мин`,
  };
}

export async function skipOccurrence(db: Database, userId: string, occurrenceId: string): Promise<ActionResult> {
  const occ = await loadOwnedOccurrence(db, userId, occurrenceId);
  if (!occ) return { kind: "not_found" };
  if (occ.entityType !== "habit") return { kind: "invalid", message: "Пропуск доступен только для привычек." };
  const result = await transitionHabitOccurrence(db, userId, occurrenceId, "skipped", null, "telegram_skip");
  if (result.kind !== "ok") return result.kind === "invalid" ? result : { kind: "not_found" };
  return {
    kind: "ok",
    title: await titleFor(db, result.occurrence),
    status: "skipped",
    idempotent: result.idempotent,
  };
}

export async function restOccurrence(db: Database, userId: string, occurrenceId: string): Promise<ActionResult> {
  const occ = await loadOwnedOccurrence(db, userId, occurrenceId);
  if (!occ) return { kind: "not_found" };

  if (occ.entityType === "habit") {
    const result = await transitionHabitOccurrence(db, userId, occurrenceId, "rest", null, "telegram_rest");
    if (result.kind !== "ok") return result.kind === "invalid" ? result : { kind: "not_found" };
    return { kind: "ok", title: await titleFor(db, result.occurrence), status: "rest", idempotent: result.idempotent };
  }

  if (occ.entityType !== "workout") return { kind: "not_found" };
  if (occ.status === "rest") return { kind: "ok", title: await titleFor(db, occ), status: "rest", idempotent: true };
  if (TERMINAL.has(occ.status)) return { kind: "ok", title: await titleFor(db, occ), status: occ.status, idempotent: true };

  const ts = nowIso(), historyId = generateId(), raw = getD1();
  await raw.batch([
    raw
      .prepare(
        `INSERT INTO status_history (id,occurrence_id,old_status,new_status,changed_by_user_id,source,comment,created_at)
         SELECT ?,id,status,?,?,?,?,? FROM activity_occurrences WHERE id=? AND user_id=? AND entity_type='workout' AND status=?`,
      )
      .bind(historyId, "rest", userId, "telegram_rest", null, ts, occurrenceId, userId, occ.status),
    raw
      .prepare(`UPDATE activity_occurrences SET status='rest', completed_at=?, source='telegram_rest', updated_at=? WHERE id=? AND user_id=? AND entity_type='workout' AND status=?`)
      .bind(ts, ts, occurrenceId, userId, occ.status),
    raw
      .prepare(`UPDATE reminder_jobs SET status='cancelled', error_code='occurrence_terminal' WHERE occurrence_id=? AND user_id=? AND status='pending'`)
      .bind(occurrenceId, userId),
  ]);
  return { kind: "ok", title: await titleFor(db, occ), status: "rest" };
}

export async function completeOccurrence(db: Database, userId: string, occurrenceId: string): Promise<ActionResult> {
  const result = await transitionOccurrenceCompleted(db, userId, occurrenceId, "telegram_callback");
  if (result.kind !== "ok") return result.kind === "invalid" ? result : { kind: "not_found" };
  return {
    kind: "ok",
    title: result.title ?? "Готово",
    status: "completed",
    idempotent: result.idempotent,
  };
}

export function parseActionCallback(data: string): { action: string; occurrenceId: string } | null {
  const m = /^(d|s30|s60|sc|sk|r):(.+)$/.exec(data.trim());
  if (!m || m[2]!.length < 8) return null;
  return { action: m[1]!, occurrenceId: m[2]! };
}
