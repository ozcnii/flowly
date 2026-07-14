"use client";

import { useState } from "react";
import { Button, Icon } from "@flowly/ui";
import styles from "./open-via-telegram-screen.module.css";

/**
 * S-WEB-001 — Outside-Telegram fallback (F01, §10.3; DEC-022 P-WEB).
 * Shown when the production app is opened in a regular browser (generic
 * launch, no target). Unauthenticated. Offers only "open through Telegram"
 * and a relevant safe exit — no app data is rendered. Local/test may emulate
 * a Telegram user instead.
 *
 * Dev-only preview (DEC-024): `?web=open`.
 */
export function OpenViaTelegramScreen() {
  const [notice, setNotice] = useState("");
  const isDev = process.env.NODE_ENV !== "production";

  const openTelegram = () =>
    setNotice(isDev ? "В реальном Telegram здесь откроется бот Flowly." : "");

  return (
    <div className={`safe-shell flow-screen ${styles.screen}`}>
      <div className={styles.card}>
        <span className={styles.badge} aria-hidden="true">
          <Icon name="external-link" />
        </span>

        <h1 className={`flow-title ${styles.title}`}>Откройте Flowly через Telegram</h1>
        <p className={styles.text}>
          Flowly работает внутри Telegram. Откройте приложение из бота Flowly,
          чтобы войти и продолжить — отдельная регистрация не нужна.
        </p>

        <div className={styles.actions}>
          <Button className={styles.primary} leadingIcon={<Icon name="external-link" />} onClick={openTelegram}>
            Открыть в Telegram
          </Button>
          <Button variant="ghost" leadingIcon={<Icon name="circle-help" />} onClick={openTelegram}>
            Справка
          </Button>
        </div>

        <p className={styles.notice} aria-live="polite">
          {notice || (isDev ? "Локально и в test-среде можно эмулировать Telegram-пользователя." : "Личные данные не открываются вне Telegram.")}
        </p>
      </div>
    </div>
  );
}
