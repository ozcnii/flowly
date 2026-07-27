"use client";

import { Badge, Button, Card, List, ListItem, Navbar, Preloader, Sheet } from "konsta/react";
import { useRef, useState } from "react";
import { Icon } from "@flowly/ui";
import { ModalPortal } from "@/components/modal-portal";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { ApiError } from "@/lib/api/client";
import {
  useCreateInviteMutation,
  useFriendsQuery,
  useRemoveFriendMutation,
  type FriendRow,
} from "../model/friends-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

function peerLabel(row: FriendRow) {
  if (row.peer) return row.peer.username ? `${row.peer.firstName} (@${row.peer.username})` : row.peer.firstName;
  return row.inviteCode ? `Код ${row.inviteCode}` : "Ожидает";
}

function openBotDeepLink(url: string) {
  const tg = window.Telegram?.WebApp as unknown as { openTelegramLink?: (u: string) => void } | undefined;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

/** S-MA-081 — Friends list / invite / pending / remove with revoke confirm. */
export function FriendsScreen() {
  const query = useFriendsQuery();
  const createInvite = useCreateInviteMutation();
  const remove = useRemoveFriendMutation();
  const sheetRef = useRef<HTMLElement>(null);
  const [notice, setNotice] = useState("");
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<FriendRow | null>(null);
  const friends = query.data?.friends ?? [];
  const accepted = friends.filter((f) => f.status === "accepted");
  const pending = friends.filter((f) => f.status === "pending");
  const loading = query.isPending && !query.data;
  const error = query.isError && !query.data;

  const onInvite = async () => {
    setNotice("");
    try {
      const res = await createInvite.mutateAsync();
      setLastLink(res.botDeepLink);
      setNotice("Ссылка готова — отправьте другу в Telegram.");
      openBotDeepLink(res.botDeepLink);
    } catch (e) {
      setNotice(e instanceof ApiError ? "Не удалось создать приглашение." : "Ошибка сети.");
    }
  };

  const confirmRemove = async () => {
    if (!pendingRemove) return;
    setNotice("");
    try {
      await remove.mutateAsync(pendingRemove.id);
      setNotice("Связь удалена. Доступ к общим объектам отозван.");
      setPendingRemove(null);
    } catch {
      setNotice("Не удалось удалить.");
    }
  };

  return (
    <div className="min-h-dvh">
      <PrimaryNavbar title="Друзья" />
      <main className="flow-screen gap-3">
        <h1 className="sr-only">Друзья</h1>
        <p className="m-0 min-h-5 text-sm leading-5 text-text-muted" aria-live="polite">
          {notice || "Приглашение одноразовое, действует 7 дней."}
        </p>
        <Button
          large
          rounded
          className={`w-full gap-2 ${focusRing}`}
          disabled={createInvite.isPending}
          aria-busy={createInvite.isPending || undefined}
          onClick={() => void onInvite()}
        >
          {createInvite.isPending ? <Preloader /> : <Icon name="users" />}
          Пригласить друга
        </Button>
        {lastLink ? (
          <p className="m-0 break-all text-xs text-text-muted">
            <span className="sr-only">Ссылка: </span>
            {lastLink}
          </p>
        ) : null}

        {loading ? (
          <div className="grid min-h-48 place-items-center" role="status" aria-busy="true">
            <Preloader />
            <span className="sr-only">Загружаем друзей</span>
          </div>
        ) : error ? (
          <Card
            component="section"
            outline
            className="m-0 text-center"
            role="alert"
            contentWrapPadding="p-6 grid justify-items-center gap-3"
          >
            <Icon name="triangle-alert" />
            <h2 className="m-0 text-lg font-semibold">Не удалось загрузить</h2>
            <Button large rounded className={focusRing} onClick={() => query.refetch()}>
              Повторить
            </Button>
          </Card>
        ) : friends.length === 0 ? (
          <Card
            component="section"
            outline
            className="m-0 text-center"
            contentWrapPadding="p-6 grid justify-items-center gap-3"
          >
            <Icon name="users" />
            <h2 className="m-0 text-lg font-semibold">Пока нет друзей</h2>
            <p className="m-0 text-sm text-text-muted">Создайте приглашение и отправьте ссылку в Telegram.</p>
          </Card>
        ) : (
          <>
            {accepted.length > 0 ? (
              <List strong inset dividers>
                {accepted.map((row) => (
                  <ListItem
                    key={row.id}
                    media={<Icon name="user-round" className="size-6 text-accent" />}
                    title={peerLabel(row)}
                    subtitle="Друг"
                    after={
                      <Button small tonal className={focusRing} disabled={remove.isPending} onClick={() => setPendingRemove(row)}>
                        Удалить
                      </Button>
                    }
                  />
                ))}
              </List>
            ) : null}
            {pending.length > 0 ? (
              <List strong inset dividers>
                {pending.map((row) => (
                  <ListItem
                    key={row.id}
                    media={<Icon name="clock-3" className="size-6 text-text-muted" />}
                    title={peerLabel(row)}
                    subtitle="Ожидает"
                    after={<Badge>Ожидает</Badge>}
                  />
                ))}
              </List>
            ) : null}
          </>
        )}
      </main>

      <ModalPortal>
        {pendingRemove ? (
          <Sheet
            ref={sheetRef}
            opened
            backdrop
            onBackdropClick={() => !remove.isPending && setPendingRemove(null)}
            className="flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-friend-title"
          >
            <Navbar title="Удалить друга" titleFontSizeIos="17" />
            <div className="grid gap-3 p-4 pb-safe-4">
              <p id="remove-friend-title" className="m-0 text-sm leading-5 text-text-muted">
                {peerLabel(pendingRemove)} больше не увидит расшаренные привычки и тренировки. Ваши данные сохранятся.
              </p>
              <Button
                large
                rounded
                className={`w-full gap-2 ${focusRing}`}
                disabled={remove.isPending}
                aria-busy={remove.isPending || undefined}
                onClick={() => void confirmRemove()}
              >
                {remove.isPending ? <Preloader /> : <Icon name="trash-2" />}
                Удалить и отозвать доступ
              </Button>
              <Button large rounded tonal className={`w-full ${focusRing}`} disabled={remove.isPending} onClick={() => setPendingRemove(null)}>
                Отмена
              </Button>
            </div>
          </Sheet>
        ) : null}
      </ModalPortal>
    </div>
  );
}
