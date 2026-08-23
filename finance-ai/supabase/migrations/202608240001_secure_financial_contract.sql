-- Forward-only reconciliation of the financial schema and privileged RPC contract.
-- Existing non-PHP and unlinked legacy rows are preserved; new writes use the secure contract.

alter table public.accounts
  add column if not exists opening_balance bigint not null default 0;
update public.accounts set currency = 'PHP' where currency is null;
alter table public.accounts alter column currency set default 'PHP';
alter table public.accounts alter column currency set not null;

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

alter table public.transactions
  add column if not exists transfer_id uuid;

alter table public.transactions drop constraint if exists transactions_amount_positive;
alter table public.transactions drop constraint if exists transactions_amount_finite;
alter table public.transfers drop constraint if exists transfers_amount_positive;
alter table public.transactions drop constraint if exists transactions_amount_bounds;
alter table public.transfers drop constraint if exists transfers_amount_bounds;
alter table public.accounts drop constraint if exists accounts_opening_balance_bounds;
alter table public.accounts drop constraint if exists accounts_php_only;
alter table public.transfers drop constraint if exists transfers_distinct_accounts;
alter table public.transfers drop constraint if exists transfers_accounts_required;

alter table public.transactions
  add constraint transactions_amount_bounds
  check (amount between 1 and 999999999999) not valid;
alter table public.transfers
  add constraint transfers_amount_bounds
  check (amount between 1 and 999999999999) not valid;
alter table public.accounts
  add constraint accounts_opening_balance_bounds
  check (opening_balance between 0 and 999999999999) not valid;
alter table public.accounts
  add constraint accounts_php_only
  check (currency = 'PHP') not valid;
alter table public.transfers
  add constraint transfers_distinct_accounts
  check (from_account_id <> to_account_id) not valid;
alter table public.transfers
  add constraint transfers_accounts_required
  check (from_account_id is not null and to_account_id is not null) not valid;

alter table public.transfers drop constraint if exists transfers_user_id_id_key;
alter table public.transfers
  add constraint transfers_user_id_id_key unique (user_id, id);

alter table public.transactions drop constraint if exists transactions_transfer_id_fkey;
alter table public.transactions
  add constraint transactions_transfer_id_fkey
  foreign key (user_id, transfer_id) references public.transfers(user_id, id)
  on delete cascade not valid;
drop index if exists public.transactions_transfer_id_key;
create unique index transactions_transfer_id_key on public.transactions (transfer_id);

alter table public.accounts drop constraint if exists accounts_user_id_id_key;
alter table public.accounts
  add constraint accounts_user_id_id_key unique (user_id, id);

alter table public.transactions drop constraint if exists transactions_account_id_fkey;
alter table public.transactions drop constraint if exists transactions_user_account_fkey;
alter table public.transactions
  add constraint transactions_user_account_fkey
  foreign key (user_id, account_id)
  references public.accounts(user_id, id)
  on delete no action deferrable initially deferred not valid;

alter table public.transfers drop constraint if exists transfers_from_account_id_fkey;
alter table public.transfers drop constraint if exists transfers_to_account_id_fkey;
alter table public.transfers drop constraint if exists transfers_user_from_account_fkey;
alter table public.transfers drop constraint if exists transfers_user_to_account_fkey;
alter table public.transfers
  add constraint transfers_user_from_account_fkey
  foreign key (user_id, from_account_id)
  references public.accounts(user_id, id)
  on delete no action deferrable initially deferred not valid;
alter table public.transfers
  add constraint transfers_user_to_account_fkey
  foreign key (user_id, to_account_id)
  references public.accounts(user_id, id)
  on delete no action deferrable initially deferred not valid;

alter table public.transactions drop constraint if exists transactions_idempotency_key_key;
alter table public.transfers drop constraint if exists transfers_idempotency_key_key;
alter table public.categories drop constraint if exists categories_idempotency_key_key;
alter table public.accounts drop constraint if exists accounts_idempotency_key_key;

