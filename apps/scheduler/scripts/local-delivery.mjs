import { getPlatformProxy } from "wrangler";
import { processDueReminderJobs } from "../src/delivery.ts";

const { env, dispose } = await getPlatformProxy({ configPath: new URL("../wrangler.jsonc", import.meta.url).pathname });
try {
  const r = await processDueReminderJobs({
    ...env,
    TELEGRAM_MODE: "mock",
    FLOWLY_WEB_URL: "http://localhost:3002",
  });
  console.log(JSON.stringify({ DELIVERY: r }));
} finally {
  await dispose();
}
