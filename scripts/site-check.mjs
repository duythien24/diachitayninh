// Checks the live site and summarises its content. Used by the scheduled GitHub workflows.
// Usage: node scripts/site-check.mjs [health|report]
// Writes Markdown to $GITHUB_STEP_SUMMARY (when set) and to stdout; exits 1 when the health check fails.
import { appendFileSync } from "node:fs";

const baseUrl = (process.env.SITE_URL || "https://diachitayninh.vercel.app").replace(/\/+$/, "");
const mode = process.argv[2] || "health";

// Slugs of the bundled mock documents (src/lib/data.ts). Seeing one on the live site means it fell back to sample data.
const mockSlugs = [
  "dia-chi-xa-tan-bien-preview",
  "dia-chi-phuong-tan-ninh-preview",
  "dia-chi-phuong-trang-bang-preview",
  "bao-tay-ninh-van-hoa-dia-phuong-preview",
  "bao-tay-ninh-tuyen-chon-lich-su-preview"
];

async function fetchPage(path) {
  const started = Date.now();
  const response = await fetch(`${baseUrl}${path}`, { headers: { "user-agent": "diachitayninh-site-check" } });
  const body = await response.text();
  return { status: response.status, body, ms: Date.now() - started };
}

function plainText(html) {
  return html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function output(markdown) {
  console.log(markdown);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  }
}

async function health() {
  const problems = [];
  const pages = {};

  for (const path of ["/", "/tai-lieu", "/xa-phuong", "/sitemap.xml"]) {
    try {
      pages[path] = await fetchPage(path);
      if (pages[path].status !== 200) problems.push(`\`${path}\` trả về mã ${pages[path].status}`);
    } catch (error) {
      problems.push(`\`${path}\` không truy cập được: ${error.message}`);
    }
  }

  const home = pages["/"]?.body || "";
  const shownMocks = mockSlugs.filter((slug) => home.includes(slug));
  if (shownMocks.length) problems.push(`Trang chủ đang hiện dữ liệu mẫu (${shownMocks.join(", ")})`);
  if (home.includes("Chưa tải được kho tư liệu")) problems.push("Trang chủ đang hiện trang lỗi tải dữ liệu");

  const documentCount = new Set((pages["/sitemap.xml"]?.body || "").match(/\/tai-lieu\/[^<\s]+/g) || []).size;
  if (documentCount === 0) problems.push("Sitemap không có tài liệu nào");

  const timings = Object.entries(pages).map(([path, page]) => `${path} ${page.ms} ms`).join(", ");

  if (problems.length) {
    output(`## Trang Địa chí số đang gặp sự cố\n\n${problems.map((p) => `- ${p}`).join("\n")}\n\nThời gian phản hồi: ${timings}`);
    process.exit(1);
  }

  output(`## Trang Địa chí số hoạt động bình thường\n\n${documentCount} tài liệu trong sitemap. Thời gian phản hồi: ${timings}`);
}

async function report() {
  const [home, communes, sitemap] = await Promise.all([fetchPage("/"), fetchPage("/xa-phuong"), fetchPage("/sitemap.xml")]);
  const homeText = plainText(home.body);
  const communeText = plainText(communes.body);

  const archives = ["Địa chí Tây Ninh", "Báo Tây Ninh", "Tài liệu cấp tỉnh"].map((title) => {
    const archiveSection = homeText.slice(homeText.indexOf("Ba kho tư liệu"));
    const after = archiveSection.slice(archiveSection.indexOf(title));
    const match = after.match(/(\d+) tài liệu|Đang bổ sung/);
    return { title, count: match?.[1] ? Number(match[1]) : 0 };
  });
  const coverage = communeText.match(/(\d+) trên (\d+) xã, phường đã có tư liệu/);
  const total = new Set(sitemap.body.match(/\/tai-lieu\/[^<\s]+/g) || []).size;
  const today = new Date().toISOString().slice(0, 10);

  output(
    [
      `## Báo cáo nội dung Địa chí số, ngày ${today}`,
      "",
      `Tổng số tài liệu: **${total}**.`,
      coverage ? `Xã, phường đã có tư liệu: **${coverage[1]} trên ${coverage[2]}**.` : "Không đọc được số xã, phường đã có tư liệu.",
      "",
      "| Kho | Số tài liệu |",
      "| --- | --- |",
      ...archives.map((archive) => `| ${archive.title} | ${archive.count} |`)
    ].join("\n")
  );
}

await (mode === "report" ? report() : health());
