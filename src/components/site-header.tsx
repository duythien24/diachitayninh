import Image from "next/image";
import Link from "next/link";

import { AccountMenu } from "@/components/account-menu";
import { MobileNav } from "@/components/mobile-nav";
import { ReadingShelfLink } from "@/components/reading-shelf-link";
import { adminRoleLabel, getCurrentAdmin } from "@/lib/admin-users";

const nav = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/bo-suu-tap", label: "Bộ sưu tập" },
  { href: "/dong-thoi-gian", label: "Dòng thời gian" },
  { href: "/xa-phuong", label: "Xã/phường" },
  { href: "/tai-lieu", label: "Tài liệu" }
];

export async function SiteHeader() {
  const currentAdmin = await getCurrentAdmin();
  const account = currentAdmin
    ? {
        username: currentAdmin.username,
        role: currentAdmin.role,
        roleLabel: adminRoleLabel(currentAdmin.role)
      }
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <span className="relative h-10 w-10 overflow-hidden rounded-full border border-ink/10 bg-white">
            <Image
              src="/images/logo-thu-vien-tay-ninh.jpg"
              alt="Logo Thư viện tỉnh Tây Ninh"
              fill
              sizes="40px"
              className="object-contain p-0.5"
              priority
            />
          </span>
          <span className="leading-none">
            <span className="block font-serif text-lg font-semibold">Địa chí số Tây Ninh</span>
            <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink/50">Thư viện tỉnh Tây Ninh</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-sand/70 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <span className="mx-2 h-5 w-px bg-ink/12" aria-hidden="true" />
          <ReadingShelfLink />
          <AccountMenu account={account} />
        </nav>
        <MobileNav account={account} />
      </div>
    </header>
  );
}
