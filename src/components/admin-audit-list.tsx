"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, FileClock, KeyRound, Library, Search, UserCircle } from "lucide-react";

import type { AdminAuditLog } from "@/lib/audit-log";
import { normalizeVietnamese } from "@/lib/utils";

type AuditFilter = "all" | "document" | "commune" | "account";

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    "document.create": "Thêm tài liệu",
    "document.update": "Sửa tài liệu",
    "document.delete": "Xóa tài liệu",
    "commune.update": "Sửa xã/phường",
    "account.create": "Tạo tài khoản",
    "account.password_change": "Đổi mật khẩu",
    "account.delete": "Xóa tài khoản"
  };

  return labels[action] || action;
}

function actionIcon(action: string) {
  if (action.startsWith("document.")) return FileClock;
  if (action.startsWith("commune.")) return Library;
  if (action.startsWith("account.")) return KeyRound;
  return Activity;
}

function entityHref(entityType: string, entityId?: string) {
  if (!entityId) return null;
  if (entityType === "document") return `/admin/documents/${entityId}/edit`;
  if (entityType === "commune") return `/admin/communes/${entityId}/edit`;
  return null;
}

function formatMetadata(metadata: Record<string, unknown>) {
  const entries = Object.entries(metadata).filter(([, value]) => value !== null && value !== undefined && value !== "");
  if (!entries.length) return null;

  return entries
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
      const text = Array.isArray(value) ? value.join(", ") : String(value);
      return `${label}: ${text}`;
    })
    .join(" · ");
}

export function AdminAuditList({ logs }: { logs: AdminAuditLog[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AuditFilter>("all");

  const filteredLogs = useMemo(() => {
    const normalizedQuery = normalizeVietnamese(query.trim());

    return logs.filter((log) => {
      if (filter !== "all" && log.entityType !== filter) return false;
      if (!normalizedQuery) return true;

      return normalizeVietnamese(
        [
          actionLabel(log.action),
          log.action,
          log.entityType,
          log.entityLabel || "",
          log.entityId || "",
          log.actorUsername,
          log.actorRole,
          formatMetadata(log.metadata) || ""
        ].join(" ")
      ).includes(normalizedQuery);
    });
  }, [filter, logs, query]);

  return (
    <section className="mt-8 overflow-hidden rounded border border-ink/10 bg-white shadow-sm">
      <div className="border-b border-ink/8 bg-paper px-5 py-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_14rem]">
          <label className="flex min-h-11 items-center gap-3 rounded border border-ink/10 bg-white px-3 text-ink/55">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Tìm lịch sử thao tác</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
              placeholder="Tìm theo tài khoản, thao tác, tài liệu..."
            />
          </label>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as AuditFilter)}
            className="min-h-11 rounded border border-ink/10 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-palm"
          >
            <option value="all">Tất cả thao tác</option>
            <option value="document">Tài liệu</option>
            <option value="commune">Xã/phường</option>
            <option value="account">Tài khoản</option>
          </select>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink/70">
          <Activity className="h-4 w-4" aria-hidden="true" />
          {filteredLogs.length} / {logs.length} thao tác
        </div>
      </div>

      <div className="divide-y divide-ink/8">
        {filteredLogs.length ? (
          filteredLogs.map((log) => {
            const Icon = actionIcon(log.action);
            const href = entityHref(log.entityType, log.entityId);
            const metadata = formatMetadata(log.metadata);

            return (
              <article key={log.id} className="grid gap-4 px-5 py-4 md:grid-cols-[2.5rem_1fr_14rem]">
                <span className="grid h-10 w-10 place-items-center rounded bg-paper text-palm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{actionLabel(log.action)}</p>
                    <span className="rounded bg-palm/10 px-2 py-0.5 text-xs font-semibold text-palm">
                      {log.entityType}
                    </span>
                  </div>
                  {href ? (
                    <Link href={href} className="mt-1 inline-flex font-medium text-ink hover:text-palm">
                      {log.entityLabel || log.entityId}
                    </Link>
                  ) : (
                    <p className="mt-1 font-medium text-ink">{log.entityLabel || log.entityId || "Không có đối tượng"}</p>
                  )}
                  {metadata ? <p className="mt-2 text-xs leading-5 text-ink/55">{metadata}</p> : null}
                </div>
                <div className="text-sm text-ink/60 md:text-right">
                  <p className="inline-flex items-center gap-1.5 font-semibold text-ink">
                    <UserCircle className="h-4 w-4" aria-hidden="true" />
                    {log.actorUsername}
                  </p>
                  <p className="mt-1 text-xs">{log.actorRole}</p>
                  <p className="mt-2 text-xs">{new Date(log.createdAt).toLocaleString("vi-VN")}</p>
                </div>
              </article>
            );
          })
        ) : (
          <div className="p-8 text-center text-sm text-ink/60">
            Không có lịch sử thao tác phù hợp với bộ lọc hiện tại.
          </div>
        )}
      </div>
    </section>
  );
}
