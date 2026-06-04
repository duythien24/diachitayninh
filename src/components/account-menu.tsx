"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Activity, BarChart3, Building2, CircleHelp, FileText, KeyRound, LogIn, LogOut, ServerCog, UserCircle } from "lucide-react";

import type { AdminRole } from "@/lib/admin-users";

export type AccountSession = {
  username: string;
  role: AdminRole;
  roleLabel: string;
};

export function AccountMenu({ account }: { account: AccountSession | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!account) {
    return (
      <Link
        href="/admin/login"
        className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-white hover:text-ink"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Đăng nhập
      </Link>
    );
  }

  const links = [
    { href: "/admin/statistics", label: "Thống kê dữ liệu", icon: BarChart3 },
    { href: "/admin/system", label: "Kiểm tra hệ thống", icon: ServerCog },
    { href: "/admin/huong-dan", label: "Hướng dẫn quản trị", icon: CircleHelp },
    { href: "/admin/audit", label: "Lịch sử thao tác", icon: Activity },
    { href: "/admin/documents", label: "Quản lý tài liệu", icon: FileText },
    { href: "/admin/communes", label: "Quản trị xã/phường", icon: Building2 }
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-white hover:text-ink"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <UserCircle className="h-4 w-4" aria-hidden="true" />
        Tài khoản
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded border border-ink/10 bg-white shadow-soft" role="menu">
          <div className="border-b border-ink/10 px-4 py-3">
            <p className="text-sm font-semibold text-ink">{account.username}</p>
            <p className="mt-1 text-xs text-ink/55">{account.roleLabel}</p>
          </div>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ink/72 transition hover:bg-paper hover:text-ink"
                role="menuitem"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          {account.role === "super_admin" ? (
            <Link
              href="/admin/accounts"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ink/72 transition hover:bg-paper hover:text-ink"
              role="menuitem"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Tài khoản và mật khẩu
            </Link>
          ) : null}
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-lacquer transition hover:bg-lacquer/8"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Đăng xuất
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
