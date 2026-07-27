"use client";

import { Badge, BlockTitle, Button, Card, List, ListInput, ListItem, Preloader, Segmented, SegmentedButton, Sheet } from "konsta/react";
import { useMemo, useState } from "react";
import { Icon } from "@flowly/ui";
import { addDays, endOfWeekSunday, monthBounds, parseYearMonth, startOfWeekMonday } from "@/lib/calendar/dates";
import {
  statusLabel,
  useCalendarDay,
  useCalendarMonth,
  useCalendarWeek,
  useManualWorkout,
  useMonthReport,
  useStreaks,
  useWeekReport,
  type CalendarFilter,
} from "../model/calendar-queries";

type Mode = "month" | "week" | "day";

const todayIso = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const FILTERS: { id: CalendarFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "yoga", label: "Йога" },
  { id: "habits", label: "Привычки" },
  { id: "completed", label: "Готово" },
  { id: "skipped", label: "Пропуск" },
  { id: "no_response", label: "Без ответа" },
];

const formatRu = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${iso}T00:00:00`));

const weekdayShort = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function CalendarScreen() {
  const [mode, setMode] = useState<Mode>("month");
  const [cursor, setCursor] = useState(todayIso);
  const [filter, setFilter] = useState<CalendarFilter>("all");
  const [manualOpen, setManualOpen] = useState(false);
  const [reportMode, setReportMode] = useState<"week" | "month" | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDate, setManualDate] = useState(todayIso);
  const [manualTime, setManualTime] = useState("12:00");
  const [manualDuration, setManualDuration] = useState("30");
  const [manualError, setManualError] = useState<string | null>(null);

  const monthQ = useCalendarMonth(cursor, filter);
  const weekQ = useCalendarWeek(cursor, filter);
  const dayQ = useCalendarDay(cursor, filter);
  const streaksQ = useStreaks();
  const weekReport = useWeekReport(cursor);
  const monthReport = useMonthReport(cursor);
  const manual = useManualWorkout();

  const active = mode === "month" ? monthQ : mode === "week" ? weekQ : dayQ;
  const days = mode === "month" ? monthQ.data?.days : mode === "week" ? weekQ.data?.days : null;

  const monthGrid = useMemo(() => {
    if (!monthQ.data) return [];
    const { year, month } = monthQ.data.range;
    const { start, end } = monthBounds(year, month);
    const pad = (new Date(`${start}T00:00:00Z`).getUTCDay() + 6) % 7;
    const cells: (string | null)[] = [...Array(pad).fill(null)];
    for (let d = start; d <= end; d = addDays(d, 1)) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthQ.data]);

  const shift = (dir: -1 | 1) => {
    if (mode === "month") {
      const { year, month } = parseYearMonth(cursor);
      const n = new Date(Date.UTC(year, month - 1 + dir, 1));
      setCursor(`${n.getUTCFullYear()}-${String(n.getUTCMonth() + 1).padStart(2, "0")}-01`);
      return;
    }
    if (mode === "week") {
      setCursor(addDays(startOfWeekMonday(cursor), dir * 7));
      return;
    }
    setCursor(addDays(cursor, dir));
  };

  const title =
    mode === "month"
      ? new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(new Date(`${cursor.slice(0, 7)}-01T00:00:00`))
      : mode === "week"
        ? `${formatRu(startOfWeekMonday(cursor))} – ${formatRu(endOfWeekSunday(cursor))}`
        : formatRu(cursor);

  const onManual = async () => {
    setManualError(null);
    if (!manualTitle.trim()) {
      setManualError("Укажите название");
      return;
    }
    try {
      await manual.mutateAsync({
        title: manualTitle.trim(),
        date: manualDate,
        time: manualTime,
        durationMinutes: Math.max(1, Number(manualDuration) || 30),
        status: "completed",
      });
      setManualOpen(false);
      setManualTitle("");
      setCursor(manualDate);
      setMode("day");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error";
      setManualError(msg.includes("409") || msg.includes("duplicate") ? "Уже есть запись на это время" : "Не удалось сохранить");
    }
  };

  return (
    <main className="flow-screen pb-safe-4">
      <div className="grid gap-3">
        <Segmented strong rounded role="tablist" aria-label="Режим календаря">
          {(
            [
              ["month", "Месяц"],
              ["week", "Неделя"],
              ["day", "День"],
            ] as const
          ).map(([id, label]) => (
            <SegmentedButton key={id} type="button" active={mode === id} aria-pressed={mode === id} onClick={() => setMode(id)}>
              {label}
            </SegmentedButton>
          ))}
        </Segmented>

        <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
          <Button type="button" clear rounded className="!min-h-11 !min-w-11 !p-0" aria-label="Назад" onClick={() => shift(-1)}>
            <Icon name="chevron-left" className="size-5" />
          </Button>
          <strong className="min-w-0 text-center capitalize leading-6">{title}</strong>
          <Button type="button" clear rounded className="!min-h-11 !min-w-11 !p-0" aria-label="Вперёд" onClick={() => shift(1)}>
            <Icon name="chevron-right" className="size-5" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" role="toolbar" aria-label="Фильтры">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              type="button"
              small
              rounded
              clear={filter !== f.id}
              tonal={filter === f.id}
              className="!shrink-0"
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {streaksQ.data ? (
          <Card outline contentWrapPadding="grid gap-2 p-4">
            <BlockTitle component="h2" className="!m-0 !p-0">
              Серии
            </BlockTitle>
            <p className="m-0 text-sm text-text-muted">
              Привычки: {streaksQ.data.habitsDaily.current} · лучшая {streaksQ.data.habitsDaily.best}
            </p>
            <p className="m-0 text-sm text-text-muted">
              Йога: {streaksQ.data.yoga.current} · лучшая {streaksQ.data.yoga.best}
            </p>
          </Card>
        ) : null}

        <div className="flex gap-2">
          <Button type="button" small rounded tonal onClick={() => setReportMode("week")}>
            Неделя
          </Button>
          <Button type="button" small rounded tonal onClick={() => setReportMode("month")}>
            Месяц
          </Button>
          <Button type="button" small rounded onClick={() => { setManualDate(cursor); setManualOpen(true); }}>
            + Запись
          </Button>
        </div>

        {active.isPending ? (
          <div className="grid min-h-40 place-items-center" role="status" aria-busy="true">
            <Preloader />
          </div>
        ) : active.isError ? (
          <Card outline contentWrapPadding="grid gap-3 p-4" role="alert">
            <p className="m-0">Не удалось загрузить календарь.</p>
            <Button type="button" rounded onClick={() => void active.refetch()}>
              Повторить
            </Button>
          </Card>
        ) : mode === "day" ? (
          <DayList
            items={dayQ.data?.items ?? []}
            empty={!dayQ.data?.items.length}
            onOpenManual={() => {
              setManualDate(cursor);
              setManualOpen(true);
            }}
          />
        ) : (
          <>
            {mode === "month" ? (
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-muted" aria-hidden>
                {weekdayShort.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            ) : null}
            <div className={mode === "month" ? "grid grid-cols-7 gap-1" : "grid gap-2"}>
              {(mode === "month" ? monthGrid : (days ?? []).map((d) => d.date)).map((date, i) => {
                if (!date) return <span key={`e-${i}`} aria-hidden />;
                const cell = days?.find((d) => d.date === date);
                const counts = cell?.counts;
                const selected = date === cursor;
                return (
                  <Button
                    key={date}
                    type="button"
                    clear
                    rounded
                    aria-label={`${formatRu(date)}${counts?.total ? `, ${counts.total} активностей` : ""}`}
                    aria-pressed={selected}
                    onClick={() => {
                      setCursor(date);
                      setMode("day");
                    }}
                    className={`!min-h-14 !min-w-0 !flex-col !gap-0.5 !p-1 ${selected ? "!bg-accent-soft !text-accent" : ""} ${mode === "week" ? "!items-start !px-3" : ""}`}
                  >
                    <span className="text-sm font-medium">{mode === "week" ? formatRu(date) : Number(date.slice(8))}</span>
                    {counts && counts.total > 0 ? (
                      <span className="flex flex-wrap justify-center gap-0.5">
                        {counts.completed > 0 ? <span className="size-1.5 rounded-full bg-emerald-500" /> : null}
                        {counts.pending > 0 ? <span className="size-1.5 rounded-full bg-amber-400" /> : null}
                        {counts.skipped + counts.noResponse > 0 ? <span className="size-1.5 rounded-full bg-rose-400" /> : null}
                        {counts.total > 3 ? <span className="text-[10px] opacity-70">+{counts.total - 3}</span> : null}
                      </span>
                    ) : (
                      <span className="size-1.5 opacity-0" />
                    )}
                    {mode === "week" && counts ? (
                      <span className="text-[11px] font-normal text-text-muted">{counts.total} · {counts.completed} готово</span>
                    ) : null}
                  </Button>
                );
              })}
            </div>
            {days && days.every((d) => d.counts.total === 0) ? (
              <p className="m-0 px-1 text-sm text-text-muted">Пока нет записей в этом периоде.</p>
            ) : null}
          </>
        )}
      </div>

      {manualOpen ? (
        <Sheet opened backdrop onBackdropClick={() => setManualOpen(false)} className="!z-[200] flex max-h-[86dvh] flex-col">
          <div className="grid gap-3 overflow-auto px-4 py-4 pb-[calc(var(--component-safe-area-bottom)+1rem)]">
            <BlockTitle component="h2" className="!m-0 !p-0">
              Ручная запись
            </BlockTitle>
            <List strong inset>
              <ListInput title="Название" value={manualTitle} onInput={(e) => setManualTitle(e.currentTarget.value)} inputStyle={{ fontSize: 16 }} />
              <ListInput title="Дата" type="date" value={manualDate} onInput={(e) => setManualDate(e.currentTarget.value)} inputStyle={{ fontSize: 16 }} />
              <ListInput title="Время" type="time" value={manualTime} onInput={(e) => setManualTime(e.currentTarget.value)} inputStyle={{ fontSize: 16 }} />
              <ListInput title="Минуты" type="number" min={1} value={manualDuration} onInput={(e) => setManualDuration(e.currentTarget.value)} inputStyle={{ fontSize: 16 }} />
            </List>
            {manualError ? (
              <p className="m-0 text-sm text-danger" role="alert">
                {manualError}
              </p>
            ) : null}
            <Button type="button" large rounded disabled={manual.isPending} onClick={() => void onManual()}>
              {manual.isPending ? "Сохраняем…" : "Сохранить"}
            </Button>
            <Button type="button" large rounded clear onClick={() => setManualOpen(false)}>
              Отмена
            </Button>
          </div>
        </Sheet>
      ) : null}

      {reportMode ? (
        <Sheet opened backdrop onBackdropClick={() => setReportMode(null)} className="!z-[200] flex max-h-[86dvh] flex-col">
          <div className="grid gap-3 overflow-auto px-4 py-4 pb-[calc(var(--component-safe-area-bottom)+1rem)]">
            <BlockTitle component="h2" className="!m-0 !p-0">
              {reportMode === "week" ? "Недельный отчёт" : "Месячный отчёт"}
            </BlockTitle>
            {(reportMode === "week" ? weekReport : monthReport).isPending ? (
              <Preloader />
            ) : (reportMode === "week" ? weekReport : monthReport).isError ? (
              <p role="alert">Не удалось загрузить отчёт.</p>
            ) : (
              <ReportBody data={(reportMode === "week" ? weekReport.data : monthReport.data)!} />
            )}
            <Button type="button" large rounded clear onClick={() => setReportMode(null)}>
              Закрыть
            </Button>
          </div>
        </Sheet>
      ) : null}
    </main>
  );
}

function DayList({
  items,
  empty,
  onOpenManual,
}: {
  items: { id: string; title: string; entityType: string; scheduledLocalTime: string; status: string; activitySource: string | null; durationSeconds: number }[];
  empty: boolean;
  onOpenManual: () => void;
}) {
  if (empty) {
    return (
      <Card outline contentWrapPadding="grid gap-3 p-4">
        <p className="m-0 text-sm text-text-muted">На этот день пока пусто.</p>
        <Button type="button" rounded onClick={onOpenManual}>
          Добавить ручную запись
        </Button>
      </Card>
    );
  }
  return (
    <List strong inset dividers>
      {items.map((item) => (
        <ListItem
          key={item.id}
          title={item.title}
          subtitle={`${item.scheduledLocalTime} · ${item.entityType === "habit" ? "Привычка" : "Тренировка"} · ${Math.round(item.durationSeconds / 60)} мин`}
          after={
            <span className="flex flex-col items-end gap-1">
              <Badge>{statusLabel[item.status] ?? item.status}</Badge>
              {item.activitySource === "youtube" ? <Badge className="!text-[10px]">YouTube</Badge> : null}
            </span>
          }
        />
      ))}
      <div className="p-3">
        <Button type="button" clear rounded className="w-full !min-h-11" onClick={onOpenManual}>
          + Ручная запись
        </Button>
      </div>
    </List>
  );
}

function ReportBody({ data }: { data: import("../model/calendar-queries").ReportResponse }) {
  const r = data.report;
  return (
    <div className="grid gap-3">
      <p className="m-0 text-sm leading-relaxed">{data.summaryText}</p>
      {r.partial ? <Badge>Период ещё идёт</Badge> : null}
      <List strong inset dividers>
        <ListItem title="Тренировки выполнено" after={`${r.completedWorkouts} / ${r.plannedWorkouts}`} />
        <ListItem title="Частично" after={String(r.partialWorkouts)} />
        <ListItem title="Привычки" after={`${r.habitCompletionPercent}%`} />
        <ListItem title="Время" after={`${Math.round(r.totalDurationSeconds / 60)} мин`} />
        <ListItem title="Пропуски" after={String(r.skipped)} />
        <ListItem title="Без ответа" after={String(r.noResponse)} />
        <ListItem title="Серия" after={`${data.streaks.current} (лучшая ${data.streaks.best})`} />
        {r.previous ? (
          <ListItem
            title="Против прошлого периода"
            subtitle={`Тренировки ${r.completedWorkouts - r.previous.completedWorkouts >= 0 ? "+" : ""}${r.completedWorkouts - r.previous.completedWorkouts}, привычки ${r.habitCompletionPercent - r.previous.habitCompletionPercent >= 0 ? "+" : ""}${(r.habitCompletionPercent - r.previous.habitCompletionPercent).toFixed(1)}%`}
          />
        ) : null}
      </List>
      {Object.keys(r.habitsById).length ? (
        <Card outline contentWrapPadding="grid gap-2 p-4">
          <BlockTitle component="h3" className="!m-0 !p-0">
            Привычки
          </BlockTitle>
          {Object.values(r.habitsById).map((h) => (
            <p key={h.title} className="m-0 text-sm">
              {h.title}: {h.completed}/{h.planned}
            </p>
          ))}
        </Card>
      ) : null}
    </div>
  );
}
