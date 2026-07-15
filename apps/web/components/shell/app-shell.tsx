"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNavigation, Icon, OfflineBanner } from "@flowly/ui";
import type { ShellScenario } from "@/lib/scenarios";

const tabs = [
  ["home", "house", "Главная", "/"],
  ["workouts", "dumbbell", "Йога", "/catalog"],
  ["programs", "sparkles", "Программы", "/programs"],
  ["rhythm", "leaf", "Ритм", "/rhythm"],
  ["calendar", "calendar-days", "Календарь", "/calendar"],
] as const;

type AppShellProps = {
  activeTab: string;
  scenario: ShellScenario;
  showScenario: boolean;
  stateLabel?: string;
  children: ReactNode;
};

export function AppShell({ activeTab, scenario, showScenario, stateLabel, children }: AppShellProps) {
  const router = useRouter();
  const hrefById = Object.fromEntries(tabs.map(([id, , , href]) => [id, href]));
  return (
    <div className="safe-shell app-shell mx-auto flex min-h-dvh w-full max-w-[75rem] flex-col bg-canvas">
      {scenario === "offline" && <OfflineBanner icon={<Icon name="wifi-off" />}>Офлайн: серверные изменения пока недоступны</OfflineBanner>}

      <main id="content" className="app-shell__main flex flex-1 flex-col" style={{ paddingBottom: "calc(var(--component-nav-height) + var(--component-nav-gap) + var(--component-safe-area-bottom) + var(--primitive-space-4))" }}>{children}</main>

      {showScenario && (
        <aside aria-label="Development scenarios" className="mx-4 mb-3 rounded-xl border border-dashed border-border bg-surface px-3 py-2 text-xs text-text-muted">
          Dev scenario: <strong>{stateLabel ?? scenario}</strong>
        </aside>
      )}

      <BottomNavigation activeId={activeTab} onNavigate={id => router.push(hrefById[id] ?? "/")} items={tabs.map(([id, icon, label, href]) => ({ id, href: href as never, label, icon: <Icon name={icon} /> }))} />
    </div>
  );
}
