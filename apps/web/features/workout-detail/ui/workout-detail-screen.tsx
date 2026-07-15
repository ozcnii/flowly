"use client";

import { Badge, Button, Card, Chip, Link } from "konsta/react";
import NextLink from "next/link";

import { Icon, InlineError, OfflineBanner, Skeleton } from "@flowly/ui";
import { DisabledFavoriteButton } from "@/components/workouts/disabled-favorite-button";
import type { WorkoutDetail } from "@/features/catalog/model/catalog";
import { DIFFICULTY, FORMAT, SOURCE, minutes } from "@/features/catalog/model/catalog";
import { useWorkoutDetailQuery } from "@/features/catalog/model/catalog-queries";
import styles from "./workout-detail-screen.module.css";

type Forced = "loading" | "error" | "offline" | "hidden" | null;

type Props = { id: string; forced?: Forced };

const coverUrl = (workout: WorkoutDetail) => workout.sourceType === "youtube" && workout.youtubeVideoId ? `https://i.ytimg.com/vi/${workout.youtubeVideoId}/hqdefault.jpg` : workout.coverObjectKey ? `/media/${workout.coverObjectKey}` : "";
const sourceLabel = (source: string) => SOURCE[source as keyof typeof SOURCE] ?? source;
const reasonTitle: Record<keyof WorkoutDetail["actions"], string> = { start: "Начать тренировку", favorite: "В избранное", share: "Поделиться", report: "Пожаловаться", hide: "Скрыть", author: "Автор" };
const userSafeReason: Record<keyof WorkoutDetail["actions"], string> = {
  start: "Сейчас можно просмотреть описание и план тренировки.",
  favorite: "Сохранение будет доступно позже.",
  share: "Поделиться можно будет позже.",
  report: "Жалобы доступны только для пользовательских тренировок.",
  hide: "Скрытие доступно только для пользовательских тренировок.",
  author: "Профиль автора появится для пользовательских тренировок.",
};

function QuickActions({ title }: { title: string }) {
  return <div className={styles.quickActions} aria-label="Быстрые действия">
    <DisabledFavoriteButton title={title} className={styles.quickButton} />
    <Button inline clear rounded className={styles.quickButton} disabled aria-label="Поделиться — будет доступно позже" title="Поделиться — будет доступно позже"><Icon name="share-2" /></Button>
  </div>;
}

function Hero({ workout }: { workout: WorkoutDetail }) {
  const image = coverUrl(workout);
  return <section className={styles.hero}>
    {image && <div className={styles.cover} data-source={workout.sourceType} style={{ backgroundImage: `${workout.sourceType === "youtube" ? "linear-gradient(135deg, rgba(28, 45, 39, 0.08), rgba(28, 45, 39, 0.58)), " : ""}url(${image})` }}><QuickActions title={workout.title} />{workout.sourceType === "youtube" && <Icon name="play" />}</div>}
    <div className={styles.heroBody}>
      <div className={styles.heroTop}>
        <div className={styles.badges}>
          <Badge colors={{ bg: "bg-primary", text: "text-white" }}>{sourceLabel(workout.sourceType)}</Badge>
          <Badge>{minutes(workout.durationSeconds)}</Badge>
          <Badge>{DIFFICULTY[workout.difficulty as keyof typeof DIFFICULTY] ?? workout.difficulty}</Badge>
        </div>
        {!image && <QuickActions title={workout.title} />}
      </div>
      <h1 className="flow-title">{workout.title}</h1>
      <p className="flow-subtitle">{workout.description}</p>
    </div>
  </section>;
}

function DisabledAction({ name, compact = false }: { name: keyof WorkoutDetail["actions"]; compact?: boolean }) {
  return <Button large rounded tonal className={`${styles.action} ${compact ? styles.actionCompact : ""}`} disabled aria-describedby={`reason-${name}`}><span>{reasonTitle[name]}</span><small id={`reason-${name}`}>{userSafeReason[name]}</small></Button>;
}

function ActionPanel({ workout }: { workout: WorkoutDetail }) {
  const ugc = workout.sourceType === "user";
  return <section className={styles.actions} aria-label="Действия тренировки">
    <DisabledAction name="start" />
    <p>Пока здесь можно спокойно изучить практику перед запуском.</p>
    <div className={styles.secondaryActions}>
      {ugc && <DisabledAction name="author" compact />}
      {ugc && <DisabledAction name="report" compact />}
      {ugc && <DisabledAction name="hide" compact />}
    </div>
  </section>;
}

