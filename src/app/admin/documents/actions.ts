"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit-log";
import { getSupabaseAdminClient } from "@/lib/supabase-server";
import type { DocumentType } from "@/lib/types";
import { slugify } from "@/lib/utils";

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "documents-preview";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalTextValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value.length > 0 ? value : null;
}

function documentTypeValue(formData: FormData): DocumentType {
  const value = textValue(formData, "document_type");
  if (value === "bao_tay_ninh") return "bao_tay_ninh";
  if (value === "tai_lieu_cap_tinh") return "tai_lieu_cap_tinh";
  return "dia_chi";
}

function documentGroupParam(documentType: DocumentType) {
  return documentType;
}

function documentGroupFromForm(formData: FormData) {
  const value = textValue(formData, "document_group");
  if (value === "bao_tay_ninh" || value === "tai_lieu_cap_tinh") return value;
  return "dia_chi";
}

function isPreviewOnlyValue(formData: FormData) {
  return textValue(formData, "access_mode") !== "full";
}

function yearValue(formData: FormData) {
  const year = Number(textValue(formData, "year"));
  return Number.isFinite(year) ? year : null;
}

function numberValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function keywordsValue(formData: FormData) {
  const value = textValue(formData, "keywords");
  if (!value) return null;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function fileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function validatePdfFile(file: File) {
  const maxSize = 50 * 1024 * 1024;

  if (file.type !== "application/pdf") {
    throw new Error("Chỉ được upload file PDF.");
  }

  if (file.size > maxSize) {
    throw new Error("File PDF không được vượt quá 50MB.");
  }
}

function validateImageFile(file: File) {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Ảnh bìa chỉ hỗ trợ JPG, PNG hoặc WEBP.");
  }

  if (file.size > maxSize) {
    throw new Error("Ảnh bìa không được vượt quá 5MB.");
  }
}

function communeIdsValue(formData: FormData, documentType: DocumentType) {
  if (documentType === "tai_lieu_cap_tinh") {
    return [];
  }

  const values = formData
    .getAll("commune_ids")
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim());
  const legacyValue = optionalTextValue(formData, "commune_id");
  return Array.from(new Set(legacyValue ? [legacyValue, ...values] : values));
}

function safeFileName(file: File) {
  const segments = file.name.split(".");
  const extension = segments.length > 1 ? segments.pop() : "";
  const baseName = slugify(segments.join(".") || file.name);
  return `${Date.now()}-${baseName}${extension ? `.${extension.toLowerCase()}` : ""}`;
}

async function uniqueDocumentSlug(supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>, baseSlug: string, documentId?: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    let query = supabase.from("documents").select("id").eq("slug", candidate).limit(1);

    if (documentId) {
      query = query.neq("id", documentId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.length) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function uploadPublicFile(file: File, folder: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY hoặc NEXT_PUBLIC_SUPABASE_URL.");
  }

  const path = `${folder}/${safeFileName(file)}`;
  const { error } = await supabase.storage.from(bucketName).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
}

async function syncDocumentCommunes(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  documentId: string,
  communeIds: string[]
) {
  const { error: deleteError } = await supabase.from("document_communes").delete().eq("document_id", documentId);

  if (deleteError) {
    if (deleteError.message.includes("document_communes") || deleteError.message.includes("schema cache")) {
      return;
    }
    throw new Error(deleteError.message);
  }

  if (!communeIds.length) {
    return;
  }

  const { error } = await supabase.from("document_communes").insert(
    communeIds.map((communeId) => ({
      document_id: documentId,
      commune_id: communeId
    }))
  );

  if (error) {
    if (error.message.includes("document_communes") || error.message.includes("schema cache")) {
      return;
    }
    throw new Error(error.message);
  }
}

function legacyDocumentData<T extends Record<string, unknown>>(documentData: T) {
  const legacyData = { ...documentData };
  delete legacyData.page_count;
  delete legacyData.preview_page_count;
  delete legacyData.keywords;
  delete legacyData.author;
  delete legacyData.publisher;
  return legacyData;
}

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

async function removePublicFiles(urls: Array<string | null | undefined>) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const paths = Array.from(new Set(urls.map((url) => storagePathFromPublicUrl(url)).filter((path): path is string => Boolean(path))));
  if (!paths.length) return;

  await supabase.storage.from(bucketName).remove(paths);
}

