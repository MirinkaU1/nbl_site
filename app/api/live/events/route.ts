import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Sql } from "postgres";
import { getSqlClient } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVENT_VALUE_BY_TYPE = {
  pts2: 2,
  pts3: 3,
  ft: 1,
  foul: 0,
  timeout: 0,
  substitution: 0,
} as const;

const eventSchema = z.object({
  eventId: z.string().min(1).optional(),
  matchId: z.string().min(1),
  expectedVersion: z.number().int().nonnegative(),
  quarter: z.enum(["H1", "H2"]),
  clockSeconds: z.number().int().nonnegative(),
  eventType: z.enum(["pts2", "pts3", "ft", "foul", "timeout", "substitution"]),
  teamSide: z.enum(["home", "away"]),
  playerId: z.string().min(1),
  playerName: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});

type LockedMatchRow = {
  id: string;
  version: number;
};

type ExistingEventRow = {
  id: string;
  match_id: string;
};

type MatchSnapshotRow = {
  id: string;
  status: "live" | "upcoming" | "finished" | "timeout";
  quarter: "H1" | "H2";
  clock_seconds: number;
  version: number;
  updated_at: string;
  home_score: number;
  away_score: number;
  home_fouls: number;
  away_fouls: number;
};

class VersionConflictError extends Error {
  constructor(public readonly currentVersion: number) {
    super("Version conflict");
  }
}

class MatchNotFoundError extends Error {
  constructor() {
    super("Match not found");
  }
}

class IdempotencyKeyConflictError extends Error {
  constructor() {
    super("Idempotency key already used for another match");
  }
}

function isUniqueViolation(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as { code?: string };
  return err.code === "23505";
}

async function getSnapshot(sql: Sql, matchId: string) {
  const rows = await sql<MatchSnapshotRow[]>`
    select
      m.id,
      m.status,
      m.quarter,
      m.clock_seconds,
      m.version,
      m.updated_at::text as updated_at,
      s.home_score,
      s.away_score,
      s.home_fouls,
      s.away_fouls
    from nbl_matches m
    join nbl_match_state s on s.match_id = m.id
    where m.id = ${matchId}
    limit 1
  `;

  return rows[0] ?? null;
}

function toResponseSnapshot(snapshot: MatchSnapshotRow) {
  return {
    matchId: snapshot.id,
    status: snapshot.status,
    quarter: snapshot.quarter,
    clockSeconds: snapshot.clock_seconds,
    version: snapshot.version,
    updatedAt: snapshot.updated_at,
    score: {
      home: snapshot.home_score,
      away: snapshot.away_score,
    },
    fouls: {
      home: snapshot.home_fouls,
      away: snapshot.away_fouls,
    },
  };
}

