import { z } from "zod";

// PRD §22.2 — system icon (Lucide). Subset of the local sprite (DEC-037); emoji picker is out of T02 scope.
export const ICON_OPTIONS = [
  "glass-water",
  "moon",
  "leaf",
  "dumbbell",
  "heart",
  "sunrise",
  "bell",
  "clock-3",
  "timer",
  "sparkles",
  "user-round",
  "house",
] as const;
export type HabitIcon = (typeof ICON_OPTIONS)[number];

// PRD §22.3 — user-chosen identity color. Static Tailwind className strings (JIT-safe); NOT a status cue.
// Non-color status cue (progress text + check glyph) is preserved in HabitCard.
export const COLOR_OPTIONS = {
  sage: { cell: "bg-accent-soft text-accent", label: "Шалфей" },
  sky: { cell: "bg-sky-500/15 text-sky-600 dark:text-sky-400", label: "Небо" },
  amber: { cell: "bg-amber-500/15 text-amber-600 dark:text-amber-400", label: "Янтарь" },
  rose: { cell: "bg-rose-500/15 text-rose-600 dark:text-rose-400", label: "Роза" },
  violet: { cell: "bg-violet-500/15 text-violet-600 dark:text-violet-400", label: "Аметист" },
  emerald: { cell: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", label: "Изумруд" },
  orange: { cell: "bg-orange-500/15 text-orange-600 dark:text-orange-400", label: "Закат" },
  teal: { cell: "bg-teal-500/15 text-teal-600 dark:text-teal-400", label: "Море" },
} as const;
export type HabitColor = keyof typeof COLOR_OPTIONS;

export const HABIT_STATUS = ["active", "paused", "archived"] as const;
export type HabitStatus = (typeof HABIT_STATUS)[number];

/** Full DB row (§43.16). */
export interface Habit {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  startLocalDate: string;
  endLocalDate: string | null;
  allowSkip: boolean;
  allowRest: boolean;
  commentEnabled: boolean;
  status: HabitStatus;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned by GET /habits (list item, maps to HabitCardVM). */
export interface HabitListItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  status: HabitStatus;
  startLocalDate: string;
  allowSkip: boolean;
  todayDone: number; // 0 until occurrences (T07)
  todayTotal: number; // 0 until schedule (T03/T04) + occurrences (T07)
  nextDueLabel: string | null; // null until schedule (T03/T04)
  streak: number; // 0 until occurrences (T07)
}

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const habitCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  icon: z.enum(ICON_OPTIONS),
  color: z.enum(Object.keys(COLOR_OPTIONS) as [HabitColor, ...HabitColor[]]),
  startLocalDate: z.string().regex(LOCAL_DATE),
  endLocalDate: z.string().regex(LOCAL_DATE).optional().nullable(),
  allowSkip: z.boolean().optional(),
});
export type HabitCreateInput = z.infer<typeof habitCreateSchema>;

export const habitUpdateSchema = habitCreateSchema.partial();
export type HabitUpdateInput = z.infer<typeof habitUpdateSchema>;

/** §39 medical-safety keyword heuristic — shows the neutral warning on create (does not block). */
const MEDICAL_KEYWORDS = ["таблет", "лекар", "препарат", "доза", "инсулин", "антибиотик", "капел", "спрей"];
export const isMedicalHint = (title: string): boolean => {
  const lower = title.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
};

export const MEDICAL_WARNING_TEXT =
  "Flowly помогает фиксировать выбранное вами расписание, но не предоставляет медицинских рекомендаций. Для критически важных лекарств используйте также надёжное системное напоминание.";
