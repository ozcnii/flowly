import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getDb } from "@/lib/cloudflare";
import { getActiveSession, getExecutableWorkout, getOwnedSession, startSessionSchema } from "@/lib/workout-sessions";

export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request); if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = startSessionSchema.safeParse(await request.json().catch(() => ({}))); if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const db = getDb(), current = await getActiveSession(db, userId);
  if (current) return NextResponse.json({ error: "active_session", activeSession: current, requestedWorkoutId: parsed.data.workoutId }, { status: 409 });
  const target = await getExecutableWorkout(db, userId, parsed.data.workoutId);
  if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!target.executable) return NextResponse.json({ error: "not_executable", message: "Для этой тренировки пока нет исполняемого видео." }, { status: 409 });
  const id = generateId(), ts = nowIso();
  try { await db.insert(schema.workoutSessions).values({ id, userId, workoutId: target.workout.id, occurrenceId: null, state: "open", startedAt: ts, pausedAt: ts, accumulatedSeconds: 0, playbackPositionSeconds: 0, completedAt: null, finalStatus: null, currentExercisePosition: null, createdAt: ts, updatedAt: ts }); }
  catch { const active = await getActiveSession(db, userId); if (active) return NextResponse.json({ error: "active_session", activeSession: active, requestedWorkoutId: parsed.data.workoutId }, { status: 409 }); throw new Error("workout_session_create_failed"); }
  const session = await getOwnedSession(db, userId, id);
  if (!session) return NextResponse.json({ error: "session_create_failed" }, { status: 500 });
  audit("workout_session.start", { userId, sessionId: id, workoutId: target.workout.id });
  return NextResponse.json({ session }, { status: 201 });
}
