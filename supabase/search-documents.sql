create or replace function documents_search_text(
  p_title text,
  p_description text,
  p_source text,
  p_author text,
  p_publisher text,
  p_year int,
  p_keywords text[]
)
returns text
language sql
immutable
as $$
  select
    coalesce(p_title, '') || ' ' ||
    coalesce(p_description, '') || ' ' ||
    coalesce(p_source, '') || ' ' ||
    coalesce(p_author, '') || ' ' ||
    coalesce(p_publisher, '') || ' ' ||
    coalesce(p_year::text, '') || ' ' ||
    coalesce(array_to_string(p_keywords, ' '), '');
$$;

create index if not exists documents_search_idx
on documents
using gin (
  to_tsvector(
    'simple',
    documents_search_text(title, description, source, author, publisher, year, keywords)
  )
);

create index if not exists documents_year_idx on documents(year);
create index if not exists documents_author_idx on documents(author);
create index if not exists documents_publisher_idx on documents(publisher);

drop function if exists search_documents(text, document_type, int);

create or replace function search_documents(
  search_query text default '',
  filter_type document_type default null,
  filter_commune_id uuid default null,
  filter_year int default null,
  filter_author text default '',
  filter_publisher text default '',
  result_limit int default 24,
  result_offset int default 0
)
returns table(document_id uuid, rank real)
language sql
stable
as $$
  with prepared as (
    select
      nullif(trim(search_query), '') as query_text,
      nullif(trim(filter_author), '') as author_text,
      nullif(trim(filter_publisher), '') as publisher_text,
      greatest(1, least(coalesce(result_limit, 24), 300)) as max_rows,
      greatest(0, coalesce(result_offset, 0)) as skip_rows
  ),
  indexed_documents as (
    select
      d.id,
      d.created_at,
      to_tsvector(
        'simple',
        documents_search_text(d.title, d.description, d.source, d.author, d.publisher, d.year, d.keywords)
      ) as search_vector
    from documents d
    where
      (filter_type is null or d.document_type = filter_type)
      and (filter_year is null or d.year = filter_year)
      and (
        filter_commune_id is null
        or d.commune_id = filter_commune_id
        or exists (
          select 1
          from document_communes dc
          where dc.document_id = d.id
            and dc.commune_id = filter_commune_id
        )
      )
      and (
        (select author_text from prepared) is null
        or lower(coalesce(d.author, '')) like '%' || lower((select author_text from prepared)) || '%'
      )
      and (
        (select publisher_text from prepared) is null
        or lower(coalesce(d.publisher, '')) like '%' || lower((select publisher_text from prepared)) || '%'
      )
  )
  select
    indexed_documents.id as document_id,
    case
      when prepared.query_text is null then 0::real
      else ts_rank(indexed_documents.search_vector, websearch_to_tsquery('simple', prepared.query_text))
    end as rank
  from indexed_documents, prepared
  where
    prepared.query_text is null
    or indexed_documents.search_vector @@ websearch_to_tsquery('simple', prepared.query_text)
  order by
    case
      when prepared.query_text is not null
      then ts_rank(indexed_documents.search_vector, websearch_to_tsquery('simple', prepared.query_text))
    end desc,
    indexed_documents.created_at desc
  limit (select max_rows from prepared)
  offset (select skip_rows from prepared);
$$;
