import { differenceInCalendarDays, parseISO } from "date-fns";

export type DayProgressState = "completed" | "today" | "upcoming" | "missed" | "rest" | "rest_today";

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
  workoutDone: boolean,
): DayProgressState => {
  if (type === "rest") return scheduledLocalDate === todayLocalDate ? "rest_today" : "rest";
  if (workoutDone) return "completed";
  if (scheduledLocalDate === todayLocalDate) return "today";
  if (scheduledLocalDate > todayLocalDate) return "upcoming";
  return "missed";
};

export const isWorkoutDoneStatus = (status: string) => DONE.has(status);

export const DAY_STATE_LABEL: Record<DayProgressState, string> = {
  completed: "Сделано",
  today: "Сегодня",
  upcoming: "Скоро",
  missed: "Не отмечено",
  rest: "Отдых",
  rest_today: "Отдых",
};
