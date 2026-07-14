import { AuthorProfileScreen } from "@/features/workout-author/ui/author-profile-screen";

type PageProps = {
  params: Promise<{ source: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthorPage({ params, searchParams }: PageProps) {
  const [{ source }, query] = await Promise.all([params, searchParams]);
  const forced = typeof query.author === "string" && ["loading", "error", "empty", "blocked"].includes(query.author) ? query.author : null;
  return <AuthorProfileScreen source={source} forced={forced as "loading" | "error" | "empty" | "blocked" | null} />;
}
