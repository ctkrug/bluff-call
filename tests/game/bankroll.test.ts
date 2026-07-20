import { describe, expect, it } from "vitest";
import {
  applyHandResult,
  createBankroll,
  loadBankroll,
  saveBankroll,
  STARTING_BALANCE,
  type BankrollState,
  type KeyValueStorage,
} from "../../src/game/bankroll";

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

describe("createBankroll", () => {
  it("defaults to STARTING_BALANCE", () => {
    expect(createBankroll()).toEqual({
      balance: STARTING_BALANCE,
      startingBalance: STARTING_BALANCE,
    });
  });

  it("accepts a custom starting balance", () => {
    expect(createBankroll(50)).toEqual({ balance: 50, startingBalance: 50 });
  });
});

describe("applyHandResult", () => {
  it("changes balance by exactly the net amount", () => {
    const state = createBankroll(20);
    expect(applyHandResult(state, 2).balance).toBe(22);
    expect(applyHandResult(state, -1).balance).toBe(19);
  });

  it("does not mutate the input state", () => {
    const state = createBankroll(20);
    applyHandResult(state, 5);
    expect(state.balance).toBe(20);
  });

  it("handles a zero net change", () => {
    const state = createBankroll(20);
    expect(applyHandResult(state, 0).balance).toBe(20);
  });
});

describe("save/loadBankroll round trip", () => {
  it("loads back exactly what was saved", () => {
    const storage = memoryStorage();
    const state: BankrollState = { balance: 33, startingBalance: 20 };
    saveBankroll(state, storage);
    expect(loadBankroll(storage)).toEqual(state);
  });

  it("falls back to a fresh bankroll when nothing is stored", () => {
    const storage = memoryStorage();
    expect(loadBankroll(storage)).toEqual(createBankroll());
  });

  it("falls back on malformed JSON instead of throwing", () => {
    const storage = memoryStorage({ "bluff-call:bankroll:v1": "{not json" });
    expect(() => loadBankroll(storage)).not.toThrow();
    expect(loadBankroll(storage)).toEqual(createBankroll());
  });

  it("falls back when stored fields are missing or the wrong type", () => {
    const storage = memoryStorage({
      "bluff-call:bankroll:v1": JSON.stringify({ balance: "twenty" }),
    });
    expect(loadBankroll(storage)).toEqual(createBankroll());
  });

  it("falls back when the stored value is not an object", () => {
    const storage = memoryStorage({ "bluff-call:bankroll:v1": JSON.stringify(42) });
    expect(loadBankroll(storage)).toEqual(createBankroll());
  });

  it("respects a custom fallback", () => {
    const storage = memoryStorage();
    const customFallback = createBankroll(100);
    expect(loadBankroll(storage, customFallback)).toEqual(customFallback);
  });

  it("does not throw when persistent storage rejects a write", () => {
    const storage: KeyValueStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("storage disabled");
      },
    };
    expect(() => saveBankroll(createBankroll(), storage)).not.toThrow();
  });
});
