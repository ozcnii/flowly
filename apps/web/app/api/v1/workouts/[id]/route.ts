import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import starterCatalog from "../../../../../../../seeds/catalog/starter-catalog.v1.json";

type Category = { id: string; slug: string; name: string; icon: string; sortOrder: number; isActive: boolean };
type Exercise = { id: string; title: string; description: string; mediaObjectKey: string | null; mediaType: string | null; durationSeconds: number | null; repetitions: number | null; restSeconds: number | null; plannedDurationSeconds: number | null };
type WorkoutDetail = {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  difficulty: string;
  format: string;
  sourceType: string;
  visibility: string;
  coverObjectKey: string | null;
  youtubeVideoId: string | null;
  equipment: string[];
  contraindications: string[];
  categories: Array<Pick<Category, "id" | "slug" | "name" | "icon">>;
  exercises: Array<Exercise & { position: number; plannedDurationSeconds: number | null }>;
  author: { name: string; type: "flowly" | "youtube" | "user" };
  isFavorite: boolean;
  actions: Record<"start" | "favorite" | "share" | "report" | "hide" | "author", { enabled: boolean; reason: string }>;
};

const parseJsonArray = (value: string) => { try { const parsed = JSON.parse(value) as unknown; return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } };
const actionsFor = (sourceType: string, format: string, youtubeVideoId: string | null | undefined, exerciseCount: number, isFavorite: boolean): WorkoutDetail["actions"] => ({
  start: format === "video" && youtubeVideoId ? { enabled: true, reason: "Видео готово к запуску." } : (format === "step_by_step" || format === "mixed") && exerciseCount > 0 ? { enabled: true, reason: "Готово к пошаговому выполнению." } : { enabled: false, reason: "Для этой тренировки пока нет исполняемого содержания." },
  favorite: { enabled: true, reason: isFavorite ? "В избранном" : "Можно добавить в избранное." },
  share: { enabled: false, reason: "Поделиться можно будет позже." },
  report: { enabled: false, reason: sourceType === "user" ? "Можно пожаловаться на пользовательский контент." : "Жалобы доступны только для пользовательского контента." },
  hide: { enabled: false, reason: sourceType === "user" ? "Можно скрыть пользовательский контент." : "Скрытие автора доступно только для пользовательского контента." },
  author: { enabled: false, reason: sourceType === "user" ? "Можно открыть профиль автора." : "Для этого источника отдельный профиль не требуется." },
});

async function loadFromD1(id: string, userId: string | null): Promise<WorkoutDetail | null> {
  const db = getDb();
  const workout = (await db.select().from(schema.workouts).where(eq(schema.workouts.id, id)).limit(1))[0];
  if (!workout || workout.status !== "published" || (workout.visibility !== "public" && workout.ownerId !== userId)) return null;

  const [categories, links, exerciseLinks, exercises, favoriteRow] = await Promise.all([
    db.select().from(schema.workoutCategories),
    db.select().from(schema.workoutCategoryLinks).where(eq(schema.workoutCategoryLinks.workoutId, id)),
    db.select().from(schema.workoutExercises).where(eq(schema.workoutExercises.workoutId, id)),
    db.select().from(schema.exercises),
    userId
      ? db.select({ entityId: schema.favorites.entityId }).from(schema.favorites).where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.entityType, "workout"), eq(schema.favorites.entityId, id))).limit(1)
      : Promise.resolve([] as Array<{ entityId: string }>),
  ]);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  const sourceType = workout.sourceType as "flowly" | "youtube" | "user";
  const isFavorite = favoriteRow.length > 0;

  return {
    id: workout.id,
    title: workout.title,
    description: workout.description,
    durationSeconds: workout.durationSeconds,
    difficulty: workout.difficulty,
    format: workout.format,
    sourceType: workout.sourceType,
    visibility: workout.visibility,
    coverObjectKey: workout.coverObjectKey,
    youtubeVideoId: workout.youtubeVideoId,
    equipment: parseJsonArray(workout.equipment),
    contraindications: parseJsonArray(workout.contraindications),
    categories: links.map((l) => categoryById.get(l.categoryId)).filter((c): c is typeof categories[number] => Boolean(c)).sort((a, b) => a.sortOrder - b.sortOrder).map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon })),
    exercises: exerciseLinks.sort((a, b) => a.position - b.position).map((link) => {
      const e = exerciseById.get(link.exerciseId);
      return { id: link.exerciseId, position: link.position, title: e?.title ?? "Упражнение", description: e?.description ?? "Инструкция будет добавлена позже.", mediaObjectKey: e?.mediaObjectKey ?? null, mediaType: e?.mediaType ?? null, durationSeconds: e?.defaultDurationSeconds ?? null, repetitions: link.repetitions ?? e?.defaultRepetitions ?? null, restSeconds: link.restSeconds ?? null, plannedDurationSeconds: link.durationSeconds };
    }),
    author: { name: sourceType === "youtube" ? "YouTube" : sourceType === "user" ? "Автор Flowly" : "Flowly", type: sourceType },
    isFavorite,
    actions: actionsFor(sourceType, workout.format, workout.youtubeVideoId, exerciseLinks.length, isFavorite),
  };
}

