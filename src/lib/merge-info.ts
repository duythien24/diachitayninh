export type CommuneMergeInfo = {
  oldUnits: string[];
  note: string;
  sourceLabel: string;
  sourceUrl: string;
};

export const communeMergeInfoBySlug: Record<string, CommuneMergeInfo> = {
  "long-huu": {
    oldUnits: ["Xã Long Hựu Đông", "Xã Long Hựu Tây"],
    note: "Xã Long Hựu được hình thành trên cơ sở sắp xếp toàn bộ diện tích tự nhiên và quy mô dân số của xã Long Hựu Đông và xã Long Hựu Tây, thuộc huyện Cần Đước, tỉnh Long An cũ.",
    sourceLabel: "Nghị quyết 1682/NQ-UBTVQH15 năm 2025",
    sourceUrl:
      "https://thuvienphapluat.vn/phap-luat/xa-long-huu-tinh-tay-ninh-moi-duoc-sap-nhap-tu-nhung-don-vi-hanh-chinh-nao-theo-nghi-quyet-1682-736326-229956.html"
  }
};
