import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/admin-users";
import { getSupabaseAdminClient } from "@/lib/supabase-server";
import { slugify } from "@/lib/utils";

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "documents-preview";
const maxPdfFileSize = 50 * 1024 * 1024;
const maxImageFileSize = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

function safeFileName(name: string) {
  const segments = name.split(".");
  const extension = segments.length > 1 ? segments.pop() : "";
  const baseName = slugify(segments.join(".") || name) || "file";
  return `${Date.now()}-${baseName}${extension ? `.${extension.toLowerCase()}` : ""}`;
}

function validateUpload(contentType: string | undefined, fileSize: number | undefined, folder: "pdf" | "covers") {
  if (folder === "pdf") {
    if (contentType !== "application/pdf") {
      return { error: "Chỉ được upload file PDF.", status: 400 };
    }

    if (typeof fileSize === "number" && fileSize > maxPdfFileSize) {
      return { error: "File PDF không được vượt quá 50MB.", status: 413 };
    }

    return null;
  }

  if (!contentType || !allowedImageTypes.includes(contentType)) {
    return { error: "Ảnh bìa chỉ hỗ trợ JPG, PNG hoặc WEBP.", status: 400 };
  }

  if (typeof fileSize === "number" && fileSize > maxImageFileSize) {
    return { error: "Ảnh bìa không được vượt quá 5MB.", status: 413 };
  }

  return null;
}

export async function POST(request: NextRequest) {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    return NextResponse.json({ error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Chưa cấu hình Supabase service role." }, { status: 500 });
  }

  const body = (await request.json()) as {
    fileName?: string;
    contentType?: string;
    fileSize?: number;
    folder?: string;
  };
  const folder = body.folder === "covers" ? "covers" : "pdf";

  if (!body.fileName) {
    return NextResponse.json({ error: "Thiếu tên file." }, { status: 400 });
  }

  const validation = validateUpload(body.contentType, body.fileSize, folder);
  if (validation) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const path = `${folder}/${safeFileName(body.fileName)}`;
  const { data, error } = await supabase.storage.from(bucketName).createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const publicUrl = supabase.storage.from(bucketName).getPublicUrl(path).data.publicUrl;

  return NextResponse.json({
    bucket: bucketName,
    path,
    token: data.token,
    publicUrl
  });
}
