import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { localDateInTimezone } from "@flowly/core";
import { schema, type Database } from "@flowly/database";
import { currentDayNumber, isWorkoutDoneStatus } from "@/features/programs/model/program-progress";
import { scheduleLocalDate } from "@/features/programs/model/program-dates";
import { ensureHabitScheduleForToday } from "@/lib/habits/ensure-habit-schedule";
import type { HomeViewModel } from "@/features/home/model/home-view-model";

const OPEN = new Set(["scheduled", "due", "notified", "snoozed"]);
const DONE = new Set(["completed", "partial"]);

const habitIcon = (icon: string): HomeViewModel["habits"][number]["icon"] =>
  icon === "glass-water" || icon === "sparkles" ? icon : "leaf";

export async function buildHomeViewModel(db: Database, userId: string): Promise<HomeViewModel> {
  await ensureHabitScheduleForToday(db, userId);
  const user = (await db.select({ timezone: schema.users.timezone }).from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0];
  const tz = user?.timezone ?? "UTC";
  const today = localDateInTimezone(new Date(), tz);

  const habits = await db
    .select()
    .from(schema.habits)
    .where(and(eq(schema.habits.ownerId, userId), inArray(schema.habits.status, ["active", "paused"])))
    .orderBy(asc(schema.habits.createdAt));

  const habitIds = habits.map((h) => h.id);
  const occs = habitIds.length
    ? await db
        .select()
        .from(schema.activityOccurrences)
        .where(
          and(
            eq(schema.activityOccurrences.userId, userId),
            eq(schema.activityOccurrences.entityType, "habit"),
            eq(schema.activityOccurrences.scheduledLocalDate, today),
            inArray(schema.activityOccurrences.entityId, habitIds),
          ),
        )
        .orderBy(asc(schema.activityOccurrences.scheduledLocalTime))
    : [];

  const workoutOccs = await db
    .select()
    .from(schema.activityOccurrences)
    .where(
      and(
        eq(schema.activityOccurrences.userId, userId),
        eq(schema.activityOccurrences.entityType, "workout"),
        eq(schema.activityOccurrences.scheduledLocalDate, today),
      ),
    );

  const allToday = [...occs, ...workoutOccs];
  const completed = allToday.filter((o) => DONE.has(o.status)).length;
  const partial = allToday.filter((o) => o.status === "partial").length;
  const noResponse = allToday.filter((o) => o.status === "no_response").length;
  const total = allToday.length;
  const remaining = allToday.filter((o) => OPEN.has(o.status)).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const byHabit = new Map<string, typeof occs>();
  for (const o of occs) byHabit.set(o.entityId, [...(byHabit.get(o.entityId) ?? []), o]);

  const habitRows: HomeViewModel["habits"] = habits.map((h) => {
    const slots = byHabit.get(h.id) ?? [];
    const doneSlots = slots.filter((s) => DONE.has(s.status)).length;
    const pending = slots.filter((s) => OPEN.has(s.status)).sort((a, b) => a.scheduledLocalTime.localeCompare(b.scheduledLocalTime));
    const done = slots.length > 0 && doneSlots === slots.length;
    const meta =
      pending[0] ? `сегодня в ${pending[0].scheduledLocalTime}` : slots.length ? `${doneSlots} из ${slots.length}` : h.status === "paused" ? "на паузе" : "нет слота сегодня";
    return { id: h.id, title: h.title, meta, icon: habitIcon(h.icon), done };
  });

  const plan: HomeViewModel["plan"] = [];
  for (const h of habits) {
    const slots = byHabit.get(h.id) ?? [];
    const pending = slots.filter((s) => OPEN.has(s.status)).sort((a, b) => a.scheduledLocalTime.localeCompare(b.scheduledLocalTime));
    const doneSlots = slots.filter((s) => DONE.has(s.status));
    if (pending[0]) {
      plan.push({
        id: `habit:${h.id}:${pending[0].id}`,
        icon: "leaf",
        title: h.title,
        meta: `в ${pending[0].scheduledLocalTime}`,
        href: `/rhythm/${h.id}`,
        status: plan.some((p) => p.status === "current") ? "upcoming" : "current",
      });
    } else if (doneSlots.length) {
      plan.push({
        id: `habit-done:${h.id}`,
        icon: "circle-check",
        title: h.title,
        meta: "выполнено",
        href: `/rhythm/${h.id}`,
        status: "done",
      });
    }
  }

  const enrollment = (
    await db
      .select()
      .from(schema.programEnrollments)
      .where(and(eq(schema.programEnrollments.userId, userId), eq(schema.programEnrollments.status, "active")))
      .orderBy(desc(schema.programEnrollments.createdAt))
      .limit(1)
  )[0];

  let program: HomeViewModel["program"] | null = null;
  if (enrollment) {
    const prog = (await db.select().from(schema.programs).where(eq(schema.programs.id, enrollment.programId)).limit(1))[0];
    if (prog) {
      const day = currentDayNumber(enrollment.startLocalDate, today, prog.durationDays);
      const days = await db
        .select()
        .from(schema.programDays)
        .where(eq(schema.programDays.programId, prog.id))
        .orderBy(asc(schema.programDays.dayNumber));
      const doneDays = (
        await db
          .select({ status: schema.activityOccurrences.status, scheduledLocalDate: schema.activityOccurrences.scheduledLocalDate })
          .from(schema.activityOccurrences)
          .where(
            and(
              eq(schema.activityOccurrences.userId, userId),
              eq(schema.activityOccurrences.parentEntityId, enrollment.id),
              eq(schema.activityOccurrences.entityType, "workout"),
            ),
          )
      ).filter((o) => isWorkoutDoneStatus(o.status)).length;
      const workoutDays = days.filter((d) => d.type === "workout").length || prog.durationDays;
      const pct = Math.min(100, Math.round((doneDays / Math.max(1, workoutDays)) * 100));
      program = {
        title: prog.title,
        meta: day > 0 && day <= prog.durationDays ? `День ${day} из ${prog.durationDays}` : day > prog.durationDays ? "Завершена по календарю" : "Ещё не начата",
        percent: pct,
        image: prog.coverObjectKey ? `/media/${prog.coverObjectKey}` : "/media/home-program.webp",
        href: `/programs/enrollments/${enrollment.id}`,
      } satisfies NonNullable<HomeViewModel["program"]>;
      const todayDay = days.find((d) => scheduleLocalDate(enrollment.startLocalDate, d.dayNumber) === today);
      if (todayDay?.type === "workout") {
        plan.unshift({
          id: `program:${enrollment.id}:${todayDay.dayNumber}`,
          icon: "sparkles",
          title: `${prog.title} · день ${todayDay.dayNumber}`,
          meta: todayDay.title || "день программы",
          href: `/programs/enrollments/${enrollment.id}`,
          status: plan.some((p) => p.status === "current") ? "upcoming" : "current",
        });
      }
    }
  }

  // ensure single current in plan
  let sawCurrent = false;
  for (const item of plan) {
    if (item.status === "current") {
      if (sawCurrent) item.status = "upcoming";
      else sawCurrent = true;
    }
  }
  if (!sawCurrent) {
    const up = plan.find((p) => p.status === "upcoming");
    if (up) up.status = "current";
  }

  const empty = habits.length === 0 && !program && total === 0;
  return {
    progress: { completed, total, partial, remaining, noResponse, percent },
    resume: { title: "", meta: "", image: "/media/home-resume.webp" },
    plan,
    program,
    habits: habitRows,
    empty,
    today,
  };
}
