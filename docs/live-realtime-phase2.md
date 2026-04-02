# Live Realtime - Phase 2

This phase connects the referee console to the live API.

## What was added

- Console action submit to `POST /api/live/events`
- Snapshot bootstrap from `GET /api/live/matches/:id`
- Local fallback mode when DB or API is unavailable
- Concurrency conflict handling (`409`) with automatic resync

## Files changed

- `app/admin/page.tsx`
- `app/api/live/matches/[id]/route.ts`
- `lib/nbl-types.ts`

## Runtime behavior

- On page load, console tries to sync from DB.
- If sync works: mode is `PERSISTE` and actions are saved in Postgres.
- If sync fails: mode is `LOCAL` and actions stay only in browser state.
- In `PERSISTE` mode, undo stays disabled because no reverse-event API exists yet.

## Quick validation

1. Run migration and seed from Phase 1 docs.
2. Start app with valid `DATABASE_URL`.
3. Open `/admin` and verify `PERSISTE` under timer.
4. Record `+2` or `F` and refresh page.
5. Verify scores/fouls persist after refresh.
