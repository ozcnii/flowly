import type { WorkoutSession } from "./workout-session";

export type LocalCheckpoint = { sessionId: string; accumulatedSeconds: number; playbackPositionSeconds: number; paused: boolean; baseUpdatedAt: string; savedAt: string; revision: number };
const key = (id: string) => `flowly-workout-session:${id}`;

export function readLocalCheckpoint(id: string): LocalCheckpoint | null {
  try {
    const value = JSON.parse(localStorage.getItem(key(id)) ?? "null") as Partial<LocalCheckpoint> | null;
    return value?.sessionId === id && Number.isFinite(value.accumulatedSeconds) && typeof value.baseUpdatedAt === "string" ? { sessionId: id, accumulatedSeconds: Math.max(0, Math.round(value.accumulatedSeconds!)), playbackPositionSeconds: Number.isFinite(value.playbackPositionSeconds) ? Math.max(0, Math.round(value.playbackPositionSeconds!)) : 0, paused: Boolean(value.paused), baseUpdatedAt: value.baseUpdatedAt, savedAt: typeof value.savedAt === "string" ? value.savedAt : new Date(0).toISOString(), revision: Number.isInteger(value.revision) ? Math.max(0, value.revision!) : 0 } : null;
  } catch { return null; }
}

const write = (value: LocalCheckpoint) => { try { localStorage.setItem(key(value.sessionId), JSON.stringify(value)); return value; } catch { return null; } };

export function advanceLocalCheckpoint(id: string, accumulatedSeconds: number, playbackPositionSeconds: number, paused: boolean, baseUpdatedAt: string) {
  const current = readLocalCheckpoint(id);
  return write({ sessionId: id, accumulatedSeconds: Math.max(current?.accumulatedSeconds ?? 0, Math.max(0, Math.round(accumulatedSeconds))), playbackPositionSeconds: Math.max(0, Math.round(playbackPositionSeconds)), paused, baseUpdatedAt, savedAt: new Date().toISOString(), revision: (current?.revision ?? 0) + 1 });
}

export function replaceLocalCheckpoint(id: string, accumulatedSeconds: number, playbackPositionSeconds: number, paused: boolean, baseUpdatedAt: string) {
  return write({ sessionId: id, accumulatedSeconds: Math.max(0, Math.round(accumulatedSeconds)), playbackPositionSeconds: Math.max(0, Math.round(playbackPositionSeconds)), paused, baseUpdatedAt, savedAt: new Date().toISOString(), revision: (readLocalCheckpoint(id)?.revision ?? 0) + 1 });
}

export function rebaseLocalCheckpoint(id: string, requestRevision: number, session: WorkoutSession) {
  const current = readLocalCheckpoint(id), newer = (current?.revision ?? 0) > requestRevision;
  return write({ sessionId: id, accumulatedSeconds: newer ? Math.max(current!.accumulatedSeconds, session.accumulatedSeconds) : session.accumulatedSeconds, playbackPositionSeconds: newer ? current!.playbackPositionSeconds : session.playbackPositionSeconds, paused: newer ? current!.paused : Boolean(session.pausedAt), baseUpdatedAt: session.updatedAt, savedAt: new Date().toISOString(), revision: Math.max(current?.revision ?? 0, requestRevision) });
}

export const removeLocalCheckpoint = (id: string) => { try { localStorage.removeItem(key(id)); } catch {} };
export const latestSessionSeconds = (session: WorkoutSession) => Math.max(session.accumulatedSeconds, readLocalCheckpoint(session.id)?.accumulatedSeconds ?? 0);
export const latestPlaybackPosition = (session: WorkoutSession) => readLocalCheckpoint(session.id)?.playbackPositionSeconds ?? session.playbackPositionSeconds;
