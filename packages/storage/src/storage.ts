import type { R2Bucket, R2Object, R2ObjectBody } from "@cloudflare/workers-types";

/**
 * @flowly/storage — безопасный adapter поверх Cloudflare R2 (PRD §46).
 *
 * Разводит бизнес-логику и R2: бизнес-код зависит от `StorageAdapter`, а не от
 * `R2Bucket`. Прямой публичный доступ НЕ включается — доступ только через
 * авторизованные маршруты (этап 2). Продуктовые upload/access flows (валидация
 * MIME/размера, удаление orphan-файлов) — этап 2.
 *
 * Типы value/body выводятся из интерфейсов R2, чтобы быть консистентными в любом
 * проекте (DOM-lib vs workers-types).
 */

/** Канонические префиксы ключей по §46.1. */
export type StorageKind = "images" | "gifs" | "covers" | "reports" | "exports";

/** Тело объекта — выводим из сигнатуры R2 put (без null). */
export type StorageValue = NonNullable<Parameters<R2Bucket["put"]>[1]>;

export interface StoragePutOptions {
  key: string;
  body: StorageValue;
  /** HTTP Content-Type; сохраняется в R2 httpMetadata. */
  contentType?: string;
  /** Произвольные пользовательские метаданные (R2 customMetadata). */
  metadata?: Record<string, string>;
}

export interface StorageObject {
  key: string;
  etag: string;
  size: number;
  uploaded: Date;
}

export interface StorageBody extends StorageObject {
  body: R2ObjectBody["body"];
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageAdapter {
  put(opts: StoragePutOptions): Promise<StorageObject>;
  get(key: string): Promise<StorageBody | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

function toObject(o: R2Object): StorageObject {
  return { key: o.key, etag: o.etag, size: o.size, uploaded: o.uploaded };
}

/** Создаёт adapter над R2-биндингом. */
export function createStorage(bucket: R2Bucket): StorageAdapter {
  return {
    async put({ key, body, contentType, metadata }) {
      const obj = await bucket.put(key, body, {
        httpMetadata: contentType ? { contentType } : undefined,
        customMetadata: metadata,
      });
      if (!obj) throw new Error(`storage: put returned null for key '${key}'`);
      return toObject(obj);
    },
    async get(key) {
      const obj = await bucket.get(key);
      if (!obj) return null;
      return {
        ...toObject(obj),
        body: obj.body,
        contentType: obj.httpMetadata?.contentType,
        metadata: obj.customMetadata,
      };
    },
    async delete(key) {
      await bucket.delete(key);
    },
    async exists(key) {
      return (await bucket.head(key)) !== null;
    },
  };
}
