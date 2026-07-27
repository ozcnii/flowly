import { appHomeUrl, openFlowlyKeyboard, sendMessage, type ChatId } from "./outbound";

/** Bot command without bot username suffix: `/app@Bot` → `/app`. */
export function parseCommand(text: string): string | null {
  const raw = text.trim().split(/\s+/, 1)[0] ?? "";
  if (!raw.startsWith("/")) return null;
  return raw.split("@", 1)[0]!.toLowerCase();
}

const COPY: Record<string, string> = {
  "/start": "Flowly готов. Откройте мини‑приложение, чтобы продолжить.",
  "/app": "Откройте Flowly — Главная.",
  "/today": "Сегодня в Flowly — откройте приложение.",
};

/** S-BOT-001/002: /start, /app, /today → Mini App Home. */
export async function handleBotCommand(chatId: ChatId, text: string, request: Request): Promise<"ok" | "ignored"> {
  const cmd = parseCommand(text);
  if (!cmd || !(cmd in COPY)) return "ignored";
  await sendMessage(chatId, COPY[cmd]!, { inline_keyboard: openFlowlyKeyboard(appHomeUrl(request)) });
  return "ok";
}
