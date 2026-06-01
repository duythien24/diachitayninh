import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import {
  communes as mockCommunes,
  documents as mockDocuments,
  getCommuneById as getMockCommuneById
} from "@/lib/data";
import { getSupabaseAdminClient, getSupabasePublicClient, isSupabaseConfigured } from "@/lib/supabase-server";
import type { Commune, CommuneType, Document, DocumentType } from "@/lib/types";
import { normalizeVietnamese } from "@/lib/utils";

type CommuneRow = {
  id: string;
  name: string;
  type: CommuneType;
  district_old: string | null;
  description: string | null;
  slug: string;
  created_at: string;
};

type DocumentCommuneRow = {
  communes?: CommuneRow | CommuneRow[] | null;
};

type DocumentRow = {
  id: string;
  title: string;
  slug: string;
  document_type: DocumentType;
  commune_id: string | null;
  year: number | null;
  page_count?: number | null;
  preview_page_count?: number | null;
  keywords?: string[] | null;
  author?: string | null;
  publisher?: string | null;
  description: string | null;
  source: string | null;
  preview_file_url: string;
  cover_image_url: string | null;
  is_preview_only: boolean;
  contact_note: string | null;
  created_at: string;
  communes?: CommuneRow | CommuneRow[] | null;
  document_communes?: DocumentCommuneRow[] | null;
};

type SearchDocumentsOptions = {
  query?: string;
  documentType?: DocumentType | "all";
  limit?: number;
};

type SearchDocumentsRow = {
  document_id: string;
  rank: number | null;
};

const fallbackCover =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ch%C3%B9a_B%C3%A0_v%C3%A0_c%E1%BA%A3nh_ch%C3%A2n_tr%E1%BB%9Di%2C_KDL_N%C3%BAi_B%C3%A0_%C4%90en.jpg?width=900";

const documentSelect =
  "id,title,slug,document_type,commune_id,year,page_count,preview_page_count,keywords,author,publisher,description,source,preview_file_url,cover_image_url,is_preview_only,contact_note,created_at,communes(id,name,type,district_old,description,slug,created_at),document_communes(communes(id,name,type,district_old,description,slug,created_at))";

const legacyDocumentSelect =
  "id,title,slug,document_type,commune_id,year,description,source,preview_file_url,cover_image_url,is_preview_only,contact_note,created_at,communes(id,name,type,district_old,description,slug,created_at)";

