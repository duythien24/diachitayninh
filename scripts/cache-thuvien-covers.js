const fs = require("fs");
const https = require("https");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const envFile = path.join(process.cwd(), ".env.local");
const outputDir = path.join(process.cwd(), "public", "thuvien-covers");
const reportFile = path.join(process.cwd(), "tmp", "thuvien-cover-cache-report.json");
const sourceHost = "thuvien.tayninh.gov.vn";

function loadEnv() {
  if (!fs.existsSync(envFile)) return;

  const env = fs.readFileSync(envFile, "utf8");
  for (const line of env.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = rest.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

function normalizeVietnamese(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function slugify(value) {
  return normalizeVietnamese(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function extensionFor(buffer, contentType = "") {
  const type = contentType.toLowerCase();

  if (type.includes("png") || buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }

  if (type.includes("webp") || buffer.subarray(0, 4).toString("ascii") === "RIFF") {
    return "webp";
  }

  return "jpg";
}

function downloadBuffer(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        }
      },
      (res) => {
        const location = res.headers.location;
        if (res.statusCode >= 300 && res.statusCode < 400 && location && redirects < 5) {
          res.resume();
          resolve(downloadBuffer(new URL(location, url).toString(), redirects + 1));
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({ buffer, contentType: String(res.headers["content-type"] || "") });
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error("Download timeout"));
    });
  });
}

async function main() {
  loadEnv();

  const dryRun = process.argv.includes("--dry-run");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data, error } = await supabase
    .from("documents")
    .select("id,title,slug,cover_image_url")
    .ilike("cover_image_url", `%${sourceHost}%`)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error(error.message);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const report = {
    dryRun,
    scanned: data.length,
    cached: 0,
    updated: 0,
    skipped: [],
    failed: []
  };

  for (const document of data) {
    const sourceUrl = document.cover_image_url;
    const baseName = slugify(`${document.slug || document.title}-${document.id}`);

    try {
      const { buffer, contentType } = await downloadBuffer(sourceUrl);

      if (!buffer.length || (!contentType.toLowerCase().startsWith("image/") && !contentType.toLowerCase().includes("octet-stream"))) {
        report.failed.push({ id: document.id, title: document.title, reason: `Unexpected content type: ${contentType}` });
        continue;
      }

      const extension = extensionFor(buffer, contentType);
      const fileName = `${baseName}.${extension}`;
      const filePath = path.join(outputDir, fileName);
      const publicUrl = `/thuvien-covers/${fileName}`;

      if (!fs.existsSync(filePath) || fs.statSync(filePath).size !== buffer.length) {
        if (!dryRun) {
          fs.writeFileSync(filePath, buffer);
        }
        report.cached += 1;
      } else {
        report.skipped.push({ id: document.id, title: document.title, reason: "file-exists" });
      }

      if (!dryRun) {
        const { error: updateError } = await supabase.from("documents").update({ cover_image_url: publicUrl }).eq("id", document.id);
        if (updateError) {
          report.failed.push({ id: document.id, title: document.title, reason: updateError.message });
          continue;
        }
      }

      report.updated += 1;
    } catch (error) {
      report.failed.push({ id: document.id, title: document.title, reason: error.message });
    }
  }

  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
