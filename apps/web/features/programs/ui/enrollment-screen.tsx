"use client";

import { Badge, BlockTitle, Button, Card, List, ListItem, Navbar, Preloader, Progressbar, Sheet } from "konsta/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Icon } from "@flowly/ui";
import { ModalPortal } from "@/components/modal-portal";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { useModalFocus } from "@/components/use-modal-focus";
import { apiJson } from "@/lib/api/client";
import { formatRuDate } from "../model/program-dates";
import { DAY_STATE_LABEL, type DayProgressState } from "../model/program-progress";
import { DURATION_LABEL } from "../model/programs";
import { useActiveSessionQuery } from "@/features/workout-session/model/workout-session-queries";
import { programsKeys, useRestEnrollmentDayMutation, useSkipEnrollmentDayMutation } from "../model/programs-queries";

type EnrollmentResponse = {
  enrollment: {
    id: string;
    startLocalDate: string;
    endLocalDate: string;
    status: string;
    todayLocalDate: string;
    progress: {
      currentDayNumber: number;
      durationDays: number;
      completedWorkoutDays: number;
      totalWorkoutDays: number;
      plannedRestDays: number;
      userRestDays: number;
      skippedDays: number;
      percent: number;
      todayWorkoutId: string | null;
      todayDayNumber: number | null;
      todayIsPlannedRest: boolean;
    };
    program: { id: string; title: string; durationDays: number; categoryLabel: string };
    days: Array<{
      id: string;
      dayNumber: number;
      type: string;
      title: string;
      description: string;
      workoutId: string | null;
      scheduledLocalDate: string;
      state: DayProgressState;
      done: boolean;
      skipped: boolean;
      userRest: boolean;
      canSkip: boolean;
      canRest: boolean;
    }>;
  };
};

type ConfirmKind = "rest" | "skip";
type ConfirmState = { kind: ConfirmKind; dayNumber: number };

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

const stateBadge = (state: DayProgressState) => {
  if (state === "completed") return <Badge className="bg-primary text-white">Сделано</Badge>;
  if (state === "skipped") return <Badge className="opacity-80">Пропущено</Badge>;
  if (state === "user_rest") return <Badge>Отдыхаю</Badge>;
  if (state === "today") return <Badge>Сегодня</Badge>;
  if (state === "rest_today") return <Badge>Отдых · сегодня</Badge>;
  if (state === "rest") return <Badge>Отдых</Badge>;
  if (state === "missed") return <Badge className="opacity-80">Не отмечено</Badge>;
  return undefined;
};

const CONFIRM_COPY: Record<ConfirmKind, { title: string; body: string; action: string }> = {
  rest: {
    title: "Отметить отдых?",
    body: "День практики закроется как «отдыхаю». Это не пропуск, даты программы не сдвинутся.",
    action: "Отдыхаю",
  },
  skip: {
    title: "Пропустить день?",
    body: "День отметится как пропущенный. Даты следующих дней не сдвинутся.",
    action: "Пропустить",
  },
};

