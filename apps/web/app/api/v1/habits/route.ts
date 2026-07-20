import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { habitCreateSchema } from "@/features/rhythm/model/habits";

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

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
    return json({
      habits: rows.map((row) => ({
        id: row.id,
        title: row.title,
        icon: row.icon,
        color: row.color,
        status: row.status,
        startLocalDate: row.startLocalDate,
        allowSkip: Boolean(row.allowSkip),
        todayDone: 0,
        todayTotal: 0,
        nextDueLabel: null,
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
