import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Clock3,
  Compass,
  FileText,
  Files,
  Landmark,
  Library,
  Newspaper,
  ScrollText
} from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import { PageShell } from "@/components/page-shell";
import { getCommunes, getDocuments } from "@/lib/repository";

const heroImage = "/images/nui-ba-den-may-phu.jpg";

const archiveCards = [
  {
    eyebrow: "Kho địa chí",
    title: "Địa chí Tây Ninh",
    description: "Tra cứu tài liệu địa chí theo 96 xã, phường; mở bản PDF đọc thử hoặc bản đầy đủ nếu đã được cấp quyền công bố.",
    href: "/tai-lieu?loai=dia_chi",
    primaryLabel: "Mở địa chí",
    secondaryHref: "/xa-phuong",
    secondaryLabel: "Chọn xã/phường",
    icon: BookOpen,
    color: "palm"
  },
  {
    eyebrow: "Kho báo chí",
    title: "Báo Tây Ninh",
    description: "Xem các số báo, chuyên đề và tuyển chọn bài viết địa phương đã được số hóa dưới dạng bản đọc trực tuyến.",
    href: "/tai-lieu?loai=bao_tay_ninh",
    primaryLabel: "Mở báo chí",
    secondaryHref: "/tai-lieu?loai=bao_tay_ninh",
    secondaryLabel: "Danh mục Báo Tây Ninh",
    icon: Newspaper,
    color: "river"
  },
  {
    eyebrow: "Kho cấp tỉnh",
    title: "Tài liệu cấp tỉnh",
    description: "Lưu trữ tài liệu chung cấp tỉnh, hồ sơ chuyên đề và tư liệu không gắn riêng với xã/phường nào.",
    href: "/tai-lieu?loai=tai_lieu_cap_tinh",
    primaryLabel: "Mở cấp tỉnh",
    secondaryHref: "/tai-lieu",
    secondaryLabel: "Tất cả tài liệu",
    icon: Files,
    color: "brass"
  }
];

const topicLinks = [
  {
    href: "/tai-lieu?q=di%20tich",
    icon: Landmark,
    title: "Di tích, địa danh và nhân vật",
    description: "Tìm nhanh tư liệu về di tích, địa danh, danh nhân và những điểm ghi dấu lịch sử."
  },
  {
    href: "/tai-lieu?q=lich%20su",
    icon: Clock3,
    title: "Lịch sử địa phương",
    description: "Gợi mở tài liệu về quá trình hình thành, truyền thống và ký ức cộng đồng."
  },
  {
    href: "/tai-lieu?q=van%20hoa",
    icon: Compass,
    title: "Văn hóa và đời sống",
    description: "Khám phá tư liệu về cư dân, phong tục, sinh hoạt xã hội và đời sống văn hóa."
  },
  {
    href: "/tai-lieu?q=bao%20chi",
    icon: ScrollText,
    title: "Dấu ấn qua báo chí",
    description: "Đi vào các số báo để nhìn lại sự kiện, chuyên đề và nhịp sống địa phương."
  }
];

