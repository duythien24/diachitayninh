create table if not exists document_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  event_type text not null check (event_type in ('detail_view', 'pdf_open')),
  visitor_key text not null,
  occurred_on date not null default (timezone('utc', now())::date),
  created_at timestamptz not null default now(),
  unique(document_id, event_type, visitor_key, occurred_on)
);

create index if not exists document_events_document_idx
  on document_events(document_id, event_type);

create index if not exists document_events_date_idx
  on document_events(occurred_on desc);

alter table document_events enable row level security;

-- Không tạo policy public: trình duyệt gửi sự kiện qua API server, quản trị đọc bằng service role.
