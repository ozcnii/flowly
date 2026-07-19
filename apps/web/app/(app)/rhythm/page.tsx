import { RhythmScreen } from "@/features/rhythm/ui/rhythm-screen";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RhythmPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // Dev-only card/list preview (T01). Ignored in production — production always renders the empty state.
  const demo = process.env.NODE_ENV !== "production" && typeof params.rhythm === "string" && params.rhythm === "demo";
  return <RhythmScreen demo={demo} />;
}
