"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Activity, BarChart3, Building2, FileText, KeyRound, LogIn, LogOut, UserCircle } from "lucide-react";

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
        <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded border border-ink/10 bg-white shadow-soft" role="menu">
          <div className="border-b border-ink/10 px-4 py-3">
            <p className="text-sm font-semibold text-ink">{account.username}</p>
            <p className="mt-1 text-xs text-ink/55">{account.roleLabel}</p>
          </div>
          <Link
            href="/admin/statistics"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ink/72 transition hover:bg-paper hover:text-ink"
            role="menuitem"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Thống kê dữ liệu
          </Link>
          <Link
            href="/admin/audit"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ink/72 transition hover:bg-paper hover:text-ink"
            role="menuitem"
          >
            <Activity className="h-4 w-4" aria-hidden="true" />
            Lịch sử thao tác
          </Link>
          <Link
            href="/admin/documents"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ink/72 transition hover:bg-paper hover:text-ink"
            role="menuitem"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Quản lý tài liệu
          </Link>
          <Link
            href="/admin/communes"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ink/72 transition hover:bg-paper hover:text-ink"
            role="menuitem"
          >
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Quản trị xã/phường
          </Link>
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