drop index if exists public.transactions_user_idempotency_key;
drop index if exists public.transfers_user_idempotency_key;
drop index if exists public.categories_user_idempotency_key;
drop index if exists public.accounts_user_idempotency_key;
create unique index transactions_user_idempotency_key
  on public.transactions (user_id, idempotency_key) where idempotency_key is not null;
create unique index transfers_user_idempotency_key
  on public.transfers (user_id, idempotency_key) where idempotency_key is not null;
create unique index categories_user_idempotency_key
  on public.categories (user_id, idempotency_key) where idempotency_key is not null;
create unique index accounts_user_idempotency_key
  on public.accounts (user_id, idempotency_key) where idempotency_key is not null;

create index if not exists transactions_user_date_idx on public.transactions (user_id, date desc);
create index if not exists transactions_account_id_idx on public.transactions (account_id);
create index if not exists transfers_user_date_idx on public.transfers (user_id, date desc);
create index if not exists transfers_from_account_id_idx on public.transfers (from_account_id);
create index if not exists transfers_to_account_id_idx on public.transfers (to_account_id);
create index if not exists accounts_user_id_idx on public.accounts (user_id);
create index if not exists categories_user_id_idx on public.categories (user_id);

create table if not exists public.api_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  window_start timestamptz not null,
  request_count integer not null,
  primary key (user_id, bucket)
);
delete from public.api_rate_limits older
using public.api_rate_limits newer
where older.user_id = newer.user_id
  and older.bucket = newer.bucket
  and older.window_start < newer.window_start;
alter table public.api_rate_limits drop constraint if exists api_rate_limits_pkey;
alter table public.api_rate_limits add constraint api_rate_limits_pkey primary key (user_id, bucket);
alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from public, anon, authenticated;

-- Transfer rows and their projections are writable only through the atomic RPCs.
drop policy if exists transfers_insert_own on public.transfers;
drop policy if exists transfers_update_own on public.transfers;
drop policy if exists transfers_delete_own on public.transfers;
drop policy if exists transactions_insert_own on public.transactions;
drop policy if exists transactions_update_own on public.transactions;
drop policy if exists transactions_delete_own on public.transactions;
create policy transactions_insert_own on public.transactions for insert to authenticated
  with check (auth.uid() = user_id and transfer_id is null and transaction_type in ('income', 'expense'));
create policy transactions_update_own on public.transactions for update to authenticated
  using (auth.uid() = user_id and transfer_id is null)
  with check (auth.uid() = user_id and transfer_id is null and transaction_type in ('income', 'expense'));
create policy transactions_delete_own on public.transactions for delete to authenticated
  using (auth.uid() = user_id and transfer_id is null);

-- Remove every obsolete caller-identity and numeric-money overload by exact signature.
drop function if exists public.create_transaction(uuid, text, numeric, date, text, text, text, text, uuid, text);
drop function if exists public.create_transaction(uuid, text, bigint, date, text, text, text, text, uuid, text);
drop function if exists public.update_transaction(uuid, uuid, text, numeric, date, text, text, text, text, uuid);
drop function if exists public.update_transaction(uuid, uuid, text, bigint, date, text, text, text, text, uuid);
drop function if exists public.delete_transaction(uuid, uuid);
drop function if exists public.restore_transaction(uuid, uuid);
drop function if exists public.delete_transaction_permanent(uuid, uuid);
drop function if exists public.create_transfer(uuid, uuid, uuid, numeric, date, text, text);
drop function if exists public.create_transfer(uuid, uuid, uuid, bigint, date, text, text);
drop function if exists public.create_category(uuid, text, text);
drop function if exists public.create_account(uuid, text, text);
drop function if exists public.check_rate_limit(text, integer, integer);

