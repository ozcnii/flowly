"use client";

import { Card, Tabbar, TabbarLink, ToolbarPane } from "konsta/react";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@flowly/ui";
import type { ShellScenario } from "@/lib/scenarios";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";

const telegramSafeArea = {
  "--k-safe-area-left": "var(--component-safe-area-left)",
  "--k-safe-area-right": "var(--component-safe-area-right)",
  "--k-safe-area-bottom": "var(--component-safe-area-bottom)",
} as CSSProperties;

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
  stateLabel?: string;
  primaryTitle?: string;
  children: ReactNode;
};

export function AppShell({ activeTab, scenario, showScenario, stateLabel, primaryTitle, children }: AppShellProps) {
  const router = useRouter();
  const hrefById = Object.fromEntries(tabs.map(([id, , , href]) => [id, href]));
  return (
    <div className="safe-shell app-shell mx-auto flex min-h-dvh w-full max-w-[75rem] flex-col bg-canvas">
      {scenario === "offline" && <Card component="aside" role="status" contentWrapPadding="p-3 flex items-center gap-3"><Icon name="wifi-off" /><span>Офлайн: серверные изменения пока недоступны</span></Card>}
      {primaryTitle && <PrimaryNavbar title={primaryTitle} userTitle={activeTab === "home"} />}

      <main id="content" className="app-shell__main flex flex-1 flex-col pb-safe-24" style={telegramSafeArea}>{children}</main>

      {showScenario && (
        <aside aria-label="Development scenarios" className="mx-4 mb-3 rounded-xl border border-dashed border-border bg-surface px-3 py-2 text-xs text-text-muted">
          Dev scenario: <strong>{stateLabel ?? scenario}</strong>
        </aside>
      )}

      <Tabbar labels icons className="left-0 bottom-0 fixed" style={telegramSafeArea} aria-label="Основная навигация">
        <ToolbarPane>
          {tabs.map(([id, icon, label]) => <TabbarLink key={id} active={id === activeTab} icon={<Icon name={icon} />} label={<span className="text-[11px]">{label}</span>} component="button" linkProps={{ type: "button" }} aria-current={id === activeTab ? "page" : undefined} onClick={() => router.push(hrefById[id] ?? "/")} />)}
        </ToolbarPane>
      </Tabbar>
    </div>
  );
}
