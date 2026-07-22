import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request); if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = (await params).id, db = getDb();
  const habit = (await db.select().from(schema.habits).where(and(eq(schema.habits.id, id), eq(schema.habits.ownerId, userId))).limit(1))[0];
  if (!habit || habit.status === "archived") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (habit.status === "paused") return NextResponse.json({ habit, idempotent: true });
  const updatedAt = nowIso();
  await db.update(schema.habits).set({ status: "paused", updatedAt }).where(and(eq(schema.habits.id, id), eq(schema.habits.ownerId, userId), eq(schema.habits.status, "active")));
  const updated = (await db.select().from(schema.habits).where(eq(schema.habits.id, id)).limit(1))[0];
  audit("habit.pause", { userId, habitId: id });
  return NextResponse.json({ habit: updated, idempotent: false });
}
