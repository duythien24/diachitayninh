import type { Commune, CommuneType, Document } from "@/lib/types";
import { slugify } from "@/lib/utils";

const communeNames: Array<{ name: string; type: CommuneType }> = [
  { name: "Hưng Điền", type: "xa" },
  { name: "Vĩnh Thạnh", type: "xa" },
  { name: "Tân Hưng", type: "xa" },
  { name: "Vĩnh Châu", type: "xa" },
  { name: "Tuyên Bình", type: "xa" },
  { name: "Vĩnh Hưng", type: "xa" },
  { name: "Khánh Hưng", type: "xa" },
  { name: "Tuyên Thạnh", type: "xa" },
  { name: "Bình Hiệp", type: "xa" },
  { name: "Bình Hòa", type: "xa" },
  { name: "Mộc Hóa", type: "xa" },
  { name: "Hậu Thạnh", type: "xa" },
  { name: "Nhơn Hòa Lập", type: "xa" },
  { name: "Nhơn Ninh", type: "xa" },
  { name: "Tân Thạnh", type: "xa" },
  { name: "Bình Thành", type: "xa" },
  { name: "Thạnh Phước", type: "xa" },
  { name: "Thạnh Hóa", type: "xa" },
  { name: "Tân Tây", type: "xa" },
  { name: "Thủ Thừa", type: "xa" },
  { name: "Mỹ An", type: "xa" },
  { name: "Mỹ Thạnh", type: "xa" },
  { name: "Tân Long", type: "xa" },
  { name: "Mỹ Quý", type: "xa" },
  { name: "Đông Thành", type: "xa" },
  { name: "Đức Huệ", type: "xa" },
  { name: "An Ninh", type: "xa" },
  { name: "Hiệp Hòa", type: "xa" },
  { name: "Hậu Nghĩa", type: "xa" },
  { name: "Hòa Khánh", type: "xa" },
  { name: "Đức Lập", type: "xa" },
  { name: "Mỹ Hạnh", type: "xa" },
  { name: "Đức Hòa", type: "xa" },
  { name: "Thạnh Lợi", type: "xa" },
  { name: "Bình Đức", type: "xa" },
  { name: "Lương Hòa", type: "xa" },
  { name: "Bến Lức", type: "xa" },
  { name: "Mỹ Yên", type: "xa" },
  { name: "Long Cang", type: "xa" },
  { name: "Rạch Kiến", type: "xa" },
  { name: "Mỹ Lệ", type: "xa" },
  { name: "Tân Lân", type: "xa" },
  { name: "Cần Đước", type: "xa" },
  { name: "Long Hựu", type: "xa" },
  { name: "Phước Lý", type: "xa" },
  { name: "Mỹ Lộc", type: "xa" },
  { name: "Cần Giuộc", type: "xa" },
  { name: "Phước Vĩnh Tây", type: "xa" },
  { name: "Tân Tập", type: "xa" },
  { name: "Vàm Cỏ", type: "xa" },
  { name: "Tân Trụ", type: "xa" },
  { name: "Nhựt Tảo", type: "xa" },
  { name: "Thuận Mỹ", type: "xa" },
  { name: "An Lục Long", type: "xa" },
  { name: "Tầm Vu", type: "xa" },
  { name: "Vĩnh Công", type: "xa" },
  { name: "Phước Chỉ", type: "xa" },
  { name: "Hưng Thuận", type: "xa" },
  { name: "Thạnh Đức", type: "xa" },
  { name: "Phước Thạnh", type: "xa" },
  { name: "Truông Mít", type: "xa" },
  { name: "Lộc Ninh", type: "xa" },
  { name: "Cầu Khởi", type: "xa" },
  { name: "Dương Minh Châu", type: "xa" },
  { name: "Tân Đông", type: "xa" },
  { name: "Tân Châu", type: "xa" },
  { name: "Tân Phú", type: "xa" },
  { name: "Tân Hội", type: "xa" },
  { name: "Tân Thành", type: "xa" },
  { name: "Tân Hòa", type: "xa" },
  { name: "Tân Lập", type: "xa" },
  { name: "Tân Biên", type: "xa" },
  { name: "Thạnh Bình", type: "xa" },
  { name: "Trà Vong", type: "xa" },
  { name: "Phước Vinh", type: "xa" },
  { name: "Hòa Hội", type: "xa" },
  { name: "Ninh Điền", type: "xa" },
  { name: "Châu Thành", type: "xa" },
  { name: "Hảo Đước", type: "xa" },
  { name: "Long Chữ", type: "xa" },
  { name: "Long Thuận", type: "xa" },
  { name: "Bến Cầu", type: "xa" },
  { name: "Kiến Tường", type: "phuong" },
  { name: "Long An", type: "phuong" },
  { name: "Tân An", type: "phuong" },
  { name: "Khánh Hậu", type: "phuong" },
  { name: "Tân Ninh", type: "phuong" },
  { name: "Bình Minh", type: "phuong" },
  { name: "Ninh Thạnh", type: "phuong" },
  { name: "Long Hoa", type: "phuong" },
  { name: "Hòa Thành", type: "phuong" },
  { name: "Thanh Điền", type: "phuong" },
  { name: "Trảng Bàng", type: "phuong" },
  { name: "An Tịnh", type: "phuong" },
  { name: "Gò Dầu", type: "phuong" },
  { name: "Gia Lộc", type: "phuong" }
];

