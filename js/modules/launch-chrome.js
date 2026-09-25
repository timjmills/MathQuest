// launch-chrome.js — the pupil play views when a TEACHER launches them.
//
// The owner's rule (TEACHER-SCREENS-AUDIT-R2 items 2-4): the teacher side looks calm and
// professional; the pupil side stays as it is. A play view counts as teacher-launched when
// body.teacher-mode is set (Run practice, MAP tests, the board window). Everything here is a
// no-op for a pupil: labels are swapped only in teacher mode and restored otherwise, and the
// board stage only exists while body.tv-bigboard is set (teacher-shell's Board display).
//
// Styling lives in css/play-teacher.css (additive, scoped to body.teacher-mode).
//
//   isTeacherLaunch()        is the current play view teacher-launched?
//   plainSkillLabel(c, s)    a skill's full label with no emoji ("Add within 20 (No Regrouping)")
//   syncPlayChrome()         plain-word labels on the game / worksheet / MAP controls (teacher),
//                            the pupil labels otherwise; adds the opt-in "Show me how" button
//   syncBoard()              redraw the Board display stage for the current question
//
// Layer 3 (state, data only). Cross-module calls go through window, like the rest of the app.

import { state } from './state.js';
import { SKILLS } from './data.js';

export function isTeacherLaunch() {
    return typeof document !== 'undefined' && !!document.body && document.body.classList.contains('teacher-mode');
}

const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;
const clean = (s) => String(s || '').replace(EMOJI_RE, '').replace(/^[\s½]+(?=\S)/, '').replace(/\s+/g, ' ').trim();

/** A skill's full label with no emoji, from SKILLS; '' when the skill is unknown. */
export function plainSkillLabel(categoryId, skillId) {
    if (!skillId) return '';
    const inCat = (cat) => (SKILLS[cat] || []).find((s) => s && s.v === skillId);
    let hit = categoryId ? inCat(categoryId) : null;
    if (!hit) {
        for (const cat of Object.keys(SKILLS)) { hit = inCat(cat); if (hit) break; }
    }
    return hit ? clean(hit.l) : '';
}

const esc = (s) => String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ============================================================== plain labels */

// [selector, teacher label]. The pupil label is whatever the markup holds; it is kept on the
// element (data-mq-pupil) the first time it is swapped, and put back for a pupil.
const LABELS = [
    ['#gameView .game-header button[onclick="exitGame()"]', 'Exit'],
    ['#hintBtn', 'Hint'],
    ['#ttsBtn', 'Read aloud'],
    ['#calcBtn', 'Calculator'],
    ['#solutionBtn', 'Show solution'],
    ['#skipQuestionBtn', 'Skip'],
    ['#qcCheckBtn', 'Check'],
    ['#nextBtn', 'Next question'],
    ['#worksheetView .game-header button[onclick="exitGame()"]', 'Back'],
    ['#worksheetView .game-header button[onclick="checkAllWorksheet()"]', 'Check answers'],
    ['#worksheetView .game-header button[onclick="newWorksheet()"]', 'New sheet'],
    ['#worksheetUnlimitedControls button[onclick="addMoreProblems()"]', 'Ten more problems'],
    ['#worksheetUnlimitedControls button[onclick="finishUnlimitedWorksheet()"]', 'Finish'],
];

