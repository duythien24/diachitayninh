import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, LockKeyhole } from "lucide-react";

import { ContactPanel } from "@/components/contact-panel";
import { PageShell } from "@/components/page-shell";
import { getDocuments, getDocumentBySlug } from "@/lib/repository";
import { documentTypeLabel, typePrefix } from "@/lib/utils";

export async function generateStaticParams() {
  const documents = await getDocuments();
  return documents.map((document) => ({ slug: document.slug }));
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);

  if (!document) {
    notFound();
  }

  const commune = document.commune;

  return (
    <PageShell>
      <Link href="/tai-lieu" className="inline-flex items-center gap-2 text-sm font-semibold text-palm">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Quay lại kho tài liệu
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
          <div className="relative aspect-[16/8] overflow-hidden rounded bg-ink/5">
            <Image src={document.coverImageUrl} alt="" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded bg-paper px-2.5 py-1 text-ink/70">
              {documentTypeLabel(document.documentType)}
            </span>
            <span className="rounded bg-paper px-2.5 py-1 text-ink/70">{document.year}</span>
            {commune ? (
              <span className="rounded bg-paper px-2.5 py-1 text-ink/70">
                {typePrefix(commune.type)} {commune.name}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink">{document.title}</h1>
          <p className="mt-4 leading-7 text-ink/70">{document.description}</p>
          <dl className="mt-6 grid gap-4 rounded bg-paper p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-ink">Nguồn</dt>
              <dd className="mt-1 text-ink/64">{document.source}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Trạng thái</dt>
              <dd className="mt-1 text-ink/64">Bản đọc thử có watermark</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/doc/${document.slug}`}
              className="inline-flex items-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Đọc PDF online
            </Link>
            <span className="inline-flex items-center gap-2 rounded border border-lacquer/20 px-4 py-3 text-sm font-semibold text-lacquer">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              Không public bản full
            </span>
          </div>
        </div>

        <ContactPanel />
      </section>
    </PageShell>
  );
}
