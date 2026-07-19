import "server-only";
import { getReadingForDay, TOTAL_DAYS, type ReadingEntry } from "@/data/reading-plan";
import { fetchEsvPassage, fetchWebPassage, ESV_ATTRIBUTION, WEB_ATTRIBUTION } from "@/lib/bible-text";
import { getCachedPassage, setCachedPassage } from "@/lib/bible-passage-cache";
import type { Translation } from "@/lib/reading-progress";

export type PassageResult = {
  day: number;
  track: ReadingEntry["track"];
  reference: string;
  translation: Translation;
  content: string;
  attribution: string;
};

export async function getPassageForDay(
  day: number,
  translation: Translation,
): Promise<PassageResult | null> {
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) {
    return null;
  }

  const entry = getReadingForDay(day);
  if (!entry) {
    return null;
  }

  let content = getCachedPassage(entry.reference, translation);

  if (!content) {
    content =
      translation === "esv"
        ? await fetchEsvPassage(entry.reference)
        : await fetchWebPassage(entry.reference);
    setCachedPassage(entry.reference, translation, content);
  }

  return {
    day,
    track: entry.track,
    reference: entry.reference,
    translation,
    content,
    attribution: translation === "esv" ? ESV_ATTRIBUTION : WEB_ATTRIBUTION,
  };
}
