"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays, Play, Clock, Bell, Cast, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { BottomNav } from "@/components/nbl/bottom-nav"
import { SiteHeader } from "@/components/nbl/site-header"
import { SiteFooter } from "@/components/nbl/site-footer"

const tabs = ["EN DIRECT", "À VENIR", "RÉSULTATS"] as const
type Tab = (typeof tabs)[number]

const liveMatches = [
  {
    id: 1,
    status: "live",
    quarter: "Q4",
    time: "02:15",
    homeTeam: { name: "BLKTOP", city: "ABIDJAN", code: "BT", score: 88 },
    awayTeam: { name: "CONCRETE", city: "DAKAR", code: "CN", score: 84 },
    tags: ["FINALS", "MVP: TRAORÉ (25PTS)"],
    possession: "home",
    homePoss: 60,
  },
  {
    id: 2,
    status: "timeout",
    quarter: "Q2",
    time: "08:00",
    homeTeam: { name: "DUNK SQUAD", city: "", code: "DS", score: 45 },
    awayTeam: { name: "RIM ROCKERS", city: "", code: "RR", score: 30 },
    tags: [],
    ticketPrice: "1 500 FCFA",
    possession: "home",
    homePoss: 70,
  },
]

const upcomingMatches = [
  { id: 3, date: "18 MAR", homeTeam: "VIPERS", awayTeam: "HOOP KINGS", venue: "Stade Municipal", time: "19:30" },
  { id: 4, date: "18 MAR", homeTeam: "STREET SOUL", awayTeam: "BALLERS", venue: "Stade Municipal", time: "21:00" },
  { id: 5, date: "19 MAR", homeTeam: "PHOENIX", awayTeam: "TIGERS", venue: "Treichville Arena", time: "18:30" },
  { id: 6, date: "19 MAR", homeTeam: "BLKTOP", awayTeam: "VIPERS", venue: "Cocody Court", time: "20:00" },
]

const results = [
  { id: 7, date: "17 MAR", homeTeam: { name: "ABIDJAN HEAT", score: 86 }, awayTeam: { name: "TREICHVILLE", score: 82 }, winner: "home" },
  { id: 8, date: "17 MAR", homeTeam: { name: "PHOENIX", score: 72 }, awayTeam: { name: "BALLERS", score: 79 }, winner: "away" },
  { id: 9, date: "16 MAR", homeTeam: { name: "DUNK SQUAD", score: 91 }, awayTeam: { name: "VIPERS", score: 85 }, winner: "home" },
]

function TeamCircle({ code }: { code: string }) {
  return (
    <div className="w-12 h-12 rounded-full bg-nbl-surface-raised border border-nbl-border flex items-center justify-center text-xs font-black text-nbl-white">
      {code}
    </div>
  )
}

