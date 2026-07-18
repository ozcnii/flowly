import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { getDb } from "@/lib/cloudflare";
import { isLocalDate } from "@/features/programs/model/program-dates";
import { ensureProgramOccurrences } from "@/lib/programs/ensure-program-occurrences";
import {
  ensureProgramReminderJobs,
  PROGRAM_DEFAULT_POLICY_ID,
  PROGRAM_DEFAULT_REMINDER_LOCAL_TIME,
} from "@/lib/programs/ensure-program-reminder-jobs";

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

async function materializeEnrollment(
  db: ReturnType<typeof getDb>,
  input: {
    userId: string;
    enrollmentId: string;
    startLocalDate: string;
    timezone: string;
    days: { id: string; dayNumber: number; type: string; workoutId: string | null }[];
    policyId: string | null;
    reminderLocalTime: string | null;
  },
) {
  const occurrences = await ensureProgramOccurrences(db, {
    userId: input.userId,
    enrollmentId: input.enrollmentId,
    startLocalDate: input.startLocalDate,
    timezone: input.timezone,
    days: input.days,
  });
  const jobs = await ensureProgramReminderJobs(db, {
    userId: input.userId,
    enrollmentId: input.enrollmentId,
    timezone: input.timezone,
    policyId: input.policyId,
    reminderLocalTime: input.reminderLocalTime,
  });
  return { occurrences, jobs };
}

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
  const days = await db.select().from(schema.programDays).where(eq(schema.programDays.programId, programId)).orderBy(asc(schema.programDays.dayNumber));
  const user = await getUser(db, userId);
  const timezone = user?.timezone ?? "Europe/Moscow";

  const existing = (await db.select().from(schema.programEnrollments).where(and(eq(schema.programEnrollments.userId, userId), eq(schema.programEnrollments.programId, programId), eq(schema.programEnrollments.status, "active"))).limit(1))[0];
  if (existing) {
    const materialize = await materializeEnrollment(db, {
      userId,
      enrollmentId: existing.id,
      startLocalDate: existing.startLocalDate,
      timezone,
      days,
      policyId: existing.reminderPolicyId,
      reminderLocalTime: existing.reminderLocalTime,
    });
    audit("program.enroll", { userId, programId, enrollmentId: existing.id, created: false, jobs: materialize.jobs });
    return json({
      created: false,
      enrollment: { id: existing.id, programId: existing.programId, startLocalDate: existing.startLocalDate, status: existing.status, createdAt: existing.createdAt },
      ...materialize,
    });
  }

  const id = generateId(), createdAt = nowIso();
  const policyId = PROGRAM_DEFAULT_POLICY_ID;
  const reminderLocalTime = PROGRAM_DEFAULT_REMINDER_LOCAL_TIME;
  try {
    await db.insert(schema.programEnrollments).values({
      id,
      programId,
      userId,
      startLocalDate,
      reminderPolicyId: policyId,
      reminderLocalTime,
      status: "active",
      createdAt,
      completedAt: null,
    });
  } catch (error) {
    const raced = (await db.select().from(schema.programEnrollments).where(and(eq(schema.programEnrollments.userId, userId), eq(schema.programEnrollments.programId, programId), eq(schema.programEnrollments.status, "active"))).limit(1))[0];
    if (raced) {
      const materialize = await materializeEnrollment(db, {
        userId,
        enrollmentId: raced.id,
        startLocalDate: raced.startLocalDate,
        timezone,
        days,
        policyId: raced.reminderPolicyId,
        reminderLocalTime: raced.reminderLocalTime,
      });
      return json({
        created: false,
        enrollment: { id: raced.id, programId: raced.programId, startLocalDate: raced.startLocalDate, status: raced.status, createdAt: raced.createdAt },
        ...materialize,
      });
    }
    throw error;
  }
  const materialize = await materializeEnrollment(db, {
    userId,
    enrollmentId: id,
    startLocalDate,
    timezone,
    days,
    policyId,
    reminderLocalTime,
  });
  audit("program.enroll", { userId, programId, enrollmentId: id, created: true, startLocalDate, jobs: materialize.jobs });
  return json({
    created: true,
    enrollment: { id, programId, startLocalDate, status: "active", createdAt, reminderPolicyId: policyId, reminderLocalTime },
    ...materialize,
  }, { status: 201 });
}
