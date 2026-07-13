/**
 * Telegram-режимы (PRD §49.4): `mock` | `test` | `production`.
 *
 * В `mock` исходящие сообщения пишутся в локальный журнал (console + buffer) и
 * **не** вызывают реальный Telegram API. Реальный outbound sender (этап 5)
 * обязан маршрутизировать отправку через `resolveTelegramMode`/`createTelegramLogger`.
 */

export type TelegramMode = "mock" | "test" | "production";

export interface TelegramModeEnv {
  /** Явный режим; при отсутствии — fallback по окружению. */
  TELEGRAM_MODE?: string;
  NODE_ENV?: string;
}

const MODES: readonly TelegramMode[] = ["mock", "test", "production"];

/**
 * Явный `TELEGRAM_MODE` выигрывает. Иначе: не-production `NODE_ENV` (next dev /
 * local) → `mock`; иначе → `production` (deployed default; test-окружение должно
 * явно ставить `TELEGRAM_MODE=test`).
 */
export function resolveTelegramMode(env: TelegramModeEnv): TelegramMode {
  const explicit = env.TELEGRAM_MODE?.trim().toLowerCase();
  if (explicit && (MODES as readonly string[]).includes(explicit)) {
    return explicit as TelegramMode;
  }
  if (env.NODE_ENV && env.NODE_ENV !== "production") return "mock";
  return "production";
}

export interface MockMessage {
  readonly id: string;
  readonly to: string | number;
  readonly body: string;
  readonly ts: string;
}

export interface TelegramLogger {
  readonly mode: TelegramMode;
  /**
   * В `mock` — записывает исходящее сообщение в локальный журнал (console +
   * buffer), без сети. Вне `mock` — no-op (реальный sender — этап 5).
   * Возвращает записанное сообщение или `null`.
   */
  log(recipient: string | number, body: string): MockMessage | null;
  /** Считать и очистить буфер mock-сообщений (инспекция в dev/тестах). */
  drain(): MockMessage[];
}

/** Создаёт logger для текущего режима. `buffer` опционален (внутренний по умолчанию). */
export function createTelegramLogger(mode: TelegramMode, buffer: MockMessage[] = []): TelegramLogger {
  let seq = 0;
  return {
    mode,
    log(recipient, body) {
      if (mode !== "mock") return null;
      const msg: MockMessage = {
        id: `mock_${Date.now()}_${seq++}`,
        to: recipient,
        body,
        ts: new Date().toISOString(),
      };
      buffer.push(msg);
      console.log(`[telegram:mock] -> ${recipient}: ${body}`);
      return msg;
    },
    drain() {
      const out = buffer.slice();
      buffer.length = 0;
      return out;
    },
  };
}
