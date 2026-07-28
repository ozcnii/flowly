import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { nowIso } from "@flowly/core";
import { schema, type Database } from "@flowly/database";

export async function areAcceptedFriends(db: Database, a: string, b: string) {
  if (a === b) return false;
  const row = (
    await db
      .select({ id: schema.friendships.id })
      .from(schema.friendships)
      .where(
        and(
          eq(schema.friendships.status, "accepted"),
          or(
            and(eq(schema.friendships.requesterId, a), eq(schema.friendships.addresseeId, b)),
            and(eq(schema.friendships.requesterId, b), eq(schema.friendships.addresseeId, a)),
          ),
        ),
      )
      .limit(1)
  )[0];
  return Boolean(row);
}

export async function activeHabitShare(db: Database, habitId: string, viewerId: string) {
  return (
    await db
      .select()
      .from(schema.habitShares)
      .where(
        and(
          eq(schema.habitShares.habitId, habitId),
          eq(schema.habitShares.sharedWithUserId, viewerId),
          isNull(schema.habitShares.revokedAt),
        ),
      )
      .limit(1)
  )[0];
}

export async function activeWorkoutShare(db: Database, workoutId: string, viewerId: string) {
  return (
    await db
      .select()
      .from(schema.workoutShares)
      .where(
        and(
          eq(schema.workoutShares.workoutId, workoutId),
          eq(schema.workoutShares.sharedWithUserId, viewerId),
          isNull(schema.workoutShares.revokedAt),
        ),
      )
      .limit(1)
  )[0];
}

/** Active shares for a habit owned by ownerId (S-MA-084 editor). */
export async function listHabitShares(db: Database, habitId: string, ownerId: string) {
  const habit = (
    await db
      .select({ id: schema.habits.id })
      .from(schema.habits)
      .where(and(eq(schema.habits.id, habitId), eq(schema.habits.ownerId, ownerId)))
      .limit(1)
  )[0];
  if (!habit) return { kind: "not_found" as const };
  const rows = await db
    .select()
    .from(schema.habitShares)
    .where(and(eq(schema.habitShares.habitId, habitId), isNull(schema.habitShares.revokedAt)));
  if (rows.length === 0) return { kind: "ok" as const, shares: [] as Array<{ userId: string; showStreak: boolean; showHistory: boolean; createdAt: string; peer: { id: string; firstName: string; username: string | null } | null }> };
  const peers = await db
    .select({ id: schema.users.id, firstName: schema.users.firstName, username: schema.users.username })
    .from(schema.users)
    .where(inArray(schema.users.id, rows.map((r) => r.sharedWithUserId)));
  const peerMap = new Map(peers.map((p) => [p.id, p]));
  return {
    kind: "ok" as const,
    shares: rows.map((r) => ({
      userId: r.sharedWithUserId,
      showStreak: r.showStreak,
      showHistory: r.showHistory,
      createdAt: r.createdAt,
      peer: peerMap.get(r.sharedWithUserId) ?? null,
    })),
  };
}

/** Habits shared with viewer (read-only list for /rhythm). */
export async function listHabitsSharedWithMe(db: Database, viewerId: string) {
  const rows = await db
    .select()
    .from(schema.habitShares)
    .where(and(eq(schema.habitShares.sharedWithUserId, viewerId), isNull(schema.habitShares.revokedAt)));
  if (rows.length === 0) return [] as Array<{
    habit: { id: string; title: string; description: string | null; icon: string; color: string; emoji: string | null; startLocalDate: string; endLocalDate: string | null; status: string };
    share: { showStreak: boolean; showHistory: boolean; createdAt: string };
    owner: { id: string; firstName: string; username: string | null } | null;
  }>;
  const habitIds = rows.map((r) => r.habitId);
  const habits = await db.select().from(schema.habits).where(inArray(schema.habits.id, habitIds));
  const habitMap = new Map(habits.map((h) => [h.id, h]));
  const ownerIds = [...new Set(habits.map((h) => h.ownerId))];
  const owners =
    ownerIds.length > 0
      ? await db
          .select({ id: schema.users.id, firstName: schema.users.firstName, username: schema.users.username })
          .from(schema.users)
          .where(inArray(schema.users.id, ownerIds))
      : [];
  const ownerMap = new Map(owners.map((o) => [o.id, o]));
  return rows.flatMap((r) => {
    const h = habitMap.get(r.habitId);
    if (!h || h.status === "archived") return [];
    const owner = ownerMap.get(h.ownerId);
    return [
      {
        habit: {
          id: h.id,
          title: h.title,
          description: h.description,
          icon: h.icon,
          color: h.color,
          emoji: h.emoji,
          startLocalDate: h.startLocalDate,
          endLocalDate: h.endLocalDate,
          status: h.status,
        },
        share: { showStreak: r.showStreak, showHistory: r.showHistory, createdAt: r.createdAt },
        owner: owner ? { id: owner.id, firstName: owner.firstName, username: owner.username } : null,
      },
    ];
  });
}

