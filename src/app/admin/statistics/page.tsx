import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  FileText,
  ImageOff,
  ShieldCheck,
  Tags
} from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";
import { DocumentAnalyticsPanel } from "@/components/admin/document-analytics-panel";
import { getDocumentAnalytics } from "@/lib/document-analytics";
import { getAdminCommunes, getAdminDocuments, usingMockData } from "@/lib/repository";
import type { Document, DocumentType } from "@/lib/types";
import { documentTypeLabel, typePrefix } from "@/lib/utils";

type StatItem = {
  label: string;
  value: number;
  href?: string;
};

const documentTypeOrder: DocumentType[] = ["dia_chi", "bao_tay_ninh", "tai_lieu_cap_tinh"];

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function groupCount<T extends string | number>(items: T[]) {
  const map = new Map<T, number>();
  for (const item of items) {
    map.set(item, (map.get(item) || 0) + 1);
  }
  return map;
}

function yearStats(documents: Document[]) {
  return Array.from(groupCount(documents.map((document) => document.year)).entries())
    .sort((left, right) => right[0] - left[0])
    .slice(0, 10)
    .map(([year, count]) => ({ label: String(year), value: count }));
}

function communeStats(documents: Document[]) {
  const map = new Map<string, { label: string; value: number; href: string }>();

  for (const document of documents) {
    const communes = document.communes?.length ? document.communes : document.commune ? [document.commune] : [];
    for (const commune of communes) {
      const key = commune.id;
      const current = map.get(key);
      map.set(key, {
        label: `${typePrefix(commune.type)} ${commune.name}`,
        value: (current?.value || 0) + 1,
        href: `/admin/documents?nhom=dia_chi&q=${encodeURIComponent(commune.name)}`
      });
    }
  }

  return Array.from(map.values())
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, "vi"))
    .slice(0, 10);
}

function missingMetadata(document: Document) {
  return (
    !document.coverImageUrl ||
    !document.description?.trim() ||
    !document.author?.trim() ||
    !document.publisher?.trim() ||
    !document.pageCount ||
    !document.keywords?.length
  );
}

function BarList({ items, total }: { items: StatItem[]; total: number }) {
  return (
    <div className="space-y-3">
      {items.length ? (
        items.map((item) => {
          const width = Math.max(4, percent(item.value, total));
          const content = (
            <>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-ink">{item.label}</span>
                <span className="text-ink/60">{item.value}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded bg-ink/8">
                <div className="h-full rounded bg-palm" style={{ width: `${width}%` }} />
              </div>
            </>
          );

          return item.href ? (
            <Link key={item.label} href={item.href} className="block rounded p-2 transition hover:bg-paper">
              {content}
            </Link>
          ) : (
            <div key={item.label} className="rounded p-2">
              {content}
            </div>
          );
        })
      ) : (
        <p className="rounded border border-dashed border-ink/18 bg-paper p-4 text-sm text-ink/60">Chưa có dữ liệu.</p>
      )}
    </div>
  );
}

