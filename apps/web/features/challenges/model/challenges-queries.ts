"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson, jsonBody } from "@/lib/api/client";
import type { GoalType } from "@/lib/challenges/types";

export type Challenge = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  goalType: GoalType;
  goalValue: number;
  startsOn: string;
  endsOn: string;
  createdAt: string;
};

export type ChallengeListItem = {
  challenge: Challenge;
  membership: { status: string; joinedAt: string };
};

export type ChallengeDetail = {
  challenge: Challenge;
  membership: { status: string; joinedAt: string };
  members: Array<{ userId: string; status: string; joinedAt: string; peer: { id: string; firstName: string; username: string | null } | null }>;
  progress: Array<{ userId: string; value: number; status: string; peer: { id: string; firstName: string; username: string | null } | null }>;
};

export const challengesKey = ["challenges"] as const;
export const challengeKey = (id: string) => ["challenge", id] as const;

export const getChallenges = (signal?: AbortSignal) =>
  apiJson<{ items: ChallengeListItem[] }>("/api/v1/challenges", { signal });
export const getChallenge = (id: string, signal?: AbortSignal) =>
  apiJson<ChallengeDetail>(`/api/v1/challenges/${encodeURIComponent(id)}`, { signal });
export const createChallenge = (input: {
  title: string;
  description?: string;
  goalType: GoalType;
  goalValue: number;
  startsOn: string;
  endsOn: string;
  memberIds?: string[];
}) => apiJson<{ id: string }>("/api/v1/challenges", { method: "POST", body: jsonBody(input) });
export const joinChallenge = (id: string) =>
  apiJson<{ ok: true }>(`/api/v1/challenges/${encodeURIComponent(id)}/join`, { method: "POST", body: "{}" });
export const leaveChallenge = (id: string) =>
  apiJson<{ ok: true }>(`/api/v1/challenges/${encodeURIComponent(id)}/leave`, { method: "POST", body: "{}" });
export const reactChallenge = (id: string, input: { recipientId: string; emoji: string }) =>
  apiJson<{ ok: true; action: string }>(`/api/v1/challenges/${encodeURIComponent(id)}/reactions`, {
    method: "POST",
    body: jsonBody(input),
  });

export const useChallengesQuery = () =>
  useQuery({ queryKey: challengesKey, queryFn: ({ signal }) => getChallenges(signal), staleTime: 15_000 });

export const useChallengeQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: challengeKey(id),
    queryFn: ({ signal }) => getChallenge(id, signal),
    enabled: enabled && Boolean(id),
    staleTime: 10_000,
  });

export const useCreateChallengeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createChallenge,
    onSuccess: () => void qc.invalidateQueries({ queryKey: challengesKey }),
  });
};

export const useJoinChallengeMutation = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => joinChallenge(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: challengesKey });
      void qc.invalidateQueries({ queryKey: challengeKey(id) });
    },
  });
};

export const useLeaveChallengeMutation = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => leaveChallenge(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: challengesKey });
      void qc.invalidateQueries({ queryKey: challengeKey(id) });
    },
  });
};

export const useReactChallengeMutation = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { recipientId: string; emoji: string }) => reactChallenge(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: challengeKey(id) }),
  });
};
