import type { StorageKind } from "./storage";

/**
 * Серверная генерация ключа объекта (PRD §46.2: имя объекта генерируется
 * сервером, исходное имя не используется как ключ). `id` (UUIDv7 из
 * `@flowly/core`) передаётся вызывающим — storage не зависит от core.
 */
export function storageKey({
  kind,
  id,
  ext,
}: {
  kind: StorageKind;
  id: string;
  ext: string;
}): string {
  const cleanExt = ext.replace(/^\.+/, "").toLowerCase();
  return `${kind}/${id}.${cleanExt}`;
}
