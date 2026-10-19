import Image from "next/image";
import Link from "next/link";
import { BookMarked, BookOpen, CalendarDays, Files, Newspaper, Search } from "lucide-react";

import { DocumentCoverImage } from "@/components/document-cover-image";
import { DocumentCard } from "@/components/document-card";
import { getPopularDocumentIds } from "@/lib/document-analytics";
import { getCommunes, getDocuments, getFeaturedDocuments } from "@/lib/repository";
import { normalizeVietnamese } from "@/lib/utils";

const heroImage = "/images/nui-ba-den-may-phu.jpg";
const mapImage = "/images/maps/tay-ninh-moi-2025.jpg";
const documentListPageSize = 24;

const heroBooks = [
  { src: "/thuvien-covers/dat-nuoc-con-nguoi-tay-ninh-17786-940442ab-36d1-4d14-9931-666c221a7a88.jpg", rotate: -9, position: "left-0" },
  { src: "/thuvien-covers/dia-chi-tay-ninh-17791-972e8907-bfd1-4143-9669-49ea874a05eb.jpg", rotate: 0, position: "left-1/2 z-10 -ml-[88px]" },
  { src: "/thuvien-covers/di-tich-lich-su-van-hoa-danh-lam-thang-canh-tinh-tay-ninh-19903-bff761a8-f379-44f5-9952-d8.jpg", rotate: 9, position: "right-0" }
];

const archives = [
  {
    key: "dia_chi",
    title: "Địa chí Tây Ninh",
    description: "Tài liệu địa chí của 96 xã, phường: lịch sử hình thành, địa danh, con người và văn hóa từng vùng đất.",
    href: "/tai-lieu?loai=dia_chi",
    icon: BookOpen,
    tone: { bar: "bg-palm", icon: "bg-palm/10 text-palm", text: "text-palm", card: "hover:border-palm/30" }
  },
  {
    key: "bao_tay_ninh",
    title: "Báo Tây Ninh",
    description: "Các số báo, chuyên đề và bài viết địa phương đã được số hóa thành bản đọc trực tuyến.",
    href: "/tai-lieu?loai=bao_tay_ninh",
    icon: Newspaper,
    tone: { bar: "bg-river", icon: "bg-river/10 text-river", text: "text-river", card: "hover:border-river/30" }
  },
  {
    key: "tai_lieu_cap_tinh",
    title: "Tài liệu cấp tỉnh",
    description: "Hồ sơ chuyên đề và tư liệu chung của tỉnh, không gắn riêng với một xã, phường nào.",
    href: "/tai-lieu?loai=tai_lieu_cap_tinh",
    icon: Files,
    tone: { bar: "bg-lacquer", icon: "bg-lacquer/10 text-lacquer", text: "text-lacquer", card: "hover:border-lacquer/30" }
  }
] as const;

// Terms checked against the live catalogue (Oct 2026) so each chip returns results.
const quickSearches = [
  { href: "/tai-lieu?q=kh%C3%A1ng%20chi%E1%BA%BFn", label: "Kháng chiến" },
  { href: "/tai-lieu?q=di%20t%C3%ADch", label: "Di tích" },
  { href: "/tai-lieu?q=%C4%91%E1%BA%A3ng%20b%E1%BB%99", label: "Lịch sử Đảng bộ" },
  { href: "/tai-lieu?q=d%C3%A2n%20ca", label: "Dân ca" },
  { href: "/tai-lieu?q=Long%20An", label: "Long An" }
];

