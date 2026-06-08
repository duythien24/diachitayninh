import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Archive,
  BookOpen,
  Building2,
  FileSearch,
  Library,
  Mail,
  MapPinned,
  Ruler,
  ShieldCheck,
  UsersRound
} from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Giới thiệu dự án",
  description:
    "Giới thiệu mục tiêu, nguồn tài liệu, bản đồ trước và sau sáp nhập, chính sách khai thác tài liệu và thông tin liên hệ của Địa chí số Tây Ninh."
};

const goals = [
  {
    title: "Tập trung tư liệu địa phương",
    description:
      "Tổ chức tài liệu địa chí, báo chí địa phương và tài liệu cấp tỉnh trên một cổng tra cứu thống nhất, dễ mở rộng khi kho số hóa tăng lên.",
    icon: Archive
  },
  {
    title: "Tra cứu theo xã/phường",
    description:
      "Gắn một tài liệu với một hoặc nhiều đơn vị hành chính mới để người đọc tìm nhanh tư liệu liên quan đến từng địa phương.",
    icon: FileSearch
  },
  {
    title: "Đọc trực tuyến có kiểm soát",
    description:
      "Hỗ trợ đọc bản preview hoặc bản đầy đủ tùy trạng thái tài liệu, kèm hướng dẫn liên hệ thư viện khi cần khai thác bản toàn văn.",
    icon: ShieldCheck
  }
];

const provinceStats = [
  { label: "Diện tích", value: "8.536,44 km²", icon: Ruler },
  { label: "Dân số", value: "3.254.170 người", icon: UsersRound },
  { label: "Đơn vị cấp xã", value: "96", detail: "14 phường, 82 xã", icon: Building2 },
  { label: "Trung tâm hành chính", value: "Phường Tân Ninh", icon: MapPinned }
];

const mapCards = [
  {
    title: "Tây Ninh trước sáp nhập",
    description: "Không gian hành chính của tỉnh Tây Ninh cũ, trước khi hợp nhất với tỉnh Long An.",
    image: "/images/maps/tay-ninh-cu.jpg"
  },
  {
    title: "Long An trước sáp nhập",
    description: "Không gian hành chính của tỉnh Long An cũ, nay là một phần của tỉnh Tây Ninh mới.",
    image: "/images/maps/long-an-cu.jpg"
  },
  {
    title: "Tây Ninh sau sáp nhập",
    description: "Bản đồ tỉnh Tây Ninh mới sau khi hợp nhất Tây Ninh và Long An, gồm 96 xã/phường.",
    image: "/images/maps/tay-ninh-moi-2025.jpg",
    href: "https://tinhthanhvn.com/province/tay-ninh/danh-sach-don-vi-hanh-chinh"
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
        description="Cổng tra cứu phục vụ việc tiếp cận tài liệu địa chí, báo chí địa phương và tư liệu số hóa liên quan đến tỉnh Tây Ninh sau sáp nhập."
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

      <section className="mt-8 rounded border border-ink/10 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="flex items-center gap-3">
              <MapPinned className="h-6 w-6 text-gold" aria-hidden="true" />
              <h2 className="text-2xl font-semibold text-ink">Tây Ninh trước và sau sáp nhập</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-ink/70">
              <p>
                Theo TinhThanhVN, tỉnh Tây Ninh sau sáp nhập được hình thành từ tỉnh Tây Ninh và tỉnh Long An cũ.
                Tỉnh mới có mã đơn vị hành chính 80, thuộc vùng Nam Bộ và có trung tâm hành chính tại phường Tân Ninh.
              </p>
              <p>
                Phần bản đồ bên dưới giúp người đọc hình dung nhanh hai không gian hành chính cũ và tỉnh Tây Ninh mới,
                từ đó tra cứu tài liệu địa phương theo đúng tên xã/phường hiện hành.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {provinceStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded border border-ink/10 bg-paper p-4">
                    <Icon className="h-5 w-5 text-lacquer" aria-hidden="true" />
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink/55">{stat.label}</p>
                    <p className="mt-1 text-xl font-semibold text-ink">{stat.value}</p>
                    {stat.detail ? <p className="mt-1 text-sm text-ink/60">{stat.detail}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded border border-ink/10 bg-paper p-4">
            <a
              href="https://tinhthanhvn.com/province/tay-ninh/danh-sach-don-vi-hanh-chinh"
              target="_blank"
              rel="noreferrer"
              className="group block"
              aria-label="Mở bản đồ tỉnh Tây Ninh sau sáp nhập ở kích thước lớn"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded bg-white">
                <Image
                  src="/images/maps/tay-ninh-moi-2025.jpg"
                  alt="Bản đồ tỉnh Tây Ninh sau sáp nhập"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-contain p-3 transition duration-200 group-hover:scale-[1.02]"
                  priority
                />
              </div>
            </a>
            <p className="mt-3 text-xs leading-5 text-ink/55">
              Bấm vào bản đồ để mở danh sách 96 xã/phường và bản đồ hành chính chi tiết.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {mapCards.map((map) => (
            <article key={map.title} className="flex h-full flex-col overflow-hidden rounded border border-ink/10 bg-white">
              <a
                href={map.href || map.image}
                target="_blank"
                rel="noreferrer"
                className="group relative block aspect-[4/3] bg-paper"
                aria-label={`Mở ảnh lớn: ${map.title}`}
              >
              <Image
                src={map.image}
                alt={map.title}
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-contain p-3 transition duration-200 group-hover:scale-[1.03]"
              />
                <span className="absolute bottom-3 right-3 rounded bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  {map.href ? "Mở bản đồ" : "Xem ảnh lớn"}
                </span>
              </a>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-base font-semibold text-ink">{map.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-ink/68">{map.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/45">
                  {map.href ? "Mở bản đồ hành chính" : "Bấm vào ảnh để phóng lớn"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-lacquer" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-ink">Nguồn tài liệu và chính sách khai thác</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-ink/70">
            <p>
              Hệ thống chia tài liệu thành ba nhóm: địa chí xã/phường, Báo Tây Ninh và tài liệu cấp tỉnh. Mỗi tài liệu có
              thể có mô tả, năm xuất bản, tác giả, nhà xuất bản, số trang, từ khóa và một hoặc nhiều xã/phường liên quan.
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
