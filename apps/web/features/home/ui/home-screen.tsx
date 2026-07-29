"use client";

import { Badge, BlockTitle, Button, Card, List, ListItem, Preloader, Progressbar } from "konsta/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore, useState } from "react";
import { Icon } from "@flowly/ui";
import { GlassIconButton } from "@/components/glass-icon-button";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image";
import type { HomeScenario } from "../model/home-scenario";
import type { HomeViewModel } from "../model/home-view-model";
import { useHomeQuery } from "../model/home-queries";
import { homeBase } from "../fixtures/base";
import { latestSessionSeconds } from "@/features/workout-session/model/local-checkpoint";
import { formatSessionDuration } from "@/features/workout-session/model/workout-session";
import { useActiveSessionQuery } from "@/features/workout-session/model/workout-session-queries";

type Props = { scenario?: HomeScenario; /** Dev-only forced fixture */ fixture?: HomeViewModel };
const secondaryColors = { textIos: "text-accent dark:text-white", outlineBorderIos: "border-accent/40 dark:border-white/40", clearBgIos: "bg-transparent active:bg-accent/10 dark:active:bg-white/10" };
const cardTitle = (title: string, id?: string) => <h2 id={id} className="m-0 font-semibold">{title}</h2>;
const noSubscription = () => () => undefined;

export function HomeScreen({ scenario = "base", fixture }: Props) {
  const useFixture = Boolean(fixture) || (process.env.NODE_ENV !== "production" && scenario !== "base" && scenario !== "empty" && scenario !== "loading");
  const home = useHomeQuery(!useFixture && scenario !== "loading");
  const data = fixture ?? (useFixture ? homeBase : home.data?.home);

  if (scenario === "loading" || (!useFixture && home.isPending)) return <HomeLoading />;
  if (!useFixture && home.isError) {
    return (
      <div className="flow-screen flow-screen--wide">
        <HomeHeader />
        <Card component="section" outline contentWrapPadding="p-5 grid gap-3" role="alert">
          <strong>Не удалось загрузить план</strong>
          <p className="m-0 text-sm text-text-muted">Проверьте соединение и обновите экран.</p>
          <Button large rounded onClick={() => void home.refetch()}>Повторить</Button>
        </Card>
      </div>
    );
  }
  if (!data) return <HomeLoading />;
  if (scenario === "empty" || data.empty) return <HomeEmpty />;

  return <HomeBody data={data} scenario={scenario} />;
}

