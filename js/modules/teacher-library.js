// teacher-library.js — the "Skills library" screen of the teacher view (owner request 2026-09-24:
// every teacher-facing part of the site looks the same, uncluttered and easy to use).
//
// Replaces, for teachers only, the legacy Skills Navigator (#skillsOrganizerView). Pupils never
// reach that view, and it is left in place, untouched, for its old entry point.
//
//   Browse    one search box, two quiet filters (Level, Domain) and a List | Thumbnails toggle
//   Preview   the selected skill's example drawn as the black-and-white paper cell
//             (generateQuestionFor + screen-cell.js), with "New example"
//   Act       Practise now · Add to skill set · Print · More (Options, Copy pupil link, Make a quiz)
//
// The library never duplicates another screen: "Add to skill set" puts the skill in the current
// set that "Send a skill set" edits, "Print" hands the skill to "Print worksheets", and
// "Practise now" runs it the way "Run practice" does.
//
// SWAP POINT: the paper-cell preview (`paperCellHTML` / `mountPreview`) is self-contained on
// purpose. When a shared thumbnail / preview component lands, replace those two functions and the
// `.tvl-paper` rules in css/teacher-library.css; nothing else here depends on how a preview draws.

import { state } from './state.js';
import { DOMAINS } from './data.js';
import { generateQuestionFor } from './generate-question.js';
import { cellKindFor, kindHTML, instructionForKind, regroupFor, hideScreenOnlyCaptions, screenGlyphs, monoCell, unmonoCell } from './screen-cell.js';
import { optionsFor } from './skill-options.js';
import { addMultipleQuestions } from './quiz-builder.js';
import {
    icon, esc, toast, copyText, skillCatalogue, findSkill, levelText, currentSet, addToCurrentSet,
    loadSetIntoQueue, optionsSummary, optionsReadOnlyHTML, readStore, writeStore,
} from './teacher-ui.js';
import { printSkills } from './teacher-print.js';
import { buildSheet } from './print-sheet.js';

const LEVELS = ['K', '1', '2', '3', '4', '5', '6', 'M'];
const UI_KEY = 'mq_teacher_library_ui';
const THUMB_PAGE = 60;

const lib = {
    query: '',
    level: '',          // '' = all levels
    domain: '',         // '' = all domains
    view: 'list',       // 'list' | 'thumbs'
    sel: '',            // 'categoryId|skillId'
    opts: {},           // 'categoryId|skillId' -> the options chosen here (preview + actions)
    seed: 1,
    menu: false,
    optionsOpen: false,
    thumbLimit: THUMB_PAGE,
};

(function restore() {
    const s = readStore(UI_KEY, null);
    if (!s || typeof s !== 'object') return;
    if (LEVELS.includes(s.level)) lib.level = s.level;
    if (s.domain && DOMAINS[s.domain]) lib.domain = s.domain;
    if (s.view === 'thumbs') lib.view = 'thumbs';
})();
function persist() { writeStore(UI_KEY, { level: lib.level, domain: lib.domain, view: lib.view }); }

let root = null;
let thumbObserver = null;

/* ================================================================= public */

export function renderLibraryScreen(el) {
    root = el;
    if (!root.dataset.built) {
        root.innerHTML = shellHTML();
        root.dataset.built = '1';
        wire();
    }
    syncControls();
    renderResults();
    renderDetail();
}

/** Select a skill on the library screen (for callers that want to deep-link one). */
export function selectLibrarySkill(categoryId, skillId) {
    if (!findSkill(categoryId, skillId)) return false;
    lib.sel = `${categoryId}|${skillId}`;
    lib.seed = freshSeed();
    lib.optionsOpen = false;
    lib.menu = false;
    return true;
}

/* ================================================================= markup */

