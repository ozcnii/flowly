"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson, jsonBody } from "@/lib/api/client";
import type { ActiveSessionResponse, CheckpointInput, FinishInput, SessionResponse, StartSessionResponse } from "./workout-session";

export const activeSessionKey = ["workout-session", "active"] as const;
export const workoutSessionKey = (id: string) => ["workout-session", id] as const;

export const getActiveSession = (signal?: AbortSignal) => apiJson<ActiveSessionResponse>("/api/v1/workout-sessions/active", { cache: "no-store", signal });
export const getWorkoutSession = (id: string, signal?: AbortSignal) => apiJson<SessionResponse>(`/api/v1/workout-sessions/${encodeURIComponent(id)}`, { cache: "no-store", signal });
export const startWorkoutSession = (workoutId: string) => apiJson<StartSessionResponse>("/api/v1/workout-sessions", { method: "POST", body: jsonBody({ workoutId }) });
export const checkpointWorkoutSession = (id: string, input: CheckpointInput, keepalive = false) => apiJson<SessionResponse>(`/api/v1/workout-sessions/${encodeURIComponent(id)}/checkpoint`, { method: "PATCH", body: jsonBody(input), keepalive });
export const finishWorkoutSession = (id: string, input: FinishInput) => apiJson<SessionResponse>(`/api/v1/workout-sessions/${encodeURIComponent(id)}/finish`, { method: "POST", body: jsonBody(input) });

export const useActiveSessionQuery = (enabled = true) => useQuery({ queryKey: activeSessionKey, queryFn: ({ signal }) => getActiveSession(signal), enabled, staleTime: 10_000, retry: false });
export const useWorkoutSessionQuery = (id: string) => useQuery({ queryKey: workoutSessionKey(id), queryFn: ({ signal }) => getWorkoutSession(id, signal), enabled: Boolean(id), staleTime: 0, retry: false });

export function useStartWorkoutSessionMutation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: startWorkoutSession, onSuccess: (data) => { qc.setQueryData(workoutSessionKey(data.session.id), data); qc.setQueryData(activeSessionKey, data); } });
}

export function useCheckpointWorkoutSessionMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ input, keepalive = false }: { input: CheckpointInput; keepalive?: boolean }) => checkpointWorkoutSession(id, input, keepalive), onSuccess: (data) => { qc.setQueryData(workoutSessionKey(id), data); qc.setQueryData(activeSessionKey, data); } });
}

export function useFinishWorkoutSessionMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (input: FinishInput) => finishWorkoutSession(id, input), onSuccess: (data) => { qc.setQueryData(workoutSessionKey(id), data); qc.setQueryData(activeSessionKey, { session: null } satisfies ActiveSessionResponse); } });
}
