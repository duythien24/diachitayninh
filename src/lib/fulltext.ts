import "server-only";

// Search inside the pages of scanned documents (text from OCR, built by scripts/ocr-fulltext.mjs and
// scripts/build-fulltext-index.mjs). Matching ignores Vietnamese accents and case; every word of the
// query must appear on the page.
import index from "@/lib/fulltext-index.json";

type IndexedDocument = { slug: string; pages: string[] };

export type FullTextHit = {
  slug: string;
  matchCount: number;
  pages: { page: number; snippet: string; highlights: Array<[number, number]> }[];
};

// One folded character per original character, so positions found in the folded text map back to the
// original text for snippets.
function foldChar(char: string) {
  if (char === "đ" || char === "Đ") return "d";
  return (char.normalize("NFD")[0] || char).toLowerCase();
}
function fold(text: string) {
  let out = "";
  for (const char of text) out += foldChar(char).length === 1 ? foldChar(char) : " ";
  return out;
}

let prepared: { slug: string; pages: { text: string; folded: string; lower: string }[] }[] | null = null;
function documents() {
  if (!prepared) {
    prepared = (index as IndexedDocument[]).map((doc) => ({
      slug: doc.slug,
      // Characters outside the BMP would break the one-to-one mapping; OCR text has none worth keeping.
      pages: doc.pages.map((text) => {
        const clean = text.normalize("NFC").replace(/[\uD800-\uDFFF]/g, " ");
        return { text: clean, folded: fold(clean), lower: clean.toLowerCase() };
      })
    }));
  }
  return prepared;
}

export function hasFullText(slug: string) {
  return documents().some((doc) => doc.slug === slug);
}

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Whole words only, so "vo" does not match inside "voi".
const wordPattern = (word: string) => new RegExp(`(?<![\\p{L}\\p{N}])${escape(word)}(?![\\p{L}\\p{N}])`, "gu");

// Typed with accents: accents must match (Võ is not Vợ). Typed without: any accents match.
export function searchFullText(query: string, limit = 12): FullTextHit[] {
  const raw = query.normalize("NFC").toLowerCase().trim();
  const accented = fold(raw) !== raw;
  const source = (page: { folded: string; lower: string }) => (accented ? page.lower : page.folded);
  const base = accented ? raw : fold(raw);
  const words = base.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 2 || /\p{N}/u.test(word));
  if (!words.length) return [];
  const phrase = words.length > 1 ? new RegExp(words.map(escape).join("[^\\p{L}\\p{N}]+"), "gu") : null;
  const wordRes = words.map(wordPattern);

  type PageHit = { page: number; text: string; haystack: string; phraseAt: number };
  const found: { slug: string; pages: PageHit[] }[] = [];
  let anyPhrase = false;
  for (const doc of documents()) {
    const pages: PageHit[] = [];
    doc.pages.forEach((page, index) => {
      const haystack = source(page);
      if (!wordRes.every((re) => { re.lastIndex = 0; return re.test(haystack); })) return;
      let phraseAt = -1;
      if (phrase) {
        phrase.lastIndex = 0;
        const match = phrase.exec(haystack);
        if (match) { phraseAt = match.index; anyPhrase = true; }
      }
      pages.push({ page: index + 1, text: page.text, haystack, phraseAt });
    });
    if (pages.length) found.push({ slug: doc.slug, pages });
  }

  // When the exact phrase occurs somewhere, show only those pages.
  const hits: FullTextHit[] = [];
  for (const doc of found) {
    const pages = anyPhrase ? doc.pages.filter((page) => page.phraseAt >= 0) : doc.pages;
    if (!pages.length) continue;
    hits.push({
      slug: doc.slug,
      matchCount: pages.length,
      pages: pages.map(({ page, text, haystack, phraseAt }) => {
        wordRes[0].lastIndex = 0;
        const at = phraseAt >= 0 ? phraseAt : (wordRes[0].exec(haystack)?.index ?? 0);
        const start = Math.max(0, at - 90);
        const end = Math.min(text.length, at + 160);
        const body = text.slice(start, end).replace(/\s+/g, " ").trim();
        const shown = `${start > 0 ? "…" : ""}${body}${end < text.length ? "…" : ""}`;
        const shownHay = accented ? shown.toLowerCase() : fold(shown);
        const highlights: Array<[number, number]> = [];
        for (const re of wordRes) {
          re.lastIndex = 0;
          for (const match of shownHay.matchAll(re)) highlights.push([match.index ?? 0, (match.index ?? 0) + match[0].length]);
        }
        highlights.sort((x, y) => x[0] - y[0]);
        return { page, snippet: shown, highlights };
      })
    });
  }
  return hits.sort((a, b) => b.matchCount - a.matchCount).slice(0, limit);
}