create or replace function public.create_transaction(
  p_merchant text,
  p_amount bigint,
  p_date date,
  p_notes text default null,
  p_transaction_type text default 'expense',
  p_category text default null,
  p_payment_method text default null,
  p_account_id uuid default null,
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_result public.transactions%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_amount is null or p_amount not between 1 and 999999999999 then
    raise exception 'Amount is outside the supported range' using errcode = '22003';
  end if;
  if p_transaction_type not in ('income', 'expense') then
    raise exception 'Transfers must use create_transfer' using errcode = '22023';
  end if;
  if p_account_id is null or not exists (
    select 1 from public.accounts a
    where a.id = p_account_id and a.user_id = v_user_id and a.currency = 'PHP'
  ) then
    raise exception 'Account not found or access denied' using errcode = '42501';
  end if;
  if nullif(btrim(p_merchant), '') is null or char_length(btrim(p_merchant)) > 200 or p_date is null then
    raise exception 'Merchant is required and must be 200 characters or less' using errcode = '22023';
  end if;

  if p_idempotency_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_idempotency_key, 0));
    select * into v_result from public.transactions t
    where t.user_id = v_user_id and t.idempotency_key = p_idempotency_key;
    if found then
      if v_result.merchant is distinct from btrim(p_merchant) or v_result.amount is distinct from p_amount
        or v_result.date is distinct from p_date or v_result.transaction_type is distinct from p_transaction_type
        or v_result.notes is distinct from p_notes or v_result.category is distinct from p_category
        or v_result.payment_method is distinct from p_payment_method
        or v_result.account_id is distinct from p_account_id then
        raise exception 'Idempotency key was already used with different data' using errcode = '22023';
      end if;
      return to_jsonb(v_result);
    end if;
  end if;

  insert into public.transactions (
    user_id, merchant, amount, date, notes, transaction_type, category,
    payment_method, account_id, idempotency_key
  ) values (
    v_user_id, btrim(p_merchant), p_amount, p_date, p_notes, p_transaction_type,
    p_category, p_payment_method, p_account_id, p_idempotency_key
  )
  on conflict (user_id, idempotency_key) where idempotency_key is not null do nothing
  returning * into v_result;

  if not found then
    select * into strict v_result from public.transactions t
    where t.user_id = v_user_id and t.idempotency_key = p_idempotency_key;
    if v_result.merchant is distinct from btrim(p_merchant) or v_result.amount is distinct from p_amount
      or v_result.date is distinct from p_date or v_result.transaction_type is distinct from p_transaction_type
      or v_result.notes is distinct from p_notes or v_result.category is distinct from p_category
      or v_result.payment_method is distinct from p_payment_method
      or v_result.account_id is distinct from p_account_id then
      raise exception 'Idempotency key was already used with different data' using errcode = '22023';
    end if;
  end if;
  return to_jsonb(v_result);
end;
$$;

