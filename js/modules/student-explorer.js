// student-explorer.js — the pupil's skill explorer (owner, 2026-11-05: "On the student side I also want a skill
// explorer by grade or by domain — we used to have one similarly — so kids can pick the skills as well to
// play/print/send/add to quick start").
//
// It brings back, in a simple pupil form, what the Skills Navigator (skills-organizer.js) and the domain / category
// dropdowns (category-dropdowns.js) gave pupils before they became teacher-only: browse every live skill By grade
// (K, 1-6, Mixed) or By area (the DOMAINS and their categories), tap a card to select it. The selection IS the app's
// selection (UnifiedSkills / window.skillQueue), so the home's bottom row (Add to Quick Start · Play · Send · Print)
// acts on it. Search uses skill-finder.js, the one thesaurus search every box shares (never labels only).
//
// It reads only the startup data (DOMAINS, visibleSkills — tombstones out — getSkillGrade, GRADE_COLORS), loads on the
// first press of "Explore skills" (js/globals.js makeLazy), and its stylesheet loads then too.

import { DOMAINS, visibleSkills, getSkillGrade, GRADE_COLORS } from './data.js';
import { UnifiedSkills } from './unified-skills.js';
import { findSkills, onSkillSearchReady } from './skill-finder.js';
import { generateQuestionFor } from './generate-question.js';
import { pupilNameMap } from './pupil-names.js';

const GRADES = ['K', '1', '2', '3', '4', '5', '6', 'M'];
const GRADE_NAME = { K: 'Kindergarten', M: 'Mixed' };
const gradeName = (g) => GRADE_NAME[g] || `Grade ${g}`;
const gradeShort = (g) => (g === 'M' ? 'Mix' : g);
// a short chip word for each area (the full DOMAINS name is the chip's accessible name and the group heading)
const AREA_SHORT = { counting_cardinality: 'Counting', number_operations: 'Numbers', fractions_decimals: 'Fractions', geometry_measurement: 'Shapes & measures', data_statistics: 'Data', algebraic_thinking: 'Algebra', vocabulary: 'Maths words' };
// check D5: Counting and Numbers both carry 🔢 in DOMAINS; the explorer gives Counting its own picture
const AREA_ICON = { counting_cardinality: '🧮' };
const areaIcon = (id) => AREA_ICON[id] || (DOMAINS[id] && DOMAINS[id].icon) || '';
// check r2 D6: the explorer files a skill under the area of its real topic. "Number Sense" (composing) sits in the
// Counting area in DOMAINS, so Grade 3 -> Counting listed fraction skills. Only the explorer moves them (DOMAINS, the
// category ids and every share code stay as they are): a skill in a Counting category whose id or label names a
// fraction is filed under Fractions, in the Fractions category group.
const TOPIC_MOVES = [
    { from: 'counting_cardinality', test: /fraction/i, to: 'fractions_decimals', group: 'fractions' },
];
function topicArea(domainId, skillId, label) {
    for (const m of TOPIC_MOVES) if (m.from === domainId && (m.test.test(skillId) || m.test.test(label))) return m;
    return null;
}
// check D3: a search shows this many at a time, says how many there are, and offers "Show more"
const SEARCH_PAGE = 60;
// check D5: a grade with this many skills or more gets an area filter row inside the grade tab
const GRADE_FILTER_MIN = 100;

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window */ } },
};

// ---- the skills, once -------------------------------------------------------------------------------------------
let ALL = null;
function allSkills() {
    if (ALL) return ALL;
    ALL = [];
    for (const [domainId, d] of Object.entries(DOMAINS)) {
        for (const c of d.categories) {
            for (const s of visibleSkills(c.id) || []) {
                const g = getSkillGrade(s.v, c.id);
                // check r2 D6: the area (and the group) of the skill's real topic; categoryId stays the real one
                const mv = topicArea(domainId, s.v, s.l);
                const aId = mv ? mv.to : domainId;
                const ad = DOMAINS[aId];
                const gc = mv ? ad.categories.find((x) => x.id === mv.group) || c : c;
                ALL.push({
                    key: `${c.id}:${s.v}`, domainId: aId, domainName: ad.name, domainIcon: areaIcon(aId), color: ad.color || '#7c5cff',
                    categoryId: c.id, categoryName: c.name, categoryIcon: c.icon || '', skillId: s.v, rawLabel: s.l,
                    groupId: gc.id, groupName: gc.name, groupIcon: gc.icon || '',
                    label: '', grade: g == null ? 'M' : String(g),
                });
            }
        }
    }
    // check D5 / r2 D1: pupil names from the ONE map every pupil surface reads — no "(Visual)" / "(MAP)" / "Denom";
    // two skills never share a name
    const names = pupilNameMap();
    for (const s of ALL) s.label = names.get(s.key) || s.rawLabel;
    return ALL;
}
const byKey = () => { if (!byKey.m) byKey.m = new Map(allSkills().map((s) => [s.key, s])); return byKey.m; };

// ---- state ------------------------------------------------------------------------------------------------------
const ui = {
    tab: store.get('mq_explore_tab') === 'area' ? 'area' : 'grade',
    grade: GRADES.includes(store.get('mq_explore_grade')) ? store.get('mq_explore_grade') : 'K',
    domain: DOMAINS[store.get('mq_explore_domain')] ? store.get('mq_explore_domain') : Object.keys(DOMAINS)[0],
    query: '',
    gradeArea: 'all',
    limit: SEARCH_PAGE,
    root: null,
    opener: null,
    io: null,
};
const isSelected = (s) => UnifiedSkills.has(s.skillId, s.categoryId);

// ---- markup -----------------------------------------------------------------------------------------------------
const ICON_X = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
const ICON_SEARCH = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';

function shellHTML() {
    return `<div class="mqx-panel" role="dialog" aria-modal="true" aria-labelledby="mqxTitle">
  <div class="mqx-head">
    <h2 class="mqx-title" id="mqxTitle">Explore skills</h2>
    <button type="button" class="mqx-x" data-act="done" aria-label="Close and go back">${ICON_X}</button>
  </div>
  <div class="mqx-search">${ICON_SEARCH}<input type="search" id="mqxSearch" autocomplete="off" spellcheck="false" placeholder="Search skills (try: times, clock, halves)" aria-label="Search skills" aria-controls="mqxBody"></div>
  <div class="mqx-tabs" role="tablist" aria-label="Show skills">
    <button type="button" role="tab" class="mqx-tab" id="mqxTabGrade" data-tab="grade" aria-controls="mqxBody">By grade</button>
    <button type="button" role="tab" class="mqx-tab" id="mqxTabArea" data-tab="area" aria-controls="mqxBody">By area</button>
  </div>
  <div class="mqx-chips" id="mqxChips"></div>
  <div class="mqx-body" id="mqxBody" role="tabpanel" tabindex="-1"></div>
  <div class="mqx-foot">
    <span class="mqx-count" id="mqxCount" aria-live="polite"></span>
    <button type="button" class="mqx-clear" data-act="clear">Clear</button>
    <button type="button" class="mqx-done" data-act="done">Done</button>
  </div>
</div>`;
}

function cardHTML(s) {
    const on = isSelected(s);
    const gc = GRADE_COLORS[s.grade === 'M' ? 'M' : (s.grade === 'K' ? 'K' : Number(s.grade))] || GRADE_COLORS.M;
    const eg = exampleCache.get(s.key);
    return `<button type="button" class="mqx-card${on ? ' is-on' : ''}" data-key="${esc(s.key)}" data-area="${esc(s.domainId)}" aria-pressed="${on}" style="--mqx-area:${esc(s.color)}">
<span class="mqx-grade" style="background:${gc.bg};color:${gc.text}" aria-hidden="true">${esc(gradeShort(s.grade))}</span>
<span class="mqx-name" title="${esc(s.label)}">${esc(s.label)}<span class="mqx-sr">, ${esc(gradeName(s.grade))}</span></span>
<span class="mqx-eg" aria-hidden="true">${eg ? esc(eg) : ''}</span>
<span class="mqx-area"><span aria-hidden="true">${esc(s.groupIcon)}</span> ${esc(s.groupName)}</span>
<span class="mqx-tick" aria-hidden="true"></span>
</button>`;
}

