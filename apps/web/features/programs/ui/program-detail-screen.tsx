"use client";

import { Badge, BlockTitle, Button, Card, List, ListItem, Preloader } from "konsta/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image";
import { DURATION_LABEL, minutes } from "../model/programs";
import { useProgramDetailQuery } from "../model/programs-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

export function ProgramDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const query = useProgramDetailQuery(id);
  const program = query.data?.program;
  const loading = query.isPending && !program;
  const error = query.isError && !program;

  return <div className="min-h-dvh">
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

            <div className="grid gap-1.5">
              <Button large rounded className="min-h-12 font-semibold" disabled>Начать программу</Button>
              <p className="m-0 min-h-5 text-center text-xs text-text-muted">{program.actions.start.reason}</p>
            </div>

            <section aria-labelledby="program-days-title" className="grid gap-2">
              <BlockTitle component="h2" id="program-days-title" className="!m-0">Дни программы</BlockTitle>
              <List strong inset dividers className="!m-0">
                {program.days.map((day) => day.type === "rest"
                  ? <ListItem key={day.id} media={<Badge>День {day.dayNumber}</Badge>} title={day.title || "Отдых"} subtitle="Запланированный отдых" after={<Badge>Отдых</Badge>} />
                  : <ListItem
                    key={day.id}
                    link
                    linkComponent="button"
                    linkProps={{ type: "button", onClick: () => day.workout && router.push(`/workouts/${encodeURIComponent(day.workout.id)}` as never) }}
                    contentClassName="w-full"
                    innerClassName="text-left"
                    media={<Badge>День {day.dayNumber}</Badge>}
                    title={day.workout?.title ?? day.title}
                    subtitle={day.workout ? minutes(day.workout.durationSeconds) : undefined}
                    text={day.description || undefined}
                  />)}
              </List>
            </section>

            <Button component={NextLink} href="/programs" clear rounded className={`justify-self-start ${focusRing}`}>Все программы</Button>
          </>}
    </main>
  </div>;
}
