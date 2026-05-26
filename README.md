# Địa chí số Tây Ninh

MVP Next.js + TypeScript + Tailwind cho cổng đọc thử tài liệu địa chí Tây Ninh.

## Chức năng đã dựng

- Trang chủ
- Danh sách 96 xã/phường
- Trang chi tiết từng xã/phường
- Danh sách tài liệu địa chí và Báo Tây Ninh
- Trang chi tiết tài liệu
- Trang đọc PDF online bằng `iframe`
- Khu quản trị mock cho thêm/sửa/xóa tài liệu
- Schema Supabase ban đầu tại `supabase/schema.sql`

## Chạy local

```bash
npm install
npm run dev
```

Sau đó mở `http://localhost:3000`.

## Biến môi trường

Sao chép `.env.example` thành `.env.local` và điền thông tin Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=documents-preview
NEXT_PUBLIC_LIBRARY_CONTACT_URL=
ADMIN_USERNAME=admin
ADMIN_PASSWORD=
```

Khi chưa điền Supabase env, app tự dùng mock data để xem giao diện. Khi đã điền env, các trang public đọc từ bảng `communes`, `documents`; khu quản trị dùng service role để thêm/sửa/xóa và upload file vào bucket `documents-preview`.

Khu `/admin` được khóa bằng Basic Auth khi có `ADMIN_PASSWORD`. Trên Vercel cần thêm cả `ADMIN_USERNAME` và `ADMIN_PASSWORD` vào Environment Variables.

## Nguyên tắc PDF

- Chỉ upload bản preview khoảng 10 trang.
- Không upload bản full lên website public.
- Đóng watermark: `Bản đọc tham khảo - Thư viện tỉnh Tây Ninh`.
- Bản full phục vụ qua nút liên hệ thư viện.

## Kiểm tra trước khi deploy

```bash
npm run lint
npm run build
```

## Deploy Vercel

Thêm các biến môi trường trên Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_LIBRARY_CONTACT_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Không đưa `.env.local` lên Git hoặc gửi service role key cho phía client.
