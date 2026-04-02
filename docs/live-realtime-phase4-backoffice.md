# Live Realtime - Phase 4 (Backoffice)

This phase adds operations backoffice flows for registrations, payment tracking, teams/players management, staff management, products, and match planning.

## Database updates

- `db/migrations/0004_backoffice_core.sql`
  - Adds backoffice tables:
    - `nbl_team_registrations`
    - `nbl_registration_players`
    - `nbl_teams_admin`
    - `nbl_team_players`
    - `nbl_staff_members`
    - `nbl_products`
    - `nbl_orders`
    - `nbl_order_items`
    - `nbl_payments`
    - `nbl_match_admin_meta`
  - Adds `updated_at` trigger function and triggers
- `db/migrations/0005_backoffice_rls.sql`
  - Enables RLS for backoffice tables
  - Adds public read policy only for active store products
- `db/migrations/0006_backoffice_seed_defaults.sql`
  - Seeds default products and staff records

## API updates

- Public:
  - `GET /api/registrations` for spots remaining by category
  - `POST /api/registrations` for team + players roster submission (with optional photo URL)
  - `GET /api/store/products` for public active products
- Admin:
  - `GET /api/admin/operations` consolidated dashboard payload
  - `GET/PATCH /api/admin/registrations/:id` registration review + payment fields
  - `GET/POST /api/admin/products`
  - `PATCH /api/admin/products/:id`
  - `GET/POST /api/admin/staff`
  - `PATCH /api/admin/staff/:id`
  - `GET/POST /api/admin/teams`
  - `PATCH /api/admin/teams/:id`
  - `GET/POST /api/admin/team-players`
  - `PATCH /api/admin/team-players/:id`
  - `GET/POST /api/admin/matches`
  - `PATCH /api/admin/matches/:id`
  - `GET/POST /api/admin/payments`

## Frontend updates

- `app/inscription/page.tsx`
  - Connected to DB-backed registration API
  - Adds roster capture including player photo URLs
  - Uses dynamic spots availability from backend
- `app/store/page.tsx`
  - Connected to DB-backed product API with local fallback
- `app/admin/dashboard/page.tsx`
  - New operations cockpit for registrations, payment status, teams/players, staff, products, and match planning

## Live metadata bridge

- `app/api/live/overview/route.ts`
- `app/api/live/matches/[id]/route.ts`

Both routes now include match metadata (`venue`, `scheduled_at`, `tags`, `ticket_price`) from `nbl_match_admin_meta`, so admin planning data appears in public live pages.

## Optional admin protection

- `lib/server/admin-auth.ts`
  - If `ADMIN_API_KEY` is set, all `/api/admin/*` routes require `x-admin-key` or `Authorization: Bearer <key>`

## Validation checklist

1. Run migrations `0004`, `0005`, `0006`.
2. `npm run build` passes.
3. Submit a real registration from `/inscription` and verify rows in `nbl_team_registrations` and `nbl_registration_players`.
4. Add product/staff/team/player/match from `/admin/dashboard` and verify DB persistence.
5. Confirm public `/store` and live match pages reflect DB data.
