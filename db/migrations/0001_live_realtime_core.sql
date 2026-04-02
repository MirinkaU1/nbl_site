create table if not exists nbl_matches (
  id text primary key,
  status text not null check (status in ('live', 'upcoming', 'finished', 'timeout')),
  quarter text not null check (quarter in ('Q1', 'Q2', 'Q3', 'Q4', 'OT')),
  clock_seconds integer not null check (clock_seconds >= 0),
  home_team_id text not null,
  away_team_id text not null,
  version integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists nbl_match_state (
  match_id text primary key references nbl_matches(id) on delete cascade,
  home_score integer not null default 0,
  away_score integer not null default 0,
  home_fouls integer not null default 0,
  away_fouls integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists nbl_player_match_stats (
  match_id text not null references nbl_matches(id) on delete cascade,
  player_id text not null,
  team_side text not null check (team_side in ('home', 'away')),
  points integer not null default 0,
  fouls integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (match_id, player_id)
);

create table if not exists nbl_match_events (
  id text primary key,
  match_id text not null references nbl_matches(id) on delete cascade,
  idempotency_key text not null unique,
  expected_version integer not null check (expected_version >= 0),
  quarter text not null check (quarter in ('Q1', 'Q2', 'Q3', 'Q4', 'OT')),
  clock_seconds integer not null check (clock_seconds >= 0),
  event_type text not null check (event_type in ('pts2', 'pts3', 'ft', 'foul', 'timeout', 'substitution')),
  team_side text not null check (team_side in ('home', 'away')),
  value integer not null default 0,
  player_id text not null,
  player_name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_nbl_match_events_match_created
  on nbl_match_events (match_id, created_at desc);

create index if not exists idx_nbl_player_match_stats_match
  on nbl_player_match_stats (match_id);