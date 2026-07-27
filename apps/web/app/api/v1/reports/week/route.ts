import { NextResponse } from "next/server";
import { localDateInTimezone } from "@flowly/core";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { getDb } from "@/lib/cloudflare";
import { loadCalendarItems } from "@/lib/calendar/query";
import { buildReport, previousWeekPeriod, weekPeriod } from "@/lib/calendar/reports";
import { computeDailyStreak } from "@/lib/calendar/streaks";
import { addDays } from "@/lib/calendar/dates";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDb();
  const user = await getUser(db, userId);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date") ?? localDateInTimezone(new Date(), user.timezone);
  if (!DATE.test(dateParam)) return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  const today = localDateInTimezone(new Date(), user.timezone);
  const { start, end } = weekPeriod(dateParam);
  const prev = previousWeekPeriod(dateParam);
  const items = await loadCalendarItems(db, userId, start, end);
  const prevItems = await loadCalendarItems(db, userId, prev.start, prev.end);
  const report = buildReport(items, start, end, today, prevItems);
  const streakItems = await loadCalendarItems(db, userId, addDays(today, -90), today, { entityType: "habit" });
  const streaks = computeDailyStreak(streakItems, today);
  return NextResponse.json({
    type: "week",
    timezone: user.timezone,
    report,
    streaks,
    summaryText: report.partial
      ? `Неделя ещё идёт: ${report.completedWorkouts} тренировок, привычки ${report.habitCompletionPercent}%.`
      : `Неделя: ${report.completedWorkouts} тренировок, привычки ${report.habitCompletionPercent}%, серия ${streaks.current}.`,
  });
}
