import { and, eq, inArray, isNull, or } from "drizzle-orm";
import type { getDb } from "@/lib/cloudflare";
import { schema } from "@flowly/database";
import type { ReminderPolicy, ReminderPolicyInput, ReminderPolicyStep } from "@/features/rhythm/model/reminder-policies";

export const visiblePolicy = async (db: ReturnType<typeof getDb>, id: string, userId: string) => {
  const rows = await db.select().from(schema.reminderPolicies).where(and(
    eq(schema.reminderPolicies.id, id),
    inArray(schema.reminderPolicies.type, ["gentle", "normal", "persistent", "custom"]),
    or(isNull(schema.reminderPolicies.ownerId), eq(schema.reminderPolicies.ownerId, userId)),
  )).limit(1);
  return rows[0];
};
export const policySteps = async (db: ReturnType<typeof getDb>, policyId: string): Promise<ReminderPolicyStep[]> => (await db.select({ stepNumber: schema.reminderPolicySteps.stepNumber, delayMinutes: schema.reminderPolicySteps.delayMinutes, messageType: schema.reminderPolicySteps.messageType }).from(schema.reminderPolicySteps).where(eq(schema.reminderPolicySteps.policyId, policyId)).orderBy(schema.reminderPolicySteps.stepNumber)) as ReminderPolicyStep[];

export const toReminderPolicy = (row: typeof schema.reminderPolicies.$inferSelect, steps: ReminderPolicyStep[]): ReminderPolicy => ({
  id: row.id,
  ownerId: row.ownerId,
  name: row.name,
  type: row.type as ReminderPolicy["type"],
  maxMessages: row.maxMessages,
  lastMessageLocalTime: row.lastMessageLocalTime,
  quietHoursBehavior: row.quietHoursBehavior as ReminderPolicy["quietHoursBehavior"],
  allowCustomSnooze: Boolean(row.allowCustomSnooze),
  createdAt: row.createdAt,
  isSystem: row.ownerId === null,
  steps,
});

export const policyValues = (id: string, ownerId: string | null, now: string, input: ReminderPolicyInput) => ({
  id,
  ownerId,
  name: input.name.trim(),
  type: "custom" as const,
  maxMessages: input.maxMessages,
  lastMessageLocalTime: input.lastMessageLocalTime,
  quietHoursBehavior: input.quietHoursBehavior,
  allowCustomSnooze: input.allowCustomSnooze,
  createdAt: now,
});