create or replace function public.update_transaction(
  p_id uuid,
  p_merchant text,
  p_amount bigint,
  p_date date,
  p_notes text,
  p_transaction_type text,
  p_category text,
  p_payment_method text,
  p_account_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_result public.transactions%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_amount is null or p_amount not between 1 and 999999999999 then
    raise exception 'Amount is outside the supported range' using errcode = '22003';
  end if;
  if p_transaction_type not in ('income', 'expense') then
    raise exception 'Transfers must use update_transfer' using errcode = '22023';
  end if;
  if nullif(btrim(p_merchant), '') is null or char_length(btrim(p_merchant)) > 200 or p_date is null then
    raise exception 'Merchant and date are required' using errcode = '22023';
  end if;
  if p_account_id is null or not exists (
    select 1 from public.accounts a
    where a.id = p_account_id and a.user_id = v_user_id and a.currency = 'PHP'
  ) then
    raise exception 'Account not found or access denied' using errcode = '42501';
  end if;

  update public.transactions set
    merchant = btrim(p_merchant), amount = p_amount, date = p_date, notes = p_notes,
    transaction_type = p_transaction_type, category = p_category,
    payment_method = p_payment_method, account_id = p_account_id, updated_at = now()
  where id = p_id and user_id = v_user_id and transfer_id is null
  returning * into v_result;
  if not found then
    raise exception 'Transaction not found or access denied' using errcode = '42501';
  end if;
  return to_jsonb(v_result);
end;
$$;

create or replace function public.delete_transaction(p_id uuid) returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  delete from public.transactions
  where id = p_id and user_id = v_user_id and transfer_id is null;
  if not found then
    raise exception 'Transaction not found or access denied' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.create_transfer(
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount bigint,
  p_date date,
  p_notes text default null,
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_from_name text;
  v_to_name text;
  v_transfer public.transfers%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_amount is null or p_amount not between 1 and 999999999999 then
    raise exception 'Amount is outside the supported range' using errcode = '22003';
  end if;
  if p_date is null then
    raise exception 'Transfer date is required' using errcode = '22023';
  end if;
  if p_from_account_id = p_to_account_id then
    raise exception 'Source and destination accounts must be different' using errcode = '22023';
  end if;
  select a.name into v_from_name from public.accounts a
  where a.id = p_from_account_id and a.user_id = v_user_id and a.currency = 'PHP';
  select a.name into v_to_name from public.accounts a
  where a.id = p_to_account_id and a.user_id = v_user_id and a.currency = 'PHP';
  if v_from_name is null or v_to_name is null then
    raise exception 'Transfer account not found, unsupported, or access denied' using errcode = '42501';
  end if;

  if p_idempotency_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_idempotency_key, 0));
    select * into v_transfer from public.transfers t
    where t.user_id = v_user_id and t.idempotency_key = p_idempotency_key;
    if found then
      if v_transfer.from_account_id is distinct from p_from_account_id
        or v_transfer.to_account_id is distinct from p_to_account_id
        or v_transfer.amount is distinct from p_amount or v_transfer.date is distinct from p_date
        or v_transfer.notes is distinct from p_notes then
        raise exception 'Idempotency key was already used with different data' using errcode = '22023';
      end if;
    end if;
  end if;

  if v_transfer.id is null then
    insert into public.transfers (
      user_id, from_account_id, to_account_id, amount, date, notes, idempotency_key
    ) values (
      v_user_id, p_from_account_id, p_to_account_id, p_amount, p_date, p_notes, p_idempotency_key
    ) returning * into v_transfer;
  end if;

  insert into public.transactions (
    user_id, merchant, amount, date, notes, transaction_type, category,
    payment_method, transfer_id
  ) values (
    v_user_id, 'Transfer: ' || v_from_name || ' to ' || v_to_name, p_amount,
    p_date, p_notes, 'transfer', 'Transfer', v_from_name || ' to ' || v_to_name,
    v_transfer.id
  ) on conflict (transfer_id) do nothing;
  return to_jsonb(v_transfer);
end;
$$;

