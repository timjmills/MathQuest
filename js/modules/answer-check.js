import { state } from './state.js';
import { recordPracticeLog } from './storage.js';
import {
    isMapTestMode,
    isFirstAttempt,
    markFirstAttempt,
    hasAllCorrectFired,
    markAllCorrectFired,
} from './widget-retry.js';

// Snapshot the current question + outcome into the dot-row history.
// Used by widget submit handlers so the dot row can show correct/wrong
// AND make the dot clickable for redo.
function _snapshotQ(isCorrect, userAnswer) {
    if (typeof window.recordQuestionStatus === 'function') {
        window.recordQuestionStatus(isCorrect ? 'correct' : 'incorrect', {
            q: state.currentQ,
            userAnswer: userAnswer != null ? String(userAnswer) : '',
        });
    }
}

// ===== REVIEW MODE HELPERS =====
// Re-answer flow for the q-dot row click. The student jumped back to a past
// question (see goToQuestionIndex in game-control.js). When they re-submit,
// we must NOT mutate live score/streak/XP — we just patch the history entry,
// recompute the score from history, flash feedback, then snap back to the
// live current question. Every widget submit handler that owns its own
// correctness logic should branch on isReviewing() and delegate to
// applyReviewOutcome() instead of running its scoring/advance pipeline.
export function isReviewing() {
    return typeof state._reviewingQIndex === 'number'
        && state._reviewingQIndex >= 0
        && state.mapMode !== true;
}
export function applyReviewOutcome(isCorrect, userAnswer, btnElement) {
    const idx = state._reviewingQIndex;
    const q = state.currentQ;
    if (!q || idx < 0) return;
    if (typeof window.recordQuestionStatus === 'function') {
        window.recordQuestionStatus(isCorrect ? 'correct' : 'incorrect', {
            q,
            userAnswer: userAnswer != null ? String(userAnswer) : '',
        });
    }
    if (typeof window.recomputeScoreFromHistory === 'function') {
        window.recomputeScoreFromHistory();
    }
    const feedback = document.getElementById('feedbackArea');
    const card = document.getElementById('questionCard');
    if (feedback) {
        feedback.style.display = 'block';
        feedback.className = `feedback-area ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = isCorrect
            ? 'Updated — Correct!'
            : 'Still not quite right — try again.';
    }
    if (card) {
        card.classList.add(isCorrect ? 'correct-bg' : 'incorrect-bg');
        setTimeout(() => card.classList.remove('correct-bg', 'incorrect-bg'), 700);
    }
    if (btnElement) btnElement.classList.add(isCorrect ? 'correct' : 'incorrect');
    state.lastAnswerCorrect = isCorrect;
    if (isCorrect) {
        // Correct redo — give the student a moment to see "Correct!" then snap
        // back to the live question so they can keep playing.
        state.hasAnswered = true;
        setTimeout(() => {
            if (typeof window.resumeLiveQuestion === 'function') {
                window.resumeLiveQuestion();
            }
        }, 850);
    } else {
        // Wrong on redo — DON'T auto-resume. Let the student keep trying. Reset
        // hasAnswered so the next submit re-runs the check, and re-render so
        // the input is editable again. The "Skip back to current" button in
        // the review banner is the escape hatch if they want to stop.
        state.hasAnswered = false;
        setTimeout(() => {
            try {
                const ai = document.getElementById('answerInput');
                if (ai) {
                    ai.value = '';
                    ai.focus();
                }
            } catch (_) { /* non-fatal */ }
        }, 50);
    }
}

// ===== WRONG-ANSWER RETRY HELPERS =====
// Used by Practice + MAP Practice. Keep the problem on screen after a wrong
// answer, cross out the wrong choice, and reveal a Skip button after the 2nd
// wrong attempt so the student can move on if truly stuck.

// Should we apply the retry-then-skip behavior for the current session?
// Yes for: standard Practice mode + MAP Practice mode.
// No for:  MAP Simulation, Worksheet, Quiz, Boss/Race (handled elsewhere).
export function isRetryWithSkipMode() {
    if (state.mapMode === true) {
        return state.mapSessionMode === 'practice';
    }
    return state.gameMode === 'practice';
}

// Reset attempt tracking — call when a new question is shown or after correct answer.
export function resetAttemptTracking() {
    state.currentQAttempts = 0;
    state.currentQAttemptHistory = [];
    // Hide skip button + clear any cross-outs
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) skipBtn.style.display = 'none';
    const histBox = document.getElementById('attemptHistoryBox');
    if (histBox) { histBox.innerHTML = ''; histBox.style.display = 'none'; }
    // Re-enable any wrong-choice buttons (cross-outs cleared on next render anyway)
    const optsContainer = document.getElementById('answerOptions');
    if (optsContainer) {
        optsContainer.querySelectorAll('.wrong-choice').forEach(el => {
            el.classList.remove('wrong-choice');
        });
    }
}

// Mark a clicked multi-choice button as wrong (cross-out + disabled).
export function markWrongChoice(btnElement) {
    if (!btnElement) return;
    btnElement.classList.add('wrong-choice');
    // Defensive: also remove the transient .incorrect class if any setTimeout
    // would have stripped it; .wrong-choice persists through the question.
    btnElement.classList.remove('incorrect');
}

// Append a strikethrough chip to the attempt-history box (for numeric / text inputs)
export function appendAttemptHistory(submittedAnswer) {
    let histBox = document.getElementById('attemptHistoryBox');
    if (!histBox) {
        histBox = document.createElement('div');
        histBox.id = 'attemptHistoryBox';
        histBox.className = 'attempt-history';
        // Mount just below the feedback area for visibility
        const feedback = document.getElementById('feedbackArea');
        if (feedback && feedback.parentNode) {
            feedback.parentNode.insertBefore(histBox, feedback.nextSibling);
        } else {
            const card = document.getElementById('questionCard');
            if (card) card.appendChild(histBox);
        }
    }
    histBox.style.display = 'flex';
    const chip = document.createElement('span');
    chip.className = 'past-wrong';
    chip.textContent = String(submittedAnswer);
    histBox.appendChild(chip);
}

// Make sure a Skip button exists in the DOM (idempotent). Returns the button.
export function ensureSkipButton() {
    let skipBtn = document.getElementById('skipBtn');
    if (skipBtn) return skipBtn;
    skipBtn = document.createElement('button');
    skipBtn.id = 'skipBtn';
    skipBtn.type = 'button';
    skipBtn.className = 'skip-btn';
    // Per user spec: button reads "Next →" (not "Skip →") so it doesn't
    // feel like giving up — the student is moving on after 2 attempts.
    skipBtn.textContent = 'Next →';
    skipBtn.style.display = 'none';
    skipBtn.onclick = () => {
        if (typeof window.skipCurrentItem === 'function') window.skipCurrentItem();
    };
    // Wrap in a container for centering, mount below feedback area
    const container = document.createElement('div');
    container.className = 'skip-btn-container';
    container.appendChild(skipBtn);
    const feedback = document.getElementById('feedbackArea');
    if (feedback && feedback.parentNode) {
        feedback.parentNode.insertBefore(container, feedback.nextSibling);
    } else {
        const card = document.getElementById('questionCard');
        if (card) card.appendChild(container);
    }
    return skipBtn;
}

// Show the skip button after enough wrong attempts (>= 2 total).
// Per teacher spec: one retry — student attempts, gets it wrong, gets a
// chance to retry once with already-correct parts preserved, then the
// "Next →" button appears so they aren't stuck on a problem they can't
// solve.
export function showSkipButtonIfNeeded() {
    if ((state.currentQAttempts || 0) >= 2) {
        const skipBtn = ensureSkipButton();
        if (skipBtn) skipBtn.style.display = 'inline-block';
    }
}

// Record a wrong attempt: bumps counter, stores submission, optionally crosses
// out the multi-choice button, optionally appends to history chips.
// Then conditionally shows Skip.
export function recordWrongAttempt({ submitted, btnElement, showHistoryChip }) {
    state.currentQAttempts = (state.currentQAttempts || 0) + 1;
    if (!Array.isArray(state.currentQAttemptHistory)) state.currentQAttemptHistory = [];
    state.currentQAttemptHistory.push(submitted);
    if (btnElement) markWrongChoice(btnElement);
    if (showHistoryChip && submitted !== undefined && submitted !== null && String(submitted).length) {
        appendAttemptHistory(submitted);
    }
    showSkipButtonIfNeeded();

    // Auto-reveal the hint popup on the FIRST wrong attempt — every skill
    // gets the same scaffolding behavior. Student doesn't have to know to
    // click the lightbulb. showHint() falls back to a domain-aware generic
    // strategy when the question has no specific hint, so this fires for
    // every skill (no more silent failures on skills that forgot to set a
    // hint string). Subsequent wrong attempts don't re-show — the popup
    // either is still open or was deliberately dismissed by the student.
    if (state.currentQAttempts === 1
        && typeof window !== 'undefined'
        && typeof window.showHint === 'function'
        && state.currentQ) {
        try { window.showHint(); } catch (_) { /* non-fatal */ }
    }
}

// Skip the current item — invoked by the Skip button after 2nd wrong attempt.
// MAP Practice: hand off to skipMapItem (records wrong, advances).
// Standard Practice: mark wrong, advance via nextQuestion (forces past the
//   "must be correct to advance" guard by setting lastAnswerCorrect = true).
export function skipCurrentItem() {
    // Always reset attempt UI so the next question starts fresh
    state.hasAnswered = true;
    if (state.mapMode === true && state.mapSessionMode === 'practice') {
        if (typeof window.skipMapItem === 'function') {
            window.skipMapItem();
        } else if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: false });
        }
        return;
    }
    // Standard practice (or other non-MAP modes that mistakenly call here)
    // The existing "Next →" button only appears after 2 wrong attempts, so
    // the student got it wrong — mark the dot RED.
    if (typeof window.recordQuestionStatus === 'function') {
        window.recordQuestionStatus('incorrect');
    }
    state.lastAnswerCorrect = true; // bypass nextQuestion guard
    resetAttemptTracking();
    if (typeof window.transitionToNextQuestion === 'function') {
        window.transitionToNextQuestion();
    } else if (typeof window.nextQuestion === 'function') {
        window.nextQuestion();
    }
}

// ===== PER-SKILL SESSION TRACKING =====
export function trackSkillAnswer(isCorrect) {
    const skillId = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
    if (skillId === 'custom_mixed' || skillId === 'all_mixed') return;
    const timeMs = state.questionStartTime ? Math.max(0, Date.now() - state.questionStartTime) : 0;
    // Cap at 120s to exclude idle time
    const cappedTime = Math.min(timeMs, 120000);
    if (!state.currentSessionSkills) state.currentSessionSkills = {};
    if (!state.currentSessionSkills[skillId]) {
        const label = (state.currentQ && state.currentQ.skillLabel) || skillId;
        state.currentSessionSkills[skillId] = { attempted: 0, correct: 0, timeMs: 0, label };
    }
    const entry = state.currentSessionSkills[skillId];
    entry.attempted++;
    if (isCorrect) entry.correct++;
    entry.timeMs += cappedTime;

    // Whole-Program Adaptive Mode (opt-in): feed the per-skill ladder. Skipped
    // automatically when adaptive mode is OFF, when MAP mode is active, or when
    // a quiz is in progress (MAP & Quiz own their own scoring/difficulty).
    if (state.adaptiveModeEnabled && !state.mapMode && !state.quizMode
        && typeof window !== 'undefined' && typeof window.recordAdaptiveAnswer === 'function') {
        try { window.recordAdaptiveAnswer(skillId, !!isCorrect); } catch { /* never break answer flow */ }
    }

    // Variant cycler bias feedback: when a question carries a `_variant` tag
    // (set by gen-*.js via pickVariant()), tell the cycler whether the student
    // got it right. Adaptive mode uses this to surface struggled-with variants
    // sooner. With adaptive OFF, this only updates internal counts (no behaviour
    // change). Wrapped so a missing helper never breaks the answer flow.
    try {
        const variant = state.currentQ && state.currentQ._variant;
        if (variant != null && typeof window !== 'undefined') {
            if (isCorrect && typeof window.recordVariantRight === 'function') {
                window.recordVariantRight(skillId, variant);
            } else if (!isCorrect && typeof window.recordVariantWrong === 'function') {
                window.recordVariantWrong(skillId, variant);
            }
        }
    } catch { /* never break answer flow */ }
}

// ===== FLEXIBLE TIME ANSWER HELPERS =====

// Check if the current skill is time-related
export function isTimeSkill(skill) {
    if (!skill) return false;
    return skill.startsWith('time_') || skill.startsWith('elapsed_');
}

// Duration skills return elapsed durations ("1 hour", "30 minutes") vs clock times ("3:45")
function isDurationSkill(skill) {
    if (!skill) return false;
    return skill.startsWith('elapsed_visual_');
}

// Parse a clock time string → {hours, minutes} in 12-hour format, or null
function parseClockTime(str) {
    if (!str) return null;
    str = str.toString().trim();

    // Strip AM/PM variants (3:45 PM, 3:45pm, 3:45 p.m.)
    str = str.replace(/\s*(a\.?\s*m\.?|p\.?\s*m\.?)\s*$/i, '').trim();

    // "H:MM" or "HH:MM"
    let m = str.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
        let h = parseInt(m[1]) % 12 || 12;
        return { hours: h, minutes: parseInt(m[2]) };
    }

    // "N o'clock"
    m = str.match(/^(\d{1,2})\s*o['']?\s*clock$/i);
    if (m) {
        let h = parseInt(m[1]) % 12 || 12;
        return { hours: h, minutes: 0 };
    }

    return null;
}

// Parse a duration string → total minutes, or null
function parseDuration(str) {
    if (!str) return null;
    str = str.toString().trim().toLowerCase();

    // "H:MM" format interpreted as hours:minutes duration
    let m = str.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
        return parseInt(m[1]) * 60 + parseInt(m[2]);
    }

    let totalMin = 0;
    let found = false;

    // "N hour(s)" / "N hr(s)"
    m = str.match(/(\d+)\s*(?:hours?|hrs?)\b/);
    if (m) { totalMin += parseInt(m[1]) * 60; found = true; }

    // "N minute(s)" / "N min(s)"
    m = str.match(/(\d+)\s*(?:minutes?|mins?)\b/);
    if (m) { totalMin += parseInt(m[1]); found = true; }

    if (found) return totalMin;

    // Bare number → treat as minutes
    m = str.match(/^(\d+)$/);
    if (m) return parseInt(m[1]);

    return null;
}

// Flexible time/duration comparison: accepts multiple equivalent formats
export function timeAnswersMatch(userAns, correctAns, skill) {
    // Quick exact match first (handles MC clicks where option text === q.ans)
    if (normalizeText(userAns) === normalizeText(correctAns)) return true;

    if (isDurationSkill(skill)) {
        // Duration: "1 hour" = "1:00" = "60 minutes" = "60"
        const userDur = parseDuration(userAns);
        const ansDur = parseDuration(correctAns);
        if (userDur !== null && ansDur !== null) return userDur === ansDur;
    } else {
        // Clock time: "3:45" = "3:45 PM" = "03:45" = "3:45pm"
        const userTime = parseClockTime(userAns);
        const ansTime = parseClockTime(correctAns);
        if (userTime && ansTime) {
            return userTime.hours === ansTime.hours && userTime.minutes === ansTime.minutes;
        }
    }

    return false;
}

// ===== FRACTION ANSWER EQUIVALENCE =====

// Parse a fraction string → { num, den } or null
// Accepts: "3/4", "2 3/4", "2-3/4", "11/4", "3", whole numbers
function parseFraction(str) {
    if (!str) return null;
    str = str.toString().trim();

    // Mixed number: "2 3/4" or "2-3/4"
    let m = str.match(/^(-?\d+)\s*[\s-]\s*(\d+)\s*\/\s*(\d+)$/);
    if (m) {
        const whole = parseInt(m[1]);
        const num = parseInt(m[2]);
        const den = parseInt(m[3]);
        if (den === 0) return null;
        const sign = whole < 0 ? -1 : 1;
        return { num: sign * (Math.abs(whole) * den + num), den };
    }

    // Simple fraction: "3/4" or "-3/4"
    m = str.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (m) {
        const num = parseInt(m[1]);
        const den = parseInt(m[2]);
        if (den === 0) return null;
        return { num, den };
    }

    // Whole number: "3" → 3/1
    m = str.match(/^(-?\d+)$/);
    if (m) {
        return { num: parseInt(m[1]), den: 1 };
    }

    return null;
}

// Check if two fraction answers are equivalent
// "6/8" = "3/4", "2 3/4" = "11/4", "3" = "3/1"
export function fractionAnswersMatch(userAns, correctAns) {
    const userFrac = parseFraction(userAns);
    const ansFrac = parseFraction(correctAns);

    if (!userFrac || !ansFrac) return false;

    // Cross-multiplication comparison: a/b = c/d iff a*d = b*c
    return userFrac.num * ansFrac.den === userFrac.den * ansFrac.num;
}

// ===== FRACTION-INPUT ANSWER (stacked num/den boxes) =====
// Reads #fiNum / #fiDen, validates both are filled with integer digits,
// composes "<num>/<den>", and routes through the existing fraction
// equivalence flow so "2/4" still scores correct against a "1/2" answer.
export function checkFractionInputAnswer() {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    if (!q) return;

    const numEl = document.getElementById('fiNum');
    const denEl = document.getElementById('fiDen');
    const numV = numEl ? numEl.value.trim() : '';
    const denV = denEl ? denEl.value.trim() : '';

    if (!numV || !denV) {
        const fb = document.getElementById('feedbackArea');
        if (fb) {
            fb.style.display = 'block';
            fb.className = 'feedback-area hint';
            fb.innerHTML = 'Please fill in both the numerator (top) and denominator (bottom).';
        }
        return;
    }

    // Compose the same string format the legacy "text" path expected so
    // all downstream scoring (fractionAnswersMatch / normalizeText fallback)
    // behaves identically — no special-casing in checkAnswer needed.
    const userAns = `${numV}/${denV}`;
    // Delegate to the standard checkAnswer pipeline. It will pick up the
    // fraction-skill branch automatically when state.skill is one of the
    // registered fraction skills; otherwise it falls back to fractionAnswersMatch
    // here (we force it for any fraction-input question regardless of skill).
    // q.noSimplify (e.g. write_fraction): require LITERAL match for box flash too.
    const isFracMatch = q.noSimplify
        ? (`${numV}/${denV}` === String(q.ans).replace(/\s+/g, ''))
        : fractionAnswersMatch(userAns, q.ans);

    // Visual flash on the two boxes (matches box-correct / box-wrong styling).
    if (numEl) {
        numEl.classList.remove('box-correct', 'box-wrong');
        numEl.classList.add(isFracMatch ? 'box-correct' : 'box-wrong');
    }
    if (denEl) {
        denEl.classList.remove('box-correct', 'box-wrong');
        denEl.classList.add(isFracMatch ? 'box-correct' : 'box-wrong');
    }

    // Route the result through checkAnswer so it shares ALL the scoring,
    // gamification, MAP-mode, retry-with-skip, and practice-log paths.
    checkAnswer(userAns);
}

// ===== SHADE-PARTS ANSWER (interactive click-to-toggle SVG) =====
// Counts .shade-target groups with data-shaded="1" and compares to q.shadeTarget.
// The specific parts shaded don't matter — only the COUNT. Routes through
// checkAnswer so it shares scoring / gamification / MAP-mode paths.
export function checkShadePartsAnswer() {
    if (state.hasAnswered) return;
    const q = state.currentQ;
    if (!q) return;

    const visualAid = document.getElementById('visualAid');
    if (!visualAid) return;

    const targets = visualAid.querySelectorAll('.shade-target');
    let shadedCount = 0;
    targets.forEach(g => {
        if (g.getAttribute('data-shaded') === '1') shadedCount++;
    });

    const target = Number(q.shadeTarget != null ? q.shadeTarget : q.ans);
    const isCorrect = (shadedCount === target);

    // ===== REVIEW MODE BRANCH =====
    if (isReviewing()) {
        return applyReviewOutcome(isCorrect, `shaded=${shadedCount}`);
    }

    // First-attempt scoring tracking. Wrong submits flash + keep widget open.
    const firstSubmit = isFirstAttempt();
    const firstAttemptCorrect = markFirstAttempt(isCorrect);
    if (firstSubmit && state.mapMode !== true) _snapshotQ(firstAttemptCorrect, `shaded=${shadedCount}`);
    const mapTest = isMapTestMode();

    const feedback = document.getElementById('feedbackArea');
    const card = document.getElementById('questionCard');

    if (isCorrect) {
        if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
        if (hasAllCorrectFired()) return;
        markAllCorrectFired();
        // Pre-set q.ans as the integer count for downstream consumers
        if (q.shadeTarget != null) q.ans = target;
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        state.score++;
        if (firstSubmit) {
            state.sessionStreak++;
            if (typeof window.awardXP === 'function') window.awardXP(10, 'correct');
            if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(firstAttemptCorrect);
            trackSkillAnswer(firstAttemptCorrect);
            if (typeof window.recordPracticeLog === 'function') {
                const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                window.recordPracticeLog(sk, firstAttemptCorrect, tm);
            }
        }
        const gs = document.getElementById('gameScore');
        if (gs) gs.innerText = `${state.score} Correct`;
        if (card) card.classList.add('correct-bg');
        if (typeof window.confetti === 'function') window.confetti();
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback-area correct';
            feedback.innerHTML = firstAttemptCorrect
                ? '🎉 Correct!'
                : '🎉 Correct! (Got it on a retry — keep practicing!)';
        }
        // Lock targets against further toggling
        targets.forEach(g => { g.style.pointerEvents = 'none'; });

        if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: firstAttemptCorrect });
        } else if (typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
            setTimeout(() => {
                if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
            }, 800);
        }
        return;
    }

    // Wrong: first-submit scoring fires once, then keep open for in-place fix.
    if (firstSubmit) {
        state.sessionStreak = 0;
        if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
        if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(false);
        trackSkillAnswer(false);
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, false, tm);
        }
        state.lastAnswerCorrect = false;
    }

    if (feedback) {
        feedback.style.display = 'block';
        feedback.className = 'feedback-area incorrect';
        const diff = shadedCount - target;
        const msg = diff > 0
            ? `Too many shaded — un-shade ${diff} part${diff === 1 ? '' : 's'} and try again.`
            : `Need ${-diff} more shaded part${-diff === 1 ? '' : 's'} — try again.`;
        feedback.innerHTML = msg;
    }
    if (card) {
        card.classList.add('incorrect-bg');
        setTimeout(() => card.classList.remove('incorrect-bg'), 700);
    }

    // MAP TEST MODE: lock + advance even on wrong (no retry in test mode).
    if (mapTest) {
        if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
        state.hasAnswered = true;
        targets.forEach(g => { g.style.pointerEvents = 'none'; });
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: false });
        }
        return;
    }

    // Keep widget open — student can toggle shading and resubmit.
    state.hasAnswered = false;
}

// ===== QUOTIENT-REMAINDER ANSWER PARSING =====
// Parses any of these forms into { q, r }:
//   "8 R 3", "8 R3", "8R 3", "8R3", "8r3", "8 r 3"
//   "8 remainder 3", "8 rem 3", "8 rem. 3"
// Returns null if input doesn't have both numbers + a remainder marker.
function parseQuotientRemainder(str) {
    if (str === null || str === undefined) return null;
    const s = String(str).trim().toLowerCase()
        // collapse all whitespace
        .replace(/\s+/g, ' ')
        // normalize "remainder" / "rem." / "rem" to a single 'r'
        // (do "remainder" first, then "rem." with optional period — \b doesn't
        // anchor before a "." so we match "rem\.?" without word-boundary on the right)
        .replace(/\bremainder\b/g, 'r')
        .replace(/\brem\.?/g, 'r');
    // Match (digits) optional-space r/R optional-space (digits)
    const m = s.match(/^(-?\d+)\s*r\s*(-?\d+)$/);
    if (!m) return null;
    return { q: parseInt(m[1], 10), r: parseInt(m[2], 10) };
}

// Returns true when the question expects a quotient + remainder answer.
function isQuotientRemainderQuestion(q) {
    if (!q) return false;
    if (q.quotientRemainder) return true;
    // Fallback: q.ans matches "<num> R <num>" shape.
    if (typeof q.ans === 'string' && /^\s*-?\d+\s*[rR]\s*-?\d+\s*$/.test(q.ans)) return true;
    return false;
}

// Compares a user answer against the expected quotient/remainder.
// Accepts the flexible parsed form OR any string in q.acceptedAnswers.
function quotientRemainderMatches(userAns, q) {
    // Try flexible parse first.
    const userQR = parseQuotientRemainder(userAns);
    let expQR = q.quotientRemainder || null;
    if (!expQR) {
        const e = parseQuotientRemainder(q.ans);
        if (e) expQR = { quotient: e.q, remainder: e.r };
    }
    if (userQR && expQR) {
        return userQR.q === expQR.quotient && userQR.r === expQR.remainder;
    }
    // Fallback: accepted-answers list (case/whitespace-insensitive).
    if (Array.isArray(q.acceptedAnswers)) {
        const u = normalizeText(userAns);
        for (const a of q.acceptedAnswers) {
            if (normalizeText(a) === u) return true;
        }
    }
    // Last resort: original normalized string compare.
    return normalizeText(userAns) === normalizeText(q.ans);
}

// Check if a skill uses fraction answers
function isFractionSkill(skill) {
    if (!skill) return false;
    const fracSkills = [
        'add_fractions_like', 'sub_fractions_like', 'add_mixed_like', 'sub_mixed_like',
        'mult_frac_whole', 'decompose_fractions', 'frac_word_problems',
        'add_frac_unlike', 'sub_frac_unlike', 'add_mixed_unlike', 'sub_mixed_unlike',
        'mult_frac_frac', 'div_unit_fraction', 'frac_as_division', 'frac_mult_word',
        'fraction_number_line', 'whole_as_fraction', 'frac_10_100',
        'add_frac_like_nv', 'sub_frac_like_nv', 'add_frac_unlike_nv', 'sub_frac_unlike_nv',
        'add_mixed_like_nv', 'sub_mixed_like_nv', 'add_mixed_unlike_nv', 'sub_mixed_unlike_nv',
        'mixed_fraction_ops',
        'identify_nv', 'equiv_frac_nv', 'fraction_of_set_nv', 'fraction_of_set_hard_nv',
        'mult_frac_whole_nv', 'decompose_frac_nv', 'frac_10_100_nv',
        'mult_frac_frac_nv', 'div_unit_frac_nv', 'frac_as_div_nv', 'mult_scaling_nv',
        'frac_as_div_word',
        'order_fractions', 'benchmark_fractions', 'compare_frac_lcd',
        'graph_fractions', 'round_fractions', 'estimate_frac_ops',
        'd_to_f', 'p_to_f'
    ];
    return fracSkills.includes(skill);
}

export function checkAnswer(userAns, btnElement) {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    const type = q.answerType || (typeof q.ans === "number" ? "number" : "text");
    let isCorrect = false;

    // ===== REVIEW MODE BRANCH =====
    // Student is re-answering a PAST question (jumped back via dot click).
    // MAP test mode is one-shot (engine refuses re-record); for everything
    // else we update the history entry, recompute the score from history,
    // flash feedback, and resume the live current question.
    if (typeof state._reviewingQIndex === 'number' && state._reviewingQIndex >= 0
        && state.mapMode !== true) {
        return _handleReviewSubmit(userAns, btnElement);
    }

    // Track response time for adaptive difficulty
    const responseTime = state.questionStartTime ? Date.now() - state.questionStartTime : 5000;

    if (type === "number") {
        // Strip commas from user input before parsing (allow commas but don't require them)
        const cleanedInput = String(userAns).replace(/,/g, "");
        const userValue = Number(cleanedInput);
        isCorrect = !Number.isNaN(userValue) && Number(userValue.toFixed(3)) === Number(Number(q.ans).toFixed(3));
    } else if (isTimeSkill(state.skill)) {
        // Flexible time/duration comparison for all time skills
        isCorrect = timeAnswersMatch(userAns, q.ans, state.skill);
    } else if (isFractionSkill(state.skill) || q.answerType === 'fraction-input') {
        // Fraction equivalence: "6/8" = "3/4", "2 3/4" = "11/4"
        // The fraction-input answer type ALWAYS uses fraction equivalence —
        // it's the input system explicitly designed for fraction answers,
        // regardless of whether the originating skill is in isFractionSkill.
        // EXCEPTION: q.noSimplify (e.g. write_fraction "what's literally shaded")
        // requires a LITERAL match — equivalent fractions are NOT accepted.
        if (q.noSimplify) {
            // Strict literal match — strip whitespace, compare numerator/denominator exactly
            const u = String(userAns).replace(/\s+/g, '');
            const a = String(q.ans).replace(/\s+/g, '');
            isCorrect = u === a;
        } else {
            isCorrect = fractionAnswersMatch(userAns, q.ans);
        }
    } else if (isQuotientRemainderQuestion(q)) {
        // Division with remainder: "8 R3", "8R3", "8 r 3", "8 remainder 3" all OK
        isCorrect = quotientRemainderMatches(userAns, q);
    } else {
        isCorrect = normalizeText(userAns) === normalizeText(q.ans);
    }

    // ===== MAP MODE BRANCH =====
    // MAP sessions own their own answer flow: no XP, no streak/boss/race side
    // effects, no auto-advance via transitionToNextQuestion. The MAP engine
    // handles its own next-item scheduling.
    if (state.mapMode === true) {
        state.lastAnswerCorrect = isCorrect;

        if (state.mapSessionMode === 'practice') {
            // Practice: keep problem on screen for retries. Cross out wrong
            // choices; show Skip after 2 wrong attempts. Only correct answers
            // (or explicit Skip) advance the engine.
            const feedback = document.getElementById("feedbackArea");
            const card = document.getElementById("questionCard");
            if (isCorrect) {
                state.hasAnswered = true;
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area correct";
                    feedback.innerHTML = `🎉 Correct!`;
                }
                if (card) card.classList.add("correct-bg");
                if (btnElement) btnElement.classList.add("correct");
                resetAttemptTracking();
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: true });
                }
            } else {
                // Wrong: do NOT call recordMapAnswer (engine would advance).
                const isMC = (q.options && q.options.length > 0);
                recordWrongAttempt({
                    submitted: userAns,
                    btnElement: isMC ? btnElement : null,
                    showHistoryChip: !isMC,
                });
                // Per user spec: 1st wrong → "try again", 2nd wrong → "ask for help"
                // + Next button revealed (handled by showSkipButtonIfNeeded ≥ 2 attempts).
                const attempts = state.currentQAttempts || 1;
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area incorrect";
                    if (attempts >= 2) {
                        feedback.innerHTML = `❌ Not quite — try asking your teacher for help. Click <strong>Next →</strong> when ready to move on.`;
                    } else {
                        feedback.innerHTML = `❌ Not quite — try again!`;
                    }
                }
                if (card) {
                    card.classList.add("incorrect-bg");
                    setTimeout(() => card.classList.remove("incorrect-bg"), 700);
                }
                const answerInput = document.getElementById("answerInput");
                if (answerInput) {
                    answerInput.value = "";
                    answerInput.disabled = false;
                    answerInput.style.borderColor = "";
                    answerInput.style.background = "";
                    setTimeout(() => answerInput.focus(), 50);
                }
                state.hasAnswered = false;
            }
        } else {
            // Simulation mode — silent feedback, advance regardless
            state.hasAnswered = true;
            if (typeof window.recordMapAnswer === 'function') {
                window.recordMapAnswer({ correct: isCorrect });
            }
        }
        return;
    }

    // ===== PROGRESS TRACKING & ADAPTIVE DIFFICULTY =====
    // Update skill progress
    const currentSkill = state.skill || 'add';
    updateSkillProgress(currentSkill, isCorrect);
    
    // Track performance for adaptive difficulty
    trackPerformance(isCorrect, responseTime);

    // Format answer with commas for display
    const displayAnswer = typeof q.ans === "number" && Number.isInteger(q.ans) ? q.ans.toLocaleString() : q.ans;

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    feedback.className = `feedback-area ${isCorrect ? "correct" : "incorrect"}`;
    // Wrong-answer feedback hides the correct answer so the student keeps trying.
    feedback.innerHTML = isCorrect ? `🎉 Correct!` : `❌ Not quite — try again!`;

    // Show the "Show Solution" button after answering
    const solutionBtn = document.getElementById("solutionBtn");
    if (solutionBtn) solutionBtn.style.display = "inline-block";

    if (btnElement) btnElement.classList.add(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        // Record the per-question status for the dot row (green dot).
        // Pass userAns so the redo flow can pre-fill the prior answer.
        if (typeof window.recordQuestionStatus === 'function') {
            window.recordQuestionStatus('correct', { q, userAnswer: userAns });
        }
        state.isIdlePaused = false;
        state.gameTimerPaused = false;
        const _g = document.getElementById('gsbGauge');
        if (_g) { _g.classList.remove('gsb-paused', 'gsb-alert'); }
        { const _td = document.getElementById('timerDisplay'); if (_td) _td.classList.remove('timer-paused'); }
        awardXP(10, 'correct');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        saveState();

        // Reset wrong-attempt tracking — they got it right
        resetAttemptTracking();

        // Streak and surprise bonuses
        checkStreakBonus();
        checkSurpriseBonus();

        if (state.gameMode === "boss") {
            const pushbackAmount = 15;
            state.monsterPos = Math.max(0, state.monsterPos - pushbackAmount);
            updateBossVisuals();
        }
        if (state.gameMode === "race") {
            const playerSpeed = getPlayerRaceSpeed();
            state.racePos = Math.min(100, state.racePos + playerSpeed);
            updateRaceVisuals();
        }

        // Update goal progress display
        updateGoalProgress();

        // Check if problem goals are met (Mixed Mode)
        if (checkProblemGoals()) {
            return; // Game ended due to goal reached
        }

        // Auto-advance with green flash + slide transition
        if (shouldShowNextButton()) {
            setTimeout(() => {
                transitionToNextQuestion();
            }, 2500);
        }
    } else {
        // Wrong answer — keep problem on screen, cross out the wrong choice,
        // show Skip after the 2nd wrong attempt.
        state.sessionStreak = 0;
        state.lastStreakBonus = 0;
        awardXP(2, 'attempt');

        const card = document.getElementById("questionCard");
        if (card) {
            card.classList.add("incorrect-bg");
            // Brief red flash, then return to neutral so student can keep trying
            setTimeout(() => card.classList.remove("incorrect-bg"), 700);
            // Skill-specific visual hint on wrong answer. perimeter_grid
            // glows the outside path yellow/orange so kids see that the
            // perimeter is the OUTSIDE distance. Stays on until next
            // question (renderQuestion clears the class at the top).
            if (
                state.skill === 'perimeter_grid' || q.printFormat === 'perimeter-grid' ||
                state.skill === 'perimeter' || q.printFormat === 'geometry-perimeter'
            ) {
                card.classList.add('show-perim-hint');
            }
        }

        const answerInput = document.getElementById("answerInput");
        const isMC = (q.options && q.options.length > 0);

        // Track this wrong attempt + cross out the wrong choice (or chip)
        recordWrongAttempt({
            submitted: userAns,
            btnElement: isMC ? btnElement : null,
            showHistoryChip: !isMC,
        });

        // Snapshot the wrong attempt so the dot row turns red AND the
        // dot becomes clickable for redo. Subsequent attempts overwrite.
        if (state.mapMode !== true) _snapshotQ(false, userAns);

        // Reset the input so student can try again immediately
        if (answerInput) {
            answerInput.value = "";
            answerInput.style.borderColor = "";
            answerInput.style.background = "";
            answerInput.disabled = false;
            setTimeout(() => answerInput.focus(), 50);
        }

        // Record attempt but do NOT advance
        trackSkillAnswer(false);
        const logSkill = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTime = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkill, false, logTime);

        // Update game stats banner
        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }

        // Badge triggers
        checkBadgeTriggers('answer', { isCorrect: false });

        // Allow another submission immediately
        state.hasAnswered = false;
        return;
    }

    // Badge triggers
    checkBadgeTriggers('answer', { isCorrect });

    // Update game stats banner
    if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
        window.bannerRecordAnswer(isCorrect);
    }

    state.hasAnswered = true;

    // Record to practice log and session skill tracking
    trackSkillAnswer(isCorrect);
    const logSkill = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
    const logTime = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
    recordPracticeLog(logSkill, isCorrect, logTime);
}

// Count the digits the student needs to type for a numeric answer
function expectedDigitCount(ans) {
    const s = String(ans);
    // Count only digit characters (ignore minus, decimal point, commas)
    return s.replace(/[^0-9]/g, '').length;
}

// Auto-check as student types — fires when digit count matches expected answer length
export function autoCheckOnInput() {
    if (state.hasAnswered) return;
    const q = state.currentQ;
    if (!q) return;

    const input = document.getElementById("answerInput");
    if (!input) return;
    const userAns = input.value.trim();
    if (!userAns) return;

    const type = q.answerType || (typeof q.ans === "number" ? "number" : "text");

    if (type === "number") {
        // Auto-submit ONLY when the typed value EXACTLY matches the answer.
        // (Earlier behavior auto-fired once digit count >= target — that
        // trapped students mid-typing: e.g. answer 85, student typing 100
        // submits "10" prematurely. Now we wait for an exact-match OR for
        // the student to press Check/Enter.)
        const ua = String(userAns).replace(/,/g, '').trim();
        if (ua === '' || ua === '-' || ua === '.') return;
        const userNum = Number(ua);
        const ansNum = Number(q.ans);
        if (Number.isFinite(userNum) && Number.isFinite(ansNum) && userNum === ansNum) {
            checkAnswer(userAns);
            return;
        }
    } else if (type === "text") {
        // For text answers, auto-check on exact match only (existing behavior)
        if (isTimeSkill(state.skill)) {
            if (timeAnswersMatch(userAns, q.ans, state.skill)) {
                checkAnswer(userAns);
                return;
            }
        } else if (isQuotientRemainderQuestion(q)) {
            // Auto-submit once a complete "<q> R <r>" pair is typed.
            if (quotientRemainderMatches(userAns, q)) {
                checkAnswer(userAns);
                return;
            }
        } else if (normalizeText(userAns) === normalizeText(q.ans)) {
            checkAnswer(userAns);
            return;
        }
    }
}

export function submitAnswer() {
    const q = state.currentQ;
    if (!q) return; // Defensive: no-op if no current question (e.g. submit pressed before game ready)

    // ===== REVIEW MODE BRANCH =====
    // Re-answering a PAST question — pull the input value, evaluate against
    // q.ans, update history, recompute score, then resume live question.
    if (typeof state._reviewingQIndex === 'number' && state._reviewingQIndex >= 0
        && state.mapMode !== true) {
        const ai = document.getElementById('answerInput');
        const ua = ai ? String(ai.value || '').trim() : '';
        return _handleReviewSubmit(ua, null);
    }

    // multi-select-check submits via its own in-widget Submit button.
    // The global Submit shortcut/button is a no-op for these items.
    if (q.answerType === "multi-select-check") {
        return;
    }

    // Plain "multi-select" (factor grids etc.) — the visual contains
    // .selected items toggled by inline onclick. Read selected data-num
    // values and compare to q.ans (comma-separated correct values).
    if (q.answerType === "multi-select") {
        const visualAid = document.getElementById("visualAid");
        if (!visualAid) return;
        const selected = Array.from(visualAid.querySelectorAll('.selected'))
            .map(el => el.getAttribute('data-num') || el.textContent.trim())
            .filter(Boolean)
            .map(v => parseInt(v, 10))
            .filter(n => !isNaN(n))
            .sort((a, b) => a - b);
        const correct = String(q.ans || '')
            .split(/[,\s]+/)
            .map(s => parseInt(s, 10))
            .filter(n => !isNaN(n))
            .sort((a, b) => a - b);
        const isMatch = selected.length === correct.length &&
            selected.every((v, i) => v === correct[i]);
        // ===== REVIEW MODE BRANCH =====
        if (isReviewing()) {
            return applyReviewOutcome(isMatch, selected.join(','));
        }
        if (state.mapMode !== true) _snapshotQ(isMatch, selected.join(','));
        // Reuse existing checkAnswer pipeline by passing a pseudo-input.
        // We need to fire correct/wrong feedback + next-question advance.
        const feedback = document.getElementById("feedbackArea");
        const card = document.getElementById("questionCard");
        if (isMatch) {
            state.hasAnswered = true;
            state.lastAnswerCorrect = true;
            state.score++;
            state.sessionStreak++;
            if (typeof window.awardXP === 'function') window.awardXP(15, 'correct_multi');
            const gs = document.getElementById("gameScore");
            if (gs) gs.innerText = `${state.score} Correct`;
            if (card) card.classList.add("correct-bg");
            if (typeof window.confetti === 'function') window.confetti();
            if (feedback) {
                feedback.style.display = "block";
                feedback.className = "feedback-area correct";
                feedback.innerHTML = `🎉 Correct! Factors of ${q.text.match(/\d+/)?.[0] || ''}: ${correct.join(', ')}`;
            }
            if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(true);
            trackSkillAnswer(true);
            if (typeof window.recordPracticeLog === 'function') {
                const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                window.recordPracticeLog(sk, true, tm);
            }
            // MAP / standard advance
            if (state.mapMode && typeof window.recordMapAnswer === 'function') {
                setTimeout(() => window.recordMapAnswer({ correct: true }), 800);
            } else if (typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
                setTimeout(() => {
                    if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
                }, 900);
            }
        } else {
            // Wrong — recordWrongAttempt will gate the retry/skip flow.
            recordWrongAttempt({
                submitted: selected.join(','),
                btnElement: null,
                showHistoryChip: false,
            });
            const attempts = state.currentQAttempts || 1;
            if (feedback) {
                feedback.style.display = "block";
                feedback.className = "feedback-area incorrect";
                feedback.innerHTML = (attempts >= 2)
                    ? `❌ Not quite — try asking your teacher for help. Click <strong>Next →</strong> when ready.`
                    : `❌ Not quite — try again! Make sure you've selected ALL the factors.`;
            }
            if (card) {
                card.classList.add("incorrect-bg");
                setTimeout(() => card.classList.remove("incorrect-bg"), 700);
            }
            state.hasAnswered = false;
        }
        return;
    }

    // shade-parts: count how many .shade-target groups have data-shaded="1"
    // and compare to q.shadeTarget. Specific parts don't matter — only count.
    if (q.answerType === "shade-parts") {
        checkShadePartsAnswer();
        return;
    }

    // ten-frame submits via its own in-widget Submit button.
    if (q.answerType === "ten-frame") {
        return;
    }

    // coord-plot submits via its own in-widget Submit button.
    if (q.answerType === "coord-plot") {
        return;
    }

    // nl-drag submits via its own in-widget Submit button.
    if (q.answerType === "nl-drag") {
        return;
    }

    // Column-arithmetic widgets (col-add, col-subtract, col-multiply,
    // long-division, and the unified col-arith) submit via their own
    // in-widget Submit button and auto-submit when every answer cell is
    // green.
    if (q.answerType === "col-add"
        || q.answerType === "col-subtract"
        || q.answerType === "col-multiply"
        || q.answerType === "long-division"
        || q.answerType === "col-arith") {
        return;
    }

    // array-builder submits via its own in-widget Submit button.
    if (q.answerType === "array-builder") {
        return;
    }

    // grid-fill auto-advances via wireBoxValidation when all blanks are correct.
    // The global Submit shortcut/button is a no-op (live validation handles it).
    if (q.answerType === "grid-fill") {
        return;
    }

    // dnd-generic submits via its own in-widget Submit button.
    if (q.answerType === "dnd-generic") {
        return;
    }

    // pv-build submits via its own in-widget Submit button.
    if (q.answerType === "pv-build") {
        return;
    }

    // pv-digit-drag submits via its own in-widget Submit button.
    if (q.answerType === "pv-digit-drag") {
        return;
    }

    // ten-frame-build submits via its own in-widget Submit button.
    if (q.answerType === "ten-frame-build") {
        return;
    }

    // graph-builder submits via its own in-widget Submit button.
    if (q.answerType === "graph-builder") {
        return;
    }

    // base10-build submits via its own in-widget Submit button.
    if (q.answerType === "base10-build") {
        return;
    }

    // drag-fill submits via its own in-widget Submit button.
    if (q.answerType === "drag-fill") {
        return;
    }

    // hot-spot submits via its own in-widget Submit button.
    if (q.answerType === "hot-spot") {
        return;
    }

    // place-symmetry-lines submits via its own in-widget Submit button.
    if (q.answerType === "place-symmetry-lines") {
        return;
    }

    // compose-fraction-tiles submits via its own in-widget Submit button.
    if (q.answerType === "compose-fraction-tiles") {
        return;
    }

    // build-expr submits via its own in-widget Submit button.
    if (q.answerType === "build-expr") {
        return;
    }

    // compose-shape-blocks submits via its own in-widget Submit button.
    if (q.answerType === "compose-shape-blocks") {
        return;
    }

    // numpad-input submits via its own in-widget Submit button.
    if (q.answerType === "numpad-input") {
        return;
    }

    // number-line-extended submits via its own in-widget Submit button.
    if (q.answerType === "number-line-extended") {
        return;
    }

    // coin-builder submits via its own in-widget Submit button.
    if (q.answerType === "coin-builder") {
        return;
    }

    // vocab-match auto-submits when all pairs are correctly matched (the
    // widget owns its own success path via the onVocabMatchSubmit callback).
    if (q.answerType === "vocab-match") {
        return;
    }

    // clock-set submits via its own in-widget Submit button.
    if (q.answerType === "clock-set") {
        return;
    }

    // factor-pairs has its own in-widget Submit button (window.submitFactorPairs).
    // The global Submit shortcut/button delegates to it.
    if (q.answerType === "factor-pairs") {
        submitFactorPairs();
        return;
    }

    // tchart-cells: in-cell input Factor T-Chart. Per-row green/lock happens
    // live in the renderer; Submit confirms ALL expected pairs were captured.
    if (q.answerType === "tchart-cells") {
        submitTchartCells();
        return;
    }

    // mult-chart-cells: 12x12 multiplication chart with N empty input cells.
    // Per-cell green/lock happens live in the renderer; Submit confirms ALL
    // missing products were filled correctly.
    if (q.answerType === "mult-chart-cells") {
        submitMultChartCells();
        return;
    }

    // inline-blanks: ___ markers in q.text are real inputs the student types
    // into. Delegate to submitInlineBlanks (defined below).
    if (q.answerType === "inline-blanks") {
        submitInlineBlanks();
        return;
    }

    // inline-cloze: ___ markers in q.text are real <select> dropdowns. The
    // in-question Submit button (clozeSubmitBtn) owns the submit flow; the
    // global Check shortcut delegates to that button so Enter/space still works.
    if (q.answerType === "inline-cloze") {
        const btn = document.getElementById('clozeSubmitBtn');
        if (btn && typeof btn.click === 'function') btn.click();
        return;
    }

    // image-hotspot: clickable .hot groups in an SVG. The in-widget Submit
    // button owns the flow; delegate so Enter/space still triggers a check.
    if (q.answerType === "image-hotspot") {
        const btn = document.getElementById('imgHotspotSubmitBtn');
        if (btn && typeof btn.click === 'function') btn.click();
        return;
    }

    // Handle different answer types
    if (q.answerType === "box-division") {
        checkBoxDivisionAnswer();
        return;
    } else if (q.answerType === "fraction-input") {
        // Stacked numerator / denominator boxes (fi-num / fi-den)
        checkFractionInputAnswer();
        return;
    } else if (q.answerType === "coord-input") {
        // Coordinate input (separate X/Y boxes with pre-rendered parens+comma)
        checkCoordInputAnswer();
        return;
    } else if (q.answerType === "dual-fraction") {
        // Dual fraction answer (mixed number + improper fraction)
        checkDualFractionAnswer();
        return;
    } else if (q.answerType === "dual") {
        // Dual answer (perimeter + area)
        const perimeterInput = document.getElementById("perimeterInput");
        const areaInput = document.getElementById("areaInput");
        if (!perimeterInput || !areaInput) return;

        const userPerimeter = parseFloat(perimeterInput.value);
        const userArea = parseFloat(areaInput.value);

        if (isNaN(userPerimeter) || isNaN(userArea)) {
            const feedback = document.getElementById("feedbackArea");
            feedback.style.display = "block";
            feedback.className = "feedback-area hint";
            feedback.innerHTML = "Please enter both perimeter and area!";
            return;
        }

        checkDualAnswer(userPerimeter, userArea);
    } else if (q.answerType === "word_problem" || q.answerType === "scaffolded_word") {
        // Word problem answer
        const answerInput = document.getElementById("wordProblemAnswer");
        if (!answerInput || !answerInput.value.trim()) {
            const feedback = document.getElementById("feedbackArea");
            feedback.style.display = "block";
            feedback.className = "feedback-area hint";
            feedback.innerHTML = "Please enter your answer!";
            return;
        }
        checkWordProblemAnswer(answerInput.value);
    } else {
        // Standard single answer.
        // If #answerInput is empty but the visual scaffold has column-answer-input
        // boxes filled in (long division quotient, column add/sub/mult result),
        // harvest those — students can type into the visual and press Enter.
        let input = document.getElementById("answerInput").value;
        if (!input) {
            const cols = document.querySelectorAll('.column-answer-input');
            if (cols.length > 0) {
                const harvested = Array.from(cols).map(el => el.value || '').join('').trim();
                if (harvested) input = harvested;
            }
        }
        if (!input) return;
        checkAnswer(input);
    }
}

