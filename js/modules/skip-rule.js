// skip-rule.js — Skip is a PER-SKILL teacher option (Wave 1 item 1.3; owner 2026-10-02).
// The skill's `skipAfter` option (skill-options.js; default 5, 0 = Skip off) is the number of wrong
// tries the pupil makes on the current question before the Skip button appears. The option travels
// with the skill (share codes, quizzes, worksheets); there is no teacher-wide setting.
import { state } from './state.js';

export const SKIP_DEFAULT_TRIES = 5;

/** Wrong tries before Skip appears for this question's skill; 0 means Skip is off. */
export function skipAfterFor(q) {
    const o = (q && q.skillOptions) || state.skillOptions || null;
    const n = o ? Number(o.skipAfter) : NaN;
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : SKIP_DEFAULT_TRIES;
}

/** The skill's `calculator` option for this question: on only when the teacher turned it on. */
export function calcAllowedFor(q) {
    const o = (q && q.skillOptions) || state.skillOptions || null;
    return !!o && o.calculator === true;
}

/** Skip may be used now: the skill allows it and the pupil has made enough wrong tries. */
export function isSkipAvailable() {
    const n = skipAfterFor(state.currentQ);
    return n > 0 && (state.currentQAttempts || 0) >= n;
}

/** Show or hide the single Skip button (#skipQuestionBtn) from the rule above. */
export function updateSkipButton() {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('skipQuestionBtn');
    if (!btn) return;
    btn.style.display = (state.gameMode !== 'worksheet' && isSkipAvailable()) ? 'inline-block' : 'none';
}
