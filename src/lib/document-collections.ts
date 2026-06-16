import type { Document, DocumentType } from "@/lib/types";
import { normalizeVietnamese } from "@/lib/utils";

export type DocumentCollectionDefinition = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  href: string;
  terms?: string[];
  documentType?: DocumentType;
};

export type DocumentCollection = DocumentCollectionDefinition & {
  documents: Document[];
  count: number;
  summary: string;
};

export const documentCollections: DocumentCollectionDefinition[] = [
  {
    slug: "nui-ba-den",
    eyebrow: "Biểu tượng Tây Ninh",
    title: "Núi Bà Đen, di tích và danh thắng",
    description: "Tập hợp tư liệu về Núi Bà Đen, di tích, địa danh và những biểu tượng quen thuộc của vùng đất Tây Ninh.",
    image: "/images/nui-ba-den-may-phu.jpg",
    href: "/tai-lieu?q=nui%20ba%20den",
    terms: ["nui ba den", "ba den", "danh thang", "di tich", "dia danh", "toa thanh", "cao dai"]
  },
  {
    slug: "lich-su-khang-chien",
    eyebrow: "Lịch sử địa phương",
    title: "Căn cứ, kháng chiến và ký ức cách mạng",
    description: "Đi theo các tư liệu về căn cứ, lực lượng vũ trang, chiến thắng, truyền thống cách mạng và lịch sử Đảng bộ địa phương.",
    image: "/images/maps/tay-ninh-cu.jpg",
    href: "/tai-lieu?q=khang%20chien",
    terms: ["khang chien", "can cu", "chien thang", "cach mang", "luc luong vu trang", "dang bo", "truyen thong"]
  },
  {
    slug: "dia-chi-xa-phuong",
    eyebrow: "Địa chí cơ sở",
    title: "Địa chí xã/phường",
    description: "Các tài liệu địa chí, lịch sử xã, phường, địa danh, di tích và tư liệu liên quan đến từng đơn vị hành chính.",
    image: "/images/maps/tay-ninh-moi-2025.jpg",
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
    href: "/tai-lieu?q=long%20an",
    terms: ["long an", "tan an", "ben luc", "can duoc", "can giuoc", "duc hoa", "duc hue", "moc hoa", "kien tuong"]
  },
  {
    slug: "van-hoa-doi-song",
    eyebrow: "Văn hóa bản địa",
    title: "Văn hóa, tín ngưỡng và đời sống",
    description: "Khám phá tư liệu về sinh hoạt cộng đồng, tôn giáo, phong tục, làng nghề và những lớp ký ức đời sống.",
    image: "/images/nui-ba-den-may-phu.jpg",
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

export function documentMatchesCollection(collection: DocumentCollectionDefinition, document: Document) {
  if (collection.documentType && document.documentType === collection.documentType) {
    return true;
  }

  const searchText = documentSearchText(document);
  return (collection.terms || []).map((term) => normalizeVietnamese(term)).some((term) => searchText.includes(term));
}

export function documentsForCollection(collection: DocumentCollectionDefinition, documents: Document[]) {
  return documents
    .filter((document) => documentMatchesCollection(collection, document))
    .sort((left, right) => right.year - left.year || right.createdAt.localeCompare(left.createdAt));
}

export function collectionTypeSummary(documents: Document[]) {
  const diaChi = documents.filter((document) => document.documentType === "dia_chi").length;
  const bao = documents.filter((document) => document.documentType === "bao_tay_ninh").length;
  const capTinh = documents.filter((document) => document.documentType === "tai_lieu_cap_tinh").length;

  return [
    diaChi ? `${diaChi} địa chí` : "",
    bao ? `${bao} báo chí` : "",
    capTinh ? `${capTinh} cấp tỉnh` : ""
  ]
    .filter(Boolean)
    .join(" · ");
}

export function getCollectionsWithDocuments(documents: Document[]): DocumentCollection[] {
  return documentCollections.map((collection) => {
    const matchedDocuments = documentsForCollection(collection, documents);
    return {
      ...collection,
      documents: matchedDocuments,
      count: matchedDocuments.length,
      summary: collectionTypeSummary(matchedDocuments)
    };
  });
}

export function getCollectionsForDocument(document: Document) {
  return documentCollections.filter((collection) => documentMatchesCollection(collection, document));
}