// ========== BOX METHOD DIVISION ==========
// Validates roof / sub / remainder inputs against the per-step trace stored
// on q.boxDivisionData. Highlights wrong cells in red, correct in green.
// Only fires the correct-answer flow when EVERY input matches its data-answer.
export function checkBoxDivisionAnswer() {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    if (!q || !q.boxDivisionData) return;

    const visualAid = document.getElementById('visualAid') || document;
    const roofInputs = Array.from(visualAid.querySelectorAll('.bx-roof'));
    const subInputs = Array.from(visualAid.querySelectorAll('.bx-sub'));
    const remInputs = Array.from(visualAid.querySelectorAll('.bx-rem'));

    const allInputs = [...roofInputs, ...subInputs, ...remInputs];
    if (allInputs.length === 0) return;

    // Verify every input matches its data-answer.
    let allCorrect = true;
    let anyFilled = false;
    let firstWrong = null;
    allInputs.forEach(el => {
        const userVal = (el.value || '').trim();
        const expected = (el.dataset.answer || '').trim();
        if (userVal !== '') anyFilled = true;
        const isCellCorrect = userVal !== '' && Number(userVal) === Number(expected);
        if (isCellCorrect) {
            el.style.borderColor = '#2e7d32';
            el.style.background = '#e8f5e9';
        } else {
            allCorrect = false;
            if (!firstWrong) firstWrong = el;
            // Only flag wrong if the user actually typed something OR after a submit attempt;
            // we always flag here because we're inside submitAnswer.
            el.style.borderColor = '#c62828';
            el.style.background = userVal === '' ? '#fff' : '#ffebee';
        }
    });

    if (!anyFilled) {
        const fb = document.getElementById('feedbackArea');
        if (fb) {
            fb.style.display = 'block';
            fb.className = 'feedback-area hint';
            fb.innerHTML = 'Fill in the boxes — quotient on the roof, the subtract amount, and the remainder.';
        }
        return;
    }

    const isCorrect = allCorrect;

    // ===== REVIEW MODE BRANCH =====
    if (isReviewing()) {
        return applyReviewOutcome(isCorrect, 'box-division');
    }
    // Snapshot for the dot-row redo feature (live answer, not review).
    if (state.mapMode !== true) _snapshotQ(isCorrect, 'box-division');

    // ===== MAP MODE BRANCH =====
    if (state.mapMode === true) {
        state.lastAnswerCorrect = isCorrect;
        if (state.mapSessionMode === 'practice') {
            const fb = document.getElementById('feedbackArea');
            if (fb) {
                fb.style.display = 'block';
                fb.className = `feedback-area ${isCorrect ? 'correct' : 'incorrect'}`;
                fb.innerHTML = isCorrect ? '🎉 All boxes correct!' : '❌ Check the highlighted boxes and try again.';
            }
            if (isCorrect) {
                state.hasAnswered = true;
                resetAttemptTracking();
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: true });
                }
            } else {
                recordWrongAttempt({
                    submitted: 'box-method-partial',
                    btnElement: null,
                    showHistoryChip: false,
                });
                state.hasAnswered = false;
            }
            return;
        }
        // Simulation: silent feedback, advance regardless
        state.hasAnswered = true;
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: isCorrect });
        }
        return;
    }

    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.style.display = 'block';

    if (isCorrect) {
        if (feedback) {
            feedback.className = 'feedback-area correct';
            feedback.innerHTML = `🎉 All boxes correct! ${q.boxDivisionData.dividend} ÷ ${q.boxDivisionData.divisor} = ${q.boxDivisionData.quotient}${q.boxDivisionData.remainder > 0 ? ` R ${q.boxDivisionData.remainder}` : ''}`;
        }
        state.lastAnswerCorrect = true;
        state.score = (state.score || 0) + 1;
        state.sessionStreak = (state.sessionStreak || 0) + 1;
        state.isIdlePaused = false;
        state.gameTimerPaused = false;
        { const _g = document.getElementById('gsbGauge'); if (_g) { _g.classList.remove('gsb-paused', 'gsb-alert'); } }
        { const _td = document.getElementById('timerDisplay'); if (_td) _td.classList.remove('timer-paused'); }
        if (typeof window.awardXP === 'function') window.awardXP(15, 'correct_box_division');
        const gs = document.getElementById('gameScore'); if (gs) gs.innerText = `${state.score} Correct`;
        const card = document.getElementById('questionCard'); if (card) card.classList.add('correct-bg');
        if (typeof window.confetti === 'function') window.confetti();
        if (typeof window.saveState === 'function') window.saveState();
        resetAttemptTracking();
        if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
        if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();

        if (typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
            setTimeout(() => {
                if (typeof window.transitionToNextQuestion === 'function') {
                    window.transitionToNextQuestion();
                }
            }, 2500);
        }

        state.hasAnswered = true;

        trackSkillAnswer(true);
        const logSkillBD = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeBD = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillBD, true, logTimeBD);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }

        const solutionBtn = document.getElementById('solutionBtn');
        if (solutionBtn) solutionBtn.style.display = 'inline-block';
    } else {
        const card = document.getElementById('questionCard');
        if (card) {
            card.classList.add('incorrect-bg');
            setTimeout(() => card.classList.remove('incorrect-bg'), 700);
        }
        if (feedback) {
            feedback.className = 'feedback-area incorrect';
            feedback.innerHTML = `❌ Some boxes are off — check the red ones and try again. Hint: ${q.hint || ''}`;
        }
        state.lastAnswerCorrect = false;
        recordWrongAttempt({
            submitted: 'box-method-partial',
            btnElement: null,
            showHistoryChip: false,
        });
        trackSkillAnswer(false);
        const logSkillBD2 = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeBD2 = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillBD2, false, logTimeBD2);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }
        // Focus the first wrong cell so the student can fix it immediately.
        if (firstWrong) {
            try { firstWrong.focus(); firstWrong.select && firstWrong.select(); } catch(_) {}
        }
        state.hasAnswered = false;
    }
}