async function applyEventMutation(
  tx: Sql,
  args: {
    matchId: string;
    teamSide: "home" | "away";
    eventType: keyof typeof EVENT_VALUE_BY_TYPE;
    playerId: string;
  },
) {
  const value = EVENT_VALUE_BY_TYPE[args.eventType];

  if (args.eventType === "foul") {
    if (args.teamSide === "home") {
      await tx`
        update nbl_match_state
        set home_fouls = home_fouls + 1,
            updated_at = now()
        where match_id = ${args.matchId}
      `;
    } else {
      await tx`
        update nbl_match_state
        set away_fouls = away_fouls + 1,
            updated_at = now()
        where match_id = ${args.matchId}
      `;
    }

    await tx`
      insert into nbl_player_match_stats (
        match_id,
        player_id,
        team_side,
        points,
        fouls
      )
      values (
        ${args.matchId},
        ${args.playerId},
        ${args.teamSide},
        0,
        1
      )
      on conflict (match_id, player_id)
      do update set
        team_side = excluded.team_side,
        fouls = nbl_player_match_stats.fouls + 1,
        updated_at = now()
    `;

    return;
  }

  if (value > 0) {
    if (args.teamSide === "home") {
      await tx`
        update nbl_match_state
        set home_score = home_score + ${value},
            updated_at = now()
        where match_id = ${args.matchId}
      `;
    } else {
      await tx`
        update nbl_match_state
        set away_score = away_score + ${value},
            updated_at = now()
        where match_id = ${args.matchId}
      `;
    }

    await tx`
      insert into nbl_player_match_stats (
        match_id,
        player_id,
        team_side,
        points,
        fouls
      )
      values (
        ${args.matchId},
        ${args.playerId},
        ${args.teamSide},
        ${value},
        0
      )
      on conflict (match_id, player_id)
      do update set
        team_side = excluded.team_side,
        points = nbl_player_match_stats.points + excluded.points,
        updated_at = now()
    `;
  }
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("x-idempotency-key");

  if (!idempotencyKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing x-idempotency-key header",
      },
      { status: 400 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(json);

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

  const sql = getSqlClient();
  const body = parsed.data;
  const eventValue = EVENT_VALUE_BY_TYPE[body.eventType];

  try {
    const result = await sql.begin(async (tx) => {
      const txSql = tx as unknown as Sql;

      const locked = await txSql<LockedMatchRow[]>`
        select id, version
        from nbl_matches
        where id = ${body.matchId}
        for update
      `;

      const lockedMatch = locked[0];
      if (!lockedMatch) {
        throw new MatchNotFoundError();
      }

      const existingByKey = await txSql<ExistingEventRow[]>`
        select id, match_id
        from nbl_match_events
        where idempotency_key = ${idempotencyKey}
        limit 1
      `;

      const existingEvent = existingByKey[0];
      if (existingEvent) {
        if (existingEvent.match_id !== body.matchId) {
          throw new IdempotencyKeyConflictError();
        }

        await txSql`
          insert into nbl_match_state (match_id)
          values (${body.matchId})
          on conflict (match_id) do nothing
        `;

        const snapshot = await getSnapshot(txSql, body.matchId);
        if (!snapshot) {
          throw new MatchNotFoundError();
        }

        return {
          duplicate: true,
          eventId: existingEvent.id,
          snapshot,
        };
      }

      if (lockedMatch.version !== body.expectedVersion) {
        throw new VersionConflictError(lockedMatch.version);
      }

      await txSql`
        insert into nbl_match_state (match_id)
        values (${body.matchId})
        on conflict (match_id) do nothing
      `;

      const eventId = body.eventId ?? randomUUID();
      const payload = body.payload ?? {};
      const payloadJson = JSON.stringify(payload);

      try {
        await txSql`
          insert into nbl_match_events (
            id,
            match_id,
            idempotency_key,
            expected_version,
            quarter,
            clock_seconds,
            event_type,
            team_side,
            value,
            player_id,
            player_name,
            payload
          ) values (
            ${eventId},
            ${body.matchId},
            ${idempotencyKey},
            ${body.expectedVersion},
            ${body.quarter},
            ${body.clockSeconds},
            ${body.eventType},
            ${body.teamSide},
            ${eventValue},
            ${body.playerId},
            ${body.playerName},
            ${payloadJson}::jsonb
          )
        `;
      } catch (error) {
        if (isUniqueViolation(error)) {
          const existingRows = await txSql<ExistingEventRow[]>`
            select id, match_id
            from nbl_match_events
            where idempotency_key = ${idempotencyKey}
            limit 1
          `;

          const existing = existingRows[0];

          if (existing && existing.match_id !== body.matchId) {
            throw new IdempotencyKeyConflictError();
          }

          const snapshot = await getSnapshot(txSql, body.matchId);
          if (!snapshot) {
            throw new MatchNotFoundError();
          }
          return {
            duplicate: true,
            eventId: existing?.id ?? eventId,
            snapshot,
          };
        }

        throw error;
      }

      await applyEventMutation(txSql, {
        matchId: body.matchId,
        teamSide: body.teamSide,
        eventType: body.eventType,
        playerId: body.playerId,
      });

      await txSql`
        update nbl_matches
        set version = version + 1,
            quarter = ${body.quarter},
            clock_seconds = ${body.clockSeconds},
            updated_at = now()
        where id = ${body.matchId}
      `;

      const snapshot = await getSnapshot(txSql, body.matchId);
      if (!snapshot) {
        throw new MatchNotFoundError();
      }

      await txSql`
        update nbl_match_events
        set home_score = ${snapshot.home_score},
            away_score = ${snapshot.away_score}
        where id = ${eventId}
      `;

      return {
        duplicate: false,
        eventId,
        snapshot,
      };
    });

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      eventId: result.eventId,
      snapshot: toResponseSnapshot(result.snapshot),
    });
  } catch (error) {
    if (error instanceof IdempotencyKeyConflictError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Idempotency key already used for another match",
        },
        { status: 409 },
      );
    }

    if (error instanceof MatchNotFoundError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Match not found",
        },
        { status: 404 },
      );
    }

    if (error instanceof VersionConflictError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Version conflict",
          currentVersion: error.currentVersion,
        },
        { status: 409 },
      );
    }

    console.error("Failed to process live event", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
