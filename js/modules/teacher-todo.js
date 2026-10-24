// teacher-todo.js — the "Skills to be made" teacher screen (owner 2026-10-10): every skill or option
// MathQuest still has to build so pupils can practise everything in CCSS, the Wisconsin Essential
// Elements, White Rose and MAP. Read-only: it shows the one de-duplicated list (build-queue.js), lets a
// teacher filter it (source, grade, domain, kind, representation, search), opens each entry's short
// spec, prints the filtered list on a clean page and exports it as CSV.
//
// Reached from the White Rose lessons screen ("To be built: …" links), the MAP page and Home.
// Data loads the first time the screen opens (build list + curated link files), never at boot.

import { icon, esc, toast } from './teacher-ui.js';
import { loadLinksData } from './links-data.js';
import { skillLabelOf } from './teacher-skillpick.js';

let Q = null;          // build-queue.js
let W = null;          // wrm-links.js
let TT = null;         // todo-text.js
let queue = null;      // { items, totals }
let lessonSteps = null;// Set of WRM step ids the White Rose screen can open
let loading = null;
let root = null;

const t = {
    sources: new Set(), grades: new Set(), domains: new Set(), kinds: new Set(), pair: '', q: '',
    open: new Set(), focus: '', last: '',
};

/* ================================================================= hash (critic r6 m11)
 * The screen keeps its place in the URL hash, like White Rose and MAP: #todo, or #todo/<entry id> for the entry
 * opened last. A lesson opened from an entry is a new history entry (#wrm/...), so Back returns here, to that
 * entry, open and focused. */
