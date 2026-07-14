export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`API ${status}`);
  }
}

export async function apiJson<T>(input: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await fetch(input, { credentials: "same-origin", ...init, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) as unknown : null;
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

export const jsonBody = (body: unknown) => JSON.stringify(body);