function shellHTML() {
    const domainOpts = Object.entries(DOMAINS).map(([id, d]) => `<option value="${esc(id)}">${esc(d.name)}</option>`).join('');
    const levelOpts = LEVELS.map((l) => `<option value="${l}">${l === 'M' ? 'Mixed levels' : `Level ${l}`}</option>`).join('');
    return `
<header class="tv-header">
  <div><h1 class="tv-h1">Skills library</h1><p class="tv-sub">Every skill in Maths Quest. Choose one to see an example, then practise it, add it to a set or print it.</p></div>
</header>
<div class="tvl-bar" role="search" aria-label="Find a skill">
  <div class="tv-search tvl-bar-search"><label class="tv-sr" for="tvlSearch">Search skills</label>${icon('search', 18)}<input id="tvlSearch" class="tv-input" type="search" placeholder="Search, e.g. subtract across zeros" autocomplete="off"></div>
  <div class="tvl-bar-filter"><label class="tv-sr" for="tvlLevel">Level</label><select id="tvlLevel" class="tv-select"><option value="">All levels</option>${levelOpts}</select></div>
  <div class="tvl-bar-filter"><label class="tv-sr" for="tvlDomain">Domain</label><select id="tvlDomain" class="tv-select"><option value="">All domains</option>${domainOpts}</select></div>
</div>
<div class="tvl-grid">
  <section class="tv-card tv-flush tvl-results" aria-labelledby="tvlCount">
    <div class="tv-card-head"><h2 class="tv-h2-sm" id="tvlCount" aria-live="polite">Skills</h2>
      <div class="tv-row tvl-head-tools"><button type="button" class="tv-btn tv-btn-ghost" data-lib-act="clear-filters" hidden>Clear filters</button>
      <div class="tv-seg tvl-view" role="radiogroup" aria-label="Show skills as">
        <button type="button" role="radio" data-lib-view="list">List</button>
        <button type="button" role="radio" data-lib-view="thumbs">Thumbnails</button>
      </div></div></div>
    <div class="tvl-results-body" id="tvlResults"></div>
  </section>
  <aside class="tv-card tvl-detail" id="tvlDetail" aria-label="Selected skill"></aside>
</div>`;
}

