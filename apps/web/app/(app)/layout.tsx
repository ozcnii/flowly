import type { ReactNode } from "react";
import { AppRouteShell } from "@/components/shell/app-route-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppRouteShell>{children}</AppRouteShell>;
}
