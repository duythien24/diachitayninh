alter table communes
  add column if not exists cover_image_url text,
  add column if not exists keywords text[],
  add column if not exists updated_at timestamptz not null default now();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists communes_set_updated_at on communes;
create trigger communes_set_updated_at
  before update on communes
  for each row
  execute function set_updated_at();