function groupHTML(title, icon, color, list, id, countText = '') {
    if (!list.length) return '';
    return `<section class="mqx-group" aria-labelledby="${id}" style="--mqx-area:${esc(color)}">
<h3 class="mqx-h" id="${id}"><span aria-hidden="true">${esc(icon)}</span> ${esc(title)} <span class="mqx-n">${esc(countText || String(list.length))}</span></h3>
<div class="mqx-grid">${list.map(cardHTML).join('')}</div></section>`;
}

function chipsHTML() {
    if (ui.query.trim().length >= 2) return '';
    if (ui.tab === 'grade') {
        return `<div class="mqx-chiprow" role="radiogroup" aria-label="Grade">${GRADES.map((g) => {
            const c = GRADE_COLORS[g === 'K' || g === 'M' ? g : Number(g)];
            const on = g === ui.grade;
            return `<button type="button" role="radio" class="mqx-chip mqx-gchip" data-grade="${g}" aria-checked="${on}" tabindex="${on ? 0 : -1}" aria-label="${esc(gradeName(g))}" style="--mqx-chip:${c.bg};--mqx-chip-ink:${c.text}">${esc(gradeShort(g))}</button>`;
        }).join('')}</div>`;
    }
    return `<div class="mqx-chiprow" role="radiogroup" aria-label="Area">${Object.entries(DOMAINS).map(([id, d]) => {
        const on = id === ui.domain;
        return `<button type="button" role="radio" class="mqx-chip mqx-dchip" data-domain="${id}" aria-checked="${on}" tabindex="${on ? 0 : -1}" aria-label="${esc(d.name)}" style="--mqx-chip:${esc(d.color)}"><span aria-hidden="true">${esc(areaIcon(id))}</span> ${esc(AREA_SHORT[id] || d.name)}</button>`;
    }).join('')}</div>`;
}

// check D5: inside a long grade, a second row narrows it to one area ("All" first); it scrolls away with the list
function gradeAreaRowHTML(list) {
    const ids = Object.keys(DOMAINS).filter((id) => list.some((s) => s.domainId === id));
    const chip = (id, label, icon, color, n) => {
        const on = ui.gradeArea === id;
        const name = id === 'all' ? `All areas, ${n} skills` : `${DOMAINS[id].name}, ${n} skills`;
        return `<button type="button" role="radio" class="mqx-chip mqx-achip" data-garea="${id}" aria-checked="${on}" tabindex="${on ? 0 : -1}" aria-label="${esc(name)}" style="--mqx-chip:${esc(color)}">${icon ? `<span aria-hidden="true">${esc(icon)}</span> ` : ''}${esc(label)} <span class="mqx-cn" aria-hidden="true">${n}</span></button>`;
    };
    return `<div class="mqx-chiprow mqx-arearow" role="radiogroup" aria-label="Area in ${esc(gradeName(ui.grade))}">${chip('all', 'All', '', '#7c5cff', list.length)}${ids.map((id) => chip(id, AREA_SHORT[id] || DOMAINS[id].name, areaIcon(id), DOMAINS[id].color, list.filter((s) => s.domainId === id).length)).join('')}</div>`;
}

function bodyHTML() {
    const q = ui.query.trim();
    if (q.length >= 2) {
        const found = findSkills(q).map((h) => byKey().get(h.key)).filter(Boolean);
        if (!found.length) return `<p class="mqx-empty">No skills match “${esc(q)}”. Try another word, or look By grade or By area.</p>`;
        const hits = found.slice(0, ui.limit);
        const more = found.length > hits.length;
        const note = more ? `<p class="mqx-more-note" id="mqxMoreNote">Showing ${hits.length} of ${found.length}. Type more words to narrow it.</p>` : '';
        const btn = more ? `<button type="button" class="mqx-more" data-act="more" aria-describedby="mqxMoreNote">Show ${Math.min(SEARCH_PAGE, found.length - hits.length)} more</button>` : '';
        return groupHTML(`Skills for “${q}”`, '', '#7c5cff', hits, 'mqxHq', more ? `${hits.length} of ${found.length}` : '') + note + btn;
    }
    const all = allSkills();
    if (ui.tab === 'grade') {
        const list = all.filter((s) => s.grade === ui.grade);
        const filter = list.length >= GRADE_FILTER_MIN;
        if (!filter || (ui.gradeArea !== 'all' && !list.some((s) => s.domainId === ui.gradeArea))) ui.gradeArea = 'all';
        const shown = ui.gradeArea === 'all' ? list : list.filter((s) => s.domainId === ui.gradeArea);
        const groups = Object.entries(DOMAINS).map(([id, d]) => groupHTML(d.name, areaIcon(id), d.color, shown.filter((s) => s.domainId === id), `mqxHg${id}`)).join('');
        return (filter ? gradeAreaRowHTML(list) : '') + (groups || `<p class="mqx-empty">No skills for ${esc(gradeName(ui.grade))} yet.</p>`);
    }
    const d = DOMAINS[ui.domain];
    const list = all.filter((s) => s.domainId === ui.domain);
    return d.categories.map((c) => groupHTML(c.name, c.icon, d.color, list.filter((s) => s.groupId === c.id), `mqxHc${c.id}`)).join('')
        || `<p class="mqx-empty">No skills here yet.</p>`;
}

// ---- render -----------------------------------------------------------------------------------------------------
function render({ keepScroll = false } = {}) {
    const r = ui.root;
    if (!r) return;
    hideThumb();   // the cards under a thumbnail are about to be drawn again
    for (const t of r.querySelectorAll('.mqx-tab')) {
        const on = t.dataset.tab === ui.tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
    }
    const body = r.querySelector('#mqxBody');
    body.setAttribute('aria-labelledby', ui.tab === 'grade' ? 'mqxTabGrade' : 'mqxTabArea');
    r.querySelector('#mqxChips').innerHTML = chipsHTML();
    const top = body.scrollTop;
    body.innerHTML = bodyHTML();
    body.scrollTop = keepScroll ? top : 0;
    // the chip rows are one scrollable line (check D4): keep the chosen chip in view
    for (const on of r.querySelectorAll('.mqx-chiprow [aria-checked="true"]')) {
        const row = on.parentElement;
        if (row.scrollWidth <= row.clientWidth) continue;
        const rb = row.getBoundingClientRect(), cb = on.getBoundingClientRect();
        if (cb.left < rb.left || cb.right > rb.right) row.scrollLeft += (cb.left + cb.width / 2) - (rb.left + rb.width / 2);   // centre it
    }
    updateCount();
    watchExamples();
}

function updateCount() {
    const n = UnifiedSkills.count;
    const c = ui.root && ui.root.querySelector('#mqxCount');
    if (c) c.textContent = n === 0 ? 'Tap skills to pick them' : `${n} skill${n === 1 ? '' : 's'} picked`;
    const clr = ui.root && ui.root.querySelector('.mqx-clear');
    if (clr) clr.hidden = n === 0;
}

