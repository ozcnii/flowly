export const shellScenarios = ["ready", "loading", "error", "offline"] as const;
export type ShellScenario = (typeof shellScenarios)[number];

export function resolveShellScenario(value?: string): ShellScenario {
  if (process.env.NODE_ENV === "production") return "ready";
  return shellScenarios.includes(value as ShellScenario) ? (value as ShellScenario) : "ready";
}
