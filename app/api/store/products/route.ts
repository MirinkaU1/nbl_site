import { NextResponse } from "next/server";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
};

export async function GET(request: Request) {
  const sql = getSqlClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim();

  try {
    const rows = category
      ? await sql<ProductRow[]>`
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
            created_at::text as created_at
          from nbl_products
          where is_active = true and upper(category) = upper(${category})
          order by created_at desc
        `
      : await sql<ProductRow[]>`
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
            created_at::text as created_at
          from nbl_products
          where is_active = true
          order by created_at desc
        `;

    return NextResponse.json({
      ok: true,
      products: rows.map((row) => ({
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
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load store products",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
