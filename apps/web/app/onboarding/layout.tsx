import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { OnboardingRouteGuard } from "@/components/onboarding/onboarding-guards";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <AuthGate><OnboardingRouteGuard>{children}</OnboardingRouteGuard></AuthGate>;
}
