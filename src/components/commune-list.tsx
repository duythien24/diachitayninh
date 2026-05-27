"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

import type { Commune, CommuneType } from "@/lib/types";
import { cn, communeDescription, typePrefix } from "@/lib/utils";

type Filter = "all" | CommuneType;

const filters: Array<{ label: string; value: Filter }> = [
  { label: "Tất cả", value: "all" },
  { label: "Xã", value: "xa" },
  { label: "Phường", value: "phuong" }
];

export function CommuneList({ communes }: { communes: Commune[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredCommunes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return communes.filter((commune) => {
      const matchesType = filter === "all" || commune.type === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        commune.name.toLowerCase().includes(normalizedQuery) ||
        commune.slug.includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [communes, filter, query]);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex min-h-12 items-center gap-3 rounded border border-ink/10 bg-white px-4 text-ink/55 lg:w-96">
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Tìm xã phường</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
            placeholder="Tìm theo tên xã/phường"
          />
        </label>
        <div className="inline-flex w-fit rounded border border-ink/10 bg-white p-1">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded px-3 py-2 text-sm font-semibold transition",
                filter === item.value ? "bg-palm text-white" : "text-ink/62 hover:bg-paper hover:text-ink"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-ink/55">Đang hiển thị {filteredCommunes.length} đơn vị</p>

      {filteredCommunes.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCommunes.map((commune) => (
            <Link
              key={commune.id}
              href={`/xa-phuong/${commune.slug}`}
              className="group rounded border border-ink/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-palm/35 hover:shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-lacquer">
                    {typePrefix(commune.type)}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-ink">{commune.name}</h2>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink/35 transition group-hover:text-palm" aria-hidden="true" />
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/62">
                {communeDescription(commune.name, commune.type)}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
          Không tìm thấy xã/phường phù hợp.
        </div>
      )}
    </section>
  );
}
