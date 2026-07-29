alter table public.transactions add column idempotency_key text unique;
alter table public.transfers add column idempotency_key text unique;
alter table public.categories add column idempotency_key text unique;
alter table public.accounts add column idempotency_key text unique;
