import { describe, expect, it } from "vitest";
import { createSoundEngine } from "../../src/ui/sound";
import type { KeyValueStorage } from "../../src/game/bankroll";

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

// jsdom (our test environment) does not implement AudioContext, which is
// exactly the "no audio hardware" case the design standard requires every
// WebAudio call site to be guarded against.
describe("createSoundEngine without AudioContext support", () => {
  it("never throws when playing any sound", () => {
    const engine = createSoundEngine(memoryStorage());
    expect(() => engine.playDeal()).not.toThrow();
    expect(() => engine.playFlip()).not.toThrow();
    expect(() => engine.playBet()).not.toThrow();
    expect(() => engine.playFold()).not.toThrow();
    expect(() => engine.playReveal()).not.toThrow();
    expect(() => engine.playWin()).not.toThrow();
  });

  it("starts unmuted by default", () => {
    const engine = createSoundEngine(memoryStorage());
    expect(engine.isMuted()).toBe(false);
  });

  it("toggling mute flips state and persists it to storage", () => {
    const storage = memoryStorage();
    const engine = createSoundEngine(storage);
    expect(engine.toggleMute()).toBe(true);
    expect(engine.isMuted()).toBe(true);
    expect(storage.getItem("bluff-call:muted")).toBe("true");

    expect(engine.toggleMute()).toBe(false);
    expect(storage.getItem("bluff-call:muted")).toBe("false");
  });

  it("reads initial mute state from storage", () => {
    const storage = memoryStorage({ "bluff-call:muted": "true" });
    const engine = createSoundEngine(storage);
    expect(engine.isMuted()).toBe(true);
  });

  it("does not play sounds while muted", () => {
    const storage = memoryStorage({ "bluff-call:muted": "true" });
    const engine = createSoundEngine(storage);
    expect(() => engine.playWin()).not.toThrow();
  });
});
