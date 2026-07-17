import { VideoSessionScreen } from "@/features/workout-session/ui/video-session-screen";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  return <VideoSessionScreen id={(await params).id} />;
}
