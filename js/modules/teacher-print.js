// teacher-print.js — the "Print worksheets" screen of the teacher view.
//
// Drives the sheet engine through its app bridge (print-sheet.js):
//   buildSheet(req)    -> {pupilHtml, keyHtml, pageCount, keyPageCount, fits}
//   sheetDocument(html)-> the standalone printable document (A4/Letter, Andika, sheet kit)
// Each section is one buildSheet request (a section carries its own page type), and the
// pupil pages of every section print first, then every answer key.
//
// Page types: every role buildSheet composes (WORKING below), chosen from picture cards grouped
// Practice / Teach / Check / Facts / Thinking. A role that does not fit the chosen skills (the
// fact layouts need a fact skill) says why on its card, from buildSheet's `unsupported` error.
//
// The classic print dialog is retired for teachers: every teacher path that opened it
// (openSimplePrintDialog, openPrintSettings, the Library's Print) lands here instead, with its
// skills loaded (openPrintWith / printSkills). What only the old engine can do - an auto-layout
// worksheet with worked solutions, "fill blank spaces", grouping by maths strand, versions - and
// the Google Forms export live under Page setup. Black and white.
//
// INTEGRATION POINT (skill options): as on the Send screen, a skill row's Options button calls
// window.openSkillOptionsPanel(categoryId, skillId, anchorEl, {opts, onChange}) when installed;
// the chosen `opts` go straight into the buildSheet request (skills[].opts).

import { buildSheet, sheetDocument } from './print-sheet.js';
import {
    icon, esc, toast, skillCatalogue, findSkill, levelText, currentSet, savedSets, printDefaults,
    optionsSummary, optionsReadOnlyHTML, readStore, writeStore, PRINTS_KEY, fmtDay,
} from './teacher-ui.js';
import { tvpAttrs, infoButtonHTML } from './teacher-preview.js';
import { skillHasOfferedOptions } from './skill-options-ui.js';
import { generateQuestionFor } from './generate-question.js';
import { getSetOptions } from './skill-option-store.js';
import { getProvider } from './sheet/index.js';

// The page types buildSheet composes (print-sheet.js SHEET_ROLES). Anything else is listed,
// disabled, as "coming soon".
const WORKING = new Set([
    'opener', 'scripted-model', 'guided', 'independent', 'more-practice', 'error-analysis', 'review', 'test', 'test-b',
    'pre-skill-check', 'word-problems', 'fact-rows', 'fact-probe', 'mixed-practice', 'true-false', 'reason-it', 'stretch',
]);
// The picker: every working role as a picture card, in quiet groups. [role, name, one line]
const PAGE_GROUPS = [
    ['Practice', [
        ['independent', 'Independent', 'Practice alone, with a score.'],
        ['more-practice', 'More Practice', 'Pages A, B, C… new numbers each.'],
        ['mixed-practice', 'Mixed practice', 'Several skills on one page.'],
        ['word-problems', 'Word problems', 'Stories with room to work.'],
    ]],
    ['Teach', [
        ['opener', 'Lesson opener', 'A warm-up to start the lesson.'],
        ['scripted-model', 'Scripted model', 'Worked examples and what to say.'],
        ['guided', 'Guided', 'Help that fades item by item.'],
    ]],
    ['Check', [
        ['pre-skill-check', 'Pre-skill check', 'Ready for this skill?'],
        ['error-analysis', 'Check it', 'Find and fix the mistake.'],
        ['review', 'Review', 'Earlier skills, spaced out.'],
        ['test', 'Test A', 'A scored test.'],
        ['test-b', 'Test B', 'The same test, new numbers.'],
    ]],
    ['Facts', [
        ['fact-rows', 'Fact rows', 'Rows of facts to drill.'],
        ['fact-probe', 'Fact probe', 'A quick timed fact check.'],
    ]],
    ['Thinking', [
        ['true-false', 'True or False?', 'Decide, then circle.'],
        ['reason-it', 'Reason It', 'Explain in words or pictures.'],
        ['stretch', 'Stretch', 'One harder problem to think about.'],
    ]],
].map(([g, list]) => [g, list.filter(([v]) => WORKING.has(v))]).filter(([, list]) => list.length);
const PAGE_TYPES = [
    ['Lesson', [['lesson-packet', 'Lesson packet'], ['opener', 'Lesson opener'], ['scripted-model', 'Scripted model'], ['guided', 'Guided'], ['independent', 'Independent'], ['more-practice', 'More Practice'], ['error-analysis', 'Error analysis (Check it)'], ['review', 'Review'], ['test', 'Test A'], ['test-b', 'Test B'], ['pre-skill-check', 'Pre-skill check']]],
    ['Practice', [['computation', 'Computation grid'], ['word-problems', 'Word problems'], ['visual-grid', 'Visual grid']]],
    ['Facts', [['fact-rows', 'Fact rows'], ['fact-probe', 'Fact probe']]],
    ['Mixed review', [['mixed-practice', 'Mixed practice'], ['daily4', 'Daily 4'], ['spiral', 'Daily spiral'], ['todays-number', "Today's Number"]]],
    ['Thinking', [['true-false', 'True or False?'], ['reason-it', 'Reason It'], ['stretch', 'Stretch']]],
];
const ROLE_NAME = Object.fromEntries(PAGE_TYPES.flatMap(([, list]) => list));
const LETTERS = 'ABCDEFGHIJ'.split('');

let pr = null;
let root = null;
let buildToken = 0;
let buildTimer = null;
let last = null;     // {sections:[{pupilHtml,keyHtml,pageCount,keyPageCount,fits,role,letters}], pupilHtml, keyHtml, pages:[labels], keyPages}

function newSection(skills = []) {
    return { role: 'more-practice', columns: 'auto', letters: ['A', 'B'], pages: 1, skills, optionsOpen: '', picking: false, menu: '', types: false };
}

function initState() {
    const d = printDefaults();
    pr = {
        title: '',
        sections: [newSection(fromQueue())],
        size: d.size, look: 'auto', paper: d.paper, photocopySafe: d.photocopySafe,
        // S6: step-by-step anchor problems on Independent, More Practice and Mixed practice.
        anchors: 'off',
        header: { name: true, date: true, score: true, tab: true, title: true },
        key: true,
        seed: freshSeed(),
        view: 0,          // page index, or 'key'
        versions: 1,
        // The classic mixed worksheet (legacy engine): its own extras.
        classic: { count: 20, sets: 1, worked: false, fill: false, strand: false, open: false },
    };
}
function freshSeed() { return Math.floor(Math.random() * 900000) + 100000; }
function fromQueue() {
    return currentSet().map((s) => ({ categoryId: s.categoryId, skillId: s.skillId, opts: optsOf(s), weight: s.weight > 1 ? s.weight : 1 }));
}
/**
 * A skill's options: its own, else the set's (skill-option-store: what the Library, Mixed
 * settings and Quick Start panels write). The classic dialog seeded itself the same way.
 */
function optsOf(k) {
    if (k.opts && typeof k.opts === 'object' && Object.keys(k.opts).length) return k.opts;
    let set = {};
    try { set = getSetOptions(k.categoryId, k.skillId) || {}; } catch (e) { set = {}; }
    return Object.keys(set).length ? set : undefined;
}

/* ================================================================= public */

export function renderPrintScreen(el) {
    root = el;
    if (!pr) initState();
    else if (pr.sections.every((s) => !s.skills.length) && currentSet().length) pr.sections[0].skills = fromQueue();
    if (!root.dataset.built) {
        root.innerHTML = shellHTML();
        root.dataset.built = '1';
        wire();
    }
    root.querySelector('#tvSheetTitle').value = pr.title;
    renderWhat();
    renderSetup();
    scheduleBuild(0);
}

