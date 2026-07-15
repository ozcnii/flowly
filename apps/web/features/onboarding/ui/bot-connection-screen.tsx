"use client";

import { Badge, BlockTitle, Button, List, ListItem, Preloader } from "konsta/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@flowly/ui";
import { useCompleteOnboardingMutation } from "@/features/profile/model/me-queries";

type BotPhase = "checking" | "linked" | "error";

/** S-MA-005 — mandatory Telegram gate, Apple HIG/Konsta-first (DEC-036/037). */
export function BotConnectionScreen() {
  const router = useRouter();
  const search = useSearchParams();
  const forced = process.env.NODE_ENV !== "production" ? search.get("bot") : null;
  const complete = useCompleteOnboardingMutation();
  const phase: BotPhase = forced === "checking" ? "checking" : forced === "error" || complete.isError ? "error" : "linked";
  const finish = async () => { try { await complete.mutateAsync(); router.replace("/" as never); } catch { /* Mutation state keeps the retry action visible. */ } };
  const copy = phase === "linked"
    ? { title: "Telegram подключён", subtitle: "Вход подтверждён. Можно открыть Flowly.", icon: "check", badge: "Готово" }
    : phase === "error"
      ? { title: "Не удалось завершить", subtitle: "Настройки сохранены на экране. Попробуйте ещё раз.", icon: "triangle-alert", badge: "Ошибка" }
      : { title: "Проверяем подключение", subtitle: "Это займёт несколько секунд.", icon: "loader-circle", badge: "Проверка" };

  return <main className="safe-shell flow-screen gap-4">
    <header className="grid gap-2">
      <BlockTitle component="h1" large className="!m-0 !p-0">Связь с Telegram</BlockTitle>
      <p className="m-0 leading-6 text-text-muted">Telegram нужен для безопасного входа и будущих напоминаний.</p>
    </header>

    <List strong inset>
      <ListItem media={phase === "checking" ? <Preloader /> : <Icon name={copy.icon} className={phase === "error" ? "text-danger" : undefined} />} title={copy.title} subtitle={copy.subtitle} after={<Badge colors={phase === "error" ? { bg: "bg-danger", text: "text-white" } : undefined}>{copy.badge}</Badge>} />
    </List>

    <footer className="mt-1 grid">
      {phase === "checking" ? <Button large rounded disabled aria-busy><Preloader />Проверяем</Button> : <Button large rounded disabled={complete.isPending} aria-busy={complete.isPending || undefined} onClick={finish}>{complete.isPending && <Preloader />}{phase === "error" ? "Повторить" : "Открыть Flowly"}</Button>}
    </footer>
  </main>;
}
