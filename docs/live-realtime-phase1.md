# Live Realtime - Phase 1

This phase adds the backend foundation for live match events:

- PostgreSQL schema for live matches, state and immutable events
- Idempotent API endpoint to ingest referee-table events
- Optimistic concurrency with `expectedVersion`

## 1) Environment variable

Create `.env.local` from `.env.example` and set:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require
```

## 2) Apply database migration

Run the SQL file:

- `db/migrations/0001_live_realtime_core.sql`

If you use psql:

```bash
psql "$DATABASE_URL" -f db/migrations/0001_live_realtime_core.sql
```

## 3) Seed one live match (optional but recommended)

Run:

- `db/seeds/seed_live_sample.sql`

With psql:

```bash
psql "$DATABASE_URL" -f db/seeds/seed_live_sample.sql
```

## 4) Test API endpoint

Endpoint:

- `POST /api/live/events`

Required header:

- `x-idempotency-key: <unique-key>`

Example request:

```bash
curl -X POST http://localhost:3001/api/live/events \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: evt-match-1-0001" \
  -d '{
    "matchId": "match-1",
    "expectedVersion": 0,
    "quarter": "Q4",
    "clockSeconds": 250,
    "eventType": "pts2",
    "teamSide": "home",
    "playerId": "malik-diop",
    "playerName": "M. Diop"
  }'
```

Expected behavior:

- First call: `ok: true`, `duplicate: false`, version increments.
- Same key again: `ok: true`, `duplicate: true`.
- Wrong `expectedVersion`: HTTP `409` with `currentVersion`.

## 5) Files added in this phase

- `app/api/live/events/route.ts`
- `lib/server/db.ts`
- `db/migrations/0001_live_realtime_core.sql`
- `db/seeds/seed_live_sample.sql`
- `.env.example`
