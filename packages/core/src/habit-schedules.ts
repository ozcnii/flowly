export type HabitScheduleType = "exact_times" | "weekdays" | "weekly_target" | "interval";
export type HabitScheduleRule = {
  ruleType: HabitScheduleType;
  configuration: unknown;
};
export type LocalHabitSlot = { localDate: string; localTime: string };

const dayOfWeek = (value: string) => new Date(`${value}T00:00:00Z`).getUTCDay() || 7;
const dateText = (value: Date) => value.toISOString().slice(0, 10);
const timeText = (value: Date) => value.toISOString().slice(11, 16);
const localParts = (value: string) => {
  const [date, time] = value.split("T");
  const [year, month, day] = (date ?? "1970-01-01").split("-").map(Number);
  const [hours, minutes] = (time ?? "00:00").split(":").map(Number);
  return { year: year || 1970, month: month || 1, day: day || 1, hours: hours || 0, minutes: minutes || 0 };
};

export const localDateInTimezone = (value: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

/** Convert a local civil date/time in an IANA zone to an ISO UTC instant. */
export const localDateTimeToUtcIso = (localDate: string, localTime: string, timeZone: string) => {
  const input = localParts(`${localDate}T${localTime}`);
  const wall = Date.UTC(input.year, input.month - 1, input.day, input.hours, input.minutes);
  let utc = wall;
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts: Record<string, number> = {};
    for (const part of formatter.formatToParts(new Date(utc))) if (part.type !== "literal") parts[part.type] = Number(part.value);
    const rendered = Date.UTC(parts.year ?? input.year, (parts.month ?? input.month) - 1, parts.day ?? input.day, parts.hour ?? input.hours, parts.minute ?? input.minutes);
    utc += wall - rendered;
  }
  return new Date(utc).toISOString();
};

const addLocalInterval = (value: Date, every: number, unit: "hours" | "days" | "weeks") => {
  const next = new Date(value);
  if (unit === "hours") next.setUTCHours(next.getUTCHours() + every);
  else next.setUTCDate(next.getUTCDate() + every * (unit === "weeks" ? 7 : 1));
  return next;
};

const push = (out: LocalHabitSlot[], localDate: string, localTime: string, from: string, to: string) => {
  if (localDate >= from && localDate <= to) out.push({ localDate, localTime });
};

export const expandHabitSlots = (rule: HabitScheduleRule, from: string, to: string): LocalHabitSlot[] => {
  if (from > to) return [];
  const out: LocalHabitSlot[] = [];
  const config = rule.configuration as Record<string, unknown>;
  if (rule.ruleType === "interval") {
    const anchorDate = String(config.anchorLocalDate ?? from);
    const anchorTime = String(config.anchorLocalTime ?? "00:00");
    const every = Number(config.every ?? 1);
    const unit = config.unit === "days" || config.unit === "weeks" ? config.unit : "hours";
    const stepMs = every * (unit === "hours" ? 3_600_000 : unit === "days" ? 86_400_000 : 604_800_000);
    const start = new Date(`${from}T00:00:00Z`);
    const limit = new Date(`${to}T23:59:59.999Z`);
    let cursor = new Date(`${anchorDate}T${anchorTime}:00Z`);
    if (cursor < start) {
      cursor = new Date(cursor.getTime() + Math.floor((start.getTime() - cursor.getTime()) / stepMs) * stepMs);
      while (cursor < start) cursor = addLocalInterval(cursor, every, unit);
    }
    for (; cursor <= limit; cursor = addLocalInterval(cursor, every, unit)) push(out, dateText(cursor), timeText(cursor), from, to);
    return out;
  }
  for (let date = new Date(`${from}T00:00:00Z`), end = new Date(`${to}T00:00:00Z`); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
    const localDate = dateText(date);
    const day = dayOfWeek(localDate);
    const times: unknown[] = rule.ruleType === "exact_times"
      ? (Array.isArray(config.times) ? config.times : [])
      : rule.ruleType === "weekly_target"
        ? (Array.isArray(config.days) && config.days.includes(day) ? [config.time] : [])
        : (Array.isArray(config.days) && config.days.includes(day) ? (Array.isArray((config.timesByDay as Record<string, unknown> | undefined)?.[String(day)]) ? (config.timesByDay as Record<string, unknown[]>)[String(day)] ?? [] : []) : []);
    for (const time of times) if (typeof time === "string") push(out, localDate, time, from, to);
  }
  return out.sort((a, b) => `${a.localDate}T${a.localTime}`.localeCompare(`${b.localDate}T${b.localTime}`));
};
