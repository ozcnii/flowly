import { NextResponse } from "next/server";
import { InitDataValidationError, verifyInitData, type TelegramInitUser } from "@flowly/telegram";
import { INIT_DATA_FRESHNESS_MS } from "@flowly/core";
import { getBotToken, getDb } from "@/lib/cloudflare";
import { createSession } from "@/lib/auth/session";
import { findOrCreateUser } from "@/lib/auth/users";
import { setSessionCookie } from "@/lib/auth/cookies";
import { isSafeOrigin } from "@/lib/auth/csrf";
import { rateLimit } from "@/lib/auth/rate-limit";
import { isDevEmulationEnabled } from "@/lib/auth/dev";
import { telegramAuthSchema } from "@/lib/auth/schemas";

function json(status: number, body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, { status, ...init });
}

export async function POST(request: Request) {
  // Dev-only emulation (PRD §10.3). Bypasses initData verification; guarded to
  // NEVER run in production.
  if (isDevEmulationEnabled()) {
    const devHeader = request.headers.get("x-flowly-dev-user");
    if (devHeader) {
      try {
        const devUser = JSON.parse(devHeader) as TelegramInitUser;
        const db = getDb();
        const { id: userId } = await findOrCreateUser(db, devUser);
        const token = await createSession(db, userId);
        const res = json(200, { ok: true, userId, dev: true });
        setSessionCookie(res, token);
        return res;
      } catch {
        return json(400, { error: "bad_dev_user" });
      }
    }
  }

  if (!isSafeOrigin(request)) return json(403, { error: "forbidden" });

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (!rateLimit(`auth:${ip}`, 20, 60_000)) return json(429, { error: "rate_limited" });

  const parsed = telegramAuthSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return json(400, { error: "bad_request" });

  try {
    const verified = await verifyInitData(parsed.data.initData, getBotToken(), INIT_DATA_FRESHNESS_MS);
    const db = getDb();
    const { id: userId } = await findOrCreateUser(db, verified.user);
    const token = await createSession(db, userId);
    const res = json(200, { ok: true, userId });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    if (error instanceof InitDataValidationError) return json(401, { error: "unauthorized" });
    throw error;
  }
}
