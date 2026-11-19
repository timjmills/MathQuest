// student-options.js — the pupil's options sheet (design/student-opts/CARD.md, signed 2026-11-19).
//
// A pupil taps a Quick Start card or a selected chip: this sheet opens beside it (a popover at 1024 px and wider, a bottom
// sheet below). It names the skill, keeps its options FOLDED under one "Change how it works" row whose summary says what is
// chosen, and offers "Play this skill" and "Play all selected (N)" under "You will play N skills".
//
// Only the pupil subset of the skill's options is shown (pupilOptionsFor, skill-options.js: how hard the problems are, never
// a layout, print, play or support option). The controls are the options panel's own (optionControlHTML) through a
// 'pupil' host, so every change goes to the set's option store (skill-option-store.js), the one place play reads them.
// Options a teacher fixed through a link (a Quick Start card with linkOpts) are shown locked: "Set by your teacher".
//
// Loaded on the first tap (js/globals.js makeLazy), so the pupil home's startup is unchanged.

import { pupilOptionsFor, normalizeOptions, describeOptions } from './skill-options.js';
import { optionControlHTML, nameFitOptions, registerSkillOptionsHost, escHTML, revealOverflowingChoices } from './skill-options-ui.js';
import { getSetOptions, setSetOptions } from './skill-option-store.js';
import { getSkillGrade, gradeCircleHTML } from './data.js';
import { qsPupilName } from './quick-skills.js';
import { UnifiedSkills, playSelectedSkills } from './unified-skills.js';

const COLOR = '#6d28d9';
const WIDE = 1024;      // a popover at this width and wider, a bottom sheet below (card §3)
let _sheet = null;      // { categoryId, skillId, key, kind: 'card' | 'chip', rect, open }

const keyOf = (c, s) => `${c}:${s}`;

/** The options a teacher fixed through a link for this skill: {optionId: value} (card §4: shown, locked). */
function lockedFor(categoryId, skillId) {
    const card = (window.customQuickSkills || []).find((x) => x.categoryId === categoryId && x.skillId === skillId);
    if (!card || !card.opts || !(card.linkOpts || card.source === 'link')) return {};
    const full = normalizeOptions(categoryId, skillId, card.opts);
    return Object.fromEntries(Object.keys(card.opts).filter((id) => id in full).map((id) => [id, full[id]]));
}

function pupilDefs(categoryId, skillId) {
    try { return nameFitOptions(categoryId, skillId, pupilOptionsFor(categoryId, skillId)); } catch (e) { return []; }
}

/** What is chosen, in plain words, over the pupil options only ("Standard" at the defaults). */
function summaryOf(categoryId, skillId, defs) {
    const set = getSetOptions(categoryId, skillId);
    const ids = new Set(defs.map((d) => d.id));
    const mine = Object.fromEntries(Object.entries(set).filter(([id]) => ids.has(id)));
    return Object.keys(mine).length ? (describeOptions(categoryId, skillId, mine) || 'Standard') : 'Standard';
}

registerSkillOptionsHost('pupil', {
    entry: () => (_sheet ? { categoryId: _sheet.categoryId, skillId: _sheet.skillId } : null),
    read: () => (_sheet ? getSetOptions(_sheet.categoryId, _sheet.skillId) : {}),
    // a locked (teacher-link) value always stays as the teacher set it
    write: (i, packed) => { if (_sheet) { setSetOptions(_sheet.categoryId, _sheet.skillId, { ...packed, ...lockedFor(_sheet.categoryId, _sheet.skillId) }); chipsNow(); } },
    rerender: () => render(),
});

// the selected chips carry each skill's options in a line under its name: redraw them after a change here
function chipsNow() { if (typeof window.updateStudentSkillsDisplay === 'function') { try { window.updateStudentSkillsDisplay(); } catch (e) { /* */ } } }

const handlers = {
    set: (optId, expr) => `skoEdit('pupil',0,'set','${optId}',${expr})`,
    toggle: (optId, i) => `skoEdit('pupil',0,'toggle','${optId}',${i})`,
    all: (optId, all) => `skoEdit('pupil',0,'all','${optId}',${all})`,
};