export default async function HomePage() {
  const [communes, documents] = await Promise.all([getCommunes(), getDocuments()]);
  const wardCount = communes.filter((commune) => commune.type === "phuong").length;
  const communeCount = communes.filter((commune) => commune.type === "xa").length;
  const diaChiCount = documents.filter((document) => document.documentType === "dia_chi").length;
  const baoTayNinhCount = documents.filter((document) => document.documentType === "bao_tay_ninh").length;
  const provincialCount = documents.filter((document) => document.documentType === "tai_lieu_cap_tinh").length;
  const latestDocuments = documents.slice(0, 3);

  return (
    <>
      <section className="relative min-h-[620px] overflow-hidden bg-ink text-white">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/76 to-ink/28" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded bg-white/12 px-3 py-1 text-sm font-semibold backdrop-blur">
              <Library className="h-4 w-4" aria-hidden="true" />
              Thư viện tỉnh Tây Ninh
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">Địa chí số Tây Ninh</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/84">
              Kho tài liệu địa chí, báo chí địa phương và tài liệu địa phương trên địa bàn tỉnh Tây Ninh.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/tai-lieu?loai=dia_chi"
                className="inline-flex min-h-12 items-center gap-2 rounded bg-brass px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brass/90"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Địa chí Tây Ninh
              </Link>
              <Link
                href="/tai-lieu?loai=bao_tay_ninh"
                className="inline-flex min-h-12 items-center gap-2 rounded border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
              >
                <Newspaper className="h-4 w-4" aria-hidden="true" />
                Báo Tây Ninh
              </Link>
              <Link
                href="/tai-lieu?loai=tai_lieu_cap_tinh"
                className="inline-flex min-h-12 items-center gap-2 rounded border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
              >
                <Files className="h-4 w-4" aria-hidden="true" />
                Tài liệu cấp tỉnh
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PageShell>
        <section className="grid items-stretch gap-5 lg:grid-cols-3">
          {archiveCards.map((card) => {
            const Icon = card.icon;
            const colorClass =
              card.color === "river" ? "bg-river hover:bg-river/90" : card.color === "brass" ? "bg-brass hover:bg-brass/90" : "bg-palm hover:bg-palm/90";
            const iconClass = card.color === "river" ? "bg-river" : card.color === "brass" ? "bg-brass" : "bg-palm";

            return (
              <article key={card.title} className="flex h-full min-h-[340px] flex-col rounded border border-ink/10 bg-white p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">{card.eyebrow}</p>
                    <h2 className="mt-3 text-3xl font-semibold text-ink">{card.title}</h2>
                  </div>
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded text-white ${iconClass}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-4 flex-1 leading-7 text-ink/68">{card.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link
                    href={card.href}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded px-4 text-center text-sm font-semibold text-white transition ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {card.primaryLabel}
                  </Link>
                  <Link
                    href={card.secondaryHref}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded border border-ink/12 px-4 text-center text-sm font-semibold text-ink transition hover:bg-paper"
                  >
                    {card.secondaryLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

        <section className="mt-14">
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Gợi ý khám phá</p>
              <h2 className="mt-3 text-3xl font-semibold text-ink">Mở lối đọc theo chủ đề</h2>
              <p className="mt-4 max-w-2xl leading-7 text-ink/68">
                Các lối đọc này tự mở kho tài liệu với từ khóa gợi ý, phù hợp khi người đọc muốn bắt đầu từ một mạch nội dung thay vì chọn danh mục.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {topicLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex h-full min-h-40 flex-col rounded border border-ink/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-palm/35 hover:shadow-soft"
                    >
                      <span className="flex items-start justify-between gap-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-paper text-palm">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-ink/40 transition group-hover:translate-x-1 group-hover:text-palm" aria-hidden="true" />
                      </span>
                      <span className="mt-5 font-semibold leading-6 text-ink">{item.title}</span>
                      <span className="mt-2 block text-sm leading-6 text-ink/62">{item.description}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Tài liệu mới</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Vừa được cập nhật</h2>
                </div>
                <Link
                  href="/tai-lieu"
                  className="inline-flex min-h-10 items-center gap-2 rounded border border-ink/12 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
                >
                  Tất cả
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              {latestDocuments.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {latestDocuments.slice(0, 2).map((document) => (
                    <DocumentCard key={document.id} document={document} />
                  ))}
                </div>
              ) : (
                <div className="rounded border border-dashed border-ink/18 bg-white p-6 text-sm leading-6 text-ink/62">
                  <FileText className="mb-3 h-5 w-5 text-lacquer" aria-hidden="true" />
                  Chưa có tài liệu trên Supabase. Vào khu quản trị để thêm bản PDF đầu tiên.
                </div>
              )}
            </div>
          </div>
        </section>
      </PageShell>
    </>
  );
}
