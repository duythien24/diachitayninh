"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Newspaper, Search } from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import type { Document, DocumentType } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | DocumentType;

const filters: Array<{ label: string; value: Filter; icon: typeof FileText }> = [
  { label: "Tất cả", value: "all", icon: FileText },
  { label: "Địa chí", value: "dia_chi", icon: FileText },
  { label: "Báo Tây Ninh", value: "bao_tay_ninh", icon: Newspaper }
];

export function DocumentList({
  documents,
  initialFilter = "all"
}: {
  documents: Document[];
  initialFilter?: Filter;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(initialFilter);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesType = filter === "all" || document.documentType === filter;
      const communeName = document.commune?.name.toLowerCase() || "";
      const matchesQuery =
        normalizedQuery.length === 0 ||
        document.title.toLowerCase().includes(normalizedQuery) ||
        document.slug.includes(normalizedQuery) ||
        communeName.includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [documents, filter, query]);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex min-h-12 items-center gap-3 rounded border border-ink/10 bg-white px-4 text-ink/55 lg:w-96">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Tìm tài liệu</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
            placeholder="Tìm theo tên tài liệu hoặc xã/phường"
          />
        </label>
        <div className="inline-flex w-fit rounded border border-ink/10 bg-white p-1">
          {filters.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold transition",
                  filter === item.value ? "bg-palm text-white" : "text-ink/62 hover:bg-paper hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-sm text-ink/55">Đang hiển thị {filteredDocuments.length} tài liệu</p>

      {filteredDocuments.length > 0 ? (
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
          Chưa có tài liệu phù hợp. Admin có thể thêm bản PDF preview trong khu quản trị.
        </div>
      )}
    </section>
  );
}