export const communes: Commune[] = communeNames.map((commune, index) => ({
  id: String(index + 1).padStart(3, "0"),
  name: commune.name,
  type: commune.type,
  districtOld: "Đơn vị hành chính sau sắp xếp năm 2025",
  description:
    "Hồ sơ địa chí đang được số hóa theo từng đợt. Giai đoạn đầu ưu tiên bản đọc thử, thông tin nguồn và hướng dẫn liên hệ thư viện.",
  slug: slugify(commune.name)
}));

const coverBase =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ch%C3%B9a_B%C3%A0_v%C3%A0_c%E1%BA%A3nh_ch%C3%A2n_tr%E1%BB%9Di%2C_KDL_N%C3%BAi_B%C3%A0_%C4%90en.jpg?width=900";

export const documents: Document[] = [
  {
    id: "doc-001",
    title: "Địa chí xã Tân Biên - bản đọc tham khảo",
    slug: "dia-chi-xa-tan-bien-preview",
    documentType: "dia_chi",
    communeId: "072",
    year: 2024,
    description:
      "Bản preview 10 trang phục vụ tra cứu nhanh thông tin lịch sử, địa danh và tư liệu địa phương.",
    source: "Thư viện tỉnh Tây Ninh",
    previewFileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    coverImageUrl: coverBase,
    isPreviewOnly: true,
    contactNote: "Vui lòng liên hệ thư viện để đọc bản đầy đủ.",
    createdAt: "2026-05-26"
  },
  {
    id: "doc-002",
    title: "Địa chí phường Tân Ninh - bản đọc tham khảo",
    slug: "dia-chi-phuong-tan-ninh-preview",
    documentType: "dia_chi",
    communeId: "087",
    year: 2024,
    description:
      "Tập tư liệu địa chí dạng scan, có watermark và chỉ công bố phần đọc thử.",
    source: "Thư viện tỉnh Tây Ninh",
    previewFileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    coverImageUrl: coverBase,
    isPreviewOnly: true,
    contactNote: "Bản đầy đủ được phục vụ theo quy định của thư viện.",
    createdAt: "2026-05-26"
  },
  {
    id: "doc-003",
    title: "Địa chí phường Trảng Bàng - bản đọc tham khảo",
    slug: "dia-chi-phuong-trang-bang-preview",
    documentType: "dia_chi",
    communeId: "093",
    year: 2024,
    description:
      "Bản mẫu dùng kiểm thử luồng chọn xã/phường, xem chi tiết tài liệu và đọc online.",
    source: "Thư viện tỉnh Tây Ninh",
    previewFileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    coverImageUrl: coverBase,
    isPreviewOnly: true,
    contactNote: "Liên hệ thư viện để được hướng dẫn khai thác bản đầy đủ.",
    createdAt: "2026-05-26"
  },
  {
    id: "doc-004",
    title: "Báo Tây Ninh số chuyên đề văn hóa địa phương",
    slug: "bao-tay-ninh-van-hoa-dia-phuong-preview",
    documentType: "bao_tay_ninh",
    year: 2024,
    description:
      "Bản preview số báo phục vụ tra cứu di sản, nhân vật, sự kiện và đời sống văn hóa Tây Ninh.",
    source: "Báo Tây Ninh",
    previewFileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    coverImageUrl: coverBase,
    isPreviewOnly: true,
    contactNote: "Liên hệ thư viện để đọc số đầy đủ hoặc bản lưu trữ.",
    createdAt: "2026-05-26"
  },
  {
    id: "doc-005",
    title: "Báo Tây Ninh - tuyển chọn bài viết lịch sử",
    slug: "bao-tay-ninh-tuyen-chon-lich-su-preview",
    documentType: "bao_tay_ninh",
    year: 2023,
    description:
      "Tuyển chọn bản đọc thử các bài viết liên quan lịch sử địa phương và nhân chứng.",
    source: "Báo Tây Ninh",
    previewFileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    coverImageUrl: coverBase,
    isPreviewOnly: true,
    contactNote: "Không upload bản full lên website public.",
    createdAt: "2026-05-26"
  }
];

export function getCommuneBySlug(slug: string) {
  return communes.find((commune) => commune.slug === slug);
}

export function getCommuneById(id?: string) {
  return communes.find((commune) => commune.id === id);
}

export function getDocumentsByCommune(communeId: string) {
  return documents.filter((document) => document.communeId === communeId);
}

export function getDocumentBySlug(slug: string) {
  return documents.find((document) => document.slug === slug);
}
