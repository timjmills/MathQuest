// MAP Test Practice — adaptive item-selection engine (Phase 3 implementation).
//
// Drives a session of adaptive items selected from a tier/band/domain pool.
// Reuses the existing generateQuestion() dispatcher and renderQuestion()
// renderer; intercepts the answer-check flow via a state.mapMode branch in
// answer-check.js so the engine owns its own next-item loop.

import { state } from './state.js';
import { showView } from './navigation.js';
import {
    RIT_BAND_SKILLS_K2, RIT_BAND_SKILLS_35,
    MAP_BAND_MIDPOINTS, getMapDomain, getMapSkillsForBands,
    getCategoryForSkill, getDomainByCategory, DOMAINS, SKILLS,
} from './data.js';
import { generateQuestion } from './generate-question.js';
import { renderQuestion } from './question-render.js';

const DOMAINS_ORDER = ['OA', 'NO', 'MD', 'G'];

// Install a passive click listener that records the last real DOM click time.
// Used by the rapid-guess gate to differentiate a real student click from a
// programmatic page.evaluate() call (the existing test-map-smoke.cjs).
// `isTrusted` is true only for real user-generated events.
if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('click', (ev) => {
        if (ev && ev.isTrusted) {
            state._lastUserClickTime = Date.now();
        }
    }, true);
}

// The renderer (renderQuestion) hard-codes element lookups by ID
// (questionCard, qNum, questionText, visualAid, answerOptions, answerInput,
// answerInputArea, feedbackArea, hintBtn, ttsBtn, solutionBtn, nextBtn,
// nextBtnContainer, gameScore, skillLabel). Those IDs already exist inside
// gameView in index.html. To avoid duplicate-ID collisions (which made
// renderQuestion paint into the hidden gameView card and leave the visible
// MAP container stuck on the placeholder "Question"), we MOVE the existing
// questionCard from its current parent into #mapQuestionContainer for the
// duration of the MAP session, then return it on finalize.
//
// We also inject a hidden #gameScore stub so the renderer's
// `document.getElementById('gameScore').innerText = ...` assignment is safe
// once the real #gameScore (which lives in gameView's header) gets borrowed
// indirectly via the questionCard move (it does NOT — gameScore stays put).
let _mapPrevCardParent = null;
let _mapPrevCardNextSibling = null;

function ensureSessionScaffold() {
    const container = document.getElementById('mapQuestionContainer');
    if (!container) return;
    const card = document.getElementById('questionCard');
    if (!card) {
        console.warn('[MAP] #questionCard not found — cannot mount MAP session.');
        return;
    }
    // Already inside the MAP container? Nothing to do.
    if (card.parentElement === container) return;

    // Remember where the card came from so we can put it back later.
    _mapPrevCardParent = card.parentElement;
    _mapPrevCardNextSibling = card.nextSibling;

    // Move the existing card into the MAP container. appendChild moves the
    // node — no clones, no duplicate IDs.
    container.innerHTML = '';
    container.appendChild(card);

    // The renderer occasionally writes into #gameScore (which lives in the
    // gameView header and is NOT moved). Add a hidden stub inside the card
    // only if the live #gameScore element isn't currently in the DOM (i.e.
    // gameView was removed). The default index.html keeps gameView mounted,
    // so this stub is rarely needed but is a no-cost safety net.
    if (!document.getElementById('gameScore')) {
        const stub = document.createElement('div');
        stub.id = 'gameScore';
        stub.style.display = 'none';
        card.appendChild(stub);
    }
}

// Return the borrowed questionCard to its original parent in gameView.
// Idempotent — safe to call even if no MAP session is active.
function releaseSessionScaffold() {
    if (!_mapPrevCardParent) return;
    const card = document.getElementById('questionCard');
    if (card && _mapPrevCardParent && document.body.contains(_mapPrevCardParent)) {
        if (_mapPrevCardNextSibling && _mapPrevCardNextSibling.parentNode === _mapPrevCardParent) {
            _mapPrevCardParent.insertBefore(card, _mapPrevCardNextSibling);
        } else {
            _mapPrevCardParent.appendChild(card);
        }
    }
    _mapPrevCardParent = null;
    _mapPrevCardNextSibling = null;
}

