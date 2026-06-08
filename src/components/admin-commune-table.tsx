"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ExternalLink, Image as ImageIcon, MapPinned, Search } from "lucide-react";

import type { Commune, CommuneType } from "@/lib/types";
import { cn, normalizeVietnamese, tinhThanhMapUrl, typePrefix } from "@/lib/utils";

type AdminCommuneItem = Commune & {
  documentCounts: {
    total: number;
    diaChi: number;
    baoTayNinh: number;
    provincial: number;
  };
};

type CommuneFilter = "all" | CommuneType;
type DataFilter = "all" | "has_docs" | "no_docs" | "missing_image" | "missing_keywords" | "missing_merge_info";

function selectClass() {
  return "min-h-11 rounded border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-palm";
}

export function AdminCommuneTable({ communes }: { communes: AdminCommuneItem[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CommuneFilter>("all");
  const [dataFilter, setDataFilter] = useState<DataFilter>("all");

  const filteredCommunes = useMemo(() => {
    const normalizedQuery = normalizeVietnamese(query.trim());

    return communes.filter((commune) => {
      if (typeFilter !== "all" && commune.type !== typeFilter) return false;
      if (dataFilter === "has_docs" && !commune.documentCounts.total) return false;
      if (dataFilter === "no_docs" && commune.documentCounts.total) return false;
      if (dataFilter === "missing_image" && commune.coverImageUrl) return false;
      if (dataFilter === "missing_keywords" && commune.keywords?.length) return false;
      if (dataFilter === "missing_merge_info" && commune.districtOld?.trim()) return false;

      if (!normalizedQuery) return true;

      return normalizeVietnamese(
        [commune.name, commune.slug, commune.districtOld, commune.description, commune.keywords?.join(" ") || ""].join(" ")
      ).includes(normalizedQuery);
    });
  }, [communes, dataFilter, query, typeFilter]);

  return (
    <section className="mt-8 overflow-hidden rounded border border-ink/10 bg-white shadow-sm">
      <div className="border-b border-ink/8 bg-paper px-4 py-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_12rem_15rem]">
          <label className="flex min-h-11 items-center gap-3 rounded border border-ink/10 bg-white px-3 text-ink/55">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Tìm xã/phường</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
              placeholder="Tìm theo tên, mô tả, thông tin sáp nhập, từ khóa..."
            />
          </label>

          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as CommuneFilter)} className={selectClass()}>
            <option value="all">Tất cả loại</option>
            <option value="xa">Xã</option>
            <option value="phuong">Phường</option>
          </select>

          <select value={dataFilter} onChange={(event) => setDataFilter(event.target.value as DataFilter)} className={selectClass()}>
            <option value="all">Tất cả dữ liệu</option>
            <option value="has_docs">Có tài liệu</option>
            <option value="no_docs">Chưa có tài liệu</option>
            <option value="missing_image">Thiếu ảnh</option>
            <option value="missing_keywords">Thiếu từ khóa</option>
            <option value="missing_merge_info">Thiếu thông tin sáp nhập</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-ink/55">
          Đang hiển thị {filteredCommunes.length} / {communes.length} xã/phường
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
          <thead className="bg-paper/70 text-ink/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Tên đơn vị</th>
              <th className="px-4 py-3 font-semibold">Loại</th>
              <th className="px-4 py-3 font-semibold">Tài liệu</th>
              <th className="px-4 py-3 font-semibold">Theo nhóm</th>
              <th className="px-4 py-3 font-semibold">Ảnh</th>
              <th className="px-4 py-3 font-semibold">Từ khóa</th>
              <th className="px-4 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {filteredCommunes.length ? (
              filteredCommunes.map((commune) => (
                <tr key={commune.id} className={cn(commune.documentCounts.total ? "bg-palm/3" : "bg-white")}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{commune.name}</p>
                    <p className="mt-1 line-clamp-1 max-w-xl text-xs font-medium text-lacquer">{commune.districtOld}</p>
                    <p className="mt-1 line-clamp-1 max-w-xl text-xs text-ink/55">{commune.description}</p>
                  </td>
                  <td className="px-4 py-4 text-ink/68">{typePrefix(commune.type)}</td>
                  <td className="px-4 py-4">
                    <span className="rounded bg-palm/10 px-2.5 py-1 text-xs font-semibold text-palm">
                      {commune.documentCounts.total} tài liệu
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded bg-ink/5 px-2 py-1 text-xs font-semibold text-ink/62">
                        ĐC {commune.documentCounts.diaChi}
                      </span>
                      <span className="rounded bg-blue/10 px-2 py-1 text-xs font-semibold text-blue">
                        Báo {commune.documentCounts.baoTayNinh}
                      </span>
                      <span className="rounded bg-gold/15 px-2 py-1 text-xs font-semibold text-ink/70">
                        Cấp tỉnh {commune.documentCounts.provincial}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold",
                        commune.coverImageUrl ? "bg-palm/10 text-palm" : "bg-ink/5 text-ink/45"
                      )}
                    >
                      <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {commune.coverImageUrl ? "Đã có" : "Chưa có"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-ink/68">
                    {commune.keywords?.length ? commune.keywords.slice(0, 3).join(", ") : "Chưa có"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/communes/${commune.id}/edit`}
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded border border-ink/12 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
                      >
                        Sửa
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/xa-phuong/${commune.slug}`}
                        target="_blank"
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded border border-palm/20 px-3 py-2 text-sm font-semibold text-palm transition hover:bg-palm/8"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Xem
                      </Link>
                      <a
                        href={tinhThanhMapUrl(commune.type, commune.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded border border-ink/12 px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-paper"
                      >
                        <MapPinned className="h-4 w-4" aria-hidden="true" />
                        Bản đồ
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink/60">
                  Không có xã/phường phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