function toggle(card) {
    hideThumb();   // a pick (a click, or Space / Enter on a focused card) puts the thumbnail away
    const s = byKey().get(card.dataset.key);
    if (!s) return;
    if (isSelected(s)) {
        const i = UnifiedSkills.skills.findIndex((x) => x.skillId === s.skillId && x.categoryId === s.categoryId);
        if (i > -1) UnifiedSkills.removeByIndex(i);
    } else {
        UnifiedSkills.add({ domainId: s.domainId, categoryId: s.categoryId, skillId: s.skillId, skillLabel: s.rawLabel, categoryIcon: s.categoryIcon, categoryName: s.categoryName, domainColor: s.color });
    }
    const on = isSelected(s);
    // the same skill can show twice (a search result and its group): keep every copy in step
    for (const el of ui.root.querySelectorAll('.mqx-card')) {
        if (el.dataset.key !== s.key) continue;
        el.classList.toggle('is-on', on);
        el.setAttribute('aria-pressed', String(on));
    }
    updateCount();
}

// ---- a short example on each card: generated at idle, only for cards on screen ----------------------------------
const exampleCache = new Map();
const exampleQueue = [];
let idleHandle = 0;
const ric = (fn) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 800 }) : setTimeout(() => fn({ timeRemaining: () => 8 }), 60));

// One seeded sample per skill (seed 11), shared by the card's short example and the hover thumbnail, so the two always
// show the same item. `ms` is how long the generator took: a slow one (> THUMB_SLOW_MS) gets the text example only.
const sampleCache = new Map();
function sampleOf(s) {
    if (sampleCache.has(s.key)) return sampleCache.get(s.key);
    let out;
    const t0 = performance.now();
    try {
        const q = generateQuestionFor({ category: s.categoryId, skill: s.skillId, seed: 11 });
        out = { q: q && (q.text || q.visual) ? q : null, ms: performance.now() - t0, err: false };
    } catch (e) {
        out = { q: null, ms: performance.now() - t0, err: true };
    }
    sampleCache.set(s.key, out);
    return out;
}

/** The question the pupil reads, as one line of plain text (never the answer). */
function questionText(q) {
    if (!q) return '';
    const div = document.createElement('div');
    div.innerHTML = String(q.text || '');
    // check r4 D4: an exponent is a <sup>; textContent would flatten (4 + 5)<sup>2</sup> into "(4 + 5)2"
    const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    for (const el of div.querySelectorAll('sup')) {
        const t = el.textContent.trim();
        el.textContent = /^\d+$/.test(t) ? [...t].map((d) => SUP[d]).join('') : `^${t}`;
    }
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
}

function exampleFor(s) {
    if (exampleCache.has(s.key)) return exampleCache.get(s.key);
    let text = '';
    try {
        text = questionText(sampleOf(s).q);
        // a bare instruction ("What is the perimeter?") or a long word problem is no example (a sweep of all 716: ~0.6 ms each)
        if (!/\d/.test(text) || text.length < 3) text = '';   // an example shows numbers; a bare question does not
        if (text.length > 44) text = '';
    } catch (e) { text = ''; }
    exampleCache.set(s.key, text);
    return text;
}

function pumpExamples(deadline) {
    idleHandle = 0;
    while (exampleQueue.length && (!deadline || deadline.timeRemaining() > 4)) {
        const el = exampleQueue.shift();
        if (!el.isConnected) continue;
        const s = byKey().get(el.dataset.key);
        if (!s) continue;
        const eg = exampleFor(s);
        const slot = el.querySelector('.mqx-eg');
        if (slot && eg) slot.textContent = eg;
    }
    if (exampleQueue.length) idleHandle = ric(pumpExamples);
}

function watchExamples() {
    if (ui.io) ui.io.disconnect();
    exampleQueue.length = 0;
    if (typeof IntersectionObserver !== 'function') return;
    ui.io = new IntersectionObserver((entries) => {
        for (const e of entries) {
            if (!e.isIntersecting) continue;
            ui.io.unobserve(e.target);
            if (!exampleCache.has(e.target.dataset.key)) exampleQueue.push(e.target);
        }
        if (exampleQueue.length && !idleHandle) idleHandle = ric(pumpExamples);
    }, { root: ui.root.querySelector('#mqxBody'), rootMargin: '200px 0px' });
    for (const el of ui.root.querySelectorAll('.mqx-card')) if (!exampleCache.has(el.dataset.key)) ui.io.observe(el);
}

// ---- the hover thumbnail (owner, 2026-11-05: "give a thumbnail of the skill when mousing over") ----------------
// Hovering a card with a mouse (or focusing it with the keyboard) shows, after a short delay, the card's sample item
// drawn the way the pupil will see it: the black-and-white paper cell of the practice card, with the skill's visual.
// The drawing is teacher-preview.js's (mountQuestion: the same cell the teacher's hover preview draws); that module is
// loaded on the first hover only, never at startup. The question only — the cell's answer slots are empty. A skill whose
// generator throws or is slow (> THUMB_SLOW_MS) shows its text example instead. Ideas from the Skills Navigator's
// so-hover-popup (a delay, a cache) and teacher-preview's placement (beside the anchor, never over the pointer).
// Touch screens (hover: none / pointer: coarse) get no hover thumbnail: a tap still picks the skill.
const THUMB_ID = 'mqxThumb';
const THUMB_DELAY = 500;
const THUMB_WARM = 150;          // moving straight from one card to the next
const THUMB_SLOW_MS = 50;
const th = { el: null, timer: 0, pending: null, card: null, byFocus: false, token: 0, lastHide: 0, pointer: { x: -1, y: -1 }, mode: '', key: '' };
let previewMod = null;
let previewPromise = null;
function loadPreview() {
    if (previewMod) return Promise.resolve(previewMod);
    if (!previewPromise) {
        previewPromise = import('./teacher-preview.js').then((m) => (previewMod = m)).catch((e) => { previewPromise = null; throw e; });
    }
    return previewPromise;
}
// A touch screen (its main pointer is a finger, and nothing on it can hover) never gets a hover thumbnail. Only a real
// mouse or pen pointer event opens one, so a device that reports no pointer at all (hover: none, pointer: none) still
// shows it when a mouse is moved; a tablet with a trackpad (any-hover: hover) shows it for the trackpad.
function noHover() {
    try { return window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-hover: hover)').matches; } catch (e) { return false; }
}
function thumbEl() {
    if (th.el && th.el.isConnected) return th.el;
    const el = document.createElement('div');
    el.id = THUMB_ID;
    el.className = 'mqx-thumb';
    el.setAttribute('role', 'tooltip');
    el.hidden = true;
    ui.root.appendChild(el);
    th.el = el;
    return el;
}
const thumbOpen = () => !!(th.el && !th.el.hidden);

function setDescribed(card, on) {
    if (!card) return;
    const ids = (card.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && x !== THUMB_ID);
    if (on) ids.push(THUMB_ID);
    if (ids.length) card.setAttribute('aria-describedby', ids.join(' ')); else card.removeAttribute('aria-describedby');
}

function hideThumb() {
    clearTimeout(th.timer);
    th.timer = 0;
    th.pending = null;
    th.token++;
    if (thumbOpen()) th.lastHide = Date.now();
    if (th.el) { th.el.hidden = true; th.el.innerHTML = ''; }
    setDescribed(th.card, false);
    th.card = null;
    th.byFocus = false;
    th.mode = '';
    th.key = '';
}

function scheduleThumb(card, byFocus) {
    if (th.card === card && thumbOpen()) { th.byFocus = th.byFocus || byFocus; return; }
    if (th.pending === card) return;
    clearTimeout(th.timer);
    if (thumbOpen()) hideThumb();
    th.pending = card;
    loadPreview().catch(() => { /* the text example stands in */ });
    const delay = Date.now() - th.lastHide < 400 ? THUMB_WARM : THUMB_DELAY;
    th.timer = setTimeout(() => { th.timer = 0; showThumb(card, byFocus); }, delay);
}

