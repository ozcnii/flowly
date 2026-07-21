import { HabitFormScreen } from "@/features/rhythm/ui/habit-form-screen";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditHabitPage({ params }: PageProps) {
  const { id } = await params;
  return <HabitFormScreen mode="edit" habitId={id} returnTo="app" />;
}
