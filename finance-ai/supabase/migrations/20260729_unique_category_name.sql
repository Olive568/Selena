-- Prevent duplicate categories per user
delete from public.categories a
using public.categories b
where a.id < b.id
  and a.user_id is not null
  and a.user_id = b.user_id
  and lower(trim(a.name)) = lower(trim(b.name));

create unique index if not exists idx_categories_user_name on public.categories (user_id, lower(trim(name)));
