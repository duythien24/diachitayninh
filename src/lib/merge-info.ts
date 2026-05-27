export type CommuneMergeInfo = {
  clauseNumber: number;
  oldUnits?: string[];
  note: string;
  sourceLabel: string;
  sourceUrl: string;
};

const sourceLabel = "Nghị quyết 1682/NQ-UBTVQH15 năm 2025";
const sourceUrl = "https://congbao.chinhphu.vn/van-ban/nghi-quyet-so-1682-nq-ubtvqh15-45138.htm";

export const communeMergeInfoBySlug: Record<string, CommuneMergeInfo> = {
  "hung-dien": {
    clauseNumber: 1,
    note: "Theo khoản 1 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Hưng Hà, Hưng Điền B và Hưng Điền thành xã mới có tên gọi là xã Hưng Điền.",
    sourceLabel,
    sourceUrl
  },
  "vinh-thanh": {
    clauseNumber: 2,
    note: "Theo khoản 2 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Thạnh Hưng (huyện Tân Hưng), Vĩnh Châu B và Hưng Thạnh thành xã mới có tên gọi là xã Vĩnh Thạnh.",
    sourceLabel,
    sourceUrl
  },
  "tan-hung": {
    clauseNumber: 3,
    note: "Theo khoản 3 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Tân Hưng, xã Vĩnh Thạnh và xã Vĩnh Lợi thành xã mới có tên gọi là xã Tân Hưng.",
    sourceLabel,
    sourceUrl
  },
  "vinh-chau": {
    clauseNumber: 4,
    note: "Theo khoản 4 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Vĩnh Đại, Vĩnh Bửu và Vĩnh Châu A thành xã mới có tên gọi là xã Vĩnh Châu.",
    sourceLabel,
    sourceUrl
  },
  "tuyen-binh": {
    clauseNumber: 5,
    note: "Theo khoản 5 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tuyên Bình, xã Tuyên Bình Tây và một phần diện tích tự nhiên, quy mô dân số của các xã Vĩnh Bình, Vĩnh Thuận, Thái Bình Trung thành xã mới có tên gọi là xã Tuyên Bình.",
    sourceLabel,
    sourceUrl
  },
  "vinh-hung": {
    clauseNumber: 6,
    note: "Theo khoản 6 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Vĩnh Hưng, một phần diện tích tự nhiên, quy mô dân số các xã Vĩnh Trị, Thái Trị, Khánh Hưng, Thái Bình Trung và phần còn lại của các xã Vĩnh Thuận, Vĩnh Bình sau khi sắp xếp theo quy định tại khoản 5 Điều này thành xã mới có tên gọi là xã Vĩnh Hưng.",
    sourceLabel,
    sourceUrl
  },
  "khanh-hung": {
    clauseNumber: 7,
    note: "Theo khoản 7 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Hưng Điền A, phần còn lại của xã Thái Bình Trung sau khi sắp xếp theo quy định tại khoản 5 và khoản 6 Điều này và phần còn lại của các xã Vĩnh Trị, Thái Trị, Khánh Hưng sau khi sắp xếp theo quy định tại khoản 6 Điều này thành xã mới có tên gọi là xã Khánh Hưng.",
    sourceLabel,
    sourceUrl
  },
  "tuyen-thanh": {
    clauseNumber: 8,
    note: "Theo khoản 8 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Thạnh Hưng (thị xã Kiến Tường), xã Tuyên Thạnh và một phần diện tích tự nhiên, quy mô dân số của xã Bắc Hòa thành xã mới có tên gọi là xã Tuyên Thạnh.",
    sourceLabel,
    sourceUrl
  },
  "binh-hiep": {
    clauseNumber: 9,
    note: "Theo khoản 9 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Thạnh Trị, Bình Tân, Bình Hòa Tây và Bình Hiệp thành xã mới có tên gọi là xã Bình Hiệp.",
    sourceLabel,
    sourceUrl
  },
  "binh-hoa": {
    clauseNumber: 10,
    note: "Theo khoản 10 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Bình Thạnh (huyện Mộc Hóa), Bình Hòa Đông và Bình Hòa Trung thành xã mới có tên gọi là xã Bình Hòa.",
    sourceLabel,
    sourceUrl
  },
  "moc-hoa": {
    clauseNumber: 11,
    note: "Theo khoản 11 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Thành và xã Tân Lập (huyện Mộc Hóa), thị trấn Bình Phong Thạnh thành xã mới có tên gọi là xã Mộc Hóa.",
    sourceLabel,
    sourceUrl
  },
  "hau-thanh": {
    clauseNumber: 12,
    note: "Theo khoản 12 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Hậu Thạnh Đông, xã Hậu Thạnh Tây và phần còn lại của xã Bắc Hòa sau khi sắp xếp theo quy định tại khoản 8 Điều này thành xã mới có tên gọi là xã Hậu Thạnh.",
    sourceLabel,
    sourceUrl
  },
  "nhon-hoa-lap": {
    clauseNumber: 13,
    note: "Theo khoản 13 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Tân Lập (huyện Tân Thạnh), Nhơn Hòa và Nhơn Hòa Lập thành xã mới có tên gọi là xã Nhơn Hòa Lập.",
    sourceLabel,
    sourceUrl
  },
  "nhon-ninh": {
    clauseNumber: 14,
    note: "Theo khoản 14 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Tân Thành (huyện Tân Thạnh), Tân Ninh và Nhơn Ninh thành xã mới có tên gọi là xã Nhơn Ninh.",
    sourceLabel,
    sourceUrl
  },
  "tan-thanh": {
    clauseNumber: 15,
    note: "Theo khoản 15 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Bình và xã Tân Hòa (huyện Tân Thạnh), xã Kiến Bình, thị trấn Tân Thạnh thành xã mới có tên gọi là xã Tân Thạnh.",
    sourceLabel,
    sourceUrl
  },
  "binh-thanh": {
    clauseNumber: 16,
    note: "Theo khoản 16 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Tân Hiệp (huyện Thạnh Hóa), Thuận Bình và Bình Hòa Hưng thành xã mới có tên gọi là xã Bình Thành.",
    sourceLabel,
    sourceUrl
  },
  "thanh-phuoc": {
    clauseNumber: 17,
    note: "Theo khoản 17 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Thuận Nghĩa Hòa, Thạnh Phú và Thạnh Phước thành xã mới có tên gọi là xã Thạnh Phước.",
    sourceLabel,
    sourceUrl
  },
  "thanh-hoa": {
    clauseNumber: 18,
    note: "Theo khoản 18 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Thạnh Hóa, xã Thủy Tây và xã Thạnh An thành xã mới có tên gọi là xã Thạnh Hóa.",
    sourceLabel,
    sourceUrl
  },
  "tan-tay": {
    clauseNumber: 19,
    note: "Theo khoản 19 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Tân Đông (huyện Thạnh Hóa), Thủy Đông và Tân Tây thành xã mới có tên gọi là xã Tân Tây.",
    sourceLabel,
    sourceUrl
  },
  "thu-thua": {
    clauseNumber: 20,
    note: "Theo khoản 20 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Thủ Thừa, một phần diện tích tự nhiên, quy mô dân số của xã Bình Thạnh và xã Tân Thành (huyện Thủ Thừa), xã Nhị Thành thành xã mới có tên gọi là xã Thủ Thừa.",
    sourceLabel,
    sourceUrl
  },
  "my-an": {
    clauseNumber: 21,
    note: "Theo khoản 21 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Mỹ Phú và xã Mỹ An thành xã mới có tên gọi là xã Mỹ An.",
    sourceLabel,
    sourceUrl
  },
  "my-thanh": {
    clauseNumber: 22,
    note: "Theo khoản 22 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Bình An, Mỹ Lạc, Mỹ Thạnh và phần còn lại của xã Tân Thành (huyện Thủ Thừa) sau khi sắp xếp theo quy định tại khoản 20 Điều này thành xã mới có tên gọi là xã Mỹ Thạnh.",
    sourceLabel,
    sourceUrl
  },
  "tan-long": {
    clauseNumber: 23,
    note: "Theo khoản 23 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Long Thuận (huyện Thủ Thừa), Long Thạnh và Tân Long thành xã mới có tên gọi là xã Tân Long.",
    sourceLabel,
    sourceUrl
  },
  "my-quy": {
    clauseNumber: 24,
    note: "Theo khoản 24 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Mỹ Thạnh Bắc, Mỹ Quý Đông và Mỹ Quý Tây thành xã mới có tên gọi là xã Mỹ Quý.",
    sourceLabel,
    sourceUrl
  },
  "dong-thanh": {
    clauseNumber: 25,
    note: "Theo khoản 25 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Đông Thành và các xã Mỹ Thạnh Tây, Mỹ Thạnh Đông, Mỹ Bình thành xã mới có tên gọi là xã Đông Thành.",
    sourceLabel,
    sourceUrl
  },
  "duc-hue": {
    clauseNumber: 26,
    note: "Theo khoản 26 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của của các xã Bình Hòa Bắc, Bình Hòa Nam và Bình Thành thành xã mới có tên gọi là xã Đức Huệ.",
    sourceLabel,
    sourceUrl
  },
  "an-ninh": {
    clauseNumber: 27,
    note: "Theo khoản 27 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Lộc Giang, An Ninh Đông và An Ninh Tây thành xã mới có tên gọi là xã An Ninh.",
    sourceLabel,
    sourceUrl
  },
  "hiep-hoa": {
    clauseNumber: 28,
    note: "Theo khoản 28 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Phú (huyện Đức Hòa), xã Hiệp Hòa và thị trấn Hiệp Hòa thành xã mới có tên gọi là xã Hiệp Hòa.",
    sourceLabel,
    sourceUrl
  },
  "hau-nghia": {
    clauseNumber: 29,
    note: "Theo khoản 29 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Hậu Nghĩa, xã Đức Lập Thượng và xã Tân Mỹ thành xã mới có tên gọi là xã Hậu Nghĩa.",
    sourceLabel,
    sourceUrl
  },
  "hoa-khanh": {
    clauseNumber: 30,
    note: "Theo khoản 30 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Hòa Khánh Tây, Hòa Khánh Nam và Hòa Khánh Đông thành xã mới có tên gọi là xã Hòa Khánh.",
    sourceLabel,
    sourceUrl
  },
  "duc-lap": {
    clauseNumber: 31,
    note: "Theo khoản 31 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Đức Lập Hạ, xã Mỹ Hạnh Bắc và một phần diện tích tự nhiên, quy mô dân số của xã Đức Hòa Thượng thành xã mới có tên gọi là xã Đức Lập.",
    sourceLabel,
    sourceUrl
  },
  "my-hanh": {
    clauseNumber: 32,
    note: "Theo khoản 32 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Đức Hòa Đông, xã Mỹ Hạnh Nam và phần còn lại của xã Đức Hòa Thượng sau khi sắp xếp theo quy định tại khoản 31 Điều này thành xã mới có tên gọi là xã Mỹ Hạnh.",
    sourceLabel,
    sourceUrl
  },
  "duc-hoa": {
    clauseNumber: 33,
    note: "Theo khoản 33 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Đức Hòa, xã Hựu Thạnh và xã Đức Hòa Hạ thành xã mới có tên gọi là xã Đức Hòa.",
    sourceLabel,
    sourceUrl
  },
  "thanh-loi": {
    clauseNumber: 34,
    note: "Theo khoản 34 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Thạnh Hòa, Lương Bình và Thạnh Lợi thành xã mới có tên gọi là xã Thạnh Lợi.",
    sourceLabel,
    sourceUrl
  },
  "binh-duc": {
    clauseNumber: 35,
    note: "Theo khoản 35 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Thạnh Đức (huyện Bến Lức), Nhựt Chánh và Bình Đức thành xã mới có tên gọi là xã Bình Đức.",
    sourceLabel,
    sourceUrl
  },
  "luong-hoa": {
    clauseNumber: 36,
    note: "Theo khoản 36 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Bửu và xã Lương Hòa thành xã mới có tên gọi là xã Lương Hòa.",
    sourceLabel,
    sourceUrl
  },
  "ben-luc": {
    clauseNumber: 37,
    note: "Theo khoản 37 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã An Thạnh (huyện Bến Lức), xã Thanh Phú và thị trấn Bến Lức thành xã mới có tên gọi là xã Bến Lức.",
    sourceLabel,
    sourceUrl
  },
  "my-yen": {
    clauseNumber: 38,
    note: "Theo khoản 38 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Long Hiệp, Phước Lợi và Mỹ Yên thành xã mới có tên gọi là xã Mỹ Yên.",
    sourceLabel,
    sourceUrl
  },
  "long-cang": {
    clauseNumber: 39,
    note: "Theo khoản 39 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Long Định, Phước Vân và Long Cang thành xã mới có tên gọi là xã Long Cang.",
    sourceLabel,
    sourceUrl
  },
  "rach-kien": {
    clauseNumber: 40,
    note: "Theo khoản 40 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Long Trạch, Long Khê và Long Hòa thành xã mới có tên gọi là xã Rạch Kiến.",
    sourceLabel,
    sourceUrl
  },
  "my-le": {
    clauseNumber: 41,
    note: "Theo khoản 41 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Tân Trạch, Long Sơn và Mỹ Lệ thành xã mới có tên gọi là xã Mỹ Lệ.",
    sourceLabel,
    sourceUrl
  },
  "tan-lan": {
    clauseNumber: 42,
    note: "Theo khoản 42 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Phước Đông (huyện Cần Đước) và xã Tân Lân thành xã mới có tên gọi là xã Tân Lân.",
    sourceLabel,
    sourceUrl
  },
  "can-duoc": {
    clauseNumber: 43,
    note: "Theo khoản 43 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Cần Đước và các xã Phước Tuy, Tân Ân, Tân Chánh thành xã mới có tên gọi là xã Cần Đước.",
    sourceLabel,
    sourceUrl
  },
  "long-huu": {
    clauseNumber: 44,
    note: "Theo khoản 44 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Long Hựu Đông và xã Long Hựu Tây thành xã mới có tên gọi là xã Long Hựu.",
    sourceLabel,
    sourceUrl
  },
  "phuoc-ly": {
    clauseNumber: 45,
    note: "Theo khoản 45 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Long Thượng, Phước Hậu và Phước Lý thành xã mới có tên gọi là xã Phước Lý.",
    sourceLabel,
    sourceUrl
  },
  "my-loc": {
    clauseNumber: 46,
    note: "Theo khoản 46 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Phước Lâm, Thuận Thành và Mỹ Lộc thành xã mới có tên gọi là xã Mỹ Lộc.",
    sourceLabel,
    sourceUrl
  },
  "can-giuoc": {
    clauseNumber: 47,
    note: "Theo khoản 47 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Cần Giuộc, xã Phước Lại và xã Long Hậu thành xã mới có tên gọi là xã Cần Giuộc.",
    sourceLabel,
    sourceUrl
  },
  "phuoc-vinh-tay": {
    clauseNumber: 48,
    note: "Theo khoản 48 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Long An, Long Phụng và Phước Vĩnh Tây thành xã mới có tên gọi là xã Phước Vĩnh Tây.",
    sourceLabel,
    sourceUrl
  },
  "tan-tap": {
    clauseNumber: 49,
    note: "Theo khoản 49 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Đông Thạnh, Phước Vĩnh Đông và Tân Tập thành xã mới có tên gọi là xã Tân Tập.",
    sourceLabel,
    sourceUrl
  },
  "vam-co": {
    clauseNumber: 50,
    note: "Theo khoản 50 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Tân Phước Tây, Nhựt Ninh và Đức Tân thành xã mới có tên gọi là xã Vàm Cỏ.",
    sourceLabel,
    sourceUrl
  },
  "tan-tru": {
    clauseNumber: 51,
    note: "Theo khoản 51 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Tân Trụ và các xã Bình Trinh Đông, Bình Lãng, Bình Tịnh thành xã mới có tên gọi là xã Tân Trụ.",
    sourceLabel,
    sourceUrl
  },
  "nhut-tao": {
    clauseNumber: 52,
    note: "Theo khoản 52 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Tân Bình (huyện Tân Trụ), Quê Mỹ Thạnh, Lạc Tấn và phần còn lại của xã Nhị Thành sau khi sắp xếp theo quy định tại khoản 20 Điều này thành xã mới có tên gọi là xã Nhựt Tảo.",
    sourceLabel,
    sourceUrl
  },
  "thuan-my": {
    clauseNumber: 53,
    note: "Theo khoản 53 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Thanh Phú Long, Thanh Vĩnh Đông và Thuận Mỹ thành xã mới có tên gọi là xã Thuận Mỹ.",
    sourceLabel,
    sourceUrl
  },
  "an-luc-long": {
    clauseNumber: 54,
    note: "Theo khoản 54 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Dương Xuân Hội, Long Trì và An Lục Long thành xã mới có tên gọi là xã An Lục Long.",
    sourceLabel,
    sourceUrl
  },
  "tam-vu": {
    clauseNumber: 55,
    note: "Theo khoản 55 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Tầm Vu và các xã Hiệp Thạnh (huyện Châu Thành), Phú Ngãi Trị, Phước Tân Hưng thành xã mới có tên gọi là xã Tầm Vu.",
    sourceLabel,
    sourceUrl
  },
  "vinh-cong": {
    clauseNumber: 56,
    note: "Theo khoản 56 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Hòa Phú, Bình Quới và Vĩnh Công thành xã mới có tên gọi là xã Vĩnh Công.",
    sourceLabel,
    sourceUrl
  },
  "phuoc-chi": {
    clauseNumber: 57,
    note: "Theo khoản 57 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Phước Bình và xã Phước Chỉ thành xã mới có tên gọi là xã Phước Chỉ.",
    sourceLabel,
    sourceUrl
  },
  "hung-thuan": {
    clauseNumber: 58,
    note: "Theo khoản 58 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Đôn Thuận và xã Hưng Thuận thành xã mới có tên gọi là xã Hưng Thuận.",
    sourceLabel,
    sourceUrl
  },
  "thanh-duc": {
    clauseNumber: 59,
    note: "Theo khoản 59 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Thạnh Đức (huyện Gò Dầu) và xã Cẩm Giang thành xã mới có tên gọi là xã Thạnh Đức.",
    sourceLabel,
    sourceUrl
  },
  "phuoc-thanh": {
    clauseNumber: 60,
    note: "Theo khoản 60 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Hiệp Thạnh (huyện Gò Dầu), Phước Trạch và Phước Thạnh thành xã mới có tên gọi là xã Phước Thạnh.",
    sourceLabel,
    sourceUrl
  },
  "truong-mit": {
    clauseNumber: 61,
    note: "Theo khoản 61 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Bàu Đồn và xã Truông Mít thành xã mới có tên gọi là xã Truông Mít.",
    sourceLabel,
    sourceUrl
  },
  "loc-ninh": {
    clauseNumber: 62,
    note: "Theo khoản 62 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Bến Củi, xã Lộc Ninh và một phần diện tích tự nhiên, quy mô dân số của xã Phước Minh thành xã mới có tên gọi là xã Lộc Ninh.",
    sourceLabel,
    sourceUrl
  },
  "cau-khoi": {
    clauseNumber: 63,
    note: "Theo khoản 63 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Phước Ninh, xã Cầu Khởi và một phần diện tích tự nhiên, quy mô dân số của xã Chà Là thành xã mới có tên gọi là xã Cầu Khởi.",
    sourceLabel,
    sourceUrl
  },
  "duong-minh-chau": {
    clauseNumber: 64,
    note: "Theo khoản 64 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Dương Minh Châu, một phần diện tích tự nhiên, quy mô dân số của xã Phan, xã Suối Đá và phần còn lại của xã Phước Minh sau khi sắp xếp theo quy định tại khoản 62 Điều này thành xã mới có tên gọi là xã Dương Minh Châu.",
    sourceLabel,
    sourceUrl
  },
  "tan-dong": {
    clauseNumber: 65,
    note: "Theo khoản 65 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Đông (huyện Tân Châu) và xã Tân Hà thành xã mới có tên gọi là xã Tân Đông.",
    sourceLabel,
    sourceUrl
  },
  "tan-chau": {
    clauseNumber: 66,
    note: "Theo khoản 66 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Tân Châu, xã Thạnh Đông và một phần diện tích tự nhiên, quy mô dân số của xã Tân Phú (huyện Tân Châu), xã Suối Dây thành xã mới có tên gọi là xã Tân Châu.",
    sourceLabel,
    sourceUrl
  },
  "tan-phu": {
    clauseNumber: 67,
    note: "Theo khoản 67 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Hưng và một phần diện tích tự nhiên, quy mô dân số của các xã Mỏ Công, Trà Vong, Tân Phong và phần còn lại của xã Tân Phú (huyện Tân Châu) sau khi sắp xếp theo quy định tại khoản 66 Điều này thành xã mới có tên gọi là xã Tân Phú.",
    sourceLabel,
    sourceUrl
  },
  "tan-hoi": {
    clauseNumber: 68,
    note: "Theo khoản 68 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Hiệp (huyện Tân Châu) và xã Tân Hội thành xã mới có tên gọi là xã Tân Hội.",
    sourceLabel,
    sourceUrl
  },
  "tan-thanh-2": {
    clauseNumber: 69,
    note: "Theo khoản 69 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Thành (huyện Tân Châu) và phần còn lại của xã Suối Dây sau khi sắp xếp theo quy định tại khoản 66 Điều này thành xã mới có tên gọi là xã Tân Thành.",
    sourceLabel,
    sourceUrl
  },
  "tan-hoa": {
    clauseNumber: 70,
    note: "Theo khoản 70 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Hòa (huyện Tân Châu) và xã Suối Ngô thành xã mới có tên gọi là xã Tân Hòa.",
    sourceLabel,
    sourceUrl
  },
  "tan-lap": {
    clauseNumber: 71,
    note: "Theo khoản 71 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Lập (huyện Tân Biên) và xã Thạnh Bắc thành xã mới có tên gọi là xã Tân Lập.",
    sourceLabel,
    sourceUrl
  },
  "tan-bien": {
    clauseNumber: 72,
    note: "Theo khoản 72 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Tân Bình (huyện Tân Biên), xã Thạnh Tây và thị trấn Tân Biên thành xã mới có tên gọi là xã Tân Biên.",
    sourceLabel,
    sourceUrl
  },
  "thanh-binh": {
    clauseNumber: 73,
    note: "Theo khoản 73 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Thạnh Bình và phần còn lại của xã Tân Phong sau khi sắp xếp theo quy định tại khoản 67 Điều này thành xã mới có tên gọi là xã Thạnh Bình.",
    sourceLabel,
    sourceUrl
  },
  "tra-vong": {
    clauseNumber: 74,
    note: "Theo khoản 74 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp phần còn lại của xã Mỏ Công và xã Trà Vong sau khi sắp xếp theo quy định tại khoản 67 Điều này thành xã mới có tên gọi là xã Trà Vong.",
    sourceLabel,
    sourceUrl
  },
  "phuoc-vinh": {
    clauseNumber: 75,
    note: "Theo khoản 75 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Hòa Hiệp và xã Phước Vinh thành xã mới có tên gọi là xã Phước Vinh.",
    sourceLabel,
    sourceUrl
  },
  "hoa-hoi": {
    clauseNumber: 76,
    note: "Theo khoản 76 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Biên Giới, Hòa Thạnh và Hòa Hội thành xã mới có tên gọi là xã Hòa Hội.",
    sourceLabel,
    sourceUrl
  },
  "ninh-dien": {
    clauseNumber: 77,
    note: "Theo khoản 77 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Thành Long và xã Ninh Điền thành xã mới có tên gọi là xã Ninh Điền.",
    sourceLabel,
    sourceUrl
  },
  "chau-thanh": {
    clauseNumber: 78,
    note: "Theo khoản 78 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Châu Thành, xã Đồng Khởi, xã An Bình và một phần diện tích tự nhiên, quy mô dân số của xã Thái Bình thành xã mới có tên gọi là xã Châu Thành.",
    sourceLabel,
    sourceUrl
  },
  "hao-duoc": {
    clauseNumber: 79,
    note: "Theo khoản 79 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã An Cơ, Trí Bình và Hảo Đước thành xã mới có tên gọi là xã Hảo Đước.",
    sourceLabel,
    sourceUrl
  },
  "long-chu": {
    clauseNumber: 80,
    note: "Theo khoản 80 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Long Vĩnh, Long Phước và Long Chữ thành xã mới có tên gọi là xã Long Chữ.",
    sourceLabel,
    sourceUrl
  },
  "long-thuan": {
    clauseNumber: 81,
    note: "Theo khoản 81 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của các xã Long Thuận (huyện Bến Cầu), Long Giang và Long Khánh thành xã mới có tên gọi là xã Long Thuận.",
    sourceLabel,
    sourceUrl
  },
  "ben-cau": {
    clauseNumber: 82,
    note: "Theo khoản 82 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của thị trấn Bến Cầu và các xã An Thạnh (huyện Bến Cầu), Tiên Thuận, Lợi Thuận thành xã mới có tên gọi là xã Bến Cầu.",
    sourceLabel,
    sourceUrl
  },
  "kien-tuong": {
    clauseNumber: 83,
    note: "Theo khoản 83 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của Phường 1, Phường 2 và Phường 3 ( thị xã Kiến Tường ) thành phường mới có tên gọi là phường Kiến Tường.",
    sourceLabel,
    sourceUrl
  },
  "long-an": {
    clauseNumber: 84,
    note: "Theo khoản 84 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của Phường 1 và Phường 3 (thành phố Tân An), Phường 4, Phường 5, Phường 6, xã Hướng Thọ Phú, phần còn lại của xã Bình Thạnh (huyện Thủ Thừa) sau khi sắp xếp theo quy định tại khoản 20 Điều này thành phường mới có tên gọi là phường Long An.",
    sourceLabel,
    sourceUrl
  },
  "tan-an": {
    clauseNumber: 85,
    note: "Theo khoản 85 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của Phường 7 và các xã Bình Tâm, Nhơn Thạnh Trung, An Vĩnh Ngãi thành phường mới có tên gọi là phường Tân An.",
    sourceLabel,
    sourceUrl
  },
  "khanh-hau": {
    clauseNumber: 86,
    note: "Theo khoản 86 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của phường Tân Khánh, phường Khánh Hậu và xã Lợi Bình Nhơn thành phường mới có tên gọi là phường Khánh Hậu.",
    sourceLabel,
    sourceUrl
  },
  "tan-ninh": {
    clauseNumber: 87,
    note: "Theo khoản 87 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của Phường 1, Phường 2 và Phường 3 (thành phố Tây Ninh), Phường IV, phường Hiệp Ninh, phần còn lại của xã Thái Bình sau khi sắp xếp theo quy định tại khoản 78 Điều này thành phường mới có tên gọi là phường Tân Ninh.",
    sourceLabel,
    sourceUrl
  },
  "binh-minh": {
    clauseNumber: 88,
    note: "Theo khoản 88 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của phường Ninh Sơn, các xã Tân Bình (thành phố Tây Ninh), Bình Minh, Thạnh Tân và phần còn lại của xã Suối Đá, xã Phan sau khi sắp xếp theo quy định tại khoản 64 Điều này thành phường mới có tên gọi là phường Bình Minh.",
    sourceLabel,
    sourceUrl
  },
  "ninh-thanh": {
    clauseNumber: 89,
    note: "Theo khoản 89 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của phường Ninh Thạnh, xã Bàu Năng và phần còn lại của xã Chà Là sau khi sắp xếp theo quy định tại khoản 63 Điều này thành phường mới có tên gọi là phường Ninh Thạnh.",
    sourceLabel,
    sourceUrl
  },
  "long-hoa": {
    clauseNumber: 90,
    note: "Theo khoản 90 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của phường Long Thành Bắc, phường Long Hoa và các xã Trường Hòa, Trường Tây, Trường Đông thành phường mới có tên gọi là phường Long Hoa.",
    sourceLabel,
    sourceUrl
  },
  "hoa-thanh": {
    clauseNumber: 91,
    note: "Theo khoản 91 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số phường Long Thành Trung và xã Long Thành Nam thành phường mới có tên gọi là phường Hòa Thành.",
    sourceLabel,
    sourceUrl
  },
  "thanh-dien": {
    clauseNumber: 92,
    note: "Theo khoản 92 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của phường Hiệp Tân và xã Thanh Điền thành phường mới có tên gọi là phường Thanh Điền.",
    sourceLabel,
    sourceUrl
  },
  "trang-bang": {
    clauseNumber: 93,
    note: "Theo khoản 93 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của phường An Hòa và phường Trảng Bàng thành phường mới có tên gọi là phường Trảng Bàng.",
    sourceLabel,
    sourceUrl
  },
  "an-tinh": {
    clauseNumber: 94,
    note: "Theo khoản 94 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của phường Lộc Hưng và phường An Tịnh thành phường mới có tên gọi là phường An Tịnh.",
    sourceLabel,
    sourceUrl
  },
  "go-dau": {
    clauseNumber: 95,
    note: "Theo khoản 95 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của phường Gia Bình, thị trấn Gò Dầu và xã Thanh Phước thành phường mới có tên gọi là phường Gò Dầu.",
    sourceLabel,
    sourceUrl
  },
  "gia-loc": {
    clauseNumber: 96,
    note: "Theo khoản 96 Điều 1 Nghị quyết 1682/NQ-UBTVQH15 năm 2025: Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của xã Phước Đông (huyện Gò Dầu) và phường Gia Lộc thành phường mới có tên gọi là phường Gia Lộc.",
    sourceLabel,
    sourceUrl
  }
};