create or replace function public.update_transfer(
  p_id uuid,
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount bigint,
  p_date date,
  p_notes text
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_from_name text;
  v_to_name text;
  v_transfer public.transfers%rowtype;
  v_projection_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_amount is null or p_amount not between 1 and 999999999999 then
    raise exception 'Amount is outside the supported range' using errcode = '22003';
  end if;
  if p_date is null then
    raise exception 'Transfer date is required' using errcode = '22023';
  end if;
  if p_from_account_id = p_to_account_id then
    raise exception 'Source and destination accounts must be different' using errcode = '22023';
  end if;
  select a.name into v_from_name from public.accounts a
  where a.id = p_from_account_id and a.user_id = v_user_id and a.currency = 'PHP';
  select a.name into v_to_name from public.accounts a
  where a.id = p_to_account_id and a.user_id = v_user_id and a.currency = 'PHP';
  if v_from_name is null or v_to_name is null then
    raise exception 'Transfer account not found, unsupported, or access denied' using errcode = '42501';
  end if;

  update public.transfers set
    from_account_id = p_from_account_id, to_account_id = p_to_account_id,
    amount = p_amount, date = p_date, notes = p_notes
  where id = p_id and user_id = v_user_id
  returning * into v_transfer;
  if not found then
    raise exception 'Transfer not found or access denied' using errcode = '42501';
  end if;

  insert into public.transactions (
    user_id, merchant, amount, date, notes, transaction_type, category,
    payment_method, transfer_id
  ) values (
    v_user_id, 'Transfer: ' || v_from_name || ' to ' || v_to_name, p_amount,
    p_date, p_notes, 'transfer', 'Transfer', v_from_name || ' to ' || v_to_name,
    v_transfer.id
  ) on conflict (transfer_id) do update set
    merchant = excluded.merchant, amount = excluded.amount, date = excluded.date,
    notes = excluded.notes, payment_method = excluded.payment_method, updated_at = now()
  where public.transactions.user_id = excluded.user_id
  returning id into v_projection_id;
  if v_projection_id is null then
    raise exception 'Transfer projection ownership mismatch' using errcode = '42501';
  end if;
  return to_jsonb(v_transfer);
end;
$$;

create or replace function public.delete_transfer(p_id uuid) returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  delete from public.transfers where id = p_id and user_id = v_user_id;
  if not found then
    raise exception 'Transfer not found or access denied' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.create_category(
  p_name text,
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
  if p_idempotency_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_idempotency_key, 0));
    select * into v_result from public.categories c
    where c.user_id = v_user_id and c.idempotency_key = p_idempotency_key;
    if found then
      if lower(v_result.name) <> lower(v_name) then
        raise exception 'Idempotency key was already used with different data' using errcode = '22023';
      end if;
      return to_jsonb(v_result);
    end if;
  end if;
  insert into public.categories (user_id, name, idempotency_key)
  values (v_user_id, v_name, p_idempotency_key)
  on conflict (user_id, idempotency_key) where idempotency_key is not null do nothing
  returning * into v_result;
  if not found then
    select * into strict v_result from public.categories c
    where c.user_id = v_user_id and c.idempotency_key = p_idempotency_key;
    if lower(v_result.name) <> lower(v_name) then
      raise exception 'Idempotency key was already used with different data' using errcode = '22023';
    end if;
  end if;
  return to_jsonb(v_result);
end;
$$;

create or replace function public.create_account(
  p_name text,
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_result public.accounts%rowtype;
  v_name text := btrim(p_name);
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if v_name is null or v_name = '' or char_length(v_name) > 100 then
    raise exception 'Account name is required and must be 100 characters or less' using errcode = '22023';
  end if;
  if p_idempotency_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_idempotency_key, 0));
    select * into v_result from public.accounts a
    where a.user_id = v_user_id and a.idempotency_key = p_idempotency_key;
    if found then
      if lower(v_result.name) <> lower(v_name) then
        raise exception 'Idempotency key was already used with different data' using errcode = '22023';
      end if;
      return to_jsonb(v_result);
    end if;
  end if;
  insert into public.accounts (user_id, name, currency, idempotency_key)
  values (v_user_id, v_name, 'PHP', p_idempotency_key)
  on conflict (user_id, idempotency_key) where idempotency_key is not null do nothing
  returning * into v_result;
  if not found then
    select * into strict v_result from public.accounts a
    where a.user_id = v_user_id and a.idempotency_key = p_idempotency_key;
    if lower(v_result.name) <> lower(v_name) then
      raise exception 'Idempotency key was already used with different data' using errcode = '22023';
    end if;
  end if;
  return to_jsonb(v_result);
end;
$$;

create or replace function public.set_opening_balances(p_balances jsonb) returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_entry record;
  v_account_id uuid;
  v_amount bigint;
  v_completed_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_balances is null or jsonb_typeof(p_balances) <> 'object' then
    raise exception 'Balances must be a JSON object' using errcode = '22023';
  end if;
  select onboarding_completed_at into v_completed_at
  from public.profiles where id = v_user_id for update;
  if not found then
    raise exception 'Profile not found' using errcode = '42501';
  end if;
  if v_completed_at is not null then
    return;
  end if;
  for v_entry in select * from jsonb_each_text(p_balances)
  loop
    begin
      v_account_id := v_entry.key::uuid;
      v_amount := v_entry.value::bigint;
    exception when invalid_text_representation or numeric_value_out_of_range then
      raise exception 'Invalid opening balance' using errcode = '22023';
    end;
    if v_amount not between 0 and 999999999999 then
      raise exception 'Opening balance is outside the supported range' using errcode = '22003';
    end if;
    update public.accounts set opening_balance = v_amount
    where id = v_account_id and user_id = v_user_id and currency = 'PHP';
    if not found then
      raise exception 'Account not found or access denied' using errcode = '42501';
    end if;
  end loop;
  update public.profiles set onboarding_completed_at = coalesce(onboarding_completed_at, now())
  where id = v_user_id;
