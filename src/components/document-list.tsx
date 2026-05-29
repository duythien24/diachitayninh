"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Files, Newspaper, Search } from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import type { Document, DocumentType } from "@/lib/types";
import { cn, normalizeVietnamese } from "@/lib/utils";

type Filter = "all" | DocumentType;

const filters: Array<{ label: string; value: Filter; icon: typeof FileText }> = [
  { label: "Tất cả", value: "all", icon: FileText },
  { label: "Địa chí", value: "dia_chi", icon: FileText },
  { label: "Báo Tây Ninh", value: "bao_tay_ninh", icon: Newspaper },
  { label: "Cấp tỉnh", value: "tai_lieu_cap_tinh", icon: Files }
];

export function DocumentList({
  documents,
  initialFilter = "all",
  initialQuery = ""
}: {
  documents: Document[];
  initialFilter?: Filter;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>(initialFilter);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = normalizeVietnamese(query.trim());

    return documents.filter((document) => {
      const matchesType = filter === "all" || document.documentType === filter;
      const scopeName = document.documentType === "tai_lieu_cap_tinh" ? "cap tinh tai lieu cap tinh" : "";
      const searchableText = normalizeVietnamese(
        [
          document.title,
          document.description,
          String(document.year),
          document.source,
          document.slug,
          document.commune?.name || "",
          scopeName
        ].join(" ")
      );
      const matchesQuery = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [documents, filter, query]);

  return (
    <section className="mt-8">
      <div className="rounded border border-ink/10 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-h-12 items-center gap-3 rounded border border-ink/10 bg-paper/80 px-4 text-ink/55 lg:w-[30rem]">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Tìm tài liệu</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
              placeholder="Tìm theo tên tài liệu, xã/phường hoặc cấp tỉnh"
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

        <p className="mt-3 text-sm text-ink/55">Đang hiển thị {filteredDocuments.length} tài liệu</p>
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="mt-5 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
          Chưa có tài liệu phù hợp. Có thể đổi từ khóa, đổi bộ lọc hoặc thêm tài liệu mới trong khu quản trị.
        </div>
      )}
    </section>
  );
}
