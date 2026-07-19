/** A deterministic, injectable source of randomness so game logic stays testable. */
export type Rng = () => number;

/**
 * mulberry32 — small, fast, seedable PRNG. Not cryptographic; fine for card
 * shuffling and equilibrium sampling where reproducibility matters more than
 * unpredictability.
 */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Non-deterministic RNG for real play, wrapping the platform's source. */
export function systemRng(): Rng {
  return () => Math.random();
}
