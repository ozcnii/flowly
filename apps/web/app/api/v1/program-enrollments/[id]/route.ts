import { and, asc, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { getDb } from "@/lib/cloudflare";
import { localDateInTimezone, scheduleLocalDate } from "@/features/programs/model/program-dates";
import {
  currentDayNumber,
  dayProgressState,
  isWorkoutDoneStatus,
  isWorkoutSkippedStatus,
  isWorkoutUserRestStatus,
} from "@/features/programs/model/program-progress";
import { ensureProgramOccurrences } from "@/lib/programs/ensure-program-occurrences";
import { ensureProgramReminderJobs } from "@/lib/programs/ensure-program-reminder-jobs";

const CATEGORY: Record<string, string> = {
  beginner: "Старт", back: "Спина", evening: "Вечер", morning: "Утро", mobility: "Мобильность", full: "Полный ритм",
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId(request); if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const enrollment = (await db.select().from(schema.programEnrollments).where(and(eq(schema.programEnrollments.id, id), eq(schema.programEnrollments.userId, userId))).limit(1))[0];
  if (!enrollment) return NextResponse.json({ error: "not_found", message: "Прохождение не найдено." }, { status: 404 });

  const program = (await db.select().from(schema.programs).where(eq(schema.programs.id, enrollment.programId)).limit(1))[0];
  if (!program) return NextResponse.json({ error: "not_found", message: "Программа не найдена." }, { status: 404 });
  const days = await db.select().from(schema.programDays).where(eq(schema.programDays.programId, program.id)).orderBy(asc(schema.programDays.dayNumber));
  const user = await getUser(db, userId);
  const timezone = user?.timezone ?? "Europe/Moscow";
  const todayLocalDate = localDateInTimezone(timezone);
  const endLocalDate = scheduleLocalDate(enrollment.startLocalDate, program.durationDays);

  await ensureProgramOccurrences(db, {
    userId,
    enrollmentId: enrollment.id,
    startLocalDate: enrollment.startLocalDate,
    timezone,
    days,
  });
  const reminders = await ensureProgramReminderJobs(db, {
    userId,
    enrollmentId: enrollment.id,
    timezone,
    policyId: enrollment.reminderPolicyId,
    reminderLocalTime: enrollment.reminderLocalTime,
  });

  const occurrences = await db.select({
    id: schema.activityOccurrences.id,
    entityType: schema.activityOccurrences.entityType,
    entityId: schema.activityOccurrences.entityId,
    scheduledLocalDate: schema.activityOccurrences.scheduledLocalDate,
    status: schema.activityOccurrences.status,
    parentEntityId: schema.activityOccurrences.parentEntityId,
    timezone: schema.activityOccurrences.timezone,
    scheduledAtUtc: schema.activityOccurrences.scheduledAtUtc,
  }).from(schema.activityOccurrences).where(and(
    eq(schema.activityOccurrences.userId, userId),
    gte(schema.activityOccurrences.scheduledLocalDate, enrollment.startLocalDate),
    lte(schema.activityOccurrences.scheduledLocalDate, endLocalDate),
  ));

  const workoutOcc = occurrences.filter((r) => r.entityType === "workout");
  const doneKeys = new Set(workoutOcc.filter((r) => isWorkoutDoneStatus(r.status)).map((r) => `${r.entityId}|${r.scheduledLocalDate}`));
  const skipKeys = new Set(workoutOcc.filter((r) => isWorkoutSkippedStatus(r.status)).map((r) => `${r.entityId}|${r.scheduledLocalDate}`));
  const restKeys = new Set(workoutOcc.filter((r) => isWorkoutUserRestStatus(r.status)).map((r) => `${r.entityId}|${r.scheduledLocalDate}`));
  const occByWorkoutKey = new Map(workoutOcc.map((r) => [`${r.entityId}|${r.scheduledLocalDate}`, r]));
  const occByProgramDay = new Map(occurrences.filter((r) => r.entityType === "program_day").map((r) => [`${r.entityId}|${r.scheduledLocalDate}`, r]));

  let completedWorkoutDays = 0;
  let totalWorkoutDays = 0;
  let plannedRestDays = 0;
  let userRestDays = 0;
  let skippedDays = 0;
  let todayWorkoutId: string | null = null;
  let todayDayNumber: number | null = null;
  let todayIsPlannedRest = false;

  const mapped = days.map((day) => {
    const scheduledLocalDate = scheduleLocalDate(enrollment.startLocalDate, day.dayNumber);
    const key = day.workoutId ? `${day.workoutId}|${scheduledLocalDate}` : "";
    const workoutDone = Boolean(key && doneKeys.has(key));
    const workoutSkipped = Boolean(key && !workoutDone && skipKeys.has(key));
    const workoutUserRest = Boolean(key && !workoutDone && !workoutSkipped && restKeys.has(key));
    const occ = day.type === "rest"
      ? occByProgramDay.get(`${day.id}|${scheduledLocalDate}`)
      : key ? occByWorkoutKey.get(key) : undefined;
    if (day.type === "rest") plannedRestDays += 1;
    if (day.type === "workout") {
      totalWorkoutDays += 1;
      if (workoutDone) completedWorkoutDays += 1;
      if (workoutSkipped) skippedDays += 1;
      if (workoutUserRest) userRestDays += 1;
    }
    const state = dayProgressState(day.type, scheduledLocalDate, todayLocalDate, {
      done: workoutDone,
      skipped: workoutSkipped,
      userRest: workoutUserRest,
    });
    if (state === "today" && day.workoutId) {
      todayWorkoutId = day.workoutId;
      todayDayNumber = day.dayNumber;
    }
    if (state === "rest_today") todayIsPlannedRest = true;
    const resolved = workoutDone || workoutSkipped || workoutUserRest || (day.type === "rest" && scheduledLocalDate <= todayLocalDate);
    return {
      id: day.id,
      dayNumber: day.dayNumber,
      type: day.type,
      title: day.title,
      description: day.description,
      workoutId: day.workoutId,
      scheduledLocalDate,
      state,
      done: resolved,
      skipped: workoutSkipped,
      userRest: workoutUserRest,
      canSkip: day.type === "workout" && Boolean(day.workoutId) && !resolved && scheduledLocalDate <= todayLocalDate,
      canRest: day.type === "workout" && Boolean(day.workoutId) && !resolved && scheduledLocalDate <= todayLocalDate,
      occurrenceId: occ?.id ?? null,
      occurrenceStatus: occ?.status ?? null,
      occurrenceTimezone: occ?.timezone ?? null,
      scheduledAtUtc: occ?.scheduledAtUtc ?? null,
    };
  });

  const current = currentDayNumber(enrollment.startLocalDate, todayLocalDate, program.durationDays);

  return NextResponse.json({
    enrollment: {
      id: enrollment.id,
      programId: enrollment.programId,
      startLocalDate: enrollment.startLocalDate,
      endLocalDate,
      status: enrollment.status,
      createdAt: enrollment.createdAt,
      completedAt: enrollment.completedAt,
      reminderPolicyId: enrollment.reminderPolicyId,
      reminderLocalTime: enrollment.reminderLocalTime,
      todayLocalDate,
      reminders: {
        pendingJobs: reminders.totalPending,
        policyId: reminders.policyId,
        reminderLocalTime: reminders.reminderLocalTime,
        delivery: reminders.delivery,
      },
      progress: {
        currentDayNumber: current,
        durationDays: program.durationDays,
        completedWorkoutDays,
        totalWorkoutDays,
        plannedRestDays,
        userRestDays,
        skippedDays,
        percent: totalWorkoutDays ? Math.round(completedWorkoutDays / totalWorkoutDays * 100) : 0,
        todayWorkoutId,
        todayDayNumber,
        todayIsPlannedRest,
      },
      program: {
        id: program.id,
        title: program.title,
        description: program.description,
        coverObjectKey: program.coverObjectKey,
        durationDays: program.durationDays,
        category: program.category,
        categoryLabel: CATEGORY[program.category] ?? program.category,
      },
      days: mapped,
    },
  });
}
