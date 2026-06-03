import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, BookOpen, CalendarDays, ExternalLink, FileText, Library, LockKeyhole, Tags } from "lucide-react";

import { ContactPanel } from "@/components/contact-panel";
import { PageShell } from "@/components/page-shell";
import { getDocuments, getDocumentBySlug } from "@/lib/repository";
import { documentTypeLabel, typePrefix } from "@/lib/utils";

export async function generateStaticParams() {
  const documents = await getDocuments();
  return documents.map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);

  if (!document) {
    return {
      title: "Không tìm thấy tài liệu"
    };
  }

  return {
    title: `Đọc ${document.title}`,
    description: document.description || `Đọc tài liệu ${document.title} tại Thư viện tỉnh Tây Ninh.`
  };
}

export default async function PdfReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);

  if (!document) {
    notFound();
  }

  const isPreview = document.isPreviewOnly;
  const communes = document.communes?.length ? document.communes : document.commune ? [document.commune] : [];

  return (
    <PageShell>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href={`/tai-lieu/${document.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-palm">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Chi tiết tài liệu
          </Link>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink">{document.title}</h1>
        </div>
        <a
          href={document.previewFileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded border border-ink/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Mở tab mới
        </a>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded border border-ink/10 bg-white shadow-soft">
          <div className="flex items-center gap-2 border-b border-ink/10 bg-paper px-4 py-3 text-sm font-semibold text-lacquer">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            {isPreview ? "Bản đọc thử - Thư viện tỉnh Tây Ninh" : "Bản đầy đủ - Thư viện tỉnh Tây Ninh"}
          </div>
          <iframe src={document.previewFileUrl} title={document.title} className="h-[76vh] w-full bg-white" />
        </section>
        <aside className="space-y-4">
          <section className="rounded border border-ink/10 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Thông tin tài liệu</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex gap-3">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-palm" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-ink">Loại tài liệu</dt>
                  <dd className="mt-1 text-ink/68">{documentTypeLabel(document.documentType)}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-palm" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-ink">Năm xuất bản</dt>
                  <dd className="mt-1 text-ink/68">{document.year}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Library className="mt-0.5 h-4 w-4 shrink-0 text-palm" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-ink">Phạm vi</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5 text-ink/68">
                    {communes.length ? (
                      communes.map((commune) => (
                        <Link
                          key={commune.id}
                          href={`/xa-phuong/${commune.slug}`}
                          className="rounded bg-paper px-2 py-1 text-xs font-semibold text-ink/70 transition hover:text-palm"
                        >
                          {typePrefix(commune.type)} {commune.name}
                        </Link>
                      ))
                    ) : (
                      <span>Cấp tỉnh</span>
                    )}
                  </dd>
                </div>
              </div>
              {document.pageCount || document.previewPageCount ? (
                <div className="flex gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-palm" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-ink">Dung lượng đọc</dt>
                    <dd className="mt-1 text-ink/68">
                      {document.pageCount ? `${document.pageCount} trang` : "Chưa cập nhật số trang"}
                      {isPreview && document.previewPageCount ? `, xem thử ${document.previewPageCount} trang` : ""}
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>

            {document.keywords?.length ? (
              <div className="mt-5 border-t border-ink/10 pt-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                  <Tags className="h-4 w-4 text-palm" aria-hidden="true" />
                  Từ khóa
                </div>
                <div className="flex flex-wrap gap-2">
                  {document.keywords.map((keyword) => (
                    <Link
                      key={keyword}
                      href={`/tai-lieu?q=${encodeURIComponent(keyword)}`}
                      className="rounded bg-palm/10 px-2.5 py-1 text-xs font-semibold text-palm transition hover:bg-palm/15"
                    >
                      {keyword}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-5 grid gap-2">
              <Link
                href={`/tai-lieu/${document.slug}`}
                className="inline-flex min-h-10 items-center justify-center rounded border border-ink/12 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
              >
                Xem chi tiết tài liệu
              </Link>
              <Link
                href="/tai-lieu"
                className="inline-flex min-h-10 items-center justify-center rounded border border-ink/12 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
              >
                Quay lại kho tài liệu
              </Link>
            </div>
          </section>

          {isPreview ? (
            <ContactPanel />
          ) : (
            <section className="rounded border border-palm/20 bg-palm p-5 text-white shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Bản đầy đủ</p>
              <h2 className="mt-2 text-2xl font-semibold">Đang đọc toàn văn</h2>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Tài liệu này được quản trị đánh dấu là bản đầy đủ, nên PDF online hiển thị toàn bộ nội dung đã upload.
              </p>
            </section>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
