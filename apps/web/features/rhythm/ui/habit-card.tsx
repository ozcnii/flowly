"use client";

import { Button, Card } from "konsta/react";
import { Icon } from "@flowly/ui";
import type { HabitCardVM } from "../model/rhythm-types";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

const dayWord = (n: number) =>
  n % 10 === 1 && n % 100 !== 11 ? "день" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "дня" : "дней";

const streakText = (h: HabitCardVM) => `${h.streak} ${dayWord(h.streak)} подряд`;

/**
 * PRD §21.3 habit card. Progress is a ring AROUND the habit identity icon (DEC-067): Konsta 5.2.0 has only a linear
 * `Progressbar` and no circular progress (same gap as DEC-040 for Home). Inline SVG — no CSS Module, dependency or
 * wrapper; semantic colors only; non-color cue = «N из M» text. Identity color (§22.3) lands in T02.
 * Quick-complete is an icon-only Konsta Button — disabled in T01, active in T05 when completion/occurrences exist.
 */
export function HabitCard({ habit }: { habit: HabitCardVM }) {
  const done = habit.status === "done";
  const progress = habit.todayTotal > 0 ? habit.todayDone / habit.todayTotal : 0;
  const R = 20;
  const C = 2 * Math.PI * R;
  return (
    <Card component="article" outline className="m-0" contentWrapPadding="p-4">
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
          <Icon name={habit.icon} className="relative size-5 text-accent" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-base font-semibold leading-tight">{habit.title}</h2>
          <p className="m-0 mt-0.5 text-sm text-text-muted">
            {habit.nextDueLabel ? `${habit.nextDueLabel} · ` : ""}
            {habit.todayDone} из {habit.todayTotal}
          </p>
          <p className="m-0 mt-0.5 text-xs text-text-muted">{streakText(habit)}</p>
        </div>
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
