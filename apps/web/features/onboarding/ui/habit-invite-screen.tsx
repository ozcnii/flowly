"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Icon } from "@flowly/ui";
import styles from "./habit-invite-screen.module.css";

type PromptChoice = "create" | "skip";
type InviteChoice = "send" | "skip";

type HabitTime = "утро" | "день" | "вечер";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

/**
 * S-MA-004 — First habit / invite prompts (F01, §10.1 steps 8,10; DEC-022 P-WIZARD).
 * Both prompts can be skipped; skipping keeps no visible mutation in preview mode.
 */
export function HabitInviteScreen() {
  const router = useRouter();
  const [habitChoice, setHabitChoice] = useState<PromptChoice>("skip");
  const [inviteChoice, setInviteChoice] = useState<InviteChoice>("skip");
  const [habitName, setHabitName] = useState("");
  const [habitTime, setHabitTime] = useState<HabitTime>("утро");
  const [habitDays, setHabitDays] = useState(new Set<string>());
  const [inviteTarget, setInviteTarget] = useState("");
  const [notice, setNotice] = useState("");

  const selectDays = (day: string) => {
    setHabitDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const skipBoth = () => {
    setHabitChoice("skip");
    setInviteChoice("skip");
    setNotice("");
    router.push("/?tab=home");
  };

  const next = () => {
    if (habitChoice === "create" && !habitName.trim()) {
      setNotice("Сначала введите название привычки.");
      return;
    }

    if (inviteChoice === "send" && !inviteTarget.trim()) {
      setNotice("Укажите цель приглашения (username или invite-link).");
      return;
    }

    setNotice("Сохраняем настройки…");
    router.push("/?tab=home");
  };

  return (
    <div className={`${styles.screen} safe-shell`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Шаг 3 · Быстрый старт</p>
        <h1 className={styles.title}>Давайте настроим первые шаги</h1>
        <p className={styles.text}>
          Сначала можно создать одну привычку и сразу пригласить друга, но оба шага
          можно безвредно пропустить.
        </p>
      </header>

      <section className={styles.group}>
        <h2 className={styles.label}>Первая привычка</h2>
        <p className={styles.hint}>Можно создать прямо сейчас или пропустить и добавить позже.</p>

        <div className={styles.actionsRow} role="radiogroup" aria-label="Создание первой привычки">
          <button
            type="button"
            className={`${styles.choice} ${habitChoice === "create" ? styles.choiceActive : ""}`}
            aria-pressed={habitChoice === "create"}
            onClick={() => setHabitChoice("create")}
          >
            Создать
          </button>
          <button
            type="button"
            className={`${styles.choice} ${habitChoice === "skip" ? styles.choiceActive : ""}`}
            aria-pressed={habitChoice === "skip"}
            onClick={() => setHabitChoice("skip")}
          >
            Пропустить
          </button>
        </div>

        {habitChoice === "create" && (
          <div className={styles.form}>
            <label className={styles.field}>
              <span>Название привычки</span>
              <input
                className={styles.input}
                value={habitName}
                onChange={(event) => setHabitName(event.target.value)}
                placeholder="Например: Утренняя зарядка"
              />
            </label>

            <label className={styles.field}>
              <span>Время напоминания</span>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={habitTime}
                  onChange={(event) => setHabitTime(event.target.value as HabitTime)}
                >
                  <option value="утро">Утро</option>
                  <option value="день">День</option>
                  <option value="вечер">Вечер</option>
                </select>
                <Icon name="chevron-down" className={styles.selectCaret} />
              </div>
            </label>

            <p className={styles.hint}>Дни выполнения</p>
            <div className={styles.days}>
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`${styles.day} ${habitDays.has(day) ? styles.dayActive : ""}`}
                  aria-pressed={habitDays.has(day)}
                  onClick={() => selectDays(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className={styles.group}>
        <h2 className={styles.label}>Пригласить друга</h2>
        <p className={styles.hint}>Можем предложить другу присоединиться, это не блокирует запуск Flowly.</p>

        <div className={styles.actionsRow} role="radiogroup" aria-label="Приглашение друга">
          <button
            type="button"
            className={`${styles.choice} ${inviteChoice === "send" ? styles.choiceActive : ""}`}
            aria-pressed={inviteChoice === "send"}
            onClick={() => setInviteChoice("send")}
          >
            Пригласить
          </button>
          <button
            type="button"
            className={`${styles.choice} ${inviteChoice === "skip" ? styles.choiceActive : ""}`}
            aria-pressed={inviteChoice === "skip"}
            onClick={() => setInviteChoice("skip")}
          >
            Пропустить
          </button>
        </div>

        {inviteChoice === "send" && (
          <label className={styles.field}>
            <span>Username или invite-link</span>
            <input
              className={styles.input}
              value={inviteTarget}
              onChange={(event) => setInviteTarget(event.target.value)}
              placeholder="@friend или https://t.me/..."
            />
          </label>
        )}
      </section>

      <div className={styles.actions}>
        <Button className={styles.primary} onClick={next}>
          Далее
        </Button>
        <Button variant="ghost" onClick={skipBoth}>
          Пропустить оба шага
        </Button>
      </div>

      <p className={styles.notice} aria-live="polite">
        {notice || "Если пропустить, Flowly продолжит без создания привычки и приглашений."}
      </p>
    </div>
  );
}
