export const homeScenarios = ["base", "loading", "empty", "offline", "resume"] as const;
export type HomeScenario = (typeof homeScenarios)[number];

export function resolveHomeScenario(value?: string): HomeScenario {
  if (process.env.NODE_ENV === "production") return "base";
  return homeScenarios.includes(value as HomeScenario) ? value as HomeScenario : "base";
}
