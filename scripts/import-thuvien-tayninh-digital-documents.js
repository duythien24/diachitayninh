const fs = require("fs");
const https = require("https");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const sourceBaseUrl = "https://thuvien.tayninh.gov.vn";
const sourceTreeId = 605;
const sourceFile = path.join(process.cwd(), "tmp", "tayninh-digital-documents-605.json");
const reportFile = path.join(process.cwd(), "tmp", "tayninh-digital-documents-import-report.json");
const envFile = path.join(process.cwd(), ".env.local");
const mergeInfoFile = path.join(process.cwd(), "src", "lib", "merge-info.ts");

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

function request(url, options = {}, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : "";
    const req = https.request(
      url,
      {
        ...options,
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json, text/javascript, */*; q=0.01",
          ...(body
            ? {
                "Content-Type": "application/json;charset=utf-8",
                "Content-Length": Buffer.byteLength(data)
              }
            : {}),
          ...(options.headers || {})
        }
      },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: responseBody }));
      }
    );

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
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
    .slice(0, 80);
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePageCount(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function parseYear(document) {
  const fields = [document.DATEPUBLISHER, document.TITLE, document.SUBJECT, document.DESCRIPTION, document.CREATED];
  for (const field of fields) {
    const match = String(field || "").match(/\b(18|19|20)\d{2}\b/);
    if (match) return Number(match[0]);
  }
  return document.CREATED ? new Date(document.CREATED).getFullYear() : new Date().getFullYear();
}

function keywords(document) {
  const raw = [document.SUBJECT, normalizeVietnamese(document.TITLE).includes("tay ninh") ? "Tây Ninh" : ""]
    .filter(Boolean)
    .join(",");
  const seen = new Set();
  return raw
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const key = normalizeVietnamese(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

function textFor(document) {
  return normalizeVietnamese(
    [document.TITLE, document.SUBJECT, stripHtml(document.DESCRIPTION), document.PUBLISHER, document.CREATOR].join(" ")
  );
}

function wordIncludes(text, term) {
  if (!term || term.length < 4) return false;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(text);
}

function parseMergeInfo() {
  if (!fs.existsSync(mergeInfoFile)) return new Map();

  const content = fs.readFileSync(mergeInfoFile, "utf8");
  const result = new Map();
  const recordRegex = /"([^"]+)":\s*{([\s\S]*?)\n\s*}/g;
  let match;

  while ((match = recordRegex.exec(content))) {
    const slug = match[1];
    const body = match[2];
    const clauseMatch = body.match(/clauseNumber:\s*(\d+)/);
    const noteMatch = body.match(/note:\s*"([^"]+)"/);
    const clauseNumber = clauseMatch ? Number(clauseMatch[1]) : null;
    const normalizedNote = normalizeVietnamese(noteMatch ? noteMatch[1] : "");
    const aliases = new Set();
    const unitRegex =
      /\b(?:xa|phuong|thi tran|thanh pho|thi xa|huyen)\s+([a-z0-9\s-]+?)(?=,|\s+va\b|\s+thanh\s+(?:xa|phuong)\s+moi\b|\s+sau\b|\s+\(|$)/g;
    let unitMatch;

    while ((unitMatch = unitRegex.exec(normalizedNote))) {
      const alias = unitMatch[1].trim().replace(/\s+/g, " ");
      const genericAliases = new Set(["ninh", "long", "hoa", "thanh", "tan", "phuoc", "binh", "phan"]);
      if (alias.length >= 4 && !genericAliases.has(alias)) aliases.add(alias);
    }

    result.set(slug, { clauseNumber, aliases: Array.from(aliases) });
  }

  return result;
}

function isTayNinhSideCommune(commune, mergeInfoBySlug) {
  const longAnSideSlugs = new Set(["kien-tuong", "long-an", "tan-an", "khanh-hau"]);
  if (longAnSideSlugs.has(commune.slug)) return false;

  const mergeInfo = mergeInfoBySlug.get(commune.slug);
  if (!mergeInfo || !mergeInfo.clauseNumber) return true;
  return mergeInfo.clauseNumber >= 57;
}

function isLocalDocument(document, communeMatches) {
  const haystack = textFor(document);
  const localTerms = [
    "tay ninh",
    "trang bang",
    "go dau",
    "tan bien",
    "tan chau",
    "chau thanh",
    "hoa thanh",
    "duong minh chau",
    "ben cau",
    "lo go",
    "xa mat",
    "ba den",
    "tua hai",
    "boi loi",
    "cao dai",
    "toa thanh",
    "ta mun",
    "can cu dia"
  ];

  return communeMatches.length > 0 || localTerms.some((term) => wordIncludes(haystack, term));
}

function documentTypeFor(communeMatches) {
  return communeMatches.length > 0 ? "dia_chi" : "tai_lieu_cap_tinh";
}

function descriptionFor(document, sourceUrl) {
  const parts = [
    stripHtml(document.DESCRIPTION),
    document.SUBJECT ? `Chủ đề: ${document.SUBJECT}.` : "",
    document.COVERAGE ? `Dung lượng ghi nhận từ nguồn: ${document.COVERAGE}.` : "",
    `Nguồn metadata: ${sourceUrl}`
  ].filter(Boolean);
  return parts.join(" ");
}

async function fetchSourceDocuments() {
  if (fs.existsSync(sourceFile)) {
    return JSON.parse(fs.readFileSync(sourceFile, "utf8"));
  }

  const indexUrl = `${sourceBaseUrl}/DigitalDocument/Index?currentTreeId=${sourceTreeId}&currentViewId=new&display=icon`;
  const index = await request(indexUrl);
  const cookies = (index.headers["set-cookie"] || []).map((cookie) => cookie.split(";")[0]).join("; ");
  const token = (index.body.match(/<input[^>]+name=["']__RequestVerificationToken["'][^>]+value=["']([^"']+)["']/) || [])[1];

  if (!token) {
    throw new Error("Không lấy được RequestVerificationToken từ trang nguồn.");
  }

  const commonHeaders = {
    Cookie: cookies,
    Referer: indexUrl,
    "X-Requested-With": "XMLHttpRequest",
    RequestVerificationToken: token
  };
  const searchParams = {
    treeId: sourceTreeId,
    value: "||||",
    column: "AND|TITLE*AND|TITLE*AND|CREATOR*AND|SUBJECT*AND|DESCRIPTION",
    material: "",
    filestate: "1",
    createFrom: "1111-1-1 00:00:00.000",
    createTo: "1111-1-1 00:00:00.000",
    updateFrom: "1111-1-1 00:00:00.000",
    updateTo: "1111-1-1 00:00:00.000",
    lstCreatedBy: [],
    lstModifiedBy: [],
    lstLanguage: [""],
    limitAmount: "-1",
    isCorrect: "0",
    whereFind: "0"
  };

  const countResult = await request(`${sourceBaseUrl}/DigitalDocument/PSearchDigitalDocument_Count`, { method: "POST", headers: commonHeaders }, searchParams);
  const count = JSON.parse(countResult.body).countResult;
  const pageResult = await request(
    `${sourceBaseUrl}/DigitalDocument/SearchDigitalDocument_Paging`,
    { method: "POST", headers: commonHeaders },
    { pageIndex: "1", pageSize: String(count), lstOrderBy: ["FILEID"], typeOrder: "0" }
  );

  const documents = JSON.parse(pageResult.body).ListDocFile || [];
  fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
  fs.writeFileSync(sourceFile, JSON.stringify(documents, null, 2));
  return documents;
}

function buildCommuneTerms(communes, mergeInfoBySlug) {
  return (communes || [])
    .filter((commune) => isTayNinhSideCommune(commune, mergeInfoBySlug))
    .map((commune) => {
      const mergeInfo = mergeInfoBySlug.get(commune.slug);
      const aliases = new Set([
        normalizeVietnamese(commune.name),
        normalizeVietnamese(`${commune.type === "phuong" ? "phường" : "xã"} ${commune.name}`),
        ...(mergeInfo?.aliases || [])
      ]);

      return {
        ...commune,
        aliases: Array.from(aliases).filter((alias) => alias.length >= 4)
      };
    });
}

function matchedCommunes(document, communeTerms) {
  const text = textFor(document);
  return communeTerms.filter((commune) => commune.aliases.some((alias) => wordIncludes(text, alias)));
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");
  const strictLocalOnly = process.argv.includes("--strict-local");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const sourceDocuments = await fetchSourceDocuments();
  const mergeInfoBySlug = parseMergeInfo();
  const { data: communes, error: communeError } = await supabase.from("communes").select("id,name,type,slug");

  if (communeError) throw new Error(communeError.message);

  const communeTerms = buildCommuneTerms(communes, mergeInfoBySlug);
  const { data: existingRows, error: existingError } = await supabase.from("documents").select("id,slug,title");

  if (existingError) throw new Error(existingError.message);

  const existingSlugs = new Set((existingRows || []).map((row) => row.slug));
  const existingTitles = new Set((existingRows || []).map((row) => normalizeVietnamese(row.title)));
  const candidates = [];
  const skipped = [];

  for (const document of sourceDocuments) {
    const communeMatches = matchedCommunes(document, communeTerms);

    if (strictLocalOnly && !isLocalDocument(document, communeMatches)) {
      skipped.push({ fileId: document.FILEID, title: document.TITLE, reason: "not-local" });
      continue;
    }

    const slug = slugify(`${document.TITLE}-${document.FILEID}`);
    if (existingSlugs.has(slug) || existingTitles.has(normalizeVietnamese(document.TITLE))) {
      skipped.push({ fileId: document.FILEID, title: document.TITLE, reason: "exists" });
      continue;
    }

    const sourceUrl = `${sourceBaseUrl}/DigitalDocument/Detail?treeId=${sourceTreeId}&currentTreeId=${sourceTreeId}&fileId=${document.FILEID}`;
    const readerUrl = `${sourceBaseUrl}/ViewOnline/Index?id=${document.FILEID}&type=digitaldocument`;
    const coverUrl = `${sourceBaseUrl}/DigitalDocument/ViewImage/?docFileId=${document.FILEID}`;
    const uniqueCommuneIds = Array.from(new Set(communeMatches.map((commune) => commune.id)));
    const pageCount = parsePageCount(document.COVERAGE);

    candidates.push({
      source: document,
      communeNames: communeMatches.map((commune) => commune.name),
      communeIds: uniqueCommuneIds,
      data: {
        title: document.TITLE,
        slug,
        document_type: documentTypeFor(communeMatches),
        commune_id: uniqueCommuneIds[0] || null,
        year: parseYear(document),
        page_count: pageCount,
        preview_page_count: pageCount || 10,
        keywords: keywords(document),
        author: document.CREATOR || null,
        publisher: document.PUBLISHER || null,
        description: descriptionFor(document, sourceUrl),
        source: "Thư viện tỉnh Tây Ninh - Tài liệu số",
        preview_file_url: readerUrl,
        cover_image_url: coverUrl,
        is_preview_only: false,
        contact_note: "Tài liệu được liên kết từ kho Tài liệu số của Thư viện tỉnh Tây Ninh.",
        created_at: document.CREATED || new Date().toISOString()
      }
    });
  }

  let inserted = 0;
  let linked = 0;

  if (!dryRun) {
    for (const candidate of candidates) {
      const { data, error } = await supabase.from("documents").insert(candidate.data).select("id").single();
      if (error) {
        skipped.push({ fileId: candidate.source.FILEID, title: candidate.source.TITLE, reason: error.message });
        continue;
      }

      inserted += 1;

      if (candidate.communeIds.length) {
        const { error: linkError } = await supabase.from("document_communes").insert(
          candidate.communeIds.map((communeId) => ({
            document_id: data.id,
            commune_id: communeId
          }))
        );

        if (linkError) {
          skipped.push({ fileId: candidate.source.FILEID, title: candidate.source.TITLE, reason: linkError.message });
        } else {
          linked += candidate.communeIds.length;
        }
      }
    }
  }

  const byType = candidates.reduce(
    (result, candidate) => {
      result[candidate.data.document_type] = (result[candidate.data.document_type] || 0) + 1;
      return result;
    },
    {}
  );
  const report = {
    dryRun,
    sourceCount: sourceDocuments.length,
    candidateCount: candidates.length,
    byType,
    inserted,
    linked,
    skippedCount: skipped.length,
    candidates: candidates.map((candidate) => ({
      fileId: candidate.source.FILEID,
      title: candidate.source.TITLE,
      documentType: candidate.data.document_type,
      communes: candidate.communeNames
    })),
    skipped
  };

  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
