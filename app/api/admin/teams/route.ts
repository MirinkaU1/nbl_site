import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const teamSchema = z.object({
  registrationId: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  category: z.enum(["Junior", "D1"]),
  city: z.string().max(120).optional(),
  logoUrl: z.string().url().max(500).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

type TeamRow = {
  id: string;
  registration_id: string | null;
  name: string;
  category: "Junior" | "D1";
  city: string | null;
  logo_url: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  player_count: number;
};

function sanitizeOptional(value?: string) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function mapTeam(row: TeamRow) {
  return {
    id: row.id,
    registrationId: row.registration_id,
    name: row.name,
    category: row.category,
    city: row.city,
    logoUrl: row.logo_url,
    status: row.status,
    playerCount: row.player_count,
    createdAt: row.created_at,
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
    const rows = await sql<TeamRow[]>`
      select
        t.id,
        t.registration_id,
        t.name,
        t.category,
        t.city,
        t.logo_url,
        t.status,
        t.created_at::text as created_at,
        t.updated_at::text as updated_at,
        coalesce(count(tp.id) filter (where tp.is_active = true), 0)::int as player_count
      from nbl_teams_admin t
      left join nbl_team_players tp on tp.team_id = t.id
      group by t.id
      order by t.created_at desc
    `;

    return NextResponse.json({
      ok: true,
      teams: rows.map(mapTeam),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load teams",
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
  const parsed = teamSchema.safeParse(payload);

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
  const sql = getSqlClient();

  try {
    const rows = await sql<TeamRow[]>`
      insert into nbl_teams_admin (
        registration_id,
        name,
        category,
        city,
        logo_url,
        status
      ) values (
        ${body.registrationId ?? null},
        ${body.name.trim()},
        ${body.category},
        ${sanitizeOptional(body.city)},
        ${sanitizeOptional(body.logoUrl)},
        ${body.status ?? "active"}
      )
      returning
        id,
        registration_id,
        name,
        category,
        city,
        logo_url,
        status,
        created_at::text as created_at,
        updated_at::text as updated_at,
        0::int as player_count
    `;

    return NextResponse.json({
      ok: true,
      team: mapTeam(rows[0]),
    });
  } catch (error) {
    const err = error as { code?: string };

    if (err?.code === "23505") {
      return NextResponse.json(
        {
          ok: false,
          error: "Team already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create team",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
