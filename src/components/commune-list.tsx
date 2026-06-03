"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

import type { Commune, CommuneType } from "@/lib/types";
import { cn, normalizeVietnamese, typePrefix } from "@/lib/utils";

type Filter = "all" | CommuneType | "has_docs";
export type CommuneListItem = Commune & { documentCount?: number };

const filters: Array<{ label: string; value: Filter }> = [
  { label: "Có tài liệu", value: "has_docs" },
  { label: "Tất cả", value: "all" },
  { label: "Xã", value: "xa" },
  { label: "Phường", value: "phuong" }
];

export function CommuneList({ communes }: { communes: CommuneListItem[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredCommunes = useMemo(() => {
    const normalizedQuery = normalizeVietnamese(query.trim());

    return communes.filter((commune) => {
      const matchesType = filter === "all" || (filter === "has_docs" ? Boolean(commune.documentCount) : commune.type === filter);
      const searchableText = normalizeVietnamese(`${commune.name} ${commune.slug} ${commune.districtOld || ""}`);
      const matchesQuery = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [communes, filter, query]);

  return (
    <section className="mt-8">
      <div className="rounded border border-ink/10 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-h-12 items-center gap-3 rounded border border-ink/10 bg-paper/80 px-4 text-ink/55 lg:w-[30rem]">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Tìm xã/phường</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
              placeholder="Tìm theo tên xã/phường"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={cn(
                  "min-h-10 rounded border px-3 py-2 text-sm font-semibold transition",
                  filter === item.value
                    ? "border-palm bg-palm text-white"
                    : "border-ink/10 bg-white text-ink/62 hover:bg-paper hover:text-ink"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-sm text-ink/55">Đang hiển thị {filteredCommunes.length} đơn vị</p>
      </div>

      {filteredCommunes.length > 0 ? (
        <div className="mt-5 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCommunes.map((commune) => (
            <Link
              key={commune.id}
              href={`/xa-phuong/${commune.slug}`}
              className="group flex h-full min-h-44 flex-col rounded border border-ink/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-palm/35 hover:shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-lacquer">{typePrefix(commune.type)}</p>
                    {commune.documentCount ? (
                      <span className="rounded bg-palm/10 px-2 py-0.5 text-xs font-semibold text-palm">
                        {commune.documentCount} tài liệu
                      </span>
                    ) : (
                      <span className="rounded bg-ink/5 px-2 py-0.5 text-xs font-semibold text-ink/45">Đang bổ sung</span>
                    )}
                  </div>
                  <h2 className="mt-2 truncate text-lg font-semibold text-ink">{commune.name}</h2>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink/35 transition group-hover:translate-x-1 group-hover:text-palm" aria-hidden="true" />
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/62">{commune.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
          Không tìm thấy xã/phường phù hợp.
        </div>
      )}
    </section>
  );
}
