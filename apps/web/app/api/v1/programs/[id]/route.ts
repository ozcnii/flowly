import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { scheduleLocalDate } from "@/features/programs/model/program-dates";

const CATEGORY: Record<string, string> = {
  beginner: "Старт",
  back: "Спина",
  evening: "Вечер",
  morning: "Утро",
  mobility: "Мобильность",
  full: "Полный ритм",
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getSessionUserId(request).catch(() => null);
  try {
    const db = getDb();
    const program = (await db.select().from(schema.programs).where(eq(schema.programs.id, id)).limit(1))[0];
    if (!program) return NextResponse.json({ error: "not_found", message: "Программа не найдена." }, { status: 404 });

    const days = await db.select().from(schema.programDays).where(eq(schema.programDays.programId, id)).orderBy(asc(schema.programDays.dayNumber));
    const workoutIds = [...new Set(days.map((day) => day.workoutId).filter((value): value is string => Boolean(value)))];
    const workouts = workoutIds.length
      ? await db.select({ id: schema.workouts.id, title: schema.workouts.title, durationSeconds: schema.workouts.durationSeconds, format: schema.workouts.format, difficulty: schema.workouts.difficulty }).from(schema.workouts).where(inArray(schema.workouts.id, workoutIds))
      : [];
    const byId = new Map(workouts.map((workout) => [workout.id, workout]));

    const active = userId
      ? (await db.select().from(schema.programEnrollments).where(and(eq(schema.programEnrollments.userId, userId), eq(schema.programEnrollments.programId, id), eq(schema.programEnrollments.status, "active"))).limit(1))[0] ?? null
      : null;

    return NextResponse.json({
      program: {
        id: program.id,
        title: program.title,
        description: program.description,
        coverObjectKey: program.coverObjectKey,
        durationDays: program.durationDays,
        category: program.category,
        categoryLabel: CATEGORY[program.category] ?? program.category,
        isSystem: program.isSystem,
        days: days.map((day) => {
          const workout = day.workoutId ? byId.get(day.workoutId) : null;
          return {
            id: day.id,
            dayNumber: day.dayNumber,
            type: day.type as "workout" | "rest",
            title: day.title,
            description: day.description,
            scheduledLocalDate: active ? scheduleLocalDate(active.startLocalDate, day.dayNumber) : null,
            workout: workout ? { id: workout.id, title: workout.title, durationSeconds: workout.durationSeconds, format: workout.format, difficulty: workout.difficulty } : null,
          };
        }),
        activeEnrollment: active
          ? {
              id: active.id,
              startLocalDate: active.startLocalDate,
              endLocalDate: scheduleLocalDate(active.startLocalDate, program.durationDays),
              status: active.status,
            }
          : null,
        actions: {
          start: active
            ? { enabled: false, reason: "Вы уже проходите эту программу." }
            : { enabled: true, reason: "Выберите дату начала." },
        },
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    return NextResponse.json({ error: "unavailable", message: "Программа недоступна в этом окружении." }, { status: 503 });
  }
}
