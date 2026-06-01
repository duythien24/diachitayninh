create index if not exists documents_search_idx
on documents
using gin (
  to_tsvector(
    'simple',
    concat_ws(
      ' ',
      title,
      coalesce(description, ''),
      coalesce(source, ''),
      coalesce(author, ''),
      coalesce(publisher, ''),
      coalesce(year::text, ''),
      coalesce(array_to_string(keywords, ' '), '')
    )
  )
);

create or replace function search_documents(
  search_query text default '',
  filter_type document_type default null,
  result_limit int default 120
)
returns table(document_id uuid, rank real)
language sql
stable
as $$
  with prepared as (
    select
      nullif(trim(search_query), '') as query_text,
      greatest(1, least(coalesce(result_limit, 120), 300)) as max_rows
  ),
  indexed_documents as (
    select
      d.id,
      d.created_at,
      to_tsvector(
        'simple',
        concat_ws(
          ' ',
          d.title,
          coalesce(d.description, ''),
          coalesce(d.source, ''),
          coalesce(d.author, ''),
          coalesce(d.publisher, ''),
          coalesce(d.year::text, ''),
          coalesce(array_to_string(d.keywords, ' '), '')
        )
      ) as search_vector
    from documents d
    where filter_type is null or d.document_type = filter_type
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
    case when prepared.query_text is null then indexed_documents.created_at end desc,
    case
      when prepared.query_text is not null
      then ts_rank(indexed_documents.search_vector, websearch_to_tsquery('simple', prepared.query_text))
    end desc,
    indexed_documents.created_at desc
  limit (select max_rows from prepared);
$$;
