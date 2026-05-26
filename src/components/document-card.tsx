import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Library } from "lucide-react";

import { getCommuneById } from "@/lib/data";
import type { Document } from "@/lib/types";
import { documentTypeLabel, typePrefix } from "@/lib/utils";

export function DocumentCard({ document }: { document: Document }) {
  const commune = document.commune || getCommuneById(document.communeId);
  const readLabel = document.isPreviewOnly ? "Đọc thử" : "Đọc đầy đủ";
  const statusLabel = document.isPreviewOnly ? "Preview" : "Bản đầy đủ";

  return (
    <article className="overflow-hidden rounded border border-ink/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="relative aspect-[5/3] overflow-hidden bg-ink/5">
        <Image
          src={document.coverImageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
        <div className="absolute left-3 top-3 rounded bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink">
          {documentTypeLabel(document.documentType)}
        </div>
        <div className="absolute right-3 top-3 rounded bg-palm px-2.5 py-1 text-xs font-semibold text-white">
          {statusLabel}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-sm text-ink/55">{document.year}</p>
          <h2 className="mt-1 text-lg font-semibold leading-snug text-ink">{document.title}</h2>
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-ink/68">{document.description}</p>
        {commune ? (
          <p className="inline-flex items-center gap-2 rounded bg-paper px-2.5 py-1 text-xs font-medium text-ink/70">
            <Library className="h-3.5 w-3.5" aria-hidden="true" />
            {typePrefix(commune.type)} {commune.name}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href={`/doc/${document.slug}`}
            className="inline-flex items-center gap-2 rounded bg-palm px-3 py-2 text-sm font-semibold text-white transition hover:bg-palm/90"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            {readLabel}
          </Link>
          <Link
            href={`/tai-lieu/${document.slug}`}
            className="inline-flex items-center gap-2 rounded border border-ink/12 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
          >
            Chi tiết
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