/** Plain-word labels on the play controls for a teacher; the pupil labels otherwise. */
export function syncPlayChrome() {
    if (typeof document === 'undefined') return;
    const teacher = isTeacherLaunch();
    for (const [sel, label] of LABELS) {
        document.querySelectorAll(sel).forEach((el) => {
            if (teacher) {
                if (el.dataset.mqPupil === undefined) el.dataset.mqPupil = el.innerHTML;
                if (el.textContent !== label) el.textContent = label;
            } else if (el.dataset.mqPupil !== undefined) {
                el.innerHTML = el.dataset.mqPupil;
                delete el.dataset.mqPupil;
            }
        });
    }
    // The teacher just pressed "Open on this screen": the pupil start banner ("Starting Practice
    // with 3 skills!", unified-skills.js) only repeats it, in green, over the answer row.
    if (teacher) {
        document.querySelectorAll('body > div:not([class]):not([id])').forEach((el) => {
            if (/Starting (Practice|Boss Battle|Car Race|Worksheet) with/.test(el.textContent || '')) el.remove();
        });
    }
    // "Show me how" is opt-in for a teacher (it never opens by itself on the board).
    const actions = document.querySelector('#questionCard .mq-qactions');
    let how = document.getElementById('tvHowBtn');
    if (teacher && actions && !how) {
        how = document.createElement('button');
        how.type = 'button';
        how.id = 'tvHowBtn';
        how.className = 'btn btn-sm btn-secondary';
        how.textContent = 'Show me how';
        how.title = 'A worked example of this skill (a different problem)';
        how.addEventListener('click', openHowForCurrent);
        const hint = document.getElementById('hintBtn');
        actions.insertBefore(how, hint ? hint.nextSibling : actions.firstChild);
    } else if (!teacher && how) {
        how.remove();
    }
    if (how && teacher) how.hidden = !!state.mapMode;
}

function openHowForCurrent() {
    if (typeof window.showWorkedPreview !== 'function' || !state.currentQ) return;
    try { window.showWorkedPreview(state.skill, state.currentQ, { force: true }); } catch (e) { /* non-fatal */ }
}

/* ============================================================== Board display */
// One large question at a time for the whole class, as the Run screen's preview draws it:
// a dark frame, "Question N" and "Whole class" chips, the question in a big white paper cell,
// and teacher controls under it (Show me how · Show answer · Next question). No pupil tools,
// no score, no timer, no toasts. The answer appears only when the teacher clicks.

const isBoard = () => typeof document !== 'undefined' && document.body.classList.contains('tv-bigboard')
    && !!document.getElementById('gameView')?.classList.contains('active');

let boardOn = false;
let revealed = false;

function totalQuestions() {
    const m = state.mixedModeSettings;
    return m && m.totalProblemsEnabled && Number(m.totalProblems) > 0 ? Number(m.totalProblems) : 0;
}

function answerText(q) {
    if (!q) return '';
    const a = q.displayAnswer !== undefined ? q.displayAnswer : q.ans;
    if (a === undefined || a === null) return '';
    if (Array.isArray(a)) return a.join(', ');
    if (typeof a === 'object') return Object.values(a).join(', ');
    return String(a);
}

function ensureBoard() {
    const gv = document.getElementById('gameView');
    if (!gv) return null;
    let bar = document.getElementById('tvBoardBar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'tvBoardBar';
        bar.className = 'tvb-bar';
        bar.innerHTML = `<span class="tvb-chip" id="tvBoardNum">Question 1</span>
<span class="tvb-title" id="tvBoardTitle"></span>
<span class="tvb-chip">Whole class</span>
<button type="button" class="tvb-btn tvb-btn-quiet" data-tvb="exit">Exit</button>`;
        gv.insertBefore(bar, gv.firstChild);
    }
    let ctl = document.getElementById('tvBoardCtl');
    if (!ctl) {
        ctl = document.createElement('div');
        ctl.id = 'tvBoardCtl';
        ctl.className = 'tvb-ctl';
        ctl.innerHTML = `<div class="tvb-answer" id="tvBoardAnswer" aria-live="polite" hidden></div>
<div class="tvb-row">
  <button type="button" class="tvb-btn tvb-btn-quiet" data-tvb="how">Show me how</button>
  <span class="tvb-grow"></span>
  <button type="button" class="tvb-btn" data-tvb="reveal" aria-controls="tvBoardAnswer">Show answer</button>
  <button type="button" class="tvb-btn tvb-btn-primary" data-tvb="next">Next question</button>
</div>`;
        gv.appendChild(ctl);
    }
    if (!gv.dataset.tvbWired) {
        gv.dataset.tvbWired = '1';
        gv.addEventListener('click', (e) => {
            const b = e.target.closest('[data-tvb]');
            if (!b || !isBoard()) return;
            const act = b.dataset.tvb;
            if (act === 'reveal') reveal(!revealed);
            else if (act === 'next') boardNext();
            else if (act === 'how') openHowForCurrent();
            else if (act === 'exit') window.exitGame && window.exitGame();
        });
    }
    return gv;
}

