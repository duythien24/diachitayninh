import Link from "next/link";
import { BookOpen, Edit, FilePlus2, Files, Newspaper, Search, SlidersHorizontal } from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";
import { DeleteDocumentButton } from "@/components/delete-document-button";
import { getAdminDocuments, usingMockData } from "@/lib/repository";
import type { Document, DocumentType } from "@/lib/types";
import { cn, documentTypeLabel, normalizeVietnamese, typePrefix } from "@/lib/utils";

type DocumentGroup = DocumentType;
type AccessFilter = "all" | "preview" | "full";

const pageSize = 25;

const documentGroups: Array<{
  value: DocumentGroup;
  title: string;
  description: string;
  icon: typeof BookOpen;
}> = [
  {
    value: "dia_chi",
    title: "Danh sách địa chí xã",
    description: "Tài liệu địa chí gắn với một hoặc nhiều xã/phường.",
    icon: BookOpen
  },
  {
    value: "bao_tay_ninh",
    title: "Danh sách Báo Tây Ninh",
    description: "Các số báo, chuyên đề và bài viết báo chí địa phương.",
    icon: Newspaper
  },
  {
    value: "tai_lieu_cap_tinh",
    title: "Danh sách tài liệu cấp tỉnh",
    description: "Tài liệu chung không gắn riêng với xã/phường nào.",
    icon: Files
  }
];

function statusMessage(status?: string) {
  if (status === "created") return "Đã thêm tài liệu vào đúng danh sách.";
  if (status === "updated") return "Đã cập nhật tài liệu.";
  if (status === "deleted") return "Đã xóa tài liệu.";
  if (status === "missing-env") return "Chưa cấu hình Supabase service role nên chưa thể lưu dữ liệu thật.";
  return null;
}

function groupFromQuery(value?: string): DocumentGroup {
  if (value === "bao_tay_ninh" || value === "tai_lieu_cap_tinh") return value;
  return "dia_chi";
}

function accessFromQuery(value?: string): AccessFilter {
  if (value === "preview" || value === "full") return value;
  return "all";
}

function documentsInGroup(documents: Document[], group: DocumentGroup) {
  return documents.filter((document) => document.documentType === group);
}

function filterDocuments(documents: Document[], query: string, year?: number, access: AccessFilter = "all") {
  const normalizedQuery = normalizeVietnamese(query.trim());

  return documents.filter((document) => {
    if (year && document.year !== year) return false;
    if (access === "preview" && !document.isPreviewOnly) return false;
    if (access === "full" && document.isPreviewOnly) return false;

    if (!normalizedQuery) return true;

    const communeText = document.communes?.map((commune) => commune.name).join(" ") || document.commune?.name || "";
    const searchable = normalizeVietnamese(
      [
        document.title,
        document.description,
        String(document.year),
        document.author || "",
        document.publisher || "",
        document.source,
        document.keywords?.join(" ") || "",
        communeText
      ].join(" ")
    );

    return searchable.includes(normalizedQuery);
  });
}

function pageHref(params: {
  group: DocumentGroup;
  query: string;
  year?: number;
  access: AccessFilter;
  page: number;
}) {
  const search = new URLSearchParams();
  search.set("nhom", params.group);
  if (params.query) search.set("q", params.query);
  if (params.year) search.set("nam", String(params.year));
  if (params.access !== "all") search.set("trang_thai", params.access);
  if (params.page > 1) search.set("page", String(params.page));
  return `/admin/documents?${search.toString()}`;
}

