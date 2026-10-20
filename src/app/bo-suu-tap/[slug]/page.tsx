import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocumentCard } from "@/components/document-card";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { collectionTypeSummary, documentCollections, documentsForCollection, getCollectionBySlug } from "@/lib/document-collections";
import { getDocuments } from "@/lib/repository";

const pageSize = 24;

export function generateStaticParams() {
  return documentCollections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  return collection
    ? { title: collection.title, description: collection.description, alternates: { canonical: `/bo-suu-tap/${collection.slug}` } }
    : { title: "Không tìm thấy bộ sưu tập" };
}

export default async function CollectionPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ trang?: string }>;
}) {
  const [{ slug }, { trang }] = await Promise.all([params, searchParams]);
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const documents = documentsForCollection(collection, await getDocuments());
  const shown = Math.max(1, Number(trang) || 1) * pageSize;
  const summary = collectionTypeSummary(documents);
  const others = documentCollections.filter((item) => item.slug !== collection.slug);

  return (
    <PageShell>
      <Link href="/bo-suu-tap" className="text-sm font-semibold text-palm underline decoration-palm/30 underline-offset-4 hover:decoration-palm">
        Tất cả bộ sưu tập
      </Link>
      <div className="mt-4">
        <SectionHeader eyebrow={collection.eyebrow} title={collection.title} description={collection.description} />
      </div>

      <p className="mt-6 text-sm text-ink/65">
        {documents.length ? (
          <>
            <span className="font-semibold text-ink">{documents.length} tài liệu</span>
            {summary ? ` (${summary.replace(/ · /g, ", ")})` : ""}, mới nhất trước.
          </>
        ) : (
          "Bộ sưu tập này đang được bổ sung tài liệu."
        )}
      </p>

      {documents.length ? (
        <div className="mt-5 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.slice(0, shown).map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      ) : null}

      {documents.length > shown ? (
        <div className="mt-8 flex justify-center">
          <Link
            href={`/bo-suu-tap/${collection.slug}?trang=${Math.ceil(shown / pageSize) + 1}`}
            scroll={false}
            className="inline-flex min-h-11 items-center rounded-full bg-palm px-5 text-sm font-semibold text-white transition hover:bg-palm/90"
          >
            Xem thêm {Math.min(pageSize, documents.length - shown)} tài liệu
          </Link>
        </div>
      ) : null}

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-ink">Bộ sưu tập khác</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/bo-suu-tap/${item.slug}`}
                className="block rounded-lg border border-ink/10 bg-white p-4 transition hover:border-palm/30 hover:shadow-sm"
              >
                <span className="text-xs font-semibold text-lacquer">{item.eyebrow}</span>
                <span className="mt-1 block font-serif text-lg font-semibold text-ink">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
