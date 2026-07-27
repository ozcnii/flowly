import { NextResponse } from "next/server";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getBotToken, getWebhookSecret } from "@/lib/cloudflare";

/**
 * Internal outbound Telegram send for scheduler (shares web TELEGRAM_BOT_TOKEN).
 * Auth: X-Telegram-Bot-Api-Secret-Token = TELEGRAM_WEBHOOK_SECRET.
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

  let body: { chat_id?: string | number; text?: string; reply_markup?: unknown; method?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (body.chat_id == null || !body.text) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  let token: string;
  try {
    token = getBotToken();
  } catch {
    return NextResponse.json({ error: "bot_token_missing" }, { status: 503 });
  }

  const method = body.method ?? "sendMessage";
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: body.chat_id,
      text: body.text,
      ...(body.reply_markup ? { reply_markup: body.reply_markup } : {}),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    description?: string;
    result?: { message_id?: number };
  };

  audit("telegram.outbound", {
    ok: Boolean(data.ok),
    status: res.status,
    // no chat body/token
  });

  if (!res.ok || !data.ok) {
    return NextResponse.json(
      { ok: false, code: data.description || `http_${res.status}` },
      { status: 502 },
    );
  }
  return NextResponse.json({
    ok: true,
    message_id: data.result?.message_id != null ? String(data.result.message_id) : undefined,
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
