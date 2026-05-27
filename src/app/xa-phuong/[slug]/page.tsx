import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import { PageShell } from "@/components/page-shell";
import { getCommunes, getCommuneBySlug, getDocumentsByCommune } from "@/lib/repository";
import { communeDescription, typePrefix } from "@/lib/utils";

export async function generateStaticParams() {
  const communes = await getCommunes();
  return communes.map((commune) => ({ slug: commune.slug }));
}

export default async function CommuneDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const commune = await getCommuneBySlug(slug);

  if (!commune) {
    notFound();
  }

  const relatedDocuments = await getDocumentsByCommune(commune.id);

  return (
    <PageShell>
      <Link href="/xa-phuong" className="inline-flex items-center gap-2 text-sm font-semibold text-palm">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Quay lại danh sách
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-lacquer">
            {typePrefix(commune.type)}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">{commune.name}</h1>
          <p className="mt-4 text-sm text-ink/55">{commune.districtOld}</p>
          <p className="mt-5 leading-7 text-ink/70">{communeDescription(commune.name, commune.type)}</p>
          <div className="mt-6 rounded bg-paper p-4 text-sm leading-6 text-ink/70">
            Dữ liệu trang này đang dùng mock data. Khi nối Supabase, mỗi xã/phường sẽ có mô tả, tài liệu địa chí, báo liên quan và ảnh bìa riêng.
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-lacquer" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-ink">Tài liệu liên quan</h2>
          </div>
          {relatedDocuments.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
              Chưa có tài liệu preview cho đơn vị này. Admin có thể upload sau trong trang quản trị.
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
