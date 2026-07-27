import { NextResponse } from "next/server";
import { localDateInTimezone } from "@flowly/core";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { getDb } from "@/lib/cloudflare";
import { filterItems, loadCalendarItems } from "@/lib/calendar/query";

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
  const items = filterItems(await loadCalendarItems(db, userId, dateParam, dateParam), filter);
  return NextResponse.json({
    date: dateParam,
    timezone: user.timezone,
    filter,
    items,
    summary: {
      total: items.length,
      completed: items.filter((i) => i.status === "completed").length,
      pending: items.filter((i) => ["scheduled", "due", "notified", "snoozed"].includes(i.status)).length,
    },
  });
}
