"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@flowly/ui";
import styles from "./welcome-screen.module.css";

/**
 * S-MA-002 — Welcome/onboarding intro (F01, §10.1 step 1, DEC-022 P-WIZARD).
 * First onboarding screen: a calm introduction with a start action and an
 * explicit skip (skipping an optional step is not a successful save).
 */
export function WelcomeScreen() {
  const router = useRouter();
  const next = () => router.push("/onboarding/preferences" as never);

  return (
    <div className={`safe-shell flow-screen ${styles.screen}`}>
      <div className={styles.hero}>
        <Image
          src="/media/home-program.webp"
          alt="Спокойная практика йоги"
          fill
          priority
          sizes="100vw"
        />
        <span className={styles.shade} />
        <Image src="/brand/flowly-icon.svg" alt="Flowly" width={64} height={64} className={styles.mark} />
      </div>

      <section className={styles.body}>
        <p className={`flow-eyebrow ${styles.eyebrow}`}>Добро пожаловать</p>
        <h1 className={`flow-title ${styles.title}`}>
          Мягкий ритм йоги, привычек и спокойного дня
        </h1>
        <p className={styles.text}>
          Flowly собирает практики, привычки и напоминания в одном спокойном
          пространстве. Настроим всё за пару шагов — или начните прямо сейчас.
        </p>

        <div className={styles.actions}>
          <Button
            className={styles.primary}
            leadingIcon={<Icon name="leaf" />}
            onClick={next}
          >
            Начать
          </Button>
          <Button variant="ghost" onClick={next}>
            Пропустить
          </Button>
        </div>
        <p className={styles.hint}>Шаги знакомства можно пропустить — кроме связи с ботом.</p>
      </section>
    </div>
  );
}
