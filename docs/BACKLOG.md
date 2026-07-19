# Backlog

Epics and stories for the build. All start unchecked (`[ ]`). Build implements to
the acceptance criteria; QA attacks them. The first story of Epic 1 is the wow
moment — it must be reachable before anything else in this backlog is built.

## Epic 1 — Core game and the equilibrium reveal

- [ ] **Play a full hand and see the GTO reveal (wow moment)**
  A player can play one complete hand of Kuhn poker end-to-end against the AI —
  deal, bet/check/call/fold, showdown — and immediately see a reveal stating the
  exact equilibrium action and frequency for the card(s) in play.
  - Acceptance criteria:
    - A full hand (deal → betting → showdown or fold) is playable start to finish
      with no dead ends or unhandled action combinations.
    - After the hand ends, a reveal is shown stating a specific numeric frequency
      (e.g. "33%") for at least one decision point in the hand, not a vague
      description.
    - Losing a hand to a bluff produces a reveal that explicitly names the bluffing
      frequency for the card that beat the player.

- [ ] **Kuhn poker rules engine**
  Deck of 3 ranks (J/Q/K), deal one card to each player, single betting round with
  check/bet/call/fold, correct showdown/win resolution.
  - Acceptance criteria:
    - Every reachable betting sequence (check-check, check-bet-call, check-bet-fold,
      bet-call, bet-fold) resolves to a defined winner and pot.
    - An illegal action (e.g. betting after a bet is already in and no raise exists
      in Kuhn poker) is not offered as a choice, not merely rejected after the fact.
    - Unit tests cover all five terminal betting sequences and assert the correct
      pot winner for each.

- [ ] **Solved equilibrium strategy module**
  A pure, tested module implementing the published Kuhn poker Nash equilibrium
  (parameterized by bluffing frequency α), covering every player, card, and betting
  history combination.
  - Acceptance criteria:
    - For a fixed α, the module returns the correct action-probability distribution
      for all 3 cards × both players × every reachable decision point (12 total
      distributions), matching the published closed-form solution.
    - A test asserts the King is bet/raised with probability `3α` and the Jack is
      bluffed with probability `α` when checked to, per the equilibrium.
    - Changing α outside the valid range `[0, 1/3]` is rejected (throws or clamps,
      documented behavior either way) rather than silently producing an invalid
      strategy.

- [ ] **AI plays sampled equilibrium actions**
  The AI's move each decision point is a random sample drawn from the equilibrium
  distribution for its actual card and the current betting history — not the single
  most-likely action.
  - Acceptance criteria:
    - Given a fixed random seed/injectable RNG, the AI's action sequence is
      deterministic and reproducible in a test.
    - Over a large simulated sample (e.g. 10,000 hands with the Jack checked to), the
      AI's observed bluff rate is within a small tolerance of α.

- [ ] **Session bankroll**
  A running bankroll persists across hands within a session, updated correctly after
  every showdown or fold.
  - Acceptance criteria:
    - Bankroll changes by exactly the pot/ante amount each hand and is visible on
      screen before the next hand deals.
    - Bankroll state survives a page reload within the same session (e.g. via
      `sessionStorage`) without corrupting on malformed/missing stored state.

## Epic 2 — Feel, motion, and the margin-proof reveal

- [ ] **Card table visual design**
  Implements `docs/DESIGN.md`'s paper-and-ink direction: tokens, type pairing, the
  desk-scene hero layout, and the right-hand/drawer ledger.
  - Acceptance criteria:
    - Fraunces and IBM Plex Mono are loaded and applied per the type pairing; no
      system-font-only fallback is visibly in use.
    - The desk scene occupies ≥60% of viewport height on a 1440×900 layout.
    - No pure `#000`/`#fff` surfaces anywhere in the stylesheet.

