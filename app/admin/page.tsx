"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  X,
  Check,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MATCHES } from "@/lib/nbl-data";
import type { PlayerMatchStat } from "@/lib/nbl-types";

// ─── Constants ────────────────────────────────────────────────────────────────

const QUARTERS = ["Q1", "Q2", "Q3", "Q4", "OT"] as const;
type Quarter = (typeof QUARTERS)[number];

type ActionType = "pts2" | "pts3" | "ft" | "foul";
type TeamSide = "home" | "away";

interface ActionButton {
  id: ActionType;
  label: string;
  subLabel: string;
  value: number;
  variant: "primary" | "secondary" | "accent";
}

const ACTION_BUTTONS: ActionButton[] = [
  { id: "pts2", label: "+2", subLabel: "POINTS", value: 2, variant: "primary" },
  {
    id: "pts3",
    label: "+3",
    subLabel: "POINTS",
    value: 3,
    variant: "secondary",
  },
  { id: "ft", label: "+1", subLabel: "LF", value: 1, variant: "secondary" },
  { id: "foul", label: "F", subLabel: "FAUTE", value: 0, variant: "accent" },
];

interface HistoryRecord {
  team: TeamSide;
  action: ActionType;
  value: number;
  playerId: string;
  playerName: string;
  quarter: Quarter;
}

// ─── Initialise player stats from match data ──────────────────────────────────

function initPlayerStats(
  players: PlayerMatchStat[],
): Record<string, PlayerMatchStat> {
  return Object.fromEntries(players.map((p) => [p.player.id, { ...p }]));
}

// ─── Player chip ──────────────────────────────────────────────────────────────

function PlayerChip({
  pms,
  isSelected,
  isPending,
  onTap,
}: {
  pms: PlayerMatchStat;
  isSelected: boolean;
  isPending: boolean;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border transition-all active:scale-95",
        isPending && isSelected
          ? "bg-nbl-orange border-nbl-orange text-nbl-bg scale-[1.02] shadow-[0_4px_16px_rgba(217,104,19,0.4)]"
          : isPending
            ? "bg-nbl-surface-raised border-nbl-orange/40 text-nbl-white"
            : "bg-nbl-surface border-nbl-border text-nbl-white hover:border-nbl-border/80",
      )}
    >
      {/* Number badge */}
      <span
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors",
          isPending && isSelected
            ? "bg-nbl-bg/20 text-nbl-bg"
            : "bg-nbl-surface-raised text-nbl-gray",
        )}
      >
        {pms.player.number}
      </span>

      {/* Name */}
      <div className="flex-1 min-w-0 text-left">
        <p
          className={cn(
            "text-xs font-black truncate",
            isPending && isSelected ? "text-nbl-bg" : "text-nbl-white",
          )}
        >
          {pms.player.firstName[0]}. {pms.player.lastName}
        </p>
        <p
          className={cn(
            "text-[10px] font-semibold",
            isPending && isSelected ? "text-nbl-bg/70" : "text-nbl-gray",
          )}
        >
          {pms.player.position}
        </p>
      </div>

      {/* Live stats */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Points */}
        <div className="flex flex-col items-center">
          <span
            className={cn(
              "text-base font-black score-display leading-none",
              isPending && isSelected ? "text-nbl-bg" : "text-nbl-white",
            )}
          >
            {pms.points}
          </span>
          <span
            className={cn(
              "text-[9px] font-bold uppercase",
              isPending && isSelected ? "text-nbl-bg/60" : "text-nbl-gray",
            )}
          >
            pts
          </span>
        </div>
        {/* Foul dots */}
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "w-2 h-2 rounded-full border transition-colors",
                i < pms.fouls
                  ? pms.fouls >= 4
                    ? "bg-red-500 border-red-500"
                    : isPending && isSelected
                      ? "bg-nbl-bg/80 border-nbl-bg/80"
                      : "bg-nbl-orange border-nbl-orange"
                  : isPending && isSelected
                    ? "bg-transparent border-nbl-bg/30"
                    : "bg-transparent border-nbl-gray/40",
              )}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

// ─── Team column ──────────────────────────────────────────────────────────────

