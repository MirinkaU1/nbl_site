import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  category: z.string().min(2).max(60).optional(),
  description: z.string().max(2000).optional(),
  priceCfa: z.number().int().min(0).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  imageUrl: z.string().url().max(500).optional(),
  isActive: z.boolean().optional(),
});

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price_cfa: number;
  stock_quantity: number;
  image_url: string | null;
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
    body.name === undefined &&
    body.category === undefined &&
    body.description === undefined &&
    body.priceCfa === undefined &&
    body.stockQuantity === undefined &&
    body.imageUrl === undefined &&
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
    const rows = await sql<ProductRow[]>`
      update nbl_products
      set
        name = coalesce(${body.name?.trim() ?? null}, name),
        category = coalesce(${body.category?.trim() ?? null}, category),
        description = coalesce(${sanitizeOptional(body.description)}, description),
        price_cfa = coalesce(${body.priceCfa ?? null}, price_cfa),
        stock_quantity = coalesce(${body.stockQuantity ?? null}, stock_quantity),
        image_url = coalesce(${sanitizeOptional(body.imageUrl)}, image_url),
        is_active = coalesce(${body.isActive ?? null}, is_active)
      where id = ${id}
      returning
        id,
        name,
        slug,
        category,
        description,
        price_cfa,
        stock_quantity,
        image_url,
        is_active,
        created_at::text as created_at,
        updated_at::text as updated_at
    `;

    const product = rows[0];

    if (!product) {
      return NextResponse.json(
        {
          ok: false,
          error: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        description: product.description,
        priceCfa: product.price_cfa,
        stockQuantity: product.stock_quantity,
        imageUrl: product.image_url,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to update product",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
