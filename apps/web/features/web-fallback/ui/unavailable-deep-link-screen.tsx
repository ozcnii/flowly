"use client";

import { Button, Card } from "konsta/react";
import { useState } from "react";
import { Icon } from "@flowly/ui";

/** S-WEB-002 — safe unavailable deep-link fallback (F01, §10/§32/§36; DEC-022 P-WEB). */
export function UnavailableDeepLinkScreen() {
  const [notice, setNotice] = useState(""), isDev = process.env.NODE_ENV !== "production";
  const openTelegram = () => setNotice(isDev ? "В реальном Telegram здесь откроется бот Flowly на нужном экране." : "");
  return <main className="safe-shell flow-screen grid min-h-dvh place-items-center" role="alert">
    <Card component="section" outline className="m-0 w-full max-w-md" contentWrapPadding="grid justify-items-center gap-4 p-6 text-center">
      <Icon name="external-link" className="size-12 text-accent" />
      <h1 className="m-0 text-2xl font-semibold leading-tight">Эта ссылка открывается в Telegram</h1>
      <p className="m-0 text-sm leading-relaxed text-text-muted">Материал по ссылке доступен только внутри Flowly в Telegram. Откройте его через бота — содержимое ссылки в браузере не показывается, чтобы защитить ваши данные.</p>
      <div className="grid w-full gap-2">
        <Button large rounded className="gap-2" onClick={openTelegram}><Icon name="external-link" />Открыть в Telegram</Button>
        <Button large rounded clear className="gap-2" onClick={openTelegram}><Icon name="circle-help" />Справка</Button>
      </div>
      <p className="m-0 min-h-5 text-xs leading-5 text-text-muted" aria-live="polite">{notice || "Если ссылка не открывается, попросите отправить её заново или начните с Главной в Telegram."}</p>
    </Card>
  </main>;
}
