do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'document_type'::regtype
      and enumlabel = 'tai_lieu_cap_tinh'
  ) then
    alter type document_type add value 'tai_lieu_cap_tinh';
  end if;
end
$$;