export function startMapSession(opts) {
    if (!opts || !Array.isArray(opts.bands) || !Array.isArray(opts.domains)) {
        console.warn('[MAP] startMapSession called with invalid opts', opts);
        return;
    }

    // Worksheet mode: short-circuit to the existing on-screen worksheet pipeline.
    // (No adaptive engine — render N items chosen from the MAP pool all at once.)
    if (opts.mode === 'worksheet') {
        return startMapWorksheetSession(opts);
    }

    // Reset session state
    state.mapMode = true;
    state.mapTier = opts.tier;
    state.mapSessionMode = opts.mode || 'practice';
    state.mapSelectedBands = opts.bands.slice();
    state.mapSelectedDomains = opts.domains.slice();
    state.mapItemCountTarget = opts.itemCount || 20;
    state.mapItemCount = 0;

    // Initial RIT: midpoint of selected bands
    const mids = opts.bands.map(b => MAP_BAND_MIDPOINTS[b] || 185);
    state.mapCurrentRit = Math.round(
        mids.reduce((a, b) => a + b, 0) / Math.max(1, mids.length)
    );

    state.mapCorrectStreak = 0;
    state.mapIncorrectStreak = 0;
    state.mapPerDomainItems = { OA: 0, NO: 0, MD: 0, G: 0 };
    state.mapPerDomainCorrect = { OA: 0, NO: 0, MD: 0, G: 0 };
    state.mapPerDomainRitSum = { OA: 0, NO: 0, MD: 0, G: 0 };
    state.mapHistory = [];
    state.mapNavigationOpen = false;
    state.mapReviewingIndex = -1;
    state.mapStartedAt = Date.now();
    state.mapEndedAt = null;
    state.mapTimeCapMs = opts.timeCap || 0;

    // K-2 defaults: audio + large + numpad
    if (!state.mapFeatures) state.mapFeatures = {};
    if (opts.tier === 'k2') {
        state.mapFeatures.audioAutoPlay = true;
        state.mapFeatures.largeTargets = true;
        state.mapFeatures.numpadOnly = true;
    } else {
        state.mapFeatures.audioAutoPlay = false;
        state.mapFeatures.largeTargets = false;
        state.mapFeatures.numpadOnly = false;
    }

    // Reset rapid-guess tracking for the new session
    state.lastQuestionRenderTime = 0;
    state.rapidGuessStreak = 0;

    showView('mapSessionView');
    ensureSessionScaffold();
    // Paint the empty navigator strip for the new session.
    renderMapNavBar();

    // Full-screen immersion: hide top app chrome (nav-bar, my-stats, student
    // banner, floating timer) for the duration of the MAP session.
    if (typeof document !== 'undefined' && document.body) {
        document.body.classList.add('map-immersive');
    }

    // Inject the always-visible Audio toggle so students can flip TTS on/off
    // even though the regular .btn-tts header chrome is hidden by immersion.
    injectMapAudioToggle();
    // Inject always-visible End Session button so students can wrap up early
    // and see whatever results they have so far.
    injectMapEndButton();

    // Reset cross-tier banner gate for the new session.
    state.mapCrossTierSuggested = false;

    // Update banner — "∞" when in unlimited mode (no item-count cap).
    const itemTotal = document.getElementById('mapItemTotal');
    if (itemTotal) {
        itemTotal.textContent = (state.mapItemCountTarget > 0)
            ? String(state.mapItemCountTarget) : '∞';
    }
    const modeTag = document.getElementById('mapModeTag');
    if (modeTag) {
        modeTag.textContent = String(state.mapSessionMode).toUpperCase();
        modeTag.className = 'map-mode-tag ' + state.mapSessionMode;
    }

    nextMapItem();
}

/**
 * Look up display info for a skill so it can be queued like a normal skill.
 * Returns { categoryId, skillId, skillLabel, categoryIcon, categoryName, domainId }.
 */
function buildQueueEntry(skillId) {
    const categoryId = getCategoryForSkill(skillId);
    let skillLabel = skillId;
    if (categoryId && Array.isArray(SKILLS[categoryId])) {
        const found = SKILLS[categoryId].find(s => s.v === skillId);
        if (found && found.l) skillLabel = found.l;
    }
    let categoryIcon = '📚';
    let categoryName = categoryId || '';
    let domainId = null;
    if (categoryId) {
        domainId = getDomainByCategory(categoryId);
        const dom = domainId && DOMAINS[domainId];
        const cat = dom && Array.isArray(dom.categories)
            ? dom.categories.find(c => c.id === categoryId)
            : null;
        if (cat) {
            categoryIcon = cat.icon || categoryIcon;
            categoryName = cat.name || categoryName;
        }
    }
    return { categoryId, skillId, skillLabel, categoryIcon, categoryName, domainId };
}

