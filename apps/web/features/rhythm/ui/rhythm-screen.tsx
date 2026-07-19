"use client";

import { Badge, BlockTitle, Button, Card, Chip } from "konsta/react";
import { Icon } from "@flowly/ui";
import { HabitCard } from "./habit-card";
import type { HabitCardVM } from "../model/rhythm-types";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

// PRD §21.2 examples — non-interactive inspiration chips. §21.1: examples are never auto-created.
const EXAMPLES = ["Выпить воду", "Витамины", "Таблетки", "Спортзал", "Разминка", "Прогулка", "Сон вовремя", "Дыхание"];

// Dev-only preview of the card/list states (T01). Mock only — never persisted; GET /habits lands in T02.
const DEMO_HABITS: HabitCardVM[] = [
  { id: "demo-water", title: "Вода", icon: "glass-water", todayDone: 3, todayTotal: 4, nextDueLabel: "сегодня в 21:00", streak: 5, status: "partial" },
  { id: "demo-sleep", title: "Сон вовремя", icon: "moon", todayDone: 1, todayTotal: 1, nextDueLabel: "до 23:00", streak: 12, status: "done" },
  { id: "demo-walk", title: "Прогулка", icon: "leaf", todayDone: 0, todayTotal: 1, nextDueLabel: "завтра утром", streak: 0, status: "pending" },
];

/**
 * Slice S-MA-060 — Раздел «Мой ритм» (PRD §21). Shared AppShell owns the «Ритм» Navbar + Tabbar (DEC-043/061).
 * T01 ships the empty-state shell + typed HabitCard/list ready for T02; production has no habits yet, so it renders
 * empty directly without a fetch (GET /habits and CRUD are T02; DEC-029 query lands there).
 */
export function RhythmScreen({ demo = false }: { demo?: boolean }) {
  const habits = demo ? DEMO_HABITS : [];
  return (
    <div className="flow-screen">
      <h1 className="sr-only">Ритм</h1>

      {demo ? (
        <>
          <Card component="aside" outline className="m-0" header={<Badge>Предпросмотр</Badge>} contentWrapPadding="p-4">
            <p className="m-0 text-sm text-text-muted">
              Так будут выглядеть карточки привычек. Это пример — данные не сохраняются.
            </p>
          </Card>
          <div className="grid gap-3">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </>
      ) : (
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
            <Button large rounded disabled className={`w-full ${focusRing}`}>
              <span className="inline-flex items-center gap-2">
                <Icon name="plus" className="size-5" />
                Добавить привычку
              </span>
            </Button>
            <p className="m-0 text-center text-sm text-text-muted">Создание привычки скоро</p>
          </section>
        </>
      )}
    </div>
  );
}
