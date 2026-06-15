"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";

import { getSavedDocumentIds, readingShelfEvent } from "@/lib/reading-shelf";

export function ReadingShelfLink({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getSavedDocumentIds().length);
    sync();
    window.addEventListener(readingShelfEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(readingShelfEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link
      href="/tu-sach"
      onClick={onNavigate}
      className={mobile
        ? "flex min-h-12 items-center gap-3 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
        : "inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-white hover:text-ink"}
    >
      <Bookmark className={mobile ? "h-4 w-4 text-ink/55" : "h-4 w-4"} aria-hidden="true" />
      Tủ sách
      {count ? <span className="rounded-full bg-brass/20 px-2 py-0.5 text-xs font-semibold text-lacquer">{count}</span> : null}
    </Link>
  );
}
