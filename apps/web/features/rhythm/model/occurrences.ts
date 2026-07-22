import { z } from "zod";

export const HABIT_OCCURRENCE_STATUSES = ["completed", "partial", "rest", "skipped", "no_response"] as const;
export type HabitOccurrenceStatus = (typeof HABIT_OCCURRENCE_STATUSES)[number];

export const habitOccurrenceStatusSchema = z.enum(HABIT_OCCURRENCE_STATUSES);
export const occurrenceStatusMutationSchema = z.object({
  status: habitOccurrenceStatusSchema,
  comment: z.string().trim().max(500).optional().nullable(),
});

export interface HabitOccurrence {
  id: string;
  userId: string;
  entityType: "habit";
  entityId: string;
  parentEntityId: string | null;
  scheduledLocalDate: string;
  scheduledLocalTime: string;
  timezone: string;
  scheduledAtUtc: string;
  status: string;
  completedAt: string | null;
  durationSeconds: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitStatusHistory {
  id: string;
  occurrenceId: string;
  oldStatus: string | null;
  newStatus: string;
  changedByUserId: string;
  source: string;
  comment: string | null;
  createdAt: string;
}

export interface HabitOccurrenceSummary {
  total: number;
  completed: number;
  partial: number;
  pending: number;
  rest: number;
  skipped: number;
  noResponse: number;
}

export const OCCURRENCE_STATUS_LABEL: Record<HabitOccurrenceStatus, string> = {
  completed: "Выполнено",
  partial: "Частично",
  rest: "Отдых",
  skipped: "Пропущено",
  no_response: "Нет ответа",
};

export const OCCURRENCE_STATUS_ICON: Record<HabitOccurrenceStatus, string> = {
  completed: "circle-check",
  partial: "circle",
  rest: "pause",
  skipped: "x",
  no_response: "clock-3",
};

export const isTerminalHabitOccurrence = (status: string) =>
  HABIT_OCCURRENCE_STATUSES.includes(status as HabitOccurrenceStatus);
