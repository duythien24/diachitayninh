import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenCheck,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  KeyRound,
  Library,
  Link2,
  ListChecks,
  Search,
  ShieldCheck,
  Upload
} from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Hướng dẫn quản trị",
  description: "Checklist nhập tài liệu, quản lý metadata và vận hành khu quản trị Địa chí số Tây Ninh."
};

const documentSteps = [
  {
    title: "Chọn đúng loại tài liệu",
    description:
      "Địa chí dùng cho sách/tư liệu gắn địa phương; Báo Tây Ninh dùng cho số báo, bài báo, chuyên đề báo chí; Tài liệu cấp tỉnh dùng cho tư liệu chung không gắn riêng xã/phường.",
    icon: Library
  },
  {
    title: "Gắn xã/phường khi có liên quan",
    description:
      "Địa chí và Báo Tây Ninh có thể chọn nhiều xã/phường. Tài liệu cấp tỉnh thì để phạm vi cấp tỉnh, không chọn địa phương.",
    icon: Link2
  },
  {
    title: "Điền metadata tối thiểu",
    description:
      "Nên có năm xuất bản, mô tả, nguồn, số trang, tác giả/NXB nếu biết và từ khóa. Metadata càng đủ thì tìm kiếm và gợi ý liên quan càng chính xác.",
    icon: FileText
  },
  {
    title: "Kiểm tra file trước khi lưu",
    description:
      "PDF tối đa 50MB. Ảnh bìa hỗ trợ JPG, PNG, WEBP tối đa 5MB. Nếu chỉ cho đọc thử, chỉ upload bản preview có watermark.",
    icon: Upload
  }
];

const qualityChecks = [
  "Tiêu đề rõ ràng, không trùng nghĩa với tài liệu đã có.",
  "Slug ngắn, không dấu, dễ nhận biết; hệ thống sẽ tự thêm hậu tố nếu bị trùng.",
  "Mô tả đủ 2-4 câu, nêu nội dung chính và phạm vi địa phương.",
  "Tài liệu preview phải ghi đúng số trang xem thử.",
  "Tài liệu bản đầy đủ chỉ bật khi file upload thật sự là toàn văn được phép công bố.",
  "Từ khóa cách nhau bằng dấu phẩy, ví dụ: lịch sử, di tích, văn hóa, nhân vật.",
  "Ảnh bìa rõ, đúng tài liệu; tránh ảnh quá mờ hoặc không liên quan.",
  "Sau khi lưu, mở trang chi tiết và trang đọc PDF để kiểm tra."
];

const adminTasks = [
  {
    title: "Quản lý tài liệu",
    href: "/admin/documents",
    description: "Xem danh sách theo 3 nhóm, lọc theo năm/trạng thái, sửa metadata hoặc xóa tài liệu.",
    icon: FileText
  },
  {
    title: "Thêm tài liệu",
    href: "/admin/documents/new",
    description: "Upload PDF/ảnh bìa, chọn loại tài liệu, gắn xã/phường và chọn chế độ đọc.",
    icon: Upload
  },
  {
    title: "Quản trị xã/phường",
    href: "/admin/communes",
    description: "Bổ sung mô tả, ảnh đại diện và từ khóa cho từng xã/phường.",
    icon: Library
  },
  {
    title: "Thống kê dữ liệu",
    href: "/admin/statistics",
    description: "Xem độ phủ tài liệu, tài liệu thiếu metadata và nhóm cần hoàn thiện trước.",
    icon: Search
  },
  {
    title: "Lịch sử thao tác",
    href: "/admin/audit",
    description: "Tra lại ai đã thêm, sửa, xóa tài liệu, xã/phường hoặc tài khoản.",
    icon: ListChecks
  },
  {
    title: "Tài khoản và mật khẩu",
    href: "/admin/accounts",
    description: "Đổi mật khẩu, tạo tài khoản quản lý tài liệu và xóa tài khoản không còn dùng.",
    icon: KeyRound
  }
];

export default function AdminGuidePage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Quản trị"
        title="Hướng dẫn nhập liệu và vận hành"
        description="Dùng trang này như checklist nội bộ trước khi thêm tài liệu mới, sửa metadata hoặc bàn giao cho cán bộ thư viện sử dụng."
      />

      <section className="mt-8 grid gap-5 lg:grid-cols-4">
        {documentSteps.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded bg-palm text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/64">{item.description}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-palm" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-ink">Checklist trước khi bấm lưu</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {qualityChecks.map((item) => (
              <div key={item} className="flex gap-3 rounded border border-ink/8 bg-paper/70 p-3 text-sm leading-6 text-ink/70">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-palm" aria-hidden="true" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded border border-gold/20 bg-gold/10 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-gold" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink">Nguyên tắc an toàn</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              Không upload bản toàn văn nếu chưa được phép công bố. Với tài liệu hạn chế, chỉ upload bản preview có watermark và để chế độ đọc thử.
            </p>
          </div>

          <div className="rounded border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-palm" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink">Ảnh bìa</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              Ưu tiên ảnh bìa thật của tài liệu. Nếu chưa có ảnh, nên dùng ảnh chụp bìa/tờ đầu thay vì ảnh minh họa chung.
            </p>
          </div>

          <Link
            href="/admin/documents/new"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Thêm tài liệu mới
          </Link>
        </aside>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <BookOpenCheck className="h-6 w-6 text-lacquer" aria-hidden="true" />
          <h2 className="text-2xl font-semibold text-ink">Các khu vực quản trị</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminTasks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex h-full min-h-36 flex-col rounded border border-ink/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-palm/30 hover:shadow-soft"
              >
                <span className="grid h-10 w-10 place-items-center rounded bg-paper text-palm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-4 font-semibold text-ink group-hover:text-palm">{item.title}</span>
                <span className="mt-2 text-sm leading-6 text-ink/62">{item.description}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
