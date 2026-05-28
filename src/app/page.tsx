import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  FileText,
  Files,
  Library,
  Newspaper,
  Search
} from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import { PageShell } from "@/components/page-shell";
import { getCommunes, getDocuments } from "@/lib/repository";

const heroImage = "/images/nui-ba-den-may-phu.jpg";

export default async function HomePage() {
  const [communes, documents] = await Promise.all([getCommunes(), getDocuments()]);
  const wardCount = communes.filter((commune) => commune.type === "phuong").length;
  const communeCount = communes.filter((commune) => commune.type === "xa").length;
  const diaChiCount = documents.filter((document) => document.documentType === "dia_chi").length;
  const baoTayNinhCount = documents.filter((document) => document.documentType === "bao_tay_ninh").length;
  const provincialCount = documents.filter((document) => document.documentType === "tai_lieu_cap_tinh").length;

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
              Kho tài liệu địa chí, báo chí địa phương và tài liệu địa phương trên địa bàn tỉnh Tây Ninh.
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
              <Link
                href="/tai-lieu?loai=tai_lieu_cap_tinh"
                className="inline-flex items-center gap-2 rounded border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
              >
                <Files className="h-4 w-4" aria-hidden="true" />
                Tài liệu cấp tỉnh
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PageShell>
        <section className="grid gap-5 lg:grid-cols-3">
          <article className="flex h-full flex-col rounded border border-ink/10 bg-white p-6 shadow-soft">
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
            <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
              <Link
                href="/tai-lieu?loai=dia_chi"
                className="inline-flex h-16 items-center justify-center gap-2 rounded bg-palm px-4 text-center text-sm font-semibold text-white transition hover:bg-palm/90"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Mở Địa chí Tây Ninh
              </Link>
              <Link
                href="/xa-phuong"
                className="inline-flex h-16 items-center justify-center gap-2 rounded border border-ink/12 px-4 text-center text-sm font-semibold text-ink transition hover:bg-paper"
              >
                Chọn xã/phường
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="flex h-full flex-col rounded border border-ink/10 bg-white p-6 shadow-soft">
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
            <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
              <Link
                href="/tai-lieu?loai=bao_tay_ninh"
                className="inline-flex h-16 items-center justify-center gap-2 rounded bg-river px-4 text-center text-sm font-semibold text-white transition hover:bg-river/90"
              >
                <Newspaper className="h-4 w-4" aria-hidden="true" />
                Mở Báo Tây Ninh
              </Link>
              <Link
                href="/tai-lieu?loai=bao_tay_ninh"
                className="inline-flex h-16 items-center justify-center gap-2 rounded border border-ink/12 px-4 text-center text-sm font-semibold text-ink transition hover:bg-paper"
              >
                Danh mục Báo Tây Ninh
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="flex h-full flex-col rounded border border-ink/10 bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-lacquer">Kho cấp tỉnh</p>
                <h2 className="mt-3 text-3xl font-semibold text-ink">Tài liệu cấp tỉnh</h2>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded bg-brass text-white">
                <Files className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 leading-7 text-ink/68">
              Lưu trữ tài liệu chung cấp tỉnh, hồ sơ chuyên đề và tư liệu không gắn riêng với xã/phường nào.
            </p>
            <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
              <Link
                href="/tai-lieu?loai=tai_lieu_cap_tinh"
                className="inline-flex h-16 items-center justify-center gap-2 rounded bg-brass px-4 text-center text-sm font-semibold text-white transition hover:bg-brass/90"
              >
                <Files className="h-4 w-4" aria-hidden="true" />
                Mở tài liệu cấp tỉnh
              </Link>
              <Link
                href="/tai-lieu"
                className="inline-flex h-16 items-center justify-center gap-2 rounded border border-ink/12 px-4 text-center text-sm font-semibold text-ink transition hover:bg-paper"
              >
                Tất cả tài liệu
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-5">
          {[
            { label: "Xã", value: communeCount, icon: Building2 },
            { label: "Phường", value: wardCount, icon: Building2 },
            { label: "Địa chí", value: diaChiCount, icon: BookOpen },
            { label: "Báo Tây Ninh", value: baoTayNinhCount, icon: Newspaper },
            { label: "Cấp tỉnh", value: provincialCount, icon: Files }
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

        <section className="mt-14 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-lacquer">Tra cứu nhanh</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Tìm tư liệu theo nhu cầu đọc</h2>
            <p className="mt-4 leading-7 text-ink/68">
              Chọn xã/phường để xem tư liệu địa phương, mở riêng kho địa chí hoặc đọc các số Báo Tây Ninh đã số hóa.
            </p>

            <div className="mt-6 space-y-3">
              {[
                {
                  href: "/xa-phuong",
                  icon: Search,
                  title: "Tra cứu theo xã/phường",
                  description: "Xem tài liệu gắn với từng đơn vị hành chính mới."
                },
                {
                  href: "/tai-lieu?loai=dia_chi",
                  icon: BookOpen,
                  title: "Kho tài liệu địa chí",
                  description: "Đọc các tài liệu địa chí, di tích, địa danh và tư liệu lịch sử địa phương."
                },
                {
                  href: "/tai-lieu?loai=bao_tay_ninh",
                  icon: Newspaper,
                  title: "Kho Báo Tây Ninh",
                  description: "Tra cứu các số báo và chuyên đề báo chí địa phương đã được số hóa."
                },
                {
                  href: "/tai-lieu?loai=tai_lieu_cap_tinh",
                  icon: Files,
                  title: "Tài liệu cấp tỉnh",
                  description: "Xem các tài liệu chung toàn tỉnh, không gắn riêng với xã/phường nào."
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-4 rounded border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-palm/35 hover:shadow-soft"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-paper text-palm">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3 font-semibold text-ink">
                        {item.title}
                        <ArrowRight className="h-4 w-4 shrink-0 text-ink/40 transition group-hover:translate-x-1 group-hover:text-palm" aria-hidden="true" />
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-ink/62">{item.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
          {documents.length > 0 ? (
            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase text-lacquer">Tài liệu mới</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Vừa được cập nhật</h2>
                </div>
                <Link
                  href="/tai-lieu"
                  className="hidden items-center gap-2 rounded border border-ink/12 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-white sm:inline-flex"
                >
                  Tất cả
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {documents.slice(0, 2).map((document) => (
                  <DocumentCard key={document.id} document={document} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
              <FileText className="mb-3 h-5 w-5 text-lacquer" aria-hidden="true" />
              Chưa có tài liệu trên Supabase. Vào khu quản trị để thêm bản PDF preview đầu tiên.
            </div>
          )}
        </section>
      </PageShell>
    </>
  );
}
