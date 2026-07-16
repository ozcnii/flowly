"use client";

import { Button, Card, Preloader } from "konsta/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@flowly/ui";

/** S-MA-006 — safe deep-link recovery (F01, §10, §36; DEC-013/022). */
type Variant = "unavailable" | "auth" | "permission";
const VARIANTS: Record<Variant, { icon: string; title: string; reason: string; primary: { label: string; icon: string }; secondary: { label: string; icon: string } }> = {
  unavailable: { icon: "ban", title: "Контент недоступен", reason: "Ссылка больше не ведёт на доступный материал — возможно, его удалили или доступ отозвали. Подробности мы не раскрываем.", primary: { label: "На Главную", icon: "house" }, secondary: { label: "Открыть в Telegram", icon: "external-link" } },
  auth: { icon: "lock", title: "Нужно снова войти", reason: "Сессия истекла. Войдите через Telegram ещё раз, чтобы открыть материал.", primary: { label: "Войти заново", icon: "refresh-cw" }, secondary: { label: "На Главную", icon: "house" } },
  permission: { icon: "eye-off", title: "Нет доступа", reason: "У вас нет доступа к этому материалу. Если кажется, что это ошибка, попросите владельца поделиться заново.", primary: { label: "На Главную", icon: "house" }, secondary: { label: "Справка", icon: "circle-help" } },
};

export function DeepLinkRecoveryScreen({ variant = "unavailable" }: { variant?: Variant }) {
  const router = useRouter(), v = VARIANTS[variant] ?? VARIANTS.unavailable, [notice, setNotice] = useState(""), [reauth, setReauth] = useState(false);
  const goHome = () => router.push("/" as never);
  const onPrimary = () => { if (variant !== "auth") return goHome(); setReauth(true); setNotice("Перепроверяем вход…"); setTimeout(goHome, 900); };
  const onSecondary = () => { if (variant === "auth") return goHome(); setNotice("В реальном Telegram здесь откроется внешний диалог. Сейчас это preview."); };

  return <main className="safe-shell flow-screen grid min-h-dvh place-items-center" role="alert">
    <Card component="section" outline className="m-0 w-full max-w-md" contentWrapPadding="grid justify-items-center gap-4 p-6 text-center">
      <Icon name={v.icon} className="size-12 text-accent" />
      <h1 className="m-0 text-2xl font-semibold leading-tight">{v.title}</h1>
      <p className="m-0 text-sm leading-relaxed text-text-muted">{v.reason}</p>
      <div className="grid w-full gap-2">
        <Button large rounded disabled={reauth} aria-busy={reauth || undefined} className="gap-2" onClick={onPrimary}>{reauth ? <Preloader /> : <Icon name={v.primary.icon} />}{v.primary.label}</Button>
        <Button large rounded clear className="gap-2" onClick={onSecondary}><Icon name={v.secondary.icon} />{v.secondary.label}</Button>
      </div>
      <p className="m-0 min-h-5 text-xs leading-5 text-text-muted" aria-live="polite">{notice || "Личные данные открываются только после успешной проверки доступа."}</p>
    </Card>
  </main>;
}
