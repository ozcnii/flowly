import { StepSessionScreen } from "@/features/workout-session/ui/step-session-screen";
import { VideoSessionScreen } from "@/features/workout-session/ui/video-session-screen";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { getOwnedSession } from "@/lib/workout-sessions";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  let screen: "video" | "step" = "step";
  try {
    const userId = await getSessionUserId({} as Request).catch(() => null);
    if (userId) {
      const session = await getOwnedSession(getDb(), userId, id);
      if (session) {
        const isVideo = session.mode === "video" || (session.mode === null && session.workout.format === "video");
        screen = isVideo ? "video" : "step";
      }
    }
  } catch { /* dev fallback: step */ }
  return screen === "video" ? <VideoSessionScreen id={id} /> : <StepSessionScreen id={id} />;
}
