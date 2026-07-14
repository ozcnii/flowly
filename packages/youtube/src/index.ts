export type YoutubeFilters = {
  category?: string;
  categoryName?: string;
  duration?: "short" | "medium" | "long" | string;
  difficulty?: "beginner" | "intermediate" | "advanced" | string;
  equipment?: string;
  query?: string;
};

export type YoutubeResult = {
  videoId: string;
  title: string;
  channelTitle: string;
  durationSeconds: number;
  publishedAt: string | null;
  publishedText: string | null;
  description: string;
  thumbnailUrl: string | null;
  watchUrl: string;
  viewCount: number | null;
  viewCountText: string | null;
  languageWarning: string | null;
};

export type YoutubeSearchPayload = {
  text: string;
  filters: YoutubeFilters;
  cacheKey: string;
};

type InvidiousThumb = { url?: unknown; width?: unknown; height?: unknown; quality?: unknown };
type InvidiousSearchItem = {
  type?: unknown;
  title?: unknown;
  videoId?: unknown;
  author?: unknown;
  videoThumbnails?: unknown;
  description?: unknown;
  published?: unknown;
  publishedText?: unknown;
  viewCount?: unknown;
  viewCountText?: unknown;
  lengthSeconds?: unknown;
  liveNow?: unknown;
  paid?: unknown;
  premium?: unknown;
};
type InvidiousVideo = InvidiousSearchItem & { description?: unknown };

const DURATION_TEXT: Record<string, string> = { short: "до 10 минут", medium: "20 минут", long: "30 минут" };
const DIFFICULTY_TEXT: Record<string, string> = { beginner: "для начинающих", intermediate: "средний уровень", advanced: "сложная практика" };

export function normalizeYoutubeFilters(filters: YoutubeFilters): YoutubeFilters {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => typeof v === "string" && v.trim()).map(([k, v]) => [k, String(v).trim()])) as YoutubeFilters;
}

export function buildYogaYoutubeQuery(filters: YoutubeFilters): YoutubeSearchPayload {
  const normalized = normalizeYoutubeFilters(filters);
  const parts: string[] = [];
  const push = (value?: string) => {
    const text = value?.trim();
    if (text && !parts.some((part) => part.toLowerCase() === text.toLowerCase())) parts.push(text);
  };
  push(normalized.query || "йога");
  if (normalized.categoryName && !parts.some((part) => part.toLowerCase().includes(normalized.categoryName!.toLowerCase()))) push(normalized.categoryName.toLowerCase());
  else if (normalized.category && !parts.some((part) => part.toLowerCase().includes(normalized.category!.toLowerCase()))) push(normalized.category.replace(/-/g, " "));
  if (normalized.duration) push(DURATION_TEXT[normalized.duration] ?? normalized.duration);
  if (normalized.difficulty) push(DIFFICULTY_TEXT[normalized.difficulty] ?? normalized.difficulty);
  if (normalized.equipment === "none") push("без инвентаря");
  const text = parts.join(" ");
  return { text, filters: normalized, cacheKey: youtubeCacheKey(normalized) };
}

export function youtubeCacheKey(filters: YoutubeFilters): string {
  const stable = stableJson(normalizeYoutubeFilters(filters));
  return `invidious:v2:${fnv1a(stable)}`;
}

export async function searchInvidious(baseUrl: string, query: string, filters: YoutubeFilters, signal?: AbortSignal): Promise<YoutubeResult[]> {
  const url = new URL(`${baseUrl.replace(/\/+$/, "")}/api/v1/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("hl", "ru");
  url.searchParams.set("region", "RU");
  if (filters.duration === "short" || filters.duration === "medium" || filters.duration === "long") url.searchParams.set("duration", filters.duration);
  const data = await fetchJson<unknown>(url, signal);
  return (Array.isArray(data) ? data : []).map(normalizeSearchItem).filter((x): x is YoutubeResult => Boolean(x)).filter(isSuitableRussianYoga).slice(0, 12);
}

export async function getInvidiousVideo(baseUrl: string, videoId: string, signal?: AbortSignal): Promise<YoutubeResult> {
  const url = new URL(`${baseUrl.replace(/\/+$/, "")}/api/v1/videos/${encodeURIComponent(videoId)}`);
  url.searchParams.set("hl", "ru");
  url.searchParams.set("region", "RU");
  const item = await fetchJson<InvidiousVideo>(url, signal);
  const result = normalizeSearchItem({ ...item, type: "video", videoId });
  if (!result) throw new Error("invalid_invidious_video");
  return result;
}

async function fetchJson<T>(url: URL, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`invidious_${res.status}`);
  return await res.json() as T;
}

function normalizeSearchItem(item: InvidiousSearchItem): YoutubeResult | null {
  if (item.type !== "video" || typeof item.videoId !== "string" || typeof item.title !== "string") return null;
  const durationSeconds = typeof item.lengthSeconds === "number" ? item.lengthSeconds : Number(item.lengthSeconds);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return null;
  if (item.liveNow || item.paid || item.premium) return null;
  const description = typeof item.description === "string" ? item.description : "";
  const publishedAt = typeof item.published === "number" ? new Date(item.published * 1000).toISOString() : null;
  return {
    videoId: item.videoId,
    title: item.title.trim(),
    channelTitle: typeof item.author === "string" ? item.author.trim() : "YouTube",
    durationSeconds: Math.round(durationSeconds),
    publishedAt,
    publishedText: typeof item.publishedText === "string" ? item.publishedText : null,
    description: description.trim(),
    thumbnailUrl: normalizeYoutubeThumb(pickThumb(item.videoThumbnails), item.videoId),
    watchUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(item.videoId)}`,
    viewCount: typeof item.viewCount === "number" ? item.viewCount : Number.isFinite(Number(item.viewCount)) ? Number(item.viewCount) : null,
    viewCountText: typeof item.viewCountText === "string" ? item.viewCountText : null,
    languageWarning: "YouTube не гарантирует язык речи в каждом видео.",
  };
}

function normalizeYoutubeThumb(url: string | null, videoId: string): string | null {
  if (!url) return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  try {
    const parsed = new URL(url, "https://i.ytimg.com");
    const match = parsed.pathname.match(/\/vi\/([^/]+)\//);
    return `https://i.ytimg.com/vi/${encodeURIComponent(match?.[1] ?? videoId)}/hqdefault.jpg`;
  } catch {
    return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  }
}

function pickThumb(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const thumbs = value.filter((x): x is InvidiousThumb => Boolean(x) && typeof x === "object");
  const scored = thumbs.map((thumb) => ({ url: typeof thumb.url === "string" ? thumb.url : "", width: Number(thumb.width) || 0 })).filter((x) => x.url);
  return scored.sort((a, b) => b.width - a.width)[0]?.url ?? null;
}

function isSuitableRussianYoga(result: YoutubeResult): boolean {
  const text = `${result.title} ${result.description} ${result.channelTitle}`.toLowerCase();
  if (!/(йога|yoga|виньяса|растяж|спин|медитац|пилатес|asana|vinyasa)/i.test(text)) return false;
  if (/[\u0400-\u04ff]/.test(text)) return true;
  return /(russian|русск|для начинающих)/i.test(text);
}

function stableJson(value: Record<string, unknown>): string {
  return JSON.stringify(Object.keys(value).sort().reduce<Record<string, unknown>>((acc, key) => ({ ...acc, [key]: value[key] }), {}));
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
