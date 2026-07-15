"use client";

import { Button, Navbar } from "konsta/react";
import NextLink from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@flowly/ui";
import { useMeQuery } from "@/features/profile/model/me-queries";

export const rootNavbarClassName = "!top-0 -mt-[var(--component-safe-area-top)]";
export const rootNavbarStyle = { "--k-safe-area-top": "var(--component-safe-area-top)" } as CSSProperties;
const actionClass = "h-11 w-11 min-w-11 p-0";

export function PrimaryNavbar({ title, userTitle = false }: { title: string; userTitle?: boolean }) {
  const me = useMeQuery();
  const settings = <Button component={NextLink} href="/settings" clear rounded className={actionClass} aria-label="Открыть настройки"><Icon name="settings" /></Button>;
  const profile = <Button component={NextLink} href="/profile" clear rounded className={actionClass} aria-label="Открыть профиль"><Icon name="user-round" /></Button>;
  return <Navbar className={`primary-navbar ${rootNavbarClassName}`} style={rootNavbarStyle} titleClassName="!fixed !top-[calc(var(--component-safe-area-top)-1.375rem)]" title={userTitle ? me.data?.user.firstName ?? "" : title} left={settings} right={profile} />;
}
