import { addDays, format, parseISO, isValid } from "date-fns";

/** YYYY-MM-DD in the given IANA timezone (calendar date, not UTC day). */
export const localDateInTimezone = (timeZone: string, at = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);

export const isLocalDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value));

/** Program day 1 = start; day N = start + (N-1) calendar days. */
export const scheduleLocalDate = (startLocalDate: string, dayNumber: number) =>
  format(addDays(parseISO(startLocalDate), dayNumber - 1), "yyyy-MM-dd");

export const addLocalDays = (localDate: string, days: number) => format(addDays(parseISO(localDate), days), "yyyy-MM-dd");

export const formatRuDate = (localDate: string) => {
  try {
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" }).format(parseISO(localDate));
  } catch {
    return localDate;
  }
};
