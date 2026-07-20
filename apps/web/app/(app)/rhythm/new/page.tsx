import { HabitFormScreen } from "@/features/rhythm/ui/habit-form-screen";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function NewHabitPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const returnTo = typeof params.return === "string" && params.return === "onboarding" ? "onboarding" : "app";
  return <HabitFormScreen mode="create" returnTo={returnTo} />;
}
