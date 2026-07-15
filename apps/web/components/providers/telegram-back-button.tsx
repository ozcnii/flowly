"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const TOP_LEVEL_ROUTES = new Set(["/", "/catalog", "/programs", "/rhythm", "/calendar"]);

export function TelegramBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const backButton = window.Telegram?.WebApp?.BackButton;
    if (!backButton) return;
    if (TOP_LEVEL_ROUTES.has(pathname)) {
      backButton.hide();
      return;
    }
    const back = () => router.back();
    backButton.onClick(back).show();
    return () => { backButton.offClick(back).hide(); };
  }, [pathname, router]);

  return null;
}
