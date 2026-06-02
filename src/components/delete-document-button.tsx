"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";

import { deleteDocumentAction } from "@/app/admin/documents/actions";
import type { DocumentType } from "@/lib/types";

export function DeleteDocumentButton({
  documentId,
  documentTitle,
  documentGroup,
  disabled
}: {
  documentId: string;
  documentTitle: string;
  documentGroup: DocumentType;
  disabled?: boolean;
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <form action={deleteDocumentAction.bind(null, documentId)} className="flex items-center gap-2">
        <input type="hidden" name="document_group" value={documentGroup} />
        <button
          type="submit"
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded bg-lacquer px-3 py-2 text-xs font-semibold text-white transition hover:bg-lacquer/90 disabled:opacity-45"
          disabled={disabled}
          aria-label={`Xác nhận xóa ${documentTitle}`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Xóa
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded border border-ink/12 text-ink transition hover:bg-paper"
          aria-label="Hủy xóa"
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
      className="inline-flex h-9 w-9 items-center justify-center rounded border border-lacquer/20 text-lacquer transition hover:bg-lacquer/8 disabled:opacity-45"
      aria-label={`Xóa ${documentTitle}`}
      disabled={disabled}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
