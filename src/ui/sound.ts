import type { KeyValueStorage } from "../game/bankroll";

const MUTE_KEY = "bluff-call:muted";

type ToneShape = "sine" | "triangle" | "square" | "sawtooth";

interface ToneSpec {
  readonly freq: number;
  readonly duration: number;
  readonly shape?: ToneShape;
  readonly gain?: number;
  readonly delay?: number;
  readonly slideTo?: number;
}

export interface SoundEngine {
  playDeal(): void;
  playFlip(): void;
  playBet(): void;
  playFold(): void;
  playReveal(): void;
  playWin(): void;
  toggleMute(): boolean;
  isMuted(): boolean;
}

/** window.AudioContext is absent under jsdom/SSR — every method below no-ops gracefully in that case. */
type AudioContextCtor = typeof AudioContext;

function resolveAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function readMuted(storage: KeyValueStorage): boolean {
  try {
    return storage.getItem(MUTE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeMuted(storage: KeyValueStorage, muted: boolean): void {
  try {
    storage.setItem(MUTE_KEY, String(muted));
  } catch {
    // Storage can throw in private-browsing edge cases; muting is a nicety, not critical.
  }
}

export function createSoundEngine(storage: KeyValueStorage): SoundEngine {
  const Ctor = resolveAudioContextCtor();
  let ctx: AudioContext | null = null;
  let muted = readMuted(storage);

  function ensureContext(): AudioContext | null {
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }

  function playTone(spec: ToneSpec): void {
    if (muted) return;
    const audio = ensureContext();
    if (!audio) return;

    const start = audio.currentTime + (spec.delay ?? 0);
    const osc = audio.createOscillator();
    const gainNode = audio.createGain();
    osc.type = spec.shape ?? "sine";
    osc.frequency.setValueAtTime(spec.freq, start);
    if (spec.slideTo !== undefined) {
      osc.frequency.linearRampToValueAtTime(spec.slideTo, start + spec.duration);
    }

    const peak = spec.gain ?? 0.08;
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(peak, start + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + spec.duration);

    osc.connect(gainNode).connect(audio.destination);
    osc.start(start);
    osc.stop(start + spec.duration + 0.02);
  }

  function playSequence(specs: readonly ToneSpec[]): void {
    for (const spec of specs) playTone(spec);
  }

  return {
    playDeal(): void {
      playTone({ freq: 620, duration: 0.08, shape: "triangle", gain: 0.05 });
    },
    playFlip(): void {
      playTone({ freq: 480, duration: 0.09, shape: "triangle", slideTo: 720, gain: 0.05 });
    },
    playBet(): void {
      playTone({ freq: 220, duration: 0.09, shape: "square", gain: 0.06 });
    },
    playFold(): void {
      playTone({ freq: 500, duration: 0.14, shape: "sine", slideTo: 160, gain: 0.05 });
    },
    playReveal(): void {
      playSequence([
        { freq: 660, duration: 0.14, shape: "sine", gain: 0.05 },
        { freq: 880, duration: 0.18, shape: "sine", gain: 0.05, delay: 0.09 },
      ]);
    },
    playWin(): void {
      playSequence([
        { freq: 523.25, duration: 0.14, shape: "triangle", gain: 0.06 },
        { freq: 659.25, duration: 0.14, shape: "triangle", gain: 0.06, delay: 0.1 },
        { freq: 783.99, duration: 0.14, shape: "triangle", gain: 0.06, delay: 0.2 },
        { freq: 1046.5, duration: 0.22, shape: "triangle", gain: 0.06, delay: 0.3 },
      ]);
    },
    toggleMute(): boolean {
      muted = !muted;
      writeMuted(storage, muted);
      return muted;
    },
    isMuted(): boolean {
      return muted;
    },
  };
}
