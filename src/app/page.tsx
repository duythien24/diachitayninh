import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Library,
  Newspaper
} from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import { PageShell } from "@/components/page-shell";
import { getCommunes, getDocuments } from "@/lib/repository";

const heroImage =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ch%C3%B9a_B%C3%A0_v%C3%A0_c%E1%BA%A3nh_ch%C3%A2n_tr%E1%BB%9Di%2C_KDL_N%C3%BAi_B%C3%A0_%C4%90en.jpg?width=1600";

export default async function HomePage() {
  const [communes, documents] = await Promise.all([getCommunes(), getDocuments()]);
  const wardCount = communes.filter((commune) => commune.type === "phuong").length;
  const communeCount = communes.filter((commune) => commune.type === "xa").length;
  const diaChiCount = documents.filter((document) => document.documentType === "dia_chi").length;
  const baoTayNinhCount = documents.filter((document) => document.documentType === "bao_tay_ninh").length;

  return (
    <>
      <section className="relative min-h-[620px] overflow-hidden bg-ink text-white">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/72 to-ink/20" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded bg-white/12 px-3 py-1 text-sm font-semibold backdrop-blur">
              <Library className="h-4 w-4" aria-hidden="true" />
              Thư viện tỉnh Tây Ninh
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">Địa chí số Tây Ninh</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
              Cổng đọc thử tài liệu địa chí, báo chí địa phương và hồ sơ số hóa theo từng xã, phường.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/tai-lieu?loai=dia_chi"
                className="inline-flex items-center gap-2 rounded bg-brass px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brass/90"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Địa chí Tây Ninh
              </Link>
              <Link
                href="/tai-lieu?loai=bao_tay_ninh"
                className="inline-flex items-center gap-2 rounded border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
              >
                <Newspaper className="h-4 w-4" aria-hidden="true" />
                Báo Tây Ninh
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PageShell>
        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded border border-ink/10 bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-lacquer">Kho địa chí</p>
                <h2 className="mt-3 text-3xl font-semibold text-ink">Địa chí Tây Ninh</h2>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded bg-palm text-white">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 leading-7 text-ink/68">
              Tra cứu tài liệu địa chí theo 96 xã, phường; mở bản PDF preview và liên hệ thư viện khi cần bản đầy đủ.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/xa-phuong"
                className="inline-flex items-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Chọn xã/phường
              </Link>
              <Link
                href="/tai-lieu?loai=dia_chi"
                className="inline-flex items-center gap-2 rounded border border-ink/12 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
              >
                Tài liệu địa chí
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="rounded border border-ink/10 bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-lacquer">Kho báo chí</p>
                <h2 className="mt-3 text-3xl font-semibold text-ink">Báo Tây Ninh</h2>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded bg-river text-white">
                <Newspaper className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 leading-7 text-ink/68">
              Xem các số báo, chuyên đề và tuyển chọn bài viết địa phương đã được số hóa dưới dạng bản đọc thử.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/tai-lieu?loai=bao_tay_ninh"
                className="inline-flex items-center gap-2 rounded bg-river px-4 py-3 text-sm font-semibold text-white transition hover:bg-river/90"
              >
                <Newspaper className="h-4 w-4" aria-hidden="true" />
                Mở Báo Tây Ninh
              </Link>
              <Link
                href="/tai-lieu"
                className="inline-flex items-center gap-2 rounded border border-ink/12 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
              >
                Tất cả tài liệu
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Xã", value: communeCount, icon: Building2 },
            { label: "Phường", value: wardCount, icon: Building2 },
            { label: "Địa chí", value: diaChiCount, icon: BookOpen },
            { label: "Báo Tây Ninh", value: baoTayNinhCount, icon: Newspaper }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
                <Icon className="h-5 w-5 text-lacquer" aria-hidden="true" />
                <p className="mt-4 text-3xl font-semibold text-ink">{item.value}</p>
                <p className="mt-1 text-sm text-ink/60">{item.label}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-lacquer">Luồng tra cứu</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Chọn đúng kho tư liệu trước khi đọc</h2>
            <p className="mt-4 leading-7 text-ink/68">
              Người đọc có thể đi theo hai hướng rõ ràng: chọn xã/phường để xem địa chí liên quan, hoặc mở riêng kho Báo Tây Ninh để đọc các số báo đã số hóa.
            </p>
            <Link
              href="/tai-lieu"
              className="mt-6 inline-flex items-center gap-2 rounded border border-ink/12 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              Xem toàn bộ kho tài liệu
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {documents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {documents.slice(0, 2).map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
              Chưa có tài liệu trên Supabase. Vào khu quản trị để thêm bản PDF preview đầu tiên.
            </div>
          )}
        </section>
      </PageShell>
    </>
  );
}