function ExerciseList({ workout }: { workout: WorkoutDetail }) {
  return <section className={styles.section}>
    <h2>Упражнения</h2>
    {workout.exercises.length === 0 ? <p className={styles.muted}>Список упражнений пока недоступен для этой тренировки.</p> : <>
      <p className={styles.muted}>План показан текстом. Изображения и GIF для отдельных упражнений будут подключены позже.</p>
      <ol className={styles.exercises}>
        {workout.exercises.map((exercise) => <li key={`${exercise.position}-${exercise.id}`}>
          <span className={styles.exerciseNumber}>{exercise.position}</span>
          <div>
            <div className={styles.exerciseTop}><strong>{exercise.title}</strong>{exercise.plannedDurationSeconds ? <span>{minutes(exercise.plannedDurationSeconds)}</span> : exercise.repetitions ? <span>{exercise.repetitions} повторов</span> : null}</div>
            <p>{exercise.description}</p>
          </div>
        </li>)}
      </ol>
    </>}
  </section>;
}

function Detail({ workout, forced }: { workout: WorkoutDetail; forced: Forced }) {
  const contraindications = workout.contraindications.length ? workout.contraindications : ["Нет специальных противопоказаний в каталоге. Ориентируйтесь на самочувствие."];
  return <div className={`flow-screen ${styles.screen}`}>
    {forced === "offline" && <OfflineBanner icon={<Icon name="wifi-off" />}>Офлайн: показываем уже загруженное описание. Новые действия временно недоступны.</OfflineBanner>}
    <Button component={NextLink} inline clear small rounded className={`flow-back ${styles.back}`} href={"/catalog" as never}><Icon name="chevron-left" />Каталог</Button>
    <Hero workout={workout} />

    {workout.sourceType === "user" && <Card component="section" contentWrap={false} outline className={styles.warning}><Icon name="triangle-alert" /><span>Тренировка создана пользователем и не проверена Flowly.</span></Card>}

    <section className={styles.summary} aria-label="Кратко о тренировке">
      <Chip>{FORMAT[workout.format as keyof typeof FORMAT] ?? workout.format}</Chip>
      <Chip>{workout.equipment.length ? workout.equipment.join(", ") : "Без инвентаря"}</Chip>
      {workout.categories.map((c) => <Chip key={c.id}>{c.name}</Chip>)}
    </section>

    {workout.youtubeVideoId && <Link className={styles.youtube} href={`https://www.youtube.com/watch?v=${workout.youtubeVideoId}`} target="_blank" rel="noreferrer"><Icon name="external-link" />Открыть видео на YouTube</Link>}

    <ExerciseList workout={workout} />
    <ActionPanel workout={workout} />

    <details className={styles.more}>
      <summary>Дополнительно</summary>
      <div>
        <h2>Противопоказания</h2>
        <ul className={styles.bullets}>{contraindications.map((x) => <li key={x}>{x}</li>)}</ul>
        <p className={styles.muted}>Это справочная информация из описания тренировки, не персональная рекомендация.</p>
        <p className={styles.muted}>Источник: {sourceLabel(workout.sourceType)} · Автор: {workout.author.name}</p>
        <Button component={NextLink} inline clear rounded className={styles.authorLink} href={`/authors/${encodeURIComponent(workout.sourceType)}` as never}>Открыть публичный профиль</Button>
      </div>
    </details>
  </div>;
}

function Loading() {
  return <div className={`flow-screen ${styles.screen}`} aria-label="Загрузка тренировки"><Skeleton height="hero" /><Skeleton height="card" /><Skeleton height="card" /></div>;
}

export function WorkoutDetailScreen({ id, forced = null }: Props) {
  const detail = useWorkoutDetailQuery(id, !forced || forced === "offline");
  const workout = detail.data?.workout ?? null;

  if (forced === "loading") return <Loading />;
  if (forced === "hidden") return <div className={`flow-screen ${styles.screen}`}><Button component={NextLink} inline clear small rounded className={`flow-back ${styles.back}`} href={"/catalog" as never}><Icon name="chevron-left" />Каталог</Button><InlineError icon={<Icon name="eye-off" />} title="Тренировка недоступна" description="Доступ к этой тренировке изменился. Вернитесь в каталог и выберите другую практику." /></div>;
  if (forced === "error" || detail.isError) return <div className={`flow-screen ${styles.screen}`}><Button component={NextLink} inline clear small rounded className={`flow-back ${styles.back}`} href={"/catalog" as never}><Icon name="chevron-left" />Каталог</Button><InlineError icon={<Icon name="triangle-alert" />} title="Не удалось загрузить тренировку" description="Повторите запрос. Если тренировка удалена или скрыта, мы покажем безопасное сообщение вместо пустого экрана." onRetry={() => detail.refetch()} /></div>;
  if (!workout) return <Loading />;
  return <Detail workout={workout} forced={forced} />;
}
