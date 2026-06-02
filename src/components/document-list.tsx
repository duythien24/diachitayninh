"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, FileText, Files, Newspaper, RotateCcw, Search } from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import type { Commune, Document, DocumentType } from "@/lib/types";
import { cn, typePrefix } from "@/lib/utils";

type Filter = "all" | DocumentType;
type FilterOptions = {
  years: number[];
  authors: string[];
  publishers: string[];
};

const filters: Array<{ label: string; value: Filter; icon: typeof FileText }> = [
  { label: "Tất cả", value: "all", icon: FileText },
  { label: "Địa chí", value: "dia_chi", icon: FileText },
  { label: "Báo Tây Ninh", value: "bao_tay_ninh", icon: Newspaper },
  { label: "Cấp tỉnh", value: "tai_lieu_cap_tinh", icon: Files }
];

function selectClass() {
  return "min-h-11 w-full rounded border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-palm";
}

export function DocumentList({
  documents,
  communes,
  filterOptions,
  hasMore,
  currentPage,
  initialFilter = "all",
  initialQuery = "",
  initialCommuneId = "",
  initialYear = "",
  initialAuthor = "",
  initialPublisher = ""
}: {
  documents: Document[];
  communes: Commune[];
  filterOptions: FilterOptions;
  hasMore: boolean;
  currentPage: number;
  initialFilter?: Filter;
  initialQuery?: string;
  initialCommuneId?: string;
  initialYear?: string;
  initialAuthor?: string;
  initialPublisher?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [communeId, setCommuneId] = useState(initialCommuneId);
  const [year, setYear] = useState(initialYear);
  const [author, setAuthor] = useState(initialAuthor);
  const [publisher, setPublisher] = useState(initialPublisher);

  useEffect(() => {
    setFilter(initialFilter);
    setQuery(initialQuery);
    setCommuneId(initialCommuneId);
    setYear(initialYear);
    setAuthor(initialAuthor);
    setPublisher(initialPublisher);
  }, [initialAuthor, initialCommuneId, initialFilter, initialPublisher, initialQuery, initialYear]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const values = [
        ["q", query.trim()],
        ["xa", communeId],
        ["nam", year],
        ["tac_gia", author],
        ["nxb", publisher]
      ] as const;

      for (const [key, value] of values) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      if (filter === "all") {
        params.delete("loai");
      } else {
        params.set("loai", filter);
      }

      params.delete("page");

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      const currentUrl = `${pathname}${window.location.search}`;

      if (nextUrl !== currentUrl) {
        startTransition(() => {
          router.replace(nextUrl, { scroll: false });
        });
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [author, communeId, filter, pathname, publisher, query, router, searchParams, year]);

  const loadMoreHref = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(currentPage + 1));
    return `${pathname}?${params.toString()}`;
  }, [currentPage, pathname, searchParams]);

  return (
    <section className="mt-8">
      <div className="rounded border border-ink/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-h-12 items-center gap-3 rounded border border-ink/10 bg-paper/80 px-4 text-ink/55 lg:w-[30rem]">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Tìm tài liệu</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
              placeholder="Tìm theo tên, mô tả, từ khóa, năm, nguồn"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded border px-3 py-2 text-sm font-semibold transition",
                    filter === item.value
                      ? "border-palm bg-palm text-white"
                      : "border-ink/10 bg-white text-ink/62 hover:bg-paper hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm font-semibold text-ink">
            Xã/phường
            <select value={communeId} onChange={(event) => setCommuneId(event.target.value)} className={cn("mt-2", selectClass())}>
              <option value="">Tất cả xã/phường</option>
              {communes.map((commune) => (
                <option key={commune.id} value={commune.id}>
                  {typePrefix(commune.type)} {commune.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-ink">
            Năm
            <select value={year} onChange={(event) => setYear(event.target.value)} className={cn("mt-2", selectClass())}>
              <option value="">Tất cả năm</option>
              {filterOptions.years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-ink">
            Tác giả
            <select value={author} onChange={(event) => setAuthor(event.target.value)} className={cn("mt-2", selectClass())}>
              <option value="">Tất cả tác giả</option>
              {filterOptions.authors.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-ink">
            Nhà xuất bản
            <select value={publisher} onChange={(event) => setPublisher(event.target.value)} className={cn("mt-2", selectClass())}>
              <option value="">Tất cả NXB</option>
              {filterOptions.publishers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <Link
              href="/tai-lieu"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded border border-ink/10 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Xóa lọc
            </Link>
          </div>
        </div>

        <p className="mt-3 text-sm text-ink/55">
          {isPending ? "Đang tìm trên Supabase..." : `Đang hiển thị ${documents.length} tài liệu`}
        </p>
      </div>

      {documents.length > 0 ? (
        <>
          <div className="mt-5 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>

          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <Link
                href={loadMoreHref}
                scroll={false}
                className="inline-flex min-h-11 items-center gap-2 rounded bg-palm px-4 py-2 text-sm font-semibold text-white transition hover:bg-palm/90"
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
                Xem thêm
              </Link>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-5 rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
          Chưa có tài liệu phù hợp. Có thể đổi từ khóa, đổi bộ lọc hoặc thêm tài liệu mới trong khu quản trị.
        </div>
      )}
    </section>
  );
}
