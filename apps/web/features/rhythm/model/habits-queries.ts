"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson, jsonBody } from "@/lib/api/client";
import type { Habit, HabitCreateInput, HabitListItem, HabitUpdateInput } from "./habits";

export const habitsKeys = {
  list: () => ["habits"] as const,
  detail: (id: string) => ["habit", id] as const,
};

// DEC-029: client reads/mutations via react-query. Raw fetch lives only in apiJson + route handlers.
export const getHabits = (signal?: AbortSignal) => apiJson<{ habits: HabitListItem[] }>("/api/v1/habits", { signal });
export const getHabit = (id: string, signal?: AbortSignal) => apiJson<{ habit: Habit }>(`/api/v1/habits/${encodeURIComponent(id)}`, { signal });
export const createHabit = (input: HabitCreateInput) => apiJson<{ habit: Habit }>("/api/v1/habits", { method: "POST", body: jsonBody(input) });
export const updateHabit = (id: string, input: HabitUpdateInput) => apiJson<{ habit: Habit }>(`/api/v1/habits/${encodeURIComponent(id)}`, { method: "PATCH", body: jsonBody(input) });
export const archiveHabit = (id: string) => apiJson<{ archived: true }>(`/api/v1/habits/${encodeURIComponent(id)}`, { method: "DELETE" });

export const useHabitsQuery = () =>
  useQuery({ queryKey: habitsKeys.list(), queryFn: ({ signal }) => getHabits(signal), staleTime: 30_000 });

export const useHabitQuery = (id: string, enabled = true) =>
  useQuery({ queryKey: habitsKeys.detail(id), queryFn: ({ signal }) => getHabit(id, signal), enabled: enabled && Boolean(id), staleTime: 30_000 });

const invalidateLists = (qc: ReturnType<typeof useQueryClient>) => {
  void qc.invalidateQueries({ queryKey: ["habits"] });
};

export const useCreateHabitMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HabitCreateInput) => createHabit(input),
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
    onSuccess: () => invalidateLists(qc),
  });
};
