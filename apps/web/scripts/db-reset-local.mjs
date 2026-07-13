import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// Drops the local (miniflare) D1 state for apps/web and re-applies all migrations.
// Local-only: never touches test/production databases.
const here = dirname(fileURLToPath(import.meta.url)); // apps/web/scripts
const webRoot = resolve(here, "..");
const d1State = resolve(webRoot, ".wrangler/state/v3/d1");

rmSync(d1State, { recursive: true, force: true });
console.log(`[db:reset] cleared local D1 state: ${d1State}`);

const result = spawnSync(
  "npx",
  ["wrangler", "d1", "migrations", "apply", "flowly-db", "--local"],
  { cwd: webRoot, stdio: "inherit", shell: process.platform === "win32" },
);

process.exit(result.status ?? 1);
