import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Building2,
  Compass,
  FileText,
  Library,
  MapPinned,
  Newspaper,
  Route,
  Sparkles
} from "lucide-react";

import { DocumentCard } from "@/components/document-card";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getDocuments } from "@/lib/repository";
import type { Document, DocumentType } from "@/lib/types";
import { normalizeVietnamese } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bộ sưu tập chuyên đề",
  description: "Các lối đọc chuyên đề giúp bạn đọc khám phá tài liệu địa chí, báo chí và tư liệu địa phương Tây Ninh dễ hơn."
};

type Collection = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  icon: typeof BookOpen;
  href: string;
  terms?: string[];
  documentType?: DocumentType;
};

const collections: Collection[] = [
  {
    slug: "nui-ba-den",
    eyebrow: "Biểu tượng Tây Ninh",
    title: "Núi Bà Đen, di tích và danh thắng",
    description: "Tập hợp tư liệu về Núi Bà Đen, di tích, địa danh và những biểu tượng quen thuộc của vùng đất Tây Ninh.",
    image: "/images/nui-ba-den-may-phu.jpg",
    icon: MapPinned,
    href: "/tai-lieu?q=nui%20ba%20den",
    terms: ["nui ba den", "ba den", "danh thang", "di tich", "dia danh", "toa thanh", "cao dai"]
  },
  {
    slug: "lich-su-khang-chien",
    eyebrow: "Lịch sử địa phương",
    title: "Căn cứ, kháng chiến và ký ức cách mạng",
    description: "Đi theo các tư liệu về căn cứ, lực lượng vũ trang, chiến thắng, truyền thống cách mạng và lịch sử Đảng bộ địa phương.",
    image: "/images/maps/tay-ninh-cu.jpg",
    icon: Route,
    href: "/tai-lieu?q=khang%20chien",
    terms: ["khang chien", "can cu", "chien thang", "cach mang", "luc luong vu trang", "dang bo", "truyen thong"]
  },
  {
    slug: "dia-chi-xa-phuong",
    eyebrow: "Địa chí cơ sở",
    title: "Địa chí xã/phường",
    description: "Các tài liệu địa chí, lịch sử xã, phường, địa danh, di tích và tư liệu liên quan đến từng đơn vị hành chính.",
    image: "/images/maps/tay-ninh-moi-2025.jpg",
    icon: Building2,
    href: "/tai-lieu?loai=dia_chi",
    documentType: "dia_chi",
    terms: ["dia chi", "lich su xa", "phuong", "xa"]
  },
  {
    slug: "bao-tay-ninh",
    eyebrow: "Báo chí địa phương",
    title: "Báo Tây Ninh và nhịp sống địa phương",
    description: "Mở các số báo, chuyên đề báo chí và bài viết địa phương đã được số hóa để nhìn lại sự kiện theo dòng thời sự.",
    image: "/images/maps/tay-ninh-moi-2025.jpg",
    icon: Newspaper,
    href: "/tai-lieu?loai=bao_tay_ninh",
    documentType: "bao_tay_ninh",
    terms: ["bao tay ninh", "bao chi", "thoi su", "chuyen de"]
  },
  {
    slug: "long-an-cu",
    eyebrow: "Không gian sau sáp nhập",
    title: "Tư liệu Long An cũ trong tỉnh Tây Ninh mới",
    description: "Gợi mở tài liệu gắn với Long An cũ, các địa danh và vùng đất nay thuộc không gian tỉnh Tây Ninh sau sáp nhập.",
    image: "/images/maps/long-an-cu.jpg",
    icon: Compass,
    href: "/tai-lieu?q=long%20an",
    terms: ["long an", "tan an", "ben luc", "can duoc", "can giuoc", "duc hoa", "duc hue", "moc hoa", "kien tuong"]
  },
  {
    slug: "van-hoa-doi-song",
    eyebrow: "Văn hóa bản địa",
    title: "Văn hóa, tín ngưỡng và đời sống",
    description: "Khám phá tư liệu về sinh hoạt cộng đồng, tôn giáo, phong tục, làng nghề và những lớp ký ức đời sống.",
    image: "/images/nui-ba-den-may-phu.jpg",
    icon: Sparkles,
    href: "/tai-lieu?q=van%20hoa",
    terms: ["van hoa", "doi song", "cao dai", "tin nguong", "phong tuc", "lang nghe", "am thuc", "dan ca"]
  }
];

