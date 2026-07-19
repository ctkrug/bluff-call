import { describe, expect, it } from "vitest";
import {
  actingSeat,
  isTerminal,
  legalActions,
  resolveHand,
  type History,
} from "../../src/game/rules";

describe("actingSeat", () => {
  it("has the player act first", () => {
    expect(actingSeat([])).toBe("player");
  });

  it("has the opponent act after a check or a bet", () => {
    expect(actingSeat(["check"])).toBe("opponent");
    expect(actingSeat(["bet"])).toBe("opponent");
  });

  it("returns the player for the check-bet decision point", () => {
    expect(actingSeat(["check", "bet"])).toBe("player");
  });

  it("returns null once a hand is terminal", () => {
    expect(actingSeat(["check", "check"])).toBeNull();
    expect(actingSeat(["bet", "call"])).toBeNull();
    expect(actingSeat(["bet", "fold"])).toBeNull();
    expect(actingSeat(["check", "bet", "call"])).toBeNull();
    expect(actingSeat(["check", "bet", "fold"])).toBeNull();
  });
});

describe("legalActions", () => {
  it("never offers a raise — bet can only be met with call or fold", () => {
    expect(legalActions(["bet"])).toEqual(["call", "fold"]);
    expect(legalActions(["check", "bet"])).toEqual(["call", "fold"]);
  });

  it("offers check or bet at the opening decision", () => {
    expect(legalActions([])).toEqual(["check", "bet"]);
  });

  it("offers check or bet again after a check", () => {
    expect(legalActions(["check"])).toEqual(["check", "bet"]);
  });

  it("offers nothing once terminal", () => {
    expect(legalActions(["check", "check"])).toEqual([]);
    expect(legalActions(["bet", "fold"])).toEqual([]);
  });
});

describe("isTerminal", () => {
  it("is false at the start of a hand", () => {
    expect(isTerminal([])).toBe(false);
  });

  it("is false mid-hand", () => {
    expect(isTerminal(["check"])).toBe(false);
    expect(isTerminal(["check", "bet"])).toBe(false);
  });
});

describe("resolveHand — all five terminal sequences", () => {
  it("check,check: higher card wins the ante-only pot", () => {
    const win = resolveHand(["check", "check"], "K", "J");
    expect(win).toEqual({ winner: "player", showdown: true, playerNet: 1 });

    const lose = resolveHand(["check", "check"], "J", "K");
    expect(lose).toEqual({ winner: "opponent", showdown: true, playerNet: -1 });
  });

  it("check,bet,fold: opponent wins without showdown", () => {
    const result = resolveHand(["check", "bet", "fold"], "K", "J");
    expect(result).toEqual({ winner: "opponent", showdown: false, playerNet: -1 });
  });

  it("check,bet,call: higher card wins the full pot", () => {
    const win = resolveHand(["check", "bet", "call"], "K", "J");
    expect(win).toEqual({ winner: "player", showdown: true, playerNet: 2 });

    const lose = resolveHand(["check", "bet", "call"], "J", "K");
    expect(lose).toEqual({ winner: "opponent", showdown: true, playerNet: -2 });
  });

  it("bet,fold: player wins without showdown", () => {
    const result = resolveHand(["bet", "fold"], "J", "K");
    expect(result).toEqual({ winner: "player", showdown: false, playerNet: 1 });
  });

  it("bet,call: higher card wins the full pot", () => {
    const win = resolveHand(["bet", "call"], "Q", "J");
    expect(win).toEqual({ winner: "player", showdown: true, playerNet: 2 });

    const lose = resolveHand(["bet", "call"], "J", "Q");
    expect(lose).toEqual({ winner: "opponent", showdown: true, playerNet: -2 });
  });

  it("throws on a non-terminal history", () => {
    expect(() => resolveHand(["check"], "K", "J")).toThrow();
    expect(() => resolveHand([] as History, "K", "J")).toThrow();
  });
});
