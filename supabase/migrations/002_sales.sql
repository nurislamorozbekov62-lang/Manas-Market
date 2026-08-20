alter table public.products
  add column purchase_price numeric(12,2)
  check (purchase_price >= 0);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  sale_price numeric(12,2) not null check (sale_price >= 0),
  purchase_price numeric(12,2) check (purchase_price >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  gross_profit numeric(12,2),
  payment_method text not null check (payment_method in ('cash', 'transfer', 'other')),
  sale_type text not null check (sale_type in ('product', 'quick')),
  created_at timestamptz not null default now(),
  check (
    sale_type = 'product'
    or
    (sale_type = 'quick' and product_id is null and purchase_price is null and gross_profit is null)
  )
);

create index sales_store_created_at_idx on public.sales(store_id, created_at desc);

alter table public.sales enable row level security;

create policy "Sellers read own sales"
on public.sales for select
using (
  seller_id = auth.uid()
  and exists (
    select 1 from public.stores
    where stores.id = sales.store_id
      and stores.owner_id = auth.uid()
  )
);

create or replace function public.create_product_sale(
  p_store_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_payment_method text
)
returns public.sales
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_product public.products%rowtype;
  v_sale public.sales%rowtype;
  v_total numeric(12,2);
  v_profit numeric(12,2);
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'not_authenticated';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception using errcode = 'P0001', message = 'invalid_quantity';
  end if;
  if p_payment_method is null or p_payment_method not in ('cash', 'transfer', 'other') then
    raise exception using errcode = 'P0001', message = 'invalid_payment_method';
  end if;
  if not exists (
    select 1 from public.stores
    where id = p_store_id and owner_id = v_user_id
  ) then
    raise exception using errcode = 'P0001', message = 'store_access_denied';
  end if;

  select * into v_product
  from public.products
  where id = p_product_id and store_id = p_store_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'product_not_found';
  end if;
  if v_product.stock = 0 then
    raise exception using errcode = 'P0001', message = 'out_of_stock';
  end if;
  if v_product.stock < p_quantity then
    raise exception using errcode = 'P0001', message = 'insufficient_stock';
  end if;

  v_total := v_product.price * p_quantity;
  v_profit := case
    when v_product.purchase_price is null then null
    else (v_product.price - v_product.purchase_price) * p_quantity
  end;

  update public.products
  set stock = stock - p_quantity, updated_at = now()
  where id = v_product.id;

  insert into public.sales (
    store_id, seller_id, product_id, quantity, sale_price,
    purchase_price, total_amount, gross_profit, payment_method, sale_type
  ) values (
    p_store_id, v_user_id, v_product.id, p_quantity, v_product.price,
    v_product.purchase_price, v_total, v_profit, p_payment_method, 'product'
  ) returning * into v_sale;

  return v_sale;
end;
$$;

create or replace function public.create_quick_sale(
  p_store_id uuid,
  p_amount numeric,
  p_payment_method text
)
returns public.sales
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_sale public.sales%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = 'P0001', message = 'not_authenticated';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception using errcode = 'P0001', message = 'invalid_amount';
  end if;
  if p_payment_method is null or p_payment_method not in ('cash', 'transfer', 'other') then
    raise exception using errcode = 'P0001', message = 'invalid_payment_method';
  end if;
  if not exists (
    select 1 from public.stores
    where id = p_store_id and owner_id = v_user_id
  ) then
    raise exception using errcode = 'P0001', message = 'store_access_denied';
  end if;

  insert into public.sales (
    store_id, seller_id, product_id, quantity, sale_price,
    purchase_price, total_amount, gross_profit, payment_method, sale_type
  ) values (
    p_store_id, v_user_id, null, 1, p_amount,
    null, p_amount, null, p_payment_method, 'quick'
  ) returning * into v_sale;

  return v_sale;
end;
$$;

revoke all on function public.create_product_sale(uuid, uuid, integer, text) from public;
revoke all on function public.create_quick_sale(uuid, numeric, text) from public;
grant execute on function public.create_product_sale(uuid, uuid, integer, text) to authenticated;
grant execute on function public.create_quick_sale(uuid, numeric, text) to authenticated;
