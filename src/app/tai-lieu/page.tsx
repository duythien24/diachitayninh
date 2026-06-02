import { DocumentList } from "@/components/document-list";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getCommunes, getDocumentFilterOptions, searchDocuments } from "@/lib/repository";
import type { DocumentType } from "@/lib/types";

const pageSize = 24;

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
  searchParams: Promise<{ loai?: string; q?: string; xa?: string; nam?: string; tac_gia?: string; nxb?: string; page?: string }>;
}) {
  const params = await searchParams;
  const initialFilter = documentTypeFromQuery(params.loai);
  const initialQuery = params.q?.trim() || "";
  const selectedCommuneId = params.xa?.trim() || "";
  const selectedYear = params.nam ? Number(params.nam) : undefined;
  const selectedAuthor = params.tac_gia?.trim() || "";
  const selectedPublisher = params.nxb?.trim() || "";
  const currentPage = Math.max(1, Number(params.page) || 1);
  const limit = currentPage * pageSize;
  const [{ documents, hasMore }, communes, filterOptions] = await Promise.all([
    searchDocuments({
      query: initialQuery,
      documentType: initialFilter,
      communeId: selectedCommuneId || undefined,
      year: Number.isFinite(selectedYear) ? selectedYear : undefined,
      author: selectedAuthor,
      publisher: selectedPublisher,
      limit
    }),
    getCommunes(),
    getDocumentFilterOptions()
  ]);
  const copy = pageCopy(initialFilter);

  return (
    <PageShell>
      <SectionHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <DocumentList
        documents={documents}
        communes={communes}
        filterOptions={filterOptions}
        hasMore={hasMore}
        currentPage={currentPage}
        initialFilter={initialFilter}
        initialQuery={initialQuery}
        initialCommuneId={selectedCommuneId}
        initialYear={Number.isFinite(selectedYear) ? String(selectedYear) : ""}
        initialAuthor={selectedAuthor}
        initialPublisher={selectedPublisher}
      />
    </PageShell>
  );
}