function reveal(on) {
    revealed = !!on;
    const box = document.getElementById('tvBoardAnswer');
    const btn = document.querySelector('[data-tvb="reveal"]');
    if (box) {
        box.hidden = !revealed;
        box.innerHTML = revealed ? `<span class="tvb-answer-l">Answer</span> <span class="tvb-answer-v">${esc(answerText(state.currentQ))}</span>` : '';
    }
    if (btn) { btn.textContent = revealed ? 'Hide answer' : 'Show answer'; btn.setAttribute('aria-expanded', String(revealed)); }
}

function boardNext() {
    const total = totalQuestions();
    if (total && state.qCount >= total) {
        const box = document.getElementById('tvBoardAnswer');
        if (box) { box.hidden = false; box.innerHTML = `<span class="tvb-answer-l">That was the last question.</span>`; }
        const nx = document.querySelector('[data-tvb="next"]');
        if (nx) { nx.textContent = 'Finish'; nx.dataset.tvb = 'exit'; }
        return;
    }
    // The board has no pupil answer: let the game move on without one.
    state.lastAnswerCorrect = true;
    state.hasAnswered = true;
    if (typeof window.nextQuestion === 'function') window.nextQuestion();
}

function quietGameClocks() {
    // No countdown, no "off task" nudge on the board: the class answers aloud.
    if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
    if (typeof window.clearQuestionTimer === 'function') { try { window.clearQuestionTimer(); } catch (e) { /* ignore */ } }
}

/** Redraw the board stage for the current question (called after every question renders). */
export function syncBoard() {
    if (!isBoard()) return;
    ensureBoard();
    boardOn = true;
    quietGameClocks();
    reveal(false);
    const total = totalQuestions();
    const num = document.getElementById('tvBoardNum');
    if (num) num.textContent = total ? `Question ${state.qCount} of ${total}` : `Question ${state.qCount}`;
    const nx = document.querySelector('#tvBoardCtl [data-tvb="exit"]');
    if (nx) { nx.dataset.tvb = 'next'; nx.textContent = 'Next question'; }
    const setTitle = () => {
        const t = document.getElementById('tvBoardTitle');
        const src = document.getElementById('gameTopicDisplay');
        if (t && src) t.textContent = src.textContent || '';
    };
    setTitle();
    setTimeout(setTitle, 350);
    // The render focuses the pupil's answer box; on the board nobody types there.
    const unfocus = () => {
        const ae = document.activeElement;
        if (ae && ae.closest && ae.closest('#questionCard') && isBoard()) ae.blur();
    };
    unfocus();
    setTimeout(unfocus, 120);
}

function leaveBoard() {
    boardOn = false;
    revealed = false;
    document.getElementById('tvBoardBar')?.remove();
    document.getElementById('tvBoardCtl')?.remove();
}

let watching = false;
/** Watch for Board display starting and ending (teacher-shell toggles body.tv-bigboard). */
export function watchBoard() {
    if (watching || typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
    watching = true;
    const check = () => {
        if (isBoard()) { if (!boardOn) syncBoard(); } else if (boardOn || document.getElementById('tvBoardBar')) leaveBoard();
    };
    new MutationObserver(check).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const gv = document.getElementById('gameView');
    if (gv) new MutationObserver(check).observe(gv, { attributes: true, attributeFilter: ['class'] });
}

if (typeof window !== 'undefined') {
    window.plainSkillLabel = plainSkillLabel;
    window.syncPlayChrome = syncPlayChrome;
    window.syncBoard = syncBoard;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchBoard);
    else watchBoard();
}
