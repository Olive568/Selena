alter table public.transactions add constraint merchant_length check (char_length(merchant) <= 200);
alter table public.transactions add constraint notes_length check (char_length(notes) <= 2000);
alter table public.categories add constraint name_length check (char_length(name) <= 100);
alter table public.accounts add constraint name_length check (char_length(name) <= 100);
