import { CommuneList } from "@/components/commune-list";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getCommunes, getDocuments } from "@/lib/repository";

export default async function CommunesPage() {
  const [communes, documents] = await Promise.all([getCommunes(), getDocuments()]);
  const documentCounts = documents.reduce<Record<string, number>>((counts, document) => {
    const communeIds = document.communeIds?.length ? document.communeIds : document.communeId ? [document.communeId] : [];

    for (const communeId of communeIds) {
      counts[communeId] = (counts[communeId] || 0) + 1;
    }

    return counts;
  }, {});
  const sortedCommunes = communes
    .map((commune) => ({
      ...commune,
      documentCount: documentCounts[commune.id] || 0
    }))
    .sort((left, right) => {
      const countDelta = (right.documentCount || 0) - (left.documentCount || 0);
      if (countDelta !== 0) return countDelta;
      return left.name.localeCompare(right.name, "vi");
    });

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Danh mục địa danh"
        title="96 xã, phường Tây Ninh"
        description="Danh sách đơn vị hành chính cấp xã sau sắp xếp năm 2025, dùng làm trục chính để gắn tài liệu địa chí và tư liệu báo chí."
      />
      <CommuneList communes={sortedCommunes} />
    </PageShell>
  );
}
