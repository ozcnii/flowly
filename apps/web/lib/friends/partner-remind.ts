import { and, desc, eq, gte } from "drizzle-orm";
import { generateId, nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { areAcceptedFriends, activeHabitShare, activeWorkoutShare } from "@/lib/shares/service";
import { sendMessage } from "@/lib/telegram/outbound";

const WINDOW_MS = 2 * 60 * 60_000;

export async function sendPartnerRemind(
  db: Database,
  senderId: string,
  input: { recipientId: string; entityType: "habit" | "workout"; entityId: string },
) {
  if (senderId === input.recipientId) return { kind: "invalid" as const, message: "Нельзя напомнить себе." };
  if (!(await areAcceptedFriends(db, senderId, input.recipientId))) {
    return { kind: "invalid" as const, message: "Только для друзей." };
  }

  // Shared object access: sender must own object shared with recipient (or vice versa for viewing)
  if (input.entityType === "habit") {
    const habit = (
      await db.select().from(schema.habits).where(eq(schema.habits.id, input.entityId)).limit(1)
    )[0];
    if (!habit) return { kind: "not_found" as const };
    // Reminder about recipient's shared object to recipient: habit owned by recipient, shared with sender
    const shareToSender = await activeHabitShare(db, input.entityId, senderId);
    const shareToRecipient = await activeHabitShare(db, input.entityId, input.recipientId);
    const ok =
      (habit.ownerId === input.recipientId && shareToSender) ||
      (habit.ownerId === senderId && shareToRecipient);
    if (!ok) return { kind: "forbidden" as const, message: "Объект не расшарен." };
  } else {
    const workout = (
      await db.select().from(schema.workouts).where(eq(schema.workouts.id, input.entityId)).limit(1)
    )[0];
    if (!workout) return { kind: "not_found" as const };
    const shareToSender = await activeWorkoutShare(db, input.entityId, senderId);
    const shareToRecipient = await activeWorkoutShare(db, input.entityId, input.recipientId);
    const ok =
      (workout.ownerId === input.recipientId && shareToSender) ||
      (workout.ownerId === senderId && shareToRecipient);
    if (!ok) return { kind: "forbidden" as const, message: "Объект не расшарен." };
  }

  const settings = (
    await db
      .select()
      .from(schema.userSettings)
      .where(eq(schema.userSettings.userId, input.recipientId))
      .limit(1)
  )[0];
  if (settings && settings.partnerRemindersEnabled === false) {
    return { kind: "invalid" as const, message: "Партнёрские напоминания отключены." };
  }

  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const recent = (
    await db
      .select()
      .from(schema.partnerReminds)
      .where(
        and(
          eq(schema.partnerReminds.senderId, senderId),
          eq(schema.partnerReminds.recipientId, input.recipientId),
          eq(schema.partnerReminds.entityType, input.entityType),
          eq(schema.partnerReminds.entityId, input.entityId),
          gte(schema.partnerReminds.createdAt, since),
        ),
      )
      .orderBy(desc(schema.partnerReminds.createdAt))
      .limit(1)
  )[0];
  if (recent) return { kind: "rate_limited" as const, message: "Не чаще одного раза за 2 часа." };

  const sender = (
    await db.select().from(schema.users).where(eq(schema.users.id, senderId)).limit(1)
  )[0];
  const recipient = (
    await db.select().from(schema.users).where(eq(schema.users.id, input.recipientId)).limit(1)
  )[0];
  if (!sender || !recipient) return { kind: "not_found" as const };

  const label = input.entityType === "habit" ? "привычке" : "тренировке";
  const text = `${sender.firstName} мягко напоминает о сегодняшней ${label} 🧘`;
  try {
    await sendMessage(recipient.telegramId, text);
  } catch {
    // still log attempt for rate limit in mock failures? log only on success for fair UX
  }

  await db.insert(schema.partnerReminds).values({
    id: generateId(),
    senderId,
    recipientId: input.recipientId,
    entityType: input.entityType,
    entityId: input.entityId,
    createdAt: nowIso(),
  });
  return { kind: "ok" as const };
}
