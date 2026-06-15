import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookMarked, Building2, CalendarDays, FileText, History, Library, MapPinned, Newspaper, Tags, TrendingUp } from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import { PageShell } from "@/components/page-shell";
import { getDocumentPopularityScores } from "@/lib/document-analytics";
import { getCommunes, getCommuneBySlug, getDocuments } from "@/lib/repository";
import type { Commune, Document, DocumentType } from "@/lib/types";
import { cn, tinhThanhMapUrl, typePrefix } from "@/lib/utils";

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
    description: commune.description
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

function topKeywords(documents: Document[], communeKeywords: string[] = []) {
  const counts = new Map<string, number>();

  for (const keyword of communeKeywords) {
    const cleanKeyword = keyword.trim();
    if (cleanKeyword) {
      counts.set(cleanKeyword, (counts.get(cleanKeyword) || 0) + 5);
    }
  }

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

function readingTimeline(documents: Document[]) {
  const groups = new Map<number, Document[]>();

  for (const document of documents) {
    const current = groups.get(document.year) || [];
    current.push(document);
    groups.set(document.year, current);
  }

  return Array.from(groups.entries())
    .sort((left, right) => right[0] - left[0])
    .slice(0, 8)
    .map(([year, items]) => ({
      year,
      count: items.length,
      document: [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0]
    }));
}

function mergeUniqueDocuments(primary: Document[], fallback: Document[], limit: number) {
  const seen = new Set<string>();
  const result: Document[] = [];

  for (const document of [...primary, ...fallback]) {
    if (seen.has(document.id)) continue;
    seen.add(document.id);
    result.push(document);
    if (result.length >= limit) break;
  }

  return result;
}

function documentsOfType(documents: Document[], type: DocumentType) {
  return documents.filter((document) => document.documentType === type);
}

function documentsForCommune(documents: Document[], communeId: string) {
  return documents.filter((document) => document.communeIds?.includes(communeId) || document.communeId === communeId);
}

function suggestedCommunes(documents: Document[], currentCommuneId: string) {
  const map = new Map<string, { commune: Commune; count: number }>();

  for (const document of documents) {
    for (const commune of document.communes || []) {
      if (commune.id === currentCommuneId) continue;
      const current = map.get(commune.id);
      map.set(commune.id, {
        commune,
        count: (current?.count || 0) + 1
      });
    }
  }

  return Array.from(map.values())
    .sort((left, right) => right.count - left.count || left.commune.name.localeCompare(right.commune.name, "vi"))
    .slice(0, 6);
}

export default async function CommuneDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const commune = await getCommuneBySlug(slug);

  if (!commune) {
    notFound();
  }

  const allDocuments = await getDocuments();
  const relatedDocuments = documentsForCommune(allDocuments, commune.id);
  const popularity = await getDocumentPopularityScores(relatedDocuments.map((document) => document.id));
  const communeSuggestions = suggestedCommunes(allDocuments, commune.id);
  const mapUrl = tinhThanhMapUrl(commune.type, commune.slug);
  const keywords = topKeywords(relatedDocuments, commune.keywords || []);
  const recentDocuments = latestDocuments(relatedDocuments);
  const popularDocuments = relatedDocuments
    .filter((document) => (popularity[document.id]?.score || 0) > 0)
    .sort((left, right) => (popularity[right.id]?.score || 0) - (popularity[left.id]?.score || 0));
  const featuredDocuments = mergeUniqueDocuments(popularDocuments, recentDocuments, 6);
  const timeline = readingTimeline(relatedDocuments);
  const hasReadingData = popularDocuments.length > 0;
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
  const documentGroups = [
    {
      type: "dia_chi" as const,
      title: "Địa chí địa phương",
      description: "Tài liệu về lịch sử, di tích, địa danh và đời sống của địa phương.",
      href: `/tai-lieu?loai=dia_chi&xa=${commune.id}`,
      icon: Library
    },
    {
      type: "bao_tay_ninh" as const,
      title: "Báo Tây Ninh",
      description: "Các số báo, bài viết và chuyên đề báo chí có liên quan đến địa phương.",
      href: `/tai-lieu?loai=bao_tay_ninh&xa=${commune.id}`,
      icon: Newspaper
    },
    {
      type: "tai_lieu_cap_tinh" as const,
      title: "Tài liệu cấp tỉnh",
      description: "Tư liệu cấp tỉnh được gắn thêm với địa phương này khi có liên quan.",
      href: `/tai-lieu?loai=tai_lieu_cap_tinh&xa=${commune.id}`,
      icon: FileText
    }
  ].map((group) => {
    const documents = documentsOfType(relatedDocuments, group.type);
    return {
      ...group,
      documents: latestDocuments(documents).slice(0, 3),
      count: documents.length
    };
  });

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
          {commune.coverImageUrl ? (
            <div className="relative mt-6 aspect-[16/7] overflow-hidden rounded bg-paper">
              <Image
                src={commune.coverImageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <p className="mt-5 max-w-3xl leading-7 text-ink/70">{commune.description}</p>

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
            <p className="mt-2">{commune.districtOld}</p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded bg-palm px-3 py-2 text-sm font-semibold text-white transition hover:bg-palm/90"
            >
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              {"Xem b\u1ea3n \u0111\u1ed3 h\u00e0nh ch\u00ednh"}
            </a>
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

      {featuredDocuments.length ? (
        <section className="mt-10 overflow-hidden rounded border border-ink/10 bg-ink text-white shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="p-6 sm:p-8">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded bg-brass text-ink">
                {hasReadingData ? <TrendingUp className="h-5 w-5" aria-hidden="true" /> : <BookMarked className="h-5 w-5" aria-hidden="true" />}
              </span>
              <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-brass">
                {hasReadingData ? "Bạn đọc đang quan tâm" : "Gợi ý bắt đầu"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight">
                {hasReadingData ? `Tư liệu nổi bật của ${commune.name}` : `Nên đọc gì trước về ${commune.name}?`}
              </h2>
              <p className="mt-4 leading-7 text-white/68">
                {hasReadingData
                  ? "Thứ tự được tổng hợp từ lượt xem chi tiết và lượt mở đọc trong 180 ngày gần nhất."
                  : "Kho chưa có đủ lượt đọc để xếp hạng, vì vậy các tài liệu mới và có metadata đầy đủ được đưa lên trước."}
              </p>
              <Link
                href={`/tai-lieu?xa=${commune.id}`}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded bg-brass px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brass/90"
              >
                Mở toàn bộ kho địa phương
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid border-t border-white/10 sm:grid-cols-2 lg:border-l lg:border-t-0">
              {featuredDocuments.slice(0, 4).map((document, index) => {
                const reading = popularity[document.id];
                return (
                  <Link
                    key={document.id}
                    href={`/tai-lieu/${document.slug}`}
                    className="group flex min-h-44 flex-col border-b border-white/10 p-5 transition hover:bg-white/8 sm:[&:nth-child(odd)]:border-r"
                  >
                    <span className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-brass">
                      <span>Gợi ý {index + 1}</span>
                      <span>{document.year}</span>
                    </span>
                    <span className="mt-4 line-clamp-2 text-lg font-semibold leading-7 text-white group-hover:text-brass">{document.title}</span>
                    <span className="mt-3 line-clamp-2 text-sm leading-6 text-white/60">{document.description}</span>
                    <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-white/75">
                      <span>{reading ? `${reading.detailViews + reading.pdfOpens} lượt quan tâm` : "Tài liệu mới"}</span>
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {timeline.length ? (
        <section className="mt-10 rounded border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-lacquer">
                <History className="h-5 w-5" aria-hidden="true" />
                <p className="text-sm font-semibold uppercase tracking-wide">Dòng thời gian tư liệu</p>
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Các mốc năm đang có trong kho</h2>
            </div>
            <p className="text-sm text-ink/55">{yearRange(relatedDocuments)}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((item) => (
              <Link
                key={item.year}
                href={`/tai-lieu?xa=${commune.id}&nam=${item.year}`}
                className="group flex min-h-32 flex-col rounded border border-ink/10 bg-paper/65 p-4 transition hover:border-palm/30 hover:bg-paper"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-semibold text-ink">{item.year}</span>
                  <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-palm">{item.count} tài liệu</span>
                </span>
                <span className="mt-3 line-clamp-2 text-sm leading-6 text-ink/62">{item.document.title}</span>
                <ArrowRight className="mt-auto h-4 w-4 self-end text-ink/35 transition group-hover:translate-x-1 group-hover:text-palm" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Theo nhóm tư liệu</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Cấu trúc tài liệu của {commune.name}</h2>
          </div>
          <Link
            href={`/tai-lieu?xa=${commune.id}`}
            className="inline-flex min-h-10 items-center rounded border border-ink/10 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-white"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {documentGroups.map((group, index) => {
            const Icon = group.icon;
            return (
              <article key={group.type} className="flex min-h-[17rem] flex-col rounded border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">{group.count} tài liệu</p>
                    <h3 className="mt-2 text-xl font-semibold text-ink">{group.title}</h3>
                  </div>
                  <span
                    className={cn(
                      "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded text-white",
                      index === 0 ? "bg-palm" : index === 1 ? "bg-blue" : "bg-gold"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink/64">{group.description}</p>

                {group.documents.length ? (
                  <div className="mt-4 space-y-2">
                    {group.documents.map((document) => (
                      <Link
                        key={document.id}
                        href={`/tai-lieu/${document.slug}`}
                        className="block rounded border border-ink/8 bg-paper/60 px-3 py-2 text-sm font-semibold text-ink transition hover:border-palm/25 hover:bg-paper"
                      >
                        <span className="line-clamp-1">{document.title}</span>
                        <span className="mt-1 block text-xs font-medium text-ink/50">{document.year}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded border border-dashed border-ink/16 bg-paper/60 px-3 py-2 text-sm leading-6 text-ink/55">
                    Chưa có tài liệu thuộc nhóm này.
                  </p>
                )}

                <Link
                  href={group.href}
                  className="mt-auto inline-flex min-h-10 items-center justify-center rounded border border-ink/10 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
                >
                  Mở nhóm tài liệu
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {communeSuggestions.length ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-lacquer" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-ink">Xã/phường có tư liệu liên quan</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {communeSuggestions.map(({ commune: suggestedCommune, count }) => (
              <Link
                key={suggestedCommune.id}
                href={`/xa-phuong/${suggestedCommune.slug}`}
                className="group flex min-h-24 items-center justify-between gap-4 rounded border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-palm/30 hover:shadow-soft"
              >
                <span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-lacquer">{typePrefix(suggestedCommune.type)}</span>
                  <span className="mt-1 block font-semibold text-ink group-hover:text-palm">{suggestedCommune.name}</span>
                  <span className="mt-1 block text-sm text-ink/55">{count} tài liệu đang gắn</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink/35 transition group-hover:text-palm" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

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
