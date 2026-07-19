import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "bible.sqlite");

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS bible_reading_settings (
  user_id TEXT PRIMARY KEY,
  start_date TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT 'esv',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bible_reading_progress (
  user_id TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, day_number)
);

CREATE TABLE IF NOT EXISTS bible_passage_cache (
  reference TEXT NOT NULL,
  translation TEXT NOT NULL,
  content TEXT NOT NULL,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (reference, translation)
);
`;

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = process.env.SQLITE_DB_PATH || DEFAULT_DB_PATH;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA_SQL);

  dbInstance = db;
  return db;
}
