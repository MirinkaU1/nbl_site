"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Play, Clock, Bell, Cast, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";
import { useLiveOverview } from "@/hooks/use-live-overview";
import type { LivePublicMatch } from "@/lib/nbl-types";

const tabs = ["EN DIRECT", "À VENIR", "RÉSULTATS"] as const;
type Tab = (typeof tabs)[number];

function formatClock(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatPeriod(period: LivePublicMatch["quarter"]) {
  return period === "H1" ? "1RE MT" : "2E MT";
}

function formatDateParts(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return { day: "--", month: "---", time: "--:--" };
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = date
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { day, month, time };
}

function TeamCircle({ code }: { code: string }) {
  return (
    <div className="w-12 h-12 rounded-full bg-nbl-surface-raised border border-nbl-border flex items-center justify-center text-xs font-black text-nbl-white">
      {code}
    </div>
  );
}

function LiveMatchCard({ match }: { match: LivePublicMatch }) {
  const isTimeout = match.status === "timeout";

  return (
    <div className="rounded-2xl bg-nbl-surface border border-nbl-border overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-wrap gap-2">
        <span
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase",
            isTimeout
              ? "bg-nbl-orange-muted text-nbl-orange border border-nbl-orange/30"
              : "bg-nbl-orange text-nbl-bg",
          )}
        >
          {isTimeout ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-nbl-orange live-dot" />
              TEMPS MORT
            </>
          ) : (
            <>
              <Play size={10} fill="currentColor" />
              LIVE STREAM
            </>
          )}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-nbl-gray font-semibold">
          <Clock size={12} />
          <span>
            {formatPeriod(match.quarter)} - {formatClock(match.clockSeconds)}
          </span>
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
              <p className="text-xs font-black text-nbl-white tracking-wide">
                {match.homeTeam.name}
              </p>
              {match.homeTeam.city && (
                <p className="text-[10px] text-nbl-gray">
                  {match.homeTeam.city}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <span className="font-kianda tracking-tight text-5xl font-black text-nbl-white score-display">
                {match.homeTeam.score}
              </span>
              <span className="text-nbl-orange font-black text-2xl">—</span>
              <span className="font-kianda tracking-tight text-5xl font-black text-nbl-white score-display">
                {match.awayTeam.score}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <TeamCircle code={match.awayTeam.code} />
            <div className="text-center">
              <p className="text-xs font-black text-nbl-white tracking-wide">
                {match.awayTeam.name}
              </p>
              {match.awayTeam.city && (
                <p className="text-[10px] text-nbl-gray">
                  {match.awayTeam.city}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {match.tags.length > 0 && (
        <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
          {match.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-lg border border-nbl-border text-nbl-gray text-[10px] font-bold tracking-widest uppercase"
            >
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
  );
}

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("EN DIRECT");
  const { matches, isConnected } = useLiveOverview(3000);

  const liveMatches = useMemo(
    () =>
      matches.filter(
        (match) => match.status === "live" || match.status === "timeout",
      ),
    [matches],
  );

  const upcomingMatches = useMemo(
    () => matches.filter((match) => match.status === "upcoming"),
    [matches],
  );

  const results = useMemo(
    () => matches.filter((match) => match.status === "finished"),
    [matches],
  );

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      <div className="border-b border-nbl-border bg-nbl-bg/95 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-2">
            <h1 className="font-kianda tracking-tight text-4xl lg:text-5xl text-nbl-white leading-none">
              match center
            </h1>
            <span
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase",
                isConnected
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30",
              )}
            >
              {isConnected ? "LIVE" : "FALLBACK"}
            </span>
          </div>
          <button
            aria-label="Calendrier"
            className="text-nbl-white p-1 lg:hidden"
          >
            <CalendarDays size={22} />
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => (
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

        <div className="lg:hidden flex px-4 gap-1 pb-3 max-w-7xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all",
                activeTab === tab
                  ? "bg-nbl-surface-raised text-nbl-white border border-nbl-orange/40"
                  : "text-nbl-gray",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-12 w-full">
        {activeTab === "EN DIRECT" && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="live-dot w-2 h-2 rounded-full bg-nbl-orange" />
              <span className="text-nbl-orange text-xs font-black tracking-widest uppercase">
                Matchs en cours
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {liveMatches.map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
              {liveMatches.length === 0 && (
                <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-6 text-center text-nbl-gray text-sm font-semibold">
                  Aucun match en direct.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "À VENIR" && (
          <>
            <p className="text-nbl-orange text-xs font-black tracking-widest uppercase mb-4">
              Prochains matchs
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {upcomingMatches.map((match) => {
                const date = formatDateParts(match.scheduledAt);
                return (
                  <div
                    key={match.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-nbl-surface border border-nbl-border"
                  >
                    <div className="w-12 text-center shrink-0">
                      <p className="text-lg font-black text-nbl-white leading-none">
                        {date.day}
                      </p>
                      <p className="text-[10px] font-bold text-nbl-gray tracking-widest">
                        {date.month}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-nbl-white">
                        <span>{match.homeTeam.name}</span>
                        <span className="text-nbl-gray font-normal mx-1.5">
                          vs
                        </span>
                        <span>{match.awayTeam.name}</span>
                      </p>
                      <p className="text-xs text-nbl-gray mt-0.5 flex items-center gap-1">
                        <MapPin size={10} />
                        {match.venue} · {date.time}
                      </p>
                    </div>
                    <button
                      aria-label="Activer notification"
                      className="text-nbl-gray p-1 hover:text-nbl-orange transition-colors"
                    >
                      <Bell size={18} />
                    </button>
                  </div>
                );
              })}
              {upcomingMatches.length === 0 && (
                <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-6 text-center text-nbl-gray text-sm font-semibold">
                  Aucun match à venir.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "RÉSULTATS" && (
          <>
            <p className="text-nbl-orange text-xs font-black tracking-widest uppercase mb-4">
              Résultats récents
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {results.map((match) => {
                const winner =
                  match.homeTeam.score === match.awayTeam.score
                    ? "draw"
                    : match.homeTeam.score > match.awayTeam.score
                      ? "home"
                      : "away";

                const date = formatDateParts(match.scheduledAt);

                return (
                  <div
                    key={match.id}
                    className="p-4 rounded-2xl bg-nbl-surface border border-nbl-border"
                  >
                    <p className="text-[10px] text-nbl-gray font-bold tracking-widest uppercase mb-3">
                      {date.day} {date.month}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-sm font-black",
                          winner === "home"
                            ? "text-nbl-white"
                            : "text-nbl-gray",
                        )}
                      >
                        {match.homeTeam.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-kianda tracking-tight text-2xl font-black score-display",
                            winner === "home"
                              ? "text-nbl-orange"
                              : "text-nbl-gray",
                          )}
                        >
                          {match.homeTeam.score}
                        </span>
                        <span className="text-nbl-gray text-sm">—</span>
                        <span
                          className={cn(
                            "font-kianda tracking-tight text-2xl font-black score-display",
                            winner === "away"
                              ? "text-nbl-orange"
                              : "text-nbl-gray",
                          )}
                        >
                          {match.awayTeam.score}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-black",
                          winner === "away"
                            ? "text-nbl-white"
                            : "text-nbl-gray",
                        )}
                      >
                        {match.awayTeam.name}
                      </span>
                    </div>
                  </div>
                );
              })}
              {results.length === 0 && (
                <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-6 text-center text-nbl-gray text-sm font-semibold lg:col-span-3">
                  Aucun résultat disponible pour le moment.
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
