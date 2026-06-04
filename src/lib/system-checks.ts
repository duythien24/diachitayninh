import "server-only";

import { getSupabaseAdminClient, getSupabasePublicClient } from "@/lib/supabase-server";

export type SystemCheckStatus = "ok" | "warning" | "error";

export type SystemCheck = {
  label: string;
  status: SystemCheckStatus;
  detail: string;
  action?: string;
};

export type SystemCheckGroup = {
  title: string;
  description: string;
  checks: SystemCheck[];
};

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "documents-preview";

function present(value: string | undefined) {
  return Boolean(value?.trim());
}

function envCheck(label: string, value: string | undefined, action: string): SystemCheck {
  return present(value)
    ? { label, status: "ok", detail: "Đã cấu hình." }
    : { label, status: "error", detail: "Chưa cấu hình.", action };
}

function errorDetail(error: { message?: string } | null | undefined) {
  return error?.message || "Không có lỗi trả về.";
}

async function tableCheck(table: string, action?: string): Promise<SystemCheck> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      label: table,
      status: "error",
      detail: "Thiếu Supabase service role nên chưa kiểm tra được bảng.",
      action: "Kiểm tra biến SUPABASE_SERVICE_ROLE_KEY trên Vercel."
    };
  }

  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });

  if (error) {
    return {
      label: table,
      status: "error",
      detail: errorDetail(error),
      action
    };
  }

  return {
    label: table,
    status: "ok",
    detail: `Có thể truy cập. Số dòng hiện tại: ${count ?? 0}.`
  };
}

async function columnCheck(table: string, columns: string[], action?: string): Promise<SystemCheck> {
  const supabase = getSupabaseAdminClient();
  const label = `${table}: ${columns.join(", ")}`;

  if (!supabase) {
    return {
      label,
      status: "error",
      detail: "Thiếu Supabase service role nên chưa kiểm tra được cột.",
      action: "Kiểm tra biến SUPABASE_SERVICE_ROLE_KEY trên Vercel."
    };
  }

  const { error } = await supabase.from(table).select(columns.join(","), { head: true }).limit(1);

  if (error) {
    return {
      label,
      status: "error",
      detail: errorDetail(error),
      action
    };
  }

  return {
    label,
    status: "ok",
    detail: "Đã có đủ các cột cần thiết."
  };
}

async function publicConnectionCheck(): Promise<SystemCheck> {
  const supabase = getSupabasePublicClient();
  if (!supabase) {
    return {
      label: "Kết nối public Supabase",
      status: "error",
      detail: "Thiếu URL hoặc anon key.",
      action: "Kiểm tra NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY."
    };
  }

  const { error } = await supabase.from("documents").select("id", { count: "exact", head: true });

  return error
    ? {
        label: "Kết nối public Supabase",
        status: "error",
        detail: errorDetail(error),
        action: "Kiểm tra RLS/policy public read của bảng documents."
      }
    : { label: "Kết nối public Supabase", status: "ok", detail: "Public client đọc được dữ liệu." };
}

async function adminConnectionCheck(): Promise<SystemCheck> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      label: "Kết nối admin Supabase",
      status: "error",
      detail: "Thiếu URL hoặc service role key.",
      action: "Kiểm tra SUPABASE_SERVICE_ROLE_KEY trên Vercel."
    };
  }

  const { error } = await supabase.from("documents").select("id", { count: "exact", head: true });

  return error
    ? {
        label: "Kết nối admin Supabase",
        status: "error",
        detail: errorDetail(error),
        action: "Kiểm tra service role key và project Supabase đang dùng."
      }
    : { label: "Kết nối admin Supabase", status: "ok", detail: "Service role đọc được dữ liệu." };
}

