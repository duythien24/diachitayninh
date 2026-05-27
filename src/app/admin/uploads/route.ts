import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/admin-users";
import { getSupabaseAdminClient } from "@/lib/supabase-server";
import { slugify } from "@/lib/utils";

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "documents-preview";

function safeFileName(name: string) {
  const segments = name.split(".");
  const extension = segments.length > 1 ? segments.pop() : "";
  const baseName = slugify(segments.join(".") || name) || "file";
  return `${Date.now()}-${baseName}${extension ? `.${extension.toLowerCase()}` : ""}`;
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

  if (typeof body.fileSize === "number" && body.fileSize > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File vượt quá 50MB, Supabase Storage hiện chưa cho upload file lớn hơn mức này." },
      { status: 413 }
    );
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
