import { describe, expect, it } from "vitest";
import {
  accuracyPercent,
  createSessionStats,
  describeHistoryEntry,
  recordHand,
  type HandHistoryEntry,
} from "../../src/game/session";
import { buildReveal } from "../../src/game/reveal";

describe("createSessionStats", () => {
  it("starts with sessionHigh at the starting balance and zeroed counters", () => {
    expect(createSessionStats(20)).toEqual({
      handsPlayed: 0,
      playerDecisions: 0,
      playerDecisionsMatched: 0,
      sessionHigh: 20,
    });
  });
});

describe("recordHand", () => {
  it("counts player decisions and flags a match when probability >= 0.5", () => {
    // Player opens with the King: equilibrium bet probability is 3*alpha = 0.6 at alpha=0.2 -> matches.
    const reveal = buildReveal(["bet", "fold"], "K", "J", 0.2);
    const stats = createSessionStats(20);
    const { stats: next } = recordHand(stats, reveal, 21);
    expect(next.handsPlayed).toBe(1);
    expect(next.playerDecisions).toBe(1);
    expect(next.playerDecisionsMatched).toBe(1);
  });

  it("does not count a match when the player's action was the minority choice", () => {
    // Player checks (Q never bets, so checking matches), opponent bets, player calls.
    // Q's call probability at alpha=0.1 is 0.1 + 1/3 ≈ 0.433 (below 0.5), so calling is
    // the minority choice here — it should not count as a match.
    const reveal = buildReveal(["check", "bet", "call"], "Q", "K", 0.1);
    const stats = createSessionStats(20);
    const { stats: next } = recordHand(stats, reveal, 18);
    expect(next.playerDecisions).toBe(2);
    expect(next.playerDecisionsMatched).toBe(1);
  });

  it("raises sessionHigh and reports a milestone when the new balance exceeds it", () => {
    const stats = createSessionStats(20);
    const reveal = buildReveal(["check", "check"], "K", "J", 0.1);
    const { stats: next, milestoneReached } = recordHand(stats, reveal, 21);
    expect(milestoneReached).toBe(true);
    expect(next.sessionHigh).toBe(21);
  });

  it("does not report a milestone when the balance stays at or below the session high", () => {
    const stats = { ...createSessionStats(20), sessionHigh: 25 };
    const reveal = buildReveal(["check", "check"], "J", "K", 0.1);
    const { milestoneReached, stats: next } = recordHand(stats, reveal, 24);
    expect(milestoneReached).toBe(false);
    expect(next.sessionHigh).toBe(25);
  });

  it("accumulates across multiple hands rather than resetting", () => {
    let stats = createSessionStats(20);
    const revealA = buildReveal(["bet", "fold"], "K", "J", 0.2);
    const revealB = buildReveal(["check", "check"], "Q", "J", 0.2);
    ({ stats } = recordHand(stats, revealA, 21));
    ({ stats } = recordHand(stats, revealB, 22));
    expect(stats.handsPlayed).toBe(2);
  });
});

describe("accuracyPercent", () => {
  it("returns null when no player decisions have been recorded", () => {
    expect(accuracyPercent(createSessionStats(20))).toBeNull();
  });

  it("computes a rounded percentage", () => {
    const stats = {
      handsPlayed: 4,
      playerDecisions: 3,
      playerDecisionsMatched: 2,
      sessionHigh: 20,
    };
    expect(accuracyPercent(stats)).toBe(67);
  });

  it("returns 100 when every decision matched", () => {
    const stats = {
      handsPlayed: 2,
      playerDecisions: 2,
      playerDecisionsMatched: 2,
      sessionHigh: 20,
    };
    expect(accuracyPercent(stats)).toBe(100);
  });
});

describe("describeHistoryEntry", () => {
  it("includes both cards, the action sequence, and the outcome", () => {
    const entry: HandHistoryEntry = {
      index: 0,
      playerCard: "K",
      opponentCard: "J",
      history: ["bet", "fold"],
      winner: "player",
      showdown: false,
      playerNet: 1,
    };
    const line = describeHistoryEntry(entry);
    expect(line).toContain("King");
    expect(line).toContain("Jack");
    expect(line).toContain("bet");
    expect(line).toContain("fold");
    expect(line).toContain("You won");
    expect(line).toContain("+1");
  });

  it("formats a negative net without a leading plus", () => {
    const entry: HandHistoryEntry = {
      index: 1,
      playerCard: "J",
      opponentCard: "K",
      history: ["check", "check"],
      winner: "opponent",
      showdown: true,
      playerNet: -1,
    };
    expect(describeHistoryEntry(entry)).toContain("net -1");
  });
});
