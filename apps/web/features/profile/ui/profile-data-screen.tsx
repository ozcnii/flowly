"use client";

import { useState } from "react";
import { Badge, Block, BlockFooter, Button, List, ListItem, Navbar, Page, Preloader, Sheet } from "konsta/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { apiJson, jsonBody } from "@/lib/api/client";
import { meKey, useMeQuery } from "../model/me-queries";

type ConfirmKind = "clear" | "delete" | null;

export function ProfileDataScreen() {
  const router = useRouter();
  const me = useMeQuery();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [exportReady, setExportReady] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportMut = useMutation({
    mutationFn: () => apiJson<{ sizeBytes: number; export: unknown }>("/api/v1/me/export", { method: "POST", body: jsonBody({}) }),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data.export, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flowly-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportReady(`${Math.round(data.sizeBytes / 1024)} КБ`);
      setError(null);
    },
    onError: () => setError("Не удалось создать экспорт"),
  });

  const clearMut = useMutation({
    mutationFn: () => apiJson<{ removedOccurrences: number }>("/api/v1/me/clear-history", { method: "POST", body: jsonBody({}) }),
    onSuccess: () => {
      setConfirm(null);
      setError(null);
      void qc.invalidateQueries({ queryKey: meKey });
    },
    onError: () => setError("Не удалось очистить историю"),
  });

  const deleteMut = useMutation({
    mutationFn: () => apiJson<{ purgeAt: string }>("/api/v1/me/deletion", { method: "POST", body: jsonBody({}) }),
    onSuccess: () => {
      setConfirm(null);
      void qc.invalidateQueries({ queryKey: meKey });
      router.replace("/");
    },
    onError: () => setError("Не удалось запросить удаление"),
  });

  const cancelMut = useMutation({
    mutationFn: () => apiJson<{ ok: boolean }>("/api/v1/me/deletion", { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: meKey });
      setError(null);
    },
    onError: () => setError("Нельзя отменить удаление"),
  });

  const user = me.data?.user;
  const grace = Boolean(user?.deletedAt);
  const busy = exportMut.isPending || clearMut.isPending || deleteMut.isPending || cancelMut.isPending;

  return (
    <div className="min-h-dvh">
      <PrimaryNavbar title="Данные" />
      <main className="pb-safe-4">
        <Block className="!my-4">
          <p className="m-0 text-[15px] leading-snug text-text-muted">Экспорт, очистка истории и удаление аккаунта. Объекты и настройки при очистке истории сохраняются.</p>
        </Block>

        {grace ? (
          <List strong inset dividers>
            <ListItem
              title="Удаление запланировано"
              subtitle={user?.deletionPurgeAt ? `Окончательно после ${new Date(user.deletionPurgeAt).toLocaleString("ru-RU")}` : "Период 7 дней"}
              after={<Badge className="bg-amber-500/20 text-amber-700">Grace</Badge>}
            />
            <ListItem
              link
              linkComponent="button"
              contentClassName="w-full"
              innerClassName="text-left"
              title="Отменить удаление"
              subtitle="Восстановить доступ (или войдите снова через Telegram)"
              linkProps={{ type: "button", onClick: () => cancelMut.mutate(), disabled: busy }}
            />
          </List>
        ) : (
          <List strong inset dividers>
            <ListItem
              link
              linkComponent="button"
              contentClassName="w-full"
              innerClassName="text-left"
              media={<Icon name="download" className="size-6 text-accent" />}
              title="Экспорт JSON"
              subtitle={exportReady ? `Готово · ${exportReady}` : "Профиль, привычки, история, друзья…"}
              after={exportMut.isPending ? <Preloader /> : undefined}
              linkProps={{ type: "button", onClick: () => exportMut.mutate(), disabled: busy }}
            />
            <ListItem
              link
              linkComponent="button"
              contentClassName="w-full"
              innerClassName="text-left"
              media={<Icon name="refresh-cw" className="size-6 text-accent" />}
              title="Очистить историю"
              subtitle="Удалит выполнения и сессии, сохранит привычки"
              linkProps={{ type: "button", onClick: () => setConfirm("clear"), disabled: busy }}
            />
            <ListItem
              link
              linkComponent="button"
              contentClassName="w-full"
              innerClassName="text-left"
              media={<Icon name="trash-2" className="size-6 text-red-500" />}
              title="Удалить аккаунт"
              subtitle="7 дней на отмену через повторный вход"
              linkProps={{ type: "button", onClick: () => setConfirm("delete"), disabled: busy }}
            />
          </List>
        )}

        {error ? <BlockFooter className="!text-red-500">{error}</BlockFooter> : null}
        {exportReady && !error ? <BlockFooter>Файл скачан. Бот отправил уведомление, если доступен.</BlockFooter> : null}

        <Sheet opened={confirm !== null} onBackdropClick={() => !busy && setConfirm(null)}>
          <Page>
            <Navbar title={confirm === "delete" ? "Удалить аккаунт?" : "Очистить историю?"} />
            <Block className="space-y-3">
              <p className="m-0 text-[15px] leading-snug">
                {confirm === "delete"
                  ? "Сессии и напоминания отключатся сразу. В течение 7 дней можно отменить удаление, войдя снова. После срока данные обезличатся."
                  : "Будут удалены выполнения, история статусов и сессии тренировок. Привычки, настройки и аккаунт останутся."}
              </p>
              <Button large rounded className="gap-2" disabled={busy} onClick={() => (confirm === "delete" ? deleteMut.mutate() : clearMut.mutate())}>
                {busy ? <Preloader /> : null}
                {confirm === "delete" ? "Удалить на 7 дней" : "Очистить"}
              </Button>
              <Button large rounded clear disabled={busy} onClick={() => setConfirm(null)}>
                Отмена
              </Button>
            </Block>
          </Page>
        </Sheet>
      </main>
    </div>
  );
}
