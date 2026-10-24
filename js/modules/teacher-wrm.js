// teacher-wrm.js — the "White Rose lessons" teacher screen (owner request 2026-10-10: "an easy page
// to see by grade, domain, small step all the skills that are tagged to it ... thumbnail of all
// direct skills, prerequisite skills, and related skills ... so teachers can assign or print practice").
//
// Navigation (owner 2026-10-17: "It should show the grade, the domain, and then the lessons appear in list form in
// order. Don't worry about the dates etc. Once a lesson is clicked its information comes up on the side. The extra
// lessons/projects etc/enrichment come up as the last domain section."):
//   Grade    one row of grade buttons (Pre-K, K, Grade 1 … Grade 5), remembered per viewer.
//   Domain   a row of domain buttons in the school site's order, then "Extra lessons"; each jumps to its section of
//            the list. The list is every domain of the grade as a heading with its lessons beneath, numbered 1, 2, 3
//            in the site's order (wrm-links.js gradeSections), then the Extra lessons section: support lessons,
//            projects and other school lessons, enrichment and assessments. A row is the title and at most two small
//            tags (coverage: Full / Covers part / No skill yet; CCSS · BUILD). No weeks or dates in the list.
//   Lesson   a click opens the lesson in the side panel (right column at 1024 px and wider, the list stays beside
//            it; a panel that slides over the list, with Back, on narrower screens). The panel is the lesson view:
//            head, Skills to be made for this lesson, detailed lesson, the three skill groups and the practice /
//            print bar. Arrow keys move through the list, Enter opens, Escape closes the slide-over.
//   Search   the search box (lesson title, CCSS code, unit name, week) finds lessons in every grade.
//
// The choice lives in the URL hash so a teacher can bookmark or share it and Back works:
//   #wrm/<grade>                 the grade's list
//   #wrm/<grade>/<D1|extra>      the list at that domain section (a Pre-K small-unit id opens its domain)
//   #wrm/<grade>/<unit>/<n|slug> a lesson (unchanged from the unit pages, so old bookmarks still open it)
// The sequence and link data (~350 KB with standards) load the first time the screen opens, never at boot.

import { icon, esc, hideToast, toast, copyText, findSkill } from './teacher-ui.js';
import { skillView, viewToggleHTML } from './teacher-preview.js';
import { createPicker, liveKey, skillLabelOf, makePracticeLink, k2p } from './teacher-skillpick.js';
import { restoreTray, syncTray, trayAddLesson, trayLessons, trayBorrow, trayReturn } from './teacher-tray.js';
import { setPrintExtra, onSheetClose, printBatch } from './teacher-sheet.js';
import { buildSheet } from './print-sheet.js';
import { printHtml } from './teacher-print.js';
import { loadYear, loadDetailed, loadLinksData } from './links-data.js';
import { indexDetailed, detailedOf, DETAILED_CAP } from './detailed-links.js';
import { printDetailedLesson } from './teacher-print.js';
import { detailedLessonFor } from './lessons/detailed/index.js';

let L = null;          // the wrm-links.js module
let SEQ = null;        // the wrm-sequence-db.js module
let loading = null;
let root = null;

