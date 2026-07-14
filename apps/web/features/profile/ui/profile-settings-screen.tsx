"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Icon, Select, type SelectOption } from "@flowly/ui";
import { usePatchMeMutation } from "../model/me-queries";
import styles from "./profile-settings-screen.module.css";

const WEEK_STARTS = [
  { value: 1, label: "Понедельник" },
  { value: 0, label: "Воскресенье" },
] as const;

const THEMES = [
  { value: "system", label: "Авто" },
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
] as const;

const REPORTS = [
  { id: "weekly", label: "Недельный отчёт", hint: "Итоги недели и мягкая рекомендация" },
  { id: "monthly", label: "Месячный отчёт", hint: "Длинная динамика без лишних уведомлений" },
] as const;

const detectedTimezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";

const RU_TZ_KEYWORDS: Record<string, string[]> = {
  "Europe/Moscow": ["москва", "мск", "санкт-петербург", "спб", "петербург"],
  "Europe/Kaliningrad": ["калининград"],
  "Europe/Samara": ["самара"],
  "Europe/Volgograd": ["волгоград"],
  "Europe/Saratov": ["саратов"],
  "Europe/Astrakhan": ["астрахань"],
  "Europe/Ulyanovsk": ["ульяновск"],
  "Europe/Kirov": ["киров"],
  "Asia/Yekaterinburg": ["екатеринбург", "екб"],
  "Asia/Omsk": ["омск"],
  "Asia/Novosibirsk": ["новосибирск"],
  "Asia/Barnaul": ["барнаул"],
  "Asia/Tomsk": ["томск"],
  "Asia/Krasnoyarsk": ["красноярск"],
  "Asia/Irkutsk": ["иркутск"],
  "Asia/Chita": ["чита"],
  "Asia/Yakutsk": ["якутск"],
  "Asia/Vladivostok": ["владивосток"],
  "Asia/Sakhalin": ["сахалин", "южно-сахалинск"],
  "Asia/Magadan": ["магадан"],
  "Asia/Kamchatka": ["камчатка", "петропавловск-камчатский"],
  "Asia/Anadyr": ["анадырь"],
  "Asia/Chelyabinsk": ["челябинск"],
  "Asia/Tyumen": ["тюмень"],
  "Europe/Minsk": ["минск"],
  "Europe/Kyiv": ["киев", "київ"],
  "Europe/Berlin": ["берлин"],
  "Europe/London": ["лондон"],
  "Europe/Paris": ["париж"],
  "America/New_York": ["нью-йорк"],
  "America/Los_Angeles": ["лос-анджелес"],
};

const buildTimezoneOptions = (): SelectOption[] => {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  const zones = (intl.supportedValuesOf?.("timeZone") ?? [detectedTimezone]).filter((tz, i, a) => tz.includes("/") && a.indexOf(tz) === i);
  return zones.map((tz) => ({
    value: tz,
    label: tz.slice(tz.indexOf("/") + 1).replace(/_/g, " "),
    group: tz.split("/")[0],
    meta: new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(new Date()),
    keywords: RU_TZ_KEYWORDS[tz],
  }));
};

/**
 * S-MA-090 — Profile settings (F11, §27, §38.1; DEC-020/022/024/025/027).
 * Flowly name is editable separately from Telegram. Avatar is read-only from Telegram.
 */
export function ProfileSettingsScreen() {
  const router = useRouter();
  const forced = useSearchParams().get("settings");
  const timezoneOptions = useMemo(() => buildTimezoneOptions(), []);
  const [firstName, setFirstName] = useState("Анна");
  const [timezone, setTimezone] = useState(detectedTimezone);
  const [weekStartsOn, setWeekStartsOn] = useState(1);
  const [theme, setTheme] = useState("system");
  const [reports, setReports] = useState(() => new Set<string>(["weekly"]));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "offline">("idle");
  const patchMe = usePatchMeMutation();

  const save = async () => {
    if (!firstName.trim()) {
      setStatus("error");
      return;
    }
    if (forced === "offline") return setStatus("offline");
    if (forced === "error") return setStatus("error");
    setStatus("saving");
    if (process.env.NODE_ENV !== "production") {
      if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
      setStatus("saved");
      return;
    }
    try {
      await patchMe.mutateAsync({ firstName: firstName.trim(), timezone, weekStartsOn });
      if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  const toggleReport = (id: string) => setReports((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div className={`${styles.screen} safe-shell`}>
      <header className={styles.top}>
        <button type="button" className={styles.back} onClick={() => router.push("/?screen=profile")}><Icon name="chevron-left" />Профиль</button>
        <p className={styles.eyebrow}>Настройки</p>
        <h1 className={styles.title}>Настройки профиля</h1>
      </header>

      <section className={styles.card} aria-labelledby="identity-title">
        <div className={styles.avatarRow}>
          <div className={styles.avatar} aria-hidden="true"><Icon name="user-round" /></div>
          <h2 id="identity-title">Профиль Flowly</h2>
        </div>
        <label className={styles.field}>Имя<input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={64} /></label>
      </section>

      <section className={styles.card} aria-labelledby="time-title">
        <h2 id="time-title">Время и календарь</h2>
        <label className={styles.selectLabel}>Часовой пояс</label>
        <Select options={timezoneOptions} value={timezone} onChange={setTimezone} ariaLabel="Часовой пояс" placeholder="Выбрать часовой пояс" searchPlaceholder="Город, регион или время" />
        <div className={styles.segmented} role="radiogroup" aria-label="Первый день недели">
          {WEEK_STARTS.map((d) => <button key={d.value} type="button" aria-pressed={weekStartsOn === d.value} onClick={() => setWeekStartsOn(d.value)}>{d.label}</button>)}
        </div>
      </section>

      <section className={styles.card} aria-labelledby="appearance-title">
        <h2 id="appearance-title">Тема</h2>
        <div className={`${styles.segmented} ${styles.themeTabs}`} role="radiogroup" aria-label="Тема интерфейса">
          {THEMES.map((t) => <button key={t.value} type="button" aria-pressed={theme === t.value} onClick={() => setTheme(t.value)}>{t.label}</button>)}
        </div>
      </section>

      <section className={styles.card} aria-labelledby="reports-title">
        <h2 id="reports-title">Отчёты</h2>
        <div className={styles.switches}>
          {REPORTS.map((r) => <button key={r.id} type="button" className={styles.switchRow} aria-pressed={reports.has(r.id)} onClick={() => toggleReport(r.id)}><span><strong>{r.label}</strong><small>{r.hint}</small></span><i aria-hidden="true" /></button>)}
        </div>
        <p className={styles.note}>Доставка отчётов и рекомендации закрываются на этапе 6; здесь фиксируем профильную настройку.</p>
      </section>

      <div className={styles.actions}>
        <Button onClick={save} loading={status === "saving"} leadingIcon={<Icon name="save" />}>Сохранить</Button>
        <Button variant="ghost" onClick={() => router.push("/?screen=profile")}>Отмена</Button>
      </div>
      <p className={`${styles.status} ${status === "error" ? styles.bad : ""}`} role={status === "error" ? "alert" : undefined} aria-live="polite">
        {status === "saved" ? "Сохранено. Черновик формы не теряется при повторе." : status === "offline" ? "Офлайн: оставили черновик на экране, можно повторить позже." : status === "error" ? "Не удалось сохранить. Проверьте имя и повторите." : ""}
      </p>
    </div>
  );
}
