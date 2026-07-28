-- ============================================================
-- Full schema migration: tables + RLS + auto-profile trigger
-- Run this entire file in the Supabase SQL editor.
-- ============================================================

-- 1. TABLES
-- ------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  created_at timestamptz default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  institution text,
  currency text default 'PHP',
  created_at timestamptz default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  merchant text not null,
  amount numeric not null,
  transaction_type text not null check (transaction_type in ('income', 'expense', 'transfer')),
  category text,
  payment_method text,
  notes text,
  receipt_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  from_account_id uuid references public.accounts(id) on delete set null,
  to_account_id uuid references public.accounts(id) on delete set null,
  amount numeric not null,
  date date not null,
  notes text,
  created_at timestamptz default now()
);

-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table if exists public.profiles enable row level security;
alter table if exists public.categories enable row level security;
alter table if exists public.accounts enable row level security;
alter table if exists public.transactions enable row level security;
alter table if exists public.transfers enable row level security;

-- Profiles
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own') then
    create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_insert_own') then
    create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own') then
    create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

-- Categories
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_select_visible') then
    create policy categories_select_visible on public.categories for select using (user_id is null or auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_insert_own') then
    create policy categories_insert_own on public.categories for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_update_own') then
    create policy categories_update_own on public.categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_delete_own') then
    create policy categories_delete_own on public.categories for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Accounts
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'accounts' and policyname = 'accounts_select_visible') then
    create policy accounts_select_visible on public.accounts for select using (user_id is null or auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'accounts' and policyname = 'accounts_insert_own') then
    create policy accounts_insert_own on public.accounts for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'accounts' and policyname = 'accounts_update_own') then
    create policy accounts_update_own on public.accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'accounts' and policyname = 'accounts_delete_own') then
    create policy accounts_delete_own on public.accounts for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Transactions
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'transactions_select_own') then
    create policy transactions_select_own on public.transactions for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'transactions_insert_own') then
    create policy transactions_insert_own on public.transactions for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'transactions_update_own') then
    create policy transactions_update_own on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'transactions_delete_own') then
    create policy transactions_delete_own on public.transactions for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Transfers
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transfers' and policyname = 'transfers_select_own') then
    create policy transfers_select_own on public.transfers for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transfers' and policyname = 'transfers_insert_own') then
    create policy transfers_insert_own on public.transfers for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transfers' and policyname = 'transfers_update_own') then
    create policy transfers_update_own on public.transfers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transfers' and policyname = 'transfers_delete_own') then
    create policy transfers_delete_own on public.transfers for delete using (auth.uid() = user_id);
  end if;
end $$;

-- 3. AUTO-PROFILE TRIGGER
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, created_at)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), new.email, 'New User'),
    now()
  )
  on conflict (id) do update
    set full_name = excluded.full_name;

  if not exists (select 1 from public.accounts where user_id = new.id) then
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
