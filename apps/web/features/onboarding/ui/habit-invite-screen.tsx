"use client";

import { Badge, BlockTitle, Button, List, ListItem } from "konsta/react";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

/**
 * S-MA-004 — First habit / invite prompts (onboarding §10.1 step 8/10).
 * T02: "Создать привычку" is a real action → /rhythm/new?return=onboarding; "Пропустить" stays honest.
 * "Пригласить друга" remains disabled until E7-D8 (DEC-019 social).
 */
export function HabitInviteScreen() {
  const router = useRouter();
  return (
    <main className="safe-shell flow-screen gap-4">
      <header className="grid gap-2">
        <BlockTitle component="h1" large className="!m-0 !p-0">
          Ещё больше в вашем ритме
        </BlockTitle>
        <p className="m-0 leading-6 text-text-muted">Создайте первую привычку или вернитесь к этому позже. Flowly ничего не создаст без вашего действия.</p>
      </header>

      <List strong inset dividers>
        <ListItem
          media={<Icon name="leaf" />}
          title="Первая привычка"
          subtitle="Иконка, цвет и спокойный прогресс"
          after={<Badge>Новое</Badge>}
        />
        <ListItem
          innerChildren={
            <Button large rounded tonal className={`w-full gap-2 ${focusRing}`} onClick={() => router.push("/rhythm/new?return=onboarding" as never)}>
              <Icon name="plus" />
              Создать привычку
            </Button>
          }
        />
      </List>

      <List strong inset dividers>
        <ListItem media={<Icon name="users" />} title="Пригласить друга" subtitle="Безопасная одноразовая ссылка" after={<Badge>Скоро</Badge>} />
        <ListItem
          innerChildren={
            <Button large rounded tonal disabled className="w-full gap-2">
              <Icon name="users" />
              Пригласить друга
            </Button>
          }
        />
      </List>

      <footer className="mt-1 grid">
        <Button large rounded className={focusRing} onClick={() => router.push("/onboarding/bot" as never)}>
          Продолжить
        </Button>
      </footer>
    </main>
  );
}
