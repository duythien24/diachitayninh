// Estimates a map position for each of the 96 post-2025 communes/wards from the old units each one was
// merged from (listed in src/lib/merge-info.ts, from Nghị quyết 1682/NQ-UBTVQH15). The old units' shapes
// come from GADM 4.1 level 3 (pre-2025 communes): download gadm41_VNM_3.json.zip from
// https://geodata.ucdavis.edu/gadm/gadm4.1/json/ and unzip it, then:
//   node scripts/geocode-communes.mjs path/to/gadm41_VNM_3.json
// Writes src/lib/commune-positions.json (area-weighted centre of the old units).
import { readFileSync, writeFileSync } from "node:fs";

const gadmPath = process.argv[2];
if (!gadmPath) throw new Error("Usage: node scripts/geocode-communes.mjs path/to/gadm41_VNM_3.json");

const fold = (v) => String(v || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").replace(/\s+/g, "").toLowerCase();

// Old units of the two former provinces, with area and centroid of their polygons.
const units = JSON.parse(readFileSync(gadmPath, "utf8"))
  .features.filter((f) => ["tayninh", "longan"].includes(fold(f.properties.NAME_1)))
  .map((f) => {
    const polygons = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    let area = 0, cx = 0, cy = 0;
    for (const ring of polygons.map((p) => p[0])) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [x0, y0] = ring[i];
        const [x1, y1] = ring[i + 1];
        const cross = x0 * y1 - x1 * y0;
        area += cross / 2;
        cx += ((x0 + x1) * cross) / 6;
        cy += ((y0 + y1) * cross) / 6;
      }
    }
    return { name: fold(f.properties.NAME_3), type: fold(f.properties.TYPE_3), district: fold(f.properties.NAME_2), area: Math.abs(area), lon: cx / area, lat: cy / area };
  });

const source = readFileSync("src/lib/merge-info.ts", "utf8");
const entries = [...source.matchAll(/"([a-z0-9-]+)": \{\s*clauseNumber: \d+,\s*note: "([^"]+)"/g)].map((m) => ({ slug: m[1], note: m[2] }));

function oldUnits(note) {
  let body = note.split(/Sắp xếp /)[1]?.split(/ thành (?:xã|phường) mới/)[0] || "";
  body = body
    .replace(/sau khi sắp xếp theo quy định tại khoản \d+(?:,? (?:và )?khoản \d+)*(?: Điều này)?/g, "")
    .replace(/(?:và )?(?:toàn bộ|một phần) diện tích tự nhiên, quy mô dân số (?:của )?/g, ",")
    .replace(/(?:và )?phần còn lại của /g, ",");
  const list = [];
  let type = "xã";
  for (let piece of body.split(/,| và /)) {
    piece = piece.trim();
    const t = piece.match(/^(các xã|xã|các phường|phường|thị trấn)\s+/);
    if (t) {
      type = t[1].replace("các ", "");
      piece = piece.slice(t[0].length);
    }
    const hint = (piece.match(/\(([^)]+)\)/)?.[1] || "").replace(/^(huyện|thị xã|thành phố)\s+/i, "");
    const name = piece.replace(/\(.*?\)/g, "").trim();
    if (name) list.push({ type: fold(type), name: fold(name), hint: fold(hint) });
  }
  return list;
}

const out = {};
const missing = [];
for (const { slug, note } of entries) {
  const wanted = oldUnits(note);
  const options = wanted.map((w) => {
    const sameName = units.filter((u) => u.name === w.name && (!w.hint || u.district === w.hint));
    const sameType = sameName.filter((u) => u.type === w.type);
    return sameType.length ? sameType : sameName;
  });
  // Merged units are neighbours: prefer the district most of them share, then the candidate nearest the rest.
  const votes = {};
  for (const list of options) for (const d of new Set(list.map((u) => u.district))) votes[d] = (votes[d] || 0) + 1;
  const district = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
  const anchors = options.filter((l) => l.length === 1).map((l) => l[0]);
  const picked = options
    .filter((l) => l.length)
    .map((l) => {
      const inDistrict = l.filter((u) => u.district === district);
      const pool = inDistrict.length ? inDistrict : l;
      if (pool.length === 1 || !anchors.length) return pool[0];
      const ax = anchors.reduce((s, a) => s + a.lon, 0) / anchors.length;
      const ay = anchors.reduce((s, a) => s + a.lat, 0) / anchors.length;
      return pool.reduce((a, b) => (Math.hypot(a.lon - ax, a.lat - ay) <= Math.hypot(b.lon - ax, b.lat - ay) ? a : b));
    });
  const unmatched = wanted.filter((_, i) => !options[i].length).map((w) => w.name);
  if (picked.length) {
    const area = picked.reduce((s, u) => s + u.area, 0);
    out[slug] = {
      lat: Number((picked.reduce((s, u) => s + u.lat * u.area, 0) / area).toFixed(5)),
      lon: Number((picked.reduce((s, u) => s + u.lon * u.area, 0) / area).toFixed(5)),
      from: picked.length
    };
  } else missing.push(slug);
  console.log(slug, out[slug] ? `${out[slug].lat},${out[slug].lon} ${picked.length}/${wanted.length} ${district}` : "NOT FOUND", unmatched.length ? `unmatched: ${unmatched.join(" ")}` : "");
}
writeFileSync("src/lib/commune-positions.json", JSON.stringify(out, null, 1));
console.log(`found ${Object.keys(out).length} of ${entries.length}`, missing.join(" "));
