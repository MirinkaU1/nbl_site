import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const staffSchema = z.object({
  fullName: z.string().min(2).max(120),
  role: z.string().min(2).max(80),
  phone: z.string().max(40).optional(),
  email: z.string().email().max(254).optional(),
  photoUrl: z.string().url().max(500).optional(),
  isActive: z.boolean().optional(),
});

type StaffRow = {
  id: string;
  full_name: string;
  role: string;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function sanitizeOptional(value?: string) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function mapStaff(row: StaffRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    phone: row.phone,
    email: row.email,
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

  try {
    const rows = await sql<StaffRow[]>`
      select
        id,
        full_name,
        role,
        phone,
        email,
        photo_url,
        is_active,
        created_at::text as created_at,
        updated_at::text as updated_at
      from nbl_staff_members
      order by created_at desc
    `;

    return NextResponse.json({
      ok: true,
      staff: rows.map(mapStaff),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load staff",
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
  const parsed = staffSchema.safeParse(payload);

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
    const rows = await sql<StaffRow[]>`
      insert into nbl_staff_members (
        full_name,
        role,
        phone,
        email,
        photo_url,
        is_active
      ) values (
        ${body.fullName.trim()},
        ${body.role.trim()},
        ${sanitizeOptional(body.phone)},
        ${sanitizeOptional(body.email)},
        ${sanitizeOptional(body.photoUrl)},
        ${body.isActive ?? true}
      )
      returning
        id,
        full_name,
        role,
        phone,
        email,
        photo_url,
        is_active,
        created_at::text as created_at,
        updated_at::text as updated_at
    `;

    return NextResponse.json({
      ok: true,
      staff: mapStaff(rows[0]),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create staff member",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
