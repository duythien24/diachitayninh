export type CommuneType = "xa" | "phuong";

export type DocumentType = "dia_chi" | "bao_tay_ninh";

export type Commune = {
  id: string;
  name: string;
  type: CommuneType;
  districtOld: string;
  description: string;
  slug: string;
};

export type Document = {
  id: string;
  title: string;
  slug: string;
  documentType: DocumentType;
  communeId?: string;
  year: number;
  description: string;
  source: string;
  previewFileUrl: string;
  coverImageUrl: string;
  isPreviewOnly: boolean;
  contactNote: string;
  createdAt: string;
  commune?: Commune;
};
