alter table if exists nbl_match_events
  add column if not exists home_score integer,
  add column if not exists away_score integer;

create index if not exists idx_nbl_match_events_match_created_id
  on nbl_match_events (match_id, created_at, id);