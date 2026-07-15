"use client";

import { useRouter } from "next/navigation";
import { Button, Icon } from "@flowly/ui";
import styles from "./habit-invite-screen.module.css";

/** S-MA-004 — deferred onboarding capabilities without fake mutations. */
export function HabitInviteScreen() {
  const router = useRouter();
  return (
    <div className={`safe-shell flow-screen ${styles.screen}`}>
      <header className={styles.header}>
        <p className={`flow-eyebrow ${styles.eyebrow}`}>Шаг 3 · Возможности</p>
        <h1 className={`flow-title ${styles.title}`}>Продолжим в вашем ритме</h1>
        <p className={styles.text}>Привычки и приглашения появятся здесь вместе с полноценным сохранением. Сейчас ничего не создаём автоматически.</p>
      </header>

      <section className={styles.group} aria-labelledby="habit-onboarding-title">
        <h2 id="habit-onboarding-title" className={styles.label}>Первая привычка</h2>
        <p className={styles.hint}>Скоро можно будет создать расписание и напоминания прямо во время знакомства.</p>
        {/* TODO(E4-D5-T02): enable only with the real habit create mutation. */}
        <Button variant="secondary" leadingIcon={<Icon name="leaf" />} disabled>Создать привычку</Button>
      </section>

      <section className={styles.group} aria-labelledby="invite-onboarding-title">
        <h2 id="invite-onboarding-title" className={styles.label}>Пригласить друга</h2>
        <p className={styles.hint}>Приглашение станет доступно вместе с безопасной одноразовой ссылкой.</p>
        {/* TODO(E7-D8-T01): enable only with the real invite mutation. */}
        <Button variant="secondary" leadingIcon={<Icon name="users" />} disabled>Пригласить друга</Button>
      </section>

      <div className={styles.actions}>
        <Button className={styles.primary} onClick={() => router.push("/onboarding/bot" as never)}>Продолжить</Button>
      </div>
    </div>
  );
}
