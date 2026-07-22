"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson, jsonBody } from "@/lib/api/client";
import type { Habit, HabitCreateInput, HabitListItem, HabitUpdateInput } from "./habits";
import type { ScheduleRule } from "./schedule";
import type { HabitOccurrence, HabitOccurrenceStatus, HabitStatusHistory, HabitOccurrenceSummary } from "./occurrences";
import type { ReminderPolicy, ReminderPolicyInput } from "./reminder-policies";

export const habitsKeys = {
  list: () => ["habits"] as const,
  detail: (id: string) => ["habit", id] as const,
  occurrences: (id: string) => ["habit-occurrences", id] as const,
  occurrence: (id: string) => ["occurrence", id] as const,
  reminderPolicies: () => ["reminder-policies"] as const,
};

// DEC-029: client reads/mutations via react-query. Raw fetch lives only in apiJson + route handlers.
export const getHabits = (signal?: AbortSignal) => apiJson<{ habits: HabitListItem[] }>("/api/v1/habits", { signal });
export const getHabit = (id: string, signal?: AbortSignal) => apiJson<{ habit: Habit }>(`/api/v1/habits/${encodeURIComponent(id)}`, { signal });
export const createHabit = (input: HabitCreateInput, schedule?: ScheduleRule) => apiJson<{ habit: Habit }>("/api/v1/habits", { method: "POST", body: jsonBody(schedule ? { ...input, schedule } : input) });
export const updateHabit = (id: string, input: HabitUpdateInput) => apiJson<{ habit: Habit }>(`/api/v1/habits/${encodeURIComponent(id)}`, { method: "PATCH", body: jsonBody(input) });
export const archiveHabit = (id: string) => apiJson<{ archived: true }>(`/api/v1/habits/${encodeURIComponent(id)}`, { method: "DELETE" });
export const getHabitSchedule = (id: string, signal?: AbortSignal) => apiJson<{ schedule: (ScheduleRule & { id: string }) | null }>(`/api/v1/habits/${encodeURIComponent(id)}/schedule`, { signal });
export const saveHabitSchedule = (id: string, input: ScheduleRule) => apiJson<{ schedule: ScheduleRule }>(`/api/v1/habits/${encodeURIComponent(id)}/schedule`, { method: "PUT", body: jsonBody(input) });
export const deleteHabitSchedule = (id: string) => apiJson<{ deleted: true }>(`/api/v1/habits/${encodeURIComponent(id)}/schedule`, { method: "DELETE" });
export const getHabitOccurrences = (id: string, signal?: AbortSignal) => apiJson<{ occurrences: HabitOccurrence[]; summary: HabitOccurrenceSummary }>(`/api/v1/occurrences?habitId=${encodeURIComponent(id)}`, { signal });
export const getOccurrence = (id: string, signal?: AbortSignal) => apiJson<{ occurrence: HabitOccurrence; habit: Habit; history: HabitStatusHistory[] }>(`/api/v1/occurrences/${encodeURIComponent(id)}`, { signal });
export const updateOccurrenceStatus = (id: string, input: { status: HabitOccurrenceStatus; comment?: string | null }) => apiJson<{ occurrence: HabitOccurrence; idempotent: boolean }>(`/api/v1/occurrences/${encodeURIComponent(id)}/status`, { method: "PATCH", body: jsonBody(input) });
export const completeOccurrence = (id: string, comment?: string | null) => apiJson<{ occurrence: HabitOccurrence; idempotent: boolean }>(`/api/v1/occurrences/${encodeURIComponent(id)}/complete`, { method: "POST", body: jsonBody({ comment }) });
export const skipOccurrence = (id: string, comment?: string | null) => apiJson<{ occurrence: HabitOccurrence; idempotent: boolean }>(`/api/v1/occurrences/${encodeURIComponent(id)}/skip`, { method: "POST", body: jsonBody({ comment }) });
export const restOccurrence = (id: string, comment?: string | null) => apiJson<{ occurrence: HabitOccurrence; idempotent: boolean }>(`/api/v1/occurrences/${encodeURIComponent(id)}/rest`, { method: "POST", body: jsonBody({ comment }) });
export const pauseHabit = (id: string) => apiJson<{ habit: Habit; idempotent: boolean }>(`/api/v1/habits/${encodeURIComponent(id)}/pause`, { method: "POST" });
export const resumeHabit = (id: string) => apiJson<{ habit: Habit; idempotent: boolean }>(`/api/v1/habits/${encodeURIComponent(id)}/resume`, { method: "POST" });
export const getReminderPolicies = (signal?: AbortSignal) => apiJson<{ policies: ReminderPolicy[] }>("/api/v1/reminder-policies", { signal });
export const createReminderPolicy = (input: ReminderPolicyInput) => apiJson<{ policy: ReminderPolicy }>("/api/v1/reminder-policies", { method: "POST", body: jsonBody(input) });
export const updateReminderPolicy = (id: string, input: ReminderPolicyInput) => apiJson<{ policy: ReminderPolicy }>(`/api/v1/reminder-policies/${encodeURIComponent(id)}`, { method: "PATCH", body: jsonBody(input) });

