import { NextResponse } from "next/server";
import {
  MATCHES_LIST,
  PLAYERS,
  STANDINGS,
  TEAMS,
  TOP_SCORERS,
} from "@/lib/nbl-data";
import type {
  LivePublicMatch,
  MatchStatus,
  Quarter,
  StandingsRow,
  Team,
  TopScorer,
} from "@/lib/nbl-types";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MatchRow = {
  id: string;
  status: MatchStatus;
  quarter: Quarter;
  clock_seconds: number;
  updated_at: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  venue: string | null;
  scheduled_at: string | null;
  tags: string[] | null;
  ticket_price: string | null;
};

type TopScorerRow = {
  player_id: string;
  team_side: "home" | "away";
  total_points: number;
  matches: number;
};

function toSafeDate(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return new Date(0).toISOString();
  }
  return new Date(parsed).toISOString();
}

function resolveTeam(teamId: string, fallback?: Partial<Team>): Team {
  const team = TEAMS[teamId as keyof typeof TEAMS];

  if (team) {
    return team;
  }

  return {
    id: teamId,
    name: fallback?.name ?? teamId.toUpperCase(),
    shortName: fallback?.shortName ?? teamId.toUpperCase(),
    code: fallback?.code ?? teamId.slice(0, 3).toUpperCase(),
    city: fallback?.city ?? "",
    primaryColor: fallback?.primaryColor ?? "#6B7280",
  };
}

function toLivePublicMatch(
  base: (typeof MATCHES_LIST)[number] | null,
  row: MatchRow,
): LivePublicMatch {
  const homeTeam = resolveTeam(row.home_team_id, base?.homeState.team);
  const awayTeam = resolveTeam(row.away_team_id, base?.awayState.team);

  return {
    id: row.id,
    status: row.status,
    quarter: row.quarter,
    clockSeconds: row.clock_seconds,
    updatedAt: row.updated_at,
    venue: row.venue ?? base?.venue ?? "Stade Municipal",
    scheduledAt: row.scheduled_at ?? base?.scheduledAt ?? row.updated_at,
    tags: row.tags ?? base?.tags ?? [],
    ticketPrice: row.ticket_price ?? base?.ticketPrice,
    homeTeam: {
      id: homeTeam.id,
      name: homeTeam.name,
      shortName: homeTeam.shortName,
      code: homeTeam.code,
      city: homeTeam.city,
      score: row.home_score,
    },
    awayTeam: {
      id: awayTeam.id,
      name: awayTeam.name,
      shortName: awayTeam.shortName,
      code: awayTeam.code,
      city: awayTeam.city,
      score: row.away_score,
    },
  };
}

function mergeMatches(rows: MatchRow[]): LivePublicMatch[] {
  const baseById = new Map(MATCHES_LIST.map((match) => [match.id, match]));
  const rowById = new Map(rows.map((row) => [row.id, row]));

  const mergedFromBase = MATCHES_LIST.map((base) => {
    const row = rowById.get(base.id);

    if (!row) {
      return {
        id: base.id,
        status: base.status,
        quarter: base.quarter,
        clockSeconds: base.clockSeconds,
        updatedAt: new Date().toISOString(),
        venue: base.venue,
        scheduledAt: base.scheduledAt,
        tags: base.tags,
        ticketPrice: base.ticketPrice,
        homeTeam: {
          id: base.homeState.team.id,
          name: base.homeState.team.name,
          shortName: base.homeState.team.shortName,
          code: base.homeState.team.code,
          city: base.homeState.team.city,
          score: base.homeState.score,
        },
        awayTeam: {
          id: base.awayState.team.id,
          name: base.awayState.team.name,
          shortName: base.awayState.team.shortName,
          code: base.awayState.team.code,
          city: base.awayState.team.city,
          score: base.awayState.score,
        },
      } satisfies LivePublicMatch;
    }

    return toLivePublicMatch(base, row);
  });

  const baseIds = new Set(mergedFromBase.map((match) => match.id));

  const extras = rows
    .filter((row) => !baseIds.has(row.id))
    .map((row) => toLivePublicMatch(baseById.get(row.id) ?? null, row));

  const statusPriority: Record<MatchStatus, number> = {
    live: 0,
    timeout: 0,
    upcoming: 1,
    finished: 2,
  };

  return [...mergedFromBase, ...extras].sort((a, b) => {
    const byStatus = statusPriority[a.status] - statusPriority[b.status];
    if (byStatus !== 0) {
      return byStatus;
    }

    const byDate =
      Date.parse(toSafeDate(a.scheduledAt)) -
      Date.parse(toSafeDate(b.scheduledAt));
    if (byDate !== 0) {
      return byDate;
    }

    return a.id.localeCompare(b.id);
  });
}

