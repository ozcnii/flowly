"use client";

import { Badge, Button, Card, List, ListItem, Navbar, Preloader, Sheet } from "konsta/react";
import { useRef, useState } from "react";
import { Icon } from "@flowly/ui";
import { ModalPortal } from "@/components/modal-portal";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { ApiError } from "@/lib/api/client";
import { copyInviteLink, inviteBotLink, shareInviteLink } from "@/lib/friends/share-invite";
import {
  useCreateInviteMutation,
  useFriendsQuery,
  useRemoveFriendMutation,
  type FriendRow,
} from "../model/friends-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

function peerLabel(row: FriendRow) {
  if (row.peer) return row.peer.username ? `${row.peer.firstName} (@${row.peer.username})` : row.peer.firstName;
  return row.inviteCode ? `Код ${row.inviteCode}` : "Ссылка";
}

/** S-MA-081 — Friends list / invite share / remove. */
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
  // Open invite links (owner, no peer yet) — not "waiting friend", just unused links.
  const openLinks = friends.filter((f) => f.status === "pending" && !f.peer && f.role === "requester");
  const loading = query.isPending && !query.data;
  const error = query.isError && !query.data;
  const empty = !loading && !error && accepted.length === 0 && openLinks.length === 0;

  const onInvite = async () => {
    setNotice("");
    try {
      const res = await createInvite.mutateAsync();
      setLastLink(res.botDeepLink);
      const mode = shareInviteLink(res.botDeepLink);
      setNotice(
        mode === "share"
          ? "Выберите чат и отправьте ссылку другу."
          : mode === "clipboard"
            ? "Ссылка скопирована — вставьте в чат другу."
            : "Ссылка готова — отправьте другу.",
      );
    } catch (e) {
      setNotice(e instanceof ApiError ? "Не удалось создать приглашение." : "Ошибка сети.");
    }
  };

  const onShareAgain = (code: string) => {
    const link = inviteBotLink(code);
    setLastLink(link);
    const mode = shareInviteLink(link);
    setNotice(mode === "share" ? "Выберите чат и отправьте ссылку другу." : "Ссылка готова.");
  };

  const onCopy = async (code: string) => {
    const link = inviteBotLink(code);
    setLastLink(link);
    setNotice((await copyInviteLink(link)) ? "Ссылка скопирована." : "Скопируйте ссылку вручную ниже.");
  };

  const confirmRemove = async () => {
    if (!pendingRemove) return;
    setNotice("");
    try {
      await remove.mutateAsync(pendingRemove.id);
      setNotice(pendingRemove.peer ? "Связь удалена. Доступ отозван." : "Ссылка отменена.");
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
          {notice || "Ссылка одноразовая, 7 дней. Отправьте её другу — не открывайте сами."}
        </p>
        <Button
          large
          rounded
          className={`w-full gap-2 ${focusRing}`}
          disabled={createInvite.isPending}
          aria-busy={createInvite.isPending || undefined}
          onClick={() => void onInvite()}
        >
          {createInvite.isPending ? <Preloader /> : <Icon name="share-2" />}
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
        ) : empty ? (
          <Card
            component="section"
            outline
            className="m-0 text-center"
            contentWrapPadding="p-6 grid justify-items-center gap-3"
          >
            <Icon name="users" />
            <h2 className="m-0 text-lg font-semibold">Пока нет друзей</h2>
            <p className="m-0 text-sm text-text-muted">Создайте ссылку и отправьте её другу в Telegram.</p>
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
            {openLinks.length > 0 ? (
              <List strong inset dividers>
                {openLinks.map((row) => (
                  <ListItem
                    key={row.id}
                    media={<Icon name="share-2" className="size-6 text-text-muted" />}
                    title={row.inviteCode ? `Код ${row.inviteCode}` : "Ссылка"}
                    subtitle="Не использована — отправьте другу"
                    after={<Badge>Ссылка</Badge>}
                    footer={
                      <div className="flex flex-wrap gap-2 pb-2">
                        <Button small rounded className={focusRing} onClick={() => onShareAgain(row.inviteCode!)}>
                          Отправить
                        </Button>
                        <Button small rounded tonal className={focusRing} onClick={() => void onCopy(row.inviteCode!)}>
                          Копировать
                        </Button>
                        <Button small rounded tonal className={focusRing} disabled={remove.isPending} onClick={() => setPendingRemove(row)}>
                          Отменить
                        </Button>
                      </div>
                    }
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
            <Navbar title={pendingRemove.peer ? "Удалить друга" : "Отменить ссылку"} titleFontSizeIos="17" />
            <div className="grid gap-3 p-4 pb-safe-4">
              <p id="remove-friend-title" className="m-0 text-sm leading-5 text-text-muted">
                {pendingRemove.peer
                  ? `${peerLabel(pendingRemove)} больше не увидит расшаренные данные. Ваши данные сохранятся.`
                  : "Ссылка перестанет работать. Уже принятые друзья не затронуты."}
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
                {pendingRemove.peer ? "Удалить и отозвать доступ" : "Отменить ссылку"}
              </Button>
              <Button large rounded tonal className={`w-full ${focusRing}`} disabled={remove.isPending} onClick={() => setPendingRemove(null)}>
                Назад
              </Button>
            </div>
          </Sheet>
        ) : null}
      </ModalPortal>
    </div>
  );
}
