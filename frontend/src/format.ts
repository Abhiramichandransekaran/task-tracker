const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const shortDate = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });
const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now", "5 minutes ago", "yesterday", then a plain date after a week. */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return "just now";
  if (abs < HOUR) return relative.format(Math.round(seconds / MINUTE), "minute");
  if (abs < DAY) return relative.format(Math.round(seconds / HOUR), "hour");
  if (abs < 7 * DAY) return relative.format(Math.round(seconds / DAY), "day");
  return shortDate.format(new Date(iso));
}

export const fullDateTime = (iso: string) => fullDate.format(new Date(iso));
