(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`J`,`Q`,`K`],t={J:1,Q:2,K:3};function n(e,n){return t[e]>t[n]}function r(t){let n=[...e];for(let e=n.length-1;e>0;--e){let r=t();if(!Number.isFinite(r)||r<0||r>=1)throw RangeError(`RNG must return a finite value in [0, 1), got ${r}`);let i=Math.floor(r*(e+1));[n[e],n[i]]=[n[i],n[e]]}let[r,i,a]=n;return{player:r,opponent:i,undealt:a}}var i=1/3;function a(e){if(Number.isNaN(e)||e<0||e>.3333333333333333)throw RangeError(`alpha must be within [0, ${i.toFixed(4)}], got ${e}`)}function o(e){return e.length===0?`player_open`:e.length===1?e[0]===`check`?`opponent_facing_check`:`opponent_facing_bet`:e.length===2&&e[0]===`check`&&e[1]===`bet`?`player_facing_check_bet`:null}var s={player_open:`bet`,player_facing_check_bet:`call`,opponent_facing_check:`bet`,opponent_facing_bet:`call`},c={player_open:`check`,player_facing_check_bet:`fold`,opponent_facing_check:`check`,opponent_facing_bet:`fold`};function l(e){return s[e]}var u={player_open:{J:e=>e,Q:()=>0,K:e=>3*e},player_facing_check_bet:{J:()=>0,Q:e=>e+1/3,K:()=>1},opponent_facing_check:{J:()=>1/3,Q:()=>0,K:()=>1},opponent_facing_bet:{J:()=>0,Q:()=>1/3,K:()=>1}};function d(e,t,n){a(n);let r=o(t);if(!r)throw Error(`No decision point at terminal history: [${t.join(`,`)}]`);let i=u[r][e](n);return[{action:s[r],probability:i},{action:c[r],probability:1-i}]}function f(e,t,n,r){let i=d(e,t,n),a=r();if(!Number.isFinite(a)||a<0||a>=1)throw RangeError(`RNG must return a finite value in [0, 1), got ${a}`);let o=0;for(let{action:e,probability:t}of i)if(o+=t,a<o)return e;return i[i.length-1].action}var p=`bluff-call:bankroll:v1`;function m(e=20){return{balance:e,startingBalance:e}}function h(e,t){return{...e,balance:e.balance+t}}function g(e,t){try{t.setItem(p,JSON.stringify(e))}catch{}}function _(e){if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.balance==`number`&&Number.isFinite(t.balance)&&typeof t.startingBalance==`number`&&Number.isFinite(t.startingBalance)}function v(e,t=m()){let n;try{n=e.getItem(p)}catch{return t}if(!n)return t;try{let e=JSON.parse(n);return _(e)?e:t}catch{return t}}function y(e){let t=e.join(`,`);return[``,`check`,`bet`,`check,check`,`check,bet`,`bet,call`,`bet,fold`,`check,bet,call`,`check,bet,fold`].includes(t)}function b(e){return y(e)?e.length===0?`player`:e.length===1?`opponent`:e.length===2&&e[0]===`check`&&e[1]===`bet`?`player`:null:null}function x(e){return y(e)&&e.length>0&&b(e)===null}function S(e){if(!b(e))return[];if(e.length===0)return[`check`,`bet`];let t=e[0];return e.length===1&&t===`check`?[`check`,`bet`]:[`call`,`fold`]}function C(e,t,r){if(!x(e))throw Error(`resolveHand called on non-terminal history: [${e.join(`,`)}]`);let i=e.join(`,`),a=n(t,r);switch(i){case`check,check`:return{winner:a?`player`:`opponent`,showdown:!0,playerNet:a?1:-1};case`check,bet,fold`:return{winner:`opponent`,showdown:!1,playerNet:-1};case`check,bet,call`:return{winner:a?`player`:`opponent`,showdown:!0,playerNet:a?2:-2};case`bet,fold`:return{winner:`player`,showdown:!1,playerNet:1};case`bet,call`:return{winner:a?`player`:`opponent`,showdown:!0,playerNet:a?2:-2};default:throw Error(`Unreachable terminal history: [${e.join(`,`)}]`)}}var w={J:`Jack`,Q:`Queen`,K:`King`};function T(e){return e===`player`?`You`:`The AI`}function E(e){return e===`player`?`your`:`its`}function D(e,t,n,r,i){let a=Math.round(i*100),o=w[t],s=l(n)===`bet`?`bets`:`calls`;return`Holding the ${o}, ${T(e).toLowerCase()} the equilibrium ${s} ${a}% of the time; ${E(e)} actual play was to ${r}.`}function O(e,t,n,r){let i=C(e,t,n),a=[];for(let i=0;i<e.length;i+=1){let s=e.slice(0,i),c=b(s),l=o(s);if(!c||!l)throw Error(`Malformed history passed to buildReveal: [${e.join(`,`)}]`);let u=c===`player`?t:n,f=e[i],p=d(u,s,r).find(e=>e.action===f)?.probability??0,m=u===`J`&&f===`bet`;a.push({actor:c,card:u,decisionPoint:l,actionTaken:f,probability:p,isBluff:m,sentence:D(c,u,l,f,p)})}return{headline:k(a.find(e=>e.actor===`opponent`&&e.isBluff),i.winner),decisions:a}}function k(e,t){if(!e)return`Here's what the equilibrium says about this hand.`;let n=Math.round(e.probability*100);return t===`opponent`?`You lost to a bluff. The AI's Jack takes that line ${n}% of the time. Here's the proof.`:`The AI tried to bluff with the Jack ${n}% of the time here, but it didn't get there.`}function A(e){let t=e>>>0;return function(){t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function j(){return()=>Math.random()}function M(e){return{handsPlayed:0,playerDecisions:0,playerDecisionsMatched:0,sessionHigh:e}}function N(e,t,n){let r=t.decisions.filter(e=>e.actor===`player`),i=r.filter(e=>e.probability>=.5).length;return{stats:{handsPlayed:e.handsPlayed+1,playerDecisions:e.playerDecisions+r.length,playerDecisionsMatched:e.playerDecisionsMatched+i,sessionHigh:Math.max(e.sessionHigh,n)},milestoneReached:n>e.sessionHigh}}function P(e){return e.playerDecisions===0?null:Math.round(e.playerDecisionsMatched/e.playerDecisions*100)}function F(e){let t=e.history.join(` → `),n=e.showdown?`showdown`:`fold`,r=e.winner===`player`?`You won`:`AI won`,i=e.playerNet>0?`+${e.playerNet}`:`${e.playerNet}`;return`${r} by ${n} · you: ${w[e.playerCard]}, AI: ${w[e.opponentCard]} · ${t} · net ${i}`}var I=`bluff-call:muted`;function L(){if(typeof window>`u`)return null;let e=window;return e.AudioContext??e.webkitAudioContext??null}function R(e){try{return e.getItem(I)===`true`}catch{return!1}}function z(e,t){try{e.setItem(I,String(t))}catch{}}function B(e){let t=L(),n=null,r=R(e);function i(){return t?(n||=new t,n.state===`suspended`&&n.resume(),n):null}function a(e){if(r)return;let t=i();if(!t)return;let n=t.currentTime+(e.delay??0),a=t.createOscillator(),o=t.createGain();a.type=e.shape??`sine`,a.frequency.setValueAtTime(e.freq,n),e.slideTo!==void 0&&a.frequency.linearRampToValueAtTime(e.slideTo,n+e.duration);let s=e.gain??.08;o.gain.setValueAtTime(0,n),o.gain.linearRampToValueAtTime(s,n+.01),o.gain.exponentialRampToValueAtTime(1e-4,n+e.duration),a.connect(o).connect(t.destination),a.start(n),a.stop(n+e.duration+.02)}function o(e){for(let t of e)a(t)}return{playDeal(){a({freq:620,duration:.08,shape:`triangle`,gain:.05})},playFlip(){a({freq:480,duration:.09,shape:`triangle`,slideTo:720,gain:.05})},playBet(){a({freq:220,duration:.09,shape:`square`,gain:.06})},playFold(){a({freq:500,duration:.14,shape:`sine`,slideTo:160,gain:.05})},playReveal(){o([{freq:660,duration:.14,shape:`sine`,gain:.05},{freq:880,duration:.18,shape:`sine`,gain:.05,delay:.09}])},playWin(){o([{freq:523.25,duration:.14,shape:`triangle`,gain:.06},{freq:659.25,duration:.14,shape:`triangle`,gain:.06,delay:.1},{freq:783.99,duration:.14,shape:`triangle`,gain:.06,delay:.2},{freq:1046.5,duration:.22,shape:`triangle`,gain:.06,delay:.3}])},toggleMute(){return r=!r,z(e,r),r},isMuted(){return r}}}function V(){return`
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
      <div
        class="confirmation"
        id="reset-confirmation"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        aria-hidden="true"
      >
        <div class="confirmation-card">
          <p class="eyebrow">Clear the ledger?</p>
          <h2 id="reset-title">Start a new session</h2>
          <p>This resets your bankroll, accuracy, and hand history.</p>
          <div class="confirmation-actions">
            <button id="reset-cancel" class="btn btn-ghost" type="button">Keep this session</button>
            <button id="reset-confirm" class="btn btn-fold" type="button">Reset session</button>
          </div>
        </div>
      </div>
    </div>
  `}var H=.2,U=550,W=50;function G(){let e=new URLSearchParams(window.location.search).get(`seed`);return e===null?j():A(Number(e))}function K(e){let t=document.getElementById(e);if(!t)throw Error(`Expected #${e} to exist in the rendered shell`);return t}function q(){let e=document.querySelector(`#app`);if(!e)return;e.innerHTML=V();let t={opponentCard:K(`opponent-card`),playerCard:K(`player-card`),potValue:K(`pot-value`),potDisplay:K(`pot-display`),actionRow:K(`action-row`),statusLine:K(`status-line`),bankrollValue:K(`bankroll-value`),accuracyValue:K(`accuracy-value`),historyToggle:K(`history-toggle`),historyList:K(`history-list`),newSessionButton:K(`new-session`),marginPanel:K(`margin-panel`),marginHeadline:K(`margin-headline`),marginDecisions:K(`margin-decisions`),nextHandButton:K(`next-hand`),celebration:K(`celebration`),celebrationStats:K(`celebration-stats`),celebrationClose:K(`celebration-close`),resetConfirmation:K(`reset-confirmation`),resetCancel:K(`reset-cancel`),resetConfirm:K(`reset-confirm`),muteToggle:K(`mute-toggle`),muteIcon:K(`mute-icon`)},n=G(),i=B(window.localStorage),a=v(window.sessionStorage,m()),o={deal:r(n),history:[],bankroll:a,sessionStats:M(a.startingBalance),handHistory:[],handActive:!0,pendingMilestone:!1},s=null;function c(){s!==null&&(window.clearTimeout(s),s=null)}function l(){c(),s=window.setTimeout(()=>{s=null,$()},U)}function u(e){return 2+e.filter(e=>e===`bet`||e===`call`).length}function d(e,t,n){e.classList.remove(`card--back`),e.innerHTML=`<span class="card-rank">${t}</span><span class="card-name">${w[t]}</span>`,_(e,n)}function p(e,t){e.classList.add(`card--back`),e.innerHTML=``,_(e,t)}function _(e,t){let n=t===`deal`?`card--dealing`:t===`flip`?`card--flipping`:null;n&&(e.classList.remove(`card--dealing`,`card--flipping`),e.offsetWidth,e.classList.add(n))}function y(){t.potDisplay.classList.remove(`pot--bump`),t.potDisplay.offsetWidth,t.potDisplay.classList.add(`pot--bump`)}function T(){t.potValue.textContent=String(u(o.history))}function E(){t.bankrollValue.textContent=String(o.bankroll.balance);let e=P(o.sessionStats);t.accuracyValue.textContent=e===null?`Not yet`:`${e}%`}function D(){if(t.historyToggle.textContent=`Hand history (${o.handHistory.length})`,o.handHistory.length===0){t.historyList.innerHTML=`<li class="empty-state">No hands played yet this session.</li>`;return}t.historyList.innerHTML=o.handHistory.map(e=>`<li class="history-entry ${e.winner===`player`?`history-entry-win`:`history-entry-loss`}">${J(F(e))}</li>`).join(``)}function k(){let e=b(o.history)===`player`?S(o.history):[];for(let n of t.actionRow.querySelectorAll(`button[data-action]`)){let t=n.dataset.action;n.disabled=!e.includes(t)}}function A(e){t.marginHeadline.textContent=e.headline,t.marginDecisions.innerHTML=e.decisions.map(e=>{let t=Math.round(e.probability*100);return`<li>${e.actor===`player`?`You`:`The AI`} held the ${w[e.card]} and chose to ${e.actionTaken}. The equilibrium takes that line <span class="margin-freq">${t}%</span> of the time.</li>`}).join(``),t.marginPanel.classList.add(`open`)}function j(){t.marginPanel.classList.remove(`open`)}function I(){let e=P(o.sessionStats);t.celebrationStats.innerHTML=`
      <div><span class="celebration-stat-value">${o.sessionStats.handsPlayed}</span><span class="celebration-stat-label">Hands played</span></div>
      <div><span class="celebration-stat-value">${e===null?`n/a`:`${e}%`}</span><span class="celebration-stat-label">Equilibrium accuracy</span></div>
      <div><span class="celebration-stat-value">${o.bankroll.balance}</span><span class="celebration-stat-label">Bankroll</span></div>
    `,t.celebration.classList.add(`open`),t.celebration.setAttribute(`aria-hidden`,`false`),t.celebrationClose.focus()}function L(){t.celebration.classList.remove(`open`),t.celebration.setAttribute(`aria-hidden`,`true`)}function R(){t.resetConfirmation.classList.add(`open`),t.resetConfirmation.setAttribute(`aria-hidden`,`false`),t.resetCancel.focus()}function z(){t.resetConfirmation.classList.remove(`open`),t.resetConfirmation.setAttribute(`aria-hidden`,`true`)}function q(){let e=m();o.bankroll=e,o.sessionStats=M(e.startingBalance),o.handHistory=[],g(e,window.sessionStorage),E(),D(),X()}function Y(e){t.muteToggle.setAttribute(`aria-pressed`,String(e)),t.muteToggle.setAttribute(`aria-label`,e?`Unmute sound`:`Mute sound`),t.muteIcon.innerHTML=e?`&#128263;`:`&#128266;`}function X(){c(),j(),L(),o.deal=r(n),o.history=[],o.handActive=!0,d(t.playerCard,o.deal.player,`deal`),p(t.opponentCard,`deal`),i.playDeal(),T(),t.statusLine.textContent=`Your move.`,k()}function Z(){c(),o.handActive=!1;let e=C(o.history,o.deal.player,o.deal.opponent);o.bankroll=h(o.bankroll,e.playerNet),g(o.bankroll,window.sessionStorage),d(t.opponentCard,o.deal.opponent,`flip`),i.playReveal();let n=O(o.history,o.deal.player,o.deal.opponent,H),{stats:r,milestoneReached:a}=N(o.sessionStats,n,o.bankroll.balance);o.sessionStats=r,o.handHistory.unshift({index:o.handHistory.length,playerCard:o.deal.player,opponentCard:o.deal.opponent,history:o.history,winner:e.winner,showdown:e.showdown,playerNet:e.playerNet}),o.handHistory.length>W&&(o.handHistory.length=W),E(),D(),k(),A(n);let s=e.winner===`player`?`You win`:`AI wins`;t.statusLine.textContent=`${s} the ${u(o.history)}-chip pot.`,e.winner===`player`&&window.setTimeout(()=>i.playWin(),200),o.pendingMilestone=a}function Q(e){if(!o.handActive||x(o.history))return;let n=b(o.history);if(!n||!S(o.history).includes(e))return;let r=e===`fold`?n:null;if(o.history=[...o.history,e],e===`bet`||e===`call`)i.playBet(),y(),T();else if(e===`fold`){i.playFold();let e=r===`player`?t.playerCard:t.opponentCard;_(e,null),e.classList.add(`card--folded`)}else i.playFlip();if(x(o.history)){Z();return}k(),b(o.history)===`opponent`?(t.statusLine.textContent=`AI is thinking…`,l()):t.statusLine.textContent=`Your move.`}function $(){o.handActive&&Q(f(o.deal.opponent,o.history,H,n))}t.actionRow.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof HTMLElement))return;let n=t.closest(`button[data-action]`);!n||n.disabled||Q(n.dataset.action)}),t.nextHandButton.addEventListener(`click`,()=>{j(),o.pendingMilestone?(o.pendingMilestone=!1,I()):X()}),t.historyToggle.addEventListener(`click`,()=>{let e=t.historyList.classList.toggle(`open`);t.historyToggle.setAttribute(`aria-expanded`,String(e))}),t.newSessionButton.addEventListener(`click`,()=>{if(o.sessionStats.handsPlayed>0){R();return}q()}),t.resetCancel.addEventListener(`click`,()=>{z(),t.newSessionButton.focus()}),t.resetConfirm.addEventListener(`click`,()=>{z(),q()}),t.resetConfirmation.addEventListener(`keydown`,e=>{if(e.key===`Escape`){z(),t.newSessionButton.focus();return}if(e.key!==`Tab`)return;let n=e.shiftKey?t.resetCancel:t.resetConfirm;document.activeElement===n&&(e.preventDefault(),(e.shiftKey?t.resetConfirm:t.resetCancel).focus())}),t.celebrationClose.addEventListener(`click`,()=>{L(),X()}),t.celebration.addEventListener(`keydown`,e=>{if(e.key===`Escape`){L(),X();return}e.key===`Tab`&&(e.preventDefault(),t.celebrationClose.focus())}),t.muteToggle.addEventListener(`click`,()=>{Y(i.toggleMute())}),Y(i.isMuted()),E(),D(),X()}function J(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}q();