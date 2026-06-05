const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const envFile = path.join(process.cwd(), ".env.local");
const reportFile = path.join(process.cwd(), "tmp", "clean-document-descriptions-report.json");

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

function cleanDescription(description) {
  const cleaned = String(description || "")
    .replace(/\s*Nguồn metadata:\s*https?:\/\/\S+/gi, "")
    .replace(/\s*Dung lượng ghi nhận từ nguồn:\s*[^.]+\.?/gi, "")
    .replace(/\s*https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const subjectOnly = cleaned.match(/^Chủ đề:\s*(.+?)\.?$/i);
  if (subjectOnly?.[1]) {
    return `Tư liệu thuộc chủ đề ${subjectOnly[1].trim().replace(/\.$/, "")}.`;
  }

  return cleaned;
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

  const { data, error } = await supabase.from("documents").select("id,title,description").limit(1000);
  if (error) throw new Error(error.message);

  const changed = [];
  const failed = [];

  for (const document of data || []) {
    const nextDescription = cleanDescription(document.description);

    if (nextDescription === (document.description || "")) {
      continue;
    }

    changed.push({
      id: document.id,
      title: document.title,
      before: document.description,
      after: nextDescription
    });

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from("documents")
        .update({ description: nextDescription })
        .eq("id", document.id);

      if (updateError) {
        failed.push({ id: document.id, title: document.title, reason: updateError.message });
      }
    }
  }

  const report = {
    dryRun,
    scanned: data?.length || 0,
    changed: changed.length,
    failed
  };

  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, JSON.stringify({ ...report, items: changed }, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
