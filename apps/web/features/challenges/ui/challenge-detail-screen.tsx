"use client";

import { Badge, Button, Card, List, ListItem, Preloader, Progressbar } from "konsta/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { ApiError } from "@/lib/api/client";
import { REACTION_EMOJIS } from "@/lib/challenges/types";
import {
  useChallengeQuery,
  useJoinChallengeMutation,
  useLeaveChallengeMutation,
  useReactChallengeMutation,
} from "../model/challenges-queries";
import { useMeQuery } from "@/features/profile/model/me-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

/** S-MA-086 detail + S-MA-087 progress/reactions. */
export function ChallengeDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const me = useMeQuery();
  const query = useChallengeQuery(id);
  const join = useJoinChallengeMutation(id);
  const leave = useLeaveChallengeMutation(id);
  const react = useReactChallengeMutation(id);
  const [notice, setNotice] = useState("");
  const data = query.data;
  const c = data?.challenge;
  const busy = join.isPending || leave.isPending || react.isPending;

  if (query.isPending && !data) {
    return (
      <div className="min-h-dvh">
        <PrimaryNavbar title="Челлендж" />
        <main className="grid min-h-48 place-items-center">
          <Preloader />
        </main>
      </div>
    );
  }
  if (query.isError || !c) {
    return (
      <div className="min-h-dvh">
        <PrimaryNavbar title="Челлендж" />
        <main className="flow-screen">
          <Card outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid gap-3 justify-items-center">
            <Icon name="triangle-alert" />
            <h1 className="m-0 text-lg font-semibold">Не найден</h1>
            <Button large rounded onClick={() => router.replace("/challenges" as never)}>
              К списку
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const status = data.membership.status;
  const goal = c.goalValue;
  const myId = me.data?.user?.id;

  const onJoin = async () => {
    setNotice("");
    try {
      await join.mutateAsync();
      setNotice("Вы в челлендже.");
    } catch (e) {
      setNotice(e instanceof ApiError ? "Не удалось вступить." : "Ошибка сети.");
    }
  };
  const onLeave = async () => {
    setNotice("");
    try {
      await leave.mutateAsync();
      setNotice("Вы вышли.");
      router.replace("/challenges" as never);
    } catch (e) {
      setNotice(e instanceof ApiError ? ((e.body as { message?: string })?.message ?? "Нельзя выйти.") : "Ошибка сети.");
    }
  };
  const onReact = async (recipientId: string, emoji: string) => {
    setNotice("");
    try {
      const res = await react.mutateAsync({ recipientId, emoji });
      setNotice(res.action === "removed" ? "Реакция снята." : "Реакция сохранена.");
    } catch {
      setNotice("Не удалось отправить реакцию.");
    }
  };

  return (
    <div className="min-h-dvh">
      <PrimaryNavbar title={c.title} />
      <main className="flow-screen gap-3 pb-safe-4">
        <Card outline className="m-0" contentWrapPadding="grid gap-2 p-4">
          <p className="m-0 text-sm text-text-muted">{c.description || "Без описания."}</p>
          <p className="m-0 text-sm">
            {c.startsOn} — {c.endsOn} · цель {c.goalValue} ({c.goalType})
          </p>
          {status === "invited" ? <Badge>Вас пригласили</Badge> : null}
        </Card>

        <p className="m-0 min-h-5 text-sm text-text-muted" aria-live="polite">
          {notice}
        </p>

        {status === "invited" ? (
          <div className="grid gap-2">
            <Button large rounded className={`gap-2 ${focusRing}`} disabled={busy} onClick={() => void onJoin()}>
              {join.isPending ? <Preloader /> : <Icon name="check" />}
              Принять
            </Button>
            <Button large rounded tonal className={focusRing} disabled={busy} onClick={() => void onLeave()}>
              Отклонить / выйти
            </Button>
          </div>
        ) : null}

        {(status === "owner" || status === "accepted") && (
          <>
            <List strong inset dividers>
              {(data.progress ?? []).map((p) => {
                const progress = goal > 0 ? Math.min(1, p.value / goal) : 0;
                const name = p.peer?.firstName ?? "Участник";
                return (
                  <ListItem
                    key={p.userId}
                    title={name}
                    subtitle={`${p.value} / ${goal}`}
                    footer={
                      <div className="grid gap-2 pb-2">
                        <Progressbar progress={progress} />
                        {myId && p.userId !== myId ? (
                          <div className="flex flex-wrap gap-2">
                            {REACTION_EMOJIS.map((emoji) => (
                              <Button
                                key={emoji}
                                small
                                tonal
                                className={focusRing}
                                disabled={busy}
                                onClick={() => void onReact(p.userId, emoji)}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    }
                  />
                );
              })}
            </List>
            {status === "accepted" ? (
              <Button large rounded tonal className={`w-full ${focusRing}`} disabled={busy} onClick={() => void onLeave()}>
                Покинуть
              </Button>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
