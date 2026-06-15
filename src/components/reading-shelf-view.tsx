"use client";

import { Bookmark, Clock3, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DocumentCard } from "@/components/document-card";
import { clearRecentDocuments, getRecentDocumentIds, getSavedDocumentIds, readingShelfEvent } from "@/lib/reading-shelf";
import type { Document } from "@/lib/types";
import { cn } from "@/lib/utils";

type ShelfTab = "saved" | "recent";

export function ReadingShelfView({ documents }: { documents: Document[] }) {
  const [tab, setTab] = useState<ShelfTab>("saved");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setSavedIds(getSavedDocumentIds());
      setRecentIds(getRecentDocumentIds());
    };
    sync();
    window.addEventListener(readingShelfEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(readingShelfEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const documentMap = useMemo(() => new Map(documents.map((document) => [document.id, document])), [documents]);
  const visibleIds = tab === "saved" ? savedIds : recentIds;
  const visibleDocuments = visibleIds.map((id) => documentMap.get(id)).filter((document): document is Document => Boolean(document));

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 rounded border border-ink/10 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Nội dung tủ sách">
          {[
            { id: "saved" as const, label: "Đã lưu", count: savedIds.length, icon: Bookmark },
            { id: "recent" as const, label: "Vừa xem", count: recentIds.length, icon: Clock3 }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-2 rounded px-4 text-sm font-semibold transition",
                  tab === item.id ? "bg-palm text-white" : "bg-paper text-ink hover:bg-ink/8"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
                <span className={cn("rounded-full px-2 py-0.5 text-xs", tab === item.id ? "bg-white/15" : "bg-white")}>{item.count}</span>
              </button>
            );
          })}
        </div>

        {tab === "recent" && recentIds.length ? (
          <button
            type="button"
            onClick={clearRecentDocuments}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-lacquer/20 px-3 text-sm font-semibold text-lacquer transition hover:bg-lacquer/8"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Xóa lịch sử
          </button>
        ) : null}
      </div>

      {visibleDocuments.length ? (
        <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleDocuments.map((document) => <DocumentCard key={document.id} document={document} />)}
        </div>
      ) : (
        <div className="mt-6 rounded border border-dashed border-ink/18 bg-white px-6 py-12 text-center">
          {tab === "saved" ? <Bookmark className="mx-auto h-8 w-8 text-brass" aria-hidden="true" /> : <Clock3 className="mx-auto h-8 w-8 text-palm" aria-hidden="true" />}
          <h2 className="mt-4 text-xl font-semibold text-ink">{tab === "saved" ? "Chưa lưu tài liệu nào" : "Chưa có lịch sử xem"}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/62">
            {tab === "saved"
              ? "Bấm biểu tượng đánh dấu trên thẻ hoặc trang chi tiết để tạo danh sách đọc riêng trên thiết bị này."
              : "Các tài liệu bạn mở xem sẽ tự xuất hiện tại đây để có thể quay lại nhanh."}
          </p>
        </div>
      )}
    </section>
  );
}
