/** Share invite with a friend — never open bot?start= as the inviter (that is for the invitee). */

export function telegramShareUrl(botDeepLink: string, text = "Присоединяйся ко мне в Flowly") {
  return `https://t.me/share/url?url=${encodeURIComponent(botDeepLink)}&text=${encodeURIComponent(text)}`;
}

export function shareInviteLink(botDeepLink: string): "share" | "clipboard" | "shown" {
  const share = telegramShareUrl(botDeepLink);
  const tg = window.Telegram?.WebApp as unknown as { openTelegramLink?: (u: string) => void } | undefined;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(share);
    return "share";
  }
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(botDeepLink);
    return "clipboard";
  }
  window.open(share, "_blank", "noopener,noreferrer");
  return "shown";
}

export async function copyInviteLink(botDeepLink: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(botDeepLink);
    return true;
  } catch {
    return false;
  }
}

export function inviteBotLink(code: string) {
  return `https://t.me/getflowlybot?start=invite_${code.toUpperCase()}`;
}
