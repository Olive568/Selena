-- Let authenticated users see shared category and account rows while keeping
-- their own records protected.

alter table if exists public.categories enable row level security;
alter table if exists public.accounts enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'categories_select_visible'
  ) then
    create policy categories_select_visible
      on public.categories
      for select
      using (user_id is null or auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'categories_insert_own'
  ) then
    create policy categories_insert_own
      on public.categories
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'categories_update_own'
  ) then
    create policy categories_update_own
      on public.categories
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'categories_delete_own'
  ) then
    create policy categories_delete_own
      on public.categories
      for delete
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'accounts'
      and policyname = 'accounts_select_visible'
  ) then
    create policy accounts_select_visible
      on public.accounts
      for select
      using (user_id is null or auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'accounts'
      and policyname = 'accounts_insert_own'
  ) then
    create policy accounts_insert_own
      on public.accounts
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'accounts'
      and policyname = 'accounts_update_own'
  ) then
    create policy accounts_update_own
      on public.accounts
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'accounts'
      and policyname = 'accounts_delete_own'
  ) then
    create policy accounts_delete_own
      on public.accounts
      for delete
      using (auth.uid() = user_id);
  end if;
end
$$;
