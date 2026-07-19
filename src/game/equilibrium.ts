import type { Rank } from "./cards";
import type { Action, History } from "./rules";

/**
 * Kuhn poker's Nash equilibrium is a one-parameter family, alpha in [0, 1/3],
 * controlling how often the player bluffs the Jack (and, tied to it, bets
 * the King) on the opening action. Every other decision in the game is
 * pinned down by indifference conditions once alpha is fixed — see
 * docs/ARCHITECTURE.md for the derivation and citations.
 */
export const MIN_ALPHA = 0;
export const MAX_ALPHA = 1 / 3;

export function assertValidAlpha(alpha: number): void {
  if (Number.isNaN(alpha) || alpha < MIN_ALPHA || alpha > MAX_ALPHA) {
    throw new RangeError(
      `alpha must be within [${MIN_ALPHA}, ${MAX_ALPHA.toFixed(4)}], got ${alpha}`,
    );
  }
}

export type DecisionPoint =
  | "player_open"
  | "player_facing_check_bet"
  | "opponent_facing_check"
  | "opponent_facing_bet";

/** Maps a betting history to the named decision point it represents, if any. */
export function decisionPointFor(history: History): DecisionPoint | null {
  if (history.length === 0) return "player_open";
  if (history.length === 1) {
    return history[0] === "check" ? "opponent_facing_check" : "opponent_facing_bet";
  }
  if (history.length === 2 && history[0] === "check" && history[1] === "bet") {
    return "player_facing_check_bet";
  }
  return null;
}

/** The "aggressive" action at each decision point — the one whose probability alpha controls. */
const AGGRESSIVE_ACTION: Readonly<Record<DecisionPoint, Action>> = {
  player_open: "bet",
  player_facing_check_bet: "call",
  opponent_facing_check: "bet",
  opponent_facing_bet: "call",
};

/** The complementary "passive" action at each decision point. */
const PASSIVE_ACTION: Readonly<Record<DecisionPoint, Action>> = {
  player_open: "check",
  player_facing_check_bet: "fold",
  opponent_facing_check: "check",
  opponent_facing_bet: "fold",
};

/** The action whose probability alpha (or a fixed indifference value) controls at this decision point. */
export function aggressiveActionFor(decisionPoint: DecisionPoint): Action {
  return AGGRESSIVE_ACTION[decisionPoint];
}

type AlphaFn = (alpha: number) => number;

/** Probability of the aggressive action, by decision point and card held. */
const AGGRESSIVE_PROBABILITY: Readonly<Record<DecisionPoint, Readonly<Record<Rank, AlphaFn>>>> = {
  // Betting the worst card is a pure bluff; betting the best card is value,
  // and the equilibrium ties its frequency to the bluff frequency at 3*alpha
  // so the opponent can never profitably distinguish a bet from a check.
  player_open: { J: (a) => a, Q: () => 0, K: (a) => 3 * a },
  // Holding the Jack, a raise can never win at showdown, so calling is never
  // correct. Holding the King, calling is always correct. The Queen is the
  // only card where the decision is genuinely mixed.
  player_facing_check_bet: { J: () => 0, Q: (a) => a + 1 / 3, K: () => 1 },
  // The opponent's response to a check or a bet is pinned to a single best
  // response by the indifference conditions above — it does not vary with
  // alpha.
  opponent_facing_check: { J: () => 1 / 3, Q: () => 0, K: () => 1 },
  opponent_facing_bet: { J: () => 0, Q: () => 1 / 3, K: () => 1 },
};

export interface ActionProbability {
  readonly action: Action;
  readonly probability: number;
}

/**
 * Returns the equilibrium's full probability distribution over the legal
 * actions at this history, for the given card and bluffing frequency alpha.
 * Throws if the history is terminal (no decision to make) or alpha is
 * outside [0, 1/3].
 */
export function equilibriumDistribution(
  card: Rank,
  history: History,
  alpha: number,
): readonly [ActionProbability, ActionProbability] {
  assertValidAlpha(alpha);
  const decisionPoint = decisionPointFor(history);
  if (!decisionPoint) {
    throw new Error(`No decision point at terminal history: [${history.join(",")}]`);
  }
  const probability = AGGRESSIVE_PROBABILITY[decisionPoint][card](alpha);
  return [
    { action: AGGRESSIVE_ACTION[decisionPoint], probability },
    { action: PASSIVE_ACTION[decisionPoint], probability: 1 - probability },
  ];
}

/** Convenience accessor: the equilibrium probability of one specific action. */
export function equilibriumProbabilityOf(
  action: Action,
  card: Rank,
  history: History,
  alpha: number,
): number {
  const distribution = equilibriumDistribution(card, history, alpha);
  const match = distribution.find((entry) => entry.action === action);
  return match?.probability ?? 0;
}
