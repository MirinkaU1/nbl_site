insert into nbl_products (
  name,
  slug,
  category,
  description,
  price_cfa,
  stock_quantity,
  image_url,
  is_active
)
values
  (
    'NBL PRO JERSEY 24',
    'nbl-pro-jersey-24',
    'MAILLOTS',
    'Maillot officiel NBL 2026',
    15000,
    30,
    '/images/product-jersey.jpg',
    true
  ),
  (
    'STREET LEGEND HOODIE',
    'street-legend-hoodie',
    'T-SHIRTS',
    'Hoodie edition Street Kings',
    25000,
    18,
    '/images/product-hoodie.jpg',
    true
  ),
  (
    'NBL MATCH BALL',
    'nbl-match-ball',
    'ACCES.',
    'Ballon officiel des matchs NBL',
    35000,
    12,
    '/images/product-ball.jpg',
    true
  )
on conflict (slug) do nothing;

insert into nbl_staff_members (
  full_name,
  role,
  phone,
  is_active
)
select
  'Kouadio Jean',
  'Coordinateur logistique',
  '+2250700000001',
  true
where not exists (
  select 1
  from nbl_staff_members
  where full_name = 'Kouadio Jean'
);

insert into nbl_staff_members (
  full_name,
  role,
  phone,
  is_active
)
select
  'Traore Awa',
  'Responsable arbitrage',
  '+2250700000002',
  true
where not exists (
  select 1
  from nbl_staff_members
  where full_name = 'Traore Awa'
);