// Check dual answer (perimeter + area)
export function checkDualAnswer(userPerimeter, userArea) {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    
    const correctPerimeter = q.dualAnswers.perimeter;
    const correctArea = q.dualAnswers.area;
    
    const perimeterCorrect = Math.abs(userPerimeter - correctPerimeter) < 0.01;
    const areaCorrect = Math.abs(userArea - correctArea) < 0.01;
    const isCorrect = perimeterCorrect && areaCorrect;

    // ===== REVIEW MODE BRANCH =====
    if (isReviewing()) {
        return applyReviewOutcome(isCorrect, `P=${userPerimeter},A=${userArea}`);
    }
    if (state.mapMode !== true) _snapshotQ(isCorrect, `P=${userPerimeter},A=${userArea}`);

    // ===== MAP MODE BRANCH =====
    if (state.mapMode === true) {
        state.lastAnswerCorrect = isCorrect;
        if (state.mapSessionMode === 'practice') {
            const fb = document.getElementById("feedbackArea");
            if (fb) {
                fb.style.display = "block";
                fb.className = `feedback-area ${isCorrect ? "correct" : "incorrect"}`;
                fb.innerHTML = isCorrect
                    ? `🎉 Correct!`
                    : `❌ Not quite — try again!`;
            }
            if (isCorrect) {
                state.hasAnswered = true;
                resetAttemptTracking();
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: true });
                }
            } else {
                recordWrongAttempt({
                    submitted: `${userPerimeter}/${userArea}`,
                    btnElement: null,
                    showHistoryChip: false,
                });
                state.hasAnswered = false;
            }
            return;
        }
        // Simulation: silent feedback, advance regardless
        state.hasAnswered = true;
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: isCorrect });
        }
        return;
    }

    // Update input field styling
    const perimeterInput = document.getElementById("perimeterInput");
    const areaInput = document.getElementById("areaInput");

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";

    if (isCorrect) {
        if (perimeterInput) perimeterInput.classList.add("correct");
        if (areaInput) areaInput.classList.add("correct");

        feedback.className = "feedback-area correct";
        feedback.innerHTML = `🎉 Both correct! Perimeter = ${correctPerimeter}, Area = ${correctArea}`;
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        state.isIdlePaused = false;
        state.gameTimerPaused = false;
        { const _g = document.getElementById('gsbGauge'); if (_g) { _g.classList.remove('gsb-paused', 'gsb-alert'); } }
        { const _td = document.getElementById('timerDisplay'); if (_td) _td.classList.remove('timer-paused'); }
        awardXP(15, 'correct_dual');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        saveState();
        resetAttemptTracking();
        checkStreakBonus();
        checkSurpriseBonus();

        if (shouldShowNextButton()) {
            setTimeout(() => transitionToNextQuestion(), 2500);
        }

        state.hasAnswered = true;

        // Record to practice log and session skill tracking
        trackSkillAnswer(true);
        const logSkillD = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeD = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillD, true, logTimeD);

        // Update game stats banner (dual)
        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }

        // Show solution button
        const solutionBtn = document.getElementById("solutionBtn");
        if (solutionBtn) solutionBtn.style.display = "inline-block";
    } else {
        const card = document.getElementById("questionCard");
        if (card) {
            card.classList.add("incorrect-bg");
            setTimeout(() => card.classList.remove("incorrect-bg"), 700);
        }
        feedback.className = "feedback-area incorrect";
        // Tell them which parts are wrong but don't reveal the answer
        let msg = "❌ ";
        if (!perimeterCorrect && !areaCorrect) {
            msg += "Both answers are incorrect. Try again!";
        } else if (!perimeterCorrect) {
            msg += "Perimeter is incorrect. Try again!";
        } else {
            msg += "Area is incorrect. Try again!";
        }
        feedback.innerHTML = msg;

        // Lock the part the student got right so they keep that credit on
        // retry; only the wrong field is reset/refocused. The locked input
        // is disabled so they can't accidentally clear it.
        if (perimeterInput) {
            perimeterInput.classList.add(perimeterCorrect ? "correct" : "incorrect");
            if (perimeterCorrect) {
                perimeterInput.disabled = true;
                perimeterInput.classList.add('locked-correct');
            }
        }
        if (areaInput) {
            areaInput.classList.add(areaCorrect ? "correct" : "incorrect");
            if (areaCorrect) {
                areaInput.disabled = true;
                areaInput.classList.add('locked-correct');
            }
        }

        // Track wrong attempt + show Skip after 2nd wrong
        recordWrongAttempt({
            submitted: `P=${userPerimeter},A=${userArea}`,
            btnElement: null,
            showHistoryChip: false,
        });

        // Record attempt
        trackSkillAnswer(false);
        const logSkillD2 = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeD2 = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillD2, false, logTimeD2);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }

        // Allow another submission immediately. Clear only the wrong fields
        // and refocus the first wrong one so the student knows where to type.
        if (perimeterInput && !perimeterCorrect) {
            perimeterInput.value = "";
            try { perimeterInput.focus(); } catch (_) {}
        } else if (areaInput && !areaCorrect) {
            areaInput.value = "";
            try { areaInput.focus(); } catch (_) {}
        }
        state.hasAnswered = false;
    }
}