// ---- critic r1 / r2 (2026-11-07): a picture whenever the skill has one, and never text a pupil cannot read.
// The plate is as large as the room beside (or above / below) the card allows. The drawing is tidied for pupils (no CCSS
// code, no Hint / Check buttons, no screen-only wording, no second copy of the question, no extra answer line) and then:
//   1. 'cell'  the whole drawing, fitted by its real painted box, when the question line renders >= 14 px, the scale is
//              >= 0.6 and every text renders >= 10 px (the practice card draws a number line's ticks at 17-24 px, so a
//              plate showing them at 9.6 px would be smaller than the card: measured, r2 PARITY);
//   2. 'crop'  otherwise, when the item has a figure: the question line over a window on the figure, scaled (up to
//              CROP_MAX, so a tick label drawn at 7 px reaches 10 px) until every text is legible, the figure's start
//              shown and the cut edges faded — never words alone for a skill whose task needs its picture;
//   3. 'text'  only for an item with no figure at all: its question in large print.
// L is taller than the brief's 480 x 320 (W): with the height, 613 of 716 skills draw whole (critic r1 D1). B (480 x 228)
// fits above or below a card in the middle column of a 1024 x 768 grid, where no wide plate fits beside it (r2 fix 4).
const SIZES = { L: { w: 480, h: 400 }, W: { w: 480, h: 320 }, B: { w: 480, h: 228 }, M: { w: 400, h: 260 }, S: { w: 340, h: 210 } };
const CAP_H = 76;                 // plate padding + gap + a two-line caption
const LEGIBLE = { q: 14.1, min: 10.05, scale: 0.605 };   // a hair over the gate's 14 / 10 / 0.6
const CROP_MAX = 3;               // a crop may draw a figure up to this much larger than its own layout
const CONTROL_RE = /\b(hint|check|submit|reset|clear|undo|try again|show me|listen|read aloud|speak|zoom)\b|🔊/i;
// screen-only or colour wording (critic r2 R2-D2): the clause goes, the rest of the sentence stays
const SCREEN_WORDS = [
    /\s*[—–-]\s*both cells turn green when a pair is correct\.?/gi,
    /\s*\(harder: green cells are blank\)/gi,
    /\s*After each number, press Space\.?/gi,
    /\s*[^.!?]*\b(turns? green|press (Space|Enter)|green cells?)\b[^.!?]*[.!?]?/gi,
];
const screenClean = (t) => SCREEN_WORDS.reduce((acc, re) => acc.replace(re, ''), String(t || '')).replace(/\s+([.,!?])/g, '$1').replace(/\s{2,}/g, ' ');
const normText = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const isVisible = (n) => (typeof n.checkVisibility === 'function' ? n.checkVisibility({ visibilityProperty: true }) : n.offsetParent !== null);
const FIGURE_SEL = 'svg, img, canvas, table, .k2-twin, [data-mq-blank], [data-mq-cell], .ws-fact, .ws-stack, .ws-eq';

/** Hide what is not for a pupil's first look: teacher codes, screen controls, a repeated question, the answer row. */
function tidyThumb(frame) {
    const cell = frame.querySelector('.tvp-cell');
    if (!cell) return;
    for (const n of cell.querySelectorAll('*')) {
        const own = [...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join(' ').trim();
        if (own && /^CCSS\b/.test(own)) n.style.display = 'none';   // "CCSS: 5.MD.B.2 | Line Plot" (gen-data-stats) is teacher text
        if (own && /^Drag the ruler\b/i.test(own)) n.style.display = 'none';   // a widget's label, not the question (r2 R2-D2)
    }
    // screen-only or colour wording inside the drawing's text (r2 R2-D2)
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        const v = t.textContent;
        if (v && /green|press (Space|Enter)/i.test(v)) t.textContent = screenClean(v);
    }
    for (const b of cell.querySelectorAll('button, [role="button"]')) {
        if (CONTROL_RE.test(`${b.textContent || ''} ${b.getAttribute('aria-label') || ''} ${b.className && b.className.baseVal == null ? b.className : ''}`)) b.style.display = 'none';
    }
    for (const n of cell.querySelectorAll('[class*="hint"], [class*="Hint"]')) {
        if (n.querySelector('button') || /button|btn/i.test(n.className)) n.style.display = 'none';
    }
    // the play answer row: the thumbnail shows the question, and the row only ever doubled an item's own blank (D6) or
    // stood beside its counters like one more square (D7)
    for (const r of cell.querySelectorAll('.tvp-answerrow')) r.remove();
    // a K counting row draws its answer square beside the counted squares (D7): in a first look it reads as one more
    // square to count, so the thumbnail leaves it out
    for (const b of cell.querySelectorAll('[data-mq-template="counters"] [data-mq-blank], [data-mq-template="counters"] [data-ws-slot]')) b.style.display = 'none';
    // the question twice (D3): the line above the drawing goes when the drawing restates it (split over lines, or reworded
    // with the same words)
    const line = cell.querySelector('.tvp-q');
    const vis = cell.querySelector('.tvp-visual, .tvp-printed');
    if (line && vis && isVisible(line)) {
        const nl = normText(line.textContent);
        const nv = normText(vis.innerText || vis.textContent);
        const words = nl.split(' ').filter((w) => w.length > 2);
        const have = new Set(nv.split(' '));
        const overlap = words.length ? words.filter((w) => have.has(w)).length / words.length : 0;
        if (nl.length >= 12 && (nv.includes(nl) || (words.length >= 5 && overlap >= 0.8))) line.style.display = 'none';
    }
}

/** The painted box of `root` and everything in it (an overhanging child included), at the root's current transform. */
function paintedBox(root) {
    const sr = root.getBoundingClientRect();
    let x0 = sr.left, y0 = sr.top, x1 = sr.right, y1 = sr.bottom;
    const add = (b) => {
        if (b.width < 0.5 || b.height < 0.5) return;
        x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom);
    };
    for (const n of root.querySelectorAll('*')) {
        if (n.ownerSVGElement) continue;                 // inside a picture: its svg's content box below covers it
        add(n.getBoundingClientRect());
        if (n.tagName.toLowerCase() === 'svg') {
            // what the picture paints, overflowing labels included: its content box, mapped to the screen
            try {
                const bb = n.getBBox();
                const m = n.getScreenCTM();
                if (m && bb.width + bb.height > 0) {
                    const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]]
                        .map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
                    const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
                    add({ left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) });
                }
            } catch (e) { /* an svg that cannot be measured counts by its own box */ }
        }
    }
    // a word that is a bare text node in an overflowing row ("Start" before a time box) paints outside every element box
    const range = document.createRange();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        const pe = t.parentElement;
        if (!pe || pe.ownerSVGElement || pe.tagName.toLowerCase() === 'svg' || !t.textContent.trim() || !isVisible(pe)) continue;
        range.selectNodeContents(t);
        add(range.getBoundingClientRect());
    }
    return { x0, y0, x1, y1, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0), sr };
}

function resetStage(stage) {
    stage.style.left = '0px';
    stage.style.top = '0px';
    stage.style.transformOrigin = '0 0';
    stage.style.transform = 'none';
}