- [ ] **Deal, flip, bet, and fold animations**
  Every card and chip action has a tweened animation per the juice plan, not an
  instant state swap.
  - Acceptance criteria:
    - Card deal and flip each animate over 100–150ms; verified by inspecting the
      transition/animation duration in the implementation (not just "looks fine").
    - Folding a hand visibly animates (crumple/fade) rather than the card
      disappearing on the same frame as the click.
    - `prefers-reduced-motion: reduce` disables shake/rotation/particle effects
      while keeping the action fully functional.

- [ ] **The margin-proof reveal panel**
  The signature detail: a torn-margin strip that slides in with the hand-inked
  annotation after every hand, positioned per the layout intent (side panel on
  desktop, drawer on phone).
  - Acceptance criteria:
    - The reveal slides in (not an instant modal pop) within the 200–250ms range
      specified in DESIGN.md.
    - On a 390px-wide viewport the reveal is reachable and fully readable without
      horizontal scrolling.

- [ ] **Synth sound effects with persistent mute**
  All SFX from the juice plan (flip, chip bet, bet thud, fold swoosh, reveal chime,
  win arpeggio) are generated via WebAudio oscillators/noise — zero binary audio
  assets — with a mute toggle.
  - Acceptance criteria:
    - No `.mp3`/`.wav`/`.ogg` files exist anywhere in the repo; grep for common audio
      extensions returns nothing under `src/` or `dist/`.
    - Toggling mute persists across a page reload via `localStorage`.
    - The `AudioContext` is created lazily on first user gesture, and code that
      touches WebAudio is guarded so tests (no real audio hardware) don't throw.

- [ ] **Responsive layout and design self-review**
  The full page composes correctly at 390×844, 768×1024, and 1440×900 with no
  overlap, no horizontal scroll, and no dead space, per D3 of the design standard.
  - Acceptance criteria:
    - Automated or manual check confirms no horizontal scrollbar appears at any of
      the three widths.
    - All interactive controls (buttons, mute toggle, select if any) have visible
      hover, focus-visible, active, and disabled states styled beyond browser
      defaults.
    - A custom favicon (inline SVG, using the accent + a monogram/card glyph) is
      present — no default globe icon.

## Epic 3 — Session depth and replay value

- [ ] **Hand history log**
  Every completed hand in the current session is listed with cards, action
  sequence, and outcome, most recent first.
  - Acceptance criteria:
    - After playing 3 hands, the log shows exactly 3 entries in reverse
      chronological order.
    - Each entry shows enough detail (both cards once revealed, final pot, winner)
      to reconstruct what happened without replaying it.

- [ ] **Session stats: bluff accuracy vs. equilibrium**
  A running stat compares the player's actual bet/check/call/fold decisions against
  what the equilibrium would have done with the same card and history, expressed as
  a percentage.
  - Acceptance criteria:
    - The stat updates after every hand and is visible without opening the hand
      history.
    - A deterministic test sequence of known player decisions produces the expected
      accuracy percentage.

- [ ] **Win celebration on session milestone**
  Reaching a bankroll milestone (e.g. session high) triggers the win-celebration
  juice: ink-splatter burst, stats recap card, and a "Play Again"/continue CTA.
  - Acceptance criteria:
    - The celebration triggers at the defined milestone condition and not on every
      hand.
    - The recap card shows at least hands-played and bluff-accuracy-vs-equilibrium
      figures pulled from real session state, not placeholder numbers.

- [ ] **New session / reset flow**
  A player can start a fresh session (bankroll and history reset) without reloading
  the page.
  - Acceptance criteria:
    - Triggering reset zeroes the bankroll to the starting value and empties the
      hand history in the same interaction.
    - Reset is confirmed (not a single accidental click away) if the current session
      has a non-zero hand count.

- [ ] **Design polish pass**
  A dedicated pass to close any gap between the shipped UI and `docs/DESIGN.md` found
  during the Epic 2 self-review, applied across the whole app rather than left as
  isolated fixes.
  - Acceptance criteria:
    - Every anti-generic ban in the design standard (D2) is checked against the
      shipped page and confirmed absent.
    - Any deviation from `docs/DESIGN.md` found during review is either fixed or the
      doc is updated to match, in the same commit.
