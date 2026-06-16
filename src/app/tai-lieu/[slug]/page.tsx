import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookMarked, Eye, LockKeyhole } from "lucide-react";

import { ContactPanel } from "@/components/contact-panel";
import { BookmarkButton } from "@/components/bookmark-button";
import { DocumentEventTracker } from "@/components/document-event-tracker";
import { DocumentCoverImage } from "@/components/document-cover-image";
import { DocumentCard } from "@/components/document-card";
import { PageShell } from "@/components/page-shell";
import { ReadingHistoryTracker } from "@/components/reading-history-tracker";
import { getCollectionsForDocument } from "@/lib/document-collections";
import { getDocuments, getDocumentBySlug } from "@/lib/repository";
import type { Document } from "@/lib/types";
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
    title: `${document.title} | Địa chí Tây Ninh`,
    description: document.description || `Xem tài liệu ${document.title} tại Thư viện tỉnh Tây Ninh.`
  };
}

function relatedScore(current: Document, candidate: Document) {
  if (current.id === candidate.id) return -1;

  let score = 0;
  const currentCommuneIds = new Set(current.communeIds?.length ? current.communeIds : current.communeId ? [current.communeId] : []);
  const candidateCommuneIds = candidate.communeIds?.length ? candidate.communeIds : candidate.communeId ? [candidate.communeId] : [];

  if (candidate.documentType === current.documentType) score += 2;
  if (candidate.year === current.year) score += 1;

  for (const communeId of candidateCommuneIds) {
    if (currentCommuneIds.has(communeId)) score += 5;
  }

  const currentKeywords = new Set((current.keywords || []).map((keyword) => keyword.toLowerCase()));
  for (const keyword of candidate.keywords || []) {
    if (currentKeywords.has(keyword.toLowerCase())) score += 2;
  }

  return score;
}

