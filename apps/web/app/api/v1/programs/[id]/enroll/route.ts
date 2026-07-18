import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { isLocalDate } from "@/features/programs/model/program-dates";

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request); if (oversized) return oversized;
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { id: programId } = await params;
  const body = await request.json().catch(() => ({})) as { startLocalDate?: string };
  const startLocalDate = body.startLocalDate?.trim() ?? "";
  if (!isLocalDate(startLocalDate)) return json({ error: "bad_start_date", message: "Укажите дату начала в формате ГГГГ-ММ-ДД." }, { status: 400 });

  const db = getDb();
  const program = (await db.select().from(schema.programs).where(eq(schema.programs.id, programId)).limit(1))[0];
  if (!program) return json({ error: "not_found", message: "Программа не найдена." }, { status: 404 });

  const existing = (await db.select().from(schema.programEnrollments).where(and(eq(schema.programEnrollments.userId, userId), eq(schema.programEnrollments.programId, programId), eq(schema.programEnrollments.status, "active"))).limit(1))[0];
  if (existing) {
    audit("program.enroll", { userId, programId, enrollmentId: existing.id, created: false });
    return json({ created: false, enrollment: { id: existing.id, programId: existing.programId, startLocalDate: existing.startLocalDate, status: existing.status, createdAt: existing.createdAt } });
  }

  const id = generateId(), createdAt = nowIso();
  try {
    await db.insert(schema.programEnrollments).values({
      id,
      programId,
      userId,
      startLocalDate,
      reminderPolicyId: null,
      reminderLocalTime: null,
      status: "active",
      createdAt,
      completedAt: null,
    });
  } catch (error) {
    const raced = (await db.select().from(schema.programEnrollments).where(and(eq(schema.programEnrollments.userId, userId), eq(schema.programEnrollments.programId, programId), eq(schema.programEnrollments.status, "active"))).limit(1))[0];
    if (raced) return json({ created: false, enrollment: { id: raced.id, programId: raced.programId, startLocalDate: raced.startLocalDate, status: raced.status, createdAt: raced.createdAt } });
    throw error;
  }
  audit("program.enroll", { userId, programId, enrollmentId: id, created: true, startLocalDate });
  return json({ created: true, enrollment: { id, programId, startLocalDate, status: "active", createdAt } }, { status: 201 });
}
