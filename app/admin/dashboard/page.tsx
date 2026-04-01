"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Users,
  Trophy,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MATCHES_LIST, TEAMS, STANDINGS, TOP_SCORERS } from "@/lib/nbl-data";

// ─── Stat summary card ────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border",
        accent
          ? "bg-nbl-orange/10 border-nbl-orange/30"
          : "bg-nbl-surface border-nbl-border",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          accent ? "bg-nbl-orange/20" : "bg-nbl-surface-raised",
        )}
      >
        <Icon
          size={18}
          className={accent ? "text-nbl-orange" : "text-nbl-gray"}
        />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-xl font-black leading-none",
            accent ? "text-nbl-orange" : "text-nbl-white",
          )}
        >
          {value}
        </p>
        <p className="text-xs text-nbl-gray font-semibold mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-nbl-gray/60">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Today's matches ──────────────────────────────────────────────────────────

function TodayMatchCard({ match }: { match: (typeof MATCHES_LIST)[0] }) {
  const isLive = match.status === "live" || match.status === "timeout";
  const isUpcoming = match.status === "upcoming";

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-nbl-surface border border-nbl-border">
      {/* Status indicator */}
      <div
        className={cn(
          "w-2.5 h-2.5 rounded-full shrink-0",
          isLive
            ? "bg-nbl-orange live-dot"
            : isUpcoming
              ? "bg-nbl-gray"
              : "bg-green-500",
        )}
      />

      {/* Teams + score */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-nbl-white">
          {match.homeState.team.shortName}
          <span className="text-nbl-gray font-normal mx-2">vs</span>
          {match.awayState.team.shortName}
        </p>
        <p className="text-[10px] text-nbl-gray font-semibold">
          {isLive
            ? `EN COURS · ${match.quarter}`
            : isUpcoming
              ? "À VENIR"
              : "TERMINÉ"}{" "}
          · {match.venue.split(",")[0]}
        </p>
      </div>

      {/* Score */}
      {(isLive || match.status === "finished") && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-lg font-black text-nbl-white score-display">
            {match.homeState.score}
          </span>
          <span className="text-nbl-gray text-sm">–</span>
          <span className="text-lg font-black text-nbl-white score-display">
            {match.awayState.score}
          </span>
        </div>
      )}

      {/* CTA */}
      {isLive && (
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-nbl-orange text-nbl-bg text-[10px] font-black tracking-widest uppercase shrink-0 shadow-[0_2px_10px_rgba(217,104,19,0.3)] hover:bg-nbl-orange-dark transition-colors"
        >
          <Play size={10} fill="currentColor" />
          CONSOLE
        </Link>
      )}
      {isUpcoming && (
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-nbl-surface-raised border border-nbl-border text-nbl-white text-[10px] font-black tracking-widest uppercase shrink-0 hover:border-nbl-orange/40 transition-colors"
        >
          LANCER
        </Link>
      )}
    </div>
  );
}

// ─── Team management row ──────────────────────────────────────────────────────

