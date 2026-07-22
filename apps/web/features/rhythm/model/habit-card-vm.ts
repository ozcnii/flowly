import { COLOR_OPTIONS, type HabitColor, type HabitListItem } from "./habits";
import type { HabitCardVM } from "./rhythm-types";

/**
 * Map API list items → HabitCardVM. No generated slots remains an honest "Расписание скоро" state;
 * generated occurrences expose full/partial/pending progress without using color as the only cue.
 */
export function habitsToCards(habits: HabitListItem[] | undefined): HabitCardVM[] {
  return (habits ?? []).map((h) => {
    const noSlots = h.todayTotal === 0;
    const status: HabitCardVM["status"] = h.status === "paused" ? "paused" : noSlots ? "pending" : h.todayDone >= h.todayTotal ? "done" : h.todayDone > 0 || h.todayPartial > 0 ? "partial" : "pending";
    return {
      id: h.id,
      title: h.title,
      icon: h.icon,
      emoji: h.emoji ?? null,
      color: (h.color in COLOR_OPTIONS ? (h.color as HabitColor) : "sage"),
      todayDone: h.todayDone,
      todayPartial: h.todayPartial,
      todayTotal: h.todayTotal,
      nextDueLabel: noSlots ? null : h.nextDueLabel,
      scheduleLabel: h.scheduleLabel,
      streak: h.streak,
      status,
    };
  });
}
