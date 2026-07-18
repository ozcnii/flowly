import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getDb } from "@/lib/cloudflare";
import { checkpointSchema, getOwnedSession } from "@/lib/workout-sessions";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request); if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = checkpointSchema.safeParse(await request.json().catch(() => ({}))); if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const id = (await params).id, db = getDb(), current = await getOwnedSession(db, userId, id);
  if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (current.state !== "open") return NextResponse.json({ error: "session_closed", session: current }, { status: 409 });
  if (current.updatedAt !== parsed.data.baseUpdatedAt) return NextResponse.json({ error: "checkpoint_conflict", session: current }, { status: 409 });
  if (!parsed.data.force && parsed.data.accumulatedSeconds < current.accumulatedSeconds) return NextResponse.json({ error: "non_monotonic_checkpoint", session: current }, { status: 409 });
  const ts = nowIso(), changed = await db.update(schema.workoutSessions).set({ accumulatedSeconds: parsed.data.accumulatedSeconds, playbackPositionSeconds: parsed.data.playbackPositionSeconds ?? current.playbackPositionSeconds, currentExercisePosition: parsed.data.currentExercisePosition ?? null, pausedAt: parsed.data.paused ? ts : null, updatedAt: ts }).where(and(eq(schema.workoutSessions.id, id), eq(schema.workoutSessions.userId, userId), eq(schema.workoutSessions.state, "open"), eq(schema.workoutSessions.updatedAt, parsed.data.baseUpdatedAt))).returning({ id: schema.workoutSessions.id });
  if (!changed.length) return NextResponse.json({ error: "checkpoint_conflict", session: await getOwnedSession(db, userId, id) }, { status: 409 });
  const session = await getOwnedSession(db, userId, id);
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });
  audit("workout_session.checkpoint", { userId, sessionId: id, paused: parsed.data.paused, forced: Boolean(parsed.data.force) });
  return NextResponse.json({ session });
}