function TeamColumn({
  side,
  teamName,
  score,
  fouls,
  bump,
  playerStats,
  pendingAction,
  pendingTeam,
  onActionSelect,
  onPlayerTap,
}: {
  side: TeamSide;
  teamName: string;
  score: number;
  fouls: number;
  bump: boolean;
  playerStats: Record<string, PlayerMatchStat>;
  pendingAction: ActionType | null;
  pendingTeam: TeamSide | null;
  onActionSelect: (side: TeamSide, action: ActionType) => void;
  onPlayerTap: (side: TeamSide, pms: PlayerMatchStat) => void;
}) {
  const isPending = pendingTeam === side && pendingAction !== null;
  const players = Object.values(playerStats);

  return (
    <div className="flex flex-col gap-3">
      {/* Team name + score */}
      <div className="text-center">
        <p className="text-[10px] font-black tracking-widest uppercase text-nbl-gray">
          {teamName}
        </p>
        <p
          className={cn(
            "text-6xl font-black text-nbl-white score-display leading-tight",
            bump && "score-bump",
          )}
        >
          {score}
        </p>
        <p className="text-[10px] text-nbl-gray font-bold">F: {fouls}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-nbl-border" />

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        {ACTION_BUTTONS.map((btn) => {
          const isActive = isPending && pendingAction === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => onActionSelect(side, btn.id)}
              className={cn(
                "flex flex-col items-center justify-center py-3 rounded-xl border transition-all active:scale-95",
                isActive
                  ? "bg-nbl-orange border-nbl-orange text-nbl-bg shadow-[0_4px_16px_rgba(217,104,19,0.4)]"
                  : btn.variant === "primary"
                    ? "bg-nbl-surface border-nbl-orange/30 text-nbl-orange hover:bg-nbl-orange/10"
                    : btn.variant === "accent"
                      ? "bg-nbl-surface border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : "bg-nbl-surface border-nbl-border text-nbl-white hover:border-nbl-border/60",
              )}
            >
              <span className="text-xl font-black leading-none">
                {btn.label}
              </span>
              <span
                className={cn(
                  "text-[9px] font-black tracking-widest uppercase mt-0.5",
                  isActive ? "text-nbl-bg/70" : "text-nbl-gray",
                )}
              >
                {btn.subLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pending action indicator */}
      {isPending && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-nbl-orange/10 border border-nbl-orange/30">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-nbl-orange shrink-0" />
          <span className="text-xs font-black text-nbl-orange uppercase tracking-wide">
            Sélectionne un joueur
          </span>
        </div>
      )}

      {/* Player list */}
      <div className="flex flex-col gap-1.5">
        {players.map((pms) => (
          <PlayerChip
            key={pms.player.id}
            pms={pms}
            isSelected={false}
            isPending={isPending}
            onTap={() => onPlayerTap(side, pms)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminConsolePage() {
  const match = MATCHES["match-1"];

  // Scores & team state
  const [homeScore, setHomeScore] = useState(match.homeState.score);
  const [awayScore, setAwayScore] = useState(match.awayState.score);
  const [homeFouls, setHomeFouls] = useState(match.homeState.fouls);
  const [awayFouls, setAwayFouls] = useState(match.awayState.fouls);
  const [homePlayers, setHomePlayers] = useState<
    Record<string, PlayerMatchStat>
  >(() => initPlayerStats(match.homeState.onCourt));
  const [awayPlayers, setAwayPlayers] = useState<
    Record<string, PlayerMatchStat>
  >(() => initPlayerStats(match.awayState.onCourt));

  // Timer
  const [activeQuarter, setActiveQuarter] = useState<Quarter>(match.quarter);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(match.clockSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pending action workflow
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [pendingTeam, setPendingTeam] = useState<TeamSide | null>(null);

  // Undo history
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Score bump animations
  const [bumpHome, setBumpHome] = useState(false);
  const [bumpAway, setBumpAway] = useState(false);

  // Toast for confirmation
  const [toast, setToast] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 0) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const quarterLabel = (q: Quarter) => {
    const labels: Record<Quarter, string> = {
      Q1: "1ER QUART",
      Q2: "2ÈME QUART",
      Q3: "3ÈME QUART",
      Q4: "4ÈME QUART",
      OT: "PROLONGATION",
    };
    return labels[q];
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // Step 1: admin taps action button → set pending
  const handleActionSelect = (side: TeamSide, action: ActionType) => {
    // Toggle off if tapping same action again
    if (pendingTeam === side && pendingAction === action) {
      setPendingAction(null);
      setPendingTeam(null);
      return;
    }
    setPendingAction(action);
    setPendingTeam(side);
  };

  // Step 2: admin taps player → commit action
  const handlePlayerTap = (side: TeamSide, pms: PlayerMatchStat) => {
    if (!pendingAction || pendingTeam !== side) return;

    const record: HistoryRecord = {
      team: side,
      action: pendingAction,
      value: ACTION_BUTTONS.find((b) => b.id === pendingAction)?.value ?? 0,
      playerId: pms.player.id,
      playerName: `${pms.player.firstName[0]}. ${pms.player.lastName}`,
      quarter: activeQuarter,
    };

    setHistory((prev) => [...prev, record]);

    if (pendingAction === "foul") {
      // Update team foul count
      if (side === "home") setHomeFouls((f) => Math.min(f + 1, 5));
      else setAwayFouls((f) => Math.min(f + 1, 5));
      // Update player fouls
      const setter = side === "home" ? setHomePlayers : setAwayPlayers;
      setter((prev) => ({
        ...prev,
        [pms.player.id]: {
          ...prev[pms.player.id],
          fouls: Math.min(prev[pms.player.id].fouls + 1, 5),
        },
      }));
      showToast(`Faute — ${record.playerName}`);
    } else {
      const pts = record.value;
      // Update score
      if (side === "home") {
        setHomeScore((s) => s + pts);
        setBumpHome(true);
        setTimeout(() => setBumpHome(false), 400);
      } else {
        setAwayScore((s) => s + pts);
        setBumpAway(true);
        setTimeout(() => setBumpAway(false), 400);
      }
      // Update player points
      const setter = side === "home" ? setHomePlayers : setAwayPlayers;
      setter((prev) => ({
        ...prev,
        [pms.player.id]: {
          ...prev[pms.player.id],
          points: prev[pms.player.id].points + pts,
        },
      }));
      showToast(`+${pts} pts — ${record.playerName}`);
    }

    // Clear pending
    setPendingAction(null);
    setPendingTeam(null);
  };

  // Undo last action
  const undoLastAction = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    if (last.action === "foul") {
      if (last.team === "home") setHomeFouls((f) => Math.max(f - 1, 0));
      else setAwayFouls((f) => Math.max(f - 1, 0));
      const setter = last.team === "home" ? setHomePlayers : setAwayPlayers;
      setter((prev) => ({
        ...prev,
        [last.playerId]: {
          ...prev[last.playerId],
          fouls: Math.max(prev[last.playerId].fouls - 1, 0),
        },
      }));
    } else {
      if (last.team === "home")
        setHomeScore((s) => Math.max(s - last.value, 0));
      else setAwayScore((s) => Math.max(s - last.value, 0));
      const setter = last.team === "home" ? setHomePlayers : setAwayPlayers;
      setter((prev) => ({
        ...prev,
        [last.playerId]: {
          ...prev[last.playerId],
          points: Math.max(prev[last.playerId].points - last.value, 0),
        },
      }));
    }
    showToast("Dernière action annulée");
  };

  return (
    <main className="min-h-screen bg-nbl-bg flex flex-col overscroll-none">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-nbl-border bg-nbl-bg/98 backdrop-blur-md gap-3">
        <Link
          href="/matches"
          className="text-nbl-gray hover:text-nbl-white p-1 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="text-center flex-1 min-w-0">
          <h1 className="font-black text-sm tracking-widest uppercase text-nbl-white truncate">
            {match.homeState.team.shortName} vs {match.awayState.team.shortName}
          </h1>
          <p className="text-nbl-gray text-[10px] font-black tracking-widest uppercase">
            Console Live · Admin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className="p-2 rounded-xl bg-nbl-surface border border-nbl-border text-nbl-gray hover:text-nbl-white transition-colors"
            aria-label="Dashboard"
          >
            <LayoutDashboard size={16} />
          </Link>
          <button
            className="px-3 py-2 rounded-xl border-2 border-destructive text-destructive text-[10px] font-black tracking-widest uppercase"
            onClick={() => setRunning(false)}
          >
            ARRÊTER LE MATCH
          </button>
        </div>
      </header>

      {/* ─── Timer bar ───────────────────────────────────────────────────────── */}
      <div className="bg-nbl-surface border-b border-nbl-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          {/* Quarter selector */}
          <div className="flex gap-1">
            {QUARTERS.map((q) => (
              <button
                key={q}
                onClick={() => setActiveQuarter(q)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all",
                  activeQuarter === q
                    ? "bg-nbl-orange text-nbl-bg shadow-[0_2px_10px_rgba(217,104,19,0.35)]"
                    : "bg-nbl-surface-raised border border-nbl-border text-nbl-gray",
                )}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Clock */}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-nbl-white score-display leading-none">
              {formatTime(seconds)}
            </span>
            <span className="text-[9px] text-nbl-orange font-black tracking-widest uppercase">
              {quarterLabel(activeQuarter)}
            </span>
          </div>

          {/* Play/pause */}
          <button
            onClick={() => setRunning((r) => !r)}
            className="w-11 h-11 rounded-xl bg-nbl-orange flex items-center justify-center text-nbl-bg shadow-[0_4px_14px_rgba(217,104,19,0.4)] active:scale-95 transition-transform"
            aria-label={running ? "Pause" : "Démarrer"}
          >
            {running ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>
        </div>
      </div>

      {/* ─── Main court view ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-3 py-4 pb-24">
          <div className="grid grid-cols-2 gap-3">
            <TeamColumn
              side="home"
              teamName={match.homeState.team.name}
              score={homeScore}
              fouls={homeFouls}
              bump={bumpHome}
              playerStats={homePlayers}
              pendingAction={pendingAction}
              pendingTeam={pendingTeam}
              onActionSelect={handleActionSelect}
              onPlayerTap={handlePlayerTap}
            />
            <TeamColumn
              side="away"
              teamName={match.awayState.team.name}
              score={awayScore}
              fouls={awayFouls}
              bump={bumpAway}
              playerStats={awayPlayers}
              pendingAction={pendingAction}
              pendingTeam={pendingTeam}
              onActionSelect={handleActionSelect}
              onPlayerTap={handlePlayerTap}
            />
          </div>
        </div>
      </div>

      {/* ─── Floating undo button ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 px-4 pb-5 pt-3 bg-gradient-to-t from-nbl-bg via-nbl-bg/90 to-transparent z-40">
        <div className="max-w-3xl mx-auto flex gap-3">
          {/* Cancel pending */}
          {pendingAction && (
            <button
              onClick={() => {
                setPendingAction(null);
                setPendingTeam(null);
              }}
              className="flex items-center justify-center gap-2 flex-1 py-4 rounded-2xl border-2 border-nbl-border text-nbl-gray font-black text-xs tracking-widest uppercase active:scale-95 transition-all"
            >
              <X size={16} />
              ANNULER
            </button>
          )}
          {/* Undo */}
          <button
            onClick={undoLastAction}
            disabled={history.length === 0}
            className="flex items-center justify-center gap-2 flex-1 py-4 rounded-2xl border-2 border-destructive/60 text-destructive font-black text-xs tracking-widest uppercase disabled:opacity-30 active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            ANNULER DERNIÈRE ACTION
          </button>
        </div>
      </div>

      {/* ─── Toast feedback ──────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-20 inset-x-0 flex justify-center z-50 pointer-events-none px-4">
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-nbl-surface-raised border border-nbl-orange/40 shadow-xl shadow-black/40">
            <Check size={14} className="text-nbl-orange" />
            <span className="text-sm font-black text-nbl-white">{toast}</span>
          </div>
        </div>
      )}
    </main>
  );
}
