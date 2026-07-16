"use client";

import { BlockTitle, Card } from "konsta/react";

export default function RhythmPage() {
  return <section className="flow-screen"><Card component="section" outline contentWrapPadding="grid gap-3 p-4"><BlockTitle component="h1" large className="!m-0 !p-0">Небольшие шаги каждый день</BlockTitle><p className="m-0 text-sm leading-relaxed text-text-muted">Здесь соберутся привычки и спокойный прогресс. Сейчас можно начать с короткой тренировки.</p></Card></section>;
}
