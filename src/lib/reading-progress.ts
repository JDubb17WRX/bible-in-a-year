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
