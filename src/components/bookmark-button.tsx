"use client";

import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";

import { getSavedDocumentIds, readingShelfEvent, toggleSavedDocument } from "@/lib/reading-shelf";
import { cn } from "@/lib/utils";

export function BookmarkButton({ documentId, showLabel = false, className }: { documentId: string; showLabel?: boolean; className?: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(getSavedDocumentIds().includes(documentId));
    sync();
    window.addEventListener(readingShelfEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(readingShelfEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, [documentId]);

  return (
    <button
      type="button"
      onClick={() => setSaved(toggleSavedDocument(documentId))}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded border px-3 py-2 text-sm font-semibold transition",
        saved ? "border-brass/40 bg-brass/15 text-lacquer" : "border-ink/12 bg-white text-ink hover:bg-paper",
        className
      )}
      aria-label={saved ? "Bỏ khỏi tủ sách" : "Lưu vào tủ sách"}
      title={saved ? "Bỏ khỏi tủ sách" : "Lưu vào tủ sách"}
      aria-pressed={saved}
    >
      <Bookmark className={cn("h-4 w-4 shrink-0", saved && "fill-current")} aria-hidden="true" />
      {showLabel ? (saved ? "Đã lưu" : "Lưu đọc sau") : null}
    </button>
  );
}
