// Worked-example preview ("Show me how") — fires once per skill per session before the
// student's first attempt. Shows a sample problem + step-by-step solution with a
// "Got it, let me try!" CTA to dismiss.
//
// The example is a SIBLING of the live question (same skill and options, a different
// problem), so the preview never gives away the answer the pupil is about to type. Its steps
// come from the skill's real provider (sheet/providers/*, `workedSteps`) when one exists, so a
// fact like 6 + 2 is taught as a fact ("Start with 6. Count on 2."), not as a column sum
// ("Line up by place value"). Skills without a provider fall back to the generic solution
// generator, minus its column script for single-digit problems.
//
// Teacher-launched sessions (body.teacher-mode) never open it by themselves (game-control.js);
// the teacher opens it from "Show me how", and it wears the calm teacher style.

import { state } from './state.js';
import { getProvider } from './sheet/index.js';

const _shownThisSession = new Set();

export function shouldShowPreview(skillId) {
    if (!skillId) return false;
    if (_shownThisSession.has(skillId)) return false;
    return true;
}

export function markPreviewShown(skillId) {
    if (skillId) _shownThisSession.add(skillId);
}

export function clearPreviewShown() {
    _shownThisSession.clear();
}

const esc = (s) => String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const ansOf = (q) => {
    if (!q || q.ans === undefined || q.ans === null) return '';
    if (Array.isArray(q.ans)) return q.ans.join(', ');
    if (typeof q.ans === 'object') return Object.values(q.ans).join(', ');
    return String(q.ans);
};

/** Where the live question came from: its own skill, not the mixed pool it was drawn from. */
function skillOf(skillId, q) {
    const skill = (q && (q.requestedSkillId || q.skillId)) || skillId || state.skill;
    const cat = (q && (q.poolMember || q.categoryId)) || state.category;
    return { cat, skill };
}

/**
 * A sibling of the live question: the same skill and options, a different problem. Seeded, so
 * the same skill shows the same example. Null when the skill cannot be regenerated.
 */
export function siblingExample(cat, skill, liveQ) {
    const gen = typeof window !== 'undefined' ? window.generateQuestionFor : null;
    if (typeof gen !== 'function' || !cat || !skill) return null;
    const liveText = plain(liveQ && liveQ.text);
    const liveAns = ansOf(liveQ);
    let fallback = null;
    for (let i = 1; i <= 12; i++) {
        let q = null;
        try { q = gen({ category: cat, skill, seed: 7919 * i + 31 }); } catch (e) { q = null; }
        if (!q) continue;
        if (plain(q.text) === liveText && plain(q.visual) === plain(liveQ && liveQ.visual)) continue;
        if (ansOf(q) !== liveAns) return q;
        if (!fallback) fallback = q;   // a tiny domain: a different problem with the same answer
    }
    return fallback;
}

/** The provider's authored steps for an example, as plain text lines ([] when it has none). */
function providerSteps(cat, skill, q) {
    try {
        const p = getProvider(cat || '', skill || '');
        if (!p || !Array.isArray(p.real) || !p.real.includes('workedSteps') || typeof p.workedSteps !== 'function') return [];
        const st = p.workedSteps(q);
        return (Array.isArray(st) ? st : []).map((s) => String((s && s.text) || '').trim()).filter(Boolean).slice(0, 6);
    } catch (e) { return []; }
}

/** The generic solution steps, without the column script for a problem of single digits. */
function genericSteps(q) {
    if (typeof window === 'undefined' || typeof window.generateSolutionSteps !== 'function') return [];
    let steps = [];
    try { steps = window.generateSolutionSteps(q) || []; } catch (e) { return []; }
    if (!Array.isArray(steps)) return [];
    const nums = (plain(q.text).match(/\d+(?:\.\d+)?/g) || []).map(Number);
    const allSingle = nums.length > 0 && nums.every((n) => n < 10);
    return steps.map(plain)
        .filter((t) => t && !/^Problem:/i.test(t))
        .filter((t) => !(allSingle && /place value|each column|right to left/i.test(t)))
        .map((t) => t.replace(/^Step \d+:\s*/i, ''))
        .slice(0, 4);
}

/** How the example problem is shown: its sentence, or its picture when the sentence is only "Add." */
function problemHtml(q) {
    const text = plain(q.text);
    if (/\d/.test(text) || !q.visual) return `<div class="mq-how-problem-text">${esc(text)}</div>`;
    const box = document.createElement('div');
    box.innerHTML = String(q.visual);
    box.querySelectorAll('input, textarea, select').forEach((el) => {
        const s = document.createElement('span');
        s.className = 'mq-how-slot';
        el.replaceWith(s);
    });
    box.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    box.querySelectorAll('button, [onclick]').forEach((el) => { el.removeAttribute('onclick'); el.setAttribute('tabindex', '-1'); });
    return `${text ? `<div class="mq-how-problem-text">${esc(text)}</div>` : ''}<div class="mq-how-visual">${box.innerHTML}</div>`;
}

