import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { schema, type Database } from "@flowly/database";
import { FINAL_STATUSES, type SessionExercise, type WorkoutSession } from "@/features/workout-session/model/workout-session";

export const startSessionSchema = z.object({ workoutId: z.string().trim().min(1).max(128), mode: z.enum(["video", "step"]).optional() });
export const checkpointSchema = z.object({ accumulatedSeconds: z.number().int().min(0).max(604_800), playbackPositionSeconds: z.number().int().min(0).max(604_800).optional(), currentExercisePosition: z.number().int().min(0).optional(), paused: z.boolean(), baseUpdatedAt: z.string().datetime(), force: z.boolean().optional() });
export const finishSessionSchema = z.object({ accumulatedSeconds: z.number().int().min(0).max(604_800), playbackPositionSeconds: z.number().int().min(0).max(604_800).optional(), finalStatus: z.enum(FINAL_STATUSES), comment: z.string().trim().max(1000).optional(), baseUpdatedAt: z.string().datetime() });

const selection = {
  id: schema.workoutSessions.id,
  workoutId: schema.workoutSessions.workoutId,
  occurrenceId: schema.workoutSessions.occurrenceId,
  state: schema.workoutSessions.state,
  mode: schema.workoutSessions.mode,
  startedAt: schema.workoutSessions.startedAt,
  pausedAt: schema.workoutSessions.pausedAt,
  accumulatedSeconds: schema.workoutSessions.accumulatedSeconds,
  playbackPositionSeconds: schema.workoutSessions.playbackPositionSeconds,
  currentExercisePosition: schema.workoutSessions.currentExercisePosition,
  completedAt: schema.workoutSessions.completedAt,
  finalStatus: schema.workoutSessions.finalStatus,
  updatedAt: schema.workoutSessions.updatedAt,
  workoutTitle: schema.workouts.title,
  workoutFormat: schema.workouts.format,
  youtubeVideoId: schema.workouts.youtubeVideoId,
  workoutDurationSeconds: schema.workouts.durationSeconds,
  coverObjectKey: schema.workouts.coverObjectKey,
};

type SelectedSession = Awaited<ReturnType<typeof selectOwnedSession>>[number];

const payload = async (db: Database, row: SelectedSession): Promise<WorkoutSession> => {
  const links = await db.select().from(schema.workoutExercises).where(eq(schema.workoutExercises.workoutId, row.workoutId));
  const exerciseIds = [...new Set(links.map((l) => l.exerciseId))];
  const exercises = exerciseIds.length ? await db.select().from(schema.exercises).where(inArray(schema.exercises.id, exerciseIds)) : [];
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const sessionExercises: SessionExercise[] = links.sort((a, b) => a.position - b.position).map((link) => {
    const e = byId.get(link.exerciseId);
    return { id: link.exerciseId, position: link.position, title: e?.title ?? "Упражнение", description: e?.description ?? "Инструкция будет добавлена позже.", mediaObjectKey: e?.mediaObjectKey ?? null, mediaType: e?.mediaType ?? null, durationSeconds: e?.defaultDurationSeconds ?? null, repetitions: link.repetitions ?? e?.defaultRepetitions ?? null, restSeconds: link.restSeconds ?? null, plannedDurationSeconds: link.durationSeconds };
  });
  return {
    id: row.id,
    workoutId: row.workoutId,
    occurrenceId: row.occurrenceId,
    state: row.state === "closed" ? "closed" : "open",
    mode: row.mode === "video" || row.mode === "step" ? row.mode : null,
    startedAt: row.startedAt,
    pausedAt: row.pausedAt,
    accumulatedSeconds: row.accumulatedSeconds,
    playbackPositionSeconds: row.playbackPositionSeconds,
    currentExercisePosition: row.currentExercisePosition,
    completedAt: row.completedAt,
    finalStatus: FINAL_STATUSES.find((status) => status === row.finalStatus) ?? null,
    updatedAt: row.updatedAt,
    workout: { id: row.workoutId, title: row.workoutTitle, format: row.workoutFormat, youtubeVideoId: row.youtubeVideoId ?? "", durationSeconds: row.workoutDurationSeconds, coverObjectKey: row.coverObjectKey, exercises: sessionExercises },
  };
};

const selectOwnedSession = (db: Database, userId: string, condition?: ReturnType<typeof eq>) => db.select(selection).from(schema.workoutSessions).innerJoin(schema.workouts, eq(schema.workouts.id, schema.workoutSessions.workoutId)).where(and(eq(schema.workoutSessions.userId, userId), condition));

export async function getOwnedSession(db: Database, userId: string, id: string): Promise<WorkoutSession | null> {
  const row = (await selectOwnedSession(db, userId, eq(schema.workoutSessions.id, id)).limit(1))[0];
  return row ? await payload(db, row) : null;
}

export async function getActiveSession(db: Database, userId: string): Promise<WorkoutSession | null> {
  const row = (await selectOwnedSession(db, userId, eq(schema.workoutSessions.state, "open")).limit(1))[0];
  return row ? await payload(db, row) : null;
}

export async function getExecutableWorkout(db: Database, userId: string, id: string) {
  const workout = (await db.select().from(schema.workouts).where(eq(schema.workouts.id, id)).limit(1))[0];
  if (!workout || workout.status !== "published" || (workout.visibility !== "public" && workout.ownerId !== userId)) return null;
  const exerciseCount = workout.format === "video" ? 0 : (await db.select({ count: schema.workoutExercises.workoutId }).from(schema.workoutExercises).where(eq(schema.workoutExercises.workoutId, id))).length;
  const executable = workout.format === "video" ? Boolean(workout.youtubeVideoId) : exerciseCount > 0;
  return { workout, executable, exerciseCount };
}

export function localDateTime(date: Date, timezone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${part("hour")}:${part("minute")}` };
}
