-- Convert transactions.amount to integer cents
alter table public.transactions add column amount_cents bigint;
update public.transactions set amount_cents = round((amount * 100)::numeric)::bigint;
alter table public.transactions drop column amount;
alter table public.transactions rename column amount_cents to amount;
alter table public.transactions alter column amount set not null;
alter table public.transactions add constraint transactions_amount_positive check (amount > 0);
alter table public.transactions add constraint transactions_amount_finite check (amount < 100000000000000);

-- Convert transfers.amount to integer cents
alter table public.transfers add column amount_cents bigint;
update public.transfers set amount_cents = round((amount * 100)::numeric)::bigint;
alter table public.transfers drop column amount;
alter table public.transfers rename column amount_cents to amount;
alter table public.transfers alter column amount set not null;
alter table public.transfers add constraint transfers_amount_positive check (amount > 0);

-- Drop old numeric-based constraints (if any remain)
alter table public.transactions drop constraint if exists transactions_amount_positive;
alter table public.transactions drop constraint if exists transactions_amount_finite;
alter table public.transfers drop constraint if exists transfers_amount_positive;

-- Recreate RPCs with bigint parameters
create or replace function public.create_transfer(
  p_user_id uuid,
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount bigint,
  p_date date,
  p_notes text default null,
  p_idempotency_key text default null
) returns void
language plpgsql
security definer
as $$
begin
  if p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  insert into public.transfers (user_id, from_account_id, to_account_id, amount, date, notes, idempotency_key)
  values (p_user_id, p_from_account_id, p_to_account_id, p_amount, p_date, p_notes, p_idempotency_key)
  on conflict (idempotency_key) do nothing;

  if not found then
    return;
  end if;

  insert into public.transactions (user_id, merchant, amount, date, notes, transaction_type, category, payment_method)
  values (
    p_user_id,
    'Transfer: ' || (select name from public.accounts where id = p_from_account_id) || ' → ' || (select name from public.accounts where id = p_to_account_id),
    p_amount,
    p_date,
    p_notes,
    'transfer',
    'Transfer',
    (select name from public.accounts where id = p_from_account_id) || ' → ' || (select name from public.accounts where id = p_to_account_id)
  );
end;
$$;

create or replace function public.create_transaction(
  p_user_id uuid,
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
as $$
declare
  v_result jsonb;
begin
  if p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  if p_transaction_type not in ('income', 'expense', 'transfer') then
    raise exception 'Invalid transaction type';
  end if;

  insert into public.transactions (user_id, merchant, amount, date, notes, transaction_type, category, payment_method, account_id, idempotency_key)
  values (p_user_id, p_merchant, p_amount, p_date, p_notes, p_transaction_type, p_category, p_payment_method, p_account_id, p_idempotency_key)
  on conflict (idempotency_key) do nothing
  returning to_jsonb(public.transactions.*) into v_result;

  return v_result;
end;
$$;

create or replace function public.update_transaction(
  p_id uuid,
  p_user_id uuid,
  p_merchant text default null,
  p_amount bigint default null,
  p_date date default null,
  p_notes text default null,
  p_transaction_type text default null,
  p_category text default null,
  p_payment_method text default null,
  p_account_id uuid default null
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_result jsonb;
begin
  if p_amount is not null and p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  if p_transaction_type is not null and p_transaction_type not in ('income', 'expense', 'transfer') then
    raise exception 'Invalid transaction type';
  end if;

  update public.transactions
  set
    merchant = coalesce(p_merchant, merchant),
    amount = coalesce(p_amount, amount),
    date = coalesce(p_date, date),
    notes = coalesce(p_notes, notes),
    transaction_type = coalesce(p_transaction_type, transaction_type),
    category = coalesce(p_category, category),
    payment_method = coalesce(p_payment_method, payment_method),
    account_id = coalesce(p_account_id, account_id),
    updated_at = now()
  where id = p_id and user_id = p_user_id
  returning to_jsonb(public.transactions.*) into v_result;

  if v_result is null then
    raise exception 'Transaction not found or access denied';
  end if;

  return v_result;
end;
$$;
