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
  cover_image_url?: string | null;
  keywords?: string[] | null;
  slug: string;
  created_at: string;
  updated_at?: string;
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
  communeId?: string;
  year?: number;
  author?: string;
  publisher?: string;
  limit?: number;
  offset?: number;
};

type SearchDocumentsRow = {
  document_id: string;
  rank: number | null;
};

export type DocumentSearchResult = {
  documents: Document[];
  hasMore: boolean;
};

export type DocumentFilterOptions = {
  years: number[];
  authors: string[];
  publishers: string[];
};

const fallbackCover =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ch%C3%B9a_B%C3%A0_v%C3%A0_c%E1%BA%A3nh_ch%C3%A2n_tr%E1%BB%9Di%2C_KDL_N%C3%BAi_B%C3%A0_%C4%90en.jpg?width=900";

const documentSelect =
  "id,title,slug,document_type,commune_id,year,page_count,preview_page_count,keywords,author,publisher,description,source,preview_file_url,cover_image_url,is_preview_only,contact_note,created_at,communes(id,name,type,district_old,description,slug,created_at),document_communes(communes(id,name,type,district_old,description,slug,created_at))";

const legacyDocumentSelect =
  "id,title,slug,document_type,commune_id,year,description,source,preview_file_url,cover_image_url,is_preview_only,contact_note,created_at,communes(id,name,type,district_old,description,slug,created_at)";

const communeSelect = "id,name,type,district_old,description,cover_image_url,keywords,slug,created_at,updated_at";
const legacyCommuneSelect = "id,name,type,district_old,description,slug,created_at";

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
      "Kho tư liệu địa chí, báo chí địa phương và tài liệu liên quan đến đơn vị hành chính này trên địa bàn tỉnh Tây Ninh.",
    coverImageUrl: row.cover_image_url || undefined,
    keywords: row.keywords || [],
    slug: row.slug
  };
}

async function fetchCommuneRows(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient> | ReturnType<typeof getSupabasePublicClient>>
) {
  const full = await supabase.from("communes").select(communeSelect).order("type", { ascending: true }).order("name", { ascending: true });

  if (!full.error) {
    return full;
  }

  return supabase.from("communes").select(legacyCommuneSelect).order("type", { ascending: true }).order("name", { ascending: true });
}

async function fetchCommuneRowBySlug(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient> | ReturnType<typeof getSupabasePublicClient>>,
  slug: string
) {
  const full = await supabase.from("communes").select(communeSelect).eq("slug", slug).maybeSingle();

  if (!full.error) {
    return full;
  }

  return supabase.from("communes").select(legacyCommuneSelect).eq("slug", slug).maybeSingle();
}

async function fetchCommuneRowById(supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>, id: string) {
  const full = await supabase.from("communes").select(communeSelect).eq("id", id).maybeSingle();

  if (!full.error) {
    return full;
  }

  return supabase.from("communes").select(legacyCommuneSelect).eq("id", id).maybeSingle();
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

  const { data, error } = await fetchCommuneRows(supabase);

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

  const { data, error } = await fetchCommuneRowBySlug(supabase, slug);

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

  const full = await supabase.from("communes").select(communeSelect).eq("id", id).maybeSingle();
  const { data, error } = !full.error
    ? full
    : await supabase.from("communes").select(legacyCommuneSelect).eq("id", id).maybeSingle();

  if (error || !data) {
    return getMockCommuneById(id);
  }

  return mapCommune(data as CommuneRow);
}

export async function getAdminCommunes() {
  noStore();

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return mockCommunes;
  }

  const { data, error } = await fetchCommuneRows(supabase);

  if (error || !data?.length) {
    return mockCommunes;
  }

  return data.map((row) => mapCommune(row as CommuneRow));
}

