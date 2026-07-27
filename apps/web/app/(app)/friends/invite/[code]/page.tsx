import { InviteAcceptScreen } from "@/features/friends/ui/invite-accept-screen";

export default async function InviteAcceptPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <InviteAcceptScreen code={decodeURIComponent(code)} />;
}
