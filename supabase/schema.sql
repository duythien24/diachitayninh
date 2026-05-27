create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'document_type') then
    create type document_type as enum ('dia_chi', 'bao_tay_ninh', 'tai_lieu_cap_tinh');
  elsif not exists (
    select 1
    from pg_enum
    where enumtypid = 'document_type'::regtype
      and enumlabel = 'tai_lieu_cap_tinh'
  ) then
    alter type document_type add value 'tai_lieu_cap_tinh';
  end if;
end
$$;

create table if not exists communes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('xa', 'phuong')),
  district_old text,
  description text,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  document_type document_type not null,
  commune_id uuid references communes(id) on delete set null,
  year integer,
  description text,
  source text,
  preview_file_url text not null,
  cover_image_url text,
  is_preview_only boolean not null default true,
  contact_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_document_type_idx on documents(document_type);
create index if not exists documents_commune_id_idx on documents(commune_id);
create index if not exists communes_slug_idx on communes(slug);
create index if not exists documents_slug_idx on documents(slug);
create index if not exists admin_users_username_idx on admin_users(username);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists documents_set_updated_at on documents;
create trigger documents_set_updated_at
  before update on documents
  for each row
  execute function set_updated_at();

drop trigger if exists admin_users_set_updated_at on admin_users;
create trigger admin_users_set_updated_at
  before update on admin_users
  for each row
  execute function set_updated_at();

alter table communes enable row level security;
alter table documents enable row level security;
alter table admin_users enable row level security;

drop policy if exists "Public can read communes" on communes;
create policy "Public can read communes"
  on communes for select
  using (true);

drop policy if exists "Public can read preview documents" on documents;
create policy "Public can read preview documents"
  on documents for select
  using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents-preview',
  'documents-preview',
  true,
  52428800,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read preview files" on storage.objects;
create policy "Public can read preview files"
  on storage.objects for select
  using (bucket_id = 'documents-preview');
