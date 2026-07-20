export function renderShell(): string {
  return `
    <div class="page">
      <header class="topbar">
        <div>
          <h1 class="wordmark">Bluff<span class="wordmark-accent">Call</span></h1>
          <p class="wordmark-tagline">Play a hand. See the solved move.</p>
        </div>
        <button id="mute-toggle" class="icon-btn" type="button" aria-pressed="false" aria-label="Mute sound">
          <span id="mute-icon" aria-hidden="true">&#128266;</span>
        </button>
      </header>
      <section class="hero-copy" aria-labelledby="hero-headline">
        <p class="eyebrow">Three cards. One solved game.</p>
        <h2 id="hero-headline">Learn the optimal move after every hand</h2>
        <p>
          Play Kuhn poker against its exact equilibrium strategy. When the cards turn
          over, the margin proof shows the correct action and frequency for every
          decision you just made.
        </p>
      </section>
      <main class="layout">
        <section class="desk" aria-label="Card table">
          <div class="desk-felt">
            <div class="card-slot">
              <span class="slot-label">AI</span>
              <div class="card card--back" id="opponent-card"></div>
            </div>
            <div class="pot" id="pot-display">
              <span class="pot-label">Pot</span>
              <span class="pot-value" id="pot-value">0</span>
            </div>
            <div class="card-slot">
              <span class="slot-label">You</span>
              <div class="card" id="player-card"></div>
            </div>
          </div>
          <div class="action-row" id="action-row">
            <button class="btn btn-check" type="button" data-action="check">Check</button>
            <button class="btn btn-bet" type="button" data-action="bet">Bet</button>
            <button class="btn btn-call" type="button" data-action="call">Call</button>
            <button class="btn btn-fold" type="button" data-action="fold">Fold</button>
          </div>
          <p class="status-line" id="status-line" role="status" aria-live="polite"></p>
        </section>
        <aside class="ledger" aria-label="Session ledger">
          <div class="bankroll">
            <span class="bankroll-label">Bankroll</span>
            <span class="bankroll-value" id="bankroll-value">0</span>
          </div>
          <div class="accuracy-line">
            <span>Equilibrium accuracy</span>
            <span class="accuracy-value" id="accuracy-value">Not yet</span>
          </div>
          <button
            id="history-toggle"
            class="drawer-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="history-list"
          >
            Hand history (0)
          </button>
          <ol class="history-list" id="history-list"></ol>
          <button id="new-session" class="btn btn-ghost" type="button">New session</button>
        </aside>
      </main>
      <section class="game-guide" aria-labelledby="guide-title">
        <div class="guide-lead">
          <p class="eyebrow">The smallest useful poker lesson</p>
          <h2 id="guide-title">A three-card game that shows its work</h2>
          <p>
            Kuhn poker uses only a Jack, Queen, and King, but it still has betting,
            bluffing, calling, folding, and incomplete information. That compact rule
            set is why its optimal strategy can be solved exactly instead of estimated
            by a bot. Bluff Call turns the solution into hands you can play and inspect.
          </p>
        </div>

        <dl class="benefit-list">
          <div>
            <dt>Face the solved opponent</dt>
            <dd>The AI samples every move from Kuhn poker's Nash equilibrium, including its one-in-three Jack bluff after a check.</dd>
          </div>
          <div>
            <dt>Read the proof in context</dt>
            <dd>After each hand, the red margin note names the cards, actions, and exact equilibrium frequency at every decision point.</dd>
          </div>
          <div>
            <dt>Track the decisions that matter</dt>
            <dd>Your ledger keeps bankroll, hand history, and the share of your choices that matched the equilibrium's favored action.</dd>
          </div>
          <div>
            <dt>Replay the same line</dt>
            <dd>Add <code>?seed=&lt;number&gt;</code> to the URL to reproduce the deal and the AI's sampled actions for study or debugging.</dd>
          </div>
        </dl>

        <div class="how-to-play">
          <h3>How one hand works</h3>
          <ol>
            <li>You ante one chip, receive one card, and choose to check or bet.</li>
            <li>The AI responds from the solved strategy for its hidden card.</li>
            <li>If a bet stands, the other player calls or folds. Otherwise both cards reach showdown.</li>
            <li>The higher card wins, the ledger updates, and the margin proof explains the line.</li>
          </ol>
        </div>

        <div class="faq" aria-labelledby="faq-title">
          <h3 id="faq-title">Questions at the table</h3>
          <details>
            <summary>What is Kuhn poker?</summary>
            <p>It is a two-player poker model created by Harold Kuhn in 1950. Its three-card deck preserves bluffing and hidden information while keeping the full strategy small enough to solve.</p>
          </details>
          <details>
            <summary>What does equilibrium accuracy measure?</summary>
            <p>It is the percentage of your decisions that chose an action with at least 50% equilibrium probability. It is a readable practice signal, not a claim about long-run expected value.</p>
          </details>
          <details>
            <summary>Can the AI be exploited?</summary>
            <p>No fixed counter-strategy earns more against equilibrium play over time. A short session can still swing because cards and mixed actions are sampled at random.</p>
          </details>
          <details>
            <summary>Does the game send or save my play?</summary>
            <p>No. The game runs entirely in your browser. The current bankroll uses session storage, and the mute preference uses local storage.</p>
          </details>
        </div>

        <a class="github-cta" href="https://github.com/ctkrug/bluff-call">View on GitHub</a>
      </section>
      <footer class="site-footer">
        <a href="https://apps.charliekrug.com">More by Charlie Krug &rarr; apps.charliekrug.com</a>
      </footer>
      <div class="margin-panel" id="margin-panel" aria-live="polite">
        <p class="margin-headline" id="margin-headline"></p>
        <ul class="margin-decisions" id="margin-decisions"></ul>
        <button id="next-hand" class="btn btn-bet" type="button">Next hand</button>
      </div>
      <div
        class="celebration"
        id="celebration"
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        aria-hidden="true"
      >
        <div class="celebration-card">
          <h2 class="celebration-title" id="celebration-title">New session high!</h2>
          <div class="celebration-stats" id="celebration-stats"></div>
          <button id="celebration-close" class="btn btn-bet" type="button">Keep playing</button>
        </div>
      </div>
    </div>
  `;
}
