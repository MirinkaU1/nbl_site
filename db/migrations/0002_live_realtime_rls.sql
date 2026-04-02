alter table if exists nbl_matches enable row level security;
alter table if exists nbl_match_state enable row level security;
alter table if exists nbl_player_match_stats enable row level security;
alter table if exists nbl_match_events enable row level security;

drop policy if exists nbl_matches_public_read on nbl_matches;
drop policy if exists nbl_match_state_public_read on nbl_match_state;
drop policy if exists nbl_player_match_stats_public_read on nbl_player_match_stats;
drop policy if exists nbl_match_events_public_read on nbl_match_events;

create policy nbl_matches_public_read
  on nbl_matches
  for select
  to anon, authenticated
  using (true);

create policy nbl_match_state_public_read
  on nbl_match_state
  for select
  to anon, authenticated
  using (true);

create policy nbl_player_match_stats_public_read
  on nbl_player_match_stats
  for select
  to anon, authenticated
  using (true);

create policy nbl_match_events_public_read
  on nbl_match_events
  for select
  to anon, authenticated
  using (true);