import { YoutubeSearchScreen } from "@/features/youtube-search/ui/youtube-search-screen";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function YoutubePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const forced = typeof params.youtube === "string" && ["loading", "error", "empty", "stale", "saved"].includes(params.youtube) ? params.youtube : null;
  return <YoutubeSearchScreen forced={forced as "loading" | "error" | "empty" | "stale" | "saved" | null} filters={{ category: typeof params.category === "string" ? params.category : undefined, duration: typeof params.duration === "string" ? params.duration : undefined, difficulty: typeof params.difficulty === "string" ? params.difficulty : undefined, equipment: typeof params.equipment === "string" ? params.equipment : undefined, query: typeof params.q === "string" ? params.q : undefined }} />;
}
