"use client";

import { Button, Card, Preloader } from "konsta/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { FavoriteButton } from "@/components/workouts/favorite-button";
import { WorkoutMediaCard } from "@/components/workouts/workout-media-card";
import type { CatalogWorkout } from "@/features/catalog/model/catalog";
import { DIFFICULTY, FORMAT, SOURCE, minutes } from "@/features/catalog/model/catalog";
import { useFavoritesQuery } from "../model/favorites-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
const cover = (workout: CatalogWorkout) => workout.sourceType === "youtube" && workout.youtubeVideoId ? `https://i.ytimg.com/vi/${workout.youtubeVideoId}/hqdefault.jpg` : workout.coverObjectKey ? `/media/${workout.coverObjectKey}` : "";
const metadata = (workout: CatalogWorkout) => [SOURCE[workout.sourceType as keyof typeof SOURCE] ?? workout.sourceType, FORMAT[workout.format as keyof typeof FORMAT] ?? workout.format, minutes(workout.durationSeconds), DIFFICULTY[workout.difficulty as keyof typeof DIFFICULTY] ?? workout.difficulty].filter(Boolean).join(" · ");
const countLabel = (count: number) => {
  const mod10 = count % 10, mod100 = count % 100;
  return `${count} ${mod10 === 1 && mod100 !== 11 ? "тренировка" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "тренировки" : "тренировок"}`;
};

export function FavoritesScreen() {
  const router = useRouter();
  const query = useFavoritesQuery();
  const items = query.data?.items ?? [];
  const loading = query.isPending && !query.data;
  const error = query.isError && !query.data;

  return <div className="min-h-dvh">
    <PrimaryNavbar title="Избранное" />
    <main className="flow-screen">
      <h1 className="sr-only">Избранное</h1>
      {loading ? <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем избранное</span></div>
        : error ? <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="triangle-alert" /><h2 className="m-0 text-lg font-semibold">Не удалось загрузить</h2><p className="m-0 text-sm text-text-muted">Повторите запрос.</p><Button large rounded className={focusRing} onClick={() => query.refetch()}>Повторить</Button></Card>
          : items.length === 0 ? <Card component="section" outline className="m-0 text-center" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="bookmark" /><h2 className="m-0 text-lg font-semibold">В избранном пока пусто</h2><p className="m-0 text-sm text-text-muted">Отмечайте тренировки закладкой в каталоге — они появятся здесь. Папки не используются.</p><Button component={NextLink} href="/catalog" large rounded className={focusRing}>В каталог</Button></Card>
            : <>
              <p className="m-0 text-sm font-semibold" aria-live="polite">{countLabel(query.data?.total ?? items.length)}</p>
              <div className="grid gap-2">{items.map((item, index) => <WorkoutMediaCard
                key={item.entityId}
                title={item.workout.title}
                coverSrc={cover(item.workout)}
                durationSeconds={item.workout.durationSeconds}
                metadata={metadata(item.workout)}
                eager={index < 2}
                unoptimized={item.workout.sourceType === "youtube"}
                onOpen={() => router.push(`/workouts/${encodeURIComponent(item.entityId)}` as never)}
                actions={<FavoriteButton workoutId={item.entityId} title={item.workout.title} isFavorite workout={item.workout} />}
              />)}</div>
            </>}
    </main>
  </div>;
}
