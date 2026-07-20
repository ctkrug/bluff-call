import type { Rng } from "./rng";

/** Kuhn poker's 3-card deck: Jack (lowest) through King (highest). */
export type Rank = "J" | "Q" | "K";

export const RANKS: readonly Rank[] = ["J", "Q", "K"];

export const RANK_VALUE: Readonly<Record<Rank, number>> = {
  J: 1,
  Q: 2,
  K: 3,
};

export function beats(a: Rank, b: Rank): boolean {
  return RANK_VALUE[a] > RANK_VALUE[b];
}

export interface Deal {
  readonly player: Rank;
  readonly opponent: Rank;
  /** The one card that stays face-down in the deck this hand. */
  readonly undealt: Rank;
}

/**
 * Deals one card to the player and one to the opponent from the 3-card deck.
 * The third card stays undealt, per Kuhn poker rules.
 */
export function dealHand(rng: Rng): Deal {
  const shuffled = [...RANKS];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const roll = rng();
    if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
      throw new RangeError(`RNG must return a finite value in [0, 1), got ${roll}`);
    }
    const j = Math.floor(roll * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j] as Rank, shuffled[i] as Rank];
  }
  const [player, opponent, undealt] = shuffled as [Rank, Rank, Rank];
  return { player, opponent, undealt };
}