export function todoHashActive() { return /^#todo(\/|$)/.test(location.hash || ''); }
function writeTodoHash() {
    const h = t.last ? `#todo/${encodeURIComponent(t.last)}` : '#todo';
    if (location.hash !== h) history.replaceState(history.state, '', h);
}
function readTodoHash() {
    const m = /^#todo\/([^/?#]+)/.exec(location.hash || '');
    if (!m) return;
    const id = decodeURIComponent(m[1]);
    t.open.add(id); t.focus = id; t.last = id;
}
/** Leaving the screen: drop the hash (a new entry, so Back returns to the list). */
export function clearTodoHash() {
    if (todoHashActive()) history.pushState(history.state, '', location.pathname + location.search);
}

function load() {
    if (queue) return Promise.resolve();
    if (!loading) {
        loading = Promise.all([import('./build-queue.js'), import('./wrm-links.js'), import('./todo-text.js'), loadLinksData()]).then(([q, w, tt, data]) => {
            Q = q; W = w; TT = tt;
            W.setSkillLabeler(skillLabelOf);
            queue = Q.buildQueue({ curated: Object.values(data.years), map: data.map });
            TT.setTodoNames(queue.items);
            lessonSteps = new Set(W.allLessons().map((l) => l.step).filter(Boolean));
        }).catch((e) => { console.warn('[teacher-todo] load', e); loading = null; });
    }
    return loading;
}

/** T6 redirect: the lesson that holds a "Skills to be made" entry ({site} or {step}), or null (then the list). */
export function todoLessonFor(id) {
    return load().then(() => {
        const e = queue && queue.items.find((x) => x.id === id);
        if (!e) return null;
        if (e.siteLessons && e.siteLessons.length) return { site: e.siteLessons[0] };
        const st = (e.wrmSteps || []).find((x) => lessonSteps && lessonSteps.has(x));
        return st ? { step: st } : null;
    });
}
/** The entry a #todo/<entry> hash names, or ''. */
export function todoHashEntry() { const m = /^#todo\/([^/?#]+)/.exec(location.hash || ''); return m ? decodeURIComponent(m[1]) : ''; }

/** Open the screen at one entry (from a "To be built" link). Filters clear so it is always visible. */
export function openTodo(id) {
    t.sources.clear(); t.grades.clear(); t.domains.clear(); t.kinds.clear(); t.pair = ''; t.q = '';
    t.open.add(id);
    t.focus = id;
    t.last = id;
    window.tvGo?.('todo');
}

/* ================================================================= helpers */

// critic r3 m7, r4 M4/m7: the screen and the print show teachers' words, never code (the CSV keeps the build
// team's spec). The words come from todo-text.js, which the jargon gate (ws-wrm-page-unit) runs over every entry.
const todoName = (e) => TT.todoName(e);
const todoTeaches = (e) => TT.todoTeaches(e);
const todoLooks = (e) => TT.todoLooks(e);
const todoCloses = (e) => TT.todoCloses(e);
const kindLine = (e) => [kindName(e.kind), ...TT.todoKindTail(e)].join(' · ');

/** A source as a teacher reads it: White Rose by name (the chips keep the short codes as their values). */
const srcName = (s) => (s === 'WRM' ? 'White Rose' : s);
const kindName = (k) => (Q.KINDS.find((x) => x[0] === k) || [k, k])[1];
const domName = (d) => (Q.DOMAINS.find((x) => x[0] === d) || [d, d])[1];
// "Not set" (N13) is the chip value 'none': an entry with no grade
function shown() {
    const none = t.grades.has('none');
    const g = new Set([...t.grades].filter((x) => x !== 'none'));
    return queue.items.filter((e) => Q.passes(e, { ...t, grades: new Set() }) && (!t.grades.size || e.grades.some((x) => g.has(x)) || (none && !e.grades.length)));
}
/** The grade an item is listed under: its first grade inside the grade filter (or its first grade). */
function homeGrade(e) {
    const g = t.grades.size ? e.grades.find((x) => t.grades.has(x)) : e.grades[0];
    return g || '';
}
/**
 * m10 (critic r5): unfiltered, an entry is listed under its lowest grade; with grade chips on, under the first
 * ticked grade it reaches — so that heading says "Reaching …" and its count is the chip's count.
 */
const gradeHead = (g) => (t.grades.size && g ? `Reaching ${Q.GRADE_NAMES[g]}` : Q.GRADE_NAMES[g]);
function groupsOf(items) {
    const out = [];
    const order = [...Q.GRADES, ''];
    for (const g of order) {
        const inG = items.filter((e) => homeGrade(e) === g);
        if (!inG.length) continue;
        const doms = Q.DOMAINS.map((d) => [d[0], inG.filter((e) => e.domain === d[0])]).filter((x) => x[1].length);
        out.push({ grade: g, n: inG.length, doms });
    }
    return out;
}
const gradeText = (e) => (e.grades.length ? (e.grades.length > 1 ? `${gradeShort(e.grades[0])}–${gradeShort(e.grades[e.grades.length - 1])}` : gradeShort(e.grades[0])) : '');
const gradeShort = (g) => (g === 'PK' ? 'Pre-K' : g === 'K' ? 'K' : g === '6' ? '6+' : g === 'M' ? 'Several grades' : `Grade ${g}`);

/* ================================================================= render */

export function renderTodoScreen(el) {
    root = el;
    if (todoHashActive()) readTodoHash();
    writeTodoHash();
    if (!el.dataset.built) {
        el.dataset.built = '1';
        el.innerHTML = `<header class="tv-header"><div><h1 class="tv-h1">Skills to be made</h1>
          <p class="tv-sub">Every skill or option still to build so pupils can practise all of CCSS, the Essential Elements, White Rose and MAP. Open one to see what it will do.</p></div>
          <div class="tv-header-actions">
            <button type="button" class="tv-btn" data-t-act="print">${icon('print', 18)}<span>Print list</span></button>
            <button type="button" class="tv-btn" data-t-act="csv">${icon('download', 18)}<span>Download CSV</span></button></div></header>
          <div class="tvt-body" id="tvtBody"><p class="tv-cap">Loading the build list…</p></div>`;
        wire(el);
    }
    load().then(() => {
        if (!queue) { el.querySelector('#tvtBody').innerHTML = '<p class="tv-cap">Could not load the build list. Reload the page to try again.</p>'; return; }
        draw();
        if (t.focus) {
            const it = root.querySelector(`[data-t-item="${CSS.escape(t.focus)}"]`);
            if (it) { it.scrollIntoView({ block: 'center' }); it.querySelector('.tvt-row')?.focus(); }
            t.focus = '';
        }
    });
}

function chips(name, list, set) {
    return list.map(([v, label, title]) => `<button type="button" class="tv-chip tvt-chip" data-t-f="${name}" data-t-v="${esc(v)}" aria-pressed="${set.has(v)}"${title ? ` title="${esc(title)}"` : ''}>${label}</button>`).join('');
}

function draw() {
    const body = root.querySelector('#tvtBody');
    const items = shown();
    const T = queue.totals;
    const filtered = t.sources.size || t.grades.size || t.domains.size || t.kinds.size || t.pair || t.q;
    body.innerHTML = `
      <section class="tvt-totals" aria-label="Totals">
        <div class="tvt-total"><span class="tvt-big">${T.all}</span><span>to make</span></div>
        <div class="tvt-total"><span class="tvt-big">${T.new}</span><span>new skills</span></div>
        <div class="tvt-total"><span class="tvt-big">${T.option}</span><span>options on a skill</span></div>
        <div class="tvt-total tvt-total-src">${Q.SOURCES.map((s) => `<span><b>${T.bySource[s]}</b> ${srcName(s)}</span>`).join('')}<span class="tv-cap">(one entry can close several)</span></div>
      </section>
      <section class="tv-card tvt-filters" aria-label="Filters">
        <div class="tvw-pickrow"><span class="tvw-pick-h" id="tvtSrcH">Source</span><div class="tv-chips" role="group" aria-labelledby="tvtSrcH">${chips('sources', Q.SOURCES.map((s) => [s, srcName(s), { CCSS: 'Common Core standards', EE: 'Wisconsin Essential Elements', WRM: 'White Rose small steps', MAP: 'MAP Growth tasks' }[s]]), t.sources)}</div></div>
        <div class="tvw-pickrow"><span class="tvw-pick-h" id="tvtGrH">Grade</span><div class="tv-chips" role="group" aria-labelledby="tvtGrH">${chips('grades', [...Q.GRADES.map((g) => [g, g === 'PK' ? 'Pre-K' : g === '6' ? '6+' : g]), ['none', 'Not set']], t.grades)}</div></div>
        <div class="tvw-pickrow"><span class="tvw-pick-h" id="tvtDomH">Domain</span><div class="tv-chips" role="group" aria-labelledby="tvtDomH">${chips('domains', Q.DOMAINS.map(([d, n]) => [d, d === 'X' ? 'Beyond K–5' : d, n]), t.domains)}</div></div>
        <div class="tvw-pickrow"><span class="tvw-pick-h" id="tvtKindH">Kind</span><div class="tv-chips" role="group" aria-labelledby="tvtKindH">${chips('kinds', Q.KINDS, t.kinds)}</div></div>
        <div class="tvt-row2">
          <label class="tvt-sel"><span class="tvw-pick-h">Shows</span>
            <select id="tvtPair" class="tv-select" aria-label="Representation pair"><option value="">Any representation</option>${W.REP_PAIRS.map((p) => `<option value="${p.id}"${t.pair === p.id ? ' selected' : ''}>${esc(p.label)}</option>`).join('')}</select></label>
          <div class="tv-search tvt-search"><span aria-hidden="true">${icon('search', 18)}</span><label class="tv-sr" for="tvtQ">Search the list</label>
            <input id="tvtQ" class="tv-input" type="search" autocomplete="off" placeholder="Search: name, standard (3.NF.A.1), White Rose step, MAP task" value="${esc(t.q)}"></div>
          <button type="button" class="tv-btn tv-btn-ghost" data-t-act="clear"${filtered ? '' : ' hidden'}>Clear filters</button>
        </div>
      </section>
      <p class="tvt-count" aria-live="polite" id="tvtCount">${countText(items.length)}</p>
      <div id="tvtList">${listHTML(items)}</div>`;
}

function countText(n) {
    const T = queue.totals;
    const filtered = t.sources.size || t.grades.size || t.domains.size || t.kinds.size || t.pair || t.q;
    return `${filtered ? `Showing ${n} of ${T.all}` : `All ${T.all}`} · ${t.grades.size ? 'each under the first ticked grade it reaches' : 'each under its lowest grade'}, then domain`;
}

function listHTML(items) {
    if (!items.length) return '<div class="tv-card tvw-empty"><div class="tv-h3">Nothing matches</div><p class="tv-cap">Try fewer filters or a shorter search.</p></div>';
    return groupsOf(items).map((g) => `<section class="tvt-grade" aria-labelledby="tvtG-${g.grade || 'none'}">
        <h2 class="tv-h2 tvt-grade-h" id="tvtG-${g.grade || 'none'}">${esc(gradeHead(g.grade))} <span class="tvw-n-sm">${g.n}</span></h2>
        ${g.doms.map(([d, list]) => `<h3 class="tvt-dom-h">${esc(domName(d))} <span class="tvw-n-sm">${list.length}</span></h3>
          <ul class="tvt-list" role="list">${list.map(itemHTML).join('')}</ul>`).join('')}
      </section>`).join('');
}

function itemHTML(e) {
    const open = t.open.has(e.id);
    return `<li class="tvt-item${open ? ' is-open' : ''}" data-t-item="${esc(e.id)}">
      <button type="button" class="tvt-row" aria-expanded="${open}" aria-controls="tvtS-${esc(e.id)}" data-t-open="${esc(e.id)}">
        <span class="tvt-chev" aria-hidden="true">${icon('arrow', 16)}</span>
        <span class="tvt-name">${esc(todoName(e))}</span>
        <span class="tvt-badges"><span class="tvw-tag tvt-kind is-${e.kind}">${esc(kindName(e.kind))}</span>${e.sources.map((s) => `<span class="tvw-tag tvt-src" data-src="${s}">${srcName(s)}</span>`).join('')}<span class="tvt-gr">${esc(gradeText(e))}</span></span>
      </button>
      ${open ? specHTML(e) : ''}</li>`;
}

function specHTML(e) {
    const steps = e.wrmSteps.map((s) => (lessonSteps.has(s)
        ? `<button type="button" class="tvt-step" data-t-step="${esc(s)}" title="Open this lesson on the White Rose screen (${esc(s)})">${esc(Q.stepName(s))}</button>`
        : `<span class="tvw-tag" title="${esc(s)}">${esc(Q.stepName(s))}</span>`)).join(' ');
    const maps = e.map.map((m) => `<li>${esc(TT.mapLine(m))}</li>`).join('');
    // round 7: the school site's own lessons the entry closes open on the White Rose screen
    const lessons = (e.siteLessons || []).map((id) => [id, W.siteLessonLabel(id)]).filter((x) => x[1])
        .map(([id, lab]) => `<button type="button" class="tvt-step" data-t-lesson="${esc(id)}" title="Open this lesson on the White Rose screen">${esc(lab)}</button>`).join(' ');
    const pairs = e.pairs.map((p) => (W.REP_PAIRS.find((x) => x.id === p) || {}).label).filter(Boolean);
    return `<div class="tvt-spec" id="tvtS-${esc(e.id)}">
      <dl class="tvt-dl">
        <dt>Kind</dt><dd>${esc(kindLine(e))}</dd>
        <dt>What pupils will do</dt><dd>${esc(todoTeaches(e))}</dd>
        <dt>Gap it fills</dt><dd>${(() => { const c = todoCloses(e); return c.length > 1 ? `<ul class="tvt-ul">${c.slice(0, 6).map((x) => `<li>${esc(x)}</li>`).join('')}${c.length > 6 ? `<li>and ${c.length - 6} more</li>` : ''}</ul>` : esc(c[0] || ''); })()}</dd>
        ${todoLooks(e) || pairs.length ? `<dt>How it looks</dt><dd>${esc(todoLooks(e))}${pairs.length ? ` <span class="tvw-tag">${esc(pairs.join(' · '))}</span>` : ''}</dd>` : ''}
        ${e.ccss.length || e.ee.length ? `<dt>Standards</dt><dd class="tvt-codes">${[...e.ccss, ...e.ee].map((c) => `<span class="tvw-tag tvw-code">${esc(c)}</span>`).join(' ')}</dd>` : ''}
        ${steps ? `<dt>White Rose steps</dt><dd class="tvt-codes">${steps}</dd>` : ''}
        ${lessons ? `<dt>School lessons</dt><dd class="tvt-codes">${lessons}</dd>` : ''}
        ${maps ? `<dt>MAP tasks</dt><dd><ul class="tvt-ul">${maps}</ul></dd>` : ''}
      </dl>
      <div class="tvt-more" data-t-spec-slot="${esc(e.id)}"></div>
    </div>`;
}

/* ================================================================= print + CSV */

/** The clean printable page of the filtered list (every entry's short spec). */
export function todoPrintHTML() {
    const items = shown();
    const filt = [t.sources.size ? `Source ${[...t.sources].map(srcName).join(', ')}` : '', t.grades.size ? `Grade ${[...t.grades].map((g) => (g === 'none' ? 'not set' : g === '6' ? '6+' : g)).join(', ')}` : '',
        t.domains.size ? `Domain ${[...t.domains].join(', ')}` : '', t.kinds.size ? `Kind ${[...t.kinds].map(kindName).join(', ')}` : '',
        t.pair ? (W.REP_PAIRS.find((p) => p.id === t.pair) || {}).label : '', t.q ? `"${t.q}"` : ''].filter(Boolean).join(' · ');
    const row = (e) => `<div class="it"><h4>${esc(todoName(e))} <small>${esc(kindName(e.kind))} · ${esc(e.sources.map(srcName).join(', '))} · ${esc(gradeText(e))}</small></h4>
      <p><b>What pupils will do:</b> ${esc(todoTeaches(e))}</p><p><b>Gap it fills:</b> ${esc(todoCloses(e).slice(0, 3).join(' · '))}</p>
      ${todoLooks(e) ? `<p><b>How it looks:</b> ${esc(todoLooks(e))}</p>` : ''}
      ${e.ccss.length || e.ee.length || e.wrmSteps.length ? `<p class="c">${esc([...e.ccss, ...e.ee].join(', '))}${e.wrmSteps.length ? ` · White Rose: ${esc(e.wrmSteps.slice(0, 6).map(Q.stepName).join('; '))}${e.wrmSteps.length > 6 ? ' …' : ''}` : ''}</p>` : ''}</div>`;
    const body = groupsOf(items).map((g) => `<h2>${esc(gradeHead(g.grade))} (${g.n})</h2>${g.doms.map(([d, list]) => `<h3>${esc(domName(d))}</h3>${list.map(row).join('')}`).join('')}`).join('');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Skills to be made</title><style>
      body{font:11pt/1.35 Arial,Helvetica,sans-serif;color:#000;margin:14mm}h1{font-size:18pt;margin:0 0 2mm}h2{font-size:14pt;margin:6mm 0 2mm;border-bottom:1px solid #000}
      h3{font-size:12pt;margin:4mm 0 1mm}h4{font-size:11pt;margin:0}h4 small{font-weight:normal;color:#444}.it{break-inside:avoid;padding:2mm 0;border-bottom:1px solid #ccc}
      p{margin:1mm 0}.c{color:#444;font-size:9.5pt}.f{color:#444}@page{size:A4;margin:12mm}</style></head><body>
      <h1>Skills to be made</h1><p class="f">${items.length} of ${queue.totals.all}${filt ? ` · ${esc(filt)}` : ''}</p>${body}</body></html>`;
}

function doPrint() {
    const w = window.open('', '_blank');
    if (!w) { toast('Allow pop-ups to print the list'); return; }
    w.document.open();
    w.document.write(todoPrintHTML());
    w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch (e) { /* closed */ } }, 300);
}

function doCSV() {
    const csv = Q.toCSV(shown());
    const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skills-to-be-made.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(`CSV downloaded · ${shown().length} rows`);
}

/* ================================================================= events */

function redrawList() {
    const items = shown();
    const T = queue.totals;
    const filtered = t.sources.size || t.grades.size || t.domains.size || t.kinds.size || t.pair || t.q;
    root.querySelector('#tvtList').innerHTML = listHTML(items);
    const clr = root.querySelector('[data-t-act="clear"]');
    if (clr) clr.hidden = !filtered;
    root.querySelector('#tvtCount').textContent = countText(items.length);
}

function wire(el) {
    el.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || !el.contains(b) || !queue) return;
        const d = b.dataset;
        if (d.tF) {
            const set = t[d.tF];
            if (set.has(d.tV)) set.delete(d.tV); else set.add(d.tV);
            draw();
            root.querySelector(`[data-t-f="${d.tF}"][data-t-v="${CSS.escape(d.tV)}"]`)?.focus();
            return;
        }
        if (d.tOpen) {
            if (t.open.has(d.tOpen)) { t.open.delete(d.tOpen); if (t.last === d.tOpen) t.last = ''; } else { t.open.add(d.tOpen); t.last = d.tOpen; }
            writeTodoHash();
            const li = b.closest('.tvt-item');
            const e2 = queue.items.find((x) => x.id === d.tOpen);
            li.outerHTML = itemHTML(e2);
            root.querySelector(`[data-t-open="${CSS.escape(d.tOpen)}"]`)?.focus();
            return;
        }
        // m11: the entry the button sits in is the one Back returns to
        if (d.tLesson || d.tStep) { const it = b.closest('[data-t-item]'); if (it) { t.last = it.dataset.tItem; t.open.add(t.last); writeTodoHash(); } }
        if (d.tLesson) {
            import('./teacher-wrm.js').then((m) => m.openWrmLesson(d.tLesson)).then((ok) => { if (!ok) toast('This lesson is not on the White Rose screen'); });
            return;
        }
        if (d.tStep) {
            import('./teacher-wrm.js').then((m) => m.openWrmStep(d.tStep)).then((ok) => { if (!ok) toast('No lesson on the White Rose screen teaches this step'); });
            return;
        }
        if (d.tAct === 'clear') {
            t.sources.clear(); t.grades.clear(); t.domains.clear(); t.kinds.clear(); t.pair = ''; t.q = '';
            draw();
            root.querySelector('#tvtQ')?.focus();
            return;
        }
        if (d.tAct === 'print') { doPrint(); return; }
        if (d.tAct === 'csv') doCSV();
    });
    el.addEventListener('input', (e) => {
        if (e.target.id !== 'tvtQ' || !queue) return;
        t.q = e.target.value.trim();
        redrawList();
    });
    el.addEventListener('change', (e) => {
        if (e.target.id !== 'tvtPair' || !queue) return;
        t.pair = e.target.value;
        draw();
        root.querySelector('#tvtPair')?.focus();
    });
}
