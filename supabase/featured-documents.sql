create table if not exists featured_documents (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  position int not null default 1,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(document_id)
);

create index if not exists featured_documents_active_idx
  on featured_documents(is_active, position, created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists featured_documents_set_updated_at on featured_documents;
create trigger featured_documents_set_updated_at
  before update on featured_documents
  for each row
  execute function set_updated_at();

alter table featured_documents enable row level security;

-- Khong tao public policy: trang chu va admin doc bang service role de quan tri danh sach de xuat.
