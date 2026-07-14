"use client";

import Image from "next/image";
import { useCallback, useEffect, type ReactNode } from "react";
import { Icon, InlineError, Skeleton } from "@flowly/ui";
import { useMeQuery, useTelegramAuthMutation } from "@/features/profile/model/me-queries";

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
  const forced = process.env.NODE_ENV !== "production" && typeof location !== "undefined" ? new URLSearchParams(location.search).get("auth") : null;
  const preview = forced === "loading" || forced === "error" || forced === "ready";
  const me = useMeQuery(!preview);
  const auth = useTelegramAuthMutation();
  const { mutate, reset, status, isError: authError, isSuccess: authSuccess } = auth;

  useEffect(() => {
    if (preview || !me.isError || status !== "idle") return;
    mutate(window.Telegram?.WebApp?.initData ?? "");
  }, [me.isError, mutate, preview, status]);

  const retry = useCallback(() => {
    reset();
    void me.refetch();
  }, [me, reset]);

  const ready = forced === "ready" || me.isSuccess || authSuccess;
  const error = forced === "error" || authError;

  if (ready) return <>{children}</>;

  return (
    <div className="safe-shell mx-auto grid min-h-dvh w-full max-w-[75rem] place-items-center bg-canvas px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <Image src="/brand/flowly-icon.svg" alt="Flowly" width={72} height={72} priority />
        {error ? (
          <InlineError
            title="Не удалось войти"
            description="Проверка Telegram не прошла. Повторите вход — личные данные не открываются до успешной проверки."
            retryLabel="Повторить"
            onRetry={retry}
            icon={<Icon name="triangle-alert" />}
          />
        ) : (
          <>
            <p className="text-text-muted">Проверяем вход…</p>
            <div className="grid w-full gap-4" aria-label="Загрузка">
              <Skeleton height="hero" />
              <Skeleton height="card" />
              <Skeleton height="card" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