/**
 * MAP "Worksheet" mode — render the MAP-selected skill set as an interactive
 * on-screen worksheet (existing worksheetView). Shows N items at once with a
 * single Submit at the bottom.
 *
 * Pulls skills from the same RIT_BAND_SKILLS pool the adaptive engine uses,
 * loads them into window.skillQueue, sets state.gameMode='worksheet', then
 * delegates to the existing startGame() pipeline (which routes through
 * playSelectedSkills() because the queue is non-empty).
 */
function startMapWorksheetSession(opts) {
    const skills = getMapSkillsForBands(opts.bands, opts.tier)
        .filter(id => opts.domains.includes(getMapDomain(id)));
    if (!skills.length) {
        alert('No MAP skills match the current selection.');
        return;
    }

    // Build queue entries
    const queue = skills.map(buildQueueEntry).filter(e => e.categoryId);
    if (!queue.length) {
        alert('No playable MAP skills match the current selection.');
        return;
    }
    window.skillQueue = queue;

    // Configure worksheet length and game mode
    const itemCount = Math.max(1, parseInt(opts.itemCount, 10) || 20);
    state.gameMode = 'worksheet';
    state.problemCount = itemCount;
    state.mapMode = false;       // not running adaptive engine
    state.mapWorksheetActive = true;
    state.mapTier = opts.tier;
    state.mapSelectedBands = opts.bands.slice();
    state.mapSelectedDomains = opts.domains.slice();

    // Sync the problemCountSelect element so startGame()/newWorksheet() honor
    // our requested count. The dropdown only has a fixed list of values, so
    // inject a temporary option if our exact value isn't present.
    const pcSel = document.getElementById('problemCountSelect');
    if (pcSel) {
        let opt = Array.from(pcSel.options).find(o => parseInt(o.value, 10) === itemCount);
        if (!opt) {
            opt = document.createElement('option');
            opt.value = String(itemCount);
            opt.textContent = String(itemCount);
            opt.dataset.mapInjected = '1';
            pcSel.appendChild(opt);
        }
        pcSel.value = String(itemCount);
    }

    // Delegate to existing pipeline. startGame() sees a non-empty skillQueue
    // and forwards to playSelectedSkills('worksheet') which sets up
    // mixedModeSettings and finally calls startGame() again to enter worksheet
    // (which reads problemCountSelect for state.problemCount).
    if (typeof window.startGame === 'function') {
        window.startGame();
    } else {
        alert('Game system not available.');
    }
}

export function nextMapItem() {
    if (!state.mapMode) return;

    // Stop conditions — unlimited mode (target <= 0) skips the count cap.
    if (state.mapItemCountTarget > 0 && state.mapItemCount >= state.mapItemCountTarget) {
        return finalizeMapSession();
    }
    if (state.mapTimeCapMs > 0 && (Date.now() - state.mapStartedAt) >= state.mapTimeCapMs) {
        return finalizeMapSession();
    }

    const skill = chooseNextSkill();
    if (!skill) {
        console.warn('[MAP] No skills available for current selection');
        return finalizeMapSession();
    }

    // Set state.skill / state.category so generateQuestion (no-arg) can dispatch
    const categoryId = getCategoryForSkill(skill);
    state.skill = skill;
    state.category = categoryId || state.category;

    let q = null;
    try {
        q = generateQuestion();
    } catch (err) {
        console.error('[MAP] generateQuestion threw for', skill, err);
    }
    if (!q || !q.text) {
        console.warn('[MAP] generateQuestion returned empty for', skill);
        // Mark this slot consumed so we don't infinite loop
        state.mapItemCount++;
        return nextMapItem();
    }

    // Stash MAP-specific metadata on the question
    q._mapSkillId = skill;
    q._mapCategoryId = categoryId;
    q._mapDomain = getMapDomain(skill);
    q._mapBand = bandFromRit(state.mapCurrentRit);

    // Wire renderer
    state.currentQ = q;
    state.qCount = state.mapItemCount + 1;
    state.hasAnswered = false;
    state.lastAnswerCorrect = false;
    state.questionStartTime = Date.now();

    // Reset wrong-attempt tracking + hide any leftover Skip button / chips
    state.currentQAttempts = 0;
    state.currentQAttemptHistory = [];
    const _skip = document.getElementById('skipBtn');
    if (_skip) _skip.style.display = 'none';
    const _hist = document.getElementById('attemptHistoryBox');
    if (_hist) { _hist.innerHTML = ''; _hist.style.display = 'none'; }

    // Make sure the scaffold inside #mapQuestionContainer exists
    ensureSessionScaffold();

    // Update banner counters BEFORE render (renderQuestion sets qNum from state.qCount)
    const itemNum = document.getElementById('mapItemNum');
    if (itemNum) itemNum.textContent = String(state.mapItemCount + 1);
    const dr = document.getElementById('mapDomainRotation');
    if (dr) dr.textContent = `Now: ${q._mapDomain || '—'}`;

    try {
        renderQuestion();
    } catch (err) {
        console.error('[MAP] renderQuestion threw for', skill, err);
        state.mapItemCount++;
        return nextMapItem();
    }

    // Refresh the navigator strip — current item just changed.
    renderMapNavBar();

    // Stamp render time for rapid-guess detection (only set after a real
    // renderQuestion call — programmatic test bypass leaves this at 0 so
    // the rapid-guess gate never fires for synthetic answers).
    state.lastQuestionRenderTime = Date.now();

    // Simulation mode: hide hint/solution buttons (faithful no-feedback)
    if (state.mapSessionMode === 'simulation') {
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) hintBtn.style.display = 'none';
        const solBtn = document.getElementById('solutionBtn');
        if (solBtn) solBtn.style.display = 'none';
    }
}

