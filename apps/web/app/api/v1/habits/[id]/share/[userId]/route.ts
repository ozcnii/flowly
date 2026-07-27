import { NextResponse } from "next/server";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { revokeHabitShare } from "@/lib/shares/service";

/** DELETE /api/v1/habits/:id/share/:userId — revoke share (PRD §33.3, §44.7). */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const sessionUserId = await getSessionUserId(request);
  if (!sessionUserId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, userId: withUserId } = await params;
  const result = await revokeHabitShare(getDb(), id, sessionUserId, withUserId);
  if (result.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  audit("habit.share_revoke", { userId: sessionUserId, habitId: id, withUserId, idempotent: result.idempotent });
  return NextResponse.json({ ok: true, idempotent: result.idempotent });
}
