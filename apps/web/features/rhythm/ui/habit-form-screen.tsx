"use client";

import { BlockFooter, BlockTitle, Button, Card, List, ListInput, ListItem, Preloader, Toggle } from "konsta/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import {
  COLOR_OPTIONS,
  ICON_OPTIONS,
  MEDICAL_WARNING_TEXT,
  isMedicalHint,
  type Habit,
  type HabitColor,
  type HabitIcon,
} from "../model/habits";
import { useCreateHabitMutation, useHabitQuery, useUpdateHabitMutation } from "../model/habits-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

const todayLocal = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

interface Initial {
  title: string;
  description: string;
  icon: HabitIcon;
  color: HabitColor;
  startLocalDate: string;
  allowSkip: boolean;
}

const createInitial = (h?: Habit): Initial => ({
  title: h?.title ?? "",
  description: h?.description ?? "",
  icon: h && (ICON_OPTIONS as readonly string[]).includes(h.icon) ? (h.icon as HabitIcon) : ICON_OPTIONS[0],
  color: h && h.color in COLOR_OPTIONS ? (h.color as HabitColor) : "sage",
  startLocalDate: h?.startLocalDate ?? todayLocal(),
  allowSkip: h ? Boolean(h.allowSkip) : true,
});

/**
 * S-MA-061 — habit create/edit form (PRD §22). Private by default (§8.4); no share UI at create (§22.1).
 * Schedule types and reminder policies are OUT of T02 (T03/T04/T06). Medical §39 warning is a keyword heuristic.
 */
export function HabitFormScreen({ mode, habitId, returnTo = "app" }: { mode: "create" | "edit"; habitId?: string; returnTo?: "app" | "onboarding" }) {
  const editHabit = useHabitQuery(habitId ?? "", mode === "edit");
  const navbarTitle = mode === "create" ? "Новая привычка" : "Привычка";

  if (mode === "edit") {
    if (editHabit.isPending && !editHabit.data) {
      return (
        <>
          <PrimaryNavbar title={navbarTitle} />
          <main className="flow-screen pb-safe-4">
            <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true">
              <Preloader />
              <span className="sr-only">Загружаем привычку</span>
            </div>
          </main>
        </>
      );
    }
    if (editHabit.isError || !editHabit.data?.habit) {
      return (
        <>
          <PrimaryNavbar title={navbarTitle} />
          <main className="flow-screen pb-safe-4">
            <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid justify-items-center gap-3">
              <Icon name="triangle-alert" />
              <h2 className="m-0 text-lg font-semibold">Привычка не найдена</h2>
              <Button large rounded className={focusRing} onClick={() => history.back()}>
                Назад
              </Button>
            </Card>
          </main>
        </>
      );
    }
    return <HabitFormInner key={editHabit.data.habit.id} mode="edit" habitId={habitId!} initial={createInitial(editHabit.data.habit)} returnTo={returnTo} />;
  }
  return <HabitFormInner mode="create" initial={createInitial(undefined)} returnTo={returnTo} />;
}

