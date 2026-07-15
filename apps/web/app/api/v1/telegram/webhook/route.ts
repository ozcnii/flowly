import { NextResponse } from "next/server";
import { getBotToken } from "@/lib/cloudflare";

type TelegramUpdate = { message?: { chat?: { id?: number | string }; text?: string } };

const ok = (extra: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...extra });
const appUrl = (request: Request) => new URL("/", request.url).toString();

async function sendStartMessage(token: string, chatId: number | string, url: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "Flowly готов. Откройте мини‑приложение, чтобы продолжить.",
      reply_markup: { inline_keyboard: [[{ text: "Открыть Flowly", web_app: { url } }]] },
    }),
  });
  if (!res.ok) throw new Error(`telegram_sendMessage_${res.status}`);
}

export async function GET() {
  return ok({ webhook: "flowly" });
}

export async function POST(request: Request) {
  const update = await request.json().catch(() => null) as TelegramUpdate | null;
  const chatId = update?.message?.chat?.id;
  if (!chatId) return ok({ ignored: true });
  if ((update?.message?.text ?? "").trim().startsWith("/start")) {
    try { await sendStartMessage(getBotToken(), chatId, appUrl(request)); }
    catch (error) { console.error("telegram.webhook.start_failed", error); }
  }
  return ok();
}
