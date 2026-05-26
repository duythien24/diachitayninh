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
        description="Mỗi tài liệu public chỉ nên là bản preview 10 trang có watermark. Bản full giữ nội bộ và phục vụ qua kênh liên hệ thư viện."
      />

      <DocumentList documents={documents} initialFilter={initialFilter} />
    </PageShell>
  );
}