function DocumentTable({
  documents,
  activeGroup,
  isMock
}: {
  documents: Document[];
  activeGroup: DocumentGroup;
  isMock: boolean;
}) {
  return (
    <div className="overflow-hidden rounded border border-ink/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="bg-paper text-ink/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Tên tài liệu</th>
              <th className="px-4 py-3 font-semibold">Loại</th>
              <th className="px-4 py-3 font-semibold">Phạm vi</th>
              <th className="px-4 py-3 font-semibold">Năm</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink/60">
                  Không có tài liệu phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : null}
            {documents.map((document) => {
              const commune = document.commune;
              const scopeLabel = document.communes?.length
                ? document.communes.map((item) => `${typePrefix(item.type)} ${item.name}`).join(", ")
                : commune
                  ? `${typePrefix(commune.type)} ${commune.name}`
                  : "Cấp tỉnh";
              return (
                <tr key={document.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-medium text-ink">{document.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-ink/50">{document.slug}</p>
                  </td>
                  <td className="px-4 py-4 text-ink/68">{documentTypeLabel(document.documentType)}</td>
                  <td className="max-w-[18rem] px-4 py-4 text-ink/68">
                    <span className="line-clamp-2">{scopeLabel}</span>
                  </td>
                  <td className="px-4 py-4 text-ink/68">{document.year}</td>
                  <td className="px-4 py-4">
                    <span className="rounded bg-palm/10 px-2.5 py-1 text-xs font-semibold text-palm">
                      {document.isPreviewOnly ? "Preview" : "Bản đầy đủ"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/documents/${document.id}/edit`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded border border-ink/12 text-ink transition hover:bg-paper"
                        aria-label={`Sửa ${document.title}`}
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <DeleteDocumentButton
                        documentId={document.id}
                        documentTitle={document.title}
                        documentGroup={activeGroup}
                        disabled={isMock}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AdminDocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; nhom?: string; q?: string; nam?: string; trang_thai?: string; page?: string }>;
}) {
  const [documents, params] = await Promise.all([getAdminDocuments(), searchParams]);
  const activeGroup = groupFromQuery(params.nhom);
  const query = params.q?.trim() || "";
  const selectedYear = Number(params.nam);
  const yearFilter = Number.isFinite(selectedYear) && selectedYear > 0 ? selectedYear : undefined;
  const accessFilter = accessFromQuery(params.trang_thai);
  const currentPage = Math.max(1, Number(params.page) || 1);
  const groupedDocuments = documentsInGroup(documents, activeGroup);
  const filteredDocuments = filterDocuments(groupedDocuments, query, yearFilter, accessFilter);
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedDocuments = filteredDocuments.slice((safePage - 1) * pageSize, safePage * pageSize);
  const years = Array.from(new Set(groupedDocuments.map((document) => document.year).filter(Boolean))).sort((a, b) => b - a);
  const activeGroupInfo = documentGroups.find((group) => group.value === activeGroup) || documentGroups[0];
  const message = statusMessage(params.status);
  const isMock = usingMockData();

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Quản trị"
          title="Quản trị tài liệu"
          description="Tài liệu được chia theo 3 danh sách. Có thể tìm kiếm, lọc theo năm, trạng thái và phân trang để quản lý gọn hơn."
        />
        <Link
          href="/admin/documents/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
        >
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          Thêm tài liệu
        </Link>
      </div>

      {message ? (
        <div className="mt-6 rounded border border-palm/20 bg-palm/8 p-4 text-sm font-medium text-palm">
          {message}
        </div>
      ) : null}

      {isMock ? (
        <div className="mt-6 rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm leading-6 text-lacquer">
          Dữ liệu đang lấy từ mock. Sau khi điền Supabase env, bảng này sẽ đọc trực tiếp từ database.
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {documentGroups.map((group) => {
          const Icon = group.icon;
          const isActive = group.value === activeGroup;
          const count = documentsInGroup(documents, group.value).length;

          return (
            <Link
              key={group.value}
              href={`/admin/documents?nhom=${group.value}`}
              className={cn(
                "flex h-full min-h-44 flex-col rounded border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft",
                isActive ? "border-palm/45 bg-palm text-white" : "border-ink/10 bg-white text-ink hover:border-palm/30"
              )}
            >
              <span className="flex items-start justify-between gap-4">
                <span
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded",
                    isActive ? "bg-white/15 text-white" : "bg-paper text-palm"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    "rounded px-2.5 py-1 text-sm font-semibold",
                    isActive ? "bg-white/15 text-white" : "bg-palm/10 text-palm"
                  )}
                >
                  {count}
                </span>
              </span>
              <span className="mt-4 text-lg font-semibold">{group.title}</span>
              <span className={cn("mt-2 text-sm leading-6", isActive ? "text-white/78" : "text-ink/62")}>
                {group.description}
              </span>
            </Link>
          );
        })}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">{activeGroupInfo.title}</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">
              {filteredDocuments.length} / {groupedDocuments.length} tài liệu
            </h2>
          </div>
          <p className="text-sm text-ink/55">Trang {safePage} / {totalPages}</p>
        </div>

        <form action="/admin/documents" className="mb-5 rounded border border-ink/10 bg-white p-4 shadow-sm">
          <input type="hidden" name="nhom" value={activeGroup} />
          <div className="grid gap-3 lg:grid-cols-[1fr_12rem_12rem_auto]">
            <label className="flex min-h-11 items-center gap-3 rounded border border-ink/10 bg-paper/80 px-3 text-ink/55">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Tìm tài liệu</span>
              <input
                name="q"
                defaultValue={query}
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
                placeholder="Tìm theo tên, mô tả, tác giả, từ khóa..."
              />
            </label>
            <label className="sr-only" htmlFor="admin-year-filter">Năm</label>
            <select
              id="admin-year-filter"
              name="nam"
              defaultValue={yearFilter || ""}
              className="min-h-11 rounded border border-ink/10 bg-white px-3 text-sm text-ink outline-none transition focus:border-palm"
            >
              <option value="">Tất cả năm</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="admin-access-filter">Trạng thái</label>
            <select
              id="admin-access-filter"
              name="trang_thai"
              defaultValue={accessFilter}
              className="min-h-11 rounded border border-ink/10 bg-white px-3 text-sm text-ink outline-none transition focus:border-palm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="full">Bản đầy đủ</option>
              <option value="preview">Preview</option>
            </select>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-palm px-4 py-2 text-sm font-semibold text-white transition hover:bg-palm/90"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Lọc
            </button>
          </div>
          {(query || yearFilter || accessFilter !== "all") ? (
            <Link
              href={`/admin/documents?nhom=${activeGroup}`}
              className="mt-3 inline-flex text-sm font-semibold text-lacquer hover:text-palm"
            >
              Xóa bộ lọc
            </Link>
          ) : null}
        </form>

        <DocumentTable documents={pagedDocuments} activeGroup={activeGroup} isMock={isMock} />

        {totalPages > 1 ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={pageHref({ group: activeGroup, query, year: yearFilter, access: accessFilter, page: Math.max(1, safePage - 1) })}
              className={cn(
                "inline-flex min-h-10 items-center rounded border border-ink/10 px-4 py-2 text-sm font-semibold transition",
                safePage === 1 ? "pointer-events-none opacity-45" : "hover:bg-white"
              )}
            >
              Trang trước
            </Link>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: totalPages }).slice(0, 10).map((_, index) => {
                const page = index + 1;
                return (
                  <Link
                    key={page}
                    href={pageHref({ group: activeGroup, query, year: yearFilter, access: accessFilter, page })}
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded border text-sm font-semibold transition",
                      page === safePage ? "border-palm bg-palm text-white" : "border-ink/10 text-ink hover:bg-white"
                    )}
                  >
                    {page}
                  </Link>
                );
              })}
              {totalPages > 10 ? <span className="px-2 py-2 text-sm text-ink/50">...</span> : null}
            </div>
            <Link
              href={pageHref({ group: activeGroup, query, year: yearFilter, access: accessFilter, page: Math.min(totalPages, safePage + 1) })}
              className={cn(
                "inline-flex min-h-10 items-center rounded border border-ink/10 px-4 py-2 text-sm font-semibold transition",
                safePage === totalPages ? "pointer-events-none opacity-45" : "hover:bg-white"
              )}
            >
              Trang sau
            </Link>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
