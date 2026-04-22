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

    showView('mapSessionView');
    ensureSessionScaffold();

    // Update banner
    const itemTotal = document.getElementById('mapItemTotal');
    if (itemTotal) itemTotal.textContent = String(state.mapItemCountTarget);
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

    // Stop conditions
    if (state.mapItemCount >= state.mapItemCountTarget) {
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

export function recordMapAnswer(result) {
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

    // Brief delay before next item; a bit longer in practice mode so feedback shows
    const delay = (state.mapSessionMode === 'practice') ? 1100 : 350;
    setTimeout(() => nextMapItem(), delay);
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
    releaseSessionScaffold();
    showView('mapResultsView');
}

// Exported so navigation flows (goHome, exitGame) can restore the borrowed
// questionCard if the user bails mid-session.
export function releaseMapSessionScaffold() {
    releaseSessionScaffold();
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
