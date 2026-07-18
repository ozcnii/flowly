"use client";

import { Button, Preloader } from "konsta/react";
import { Icon } from "@flowly/ui";
import type { CatalogWorkout } from "@/features/catalog/model/catalog";
import { useToggleFavoriteMutation } from "@/features/favorites/model/favorites-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

type Props = {
  workoutId: string;
  title: string;
  isFavorite: boolean;
  /** Optional snapshot so optimistic favorites list can insert without waiting for GET /favorites. */
  workout?: CatalogWorkout;
  className?: string;
};

/**
 * Compact 44×44 favorite toggle.
 * Off: outline bookmark (muted). On: filled bookmark + tonal surface — clearly distinct.
 */
export function FavoriteButton({ workoutId, title, isFavorite, workout, className = "" }: Props) {
  const toggle = useToggleFavoriteMutation();
  const pending = toggle.isPending && toggle.variables?.entityId === workoutId;
  const label = isFavorite ? `Убрать «${title}» из избранного` : `Добавить «${title}» в избранное`;
  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    toggle.mutate({ entityType: "workout", entityId: workoutId, next: !isFavorite, workout });
  };
  return <Button
    type="button"
    inline
    clear={!isFavorite}
    tonal={isFavorite}
    rounded
    disabled={pending}
    aria-busy={pending || undefined}
    aria-pressed={isFavorite}
    aria-label={label}
    title={label}
    className={`h-11 w-11 min-w-11 p-0 ${isFavorite ? "text-accent" : "text-text-muted"} ${focusRing} ${className}`}
    onClick={onClick}
  >
    {pending ? <Preloader className="size-4" /> : <Icon name={isFavorite ? "bookmark-fill" : "bookmark"} className="size-5" />}
    <span className="sr-only" aria-live="polite">{isFavorite ? "В избранном" : "Не в избранном"}</span>
  </Button>;
}
