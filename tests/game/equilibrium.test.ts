import { describe, expect, it } from "vitest";
import { RANKS, type Rank } from "../../src/game/cards";
import type { History } from "../../src/game/rules";
import {
  assertValidAlpha,
  decisionPointFor,
  equilibriumDistribution,
  equilibriumProbabilityOf,
  MAX_ALPHA,
  MIN_ALPHA,
} from "../../src/game/equilibrium";

const HISTORIES: readonly History[] = [
  [],
  ["check"],
  ["bet"],
  ["check", "bet"],
];

describe("decisionPointFor", () => {
  it("names all four reachable decision points", () => {
    expect(decisionPointFor([])).toBe("player_open");
    expect(decisionPointFor(["check"])).toBe("opponent_facing_check");
    expect(decisionPointFor(["bet"])).toBe("opponent_facing_bet");
    expect(decisionPointFor(["check", "bet"])).toBe("player_facing_check_bet");
  });

  it("returns null at terminal histories", () => {
    expect(decisionPointFor(["check", "check"])).toBeNull();
    expect(decisionPointFor(["bet", "call"])).toBeNull();
  });
});

describe("assertValidAlpha", () => {
  it("accepts the full closed range", () => {
    expect(() => assertValidAlpha(MIN_ALPHA)).not.toThrow();
    expect(() => assertValidAlpha(MAX_ALPHA)).not.toThrow();
    expect(() => assertValidAlpha(1 / 6)).not.toThrow();
  });

  it("rejects values outside [0, 1/3]", () => {
    expect(() => assertValidAlpha(-0.01)).toThrow(RangeError);
    expect(() => assertValidAlpha(0.5)).toThrow(RangeError);
    expect(() => assertValidAlpha(Number.NaN)).toThrow(RangeError);
  });
});

describe("equilibriumDistribution", () => {
  it("bets the King with probability 3*alpha and the Jack with alpha at the opening decision", () => {
    for (const alpha of [0, 0.1, 1 / 3]) {
      expect(equilibriumProbabilityOf("bet", "K", [], alpha)).toBeCloseTo(3 * alpha, 10);
      expect(equilibriumProbabilityOf("bet", "J", [], alpha)).toBeCloseTo(alpha, 10);
    }
  });

  it("never bets the Queen on the opening action", () => {
    for (const alpha of [0, 0.15, 1 / 3]) {
      expect(equilibriumProbabilityOf("bet", "Q", [], alpha)).toBe(0);
    }
  });

  it("sums to 1 and stays within [0, 1] for all 12 card x decision-point combinations", () => {
    for (const history of HISTORIES) {
      for (const card of RANKS) {
        for (const alpha of [0, 1 / 12, 1 / 3]) {
          const distribution = equilibriumDistribution(card as Rank, history, alpha);
          const total = distribution[0].probability + distribution[1].probability;
          expect(total).toBeCloseTo(1, 10);
          for (const entry of distribution) {
            expect(entry.probability).toBeGreaterThanOrEqual(0);
            expect(entry.probability).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });

  it("throws at a terminal history", () => {
    expect(() => equilibriumDistribution("J", ["check", "check"], 0.1)).toThrow();
  });

  it("throws for an out-of-range alpha", () => {
    expect(() => equilibriumDistribution("J", [], 0.5)).toThrow(RangeError);
  });

  it("the Jack with a King's worth of bad luck never calls a check-raise", () => {
    // Holding the worst card, calling a bet can never win at showdown, so
    // the equilibrium always folds regardless of alpha.
    expect(equilibriumProbabilityOf("call", "J", ["check", "bet"], 1 / 3)).toBe(0);
  });

  it("the King always calls a check-raise, since it always wins showdown", () => {
    expect(equilibriumProbabilityOf("call", "K", ["check", "bet"], 0)).toBe(1);
  });
});
