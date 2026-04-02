import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Sql } from "postgres";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createMatchSchema = z.object({
  id: z.string().min(3).max(80).optional(),
  homeTeamId: z.string().min(2).max(80),
  awayTeamId: z.string().min(2).max(80),
  status: z.enum(["live", "upcoming", "finished", "timeout"]).optional(),
  quarter: z.enum(["H1", "H2"]).optional(),
  clockSeconds: z.number().int().min(0).optional(),
  venue: z.string().max(140).optional(),
  scheduledAt: z.string().datetime().optional(),
  ticketPrice: z.string().max(80).optional(),
  tags: z.array(z.string().min(1).max(24)).max(8).optional(),
});

type MatchRow = {
  id: string;
  status: "live" | "upcoming" | "finished" | "timeout";
  quarter: "H1" | "H2";
  clock_seconds: number;
  home_team_id: string;
  away_team_id: string;
  venue: string | null;
  scheduled_at: string | null;
  ticket_price: string | null;
  tags: string[] | null;
  updated_at: string;
};

function sanitizeOptional(value?: string) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function mapMatch(row: MatchRow) {
  return {
    id: row.id,
    status: row.status,
    quarter: row.quarter,
    clockSeconds: row.clock_seconds,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    venue: row.venue,
    scheduledAt: row.scheduled_at,
    ticketPrice: row.ticket_price,
    tags: row.tags ?? [],
    updatedAt: row.updated_at,
  };
}

export async function GET(request: Request) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  const sql = getSqlClient();

  try {
    const rows = await sql<MatchRow[]>`
      select
        m.id,
        m.status,
        m.quarter,
        m.clock_seconds,
        m.home_team_id,
        m.away_team_id,
        mm.venue,
        mm.scheduled_at::text as scheduled_at,
        mm.ticket_price,
        coalesce(mm.tags, '{}'::text[]) as tags,
        m.updated_at::text as updated_at
      from nbl_matches m
      left join nbl_match_admin_meta mm on mm.match_id = m.id
      order by coalesce(mm.scheduled_at, m.updated_at) desc
    `;

    return NextResponse.json({
      ok: true,
      matches: rows.map(mapMatch),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load matches",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  const payload = await request.json().catch(() => null);
  const parsed = createMatchSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const body = parsed.data;

  if (body.homeTeamId === body.awayTeamId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Home and away teams must be different",
      },
      { status: 400 },
    );
  }

  const sql = getSqlClient();
  const matchId = body.id?.trim() || `match-${randomUUID().slice(0, 8)}`;

  try {
    const result = await sql.begin(async (tx) => {
      const txSql = tx as unknown as Sql;

      await txSql`
        insert into nbl_matches (
          id,
          status,
          quarter,
          clock_seconds,
          home_team_id,
          away_team_id,
          version,
          updated_at
        ) values (
          ${matchId},
          ${body.status ?? "upcoming"},
          ${body.quarter ?? "H1"},
          ${body.clockSeconds ?? 600},
          ${body.homeTeamId.trim()},
          ${body.awayTeamId.trim()},
          0,
          now()
        )
      `;

      await txSql`
        insert into nbl_match_state (match_id)
        values (${matchId})
        on conflict (match_id) do nothing
      `;

      await txSql`
        insert into nbl_match_admin_meta (
          match_id,
          venue,
          scheduled_at,
          ticket_price,
          tags
        ) values (
          ${matchId},
          ${sanitizeOptional(body.venue) ?? "A definir"},
          ${body.scheduledAt ?? null},
          ${sanitizeOptional(body.ticketPrice)},
          ${body.tags ?? []}
        )
        on conflict (match_id)
        do update set
          venue = excluded.venue,
          scheduled_at = excluded.scheduled_at,
          ticket_price = excluded.ticket_price,
          tags = excluded.tags
      `;

      const rows = await txSql<MatchRow[]>`
        select
          m.id,
          m.status,
          m.quarter,
          m.clock_seconds,
          m.home_team_id,
          m.away_team_id,
          mm.venue,
          mm.scheduled_at::text as scheduled_at,
          mm.ticket_price,
          coalesce(mm.tags, '{}'::text[]) as tags,
          m.updated_at::text as updated_at
        from nbl_matches m
        left join nbl_match_admin_meta mm on mm.match_id = m.id
        where m.id = ${matchId}
        limit 1
      `;

      return rows[0];
    });

    return NextResponse.json({
      ok: true,
      match: mapMatch(result),
    });
  } catch (error) {
    const err = error as { code?: string };

    if (err?.code === "23505") {
      return NextResponse.json(
        {
          ok: false,
          error: "Match id already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create match",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
