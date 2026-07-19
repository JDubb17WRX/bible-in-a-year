import "server-only";
import { getDb } from "./db";

export function getCachedPassage(reference: string, translation: string): string | null {
  const row = getDb()
    .prepare("SELECT content FROM bible_passage_cache WHERE reference = ? AND translation = ?")
    .get(reference, translation) as { content: string } | undefined;

  return row?.content ?? null;
}

export function setCachedPassage(reference: string, translation: string, content: string): void {
  getDb()
    .prepare(
      `INSERT INTO bible_passage_cache (reference, translation, content) VALUES (?, ?, ?)
       ON CONFLICT(reference, translation) DO UPDATE SET content = excluded.content, fetched_at = datetime('now')`,
    )
    .run(reference, translation, content);
}
