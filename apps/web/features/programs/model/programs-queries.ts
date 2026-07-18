"use client";

import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { ProgramDetailResponse, ProgramsResponse } from "./programs";

export const programsKeys = {
  list: (duration = "") => ["programs", { duration }] as const,
  detail: (id: string) => ["program", id] as const,
};

export const getPrograms = (duration = "", signal?: AbortSignal) => apiJson<ProgramsResponse>(`/api/v1/programs${duration ? `?duration=${encodeURIComponent(duration)}` : ""}`, { signal });
export const getProgram = (id: string, signal?: AbortSignal) => apiJson<ProgramDetailResponse>(`/api/v1/programs/${encodeURIComponent(id)}`, { signal });

export const useProgramsQuery = (duration = "", enabled = true) => useQuery({ queryKey: programsKeys.list(duration), queryFn: ({ signal }) => getPrograms(duration, signal), enabled, staleTime: 5 * 60_000 });
export const useProgramDetailQuery = (id: string, enabled = true) => useQuery({ queryKey: programsKeys.detail(id), queryFn: ({ signal }) => getProgram(id, signal), enabled: enabled && Boolean(id), staleTime: 5 * 60_000 });
