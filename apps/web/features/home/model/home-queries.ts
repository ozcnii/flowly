"use client";

import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { HomeViewModel } from "./home-view-model";

export const homeKey = ["home"] as const;

export type HomeResponse = { home: HomeViewModel };

export const getHome = (signal?: AbortSignal) => apiJson<HomeResponse>("/api/v1/home", { cache: "no-store", signal });

export const useHomeQuery = (enabled = true) =>
  useQuery({ queryKey: homeKey, queryFn: ({ signal }) => getHome(signal), enabled, staleTime: 15_000, gcTime: 5 * 60_000 });
