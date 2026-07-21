// PRD §21.3 habit-card view model. Full Habit entity + schedule/policy/ownership land in T02–T07.
// DEC-017: multiple completions count as separate configured slots; todayDone/todayTotal reflect those slots.

import type { HabitColor } from "./habits";

export type HabitStatus = "done" | "partial" | "pending";

export interface HabitCardVM {
  id: string;
  title: string;
  icon: string; // Lucide name (PRD §22.2)
  emoji: string | null; // optional user emoji identity; rendered instead of the Lucide icon when set
  color: HabitColor; // identity color (§22.3); NOT a status cue
  todayDone: number;
  todayTotal: number; // configured slots for today (DEC-017); 0 until schedule (T03/T04) + occurrences (T07)
  nextDueLabel?: string | null; // localized, e.g. "сегодня в 21:00"
  streak: number; // current consecutive-series count
  status: HabitStatus;
}
