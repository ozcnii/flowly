import { NextResponse } from "next/server";
import { localDateInTimezone } from "@flowly/core";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { getDb } from "@/lib/cloudflare";
import { addDays } from "@/lib/calendar/dates";
import { loadCalendarItems } from "@/lib/calendar/query";
import { buildReport, heatMap, monthPeriod, previousMonthPeriod } from "@/lib/calendar/reports";
import { computeDailyStreak } from "@/lib/calendar/streaks";

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
  const { start, end } = monthPeriod(dateParam);
  const prev = previousMonthPeriod(dateParam);
  const items = await loadCalendarItems(db, userId, start, end);
  const prevItems = await loadCalendarItems(db, userId, prev.start, prev.end);
  const report = buildReport(items, start, end, today, prevItems);
  const streakItems = await loadCalendarItems(db, userId, addDays(today, -120), today, { entityType: "habit" });
  const streaks = computeDailyStreak(streakItems, today);
  return NextResponse.json({
    type: "month",
    timezone: user.timezone,
    report,
    heatMap: heatMap(items, start, end),
    streaks,
    summaryText: report.partial
      ? `Месяц ещё идёт: ${report.completedWorkouts} тренировок, ${Math.round(report.totalDurationSeconds / 60)} мин.`
      : `Месяц: ${report.completedWorkouts} тренировок, привычки ${report.habitCompletionPercent}%, лучшая серия ${streaks.best}.`,
  });
}