/**
 * Load skills into the Print screen (the classic print entry points call this through
 * window.tvOpenPrintWith, then show the screen). Accepts queue items or dialog entries:
 * {categoryId, skillId, opts?, weight?}. An empty list keeps what is there.
 */
export function openPrintWith(list) {
    const skills = (Array.isArray(list) ? list : [])
        .filter((k) => k && k.categoryId && k.skillId && findSkill(k.categoryId, k.skillId))
        .map((k) => ({ categoryId: k.categoryId, skillId: k.skillId, opts: optsOf(k), weight: k.weight > 1 ? k.weight : 1 }));
    if (!pr) initState();
    if (!skills.length) return;
    pr.sections = [newSection(skills)];
    pr.seed = freshSeed();
    pr.view = 0;
}

/**
 * Start a fresh sheet from the given skills ({categoryId, skillId, opts?, weight?}[]). Used by the
 * Skills library's "Print"; the caller then shows this screen with tvGo('print').
 */
export function printSkills(skills) {
    if (!pr) initState();
    pr.title = '';
    pr.sections = [newSection((skills || []).map((s) => ({ ...s })))];
    pr.seed = freshSeed();
    pr.view = 0;
}

/** Re-print a stored printout (Home, "Recent printouts"). */
export async function reprint(id) {
    const rec = (readStore(PRINTS_KEY, []) || []).find((p) => p.id === id);
    if (!rec || !rec.req) { toast('That printout can no longer be rebuilt'); return; }
    toast('Preparing the pages…');
    try {
        const built = await buildAll(rec.req);
        await printHtml(built.pupilHtml + built.keyHtml, rec.title || 'Worksheet', rec.req.paper);
        rec.at = Date.now();
        const list = (readStore(PRINTS_KEY, []) || []).filter((p) => p.id !== id);
        writeStore(PRINTS_KEY, [rec, ...list].slice(0, 10));
    } catch (e) {
        console.warn('[teacher-print] reprint failed', e);
        toast('Could not rebuild that printout');
    }
}

export function recentPrintouts() {
    const list = readStore(PRINTS_KEY, []);
    return Array.isArray(list) ? list : [];
}

/* ================================================================= markup */

function shellHTML() {
    return `
<header class="tv-header">
  <div>
    <h1 class="tv-h1">Print worksheets</h1>
    <p class="tv-sub">Choose skills and a page type. Every page prints with its answer key.</p>
  </div>
</header>
<div class="tv-print-grid">
  <section class="tv-card tv-print-what" aria-labelledby="tvWhatH">
    <h2 class="tv-h2" id="tvWhatH">What to print</h2>
    <div>
      <label class="tv-label" for="tvSheetTitle">Sheet title</label>
      <input id="tvSheetTitle" class="tv-input" type="text" placeholder="Taken from the skill when left empty" maxlength="90">
    </div>
    <div id="tvSections" style="display:flex;flex-direction:column;gap:12px;"></div>
    <div class="tv-row">
      <button type="button" class="tv-btn" data-act="add-section" style="flex:1;">${icon('plus', 18)}<span>Add section</span></button>
    </div>
  </section>
  <section class="tv-preview tv-preview-card" aria-labelledby="tvPreviewH">
    <h2 class="tv-sr" id="tvPreviewH">Preview</h2>
    <div class="tv-seg" role="radiogroup" aria-label="Page to preview" id="tvPageTabs" style="grid-auto-columns:minmax(0,1fr);"></div>
    <div class="tv-preview-stage" id="tvStage">
      <div class="tv-preview-box" id="tvPreviewBox">
        <iframe class="tv-preview-frame" id="tvPreviewFrame" title="Worksheet preview" tabindex="-1"></iframe>
        <div class="tv-preview-msg" id="tvPreviewMsg">Add a skill to see the page.</div>
      </div>
    </div>
    <p class="tv-fits" id="tvFits"></p>
  </section>
  <section class="tv-card tv-flush" aria-labelledby="tvSetupH" id="tvSetup"></section>
</div>`;
}

function wire() {
    root.querySelector('#tvSheetTitle').addEventListener('input', (e) => { pr.title = e.target.value; scheduleBuild(); });
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    root.addEventListener('input', (e) => {
        if (e.target.dataset.pick !== undefined) renderPickResults(Number(e.target.dataset.pick), e.target.value);
    });
    window.addEventListener('resize', () => fitPreview());
    document.addEventListener('click', (e) => {
        if (!pr) return;
        if (e.target.closest('.tv-menu-wrap')) return;
        let changed = false;
        pr.sections.forEach((s) => { if (s.menu) { s.menu = ''; changed = true; } });
        if (changed) renderWhat();
    });
}

function sec(i) { return pr.sections[Number(i)]; }

function onClick(e) {
    const b = e.target.closest('button');
    if (!b || !root.contains(b)) return;
    const d = b.dataset;
    switch (d.act) {
        case 'role': {
            const s = sec(d.sec);
            const changed = s.role !== d.v;
            s.role = d.v;
            s.types = false;
            renderWhat();
            root.querySelector(`[data-act="types"][data-sec="${d.sec}"]`)?.focus();
            if (changed) { renderSetup(); scheduleBuild(); }
            break;
        }
        case 'types': {
            const s = sec(d.sec);
            s.types = !s.types;
            renderWhat();
            if (s.types) root.querySelector(`[data-act="role"][data-sec="${d.sec}"][aria-checked="true"]`)?.focus();
            else root.querySelector(`[data-act="types"][data-sec="${d.sec}"]`)?.focus();
            break;
        }
        case 'classic-build': buildClassic(); break;
        case 'classic-forms': exportForms(); break;
        case 'classic-opt': pr.classic[d.v] = !pr.classic[d.v]; renderSetup(); break;
        case 'add-section': pr.sections.push(newSection()); renderWhat(); break;
        case 'letter': {
            const s = sec(d.sec);
            const i = s.letters.indexOf(d.letter);
            if (i >= 0) { if (s.letters.length > 1) s.letters.splice(i, 1); } else s.letters.push(d.letter);
            s.letters.sort();
            renderWhat(); scheduleBuild();
            break;
        }
        case 'remove-skill': sec(d.sec).skills.splice(Number(d.idx), 1); renderWhat(); scheduleBuild(); break;
        case 'skill-options': openOptions(Number(d.sec), Number(d.idx), b); break;
        case 'pick': { const s = sec(d.sec); s.picking = !s.picking; s.menu = ''; renderWhat(); if (s.picking) root.querySelector(`[data-pick="${d.sec}"]`)?.focus(); break; }
        case 'pick-skill': {
            const s = sec(d.sec);
            const [cat, sk] = d.key.split('|');
            if (!s.skills.some((x) => x.categoryId === cat && x.skillId === sk)) s.skills.push({ categoryId: cat, skillId: sk, weight: 1 });
            s.picking = false;
            renderWhat(); scheduleBuild();
            break;
        }
        case 'menu': { const s = sec(d.sec); s.menu = s.menu === d.menu ? '' : d.menu; s.picking = false; renderWhat(); break; }
        case 'add-set': {
            const s = sec(d.sec);
            const src = d.set === '__current' ? fromQueue() : ((savedSets().find((x) => x.id === d.set) || {}).skills || []);
            for (const k of src) if (!s.skills.some((x) => x.categoryId === k.categoryId && x.skillId === k.skillId)) s.skills.push({ categoryId: k.categoryId, skillId: k.skillId, opts: k.opts, weight: k.weight || 1 });
            s.menu = '';
            renderWhat(); scheduleBuild();
            break;
        }
        case 'clear-section': sec(d.sec).skills = []; sec(d.sec).menu = ''; renderWhat(); scheduleBuild(); break;
        case 'remove-section': pr.sections.splice(Number(d.sec), 1); if (!pr.sections.length) pr.sections.push(newSection()); renderWhat(); scheduleBuild(); break;
        case 'size': pr.size = d.v; renderSetup(); scheduleBuild(); break;
        case 'look': pr.look = d.v; renderSetup(); scheduleBuild(); break;
        case 'paper': pr.paper = d.v; renderSetup(); scheduleBuild(); break;
        case 'anchors': if (b.getAttribute('aria-disabled') === 'true') break; pr.anchors = d.v; renderSetup(); scheduleBuild(); break;
        case 'header': pr.header[d.v] = !pr.header[d.v]; renderSetup(); scheduleBuild(); break;
        case 'key': pr.key = !pr.key; if (pr.view === 'key' && !pr.key) pr.view = 0; renderSetup(); scheduleBuild(); break;
        case 'view': pr.view = d.v === 'key' ? 'key' : Number(d.v); showPreview(); break;
        case 'new-numbers': pr.seed = freshSeed(); scheduleBuild(0); break;
        case 'print': doPrint(); break;
        case 'open-tab': openTab(); break;
        default: break;
    }
}