async function searchRpcCheck(): Promise<SystemCheck> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      label: "RPC search_documents",
      status: "error",
      detail: "Thiếu Supabase service role nên chưa kiểm tra được RPC.",
      action: "Kiểm tra biến SUPABASE_SERVICE_ROLE_KEY trên Vercel."
    };
  }

  const { error } = await supabase.rpc("search_documents", {
    search_query: "",
    filter_type: null,
    filter_commune_id: null,
    filter_year: null,
    filter_author: "",
    filter_publisher: "",
    result_limit: 1,
    result_offset: 0
  });

  return error
    ? {
        label: "RPC search_documents",
        status: "error",
        detail: errorDetail(error),
        action: "Chạy file supabase/search-documents.sql trong Supabase SQL Editor."
      }
    : { label: "RPC search_documents", status: "ok", detail: "RPC tìm kiếm đang hoạt động." };
}

async function storageBucketCheck(): Promise<SystemCheck> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      label: `Storage bucket ${bucketName}`,
      status: "error",
      detail: "Thiếu Supabase service role nên chưa kiểm tra được Storage.",
      action: "Kiểm tra biến SUPABASE_SERVICE_ROLE_KEY trên Vercel."
    };
  }

  const { error } = await supabase.storage.from(bucketName).list("", { limit: 1 });

  return error
    ? {
        label: `Storage bucket ${bucketName}`,
        status: "error",
        detail: errorDetail(error),
        action: "Tạo bucket hoặc kiểm tra NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET."
      }
    : { label: `Storage bucket ${bucketName}`, status: "ok", detail: "Bucket upload PDF/ảnh bìa đang truy cập được." };
}

export async function getSystemCheckGroups(): Promise<SystemCheckGroup[]> {
  const [
    publicConnection,
    adminConnection,
    searchRpc,
    storageBucket,
    communes,
    documents,
    documentCommunes,
    adminUsers,
    auditLogs,
    documentMetadataColumns,
    communeMetadataColumns
  ] = await Promise.all([
      publicConnectionCheck(),
      adminConnectionCheck(),
      searchRpcCheck(),
      storageBucketCheck(),
      tableCheck("communes", "Chạy lại supabase/schema.sql hoặc kiểm tra bảng communes."),
      tableCheck("documents", "Chạy lại supabase/schema.sql hoặc kiểm tra bảng documents."),
      tableCheck("document_communes", "Chạy file supabase/upgrade-document-metadata.sql hoặc phần tạo bảng document_communes."),
      tableCheck("admin_users", "Chạy file supabase/add-admin-users.sql để tạo bảng admin_users."),
      tableCheck("admin_audit_logs", "Chạy file supabase/admin-audit-logs.sql để bật lịch sử thao tác."),
      columnCheck(
        "documents",
        ["page_count", "preview_page_count", "keywords", "author", "publisher"],
        "Chạy file supabase/upgrade-document-metadata.sql hoặc phần thêm metadata cho bảng documents."
      ),
      columnCheck(
        "communes",
        ["cover_image_url", "keywords", "updated_at"],
        "Chạy file supabase/commune-admin-metadata.sql để thêm metadata cho xã/phường."
      )
    ]);

  return [
    {
      title: "Biến môi trường",
      description: "Kiểm tra cấu hình bắt buộc trên local và Vercel.",
      checks: [
        envCheck("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL, "Thêm URL project Supabase."),
        envCheck("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Thêm anon key Supabase."),
        envCheck("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY, "Thêm service role key để admin ghi dữ liệu."),
        envCheck("ADMIN_SESSION_SECRET", process.env.ADMIN_SESSION_SECRET, "Thêm chuỗi bí mật đủ dài để ký session admin.")
      ]
    },
    {
      title: "Kết nối Supabase",
      description: "Kiểm tra public client, admin client và bucket lưu PDF/ảnh.",
      checks: [publicConnection, adminConnection, storageBucket]
    },
    {
      title: "Database",
      description: "Các bảng chính mà website đang dùng.",
      checks: [communes, documents, documentCommunes, adminUsers, auditLogs]
    },
    {
      title: "Schema mở rộng",
      description: "Các cột phục vụ metadata tài liệu, nhiều xã/phường và quản trị nội dung sâu hơn.",
      checks: [documentMetadataColumns, communeMetadataColumns]
    },
    {
      title: "Tìm kiếm",
      description: "RPC search_documents dùng cho trang tra cứu tài liệu.",
      checks: [searchRpc]
    }
  ];
}
