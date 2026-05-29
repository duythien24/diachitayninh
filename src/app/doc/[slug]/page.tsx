import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, LockKeyhole } from "lucide-react";

import { ContactPanel } from "@/components/contact-panel";
import { PageShell } from "@/components/page-shell";
import { getDocuments, getDocumentBySlug } from "@/lib/repository";

export async function generateStaticParams() {
  const documents = await getDocuments();
  return documents.map((document) => ({ slug: document.slug }));
}

export default async function PdfReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);

  if (!document) {
    notFound();
  }

  const isPreview = document.isPreviewOnly;

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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="overflow-hidden rounded border border-ink/10 bg-white shadow-soft">
          <div className="flex items-center gap-2 border-b border-ink/10 bg-paper px-4 py-3 text-sm font-semibold text-lacquer">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            {isPreview ? "Bản đọc thử - Thư viện tỉnh Tây Ninh" : "Bản đầy đủ - Thư viện tỉnh Tây Ninh"}
          </div>
          <iframe src={document.previewFileUrl} title={document.title} className="h-[76vh] w-full bg-white" />
        </section>
        {isPreview ? (
          <ContactPanel />
        ) : (
          <aside className="rounded border border-palm/20 bg-palm p-5 text-white shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Bản đầy đủ</p>
            <h2 className="mt-2 text-2xl font-semibold">Đang đọc toàn văn</h2>
            <p className="mt-3 text-sm leading-6 text-white/78">
              Tài liệu này được quản trị đánh dấu là bản đầy đủ, nên PDF online hiển thị toàn bộ nội dung đã upload.
            </p>
          </aside>
        )}
      </div>
    </PageShell>
  );
}
