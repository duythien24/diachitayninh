"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";

import { deleteAdminUserAction } from "@/app/admin/accounts/actions";

export function DeleteAdminUserButton({ userId, username }: { userId: string; username: string }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <form action={deleteAdminUserAction.bind(null, userId)} className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded bg-lacquer px-3 py-2 text-xs font-semibold text-white transition hover:bg-lacquer/90"
          aria-label={`Xác nhận xóa tài khoản ${username}`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Xóa
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded border border-ink/12 text-ink transition hover:bg-paper"
          aria-label="Hủy xóa tài khoản"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className="inline-flex items-center gap-2 rounded border border-lacquer/20 px-3 py-2 text-sm font-semibold text-lacquer transition hover:bg-lacquer/8"
      aria-label={`Xóa tài khoản ${username}`}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
      Xóa
    </button>
  );
}
