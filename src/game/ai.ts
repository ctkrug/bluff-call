import type { Rank } from "./cards";
import { equilibriumDistribution } from "./equilibrium";
import type { Action, History } from "./rules";
import type { Rng } from "./rng";

/**
 * Samples the opponent's next action from the true equilibrium distribution
 * for its card and the current history — not the single most-likely action.
 * This is what makes the AI's bluffing genuinely probabilistic rather than
 * scripted.
 */
export function sampleEquilibriumAction(
  card: Rank,
  history: History,
  alpha: number,
  rng: Rng,
): Action {
  const distribution = equilibriumDistribution(card, history, alpha);
  const roll = rng();
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new RangeError(`RNG must return a finite value in [0, 1), got ${roll}`);
  }
  let cumulative = 0;
  for (const { action, probability } of distribution) {
    cumulative += probability;
    if (roll < cumulative) return action;
  }
  // Floating-point rounding can leave `roll` fractionally above the summed
  // probabilities; fall back to the last action rather than returning undefined.
  return distribution[distribution.length - 1].action;
}
