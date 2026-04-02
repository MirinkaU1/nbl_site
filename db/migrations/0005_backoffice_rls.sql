alter table if exists nbl_team_registrations enable row level security;
alter table if exists nbl_registration_players enable row level security;
alter table if exists nbl_teams_admin enable row level security;
alter table if exists nbl_team_players enable row level security;
alter table if exists nbl_staff_members enable row level security;
alter table if exists nbl_products enable row level security;
alter table if exists nbl_match_admin_meta enable row level security;
alter table if exists nbl_orders enable row level security;
alter table if exists nbl_order_items enable row level security;
alter table if exists nbl_payments enable row level security;

drop policy if exists nbl_products_public_read on nbl_products;
create policy nbl_products_public_read
  on nbl_products
  for select
  to anon, authenticated
  using (is_active = true);