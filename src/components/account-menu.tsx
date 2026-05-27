"use client";

import Link from "next/link";
import { FileText, LogIn, LogOut, UserCircle } from "lucide-react";

export type AccountSession = {
  username: string;
  roleLabel: string;
};

export function AccountMenu({ account }: { account: AccountSession | null }) {
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
    <details className="group relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-white hover:text-ink [&::-webkit-details-marker]:hidden">
        <UserCircle className="h-4 w-4" aria-hidden="true" />
        Tài khoản
      </summary>

      <div className="absolute right-0 top-full mt-2 hidden w-64 overflow-hidden rounded border border-ink/10 bg-white shadow-soft group-open:block">
        <div className="border-b border-ink/10 px-4 py-3">
          <p className="text-sm font-semibold text-ink">{account.username}</p>
          <p className="mt-1 text-xs text-ink/55">{account.roleLabel}</p>
        </div>
        <Link
          href="/admin/documents"
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ink/72 transition hover:bg-paper hover:text-ink"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Quản lý tài liệu
        </Link>
        <form action="/admin/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-lacquer transition hover:bg-lacquer/8"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Đăng xuất
          </button>
        </form>
      </div>
    </details>
  );
}