function onChange(e) {
    const t = e.target;
    const d = t.dataset;
    if (d.role !== undefined) { sec(d.role).role = t.value; renderWhat(); scheduleBuild(); }
    else if (d.cols !== undefined) { sec(d.cols).columns = t.value === 'auto' ? 'auto' : Number(t.value); scheduleBuild(); }
    else if (d.pages !== undefined) { sec(d.pages).pages = Number(t.value); scheduleBuild(); }
    else if (d.classic !== undefined) { pr.classic[d.classic] = Number(t.value); }
}

/* ================================================================= what to print */

function renderWhat() {
    const box = root.querySelector('#tvSections');
    box.innerHTML = pr.sections.map((s, i) => sectionHTML(s, i)).join('');
}

function sectionHTML(s, i) {
    const name = `Section ${String.fromCharCode(65 + i)}`;
    const sub = `${ROLE_NAME[s.role] || ''}${s.role === 'more-practice' ? ` · ${s.letters.length} page${s.letters.length === 1 ? '' : 's'}` : s.role === 'independent' ? ` · ${s.pages} page${s.pages === 1 ? '' : 's'}` : ''}`;
    const bad = s.unsupported && s.unsupported.role === s.role ? s.unsupported.why : '';
    const chosen = PAGE_GROUPS.flatMap(([, list]) => list).find(([v]) => v === s.role) || [s.role, ROLE_NAME[s.role] || s.role, ''];
    const typeCards = PAGE_GROUPS.map(([g, list]) => `<div class="tv-ptype-group" role="group" aria-label="${g}"><span class="tv-ptype-h">${g}</span><div class="tv-ptypes">${list.map(([v, l, text]) => {
        const on = s.role === v;
        const why = on && bad ? bad : '';
        return `<button type="button" class="tv-ptype${why ? ' is-unfit' : ''}" role="radio" aria-checked="${on}" data-act="role" data-sec="${i}" data-v="${v}"${why ? ` aria-describedby="tvRoleWhy${i}"` : ''}>
      ${pageThumb(v)}<span><span class="tv-radio-title">${l}</span><span class="tv-radio-text">${text}</span></span></button>`;
    }).join('')}</div></div>`).join('');
    const whyNote = bad ? `<p class="tv-ptype-why" id="tvRoleWhy${i}" role="status">${icon('info', 16)}<span>${esc(bad)}</span></p>` : '';
    const cols = ['auto', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => `<option value="${c}"${String(s.columns) === String(c) ? ' selected' : ''}>${c === 'auto' ? 'Auto' : c}</option>`).join('');
    const pagesPart = s.role === 'more-practice' ? `
  <div>
    <span class="tv-label" id="tvLetters${i}">Practice pages</span>
    <div class="tv-chips tv-letters" role="group" aria-labelledby="tvLetters${i}">${LETTERS.map((L) => `<button type="button" class="tv-chip tv-chip-sm" data-act="letter" data-sec="${i}" data-letter="${L}" aria-pressed="${s.letters.includes(L)}" aria-label="Practice ${L}">${L}</button>`).join('')}</div>
    <p class="tv-cap" style="margin-top:6px;">One page per letter, each with its own numbers.</p>
  </div>` : s.role !== 'independent' ? '' : `
  <div>
    <label class="tv-label" for="tvPages${i}">Pages</label>
    <select id="tvPages${i}" class="tv-select" data-pages="${i}">${[1, 2, 3, 4, 5].map((n) => `<option value="${n}"${s.pages === n ? ' selected' : ''}>${n}</option>`).join('')}</select>
  </div>`;
    const skills = s.skills.map((k, idx) => {
        const hit = findSkill(k.categoryId, k.skillId);
        const label = hit ? hit.label : k.skillId;
        const summary = optionsSummary(k.categoryId, k.skillId, k.opts) || 'Default options';
        const open = s.optionsOpen === String(idx) && typeof window.openSkillOptionsPanel !== 'function';
        return `<div class="tv-set-item" role="group" aria-label="${esc(label)}">
  <div class="tv-set-top">
    <div class="tvp-name" tabindex="0"${tvpAttrs(k.categoryId, k.skillId, k.opts)}><div class="tv-skill-name">${esc(label)}${infoButtonHTML(label)}</div><div class="tv-skill-meta">${esc(summary)}</div></div>
    <button type="button" class="tv-icon-btn" data-act="remove-skill" data-sec="${i}" data-idx="${idx}" aria-label="Remove ${esc(label)} from ${name}">${icon('x', 18)}</button>
  </div>
  <div class="tv-set-tools">
    ${skillHasOfferedOptions(k.categoryId, k.skillId) ? `<button type="button" class="tv-opt-btn" data-act="skill-options" data-sec="${i}" data-idx="${idx}" aria-expanded="${open}" aria-label="Options for ${esc(label)}">${icon('sliders', 16)}<span>Options</span></button>` : ''}
    <span class="tv-cap">${hit ? esc(levelText(hit.level)) + ' · ' + esc(hit.categoryName) : ''}</span>
  </div>
  ${open ? `<div class="tv-opt-panel">${optionsReadOnlyHTML(k.categoryId, k.skillId, k.opts)}</div>` : ''}
</div>`;
    }).join('');
    const sets = savedSets();
    const setMenu = s.menu === 'set' ? `<div class="tv-menu" style="left:0;right:auto;">
      <button type="button" data-act="add-set" data-sec="${i}" data-set="__current"${currentSet().length ? '' : ' disabled'}>Current set (${currentSet().length})</button>
      ${sets.length ? '<hr>' + sets.map((x) => `<button type="button" data-act="add-set" data-sec="${i}" data-set="${esc(x.id)}"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(x.name || 'Untitled set')}</span></button>`).join('') : ''}
    </div>` : '';
    const moreMenu = s.menu === 'more' ? `<div class="tv-menu">
      <button type="button" data-act="clear-section" data-sec="${i}">Clear the skills</button>
      ${pr.sections.length > 1 ? `<button type="button" class="is-danger" data-act="remove-section" data-sec="${i}">Remove ${name}</button>` : ''}
    </div>` : '';
    return `<div class="tv-section" role="group" aria-labelledby="tvSecH${i}">
  <div class="tv-section-head">
    <div><h3 class="tv-h3" id="tvSecH${i}">${name}</h3><div class="tv-cap">${esc(sub)}</div></div>
    <div class="tv-menu-wrap"><button type="button" class="tv-icon-btn" data-act="menu" data-menu="more" data-sec="${i}" aria-label="More actions for ${name}" aria-expanded="${s.menu === 'more'}">${icon('dots', 18)}</button>${moreMenu}</div>
  </div>
  <div>${skills || '<p class="tv-empty">No skills in this section yet.</p>'}</div>
  <div class="tv-row">
    <button type="button" class="tv-btn tv-btn-ghost" data-act="pick" data-sec="${i}" aria-expanded="${!!s.picking}">${icon('plus', 16)}<span>Add a skill</span></button>
    <div class="tv-menu-wrap"><button type="button" class="tv-btn tv-btn-ghost" data-act="menu" data-menu="set" data-sec="${i}" aria-expanded="${s.menu === 'set'}">${icon('layers', 16)}<span>Add a set</span></button>${setMenu}</div>
  </div>
  ${s.picking ? `<div class="tv-search"><label class="tv-sr" for="tvPick${i}">Find a skill</label>${icon('search', 18)}<input id="tvPick${i}" class="tv-input" type="search" data-pick="${i}" placeholder="Search skills" autocomplete="off"></div><div class="tv-pick-results" id="tvPickRes${i}"><p class="tv-cap" style="padding:8px 12px;">Type to search.</p></div>` : ''}
  <div class="tv-divided">
    <span class="tv-label" id="tvRoleL${i}">Page type</span>
    <div class="tv-ptype-now">
      <div class="tv-ptype is-static${bad ? ' is-unfit' : ''}">${pageThumb(chosen[0])}<span><span class="tv-radio-title">${esc(chosen[1])}</span><span class="tv-radio-text">${esc(chosen[2])}</span></span></div>
      <button type="button" class="tv-btn" data-act="types" data-sec="${i}" aria-expanded="${!!s.types}" aria-controls="tvTypes${i}" aria-label="${s.types ? 'Close the page types' : `Change the page type of ${name}`}">${s.types ? `${icon('x', 16)}<span>Close</span>` : '<span>Change</span>'}</button>
    </div>
    ${s.types ? `<div class="tv-ptype-groups" id="tvTypes${i}" role="radiogroup" aria-labelledby="tvRoleL${i}">${typeCards}</div>` : ''}
    ${whyNote}
  </div>
  ${s.role === 'more-practice' ? `<div class="tv-fields-cols"><div><label class="tv-label" for="tvCols${i}">Columns</label><select id="tvCols${i}" class="tv-select" data-cols="${i}">${cols}</select></div></div>${pagesPart}`
        : `<div class="tv-fields-cols"><div><label class="tv-label" for="tvCols${i}">Columns</label><select id="tvCols${i}" class="tv-select" data-cols="${i}">${cols}</select></div>${pagesPart}</div>`}
</div>`;
}

