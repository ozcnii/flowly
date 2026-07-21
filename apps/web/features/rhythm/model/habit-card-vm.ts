import { COLOR_OPTIONS, type HabitColor, type HabitListItem } from "./habits";
import type { HabitCardVM } from "./rhythm-types";

/**
 * Map API list items → HabitCardVM. todayTotal=0 (no schedule/occurrences yet in T02) → pending, empty ring,
 * "Расписание скоро" meta instead of "0 из 0". Schedule/occurrences land in T03/T04/T07.
 */
export function habitsToCards(habits: HabitListItem[] | undefined): HabitCardVM[] {
  return (habits ?? []).map((h) => {
    const noSlots = h.todayTotal === 0;
    const status: HabitCardVM["status"] = noSlots ? "pending" : h.todayDone >= h.todayTotal ? "done" : h.todayDone > 0 ? "partial" : "pending";
    return {
      id: h.id,
      title: h.title,
      icon: h.icon,
      emoji: h.emoji ?? null,
      color: (h.color in COLOR_OPTIONS ? (h.color as HabitColor) : "sage"),
      todayDone: h.todayDone,
      todayTotal: h.todayTotal,
      nextDueLabel: noSlots ? null : h.nextDueLabel,
      scheduleLabel: h.scheduleLabel,
      streak: h.streak,
      status,
    };
  });
}
