import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  CircleHelp,
  FilePlus2,
  FileText,
  HardDrive,
  Newspaper,
  ServerCog,
  ShieldCheck,
  Users
} from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";
import { getCurrentAdmin } from "@/lib/admin-users";
import { getAdminCommunes, getAdminDocuments, usingMockData } from "@/lib/repository";

const adminLinks = [
  {
    href: "/admin/statistics",
    label: "Thống kê dữ liệu",
    icon: BarChart3,
    primary: true
  },
  {
    href: "/admin/system",
    label: "Kiểm tra hệ thống",
    icon: ServerCog
  },
  {
    href: "/admin/huong-dan",
    label: "Hướng dẫn quản trị",
    icon: CircleHelp
  },
  {
    href: "/admin/audit",
    label: "Lịch sử thao tác",
    icon: Activity
  },
  {
    href: "/admin/documents",
    label: "Quản lý tài liệu",
    icon: FileText
  },
  {
    href: "/admin/documents/new",
    label: "Thêm tài liệu",
    icon: FilePlus2
  },
  {
    href: "/admin/files",
    label: "Quản lý file Storage",
    icon: HardDrive
  },
  {
    href: "/admin/communes",
    label: "Quản trị xã/phường",
    icon: Building2
  }
];

export default async function AdminPage() {
  const [documents, communes, currentAdmin] = await Promise.all([
    getAdminDocuments(),
    getAdminCommunes(),
    getCurrentAdmin()
  ]);
  const isMock = usingMockData();
  const communeDocumentCount = documents.filter((document) => document.documentType === "dia_chi").length;
  const newspaperDocumentCount = documents.filter((document) => document.documentType === "bao_tay_ninh").length;
  const provincialDocumentCount = documents.filter((document) => document.documentType === "tai_lieu_cap_tinh").length;
  const previewDocumentCount = documents.filter((document) => document.isPreviewOnly).length;
  const fullDocumentCount = documents.length - previewDocumentCount;
  const missingPageCount = documents.filter((document) => !document.pageCount).length;
  const missingKeywordCount = documents.filter((document) => !document.keywords?.length).length;
  const missingCommuneLinkCount = documents.filter(
    (document) => document.documentType !== "tai_lieu_cap_tinh" && !document.communeIds?.length && !document.communeId
  ).length;
  const qualityItems = [
    {
      label: "Thiếu số trang",
      value: missingPageCount,
      description: "Nên bổ sung để người đọc biết dung lượng tài liệu.",
      warning: missingPageCount > 0
    },
    {
      label: "Thiếu từ khóa",
      value: missingKeywordCount,
      description: "Từ khóa giúp tìm kiếm và gợi ý tài liệu liên quan chính xác hơn.",
      warning: missingKeywordCount > 0
    },
    {
      label: "Chưa gắn xã/phường",
      value: missingCommuneLinkCount,
      description: "Chỉ tính tài liệu địa chí hoặc báo chí cần gắn địa phương.",
      warning: missingCommuneLinkCount > 0
    }
  ];

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Quản trị"
        title="Bảng điều khiển tài liệu"
        description="Theo dõi số lượng tài liệu theo từng nhóm, chất lượng metadata và truy cập nhanh các công cụ quản trị nội dung."
      />

      {isMock ? (
        <div className="mt-6 rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm leading-6 text-lacquer">
          Chưa cấu hình Supabase env, nên admin đang xem dữ liệu mẫu. Điền `.env.local` để bật lưu thật.
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          { label: "Tài liệu cấp xã", value: communeDocumentCount, icon: FileText },
          { label: "Tài liệu báo", value: newspaperDocumentCount, icon: Newspaper },
          { label: "Tài liệu cấp tỉnh", value: provincialDocumentCount, icon: ShieldCheck },
          { label: "Xã/phường", value: communes.length, icon: Building2 }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-lacquer" aria-hidden="true" />
              <p className="mt-4 text-2xl font-semibold text-ink">{item.value}</p>
              <p className="mt-1 text-sm text-ink/60">{item.label}</p>
            </div>
          );
        })}
      </div>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Chất lượng dữ liệu</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Việc nên rà soát trước khi công bố rộng rãi</h2>
            </div>
            <Link
              href="/admin/documents"
              className="inline-flex min-h-10 items-center rounded border border-ink/10 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
            >
              Mở danh sách tài liệu
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {qualityItems.map((item) => {
              const Icon = item.warning ? AlertTriangle : CheckCircle2;
              return (
                <div key={item.label} className="rounded border border-ink/10 bg-paper/70 p-4">
                  <Icon className={item.warning ? "h-5 w-5 text-gold" : "h-5 w-5 text-palm"} aria-hidden="true" />
                  <p className="mt-4 text-2xl font-semibold text-ink">{item.value}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/58">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-lacquer">Trạng thái đọc</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Preview / toàn văn</h2>
          <div className="mt-5 space-y-3">
            <div className="rounded border border-palm/15 bg-palm/8 p-4">
              <p className="text-2xl font-semibold text-palm">{fullDocumentCount}</p>
              <p className="mt-1 text-sm text-ink/62">Tài liệu đọc đầy đủ</p>
            </div>
            <div className="rounded border border-gold/20 bg-gold/10 p-4">
              <p className="text-2xl font-semibold text-ink">{previewDocumentCount}</p>
              <p className="mt-1 text-sm text-ink/62">Tài liệu chỉ đọc thử</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        {adminLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.primary
                  ? "inline-flex min-h-11 items-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
                  : "inline-flex min-h-11 items-center gap-2 rounded border border-ink/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/admin/accounts"
          className="inline-flex min-h-11 items-center gap-2 rounded border border-ink/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          {currentAdmin?.role === "super_admin" ? "Tài khoản và mật khẩu" : "Đổi mật khẩu"}
        </Link>
      </div>
    </PageShell>
  );
}
