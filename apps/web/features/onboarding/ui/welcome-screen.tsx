"use client";

import { BlockTitle, Button, Card } from "konsta/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

/** S-MA-002 — Apple HIG / Konsta-first welcome (DEC-036, DEC-037). */
export function WelcomeScreen() {
  const router = useRouter();
  return <main className="safe-shell flow-screen gap-5 md:grid md:grid-cols-[minmax(16rem,1fr)_minmax(18rem,1fr)] md:items-center">
    <Card contentWrap={false} className="relative min-h-72 overflow-hidden md:min-h-[31rem]">
      <Image src="/media/home-program.webp" alt="Спокойная практика йоги" fill priority sizes="100vw" className="object-cover object-[center_35%]" />
    </Card>

    <section className="grid gap-3 md:content-center">
      <BlockTitle component="h1" large className="!m-0 !p-0">Мягкий ритм для каждого дня</BlockTitle>
      <p className="m-0 text-base leading-6 text-text-muted">Flowly объединяет практики, привычки и напоминания. Настройка займёт меньше минуты.</p>
      <div className="mt-2 grid gap-2">
        <Button large rounded onClick={() => router.push("/onboarding/preferences" as never)}>Начать настройку</Button>
        <Button large rounded clear onClick={() => router.push("/onboarding/bot" as never)}>Пропустить настройку</Button>
      </div>
    </section>
  </main>;
}
