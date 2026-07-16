"use client";

import { Badge, BlockTitle, Button, Card, List, ListItem, Preloader } from "konsta/react";
import Image from "next/image";
import NextLink from "next/link";
import { useCallback, useRef, useState } from "react";
import { Icon } from "@flowly/ui";
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

function Hero({ workout, onPlay }: { workout: WorkoutDetail; onPlay: (video: YoutubePlayerVideo) => void }) {
  const image = coverUrl(workout), format = FORMAT[workout.format as keyof typeof FORMAT] ?? workout.format;
  const metadata = [sourceLabel(workout.sourceType), format, minutes(workout.durationSeconds), DIFFICULTY[workout.difficulty as keyof typeof DIFFICULTY] ?? workout.difficulty].join(" · ");
  const description = /^Видео канала\s+/i.test(workout.description.trim()) ? "" : workout.description.trim();
  return <Card component="section" contentWrap={false} outline className="m-0">
    {image && <div className="relative aspect-video bg-accent-soft">
      <Image src={image} alt={`Практика «${workout.title}»`} fill sizes="(max-width: 430px) calc(100vw - 40px), 640px" priority unoptimized={workout.sourceType === "youtube"} className="object-cover" />
      {workout.youtubeVideoId && <Button clear className={`absolute inset-0 !h-auto !w-auto rounded-none p-0 ${focusRing}`} onClick={(event) => onPlay({ videoId: workout.youtubeVideoId!, title: workout.title, trigger: event.currentTarget })} aria-label={`Воспроизвести «${workout.title}»`}><Icon name="play" className="size-10 text-white drop-shadow-lg" /></Button>}
    </div>}
    <div className="grid min-w-0 gap-2 p-4 [&>*]:min-w-0">
      <h1 className="m-0 line-clamp-3 break-words text-xl font-semibold leading-tight" title={workout.title}>{workout.title}</h1>
      <p className="m-0 truncate text-sm text-text-muted">{metadata}</p>
      {description && <p className="m-0 line-clamp-3 text-sm leading-relaxed text-text-muted">{description}</p>}
    </div>
  </Card>;
}

function Exercises({ workout }: { workout: WorkoutDetail }) {
  return <section aria-labelledby="workout-exercises-title">
    <BlockTitle component="h2" id="workout-exercises-title" className="!mb-2">Упражнения</BlockTitle>
    <List strong inset dividers>
      {workout.exercises.length === 0 ? <ListItem title="Упражнения" subtitle="Будут добавлены позже" after={<Badge>Скоро</Badge>} aria-disabled="true" /> : workout.exercises.map((exercise) => <ListItem
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
  const future = (title: string, icon: string) => <ListItem key={title} media={<Icon name={icon} />} title={title} after={<Badge>Скоро</Badge>} aria-disabled="true" />;
  return <section aria-labelledby="workout-actions-title">
    <BlockTitle component="h2" id="workout-actions-title" className="!mb-2">Возможности</BlockTitle>
    <List strong inset dividers>
      {future("Начать тренировку", "play")}
      {future("Добавить в избранное", "bookmark")}
      {future("Поделиться", "share-2")}
      {workout.sourceType === "user" && <>
        {future("Пожаловаться", "triangle-alert")}
        {future("Скрыть", "eye-off")}
      </>}
    </List>
  </section>;
}

function Detail({ workout, forced, onPlay }: { workout: WorkoutDetail; forced: Forced; onPlay: (video: YoutubePlayerVideo) => void }) {
  const contraindications = workout.contraindications.length ? workout.contraindications : ["Нет специальных противопоказаний в каталоге. Ориентируйтесь на самочувствие."];
  return <>
    <Hero workout={workout} onPlay={onPlay} />
    {forced === "offline" && <Card component="aside" outline className="m-0" role="status" contentWrapPadding="p-3 flex items-start gap-2"><Icon name="wifi-off" /><p className="m-0 text-sm text-text-muted">Офлайн: показываем уже загруженное описание. Новые действия временно недоступны.</p></Card>}
    {workout.sourceType === "user" && <Card component="section" outline className="m-0" contentWrapPadding="p-3 flex items-start gap-2"><Icon name="triangle-alert" /><p className="m-0 text-sm">Тренировка создана пользователем и не проверена Flowly.</p></Card>}
    <Exercises workout={workout} />
    <ActionPanel workout={workout} />

    <Card component="details" outline className="m-0" aria-labelledby="workout-more-title">
      <summary id="workout-more-title" className={`flex min-h-12 cursor-pointer items-center px-4 py-3 font-semibold ${focusRing}`}>Сведения</summary>
      <div className="grid gap-3 px-4 pb-4">
        <h2 className="m-0 text-lg font-semibold">Противопоказания</h2>
        <ul className="m-0 grid gap-2 ps-5 text-sm leading-relaxed text-text-muted">{contraindications.map((item) => <li key={item}>{item}</li>)}</ul>
        <p className="m-0 text-sm text-text-muted">Это справочная информация из описания тренировки, не персональная рекомендация.</p>
        <p className="m-0 text-sm text-text-muted">Инвентарь: {workout.equipment.length ? workout.equipment.join(", ") : "не требуется"}</p>
        {workout.categories.length > 0 && <p className="m-0 text-sm text-text-muted">Категории: {workout.categories.map((category) => category.name).join(", ")}</p>}
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
