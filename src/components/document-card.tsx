import Link from "next/link";
import { BookOpen } from "lucide-react";

import { DocumentCoverImage } from "@/components/document-cover-image";
import { BookmarkButton } from "@/components/bookmark-button";
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
  const readLabel = document.isPreviewOnly ? "Đọc thử" : "Đọc toàn văn";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-ink/10 bg-white transition hover:border-ink/20 hover:shadow-soft">
      <Link
        href={`/tai-lieu/${document.slug}`}
        className="bg-pattern relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-sand"
        tabIndex={-1}
        aria-hidden="true"
      >
        <span className="relative aspect-[2/3] h-[82%] overflow-hidden rounded-sm bg-white shadow-book transition duration-500 group-hover:-translate-y-1.5 group-hover:-rotate-2">
          <DocumentCoverImage src={document.coverImageUrl} alt="" fill sizes="200px" className="object-cover" />
          <span className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/25 to-transparent" />
        </span>
        {document.isPreviewOnly ? (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            Bản đọc thử
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="truncate text-xs font-semibold text-lacquer">
          {documentTypeShortLabel(document.documentType)}
          {document.year ? <span className="font-normal text-ink/50">, năm {document.year}</span> : null}
        </p>
        <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-ink">
          <Link href={`/tai-lieu/${document.slug}`} className="transition hover:text-palm">
            {document.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/62">{document.description}</p>
        <p className="mb-5 mt-3 truncate text-xs font-medium text-ink/50">{attachedCommunes.length ? communeLabel : "Cấp tỉnh"}</p>

        <div className="mt-auto flex items-center gap-2 border-t border-ink/8 pt-4">
          <Link
            href={`/doc/${document.slug}`}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded bg-palm px-3 py-2 text-sm font-semibold text-white transition hover:bg-palm/90"
          >
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            {readLabel}
          </Link>
          <Link
            href={`/tai-lieu/${document.slug}`}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-paper hover:text-ink"
          >
            Chi tiết
          </Link>
          <BookmarkButton documentId={document.id} className="h-10 w-10 px-0" />
        </div>
      </div>
    </article>
  );
}