// Normalize a fraction answer string for comparison
function normalizeFracAnswer(str) {
    if (!str) return '';
    return str.toString().trim().replace(/\s+/g, ' ').toLowerCase();
}

// Check dual-fraction answer (mixed number + improper fraction)
export function checkDualFractionAnswer() {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    if (!q.dualFractionAnswers) return;

    const mixedInput = document.getElementById("mixedInput");
    const improperInput = document.getElementById("improperInput");
    if (!mixedInput || !improperInput) return;

    const userMixed = mixedInput.value.trim();
    const userImproper = improperInput.value.trim();

    if (!userMixed || !userImproper) {
        const feedback = document.getElementById("feedbackArea");
        feedback.style.display = "block";
        feedback.className = "feedback-area hint";
        feedback.innerHTML = "Please enter both the mixed number and improper fraction!";
        return;
    }

    const correctMixed = q.dualFractionAnswers.mixed;
    const correctImproper = q.dualFractionAnswers.improper;

    const mixedCorrect = normalizeFracAnswer(userMixed) === normalizeFracAnswer(correctMixed);
    const improperCorrect = normalizeFracAnswer(userImproper) === normalizeFracAnswer(correctImproper);
    const isCorrect = mixedCorrect && improperCorrect;

    // ===== REVIEW MODE BRANCH =====
    if (isReviewing()) {
        return applyReviewOutcome(isCorrect, `M=${userMixed},I=${userImproper}`);
    }
    if (state.mapMode !== true) _snapshotQ(isCorrect, `M=${userMixed},I=${userImproper}`);

    // ===== MAP MODE BRANCH =====
    if (state.mapMode === true) {
        state.lastAnswerCorrect = isCorrect;
        if (state.mapSessionMode === 'practice') {
            const fb = document.getElementById("feedbackArea");
            if (fb) {
                fb.style.display = "block";
                fb.className = `feedback-area ${isCorrect ? "correct" : "incorrect"}`;
                fb.innerHTML = isCorrect
                    ? `🎉 Correct!`
                    : `❌ Not quite — try again!`;
            }
            if (isCorrect) {
                state.hasAnswered = true;
                resetAttemptTracking();
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: true });
                }
            } else {
                recordWrongAttempt({
                    submitted: `${userMixed}/${userImproper}`,
                    btnElement: null,
                    showHistoryChip: false,
                });
                state.hasAnswered = false;
            }
            return;
        }
        // Simulation: silent, advance regardless
        state.hasAnswered = true;
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: isCorrect });
        }
        return;
    }

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";

    if (isCorrect) {
        // Style inputs as correct
        if (mixedInput) {
            mixedInput.style.borderColor = "var(--correct)";
            mixedInput.style.background = "rgba(6,214,160,0.15)";
        }
        if (improperInput) {
            improperInput.style.borderColor = "var(--correct)";
            improperInput.style.background = "rgba(6,214,160,0.15)";
        }

        feedback.className = "feedback-area correct";
        feedback.innerHTML = `🎉 Both correct! Mixed: ${correctMixed} = Improper: ${correctImproper}`;
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        state.isIdlePaused = false;
        state.gameTimerPaused = false;
        { const _g = document.getElementById('gsbGauge'); if (_g) { _g.classList.remove('gsb-paused', 'gsb-alert'); } }
        { const _td = document.getElementById('timerDisplay'); if (_td) _td.classList.remove('timer-paused'); }
        awardXP(15, 'correct_dual_fraction');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        saveState();
        resetAttemptTracking();
        checkStreakBonus();
        checkSurpriseBonus();

        if (shouldShowNextButton()) {
            setTimeout(() => transitionToNextQuestion(), 2500);
        }

        state.hasAnswered = true;

        // Record to practice log and session skill tracking
        trackSkillAnswer(true);
        const logSkillDF = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeDF = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillDF, true, logTimeDF);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }

        // Show solution button
        const solutionBtn = document.getElementById("solutionBtn");
        if (solutionBtn) solutionBtn.style.display = "inline-block";
    } else {
        const card = document.getElementById("questionCard");
        if (card) {
            card.classList.add("incorrect-bg");
            setTimeout(() => card.classList.remove("incorrect-bg"), 700);
        }
        feedback.className = "feedback-area incorrect";
        // Tell them which parts are wrong but don't reveal the answer
        let msg = "❌ ";
        if (!mixedCorrect && !improperCorrect) {
            msg += "Both answers are incorrect. Try again!";
        } else if (!mixedCorrect) {
            msg += "Mixed number is incorrect. Try again!";
        } else {
            msg += "Improper fraction is incorrect. Try again!";
        }
        feedback.innerHTML = msg;
        awardXP(2, 'attempt');

        // Style inputs to show which are wrong, and lock the correct one
        // so the student keeps that credit on the retry.
        if (mixedInput) {
            mixedInput.style.borderColor = mixedCorrect ? "var(--correct)" : "var(--incorrect)";
            mixedInput.style.background = mixedCorrect ? "rgba(6,214,160,0.15)" : "rgba(239,71,111,0.15)";
            if (mixedCorrect) {
                mixedInput.disabled = true;
                mixedInput.classList.add('locked-correct');
            }
        }
        if (improperInput) {
            improperInput.style.borderColor = improperCorrect ? "var(--correct)" : "var(--incorrect)";
            improperInput.style.background = improperCorrect ? "rgba(6,214,160,0.15)" : "rgba(239,71,111,0.15)";
            if (improperCorrect) {
                improperInput.disabled = true;
                improperInput.classList.add('locked-correct');
            }
        }

        // Track wrong attempt + show Skip after 2nd wrong
        recordWrongAttempt({
            submitted: `M=${userMixed},I=${userImproper}`,
            btnElement: null,
            showHistoryChip: false,
        });

        // Record attempt
        trackSkillAnswer(false);
        const logSkillDF2 = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeDF2 = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillDF2, false, logTimeDF2);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }

        // Allow another submission immediately. Clear only the wrong fields
        // and refocus the first wrong one.
        if (mixedInput && !mixedCorrect) {
            mixedInput.value = "";
            try { mixedInput.focus(); } catch (_) {}
        } else if (improperInput && !improperCorrect) {
            improperInput.value = "";
            try { improperInput.focus(); } catch (_) {}
        }
        state.hasAnswered = false;
    }
}

