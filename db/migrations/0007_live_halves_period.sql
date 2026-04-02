alter table if exists nbl_matches
  drop constraint if exists nbl_matches_quarter_check;

update nbl_matches
set quarter = case
  when quarter in ('Q1', 'Q2') then 'H1'
  when quarter in ('Q3', 'Q4', 'OT') then 'H2'
  else quarter
end;

alter table if exists nbl_matches
  add constraint nbl_matches_quarter_check
  check (quarter in ('H1', 'H2'));

alter table if exists nbl_match_events
  drop constraint if exists nbl_match_events_quarter_check;

update nbl_match_events
set quarter = case
  when quarter in ('Q1', 'Q2') then 'H1'
  when quarter in ('Q3', 'Q4', 'OT') then 'H2'
  else quarter
end;

alter table if exists nbl_match_events
  add constraint nbl_match_events_quarter_check
  check (quarter in ('H1', 'H2'));
