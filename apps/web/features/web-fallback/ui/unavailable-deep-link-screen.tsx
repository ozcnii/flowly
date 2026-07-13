"use client";

import { useState } from "react";
import { Button, Icon } from "@flowly/ui";
import styles from "./unavailable-deep-link-screen.module.css";

/**
 * S-WEB-002 — Unavailable deep link, outside Telegram (F01, §10/§32/§36; DEC-022 P-WEB).
 * Shown when a target deep link is opened in a regular browser. The target is
 * unavailable outside Telegram: show a SAFE reason (no target data leaked),
 * offer "open in Telegram" / re-auth, and a relevant safe exit.
 *
 * Dev-only preview (DEC-024): `?web=unavailable`.
 */
export function UnavailableDeepLinkScreen() {
  const [notice, setNotice] = useState("");
  const isDev = process.env.NODE_ENV !== "production";

  const openTelegram = () =>
    setNotice(isDev ? "В реальном Telegram здесь откроется бот Flowly на нужном экране." : "");

  return (
    <div className={`${styles.screen} safe-shell`} role="alert">
      <div className={styles.card}>
        <span className={styles.badge} aria-hidden="true">
          <Icon name="external-link" />
        </span>

        <h1 className={styles.title}>Эта ссылка открывается в Telegram</h1>
        <p className={styles.reason}>
          Материал по ссылке доступен только внутри Flowly в Telegram. Откройте
          его через бота — содержимое ссылки в браузере не показывается, чтобы
          защитить ваши данные.
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
          {notice || "Если ссылка не открывается, попросите отправить её заново или начните с Главной в Telegram."}
        </p>
      </div>
    </div>
  );
}