function documentSearchText(document: Document) {
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

function documentsForCollection(collection: Collection, documents: Document[]) {
  const normalizedTerms = (collection.terms || []).map((term) => normalizeVietnamese(term));

  return documents
    .filter((document) => {
      if (collection.documentType && document.documentType === collection.documentType) {
        return true;
      }

      const searchText = documentSearchText(document);
      return normalizedTerms.some((term) => searchText.includes(term));
    })
    .sort((left, right) => right.year - left.year || right.createdAt.localeCompare(left.createdAt));
}

function typeSummary(documents: Document[]) {
  const diaChi = documents.filter((document) => document.documentType === "dia_chi").length;
  const bao = documents.filter((document) => document.documentType === "bao_tay_ninh").length;
  const capTinh = documents.filter((document) => document.documentType === "tai_lieu_cap_tinh").length;
  return [
    diaChi ? `${diaChi} địa chí` : "",
    bao ? `${bao} báo chí` : "",
    capTinh ? `${capTinh} cấp tỉnh` : ""
  ].filter(Boolean).join(" · ");
}

export default async function CollectionsPage() {
  const documents = await getDocuments();
  const collectionsWithDocuments = collections.map((collection) => {
    const matchedDocuments = documentsForCollection(collection, documents);
    return {
      ...collection,
      documents: matchedDocuments,
      count: matchedDocuments.length,
      summary: typeSummary(matchedDocuments)
    };
  });
  const firstCollection = collectionsWithDocuments.find((collection) => collection.count > 0) || collectionsWithDocuments[0];
  const suggestedDocuments = firstCollection.documents.slice(0, 3);

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Bộ sưu tập"
        title="Khám phá tài liệu theo chuyên đề"
        description="Các bộ sưu tập giúp bạn đọc bắt đầu từ một câu chuyện quen thuộc, rồi mở rộng sang tài liệu địa chí, báo chí và tư liệu cấp tỉnh liên quan."
      />

      <section className="mt-8 overflow-hidden rounded border border-ink/10 bg-ink text-white shadow-soft">
        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1 text-sm font-semibold text-white/82">
              <BookMarked className="h-4 w-4" aria-hidden="true" />
              Lối đọc gợi ý
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">Không cần nhớ tên tài liệu, hãy chọn một chủ đề.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/72">
              Mỗi bộ sưu tập tự gom tài liệu theo từ khóa, loại tài liệu và nội dung mô tả. Khi kho tư liệu được cập nhật, số lượng trong từng
              chuyên đề cũng thay đổi theo.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded border border-white/12 bg-white/8 p-4">
                <FileText className="h-5 w-5 text-brass" aria-hidden="true" />
                <p className="mt-3 text-2xl font-semibold">{documents.length}</p>
                <p className="mt-1 text-sm text-white/62">tài liệu trong kho</p>
              </div>
              <div className="rounded border border-white/12 bg-white/8 p-4">
                <Library className="h-5 w-5 text-brass" aria-hidden="true" />
                <p className="mt-3 text-2xl font-semibold">{collections.length}</p>
                <p className="mt-1 text-sm text-white/62">bộ sưu tập</p>
              </div>
              <div className="rounded border border-white/12 bg-white/8 p-4">
                <BookOpen className="h-5 w-5 text-brass" aria-hidden="true" />
                <p className="mt-3 text-2xl font-semibold">{collectionsWithDocuments.filter((item) => item.count > 0).length}</p>
                <p className="mt-1 text-sm text-white/62">chủ đề có dữ liệu</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[360px] bg-white/5">
            <Image src={firstCollection.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-68" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/42 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-brass">{firstCollection.eyebrow}</p>
              <h3 className="mt-2 max-w-xl text-2xl font-semibold leading-snug text-white">{firstCollection.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">{firstCollection.description}</p>
              <Link
                href={firstCollection.href}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded bg-brass px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brass/90"
              >
                Mở chuyên đề
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {collectionsWithDocuments.map((collection) => {
          const Icon = collection.icon;
          return (
            <article key={collection.slug} className="flex h-full min-h-[420px] flex-col overflow-hidden rounded border border-ink/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-palm/30 hover:shadow-soft">
              <div className="relative aspect-[16/9] bg-paper">
                <Image src={collection.image} alt="" fill sizes="(min-width: 1280px) 33vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/58 to-transparent" />
                <span className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded bg-white/94 text-palm shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="absolute bottom-4 right-4 rounded bg-ink/82 px-3 py-1.5 text-xs font-semibold text-white">
                  {collection.count} tài liệu
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">{collection.eyebrow}</p>
                <h2 className="mt-2 text-xl font-semibold leading-snug text-ink">{collection.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/66">{collection.description}</p>
                {collection.summary ? <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/48">{collection.summary}</p> : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link
                    href={collection.href}
                    className="inline-flex min-h-10 items-center gap-2 rounded bg-palm px-3 py-2 text-sm font-semibold text-white transition hover:bg-palm/90"
                  >
                    Khám phá
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  {collection.documents[0] ? (
                    <Link
                      href={`/tai-lieu/${collection.documents[0].slug}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded border border-ink/12 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
                    >
                      Tài liệu gợi ý
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {suggestedDocuments.length ? (
        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Đọc thử từ bộ sưu tập</p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">{firstCollection.title}</h2>
            </div>
            <Link
              href={firstCollection.href}
              className="inline-flex min-h-11 items-center gap-2 rounded border border-ink/12 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
            >
              Xem toàn bộ chuyên đề
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {suggestedDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 rounded border border-ink/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Gợi ý phát triển tiếp</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Sau này có thể cho quản trị tự tạo bộ sưu tập</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/68">
          Bản hiện tại dùng bộ sưu tập tự động theo từ khóa để triển khai nhanh. Khi kho tài liệu lớn hơn, có thể thêm bảng quản trị riêng để đặt
          ảnh bìa, mô tả, thứ tự và danh sách tài liệu thủ công cho từng chuyên đề.
        </p>
      </section>
    </PageShell>
  );
}
