import { NextResponse } from "next/server";
import { getDb } from "@/lib/cloudflare";
import { clearSessionCookie, readSessionToken } from "@/lib/auth/cookies";
import { destroySession } from "@/lib/auth/session";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { audit, rejectOversizedBody } from "@/lib/auth/http";

export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;
  if (!isSafeOrigin(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const token = readSessionToken(request);
  if (token) await destroySession(getDb(), token);
  audit("auth.logout", { hadToken: Boolean(token) });
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
