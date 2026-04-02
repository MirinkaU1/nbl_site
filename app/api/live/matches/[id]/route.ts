import { NextResponse } from "next/server";
import { MATCHES, TEAMS } from "@/lib/nbl-data";
import type { GameEvent } from "@/lib/nbl-types";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SnapshotRow = {
  id: string;
  status: "live" | "upcoming" | "finished" | "timeout";
  quarter: "H1" | "H2";
  clock_seconds: number;
  version: number;
  updated_at: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  home_fouls: number;
  away_fouls: number;
  venue: string | null;
  scheduled_at: string | null;
  tags: string[] | null;
  ticket_price: string | null;
};

type PlayerStatsRow = {
  player_id: string;
  team_side: "home" | "away";
  points: number;
  fouls: number;
};

type EventRow = {
  id: string;
  quarter: "H1" | "H2";
  clock_seconds: number;
  event_type: "pts2" | "pts3" | "ft" | "foul" | "timeout" | "substitution";
  value: number;
  team_side: "home" | "away";
  player_id: string;
  player_name: string;
  created_at: string;
  home_score: number | null;
  away_score: number | null;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const sql = getSqlClient();

  try {
    const snapshotRows = await sql<SnapshotRow[]>`
      select
        m.id,
        m.status,
        m.quarter,
        m.clock_seconds,
        m.version,
        m.updated_at::text as updated_at,
        m.home_team_id,
        m.away_team_id,
        s.home_score,
        s.away_score,
        s.home_fouls,
        s.away_fouls,
        mm.venue,
        mm.scheduled_at::text as scheduled_at,
        coalesce(mm.tags, '{}'::text[]) as tags,
        mm.ticket_price
      from nbl_matches m
      join nbl_match_state s on s.match_id = m.id
      left join nbl_match_admin_meta mm on mm.match_id = m.id
      where m.id = ${params.id}
      limit 1
    `;

    const snapshot = snapshotRows[0];

    if (!snapshot) {
      return NextResponse.json(
        {
          ok: false,
          error: "Match not found",
        },
        { status: 404 },
      );
    }

    const playerRows = await sql<PlayerStatsRow[]>`
      select
        player_id,
        team_side,
        points,
        fouls
      from nbl_player_match_stats
      where match_id = ${params.id}
    `;

    const eventRows = await sql<EventRow[]>`
      select
        id,
        quarter,
        clock_seconds,
        event_type,
        value,
        team_side,
        player_id,
        player_name,
        created_at::text as created_at,
        home_score,
        away_score
      from nbl_match_events
      where match_id = ${params.id}
      order by created_at asc
    `;

    const baseMatch = MATCHES[params.id] ?? MATCHES["match-1"];
    const homeTeam =
      TEAMS[snapshot.home_team_id as keyof typeof TEAMS] ??
      baseMatch.homeState.team;
    const awayTeam =
      TEAMS[snapshot.away_team_id as keyof typeof TEAMS] ??
      baseMatch.awayState.team;

    const events: GameEvent[] =
      eventRows.length > 0
        ? eventRows.map((event) => ({
            id: event.id,
            matchId: snapshot.id,
            quarter: event.quarter,
            clockSeconds: event.clock_seconds,
            type: event.event_type,
            value: event.value,
            team: event.team_side,
            playerId: event.player_id,
            playerName: event.player_name,
            homeScore: event.home_score ?? snapshot.home_score,
            awayScore: event.away_score ?? snapshot.away_score,
            createdAt: event.created_at,
          }))
        : baseMatch.events;

    return NextResponse.json({
      ok: true,
      snapshot: {
        matchId: snapshot.id,
        status: snapshot.status,
        quarter: snapshot.quarter,
        clockSeconds: snapshot.clock_seconds,
        version: snapshot.version,
        updatedAt: snapshot.updated_at,
        score: {
          home: snapshot.home_score,
          away: snapshot.away_score,
        },
        fouls: {
          home: snapshot.home_fouls,
          away: snapshot.away_fouls,
        },
      },
      match: {
        id: snapshot.id,
        status: snapshot.status,
        quarter: snapshot.quarter,
        clockSeconds: snapshot.clock_seconds,
        updatedAt: snapshot.updated_at,
        venue: snapshot.venue ?? baseMatch.venue,
        scheduledAt: snapshot.scheduled_at ?? baseMatch.scheduledAt,
        tags: snapshot.tags ?? baseMatch.tags,
        ticketPrice: snapshot.ticket_price ?? baseMatch.ticketPrice,
        homeTeam: {
          id: homeTeam.id,
          name: homeTeam.name,
          shortName: homeTeam.shortName,
          code: homeTeam.code,
          city: homeTeam.city,
          score: snapshot.home_score,
        },
        awayTeam: {
          id: awayTeam.id,
          name: awayTeam.name,
          shortName: awayTeam.shortName,
          code: awayTeam.code,
          city: awayTeam.city,
          score: snapshot.away_score,
        },
      },
      events,
      playerStats: playerRows.map((row) => ({
        playerId: row.player_id,
        teamSide: row.team_side,
        points: row.points,
        fouls: row.fouls,
      })),
    });
  } catch (error) {
    console.error("Failed to load match snapshot", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
