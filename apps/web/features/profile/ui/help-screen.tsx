"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Icon } from "@flowly/ui";
import styles from "./help-screen.module.css";

type Topic = { id: string; icon: string; title: string; text: string; to?: string };

const TOPICS: Topic[] = [
  { id: "start", icon: "play", title: "Как начать", text: "Выберите тренировку, программу или привычку на Главной.", to: "/?tab=home" },
  { id: "bot", icon: "bot", title: "Бот и напоминания", text: "Проверьте связь с ботом, если не приходят сообщения." },
  { id: "profile", icon: "settings", title: "Профиль", text: "Имя, часовой пояс, тема и отчёты меняются в настройках.", to: "/?screen=settings" },
  { id: "access", icon: "lock", title: "Доступы", text: "Если ссылка не открывается — вернитесь на Главную или попросите доступ заново." },
];

/** S-MA-096 — Help (F01/F11, §36.2; DEC-013/022/024/025). */
export function HelpScreen() {
  const router = useRouter();
  const forced = useSearchParams().get("help");
  const [botState, setBotState] = useState<"idle" | "checking" | "ok" | "error">(forced === "bot-error" ? "error" : "idle");
  const [notice, setNotice] = useState("");

  const checkBot = () => {
    if (forced === "bot-error") return setBotState("error");
    setBotState("checking");
    setTimeout(() => setBotState("ok"), 700);
  };

  const openTopic = (topic: Topic) => {
    if (topic.id === "bot") return checkBot();
    if (topic.to) return router.push(topic.to as never);
    setNotice("Раздел появится позже. Сейчас можно вернуться на Главную.");
  };

  return (
    <div className={`${styles.screen} safe-shell`}>
      <header className={styles.top}>
        <button type="button" className={styles.back} onClick={() => router.push("/?screen=profile")}><Icon name="chevron-left" />Профиль</button>
        <p className={styles.eyebrow}>S-MA-096 · Помощь</p>
        <h1 className={styles.title}>Помощь</h1>
      </header>

      <section className={styles.botCard} aria-labelledby="bot-title">
        <span className={styles.botIcon} aria-hidden="true"><Icon name={botState === "error" ? "triangle-alert" : botState === "ok" ? "check" : "bot"} /></span>
        <div>
          <h2 id="bot-title">Диагностика бота</h2>
          <p>{botState === "ok" ? "Связь активна." : botState === "error" ? "Не удалось проверить связь." : "Если напоминания не приходят — проверьте связь."}</p>
        </div>
        <Button variant={botState === "error" ? "secondary" : "primary"} loading={botState === "checking"} onClick={checkBot}>{botState === "error" ? "Повторить" : "Проверить"}</Button>
      </section>

      <nav className={styles.list} aria-label="Разделы помощи">
        {TOPICS.map((topic) => <button key={topic.id} type="button" className={styles.row} onClick={() => openTopic(topic)}>
          <span className={styles.rowIcon} aria-hidden="true"><Icon name={topic.icon} /></span>
          <span><strong>{topic.title}</strong><small>{topic.text}</small></span>
          <Icon name="chevron-right" className={styles.chevron} />
        </button>)}
      </nav>

      <div className={styles.actions}>
        <Button leadingIcon={<Icon name="external-link" />} onClick={() => setNotice("В Telegram откроется чат с ботом.")}>Открыть бота</Button>
        <Button variant="ghost" onClick={() => router.push("/?tab=home")}>На Главную</Button>
      </div>
      <p className={styles.notice} aria-live="polite">{notice}</p>
    </div>
  );
}
