import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, Library, Newspaper, Tags } from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import { PageShell } from "@/components/page-shell";
import { communeMergeInfoBySlug } from "@/lib/merge-info";
import { getCommunes, getCommuneBySlug, getDocumentsByCommune } from "@/lib/repository";
import type { Document, DocumentType } from "@/lib/types";
import { cn, communeDescription, typePrefix } from "@/lib/utils";

export async function generateStaticParams() {
  const communes = await getCommunes();
  return communes.map((commune) => ({ slug: commune.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const commune = await getCommuneBySlug(slug);

  if (!commune) {
    return {
      title: "Không tìm thấy xã/phường"
    };
  }

  return {
    title: `${typePrefix(commune.type)} ${commune.name} | Địa chí Tây Ninh`,
    description: communeDescription(commune.name, commune.type)
  };
}

function documentTypeCount(documents: Document[], type: DocumentType) {
  return documents.filter((document) => document.documentType === type).length;
}

function yearRange(documents: Document[]) {
  const years = documents.map((document) => document.year).filter(Boolean).sort((left, right) => left - right);

  if (!years.length) {
    return "Đang cập nhật";
  }

  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  return firstYear === lastYear ? String(firstYear) : `${firstYear} - ${lastYear}`;
}

function topKeywords(documents: Document[]) {
  const counts = new Map<string, number>();

  for (const document of documents) {
    for (const keyword of document.keywords || []) {
      const cleanKeyword = keyword.trim();
      if (cleanKeyword) {
        counts.set(cleanKeyword, (counts.get(cleanKeyword) || 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "vi"))
    .slice(0, 10)
    .map(([keyword]) => keyword);
}

function latestDocuments(documents: Document[]) {
  return [...documents].sort((left, right) => right.year - left.year || right.createdAt.localeCompare(left.createdAt)).slice(0, 6);
}

export default async function CommuneDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const commune = await getCommuneBySlug(slug);

  if (!commune) {
    notFound();
  }

  const relatedDocuments = await getDocumentsByCommune(commune.id);
  const mergeInfo = communeMergeInfoBySlug[commune.slug];
  const keywords = topKeywords(relatedDocuments);
  const featuredDocuments = latestDocuments(relatedDocuments);
  const stats = [
    { label: "Tổng tài liệu", value: relatedDocuments.length, icon: FileText },
    { label: "Địa chí", value: documentTypeCount(relatedDocuments, "dia_chi"), icon: Library },
    { label: "Báo Tây Ninh", value: documentTypeCount(relatedDocuments, "bao_tay_ninh"), icon: Newspaper },
    { label: "Giai đoạn tư liệu", value: yearRange(relatedDocuments), icon: CalendarDays }
  ];
  const quickLinks = [
    { label: "Tất cả tài liệu của địa phương", href: `/tai-lieu?xa=${commune.id}` },
    { label: "Chỉ xem tài liệu địa chí", href: `/tai-lieu?loai=dia_chi&xa=${commune.id}` },
    { label: "Chỉ xem Báo Tây Ninh", href: `/tai-lieu?loai=bao_tay_ninh&xa=${commune.id}` }
  ];

  return (
    <PageShell>
      <Link href="/xa-phuong" className="inline-flex items-center gap-2 text-sm font-semibold text-palm">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Quay lại danh sách
      </Link>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">{typePrefix(commune.type)}</p>
              <h1 className="mt-3 text-4xl font-semibold text-ink">{commune.name}</h1>
              <p className="mt-4 text-sm text-ink/55">{commune.districtOld}</p>
            </div>
            <span className="rounded bg-palm/10 px-3 py-1.5 text-sm font-semibold text-palm">
              {relatedDocuments.length} tài liệu
            </span>
          </div>
          <p className="mt-5 max-w-3xl leading-7 text-ink/70">{communeDescription(commune.name, commune.type)}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded border border-ink/10 bg-paper/70 p-4">
                  <Icon
                    className={cn("h-5 w-5", index === 2 ? "text-blue" : index === 3 ? "text-gold" : "text-palm")}
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-2xl font-semibold text-ink">{item.value}</p>
                  <p className="mt-1 text-sm text-ink/55">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded border border-ink/8 bg-paper p-4 text-sm leading-6 text-ink/70">
            <p className="font-semibold text-ink">Thông tin sắp xếp đơn vị hành chính</p>
            {mergeInfo ? (
              <>
                <p className="mt-2">{mergeInfo.note}</p>
                {mergeInfo.oldUnits?.length ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-lacquer">Đơn vị cũ hợp thành</p>
                    <ul className="mt-2 space-y-1">
                      {mergeInfo.oldUnits.map((unit) => (
                        <li key={unit}>- {unit}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <a
                  href={mergeInfo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex font-semibold text-palm hover:text-lacquer"
                >
                  Nguồn: {mergeInfo.sourceLabel}
                </a>
              </>
            ) : (
              <p className="mt-2">
                Thông tin các xã/phường cũ hợp thành đơn vị này đang được thư viện tiếp tục rà soát và cập nhật.
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded border border-ink/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Tra cứu nhanh</p>
            <div className="mt-4 space-y-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center justify-between gap-3 rounded border border-ink/10 px-3 py-2 text-sm font-semibold text-ink transition hover:border-palm/30 hover:bg-paper"
                >
                  {item.label}
                  <FileText className="h-4 w-4 shrink-0 text-palm" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-lacquer" aria-hidden="true" />
              <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Từ khóa nổi bật</p>
            </div>
            {keywords.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <Link
                    key={keyword}
                    href={`/tai-lieu?q=${encodeURIComponent(keyword)}`}
                    className="rounded bg-paper px-2.5 py-1 text-xs font-semibold text-ink/70 transition hover:bg-palm hover:text-white"
                  >
                    {keyword}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-ink/62">Chưa có từ khóa riêng cho địa phương này.</p>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-lacquer" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-ink">Tài liệu liên quan</h2>
          </div>
          <Link
            href={`/tai-lieu?xa=${commune.id}`}
            className="inline-flex min-h-10 items-center rounded border border-ink/10 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Xem toàn bộ trong kho tài liệu
          </Link>
        </div>

        {featuredDocuments.length > 0 ? (
          <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <div className="rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
            Chưa có tài liệu cho đơn vị này. Khi thư viện bổ sung bản số hóa, tài liệu sẽ tự hiển thị tại đây.
          </div>
        )}
      </section>
    </PageShell>
  );
}
