-- Remove soft delete, revert to hard delete
alter table public.transactions drop column if exists deleted_at;

drop function if exists public.restore_transaction(uuid, uuid);
drop function if exists public.delete_transaction_permanent(uuid, uuid);

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
