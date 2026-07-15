"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson, jsonBody } from "@/lib/api/client";

export type PublicUser = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  timezone: string;
  weekStartsOn: number;
  locale: string;
  onboardingCompleted: boolean;
};
export type MePatch = Partial<Pick<PublicUser, "firstName" | "timezone" | "locale" | "weekStartsOn">>;
export type MeResponse = { user: PublicUser };
export type TelegramAuthResponse = { ok: true; userId: string; dev?: boolean };
export type TelegramAuthInput = { initData: string; source: "sdk" | "hash" | "search" | "missing"; launchRaw?: string };

export const meKey = ["me"] as const;

const devUserHeader = (initData: string) => {
  if (process.env.NODE_ENV === "production" || initData.trim()) return undefined;
  return encodeURIComponent(JSON.stringify({ id: 777001, first_name: "Анна", last_name: "", username: "anna_flowly", language_code: "ru" }));
};

const fingerprint = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))).slice(0, 8), (byte) => byte.toString(16).padStart(2, "0")).join("");

export const getMe = (signal?: AbortSignal) => apiJson<MeResponse>("/api/v1/me", { cache: "no-store", signal });
export const postTelegramAuth = async ({ initData, source, launchRaw }: TelegramAuthInput) => {
  const devUser = devUserHeader(initData);
  const webApp = globalThis.window?.Telegram?.WebApp;
  const headers: Record<string, string> = {
    "x-flowly-tg-source": source,
    "x-flowly-tg-init-fp": initData ? await fingerprint(initData) : "missing",
    "x-flowly-tg-launch-fp": launchRaw ? await fingerprint(launchRaw) : "missing",
    "x-flowly-tg-webapp": webApp ? "1" : "0",
    "x-flowly-tg-platform": webApp?.platform ?? "unknown",
    "x-flowly-tg-version": webApp?.version ?? "unknown",
  };
  if (devUser) headers["x-flowly-dev-user"] = devUser;
  return apiJson<TelegramAuthResponse>("/api/v1/auth/telegram", { method: "POST", headers, body: jsonBody({ initData }) });
};
export const patchMe = (patch: MePatch) => apiJson<MeResponse>("/api/v1/me", { method: "PATCH", body: jsonBody(patch) });
export const completeOnboarding = () => apiJson<MeResponse>("/api/v1/onboarding/complete", { method: "POST" });

export const useMeQuery = (enabled = true) => useQuery({ queryKey: meKey, queryFn: ({ signal }) => getMe(signal), enabled, staleTime: 30_000, gcTime: 5 * 60_000, retry: false });

export function useTelegramAuthMutation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: postTelegramAuth, onSuccess: () => qc.invalidateQueries({ queryKey: meKey }) });
}

export function usePatchMeMutation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: patchMe, onSuccess: (data) => qc.setQueryData(meKey, data) });
}

export function useCompleteOnboardingMutation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: completeOnboarding, onSuccess: (data) => qc.setQueryData(meKey, data) });
}
