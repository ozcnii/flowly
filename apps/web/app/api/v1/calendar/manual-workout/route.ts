import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, localDateTimeToUtcIso, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { z } from "zod";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getUser } from "@/lib/auth/users";
import { getDb } from "@/lib/cloudflare";

const bodySchema = z.object({
  title: z.string().trim().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/).default("12:00"),
  durationMinutes: z.number().int().min(1).max(24 * 60).default(30),
  status: z.enum(["completed", "partial", "skipped", "rest"]).default("completed"),
  comment: z.string().trim().max(500).optional().nullable(),
});

/** POST /api/v1/calendar/manual-workout — E6-D7-T09 manual log (owner-only). */
export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request", issues: parsed.error.issues }, { status: 400 });

  const db = getDb();
  const user = await getUser(db, userId);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { title, date, time, durationMinutes, status, comment } = parsed.data;
  const ts = nowIso();
  const workoutId = generateId();
  const occurrenceId = generateId();
  const scheduledAtUtc = localDateTimeToUtcIso(date, time, user.timezone);

  // Explicit duplicate: same title+date+time for this user
  const existing = await db
    .select({ id: schema.activityOccurrences.id })
    .from(schema.activityOccurrences)
    .where(
      and(
        eq(schema.activityOccurrences.userId, userId),
        eq(schema.activityOccurrences.scheduledLocalDate, date),
        eq(schema.activityOccurrences.scheduledLocalTime, time),
        eq(schema.activityOccurrences.source, "manual"),
      ),
    )
    .limit(1);
  if (existing[0]) {
    return NextResponse.json({ error: "duplicate", occurrenceId: existing[0].id }, { status: 409 });
  }

  await db.insert(schema.workouts).values({
    id: workoutId,
    ownerId: userId,
    sourceType: "user",
    visibility: "private",
    title,
    description: comment?.trim() || "Ручная запись",
    coverObjectKey: null,
    youtubeVideoId: null,
    durationSeconds: durationMinutes * 60,
    difficulty: "beginner",
    equipment: "[]",
    contraindications: "[]",
    format: "mixed",
    status: "published",
    createdAt: ts,
    updatedAt: ts,
    publishedAt: ts,
  });

  await db.insert(schema.activityOccurrences).values({
    id: occurrenceId,
    userId,
    entityType: "workout",
    entityId: workoutId,
    parentEntityId: null,
    scheduledLocalDate: date,
    scheduledLocalTime: time,
    timezone: user.timezone,
    scheduledAtUtc,
    status,
    completedAt: status === "completed" || status === "partial" ? ts : null,
    durationSeconds: durationMinutes * 60,
    source: "manual",
    createdAt: ts,
    updatedAt: ts,
  });

  await db.insert(schema.statusHistory).values({
    id: generateId(),
    occurrenceId,
    oldStatus: null,
    newStatus: status,
    changedByUserId: userId,
    source: "manual_log",
    comment: comment?.trim() || null,
    createdAt: ts,
  });

  audit("calendar.manual_workout", { userId, occurrenceId, workoutId, date, status });
  return NextResponse.json({ occurrenceId, workoutId, date, time, status }, { status: 201 });
}
