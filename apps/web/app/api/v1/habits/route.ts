import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { habitCreateSchema } from "@/features/rhythm/model/habits";

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
const DAY_LABELS = ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const scheduleLabel = (rule?: { ruleType: string; configurationJson: string }) => {
  if (!rule) return "Расписание не настроено";
  try {
    const config = JSON.parse(rule.configurationJson) as { target?: number; time?: string; every?: number; unit?: "hours" | "days" | "weeks"; anchorLocalDate?: string; anchorLocalTime?: string; times?: string[]; days?: number[]; timesByDay?: Record<string, string[]> };
    if (rule.ruleType === "exact_times") return `Каждый день · ${(config.times ?? []).join(" и ")}`;
    if (rule.ruleType === "weekly_target") {
      const days = (config.days ?? []).map((day) => DAY_LABELS[day]).filter(Boolean).join(", ");
      return [`${config.target ?? 0} раз в неделю`, days, config.time].filter(Boolean).join(" · ");
    }
    if (rule.ruleType === "interval") {
      const units = { hours: "ч", days: "дн", weeks: "нед" };
      return [`Каждые ${config.every ?? 0} ${config.unit ? units[config.unit] : ""}`, `${config.anchorLocalDate ?? ""} ${config.anchorLocalTime ?? ""}`.trim()].filter(Boolean).join(" · ");
    }
    const days = (config.days ?? []).map((day) => DAY_LABELS[day]).filter(Boolean).join(", ");
    const times = [...new Set(Object.values(config.timesByDay ?? {}).flat())].sort().join(" и ");
    return [days, times].filter(Boolean).join(" · ") || "Расписание не настроено";
  } catch { return "Расписание не настроено"; }
};

/** GET /api/v1/habits — owner's active habits (§44.7). todayDone/todayTotal/streak are 0 until schedule(T03/T04)+occurrences(T07). */
export async function GET(request: Request) {
  const userId = await getSessionUserId(request);
  if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.habits)
      .where(and(eq(schema.habits.ownerId, userId), eq(schema.habits.status, "active")))
      .orderBy(asc(schema.habits.createdAt));
    const rules = rows.length ? await db.select({ habitId: schema.habitScheduleRules.habitId, ruleType: schema.habitScheduleRules.ruleType, configurationJson: schema.habitScheduleRules.configurationJson }).from(schema.habitScheduleRules).where(and(inArray(schema.habitScheduleRules.habitId, rows.map((row) => row.id)), isNull(schema.habitScheduleRules.validUntil))) : [];
    const rulesByHabit = new Map(rules.map((rule) => [rule.habitId, rule]));
    return json({
      habits: rows.map((row) => ({
        id: row.id,
        title: row.title,
        icon: row.icon,
        color: row.color,
        emoji: row.emoji,
        status: row.status,
        startLocalDate: row.startLocalDate,
        allowSkip: Boolean(row.allowSkip),
        todayDone: 0,
        todayTotal: 0,
        nextDueLabel: null,
        scheduleLabel: scheduleLabel(rulesByHabit.get(row.id)),
        streak: 0,
      })),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    return json({ habits: [], explanation: "Habits unavailable in this environment." }, { status: 200 });
  }
}

/** POST /api/v1/habits — create a private habit (§22, §8.4 privacy by default). Schedule/policy land in T03/T04/T06. */
export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return json({ error: "unauthorized" }, { status: 401 });

  const parsed = habitCreateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;
  if (input.endLocalDate && input.endLocalDate < input.startLocalDate) {
    return json({ error: "bad_end_date", message: "Дата окончания раньше даты начала." }, { status: 400 });
  }

  const id = generateId();
  const now = nowIso();
  const db = getDb();
  try {
    await db.insert(schema.habits).values({
      id,
      ownerId: userId,
      title: input.title,
      description: input.description ?? null,
      icon: input.icon,
      color: input.color,
      emoji: input.emoji ?? null,
      startLocalDate: input.startLocalDate,
      endLocalDate: input.endLocalDate ?? null,
      allowSkip: input.allowSkip ?? true,
      allowRest: false,
      commentEnabled: true,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    audit("habit.create.error", { userId, error: String(error).slice(0, 200) });
    throw error;
  }
  audit("habit.create", { userId, habitId: id });
  const row = (await db.select().from(schema.habits).where(eq(schema.habits.id, id)).limit(1))[0];
  return json({ habit: row }, { status: 201 });
}
