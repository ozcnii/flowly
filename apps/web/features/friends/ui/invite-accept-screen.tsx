"use client";

import { Button, Card, Preloader } from "konsta/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { ApiError } from "@/lib/api/client";
import { useMeQuery } from "@/features/profile/model/me-queries";
import { useAcceptInviteMutation, useRejectInviteMutation } from "../model/friends-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

function errorMessage(e: unknown) {
  if (e instanceof ApiError) {
    const body = e.body as { message?: string } | null;
    return body?.message ?? (e.status === 404 ? "Приглашение не найдено." : "Не удалось принять.");
  }
  return "Ошибка сети.";
}

/** S-MA-082 — open invite deep link → auto-accept once session ready (PRD §32.1). */
export function InviteAcceptScreen({ code }: { code: string }) {
  const router = useRouter();
  const me = useMeQuery();
  const accept = useAcceptInviteMutation();
  const reject = useRejectInviteMutation();
  const [done, setDone] = useState<"accepted" | "rejected" | null>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "auto" | "manual">("idle");
  const started = useRef(false);

  useEffect(() => {
    if (started.current || done || !code) return;
    if (me.isPending || me.isError || !me.data?.user) return;
    started.current = true;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setPhase("auto");
      setError("");
      void accept
        .mutateAsync(code)
        .then(() => {
          if (!cancelled) setDone("accepted");
        })
        .catch((e) => {
          if (!cancelled) {
            setError(errorMessage(e));
            setPhase("manual");
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [me.isPending, me.isError, me.data?.user, code, done, accept]);

  const onAccept = async () => {
    setPhase("manual");
    setError("");
    try {
      await accept.mutateAsync(code);
      setDone("accepted");
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const onReject = async () => {
    setError("");
    try {
      await reject.mutateAsync(code);
      setDone("rejected");
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const busy = accept.isPending || reject.isPending || (phase === "auto" && !done && !error);
  const title =
    done === "accepted"
      ? "Вы теперь друзья"
      : done === "rejected"
        ? "Приглашение отклонено"
        : busy
          ? "Принимаем приглашение…"
          : "Приглашение в Flowly";

  return (
    <div className="min-h-dvh">
      <PrimaryNavbar title="Приглашение" />
      <main className="flow-screen grid min-h-[50dvh] place-items-center">
        <Card
          component="section"
          outline
          className="m-0 w-full max-w-md"
          contentWrapPadding="p-6 grid justify-items-center gap-4 text-center"
        >
          <Icon name="users" className="size-12 text-accent" />
          <h1 className="m-0 text-2xl font-semibold leading-tight">{title}</h1>
          <p className="m-0 text-sm leading-relaxed text-text-muted">
            {done === "accepted"
              ? "Можно открыть список друзей."
              : done === "rejected"
                ? "Можно вернуться на главную."
                : error
                  ? "Не получилось автоматически — попробуйте ещё раз."
                  : "Одноразовая ссылка. Принятие выполняется автоматически после входа."}
          </p>
          <p className="m-0 min-h-5 text-xs text-text-muted" aria-live="polite">
            {error}
          </p>
          {done === "accepted" ? (
            <Button large rounded className={`w-full gap-2 ${focusRing}`} onClick={() => router.push("/friends" as never)}>
              <Icon name="users" />К друзьям
            </Button>
          ) : done === "rejected" ? (
            <Button large rounded className={`w-full gap-2 ${focusRing}`} onClick={() => router.push("/" as never)}>
              <Icon name="house" />На главную
            </Button>
          ) : (
            <div className="grid w-full gap-2">
              <Button
                large
                rounded
                className={`w-full gap-2 ${focusRing}`}
                disabled={busy}
                aria-busy={busy || undefined}
                onClick={() => void onAccept()}
              >
                {accept.isPending ? <Preloader /> : <Icon name="check" />}
                {error ? "Повторить" : "Принять"}
              </Button>
              <Button large rounded tonal className={`w-full gap-2 ${focusRing}`} disabled={busy} onClick={() => void onReject()}>
                {reject.isPending ? <Preloader /> : <Icon name="x" />}
                Отклонить
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
