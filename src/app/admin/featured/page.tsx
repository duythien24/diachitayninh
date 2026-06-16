import Link from "next/link";
import { ArrowLeft, FileText, Pin, Plus, Save, Trash2 } from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";
import { getAdminDocuments, getAdminFeaturedDocumentEntries } from "@/lib/repository";

import { addFeaturedDocumentAction, removeFeaturedDocumentAction, updateFeaturedDocumentsAction } from "./actions";

const statusMessages: Record<string, { title: string; tone: "success" | "warning" | "danger" }> = {
  added: { title: "Đã ghim tài liệu lên trang chủ.", tone: "success" },
  updated: { title: "Đã lưu thứ tự và ghi chú tài liệu đề xuất.", tone: "success" },
  removed: { title: "Đã bỏ ghim tài liệu.", tone: "success" },
  "missing-document": { title: "Hãy chọn một tài liệu để ghim.", tone: "warning" },
  "missing-env": { title: "Thiếu cấu hình Supabase service role.", tone: "danger" },
  "missing-table": { title: "Chưa có bảng featured_documents. Hãy chạy file supabase/featured-documents.sql.", tone: "danger" },
  error: { title: "Không thể lưu tài liệu đề xuất. Vui lòng kiểm tra lại Supabase.", tone: "danger" }
};

function statusClass(tone: "success" | "warning" | "danger") {
  if (tone === "success") return "border-palm/20 bg-palm/8 text-palm";
  if (tone === "warning") return "border-gold/30 bg-gold/12 text-ink";
  return "border-lacquer/25 bg-lacquer/8 text-lacquer";
}

export default async function AdminFeaturedDocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ status }, documents, featuredEntries] = await Promise.all([
    searchParams,
    getAdminDocuments(),
    getAdminFeaturedDocumentEntries()
  ]);
  const statusMessage = status ? statusMessages[status] : undefined;
  const featuredIds = new Set(featuredEntries.map((entry) => entry.documentId));
  const availableDocuments = documents
    .filter((document) => !featuredIds.has(document.id))
    .sort((left, right) => left.title.localeCompare(right.title, "vi"));

  return (
    <PageShell>
      <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-palm transition hover:text-palm/80">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Quay lại bảng điều khiển
      </Link>

      <SectionHeader
        eyebrow="Quản trị"
        title="Tài liệu đề xuất trên trang chủ"
        description="Chọn những tài liệu cần giới thiệu nổi bật cho bạn đọc. Nếu danh sách này trống, trang chủ sẽ tự dùng tài liệu được xem nhiều hoặc tài liệu mới nhất."
      />

      {statusMessage ? (
        <div className={`mt-6 rounded border p-4 text-sm font-semibold ${statusClass(statusMessage.tone)}`}>{statusMessage.title}</div>
      ) : null}

      <section className="mt-8 grid gap-5 lg:grid-cols-[24rem_1fr]">
        <form action={addFeaturedDocumentAction} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded bg-brass/15 text-lacquer">
              <Pin className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-ink">Ghim tài liệu</h2>
              <p className="mt-1 text-sm text-ink/60">Tài liệu được ghim sẽ ưu tiên hiện ở trang chủ.</p>
            </div>
          </div>

          <label className="mt-5 block text-sm font-semibold text-ink" htmlFor="document_id">
            Chọn tài liệu
          </label>
          <select id="document_id" name="document_id" className="mt-2 h-12 w-full rounded border border-ink/12 bg-white px-3 text-sm text-ink">
            <option value="">Chọn tài liệu để đề xuất</option>
            {availableDocuments.map((document) => (
              <option key={document.id} value={document.id}>
                {document.title}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Ghim lên trang chủ
          </button>
        </form>

        <form action={updateFeaturedDocumentsAction} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-ink">Danh sách đang đề xuất</h2>
              <p className="mt-1 text-sm text-ink/60">Số thứ tự nhỏ hơn sẽ hiện trước. Ghi chú dùng nội bộ để nhớ lý do ghim.</p>
            </div>
            {featuredEntries.length ? (
              <button
                type="submit"
                className="inline-flex min-h-10 items-center gap-2 rounded bg-palm px-4 py-2 text-sm font-semibold text-white transition hover:bg-palm/90"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Lưu thứ tự
              </button>
            ) : null}
          </div>

          {featuredEntries.length ? (
            <div className="mt-5 divide-y divide-ink/8 rounded border border-ink/10">
              {featuredEntries.map((entry) => (
                <div key={entry.documentId} className="grid gap-4 p-4 lg:grid-cols-[5rem_1fr_16rem_auto] lg:items-center">
                  <input type="hidden" name="document_id" value={entry.documentId} />
                  <label className="block text-sm font-semibold text-ink">
                    Thứ tự
                    <input
                      name={`position_${entry.documentId}`}
                      type="number"
                      min="1"
                      defaultValue={entry.position}
                      className="mt-2 h-11 w-full rounded border border-ink/12 px-3 text-sm"
                    />
                  </label>

                  <div>
                    <p className="font-semibold text-ink">{entry.document?.title || "Tài liệu không còn tồn tại"}</p>
                    <p className="mt-1 text-sm text-ink/58">
                      {entry.document
                        ? `${entry.document.year} · ${entry.document.documentType === "dia_chi" ? "Địa chí" : entry.document.documentType === "bao_tay_ninh" ? "Báo Tây Ninh" : "Cấp tỉnh"}`
                        : "Có thể tài liệu đã bị xóa khỏi kho."}
                    </p>
                  </div>

                  <label className="block text-sm font-semibold text-ink">
                    Ghi chú
                    <input
                      name={`note_${entry.documentId}`}
                      defaultValue={entry.note || ""}
                      placeholder="Ví dụ: giới thiệu tháng này"
                      className="mt-2 h-11 w-full rounded border border-ink/12 px-3 text-sm"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {entry.document ? (
                      <Link
                        href={`/tai-lieu/${entry.document.slug}`}
                        className="inline-flex min-h-10 items-center gap-2 rounded border border-ink/12 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        Xem
                      </Link>
                    ) : null}
                    <button
                      type="submit"
                      formAction={removeFeaturedDocumentAction.bind(null, entry.documentId)}
                      className="inline-flex min-h-10 items-center gap-2 rounded border border-lacquer/20 px-3 py-2 text-sm font-semibold text-lacquer transition hover:bg-lacquer/8"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Bỏ ghim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded border border-dashed border-ink/16 bg-paper/60 p-6 text-sm leading-6 text-ink/62">
              Chưa ghim tài liệu nào. Trang chủ đang dùng tài liệu được quan tâm hoặc tài liệu mới nhất.
            </div>
          )}
        </form>
      </section>
    </PageShell>
  );
}
