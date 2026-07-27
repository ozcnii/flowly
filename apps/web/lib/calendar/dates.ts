/** Local calendar date helpers (YYYY-MM-DD, Monday-first week DEC-042). */

const parse = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y: y!, m: m!, d: d! };
};

export const addDays = (iso: string, days: number) => {
  const { y, m, d } = parse(iso);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
};

/** Monday of the week containing `iso` (ISO weekday 1=Mon … 7=Sun). */
export const startOfWeekMonday = (iso: string) => {
  const { y, m, d } = parse(iso);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay() || 7; // Sun=7
  return addDays(iso, 1 - dow);
};

export const endOfWeekSunday = (iso: string) => addDays(startOfWeekMonday(iso), 6);

export const monthBounds = (year: number, month: number) => {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { start, end };
};

export const eachDate = (from: string, to: string): string[] => {
  if (from > to) return [];
  const out: string[] = [];
  for (let cur = from; cur <= to; cur = addDays(cur, 1)) out.push(cur);
  return out;
};

export const parseYearMonth = (date: string) => {
  const { y, m } = parse(date);
  return { year: y, month: m };
};
