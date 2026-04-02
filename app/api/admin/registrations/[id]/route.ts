import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z
    .enum(["pending_review", "approved", "waitlist", "rejected"])
    .optional(),
  paymentStatus: z.enum(["unpaid", "partial", "paid", "refunded"]).optional(),
  registrationFeeCfa: z.number().int().min(0).optional(),
  amountPaidCfa: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
  createTeamOnApproval: z.boolean().optional(),
});

type RegistrationRow = {
  id: string;
  category: "Junior" | "D1";
  team_name: string;
  commune: string;
  status: "pending_review" | "approved" | "waitlist" | "rejected";
  payment_status: "unpaid" | "partial" | "paid" | "refunded";
  registration_fee_cfa: number;
  amount_paid_cfa: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type PlayerRow = {
  id: string;
  full_name: string;
  jersey_number: number | null;
  position: "PG" | "SG" | "SF" | "PF" | "C" | "N/A";
  photo_url: string | null;
  is_captain: boolean;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const sql = getSqlClient();

  try {
    const registrations = await sql<RegistrationRow[]>`
      select
        id,
        category,
        team_name,
        commune,
        status,
        payment_status,
        registration_fee_cfa,
        amount_paid_cfa,
        notes,
        created_at::text as created_at,
        updated_at::text as updated_at
      from nbl_team_registrations
      where id = ${id}
      limit 1
    `;

    const registration = registrations[0];

    if (!registration) {
      return NextResponse.json(
        {
          ok: false,
          error: "Registration not found",
        },
        { status: 404 },
      );
    }

    const players = await sql<PlayerRow[]>`
      select
        id,
        full_name,
        jersey_number,
        position,
        photo_url,
        is_captain
      from nbl_registration_players
      where registration_id = ${id}
      order by is_captain desc, created_at asc
    `;

    return NextResponse.json({
      ok: true,
      registration: {
        id: registration.id,
        category: registration.category,
        teamName: registration.team_name,
        commune: registration.commune,
        status: registration.status,
        paymentStatus: registration.payment_status,
        registrationFeeCfa: registration.registration_fee_cfa,
        amountPaidCfa: registration.amount_paid_cfa,
        notes: registration.notes,
        createdAt: registration.created_at,
        updatedAt: registration.updated_at,
      },
      players: players.map((player) => ({
        id: player.id,
        fullName: player.full_name,
        jerseyNumber: player.jersey_number,
        position: player.position,
        photoUrl: player.photo_url,
        isCaptain: player.is_captain,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load registration",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
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
    body.paymentStatus === undefined &&
    body.registrationFeeCfa === undefined &&
    body.amountPaidCfa === undefined &&
    body.notes === undefined
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
    const result = await sql.begin(async (tx) => {
      const rows = await tx<RegistrationRow[]>`
        update nbl_team_registrations
        set
          status = coalesce(${body.status ?? null}, status),
          payment_status = coalesce(${body.paymentStatus ?? null}, payment_status),
          registration_fee_cfa = coalesce(${body.registrationFeeCfa ?? null}, registration_fee_cfa),
          amount_paid_cfa = coalesce(${body.amountPaidCfa ?? null}, amount_paid_cfa),
          notes = coalesce(${body.notes ?? null}, notes)
        where id = ${id}
        returning
          id,
          category,
          team_name,
          commune,
          status,
          payment_status,
          registration_fee_cfa,
          amount_paid_cfa,
          notes,
          created_at::text as created_at,
          updated_at::text as updated_at
      `;

      const updated = rows[0];

      if (!updated) {
        return null;
      }

      const shouldCreateTeam =
        (body.createTeamOnApproval ?? true) && updated.status === "approved";

      if (shouldCreateTeam) {
        await tx`
          insert into nbl_teams_admin (
            registration_id,
            name,
            category,
            city,
            status
          ) values (
            ${updated.id},
            ${updated.team_name},
            ${updated.category},
            ${updated.commune},
            'active'
          )
          on conflict (registration_id)
          do update set
            name = excluded.name,
            category = excluded.category,
            city = excluded.city,
            status = 'active'
        `;
      }

      return updated;
    });

    if (!result) {
      return NextResponse.json(
        {
          ok: false,
          error: "Registration not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      registration: {
        id: result.id,
        category: result.category,
        teamName: result.team_name,
        commune: result.commune,
        status: result.status,
        paymentStatus: result.payment_status,
        registrationFeeCfa: result.registration_fee_cfa,
        amountPaidCfa: result.amount_paid_cfa,
        notes: result.notes,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to update registration",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
