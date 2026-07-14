import { NextResponse } from "next/server";

/** §47.1: ограничение размера запроса (foundation JSON-API). */
const MAX_BODY_BYTES = 65_536; // 64 KiB; upload-маршруты этапа 2 имеют свои 5/10 MiB.

/**
 * Возвращает 413-ответ, если `content-length` превышает лимит, иначе `null`.
 * Применять в начале mutating-маршрутов. При отсутствии `content-length`
 * (chunked) лимит не срабатывает — приемлемо для foundation JSON-API (см. T09 residual).
 */
export function rejectOversizedBody(request: Request, maxBytes: number = MAX_BODY_BYTES): NextResponse | null {
  const raw = request.headers.get("content-length");
  if (!raw) return null;
  const len = Number.parseInt(raw, 10);
  if (Number.isFinite(len) && len > maxBytes) {
    return NextResponse.json({ error: "request_too_large" }, { status: 413 });
  }
  return null;
}

/**
 * §47.1: журнал критических действий (минимальный, foundation). Структурированная
 * строка собирается wrangler observability (enabled). Полный audit-log — этап 8.
 */
export function audit(event: string, fields: Record<string, unknown> = {}): void {
  console.info(JSON.stringify({ ts: new Date().toISOString(), event, ...fields }));
}
