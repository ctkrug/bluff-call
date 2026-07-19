import { describe, expect, it } from "vitest";
import { buildReveal } from "../../src/game/reveal";

describe("buildReveal", () => {
  it("states a specific numeric frequency for every decision in the hand", () => {
    const reveal = buildReveal(["check", "check"], "K", "J", 0.15);
    expect(reveal.decisions).toHaveLength(2);
    for (const decision of reveal.decisions) {
      expect(decision.sentence).toMatch(/\d+%/);
    }
  });

  it("names the bluffing frequency when the player loses to an opponent bluff", () => {
    // Opponent (Jack) bets into the player's check, player calls, opponent
    // wins at showdown despite holding the worst card: a pure bluff.
    const reveal = buildReveal(["check", "bet", "call"], "Q", "J", 0.2);
    const bluffDecision = reveal.decisions.find((d) => d.isBluff);
    expect(bluffDecision).toBeDefined();
    expect(bluffDecision?.actor).toBe("opponent");
    expect(reveal.headline).toContain("bluff");
    expect(reveal.headline).toMatch(/\d+%/);
  });

  it("does not label a value bet with the King as a bluff", () => {
    const reveal = buildReveal(["bet", "call"], "K", "J", 0.1);
    expect(reveal.decisions.some((d) => d.isBluff)).toBe(false);
    expect(reveal.headline).not.toContain("bluff");
  });

  it("uses a generic headline when the hand had no bluff", () => {
    const reveal = buildReveal(["check", "check"], "K", "Q", 0.1);
    expect(reveal.headline).toBe("Here's what the equilibrium says about this hand.");
  });

  it("credits the player for catching a bluff rather than saying they lost to it", () => {
    // Player checks, opponent bluffs the Jack into a bet, player calls and wins.
    const reveal = buildReveal(["check", "bet", "call"], "K", "J", 0.25);
    expect(reveal.headline).not.toContain("lost");
    expect(reveal.headline.toLowerCase()).toContain("bluff");
  });

  it("throws on a non-terminal history rather than returning a partial reveal", () => {
    expect(() => buildReveal(["check"], "K", "J", 0.1)).toThrow();
  });

  it("produces one decision per action for a three-action hand", () => {
    const reveal = buildReveal(["check", "bet", "fold"], "J", "K", 0.1);
    expect(reveal.decisions.map((d) => d.actionTaken)).toEqual(["check", "bet", "fold"]);
  });
});
