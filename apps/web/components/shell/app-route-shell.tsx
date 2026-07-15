"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { ProductOnboardingGuard } from "@/components/onboarding/onboarding-guards";
import { AppShell } from "@/components/shell/app-shell";
import { resolveShellScenario } from "@/lib/scenarios";

const activeTabFor = (path: string) => path.startsWith("/catalog") || path.startsWith("/youtube") || path.startsWith("/workouts") || path.startsWith("/authors") || path.startsWith("/safety") ? "workouts" : path.startsWith("/programs") ? "programs" : path.startsWith("/rhythm") ? "rhythm" : path.startsWith("/calendar") ? "calendar" : "home";

export function AppRouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const preview = process.env.NODE_ENV !== "production" && (search.has("onboarding") || search.has("recovery") || search.has("web"));
  if (preview) return <>{children}</>;
  const scenario = resolveShellScenario(search.get("scenario") ?? undefined);
  return <AuthGate><ProductOnboardingGuard><AppShell activeTab={activeTabFor(pathname)} scenario={scenario} showScenario={false}>{children}</AppShell></ProductOnboardingGuard></AuthGate>;
}
