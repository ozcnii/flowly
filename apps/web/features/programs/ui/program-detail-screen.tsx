"use client";

import { Badge, BlockTitle, Button, Card, List, ListItem, Navbar, Preloader, Radio, Sheet } from "konsta/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Icon } from "@flowly/ui";
import { ModalPortal } from "@/components/modal-portal";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { useModalFocus } from "@/components/use-modal-focus";
import { useMeQuery } from "@/features/profile/model/me-queries";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image";
import { addLocalDays, formatRuDate, localDateInTimezone, scheduleLocalDate } from "../model/program-dates";
import { DURATION_LABEL, minutes } from "../model/programs";
import { useEnrollProgramMutation, useProgramDetailQuery } from "../model/programs-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
const choiceFocus = "rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent";
/** How many start-date options to list (today + N−1). No native date picker — Telegram WebView often blocks showPicker. */
const START_OPTIONS = 14;

const weekdayRu = (localDate: string) => {
  try {
    return new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(new Date(`${localDate}T12:00:00`));
  } catch {
    return "";
  }
};

const startOptionTitle = (localDate: string, today: string, tomorrow: string) =>
  localDate === today ? "Сегодня" : localDate === tomorrow ? "Завтра" : weekdayRu(localDate);

export function ProgramDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const me = useMeQuery();
  const query = useProgramDetailQuery(id);
  const enroll = useEnrollProgramMutation(id);
  const program = query.data?.program;
  const loading = query.isPending && !program;
  const error = query.isError && !program;
  const backgroundRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const today = useMemo(() => localDateInTimezone(me.data?.user.timezone ?? "Europe/Moscow"), [me.data?.user.timezone]);
  const tomorrow = useMemo(() => addLocalDays(today, 1), [today]);
  const startOptions = useMemo(() => Array.from({ length: START_OPTIONS }, (_, i) => addLocalDays(today, i)), [today]);
  const [dateValue, setDateValue] = useState(today);
  const openSheet = () => { setDateValue(today); setOpen(true); };
  const dismiss = () => { if (!enroll.isPending) setOpen(false); };
  useModalFocus(open, sheetRef, backgroundRef, dismiss);

  const endPreview = program ? scheduleLocalDate(dateValue, program.durationDays) : "";
  const submit = async () => {
    try {
      const data = await enroll.mutateAsync(dateValue);
      setOpen(false);
      router.push(`/programs/enrollments/${data.enrollment.id}` as never);
    } catch { /* inline error */ }
  };

  return <div className="min-h-dvh">
    <div ref={backgroundRef}>
      <PrimaryNavbar title={program?.title ?? "Программа"} />
      <main className="flow-screen">
        {loading ? <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем программу</span></div>
          : error || !program ? <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="triangle-alert" /><h1 className="m-0 text-lg font-semibold">Программа не найдена</h1><p className="m-0 text-sm text-text-muted">Вернитесь к списку программ.</p><Button large rounded className={focusRing} onClick={() => router.push("/programs" as never)}>К программам</Button></Card>
            : <>
              <Card component="section" contentWrap={false} outline className="m-0 overflow-hidden">
                <div className="relative aspect-video bg-accent-soft">
                  <Image src={program.coverObjectKey ? `/media/${program.coverObjectKey}` : "/media/home-program.webp"} alt="" fill sizes="(max-width: 430px) calc(100vw - 40px), 640px" preload decoding="sync" placeholder="blur" blurDataURL={IMAGE_BLUR_DATA_URL} className="object-cover" />
                </div>
                <div className="grid gap-2 p-4">
                  <h1 className="m-0 text-xl font-semibold leading-tight">{program.title}</h1>
                  <p className="m-0 text-sm text-text-muted">{[DURATION_LABEL[program.durationDays], program.categoryLabel].filter(Boolean).join(" · ")}</p>
                  <p className="m-0 text-sm leading-relaxed text-text-muted">{program.description}</p>
                </div>
              </Card>

              {program.activeEnrollment ? <Card component="aside" outline className="m-0" contentWrapPadding="p-3 grid gap-2">
                <p className="m-0 text-sm font-semibold">Идёт с {formatRuDate(program.activeEnrollment.startLocalDate)}</p>
                <p className="m-0 text-sm text-text-muted">До {formatRuDate(program.activeEnrollment.endLocalDate)} · даты дней ниже</p>
                <Button large rounded className={focusRing} onClick={() => router.push(`/programs/enrollments/${program.activeEnrollment!.id}` as never)}>Открыть прохождение</Button>
              </Card> : <div className="grid gap-1.5">
                <Button large rounded className="min-h-12 font-semibold" disabled={!program.actions.start.enabled} onClick={openSheet}>Начать программу</Button>
                <p className="m-0 min-h-5 text-center text-xs text-text-muted">{program.actions.start.reason}</p>
              </div>}

              <section aria-labelledby="program-days-title" className="grid gap-2">
                <BlockTitle component="h2" id="program-days-title" className="!m-0">Дни программы</BlockTitle>
                <List strong inset dividers className="!m-0">
                  {program.days.map((day) => {
                    const dateLabel = day.scheduledLocalDate ? formatRuDate(day.scheduledLocalDate) : undefined;
                    return day.type === "rest"
                      ? <ListItem key={day.id} media={<Badge>День {day.dayNumber}</Badge>} title={day.title || "Отдых"} subtitle={[dateLabel, "Запланированный отдых"].filter(Boolean).join(" · ")} after={<Badge>Отдых</Badge>} />
                      : <ListItem
                        key={day.id}
                        link
                        linkComponent="button"
                        linkProps={{ type: "button", onClick: () => day.workout && router.push(`/workouts/${encodeURIComponent(day.workout.id)}` as never) }}
                        contentClassName="w-full"
                        innerClassName="text-left"
                        media={<Badge>День {day.dayNumber}</Badge>}
                        title={day.workout?.title ?? day.title}
                        subtitle={[dateLabel, day.workout ? minutes(day.workout.durationSeconds) : undefined].filter(Boolean).join(" · ") || undefined}
                        text={day.description || undefined}
                      />;
                  })}
                </List>
              </section>

              <Button component={NextLink} href="/programs" clear rounded className={`justify-self-start ${focusRing}`}>Все программы</Button>
            </>}
      </main>
    </div>

    <ModalPortal>{open && program && <Sheet ref={sheetRef} opened backdrop onBackdropClick={dismiss} className="flex max-h-[88dvh] max-w-full flex-col" role="dialog" aria-modal="true" aria-labelledby="enroll-title">
      <Navbar title={<span id="enroll-title">Когда начать?</span>} />
      <div className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto py-2">
        <p className="m-0 px-4 pb-2 text-sm leading-relaxed text-text-muted">{program.title} · {DURATION_LABEL[program.durationDays]}</p>
        <List strong dividers className="!m-0">
          {startOptions.map((date) => <ListItem
            key={date}
            label
            title={startOptionTitle(date, today, tomorrow)}
            subtitle={formatRuDate(date)}
            after={<Radio component="div" className={choiceFocus} name="enroll-start" checked={dateValue === date} onChange={() => setDateValue(date)} />}
          />)}
        </List>
        <p className="m-0 px-4 pt-2 text-sm text-text-muted">Последний день: {formatRuDate(endPreview)}</p>
        {enroll.isError && <p className="m-4 text-sm text-danger" role="alert">Не удалось сохранить. Дата не потеряна.</p>}
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-border p-4 pb-safe-6">
        <Button clear rounded className={focusRing} disabled={enroll.isPending} onClick={dismiss}>Отмена</Button>
        <Button large rounded disabled={enroll.isPending || !dateValue} onClick={() => void submit()}>{enroll.isPending ? "Сохраняем…" : "Начать"}</Button>
      </div>
    </Sheet>}</ModalPortal>
  </div>;
}
