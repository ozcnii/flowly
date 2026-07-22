"use client";

import { ListItem } from "konsta/react";
import { Icon } from "@flowly/ui";
import { COLOR_OPTIONS } from "../model/habits";
import type { HabitCardVM } from "../model/rhythm-types";

/** Compact habit navigation row. T05 renders real generated-slot progress; T07 owns occurrence generation. */
export function HabitCard({ habit, onEdit }: { habit: HabitCardVM; onEdit?: () => void }) {
  const cellClass = COLOR_OPTIONS[habit.color]?.cell ?? COLOR_OPTIONS.sage.cell;
  const media = habit.emoji
    ? <span className={`grid size-11 place-items-center rounded-full text-2xl leading-none ${cellClass}`} aria-hidden="true">{habit.emoji}</span>
    : <span className={`grid size-11 place-items-center rounded-full ${cellClass}`} aria-hidden="true"><Icon name={habit.icon} className="size-5" /></span>;
  const title = <h2 className="m-0 line-clamp-2 break-words text-base leading-snug font-semibold">{habit.title}</h2>;
  const progress = habit.status === "paused" ? "На паузе" : habit.todayTotal === 0 ? undefined : habit.status === "done" ? `✓ ${habit.todayDone} из ${habit.todayTotal}` : habit.status === "partial" ? `Частично · ${habit.todayDone} из ${habit.todayTotal}` : `${habit.todayDone} из ${habit.todayTotal}`;
  return <ListItem
    media={media}
    title={title}
    subtitle={<span className="line-clamp-2">{habit.scheduleLabel}{habit.nextDueLabel ? ` · ${habit.nextDueLabel}` : ""}</span>}
    after={progress ? <span className="whitespace-nowrap text-sm text-text-muted" aria-label={`Прогресс: ${progress}`}>{progress}</span> : undefined}
    link={Boolean(onEdit)}
    chevron={Boolean(onEdit)}
    linkComponent="button"
    contentClassName="w-full"
    innerClassName="text-left"
    linkProps={onEdit ? { type: "button", onClick: onEdit, "aria-label": `Открыть привычку «${habit.title}». ${habit.scheduleLabel}` } : undefined}
  />;
}
