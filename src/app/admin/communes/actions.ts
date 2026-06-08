"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit-log";
import { getCurrentAdmin } from "@/lib/admin-users";
import { getSupabaseAdminClient } from "@/lib/supabase-server";
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

function validateImageFile(file: File) {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WEBP.");
  }

  if (file.size > maxSize) {
    throw new Error("Ảnh đại diện không được vượt quá 5MB.");
  }
}

function safeFileName(file: File) {
  const segments = file.name.split(".");
  const extension = segments.length > 1 ? segments.pop() : "";
  const baseName = slugify(segments.join(".") || file.name) || "commune";
  return `${Date.now()}-${baseName}${extension ? `.${extension.toLowerCase()}` : ""}`;
}

async function uploadPublicImage(file: File) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY hoặc NEXT_PUBLIC_SUPABASE_URL.");
  }

  const path = `communes/${safeFileName(file)}`;
  const { error } = await supabase.storage.from(bucketName).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  return supabase.storage.from(bucketName).getPublicUrl(path).data.publicUrl;
}

function legacyCommuneData<T extends Record<string, unknown>>(communeData: T) {
  const legacyData = { ...communeData };
  delete legacyData.cover_image_url;
  delete legacyData.keywords;
  delete legacyData.updated_at;
  return legacyData;
}

export async function updateCommuneAction(communeId: string, formData: FormData) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    redirect("/admin/login");
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect("/admin/communes?status=missing-env");
  }

  const imageFile = fileValue(formData, "cover_image");
  if (imageFile) {
    validateImageFile(imageFile);
  }

  const coverImageUrl = imageFile
    ? await uploadPublicImage(imageFile)
    : optionalTextValue(formData, "cover_image_url") || optionalTextValue(formData, "existing_cover_image_url");

  const communeData = {
    district_old: optionalTextValue(formData, "district_old"),
    description: optionalTextValue(formData, "description"),
    cover_image_url: coverImageUrl,
    keywords: keywordsValue(formData),
    updated_at: new Date().toISOString()
  };

  let { error } = await supabase.from("communes").update(communeData).eq("id", communeId);

  if (error?.message.includes("schema cache") || error?.message.includes("cover_image_url") || error?.message.includes("keywords")) {
    const retry = await supabase.from("communes").update(legacyCommuneData(communeData)).eq("id", communeId);
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  const slug = textValue(formData, "slug");
  const communeName = textValue(formData, "name") || communeId;

  await writeAuditLog({
    action: "commune.update",
    entityType: "commune",
    entityId: communeId,
    entityLabel: communeName,
    metadata: {
      slug,
      districtOld: communeData.district_old,
      hasCoverImage: Boolean(coverImageUrl),
      keywords: communeData.keywords || []
    }
  });

  revalidatePath("/");
  revalidatePath("/xa-phuong");
  if (slug) {
    revalidatePath(`/xa-phuong/${slug}`);
  }
  revalidatePath("/admin/communes");
  revalidatePath("/admin/audit");
  redirect("/admin/communes?status=updated");
}
