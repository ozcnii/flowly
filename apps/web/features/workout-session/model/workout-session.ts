export const FINAL_STATUSES = ["completed", "partial", "not_completed", "rest", "skipped"] as const;
export type FinalStatus = typeof FINAL_STATUSES[number];
export const FINAL_STATUS_LABELS: Record<FinalStatus, string> = { completed: "Выполнено", partial: "Выполнено частично", not_completed: "Не завершено", rest: "Сегодня отдыхаю", skipped: "Пропущено" };
export const formatSessionDuration = (seconds: number) => seconds >= 3_600 ? `${Math.floor(seconds / 3_600)}:${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}` : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export type SessionWorkout = { id: string; title: string; youtubeVideoId: string; durationSeconds: number; coverObjectKey: string | null };
export type WorkoutSession = {
  id: string;
  workoutId: string;
  occurrenceId: string | null;
  state: "open" | "closed";
  startedAt: string;
  pausedAt: string | null;
  accumulatedSeconds: number;
  playbackPositionSeconds: number;
  completedAt: string | null;
  finalStatus: FinalStatus | null;
  updatedAt: string;
  workout: SessionWorkout;
};
export type SessionResponse = { session: WorkoutSession };
export type ActiveSessionResponse = { session: WorkoutSession | null };
export type StartSessionResponse = SessionResponse;
export type ActiveSessionConflict = { error: "active_session"; activeSession: WorkoutSession; requestedWorkoutId: string };
export type CheckpointConflict = { error: "checkpoint_conflict"; session: WorkoutSession };
export type CheckpointInput = { accumulatedSeconds: number; playbackPositionSeconds: number; paused: boolean; baseUpdatedAt: string; force?: boolean };
export type FinishInput = { accumulatedSeconds: number; playbackPositionSeconds: number; finalStatus: FinalStatus; comment?: string; baseUpdatedAt: string };
