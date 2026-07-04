-- Create or keep profiles protected per authenticated user
alter table if exists public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_select_own'
  ) then
    create policy profiles_select_own
      on public.profiles
      for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_insert_own'
  ) then
    create policy profiles_insert_own
      on public.profiles
      for insert
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_update_own'
  ) then
    create policy profiles_update_own
      on public.profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Keep the profile in sync with the new auth user.
  insert into public.profiles (id, full_name, created_at)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), new.email, 'New User'),
    now()
  )
  on conflict (id) do update
    set full_name = excluded.full_name;

  -- Seed the starter accounts once so registration creates a usable dashboard.
  if not exists (
    select 1
    from public.accounts
    where user_id = new.id
  ) then
    insert into public.accounts (user_id, name, currency, created_at)
    values
      (new.id, 'Cash Wallet', 'PHP', now()),
      (new.id, 'GCash', 'PHP', now()),
      (new.id, 'Maya', 'PHP', now()),
      (new.id, 'Bank Account', 'PHP', now()),
      (new.id, 'Savings Account', 'PHP', now()),
      (new.id, 'Credit Card', 'PHP', now());
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
