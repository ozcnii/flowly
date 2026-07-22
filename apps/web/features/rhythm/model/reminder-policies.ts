import { z } from "zod";

export const REMINDER_POLICY_TYPES = ["gentle", "normal", "persistent", "custom"] as const;
export type ReminderPolicyType = (typeof REMINDER_POLICY_TYPES)[number];
export const REMINDER_MESSAGE_TYPES = ["primary", "repeat", "final"] as const;
export type ReminderMessageType = (typeof REMINDER_MESSAGE_TYPES)[number];
export const QUIET_HOURS_BEHAVIORS = ["defer", "skip"] as const;
export type QuietHoursBehavior = (typeof QUIET_HOURS_BEHAVIORS)[number];

const HH_MM = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export const reminderPolicyStepSchema = z.object({
  stepNumber: z.number().int().min(1).max(10),
  delayMinutes: z.number().int().min(0).nullable(),
  messageType: z.enum(REMINDER_MESSAGE_TYPES),
});

export const reminderPolicyInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.literal("custom"),
  maxMessages: z.number().int().min(1).max(10),
  lastMessageLocalTime: z.string().regex(HH_MM).nullable(),
  quietHoursBehavior: z.enum(QUIET_HOURS_BEHAVIORS),
  allowCustomSnooze: z.boolean(),
  steps: z.array(reminderPolicyStepSchema).min(1).max(10),
}).superRefine((policy, ctx) => {
  const ordered = [...policy.steps].sort((a, b) => a.stepNumber - b.stepNumber);
  if (ordered.some((step, index) => step.stepNumber !== index + 1)) ctx.addIssue({ code: "custom", path: ["steps"], message: "Шаги должны идти последовательно." });
  if (ordered[0]?.messageType !== "primary" || ordered[0]?.delayMinutes !== 0) ctx.addIssue({ code: "custom", path: ["steps", 0], message: "Первый шаг должен быть основным сообщением сразу." });
  if (ordered.length > policy.maxMessages) ctx.addIssue({ code: "custom", path: ["maxMessages"], message: "Лимит не может быть меньше количества шагов." });
  const timed = ordered.filter((step) => step.delayMinutes !== null) as Array<{ delayMinutes: number; messageType: ReminderMessageType }>;
  for (let i = 1; i < timed.length; i += 1) { const previous = timed[i - 1]; const current = timed[i]; if (previous && current && current.delayMinutes - previous.delayMinutes < 10) ctx.addIssue({ code: "custom", path: ["steps"], message: "Между автоматическими сообщениями должно быть минимум 10 минут." }); }
  const final = ordered.find((step) => step.messageType === "final");
  if (final && final.delayMinutes === null && !policy.lastMessageLocalTime) ctx.addIssue({ code: "custom", path: ["lastMessageLocalTime"], message: "Укажите время финального сообщения." });
  if (final && ordered[ordered.length - 1] !== final) ctx.addIssue({ code: "custom", path: ["steps"], message: "Финальное сообщение должно быть последним шагом." });
});
export type ReminderPolicyInput = z.infer<typeof reminderPolicyInputSchema>;

export interface ReminderPolicyStep {
  stepNumber: number;
  delayMinutes: number | null;
  messageType: ReminderMessageType;
}

export interface ReminderPolicy {
  id: string;
  ownerId: string | null;
  name: string;
  type: ReminderPolicyType;
  maxMessages: number;
  lastMessageLocalTime: string | null;
  quietHoursBehavior: QuietHoursBehavior | null;
  allowCustomSnooze: boolean;
  createdAt: string;
  isSystem: boolean;
  steps: ReminderPolicyStep[];
}

export const DEFAULT_HABIT_REMINDER_POLICY_ID = "rp-habit-gentle";
export const HABIT_REMINDER_PRESET_IDS = {
  gentle: DEFAULT_HABIT_REMINDER_POLICY_ID,
  normal: "rp-habit-normal",
  persistent: "rp-habit-persistent",
} as const;

export const policyStepLabel = (step: ReminderPolicyStep) => step.messageType === "primary" ? "Основное" : step.messageType === "final" ? "Финальное" : "Повтор";
export const policyStepDelayLabel = (step: ReminderPolicyStep) => step.delayMinutes === null ? "в указанное время" : step.delayMinutes === 0 ? "сразу" : `через ${step.delayMinutes} мин.`;
