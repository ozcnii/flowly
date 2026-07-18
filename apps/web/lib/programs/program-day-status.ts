import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { getUser } from "@/lib/auth/users";
import { localDateInTimezone, scheduleLocalDate } from "@/features/programs/model/program-dates";
import { isWorkoutDoneStatus } from "@/features/programs/model/program-progress";

export type ProgramDayTerminal = "skipped" | "rest";

const SOURCE: Record<ProgramDayTerminal, string> = { skipped: "program_skip", rest: "program_rest" };
const MSG = {
  skipped: { not_workout: "Пропустить можно только день с практикой.", future: "Нельзя пропустить будущий день.", conflict: "День уже отмечен отдыхом." },
  rest: { not_workout: "Отдых отмечают только в день с практикой.", future: "Нельзя отметить отдых на будущий день.", conflict: "День уже отмечен пропуском." },
} as const;

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

/** Write terminal skip/rest for a program workout day. Never mutates startLocalDate / day map. */
export async function postProgramDayTerminal(
  db: Database,
  userId: string,
  enrollmentId: string,
  dayNumber: number,
  status: ProgramDayTerminal,
) {
  if (!Number.isInteger(dayNumber) || dayNumber < 1) return json({ error: "bad_day", message: "Укажите номер дня программы." }, { status: 400 });

  const enrollment = (await db.select().from(schema.programEnrollments).where(and(eq(schema.programEnrollments.id, enrollmentId), eq(schema.programEnrollments.userId, userId))).limit(1))[0];
  if (!enrollment) return json({ error: "not_found", message: "Прохождение не найдено." }, { status: 404 });
  if (enrollment.status !== "active") return json({ error: "not_active", message: "Прохождение не активно." }, { status: 409 });

  const program = (await db.select().from(schema.programs).where(eq(schema.programs.id, enrollment.programId)).limit(1))[0];
  if (!program) return json({ error: "not_found", message: "Программа не найдена." }, { status: 404 });
  if (dayNumber > program.durationDays) return json({ error: "bad_day", message: "День вне программы." }, { status: 400 });

  const day = (await db.select().from(schema.programDays).where(and(eq(schema.programDays.programId, program.id), eq(schema.programDays.dayNumber, dayNumber))).limit(1))[0];
  if (!day) return json({ error: "not_found", message: "День не найден." }, { status: 404 });
  if (day.type !== "workout" || !day.workoutId) return json({ error: "not_workout", message: MSG[status].not_workout }, { status: 400 });

  const user = await getUser(db, userId);
  const timezone = user?.timezone ?? "Europe/Moscow";
  const todayLocalDate = localDateInTimezone(timezone);
  const scheduledLocalDate = scheduleLocalDate(enrollment.startLocalDate, dayNumber);
  if (scheduledLocalDate > todayLocalDate) return json({ error: "future_day", message: MSG[status].future }, { status: 400 });

  const existing = await db.select().from(schema.activityOccurrences).where(and(
    eq(schema.activityOccurrences.userId, userId),
    eq(schema.activityOccurrences.entityType, "workout"),
    eq(schema.activityOccurrences.entityId, day.workoutId),
    eq(schema.activityOccurrences.scheduledLocalDate, scheduledLocalDate),
  ));
  const done = existing.find((row) => isWorkoutDoneStatus(row.status));
  if (done) return json({ error: "already_done", message: "День уже отмечен выполненным.", occurrence: { id: done.id, status: done.status, scheduledLocalDate } }, { status: 409 });

  const same = existing.find((row) => row.status === status);
  if (same) {
    return json({
      created: false,
      startLocalDate: enrollment.startLocalDate,
      scheduledLocalDate,
      occurrence: { id: same.id, status: same.status, scheduledLocalDate },
    });
  }

  const other: ProgramDayTerminal = status === "skipped" ? "rest" : "skipped";
  const conflict = existing.find((row) => row.status === other);
  if (conflict) return json({ error: "status_conflict", message: MSG[status].conflict, occurrence: { id: conflict.id, status: conflict.status, scheduledLocalDate } }, { status: 409 });

  const occurrenceId = generateId(), historyId = generateId(), ts = nowIso(), source = SOURCE[status];
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
    status,
    completedAt: ts,
    durationSeconds: 0,
    source,
    createdAt: ts,
    updatedAt: ts,
  });
  await db.insert(schema.statusHistory).values({
    id: historyId,
    occurrenceId,
    oldStatus: null,
    newStatus: status,
    changedByUserId: userId,
    source,
    comment: null,
    createdAt: ts,
  });

  return json({
    created: true,
    startLocalDate: enrollment.startLocalDate,
    scheduledLocalDate,
    occurrence: { id: occurrenceId, status, scheduledLocalDate },
  }, { status: 201 });
}
