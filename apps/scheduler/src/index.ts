import { generateHabitDataForToday } from "./habit-generation";
import { processDueReminderJobs } from "./delivery";
import { closeNoResponseForYesterday } from "./no-response";

type Env = {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_MODE?: string;
  FLOWLY_WEB_URL?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
};

/**
 * Stage 5: habit generation + delivery batch=50 + no_response day close.
 */
export default {
  fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/health") {
      return Response.json({
        service: "flowly-scheduler",
        status: "ok",
        delivery: "enabled",
        generation: "habit_schedule",
        mode: env.TELEGRAM_MODE ?? "production",
      });
    }
    return new Response("Not Found", { status: 404 });
  },
  scheduled(_controller: ScheduledController, env: Env, context: ExecutionContext) {
    context.waitUntil(
      (async () => {
        await generateHabitDataForToday(env.DB);
        await processDueReminderJobs(env);
        await closeNoResponseForYesterday(env.DB);
      })(),
    );
  },
};