// Check word problem answer
export function checkWordProblemAnswer(userAnswer) {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    
    // Extract number from user answer
    const numMatch = userAnswer.match(/[\d,]+\.?\d*/);
    const userNum = numMatch ? parseFloat(numMatch[0].replace(/,/g, '')) : NaN;
    
    const isCorrect = !isNaN(userNum) && Math.abs(userNum - q.ans) < 0.01;

    // ===== REVIEW MODE BRANCH =====
    if (isReviewing()) {
        return applyReviewOutcome(isCorrect, userAnswer);
    }
    if (state.mapMode !== true) _snapshotQ(isCorrect, userAnswer);

    // ===== MAP MODE BRANCH =====
    if (state.mapMode === true) {
        state.lastAnswerCorrect = isCorrect;
        if (state.mapSessionMode === 'practice') {
            const fb = document.getElementById("feedbackArea");
            if (fb) {
                fb.style.display = "block";
                fb.className = `feedback-area ${isCorrect ? "correct" : "incorrect"}`;
                fb.innerHTML = isCorrect
                    ? `🎉 Correct!`
                    : `❌ Not quite — try again!`;
            }
            if (isCorrect) {
                state.hasAnswered = true;
                resetAttemptTracking();
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: true });
                }
            } else {
                recordWrongAttempt({
                    submitted: userAnswer,
                    btnElement: null,
                    showHistoryChip: true,
                });
                const wpInput = document.getElementById("wordProblemAnswer");
                if (wpInput) {
                    wpInput.value = "";
                    setTimeout(() => wpInput.focus(), 50);
                }
                state.hasAnswered = false;
            }
            return;
        }
        // Simulation: silent, advance regardless
        state.hasAnswered = true;
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: isCorrect });
        }
        return;
    }

    // Check if user selected correct type (area vs perimeter)
    const selectedType = document.querySelector('input[name="problemType"]:checked');
    const typeCorrect = !selectedType || selectedType.value === q.expectedType;

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    
    const answerInput = document.getElementById("wordProblemAnswer");
    
    if (isCorrect) {
        feedback.className = "feedback-area correct";
        feedback.innerHTML = `🎉 Correct! ${q.ans} ${q.expectedUnit}`;
        if (answerInput) {
            answerInput.style.borderColor = "var(--accent-green)";
            answerInput.style.background = "rgba(76, 175, 80, 0.15)";
        }
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        state.isIdlePaused = false;
        state.gameTimerPaused = false;
        { const _g = document.getElementById('gsbGauge'); if (_g) { _g.classList.remove('gsb-paused', 'gsb-alert'); } }
        { const _td = document.getElementById('timerDisplay'); if (_td) _td.classList.remove('timer-paused'); }
        awardXP(12, 'correct_word');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        saveState();
        resetAttemptTracking();
        checkStreakBonus();
        checkSurpriseBonus();

        if (shouldShowNextButton()) {
            setTimeout(() => transitionToNextQuestion(), 2500);
        }

        state.hasAnswered = true;

        // Update game stats banner (word problem)
        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }

        // Record to practice log and session skill tracking
        trackSkillAnswer(true);
        const logSkillWP = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeWP = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillWP, true, logTimeWP);

        // Show solution button
        const solutionBtn = document.getElementById("solutionBtn");
        if (solutionBtn) solutionBtn.style.display = "inline-block";
    } else {
        const card = document.getElementById("questionCard");
        if (card) {
            card.classList.add("incorrect-bg");
            setTimeout(() => card.classList.remove("incorrect-bg"), 700);
        }
        feedback.className = "feedback-area incorrect";
        // Don't reveal the answer — tell student to try again
        feedback.innerHTML = "❌ That's not correct. Try again!";

        if (answerInput) {
            answerInput.style.borderColor = "var(--accent-red)";
            answerInput.style.background = "rgba(244, 67, 54, 0.15)";
        }

        // Track wrong attempt + show Skip after 2nd wrong
        recordWrongAttempt({
            submitted: userAnswer,
            btnElement: null,
            showHistoryChip: true,
        });

        // Record attempt
        trackSkillAnswer(false);
        const logSkillWP2 = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeWP2 = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillWP2, false, logTimeWP2);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }

        // Allow another submission immediately
        if (answerInput) {
            answerInput.value = "";
            answerInput.style.borderColor = "";
            answerInput.style.background = "";
            setTimeout(() => answerInput.focus(), 50);
        }
        state.hasAnswered = false;
    }
}

