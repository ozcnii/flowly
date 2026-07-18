"use client";

import { Badge, BlockTitle, Button, Card, List, ListItem, Navbar, Preloader, Sheet } from "konsta/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { Icon } from "@flowly/ui";
import { ModalPortal } from "@/components/modal-portal";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { useModalFocus } from "@/components/use-modal-focus";
import { YoutubePlayButton } from "@/components/youtube/youtube-play-button";
import { YoutubePlayerPopup, type YoutubePlayerVideo } from "@/components/youtube/youtube-player-popup";
import type { WorkoutDetail } from "@/features/catalog/model/catalog";
import { DIFFICULTY, FORMAT, SOURCE, minutes } from "@/features/catalog/model/catalog";
import { useWorkoutDetailQuery } from "@/features/catalog/model/catalog-queries";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image";
import { ApiError } from "@/lib/api/client";
import { latestPlaybackPosition, latestSessionSeconds } from "@/features/workout-session/model/local-checkpoint";
import { formatSessionDuration, type ActiveSessionConflict } from "@/features/workout-session/model/workout-session";
import { useActiveSessionQuery, useFinishWorkoutSessionMutation, useStartWorkoutSessionMutation } from "@/features/workout-session/model/workout-session-queries";

type Forced = "loading" | "error" | "offline" | "hidden" | null;
type Props = { id: string; forced?: Forced };

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
const coverUrl = (workout: WorkoutDetail) => workout.sourceType === "youtube" && workout.youtubeVideoId ? `https://i.ytimg.com/vi/${workout.youtubeVideoId}/hqdefault.jpg` : workout.coverObjectKey ? `/media/${workout.coverObjectKey}` : "";
const sourceLabel = (source: string) => SOURCE[source as keyof typeof SOURCE] ?? source;
const noSubscription = () => () => undefined;

function Hero({ workout, onPlay }: { workout: WorkoutDetail; onPlay: (video: YoutubePlayerVideo) => void }) {
  const image = coverUrl(workout), format = FORMAT[workout.format as keyof typeof FORMAT] ?? workout.format;
  const metadata = [sourceLabel(workout.sourceType), format, minutes(workout.durationSeconds), DIFFICULTY[workout.difficulty as keyof typeof DIFFICULTY] ?? workout.difficulty].join(" · ");
  const description = /^Видео канала\s+/i.test(workout.description.trim()) ? "" : workout.description.trim();
  return <Card component="section" contentWrap={false} outline className="m-0">
    {image && <div className="relative aspect-video bg-accent-soft">
      <Image src={image} alt={`Практика «${workout.title}»`} fill sizes="(max-width: 430px) calc(100vw - 40px), 640px" preload decoding="sync" placeholder="blur" blurDataURL={IMAGE_BLUR_DATA_URL} unoptimized={workout.sourceType === "youtube"} className="object-cover" />
      {workout.youtubeVideoId && <YoutubePlayButton title={workout.title} onClick={(event) => onPlay({ videoId: workout.youtubeVideoId!, title: workout.title, trigger: event.currentTarget })} />}
    </div>}
    <div className="grid min-w-0 gap-2 p-4 [&>*]:min-w-0">
      <h1 className="m-0 line-clamp-3 break-words text-xl font-semibold leading-tight" title={workout.title}>{workout.title}</h1>
      <p className="m-0 truncate text-sm text-text-muted">{metadata}</p>
      {description && <p className="m-0 line-clamp-3 text-sm leading-relaxed text-text-muted">{description}</p>}
    </div>
  </Card>;
}

function Exercises({ workout }: { workout: WorkoutDetail }) {
  return <section aria-labelledby="workout-exercises-title" className="grid gap-2">
    <BlockTitle component="h2" id="workout-exercises-title" className="!m-0">Упражнения</BlockTitle>
    <List strong inset dividers className="!m-0">
      {workout.exercises.length === 0 ? <ListItem title="Будут добавлены позже" after={<Badge>Скоро</Badge>} aria-disabled="true" /> : workout.exercises.map((exercise) => <ListItem
        key={`${exercise.position}-${exercise.id}`}
        media={<Badge>{exercise.position}</Badge>}
        title={<span className="block min-w-0 [overflow-wrap:anywhere]">{exercise.title}</span>}
        subtitle={exercise.plannedDurationSeconds ? minutes(exercise.plannedDurationSeconds) : exercise.repetitions ? `${exercise.repetitions} повторов` : undefined}
        text={exercise.description ? <span className="[overflow-wrap:anywhere]">{exercise.description}</span> : undefined}
        strongTitle="auto"
        contentClassName="min-w-0"
        innerClassName="min-w-0"
        titleWrapClassName="min-w-0"
      />)}
    </List>
  </section>;
}

