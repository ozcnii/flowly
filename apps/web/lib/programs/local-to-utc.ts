/** Convert local calendar date+time in IANA zone to UTC ISO (iterative offset fix). */
export function localDateTimeToUtcIso(localDate: string, localTime: string, timeZone: string): string {
  const dateParts = localDate.split("-").map(Number);
  const timeParts = (localTime.length >= 5 ? localTime : "09:00").split(":").map(Number);
  const Y = dateParts[0] ?? 1970;
  const M = dateParts[1] ?? 1;
  const D = dateParts[2] ?? 1;
  const h = timeParts[0] ?? 9;
  const m = timeParts[1] ?? 0;
  let utc = Date.UTC(Y, M - 1, D, h, m, 0);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  for (let i = 0; i < 4; i++) {
    const bag: Record<string, string> = {};
    for (const p of fmt.formatToParts(new Date(utc))) {
      if (p.type !== "literal") bag[p.type] = p.value;
    }
    const asUtc = Date.UTC(+(bag.year ?? Y), +(bag.month ?? M) - 1, +(bag.day ?? D), +(bag.hour ?? h), +(bag.minute ?? m), 0);
    utc += Date.UTC(Y, M - 1, D, h, m, 0) - asUtc;
  }
  return new Date(utc).toISOString();
}
