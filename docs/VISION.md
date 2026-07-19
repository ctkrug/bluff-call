# Vision

## The problem

Every "AI opponent" in a poker-adjacent game is either a heuristic (if-else rules
dressed up as strategy) or a trained model (a black box you can beat but never fully
trust). When you lose a hand to a bluff and want to know "was that actually the right
play?", these opponents can't answer honestly — they can only show you what *they*
happened to do, not what *should* have been done. There's no ground truth to learn
against.

Kuhn poker changes that. It's a 3-card, 1-round poker variant small enough that its
Nash equilibrium has been fully solved in closed form since 1950. That means an AI
opponent playing the equilibrium isn't approximating good play — it *is* good play,
provably. Bluff Call is built around that fact.

## Who it's for

People who enjoy poker, game theory, or both — casual players curious whether their
bluffing instincts hold up against math, and anyone who's heard the term "GTO"
(game-theory optimal) thrown around in poker content and wants to see it made
concrete and small enough to actually understand, hand by hand.

## The core idea

Strip poker down to its smallest interesting case — one card each from a 3-card deck,
one round of betting — so the entire strategy space fits in a page of math, and let
the player feel the consequence of deviating from it in real time. Every hand ends
with a reveal: not "here's what a bot did," but "here's the exact frequency the
equilibrium calls for with this card, and here's why yours over- or under-plays it."

## Key design decisions

- **Kuhn poker, not full poker.** Full hold'em has no closed-form solution worth
  showing a player; Kuhn poker's equilibrium is small enough to state in one sentence
  per card and verify by hand. Depth is sacrificed for provable correctness — that
  trade is the entire premise of the game.
- **The equilibrium is a mixed strategy, not a fixed rulebook.** The AI's next move is
  sampled from the actual probability the solution calls for (e.g. "bluff with the
  worst card 1/3 of the time"), so the AI genuinely varies its play hand to hand
  exactly as the math prescribes — it isn't scripted to "sometimes bluff" for flavor.
- **The reveal is the product, not a bonus screen.** Post-hand analysis is built
  first (see `docs/BACKLOG.md` — it's the first story), because a bluffing game
  without a correct answer to "was that right?" is just a coin flip with a story.
- **No backend.** The full game — deck, betting, the solved strategy, the reveal — is
  simple enough to run entirely client-side. Ships as a static site, no server to run
  or pay for.
- **Bankroll across hands, not one-shot.** A single Kuhn poker hand is over in
  seconds; a running bankroll across a session gives bluffing decisions weight and
  gives the reveal something to accumulate against ("that bluff cost you 1 chip in
  expectation over a thousand hands — here you lost the pot, but it was still right").

## What "v1 done" looks like

- A player can sit down, play a full session of Kuhn poker hands against the
  equilibrium AI, and see their bankroll change hand to hand.
- After every hand, a reveal shows the equilibrium action and frequency for the
  card(s) in play, in plain language, correctly computed for every reachable
  game state (not just the common ones).
- The AI's play is verifiably drawn from the real equilibrium distribution — this is
  covered by tests, not just eyeballed.
- The page looks and feels intentionally designed end to end (see `docs/DESIGN.md`),
  works on desktop and phone, and is playable start to finish with sound and without
  it.
- Deployable as a static build to `apps.charliekrug.com/bluff-call` with zero backend.
