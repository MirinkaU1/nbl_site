// ─── Core entity interfaces ─────────────────────────────────────────────────

export type MatchStatus = "live" | "upcoming" | "finished" | "timeout";
export type MatchPeriod = "H1" | "H2";
export type Quarter = MatchPeriod;
export type ActionType =
  | "pts2"
  | "pts3"
  | "ft"
  | "foul"
  | "timeout"
  | "substitution";

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: "PG" | "SG" | "SF" | "PF" | "C";
  teamId: string;
  photoUrl?: string;
  // Career aggregates
  careerPoints: number;
  careerMatches: number;
  /** Points per game across all editions */
  careerPpg: number;
  /** Edition-level stats (keyed by edition id) */
  editionStats: Record<string, EditionStat>;
}

export interface EditionStat {
  editionId: string;
  editionName: string;
  matches: number;
  totalPoints: number;
  ppg: number;
  fouls: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string; // 2-3 char abbreviation
  city: string;
  logoUrl?: string;
  primaryColor: string;
}

// ─── Match & live-game interfaces ────────────────────────────────────────────

export interface MatchTeamState {
  team: Team;
  score: number;
  fouls: number;
  timeoutsLeft: number;
  /** Players currently on court */
  onCourt: PlayerMatchStat[];
  /** Players on bench */
  bench: PlayerMatchStat[];
}

export interface PlayerMatchStat {
  player: Player;
  points: number;
  fouls: number;
  assists: number;
  rebounds: number;
  isOnCourt: boolean;
}

export interface Match {
  id: string;
  status: MatchStatus;
  quarter: Quarter;
  /** Seconds remaining in current half */
  clockSeconds: number;
  homeState: MatchTeamState;
  awayState: MatchTeamState;
  possession: "home" | "away";
  venue: string;
  scheduledAt: string; // ISO-8601
  tags: string[];
  ticketPrice?: string;
  /** Ordered list of game events */
  events: GameEvent[];
}

// ─── Game event (action) ──────────────────────────────────────────────────────

export interface GameEvent {
  id: string;
  matchId: string;
  quarter: Quarter;
  /** Seconds remaining in the half when the event happened */
  clockSeconds: number;
  type: ActionType;
  /** Points value (0 for foul / timeout / sub) */
  value: number;
  team: "home" | "away";
  playerId: string;
  playerName: string;
  /** Running score snapshot after this event */
  homeScore: number;
  awayScore: number;
  createdAt: string;
}

// ─── Tournament structure ─────────────────────────────────────────────────────

export interface TournamentEdition {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
  teams: Team[];
}

export interface StandingsRow {
  rank: number;
  team: Team;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  /** Points difference */
  diff: number;
  /** Tournament points (2 for win, 1 for draw, 0 for loss) */
  pts: number;
}

export interface TopScorer {
  rank: number;
  player: Player;
  team: Team;
  matches: number;
  totalPoints: number;
  ppg: number;
}

export type LiveTeamSide = "home" | "away";
export type LiveEventType = ActionType;

export interface LiveSnapshot {
  matchId: string;
  status: MatchStatus;
  quarter: Quarter;
  clockSeconds: number;
  version: number;
  updatedAt: string;
  score: {
    home: number;
    away: number;
  };
  fouls: {
    home: number;
    away: number;
  };
}

export interface LivePublicMatch {
  id: string;
  status: MatchStatus;
  quarter: Quarter;
  clockSeconds: number;
  updatedAt: string;
  venue: string;
  scheduledAt: string;
  tags: string[];
  ticketPrice?: string;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    code: string;
    city: string;
    score: number;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    code: string;
    city: string;
    score: number;
  };
}

export interface LivePlayerStatSnapshot {
  playerId: string;
  teamSide: LiveTeamSide;
  points: number;
  fouls: number;
}

export interface LiveEventRequest {
  eventId?: string;
  matchId: string;
  expectedVersion: number;
  quarter: Quarter;
  clockSeconds: number;
  eventType: LiveEventType;
  teamSide: LiveTeamSide;
  playerId: string;
  playerName: string;
  payload?: Record<string, unknown>;
}

export interface LiveEventSuccessResponse {
  ok: true;
  duplicate: boolean;
  eventId: string;
  snapshot: LiveSnapshot;
}

