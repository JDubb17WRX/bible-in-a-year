import "server-only";
import { parseReference } from "./bible-reference";

export const ESV_ATTRIBUTION =
  "Scripture quotations marked ESV are from the ESV® Bible (The Holy Bible, English Standard Version®), " +
  "copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. " +
  "All rights reserved.";

export const WEB_ATTRIBUTION = "World English Bible (WEB), public domain.";

const ESV_API_URL = "https://api.esv.org/v3/passage/text/";

export async function fetchEsvPassage(reference: string): Promise<string> {
  const apiKey = process.env.ESV_API_KEY;
  if (!apiKey) {
    throw new Error("ESV_API_KEY is not configured.");
  }

  const url = new URL(ESV_API_URL);
  url.searchParams.set("q", reference);
  url.searchParams.set("include-headings", "false");
  url.searchParams.set("include-footnotes", "false");
  url.searchParams.set("include-verse-numbers", "true");
  url.searchParams.set("include-short-copyright", "false");
  url.searchParams.set("include-passage-references", "false");

  const response = await fetch(url, {
    headers: { Authorization: `Token ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`ESV API request failed (${response.status}) for "${reference}".`);
  }

  const data = (await response.json()) as { passages?: string[] };
  const text = data.passages?.join("\n\n").trim();

  if (!text) {
    throw new Error(`ESV API returned no text for "${reference}".`);
  }

  return text;
}

// bible-api.com refuses to serve more than one whole chapter per request, so
// multi-chapter and whole-book references are expanded and fetched one
// chapter at a time, then stitched back together.
const WEB_API_BASE = process.env.WEB_TRANSLATION_API_BASE || "https://bible-api.com";

export async function fetchWebPassage(reference: string): Promise<string> {
  const { book, startChapter, endChapter } = parseReference(reference);
  const chapterTexts: string[] = [];

  for (let chapter = startChapter; chapter <= endChapter; chapter++) {
    const url = `${WEB_API_BASE}/${encodeURIComponent(`${book} ${chapter}`)}?translation=web`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`bible-api.com request failed (${response.status}) for "${book} ${chapter}".`);
    }

    const data = (await response.json()) as { text?: string; error?: string };
    if (data.error || !data.text) {
      throw new Error(
        `bible-api.com returned no text for "${book} ${chapter}": ${data.error || "unknown error"}`,
      );
    }

    chapterTexts.push(data.text.trim());
  }

  return chapterTexts.join("\n\n");
}