// ===== COORD-INPUT (separate X/Y boxes with pre-rendered parens+comma) =====
// q.ans is either { x, y } (single point) or [{ label, x, y }, ...] (multi-point).
// Inputs have IDs: ciX_<idx>, ciY_<idx> for each point.
export function checkCoordInputAnswer() {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    if (!q) return;

    // Normalize ans to an array of {x, y, label?}
    const ansArr = Array.isArray(q.ans)
        ? q.ans
        : [{ x: q.ans.x, y: q.ans.y, label: 'A' }];

    // Read each point's two inputs
    const submitted = [];          // [{ux, uy, xCorrect, yCorrect, pointCorrect}]
    let anyEmpty = false;
    ansArr.forEach((pt, idx) => {
        const xIn = document.getElementById(`ciX_${idx}`);
        const yIn = document.getElementById(`ciY_${idx}`);
        const ux = xIn ? xIn.value.trim() : '';
        const uy = yIn ? yIn.value.trim() : '';
        if (ux === '' || uy === '') anyEmpty = true;
        // Allow optional leading minus for negatives
        const ucXNum = /^-?\d+$/.test(ux) ? parseInt(ux, 10) : NaN;
        const ucYNum = /^-?\d+$/.test(uy) ? parseInt(uy, 10) : NaN;
        const xCorrect = !isNaN(ucXNum) && ucXNum === pt.x;
        const yCorrect = !isNaN(ucYNum) && ucYNum === pt.y;
        submitted.push({ ux, uy, xCorrect, yCorrect, pointCorrect: xCorrect && yCorrect, xIn, yIn, pt });
    });

    if (anyEmpty) {
        const fb = document.getElementById("feedbackArea");
        if (fb) {
            fb.style.display = "block";
            fb.className = "feedback-area hint";
            fb.innerHTML = "Please fill in both x and y for every point!";
        }
        return;
    }

    const isCorrect = submitted.every(s => s.pointCorrect);

    // ===== REVIEW MODE BRANCH =====
    if (isReviewing()) {
        const subStr = submitted.map(s => `(${s.ux},${s.uy})`).join(';');
        return applyReviewOutcome(isCorrect, subStr);
    }
    if (state.mapMode !== true) {
        const subStr = submitted.map(s => `(${s.ux},${s.uy})`).join(';');
        _snapshotQ(isCorrect, subStr);
    }

    // ===== MAP MODE BRANCH =====
    if (state.mapMode === true) {
        state.lastAnswerCorrect = isCorrect;
        if (state.mapSessionMode === 'practice') {
            const fb = document.getElementById("feedbackArea");
            if (fb) {
                fb.style.display = "block";
                fb.className = `feedback-area ${isCorrect ? "correct" : "incorrect"}`;
                fb.innerHTML = isCorrect
                    ? `🎉 Correct!`
                    : `❌ Not quite — try again!`;
            }
            // Visual flash on inputs
            submitted.forEach(s => {
                if (s.xIn) {
                    s.xIn.classList.remove('flash-correct', 'flash-wrong');
                    s.xIn.classList.add(s.xCorrect ? 'flash-correct' : 'flash-wrong');
                }
                if (s.yIn) {
                    s.yIn.classList.remove('flash-correct', 'flash-wrong');
                    s.yIn.classList.add(s.yCorrect ? 'flash-correct' : 'flash-wrong');
                }
            });
            if (isCorrect) {
                state.hasAnswered = true;
                resetAttemptTracking();
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: true });
                }
            } else {
                const subStr = submitted.map(s => `(${s.ux},${s.uy})`).join(';');
                recordWrongAttempt({
                    submitted: subStr,
                    btnElement: null,
                    showHistoryChip: false,
                });
                state.hasAnswered = false;
            }
            return;
        }
        // Simulation: silent, advance regardless
        state.hasAnswered = true;
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: isCorrect });
        }
        return;
    }

    const feedback = document.getElementById("feedbackArea");
    if (feedback) feedback.style.display = "block";

    if (isCorrect) {
        // Style each input as correct (flash green)
        submitted.forEach(s => {
            if (s.xIn) { s.xIn.classList.remove('flash-wrong'); s.xIn.classList.add('flash-correct'); }
            if (s.yIn) { s.yIn.classList.remove('flash-wrong'); s.yIn.classList.add('flash-correct'); }
        });

        if (feedback) {
            feedback.className = "feedback-area correct";
            const ansDisplay = ansArr.map(p => `${p.label || ''}${p.label ? ': ' : ''}(${p.x}, ${p.y})`).join(', ');
            feedback.innerHTML = `🎉 Correct! ${ansDisplay}`;
        }
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        state.isIdlePaused = false;
        state.gameTimerPaused = false;
        { const _g = document.getElementById('gsbGauge'); if (_g) { _g.classList.remove('gsb-paused', 'gsb-alert'); } }
        { const _td = document.getElementById('timerDisplay'); if (_td) _td.classList.remove('timer-paused'); }
        if (typeof window.awardXP === 'function') window.awardXP(15, 'correct_coord');
        const gs = document.getElementById("gameScore");
        if (gs) gs.innerText = `${state.score} Correct`;
        const card = document.getElementById("questionCard");
        if (card) card.classList.add("correct-bg");
        if (typeof window.confetti === 'function') window.confetti();
        if (typeof window.saveState === 'function') window.saveState();
        resetAttemptTracking();
        if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
        if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();

        if (typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
            setTimeout(() => {
                if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
            }, 2500);
        }

        state.hasAnswered = true;

        // Record to practice log and session skill tracking
        trackSkillAnswer(true);
        const logSkillCI = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeCI = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillCI, true, logTimeCI);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }

        // Show solution button
        const solutionBtn = document.getElementById("solutionBtn");
        if (solutionBtn) solutionBtn.style.display = "inline-block";
    } else {
        const card = document.getElementById("questionCard");
        if (card) {
            card.classList.add("incorrect-bg");
            setTimeout(() => card.classList.remove("incorrect-bg"), 700);
        }
        if (feedback) {
            feedback.className = "feedback-area incorrect";
            const wrongCount = submitted.filter(s => !s.pointCorrect).length;
            feedback.innerHTML = wrongCount === submitted.length
                ? "❌ Not quite. Try again!"
                : `❌ ${wrongCount} of ${submitted.length} point(s) incorrect. Try again!`;
        }
        if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');

        // Style each input to show which axis is wrong; clear wrong axis
        // values and lock correct ones so the student keeps that credit on
        // retry. Locked inputs are disabled to prevent accidental edits.
        submitted.forEach(s => {
            if (s.xIn) {
                s.xIn.classList.remove('flash-correct', 'flash-wrong');
                s.xIn.classList.add(s.xCorrect ? 'flash-correct' : 'flash-wrong');
                if (!s.xCorrect) {
                    s.xIn.value = '';
                } else {
                    s.xIn.disabled = true;
                    s.xIn.classList.add('locked-correct');
                }
            }
            if (s.yIn) {
                s.yIn.classList.remove('flash-correct', 'flash-wrong');
                s.yIn.classList.add(s.yCorrect ? 'flash-correct' : 'flash-wrong');
                if (!s.yCorrect) {
                    s.yIn.value = '';
                } else {
                    s.yIn.disabled = true;
                    s.yIn.classList.add('locked-correct');
                }
            }
        });

        // Track wrong attempt + show Skip after 2nd wrong
        const subStr = submitted.map(s => `(${s.ux},${s.uy})`).join(';');
        recordWrongAttempt({
            submitted: subStr,
            btnElement: null,
            showHistoryChip: false,
        });

        // Record attempt
        trackSkillAnswer(false);
        const logSkillCI2 = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeCI2 = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillCI2, false, logTimeCI2);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }

        // Refocus first wrong x input
        setTimeout(() => {
            const firstWrong = submitted.find(s => !s.pointCorrect);
            if (firstWrong && firstWrong.xIn && !firstWrong.xCorrect) firstWrong.xIn.focus();
            else if (firstWrong && firstWrong.yIn) firstWrong.yIn.focus();
        }, 50);

        state.hasAnswered = false;
    }
}

