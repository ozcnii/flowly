import { SourcesScreen } from "@/features/sources/ui/sources-screen";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
type Forced = "loading" | "error" | "empty" | "flowly-error" | "youtube-error" | null;

export default async function SourcesPage({ searchParams }: PageProps) {
  const params = await searchParams, value = typeof params.sources === "string" ? params.sources : "";
  const forced = ["loading", "error", "empty", "flowly-error", "youtube-error"].includes(value) ? value as Exclude<Forced, null> : null;
  return <SourcesScreen forced={forced} />;
}
