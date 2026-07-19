# Design direction

## 1. Aesthetic direction

**Bluff Call is a mathematician's card table:** cream notebook paper, hand-inked card
faces and table lines, and a red fountain-pen hand that annotates the margin with the
solved probabilities after every hand — like a professor grading your bluff in red
ink. Warm and analog where the subject (game theory) is usually presented cold and
clinical; the "proof in the margin" framing is what makes the reveal feel earned
rather than bolted on.

This is deliberately **not** another dark-UI game shell — bg is warm paper, not near-
black — to keep the portfolio varied and because red-ink-on-cream is the strongest
visual metaphor for "here is the correct annotation."

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f4ecd8` | page background — aged paper |
| `--surface-1` | `#eee2c5` | card table / panel surface |
| `--surface-2` | `#e3d3a4` | recessed panels, input wells |
| `--text` | `#241f16` | body/heading ink |
| `--text-muted` | `#6b5f45` | secondary copy, labels |
| `--accent` | `#b3312c` | ink-red — GTO annotations, bet/danger actions |
| `--accent-support` | `#2f5d62` | stamp-blue — primary interactive (bet/check/deal) |
| `--success` | `#3f7d4f` | win states, correct-play confirmation |
| `--danger` | `#b3312c` | shared with accent (folded hand, loss) |

- **Type pairing:** display — [Fraunces](https://fonts.google.com/specimen/Fraunces)
  (has real ink personality: soft serifs, optical weight) for the wordmark and
  headings; UI — [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) for
  body copy, labels, and every number (bankroll, probabilities, frequencies read like
  a ledger, not prose). System fallback stack:
  `"Fraunces", Georgia, serif` / `"IBM Plex Mono", ui-monospace, monospace`.
- **Spacing unit:** 8px scale (8/16/24/32/48/64).
- **Corner radius:** 2px on cards and panels (paper edges, not app-chrome pills); 6px
  on primary buttons only, so buttons read as "pressable" against otherwise sharp
  paper.
- **Shadow/depth:** soft, warm-toned drop shadows (`rgba(36,31,22,0.18)`) — no glow,
  ever; a faint grain/noise texture overlay on `--bg` so paper isn't a flat fill.
- **Motion:** UI transitions 160ms ease-out; card deal/flip 120ms ease-out; chip and
  bet feedback 80–100ms; margin-annotation slide-in 220ms ease-out.

## 3. Layout intent

**Hero = the desk.** A paper desk scene holds the three-card table (your card,
opponent's face-down card, the pot) and the action row (Check / Bet / Call / Fold)
directly beneath it — this occupies the majority of the viewport on every size.

- **1440×900 desktop:** desk scene centered, ~65% of width; a right-hand ledger
  column (~35%) shows running bankroll, hand history, and — after a hand — the margin
  annotation slides in here rather than as a modal, so the reveal reads as part of
  the page, not an interruption.
- **390×844 phone:** desk scene full-width, stacked above a bottom-pinned action bar
  (thumb reach); the ledger/history collapses into a swipe-up drawer so the desk
  keeps the majority of vertical space instead of competing with it.

## 4. Signature detail

**The margin proof.** After every hand, a torn-notebook-margin strip animates in from
the side (right on desktop, up from the bottom drawer on phone) with a hand-inked red
annotation: the exact equilibrium frequency for the card in play, stated in one
sentence, with the number itself set larger and underlined twice — the "professor's
red pen" moment the whole game is built toward.

## 5. Juice plan

- **Movement tween:** card deal 120ms ease-out (slide + slight rotate off the deck);
  card flip 120ms (scaleX through 0 at the midpoint); chips slide to pot 100ms
  ease-out.
- **Impact feedback:** fold = card crumples (scale + opacity fade, 140ms) and slides
  off-table; bet = chip stack "thud" (2px overshoot bounce + tiny table shake, 80ms).
- **Goal/success pop:** winning the pot = chips slide to the winner's stack with a
  count-up on the bankroll number (~400ms ease-out).
- **Win celebration** (session milestone / bankroll target): red ink-splatter burst
  behind a stats recap card (hands played, bluff-accuracy vs. equilibrium, biggest
  correct bluff) with one clear "Play Again" CTA.
- **Synth SFX** (WebAudio oscillators/noise, no audio files), subtle volume,
  rate-throttled, mute toggle persisted in `localStorage`:
  - *card flip* — short filtered noise tick, ~30ms
  - *chip bet* — triangle-wave blip, two quick descending notes
  - *bet thud* — low sine thump, ~80ms with fast decay
  - *fold* — short descending noise sweep ("swoosh")
  - *correct-bluff reveal* — ascending 3-note triangle arpeggio
  - *win* — ascending 5-note arpeggio, slightly longer decay
- All motion respects `prefers-reduced-motion` (drop shake/splatter/rotation, keep
  flips/slides functional but instant-ish).
