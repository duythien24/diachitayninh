# Backup And Operations

Checklist vận hành cho website Địa chí số Tây Ninh.

## 1. Backup Supabase Database

Thực hiện định kỳ trước khi sửa schema hoặc import nhiều dữ liệu.

1. Vào Supabase project `Diachitayninh`.
2. Mở `Project Settings` -> `Database`.
3. Dùng mục backup/export sẵn có của Supabase nếu gói dự án hỗ trợ.
4. Nếu export thủ công, ưu tiên xuất các bảng:
   - `communes`
   - `documents`
   - `document_communes`
   - `admin_users`
   - `admin_audit_logs`
5. Lưu file backup theo tên có ngày, ví dụ `supabase-backup-2026-06-02.sql`.

## 2. Backup Supabase Storage

PDF và ảnh bìa đang lưu trong bucket cấu hình bởi biến `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.

Checklist:

1. Mở Supabase -> `Storage`.
2. Kiểm tra bucket đang dùng, thường là `documents-preview`.
3. Tải về hoặc đồng bộ các thư mục:
   - `documents/`
   - `covers/`
   - `communes/`
4. Không upload bản nội bộ/toàn văn nếu chưa được phép công bố.
5. Với tài liệu chỉ cho đọc thử, chỉ upload bản preview có watermark.

## 3. Kiểm Tra Vercel Environment Variables

Trong Vercel project -> `Settings` -> `Environment Variables`, cần có:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Ghi chú:

- `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng server-side, không đưa ra client.
- `ADMIN_SESSION_SECRET` nên là chuỗi mạnh, khác mật khẩu admin.
- Sau khi đổi env, cần redeploy Vercel.

## 4. Kiểm Tra Search RPC

Code đang gọi Supabase RPC `search_documents`. Nếu thiếu function này, trang tài liệu vẫn có fallback nhưng tìm kiếm sẽ kém hiệu quả.

Chạy file SQL:

```sql
-- Supabase SQL Editor
-- copy nội dung file supabase/search-documents.sql và chạy
```

Kiểm tra nhanh sau khi chạy:

```sql
select *
from search_documents(
  search_query := 'Tây Ninh',
  result_limit := 5,
  result_offset := 0
);
```

Nếu trả về danh sách `document_id`, RPC hoạt động.

## 5. Kiểm Tra Metadata Xã/Phường

Trang quản trị xã/phường cần các cột metadata trong bảng `communes`.

Chạy file SQL:

```sql
-- Supabase SQL Editor
-- copy nội dung file supabase/commune-admin-metadata.sql và chạy
```

Sau đó kiểm tra:

1. Đăng nhập admin.
2. Vào `Tài khoản` -> `Quản trị xã/phường`.
3. Sửa một xã/phường.
4. Lưu mô tả, từ khóa hoặc ảnh đại diện.
5. Mở trang public của xã/phường đó để xác nhận nội dung đã cập nhật.

## 6. Kiểm Tra Tài Khoản Admin

Tài khoản `super_admin` có quyền:

- Quản lý tài liệu.
- Quản trị xã/phường.
- Tạo/xóa tài khoản quản lý tài liệu.
- Đổi mật khẩu.

Tài khoản `document_manager` chỉ nên dùng để quản lý tài liệu và xã/phường, không có quyền xóa tài khoản khác.

Checklist bảo mật:

1. Đổi mật khẩu mặc định sau khi deploy.
2. Không chia sẻ `SUPABASE_SERVICE_ROLE_KEY`.
3. Kiểm tra đăng xuất sau khi thao tác xong.
4. Nếu nghi ngờ lộ mật khẩu, đổi mật khẩu admin và `ADMIN_SESSION_SECRET`, sau đó redeploy.

## 7. Kiểm Tra Audit Log Quản Trị

Trang `/admin/audit` cần bảng `admin_audit_logs`.

Chạy file SQL:

```sql
-- Supabase SQL Editor
-- copy nội dung file supabase/admin-audit-logs.sql và chạy
```

Sau đó kiểm tra:

1. Đăng nhập admin.
2. Thêm hoặc sửa một tài liệu test.
3. Mở `/admin/audit`.
4. Xác nhận log hiển thị tài khoản thao tác, loại thao tác, đối tượng và thời gian.

## 8. Kiểm Tra Sau Deploy

Sau mỗi lần push/deploy:

1. Mở trang chủ.
2. Mở `/tai-lieu` và thử tìm kiếm.
3. Mở `/xa-phuong` và một trang xã/phường chi tiết.
4. Đăng nhập `/admin/login`.
5. Thử thêm/sửa một tài liệu test.
6. Thử cập nhật một xã/phường test.
7. Kiểm tra Vercel logs nếu có lỗi server-side.

## 9. Hướng Nâng Cấp Sau Này

Chưa cần OCR/AI search ngay. Khi dữ liệu PDF nhiều hơn, nên làm theo thứ tự:

1. OCR PDF thành text.
2. Lưu nội dung OCR vào bảng riêng, ví dụ `document_pages`.
3. Tạo full-text search index cho nội dung OCR.
4. Chỉ sau đó mới thêm AI search hoặc semantic search.