function syncControls() {
    const q = root.querySelector('#tvlSearch');
    if (q && document.activeElement !== q) q.value = lib.query;
    root.querySelector('#tvlLevel').value = lib.level;
    root.querySelector('#tvlDomain').value = lib.domain;
    root.querySelectorAll('[data-lib-view]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.libView === lib.view)));
}

/* ================================================================= browse */

function matches(s) {
    if (lib.level && s.level !== lib.level) return false;
    if (lib.domain && s.domainId !== lib.domain) return false;
    const words = lib.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return true;
    const hay = `${s.label} ${s.categoryName} ${s.domainName} ${s.skillId.replace(/_/g, ' ')}`.toLowerCase();
    return words.every((w) => hay.includes(w));
}

function shown() { return skillCatalogue().filter(matches); }

function keyOf(s) { return `${s.categoryId}|${s.skillId}`; }

function renderResults() {
    const box = root.querySelector('#tvlResults');
    const list = shown();
    const filtered = !!(lib.query.trim() || lib.level || lib.domain);
    root.querySelector('#tvlCount').textContent = `${list.length} skill${list.length === 1 ? '' : 's'}${filtered ? '' : ' in all'}`;
    root.querySelector('[data-lib-act="clear-filters"]').hidden = !filtered;
    if (thumbObserver) { thumbObserver.disconnect(); thumbObserver = null; }
    box.querySelectorAll('.tvl-paper').forEach((p) => unmonoCell(p));
    if (!list.length) {
        box.innerHTML = `<div class="tv-empty-lg"><span class="tv-empty-icon" aria-hidden="true">${icon('search', 22)}</span>
          <div class="tv-h3">No skills match</div><p class="tv-cap">Try fewer words, or clear the filters.</p></div>`;
        return;
    }
    if (lib.view === 'thumbs') renderThumbs(box, list);
    else renderList(box, list);
}

/** Grouped by domain, then category: a plain list of rows. */
function renderList(box, list) {
    let html = '';
    let dom = '', cat = '';
    for (const s of list) {
        if (s.domainId !== dom) {
            if (dom) html += '</ul></div>';
            dom = s.domainId; cat = '';
            html += `<div class="tvl-group"><h3 class="tvl-group-h">${esc(s.domainName)}</h3><ul class="tvl-list" role="list">`;
        }
        if (s.categoryId !== cat) {
            cat = s.categoryId;
            html += `<li class="tvl-cat" role="presentation">${esc(s.categoryName)}</li>`;
        }
        const k = keyOf(s);
        html += `<li><button type="button" class="tvl-row" data-lib-skill="${esc(k)}"${lib.sel === k ? ' aria-current="true"' : ''}>
          <span class="tvl-row-name">${esc(s.label)}</span><span class="tvl-row-level">${esc(s.level === 'M' ? 'Mixed' : `Level ${s.level}`)}</span></button></li>`;
    }
    if (dom) html += '</ul></div>';
    box.innerHTML = html;
}

/** A grid of small paper-cell thumbnails, drawn lazily as they scroll into view. */
function renderThumbs(box, list) {
    const page = list.slice(0, lib.thumbLimit);
    box.innerHTML = `<ul class="tvl-thumbs" role="list">${page.map((s) => {
        const k = keyOf(s);
        return `<li><button type="button" class="tvl-thumb" data-lib-skill="${esc(k)}"${lib.sel === k ? ' aria-current="true"' : ''}>
          <span class="tvl-thumb-stage" aria-hidden="true"><span class="tvl-thumb-inner" data-thumb="${esc(k)}"></span></span>
          <span class="tvl-thumb-name">${esc(s.label)}</span>
          <span class="tvl-thumb-meta">${esc(levelText(s.level))} · ${esc(s.categoryName)}</span></button></li>`;
    }).join('')}</ul>
    ${list.length > page.length ? `<div class="tvl-more"><button type="button" class="tv-btn" data-lib-act="more">Show more <span class="tv-muted">(${list.length - page.length} left)</span></button></div>` : ''}`;
    const draw = (el) => {
        if (el.dataset.drawn) return;
        el.dataset.drawn = '1';
        const [c, s] = el.dataset.thumb.split('|');
        mountPreview(el, c, s, lib.opts[el.dataset.thumb], seedFor(c, s), { thumb: true });
    };
    if (typeof IntersectionObserver === 'function') {
        thumbObserver = new IntersectionObserver((entries) => {
            for (const e of entries) if (e.isIntersecting) { draw(e.target); thumbObserver.unobserve(e.target); }
        }, { root: null, rootMargin: '200px' });
        box.querySelectorAll('[data-thumb]').forEach((el) => thumbObserver.observe(el));
    } else {
        box.querySelectorAll('[data-thumb]').forEach(draw);
    }
}

/* ================================================================= the paper cell preview */

function freshSeed() { return Math.floor(Math.random() * 900000) + 100000; }
/** A stable seed per skill, so a thumbnail shows the same example each time it is drawn. */
function seedFor(c, s) {
    let h = 2166136261;
    for (const ch of `${c}:${s}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
}

function plainAnswer(q) {
    const a = q && q.ans;
    if (a == null) return '';
    if (Array.isArray(a)) return a.join(', ');
    if (typeof a === 'object') return '';
    return String(a).replace(/<[^>]*>/g, '');
}

/**
 * The example as the black-and-white paper cell: the instruction line above a bordered cell.
 * Two-operand facts, column sums and bracket division are drawn with the sheet kit exactly as
 * the practice card draws them; anything else shows its own visual, held to ink and paper.
 */
function paperCellHTML(q, categoryId, skillId) {
    const kind = (q.answerType === 'number' || !q.answerType) ? cellKindFor(q) : null;
    if (kind) {
        const slot = '<span class="tvl-slot" aria-hidden="true"></span>';
        return {
            instr: instructionForKind(kind),
            body: kindHTML(kind, { slotHtml: slot, regroup: regroupFor(skillId), answerClass: 'tvl-digit' }),
            kind: kind.kind,
        };
    }
    const text = String(q.text || '');
    const visual = String(q.visual || '');
    return { instr: screenGlyphs(text), body: visual, kind: 'legacy' };
}

function mountPreview(el, categoryId, skillId, opts, seed, { thumb = false } = {}) {
    let q = null;
    try {
        q = generateQuestionFor({ category: categoryId, skill: skillId, opts: opts || {}, seed });
    } catch (e) {
        console.warn('[teacher-library] preview failed', categoryId, skillId, e);
    }
    unmonoCell(el.querySelector('.tvl-paper'));
    if (!q) {
        el.innerHTML = `<p class="tv-cap tvl-noprev">No preview for this skill.</p>`;
        return null;
    }
    const cell = paperCellHTML(q, categoryId, skillId);
    el.innerHTML = `<div class="tvl-paper mq-scell mq-mono${thumb ? ' is-thumb' : ''} tvl-kind-${cell.kind}" inert>
      ${cell.instr ? `<div class="tvl-instr">${cell.instr}</div>` : ''}
      <div class="tvl-cell">${cell.body || ''}</div></div>`;
    const paper = el.querySelector('.tvl-paper');
    paper.querySelectorAll('input, select, textarea, button').forEach((n) => { n.setAttribute('tabindex', '-1'); if ('disabled' in n) n.disabled = true; });
    // The practice card's own passes: screen-only captions go, a repeated prompt is said once.
    if (cell.kind === 'legacy') {
        try { hideScreenOnlyCaptions(paper.querySelector('.tvl-cell')); } catch (e) { /* preview only */ }
        if (!cell.body.trim()) paper.querySelector('.tvl-cell').remove();
    }
    monoCell(paper);
    fitPaper(el);
    // A live widget (build, drag, grid) has no static drawing: show its printed cell instead.
    if (cell.kind === 'legacy' && !cell.body.trim() && !STATIC_TYPES.has(q.answerType)) {
        const token = (el.__tvlToken = (el.__tvlToken || 0) + 1);
        printedCell(categoryId, skillId, opts, seed).then((html) => {
            if (!html || el.__tvlToken !== token || !el.isConnected) return;
            unmonoCell(el.querySelector('.tvl-paper'));
            el.innerHTML = `<div class="tvl-paper tvl-printed${thumb ? ' is-thumb' : ''}" inert><div class="ws-sheet ws-L ws-ican">${html}</div></div>`;
            fitPaper(el);
        });
    }
    return q;
}

const STATIC_TYPES = new Set(['number', 'text', 'multiple-choice', undefined, null, '']);

/**
 * The first cell of a one-item Independent page, from the sheet kit (print-sheet.js). Builds are
 * run one at a time: the kit measures cells in the live document.
 */
let buildChain = Promise.resolve();
function printedCell(categoryId, skillId, opts, seed) {
    const run = async () => {
        try {
            const r = await buildSheet({
                role: 'independent',
                sections: [{ skills: [{ categoryId, skillId, opts: opts || {} }], count: 1, columns: 1 }],
                key: false, seed,
                header: { name: false, date: false, score: false, tab: false, title: false },
            });
            const box = document.createElement('div');
            box.innerHTML = r.pupilHtml;
            const c = box.querySelector('.ws-cell');
            if (!c) return '';
            c.querySelectorAll('.ws-letter').forEach((n) => n.remove());
            return c.outerHTML;
        } catch (e) {
            return '';
        }
    };
    const p = buildChain.then(run);
    buildChain = p.catch(() => {});
    return p;
}

/** Scale a drawing wider than its stage down to fit (never up). */
function fitPaper(stage) {
    const paper = stage.querySelector('.tvl-paper');
    if (!paper || !stage.clientWidth) return;
    paper.style.zoom = '';
    const cs = getComputedStyle(stage);
    const avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const w = paper.scrollWidth;
    if (w > avail && avail > 0) paper.style.zoom = String(Math.max(0.35, (avail / w) * 0.96));
}

/* ================================================================= detail */

function selected() {
    if (!lib.sel) return null;
    const [c, s] = lib.sel.split('|');
    return findSkill(c, s);
}

function inCurrentSet(s) { return currentSet().some((x) => x.categoryId === s.categoryId && x.skillId === s.skillId); }

function hasOptions(s) {
    try { return optionsFor(s.categoryId, s.skillId).length > 0; } catch (e) { return false; }
}

function renderDetail() {
    const box = root.querySelector('#tvlDetail');
    unmonoCell(box.querySelector('.tvl-paper'));
    const s = selected();
    box.classList.toggle('is-empty', !s);
    if (!s) {
        box.innerHTML = `<div class="tv-empty-lg tvl-detail-empty"><span class="tv-empty-icon" aria-hidden="true">${icon('eye', 22)}</span>
          <div class="tv-h3">Choose a skill</div><p class="tv-cap">Its example appears here, with what you can do with it.</p></div>`;
        return;
    }
    const k = keyOf(s);
    const opts = lib.opts[k];
    const sum = optionsSummary(s.categoryId, s.skillId, opts);
    const inSet = inCurrentSet(s);
    const optionable = hasOptions(s);
    box.innerHTML = `
  <div class="tvl-detail-head">
    <h2 class="tv-h2" id="tvlSelName">${esc(s.label)}</h2>
    <p class="tv-cap">${esc(levelText(s.level))} · ${esc(s.domainName)} · ${esc(s.categoryName)}</p>
  </div>
  <div class="tvl-prev">
    <div class="tvl-prev-head"><span class="tv-label" style="margin:0;">Example</span>
      <button type="button" class="tv-btn tv-btn-ghost" data-lib-act="new-example">${icon('reset', 16)}<span>New example</span></button></div>
    <div class="tvl-stage" id="tvlStage"></div>
    <p class="tv-cap" id="tvlAnswer"></p>
    ${sum ? `<p class="tv-cap">Options: ${esc(sum)}</p>` : ''}
  </div>
  <div class="tvl-actions">
    <button type="button" class="tv-btn tv-btn-primary tv-btn-block" data-lib-act="practise">${icon('play', 18)}<span>Practise now</span></button>
    <div class="tvl-actions-row">
      <button type="button" class="tv-btn" data-lib-act="add" aria-pressed="${inSet}"${inSet ? ' title="Already in your current set. Open it in Send a skill set."' : ''}>${icon(inSet ? 'check' : 'plus', 18)}<span>${inSet ? 'In your set' : 'Add to skill set'}</span></button>
      <button type="button" class="tv-btn" data-lib-act="print">${icon('print', 18)}<span>Print</span></button>
      <div class="tv-menu-wrap">
        <button type="button" class="tv-btn tvl-more-btn" data-lib-act="menu" aria-haspopup="true" aria-expanded="${lib.menu}" aria-label="More actions for ${esc(s.label)}">${icon('dots', 20)}</button>
        <div class="tv-menu" role="menu"${lib.menu ? '' : ' hidden'}>
          ${optionable ? `<button type="button" role="menuitem" data-lib-act="options">${icon('sliders', 16)}<span>Options</span></button>` : ''}
          <button type="button" role="menuitem" data-lib-act="link">${icon('link', 16)}<span>Copy pupil link</span></button>
          <button type="button" role="menuitem" data-lib-act="quiz">${icon('sheet', 16)}<span>Make a quiz</span></button>
        </div>
      </div>
    </div>
  </div>
  <div class="tv-opt-panel" id="tvlOptions"${lib.optionsOpen ? '' : ' hidden'}>${lib.optionsOpen ? optionsReadOnlyHTML(s.categoryId, s.skillId, opts) : ''}</div>`;
    drawDetailPreview();
}

function drawDetailPreview() {
    const s = selected();
    const stage = root.querySelector('#tvlStage');
    if (!s || !stage) return;
    const q = mountPreview(stage, s.categoryId, s.skillId, lib.opts[keyOf(s)], lib.seed);
    const ans = q ? plainAnswer(q) : '';
    root.querySelector('#tvlAnswer').textContent = ans ? `Answer: ${ans}` : '';
}

/* ================================================================= actions */

function oneSkill(s) {
    const item = { categoryId: s.categoryId, skillId: s.skillId, weight: 1 };
    const opts = lib.opts[keyOf(s)];
    if (opts && Object.keys(opts).length) item.opts = opts;
    return item;
}

function snapshotQueue() {
    return currentSet().map((x) => ({ categoryId: x.categoryId, skillId: x.skillId, weight: x.weight, opts: x.opts }));
}

/** Run one skill now, then give the teacher's current set back (the game keeps its own copy). */
function practise(s) {
    const before = snapshotQueue();
    loadSetIntoQueue({ skills: [oneSkill(s)] });
    try {
        window.playSelectedSkills?.('practice');
    } finally {
        loadSetIntoQueue({ skills: before });
    }
}

async function copyLink(s) {
    const before = snapshotQueue();
    const prevSettings = state.shareSettings;
    const prevType = state.shareLinkType;
    let link = '';
    loadSetIntoQueue({ skills: [oneSkill(s)] });
    try {
        state.shareSettings = { timer: '?', problemCount: '?', gameMode: 'practice', range: '?', decimals: '?', quickStartLocked: '?' };
        state.shareLinkType = 'direct';
        link = window.generateShareableLink ? window.generateShareableLink() : '';
    } catch (e) {
        link = '';
    } finally {
        loadSetIntoQueue({ skills: before });
        state.shareSettings = prevSettings;
        state.shareLinkType = prevType;
    }
    if (!link) { toast('Could not make a link for this skill'); return; }
    toast((await copyText(link)) ? 'Pupil link copied' : 'Could not copy the link');
}

function makeQuiz(s) {
    window.openQuizBuilder?.();
    setTimeout(() => {
        try { addMultipleQuestions(s.skillId, 5); } catch (e) { console.warn('[teacher-library] quiz', e); }
    }, 100);
}

function openOptions(s, anchor) {
    const k = keyOf(s);
    if (typeof window.openSkillOptionsPanel === 'function') {
        window.openSkillOptionsPanel(s.categoryId, s.skillId, anchor, {
            opts: lib.opts[k] || {},
            onChange: (next) => {
                lib.opts[k] = next && typeof next === 'object' ? next : {};
                lib.seed = freshSeed();
                renderDetail();
            },
        });
        return;
    }
    lib.optionsOpen = !lib.optionsOpen;
    renderDetail();
}

function onAction(act, btn) {
    const s = selected();
    switch (act) {
        case 'clear-filters':
            lib.query = ''; lib.level = ''; lib.domain = ''; lib.thumbLimit = THUMB_PAGE;
            persist(); syncControls(); renderResults();
            return;
        case 'more':
            lib.thumbLimit += THUMB_PAGE;
            renderResults();
            return;
        default: break;
    }
    if (!s) return;
    if (act !== 'menu') lib.menu = false;
    switch (act) {
        case 'new-example': lib.seed = freshSeed(); drawDetailPreview(); break;
        case 'practise': practise(s); break;
        case 'add': {
            if (inCurrentSet(s)) { window.tvGo?.('sets'); return; }
            const item = oneSkill(s);
            addToCurrentSet(s.categoryId, s.skillId, { opts: item.opts });
            window.skillQueue = [...currentSet()];
            const n = currentSet().length;
            toast(`Added to your set · ${n} skill${n === 1 ? '' : 's'}`);
            renderDetail();
            root.querySelector('[data-lib-act="add"]')?.focus();
            break;
        }
        case 'print':
            printSkills([oneSkill(s)]);
            window.tvGo?.('print');
            break;
        case 'menu':
            lib.menu = !lib.menu;
            renderDetail();
            if (lib.menu) root.querySelector('#tvlDetail .tv-menu button')?.focus();
            else root.querySelector('[data-lib-act="menu"]')?.focus();
            break;
        case 'options': openOptions(s, btn); if (!lib.menu) root.querySelector('[data-lib-act="menu"]')?.focus(); break;
        case 'link': renderDetail(); copyLink(s); break;
        case 'quiz': makeQuiz(s); break;
        default: break;
    }
}

function select(key) {
    if (lib.sel === key) return;
    lib.sel = key;
    lib.seed = freshSeed();
    lib.menu = false;
    lib.optionsOpen = false;
    root.querySelectorAll('[data-lib-skill]').forEach((b) => {
        if (b.dataset.libSkill === key) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    renderDetail();
    // On a narrow screen the detail sits above the list: bring it into view.
    if (window.matchMedia && window.matchMedia('(max-width: 1100px)').matches) {
        root.querySelector('#tvlDetail')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
}

/* ================================================================= wiring */

function wire() {
    document.addEventListener('click', (e) => {
        // A click inside the screen re-renders the detail, which can detach its target first.
        if (!e.target.isConnected) return;
        if (lib.menu && root && !root.contains(e.target)) { lib.menu = false; renderDetail(); }
    });
    root.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || !root.contains(b)) {
            if (lib.menu && !e.target.closest('.tv-menu-wrap')) { lib.menu = false; renderDetail(); }
            return;
        }
        if (b.dataset.libSkill) { select(b.dataset.libSkill); return; }
        if (b.dataset.libView) {
            if (lib.view !== b.dataset.libView) { lib.view = b.dataset.libView; persist(); syncControls(); renderResults(); }
            return;
        }
        if (b.dataset.libAct) { onAction(b.dataset.libAct, b); return; }
        if (lib.menu && !b.closest('.tv-menu-wrap')) { lib.menu = false; renderDetail(); }
    });
    let t = null;
    root.addEventListener('input', (e) => {
        if (e.target.id !== 'tvlSearch') return;
        lib.query = e.target.value;
        lib.thumbLimit = THUMB_PAGE;
        clearTimeout(t);
        t = setTimeout(renderResults, 120);
    });
    root.addEventListener('change', (e) => {
        if (e.target.id === 'tvlLevel') { lib.level = e.target.value; }
        else if (e.target.id === 'tvlDomain') { lib.domain = e.target.value; }
        else return;
        lib.thumbLimit = THUMB_PAGE;
        persist();
        renderResults();
    });
    root.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lib.menu) {
            lib.menu = false; renderDetail(); root.querySelector('[data-lib-act="menu"]')?.focus();
            return;
        }
        // Arrow keys move through the skills (list rows or thumbnails) and the menu items.
        if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        const menuItem = e.target.closest('.tv-menu [role="menuitem"]');
        if (menuItem) {
            const items = [...menuItem.parentElement.querySelectorAll('[role="menuitem"]')];
            const i = items.indexOf(menuItem);
            const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
            items[(i + step + items.length) % items.length]?.focus();
            e.preventDefault();
            return;
        }
        const cur = e.target.closest('[data-lib-skill]');
        if (!cur) return;
        const all = [...root.querySelectorAll('#tvlResults [data-lib-skill]')];
        const i = all.indexOf(cur);
        let step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
        if (lib.view === 'thumbs' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            const top = cur.getBoundingClientRect().top;
            const perRow = all.filter((b) => Math.abs(b.getBoundingClientRect().top - top) < 2).length || 1;
            step *= perRow;
        }
        const next = all[i + step];
        if (next) { next.focus(); e.preventDefault(); }
    });
}
