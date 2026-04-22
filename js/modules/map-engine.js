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
    getCategoryForSkill,
} from './data.js';
import { generateQuestion } from './generate-question.js';
import { renderQuestion } from './question-render.js';

const DOMAINS_ORDER = ['OA', 'NO', 'MD', 'G'];

// Scaffolding HTML injected into #mapQuestionContainer so renderQuestion's
// hard-coded element lookups (questionCard, qNum, questionText, etc.) succeed.
function ensureSessionScaffold() {
    const container = document.getElementById('mapQuestionContainer');
    if (!container) return;
    if (container.querySelector('#questionCard')) return; // already scaffolded
    container.innerHTML = `
        <div class="question-card" id="questionCard">
            <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">
                <div class="question-number" id="qNum">Q1</div>
                <div id="skillLabel" class="mq-skill-pill"></div>
            </div>
            <div class="visual-aid" id="visualAid"></div>
            <div class="question-text" id="questionText">Question</div>
            <div class="answer-options" id="answerOptions"></div>
            <div class="answer-input-area" id="answerInputArea">
                <input type="text" class="answer-input" id="answerInput" placeholder="Type answer" oninput="resizeInput(this); autoCheckOnInput()" aria-label="Type your answer">
                <button class="btn btn-primary" onclick="submitAnswer()">Check</button>
            </div>
            <div class="feedback-area" id="feedbackArea"></div>
            <div style="margin-top:15px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                <button class="btn btn-sm btn-secondary" id="hintBtn" onclick="showHint()" style="display:none;">💡 Hint</button>
                <button class="btn btn-sm btn-secondary" id="ttsBtn" onclick="speakQuestion()">🔊 Read</button>
                <button class="btn btn-sm btn-secondary" id="solutionBtn" onclick="showSolution()" style="display:none;">📚 Show Solution</button>
            </div>
            <div class="next-btn-container" id="nextBtnContainer" style="display:none;">
                <button class="btn btn-next" id="nextBtn">Next →</button>
            </div>
            <div id="gameScore" style="display:none;"></div>
        </div>
    `;
}

export function startMapSession(opts) {
    if (!opts || !Array.isArray(opts.bands) || !Array.isArray(opts.domains)) {
        console.warn('[MAP] startMapSession called with invalid opts', opts);
        return;
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
    showView('mapResultsView');
}
