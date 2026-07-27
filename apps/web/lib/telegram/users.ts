import { eq } from "drizzle-orm";
import { schema, type Database } from "@flowly/database";

export async function getUserByTelegramId(db: Database, telegramId: string | number) {
  return (
    (await db.select().from(schema.users).where(eq(schema.users.telegramId, String(telegramId))).limit(1))[0] ?? null
  );
}
