import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Database, HardDrive, KeyRound, SearchCheck, ServerCog, XCircle } from "lucide-react";

import { PageShell, SectionHeader } from "@/components/page-shell";
import { getSystemCheckGroups, type SystemCheckStatus } from "@/lib/system-checks";
import { cn } from "@/lib/utils";

const statusStyles: Record<SystemCheckStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  ok: {
    label: "Ổn",
    icon: CheckCircle2,
    className: "bg-palm/10 text-palm"
  },
  warning: {
    label: "Cần xem",
    icon: AlertTriangle,
    className: "bg-gold/15 text-gold"
  },
  error: {
    label: "Lỗi",
    icon: XCircle,
    className: "bg-lacquer/10 text-lacquer"
  }
};

const groupIcons: Record<string, typeof ServerCog> = {
  "Biến môi trường": KeyRound,
  "Kết nối Supabase": HardDrive,
  Database,
  "Tìm kiếm": SearchCheck
};

function countStatus(groups: Awaited<ReturnType<typeof getSystemCheckGroups>>, status: SystemCheckStatus) {
  return groups.flatMap((group) => group.checks).filter((check) => check.status === status).length;
}

export default async function AdminSystemPage() {
  const groups = await getSystemCheckGroups();
  const okCount = countStatus(groups, "ok");
  const warningCount = countStatus(groups, "warning");
  const errorCount = countStatus(groups, "error");

  return (
    <PageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Quản trị"
          title="Kiểm tra hệ thống"
          description="Rà nhanh cấu hình Supabase, bảng dữ liệu, Storage và RPC tìm kiếm sau mỗi lần deploy hoặc cập nhật SQL."
        />
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-ink/12 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
        >
          <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
          Về bảng điều khiển
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { label: "Đang hoạt động", value: okCount, status: "ok" as const },
          { label: "Cần kiểm tra", value: warningCount, status: "warning" as const },
          { label: "Cần sửa", value: errorCount, status: "error" as const }
        ].map((item) => {
          const style = statusStyles[item.status];
          const Icon = style.icon;
          return (
            <div key={item.label} className="rounded border border-ink/10 bg-white p-5 shadow-sm">
              <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded", style.className)}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-2xl font-semibold text-ink">{item.value}</p>
              <p className="mt-1 text-sm text-ink/60">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-5">
        {groups.map((group) => {
          const GroupIcon = groupIcons[group.title] || ServerCog;
          return (
            <section key={group.title} className="overflow-hidden rounded border border-ink/10 bg-white shadow-sm">
              <div className="border-b border-ink/8 bg-paper px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-palm/10 text-palm">
                    <GroupIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-ink">{group.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-ink/60">{group.description}</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-ink/8">
                {group.checks.map((check) => {
                  const style = statusStyles[check.status];
                  const StatusIcon = style.icon;
                  return (
                    <article key={`${group.title}-${check.label}`} className="grid gap-3 px-5 py-4 md:grid-cols-[13rem_1fr_8rem] md:items-start">
                      <p className="font-semibold text-ink">{check.label}</p>
                      <div className="text-sm leading-6 text-ink/62">
                        <p>{check.detail}</p>
                        {check.action ? <p className="mt-1 font-medium text-ink">{check.action}</p> : null}
                      </div>
                      <span className={cn("inline-flex w-fit items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold", style.className)}>
                        <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {style.label}
                      </span>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
