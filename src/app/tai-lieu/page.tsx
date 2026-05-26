import { DocumentList } from "@/components/document-list";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getDocuments } from "@/lib/repository";

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Kho tư liệu"
        title="Tài liệu địa chí và Báo Tây Ninh"
        description="Mỗi tài liệu public chỉ nên là bản preview 10 trang có watermark. Bản full giữ nội bộ và phục vụ qua kênh liên hệ thư viện."
      />

      <DocumentList documents={documents} />
    </PageShell>
  );
}
