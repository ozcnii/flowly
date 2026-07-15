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

export type YoutubeSearchPayload = { text: string; filters: YoutubeFilters; cacheKey: string };

type PipedSearchItem = {
  type?: unknown;
  url?: unknown;
  title?: unknown;
  uploaderName?: unknown;
  uploadedDate?: unknown;
  uploaded?: unknown;
  shortDescription?: unknown;
  duration?: unknown;
  views?: unknown;
  isShort?: unknown;
};
type PipedSearchResponse = { items?: unknown };
type PipedVideo = {
  title?: unknown;
  description?: unknown;
  uploadDate?: unknown;
  uploader?: unknown;
  duration?: unknown;
  views?: unknown;
  livestream?: unknown;
};

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
  return { text: parts.join(" "), filters: normalized, cacheKey: youtubeCacheKey(normalized) };
}

export function youtubeCacheKey(filters: YoutubeFilters): string {
  return `piped:v1:${fnv1a(stableJson(normalizeYoutubeFilters(filters)))}`;
}

export async function searchPiped(baseUrl: string, query: string, signal?: AbortSignal): Promise<YoutubeResult[]> {
  const url = new URL(`${baseUrl.replace(/\/+$/, "")}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("filter", "videos");
  const data = await fetchJson<PipedSearchResponse>(url, signal);
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map(normalizeSearchItem).filter((item): item is YoutubeResult => Boolean(item)).filter(isSuitableRussianYoga).slice(0, 12);
}

export async function getPipedVideo(baseUrl: string, videoId: string, signal?: AbortSignal): Promise<YoutubeResult> {
  const item = await fetchJson<PipedVideo>(new URL(`${baseUrl.replace(/\/+$/, "")}/streams/${encodeURIComponent(videoId)}`), signal);
  if (item.livestream || typeof item.title !== "string") throw new Error("invalid_piped_video");
  const durationSeconds = number(item.duration), publishedAt = date(item.uploadDate);
  if (!durationSeconds || durationSeconds <= 0) throw new Error("invalid_piped_video");
  return result({ videoId, title: item.title, channel: item.uploader, durationSeconds, publishedAt, publishedText: item.uploadDate, description: item.description, views: item.views });
}

async function fetchJson<T>(url: URL, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(8_000);
  const response = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout, headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`piped_${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) throw new Error(`piped_non_json_${response.status}_${contentType.split(";")[0] || "unknown"}`);
  return await response.json() as T;
}

function normalizeSearchItem(value: unknown): YoutubeResult | null {
  if (!value || typeof value !== "object") return null;
  const item = value as PipedSearchItem;
  if (item.type !== "stream" || item.isShort || typeof item.title !== "string" || typeof item.url !== "string") return null;
  const videoId = new URL(item.url, "https://www.youtube.com").searchParams.get("v"), durationSeconds = number(item.duration);
  if (!videoId || !durationSeconds || durationSeconds <= 0) return null;
  const uploaded = number(item.uploaded), publishedAt = uploaded ? new Date(uploaded).toISOString() : null;
  return result({ videoId, title: item.title, channel: item.uploaderName, durationSeconds, publishedAt, publishedText: item.uploadedDate, description: item.shortDescription, views: item.views });
}

function result({ videoId, title, channel, durationSeconds, publishedAt, publishedText, description, views }: { videoId: string; title: string; channel: unknown; durationSeconds: number; publishedAt: string | null; publishedText: unknown; description: unknown; views: unknown }): YoutubeResult {
  return {
    videoId,
    title: title.trim(),
    channelTitle: typeof channel === "string" && channel.trim() ? channel.trim() : "YouTube",
    durationSeconds: Math.round(durationSeconds),
    publishedAt,
    publishedText: typeof publishedText === "string" ? publishedText : null,
    description: typeof description === "string" ? description.trim() : "",
    thumbnailUrl: `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`,
    watchUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
    viewCount: number(views),
    viewCountText: null,
    languageWarning: "YouTube не гарантирует язык речи в каждом видео.",
  };
}

function isSuitableRussianYoga(item: YoutubeResult): boolean {
  const text = `${item.title} ${item.description} ${item.channelTitle}`.toLowerCase();
  if (!/(йога|yoga|виньяса|растяж|спин|медитац|пилатес|asana|vinyasa)/i.test(text)) return false;
  return /[\u0400-\u04ff]/.test(text) || /(russian|русск|для начинающих)/i.test(text);
}

const number = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) ? value : Number.isFinite(Number(value)) ? Number(value) : null;
const date = (value: unknown): string | null => { if (typeof value !== "string" && typeof value !== "number") return null; const parsed = new Date(value); return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString(); };
const stableJson = (value: Record<string, unknown>) => JSON.stringify(Object.keys(value).sort().reduce<Record<string, unknown>>((acc, key) => ({ ...acc, [key]: value[key] }), {}));
function fnv1a(input: string): string { let hash = 0x811c9dc5; for (let i = 0; i < input.length; i++) { hash ^= input.charCodeAt(i); hash = Math.imul(hash, 0x01000193) >>> 0; } return hash.toString(16).padStart(8, "0"); }
