import type { Rank } from "./cards";
import {
  aggressiveActionFor,
  decisionPointFor,
  equilibriumDistribution,
  type DecisionPoint,
} from "./equilibrium";
import { actingSeat, resolveHand, type Action, type History, type Seat } from "./rules";

export const RANK_NAME: Readonly<Record<Rank, string>> = {
  J: "Jack",
  Q: "Queen",
  K: "King",
};

export interface RevealDecision {
  readonly actor: Seat;
  readonly card: Rank;
  readonly decisionPoint: DecisionPoint;
  readonly actionTaken: Action;
  /** Equilibrium probability of the action actually taken. */
  readonly probability: number;
  /** True when the actor bet or called with the Jack — the only card that can never win a bluff-free showdown. */
  readonly isBluff: boolean;
  readonly sentence: string;
}

export interface Reveal {
  readonly headline: string;
  readonly decisions: readonly RevealDecision[];
}

function actorLabel(actor: Seat): string {
  return actor === "player" ? "You" : "The AI";
}

function possessive(actor: Seat): string {
  return actor === "player" ? "your" : "its";
}

function describeDecision(
  actor: Seat,
  card: Rank,
  decisionPoint: DecisionPoint,
  actionTaken: Action,
  probability: number,
): string {
  const pct = Math.round(probability * 100);
  const rankName = RANK_NAME[card];
  const aggressive = aggressiveActionFor(decisionPoint);
  const verb = aggressive === "bet" ? "bets" : "calls";
  return (
    `Holding the ${rankName}, ${actorLabel(actor).toLowerCase()} the equilibrium ` +
    `${verb} ${pct}% of the time; ${possessive(actor)} actual play was to ${actionTaken}.`
  );
}

/**
 * Builds the post-hand reveal: for every decision point that occurred,
 * states the equilibrium's exact frequency for the action taken, in plain
 * language. This is the product's wow moment — the reveal is built from the
 * same equilibrium module the AI samples from, so the numbers are always
 * the true solved frequencies, never a summary or approximation.
 */
export function buildReveal(
  history: History,
  playerCard: Rank,
  opponentCard: Rank,
  alpha: number,
): Reveal {
  // Throws if history isn't terminal — a reveal only makes sense for a
  // completed hand, so this doubles as the input-boundary validation.
  const handResult = resolveHand(history, playerCard, opponentCard);

  const decisions: RevealDecision[] = [];

  for (let i = 0; i < history.length; i += 1) {
    const prefix = history.slice(0, i);
    const actor = actingSeat(prefix);
    const decisionPoint = decisionPointFor(prefix);
    if (!actor || !decisionPoint) {
      throw new Error(`Malformed history passed to buildReveal: [${history.join(",")}]`);
    }
    const card = actor === "player" ? playerCard : opponentCard;
    const actionTaken = history[i];
    const distribution = equilibriumDistribution(card, prefix, alpha);
    const match = distribution.find((entry) => entry.action === actionTaken);
    const probability = match?.probability ?? 0;
    // A bluff is specifically betting a hand that cannot win at showdown —
    // calling with the Jack isn't a bluff, it's a (equilibrium-incorrect)
    // hero call, so only "bet" counts here, not the decision point's
    // generic aggressive action.
    const isBluff = card === "J" && actionTaken === "bet";

    decisions.push({
      actor,
      card,
      decisionPoint,
      actionTaken,
      probability,
      isBluff,
      sentence: describeDecision(actor, card, decisionPoint, actionTaken, probability),
    });
  }

  const opponentBluff = decisions.find((d) => d.actor === "opponent" && d.isBluff);
  const headline = buildHeadline(opponentBluff, handResult.winner);

  return { headline, decisions };
}

function buildHeadline(opponentBluff: RevealDecision | undefined, winner: Seat): string {
  if (!opponentBluff) {
    return "Here's what the equilibrium says about this hand.";
  }
  const pct = Math.round(opponentBluff.probability * 100);
  if (winner === "opponent") {
    return `You lost to a bluff. The AI's Jack takes that line ${pct}% of the time. Here's the proof.`;
  }
  return `The AI tried to bluff with the Jack ${pct}% of the time here, but it didn't get there.`;
}
