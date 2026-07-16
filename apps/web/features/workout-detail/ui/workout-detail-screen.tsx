"use client";

import { Badge, BlockFooter, BlockTitle, Button, Card, Chip, List, ListItem, Preloader } from "konsta/react";
import Image from "next/image";
import NextLink from "next/link";
import { useCallback, useRef, useState } from "react";
import { Icon } from "@flowly/ui";
import { DisabledFavoriteButton } from "@/components/workouts/disabled-favorite-button";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { YoutubePlayerPopup, type YoutubePlayerVideo } from "@/components/youtube/youtube-player-popup";
import type { WorkoutDetail } from "@/features/catalog/model/catalog";
import { DIFFICULTY, FORMAT, SOURCE, minutes } from "@/features/catalog/model/catalog";
import { useWorkoutDetailQuery } from "@/features/catalog/model/catalog-queries";

type Forced = "loading" | "error" | "offline" | "hidden" | null;
type Props = { id: string; forced?: Forced };

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
const coverUrl = (workout: WorkoutDetail) => workout.sourceType === "youtube" && workout.youtubeVideoId ? `https://i.ytimg.com/vi/${workout.youtubeVideoId}/hqdefault.jpg` : workout.coverObjectKey ? `/media/${workout.coverObjectKey}` : "";
const sourceLabel = (source: string) => SOURCE[source as keyof typeof SOURCE] ?? source;

function QuickActions({ title }: { title: string }) {
  return <div className="flex flex-wrap items-center justify-end gap-2" aria-label="Быстрые действия">
    <Badge>Скоро</Badge>
    <DisabledFavoriteButton title={title} className="h-11 w-11 min-w-11 p-0" />
    <Button inline clear rounded className="h-11 w-11 min-w-11 p-0" disabled aria-label="Поделиться — скоро" title="Поделиться — скоро"><Icon name="share-2" /></Button>
  </div>;
}

function Hero({ workout, onPlay }: { workout: WorkoutDetail; onPlay: (video: YoutubePlayerVideo) => void }) {
  const image = coverUrl(workout);
  return <Card component="section" contentWrap={false} outline className="m-0">
    {image && <div className="relative aspect-video bg-accent-soft">
      <Image src={image} alt={`Практика «${workout.title}»`} fill sizes="(max-width: 430px) calc(100vw - 40px), 640px" priority unoptimized={workout.sourceType === "youtube"} className="object-cover" />
      {workout.youtubeVideoId && <Button clear className={`absolute inset-0 !h-auto !w-auto rounded-none p-0 ${focusRing}`} onClick={(event) => onPlay({ videoId: workout.youtubeVideoId!, title: workout.title, trigger: event.currentTarget })} aria-label={`Воспроизвести «${workout.title}»`}><Icon name="play" className="size-10 text-white drop-shadow-lg" /></Button>}
    </div>}
    <div className="grid min-w-0 gap-3 p-4 [&>*]:min-w-0">
      <div className="flex flex-wrap gap-2"><Badge>{sourceLabel(workout.sourceType)}</Badge><Badge>{minutes(workout.durationSeconds)}</Badge><Badge>{DIFFICULTY[workout.difficulty as keyof typeof DIFFICULTY] ?? workout.difficulty}</Badge></div>
      <p className="m-0 text-sm leading-relaxed text-text-muted">{workout.description}</p>
      <QuickActions title={workout.title} />
    </div>
  </Card>;
}

function Exercises({ workout }: { workout: WorkoutDetail }) {
  return <section aria-labelledby="workout-exercises-title">
    <BlockTitle component="h2" id="workout-exercises-title" className="!mb-2">Упражнения</BlockTitle>
    <List strong inset dividers>
      {workout.exercises.length === 0 ? <ListItem title="Список упражнений недоступен" subtitle="Описание практики можно изучить выше." /> : workout.exercises.map((exercise) => <ListItem
        key={`${exercise.position}-${exercise.id}`}
        media={<Badge>{exercise.position}</Badge>}
        title={<span className="block min-w-0 [overflow-wrap:anywhere]">{exercise.title}</span>}
        subtitle={<span className="[overflow-wrap:anywhere]">{exercise.description}</span>}
        after={exercise.plannedDurationSeconds ? minutes(exercise.plannedDurationSeconds) : exercise.repetitions ? `${exercise.repetitions} повторов` : undefined}
        strongTitle="auto"
        contentClassName="min-w-0"
        innerClassName="min-w-0"
        titleWrapClassName="min-w-0 flex-wrap gap-1"
      />)}
    </List>
  </section>;
}

function ActionPanel({ workout }: { workout: WorkoutDetail }) {
  const ugc = workout.sourceType === "user";
  return <section aria-labelledby="workout-actions-title">
    <BlockTitle component="h2" id="workout-actions-title" className="!mb-2">Действия</BlockTitle>
    <Card outline className="m-0" contentWrapPadding="p-4 grid gap-3">
      <Button large rounded disabled className="gap-2"><Icon name="play" />Начать тренировку<Badge>Скоро</Badge></Button>
      <BlockFooter className="!m-0 !p-0">Запуск тренировки пока недоступен.</BlockFooter>
      {ugc && <List nested dividers>
        <ListItem title="Автор" subtitle="Профиль автора" after={<Badge>Скоро</Badge>} aria-disabled="true" />
        <ListItem title="Пожаловаться" subtitle="Сообщить о нарушении" after={<Badge>Скоро</Badge>} aria-disabled="true" />
        <ListItem title="Скрыть" subtitle="Не показывать эту тренировку" after={<Badge>Скоро</Badge>} aria-disabled="true" />
      </List>}
    </Card>
  </section>;
}

