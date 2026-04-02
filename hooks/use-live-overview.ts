"use client";

import * as React from "react";
import { MATCHES_LIST, STANDINGS, TOP_SCORERS } from "@/lib/nbl-data";
import type {
  LiveOverviewResponse,
  LivePublicMatch,
  StandingsRow,
  TopScorer,
} from "@/lib/nbl-types";

const FALLBACK_MATCHES: LivePublicMatch[] = MATCHES_LIST.map((match) => ({
  id: match.id,
  status: match.status,
  quarter: match.quarter,
  clockSeconds: match.clockSeconds,
  updatedAt: new Date().toISOString(),
  venue: match.venue,
  scheduledAt: match.scheduledAt,
  tags: match.tags,
  ticketPrice: match.ticketPrice,
  homeTeam: {
    id: match.homeState.team.id,
    name: match.homeState.team.name,
    shortName: match.homeState.team.shortName,
    code: match.homeState.team.code,
    city: match.homeState.team.city,
    score: match.homeState.score,
  },
  awayTeam: {
    id: match.awayState.team.id,
    name: match.awayState.team.name,
    shortName: match.awayState.team.shortName,
    code: match.awayState.team.code,
    city: match.awayState.team.city,
    score: match.awayState.score,
  },
}));

export function useLiveOverview(pollMs = 4000) {
  const [matches, setMatches] =
    React.useState<LivePublicMatch[]>(FALLBACK_MATCHES);
  const [standings, setStandings] = React.useState<StandingsRow[]>(STANDINGS);
  const [topScorers, setTopScorers] = React.useState<TopScorer[]>(TOP_SCORERS);
  const [isConnected, setIsConnected] = React.useState(false);

  const fetchOverview = React.useCallback(async () => {
    try {
      const response = await fetch("/api/live/overview", { cache: "no-store" });
      const data = (await response
        .json()
        .catch(() => null)) as LiveOverviewResponse | null;

      if (!response.ok || !data || !data.ok) {
        setIsConnected(false);
        return;
      }

      setMatches(data.matches);
      setStandings(data.standings);
      setTopScorers(data.topScorers);
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchOverview();

    const timer = window.setInterval(() => {
      void fetchOverview();
    }, pollMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [fetchOverview, pollMs]);

  return {
    matches,
    standings,
    topScorers,
    isConnected,
  };
}
