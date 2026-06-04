import "server-only";

import { getAdminDocuments } from "@/lib/repository";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "documents-preview";
const storageFolders = ["pdf", "covers"] as const;

type StorageFolder = (typeof storageFolders)[number];

export type StorageFileUsage = {
  documentId: string;
  documentSlug: string;
  documentTitle: string;
  field: "pdf" | "cover";
};

export type StorageFileItem = {
  bucket: string;
  folder: StorageFolder;
  name: string;
  path: string;
  publicUrl: string;
  size: number;
  createdAt?: string;
  updatedAt?: string;
  mimeType?: string;
  usages: StorageFileUsage[];
};

export type StorageFileSummary = {
  totalFiles: number;
  usedFiles: number;
  unusedFiles: number;
  totalSize: number;
  pdfCount: number;
  coverCount: number;
};

export type StorageFileResult =
  | {
      files: StorageFileItem[];
      summary: StorageFileSummary;
      error: null;
    }
  | {
      files: [];
      summary: StorageFileSummary;
      error: string;
    };

const emptySummary: StorageFileSummary = {
  totalFiles: 0,
  usedFiles: 0,
  unusedFiles: 0,
  totalSize: 0,
  pdfCount: 0,
  coverCount: 0
};

function storagePathFromPublicUrl(publicUrl?: string | null) {
  if (!publicUrl) return null;

  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

function buildUsageMap(documents: Awaited<ReturnType<typeof getAdminDocuments>>) {
  const map = new Map<string, StorageFileUsage[]>();

  function addUsage(path: string | null, usage: StorageFileUsage) {
    if (!path) return;
    const current = map.get(path) || [];
    current.push(usage);
    map.set(path, current);
  }

  for (const document of documents) {
    addUsage(storagePathFromPublicUrl(document.previewFileUrl), {
      documentId: document.id,
      documentSlug: document.slug,
      documentTitle: document.title,
      field: "pdf"
    });

    addUsage(storagePathFromPublicUrl(document.coverImageUrl), {
      documentId: document.id,
      documentSlug: document.slug,
      documentTitle: document.title,
      field: "cover"
    });
  }

  return map;
}

function summarize(files: StorageFileItem[]): StorageFileSummary {
  return {
    totalFiles: files.length,
    usedFiles: files.filter((file) => file.usages.length > 0).length,
    unusedFiles: files.filter((file) => file.usages.length === 0).length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    pdfCount: files.filter((file) => file.folder === "pdf").length,
    coverCount: files.filter((file) => file.folder === "covers").length
  };
}

export async function getStorageFiles(): Promise<StorageFileResult> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return {
      files: [],
      summary: emptySummary,
      error: "Chưa cấu hình Supabase service role nên chưa thể đọc Storage."
    };
  }

  const documents = await getAdminDocuments();
  const usageMap = buildUsageMap(documents);
  const files: StorageFileItem[] = [];

  for (const folder of storageFolders) {
    const { data, error } = await supabase.storage.from(bucketName).list(folder, {
      limit: 1000,
      sortBy: { column: "updated_at", order: "desc" }
    });

    if (error) {
      return {
        files: [],
        summary: emptySummary,
        error: error.message
      };
    }

    for (const item of data || []) {
      if (!item.name || item.name === ".emptyFolderPlaceholder") continue;

      const path = `${folder}/${item.name}`;
      const publicUrl = supabase.storage.from(bucketName).getPublicUrl(path).data.publicUrl;
      const metadata = item.metadata as { size?: number; mimetype?: string } | null;

      files.push({
        bucket: bucketName,
        folder,
        name: item.name,
        path,
        publicUrl,
        size: metadata?.size || 0,
        createdAt: item.created_at || undefined,
        updatedAt: item.updated_at || undefined,
        mimeType: metadata?.mimetype,
        usages: usageMap.get(path) || []
      });
    }
  }

  files.sort((left, right) => {
    const leftTime = left.updatedAt || left.createdAt || "";
    const rightTime = right.updatedAt || right.createdAt || "";
    return rightTime.localeCompare(leftTime);
  });

  return {
    files,
    summary: summarize(files),
    error: null
  };
}
