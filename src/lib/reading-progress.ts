import "server-only";
import { getDb } from "./db";

export type Translation = "esv" | "web";

export type ReadingSettings = {
  userId: string;
  startDate: string; // ISO date, e.g. "2026-07-20"
  translation: Translation;
};

type SettingsRow = {
  user_id: string;
  start_date: string;
  translation: string;
};

export function getSettings(userId: string): ReadingSettings | null {
  const row = getDb()
    .prepare("SELECT user_id, start_date, translation FROM bible_reading_settings WHERE user_id = ?")
    .get(userId) as SettingsRow | undefined;

  if (!row) {
    return null;
  }

  return {
    userId: row.user_id,
    startDate: row.start_date,
    translation: row.translation === "web" ? "web" : "esv",
  };
}

export function saveSettings(settings: ReadingSettings): void {
  getDb()
    .prepare(
      `INSERT INTO bible_reading_settings (user_id, start_date, translation)
       VALUES (@userId, @startDate, @translation)
       ON CONFLICT(user_id) DO UPDATE SET start_date = @startDate, translation = @translation`,
    )
    .run(settings);
}

export function getCompletedDays(userId: string): Set<number> {
  const rows = getDb()
    .prepare("SELECT day_number FROM bible_reading_progress WHERE user_id = ?")
    .all(userId) as { day_number: number }[];

  return new Set(rows.map((r) => r.day_number));
}

export function isDayComplete(userId: string, dayNumber: number): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM bible_reading_progress WHERE user_id = ? AND day_number = ?")
    .get(userId, dayNumber);

  return Boolean(row);
}

export function setDayComplete(userId: string, dayNumber: number, complete: boolean): void {
  if (complete) {
    getDb()
      .prepare(
        `INSERT INTO bible_reading_progress (user_id, day_number) VALUES (?, ?)
         ON CONFLICT(user_id, day_number) DO NOTHING`,
      )
      .run(userId, dayNumber);
    return;
  }

  getDb()
    .prepare("DELETE FROM bible_reading_progress WHERE user_id = ? AND day_number = ?")
    .run(userId, dayNumber);
}

export type Streaks = {
  current: number;
  longest: number;
};

// Streaks are measured in plan day-numbers, which track calendar days
// 1:1 once a user's start date has passed. "current" doesn't reset just
// because today isn't marked yet — it counts back from today if today is
// done, otherwise from yesterday, so an in-progress day doesn't zero it out.
export function computeStreaks(completedDays: Set<number>, today: number): Streaks {
  let current = 0;
  let day = completedDays.has(today) ? today : today - 1;
  while (day >= 1 && completedDays.has(day)) {
    current += 1;
    day -= 1;
  }

  let longest = 0;
  let run = 0;
  for (let d = 1; d <= today; d += 1) {
    if (completedDays.has(d)) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  longest = Math.max(longest, current);

  return { current, longest };
}

export type Badge = {
  name: string;
  sub: string;
  earned: boolean;
};

export function computeBadges(daysRead: number, streaks: Streaks): Badge[] {
  return [
    { name: "First Reading", sub: "Day 1 complete", earned: daysRead >= 1 },
    { name: "7-Day Streak", sub: "One week running", earned: streaks.longest >= 7 },
    { name: "30-Day Streak", sub: "A month of faithfulness", earned: streaks.longest >= 30 },
    { name: "100 Days Read", sub: "A third of the way", earned: daysRead >= 100 },
    { name: "Quarter Way", sub: "91 of 364 days", earned: daysRead >= 91 },
    { name: "Halfway There", sub: "182 of 364 days", earned: daysRead >= 182 },
    { name: "200 Days Read", sub: "Over half the year", earned: daysRead >= 200 },
    { name: "Whole Bible", sub: "All 364 days complete", earned: daysRead >= 364 },
  ];
}
