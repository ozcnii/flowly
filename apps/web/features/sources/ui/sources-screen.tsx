"use client";

import { BlockTitle, Button, Card, Preloader } from "konsta/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { FavoriteButton } from "@/components/workouts/favorite-button";
import { WorkoutMediaCard } from "@/components/workouts/workout-media-card";
import type { CatalogWorkout } from "@/features/catalog/model/catalog";
import { DIFFICULTY, FORMAT, minutes } from "@/features/catalog/model/catalog";
import { useAuthorWorkoutsQuery } from "@/features/catalog/model/catalog-queries";

type Source = "flowly" | "youtube";
type Forced = "loading" | "error" | "empty" | "flowly-error" | "youtube-error" | null;
type Query = ReturnType<typeof useAuthorWorkoutsQuery>;

const content: Record<Source, { title: string; description: string; all: string }> = {
  flowly: { title: "Flowly", description: "Практики с пошаговыми упражнениями и понятной структурой.", all: "Все тренировки Flowly" },
  youtube: { title: "YouTube", description: "Видео-практики, которые можно открыть и сохранить в Flowly.", all: "Все тренировки YouTube" },
};
const cover = (workout: CatalogWorkout) => workout.sourceType === "youtube" && workout.youtubeVideoId ? `https://i.ytimg.com/vi/${workout.youtubeVideoId}/hqdefault.jpg` : workout.coverObjectKey ? `/media/${workout.coverObjectKey}` : "";
const metadata = (workout: CatalogWorkout) => [FORMAT[workout.format as keyof typeof FORMAT] ?? workout.format, minutes(workout.durationSeconds), DIFFICULTY[workout.difficulty as keyof typeof DIFFICULTY] ?? workout.difficulty].join(" · ");

function WorkoutPreview({ workout, onOpen, eager }: { workout: CatalogWorkout; onOpen: () => void; eager?: boolean }) {
  return <WorkoutMediaCard
    title={workout.title}
    coverSrc={cover(workout)}
    durationSeconds={workout.durationSeconds}
    metadata={metadata(workout)}
    eager={eager}
    unoptimized={workout.sourceType === "youtube"}
    onOpen={onOpen}
    actions={<FavoriteButton workoutId={workout.id} title={workout.title} isFavorite={Boolean(workout.isFavorite)} workout={workout} />}
    className="min-w-72 max-w-80 flex-none snap-start"
    headingLevel="h3"
  />;
}

function SourceSection({ source, query, forced, onOpen }: { source: Source; query: Query; forced: Forced; onOpen: (id: string) => void }) {
  const forcedError = forced === "error" || forced === `${source}-error`, loading = forced === "loading" || (!forcedError && forced !== "empty" && query.isPending && !query.data);
  const error = forcedError || query.isError, workouts = forced === "empty" ? [] : query.data?.workouts ?? [];
  const copy = content[source], id = `source-${source}-title`;
  return <section aria-labelledby={id} className="grid gap-2">
    <BlockTitle component="h2" id={id} className="!m-0 !px-0">{copy.title}</BlockTitle>
    <p className="m-0 text-sm text-text-muted">{copy.description}</p>
    {loading ? <div className="grid min-h-24 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем {copy.title}</span></div> : error ? <Card component="aside" outline className="m-0" role="alert" contentWrapPadding="p-4 grid gap-3"><p className="m-0 text-sm">Не удалось загрузить тренировки {copy.title}.</p><Button inline rounded onClick={() => query.refetch()}>Повторить</Button></Card> : workouts.length === 0 ? <Card component="aside" outline className="m-0" contentWrapPadding="p-4"><p className="m-0 text-sm text-text-muted">Тренировки пока не найдены.</p></Card> : <div className="flex snap-x gap-3 overflow-x-auto pb-1">{workouts.slice(0, 3).map((workout, index) => <WorkoutPreview key={workout.id} workout={workout} eager={index === 0} onOpen={() => onOpen(workout.id)} />)}</div>}
    {!loading && !error && workouts.length > 0 && <Button component={NextLink} href={`/catalog?source=${source}` as never} inline clear rounded className="justify-self-start gap-2">{copy.all}<Icon name="chevron-right" /></Button>}
  </section>;
}

export function SourcesScreen({ forced = null }: { forced?: Forced }) {
  const router = useRouter();
  const flowly = useAuthorWorkoutsQuery("flowly", forced !== "loading" && forced !== "error" && forced !== "empty" && forced !== "flowly-error");
  const youtube = useAuthorWorkoutsQuery("youtube", forced !== "loading" && forced !== "error" && forced !== "empty" && forced !== "youtube-error");
  const open = (id: string) => router.push(`/workouts/${encodeURIComponent(id)}` as never);
  return <div className="min-h-dvh">
    <PrimaryNavbar title="Источники" />
    <main className="flow-screen">
      <h1 className="sr-only">Источники</h1>
      <SourceSection source="flowly" query={flowly} forced={forced} onOpen={open} />
      <SourceSection source="youtube" query={youtube} forced={forced} onOpen={open} />
    </main>
  </div>;
}
