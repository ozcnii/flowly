"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson, jsonBody } from "@/lib/api/client";
import type { EnrollResponse, ProgramDetailResponse, ProgramsResponse } from "./programs";

export const programsKeys = {
  list: (duration = "") => ["programs", { duration }] as const,
  detail: (id: string) => ["program", id] as const,
  enrollment: (id: string) => ["program-enrollment", id] as const,
};

export const getPrograms = (duration = "", signal?: AbortSignal) => apiJson<ProgramsResponse>(`/api/v1/programs${duration ? `?duration=${encodeURIComponent(duration)}` : ""}`, { signal });
export const getProgram = (id: string, signal?: AbortSignal) => apiJson<ProgramDetailResponse>(`/api/v1/programs/${encodeURIComponent(id)}`, { signal });
export const postEnroll = (programId: string, startLocalDate: string) => apiJson<EnrollResponse>(`/api/v1/programs/${encodeURIComponent(programId)}/enroll`, { method: "POST", body: jsonBody({ startLocalDate }) });
export type SkipDayResponse = {
  created: boolean;
  startLocalDate: string;
  scheduledLocalDate: string;
  occurrence: { id: string; status: string; scheduledLocalDate: string };
};
export const postSkipEnrollmentDay = (enrollmentId: string, dayNumber: number) =>
  apiJson<SkipDayResponse>(`/api/v1/program-enrollments/${encodeURIComponent(enrollmentId)}/skip`, { method: "POST", body: jsonBody({ dayNumber }) });

export const useProgramsQuery = (duration = "", enabled = true) => useQuery({ queryKey: programsKeys.list(duration), queryFn: ({ signal }) => getPrograms(duration, signal), enabled, staleTime: 5 * 60_000 });
export const useProgramDetailQuery = (id: string, enabled = true) => useQuery({ queryKey: programsKeys.detail(id), queryFn: ({ signal }) => getProgram(id, signal), enabled: enabled && Boolean(id), staleTime: 30_000 });

export const useEnrollProgramMutation = (programId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (startLocalDate: string) => postEnroll(programId, startLocalDate),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: programsKeys.detail(programId) });
      void qc.invalidateQueries({ queryKey: ["programs"] });
    },
  });
};

export const useSkipEnrollmentDayMutation = (enrollmentId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dayNumber: number) => postSkipEnrollmentDay(enrollmentId, dayNumber),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: programsKeys.enrollment(enrollmentId) });
    },
  });
};
