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
- `ADMIN_SESSION_SECRET`

Ghi chú:

- `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng server-side, không đưa ra client.
- `ADMIN_SESSION_SECRET` nên là chuỗi mạnh, khác mật khẩu admin.
- Sau khi đổi env, cần redeploy Vercel.

## 4. Kiểm Tra Hệ Thống Sau Deploy

Đăng nhập admin rồi mở:

```txt
/admin/system
```

Trang này kiểm tra nhanh:

- Env Supabase và session admin.
- Kết nối public/admin Supabase.
- Bucket Storage.
- Các bảng `communes`, `documents`, `document_communes`, `admin_users`, `admin_audit_logs`.
- RPC `search_documents`.

Nếu mục nào báo lỗi, làm theo dòng hướng dẫn hiển thị trong trang trước khi tiếp tục nhập dữ liệu.

## 5. Kiểm Tra Search RPC

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

## 6. Kiểm Tra Metadata Xã/Phường

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

## 7. Kiểm Tra Tài Khoản Admin

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

## 8. Kiểm Tra Audit Log Quản Trị

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

## 9. Kiểm Tra Sau Deploy

Sau mỗi lần push/deploy:

1. Mở trang chủ.
2. Mở `/tai-lieu` và thử tìm kiếm.
3. Mở `/xa-phuong` và một trang xã/phường chi tiết.
4. Đăng nhập `/admin/login`.
5. Mở `/admin/system` để kiểm tra SQL/env.
6. Thử thêm/sửa một tài liệu test.
7. Thử cập nhật một xã/phường test.
8. Kiểm tra Vercel logs nếu có lỗi server-side.

## 10. Cache Ảnh Bìa Từ Kho Thư Viện Tỉnh

Các tài liệu nhập từ `thuvien.tayninh.gov.vn` có thể có ảnh bìa dạng link động. Để ảnh hiển thị ổn định trên Vercel, nên cache ảnh bìa về thư mục public của dự án.

Chạy lệnh:

```bash
npm run cache:thuvien-covers
```

Lệnh này sẽ:

1. Tìm các tài liệu có `cover_image_url` đang trỏ về `thuvien.tayninh.gov.vn`.
2. Tải ảnh bìa về `public/thuvien-covers`.
3. Cập nhật lại `cover_image_url` trong Supabase thành đường dẫn nội bộ dạng `/thuvien-covers/ten-file.jpg`.
4. Ghi report vào `tmp/thuvien-cover-cache-report.json`.

Sau khi chạy xong cần:

1. Chạy `npm run build`.
2. Commit thư mục `public/thuvien-covers`.
3. Push lên GitHub để Vercel deploy ảnh mới.

## 11. Hướng Nâng Cấp Sau Này

Chưa cần OCR/AI search ngay. Khi dữ liệu PDF nhiều hơn, nên làm theo thứ tự:

1. OCR PDF thành text.
2. Lưu nội dung OCR vào bảng riêng, ví dụ `document_pages`.
3. Tạo full-text search index cho nội dung OCR.
4. Chỉ sau đó mới thêm AI search hoặc semantic search.

## 12. Checklist Sau Khi Nâng Schema

Chạy checklist này mỗi khi cập nhật SQL hoặc deploy code mới có thay đổi Supabase.

1. Chạy đầy đủ các file SQL liên quan:
   - `supabase/upgrade-document-metadata.sql`
   - `supabase/search-documents.sql`
   - `supabase/commune-admin-metadata.sql`
   - `supabase/admin-audit-logs.sql`
   - `supabase/add-admin-users.sql`
2. Mở `/admin/system` và kiểm tra tất cả nhóm đang ở trạng thái ổn.
3. Test thêm tài liệu địa chí gắn ít nhất 2 xã/phường.
4. Test thêm tài liệu Báo Tây Ninh, có thể gắn xã/phường hoặc để theo phạm vi báo chí.
5. Test thêm tài liệu cấp tỉnh, không chọn xã/phường.
6. Vào `/tai-lieu` tìm theo tên tài liệu, năm, tác giả hoặc nhà xuất bản.
7. Vào trang chi tiết tài liệu để kiểm tra tác giả, nhà xuất bản, số trang, từ khóa và nhiều xã/phường.
8. Vào `/admin/audit` kiểm tra thao tác thêm/sửa/xóa đã được ghi log.

Nếu `/admin/system` báo lỗi thiếu cột, ưu tiên sửa Supabase trước khi sửa giao diện.

## 13. Checklist Kiểm Thử Nhanh Trước Khi Bàn Giao

1. Trang chủ hiển thị đủ 3 kho: địa chí, báo chí, cấp tỉnh.
2. Header hiển thị đúng trạng thái đăng nhập và menu tài khoản.
3. `/tai-lieu` tìm kiếm và lọc không bị trắng trang.
4. `/xa-phuong` ưu tiên xã/phường có tài liệu và vẫn hiển thị xã/phường chưa có tài liệu.
5. Trang chi tiết xã/phường hiển thị mô tả, tài liệu liên quan và metadata nếu có.
6. Trang đọc PDF mở được file public từ Supabase Storage.
7. Tài khoản admin cao nhất xóa được tài khoản thường, tài khoản thường không xóa được admin.
8. Đổi mật khẩu xong đăng xuất rồi đăng nhập lại bằng mật khẩu mới.
