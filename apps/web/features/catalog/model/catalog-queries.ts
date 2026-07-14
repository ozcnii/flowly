"use client";

import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { CatalogResponse, WorkoutDetailResponse } from "./catalog";

export type CatalogFilters = Record<"q" | "category" | "duration" | "difficulty" | "format" | "source" | "equipment" | "favorite", string>;

const compact = (filters: CatalogFilters) => Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
const qs = (filters: CatalogFilters) => new URLSearchParams(compact(filters)).toString();

export const catalogKeys = {
  workouts: (filters: CatalogFilters) => ["workouts", compact(filters)] as const,
  authorWorkouts: (source: string) => ["authorWorkouts", source] as const,
  workout: (id: string) => ["workout", id] as const,
};

const catalogPolicy = { staleTime: 5 * 60_000, gcTime: 30 * 60_000 } as const;

export const getWorkouts = (filters: CatalogFilters, signal?: AbortSignal) => apiJson<CatalogResponse>(`/api/v1/workouts${qs(filters) ? `?${qs(filters)}` : ""}`, { signal });
export const getAuthorWorkouts = (source: string, signal?: AbortSignal) => apiJson<CatalogResponse>(`/api/v1/workouts?source=${encodeURIComponent(source)}`, { signal });
export const getWorkoutDetail = (id: string, signal?: AbortSignal) => apiJson<WorkoutDetailResponse>(`/api/v1/workouts/${encodeURIComponent(id)}`, { signal });

export const useCatalogQuery = (filters: CatalogFilters, enabled = true) => useQuery({ queryKey: catalogKeys.workouts(filters), queryFn: ({ signal }) => getWorkouts(filters, signal), enabled, ...catalogPolicy });
export const useAuthorWorkoutsQuery = (source: string, enabled = true) => useQuery({ queryKey: catalogKeys.authorWorkouts(source), queryFn: ({ signal }) => getAuthorWorkouts(source, signal), enabled, ...catalogPolicy });
export const useWorkoutDetailQuery = (id: string, enabled = true) => useQuery({ queryKey: catalogKeys.workout(id), queryFn: ({ signal }) => getWorkoutDetail(id, signal), enabled: enabled && Boolean(id), ...catalogPolicy });
