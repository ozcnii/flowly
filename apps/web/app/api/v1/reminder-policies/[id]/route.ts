import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId } from "@flowly/core";
import { schema } from "@flowly/database";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { reminderPolicyInputSchema } from "@/features/rhythm/model/reminder-policies";
import { policySteps, toReminderPolicy, policyValues, visiblePolicy } from "@/lib/reminders/policies";

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId(request);
  if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const row = await visiblePolicy(db, id, userId);
  if (!row) return json({ error: "not_found" }, { status: 404 });
  return json({ policy: toReminderPolicy(row, await policySteps(db, id)) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = reminderPolicyInputSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });
  const db = getDb();
  const existing = await visiblePolicy(db, id, userId);
  if (!existing) return json({ error: "not_found" }, { status: 404 });
  if (existing.ownerId !== userId) return json({ error: "system_policy_read_only" }, { status: 409 });
  await db.batch([
    db.update(schema.reminderPolicies).set(policyValues(id, userId, existing.createdAt, parsed.data)).where(and(eq(schema.reminderPolicies.id, id), eq(schema.reminderPolicies.ownerId, userId))),
    db.delete(schema.reminderPolicySteps).where(eq(schema.reminderPolicySteps.policyId, id)),
    ...parsed.data.steps.map((step) => db.insert(schema.reminderPolicySteps).values({ id: generateId(), policyId: id, stepNumber: step.stepNumber, delayMinutes: step.delayMinutes, messageType: step.messageType })),
  ]);
  audit("reminder_policy.update", { userId, policyId: id });
  const row = await visiblePolicy(db, id, userId);
  return json({ policy: toReminderPolicy(row!, await policySteps(db, id)) });
}
