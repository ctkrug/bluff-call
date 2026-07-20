# Architecture

A static, client-only Vite/TypeScript app. No backend, no build-time data —
everything needed to play a session ships in the bundle.

## Module map

```
src/
  game/                 Pure logic — no DOM, fully unit tested.
    rng.ts              Injectable RNG (mulberry32 seeded, or Math.random via systemRng()).
    cards.ts             J/Q/K deck + Fisher-Yates dealHand(rng), validates injected RNG output.
    rules.ts             Betting state machine; rejects unreachable histories before resolving them.
    equilibrium.ts        The solved Kuhn poker Nash equilibrium, parametrized by alpha in [0, 1/3].
    ai.ts                 Samples one action from equilibriumDistribution() using the RNG.
    reveal.ts              Builds the post-hand "wow moment" explanation from history + equilibrium.
    session.ts              Running session stats: accuracy vs. equilibrium, session-high milestone,
                             hand-history formatting.
    bankroll.ts              Session bankroll + sessionStorage persistence (malformed-state and write safe).
  ui/
    sound.ts               WebAudio-synthesized SFX engine, lazy AudioContext, persisted mute.
    shell.ts               Static page, game-table, guide, and dialog markup.
  main.ts                   DOM glue: renders the shell, wires the game state machine to the
                             pure `game/` modules, drives animations/sound/persistence.
  style.css                 Design tokens (docs/DESIGN.md) + global/base styles.
  game-ui.css               Component styles: desk scene, cards, buttons, ledger, margin panel.
```

## Data flow for one hand

1. `main.ts` calls `dealHand(rng)` → `{ player, opponent, undealt }`.
2. The player always acts first each hand (see "Design decisions" below). Every action goes
   through `applyAction()`, which pushes onto `history: Action[]` and asks `rules.ts` who acts
   next (`actingSeat`) and what's legal (`legalActions`).
3. When it's the AI's turn, `ai.sampleEquilibriumAction(opponentCard, history, ALPHA, rng)` draws
   a weighted-random action from `equilibrium.equilibriumDistribution()` — the AI's play is a
   genuine sample from the solved strategy, not a scripted response.
4. Once `rules.isTerminal(history)` is true, `rules.resolveHand()` computes the winner and net
   chip change; `bankroll.applyHandResult()` updates and persists the bankroll.
5. `reveal.buildReveal()` walks the same `history` again, and for every decision point states the
   equilibrium's exact frequency for the action actually taken (via `equilibriumDistribution`) in
   plain language — this is the reveal panel's content, and it is definitionally always correct
   because it's built from the same equilibrium the AI sampled from, not a separate model.
6. `session.recordHand()` folds the hand into running accuracy/milestone stats; the hand is
   prepended to `handHistory`.

## The equilibrium (why the numbers are what they are)

Kuhn poker's Nash equilibrium is a one-parameter family. This app fixes `ALPHA = 0.2`
(`src/main.ts`). At the **opening decision** (`history = []`, player to act):

- Jack: bet (bluff) with probability `alpha`.
- Queen: never bets.
- King: bet (value) with probability `3 * alpha`.

Every other decision point (the player's response to a check-then-bet, and the AI's response to
a check or a bet) is pinned to a single value by the indifference conditions that make the
opening-decision mixing a genuine equilibrium — see `equilibrium.ts`'s `AGGRESSIVE_PROBABILITY`
table for the full 4-decision-point x 3-card matrix and the reasoning comments inline. All of it
is covered by `tests/game/equilibrium.test.ts`, including that the distribution sums to 1 and
stays in range for all 12 combinations.

## Design decisions worth knowing

- **The player always acts first.** Kuhn poker's equilibrium is asymmetric between the first and
  second actor; fixing the player as first-to-act keeps the strategy tables and the reveal
  copy ("You held the King and chose to check...") unambiguous. There's no seat-swapping.
- **A "match" for the accuracy stat** means the player's action was the equilibrium's
  majority-probability choice at that decision point (`probability >= 0.5`) — see
  `session.recordHand()`. It's a single-hand proxy, not an EV calculation.
- **The win-celebration is deferred**, not shown the instant a milestone is hit. A session-high
  frequently coincides with the hand that just ended, so showing it immediately would stack a
  full-screen modal on top of the margin-proof reveal panel — which `docs/DESIGN.md` explicitly
  wants to read as non-interruptive, part of the page. `main.ts` only shows the celebration after
  "Next hand" dismisses the reveal.
- **RNG is swappable via `?seed=<n>`** in the URL (`pickRng()` in `main.ts`) — deals and AI
  actions become fully deterministic for manual QA/debugging without touching game code.

## Running it

```
npm install
npm run dev      # local dev server
npm test         # vitest run — all game/ and ui/ modules
npm run test:coverage # V8 coverage for all core game modules
npm run build    # tsc --noEmit && vite build -> site/
```

The build is static and base-path-relative (`vite.config.ts` sets `base: "./"`), so `site/` can
be served from a subpath like `apps.charliekrug.com/bluff-call/` with no server-side changes.
