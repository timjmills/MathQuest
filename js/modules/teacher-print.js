// teacher-print.js — the "Print worksheets" screen of the teacher view.
//
// Drives the sheet engine through its app bridge (print-sheet.js):
//   buildSheet(req)    -> {pupilHtml, keyHtml, pageCount, keyPageCount, fits}
//   sheetDocument(html)-> the standalone printable document (A4/Letter, Andika, sheet kit)
// Each section is one buildSheet request (a section carries its own page type), and the
// pupil pages of every section print first, then every answer key.
//
// Page types that work today: Independent and More Practice (the two roles buildSheet knows).
// The other roles are listed, disabled, as "coming soon". Anything not covered here stays
// reachable through the classic print dialog (window.openPrintSettings).
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

const WORKING = new Set(['independent', 'more-practice']);
const PAGE_TYPES = [
    ['Lesson', [['lesson-packet', 'Lesson packet'], ['lesson-opener', 'Lesson opener'], ['model', 'Scripted model'], ['guided', 'Guided'], ['independent', 'Independent'], ['more-practice', 'More Practice'], ['error-analysis', 'Error analysis (Check it)'], ['review', 'Review'], ['test', 'Test A / B'], ['pre-skill', 'Pre-skill check']]],
    ['Practice', [['computation', 'Computation grid'], ['word-problems', 'Word problems'], ['visual-grid', 'Visual grid']]],
    ['Facts', [['fact-rows', 'Fact rows'], ['fact-probe', 'Fact probe']]],
    ['Mixed review', [['mixed', 'Mixed practice'], ['daily4', 'Daily 4'], ['spiral', 'Daily spiral'], ['todays-number', "Today's Number"]]],
    ['Thinking', [['true-false', 'True or False?'], ['reason', 'Reason It'], ['stretch', 'Stretch']]],
];
const ROLE_NAME = { independent: 'Independent', 'more-practice': 'More Practice' };
const LETTERS = 'ABCDEFGHIJ'.split('');

let pr = null;
let root = null;
let buildToken = 0;
let buildTimer = null;
let last = null;     // {sections:[{pupilHtml,keyHtml,pageCount,keyPageCount,fits,role,letters}], pupilHtml, keyHtml, pages:[labels], keyPages}

function newSection(skills = []) {
    return { role: 'more-practice', columns: 'auto', letters: ['A', 'B'], pages: 1, skills, optionsOpen: '', picking: false, menu: '' };
}

function initState() {
    const d = printDefaults();
    pr = {
        title: '',
        sections: [newSection(fromQueue())],
        size: d.size, look: 'auto', paper: d.paper, photocopySafe: d.photocopySafe,
        header: { name: true, date: true, score: true, tab: true, title: true },
        key: true,
        seed: freshSeed(),
        view: 0,          // page index, or 'key'
        versions: 1,
    };
}
function freshSeed() { return Math.floor(Math.random() * 900000) + 100000; }
function fromQueue() {
    return currentSet().map((s) => ({ categoryId: s.categoryId, skillId: s.skillId, opts: s.opts, weight: s.weight > 1 ? s.weight : 1 }));
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
  <div class="tv-header-actions">
    <button type="button" class="tv-btn tv-btn-ghost" data-act="classic">${icon('print', 18)}<span>Classic print dialog</span></button>
  </div>
</header>
<div class="tv-print-grid">
  <section class="tv-card" aria-labelledby="tvWhatH">
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
        case 'classic': window.openPrintSettings?.(); break;
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
}

/* ================================================================= what to print */

function renderWhat() {
    const box = root.querySelector('#tvSections');
    box.innerHTML = pr.sections.map((s, i) => sectionHTML(s, i)).join('');
}

