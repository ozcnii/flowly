import { CatalogScreen } from "@/features/catalog/ui/catalog-screen";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const forced = typeof params.catalog === "string" && ["loading", "empty", "error", "offline"].includes(params.catalog) ? params.catalog : null;
  const source = typeof params.source === "string" && ["flowly", "youtube", "user"].includes(params.source) ? params.source : "";
  return <CatalogScreen forced={forced as "loading" | "empty" | "error" | "offline" | null} initialSource={source} />;
}
