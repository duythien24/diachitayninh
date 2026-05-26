import Link from "next/link";
import Image from "next/image";
import { Building2, FileText, Home, ShieldCheck } from "lucide-react";

const nav = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/xa-phuong", label: "Xã/phường", icon: Building2 },
  { href: "/tai-lieu", label: "Tài liệu", icon: FileText },
  { href: "/admin", label: "Quản trị", icon: ShieldCheck }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold text-ink">
          <span className="relative h-11 w-11 overflow-hidden rounded border border-ink/10 bg-white">
            <Image
              src="/images/logo-thu-vien-tay-ninh.jpg"
              alt="Logo Thư viện tỉnh Tây Ninh"
              fill
              sizes="44px"
              className="object-contain p-0.5"
              priority
            />
          </span>
          <span className="leading-tight">
            Địa chí số
            <span className="block text-sm font-medium text-ink/60">Tây Ninh</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-white hover:text-ink"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
