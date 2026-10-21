// Combines data/fulltext/*.json (OCR output) into src/lib/fulltext-index.json, which the site imports
// for searching inside documents. Usage: node scripts/build-fulltext-index.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const dir = "data/fulltext";
const docs = readdirSync(dir)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => {
    const { slug, pages } = JSON.parse(readFileSync(`${dir}/${file}`, "utf8"));
    // Drop OCR noise: lines with almost no letters.
    const clean = pages.map((text) =>
      text
        .split("\n")
        .filter((line) => (line.match(/\p{L}/gu) || []).length >= Math.max(3, line.length * 0.5))
        .join("\n")
    );
    return { slug, pages: clean };
  });
writeFileSync("src/lib/fulltext-index.json", JSON.stringify(docs));
const pages = docs.reduce((sum, doc) => sum + doc.pages.length, 0);
console.log(`${docs.length} documents, ${pages} pages`);