function chooseNextSkill() {
    const allCandidates = [];
    for (const band of state.mapSelectedBands) {
        const skills = getMapSkillsForBands([band], state.mapTier);
        for (const sk of skills) {
            const dom = getMapDomain(sk);
            if (!dom || !state.mapSelectedDomains.includes(dom)) continue;
            const mid = MAP_BAND_MIDPOINTS[band] || 185;
            allCandidates.push({ skill: sk, b: mid, domain: dom });
        }
    }
    if (allCandidates.length === 0) return null;

    // Domain rotation: prefer least-seen domain among the selected ones
    const seenCounts = state.mapSelectedDomains
        .map(d => state.mapPerDomainItems[d] || 0);
    const minSeen = seenCounts.length ? Math.min(...seenCounts) : 0;
    const rotated = allCandidates.filter(
        c => (state.mapPerDomainItems[c.domain] || 0) === minSeen
    );
    const pool = rotated.length > 0 ? rotated : allCandidates;

    // Target b ≈ θ - 0.85 logits ≈ θ - 4 RIT (≈70% expected correct)
    const target = state.mapCurrentRit - 4;

    // Sort by absolute distance from target
    pool.sort((a, b) => Math.abs(a.b - target) - Math.abs(b.b - target));

    // Randomesque: pick from top 3-5 closest
    const topN = Math.min(5, pool.length);
    const idx = Math.floor(Math.random() * topN);
    return pool[idx].skill;
}

function bandFromRit(rit) {
    if (rit < 151) return '141-150';
    if (rit < 161) return '151-160';
    if (rit < 171) return '161-170';
    if (rit < 181) return '171-180';
    if (rit < 191) return '181-190';
    if (rit < 201) return '191-200';
    if (rit < 211) return '201-210';
    if (rit < 221) return '211-220';
    if (rit < 231) return '221-230';
    return '231+';
}

// Inline overlay shown when a student rapid-guesses 3 times in a row in MAP
// Practice mode. Pauses the test for 5s and dismisses itself.
function showRapidGuessBanner() {
    if (typeof document === 'undefined') return Promise.resolve();
    if (document.getElementById('rapidGuessOverlay')) return Promise.resolve();
    const overlay = document.createElement('div');
    overlay.id = 'rapidGuessOverlay';
    overlay.className = 'rapid-guess-banner-overlay';
    overlay.innerHTML = `
        <div class="rapid-guess-banner">
            <div class="rg-emoji">🐢</div>
            <div class="rg-title">Take your time!</div>
            <div class="rg-msg">Rushing won’t help you learn. Read each question carefully and think before answering.</div>
            <div class="rg-countdown" id="rgCountdown">Continuing in 5...</div>
        </div>`;
    document.body.appendChild(overlay);
    let n = 5;
    const cd = setInterval(() => {
        n--;
        const el = document.getElementById('rgCountdown');
        if (el) el.textContent = `Continuing in ${n}...`;
        if (n <= 0) {
            clearInterval(cd);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }
    }, 1000);
    return new Promise(r => setTimeout(r, 5000));
}

// ============================================================
// Question Navigator — colored dots + back/forward arrows
// ============================================================
//
// Renders one dot per session item (gray=unanswered, green=correct,
// red=wrong, blue ring=current). Click a dot to jump back to that
// item in REVIEW MODE (non-interactive card showing skill + result).
// "Resume current question" banner appears in review mode.

