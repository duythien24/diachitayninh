import Image from "next/image";
import Link from "next/link";
import { BookMarked, BookOpen, CalendarDays, Files, Newspaper, Search } from "lucide-react";

import { GoldFrame, HeritageHeading, Ornament } from "@/components/ornaments";
import { DocumentCoverImage } from "@/components/document-cover-image";
import { DocumentCard } from "@/components/document-card";
import { getPopularDocumentIds } from "@/lib/document-analytics";
import { documentsForCollection, getCollectionBySlug } from "@/lib/document-collections";
import { getCommunes, getDocuments, getFeaturedDocuments } from "@/lib/repository";
import { normalizeVietnamese } from "@/lib/utils";

const heroImage = "/images/nui-ba-den-may-phu.jpg";
const mapImage = "/images/maps/tay-ninh-moi-2025.jpg";

// The two gazetteers stand side by side in front; two other local titles peek out behind them.
const heroBooks = [
  { src: "/thuvien-covers/dat-nuoc-con-nguoi-tay-ninh-17786-940442ab-36d1-4d14-9931-666c221a7a88.jpg", rotate: -12, place: "left-0 w-[150px] opacity-90" },
  { src: "/thuvien-covers/di-tich-lich-su-van-hoa-danh-lam-thang-canh-tinh-tay-ninh-19903-bff761a8-f379-44f5-9952-d8.jpg", rotate: 12, place: "right-0 w-[150px] opacity-90" },
  { src: "/thuvien-covers/dia-chi-tay-ninh-17791-972e8907-bfd1-4143-9669-49ea874a05eb.jpg", rotate: -4, place: "left-[58px] z-10 w-[186px]", alt: "Địa chí Tây Ninh" },
  { src: "/thuvien-covers/dia-chi-long-an-1989.jpg", rotate: 4, place: "right-[58px] z-20 w-[186px]", alt: "Địa chí Long An" }
];

const tayNinhCover = "/thuvien-covers/dia-chi-tay-ninh-17791-972e8907-bfd1-4143-9669-49ea874a05eb.jpg";

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

// Suggested searches; each is shown only while it matches at least one document.
const quickSearches = [
  { href: "/tai-lieu?q=kh%C3%A1ng%20chi%E1%BA%BFn", label: "Kháng chiến" },
  { href: "/tai-lieu?q=di%20t%C3%ADch", label: "Di tích" },
  { href: "/tai-lieu?q=%C4%91%E1%BA%A3ng%20b%E1%BB%99", label: "Lịch sử Đảng bộ" },
  { href: "/tai-lieu?q=d%C3%A2n%20ca", label: "Dân ca" },
  { href: "/tai-lieu?q=Long%20An", label: "Long An" }
];

