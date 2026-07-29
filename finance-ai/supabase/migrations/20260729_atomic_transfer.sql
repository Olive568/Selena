create or replace function public.create_transfer(
  p_user_id uuid,
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount numeric,
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
