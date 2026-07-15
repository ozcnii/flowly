"use client";

import { Preloader } from "konsta/react";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/features/profile/model/me-queries";

function GateLoading() {
  return <div className="safe-shell grid min-h-dvh w-full place-items-center bg-canvas" role="status" aria-live="polite"><Preloader /><span className="sr-only">Проверяем настройку Flowly</span></div>;
}

export function ProductOnboardingGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const me = useMeQuery();
  const complete = me.data?.user.onboardingCompleted;
  useEffect(() => { if (complete === false) router.replace("/onboarding/welcome" as never); }, [complete, router]);
  return complete ? <>{children}</> : <GateLoading />;
}

export function OnboardingRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const me = useMeQuery();
  const complete = me.data?.user.onboardingCompleted;
  useEffect(() => { if (complete) router.replace("/" as never); }, [complete, router]);
  return complete === false ? <>{children}</> : <GateLoading />;
}
