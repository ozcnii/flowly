"use client";

import { Badge, BlockTitle, Button, Card, List, ListItem, Preloader, Progressbar } from "konsta/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { apiJson } from "@/lib/api/client";
import { formatRuDate } from "../model/program-dates";
import { DAY_STATE_LABEL, type DayProgressState } from "../model/program-progress";
import { DURATION_LABEL } from "../model/programs";
import { programsKeys } from "../model/programs-queries";

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
      percent: number;
      todayWorkoutId: string | null;
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
    }>;
  };
};

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

const stateBadge = (state: DayProgressState) => {
  if (state === "completed") return <Badge className="bg-primary text-white">Сделано</Badge>;
  if (state === "today" || state === "rest_today") return <Badge>Сегодня</Badge>;
  if (state === "rest") return <Badge>Отдых</Badge>;
  if (state === "missed") return <Badge className="opacity-80">Пропуск</Badge>;
  return undefined;
};

export function EnrollmentScreen({ id }: { id: string }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: programsKeys.enrollment(id),
    queryFn: ({ signal }) => apiJson<EnrollmentResponse>(`/api/v1/program-enrollments/${encodeURIComponent(id)}`, { signal }),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
  const enrollment = query.data?.enrollment;
  const loading = query.isPending && !enrollment;
  const error = query.isError && !enrollment;
  const progress = enrollment?.progress;

  return <div className="min-h-dvh">
    <PrimaryNavbar title={enrollment?.program.title ?? "Прохождение"} />
    <main className="flow-screen">
      {loading ? <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем</span></div>
        : error || !enrollment || !progress ? <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="triangle-alert" /><h1 className="m-0 text-lg font-semibold">Не найдено</h1><Button large rounded className={focusRing} onClick={() => router.push("/programs" as never)}>К программам</Button></Card>
          : <>
            <Card component="section" outline className="m-0" contentWrapPadding="p-4 grid gap-3">
              <div className="grid gap-1">
                <h1 className="m-0 text-xl font-semibold">{enrollment.program.title}</h1>
                <p className="m-0 text-sm text-text-muted">{DURATION_LABEL[enrollment.program.durationDays]} · {enrollment.program.categoryLabel}</p>
                <p className="m-0 text-sm text-text-muted">{formatRuDate(enrollment.startLocalDate)} — {formatRuDate(enrollment.endLocalDate)}</p>
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
              {progress.todayWorkoutId
                ? <Button large rounded className={`min-h-12 font-semibold ${focusRing}`} onClick={() => router.push(`/workouts/${encodeURIComponent(progress.todayWorkoutId!)}` as never)}>Начать сегодняшнюю</Button>
                : null}
            </Card>

            <section aria-labelledby="enrollment-days-title" className="grid gap-2">
              <BlockTitle component="h2" id="enrollment-days-title" className="!m-0">Календарь дней</BlockTitle>
              <List strong inset dividers className="!m-0">
                {enrollment.days.map((day) => {
                  const openWorkout = day.workoutId && (day.state === "today" || day.state === "completed" || day.state === "missed" || day.state === "upcoming");
                  return <ListItem
                    key={day.id}
                    link={Boolean(openWorkout)}
                    linkComponent={openWorkout ? "button" : undefined}
                    linkProps={openWorkout ? { type: "button", onClick: () => router.push(`/workouts/${encodeURIComponent(day.workoutId!)}` as never) } : undefined}
                    contentClassName={openWorkout ? "w-full" : undefined}
                    innerClassName={openWorkout ? "text-left" : undefined}
                    media={day.state === "completed" ? <Icon name="circle-check" className="text-primary" /> : <Badge>{day.dayNumber}</Badge>}
                    title={day.title || (day.type === "rest" ? "Отдых" : "Практика")}
                    subtitle={`${formatRuDate(day.scheduledLocalDate)}${day.state === "today" || day.state === "rest_today" ? " · сейчас" : ""}`}
                    after={stateBadge(day.state) ?? (day.state === "upcoming" ? <span className="text-sm text-text-muted">{DAY_STATE_LABEL.upcoming}</span> : undefined)}
                  />;
                })}
              </List>
            </section>

            <p className="m-0 text-xs text-text-muted">Отметка «Сделано» появляется после завершения тренировки в этот день. Пропуск не сдвигает даты.</p>
            <Button clear rounded className={`justify-self-start ${focusRing}`} onClick={() => router.push(`/programs/${enrollment.program.id}` as never)}>Описание программы</Button>
          </>}
    </main>
  </div>;
}
