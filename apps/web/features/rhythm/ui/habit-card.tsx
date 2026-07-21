"use client";

import { Button, Card } from "konsta/react";
import { Icon } from "@flowly/ui";
import { COLOR_OPTIONS } from "../model/habits";
import type { HabitCardVM } from "../model/rhythm-types";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

const dayWord = (n: number) =>
  n % 10 === 1 && n % 100 !== 11 ? "день" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "дня" : "дней";

const streakText = (h: HabitCardVM) => `${h.streak} ${dayWord(h.streak)} подряд`;

/**
 * PRD §21.3 habit card. Progress ring around the identity icon (DEC-067); identity color from habit.color (§22.3,
 * NOT a status cue). todayTotal=0 (no schedule yet in T02) → empty ring + "Расписание скоро". Quick-complete is an
 * icon-only Button — disabled until completion/occurrences exist (T05). Edit via optional `onEdit` (long-press-free).
 */
export function HabitCard({ habit, onEdit }: { habit: HabitCardVM; onEdit?: () => void }) {
  const noSlots = habit.todayTotal === 0;
  const done = habit.status === "done";
  const progress = noSlots ? 0 : habit.todayTotal > 0 ? habit.todayDone / habit.todayTotal : 0;
  const cellClass = COLOR_OPTIONS[habit.color]?.cell ?? COLOR_OPTIONS.sage.cell;
  const R = 20;
  const C = 2 * Math.PI * R;
  return (
    <Card
      component="article"
      outline
      className={`m-0 ${onEdit ? "cursor-pointer" : ""}`}
      contentWrapPadding="p-4"
      role={onEdit ? "link" : undefined}
      tabIndex={onEdit ? 0 : undefined}
      aria-label={onEdit ? `Открыть привычку «${habit.title}»` : undefined}
      onClick={onEdit}
      onKeyDown={onEdit ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onEdit(); } } : undefined}
    >
      <div className="flex items-center gap-3">
        <span className="relative grid size-14 shrink-0 place-items-center" aria-hidden="true">
          <svg viewBox="0 0 48 48" className="absolute inset-0 size-14 -rotate-90">
            <circle cx="24" cy="24" r={R} fill="none" strokeWidth="4" style={{ stroke: "var(--color-text-muted)", opacity: 0.2 }} />
            <circle
              cx="24"
              cy="24"
              r={R}
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ stroke: "var(--color-accent)" }}
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
            />
          </svg>
          {habit.emoji ? (
            <span className="relative grid size-8 place-items-center text-2xl leading-none">{habit.emoji}</span>
          ) : (
            <span className={`relative grid size-7 place-items-center rounded-full ${cellClass}`}>
              <Icon name={habit.icon} className="size-4" />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-base font-semibold leading-tight">{habit.title}</h2>
          <p className="m-0 mt-0.5 text-sm text-text-muted">
            {noSlots ? "Расписание скоро" : `${habit.nextDueLabel ? `${habit.nextDueLabel} · ` : ""}${habit.todayDone} из ${habit.todayTotal}`}
          </p>
          {noSlots || habit.streak === 0 ? null : <p className="m-0 mt-0.5 text-xs text-text-muted">{streakText(habit)}</p>}
        </div>
        {onEdit ? (
          <Button rounded inline className={`!size-11 !min-w-0 shrink-0 ${focusRing}`} aria-label={`Редактировать «${habit.title}»`} onClick={(event) => { event.stopPropagation(); onEdit(); }}>
            <Icon name="ellipsis" className="size-5" />
          </Button>
        ) : null}
        <Button
          rounded
          inline
          disabled
          className={`!size-11 !min-w-0 shrink-0 ${focusRing}`}
          aria-label={done ? `«${habit.title}» выполнено` : `Отметить «${habit.title}» — скоро`}
        >
          <Icon name={done ? "circle-check" : "circle"} className="size-6" />
        </Button>
      </div>
    </Card>
  );
}
