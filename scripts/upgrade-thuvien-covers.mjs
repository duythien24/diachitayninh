// Replaces the small cached covers in public/thuvien-covers (about 167 px wide, blurry when shown)
// with a sharp 600 px version of page 1, taken from the library's online reader, which embeds full-size page scans.
// File names stay the same, so no database change is needed. Usage: node scripts/upgrade-thuvien-covers.mjs
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.join(process.cwd(), "public", "thuvien-covers");
const targetWidth = 600;
const files = readdirSync(dir).filter((name) => /-(\d{4,6})-[0-9a-f]{8}/.test(name));
const results = { upgraded: [], skipped: [], failed: [] };

async function upgrade(name) {
  const fileId = name.match(/-(\d{4,6})-[0-9a-f]{8}/)[1];
  const current = await sharp(path.join(dir, name)).metadata();
  if ((current.width || 0) >= targetWidth) {
    results.skipped.push(name);
    return;
  }

  const response = await fetch(`https://thuvien.tayninh.gov.vn/ViewOnline/Index?id=${fileId}&type=digitaldocument`);
  const html = await response.text();
  const base64 = html.match(/data:image\/jpe?g;base64,([A-Za-z0-9+/=]+)/)?.[1];
  if (!base64) throw new Error("no embedded page image");

  const page = sharp(Buffer.from(base64, "base64"), { limitInputPixels: false });
  const meta = await page.metadata();
  if (!meta.width || meta.width <= (current.width || 0)) throw new Error(`source not larger (${meta.width}px)`);

  const output = await page.resize({ width: Math.min(targetWidth, meta.width) }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  writeFileSync(path.join(dir, name), output);
  results.upgraded.push(`${name} ${current.width}px -> ${Math.min(targetWidth, meta.width)}px`);
}

const queue = [...files];
async function worker() {
  while (queue.length) {
    const name = queue.shift();
    try {
      await upgrade(name);
    } catch (error) {
      results.failed.push(`${name}: ${error.message}`);
    }
  }
}

await Promise.all([worker(), worker(), worker()]);
console.log(`upgraded ${results.upgraded.length}, skipped ${results.skipped.length}, failed ${results.failed.length}`);
for (const line of results.failed) console.log("FAILED", line);
console.log(`total size ${(readdirSync(dir).reduce((sum, name) => sum + statSync(path.join(dir, name)).size, 0) / 1e6).toFixed(1)} MB`);
