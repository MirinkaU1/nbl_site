import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAYERS, TEAMS, TOP_SCORERS } from "@/lib/nbl-data";
import { SiteHeader } from "@/components/nbl/site-header";
import { SiteFooter } from "@/components/nbl/site-footer";

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  value,
  label,
  highlight,
}: {
  value: string | number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 p-4 rounded-2xl border",
        highlight
          ? "bg-nbl-orange/10 border-nbl-orange/30"
          : "bg-nbl-surface border-nbl-border",
      )}
    >
      <span
        className={cn(
          "text-3xl font-black score-display leading-none",
          highlight ? "text-nbl-orange" : "text-nbl-white",
        )}
      >
        {value}
      </span>
      <span className="text-[10px] font-black tracking-widest uppercase text-nbl-gray">
        {label}
      </span>
    </div>
  );
}

// ─── Edition history row ──────────────────────────────────────────────────────

function EditionRow({
  edition,
  matches,
  totalPoints,
  ppg,
  fouls,
}: {
  edition: string;
  matches: number;
  totalPoints: number;
  ppg: number;
  fouls: number;
}) {
  return (
    <div className="grid grid-cols-[1fr_repeat(4,auto)] gap-x-6 items-center px-4 py-3 rounded-xl bg-nbl-surface border border-nbl-border">
      <span className="text-sm font-black text-nbl-white">{edition}</span>
      <div className="flex flex-col items-center">
        <span className="text-base font-black text-nbl-orange score-display">
          {ppg.toFixed(1)}
        </span>
        <span className="text-[9px] text-nbl-gray font-bold uppercase">
          PPG
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-base font-black text-nbl-white score-display">
          {totalPoints}
        </span>
        <span className="text-[9px] text-nbl-gray font-bold uppercase">
          PTS
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-base font-black text-nbl-white score-display">
          {matches}
        </span>
        <span className="text-[9px] text-nbl-gray font-bold uppercase">
          MATCHS
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-base font-black text-nbl-white score-display">
          {fouls}
        </span>
        <span className="text-[9px] text-nbl-gray font-bold uppercase">
          FAUTES
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlayerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const player = PLAYERS[params.id] ?? PLAYERS["malik-diop"];
  const team = TEAMS[player.teamId];
  const topScorer = TOP_SCORERS.find((ts) => ts.player.id === player.id);
  const editionEntries = Object.values(player.editionStats).sort((a, b) =>
    b.editionId.localeCompare(a.editionId),
  );

  const isPhotoPlayer = player.id === "malik-diop";

  return (
    <div className="min-h-screen bg-nbl-bg flex flex-col">
      <SiteHeader />

      <main className="flex-1 pb-12">
        {/* Hero section */}
        <div className="relative bg-nbl-surface border-b border-nbl-border overflow-hidden">
          {/* Subtle radial glow */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 80% at 80% 100%, ${team?.primaryColor ?? "#D96813"} 0%, transparent 70%)`,
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-8">
            {/* Back link */}
            <Link
              href="/standings"
              className="flex items-center gap-2 text-nbl-gray hover:text-nbl-white transition-colors text-sm mb-6"
            >
              <ArrowLeft size={16} />
              Retour au classement
            </Link>

            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
              {/* Photo / avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-3xl overflow-hidden border-2 border-nbl-orange bg-nbl-surface-raised">
                  {isPhotoPlayer ? (
                    <Image
                      src="/images/mvp-malik.jpg"
                      alt={`${player.firstName} ${player.lastName}`}
                      width={144}
                      height={144}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-nbl-white">
                      {player.firstName[0]}
                      {player.lastName[0]}
                    </div>
                  )}
                </div>
                {/* Jersey number badge */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-nbl-orange flex items-center justify-center text-xs font-black text-nbl-bg shadow-lg">
                  {player.number}
                </div>
              </div>

              {/* Name & team */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-nbl-surface-raised border border-nbl-border text-[10px] font-black tracking-widest text-nbl-gray uppercase">
                    {player.position}
                  </span>
                  {topScorer?.rank === 1 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-nbl-orange/15 border border-nbl-orange/30 text-[10px] font-black tracking-widest text-nbl-orange uppercase">
                      <Trophy size={10} />
                      MVP Race
                    </span>
                  )}
                </div>
                <h1 className="text-4xl lg:text-5xl font-black uppercase leading-tight text-nbl-white tracking-tight">
                  {player.firstName}
                  <br />
                  <span className="text-nbl-orange">
                    {player.lastName.toUpperCase()}
                  </span>
                </h1>
                <p className="mt-2 text-sm text-nbl-gray font-semibold">
                  {team?.name} · {team?.city}
                </p>
              </div>

              {/* Career headline stat */}
              <div className="lg:self-center flex flex-col items-center lg:items-end gap-0.5">
                <span className="text-6xl font-black text-nbl-orange score-display leading-none">
                  {player.careerPpg.toFixed(1)}
                </span>
                <span className="text-xs font-black tracking-widest text-nbl-gray uppercase">
                  pts / match (carrière)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid + history */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-10">
            {/* Left — season stats + history */}
            <div className="flex flex-col gap-8">
              {/* Current edition summary */}
              {editionEntries[0] && (
                <section>
                  <p className="text-[10px] font-black tracking-widest text-nbl-orange uppercase mb-4">
                    {editionEntries[0].editionName}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatTile
                      value={editionEntries[0].ppg.toFixed(1)}
                      label="PPG"
                      highlight
                    />
                    <StatTile
                      value={editionEntries[0].totalPoints}
                      label="Pts Total"
                    />
                    <StatTile
                      value={editionEntries[0].matches}
                      label="Matchs"
                    />
                    <StatTile value={editionEntries[0].fouls} label="Fautes" />
                  </div>
                </section>
              )}

              {/* Edition history */}
              <section>
                <p className="text-[10px] font-black tracking-widest text-nbl-orange uppercase mb-4">
                  Historique par édition
                </p>
                <div className="flex flex-col gap-2">
                  {editionEntries.map((ed) => (
                    <EditionRow
                      key={ed.editionId}
                      edition={ed.editionName}
                      matches={ed.matches}
                      totalPoints={ed.totalPoints}
                      ppg={ed.ppg}
                      fouls={ed.fouls}
                    />
                  ))}
                </div>
              </section>
            </div>

            {/* Right — career card */}
            <aside className="mt-8 lg:mt-0">
              <p className="text-[10px] font-black tracking-widest text-nbl-orange uppercase mb-4">
                Statistiques carrière
              </p>
              <div className="rounded-2xl bg-nbl-surface border border-nbl-border p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Star size={16} className="text-nbl-orange" />
                  <p className="text-sm font-black text-nbl-white">
                    {player.firstName} {player.lastName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatTile
                    value={player.careerPpg.toFixed(1)}
                    label="PPG Carrière"
                    highlight
                  />
                  <StatTile value={player.careerPoints} label="Points totaux" />
                  <StatTile value={player.careerMatches} label="Matchs joués" />
                  <StatTile value={editionEntries.length} label="Éditions" />
                </div>
                {topScorer && (
                  <div className="pt-3 border-t border-nbl-border">
                    <p className="text-[10px] text-nbl-gray font-bold uppercase tracking-widest mb-1">
                      Classement actuel
                    </p>
                    <p className="text-2xl font-black text-nbl-orange">
                      #{topScorer.rank}
                      <span className="text-sm text-nbl-gray font-semibold ml-2">
                        Top Scorers 2026
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
