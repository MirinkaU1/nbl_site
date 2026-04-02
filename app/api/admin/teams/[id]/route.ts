import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  category: z.enum(["Junior", "D1"]).optional(),
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
    body.name === undefined &&
    body.category === undefined &&
    body.city === undefined &&
    body.logoUrl === undefined &&
    body.status === undefined
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
    const rows = await sql<TeamRow[]>`
      update nbl_teams_admin
      set
        name = coalesce(${body.name?.trim() ?? null}, name),
        category = coalesce(${body.category ?? null}, category),
        city = coalesce(${sanitizeOptional(body.city)}, city),
        logo_url = coalesce(${sanitizeOptional(body.logoUrl)}, logo_url),
        status = coalesce(${body.status ?? null}, status)
      where id = ${id}
      returning
        id,
        registration_id,
        name,
        category,
        city,
        logo_url,
        status,
        created_at::text as created_at,
        updated_at::text as updated_at
    `;

    const team = rows[0];

    if (!team) {
      return NextResponse.json(
        {
          ok: false,
          error: "Team not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      team: {
        id: team.id,
        registrationId: team.registration_id,
        name: team.name,
        category: team.category,
        city: team.city,
        logoUrl: team.logo_url,
        status: team.status,
        createdAt: team.created_at,
        updatedAt: team.updated_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to update team",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
