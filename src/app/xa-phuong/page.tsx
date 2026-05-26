import { CommuneList } from "@/components/commune-list";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getCommunes } from "@/lib/repository";

export default async function CommunesPage() {
  const communes = await getCommunes();

  return (
    <PageShell>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Danh mục địa danh"
          title="96 xã, phường Tây Ninh"
          description="Danh sách đơn vị hành chính cấp xã sau sắp xếp năm 2025, dùng làm trục chính để gắn tài liệu địa chí và tư liệu báo chí."
        />
      </div>

      <CommuneList communes={communes} />
    </PageShell>
  );
}
