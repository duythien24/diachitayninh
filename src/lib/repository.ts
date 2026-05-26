import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import {
  communes as mockCommunes,
  documents as mockDocuments,
  getCommuneById as getMockCommuneById
} from "@/lib/data";
import { getSupabaseAdminClient, getSupabasePublicClient, isSupabaseConfigured } from "@/lib/supabase-server";
import type { Commune, CommuneType, Document, DocumentType } from "@/lib/types";

type CommuneRow = {
  id: string;
  name: string;
  type: CommuneType;
  district_old: string | null;
  description: string | null;
  slug: string;
  created_at: string;
};

type DocumentRow = {
  id: string;
  title: string;
  slug: string;
  document_type: DocumentType;
  commune_id: string | null;
  year: number | null;
  description: string | null;
  source: string | null;
  preview_file_url: string;
  cover_image_url: string | null;
  is_preview_only: boolean;
  contact_note: string | null;
  created_at: string;
  communes?: CommuneRow | CommuneRow[] | null;
};

const fallbackCover =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ch%C3%B9a_B%C3%A0_v%C3%A0_c%E1%BA%A3nh_ch%C3%A2n_tr%E1%BB%9Di%2C_KDL_N%C3%BAi_B%C3%A0_%C4%90en.jpg?width=900";

const documentSelect =
  "id,title,slug,document_type,commune_id,year,description,source,preview_file_url,cover_image_url,is_preview_only,contact_note,created_at,communes(id,name,type,district_old,description,slug,created_at)";

function enrichMockDocument(document: Document): Document {
  return {
    ...document,
    commune: getMockCommuneById(document.communeId)
  };
}

function mapCommune(row: CommuneRow): Commune {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    districtOld: row.district_old || "Đơn vị hành chính sau sắp xếp năm 2025",
    description:
      row.description ||
      "Hồ sơ địa chí đang được số hóa theo từng đợt. Giai đoạn đầu ưu tiên bản đọc thử, thông tin nguồn và hướng dẫn liên hệ thư viện.",
    slug: row.slug
  };
}

function mapDocument(row: DocumentRow): Document {
  const communeRow = Array.isArray(row.communes) ? row.communes[0] : row.communes;
  const commune = communeRow ? mapCommune(communeRow) : undefined;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    documentType: row.document_type,
    communeId: row.commune_id || undefined,
    year: row.year || new Date(row.created_at).getFullYear(),
    description: row.description || "",
    source: row.source || "Thư viện tỉnh Tây Ninh",
    previewFileUrl: row.preview_file_url,
    coverImageUrl: row.cover_image_url || fallbackCover,
    isPreviewOnly: row.is_preview_only,
    contactNote: row.contact_note || "Vui lòng liên hệ thư viện để đọc bản đầy đủ.",
    createdAt: row.created_at,
    commune
  };
}

export async function getCommunes() {
  noStore();

  const supabase = getSupabasePublicClient();
  if (!supabase) {
    return mockCommunes;
  }

  const { data, error } = await supabase
    .from("communes")
    .select("id,name,type,district_old,description,slug,created_at")
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data?.length) {
    return mockCommunes;
  }

  return data.map((row) => mapCommune(row as CommuneRow));
}

export async function getCommuneBySlug(slug: string) {
  noStore();

  const supabase = getSupabasePublicClient();
  if (!supabase) {
    return mockCommunes.find((commune) => commune.slug === slug);
  }

  const { data, error } = await supabase
    .from("communes")
    .select("id,name,type,district_old,description,slug,created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return mockCommunes.find((commune) => commune.slug === slug);
  }

  return mapCommune(data as CommuneRow);
}

export async function getCommuneById(id?: string) {
  noStore();

  if (!id) {
    return undefined;
  }

  const supabase = getSupabasePublicClient();
  if (!supabase) {
    return getMockCommuneById(id);
  }

  const { data, error } = await supabase
    .from("communes")
    .select("id,name,type,district_old,description,slug,created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return getMockCommuneById(id);
  }

  return mapCommune(data as CommuneRow);
}

export async function getDocuments() {
  noStore();

  const supabase = getSupabasePublicClient();
  if (!supabase) {
    return mockDocuments.map(enrichMockDocument);
  }

  const { data, error } = await supabase
    .from("documents")
    .select(documentSelect)
    .order("created_at", { ascending: false });

  if (error) {
    return mockDocuments.map(enrichMockDocument);
  }

  return data.map((row) => mapDocument(row as DocumentRow));
}

export async function getAdminDocuments() {
  noStore();

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return getDocuments();
  }

  const { data, error } = await supabase
    .from("documents")
    .select(documentSelect)
    .order("created_at", { ascending: false });

  if (error) {
    return getDocuments();
  }

  return data.map((row) => mapDocument(row as DocumentRow));
}

export async function getAdminDocumentById(id: string) {
  noStore();

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    const documents = await getDocuments();
    return documents.find((document) => document.id === id);
  }

  const { data, error } = await supabase
    .from("documents")
    .select(documentSelect)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    const documents = await getDocuments();
    return documents.find((document) => document.id === id);
  }

  return mapDocument(data as DocumentRow);
}

export async function getDocumentsByCommune(communeId: string) {
  const docs = await getDocuments();
  return docs.filter((document) => document.communeId === communeId);
}

export async function getDocumentBySlug(slug: string) {
  noStore();

  const supabase = getSupabasePublicClient();
  if (!supabase) {
    const document = mockDocuments.find((item) => item.slug === slug);
    return document ? enrichMockDocument(document) : undefined;
  }

  const { data, error } = await supabase
    .from("documents")
    .select(documentSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    const document = mockDocuments.find((item) => item.slug === slug);
    return document ? enrichMockDocument(document) : undefined;
  }

  return mapDocument(data as DocumentRow);
}

export function usingMockData() {
  return !isSupabaseConfigured;
}
