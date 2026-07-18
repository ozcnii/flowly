"use client";

import { Badge, BlockTitle, Button, Card, List, ListItem, Preloader } from "konsta/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { apiJson } from "@/lib/api/client";
import { formatRuDate } from "../model/program-dates";
import { DURATION_LABEL } from "../model/programs";
import { programsKeys } from "../model/programs-queries";

type EnrollmentResponse = {
  enrollment: {
    id: string;
    startLocalDate: string;
    endLocalDate: string;
    status: string;
    program: { id: string; title: string; durationDays: number; categoryLabel: string };
    days: Array<{ id: string; dayNumber: number; type: string; title: string; description: string; workoutId: string | null; scheduledLocalDate: string }>;
  };
};

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

export function EnrollmentScreen({ id }: { id: string }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: programsKeys.enrollment(id),
    queryFn: ({ signal }) => apiJson<EnrollmentResponse>(`/api/v1/program-enrollments/${encodeURIComponent(id)}`, { signal }),
    enabled: Boolean(id),
  });
  const enrollment = query.data?.enrollment;
  const loading = query.isPending && !enrollment;
  const error = query.isError && !enrollment;

  return <div className="min-h-dvh">
    <PrimaryNavbar title={enrollment?.program.title ?? "Прохождение"} />
    <main className="flow-screen">
      {loading ? <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем</span></div>
        : error || !enrollment ? <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="triangle-alert" /><h1 className="m-0 text-lg font-semibold">Не найдено</h1><Button large rounded className={focusRing} onClick={() => router.push("/programs" as never)}>К программам</Button></Card>
          : <>
            <Card component="section" outline className="m-0" contentWrapPadding="p-4 grid gap-2">
              <h1 className="m-0 text-xl font-semibold">{enrollment.program.title}</h1>
              <p className="m-0 text-sm text-text-muted">{DURATION_LABEL[enrollment.program.durationDays]} · {enrollment.program.categoryLabel}</p>
              <p className="m-0 text-sm text-text-muted">{formatRuDate(enrollment.startLocalDate)} — {formatRuDate(enrollment.endLocalDate)}</p>
              <p className="m-0 text-sm text-text-muted">Пропуск дня не сдвигает календарь. Прогресс и отметки — следующий шаг.</p>
            </Card>

            <section aria-labelledby="enrollment-days-title" className="grid gap-2">
              <BlockTitle component="h2" id="enrollment-days-title" className="!m-0">Календарь дней</BlockTitle>
              <List strong inset dividers className="!m-0">
                {enrollment.days.map((day) => day.type === "rest"
                  ? <ListItem key={day.id} media={<Badge>{day.dayNumber}</Badge>} title={day.title || "Отдых"} subtitle={formatRuDate(day.scheduledLocalDate)} after={<Badge>Отдых</Badge>} />
                  : <ListItem
                    key={day.id}
                    link={Boolean(day.workoutId)}
                    linkComponent="button"
                    linkProps={day.workoutId ? { type: "button", onClick: () => router.push(`/workouts/${encodeURIComponent(day.workoutId!)}` as never) } : undefined}
                    contentClassName={day.workoutId ? "w-full" : undefined}
                    innerClassName={day.workoutId ? "text-left" : undefined}
                    media={<Badge>{day.dayNumber}</Badge>}
                    title={day.title}
                    subtitle={formatRuDate(day.scheduledLocalDate)}
                  />)}
              </List>
            </section>

            <Button clear rounded className={`justify-self-start ${focusRing}`} onClick={() => router.push(`/programs/${enrollment.program.id}` as never)}>Описание программы</Button>
          </>}
    </main>
  </div>;
}
