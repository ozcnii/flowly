"use client";

import { useEffect } from "react";

const SIDES = ["top", "right", "bottom", "left"] as const;

export function TelegramSafeArea() {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;
    const root = document.documentElement;
    const sync = () => {
      for (const side of SIDES) {
        setInset(root, `--flow-sdk-safe-area-inset-${side}`, webApp.safeAreaInset?.[side]);
        setInset(root, `--flow-sdk-content-safe-area-inset-${side}`, webApp.contentSafeAreaInset?.[side]);
      }
    };
    sync();
    for (const event of ["safeAreaChanged", "contentSafeAreaChanged", "fullscreenChanged", "viewportChanged", "activated"] as const) webApp.onEvent?.(event, sync);
    return () => { for (const event of ["safeAreaChanged", "contentSafeAreaChanged", "fullscreenChanged", "viewportChanged", "activated"] as const) webApp.offEvent?.(event, sync); };
  }, []);
  return null;
}

function setInset(root: HTMLElement, name: string, value: number | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) root.style.setProperty(name, `${Math.max(0, value)}px`);
}
