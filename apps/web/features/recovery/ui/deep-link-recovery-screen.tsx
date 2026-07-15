"use client";

import { Button, Card, Preloader } from "konsta/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@flowly/ui";
import styles from "./deep-link-recovery-screen.module.css";

/**
 * S-MA-006 — Deep-link recovery (F01, §10, §36; DEC-013, DEC-022 P-DETAIL-READ).
 * Shown when a deep-link target is not accessible (deleted / revoked / no
 * permission / session expired). Gives a SAFE reason (no sensitive disclosure),
 * a recovery/auth action when relevant, and a relevant safe exit. Permission and
 * auth are rechecked before rendering any target data.
 *
 * Dev-only forced preview (DEC-024): `?recovery=unavailable | auth | permission`.
 * Real target resolution / access recheck is wired in downstream stages.
 */
type Variant = "unavailable" | "auth" | "permission";

const VARIANTS: Record<
  Variant,
  { icon: string; title: string; reason: string; primary: { label: string; icon: string }; secondary: { label: string; icon: string } }
> = {
  unavailable: {
    icon: "ban",
    title: "Контент недоступен",
    reason:
      "Ссылка больше не ведёт на доступный материал — возможно, его удалили или доступ отозвали. Подробности мы не раскрываем.",
    primary: { label: "На Главную", icon: "house" },
    secondary: { label: "Открыть в Telegram", icon: "external-link" },
  },
  auth: {
    icon: "lock",
    title: "Нужно снова войти",
    reason: "Сессия истекла. Войдите через Telegram ещё раз, чтобы открыть материал.",
    primary: { label: "Войти заново", icon: "refresh-cw" },
    secondary: { label: "На Главную", icon: "house" },
  },
  permission: {
    icon: "eye-off",
    title: "Нет доступа",
    reason:
      "У вас нет доступа к этому материалу. Если кажется, что это ошибка, попросите владельца поделиться заново.",
    primary: { label: "На Главную", icon: "house" },
    secondary: { label: "Справка", icon: "circle-help" },
  },
};

export function DeepLinkRecoveryScreen({ variant = "unavailable" }: { variant?: Variant }) {
  const router = useRouter();
  const v = VARIANTS[variant] ?? VARIANTS.unavailable;
  const [notice, setNotice] = useState("");
  const [reauth, setReauth] = useState(false);

  const goHome = () => router.push("/" as never);

  const onPrimary = () => {
    if (variant === "auth") {
      // preview: simulate re-auth, then safe-exit home
      setReauth(true);
      setNotice("Перепроверяем вход…");
      setTimeout(() => router.push("/" as never), 900);
      return;
    }
    goHome();
  };

  const onSecondary = () => {
    if (variant === "auth") return goHome();
    setNotice("В реальном Telegram здесь откроется внешний диалог. Сейчас это preview.");
  };

  return (
    <div className={`safe-shell flow-screen ${styles.screen}`} role="alert">
      <Card contentWrap={false} outline className={styles.card}>
        <span className={styles.badge} aria-hidden="true">
          <Icon name={v.icon} />
        </span>
        <h1 className={`flow-title ${styles.title}`}>{v.title}</h1>
        <p className={styles.reason}>{v.reason}</p>

        <div className={styles.actions}>
          <Button large rounded className={styles.primary} disabled={reauth} aria-busy={reauth || undefined} onClick={onPrimary}>{reauth ? <Preloader /> : <Icon name={v.primary.icon} />}{v.primary.label}</Button>
          <Button large rounded clear onClick={onSecondary}><Icon name={v.secondary.icon} />{v.secondary.label}</Button>
        </div>

        <p className={styles.notice} aria-live="polite">
          {notice || "Личные данные открываются только после успешной проверки доступа."}
        </p>
      </Card>
    </div>
  );
}
