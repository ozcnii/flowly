"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Icon } from "@flowly/ui";
import styles from "./bot-connection-screen.module.css";

/**
 * S-MA-005 — Bot connection gate (F01, §10.1 step 9, §36; DEC-014, DEC-022 P-GATE).
 * Mandatory onboarding gate: completion stays disabled until the Telegram bot
 * connection verifies. Other onboarding steps are skippable, this one is not.
 *
 * States: `checking` (verifying, completion disabled) → `linked` (verified,
 * completion enabled) | `error` (diagnostics + retry, still disabled).
 *
 * Dev-only forced preview (DEC-024): `?bot=checking | linked | error`.
 * Real `getChat` verification is wired in stage 5.
 */
type BotPhase = "checking" | "linked" | "error";

export function BotConnectionScreen() {
  const router = useRouter();
  const isDev = process.env.NODE_ENV !== "production";
  const [phase, setPhase] = useState<BotPhase>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      const forced = isDev ? new URLSearchParams(location.search).get("bot") : null;
      if (forced === "error") { if (!cancelled) setPhase("error"); return; }
      if (forced === "linked") { if (!cancelled) setPhase("linked"); return; }
      if (forced === "checking") return; // stay on the checking state
      // default preview: simulate verification, then succeed
      if (forced === null) {
        await new Promise((r) => setTimeout(r, 1200));
        if (!cancelled) setPhase("linked");
      }
    })();
    return () => { cancelled = true; };
  }, [isDev, attempt]);

  const retry = () => { setPhase("checking"); setAttempt((n) => n + 1); };
  const finish = () => router.push("/?tab=home");

  return (
    <div className={`${styles.screen} safe-shell`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Шаг 4 · Обязательный шаг</p>
        <h1 className={styles.title}>Связь с Telegram-ботом</h1>
        <p className={styles.text}>
          Без связи с ботом напоминания и уведомления не дойдут. Этот шаг нельзя
          пропустить — остальные шаги знакомства можно было пропустить.
        </p>
      </header>

      <section className={`${styles.card} ${styles[`card_${phase}`]}`} aria-live="polite">
        <span className={styles.badge} aria-hidden="true">
          <Icon
            name={phase === "linked" ? "circle-check" : phase === "error" ? "triangle-alert" : "bot"}
            className={phase === "checking" ? styles.spin : undefined}
          />
        </span>

        {phase === "checking" && (
          <div className={styles.body}>
            <h2 className={styles.status}>Проверяем связь с ботом…</h2>
            <p className={styles.hint}>Обычно это занимает пару секунд. Не закрывайте Flowly.</p>
          </div>
        )}

        {phase === "linked" && (
          <div className={styles.body}>
            <h2 className={styles.status}>Бот подключён</h2>
            <p className={styles.hint}>
              Теперь напоминания о практиках и привычках будут приходить в Telegram.
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className={styles.body} role="alert">
            <h2 className={styles.status}>Не удалось связаться с ботом</h2>
            <ul className={styles.diagnostics}>
              <li>Проверьте, что вы начали диалог с ботом Flowly.</li>
              <li>Убедитесь, что интернет стабилен, и повторите попытку.</li>
              <li>Если не помогает — откройте диагностику, мы подскажем дальше.</li>
            </ul>
          </div>
        )}
      </section>

      <div className={styles.actions}>
        {phase === "linked" ? (
          <Button className={styles.primary} leadingIcon={<Icon name="check" />} onClick={finish}>
            Продолжить
          </Button>
        ) : phase === "error" ? (
          <>
            <Button className={styles.primary} leadingIcon={<Icon name="refresh-cw" />} onClick={retry}>
              Повторить
            </Button>
            <Button variant="ghost" leadingIcon={<Icon name="info" />} onClick={retry}>
              Диагностика
            </Button>
          </>
        ) : (
          <Button className={styles.primary} loading disabled>
            Продолжить
          </Button>
        )}
      </div>

      <p className={styles.notice}>
        {phase === "linked"
          ? "Можно продолжить — связь с ботом подтверждена."
          : "Продолжить нельзя, пока связь с ботом не подтверждена."}
      </p>
    </div>
  );
}
