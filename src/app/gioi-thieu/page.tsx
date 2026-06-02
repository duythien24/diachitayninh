import type { Metadata } from "next";
import Link from "next/link";
import { Archive, BookOpen, FileSearch, Library, Mail, ShieldCheck } from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Giới thiệu dự án | Địa chí Tây Ninh",
  description:
    "Giới thiệu mục tiêu, nguồn tài liệu, chính sách bản đọc thử/toàn văn và thông tin liên hệ của dự án Địa chí số Tây Ninh."
};

const goals = [
  {
    title: "Tập trung tư liệu địa phương",
    description:
      "Tổ chức tài liệu địa chí, báo chí địa phương và tài liệu cấp tỉnh trên một cổng tra cứu thống nhất.",
    icon: Archive
  },
  {
    title: "Tra cứu theo xã/phường",
    description:
      "Gắn tài liệu với đơn vị hành chính mới để người đọc tìm nhanh tư liệu liên quan đến từng địa phương.",
    icon: FileSearch
  },
  {
    title: "Đọc trực tuyến có kiểm soát",
    description:
      "Hỗ trợ đọc bản preview hoặc bản đầy đủ tùy trạng thái tài liệu, không đưa bản nội bộ lên công khai khi chưa phù hợp.",
    icon: ShieldCheck
  }
];

const contactLinks = [
  { label: "Hotline: (0272) 3837050", href: "tel:02723837050" },
  { label: "Website: thuvien.tayninh.gov.vn", href: "https://thuvien.tayninh.gov.vn" },
  { label: "Facebook: Thư viện tỉnh Tây Ninh", href: "https://www.facebook.com/ThuvientinhTayNinh" }
];

export default function AboutProjectPage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Giới thiệu"
        title="Dự án Địa chí số Tây Ninh"
        description="Cổng tra cứu phục vụ việc tiếp cận tài liệu địa chí, báo chí địa phương và tư liệu số hóa liên quan đến tỉnh Tây Ninh."
      />

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {goals.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
              <Icon className="h-6 w-6 text-palm" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/68">{item.description}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-lacquer" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-ink">Nguồn tài liệu và chính sách khai thác</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-ink/70">
            <p>
              Hệ thống chia tài liệu thành ba nhóm: địa chí xã/phường, Báo Tây Ninh và tài liệu cấp tỉnh. Mỗi tài liệu
              có thể có mô tả, năm xuất bản, tác giả, nhà xuất bản, số trang, từ khóa và một hoặc nhiều xã/phường liên quan.
            </p>
            <p>
              Tài liệu được đánh dấu “Preview” chỉ công bố bản đọc thử. Người đọc cần bản đầy đủ sẽ liên hệ Thư viện tỉnh
              Tây Ninh để được phục vụ theo quy định lưu trữ, bản quyền và khai thác tài liệu.
            </p>
            <p>
              Tài liệu được đánh dấu “Bản đầy đủ” có thể đọc trực tuyến toàn văn. Tài liệu nội bộ hoặc chưa đủ điều kiện
              công bố không nên upload lên web; chỉ nên đưa lên bản rút gọn có watermark.
            </p>
            <p>
              Hệ thống hiện hỗ trợ tìm kiếm theo từ khóa, loại tài liệu, xã/phường, năm, tác giả và nhà xuất bản. Khi dữ
              liệu PDF tăng mạnh, bước nâng cấp tiếp theo là OCR nội dung PDF để tìm kiếm sâu trong nội dung sách/báo.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tai-lieu"
              className="inline-flex min-h-11 items-center rounded bg-palm px-4 py-2 text-sm font-semibold text-white transition hover:bg-palm/90"
            >
              Mở kho tài liệu
            </Link>
            <Link
              href="/xa-phuong"
              className="inline-flex min-h-11 items-center rounded border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
            >
              Tra cứu xã/phường
            </Link>
          </div>
        </div>

        <aside className="rounded border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Library className="h-6 w-6 text-gold" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-ink">Thư viện tỉnh Tây Ninh</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-6 text-ink/70">
            <div>
              <p className="font-semibold text-ink">Cơ sở 1</p>
              <p>33 Nguyễn Đình Chiểu, Phường Long An, tỉnh Tây Ninh.</p>
            </div>
            <div>
              <p className="font-semibold text-ink">Cơ sở 2</p>
              <p>83 Phạm Tung, Phường Tân Ninh, tỉnh Tây Ninh.</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {contactLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="flex min-h-11 items-center gap-2 rounded border border-ink/10 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
              >
                <Mail className="h-4 w-4 text-palm" aria-hidden="true" />
                {item.label}
              </a>
            ))}
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