function renderMapNavBar() {
    const dotsEl = document.getElementById('mapNavDots');
    const back = document.getElementById('mapNavBack');
    const forward = document.getElementById('mapNavForward');
    if (!dotsEl) return;

    const completed = state.mapItemCount || 0;
    const reviewing = (typeof state.mapReviewingIndex === 'number') ? state.mapReviewingIndex : -1;
    const currentIdx = reviewing >= 0 ? reviewing : completed;
    // Unlimited mode (target<=0): dots grow with answered + current.
    const total = (state.mapItemCountTarget > 0)
        ? state.mapItemCountTarget : (completed + 1);

    let html = '';
    for (let i = 0; i < total; i++) {
        const h = state.mapHistory[i];
        let cls = 'map-nav-dot';
        if (i === currentIdx) cls += ' current';
        if (!h) cls += ' unanswered';
        else if (h.correct) cls += ' correct';
        else cls += ' wrong';
        html += `<button type="button" class="${cls}" data-i="${i}" onclick="window.mapJumpToItem(${i})" title="Item ${i + 1}"></button>`;
    }
    dotsEl.innerHTML = html;

    if (back) back.disabled = (currentIdx <= 0);
    if (forward) forward.disabled = (currentIdx >= completed);
}

function showReviewBanner() {
    const sessionView = document.getElementById('mapSessionView');
    const container = document.getElementById('mapQuestionContainer');
    if (!sessionView || !container) return;
    let banner = document.getElementById('mapReviewBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'mapReviewBanner';
        banner.className = 'map-review-banner';
        banner.innerHTML = `Reviewing past item &mdash; <button type="button" onclick="window.mapResumeCurrent()">Resume current question</button>`;
        sessionView.insertBefore(banner, container);
    }
    banner.style.display = 'block';
}

function hideReviewBanner() {
    const banner = document.getElementById('mapReviewBanner');
    if (banner) banner.style.display = 'none';
}

function renderHistoricalItem(index) {
    const h = state.mapHistory[index];
    const container = document.getElementById('mapQuestionContainer');
    if (!h || !container) return;
    const skillLabel = h.skillId || 'unknown';
    const ritBefore = (typeof h.ritBefore === 'number') ? h.ritBefore : '?';
    const ritAfter = (typeof h.ritAfter === 'number') ? h.ritAfter : '?';
    const verdictColor = h.correct ? '#2e7d32' : '#c62828';
    const verdictText = h.correct ? '✓ Correct' : '✗ Wrong';
    const totalLabel = (state.mapItemCountTarget > 0) ? state.mapItemCountTarget : '∞';
    const html = `
        <div class="map-review-card" id="mapReviewCard" style="padding:24px;text-align:center;background:#fff;border-radius:12px;margin:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <div style="font-size:0.95rem;color:#666;margin-bottom:8px;">Item ${index + 1} of ${totalLabel}</div>
            <div style="font-size:1.15rem;margin-bottom:16px;">Skill: <strong>${skillLabel}</strong></div>
            <div style="font-size:1.4rem;font-weight:700;color:${verdictColor};">${verdictText}</div>
            <div style="margin-top:8px;color:#666;">RIT estimate: ${ritBefore} &rarr; ${ritAfter}</div>
            <div style="margin-top:16px;font-size:0.85rem;color:#888;font-style:italic;">Review only &mdash; cannot change your answer.</div>
        </div>
    `;
    // Hide the live questionCard (which lives inside the container) without
    // moving it; insert the review card before it. We track the review card
    // separately so mapResumeCurrent can clear it cleanly.
    const card = document.getElementById('questionCard');
    if (card && card.parentElement === container) {
        card.style.display = 'none';
    }
    // Remove any previous review card before inserting a fresh one
    const prev = document.getElementById('mapReviewCard');
    if (prev) prev.remove();
    const wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    const reviewCard = wrap.firstChild;
    container.insertBefore(reviewCard, card || null);
}

export function mapJumpToItem(index) {
    if (typeof index !== 'number' || index < 0) return;
    // Can only jump to items that have been answered
    if (index >= state.mapItemCount) return;
    state.mapReviewingIndex = index;
    state.mapNavigationOpen = true;
    renderHistoricalItem(index);
    showReviewBanner();
    renderMapNavBar();
}

export function mapResumeCurrent() {
    state.mapReviewingIndex = -1;
    state.mapNavigationOpen = false;
    hideReviewBanner();
    // Remove any review card overlay
    const prev = document.getElementById('mapReviewCard');
    if (prev) prev.remove();
    // Re-show the live question card
    const container = document.getElementById('mapQuestionContainer');
    const card = document.getElementById('questionCard');
    if (card && container && card.parentElement === container) {
        card.style.display = '';
    }
    renderMapNavBar();
}

