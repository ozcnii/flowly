import { NextResponse } from "next/server";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getBotToken, getWebhookSecret } from "@/lib/cloudflare";

/**
 * Ops-only: set Telegram webhook using Worker secrets (bot token + webhook secret).
 * Auth: header X-Telegram-Bot-Api-Secret-Token must match TELEGRAM_WEBHOOK_SECRET
 * (same secret Telegram will send after setWebhook).
 *
 * POST { "action": "setWebhook" | "getWebhookInfo" | "getMe" | "deleteWebhook", "url"?: string }
 */
export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const secret = getWebhookSecret();
  if (!secret) return NextResponse.json({ error: "misconfigured" }, { status: 503 });

  const header = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (header.length !== secret.length || !timingSafeEqual(header, secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { action?: string; url?: string } = {};
  try {
    body = (await request.json()) as { action?: string; url?: string };
  } catch {
    body = {};
  }

  const action = body.action ?? "setWebhook";
  let token: string;
  try {
    token = getBotToken();
  } catch {
    return NextResponse.json({ error: "bot_token_missing" }, { status: 503 });
  }

  const api = async (method: string, payload?: Record<string, unknown>) => {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload ?? {}),
    });
    return (await res.json()) as Record<string, unknown>;
  };

  if (action === "getMe") {
    const data = await api("getMe");
    audit("telegram.install.getMe", { ok: Boolean(data.ok) });
    return NextResponse.json(data);
  }

  if (action === "getWebhookInfo") {
    const data = await api("getWebhookInfo");
    audit("telegram.install.getWebhookInfo", { ok: Boolean(data.ok) });
    return NextResponse.json(data);
  }

  if (action === "deleteWebhook") {
    const data = await api("deleteWebhook", { drop_pending_updates: false });
    audit("telegram.install.deleteWebhook", { ok: Boolean(data.ok) });
    return NextResponse.json(data);
  }

  // setWebhook
  const origin = body.url?.replace(/\/$/, "") || new URL(request.url).origin;
  const webhookUrl = origin.includes("/api/")
    ? origin
    : `${origin}/api/v1/telegram/webhook`;

  const data = await api("setWebhook", {
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: false,
  });

  audit("telegram.install.setWebhook", {
    ok: Boolean(data.ok),
    // never log secret or full token
    host: new URL(webhookUrl).host,
  });

  return NextResponse.json({
    ...data,
    webhook_url: webhookUrl,
    secret_configured: true,
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
