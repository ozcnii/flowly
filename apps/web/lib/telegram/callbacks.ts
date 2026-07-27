import type { Database } from "@flowly/database";
import { loadOwnedHabitOccurrence } from "@/lib/habits/occurrence-status";
import { completeOccurrence, parseActionCallback, restOccurrence, skipOccurrence, snoozeOccurrence } from "./actions";
import {
  answerCallbackQuery,
  appHomeUrl,
  editMessageText,
  openFlowlyKeyboard,
  type ChatId,
} from "./outbound";
import {
  currentStateText,
  habitDayProgress,
  habitDoneConfirmText,
  staleCallbackText,
  yogaDoneConfirmText,
} from "./messages";
import { getUserByTelegramId } from "./users";

export type CallbackQuery = {
  id: string;
  data?: string;
  from?: { id: number };
  message?: { message_id?: number; chat?: { id?: number | string } };
};

/**
 * S-BOT-003/004/005 + T03: done/already-done/snooze/skip/rest.
 */
export async function handleCallbackQuery(
  db: Database,
  cq: CallbackQuery,
  request: Request,
): Promise<"ok" | "ignored" | "error"> {
  const data = cq.data?.trim() ?? "";
  if (!data) return "ignored";

  const parsed = parseActionCallback(data);
  if (!parsed) return "ignored";

  const chatId = cq.message?.chat?.id as ChatId | undefined;
  const messageId = cq.message?.message_id;
  const home = appHomeUrl(request);
  const openKb = { inline_keyboard: openFlowlyKeyboard(home) };

  const respond = async (text: string, toast?: string) => {
    await answerCallbackQuery(cq.id, toast);
    if (chatId != null && messageId != null) await editMessageText(chatId, messageId, text, openKb);
    return "ok" as const;
  };

  const stale = (toast: string) => respond(staleCallbackText(), toast);

  const tgId = cq.from?.id;
  if (tgId == null) return stale("Не удалось определить пользователя");

  const user = await getUserByTelegramId(db, tgId);
  if (!user || user.deletedAt) return stale("Пользователь не найден");

  const { action, occurrenceId } = parsed;

  // Custom snooze: handoff to Mini App (no schedule mutation here).
  if (action === "sc") {
    return respond(
      "Выберите время в Flowly.\nОткладывание только для текущего напоминания.",
      "Откройте Flowly",
    );
  }

  let result;
  if (action === "d") result = await completeOccurrence(db, user.id, occurrenceId);
  else if (action === "s30") result = await snoozeOccurrence(db, user.id, occurrenceId, 30);
  else if (action === "s60") result = await snoozeOccurrence(db, user.id, occurrenceId, 60);
  else if (action === "sk") result = await skipOccurrence(db, user.id, occurrenceId);
  else if (action === "r") result = await restOccurrence(db, user.id, occurrenceId);
  else return "ignored";

  if (result.kind === "not_found") return stale("Выполнение не найдено");
  if (result.kind === "invalid") return stale(result.message);

  // S-BOT-005: terminal re-entry → current state
  if (result.idempotent && result.status !== "snoozed") {
    return respond(currentStateText(result.status, result.title), "Уже отмечено");
  }

  if (action === "d") {
    if (result.title.startsWith("🧘") || result.title === "Тренировка") {
      return respond(
        yogaDoneConfirmText({ title: result.title.replace(/^🧘\s*/, ""), idempotent: Boolean(result.idempotent) }),
        result.idempotent ? "Уже отмечено" : "Уже выполнено",
      );
    }
    const owned = await loadOwnedHabitOccurrence(db, user.id, occurrenceId);
    if (owned) {
      const progress = await habitDayProgress(db, user.id, owned.habit.id, owned.occurrence.scheduledLocalDate);
      return respond(
        habitDoneConfirmText({
          title: owned.habit.title,
          emoji: owned.habit.emoji ?? owned.habit.icon,
          completed: progress.completed,
          total: progress.total,
          idempotent: Boolean(result.idempotent),
        }),
        result.idempotent ? "Уже отмечено" : "Готово",
      );
    }
    return respond(currentStateText("completed", result.title), "Готово");
  }

  if (action === "s30" || action === "s60") {
    return respond(`⏰ Отложено\n${result.title}\n${result.detail ?? ""}`.trim(), "Отложено");
  }
  if (action === "sk") {
    return respond(`Пропущено\n${result.title}`, result.idempotent ? "Уже отмечено" : "Пропущено");
  }
  if (action === "r") {
    return respond(`Отдых\n${result.title}`, result.idempotent ? "Уже отмечено" : "Отдых");
  }
  return respond(currentStateText(result.status, result.title));
}
