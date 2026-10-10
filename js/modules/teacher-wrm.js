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

import { icon, esc } from './teacher-ui.js';
import { skillView } from './teacher-preview.js';
import { createPicker, liveKey, toBeBuiltHTML, skillLabelOf } from './teacher-skillpick.js';
import { loadYear } from './links-data.js';

let L = null;          // the wrm-links.js module
let SEQ = null;        // the wrm-sequence-db.js module
let loading = null;
let root = null;

const GRADE_LABEL = { PK: 'Pre-K', K: 'K', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' };
const STRAND = { S: 'Standard', P: 'Priority', I: 'Intervention' };
const GROUPS = [
    ['direct', 'Skills that teach this lesson', 'Practise the lesson itself.'],
    ['prereq', 'Skills to do first', 'Earlier learning this lesson builds on — from the week\'s support-block lessons and the lessons just before it.'],
    ['related', 'Skills that go with it', 'Same idea in another form, or the next lessons in this unit.'],
];
const VERDICT = {
    full: ['Fully taught', 'is-full'],
    partial: ['Covers part', 'is-part'],
    gap: ['No skill yet', 'is-gap'],
};

const v = {
    grade: '', unit: '', lesson: '',  // lesson key
    query: '',
};
let links = null;                    // linksFor(current lesson)
const pick = createPicker({ idp: 'tvw', root: () => root, redraw: () => redrawDetail() });

function load() {
    if (L) return Promise.resolve();
    if (!loading) {
        loading = Promise.all([import('./wrm-links.js'), import('./wrm-sequence-db.js')]).then(([a, b]) => { L = a; SEQ = b; L.setSkillLabeler(skillLabelOf); })
            .catch((e) => { console.warn('[teacher-wrm] load', e); loading = null; });
    }
    return loading;
}

// Curated year files (data/curriculum/links/<YEAR>.json) load on demand: the years of the steps in the
// unit on screen (a copied-in lesson's step is another year's). They win over the computed rules.
const curatedDone = new Set();
function ensureCurated() {
    const u = unitRec();
    const years = new Set([SEQ.WRM_SEQUENCE.find((g) => g.id === v.grade)?.year].filter(Boolean));
    if (u) for (const l of lessonsOf(u)) if (l && l.step) years.add(l.step.split('.')[0]);
    const want = [...years].filter((y) => !curatedDone.has(y));
    if (!want.length) return Promise.resolve();
    return Promise.all(want.map((y) => loadYear(y).then((d) => { curatedDone.add(y); if (d) L.addCuratedYear(d); })));
}

/** Open the screen at a White Rose step (from the Skills to be made screen). False when no lesson teaches it. */
export function openWrmStep(stepId) {
    return load().then(() => {
        const l = L && L.allLessons().find((x) => x.step === stepId);
        if (!l) return false;
        Object.assign(v, { grade: l.grade, unit: l.unit, lesson: l.key });
        v.finderOpen = false;
        pick.reset();
        writeHash(false);
        return ensureCurated().then(() => { window.tvGo?.('wrm'); return true; });
    });
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
const live = liveKey;

/** "Week 1 (6–10 Sep)" — the pacing guide's words. */
function weekText(l) {
    if (!l.weeks.length) return '';
    const w = l.weeks[0];
    const of = (L.weekInfo(l.grade, w) || {}).weekOf;
    return `Week ${w.replace(/^W0?/, '')}${of ? ` (${of})` : ''}${l.weeks.length > 1 ? ` +${l.weeks.length - 1}` : ''}`;
}
/** S / P / I columns → the handbook's strand words. */
function strandText(st) {
    if (!st) return '';
    if (st === 'SPI') return 'All strands';
    return st.split('').map((c) => STRAND[c]).filter(Boolean).join(' + ') + (st.length === 1 ? ' only' : '');
}

/** { n, verdict } for a lesson row: the curated record when present, else the computed rules. */
function rowFacts(lesson) {
    if (!lesson.step) return { n: 0, verdict: 'gap' };
    const r = L.linksFor(lesson, { live });
    return { n: r.direct.length, verdict: r.verdict };
}

/* ================================================================= render */

export function renderWrmScreen(el) {
    root = el;
    if (!el.dataset.built) {
        el.dataset.built = '1';
        el.innerHTML = `<header class="tv-header"><div><h1 class="tv-h1">White Rose lessons</h1>
          <p class="tv-sub">Choose a grade, a unit and a lesson to see the skills that teach it. Tick skills, then make a practice link or print.</p></div>
          <div class="tv-header-actions"><button type="button" class="tv-btn tv-btn-ghost" data-w-todo="1">${icon('list', 18)}<span>Skills to be made</span></button></div></header>
          <div class="tvw-body" id="tvwBody"><p class="tv-cap">Loading the lessons…</p></div>`;
        wire(el);
    }
    pick.view = skillView();
    load().then(() => {
        if (!L) { el.querySelector('#tvwBody').innerHTML = '<p class="tv-cap">Could not load the lessons. Reload the page to try again.</p>'; return; }
        if (wrmHashActive()) readHash();
        if (!v.grade) v.grade = '2';
        if (!v.unit || !unitRec()) v.unit = (unitsOf(v.grade)[0] || {}).id || '';
        writeHash(true);
        ensureCurated().then(() => {
            draw();
            if (v.lesson) root.querySelector('#tvwDetail')?.scrollIntoView({ block: 'start', behavior: 'instant' });
        });
    });
}

/** Re-read the hash (Back / Forward / a pasted link). */
export function wrmOnHashChange() {
    if (!L || !root || !root.isConnected) return;
    const before = `${v.grade}|${v.unit}|${v.lesson}`;
    readHash();
    if (`${v.grade}|${v.unit}|${v.lesson}` !== before) { pick.reset(); v.finderOpen = !v.lesson; ensureCurated().then(draw); }
}

function draw() {
    const body = root.querySelector('#tvwBody');
    // While a lesson is open the finder folds to one line (search + "Grade 2 · D1 …  Change"), so the
    // lesson's skills are on screen on a Chromebook (critic r1 B5).
    const compact = !!v.lesson && !v.finderOpen;
    const u0 = unitRec();
    const crumb = `${gradeRec() ? gradeRec().label : ''} · ${u0 ? (u0.id === 'E' ? 'Enrichment' : `${u0.id} · ${L.domainName(u0.domain)}`) : ''}`;
    body.innerHTML = `
      <div class="tvw-find${compact ? ' is-compact' : ''}">
        <div class="tv-search tvw-search"><span aria-hidden="true">${icon('search', 18)}</span>
          <label class="tv-sr" for="tvwSearch">Find a lesson</label>
          <input id="tvwSearch" class="tv-input" type="search" autocomplete="off" placeholder="Find a lesson: title, standard (3.NF.A.1) or week (week 5)" value="${esc(v.query)}" aria-controls="tvwHits">
          <ul class="tvw-hits" id="tvwHits" role="listbox" aria-label="Lessons found" hidden></ul></div>
        ${compact ? `<button type="button" class="tv-btn tvw-crumb" data-w-finder="open" aria-expanded="false"><span class="tvw-crumb-t">${esc(crumb)}</span><span class="tvw-crumb-c">Change grade or unit</span></button>` : ''}
        <div class="tvw-pick"${compact ? ' hidden' : ''}>
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
    pick.after(root.querySelector('#tvwDetail'));
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
    const f = rowFacts(l);
    const gap = l.type === 'build' ? 'CCSS lesson to be built' : !l.step ? 'Not a White Rose step' : f.n ? '' : 'No skill yet';
    const meta = [weekText(l), strandText(l.strands)].filter(Boolean).join(' · ');
    const part = gap ? '' : f.verdict === 'partial' ? ' <span class="tvw-tag tvw-part">Covers part</span>' : ' <span class="tvw-tag tvw-verdict-tag is-full">Full</span>';
    return `<li><button type="button" class="tvw-lesson${gap ? ' is-gap' : ''}" data-w-lesson="${esc(l.key)}" data-w-verdict="${gap ? 'gap' : f.verdict}"${l.key === v.lesson ? ' aria-current="true"' : ''}>
      <span class="tvw-n">${l.n}</span>
      <span class="tvw-lt"><span class="tvw-lt-title">${esc(l.title)}</span>
        <span class="tvw-lt-meta">${esc(meta)}${l.power ? ' <span class="tvw-tag tvw-power">Power</span>' : ''}${l.type === 'copied' ? ` <span class="tvw-tag">From ${esc(l.from)}</span>` : ''}${part}</span></span>
      <span class="tvw-count${gap ? ' is-gap' : ''}">${gap ? esc(gap) : `${f.n} skill${f.n === 1 ? '' : 's'}`}</span></button></li>`;
}

/** "This week" (critic r2 m3): the first lesson of the grade taught in the school week of today. */
function thisWeekLesson() {
    const w = L.weekForDate(v.grade);
    if (!w) return null;
    for (const u of unitsOf(v.grade)) for (const l of lessonsOf(u)) if (l && l.weeks.includes(w)) return { w, l };
    return null;
}
function thisWeekHTML() {
    const t = thisWeekLesson();
    return t ? `<button type="button" class="tv-btn tv-btn-sm tvw-thisweek" data-w-thisweek="${esc(t.l.key)}">${icon('flag', 16)}<span>This week: Week ${esc(t.w.replace(/^W0?/, ''))}</span></button>` : '';
}

function lessonListHTML() {
    const u = unitRec();
    if (!u) return '<p class="tv-cap tvw-pad">This grade has no lessons yet.</p>';
    if (v.grade === 'PK') {
        const units = unitsOf('PK').filter((x) => x.domain === u.domain);
        return `<h2 class="tv-h3 tvw-unit-title" id="tvwUnitTitle">${esc(L.domainName(u.domain))}</h2>
          ${units.map((x) => `<h3 class="tvw-sub-h">${esc(x.name.replace(/^[^:]*:\s*/, ''))}</h3><ol class="tvw-list">${lessonsOf(x).map(lessonRowHTML).join('')}</ol>`).join('')}`;
    }
    return `<h2 class="tv-h3 tvw-unit-title" id="tvwUnitTitle">${esc(u.id === 'E' ? 'Enrichment lessons (after MAP)' : `${u.id} ${u.name}`)}</h2>${thisWeekHTML()}
      <p class="tv-cap tvw-pad">${esc(u.weeks || '')}${u.power && u.power.length ? ` · Power standards ${esc(u.power.join(', '))}` : ''}</p>
      <ol class="tvw-list">${lessonsOf(u).map(lessonRowHTML).join('')}</ol>`;
}

function detailHTML() {
    const l = v.lesson ? L.lessonByKey(v.lesson) : null;
    if (!l) {
        links = null;
        pick.setGroups({});
        return `<div class="tv-card tvw-empty"><span class="tv-empty-icon" aria-hidden="true">${icon('book', 22)}</span>
          <div class="tv-h3">Choose a lesson</div><p class="tv-cap">Pick a lesson on the left, or find one with the search box. You will see the skills that teach it, the skills to do first and the skills that go with it.</p></div>`;
    }
    links = L.linksFor(l, { live });
    pick.setGroups({ direct: links.direct, prereq: links.prereq, related: links.related });
    const files = l.step ? (SEQ.WRM_STEP_FILES[l.step] || []) : [];
    const fileBtn = (id, label, ic, url) => (id ? `<a class="tv-btn${label.startsWith('Open lesson') ? ' tv-btn-primary' : ''}" href="${esc(url || `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`)}" target="_blank" rel="noopener">${icon(ic, 18)}<span>${label}</span></a>` : '');
    const ee = (links.step && links.step.ee) || [];
    const strands = l.strands.split('').map((s) => STRAND[s]).filter(Boolean);
    const vd = l.type === 'build' ? null : VERDICT[links.verdict];
    const verdict = l.type === 'build'
        ? 'A CCSS lesson the school is still to write — there is no White Rose lesson for it.'
        : links.verdict === 'full' ? 'The skills below teach every part of this lesson.'
            : links.verdict === 'partial' ? `These skills cover part of the lesson${links.missing ? `. Not yet: ${esc(links.missing)}` : '.'}` : 'No skill teaches this lesson yet.';
    const u = unitRec();
    return `<div class="tv-card tvw-head">
        <p class="tvw-kicker">${esc(gradeRec().label)} · ${esc(u.id === 'E' ? 'Enrichment' : `${u.id} ${L.domainName(u.domain)}`)}${l.weeks.length ? ` · Week ${esc(l.weeks.map((w) => w.replace(/^W0?/, '')).join(', '))}` : ''}</p>
        <h2 class="tv-h2 tvw-title"><span class="tvw-title-n">Lesson ${l.n}</span> ${esc(l.title)}</h2>
        <div class="tvw-tags">
          ${vd ? `<span class="tvw-tag tvw-verdict-tag ${vd[1]}" data-w-verdict-tag="${links.verdict}">${vd[0]}</span>` : ''}
          ${l.power ? '<span class="tvw-tag tvw-power">Power standard</span>' : ''}
          ${l.type === 'copied' ? `<span class="tvw-tag">Copied in from ${esc(l.from)} — teach it from that grade's files</span>` : ''}
          ${l.type === 'enrich' ? '<span class="tvw-tag">Enrichment (after MAP)</span>' : ''}
          ${l.note ? `<span class="tvw-tag tvw-power">${esc(l.note)}</span>` : ''}
          ${strands.length ? `<span class="tvw-tag tvw-strand">${esc(strands.join(' · '))}</span>` : ''}
          ${l.ccss.map((c) => `<span class="tvw-tag tvw-code">${esc(c)}</span>`).join('')}
          ${ee.slice(0, 3).map((c) => `<span class="tvw-tag tvw-code tvw-ee">${esc(c.replace(/^M\./, ''))}</span>`).join('')}
        </div>
        ${files.length ? `<div class="tvw-files">${fileBtn(files[0], l.type === 'copied' && l.from ? `Open lesson (${l.from.replace(/^G/, 'Grade ')} files)` : 'Open lesson', 'external')}${fileBtn(files[1], 'Teaching guide', 'book')}${files[2] ? fileBtn('x', 'Video', 'play', files[2]) : ''}</div>` : ''}
        <p class="tvw-verdict${links.verdict === 'gap' || l.type === 'build' ? ' is-gap' : ''}">${verdict}</p>${toBeBuiltHTML(links.build, L.proposalName)}
        ${pick.quickHTML([['direct', 'All teaching skills'], ['prereq', 'Do-first skills'], ['related', 'Go-with skills'], ['all', 'Everything']])}
      </div>
      ${GROUPS.map(([g, h, cap]) => pick.groupHTML(g, h, cap, emptyText(g, l), g === 'prereq' ? toBeBuiltHTML(links.preBuild, L.proposalName, 'Still to make') : '')).join('')}
      ${pick.barWrapHTML()}`;
}

function emptyText(g, l) {
    if (g === 'direct') return l.type === 'build' ? 'No skill yet: this lesson is still to be written.' : 'No skill teaches this lesson yet. The skills below still help.';
    return g === 'prereq' ? 'No earlier skills found for this lesson.' : 'No other skills share this lesson\'s standard.';
}

function redrawDetail() {
    const d = root.querySelector('#tvwDetail');
    d.innerHTML = detailHTML();
    pick.after(d);
}

/* ================================================================= actions */

function choose(patch, focusSel) {
    Object.assign(v, patch);
    v.finderOpen = !v.lesson;
    pick.reset();
    writeHash(false);
    return ensureCurated().then(() => {
        draw();
        if (focusSel) root.querySelector(focusSel)?.focus();
    });
}

/** The CCSS code the search matched (else the lesson's first code). */
function matchedCode(l, q) {
    const t = String(q || '').trim().toLowerCase();
    return l.ccss.find((c) => t && c.toLowerCase().startsWith(t)) || l.ccss.find((c) => t && c.toLowerCase().includes(t)) || l.ccss[0];
}

function searchHits(box, q) {
    const hits = q.trim() ? L.searchLessons(q, 10, v.grade) : [];
    box.hidden = !q.trim();
    box.innerHTML = hits.length
        ? hits.map((l) => `<li role="option"><button type="button" class="tvw-hit" data-w-jump="${esc(l.key)}"><span class="tvw-hit-t">${esc(l.title)}</span>
            <span class="tvw-hit-m">${esc(l.gradeLabel)} · ${esc(l.unit === 'E' ? 'Enrichment' : `${l.unit} ${L.domainName(l.domain)}`)}${l.ccss.length ? ` · ${esc(matchedCode(l, q))}` : ''}</span></button></li>`).join('')
        : '<li class="tvw-hit-none">No lesson matches. Try a shorter word or a standard such as 2.NBT.A.1.</li>';
}

function wire(el) {
    el.addEventListener('click', (e) => {
        const t = e.target.closest('button, a');
        if (!t || !el.contains(t)) return;
        const d = t.dataset;
        if (d.wTodo) { window.tvGo?.('todo'); return; }
        if (d.wFinder) { v.finderOpen = true; draw(); root.querySelector('[data-w-grade][aria-pressed="true"]')?.focus(); return; }
        if (!L) return;
        if (d.wGrade) { choose({ grade: d.wGrade, unit: (unitsOf(d.wGrade)[0] || {}).id || '', lesson: '' }, `[data-w-grade="${d.wGrade}"]`); return; }
        if (d.wUnit) { choose({ unit: d.wUnit, lesson: '' }, `[data-w-unit="${d.wUnit}"]`); return; }
        if (d.wLesson) {
            choose({ lesson: d.wLesson }, `[data-w-lesson="${d.wLesson}"]`).then(() => root.querySelector('#tvwDetail')?.scrollIntoView({ block: 'start', behavior: 'instant' }));
            return;
        }
        if (d.wThisweek) {
            const l = L.lessonByKey(d.wThisweek);
            choose({ grade: l.grade, unit: l.unit, lesson: l.key }, '#tvwDetail .tvw-title');
            return;
        }
        if (d.wJump) {
            const l = L.lessonByKey(d.wJump);
            v.query = '';
            choose({ grade: l.grade, unit: l.unit, lesson: l.key }, '#tvwDetail .tvw-title');
            return;
        }
        pick.handle(t);
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
