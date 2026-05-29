import Link from "next/link";
import { BookOpen, Edit, FilePlus2, Files, Newspaper, Trash2 } from "lucide-react";

import { deleteDocumentAction } from "@/app/admin/documents/actions";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getAdminDocuments, usingMockData } from "@/lib/repository";
import type { Document, DocumentType } from "@/lib/types";
import { cn, documentTypeLabel, typePrefix } from "@/lib/utils";

type DocumentGroup = DocumentType;

const documentGroups: Array<{
  value: DocumentGroup;
  title: string;
  description: string;
  icon: typeof BookOpen;
}> = [
  {
    value: "dia_chi",
    title: "Danh sách địa chí xã",
    description: "Tài liệu địa chí gắn với xã/phường.",
    icon: BookOpen
  },
  {
    value: "bao_tay_ninh",
    title: "Danh sách Báo Tây Ninh",
    description: "Các số báo, chuyên đề và bài viết báo chí.",
    icon: Newspaper
  },
  {
    value: "tai_lieu_cap_tinh",
    title: "Danh sách tài liệu cấp tỉnh",
    description: "Tài liệu chung không gắn riêng với xã/phường.",
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

function documentsInGroup(documents: Document[], group: DocumentGroup) {
  return documents.filter((document) => document.documentType === group);
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
        <table className="w-full min-w-[840px] border-collapse text-left text-sm">
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
                  Chưa có tài liệu trong danh sách này. Bấm “Thêm tài liệu” và chọn đúng loại tài liệu để thêm vào đây.
                </td>
              </tr>
            ) : null}
            {documents.map((document) => {
              const commune = document.commune;
              return (
                <tr key={document.id}>
                  <td className="px-4 py-4 font-medium text-ink">{document.title}</td>
                  <td className="px-4 py-4 text-ink/68">{documentTypeLabel(document.documentType)}</td>
                  <td className="px-4 py-4 text-ink/68">
                    {commune ? `${typePrefix(commune.type)} ${commune.name}` : "Cấp tỉnh"}
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
                      <form action={deleteDocumentAction.bind(null, document.id)}>
                        <input type="hidden" name="document_group" value={activeGroup} />
                        <button
                          type="submit"
                          className="inline-flex h-9 w-9 items-center justify-center rounded border border-lacquer/20 text-lacquer transition hover:bg-lacquer/8 disabled:opacity-45"
                          aria-label={`Xóa ${document.title}`}
                          disabled={isMock}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </form>
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
  searchParams: Promise<{ status?: string; nhom?: string }>;
}) {
  const [documents, params] = await Promise.all([getAdminDocuments(), searchParams]);
  const activeGroup = groupFromQuery(params.nhom);
  const activeDocuments = documentsInGroup(documents, activeGroup);
  const activeGroupInfo = documentGroups.find((group) => group.value === activeGroup) || documentGroups[0];
  const message = statusMessage(params.status);
  const isMock = usingMockData();

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Quản trị"
          title="Quản trị tài liệu"
          description="Tài liệu được chia theo 3 danh sách để quản lý gọn hơn. Khi thêm tài liệu mới, hệ thống tự đưa vào danh sách theo loại đã chọn."
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
            <h2 className="mt-1 text-2xl font-semibold text-ink">Đang có {activeDocuments.length} tài liệu</h2>
          </div>
          <p className="text-sm text-ink/55">Chọn tab phía trên để chuyển danh sách quản trị.</p>
        </div>

        <DocumentTable documents={activeDocuments} activeGroup={activeGroup} isMock={isMock} />
      </section>
    </PageShell>
  );
}
