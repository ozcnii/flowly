import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { scheduleRuleSchema, normalizeSchedule } from "@/features/rhythm/model/schedule";
import { ensureHabitScheduleForToday } from "@/lib/habits/ensure-habit-schedule";

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
const owned = async (id: string, userId: string) => (await getDb().select({ id: schema.habits.id }).from(schema.habits).where(and(eq(schema.habits.id, id), eq(schema.habits.ownerId, userId), eq(schema.habits.status, "active"))).limit(1))[0];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId(request); if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params; if (!await owned(id, userId)) return json({ error: "not_found" }, { status: 404 });
  const rule = (await getDb().select().from(schema.habitScheduleRules).where(and(eq(schema.habitScheduleRules.habitId, id), isNull(schema.habitScheduleRules.validUntil))).orderBy(desc(schema.habitScheduleRules.createdAt)).limit(1))[0];
  return json({ schedule: rule ? { ...rule, configuration: JSON.parse(rule.configurationJson) } : null });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params; if (!await owned(id, userId)) return json({ error: "not_found" }, { status: 404 });
  const body = await request.json().catch(() => null); const parsed = scheduleRuleSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid_schedule", issues: parsed.error.flatten() }, { status: 400 });
  const rule = normalizeSchedule(parsed.data); const db = getDb(); const now = nowIso();
  const row = { id: generateId(), habitId: id, ruleType: rule.ruleType, configurationJson: JSON.stringify(rule.configuration), validFrom: rule.validFrom, validUntil: null, createdAt: now };
  await db.batch([
    db.update(schema.habitScheduleRules).set({ validUntil: now }).where(and(eq(schema.habitScheduleRules.habitId, id), isNull(schema.habitScheduleRules.validUntil))),
    db.insert(schema.habitScheduleRules).values(row),
  ]);
  await ensureHabitScheduleForToday(db, userId);
  return json({ schedule: { ...row, configuration: rule.configuration } });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params; if (!await owned(id, userId)) return json({ error: "not_found" }, { status: 404 });
  await getDb().update(schema.habitScheduleRules).set({ validUntil: nowIso() }).where(and(eq(schema.habitScheduleRules.habitId, id), isNull(schema.habitScheduleRules.validUntil)));
  return json({ deleted: true });
}
