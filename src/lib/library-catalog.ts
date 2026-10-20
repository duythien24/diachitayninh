import "server-only";

// Searches the digital collection of thuvien.tayninh.gov.vn (the same endpoints scripts/import-thuvien-tayninh-digital-documents.js uses)
// so the admin form can prefill a book's details instead of typing them.
const baseUrl = "https://thuvien.tayninh.gov.vn";
const treeId = "605";

export type CatalogMatch = {
  fileId: number;
  title: string;
  author: string;
  publisher: string;
  year?: number;
  subjects: string[];
  description: string;
  pageCount?: number;
  sourceUrl: string;
  coverUrl: string;
};

type SourceDocument = {
  FILEID: number;
  TITLE?: string;
  CREATOR?: string;
  PUBLISHER?: string;
  DATEPUBLISHER?: string;
  SUBJECT?: string;
  DESCRIPTION?: string;
  COVERAGE?: string;
};

function toMatch(document: SourceDocument): CatalogMatch {
  const year = Number((document.DATEPUBLISHER || "").match(/(1[89]\d{2}|20\d{2})/)?.[1]);
  const pages = Number((document.COVERAGE || "").match(/(\d+)\s*tr/i)?.[1]);

  return {
    fileId: document.FILEID,
    title: (document.TITLE || "").trim(),
    author: (document.CREATOR || "").trim(),
    publisher: (document.PUBLISHER || "").trim(),
    year: Number.isFinite(year) ? year : undefined,
    subjects: (document.SUBJECT || "")
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean),
    description: (document.DESCRIPTION || "").trim(),
    pageCount: Number.isFinite(pages) ? pages : undefined,
    sourceUrl: `${baseUrl}/DigitalDocument/Detail?treeId=${treeId}&currentTreeId=${treeId}&fileId=${document.FILEID}`,
    coverUrl: `${baseUrl}/DigitalDocument/ViewImage/?docFileId=${document.FILEID}`
  };
}

export async function searchLibraryCatalog(query: string, limit = 5): Promise<CatalogMatch[]> {
  const indexUrl = `${baseUrl}/DigitalDocument/Index?currentTreeId=${treeId}&currentViewId=new&display=icon`;
  const index = await fetch(indexUrl, { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" });
  const html = await index.text();
  const token = html.match(/name=["']__RequestVerificationToken["'][^>]+value=["']([^"']+)/)?.[1];
  if (!token) throw new Error("Không kết nối được kho số của Thư viện tỉnh.");

  const headers = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json;charset=utf-8",
    Cookie: index.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; "),
    Referer: indexUrl,
    "X-Requested-With": "XMLHttpRequest",
    RequestVerificationToken: token
  };
  // The search is session based: the count call stores the filter, the paging call reads it.
  const filter = {
    treeId,
    value: `${query}||||`,
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

  const count = await fetch(`${baseUrl}/DigitalDocument/PSearchDigitalDocument_Count`, { method: "POST", headers, body: JSON.stringify(filter), cache: "no-store" });
  const { countResult } = (await count.json()) as { countResult?: number };
  if (!countResult) return [];

  const page = await fetch(`${baseUrl}/DigitalDocument/SearchDigitalDocument_Paging`, {
    method: "POST",
    headers,
    body: JSON.stringify({ pageIndex: "1", pageSize: String(limit), lstOrderBy: ["FILEID"], typeOrder: "0" }),
    cache: "no-store"
  });
  const { ListDocFile } = (await page.json()) as { ListDocFile?: SourceDocument[] };
  return (ListDocFile || []).map(toMatch);
}
