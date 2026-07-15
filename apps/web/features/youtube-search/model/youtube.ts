export type YoutubeFilters = {
  category?: string;
  duration?: string;
  difficulty?: string;
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

export type YoutubeSearchResponse = {
  query: { text: string; filters: YoutubeFilters; cacheKey: string };
  cache: "hit" | "miss" | "stale" | "unavailable";
  provider: "piped";
  results: YoutubeResult[];
  warning: string | null;
  explanation: string | null;
};

export type SaveYoutubeResponse = { created: boolean; workout: { id: string; title: string; youtubeVideoId: string | null } };
