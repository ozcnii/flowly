import { and, eq } from "drizzle-orm";
import { schema, type Database } from "@flowly/database";
import type { InlineKeyboard } from "./outbound";

/** callback_data for «Готово» / «Уже выполнено» — plan: `d:<occurrenceId>` (≤64). */
export const doneCallbackData = (occurrenceId: string) => `d:${occurrenceId}`;

export function parseDoneCallback(data: string): string | null {
  if (!data.startsWith("d:") || data.length < 4) return null;
  const id = data.slice(2);
  return id.length >= 8 ? id : null;
}

export async function habitDayProgress(
  db: Database,
  userId: string,
  habitId: string,
  localDate: string,
): Promise<{ total: number; completed: number }> {
  const rows = await db
    .select({ status: schema.activityOccurrences.status })
    .from(schema.activityOccurrences)
    .where(
      and(
        eq(schema.activityOccurrences.userId, userId),
        eq(schema.activityOccurrences.entityType, "habit"),
        eq(schema.activityOccurrences.entityId, habitId),
        eq(schema.activityOccurrences.scheduledLocalDate, localDate),
      ),
    );
  return {
    total: rows.length,
    completed: rows.filter((r) => r.status === "completed").length,
  };
}

/** S-BOT-003 text §25.1 */
export function buildHabitReminderText(input: {
  title: string;
  emoji?: string | null;
  localTime?: string | null;
  completed: number;
  total: number;
}): string {
  const head = `${input.emoji?.trim() || "📌"} ${input.title}`.trim();
  const time = input.localTime ? `Время: ${input.localTime}` : null;
  const progress =
    input.total > 0 ? `Сегодня: ${input.completed} из ${input.total} выполнено` : null;
  return [head, time, progress].filter(Boolean).join("\n");
}

/** Habit reminder §25.1 full actions (T02 done + T03 snooze/skip). */
export function habitReminderKeyboard(occurrenceId: string, webAppUrl: string): InlineKeyboard {
  const id = occurrenceId;
  return [
    [{ text: "✅ Готово", callback_data: doneCallbackData(id) }],
    [
      { text: "⏰ 30 мин", callback_data: `s30:${id}` },
      { text: "⏰ 1 час", callback_data: `s60:${id}` },
    ],
    [{ text: "🕓 Выбрать время", callback_data: `sc:${id}` }],
    [{ text: "❌ Сегодня пропущу", callback_data: `sk:${id}` }],
    [{ text: "📱 Открыть Flowly", web_app: { url: webAppUrl } }],
  ];
}

export function habitDoneConfirmText(input: {
  title: string;
  emoji?: string | null;
  completed: number;
  total: number;
  idempotent: boolean;
}): string {
  const head = input.idempotent ? "Уже отмечено" : "✅ Готово";
  const line = `${input.emoji?.trim() || "📌"} ${input.title}`.trim();
  const progress =
    input.total > 0 ? `Сегодня: ${input.completed} из ${input.total} выполнено` : null;
  return [head, line, progress].filter(Boolean).join("\n");
}

export function staleCallbackText(): string {
  return "Состояние устарело или недоступно. Откройте Flowly.";
}

/** S-BOT-004 text §25.2 */
export function buildYogaReminderText(input: { title: string; durationMinutes?: number | null }): string {
  const line =
    input.durationMinutes != null && input.durationMinutes > 0
      ? `${input.title} — ${input.durationMinutes} минут`
      : input.title;
  return `🧘 Время для практики\n${line}`;
}

/** Yoga reminder §25.2 full actions (T02 + T03). */
export function yogaReminderKeyboard(
  occurrenceId: string,
  webAppUrl: string,
  workoutUrl: string,
): InlineKeyboard {
  const id = occurrenceId;
  return [
    [{ text: "▶ Начать", web_app: { url: workoutUrl } }],
    [{ text: "✅ Уже выполнено", callback_data: doneCallbackData(id) }],
    [
      { text: "⏰ 30 мин", callback_data: `s30:${id}` },
      { text: "⏰ 1 час", callback_data: `s60:${id}` },
    ],
    [{ text: "🕓 Выбрать время", callback_data: `sc:${id}` }],
    [{ text: "🌿 Сегодня отдыхаю", callback_data: `r:${id}` }],
    [{ text: "📱 Открыть Flowly", web_app: { url: webAppUrl } }],
  ];
}

/** S-BOT-005 current state after terminal/stale. */
export function currentStateText(status: string, title: string): string {
  const map: Record<string, string> = {
    completed: "выполнено",
    skipped: "пропущено",
    rest: "отдых",
    snoozed: "отложено",
    no_response: "без ответа",
    cancelled: "отменено",
    expired: "истекло",
  };
  const label = map[status] ?? status;
  return `Текущий статус: ${label}\n${title}\nОткройте Flowly для подробностей.`;
}

export function yogaDoneConfirmText(input: { title: string; idempotent: boolean }): string {
  const head = input.idempotent ? "Уже отмечено" : "✅ Уже выполнено";
  return `${head}\n🧘 ${input.title}`;
}