function Detail({ workout, forced, onPlay }: { workout: WorkoutDetail; forced: Forced; onPlay: (video: YoutubePlayerVideo) => void }) {
  const contraindications = workout.contraindications.length ? workout.contraindications : ["Нет специальных противопоказаний в каталоге. Ориентируйтесь на самочувствие."];
  return <>
    <BlockTitle component="h1" large className="!m-0 [overflow-wrap:anywhere]">{workout.title}</BlockTitle>
    {forced === "offline" && <Card component="aside" outline className="m-0" role="status" contentWrapPadding="p-3 flex items-start gap-2"><Icon name="wifi-off" /><p className="m-0 text-sm text-text-muted">Офлайн: показываем уже загруженное описание. Новые действия временно недоступны.</p></Card>}
    <Hero workout={workout} onPlay={onPlay} />

    {workout.sourceType === "user" && <Card component="section" outline className="m-0" contentWrapPadding="p-3 flex items-start gap-2"><Icon name="triangle-alert" /><p className="m-0 text-sm">Тренировка создана пользователем и не проверена Flowly.</p></Card>}

    <section aria-label="Кратко о тренировке" className="flex flex-wrap gap-2">
      <Chip>{FORMAT[workout.format as keyof typeof FORMAT] ?? workout.format}</Chip>
      <Chip>{workout.equipment.length ? workout.equipment.join(", ") : "Без инвентаря"}</Chip>
      {workout.categories.map((category) => <Chip key={category.id}>{category.name}</Chip>)}
    </section>


    <Exercises workout={workout} />
    <ActionPanel workout={workout} />

    <Card component="details" outline className="m-0" aria-labelledby="workout-more-title">
      <summary id="workout-more-title" className={`flex min-h-12 cursor-pointer items-center px-4 py-3 font-semibold ${focusRing}`}>Дополнительно</summary>
      <div className="grid gap-3 px-4 pb-4">
        <h2 className="m-0 text-lg font-semibold">Противопоказания</h2>
        <ul className="m-0 grid gap-2 ps-5 text-sm leading-relaxed text-text-muted">{contraindications.map((item) => <li key={item}>{item}</li>)}</ul>
        <p className="m-0 text-sm text-text-muted">Это справочная информация из описания тренировки, не персональная рекомендация.</p>
        <p className="m-0 text-sm text-text-muted">Источник: {sourceLabel(workout.sourceType)} · Автор: {workout.author.name}</p>
        <Button component={NextLink} href={`/authors/${encodeURIComponent(workout.sourceType)}` as never} outline rounded className={focusRing}>Открыть публичный профиль</Button>
      </div>
    </Card>
  </>;
}

function Loading() {
  return <><h1 className="sr-only">Тренировка</h1><div className="grid min-h-64 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем тренировку</span></div></>;
}

function Message({ hidden, onRetry }: { hidden?: boolean; onRetry?: () => void }) {
  return <><h1 className="sr-only">Тренировка</h1><Card component="section" outline className="m-0 text-center" role={hidden ? "status" : "alert"} contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name={hidden ? "eye-off" : "triangle-alert"} /><h2 className="m-0 text-lg font-semibold">{hidden ? "Тренировка недоступна" : "Не удалось загрузить тренировку"}</h2><p className="m-0 text-sm text-text-muted">{hidden ? "Доступ к этой тренировке изменился. Выберите другую практику в каталоге." : "Повторите запрос. Если тренировка удалена или скрыта, появится безопасное сообщение."}</p>{onRetry && <Button large rounded className={focusRing} onClick={onRetry}>Повторить</Button>}<Button component={NextLink} href="/catalog" clear rounded className={focusRing}>Открыть каталог</Button></Card></>;
}

export function WorkoutDetailScreen({ id, forced = null }: Props) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [playerVideo, setPlayerVideo] = useState<YoutubePlayerVideo | null>(null);
  const closePlayer = useCallback(() => setPlayerVideo(null), []);
  const detail = useWorkoutDetailQuery(id, !forced || forced === "offline");
  const workout = detail.data?.workout ?? null;
  let content: React.ReactNode;
  if (forced === "loading") content = <Loading />;
  else if (forced === "hidden") content = <Message hidden />;
  else if (forced === "error" || detail.isError) content = <Message onRetry={() => detail.refetch()} />;
  else if (!workout) content = <Loading />;
  else content = <Detail workout={workout} forced={forced} onPlay={setPlayerVideo} />;
  return <div className="min-h-dvh">
    <div ref={backgroundRef}><PrimaryNavbar title="Тренировка" /><main className="flow-screen">{content}</main></div>
    <YoutubePlayerPopup video={playerVideo} backgroundRef={backgroundRef} onClose={closePlayer} />
  </div>;
}
