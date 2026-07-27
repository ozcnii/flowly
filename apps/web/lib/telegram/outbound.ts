import { createTelegramLogger, type TelegramMode } from "@flowly/telegram";
import { getBotToken, getTelegramMode } from "@/lib/cloudflare";

export type ChatId = number | string;

export type InlineButton =
  | { text: string; web_app: { url: string } }
  | { text: string; callback_data: string }
  | { text: string; url: string };

export type InlineKeyboard = InlineButton[][];

async function botApi(method: string, body: Record<string, unknown>): Promise<void> {
  const mode = getTelegramMode();
  if (mode === "mock") {
    createTelegramLogger(mode).log(String(body.chat_id ?? body.callback_query_id ?? "?"), `${method}:${JSON.stringify(body)}`);
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${getBotToken()}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`telegram_${method}_${res.status}`);
}

export function appHomeUrl(request: Request): string {
  const url = new URL("/", request.url);
  url.searchParams.set("tg", "1");
  url.searchParams.set("v", Date.now().toString(36));
  return url.toString();
}

/** Deep link to workout detail (S-BOT-004 Start handoff, no terminal mutation). */
export function appWorkoutUrl(request: Request, workoutId: string): string {
  const url = new URL(`/workouts/${workoutId}`, request.url);
  url.searchParams.set("tg", "1");
  url.searchParams.set("v", Date.now().toString(36));
  return url.toString();
}

export function openFlowlyKeyboard(webAppUrl: string): InlineKeyboard {
  return [[{ text: "Открыть Flowly", web_app: { url: webAppUrl } }]];
}

export async function sendMessage(
  chatId: ChatId,
  text: string,
  replyMarkup?: { inline_keyboard: InlineKeyboard },
): Promise<void> {
  await botApi("sendMessage", {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  await botApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    ...(text ? { text, show_alert: false } : {}),
  });
}

export async function editMessageText(
  chatId: ChatId,
  messageId: number,
  text: string,
  replyMarkup?: { inline_keyboard: InlineKeyboard },
): Promise<void> {
  await botApi("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

export function currentTelegramMode(): TelegramMode {
  return getTelegramMode();
}
