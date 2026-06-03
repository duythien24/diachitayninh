create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_username text not null,
  actor_role text not null default 'document_manager',
  action text not null,
  entity_type text not null,
  entity_id text,
  entity_label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx on admin_audit_logs(created_at desc);
create index if not exists admin_audit_logs_actor_idx on admin_audit_logs(actor_username);
create index if not exists admin_audit_logs_entity_idx on admin_audit_logs(entity_type, entity_id);
