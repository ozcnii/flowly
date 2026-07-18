import { ProgramDetailScreen } from "@/features/programs/ui/program-detail-screen";

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProgramDetailScreen id={id} />;
}
