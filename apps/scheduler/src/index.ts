import { generateHabitDataForToday } from "./habit-generation";

/**
 * DEC-001: this worker prepares habit reminder_jobs in D1; Telegram delivery is stage 5.
 * The scheduled handler never sends Telegram messages or claims jobs.
 */
export default {
  fetch(request) {
    const { pathname } = new URL(request.url);
    return pathname === "/health"
      ? Response.json({ service: "flowly-scheduler", status: "ok", delivery: "deferred_to_stage_5", generation: "habit_schedule" })
      : new Response("Not Found", { status: 404 });
  },
  scheduled(_controller, env, context) {
    context.waitUntil(generateHabitDataForToday(env.DB));
  },
} satisfies ExportedHandler<CloudflareEnv>;
