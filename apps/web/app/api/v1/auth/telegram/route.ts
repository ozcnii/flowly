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
import { audit, rejectOversizedBody } from "@/lib/auth/http";

function json(status: number, body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, { status, ...init });
}

export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  // Dev-only emulation (PRD §10.3). Bypasses initData verification; guarded to
  // NEVER run in production.
  if (isDevEmulationEnabled()) {
    const devHeader = request.headers.get("x-flowly-dev-user");
    if (devHeader) {
      try {
        const devUser = JSON.parse(decodeURIComponent(devHeader)) as TelegramInitUser;
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
  if (!rateLimit(`auth:${ip}`, 20, 60_000)) {
    audit("auth.login_failed", { ip, reason: "rate_limited" });
    return json(429, { error: "rate_limited" });
  }

  const parsed = telegramAuthSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    audit("auth.login_failed", {
      ip,
      reason: "bad_request",
      initDataLen: request.headers.get("x-flowly-tg-init-data-len") ?? "missing",
      webApp: request.headers.get("x-flowly-tg-webapp") ?? "missing",
      platform: request.headers.get("x-flowly-tg-platform") ?? "missing",
      hashData: request.headers.get("x-flowly-tg-hash-data") ?? "missing",
      searchData: request.headers.get("x-flowly-tg-search-data") ?? "missing",
    });
    return json(400, { error: "bad_request" });
  }

  try {
    const verified = await verifyInitData(parsed.data.initData, getBotToken(), INIT_DATA_FRESHNESS_MS);
    const db = getDb();
    const { id: userId } = await findOrCreateUser(db, verified.user);
    const token = await createSession(db, userId);
    audit("auth.login", { userId, ip });
    const res = json(200, { ok: true, userId });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    if (error instanceof InitDataValidationError) {
      audit("auth.login_failed", {
        ip,
        reason: "invalid_init_data",
        detail: error.message,
        initDataLen: request.headers.get("x-flowly-tg-init-data-len") ?? "missing",
        webApp: request.headers.get("x-flowly-tg-webapp") ?? "missing",
        platform: request.headers.get("x-flowly-tg-platform") ?? "missing",
        hashData: request.headers.get("x-flowly-tg-hash-data") ?? "missing",
        searchData: request.headers.get("x-flowly-tg-search-data") ?? "missing",
      });
      return json(401, { error: "unauthorized" });
    }
    throw error;
  }
}
