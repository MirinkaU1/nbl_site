import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
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
    body.fullName === undefined &&
    body.jerseyNumber === undefined &&
    body.position === undefined &&
    body.photoUrl === undefined &&
    body.isActive === undefined
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "No fields to update",
      },
      { status: 400 },
    );
  }

  const sql = getSqlClient();

  try {
    const rows = await sql<PlayerRow[]>`
      update nbl_team_players
      set
        full_name = coalesce(${body.fullName?.trim() ?? null}, full_name),
        jersey_number = coalesce(${body.jerseyNumber ?? null}, jersey_number),
        position = coalesce(${body.position ?? null}, position),
        photo_url = coalesce(${sanitizeOptional(body.photoUrl)}, photo_url),
        is_active = coalesce(${body.isActive ?? null}, is_active)
      where id = ${id}
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

    const player = rows[0];

    if (!player) {
      return NextResponse.json(
        {
          ok: false,
          error: "Player not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      player: {
        id: player.id,
        teamId: player.team_id,
        fullName: player.full_name,
        jerseyNumber: player.jersey_number,
        position: player.position,
        photoUrl: player.photo_url,
        isActive: player.is_active,
        createdAt: player.created_at,
        updatedAt: player.updated_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to update player",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
