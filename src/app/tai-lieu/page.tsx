import { DocumentList } from "@/components/document-list";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getDocuments } from "@/lib/repository";
import type { DocumentType } from "@/lib/types";

function documentTypeFromQuery(value?: string): DocumentType | "all" {
  if (value === "dia_chi" || value === "bao_tay_ninh") {
    return value;
  }

  return "all";
}

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ loai?: string }>;
}) {
  const params = await searchParams;
  const documents = await getDocuments();
  const initialFilter = documentTypeFromQuery(params.loai);

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Kho tư liệu"
        title="Tài liệu địa chí và Báo Tây Ninh"
        description="Tài liệu có thể được mở đọc toàn văn hoặc chỉ công bố bản preview tùy theo chế độ được chọn trong khu quản trị."
      />

      <DocumentList documents={documents} initialFilter={initialFilter} />
    </PageShell>
  );
}