end;
$$;

create or replace function public.check_rate_limit(p_bucket text) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := clock_timestamp();
  v_window_start timestamptz;
  v_count integer;
  v_limit integer;
  v_window_seconds integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  case p_bucket
    when 'chat' then v_limit := 20; v_window_seconds := 60;
    when 'delete-account' then v_limit := 5; v_window_seconds := 60;
    else raise exception 'Unknown rate-limit bucket' using errcode = '22023';
  end case;
  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / v_window_seconds) * v_window_seconds
  );
  insert into public.api_rate_limits (user_id, bucket, window_start, request_count)
  values (v_user_id, btrim(p_bucket), v_window_start, 1)
  on conflict (user_id, bucket) do update set
    window_start = case
      when public.api_rate_limits.window_start = excluded.window_start then public.api_rate_limits.window_start
      else excluded.window_start
    end,
    request_count = case
      when public.api_rate_limits.window_start = excluded.window_start then public.api_rate_limits.request_count + 1
      else 1
    end
  returning request_count, window_start into v_count, v_window_start;
  return jsonb_build_object(
    'allowed', v_count <= v_limit,
    'retryAfter', greatest(1, ceil(extract(epoch from (v_window_start + make_interval(secs => v_window_seconds) - v_now))))
  );
end;
$$;

alter function public.create_transaction(text, bigint, date, text, text, text, text, uuid, text) owner to postgres;
alter function public.update_transaction(uuid, text, bigint, date, text, text, text, text, uuid) owner to postgres;
alter function public.delete_transaction(uuid) owner to postgres;
alter function public.create_transfer(uuid, uuid, bigint, date, text, text) owner to postgres;
alter function public.update_transfer(uuid, uuid, uuid, bigint, date, text) owner to postgres;
alter function public.delete_transfer(uuid) owner to postgres;
alter function public.create_category(text, text) owner to postgres;
alter function public.create_account(text, text) owner to postgres;
alter function public.set_opening_balances(jsonb) owner to postgres;
alter function public.check_rate_limit(text) owner to postgres;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.create_transaction(text, bigint, date, text, text, text, text, uuid, text) from public, anon;
revoke execute on function public.update_transaction(uuid, text, bigint, date, text, text, text, text, uuid) from public, anon;
revoke execute on function public.delete_transaction(uuid) from public, anon;
revoke execute on function public.create_transfer(uuid, uuid, bigint, date, text, text) from public, anon;
revoke execute on function public.update_transfer(uuid, uuid, uuid, bigint, date, text) from public, anon;
revoke execute on function public.delete_transfer(uuid) from public, anon;
revoke execute on function public.create_category(text, text) from public, anon;
revoke execute on function public.create_account(text, text) from public, anon;
revoke execute on function public.set_opening_balances(jsonb) from public, anon;
revoke execute on function public.check_rate_limit(text) from public, anon;

grant execute on function public.create_transaction(text, bigint, date, text, text, text, text, uuid, text) to authenticated;
grant execute on function public.update_transaction(uuid, text, bigint, date, text, text, text, text, uuid) to authenticated;
grant execute on function public.delete_transaction(uuid) to authenticated;
grant execute on function public.create_transfer(uuid, uuid, bigint, date, text, text) to authenticated;
grant execute on function public.update_transfer(uuid, uuid, uuid, bigint, date, text) to authenticated;
grant execute on function public.delete_transfer(uuid) to authenticated;
grant execute on function public.create_category(text, text) to authenticated;
grant execute on function public.create_account(text, text) to authenticated;
grant execute on function public.set_opening_balances(jsonb) to authenticated;
grant execute on function public.check_rate_limit(text) to authenticated;

-- The application uses hard deletion. Remove the stale soft-delete state last.
alter table public.transactions drop column if exists deleted_at;
