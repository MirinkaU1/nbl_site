"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, MapPin, AlertTriangle, Trophy, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { MATCHES } from "@/lib/nbl-data"
import type { PlayerMatchStat, GameEvent } from "@/lib/nbl-types"
import { SiteHeader } from "@/components/nbl/site-header"
import { SiteFooter } from "@/components/nbl/site-footer"
import { BottomNav } from "@/components/nbl/bottom-nav"

const TABS = ["RÉSUMÉ", "COMPOSITIONS"] as const
type DetailTab = (typeof TABS)[number]

// ─── Score Header ─────────────────────────────────────────────────────────────

function ScoreHeader({ matchId }: { matchId: string }) {
  const match = MATCHES[matchId] ?? MATCHES["match-1"]
  const { homeState, awayState, status, quarter, clockSeconds } = match

  const mins = Math.floor(clockSeconds / 60)
  const secs = clockSeconds % 60
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  const isLive = status === "live" || status === "timeout"

  return (
    <div className="bg-nbl-surface border-b border-nbl-border">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        {/* Status row */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {isLive ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-nbl-orange text-nbl-bg text-xs font-black tracking-widest uppercase">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-nbl-bg" />
              EN DIRECT
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
              <span className="font-black text-nbl-white">{quarter}</span>
              <span>{timeStr}</span>
            </div>
          )}
          {!isLive && (
            <div className="flex items-center gap-1 text-xs text-nbl-gray">
              <MapPin size={11} className="text-nbl-orange" />
              <span>{match.venue}</span>
            </div>
          )}
        </div>

        {/* Score block */}
        <div className="flex items-center justify-center gap-4 lg:gap-12">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
            <div className="w-14 h-14 rounded-full bg-nbl-surface-raised border-2 border-nbl-border flex items-center justify-center text-sm font-black text-nbl-white">
              {homeState.team.code}
            </div>
            <p className="text-xs font-black tracking-wide text-nbl-white text-center">{homeState.team.name}</p>
            <p className="text-xs text-nbl-gray">{homeState.team.city}</p>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3 lg:gap-5">
              <span className="font-barlow text-6xl lg:text-8xl font-black text-nbl-white score-display leading-none">
                {homeState.score}
              </span>
              <span className="text-nbl-orange font-black text-3xl lg:text-4xl">—</span>
              <span className="font-barlow text-6xl lg:text-8xl font-black text-nbl-white score-display leading-none">
                {awayState.score}
              </span>
            </div>
            {/* Possession bar */}
            {isLive && (
              <div className="w-32 h-1 rounded-full bg-nbl-surface-raised overflow-hidden mt-2">
                <div
                  className="h-full bg-nbl-orange rounded-full transition-all duration-500"
                  style={{ width: match.possession === "home" ? "60%" : "40%" }}
                />
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
            <div className="w-14 h-14 rounded-full bg-nbl-surface-raised border-2 border-nbl-border flex items-center justify-center text-sm font-black text-nbl-white">
              {awayState.team.code}
            </div>
            <p className="text-xs font-black tracking-wide text-nbl-white text-center">{awayState.team.name}</p>
            <p className="text-xs text-nbl-gray">{awayState.team.city}</p>
          </div>
        </div>

        {/* Tags */}
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
  )
}

// ─── Résumé tab — event timeline ──────────────────────────────────────────────

const EVENT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  pts2: { label: "2 pts", icon: <Trophy size={13} className="text-nbl-orange" /> },
  pts3: { label: "3 pts", icon: <Trophy size={13} className="text-nbl-orange" /> },
  ft: { label: "LF +1", icon: <Trophy size={13} className="text-nbl-orange" /> },
  foul: { label: "Faute", icon: <AlertTriangle size={13} className="text-red-500" /> },
  timeout: { label: "Temps mort", icon: <Clock size={13} className="text-nbl-gray" /> },
}

function EventTimeline({ events }: { events: GameEvent[] }) {
  const quarters = ["Q1", "Q2", "Q3", "Q4", "OT"] as const
  const grouped = quarters.reduce<Record<string, GameEvent[]>>((acc, q) => {
    const qEvents = events.filter((e) => e.quarter === q)
    if (qEvents.length) acc[q] = [...qEvents].reverse()
    return acc
  }, {})

  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-nbl-gray">
        <Users size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-semibold">Aucun événement pour ce match.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([quarter, qEvents]) => (
        <div key={quarter}>
          <p className="text-[10px] font-black tracking-widest uppercase text-nbl-orange mb-3">{quarter}</p>
          <div className="flex flex-col gap-2">
            {qEvents.map((ev) => {
              const meta = EVENT_LABELS[ev.type] ?? { label: ev.type, icon: null }
              const isHome = ev.team === "home"
              return (
                <div
                  key={ev.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl bg-nbl-surface border border-nbl-border",
                    isHome ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full shrink-0",
                      ev.type === "foul" ? "bg-red-500/15" : "bg-nbl-orange-muted"
                    )}
                  >
                    {meta.icon}
                  </div>
                  <div className={cn("flex-1 min-w-0", !isHome && "text-right")}>
                    <p className="text-xs font-black text-nbl-white">{ev.playerName}</p>
                    <p className="text-[10px] text-nbl-gray font-semibold">{meta.label}</p>
                  </div>
                  <div className="shrink-0 text-center">
                    <p className="text-sm font-black text-nbl-white score-display">
                      {ev.homeScore}
                      <span className="text-nbl-gray mx-1 font-normal">–</span>
                      {ev.awayScore}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Compositions tab — roster with pts/fouls ─────────────────────────────────

function PlayerRow({ pms, highlight }: { pms: PlayerMatchStat; highlight?: "pts" | "foul" | null }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
        pms.fouls >= 4
          ? "bg-red-500/8 border border-red-500/20"
          : "bg-nbl-surface-raised border border-transparent"
      )}
    >
      {/* Number */}
      <span className="w-7 text-center text-xs font-black text-nbl-gray shrink-0">
        #{pms.player.number}
      </span>
      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-nbl-white truncate">
          {pms.player.firstName[0]}. {pms.player.lastName}
        </p>
        <p className="text-[10px] text-nbl-gray">{pms.player.position}</p>
      </div>
      {/* Points */}
      <div
        className={cn(
          "flex flex-col items-center w-10 shrink-0",
          highlight === "pts" && "animate-pulse"
        )}
      >
        <span className="font-barlow text-lg font-black text-nbl-white score-display leading-none">{pms.points}</span>
        <span className="text-[9px] text-nbl-gray font-bold uppercase tracking-wider">PTS</span>
      </div>
      {/* Fouls */}
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
                : "bg-transparent border-nbl-gray/40"
            )}
          />
        ))}
      </div>
    </div>
  )
}

function RosterPanel({
  label,
  players,
  align,
}: {
  label: string
  players: PlayerMatchStat[]
  align: "left" | "right"
}) {
  return (
    <div className={cn("flex flex-col gap-2", align === "right" && "items-end")}>
      <p className="text-[10px] font-black tracking-widest uppercase text-nbl-orange mb-1 px-1">
        {label}
      </p>
      {players.length === 0 ? (
        <p className="text-xs text-nbl-gray px-1">Aucun joueur enregistré.</p>
      ) : (
        players.map((p) => <PlayerRow key={p.player.id} pms={p} />)
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("RÉSUMÉ")
  const match = MATCHES[params.id] ?? MATCHES["match-1"]

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      {/* Sticky match header */}
      <div className="sticky top-16 z-30">
        <ScoreHeader matchId={match.id} />

        {/* Tab bar */}
        <div className="bg-nbl-bg border-b border-nbl-border">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-8 flex items-center gap-1 py-2">
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
                    : "text-nbl-gray hover:text-nbl-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-screen-xl mx-auto px-4 lg:px-8 py-6 pb-28 lg:pb-12 w-full">
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
      <BottomNav />
    </div>
  )
}
