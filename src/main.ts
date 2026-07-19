import "./style.css";
import "./game-ui.css";

import { dealHand, type Deal, type Rank } from "./game/cards";
import { sampleEquilibriumAction } from "./game/ai";
import {
  applyHandResult,
  createBankroll,
  loadBankroll,
  saveBankroll,
  type BankrollState,
} from "./game/bankroll";
import { buildReveal, RANK_NAME, type Reveal } from "./game/reveal";
import { mulberry32, systemRng, type Rng } from "./game/rng";
import { actingSeat, isTerminal, legalActions, resolveHand, type Action, type History, type Seat } from "./game/rules";
import {
  accuracyPercent,
  createSessionStats,
  describeHistoryEntry,
  recordHand,
  type HandHistoryEntry,
  type SessionStats,
} from "./game/session";
import { createSoundEngine } from "./ui/sound";

/** Bluffing frequency for the equilibrium: 20% Jack bluffs, 60% King value-bets. Fixed for v1. */
const ALPHA = 0.2;
const AI_THINK_DELAY_MS = 550;
const MAX_HISTORY_ENTRIES = 50;

interface GameState {
  deal: Deal;
  history: History;
  bankroll: BankrollState;
  sessionStats: SessionStats;
  handHistory: HandHistoryEntry[];
  handActive: boolean;
}

function pickRng(): Rng {
  const params = new URLSearchParams(window.location.search);
  const seed = params.get("seed");
  return seed !== null ? mulberry32(Number(seed)) : systemRng();
}

function renderShell(): string {
  return `
    <div class="page">
      <header class="topbar">
        <h1 class="wordmark">Bluff<span class="wordmark-accent">Call</span></h1>
        <button id="mute-toggle" class="icon-btn" type="button" aria-pressed="false" aria-label="Mute sound">
          <span id="mute-icon" aria-hidden="true">&#128266;</span>
        </button>
      </header>
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
            <span class="accuracy-value" id="accuracy-value">—</span>
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
      <div class="margin-panel" id="margin-panel" aria-live="polite">
        <p class="margin-headline" id="margin-headline"></p>
        <ul class="margin-decisions" id="margin-decisions"></ul>
        <button id="next-hand" class="btn btn-bet" type="button">Next hand</button>
      </div>
      <div class="celebration" id="celebration">
        <div class="celebration-card">
          <h2 class="celebration-title">New session high!</h2>
          <div class="celebration-stats" id="celebration-stats"></div>
          <button id="celebration-close" class="btn btn-bet" type="button">Keep playing</button>
        </div>
      </div>
    </div>
  `;
}

function requireElement<T extends Element>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Expected #${id} to exist in the rendered shell`);
  return el as unknown as T;
}

