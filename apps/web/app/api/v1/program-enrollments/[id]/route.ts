import { and, asc, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { getDb } from "@/lib/cloudflare";
import { localDateInTimezone, scheduleLocalDate } from "@/features/programs/model/program-dates";
import { currentDayNumber, dayProgressState, isWorkoutDoneStatus } from "@/features/programs/model/program-progress";

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
  const todayLocalDate = localDateInTimezone(user?.timezone ?? "Europe/Moscow");
  const endLocalDate = scheduleLocalDate(enrollment.startLocalDate, program.durationDays);

  const occurrences = await db.select({
    entityId: schema.activityOccurrences.entityId,
    scheduledLocalDate: schema.activityOccurrences.scheduledLocalDate,
    status: schema.activityOccurrences.status,
  }).from(schema.activityOccurrences).where(and(
    eq(schema.activityOccurrences.userId, userId),
    eq(schema.activityOccurrences.entityType, "workout"),
    gte(schema.activityOccurrences.scheduledLocalDate, enrollment.startLocalDate),
    lte(schema.activityOccurrences.scheduledLocalDate, endLocalDate),
  ));

  const doneKeys = new Set(
    occurrences.filter((row) => isWorkoutDoneStatus(row.status)).map((row) => `${row.entityId}|${row.scheduledLocalDate}`),
  );

  let completedWorkoutDays = 0;
  let totalWorkoutDays = 0;
  let todayWorkoutId: string | null = null;

  const mapped = days.map((day) => {
    const scheduledLocalDate = scheduleLocalDate(enrollment.startLocalDate, day.dayNumber);
    const workoutDone = Boolean(day.workoutId && doneKeys.has(`${day.workoutId}|${scheduledLocalDate}`));
    if (day.type === "workout") {
      totalWorkoutDays += 1;
      if (workoutDone) completedWorkoutDays += 1;
    }
    const state = dayProgressState(day.type, scheduledLocalDate, todayLocalDate, workoutDone);
    if (state === "today" && day.workoutId && !workoutDone) todayWorkoutId = day.workoutId;
    return {
      id: day.id,
      dayNumber: day.dayNumber,
      type: day.type,
      title: day.title,
      description: day.description,
      workoutId: day.workoutId,
      scheduledLocalDate,
      state,
      done: workoutDone || day.type === "rest" && scheduledLocalDate <= todayLocalDate,
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
      todayLocalDate,
      progress: {
        currentDayNumber: current,
        durationDays: program.durationDays,
        completedWorkoutDays,
        totalWorkoutDays,
        percent: totalWorkoutDays ? Math.round(completedWorkoutDays / totalWorkoutDays * 100) : 0,
        todayWorkoutId,
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