function loadDevFallback(id: string): WorkoutDetail | null {
  const catalog = starterCatalog as {
    categories: Array<{ id: string; slug: string; name: string; icon: string; sortOrder: number }>;
    exercises: Array<{ id: string; title: string; description: string; mediaType?: string; duration?: number; repetitions?: number }>;
    workouts: Array<{ id: string; title: string; description: string; categories: string[]; duration: number; difficulty: string; format: string; sourceType?: "flowly" | "youtube" | "user"; coverObjectKey?: string | null; youtubeVideoId?: string; equipment?: string[]; contraindications?: string[]; exercises: string[] }>;
  };
  const workout = catalog.workouts.find((w) => w.id === id);
  if (!workout) return null;
  const bySlug = new Map(catalog.categories.map((c) => [c.slug, c]));
  const byExercise = new Map(catalog.exercises.map((e) => [e.id, e]));
  const sourceType = workout.sourceType ?? "flowly";
  return {
    id: workout.id,
    title: workout.title,
    description: workout.description,
    durationSeconds: workout.duration,
    difficulty: workout.difficulty,
    format: workout.format,
    sourceType,
    visibility: "public",
    coverObjectKey: workout.coverObjectKey ?? (sourceType === "youtube" ? null : `catalog/covers/${workout.id}.webp`),
    youtubeVideoId: workout.youtubeVideoId ?? null,
    equipment: workout.equipment ?? [],
    contraindications: workout.contraindications ?? [],
    categories: workout.categories.map((slug) => bySlug.get(slug)).filter((c): c is typeof catalog.categories[number] => Boolean(c)).map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon })),
    exercises: workout.exercises.map((exerciseId, index) => {
      const e = byExercise.get(exerciseId);
      return { id: exerciseId, position: index + 1, title: e?.title ?? "Упражнение", description: e?.description ?? "Инструкция будет добавлена позже.", mediaObjectKey: e ? `catalog/exercises/${e.id}.webp` : null, mediaType: e?.mediaType ?? null, durationSeconds: e?.duration ?? null, repetitions: e?.repetitions ?? null, restSeconds: null, plannedDurationSeconds: e?.duration ?? null };
    }),
    author: { name: sourceType === "youtube" ? "YouTube" : sourceType === "user" ? "Автор Flowly" : "Flowly", type: sourceType },
    isFavorite: false,
    actions: actionsFor(sourceType, workout.format, workout.youtubeVideoId, workout.exercises.length, false),
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getSessionUserId(request).catch(() => null);
  let workout: WorkoutDetail | null;
  try { workout = await loadFromD1(id, userId); }
  catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    workout = loadDevFallback(id);
  }
  return workout ? NextResponse.json({ workout }) : NextResponse.json({ error: "not_found", message: "Тренировка не найдена или недоступна." }, { status: 404 });
}
