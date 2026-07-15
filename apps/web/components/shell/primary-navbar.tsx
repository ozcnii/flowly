"use client";

import { Button, Navbar } from "konsta/react";
import Image from "next/image";
import NextLink from "next/link";
import { useState } from "react";
import { Icon } from "@flowly/ui";
import { useMeQuery } from "@/features/profile/model/me-queries";

const actionClass = "h-11 w-11 min-w-11 p-0";

export function PrimaryNavbar({ title, userTitle = false }: { title: string; userTitle?: boolean }) {
  const me = useMeQuery();
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoUrl = me.data?.user.photoUrl && !photoFailed ? "/api/v1/me/photo" : null;
  const settings = <Button component={NextLink} href="/settings" clear rounded className={actionClass} aria-label="Открыть настройки"><Icon name="settings" /></Button>;
  const profile = <Button component={NextLink} href="/profile" clear rounded className={actionClass} aria-label="Открыть профиль">{photoUrl ? <Image src={photoUrl} alt="" width={44} height={44} unoptimized className="h-11 w-11 rounded-full object-cover" onError={() => setPhotoFailed(true)} /> : <Icon name="user-round" />}</Button>;
  return <Navbar title={userTitle ? me.data?.user.firstName ?? "" : title} left={settings} right={profile} />;
}
