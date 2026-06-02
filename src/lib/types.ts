export type CommuneType = "xa" | "phuong";

export type DocumentType = "dia_chi" | "bao_tay_ninh" | "tai_lieu_cap_tinh";

export type Commune = {
  id: string;
  name: string;
  type: CommuneType;
  districtOld: string;
  description: string;
  coverImageUrl?: string;
  keywords?: string[];
  slug: string;
};

export type Document = {
  id: string;
  title: string;
  slug: string;
  documentType: DocumentType;
  communeId?: string;
  communeIds?: string[];
  year: number;
  pageCount?: number;
  previewPageCount?: number;
  keywords?: string[];
  author?: string;
  publisher?: string;
  description: string;
  source: string;
  previewFileUrl: string;
  coverImageUrl: string;
  isPreviewOnly: boolean;
  contactNote: string;
  createdAt: string;
  commune?: Commune;
  communes?: Commune[];
};
