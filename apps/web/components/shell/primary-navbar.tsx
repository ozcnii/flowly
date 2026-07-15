"use client";

import { Navbar } from "konsta/react";
import type { CSSProperties } from "react";
import { useMeQuery } from "@/features/profile/model/me-queries";

export const rootNavbarClassName = "!top-0 -mt-[var(--component-safe-area-top)]";
export const rootNavbarStyle = { "--k-safe-area-top": "var(--component-safe-area-top)" } as CSSProperties;

export function PrimaryNavbar({ title, userTitle = false }: { title: string; userTitle?: boolean }) {
  const me = useMeQuery();
  return <Navbar className={`primary-navbar ${rootNavbarClassName}`} style={rootNavbarStyle} innerClassName="!h-0" titleClassName="!fixed !top-[calc(var(--component-safe-area-top)-1.375rem)]" title={userTitle ? me.data?.user.firstName ?? "" : title} />;
}
