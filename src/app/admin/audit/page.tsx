import Link from "next/link";

import { AdminAuditList } from "@/components/admin-audit-list";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getAdminAuditLogs } from "@/lib/audit-log";

export default async function AdminAuditPage() {
  const { logs, error } = await getAdminAuditLogs(180);

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Quản trị"
          title="Lịch sử thao tác"
          description="Theo dõi tài khoản nào đã thêm, sửa, xóa tài liệu, cập nhật xã/phường hoặc quản lý tài khoản."
        />
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center justify-center rounded border border-ink/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
        >
          Về bảng điều khiển
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm leading-6 text-lacquer">
          {error}
        </div>
      ) : null}

      <AdminAuditList logs={logs} />
    </PageShell>
  );
}
