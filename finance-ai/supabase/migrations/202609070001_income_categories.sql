-- Add typed categories without changing existing transaction values.
-- Existing and previously untyped categories are expense categories.

alter table public.categories
  add column if not exists category_type text;

update public.categories
set category_type = 'expense'
where category_type is null or category_type not in ('expense', 'income');

alter table public.categories
  alter column category_type set default 'expense';

alter table public.categories
  alter column category_type set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'categories_category_type_check'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_category_type_check
      check (category_type in ('expense', 'income'));
  end if;
end
$$;

-- Category names may be reused across the two independent category lists.
drop index if exists public.idx_categories_user_name;
create unique index if not exists idx_categories_user_name_type
  on public.categories (user_id, lower(trim(name)), category_type);

-- Shared defaults are visible to all authenticated users through the existing
-- categories_select_visible policy. The insert is safe to run repeatedly.
insert into public.categories (user_id, name, category_type)
select null, source.name, 'income'
from (values
  ('Salary'),
  ('Freelance'),
  ('Business'),
  ('Investments'),
  ('Allowance'),
  ('Gifts'),
  ('Other')
) as source(name)
where not exists (
  select 1
  from public.categories existing
  where existing.user_id is null
    and lower(trim(existing.name)) = lower(trim(source.name))
    and existing.category_type = 'income'
);

-- Replace the deployed category RPC with a type-aware version. It still uses
-- auth.uid() and keeps category creation tenant-scoped.
drop function if exists public.create_category(text, text);
drop function if exists public.create_category(uuid, text, text);

create function public.create_category(
  p_name text,
  p_category_type text default 'expense',
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_result public.categories%rowtype;
  v_name text := btrim(p_name);
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_name is null or v_name = '' or char_length(v_name) > 100 then
    raise exception 'Category name is required and must be 100 characters or less' using errcode = '22023';
  end if;
  if p_category_type not in ('expense', 'income') then
    raise exception 'Category type is invalid' using errcode = '22023';
  end if;

  if p_idempotency_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_idempotency_key, 0));
    select * into v_result
    from public.categories c
    where c.user_id = v_user_id and c.idempotency_key = p_idempotency_key;
    if found then
      if lower(v_result.name) <> lower(v_name) or v_result.category_type <> p_category_type then
        raise exception 'Idempotency key was already used with different data' using errcode = '22023';
      end if;
      return to_jsonb(v_result);
    end if;
  end if;

  insert into public.categories (user_id, name, category_type, idempotency_key)
  values (v_user_id, v_name, p_category_type, p_idempotency_key)
  on conflict (user_id, idempotency_key) where idempotency_key is not null do nothing
  returning * into v_result;

  if not found then
    select * into strict v_result
    from public.categories c
    where c.user_id = v_user_id and c.idempotency_key = p_idempotency_key;
    if lower(v_result.name) <> lower(v_name) or v_result.category_type <> p_category_type then
      raise exception 'Idempotency key was already used with different data' using errcode = '22023';
    end if;
  end if;

  return to_jsonb(v_result);
end;
$$;

alter function public.create_category(text, text, text) owner to postgres;
revoke execute on function public.create_category(text, text, text) from public, anon;
grant execute on function public.create_category(text, text, text) to authenticated;
