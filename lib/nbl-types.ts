// ─── Core entity interfaces ─────────────────────────────────────────────────

export type MatchStatus = "live" | "upcoming" | "finished" | "timeout"
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4" | "OT"
export type ActionType = "pts2" | "pts3" | "ft" | "foul" | "timeout" | "substitution"

export interface Player {
  id: string
  firstName: string
  lastName: string
  number: number
  position: "PG" | "SG" | "SF" | "PF" | "C"
  teamId: string
  photoUrl?: string
  // Career aggregates
  careerPoints: number
  careerMatches: number
  /** Points per game across all editions */
  careerPpg: number
  /** Edition-level stats (keyed by edition id) */
  editionStats: Record<string, EditionStat>
}

export interface EditionStat {
  editionId: string
  editionName: string
  matches: number
  totalPoints: number
  ppg: number
  fouls: number
}

export interface Team {
  id: string
  name: string
  shortName: string
  code: string          // 2-3 char abbreviation
  city: string
  logoUrl?: string
  primaryColor: string
}

// ─── Match & live-game interfaces ────────────────────────────────────────────

export interface MatchTeamState {
  team: Team
  score: number
  fouls: number
  timeoutsLeft: number
  /** Players currently on court */
  onCourt: PlayerMatchStat[]
  /** Players on bench */
  bench: PlayerMatchStat[]
}

export interface PlayerMatchStat {
  player: Player
  points: number
  fouls: number
  assists: number
  rebounds: number
  isOnCourt: boolean
}

export interface Match {
  id: string
  status: MatchStatus
  quarter: Quarter
  /** Seconds remaining in current period */
  clockSeconds: number
  homeState: MatchTeamState
  awayState: MatchTeamState
  possession: "home" | "away"
  venue: string
  scheduledAt: string   // ISO-8601
  tags: string[]
  ticketPrice?: string
  /** Ordered list of game events */
  events: GameEvent[]
}

// ─── Game event (action) ──────────────────────────────────────────────────────

export interface GameEvent {
  id: string
  matchId: string
  quarter: Quarter
  /** Seconds elapsed when the event happened */
  clockSeconds: number
  type: ActionType
  /** Points value (0 for foul / timeout / sub) */
  value: number
  team: "home" | "away"
  playerId: string
  playerName: string
  /** Running score snapshot after this event */
  homeScore: number
  awayScore: number
  createdAt: string
}

// ─── Tournament structure ─────────────────────────────────────────────────────

export interface TournamentEdition {
  id: string
  name: string
  year: number
  isActive: boolean
  teams: Team[]
}

export interface StandingsRow {
  rank: number
  team: Team
  played: number
  won: number
  lost: number
  pointsFor: number
  pointsAgainst: number
  /** Points difference */
  diff: number
  /** Tournament points (2 for win, 1 for draw, 0 for loss) */
  pts: number
}

export interface TopScorer {
  rank: number
  player: Player
  team: Team
  matches: number
  totalPoints: number
  ppg: number
}
