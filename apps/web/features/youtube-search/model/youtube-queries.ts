"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson, jsonBody } from "@/lib/api/client";
import type { SaveYoutubeResponse, YoutubeFilters, YoutubeResult, YoutubeSearchResponse } from "./youtube";

const compact = (filters: YoutubeFilters) => Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) as YoutubeFilters;
const qs = (filters: YoutubeFilters) => new URLSearchParams(compact(filters) as Record<string, string>).toString();

export const youtubeKeys = {
  search: (filters: YoutubeFilters) => ["youtube", "search", compact(filters)] as const,
};

export const useYoutubeSearchQuery = (filters: YoutubeFilters, enabled = true) => useQuery({
  queryKey: youtubeKeys.search(filters),
  queryFn: ({ signal }) => apiJson<YoutubeSearchResponse>(`/api/v1/youtube/search${qs(filters) ? `?${qs(filters)}` : ""}`, { signal }),
  enabled,
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  retry: 1,
  placeholderData: (previous) => previous,
});

function useYoutubeWorkoutMutation(action: "save" | "create-workout") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ result, filters }: { result: YoutubeResult; filters: YoutubeFilters }) => apiJson<SaveYoutubeResponse>(`/api/v1/youtube/videos/${encodeURIComponent(result.videoId)}/${action}`, { method: "POST", body: jsonBody({ result, filters }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  });
}

export const useSaveYoutubeVideoMutation = () => useYoutubeWorkoutMutation("save");
export const useCreateYoutubeWorkoutMutation = () => useYoutubeWorkoutMutation("create-workout");
