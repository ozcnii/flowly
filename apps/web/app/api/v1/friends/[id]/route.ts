import { NextResponse } from "next/server";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { removeFriendship } from "@/lib/friends/service";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await removeFriendship(getDb(), id, userId);
  if (result.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (result.kind === "forbidden") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  audit("friends.remove", { userId, friendshipId: id, idempotent: result.idempotent });
  return NextResponse.json({ ok: true, idempotent: result.idempotent });
}