export function mapNavBack() {
    const reviewing = (typeof state.mapReviewingIndex === 'number') ? state.mapReviewingIndex : -1;
    const cur = reviewing >= 0 ? reviewing : state.mapItemCount;
    if (cur > 0) mapJumpToItem(cur - 1);
}

export function mapNavForward() {
    const reviewing = (typeof state.mapReviewingIndex === 'number') ? state.mapReviewingIndex : -1;
    if (reviewing < 0) return; // already on current
    if (reviewing < state.mapItemCount - 1) {
        mapJumpToItem(reviewing + 1);
    } else {
        // Stepping past last answered item -> resume the live current question
        mapResumeCurrent();
    }
}

export function recordMapAnswer(result) {
    if (!state.mapMode) return;
    const q = state.currentQ;
    if (!q || !q._mapSkillId) return;

    // ---- Rapid-guess detection (MAP Practice only) -----------------------
    // Only enforce when:
    //   - mode === 'practice' (Simulation = test-day, students may speed)
    //   - not the first item of the session (no prior to compare against)
    //   - lastQuestionRenderTime > 0 (programmatic test bypass leaves it 0)
    //   - a real DOM click (state._lastUserClickTime) happened recently
    //     (programmatic page.evaluate calls bypass click handlers, so the
    //     test-map-smoke.cjs harness doesn't trigger this gate)
    // If 3 consecutive answers come in <3s each, pause for 5s with an overlay
    // banner, then continue the normal advance flow.
    const lastClick = state._lastUserClickTime || 0;
    const clickWasRecent = lastClick > 0 && (Date.now() - lastClick) < 3000;
    if (
        state.mapSessionMode === 'practice' &&
        state.mapItemCount > 0 &&
        state.lastQuestionRenderTime > 0 &&
        clickWasRecent
    ) {
        const responseTimeMs = Date.now() - state.lastQuestionRenderTime;
        if (responseTimeMs < 3000) {
            state.rapidGuessStreak = (state.rapidGuessStreak || 0) + 1;
            if (state.rapidGuessStreak >= 3) {
                // Pause: show banner, then complete the rest of recordMapAnswer
                // after 5s. Reset streak so the next batch of fast answers gets
                // a fresh count.
                state.rapidGuessStreak = 0;
                showRapidGuessBanner();
                setTimeout(() => _finishRecordMapAnswer(result), 5000);
                return;
            }
        } else {
            state.rapidGuessStreak = 0;
        }
    }

    _finishRecordMapAnswer(result);
}

function _finishRecordMapAnswer(result) {
    if (!state.mapMode) return;
    const q = state.currentQ;
    if (!q || !q._mapSkillId) return;

    const correct = !!(result && result.correct);
    const dom = q._mapDomain;
    const ritBefore = state.mapCurrentRit;

    if (correct) {
        const step = 3 + Math.min(state.mapCorrectStreak, 5);
        state.mapCurrentRit = Math.min(260, state.mapCurrentRit + step);
        state.mapCorrectStreak++;
        state.mapIncorrectStreak = 0;
    } else {
        const step = 3 + Math.min(state.mapIncorrectStreak, 5);
        state.mapCurrentRit = Math.max(120, state.mapCurrentRit - step);
        state.mapIncorrectStreak++;
        state.mapCorrectStreak = 0;
    }

    if (dom) {
        state.mapPerDomainItems[dom] = (state.mapPerDomainItems[dom] || 0) + 1;
        if (correct) {
            state.mapPerDomainCorrect[dom] = (state.mapPerDomainCorrect[dom] || 0) + 1;
        }
        state.mapPerDomainRitSum[dom] = (state.mapPerDomainRitSum[dom] || 0) + ritBefore;
    }

    state.mapHistory.push({
        skillId: q._mapSkillId,
        categoryId: q._mapCategoryId,
        domain: dom,
        band: q._mapBand,
        correct,
        ritBefore,
        ritAfter: state.mapCurrentRit,
        ts: Date.now(),
    });

    state.mapItemCount++;

    // Refresh the navigator strip — a new item just landed in history.
    renderMapNavBar();

    // Maybe nudge the student to opt into the other tier if their estimate
    // suggests they need easier or harder material.
    maybeShowCrossTierBanner();

    // Brief delay before next item; a bit longer in practice mode so feedback shows
    const delay = (state.mapSessionMode === 'practice') ? 1100 : 350;
    setTimeout(() => nextMapItem(), delay);
}

