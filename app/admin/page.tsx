"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import type {
  LiveEventRequest,
  LiveEventResponse,
  LiveMatchSnapshotResponse,
  LivePlayerStatSnapshot,
  PlayerMatchStat,
} from "@/lib/nbl-types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS = ["H1", "H2"] as const;
type MatchPeriod = (typeof PERIODS)[number];
type MatchStatus = "live" | "upcoming" | "finished" | "timeout";
const HALF_DURATION_SECONDS = 600;

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
  period: MatchPeriod;
}

type LiveMode = "sync" | "local";

const adminApiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

function makeAdminHeaders() {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (adminApiKey) {
    headers["x-admin-key"] = adminApiKey;
  }

  return headers;
}

// ─── Initialise player stats from match data ──────────────────────────────────

function initPlayerStats(
  players: PlayerMatchStat[],
): Record<string, PlayerMatchStat> {
  return Object.fromEntries(players.map((p) => [p.player.id, { ...p }]));
}

function mergePlayersFromSnapshot(
  current: Record<string, PlayerMatchStat>,
  snapshotStats: LivePlayerStatSnapshot[],
  side: TeamSide,
): Record<string, PlayerMatchStat> {
  const sideStats = new Map(
    snapshotStats
      .filter((stat) => stat.teamSide === side)
      .map((stat) => [stat.playerId, stat]),
  );

  return Object.fromEntries(
    Object.entries(current).map(([playerId, pms]) => {
      const fromDb = sideStats.get(playerId);

      if (!fromDb) {
        return [playerId, pms];
      }

      return [
        playerId,
        {
          ...pms,
          points: fromDb.points,
          fouls: fromDb.fouls,
        },
      ];
    }),
  );
}

// ─── Player chip ──────────────────────────────────────────────────────────────

