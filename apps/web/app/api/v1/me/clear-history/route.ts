import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session-user";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getDb } from "@/lib/cloudflare";
import { clearUserHistory } from "@/lib/me/data-lifecycle";

/** POST /api/v1/me/clear-history — DEC-020 clear occurrences/history, keep objects. */
export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await clearUserHistory(getDb(), userId);
  audit("me.clear_history", { userId, ...result });
  return NextResponse.json({ ok: true, ...result });
}
