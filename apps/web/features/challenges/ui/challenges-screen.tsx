"use client";

import { Badge, Button, Card, List, ListItem, Preloader } from "konsta/react";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { useChallengesQuery } from "../model/challenges-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

const GOAL_LABEL: Record<string, string> = {
  workout_count: "Тренировки",
  daily: "Дни подряд",
  habit_count: "Привычки",
  total_time: "Минуты",
};

/** S-MA-085 — challenges list. */
export function ChallengesScreen() {
  const router = useRouter();
  const query = useChallengesQuery();
  const items = query.data?.items ?? [];
  const loading = query.isPending && !query.data;
  const error = query.isError && !query.data;

  return (
    <div className="min-h-dvh">
      <PrimaryNavbar title="Челленджи" />
      <main className="flow-screen gap-3">
        <h1 className="sr-only">Челленджи</h1>
        <Button
          large
          rounded
          className={`w-full gap-2 ${focusRing}`}
          onClick={() => router.push("/challenges/new" as never)}
        >
          <Icon name="plus" />
          Создать челлендж
        </Button>

        {loading ? (
          <div className="grid min-h-48 place-items-center" role="status" aria-busy="true">
            <Preloader />
          </div>
        ) : error ? (
          <Card
            component="section"
            outline
            className="m-0 text-center"
            role="alert"
            contentWrapPadding="p-6 grid justify-items-center gap-3"
          >
            <Icon name="triangle-alert" />
            <h2 className="m-0 text-lg font-semibold">Не удалось загрузить</h2>
            <Button large rounded className={focusRing} onClick={() => query.refetch()}>
              Повторить
            </Button>
          </Card>
        ) : items.length === 0 ? (
          <Card component="section" outline className="m-0 text-center" contentWrapPadding="p-6 grid justify-items-center gap-3">
            <Icon name="flag" />
            <h2 className="m-0 text-lg font-semibold">Пока нет челленджей</h2>
            <p className="m-0 text-sm text-text-muted">Создайте челлендж с друзьями — цель, даты и прогресс.</p>
          </Card>
        ) : (
          <List strong inset dividers>
            {items.map(({ challenge, membership }) => (
              <ListItem
                key={challenge.id}
                link
                linkComponent="button"
                contentClassName="w-full"
                innerClassName="text-left"
                linkProps={{ type: "button", onClick: () => router.push(`/challenges/${encodeURIComponent(challenge.id)}` as never) }}
                title={challenge.title}
                subtitle={`${GOAL_LABEL[challenge.goalType] ?? challenge.goalType} · ${challenge.goalValue} · ${challenge.startsOn}–${challenge.endsOn}`}
                after={
                  membership.status === "invited" ? (
                    <Badge>Приглашение</Badge>
                  ) : membership.status === "owner" ? (
                    <Badge>Организатор</Badge>
                  ) : (
                    <Icon name="chevron-right" />
                  )
                }
              />
            ))}
          </List>
        )}
      </main>
    </div>
  );
}
