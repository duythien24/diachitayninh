import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import { getSupabaseAdminClient } from "@/lib/supabase-server";
import type { Commune, Document } from "@/lib/types";
import { typePrefix } from "@/lib/utils";

type EventRow = {
  document_id: string;
  event_type: "detail_view" | "pdf_open";
  occurred_on: string;
};

export type DocumentAnalytics = {
  available: boolean;
  totalDetailViews: number;
  totalPdfOpens: number;
  last30Days: number;
  popularDocuments: Array<{
    id: string;
    title: string;
    slug: string;
    detailViews: number;
    pdfOpens: number;
    total: number;
  }>;
  popularCommunes: Array<{
    id: string;
    label: string;
    slug: string;
    total: number;
  }>;
  daily: Array<{
    date: string;
    detailViews: number;
    pdfOpens: number;
    total: number;
  }>;
};

const emptyAnalytics: DocumentAnalytics = {
  available: false,
  totalDetailViews: 0,
  totalPdfOpens: 0,
  last30Days: 0,
  popularDocuments: [],
  popularCommunes: [],
  daily: []
};

function isoDateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function getPopularDocumentIds(limit = 3, days = 90) {
  noStore();

  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("document_events")
    .select("document_id,event_type")
    .gte("occurred_on", isoDateDaysAgo(Math.max(0, days - 1)))
    .limit(20000);

  if (error || !data) return [];

  const scores = new Map<string, number>();
  for (const event of data as Pick<EventRow, "document_id" | "event_type">[]) {
    const weight = event.event_type === "pdf_open" ? 2 : 1;
    scores.set(event.document_id, (scores.get(event.document_id) || 0) + weight);
  }

  return Array.from(scores.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, Math.max(1, limit))
    .map(([documentId]) => documentId);
}

export type DocumentPopularity = {
  detailViews: number;
  pdfOpens: number;
  score: number;
};

export async function getDocumentPopularityScores(documentIds: string[], days = 180) {
  noStore();

  const uniqueIds = Array.from(new Set(documentIds)).filter(Boolean);
  const supabase = getSupabaseAdminClient();
  if (!supabase || !uniqueIds.length) return {} as Record<string, DocumentPopularity>;

  const { data, error } = await supabase
    .from("document_events")
    .select("document_id,event_type")
    .in("document_id", uniqueIds)
    .gte("occurred_on", isoDateDaysAgo(Math.max(0, days - 1)))
    .limit(20000);

  if (error || !data) return {} as Record<string, DocumentPopularity>;

  const scores: Record<string, DocumentPopularity> = {};
  for (const event of data as Pick<EventRow, "document_id" | "event_type">[]) {
    const current = scores[event.document_id] || { detailViews: 0, pdfOpens: 0, score: 0 };
    if (event.event_type === "detail_view") current.detailViews += 1;
    else current.pdfOpens += 1;
    current.score = current.detailViews + current.pdfOpens * 2;
    scores[event.document_id] = current;
  }

  return scores;
}

export async function getDocumentAnalytics(documents: Document[], communes: Commune[]): Promise<DocumentAnalytics> {
  noStore();

  const supabase = getSupabaseAdminClient();
  if (!supabase) return emptyAnalytics;

  const { data, error } = await supabase
    .from("document_events")
    .select("document_id,event_type,occurred_on")
    .order("occurred_on", { ascending: false })
    .limit(50000);

  if (error || !data) return emptyAnalytics;

  const events = data as EventRow[];
  const documentMap = new Map(documents.map((document) => [document.id, document]));
  const communeMap = new Map(communes.map((commune) => [commune.id, commune]));
  const documentCounts = new Map<string, { detailViews: number; pdfOpens: number }>();
  const communeCounts = new Map<string, number>();
  const dailyCounts = new Map<string, { detailViews: number; pdfOpens: number }>();
  const last30Day = isoDateDaysAgo(29);

  let totalDetailViews = 0;
  let totalPdfOpens = 0;
  let last30Days = 0;

  for (const event of events) {
    const document = documentMap.get(event.document_id);
    if (!document) continue;

    const counts = documentCounts.get(document.id) || { detailViews: 0, pdfOpens: 0 };
    if (event.event_type === "detail_view") {
      counts.detailViews += 1;
      totalDetailViews += 1;
    } else {
      counts.pdfOpens += 1;
      totalPdfOpens += 1;
    }
    documentCounts.set(document.id, counts);

    if (event.occurred_on >= last30Day) last30Days += 1;

    const documentCommuneIds = document.communeIds?.length
      ? document.communeIds
      : document.communeId
        ? [document.communeId]
        : [];
    for (const communeId of documentCommuneIds) {
      communeCounts.set(communeId, (communeCounts.get(communeId) || 0) + 1);
    }

    const daily = dailyCounts.get(event.occurred_on) || { detailViews: 0, pdfOpens: 0 };
    if (event.event_type === "detail_view") daily.detailViews += 1;
    else daily.pdfOpens += 1;
    dailyCounts.set(event.occurred_on, daily);
  }

  const daily = Array.from({ length: 14 }, (_, index) => {
    const date = isoDateDaysAgo(13 - index);
    const counts = dailyCounts.get(date) || { detailViews: 0, pdfOpens: 0 };
    return { date, ...counts, total: counts.detailViews + counts.pdfOpens };
  });

  const popularDocuments = Array.from(documentCounts.entries())
    .map(([id, counts]) => {
      const document = documentMap.get(id)!;
      return {
        id,
        title: document.title,
        slug: document.slug,
        ...counts,
        total: counts.detailViews + counts.pdfOpens
      };
    })
    .sort((left, right) => right.total - left.total || right.pdfOpens - left.pdfOpens)
    .slice(0, 8);

  const popularCommunes = Array.from(communeCounts.entries())
    .map(([id, total]) => {
      const commune = communeMap.get(id);
      return commune
        ? { id, label: `${typePrefix(commune.type)} ${commune.name}`, slug: commune.slug, total }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((left, right) => right.total - left.total || left.label.localeCompare(right.label, "vi"))
    .slice(0, 8);

  return {
    available: true,
    totalDetailViews,
    totalPdfOpens,
    last30Days,
    popularDocuments,
    popularCommunes,
    daily
  };
}
