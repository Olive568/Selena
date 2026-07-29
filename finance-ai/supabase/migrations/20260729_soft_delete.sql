-- Add deleted_at column for soft delete
alter table public.transactions add column deleted_at timestamptz;

-- Replace hard delete RPC with soft delete
create or replace function public.delete_transaction(
  p_id uuid,
  p_user_id uuid
) returns void
language plpgsql
security definer
as $$
begin
  update public.transactions
  set deleted_at = now()
  where id = p_id and user_id = p_user_id;

  if not found then
    raise exception 'Transaction not found or access denied';
  end if;
end;
$$;

-- RPC to restore a soft-deleted transaction
create or replace function public.restore_transaction(
  p_id uuid,
  p_user_id uuid
) returns void
language plpgsql
security definer
as $$
begin
  update public.transactions
  set deleted_at = null
  where id = p_id and user_id = p_user_id;

  if not found then
    raise exception 'Transaction not found or access denied';
  end if;
end;
$$;

-- RPC to permanently delete a transaction
create or replace function public.delete_transaction_permanent(
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
