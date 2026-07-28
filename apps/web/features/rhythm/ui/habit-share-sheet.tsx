"use client";

import { Button, List, ListItem, Navbar, Preloader, Sheet, Toggle } from "konsta/react";
import { useMemo, useState, type RefObject } from "react";
import { Icon } from "@flowly/ui";
import { useFriendsQuery } from "@/features/friends/model/friends-queries";
import {
  useHabitSharesQuery,
  useRevokeHabitShareMutation,
  useShareHabitMutation,
} from "../model/habits-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

type Draft = { on: boolean; showStreak: boolean; showHistory: boolean };

/** S-MA-084 — share habit with accepted friends; toggles streak/history; revoke. */
export function HabitShareSheet({
  habitId,
  habitTitle,
  sheetRef,
  onClose,
}: {
  habitId: string;
  habitTitle: string;
  sheetRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const friends = useFriendsQuery();
  const shares = useHabitSharesQuery(habitId);
  const shareMut = useShareHabitMutation(habitId);
  const revokeMut = useRevokeHabitShareMutation(habitId);
  const [notice, setNotice] = useState("");
  const [override, setOverride] = useState<Record<string, Draft>>({});

  const accepted = (friends.data?.friends ?? []).filter((f) => f.status === "accepted" && f.peer);
  const shareMap = useMemo(
    () => new Map((shares.data?.shares ?? []).map((s) => [s.userId, s])),
    [shares.data],
  );

  const draftFor = (peerId: string): Draft => {
    if (override[peerId]) return override[peerId]!;
    const s = shareMap.get(peerId);
    return { on: Boolean(s), showStreak: s?.showStreak ?? false, showHistory: s?.showHistory ?? false };
  };

  const busy = shareMut.isPending || revokeMut.isPending;

  const apply = async (peerId: string, next: Draft) => {
    setNotice("");
    setOverride((d) => ({ ...d, [peerId]: next }));
    try {
      if (!next.on) await revokeMut.mutateAsync(peerId);
      else await shareMut.mutateAsync({ userId: peerId, showStreak: next.showStreak, showHistory: next.showHistory });
      setNotice(next.on ? "Доступ обновлён." : "Доступ отозван.");
      setOverride((d) => {
        const copy = { ...d };
        delete copy[peerId];
        return copy;
      });
    } catch {
      setNotice("Не удалось сохранить.");
      setOverride((d) => {
        const copy = { ...d };
        delete copy[peerId];
        return copy;
      });
      void shares.refetch();
    }
  };

  return (
    <Sheet
      ref={sheetRef}
      opened
      backdrop
      onBackdropClick={() => !busy && onClose()}
      className="flex max-h-[88dvh] max-w-full flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-share-title"
    >
      <Navbar
        title={<span id="habit-share-title">Поделиться</span>}
        right={
          <Button clear className={focusRing} onClick={onClose}>
            Готово
          </Button>
        }
      />
      <div className="grid gap-3 overflow-y-auto px-4 pb-safe-6 pt-2">
        <p className="m-0 text-sm leading-relaxed text-text-muted">
          «{habitTitle}» — только друзья. По умолчанию видят название, иконку и расписание. Серию и историю включайте
          отдельно.
        </p>
        <p className="m-0 min-h-5 text-xs text-text-muted" aria-live="polite">
          {notice}
        </p>
        {friends.isPending || shares.isPending ? (
          <div className="grid min-h-24 place-items-center">
            <Preloader />
          </div>
        ) : accepted.length === 0 ? (
          <p className="m-0 text-sm text-text-muted">Сначала добавьте друзей в Профиль → Друзья.</p>
        ) : (
          <List strong inset dividers className="!m-0">
            {accepted.map((f) => {
              const peer = f.peer!;
              const state = draftFor(peer.id);
              const label = peer.username ? `${peer.firstName} (@${peer.username})` : peer.firstName;
              return (
                <ListItem
                  key={peer.id}
                  title={label}
                  subtitle={state.on ? "Доступ открыт" : "Нет доступа"}
                  after={
                    <Toggle
                      checked={state.on}
                      disabled={busy}
                      onChange={() => void apply(peer.id, { ...state, on: !state.on })}
                    />
                  }
                  footer={
                    state.on ? (
                      <div className="grid gap-2 pb-2">
                        <ListItem
                          title="Показывать серию"
                          after={
                            <Toggle
                              checked={state.showStreak}
                              disabled={busy}
                              onChange={() => void apply(peer.id, { ...state, showStreak: !state.showStreak })}
                            />
                          }
                        />
                        <ListItem
                          title="Показывать историю"
                          after={
                            <Toggle
                              checked={state.showHistory}
                              disabled={busy}
                              onChange={() => void apply(peer.id, { ...state, showHistory: !state.showHistory })}
                            />
                          }
                        />
                      </div>
                    ) : undefined
                  }
                />
              );
            })}
          </List>
        )}
        {(shareMut.isError || revokeMut.isError) && (
          <p className="m-0 text-sm text-danger" role="alert">
            <Icon name="triangle-alert" className="inline size-4" /> Ошибка сохранения
          </p>
        )}
      </div>
    </Sheet>
  );
}