const readingPaths = [
  {
    href: "/tai-lieu?q=di%20tich",
    eyebrow: "Biểu tượng Tây Ninh",
    title: "Núi Bà Đen và vùng đất linh thiêng",
    description: "Cảnh quan, di tích và tư liệu gắn với biểu tượng quen thuộc nhất của Tây Ninh."
  },
  {
    href: "/tai-lieu?q=lich%20su",
    eyebrow: "Lịch sử kháng chiến",
    title: "Căn cứ, chiến thắng và ký ức địa phương",
    description: "Căn cứ địa, lực lượng vũ trang, truyền thống cách mạng và những mốc son lịch sử."
  },
  {
    href: "/tai-lieu?q=van%20hoa",
    eyebrow: "Văn hóa bản địa",
    title: "Cao Đài, làng nghề và đời sống văn hóa",
    description: "Tín ngưỡng, sinh hoạt cộng đồng và ký ức đời sống trong tư liệu số."
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

function countLabel(count: number) {
  return count > 0 ? `${count} tài liệu` : "Đang bổ sung";
}

function SectionHeading({ title, description, action }: { title: string; description?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 leading-7 text-ink/65">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="text-sm font-semibold text-palm underline decoration-palm/30 underline-offset-4 hover:decoration-palm">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export default async function HomePage() {
  const [communes, documents, featuredDocuments] = await Promise.all([getCommunes(), getDocuments(), getFeaturedDocuments()]);
  const popularDocumentIds = await getPopularDocumentIds(3);
  const wardCount = communes.filter((commune) => commune.type === "phuong").length;
  const communeCount = communes.filter((commune) => commune.type === "xa").length;
  const countByType = {
    dia_chi: documents.filter((document) => document.documentType === "dia_chi").length,
    bao_tay_ninh: documents.filter((document) => document.documentType === "bao_tay_ninh").length,
    tai_lieu_cap_tinh: documents.filter((document) => document.documentType === "tai_lieu_cap_tinh").length
  };
  const timelineYears = documents
    .map((document) => document.year)
    .filter((year) => Number.isFinite(year))
    .sort((left, right) => left - right);
  const firstTimelineYear = timelineYears[0];
  const lastTimelineYear = timelineYears[timelineYears.length - 1];
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

  const heroStats = [
    { value: documents.length, label: "tài liệu số" },
    { value: communeCount, label: "xã" },
    { value: wardCount, label: "phường" }
  ].filter((item) => item.value > 0);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <div className="relative mx-auto grid min-h-[580px] max-w-7xl items-end gap-12 px-4 pb-14 pt-24 sm:px-6 lg:min-h-[660px] lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:px-8">
          <div>
            <h1 className="max-w-3xl animate-fade-up text-5xl font-semibold leading-[1.05] [animation-delay:80ms] sm:text-6xl lg:text-7xl">
              Địa chí số Tây Ninh
            </h1>
            <p className="mt-5 max-w-xl animate-fade-up text-lg leading-8 text-white/85 [animation-delay:160ms]">
              Lật giở từng trang sử, địa danh và ký ức của 96 xã, phường qua kho tài liệu địa chí và Báo Tây Ninh đã được số hóa.
            </p>

            <form
              action="/tai-lieu"
              className="mt-8 flex max-w-2xl animate-fade-up items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-soft ring-4 ring-white/10 [animation-delay:240ms]"
            >
              <Search className="h-5 w-5 shrink-0 text-ink/40" aria-hidden="true" />
              <label className="sr-only" htmlFor="home-search">
                Tìm tài liệu
              </label>
              <input
                id="home-search"
                name="q"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-ink/45"
                placeholder="Tìm xã, địa danh, tác giả, năm..."
              />
              <button
                type="submit"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-palm px-5 text-sm font-semibold text-white transition hover:bg-palm/90"
              >
                Tra cứu
              </button>
            </form>
            <div className="mt-4 flex max-w-2xl animate-fade-up flex-wrap items-center gap-x-1 gap-y-2 text-sm [animation-delay:300ms]">
              <span className="mr-2 text-white/60">Gợi ý:</span>
              {quickSearches.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/90 backdrop-blur transition hover:border-brass hover:bg-brass hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {heroStats.length ? (
              <dl className="mt-12 flex animate-fade-up flex-wrap gap-x-10 gap-y-4 border-t border-white/15 pt-6 [animation-delay:380ms]">
                {heroStats.map((item) => (
                  <div key={item.label} className="flex items-baseline gap-2">
                    <dt className="sr-only">{item.label}</dt>
                    <dd className="font-serif text-3xl font-semibold text-white">{item.value}</dd>
                    <span className="text-sm text-white/65">{item.label}</span>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <div className="relative mx-auto hidden h-[400px] w-[360px] animate-fade-up [animation-delay:300ms] lg:block" aria-hidden="true">
            <div className="absolute inset-x-6 bottom-6 h-10 rounded-[50%] bg-black/50 blur-2xl" />
            {heroBooks.map((book, index) => (
              <div
                key={book.src}
                className={`absolute top-1/2 w-[176px] ${book.position}`}
                style={{ transform: `translateY(-50%) rotate(${book.rotate}deg)` }}
              >
                <div className={`relative aspect-[2/3] overflow-hidden rounded-sm border-[3px] border-white/90 bg-sand shadow-book ${index === 1 ? "animate-float" : ""}`}>
                  <Image src={book.src} alt="" fill sizes="176px" className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archives */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <SectionHeading title="Ba kho tư liệu" />
        <div className="grid gap-5 md:grid-cols-3">
          {archives.map((archive) => {
            const Icon = archive.icon;
            const count = countByType[archive.key];
            return (
              <Link
                key={archive.key}
                href={archive.href}
                className={`group relative flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-soft lg:p-8 ${archive.tone.card}`}
              >
                <span className={`absolute inset-x-0 top-0 h-1 ${archive.tone.bar}`} aria-hidden="true" />
                <Icon
                  className={`absolute -right-6 -top-6 h-36 w-36 opacity-[0.06] transition duration-500 group-hover:rotate-6 group-hover:opacity-10 ${archive.tone.text}`}
                  aria-hidden="true"
                />
                <span className="relative flex items-center justify-between">
                  <span className={`grid h-12 w-12 place-items-center rounded-full ${archive.tone.icon}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </span>
                <span className="relative mt-6 font-serif text-2xl font-semibold text-ink">{archive.title}</span>
                <span className="relative mt-3 flex-1 text-sm leading-6 text-ink/62">{archive.description}</span>
                <span className="relative mt-6 flex items-center justify-between border-t border-ink/10 pt-4 text-sm font-semibold">
                  <span className={count > 0 ? "text-ink/70" : "text-ink/40"}>{countLabel(count)}</span>
                  <span className={archive.tone.text}>Mở kho</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Highlighted documents */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <SectionHeading
          title={highlightSource === "featured" ? "Tài liệu nên đọc" : highlightSource === "popular" ? "Bạn đọc đang xem nhiều" : "Tài liệu vừa số hóa"}
          action={{ href: "/tai-lieu", label: "Xem tất cả tài liệu" }}
        />
        {highlightedDocuments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {highlightedDocuments.slice(0, 3).map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-ink/20 p-8 text-center text-sm text-ink/60">
            Chưa có tài liệu. Vào khu quản trị để thêm bản PDF đầu tiên.
          </p>
        )}
      </section>

      {/* Reading paths */}
      <section className="mt-24 bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <h2 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">Chưa biết bắt đầu từ đâu? Hãy đi theo một câu chuyện.</h2>
            <ol className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {pathsWithCounts.map((path) => (
                <li key={path.title}>
                  <Link href={path.href} className="group grid grid-cols-[1fr_auto] items-start gap-5 py-6">
                    <span>
                      <span className="text-sm text-brass">{path.eyebrow}</span>
                      <span className="mt-1 block font-serif text-xl font-semibold text-white transition group-hover:text-brass">{path.title}</span>
                      <span className="mt-2 block text-sm leading-6 text-white/60">{path.description}</span>
                    </span>
                    <span className="whitespace-nowrap pt-1 text-sm text-white/55">{countLabel(path.count)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          {featuredDocument ? (
            <Link
              href={`/tai-lieu/${featuredDocument.slug}`}
              className="group relative flex min-h-[460px] flex-col justify-end overflow-hidden rounded-lg bg-white/5"
            >
              <DocumentCoverImage
                src={featuredDocument.coverImageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover opacity-75 transition duration-700 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
              <span className="relative p-7">
                <span className="text-sm text-brass">Tài liệu gợi ý</span>
                <span className="mt-2 block font-serif text-2xl font-semibold leading-snug">{featuredDocument.title}</span>
                <span className="mt-3 line-clamp-2 block text-sm leading-6 text-white/70">{featuredDocument.description}</span>
                <span className="mt-5 inline-block text-sm font-semibold text-white underline decoration-white/30 underline-offset-4">Xem tài liệu</span>
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      {/* Communes */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Link href="/xa-phuong" className="group relative block aspect-[4/3] overflow-hidden rounded-lg border border-ink/10 bg-sand">
            <Image src={mapImage} alt="Bản đồ tỉnh Tây Ninh" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.02]" />
          </Link>
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">Tìm tư liệu về quê hương bạn</h2>
            <p className="mt-4 max-w-xl leading-7 text-ink/65">
              Chọn một trong {communes.length || 96} xã, phường để xem các tài liệu địa chí, bài báo và tư liệu liên quan đến vùng đất đó.
            </p>
            {featuredCommunes.length ? (
              <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                {featuredCommunes.slice(0, 4).map((commune) => (
                  <li key={commune.id}>
                    <Link href={`/xa-phuong/${commune.slug}`} className="group flex items-center justify-between gap-4 py-4">
                      <span>
                        <span className="text-sm text-ink/50">
                          {commune.type === "phuong" ? "Phường" : "Xã"}
                        </span>
                        <span className="block font-serif text-xl font-semibold text-ink transition group-hover:text-palm">{commune.name}</span>
                      </span>
                      <span className="text-sm text-ink/55">{commune.documentCount} tài liệu</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <Link
              href="/xa-phuong"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-palm px-5 text-sm font-semibold text-white transition hover:bg-palm/90"
            >
              Xem tất cả xã, phường
            </Link>
          </div>
        </div>
      </section>

      {/* Other ways to explore */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <SectionHeading title="Đọc theo thời gian và chủ đề" />
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/dong-thoi-gian" className="group flex flex-col rounded-lg bg-sand p-8 transition hover:bg-sand/70">
            <CalendarDays className="h-6 w-6 text-lacquer" aria-hidden="true" />
            <span className="mt-6 font-serif text-2xl font-semibold text-ink">Dòng thời gian</span>
            <span className="mt-3 flex-1 leading-7 text-ink/65">
              Xem tài liệu theo năm xuất bản và mở nhanh bộ lọc theo từng giai đoạn.
            </span>
            <span className="mt-6 flex items-center justify-between text-sm font-semibold">
              <span className="text-ink/50">
                {firstTimelineYear && lastTimelineYear
                  ? firstTimelineYear === lastTimelineYear
                    ? `Năm ${firstTimelineYear}`
                    : `${firstTimelineYear} – ${lastTimelineYear}`
                  : "Đang cập nhật"}
              </span>
            </span>
          </Link>
          <Link href="/bo-suu-tap" className="group flex flex-col rounded-lg bg-palm p-8 text-white transition hover:bg-palm/95">
            <BookMarked className="h-6 w-6 text-brass" aria-hidden="true" />
            <span className="mt-6 font-serif text-2xl font-semibold">Bộ sưu tập chuyên đề</span>
            <span className="mt-3 flex-1 leading-7 text-white/75">
              Tài liệu được gom theo mạch đọc: di tích, kháng chiến, Báo Tây Ninh, Long An cũ và văn hóa đời sống.
            </span>
            <span className="mt-6 flex items-center justify-between text-sm font-semibold">
              <span className="text-white/60">Mở bộ sưu tập</span>
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