function ActionPanel({ workout, backgroundRef }: { workout: WorkoutDetail; backgroundRef: RefObject<HTMLElement | null> }) {
  const router = useRouter(), activeQuery = useActiveSessionQuery(), active = activeQuery.data?.session ?? null, sameActive = active?.workoutId === workout.id, activeSeconds = useSyncExternalStore(noSubscription, () => active ? latestSessionSeconds(active) : 0, () => active?.accumulatedSeconds ?? 0), start = useStartWorkoutSessionMutation(), conflictSheetRef = useRef<HTMLElement>(null), [conflict, setConflict] = useState<ActiveSessionConflict | null>(null), [closed, setClosed] = useState(false), close = useFinishWorkoutSessionMutation(conflict?.activeSession.id ?? "");
  const dismiss = () => { if (start.isPending || close.isPending) return; setConflict(null); setClosed(false); };
  useModalFocus(Boolean(conflict), conflictSheetRef, backgroundRef, dismiss);
  const future = (title: string, icon: string) => <ListItem key={title} media={<Icon name={icon} />} title={title} after={<Badge>Скоро</Badge>} aria-disabled="true" />;
  const continueCurrent = () => { const session = sameActive ? active : conflict?.activeSession; if (session) { setConflict(null); router.push(`/sessions/${session.id}` as never); } };
  const startSession = async () => {
    if (sameActive) { continueCurrent(); return; }
    try { const data = await start.mutateAsync(workout.id); setConflict(null); setClosed(false); router.push(`/sessions/${data.session.id}` as never); }
    catch (error) { if (error instanceof ApiError && error.status === 409 && typeof error.body === "object" && error.body !== null && "error" in error.body && error.body.error === "active_session") setConflict(error.body as ActiveSessionConflict); }
  };
  const closeCurrent = async () => {
    if (!conflict) return;
    try { await close.mutateAsync({ accumulatedSeconds: latestSessionSeconds(conflict.activeSession), playbackPositionSeconds: latestPlaybackPosition(conflict.activeSession), finalStatus: "not_completed", baseUpdatedAt: conflict.activeSession.updatedAt }); setClosed(true); }
    catch (error) { if (error instanceof ApiError && error.status === 409 && typeof error.body === "object" && error.body !== null && "session" in error.body) setConflict({ ...conflict, activeSession: (error.body as { session: ActiveSessionConflict["activeSession"] }).session }); }
  };
  return <section aria-labelledby="workout-actions-title" className="grid gap-2">
    <BlockTitle component="h2" id="workout-actions-title" className="!m-0">Возможности</BlockTitle>
    <List strong inset dividers className="!m-0">
      {sameActive ? <ListItem link linkComponent="button" contentClassName="w-full" innerClassName="text-left" linkProps={{ type: "button", onClick: continueCurrent }} media={<Icon name="play" />} title="Продолжить тренировку" subtitle={`Прошло ${formatSessionDuration(activeSeconds)}`} after={<Badge>Идёт сейчас</Badge>} /> : workout.actions.start.enabled ? <ListItem link linkComponent="button" contentClassName="w-full" innerClassName="text-left" linkProps={{ type: "button", onClick: () => void startSession(), disabled: start.isPending || activeQuery.isPending }} media={start.isPending ? <Preloader /> : <Icon name="play" />} title="Начать тренировку" subtitle={workout.actions.start.reason} /> : <ListItem media={<Icon name="play" />} title="Начать тренировку" subtitle={workout.actions.start.reason} aria-disabled="true" />}
      {future("Добавить в избранное", "bookmark")}
      {future("Поделиться", "share-2")}
      {workout.sourceType === "user" && <>{future("Пожаловаться", "triangle-alert")}{future("Скрыть", "eye-off")}</>}
    </List>
    {start.isError && !conflict && <Card component="aside" outline className="m-0" role="alert" contentWrapPadding="p-3 text-sm">Не удалось начать тренировку. Попробуйте ещё раз.</Card>}
    <ModalPortal>{conflict && <Sheet ref={conflictSheetRef} opened backdrop onBackdropClick={dismiss} className="flex max-h-[80dvh] flex-col" role="dialog" aria-modal="true" aria-labelledby="active-session-title">
      <Navbar title={<span id="active-session-title">{closed ? "Начать тренировку?" : "Уже идёт тренировка"}</span>} />
      {!closed ? <div className="grid gap-3 p-4">
        <p className="m-0 text-sm leading-relaxed text-text-muted">Сейчас выполняется «{conflict.activeSession.workout.title}» · {formatSessionDuration(latestSessionSeconds(conflict.activeSession))}.</p>
        <Button large rounded onClick={continueCurrent}>Продолжить текущую</Button>
        <Button large rounded tonal disabled={close.isPending} onClick={() => void closeCurrent()}>{close.isPending ? "Закрываем…" : "Закрыть текущую"}</Button>
        <Button clear rounded onClick={dismiss}>Отмена</Button>
      </div> : <div className="grid gap-3 p-4">
        <p className="m-0 text-sm leading-relaxed text-text-muted">Предыдущая тренировка закрыта как «Не завершено». Запустить «{workout.title}»?</p>
        <Button large rounded disabled={start.isPending} onClick={() => void startSession()}>{start.isPending ? "Запускаем…" : "Начать тренировку"}</Button>
        <Button clear rounded onClick={dismiss}>Не сейчас</Button>
      </div>}
    </Sheet>}</ModalPortal>
  </section>;
}

