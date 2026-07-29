alter table public.transactions add column account_id uuid references public.accounts(id) on delete set null;
