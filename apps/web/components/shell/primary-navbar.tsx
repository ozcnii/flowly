"use client";

import { Navbar } from "konsta/react";
import { useSyncExternalStore, type CSSProperties } from "react";
import { useMeQuery } from "@/features/profile/model/me-queries";

export const rootNavbarClassName = "!top-0 -mt-[var(--component-safe-area-top)]";
export const rootNavbarStyle = { "--k-safe-area-top": "max(44px,var(--component-safe-area-top))" } as CSSProperties;
const MOBILE_PLATFORMS = new Set(["ios", "android", "android_x"]);
const subscribePlatform = () => () => {};
const mobilePlatform = () => MOBILE_PLATFORMS.has(window.Telegram?.WebApp?.platform ?? "");

export function PrimaryNavbar({ title, userTitle = false }: { title: string; userTitle?: boolean }) {
  const me = useMeQuery();
  const visible = useSyncExternalStore(subscribePlatform, mobilePlatform, () => false);
  return visible ? <Navbar className={`primary-navbar ${rootNavbarClassName}`} style={rootNavbarStyle} innerClassName="!h-0" titleClassName="!fixed !top-[calc(max(44px,var(--component-safe-area-top))-1.375rem)]" title={userTitle ? me.data?.user.firstName ?? "" : title} /> : null;
}
