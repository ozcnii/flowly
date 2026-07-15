"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@flowly/ui";
import { useMeQuery } from "@/features/profile/model/me-queries";

function GateLoading() {
  return <div className="safe-shell mx-auto grid min-h-dvh w-full max-w-[30rem] content-center gap-4 px-5" aria-busy="true"><p className="flow-subtitle">Проверяем настройку Flowly…</p><Skeleton height="hero" /><Skeleton height="card" /></div>;
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
