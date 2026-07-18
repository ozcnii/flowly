import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { schema } from "@flowly/database";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import starterCatalog from "../../../../../../seeds/catalog/starter-catalog.v1.json";

type FilterKey = "q" | "category" | "duration" | "difficulty" | "format" | "source" | "equipment" | "favorite";
type Category = { id: string; slug: string; name: string; icon: string; sortOrder: number; isActive: boolean };
type Workout = {
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
  isFavorite: boolean;
};

const FILTERS = ["q", "category", "duration", "difficulty", "format", "source", "equipment", "favorite"] as const satisfies readonly FilterKey[];
const parseJsonArray = (value: string) => { try { const parsed = JSON.parse(value) as unknown; return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } };
const inDuration = (seconds: number, bucket: string) => !bucket || (bucket === "short" ? seconds <= 600 : bucket === "medium" ? seconds > 600 && seconds <= 1200 : bucket === "long" ? seconds > 1200 && seconds <= 2100 : true);

async function loadFromD1(userId: string | null): Promise<{ categories: Category[]; workouts: Workout[]; favoriteCount: number }> {
  const db = getDb();
  const [workouts, categories, links, favoriteRows] = await Promise.all([
    db.select().from(schema.workouts),
    db.select().from(schema.workoutCategories),
    db.select().from(schema.workoutCategoryLinks),
    userId
      ? db.select({ entityId: schema.favorites.entityId }).from(schema.favorites).where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.entityType, "workout")))
      : Promise.resolve([] as Array<{ entityId: string }>),
  ]);
  const favoriteIds = new Set(favoriteRows.map((row) => row.entityId));
  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const linksByWorkout = new Map<string, typeof categories>();
  for (const link of links) {
    const category = categoriesById.get(link.categoryId);
    if (!category) continue;
    const list = linksByWorkout.get(link.workoutId) ?? [];
    list.push(category);
    linksByWorkout.set(link.workoutId, list);
  }
  return {
    categories: categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon, sortOrder: c.sortOrder, isActive: c.isActive })),
    favoriteCount: favoriteIds.size,
    workouts: workouts.filter((w) => w.status === "published" && (w.visibility === "public" || (userId && w.ownerId === userId))).map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      durationSeconds: w.durationSeconds,
      difficulty: w.difficulty,
      format: w.format,
      sourceType: w.sourceType,
      visibility: w.visibility,
      coverObjectKey: w.coverObjectKey,
      youtubeVideoId: w.youtubeVideoId,
      equipment: parseJsonArray(w.equipment),
      contraindications: parseJsonArray(w.contraindications),
      categories: (linksByWorkout.get(w.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon })),
      isFavorite: favoriteIds.has(w.id),
    })),
  };
}

function loadDevFallback(): { categories: Category[]; workouts: Workout[]; favoriteCount: number } {
  const catalog = starterCatalog as {
    categories: Array<{ id: string; slug: string; name: string; icon: string; sortOrder: number }>;
    workouts: Array<{ id: string; title: string; description: string; categories: string[]; duration: number; difficulty: string; format: string; sourceType?: string; coverObjectKey?: string | null; youtubeVideoId?: string; equipment?: string[]; contraindications?: string[] }>;
  };
  const categories = catalog.categories.map((c) => ({ ...c, isActive: true }));
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  return {
    categories,
    favoriteCount: 0,
    workouts: catalog.workouts.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      durationSeconds: w.duration,
      difficulty: w.difficulty,
      format: w.format,
      sourceType: w.sourceType ?? "flowly",
      visibility: "public",
      coverObjectKey: w.coverObjectKey ?? (w.sourceType === "youtube" ? null : `catalog/covers/${w.id}.webp`),
      youtubeVideoId: w.youtubeVideoId ?? null,
      equipment: w.equipment ?? [],
      contraindications: w.contraindications ?? [],
      categories: w.categories.map((slug) => bySlug.get(slug)).filter((c): c is Category => Boolean(c)).map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon })),
      isFavorite: false,
    })),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters: Record<FilterKey, string> = { q: "", category: "", duration: "", difficulty: "", format: "", source: "", equipment: "", favorite: "" };
  for (const key of FILTERS) filters[key] = url.searchParams.get(key)?.trim() || "";

  const userId = await getSessionUserId(request).catch(() => null);
  let catalog: { categories: Category[]; workouts: Workout[]; favoriteCount: number };
  try { catalog = await loadFromD1(userId); }
  catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    catalog = loadDevFallback();
  }

  const q = filters.q.toLowerCase();
  const workouts = catalog.workouts.filter((w) => {
    if (filters.favorite && !w.isFavorite) return false;
    if (filters.source && w.sourceType !== filters.source) return false;
    if (filters.category && !w.categories.some((c) => c.slug === filters.category)) return false;
    if (filters.difficulty && w.difficulty !== filters.difficulty) return false;
    if (filters.format && w.format !== filters.format) return false;
    if (!inDuration(w.durationSeconds, filters.duration)) return false;
    if (filters.equipment === "none" && w.equipment.length > 0) return false;
    if (filters.equipment === "any" && w.equipment.length === 0) return false;
    return !q || [w.title, w.description, w.sourceType, ...w.categories.flatMap((c) => [c.name, c.slug])].join(" ").toLowerCase().includes(q);
  });

  const explanation = workouts.length
    ? null
    : filters.favorite && catalog.favoriteCount === 0
      ? "В избранном пока нет тренировок."
      : filters.favorite
        ? "В избранном нет тренировок по этим фильтрам."
        : filters.source && filters.source !== "flowly"
          ? "По этим фильтрам пока ничего нет."
          : null;

  return NextResponse.json({
    filters,
    total: workouts.length,
    categories: catalog.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    workouts: workouts.sort((a, b) => a.title.localeCompare(b.title, "ru")),
    explanation,
  });
}
