import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BottomNavigation, Icon, OfflineBanner } from "@flowly/ui";
import type { ShellScenario } from "@/lib/scenarios";

const tabs = [
  ["home", "house", "Главная", "/?tab=home"],
  ["workouts", "dumbbell", "Тренировки", "/?tab=workouts"],
  ["programs", "sparkles", "Программы", "/?tab=programs"],
  ["rhythm", "leaf", "Мой ритм", "/?tab=rhythm"],
  ["calendar", "calendar-days", "Календарь", "/?tab=calendar"],
] as const;

type AppShellProps = {
  activeTab: string;
  scenario: ShellScenario;
  showScenario: boolean;
  stateLabel?: string;
  immersive?: boolean;
  children: ReactNode;
};

export function AppShell({ activeTab, scenario, showScenario, stateLabel, immersive = false, children }: AppShellProps) {
  return (
    <div className="safe-shell mx-auto flex min-h-dvh w-full max-w-[75rem] flex-col bg-canvas">
      {!immersive && <header className="flex min-h-18 items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
        <Link href="/?tab=home" className="flex min-h-11 items-center gap-3 rounded-full font-semibold no-underline">
          <Image src="/brand/flowly-icon.svg" alt="" width={44} height={44} priority />
          <span>Flowly</span>
        </Link>
        <Link href="/?screen=profile" aria-label="Открыть профиль" className="grid size-11 place-items-center rounded-full border border-border bg-surface font-semibold no-underline">А</Link>
      </header>}

      {scenario === "offline" && <OfflineBanner icon={<Icon name="wifi-off" />}>Офлайн: серверные изменения пока недоступны</OfflineBanner>}

      <main id="content" className={immersive ? "flex flex-1 flex-col" : "flex flex-1 flex-col px-4 py-6 sm:px-6"}>{children}</main>

      {showScenario && (
        <aside aria-label="Development scenarios" className="mx-4 mb-3 rounded-xl border border-dashed border-border bg-surface px-3 py-2 text-xs text-text-muted">
          Dev scenario: <strong>{stateLabel ?? scenario}</strong>
        </aside>
      )}

      <BottomNavigation className="sticky bottom-0 z-10" activeId={activeTab} items={tabs.map(([id, icon, label, href]) => ({ id, href, label, icon: <Icon name={icon} /> }))} />
    </div>
  );
}
