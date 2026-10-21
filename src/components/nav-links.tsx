"use client";

// Main menu links that stand out on the section the reader is in (document detail and reader pages
// count as "Tài liệu").
import Link from "next/link";
import { usePathname } from "next/navigation";

export const mainNav = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/bo-suu-tap", label: "Bộ sưu tập" },
  { href: "/dong-thoi-gian", label: "Dòng thời gian" },
  { href: "/xa-phuong", label: "Xã/phường" },
  { href: "/tai-lieu", label: "Tài liệu" }
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/tai-lieu" && pathname.startsWith("/doc/")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname() || "/";
  return (
    <>
      {mainNav.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded px-3 py-2 text-sm font-semibold transition ${
              active
                ? "bg-palm text-white shadow-sm after:absolute after:inset-x-3 after:-bottom-[11px] after:h-[3px] after:rounded-full after:bg-brass"
                : "text-ink/75 hover:bg-sand/70 hover:text-palm"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
