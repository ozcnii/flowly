"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Icon, InlineError, Skeleton } from "@flowly/ui";

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
type Phase = "checking" | "error" | "ready";

export function AuthGate({ children }: { children: ReactNode }) {
  const isDev = process.env.NODE_ENV !== "production";
  const [phase, setPhase] = useState<Phase>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve(); // defer state updates out of the effect's sync phase
      if (isDev) {
        const forced = new URLSearchParams(location.search).get("auth");
        if (forced === "error") {
          if (!cancelled) setPhase("error");
          return;
        }
        if (forced === "ready") {
          if (!cancelled) setPhase("ready");
          return;
        }
        if (forced === "loading") return; // stay on the loading state
      }

      try {
        const me = await fetch("/api/v1/me", { cache: "no-store", credentials: "same-origin" });
        if (me.ok) {
          if (!cancelled) setPhase("ready");
          return;
        }
        const initData = window.Telegram?.WebApp?.initData ?? "";
        const res = await fetch("/api/v1/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ initData }),
        });
        if (!cancelled) setPhase(res.ok ? "ready" : "error");
      } catch {
        if (!cancelled) setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDev, attempt]);

  const retry = useCallback(() => {
    setPhase("checking");
    setAttempt((n) => n + 1);
  }, []);

  if (phase === "ready") return <>{children}</>;

  return (
    <div className="safe-shell mx-auto grid min-h-dvh w-full max-w-[75rem] place-items-center bg-canvas px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <Image src="/brand/flowly-icon.svg" alt="Flowly" width={72} height={72} priority />
        {phase === "error" ? (
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
