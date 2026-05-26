"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  return value === "bao_tay_ninh" ? "bao_tay_ninh" : "dia_chi";
}

function yearValue(formData: FormData) {
  const year = Number(textValue(formData, "year"));
  return Number.isFinite(year) ? year : null;
}

function fileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
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

async function documentPayload(formData: FormData, existingPreviewUrl?: string, existingCoverUrl?: string) {
  const title = textValue(formData, "title");
  const slug = slugify(textValue(formData, "slug") || title);
  const previewFile = fileValue(formData, "preview_file");
  const coverFile = fileValue(formData, "cover_image");
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
    throw new Error("Cần upload file PDF preview hoặc nhập URL PDF preview.");
  }

  return {
    title,
    slug,
    document_type: documentTypeValue(formData),
    commune_id: optionalTextValue(formData, "commune_id"),
    year: yearValue(formData),
    description: optionalTextValue(formData, "description"),
    source: optionalTextValue(formData, "source") || "Thư viện tỉnh Tây Ninh",
    preview_file_url: previewFileUrl,
    cover_image_url: coverImageUrl,
    is_preview_only: true,
    contact_note:
      optionalTextValue(formData, "contact_note") || "Vui lòng liên hệ thư viện để đọc bản đầy đủ.",
    updated_at: new Date().toISOString()
  };
}

export async function createDocumentAction(formData: FormData) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    redirect("/admin/documents?status=missing-env");
  }

  const payload = await documentPayload(formData);
  payload.slug = await uniqueDocumentSlug(supabase, payload.slug);
  const { error } = await supabase.from("documents").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/tai-lieu");
  revalidatePath("/admin/documents");
  redirect("/admin/documents?status=created");
}

export async function updateDocumentAction(documentId: string, formData: FormData) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    redirect("/admin/documents?status=missing-env");
  }

  const payload = await documentPayload(
    formData,
    optionalTextValue(formData, "existing_preview_file_url") || undefined,
    optionalTextValue(formData, "existing_cover_image_url") || undefined
  );
  payload.slug = await uniqueDocumentSlug(supabase, payload.slug, documentId);
  const { error } = await supabase.from("documents").update(payload).eq("id", documentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/tai-lieu");
  revalidatePath("/admin/documents");
  redirect("/admin/documents?status=updated");
}

export async function deleteDocumentAction(documentId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    redirect("/admin/documents?status=missing-env");
  }

  const { error } = await supabase.from("documents").delete().eq("id", documentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/tai-lieu");
  revalidatePath("/admin/documents");
  redirect("/admin/documents?status=deleted");
}
