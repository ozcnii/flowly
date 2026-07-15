"use client";

import { Badge, BlockTitle, Button, List, ListItem } from "konsta/react";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";

/** S-MA-004 — approved visible disabled capabilities, redesigned to Apple HIG/Konsta (DEC-036/037). */
export function HabitInviteScreen() {
  const router = useRouter();
  return <main className="safe-shell flow-screen gap-4">
    <header className="grid gap-2">
      <BlockTitle component="h1" large className="!m-0 !p-0">Ещё больше в вашем ритме</BlockTitle>
      <p className="m-0 leading-6 text-text-muted">Эти возможности появятся после обновления. Flowly ничего не создаст без вашего действия.</p>
    </header>

    <List strong inset dividers>
      <ListItem media={<Icon name="leaf" />} title="Первая привычка" subtitle="Расписание и мягкие напоминания" after={<Badge>Скоро</Badge>} />
      <ListItem innerChildren={<Button large rounded tonal disabled className="gap-2"><Icon name="leaf" />Создать привычку</Button>} />
    </List>

    <List strong inset dividers>
      <ListItem media={<Icon name="users" />} title="Пригласить друга" subtitle="Безопасная одноразовая ссылка" after={<Badge>Скоро</Badge>} />
      <ListItem innerChildren={<Button large rounded tonal disabled className="gap-2"><Icon name="users" />Пригласить друга</Button>} />
    </List>

    <footer className="mt-1 grid"><Button large rounded onClick={() => router.push("/onboarding/bot" as never)}>Продолжить</Button></footer>
  </main>;
}