/** Every visible text in `root` with its rendered px: [{ n, px, q }] (q: it is the question line). */
function textList(root) {
    const out = [];
    for (const n of root.querySelectorAll('*')) {
        const tag = n.tagName.toLowerCase();
        if (n.closest('svg') && tag !== 'text' && tag !== 'tspan') continue;
        if (![...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) continue;
        if (!isVisible(n)) continue;
        const b = n.getBoundingClientRect();
        if (!b.width || !b.height) continue;
        const fs = parseFloat(getComputedStyle(n).fontSize) || 0;
        let px;
        if (n instanceof SVGElement) {
            const svg = n.ownerSVGElement;
            if (!svg) px = fs;
            else {
                const sb = svg.getBoundingClientRect();
                const vb = svg.viewBox && svg.viewBox.baseVal;
                const w = vb && vb.width ? vb.width : (svg.width && svg.width.baseVal && svg.width.baseVal.value) || sb.width;
                const h = vb && vb.height ? vb.height : (svg.height && svg.height.baseVal && svg.height.baseVal.value) || sb.height;
                px = fs * Math.min(sb.width / (w || 1), sb.height / (h || 1));
            }
        } else px = fs * (n.offsetWidth > 0 ? b.width / n.offsetWidth : 1);
        out.push({ n, px, q: !!n.closest('.tvp-q, .tvp-instr, .mqx-thumb-crophead') });
    }
    return out;
}

/** The smallest scale at which every text renders >= 10 px and the question line >= 14 px (may be over 1). */
function minLegibleScale(list, s) {
    let need = LEGIBLE.scale;
    for (const t of list) {
        const nat = t.px / (s || 1);                 // its size with the drawing at scale 1
        if (!(nat > 0)) continue;
        need = Math.max(need, LEGIBLE.min / nat);
        if (t.q) need = Math.max(need, LEGIBLE.q / nat);
    }
    return need;
}

/** Does the drawing hold a figure (a picture, a model, boxes to fill), or only words? */
function hasFigure(frame, q) {
    const vis = String((q && q.visual) || '');
    // any drawing on the practice card counts (a T-chart, a tile row drawn in boxes): the pupil sees it there
    if (/<(svg|img|canvas|table)\b/i.test(vis) || vis.replace(/<[^>]*>/g, ' ').trim()) return true;
    const stage = frame.querySelector('.tvp-stage');
    return !!(stage && [...stage.querySelectorAll(FIGURE_SEL)].some((n) => isVisible(n) && n.getBoundingClientRect().width > 8));
}

/** The figure a crop centres on: the largest picture / model in the stage. */
function mainFigure(stage) {
    let best = null, area = 0;
    for (const n of stage.querySelectorAll(FIGURE_SEL)) {
        if (!isVisible(n) || n.closest('.tvp-q, .tvp-instr')) continue;
        const b = n.getBoundingClientRect();
        const a = b.width * b.height;
        if (a > area) { area = a; best = n; }
    }
    return best;
}

/**
 * The crop (r2 fix 2): the question line, in large type, over a window on the main figure, at the smallest scale (>= 0.6,
 * <= CROP_MAX) at which the figure's own labels render >= 10 px. The window shows the whole drawing when it fits, else the
 * whole figure, else the figure from its top-left (where a row, a grid or an axis begins), and fades the edges it cuts.
 * Returns false when no crop can be made.
 */
function cropStage(frame, s, q) {
    const stage = frame.querySelector('.tvp-stage');
    if (!stage) return false;
    let head = frame.querySelector(':scope > .mqx-thumb-crophead');
    let win = frame.querySelector(':scope > .mqx-thumb-window');
    if (!head) {
        const line = [...stage.querySelectorAll('.tvp-q, .tvp-instr')].find((n) => isVisible(n));
        const said = screenClean(line ? line.textContent : questionText(q)).replace(/\s+/g, ' ').trim();
        for (const n of stage.querySelectorAll('.tvp-q, .tvp-instr')) n.style.display = 'none';
        // the head says the question: a line of the drawing that restates it ("Tap ALL the quadrilaterals." under
        // "Click ALL the quadrilaterals.") goes, so the window shows the figure (NODUP)
        if (said) {
            const have = new Set(normText(said).split(' '));
            for (const n of stage.querySelectorAll('*')) {
                if (n.closest('svg') || !isVisible(n)) continue;
                const own = [...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join(' ');
                const words = normText(own).split(' ').filter((w) => w.length > 1);
                if (words.length >= 3 && words.filter((w) => have.has(w)).length / words.length >= 0.75) n.style.display = 'none';
            }
        }
        head = document.createElement('p');
        head.className = 'mqx-thumb-crophead';
        head.textContent = said || s.label;
        win = document.createElement('div');
        win.className = 'mqx-thumb-window';
        frame.insertBefore(head, stage);
        frame.appendChild(win);
        win.appendChild(stage);
        frame.classList.add('mqx-thumb-cropframe');
    }
    // the question line: 20 px, down to 16 px to keep it to four lines and under 40 % of the frame
    let hs = 20;
    head.style.fontSize = `${hs}px`;
    while (hs > 16 && head.offsetHeight > Math.max(60, frame.clientHeight * 0.4)) { hs -= 1; head.style.fontSize = `${hs}px`; }
    const top = head.offsetTop + head.offsetHeight + 6;
    win.style.top = `${top}px`;
    const ww = win.clientWidth, wh = win.clientHeight;
    if (wh < 40) return false;
    resetStage(stage);
    for (const n of stage.querySelectorAll('[data-mqx-cropped]')) { n.style.visibility = ''; n.removeAttribute('data-mqx-cropped'); }
    const list = textList(stage);
    const fig = mainFigure(stage) || stage;
    const all = paintedBox(stage);
    const fb = fig === stage ? all : (() => { const b = fig.getBoundingClientRect(); return { x0: b.left, y0: b.top, w: b.width, h: b.height }; })();
    // the scale is set by the FIGURE's own labels (a tick, an axis number), not by a stray caption elsewhere: one 4 px
    // note no longer zooms the whole drawing three times over and leaves the window on a fragment (r2 S plates)
    const inFig = (t) => fig === stage || fig.contains(t.n) || (t.n.ownerSVGElement && fig.contains(t.n.ownerSVGElement));
    const figTexts = list.filter(inFig);
    const need = minLegibleScale(figTexts.length ? figTexts : list, 1);
    const fit = Math.min(1, (ww - 12) / fb.w, (wh - 12) / fb.h);
    const sc = Math.min(CROP_MAX, Math.max(need, fit));
    const ox = all.sr.left, oy = all.sr.top;
    const fx = (fb.x0 - ox) * sc, fy = (fb.y0 - oy) * sc, fW = fb.w * sc, fH = fb.h * sc;
    const aW = all.w * sc, aH = all.h * sc, ax = (all.x0 - ox) * sc, ay = (all.y0 - oy) * sc;
    // across: the whole drawing centred when it fits; else the figure whole with as much to its left as fits; else from the figure's left
    // edge (where a row, a time line or an axis starts; the cut falls on the right, faded)
    let tx;
    if (aW <= ww - 12) tx = (ww - aW) / 2 - ax;
    else if (fW <= ww - 12) tx = Math.min(6 - ax, ww - 6 - (fx + fW));   // the figure whole, read from the left ("Start 6:45 …")
    else tx = 6 - fx;
    // down: the whole drawing centred when it fits; else from the figure's top, so the window shows the picture
    let ty;
    if (aH <= wh - 12) ty = (wh - aH) / 2 - ay;
    else if (fH <= wh - 12) ty = Math.min(6 - ay, Math.max(wh - 6 - (ay + aH), (wh - fH) / 2 - fy));   // the figure whole, as much around it as fits
    else ty = 6 - fy;
    stage.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${sc.toFixed(4)})`;
    frame.dataset.scale = sc.toFixed(3);
    const wr = win.getBoundingClientRect();
    // words the window cuts across, or that stay too small to read at this scale, are left out (a half word, "2/4 o",
    // or a 6 px caption, is no help); the figure's own labels are what the scale was chosen for
    for (const t of list) {
        const b = t.n.getBoundingClientRect();
        if (b.bottom <= wr.top || b.top >= wr.bottom || b.right <= wr.left || b.left >= wr.right) continue;
        const px = t.px * sc;
        const cutV = b.top < wr.top - 1 || b.bottom > wr.bottom + 1;
        const cutH = (b.left < wr.left - 1 || b.right > wr.right + 1) && b.width < ww * 0.9;
        if (px < LEGIBLE.min - 0.05 || ((cutV || cutH) && !inFig(t))) {
            t.n.style.visibility = 'hidden';
            t.n.setAttribute('data-mqx-cropped', '');
        }
    }
    // fade the edges the window cuts
    const p = paintedBox(stage);
    win.classList.toggle('is-cut-r', p.x1 > wr.right + 1);
    win.classList.toggle('is-cut-b', p.y1 > wr.bottom + 1);
    win.classList.toggle('is-cut-l', p.x0 < wr.left - 1);
    if (frame.parentElement) frame.parentElement.dataset.judge = `crop ${sc.toFixed(2)} need ${need.toFixed(2)} head ${hs}`;
    return true;
}

/** The large-print plate, for an item with no figure: the question itself (never the answer), 16 px at the least. */
function textPlate(frame, s, q) {
    // a question that ends on a colon pointed at its picture; the plate shows the words alone, so it ends as a sentence
    const full = screenClean(questionText(q) || exampleFor(s)).replace(/\s*:\s*$/, '.').trim();
    frame.className = 'mqx-thumb-frame mqx-thumb-textframe';
    frame.removeAttribute('role');
    frame.removeAttribute('aria-label');
    frame.innerHTML = `<p class="mqx-thumb-text"></p>`;
    const p = frame.firstChild;
    let words = (full || s.label).split(' ');
    let size = 26;
    p.textContent = words.join(' ');
    const over = () => frame.scrollHeight > frame.clientHeight + 1 || frame.scrollWidth > frame.clientWidth + 1;
    p.style.fontSize = `${size}px`;
    while (over() && size > 16) { size -= 2; p.style.fontSize = `${size}px`; }
    while (over() && words.length > 4) { words = words.slice(0, -1); p.textContent = `${words.join(' ')} …`; }
}

/** Lay a mounted drawing out as a whole cell, or a crop, or (no figure) words; returns the mode. */
function layoutPlate(frame, s, q) {
    const stage = frame.querySelector('.tvp-stage');
    if (!stage) return 'text';
    if (!frame.classList.contains('mqx-thumb-cropframe')) {
        // measured once, at scale 1: the scale that fits and the scale every text needs come from the same layout
        resetStage(stage);
        const box = paintedBox(stage);
        const texts = textList(stage);
        if (!texts.some((t) => t.q) && texts.length) texts[0].q = true;   // no question line: the first text the pupil reads
        const fw = frame.clientWidth, fh = frame.clientHeight;
        const sc = Math.min(1, (fw - 12) / box.w, (fh - 12) / box.h);
        const need = minLegibleScale(texts, 1);
        if (frame.parentElement) frame.parentElement.dataset.judge = `${sc.toFixed(2)} need ${need.toFixed(2)}`;
        if (sc >= need - 1e-3) {
            const tx = (fw - box.w * sc) / 2 - (box.x0 - box.sr.left) * sc;
            const ty = (fh - box.h * sc) / 2 - (box.y0 - box.sr.top) * sc;
            stage.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${sc.toFixed(4)})`;
            frame.dataset.scale = sc.toFixed(3);
            return 'cell';
        }
        if (!hasFigure(frame, q)) { textPlate(frame, s, q); return 'text'; }
    }
    if (cropStage(frame, s, q)) return 'crop';
    textPlate(frame, s, q);
    return 'text';
}

