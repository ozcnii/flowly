"use client";

import { KonstaProvider as Provider } from "konsta/react";
import { useEffect, useState, type ReactNode } from "react";

const resolveTheme = () => {
  const forced = process.env.NODE_ENV !== "production" ? new URLSearchParams(location.search).get("theme") : null;
  if (forced === "light" || forced === "dark") return forced;
  const saved = localStorage.getItem("flowly-theme");
  if (saved === "light" || saved === "dark") return saved;
  const telegram = window.Telegram?.WebApp;
  return telegram?.initData && telegram.colorScheme ? telegram.colorScheme : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export function KonstaProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const telegram = window.Telegram?.WebApp;
    const sync = () => {
      const theme = resolveTheme();
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle("dark", theme === "dark");
      setDark(theme === "dark");
    };
    sync();
    media.addEventListener("change", sync);
    telegram?.onEvent?.("themeChanged", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("flowly-theme-change", sync);
    return () => {
      media.removeEventListener("change", sync);
      telegram?.offEvent?.("themeChanged", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("flowly-theme-change", sync);
    };
  }, []);

  return <Provider theme="ios" dark={dark} iosHoverHighlight>{children}</Provider>;
}