export default async function AdminStatisticsPage() {
  const [documents, communes] = await Promise.all([getAdminDocuments(), getAdminCommunes()]);
  const analytics = await getDocumentAnalytics(documents, communes);
  const isMock = usingMockData();
  const totalDocuments = documents.length;
  const fullCount = documents.filter((document) => !document.isPreviewOnly).length;
  const previewCount = documents.filter((document) => document.isPreviewOnly).length;
  const missingCoverCount = documents.filter((document) => !document.coverImageUrl).length;
  const missingMetadataCount = documents.filter(missingMetadata).length;
  const communesWithDocuments = new Set(
    documents.flatMap((document) => (document.communeIds?.length ? document.communeIds : document.communeId ? [document.communeId] : []))
  ).size;

  const typeItems = documentTypeOrder.map((type) => ({
    label: documentTypeLabel(type),
    value: documents.filter((document) => document.documentType === type).length,
    href: `/admin/documents?nhom=${type}`
  }));
  const latestDocuments = [...documents]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 8);
  const needsWork = documents.filter(missingMetadata).slice(0, 10);

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Quản trị"
        title="Thống kê dữ liệu"
        description="Theo dõi chất lượng dữ liệu, mức độ hoàn thiện metadata và các nhóm tài liệu cần ưu tiên xử lý."
      />

      {isMock ? (
        <div className="mt-6 rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm leading-6 text-lacquer">
          Dữ liệu đang lấy từ mock. Sau khi cấu hình Supabase, thống kê sẽ phản ánh dữ liệu thật.
        </div>
      ) : null}

      <DocumentAnalyticsPanel analytics={analytics} />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tổng tài liệu", value: totalDocuments, icon: FileText },
          { label: "Bản đầy đủ", value: fullCount, icon: ShieldCheck },
          { label: "Bản preview", value: previewCount, icon: BookOpen },
          { label: "Xã/phường có tài liệu", value: communesWithDocuments, icon: Building2 }
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

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-palm" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-ink">Tài liệu theo loại</h2>
          </div>
          <BarList items={typeItems} total={Math.max(1, totalDocuments)} />
        </section>

        <section className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-palm" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-ink">10 năm có nhiều tài liệu nhất</h2>
          </div>
          <BarList items={yearStats(documents)} total={Math.max(1, totalDocuments)} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-palm" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-ink">Xã/phường có nhiều tài liệu</h2>
          </div>
          <BarList items={communeStats(documents)} total={Math.max(1, totalDocuments)} />
        </section>

        <section className="space-y-4">
          <div className="rounded border border-lacquer/20 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-lacquer" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink">Cần bổ sung metadata</h2>
            </div>
            <p className="mt-4 text-3xl font-semibold text-lacquer">{missingMetadataCount}</p>
            <p className="mt-1 text-sm text-ink/60">Tài liệu thiếu ảnh, mô tả, tác giả, NXB, số trang hoặc từ khóa.</p>
          </div>

          <div className="rounded border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ImageOff className="h-5 w-5 text-gold" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink">Thiếu ảnh bìa</h2>
            </div>
            <p className="mt-4 text-3xl font-semibold text-ink">{missingCoverCount}</p>
            <p className="mt-1 text-sm text-ink/60">Nên bổ sung ảnh bìa để danh sách tài liệu đồng bộ hơn.</p>
          </div>

          <div className="rounded border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Tags className="h-5 w-5 text-palm" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink">Độ phủ xã/phường</h2>
            </div>
            <p className="mt-4 text-3xl font-semibold text-ink">
              {communesWithDocuments}/{communes.length}
            </p>
            <p className="mt-1 text-sm text-ink/60">Số xã/phường đã có ít nhất một tài liệu liên quan.</p>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">Tài liệu cần hoàn thiện trước</h2>
            <Link href="/admin/documents" className="text-sm font-semibold text-palm hover:text-lacquer">
              Mở quản lý tài liệu
            </Link>
          </div>
          <div className="space-y-3">
            {needsWork.length ? (
              needsWork.map((document) => (
                <Link
                  key={document.id}
                  href={`/admin/documents/${document.id}/edit`}
                  className="block rounded border border-ink/10 p-3 transition hover:border-palm/30 hover:bg-paper"
                >
                  <p className="font-semibold text-ink">{document.title}</p>
                  <p className="mt-1 text-xs text-ink/55">
                    {documentTypeLabel(document.documentType)} · {document.year}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded border border-dashed border-ink/18 bg-paper p-4 text-sm text-ink/60">
                Không có tài liệu thiếu metadata trong nhóm đang đọc.
              </p>
            )}
          </div>
        </section>

        <section className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">Tài liệu mới cập nhật</h2>
            <Link href="/admin/documents/new" className="text-sm font-semibold text-palm hover:text-lacquer">
              Thêm tài liệu
            </Link>
          </div>
          <div className="space-y-3">
            {latestDocuments.map((document) => (
              <Link
                key={document.id}
                href={`/admin/documents/${document.id}/edit`}
                className="block rounded border border-ink/10 p-3 transition hover:border-palm/30 hover:bg-paper"
              >
                <p className="font-semibold text-ink">{document.title}</p>
                <p className="mt-1 text-xs text-ink/55">
                  {documentTypeLabel(document.documentType)} · {document.isPreviewOnly ? "Preview" : "Bản đầy đủ"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
