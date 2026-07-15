"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Icon, InlineError, Select, type SelectOption } from "@flowly/ui";
import { useMeQuery, usePatchMeMutation, type PublicUser } from "@/features/profile/model/me-queries";
import { ApiError } from "@/lib/api/client";
import styles from "./preferences-screen.module.css";

const WEEK_STARTS = [
  { value: 1, label: "Понедельник" },
  { value: 0, label: "Воскресенье" },
] as const;

const DURATIONS = [10, 20, 30, 45] as const;

const INTERESTS = [
  "Растяжка",
  "Сила",
  "Расслабление",
  "Утренняя",
  "Для спины",
  "Медитация",
] as const;

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;
const TIMES = ["Утро", "День", "Вечер"] as const;

const detectedTimezone =
  typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";

/** IANA timezones grouped by region (no manual typing — pick from a list). */
const TIMEZONE_GROUPS: Record<string, string[]> = (() => {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  const all = (intl.supportedValuesOf?.("timeZone") ?? []).filter((tz) => tz.includes("/"));
  const groups: Record<string, string[]> = {};
  const push = (tz: string) => {
    const region = tz.split("/")[0] ?? "Other";
    (groups[region] ??= []).push(tz);
  };
  for (const tz of all) push(tz);
  if (detectedTimezone !== "UTC" && !all.includes(detectedTimezone)) push(detectedTimezone);
  return groups;
})();

/** Russian city aliases so users can search in Cyrillic (e.g. «самара»). */
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
  "Europe/Chisinau": ["кишинёв", "кишинев"],
  "Asia/Tbilisi": ["тбилиси"],
  "Asia/Yerevan": ["ереван"],
  "Asia/Baku": ["баку"],
  "Asia/Almaty": ["алматы", "алма-ата", "астана", "нур-султан"],
  "Asia/Tashkent": ["ташкент"],
  "Asia/Samarkand": ["самарканд"],
  "Asia/Bishkek": ["бишкек"],
  "Asia/Dushanbe": ["душанбе"],
  "Asia/Ashgabat": ["ашхабад"],
  "Asia/Dubai": ["дубай"],
  "Asia/Istanbul": ["стамбул"],
  "Asia/Nicosia": ["никосия", "кипр"],
  "Asia/Jerusalem": ["тель-авив", "иерусалим"],
  "Europe/Berlin": ["берлин"],
  "Europe/London": ["лондон"],
  "Europe/Paris": ["париж"],
  "Europe/Amsterdam": ["амстердам"],
  "Europe/Brussels": ["брюссель"],
  "Europe/Vienna": ["вена"],
  "Europe/Prague": ["прага"],
  "Europe/Warsaw": ["варшава"],
  "Europe/Rome": ["рим"],
  "Europe/Madrid": ["мадрид"],
  "Europe/Athens": ["афины"],
  "Europe/Helsinki": ["хельсинки"],
  "Europe/Stockholm": ["стокгольм"],
  "Europe/Oslo": ["осло"],
  "Europe/Copenhagen": ["копенгаген"],
  "Europe/Zurich": ["цюрих", "берн", "базель"],
  "Europe/Riga": ["рига"],
  "Europe/Vilnius": ["вильнюс"],
  "Europe/Tallinn": ["таллин"],
  "America/New_York": ["нью-йорк"],
  "America/Los_Angeles": ["лос-анджелес"],
  "America/Chicago": ["чикаго"],
  "America/Toronto": ["торонто"],
};

const getTimezoneMeta = (timezone: string) => {
  const now = new Date();
  const time = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    hour12: false,
  }).format(now);

  let offset = "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(now);
    offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(now);
    offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  }

  return [offset, time].filter(Boolean).join(" · ");
};

const buildTimezoneOptions = (): SelectOption[] =>
  Object.entries(TIMEZONE_GROUPS).flatMap(([region, list]) =>
    list.map((tz) => ({
      value: tz,
      label: tz.slice(tz.indexOf("/") + 1).replace(/_/g, " "),
      group: region,
      meta: getTimezoneMeta(tz),
      keywords: RU_TZ_KEYWORDS[tz],
    })),
  );

/**
 * S-MA-003 — Timezone & preferences (F01, §10.1 steps 4–7, DEC-022 P-WIZARD).
 * Timezone + week start persist via PATCH /me (foundation locale settings).
 * Duration / interests / schedule are recommendation inputs held in-component
 * and persisted with stages 2/4 (workout_categories, habits). Selections survive
 * retry within the session.
 */
export function PreferencesScreen() {
  const me = useMeQuery();
  return me.data ? <PreferencesForm user={me.data.user} /> : <div className={`safe-shell flow-screen ${styles.screen}`} aria-busy="true"><p className="flow-subtitle">Загружаем настройки…</p></div>;
}

