import { redirect } from "next/navigation";
import { WelcomeScreen } from "@/features/onboarding/ui/welcome-screen";
import { PreferencesScreen } from "@/features/onboarding/ui/preferences-screen";
import { HabitInviteScreen } from "@/features/onboarding/ui/habit-invite-screen";
import { BotConnectionScreen } from "@/features/onboarding/ui/bot-connection-screen";

export default async function OnboardingStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (step === "welcome") return <WelcomeScreen />;
  if (step === "preferences") return <PreferencesScreen />;
  if (step === "capabilities") return <HabitInviteScreen />;
  if (step === "bot") return <BotConnectionScreen />;
  redirect("/onboarding/welcome" as never);
}