const readingPaths = [
  {
    collection: "nui-ba-den",
    eyebrow: "Biểu tượng Tây Ninh",
    title: "Núi Bà Đen và vùng đất linh thiêng",
    description: "Cảnh quan, di tích và tư liệu gắn với biểu tượng quen thuộc nhất của Tây Ninh."
  },
  {
    collection: "lich-su-khang-chien",
    eyebrow: "Lịch sử kháng chiến",
    title: "Căn cứ, chiến thắng và ký ức địa phương",
    description: "Căn cứ địa, lực lượng vũ trang, truyền thống cách mạng và những mốc son lịch sử."
  },
  {
    collection: "van-hoa-doi-song",
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

function countLabel(count: number) {
  return count > 0 ? `${count} tài liệu` : "Đang bổ sung";
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
  // Reading paths open the matching collection page, so the count shown is exactly what the reader gets.
  const pathsWithCounts = readingPaths.map((path) => {
    const collection = getCollectionBySlug(path.collection);
    return {
      ...path,
      href: `/bo-suu-tap/${path.collection}`,
      count: collection ? documentsForCollection(collection, documents).length : 0
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

  const visibleQuickSearches = quickSearches.filter((item) => {
    const term = normalizeVietnamese(new URLSearchParams(item.href.split("?")[1]).get("q") || "");
    return documentsWithSearchText.some((entry) => entry.searchText.includes(term));
  });

  const heroStats = [
    { value: documents.length, label: "tài liệu số" },
    { value: communeCount, label: "xã" },
    { value: wardCount, label: "phường" }
  ].filter((item) => item.value > 0);

  return (
    <main>
      {/* Hero: lacquer-red banner with the mountain photo and the book fan */}
      <section className="relative overflow-hidden bg-maroon text-white">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-40 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon via-palm/85 to-palm/30" />
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-brass/0 via-brass to-brass/0" />
        <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:min-h-[620px] lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="animate-fade-up font-serif text-lg italic text-brass">Thư viện tỉnh Tây Ninh</p>
            <h1 className="mt-2 max-w-3xl animate-fade-up font-serif text-5xl font-semibold uppercase leading-[1.08] tracking-wide text-[#f6e3b0] [animation-delay:80ms] sm:text-6xl">
              Địa chí số
              <br />
              Tây Ninh
            </h1>
            <Ornament className="mt-4 animate-fade-up [animation-delay:120ms]" tone="light" />
            <p className="mt-5 max-w-xl animate-fade-up text-lg leading-8 text-white/90 [animation-delay:160ms]">
              Lật giở từng trang sử, địa danh và ký ức của 96 xã, phường qua kho tài liệu địa chí và Báo Tây Ninh đã được số hóa.
            </p>

            <form
              action="/tai-lieu"
              className="mt-8 flex max-w-2xl items-center gap-2 rounded-full border-2 border-brass/70 bg-paper p-1.5 pl-5 shadow-soft"
            >
              <Search className="h-5 w-5 shrink-0 text-lacquer" aria-hidden="true" />
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
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-palm px-6 text-sm font-semibold text-white transition hover:bg-maroon"
              >
                Tra cứu
              </button>
            </form>
            {visibleQuickSearches.length ? (
              <div className="mt-4 flex max-w-2xl flex-wrap items-center gap-x-1 gap-y-2 text-sm">
                <span className="mr-2 text-white/70">Gợi ý:</span>
                {visibleQuickSearches.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-brass/50 px-3 py-1 text-[#f6e3b0] transition hover:bg-brass hover:text-maroon"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative mx-auto hidden h-[420px] w-[480px] animate-fade-up [animation-delay:300ms] xl:block" aria-hidden="true">
            <div className="absolute inset-x-6 bottom-6 h-10 rounded-[50%] bg-black/50 blur-2xl" />
            {heroBooks.map((book) => (
              <div
                key={book.src}
                className={`absolute top-1/2 ${book.place}`}
                style={{ transform: `translateY(-50%) rotate(${book.rotate}deg)` }}
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-sm border-[3px] border-[#f6e3b0] bg-sand shadow-book">
                  <Image src={book.src} alt="" fill sizes="190px" className="object-cover object-top" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats ribbon */}
      {heroStats.length ? (
        <section className="border-b border-brass/40 bg-sand/60">
          <dl className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-brass/40 px-4 py-6 text-center">
            {heroStats.map((item) => (
              <div key={item.label} className="px-2">
                <dd className="font-serif text-3xl font-semibold text-palm sm:text-4xl">{item.value}</dd>
                <dt className="mt-1 text-sm text-ink/65">{item.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Introduction plaque */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <HeritageHeading title="Giới thiệu" />
        <GoldFrame>
          <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
            <div className="relative mx-auto aspect-[2/3] w-44 overflow-hidden rounded-sm border-[3px] border-brass/60 shadow-book md:w-full">
              <Image src={tayNinhCover} alt="Bìa sách Địa chí Tây Ninh" fill sizes="220px" className="object-cover" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-semibold uppercase text-palm">Kho địa chí số của Thư viện tỉnh Tây Ninh</h3>
              <p className="mt-4 leading-8 text-ink/80">
                Địa chí là sách chép lại một cách toàn diện về một vùng đất: lịch sử hình thành, địa danh, di tích, con người, phong tục và đời
                sống. Trang Địa chí số gom các tài liệu địa chí, Báo Tây Ninh và tư liệu cấp tỉnh đã được số hóa, sắp theo 96 xã, phường sau
                sắp xếp năm 2025, để bạn đọc tra cứu và đọc trực tuyến.
              </p>
              <Link
                href="/gioi-thieu"
                className="mt-6 inline-flex min-h-11 items-center rounded-full border border-palm px-5 text-sm font-semibold text-palm transition hover:bg-palm hover:text-white"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </GoldFrame>
      </section>

      {/* Archives on a red lattice band */}
      <section className="bg-lattice mt-20 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HeritageHeading title="Ba kho tư liệu" tone="light" />
          <div className="grid gap-6 md:grid-cols-3">
            {archives.map((archive) => {
              const Icon = archive.icon;
              const count = countByType[archive.key];
              return (
                <Link
                  key={archive.key}
                  href={archive.href}
                  className="group flex flex-col rounded-sm border border-brass/60 bg-paper p-2 text-ink shadow-book transition duration-300 hover:-translate-y-1"
                >
                  <span className="flex flex-1 flex-col items-center rounded-sm border border-brass/30 px-6 py-8 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full border border-brass/60 bg-sand text-palm">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="mt-5 font-serif text-2xl font-semibold text-palm">{archive.title}</span>
                    <span className="mt-3 flex-1 text-sm leading-6 text-ink/70">{archive.description}</span>
                    <span className="mt-5 text-sm font-semibold text-lacquer">{countLabel(count)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Highlighted documents */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <HeritageHeading
          title={highlightSource === "featured" ? "Tài liệu nên đọc" : highlightSource === "popular" ? "Được đọc nhiều" : "Tài liệu mới số hóa"}
        />
        {highlightedDocuments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {highlightedDocuments.slice(0, 3).map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-ink/20 p-8 text-center text-sm text-ink/60">Chưa có tài liệu.</p>
        )}
        <div className="mt-10 text-center">
          <Link href="/tai-lieu" className="inline-flex min-h-11 items-center rounded-full bg-palm px-6 text-sm font-semibold text-white transition hover:bg-maroon">
            Xem tất cả tài liệu
          </Link>
        </div>
      </section>

      {/* Reading paths */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <HeritageHeading title="Hành trình đọc" description="Chưa biết bắt đầu từ đâu? Hãy đi theo một câu chuyện." />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ol className="grid gap-4">
            {pathsWithCounts.map((path) => (
              <li key={path.title}>
                <Link
                  href={path.href}
                  className="group flex items-start justify-between gap-5 rounded-sm border border-brass/40 bg-white p-5 transition hover:border-palm/40 hover:shadow-soft"
                >
                  <span>
                    <span className="text-sm font-semibold text-lacquer">{path.eyebrow}</span>
                    <span className="mt-1 block font-serif text-xl font-semibold text-palm">{path.title}</span>
                    <span className="mt-2 block text-sm leading-6 text-ink/65">{path.description}</span>
                  </span>
                  <span className="whitespace-nowrap rounded-full bg-sand px-3 py-1 text-xs font-semibold text-lacquer">{countLabel(path.count)}</span>
                </Link>
              </li>
            ))}
          </ol>

          {featuredDocument ? (
            <Link
              href={`/tai-lieu/${featuredDocument.slug}`}
              className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-sm border-4 border-brass/60 bg-maroon text-white"
            >
              <DocumentCoverImage
                src={featuredDocument.coverImageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover opacity-70 transition duration-700 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/50 to-transparent" />
              <span className="relative p-7">
                <span className="font-serif text-sm italic text-brass">Tài liệu gợi ý</span>
                <span className="mt-2 block font-serif text-2xl font-semibold leading-snug">{featuredDocument.title}</span>
                <span className="mt-3 line-clamp-2 block text-sm leading-6 text-white/80">{featuredDocument.description}</span>
                <span className="mt-5 inline-block text-sm font-semibold text-[#f6e3b0] underline decoration-brass/60 underline-offset-4">
                  Xem tài liệu
                </span>
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      {/* Communes */}
      <section className="bg-sand/50 mt-20 border-y border-brass/40 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HeritageHeading title="Tư liệu theo địa phương" description={`Chọn một trong ${communes.length || 96} xã, phường để xem tài liệu về vùng đất đó.`} />
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Link href="/xa-phuong" className="group relative block aspect-[4/3] overflow-hidden rounded-sm border-4 border-brass/50 bg-paper shadow-book">
              <Image src={mapImage} alt="Bản đồ tỉnh Tây Ninh" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.02]" />
            </Link>
            <div>
              {featuredCommunes.length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {featuredCommunes.map((commune) => (
                    <li key={commune.id}>
                      <Link
                        href={`/xa-phuong/${commune.slug}`}
                        className="flex items-center justify-between gap-3 rounded-sm border border-brass/40 bg-paper px-4 py-3 transition hover:border-palm/40 hover:bg-white"
                      >
                        <span>
                          <span className="block text-xs text-ink/55">{commune.type === "phuong" ? "Phường" : "Xã"}</span>
                          <span className="block font-serif text-lg font-semibold text-palm">{commune.name}</span>
                        </span>
                        <span className="text-sm text-lacquer">{commune.documentCount} tài liệu</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href="/xa-phuong"
                className="mt-6 inline-flex min-h-11 items-center rounded-full bg-palm px-6 text-sm font-semibold text-white transition hover:bg-maroon"
              >
                Xem tất cả xã, phường
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other ways to explore */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <HeritageHeading title="Cách khám phá khác" />
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/dong-thoi-gian" className="group rounded-sm border border-brass/50 bg-paper p-2 transition hover:shadow-soft">
            <span className="flex h-full flex-col rounded-sm border border-brass/30 p-7">
              <CalendarDays className="h-7 w-7 text-palm" aria-hidden="true" />
              <span className="mt-5 font-serif text-2xl font-semibold text-palm">Dòng thời gian</span>
              <span className="mt-3 flex-1 leading-7 text-ink/70">Xem tài liệu theo năm xuất bản và mở nhanh bộ lọc theo từng giai đoạn.</span>
              <span className="mt-5 text-sm font-semibold text-lacquer">
                {firstTimelineYear && lastTimelineYear
                  ? firstTimelineYear === lastTimelineYear
                    ? `Năm ${firstTimelineYear}`
                    : `${firstTimelineYear} – ${lastTimelineYear}`
                  : "Đang cập nhật"}
              </span>
            </span>
          </Link>
          <Link href="/bo-suu-tap" className="group bg-lattice rounded-sm border border-brass/60 p-2 text-white transition hover:shadow-soft">
            <span className="flex h-full flex-col rounded-sm border border-brass/40 p-7">
              <BookMarked className="h-7 w-7 text-brass" aria-hidden="true" />
              <span className="mt-5 font-serif text-2xl font-semibold text-[#f6e3b0]">Bộ sưu tập chuyên đề</span>
              <span className="mt-3 flex-1 leading-7 text-white/80">
                Tài liệu được gom theo mạch đọc: di tích, kháng chiến, Báo Tây Ninh, Long An cũ và văn hóa đời sống.
              </span>
              <span className="mt-5 text-sm font-semibold text-brass">Mở bộ sưu tập</span>
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
