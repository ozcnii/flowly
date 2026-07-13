import { defineConfig } from "drizzle-kit";

// Local-only: SQL migrations are generated here and applied via
// `wrangler d1 migrations apply flowly-db --local` from apps/web.
// No remote credentials (driver/dbCredentials) — remote/test/prod D1 is out of E1-D1-T04 scope.
export default defineConfig({
  out: "../../migrations",
  schema: "./src/schema.ts",
  dialect: "sqlite",
});
