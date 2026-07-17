import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { schema, type Database } from "@flowly/database";
import { FINAL_STATUSES, type WorkoutSession } from "@/features/workout-session/model/workout-session";

export const startSessionSchema = z.object({ workoutId: z.string().trim().min(1).max(128) });
export const checkpointSchema = z.object({ accumulatedSeconds: z.number().int().min(0).max(604_800), playbackPositionSeconds: z.number().int().min(0).max(604_800).optional(), paused: z.boolean(), baseUpdatedAt: z.string().datetime(), force: z.boolean().optional() });
export const finishSessionSchema = z.object({ accumulatedSeconds: z.number().int().min(0).max(604_800), playbackPositionSeconds: z.number().int().min(0).max(604_800).optional(), finalStatus: z.enum(FINAL_STATUSES), comment: z.string().trim().max(1000).optional(), baseUpdatedAt: z.string().datetime() });

const selection = {
  id: schema.workoutSessions.id,
  workoutId: schema.workoutSessions.workoutId,
  occurrenceId: schema.workoutSessions.occurrenceId,
  state: schema.workoutSessions.state,
  startedAt: schema.workoutSessions.startedAt,
  pausedAt: schema.workoutSessions.pausedAt,
  accumulatedSeconds: schema.workoutSessions.accumulatedSeconds,
  playbackPositionSeconds: schema.workoutSessions.playbackPositionSeconds,
  completedAt: schema.workoutSessions.completedAt,
  finalStatus: schema.workoutSessions.finalStatus,
  updatedAt: schema.workoutSessions.updatedAt,
  workoutTitle: schema.workouts.title,
  youtubeVideoId: schema.workouts.youtubeVideoId,
  workoutDurationSeconds: schema.workouts.durationSeconds,
  coverObjectKey: schema.workouts.coverObjectKey,
};

type SelectedSession = Awaited<ReturnType<typeof selectOwnedSession>>[number];
const payload = (row: SelectedSession): WorkoutSession => ({
  id: row.id,
  workoutId: row.workoutId,
  occurrenceId: row.occurrenceId,
  state: row.state === "closed" ? "closed" : "open",
  startedAt: row.startedAt,
  pausedAt: row.pausedAt,
  accumulatedSeconds: row.accumulatedSeconds,
  playbackPositionSeconds: row.playbackPositionSeconds,
  completedAt: row.completedAt,
  finalStatus: FINAL_STATUSES.find((status) => status === row.finalStatus) ?? null,
  updatedAt: row.updatedAt,
  workout: { id: row.workoutId, title: row.workoutTitle, youtubeVideoId: row.youtubeVideoId ?? "", durationSeconds: row.workoutDurationSeconds, coverObjectKey: row.coverObjectKey },
});

const selectOwnedSession = (db: Database, userId: string, condition?: ReturnType<typeof eq>) => db.select(selection).from(schema.workoutSessions).innerJoin(schema.workouts, eq(schema.workouts.id, schema.workoutSessions.workoutId)).where(and(eq(schema.workoutSessions.userId, userId), condition));

export async function getOwnedSession(db: Database, userId: string, id: string): Promise<WorkoutSession | null> {
  const row = (await selectOwnedSession(db, userId, eq(schema.workoutSessions.id, id)).limit(1))[0];
  return row ? payload(row) : null;
}

export async function getActiveSession(db: Database, userId: string): Promise<WorkoutSession | null> {
  const row = (await selectOwnedSession(db, userId, eq(schema.workoutSessions.state, "open")).limit(1))[0];
  return row ? payload(row) : null;
}

export async function getExecutableWorkout(db: Database, userId: string, id: string) {
  const workout = (await db.select().from(schema.workouts).where(eq(schema.workouts.id, id)).limit(1))[0];
  if (!workout || workout.status !== "published" || (workout.visibility !== "public" && workout.ownerId !== userId)) return null;
  return { workout, executable: workout.format === "video" && Boolean(workout.youtubeVideoId) };
}

export function localDateTime(date: Date, timezone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${part("hour")}:${part("minute")}` };
}
