"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { ProductOnboardingGuard } from "@/components/onboarding/onboarding-guards";
import { TelegramBackButton } from "@/components/providers/telegram-back-button";
import { AppShell } from "@/components/shell/app-shell";
import { resolveShellScenario } from "@/lib/scenarios";

const activeTabFor = (path: string) => path.startsWith("/catalog") || path.startsWith("/youtube") || path.startsWith("/workouts") || path.startsWith("/sessions") || path.startsWith("/sources") || path.startsWith("/authors") || path.startsWith("/safety") ? "workouts" : path.startsWith("/programs") ? "programs" : path.startsWith("/rhythm") ? "rhythm" : path.startsWith("/calendar") ? "calendar" : "home";
const primaryTitleByPath: Record<string, string> = { "/": "Flowly", "/catalog": "Йога", "/programs": "Программы", "/rhythm": "Ритм", "/calendar": "Календарь" };

export function AppRouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const preview = process.env.NODE_ENV !== "production" && (search.has("onboarding") || search.has("recovery") || search.has("web"));
  if (preview) return <>{children}</>;
  const scenario = resolveShellScenario(search.get("scenario") ?? undefined);
  const tabRoot = Object.hasOwn(primaryTitleByPath, pathname);
  return <AuthGate><ProductOnboardingGuard><TelegramBackButton><AppShell activeTab={activeTabFor(pathname)} scenario={scenario} showScenario={false} showTabbar={tabRoot} primaryTitle={primaryTitleByPath[pathname]}>{children}</AppShell></TelegramBackButton></ProductOnboardingGuard></AuthGate>;
}
