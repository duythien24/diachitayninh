"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">Chưa tải được kho tư liệu</h1>
      <p className="mt-4 leading-7 text-ink/68">
        Máy chủ dữ liệu đang phản hồi chậm hoặc tạm gián đoạn. Bạn thử tải lại trang sau ít giây. Nếu lỗi kéo dài, hãy báo cho Thư viện tỉnh
        Tây Ninh qua số (0272) 3837050.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-palm px-5 text-sm font-semibold text-white transition hover:bg-palm/90"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Tải lại
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink transition hover:bg-sand/60"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