/**
 * A small black-and-white schematic of a page type (decorative: the card names it). Every page
 * is a sheet with a header line; what sits under the header tells the page types apart.
 */
function pageThumb(role) {
    const W = 34, H = 44;
    const line = (x1, y1, x2, y2, w = 1) => `<path d="M${x1} ${y1}H${x2}${y2 !== y1 ? `V${y2}` : ''}" stroke="currentColor" stroke-width="${w}" fill="none"/>`;
    const box = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="none" stroke="currentColor" stroke-width=".9"${extra}/>`;
    const grid = (x, y, w, h, cols, rows) => {
        let g = box(x, y, w, h);
        for (let c = 1; c < cols; c++) g += `<path d="M${x + (w * c) / cols} ${y}v${h}" stroke="currentColor" stroke-width=".7"/>`;
        for (let r = 1; r < rows; r++) g += `<path d="M${x} ${y + (h * r) / rows}h${w}" stroke="currentColor" stroke-width=".7"/>`;
        return g;
    };
    const tag = (t, x = 26, y = 3) => `<rect x="${x}" y="${y}" width="6" height="6" rx="1" fill="currentColor"/><text x="${x + 3}" y="${y + 5}" text-anchor="middle" font-size="5.5" font-weight="700" font-family="system-ui,sans-serif" fill="var(--tv-surface)">${t}</text>`;
    const txt = (y, n = 3, w = 24) => Array.from({ length: n }, (_, k) => line(4, y + k * 3, 4 + (k === n - 1 ? w * 0.6 : w), y + k * 3, .8)).join('');
    let body = '';
    switch (role) {
        case 'more-practice': body = `${tag('A', 4, 3)}${grid(4, 12, 26, 28, 2, 2)}`; break;
        case 'mixed-practice': body = `${grid(4, 11, 26, 12, 3, 1)}${line(4, 26, 30, 26, .6)}${grid(4, 28, 26, 12, 2, 1)}`; break;
        case 'word-problems': body = `${txt(12, 3)}${box(4, 21, 26, 6)}${txt(30, 3)}${box(4, 38, 26, 3)}`; break;
        case 'opener': body = `${box(4, 11, 26, 12)}<text x="17" y="20" text-anchor="middle" font-size="7" font-weight="700" font-family="system-ui,sans-serif" fill="currentColor">?</text>${grid(4, 27, 26, 13, 2, 1)}`; break;
        case 'scripted-model': body = [11, 27].map((y) => `${box(4, y, 12, 12)}${line(18, y + 2, 30, y + 2, .8)}${line(18, y + 5, 30, y + 5, .8)}${line(18, y + 8, 26, y + 8, .8)}`).join(''); break;
        case 'guided': body = `${grid(4, 11, 26, 29, 2, 2)}<path d="M7 16h7M7 19h5" stroke="currentColor" stroke-width=".8" stroke-dasharray="1.2 1"/><path d="M20 16h7" stroke="currentColor" stroke-width=".8" stroke-dasharray="1.2 1.6"/>`; break;
        case 'pre-skill-check': body = [12, 19, 26, 33].map((y) => `${box(4, y, 4, 4)}${line(11, y + 2, 29, y + 2, .8)}`).join(''); break;
        case 'error-analysis': body = `${grid(4, 11, 26, 29, 1, 2)}<path d="M20 15l5 5M25 15l-5 5" stroke="currentColor" stroke-width="1.1"/>${line(8, 17, 16, 17, .8)}`; break;
        case 'review': body = `${grid(4, 11, 12, 13, 1, 1)}${grid(18, 11, 12, 13, 1, 1)}${grid(4, 27, 26, 13, 3, 1)}`; break;
        case 'test': body = `${tag('A')}${grid(4, 12, 26, 28, 2, 3)}`; break;
        case 'test-b': body = `${tag('B')}${grid(4, 12, 26, 28, 2, 3)}`; break;
        case 'fact-rows': body = Array.from({ length: 8 }, (_, k) => line(4, 12 + k * 3.8, 30, 12 + k * 3.8, .7)).join(''); break;
        case 'fact-probe': body = grid(4, 11, 26, 29, 5, 6); break;
        case 'true-false': body = [12, 22, 32].map((y) => `${line(4, y + 2, 20, y + 2, .8)}${box(22, y, 3.5, 4)}${box(26.5, y, 3.5, 4)}`).join(''); break;
        case 'reason-it': body = `${box(4, 11, 26, 9)}${line(4, 25, 30, 25, .7)}${line(4, 30, 30, 30, .7)}${line(4, 35, 30, 35, .7)}${line(4, 40, 22, 40, .7)}`; break;
        case 'stretch': body = `${box(4, 11, 26, 29)}<path d="M9 34l5-6 4 3 6-9" stroke="currentColor" stroke-width="1" fill="none"/>`; break;
        default: body = grid(4, 11, 26, 29, 2, 3);
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" class="tv-ptype-thumb">
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="2" fill="var(--tv-surface)" stroke="currentColor"/>
  ${line(4, 5, 16, 5, 1.1)}${line(4, 8, 22, 8, .7)}${body}
</svg>`;
}

