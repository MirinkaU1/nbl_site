import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  role: z.string().min(2).max(80).optional(),
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
    body.role === undefined &&
    body.phone === undefined &&
    body.email === undefined &&
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
    const rows = await sql<StaffRow[]>`
      update nbl_staff_members
      set
        full_name = coalesce(${body.fullName?.trim() ?? null}, full_name),
        role = coalesce(${body.role?.trim() ?? null}, role),
        phone = coalesce(${sanitizeOptional(body.phone)}, phone),
        email = coalesce(${sanitizeOptional(body.email)}, email),
        photo_url = coalesce(${sanitizeOptional(body.photoUrl)}, photo_url),
        is_active = coalesce(${body.isActive ?? null}, is_active)
      where id = ${id}
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

    const staff = rows[0];

    if (!staff) {
      return NextResponse.json(
        {
          ok: false,
          error: "Staff member not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      staff: {
        id: staff.id,
        fullName: staff.full_name,
        role: staff.role,
        phone: staff.phone,
        email: staff.email,
        photoUrl: staff.photo_url,
        isActive: staff.is_active,
        createdAt: staff.created_at,
        updatedAt: staff.updated_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to update staff member",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