// ============================================================
// Cross-tier opt-in banner — show ONCE per session when the running
// RIT estimate strongly suggests the student should sample the other
// tier's pool. Mixed tier already covers both — no banner needed.
// ============================================================
function maybeShowCrossTierBanner() {
    if (state.mapCrossTierSuggested) return;
    if (!state.mapMode) return;
    // Need a couple of items in to avoid a spurious early flag.
    if (state.mapItemCount < 4) return;

    const rit = state.mapCurrentRit;
    if (state.mapTier === 'k2' && rit >= 200) {
        state.mapCrossTierSuggested = true;
        showCrossTierBanner({
            emoji: '🚀',
            text: "You're scoring above grade level! Try harder problems from Grade 3-5?",
        });
    } else if (state.mapTier === '35' && rit <= 170) {
        state.mapCrossTierSuggested = true;
        showCrossTierBanner({
            emoji: '📚',
            text: "Let's try some easier confidence-builders. Add Grade K-2 problems?",
        });
    }
    // mixed tier: nothing to do.
}

function showCrossTierBanner(opts) {
    if (typeof document === 'undefined') return;
    // Remove any leftover banner from a previous (now-stale) call.
    const prev = document.getElementById('mapCrossTierBanner');
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);

    const banner = document.createElement('div');
    banner.id = 'mapCrossTierBanner';
    banner.className = 'map-cross-tier-banner';
    banner.innerHTML = `
        <div style="margin-bottom:8px;font-weight:700;">${opts.emoji} ${opts.text}</div>
        <button type="button" class="yes" id="mapCrossTierYes">Yes</button>
        <button type="button" class="no" id="mapCrossTierNo">No</button>
    `;
    document.body.appendChild(banner);

    const dismiss = () => {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
        clearTimeout(autoTimer);
    };
    const yesBtn = banner.querySelector('#mapCrossTierYes');
    const noBtn = banner.querySelector('#mapCrossTierNo');
    if (yesBtn) yesBtn.addEventListener('click', () => {
        state.mapTier = 'mixed';
        dismiss();
    });
    if (noBtn) noBtn.addEventListener('click', dismiss);

    const autoTimer = setTimeout(dismiss, 8000);
}

export function finalizeMapSession() {
    if (!state.mapMode && !state.mapStartedAt) return;
    state.mapEndedAt = Date.now();

    // Final RIT: average of last 8 items' ritAfter (or all if fewer)
    const recent = state.mapHistory.slice(-8);
    const finalRit = recent.length > 0
        ? Math.round(recent.reduce((s, h) => s + h.ritAfter, 0) / recent.length)
        : state.mapCurrentRit;

    // Standard error (rough): 10 / sqrt(n)
    const itemsTaken = state.mapHistory.length;
    const se = Math.round(10 / Math.sqrt(Math.max(1, itemsTaken)));

    // Per-domain RIT (using mean of ritBefore values for that domain's items)
    const perDomain = {};
    for (const d of DOMAINS_ORDER) {
        const items = state.mapPerDomainItems[d] || 0;
        if (items > 0) {
            perDomain[d] = {
                rit: Math.round((state.mapPerDomainRitSum[d] || 0) / items),
                items,
                correct: state.mapPerDomainCorrect[d] || 0,
            };
        } else {
            perDomain[d] = null;
        }
    }

    state.lastMapResult = {
        finalRit,
        se,
        perDomain,
        items: itemsTaken,
        durationMs: state.mapEndedAt - (state.mapStartedAt || state.mapEndedAt),
        tier: state.mapTier,
        mode: state.mapSessionMode,
        history: state.mapHistory.slice(),
    };

    state.mapMode = false;
    // Clear any active review state so re-entering a session starts clean.
    state.mapNavigationOpen = false;
    state.mapReviewingIndex = -1;
    const _rb = document.getElementById('mapReviewBanner');
    if (_rb && _rb.parentNode) _rb.parentNode.removeChild(_rb);
    const _rc = document.getElementById('mapReviewCard');
    if (_rc && _rc.parentNode) _rc.parentNode.removeChild(_rc);
    releaseSessionScaffold();

    // Exit immersive mode — re-show top app chrome.
    if (typeof document !== 'undefined' && document.body) {
        document.body.classList.remove('map-immersive');
    }
    removeMapAudioToggle();
    removeMapEndButton();
    // Defensive: dismiss any rapid-guess banner that might be lingering.
    const rg = (typeof document !== 'undefined') && document.getElementById('rapidGuessOverlay');
    if (rg && rg.parentNode) rg.parentNode.removeChild(rg);
    // Dismiss any cross-tier banner if still visible.
    const ctb = (typeof document !== 'undefined') && document.getElementById('mapCrossTierBanner');
    if (ctb && ctb.parentNode) ctb.parentNode.removeChild(ctb);
    state.rapidGuessStreak = 0;
    state.lastQuestionRenderTime = 0;

    showView('mapResultsView');
}

