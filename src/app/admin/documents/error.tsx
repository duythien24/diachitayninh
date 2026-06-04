"use client";

import Link from "next/link";
import { AlertTriangle, FilePlus2, RotateCcw, ServerCog } from "lucide-react";

export default function AdminDocumentsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded border border-lacquer/20 bg-white p-6 shadow-soft">
        <AlertTriangle className="h-8 w-8 text-lacquer" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold text-ink">Không thể lưu tài liệu</h1>
        <p className="mt-3 text-sm leading-6 text-ink/68">
          {error.message || "Có lỗi khi upload file hoặc ghi dữ liệu vào Supabase."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Thử lại
          </button>
          <Link
            href="/admin/documents/new"
            className="inline-flex min-h-11 items-center gap-2 rounded border border-ink/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
          >
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            Thêm lại tài liệu
          </Link>
          <Link
            href="/admin/system"
            className="inline-flex min-h-11 items-center gap-2 rounded border border-ink/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
          >
            <ServerCog className="h-4 w-4" aria-hidden="true" />
            Kiểm tra hệ thống
          </Link>
        </div>
      </div>
    </main>
  );
}