// Render an inline preview card in front of the question.
// opts.force: opened on request ("Show me how"), not on the first question.
export function showWorkedPreview(skillId, sampleQuestion, opts = {}) {
    if (!sampleQuestion) return;
    markPreviewShown(skillId);
    closeWorkedPreview();
    const { cat, skill } = skillOf(skillId, sampleQuestion);
    const ex = siblingExample(cat, skill, sampleQuestion);
    const teacher = document.body.classList.contains('teacher-mode');
    const title = (typeof window !== 'undefined' && typeof window.plainSkillLabel === 'function' && window.plainSkillLabel(cat, skill))
        || sampleQuestion.skillLabel || 'New skill';

    let steps = [];
    if (ex) {
        steps = providerSteps(cat, skill, ex);
        if (steps.length < 2) steps = genericSteps(ex);
        if (!steps.length && ex.hint) steps = [plain(ex.hint)];
    }
    const exAns = ex ? ansOf(ex) : '';
    const saysAnswer = exAns && steps.some((t) => t.includes(exAns));

    const overlay = document.createElement('div');
    overlay.className = 'mq-worked-preview-overlay' + (teacher ? ' mq-how-teacher' : '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'mqWorkedTitle');

    if (teacher) {
        overlay.innerHTML = `
        <div class="mq-how-card">
            <div class="mq-how-eyebrow">Worked example</div>
            <h3 class="mq-how-title" id="mqWorkedTitle">${esc(title)}</h3>
            ${ex ? `<div class="mq-how-example">
                <div class="mq-how-problem">${problemHtml(ex)}</div>
                ${steps.length ? `<ol class="mq-how-steps">${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
                ${exAns && !saysAnswer ? `<div class="mq-how-answer">Answer: ${esc(exAns)}</div>` : ''}
            </div>` : `<p class="mq-how-none">There is no worked example for this skill yet.</p>`}
            <div class="mq-how-foot"><button type="button" class="mq-how-close" id="mqWorkedDismiss">Close</button></div>
        </div>`;
    } else {
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(43,40,64,0.55);display:flex;align-items:center;justify-content:center;z-index:10040;animation:mqOnbFadeIn 220ms ease;';
        const stepsHTML = steps.length
            ? `<ol style="margin:8px 0 4px 18px;padding:0;font-weight:700;color:var(--mq-ink-2);font-size:0.95rem;line-height:1.55;">${steps.map((s) => `<li style="margin:3px 0;">${esc(s)}</li>`).join('')}</ol>`
            : '';
        overlay.innerHTML = `
        <div class="mq-worked-preview-card" style="background:var(--mq-paper);border:2px solid var(--mq-rule);border-radius:22px;padding:24px 28px;max-width:520px;width:90%;box-shadow:0 6px 0 0 var(--mq-rule), 0 16px 40px rgba(0,0,0,0.18);">
            <div style="font-size:0.8rem;font-weight:800;color:var(--mq-purple);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:6px;">Show me how</div>
            <h3 id="mqWorkedTitle" style="font-size:1.3rem;font-weight:900;color:var(--mq-ink);letter-spacing:-0.01em;margin-bottom:10px;">${esc(title)}</h3>
            <div style="font-size:1rem;font-weight:700;color:var(--mq-ink-2);line-height:1.5;margin-bottom:12px;">Here's a worked example before you try:</div>
            ${ex ? `<div style="background:var(--mq-purple-soft);border:2px solid var(--mq-purple-l);border-radius:14px;padding:14px 16px;margin-bottom:16px;font-weight:700;color:var(--mq-ink);">
                <div style="font-size:0.78rem;font-weight:800;color:var(--mq-purple);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px;">Sample Problem</div>
                <div class="mq-how-problem" style="font-size:1.1rem;font-weight:900;margin-bottom:8px;">${problemHtml(ex)}</div>
                ${stepsHTML}
                ${exAns && !saysAnswer ? `<div style="margin-top:10px;font-size:1rem;font-weight:900;color:var(--mq-correct-ink, #1F6B4D);">Answer: ${esc(exAns)}</div>` : ''}
            </div>` : ''}
            <button class="btn btn-primary" id="mqWorkedDismiss" style="width:100%;padding:14px;">Got it, let me try!</button>
        </div>`;
    }
    document.body.appendChild(overlay);
    const dismiss = overlay.querySelector('#mqWorkedDismiss');
    dismiss.addEventListener('click', closeWorkedPreview);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeWorkedPreview(); });
    document.addEventListener('keydown', _onPreviewKeydown);
    // Focus moves into the dialog and comes back on close (the pupil's answer box, or the
    // teacher's "Show me how" button), so typing never lands behind the overlay.
    const _prev = document.activeElement;
    _returnFocus = _prev instanceof HTMLElement && _prev !== document.body ? _prev : null;
    try { dismiss.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
}

let _returnFocus = null;

function _onPreviewKeydown(e) {
    if (e.key === 'Escape') closeWorkedPreview();
}

// Remove every worked-preview overlay and its Escape listener. Called by the
// dismiss button, a backdrop click, Escape, and showView() on every view
// change, so the overlay never outlives the game it belongs to. Idempotent.
export function closeWorkedPreview() {
    if (typeof document === 'undefined') return;
    document.removeEventListener('keydown', _onPreviewKeydown);
    const had = document.querySelectorAll('.mq-worked-preview-overlay');
    had.forEach(el => el.remove());
    if (had.length && _returnFocus && document.contains(_returnFocus)) {
        try { _returnFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
    _returnFocus = null;
}

if (typeof window !== 'undefined') {
    window.shouldShowPreview = shouldShowPreview;
    window.markPreviewShown = markPreviewShown;
    window.clearPreviewShown = clearPreviewShown;
    window.showWorkedPreview = showWorkedPreview;
    window.closeWorkedPreview = closeWorkedPreview;
}