/* ================================================================= classic mixed worksheet
   The older automatic layout, for what the sheet kit does not do yet: several skills mixed on one
   sheet with worked solutions, filling empty space, grouping by maths strand, and versions. It
   runs the legacy engine (generateWorksheetFromSections) directly, in black and white, and opens
   its preview with a teacher toolbar. */

function classicSections() {
    return pr.sections.filter((s) => s.skills.length).map((s, i) => ({
        label: `Section ${String.fromCharCode(65 + i)}`,
        columns: s.columns === 'auto' ? 0 : Number(s.columns) || 0,
        problemCount: pr.classic.count,
        countMode: 'problems',
        pageCount: 1,
        groupByType: true,
        skills: s.skills.map((k) => {
            const hit = findSkill(k.categoryId, k.skillId);
            return {
                categoryId: k.categoryId, skillId: k.skillId,
                skillLabel: hit ? hit.label : k.skillId, categoryName: hit ? hit.categoryName : k.categoryId, categoryIcon: '',
                opts: k.opts && typeof k.opts === 'object' ? k.opts : {}, weight: k.weight > 1 ? k.weight : 1,
            };
        }),
    }));
}

async function buildClassic() {
    const sections = classicSections();
    if (!sections.length) { toast('Add a skill first'); return; }
    if (typeof window.generateWorksheetFromSections !== 'function') { toast('The auto-layout worksheet is not available'); return; }
    const c = pr.classic;
    // The legacy engine reads these switches from window (and the old dialog's boxes, if built).
    const before = { fill: window.printFillBlanks, strand: window.printGroupByStrand };
    const boxes = { fill: document.getElementById('printFillBlanks'), strand: document.getElementById('printGroupByStrand') };
    const boxWas = { fill: boxes.fill ? boxes.fill.checked : null, strand: boxes.strand ? boxes.strand.checked : null };
    window.printFillBlanks = !!c.fill;
    window.printGroupByStrand = !!c.strand;
    if (boxes.fill) boxes.fill.checked = !!c.fill;
    if (boxes.strand) boxes.strand.checked = !!c.strand;
    try {
        await window.generateWorksheetFromSections(sections, c.sets || 1, pr.title.trim(), 'greyscale', pr.key, !!c.worked, true);
        teacherPreviewBar();
    } catch (e) {
        console.warn('[teacher-print] mixed worksheet failed', e);
        toast('Could not build the auto-layout worksheet');
    } finally {
        window.printFillBlanks = before.fill;
        window.printGroupByStrand = before.strand;
        if (boxes.fill) boxes.fill.checked = boxWas.fill;
        if (boxes.strand) boxes.strand.checked = boxWas.strand;
    }
}

/** The classic preview's own toolbar is pupil-app chrome; teacher mode shows this one instead. */
function teacherPreviewBar() {
    const box = document.getElementById('printPreviewContainer');
    if (!box) return;
    let bar = box.querySelector('.tv-classic-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.className = 'tv-classic-bar';
        bar.setAttribute('role', 'toolbar');
        bar.setAttribute('aria-label', 'Auto-layout worksheet');
        box.insertBefore(bar, box.firstChild);
        bar.addEventListener('click', (e) => {
            const b = e.target.closest('button');
            if (!b) return;
            if (b.dataset.cb === 'back') {
                box.style.display = 'none';
                document.body.style.overflow = '';
                root?.querySelector('[data-act="classic-build"]')?.focus();
            } else if (b.dataset.cb === 'print') window.printWorksheet?.();
            else if (b.dataset.cb === 'pdf') window.downloadPDF?.();
        });
    }
    bar.innerHTML = `<div class="tv-row" style="flex-wrap:nowrap;min-width:0;">
    <button type="button" class="tv-btn" data-cb="back">${icon('arrow', 18, ' style="transform:rotate(180deg)"')}<span>Back to Print worksheets</span></button>
    <span class="tv-h3" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Auto-layout worksheet</span></div>
  <div class="tv-row"><button type="button" class="tv-btn" data-cb="pdf">${icon('download', 18)}<span>Download PDF</span></button>
    <button type="button" class="tv-btn tv-btn-primary" data-cb="print">${icon('print', 18)}<span>Print</span></button></div>`;
    // The container stops being inert a microtask after it shows (teacher-shell syncInert).
    setTimeout(() => { try { bar.querySelector('[data-cb="print"]').focus(); } catch (e) { /* */ } }, 0);
}

/** Google Forms: the same mixed problems, handed to the existing export dialog. */
function exportForms() {
    const sections = classicSections();
    if (!sections.length) { toast('Add a skill first'); return; }
    if (typeof window.openGoogleExportModal !== 'function') { toast('Google Forms export is not available'); return; }
    const problems = [];
    let n = 0;
    for (const sec of sections) {
        for (let i = 0; i < pr.classic.count; i++) {
            const k = sec.skills[i % sec.skills.length];
            try {
                const q = generateQuestionFor({ category: k.categoryId, skill: k.skillId, opts: k.opts, seed: (pr.seed + n * 7919) >>> 0, itemIndex: n });
                if (q && (q.text || q.visual)) problems.push({ ...q, skillLabel: q.skillLabel || k.skillLabel });
            } catch (e) { /* skip an item that will not generate */ }
            n++;
        }
    }
    if (!problems.length) { toast('Could not make any questions'); return; }
    window.openGoogleExportModal(problems, 'print', titleOf());
}

function renderPickResults(i, q) {
    const box = root.querySelector(`#tvPickRes${i}`);
    if (!box) return;
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) { box.innerHTML = '<p class="tv-cap" style="padding:8px 12px;">Type to search.</p>'; return; }
    const hits = skillCatalogue().filter((s) => {
        const hay = `${s.label} ${s.categoryName} ${s.skillId.replace(/_/g, ' ')}`.toLowerCase();
        return words.every((w) => hay.includes(w));
    }).slice(0, 40);
    box.innerHTML = hits.length ? hits.map((s) => `<button type="button" data-act="pick-skill" data-sec="${i}" data-key="${esc(s.categoryId + '|' + s.skillId)}"${tvpAttrs(s.categoryId, s.skillId)}><span class="tv-skill-name">${esc(s.label)}</span><br><span class="tv-skill-meta">${esc(levelText(s.level))} · ${esc(s.categoryName)}</span></button>`).join('')
        : '<p class="tv-cap" style="padding:8px 12px;">No skills match.</p>';
}

function openOptions(si, idx, anchor) {
    const s = sec(si);
    const k = s.skills[idx];
    if (!k) return;
    if (typeof window.openSkillOptionsPanel === 'function') {
        window.openSkillOptionsPanel(k.categoryId, k.skillId, anchor, {
            opts: k.opts || null,
            onChange(next) { k.opts = next && typeof next === 'object' ? next : undefined; renderWhat(); scheduleBuild(); },
        });
        return;
    }
    s.optionsOpen = s.optionsOpen === String(idx) ? '' : String(idx);
    renderWhat();
}

/* ================================================================= page setup */

function seg(act, current, list, label) {
    return `<div class="tv-seg" role="radiogroup" aria-label="${label}">${list.map(([v, t, aria]) => `<button type="button" role="radio" data-act="${act}" data-v="${v}" aria-checked="${current === v}"${aria ? ` aria-label="${aria}"` : ''}>${t}</button>`).join('')}</div>`;
}
function check(key, label) {
    const on = !!pr.header[key];
    return `<button type="button" class="tv-check" role="checkbox" aria-checked="${on}" data-act="header" data-v="${key}"><span class="tv-check-box" aria-hidden="true">${icon('check', 14)}</span><span>${label}</span></button>`;
}