// Exported so navigation flows (goHome, exitGame) can restore the borrowed
// questionCard if the user bails mid-session.
export function releaseMapSessionScaffold() {
    releaseSessionScaffold();
    // Defensive: also drop the immersive class in case the user bails out
    // mid-session via goHome / exitGame without going through finalize.
    if (typeof document !== 'undefined' && document.body) {
        document.body.classList.remove('map-immersive');
    }
    removeMapAudioToggle();
    removeMapEndButton();
    const rg = (typeof document !== 'undefined') && document.getElementById('rapidGuessOverlay');
    if (rg && rg.parentNode) rg.parentNode.removeChild(rg);
    const ctb = (typeof document !== 'undefined') && document.getElementById('mapCrossTierBanner');
    if (ctb && ctb.parentNode) ctb.parentNode.removeChild(ctb);
    // Clear review-mode UI scraps if any
    const rb = (typeof document !== 'undefined') && document.getElementById('mapReviewBanner');
    if (rb && rb.parentNode) rb.parentNode.removeChild(rb);
    const rc = (typeof document !== 'undefined') && document.getElementById('mapReviewCard');
    if (rc && rc.parentNode) rc.parentNode.removeChild(rc);
    state.mapNavigationOpen = false;
    state.mapReviewingIndex = -1;
    state.rapidGuessStreak = 0;
    state.lastQuestionRenderTime = 0;
}

// MAP Practice "Skip" handler — only used in practice mode after the student
// has answered wrong twice. Records the item as wrong (RIT down, count up),
// then advances to the next item.
export function skipMapItem() {
    if (!state.mapMode) return;
    if (state.mapSessionMode !== 'practice') return;
    // Behave just like recordMapAnswer({correct:false}) but call directly so
    // we don't rely on window wiring inside the engine.
    recordMapAnswer({ correct: false });
}

// --- Floating Audio toggle ---------------------------------------------------
// During MAP immersion the regular .btn-tts header chrome is hidden, so we
// inject a fixed-position "Audio" button at the top of the viewport. It mirrors
// the state of state.ttsEnabled, persists to the mathquest_tts cookie, and
// keeps the (hidden) header toggle in sync so the value sticks after exit.
function injectMapAudioToggle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('mapAudioToggle')) return;
    const btn = document.createElement('button');
    btn.id = 'mapAudioToggle';
    btn.type = 'button';
    btn.className = 'map-audio-toggle';
    btn.title = 'Toggle audio (read questions aloud)';
    btn.setAttribute('aria-label', 'Toggle audio');
    const updateBtn = () => {
        const on = !!state.ttsEnabled;
        btn.innerHTML = on ? '🔊 Audio' : '🔇 Audio';
        btn.classList.toggle('audio-on', on);
        btn.classList.toggle('audio-off', !on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    btn.addEventListener('click', () => {
        state.ttsEnabled = !state.ttsEnabled;
        if (typeof window !== 'undefined' && typeof window.setCookie === 'function') {
            try { window.setCookie('mathquest_tts', state.ttsEnabled ? '1' : '0', 365); } catch (_) {}
        }
        updateBtn();
        // Mirror to the existing header toggle if it exists so the label stays
        // in sync once immersion ends.
        const oldBtn = document.querySelector('.btn-tts');
        if (oldBtn) {
            oldBtn.textContent = state.ttsEnabled ? '🔊 On' : '🔇 Off';
            oldBtn.classList.toggle('active', state.ttsEnabled);
        }
    });
    updateBtn();
    document.body.appendChild(btn);
}

function removeMapAudioToggle() {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('mapAudioToggle');
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
}

// --- Floating End Session button -------------------------------------------
// Always-visible "🏁 End Session" pill at top-left during a MAP session.
// Click → confirm → finalizeMapSession with whatever data we have so far.
function injectMapEndButton() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('mapEndBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'mapEndBtn';
    btn.type = 'button';
    btn.className = 'map-end-btn';
    btn.title = 'End session and see your results so far';
    btn.textContent = '🏁 End Session';
    btn.addEventListener('click', () => {
        const confirmed = window.confirm('End the session now and see your summary so far?');
        if (confirmed) finalizeMapSession();
    });
    document.body.appendChild(btn);
}

function removeMapEndButton() {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('mapEndBtn');
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
}
