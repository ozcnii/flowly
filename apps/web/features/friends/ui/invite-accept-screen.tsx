"use client";

import { Button, Card, Preloader } from "konsta/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { ApiError } from "@/lib/api/client";
import { useAcceptInviteMutation, useRejectInviteMutation } from "../model/friends-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

/** S-MA-082 — accept / reject / expired / already-used invite. */
export function InviteAcceptScreen({ code }: { code: string }) {
  const router = useRouter();
  const accept = useAcceptInviteMutation();
  const reject = useRejectInviteMutation();
  const [done, setDone] = useState<"accepted" | "rejected" | null>(null);
  const [error, setError] = useState("");
  const busy = accept.isPending || reject.isPending;

  const onAccept = async () => {
    setError("");
    try {
      await accept.mutateAsync(code);
      setDone("accepted");
    } catch (e) {
      if (e instanceof ApiError) {
        const body = e.body as { message?: string; error?: string } | null;
        setError(body?.message ?? (e.status === 404 ? "Приглашение не найдено." : "Не удалось принять."));
      } else setError("Ошибка сети.");
    }
  };

  const onReject = async () => {
    setError("");
    try {
      await reject.mutateAsync(code);
      setDone("rejected");
    } catch (e) {
      if (e instanceof ApiError) {
        const body = e.body as { message?: string } | null;
        setError(body?.message ?? "Не удалось отклонить.");
      } else setError("Ошибка сети.");
    }
  };

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
          <h1 className="m-0 text-2xl font-semibold leading-tight">
            {done === "accepted" ? "Вы теперь друзья" : done === "rejected" ? "Приглашение отклонено" : "Приглашение в Flowly"}
          </h1>
          <p className="m-0 text-sm leading-relaxed text-text-muted">
            {done
              ? "Можно вернуться к списку друзей."
              : "Одноразовая ссылка. Примите, чтобы добавить человека в друзья, или отклоните."}
          </p>
          <p className="m-0 min-h-5 text-xs text-text-muted" aria-live="polite">
            {error}
          </p>
          {done ? (
            <Button large rounded className={`w-full gap-2 ${focusRing}`} onClick={() => router.push("/friends" as never)}>
              <Icon name="users" />К друзьям
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
                Принять
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
