"use client";

import { Card } from "konsta/react";

export default function CalendarPage() {
  return <section className="flow-screen"><Card component="section" contentWrap={false} outline className="flow-card"><h1 className="flow-title">Ваши практики по дням</h1><p className="flow-subtitle">Здесь будет удобно видеть историю и запланированные занятия. Выполненные тренировки сохраняются в вашем профиле.</p></Card></section>;
}
