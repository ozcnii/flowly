import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { reminderPolicyInputSchema } from "@/features/rhythm/model/reminder-policies";
import { policySteps, toReminderPolicy, policyValues } from "@/lib/reminders/policies";

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const db = getDb();
  const rows = await db.select().from(schema.reminderPolicies).where(and(inArray(schema.reminderPolicies.type, ["gentle", "normal", "persistent", "custom"]), or(isNull(schema.reminderPolicies.ownerId), eq(schema.reminderPolicies.ownerId, userId)))).orderBy(asc(schema.reminderPolicies.name));
  const steps = rows.length ? await db.select().from(schema.reminderPolicySteps).where(inArray(schema.reminderPolicySteps.policyId, rows.map((row) => row.id))).orderBy(asc(schema.reminderPolicySteps.stepNumber)) : [];
  const stepsByPolicy = new Map<string, typeof steps>();
  for (const step of steps) stepsByPolicy.set(step.policyId, [...(stepsByPolicy.get(step.policyId) ?? []), step]);
  return json({ policies: rows.map((row) => toReminderPolicy(row, (stepsByPolicy.get(row.id) ?? []).map((step) => ({ stepNumber: step.stepNumber, delayMinutes: step.delayMinutes, messageType: step.messageType as "primary" | "repeat" | "final" })))) });
}

export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const parsed = reminderPolicyInputSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });
  const db = getDb();
  const id = generateId();
  const now = nowIso();
  await db.batch([
    db.insert(schema.reminderPolicies).values(policyValues(id, userId, now, parsed.data)),
    ...parsed.data.steps.map((step) => db.insert(schema.reminderPolicySteps).values({ id: generateId(), policyId: id, stepNumber: step.stepNumber, delayMinutes: step.delayMinutes, messageType: step.messageType })),
  ]);
  audit("reminder_policy.create", { userId, policyId: id });
  const row = (await db.select().from(schema.reminderPolicies).where(eq(schema.reminderPolicies.id, id)).limit(1))[0];
  if (!row) return json({ error: "not_found" }, { status: 500 });
  return json({ policy: toReminderPolicy(row, await policySteps(db, id)) }, { status: 201 });
}