/**
 * Fill a plate (`el`, a .mqx-thumb) for skill `s` at size `size`. Returns 'cell', 'crop' or 'text'. `onSettled(mode)`
 * runs once the drawing has settled (the mono pass let go; laid out again, so late fonts or images are allowed for).
 */
function fillPlate(el, s, size, mod, onSettled) {
    const data = sampleOf(s);
    const z = SIZES[size] || SIZES.S;
    el.classList.remove('mqx-thumb--L', 'mqx-thumb--W', 'mqx-thumb--B', 'mqx-thumb--M', 'mqx-thumb--S');
    el.classList.add(`mqx-thumb--${size}`);
    el.style.setProperty('--mqx-thumb-w', `${z.w}px`);
    el.style.setProperty('--mqx-thumb-h', `${z.h}px`);
    el.innerHTML = `<div class="tvp-frame mqx-thumb-frame"></div><p class="mqx-thumb-cap">${esc(s.label)}</p>`;
    el.hidden = false;
    const frame = el.querySelector('.mqx-thumb-frame');
    let mode = 'text';
    const drawable = mod && data.q && !data.err && data.ms <= THUMB_SLOW_MS;
    const settle = () => {
        if (frame.isConnected && (el.dataset.mode === 'cell' || el.dataset.mode === 'crop') && frame.querySelector('.tvp-stage')) {
            el.dataset.mode = layoutPlate(frame, s, data.q);
        }
        if (onSettled) onSettled(el.dataset.mode);
    };
    if (drawable) {
        let mounted = false;
        try { mounted = !!mod.mountQuestion(frame, data.q, s.skillId, { fit: false, onSettled: settle }); } catch (e) { mounted = false; }
        // a cell that drew nothing readable (no text, no drawing) is no picture of the skill
        if (mounted && !frame.querySelector('.tvp-cell svg, .tvp-cell img, .tvp-cell canvas') && !(frame.querySelector('.tvp-cell') || {}).textContent) mounted = false;
        if (mounted) {
            tidyThumb(frame);
            mode = layoutPlate(frame, s, data.q);
        }
    }
    if (mode === 'text' && !frame.classList.contains('mqx-thumb-textframe')) textPlate(frame, s, data.q);
    el.dataset.mode = mode;
    if (mode === 'text' && onSettled) setTimeout(() => onSettled('text'), 0);
    return mode;
}

/** Where a plate of pw x ph goes beside `card`: { x, y, clean } (clean: inside the window, off the card and pointer). */
function placement(card, pw, ph) {
    const r = card.getBoundingClientRect();
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = window.innerHeight;
    const g = 12, m = 8;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const midY = clamp(r.top + r.height / 2 - ph / 2, m, Math.max(m, vh - ph - m));
    const leftX = clamp(r.left, m, Math.max(m, vw - pw - m));
    const cands = [
        { x: r.right + g, y: midY },          // beside the card: the side with room first
        { x: r.left - g - pw, y: midY },
        { x: leftX, y: r.bottom + g },
        { x: leftX, y: r.top - g - ph },
    ];
    const p = th.byFocus ? null : th.pointer;
    const fits = (c) => c.x >= m && c.y >= m && c.x + pw <= vw - m && c.y + ph <= vh - m;
    const over = (c, a) => c.x < a.right && c.x + pw > a.left && c.y < a.bottom && c.y + ph > a.top;
    const onCard = (c) => over(c, { left: r.left - 2, right: r.right + 2, top: r.top - 2, bottom: r.bottom + 2 });
    const onPointer = (c) => !!p && p.x >= 0 && over(c, { left: p.x - 12, right: p.x + 12, top: p.y - 12, bottom: p.y + 12 });
    const pick = cands.find((c) => fits(c) && !onCard(c) && !onPointer(c));
    if (pick) return { ...pick, clean: true };
    // a small window: clamp each side into the viewport and take the first that still keeps off the card and pointer
    const clamped = cands.map((c) => ({ x: clamp(c.x, m, Math.max(m, vw - pw - m)), y: clamp(c.y, m, Math.max(m, vh - ph - m)) }));
    return { ...(clamped.find((c) => !onCard(c) && !onPointer(c)) || clamped.find((c) => !onPointer(c)) || clamped[0]), clean: false };
}