// ========== FACTOR PAIRS (fill-in-the-blanks rainbow) ==========
// Reads .fp-input cells inside #visualAid, compares each value to its
// data-answer. All match → correct flow (XP, MAP/standard advance).
// Any wrong → recordWrongAttempt + per-cell red border + retry message;
// after 2 wrong attempts the global Skip button surfaces.
export function submitFactorPairs() {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;

    const q = state.currentQ;
    if (!q || q.answerType !== 'factor-pairs') return;

    const visualAid = document.getElementById('visualAid');
    if (!visualAid) return;

    const inputs = Array.from(visualAid.querySelectorAll('.fp-input'));
    if (inputs.length === 0) return;

    let allFilled = true;
    let allCorrect = true;
    const userValues = [];

    inputs.forEach(input => {
        const userVal = (input.value || '').trim();
        const expected = String(input.dataset.answer || '').trim();
        userValues.push(userVal);
        if (userVal === '') {
            allFilled = false;
            allCorrect = false;
            input.classList.remove('correct', 'wrong');
        } else if (userVal === expected) {
            input.classList.add('correct');
            input.classList.remove('wrong');
        } else {
            input.classList.add('wrong');
            input.classList.remove('correct');
            allCorrect = false;
        }
    });

    const feedback = document.getElementById('feedbackArea');
    const card = document.getElementById('questionCard');

    if (!allFilled) {
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback-area hint';
            feedback.innerHTML = 'Please fill in all the missing factors.';
        }
        return;
    }

    // ===== REVIEW MODE BRANCH =====
    if (isReviewing()) {
        return applyReviewOutcome(allCorrect, userValues.join(','));
    }
    if (state.mapMode !== true) _snapshotQ(allCorrect, userValues.join(','));

    if (allCorrect) {
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        state.score = (state.score || 0) + 1;
        state.sessionStreak = (state.sessionStreak || 0) + 1;
        if (typeof window.awardXP === 'function') window.awardXP(15, 'correct_factor_pairs');
        const gs = document.getElementById('gameScore');
        if (gs) gs.innerText = `${state.score} Correct`;
        if (card) card.classList.add('correct-bg');
        if (typeof window.confetti === 'function') window.confetti();
        if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
        if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback-area correct';
            const numForMsg = (q.factorPairData && q.factorPairData.num) || '';
            feedback.innerHTML = numForMsg
                ? `Correct! All factor pairs of ${numForMsg} complete.`
                : 'Correct!';
        }
        if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(true);
        trackSkillAnswer(true);
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, true, tm);
        }
        state.totalQuestions = (state.totalQuestions || 0) + 1;
        if (typeof window.updateDailyGoalProgress === 'function') {
            try { window.updateDailyGoalProgress(true); } catch (_) {}
        }
        inputs.forEach(inp => { inp.disabled = true; });

        // MAP mode owns its own next-item flow.
        if (state.mapMode && typeof window.recordMapAnswer === 'function') {
            setTimeout(() => {
                try { window.recordMapAnswer({ correct: true }); } catch (_) {}
            }, 800);
            return;
        }
        // Standard practice / boss / race auto-advance.
        try {
            if (typeof window.showNextButton === 'function') window.showNextButton();
        } catch (_) {}
        if (typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
            setTimeout(() => {
                try {
                    if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
                    else if (typeof window.nextQuestion === 'function') window.nextQuestion();
                } catch (_) {}
            }, 900);
        }
        return;
    }

    // Wrong path — bump attempt counter, surface Skip after 2 attempts.
    recordWrongAttempt({
        submitted: userValues.join(','),
        btnElement: null,
        showHistoryChip: false,
    });
    trackSkillAnswer(false);
    const logSk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
    const logTm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
    recordPracticeLog(logSk, false, logTm);
    if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
        window.bannerRecordAnswer(false);
    }

    const attempts = state.currentQAttempts || 1;
    if (feedback) {
        feedback.style.display = 'block';
        feedback.className = 'feedback-area incorrect';
        feedback.innerHTML = (attempts >= 2)
            ? 'Not quite — try asking your teacher for help. Click <strong>Next →</strong> when ready.'
            : 'Not quite — check the red boxes and try again.';
    }
    if (card) {
        card.classList.add('incorrect-bg');
        setTimeout(() => card.classList.remove('incorrect-bg'), 700);
    }
    // Refocus first wrong cell so the student can edit immediately.
    const firstWrong = inputs.find(inp => inp.classList.contains('wrong'));
    if (firstWrong) {
        try { firstWrong.focus(); firstWrong.select && firstWrong.select(); } catch (_) {}
    }
    state.hasAnswered = false;
}

// ========== T-CHART CELLS (Factor T-Chart in-cell input) ==========
// Per-pair lock-on-correct happens live in question-render.js (see the
// `tchart-cells` branch). Submit just confirms ALL expected pairs were
// captured. Any expected pair missing → wrong; flag any unfilled rows red.
export function submitTchartCells() {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;

    const q = state.currentQ;
    if (!q || q.answerType !== 'tchart-cells') return;

    const visualAid = document.getElementById('visualAid');
    if (!visualAid) return;

    const inputs = Array.from(visualAid.querySelectorAll('.tc-input'));
    if (inputs.length === 0) return;

    const ntd = q.numberTheoryData || {};
    const expectedPairs = (ntd.factorPairs || []).map(p => {
        const a = +p[0], b = +p[1];
        const lo = Math.min(a, b), hi = Math.max(a, b);
        return `${lo}x${hi}`;
    });

    // Collect locked (already-validated) pairs from the DOM.
    const rows = [...new Set(inputs.map(i => i.dataset.row))];
    const lockedKeys = [];
    let anyUnfilled = false;
    rows.forEach(r => {
        const [l, rg] = [
            visualAid.querySelector(`.tc-input[data-row="${r}"][data-side="left"]`),
            visualAid.querySelector(`.tc-input[data-row="${r}"][data-side="right"]`),
        ];
        if (!l || !rg) return;
        if (l.classList.contains('locked') && rg.classList.contains('locked')) {
            const a = +l.value, b = +rg.value;
            const lo = Math.min(a, b), hi = Math.max(a, b);
            lockedKeys.push(`${lo}x${hi}`);
        } else {
            anyUnfilled = true;
            // Mark any partially-filled row red as a hint.
            const lv = (l.value || '').trim();
            const rv = (rg.value || '').trim();
            if (lv !== '' || rv !== '') {
                l.classList.add('wrong');
                rg.classList.add('wrong');
            }
        }
    });

    const feedback = document.getElementById('feedbackArea');
    const card = document.getElementById('questionCard');

    // Compare locked set to expected (multiset equality).
    const allFound = expectedPairs.length === lockedKeys.length
        && expectedPairs.slice().sort().join('|') === lockedKeys.slice().sort().join('|');

    // ===== REVIEW MODE BRANCH =====
    if (isReviewing()) {
        return applyReviewOutcome(allFound && !anyUnfilled, lockedKeys.join(','));
    }
    if (state.mapMode !== true) _snapshotQ(allFound && !anyUnfilled, lockedKeys.join(','));

    if (allFound && !anyUnfilled) {
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        state.score = (state.score || 0) + 1;
        state.sessionStreak = (state.sessionStreak || 0) + 1;
        if (typeof window.awardXP === 'function') window.awardXP(15, 'correct_tchart');
        const gs = document.getElementById('gameScore');
        if (gs) gs.innerText = `${state.score} Correct`;
        if (card) card.classList.add('correct-bg');
        if (typeof window.confetti === 'function') window.confetti();
        if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
        if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback-area correct';
            const numForMsg = ntd.num || '';
            feedback.innerHTML = numForMsg
                ? `Correct! All factor pairs of ${numForMsg} found.`
                : 'Correct!';
        }
        if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(true);
        trackSkillAnswer(true);
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, true, tm);
        }
        state.totalQuestions = (state.totalQuestions || 0) + 1;
        if (typeof window.updateDailyGoalProgress === 'function') {
            try { window.updateDailyGoalProgress(true); } catch (_) {}
        }
        inputs.forEach(inp => { inp.disabled = true; });

        if (state.mapMode && typeof window.recordMapAnswer === 'function') {
            setTimeout(() => {
                try { window.recordMapAnswer({ correct: true }); } catch (_) {}
            }, 800);
            return;
        }
        try { if (typeof window.showNextButton === 'function') window.showNextButton(); } catch (_) {}
        if (typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
            setTimeout(() => {
                try {
                    if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
                    else if (typeof window.nextQuestion === 'function') window.nextQuestion();
                } catch (_) {}
            }, 900);
        }
        return;
    }

    // Not done — friendly hint when rows are still empty, otherwise wrong.
    if (anyUnfilled && lockedKeys.length < expectedPairs.length) {
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback-area hint';
            const remaining = expectedPairs.length - lockedKeys.length;
            feedback.innerHTML = `Keep going — ${remaining} more factor pair${remaining === 1 ? '' : 's'} to find.`;
        }
        return;
    }

    // Wrong path (shouldn't normally happen since per-row validation locks
    // green, but kept for safety — e.g., a row with a non-factor pair that
    // failed live validation).
    recordWrongAttempt({
        submitted: lockedKeys.join(','),
        btnElement: null,
        showHistoryChip: false,
    });
    trackSkillAnswer(false);
    const logSk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
    const logTm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
    recordPracticeLog(logSk, false, logTm);
    if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
        window.bannerRecordAnswer(false);
    }
    const attempts = state.currentQAttempts || 1;
    if (feedback) {
        feedback.style.display = 'block';
        feedback.className = 'feedback-area incorrect';
        feedback.innerHTML = (attempts >= 2)
            ? 'Not quite — try asking your teacher for help. Click <strong>Next →</strong> when ready.'
            : 'Not quite — check the red boxes and try again.';
    }
    if (card) {
        card.classList.add('incorrect-bg');
        setTimeout(() => card.classList.remove('incorrect-bg'), 700);
    }
    state.hasAnswered = false;
}