function rowsHTML(categoryId, skillId, defs) {
    const cur = normalizeOptions(categoryId, skillId, getSetOptions(categoryId, skillId));
    const locked = lockedFor(categoryId, skillId);
    return defs.filter((d) => !(typeof d.appliesTo === 'function' && !d.appliesTo(cur))).map((d) => {
        const lock = d.id in locked;
        const def = lock ? { ...d, lockedBy: () => ({ v: locked[d.id], why: 'Set by your teacher' }) } : d;
        return `<div class="so-row" data-so-opt="${escHTML(d.id)}"${lock ? ' data-so-locked' : ''} role="group" aria-label="${escHTML(d.label || d.id)}">${optionControlHTML(def, cur, COLOR, handlers)}</div>`;
    }).join('');
}

function place(el) {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (vw < WIDE || !_sheet.rect) { el.classList.add('so-bottom'); el.style.cssText = ''; return; }
    el.classList.remove('so-bottom');
    const r = _sheet.rect;
    const w = Math.min(440, vw - 24);
    el.style.cssText = `width:${w}px;left:0;top:0;max-height:${vh - 24}px;`;
    const h = Math.min(el.offsetHeight, vh - 24);
    const left = Math.max(12, Math.min(vw - w - 12, r.left));
    let top = r.bottom + 8;
    if (top + h > vh - 12) top = r.top - 8 - h;           // above the card
    if (top < 12) top = Math.max(12, vh - 12 - h);        // or pinned to the bottom edge
    el.style.left = Math.round(left) + 'px';
    el.style.top = Math.round(top) + 'px';
}

function render() {
    if (!_sheet) return;
    let el = document.getElementById('studentOptsSheet');
    if (!el) {
        el = document.createElement('div');
        el.id = 'studentOptsSheet';
        el.className = 'so-sheet';
        el.setAttribute('role', 'dialog');
        document.body.appendChild(el);
    }
    const { categoryId, skillId } = _sheet;
    const queued = (window.skillQueue || []).find((s) => s.categoryId === categoryId && s.skillId === skillId);
    const name = qsPupilName(queued || (window.customQuickSkills || []).find((x) => x.categoryId === categoryId && x.skillId === skillId) || { categoryId, skillId, skillLabel: skillId });
    const n = (window.skillQueue || []).length;
    const defs = pupilDefs(categoryId, skillId);
    el.setAttribute('aria-label', `${name}: options`);
    const fold = defs.length
        ? `<details class="so-more"${_sheet.open ? ' open' : ''} ontoggle="studentOptsFold(this.open)">
                <summary><span class="so-more-title"><span aria-hidden="true">&#9662;</span> Change how it works</span><span class="so-more-vals">${escHTML(summaryOf(categoryId, skillId, defs))}</span></summary>
                <div class="so-rows">${rowsHTML(categoryId, skillId, defs)}</div>
                <button type="button" class="so-reset" onclick="studentOptsReset()">Back to standard</button>
            </details>`
        : '<p class="so-none">This skill has no settings to change.</p>';
    el.innerHTML = `<div class="so-head">${gradeCircleHTML(getSkillGrade(skillId, categoryId))}<span class="so-name">${escHTML(name)}</span>
            <button type="button" class="so-x" onclick="closeStudentOptions()" aria-label="Close">&times;</button></div>
        ${fold}
        <p class="so-count" data-so-count aria-live="polite">You will play ${n} skill${n === 1 ? '' : 's'}</p>
        <div class="so-play">
            <button type="button" class="so-btn so-btn-main" data-so-play="one" onclick="studentOptsPlay('one')">&#9654; Play this skill</button>
            ${n > 1 ? `<button type="button" class="so-btn" data-so-play="all" onclick="studentOptsPlay('all')">Play all selected (${n})</button>` : ''}
        </div>`;
    el.hidden = false;
    place(el);
    revealOverflowingChoices(el);
}

