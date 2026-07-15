"use client";

import { Button, Card } from "konsta/react";
import NextLink from "next/link";
import { useMemo } from "react";
import { Icon, InlineError, Skeleton } from "@flowly/ui";
import type { CatalogWorkout } from "@/features/catalog/model/catalog";
import { DIFFICULTY, SOURCE, minutes } from "@/features/catalog/model/catalog";
import { useAuthorWorkoutsQuery } from "@/features/catalog/model/catalog-queries";
import styles from "./author-profile-screen.module.css";

type Source = "flowly" | "youtube" | "user";
type Forced = "loading" | "error" | "empty" | "blocked" | null;

type Props = { source?: string; forced?: Forced };

const sourceTitle: Record<Source, string> = { flowly: "Flowly", youtube: "YouTube-практики", user: "Пользователь" };
const sourceDescription: Record<Source, string> = {
  flowly: "Проверенные практики стартового каталога Flowly.",
  youtube: "Внешние видео-практики, добавленные в стартовый каталог для примера.",
  user: "Пользовательский контент ещё не подключён."
};
const safeSource = (source?: string): Source => source === "youtube" || source === "user" ? source : "flowly";
const cover = (workout: CatalogWorkout) => workout.sourceType === "youtube" && workout.youtubeVideoId ? `https://i.ytimg.com/vi/${workout.youtubeVideoId}/hqdefault.jpg` : workout.coverObjectKey ? `/media/${workout.coverObjectKey}` : "";

function WorkoutMiniCard({ workout }: { workout: CatalogWorkout }) {
  const image = cover(workout);
  return <NextLink className={styles.cardLink} href={`/workouts/${encodeURIComponent(workout.id)}` as never}><Card contentWrap={false} outline className={styles.card}>
    {image && <span className={styles.cover} style={{ backgroundImage: `${workout.sourceType === "youtube" ? "linear-gradient(135deg, rgba(28,45,39,.08), rgba(28,45,39,.52)), " : ""}url(${image})` }}>{workout.sourceType === "youtube" && <Icon name="play" />}</span>}
    <span className={styles.cardBody}>
      <span className={styles.cardTop}>{minutes(workout.durationSeconds)} · {DIFFICULTY[workout.difficulty as keyof typeof DIFFICULTY] ?? workout.difficulty}</span>
      <strong>{workout.title}</strong>
      <small>{workout.categories.map((c) => c.name).slice(0, 2).join(" · ")}</small>
    </span>
  </Card></NextLink>;
}

function Loading() {
  return <div className={`flow-screen ${styles.screen}`} aria-label="Загрузка автора"><Skeleton height="hero" /><Skeleton height="card" /><Skeleton height="card" /></div>;
}

export function AuthorProfileScreen({ source, forced = null }: Props) {
  const src = safeSource(source);
  const author = useAuthorWorkoutsQuery(src, !(forced === "loading" || forced === "error" || forced === "empty" || forced === "blocked"));
  const data = author.data ?? null;
  const items = useMemo(() => forced === "empty" || forced === "blocked" ? [] : data?.workouts ?? [], [data, forced]);

  if (forced === "loading") return <Loading />;
  if (forced === "error" || author.isError) return <div className={`flow-screen ${styles.screen}`}><Button component={NextLink} inline clear small rounded className={`flow-back ${styles.back}`} href={"/catalog" as never}><Icon name="chevron-left" />Каталог</Button><InlineError icon={<Icon name="triangle-alert" />} title="Не удалось загрузить автора" description="Повторите позже. Доступ к тренировкам не менялся." /></div>;
  if (!data && !forced) return <Loading />;

  return <div className={`flow-screen ${styles.screen}`}>
    <Button component={NextLink} inline clear small rounded className={`flow-back ${styles.back}`} href={"/catalog" as never}><Icon name="chevron-left" />Каталог</Button>
    <header className={`flow-top ${styles.header}`}>
      <p className="flow-eyebrow">{SOURCE[src] ?? sourceTitle[src]}</p>
      <h1 className="flow-title">{sourceTitle[src]}</h1>
      <span className="flow-subtitle">{sourceDescription[src]}</span>
    </header>

    <Card component="section" contentWrap={false} outline className={styles.control} aria-label="Доступ к автору">
      {src === "flowly" ? <p>Flowly — системный источник. Его нельзя скрыть или заблокировать.</p> : src === "youtube" ? <p>YouTube-каналы можно будет скрывать после подключения поиска.</p> : forced === "blocked" ? <p>Автор скрыт. Разблокирование будет доступно позже.</p> : <p>Действия для пользовательского контента.</p>}
      {src === "user" && <div className={styles.safetyLinks}><Button component={NextLink} clear rounded className={styles.reportLink} href={"/safety/report" as never}>Пожаловаться</Button><Button component={NextLink} tonal rounded className={styles.hideLink} href={"/safety/hide" as never}>Скрыть</Button><Button component={NextLink} outline rounded className={styles.blockLink} href={"/safety/block" as never}>Заблокировать</Button></div>}
    </Card>

    <section className={styles.content}>
      <h2>Тренировки</h2>
      {items.length === 0 ? <p className={styles.empty}>{src === "user" ? "Пользовательские тренировки появятся позже." : "Контент автора сейчас недоступен."}</p> : <div className={styles.list}>{items.map((workout) => <WorkoutMiniCard key={workout.id} workout={workout} />)}</div>}
    </section>
  </div>;
}