// ========== MULTIPLICATION CHART CELLS ==========
// Per-cell green/lock happens live in question-render.js (the
// `mult-chart-cells` branch). Submit confirms ALL missing cells contain the
// correct product (i.e. every .mc-input is locked-green). Any unfilled or
// wrong cell → friendly hint or wrong-attempt path.
export function submitMultChartCells() {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;

    const q = state.currentQ;
    if (!q || q.answerType !== 'mult-chart-cells') return;

    const visualAid = document.getElementById('visualAid');
    if (!visualAid) return;

    const inputs = Array.from(visualAid.querySelectorAll('.mc-input'));
    if (inputs.length === 0) return;

    const feedback = document.getElementById('feedbackArea');
    const card = document.getElementById('questionCard');

    // Bucket by state.
    let lockedCount = 0;
    let unfilledCount = 0;
    let wrongCount = 0;
    inputs.forEach(inp => {
        if (inp.classList.contains('locked')) {
            lockedCount++;
            return;
        }
        const v = (inp.value || '').trim();
        const expected = String(inp.dataset.answer || '').trim();
        if (v === '') {
            unfilledCount++;
        } else if (v !== expected) {
            wrongCount++;
            inp.classList.add('wrong');
        } else {
            // Edge case: filled with the correct value but listener missed it
            // (paste, autofill, etc.). Lock it now.
            inp.classList.remove('wrong');
            inp.classList.add('correct', 'locked');
            inp.disabled = true;
            lockedCount++;
        }
    });

    const total = inputs.length;
    const allCorrect = lockedCount === total;

    // ===== REVIEW MODE BRANCH =====
    if (isReviewing()) {
        const submittedStr = inputs.map(i => (i.value || '').trim() || '_').join(',');
        return applyReviewOutcome(allCorrect, submittedStr);
    }
    if (state.mapMode !== true) {
        _snapshotQ(allCorrect, inputs.map(i => (i.value || '').trim() || '_').join(','));
    }

    if (allCorrect) {
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        state.score = (state.score || 0) + 1;
        state.sessionStreak = (state.sessionStreak || 0) + 1;
        if (typeof window.awardXP === 'function') window.awardXP(20, 'correct_mult_chart');
        const gs = document.getElementById('gameScore');
        if (gs) gs.innerText = `${state.score} Correct`;
        if (card) card.classList.add('correct-bg');
        if (typeof window.confetti === 'function') window.confetti();
        if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
        if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback-area correct';
            feedback.innerHTML = `Correct! All ${total} missing products filled in.`;
        }
        if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(true);
        trackSkillAnswer(true);
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, true, tm);
        }
        state.totalQuestions = (state.totalQuestions || 0) + 1;
        if (typeof window.updateDailyGoalProgress === 'function') {
            try { window.updateDailyGoalProgress(true); } catch (_) {}
        }
        inputs.forEach(inp => { inp.disabled = true; });

        if (state.mapMode && typeof window.recordMapAnswer === 'function') {
            setTimeout(() => {
                try { window.recordMapAnswer({ correct: true }); } catch (_) {}
            }, 800);
            return;
        }
        try { if (typeof window.showNextButton === 'function') window.showNextButton(); } catch (_) {}
        if (typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
            setTimeout(() => {
                try {
                    if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
                    else if (typeof window.nextQuestion === 'function') window.nextQuestion();
                } catch (_) {}
            }, 900);
        }
        return;
    }

    // Partial: some cells still empty (and no wrong values) → friendly hint.
    if (unfilledCount > 0 && wrongCount === 0) {
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback-area hint';
            feedback.innerHTML = `Keep going — ${unfilledCount} more cell${unfilledCount === 1 ? '' : 's'} to fill.`;
        }
        const firstEmpty = inputs.find(el => !el.disabled && !(el.value || '').trim());
        if (firstEmpty) { try { firstEmpty.focus(); } catch (_) {} }
        return;
    }

    // At least one wrong value typed in → wrong path.
    recordWrongAttempt({
        submitted: inputs.map(i => (i.value || '').trim() || '_').join(','),
        btnElement: null,
        showHistoryChip: false,
    });
    trackSkillAnswer(false);
    const logSk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
    const logTm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
    recordPracticeLog(logSk, false, logTm);
    if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
        window.bannerRecordAnswer(false);
    }
    const attempts = state.currentQAttempts || 1;
    if (feedback) {
        feedback.style.display = 'block';
        feedback.className = 'feedback-area incorrect';
        feedback.innerHTML = (attempts >= 2)
            ? 'Not quite — check the red cells. Click <strong>Next →</strong> when ready.'
            : 'Not quite — check the red cells and try again.';
    }
    if (card) {
        card.classList.add('incorrect-bg');
        setTimeout(() => card.classList.remove('incorrect-bg'), 700);
    }
    const firstWrong = inputs.find(inp => inp.classList.contains('wrong'));
    if (firstWrong) {
        try { firstWrong.focus(); firstWrong.select && firstWrong.select(); } catch (_) {}
    }
    state.hasAnswered = false;
}

// ========== INLINE BLANKS ==========
// Reads .ib-cell inputs (inside #questionText), normalizes them, and
// matches against q.inlineBlanksData.acceptedSets. Each accepted set is an
// ordered array of strings — if ANY set matches the student's values
// element-by-element, the answer is correct. This lets generators encode
// commutative pairs (e.g., 3 rows of 5 OR 5 rows of 3) by listing both
// orderings.
export function submitInlineBlanks() {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;

    const q = state.currentQ;
    if (!q || q.answerType !== 'inline-blanks') return;

    const cells = Array.from(document.querySelectorAll('.ib-cell'));
    if (cells.length === 0) return;

    // Read & normalize values (trim, drop commas).
    const userValues = cells.map(c => String(c.value || '').trim().replace(/,/g, ''));
    const allFilled = userValues.every(v => v !== '');

    const feedback = document.getElementById('feedbackArea');
    const card = document.getElementById('questionCard');

    if (!allFilled) {
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback-area hint';
            feedback.innerHTML = 'Please fill in all the blanks.';
        }
        // Focus first empty cell.
        const firstEmpty = cells.find(c => !(c.value || '').trim());
        if (firstEmpty) { try { firstEmpty.focus(); } catch (_) {} }
        return;
    }

    // Build the list of accepted answer sets. Each entry is an array of
    // strings, length === cells.length. Numeric comparison is loose (3 == "3").
    let acceptedSets = (q.inlineBlanksData && Array.isArray(q.inlineBlanksData.acceptedSets))
        ? q.inlineBlanksData.acceptedSets
        : null;
    if (!acceptedSets && Array.isArray(q.ans)) {
        acceptedSets = [q.ans.map(String)];
    }
    if (!acceptedSets || acceptedSets.length === 0) {
        // Defensive: nothing to compare against — treat as wrong.
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback-area incorrect';
            feedback.innerHTML = 'Could not check answer (no expected values configured).';
        }
        return;
    }

    // Compare a single accepted-set against userValues. Loose numeric: if
    // both sides parse as numbers, compare numerically; otherwise compare
    // strings (case-insensitive, whitespace-stripped).
    const valueMatches = (a, b) => {
        const sa = String(a).trim();
        const sb = String(b).trim();
        const na = Number(sa.replace(/,/g, ''));
        const nb = Number(sb.replace(/,/g, ''));
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na === nb;
        return sa.toLowerCase().replace(/\s+/g, '') === sb.toLowerCase().replace(/\s+/g, '');
    };

    let bestMatchSet = null;
    let isCorrect = false;
    for (const set of acceptedSets) {
        if (!Array.isArray(set) || set.length !== userValues.length) continue;
        const allMatch = userValues.every((v, i) => valueMatches(v, set[i]));
        if (allMatch) {
            isCorrect = true;
            bestMatchSet = set;
            break;
        }
    }

    // Color cells: green for matches against the BEST set (first matching, or
    // first set if none match), red for mismatches.
    const compareSet = bestMatchSet || acceptedSets[0];
    cells.forEach((cell, i) => {
        const cellOk = valueMatches(userValues[i], compareSet[i]);
        if (cellOk) {
            cell.style.borderBottomColor = '#2e7d32';
            cell.style.color = '#2e7d32';
        } else {
            cell.style.borderBottomColor = '#c62828';
            cell.style.color = '#c62828';
        }
    });

    // ===== REVIEW MODE BRANCH =====
    if (isReviewing()) {
        return applyReviewOutcome(isCorrect, userValues.join(','));
    }
    if (state.mapMode !== true) _snapshotQ(isCorrect, userValues.join(','));

    if (isCorrect) {
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        state.score = (state.score || 0) + 1;
        state.sessionStreak = (state.sessionStreak || 0) + 1;
        if (typeof window.awardXP === 'function') window.awardXP(10, 'correct_inline_blanks');
        const gs = document.getElementById('gameScore');
        if (gs) gs.innerText = `${state.score} Correct`;
        if (card) card.classList.add('correct-bg');
        if (typeof window.confetti === 'function') window.confetti();
        if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
        if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'feedback-area correct';
            feedback.innerHTML = '🎉 Correct!';
        }
        if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(true);
        trackSkillAnswer(true);
        const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(sk, true, tm);
        state.totalQuestions = (state.totalQuestions || 0) + 1;
        if (typeof window.updateDailyGoalProgress === 'function') {
            try { window.updateDailyGoalProgress(true); } catch (_) {}
        }
        cells.forEach(c => { c.disabled = true; });

        // MAP mode owns its own next-item flow.
        if (state.mapMode && typeof window.recordMapAnswer === 'function') {
            setTimeout(() => {
                try { window.recordMapAnswer({ correct: true }); } catch (_) {}
            }, 800);
            return;
        }
        // Standard practice / boss / race auto-advance.
        try {
            if (typeof window.showNextButton === 'function') window.showNextButton();
        } catch (_) {}
        if (typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
            setTimeout(() => {
                try {
                    if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
                    else if (typeof window.nextQuestion === 'function') window.nextQuestion();
                } catch (_) {}
            }, 900);
        }
        return;
    }

    // Wrong path — bump attempt counter, surface Skip after 2 attempts.
    recordWrongAttempt({
        submitted: userValues.join(','),
        btnElement: null,
        showHistoryChip: false,
    });
    state.lastAnswerCorrect = false;
    trackSkillAnswer(false);
    const logSk2 = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
    const logTm2 = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
    recordPracticeLog(logSk2, false, logTm2);
    if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
        window.bannerRecordAnswer(false);
    }

    const attempts = state.currentQAttempts || 1;
    if (feedback) {
        feedback.style.display = 'block';
        feedback.className = 'feedback-area incorrect';
        feedback.innerHTML = (attempts >= 2)
            ? 'Not quite — try asking your teacher for help. Click <strong>Next →</strong> when ready.'
            : 'Not quite — check the red boxes and try again.';
    }
    if (card) {
        card.classList.add('incorrect-bg');
        setTimeout(() => card.classList.remove('incorrect-bg'), 700);
    }
    // Refocus first wrong cell.
    const firstWrongCell = cells.find(c => c.style.borderBottomColor && c.style.borderBottomColor.includes('rgb(198, 40, 40)'));
    if (firstWrongCell) {
        try { firstWrongCell.focus(); firstWrongCell.select && firstWrongCell.select(); } catch (_) {}
    } else {
        // fallback: focus first cell whose value doesn't match the first set
        const fallback = cells.find((c, i) => !valueMatches(userValues[i], compareSet[i]));
        if (fallback) {
            try { fallback.focus(); fallback.select && fallback.select(); } catch (_) {}
        }
    }
    state.hasAnswered = false;
}


// ===== REVIEW-MODE RE-SUBMIT (single-input path) =====
// Called from checkAnswer / submitAnswer when reviewing a past question.
// Used for the SIMPLE answer types (number, text, multiple-choice,
// fraction-input) that submit via the standard #answerInput pipeline.
// Complex widgets compute their own isCorrect and call applyReviewOutcome()
// directly from their submit handlers.
function _handleReviewSubmit(userAns, btnElement) {
    const idx = state._reviewingQIndex;
    const q = state.currentQ;
    if (!q || idx < 0) return;

    // Reuse the same correctness logic as checkAnswer, condensed.
    const type = q.answerType || (typeof q.ans === 'number' ? 'number' : 'text');
    let isCorrect = false;
    if (type === 'number') {
        const cleaned = String(userAns).replace(/,/g, '');
        const uv = Number(cleaned);
        isCorrect = !Number.isNaN(uv) && Number(uv.toFixed(3)) === Number(Number(q.ans).toFixed(3));
    } else if (isTimeSkill(state.skill)) {
        isCorrect = timeAnswersMatch(userAns, q.ans, state.skill);
    } else if (isFractionSkill(state.skill) || q.answerType === 'fraction-input') {
        if (q.noSimplify) {
            isCorrect = String(userAns).replace(/\s+/g, '') === String(q.ans).replace(/\s+/g, '');
        } else {
            isCorrect = fractionAnswersMatch(userAns, q.ans);
        }
    } else if (isQuotientRemainderQuestion(q)) {
        isCorrect = quotientRemainderMatches(userAns, q);
    } else {
        isCorrect = normalizeText(userAns) === normalizeText(q.ans);
    }

    applyReviewOutcome(isCorrect, userAns, btnElement);
}
