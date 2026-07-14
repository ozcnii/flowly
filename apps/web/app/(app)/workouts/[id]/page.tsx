import { WorkoutDetailScreen } from "@/features/workout-detail/ui/workout-detail-screen";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WorkoutPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const forced = typeof query.workout === "string" && ["loading", "error", "offline", "hidden"].includes(query.workout) ? query.workout : null;
  return <WorkoutDetailScreen id={id} forced={forced as "loading" | "error" | "offline" | "hidden" | null} />;
}
