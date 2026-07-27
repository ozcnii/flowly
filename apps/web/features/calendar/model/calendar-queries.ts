"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson, jsonBody } from "@/lib/api/client";
import type { CalendarDayCell, CalendarItem } from "@/lib/calendar/query";

export type MonthResponse = {
  range: { start: string; end: string; year: number; month: number };
  timezone: string;
  filter: string;
  days: CalendarDayCell[];
  summary: { total: number; completed: number };
};

export type WeekResponse = {
  range: { start: string; end: string };
  timezone: string;
  filter: string;
  days: CalendarDayCell[];
  summary: { total: number; completed: number };
};

export type DayResponse = {
  date: string;
  timezone: string;
  filter: string;
  items: CalendarItem[];
  summary: { total: number; completed: number; pending: number };
};

export type StreaksResponse = {
  asOf: string;
  habitsDaily: { current: number; best: number; currentStart: string | null; bestEnd: string | null };
  yoga: { current: number; best: number; currentStart: string | null; bestEnd: string | null };
  habitsWeeklyGoal: { current: number; best: number; currentStart: string | null; bestEnd: string | null };
};

export type ReportResponse = {
  type: "week" | "month";
  timezone: string;
  report: {
    periodStart: string;
    periodEnd: string;
    partial: boolean;
    plannedWorkouts: number;
    completedWorkouts: number;
    partialWorkouts: number;
    rest: number;
    skipped: number;
    noResponse: number;
    totalDurationSeconds: number;
    habitSlotsPlanned: number;
    habitSlotsCompleted: number;
    habitCompletionPercent: number;
    habitsById: Record<string, { title: string; completed: number; planned: number }>;
    previous?: { completedWorkouts: number; habitCompletionPercent: number; totalDurationSeconds: number };
  };
  streaks: { current: number; best: number };
  summaryText: string;
  heatMap?: Record<string, number>;
};

export type CalendarFilter = "all" | "yoga" | "habits" | "completed" | "skipped" | "no_response";

export const useCalendarMonth = (date: string, filter: CalendarFilter) =>
  useQuery({
    queryKey: ["calendar", "month", date, filter],
    queryFn: () => apiJson<MonthResponse>(`/api/v1/calendar/month?date=${encodeURIComponent(date)}&filter=${filter}`),
  });

export const useCalendarWeek = (date: string, filter: CalendarFilter) =>
  useQuery({
    queryKey: ["calendar", "week", date, filter],
    queryFn: () => apiJson<WeekResponse>(`/api/v1/calendar/week?date=${encodeURIComponent(date)}&filter=${filter}`),
  });

export const useCalendarDay = (date: string, filter: CalendarFilter) =>
  useQuery({
    queryKey: ["calendar", "day", date, filter],
    queryFn: () => apiJson<DayResponse>(`/api/v1/calendar/day?date=${encodeURIComponent(date)}&filter=${filter}`),
  });

export const useStreaks = () =>
  useQuery({
    queryKey: ["calendar", "streaks"],
    queryFn: () => apiJson<StreaksResponse>("/api/v1/calendar/streaks"),
  });

export const useWeekReport = (date: string) =>
  useQuery({
    queryKey: ["reports", "week", date],
    queryFn: () => apiJson<ReportResponse>(`/api/v1/reports/week?date=${encodeURIComponent(date)}`),
  });

export const useMonthReport = (date: string) =>
  useQuery({
    queryKey: ["reports", "month", date],
    queryFn: () => apiJson<ReportResponse>(`/api/v1/reports/month?date=${encodeURIComponent(date)}`),
  });

export const useManualWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      date: string;
      time: string;
      durationMinutes: number;
      status: "completed" | "partial" | "skipped" | "rest";
      comment?: string | null;
    }) => apiJson("/api/v1/calendar/manual-workout", { method: "POST", body: jsonBody(body) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["calendar"] });
      void qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const statusLabel: Record<string, string> = {
  completed: "Выполнено",
  partial: "Частично",
  partially_completed: "Частично",
  rest: "Отдых",
  skipped: "Пропуск",
  no_response: "Без ответа",
  scheduled: "План",
  due: "Сейчас",
  notified: "Напомнили",
  snoozed: "Отложено",
};
