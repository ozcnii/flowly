"use client";

import { Badge, BlockTitle, Button, Card, List, ListInput, ListItem, Navbar, Preloader, Progressbar, Radio, Sheet } from "konsta/react";
import { useRouter } from "next/navigation";
import { useRef, useState, type RefObject } from "react";
import { Icon } from "@flowly/ui";
import { ModalPortal } from "@/components/modal-portal";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { useModalFocus } from "@/components/use-modal-focus";
import { formatRuDate } from "@/features/programs/model/program-dates";
import { COLOR_OPTIONS, type Habit } from "../model/habits";
import { useArchiveHabitMutation, useHabitLifecycleMutation, useHabitOccurrencesQuery, useHabitQuery, useOccurrenceQuery, useUpdateOccurrenceStatusMutation } from "../model/habits-queries";
import { HABIT_OCCURRENCE_STATUSES, OCCURRENCE_STATUS_ICON, OCCURRENCE_STATUS_LABEL, type HabitOccurrence, type HabitOccurrenceStatus } from "../model/occurrences";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
const terminal = new Set<string>(HABIT_OCCURRENCE_STATUSES);
const statusCopy = (status: string) => OCCURRENCE_STATUS_LABEL[status as HabitOccurrenceStatus] ?? "Ожидается";

