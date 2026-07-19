// Parses reading-plan reference strings ("Genesis 1-3", "Job 6", "Ruth",
// "I Corinthians 15-16") into a book name plus chapter range. Needed because
// the WEB fallback translation's API can only fetch one whole chapter per
// request, so multi-chapter and whole-book references must be expanded.

const ROMAN_PREFIXES: [string, string][] = [
  ["III ", "3 "],
  ["II ", "2 "],
  ["I ", "1 "],
];

function normalizeBookPrefix(reference: string): string {
  for (const [roman, arabic] of ROMAN_PREFIXES) {
    if (reference.startsWith(roman)) {
      return arabic + reference.slice(roman.length);
    }
  }
  return reference;
}

const BOOK_CHAPTER_COUNTS: Record<string, number> = {
  Genesis: 50,
  Exodus: 40,
  Leviticus: 27,
  Numbers: 36,
  Deuteronomy: 34,
  Joshua: 24,
  Judges: 21,
  Ruth: 4,
  "1 Samuel": 31,
  "2 Samuel": 24,
  "1 Kings": 22,
  "2 Kings": 25,
  "1 Chronicles": 29,
  "2 Chronicles": 36,
  Ezra: 10,
  Nehemiah: 13,
  Esther: 10,
  Job: 42,
  Psalms: 150,
  Proverbs: 31,
  Ecclesiastes: 12,
  "Song of Solomon": 8,
  Isaiah: 66,
  Jeremiah: 52,
  Lamentations: 5,
  Ezekiel: 48,
  Daniel: 12,
  Hosea: 14,
  Joel: 3,
  Amos: 9,
  Obadiah: 1,
  Jonah: 4,
  Micah: 7,
  Nahum: 3,
  Habakkuk: 3,
  Zephaniah: 3,
  Haggai: 2,
  Zechariah: 14,
  Malachi: 4,
  Matthew: 28,
  Mark: 16,
  Luke: 24,
  John: 21,
  Acts: 28,
  Romans: 16,
  "1 Corinthians": 16,
  "2 Corinthians": 13,
  Galatians: 6,
  Ephesians: 6,
  Philippians: 4,
  Colossians: 4,
  "1 Thessalonians": 5,
  "2 Thessalonians": 3,
  "1 Timothy": 6,
  "2 Timothy": 4,
  Titus: 3,
  Philemon: 1,
  Hebrews: 13,
  James: 5,
  "1 Peter": 5,
  "2 Peter": 3,
  "1 John": 5,
  "2 John": 1,
  "3 John": 1,
  Jude: 1,
  Revelation: 22,
};

export type ParsedReference = {
  book: string;
  startChapter: number;
  endChapter: number;
};

export function parseReference(rawReference: string): ParsedReference {
  const reference = normalizeBookPrefix(rawReference.trim());
  const match = reference.match(/^(.+?)\s+(\d+)(?:-(\d+))?$/);

  if (!match) {
    const chapterCount = BOOK_CHAPTER_COUNTS[reference];
    if (!chapterCount) {
      throw new Error(`Unknown book reference: "${rawReference}"`);
    }
    return { book: reference, startChapter: 1, endChapter: chapterCount };
  }

  const [, book, start, end] = match;
  if (!BOOK_CHAPTER_COUNTS[book]) {
    throw new Error(`Unknown book in reference: "${rawReference}"`);
  }

  return {
    book,
    startChapter: Number(start),
    endChapter: end ? Number(end) : Number(start),
  };
}
