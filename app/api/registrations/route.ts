import { NextResponse } from "next/server";
import { z } from "zod";
import type { Sql } from "postgres";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categoryCapacity: Record<"Junior" | "D1", number> = {
  Junior: 12,
  D1: 12,
};

const playerSchema = z.object({
  fullName: z.string().min(2).max(120),
  jerseyNumber: z.number().int().min(0).max(99).optional(),
  position: z.enum(["PG", "SG", "SF", "PF", "C", "N/A"]).optional(),
  photoUrl: z
    .union([
      z.string().url().max(500),
      z.string().startsWith("data:image/").max(2_000_000),
    ])
    .optional(),
  isCaptain: z.boolean().optional(),
});

const registrationSchema = z.object({
  category: z.enum(["Junior", "D1"]),
  teamName: z.string().min(2).max(120),
  captainName: z.string().min(2).max(120),
  phone: z.string().min(8).max(40),
  email: z.string().email().max(254).optional().or(z.literal("")),
  commune: z.string().min(2).max(120),
  playerCount: z.coerce.number().int().min(5).max(20),
  source: z.string().max(120).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  players: z.array(playerSchema).max(20).optional(),
});

type InsertedRegistrationRow = {
  id: string;
  status: string;
  payment_status: string;
  created_at: string;
};

type SpotsRow = {
  category: "Junior" | "D1";
  active_registrations: number;
  approved_count: number;
};

function sanitizeOptionalText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function buildPlayers(
  players: Array<z.infer<typeof playerSchema>> | undefined,
  captainName: string,
) {
  const trimmedPlayers = (players ?? [])
    .map((player) => ({
      ...player,
      fullName: player.fullName.trim(),
      position: player.position ?? "N/A",
      photoUrl: sanitizeOptionalText(player.photoUrl),
    }))
    .filter((player) => player.fullName.length >= 2);

  if (trimmedPlayers.length === 0) {
    return [
      {
        fullName: captainName.trim(),
        position: "N/A" as const,
        isCaptain: true,
        jerseyNumber: undefined,
        photoUrl: null,
      },
    ];
  }

  if (!trimmedPlayers.some((player) => player.isCaptain)) {
    const captainIndex = trimmedPlayers.findIndex(
      (player) =>
        player.fullName.toLowerCase() === captainName.trim().toLowerCase(),
    );
    const indexToPromote = captainIndex >= 0 ? captainIndex : 0;
    trimmedPlayers[indexToPromote] = {
      ...trimmedPlayers[indexToPromote],
      isCaptain: true,
    };
  }

  return trimmedPlayers;
}

export async function GET() {
  const sql = getSqlClient();

  try {
    const rows = await sql<SpotsRow[]>`
      select
        category,
        count(*) filter (where status in ('pending_review', 'approved', 'waitlist'))::int as active_registrations,
        count(*) filter (where status = 'approved')::int as approved_count
      from nbl_team_registrations
      group by category
    `;

    const byCategory = new Map(rows.map((row) => [row.category, row]));

    const categories = {
      Junior: {
        capacity: categoryCapacity.Junior,
        activeRegistrations:
          byCategory.get("Junior")?.active_registrations ?? 0,
        approved: byCategory.get("Junior")?.approved_count ?? 0,
        remaining:
          categoryCapacity.Junior -
          (byCategory.get("Junior")?.active_registrations ?? 0),
      },
      D1: {
        capacity: categoryCapacity.D1,
        activeRegistrations: byCategory.get("D1")?.active_registrations ?? 0,
        approved: byCategory.get("D1")?.approved_count ?? 0,
        remaining:
          categoryCapacity.D1 -
          (byCategory.get("D1")?.active_registrations ?? 0),
      },
    };

    categories.Junior.remaining = Math.max(0, categories.Junior.remaining);
    categories.D1.remaining = Math.max(0, categories.D1.remaining);

    return NextResponse.json({
      ok: true,
      categories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load registration spots",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = registrationSchema.safeParse(payload);

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
  const players = buildPlayers(body.players, body.captainName);
  const playerCount = body.players?.length ? players.length : body.playerCount;
  const sql = getSqlClient();

  try {
    const result = await sql.begin(async (tx) => {
      const txSql = tx as unknown as Sql;

      const inserted = await txSql<InsertedRegistrationRow[]>`
        insert into nbl_team_registrations (
          category,
          team_name,
          captain_name,
          phone,
          email,
          commune,
          player_count,
          source,
          notes
        ) values (
          ${body.category},
          ${body.teamName.trim()},
          ${body.captainName.trim()},
          ${body.phone.trim()},
          ${sanitizeOptionalText(body.email)},
          ${body.commune.trim()},
          ${playerCount},
          ${sanitizeOptionalText(body.source)},
          ${sanitizeOptionalText(body.notes)}
        )
        returning id, status, payment_status, created_at::text as created_at
      `;

      const registration = inserted[0];

      for (const player of players) {
        await txSql`
          insert into nbl_registration_players (
            registration_id,
            full_name,
            jersey_number,
            position,
            photo_url,
            is_captain
          ) values (
            ${registration.id},
            ${player.fullName},
            ${player.jerseyNumber ?? null},
            ${player.position},
            ${player.photoUrl},
            ${player.isCaptain ?? false}
          )
        `;
      }

      return registration;
    });

    return NextResponse.json({
      ok: true,
      registration: {
        id: result.id,
        status: result.status,
        paymentStatus: result.payment_status,
        createdAt: result.created_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to save registration",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
