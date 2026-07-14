import Link from "next/link";
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
    <section role="alert" className="flow-card m-auto max-w-md text-center"><h1 className="flow-title">Не удалось открыть Flowly</h1><p className="flow-subtitle">Повторите загрузку оболочки. Личные данные не отображаются до успешной проверки.</p><LinkButton /></section>
  ) : <HomeScreen key={homeScenario} data={homeBase} scenario={homeScenario} />;
}

function LinkButton() {
  return <Link href="/?scenario=ready" className="mx-auto inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-semibold text-on-accent no-underline">Повторить</Link>;
}
