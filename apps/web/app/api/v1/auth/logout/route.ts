import { NextResponse } from "next/server";
import { getDb } from "@/lib/cloudflare";
import { clearSessionCookie, readSessionToken } from "@/lib/auth/cookies";
import { destroySession } from "@/lib/auth/session";
import { isSafeOrigin } from "@/lib/auth/csrf";

export async function POST(request: Request) {
  if (!isSafeOrigin(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const token = readSessionToken(request);
  if (token) await destroySession(getDb(), token);
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
