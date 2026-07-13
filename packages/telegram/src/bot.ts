/**
 * Minimal Telegram Bot API client.
 * Used by the onboarding bot-connection gate (DEC-014): a user is considered
 * "linked" to the bot when `getChat` succeeds, i.e. they have started the bot.
 * Full bot command handling is stage 5.
 */

export class TelegramBotError extends Error {}

/** Returns true when the user has started the bot (getChat succeeds). */
export async function hasUserStartedBot(
  botToken: string,
  telegramUserId: number,
): Promise<boolean> {
  const url = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${telegramUserId}`;
  const res = await fetch(url);
  // 400/403 → the bot cannot reach the chat (user never started it).
  if (res.status === 400 || res.status === 403) return false;
  if (!res.ok) throw new TelegramBotError(`getChat failed: ${res.status}`);
  const data = (await res.json()) as { ok: boolean };
  return data.ok === true;
}