function LiveMatchCard({ match }: { match: (typeof liveMatches)[0] }) {
  const isTimeout = match.status === "timeout"
  return (
    <div className="rounded-2xl bg-nbl-surface border border-nbl-border overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-wrap gap-2">
        <span
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase",
            isTimeout
              ? "bg-nbl-orange-muted text-nbl-orange border border-nbl-orange/30"
              : "bg-nbl-orange text-nbl-bg"
          )}
        >
          {isTimeout ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-nbl-orange live-dot" />TEMPS MORT</>
          ) : (
            <><Play size={10} fill="currentColor" />LIVE STREAM</>
          )}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-nbl-gray font-semibold">
          <Clock size={12} />
          <span>{match.quarter} - {match.time}</span>
        </div>
        {match.ticketPrice && (
          <span className="px-2 py-1 rounded-lg bg-nbl-orange-muted text-nbl-orange text-xs font-bold border border-nbl-orange/30">
            Entrée: {match.ticketPrice}
          </span>
        )}
      </div>

      <div className="px-4 py-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <TeamCircle code={match.homeTeam.code} />
            <div className="text-center">
              <p className="text-xs font-black text-nbl-white tracking-wide">{match.homeTeam.name}</p>
              {match.homeTeam.city && <p className="text-[10px] text-nbl-gray">{match.homeTeam.city}</p>}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black text-nbl-white score-display">{match.homeTeam.score}</span>
              <span className="text-nbl-orange font-black text-2xl">—</span>
              <span className="text-5xl font-black text-nbl-white score-display">{match.awayTeam.score}</span>
            </div>
            <div className="w-full h-1 rounded-full bg-nbl-surface-raised overflow-hidden mt-1">
              <div className="h-full bg-nbl-orange rounded-full" style={{ width: `${match.homePoss}%` }} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <TeamCircle code={match.awayTeam.code} />
            <div className="text-center">
              <p className="text-xs font-black text-nbl-white tracking-wide">{match.awayTeam.name}</p>
              {match.awayTeam.city && <p className="text-[10px] text-nbl-gray">{match.awayTeam.city}</p>}
            </div>
          </div>
        </div>
      </div>

      {match.tags.length > 0 && (
        <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
          {match.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 rounded-lg border border-nbl-border text-nbl-gray text-[10px] font-bold tracking-widest uppercase">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="px-4 pb-4">
        <Link
          href={`/matches/${match.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-nbl-orange text-nbl-bg font-black text-xs tracking-widest uppercase shadow-[0_4px_14px_rgba(217,104,19,0.35)] active:scale-95 hover:bg-nbl-orange-dark transition-colors"
        >
          <Cast size={14} />
          REGARDER
        </Link>
      </div>
    </div>
  )
}

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("EN DIRECT")

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      {/* Page header */}
      <div className="border-b border-nbl-border bg-nbl-bg/95 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 flex items-center justify-between py-4 gap-4">
          <h1 className="font-black text-base tracking-widest uppercase text-nbl-white">Match Center</h1>
          <button aria-label="Calendrier" className="text-nbl-white p-1 lg:hidden">
            <CalendarDays size={22} />
          </button>

          {/* Desktop tabs inline in sub-header */}
          <div className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => (
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

        {/* Mobile tabs */}
        <div className="lg:hidden flex px-4 gap-1 pb-3 max-w-screen-xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all",
                activeTab === tab
                  ? "bg-nbl-surface-raised text-nbl-white border border-nbl-orange/40"
                  : "text-nbl-gray"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-screen-xl mx-auto px-4 lg:px-8 py-6 pb-28 lg:pb-12 w-full">
        {activeTab === "EN DIRECT" && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="live-dot w-2 h-2 rounded-full bg-nbl-orange" />
              <span className="text-nbl-orange text-xs font-black tracking-widest uppercase">Matchs en cours</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {liveMatches.map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
            </div>
          </>
        )}

        {activeTab === "À VENIR" && (
          <>
            <p className="text-nbl-orange text-xs font-black tracking-widest uppercase mb-4">Prochains matchs</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {upcomingMatches.map((match) => (
                <div key={match.id} className="flex items-center gap-4 p-4 rounded-2xl bg-nbl-surface border border-nbl-border">
                  <div className="w-12 text-center shrink-0">
                    <p className="text-lg font-black text-nbl-white leading-none">{match.date.split(" ")[0]}</p>
                    <p className="text-[10px] font-bold text-nbl-gray tracking-widest">{match.date.split(" ")[1]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-nbl-white">
                      <span>{match.homeTeam}</span>
                      <span className="text-nbl-gray font-normal mx-1.5">vs</span>
                      <span>{match.awayTeam}</span>
                    </p>
                    <p className="text-xs text-nbl-gray mt-0.5 flex items-center gap-1">
                      <MapPin size={10} />
                      {match.venue} · {match.time}
                    </p>
                  </div>
                  <button aria-label="Activer notification" className="text-nbl-gray p-1 hover:text-nbl-orange transition-colors">
                    <Bell size={18} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "RÉSULTATS" && (
          <>
            <p className="text-nbl-orange text-xs font-black tracking-widest uppercase mb-4">Résultats récents</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {results.map((match) => (
                <div key={match.id} className="p-4 rounded-2xl bg-nbl-surface border border-nbl-border">
                  <p className="text-[10px] text-nbl-gray font-bold tracking-widest uppercase mb-3">{match.date}</p>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-black", match.winner === "home" ? "text-nbl-white" : "text-nbl-gray")}>
                      {match.homeTeam.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-2xl font-black score-display", match.winner === "home" ? "text-nbl-orange" : "text-nbl-gray")}>
                        {match.homeTeam.score}
                      </span>
                      <span className="text-nbl-gray text-sm">—</span>
                      <span className={cn("text-2xl font-black score-display", match.winner === "away" ? "text-nbl-orange" : "text-nbl-gray")}>
                        {match.awayTeam.score}
                      </span>
                    </div>
                    <span className={cn("text-sm font-black", match.winner === "away" ? "text-nbl-white" : "text-nbl-gray")}>
                      {match.awayTeam.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <SiteFooter />
      <BottomNav />
    </div>
  )
}
