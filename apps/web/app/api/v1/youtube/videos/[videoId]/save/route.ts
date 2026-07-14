import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { generateId, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { getInvidiousVideo, type YoutubeFilters, type YoutubeResult } from "@flowly/youtube";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb, getInvidiousBaseUrl } from "@/lib/cloudflare";

type Body = { result?: YoutubeResult; filters?: YoutubeFilters };
const jsonArray = (values: string[]) => JSON.stringify(values);
const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
const safeText = (value: unknown) => typeof value === "string" ? value.trim() : "";

async function cachedResult(videoId: string): Promise<YoutubeResult | null> {
  const rows = await getDb().select().from(schema.youtubeSearchCache);
  for (const row of rows) {
    try {
      const found = (JSON.parse(row.resultsJson) as YoutubeResult[]).find((x) => x.videoId === videoId);
      if (found) return found;
    } catch {
      continue;
    }
  }
  return null;
}

async function resolveResult(videoId: string, body: Body): Promise<YoutubeResult | null> {
  const cached = await cachedResult(videoId).catch(() => null);
  if (cached) return cached;
  const baseUrl = getInvidiousBaseUrl();
  if (baseUrl) return await getInvidiousVideo(baseUrl, videoId);
  if (process.env.NODE_ENV !== "production" && body.result?.videoId === videoId) return body.result;
  return null;
}

async function categoryId(slug?: string): Promise<string | null> {
  if (!slug) return null;
  const row = (await getDb().select().from(schema.workoutCategories).where(eq(schema.workoutCategories.slug, slug)).limit(1))[0];
  return row?.id ?? null;
}

function difficulty(value?: string): string {
  return value === "intermediate" || value === "advanced" || value === "beginner" ? value : "beginner";
}

export async function POST(request: Request, { params }: { params: Promise<{ videoId: string }> }) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return json({ error: "unauthorized" }, { status: 401 });

  const { videoId } = await params;
  if (!/^[\w-]{6,}$/.test(videoId)) return json({ error: "bad_video_id" }, { status: 400 });
  const body = await request.json().catch(() => ({})) as Body;
  const result = await resolveResult(videoId, body).catch(() => null);
  if (!result) return json({ error: "metadata_unavailable", message: "Не удалось получить данные видео. Повторите позже." }, { status: 503 });

  const db = getDb();
  const existing = (await db.select().from(schema.workouts).where(and(eq(schema.workouts.ownerId, userId), eq(schema.workouts.sourceType, "youtube"), eq(schema.workouts.youtubeVideoId, videoId))).limit(1))[0];
  if (existing) return json({ created: false, workout: existing });

  const id = generateId();
  const ts = nowIso();
  const filters = body.filters ?? {};
  await db.insert(schema.workouts).values({
    id,
    ownerId: userId,
    sourceType: "youtube",
    visibility: "private",
    title: safeText(result.title) || "YouTube-видео",
    description: safeText(result.description) || `Видео канала ${result.channelTitle}`,
    coverObjectKey: null,
    youtubeVideoId: videoId,
    durationSeconds: result.durationSeconds || 0,
    difficulty: difficulty(filters.difficulty),
    equipment: jsonArray(filters.equipment === "none" ? [] : ["коврик"]),
    contraindications: jsonArray([]),
    format: "video",
    status: "published",
    createdAt: ts,
    updatedAt: ts,
    publishedAt: ts,
  });
  const cid = await categoryId(filters.category);
  if (cid) await db.insert(schema.workoutCategoryLinks).values({ workoutId: id, categoryId: cid });
  const workout = (await db.select().from(schema.workouts).where(eq(schema.workouts.id, id)).limit(1))[0];
  audit("youtube.save", { userId, videoId, workoutId: id });
  return json({ created: true, workout });
}
