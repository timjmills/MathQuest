// skip-rule.js — Skip is a PER-SKILL teacher option (Wave 1 item 1.3; owner 2026-10-02).
// The skill's `skipAfter` option (skill-options.js; default 5, 0 = Skip off) is the number of wrong
// tries the pupil makes on the current question before the Skip button appears. The option travels
// with the skill (share codes, quizzes, worksheets); there is no teacher-wide setting.
import { state } from './state.js';
import { getSetOptions } from './skill-option-store.js';

export const SKIP_DEFAULT_TRIES = 5;

/** Wrong tries before Skip appears for this question's skill; 0 means Skip is off. */
export function skipAfterFor(q) {
    // The teacher's set wins for this item's own skill (lf-hosts skip: a mixed online worksheet deals its items with the
    // pool host's universal defaults, so the teacher's "Skip off" (skipAfter 0) on the skill never reached its cards).
    if (q && q.categoryId && q.skillId) {
        const set = getSetOptions(q.categoryId, q.skillId);
        if (set && set.skipAfter != null && Number.isFinite(Number(set.skipAfter))) return Math.max(0, Math.round(Number(set.skipAfter)));
    }
    const o = (q && q.skillOptions) || state.skillOptions || null;
    const n = o ? Number(o.skipAfter) : NaN;
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : SKIP_DEFAULT_TRIES;
}

/** The skill's `calculator` option for this question: on only when the teacher turned it on. */
export function calcAllowedFor(q) {
    const o = (q && q.skillOptions) || state.skillOptions || null;
    return !!o && o.calculator === true;
}

// ---- The SKIP button on every student mode (owner request via lf-hosts, 2026-11-19) ----
// On the practice card and in the MAP test, Skip shows from the first moment of every question
// (no wrong tries needed). It moves on without marking the item wrong; at the end of the run every
// skipped item comes back, the SAME item, one at a time ("You skipped 3. Let's fix them."), and is
// answered and scored then; a second skip leaves it "skipped" in the teacher's results.
//   practice card : on unless the skill's skipAfter option is 0 (the teacher's per-skill off)
//   MAP test      : state.mapSkipAllowed (the MAP setup's "Pupils can skip", default on; ?map=...-S0 = off)
//   quiz          : quiz-take.js reads test.settings.allowSkip (default on) and reuses the Flag
//   worksheet     : worksheet.js, the per-card Skip (default on unless skipAfter is 0)
//   boss / race   : NOT the always-on Skip (the clock decides the game; a return pass after the game
//                   is won or lost cannot change it), only the old escape hatch after skipAfter wrong tries.

/** The always-on Skip applies to this host (practice card / MAP test) and the teacher left it on. */
export function skipAlwaysOn(q = state.currentQ) {
    if (state.mapMode === true) return state.mapSkipAllowed !== false;
    if (state.gameMode === 'practice' && !state.quizMode) return skipAfterFor(q) !== 0;
    return false;
}

/** Skip may be used now: always-on hosts while the item is open; boss / race after enough wrong tries. */
export function isSkipAvailable() {
    const q = state.currentQ;
    if (!q) return false;
    if (state.mapMode === true || (state.gameMode === 'practice' && !state.quizMode)) {
        return skipAlwaysOn(q) && !(state.hasAnswered && state.lastAnswerCorrect);
    }
    const n = skipAfterFor(q);
    return n > 0 && (state.currentQAttempts || 0) >= n;
}

/** The count line the pupil sees beside the button. */
export function skipCountText(n) { return `Skipped: ${n}`; }
/** The message that opens the return pass. */
export function skipReturnMessage(n) { return `You skipped ${n}. Let's fix them.`; }

/** Show or hide the single Skip button (#skipQuestionBtn) from the rule above, and the count beside it. */
export function updateSkipButton() {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('skipQuestionBtn');
    if (!btn) return;
    btn.style.display = (state.gameMode !== 'worksheet' || state.mapMode === true) && isSkipAvailable() ? 'inline-flex' : 'none';
    updateSkipCount();
}

/** "Skipped: n" beside the button: the items skipped and not yet answered in this run. */
export function updateSkipCount() {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('skipCountPill');
    if (!el) return;
    let n = 0;
    if (state.mapMode === true) n = (state.mapHistory || []).filter((h) => h && h.skipped).length;
    else if (['practice', 'boss', 'race'].includes(state.gameMode)) n = (state.questionHistory || []).filter((h) => h && (h === 'skipped' || h.status === 'skipped')).length;
    el.textContent = skipCountText(n);
    el.style.display = n > 0 ? 'inline-flex' : 'none';
}

/** The return-pass intro: a calm panel with the message and one 48 px button. Resolves on the tap. */
export function showSkipReturnIntro(n, host, onGo) {
    if (typeof document === 'undefined') { onGo(); return; }
    let el = document.getElementById('skipReturnIntro');
    if (el) el.remove();
    el = document.createElement('div');
    el.id = 'skipReturnIntro';
    el.className = 'mq-skipret';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'skipReturnMsg');
    el.dataset.host = host;
    el.innerHTML = `<div class="mq-skipret-card"><p class="mq-skipret-msg" id="skipReturnMsg">${skipReturnMessage(n)}</p>`
        + `<button type="button" class="btn btn-primary mq-skipret-go" id="skipReturnGo">Let's go ▶</button></div>`;
    document.body.appendChild(el);
    const go = el.querySelector('#skipReturnGo');
    go.addEventListener('click', () => { el.remove(); onGo(); });
    try { go.focus(); } catch (_) { /* non-fatal */ }
}
