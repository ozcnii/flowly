import { homeBase } from "@/features/home/fixtures/base";
import { resolveHomeScenario } from "@/features/home/model/home-scenario";
import { HomeScreen } from "@/features/home/ui/home-screen";
import { WelcomeScreen } from "@/features/onboarding/ui/welcome-screen";
import { PreferencesScreen } from "@/features/onboarding/ui/preferences-screen";
import { HabitInviteScreen } from "@/features/onboarding/ui/habit-invite-screen";
import { BotConnectionScreen } from "@/features/onboarding/ui/bot-connection-screen";
import { DeepLinkRecoveryScreen } from "@/features/recovery/ui/deep-link-recovery-screen";
import { OpenViaTelegramScreen } from "@/features/web-fallback/ui/open-via-telegram-screen";
import { UnavailableDeepLinkScreen } from "@/features/web-fallback/ui/unavailable-deep-link-screen";
import { resolveShellScenario } from "@/lib/scenarios";
import { ShellErrorState } from "@/components/shell/shell-error-state";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const homeScenario = resolveHomeScenario(typeof params.home === "string" ? params.home : undefined);
  const scenario = homeScenario === "offline" ? "offline" : resolveShellScenario(typeof params.scenario === "string" ? params.scenario : undefined);
  if (process.env.NODE_ENV !== "production" && typeof params.onboarding === "string") {
    if (params.onboarding === "welcome") return <WelcomeScreen />;
    if (params.onboarding === "preferences") return <PreferencesScreen />;
    if (params.onboarding === "habit") return <HabitInviteScreen />;
    if (params.onboarding === "bot") return <BotConnectionScreen />;
  }

  if (process.env.NODE_ENV !== "production" && typeof params.recovery === "string") {
    const r = params.recovery;
    if (r === "unavailable" || r === "auth" || r === "permission") {
      return <DeepLinkRecoveryScreen variant={r} />;
    }
    return <DeepLinkRecoveryScreen />;
  }

  if (process.env.NODE_ENV !== "production" && typeof params.web === "string") {
    if (params.web === "open") return <OpenViaTelegramScreen />;
    if (params.web === "unavailable") return <UnavailableDeepLinkScreen />;
  }

  return scenario === "loading" ? (
    <div aria-label="Загрузка оболочки" className="grid gap-4"><div className="shell-skeleton h-9 w-2/3 rounded-full" /><div className="shell-skeleton h-40 rounded-3xl" /><div className="shell-skeleton h-24 rounded-2xl" /></div>
  ) : scenario === "error" ? (
    <ShellErrorState />
  ) : <HomeScreen key={homeScenario} data={homeBase} scenario={homeScenario} />;
}
