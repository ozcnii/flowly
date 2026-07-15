import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isoFromNowMs, nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { buildYogaYoutubeQuery, searchPiped, type YoutubeFilters, type YoutubeResult } from "@flowly/youtube";
import { getDb, getPipedBaseUrl } from "@/lib/cloudflare";
import { audit } from "@/lib/auth/http";
import starterCatalog from "../../../../../../../seeds/catalog/starter-catalog.v1.json";

type CacheState = "hit" | "miss" | "stale" | "unavailable";
type ResponseBody = { query: { text: string; filters: YoutubeFilters; cacheKey: string }; cache: CacheState; provider: "piped"; results: YoutubeResult[]; warning: string | null; explanation: string | null };
const TTL_MS = 24 * 60 * 60 * 1000;
const FILTER_KEYS = ["category", "duration", "difficulty", "equipment", "query"] as const;

const json = (body: ResponseBody, init?: ResponseInit) => NextResponse.json(body, init);
const parseResults = (value: string): YoutubeResult[] => { try { const parsed = JSON.parse(value) as unknown; return Array.isArray(parsed) ? parsed as YoutubeResult[] : []; } catch { return []; } };

async function categoryName(slug: string): Promise<string> {
  if (!slug) return "";
  try {
    const row = (await getDb().select().from(schema.workoutCategories).where(eq(schema.workoutCategories.slug, slug)).limit(1))[0];
    return row?.name ?? slug;
  } catch {
    const catalog = starterCatalog as { categories: Array<{ slug: string; name: string }> };
    return catalog.categories.find((category) => category.slug === slug)?.name ?? slug;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters: YoutubeFilters = {};
  url.searchParams.set("query", url.searchParams.get("q") ?? url.searchParams.get("query") ?? "");
  for (const key of FILTER_KEYS) {
    const value = url.searchParams.get(key)?.trim();
    if (value) filters[key] = value;
  }
  if (filters.category) filters.categoryName = await categoryName(filters.category);
  const query = buildYogaYoutubeQuery(filters);

  let cacheRow: { resultsJson: string; expiresAt: string } | null = null;
  try { cacheRow = (await getDb().select().from(schema.youtubeSearchCache).where(eq(schema.youtubeSearchCache.cacheKey, query.cacheKey)).limit(1))[0] ?? null; } catch { cacheRow = null; }
  const cached = cacheRow ? parseResults(cacheRow.resultsJson) : [];
  if (cacheRow && Date.parse(cacheRow.expiresAt) > Date.now()) return json({ query, cache: "hit", provider: "piped", results: cached, warning: null, explanation: null });

  const baseUrl = getPipedBaseUrl();
  try {
    if (!baseUrl) throw new Error("piped_base_url_missing");
    const results = await searchPiped(baseUrl, query.text, request.signal);
    try {
      const db = getDb();
      await db.delete(schema.youtubeSearchCache).where(eq(schema.youtubeSearchCache.cacheKey, query.cacheKey));
      await db.insert(schema.youtubeSearchCache).values({ cacheKey: query.cacheKey, queryJson: JSON.stringify(query), resultsJson: JSON.stringify(results), expiresAt: isoFromNowMs(TTL_MS), createdAt: nowIso() });
    } catch {
      // Plain next dev may not have D1; UI can still render provider results.
    }
    return json({ query, cache: "miss", provider: "piped", results, warning: null, explanation: null });
  } catch (error) {
    audit("youtube.search_provider_failed", { detail: error instanceof Error ? error.message : "unknown", providerConfigured: Boolean(baseUrl), cacheKey: query.cacheKey });
    if (cached.length) return json({ query, cache: "stale", provider: "piped", results: cached, warning: "Показываем сохранённые результаты: YouTube-поиск временно недоступен.", explanation: null });
    return json({ query, cache: "unavailable", provider: "piped", results: [], warning: "YouTube-поиск временно недоступен.", explanation: "Попробуйте позже или вернитесь в каталог Flowly." });
  }
}
