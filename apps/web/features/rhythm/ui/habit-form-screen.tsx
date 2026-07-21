"use client";

import { BlockFooter, BlockTitle, Button, Card, List, ListInput, ListItem, Navbar, Preloader, Segmented, SegmentedButton, Sheet, Toggle } from "konsta/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { TimezonePicker, buildTimezoneOptions } from "@/components/timezone-picker";
import {
  COLOR_OPTIONS,
  EMOJI_OPTIONS,
  ICON_OPTIONS,
  MEDICAL_WARNING_TEXT,
  isMedicalHint,
  type Habit,
  type HabitColor,
  type HabitIcon,
} from "../model/habits";
import { saveHabitSchedule, useCreateHabitMutation, useHabitQuery, useHabitScheduleQuery, useSaveHabitScheduleMutation, useUpdateHabitMutation } from "../model/habits-queries";
import { exactTimesConfig, weekdaysConfig } from "../model/schedule";
import type { ScheduleRule } from "../model/schedule";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
const pickFocus = "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

const todayLocal = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

interface Initial {
  title: string;
  description: string;
  icon: HabitIcon;
  color: HabitColor;
  emoji: string | null;
  startLocalDate: string;
  allowSkip: boolean;
}

const createInitial = (h?: Habit): Initial => ({
  title: h?.title ?? "",
  description: h?.description ?? "",
  icon: h && (ICON_OPTIONS as readonly string[]).includes(h.icon) ? (h.icon as HabitIcon) : ICON_OPTIONS[0],
  color: h && h.color in COLOR_OPTIONS ? (h.color as HabitColor) : "sage",
  emoji: h?.emoji ?? null,
  startLocalDate: h?.startLocalDate ?? todayLocal(),
  allowSkip: h ? Boolean(h.allowSkip) : true,
});

