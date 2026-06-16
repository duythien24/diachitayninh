import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Clock3, FileText, Library, Newspaper, Sparkles } from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getDocuments } from "@/lib/repository";
import type { Document, DocumentType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dòng thời gian tư liệu",
  description: "Khám phá tài liệu địa chí, báo chí và tư liệu cấp tỉnh Tây Ninh theo từng năm, từng giai đoạn lịch sử."
};

type YearGroup = {
  year: number;
  documents: Document[];
};

type DecadeGroup = {
  decade: number;
  years: YearGroup[];
  documents: Document[];
};

function groupByTimeline(documents: Document[]) {
  const yearMap = new Map<number, Document[]>();

  for (const document of documents) {
    if (!document.year || !Number.isFinite(document.year)) continue;
    const current = yearMap.get(document.year) || [];
    current.push(document);
    yearMap.set(document.year, current);
  }

  const decadeMap = new Map<number, YearGroup[]>();
  for (const [year, items] of yearMap.entries()) {
    const decade = Math.floor(year / 10) * 10;
    const current = decadeMap.get(decade) || [];
    current.push({
      year,
      documents: [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    });
    decadeMap.set(decade, current);
  }

  return Array.from(decadeMap.entries())
    .map(([decade, years]) => {
      const sortedYears = years.sort((left, right) => right.year - left.year);
      const decadeDocuments = sortedYears.flatMap((year) => year.documents);
      return {
        decade,
        years: sortedYears,
        documents: decadeDocuments
      };
    })
    .sort((left, right) => right.decade - left.decade);
}

function documentCountByType(documents: Document[], type: DocumentType) {
  return documents.filter((document) => document.documentType === type).length;
}

function topYears(groups: DecadeGroup[]) {
  return groups
    .flatMap((group) => group.years)
    .sort((left, right) => right.documents.length - left.documents.length || right.year - left.year)
    .slice(0, 8);
}

function firstInterestingDocuments(groups: DecadeGroup[]) {
  const seen = new Set<string>();
  const result: Document[] = [];

  for (const group of groups) {
    for (const year of group.years) {
      for (const document of year.documents) {
        if (seen.has(document.id)) continue;
        seen.add(document.id);
        result.push(document);
        if (result.length >= 3) return result;
      }
    }
  }

  return result;
}

export default async function TimelinePage() {
  const documents = await getDocuments();
  const groups = groupByTimeline(documents);
  const years = groups.flatMap((group) => group.years.map((year) => year.year)).sort((left, right) => left - right);
  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  const activeYears = topYears(groups);
  const featuredDocuments = firstInterestingDocuments(groups);
  const stats = [
    { label: "Tài liệu có năm", value: String(groups.flatMap((group) => group.documents).length), icon: FileText },
    { label: "Giai đoạn", value: firstYear && lastYear ? `${firstYear} - ${lastYear}` : "Đang cập nhật", icon: CalendarDays },
    { label: "Địa chí", value: String(documentCountByType(documents, "dia_chi")), icon: Library },
    { label: "Báo chí", value: String(documentCountByType(documents, "bao_tay_ninh")), icon: Newspaper }
  ];

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Dòng thời gian"
        title="Đi qua tư liệu theo từng giai đoạn"
        description="Thay vì bắt đầu từ tên tài liệu, bạn đọc có thể đi theo năm xuất bản và những giai đoạn có nhiều tư liệu để nhìn rõ hơn mạch lịch sử, văn hóa và báo chí địa phương."
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-lacquer" aria-hidden="true" />
              <p className="mt-4 text-2xl font-semibold text-ink">{item.value}</p>
              <p className="mt-1 text-sm text-ink/60">{item.label}</p>
            </div>
          );
        })}
      </section>

      {activeYears.length ? (
        <section className="mt-8 overflow-hidden rounded border border-ink/10 bg-ink text-white shadow-soft">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1 text-sm font-semibold text-white/82">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Năm có nhiều tư liệu
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight">Bắt đầu từ những năm tư liệu dày nhất</h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                Các năm dưới đây đang có nhiều tài liệu trong kho. Bấm vào từng năm để mở ngay trang tài liệu đã lọc sẵn.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {activeYears.map((year) => (
                  <Link
                    key={year.year}
                    href={`/tai-lieu?nam=${year.year}`}
                    className="group flex min-h-20 items-center justify-between gap-4 rounded border border-white/12 bg-white/8 p-4 transition hover:border-brass/60 hover:bg-white/12"
                  >
                    <span>
                      <span className="block text-2xl font-semibold text-white">{year.year}</span>
                      <span className="mt-1 block text-sm text-white/62">{year.documents.length} tài liệu</span>
                    </span>
                    <ArrowRight className="h-5 w-5 text-brass transition group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/5 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-brass">Gợi ý đọc nhanh</p>
              <div className="mt-5 space-y-3">
                {featuredDocuments.map((document) => (
                  <Link
                    key={document.id}
                    href={`/tai-lieu/${document.slug}`}
                    className="group block rounded border border-white/12 bg-white/8 p-4 transition hover:border-brass/60 hover:bg-white/12"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-brass">{document.year}</span>
                    <span className="mt-1 block font-semibold leading-6 text-white">{document.title}</span>
                    <span className="mt-2 line-clamp-2 text-sm leading-6 text-white/62">{document.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Theo thập niên</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">Mở từng lớp tư liệu</h2>
          </div>
          <Link
            href="/tai-lieu"
            className="inline-flex min-h-11 items-center gap-2 rounded border border-ink/12 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
          >
            Xem toàn bộ kho
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {groups.length ? (
          <div className="mt-6 space-y-5">
            {groups.map((group) => (
              <article key={group.decade} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Thập niên</p>
                    <h3 className="mt-1 text-3xl font-semibold text-ink">{group.decade}s</h3>
                    <p className="mt-2 text-sm text-ink/60">{group.documents.length} tài liệu trong {group.years.length} năm</p>
                  </div>
                  <Link
                    href={`/tai-lieu?nam=${group.years[0]?.year || group.decade}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded bg-palm px-3 py-2 text-sm font-semibold text-white transition hover:bg-palm/90"
                  >
                    Mở năm mới nhất
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {group.years.slice(0, 8).map((year) => (
                    <Link
                      key={year.year}
                      href={`/tai-lieu?nam=${year.year}`}
                      className="group rounded border border-ink/10 bg-paper/70 p-4 transition hover:border-palm/35 hover:bg-white hover:shadow-sm"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-xl font-semibold text-ink">{year.year}</span>
                        <Clock3 className="h-4 w-4 text-ink/35 group-hover:text-palm" aria-hidden="true" />
                      </span>
                      <span className="mt-1 block text-sm text-ink/58">{year.documents.length} tài liệu</span>
                      <span className="mt-3 line-clamp-2 block text-sm leading-6 text-ink/68">{year.documents[0]?.title}</span>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded border border-dashed border-ink/16 bg-white p-6 text-sm leading-6 text-ink/62">
            Chưa có tài liệu nào có năm xuất bản. Khi quản trị bổ sung trường năm, dòng thời gian sẽ tự hiển thị.
          </div>
        )}
      </section>

      {featuredDocuments.length ? (
        <section className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-palm" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-ink">Một vài tài liệu để bắt đầu</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10 rounded border border-ink/10 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Gợi ý quản trị dữ liệu</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Muốn dòng thời gian đẹp hơn?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/68">
          Khi thêm tài liệu mới, hãy điền đầy đủ năm xuất bản, tác giả, nhà xuất bản và từ khóa. Những thông tin này giúp trang dòng thời gian,
          bộ lọc tài liệu và trang xã/phường tự liên kết với nhau tốt hơn.
        </p>
      </section>
    </PageShell>
  );
}
