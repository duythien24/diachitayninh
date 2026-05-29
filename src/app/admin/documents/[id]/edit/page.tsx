import { notFound } from "next/navigation";

import { DocumentForm } from "@/components/document-form";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getAdminDocumentById, getAdminDocuments, getCommunes } from "@/lib/repository";

export async function generateStaticParams() {
  const documents = await getAdminDocuments();
  return documents.map((document) => ({ id: document.id }));
}

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [communes, document] = await Promise.all([getCommunes(), getAdminDocumentById(id)]);

  if (!document) {
    notFound();
  }

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Quản trị"
        title="Sửa tài liệu"
        description="Cập nhật thông tin mô tả, metadata, phạm vi xã/phường liên quan, file PDF và ảnh bìa của tài liệu."
      />
      <div className="mt-8">
        <DocumentForm communes={communes} document={document} />
      </div>
    </PageShell>
  );
}
