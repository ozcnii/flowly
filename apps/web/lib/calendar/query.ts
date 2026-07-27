import { and, asc, eq, gte, lte, inArray } from "drizzle-orm";
import { schema, type Database } from "@flowly/database";
import { eachDate } from "./dates";

export type CalendarItem = {
  id: string;
  entityType: "habit" | "workout";
  entityId: string;
  title: string;
  scheduledLocalDate: string;
  scheduledLocalTime: string;
  timezone: string;
  scheduledAtUtc: string;
  status: string;
  durationSeconds: number;
  source: string;
  /** DEC-063: workout source_type → display source */
  activitySource: "flowly" | "youtube" | "user" | null;
  icon: string | null;
  color: string | null;
  emoji: string | null;
  completedAt: string | null;
};

export type CalendarDayCell = {
  date: string;
  items: CalendarItem[];
  counts: { total: number; completed: number; pending: number; rest: number; skipped: number; noResponse: number; partial: number };
};

const PENDING = new Set(["scheduled", "due", "notified", "snoozed"]);

const emptyCounts = () => ({ total: 0, completed: 0, pending: 0, rest: 0, skipped: 0, noResponse: 0, partial: 0 });

const tally = (items: CalendarItem[]) =>
  items.reduce((c, item) => {
    c.total += 1;
    if (item.status === "completed") c.completed += 1;
    else if (item.status === "partial" || item.status === "partially_completed") c.partial += 1;
    else if (item.status === "rest") c.rest += 1;
    else if (item.status === "skipped") c.skipped += 1;
    else if (item.status === "no_response") c.noResponse += 1;
    else if (PENDING.has(item.status)) c.pending += 1;
    return c;
  }, emptyCounts());

export async function loadCalendarItems(
  db: Database,
  userId: string,
  from: string,
  to: string,
  filters?: { entityType?: "habit" | "workout"; habitId?: string; status?: string },
): Promise<CalendarItem[]> {
  const conditions = [
    eq(schema.activityOccurrences.userId, userId),
    gte(schema.activityOccurrences.scheduledLocalDate, from),
    lte(schema.activityOccurrences.scheduledLocalDate, to),
  ];
  if (filters?.entityType) conditions.push(eq(schema.activityOccurrences.entityType, filters.entityType));
  if (filters?.habitId) {
    conditions.push(eq(schema.activityOccurrences.entityType, "habit"));
    conditions.push(eq(schema.activityOccurrences.entityId, filters.habitId));
  }
  if (filters?.status) conditions.push(eq(schema.activityOccurrences.status, filters.status));

  const rows = await db
    .select()
    .from(schema.activityOccurrences)
    .where(and(...conditions))
    .orderBy(asc(schema.activityOccurrences.scheduledLocalDate), asc(schema.activityOccurrences.scheduledLocalTime));

  if (rows.length === 0) return [];

  const habitIds = [...new Set(rows.filter((r) => r.entityType === "habit").map((r) => r.entityId))];
  const workoutIds = [...new Set(rows.filter((r) => r.entityType === "workout").map((r) => r.entityId))];

  const habits =
    habitIds.length > 0
      ? await db.select().from(schema.habits).where(and(eq(schema.habits.ownerId, userId), inArray(schema.habits.id, habitIds)))
      : [];
  const workouts =
    workoutIds.length > 0 ? await db.select().from(schema.workouts).where(inArray(schema.workouts.id, workoutIds)) : [];

  const habitMap = new Map(habits.map((h) => [h.id, h]));
  const workoutMap = new Map(workouts.map((w) => [w.id, w]));

  return rows.map((row) => {
    if (row.entityType === "habit") {
      const h = habitMap.get(row.entityId);
      return {
        id: row.id,
        entityType: "habit" as const,
        entityId: row.entityId,
        title: h?.title ?? "Привычка",
        scheduledLocalDate: row.scheduledLocalDate,
        scheduledLocalTime: row.scheduledLocalTime,
        timezone: row.timezone,
        scheduledAtUtc: row.scheduledAtUtc,
        status: row.status,
        durationSeconds: row.durationSeconds,
        source: row.source,
        activitySource: null,
        icon: h?.icon ?? null,
        color: h?.color ?? null,
        emoji: h?.emoji ?? null,
        completedAt: row.completedAt,
      };
    }
    const w = workoutMap.get(row.entityId);
    const st = w?.sourceType;
    const activitySource = st === "youtube" || st === "user" || st === "flowly" ? st : st ? "flowly" : null;
    return {
      id: row.id,
      entityType: "workout" as const,
      entityId: row.entityId,
      title: w?.title ?? "Тренировка",
      scheduledLocalDate: row.scheduledLocalDate,
      scheduledLocalTime: row.scheduledLocalTime,
      timezone: row.timezone,
      scheduledAtUtc: row.scheduledAtUtc,
      status: row.status,
      durationSeconds: row.durationSeconds,
      source: row.source,
      activitySource,
      icon: "dumbbell",
      color: null,
      emoji: null,
      completedAt: row.completedAt,
    };
  });
}

export function groupByDay(items: CalendarItem[], from: string, to: string): CalendarDayCell[] {
  const map = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const list = map.get(item.scheduledLocalDate) ?? [];
    list.push(item);
    map.set(item.scheduledLocalDate, list);
  }
  return eachDate(from, to).map((date) => {
    const dayItems = map.get(date) ?? [];
    return { date, items: dayItems, counts: tally(dayItems) };
  });
}

export function filterItems(
  items: CalendarItem[],
  filter: "all" | "yoga" | "habits" | "completed" | "skipped" | "no_response",
): CalendarItem[] {
  if (filter === "all") return items;
  if (filter === "yoga") return items.filter((i) => i.entityType === "workout");
  if (filter === "habits") return items.filter((i) => i.entityType === "habit");
  if (filter === "completed") return items.filter((i) => i.status === "completed");
  if (filter === "skipped") return items.filter((i) => i.status === "skipped");
  if (filter === "no_response") return items.filter((i) => i.status === "no_response");
  return items;
}
