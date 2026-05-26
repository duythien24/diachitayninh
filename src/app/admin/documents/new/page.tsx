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
        description="Form mẫu cho dữ liệu documents. Bước tiếp theo sẽ thêm server action để upload PDF preview và ghi database."
      />
      <div className="mt-8">
        <DocumentForm communes={communes} />
      </div>
    </PageShell>
  );
}
