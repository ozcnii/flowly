import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Dev-only Telegram user emulation (PRD §10.3). Lets local/test run without real
 * Telegram initData. GUARDED: only active when NODE_ENV !== 'production' AND the
 * explicit FLOWLY_DEV_EMULATION flag is set. Must NEVER be enabled in production.
 */
export function isDevEmulationEnabled(): boolean {
  let flag = process.env.FLOWLY_DEV_EMULATION;
  try {
    flag ||= (getCloudflareContext().env as { FLOWLY_DEV_EMULATION?: string }).FLOWLY_DEV_EMULATION;
  } catch {
    // No request Cloudflare context: fall back to process.env only.
  }
  return process.env.NODE_ENV !== "production" && flag === "1";
}
