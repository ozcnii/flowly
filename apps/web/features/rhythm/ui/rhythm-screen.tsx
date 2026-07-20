"use client";

import { Badge, BlockTitle, Button, Card, Chip, Preloader } from "konsta/react";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";
import { HabitCard } from "./habit-card";
import { useHabitsQuery } from "../model/habits-queries";
import { habitsToCards } from "../model/habit-card-vm";
import type { HabitCardVM } from "../model/rhythm-types";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

// PRD §21.2 examples — non-interactive inspiration chips. §21.1: examples are never auto-created.
const EXAMPLES = ["Выпить воду", "Витамины", "Таблетки", "Спортзал", "Разминка", "Прогулка", "Сон вовремя", "Дыхание"];

// Dev-only preview of the card/list states. Mock only — never persisted.
const DEMO_HABITS: HabitCardVM[] = [
  { id: "demo-water", title: "Вода", icon: "glass-water", color: "sky", todayDone: 3, todayTotal: 4, nextDueLabel: "сегодня в 21:00", streak: 5, status: "partial" },
  { id: "demo-sleep", title: "Сон вовремя", icon: "moon", color: "violet", todayDone: 1, todayTotal: 1, nextDueLabel: "до 23:00", streak: 12, status: "done" },
  { id: "demo-walk", title: "Прогулка", icon: "leaf", color: "emerald", todayDone: 0, todayTotal: 1, nextDueLabel: "завтра утром", streak: 0, status: "pending" },
];

/**
 * Slice S-MA-060 — Раздел «Мой ритм» (PRD §21). Shared AppShell owns the «Ритм» Navbar + Tabbar (DEC-043/061).
 * T02: real habits via react-query (DEC-029); create CTA is active (S-MA-061). `demo` is a dev-only mock preview.
 */
export function RhythmScreen({ demo = false }: { demo?: boolean }) {
  const router = useRouter();
  const query = useHabitsQuery();
  const cards: HabitCardVM[] = demo ? DEMO_HABITS : habitsToCards(query.data?.habits);
  const loading = !demo && query.isPending && !query.data;
  const error = !demo && query.isError && !query.data;

  return (
    <div className="flow-screen">
      <h1 className="sr-only">Ритм</h1>

      {demo ? (
        <Card component="aside" outline className="m-0" header={<Badge>Предпросмотр</Badge>} contentWrapPadding="p-4">
          <p className="m-0 text-sm text-text-muted">Так будут выглядеть карточки привычек. Это пример — данные не сохраняются.</p>
        </Card>
      ) : null}

      {demo || (!loading && !error && cards.length > 0) ? (
        <div className="grid gap-3">
          {cards.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onEdit={!demo ? () => router.push(`/rhythm/${encodeURIComponent(habit.id)}/edit` as never) : undefined} />
          ))}
        </div>
      ) : null}

      {!demo && loading ? (
        <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true">
          <Preloader />
          <span className="sr-only">Загружаем привычки</span>
        </div>
      ) : null}

      {!demo && error ? (
        <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid justify-items-center gap-3">
          <Icon name="triangle-alert" />
          <h2 className="m-0 text-lg font-semibold">Не удалось загрузить</h2>
          <p className="m-0 text-sm text-text-muted">Проверьте связь и повторите.</p>
          <Button large rounded className={focusRing} onClick={() => query.refetch()}>
            Повторить
          </Button>
        </Card>
      ) : null}

      {!demo && !loading && !error && cards.length === 0 ? (
        <>
          <Card component="section" outline className="m-0" contentWrapPadding="grid gap-3 p-4">
            <BlockTitle component="h2" large className="!m-0 !p-0">
              Небольшие шаги каждый день
            </BlockTitle>
            <p className="m-0 text-sm leading-relaxed text-text-muted">
              Здесь соберутся ваши привычки и спокойный прогресс: вода, сон, разминка и всё, что важно именно вам.
            </p>
          </Card>

          <section className="grid gap-2">
            <BlockTitle component="h2" className="!m-0 !p-0">
              Идеи для начала
            </BlockTitle>
            <ul role="list" className="m-0 flex flex-wrap gap-2 p-0">
              {EXAMPLES.map((label) => (
                <li key={label}>
                  <Chip outline>{label}</Chip>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-2">
            <Button large rounded className={`w-full ${focusRing}`} onClick={() => router.push("/rhythm/new" as never)}>
              <span className="inline-flex items-center gap-2">
                <Icon name="plus" className="size-5" />
                Добавить привычку
              </span>
            </Button>
          </section>
        </>
      ) : null}

      {!demo && !loading && !error && cards.length > 0 ? (
        <Button large rounded tonal className={`w-full ${focusRing}`} onClick={() => router.push("/rhythm/new" as never)}>
          <span className="inline-flex items-center gap-2">
            <Icon name="plus" className="size-5" />
            Новая привычка
          </span>
        </Button>
      ) : null}
    </div>
  );
}
