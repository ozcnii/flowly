import { expandHabitSlots } from "@flowly/core";
import { z } from "zod";

export const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const dateValid = (value: string) => { const date = new Date(`${value}T00:00:00Z`); return date.toISOString().slice(0, 10) === value; };
const localDate = z.string().regex(DATE, "Дата должна быть в формате YYYY-MM-DD").refine(dateValid, "Укажите корректную дату");
const time = z.string().regex(TIME, "Время должно быть в формате HH:MM");
const times = z.array(time).min(1).transform((xs) => [...new Set(xs)].sort());
const days = z.array(z.number().int().min(1).max(7)).min(1).transform((xs) => [...new Set(xs)].sort((a, b) => a - b));

export const exactTimesConfig = z.object({ times });
export const weekdaysConfig = z.object({ days, timesByDay: z.record(z.string(), times) });
export const weeklyTargetConfig = z.object({ target: z.number().int().min(1), days, time });
export const intervalConfig = z.object({
  every: z.number().int().min(1),
  unit: z.enum(["hours", "days", "weeks"]),
  anchorLocalDate: localDate,
  anchorLocalTime: time,
});

export const scheduleRuleSchema = z.object({
  ruleType: z.enum(["exact_times", "weekdays", "weekly_target", "interval"]),
  validFrom: localDate,
  configuration: z.unknown(),
}).superRefine((value, ctx) => {
  const result = value.ruleType === "exact_times" ? exactTimesConfig.safeParse(value.configuration)
    : value.ruleType === "weekdays" ? weekdaysConfig.safeParse(value.configuration)
      : value.ruleType === "weekly_target" ? weeklyTargetConfig.safeParse(value.configuration)
        : intervalConfig.safeParse(value.configuration);
  if (!result.success) ctx.addIssue({ code: "custom", path: ["configuration"], message: "Проверьте параметры расписания" });
});

export type ScheduleRule = z.infer<typeof scheduleRuleSchema>;
export type ExactTimesConfig = z.infer<typeof exactTimesConfig>;
export type WeekdaysConfig = z.infer<typeof weekdaysConfig>;
export type WeeklyTargetConfig = z.infer<typeof weeklyTargetConfig>;
export type IntervalConfig = z.infer<typeof intervalConfig>;
export type ScheduleType = ScheduleRule["ruleType"];
export type LocalSlot = { localDate: string; localTime: string; timezone: string };

export const normalizeSchedule = (rule: ScheduleRule) => {
  const configuration = rule.ruleType === "exact_times" ? exactTimesConfig.parse(rule.configuration)
    : rule.ruleType === "weekdays" ? weekdaysConfig.parse(rule.configuration)
      : rule.ruleType === "weekly_target" ? weeklyTargetConfig.parse(rule.configuration)
        : intervalConfig.parse(rule.configuration);
  return { ...rule, configuration };
};

const dateAtUtc = (value: string) => new Date(`${value}T00:00:00Z`);
const dateString = (value: Date) => value.toISOString().slice(0, 10);
const weekday = (value: string) => dateAtUtc(value).getUTCDay() || 7;

export const weekBounds = (value: string) => {
  const date = dateAtUtc(value);
  const offset = weekday(value) - 1;
  const start = new Date(date); start.setUTCDate(start.getUTCDate() - offset);
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + 6);
  return { start: dateString(start), end: dateString(end) };
};

export const weeklyTargetFacts = (config: WeeklyTargetConfig, value: string, completed = 0) => {
  const day = weekday(value);
  const remaining = Math.max(0, config.target - completed);
  const remainingAllowedDays = config.days.filter((candidate) => candidate >= day).length;
  return { ...weekBounds(value), completed, remaining, remainingAllowedDays, isTodayAllowed: config.days.includes(day), mandatoryRemaining: remaining > 0 && remainingAllowedDays <= remaining };
};

export const expandLocalSlots = (rule: ScheduleRule, from: string, to: string, timezone: string): LocalSlot[] =>
  expandHabitSlots(rule, from, to).map((slot) => ({ ...slot, timezone }));
