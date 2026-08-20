create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 80),
  role text not null default 'seller' check (role = 'seller'),
  created_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 140),
  description text check (char_length(description) <= 1000),
  price numeric(12,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_store_id_idx on public.products(store_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)), 'seller');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
create policy "Sellers read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Sellers update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = 'seller');
create policy "Sellers manage own store" on public.stores for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Sellers read own products" on public.products for select using (exists (select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid()));
create policy "Sellers create own products" on public.products for insert with check (exists (select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid()));
create policy "Sellers update own products" on public.products for update using (exists (select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid())) with check (exists (select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid()));
create policy "Sellers delete own products" on public.products for delete using (exists (select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid()));
