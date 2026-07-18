/**
 * DEC-001: stage 3 creates reminder_jobs in D1; Telegram delivery is stage 5.
 * Cron remains a no-op send path until E5 wires pending jobs → bot.
 */
export default {
  fetch(request) {
    const { pathname } = new URL(request.url);
    return pathname === "/health"
      ? Response.json({ service: "flowly-scheduler", status: "ok", delivery: "deferred_to_stage_5" })
      : new Response("Not Found", { status: 404 });
  },
  scheduled(_controller, _env, context) {
    // No Telegram send here (DEC-001). Stage 5 will claim pending reminder_jobs.
    context.waitUntil(Promise.resolve());
  },
} satisfies ExportedHandler;
