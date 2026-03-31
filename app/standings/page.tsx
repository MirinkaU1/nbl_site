"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { STANDINGS, TOP_SCORERS } from "@/lib/nbl-data";
import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";
import { BottomNav } from "@/components/nbl/bottom-nav";

const TABS = ["CLASSEMENT", "TOP SCORERS", "ALL-TIME"] as const;
type StandingsTab = (typeof TABS)[number];

// ─── Standings table ──────────────────────────────────────────────────────────

function StandingsTable() {
  return (
    <div className="rounded-2xl bg-nbl-surface border border-nbl-border overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[auto_1fr_repeat(6,_auto)] gap-x-4 px-4 py-3 border-b border-nbl-border">
        <span className="text-[10px] font-black tracking-widest text-nbl-gray uppercase w-6 text-center">
          #
        </span>
        <span className="text-[10px] font-black tracking-widest text-nbl-gray uppercase">
          ÉQUIPE
        </span>
        <span className="text-[10px] font-black tracking-widest text-nbl-gray uppercase w-8 text-center">
          J
        </span>
        <span className="text-[10px] font-black tracking-widest text-nbl-gray uppercase w-8 text-center">
          G
        </span>
        <span className="text-[10px] font-black tracking-widest text-nbl-gray uppercase w-8 text-center">
          P
        </span>
        <span className="text-[10px] font-black tracking-widest text-nbl-gray uppercase w-10 text-center hidden sm:block">
          +/-
        </span>
        <span className="text-[10px] font-black tracking-widest text-nbl-gray uppercase w-8 text-center hidden sm:block">
          PF
        </span>
        <span className="text-[10px] font-black tracking-widest text-nbl-orange uppercase w-8 text-center">
          PTS
        </span>
      </div>

      {STANDINGS.map((row, idx) => {
        const isTop4 = row.rank <= 4;
        const isFirst = row.rank === 1;
        return (
          <div
            key={row.team.id}
            className={cn(
              "grid grid-cols-[auto_1fr_repeat(6,_auto)] gap-x-4 px-4 py-3 items-center transition-colors hover:bg-nbl-surface-raised",
              idx !== STANDINGS.length - 1 && "border-b border-nbl-border",
              isFirst && "bg-nbl-orange/5",
            )}
          >
            {/* Rank */}
            <div className="w-6 flex items-center justify-center shrink-0">
              {isFirst ? (
                <Trophy size={14} className="text-nbl-orange" />
              ) : (
                <span
                  className={cn(
                    "text-sm font-black",
                    isTop4 ? "text-nbl-white" : "text-nbl-gray",
                  )}
                >
                  {row.rank}
                </span>
              )}
            </div>

            {/* Team */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-nbl-surface-raised border border-nbl-border flex items-center justify-center text-[10px] font-black text-nbl-white shrink-0">
                {row.team.code}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-black truncate",
                    isTop4 ? "text-nbl-white" : "text-nbl-gray",
                  )}
                >
                  {row.team.name}
                </p>
                <p className="text-[10px] text-nbl-gray hidden sm:block">
                  {row.team.city}
                </p>
              </div>
            </div>

            {/* Stats */}
            <span className="text-sm font-semibold text-nbl-gray text-center w-8">
              {row.played}
            </span>
            <span className="text-sm font-black text-nbl-white text-center w-8">
              {row.won}
            </span>
            <span className="text-sm font-semibold text-nbl-gray text-center w-8">
              {row.lost}
            </span>
            <span
              className={cn(
                "text-sm font-semibold text-center w-10 hidden sm:block",
                row.diff > 0
                  ? "text-green-400"
                  : row.diff < 0
                    ? "text-red-400"
                    : "text-nbl-gray",
              )}
            >
              {row.diff > 0 ? `+${row.diff}` : row.diff}
            </span>
            <span className="text-sm text-nbl-gray text-center w-8 hidden sm:block">
              {row.pointsFor}
            </span>
            <span className="text-sm font-black text-nbl-orange text-center w-8">
              {row.pts}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Top Scorers leaderboard ──────────────────────────────────────────────────

function TopScorersBoard({ allTime = false }: { allTime?: boolean }) {
  const data = allTime
    ? [...TOP_SCORERS].sort(
        (a, b) => b.player.careerPoints - a.player.careerPoints,
      )
    : TOP_SCORERS;

  return (
    <div className="flex flex-col gap-3">
      {data.map((ts, idx) => {
        const isFirst = idx === 0;
        return (
          <Link
            href={`/players/${ts.player.id}`}
            key={ts.player.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border transition-colors hover:border-nbl-orange/40",
              isFirst
                ? "bg-nbl-orange/10 border-nbl-orange/30"
                : "bg-nbl-surface border-nbl-border",
            )}
          >
            {/* Rank */}
            <div className="w-8 shrink-0 flex items-center justify-center">
              {isFirst ? (
                <Trophy size={18} className="text-nbl-orange" />
              ) : (
                <span className="text-base font-black text-nbl-gray">
                  {idx + 1}
                </span>
              )}
            </div>

            {/* Player info */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-black text-sm",
                  isFirst ? "text-nbl-orange" : "text-nbl-white",
                )}
              >
                {ts.player.firstName} {ts.player.lastName.toUpperCase()}
              </p>
              <p className="text-[10px] text-nbl-gray font-semibold uppercase tracking-wide">
                {ts.team.shortName} · {ts.player.position}
              </p>
            </div>

            {/* PPG */}
            <div className="flex flex-col items-end shrink-0">
              <span
                className={cn(
                  "font-barlow text-2xl font-black score-display leading-none",
                  isFirst ? "text-nbl-orange" : "text-nbl-white",
                )}
              >
                {allTime ? ts.player.careerPpg.toFixed(1) : ts.ppg.toFixed(1)}
              </span>
              <span className="text-[10px] text-nbl-gray font-bold">PPG</span>
            </div>

            {/* Matches */}
            <div className="flex flex-col items-end shrink-0 hidden sm:flex">
              <span className="text-sm font-black text-nbl-white">
                {allTime ? ts.player.careerMatches : ts.matches}
              </span>
              <span className="text-[10px] text-nbl-gray font-bold">
                MATCHS
              </span>
            </div>

            {/* Total points */}
            <div className="flex flex-col items-end shrink-0">
              <span className="text-sm font-black text-nbl-white">
                {allTime ? ts.player.careerPoints : ts.totalPoints}
              </span>
              <span className="text-[10px] text-nbl-gray font-bold">
                PTS TOTAL
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StandingsPage() {
  const [activeTab, setActiveTab] = useState<StandingsTab>("CLASSEMENT");

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      {/* Sticky sub-header */}
      <div className="sticky top-16 z-30 border-b border-nbl-border bg-nbl-bg/95 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 flex items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-nbl-orange" />
            <h1 className="font-black text-base tracking-widest uppercase text-nbl-white">
              Classement
            </h1>
          </div>
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all",
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

      <main className="flex-1 max-w-screen-xl mx-auto px-4 lg:px-8 py-6 pb-28 lg:pb-12 w-full">
        {activeTab === "CLASSEMENT" && (
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
            <div>
              <p className="text-[10px] font-black tracking-widest text-nbl-orange uppercase mb-4">
                Summer League 2026 — Saison régulière
              </p>
              <StandingsTable />
              <p className="text-[10px] text-nbl-gray mt-3 px-1">
                Top 4 qualifiés pour les playoffs. PTS = points de tournoi (2
                victoire, 0 défaite).
              </p>
            </div>
            {/* Top scorer sidebar on desktop */}
            <aside className="hidden lg:block mt-0">
              <p className="text-[10px] font-black tracking-widest text-nbl-orange uppercase mb-4">
                Top 5 marqueurs (édition)
              </p>
              <div className="flex flex-col gap-3">
                {TOP_SCORERS.slice(0, 5).map((ts, idx) => (
                  <Link
                    href={`/players/${ts.player.id}`}
                    key={ts.player.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-nbl-surface border border-nbl-border hover:border-nbl-orange/40 transition-colors"
                  >
                    <span className="text-sm font-black text-nbl-gray w-5 text-center">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-nbl-white truncate">
                        {ts.player.firstName[0]}. {ts.player.lastName}
                      </p>
                      <p className="text-[10px] text-nbl-gray">
                        {ts.team.code}
                      </p>
                    </div>
                    <span className="font-barlow text-lg font-black text-nbl-orange score-display">
                      {ts.ppg.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-nbl-gray">ppg</span>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        )}

        {activeTab === "TOP SCORERS" && (
          <>
            <p className="text-[10px] font-black tracking-widest text-nbl-orange uppercase mb-4">
              Meilleurs marqueurs — Summer League 2026
            </p>
            <TopScorersBoard />
          </>
        )}

        {activeTab === "ALL-TIME" && (
          <>
            <p className="text-[10px] font-black tracking-widest text-nbl-orange uppercase mb-4">
              Meilleurs marqueurs — Toutes éditions confondues
            </p>
            <TopScorersBoard allTime />
          </>
        )}
      </main>

      <SiteFooter />
      <BottomNav />
    </div>
  );
}
