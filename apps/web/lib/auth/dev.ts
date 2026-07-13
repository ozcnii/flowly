/**
 * Dev-only Telegram user emulation (PRD §10.3). Lets local/test run without real
 * Telegram initData. GUARDED: only active when NODE_ENV !== 'production' AND the
 * explicit FLOWLY_DEV_EMULATION flag is set. Must NEVER be enabled in production.
 */
export function isDevEmulationEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.FLOWLY_DEV_EMULATION === "1";
}