export async function getAdminCommuneById(id: string) {
  noStore();

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return mockCommunes.find((commune) => commune.id === id);
  }

  const { data, error } = await fetchCommuneRowById(supabase, id);

  if (error || !data) {
    return mockCommunes.find((commune) => commune.id === id);
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

  if (options.communeId) {
    const communeIds = document.communeIds?.length ? document.communeIds : document.communeId ? [document.communeId] : [];
    if (!communeIds.includes(options.communeId)) {
      return false;
    }
  }

  if (options.year && document.year !== options.year) {
    return false;
  }

  if (options.author?.trim()) {
    const authorQuery = normalizeVietnamese(options.author.trim());
    if (!normalizeVietnamese(document.author || "").includes(authorQuery)) {
      return false;
    }
  }

  if (options.publisher?.trim()) {
    const publisherQuery = normalizeVietnamese(options.publisher.trim());
    if (!normalizeVietnamese(document.publisher || "").includes(publisherQuery)) {
      return false;
    }
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

export async function searchDocuments(options: SearchDocumentsOptions = {}): Promise<DocumentSearchResult> {
  noStore();

  const query = options.query?.trim() || "";
  const documentType = options.documentType || "all";
  const limit = options.limit || 120;
  const offset = options.offset || 0;
  const requestedLimit = limit + 1;
  const supabase = getSupabaseAdminClient() || getSupabasePublicClient();

  if (!supabase) {
    const documents = mockDocuments.map(enrichMockDocument).filter((document) => documentMatchesSearch(document, options));
    return {
      documents: documents.slice(0, limit),
      hasMore: documents.length > limit
    };
  }

  if (query || documentType !== "all" || options.communeId || options.year || options.author || options.publisher) {
    const { data: searchRows, error: searchError } = await supabase.rpc("search_documents", {
      search_query: query,
      filter_type: documentType === "all" ? null : documentType,
      filter_commune_id: options.communeId || null,
      filter_year: options.year || null,
      filter_author: options.author?.trim() || "",
      filter_publisher: options.publisher?.trim() || "",
      result_limit: requestedLimit,
      result_offset: offset
    });

    if (!searchError && searchRows) {
      const rankedRows = searchRows as SearchDocumentsRow[];
      const ids = rankedRows.map((row) => row.document_id).filter(Boolean);

      if (!ids.length) {
        return {
          documents: [],
          hasMore: false
        };
      }

      const { data, error } = await fetchDocumentRowsByIds(supabase, ids);

      if (!error) {
        const order = new Map(ids.map((id, index) => [id, index]));
        const documents = data
          .map((row) => mapDocument(row as DocumentRow))
          .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        return {
          documents: documents.slice(0, limit),
          hasMore: documents.length > limit
        };
      }
    }
  }

  const { data, error } = await fetchDocumentRows(supabase);

  if (error) {
    const documents = mockDocuments.map(enrichMockDocument).filter((document) => documentMatchesSearch(document, options));
    return {
      documents: documents.slice(0, limit),
      hasMore: documents.length > limit
    };
  }

  const documents = data.map((row) => mapDocument(row as DocumentRow)).filter((document) => documentMatchesSearch(document, options));
  return {
    documents: documents.slice(offset, offset + limit),
    hasMore: documents.length > offset + limit
  };
}

export async function getDocumentFilterOptions(): Promise<DocumentFilterOptions> {
  noStore();

  const supabase = getSupabaseAdminClient() || getSupabasePublicClient();
  const rows = supabase
    ? await supabase.from("documents").select("year,author,publisher").limit(1000)
    : { data: mockDocuments, error: null };

  const data = rows.error || !rows.data ? mockDocuments : rows.data;
  const years = new Set<number>();
  const authors = new Set<string>();
  const publishers = new Set<string>();

  for (const row of data as Array<Partial<DocumentRow> | Document>) {
    if (row.year) {
      years.add(row.year);
    }

    const author = "author" in row ? row.author : undefined;
    const publisher = "publisher" in row ? row.publisher : undefined;

    if (author?.trim()) {
      authors.add(author.trim());
    }

    if (publisher?.trim()) {
      publishers.add(publisher.trim());
    }
  }

  return {
    years: Array.from(years).sort((left, right) => right - left),
    authors: Array.from(authors).sort((left, right) => left.localeCompare(right, "vi")),
    publishers: Array.from(publishers).sort((left, right) => left.localeCompare(right, "vi"))
  };
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
