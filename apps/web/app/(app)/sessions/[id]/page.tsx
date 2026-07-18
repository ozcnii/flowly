import { SessionRuntimeGate } from "@/features/workout-session/ui/session-runtime-gate";

/** Client gate chooses video vs step from session payload (mode/format/youtube). */
export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionRuntimeGate id={id} />;
}
