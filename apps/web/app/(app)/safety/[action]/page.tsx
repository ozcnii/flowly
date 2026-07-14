import { UgcSafetyScreen } from "@/features/ugc-safety/ui/ugc-safety-screen";

type PageProps = {
  params: Promise<{ action: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SafetyPage({ params, searchParams }: PageProps) {
  const [{ action }, query] = await Promise.all([params, searchParams]);
  const forced = typeof query.safety === "string" && ["error", "success"].includes(query.safety) ? query.safety : null;
  return <UgcSafetyScreen action={action} forced={forced as "error" | "success" | null} />;
}