function HomeBody({ data, scenario }: { data: HomeViewModel; scenario: HomeScenario }) {
  const router = useRouter();
  const active = useActiveSessionQuery(scenario !== "loading" && scenario !== "empty");
  const activeSession = active.data?.session ?? null;
  const resumeSeconds = useSyncExternalStore(noSubscription, () => (activeSession ? latestSessionSeconds(activeSession) : 0), () => activeSession?.accumulatedSeconds ?? 0);
  const nextAction = data.plan.find((item) => item.status === "current") ?? data.plan.find((item) => item.status === "upcoming");
  const showResume = Boolean(activeSession) || (scenario === "resume" && data.resume.title);

  return (
    <div className="flow-screen flow-screen--wide">
      <HomeHeader />
      {scenario === "offline" && (
        <Card component="aside" outline role="status" header={<Badge>Офлайн</Badge>}>
          <p className="m-0 text-sm text-text-muted">Показываем сохранённые данные. Действия, требующие сети, временно недоступны.</p>
        </Card>
      )}

      {showResume && (
        <Card component="section" outline contentWrap={false} className="m-0">
          <div className="grid gap-3 p-4">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Badge>Можно продолжить</Badge>
              {activeSession && <span className="shrink-0 text-sm tabular-nums text-text-muted">{formatSessionDuration(resumeSeconds)}</span>}
            </div>
            <div className="grid min-w-0 grid-cols-[6rem_minmax(0,1fr)] items-center gap-3">
              {(() => {
                const src = activeSession
                  ? resumeCoverSrc(activeSession.workout.youtubeVideoId, activeSession.workout.coverObjectKey, data.resume.image)
                  : data.resume.image;
                return (
                  <ResumeCover
                    key={src}
                    src={src}
                    alt={activeSession ? `Практика «${activeSession.workout.title}»` : data.resume.title || "Практика"}
                    unoptimized={Boolean(activeSession?.workout.youtubeVideoId)}
                  />
                );
              })()}
              <div className="min-w-0">
                <h2 className="m-0 line-clamp-2 text-base font-semibold leading-snug" title={activeSession?.workout.title ?? data.resume.title}>
                  {activeSession?.workout.title ?? data.resume.title}
                </h2>
                <p className="m-0 mt-1 text-sm text-text-muted">{activeSession ? "Открытая сессия" : data.resume.meta}</p>
              </div>
            </div>
            <Button component={NextLink} href={activeSession ? `/sessions/${activeSession.id}` : "/catalog"} large rounded>
              Продолжить
            </Button>
          </div>
        </Card>
      )}

      <Card component="section" outline className="m-0" header={cardTitle("Прогресс на сегодня", "day-progress-title")} contentWrap={false} aria-labelledby="day-progress-title">
        <div className="grid gap-3 px-4 pb-4">
          <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-4">
            <DayProgressRing value={data.progress.percent} />
            <div className="grid gap-1">
              <strong className="text-lg">
                {data.progress.total === 0 ? "Пока пусто" : data.progress.percent >= 100 ? "День закрыт" : data.progress.percent >= 50 ? "Хороший темп" : "В процессе"}
              </strong>
              <p className="m-0 text-sm leading-5 text-text-muted">
                {data.progress.total === 0
                  ? "Нет запланированных действий на сегодня"
                  : `${data.progress.completed} из ${data.progress.total} выполнено · ${data.progress.remaining} осталось`}
              </p>
              {data.progress.total > 0 && (
                <p className="m-0 text-xs leading-5 text-text-muted">
                  {data.progress.partial} частично · {data.progress.noResponse ? `${data.progress.noResponse} без ответа` : "без ответа нет"}
                </p>
              )}
            </div>
          </div>
        </div>
        {nextAction && (
          <List dividers className="m-0">
            <ListItem
              link
              linkComponent="button"
              contentClassName="w-full text-left"
              linkProps={{ type: "button", onClick: () => router.push(nextAction.href as never) }}
              header="Ближайшее действие"
              title={nextAction.title}
              subtitle={nextAction.meta}
              after={<Badge>{nextAction.status === "current" ? "Сейчас" : "Далее"}</Badge>}
            />
          </List>
        )}
      </Card>

      {data.program ? (
        <NextLink href={data.program.href as never} aria-label={`Открыть программу ${data.program.title}`} className="block text-inherit no-underline">
          <Card outline className="m-0" header={cardTitle("Текущая программа")} contentWrap={false}>
            <div className="relative">
              <Image
                src={data.program.image}
                alt={`Практика программы «${data.program.title}»`}
                width={640}
                height={360}
                preload
                decoding="sync"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                className="aspect-video w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                <h3 className="m-0 text-xl font-semibold text-white">{data.program.title}</h3>
              </div>
            </div>
            <div className="grid gap-3 p-4">
              <p className="m-0 text-sm text-text-muted">{data.program.meta}</p>
              <Progressbar progress={data.program.percent / 100} aria-label={`Прогресс программы: ${data.program.percent}%`} />
            </div>
          </Card>
        </NextLink>
      ) : (
        <Card component="section" outline className="m-0" header={cardTitle("Программа")} contentWrapPadding="p-4 grid gap-3">
          <p className="m-0 text-sm text-text-muted">Нет активного прохождения. Выберите программу, чтобы вести дни по плану.</p>
          <Button component={NextLink} href="/programs" large rounded outline colors={secondaryColors}>
            Открыть программы
          </Button>
        </Card>
      )}

      <Card
        component="section"
        outline
        className="m-0"
        header={cardTitle(data.habits.length ? `Сегодняшние привычки · ${data.habits.filter((item) => item.done).length} из ${data.habits.length}` : "Привычки")}
        contentWrap={false}
        aria-label="Привычки на сегодня"
      >
        {data.habits.length ? (
          <List dividers className="m-0">
            {data.habits.map((item) => (
              <ListItem
                key={item.id}
                link
                linkComponent="button"
                contentClassName="w-full text-left"
                linkProps={{ type: "button", onClick: () => router.push(`/rhythm/${item.id}` as never) }}
                media={<Icon name={item.icon} />}
                title={item.title}
                subtitle={item.meta}
                after={
                  <>
                    <span className="sr-only">{item.done ? "Готово" : "Осталось"}</span>
                    <Icon name={item.done ? "circle-check" : "circle"} className={item.done ? "text-accent" : "text-text-muted"} />
                  </>
                }
              />
            ))}
          </List>
        ) : (
          <div className="grid gap-3 p-4">
            <p className="m-0 text-sm text-text-muted">Пока нет активных привычек.</p>
            <Button component={NextLink} href="/rhythm/new" large rounded outline colors={secondaryColors}>
              Создать привычку
            </Button>
          </div>
        )}
      </Card>

      <Button component={NextLink} href="/catalog" large rounded className="gap-2">
        <Icon name="play" />
        Начать тренировку
      </Button>
    </div>
  );
}

