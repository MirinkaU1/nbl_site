"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  AlertTriangle,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MATCHES } from "@/lib/nbl-data";
import type {
  GameEvent,
  LiveMatchSnapshotResponse,
  LivePlayerStatSnapshot,
  Match,
  PlayerMatchStat,
} from "@/lib/nbl-types";
import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";

const TABS = ["RÉSUMÉ", "COMPOSITIONS"] as const;
type DetailTab = (typeof TABS)[number];

const PERIOD_LABELS = {
  H1: "1RE MI-TEMPS",
  H2: "2E MI-TEMPS",
} as const;

function mergePlayers(
  players: PlayerMatchStat[],
  snapshot: LivePlayerStatSnapshot[],
  side: "home" | "away",
) {
  const byId = new Map(
    snapshot
      .filter((row) => row.teamSide === side)
      .map((row) => [row.playerId, row]),
  );

  return players.map((player) => {
    const fromDb = byId.get(player.player.id);
    if (!fromDb) {
      return player;
    }

    return {
      ...player,
      points: fromDb.points,
      fouls: fromDb.fouls,
    };
  });
}

// ─── Score Header ─────────────────────────────────────────────────────────────

function ScoreHeader({
  match,
  isConnected,
}: {
  match: Match;
  isConnected: boolean;
}) {
  const { homeState, awayState, status, quarter, clockSeconds } = match;

  const mins = Math.floor(clockSeconds / 60);
  const secs = clockSeconds % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const isLive = status === "live" || status === "timeout";

  return (
    <div className="bg-nbl-surface border-b border-nbl-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center justify-center gap-3 mb-5">
          {status === "live" ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-nbl-orange text-nbl-bg text-xs font-black tracking-widest uppercase">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-nbl-bg" />
              EN DIRECT
            </span>
          ) : status === "timeout" ? (
            <span className="px-3 py-1 rounded-full bg-nbl-orange-muted border border-nbl-orange/40 text-nbl-orange text-xs font-black tracking-widest uppercase">
              EN PAUSE
            </span>
          ) : status === "upcoming" ? (
            <span className="px-3 py-1 rounded-full bg-nbl-surface-raised border border-nbl-border text-nbl-gray text-xs font-black tracking-widest uppercase">
              À VENIR
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-nbl-surface-raised border border-nbl-border text-nbl-gray text-xs font-black tracking-widest uppercase">
              TERMINÉ
            </span>
          )}
          {isLive && (
            <div className="flex items-center gap-1.5 text-xs text-nbl-gray font-semibold">
              <Clock size={12} />
              <span className="font-black text-nbl-white">
                {PERIOD_LABELS[quarter]}
              </span>
              <span>{timeStr}</span>
            </div>
          )}
          {!isLive && (
            <div className="flex items-center gap-1 text-xs text-nbl-gray">
              <MapPin size={11} className="text-nbl-orange" />
              <span>{match.venue}</span>
            </div>
          )}
          <span
            className={cn(
              "px-2 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase",
              isConnected
                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                : "bg-amber-500/15 text-amber-400 border border-amber-500/30",
            )}
          >
            {isConnected ? "SYNC" : "FALLBACK"}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 lg:gap-12">
          <div className="flex flex-col items-center gap-2 flex-1 max-w-35">
            <div className="w-14 h-14 rounded-full bg-nbl-surface-raised border-2 border-nbl-border flex items-center justify-center text-sm font-black text-nbl-white">
              {homeState.team.code}
            </div>
            <p className="text-xs font-black tracking-wide text-nbl-white text-center">
              {homeState.team.name}
            </p>
            <p className="text-xs text-nbl-gray">{homeState.team.city}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3 lg:gap-5">
              <span className="font-barlow text-6xl lg:text-8xl font-black text-nbl-white score-display leading-none">
                {homeState.score}
              </span>
              <span className="text-nbl-orange font-black text-3xl lg:text-4xl">
                —
              </span>
              <span className="font-barlow text-6xl lg:text-8xl font-black text-nbl-white score-display leading-none">
                {awayState.score}
              </span>
            </div>
            {isLive && (
              <div className="w-32 h-1 rounded-full bg-nbl-surface-raised overflow-hidden mt-2">
                <div
                  className="h-full bg-nbl-orange rounded-full transition-all duration-500"
                  style={{ width: match.possession === "home" ? "60%" : "40%" }}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 flex-1 max-w-35">
            <div className="w-14 h-14 rounded-full bg-nbl-surface-raised border-2 border-nbl-border flex items-center justify-center text-sm font-black text-nbl-white">
              {awayState.team.code}
            </div>
            <p className="text-xs font-black tracking-wide text-nbl-white text-center">
              {awayState.team.name}
            </p>
            <p className="text-xs text-nbl-gray">{awayState.team.city}</p>
          </div>
        </div>

        {match.tags.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {match.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg border border-nbl-border text-nbl-gray text-[10px] font-black tracking-widest uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Résumé tab — event timeline ──────────────────────────────────────────────

const EVENT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  pts2: {
    label: "2 pts",
    icon: <Trophy size={13} className="text-nbl-orange" />,
  },
  pts3: {
    label: "3 pts",
    icon: <Trophy size={13} className="text-nbl-orange" />,
  },
  ft: {
    label: "LF +1",
    icon: <Trophy size={13} className="text-nbl-orange" />,
  },
  foul: {
    label: "Faute",
    icon: <AlertTriangle size={13} className="text-red-500" />,
  },
  timeout: {
    label: "Temps mort",
    icon: <Clock size={13} className="text-nbl-gray" />,
  },
};

function EventTimeline({ events }: { events: GameEvent[] }) {
  const periods = ["H1", "H2"] as const;
  const grouped = periods.reduce<Record<string, GameEvent[]>>((acc, period) => {
    const periodEvents = events.filter((event) => event.quarter === period);
    if (periodEvents.length) acc[period] = [...periodEvents].reverse();
    return acc;
  }, {});

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-nbl-gray">
        <Users size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-semibold">Aucun événement pour ce match.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([period, periodEvents]) => (
        <div key={period}>
          <p className="text-[10px] font-black tracking-widest uppercase text-nbl-orange mb-3">
            {PERIOD_LABELS[period as keyof typeof PERIOD_LABELS]}
          </p>
          <div className="flex flex-col gap-2">
            {periodEvents.map((ev) => {
              const meta = EVENT_LABELS[ev.type] ?? {
                label: ev.type,
                icon: null,
              };
              const isHome = ev.team === "home";
              return (
                <div
                  key={ev.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl bg-nbl-surface border border-nbl-border",
                    isHome ? "flex-row" : "flex-row-reverse",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full shrink-0",
                      ev.type === "foul"
                        ? "bg-red-500/15"
                        : "bg-nbl-orange-muted",
                    )}
                  >
                    {meta.icon}
                  </div>
                  <div
                    className={cn("flex-1 min-w-0", !isHome && "text-right")}
                  >
                    <p className="text-xs font-black text-nbl-white">
                      {ev.playerName}
                    </p>
                    <p className="text-[10px] text-nbl-gray font-semibold">
                      {meta.label}
                    </p>
                  </div>
                  <div className="shrink-0 text-center">
                    <p className="text-sm font-black text-nbl-white score-display">
                      {ev.homeScore}
                      <span className="text-nbl-gray mx-1 font-normal">–</span>
                      {ev.awayScore}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Compositions tab — roster with pts/fouls ─────────────────────────────────

function PlayerRow({
  pms,
  highlight,
}: {
  pms: PlayerMatchStat;
  highlight?: "pts" | "foul" | null;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
        pms.fouls >= 4
          ? "bg-red-500/8 border border-red-500/20"
          : "bg-nbl-surface-raised border border-transparent",
      )}
    >
      <span className="w-7 text-center text-xs font-black text-nbl-gray shrink-0">
        #{pms.player.number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-nbl-white truncate">
          {pms.player.firstName[0]}. {pms.player.lastName}
        </p>
        <p className="text-[10px] text-nbl-gray">{pms.player.position}</p>
      </div>
      <div
        className={cn(
          "flex flex-col items-center w-10 shrink-0",
          highlight === "pts" && "animate-pulse",
        )}
      >
        <span className="font-barlow text-lg font-black text-nbl-white score-display leading-none">
          {pms.points}
        </span>
        <span className="text-[9px] text-nbl-gray font-bold uppercase tracking-wider">
          PTS
        </span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "w-2 h-2 rounded-full border transition-colors",
              i < pms.fouls
                ? pms.fouls >= 4
                  ? "bg-red-500 border-red-500"
                  : "bg-nbl-orange border-nbl-orange"
                : "bg-transparent border-nbl-gray/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function RosterPanel({
  label,
  players,
  align,
}: {
  label: string;
  players: PlayerMatchStat[];
  align: "left" | "right";
}) {
  return (
    <div
      className={cn("flex flex-col gap-2", align === "right" && "items-end")}
    >
      <p className="text-[10px] font-black tracking-widest uppercase text-nbl-orange mb-1 px-1">
        {label}
      </p>
      {players.length === 0 ? (
        <p className="text-xs text-nbl-gray px-1">Aucun joueur enregistré.</p>
      ) : (
        players.map((p) => <PlayerRow key={p.player.id} pms={p} />)
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const baseMatch = MATCHES[id] ?? MATCHES["match-1"];
  const [activeTab, setActiveTab] = useState<DetailTab>("RÉSUMÉ");
  const [match, setMatch] = useState<Match>(baseMatch);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadMatch = async () => {
      try {
        const response = await fetch(`/api/live/matches/${id}`, {
          cache: "no-store",
        });
        const data = (await response
          .json()
          .catch(() => null)) as LiveMatchSnapshotResponse | null;

        if (!response.ok || !data || !data.ok) {
          if (!cancelled) {
            setIsConnected(false);
          }
          return;
        }

        if (!cancelled) {
          setMatch((current) => {
            const source = MATCHES[id] ?? current;

            return {
              ...source,
              id: data.snapshot.matchId,
              status: data.snapshot.status,
              quarter: data.snapshot.quarter,
              clockSeconds: data.snapshot.clockSeconds,
              venue: data.match?.venue ?? source.venue,
              scheduledAt: data.match?.scheduledAt ?? source.scheduledAt,
              tags: data.match?.tags ?? source.tags,
              ticketPrice: data.match?.ticketPrice ?? source.ticketPrice,
              homeState: {
                ...source.homeState,
                score: data.snapshot.score.home,
                fouls: data.snapshot.fouls.home,
                onCourt: mergePlayers(
                  source.homeState.onCourt,
                  data.playerStats,
                  "home",
                ),
              },
              awayState: {
                ...source.awayState,
                score: data.snapshot.score.away,
                fouls: data.snapshot.fouls.away,
                onCourt: mergePlayers(
                  source.awayState.onCourt,
                  data.playerStats,
                  "away",
                ),
              },
              events:
                data.events && data.events.length > 0
                  ? data.events
                  : source.events,
            };
          });
          setIsConnected(true);
        }
      } catch {
        if (!cancelled) {
          setIsConnected(false);
        }
      }
    };

    void loadMatch();

    const timer = window.setInterval(() => {
      void loadMatch();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      <div className="sticky top-16 z-30">
        <ScoreHeader match={match} isConnected={isConnected} />

        <div className="bg-nbl-bg border-b border-nbl-border">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center gap-1 py-2">
            <Link
              href="/matches"
              className="mr-3 text-nbl-gray hover:text-nbl-white transition-colors p-1"
              aria-label="Retour aux matchs"
            >
              <ArrowLeft size={18} />
            </Link>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all",
                  activeTab === tab
                    ? "bg-nbl-surface-raised text-nbl-white border border-nbl-orange/40"
                    : "text-nbl-gray hover:text-nbl-white",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-12 w-full">
        {activeTab === "RÉSUMÉ" && <EventTimeline events={match.events} />}

        {activeTab === "COMPOSITIONS" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RosterPanel
              label={match.homeState.team.name}
              players={match.homeState.onCourt}
              align="left"
            />
            <RosterPanel
              label={match.awayState.team.name}
              players={match.awayState.onCourt}
              align="left"
            />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
