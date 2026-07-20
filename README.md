# Bluff Call

**▶ Live demo: [apps.charliekrug.com/bluff-call](https://apps.charliekrug.com/bluff-call/)**

[![CI](https://github.com/ctkrug/bluff-call/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/bluff-call/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-b3312c.svg)](LICENSE)

**Play a hand. See the solved move.**

Bluff Call is a three-card poker lesson for players who want to understand game
theory without studying a solver chart first. You play Kuhn poker against its Nash
equilibrium strategy. After every hand, a red margin proof shows the exact optimal
frequency behind each action that reached the table.

![A completed Bluff Call hand with the equilibrium proof in the margin](docs/assets/bluff-call-gameplay.png)

## Why Kuhn poker

Kuhn poker has only a Jack, Queen, and King, but it keeps the parts of poker that
make strategy interesting: hidden information, betting, bluffing, calling, and
folding. Its small game tree has a closed-form Nash equilibrium, so the feedback can
show exact frequencies instead of a heuristic bot's opinion.

Bluff Call fixes the equilibrium parameter at `alpha = 0.2`. At the opening
decision, that means bluffing with a Jack 20% of the time, never betting a Queen,
and value-betting a King 60% of the time. The opponent samples its actions from the
same equilibrium table used to build the post-hand explanation.

## What the game shows you

- **An opponent you cannot exploit:** every AI action is sampled from the solved
  strategy for its card and the current betting history.
- **A proof tied to the hand:** the reveal names the actor, card, chosen action, and
  exact equilibrium frequency for every decision that occurred.
- **A useful practice signal:** equilibrium accuracy tracks how often your choices
  matched an action with at least 50% equilibrium probability.
- **A reconstructable session:** the ledger records both cards, the complete action
  sequence, the outcome, and your chip result for each finished hand.

## Play one hand

1. Ante one chip and choose **Check** or **Bet** with your card.
2. Wait for the AI to sample its response from the equilibrium strategy.
3. If you face a bet, choose **Call** or **Fold**. Otherwise the hand reaches
   showdown.
4. Read the margin proof, compare your decisions, then choose **Next hand**.

The current bankroll survives a reload in the same browser tab. Hand history and
accuracy reset with a new session. Sound is synthesized in the browser, and the
mute preference persists locally.

For a reproducible deal and AI action sequence, add a numeric seed:

```text
http://localhost:5173/?seed=42
```

## Run locally

Requires Node.js 20 or newer.

```bash
git clone https://github.com/ctkrug/bluff-call.git
cd bluff-call
npm ci
npm run dev
```

Vite prints the local URL. Open it in a browser and play immediately; there is no
account, backend, or data service to configure.

## Verify the project

```bash
npm run lint           # ESLint across TypeScript and tests
npm test               # Full Vitest suite
npm run test:coverage  # Core game coverage with V8
npm run build          # Type-check and create the static site
npm run preview        # Serve the production build locally
```

The core game modules are pure TypeScript with an injected random-number source, so
deals and mixed strategies can be tested deterministically. The production output
uses relative asset paths and can be served from the `/bluff-call/` subpath.

## Project guide

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) maps the rules, equilibrium,
  persistence, sound, and UI layers.
- [`docs/DESIGN.md`](docs/DESIGN.md) records the paper-and-ink direction, tokens,
  responsive layout, and feedback plan.
- [`docs/POSITIONING.md`](docs/POSITIONING.md) defines the audience and product
  promise.
- [`docs/VISION.md`](docs/VISION.md) and [`docs/BACKLOG.md`](docs/BACKLOG.md) capture
  the product scope and completed acceptance criteria.

## License

[MIT](LICENSE)

More of Charlie's projects: [apps.charliekrug.com](https://apps.charliekrug.com)