function computeStandings(matches: LivePublicMatch[]): StandingsRow[] {
  const finished = matches.filter((match) => match.status === "finished");

  if (finished.length === 0) {
    return STANDINGS;
  }

  const table = new Map<
    string,
    {
      team: Team;
      played: number;
      won: number;
      lost: number;
      pointsFor: number;
      pointsAgainst: number;
      pts: number;
    }
  >();

  for (const team of Object.values(TEAMS)) {
    table.set(team.id, {
      team,
      played: 0,
      won: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pts: 0,
    });
  }

  for (const match of finished) {
    const home = table.get(match.homeTeam.id) ?? {
      team: resolveTeam(match.homeTeam.id, match.homeTeam),
      played: 0,
      won: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pts: 0,
    };

    const away = table.get(match.awayTeam.id) ?? {
      team: resolveTeam(match.awayTeam.id, match.awayTeam),
      played: 0,
      won: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pts: 0,
    };

    const homeScore = match.homeTeam.score;
    const awayScore = match.awayTeam.score;

    home.played += 1;
    away.played += 1;
    home.pointsFor += homeScore;
    home.pointsAgainst += awayScore;
    away.pointsFor += awayScore;
    away.pointsAgainst += homeScore;

    if (homeScore > awayScore) {
      home.won += 1;
      away.lost += 1;
      home.pts += 2;
    } else if (awayScore > homeScore) {
      away.won += 1;
      home.lost += 1;
      away.pts += 2;
    } else {
      home.pts += 1;
      away.pts += 1;
    }

    table.set(home.team.id, home);
    table.set(away.team.id, away);
  }

  return [...table.values()]
    .sort((a, b) => {
      const byPts = b.pts - a.pts;
      if (byPts !== 0) {
        return byPts;
      }

      const byDiff =
        b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst);
      if (byDiff !== 0) {
        return byDiff;
      }

      return b.pointsFor - a.pointsFor;
    })
    .map((row, index) => ({
      rank: index + 1,
      team: row.team,
      played: row.played,
      won: row.won,
      lost: row.lost,
      pointsFor: row.pointsFor,
      pointsAgainst: row.pointsAgainst,
      diff: row.pointsFor - row.pointsAgainst,
      pts: row.pts,
    }));
}

function toTopScorers(rows: TopScorerRow[]): TopScorer[] {
  const scorers = rows
    .map((row) => {
      const player = PLAYERS[row.player_id];
      if (!player) {
        return null;
      }

      const team = TEAMS[player.teamId as keyof typeof TEAMS];
      if (!team) {
        return null;
      }

      const matches = row.matches || 1;

      return {
        rank: 0,
        player,
        team,
        matches,
        totalPoints: row.total_points,
        ppg: row.total_points / matches,
      } satisfies TopScorer;
    })
    .filter((row): row is TopScorer => row !== null)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));

  if (scorers.length === 0) {
    return TOP_SCORERS;
  }

  return scorers;
}

export async function GET() {
  const sql = getSqlClient();

  try {
    const matchRows = await sql<MatchRow[]>`
      select
        m.id,
        m.status,
        m.quarter,
        m.clock_seconds,
        m.updated_at::text as updated_at,
        m.home_team_id,
        m.away_team_id,
        coalesce(s.home_score, 0) as home_score,
        coalesce(s.away_score, 0) as away_score,
        mm.venue,
        mm.scheduled_at::text as scheduled_at,
        coalesce(mm.tags, '{}'::text[]) as tags,
        mm.ticket_price
      from nbl_matches m
      left join nbl_match_state s on s.match_id = m.id
      left join nbl_match_admin_meta mm on mm.match_id = m.id
    `;

    const scorerRows = await sql<TopScorerRow[]>`
      select
        player_id,
        team_side,
        sum(points)::int as total_points,
        count(distinct match_id)::int as matches
      from nbl_player_match_stats
      group by player_id, team_side
      order by total_points desc
      limit 50
    `;

    const matches = mergeMatches(matchRows);
    const standings = computeStandings(matches);
    const topScorers = toTopScorers(scorerRows);

    return NextResponse.json({
      ok: true,
      matches,
      standings,
      topScorers,
    });
  } catch (error) {
    console.error("Failed to load live overview", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
