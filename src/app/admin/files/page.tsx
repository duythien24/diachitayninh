import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ExternalLink, FileArchive, FileText, HardDrive, Image as ImageIcon, Link2, SearchX } from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";
import { getStorageFiles, type StorageFileItem } from "@/lib/storage-files";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quản lý file Storage",
  description: "Theo dõi PDF, ảnh bìa và file chưa được gắn với tài liệu trong Supabase Storage."
};

type FileKindFilter = "all" | "pdf" | "covers";
type UsageFilter = "all" | "used" | "unused";

function fileKind(value?: string): FileKindFilter {
  if (value === "pdf" || value === "covers") return value;
  return "all";
}

function usageKind(value?: string): UsageFilter {
  if (value === "used" || value === "unused") return value;
  return "all";
}

function formatBytes(bytes: number) {
  if (!bytes) return "Không rõ";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value?: string) {
  if (!value) return "Không rõ";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(value));
}

function filterFiles(files: StorageFileItem[], kind: FileKindFilter, usage: UsageFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return files.filter((file) => {
    if (kind !== "all" && file.folder !== kind) return false;
    if (usage === "used" && file.usages.length === 0) return false;
    if (usage === "unused" && file.usages.length > 0) return false;

    if (!normalizedQuery) return true;

    const searchable = [file.name, file.path, file.mimeType || "", ...file.usages.map((item) => item.documentTitle)]
      .join(" ")
      .toLowerCase();
    return searchable.includes(normalizedQuery);
  });
}

function filterHref(params: { loai?: FileKindFilter; trangThai?: UsageFilter; q?: string }) {
  const search = new URLSearchParams();
  if (params.loai && params.loai !== "all") search.set("loai", params.loai);
  if (params.trangThai && params.trangThai !== "all") search.set("trang_thai", params.trangThai);
  if (params.q) search.set("q", params.q);
  const query = search.toString();
  return query ? `/admin/files?${query}` : "/admin/files";
}