function TeamRow({
  rank,
  teamName,
  code,
  played,
  won,
  needsValidation,
}: {
  rank: number;
  teamName: string;
  code: string;
  played: number;
  won: number;
  needsValidation?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-nbl-surface border border-nbl-border hover:border-nbl-border/60 transition-colors">
      <span className="text-sm font-black text-nbl-gray w-5 text-center shrink-0">
        {rank}
      </span>
      <div className="w-8 h-8 rounded-full bg-nbl-surface-raised border border-nbl-border flex items-center justify-center text-[10px] font-black text-nbl-white shrink-0">
        {code}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-nbl-white truncate">{teamName}</p>
        <p className="text-[10px] text-nbl-gray">
          {played}J · {won}V
        </p>
      </div>
      {needsValidation && (
        <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-widest">
          <AlertCircle size={10} />
          Valider
        </span>
      )}
      <button
        className="text-nbl-gray hover:text-nbl-white transition-colors p-1"
        aria-label="Gérer équipe"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const liveMatches = MATCHES_LIST.filter(
    (m) => m.status === "live" || m.status === "timeout",
  );
  const upcomingMatches = MATCHES_LIST.filter((m) => m.status === "upcoming");
  const totalTeams = Object.keys(TEAMS).length;

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      {/* Admin header — no SiteHeader (admin area) */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8 py-4 border-b border-nbl-border bg-nbl-bg/98 backdrop-blur-md">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-nbl-gray hover:text-nbl-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-xs font-black tracking-widest uppercase">
            Console
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Image
            src="/logo/logo_large.jpeg"
            alt="NBL"
            width={64}
            height={27}
            className="h-7 w-auto object-contain"
          />
          <span className="ml-1 px-2 py-0.5 rounded-lg bg-nbl-surface-raised border border-nbl-border text-[10px] font-black text-nbl-gray uppercase tracking-widest">
            ADMIN
          </span>
        </div>
        <Link
          href="/"
          className="text-nbl-gray text-xs font-semibold hover:text-nbl-white transition-colors"
        >
          Vue publique
        </Link>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-12 w-full">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight text-nbl-white">
            Dashboard Admin
          </h1>
          <p className="text-sm text-nbl-gray mt-0.5">
            Summer League 2026 — Vue d&apos;ensemble
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <SummaryCard
            label="Matchs en cours"
            value={liveMatches.length}
            sub="aujourd'hui"
            icon={Play}
            accent={liveMatches.length > 0}
          />
          <SummaryCard
            label="À planifier"
            value={upcomingMatches.length}
            icon={CalendarDays}
          />
          <SummaryCard
            label="Équipes inscrites"
            value={totalTeams}
            icon={Users}
          />
          <SummaryCard
            label="Leader pts"
            value={`${TOP_SCORERS[0]?.ppg.toFixed(1)} ppg`}
            sub={`${TOP_SCORERS[0]?.player.lastName}`}
            icon={Trophy}
            accent
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            {/* Today's matches */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black tracking-widest uppercase text-nbl-orange flex items-center gap-2">
                  <span className="live-dot w-1.5 h-1.5 rounded-full bg-nbl-orange" />
                  Matchs du jour
                </h2>
                <Link
                  href="/matches"
                  className="text-[10px] text-nbl-gray hover:text-nbl-white uppercase tracking-widest font-bold"
                >
                  Voir tout
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {MATCHES_LIST.map((m) => (
                  <TodayMatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>

            {/* Upcoming to schedule */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black tracking-widest uppercase text-nbl-orange flex items-center gap-2">
                  <CalendarDays size={13} />
                  Planification
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  {
                    home: "VIPERS",
                    away: "HOOP KINGS",
                    date: "18 Mar · 19:30",
                    venue: "Stade Municipal",
                  },
                  {
                    home: "STREET SOUL",
                    away: "BALLERS",
                    date: "18 Mar · 21:00",
                    venue: "Stade Municipal",
                  },
                  {
                    home: "PHOENIX",
                    away: "TIGERS",
                    date: "19 Mar · 18:30",
                    venue: "Treichville Arena",
                  },
                ].map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-nbl-surface border border-nbl-border"
                  >
                    <Clock size={14} className="text-nbl-gray shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-nbl-white">
                        {m.home}{" "}
                        <span className="text-nbl-gray font-normal">vs</span>{" "}
                        {m.away}
                      </p>
                      <p className="text-[10px] text-nbl-gray">
                        {m.venue} · {m.date}
                      </p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-nbl-surface-raised border border-nbl-border text-[10px] font-black text-nbl-white uppercase tracking-widest hover:border-nbl-orange/40 transition-colors">
                      Modifier
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-8">
            {/* Teams management */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black tracking-widest uppercase text-nbl-orange flex items-center gap-2">
                  <Users size={13} />
                  Équipes
                </h2>
                <button className="text-[10px] text-nbl-orange hover:text-nbl-orange-dark uppercase tracking-widest font-black transition-colors">
                  + Ajouter
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {STANDINGS.slice(0, 6).map((row, i) => (
                  <TeamRow
                    key={row.team.id}
                    rank={row.rank}
                    teamName={row.team.name}
                    code={row.team.code}
                    played={row.played}
                    won={row.won}
                    needsValidation={i === 2}
                  />
                ))}
              </div>
            </section>

            {/* Quick actions */}
            <section>
              <h2 className="text-xs font-black tracking-widest uppercase text-nbl-orange mb-3 flex items-center gap-2">
                <CheckCircle2 size={13} />
                Actions rapides
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Nouvelle équipe", href: "#" },
                  { label: "Nouveau joueur", href: "#" },
                  { label: "Planifier match", href: "#" },
                  { label: "Exporter stats", href: "#" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-center text-center p-3 rounded-xl bg-nbl-surface border border-nbl-border text-nbl-white text-xs font-black hover:border-nbl-orange/40 hover:text-nbl-orange transition-colors"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