function mount(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;
  app.innerHTML = renderShell();

  const els = {
    opponentCard: requireElement<HTMLDivElement>("opponent-card"),
    playerCard: requireElement<HTMLDivElement>("player-card"),
    potValue: requireElement<HTMLSpanElement>("pot-value"),
    potDisplay: requireElement<HTMLDivElement>("pot-display"),
    actionRow: requireElement<HTMLDivElement>("action-row"),
    statusLine: requireElement<HTMLParagraphElement>("status-line"),
    bankrollValue: requireElement<HTMLSpanElement>("bankroll-value"),
    accuracyValue: requireElement<HTMLSpanElement>("accuracy-value"),
    historyToggle: requireElement<HTMLButtonElement>("history-toggle"),
    historyList: requireElement<HTMLOListElement>("history-list"),
    newSessionButton: requireElement<HTMLButtonElement>("new-session"),
    marginPanel: requireElement<HTMLDivElement>("margin-panel"),
    marginHeadline: requireElement<HTMLParagraphElement>("margin-headline"),
    marginDecisions: requireElement<HTMLUListElement>("margin-decisions"),
    nextHandButton: requireElement<HTMLButtonElement>("next-hand"),
    celebration: requireElement<HTMLDivElement>("celebration"),
    celebrationStats: requireElement<HTMLDivElement>("celebration-stats"),
    celebrationClose: requireElement<HTMLButtonElement>("celebration-close"),
    muteToggle: requireElement<HTMLButtonElement>("mute-toggle"),
    muteIcon: requireElement<HTMLSpanElement>("mute-icon"),
  };

  const rng = pickRng();
  const sound = createSoundEngine(window.localStorage);

  const initialBankroll = loadBankroll(window.sessionStorage, createBankroll());
  const state: GameState = {
    deal: dealHand(rng),
    history: [],
    bankroll: initialBankroll,
    sessionStats: createSessionStats(initialBankroll.startingBalance),
    handHistory: [],
    handActive: true,
  };

  function potChips(history: History): number {
    return 2 + history.filter((a) => a === "bet" || a === "call").length;
  }

  function renderCardFace(el: HTMLElement, rank: Rank, animation: "deal" | "flip" | null): void {
    el.classList.remove("card--back");
    el.innerHTML = `<span class="card-rank">${rank}</span><span class="card-name">${RANK_NAME[rank]}</span>`;
    triggerAnimation(el, animation);
  }

  function renderCardBack(el: HTMLElement, animation: "deal" | null): void {
    el.classList.add("card--back");
    el.innerHTML = "";
    triggerAnimation(el, animation);
  }

  function triggerAnimation(el: HTMLElement, animation: "deal" | "flip" | null): void {
    const className = animation === "deal" ? "card--dealing" : animation === "flip" ? "card--flipping" : null;
    if (!className) return;
    el.classList.remove("card--dealing", "card--flipping");
    // Force reflow so re-adding the class restarts the animation.
    void el.offsetWidth;
    el.classList.add(className);
  }

  function bumpPot(): void {
    els.potDisplay.classList.remove("pot--bump");
    void els.potDisplay.offsetWidth;
    els.potDisplay.classList.add("pot--bump");
  }

  function renderPot(): void {
    els.potValue.textContent = String(potChips(state.history));
  }

  function renderBankroll(): void {
    els.bankrollValue.textContent = String(state.bankroll.balance);
    const accuracy = accuracyPercent(state.sessionStats);
    els.accuracyValue.textContent = accuracy === null ? "—" : `${accuracy}%`;
  }

  function renderHistory(): void {
    els.historyToggle.textContent = `Hand history (${state.handHistory.length})`;
    if (state.handHistory.length === 0) {
      els.historyList.innerHTML = `<li class="empty-state">No hands played yet this session.</li>`;
      return;
    }
    els.historyList.innerHTML = state.handHistory
      .map((entry) => {
        const cls = entry.winner === "player" ? "history-entry-win" : "history-entry-loss";
        return `<li class="history-entry ${cls}">${escapeHtml(describeHistoryEntry(entry))}</li>`;
      })
      .join("");
  }

  function renderActionRow(): void {
    const seat = actingSeat(state.history);
    const legal = seat === "player" ? legalActions(state.history) : [];
    for (const button of els.actionRow.querySelectorAll<HTMLButtonElement>("button[data-action]")) {
      const action = button.dataset.action as Action;
      button.disabled = !legal.includes(action);
    }
  }

  function renderMarginPanel(reveal: Reveal): void {
    els.marginHeadline.textContent = reveal.headline;
    els.marginDecisions.innerHTML = reveal.decisions
      .map((d) => {
        const pct = Math.round(d.probability * 100);
        const actorLabel = d.actor === "player" ? "You" : "The AI";
        return `<li>${actorLabel} held the ${RANK_NAME[d.card]} and chose to ${d.actionTaken}. The equilibrium takes that line <span class="margin-freq">${pct}%</span> of the time.</li>`;
      })
      .join("");
    els.marginPanel.classList.add("open");
  }

  function closeMarginPanel(): void {
    els.marginPanel.classList.remove("open");
  }

  function showCelebration(): void {
    const accuracy = accuracyPercent(state.sessionStats);
    els.celebrationStats.innerHTML = `
      <div><span class="celebration-stat-value">${state.sessionStats.handsPlayed}</span><span class="celebration-stat-label">Hands played</span></div>
      <div><span class="celebration-stat-value">${accuracy === null ? "—" : `${accuracy}%`}</span><span class="celebration-stat-label">Equilibrium accuracy</span></div>
      <div><span class="celebration-stat-value">${state.bankroll.balance}</span><span class="celebration-stat-label">Bankroll</span></div>
    `;
    els.celebration.classList.add("open");
  }

  function hideCelebration(): void {
    els.celebration.classList.remove("open");
  }

  function startHand(): void {
    closeMarginPanel();
    hideCelebration();
    state.deal = dealHand(rng);
    state.history = [];
    state.handActive = true;
    renderCardFace(els.playerCard, state.deal.player, "deal");
    renderCardBack(els.opponentCard, "deal");
    sound.playDeal();
    renderPot();
    els.statusLine.textContent = "Your move.";
    renderActionRow();
  }

  function finishHand(): void {
    state.handActive = false;
    const result = resolveHand(state.history, state.deal.player, state.deal.opponent);
    state.bankroll = applyHandResult(state.bankroll, result.playerNet);
    saveBankroll(state.bankroll, window.sessionStorage);

    renderCardFace(els.opponentCard, state.deal.opponent, "flip");
    sound.playReveal();

    const reveal = buildReveal(state.history, state.deal.player, state.deal.opponent, ALPHA);
    const { stats, milestoneReached } = recordHand(state.sessionStats, reveal, state.bankroll.balance);
    state.sessionStats = stats;

    state.handHistory.unshift({
      index: state.handHistory.length,
      playerCard: state.deal.player,
      opponentCard: state.deal.opponent,
      history: state.history,
      winner: result.winner,
      showdown: result.showdown,
      playerNet: result.playerNet,
    });
    if (state.handHistory.length > MAX_HISTORY_ENTRIES) state.handHistory.length = MAX_HISTORY_ENTRIES;

    renderBankroll();
    renderHistory();
    renderActionRow();
    renderMarginPanel(reveal);

    const outcome = result.winner === "player" ? "You win" : "AI wins";
    els.statusLine.textContent = `${outcome} the ${potChips(state.history)}-chip pot.`;

    if (result.winner === "player") {
      window.setTimeout(() => sound.playWin(), 200);
    }
    if (milestoneReached) {
      window.setTimeout(showCelebration, 500);
    }
  }

  function applyAction(action: Action): void {
    if (!state.handActive || isTerminal(state.history)) return;
    const seat: Seat | null = actingSeat(state.history);
    if (!seat || !legalActions(state.history).includes(action)) return;

    const foldingSeat = action === "fold" ? seat : null;
    state.history = [...state.history, action];

    if (action === "bet" || action === "call") {
      sound.playBet();
      bumpPot();
      renderPot();
    } else if (action === "fold") {
      sound.playFold();
      const foldedCardEl = foldingSeat === "player" ? els.playerCard : els.opponentCard;
      triggerAnimation(foldedCardEl, null);
      foldedCardEl.classList.add("card--folded");
    } else {
      sound.playFlip();
    }

    if (isTerminal(state.history)) {
      finishHand();
      return;
    }

    renderActionRow();
    const nextSeat = actingSeat(state.history);
    if (nextSeat === "opponent") {
      els.statusLine.textContent = "AI is thinking…";
      window.setTimeout(aiTurn, AI_THINK_DELAY_MS);
    } else {
      els.statusLine.textContent = "Your move.";
    }
  }

  function aiTurn(): void {
    if (!state.handActive) return;
    const action = sampleEquilibriumAction(state.deal.opponent, state.history, ALPHA, rng);
    applyAction(action);
  }

  els.actionRow.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest<HTMLButtonElement>("button[data-action]");
    if (!button || button.disabled) return;
    applyAction(button.dataset.action as Action);
  });

  els.nextHandButton.addEventListener("click", startHand);

  els.historyToggle.addEventListener("click", () => {
    const open = els.historyList.classList.toggle("open");
    els.historyToggle.setAttribute("aria-expanded", String(open));
  });

  els.newSessionButton.addEventListener("click", () => {
    if (state.sessionStats.handsPlayed > 0) {
      const confirmed = window.confirm("Start a new session? This resets your bankroll and hand history.");
      if (!confirmed) return;
    }
    const fresh = createBankroll();
    state.bankroll = fresh;
    state.sessionStats = createSessionStats(fresh.startingBalance);
    state.handHistory = [];
    saveBankroll(fresh, window.sessionStorage);
    renderBankroll();
    renderHistory();
    startHand();
  });

  els.celebrationClose.addEventListener("click", hideCelebration);

  els.muteToggle.addEventListener("click", () => {
    const muted = sound.toggleMute();
    els.muteToggle.setAttribute("aria-pressed", String(muted));
    els.muteToggle.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    els.muteIcon.innerHTML = muted ? "&#128263;" : "&#128266;";
  });

  const initiallyMuted = sound.isMuted();
  els.muteToggle.setAttribute("aria-pressed", String(initiallyMuted));
  els.muteIcon.innerHTML = initiallyMuted ? "&#128263;" : "&#128266;";

  renderBankroll();
  renderHistory();
  startHand();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

mount();
