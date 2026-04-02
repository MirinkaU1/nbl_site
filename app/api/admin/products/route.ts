import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).optional(),
  category: z.string().min(2).max(60),
  description: z.string().max(2000).optional(),
  priceCfa: z.number().int().min(0),
  stockQuantity: z.number().int().min(0),
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

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function sanitizeOptional(value?: string) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    priceCfa: row.price_cfa,
    stockQuantity: row.stock_quantity,
    imageUrl: row.image_url,
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
    const rows = await sql<ProductRow[]>`
      select
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
      from nbl_products
      order by created_at desc
    `;

    return NextResponse.json({
      ok: true,
      products: rows.map(mapProduct),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load products",
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
  const parsed = productSchema.safeParse(payload);

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
    const rows = await sql<ProductRow[]>`
      insert into nbl_products (
        name,
        slug,
        category,
        description,
        price_cfa,
        stock_quantity,
        image_url,
        is_active
      ) values (
        ${body.name.trim()},
        ${slugify(body.slug?.trim() || body.name)},
        ${body.category.trim()},
        ${sanitizeOptional(body.description)},
        ${body.priceCfa},
        ${body.stockQuantity},
        ${sanitizeOptional(body.imageUrl)},
        ${body.isActive ?? true}
      )
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

    return NextResponse.json({
      ok: true,
      product: mapProduct(rows[0]),
    });
  } catch (error) {
    const err = error as { code?: string };

    if (err?.code === "23505") {
      return NextResponse.json(
        {
          ok: false,
          error: "Product slug already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create product",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
