import type { Metadata } from "next";

import { PageShell, SectionHeader } from "@/components/page-shell";
import { ReadingShelfView } from "@/components/reading-shelf-view";
import { getDocuments } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Tủ sách của tôi",
  description: "Danh sách tài liệu đã lưu và vừa xem trên Địa chí số Tây Ninh.",
  robots: { index: false, follow: false }
};

export default async function ReadingShelfPage() {
  const documents = await getDocuments();

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Không gian đọc cá nhân"
        title="Tủ sách của tôi"
        description="Lưu tài liệu để đọc sau và quay lại những nội dung vừa xem. Dữ liệu chỉ được giữ trên trình duyệt của thiết bị này."
      />
      <ReadingShelfView documents={documents} />
    </PageShell>
  );
}
