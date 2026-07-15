"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button, Icon } from "@flowly/ui";
import { useCompleteOnboardingMutation } from "@/features/profile/model/me-queries";
import styles from "./bot-connection-screen.module.css";

type BotPhase = "checking" | "linked" | "error";

/** S-MA-005 — mandatory final gate backed by the validated Telegram session. */
export function BotConnectionScreen() {
  const router = useRouter();
  const search = useSearchParams();
  const forced = process.env.NODE_ENV !== "production" ? search.get("bot") : null;
  const complete = useCompleteOnboardingMutation();
  const phase: BotPhase = forced === "checking" ? "checking" : forced === "error" || complete.isError ? "error" : "linked";

  const finish = async () => {
    try {
      await complete.mutateAsync();
      router.replace("/" as never);
    } catch {
      // Mutation state renders the retry UI and preserves this screen.
    }
  };

  return (
    <div className={`safe-shell flow-screen ${styles.screen}`}>
      <header className={styles.header}>
        <p className={`flow-eyebrow ${styles.eyebrow}`}>Шаг 4 · Обязательный шаг</p>
        <h1 className={`flow-title ${styles.title}`}>Telegram подтверждён</h1>
        <p className={styles.text}>Flowly получил и проверил защищённые данные запуска Telegram. После завершения настройки откроется Главная.</p>
      </header>

      <section className={`${styles.card} ${styles[`card_${phase}`]}`} aria-live="polite">
        <span className={styles.badge} aria-hidden="true"><Icon name={phase === "linked" ? "circle-check" : phase === "error" ? "triangle-alert" : "bot"} className={phase === "checking" ? styles.spin : undefined} /></span>
        <div className={styles.body} role={phase === "error" ? "alert" : undefined}>
          <h2 className={styles.status}>{phase === "linked" ? "Вход через Telegram подтверждён" : phase === "error" ? "Не удалось завершить настройку" : "Проверяем запуск…"}</h2>
          <p className={styles.hint}>{phase === "linked" ? "Можно завершить знакомство с Flowly." : phase === "error" ? "Данные не потеряны. Повторите сохранение." : "Не закрывайте Flowly."}</p>
        </div>
      </section>

      <div className={styles.actions}>
        {phase === "checking" ? <Button className={styles.primary} loading disabled>Завершить</Button> : <Button className={styles.primary} leadingIcon={<Icon name={phase === "error" ? "refresh-cw" : "check"} />} onClick={finish} loading={complete.isPending}>{phase === "error" ? "Повторить" : "Завершить"}</Button>}
      </div>
      <p className={styles.notice}>{phase === "error" ? "Завершение ещё не сохранено." : "Этот шаг завершает onboarding и открывает приложение."}</p>
    </div>
  );
}
