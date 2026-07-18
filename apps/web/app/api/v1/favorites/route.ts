import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";

const json = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);
const ENTITY = "workout" as const;
const parseJsonArray = (value: string) => { try { const parsed = JSON.parse(value) as unknown; return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } };

type Body = { entityType?: string; entityId?: string };

function parsePair(entityType: string | null | undefined, entityId: string | null | undefined) {
  const type = entityType?.trim() ?? "", id = entityId?.trim() ?? "";
  if (!type || !id) return { error: json({ error: "bad_request", message: "Нужны entityType и entityId." }, { status: 400 }) } as const;
  if (type !== ENTITY) return { error: json({ error: "unsupported_entity", message: "Пока можно добавлять в избранное только тренировки." }, { status: 400 }) } as const;
  return { entityType: ENTITY, entityId: id } as const;
}

async function readableWorkout(userId: string, workoutId: string) {
  const workout = (await getDb().select().from(schema.workouts).where(eq(schema.workouts.id, workoutId)).limit(1))[0];
  if (!workout || workout.status !== "published" || (workout.visibility !== "public" && workout.ownerId !== userId)) return null;
  return workout;
}

export async function GET(request: Request) {
  const userId = await getSessionUserId(request); if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const db = getDb();
  const rows = await db.select().from(schema.favorites).where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.entityType, ENTITY))).orderBy(desc(schema.favorites.createdAt));
  if (!rows.length) return json({ total: 0, items: [] });

  const [workouts, categories, links] = await Promise.all([
    db.select().from(schema.workouts),
    db.select().from(schema.workoutCategories),
    db.select().from(schema.workoutCategoryLinks),
  ]);
  const workoutById = new Map(workouts.map((w) => [w.id, w]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const linksByWorkout = new Map<string, typeof categories>();
  for (const link of links) {
    const category = categoryById.get(link.categoryId); if (!category) continue;
    const list = linksByWorkout.get(link.workoutId) ?? []; list.push(category); linksByWorkout.set(link.workoutId, list);
  }

  const items = rows.flatMap((row) => {
    const w = workoutById.get(row.entityId);
    if (!w || w.status !== "published" || (w.visibility !== "public" && w.ownerId !== userId)) return [];
    return [{
      entityType: row.entityType,
      entityId: row.entityId,
      createdAt: row.createdAt,
      workout: {
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
        isFavorite: true,
      },
    }];
  });
  return json({ total: items.length, items });
}

export async function PUT(request: Request) {
  const oversized = rejectOversizedBody(request); if (oversized) return oversized;
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Body;
  const pair = parsePair(body.entityType, body.entityId); if ("error" in pair) return pair.error;
  const workout = await readableWorkout(userId, pair.entityId); if (!workout) return json({ error: "not_found", message: "Тренировка не найдена или недоступна." }, { status: 404 });

  const db = getDb();
  const existing = (await db.select().from(schema.favorites).where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.entityType, pair.entityType), eq(schema.favorites.entityId, pair.entityId))).limit(1))[0];
  if (existing) {
    audit("favorite.put", { userId, entityType: pair.entityType, entityId: pair.entityId, created: false });
    return json({ created: false, favorite: { entityType: existing.entityType, entityId: existing.entityId, createdAt: existing.createdAt } });
  }
  const createdAt = nowIso();
  await db.insert(schema.favorites).values({ userId, entityType: pair.entityType, entityId: pair.entityId, createdAt });
  audit("favorite.put", { userId, entityType: pair.entityType, entityId: pair.entityId, created: true });
  return json({ created: true, favorite: { entityType: pair.entityType, entityId: pair.entityId, createdAt } }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!isSafeOrigin(request)) return json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request); if (!userId) return json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const pair = parsePair(url.searchParams.get("entityType"), url.searchParams.get("entityId")); if ("error" in pair) return pair.error;
  await getDb().delete(schema.favorites).where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.entityType, pair.entityType), eq(schema.favorites.entityId, pair.entityId)));
  audit("favorite.delete", { userId, entityType: pair.entityType, entityId: pair.entityId });
  return json({ ok: true });
}
