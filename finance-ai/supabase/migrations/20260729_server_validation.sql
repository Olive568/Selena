-- CHECK constraints for server-side validation
alter table public.transactions add constraint transactions_amount_positive check (amount > 0);
alter table public.transfers add constraint transfers_amount_positive check (amount > 0);
alter table public.transactions add constraint transactions_amount_finite check (amount < 1e12);
alter table public.transactions add constraint transaction_type_valid check (transaction_type in ('income', 'expense', 'transfer'));

-- RPC: create transaction with validation
create or replace function public.create_transaction(
  p_user_id uuid,
  p_merchant text,
  p_amount numeric,
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

-- RPC: update transaction with validation
create or replace function public.update_transaction(
  p_id uuid,
  p_user_id uuid,
  p_merchant text default null,
  p_amount numeric default null,
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

-- RPC: delete transaction with validation
create or replace function public.delete_transaction(
  p_id uuid,
  p_user_id uuid
) returns void
language plpgsql
security definer
as $$
begin
  delete from public.transactions where id = p_id and user_id = p_user_id;

  if not found then
    raise exception 'Transaction not found or access denied';
  end if;
end;
$$;

-- RPC: create category with validation
create or replace function public.create_category(
  p_user_id uuid,
  p_name text,
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_result jsonb;
  v_trimmed text;
begin
  v_trimmed := trim(p_name);

  if v_trimmed = '' then
    raise exception 'Category name is required';
  end if;

  if length(v_trimmed) > 100 then
    raise exception 'Category name must be 100 characters or less';
  end if;

  insert into public.categories (user_id, name, idempotency_key)
  values (p_user_id, v_trimmed, p_idempotency_key)
  on conflict (idempotency_key) do nothing
  returning to_jsonb(public.categories.*) into v_result;

  if v_result is null then
    select to_jsonb(c.*) into v_result from public.categories c where c.idempotency_key = p_idempotency_key;
  end if;

  return v_result;
end;
$$;

-- RPC: create account with validation
create or replace function public.create_account(
  p_user_id uuid,
  p_name text,
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_result jsonb;
  v_trimmed text;
begin
  v_trimmed := trim(p_name);

  if v_trimmed = '' then
    raise exception 'Account name is required';
  end if;

  if length(v_trimmed) > 100 then
    raise exception 'Account name must be 100 characters or less';
  end if;

  insert into public.accounts (user_id, name, idempotency_key)
  values (p_user_id, v_trimmed, p_idempotency_key)
  on conflict (idempotency_key) do nothing
  returning to_jsonb(public.accounts.*) into v_result;

  if v_result is null then
    select to_jsonb(c.*) into v_result from public.accounts c where c.idempotency_key = p_idempotency_key;
  end if;

  return v_result;
end;
$$;
