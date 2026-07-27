import type { CalendarItem } from "./query";
import { addDays, eachDate, endOfWeekSunday, startOfWeekMonday } from "./dates";

export type ReportSummary = {
  periodStart: string;
  periodEnd: string;
  partial: boolean;
  plannedWorkouts: number;
  completedWorkouts: number;
  partialWorkouts: number;
  rest: number;
  skipped: number;
  noResponse: number;
  totalDurationSeconds: number;
  habitSlotsPlanned: number;
  habitSlotsCompleted: number;
  habitCompletionPercent: number;
  habitsById: Record<string, { title: string; completed: number; planned: number }>;
  previous?: {
    completedWorkouts: number;
    habitCompletionPercent: number;
    totalDurationSeconds: number;
  };
};

const PAST = (date: string, today: string) => date <= today;

export function buildReport(
  items: CalendarItem[],
  periodStart: string,
  periodEnd: string,
  today: string,
  previousItems?: CalendarItem[],
): ReportSummary {
  const inPeriod = items.filter((i) => i.scheduledLocalDate >= periodStart && i.scheduledLocalDate <= periodEnd);
  const past = inPeriod.filter((i) => PAST(i.scheduledLocalDate, today));
  const workouts = past.filter((i) => i.entityType === "workout");
  const habits = past.filter((i) => i.entityType === "habit");

  const plannedWorkouts = workouts.length;
  const completedWorkouts = workouts.filter((i) => i.status === "completed").length;
  const partialWorkouts = workouts.filter((i) => i.status === "partial" || i.status === "partially_completed").length;
  const rest = past.filter((i) => i.status === "rest").length;
  const skipped = past.filter((i) => i.status === "skipped").length;
  const noResponse = past.filter((i) => i.status === "no_response").length;
  const totalDurationSeconds = past
    .filter((i) => i.status === "completed" || i.status === "partial" || i.status === "partially_completed")
    .reduce((s, i) => s + (i.durationSeconds || 0), 0);

  const habitSlotsPlanned = habits.length;
  const habitSlotsCompleted = habits.filter((i) => i.status === "completed").length;
  const habitCompletionPercent =
    habitSlotsPlanned === 0 ? 0 : Math.round((habitSlotsCompleted / habitSlotsPlanned) * 1000) / 10;

  const habitsById: ReportSummary["habitsById"] = {};
  for (const h of habits) {
    const row = habitsById[h.entityId] ?? { title: h.title, completed: 0, planned: 0 };
    row.planned += 1;
    if (h.status === "completed") row.completed += 1;
    habitsById[h.entityId] = row;
  }

  let previous: ReportSummary["previous"];
  if (previousItems) {
    const prevPast = previousItems.filter((i) => PAST(i.scheduledLocalDate, today));
    const pw = prevPast.filter((i) => i.entityType === "workout");
    const ph = prevPast.filter((i) => i.entityType === "habit");
    const pc = ph.filter((i) => i.status === "completed").length;
    previous = {
      completedWorkouts: pw.filter((i) => i.status === "completed").length,
      habitCompletionPercent: ph.length === 0 ? 0 : Math.round((pc / ph.length) * 1000) / 10,
      totalDurationSeconds: prevPast
        .filter((i) => i.status === "completed" || i.status === "partial" || i.status === "partially_completed")
        .reduce((s, i) => s + (i.durationSeconds || 0), 0),
    };
  }

  return {
    periodStart,
    periodEnd,
    partial: periodEnd >= today,
    plannedWorkouts,
    completedWorkouts,
    partialWorkouts,
    rest,
    skipped,
    noResponse,
    totalDurationSeconds,
    habitSlotsPlanned,
    habitSlotsCompleted,
    habitCompletionPercent,
    habitsById,
    previous,
  };
}

export function weekPeriod(date: string) {
  return { start: startOfWeekMonday(date), end: endOfWeekSunday(date) };
}

export function previousWeekPeriod(date: string) {
  const start = addDays(startOfWeekMonday(date), -7);
  return { start, end: addDays(start, 6) };
}

export function monthPeriod(date: string) {
  const [y, m] = date.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(y!, m!, 0)).getUTCDate();
  const end = `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { start, end };
}

export function previousMonthPeriod(date: string) {
  const [y, m] = date.split("-").map(Number);
  const pm = m === 1 ? 12 : m! - 1;
  const py = m === 1 ? y! - 1 : y!;
  return monthPeriod(`${py}-${String(pm).padStart(2, "0")}-15`);
}

export function heatMap(items: CalendarItem[], start: string, end: string): Record<string, number> {
  const map: Record<string, number> = {};
  for (const d of eachDate(start, end)) map[d] = 0;
  for (const i of items) {
    if (i.status === "completed") map[i.scheduledLocalDate] = (map[i.scheduledLocalDate] ?? 0) + 1;
  }
  return map;
}
