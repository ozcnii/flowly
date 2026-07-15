"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@flowly/ui";
import { useMeQuery } from "../model/me-queries";
import styles from "./profile-hub-screen.module.css";

/**
 * S-MA-080 — Profile hub (F10/F11, §9, §38; DEC-013, DEC-020, DEC-022 P-COLLECTION-READ).
 * Opened via avatar from Home. Read-only hub: navigates to child surfaces; mutations
 * happen there. Flowly name is edited separately; avatar is refreshed from Telegram.
 *
 * Product route: `/profile`. Section targets land per stage (friends/challenges→7,
 * favorites→2, reports→6, export/delete→8/F11; settings→S-MA-090, help→S-MA-096).
 */

type Section = {
  id: string;
  icon: string;
  label: string;
  hint: string;
  /** Куда ведёт: stage или slice; для preview — notice. */
  to?: string;
  stage?: string;
  danger?: boolean;
};

const SECTIONS: Section[] = [
  { id: "friends", icon: "users", label: "Друзья", hint: "Друзья и приглашения", stage: "этап 7" },
  { id: "challenges", icon: "flag", label: "Челленджи", hint: "Совместные челленджи", stage: "этап 7" },
  { id: "favorites", icon: "heart", label: "Избранное", hint: "Сохранённые тренировки", stage: "этап 2" },
  { id: "reports", icon: "chart-no-axes-column", label: "Отчёты", hint: "Недельные и месячные", stage: "этап 6" },
  { id: "settings", icon: "settings", label: "Настройки", hint: "Профиль, часовой пояс, тема, отчёты", to: "/settings" },
  { id: "notifications", icon: "bell", label: "Уведомления", hint: "Напоминания и тишина", stage: "этап 5" },
  { id: "export", icon: "download", label: "Экспорт данных", hint: "Скачать архив", stage: "этап 8" },
  { id: "delete", icon: "trash-2", label: "Удалить аккаунт", hint: "Grace 7 дней", stage: "этап 8", danger: true },
  { id: "help", icon: "circle-help", label: "Справка", hint: "Помощь и диагностика бота", to: "/help" },
];

export function ProfileHubScreen() {
  const router = useRouter();
  const me = useMeQuery();
  const user = me.data?.user;
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoUrl = user?.photoUrl && !photoFailed ? "/api/v1/me/photo" : null;
  const [notice, setNotice] = useState("");

  const onSection = (s: Section) => {
    if (s.to) {
      setNotice("");
      router.push(s.to as never);
      return;
    }
    setNotice(`«${s.label}» появится на ${s.stage}. Сейчас это preview профиля.`);
  };

  return (
    <div className={`flow-screen ${styles.screen}`}>
      <div className={`flow-top ${styles.top}`}>
        <button type="button" className={`flow-back ${styles.back}`} onClick={() => router.push("/" as never)}>
          <Icon name="chevron-left" /> Главная
        </button>
      </div>
      <header className={styles.header} aria-busy={!user}>
        <div className={styles.avatar} aria-hidden="true">
          {photoUrl ? <Image src={photoUrl} alt="" width={56} height={56} unoptimized className={styles.avatarPhoto} onError={() => setPhotoFailed(true)} /> : <Icon name="user-round" />}
        </div>
        <div className={styles.id}>
          <h1 className={`flow-title ${styles.name}`}>{user?.firstName ?? "Профиль"}</h1>
          {user?.username && <p className={styles.sub}><span className={styles.tgName}>@{user.username}</span></p>}
        </div>
        <button type="button" className={styles.edit} onClick={() => onSection(SECTIONS[4]!)}>
          Изменить
        </button>
      </header>

      <p className={styles.note} aria-live="polite">
        {notice || "Имя Flowly редактируется отдельно. Фото берём из актуального профиля Telegram."}
      </p>

      <nav className={styles.list} aria-label="Разделы профиля">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`flow-list-row ${styles.row} ${s.danger ? styles.rowDanger : ""}`}
            onClick={() => onSection(s)}
          >
            <span className={styles.rowIcon} aria-hidden="true">
              <Icon name={s.icon} />
            </span>
            <span className={styles.rowText}>
              <span className={styles.rowLabel}>{s.label}</span>
              <span className={styles.rowHint}>{s.hint}</span>
            </span>
            <Icon name="chevron-right" className={styles.chevron} />
          </button>
        ))}
      </nav>

    </div>
  );
}
