"use client";

import { Button, Card } from "konsta/react";
import { useState } from "react";
import { Icon } from "@flowly/ui";

/** S-WEB-001 — safe outside-Telegram fallback (F01, §10.3; DEC-022 P-WEB). */
export function OpenViaTelegramScreen() {
  const [notice, setNotice] = useState(""), isDev = process.env.NODE_ENV !== "production";
  const openTelegram = () => setNotice(isDev ? "В реальном Telegram здесь откроется бот Flowly." : "");
  return <main className="safe-shell flow-screen grid min-h-dvh place-items-center">
    <Card component="section" outline className="m-0 w-full max-w-md" contentWrapPadding="grid justify-items-center gap-4 p-6 text-center">
      <Icon name="external-link" className="size-12 text-accent" />
      <h1 className="m-0 text-2xl font-semibold leading-tight">Откройте Flowly через Telegram</h1>
      <p className="m-0 text-sm leading-relaxed text-text-muted">Flowly работает внутри Telegram. Откройте приложение из бота Flowly, чтобы войти и продолжить — отдельная регистрация не нужна.</p>
      <div className="grid w-full gap-2">
        <Button large rounded className="gap-2" onClick={openTelegram}><Icon name="external-link" />Открыть в Telegram</Button>
        <Button large rounded clear className="gap-2" onClick={openTelegram}><Icon name="circle-help" />Справка</Button>
      </div>
      <p className="m-0 min-h-5 text-xs leading-5 text-text-muted" aria-live="polite">{notice || (isDev ? "Локально и в test-среде можно эмулировать Telegram-пользователя." : "Личные данные не открываются вне Telegram.")}</p>
    </Card>
  </main>;
}
