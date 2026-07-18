import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { getPipedVideo, type YoutubeFilters, type YoutubeResult } from "@flowly/youtube";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb, getPipedBaseUrl } from "@/lib/cloudflare";

export type YoutubeWorkoutBody = { result?: YoutubeResult; filters?: YoutubeFilters };
const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
const existingWorkout = (userId: string, videoId: string) => getDb().select().from(schema.workouts).where(and(eq(schema.workouts.ownerId, userId), eq(schema.workouts.sourceType, "youtube"), eq(schema.workouts.youtubeVideoId, videoId))).limit(1).then(([workout]) => workout ?? null);

async function cachedResult(videoId: string): Promise<YoutubeResult | null> {
  for (const row of await getDb().select().from(schema.youtubeSearchCache)) {
    try { const result = (JSON.parse(row.resultsJson) as YoutubeResult[]).find((item) => item.videoId === videoId); if (result) return result; } catch {}
  }
  return null;
}

async function resolveResult(videoId: string, body: YoutubeWorkoutBody) {
  const cached = await cachedResult(videoId).catch(() => null); if (cached) return cached;
  const baseUrl = getPipedBaseUrl(); if (baseUrl) return getPipedVideo(baseUrl, videoId);
  return process.env.NODE_ENV !== "production" && body.result?.videoId === videoId ? body.result : null;
}

async function materialize(userId: string, videoId: string, body: YoutubeWorkoutBody) {
  const existing = await existingWorkout(userId, videoId); if (existing) return { created: false, workout: existing };
  const result = await resolveResult(videoId, body).catch(() => null); if (!result) return null;
  const filters = body.filters ?? {}, id = generateId(), ts = nowIso();
  try {
    await getDb().insert(schema.workouts).values({ id, ownerId: userId, sourceType: "youtube", visibility: "private", title: result.title.trim() || "YouTube-видео", description: result.description.trim() || `Видео канала ${result.channelTitle}`, coverObjectKey: null, youtubeVideoId: videoId, durationSeconds: result.durationSeconds || 0, difficulty: ["beginner", "intermediate", "advanced"].includes(filters.difficulty ?? "") ? filters.difficulty! : "beginner", equipment: JSON.stringify(filters.equipment === "none" ? [] : ["коврик"]), contraindications: "[]", format: "video", status: "published", createdAt: ts, updatedAt: ts, publishedAt: ts });
  } catch (error) {
    const raced = await existingWorkout(userId, videoId); if (raced) return { created: false, workout: raced };
    throw error;
  }
  if (filters.category) {
    const category = (await getDb().select({ id: schema.workoutCategories.id }).from(schema.workoutCategories).where(eq(schema.workoutCategories.slug, filters.category)).limit(1))[0];
    if (category) await getDb().insert(schema.workoutCategoryLinks).values({ workoutId: id, categoryId: category.id });
  }
  return { created: true, workout: (await getDb().select().from(schema.workouts).where(eq(schema.workouts.id, id)).limit(1))[0]! };
}

export async function handleYoutubeWorkoutPost(request: Request, params: Promise<{ videoId: string }>, event: "youtube.save" | "youtube.create_workout") {
  const oversized = rejectOversizedBody(request); if (oversized) return oversized;
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const { videoId } = await params; if (!/^[\w-]{6,}$/.test(videoId)) return json({ error: "bad_video_id" }, { status: 400 });
  const body = await request.json().catch(() => ({})) as YoutubeWorkoutBody;
  const data = await materialize(userId, videoId, body); if (!data) return json({ error: "metadata_unavailable", message: "Не удалось получить данные видео. Повторите позже." }, { status: 503 });
  audit(event, { userId, videoId, workoutId: data.workout.id, created: data.created });
  return json(data);
}