const formatDateRu = (iso: string) => new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${iso}T00:00:00`));
const monthLabel = (date: Date) => `${new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(date)} ${date.getFullYear()}`;
const monthDays = (date: Date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => new Date(date.getFullYear(), date.getMonth(), i + 1))];
  return [...cells, ...Array(42 - cells.length).fill(null)];
};
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/**
 * S-MA-061 — habit create/edit form (PRD §22). Row-based editor: title/description are direct List rows,
 * icon+color open a real Konsta Sheet from a «Внешний вид» row, date + allow-skip live in «Правила».
 * Private by default (§8.4); no share UI at create (§22.1). Schedule types and reminder policies are OUT of T02
 * (T03/T04/T06). Medical §39 warning is a keyword heuristic (does not block).
 */
export function HabitFormScreen({ mode, habitId, returnTo = "app" }: { mode: "create" | "edit"; habitId?: string; returnTo?: "app" | "onboarding" }) {
  const editHabit = useHabitQuery(habitId ?? "", mode === "edit");
  const schedule = useHabitScheduleQuery(habitId ?? "", mode === "edit");
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
    return <HabitFormInner key={editHabit.data.habit.id} mode="edit" habitId={habitId!} initial={createInitial(editHabit.data.habit)} initialSchedule={schedule.data?.schedule ?? undefined} returnTo={returnTo} />;
  }
  return <HabitFormInner mode="create" initial={createInitial(undefined)} returnTo={returnTo} />;
}

function HabitFormInner({ mode, habitId, initial, initialSchedule, returnTo }: { mode: "create" | "edit"; habitId?: string; initial: Initial; initialSchedule?: ScheduleRule; returnTo: "app" | "onboarding" }) {
  const router = useRouter();
  const createMut = useCreateHabitMutation();
  const updateMut = useUpdateHabitMutation(habitId ?? "");
  const scheduleMut = useSaveHabitScheduleMutation(habitId ?? "");
  const [scheduleType, setScheduleType] = useState<"exact_times" | "weekdays">(initialSchedule?.ruleType ?? "exact_times");
  const [scheduleTimezone, setScheduleTimezone] = useState(initialSchedule?.timezone ?? (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"));
  const [scheduleTimes, setScheduleTimes] = useState(initialSchedule?.ruleType === "exact_times" ? exactTimesConfig.parse(initialSchedule.configuration).times : ["09:00"]);
  const [scheduleDays, setScheduleDays] = useState<number[]>(initialSchedule?.ruleType === "weekdays" ? weekdaysConfig.parse(initialSchedule.configuration).days : [1, 3, 5]);
  const [scheduleDayTimes, setScheduleDayTimes] = useState(() => initialSchedule?.ruleType === "weekdays" ? Object.values(weekdaysConfig.parse(initialSchedule.configuration).timesByDay)[0] ?? ["18:00"] : ["18:00"]);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [icon, setIcon] = useState<HabitIcon>(initial.icon);
  const [color, setColor] = useState<HabitColor>(initial.color);
  const [emoji, setEmoji] = useState<string | null>(initial.emoji);
  const [startLocalDate, setStartLocalDate] = useState(initial.startLocalDate);
  const [allowSkip, setAllowSkip] = useState(initial.allowSkip);
  const [touched, setTouched] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(`${initial.startLocalDate}T00:00:00`));

  const titleError = touched && title.trim().length === 0;
  const medical = useMemo(() => isMedicalHint(title), [title]);
  const hasTitle = title.trim().length > 0;
  const mutate = mode === "create" ? createMut : updateMut;
  const submitting = mutate.isPending;
  const submitError = mutate.isError;
  const ctaLabel = submitting ? "Сохраняем…" : mode === "create" ? "Создать привычку" : "Сохранить";
  const navbarTitle = mode === "create" ? "Новая привычка" : "Привычка";

  const finish = () => router.replace(returnTo === "onboarding" ? "/onboarding/bot" : "/rhythm");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!hasTitle) return;
    const payload = { title: title.trim(), description: description.trim() || null, icon, color, emoji, startLocalDate, allowSkip };
    const rule: ScheduleRule = { ruleType: scheduleType, timezone: scheduleTimezone, validFrom: startLocalDate, configuration: scheduleType === "exact_times" ? { times: scheduleTimes } : { days: scheduleDays, timesByDay: Object.fromEntries(scheduleDays.map((day) => [String(day), scheduleDayTimes])) } };
    if (mode === "create") createMut.mutate(payload, { onSuccess: async ({ habit }) => { await saveHabitSchedule(habit.id, rule); finish(); } });
    else updateMut.mutate(payload, { onSuccess: async () => { await scheduleMut.mutateAsync(rule); finish(); } });
  };

  return (
    <>
      <PrimaryNavbar title={navbarTitle} />
      <main className="flow-screen pb-safe-4">
        <h1 className="sr-only">{mode === "create" ? "Новая привычка" : "Редактировать привычку"}</h1>
        <form className="contents" onSubmit={onSubmit} noValidate>
          <BlockTitle component="h2" className="!m-0 !p-0">
            Название и описание
          </BlockTitle>
          <List strong inset dividers>
            <ListInput
              title=""
              outline
              type="text"
              value={title}
              placeholder="Название привычки"
              onInput={(e) => setTitle((e.currentTarget as HTMLInputElement).value)}
              onBlur={() => setTouched(true)}
              error={titleError ? "Заполните название привычки" : false}
              aria-label="Название привычки"
              aria-invalid={titleError || undefined}
            />
            <ListInput
              title=""
              outline
              type="textarea"
              value={description}
              placeholder="Описание (необязательно)"
              onInput={(e) => setDescription((e.currentTarget as HTMLTextAreaElement).value)}
              inputClassName="min-h-16"
              aria-label="Описание"
            />
          </List>

          <BlockTitle component="h2" className="!m-0 !p-0">
            Внешний вид
          </BlockTitle>
          <List strong inset>
            <ListItem
              link
              chevron
              linkComponent="button"
              contentClassName="w-full"
              innerClassName="text-left"
              linkProps={{ type: "button", onClick: () => setAppearanceOpen(true) }}
              media={
                emoji ? (
                  <span className="grid size-8 place-items-center text-2xl leading-none">{emoji}</span>
                ) : (
                  <span className={`grid size-8 place-items-center rounded-full ${COLOR_OPTIONS[color].cell}`}><Icon name={icon} className="size-4" /></span>
                )
              }
              title="Иконка, цвет и эмодзи"
              subtitle={emoji ? `Эмодзи ${emoji} · цвет ${COLOR_OPTIONS[color].label}` : `Иконка ${icon} · цвет ${COLOR_OPTIONS[color].label}`}
              aria-label={`Изменить иконку, цвет и эмодзи. Сейчас: ${emoji ? `эмодзи ${emoji}` : `иконка ${icon}`}, цвет ${COLOR_OPTIONS[color].label}`}
            />
          </List>

          <BlockTitle component="h2" className="!m-0 !p-0">
            Правила
          </BlockTitle>
          <List strong inset dividers>
            <ListItem
              link
              chevron
              linkComponent="button"
              contentClassName="w-full"
              innerClassName="text-left"
              linkProps={{ type: "button", onClick: () => { setVisibleMonth(new Date(`${startLocalDate}T00:00:00`)); setDatePickerOpen(true); } }}
              title="Дата начала"
              subtitle={formatDateRu(startLocalDate)}
              aria-label={`Изменить дату начала. Сейчас ${formatDateRu(startLocalDate)}`}
            />
          </List>
          <BlockTitle component="h3" className="!m-0 !p-0">Как часто</BlockTitle>
          <div className="grid gap-2 px-4">
            <Segmented strong rounded role="radiogroup" aria-label="Тип расписания">
              <SegmentedButton type="button" active={scheduleType === "exact_times"} aria-pressed={scheduleType === "exact_times"} onClick={() => setScheduleType("exact_times")}>Каждый день</SegmentedButton>
              <SegmentedButton type="button" active={scheduleType === "weekdays"} aria-pressed={scheduleType === "weekdays"} onClick={() => setScheduleType("weekdays")}>По дням недели</SegmentedButton>
            </Segmented>
            <p className="m-0 text-sm text-text-muted">{scheduleType === "exact_times" ? "Привычка повторяется каждый день в выбранное время." : "Привычка повторяется только в отмеченные дни."}</p>
          </div>
          <BlockTitle component="h4" className="!m-0 !p-0">Время выполнения</BlockTitle>
          <List strong inset dividers>
            {(scheduleType === "exact_times" ? scheduleTimes : scheduleDayTimes).map((time, index, items) => <ListItem
              key={`${time}-${index}`}
              title={time}
              after={<span className="relative flex gap-1"><Button type="button" clear rounded aria-hidden="true" tabIndex={-1} className="pointer-events-none !size-11 !min-w-11 !p-0"><Icon name="pencil" className="size-5" /></Button><ListInput component="span" title="" type="time" value={time} style={{ position: "absolute", left: -16, top: -2, width: 60, height: 44, overflow: "hidden", opacity: 0, zIndex: 1 }} inputClassName="!size-11 cursor-pointer" onInput={(e) => { const next = (e.currentTarget as HTMLInputElement).value; scheduleType === "exact_times" ? setScheduleTimes((values) => values.map((value, i) => i === index ? next : value)) : setScheduleDayTimes((values) => values.map((value, i) => i === index ? next : value)); }} aria-label={`Изменить время ${index + 1}`} />{items.length > 1 ? <Button type="button" clear rounded aria-label={`Удалить время ${index + 1}`} className="!size-11 !min-w-11 !p-0" onClick={() => scheduleType === "exact_times" ? setScheduleTimes((values) => values.filter((_, i) => i !== index)) : setScheduleDayTimes((values) => values.filter((_, i) => i !== index))}><Icon name="trash-2" className="size-5" /></Button> : null}</span>}
            />)}
            <Button clear rounded type="button" onClick={() => scheduleType === "exact_times" ? setScheduleTimes((items) => [...items, "21:00"]) : setScheduleDayTimes((items) => [...items, "21:00"])}>Добавить время</Button>
          </List>
          {scheduleType === "weekdays" ? <div className="grid gap-2 px-4"><p className="m-0 text-sm text-text-muted">Отметьте дни выполнения:</p><div className="grid grid-cols-7 gap-2" role="group" aria-label="Дни недели">{[1, 2, 3, 4, 5, 6, 7].map((day) => { const selected = scheduleDays.includes(day); return <Button key={day} clear rounded type="button" aria-pressed={selected} onClick={() => setScheduleDays((days) => days.includes(day) ? days.filter((value) => value !== day) : [...days, day].sort((a, b) => a - b))} className={`!h-10 !w-10 !min-h-10 !min-w-0 !rounded-full !p-0 text-sm ${selected ? "!bg-accent-soft !text-accent !ring-1 !ring-accent" : "!bg-surface-subtle !text-text-muted"}`}>{["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][day]}</Button>; })}</div><p className="m-0 text-sm text-text-muted">Выбрано: {scheduleDays.map((day) => ["", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][day]).join(", ") || "ни одного дня"}</p></div> : null}
          <TimezonePicker options={buildTimezoneOptions()} value={scheduleTimezone} onChange={setScheduleTimezone} />
          <List strong inset dividers>
            <ListItem
              title="Разрешить пропуск"
              after={<Toggle checked={allowSkip} onChange={() => setAllowSkip((v) => !v)} aria-label="Разрешить пропуск" />}
            />
          </List>
          <p className="m-0 px-4 pt-2 text-sm leading-5 text-text-muted">Если пропустить запланированное выполнение, его можно будет отметить как пропущенное. Иначе остаются только выполнение и отдых.</p>

          {medical ? (
            <Card component="aside" outline className="mx-4" contentWrapPadding="flex gap-3 p-4">
              <Icon name="triangle-alert" className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <p className="m-0 text-sm leading-relaxed text-text-muted">{MEDICAL_WARNING_TEXT}</p>
            </Card>
          ) : null}

          {submitError ? (
            <p className="mx-4 text-sm text-red-600 dark:text-red-400" role="alert">
              Не удалось сохранить. Проверьте связь и попробуйте ещё раз.
            </p>
          ) : null}

          <footer className="mt-auto grid gap-2 px-4 pt-2 pb-1">
            <Button type="submit" large rounded disabled={submitting || !hasTitle} className={`w-full ${focusRing}`}>
              <span className="inline-flex items-center gap-2">
                <Icon name="check" className="size-5" />
                {ctaLabel}
              </span>
            </Button>
            <Button type="button" large rounded clear className={focusRing} onClick={() => router.back()}>
              Отмена
            </Button>
          </footer>
          <BlockFooter className="px-4">Приватная привычка. Расписание, напоминания и выполнения появятся в следующих обновлениях.</BlockFooter>
        </form>
      </main>

      {datePickerOpen ? (
        <Sheet
          opened
          backdrop
          onBackdropClick={() => setDatePickerOpen(false)}
          className="flex max-h-[86dvh] flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="date-picker-title"
        >
          <Navbar
            title="Дата начала"
            right={<Button inline clear rounded={false} onClick={() => setDatePickerOpen(false)}>Готово</Button>}
          />
          <div className="grid gap-4 overflow-auto px-4 py-4 pb-[calc(var(--component-safe-area-bottom)+1rem)]">
            <h2 id="date-picker-title" className="sr-only">Выберите дату начала</h2>
            <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
              <Button clear rounded className="!min-h-11 !min-w-11 !p-0" aria-label="Предыдущий месяц" onClick={() => setVisibleMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>‹</Button>
              <strong className="min-w-0 whitespace-nowrap text-center text-lg leading-6 capitalize">{monthLabel(visibleMonth)}</strong>
              <Button clear rounded className="!min-h-11 !min-w-11 !p-0" aria-label="Следующий месяц" onClick={() => setVisibleMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>›</Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-muted" aria-hidden="true">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-1">
              {monthDays(visibleMonth).map((date, index) => date ? (
                <Button
                  key={localDate(date)}
                  clear
                  rounded
                  type="button"
                  aria-label={formatDateRu(localDate(date))}
                  aria-pressed={startLocalDate === localDate(date)}
                  onClick={() => { setStartLocalDate(localDate(date)); setDatePickerOpen(false); }}
                  className={`!min-h-11 !min-w-0 !p-0 ${startLocalDate === localDate(date) ? "!bg-accent-soft !text-accent" : ""}`}
                >{date.getDate()}</Button>
              ) : <span key={`empty-${index}`} aria-hidden="true" />)}
            </div>
          </div>
        </Sheet>
      ) : null}

      {appearanceOpen ? (
        <Sheet
          opened
          backdrop
          onBackdropClick={() => setAppearanceOpen(false)}
          className="flex h-[min(86dvh,40rem)] flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="appearance-sheet-title"
        >
          <Navbar title="Внешний вид" right={<Button inline clear rounded={false} onClick={() => setAppearanceOpen(false)}>Готово</Button>} />
          <div className="min-h-0 grid gap-4 overflow-auto px-4 py-3 pb-[calc(var(--component-safe-area-bottom)+1rem)]">
            <div id="appearance-sheet-title" className="sr-only">Иконка и цвет привычки</div>
            <div className="grid gap-2">
              <span className="text-xs uppercase tracking-wide text-text-muted">Иконка</span>
              <div role="group" aria-label="Иконка привычки" className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map((name) => {
                  const selected = icon === name;
                  return (
                    <Button
                      key={name}
                      clear
                      rounded
                      type="button"
                      aria-pressed={selected}
                      aria-label={name}
                      onClick={() => setIcon(name)}
                      className={`!aspect-square !min-w-0 ${pickFocus} ${selected ? "!bg-accent-soft !text-accent" : "!text-text-muted"}`}
                    >
                      <Icon name={name} className="size-6" />
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-2">
              <span className="text-xs uppercase tracking-wide text-text-muted">Цвет</span>
              <div role="group" aria-label="Цвет привычки" className="grid grid-cols-4 gap-2">
                {(Object.keys(COLOR_OPTIONS) as HabitColor[]).map((key) => {
                  const selected = color === key;
                  return (
                    <Button
                      key={key}
                      clear
                      rounded
                      type="button"
                      aria-pressed={selected}
                      aria-label={COLOR_OPTIONS[key].label}
                      onClick={() => setColor(key)}
                      className={`!aspect-square !min-w-0 ${pickFocus}`}
                    >
                      <span className={`grid size-9 place-items-center rounded-full ${COLOR_OPTIONS[key].cell} ${selected ? "ring-2 ring-accent ring-offset-2 ring-offset-transparent" : ""}`}>
                        {selected ? <Icon name="check" className="size-4" /> : null}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-2">
              <span className="text-xs uppercase tracking-wide text-text-muted">Эмодзи</span>
              <div role="group" aria-label="Эмодзи привычки" className="grid grid-cols-6 gap-1">
                {EMOJI_OPTIONS.map((em) => {
                  const selected = emoji === em;
                  return (
                    <Button
                      key={em}
                      clear
                      rounded
                      type="button"
                      aria-pressed={selected}
                      aria-label={em}
                      onClick={() => setEmoji(selected ? null : em)}
                      className={`!aspect-square !min-w-0 text-xl ${pickFocus} ${selected ? "!bg-accent-soft" : ""}`}
                    >
                      <span aria-hidden="true">{em}</span>
                    </Button>
                  );
                })}
              </div>
              {emoji ? (
                <Button clear rounded type="button" className={`!min-h-11 self-start ${pickFocus}`} onClick={() => setEmoji(null)}>
                  <span className="inline-flex items-center gap-2 text-sm text-text-muted">
                    <Icon name="x" className="size-4" />
                    Без эмодзи
                  </span>
                </Button>
              ) : null}
            </div>
          </div>
        </Sheet>
      ) : null}
    </>
  );
}
