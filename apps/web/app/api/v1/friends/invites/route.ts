import { NextResponse } from "next/server";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { createInvite } from "@/lib/friends/service";

/** POST /api/v1/friends/invites — create one-use 7-day invite code. */
export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const invite = await createInvite(getDb(), userId);
  audit("friends.invite_create", { userId, code: invite.code });
  const payload = `invite_${invite.code}`;
  // Production bot @getflowlybot (HANDOFF); payload → /start invite_<code>
  const botDeepLink = `https://t.me/getflowlybot?start=${payload}`;
  return NextResponse.json({
    code: invite.code,
    expiresAt: invite.expiresAt,
    deepLinkPayload: payload,
    botDeepLink,
    friendshipId: invite.friendshipId,
  });
}
