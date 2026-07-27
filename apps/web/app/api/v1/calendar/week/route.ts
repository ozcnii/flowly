import { NextResponse } from "next/server";
import { localDateInTimezone } from "@flowly/core";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { getDb } from "@/lib/cloudflare";
import { endOfWeekSunday, startOfWeekMonday } from "@/lib/calendar/dates";
import { filterItems, groupByDay, loadCalendarItems } from "@/lib/calendar/query";

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
  const filter = (url.searchParams.get("filter") ?? "all") as "all" | "yoga" | "habits" | "completed" | "skipped" | "no_response";
  const start = startOfWeekMonday(dateParam);
  const end = endOfWeekSunday(dateParam);
  const items = filterItems(await loadCalendarItems(db, userId, start, end), filter);
  const days = groupByDay(items, start, end);
  return NextResponse.json({
    range: { start, end },
    timezone: user.timezone,
    filter,
    days,
    summary: {
      total: items.length,
      completed: items.filter((i) => i.status === "completed").length,
    },
  });
}
