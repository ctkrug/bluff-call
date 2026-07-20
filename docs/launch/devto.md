# I built a poker game where the opponent can show its work

Poker strategy advice is often hard to inspect. A bot can beat you, or a chart can
tell you to mix two actions, but neither experience makes the decision easy to
recognize in context. I wanted a hand to end with a concrete answer: what was the
optimal move with this card, at this point in the betting, and how often should it
happen?

That question led me to Kuhn poker. It uses a deck of only three cards: Jack, Queen,
and King. Each player antes, receives one card, and plays a single betting round.
The rules are tiny, but the game still contains hidden information, value bets,
bluffs, calls, and folds. More importantly for this project, its Nash equilibrium is
known in closed form.

I turned that model into [Bluff Call](https://apps.charliekrug.com/bluff-call/), a
browser game that plays the equilibrium and annotates every finished hand.

## One strategy table, two jobs

The main implementation decision was to keep the equilibrium in one pure TypeScript
module. Given a card, betting history, and the equilibrium parameter `alpha`, the
module returns a complete action distribution. For example, with `alpha = 0.2`, the
opening player bets a Jack 20% of the time and a King 60% of the time.

The opponent samples from that distribution with an injected random-number source.
The post-hand explanation then walks the same action history and asks the same module
for the probability of each action that actually occurred. There is no second table
of coaching copy to drift out of sync with the player. If the strategy changes, play
and explanation change together.

Injecting randomness also made the mixed strategy testable. A seeded `mulberry32`
generator can reproduce a full deal and action sequence, while large samples check
that observed bluff rates stay close to their theoretical probabilities. A
`?seed=42` query parameter exposes the same path for manual debugging.

## Treat the browser as an unreliable boundary

The game keeps its bankroll in `sessionStorage` and the mute preference in
`localStorage`. Both APIs can contain malformed data or throw on access, so the game
logic never trusts them. Stored bankroll data must parse into finite numeric fields;
anything else falls back to a fresh 20-chip session. Failed writes do not interrupt
a completed hand.

That sounds like a small detail, but it was one of the more useful tests in the
project. I now run the app with deliberately broken JSON in storage as part of the
release check. The expected result is not merely "no exception." The table must
mount with the right bankroll and legal opening actions.

I took the same approach to sound. Every effect is synthesized with WebAudio, so
there are no audio files to load. The `AudioContext` is created only after a player
acts, guarded for browsers or test environments where it does not exist, and the
mute state survives a reload.

## Making the explanation feel connected

The visual direction is a mathematician's card table: cream notebook paper, dark
ink, and red annotations. After a hand, a margin strip slides in with the exact
frequencies. The reveal is a side panel on desktop and a bottom drawer on a phone.
It stays out of the betting flow, then becomes the main object once the result is
known.

If I built the first version again, I would extract the static page shell before the
game controller grew around it. Moving that markup later was safe, but starting with
a smaller controller would have made UI state tests easier to target. I would also
plan seat rotation from day one. Fixing the player in the first seat keeps this
lesson clear, but alternating seats would teach the asymmetry of Kuhn poker more
directly.

You can [play Bluff Call](https://apps.charliekrug.com/bluff-call/) or read the
[source on GitHub](https://github.com/ctkrug/bluff-call). I would especially like to
hear whether the margin proof changes how you think about a mixed poker decision.