export function EnrollmentScreen({ id }: { id: string }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: programsKeys.enrollment(id),
    queryFn: ({ signal }) => apiJson<EnrollmentResponse>(`/api/v1/program-enrollments/${encodeURIComponent(id)}`, { signal }),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
  const skip = useSkipEnrollmentDayMutation(id);
  const rest = useRestEnrollmentDayMutation(id);
  const activeSession = useActiveSessionQuery().data?.session ?? null;
  const enrollment = query.data?.enrollment;
  const loading = query.isPending && !enrollment;
  const error = query.isError && !enrollment;
  const progress = enrollment?.progress;
  const busy = skip.isPending || rest.isPending;
  const actionError = skip.isError ? "Не удалось пропустить." : rest.isError ? "Не удалось отметить отдых." : null;
  const todayWorkoutId = progress?.todayWorkoutId ?? null;
  const activeToday = Boolean(todayWorkoutId && activeSession?.workoutId === todayWorkoutId);
  const openToday = () => {
    if (!todayWorkoutId) return;
    if (activeToday && activeSession) router.push(`/sessions/${encodeURIComponent(activeSession.id)}` as never);
    else router.push(`/workouts/${encodeURIComponent(todayWorkoutId)}` as never);
  };

  const backgroundRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const dismiss = () => { if (!busy) setConfirm(null); };
  useModalFocus(Boolean(confirm), sheetRef, backgroundRef, dismiss);

  const ask = (kind: ConfirmKind, dayNumber: number) => {
    if (busy) return;
    setConfirm({ kind, dayNumber });
  };
  const submitConfirm = async () => {
    if (!confirm || busy) return;
    try {
      if (confirm.kind === "rest") await rest.mutateAsync(confirm.dayNumber);
      else await skip.mutateAsync(confirm.dayNumber);
      setConfirm(null);
    } catch { /* error via mutation flags */ }
  };
  const copy = confirm ? CONFIRM_COPY[confirm.kind] : null;

  return <div className="min-h-dvh">
    <div ref={backgroundRef}>
      <PrimaryNavbar title={enrollment?.program.title ?? "Прохождение"} />
      <main className="flow-screen">
        {loading ? <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем</span></div>
          : error || !enrollment || !progress ? <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="triangle-alert" /><h1 className="m-0 text-lg font-semibold">Не найдено</h1><Button large rounded className={focusRing} onClick={() => router.push("/programs" as never)}>К программам</Button></Card>
            : <>
              <Card component="section" outline className="m-0" contentWrapPadding="p-4 grid gap-3">
                <div className="grid gap-1">
                  <h1 className="m-0 text-xl font-semibold">{enrollment.program.title}</h1>
                  <p className="m-0 text-sm text-text-muted">
                    {DURATION_LABEL[enrollment.program.durationDays]} · {enrollment.program.categoryLabel} · {formatRuDate(enrollment.startLocalDate)} — {formatRuDate(enrollment.endLocalDate)}
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="m-0 text-sm font-semibold">
                      {progress.currentDayNumber <= 0 ? "Ещё не началась" : progress.currentDayNumber >= progress.durationDays ? "Календарь пройден" : `День ${progress.currentDayNumber} из ${progress.durationDays}`}
                    </p>
                    <p className="m-0 text-sm text-text-muted">{progress.completedWorkoutDays}/{progress.totalWorkoutDays} практик</p>
                  </div>
                  <Progressbar progress={progress.percent / 100} aria-label={`Прогресс: ${progress.percent}%`} />
                </div>
                {progress.todayIsPlannedRest
                  ? <p className="m-0 min-h-12 rounded-xl bg-accent-soft px-3 py-3 text-sm leading-snug">Сегодня отдых в плане — практика не нужна.</p>
                  : progress.todayWorkoutId && progress.todayDayNumber
                    ? <div className="grid gap-2">
                      <Button large rounded className={`min-h-12 w-full font-semibold ${focusRing}`} onClick={openToday}>
                        {activeToday ? "Продолжить практику" : "К практике дня"}
                      </Button>
                      <Button large rounded tonal className={`min-h-12 w-full whitespace-nowrap ${focusRing}`} disabled={busy} onClick={() => ask("rest", progress.todayDayNumber!)}>
                        Отдыхаю
                      </Button>
                      <Button large rounded clear className={`min-h-12 w-full whitespace-nowrap ${focusRing}`} disabled={busy} onClick={() => ask("skip", progress.todayDayNumber!)}>
                        Пропустить день
                      </Button>
                      <p className={`m-0 min-h-5 text-center text-xs ${actionError ? "text-red-500" : "text-text-muted"}`} role={actionError ? "alert" : undefined}>
                        {actionError ?? "Даты следующих дней не сдвигаются"}
                      </p>
                    </div>
                    : null}
              </Card>

              <section aria-labelledby="enrollment-days-title" className="grid gap-2">
                <BlockTitle component="h2" id="enrollment-days-title" className="!m-0">Календарь дней</BlockTitle>
                <List strong inset dividers className="!m-0">
                  {enrollment.days.map((day) => {
                    const openWorkout = day.workoutId && (day.state === "today" || day.state === "completed" || day.state === "missed" || day.state === "upcoming" || day.state === "skipped" || day.state === "user_rest");
                    return <ListItem
                      key={day.id}
                      link={Boolean(openWorkout)}
                      linkComponent={openWorkout ? "button" : undefined}
                      linkProps={openWorkout ? { type: "button", onClick: () => router.push(`/workouts/${encodeURIComponent(day.workoutId!)}` as never) } : undefined}
                      contentClassName={openWorkout ? "w-full" : undefined}
                      innerClassName={openWorkout ? "text-left" : undefined}
                      media={day.state === "completed" ? <Icon name="circle-check" className="text-primary" /> : <Badge>{day.dayNumber}</Badge>}
                      title={day.title || (day.type === "rest" ? "Отдых" : "Практика")}
                      subtitle={`${formatRuDate(day.scheduledLocalDate)}${day.state === "today" || day.state === "rest_today" ? " · сейчас" : day.type === "rest" ? " · в плане" : ""}`}
                      after={stateBadge(day.state) ?? (day.state === "upcoming" ? <span className="text-sm text-text-muted">{DAY_STATE_LABEL.upcoming}</span> : undefined)}
                    />;
                  })}
                </List>
              </section>

              {enrollment.days.some((d) => d.canSkip && d.state === "missed")
                ? <section aria-labelledby="missed-actions-title" className="grid gap-2">
                  <BlockTitle component="h2" id="missed-actions-title" className="!m-0">Неотмеченные дни</BlockTitle>
                  <List strong inset dividers className="!m-0">
                    {enrollment.days.filter((d) => d.canSkip && d.state === "missed").map((day) => (
                      <ListItem
                        key={`miss-${day.id}`}
                        title={day.title || `День ${day.dayNumber}`}
                        subtitle={formatRuDate(day.scheduledLocalDate)}
                        footer={<div className="flex flex-wrap gap-2 pb-2">
                          <Button small rounded tonal className={focusRing} disabled={busy} onClick={() => ask("rest", day.dayNumber)}>Отдыхаю</Button>
                          <Button small rounded clear className={focusRing} disabled={busy} onClick={() => ask("skip", day.dayNumber)}>Пропустить</Button>
                        </div>}
                      />
                    ))}
                  </List>
                </section>
                : null}

              <Button clear rounded className={`justify-self-start ${focusRing}`} onClick={() => router.push(`/programs/${enrollment.program.id}` as never)}>Описание программы</Button>
            </>}
      </main>
    </div>

    <ModalPortal>{confirm && copy && <Sheet
      ref={sheetRef}
      opened
      backdrop
      onBackdropClick={dismiss}
      className="flex max-h-[70dvh] max-w-full flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-confirm-title"
    >
      <Navbar
        title={copy.title}
        titleFontSizeIos="text-[17px]"
        right={<Button clear rounded className={focusRing} disabled={busy} onClick={dismiss}>Отмена</Button>}
        className="shrink-0"
      />
      <div className="grid gap-3 overflow-y-auto px-4 pb-safe-6 pt-2">
        <p id="day-confirm-title" className="sr-only">{copy.title}</p>
        <p className="m-0 text-sm leading-relaxed text-text-muted">{copy.body}</p>
        <Button large rounded className={`min-h-12 w-full font-semibold ${focusRing}`} disabled={busy} onClick={() => void submitConfirm()}>
          {busy ? "Сохраняем…" : copy.action}
        </Button>
        <Button large rounded clear className={`min-h-12 w-full ${focusRing}`} disabled={busy} onClick={dismiss}>Не сейчас</Button>
      </div>
    </Sheet>}</ModalPortal>
  </div>;
}