export function HabitDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const query = useHabitQuery(id);
  const occurrences = useHabitOccurrencesQuery(id, Boolean(query.data?.habit));
  const habit = query.data?.habit;
  const list = occurrences.data?.occurrences ?? [];
  const summary = occurrences.data?.summary;
  const [selected, setSelected] = useState<HabitOccurrence | null>(null);
  const [lifecycle, setLifecycle] = useState<"pause" | "resume" | "archive" | null>(null);
  const actionRef = useRef<HTMLElement>(null), lifecycleRef = useRef<HTMLElement>(null), backgroundRef = useRef<HTMLDivElement>(null);
  const occurrenceDetail = useOccurrenceQuery(selected?.id ?? "", Boolean(selected));
  const statusMutation = useUpdateOccurrenceStatusMutation(id);
  const pause = useHabitLifecycleMutation(id, "pause");
  const resume = useHabitLifecycleMutation(id, "resume");
  const archive = useArchiveHabitMutation();
  const busy = statusMutation.isPending;
  const lifecycleBusy = pause.isPending || resume.isPending || archive.isPending;
  const openOccurrence = (occurrence: HabitOccurrence) => { setSelected(occurrence); statusMutation.reset(); };
  const closeOccurrence = () => { if (!busy) setSelected(null); };
  const closeLifecycle = () => { if (!lifecycleBusy) setLifecycle(null); };
  useModalFocus(Boolean(lifecycle), lifecycleRef, backgroundRef, closeLifecycle);

  const saveStatus = async (status: HabitOccurrenceStatus, comment: string) => {
    if (!selected) return;
    await statusMutation.mutateAsync({ occurrenceId: selected.id, input: { status, comment: comment.trim() || null } });
    setSelected(null);
  };
  const confirmLifecycle = async () => {
    if (!lifecycle) return;
    if (lifecycle === "archive") { await archive.mutateAsync(id); setLifecycle(null); router.replace("/rhythm" as never); return; }
    await (lifecycle === "pause" ? pause : resume).mutateAsync();
    setLifecycle(null);
  };

  const loading = query.isPending && !habit;
  const error = query.isError || !habit;
  const done = summary?.completed ?? 0;
  const partial = summary?.partial ?? 0;
  const rest = summary?.rest ?? 0;
  const skipped = summary?.skipped ?? 0;
  const noResponse = summary?.noResponse ?? 0;
  const total = summary?.total ?? 0;
  const progress = total ? Math.min(1, (done + partial * 0.5) / total) : 0;
  const progressLabel = !total ? "Пока нет запланированных выполнений" : [`${done} из ${total} выполнено`, partial ? `${partial} частично` : null, rest ? `${rest} отдых` : null, skipped ? `${skipped} пропущено` : null, noResponse ? `${noResponse} без ответа` : null].filter(Boolean).join(" · ");
  const cellClass = habit ? COLOR_OPTIONS[habit.color as keyof typeof COLOR_OPTIONS]?.cell ?? COLOR_OPTIONS.sage.cell : COLOR_OPTIONS.sage.cell;

  return <div className="min-h-dvh">
    <div ref={backgroundRef}>
      <PrimaryNavbar title={habit?.title ?? "Привычка"} />
      <main className="flow-screen pb-safe-4">
        {loading ? <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем привычку</span></div>
          : error ? <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="grid justify-items-center gap-3 p-6"><Icon name="triangle-alert" /><h1 className="m-0 text-lg font-semibold">Привычка не найдена</h1><p className="m-0 text-sm text-text-muted">Проверьте ссылку или вернитесь к списку привычек.</p><Button large rounded className={focusRing} onClick={() => router.replace("/rhythm" as never)}>К привычкам</Button></Card>
            : habit ? <>
              <Card component="section" outline className="m-0" contentWrapPadding="grid gap-3 p-4">
                <div className="flex items-start gap-3">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-full text-2xl leading-none ${cellClass}`} aria-hidden="true">{habit.emoji ?? <Icon name={habit.icon} className="size-5" />}</span>
                  <div className="min-w-0"><h1 className="m-0 break-words text-xl font-semibold">{habit.title}</h1><p className="m-0 text-sm text-text-muted">Начало: {formatRuDate(habit.startLocalDate)}{habit.status === "paused" ? " · на паузе" : ""}</p></div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-baseline justify-between gap-2"><h2 className="m-0 text-base font-semibold">Сегодня</h2><span className="text-sm text-text-muted">{progressLabel}</span></div>
                  <Progressbar progress={progress} aria-label={`Прогресс сегодня: ${progressLabel}`} />
                </div>
              </Card>

              <section aria-labelledby="habit-slots-title" className="grid gap-2">
                <BlockTitle component="h2" id="habit-slots-title" className="!m-0">Выполнения</BlockTitle>
                {list.length ? <List strong inset dividers className="!m-0">{list.map((occurrence) => {
                  const status = occurrence.status as HabitOccurrenceStatus;
                  return <ListItem key={occurrence.id} link linkComponent="button" contentClassName="w-full" innerClassName="text-left" linkProps={{ type: "button", onClick: () => openOccurrence(occurrence), "aria-label": `Открыть выполнение ${occurrence.scheduledLocalTime}: ${statusCopy(occurrence.status)}` }} media={<Icon name={terminal.has(occurrence.status) ? OCCURRENCE_STATUS_ICON[status] : "clock-3"} className={occurrence.status === "completed" ? "text-primary" : undefined} />} title={occurrence.scheduledLocalTime} subtitle={statusCopy(occurrence.status)} after={occurrence.status === "completed" ? <Badge>Готово</Badge> : undefined} />;
                })}</List> : <Card component="section" outline className="m-0" contentWrapPadding="p-4"><p className="m-0 text-sm leading-relaxed text-text-muted">История появится после создания расписанных выполнений. Настройка расписания уже сохранена.</p></Card>}
              </section>

              <section aria-labelledby="habit-controls-title" className="grid gap-2">
                <BlockTitle component="h2" id="habit-controls-title" className="!m-0">Управление</BlockTitle>
                <List strong inset dividers className="!m-0">
                  <ListItem link linkComponent="button" contentClassName="w-full" innerClassName="text-left" linkProps={{ type: "button", onClick: () => router.push(`/rhythm/${encodeURIComponent(id)}/edit` as never) }} title="Изменить привычку" after={<Icon name="chevron-right" />} />
                  <ListItem link linkComponent="button" contentClassName="w-full" innerClassName="text-left" linkProps={{ type: "button", onClick: () => setLifecycle(habit.status === "paused" ? "resume" : "pause") }} title={habit.status === "paused" ? "Возобновить привычку" : "Поставить на паузу"} after={<Icon name={habit.status === "paused" ? "play" : "pause"} />} />
                  <ListItem link linkComponent="button" contentClassName="w-full" innerClassName="text-left" linkProps={{ type: "button", onClick: () => setLifecycle("archive") }} title={<span className="text-danger">Архивировать привычку</span>} after={<Icon name="trash-2" className="text-danger" />} />
                </List>
              </section>
            </> : null}
      </main>
    </div>

    <ModalPortal>{selected && <OccurrenceSheet
      key={selected.id}
      occurrence={selected}
      habit={habit!}
      history={occurrenceDetail.data?.history ?? []}
      sheetRef={actionRef}
      backgroundRef={backgroundRef}
      pending={busy}
      error={statusMutation.isError}
      onClose={closeOccurrence}
      onSubmit={saveStatus}
    />}</ModalPortal>
    <ModalPortal>{lifecycle && habit && <Sheet ref={lifecycleRef} opened backdrop onBackdropClick={closeLifecycle} className="flex max-h-[70dvh] max-w-full flex-col" role="dialog" aria-modal="true" aria-labelledby="habit-lifecycle-title">
      <Navbar title={<span id="habit-lifecycle-title">{lifecycle === "archive" ? "Архивировать привычку?" : lifecycle === "pause" ? "Поставить на паузу?" : "Возобновить привычку?"} </span>} />
      <div className="grid gap-3 overflow-y-auto px-4 pb-safe-6 pt-2">
        <p className="m-0 text-sm leading-relaxed text-text-muted">{lifecycle === "archive" ? "Привычка исчезнет из активного списка, а история сохранится." : lifecycle === "pause" ? "Новые выполнения не будут создаваться до возобновления. История останется без изменений." : "Будущие выполнения снова смогут появляться по сохранённому расписанию."}</p>
        {(pause.isError || resume.isError || archive.isError) ? <p className="m-0 text-sm text-danger" role="alert">Не удалось сохранить изменение. Попробуйте ещё раз.</p> : null}
        <Button large rounded outline={lifecycle === "archive"} colors={lifecycle === "archive" ? { textIos: "text-danger", outlineBorderIos: "border-danger" } : undefined} className={focusRing} disabled={lifecycleBusy} onClick={() => void confirmLifecycle()}>{lifecycleBusy ? "Сохраняем…" : lifecycle === "archive" ? "Архивировать" : lifecycle === "pause" ? "Поставить на паузу" : "Возобновить"}</Button>
        <Button large rounded clear className={focusRing} disabled={lifecycleBusy} onClick={closeLifecycle}>Отмена</Button>
      </div>
    </Sheet>}</ModalPortal>
  </div>;
}

function OccurrenceSheet({ occurrence, habit, history, sheetRef, backgroundRef, pending, error, onClose, onSubmit }: {
  occurrence: HabitOccurrence;
  habit: Habit;
  history: Array<{ id: string; oldStatus: string | null; newStatus: string; comment: string | null; createdAt: string }>;
  sheetRef: RefObject<HTMLElement | null>;
  backgroundRef: RefObject<HTMLElement | null>;
  pending: boolean;
  error: boolean;
  onClose: () => void;
  onSubmit: (status: HabitOccurrenceStatus, comment: string) => Promise<void>;
}) {
  const initial = terminal.has(occurrence.status) ? occurrence.status as HabitOccurrenceStatus : "completed";
  const [status, setStatus] = useState<HabitOccurrenceStatus>(initial);
  const [comment, setComment] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  useModalFocus(true, sheetRef, backgroundRef, onClose);
  const can = (item: HabitOccurrenceStatus) => (item !== "skipped" || habit.allowSkip) && (item !== "rest" || habit.allowRest);
  const latest = history[0];
  return <Sheet ref={sheetRef} opened backdrop onBackdropClick={onClose} className="flex max-h-[88dvh] max-w-full flex-col" role="dialog" aria-modal="true" aria-labelledby="occurrence-title">
    <Navbar title={<span id="occurrence-title">Выполнение · {occurrence.scheduledLocalTime}</span>} />
    <div className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto py-2">
      <List strong dividers className="!m-0">{HABIT_OCCURRENCE_STATUSES.map((item) => <ListItem key={item} label title={OCCURRENCE_STATUS_LABEL[item]} subtitle={item === "rest" && !habit.allowRest ? "В настройках отдых не разрешён" : item === "skipped" && !habit.allowSkip ? "В настройках пропуск не разрешён" : undefined} after={<Radio component="div" name={`occurrence-status-${occurrence.id}`} checked={status === item} disabled={!can(item) || pending} onChange={() => setStatus(item)} />} />)}</List>
      {latest ? <p className="m-0 px-4 pt-3 text-xs text-text-muted">Изменений: {history.length}. Последний статус: {OCCURRENCE_STATUS_LABEL[latest.newStatus as HabitOccurrenceStatus] ?? latest.newStatus}.</p> : null}
      {!commentOpen ? <Button clear rounded className={`mx-4 mt-2 w-[calc(100%_-_2rem)] min-w-0 gap-2 whitespace-normal ${focusRing}`} disabled={pending} onClick={() => setCommentOpen(true)}><Icon name="plus" />Добавить комментарий</Button> : <List strong inset className="!my-2"><ListInput title="" outline type="text" label="Комментарий (необязательно)" value={comment} maxLength={500} onInput={(event) => setComment(event.currentTarget.value)} /></List>}
      {error ? <p className="m-4 text-sm text-danger" role="alert">Не удалось сохранить. Выбор и комментарий не потеряны.</p> : null}
    </div>
    <div className="grid grid-cols-2 gap-2 border-t border-border p-4 pb-safe-6"><Button clear rounded className={focusRing} disabled={pending} onClick={onClose}>Отмена</Button><Button large rounded className={focusRing} disabled={pending || !can(status)} onClick={() => void onSubmit(status, comment)}>{pending ? "Сохраняем…" : "Сохранить"}</Button></div>
  </Sheet>;
}
