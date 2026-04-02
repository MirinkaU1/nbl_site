insert into nbl_matches (
  id,
  status,
  quarter,
  clock_seconds,
  home_team_id,
  away_team_id,
  version
) values (
  'match-1',
  'live',
  'H2',
  261,
  'heat',
  'treichville',
  0
)
on conflict (id) do nothing;

insert into nbl_match_state (
  match_id,
  home_score,
  away_score,
  home_fouls,
  away_fouls
) values (
  'match-1',
  86,
  82,
  3,
  2
)
on conflict (match_id) do nothing;