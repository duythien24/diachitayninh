import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const explore = [
  { href: "/tai-lieu?loai=dia_chi", label: "Địa chí Tây Ninh" },
  { href: "/tai-lieu?loai=bao_tay_ninh", label: "Báo Tây Ninh" },
  { href: "/tai-lieu?loai=tai_lieu_cap_tinh", label: "Tài liệu cấp tỉnh" },
  { href: "/xa-phuong", label: "96 xã/phường" },
  { href: "/dong-thoi-gian", label: "Dòng thời gian" },
  { href: "/bo-suu-tap", label: "Bộ sưu tập" }
];

const headingClass = "text-xs font-semibold uppercase tracking-[0.14em] text-brass";
const linkClass = "inline-flex items-center gap-1.5 text-white/75 transition hover:text-white";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-serif text-2xl font-semibold">Địa chí số Tây Ninh</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
            Kho đọc trực tuyến tài liệu địa chí, Báo Tây Ninh và tư liệu địa phương do Thư viện tỉnh Tây Ninh số hóa.
          </p>
        </div>

        <div>
          <p className={headingClass}>Khám phá</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={headingClass}>Địa chỉ</p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-white/75">
            <p>
              <span className="block font-semibold text-white">Cơ sở 1</span>
              33 Nguyễn Đình Chiểu, Phường Long An, tỉnh Tây Ninh
            </p>
            <p>
              <span className="block font-semibold text-white">Cơ sở 2</span>
              83 Phạm Tung, Phường Tân Ninh, tỉnh Tây Ninh
            </p>
          </div>
        </div>

        <div>
          <p className={headingClass}>Liên hệ</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href="tel:02723837050" className={linkClass}>
                Hotline (0272) 3837050
              </a>
            </li>
            <li>
              <a href="https://thuvien.tayninh.gov.vn" target="_blank" rel="noreferrer" className={linkClass}>
                thuvien.tayninh.gov.vn
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/ThuvientinhTayNinh" target="_blank" rel="noreferrer" className={linkClass}>
                Facebook Thư viện tỉnh
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/45 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span>© Thư viện tỉnh Tây Ninh</span>
          <Link href="/admin" className="transition hover:text-white">
            Quản trị
          </Link>
        </div>
      </div>
    </footer>
  );
}
