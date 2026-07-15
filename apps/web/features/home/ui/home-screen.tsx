"use client";

import { Badge, BlockTitle, Button, Card, List, ListItem, Preloader, Progressbar } from "konsta/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";
import type { HomeScenario } from "../model/home-scenario";
import type { HomeViewModel } from "../model/home-view-model";

type Props = { data: HomeViewModel; scenario?: HomeScenario };
const secondaryColors = { textIos: "text-accent dark:text-white", outlineBorderIos: "border-accent/40 dark:border-white/40", clearBgIos: "bg-transparent active:bg-accent/10 dark:active:bg-white/10" };
const groupTitleColors = { groupTitleBgIos: "bg-surface-subtle", secondaryTextIos: "text-text-muted" };

export function HomeScreen({ data, scenario = "base" }: Props) {
  const router = useRouter();
  const nextAction = data.plan.find((item) => item.status === "current") ?? data.plan.find((item) => item.status === "upcoming");
  if (scenario === "loading") return <HomeLoading />;
  if (scenario === "empty") return <HomeEmpty />;

  return <div className="flow-screen flow-screen--wide">
    {scenario === "offline" && <Card component="aside" outline role="status" header={<Badge>Офлайн</Badge>}><p className="m-0 text-sm text-text-muted">Показываем сохранённые данные. Действия, требующие сети, временно недоступны.</p></Card>}

    {scenario === "resume" && <Card component="section" outline header={<Badge>Можно продолжить</Badge>} contentWrapPadding="p-3 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 items-center">
      <Image src={data.resume.image} alt="Мягкая практика для спины" width={72} height={72} priority className="h-[4.5rem] w-[4.5rem] rounded-xl object-cover" />
      <div className="grid min-w-0 gap-2">
        <BlockTitle component="h2" medium className="!m-0 !p-0">{data.resume.title}</BlockTitle>
        <p className="m-0 text-sm text-text-muted">{data.resume.meta}</p>
        <Button component={NextLink} href="/workouts/wo-back-soft-15" inline rounded outline colors={secondaryColors}>Открыть тренировку</Button>
      </div>
    </Card>}

    <Card component="section" outline contentWrap={false} aria-labelledby="day-progress-title">
      <div className="grid gap-3 p-4">
        <BlockTitle component="h2" className="!m-0 !p-0" id="day-progress-title">Твой прогресс на сегодня</BlockTitle>
        <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-4">
          <DayProgressRing value={data.progress.percent} />
          <div className="grid gap-1">
            <strong className="text-lg">Хороший темп</strong>
            <p className="m-0 text-sm leading-5 text-text-muted">{data.progress.completed} из {data.progress.total} выполнено · {data.progress.remaining} осталось</p>
            <p className="m-0 text-xs leading-5 text-text-muted">{data.progress.partial} частично · {data.progress.noResponse ? `${data.progress.noResponse} без ответа` : "без ответа нет"}</p>
          </div>
        </div>
      </div>
      {nextAction && <List dividers className="m-0">
        <ListItem link linkComponent="button" contentClassName="w-full text-left" linkProps={{ type: "button", onClick: () => router.push(nextAction.href as never) }} header="Ближайшее действие" title={nextAction.title} subtitle={nextAction.meta.split(" · ")[0]} after={<Badge>{nextAction.status === "current" ? "Сейчас" : "Далее"}</Badge>} />
      </List>}
    </Card>

    <NextLink href="/programs" aria-label={`Открыть программу ${data.program.title}`} className="block text-inherit no-underline">
      <Card outline header={<h2 className="m-0">Текущая программа</h2>} contentWrapPadding="p-4 grid gap-3">
        <Image src={data.program.image} alt={`Практика программы «${data.program.title}»`} width={640} height={360} priority className="aspect-video w-full rounded-xl object-cover" />
        <BlockTitle component="h3" medium className="!m-0 !p-0">{data.program.title}</BlockTitle>
        <p className="m-0 text-sm text-text-muted">{data.program.meta} · 15–20 минут</p>
        <Progressbar progress={data.program.percent / 100} aria-label={`Прогресс программы: ${data.program.percent}%`} />
      </Card>
    </NextLink>

    <section aria-label="Привычки на сегодня">
      <List strong inset dividers className="m-0">
        <ListItem groupTitle colors={groupTitleColors} title={`Сегодняшние привычки · ${data.habits.filter((item) => item.done).length} из ${data.habits.length}`} />
        {data.habits.map((item) => <ListItem key={item.id} media={<Icon name={item.icon} />} title={item.title} subtitle={item.meta} after={<><span className="sr-only">{item.done ? "Готово" : "Осталось"}</span><Icon name={item.done ? "circle-check" : "circle"} className={item.done ? "text-accent" : "text-text-muted"} /></>} />)}
      </List>
    </section>

    <Button component={NextLink} href="/catalog" large rounded className="gap-2"><Icon name="play" />Начать тренировку</Button>
  </div>;
}

/** DEC-040: approved Home-only circular progress; Konsta 5.2.0 has no circular equivalent. */
function DayProgressRing({ value }: { value: number }) {
  const progress = Math.max(0, Math.min(100, Math.round(value)));
  return <div className="relative grid size-24 shrink-0 place-items-center" role="img" aria-label={`Прогресс дня: ${progress}%`}>
    <svg viewBox="0 0 96 96" className="size-24 -rotate-90" aria-hidden="true" focusable="false">
      <circle cx="48" cy="48" r="38" pathLength="100" fill="none" stroke="var(--color-surface-subtle)" strokeWidth="8" />
      <circle cx="48" cy="48" r="38" pathLength="100" fill="none" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 - progress} />
    </svg>
    <strong className="absolute text-xl">{progress}%</strong>
  </div>;
}

function HomeLoading() {
  return <div className="flow-screen flow-screen--wide" aria-busy="true" role="status" aria-live="polite">
    <Card component="section" outline header={<Badge>Сегодня</Badge>} contentWrapPadding="min-h-32 p-6 flex items-center justify-center gap-3"><Preloader /><p className="m-0">Собираем план на сегодня</p></Card>
    <Card component="section" outline contentWrapPadding="min-h-24 p-5 flex items-center justify-center gap-3"><Preloader /><p className="m-0 text-sm text-text-muted">Загружаем программу и привычки</p></Card>
  </div>;
}

function HomeEmpty() {
  return <div className="flow-screen flow-screen--wide"><Card component="section" outline header={<Badge>Свободный день</Badge>} contentWrapPadding="p-5 grid gap-4" aria-labelledby="empty-title">
    <BlockTitle component="h2" large className="!m-0 !p-0" id="empty-title">На сегодня ничего не запланировано</BlockTitle>
    <p className="m-0 text-sm text-text-muted">Выберите практику сейчас или откройте раздел, который хотите запланировать.</p>
    <Button component={NextLink} href="/catalog" large rounded className="gap-2"><Icon name="play" />Выбрать тренировку</Button>
    <Button component={NextLink} href="/programs" large rounded outline colors={secondaryColors}>Открыть программы</Button>
    <Button component={NextLink} href="/rhythm" large rounded clear colors={secondaryColors}>Открыть Мой ритм</Button>
  </Card></div>;
}