function renderSetup() {
    const box = root.querySelector('#tvSetup');
    const pages = last ? last.pages.length : 0;
    const printLabel = pages ? `Print ${pages} pupil page${pages === 1 ? '' : 's'}${pr.key ? ' + key' : ''}` : `Print pupil pages${pr.key ? ' + key' : ''}`;
    box.innerHTML = `
  <div style="padding:24px;display:flex;flex-direction:column;gap:16px;">
    <h2 class="tv-h2" id="tvSetupH">Page setup</h2>
    <div><span class="tv-label">Size</span>${seg('size', pr.size, [['S', 'S', 'Small'], ['M', 'M', 'Medium'], ['L', 'L', 'Large']], 'Size')}</div>
    <div><span class="tv-label">Look</span>${seg('look', pr.look, [['auto', 'Auto'], ['ican', 'I Can'], ['daily', 'Daily']], 'Look')}
      <p class="tv-cap" style="margin-top:6px;">${pr.look === 'daily' ? 'Daily: a light header for everyday practice.' : 'I Can: the title states the goal. Auto uses each page type\'s own look (Daily on fact rows, fact probes and Mixed practice).'}</p></div>
    <div class="tv-fields-2">
      <div><span class="tv-label">Paper</span>${seg('paper', pr.paper, [['A4', 'A4'], ['Letter', 'Letter']], 'Paper')}</div>
    </div>
    ${anchorsHTML()}
    <div class="tv-divided">
      <span class="tv-label">Header</span>
      <div class="tv-fields-2" style="gap:4px 12px;">${check('name', 'Name')}${check('date', 'Date')}${check('score', 'Score')}${check('tab', 'Strand tab')}${check('title', 'Title')}</div>
    </div>
    <div class="tv-setting tv-divided">
      <div><div class="tv-h3" id="tvKeyL">Answer key</div><p class="tv-cap" id="tvKeyD">The same page with the answers written in.</p></div>
      <button type="button" class="tv-switch" role="switch" aria-checked="${pr.key}" aria-labelledby="tvKeyL" aria-describedby="tvKeyD" data-act="key"></button>
    </div>
  </div>
  <div style="padding:16px 24px 24px;border-top:1px solid var(--tv-rule);display:flex;flex-direction:column;gap:8px;">
    <button type="button" class="tv-btn tv-btn-primary tv-btn-block" data-act="print"${pages ? '' : ' aria-disabled="true"'}>${icon('print', 18)}<span>${printLabel}</span></button>
    <button type="button" class="tv-btn tv-btn-block" data-act="open-tab"${pages ? '' : ' aria-disabled="true"'}>${icon('external', 18)}<span>Open in a new tab</span></button>
    <button type="button" class="tv-btn tv-btn-ghost" data-act="new-numbers" style="align-self:center;">${icon('reset', 16)}<span>New numbers</span></button>
  </div>
  ${classicHTML()}`;
    const det = box.querySelector('.tv-extras');
    if (det) det.addEventListener('toggle', () => { pr.classic.open = det.open; });
}

/**
 * Anchor problems (worked examples on the page). The control is disabled, with its reason, when
 * no section can take them: the page type ignores anchors, or no chosen skill has worked steps.
 */
function anchorsHTML() {
    const why = anchorsBlocked();
    const mode = why ? 'off' : (pr.anchors || 'off');
    const opts = [['off', 'Off'], ['side', 'Beside'], ['sections', 'In blocks']];
    const segHtml = `<div class="tv-seg" role="radiogroup" aria-labelledby="tvAnchorL"${why ? ' aria-describedby="tvAnchorWhy"' : ''}>${opts.map(([v, t]) => `<button type="button" role="radio" data-act="anchors" data-v="${v}" aria-checked="${mode === v}"${why ? ' aria-disabled="true" tabindex="-1"' : ''}>${t}</button>`).join('')}</div>`;
    const cap = why ? `<p class="tv-cap tv-cap-why" id="tvAnchorWhy" style="margin-top:6px;">${icon('info', 14)}<span>${esc(why)}</span></p>`
        : `<p class="tv-cap" style="margin-top:6px;">${mode === 'side' ? 'Beside: worked examples next to the problems, with the same steps and easier numbers. The page makes as many as fit.'
            : mode === 'sections' ? 'In blocks: a worked example, then 3 or 4 problems, then the next example. Mixed practice: one example per skill.'
                : 'Worked examples, step by step, on Independent, More Practice and Mixed practice pages. Not scored.'}</p>`;
    return `<div><span class="tv-label" id="tvAnchorL">Anchor problems</span>${segHtml}${cap}</div>`;
}

/** Why anchor problems cannot go on this sheet, or '' when they can. */
function anchorsBlocked() {
    const used = pr.sections.filter((s) => s.skills.length);
    if (!used.length) return 'Add a skill first.';
    const roles = used.filter((s) => ANCHOR_PAGE_TYPES.includes(s.role));
    if (!roles.length) return `${ROLE_NAME[used[0].role] || 'This page type'} does not take worked examples. Use Independent, More Practice or Mixed practice.`;
    const any = roles.some((s) => s.skills.some((k) => hasWorkedSteps(k.categoryId, k.skillId)));
    if (!any) return 'None of the chosen skills has step-by-step worked examples yet.';
    return '';
}

const ANCHOR_PAGE_TYPES = ['independent', 'more-practice', 'mixed-practice'];

function hasWorkedSteps(categoryId, skillId) {
    try {
        const p = getProvider(categoryId, skillId);
        return !!(p && Array.isArray(p.real) && p.real.includes('workedSteps'));
    } catch (e) { return false; }
}

