import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { scheduleLocalDate } from "@/features/programs/model/program-dates";

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

  const endLocalDate = scheduleLocalDate(enrollment.startLocalDate, program.durationDays);
  return NextResponse.json({
    enrollment: {
      id: enrollment.id,
      programId: enrollment.programId,
      startLocalDate: enrollment.startLocalDate,
      endLocalDate,
      status: enrollment.status,
      createdAt: enrollment.createdAt,
      completedAt: enrollment.completedAt,
      program: {
        id: program.id,
        title: program.title,
        description: program.description,
        coverObjectKey: program.coverObjectKey,
        durationDays: program.durationDays,
        category: program.category,
        categoryLabel: CATEGORY[program.category] ?? program.category,
      },
      days: days.map((day) => ({
        id: day.id,
        dayNumber: day.dayNumber,
        type: day.type,
        title: day.title,
        description: day.description,
        workoutId: day.workoutId,
        scheduledLocalDate: scheduleLocalDate(enrollment.startLocalDate, day.dayNumber),
      })),
    },
  });
}
