import "server-only";

import { getCurrentAdmin } from "@/lib/admin-users";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

export type AuditAction =
  | "document.create"
  | "document.update"
  | "document.delete"
  | "featured_document.add"
  | "featured_document.update"
  | "featured_document.remove"
  | "commune.update"
  | "account.create"
  | "account.password_change"
  | "account.delete";

export type AuditEntityType = "document" | "commune" | "account" | "featured_document";

export type AdminAuditLog = {
  id: string;
  actorUsername: string;
  actorRole: string;
  action: AuditAction | string;
  entityType: AuditEntityType | string;
  entityId?: string;
  entityLabel?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type AuditLogRow = {
  id: string;
  actor_username: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function isMissingAuditTable(message?: string) {
  return Boolean(
    message?.includes("admin_audit_logs") &&
      (message.includes("Could not find the table") || message.includes("does not exist") || message.includes("schema cache"))
  );
}

function mapAuditLog(row: AuditLogRow): AdminAuditLog {
  return {
    id: row.id,
    actorUsername: row.actor_username,
    actorRole: row.actor_role,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id || undefined,
    entityLabel: row.entity_label || undefined,
    metadata: row.metadata || {},
    createdAt: row.created_at
  };
}

export async function writeAuditLog({
  action,
  entityType,
  entityId,
  entityLabel,
  metadata = {}
}: {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityLabel?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) return;

  const { error } = await supabase.from("admin_audit_logs").insert({
    actor_username: currentAdmin.username,
    actor_role: currentAdmin.role,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    entity_label: entityLabel || null,
    metadata
  });

  if (error && !isMissingAuditTable(error.message)) {
    console.error("Failed to write admin audit log", error.message);
  }
}

export async function getAdminAuditLogs(limit = 120) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { logs: [] as AdminAuditLog[], error: "Chưa cấu hình Supabase service role." };
  }

  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("id,actor_username,actor_role,action,entity_type,entity_id,entity_label,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return {
      logs: [] as AdminAuditLog[],
      error: isMissingAuditTable(error.message)
        ? "Chưa có bảng admin_audit_logs. Hãy chạy file supabase/admin-audit-logs.sql trong Supabase."
        : error.message
    };
  }

  return {
    logs: (data || []).map((row) => mapAuditLog(row as AuditLogRow)),
    error: null
  };
}
