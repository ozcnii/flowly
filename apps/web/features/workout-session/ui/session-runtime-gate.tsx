"use client";

import { Button, Card, Preloader } from "konsta/react";
import NextLink from "next/link";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { useWorkoutSessionQuery } from "../model/workout-session-queries";
import { StepSessionScreen } from "./step-session-screen";
import { VideoSessionScreen } from "./video-session-screen";

/**
 * Client gate: pick video vs step from real session payload (mode/format/youtube).
 * Avoids broken SSR cookie lookup that defaulted every session to step UI.
 */
export function SessionRuntimeGate({ id }: { id: string }) {
  const query = useWorkoutSessionQuery(id);
  if (query.isPending) {
    return <div className="min-h-dvh"><PrimaryNavbar title="Тренировка" /><main className="flow-screen grid min-h-64 place-items-center" role="status"><Preloader /><span className="sr-only">Загружаем сессию</span></main></div>;
  }
  if (query.isError || !query.data?.session) {
    return <div className="min-h-dvh"><PrimaryNavbar title="Тренировка" /><main className="flow-screen"><Card component="section" outline role="alert" contentWrapPadding="grid justify-items-center gap-3 p-6 text-center"><Icon name="triangle-alert" /><h1 className="m-0 text-lg font-semibold">Сессия недоступна</h1><Button component={NextLink} href="/catalog" rounded>Открыть каталог</Button></Card></main></div>;
  }
  const s = query.data.session;
  // Video owns YouTube runtime: mode, format, or materialised youtube video id.
  const isVideo = s.mode === "video" || s.workout.format === "video" || Boolean(s.workout.youtubeVideoId);
  return isVideo ? <VideoSessionScreen id={id} /> : <StepSessionScreen id={id} />;
}
