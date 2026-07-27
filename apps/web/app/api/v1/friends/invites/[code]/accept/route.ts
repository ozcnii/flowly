import { NextResponse } from "next/server";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { acceptInvite } from "@/lib/friends/service";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { code } = await params;
  const result = await acceptInvite(getDb(), code, userId);
  if (result.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (result.kind === "invalid") return NextResponse.json({ error: "invalid", message: result.message }, { status: 400 });
  audit("friends.invite_accept", { userId, code, friendshipId: result.friendshipId, idempotent: result.idempotent });
  return NextResponse.json({ ok: true, friendshipId: result.friendshipId, idempotent: result.idempotent });
}