function Detail({ workout, forced, onPlay, backgroundRef }: { workout: WorkoutDetail; forced: Forced; onPlay: (video: YoutubePlayerVideo) => void; backgroundRef: RefObject<HTMLElement | null> }) {
  const contraindications = workout.contraindications.length ? workout.contraindications : ["Нет специальных противопоказаний в каталоге. Ориентируйтесь на самочувствие."], generatedYoutube = workout.sourceType === "youtube" && workout.exercises.length === 0;
  return <>
    <Hero workout={workout} onPlay={onPlay} />
    {forced === "offline" && <Card component="aside" outline className="m-0" role="status" contentWrapPadding="p-3 flex items-start gap-2"><Icon name="wifi-off" /><p className="m-0 text-sm text-text-muted">Офлайн: показываем уже загруженное описание. Новые действия временно недоступны.</p></Card>}
    {workout.sourceType === "user" && <Card component="section" outline className="m-0" contentWrapPadding="p-3 flex items-start gap-2"><Icon name="triangle-alert" /><p className="m-0 text-sm">Тренировка создана пользователем и не проверена Flowly.</p></Card>}
    {/* Primary Start/Continue above exercises — no scroll past the whole list to begin. */}
    <ActionPanel workout={workout} backgroundRef={backgroundRef} />
    {!generatedYoutube && <Exercises workout={workout} />}

    {!generatedYoutube && <Card component="details" contentWrap={false} outline className="group m-0" aria-labelledby="workout-more-title">
      <summary id="workout-more-title" className={`flex min-h-16 cursor-pointer items-center gap-3 px-4 py-3 ${focusRing}`}>
        <Icon name="info" />
        <span className="min-w-0 flex-1"><span className="block font-semibold">Сведения</span><span className="block truncate text-sm text-text-muted">Противопоказания, источник и автор</span></span>
        <Icon name="chevron-down" className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="grid gap-3 px-4 pb-4">
        <h2 className="m-0 text-lg font-semibold">Противопоказания</h2>
        <ul className="m-0 grid gap-2 ps-5 text-sm leading-relaxed text-text-muted">{contraindications.map((item) => <li key={item}>{item}</li>)}</ul>
        <p className="m-0 text-sm text-text-muted">Это справочная информация из описания тренировки, не персональная рекомендация.</p>
        <p className="m-0 text-sm text-text-muted">Инвентарь: {workout.equipment.length ? workout.equipment.join(", ") : "не требуется"}</p>
        {workout.categories.length > 0 && <p className="m-0 text-sm text-text-muted">Категории: {workout.categories.map((category) => category.name).join(", ")}</p>}
        <p className="m-0 text-sm text-text-muted">Источник: {sourceLabel(workout.sourceType)} · Автор: {workout.author.name}</p>
        <Button component={NextLink} href="/sources" outline rounded className={focusRing}>Открыть источники</Button>
      </div>
    </Card>}
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
  else content = <Detail workout={workout} forced={forced} onPlay={setPlayerVideo} backgroundRef={backgroundRef} />;
  return <div className="min-h-dvh">
    <div ref={backgroundRef}><PrimaryNavbar title="Тренировка" /><main className="flow-screen">{content}</main></div>
    <YoutubePlayerPopup video={playerVideo} backgroundRef={backgroundRef} onClose={closePlayer} />
  </div>;
}