function sectionHTML(s, i) {
    const name = `Section ${String.fromCharCode(65 + i)}`;
    const sub = `${ROLE_NAME[s.role] || ''} · ${s.role === 'more-practice' ? `${s.letters.length} page${s.letters.length === 1 ? '' : 's'}` : `${s.pages} page${s.pages === 1 ? '' : 's'}`}`;
    const typeOptions = PAGE_TYPES.map(([g, list]) => `<optgroup label="${g}">${list.map(([v, l]) => WORKING.has(v)
        ? `<option value="${v}"${s.role === v ? ' selected' : ''}>${l}</option>`
        : `<option value="${v}" disabled title="Coming soon">${l} (coming soon)</option>`).join('')}</optgroup>`).join('');
    const cols = ['auto', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => `<option value="${c}"${String(s.columns) === String(c) ? ' selected' : ''}>${c === 'auto' ? 'Auto' : c}</option>`).join('');
    const pagesPart = s.role === 'more-practice' ? `
  <div>
    <span class="tv-label" id="tvLetters${i}">Practice pages</span>
    <div class="tv-chips tv-letters" role="group" aria-labelledby="tvLetters${i}">${LETTERS.map((L) => `<button type="button" class="tv-chip tv-chip-sm" data-act="letter" data-sec="${i}" data-letter="${L}" aria-pressed="${s.letters.includes(L)}" aria-label="Practice ${L}">${L}</button>`).join('')}</div>
    <p class="tv-cap" style="margin-top:6px;">One page per letter, each with its own numbers.</p>
  </div>` : `
  <div style="max-width:160px;">
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
    <button type="button" class="tv-opt-btn" data-act="skill-options" data-sec="${i}" data-idx="${idx}" aria-expanded="${open}" aria-label="Options for ${esc(label)}">${icon('sliders', 16)}<span>Options</span></button>
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
  <div class="tv-fields-type">
    <div><label class="tv-label" for="tvRole${i}">Page type</label><select id="tvRole${i}" class="tv-select" data-role="${i}">${typeOptions}</select></div>
    <div><label class="tv-label" for="tvCols${i}">Columns</label><select id="tvCols${i}" class="tv-select" data-cols="${i}">${cols}</select></div>
  </div>
  ${pagesPart}
  <div>${skills || '<p class="tv-empty">No skills in this section yet.</p>'}</div>
  <div class="tv-row">
    <button type="button" class="tv-btn tv-btn-ghost" data-act="pick" data-sec="${i}" aria-expanded="${!!s.picking}">${icon('plus', 16)}<span>Add a skill</span></button>
    <div class="tv-menu-wrap"><button type="button" class="tv-btn tv-btn-ghost" data-act="menu" data-menu="set" data-sec="${i}" aria-expanded="${s.menu === 'set'}">${icon('layers', 16)}<span>Add a set</span></button>${setMenu}</div>
  </div>
  ${s.picking ? `<div class="tv-search"><label class="tv-sr" for="tvPick${i}">Find a skill</label>${icon('search', 18)}<input id="tvPick${i}" class="tv-input" type="search" data-pick="${i}" placeholder="Search skills" autocomplete="off"></div><div class="tv-pick-results" id="tvPickRes${i}"><p class="tv-cap" style="padding:8px 12px;">Type to search.</p></div>` : ''}
</div>`;
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
      <p class="tv-cap" style="margin-top:6px;">${pr.look === 'daily' ? 'Daily: a light header for everyday practice.' : 'I Can: the title states the goal. Auto uses I Can on these pages.'}</p></div>
    <div class="tv-fields-2">
      <div><span class="tv-label">Paper</span>${seg('paper', pr.paper, [['A4', 'A4'], ['Letter', 'Letter']], 'Paper')}</div>
      <div><label class="tv-label" for="tvVersions">Versions</label><select id="tvVersions" class="tv-select"><option selected>1 version</option><option disabled title="Coming soon">5 versions (coming soon)</option><option disabled title="Coming soon">10 versions (coming soon)</option></select></div>
    </div>
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
  </div>`;
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
        look: pr.look === 'daily' ? 'daily' : 'ican',
        paper: pr.paper,
        photocopySafe: pr.photocopySafe,
        header: { name: h.name, date: h.date, score: h.score, tab: h.tab ? undefined : false, title: h.title ? (pr.title.trim() || true) : false },
        key: pr.key,
        seed: (pr.seed + i * 7919) >>> 0,
    };
}

function currentReq() {
    return { paper: pr.paper, parts: pr.sections.map((s, i) => (s.skills.length ? requestFor(s, i) : null)).filter(Boolean) };
}

async function buildAll(req) {
    const out = { parts: [], pupilHtml: '', keyHtml: '', pages: [], keyPages: 0 };
    for (const r of req.parts) {
        const res = await buildSheet(r);
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
        last.req = req;
        if (pr.view !== 'key' && pr.view >= last.pages.length) pr.view = 0;
        if (pr.view === 'key' && !pr.key) pr.view = 0;
        const fits = built.parts.map((p, i) => {
            const note = p.res.fits && p.res.fits.note ? p.res.fits.note.replace(/^\s*Fits:\s*/i, '') : `${p.res.pageCount} page${p.res.pageCount === 1 ? '' : 's'}`;
            return built.parts.length > 1 ? `Section ${String.fromCharCode(65 + i)}: ${note}` : note;
        }).join(' ');
        root.querySelector('#tvFits').innerHTML = `<strong>Fits:</strong> ${esc(fits)}`;
        renderTabs(); renderSetup(); showPreview();
    } catch (e) {
        if (token !== buildToken) return;
        console.warn('[teacher-print] build failed', e);
        last = null;
        msg.textContent = 'This page could not be built. Try another page type or use the classic print dialog.';
        msg.hidden = false;
        renderTabs(); renderSetup();
    }
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
    if (!html) { frame.srcdoc = ''; return; }
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
    const s = Math.min(1, avail / w);
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
    const kinds = [...new Set(req.parts.map((p) => (p.role === 'more-practice' ? `More Practice ${p.letters[0]}${p.letters.length > 1 ? '–' + p.letters[p.letters.length - 1] : ''}` : 'Independent')))];
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
