import type { CalendarItem } from "./query";
import { addDays, eachDate, startOfWeekMonday } from "./dates";

export type StreakResult = {
  current: number;
  best: number;
  currentStart: string | null;
  bestEnd: string | null;
};

const SUCCESS = new Set(["completed"]);
const BREAK = new Set(["skipped", "no_response", "partial", "partially_completed"]);
const NEUTRAL = new Set(["rest"]);

function dayKind(items: CalendarItem[]): "success" | "break" | "neutral" | "empty" {
  if (items.length === 0) return "empty";
  const active = items.filter((i) => !NEUTRAL.has(i.status));
  if (active.length === 0) return "neutral";
  if (active.every((i) => SUCCESS.has(i.status))) return "success";
  if (active.some((i) => BREAK.has(i.status))) return "break";
  if (active.some((i) => ["scheduled", "due", "notified", "snoozed"].includes(i.status))) return "empty";
  return "break";
}

export function computeDailyStreak(items: CalendarItem[], today: string): StreakResult {
  const byDate = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const list = byDate.get(item.scheduledLocalDate) ?? [];
    list.push(item);
    byDate.set(item.scheduledLocalDate, list);
  }
  const dates = [...byDate.keys()].sort();
  if (dates.length === 0) return { current: 0, best: 0, currentStart: null, bestEnd: null };

  let best = 0;
  let bestEnd: string | null = null;
  let run = 0;
  for (const date of eachDate(dates[0]!, today)) {
    const kind = dayKind(byDate.get(date) ?? []);
    if (kind === "empty" || kind === "neutral") continue;
    if (kind === "success") {
      run += 1;
      if (run > best) {
        best = run;
        bestEnd = date;
      }
    } else run = 0;
  }

  let current = 0;
  let currentStart: string | null = null;
  let cursor = today;
  if (dayKind(byDate.get(today) ?? []) === "empty") cursor = addDays(today, -1);
  for (;;) {
    const kind = dayKind(byDate.get(cursor) ?? []);
    if (kind === "empty") break;
    if (kind === "neutral") {
      cursor = addDays(cursor, -1);
      continue;
    }
    if (kind === "success") {
      current += 1;
      currentStart = cursor;
      cursor = addDays(cursor, -1);
      continue;
    }
    break;
  }
  return { current, best: Math.max(best, current), currentStart, bestEnd: bestEnd ?? (current > 0 ? today : null) };
}

export function computeWeeklyTargetStreak(items: CalendarItem[], today: string, target: number): StreakResult {
  const byWeek = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const week = startOfWeekMonday(item.scheduledLocalDate);
    const list = byWeek.get(week) ?? [];
    list.push(item);
    byWeek.set(week, list);
  }
  const weeks = [...byWeek.keys()].sort();
  let best = 0;
  let bestEnd: string | null = null;
  let run = 0;
  for (const w of weeks) {
    const completed = (byWeek.get(w) ?? []).filter((x) => x.status === "completed").length;
    if (completed >= target) {
      run += 1;
      if (run > best) {
        best = run;
        bestEnd = w;
      }
    } else run = 0;
  }

  let current = 0;
  let currentStart: string | null = null;
  let weekCursor = startOfWeekMonday(today);
  for (let i = 0; i < 52; i += 1) {
    const list = byWeek.get(weekCursor) ?? [];
    if (list.length === 0) break;
    const completed = list.filter((x) => x.status === "completed").length;
    if (completed >= target) {
      current += 1;
      currentStart = weekCursor;
      weekCursor = addDays(weekCursor, -7);
      continue;
    }
    break;
  }
  return { current, best: Math.max(best, current), currentStart, bestEnd };
}
