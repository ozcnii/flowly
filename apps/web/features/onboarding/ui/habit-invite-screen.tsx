"use client";

import { Badge, BlockTitle, Button, List, ListItem, Preloader } from "konsta/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@flowly/ui";
import { ApiError } from "@/lib/api/client";
import { shareInviteLink } from "@/lib/friends/share-invite";
import { useCreateInviteMutation } from "@/features/friends/model/friends-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

/**
 * S-MA-004 — First habit / invite prompts (onboarding §10.1 step 8/10).
 * Habit → /rhythm/new; invite → real E7-D8-T01 create mutation (no fake success).
 */
export function HabitInviteScreen() {
  const router = useRouter();
  const createInvite = useCreateInviteMutation();
  const [notice, setNotice] = useState("");

  const onInvite = async () => {
    setNotice("");
    try {
      const res = await createInvite.mutateAsync();
      const mode = shareInviteLink(res.botDeepLink);
      setNotice(
        mode === "share"
          ? "Выберите чат и отправьте ссылку другу."
          : mode === "clipboard"
            ? "Ссылка скопирована — вставьте в чат другу."
            : "Ссылка создана — отправьте другу.",
      );
    } catch (e) {
      setNotice(e instanceof ApiError ? "Не удалось создать приглашение." : "Ошибка сети.");
    }
  };

  return (
    <main className="safe-shell flow-screen gap-4">
      <header className="grid gap-2">
        <BlockTitle component="h1" large className="!m-0 !p-0">
          Ещё больше в вашем ритме
        </BlockTitle>
        <p className="m-0 leading-6 text-text-muted">
          Создайте первую привычку или пригласите друга. Flowly ничего не создаст без вашего действия.
        </p>
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
            <Button
              large
              rounded
              tonal
              className={`w-full gap-2 ${focusRing}`}
              onClick={() => router.push("/rhythm/new?return=onboarding" as never)}
            >
              <Icon name="plus" />
              Создать привычку
            </Button>
          }
        />
      </List>

      <List strong inset dividers>
        <ListItem media={<Icon name="users" />} title="Пригласить друга" subtitle="Безопасная одноразовая ссылка" />
        <ListItem
          innerChildren={
            <Button
              large
              rounded
              tonal
              className={`w-full gap-2 ${focusRing}`}
              disabled={createInvite.isPending}
              aria-busy={createInvite.isPending || undefined}
              onClick={() => void onInvite()}
            >
              {createInvite.isPending ? <Preloader /> : <Icon name="users" />}
              Пригласить друга
            </Button>
          }
        />
      </List>

      <p className="m-0 min-h-5 text-sm text-text-muted" aria-live="polite">
        {notice}
      </p>

      <footer className="mt-1 grid">
        <Button large rounded className={focusRing} onClick={() => router.push("/onboarding/bot" as never)}>
          Продолжить
        </Button>
      </footer>
    </main>
  );
}