function getRelatedDocuments(current: Document, documents: Document[]) {
  return documents
    .map((document) => ({ document, score: relatedScore(current, document) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || right.document.year - left.document.year)
    .slice(0, 3)
    .map((item) => item.document);
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);

  if (!document) {
    notFound();
  }

  const commune = document.commune;
  const communes = document.communes?.length ? document.communes : commune ? [commune] : [];
  const isPreview = document.isPreviewOnly;
  const allDocuments = await getDocuments();
  const relatedDocuments = getRelatedDocuments(document, allDocuments);
  const relatedCollections = getCollectionsForDocument(document).slice(0, 3);

  return (
    <PageShell>
      <DocumentEventTracker documentId={document.id} eventType="detail_view" />
      <ReadingHistoryTracker documentId={document.id} />
      <Link href="/tai-lieu" className="inline-flex items-center gap-2 text-sm font-semibold text-palm">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Quay lại kho tài liệu
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
          <div className="relative aspect-[16/8] overflow-hidden rounded bg-ink/5">
            <DocumentCoverImage src={document.coverImageUrl} alt="" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded bg-paper px-2.5 py-1 text-ink/70">{documentTypeLabel(document.documentType)}</span>
            <span className="rounded bg-paper px-2.5 py-1 text-ink/70">{document.year}</span>
            {communes.length ? (
              communes.map((item) => (
                <span key={item.id} className="rounded bg-paper px-2.5 py-1 text-ink/70">
                  {typePrefix(item.type)} {item.name}
                </span>
              ))
            ) : (
              <span className="rounded bg-paper px-2.5 py-1 text-ink/70">Cấp tỉnh</span>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink">{document.title}</h1>
          <p className="mt-4 leading-7 text-ink/70">{document.description}</p>

          <dl className="mt-6 grid gap-4 rounded border border-ink/8 bg-paper p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-ink">Nguồn</dt>
              <dd className="mt-1 text-ink/64">{document.source}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Trạng thái</dt>
              <dd className="mt-1 text-ink/64">{isPreview ? "Bản preview/đọc thử" : "Bản đầy đủ"}</dd>
            </div>
            {document.author ? (
              <div>
                <dt className="font-semibold text-ink">Tác giả</dt>
                <dd className="mt-1 text-ink/64">{document.author}</dd>
              </div>
            ) : null}
            {document.publisher ? (
              <div>
                <dt className="font-semibold text-ink">Nhà xuất bản</dt>
                <dd className="mt-1 text-ink/64">{document.publisher}</dd>
              </div>
            ) : null}
            {document.pageCount ? (
              <div>
                <dt className="font-semibold text-ink">Số trang</dt>
                <dd className="mt-1 text-ink/64">{document.pageCount}</dd>
              </div>
            ) : null}
            {document.previewPageCount ? (
              <div>
                <dt className="font-semibold text-ink">Số trang xem thử</dt>
                <dd className="mt-1 text-ink/64">{document.previewPageCount}</dd>
              </div>
            ) : null}
          </dl>

          {document.keywords?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
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
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <BookmarkButton documentId={document.id} showLabel />
            <Link
              href={`/doc/${document.slug}`}
              className="inline-flex min-h-11 items-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              {isPreview ? "Đọc preview online" : "Đọc đầy đủ online"}
            </Link>
            {isPreview ? (
              <span className="inline-flex min-h-11 items-center gap-2 rounded border border-lacquer/20 px-4 py-3 text-sm font-semibold text-lacquer">
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Bản đầy đủ cần liên hệ thư viện
              </span>
            ) : null}
          </div>
        </div>

        {isPreview ? (
          <ContactPanel />
        ) : (
          <aside className="rounded border border-palm/20 bg-palm p-5 text-white shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Bản đầy đủ</p>
            <h2 className="mt-2 text-2xl font-semibold">Được mở đọc toàn văn</h2>
            <p className="mt-3 text-sm leading-6 text-white/78">
              Tài liệu này được quản trị đánh dấu là bản đầy đủ, người đọc có thể mở PDF online để đọc hết nội dung.
            </p>
            <Link
              href={`/doc/${document.slug}`}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded bg-white px-3 py-2 text-sm font-semibold text-palm transition hover:bg-paper"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Đọc đầy đủ
            </Link>
          </aside>
        )}
      </section>

      {relatedCollections.length ? (
        <section className="mt-10 rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Chuyên đề liên quan</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Tài liệu này nằm trong những lối đọc nào?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/68">
                Mở một chuyên đề để đi tiếp sang các tài liệu có cùng mạch nội dung, thay vì chỉ đọc riêng từng tài liệu.
              </p>
            </div>
            <Link
              href="/bo-suu-tap"
              className="inline-flex min-h-10 items-center gap-2 rounded border border-ink/12 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
            >
              Tất cả bộ sưu tập
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {relatedCollections.map((collection) => (
              <Link
                key={collection.slug}
                href={collection.href}
                className="group flex min-h-36 flex-col rounded border border-ink/10 bg-paper/70 p-4 transition hover:border-palm/35 hover:bg-white hover:shadow-sm"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded bg-palm/10 text-palm">
                    <BookMarked className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink/35 transition group-hover:translate-x-1 group-hover:text-palm" aria-hidden="true" />
                </span>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-lacquer">{collection.eyebrow}</span>
                <span className="mt-1 font-semibold leading-6 text-ink">{collection.title}</span>
                <span className="mt-2 line-clamp-2 text-sm leading-6 text-ink/62">{collection.description}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedDocuments.length ? (
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Đọc tiếp</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Tài liệu liên quan</h2>
            </div>
            <Link
              href={communes[0] ? `/tai-lieu?xa=${communes[0].id}` : `/tai-lieu?loai=${document.documentType}`}
              className="inline-flex min-h-10 items-center rounded border border-ink/10 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-white"
            >
              Xem thêm trong kho
            </Link>
          </div>
          <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {relatedDocuments.map((item) => (
              <DocumentCard key={item.id} document={item} />
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
