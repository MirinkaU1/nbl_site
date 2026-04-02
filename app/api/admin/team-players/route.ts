import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const playerSchema = z.object({
  teamId: z.string().uuid(),
  fullName: z.string().min(2).max(120),
  jerseyNumber: z.number().int().min(0).max(99).optional(),
  position: z.enum(["PG", "SG", "SF", "PF", "C", "N/A"]).optional(),
  photoUrl: z.string().url().max(500).optional(),
  isActive: z.boolean().optional(),
});

type PlayerRow = {
  id: string;
  team_id: string;
  full_name: string;
  jersey_number: number | null;
  position: "PG" | "SG" | "SF" | "PF" | "C" | "N/A";
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function sanitizeOptional(value?: string) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function mapPlayer(row: PlayerRow) {
  return {
    id: row.id,
    teamId: row.team_id,
    fullName: row.full_name,
    jerseyNumber: row.jersey_number,
    position: row.position,
    photoUrl: row.photo_url,
    isActive: row.is_active,
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
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  try {
    const rows = teamId
      ? await sql<PlayerRow[]>`
          select
            id,
            team_id,
            full_name,
            jersey_number,
            position,
            photo_url,
            is_active,
            created_at::text as created_at,
            updated_at::text as updated_at
          from nbl_team_players
          where team_id = ${teamId}
          order by created_at asc
        `
      : await sql<PlayerRow[]>`
          select
            id,
            team_id,
            full_name,
            jersey_number,
            position,
            photo_url,
            is_active,
            created_at::text as created_at,
            updated_at::text as updated_at
          from nbl_team_players
          order by created_at desc
          limit 100
        `;

    return NextResponse.json({
      ok: true,
      players: rows.map(mapPlayer),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load team players",
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
  const parsed = playerSchema.safeParse(payload);

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
    const rows = await sql<PlayerRow[]>`
      insert into nbl_team_players (
        team_id,
        full_name,
        jersey_number,
        position,
        photo_url,
        is_active
      ) values (
        ${body.teamId},
        ${body.fullName.trim()},
        ${body.jerseyNumber ?? null},
        ${body.position ?? "N/A"},
        ${sanitizeOptional(body.photoUrl)},
        ${body.isActive ?? true}
      )
      returning
        id,
        team_id,
        full_name,
        jersey_number,
        position,
        photo_url,
        is_active,
        created_at::text as created_at,
        updated_at::text as updated_at
    `;

    return NextResponse.json({
      ok: true,
      player: mapPlayer(rows[0]),
    });
  } catch (error) {
    const err = error as { code?: string };

    if (err?.code === "23505") {
      return NextResponse.json(
        {
          ok: false,
          error: "Player already exists for this team",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create player",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
