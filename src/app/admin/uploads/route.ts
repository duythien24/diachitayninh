import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/admin-users";
import { getSupabaseAdminClient } from "@/lib/supabase-server";
import { slugify } from "@/lib/utils";

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "documents-preview";
const maxPdfFileSize = 50 * 1024 * 1024;
const maxImageFileSize = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

type UploadRequestBody = {
  fileName?: string;
  contentType?: string;
  fileSize?: number;
  folder?: string;
};

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

function storageErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("bucket not found") || normalizedMessage.includes("not found")) {
    return `Không tìm thấy Storage bucket "${bucketName}". Vào Supabase Storage tạo bucket này hoặc kiểm tra NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET.`;
  }

  if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("permission") || normalizedMessage.includes("unauthorized")) {
    return "Supabase Storage từ chối upload. Kiểm tra service role key, quyền bucket và trạng thái đăng nhập quản trị.";
  }

  if (normalizedMessage.includes("payload") || normalizedMessage.includes("too large")) {
    return "File vượt quá giới hạn upload của hệ thống. PDF tối đa 50MB, ảnh bìa tối đa 5MB.";
  }

  return message;
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

  let body: UploadRequestBody;

  try {
    body = (await request.json()) as UploadRequestBody;
  } catch {
    return NextResponse.json({ error: "Dữ liệu upload không hợp lệ. Vui lòng chọn lại file và thử lại." }, { status: 400 });
  }
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
    return NextResponse.json({ error: storageErrorMessage(error.message) }, { status: 500 });
  }

  const publicUrl = supabase.storage.from(bucketName).getPublicUrl(path).data.publicUrl;

  return NextResponse.json({
    bucket: bucketName,
    path,
    token: data.token,
    publicUrl
  });
}
