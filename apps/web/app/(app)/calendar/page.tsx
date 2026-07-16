"use client";

import { BlockTitle, Card } from "konsta/react";

export default function CalendarPage() {
  return <section className="flow-screen"><Card component="section" outline contentWrapPadding="grid gap-3 p-4"><BlockTitle component="h1" large className="!m-0 !p-0">Ваши практики по дням</BlockTitle><p className="m-0 text-sm leading-relaxed text-text-muted">Здесь будет удобно видеть историю и запланированные занятия. Выполненные тренировки сохраняются в вашем профиле.</p></Card></section>;
}
