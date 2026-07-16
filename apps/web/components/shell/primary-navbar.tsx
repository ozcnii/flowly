"use client";

import { Navbar } from "konsta/react";
import { useSyncExternalStore, type CSSProperties } from "react";
import { useMeQuery } from "@/features/profile/model/me-queries";

export const rootNavbarStyle = { "--k-safe-area-top": "max(44px,var(--component-safe-area-top))" } as CSSProperties;
const MOBILE_PLATFORMS = new Set(["ios", "android", "android_x"]);
const subscribePlatform = () => () => {};
const mobilePlatform = () => MOBILE_PLATFORMS.has(window.Telegram?.WebApp?.platform ?? "");
export const useMobileTelegramPlatform = () => useSyncExternalStore(subscribePlatform, mobilePlatform, () => false);

export function SafeAreaTitleNavbar({ title, className = "" }: { title: string; className?: string }) {
  return <Navbar className={`primary-navbar !top-0 ${className}`} style={rootNavbarStyle} innerClassName="!h-0" titleClassName="!fixed !top-[calc(max(44px,var(--component-safe-area-top))-1.375rem)]" title={title} />;
}

export function PrimaryNavbar({ title, userTitle = false }: { title: string; userTitle?: boolean }) {
  const me = useMeQuery();
  const visible = useMobileTelegramPlatform();
  return visible ? <SafeAreaTitleNavbar className="-mt-[var(--component-safe-area-top)]" title={userTitle ? me.data?.user.firstName ?? "" : title} /> : null;
}
