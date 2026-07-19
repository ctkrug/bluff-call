import { describe, expect, it } from "vitest";
import { beats, dealHand, RANK_VALUE, RANKS } from "../../src/game/cards";
import { mulberry32 } from "../../src/game/rng";

describe("RANK_VALUE", () => {
  it("orders J < Q < K", () => {
    expect(RANK_VALUE.J).toBeLessThan(RANK_VALUE.Q);
    expect(RANK_VALUE.Q).toBeLessThan(RANK_VALUE.K);
  });
});

describe("beats", () => {
  it("returns true when the first rank outranks the second", () => {
    expect(beats("K", "J")).toBe(true);
    expect(beats("Q", "J")).toBe(true);
    expect(beats("K", "Q")).toBe(true);
  });

  it("returns false for equal or lower ranks", () => {
    expect(beats("J", "K")).toBe(false);
    expect(beats("J", "J")).toBe(false);
  });
});

describe("dealHand", () => {
  it("deals three distinct ranks across player, opponent, and undealt", () => {
    const rng = mulberry32(7);
    const deal = dealHand(rng);
    const dealt = [deal.player, deal.opponent, deal.undealt].sort();
    expect(dealt).toEqual([...RANKS].sort());
  });

  it("is deterministic for a given seed", () => {
    const dealA = dealHand(mulberry32(123));
    const dealB = dealHand(mulberry32(123));
    expect(dealA).toEqual(dealB);
  });

  it("produces every possible player/opponent pairing over many seeds", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 500; seed += 1) {
      const deal = dealHand(mulberry32(seed));
      seen.add(`${deal.player}${deal.opponent}`);
    }
    // 3 ranks, 2 distinct slots => 6 possible player/opponent pairings.
    expect(seen.size).toBe(6);
  });
});
