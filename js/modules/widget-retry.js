// widget-retry.js — shared "in-place correction" UX helper for multi-place
// interactive widgets (shape-match, categorize, ordering, expanded form,
// multi-select, drag-fill, coord-plot, place-symmetry-lines, area-model,
// number-family, fact-family, tchart-drag, divisibility-sort, shade-parts,
// pv-build).
//
// Intent:
//   - Submit paints per-placement red/green and KEEPS the widget interactive.
//   - The FIRST submit determines correctness for scoring/streak/MAP/badges.
//   - Subsequent submits do NOT alter scoring — they only repaint and gate the
//     "advance" pipeline, which fires when ALL placements become correct.
//   - MAP test/simulation mode is unchanged: first submit locks AND advances.
//
// The helper is intentionally tiny — each widget integration calls
// `firstAttemptScore(...)` once on the first submit (no-op on later submits)
// and `runOnAllCorrect(...)` only when every placement is correct.

import { state } from './state.js';

// MAP test/simulation: one-shot scoring + immediate advance, no in-place
// correction. Practice (regular practice / boss / race / MAP practice / MAP
// worksheet) gets the new in-place correction UX.
export function isMapTestMode() {
    return state.mapMode === true && state.mapSessionMode === 'simulation';
}

// Returns true if THIS submit is the first attempt for the current question.
// Multi-place widgets that allow re-submission must use this to gate the
// scoring/streak/MAP-record side effects (so only the first attempt counts).
export function isFirstAttempt() {
    const q = state.currentQ;
    if (!q) return true;
    return !(q._retryFirstSubmitDone === true);
}

// Mark the first submit as done. Call this on EVERY submit handler entry —
// it's idempotent (a no-op on the 2nd+ submit). Returns the first-attempt
// correctness so callers can use it as the canonical scored verdict.
export function markFirstAttempt(correctNow) {
    const q = state.currentQ;
    if (!q) return correctNow;
    if (q._retryFirstSubmitDone === true) {
        return q._retryFirstAttemptCorrect === true;
    }
    q._retryFirstSubmitDone = true;
    q._retryFirstAttemptCorrect = !!correctNow;
    return q._retryFirstAttemptCorrect;
}

// Returns the cached first-attempt verdict (for telemetry / dashboard).
export function getFirstAttemptCorrect() {
    const q = state.currentQ;
    if (!q) return null;
    if (q._retryFirstSubmitDone !== true) return null;
    return !!q._retryFirstAttemptCorrect;
}

// Reset the per-question retry state. The renderer pipeline calls this when a
// new question is mounted (we hook generateQuestion via a tiny patch in
// init.js, or each widget integration sets the flags via markFirstAttempt).
// Renderers can also call this defensively before mount.
export function resetRetryState() {
    const q = state.currentQ;
    if (!q) return;
    q._retryFirstSubmitDone = false;
    q._retryFirstAttemptCorrect = false;
    q._retryAllCorrectFired = false;
}

// Has the "all correct" advance pipeline already fired for this question?
// Prevents double-firing confetti / advance / XP if the student keeps
// re-submitting after solving.
export function hasAllCorrectFired() {
    const q = state.currentQ;
    return !!(q && q._retryAllCorrectFired === true);
}

// Mark the all-correct pipeline as fired so subsequent submits no-op.
export function markAllCorrectFired() {
    const q = state.currentQ;
    if (!q) return;
    q._retryAllCorrectFired = true;
}

// Build the "X correct, Y to fix" inline message (used when a student
// re-submits with at least one wrong placement). `total` is the total number
// of scored placements; `wrong` is how many are still wrong.
export function buildRetryMessage(total, wrong) {
    const ok = Math.max(0, (total | 0) - (wrong | 0));
    if (wrong <= 0) return '';
    if (ok <= 0) return `Not quite — ${wrong} to fix. Try again!`;
    return `${ok} correct, ${wrong} to fix — try again!`;
}
