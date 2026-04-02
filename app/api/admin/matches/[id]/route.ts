import { NextResponse } from "next/server";
import { z } from "zod";
import type { Sql } from "postgres";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["live", "upcoming", "finished", "timeout"]).optional(),
  quarter: z.enum(["H1", "H2"]).optional(),
  clockSeconds: z.number().int().min(0).optional(),
  homeTeamId: z.string().min(2).max(80).optional(),
  awayTeamId: z.string().min(2).max(80).optional(),
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(payload);

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

  if (
    body.status === undefined &&
    body.quarter === undefined &&
    body.clockSeconds === undefined &&
    body.homeTeamId === undefined &&
    body.awayTeamId === undefined &&
    body.venue === undefined &&
    body.scheduledAt === undefined &&
    body.ticketPrice === undefined &&
    body.tags === undefined
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "No fields to update",
      },
      { status: 400 },
    );
  }

  const nextHomeTeamId = body.homeTeamId?.trim();
  const nextAwayTeamId = body.awayTeamId?.trim();

  if (nextHomeTeamId && nextAwayTeamId && nextHomeTeamId === nextAwayTeamId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Home and away teams must be different",
      },
      { status: 400 },
    );
  }

  const sql = getSqlClient();

  try {
    const result = await sql.begin(async (tx) => {
      const txSql = tx as unknown as Sql;

      const rows = await txSql`
        update nbl_matches
        set
          status = coalesce(${body.status ?? null}, status),
          quarter = coalesce(${body.quarter ?? null}, quarter),
          clock_seconds = coalesce(${body.clockSeconds ?? null}, clock_seconds),
          home_team_id = coalesce(${nextHomeTeamId ?? null}, home_team_id),
          away_team_id = coalesce(${nextAwayTeamId ?? null}, away_team_id),
          updated_at = now()
        where id = ${id}
        returning id
      `;

      if (!rows[0]) {
        return null;
      }

      const hasMetaChanges =
        body.venue !== undefined ||
        body.scheduledAt !== undefined ||
        body.ticketPrice !== undefined ||
        body.tags !== undefined;

      if (hasMetaChanges) {
        await txSql`
          insert into nbl_match_admin_meta (
            match_id,
            venue,
            scheduled_at,
            ticket_price,
            tags
          ) values (
            ${id},
            ${sanitizeOptional(body.venue) ?? "A definir"},
            ${body.scheduledAt ?? null},
            ${sanitizeOptional(body.ticketPrice)},
            ${body.tags ?? []}
          )
          on conflict (match_id)
          do update set
            venue = coalesce(${sanitizeOptional(body.venue)}, nbl_match_admin_meta.venue),
            scheduled_at = coalesce(${body.scheduledAt ?? null}, nbl_match_admin_meta.scheduled_at),
            ticket_price = coalesce(${sanitizeOptional(body.ticketPrice)}, nbl_match_admin_meta.ticket_price),
            tags = coalesce(${body.tags ?? null}, nbl_match_admin_meta.tags)
        `;
      }

      const matchRows = await txSql<MatchRow[]>`
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
        where m.id = ${id}
        limit 1
      `;

      return matchRows[0];
    });

    if (!result) {
      return NextResponse.json(
        {
          ok: false,
          error: "Match not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      match: mapMatch(result),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to update match",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
