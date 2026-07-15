"use client";

import { Badge, List, ListItem, Navbar, NavbarBackLink, Preloader } from "konsta/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@flowly/ui";
import { useMeQuery } from "../model/me-queries";

const sections = [
  { icon: "users", label: "Друзья", hint: "Друзья и приглашения" },
  { icon: "flag", label: "Челленджи", hint: "Совместные челленджи" },
  { icon: "heart", label: "Избранное", hint: "Сохранённые тренировки" },
  { icon: "chart-no-axes-column", label: "Отчёты", hint: "Недельные и месячные" },
  { icon: "settings", label: "Настройки", hint: "Имя, часовой пояс, тема и отчёты", to: "/settings" },
  { icon: "bell", label: "Уведомления", hint: "Напоминания и тишина" },
  { icon: "download", label: "Экспорт данных", hint: "Скачать архив" },
  { icon: "trash-2", label: "Удалить аккаунт", hint: "Удаление с периодом восстановления" },
] as const;

export function ProfileHubScreen() {
  const router = useRouter();
  const me = useMeQuery();
  const user = me.data?.user;
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoUrl = user?.photoUrl && !photoFailed ? "/api/v1/me/photo" : null;

  return <div className="min-h-dvh">
    <Navbar title="Профиль" left={<NavbarBackLink aria-label="Назад" onClick={() => router.back()} />} />
    <main className="pb-safe-4">
    <List strong inset dividers aria-label="Профиль пользователя" aria-busy={!user}>
      <ListItem
        media={photoUrl ? <Image src={photoUrl} alt="" width={48} height={48} unoptimized className="size-12 rounded-full object-cover" onError={() => setPhotoFailed(true)} /> : <Icon name="user-round" className="size-10 text-accent" />}
        mediaClassName="!me-3"
        innerClassName="text-left"
        title={user?.firstName ?? "Загружаем профиль"}
        subtitle={user?.username ? `@${user.username}` : undefined}
        after={!user ? <Preloader /> : undefined}
      />
    </List>

    <section aria-label="Разделы профиля">
      <List strong inset dividers>
        {sections.map((section) => <ListItem
          key={section.label}
          link={"to" in section}
          linkComponent={"to" in section ? "button" : undefined}
          linkProps={"to" in section ? { type: "button", onClick: () => router.push(section.to as never) } : undefined}
          contentClassName={"to" in section ? "w-full" : undefined}
          innerClassName={"to" in section ? "text-left" : undefined}
          aria-disabled={"to" in section ? undefined : true}
          media={<Icon name={section.icon} className={`size-6 ${"to" in section ? "text-accent" : "text-text-muted"}`} />}
          title={section.label}
          subtitle={section.hint}
          after={"to" in section ? undefined : <Badge>Скоро</Badge>}
        />)}
      </List>
    </section>
    </main>
  </div>;
}
