import Link from "next/link";
import { Database, FilePlus2, FileText, Upload } from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";
import { getAdminDocuments, usingMockData } from "@/lib/repository";

export default async function AdminPage() {
  const documents = await getAdminDocuments();
  const isMock = usingMockData();

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Quản trị"
        title="Bảng điều khiển tài liệu"
        description="Bản MVP đang dùng dữ liệu mẫu. Khi nối Supabase, các form trong khu vực này sẽ ghi vào bảng documents và upload PDF preview lên Supabase Storage."
      />

      {isMock ? (
        <div className="mt-6 rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm leading-6 text-lacquer">
          Chưa cấu hình Supabase env, nên admin đang xem dữ liệu mẫu. Điền `.env.local` để bật lưu thật.
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { label: "Tài liệu hiện có", value: documents.length, icon: FileText },
          { label: "Storage", value: "Preview PDF", icon: Upload },
          { label: "Database", value: "Supabase", icon: Database }
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

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/documents"
          className="inline-flex items-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Quản lý tài liệu
        </Link>
        <Link
          href="/admin/documents/new"
          className="inline-flex items-center gap-2 rounded border border-ink/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
        >
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          Thêm tài liệu
        </Link>
      </div>
    </PageShell>
  );
}