function classicHTML() {
    const c = pr.classic;
    const has = pr.sections.some((s) => s.skills.length);
    const opt = (key, label) => `<button type="button" class="tv-check" role="checkbox" aria-checked="${!!c[key]}" data-act="classic-opt" data-v="${key}"><span class="tv-check-box" aria-hidden="true">${icon('check', 14)}</span><span>${label}</span></button>`;
    const sel = (key, label, list) => `<div><label class="tv-label" for="tvClassic_${key}">${label}</label><select id="tvClassic_${key}" class="tv-select" data-classic="${key}">${list.map(([v, t]) => `<option value="${v}"${c[key] === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>`;
    return `<details class="tv-extras"${c.open ? ' open' : ''}>
    <summary>${icon('chevR', 16)}<span>Auto-layout worksheet and Google Forms</span></summary>
    <div class="tv-extras-body">
      <p class="tv-cap">The older automatic layout: all the skills above on one sheet, in black and white, with worked solutions, versions and more.</p>
      <div class="tv-fields-2">
        ${sel('count', 'Problems per section', [[10, '10'], [15, '15'], [20, '20'], [30, '30'], [40, '40'], [50, '50']])}
        ${sel('sets', 'Versions', [[1, '1 version'], [2, '2 versions'], [5, '5 versions'], [10, '10 versions']])}
      </div>
      <div style="display:flex;flex-direction:column;">
        ${opt('worked', 'Worked solutions in the answer key')}
        ${opt('fill', 'Fill empty space with more problems')}
        ${opt('strand', 'Group problems by maths strand')}
      </div>
      <div class="tv-row">
        <button type="button" class="tv-btn" data-act="classic-build"${has ? '' : ' aria-disabled="true"'}>${icon('sheet', 18)}<span>Build auto-layout worksheet</span></button>
        <button type="button" class="tv-btn" data-act="classic-forms"${has ? '' : ' aria-disabled="true"'}>${icon('upload', 18)}<span>Export to Google Forms</span></button>
      </div>
    </div>
  </details>`;
}

/* ================================================================= build + preview */

function requestFor(s, i) {
    const skills = s.skills.map((k) => {
        // Always an explicit object: a row reset to its defaults here (k.opts undefined) must
        // print the defaults, not fall back to the set's options (generateQuestionFor looks the
        // set up only when it is given no options at all).
        const o = { categoryId: k.categoryId, skillId: k.skillId, opts: k.opts && typeof k.opts === 'object' ? k.opts : {} };
        if (k.weight > 1) o.weight = k.weight;
        return o;
    });
    const h = pr.header;
    return {
        role: s.role,
        sections: [{ skills, columns: s.columns, pages: s.role === 'independent' ? s.pages : undefined }],
        letters: s.role === 'more-practice' ? s.letters.slice() : undefined,
        size: pr.size,
        // 'auto' lets each page type take its own default look (Daily on the fact layouts).
        look: pr.look === 'daily' || pr.look === 'ican' ? pr.look : 'auto',
        paper: pr.paper,
        photocopySafe: pr.photocopySafe,
        anchors: anchorsBlocked() ? 'off' : (pr.anchors || 'off'),
        header: { name: h.name, date: h.date, score: h.score, tab: h.tab ? undefined : false, title: h.title ? (pr.title.trim() || true) : false },
        key: pr.key,
        seed: (pr.seed + i * 7919) >>> 0,
    };
}

function currentReq() {
    const idx = pr.sections.map((s, i) => (s.skills.length ? i : -1)).filter((i) => i >= 0);
    return { paper: pr.paper, parts: idx.map((i) => requestFor(pr.sections[i], i)), idx };
}

async function buildAll(req) {
    const out = { parts: [], pupilHtml: '', keyHtml: '', pages: [], keyPages: 0 };
    for (const [ri, r] of req.parts.entries()) {
        let res;
        try { res = await buildSheet(r); } catch (e) { if (e && typeof e === 'object') e.sectionIndex = req.idx ? req.idx[ri] : ri; throw e; }
        out.parts.push({ res, role: r.role, letters: r.letters });
        out.pupilHtml += res.pupilHtml;
        out.keyHtml += res.keyHtml || '';
        out.keyPages += res.keyPageCount || 0;
        for (let p = 0; p < res.pageCount; p++) {
            out.pages.push(r.role === 'more-practice' && r.letters && r.letters[p] ? `Practice ${r.letters[p]}` : `Page ${out.pages.length + 1}`);
        }
    }
    // Page labels must be unique when several sections repeat a letter.
    const seen = {};
    out.pages = out.pages.map((l) => { seen[l] = (seen[l] || 0) + 1; return seen[l] > 1 ? `${l} (${seen[l]})` : l; });
    return out;
}

function scheduleBuild(delay = 350) {
    clearTimeout(buildTimer);
    buildTimer = setTimeout(runBuild, delay);
}

async function runBuild() {
    const token = ++buildToken;
    const req = currentReq();
    const msg = root.querySelector('#tvPreviewMsg');
    if (!req.parts.length) {
        last = null;
        msg.textContent = 'Add a skill to see the page.';
        msg.hidden = false;
        root.querySelector('#tvFits').innerHTML = '';
        renderTabs(); renderSetup(); loadFrame('');
        return;
    }
    msg.textContent = 'Building the page…';
    msg.hidden = false;
    root.querySelector('#tvStage').dataset.state = 'building';
    try {
        const built = await buildAll(req);
        if (token !== buildToken) return;
        last = built;
        if (pr.sections.some((x) => x.unsupported)) { pr.sections.forEach((x) => { x.unsupported = null; }); renderWhat(); }
        last.req = req;
        if (pr.view !== 'key' && pr.view >= last.pages.length) pr.view = 0;
        if (pr.view === 'key' && !pr.key) pr.view = 0;
        const plain = built.parts.map((p, i) => {
            const line = fitsLine(p.res);
            return built.parts.length > 1 ? `Section ${String.fromCharCode(65 + (req.idx ? req.idx[i] : i))}: ${line}` : line;
        });
        const details = [...new Set(built.parts.flatMap((p) => fitsNotes(p.res)))];
        // A one-page type sized by its tallest item can hold fewer cells than there are skills:
        // say so, rather than let a chosen skill quietly miss the sheet.
        const short = built.parts.map((p, i) => {
            const asked = new Set((req.parts[i].sections[0].skills || []).map((k) => `${k.categoryId}:${k.skillId}`));
            const got = new Set((p.res.items || []).map((it) => it && it.skill).filter(Boolean));
            const n = [...asked].filter((k) => got.has(k)).length;
            if (!p.res.items || n >= asked.size) return '';
            return `Only ${n} of ${asked.size} skills fit on ${ROLE_NAME[p.role] || 'this page type'}${built.parts.length > 1 ? ` (Section ${String.fromCharCode(65 + (req.idx ? req.idx[i] : i))})` : ''}. Independent, More Practice and Mixed practice fit every skill.`;
        }).filter(Boolean);
        root.querySelector('#tvFits').innerHTML = `<span class="tv-fits-line">${plain.map(esc).join('<br>')}</span>${details.length ? `<details class="tv-fits-why"><summary>Why?</summary><ul>${details.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></details>` : ''}${short.length ? `<span class="tv-fits-warn">${icon('info', 16)}<span>${esc(short.join(' '))}</span></span>` : ''}`;
        renderTabs(); renderSetup(); showPreview();
    } catch (e) {
        if (token !== buildToken) return;
        console.warn('[teacher-print] build failed', e);
        last = null;
        // A page type a skill cannot take says why, on its card (the fact layouts need a fact skill).
        if (e && e.unsupported) {
            const si = Number.isInteger(e.sectionIndex) ? e.sectionIndex : 0;
            if (pr.sections[si]) pr.sections[si].unsupported = { role: pr.sections[si].role, why: e.message };
            renderWhat();
        }
        msg.textContent = e && e.unsupported ? `${e.message}` : 'This page could not be built. Try another page type, or the auto-layout worksheet under Page setup.';
        msg.hidden = false;
        root.querySelector('#tvStage').dataset.state = 'error';
        root.querySelector('#tvFits').innerHTML = '';
        loadFrame('');
        renderTabs(); renderSetup();
    }
}

/** One plain line for a built section: "12 problems on 2 pages · 3 columns". */
function fitsLine(res) {
    const f = res.fits || {};
    const n = Array.isArray(res.items) ? res.items.length : 0;
    const pages = res.pageCount || f.pages || 1;
    const parts = [];
    parts.push(n ? `${n} problem${n === 1 ? '' : 's'} on ${pages} page${pages === 1 ? '' : 's'}` : `${pages} page${pages === 1 ? '' : 's'}`);
    // A page mixes groups (Add. / Subtract.), each with its own column count.
    const cols = [...new Set((Array.isArray(f.sections) && f.sections.length ? f.sections.map((x) => x && x.cols) : [f.cols]).filter((c) => c > 0))].sort((a, b) => a - b);
    if (cols.length === 1) parts.push(`${cols[0]} column${cols[0] === 1 ? '' : 's'}`);
    else if (cols.length > 1) parts.push(`${cols[0]} to ${cols[cols.length - 1]} columns`);
    return parts.join(' · ');
}

/**
 * The engine's notes, as short sentences without repeats or layout jargon (for "Why?"). The
 * counts the plain line already gives ("2 columns x 1 rows, 2 per page, 1 page") are dropped.
 */
function fitsNotes(res) {
    const raw = String((res.fits && res.fits.note) || '').replace(/^\s*Fits:\s*/i, '');
    const out = [];
    for (let t of raw.split(/(?<=[.!?])\s+/)) {
        t = t.trim();
        if (!t) continue;
        if (/^\d+\s+columns?\s*[x×]\s*\d+\s+rows?/i.test(t)) {
            // "2 columns x 1 rows, 2 per page, 1 page. Tall problems: …" keeps only what follows.
            t = t.replace(/^\d+\s+columns?\s*[x×]\s*\d+\s+rows?,?\s*(\d+\s+per page,?\s*)?(\d+\s+pages?\.?)?\s*/i, '').trim();
            if (!t) continue;
        }
        t = t.replace(/\bat size ([SML])\b/g, (m, z) => `at size ${z === 'S' ? 'Small' : z === 'M' ? 'Medium' : 'Large'}`)
            .replace(/\bmax (\d+) columns?\b/gi, (m, k) => `at most ${k} column${k === '1' ? '' : 's'}`)
            .replace(/\bstep-by-step steps\b/g, 'worked steps');
        if (!out.includes(t)) out.push(t);
    }
    return out;
}

function renderTabs() {
    const box = root.querySelector('#tvPageTabs');
    if (!last) { box.innerHTML = ''; box.hidden = true; return; }
    box.hidden = false;
    const tabs = last.pages.map((l, i) => [String(i), l]);
    if (pr.key && last.keyHtml) tabs.push(['key', 'Answer keys']);
    const cur = String(pr.view);
    box.innerHTML = tabs.slice(0, 8).map(([v, l]) => `<button type="button" role="radio" data-act="view" data-v="${v}" aria-checked="${cur === v}">${esc(l)}</button>`).join('');
}

function pageDims() {
    return pr.paper === 'Letter' ? { w: 816, h: 1056 } : { w: 794, h: 1123 };
}

function showPreview() {
    renderTabs();
    if (!last) return;
    const isKey = pr.view === 'key';
    const html = isKey ? last.keyHtml : last.pupilHtml;
    const idx = isKey ? 0 : pr.view;
    loadFrame(html, idx);
}

function loadFrame(html, pageIndex = 0) {
    const frame = root.querySelector('#tvPreviewFrame');
    const msg = root.querySelector('#tvPreviewMsg');
    const { w, h } = pageDims();
    frame.style.width = w + 'px';
    frame.style.height = h + 'px';
    fitPreview();
    // An empty preview must not run the last page's onload: it would hide the message that says
    // why there is no page (a fact layout for a non-fact skill).
    if (!html) { frame.onload = null; frame.srcdoc = ''; return; }
    const extra = '<style>body.mq-sheet{background:#fff!important;padding:0!important;overflow:hidden!important}.ws-page{margin:0!important;outline:0!important}</style>';
    const doc = sheetDocument(html, 'Preview', { paper: pr.paper }).replace('</head>', extra + '</head>');
    frame.onload = () => {
        try {
            const pages = frame.contentDocument.querySelectorAll('.ws-page');
            pages.forEach((p, i) => { if (i !== pageIndex) p.style.display = 'none'; });
        } catch (e) { /* preview only */ }
        msg.hidden = true;
        root.querySelector('#tvStage').dataset.state = 'ready';
    };
    frame.srcdoc = doc;
}

function fitPreview() {
    if (!root) return;
    const stage = root.querySelector('#tvStage');
    const box = root.querySelector('#tvPreviewBox');
    const frame = root.querySelector('#tvPreviewFrame');
    if (!stage || !box || !frame || !stage.clientWidth) return;
    const { w, h } = pageDims();
    const avail = stage.clientWidth - 32;
    // Beside the controls (desktop) the whole page stays in view: fit the height too.
    const sticky = getComputedStyle(stage.closest('.tv-preview-card') || stage).position === 'sticky';
    const tabs = root.querySelector('#tvPageTabs');
    const availH = window.innerHeight - 48 - 32 - (tabs && !tabs.hidden ? tabs.offsetHeight + 12 : 0) - 40;
    // Stacked (narrow screens) the preview comes first, so it is kept compact: about half the
    // window height, so the controls start on the same screen.
    const compactH = Math.max(280, Math.round(window.innerHeight * 0.42));
    const s = Math.min(1, avail / w, sticky && availH > 240 ? availH / h : (!sticky ? compactH / h : 1));
    frame.style.transform = `scale(${s})`;
    box.style.width = Math.round(w * s) + 'px';
    box.style.height = Math.round(h * s) + 'px';
}

/* ================================================================= print */

async function printHtml(html, title, paper) {
    const doc = sheetDocument(html, title, { paper });
    let frame = document.getElementById('tvPrintFrame');
    if (!frame) {
        frame = document.createElement('iframe');
        frame.id = 'tvPrintFrame';
        frame.title = 'Print';
        frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
        document.body.appendChild(frame);
    }
    const w = frame.contentWindow;
    w.document.open();
    w.document.write(doc);
    w.document.close();
    const start = Date.now();
    await new Promise((resolve) => {
        const tick = () => {
            const d = w.document;
            const ready = d.readyState === 'complete' && d.documentElement.getAttribute('data-ws-fonts') === 'ready';
            if (ready || Date.now() - start > 6000) resolve(); else setTimeout(tick, 100);
        };
        setTimeout(tick, 150);
    });
    w.focus();
    w.print();
}

function titleOf() {
    if (pr.title.trim()) return pr.title.trim();
    const first = pr.sections.find((s) => s.skills.length);
    const hit = first && findSkill(first.skills[0].categoryId, first.skills[0].skillId);
    return hit ? hit.label : 'Worksheet';
}

async function doPrint() {
    if (!last || !last.pages.length) { toast('Add a skill first'); return; }
    const html = last.pupilHtml + (pr.key ? last.keyHtml : '');
    const title = titleOf();
    rememberPrint(title);
    try { await printHtml(html, title, pr.paper); } catch (e) { console.warn('[teacher-print] print failed', e); toast('Could not open the print dialog'); }
}

function openTab() {
    if (!last || !last.pages.length) return;
    const html = sheetDocument(last.pupilHtml + (pr.key ? last.keyHtml : ''), titleOf(), { paper: pr.paper });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const win = window.open(url, '_blank');
    if (!win) toast('Allow pop-ups to open the pages in a new tab');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function rememberPrint(title) {
    const req = last.req;
    const first = pr.sections.find((s) => s.skills.length);
    const hit = first && findSkill(first.skills[0].categoryId, first.skills[0].skillId);
    const kinds = [...new Set(req.parts.map((p) => (p.role === 'more-practice' ? `More Practice ${p.letters[0]}${p.letters.length > 1 ? '–' + p.letters[p.letters.length - 1] : ''}` : (ROLE_NAME[p.role] || 'Independent'))))];
    const rec = {
        id: 'pr_' + Date.now().toString(36),
        title,
        kind: kinds.join(', '),
        level: hit ? levelText(hit.level) : '',
        pages: last.pages.length,
        key: !!pr.key,
        columns: (last.parts[0] && last.parts[0].res.fits && last.parts[0].res.fits.cols) || null,
        at: Date.now(),
        req,
    };
    const list = recentPrintouts().filter((p) => p && p.title !== title);
    writeStore(PRINTS_KEY, [rec, ...list].slice(0, 10));
}

export function printoutMeta(p) {
    return {
        line1: [p.kind, p.level].filter(Boolean).join(' · '),
        line2: `${p.pages} page${p.pages === 1 ? '' : 's'}${p.key ? ' + key' : ''} · ${fmtDay(p.at)}`,
    };
}