/**
 * The largest plate that sits cleanly beside the card (or above / below it), never on the card or the pointer. At 1024 px
 * and wider that is L (480 x 400) beside any card where the window is tall enough, else W (480 x 320); a portrait tablet (820 x 1180) gets L above or below the card when the
 * side has no room, so a pupil there is not left with the small plate.
 */
function sizeFor(card) {
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const order = ['L', 'W', 'B', 'M', 'S'];
    for (const k of order) {
        const z = SIZES[k];
        if (z.w > vw - 16) continue;
        if (placement(card, z.w, z.h + CAP_H).clean) return k;
    }
    return 'S';
}

function placeThumb(card) {
    const el = th.el;
    if (!el || el.hidden || !card) return;
    const pick = placement(card, el.offsetWidth, el.offsetHeight);
    el.style.left = `${Math.round(pick.x)}px`;
    el.style.top = `${Math.round(pick.y)}px`;
}

async function showThumb(card, byFocus) {
    th.pending = null;
    if (!ui.root || ui.root.hidden || !card || !card.isConnected) return;
    const s = byKey().get(card.dataset.key);
    if (!s) return;
    const token = ++th.token;
    const data = sampleOf(s);
    let mod = previewMod;
    if (!mod && data.q && !data.err && data.ms <= THUMB_SLOW_MS) { try { mod = await loadPreview(); } catch (e) { mod = null; } }
    if (token !== th.token || !card.isConnected || ui.root.hidden) return;
    th.byFocus = byFocus;
    const el = thumbEl();
    el.style.left = '-9999px';
    el.style.top = '0px';
    let mode = '';
    const still = () => token === th.token && th.card === card && thumbOpen();
    try {
        mode = fillPlate(el, s, sizeFor(card), mod, (m) => {
            if (!still()) return;
            th.mode = m;
            placeThumb(card);
        });
    } catch (e) { mode = ''; }
    if (!mode) { el.hidden = true; return; }
    th.card = card;
    th.mode = mode;
    th.key = s.key;
    placeThumb(card);
    setDescribed(card, true);
}

function cardOf(node) {
    const el = node && node.nodeType === 1 ? node : node && node.parentElement;
    const c = el && el.closest ? el.closest('.mqx-card') : null;
    return c && ui.root && ui.root.contains(c) ? c : null;
}

function wireThumbs(r) {
    r.addEventListener('pointermove', (e) => { th.pointer = { x: e.clientX, y: e.clientY }; }, { passive: true });
    r.addEventListener('pointerover', (e) => {
        if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        th.pointer = { x: e.clientX, y: e.clientY };
        if (noHover()) return;
        const card = cardOf(e.target);
        if (!card) return;
        if (e.relatedTarget && card.contains(e.relatedTarget)) return;
        scheduleThumb(card, false);
    });
    r.addEventListener('pointerout', (e) => {
        const card = cardOf(e.target);
        if (!card) return;
        if (e.relatedTarget && card.contains(e.relatedTarget)) return;
        if (th.byFocus && th.card === card && document.activeElement === card) return;   // a keyboard thumbnail stays with its focus
        if (th.card === card || th.pending === card) hideThumb();
    });
    r.addEventListener('pointerdown', () => { hideThumb(); }, true);
    r.addEventListener('focusin', (e) => {
        const card = cardOf(e.target);
        if (!card) { if (thumbOpen() || th.pending) hideThumb(); return; }
        let keyboard = false;
        try { keyboard = e.target.matches(':focus-visible'); } catch (err) { keyboard = true; }
        if (!keyboard) return;
        scheduleThumb(card, true);
    });
    r.addEventListener('focusout', (e) => {
        const card = cardOf(e.target);
        if (!card) return;
        if (e.relatedTarget && card.contains(e.relatedTarget)) return;
        if (th.card === card || th.pending === card) hideThumb();
    });
    // A scroll hides a hover thumbnail. A keyboard one follows its card (focusing a card scrolls it into view) while the
    // card is still in the list's window, and hides once it leaves.
    r.addEventListener('scroll', () => {
        if (!thumbOpen() && !th.pending) return;
        const card = th.card || th.pending;
        if (th.byFocus && card && card === document.activeElement) {
            const b = r.querySelector('#mqxBody').getBoundingClientRect(), c = card.getBoundingClientRect();
            if (c.bottom > b.top && c.top < b.bottom) { if (thumbOpen()) placeThumb(card); return; }
        }
        if (th.pending && document.activeElement === th.pending) return;   // still waiting for a focused card: keep it
        hideThumb();
    }, true);
    window.addEventListener('resize', () => { if (thumbOpen() || th.pending) hideThumb(); });
    window.addEventListener('blur', () => { if (thumbOpen() || th.pending) hideThumb(); });
}

function visualText(html) {
    const div = document.createElement('div');
    div.innerHTML = String(html || '');
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
}

/**
 * For tests (ws-student-explorer THUMB sweep): draw the thumbnail of `key` at once (no delay) and report what it shows.
 * The question only: `ans` is returned so the gate can check the drawing never shows it.
 */
export async function studentExplorerThumbProbe(key) {
    if (!ui.root) return { err: 'explorer not open' };
    const s = byKey().get(key);
    if (!s) return { err: `no skill ${key}` };
    hideThumb();
    const data = sampleOf(s);
    let mod = null;
    try { mod = await loadPreview(); } catch (e) { mod = null; }
    const el = thumbEl();
    el.style.left = '-9999px';
    el.style.top = '0px';
    const mode = fillPlate(el, s, 'L', mod, null);
    const stage = el.querySelector('.tvp-stage');
    const out = {
        key, mode, ms: Math.round(data.ms * 10) / 10, err: data.err,
        cell: !!el.querySelector('.ws-cell, .mq-scell'),
        text: (stage ? stage.textContent : el.querySelector('.mqx-thumb-frame').textContent).replace(/\s+/g, ' ').trim(),
        qText: questionText(data.q), qVisual: data.q && data.q.visual ? visualText(data.q.visual) : '',
        ans: data.q && data.q.ans != null && typeof data.q.ans !== 'object' ? String(data.q.ans) : '',
        // a box the pupil types into holds nothing; a tap box (a checkbox) is not ticked
        filled: [...el.querySelectorAll('input, textarea')].filter((i) => (i.type === 'checkbox' || i.type === 'radio' ? i.checked : i.value)).length,
        hasOptions: !!(data.q && Array.isArray(data.q.options) && data.q.options.length),
    };
    hideThumb();
    return out;
}

/**
 * For tests (ws-student-explorer THUMB legible sweep): draw the plates of `keys` side by side, off screen, at `size`
 * (L / M / S), and resolve once every one has settled (refit and judged again after the mono pass). Each plate is a
 * .mqx-thumb.mqx-thumb-probe carrying data-key and data-mode. Called with [] it removes the plates.
 */
export async function studentExplorerThumbBatch(keys, { size = 'L' } = {}) {
    if (!ui.root) return 0;
    for (const old of ui.root.querySelectorAll('.mqx-thumb-probe')) old.remove();
    if (!keys || !keys.length) return 0;
    let mod = null;
    try { mod = await loadPreview(); } catch (e) { mod = null; }
    const waits = [];
    keys.forEach((key, i) => {
        const s = byKey().get(key);
        if (!s) return;
        const el = document.createElement('div');
        el.className = 'mqx-thumb mqx-thumb-probe';
        el.dataset.key = key;
        el.style.left = `${-6000 + (i % 6) * 520}px`;
        el.style.top = `${Math.floor(i / 6) * 420}px`;
        ui.root.appendChild(el);
        waits.push(new Promise((res) => {
            const t = setTimeout(res, 3000);   // a plate that never settles is measured as it stands
            try { fillPlate(el, s, size, mod, () => { clearTimeout(t); res(); }); } catch (e) { el.dataset.mode = 'error'; clearTimeout(t); res(); }
        }));
    });
    await Promise.all(waits);
    return waits.length;
}

