begin;
create extension if not exists pgtap with schema extensions;
select plan(28);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@example.test', '', now(), '{}', '{}', now(), now()),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@example.test', '', now(), '{}', '{}', now(), now());

insert into public.accounts (id, user_id, name, currency) values
  ('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'A Cash', 'PHP'),
  ('10000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'A Bank', 'PHP'),
  ('20000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000002', 'B Cash', 'PHP');
alter table public.accounts drop constraint accounts_php_only;
insert into public.accounts (id, user_id, name, currency) values
  ('10000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', 'Legacy USD', 'USD');
alter table public.accounts add constraint accounts_php_only check (currency = 'PHP') not valid;
insert into public.transactions (
  id, user_id, merchant, amount, date, transaction_type, category, payment_method, account_id
) values (
  '20000000-0000-0000-0000-000000000031', '20000000-0000-0000-0000-000000000002',
  'B expense', 100, current_date, 'expense', 'Food', 'B Cash', '20000000-0000-0000-0000-000000000021'
);

select is(
  to_regprocedure('public.create_transaction(uuid,text,bigint,date,text,text,text,text,uuid,text)'),
  null,
  'caller-controlled transaction identity overload is removed'
);
select is(
  to_regprocedure('public.create_transfer(uuid,uuid,uuid,bigint,date,text,text)'),
  null,
  'caller-controlled transfer identity overload is removed'
);
select is(
  to_regprocedure('public.check_rate_limit(text,integer,integer)'),
  null,
  'caller-configurable rate-limit overload is removed'
);

set local role anon;
set local "request.jwt.claims" = '{}';
select throws_ok(
  $$select public.create_transaction('test', 100, current_date, null, 'expense', 'Food', 'Cash', '10000000-0000-0000-0000-000000000011', 'anon-key')$$,
  '42501', 'permission denied for function create_transaction', 'anonymous role cannot execute transaction RPC'
);

reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '10000000-0000-0000-0000-000000000001';
select throws_ok(
  $$select public.create_transaction('cross tenant', 100, current_date, null, 'expense', 'Food', 'Cash', '20000000-0000-0000-0000-000000000021', 'cross-key')$$,
  '42501', 'Account not found or access denied', 'user A cannot transact against user B account'
);
select throws_ok(
  $$select public.create_transaction('zero', 0, current_date, null, 'expense', 'Food', 'A Cash', '10000000-0000-0000-0000-000000000011', 'zero-key')$$,
  '22003', 'Amount is outside the supported range', 'zero transaction amount is rejected'
);
select throws_ok(
  $$select public.create_transfer('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000012', -1, current_date, null, 'negative-key')$$,
  '22003', 'Amount is outside the supported range', 'negative transfer amount is rejected'
);
select throws_ok(
  $$select public.update_transaction('20000000-0000-0000-0000-000000000031', 'forged update', 100, current_date, null, 'expense', 'Food', 'A Cash', '10000000-0000-0000-0000-000000000011')$$,
  '42501', 'Transaction not found or access denied', 'user A cannot update user B transaction'
);
select throws_ok(
  $$select public.delete_transaction('20000000-0000-0000-0000-000000000031')$$,
  '42501', 'Transaction not found or access denied', 'user A cannot delete user B transaction'
);
select throws_ok(
  $$select public.create_transfer('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 1, current_date, null, 'same-key')$$,
  '22023', 'Source and destination accounts must be different', 'same-account transfer is rejected'
);
select throws_ok(
  $$select public.create_transfer('10000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000021', 1, current_date, null, 'cross-transfer-key')$$,
  '42501', 'Transfer account not found, unsupported, or access denied', 'cross-user transfer is rejected'
);
select throws_ok(
  $$select public.create_transfer('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000013', 1, current_date, null, 'fx-transfer-key')$$,
  '42501', 'Transfer account not found, unsupported, or access denied', 'unsupported currency transfer is rejected'
);
select lives_ok(
  $$select public.create_transaction('A expense', 100, current_date, null, 'expense', 'Food', 'A Cash', '10000000-0000-0000-0000-000000000011', 'tenant-key')$$,
  'user A creates a tenant-scoped idempotent transaction'
);
select lives_ok(
  $$select public.create_transfer('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000012', 1, current_date, 'centavo', 'transfer-key')$$,
  'centavo transfer succeeds'
);
select is(
  (public.create_transfer('10000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000012', 1, current_date, 'centavo', 'transfer-key')->>'id'),
  (select id::text from public.transfers where user_id = auth.uid() and idempotency_key = 'transfer-key'),
  'transfer retry returns the same tenant-owned record'
);
select lives_ok(
  $$select public.update_transfer((select id from public.transfers where idempotency_key = 'transfer-key'), '10000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000011', 12345, current_date, 'updated')$$,
  'transfer and projection update atomically'
);
select is(
  (select amount from public.transactions where transfer_id = (select id from public.transfers where idempotency_key = 'transfer-key')),
  12345::bigint,
  'transfer projection stays synchronized'
);
select lives_ok(
  $$select public.delete_transfer((select id from public.transfers where idempotency_key = 'transfer-key'))$$,
  'transfer deletes atomically'
);
select is(
  (select count(*) from public.transactions where transfer_id is not null),
  0::bigint,
  'deleting a transfer cascades to its projection'
);
select throws_ok(
  $$insert into public.accounts (user_id, name, currency) values ('10000000-0000-0000-0000-000000000001', 'USD account', 'USD')$$,
  '23514', null, 'unsupported account currency is rejected'
);
select lives_ok(
  $$select public.set_opening_balances('{"10000000-0000-0000-0000-000000000011": 1000000}'::jsonb)$$,
  'opening balance is persisted through the authenticated RPC'
);
select lives_ok(
  $$select public.set_opening_balances('{"10000000-0000-0000-0000-000000000011": 9999999}'::jsonb)$$,
  'opening balance retry is safely idempotent'
);
select is(
  (select opening_balance from public.accounts where id = '10000000-0000-0000-0000-000000000011'),
  1000000::bigint,
  'opening balance is applied exactly once'
);

reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '20000000-0000-0000-0000-000000000002';
select lives_ok(
  $$select public.create_transaction('B expense', 100, current_date, null, 'expense', 'Food', 'B Cash', '20000000-0000-0000-0000-000000000021', 'tenant-key')$$,
  'user B can independently reuse user A idempotency key'
);
reset role;
select isnt(
  (select id::text from public.transactions where user_id = '10000000-0000-0000-0000-000000000001' and idempotency_key = 'tenant-key'),
  (select id::text from public.transactions where user_id = '20000000-0000-0000-0000-000000000002' and idempotency_key = 'tenant-key'),
  'idempotency replay cannot return another tenant record'
);
delete from auth.users where id = '10000000-0000-0000-0000-000000000001';
select lives_ok(
  $$set constraints all immediate$$,
  'full user cascade satisfies deferred financial foreign keys'
);
select is(
  (select count(*) from auth.users where id = '10000000-0000-0000-0000-000000000001'),
  0::bigint,
  'authenticated user row is deleted'
);
select is(
  (select count(*) from public.accounts where user_id = '10000000-0000-0000-0000-000000000001'),
  0::bigint,
  'full account deletion cascades through owned financial rows'
);

select * from finish();
rollback;
