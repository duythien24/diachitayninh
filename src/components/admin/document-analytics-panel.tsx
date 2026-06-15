import Link from "next/link";
import { Activity, BookOpenCheck, Eye, MapPinned, MousePointerClick, TrendingUp } from "lucide-react";

import type { DocumentAnalytics } from "@/lib/document-analytics";

function shortDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(`${value}T00:00:00Z`));
}

export function DocumentAnalyticsPanel({ analytics }: { analytics: DocumentAnalytics }) {
  if (!analytics.available) {
    return (
      <section className="mt-8 rounded border border-gold/30 bg-gold/10 p-5">
        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 h-5 w-5 shrink-0 text-lacquer" aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-ink">Chưa bật thống kê lượt đọc</h2>
            <p className="mt-1 text-sm leading-6 text-ink/65">
              Chạy file <code className="rounded bg-white px-1.5 py-0.5">supabase/document-analytics.sql</code> trên Supabase để bắt đầu ghi nhận dữ liệu ẩn danh.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const maxDaily = Math.max(1, ...analytics.daily.map((item) => item.total));
  const totalInteractions = analytics.totalDetailViews + analytics.totalPdfOpens;

  return (
    <section className="mt-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Lượt xem chi tiết", value: analytics.totalDetailViews, icon: Eye },
          { label: "Lượt mở tài liệu", value: analytics.totalPdfOpens, icon: BookOpenCheck },
          { label: "Tương tác trong 30 ngày", value: analytics.last30Days, icon: TrendingUp }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-palm" aria-hidden="true" />
              <p className="mt-4 text-3xl font-semibold text-ink">{item.value.toLocaleString("vi-VN")}</p>
              <p className="mt-1 text-sm text-ink/60">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">14 ngày gần nhất</p>
              <h2 className="mt-1 text-xl font-semibold text-ink">Nhịp độ đọc tài liệu</h2>
            </div>
            <p className="text-sm text-ink/55">Tổng {totalInteractions.toLocaleString("vi-VN")} tương tác</p>
          </div>
          <div
            className="mt-6 grid h-52 items-end gap-1.5 border-b border-ink/10 px-1 sm:gap-2"
            style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
          >
            {analytics.daily.map((item) => (
              <div key={item.date} className="group flex h-full min-w-0 flex-col items-center justify-end gap-2">
                <div className="relative flex h-[160px] w-full items-end justify-center">
                  <div
                    className="w-full max-w-7 rounded-t bg-palm transition group-hover:bg-lacquer"
                    style={{ height: `${Math.max(item.total ? 8 : 2, (item.total / maxDaily) * 100)}%` }}
                    title={`${shortDate(item.date)}: ${item.detailViews} lượt xem, ${item.pdfOpens} lượt mở`}
                  />
                </div>
                <span className="hidden text-[10px] text-ink/45 sm:block">{shortDate(item.date)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-5 text-xs text-ink/55">
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-palm" />Lượt xem và mở tài liệu theo ngày</span>
          </div>
        </section>

        <section className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-lacquer" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-ink">Địa phương được quan tâm</h2>
          </div>
          <div className="mt-5 space-y-2">
            {analytics.popularCommunes.length ? analytics.popularCommunes.map((commune, index) => (
              <Link
                key={commune.id}
                href={`/xa-phuong/${commune.slug}`}
                className="flex min-h-12 items-center gap-3 rounded border border-ink/8 px-3 py-2 transition hover:border-palm/25 hover:bg-paper"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-paper text-xs font-semibold text-lacquer">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">{commune.label}</span>
                <span className="text-sm text-ink/55">{commune.total}</span>
              </Link>
            )) : (
              <p className="rounded border border-dashed border-ink/15 bg-paper p-4 text-sm text-ink/55">Chưa có lượt đọc gắn với xã/phường.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MousePointerClick className="h-5 w-5 text-palm" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-ink">Tài liệu được quan tâm nhất</h2>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="pb-3 pr-4 font-semibold">Tài liệu</th>
                <th className="w-28 pb-3 text-right font-semibold">Xem chi tiết</th>
                <th className="w-28 pb-3 text-right font-semibold">Mở đọc</th>
                <th className="w-24 pb-3 text-right font-semibold">Tổng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {analytics.popularDocuments.length ? analytics.popularDocuments.map((document) => (
                <tr key={document.id}>
                  <td className="py-3 pr-4">
                    <Link href={`/tai-lieu/${document.slug}`} className="font-semibold text-ink transition hover:text-palm">
                      {document.title}
                    </Link>
                  </td>
                  <td className="py-3 text-right text-ink/60">{document.detailViews}</td>
                  <td className="py-3 text-right text-ink/60">{document.pdfOpens}</td>
                  <td className="py-3 text-right font-semibold text-ink">{document.total}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="py-6 text-center text-ink/55">Chưa có lượt đọc để xếp hạng.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
