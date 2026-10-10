// teacher-wrm.js — the "White Rose lessons" teacher screen (owner request 2026-10-10: "an easy page
// to see by grade, domain, small step all the skills that are tagged to it ... thumbnail of all
// direct skills, prerequisite skills, and related skills ... so teachers can assign or print practice").
//
//   Find     Grade chips → domain-unit chips (the school's teaching order from the K–5 domain-sequence
//            workbook) → the unit's lessons in week order; or the search box (lesson title, CCSS
//            code, unit name) jumps straight to a lesson.
//   See      the lesson: week, strands (Standard / Priority / Intervention), power standard, CCSS,
//            Open lesson / Teaching guide / Video (the school's White Rose Drive files, new tab), and
//            three groups of skills: "Skills that teach this lesson" (direct), "Skills to do first"
//            (prerequisites) and "Skills that go with it" (related) — wrm-links.js decides them.
//   Act      tick skills (or a quick group: Teach / Do first / Go with it / Everything) and make a
//            Practice link (the existing share-link flow, so pupils land in the unchanged pupil
//            flow) or Print (the Print worksheets screen, one mixed section). Each skill card has its
//            own Practice link and Print buttons.
//
// The choice lives in the URL hash (#wrm/<grade>/<unit>/<lesson>) so a teacher can bookmark or share
// it and Back works. The sequence and link data (~350 KB with standards) load the first time the
// screen opens, never at boot.

import { state } from './state.js';
import { icon, esc, toast, copyText, findSkill, levelText, loadSetIntoQueue, currentSet } from './teacher-ui.js';
import { printSkills } from './teacher-print.js';
import { skillView, setSkillView, viewToggleHTML, lazyThumbs, tvpAttrs, infoButtonHTML } from './teacher-preview.js';

let L = null;          // the wrm-links.js module
let SEQ = null;        // the wrm-sequence-db.js module
let loading = null;
let root = null;