const resumeCoverSrc = (youtubeVideoId: string | null | undefined, coverObjectKey: string | null | undefined, fallback: string) => {
  const yt = youtubeVideoId?.trim();
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  if (coverObjectKey) return `/media/${coverObjectKey}`;
  return fallback;
};

function ResumeCover({ src, alt, unoptimized }: { src: string; alt: string; unoptimized: boolean }) {
  const [errored, setErrored] = useState(false);
  if (errored)
    return (
      <div className="grid aspect-video w-24 place-items-center rounded-xl bg-accent-soft" aria-hidden="true">
        <Icon name="dumbbell" className="size-5 text-text-muted" />
      </div>
    );
  return (
    <Image
      src={src}
      alt={alt}
      width={96}
      height={54}
      loading="eager"
      decoding="sync"
      placeholder="blur"
      blurDataURL={IMAGE_BLUR_DATA_URL}
      unoptimized={unoptimized}
      className="aspect-video w-24 rounded-xl object-cover"
      onError={() => setErrored(true)}
    />
  );
}

function HomeHeader() {
  return (
    <header className="flex items-center justify-between gap-4">
      <BlockTitle component="h1" large className="!m-0 !p-0">
        Твой план
      </BlockTitle>
      <GlassIconButton component={NextLink} href="/profile" icon="user-round" aria-label="Открыть профиль" />
    </header>
  );
}

function DayProgressRing({ value }: { value: number }) {
  const progress = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="relative grid size-24 shrink-0 place-items-center" role="img" aria-label={`Прогресс дня: ${progress}%`}>
      <svg viewBox="0 0 96 96" className="size-24 -rotate-90" aria-hidden="true" focusable="false">
        <circle cx="48" cy="48" r="38" pathLength="100" fill="none" stroke="var(--color-surface-subtle)" strokeWidth="8" />
        <circle cx="48" cy="48" r="38" pathLength="100" fill="none" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 - progress} />
      </svg>
      <strong className="absolute text-xl">{progress}%</strong>
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="flow-screen flow-screen--wide" aria-busy="true">
      <HomeHeader />
      <div role="status" aria-live="polite" className="grid gap-3">
        <Card component="section" outline header={<Badge>Сегодня</Badge>} contentWrapPadding="min-h-32 p-6 flex items-center justify-center gap-3">
          <Preloader />
          <p className="m-0">Собираем план на сегодня</p>
        </Card>
        <Card component="section" outline contentWrapPadding="min-h-24 p-5 flex items-center justify-center gap-3">
          <Preloader />
          <p className="m-0 text-sm text-text-muted">Загружаем программу и привычки</p>
        </Card>
      </div>
    </div>
  );
}

function HomeEmpty() {
  return (
    <div className="flow-screen flow-screen--wide">
      <HomeHeader />
      <Card component="section" outline header={<Badge>Свободный день</Badge>} contentWrapPadding="p-5 grid gap-4" aria-labelledby="empty-title">
        <BlockTitle component="h2" large className="!m-0 !p-0" id="empty-title">
          На сегодня ничего не запланировано
        </BlockTitle>
        <p className="m-0 text-sm text-text-muted">Выберите практику сейчас или откройте раздел, который хотите запланировать.</p>
        <Button component={NextLink} href="/catalog" large rounded className="gap-2">
          <Icon name="play" />
          Выбрать тренировку
        </Button>
        <Button component={NextLink} href="/programs" large rounded outline colors={secondaryColors}>
          Открыть программы
        </Button>
        <Button component={NextLink} href="/rhythm" large rounded clear colors={secondaryColors}>
          Открыть Мой ритм
        </Button>
      </Card>
    </div>
  );
}
