import { DocumentList } from "@/components/document-list";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getDocuments } from "@/lib/repository";
import type { DocumentType } from "@/lib/types";

function documentTypeFromQuery(value?: string): DocumentType | "all" {
  if (value === "dia_chi" || value === "bao_tay_ninh" || value === "tai_lieu_cap_tinh") {
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

  if (filter === "tai_lieu_cap_tinh") {
    return {
      eyebrow: "Danh mục cấp tỉnh",
      title: "Tài liệu cấp tỉnh",
      description: "Kho tài liệu chung cấp tỉnh, không gắn riêng với một xã/phường cụ thể."
    };
  }

  return {
    eyebrow: "Kho tư liệu",
    title: "Tài liệu địa chí, báo chí và cấp tỉnh",
    description: "Tài liệu có thể gắn với xã/phường hoặc thuộc kho cấp tỉnh, tùy nội dung được chọn trong khu quản trị."
  };
}

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ loai?: string; q?: string }>;
}) {
  const params = await searchParams;
  const documents = await getDocuments();
  const initialFilter = documentTypeFromQuery(params.loai);
  const initialQuery = params.q?.trim() || "";
  const copy = pageCopy(initialFilter);

  return (
    <PageShell>
      <SectionHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      <DocumentList documents={documents} initialFilter={initialFilter} initialQuery={initialQuery} />
    </PageShell>
  );
}
