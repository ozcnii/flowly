"use client";

import { BlockTitle, Card } from "konsta/react";

export default function ProgramsPage() {
  return <section className="flow-screen"><Card component="section" outline contentWrapPadding="grid gap-3 p-4"><BlockTitle component="h1" large className="!m-0 !p-0">Практики в устойчивом ритме</BlockTitle><p className="m-0 text-sm leading-relaxed text-text-muted">Готовые последовательности будут собирать тренировки в понятный план. Пока выберите отдельную практику в каталоге.</p></Card></section>;
}