function PreferencesForm({ user }: { user: PublicUser }) {
  const timezoneOptions = useMemo(() => buildTimezoneOptions(), []);
  const router = useRouter();
  const [timezone, setTimezone] = useState(user.timezone === "UTC" ? detectedTimezone : user.timezone);
  const [weekStartsOn, setWeekStartsOn] = useState<number>(user.weekStartsOn);
  const [duration, setDuration] = useState<number>(20);
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [days, setDays] = useState<Set<string>>(new Set());
  const [times, setTimes] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState<{ title: string; description: string; reauth?: boolean } | null>(null);
  const patchMe = usePatchMeMutation();

  const toggle = (set: Set<string>, value: string, update: (next: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    update(next);
  };

  const next = async () => {
    setSaveError(null);
    setNotice("Сохраняем настройки…");
    try {
      await patchMe.mutateAsync({ timezone, weekStartsOn });
      router.push("/onboarding/capabilities" as never);
    } catch (error) {
      setNotice("");
      if (error instanceof ApiError && error.status === 401) setSaveError({ title: "Сессия истекла", description: "Перезагрузите Flowly, чтобы снова подтвердить вход через Telegram.", reauth: true });
      else if (!navigator.onLine) setSaveError({ title: "Нет соединения", description: "Введённые настройки сохранены на экране. Подключитесь к интернету и повторите." });
      else setSaveError({ title: "Настройки не сохранены", description: error instanceof ApiError && error.status === 400 ? "Проверьте часовой пояс и начало недели, затем повторите." : "Сервер временно не принял изменения. Введённые настройки сохранены на экране." });
    }
  };

  const skip = () => router.push("/onboarding/capabilities" as never);

  return (
    <div className={`safe-shell flow-screen ${styles.screen}`}>
      <header className={styles.header}>
        <p className={`flow-eyebrow ${styles.eyebrow}`}>Шаг 2 · Настройки</p>
        <h1 className={`flow-title ${styles.title}`}>Подстроим под вас</h1>
        <p className={styles.text}>Часовой пояс и начало недели нужны для точного расписания. Остальное подскажет ваши интересы.</p>
      </header>

      <section className={styles.group}>
        <h2 className={styles.label}>Часовой пояс</h2>
        <Select
          options={timezoneOptions}
          value={timezone}
          onChange={setTimezone}
          ariaLabel="Часовой пояс"
          placeholder="Выбрать часовой пояс"
          searchPlaceholder="Поиск города, региона или времени"
        />
        <p className={styles.hint}>Определено по устройству. Если неверно — выберите из списка.</p>
      </section>

      <section className={styles.group}>
        <h2 className={styles.label}>Начало недели</h2>
        <div className={styles.radios} role="radiogroup" aria-label="Начало недели">
          {WEEK_STARTS.map((opt) => (
            <label key={opt.value} className={styles.radioOption}>
              <input
                type="radio"
                className={styles.radioInput}
                name="weekStartsOn"
                checked={weekStartsOn === opt.value}
                onChange={() => setWeekStartsOn(opt.value)}
              />
              <span className={styles.radioCircle} aria-hidden="true" />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      <section className={styles.group}>
        <h2 className={styles.label}>Предпочтительная длительность</h2>
        <div className={styles.chips}>
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={styles.chip}
              aria-pressed={duration === d}
              onClick={() => setDuration(d)}
            >
              {d} мин
            </button>
          ))}
        </div>
      </section>

      <section className={styles.group}>
        <h2 className={styles.label}>Интересы</h2>
        <div className={styles.chips}>
          {INTERESTS.map((i) => (
            <button
              key={i}
              type="button"
              className={styles.chip}
              aria-pressed={interests.has(i)}
              onClick={() => toggle(interests, i, setInterests)}
            >
              {i}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.group}>
        <h2 className={styles.label}>Удобные дни</h2>
        <p className={styles.hint}>Когда обычно планируете практики.</p>
        <div className={styles.chips}>
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              className={styles.chip}
              aria-pressed={days.has(d)}
              onClick={() => toggle(days, d, setDays)}
            >
              {d}
            </button>
          ))}
        </div>
        <h2 className={`${styles.label} ${styles.labelGap}`}>Удобное время</h2>
        <p className={styles.hint}>Утро, день или вечер — поможет подобрать время практик и напоминаний.</p>
        <div className={styles.chips}>
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              className={styles.chip}
              aria-pressed={times.has(t)}
              onClick={() => toggle(times, t, setTimes)}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.actions}>
        <Button className={styles.primary} leadingIcon={<Icon name="leaf" />} onClick={next} loading={patchMe.isPending}>
          Далее
        </Button>
        <Button variant="ghost" onClick={skip}>
          Пропустить
        </Button>
      </div>
      {saveError && <InlineError title={saveError.title} description={saveError.description} retryLabel={saveError.reauth ? "Войти снова" : "Повторить сохранение"} onRetry={saveError.reauth ? () => location.reload() : () => void next()} icon={<Icon name="triangle-alert" />} />}
      {notice && <p className={styles.notice} aria-live="polite">{notice}</p>}
      <p className={styles.deferred}>Эти настройки можно изменить позже в профиле.</p>
    </div>
  );
}
