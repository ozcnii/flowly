"use client";

import { Card, Tabbar, TabbarLink, ToolbarPane } from "konsta/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@flowly/ui";
import type { ShellScenario } from "@/lib/scenarios";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";

const telegramSafeArea = {
  "--k-safe-area-left": "var(--component-safe-area-left)",
  "--k-safe-area-right": "var(--component-safe-area-right)",
  "--k-safe-area-bottom": "var(--component-safe-area-bottom)",
} as CSSProperties;

const textEntrySelector = 'input:not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]):not([type="submit"]):not([type="reset"]):not([type="image"]):not([type="hidden"]):not([readonly]):not([disabled]), textarea:not([readonly]):not([disabled]), [contenteditable]:not([contenteditable="false"])';
const isMobileTextEntry = (element: Element | null) => {
  const platform = window.Telegram?.WebApp.platform;
  return Boolean(element?.matches(textEntrySelector) && (["ios", "android", "android_x"].includes(platform ?? "") || matchMedia("(pointer: coarse)").matches));
};

const tabs = [
  ["home", "house", "Главная", "/"],
  ["workouts", "dumbbell", "Йога", "/catalog"],
  ["programs", "sparkles", "Треки", "/programs"],
  ["rhythm", "leaf", "Ритм", "/rhythm"],
  ["calendar", "calendar-days", "Дневник", "/calendar"],
] as const;

type AppShellProps = {
  activeTab: string;
  scenario: ShellScenario;
  showScenario: boolean;
  showTabbar: boolean;
  stateLabel?: string;
  primaryTitle?: string;
  children: ReactNode;
};

export function AppShell({ activeTab, scenario, showScenario, showTabbar, stateLabel, primaryTitle, children }: AppShellProps) {
  const router = useRouter();
  const [textEntryFocused, setTextEntryFocused] = useState(false);
  const hrefById = Object.fromEntries(tabs.map(([id, , , href]) => [id, href]));
  const tabbarVisible = showTabbar && !textEntryFocused;

  useEffect(() => {
    let frame = 0;
    const sync = () => setTextEntryFocused(isMobileTextEntry(document.activeElement));
    const onFocusOut = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(sync); };
    document.addEventListener("focusin", sync);
    document.addEventListener("focusout", onFocusOut);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("focusin", sync); document.removeEventListener("focusout", onFocusOut); };
  }, []);
  return (
    <div className="safe-shell app-shell mx-auto flex min-h-dvh w-full max-w-[75rem] flex-col bg-canvas">
      {scenario === "offline" && <Card component="aside" role="status" contentWrapPadding="p-3 flex items-center gap-3"><Icon name="wifi-off" /><span>Офлайн: серверные изменения пока недоступны</span></Card>}
      {primaryTitle && <PrimaryNavbar title={primaryTitle} userTitle={activeTab === "home"} />}

      <main id="content" className={`app-shell__main flex flex-1 flex-col ${tabbarVisible ? "pb-safe-24" : "pb-safe-4"}`} style={telegramSafeArea}>{children}</main>

      {showScenario && (
        <aside aria-label="Development scenarios" className="mx-4 mb-3 rounded-xl border border-dashed border-border bg-surface px-3 py-2 text-xs text-text-muted">
          Dev scenario: <strong>{stateLabel ?? scenario}</strong>
        </aside>
      )}

      {tabbarVisible && <Tabbar labels icons className="left-0 bottom-0 fixed" style={telegramSafeArea} aria-label="Основная навигация">
        <ToolbarPane>
          {tabs.map(([id, icon, label]) => <TabbarLink key={id} active={id === activeTab} icon={<Icon name={icon} />} label={<span className="text-[9px]">{label}</span>} component="button" linkProps={{ type: "button" }} aria-current={id === activeTab ? "page" : undefined} onClick={() => { if (id !== activeTab) router.push(hrefById[id] ?? "/"); }} />)}
        </ToolbarPane>
      </Tabbar>}
    </div>
  );
}
