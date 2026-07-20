import { describe, expect, it } from "vitest";
import { sampleEquilibriumAction } from "../../src/game/ai";
import { mulberry32 } from "../../src/game/rng";

describe("sampleEquilibriumAction", () => {
  it("is deterministic and reproducible for a given seed", () => {
    const runSequence = () => {
      const rng = mulberry32(99);
      return Array.from({ length: 20 }, () =>
        sampleEquilibriumAction("J", [], 0.2, rng),
      );
    };
    expect(runSequence()).toEqual(runSequence());
  });

  it("always returns fold for the Jack facing a check-raise, regardless of the roll", () => {
    // Probability of call is 0 here, so every possible roll must fold.
    for (const seed of [0, 1, 2, 3, 4, 5]) {
      const rng = mulberry32(seed);
      expect(sampleEquilibriumAction("J", ["check", "bet"], 0.1, rng)).toBe("fold");
    }
  });

  it("always returns call for the King facing a check-raise", () => {
    for (const seed of [0, 1, 2, 3, 4, 5]) {
      const rng = mulberry32(seed);
      expect(sampleEquilibriumAction("K", ["check", "bet"], 0.1, rng)).toBe("call");
    }
  });

  it("converges to alpha over a large sample of Jack opening bluffs", () => {
    const alpha = 0.2;
    const rng = mulberry32(2024);
    const trials = 10_000;
    let bets = 0;
    for (let i = 0; i < trials; i += 1) {
      if (sampleEquilibriumAction("J", [], alpha, rng) === "bet") bets += 1;
    }
    const observedRate = bets / trials;
    expect(Math.abs(observedRate - alpha)).toBeLessThan(0.02);
  });

  it("converges to 3*alpha over a large sample of King opening bets", () => {
    const alpha = 0.1;
    const rng = mulberry32(4096);
    const trials = 10_000;
    let bets = 0;
    for (let i = 0; i < trials; i += 1) {
      if (sampleEquilibriumAction("K", [], alpha, rng) === "bet") bets += 1;
    }
    const observedRate = bets / trials;
    expect(Math.abs(observedRate - 3 * alpha)).toBeLessThan(0.02);
  });

  it.each([Number.NaN, -0.01, 1, Number.POSITIVE_INFINITY])(
    "rejects an out-of-range RNG value (%s)",
    (roll) => {
      expect(() => sampleEquilibriumAction("J", [], 0.2, () => roll)).toThrow(RangeError);
    },
  );
});
