import Link from "next/link";
import { ArrowRight, Eye, Files, Library } from "lucide-react";

import { DocumentCoverImage } from "@/components/document-cover-image";
import { getCommuneById } from "@/lib/data";
import type { Document } from "@/lib/types";
import { documentTypeShortLabel, typePrefix } from "@/lib/utils";

export function DocumentCard({ document }: { document: Document }) {
  const commune = document.commune || getCommuneById(document.communeId);
  const attachedCommunes = document.communes?.length ? document.communes : commune ? [commune] : [];
  const communeLabel =
    attachedCommunes.length > 1
      ? `${attachedCommunes.length} xã/phường`
      : commune
        ? `${typePrefix(commune.type)} ${commune.name}`
        : "Cấp tỉnh";
  const readLabel = document.isPreviewOnly ? "Đọc thử" : "Đọc đầy đủ";
  const statusLabel = document.isPreviewOnly ? "Preview" : "Bản đầy đủ";

  return (
    <article className="flex h-full min-h-[520px] flex-col overflow-hidden rounded border border-ink/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-palm/25 hover:shadow-soft">
      <div className="relative aspect-[5/3] overflow-hidden bg-ink/5">
        <DocumentCoverImage src={document.coverImageUrl} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        <div className="absolute left-3 top-3 max-w-[68%] truncate rounded bg-white/94 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">
          {documentTypeShortLabel(document.documentType)}
        </div>
        <div className="absolute right-3 top-3 rounded bg-palm px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
          {statusLabel}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-ink/55">{document.year}</p>
        <h2 className="mt-1 line-clamp-2 min-h-[3.05rem] text-lg font-semibold leading-snug text-ink">{document.title}</h2>
        <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-ink/68">{document.description}</p>

        <div className="mt-4 min-h-7">
          {attachedCommunes.length ? (
            <p className="inline-flex max-w-full items-center gap-2 rounded bg-paper px-2.5 py-1 text-xs font-medium text-ink/70">
              <Library className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{communeLabel}</span>
            </p>
          ) : (
            <p className="inline-flex max-w-full items-center gap-2 rounded bg-paper px-2.5 py-1 text-xs font-medium text-ink/70">
              <Files className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Cấp tỉnh</span>
            </p>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link
            href={`/doc/${document.slug}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded bg-palm px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-palm/90"
          >
            <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
            {readLabel}
          </Link>
          <Link
            href={`/tai-lieu/${document.slug}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded border border-ink/12 px-3 py-2 text-center text-sm font-semibold text-ink transition hover:bg-paper"
          >
            Chi tiết
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
