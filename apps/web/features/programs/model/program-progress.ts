import { differenceInCalendarDays, parseISO } from "date-fns";

/** planned rest = type rest; user_rest = workout day marked rest; skipped ≠ rest. */
export type DayProgressState =
  | "completed"
  | "skipped"
  | "user_rest"
  | "today"
  | "upcoming"
  | "missed"
  | "rest"
  | "rest_today";

const DONE = new Set(["completed", "partial"]);

export const currentDayNumber = (startLocalDate: string, todayLocalDate: string, durationDays: number) => {
  const delta = differenceInCalendarDays(parseISO(todayLocalDate), parseISO(startLocalDate));
  if (delta < 0) return 0;
  if (delta >= durationDays) return durationDays;
  return delta + 1;
};

export const dayProgressState = (
  type: string,
  scheduledLocalDate: string,
  todayLocalDate: string,
  flags: { done?: boolean; skipped?: boolean; userRest?: boolean } = {},
): DayProgressState => {
  if (type === "rest") return scheduledLocalDate === todayLocalDate ? "rest_today" : "rest";
  if (flags.done) return "completed";
  if (flags.skipped) return "skipped";
  if (flags.userRest) return "user_rest";
  if (scheduledLocalDate === todayLocalDate) return "today";
  if (scheduledLocalDate > todayLocalDate) return "upcoming";
  return "missed";
};

export const isWorkoutDoneStatus = (status: string) => DONE.has(status);
export const isWorkoutSkippedStatus = (status: string) => status === "skipped";
export const isWorkoutUserRestStatus = (status: string) => status === "rest";

export const DAY_STATE_LABEL: Record<DayProgressState, string> = {
  completed: "Сделано",
  skipped: "Пропущено",
  user_rest: "Отдыхаю",
  today: "Сегодня",
  upcoming: "Скоро",
  missed: "Не отмечено",
  rest: "Отдых",
  rest_today: "Отдых",
};
