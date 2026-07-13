export default {
  fetch(request) {
    const { pathname } = new URL(request.url);
    return pathname === "/health"
      ? Response.json({ service: "flowly-scheduler", status: "ok" })
      : new Response("Not Found", { status: 404 });
  },
  scheduled(_controller, _env, context) {
    context.waitUntil(Promise.resolve());
  },
} satisfies ExportedHandler;
