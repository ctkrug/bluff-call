import { RANK_NAME } from "./reveal";
import type { Rank } from "./cards";
import type { History, Seat } from "./rules";
import type { Reveal } from "./reveal";

export interface SessionStats {
  readonly handsPlayed: number;
  readonly playerDecisions: number;
  readonly playerDecisionsMatched: number;
  readonly sessionHigh: number;
}

export function createSessionStats(startingBalance: number): SessionStats {
  return {
    handsPlayed: 0,
    playerDecisions: 0,
    playerDecisionsMatched: 0,
    sessionHigh: startingBalance,
  };
}

export interface RecordHandResult {
  readonly stats: SessionStats;
  readonly milestoneReached: boolean;
}

/**
 * Folds one completed hand into running session stats. A player decision
 * "matches" the equilibrium when the action taken was the majority-
 * probability choice at that decision point (probability >= 0.5) — the
 * closest single-hand proxy for "did you play the mathematically favored
 * side of this decision."
 */
export function recordHand(
  stats: SessionStats,
  reveal: Reveal,
  newBalance: number,
): RecordHandResult {
  const playerDecisions = reveal.decisions.filter((d) => d.actor === "player");
  const matched = playerDecisions.filter((d) => d.probability >= 0.5).length;

  const nextStats: SessionStats = {
    handsPlayed: stats.handsPlayed + 1,
    playerDecisions: stats.playerDecisions + playerDecisions.length,
    playerDecisionsMatched: stats.playerDecisionsMatched + matched,
    sessionHigh: Math.max(stats.sessionHigh, newBalance),
  };

  return { stats: nextStats, milestoneReached: newBalance > stats.sessionHigh };
}

/** Percentage of player decisions that matched the equilibrium's favored action, or null with no data yet. */
export function accuracyPercent(stats: SessionStats): number | null {
  if (stats.playerDecisions === 0) return null;
  return Math.round((stats.playerDecisionsMatched / stats.playerDecisions) * 100);
}

export interface HandHistoryEntry {
  readonly index: number;
  readonly playerCard: Rank;
  readonly opponentCard: Rank;
  readonly history: History;
  readonly winner: Seat;
  readonly showdown: boolean;
  readonly playerNet: number;
}

/** A one-line summary detailed enough to reconstruct the hand without replaying it. */
export function describeHistoryEntry(entry: HandHistoryEntry): string {
  const sequence = entry.history.join(" → ");
  const resolution = entry.showdown ? "showdown" : "fold";
  const outcome = entry.winner === "player" ? "You won" : "AI won";
  const net = entry.playerNet > 0 ? `+${entry.playerNet}` : `${entry.playerNet}`;
  return (
    `${outcome} by ${resolution} · you: ${RANK_NAME[entry.playerCard]}, ` +
    `AI: ${RANK_NAME[entry.opponentCard]} · ${sequence} · net ${net}`
  );
}
