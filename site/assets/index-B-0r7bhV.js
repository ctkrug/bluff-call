(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function s(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(o){if(o.ep)return;o.ep=!0;const n=s(o);fetch(o.href,n)}})();const ee=["J","Q","K"],E={J:1,Q:2,K:3};function te(e,t){return E[e]>E[t]}function I(e){const t=[...ee];for(let n=t.length-1;n>0;n-=1){const r=e();if(!Number.isFinite(r)||r<0||r>=1)throw new RangeError(`RNG must return a finite value in [0, 1), got ${r}`);const c=Math.floor(r*(n+1));[t[n],t[c]]=[t[c],t[n]]}const[s,i,o]=t;return{player:s,opponent:i,undealt:o}}const R=0,P=1/3;function ne(e){if(Number.isNaN(e)||e<R||e>P)throw new RangeError(`alpha must be within [${R}, ${P.toFixed(4)}], got ${e}`)}function J(e){return e.length===0?"player_open":e.length===1?e[0]==="check"?"opponent_facing_check":"opponent_facing_bet":e.length===2&&e[0]==="check"&&e[1]==="bet"?"player_facing_check_bet":null}const Y={player_open:"bet",player_facing_check_bet:"call",opponent_facing_check:"bet",opponent_facing_bet:"call"},ae={player_open:"check",player_facing_check_bet:"fold",opponent_facing_check:"check",opponent_facing_bet:"fold"};function ie(e){return Y[e]}const oe={player_open:{J:e=>e,Q:()=>0,K:e=>3*e},player_facing_check_bet:{J:()=>0,Q:e=>e+1/3,K:()=>1},opponent_facing_check:{J:()=>1/3,Q:()=>0,K:()=>1},opponent_facing_bet:{J:()=>0,Q:()=>1/3,K:()=>1}};function j(e,t,s){ne(s);const i=J(t);if(!i)throw new Error(`No decision point at terminal history: [${t.join(",")}]`);const o=oe[i][e](s);return[{action:Y[i],probability:o},{action:ae[i],probability:1-o}]}function se(e,t,s,i){const o=j(e,t,s),n=i();if(!Number.isFinite(n)||n<0||n>=1)throw new RangeError(`RNG must return a finite value in [0, 1), got ${n}`);let r=0;for(const{action:c,probability:d}of o)if(r+=d,n<r)return c;return o[o.length-1].action}const re=20,G="bluff-call:bankroll:v1";function _(e=re){return{balance:e,startingBalance:e}}function le(e,t){return{...e,balance:e.balance+t}}function B(e,t){try{t.setItem(G,JSON.stringify(e))}catch{}}function ce(e){if(typeof e!="object"||e===null)return!1;const t=e;return typeof t.balance=="number"&&Number.isFinite(t.balance)&&typeof t.startingBalance=="number"&&Number.isFinite(t.startingBalance)}function de(e,t=_()){let s;try{s=e.getItem(G)}catch{return t}if(!s)return t;try{const i=JSON.parse(s);return ce(i)?i:t}catch{return t}}function Q(e){const t=e.join(",");return["","check","bet","check,check","check,bet","bet,call","bet,fold","check,bet,call","check,bet,fold"].includes(t)}function v(e){return Q(e)?e.length===0?"player":e.length===1?"opponent":e.length===2&&e[0]==="check"&&e[1]==="bet"?"player":null:null}function M(e){return Q(e)&&e.length>0&&v(e)===null}function K(e){if(!v(e))return[];if(e.length===0)return["check","bet"];const s=e[0];return e.length===1?s==="check"?["check","bet"]:["call","fold"]:["call","fold"]}function W(e,t,s){if(!M(e))throw new Error(`resolveHand called on non-terminal history: [${e.join(",")}]`);const i=e.join(","),o=te(t,s);switch(i){case"check,check":return{winner:o?"player":"opponent",showdown:!0,playerNet:o?1:-1};case"check,bet,fold":return{winner:"opponent",showdown:!1,playerNet:-1};case"check,bet,call":return{winner:o?"player":"opponent",showdown:!0,playerNet:o?2:-2};case"bet,fold":return{winner:"player",showdown:!1,playerNet:1};case"bet,call":return{winner:o?"player":"opponent",showdown:!0,playerNet:o?2:-2};default:throw new Error(`Unreachable terminal history: [${e.join(",")}]`)}}const T={J:"Jack",Q:"Queen",K:"King"};function ue(e){return e==="player"?"You":"The AI"}function pe(e){return e==="player"?"your":"its"}function he(e,t,s,i,o){const n=Math.round(o*100),r=T[t],d=ie(s)==="bet"?"bets":"calls";return`Holding the ${r}, ${ue(e).toLowerCase()} the equilibrium ${d} ${n}% of the time — ${pe(e)} actual play was to ${i}.`}function fe(e,t,s,i){const o=W(e,t,s),n=[];for(let d=0;d<e.length;d+=1){const h=e.slice(0,d),f=v(h),b=J(h);if(!f||!b)throw new Error(`Malformed history passed to buildReveal: [${e.join(",")}]`);const y=f==="player"?t:s,m=e[d],g=j(y,h,i).find(N=>N.action===m),w=(g==null?void 0:g.probability)??0,k=y==="J"&&m==="bet";n.push({actor:f,card:y,decisionPoint:b,actionTaken:m,probability:w,isBluff:k,sentence:he(f,y,b,m,w)})}const r=n.find(d=>d.actor==="opponent"&&d.isBluff);return{headline:be(r,o.winner),decisions:n}}function be(e,t){if(!e)return"Here's what the equilibrium says about this hand.";const s=Math.round(e.probability*100);return t==="opponent"?`You lost to a bluff — the AI's Jack takes that line ${s}% of the time. Here's the proof.`:`The AI tried to bluff with the Jack (it does that ${s}% of the time here) — but it didn't get there.`}function ye(e){let t=e>>>0;return function(){t=t+1831565813>>>0;let i=t;return i=Math.imul(i^i>>>15,i|1),i^=i+Math.imul(i^i>>>7,i|61),((i^i>>>14)>>>0)/4294967296}}function ge(){return()=>Math.random()}function D(e){return{handsPlayed:0,playerDecisions:0,playerDecisionsMatched:0,sessionHigh:e}}function me(e,t,s){const i=t.decisions.filter(r=>r.actor==="player"),o=i.filter(r=>r.probability>=.5).length;return{stats:{handsPlayed:e.handsPlayed+1,playerDecisions:e.playerDecisions+i.length,playerDecisionsMatched:e.playerDecisionsMatched+o,sessionHigh:Math.max(e.sessionHigh,s)},milestoneReached:s>e.sessionHigh}}function V(e){return e.playerDecisions===0?null:Math.round(e.playerDecisionsMatched/e.playerDecisions*100)}function we(e){const t=e.history.join(" → "),s=e.showdown?"showdown":"fold",i=e.winner==="player"?"You won":"AI won",o=e.playerNet>0?`+${e.playerNet}`:`${e.playerNet}`;return`${i} by ${s} — you: ${T[e.playerCard]}, AI: ${T[e.opponentCard]} — ${t} — net ${o}`}const U="bluff-call:muted";function ve(){if(typeof window>"u")return null;const e=window;return e.AudioContext??e.webkitAudioContext??null}function ke(e){try{return e.getItem(U)==="true"}catch{return!1}}function Ae(e,t){try{e.setItem(U,String(t))}catch{}}function Te(e){const t=ve();let s=null,i=ke(e);function o(){return t?(s||(s=new t),s.state==="suspended"&&s.resume(),s):null}function n(c){if(i)return;const d=o();if(!d)return;const h=d.currentTime+(c.delay??0),f=d.createOscillator(),b=d.createGain();f.type=c.shape??"sine",f.frequency.setValueAtTime(c.freq,h),c.slideTo!==void 0&&f.frequency.linearRampToValueAtTime(c.slideTo,h+c.duration);const y=c.gain??.08;b.gain.setValueAtTime(0,h),b.gain.linearRampToValueAtTime(y,h+.01),b.gain.exponentialRampToValueAtTime(1e-4,h+c.duration),f.connect(b).connect(d.destination),f.start(h),f.stop(h+c.duration+.02)}function r(c){for(const d of c)n(d)}return{playDeal(){n({freq:620,duration:.08,shape:"triangle",gain:.05})},playFlip(){n({freq:480,duration:.09,shape:"triangle",slideTo:720,gain:.05})},playBet(){n({freq:220,duration:.09,shape:"square",gain:.06})},playFold(){n({freq:500,duration:.14,shape:"sine",slideTo:160,gain:.05})},playReveal(){r([{freq:660,duration:.14,shape:"sine",gain:.05},{freq:880,duration:.18,shape:"sine",gain:.05,delay:.09}])},playWin(){r([{freq:523.25,duration:.14,shape:"triangle",gain:.06},{freq:659.25,duration:.14,shape:"triangle",gain:.06,delay:.1},{freq:783.99,duration:.14,shape:"triangle",gain:.06,delay:.2},{freq:1046.5,duration:.22,shape:"triangle",gain:.06,delay:.3}])},toggleMute(){return i=!i,Ae(e,i),i},isMuted(){return i}}}function Se(){return`
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
      >
        <div class="celebration-card">
          <h2 class="celebration-title" id="celebration-title">New session high!</h2>
          <div class="celebration-stats" id="celebration-stats"></div>
          <button id="celebration-close" class="btn btn-bet" type="button">Keep playing</button>
        </div>
      </div>
    </div>
  `}const O=.2,Le=550,F=50;function He(){const t=new URLSearchParams(window.location.search).get("seed");return t!==null?ye(Number(t)):ge()}function u(e){const t=document.getElementById(e);if(!t)throw new Error(`Expected #${e} to exist in the rendered shell`);return t}function Ne(){const e=document.querySelector("#app");if(!e)return;e.innerHTML=Se();const t={opponentCard:u("opponent-card"),playerCard:u("player-card"),potValue:u("pot-value"),potDisplay:u("pot-display"),actionRow:u("action-row"),statusLine:u("status-line"),bankrollValue:u("bankroll-value"),accuracyValue:u("accuracy-value"),historyToggle:u("history-toggle"),historyList:u("history-list"),newSessionButton:u("new-session"),marginPanel:u("margin-panel"),marginHeadline:u("margin-headline"),marginDecisions:u("margin-decisions"),nextHandButton:u("next-hand"),celebration:u("celebration"),celebrationStats:u("celebration-stats"),celebrationClose:u("celebration-close"),muteToggle:u("mute-toggle"),muteIcon:u("mute-icon")},s=He(),i=Te(window.localStorage),o=de(window.sessionStorage,_()),n={deal:I(s),history:[],bankroll:o,sessionStats:D(o.startingBalance),handHistory:[],handActive:!0,pendingMilestone:!1};let r=null;function c(){r!==null&&(window.clearTimeout(r),r=null)}function d(){c(),r=window.setTimeout(()=>{r=null,Z()},Le)}function h(a){return 2+a.filter(l=>l==="bet"||l==="call").length}function f(a,l,p){a.classList.remove("card--back"),a.innerHTML=`<span class="card-rank">${l}</span><span class="card-name">${T[l]}</span>`,y(a,p)}function b(a,l){a.classList.add("card--back"),a.innerHTML="",y(a,l)}function y(a,l){const p=l==="deal"?"card--dealing":l==="flip"?"card--flipping":null;p&&(a.classList.remove("card--dealing","card--flipping"),a.offsetWidth,a.classList.add(p))}function m(){t.potDisplay.classList.remove("pot--bump"),t.potDisplay.offsetWidth,t.potDisplay.classList.add("pot--bump")}function H(){t.potValue.textContent=String(h(n.history))}function g(){t.bankrollValue.textContent=String(n.bankroll.balance);const a=V(n.sessionStats);t.accuracyValue.textContent=a===null?"—":`${a}%`}function w(){if(t.historyToggle.textContent=`Hand history (${n.handHistory.length})`,n.handHistory.length===0){t.historyList.innerHTML='<li class="empty-state">No hands played yet this session.</li>';return}t.historyList.innerHTML=n.handHistory.map(a=>`<li class="history-entry ${a.winner==="player"?"history-entry-win":"history-entry-loss"}">${_e(we(a))}</li>`).join("")}function k(){const l=v(n.history)==="player"?K(n.history):[];for(const p of t.actionRow.querySelectorAll("button[data-action]")){const A=p.dataset.action;p.disabled=!l.includes(A)}}function N(a){t.marginHeadline.textContent=a.headline,t.marginDecisions.innerHTML=a.decisions.map(l=>{const p=Math.round(l.probability*100);return`<li>${l.actor==="player"?"You":"The AI"} held the ${T[l.card]} and chose to ${l.actionTaken}. The equilibrium takes that line <span class="margin-freq">${p}%</span> of the time.</li>`}).join(""),t.marginPanel.classList.add("open")}function C(){t.marginPanel.classList.remove("open")}function X(){const a=V(n.sessionStats);t.celebrationStats.innerHTML=`
      <div><span class="celebration-stat-value">${n.sessionStats.handsPlayed}</span><span class="celebration-stat-label">Hands played</span></div>
      <div><span class="celebration-stat-value">${a===null?"—":`${a}%`}</span><span class="celebration-stat-label">Equilibrium accuracy</span></div>
      <div><span class="celebration-stat-value">${n.bankroll.balance}</span><span class="celebration-stat-label">Bankroll</span></div>
    `,t.celebration.classList.add("open")}function q(){t.celebration.classList.remove("open")}function x(a){t.muteToggle.setAttribute("aria-pressed",String(a)),t.muteToggle.setAttribute("aria-label",a?"Unmute sound":"Mute sound"),t.muteIcon.innerHTML=a?"&#128263;":"&#128266;"}function S(){c(),C(),q(),n.deal=I(s),n.history=[],n.handActive=!0,f(t.playerCard,n.deal.player,"deal"),b(t.opponentCard,"deal"),i.playDeal(),H(),t.statusLine.textContent="Your move.",k()}function z(){c(),n.handActive=!1;const a=W(n.history,n.deal.player,n.deal.opponent);n.bankroll=le(n.bankroll,a.playerNet),B(n.bankroll,window.sessionStorage),f(t.opponentCard,n.deal.opponent,"flip"),i.playReveal();const l=fe(n.history,n.deal.player,n.deal.opponent,O),{stats:p,milestoneReached:A}=me(n.sessionStats,l,n.bankroll.balance);n.sessionStats=p,n.handHistory.unshift({index:n.handHistory.length,playerCard:n.deal.player,opponentCard:n.deal.opponent,history:n.history,winner:a.winner,showdown:a.showdown,playerNet:a.playerNet}),n.handHistory.length>F&&(n.handHistory.length=F),g(),w(),k(),N(l);const L=a.winner==="player"?"You win":"AI wins";t.statusLine.textContent=`${L} the ${h(n.history)}-chip pot.`,a.winner==="player"&&window.setTimeout(()=>i.playWin(),200),n.pendingMilestone=A}function $(a){if(!n.handActive||M(n.history))return;const l=v(n.history);if(!l||!K(n.history).includes(a))return;const p=a==="fold"?l:null;if(n.history=[...n.history,a],a==="bet"||a==="call")i.playBet(),m(),H();else if(a==="fold"){i.playFold();const L=p==="player"?t.playerCard:t.opponentCard;y(L,null),L.classList.add("card--folded")}else i.playFlip();if(M(n.history)){z();return}k(),v(n.history)==="opponent"?(t.statusLine.textContent="AI is thinking…",d()):t.statusLine.textContent="Your move."}function Z(){if(!n.handActive)return;const a=se(n.deal.opponent,n.history,O,s);$(a)}t.actionRow.addEventListener("click",a=>{const l=a.target;if(!(l instanceof HTMLElement))return;const p=l.closest("button[data-action]");!p||p.disabled||$(p.dataset.action)}),t.nextHandButton.addEventListener("click",()=>{C(),n.pendingMilestone?(n.pendingMilestone=!1,X()):S()}),t.historyToggle.addEventListener("click",()=>{const a=t.historyList.classList.toggle("open");t.historyToggle.setAttribute("aria-expanded",String(a))}),t.newSessionButton.addEventListener("click",()=>{if(n.sessionStats.handsPlayed>0&&!window.confirm("Start a new session? This resets your bankroll and hand history."))return;const a=_();n.bankroll=a,n.sessionStats=D(a.startingBalance),n.handHistory=[],B(a,window.sessionStorage),g(),w(),S()}),t.celebrationClose.addEventListener("click",()=>{q(),S()}),t.muteToggle.addEventListener("click",()=>{x(i.toggleMute())}),x(i.isMuted()),g(),w(),S()}function _e(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}Ne();
