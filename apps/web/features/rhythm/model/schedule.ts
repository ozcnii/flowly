import { z } from "zod";

export const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const timezoneValid = (value: string) => { try { new Intl.DateTimeFormat("en-US", { timeZone: value }).format(); return true; } catch { return false; } };
const times = z.array(z.string().regex(TIME, "Время должно быть в формате HH:MM")).min(1).transform((xs) => [...new Set(xs)].sort());

export const exactTimesConfig = z.object({ times });
export const weekdaysConfig = z.object({ days: z.array(z.number().int().min(1).max(7)).min(1).transform((xs) => [...new Set(xs)].sort((a, b) => a - b)), timesByDay: z.record(z.string(), times) });
export const scheduleRuleSchema = z.object({
  ruleType: z.enum(["exact_times", "weekdays"]),
  timezone: z.string().refine(timezoneValid, "Укажите корректный часовой пояс"),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  configuration: z.unknown(),
}).superRefine((value, ctx) => {
  const result = value.ruleType === "exact_times" ? exactTimesConfig.safeParse(value.configuration) : weekdaysConfig.safeParse(value.configuration);
  if (!result.success) ctx.addIssue({ code: "custom", path: ["configuration"], message: "Проверьте дни и время расписания" });
});
export type ScheduleRule = z.infer<typeof scheduleRuleSchema>;
export type ExactTimesConfig = z.infer<typeof exactTimesConfig>;
export type WeekdaysConfig = z.infer<typeof weekdaysConfig>;

export const normalizeSchedule = (rule: ScheduleRule) => {
  const config = rule.ruleType === "exact_times" ? exactTimesConfig.parse(rule.configuration) : weekdaysConfig.parse(rule.configuration);
  return { ...rule, configuration: config };
};

export const expandLocalSlots = (rule: ScheduleRule, from: string, to: string) => {
  const out: Array<{ localDate: string; localTime: string; timezone: string }> = [];
  const start = new Date(`${from}T00:00:00Z`), end = new Date(`${to}T00:00:00Z`);
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10); const weekday = d.getUTCDay() || 7;
    const slotTimes = rule.ruleType === "exact_times" ? exactTimesConfig.parse(rule.configuration).times : (() => { const config = weekdaysConfig.parse(rule.configuration); return config.days.includes(weekday) ? config.timesByDay[String(weekday)] ?? [] : []; })();
    for (const localTime of slotTimes) out.push({ localDate: date, localTime, timezone: rule.timezone });
  }
  return out;
};
