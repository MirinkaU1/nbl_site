import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/server/admin-auth";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SummaryRow = {
  registrations_pending: number;
  registrations_paid: number;
  teams_active: number;
  players_active: number;
  staff_active: number;
  products_active: number;
  upcoming_matches: number;
};

type RegistrationRow = {
  id: string;
  category: "Junior" | "D1";
  team_name: string;
  captain_name: string;
  phone: string;
  email: string | null;
  commune: string;
  player_count: number;
  source: string | null;
  notes: string | null;
  status: "pending_review" | "approved" | "waitlist" | "rejected";
  payment_status: "unpaid" | "partial" | "paid" | "refunded";
  registration_fee_cfa: number;
  amount_paid_cfa: number;
  created_at: string;
  updated_at: string;
  roster_size: number;
};

type TeamRow = {
  id: string;
  registration_id: string | null;
  name: string;
  category: "Junior" | "D1";
  city: string | null;
  logo_url: string | null;
  status: "active" | "inactive";
  created_at: string;
  player_count: number;
};

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

type MatchRow = {
  id: string;
  status: "live" | "upcoming" | "finished" | "timeout";
  quarter: "H1" | "H2";
  clock_seconds: number;
  home_team_id: string;
  away_team_id: string;
  venue: string | null;
  scheduled_at: string | null;
  ticket_price: string | null;
  tags: string[] | null;
  updated_at: string;
};

export async function GET(request: Request) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  const sql = getSqlClient();

  try {
    const [
      summaryRows,
      registrationRows,
      teamRows,
      staffRows,
      productRows,
      matchRows,
    ] = await Promise.all([
      sql<SummaryRow[]>`
          select
            (select count(*)::int from nbl_team_registrations where status = 'pending_review') as registrations_pending,
            (select count(*)::int from nbl_team_registrations where payment_status = 'paid') as registrations_paid,
            (select count(*)::int from nbl_teams_admin where status = 'active') as teams_active,
            (select count(*)::int from nbl_team_players where is_active = true) as players_active,
            (select count(*)::int from nbl_staff_members where is_active = true) as staff_active,
            (select count(*)::int from nbl_products where is_active = true) as products_active,
            (select count(*)::int from nbl_matches where status = 'upcoming') as upcoming_matches
        `,
      sql<RegistrationRow[]>`
          select
            r.id,
            r.category,
            r.team_name,
            r.captain_name,
            r.phone,
            r.email,
            r.commune,
            r.player_count,
            r.source,
            r.notes,
            r.status,
            r.payment_status,
            r.registration_fee_cfa,
            r.amount_paid_cfa,
            r.created_at::text as created_at,
            r.updated_at::text as updated_at,
            coalesce(count(p.id), 0)::int as roster_size
          from nbl_team_registrations r
          left join nbl_registration_players p
            on p.registration_id = r.id
          group by r.id
          order by r.created_at desc
          limit 12
        `,
      sql<TeamRow[]>`
          select
            t.id,
            t.registration_id,
            t.name,
            t.category,
            t.city,
            t.logo_url,
            t.status,
            t.created_at::text as created_at,
            coalesce(count(tp.id) filter (where tp.is_active = true), 0)::int as player_count
          from nbl_teams_admin t
          left join nbl_team_players tp
            on tp.team_id = t.id
          group by t.id
          order by t.created_at desc
          limit 12
        `,
      sql<StaffRow[]>`
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
          limit 12
        `,
      sql<ProductRow[]>`
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
          limit 12
        `,
      sql<MatchRow[]>`
          select
            m.id,
            m.status,
            m.quarter,
            m.clock_seconds,
            m.home_team_id,
            m.away_team_id,
            mm.venue,
            mm.scheduled_at::text as scheduled_at,
            mm.ticket_price,
            coalesce(mm.tags, '{}'::text[]) as tags,
            m.updated_at::text as updated_at
          from nbl_matches m
          left join nbl_match_admin_meta mm
            on mm.match_id = m.id
          order by coalesce(mm.scheduled_at, m.updated_at) desc
          limit 12
        `,
    ]);

    const summary = summaryRows[0];

    return NextResponse.json({
      ok: true,
      summary: {
        registrationsPending: summary?.registrations_pending ?? 0,
        registrationsPaid: summary?.registrations_paid ?? 0,
        teamsActive: summary?.teams_active ?? 0,
        playersActive: summary?.players_active ?? 0,
        staffActive: summary?.staff_active ?? 0,
        productsActive: summary?.products_active ?? 0,
        upcomingMatches: summary?.upcoming_matches ?? 0,
      },
      registrations: registrationRows.map((row) => ({
        id: row.id,
        category: row.category,
        teamName: row.team_name,
        captainName: row.captain_name,
        phone: row.phone,
        email: row.email,
        commune: row.commune,
        playerCount: row.player_count,
        source: row.source,
        notes: row.notes,
        status: row.status,
        paymentStatus: row.payment_status,
        registrationFeeCfa: row.registration_fee_cfa,
        amountPaidCfa: row.amount_paid_cfa,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      teams: teamRows.map((row) => ({
        id: row.id,
        registrationId: row.registration_id,
        name: row.name,
        category: row.category,
        city: row.city,
        logoUrl: row.logo_url,
        status: row.status,
        playerCount: row.player_count,
        createdAt: row.created_at,
      })),
      staff: staffRows.map((row) => ({
        id: row.id,
        fullName: row.full_name,
        role: row.role,
        phone: row.phone,
        email: row.email,
        photoUrl: row.photo_url,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      products: productRows.map((row) => ({
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
      })),
      matches: matchRows.map((row) => ({
        id: row.id,
        status: row.status,
        quarter: row.quarter,
        clockSeconds: row.clock_seconds,
        homeTeamId: row.home_team_id,
        awayTeamId: row.away_team_id,
        venue: row.venue,
        scheduledAt: row.scheduled_at,
        ticketPrice: row.ticket_price,
        tags: row.tags ?? [],
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load admin operations",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
