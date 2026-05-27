create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  role text not null default 'document_manager' check (role in ('super_admin', 'document_manager')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table admin_users
  add column if not exists role text not null default 'document_manager';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'admin_users_role_check'
  ) then
    alter table admin_users
      add constraint admin_users_role_check
      check (role in ('super_admin', 'document_manager'));
  end if;
end
$$;

create index if not exists admin_users_username_idx on admin_users(username);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists admin_users_set_updated_at on admin_users;
create trigger admin_users_set_updated_at
  before update on admin_users
  for each row
  execute function set_updated_at();

alter table admin_users enable row level security;