export interface LiveEventErrorResponse {
  ok: false;
  error: string;
  details?: unknown;
  currentVersion?: number;
}

export type LiveEventResponse =
  | LiveEventSuccessResponse
  | LiveEventErrorResponse;

export interface LiveMatchSnapshotSuccessResponse {
  ok: true;
  snapshot: LiveSnapshot;
  playerStats: LivePlayerStatSnapshot[];
  match?: LivePublicMatch;
  events?: GameEvent[];
}

export interface LiveMatchSnapshotErrorResponse {
  ok: false;
  error: string;
}

export type LiveMatchSnapshotResponse =
  | LiveMatchSnapshotSuccessResponse
  | LiveMatchSnapshotErrorResponse;

export interface LiveOverviewSuccessResponse {
  ok: true;
  matches: LivePublicMatch[];
  standings: StandingsRow[];
  topScorers: TopScorer[];
}

export interface LiveOverviewErrorResponse {
  ok: false;
  error: string;
}

export type LiveOverviewResponse =
  | LiveOverviewSuccessResponse
  | LiveOverviewErrorResponse;

export type RegistrationStatus =
  | "pending_review"
  | "approved"
  | "waitlist"
  | "rejected";

export type RegistrationPaymentStatus =
  | "unpaid"
  | "partial"
  | "paid"
  | "refunded";

export interface RegistrationPlayerInput {
  fullName: string;
  jerseyNumber?: number;
  position?: "PG" | "SG" | "SF" | "PF" | "C" | "N/A";
  photoUrl?: string;
  isCaptain?: boolean;
}

export interface TeamRegistrationInput {
  category: "Junior" | "D1";
  teamName: string;
  captainName: string;
  phone: string;
  email?: string;
  commune: string;
  playerCount: number;
  source?: string;
  notes?: string;
  players: RegistrationPlayerInput[];
}

export interface TeamRegistrationRecord {
  id: string;
  category: "Junior" | "D1";
  teamName: string;
  captainName: string;
  phone: string;
  email?: string | null;
  commune: string;
  playerCount: number;
  source?: string | null;
  notes?: string | null;
  status: RegistrationStatus;
  paymentStatus: RegistrationPaymentStatus;
  registrationFeeCfa: number;
  amountPaidCfa: number;
  createdAt: string;
  updatedAt: string;
  players?: RegistrationPlayerInput[];
}

export interface TeamRegistrationCreateResponse {
  ok: true;
  registration: Pick<
    TeamRegistrationRecord,
    "id" | "status" | "paymentStatus" | "createdAt"
  >;
}

export interface TeamRegistrationCreateErrorResponse {
  ok: false;
  error: string;
  details?: unknown;
}

export type TeamRegistrationCreateApiResponse =
  | TeamRegistrationCreateResponse
  | TeamRegistrationCreateErrorResponse;

export interface RegistrationSpotsResponse {
  ok: true;
  categories: Record<
    "Junior" | "D1",
    {
      capacity: number;
      activeRegistrations: number;
      approved: number;
      remaining: number;
    }
  >;
}

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string | null;
  priceCfa: number;
  stockQuantity: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMemberRecord {
  id: string;
  fullName: string;
  role: string;
  phone?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTeamRecord {
  id: string;
  registrationId?: string | null;
  name: string;
  category: "Junior" | "D1";
  city?: string | null;
  logoUrl?: string | null;
  status: "active" | "inactive";
  playerCount: number;
  createdAt: string;
}

export interface AdminMatchRecord {
  id: string;
  status: MatchStatus;
  quarter: Quarter;
  clockSeconds: number;
  homeTeamId: string;
  awayTeamId: string;
  venue?: string | null;
  scheduledAt?: string | null;
  ticketPrice?: string | null;
  tags: string[];
  updatedAt: string;
}

export interface AdminOperationsResponse {
  ok: true;
  summary: {
    registrationsPending: number;
    registrationsPaid: number;
    teamsActive: number;
    playersActive: number;
    staffActive: number;
    productsActive: number;
    upcomingMatches: number;
  };
  registrations: TeamRegistrationRecord[];
  teams: AdminTeamRecord[];
  staff: StaffMemberRecord[];
  products: ProductRecord[];
  matches: AdminMatchRecord[];
}

export interface AdminErrorResponse {
  ok: false;
  error: string;
}
