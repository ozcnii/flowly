// PRD §21.3 habit-card view model. Full Habit entity + schedule/policy/ownership land in T02–T07.
// DEC-017: multiple completions count as separate configured slots; todayDone/todayTotal reflect those slots.

export type HabitStatus = "done" | "partial" | "pending";

export interface HabitCardVM {
  id: string;
  title: string;
  icon: string; // Lucide name (PRD §22.2); per-habit identity color (§22.3) arrives in T02
  todayDone: number;
  todayTotal: number; // configured slots for today (DEC-017)
  nextDueLabel?: string; // localized, e.g. "сегодня в 21:00"
  streak: number; // current consecutive-series count
  status: HabitStatus;
}
