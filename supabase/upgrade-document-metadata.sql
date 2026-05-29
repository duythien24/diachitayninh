create extension if not exists "pgcrypto";

alter type document_type add value if not exists 'tai_lieu_cap_tinh';

create table if not exists document_communes (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  commune_id uuid not null references communes(id) on delete cascade,
  created_at timestamptz default now(),
  unique(document_id, commune_id)
);

alter table documents
  add column if not exists page_count int,
  add column if not exists preview_page_count int default 10,
  add column if not exists keywords text[],
  add column if not exists author text,
  add column if not exists publisher text;

insert into document_communes (document_id, commune_id)
select id, commune_id
from documents
where commune_id is not null
on conflict (document_id, commune_id) do nothing;

create index if not exists document_communes_document_id_idx on document_communes(document_id);
create index if not exists document_communes_commune_id_idx on document_communes(commune_id);
create index if not exists documents_title_idx on documents using gin (to_tsvector('simple', title));
create index if not exists documents_description_idx on documents using gin (to_tsvector('simple', coalesce(description, '')));

alter table document_communes enable row level security;

drop policy if exists "Public can read document commune links" on document_communes;
create policy "Public can read document commune links"
  on document_communes for select
  using (true);