export async function shareHabit(
  db: Database,
  habitId: string,
  ownerId: string,
  withUserId: string,
  opts: { showStreak?: boolean; showHistory?: boolean } = {},
) {
  const habit = (
    await db
      .select()
      .from(schema.habits)
      .where(and(eq(schema.habits.id, habitId), eq(schema.habits.ownerId, ownerId)))
      .limit(1)
  )[0];
  if (!habit || habit.status === "archived") return { kind: "not_found" as const };
  if (withUserId === ownerId) return { kind: "invalid" as const, message: "Нельзя поделиться с собой." };
  if (!(await areAcceptedFriends(db, ownerId, withUserId))) {
    return { kind: "invalid" as const, message: "Можно делиться только с друзьями." };
  }

  const ts = nowIso();
  const existing = (
    await db
      .select()
      .from(schema.habitShares)
      .where(and(eq(schema.habitShares.habitId, habitId), eq(schema.habitShares.sharedWithUserId, withUserId)))
      .limit(1)
  )[0];

  if (existing) {
    await db
      .update(schema.habitShares)
      .set({
        showStreak: opts.showStreak ?? existing.showStreak,
        showHistory: opts.showHistory ?? existing.showHistory,
        revokedAt: null,
        createdAt: existing.revokedAt ? ts : existing.createdAt,
      })
      .where(and(eq(schema.habitShares.habitId, habitId), eq(schema.habitShares.sharedWithUserId, withUserId)));
  } else {
    await db.insert(schema.habitShares).values({
      habitId,
      sharedWithUserId: withUserId,
      showStreak: opts.showStreak ?? false,
      showHistory: opts.showHistory ?? false,
      createdAt: ts,
      revokedAt: null,
    });
  }
  return { kind: "ok" as const };
}

export async function revokeHabitShare(db: Database, habitId: string, ownerId: string, withUserId: string) {
  const habit = (
    await db
      .select({ id: schema.habits.id })
      .from(schema.habits)
      .where(and(eq(schema.habits.id, habitId), eq(schema.habits.ownerId, ownerId)))
      .limit(1)
  )[0];
  if (!habit) return { kind: "not_found" as const };
  const row = (
    await db
      .select()
      .from(schema.habitShares)
      .where(and(eq(schema.habitShares.habitId, habitId), eq(schema.habitShares.sharedWithUserId, withUserId)))
      .limit(1)
  )[0];
  if (!row) return { kind: "not_found" as const };
  if (row.revokedAt) return { kind: "ok" as const, idempotent: true };
  await db
    .update(schema.habitShares)
    .set({ revokedAt: nowIso() })
    .where(and(eq(schema.habitShares.habitId, habitId), eq(schema.habitShares.sharedWithUserId, withUserId)));
  return { kind: "ok" as const, idempotent: false };
}

