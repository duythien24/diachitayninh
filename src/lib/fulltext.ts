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

let prepared: { slug: string; pages: { text: string; folded: string }[] }[] | null = null;
function documents() {
  if (!prepared) {
    prepared = (index as IndexedDocument[]).map((doc) => ({
      slug: doc.slug,
      // Characters outside the BMP would break the one-to-one mapping; OCR text has none worth keeping.
      pages: doc.pages.map((text) => {
        const clean = text.replace(/[\uD800-\uDFFF]/g, " ");
        return { text: clean, folded: fold(clean) };
      })
    }));
  }
  return prepared;
}

export function hasFullText(slug: string) {
  return documents().some((doc) => doc.slug === slug);
}

export function searchFullText(query: string, limit = 12): FullTextHit[] {
  const words = fold(query)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 2);
  if (!words.length) return [];
  const phrase = fold(query).replace(/[^a-z0-9]+/g, " ").trim();

  const hits: FullTextHit[] = [];
  for (const doc of documents()) {
    const pages: FullTextHit["pages"] = [];
    let matchCount = 0;
    doc.pages.forEach(({ text, folded }, index) => {
      if (!words.every((word) => folded.includes(word))) return;
      // Prefer the whole phrase for the snippet; otherwise the first word.
      const flat = folded.replace(/\s+/g, " ");
      const phraseHere = phrase.includes(" ") && flat.includes(phrase);
      matchCount += phraseHere ? 3 : 1;
      const anchorWord = phraseHere ? phrase.split(" ")[0] : words[0];
      const at = folded.indexOf(anchorWord);
      const start = Math.max(0, at - 90);
      const end = Math.min(text.length, at + 160);
      const body = text.slice(start, end).replace(/\s+/g, " ").trim();
      const shown = `${start > 0 ? "…" : ""}${body}${end < text.length ? "…" : ""}`;
      const foldedShown = fold(shown);
      const highlights: Array<[number, number]> = [];
      for (const word of words) {
        let found = foldedShown.indexOf(word);
        while (found !== -1) {
          highlights.push([found, found + word.length]);
          found = foldedShown.indexOf(word, found + word.length);
        }
      }
      highlights.sort((x, y) => x[0] - y[0]);
      pages.push({ page: index + 1, snippet: shown, highlights });
    });
    if (pages.length) hits.push({ slug: doc.slug, matchCount: matchCount + pages.length, pages });
  }
  return hits.sort((a, b) => b.matchCount - a.matchCount).slice(0, limit);
}