/** The grade row's words (owner: "Pre-K, K, Grade 1 … Grade 5"). */
const GRADE_BTN = { PK: 'Pre-K', K: 'K', 1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5' };
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
const GRADE_KEY = 'mq_teacher_wrm_grade';
const LAST_KEY = 'mq_teacher_wrm_last';   // T4: the last lesson opened, so the place opens there with "Next" marked
const NARROW = '(max-width: 1023px)';
const narrow = () => typeof matchMedia === 'function' && matchMedia(NARROW).matches;

const v = {
    grade: '', sec: '', lesson: '',  // sec: the domain section the list is at ('D1' … or 'extra'); lesson key
    query: '',
};
let links = null;                    // linksFor(current lesson)
let detailed = null;                 // data/curriculum/detailed-lessons.json, indexed (detailed-links.js), when the file exists
const pick = createPicker({ idp: 'tvw', root: () => root, redraw: () => redrawDetail() });
let preFor = '';                     // the lesson whose teaching skills were ticked on opening (T4: ticked by default)
let tmOpen = false;                  // "Skills to be made for this lesson" unfolded (T4: folded by default)
const resetPick = () => { pick.reset(); preFor = ''; };

function load() {
    if (L) return Promise.resolve();
    if (!loading) {
        loading = Promise.all([import('./wrm-links.js'), import('./wrm-sequence-db.js')]).then(([a, b]) => { L = a; SEQ = b; L.setSkillLabeler(skillLabelOf); })
            .catch((e) => { console.warn('[teacher-wrm] load', e); loading = null; });
        // the detailed-lessons hook: nothing is fetched unless index.json says the file exists
        loadDetailed().then((d) => { detailed = d ? indexDetailed(d) : null; if (detailed && root && root.isConnected && L && root.querySelector('#tvwLessons')) draw(); });
        // owner 2026-10-17 ("clearly say all of the planned skills … per lesson", "per grade/domain"): the Skills to be
        // made list (every source, one entry per id) names, kinds and gap lines for the lesson and domain cards
        loading.then(() => Promise.all([import('./build-queue.js'), import('./lesson-tomake.js'), import('./todo-text.js'), loadLinksData()])).then(([Q, T, TT, data]) => {
            if (!L) return;
            for (const [y, d] of Object.entries(data.years || {})) if (!curatedDone.has(y)) { curatedDone.add(y); if (d) L.addCuratedYear(d); }
            TM = T;
            queue = Q.buildQueue({ curated: Object.values(data.years || {}), map: data.map }).items;
            TT.setTodoNames(queue);
            unitCache.clear();
            factCache.clear();
            if (root && root.isConnected && root.querySelector('#tvwLessons')) draw();
        }).catch((e) => { console.warn('[teacher-wrm] to-make', e); });
    }
    return loading;
}
let TM = null;                       // lesson-tomake.js, once the Skills to be made list is in
let queue = null;                    // buildQueue(...).items
const unitCache = new Map();         // 'grade|section' -> unitToMake rows
const factCache = new Map();         // lesson key -> row facts (cleared when link files arrive)
const tmuOpen = new Set();           // 'grade|section' of the domain to-make cards the teacher opened
const tmuAll = new Set();            // … and the ones showing every row

// Curated year files (data/curriculum/links/<YEAR>.json) load on demand: the years of the steps of the grade on
// screen (a copied-in lesson's step is another year's). They win over the computed rules.
const curatedDone = new Set();
function ensureCurated() {
    const years = new Set([SEQ.WRM_SEQUENCE.find((g) => g.id === v.grade)?.year].filter(Boolean));
    for (const s of sections()) for (const l of s.lessons) if (l && l.step) years.add(l.step.split('.')[0]);
    const want = [...years].filter((y) => !curatedDone.has(y));
    if (!want.length) return Promise.resolve();
    return Promise.all(want.map((y) => loadYear(y).then((d) => { curatedDone.add(y); if (d) { L.addCuratedYear(d); factCache.clear(); unitCache.clear(); } })));
}

/** Open the screen at a school-site lesson by its site id (from the Skills to be made screen). False when it is not listed. */
export function openWrmLesson(siteId) {
    return load().then(() => {
        const l = L && L.lessonBySite(siteId);
        if (!l) return false;
        setLesson(l);
        resetPick();
        writeHash(false);
        return ensureCurated().then(() => { window.tvGo?.('wrm'); return true; });
    });
}

/** Open the screen at a White Rose step (from the Skills to be made screen). False when no lesson teaches it. */
export function openWrmStep(stepId) {
    return load().then(() => {
        const l = L && L.allLessons().find((x) => x.step === stepId);
        if (!l) return false;
        setLesson(l);
        resetPick();
        writeHash(false);
        return ensureCurated().then(() => { window.tvGo?.('wrm'); return true; });
    });
}

/* ================================================================= the grade's sections */

const secCache = new Map();          // grade -> { secs, place: Map(lesson key -> { sec, n }) }
function gradeData(gid = v.grade) {
    if (!secCache.has(gid)) {
        const secs = L.gradeSections(gid);
        const place = new Map();
        for (const s of secs) s.lessons.forEach((l, i) => place.set(l.key, { sec: s, n: i + 1 }));
        secCache.set(gid, { secs, place });
    }
    return secCache.get(gid);
}
function sections() { return gradeData().secs; }
function placeOf(l) { return l ? gradeData(l.grade).place.get(l.key) || null : null; }
/** The section key a hash segment names: a section key, 'extra', or a unit id (a Pre-K small unit → its domain). */
function secKeyFor(seg, gid = v.grade) {
    if (!seg) return '';
    const secs = gradeData(gid).secs;
    const s = secs.find((x) => x.key === seg) || secs.find((x) => x.parts.some((p) => p.unit === seg));
    if (s) return s.key;
    // a unit whose lessons are all extra (none today) opens the Extra lessons section
    return SEQ.WRM_SEQUENCE.find((g) => g.id === gid)?.units.some((u) => u.id === seg) && secs.some((x) => x.extra) ? 'extra' : '';
}
function setLesson(l) {
    v.grade = l.grade;
    v.lesson = l.key;
    v.sec = (placeOf(l) || { sec: { key: '' } }).sec.key;
    rememberGrade();
    try { localStorage.setItem(LAST_KEY, l.key); } catch (e) { /* per-viewer convenience only */ }
}
function rememberedLesson() { try { return localStorage.getItem(LAST_KEY) || ''; } catch (e) { return ''; } }
/** Every lesson of the grade in list order (domains in the site's order, then Extra lessons). */
function orderOf(gid = v.grade) { return gradeData(gid).secs.flatMap((s) => s.lessons); }
/** The lesson after the open one (or after the last one opened): marked "Next", and the Next lesson ▸ arrow. */
function nextLesson() {
    const order = orderOf();
    const cur = v.lesson || rememberedLesson();
    const i = order.findIndex((l) => l.key === cur);
    return i >= 0 ? order[i + 1] || null : null;
}
/** The lesson's place in every grade's order (lesson groups in the tray keep this order). */
function ordOf(l) {
    const gi = grades().findIndex((g) => g.id === l.grade);
    return (gi + 1) * 10000 + orderOf(l.grade).findIndex((x) => x.key === l.key) + 1;
}
/** "Lesson 4: Add within 20" — the name a lesson group carries in the tray and on its worksheet. */
function lessonName(l) {
    const p = placeOf(l);
    const lead = l.type === 'assessment' ? 'Assessment' : L.isCoreLesson(l) ? `Lesson ${p ? p.n : l.n}` : `Extra lesson ${p ? p.n : ''}`.trim();
    return `${lead}: ${l.title}`;
}
function rememberGrade() { try { localStorage.setItem(GRADE_KEY, v.grade); } catch (e) { /* per-viewer convenience only */ } }
function rememberedGrade() { try { return localStorage.getItem(GRADE_KEY) || ''; } catch (e) { return ''; } }

/* ================================================================= hash */

export function wrmHashActive() { return /^#wrm(\/|$)/.test(location.hash || ''); }

// #wrm/<grade>/<unit>/<n> opens a White Rose row; #wrm/<grade>/<unit>/<site slug> a lesson the school site names
// (round 7: the site id is the bookmark, so it opens wherever the lesson is listed); #wrm/<grade>/<section> the list.
function readHash() {
    const m = /^#wrm(?:\/([^/]*))?(?:\/([^/]*))?(?:\/([^/?#]+))?/.exec(location.hash || '');
    if (!m) return;
    const grade = decodeURIComponent(m[1] || '');
    const seg2 = decodeURIComponent(m[2] || '');
    const seg3 = decodeURIComponent(m[3] || '');
    if (grade && SEQ.WRM_SEQUENCE.some((g) => g.id === grade)) v.grade = grade;
    let l = null;
    if (/^\d+$/.test(seg3)) l = L.lessonByKey(`${v.grade}:${seg2}:${seg3}`);
    else if (seg3) l = L.lessonBySiteSlug(v.grade, seg3);
    if (l) { setLesson(l); return; }
    v.lesson = '';
    v.sec = secKeyFor(seg2);
}

function writeHash(replace) {
    const l = v.lesson ? L.lessonByKey(v.lesson) : null;
    const h = l ? L.lessonHash(l) : `#wrm${v.grade ? `/${encodeURIComponent(v.grade)}${v.sec ? `/${encodeURIComponent(v.sec)}` : ''}` : ''}`;
    if (location.hash === h) return;
    if (replace) history.replaceState(history.state, '', h);
    else history.pushState(history.state, '', h);
}

/** Leaving the screen: drop the #wrm hash so the other screens keep a clean URL. It is a new
 *  history entry, so Back returns to the lesson the teacher was on. */
export function clearWrmHash(screen = '') {
    // N34 (critic r7): the new entry names the screen it was made for, so Forward (Print → Back → Forward) can
    // bring that screen back instead of leaving the lesson on screen with an empty hash
    const st = history.state && typeof history.state === 'object' ? history.state : {};
    if (wrmHashActive()) history.pushState(screen ? { ...st, tvScreen: screen } : history.state, '', location.pathname + location.search);
}

/* ================================================================= data helpers */

function grades() { return SEQ.WRM_SEQUENCE; }
function gradeRec() { return grades().find((g) => g.id === v.grade) || null; }
const live = liveKey;

/** { n, verdict, source } for a lesson row: the curated record when present, else the computed rules. */
function rowFacts(lesson) {
    if (!lesson.step && !lesson.site) return { n: 0, verdict: 'gap', source: 'rules' };
    if (!factCache.has(lesson.key)) {
        const r = L.linksFor(lesson, { live });
        factCache.set(lesson.key, { n: r.direct.length, verdict: r.verdict, source: r.source });
    }
    return factCache.get(lesson.key);
}
/** A school-site lesson (or a CCSS BUILD row the site names) that no links file tags yet. */
const untagged = (l, source) => !!l.site && !l.step && l.type !== 'assessment' && source !== 'curated';

/** The row's coverage tag: 'full' | 'partial' | 'gap', or '' for an assessment (no skills are linked to one). */
function coverage(l) {
    if (l.type === 'assessment') return '';
    const f = rowFacts(l);
    const tagged = f.source === 'curated';
    if (untagged(l, f.source) || (l.type === 'build' && !tagged) || (!l.step && !tagged) || !f.n) return 'gap';
    return f.verdict === 'partial' ? 'partial' : f.verdict === 'gap' ? 'gap' : 'full';
}
const COVER_TAG = { full: 'Full', partial: 'Covers part', gap: 'No skill yet' };

/** The sequence's lesson note as a tag: "ADAPT: US money" → "Adapted: US money". */
const noteTag = (n) => String(n || '').replace(/^ADAPT:\s*/, 'Adapted: ');
/** 'G2' → 'Grade 2', 'GK' → 'Kindergarten', 'PK' → 'Pre-K' (N20). */
const gradeWord = (g) => { const x = String(g || '').replace(/^G(?=[\dK])/, ''); return x === 'K' ? 'Kindergarten' : x === 'PK' ? 'Pre-K' : /^\d$/.test(x) ? `Grade ${x}` : String(g || ''); };
/** "Measurement & Data" or "Extra lessons" — the section a lesson is listed in. */
const secNameOf = (l) => (L.isCoreLesson(l) ? L.domainName(l.domain) : 'Extra lessons');

/* ================================================================= render */

export function renderWrmScreen(el) {
    root = el;
    if (!el.dataset.built) {
        el.dataset.built = '1';
        el.innerHTML = `<div class="ts-top tvw-top"><div class="ts-head-text"><h1 class="tv-h1 ts-title">Lessons</h1>
            <p class="ts-sub">Choose a lesson. Tick its skills, then print, share or add it to the tray.</p><p class="ts-meta" id="tvwMeta"></p></div>
          <div class="ts-search tvw-search"><label class="tv-sr" for="tvwSearch">Find a lesson</label>${icon('search', 20)}
            <input id="tvwSearch" type="search" autocomplete="off" placeholder="Find a lesson: name or code (3.NF.A.1)" aria-controls="tvwHits">
            <ul class="tvw-hits" id="tvwHits" role="listbox" aria-label="Lessons found" hidden></ul></div></div>
          <div class="tvw-body" id="tvwBody"><p class="tv-cap">Loading the lessons…</p></div>`;
        wire(el);
    }
    pick.view = skillView();
    restoreTray();
    syncTray();
    load().then(() => {
        if (!L) { el.querySelector('#tvwBody').innerHTML = '<p class="tv-cap">Could not load the lessons. Reload the page to try again.</p>'; return; }
        if (wrmHashActive()) readHash();
        if (!v.grade) {
            const r = rememberedGrade(); v.grade = grades().some((g) => g.id === r) ? r : '2';
            // T4: opens where the teacher was last — that grade's last lesson, the next one marked "Next"
            const last = L.lessonByKey(rememberedLesson());
            if (last && last.grade === v.grade) setLesson(last);
        }
        writeHash(true);
        ensureCurated().then(() => {
            draw();
            if (v.lesson) placeFocus('none');
            else if (v.sec) jumpTo(v.sec, false);
        });
    });
}

/** Re-read the hash (Back / Forward / a pasted link). */
export function wrmOnHashChange() {
    if (!L || !root || !root.isConnected) return;
    const before = { grade: v.grade, sec: v.sec, lesson: v.lesson };
    readHash();
    if (v.grade === before.grade && v.lesson === before.lesson) {
        if (!v.lesson && v.sec !== before.sec && v.sec) jumpTo(v.sec, false);
        return;
    }
    resetPick();
    ensureCurated().then(() => {
        if (v.grade !== before.grade || !root.querySelector('#tvwLessons')) draw();
        else showLesson();
        if (v.lesson) placeFocus('none');
    });
}

function draw() {
    const body = root.querySelector('#tvwBody');
    const list0 = root.querySelector('#tvwLessons');
    // a redraw of the same grade (the link files or the Skills to be made list arriving) keeps the list where it was:
    // the first heading or row at the list's top stays at the same place, whatever changed height above it
    let anchor = null;
    if (list0 && list0.dataset.grade === v.grade) {
        const lt = Math.max(list0.getBoundingClientRect().top, 0);
        for (const r of list0.querySelectorAll('.tvw-sec-h, .tvw-nrow')) {
            const t = r.getBoundingClientRect().top;
            if (t >= lt - 1) { anchor = { sel: r.id ? `#${CSS.escape(r.id)}` : `.tvw-nrow[data-w-lesson="${CSS.escape(r.dataset.wLesson)}"]`, top: t }; break; }
        }
    }
    const g = gradeRec();
    drawMeta();
    body.innerHTML = `
      <div class="ts-filters tvw-filters">
        <div class="ts-frow" role="group" aria-labelledby="tvwGradeH"><span class="ts-flabel" id="tvwGradeH">Grade</span>
          <div class="ts-pills">${grades().map((x) => `<button type="button" class="ts-pill tvw-gradebtn" data-w-grade="${esc(x.id)}" data-grade="${esc(x.id)}" aria-pressed="${x.id === v.grade}" aria-label="${esc(x.label)}"><i class="ts-gsw" aria-hidden="true"></i>${esc(GRADE_BTN[x.id] || x.label)}</button>`).join('')}</div></div>
        <div class="ts-fdiv" role="presentation"></div>
        <nav class="ts-frow" aria-labelledby="tvwDomH"><span class="ts-flabel" id="tvwDomH">Maths area</span>
          <div class="ts-seg tvw-doms" id="tvwDoms">${domButtonsHTML()}</div></nav>
      </div>
      <div class="tvw-ngrid${v.lesson ? ' is-open' : ''}" id="tvwGrid">
        <div class="tvw-navlist" id="tvwLessons" data-grade="${esc(v.grade)}" role="region" aria-label="${esc(`Lessons of ${g ? g.label : ''}`)}">${listHTML()}</div>
        <section class="tvw-detail tvw-panel" id="tvwDetail" aria-live="polite" aria-label="The lesson">${panelHTML()}</section>
      </div>`;
    after(root.querySelector('#tvwDetail'));
    const list = root.querySelector('#tvwLessons');
    const a = anchor && list.querySelector(anchor.sel);
    if (a) {
        const delta = a.getBoundingClientRect().top - anchor.top;
        if (Math.abs(delta) > 0.5) { if (listScrolls(list)) list.scrollTop += delta; else window.scrollBy(0, delta); }
    } else { const cur = list.querySelector('.tvw-nrow[aria-current="true"]'); if (cur) scrollRowIntoList(cur); }
}

/** "Grade 2 • 29 lessons": the grade and the lessons of the maths area the teacher is in. */
function drawMeta() {
    const meta = root && root.querySelector('#tvwMeta');
    if (!meta) return;
    const g = gradeRec();
    const secs = sections();
    const s = secs.find((x) => x.key === curSecKey()) || secs[0];
    const n = s ? s.lessons.length : 0;
    meta.textContent = `${g ? g.label : ''}${s ? ` • ${s.name}` : ''} • ${n} lesson${n === 1 ? '' : 's'}`;
}
function curSecKey() { const l = v.lesson ? L.lessonByKey(v.lesson) : null; return (l && (placeOf(l) || { sec: {} }).sec.key) || v.sec; }
function domButtonsHTML() {
    const cur = curSecKey();
    return sections().map((s) => `<button type="button" class="tvw-dombtn${s.extra ? ' is-extra' : ''}" data-w-sec="${esc(s.key)}" aria-controls="tvwSec-${esc(s.key)}" aria-pressed="${s.key === cur}"${s.key === cur ? ' aria-current="true"' : ''}>${esc(s.name)}</button>`).join('');
}

let nextKey = '';
function listHTML() {
    const secs = sections();
    nextKey = (nextLesson() || {}).key || '';
    if (!secs.length) return '<p class="tv-cap tvw-pad">This grade has no lessons yet.</p>';
    return secs.map(secHTML).join('');
}

function secHTML(s) {
    const n = s.lessons.length;
    const place = gradeData().place;
    const rows = (ls) => `<ol class="tvw-list tvw-nlist">${ls.map((l) => rowHTML(l, place.get(l.key).n)).join('')}</ol>`;
    const body = s.extra
        ? s.groups.map((x) => `<h3 class="tvw-sub-h tvw-nsub" data-w-extra-kind="${esc(x.kind)}">${esc(x.label)}</h3>${rows(x.lessons)}`).join('')
        : s.parts.length > 1
            ? s.parts.map((p) => `<h3 class="tvw-sub-h tvw-nsub">${esc(p.name.replace(/^[^:]*:\s*/, ''))}</h3>${rows(p.lessons)}`).join('')
            : rows(s.lessons);
    return `<section class="tvw-sec${s.extra ? ' is-extra' : ''}" id="tvwSec-${esc(s.key)}" data-w-secbox="${esc(s.key)}" aria-labelledby="tvwSecH-${esc(s.key)}">
        <h2 class="tvw-sec-h" id="tvwSecH-${esc(s.key)}" tabindex="-1"><span class="tvw-sec-t">${esc(s.name)}</span> <span class="tvw-sec-n">${n} lesson${n === 1 ? '' : 's'}</span></h2>
        ${s.extra ? '<p class="tvw-sec-cap">Support lessons, projects, enrichment and assessments from the school site that are not part of a domain.</p>' : ''}
        ${tmuWrapHTML(s)}
        ${body}
      </section>`;
}

function rowHTML(l, n) {
    const c = coverage(l);
    const build = L.siteFlagText(l) === 'CCSS · BUILD';
    const tags = `${c ? `<span class="tvw-tag tvw-ntag is-${c}">${COVER_TAG[c]}</span>` : ''}${build ? '<span class="tvw-tag tvw-ntag is-build">CCSS · BUILD</span>' : ''}`;
    return `<li><button type="button" class="tvw-lesson tvw-nrow${c === 'gap' ? ' is-gap' : ''}" data-w-lesson="${esc(l.key)}" data-w-verdict="${c || 'none'}"${l.site ? ` data-w-site="${esc(l.site)}"` : ''}${l.key === v.lesson ? ' aria-current="true"' : ''}>
      <span class="tvw-nrow-n">${n}</span><span class="tvw-nrow-t">${esc(l.title)}${l.key === nextKey ? ' <span class="tvw-next" data-w-next-mark="1">Next</span>' : ''}</span>${tags ? `<span class="tvw-nrow-tags">${tags}</span>` : ''}</button></li>`;
}

/**
 * The DETAILED lessons of this lesson (round 9): data/curriculum/detailed-lessons.json, joined on the school-site
 * lesson id (and on the White Rose steps a record names), each shown once. A card names the lesson by its "I Can"
 * title and gives the lesson file (a path inside the site), a practice link for the lesson's own skills (the same
 * share flow as the ticks) and "Make it", which opens Print worksheets on "Lesson: detailed" with that lesson.
 */
function detailedHTML(l) {
    return detailedOf(detailed, l).map((r) => {
        const live = r.used.filter((x) => liveKey(x.key));
        const labels = [...new Set(live.map((x) => skillLabelOf(x.key)).filter(Boolean))];
        return `<section class="tv-card tvw-dl" data-w-dl="${esc(r.id)}" aria-labelledby="tvwDl-${esc(r.id)}">
        <h3 class="tv-h3" id="tvwDl-${esc(r.id)}">Detailed lesson: ${esc(r.title)}</h3>
        <p class="tv-cap">${esc(DETAILED_CAP)}</p>
        ${labels.length ? `<p class="tvw-dl-skills">Its skills: ${esc(labels.join(', '))}.</p>` : ''}
        ${r.build.length ? `<p class="tvw-dl-skills tvw-dl-build">What it still needs made is listed in <button type="button" class="tvw-tbb-link" data-w-tm-goto="1">Skills to be made for this lesson</button> below.</p>` : ''}
        <div class="tvw-files">${r.pack ? `<a class="tv-btn tv-btn-primary" data-w-dl-pack="${esc(r.id)}" href="${esc(r.pack)}" target="_blank" rel="noopener">${icon('sheet', 18)}<span>Open the detailed lesson</span></a>` : ''}${live.length ? `<button type="button" class="tv-btn" data-w-dl-link="${esc(r.id)}">${icon('link', 18)}<span>Practice link</span></button>` : ''}${detailedLessonFor(r.id) ? `<button type="button" class="tv-btn" data-w-dl-make="${esc(r.id)}">${icon('print', 18)}<span>Make it</span></button>` : ''}</div>
      </section>`;
    }).join('');
}

/** "Practice link" on a detailed lesson: its skills, with their options, through the share flow. */
async function detailedLink(id) {
    const r = (detailed && detailed.all.find((x) => x.id === id)) || null;
    const items = r ? r.used.filter((x) => liveKey(x.key)).map((x) => { const [c, sk] = x.key.split(':'); return x.opts ? { categoryId: c, skillId: sk, weight: 1, opts: x.opts } : { categoryId: c, skillId: sk, weight: 1 }; }) : [];
    if (!items.length) return;
    pick.link = makePracticeLink(items);
    const what = `Practice link · detailed lesson · ${items.length} skill${items.length === 1 ? '' : 's'}${items.length > 1 ? ' mixed' : ''}`;
    if (!pick.link) { pick.linkNote = what; pick.redrawBar(); toast('Could not make a link'); return; }
    const ok = await copyText(pick.link);
    pick.linkNote = ok ? `${what} · copied` : `${what} · copy it from the box`;
    pick.redrawBar();
    toast(ok ? `Practice link copied · ${items.length} skill${items.length === 1 ? '' : 's'}` : 'Link ready: copy it from the box');
    root.querySelector('#tvwLink')?.select();
}

/* ================================================================= Skills to be made (owner 2026-10-17)
 * One card per lesson, right after the lesson head, listing every planned item that will cover the lesson and its
 * standards (lesson-tomake.js gathers them from the lesson's build list, White Rose, the standards audit and the
 * detailed lesson), and the same summary for the grade + domain at the top of each domain section, folded until the
 * teacher opens it. Each row: name, a kind tag, "Covers:" with the codes, a status tag and a link to the entry on
 * Skills to be made. */
const UNIT_ROWS = 6;

function toMakeRowHTML(x, { lessons = null } = {}) {
    const link = x.todo
        ? `<button type="button" class="tv-btn tv-btn-sm tvw-tm-link" data-todo-open="${esc(x.todo)}">${icon('list', 16)}<span>See it on Skills to be made</span></button>`
        : x.detailed ? `<button type="button" class="tv-btn tv-btn-sm tvw-tm-link" data-w-dl-goto="${esc(x.detailed)}">${icon('sheet', 16)}<span>See it in the detailed lesson</span></button>` : '';
    const num = (l) => { const p = placeOf(l); return p ? String(p.n) : ''; };
    const forL = lessons && lessons.length
        ? `<p class="tvw-tm-for"><span>For lesson${lessons.length > 1 ? 's' : ''}</span> ${lessons.map((l) => `<button type="button" class="tvw-tm-lesson" data-w-lesson="${esc(l.key)}" aria-label="${esc(`Open lesson ${num(l) ? `${num(l)}: ` : ''}${l.title}`)}">${esc(num(l) || l.title)}</button>`).join('')}</p>`
        : '';
    return `<li class="tvw-tm-row" data-w-tm-row="${esc(x.todo || x.name)}" data-w-tm-kind="${esc(x.kind)}" data-w-tm-status="${esc(x.status)}">
        <div class="tvw-tm-top"><span class="tvw-tm-name">${esc(x.name)}</span>
          <span class="tvw-tm-tags"><span class="tvw-tag tvw-tm-kind is-${esc(x.kind)}">${esc(x.kindTag)}</span><span class="tvw-tag tvw-tm-status is-${esc(x.status)}">${esc(x.statusTag)}</span></span></div>
        <p class="tvw-tm-covers"><b>Covers:</b> <span class="tvw-tm-what">${esc(x.covers)}</span>${x.codes.map((c) => ` <span class="tvw-tag tvw-code">${esc(c)}</span>`).join('')}</p>
        ${forL}${link ? `<div class="tvw-tm-act">${link}</div>` : ''}
      </li>`;
}

function lessonToMakeHTML(l, lk, { fullOk }) {
    if (l.type === 'assessment') return '';
    if (!TM || !queue) {
        return `<div class="tvw-tm-wrap"><p class="tvw-sec-cap tvw-tmu-wait">Skills to be made for this lesson: loading…</p><section class="tv-card tvw-tm" id="tvwToMake" aria-labelledby="tvwTmH" data-w-tomake="loading" hidden>
          <div class="tvw-tm-head"><h3 class="tv-h3" id="tvwTmH">Skills to be made for this lesson</h3></div>
          <p class="tv-cap">Loading the list of skills to be made…</p></section></div>`;
    }
    const r = TM.lessonToMake(l, lk, { queue, detailed: detailedOf(detailed, l) });
    const n = r.items.length;
    const body = n
        ? `<p class="tvw-tm-lead">${esc(TM.leadLine(r.codes, n))}</p><ul class="tvw-tm-list" data-w-tm-list="lesson">${r.items.map((x) => toMakeRowHTML(x)).join('')}</ul>`
        : `<p class="tvw-tm-empty" data-w-tm-empty="${fullOk ? 'full' : 'gap'}">${esc(fullOk ? TM.EMPTY_FULL : TM.EMPTY_GAP)}</p>`;
    const pre = r.pre.length
        ? `<h4 class="tvw-tm-sub" id="tvwTmPre">Earlier skills to be made first <span class="tvw-tm-count is-sm">${r.pre.length}</span></h4>
           <p class="tv-cap tvw-tm-precap">Lessons before this one need these too. They help pupils get ready for it.</p>
           <ul class="tvw-tm-list" data-w-tm-list="pre" aria-labelledby="tvwTmPre">${r.pre.map((x) => toMakeRowHTML(x)).join('')}</ul>`
        : '';
    return `<div class="tvw-tm-wrap"><button type="button" class="tv-btn tv-btn-sm tvw-tmu-fold tvw-tm-fold" data-w-tm-toggle="1" aria-expanded="${tmOpen}" aria-controls="tvwToMake">${icon(tmOpen ? 'chevD' : 'chevR', 16)}<span>Skills to be made for this lesson (${n}) — ${tmOpen ? 'hide' : 'show'}</span></button>
      <section class="tv-card tvw-tm" id="tvwToMake" aria-labelledby="tvwTmH" data-w-tomake="${n}"${tmOpen ? '' : ' hidden'}>
        <div class="tvw-tm-head"><h3 class="tv-h3" id="tvwTmH">Skills to be made for this lesson</h3><span class="tvw-tm-count" aria-label="${n} to be made">${n}</span></div>
        ${body}${pre}
      </section></div>`;
}

/** The domain (or Extra lessons) summary card at the top of a section: one folded button, the card under it. */
function tmuWrapHTML(s) {
    const g = gradeRec();
    if (!g) return '';
    const sk = esc(s.key);
    if (!TM || !queue) return `<div class="tvw-tmu-wrap" data-w-tmu-wrap="${sk}"><p class="tvw-sec-cap tvw-tmu-wait">Skills to be made for this ${s.extra ? 'section' : 'domain'}: loading…</p></div>`;
    const key = `${v.grade}|${s.key}`;
    if (!unitCache.has(key)) {
        unitCache.set(key, TM.unitToMake(s.lessons.map((l) => ({ lesson: l, links: L.linksFor(l, { live }), detailed: detailedOf(detailed, l) })), { queue }));
    }
    const rows = unitCache.get(key);
    const n = rows.length;
    const open = tmuOpen.has(key);
    const all = tmuAll.has(key);
    const shown = all ? rows : rows.slice(0, UNIT_ROWS);
    const what = s.extra ? 'these extra lessons' : 'this domain';
    const title = `Skills to be made for ${g.label} · ${s.name}`;
    return `<div class="tvw-tmu-wrap" data-w-tmu-wrap="${sk}">
        <button type="button" class="tv-btn tv-btn-sm tvw-tmu-fold" data-w-tmu-toggle="${sk}" aria-expanded="${open}" aria-controls="tvwTmu-${sk}">${icon(open ? 'chevD' : 'chevR', 16)}<span>Skills to be made for ${what} (${n}) — ${open ? 'hide' : 'show'}</span></button>
        <section class="tv-card tvw-tmu" id="tvwTmu-${sk}" data-w-tomake-unit="${n}" data-w-tmu-sec="${sk}" aria-labelledby="tvwTmuH-${sk}"${open ? '' : ' hidden'}>
          <div class="tvw-tm-head"><h3 class="tv-h3 tvw-tmu-h" id="tvwTmuH-${sk}">${esc(title)}</h3><span class="tvw-tm-count" aria-label="${n} to be made">${n}</span></div>
          ${!open ? '' : !n ? `<p class="tvw-tm-empty" data-w-tm-empty="unit">${esc(TM.EMPTY_UNIT)}</p>` : `
          <p class="tvw-tm-lead">To cover every lesson of ${what} and its standards, these will be made. Each names the lessons it is for.</p>
          <ul class="tvw-tm-list" data-w-tm-list="unit">${shown.map((x) => toMakeRowHTML(x, { lessons: x.lessons })).join('')}</ul>
          ${n > UNIT_ROWS ? `<button type="button" class="tv-btn tv-btn-sm tvw-tmu-all" data-w-tmu-all="${sk}" aria-expanded="${all}">${all ? `Show the first ${UNIT_ROWS}` : `Show all ${n}`}</button>` : ''}`}
        </section>
      </div>`;
}
function redrawTmu(secKey) {
    const w = root.querySelector(`[data-w-tmu-wrap="${CSS.escape(secKey)}"]`);
    const s = sections().find((x) => x.key === secKey);
    if (w && s) w.outerHTML = tmuWrapHTML(s);
}

function panelHTML() {
    const l = v.lesson ? L.lessonByKey(v.lesson) : null;
    if (!l) {
        links = null;
        pick.setGroups({});
        return `<div class="tv-card tvw-empty"><span class="tv-empty-icon" aria-hidden="true">${icon('book', 22)}</span>
          <div class="tv-h3">Choose a lesson</div><p class="tv-cap">Pick a lesson in the list, or find one with the search box. You will see the skills that teach it, the skills to do first and the skills that go with it.</p></div>`;
    }
    const nx = nextLesson();
    return `<div class="tvw-panel-top"><button type="button" class="tv-btn tvw-back" data-w-back="1">${icon('back', 18)}<span>Back to the lessons</span></button>${nx ? `<button type="button" class="tv-btn tvw-nextl-top" data-w-nextl="${esc(nx.key)}" aria-label="${esc(`Next lesson: ${nx.title}`)}"><span>Next lesson</span>${icon('chevR', 18)}</button>` : ''}</div>${detailHTML(l)}`;
}

function detailHTML(l) {
    links = L.linksFor(l, { live });
    pick.setGroups({ direct: links.direct, prereq: links.prereq, related: links.related });
    // T4: the lesson's teaching skills are ticked when it opens (Print practice is then one press)
    if (preFor !== l.key) { preFor = l.key; pick.ticked.clear(); for (const x of links.direct) if (liveKey(x.key)) pick.ticked.add(k2p(x.key)); }
    const assess = l.type === 'assessment';
    const tagged = links.source === 'curated';
    const notTagged = untagged(l, links.source);
    // m20 (WRM page critic r8): a lesson with a detailed lesson names that lesson's skills, so its empty lines say so
    const hasDl = detailedOf(detailed, l).length > 0;
    const files = l.step ? (SEQ.WRM_STEP_FILES[l.step] || []) : [];
    const fileBtn = (id, label, ic, url) => (id ? `<a class="tv-btn" href="${esc(url || `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`)}" target="_blank" rel="noopener">${icon(ic, 18)}<span>${label}</span></a>` : '');
    const ee = (links.step && links.step.ee) || (l.siteInfo && l.siteInfo.ee) || [];
    const strands = l.strands.split('').map((s) => STRAND[s]).filter(Boolean);
    const vd = assess || notTagged || (l.type === 'build' && !tagged) ? null : VERDICT[links.verdict];
    const verdict = assess ? 'No skills are linked to this assessment. Practise the lessons of this unit before it.'
        : notTagged && hasDl ? 'Skills not tagged to this lesson yet. The detailed lesson below names the skills it uses.'
        : notTagged ? `Skills not tagged yet.${links.prereq.length || links.related.length ? ' The skills below share its standards or come before it.' : ''}`
            : l.type === 'build' && !tagged ? 'A CCSS lesson the school is still to write — there is no White Rose lesson for it.'
                : links.verdict === 'full' ? 'The skills below teach every part of this lesson.'
                    : links.verdict === 'partial' ? esc(L.partialVerdict(links)) : 'No skill teaches this lesson yet.';
    const flag = L.siteFlagText(l);
    const about = L.lessonAbout(l);
    const p = placeOf(l);
    const core = L.isCoreLesson(l);
    const lead = assess ? 'Assessment' : core ? `Lesson ${p ? p.n : l.n}` : `Extra lesson ${p ? p.n : ''}`.trim();
    const group = !core ? (L.EXTRA_KINDS.find((k) => k[0] === L.extraKind(l)) || [])[1] : '';
    return `<div class="tv-card tvw-head">
        <p class="tvw-kicker">${esc(gradeRec().label)} · ${esc(secNameOf(l))}${group ? ` · ${esc(group)}` : ''}${l.weeks.length ? ` · Week ${esc(l.weeks.map((w) => w.replace(/^W0?/, '')).join(', '))}` : ''}</p>
        <h2 class="tv-h2 tvw-title" tabindex="-1"><span class="tvw-title-n">${esc(lead)}</span> ${esc(l.title)}</h2>
        <div class="tvw-tags">
          ${flag ? `<span class="tvw-tag tvw-flag${assess ? ' is-assess' : ''}" data-w-flag="${esc(flag)}">${esc(flag)}</span>` : ''}
          ${vd ? `<span class="tvw-tag tvw-verdict-tag ${vd[1]}" data-w-verdict-tag="${links.verdict}">${vd[0]}</span>` : ''}
          ${notTagged ? '<span class="tvw-tag tvw-verdict-tag is-untagged" data-w-verdict-tag="untagged">Skills not tagged yet</span>' : ''}
          ${hasDl ? '<span class="tvw-tag tvw-dl-tag">Detailed lesson</span>' : ''}
          ${l.siteInfo && l.siteInfo.supplement ? '<span class="tvw-tag">Supplement</span>' : ''}
          ${l.power ? '<span class="tvw-tag tvw-power">Power standard</span>' : ''}
          ${l.type === 'copied' ? `<span class="tvw-tag">Copied in from ${esc(gradeWord(l.from))} — teach it from that grade's files</span>` : ''}
          ${l.type === 'enrich' ? '<span class="tvw-tag">Enrichment (after MAP)</span>' : ''}
          ${l.note ? `<span class="tvw-tag tvw-power">${esc(noteTag(l.note))}</span>` : ''}
          ${strands.length ? `<span class="tvw-tag tvw-strand">${esc(strands.join(' · '))}</span>` : ''}
          ${l.ccss.map((c) => `<span class="tvw-tag tvw-code">${esc(c)}</span>`).join('')}
          ${ee.slice(0, 3).map((c) => `<span class="tvw-tag tvw-code tvw-ee">${esc(c.replace(/^M\./, ''))}</span>`).join('')}
        </div>
        ${about.length ? `<div class="tvw-about">${about.map((t) => `<p>${esc(t)}</p>`).join('')}</div>` : ''}
        ${files.length ? `<div class="tvw-files">${fileBtn(files[0], l.type === 'copied' && l.from ? `Open lesson (${gradeWord(l.from)} files)` : 'Open lesson', 'external')}${fileBtn(files[1], 'Teaching guide', 'book')}${files[2] ? fileBtn('x', 'Video', 'play', files[2]) : ''}</div>` : ''}
        <p class="tvw-verdict${assess || notTagged ? ' is-quiet' : links.verdict === 'gap' || (l.type === 'build' && !tagged) ? ' is-gap' : ''}">${verdict}</p>
      </div>
      ${assess ? '' : actsHTML(l)}
      ${assess ? '' : `<div class="tvw-skills-h"><h3 class="tv-h3">Skills for this lesson</h3><span class="tvw-viewtog">${viewToggleHTML(pick.view)}</span></div>`}
      ${assess ? '' : GROUPS.map(([g, h, cap]) => pick.groupHTML(g, h, cap, emptyText(g, l, notTagged, hasDl), '')).join('')}
      ${detailedHTML(l)}
      ${lessonToMakeHTML(l, links, { fullOk: !!vd && links.verdict === 'full' })}`;
}

/* ================================================================= the lesson's actions (T4)
 * Print lesson (only for a lesson the app can make: one of the detailed lessons, or the standard lesson maker on the
 * lesson's first teaching skill) · Print practice · Share practice · Practise pre-skills; then Add to tray (the ticked
 * skills as ONE group named after the lesson) and Next lesson ▸. Print / Share practice use ONLY this lesson's ticked
 * skills: the tray is put aside while the sheet is open and comes back when it closes. */
function madeLesson(l) {
    if (!l || l.type === 'assessment') return null;
    const dl = detailedOf(detailed, l).find((r) => detailedLessonFor(r.id));
    if (dl) return { kind: 'detailed', id: dl.id };
    const first = (links && links.direct || []).find((x) => liveKey(x.key));
    return first ? { kind: 'standard', item: first } : null;
}
function tickedItems() {
    const all = pick.all();
    return [...pick.ticked].map((pk) => {
        const [c, sk] = pk.split('|');
        const hit = all.find((x) => x.key === `${c}:${sk}`);
        const it = { categoryId: c, skillId: sk, weight: 1 };
        if (hit && hit.opts && Object.keys(hit.opts).length) it.opts = hit.opts;
        return it;
    }).filter((x) => findSkill(x.categoryId, x.skillId));
}
const preItems = () => (links ? links.prereq : []).filter((x) => liveKey(x.key)).map((x) => { const [c, sk] = x.key.split(':'); return x.opts && Object.keys(x.opts).length ? { categoryId: c, skillId: sk, weight: 1, opts: x.opts } : { categoryId: c, skillId: sk, weight: 1 }; });

function actsHTML(l) {
    const n = pick.ticked.size;
    const dis = n ? '' : ' aria-disabled="true" data-why="Tick skills first"';
    const made = madeLesson(l);
    const nPre = preItems().length;
    const nx = nextLesson();
    const count = n ? `${n} skill${n === 1 ? '' : 's'} ticked` : 'Tick the skills you want';
    const left = pick.link
        ? `<div class="tvw-linkbox"><label class="tvw-link-l" for="tvwLink">${esc(pick.linkNote || 'Practice link for pupils')}</label>
            <div class="tvw-linkrow"><input id="tvwLink" class="tv-input tvw-link" readonly value="${esc(pick.link)}">
            <button type="button" class="tv-btn" data-w-act="copy">${icon('copy', 18)}<span>Copy</span></button></div></div>` : '';
    return `<section class="tv-card tvw-acts" id="tvwBar" aria-label="Print and share this lesson">
        <div class="tvw-acts-main">
          ${made ? `<button type="button" class="tv-btn tv-btn-primary" data-w-act="lesson" data-w-made="${made.kind}">${icon('book', 18)}<span>Print lesson</span></button>` : ''}
          <button type="button" class="tv-btn${made ? '' : ' tv-btn-primary'}" data-w-act="print"${dis}>${icon('print', 18)}<span>Print practice</span></button>
          <button type="button" class="tv-btn" data-w-act="link"${dis}>${icon('link', 18)}<span>Share practice</span></button>
          ${nPre ? `<button type="button" class="tv-btn" data-w-act="pre">${icon('back', 18)}<span>Practise pre-skills</span></button>` : ''}
        </div>
        <div class="tvw-acts-sub"><div class="tv-actionbar-text"><div class="tv-h3">${count}</div>
            <p class="tv-cap">${n ? 'Print, share, or add them to the tray as this lesson.' : 'Tick skills below.'}</p></div>
          <div class="tvw-acts-tray"><button type="button" class="tv-btn" data-w-act="tray"${dis}>${icon('plus', 18)}<span>Add to tray</span></button>
            ${nx ? `<button type="button" class="tv-btn" data-w-nextl="${esc(nx.key)}" aria-label="${esc(`Next lesson: ${nx.title}`)}"><span>Next lesson</span>${icon('chevR', 18)}</button>` : ''}</div></div>
        ${left}
      </section>`;
}

/** Open a sheet on ONLY these skills; the tray comes back when it closes. */
function sheetWith(kind, items) {
    if (typeof window.tvOpenSheet !== 'function') { toast('Not ready yet'); return; }
    trayBorrow(items);
    const off = onSheetClose(() => { off(); trayReturn(); });
    window.tvOpenSheet(kind, { fromLesson: true });
}

async function shareLink() {
    const items = tickedItems();
    if (!items.length) { toast('Tick at least one skill first'); return; }
    pick.link = makePracticeLink(items);
    const what = `Practice link · ${items.length} skill${items.length === 1 ? '' : 's'}${items.length > 1 ? ' mixed' : ''}`;
    if (!pick.link) { pick.linkNote = what; redrawActs(); toast('Could not make a link'); return; }
    const ok = await copyText(pick.link);
    pick.linkNote = ok ? `${what} · copied` : `${what} · copy it from the box`;
    redrawActs();
    toast(ok ? `Practice link copied · ${items.length} skill${items.length === 1 ? '' : 's'}` : 'Link ready: copy it from the box');
    root.querySelector('#tvwLink')?.select();
}
function redrawActs() {
    const l = v.lesson ? L.lessonByKey(v.lesson) : null;
    const box = root && root.querySelector('#tvwBar');
    if (l && box) box.outerHTML = actsHTML(l);
}

function addToTray() {
    const l = L.lessonByKey(v.lesson);
    const items = tickedItems();
    if (!l || !items.length) { toast('Tick skills first'); return; }
    const opts = Object.fromEntries(items.filter((x) => x.opts).map((x) => [`${x.categoryId}:${x.skillId}`, x.opts]));
    trayAddLesson({ id: l.key, name: lessonName(l), ord: ordOf(l), keys: items.map((x) => `${x.categoryId}:${x.skillId}`), opts });
}

function practisePre() {
    const l = L.lessonByKey(v.lesson);
    const items = preItems();
    if (!l || !items.length) return;
    const opts = Object.fromEntries(items.filter((x) => x.opts).map((x) => [`${x.categoryId}:${x.skillId}`, x.opts]));
    trayAddLesson({ id: `${l.key}#pre`, name: `Before ${lessonName(l)}`, ord: ordOf(l) - 0.5, keys: items.map((x) => `${x.categoryId}:${x.skillId}`), opts });
    sheetWith('share', items);
}

let lessonBusy = false;
async function printLesson() {
    const l = L.lessonByKey(v.lesson);
    const made = madeLesson(l);
    if (!made) return;
    hideToast();
    if (made.kind === 'detailed') { if (printDetailedLesson(made.id)) window.tvGo?.('print'); else toast('That lesson cannot be made here yet'); return; }
    if (lessonBusy) return;
    lessonBusy = true;
    toast('Making the lesson…');
    try {
        const [c, sk] = made.item.key.split(':');
        const res = await buildSheet({ role: 'lesson', sections: [{ skills: [{ categoryId: c, skillId: sk, opts: made.item.opts || {} }] }], practicePages: 1, mixed: false,
            size: 'M', look: 'auto', paper: 'A4', header: { name: true, date: true, score: true, title: true }, key: { on: true, placement: 'end', style: 'copy' }, seed: 4242 });
        await printHtml(res.docHtml || res.pupilHtml, lessonName(l), 'A4');
    } catch (e) { console.warn('[teacher-wrm] lesson', e); toast('Could not make this lesson'); } finally { lessonBusy = false; }
}

/* ================================================================= the Print sheet's lesson block (T4, multi-lesson sets)
 * When the tray holds lesson groups: one worksheet per lesson (each its own pages and key) · one for all (Mixed, or a
 * section per lesson) · both. Print all makes ONE document in lesson order from only the added lessons and their skills. */
const LP = { mode: 'each', all: 'mixed' };
function lpParts() {
    const ls = trayLessons();
    const each = ls.map((g) => ({ keys: g.skills, title: g.name }));
    const keys = [...new Set(ls.flatMap((g) => g.skills))];
    const title = `${ls.length} lessons together`;
    const all = LP.all === 'lessons' ? [{ lessons: ls.map((g) => ({ title: g.name, keys: g.skills })), title }] : [{ keys, kind: 'mixed', title }];
    return LP.mode === 'each' ? each : LP.mode === 'all' ? all : [...each, ...all];
}
let lpBusy = false;
function printAll() {
    const ls = trayLessons();
    if (!ls.length) return null;
    if (lpBusy) return Promise.resolve();
    lpBusy = true;
    return printBatch(lpParts(), ls.length === 1 ? ls[0].name : `${ls.length} lessons`, (i, n) => { if (n > 1) toast(`Making the worksheets… ${i} of ${n}`); })
        .catch((e) => { console.warn('[teacher-wrm] print all', e); toast('Could not make these worksheets'); })
        .finally(() => { lpBusy = false; });
}
/** For checks: the parts Print all would build now. */
export function lessonPrintParts() { return lpParts(); }
const lpRadio = (act, cur, list, label) => `<div class="tvs-radios" role="radiogroup" aria-label="${esc(label)}">${list.map(([val, t]) => `<button type="button" class="tvs-radio" role="radio" data-act="${act}" data-v="${val}" aria-checked="${cur === val}"><span class="tvs-radio-dot" aria-hidden="true"></span><span>${esc(t)}</span></button>`).join('')}</div>`;
setPrintExtra({
    html() {
        const ls = trayLessons();
        if (!ls.length) return '';
        const parts = lpParts();
        return `<section class="tvs-row tvw-lp" data-w-lp="${ls.length}"><div class="tvs-row-head"><h3 class="tvs-row-title">${ls.length} lesson${ls.length === 1 ? '' : 's'} in the tray</h3>
            <p class="tvs-row-sub">${esc(ls.map((g) => g.name).join(' · '))}</p></div>
          <div class="tvs-row-body">${lpRadio('x-lpmode', LP.mode, [['each', 'One worksheet per lesson (each with its own pages and key)'], ['all', 'One for all the lessons'], ['both', 'Both']], 'Worksheets')}
            ${LP.mode === 'each' ? '' : `<p class="tvs-row-sub">The one for all:</p>${lpRadio('x-lpall', LP.all, [['mixed', 'Mixed practice'], ['lessons', 'A section per lesson']], 'The one for all')}`}
            <p class="tvs-muted">Print all makes one PDF in lesson order: ${parts.length} worksheet${parts.length === 1 ? '' : 's'}, each with its key.</p>
            <button type="button" class="tvs-btn tvs-primary" data-act="x-lpprint">${icon('print', 20)}<span>Print all</span></button></div></section>`;
    },
    click(b) {
        const act = b.dataset.act, val = b.dataset.v;
        if (act === 'x-lpmode') { LP.mode = ['each', 'all', 'both'].includes(val) ? val : 'each'; return true; }
        if (act === 'x-lpall') { LP.all = val === 'lessons' ? 'lessons' : 'mixed'; return true; }
        if (act === 'x-lpprint') { printAll(); return false; }
        return false;
    },
    print: () => printAll(),
});

function emptyText(g, l, notTagged, hasDl) {
    if (g === 'direct' && notTagged && hasDl) return 'Not tagged here yet; the detailed lesson above names its skills.';
    if (g === 'direct') return notTagged ? 'Skills not tagged yet: no skill is linked to this lesson so far.' : l.type === 'build' ? 'No skill yet: this lesson is still to be written.' : 'No skill teaches this lesson yet. The skills below still help.';
    return g === 'prereq' ? 'No earlier skills found for this lesson.' : 'No other skills share this lesson\'s standard.';
}

function redrawDetail() {
    const d = root.querySelector('#tvwDetail');
    d.innerHTML = panelHTML();
    after(d);
}
/** The picker's after-draw, then the toast sits above the TRAY bar (the lesson's actions are not a sticky bar). */
function after(d) {
    pick.after(d);
    const tb = document.getElementById('tvTray');
    const h = tb && tb.offsetParent ? tb.offsetHeight : 0;
    document.documentElement.style.setProperty('--tv-bar-h', `${h}px`);
    document.documentElement.style.setProperty('--tvw-tray-h', `${h}px`);
}

/** The list stays; the current row, the domain buttons, the slide-over state and the panel follow v.lesson. */
function showLesson() {
    for (const b of root.querySelectorAll('#tvwLessons .tvw-nrow[aria-current]')) b.removeAttribute('aria-current');
    const row = v.lesson ? root.querySelector(`#tvwLessons .tvw-nrow[data-w-lesson="${CSS.escape(v.lesson)}"]`) : null;
    if (row) row.setAttribute('aria-current', 'true');
    const doms = root.querySelector('#tvwDoms');
    if (doms) doms.innerHTML = domButtonsHTML();
    drawMeta();
    root.querySelector('#tvwGrid')?.classList.toggle('is-open', !!v.lesson);
    redrawDetail();
}

/** The list has its own scroll box (desktop widths), else the page scrolls it. */
const listScrolls = (list) => !!list && list.scrollHeight > list.clientHeight + 1 && getComputedStyle(list).overflowY !== 'visible';

/** Scroll a row into view inside the list (its own scroll box at desktop widths), never past it. */
function scrollRowIntoList(row) {
    const list = root.querySelector('#tvwLessons');
    if (listScrolls(list)) {
        const top = row.offsetTop, h = row.offsetHeight;
        if (top < list.scrollTop + 48) list.scrollTop = Math.max(0, top - 48);
        else if (top + h > list.scrollTop + list.clientHeight - 8) list.scrollTop = top + h - list.clientHeight + 8;
    } else row.scrollIntoView({ block: 'nearest' });
}

/** After a lesson opens: at desktop widths the row keeps the focus (arrow keys go on) and the panel's top is shown;
 *  on the slide-over the Back button takes it. focus: 'row' | 'title' | 'none'. */
function placeFocus(focus) {
    const d = root.querySelector('#tvwDetail');
    const row = root.querySelector('#tvwLessons .tvw-nrow[aria-current="true"]');
    if (row) scrollRowIntoList(row);
    if (narrow()) {
        if (d) d.scrollTop = 0;
        if (focus !== 'none') root.querySelector('#tvwDetail [data-w-back]')?.focus({ preventScroll: true });
        return;
    }
    // the lesson's head at the top of the window (its first skills above a Chromebook's action bar); the list is sticky
    // beside it, so the current row stays in view
    if (d) { d.scrollIntoView({ block: 'start', behavior: 'instant' }); if (row) scrollRowIntoList(row); }
    if (focus === 'row' && row) row.focus({ preventScroll: true });
    else if (focus === 'title') root.querySelector('#tvwDetail .tvw-title')?.focus({ preventScroll: true });
}

/** The list at a domain section: its own scroll box at desktop widths, the page on narrow screens. */
function jumpTo(key, focus) {
    const list = root.querySelector('#tvwLessons');
    const sec = root.querySelector(`#tvwSec-${CSS.escape(key)}`);
    if (!list || !sec) return;
    if (listScrolls(list)) {
        list.scrollTop = sec.offsetTop;
        const r = list.getBoundingClientRect();
        if (r.top < 0 || r.top > innerHeight / 2) list.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else sec.scrollIntoView({ block: 'start', behavior: 'instant' });
    if (focus) sec.querySelector('.tvw-sec-h')?.focus({ preventScroll: true });
}

/* ================================================================= actions */

function openLesson(key, focus = 'row') {
    const l = L.lessonByKey(key);
    if (!l) return Promise.resolve();
    hideToast();   // m8: a toast belongs to the lesson it was made on
    const same = l.grade === v.grade && !!root.querySelector('#tvwLessons');
    setLesson(l);
    resetPick();
    writeHash(false);
    return ensureCurated().then(() => {
        if (same) showLesson(); else draw();
        placeFocus(focus);
    });
}

function closeLesson() {
    const was = v.lesson;
    hideToast();
    v.lesson = '';
    resetPick();
    writeHash(false);
    showLesson();
    const row = was ? root.querySelector(`#tvwLessons .tvw-nrow[data-w-lesson="${CSS.escape(was)}"]`) : null;
    if (row) { row.scrollIntoView({ block: 'center', behavior: 'instant' }); row.focus({ preventScroll: true }); }
}

function chooseGrade(gid) {
    hideToast();
    Object.assign(v, { grade: gid, sec: '', lesson: '' });
    rememberGrade();
    resetPick();
    writeHash(false);
    return ensureCurated().then(() => {
        draw();
        const list = root.querySelector('#tvwLessons');
        if (list) list.scrollTop = 0;
        root.querySelector(`[data-w-grade="${CSS.escape(gid)}"]`)?.focus();
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
            <span class="tvw-hit-m">${esc(l.gradeLabel)} · ${esc(secNameOf(l))}${L.siteFlagText(l) ? ` · ${esc(L.siteFlagText(l))}` : ''}${l.ccss.length ? ` · ${esc(matchedCode(l, q))}` : ''}</span></button></li>`).join('')
        : '<li class="tvw-hit-none">No lesson matches. Try a shorter word or a standard such as 2.NBT.A.1.</li>';
}

function wire(el) {
    el.addEventListener('click', (e) => {
        const t = e.target.closest('button, a');
        if (!t || !el.contains(t)) return;
        const d = t.dataset;
        if (d.wTodo) { window.tvGo?.('todo'); return; }
        if (!L) return;
        if (d.wGrade) { chooseGrade(d.wGrade); return; }
        if (d.wSec) {
            v.sec = d.wSec;
            if (!v.lesson) writeHash(true);
            for (const b of root.querySelectorAll('#tvwDoms [data-w-sec]')) { b.setAttribute('aria-pressed', String(b === t)); if (b === t) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }
            drawMeta();
            jumpTo(d.wSec, true);
            return;
        }
        if (d.wBack) { closeLesson(); return; }
        if (d.wNextl) { openLesson(d.wNextl, 'title'); return; }
        if (t.getAttribute('aria-disabled') === 'true' && d.wAct) { toast(d.why || 'Tick skills first'); return; }
        if (d.wAct === 'print') { const items = tickedItems(); if (items.length) sheetWith('print', items); else toast('Tick skills first'); return; }
        if (d.wAct === 'link') { shareLink(); return; }
        if (d.wAct === 'copy') { copyText(pick.link).then((ok) => toast(ok ? 'Practice link copied' : 'Select the link and copy it')); return; }
        if (d.wAct === 'tray') { addToTray(); return; }
        if (d.wAct === 'pre') { practisePre(); return; }
        if (d.wAct === 'lesson') { printLesson(); return; }
        if (d.wTmToggle) { tmOpen = !tmOpen; redrawDetail(); root.querySelector('[data-w-tm-toggle]')?.focus({ preventScroll: true }); return; }
        if (d.wLesson) { openLesson(d.wLesson, t.classList.contains('tvw-nrow') ? 'row' : 'title'); return; }
        if (d.wDlLink) { detailedLink(d.wDlLink); return; }
        if (d.wTmGoto) { if (!tmOpen) { tmOpen = true; redrawDetail(); } const c = root.querySelector('#tvwToMake'); if (c) { c.scrollIntoView({ block: 'start', behavior: 'instant' }); c.querySelector('h3')?.setAttribute('tabindex', '-1'); c.querySelector('h3')?.focus(); } return; }
        if (d.wDlGoto) { const c = root.querySelector(`[data-w-dl="${CSS.escape(d.wDlGoto)}"]`); if (c) { c.scrollIntoView({ block: 'start', behavior: 'instant' }); c.querySelector('h3')?.setAttribute('tabindex', '-1'); c.querySelector('h3')?.focus(); } return; }
        if (d.wTmuToggle) {
            const k = `${v.grade}|${d.wTmuToggle}`;
            if (tmuOpen.has(k)) tmuOpen.delete(k); else tmuOpen.add(k);
            redrawTmu(d.wTmuToggle);
            root.querySelector(`[data-w-tmu-toggle="${CSS.escape(d.wTmuToggle)}"]`)?.focus();
            return;
        }
        if (d.wTmuAll) {
            const k = `${v.grade}|${d.wTmuAll}`;
            if (tmuAll.has(k)) tmuAll.delete(k); else tmuAll.add(k);
            redrawTmu(d.wTmuAll);
            root.querySelector(`[data-w-tmu-all="${CSS.escape(d.wTmuAll)}"]`)?.focus();
            return;
        }
        if (d.wDlMake) {
            hideToast();
            if (printDetailedLesson(d.wDlMake)) window.tvGo?.('print'); else toast('That lesson cannot be made here yet');
            return;
        }
        if (d.wJump) {
            v.query = '';
            const box = root.querySelector('#tvwHits');
            if (box) box.hidden = true;
            const s = root.querySelector('#tvwSearch');
            if (s) s.value = '';
            openLesson(d.wJump, 'title');
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
        const t = e.target;
        if (t.id === 'tvwSearch' && e.key === 'Enter') {
            const first = el.querySelector('#tvwHits [data-w-jump]');
            if (first) { e.preventDefault(); first.click(); }
            return;
        }
        if (t.id === 'tvwSearch' && e.key === 'Escape') { t.value = ''; v.query = ''; el.querySelector('#tvwHits').hidden = true; return; }
        if (e.key === 'ArrowDown' && (t.id === 'tvwSearch' || t.classList.contains('tvw-hit'))) {
            const all = [...el.querySelectorAll('.tvw-hit')];
            const i = all.indexOf(t);
            if (all[i + 1]) { e.preventDefault(); all[i + 1].focus(); }
            return;
        }
        if (e.key === 'ArrowUp' && t.classList.contains('tvw-hit')) {
            const all = [...el.querySelectorAll('.tvw-hit')];
            const i = all.indexOf(t);
            e.preventDefault();
            (all[i - 1] || el.querySelector('#tvwSearch')).focus();
            return;
        }
        // the lesson list: arrow keys move through every row of every section, Home / End to the ends; Enter opens
        if (t.classList && t.classList.contains('tvw-nrow') && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
            const rows = [...el.querySelectorAll('#tvwLessons .tvw-nrow')];
            const i = rows.indexOf(t);
            const j = e.key === 'Home' ? 0 : e.key === 'End' ? rows.length - 1 : e.key === 'ArrowDown' ? Math.min(rows.length - 1, i + 1) : Math.max(0, i - 1);
            e.preventDefault();
            if (rows[j]) { rows[j].focus({ preventScroll: true }); scrollRowIntoList(rows[j]); }
            return;
        }
        // the slide-over closes with Escape (narrow screens)
        if (e.key === 'Escape' && v.lesson && narrow() && t.closest && t.closest('#tvwDetail')) { e.preventDefault(); closeLesson(); }
    });
}
