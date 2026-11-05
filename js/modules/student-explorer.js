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

const GRADES = ['K', '1', '2', '3', '4', '5', '6', 'M'];
const GRADE_NAME = { K: 'Kindergarten', M: 'Mixed' };
const gradeName = (g) => GRADE_NAME[g] || `Grade ${g}`;
const gradeShort = (g) => (g === 'M' ? 'Mix' : g);
// a short chip word for each area (the full DOMAINS name is the chip's accessible name and the group heading)
const AREA_SHORT = { counting_cardinality: 'Counting', number_operations: 'Numbers', fractions_decimals: 'Fractions', geometry_measurement: 'Shapes & measures', data_statistics: 'Data', algebraic_thinking: 'Algebra', vocabulary: 'Maths words' };
const LEAD_ICONS = /^[\s\u{1F300}-\u{1FAFF}☀-➿⬀-⯿️‍½]+/u;

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cleanLabel = (l) => String(l || '').replace(LEAD_ICONS, '').trim() || String(l || '');
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
                ALL.push({
                    key: `${c.id}:${s.v}`, domainId, domainName: d.name, domainIcon: d.icon, color: d.color || '#7c5cff',
                    categoryId: c.id, categoryName: c.name, categoryIcon: c.icon || '', skillId: s.v, rawLabel: s.l,
                    label: cleanLabel(s.l), grade: g == null ? 'M' : String(g),
                });
            }
        }
    }
    return ALL;
}
const byKey = () => { if (!byKey.m) byKey.m = new Map(allSkills().map((s) => [s.key, s])); return byKey.m; };

// ---- state ------------------------------------------------------------------------------------------------------
const ui = {
    tab: store.get('mq_explore_tab') === 'area' ? 'area' : 'grade',
    grade: GRADES.includes(store.get('mq_explore_grade')) ? store.get('mq_explore_grade') : 'K',
    domain: DOMAINS[store.get('mq_explore_domain')] ? store.get('mq_explore_domain') : Object.keys(DOMAINS)[0],
    query: '',
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
    return `<button type="button" class="mqx-card${on ? ' is-on' : ''}" data-key="${esc(s.key)}" aria-pressed="${on}" style="--mqx-area:${esc(s.color)}">
<span class="mqx-grade" style="background:${gc.bg};color:${gc.text}" aria-hidden="true">${esc(gradeShort(s.grade))}</span>
<span class="mqx-name">${esc(s.label)}<span class="mqx-sr">, ${esc(gradeName(s.grade))}</span></span>
<span class="mqx-eg" aria-hidden="true">${eg ? esc(eg) : ''}</span>
<span class="mqx-area"><span aria-hidden="true">${esc(s.categoryIcon)}</span> ${esc(s.categoryName)}</span>
<span class="mqx-tick" aria-hidden="true"></span>
</button>`;
}

function groupHTML(title, icon, color, list, id) {
    if (!list.length) return '';
    return `<section class="mqx-group" aria-labelledby="${id}" style="--mqx-area:${esc(color)}">
<h3 class="mqx-h" id="${id}"><span aria-hidden="true">${esc(icon)}</span> ${esc(title)} <span class="mqx-n">${list.length}</span></h3>
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
        return `<button type="button" role="radio" class="mqx-chip mqx-dchip" data-domain="${id}" aria-checked="${on}" tabindex="${on ? 0 : -1}" aria-label="${esc(d.name)}" style="--mqx-chip:${esc(d.color)}"><span aria-hidden="true">${esc(d.icon)}</span> ${esc(AREA_SHORT[id] || d.name)}</button>`;
    }).join('')}</div>`;
}

function bodyHTML() {
    const q = ui.query.trim();
    if (q.length >= 2) {
        const hits = findSkills(q).map((h) => byKey().get(h.key)).filter(Boolean).slice(0, 60);
        if (!hits.length) return `<p class="mqx-empty">No skills match “${esc(q)}”. Try another word.</p>`;
        return groupHTML(`Skills for “${q}”`, '', '#7c5cff', hits, 'mqxHq');
    }
    const all = allSkills();
    if (ui.tab === 'grade') {
        const list = all.filter((s) => s.grade === ui.grade);
        const groups = Object.entries(DOMAINS).map(([id, d]) => groupHTML(d.name, d.icon, d.color, list.filter((s) => s.domainId === id), `mqxHg${id}`)).join('');
        return groups || `<p class="mqx-empty">No skills for ${esc(gradeName(ui.grade))} yet.</p>`;
    }
    const d = DOMAINS[ui.domain];
    const list = all.filter((s) => s.domainId === ui.domain);
    return d.categories.map((c) => groupHTML(c.name, c.icon, d.color, list.filter((s) => s.categoryId === c.id), `mqxHc${c.id}`)).join('')
        || `<p class="mqx-empty">No skills here yet.</p>`;
}

// ---- render -----------------------------------------------------------------------------------------------------
function render({ keepScroll = false } = {}) {
    const r = ui.root;
    if (!r) return;
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

function exampleFor(s) {
    if (exampleCache.has(s.key)) return exampleCache.get(s.key);
    let text = '';
    try {
        const q = generateQuestionFor({ category: s.categoryId, skill: s.skillId, seed: 11 });
        const div = document.createElement('div');
        div.innerHTML = String((q && q.text) || '');
        text = (div.textContent || '').replace(/\s+/g, ' ').trim();
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

// ---- events -----------------------------------------------------------------------------------------------------
function moveRadio(group, dir) {
    const items = [...group.querySelectorAll('[role="radio"]')];
    const i = items.findIndex((x) => x.getAttribute('aria-checked') === 'true');
    const next = items[(i + dir + items.length) % items.length];
    if (next) { next.click(); const again = ui.root.querySelector(`[role="radio"][data-${next.dataset.grade ? 'grade' : 'domain'}="${next.dataset.grade || next.dataset.domain}"]`); if (again) again.focus(); }
}

function onClick(e) {
    const t = e.target.closest('button');
    if (!t || !ui.root.contains(t)) {
        if (e.target === ui.root) close();   // the dimmed backdrop
        return;
    }
    if (t.classList.contains('mqx-card')) { toggle(t); return; }
    if (t.dataset.tab) { setTab(t.dataset.tab); return; }
    if (t.dataset.grade) { ui.grade = t.dataset.grade; store.set('mq_explore_grade', ui.grade); render(); return; }
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
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
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
    searchTimer = setTimeout(() => { ui.query = e.target.value || ''; render(); }, 120);
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
    return { open: !ui.root.hidden, tab: ui.tab, grade: ui.grade, domain: ui.domain, query: ui.query, cards: ui.root.querySelectorAll('.mqx-card').length, examples: exampleCache.size };
}
