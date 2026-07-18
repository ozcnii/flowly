import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getD1, getDb } from "@/lib/cloudflare";
import { cancelPendingJobsForOccurrence } from "@/lib/programs/ensure-program-reminder-jobs";
import { finishSessionSchema, getOwnedSession, localDateTime } from "@/lib/workout-sessions";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request); if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = finishSessionSchema.safeParse(await request.json().catch(() => ({}))); if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const id = (await params).id, db = getDb(), current = await getOwnedSession(db, userId, id);
  if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (current.state === "closed") return NextResponse.json({ session: current });
  if (current.updatedAt !== parsed.data.baseUpdatedAt || parsed.data.accumulatedSeconds < current.accumulatedSeconds) return NextResponse.json({ error: "checkpoint_conflict", session: current }, { status: 409 });
  const user = (await db.select({ timezone: schema.users.timezone }).from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0];
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const historyId = generateId(), ts = nowIso(), local = localDateTime(new Date(ts), user.timezone), raw = getD1();

  const existingOcc = (await db.select({ id: schema.activityOccurrences.id, status: schema.activityOccurrences.status }).from(schema.activityOccurrences).where(and(
    eq(schema.activityOccurrences.userId, userId),
    eq(schema.activityOccurrences.entityType, "workout"),
    eq(schema.activityOccurrences.entityId, current.workoutId),
    eq(schema.activityOccurrences.scheduledLocalDate, local.date),
  )).limit(1))[0];
  const occurrenceId = existingOcc?.id ?? generateId();
  const oldStatus = existingOcc?.status ?? null;

  const results = await raw.batch(existingOcc
    ? [
      raw.prepare(`UPDATE activity_occurrences SET status=?, completed_at=?, duration_seconds=?, source='workout_session', updated_at=? WHERE id=? AND user_id=?`).bind(parsed.data.finalStatus, ts, parsed.data.accumulatedSeconds, ts, occurrenceId, userId),
      raw.prepare(`INSERT INTO status_history (id,occurrence_id,old_status,new_status,changed_by_user_id,source,comment,created_at) VALUES (?,?,?,?,?,'workout_session',?,?)`).bind(historyId, occurrenceId, oldStatus, parsed.data.finalStatus, userId, parsed.data.comment || null, ts),
      raw.prepare(`UPDATE workout_sessions SET occurrence_id=?,state='closed',paused_at=NULL,accumulated_seconds=?,playback_position_seconds=?,completed_at=?,final_status=?,updated_at=? WHERE id=? AND user_id=? AND state='open' AND updated_at=?`).bind(occurrenceId, parsed.data.accumulatedSeconds, parsed.data.playbackPositionSeconds ?? current.playbackPositionSeconds, ts, parsed.data.finalStatus, ts, id, userId, parsed.data.baseUpdatedAt),
    ]
    : [
      raw.prepare(`INSERT INTO activity_occurrences (id,user_id,entity_type,entity_id,parent_entity_id,scheduled_local_date,scheduled_local_time,timezone,scheduled_at_utc,status,completed_at,duration_seconds,source,created_at,updated_at) SELECT ?,user_id,'workout',workout_id,NULL,?,?,?,?,?,?,?,'workout_session',?,? FROM workout_sessions WHERE id=? AND user_id=? AND state='open' AND updated_at=?`).bind(occurrenceId, local.date, local.time, user.timezone, ts, parsed.data.finalStatus, ts, parsed.data.accumulatedSeconds, ts, ts, id, userId, parsed.data.baseUpdatedAt),
      raw.prepare(`INSERT INTO status_history (id,occurrence_id,old_status,new_status,changed_by_user_id,source,comment,created_at) SELECT ?,id,NULL,?,?,'workout_session',?,? FROM activity_occurrences WHERE id=?`).bind(historyId, parsed.data.finalStatus, userId, parsed.data.comment || null, ts, occurrenceId),
      raw.prepare(`UPDATE workout_sessions SET occurrence_id=?,state='closed',paused_at=NULL,accumulated_seconds=?,playback_position_seconds=?,completed_at=?,final_status=?,updated_at=? WHERE id=? AND user_id=? AND state='open' AND updated_at=?`).bind(occurrenceId, parsed.data.accumulatedSeconds, parsed.data.playbackPositionSeconds ?? current.playbackPositionSeconds, ts, parsed.data.finalStatus, ts, id, userId, parsed.data.baseUpdatedAt),
    ]);
  if (!results[2]?.meta.changes) return NextResponse.json({ error: "checkpoint_conflict", session: await getOwnedSession(db, userId, id) }, { status: 409 });
  await cancelPendingJobsForOccurrence(db, occurrenceId);
  const session = await getOwnedSession(db, userId, id);
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });
  audit("workout_session.finish", { userId, sessionId: id, occurrenceId, finalStatus: parsed.data.finalStatus, reusedOccurrence: Boolean(existingOcc) });
  return NextResponse.json({ session });
}
