create extension if not exists pgcrypto;

create or replace function nbl_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists nbl_team_registrations (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Junior', 'D1')),
  team_name text not null,
  captain_name text not null,
  phone text not null,
  email text,
  commune text not null,
  player_count integer not null check (player_count between 5 and 20),
  source text,
  notes text,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'waitlist', 'rejected')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'partial', 'paid', 'refunded')),
  registration_fee_cfa integer not null default 0 check (registration_fee_cfa >= 0),
  amount_paid_cfa integer not null default 0 check (amount_paid_cfa >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_nbl_team_registrations_status
  on nbl_team_registrations (status, payment_status, created_at desc);

create table if not exists nbl_registration_players (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references nbl_team_registrations(id) on delete cascade,
  full_name text not null,
  jersey_number integer check (jersey_number between 0 and 99),
  position text not null default 'N/A' check (position in ('PG', 'SG', 'SF', 'PF', 'C', 'N/A')),
  photo_url text,
  is_captain boolean not null default false,
  created_at timestamptz not null default now(),
  unique (registration_id, full_name)
);

create index if not exists idx_nbl_registration_players_registration
  on nbl_registration_players (registration_id);

create table if not exists nbl_teams_admin (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid unique references nbl_team_registrations(id) on delete set null,
  name text not null unique,
  category text not null check (category in ('Junior', 'D1')),
  city text,
  logo_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_nbl_teams_admin_category_status
  on nbl_teams_admin (category, status);

create table if not exists nbl_team_players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references nbl_teams_admin(id) on delete cascade,
  full_name text not null,
  jersey_number integer check (jersey_number between 0 and 99),
  position text not null default 'N/A' check (position in ('PG', 'SG', 'SF', 'PF', 'C', 'N/A')),
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, full_name)
);

create index if not exists idx_nbl_team_players_team_active
  on nbl_team_players (team_id, is_active);

create table if not exists nbl_staff_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text not null,
  phone text,
  email text,
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_nbl_staff_members_active
  on nbl_staff_members (is_active, role);

create table if not exists nbl_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  description text,
  price_cfa integer not null check (price_cfa >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_nbl_products_active_category
  on nbl_products (is_active, category, created_at desc);

create table if not exists nbl_orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  customer_email text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'fulfilled', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded')),
  total_cfa integer not null default 0 check (total_cfa >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_nbl_orders_status
  on nbl_orders (status, payment_status, created_at desc);

create table if not exists nbl_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references nbl_orders(id) on delete cascade,
  product_id uuid not null references nbl_products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cfa integer not null check (unit_price_cfa >= 0),
  line_total_cfa integer generated always as (quantity * unit_price_cfa) stored,
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create index if not exists idx_nbl_order_items_order
  on nbl_order_items (order_id);

create table if not exists nbl_match_admin_meta (
  match_id text primary key references nbl_matches(id) on delete cascade,
  venue text not null default 'A definir',
  scheduled_at timestamptz,
  ticket_price text,
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_nbl_match_admin_meta_scheduled
  on nbl_match_admin_meta (scheduled_at desc nulls last);

create table if not exists nbl_payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references nbl_team_registrations(id) on delete set null,
  order_id uuid references nbl_orders(id) on delete set null,
  provider text not null default 'mobile_money',
  provider_reference text,
  amount_cfa integer not null check (amount_cfa >= 0),
  currency text not null default 'XOF',
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  check ((registration_id is not null) <> (order_id is not null))
);

create index if not exists idx_nbl_payments_registration
  on nbl_payments (registration_id, created_at desc)
  where registration_id is not null;

create index if not exists idx_nbl_payments_order
  on nbl_payments (order_id, created_at desc)
  where order_id is not null;

drop trigger if exists trg_nbl_team_registrations_updated_at on nbl_team_registrations;
create trigger trg_nbl_team_registrations_updated_at
before update on nbl_team_registrations
for each row execute function nbl_set_updated_at();

drop trigger if exists trg_nbl_teams_admin_updated_at on nbl_teams_admin;
create trigger trg_nbl_teams_admin_updated_at
before update on nbl_teams_admin
for each row execute function nbl_set_updated_at();

drop trigger if exists trg_nbl_team_players_updated_at on nbl_team_players;
create trigger trg_nbl_team_players_updated_at
before update on nbl_team_players
for each row execute function nbl_set_updated_at();

drop trigger if exists trg_nbl_staff_members_updated_at on nbl_staff_members;
create trigger trg_nbl_staff_members_updated_at
before update on nbl_staff_members
for each row execute function nbl_set_updated_at();

drop trigger if exists trg_nbl_products_updated_at on nbl_products;
create trigger trg_nbl_products_updated_at
before update on nbl_products
for each row execute function nbl_set_updated_at();

drop trigger if exists trg_nbl_orders_updated_at on nbl_orders;
create trigger trg_nbl_orders_updated_at
before update on nbl_orders
for each row execute function nbl_set_updated_at();

drop trigger if exists trg_nbl_match_admin_meta_updated_at on nbl_match_admin_meta;
create trigger trg_nbl_match_admin_meta_updated_at
before update on nbl_match_admin_meta
for each row execute function nbl_set_updated_at();