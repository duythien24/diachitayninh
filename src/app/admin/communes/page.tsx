import Link from "next/link";
import { ArrowRight, Building2, Image as ImageIcon, KeyRound, Search, Tags } from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";
import { getAdminCommunes, getAdminDocuments, usingMockData } from "@/lib/repository";
import { cn, typePrefix } from "@/lib/utils";

function statusMessage(status?: string) {
  if (status === "updated") return "Đã cập nhật thông tin xã/phường.";
  if (status === "missing-env") return "Chưa cấu hình Supabase service role nên chưa thể lưu dữ liệu thật.";
  return null;
}

export default async function AdminCommunesPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [communes, documents, params] = await Promise.all([getAdminCommunes(), getAdminDocuments(), searchParams]);
  const isMock = usingMockData();
  const message = statusMessage(params.status);
  const documentCountByCommune = new Map<string, number>();

  for (const document of documents) {
    const communeIds = document.communeIds?.length ? document.communeIds : document.communeId ? [document.communeId] : [];
    for (const communeId of communeIds) {
      documentCountByCommune.set(communeId, (documentCountByCommune.get(communeId) || 0) + 1);
    }
  }

  const completedCount = communes.filter(
    (commune) => Boolean(commune.description?.trim()) || Boolean(commune.coverImageUrl) || Boolean(commune.keywords?.length)
  ).length;

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Quản trị"
          title="Quản trị xã/phường"
          description="Cập nhật mô tả, ảnh đại diện và từ khóa cho từng đơn vị để trang chi tiết xã/phường có nội dung riêng, không phải sửa code."
        />
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-ink/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
        >
          <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
          Về bảng điều khiển
        </Link>
      </div>

      {message ? (
        <div className="mt-6 rounded border border-palm/20 bg-palm/8 p-4 text-sm font-medium text-palm">
          {message}
        </div>
      ) : null}

      {isMock ? (
        <div className="mt-6 rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm leading-6 text-lacquer">
          Dữ liệu đang lấy từ mock. Sau khi cấu hình Supabase, trang này sẽ cập nhật trực tiếp bảng communes.
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { label: "Tổng xã/phường", value: communes.length, icon: Building2 },
          { label: "Đã có metadata", value: completedCount, icon: Tags },
          {
            label: "Có tài liệu",
            value: communes.filter((commune) => documentCountByCommune.has(commune.id)).length,
            icon: KeyRound
          }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-lacquer" aria-hidden="true" />
              <p className="mt-4 text-2xl font-semibold text-ink">{item.value}</p>
              <p className="mt-1 text-sm text-ink/60">{item.label}</p>
            </div>
          );
        })}
      </div>

      <section className="mt-8 overflow-hidden rounded border border-ink/10 bg-white shadow-sm">
        <div className="border-b border-ink/8 bg-paper px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink/70">
            <Search className="h-4 w-4" aria-hidden="true" />
            Danh sách 96 xã/phường
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-paper/70 text-ink/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Tên đơn vị</th>
                <th className="px-4 py-3 font-semibold">Loại</th>
                <th className="px-4 py-3 font-semibold">Tài liệu</th>
                <th className="px-4 py-3 font-semibold">Ảnh</th>
                <th className="px-4 py-3 font-semibold">Từ khóa</th>
                <th className="px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {communes.map((commune) => {
                const documentCount = documentCountByCommune.get(commune.id) || 0;
                return (
                  <tr key={commune.id} className={cn(documentCount ? "bg-palm/3" : "bg-white")}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink">{commune.name}</p>
                      <p className="mt-1 line-clamp-1 max-w-xl text-xs text-ink/55">{commune.description}</p>
                    </td>
                    <td className="px-4 py-4 text-ink/68">{typePrefix(commune.type)}</td>
                    <td className="px-4 py-4">
                      <span className="rounded bg-palm/10 px-2.5 py-1 text-xs font-semibold text-palm">
                        {documentCount} tài liệu
                      </span>
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
                      <Link
                        href={`/admin/communes/${commune.id}/edit`}
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded border border-ink/12 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
                      >
                        Sửa
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