function enrichMockDocument(document: Document): Document {
  const commune = getMockCommuneById(document.communeId);
  return {
    ...document,
    commune,
    communes: commune ? [commune] : [],
    communeIds: commune ? [commune.id] : []
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

function mapLinkedCommunes(row: DocumentRow) {
  const legacyCommuneRow = Array.isArray(row.communes) ? row.communes[0] : row.communes;
  const linkedCommunes = (row.document_communes || [])
    .map((link) => (Array.isArray(link.communes) ? link.communes[0] : link.communes))
    .filter((commune): commune is CommuneRow => Boolean(commune))
    .map((commune) => mapCommune(commune));

  if (linkedCommunes.length) {
    return linkedCommunes;
  }

  return legacyCommuneRow ? [mapCommune(legacyCommuneRow)] : [];
}

function mapDocument(row: DocumentRow): Document {
  const communes = mapLinkedCommunes(row);
  const commune = communes[0];

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    documentType: row.document_type,
    communeId: commune?.id || row.commune_id || undefined,
    communeIds: communes.map((item) => item.id),
    year: row.year || new Date(row.created_at).getFullYear(),
    pageCount: row.page_count || undefined,
    previewPageCount: row.preview_page_count || undefined,
    keywords: row.keywords || [],
    author: row.author || undefined,
    publisher: row.publisher || undefined,
    description: row.description || "",
    source: row.source || "Thư viện tỉnh Tây Ninh",
    previewFileUrl: row.preview_file_url,
    coverImageUrl: row.cover_image_url || fallbackCover,
    isPreviewOnly: row.is_preview_only,
    contactNote: row.contact_note || "Vui lòng liên hệ thư viện để đọc bản đầy đủ.",
    createdAt: row.created_at,
    commune,
    communes
  };
}

async function fetchDocumentRows(supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient> | ReturnType<typeof getSupabasePublicClient>>) {
  const full = await supabase.from("documents").select(documentSelect).order("created_at", { ascending: false });

  if (!full.error) {
    return full;
  }

  return supabase.from("documents").select(legacyDocumentSelect).order("created_at", { ascending: false });
}

async function fetchDocumentRowsByIds(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient> | ReturnType<typeof getSupabasePublicClient>>,
  ids: string[]
) {
  const full = await supabase.from("documents").select(documentSelect).in("id", ids);

  if (!full.error) {
    return full;
  }

  return supabase.from("documents").select(legacyDocumentSelect).in("id", ids);
}

async function fetchDocumentRowBySlug(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient> | ReturnType<typeof getSupabasePublicClient>>,
  slug: string
) {
  const full = await supabase.from("documents").select(documentSelect).eq("slug", slug).maybeSingle();

  if (!full.error) {
    return full;
  }

  return supabase.from("documents").select(legacyDocumentSelect).eq("slug", slug).maybeSingle();
}

async function fetchDocumentRowById(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  id: string
) {
  const full = await supabase.from("documents").select(documentSelect).eq("id", id).maybeSingle();

  if (!full.error) {
    return full;
  }

  return supabase.from("documents").select(legacyDocumentSelect).eq("id", id).maybeSingle();
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

  const supabase = getSupabaseAdminClient() || getSupabasePublicClient();
  if (!supabase) {
    return mockDocuments.map(enrichMockDocument);
  }

  const { data, error } = await fetchDocumentRows(supabase);

  if (error) {
    return mockDocuments.map(enrichMockDocument);
  }

  return data.map((row) => mapDocument(row as DocumentRow));
}

function documentMatchesSearch(document: Document, options: SearchDocumentsOptions) {
  const type = options.documentType || "all";
  if (type !== "all" && document.documentType !== type) {
    return false;
  }

  const query = normalizeVietnamese(options.query?.trim() || "");
  if (!query) {
    return true;
  }

  const searchableText = normalizeVietnamese(
    [
      document.title,
      document.description,
      String(document.year),
      document.source,
      document.slug,
      document.commune?.name || "",
      document.communes?.map((commune) => commune.name).join(" ") || "",
      document.author || "",
      document.publisher || "",
      document.keywords?.join(" ") || "",
      document.documentType === "tai_lieu_cap_tinh" ? "cap tinh tai lieu cap tinh" : ""
    ].join(" ")
  );

  return searchableText.includes(query);
}

export async function searchDocuments(options: SearchDocumentsOptions = {}) {
  noStore();

  const query = options.query?.trim() || "";
  const documentType = options.documentType || "all";
  const limit = options.limit || 120;
  const supabase = getSupabaseAdminClient() || getSupabasePublicClient();

  if (!supabase) {
    return mockDocuments.map(enrichMockDocument).filter((document) => documentMatchesSearch(document, options));
  }

  if (query) {
    const { data: searchRows, error: searchError } = await supabase.rpc("search_documents", {
      search_query: query,
      filter_type: documentType === "all" ? null : documentType,
      result_limit: limit
    });

    if (!searchError && searchRows) {
      const rankedRows = searchRows as SearchDocumentsRow[];
      const ids = rankedRows.map((row) => row.document_id).filter(Boolean);

      if (!ids.length) {
        return [];
      }

      const { data, error } = await fetchDocumentRowsByIds(supabase, ids);

      if (!error) {
        const order = new Map(ids.map((id, index) => [id, index]));
        return data
          .map((row) => mapDocument(row as DocumentRow))
          .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      }
    }
  }

  const { data, error } = await fetchDocumentRows(supabase);

  if (error) {
    return mockDocuments.map(enrichMockDocument).filter((document) => documentMatchesSearch(document, options));
  }

  return data.map((row) => mapDocument(row as DocumentRow)).filter((document) => documentMatchesSearch(document, options));
}

export async function getAdminDocuments() {
  noStore();

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return getDocuments();
  }

  const { data, error } = await fetchDocumentRows(supabase);

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

  const { data, error } = await fetchDocumentRowById(supabase, id);

  if (error || !data) {
    const documents = await getDocuments();
    return documents.find((document) => document.id === id);
  }

  return mapDocument(data as DocumentRow);
}

export async function getDocumentsByCommune(communeId: string) {
  const docs = await getDocuments();
  return docs.filter((document) => document.communeIds?.includes(communeId) || document.communeId === communeId);
}

export async function getDocumentBySlug(slug: string) {
  noStore();

  const supabase = getSupabaseAdminClient() || getSupabasePublicClient();
  if (!supabase) {
    const document = mockDocuments.find((item) => item.slug === slug);
    return document ? enrichMockDocument(document) : undefined;
  }

  const { data, error } = await fetchDocumentRowBySlug(supabase, slug);

  if (error || !data) {
    const document = mockDocuments.find((item) => item.slug === slug);
    return document ? enrichMockDocument(document) : undefined;
  }

  return mapDocument(data as DocumentRow);
}

export function usingMockData() {
  return !isSupabaseConfigured;
}