const GRADE_LABEL = { PK: 'Pre-K', K: 'K', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' };
const STRAND = { S: 'Standard', P: 'Priority', I: 'Intervention' };
const GROUPS = [
    ['direct', 'Skills that teach this lesson', 'Practise the lesson itself.'],
    ['prereq', 'Skills to do first', 'Earlier learning this lesson builds on — from the week\'s support-block lessons and the lessons just before it.'],
    ['related', 'Skills that go with it', 'Same standard, or the next lessons in this unit.'],
];

const v = {
    grade: '', unit: '', lesson: '',  // lesson key
    view: skillView(),
    ticked: new Set(),               // 'categoryId|skillId'
    link: '',                        // the last practice link made
    linkNote: '',
    query: '',
};
let links = null;                    // linksFor(current lesson)

function load() {
    if (L) return Promise.resolve();
    if (!loading) {
        loading = Promise.all([import('./wrm-links.js'), import('./wrm-sequence-db.js')]).then(async ([a, b]) => {
            L = a; SEQ = b;
            // Curated links (data/curriculum/links/<YEAR>.json): only the years the module lists, so a
            // missing file never costs a failed request.
            await Promise.all((L.CURATED_YEARS || []).map((y) => fetch(`data/curriculum/links/${y}.json`)
                .then((r) => (r.ok ? r.json() : null)).then((d) => L.addCuratedYear(d)).catch(() => null)));
        }).catch((e) => { console.warn('[teacher-wrm] load', e); loading = null; });
    }
    return loading;
}

/* ================================================================= hash */

export function wrmHashActive() { return /^#wrm(\/|$)/.test(location.hash || ''); }

function readHash() {
    const m = /^#wrm(?:\/([^/]*))?(?:\/([^/]*))?(?:\/(\d+))?/.exec(location.hash || '');
    if (!m) return;
    const grade = decodeURIComponent(m[1] || '');
    const unit = decodeURIComponent(m[2] || '');
    if (grade && SEQ.WRM_SEQUENCE.some((g) => g.id === grade)) v.grade = grade;
    if (unit && unitsOf(v.grade).some((u) => u.id === unit)) v.unit = unit;
    const key = m[3] ? `${v.grade}:${v.unit}:${m[3]}` : '';
    v.lesson = key && L.lessonByKey(key) ? key : '';
}

function writeHash(replace) {
    let h = '#wrm';
    if (v.grade) h += `/${encodeURIComponent(v.grade)}`;
    if (v.grade && v.unit) h += `/${encodeURIComponent(v.unit)}`;
    if (v.lesson) h += `/${v.lesson.split(':')[2]}`;
    if (location.hash === h) return;
    if (replace) history.replaceState(history.state, '', h);
    else history.pushState(history.state, '', h);
}

/** Leaving the screen: drop the #wrm hash so the other screens keep a clean URL. It is a new
 *  history entry, so Back returns to the lesson the teacher was on. */
export function clearWrmHash() {
    if (wrmHashActive()) history.pushState(history.state, '', location.pathname + location.search);
}

/* ================================================================= data helpers */

function grades() { return SEQ.WRM_SEQUENCE; }
function gradeRec() { return grades().find((g) => g.id === v.grade) || null; }
function unitsOf(gid) { const g = grades().find((x) => x.id === gid); return g ? g.units : []; }
function unitRec() { return unitsOf(v.grade).find((u) => u.id === v.unit) || null; }
function lessonsOf(u) { return u.lessons.map((_, i) => L.lessonByKey(`${v.grade}:${u.id}:${i + 1}`)); }
const live = (key) => { const [c, s] = key.split(':'); return !!findSkill(c, s); };
const k2p = (key) => key.replace(':', '|');

function directCount(lesson) {
    if (!lesson.step) return 0;
    const c = L.curatedFor(lesson.step);
    if (c) return (c.direct || []).length + (c.partial || []).length;
    return L.linksFor(lesson, { live }).direct.length;
}

/* ================================================================= render */

export function renderWrmScreen(el) {
    root = el;
    if (!el.dataset.built) {
        el.dataset.built = '1';
        el.innerHTML = `<header class="tv-header"><div><h1 class="tv-h1">White Rose lessons</h1>
          <p class="tv-sub">Choose a grade, a unit and a lesson to see the skills that teach it. Tick skills, then make a practice link or print.</p></div></header>
          <div class="tvw-body" id="tvwBody"><p class="tv-cap">Loading the lessons…</p></div>`;
        wire(el);
    }
    v.view = skillView();
    load().then(() => {
        if (!L) { el.querySelector('#tvwBody').innerHTML = '<p class="tv-cap">Could not load the lessons. Reload the page to try again.</p>'; return; }
        if (wrmHashActive()) readHash();
        if (!v.grade) v.grade = '2';
        if (!v.unit || !unitRec()) v.unit = (unitsOf(v.grade)[0] || {}).id || '';
        writeHash(true);
        draw();
    });
}

/** Re-read the hash (Back / Forward / a pasted link). */
export function wrmOnHashChange() {
    if (!L || !root || !root.isConnected) return;
    const before = `${v.grade}|${v.unit}|${v.lesson}`;
    readHash();
    if (`${v.grade}|${v.unit}|${v.lesson}` !== before) { v.ticked.clear(); v.link = ''; draw(); }
}

function draw() {
    const body = root.querySelector('#tvwBody');
    body.innerHTML = `
      <div class="tvw-find">
        <div class="tv-search tvw-search"><span aria-hidden="true">${icon('search', 18)}</span>
          <label class="tv-sr" for="tvwSearch">Find a lesson</label>
          <input id="tvwSearch" class="tv-input" type="search" autocomplete="off" placeholder="Find a lesson: title, unit or standard (e.g. 3.NF.A.1)" value="${esc(v.query)}" aria-controls="tvwHits">
          <ul class="tvw-hits" id="tvwHits" role="listbox" aria-label="Lessons found" hidden></ul></div>
        <div class="tvw-pick">
          <div class="tvw-pickrow"><span class="tvw-pick-h" id="tvwGradeH">Grade</span>
            <div class="tv-chips" role="group" aria-labelledby="tvwGradeH">${grades().map((g) => `<button type="button" class="tv-chip" data-w-grade="${esc(g.id)}" aria-pressed="${g.id === v.grade}" aria-label="${esc(g.label)}">${esc(GRADE_LABEL[g.id] || g.id)}</button>`).join('')}</div></div>
          <div class="tvw-pickrow"><span class="tvw-pick-h" id="tvwUnitH">Unit</span>
            <div class="tv-chips tvw-units" role="group" aria-labelledby="tvwUnitH">${unitChips()}</div></div>
        </div>
      </div>
      <div class="tvw-grid">
        <nav class="tv-card tv-flush tvw-lessons" aria-labelledby="tvwUnitTitle" id="tvwLessons">${lessonListHTML()}</nav>
        <section class="tvw-detail" id="tvwDetail" aria-live="polite">${detailHTML()}</section>
      </div>`;
    afterDetail();
    const cur = body.querySelector('.tvw-lesson[aria-current="true"]');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
}

function unitChips() {
    const units = unitsOf(v.grade);
    // Pre-K comes from the site preview: many small units per domain → one chip per domain.
    if (v.grade === 'PK') {
        const doms = [...new Set(units.map((u) => u.domain))];
        const curDom = (unitRec() || {}).domain;
        return doms.map((d) => { const u = units.find((x) => x.domain === d); return `<button type="button" class="tv-chip tvw-unit" data-w-unit="${esc(u.id)}" aria-pressed="${d === curDom}" title="${esc(L.domainName(d))}"><b>${esc(d)}</b><span>${esc(L.domainName(d))}</span></button>`; }).join('');
    }
    return units.map((u) => `<button type="button" class="tv-chip tvw-unit" data-w-unit="${esc(u.id)}" aria-pressed="${u.id === v.unit}" title="${esc(u.name)}">
        <b>${esc(u.id === 'E' ? 'E' : u.id)}</b><span>${esc(u.id === 'E' ? 'Enrichment' : L.domainName(u.domain))}</span></button>`).join('');
}

function lessonRowHTML(l) {
    const n = directCount(l);
    const gap = l.type === 'build' ? 'CCSS lesson to be built' : !l.step ? 'Not a White Rose step' : n ? '' : 'No skill yet';
    const meta = [l.weeks.length ? l.weeks[0] : '', l.strands ? l.strands.split('').join(' ') : ''].filter(Boolean).join(' · ');
    return `<li><button type="button" class="tvw-lesson${gap ? ' is-gap' : ''}" data-w-lesson="${esc(l.key)}"${l.key === v.lesson ? ' aria-current="true"' : ''}>
      <span class="tvw-n">${l.n}</span>
      <span class="tvw-lt"><span class="tvw-lt-title">${esc(l.title)}</span>
        <span class="tvw-lt-meta">${esc(meta)}${l.power ? ' <span class="tvw-tag tvw-power">Power</span>' : ''}${l.type === 'copied' ? ` <span class="tvw-tag">From ${esc(l.from)}</span>` : ''}</span></span>
      <span class="tvw-count${gap ? ' is-gap' : ''}">${gap ? esc(gap) : `${n} skill${n === 1 ? '' : 's'}`}</span></button></li>`;
}

function lessonListHTML() {
    const u = unitRec();
    if (!u) return '<p class="tv-cap tvw-pad">This grade has no lessons yet.</p>';
    if (v.grade === 'PK') {
        const units = unitsOf('PK').filter((x) => x.domain === u.domain);
        return `<h2 class="tv-h3 tvw-unit-title" id="tvwUnitTitle">${esc(L.domainName(u.domain))}</h2>
          ${units.map((x) => `<h3 class="tvw-sub-h">${esc(x.name.replace(/^[^:]*:\s*/, ''))}</h3><ol class="tvw-list">${lessonsOf(x).map(lessonRowHTML).join('')}</ol>`).join('')}`;
    }
    return `<h2 class="tv-h3 tvw-unit-title" id="tvwUnitTitle">${esc(u.id === 'E' ? 'Enrichment lessons (after MAP)' : `${u.id} ${u.name}`)}</h2>
      <p class="tv-cap tvw-pad">${esc(u.weeks || '')}${u.power && u.power.length ? ` · Power standards ${esc(u.power.join(', '))}` : ''}</p>
      <ol class="tvw-list">${lessonsOf(u).map(lessonRowHTML).join('')}</ol>`;
}

function detailHTML() {
    const l = v.lesson ? L.lessonByKey(v.lesson) : null;
    if (!l) {
        links = null;
        return `<div class="tv-card tvw-empty"><span class="tv-empty-icon" aria-hidden="true">${icon('book', 22)}</span>
          <div class="tv-h3">Choose a lesson</div><p class="tv-cap">Pick a lesson on the left, or find one with the search box. You will see the skills that teach it, the skills to do first and the skills that go with it.</p></div>`;
    }
    links = L.linksFor(l, { live });
    const files = l.step ? (SEQ.WRM_STEP_FILES[l.step] || []) : [];
    const fileBtn = (id, label, ic, url) => (id ? `<a class="tv-btn${label === 'Open lesson' ? ' tv-btn-primary' : ''}" href="${esc(url || `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`)}" target="_blank" rel="noopener">${icon(ic, 18)}<span>${label}</span></a>` : '');
    const ee = (links.step && links.step.ee) || [];
    const strands = l.strands.split('').map((s) => STRAND[s]).filter(Boolean);
    const verdict = l.type === 'build'
        ? 'A CCSS lesson the school is still to write — there is no White Rose lesson for it.'
        : links.verdict === 'full' ? '' : links.verdict === 'partial' ? `These skills cover part of the lesson${links.missing ? `: not yet ${esc(links.missing)}` : ''}.` : 'No skill teaches this lesson yet.';
    const build = links.build.length ? `<p class="tvw-tbb">To be built: ${links.build.map((id) => esc(L.proposalName(id))).join(', ')}</p>` : '';
    const u = unitRec();
    return `<div class="tv-card tvw-head">
        <p class="tvw-kicker">${esc(gradeRec().label)} · ${esc(u.id === 'E' ? 'Enrichment' : `${u.id} ${L.domainName(u.domain)}`)}${l.weeks.length ? ` · Week ${esc(l.weeks.map((w) => w.replace(/^W0?/, '')).join(', '))}` : ''}</p>
        <h2 class="tv-h2 tvw-title"><span class="tvw-title-n">Lesson ${l.n}</span> ${esc(l.title)}</h2>
        <div class="tvw-tags">
          ${l.power ? '<span class="tvw-tag tvw-power">Power standard</span>' : ''}
          ${l.type === 'copied' ? `<span class="tvw-tag">Copied in from ${esc(l.from)} — teach it from that grade's files</span>` : ''}
          ${l.type === 'enrich' ? '<span class="tvw-tag">Enrichment (after MAP)</span>' : ''}
          ${strands.length ? `<span class="tvw-tag tvw-strand">${esc(strands.join(' · '))}</span>` : ''}
          ${l.ccss.map((c) => `<span class="tvw-tag tvw-code">${esc(c)}</span>`).join('')}
          ${ee.slice(0, 3).map((c) => `<span class="tvw-tag tvw-code tvw-ee">${esc(c.replace(/^M\./, ''))}</span>`).join('')}
        </div>
        ${files.length ? `<div class="tvw-files">${fileBtn(files[0], 'Open lesson', 'external')}${fileBtn(files[1], 'Teaching guide', 'book')}${files[2] ? fileBtn('x', 'Video', 'play', files[2]) : ''}</div>` : ''}
        ${verdict ? `<p class="tvw-verdict${links.verdict === 'gap' || l.type === 'build' ? ' is-gap' : ''}">${verdict}</p>` : ''}${build}
      </div>
      <div class="tvw-quick" role="group" aria-label="Tick a group of skills">
        <span class="tvw-pick-h">Tick</span>
        <button type="button" class="tv-btn tv-btn-sm" data-w-quick="direct">All teaching skills</button>
        <button type="button" class="tv-btn tv-btn-sm" data-w-quick="prereq">Do-first skills</button>
        <button type="button" class="tv-btn tv-btn-sm" data-w-quick="related">Go-with skills</button>
        <button type="button" class="tv-btn tv-btn-sm" data-w-quick="all">Everything</button>
        <button type="button" class="tv-btn tv-btn-sm tv-btn-ghost" data-w-quick="none">Clear</button>
        <span class="tvw-viewtog">${viewToggleHTML(v.view)}</span>
      </div>
      ${GROUPS.map(([g, h, cap]) => groupHTML(g, h, cap)).join('')}
      <div class="tv-actionbar tvw-bar" id="tvwBar">${barHTML()}</div>`;
}

function groupHTML(g, h, cap) {
    const list = links[g];
    const n = list.length;
    const allOn = n && list.every((x) => v.ticked.has(k2p(x.key)));
    const empty = g === 'direct'
        ? (L.lessonByKey(v.lesson).type === 'build' ? 'No skill yet: this lesson is still to be written.' : 'No skill teaches this lesson yet. The skills below still help.')
        : g === 'prereq' ? 'No earlier skills found for this lesson.' : 'No other skills share this lesson\'s standard.';
    const pre = g === 'prereq' && links.preBuild.length ? `<p class="tvw-tbb">To be built: ${links.preBuild.map((id) => esc(L.proposalName(id))).join(', ')}</p>` : '';
    return `<section class="tvw-group" aria-labelledby="tvwH-${g}" data-w-group="${g}">
      <div class="tvw-group-head"><div><h3 class="tv-h3" id="tvwH-${g}">${h} <span class="tvw-n-sm">${n}</span></h3><p class="tv-cap">${cap}</p></div>
        ${n ? `<button type="button" class="tv-check" role="checkbox" aria-checked="${allOn}" data-w-all="${g}"><span class="tv-check-box" aria-hidden="true">${icon('check', 14)}</span><span>Select all</span></button>` : ''}</div>
      ${n ? (v.view === 'thumbs' ? `<ul class="tvw-cards" role="list">${list.map((x) => cardHTML(x, g)).join('')}</ul>` : `<ul class="tvw-rows" role="list">${list.map((x) => rowHTML(x, g)).join('')}</ul>`) : `<p class="tvw-none">${empty}</p>`}${pre}
    </section>`;
}

function skillBits(x) {
    const [c, s] = x.key.split(':');
    const sk = findSkill(c, s);
    return { c, s, sk, p: k2p(x.key), on: v.ticked.has(k2p(x.key)), opts: x.opts && Object.keys(x.opts).length ? x.opts : null };
}

function tickHTML(b, label) {
    return `<button type="button" class="tv-check tvw-tick" role="checkbox" aria-checked="${b.on}" data-w-tick="${esc(b.p)}" aria-label="Tick ${esc(label)}"><span class="tv-check-box" aria-hidden="true">${icon('check', 14)}</span></button>`;
}

function quickHTML(b, label) {
    return `<span class="tvw-q"><button type="button" class="tv-btn tv-btn-sm" data-w-one="link" data-w-key="${esc(b.p)}" aria-label="Practice link for ${esc(label)}">${icon('link', 16)}<span>Practice</span></button>
      <button type="button" class="tv-btn tv-btn-sm" data-w-one="print" data-w-key="${esc(b.p)}" aria-label="Print ${esc(label)}">${icon('print', 16)}<span>Print</span></button></span>`;
}

function why(x, g) {
    if (g === 'direct') return x.partial ? ` · <span class="tvw-tag tvw-part">Covers part</span> <span class="tvw-why">${esc(x.partial)}</span>` : '';
    return x.why ? ` · <span class="tvw-why">${esc(x.why)}</span>` : '';
}

function cardHTML(x, g) {
    const b = skillBits(x);
    const label = b.sk ? b.sk.label : x.key;
    const o = b.opts ? ` data-tvp-opts="${esc(JSON.stringify(b.opts))}"` : '';
    return `<li class="tvw-card${b.on ? ' is-on' : ''}">
      <div class="tvw-card-top">${tickHTML(b, label)}<span class="tvw-card-name">${esc(label)}</span></div>
      <button type="button" class="tvw-thumbbtn" data-w-tick="${esc(b.p)}" aria-hidden="true" tabindex="-1"><span class="tvp-frame tvp-thumb" data-tvp-lazy="${esc(b.p)}"${o}></span></button>
      <p class="tvw-card-meta">${esc(b.sk ? levelText(b.sk.level) : '')} ${why(x, g)}</p>
      ${quickHTML(b, label)}</li>`;
}

function rowHTML(x, g) {
    const b = skillBits(x);
    const label = b.sk ? b.sk.label : x.key;
    return `<li class="tvw-row${b.on ? ' is-on' : ''}"${tvpAttrs(b.c, b.s, b.opts)}>${tickHTML(b, label)}
      <span class="tvw-row-main" data-tvp-anchor><span class="tvw-row-name">${esc(label)}</span><span class="tvw-row-meta">${esc(b.sk ? levelText(b.sk.level) : '')} ${why(x, g)}</span></span>
      ${infoButtonHTML(label)}${quickHTML(b, label)}</li>`;
}

function barHTML() {
    const n = v.ticked.size;
    // One row, so the bar stays short on a 768 px Chromebook screen: once a link is made, the link
    // box takes the place of the count (the count stays in the box's label).
    const count = n ? `${n} skill${n === 1 ? '' : 's'} ticked` : 'Tick the skills you want';
    const left = v.link
        ? `<div class="tvw-linkbox"><label class="tvw-link-l" for="tvwLink">${esc(v.linkNote || 'Practice link for pupils')}</label>
            <div class="tvw-linkrow"><input id="tvwLink" class="tv-input tvw-link" readonly value="${esc(v.link)}">
            <button type="button" class="tv-btn" data-w-act="copy">${icon('copy', 18)}<span>Copy</span></button></div></div>`
        : `<div class="tv-actionbar-text"><div class="tv-h3">${count}</div>
            <p class="tv-cap">${n > 1 ? 'They will be mixed together.' : n ? 'One skill.' : 'Then make a practice link or print.'}</p></div>`;
    return `${left}
      <div class="tv-row tvw-bar-btns">
        <button type="button" class="tv-btn tv-btn-primary" data-w-act="link"${n ? '' : ' aria-disabled="true"'}>${icon('link', 18)}<span>Practice link</span></button>
        <button type="button" class="tv-btn" data-w-act="print"${n ? '' : ' aria-disabled="true"'}>${icon('print', 18)}<span>Print</span></button></div>`;
}

function afterDetail() {
    const d = root.querySelector('#tvwDetail');
    if (d && v.view === 'thumbs') lazyThumbs(d, null);
}

function redrawDetail() {
    const d = root.querySelector('#tvwDetail');
    d.innerHTML = detailHTML();
    afterDetail();
}

function redrawBar() {
    const bar = root.querySelector('#tvwBar');
    if (bar) bar.innerHTML = barHTML();
}

/* ================================================================= actions */

function itemsFor(keys) {
    const all = links ? [...links.direct, ...links.prereq, ...links.related] : [];
    return keys.map((p) => {
        const [c, s] = p.split('|');
        const hit = all.find((x) => x.key === `${c}:${s}`);
        const item = { categoryId: c, skillId: s, weight: 1 };
        if (hit && hit.opts && Object.keys(hit.opts).length) item.opts = hit.opts;
        return item;
    }).filter((x) => findSkill(x.categoryId, x.skillId));
}

/** A pupil link for these skills through the app's existing share flow (stable share codes). */
function makeLink(items) {
    const before = currentSet().map((x) => ({ categoryId: x.categoryId, skillId: x.skillId, weight: x.weight, opts: x.opts }));
    const prevSettings = state.shareSettings;
    const prevType = state.shareLinkType;
    let link = '';
    loadSetIntoQueue({ skills: items });
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
    return link;
}

async function doLink(keys) {
    const items = itemsFor(keys);
    if (!items.length) { toast('Tick at least one skill first'); return; }
    v.link = makeLink(items);
    v.linkNote = `Practice link · ${items.length} skill${items.length === 1 ? '' : 's'}${items.length > 1 ? ' mixed' : ''} · copied`;
    redrawBar();
    if (!v.link) { toast('Could not make a link'); return; }
    toast((await copyText(v.link)) ? `Practice link copied · ${items.length} skill${items.length === 1 ? '' : 's'}` : 'Link ready: copy it from the box');
    root.querySelector('#tvwLink')?.select();
}

function doPrint(keys) {
    const items = itemsFor(keys);
    if (!items.length) { toast('Tick at least one skill first'); return; }
    printSkills(items);
    window.tvGo?.('print');
}

function tickGroup(g, on) {
    const list = g === 'all' ? [...links.direct, ...links.prereq, ...links.related] : links[g] || [];
    for (const x of list) { if (on) v.ticked.add(k2p(x.key)); else v.ticked.delete(k2p(x.key)); }
}

function choose(patch, focusSel) {
    Object.assign(v, patch);
    v.ticked.clear(); v.link = '';
    writeHash(false);
    draw();
    if (focusSel) root.querySelector(focusSel)?.focus();
}

function searchHits(box, q) {
    const hits = q.trim() ? L.searchLessons(q, 10) : [];
    box.hidden = !q.trim();
    box.innerHTML = hits.length
        ? hits.map((l) => `<li role="option"><button type="button" class="tvw-hit" data-w-jump="${esc(l.key)}"><span class="tvw-hit-t">${esc(l.title)}</span>
            <span class="tvw-hit-m">${esc(l.gradeLabel)} · ${esc(l.unit === 'E' ? 'Enrichment' : `${l.unit} ${L.domainName(l.domain)}`)}${l.ccss.length ? ` · ${esc(l.ccss[0])}` : ''}</span></button></li>`).join('')
        : '<li class="tvw-hit-none">No lesson matches. Try a shorter word or a standard such as 2.NBT.A.1.</li>';
}

function wire(el) {
    el.addEventListener('click', (e) => {
        const t = e.target.closest('button, a');
        if (!t || !el.contains(t) || !L) return;
        const d = t.dataset;
        if (d.wGrade) { choose({ grade: d.wGrade, unit: (unitsOf(d.wGrade)[0] || {}).id || '', lesson: '' }, `[data-w-grade="${d.wGrade}"]`); return; }
        if (d.wUnit) { choose({ unit: d.wUnit, lesson: '' }, `[data-w-unit="${d.wUnit}"]`); return; }
        if (d.wLesson) {
            choose({ lesson: d.wLesson }, `[data-w-lesson="${d.wLesson}"]`);
            root.querySelector('#tvwDetail')?.scrollIntoView({ block: 'start', behavior: 'instant' });
            return;
        }
        if (d.wJump) {
            const l = L.lessonByKey(d.wJump);
            v.query = '';
            choose({ grade: l.grade, unit: l.unit, lesson: l.key }, '#tvwDetail .tvw-title');
            return;
        }
        if (d.wTick) {
            if (v.ticked.has(d.wTick)) v.ticked.delete(d.wTick); else v.ticked.add(d.wTick);
            v.link = '';
            const sel = `.tvw-tick[data-w-tick="${CSS.escape(d.wTick)}"]`;
            redrawDetail();
            root.querySelector(sel)?.focus();
            return;
        }
        if (d.wAll) {
            const list = links[d.wAll];
            tickGroup(d.wAll, !list.every((x) => v.ticked.has(k2p(x.key))));
            v.link = '';
            redrawDetail();
            root.querySelector(`[data-w-all="${d.wAll}"]`)?.focus();
            return;
        }
        if (d.wQuick) {
            if (d.wQuick === 'none') v.ticked.clear(); else { v.ticked.clear(); tickGroup(d.wQuick, true); }
            v.link = '';
            redrawDetail();
            root.querySelector(`[data-w-quick="${d.wQuick}"]`)?.focus();
            return;
        }
        if (d.wOne === 'link') { doLink([d.wKey]); return; }
        if (d.wOne === 'print') { doPrint([d.wKey]); return; }
        if (d.wAct === 'link') { doLink([...v.ticked]); return; }
        if (d.wAct === 'print') { doPrint([...v.ticked]); return; }
        if (d.wAct === 'copy') { copyText(v.link).then((ok) => toast(ok ? 'Practice link copied' : 'Select the link and copy it')); return; }
        if (d.act === 'skill-view' && d.view) {
            v.view = d.view === 'thumbs' ? 'thumbs' : 'list';
            setSkillView(v.view);
            redrawDetail();
            root.querySelector(`[data-act="skill-view"][data-view="${v.view}"]`)?.focus();
        }
    });
    el.addEventListener('input', (e) => {
        if (e.target.id !== 'tvwSearch' || !L) return;
        v.query = e.target.value;
        searchHits(el.querySelector('#tvwHits'), v.query);
    });
    el.addEventListener('keydown', (e) => {
        if (e.target.id === 'tvwSearch' && e.key === 'Enter') {
            const first = el.querySelector('#tvwHits [data-w-jump]');
            if (first) { e.preventDefault(); first.click(); }
        }
        if (e.target.id === 'tvwSearch' && e.key === 'Escape') { e.target.value = ''; v.query = ''; el.querySelector('#tvwHits').hidden = true; }
        if (e.key === 'ArrowDown' && (e.target.id === 'tvwSearch' || e.target.classList.contains('tvw-hit'))) {
            const all = [...el.querySelectorAll('.tvw-hit')];
            const i = all.indexOf(e.target);
            if (all[i + 1]) { e.preventDefault(); all[i + 1].focus(); }
        }
        if (e.key === 'ArrowUp' && e.target.classList.contains('tvw-hit')) {
            const all = [...el.querySelectorAll('.tvw-hit')];
            const i = all.indexOf(e.target);
            e.preventDefault();
            (all[i - 1] || el.querySelector('#tvwSearch')).focus();
        }
    });
}
