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

function pageCopy(filter: DocumentType | "all") {
  if (filter === "dia_chi") {
    return {
      eyebrow: "Danh mục địa chí",
      title: "Địa chí Tây Ninh",
      description: "Danh sách tài liệu địa chí đã số hóa theo xã, phường và địa danh tại Tây Ninh."
    };
  }

  if (filter === "bao_tay_ninh") {
    return {
      eyebrow: "Danh mục báo chí",
      title: "Báo Tây Ninh",
      description: "Danh sách số báo, chuyên đề và tuyển chọn bài viết địa phương đã được số hóa."
    };
  }

  return {
    eyebrow: "Kho tư liệu",
    title: "Tài liệu địa chí và Báo Tây Ninh",
    description: "Tài liệu có thể được mở đọc toàn văn hoặc chỉ công bố bản preview tùy theo chế độ được chọn trong khu quản trị."
  };
}

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ loai?: string }>;
}) {
  const params = await searchParams;
  const documents = await getDocuments();
  const initialFilter = documentTypeFromQuery(params.loai);
  const copy = pageCopy(initialFilter);

  return (
    <PageShell>
      <SectionHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      <DocumentList documents={documents} initialFilter={initialFilter} />
    </PageShell>
  );
}
