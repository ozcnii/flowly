import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";
import { AuthGate } from "@/components/auth/auth-gate";
import { homeBase } from "@/features/home/fixtures/base";
import { resolveHomeScenario } from "@/features/home/model/home-scenario";
import { HomeScreen } from "@/features/home/ui/home-screen";
import { WelcomeScreen } from "@/features/onboarding/ui/welcome-screen";
import { PreferencesScreen } from "@/features/onboarding/ui/preferences-screen";
import { resolveShellScenario } from "@/lib/scenarios";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const homeScenario = resolveHomeScenario(typeof params.home === "string" ? params.home : undefined);
  const scenario = homeScenario === "offline" ? "offline" : resolveShellScenario(typeof params.scenario === "string" ? params.scenario : undefined);
  const activeTab = typeof params.tab === "string" ? params.tab : "home";

  if (process.env.NODE_ENV !== "production" && typeof params.onboarding === "string") {
    if (params.onboarding === "welcome") return <WelcomeScreen />;
    if (params.onboarding === "preferences") return <PreferencesScreen />;
  }

  return (
    <AuthGate>
    <AppShell activeTab={activeTab} scenario={scenario} stateLabel={`home:${homeScenario}`} showScenario={process.env.NODE_ENV !== "production"}>
      {scenario === "loading" ? (
        <div aria-label="Загрузка оболочки" className="grid gap-4"><div className="shell-skeleton h-9 w-2/3 rounded-full" /><div className="shell-skeleton h-40 rounded-3xl" /><div className="shell-skeleton h-24 rounded-2xl" /></div>
      ) : scenario === "error" ? (
        <section role="alert" className="m-auto grid max-w-md gap-4 rounded-3xl border border-border bg-surface p-6 text-center"><h1 className="font-display text-3xl font-semibold">Не удалось открыть Flowly</h1><p className="text-text-muted">Повторите загрузку оболочки. Личные данные не отображаются до успешной проверки.</p><LinkButton /></section>
      ) : <HomeScreen key={homeScenario} data={homeBase} scenario={homeScenario} />}
    </AppShell>
    </AuthGate>
  );
}

function LinkButton() {
  return <Link href="/?scenario=ready" className="mx-auto inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-semibold text-on-accent no-underline">Повторить</Link>;
}
