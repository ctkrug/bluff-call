import { beats, type Rank } from "./cards";

export type Action = "check" | "bet" | "call" | "fold";

/** The sequence of actions taken so far this hand, in order. */
export type History = readonly Action[];

export type Seat = "player" | "opponent";

/** Every history that can be reached through Kuhn poker's betting tree. */
function isReachableHistory(history: History): boolean {
  const sequence = history.join(",");
  return [
    "",
    "check",
    "bet",
    "check,check",
    "check,bet",
    "bet,call",
    "bet,fold",
    "check,bet,call",
    "check,bet,fold",
  ].includes(sequence);
}

/**
 * Who acts next for a given history, or null if the hand is over.
 * The player always acts first each hand (see docs/ARCHITECTURE.md).
 */
export function actingSeat(history: History): Seat | null {
  if (!isReachableHistory(history)) return null;
  if (history.length === 0) return "player";
  if (history.length === 1) return "opponent";
  if (history.length === 2 && history[0] === "check" && history[1] === "bet") {
    return "player";
  }
  return null;
}

export function isTerminal(history: History): boolean {
  return isReachableHistory(history) && history.length > 0 && actingSeat(history) === null;
}

/**
 * The actions legal at this history. Kuhn poker has no raise, so a bet can
 * only ever be met with call/fold — betting again is never offered.
 */
export function legalActions(history: History): readonly Action[] {
  const seat = actingSeat(history);
  if (!seat) return [];
  if (history.length === 0) return ["check", "bet"];
  const opening = history[0];
  if (history.length === 1) {
    return opening === "check" ? ["check", "bet"] : ["call", "fold"];
  }
  // history.length === 2, only reachable via ["check", "bet"]
  return ["call", "fold"];
}

export interface HandResult {
  readonly winner: Seat;
  readonly showdown: boolean;
  /** Net chip change for the player: positive = player gains, negative = loses. */
  readonly playerNet: number;
}

/** Resolves a completed hand's winner and payoff. Throws if history isn't terminal. */
export function resolveHand(
  history: History,
  playerCard: Rank,
  opponentCard: Rank,
): HandResult {
  if (!isTerminal(history)) {
    throw new Error(`resolveHand called on non-terminal history: [${history.join(",")}]`);
  }

  const sequence = history.join(",");
  const playerWinsShowdown = beats(playerCard, opponentCard);

  switch (sequence) {
    case "check,check":
      return {
        winner: playerWinsShowdown ? "player" : "opponent",
        showdown: true,
        playerNet: playerWinsShowdown ? 1 : -1,
      };
    case "check,bet,fold":
      return { winner: "opponent", showdown: false, playerNet: -1 };
    case "check,bet,call":
      return {
        winner: playerWinsShowdown ? "player" : "opponent",
        showdown: true,
        playerNet: playerWinsShowdown ? 2 : -2,
      };
    case "bet,fold":
      return { winner: "player", showdown: false, playerNet: 1 };
    case "bet,call":
      return {
        winner: playerWinsShowdown ? "player" : "opponent",
        showdown: true,
        playerNet: playerWinsShowdown ? 2 : -2,
      };
    default:
      throw new Error(`Unreachable terminal history: [${history.join(",")}]`);
  }
}