function HabitFormInner({ mode, habitId, initial, returnTo }: { mode: "create" | "edit"; habitId?: string; initial: Initial; returnTo: "app" | "onboarding" }) {
  const router = useRouter();
  const createMut = useCreateHabitMutation();
  const updateMut = useUpdateHabitMutation(habitId ?? "");

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [icon, setIcon] = useState<HabitIcon>(initial.icon);
  const [color, setColor] = useState<HabitColor>(initial.color);
  const [startLocalDate, setStartLocalDate] = useState(initial.startLocalDate);
  const [allowSkip, setAllowSkip] = useState(initial.allowSkip);
  const [touched, setTouched] = useState(false);

  const medical = useMemo(() => isMedicalHint(title), [title]);
  const titleError = touched && title.trim().length === 0;
  const mutate = mode === "create" ? createMut : updateMut;
  const submitting = mutate.isPending;
  const submitError = mutate.isError;

  const finish = () => router.replace(returnTo === "onboarding" ? "/onboarding/bot" : "/rhythm");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (title.trim().length === 0) return;
    const payload = { title: title.trim(), description: description.trim() || null, icon, color, startLocalDate, allowSkip };
    if (mode === "create") createMut.mutate(payload, { onSuccess: finish });
    else updateMut.mutate(payload, { onSuccess: finish });
  };

  const navbarTitle = mode === "create" ? "Новая привычка" : "Привычка";

  return (
    <>
      <PrimaryNavbar title={navbarTitle} />
      <main className="flow-screen pb-safe-4">
        <h1 className="sr-only">{mode === "create" ? "Новая привычка" : "Редактировать привычку"}</h1>
        <form className="contents" onSubmit={onSubmit} noValidate>
          <List strong inset>
            <ListInput
              title=""
              outline
              type="text"
              value={title}
              placeholder="Название привычки"
              onInput={(e) => setTitle((e.currentTarget as HTMLInputElement).value)}
              onBlur={() => setTouched(true)}
              aria-label="Название привычки"
            />
            <ListInput
              title=""
              outline
              type="textarea"
              value={description}
              placeholder="Описание (необязательно)"
              onInput={(e) => setDescription((e.currentTarget as HTMLTextAreaElement).value)}
              inputClassName="min-h-20"
              aria-label="Описание"
            />
          </List>
          {titleError ? (
            <p className="m-0 px-8 -mt-1 text-sm text-danger" role="alert">
              Введите название
            </p>
          ) : null}

          <section className="grid gap-2">
            <BlockTitle component="h2" className="!m-0 !px-4">
              Иконка
            </BlockTitle>
            <div role="group" aria-label="Иконка привычки" className="grid grid-cols-4 gap-2 px-4 py-1">
              {ICON_OPTIONS.map((name) => {
                const selected = icon === name;
                return (
                  <Button key={name} clear rounded type="button" aria-pressed={selected} aria-label={name} onClick={() => setIcon(name)} className={`!aspect-square !rounded-2xl ${focusRing} ${selected ? "!bg-accent-soft !text-accent" : "!text-text"}`}>
                    <Icon name={name} className="size-6" />
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-2">
            <BlockTitle component="h2" className="!m-0 !px-4">
              Цвет
            </BlockTitle>
            <div role="group" aria-label="Цвет привычки" className="grid grid-cols-4 gap-2 px-4 py-1">
              {(Object.keys(COLOR_OPTIONS) as HabitColor[]).map((key) => {
                const selected = color === key;
                return (
                  <Button key={key} clear rounded type="button" aria-pressed={selected} aria-label={COLOR_OPTIONS[key].label} onClick={() => setColor(key)} className={`!aspect-square !rounded-2xl ${focusRing} ${selected ? "!ring-2 !ring-accent" : ""}`}>
                    <span className={`grid size-8 place-items-center rounded-full ${COLOR_OPTIONS[key].cell}`}>
                      <Icon name="check" className={`size-4 ${selected ? "" : "opacity-0"}`} />
                    </span>
                  </Button>
                );
              })}
            </div>
          </section>

          <BlockTitle component="h2" className="!m-0 !px-4">
            Дата начала
          </BlockTitle>
          <List strong inset>
            <ListInput
              title=""
              outline
              type="date"
              value={startLocalDate}
              onInput={(e) => setStartLocalDate((e.currentTarget as HTMLInputElement).value)}
              aria-label="Дата начала"
            />
            <ListItem
              title="Разрешить пропуск"
              subtitle="Иначе только выполнение или отдых"
              after={<Toggle checked={allowSkip} onChange={() => setAllowSkip((v) => !v)} aria-label="Разрешить пропуск" />}
            />
          </List>

          {medical ? (
            <Card component="aside" outline className="mx-4" contentWrapPadding="flex gap-3 p-4">
              <Icon name="triangle-alert" className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <p className="m-0 text-sm leading-relaxed text-text-muted">{MEDICAL_WARNING_TEXT}</p>
            </Card>
          ) : null}

          {submitError ? (
            <p className="mx-4 text-sm text-danger" role="alert">
              Не удалось сохранить. Проверьте связь и попробуйте ещё раз.
            </p>
          ) : null}

          <footer className="grid gap-2 px-4 pb-2">
            <Button type="submit" large rounded disabled={submitting} className={`w-full ${focusRing}`}>
              <span className="inline-flex items-center gap-2">
                <Icon name="check" className="size-5" />
                {submitting ? "Сохраняем…" : mode === "create" ? "Создать привычку" : "Сохранить"}
              </span>
            </Button>
            <Button type="button" large rounded clear className={focusRing} onClick={() => router.back()}>
              Отмена
            </Button>
          </footer>
          <BlockFooter className="px-4">Приватная привычка. Расписание, напоминания и выполнения появятся в следующих обновлениях.</BlockFooter>
        </form>
      </main>
    </>
  );
}
