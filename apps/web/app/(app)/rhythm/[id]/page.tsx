import { HabitDetailScreen } from "@/features/rhythm/ui/habit-detail-screen";

type PageProps = { params: Promise<{ id: string }> };

export default async function HabitDetailPage({ params }: PageProps) {
  return <HabitDetailScreen id={(await params).id} />;
}
