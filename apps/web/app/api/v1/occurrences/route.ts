import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { loadOwnedHabit } from "@/lib/habits/occurrence-status";
import { activeHabitShare } from "@/lib/shares/service";

const PENDING = new Set(["scheduled", "due", "notified", "snoozed"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const habitId = url.searchParams.get("habitId");
  const date = url.searchParams.get("date");
  if (date && !datePattern.test(date)) return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  const db = getDb();

  // Occurrence rows belong to habit owner. Friends may read when share toggles allow.
  let occurrenceUserId = userId;
  if (habitId) {
    const owned = await loadOwnedHabit(db, userId, habitId);
    if (!owned) {
      const share = await activeHabitShare(db, habitId, userId);
      if (!share || (!share.showHistory && !share.showStreak)) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      const habit = (
        await db.select().from(schema.habits).where(eq(schema.habits.id, habitId)).limit(1)
      )[0];
      if (!habit || habit.status === "archived") {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      occurrenceUserId = habit.ownerId;
    }
  }

  const conditions = [
    eq(schema.activityOccurrences.userId, occurrenceUserId),
    eq(schema.activityOccurrences.entityType, "habit"),
  ];
  if (habitId) conditions.push(eq(schema.activityOccurrences.entityId, habitId));
  if (date) conditions.push(eq(schema.activityOccurrences.scheduledLocalDate, date));
  const occurrences = await db
    .select()
    .from(schema.activityOccurrences)
    .where(and(...conditions))
    .orderBy(
      asc(schema.activityOccurrences.scheduledLocalDate),
      asc(schema.activityOccurrences.scheduledLocalTime),
    );
  const summary = occurrences.reduce(
    (result, occurrence) => {
      if (occurrence.status === "completed") result.completed += 1;
      else if (occurrence.status === "partial") result.partial += 1;
      else if (occurrence.status === "rest") result.rest += 1;
      else if (occurrence.status === "skipped") result.skipped += 1;
      else if (occurrence.status === "no_response") result.noResponse += 1;
      else if (PENDING.has(occurrence.status)) result.pending += 1;
      return result;
    },
    { total: occurrences.length, completed: 0, partial: 0, pending: 0, rest: 0, skipped: 0, noResponse: 0 },
  );
  return NextResponse.json({ occurrences, summary });
}
