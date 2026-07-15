"use client";

import { BlockTitle, Button, Card, Preloader, Segmented, SegmentedButton } from "konsta/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@flowly/ui";
import { useMeQuery, usePatchMeMutation, type PublicUser } from "@/features/profile/model/me-queries";
import { ApiError } from "@/lib/api/client";
import { buildTimezoneOptions, detectedTimezone, TimezonePicker } from "@/components/timezone-picker";

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
const TIMES = [{ value: "Утро", icon: "sunrise" }, { value: "День", icon: "sun" }, { value: "Вечер", icon: "moon" }] as const;
const choiceColors = { tonalBgIos: "bg-accent-soft", tonalTextIos: "text-accent" };
const neutralChoiceColors = { tonalBgIos: "bg-ios-light-surface-2 dark:bg-ios-dark-surface-2", tonalTextIos: "text-black dark:text-white" };
/**
 * S-MA-003 — Timezone & preferences (F01, §10.1 steps 4–7, DEC-022 P-WIZARD).
 * Timezone persists via PATCH /me; the product week starts on Monday (DEC-042).
 * Duration / interests / schedule are recommendation inputs held in-component
 * and persisted with stages 2/4 (workout_categories, habits). Selections survive
 * retry within the session.
 */
export function PreferencesScreen() {
  const me = useMeQuery();
  return me.data ? <PreferencesForm user={me.data.user} /> : <main className="safe-shell flow-screen gap-5" aria-busy="true"><p className="m-0 text-text-muted">Загружаем настройки…</p></main>;
}

function PreferencesForm({ user }: { user: PublicUser }) {
  const timezoneOptions = useMemo(() => buildTimezoneOptions(), []);
  const router = useRouter();
  const [timezone, setTimezone] = useState(user.timezone === "UTC" ? detectedTimezone : user.timezone);
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
      await patchMe.mutateAsync({ timezone });
      router.push("/onboarding/capabilities" as never);
    } catch (error) {
      setNotice("");
      if (error instanceof ApiError && error.status === 401) setSaveError({ title: "Сессия истекла", description: "Перезагрузите Flowly, чтобы снова подтвердить вход через Telegram.", reauth: true });
      else if (!navigator.onLine) setSaveError({ title: "Нет соединения", description: "Введённые настройки сохранены на экране. Подключитесь к интернету и повторите." });
      else setSaveError({ title: "Настройки не сохранены", description: error instanceof ApiError && error.status === 400 ? "Проверьте часовой пояс и повторите." : "Сервер временно не принял изменения. Введённые настройки сохранены на экране." });
    }
  };

  const skip = () => router.push("/onboarding/capabilities" as never);

  return (
    <main className="safe-shell flow-screen gap-5">
      <header className="grid gap-2">
        <BlockTitle component="h1" large className="!m-0 !p-0">Подстроим под вас</BlockTitle>
        <p className="m-0 leading-6 text-text-muted">Выберите удобный ритм — всё можно изменить позже.</p>
      </header>

      <section className="grid gap-2">
        <BlockTitle component="h2" className="!m-0 !p-0">Часовой пояс</BlockTitle>
        <TimezonePicker options={timezoneOptions} value={timezone} onChange={setTimezone} />
      </section>

      <section className="grid gap-2">
        <BlockTitle component="h2" className="!m-0 !p-0">Длительность</BlockTitle>
        <Segmented strong rounded role="radiogroup" aria-label="Предпочтительная длительность">{DURATIONS.map((value) => <SegmentedButton key={value} active={duration === value} aria-pressed={duration === value} onClick={() => setDuration(value)}>{value} мин</SegmentedButton>)}</Segmented>
      </section>

      <section className="grid gap-2">
        <BlockTitle component="h2" className="!m-0 !p-0">Интересы</BlockTitle>
        <div className="flex flex-wrap gap-2">{INTERESTS.map((interest) => { const selected = interests.has(interest); return <Button key={interest} inline small rounded tonal colors={selected ? choiceColors : neutralChoiceColors} className="gap-1.5" aria-pressed={selected} onClick={() => toggle(interests, interest, setInterests)}>{selected && <Icon name="check" />}{interest}</Button>; })}</div>
      </section>

      <section className="grid gap-2">
        <BlockTitle component="h2" className="!m-0 !p-0">Удобные дни</BlockTitle>
        <div className="grid grid-cols-7 gap-1.5 max-[23rem]:grid-cols-4">{DAYS.map((day) => { const selected = days.has(day); return <Button key={day} inline small rounded tonal colors={selected ? choiceColors : neutralChoiceColors} className="w-full min-w-0 gap-1.5 px-1" aria-pressed={selected} onClick={() => toggle(days, day, setDays)}>{selected && <Icon name="check" />}{day}</Button>; })}</div>
      </section>

      <section className="grid gap-2">
        <BlockTitle component="h2" className="!m-0 !p-0">Удобное время</BlockTitle>
        <div className="grid grid-cols-3 gap-2 max-[23rem]:grid-cols-1">{TIMES.map(({ value, icon }) => { const selected = times.has(value); return <Button key={value} inline small rounded tonal colors={selected ? choiceColors : neutralChoiceColors} className="w-full min-w-0 gap-2" aria-pressed={selected} onClick={() => toggle(times, value, setTimes)}>{selected && <Icon name="check" />}<Icon name={icon} />{value}</Button>; })}</div>
      </section>

      {saveError && <Card outline colors={{ bgIos: "bg-danger-soft", textIos: "text-text" }} contentWrapPadding="p-4 grid gap-2" role="alert"><strong>{saveError.title}</strong><p className="m-0 leading-6 text-text-muted">{saveError.description}</p><Button inline clear rounded onClick={saveError.reauth ? () => location.reload() : () => void next()}>{saveError.reauth ? "Войти снова" : "Повторить"}</Button></Card>}
      {notice && <p className="m-0 text-center text-xs leading-5 text-text-muted" aria-live="polite">{notice}</p>}
      <footer className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-2">
        <Button inline large rounded clear onClick={skip}>Пропустить</Button>
        <Button large rounded disabled={patchMe.isPending} aria-busy={patchMe.isPending || undefined} onClick={next}>{patchMe.isPending && <Preloader />}Далее</Button>
      </footer>
    </main>
  );
}