export const useHabitsQuery = () =>
  useQuery({ queryKey: habitsKeys.list(), queryFn: ({ signal }) => getHabits(signal), staleTime: 30_000 });

export const useHabitQuery = (id: string, enabled = true) =>
  useQuery({ queryKey: habitsKeys.detail(id), queryFn: ({ signal }) => getHabit(id, signal), enabled: enabled && Boolean(id), staleTime: 30_000 });

export const useHabitScheduleQuery = (id: string, enabled = true) => useQuery({ queryKey: ["habit-schedule", id], queryFn: ({ signal }) => getHabitSchedule(id, signal), enabled: enabled && Boolean(id), staleTime: 30_000 });
export const useHabitOccurrencesQuery = (id: string, enabled = true) => useQuery({ queryKey: habitsKeys.occurrences(id), queryFn: ({ signal }) => getHabitOccurrences(id, signal), enabled: enabled && Boolean(id), staleTime: 15_000 });
export const useOccurrenceQuery = (id: string, enabled = true) => useQuery({ queryKey: habitsKeys.occurrence(id), queryFn: ({ signal }) => getOccurrence(id, signal), enabled: enabled && Boolean(id), staleTime: 15_000 });
export const useSaveHabitScheduleMutation = (id: string) => { const qc = useQueryClient(); return useMutation({ mutationFn: (input: ScheduleRule) => saveHabitSchedule(id, input), onSuccess: () => void qc.invalidateQueries({ queryKey: ["habit-schedule", id] }) }); };

const invalidateLists = (qc: ReturnType<typeof useQueryClient>) => {
  void qc.invalidateQueries({ queryKey: ["habits"] });
};

export const useCreateHabitMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ input, schedule }: { input: HabitCreateInput; schedule?: ScheduleRule }) => createHabit(input, schedule),
    onSuccess: () => invalidateLists(qc),
  });
};

export const useUpdateHabitMutation = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HabitUpdateInput) => updateHabit(id, input),
    onSuccess: () => {
      invalidateLists(qc);
      void qc.invalidateQueries({ queryKey: habitsKeys.detail(id) });
    },
  });
};

export const useArchiveHabitMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveHabit(id),
    onSuccess: (_, id) => { invalidateLists(qc); void qc.invalidateQueries({ queryKey: habitsKeys.detail(id) }); },
  });
};

const invalidateHabit = (qc: ReturnType<typeof useQueryClient>, id: string) => {
  invalidateLists(qc);
  void qc.invalidateQueries({ queryKey: habitsKeys.detail(id) });
  void qc.invalidateQueries({ queryKey: habitsKeys.occurrences(id) });
};

export const useUpdateOccurrenceStatusMutation = (habitId: string) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ occurrenceId, input }: { occurrenceId: string; input: { status: HabitOccurrenceStatus; comment?: string | null } }) => updateOccurrenceStatus(occurrenceId, input), onSuccess: (_, variables) => { invalidateHabit(qc, habitId); void qc.invalidateQueries({ queryKey: habitsKeys.occurrence(variables.occurrenceId) }); } });
};

export const useOccurrenceActionMutation = (habitId: string, action: "complete" | "skip" | "rest") => {
  const qc = useQueryClient();
  const mutation = action === "complete" ? completeOccurrence : action === "skip" ? skipOccurrence : restOccurrence;
  return useMutation({ mutationFn: ({ occurrenceId, comment }: { occurrenceId: string; comment?: string | null }) => mutation(occurrenceId, comment), onSuccess: (_, variables) => { invalidateHabit(qc, habitId); void qc.invalidateQueries({ queryKey: habitsKeys.occurrence(variables.occurrenceId) }); } });
};

export const useHabitLifecycleMutation = (id: string, action: "pause" | "resume") => {
  const qc = useQueryClient();
  const mutation = action === "pause" ? pauseHabit : resumeHabit;
  return useMutation({ mutationFn: () => mutation(id), onSuccess: () => invalidateHabit(qc, id) });
};

export const useReminderPoliciesQuery = () => useQuery({ queryKey: habitsKeys.reminderPolicies(), queryFn: ({ signal }) => getReminderPolicies(signal), staleTime: 30_000 });
export const useCreateReminderPolicyMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: createReminderPolicy, onSuccess: () => void qc.invalidateQueries({ queryKey: habitsKeys.reminderPolicies() }) }); };
export const useUpdateReminderPolicyMutation = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: ReminderPolicyInput }) => updateReminderPolicy(id, input), onSuccess: () => void qc.invalidateQueries({ queryKey: habitsKeys.reminderPolicies() }) }); };
