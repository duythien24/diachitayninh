import Image from "next/image";
import Link from "next/link";

import { AccountMenu } from "@/components/account-menu";
import { MobileNav } from "@/components/mobile-nav";
import { NavLinks } from "@/components/nav-links";
import { ReadingShelfLink } from "@/components/reading-shelf-link";
import { adminRoleLabel, getCurrentAdmin } from "@/lib/admin-users";

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
    <>
    <div className="bg-maroon text-xs text-[#f6e3b0]">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <span className="hidden truncate sm:block">Chào mừng bạn đến với kho địa chí số của Thư viện tỉnh Tây Ninh</span>
        <span className="flex items-center gap-4">
          <a href="tel:02723837050" className="hover:text-white">Hotline (0272) 3837050</a>
          <a href="https://thuvien.tayninh.gov.vn" target="_blank" rel="noreferrer" className="hidden hover:text-white sm:inline">thuvien.tayninh.gov.vn</a>
        </span>
      </div>
    </div>
    <header className="sticky top-0 z-40 border-b-2 border-brass/60 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <span className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-brass/70 bg-white">
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
            <span className="block font-serif whitespace-nowrap text-lg font-semibold uppercase tracking-wide text-palm">Địa chí số Tây Ninh</span>
            <span className="mt-1 block text-xs text-ink/55">Thư viện tỉnh Tây Ninh</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 xl:flex">
          <NavLinks />
          <span className="mx-2 h-5 w-px bg-ink/12" aria-hidden="true" />
          <ReadingShelfLink />
          <AccountMenu account={account} />
        </nav>
        <MobileNav account={account} />
      </div>
    </header>
    </>
  );
}
