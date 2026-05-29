import { DocumentForm } from "@/components/document-form";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getCommunes } from "@/lib/repository";

export default async function NewDocumentPage() {
  const communes = await getCommunes();

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Quản trị"
        title="Thêm tài liệu"
        description="Nhập thông tin mô tả, chọn đúng loại tài liệu và tải lên PDF/ảnh bìa để hệ thống tự đưa vào danh sách quản trị phù hợp."
      />
      <div className="mt-8">
        <DocumentForm communes={communes} />
      </div>
    </PageShell>
  );
}
