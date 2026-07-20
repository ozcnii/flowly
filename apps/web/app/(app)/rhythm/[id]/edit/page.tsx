import { HabitFormScreen } from "@/features/rhythm/ui/habit-form-screen";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function EditHabitPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  await searchParams; // edit is app-only (onboarding uses create)
  return <HabitFormScreen mode="edit" habitId={id} returnTo="app" />;
}
