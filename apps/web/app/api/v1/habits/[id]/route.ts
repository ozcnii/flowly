import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { habitUpdateSchema } from "@/features/rhythm/model/habits";

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

/** Load an active/paused habit owned by the user. Archived or foreign rows → 404 (do not reveal existence). */
async function loadOwned(db: ReturnType<typeof getDb>, id: string, userId: string) {
  return (await db
    .select()
    .from(schema.habits)
    .where(and(eq(schema.habits.id, id), eq(schema.habits.ownerId, userId)))
    .limit(1))[0];
}

/** GET /api/v1/habits/[id] — owner detail (§44.7). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId(request);
  if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const row = await loadOwned(db, id, userId);
  if (!row || row.status === "archived") return json({ error: "not_found" }, { status: 404 });
  return json({ habit: row });
}

/** PATCH /api/v1/habits/[id] — edit (§44.7, ownership). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  const parsed = habitUpdateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });
  const input = parsed.data;
  if (input.endLocalDate && input.startLocalDate && input.endLocalDate < input.startLocalDate) {
    return json({ error: "bad_end_date", message: "Дата окончания раньше даты начала." }, { status: 400 });
  }

  const db = getDb();
  const existing = await loadOwned(db, id, userId);
  if (!existing || existing.status === "archived") return json({ error: "not_found" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: nowIso() };
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description ?? null;
  if (input.icon !== undefined) patch.icon = input.icon;
  if (input.color !== undefined) patch.color = input.color;
  if (input.startLocalDate !== undefined) patch.startLocalDate = input.startLocalDate;
  if (input.endLocalDate !== undefined) patch.endLocalDate = input.endLocalDate ?? null;
  if (input.allowSkip !== undefined) patch.allowSkip = input.allowSkip;

  await db.update(schema.habits).set(patch).where(eq(schema.habits.id, id));
  audit("habit.update", { userId, habitId: id });
  const row = (await db.select().from(schema.habits).where(eq(schema.habits.id, id)).limit(1))[0];
  return json({ habit: row });
}

/** DELETE /api/v1/habits/[id] — archive (DEC-017: delete archives; real cleanup is stage 8). */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const existing = await loadOwned(db, id, userId);
  if (!existing || existing.status === "archived") return json({ error: "not_found" }, { status: 404 });
  await db.update(schema.habits).set({ status: "archived", updatedAt: nowIso() }).where(eq(schema.habits.id, id));
  audit("habit.archive", { userId, habitId: id });
  return json({ archived: true });
}