export async function shareWorkout(db: Database, workoutId: string, ownerId: string, withUserId: string) {
  const workout = (
    await db
      .select()
      .from(schema.workouts)
      .where(and(eq(schema.workouts.id, workoutId), eq(schema.workouts.ownerId, ownerId)))
      .limit(1)
  )[0];
  if (!workout || workout.status !== "published") return { kind: "not_found" as const };
  if (withUserId === ownerId) return { kind: "invalid" as const, message: "Нельзя поделиться с собой." };
  if (!(await areAcceptedFriends(db, ownerId, withUserId))) {
    return { kind: "invalid" as const, message: "Можно делиться только с друзьями." };
  }

  const ts = nowIso();
  const existing = (
    await db
      .select()
      .from(schema.workoutShares)
      .where(and(eq(schema.workoutShares.workoutId, workoutId), eq(schema.workoutShares.sharedWithUserId, withUserId)))
      .limit(1)
  )[0];

  if (existing) {
    await db
      .update(schema.workoutShares)
      .set({ revokedAt: null, sharedByUserId: ownerId, createdAt: existing.revokedAt ? ts : existing.createdAt })
      .where(and(eq(schema.workoutShares.workoutId, workoutId), eq(schema.workoutShares.sharedWithUserId, withUserId)));
  } else {
    await db.insert(schema.workoutShares).values({
      workoutId,
      sharedByUserId: ownerId,
      sharedWithUserId: withUserId,
      createdAt: ts,
      revokedAt: null,
    });
  }
  return { kind: "ok" as const };
}

export async function revokeWorkoutShare(db: Database, workoutId: string, ownerId: string, withUserId: string) {
  const workout = (
    await db
      .select({ id: schema.workouts.id })
      .from(schema.workouts)
      .where(and(eq(schema.workouts.id, workoutId), eq(schema.workouts.ownerId, ownerId)))
      .limit(1)
  )[0];
  if (!workout) return { kind: "not_found" as const };
  const row = (
    await db
      .select()
      .from(schema.workoutShares)
      .where(and(eq(schema.workoutShares.workoutId, workoutId), eq(schema.workoutShares.sharedWithUserId, withUserId)))
      .limit(1)
  )[0];
  if (!row) return { kind: "not_found" as const };
  if (row.revokedAt) return { kind: "ok" as const, idempotent: true };
  await db
    .update(schema.workoutShares)
    .set({ revokedAt: nowIso() })
    .where(and(eq(schema.workoutShares.workoutId, workoutId), eq(schema.workoutShares.sharedWithUserId, withUserId)));
  return { kind: "ok" as const, idempotent: false };
}

/** Immediate revoke of all active shares between two users (friend remove). */
export async function revokeAllSharesBetween(db: Database, userA: string, userB: string) {
  const ts = nowIso();
  // Habit shares: habits owned by A shared with B, and owned by B shared with A
  const aHabits = await db.select({ id: schema.habits.id }).from(schema.habits).where(eq(schema.habits.ownerId, userA));
  const bHabits = await db.select({ id: schema.habits.id }).from(schema.habits).where(eq(schema.habits.ownerId, userB));
  for (const h of aHabits) {
    await db
      .update(schema.habitShares)
      .set({ revokedAt: ts })
      .where(
        and(
          eq(schema.habitShares.habitId, h.id),
          eq(schema.habitShares.sharedWithUserId, userB),
          isNull(schema.habitShares.revokedAt),
        ),
      );
  }
  for (const h of bHabits) {
    await db
      .update(schema.habitShares)
      .set({ revokedAt: ts })
      .where(
        and(
          eq(schema.habitShares.habitId, h.id),
          eq(schema.habitShares.sharedWithUserId, userA),
          isNull(schema.habitShares.revokedAt),
        ),
      );
  }

  await db
    .update(schema.workoutShares)
    .set({ revokedAt: ts })
    .where(
      and(
        or(
          and(eq(schema.workoutShares.sharedByUserId, userA), eq(schema.workoutShares.sharedWithUserId, userB)),
          and(eq(schema.workoutShares.sharedByUserId, userB), eq(schema.workoutShares.sharedWithUserId, userA)),
        ),
        isNull(schema.workoutShares.revokedAt),
      ),
    );
}