function PlayerChip({
  pms,
  isSelected,
  isPending,
  disabled,
  onTap,
}: {
  pms: PlayerMatchStat;
  isSelected: boolean;
  isPending: boolean;
  disabled: boolean;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border transition-all active:scale-95",
        disabled && "opacity-60 pointer-events-none",
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
  controlsLocked,
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
  controlsLocked: boolean;
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
              disabled={controlsLocked}
              className={cn(
                "flex flex-col items-center justify-center py-3 rounded-xl border transition-all active:scale-95",
                controlsLocked && "opacity-60 pointer-events-none",
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
            disabled={controlsLocked}
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
  const [activePeriod, setActivePeriod] = useState<MatchPeriod>(match.quarter);
  const [running, setRunning] = useState(false);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>(match.status);
  const [seconds, setSeconds] = useState(match.clockSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPersistedClockRef = useRef("");

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
  const [liveMode, setLiveMode] = useState<LiveMode>("local");
  const [matchVersion, setMatchVersion] = useState(0);
  const [syncingAction, setSyncingAction] = useState(false);

  // Timer effect
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 0) {
            setRunning(false);
            setMatchStatus("timeout");
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

  const periodLabel = (period: MatchPeriod) => {
    const labels: Record<MatchPeriod, string> = {
      H1: "1RE MI-TEMPS",
      H2: "2E MI-TEMPS",
    };
    return labels[period];
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const persistClockState = useCallback(
    async (
      nextStatus: MatchStatus,
      nextPeriod: MatchPeriod,
      nextSeconds: number,
    ) => {
      if (liveMode !== "sync") {
        return false;
      }

      try {
        const response = await fetch(`/api/admin/matches/${match.id}`, {
          method: "PATCH",
          headers: makeAdminHeaders(),
          body: JSON.stringify({
            status: nextStatus,
            quarter: nextPeriod,
            clockSeconds: nextSeconds,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          return false;
        }

        return true;
      } catch {
        return false;
      }
    },
    [liveMode, match.id],
  );

  const syncSnapshot = async () => {
    try {
      const response = await fetch(`/api/live/matches/${match.id}`, {
        cache: "no-store",
      });
      const data = (await response
        .json()
        .catch(() => null)) as LiveMatchSnapshotResponse | null;

      if (!response.ok || !data || !data.ok) {
        return false;
      }

      setHomeScore(data.snapshot.score.home);
      setAwayScore(data.snapshot.score.away);
      setHomeFouls(data.snapshot.fouls.home);
      setAwayFouls(data.snapshot.fouls.away);
      setActivePeriod(data.snapshot.quarter);
      setMatchStatus(data.snapshot.status);
      setRunning(data.snapshot.status === "live");
      setSeconds(data.snapshot.clockSeconds);
      setMatchVersion(data.snapshot.version);
      lastPersistedClockRef.current = `${data.snapshot.status}:${data.snapshot.quarter}:${data.snapshot.clockSeconds}`;
      setHomePlayers((prev) =>
        mergePlayersFromSnapshot(prev, data.playerStats, "home"),
      );
      setAwayPlayers((prev) =>
        mergePlayersFromSnapshot(prev, data.playerStats, "away"),
      );

      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const ok = await syncSnapshot();

      if (cancelled) {
        return;
      }

      if (ok) {
        setLiveMode("sync");
        setHistory([]);
        showToast("Sync DB active");
      } else {
        setLiveMode("local");
        showToast("Mode local (non sauvegarde)");
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [match.id]);

  useEffect(() => {
    if (liveMode !== "sync") {
      return;
    }

    const payloadKey = `${matchStatus}:${activePeriod}:${seconds}`;
    if (payloadKey === lastPersistedClockRef.current) {
      return;
    }

    lastPersistedClockRef.current = payloadKey;

    void persistClockState(matchStatus, activePeriod, seconds).then((ok) => {
      if (!ok) {
        setLiveMode("local");
        showToast("Sync timer perdue, mode local");
      }
    });
  }, [activePeriod, liveMode, matchStatus, persistClockState, seconds]);

  const handlePeriodSelect = (period: MatchPeriod) => {
    setActivePeriod(period);
    setSeconds(HALF_DURATION_SECONDS);
    setRunning(false);
    setMatchStatus("timeout");
  };

  const handlePlayPause = () => {
    if (running) {
      setRunning(false);
      setMatchStatus("timeout");
      return;
    }

    if (seconds <= 0) {
      setSeconds(HALF_DURATION_SECONDS);
    }

    setMatchStatus("live");
    setRunning(true);
  };

  const applyActionLocally = (record: HistoryRecord) => {
    setHistory((prev) => [...prev, record]);

    if (record.action === "foul") {
      if (record.team === "home") setHomeFouls((f) => Math.min(f + 1, 5));
      else setAwayFouls((f) => Math.min(f + 1, 5));

      const setter = record.team === "home" ? setHomePlayers : setAwayPlayers;
      setter((prev) => ({
        ...prev,
        [record.playerId]: {
          ...prev[record.playerId],
          fouls: Math.min(prev[record.playerId].fouls + 1, 5),
        },
      }));

      showToast(`Faute — ${record.playerName}`);
      return;
    }

    if (record.team === "home") {
      setHomeScore((s) => s + record.value);
      setBumpHome(true);
      setTimeout(() => setBumpHome(false), 400);
    } else {
      setAwayScore((s) => s + record.value);
      setBumpAway(true);
      setTimeout(() => setBumpAway(false), 400);
    }

    const setter = record.team === "home" ? setHomePlayers : setAwayPlayers;
    setter((prev) => ({
      ...prev,
      [record.playerId]: {
        ...prev[record.playerId],
        points: prev[record.playerId].points + record.value,
      },
    }));

    showToast(`+${record.value} pts — ${record.playerName}`);
  };

  // Step 1: admin taps action button → set pending
  const handleActionSelect = (side: TeamSide, action: ActionType) => {
    if (syncingAction) {
      showToast("Synchronisation en cours");
      return;
    }

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
  const handlePlayerTap = async (side: TeamSide, pms: PlayerMatchStat) => {
    if (!pendingAction || pendingTeam !== side) return;
    if (syncingAction) {
      showToast("Synchronisation en cours");
      return;
    }

    const record: HistoryRecord = {
      team: side,
      action: pendingAction,
      value: ACTION_BUTTONS.find((b) => b.id === pendingAction)?.value ?? 0,
      playerId: pms.player.id,
      playerName: `${pms.player.firstName[0]}. ${pms.player.lastName}`,
      period: activePeriod,
    };

    setPendingAction(null);
    setPendingTeam(null);

    if (liveMode === "local") {
      applyActionLocally(record);
      return;
    }

    setSyncingAction(true);

    const eventId = crypto.randomUUID();
    const requestPayload: LiveEventRequest = {
      eventId,
      matchId: match.id,
      expectedVersion: matchVersion,
      quarter: activePeriod,
      clockSeconds: seconds,
      eventType: record.action,
      teamSide: side,
      playerId: record.playerId,
      playerName: record.playerName,
    };

    try {
      const response = await fetch("/api/live/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": `${match.id}-${eventId}`,
        },
        body: JSON.stringify(requestPayload),
      });

      const data = (await response
        .json()
        .catch(() => null)) as LiveEventResponse | null;

      if (!response.ok || !data || !data.ok) {
        if (response.status === 409) {
          const refreshed = await syncSnapshot();
          if (refreshed) {
            setLiveMode("sync");
            setHistory([]);
            showToast("Conflit version, etat recharge");
          } else {
            setLiveMode("local");
            showToast("Sync perdue, mode local");
          }
          return;
        }

        showToast("Action non enregistree");
        return;
      }

      setMatchVersion(data.snapshot.version);
      setHomeScore(data.snapshot.score.home);
      setAwayScore(data.snapshot.score.away);
      setHomeFouls(data.snapshot.fouls.home);
      setAwayFouls(data.snapshot.fouls.away);
      setActivePeriod(data.snapshot.quarter);
      setMatchStatus(data.snapshot.status);
      setRunning(data.snapshot.status === "live");
      setSeconds(data.snapshot.clockSeconds);
      setLiveMode("sync");

      const refreshed = await syncSnapshot();
      if (!refreshed) {
        const setter = record.team === "home" ? setHomePlayers : setAwayPlayers;

        if (record.action === "foul") {
          setter((prev) => ({
            ...prev,
            [record.playerId]: {
              ...prev[record.playerId],
              fouls: Math.min(prev[record.playerId].fouls + 1, 5),
            },
          }));
        } else {
          setter((prev) => ({
            ...prev,
            [record.playerId]: {
              ...prev[record.playerId],
              points: prev[record.playerId].points + record.value,
            },
          }));

          if (record.team === "home") {
            setBumpHome(true);
            setTimeout(() => setBumpHome(false), 400);
          } else {
            setBumpAway(true);
            setTimeout(() => setBumpAway(false), 400);
          }
        }
      }

      if (record.action === "foul") {
        showToast(`Faute — ${record.playerName}`);
      } else {
        showToast(`+${record.value} pts — ${record.playerName}`);
      }
    } catch {
      showToast("Echec sync, action non enregistree");
    } finally {
      setSyncingAction(false);
    }
  };

  // Undo last action
  const undoLastAction = () => {
    if (liveMode === "sync") {
      showToast("Undo disponible seulement en mode local");
      return;
    }

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
            {liveMode === "sync"
              ? "Console Live · Sync DB"
              : "Console Live · Mode local"}
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
            onClick={() => {
              setRunning(false);
              setMatchStatus("finished");
              setSeconds(0);
            }}
          >
            ARRÊTER LE MATCH
          </button>
        </div>
      </header>

      {/* ─── Timer bar ───────────────────────────────────────────────────────── */}
      <div className="bg-nbl-surface border-b border-nbl-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          {/* Period selector */}
          <div className="flex gap-1">
            {PERIODS.map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodSelect(period)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all",
                  activePeriod === period
                    ? "bg-nbl-orange text-nbl-bg shadow-[0_2px_10px_rgba(217,104,19,0.35)]"
                    : "bg-nbl-surface-raised border border-nbl-border text-nbl-gray",
                )}
              >
                {period === "H1" ? "1RE MT" : "2E MT"}
              </button>
            ))}
          </div>

          {/* Clock */}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-nbl-white score-display leading-none">
              {formatTime(seconds)}
            </span>
            <span className="text-[9px] text-nbl-orange font-black tracking-widest uppercase">
              {periodLabel(activePeriod)}
            </span>
            <span
              className={cn(
                "text-[9px] font-black tracking-widest uppercase mt-0.5",
                liveMode === "sync" ? "text-green-400" : "text-amber-400",
              )}
            >
              {liveMode === "sync" ? "PERSISTE" : "LOCAL"}
            </span>
          </div>

          {/* Play/pause */}
          <button
            onClick={handlePlayPause}
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
              controlsLocked={syncingAction}
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
              controlsLocked={syncingAction}
              onActionSelect={handleActionSelect}
              onPlayerTap={handlePlayerTap}
            />
          </div>
        </div>
      </div>

      {/* ─── Floating undo button ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 px-4 pb-5 pt-3 bg-linear-to-t from-nbl-bg via-nbl-bg/90 to-transparent z-40">
        <div className="max-w-3xl mx-auto flex gap-3">
          {/* Cancel pending */}
          {pendingAction && (
            <button
              onClick={() => {
                setPendingAction(null);
                setPendingTeam(null);
              }}
              disabled={syncingAction}
              className="flex items-center justify-center gap-2 flex-1 py-4 rounded-2xl border-2 border-nbl-border text-nbl-gray font-black text-xs tracking-widest uppercase active:scale-95 transition-all"
            >
              <X size={16} />
              ANNULER
            </button>
          )}
          {/* Undo */}
          <button
            onClick={undoLastAction}
            disabled={
              history.length === 0 || liveMode === "sync" || syncingAction
            }
            className="flex items-center justify-center gap-2 flex-1 py-4 rounded-2xl border-2 border-destructive/60 text-destructive font-black text-xs tracking-widest uppercase disabled:opacity-30 active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            {liveMode === "sync"
              ? "UNDO LOCAL INDISPO"
              : "ANNULER DERNIÈRE ACTION"}
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
