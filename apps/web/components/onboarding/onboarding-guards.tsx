"use client";

import { Preloader } from "konsta/react";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMeQuery } from "@/features/profile/model/me-queries";

function GateLoading() {
  return (
    <div className="safe-shell grid min-h-dvh w-full place-items-center bg-canvas" role="status" aria-live="polite">
      <Preloader />
      <span className="sr-only">Проверяем настройку Flowly</span>
    </div>
  );
}

/** Invite accept must work before onboarding (otherwise deep link is lost). */
const isInviteAcceptPath = (path: string) => path.startsWith("/friends/invite/");

export function ProductOnboardingGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const me = useMeQuery();
  const complete = me.data?.user.onboardingCompleted;
  const invite = isInviteAcceptPath(pathname);
  useEffect(() => {
    if (invite) return;
    if (complete === false) router.replace("/onboarding/welcome" as never);
  }, [complete, router, invite]);
  if (invite) return <>{children}</>;
  return complete ? <>{children}</> : <GateLoading />;
}

export function OnboardingRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const me = useMeQuery();
  const complete = me.data?.user.onboardingCompleted;
  useEffect(() => {
    if (complete) router.replace("/" as never);
  }, [complete, router]);
  return complete === false ? <>{children}</> : <GateLoading />;
}
