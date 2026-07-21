"use client";

import { ListItem } from "konsta/react";
import { Icon } from "@flowly/ui";
import { COLOR_OPTIONS } from "../model/habits";
import type { HabitCardVM } from "../model/rhythm-types";

/** Compact habit navigation row. Progress/completion controls return with real occurrences in T05/T07. */
export function HabitCard({ habit, onEdit }: { habit: HabitCardVM; onEdit?: () => void }) {
  const cellClass = COLOR_OPTIONS[habit.color]?.cell ?? COLOR_OPTIONS.sage.cell;
  const media = habit.emoji
    ? <span className={`grid size-11 place-items-center rounded-full text-2xl leading-none ${cellClass}`} aria-hidden="true">{habit.emoji}</span>
    : <span className={`grid size-11 place-items-center rounded-full ${cellClass}`} aria-hidden="true"><Icon name={habit.icon} className="size-5" /></span>;
  const title = <h2 className="m-0 line-clamp-2 break-words text-base leading-snug font-semibold">{habit.title}</h2>;
  return <ListItem
    media={media}
    title={title}
    subtitle={habit.scheduleLabel}
    link={Boolean(onEdit)}
    chevron={Boolean(onEdit)}
    linkComponent="button"
    contentClassName="w-full"
    innerClassName="text-left"
    linkProps={onEdit ? { type: "button", onClick: onEdit, "aria-label": `Открыть привычку «${habit.title}». ${habit.scheduleLabel}` } : undefined}
  />;
}
