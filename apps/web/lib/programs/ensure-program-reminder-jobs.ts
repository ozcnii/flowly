import { and, eq, inArray } from "drizzle-orm";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { localDateTimeToUtcIso } from "./local-to-utc";

/** Fixed system policy seeded in migration 0014. Delivery (Telegram) is stage 5 / DEC-001. */
export const PROGRAM_DEFAULT_POLICY_ID = "rp-program-default";
export const PROGRAM_DEFAULT_REMINDER_LOCAL_TIME = "09:00";

const TERMINAL = new Set(["completed", "partial", "not_completed", "rest", "skipped", "no_response", "cancelled", "expired"]);

/**
 * Create pending reminder_jobs for program workout occurrences still open.
 * Planned rest days get no jobs. Idempotent via idempotency_key.
 * Does NOT send Telegram messages (DEC-001 → E5).
 */
export async function ensureProgramReminderJobs(
  db: Database,
  input: {
    userId: string;
    enrollmentId: string;
    timezone: string;
    policyId?: string | null;
    reminderLocalTime?: string | null;
  },
) {
  const policyId = input.policyId || PROGRAM_DEFAULT_POLICY_ID;
  const reminderLocalTime = input.reminderLocalTime || PROGRAM_DEFAULT_REMINDER_LOCAL_TIME;
  const policy = (await db.select().from(schema.reminderPolicies).where(eq(schema.reminderPolicies.id, policyId)).limit(1))[0];
  if (!policy) return { created: 0, skippedTerminal: 0, totalPending: 0, policyId, delivery: "deferred_to_stage_5" as const };

  const steps = await db.select().from(schema.reminderPolicySteps).where(eq(schema.reminderPolicySteps.policyId, policyId));
  if (!steps.length) return { created: 0, skippedTerminal: 0, totalPending: 0, policyId, delivery: "deferred_to_stage_5" as const };
  const ordered = [...steps].sort((a, b) => a.stepNumber - b.stepNumber).slice(0, policy.maxMessages);

  const occurrences = await db.select({
    id: schema.activityOccurrences.id,
    status: schema.activityOccurrences.status,
    entityType: schema.activityOccurrences.entityType,
    scheduledLocalDate: schema.activityOccurrences.scheduledLocalDate,
  }).from(schema.activityOccurrences).where(and(
    eq(schema.activityOccurrences.userId, input.userId),
    eq(schema.activityOccurrences.parentEntityId, input.enrollmentId),
    eq(schema.activityOccurrences.entityType, "workout"),
  ));

  const existing = await db.select({
    idempotencyKey: schema.reminderJobs.idempotencyKey,
  }).from(schema.reminderJobs).where(and(
    eq(schema.reminderJobs.userId, input.userId),
    inArray(schema.reminderJobs.occurrenceId, occurrences.length ? occurrences.map((o) => o.id) : ["__none__"]),
  ));
  const existingKeys = new Set(existing.map((r) => r.idempotencyKey));

  const ts = nowIso();
  let created = 0;
  let skippedTerminal = 0;

  for (const occ of occurrences) {
    if (TERMINAL.has(occ.status)) {
      skippedTerminal += 1;
      continue;
    }
    const baseDue = localDateTimeToUtcIso(occ.scheduledLocalDate, reminderLocalTime, input.timezone);
    const baseMs = Date.parse(baseDue);
    for (const step of ordered) {
      if (step.delayMinutes === null) continue; // Habit final-at-local-time policies are resolved by T07.
      const dueAtUtc = new Date(baseMs + step.delayMinutes * 60_000).toISOString();
      const idempotencyKey = `${occ.id}:${step.stepNumber}:${dueAtUtc}`;
      if (existingKeys.has(idempotencyKey)) continue;
      await db.insert(schema.reminderJobs).values({
        id: generateId(),
        occurrenceId: occ.id,
        userId: input.userId,
        policyId,
        stepNumber: step.stepNumber,
        dueAtUtc,
        status: "pending",
        attemptCount: 0,
        lockedAt: null,
        sentAt: null,
        telegramMessageId: null,
        idempotencyKey,
        errorCode: null,
        createdAt: ts,
      });
      existingKeys.add(idempotencyKey);
      created += 1;
    }
  }

  const pending = await db.select({ id: schema.reminderJobs.id }).from(schema.reminderJobs).where(and(
    eq(schema.reminderJobs.userId, input.userId),
    eq(schema.reminderJobs.status, "pending"),
    inArray(schema.reminderJobs.occurrenceId, occurrences.length ? occurrences.map((o) => o.id) : ["__none__"]),
  ));

  return {
    created,
    skippedTerminal,
    totalPending: pending.length,
    policyId,
    reminderLocalTime,
    /** Explicit: no Telegram delivery in stage 3 (DEC-001). */
    delivery: "deferred_to_stage_5" as const,
  };
}

/** Cancel undelivered jobs when occurrence reaches terminal status (skip/rest/finish). */
export async function cancelPendingJobsForOccurrence(db: Database, occurrenceId: string) {
  const ts = nowIso();
  // drizzle update doesn't return changes count easily; raw-friendly:
  await db.update(schema.reminderJobs).set({
    status: "cancelled",
    errorCode: "occurrence_terminal",
  }).where(and(
    eq(schema.reminderJobs.occurrenceId, occurrenceId),
    eq(schema.reminderJobs.status, "pending"),
  ));
  return { cancelledAt: ts, occurrenceId };
}
