import Link from "next/link";
import { FileSearch } from "lucide-react";

import type { FullTextHit } from "@/lib/fulltext";
import type { Document } from "@/lib/types";

function Highlighted({ text, ranges }: { text: string; ranges: Array<[number, number]> }) {
  const parts: React.ReactNode[] = [];
  let at = 0;
  ranges.forEach(([start, end], index) => {
    if (start < at) return;
    if (start > at) parts.push(text.slice(at, start));
    parts.push(
      <mark key={index} className="rounded-sm bg-brass/35 px-0.5 text-ink">
        {text.slice(start, end)}
      </mark>
    );
    at = end;
  });
  parts.push(text.slice(at));
  return <>{parts}</>;
}

// Pages inside scanned documents whose text matches the search, each linking to that page in the reader.
export function FullTextResults({ query, hits, documents }: { query: string; hits: FullTextHit[]; documents: Document[] }) {
  const bySlug = new Map(documents.map((document) => [document.slug, document]));
  const shown = hits.filter((hit) => bySlug.has(hit.slug));

  return (
    <section className="mt-10 rounded border border-ink/10 bg-white p-5 shadow-soft sm:p-6" aria-labelledby="fulltext-heading">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-palm/10 text-palm">
          <FileSearch className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="fulltext-heading" className="text-xl font-semibold text-ink">
            Tìm thấy trong nội dung sách
          </h2>
          <p className="text-sm text-ink/60">
            {shown.length
              ? `“${query}” xuất hiện trong ${shown.length} tài liệu. Bấm vào trang để mở đúng trang đó.`
              : `Chưa thấy “${query}” trong nội dung các tài liệu đã nhận dạng chữ.`}
          </p>
        </div>
      </div>

      {shown.length ? (
        <ul className="mt-5 divide-y divide-ink/10">
          {shown.map((hit) => {
            const document = bySlug.get(hit.slug)!;
            return (
              <li key={hit.slug} className="py-4">
                <Link href={`/tai-lieu/${document.slug}`} className="font-semibold text-ink transition hover:text-palm">
                  {document.title}
                </Link>
                <p className="mt-0.5 text-xs text-ink/50">
                  {document.year ? `${document.year} · ` : ""}
                  {hit.pages.length} trang có kết quả
                </p>
                <ul className="mt-3 grid gap-2">
                  {hit.pages.slice(0, 3).map((page) => (
                    <li key={page.page}>
                      <Link
                        href={`/doc/${document.slug}?trang=${page.page}`}
                        className="block rounded border border-ink/8 bg-paper/60 px-3 py-2 text-sm leading-6 text-ink/75 transition hover:border-palm/30 hover:bg-paper"
                      >
                        <span className="mr-2 inline-block rounded bg-palm px-1.5 py-0.5 text-xs font-semibold text-white">Trang {page.page}</span>
                        <Highlighted text={page.snippet} ranges={page.highlights} />
                      </Link>
                    </li>
                  ))}
                </ul>
                {hit.pages.length > 3 ? (
                  <p className="mt-2 text-xs text-ink/55">
                    Còn ở các trang {hit.pages.slice(3, 15).map((page) => page.page).join(", ")}
                    {hit.pages.length > 15 ? "…" : ""}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className="mt-4 text-xs text-ink/45">
        Chữ trong bản quét được nhận dạng tự động nên có thể còn sai sót. Tài liệu mở bằng trình đọc của Thư viện tỉnh chưa được tìm trong nội dung.
      </p>
    </section>
  );
}
