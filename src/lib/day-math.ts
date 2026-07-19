import { TOTAL_DAYS } from "@/data/reading-plan";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIsoDateUTC(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// Calendar-driven day number: fixed to the user's own start date, clamped to
// the plan's 364-day range (never negative, never past the last day).
export function getCurrentDayNumber(
  startDateIso: string,
  todayIso: string = todayIsoDate(),
): number {
  const diffDays =
    Math.floor((parseIsoDateUTC(todayIso) - parseIsoDateUTC(startDateIso)) / MS_PER_DAY) + 1;
  return Math.min(Math.max(diffDays, 1), TOTAL_DAYS);
}

export function dateForDayNumber(startDateIso: string, dayNumber: number): string {
  const ms = parseIsoDateUTC(startDateIso) + (dayNumber - 1) * MS_PER_DAY;
  return new Date(ms).toISOString().slice(0, 10);
}

export function formatDisplayDate(iso: string): string {
  const ms = parseIsoDateUTC(iso);
  return new Date(ms).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatShortDate(iso: string): string {
  const ms = parseIsoDateUTC(iso);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
