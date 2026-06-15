"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, CircleHelp, FileText, HardDrive, Info, KeyRound, LogIn, LogOut, Menu, ShieldCheck, X } from "lucide-react";

import type { AccountSession } from "@/components/account-menu";
import { ReadingShelfLink } from "@/components/reading-shelf-link";

const navLinks = [
  { href: "/gioi-thieu", label: "Giới thiệu", icon: Info },
  { href: "/xa-phuong", label: "Xã/phường", icon: Building2 },
  { href: "/tai-lieu", label: "Tài liệu", icon: FileText }
];

export function MobileNav({ account }: { account: AccountSession | null }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex h-11 w-11 items-center justify-center rounded border border-ink/10 bg-white text-ink"
        aria-label={isOpen ? "Đóng menu" : "Mở menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>

      {isOpen ? (
        <div className="absolute left-4 right-4 top-[4.5rem] z-50 overflow-hidden rounded border border-ink/10 bg-white shadow-soft">
          <nav className="divide-y divide-ink/8">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
                >
                  <Icon className="h-4 w-4 text-ink/55" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <ReadingShelfLink mobile onNavigate={() => setIsOpen(false)} />

            {account ? (
              <div className="bg-paper/60">
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-ink">{account.username}</p>
                  <p className="mt-1 text-xs text-ink/55">{account.roleLabel}</p>
                </div>
                <Link
                  href="/admin/documents"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                >
                  <ShieldCheck className="h-4 w-4 text-ink/55" aria-hidden="true" />
                  Quản lý tài liệu
                </Link>
                <Link
                  href="/admin/huong-dan"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                >
                  <CircleHelp className="h-4 w-4 text-ink/55" aria-hidden="true" />
                  Hướng dẫn quản trị
                </Link>
                <Link
                  href="/admin/files"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                >
                  <HardDrive className="h-4 w-4 text-ink/55" aria-hidden="true" />
                  Quản lý file Storage
                </Link>
                <Link
                  href="/admin/accounts"
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                >
                  <KeyRound className="h-4 w-4 text-ink/55" aria-hidden="true" />
                  Tài khoản và mật khẩu
                </Link>
                <form action="/admin/logout" method="post">
                  <button
                    type="submit"
                    className="flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-lacquer transition hover:bg-white"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Đăng xuất
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setIsOpen(false)}
                className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
              >
                <LogIn className="h-4 w-4 text-ink/55" aria-hidden="true" />
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
