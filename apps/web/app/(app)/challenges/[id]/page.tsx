import { ChallengeDetailScreen } from "@/features/challenges/ui/challenge-detail-screen";

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChallengeDetailScreen id={decodeURIComponent(id)} />;
}
