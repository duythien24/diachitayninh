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
  MapPinned,
  Newspaper,
  Route,
  Sparkles,
  ScrollText
} from "lucide-react";

import { DocumentCoverImage } from "@/components/document-cover-image";
import { DocumentCard } from "@/components/document-card";
import { PageShell } from "@/components/page-shell";
import { getPopularDocumentIds } from "@/lib/document-analytics";
import { getCommunes, getDocuments, getFeaturedDocuments } from "@/lib/repository";
import { normalizeVietnamese } from "@/lib/utils";

const heroImage = "/images/nui-ba-den-may-phu.jpg";
const documentListPageSize = 24;

const archiveCards = [
  {
    eyebrow: "Kho địa chí",
    title: "Địa chí Tây Ninh",
    description:
      "Tra cứu tài liệu địa chí theo 96 xã, phường; mở bản PDF đọc thử hoặc bản đầy đủ nếu đã được cấp quyền công bố.",
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
    description:
      "Xem các số báo, chuyên đề và tuyển chọn bài viết địa phương đã được số hóa dưới dạng bản đọc trực tuyến.",
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

const readingPaths = [
  {
    href: "/tai-lieu?q=di%20tich",
    eyebrow: "Biểu tượng Tây Ninh",
    title: "Núi Bà Đen và vùng đất linh thiêng",
    description: "Bắt đầu từ cảnh quan, di tích và những tư liệu gắn với biểu tượng quen thuộc nhất của Tây Ninh.",
    terms: ["nui ba den", "ba den", "danh lam", "di tich"],
    icon: MapPinned
  },
  {
    href: "/tai-lieu?q=lich%20su",
    eyebrow: "Lịch sử kháng chiến",
    title: "Căn cứ, chiến thắng và ký ức địa phương",
    description: "Lần theo các tài liệu về căn cứ địa, lực lượng vũ trang, truyền thống cách mạng và những mốc son lịch sử.",
    terms: ["can cu", "chien thang", "khang chien", "cach mang", "luc luong vu trang"],
    icon: Route
  },
  {
    href: "/tai-lieu?q=van%20hoa",
    eyebrow: "Văn hóa bản địa",
    title: "Cao Đài, làng nghề và đời sống văn hóa",
    description: "Khám phá những lớp văn hóa, tín ngưỡng, sinh hoạt cộng đồng và ký ức đời sống trong tư liệu số.",
    terms: ["cao dai", "van hoa", "am thuc", "lang nghe", "dan ca"],
    icon: Sparkles
  }
];

function documentSearchText(document: Awaited<ReturnType<typeof getDocuments>>[number]) {
  return normalizeVietnamese(
    [
      document.title,
      document.description,
      document.source,
      document.author || "",
      document.publisher || "",
      document.keywords?.join(" ") || "",
      document.communes?.map((commune) => commune.name).join(" ") || ""
    ].join(" ")
  );
}

function searchQueryFromHref(href: string) {
  const [, queryString = ""] = href.split("?");
  return new URLSearchParams(queryString).get("q") || "";
}

function hrefWithEnoughResults(href: string, count: number) {
  if (count <= documentListPageSize) {
    return href;
  }

  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}page=${Math.ceil(count / documentListPageSize)}`;
}

export default async function HomePage() {
  const [communes, documents, featuredDocuments] = await Promise.all([getCommunes(), getDocuments(), getFeaturedDocuments()]);
  const popularDocumentIds = await getPopularDocumentIds(3);
  const wardCount = communes.filter((commune) => commune.type === "phuong").length;
  const communeCount = communes.filter((commune) => commune.type === "xa").length;
  const diaChiCount = documents.filter((document) => document.documentType === "dia_chi").length;
  const baoTayNinhCount = documents.filter((document) => document.documentType === "bao_tay_ninh").length;
  const provincialCount = documents.filter((document) => document.documentType === "tai_lieu_cap_tinh").length;
  const latestDocuments = documents.slice(0, 3);
  const documentById = new Map(documents.map((document) => [document.id, document]));
  const popularDocuments = popularDocumentIds
    .map((documentId) => documentById.get(documentId))
    .filter((document): document is NonNullable<typeof document> => Boolean(document));
  const highlightSource = featuredDocuments.length > 0 ? "featured" : popularDocuments.length >= 2 ? "popular" : "latest";
  const highlightedDocuments = highlightSource === "featured" ? featuredDocuments : highlightSource === "popular" ? popularDocuments : latestDocuments;
  const documentsWithSearchText = documents.map((document) => ({ document, searchText: documentSearchText(document) }));
  const pathsWithCounts = readingPaths.map((path) => {
    const count = documentsWithSearchText.filter((item) => item.searchText.includes(normalizeVietnamese(searchQueryFromHref(path.href)))).length;
    return {
      ...path,
      href: hrefWithEnoughResults(path.href, count),
      count
    };
  });
  const featuredDocument =
    featuredDocuments[0] ||
    popularDocuments[0] ||
    documentsWithSearchText.find((item) => ["tay ninh 180", "tay ninh 30 nam", "dia chi tay ninh"].some((term) => item.searchText.includes(term)))
      ?.document ||
    latestDocuments[0];
  const documentCountByCommuneId = new Map<string, number>();

  for (const document of documents) {
    const communeIds = Array.from(new Set(document.communeIds?.length ? document.communeIds : document.communeId ? [document.communeId] : []));

    for (const communeId of communeIds) {
      documentCountByCommuneId.set(communeId, (documentCountByCommuneId.get(communeId) || 0) + 1);
    }
  }

  const featuredCommunes = communes
    .map((commune) => ({
      ...commune,
      documentCount: documentCountByCommuneId.get(commune.id) || 0
    }))
    .filter((commune) => commune.documentCount > 0)
    .sort((left, right) => right.documentCount - left.documentCount || left.name.localeCompare(right.name, "vi"))
    .slice(0, 6);

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

        <section className="mt-14 overflow-hidden rounded border border-ink/10 bg-ink text-white shadow-soft">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1 text-sm font-semibold text-white/82">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Hành trình đọc 15 phút
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
                Không biết bắt đầu từ đâu? Hãy đi theo một câu chuyện.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                Các tuyến đọc gom tài liệu theo mạch khám phá quen thuộc với bạn đọc: biểu tượng địa phương, lịch sử kháng chiến,
                văn hóa đời sống và ký ức cộng đồng.
              </p>

              <div className="mt-7 grid gap-3">
                {pathsWithCounts.map((path) => {
                  const Icon = path.icon;

                  return (
                    <Link
                      key={path.href}
                      href={path.href}
                      className="group grid gap-4 rounded border border-white/12 bg-white/8 p-4 transition hover:border-brass/60 hover:bg-white/12 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                    >
                      <span className="grid h-11 w-11 place-items-center rounded bg-brass text-ink">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-brass">{path.eyebrow}</span>
                        <span className="mt-1 block font-semibold text-white">{path.title}</span>
                        <span className="mt-1 block text-sm leading-6 text-white/62">{path.description}</span>
                      </span>
                      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-white/78 sm:block sm:text-right">
                        <span className="rounded bg-white/10 px-2.5 py-1">{path.count} tài liệu</span>
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 sm:ml-auto sm:mt-3" aria-hidden="true" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {featuredDocument ? (
              <div className="relative min-h-[420px] overflow-hidden bg-white/5">
                <DocumentCoverImage src={featuredDocument.coverImageUrl} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/42 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-sm font-semibold uppercase tracking-wide text-brass">Tài liệu gợi ý</p>
                  <h3 className="mt-2 max-w-xl text-2xl font-semibold leading-snug text-white">{featuredDocument.title}</h3>
                  <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-6 text-white/72">{featuredDocument.description}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/tai-lieu/${featuredDocument.slug}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded bg-brass px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brass/90"
                    >
                      Xem chi tiết
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href={`/doc/${featuredDocument.slug}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/18"
                    >
                      Đọc ngay
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {featuredCommunes.length ? (
          <section className="mt-14">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Địa phương nổi bật</p>
                <h2 className="mt-2 text-3xl font-semibold text-ink">Nơi đang có nhiều tư liệu để khám phá</h2>
                <p className="mt-3 max-w-2xl leading-7 text-ink/68">
                  Bạn đọc có thể bắt đầu từ quê quán, nơi đang sống hoặc một địa danh quen thuộc để đi vào kho tư liệu theo cách gần gũi hơn.
                </p>
              </div>
              <Link
                href="/xa-phuong"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-ink/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
              >
                Xem 96 xã/phường
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredCommunes.map((commune, index) => (
                <Link
                  key={commune.id}
                  href={`/xa-phuong/${commune.slug}`}
                  className="group flex min-h-44 flex-col rounded border border-ink/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-palm/30 hover:shadow-soft"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded bg-paper text-palm">
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded bg-brass/15 px-2.5 py-1 text-xs font-semibold text-lacquer">
                      #{index + 1}
                    </span>
                  </span>
                  <span className="mt-5 text-xs font-semibold uppercase tracking-wide text-lacquer">
                    {commune.type === "phuong" ? "Phường" : "Xã"}
                  </span>
                  <span className="mt-1 text-xl font-semibold text-ink">{commune.name}</span>
                  <span className="mt-3 line-clamp-2 text-sm leading-6 text-ink/62">{commune.description}</span>
                  <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-palm">
                    <span>{commune.documentCount} tài liệu liên quan</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

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
                  <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">
                    {highlightSource === "featured" ? "Thư viện đề xuất" : highlightSource === "popular" ? "Được quan tâm" : "Tài liệu mới"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">
                    {highlightSource === "featured" ? "Tài liệu nên đọc" : highlightSource === "popular" ? "Bạn đọc đang xem nhiều" : "Vừa được cập nhật"}
                  </h2>
                </div>
                <Link
                  href="/tai-lieu"
                  className="inline-flex min-h-10 items-center gap-2 rounded border border-ink/12 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
                >
                  Tất cả
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              {highlightedDocuments.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {highlightedDocuments.slice(0, 2).map((document) => (
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