// ---- events -----------------------------------------------------------------------------------------------------
function moveRadio(group, dir) {
    const items = [...group.querySelectorAll('[role="radio"]')];
    const i = items.findIndex((x) => x.getAttribute('aria-checked') === 'true');
    const next = items[(i + dir + items.length) % items.length];
    if (!next) return;
    const attr = next.dataset.grade ? 'grade' : next.dataset.garea ? 'garea' : 'domain';
    const val = next.dataset[attr];
    next.click();
    const again = ui.root.querySelector(`[role="radio"][data-${attr}="${val}"]`);
    if (again) again.focus();
}

function onClick(e) {
    const t = e.target.closest('button');
    if (!t || !ui.root.contains(t)) {
        if (e.target === ui.root) close();   // the dimmed backdrop
        return;
    }
    if (t.classList.contains('mqx-card')) { toggle(t); return; }
    if (t.dataset.tab) { setTab(t.dataset.tab); return; }
    if (t.dataset.grade) { ui.grade = t.dataset.grade; ui.gradeArea = 'all'; store.set('mq_explore_grade', ui.grade); render(); return; }
    if (t.dataset.garea) { ui.gradeArea = t.dataset.garea; render(); const b = ui.root.querySelector(`[data-garea="${ui.gradeArea}"]`); if (b) { try { b.focus({ preventScroll: true }); } catch (e2) { /* */ } } return; }
    if (t.dataset.act === 'more') {
        const first = ui.limit;
        ui.limit += SEARCH_PAGE;
        render({ keepScroll: true });
        const c = ui.root.querySelectorAll('#mqxBody .mqx-card')[first];   // focus the first new card
        if (c) { try { c.focus(); } catch (e2) { /* */ } }
        return;
    }
    if (t.dataset.domain) { ui.domain = t.dataset.domain; store.set('mq_explore_domain', ui.domain); render(); return; }
    if (t.dataset.act === 'done') { close(); return; }
    if (t.dataset.act === 'clear') { UnifiedSkills.clear(); render({ keepScroll: true }); }
}

function setTab(tab) {
    if (tab !== 'grade' && tab !== 'area') return;
    ui.tab = tab;
    store.set('mq_explore_tab', tab);
    const input = ui.root.querySelector('#mqxSearch');
    if (input && input.value) { input.value = ''; ui.query = ''; }
    render();
}

function onKey(e) {
    if (e.key === 'Escape') {
        e.preventDefault();
        // the first Esc hides a showing thumbnail; the next one closes the explorer
        if (thumbOpen()) { e.stopPropagation(); hideThumb(); return; }
        close();
        return;
    }
    const t = e.target;
    if (t.getAttribute && t.getAttribute('role') === 'tab' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        setTab(ui.tab === 'grade' ? 'area' : 'grade');
        ui.root.querySelector(`.mqx-tab[data-tab="${ui.tab}"]`).focus();
        return;
    }
    if (t.getAttribute && t.getAttribute('role') === 'radio' && /^Arrow(Right|Left|Up|Down)$/.test(e.key)) {
        e.preventDefault();
        moveRadio(t.closest('[role="radiogroup"]'), /Right|Down/.test(e.key) ? 1 : -1);
        return;
    }
    if (e.key === 'Tab') {   // keep focus inside the dialog
        const f = [...ui.root.querySelectorAll('button:not([disabled]):not([hidden]), input, [tabindex="0"]')].filter((x) => x.offsetParent !== null && x.tabIndex >= 0);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
}

let searchTimer = 0;
function onInput(e) {
    if (e.target.id !== 'mqxSearch') return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { ui.query = e.target.value || ''; ui.limit = SEARCH_PAGE; render(); }, 120);
}
onSkillSearchReady(() => { if (ui.root && !ui.root.hidden && ui.query.trim().length >= 2) render({ keepScroll: true }); });

function ensureCss() {
    const l = document.getElementById('mqExplorerCss');
    if (!l || l.getAttribute('href')) return Promise.resolve();
    return new Promise((res) => {
        l.addEventListener('load', res, { once: true });
        l.addEventListener('error', res, { once: true });
        l.setAttribute('href', l.dataset.mqExplorerHref);
        setTimeout(res, 3000);   // a slow sheet never keeps the explorer shut
    });
}

// ---- open / close -----------------------------------------------------------------------------------------------
export async function openStudentExplorer(opts = {}) {
    await ensureCss();
    if (!ui.root) {
        const r = document.createElement('div');
        r.id = 'studentExplorer';
        r.className = 'mqx-overlay';
        r.hidden = true;
        r.innerHTML = shellHTML();
        r.addEventListener('click', onClick);
        r.addEventListener('keydown', onKey);
        r.addEventListener('input', onInput);
        wireThumbs(r);
        document.body.appendChild(r);
        ui.root = r;
    }
    if (opts.tab) ui.tab = opts.tab === 'area' ? 'area' : 'grade';
    if (opts.grade && GRADES.includes(String(opts.grade))) ui.grade = String(opts.grade);
    if (opts.domain && DOMAINS[opts.domain]) ui.domain = opts.domain;
    ui.opener = document.activeElement;
    ui.query = '';
    const input = ui.root.querySelector('#mqxSearch');
    if (input) input.value = '';
    ui.root.hidden = false;
    document.documentElement.classList.add('mqx-open');
    render();
    const tab = ui.root.querySelector(`.mqx-tab[data-tab="${ui.tab}"]`);
    try { (tab || ui.root.querySelector('.mqx-done')).focus({ preventScroll: true }); } catch (e) { /* */ }
    return true;
}

/** Done: close, refresh the home's cards and bottom row, and bring the row (Add to Quick Start · Play · Send · Print) into view. */
export function closeStudentExplorer() { close(); }

function close() {
    if (!ui.root || ui.root.hidden) return;
    hideThumb();
    ui.root.hidden = true;
    if (ui.io) ui.io.disconnect();
    document.documentElement.classList.remove('mqx-open');
    try { if (typeof window.renderQuickSkillsGrid === 'function') window.renderQuickSkillsGrid(); } catch (e) { /* */ }
    try { if (typeof window.updateStudentSelBar === 'function') window.updateStudentSelBar(); } catch (e) { /* */ }
    const row = document.getElementById('studentSelActions');
    const n = UnifiedSkills.count;
    if (row && n > 0 && row.offsetParent !== null) {
        try { row.scrollIntoView({ block: 'center' }); } catch (e) { /* */ }
        const play = document.getElementById('studentSelPlayBtn');
        if (play && !play.disabled) { try { play.focus({ preventScroll: true }); } catch (e) { /* */ } return; }
    }
    const back = ui.opener && ui.opener.isConnected ? ui.opener : document.getElementById('studentExploreBtn');
    if (back) { try { back.focus({ preventScroll: true }); } catch (e) { /* */ } }
}

/** For tests: what the explorer is showing. */
export function studentExplorerState() {
    if (!ui.root) return null;
    return { open: !ui.root.hidden, tab: ui.tab, grade: ui.grade, gradeArea: ui.gradeArea, domain: ui.domain, query: ui.query, cards: ui.root.querySelectorAll('.mqx-card').length, examples: exampleCache.size,
        thumb: { open: thumbOpen(), key: th.key, mode: th.mode, byFocus: th.byFocus, pending: !!th.pending } };
}
