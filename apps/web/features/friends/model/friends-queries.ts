"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";

export type FriendPeer = { id: string; firstName: string; username: string | null };
export type FriendRow = {
  id: string;
  status: "pending" | "accepted" | "rejected" | "removed" | "blocked";
  role: "requester" | "addressee";
  createdAt: string;
  acceptedAt: string | null;
  inviteCode: string | null;
  peer: FriendPeer | null;
};
export type FriendsResponse = { friends: FriendRow[] };
export type CreateInviteResponse = {
  code: string;
  expiresAt: string;
  deepLinkPayload: string;
  friendshipId: string;
  botDeepLink: string;
};

export const friendsKey = ["friends"] as const;

export const getFriends = (signal?: AbortSignal) => apiJson<FriendsResponse>("/api/v1/friends", { signal });
export const createInvite = () =>
  apiJson<CreateInviteResponse>("/api/v1/friends/invites", { method: "POST", body: "{}" });
export const acceptInvite = (code: string) =>
  apiJson<{ ok: true; friendshipId: string; idempotent: boolean }>(
    `/api/v1/friends/invites/${encodeURIComponent(code)}/accept`,
    { method: "POST", body: "{}" },
  );
export const rejectInvite = (code: string) =>
  apiJson<{ ok: true }>(`/api/v1/friends/invites/${encodeURIComponent(code)}/reject`, {
    method: "POST",
    body: "{}",
  });
export const removeFriend = (id: string) =>
  apiJson<{ ok: true; idempotent: boolean }>(`/api/v1/friends/${encodeURIComponent(id)}`, { method: "DELETE" });

export const useFriendsQuery = (enabled = true) =>
  useQuery({
    queryKey: friendsKey,
    queryFn: ({ signal }) => getFriends(signal),
    enabled,
    staleTime: 15_000,
    refetchOnMount: "always",
  });

export const useCreateInviteMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInvite,
    onSuccess: () => void qc.invalidateQueries({ queryKey: friendsKey }),
  });
};

export const useAcceptInviteMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptInvite,
    onSuccess: () => void qc.invalidateQueries({ queryKey: friendsKey }),
  });
};

export const useRejectInviteMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectInvite,
    onSuccess: () => void qc.invalidateQueries({ queryKey: friendsKey }),
  });
};

export const useRemoveFriendMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeFriend,
    onSuccess: () => void qc.invalidateQueries({ queryKey: friendsKey }),
  });
};
