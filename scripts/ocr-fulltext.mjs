// Builds the full-text search data: reads every document page of the live site, takes the PDFs stored on
// our own storage (documents opened in the Thư viện tỉnh viewer have no PDF here), renders each page and
// runs Vietnamese OCR. Writes data/fulltext/<slug>.json = { slug, pages: [text of page 1, ...] }.
// Already processed PDFs are skipped (same URL). Usage: node scripts/ocr-fulltext.mjs [site] [workers]
// Needs vie.traineddata in the project root.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const site = process.argv[2] || "https://diachitayninh.vercel.app";
const workers = Number(process.argv[3] || 3);
const require = createRequire(import.meta.url);
const pdfjs = await import(pathToFileURL(require.resolve("pdfjs-dist/legacy/build/pdf.mjs")).href);
const { createCanvas } = require("@napi-rs/canvas");
const { createWorker } = require("tesseract.js");
const outDir = "data/fulltext";
mkdirSync(outDir, { recursive: true });

const sitemap = await (await fetch(`${site}/sitemap.xml`)).text();
const slugs = [...new Set([...sitemap.matchAll(/\/tai-lieu\/([^<\s]+)/g)].map((m) => m[1]))];

const docs = [];
for (const slug of slugs) {
  const html = await (await fetch(`${site}/doc/${slug}`)).text().catch(() => "");
  const pdf = html.match(/https:\/\/[^"\\\s]+?\.supabase\.co\/storage\/[^"\\\s]+?\.pdf/)?.[0];
  if (pdf) docs.push({ slug, pdf });
}
console.log(`${docs.length} of ${slugs.length} documents have a PDF on our storage`);

const queue = docs.filter(({ slug, pdf }) => {
  const file = path.join(outDir, `${slug}.json`);
  return !existsSync(file) || JSON.parse(readFileSync(file, "utf8")).source !== pdf;
});
console.log(`${queue.length} to OCR`);

async function ocrDocument(worker, { slug, pdf }) {
  const data = new Uint8Array(await (await fetch(pdf)).arrayBuffer());
  const doc = await pdfjs.getDocument({ data, verbosity: 0 }).promise;
  const pages = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 1700 / Math.max(base.width, base.height) });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;
    const { data: result } = await worker.recognize(canvas.toBuffer("image/png"));
    pages.push(result.text.replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim());
  }
  await doc.destroy();
  writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify({ slug, source: pdf, pages }));
  console.log(`${slug}: ${pages.length} pages`);
}

let next = 0;
await Promise.all(
  Array.from({ length: workers }, async () => {
    const worker = await createWorker("vie", 1, { langPath: process.cwd(), gzip: false, cachePath: ".tess-cache" });
    while (next < queue.length) {
      const item = queue[next++];
      await ocrDocument(worker, item).catch((error) => console.log(`${item.slug}: FAILED ${error.message}`));
    }
    await worker.terminate();
  })
);
console.log("done");