async function documentPayload(formData: FormData, existingPreviewUrl?: string, existingCoverUrl?: string) {
  const title = textValue(formData, "title");
  const slug = slugify(textValue(formData, "slug") || title);
  const documentType = documentTypeValue(formData);
  const communeIds = communeIdsValue(formData, documentType);
  const previewFile = fileValue(formData, "preview_file");
  const coverFile = fileValue(formData, "cover_image");

  if (previewFile) validatePdfFile(previewFile);
  if (coverFile) validateImageFile(coverFile);

  const previewFileUrl =
    previewFile ? await uploadPublicFile(previewFile, "pdf") : optionalTextValue(formData, "preview_file_url") || existingPreviewUrl;
  const coverImageUrl =
    coverFile ? await uploadPublicFile(coverFile, "covers") : optionalTextValue(formData, "cover_image_url") || existingCoverUrl || null;

  if (!title) {
    throw new Error("Tên tài liệu là bắt buộc.");
  }

  if (!slug) {
    throw new Error("Slug là bắt buộc.");
  }

  if (!previewFileUrl) {
    throw new Error("Cần upload file PDF hoặc nhập URL PDF.");
  }

  return {
    documentData: {
      title,
      slug,
      document_type: documentType,
      commune_id: documentType === "tai_lieu_cap_tinh" ? null : communeIds[0] || optionalTextValue(formData, "commune_id"),
      year: yearValue(formData),
      page_count: numberValue(formData, "page_count"),
      preview_page_count: numberValue(formData, "preview_page_count") || 10,
      keywords: keywordsValue(formData),
      author: optionalTextValue(formData, "author"),
      publisher: optionalTextValue(formData, "publisher"),
      description: optionalTextValue(formData, "description"),
      source: optionalTextValue(formData, "source") || "Thư viện tỉnh Tây Ninh",
      preview_file_url: previewFileUrl,
      cover_image_url: coverImageUrl,
      is_preview_only: isPreviewOnlyValue(formData),
      contact_note: optionalTextValue(formData, "contact_note") || "Vui lòng liên hệ thư viện để đọc bản đầy đủ.",
      updated_at: new Date().toISOString()
    },
    communeIds
  };
}

export async function createDocumentAction(formData: FormData) {
  const supabase = getSupabaseAdminClient();
  const selectedDocumentType = documentTypeValue(formData);

  if (!supabase) {
    redirect(`/admin/documents?nhom=${documentGroupParam(selectedDocumentType)}&status=missing-env`);
  }

  const { documentData, communeIds } = await documentPayload(formData);
  documentData.slug = await uniqueDocumentSlug(supabase, documentData.slug);
  let { data, error } = await supabase.from("documents").insert(documentData).select("id").single();

  if (error?.message.includes("schema cache")) {
    const retry = await supabase.from("documents").insert(legacyDocumentData(documentData)).select("id").single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  if (data?.id) {
    await syncDocumentCommunes(supabase, data.id, communeIds);
    await writeAuditLog({
      action: "document.create",
      entityType: "document",
      entityId: data.id,
      entityLabel: documentData.title,
      metadata: {
        documentType: documentData.document_type,
        year: documentData.year,
        communeIds
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/tai-lieu");
  revalidatePath("/admin/documents");
  revalidatePath("/admin/audit");
  redirect(`/admin/documents?nhom=${documentGroupParam(selectedDocumentType)}&status=created`);
}

export async function updateDocumentAction(documentId: string, formData: FormData) {
  const supabase = getSupabaseAdminClient();
  const selectedDocumentType = documentTypeValue(formData);

  if (!supabase) {
    redirect(`/admin/documents?nhom=${documentGroupParam(selectedDocumentType)}&status=missing-env`);
  }

  const { documentData, communeIds } = await documentPayload(
    formData,
    optionalTextValue(formData, "existing_preview_file_url") || undefined,
    optionalTextValue(formData, "existing_cover_image_url") || undefined
  );
  documentData.slug = await uniqueDocumentSlug(supabase, documentData.slug, documentId);
  let { error } = await supabase.from("documents").update(documentData).eq("id", documentId);

  if (error?.message.includes("schema cache")) {
    const retry = await supabase.from("documents").update(legacyDocumentData(documentData)).eq("id", documentId);
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  await syncDocumentCommunes(supabase, documentId, communeIds);
  await writeAuditLog({
    action: "document.update",
    entityType: "document",
    entityId: documentId,
    entityLabel: documentData.title,
    metadata: {
      documentType: documentData.document_type,
      year: documentData.year,
      communeIds
    }
  });

  revalidatePath("/");
  revalidatePath("/tai-lieu");
  revalidatePath("/admin/documents");
  revalidatePath("/admin/audit");
  redirect(`/admin/documents?nhom=${documentGroupParam(selectedDocumentType)}&status=updated`);
}

export async function deleteDocumentAction(documentId: string, formData: FormData) {
  const supabase = getSupabaseAdminClient();
  const documentGroup = documentGroupFromForm(formData);

  if (!supabase) {
    redirect(`/admin/documents?nhom=${documentGroup}&status=missing-env`);
  }

  const { data: existingDocument } = await supabase
    .from("documents")
    .select("title,document_type,preview_file_url,cover_image_url")
    .eq("id", documentId)
    .maybeSingle();

  const { error } = await supabase.from("documents").delete().eq("id", documentId);

  if (error) {
    throw new Error(error.message);
  }

  await removePublicFiles([
    existingDocument?.preview_file_url as string | null | undefined,
    existingDocument?.cover_image_url as string | null | undefined
  ]);
  await writeAuditLog({
    action: "document.delete",
    entityType: "document",
    entityId: documentId,
    entityLabel: (existingDocument?.title as string | undefined) || documentId,
    metadata: {
      documentType: existingDocument?.document_type || documentGroup
    }
  });

  revalidatePath("/");
  revalidatePath("/tai-lieu");
  revalidatePath("/admin/documents");
  revalidatePath("/admin/audit");
  redirect(`/admin/documents?nhom=${documentGroup}&status=deleted`);
}
