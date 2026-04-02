# Live Realtime - Phase 3

This phase connects spectator pages to live backend data and resolves Supabase RLS linter errors.

## Security and schema updates

- `db/migrations/0002_live_realtime_rls.sql`
  - Enables RLS on live tables in `public`
  - Adds read policies for `anon` and `authenticated`
- `db/migrations/0003_live_event_score_snapshots.sql`
  - Adds `home_score` and `away_score` on event rows for accurate timeline rendering

## API updates

- `GET /api/live/overview`
  - Returns live matches, standings, top scorers
  - Uses DB-first data with static fallback safety
- `GET /api/live/matches/:id`
  - Returns snapshot + player stats + match metadata + timeline events
- `POST /api/live/events`
  - Stores score snapshots per event after commit

## Frontend updates

- `app/matches/page.tsx`
  - Uses live overview polling
  - Shows connection mode badge (`LIVE` / `FALLBACK`)
- `app/matches/[id]/page.tsx`
  - Polls detailed match endpoint
  - Updates score, fouls, player stats and timeline in near real time
- `app/standings/page.tsx`
  - Uses live standings + edition top scorers from backend
- `hooks/use-live-overview.ts`
  - Shared polling hook for spectator pages

## Validation checklist

1. `npm run build` passes.
2. `GET /api/live/overview` returns `ok: true`.
3. `GET /api/live/matches/match-1` returns events and snapshot.
4. Supabase RLS is ON for all 4 live tables.
