import { eq } from "drizzle-orm";
import { schema, type Database } from "@flowly/database";
import { acceptInvite } from "@/lib/friends/service";
import { appHomeUrl, openFlowlyKeyboard, sendMessage, type ChatId } from "./outbound";

/** Bot command without bot username suffix: `/app@Bot` → `/app`. */
export function parseCommand(text: string): string | null {
  const raw = text.trim().split(/\s+/, 1)[0] ?? "";
  if (!raw.startsWith("/")) return null;
  return raw.split("@", 1)[0]!.toLowerCase();
}

/** `/start invite_ABC123` payload after command token. */
export function parseStartPayload(text: string): string | null {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const cmd = (parts[0] ?? "").split("@", 1)[0]!.toLowerCase();
  if (cmd !== "/start") return null;
  return parts[1] ?? null;
}

const COPY: Record<string, string> = {
  "/start": "Flowly готов. Откройте мини‑приложение, чтобы продолжить.",
  "/app": "Откройте Flowly — Главная.",
  "/today": "Сегодня в Flowly — откройте приложение.",
};

function appInviteUrl(request: Request, code: string): string {
  const url = new URL(`/friends/invite/${encodeURIComponent(code)}`, request.url);
  url.searchParams.set("tg", "1");
  url.searchParams.set("v", Date.now().toString(36));
  return url.toString();
}

function appFriendsUrl(request: Request): string {
  const url = new URL("/friends", request.url);
  url.searchParams.set("tg", "1");
  url.searchParams.set("v", Date.now().toString(36));
  return url.toString();
}

/** S-BOT-001/002 + S-BOT-007 invite deep link. */
export async function handleBotCommand(
  chatId: ChatId,
  text: string,
  request: Request,
  db?: Database,
  telegramUserId?: string | number | null,
): Promise<"ok" | "ignored"> {
  const payload = parseStartPayload(text);
  if (payload?.startsWith("invite_")) {
    const code = payload.slice("invite_".length).toUpperCase();
    if (!code) return "ignored";

    if (db && telegramUserId != null) {
      const invite = (
        await db.select().from(schema.inviteLinks).where(eq(schema.inviteLinks.code, code)).limit(1)
      )[0];
      const user = (
        await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.telegramId, String(telegramUserId)))
          .limit(1)
      )[0];

      if (invite && user && invite.ownerId === user.id) {
        await sendMessage(
          chatId,
          "Это ваша пригласительная ссылка. Отправьте её другу — не открывайте сами. В приложении: Профиль → Друзья → Отправить.",
          { inline_keyboard: openFlowlyKeyboard(appHomeUrl(request)) },
        );
        return "ok";
      }

      // Already known user → accept immediately on deep link (no extra tap).
      if (invite && user && invite.ownerId !== user.id) {
        const result = await acceptInvite(db, code, user.id);
        if (result.kind === "ok") {
          await sendMessage(
            chatId,
            result.idempotent ? "Вы уже друзья в Flowly." : "Готово — вы теперь друзья в Flowly.",
            { inline_keyboard: [[{ text: "Друзья", web_app: { url: appFriendsUrl(request) } }]] },
          );
          return "ok";
        }
        const failMsg = result.kind === "invalid" ? result.message : "Не удалось принять приглашение.";
        await sendMessage(chatId, failMsg, {
          inline_keyboard: openFlowlyKeyboard(appInviteUrl(request, code)),
        });
        return "ok";
      }
    }

    // New user (no D1 row yet) → open Mini App invite; page auto-accepts after auth.
    await sendMessage(chatId, "Вас пригласили в друзья в Flowly. Откройте приложение — приглашение примется автоматически.", {
      inline_keyboard: [[{ text: "Принять приглашение", web_app: { url: appInviteUrl(request, code) } }]],
    });
    return "ok";
  }

  const cmd = parseCommand(text);
  if (!cmd || !(cmd in COPY)) return "ignored";
  await sendMessage(chatId, COPY[cmd]!, { inline_keyboard: openFlowlyKeyboard(appHomeUrl(request)) });
  return "ok";
}