export default async function AdminFilesPage({
  searchParams
}: {
  searchParams: Promise<{ loai?: string; trang_thai?: string; q?: string }>;
}) {
  const [params, storage] = await Promise.all([searchParams, getStorageFiles()]);
  const kind = fileKind(params.loai);
  const usage = usageKind(params.trang_thai);
  const query = params.q?.trim() || "";
  const files = filterFiles(storage.files, kind, usage, query);

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Quản trị"
          title="Quản lý file Storage"
          description="Theo dõi PDF, ảnh bìa, dung lượng và file chưa được gắn với tài liệu. Trang này chỉ rà soát, chưa xóa file để tránh xóa nhầm dữ liệu."
        />
        <Link
          href="/admin/documents/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
        >
          <FileArchive className="h-4 w-4" aria-hidden="true" />
          Upload qua tài liệu mới
        </Link>
      </div>

      {storage.error ? (
        <div className="mt-6 rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm leading-6 text-lacquer">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Không đọc được Supabase Storage</p>
              <p className="mt-1">{storage.error}</p>
              <Link href="/admin/system" className="mt-2 inline-flex font-semibold text-lacquer underline underline-offset-4">
                Mở kiểm tra hệ thống
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tổng file", value: storage.summary.totalFiles, icon: HardDrive },
          { label: "PDF", value: storage.summary.pdfCount, icon: FileText },
          { label: "Ảnh bìa", value: storage.summary.coverCount, icon: ImageIcon },
          { label: "File chưa gắn", value: storage.summary.unusedFiles, icon: SearchX }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-lacquer" aria-hidden="true" />
              <p className="mt-4 text-2xl font-semibold text-ink">{item.value}</p>
              <p className="mt-1 text-sm text-ink/60">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Dung lượng Storage</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{formatBytes(storage.summary.totalSize)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Tất cả", href: filterHref({ trangThai: usage, q: query }), active: kind === "all" },
              { label: "PDF", href: filterHref({ loai: "pdf", trangThai: usage, q: query }), active: kind === "pdf" },
              { label: "Ảnh bìa", href: filterHref({ loai: "covers", trangThai: usage, q: query }), active: kind === "covers" },
              { label: "Đang dùng", href: filterHref({ loai: kind, trangThai: "used", q: query }), active: usage === "used" },
              { label: "Chưa gắn", href: filterHref({ loai: kind, trangThai: "unused", q: query }), active: usage === "unused" }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "inline-flex min-h-10 items-center rounded border px-3 py-2 text-sm font-semibold transition",
                  item.active ? "border-palm bg-palm text-white" : "border-ink/10 text-ink hover:bg-paper"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <form action="/admin/files" className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          {kind !== "all" ? <input type="hidden" name="loai" value={kind} /> : null}
          {usage !== "all" ? <input type="hidden" name="trang_thai" value={usage} /> : null}
          <input
            name="q"
            defaultValue={query}
            className="min-h-11 rounded border border-ink/10 bg-paper/70 px-3 text-sm text-ink outline-none transition placeholder:text-ink/45 focus:border-palm"
            placeholder="Tìm theo tên file, đường dẫn hoặc tên tài liệu đang dùng..."
          />
          <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded bg-palm px-4 py-2 text-sm font-semibold text-white">
            Tìm file
          </button>
        </form>
      </div>

      <section className="mt-6 overflow-hidden rounded border border-ink/10 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 bg-paper px-4 py-3">
          <h2 className="font-semibold text-ink">{files.length} file phù hợp</h2>
          {(kind !== "all" || usage !== "all" || query) ? (
            <Link href="/admin/files" className="text-sm font-semibold text-lacquer hover:text-palm">
              Xóa bộ lọc
            </Link>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-paper/70 text-ink/68">
              <tr>
                <th className="px-4 py-3 font-semibold">File</th>
                <th className="px-4 py-3 font-semibold">Loại</th>
                <th className="px-4 py-3 font-semibold">Dung lượng</th>
                <th className="px-4 py-3 font-semibold">Cập nhật</th>
                <th className="px-4 py-3 font-semibold">Đang dùng bởi</th>
                <th className="px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {files.length ? (
                files.map((file) => (
                  <tr key={file.path} className="align-top">
                    <td className="px-4 py-4">
                      <p className="max-w-[24rem] break-all font-semibold text-ink">{file.name}</p>
                      <p className="mt-1 break-all text-xs text-ink/50">{file.path}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded bg-paper px-2.5 py-1 text-xs font-semibold text-ink/70">
                        {file.folder === "pdf" ? "PDF" : "Ảnh bìa"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-ink/65">{formatBytes(file.size)}</td>
                    <td className="px-4 py-4 text-ink/65">{formatDate(file.updatedAt || file.createdAt)}</td>
                    <td className="max-w-[24rem] px-4 py-4">
                      {file.usages.length ? (
                        <div className="space-y-2">
                          {file.usages.map((usageItem) => (
                            <Link
                              key={`${file.path}-${usageItem.documentId}-${usageItem.field}`}
                              href={`/admin/documents/${usageItem.documentId}/edit`}
                              className="flex items-start gap-2 rounded border border-ink/8 bg-paper/60 px-3 py-2 text-xs font-semibold text-ink transition hover:border-palm/25 hover:bg-paper"
                            >
                              <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-palm" aria-hidden="true" />
                              <span>
                                <span className="line-clamp-1">{usageItem.documentTitle}</span>
                                <span className="mt-0.5 block font-medium text-ink/50">{usageItem.field === "pdf" ? "File PDF" : "Ảnh bìa"}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span className="rounded bg-gold/12 px-2.5 py-1 text-xs font-semibold text-gold">Chưa gắn tài liệu</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={file.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 items-center gap-2 rounded border border-ink/10 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-paper"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        Mở file
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink/58">
                    Không có file phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
