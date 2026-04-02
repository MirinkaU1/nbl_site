import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const paymentSchema = z
  .object({
    registrationId: z.string().uuid().optional(),
    orderId: z.string().uuid().optional(),
    provider: z.string().min(2).max(60).optional(),
    providerReference: z.string().max(120).optional(),
    amountCfa: z.number().int().min(0),
    currency: z.string().min(3).max(3).optional(),
    status: z.enum(["pending", "confirmed", "failed", "refunded"]).optional(),
    paidAt: z.string().datetime().optional(),
  })
  .refine((value) => Boolean(value.registrationId) !== Boolean(value.orderId), {
    message: "Either registrationId or orderId must be set, not both",
    path: ["registrationId"],
  });

type PaymentRow = {
  id: string;
  registration_id: string | null;
  order_id: string | null;
  provider: string;
  provider_reference: string | null;
  amount_cfa: number;
  currency: string;
  status: "pending" | "confirmed" | "failed" | "refunded";
  paid_at: string | null;
  created_at: string;
};

export async function GET(request: Request) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  const sql = getSqlClient();
  const { searchParams } = new URL(request.url);
  const registrationId = searchParams.get("registrationId");
  const orderId = searchParams.get("orderId");

  try {
    const rows = registrationId
      ? await sql<PaymentRow[]>`
          select
            id,
            registration_id,
            order_id,
            provider,
            provider_reference,
            amount_cfa,
            currency,
            status,
            paid_at::text as paid_at,
            created_at::text as created_at
          from nbl_payments
          where registration_id = ${registrationId}
          order by created_at desc
        `
      : orderId
        ? await sql<PaymentRow[]>`
            select
              id,
              registration_id,
              order_id,
              provider,
              provider_reference,
              amount_cfa,
              currency,
              status,
              paid_at::text as paid_at,
              created_at::text as created_at
            from nbl_payments
            where order_id = ${orderId}
            order by created_at desc
          `
        : await sql<PaymentRow[]>`
            select
              id,
              registration_id,
              order_id,
              provider,
              provider_reference,
              amount_cfa,
              currency,
              status,
              paid_at::text as paid_at,
              created_at::text as created_at
            from nbl_payments
            order by created_at desc
            limit 100
          `;

    return NextResponse.json({
      ok: true,
      payments: rows.map((row) => ({
        id: row.id,
        registrationId: row.registration_id,
        orderId: row.order_id,
        provider: row.provider,
        providerReference: row.provider_reference,
        amountCfa: row.amount_cfa,
        currency: row.currency,
        status: row.status,
        paidAt: row.paid_at,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load payments",
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
  const parsed = paymentSchema.safeParse(payload);

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
    const payment = await sql.begin(async (tx) => {
      const rows = await tx<PaymentRow[]>`
        insert into nbl_payments (
          registration_id,
          order_id,
          provider,
          provider_reference,
          amount_cfa,
          currency,
          status,
          paid_at
        ) values (
          ${body.registrationId ?? null},
          ${body.orderId ?? null},
          ${body.provider?.trim() || "mobile_money"},
          ${body.providerReference?.trim() || null},
          ${body.amountCfa},
          ${(body.currency || "XOF").toUpperCase()},
          ${body.status ?? "confirmed"},
          ${body.paidAt ?? new Date().toISOString()}
        )
        returning
          id,
          registration_id,
          order_id,
          provider,
          provider_reference,
          amount_cfa,
          currency,
          status,
          paid_at::text as paid_at,
          created_at::text as created_at
      `;

      const inserted = rows[0];

      if (inserted.registration_id && inserted.status === "confirmed") {
        const totals = await tx<
          Array<{
            amount_paid_cfa: number;
            registration_fee_cfa: number;
          }>
        >`
          update nbl_team_registrations
          set amount_paid_cfa = amount_paid_cfa + ${inserted.amount_cfa}
          where id = ${inserted.registration_id}
          returning amount_paid_cfa, registration_fee_cfa
        `;

        const registration = totals[0];

        if (registration) {
          const paymentStatus =
            registration.amount_paid_cfa <= 0
              ? "unpaid"
              : registration.amount_paid_cfa >=
                  registration.registration_fee_cfa
                ? "paid"
                : "partial";

          await tx`
            update nbl_team_registrations
            set payment_status = ${paymentStatus}
            where id = ${inserted.registration_id}
          `;
        }
      }

      if (inserted.order_id && inserted.status === "confirmed") {
        await tx`
          update nbl_orders
          set payment_status = 'paid'
          where id = ${inserted.order_id}
        `;
      }

      return inserted;
    });

    return NextResponse.json({
      ok: true,
      payment: {
        id: payment.id,
        registrationId: payment.registration_id,
        orderId: payment.order_id,
        provider: payment.provider,
        providerReference: payment.provider_reference,
        amountCfa: payment.amount_cfa,
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paid_at,
        createdAt: payment.created_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create payment",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