function onKey(e) {
    if (!_sheet || e.key !== 'Escape') return;
    e.preventDefault(); e.stopPropagation();
    closeStudentOptions();
}
function onOutside(e) {
    const el = document.getElementById('studentOptsSheet');
    if (!_sheet || !el || el.contains(e.target)) return;
    const t = e.target && e.target.closest ? e.target.closest('[data-so-key]') : null;
    if (t && t.getAttribute('data-so-key') === _sheet.key) return;   // its own card / chip: that tap re-opens it
    closeStudentOptions({ focus: false });
}

/**
 * Open the sheet for one selected skill beside the card or chip that was tapped.
 * @param {string} categoryId @param {string} skillId @param {Element} [anchor] the tapped card or chip
 */
export function openStudentOptions(categoryId, skillId, anchor) {
    if (!categoryId || !skillId) return;
    const kind = anchor && anchor.closest && anchor.closest('#studentSkillsList') ? 'chip' : 'card';
    // the grid or chip row may have redrawn since the tap (this module loads on the first one): use the redrawn twin
    if (anchor && !anchor.isConnected) anchor = document.querySelector(`${kind === 'chip' ? '#studentSkillsList' : '#quickSkillsGrid'} [data-so-key="${CSS.escape(keyOf(categoryId, skillId))}"]`) || null;
    if (anchor && kind === 'chip' && !anchor.classList.contains('sel-chip')) anchor = anchor.closest('.sel-chip') || anchor;
    const rect = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : null;
    _sheet = { categoryId, skillId, key: keyOf(categoryId, skillId), kind, rect, open: false };
    render();
    const el = document.getElementById('studentOptsSheet');
    const first = el && (el.querySelector('details.so-more > summary') || el.querySelector('[data-so-play="one"]'));
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) { /* */ } }
    window.removeEventListener('keydown', onKey, true);
    window.addEventListener('keydown', onKey, true);
    setTimeout(() => { if (_sheet) document.addEventListener('pointerdown', onOutside, true); }, 0);
}

/** Close the sheet; focus goes back to the card or chip it was opened from (Esc, ✕, a Play button). */
export function closeStudentOptions({ focus = true } = {}) {
    const was = _sheet;
    _sheet = null;
    const el = document.getElementById('studentOptsSheet');
    if (el) el.remove();
    window.removeEventListener('keydown', onKey, true);
    document.removeEventListener('pointerdown', onOutside, true);
    if (!was || !focus) return;
    const scope = was.kind === 'chip' ? '#studentSkillsList' : '#quickSkillsGrid';
    const back = document.querySelector(`${scope} [data-so-key="${CSS.escape(was.key)}"]`) || document.querySelector(`[data-so-key="${CSS.escape(was.key)}"]`);
    if (back) { try { back.focus({ preventScroll: true }); } catch (e) { /* */ } }
}

/** Remembers whether "Change how it works" is open, so a redraw after a change keeps it open. */
export function studentOptsFold(open) {
    if (!_sheet) return;
    _sheet.open = !!open;
    const el = document.getElementById('studentOptsSheet');
    if (el) place(el);   // the opened fold is taller: keep the whole sheet inside the window
}

/** "Back to standard": the skill's defaults (a teacher-link value stays). */
export function studentOptsReset() {
    if (!_sheet) return;
    setSetOptions(_sheet.categoryId, _sheet.skillId, lockedFor(_sheet.categoryId, _sheet.skillId));
    chipsNow();
    render();
}

/** "Play this skill" (just this one, the selection is kept) or "Play all selected" (each with its own options). */
export function studentOptsPlay(which) {
    if (!_sheet) return;
    const { categoryId, skillId } = _sheet;
    closeStudentOptions({ focus: false });
    if (!UnifiedSkills.has(skillId, categoryId)) return;
    if (which === 'one') playSelectedSkills('practice', { only: [{ categoryId, skillId }] });
    else playSelectedSkills('practice');
}

/** For the gate: what the sheet is showing. */
export function studentOptsState() {
    return _sheet ? { categoryId: _sheet.categoryId, skillId: _sheet.skillId, open: _sheet.open, kind: _sheet.kind } : null;
}
