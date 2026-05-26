import Link from "next/link";
import { Edit, FilePlus2, Trash2 } from "lucide-react";

import { deleteDocumentAction } from "@/app/admin/documents/actions";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getDocuments, usingMockData } from "@/lib/repository";
import { documentTypeLabel, typePrefix } from "@/lib/utils";

function statusMessage(status?: string) {
  if (status === "created") return "Đã thêm tài liệu.";
  if (status === "updated") return "Đã cập nhật tài liệu.";
  if (status === "deleted") return "Đã xóa tài liệu.";
  if (status === "missing-env") return "Chưa cấu hình Supabase service role nên chưa thể lưu dữ liệu thật.";
  return null;
}

export default async function AdminDocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [documents, params] = await Promise.all([getDocuments(), searchParams]);
  const message = statusMessage(params.status);
  const isMock = usingMockData();

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Quản trị"
          title="Danh sách tài liệu"
          description="Màn hình quản trị CRUD mẫu. Nút xóa đang ở trạng thái giao diện để tránh xóa nhầm trước khi có xác thực admin."
        />
        <Link
          href="/admin/documents/new"
          className="inline-flex items-center justify-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
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

      <div className="mt-8 overflow-hidden rounded border border-ink/10 bg-white shadow-sm">
        <table className="w-full min-w-[840px] border-collapse text-left text-sm">
          <thead className="bg-paper text-ink/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Tên tài liệu</th>
              <th className="px-4 py-3 font-semibold">Loại</th>
              <th className="px-4 py-3 font-semibold">Xã/phường</th>
              <th className="px-4 py-3 font-semibold">Năm</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink/60">
                  Chưa có tài liệu. Bấm “Thêm tài liệu” để upload PDF preview đầu tiên.
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
                    {commune ? `${typePrefix(commune.type)} ${commune.name}` : "Toàn tỉnh"}
                  </td>
                  <td className="px-4 py-4 text-ink/68">{document.year}</td>
                  <td className="px-4 py-4">
                    <span className="rounded bg-palm/10 px-2.5 py-1 text-xs font-semibold text-palm">
                      Preview only
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
    </PageShell>
  );
}
