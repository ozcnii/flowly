import { nowIso } from "@flowly/core";
import { schema } from "@flowly/database";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { audit, rejectOversizedBody } from "@/lib/auth/http";
import { getDb, getWebhookSecret } from "@/lib/cloudflare";
import { handleCallbackQuery } from "@/lib/telegram/callbacks";
import { handleBotCommand } from "@/lib/telegram/commands";

const updateSchema = z
  .object({
    update_id: z.number().int().safe(),
    message: z
      .object({
        chat: z.object({ id: z.union([z.number(), z.string()]) }).passthrough().optional(),
        text: z.string().optional(),
      })
      .passthrough()
      .optional(),
    callback_query: z
      .object({
        id: z.string(),
        data: z.string().optional(),
        from: z.object({ id: z.number().int() }).passthrough().optional(),
        message: z
          .object({
            message_id: z.number().int().optional(),
            chat: z.object({ id: z.union([z.number(), z.string()]) }).passthrough().optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

type ResultStatus = "ok" | "ignored" | "error";

const ok = (extra: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...extra });

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function GET() {
  return ok({ webhook: "flowly" });
}

export async function POST(request: Request) {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const secret = getWebhookSecret();
  if (!secret) {
    audit("telegram.webhook.misconfigured");
    return NextResponse.json({ error: "misconfigured" }, { status: 503 });
  }

  const header = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (!timingSafeEqual(header, secret)) {
    audit("telegram.webhook.unauthorized");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const updateId = parsed.data.update_id;
  const db = getDb();
  const ts = nowIso();

  const claim = await db
    .insert(schema.processedTelegramUpdates)
    .values({ updateId, processedAt: ts, resultStatus: "ignored" })
    .onConflictDoNothing();
  if (!claim.meta.changes) {
    audit("telegram.webhook.duplicate", { updateId });
    return ok({ duplicate: true });
  }

  let status: ResultStatus = "ignored";

  try {
    if (parsed.data.callback_query) {
      const handled = await handleCallbackQuery(db, parsed.data.callback_query, request);
      if (handled === "ok" || handled === "error") status = handled;
    } else {
      const chatId = parsed.data.message?.chat?.id;
      const text = parsed.data.message?.text ?? "";
      if (chatId != null && text.trim()) {
        const handled = await handleBotCommand(chatId, text, request);
        if (handled === "ok") status = "ok";
      }
    }
  } catch {
    status = "error";
    audit("telegram.webhook.handler_failed", { updateId });
  }

  if (status !== "ignored") {
    await db
      .update(schema.processedTelegramUpdates)
      .set({ resultStatus: status })
      .where(eq(schema.processedTelegramUpdates.updateId, updateId));
  }

  audit("telegram.webhook.processed", { updateId, resultStatus: status });
  return ok({ status });
}
