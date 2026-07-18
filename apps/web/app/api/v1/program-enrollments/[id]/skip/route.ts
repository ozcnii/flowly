import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { getDb } from "@/lib/cloudflare";
import { localDateInTimezone, scheduleLocalDate } from "@/features/programs/model/program-dates";
import { isWorkoutDoneStatus } from "@/features/programs/model/program-progress";

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

/** Explicit skip of a program workout day. Does not mutate startLocalDate or day map (PRD §20.4). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request); if (oversized) return oversized;
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { id: enrollmentId } = await params;
  const body = await request.json().catch(() => ({})) as { dayNumber?: unknown };
  const dayNumber = typeof body.dayNumber === "number" ? body.dayNumber : Number(body.dayNumber);
  if (!Number.isInteger(dayNumber) || dayNumber < 1) return json({ error: "bad_day", message: "Укажите номер дня программы." }, { status: 400 });

  const db = getDb();
  const enrollment = (await db.select().from(schema.programEnrollments).where(and(eq(schema.programEnrollments.id, enrollmentId), eq(schema.programEnrollments.userId, userId))).limit(1))[0];
  if (!enrollment) return json({ error: "not_found", message: "Прохождение не найдено." }, { status: 404 });
  if (enrollment.status !== "active") return json({ error: "not_active", message: "Прохождение не активно." }, { status: 409 });

  const program = (await db.select().from(schema.programs).where(eq(schema.programs.id, enrollment.programId)).limit(1))[0];
  if (!program) return json({ error: "not_found", message: "Программа не найдена." }, { status: 404 });
  if (dayNumber > program.durationDays) return json({ error: "bad_day", message: "День вне программы." }, { status: 400 });

  const day = (await db.select().from(schema.programDays).where(and(eq(schema.programDays.programId, program.id), eq(schema.programDays.dayNumber, dayNumber))).limit(1))[0];
  if (!day) return json({ error: "not_found", message: "День не найден." }, { status: 404 });
  if (day.type !== "workout" || !day.workoutId) return json({ error: "not_workout", message: "Пропустить можно только день с практикой." }, { status: 400 });

  const user = await getUser(db, userId);
  const timezone = user?.timezone ?? "Europe/Moscow";
  const todayLocalDate = localDateInTimezone(timezone);
  const scheduledLocalDate = scheduleLocalDate(enrollment.startLocalDate, dayNumber);
  if (scheduledLocalDate > todayLocalDate) return json({ error: "future_day", message: "Нельзя пропустить будущий день." }, { status: 400 });

  const existing = await db.select().from(schema.activityOccurrences).where(and(
    eq(schema.activityOccurrences.userId, userId),
    eq(schema.activityOccurrences.entityType, "workout"),
    eq(schema.activityOccurrences.entityId, day.workoutId),
    eq(schema.activityOccurrences.scheduledLocalDate, scheduledLocalDate),
  ));
  const done = existing.find((row) => isWorkoutDoneStatus(row.status));
  if (done) return json({ error: "already_done", message: "День уже отмечен выполненным.", occurrence: { id: done.id, status: done.status, scheduledLocalDate } }, { status: 409 });
  const skipped = existing.find((row) => row.status === "skipped");
  if (skipped) {
    audit("program.skip", { userId, enrollmentId, dayNumber, occurrenceId: skipped.id, created: false });
    return json({
      created: false,
      startLocalDate: enrollment.startLocalDate,
      scheduledLocalDate,
      occurrence: { id: skipped.id, status: skipped.status, scheduledLocalDate },
    });
  }

  const occurrenceId = generateId(), historyId = generateId(), ts = nowIso();
  await db.insert(schema.activityOccurrences).values({
    id: occurrenceId,
    userId,
    entityType: "workout",
    entityId: day.workoutId,
    parentEntityId: enrollmentId,
    scheduledLocalDate,
    scheduledLocalTime: "00:00",
    timezone,
    scheduledAtUtc: ts,
    status: "skipped",
    completedAt: ts,
    durationSeconds: 0,
    source: "program_skip",
    createdAt: ts,
    updatedAt: ts,
  });
  await db.insert(schema.statusHistory).values({
    id: historyId,
    occurrenceId,
    oldStatus: null,
    newStatus: "skipped",
    changedByUserId: userId,
    source: "program_skip",
    comment: null,
    createdAt: ts,
  });

  audit("program.skip", { userId, enrollmentId, dayNumber, occurrenceId, created: true, scheduledLocalDate, startLocalDate: enrollment.startLocalDate });
  return json({
    created: true,
    startLocalDate: enrollment.startLocalDate,
    scheduledLocalDate,
    occurrence: { id: occurrenceId, status: "skipped" as const, scheduledLocalDate },
  }, { status: 201 });
}
