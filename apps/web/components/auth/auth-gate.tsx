"use client";

import { Button, Card, Preloader } from "konsta/react";
import { useCallback, useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@flowly/ui";
import { useMeQuery, useTelegramAuthMutation, type TelegramAuthInput } from "@/features/profile/model/me-queries";

function telegramInitData(): TelegramAuthInput {
  const fromSdk = window.Telegram?.WebApp?.initData?.trim();
  if (fromSdk) return { initData: fromSdk, source: "sdk" };
  return launchParam(location.hash.replace(/^#/, ""), "hash") ?? launchParam(location.search.replace(/^\?/, ""), "search") ?? { initData: "", source: "missing" };
}

function launchParam(source: string, origin: "hash" | "search"): TelegramAuthInput | null {
  const query = source.includes("?") ? source.slice(source.indexOf("?") + 1) : source;
  const raw = query.split("&").find((part) => part.startsWith("tgWebAppData="))?.slice("tgWebAppData=".length);
  const initData = new URLSearchParams(query).get("tgWebAppData")?.trim();
  return raw && initData ? { initData, source: origin, launchRaw: raw } : null;
}

/**
 * S-MA-001 — Shell/auth bootstrap (F01, DEC-022).
 *
 * On open: verifies the session (GET /me); if absent, bootstraps one from the
 * Telegram `initData` (POST /auth/telegram). While checking/authenticating shows
 * a full-screen loading state; on auth failure shows a full-screen retry state.
 * Renders the app only after a session is established.
 *
 * Dev-only forced preview (DEC-024): ?auth=loading | error | ready.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const forced = process.env.NODE_ENV !== "production" ? searchParams.get("auth") : null;
  const preview = forced === "loading" || forced === "error" || forced === "ready";
  const me = useMeQuery(!preview);
  const auth = useTelegramAuthMutation();
  const { mutate, reset, status, isError: authError, isSuccess: authSuccess } = auth;

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    webApp?.ready?.();
    webApp?.expand?.();
    const canFullscreen = webApp?.isVersionAtLeast?.("8.0") ?? Number.parseFloat(webApp?.version ?? "0") >= 8;
    if (webApp && canFullscreen && !webApp.isFullscreen) try { webApp.requestFullscreen?.(); } catch { /* Unsupported clients stay expanded. */ }
  }, []);

  useEffect(() => {
    if (preview || !me.isError || status !== "idle") return;
    mutate(telegramInitData());
  }, [me.isError, mutate, preview, status]);

  const retry = useCallback(() => {
    reset();
    void me.refetch();
  }, [me, reset]);

  const ready = forced === "ready" || me.isSuccess || authSuccess;
  const error = forced === "error" || authError;

  if (ready) return <>{children}</>;
  if (!error) return <div className="safe-shell grid min-h-dvh w-full place-items-center bg-canvas" role="status" aria-live="polite"><Preloader /><span className="sr-only">Входим в Flowly</span></div>;

  return <div className="safe-shell mx-auto grid min-h-dvh w-full max-w-[75rem] place-items-center bg-canvas px-5 py-10">
    <Card contentWrap={false} raised className="mx-auto grid w-[calc(100%-2rem)] max-w-[25rem] gap-5 rounded-[1.75rem] p-5 shadow-[0_1.5rem_4rem_rgba(0,0,0,.16)]" aria-live="polite">
      <h1 className="m-0 text-3xl font-semibold leading-none tracking-tight">Не удалось войти</h1>
      <div className="grid gap-4">
        <div className="flex gap-3 rounded-2xl border border-danger/25 bg-danger/10 p-4 text-text">
          <Icon name="triangle-alert" className="mt-1 size-5 shrink-0 text-danger" />
          <p className="m-0 text-sm leading-6 text-text-muted">Откройте Flowly из Telegram или повторите вход. Личные данные не показываем, пока вход не подтверждён.</p>
        </div>
        <Button large rounded onClick={retry}>Повторить вход</Button>
      </div>
    </Card>
  </div>;
}
