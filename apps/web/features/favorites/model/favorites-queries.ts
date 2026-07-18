"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { apiJson, jsonBody } from "@/lib/api/client";
import type { CatalogResponse, CatalogWorkout, WorkoutDetailResponse } from "@/features/catalog/model/catalog";
import { catalogKeys } from "@/features/catalog/model/catalog-queries";

export type FavoriteItem = {
  entityType: "workout";
  entityId: string;
  createdAt: string;
  workout: CatalogWorkout & { isFavorite: true };
};
export type FavoritesResponse = { total: number; items: FavoriteItem[] };
export type ToggleFavoriteInput = { entityType: "workout"; entityId: string; next: boolean; workout?: CatalogWorkout };

export const favoritesKey = ["favorites"] as const;

export const getFavorites = (signal?: AbortSignal) => apiJson<FavoritesResponse>("/api/v1/favorites", { signal });
export const putFavorite = (entityType: "workout", entityId: string) => apiJson<{ created: boolean; favorite: { entityType: string; entityId: string; createdAt: string } }>("/api/v1/favorites", { method: "PUT", body: jsonBody({ entityType, entityId }) });
export const deleteFavorite = (entityType: "workout", entityId: string) => apiJson<{ ok: true }>(`/api/v1/favorites?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`, { method: "DELETE" });

const patchWorkoutFavorite = <T extends { workouts?: Array<{ id: string; isFavorite?: boolean }> }>(data: T | undefined, entityId: string, isFavorite: boolean): T | undefined => {
  if (!data?.workouts) return data;
  return { ...data, workouts: data.workouts.map((workout) => workout.id === entityId ? { ...workout, isFavorite } : workout) };
};

function findWorkoutInCache(qc: QueryClient, entityId: string, hint?: CatalogWorkout): CatalogWorkout | undefined {
  if (hint?.id === entityId) return hint;
  const detail = qc.getQueryData<WorkoutDetailResponse>(catalogKeys.workout(entityId));
  if (detail?.workout) return detail.workout;
  for (const [, data] of qc.getQueriesData<CatalogResponse>({ queryKey: ["workouts"] })) {
    const hit = data?.workouts.find((workout) => workout.id === entityId);
    if (hit) return hit;
  }
  for (const [, data] of qc.getQueriesData<CatalogResponse>({ queryKey: ["authorWorkouts"] })) {
    const hit = data?.workouts.find((workout) => workout.id === entityId);
    if (hit) return hit;
  }
  const favorites = qc.getQueryData<FavoritesResponse>(favoritesKey);
  return favorites?.items.find((item) => item.entityId === entityId)?.workout;
}

export const useFavoritesQuery = (enabled = true) => useQuery({
  queryKey: favoritesKey,
  queryFn: ({ signal }) => getFavorites(signal),
  enabled,
  staleTime: 15_000,
  refetchOnMount: "always",
});

export const useToggleFavoriteMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["favorite-toggle"],
    mutationFn: async ({ entityType, entityId, next }: ToggleFavoriteInput) => next ? putFavorite(entityType, entityId) : deleteFavorite(entityType, entityId),
    onMutate: async ({ entityId, next, workout: hint }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: favoritesKey }),
        qc.cancelQueries({ queryKey: ["workouts"] }),
        qc.cancelQueries({ queryKey: ["workout", entityId] }),
        qc.cancelQueries({ queryKey: ["authorWorkouts"] }),
      ]);
      const previousFavorites = qc.getQueryData<FavoritesResponse>(favoritesKey);
      const previousWorkouts = qc.getQueriesData<CatalogResponse>({ queryKey: ["workouts"] });
      const previousAuthors = qc.getQueriesData<CatalogResponse>({ queryKey: ["authorWorkouts"] });
      const previousDetail = qc.getQueryData<WorkoutDetailResponse>(catalogKeys.workout(entityId));
      const snapshot = findWorkoutInCache(qc, entityId, hint);

      qc.setQueriesData<CatalogResponse>({ queryKey: ["workouts"] }, (data) => patchWorkoutFavorite(data, entityId, next));
      qc.setQueriesData<CatalogResponse>({ queryKey: ["authorWorkouts"] }, (data) => patchWorkoutFavorite(data, entityId, next));
      if (previousDetail) {
        qc.setQueryData<WorkoutDetailResponse>(catalogKeys.workout(entityId), {
          workout: {
            ...previousDetail.workout,
            isFavorite: next,
            actions: { ...previousDetail.workout.actions, favorite: { enabled: true, reason: next ? "В избранном" : "Можно добавить в избранное." } },
          },
        });
      }

      const base = previousFavorites ?? { total: 0, items: [] as FavoriteItem[] };
      if (next) {
        const exists = base.items.some((item) => item.entityId === entityId);
        const item: FavoriteItem | null = snapshot
          ? { entityType: "workout", entityId, createdAt: new Date().toISOString(), workout: { ...snapshot, isFavorite: true as const } }
          : null;
        qc.setQueryData<FavoritesResponse>(favoritesKey, {
          total: exists ? base.total : base.total + (item ? 1 : 0),
          items: exists
            ? base.items.map((row) => row.entityId === entityId ? { ...row, workout: { ...row.workout, isFavorite: true as const } } : row)
            : item
              ? [item, ...base.items]
              : base.items,
        });
      } else {
        qc.setQueryData<FavoritesResponse>(favoritesKey, {
          total: Math.max(0, base.items.filter((item) => item.entityId === entityId).length ? base.total - 1 : base.total),
          items: base.items.filter((item) => item.entityId !== entityId),
        });
      }

      return { previousFavorites, previousWorkouts, previousAuthors, previousDetail };
    },
    onError: (_error, { entityId }, context) => {
      if (!context) return;
      if (context.previousFavorites !== undefined) qc.setQueryData(favoritesKey, context.previousFavorites);
      for (const [key, data] of context.previousWorkouts) qc.setQueryData(key, data);
      for (const [key, data] of context.previousAuthors) qc.setQueryData(key, data);
      if (context.previousDetail) qc.setQueryData(catalogKeys.workout(entityId), context.previousDetail);
    },
    onSettled: (_data, _error, { entityId }) => {
      void qc.invalidateQueries({ queryKey: favoritesKey });
      void qc.invalidateQueries({ queryKey: ["workouts"] });
      void qc.invalidateQueries({ queryKey: ["authorWorkouts"] });
      void qc.invalidateQueries({ queryKey: catalogKeys.workout(entityId) });
      void qc.invalidateQueries({ queryKey: ["youtube"] });
    },
  });
};
