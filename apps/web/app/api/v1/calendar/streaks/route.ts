import { NextResponse } from "next/server";
import { localDateInTimezone } from "@flowly/core";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { getDb } from "@/lib/cloudflare";
import { addDays } from "@/lib/calendar/dates";
import { loadCalendarItems } from "@/lib/calendar/query";
import { computeDailyStreak, computeWeeklyTargetStreak } from "@/lib/calendar/streaks";

export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDb();
  const user = await getUser(db, userId);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const today = localDateInTimezone(new Date(), user.timezone);
  const from = addDays(today, -120);
  const habits = await loadCalendarItems(db, userId, from, today, { entityType: "habit" });
  const yoga = await loadCalendarItems(db, userId, from, today, { entityType: "workout" });
  return NextResponse.json({
    timezone: user.timezone,
    asOf: today,
    habitsDaily: computeDailyStreak(habits, today),
    yoga: computeDailyStreak(yoga, today),
    habitsWeeklyGoal: computeWeeklyTargetStreak(habits, today, 3),
  });
}
