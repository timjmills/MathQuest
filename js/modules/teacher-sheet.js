// teacher-sheet.js — the Worksheet, Quiz and Share sheets of the Teacher site 2.0 (lane S2, T3b).
//
//   window.tvOpenSheet(kind, ctx)    kind = 'print' | 'quiz' | 'share'
//     ctx (all optional): { fromLesson: true }  the paper comes from a lesson → Sections by default
//                         { buildFrom: 'ccss' | 'ee' | 'wrm' | 'lesson' }  open the Quiz sheet on Build from
//   window.tvCloseSheet()
//
// The sheets work on the CURRENT SET (currentSet() in teacher-ui.js = UnifiedSkills; T3a's tray writes the same
// list), whose items carry `weight` (1–9, 0/missing = the default), `lockPct` (a held %) and `opts`.
//
// The spec is the signed mock-up design/mockups/teacher-2/ (#print, #quiz, #share, #quizshare, #buildfrom) and
// IMPROVEMENT_PLAN §2.4–2.5: three kinds of worksheet (Single skill · Sections · Mixed practice), each showing only
// its own options; a one-line summary whose counts are the counts of the built pages; a small preview of page 1;
// Print = buildSheet + sheetDocument. The arithmetic (How often, How many pages, samples) is teacher-plan.js.
//
// Engine mapping (no new renderer; print-sheet.js is called as it is):
//   Single skill    one request per skill: 'independent' with that skill's pages (New problems), 'more-practice'
//                   with letters A, B … (Same problems, new numbers), or one page repeated (Same page again);
//                   Layout → the 'fact-rows' / 'fact-probe' roles, offered only when the skill's items fit them
//   Sections        ONE 'independent' request, a section per skill with its count (the plan's counts)
//   Mixed practice  one 'mixed-practice' request per page, the page's skills weighted by the plan
//   Examples        anchors 'off' | 'sections' (an example to start each group) | 'side' (with each problem)
//   Quiz            the same requests with Score in the header, once per version (its own seed: its own order,
//                   numbers and key; no letters); online = generateQuestionFor → saveTest / compressTestForURL
//
// Light only; tokens from css/teacher-tokens.css; styles in css/teacher-sheet.css (.tvs-*).

import { buildSheet, sheetDocument } from './print-sheet.js';
import {
    icon, esc, toast, copyText, currentSet, findSkill, skillLabel, readStore, writeStore, printDefaults,
    addToCurrentSet, pupilCode,
} from './teacher-ui.js';
import { areaOf, AREAS, AREA_ORDER, areaIcon } from './teacher-areas.js';
import { planPages, planCounts, PER_PAGE, keyOf } from './teacher-plan.js';
import { printHtml } from './teacher-print.js';
import { makeShareLink, showBoardCodeFor } from './teacher-sets.js';
import { mountSample } from './teacher-preview.js';
import { generateQuestionFor } from './generate-question.js';
import { quizQuestionData } from './quiz-take.js';
import { saveTest, compressTestForURL } from './quiz-storage.js';
import { CCSS_STANDARDS, ESSENTIAL_ELEMENTS, skillsForStandard, SKILL_STANDARDS } from './standards.js';
import { WRM_STEPS, WRM_BLOCKS, skillsForWrmStep } from './wrm.js';
import { SITE_LESSONS } from './site-lessons-db.js';

const STORE_KEY = 'mq_teacher_sheet';
const GRADE_ORDER = ['K', '1', '2', '3', '4', '5', '6', 'M'];
const LETTERS = 'ABCDEFGHIJ'.split('');
const CHIP_MAX = 5;          // queued item 2: above 5 skills the sheet lists them, grouped area → grade
const BIG = 8;               // above 8 skills How often is set per area (in the tray)
const MAX_FROM = 6;          // Build from puts at most this many skills in the tray

/* ================================================================= state (kept across close / open) */

function defaults() {
    const d = printDefaults();
    return {
        kind: null, touched: [],
        opts: { pages: 1, each: 'new', examples: 'off', layout: 'standard', size: 'M', paper: d.paper,
            keyPlace: d.keyPlace, keyStyle: d.keyStyle, header: { name: true, date: true, score: false } },
        quiz: { n: 10, versions: 1, points: 1, name: '', from: 'skills', fromQuery: '' },
        share: { gameMode: 'practice', problemCount: '20', timer: '0', lock: false },
    };
}
const S = (() => {
    const base = defaults();
    const saved = readStore(STORE_KEY, null);
    if (saved && typeof saved === 'object') {
        if (saved.opts) Object.assign(base.opts, saved.opts, { header: Object.assign({}, base.opts.header, saved.opts.header || {}) });
        if (saved.quiz) Object.assign(base.quiz, saved.quiz);
        if (saved.share) Object.assign(base.share, saved.share);
        if (Array.isArray(saved.touched)) base.touched = saved.touched;
        if (saved.kind && base.touched.includes('kind')) base.kind = saved.kind;
    }
    base.seed = freshSeed();
    base.sheet = null;          // 'print' | 'quiz' | 'share' | 'quizshare'
    base.fromLesson = false;
    base.built = null;          // the last build {sig, parts, docHtml, pupilHtml, keyHtml, pages, byKey, total}
    base.building = null;
    base.popup = null;          // key of the skill previewed in the popup
    base.quizLink = '';
    base.shareRes = null;
    return base;
})();
function persist() {
    writeStore(STORE_KEY, { opts: S.opts, quiz: { n: S.quiz.n, versions: S.quiz.versions, points: S.quiz.points }, share: S.share, touched: S.touched, kind: S.kind });
}
function freshSeed() { return Math.floor(Math.random() * 900000) + 100000; }
const touched = (k) => S.touched.includes(k);
const touch = (k) => { if (!touched(k)) S.touched.push(k); };

/* ================================================================= the set */

function items() {
    return currentSet().map((s) => {
        const hit = findSkill(s.categoryId, s.skillId);
        return {
            categoryId: s.categoryId, skillId: s.skillId,
            weight: Number(s.weight) > 0 ? Number(s.weight) : 0,
            lockPct: typeof s.lockPct === 'number' ? s.lockPct : undefined,
            leftOut: s.leftOut === true,
            opts: s.opts && typeof s.opts === 'object' ? s.opts : undefined,
            area: areaOf(s.categoryId, s.skillId) || 'NOSTD',
            grade: hit ? hit.level : 'M',
            label: shortLabel(hit ? hit.label : skillLabel(s.categoryId, s.skillId)),
        };
    });
}
const shortLabel = (l) => String(l || '').replace(/\s*\((?:Visual|MAP|black and white)\)/g, '').replace(/\s*\(No Pictures\)/, ' (no pictures)');
const isBig = (list) => list.length > BIG;
function autoKind(list) { if (S.fromLesson) return 'sections'; return list.length >= 2 ? 'mixed' : 'single'; }
function kindOf(list) { return S.kind || autoKind(list); }

/** How often, Less · Equal · More = 1 : 2 : 3. All the same = the default (no weight in the share code). */
function levelOf(it, list) {
    if (list.every((x) => !(x.weight > 1))) return 2;
    return it.weight >= 3 ? 3 : it.weight === 2 ? 2 : 1;
}
function setLevel(key, lv) {
    const list = items();
    const levels = Object.fromEntries(list.map((x) => [keyOf(x), levelOf(x, list)]));
    levels[key] = lv;
    const same = new Set(Object.values(levels)).size === 1;
    for (const s of currentSet()) {
        const k = `${s.categoryId}:${s.skillId}`;
        if (same) delete s.weight; else s.weight = levels[k];
    }
    window.skillQueue = [...currentSet()];
}

/** The page plan of the open sheet. */
function plan(list = items()) {
    const k = kindOf(list), o = S.opts, quiz = S.sheet === 'quiz';
    const per = PER_PAGE[o.size] || PER_PAGE.M;
    let pages = o.pages;
    if (!touched('pages')) pages = k === 'single' ? Math.max(1, list.filter((x) => !x.leftOut).length) : isBig(list) ? Math.min(30, Math.ceil(list.length / per)) : 1;
    if (quiz) pages = Math.max(1, Math.ceil(S.quiz.n / per));
    return planPages(k, list, { pages, size: o.size, each: quiz ? 'new' : o.each, seed: S.seed, quiz, total: quiz ? S.quiz.n : undefined, labelOf: (key) => (list.find((x) => keyOf(x) === key) || {}).label || key });
}

/* ================================================================= requests (the engine mapping) */

function skillRef(it, weight) {
    const o = { categoryId: it.categoryId, skillId: it.skillId, opts: it.opts || {} };
    if (weight > 1) o.weight = weight;
    return o;
}
function common(seed, quiz, version) {
    const o = S.opts;
    const h = o.header || {};
    return {
        size: o.size, look: 'auto', paper: o.paper || 'A4',
        anchors: o.examples === 'sections' || o.examples === 'side' ? o.examples : 'off',
        header: { name: h.name !== false, date: h.date !== false, score: quiz ? true : !!h.score, title: quiz && S.quiz.name ? S.quiz.name : true },
        key: { on: true, placement: o.keyPlace === 'after-page' ? 'after-page' : 'end', style: o.keyStyle === 'short' ? 'short' : 'copy' },
        seed: (seed + version * 104729) >>> 0,
    };
}
/**
 * The buildSheet requests for one copy of the paper: [{req, copies}] (copies > 1 = "Same page again": the pupil page
 * printed that many times, ONE key for all).
 */
function requests(p, list, quiz, version = 0) {
    const byKey = Object.fromEntries(list.map((x) => [keyOf(x), x]));
    const out = [];
    const each = p.each || 'new';
    let n = 0;
    const base = () => common(S.seed + 7919 * (n++), quiz, version);
    if (p.kind === 'single') {
        const layout = S.opts.layout;
        for (const it of list) {
            const pg = p.pagesBy ? p.pagesBy[keyOf(it)] || 0 : 0;
            if (!pg) continue;
            const fact = layout !== 'standard' && layoutOk(it);
            if (fact) { out.push({ req: Object.assign(base(), { role: layout, look: 'auto', sections: [{ skills: [skillRef(it)], pages: pg }] }), copies: 1, keys: [keyOf(it)] }); continue; }
            if (each === 'copy') out.push({ req: Object.assign(base(), { role: 'independent', sections: [{ skills: [skillRef(it)], pages: 1 }] }), copies: pg, keys: [keyOf(it)] });
            else if (each === 'same' && pg > 1) out.push({ req: Object.assign(base(), { role: 'more-practice', letters: LETTERS.slice(0, Math.min(10, pg)), sections: [{ skills: [skillRef(it)] }] }), copies: 1, keys: [keyOf(it)] });
            else out.push({ req: Object.assign(base(), { role: 'independent', sections: [{ skills: [skillRef(it)], pages: pg }] }), copies: 1, keys: [keyOf(it)] });
        }
        return out;
    }
    if (p.kind === 'sections') {
        // one request: a section per skill, in the plan's order, each with its count (page 1's when every page repeats)
        const unit = each !== 'new' && p.pages > 1 ? p.pageItems[0] : p.pageItems.flat();
        const counts = {}; const order = [];
        unit.forEach((k) => { if (!counts[k]) order.push(k); counts[k] = (counts[k] || 0) + 1; });
        const req = () => Object.assign(base(), { role: 'independent', sections: order.map((k) => ({ skills: [skillRef(byKey[k])], count: counts[k] })) });
        if (each === 'copy' && p.pages > 1) out.push({ req: req(), copies: p.pages, keys: order });
        else if (each === 'same' && p.pages > 1) for (let i = 0; i < p.pages; i++) out.push({ req: req(), copies: 1, keys: order });
        else out.push({ req: req(), copies: 1, keys: order });
        return out;
    }
    // Mixed practice: a full mixed page per plan page (a big tray: the page's sample of skills), each skill weighted
    // by its share (How often and any held %), as whole weights 1–9 for the engine
    const pct = p.pct || {};
    const top = Math.max(0, ...Object.values(pct));
    const w = (k) => (top > 0 ? Math.max(1, Math.round(9 * (pct[k] || 0) / top)) : 1);
    const pages = each === 'copy' && p.pages > 1 ? [p.pageItems[0]] : p.pageItems;
    for (const pg of pages) {
        const order = [...new Set(pg || [])];
        if (!order.length) continue;
        const ws = order.map(w);
        const same = ws.every((x) => x === ws[0]);
        out.push({ req: Object.assign(base(), { role: 'mixed-practice', sections: [{ skills: order.map((k, i) => skillRef(byKey[k], same ? 1 : ws[i])) }] }), copies: each === 'copy' ? p.pages : 1, keys: order });
    }
    return out;
}

/* ================================================================= Layout (fact rows / timed check), probed per skill */

const layoutCache = new Map();   // 'cat:skill|role' -> true | false | Promise
function layoutOk(it, role = S.opts.layout) {
    if (role === 'standard') return true;
    return layoutCache.get(keyOf(it) + '|' + role) === true;
}
async function probeLayouts(it) {
    const tasks = ['fact-rows', 'fact-probe'].map(async (role) => {
        const k = keyOf(it) + '|' + role;
        if (layoutCache.has(k)) return layoutCache.get(k);
        const pr = buildSheet({ role, sections: [{ skills: [skillRef(it)], pages: 1 }], size: 'M', seed: 11, key: false })
            .then(() => true, () => false)
            .then((ok) => { layoutCache.set(k, ok); return ok; });
        layoutCache.set(k, pr);
        return pr;
    });
    await Promise.all(tasks);
}

/* ================================================================= building */

function sigOf(p, list, quiz) {
    return JSON.stringify({ k: p.kind, pi: p.pageItems, pb: p.pagesBy, o: S.opts, seed: S.seed, quiz: quiz ? { v: S.quiz.versions, n: S.quiz.n, name: S.quiz.name } : null,
        skills: list.map((x) => [keyOf(x), x.opts || null, x.leftOut ? 0 : 1]) });
}

/** Build every page (all versions). Calls onFirst(firstPupilHtml) as soon as page 1 exists. */
async function buildAll(p, list, quiz, onFirst) {
    const versions = quiz ? Math.max(1, Math.min(6, S.quiz.versions)) : 1;
    const out = { pupil: [], key: [], doc: '', pages: 0, keyPages: 0, byKey: {}, total: 0, errors: [], perVersion: [] };
    let first = true;
    for (let v = 0; v < versions; v++) {
        let vp = '', vk = '', vd = '', after = false;
        for (const part of requests(p, list, quiz, v)) {
            const rq = versions > 1 ? Object.assign({}, part.req, { keySection: `Version ${v + 1}` }) : part.req;
            let res;
            try { res = await buildSheet(rq); } catch (e) {
                out.errors.push((e && e.message) || 'This page could not be built.');
                continue;
            }
            if (first && onFirst) { first = false; onFirst(res.pupilHtml); }
            const copies = Math.max(1, part.copies || 1);
            let pupil = res.pupilHtml;
            if (copies > 1) pupil = Array.from({ length: copies }, () => res.pupilHtml).join('\n');
            vp += pupil + '\n';
            vk += (res.keyHtml || '') + '\n';
            if (res.keyOptions && res.keyOptions.placement === 'after-page') { after = true; vd += (copies > 1 ? pupil + (res.keyHtml || '') : (res.docHtml || pupil)) + '\n'; }
            out.pages += (res.pageCount || 0) * copies;
            out.keyPages += res.keyPageCount || 0;
            for (const it of res.items || []) {
                if (!it || !it.skill) continue;
                out.byKey[it.skill] = (out.byKey[it.skill] || 0) + copies;
                out.total += copies;
            }
        }
        // each version: its pupil pages, then its own key (or each page followed by its key)
        out.pupil.push(vp); out.key.push(vk);
        out.doc += (after ? vd : vp + vk);
    }
    out.pupilHtml = out.pupil.join('\n');
    out.keyHtml = out.key.join('\n');
    // totals per version (every version holds the same number of problems)
    out.total = Math.round(out.total / versions);
    out.pages = Math.round(out.pages / versions);
    for (const k of Object.keys(out.byKey)) out.byKey[k] = Math.round(out.byKey[k] / versions);
    out.versions = versions;
    return out;
}

let buildTimer = null;
let token = 0;
function scheduleBuild(delay = 250) {
    clearTimeout(buildTimer);
    buildTimer = setTimeout(runBuild, delay);
}
async function runBuild() {
    if (!S.sheet || S.sheet === 'share' || S.sheet === 'quizshare') return;
    const list = items();
    if (!list.length) { S.built = null; renderSide(); return; }
    const p = plan(list);
    const quiz = S.sheet === 'quiz';
    if (p.error) { S.built = null; renderSide(); return; }
    const sig = sigOf(p, list, quiz);
    if (S.built && S.built.sig === sig) { renderSide(); return; }
    const my = ++token;
    S.building = sig;
    renderSide();
    const res = await buildAll(p, list, quiz, (html) => { if (my === token) showPreview(html); });
    if (my !== token) return;
    res.sig = sig;
    S.built = res;
    S.building = null;
    renderSide();
    if (res.pupil[0]) showPreview(res.pupil[0]);
}

/* ================================================================= the summary line */

function summary() {
    const list = items();
    if (!list.length) return { line: 'Tick skills first', more: '' };
    const p = plan(list);
    if (p.error) return { line: p.error, more: '', error: true };
    const quiz = S.sheet === 'quiz';
    const b = S.built && !S.building ? S.built : null;
    if (!b) return { line: 'Counting the problems…', more: '', busy: true };
    const noun = quiz ? 'questions' : 'problems';
    const pg = `${b.pages} page${b.pages === 1 ? '' : 's'}`;
    const pts = quiz ? ` · ${b.total * (S.quiz.points === 2 ? 2 : 1)} points` : '';
    const ver = quiz && b.versions > 1 ? ` · ${b.versions} versions, each with its own order and key` : '';
    const active = list.filter((x) => !x.leftOut);
    const left = list.length - active.length ? ` · ${list.length - active.length} left out` : '';
    const shown = active.filter((x) => (b.byKey[keyOf(x)] || 0) > 0).length;
    const err = b.errors.length ? ` · ${b.errors.length} part${b.errors.length > 1 ? 's' : ''} could not be built` : '';
    if (isBig(list)) {
        const areas = byArea(active);
        const hit = areas.filter((a) => a.list.some((x) => b.byKey[keyOf(x)] > 0)).length;
        const cover = shown >= active.length ? 'every skill at least once' : `a sample of ${shown} of ${active.length} skills, New numbers re-deals the sample`;
        return { line: `${pg} · ${b.total} ${noun} · ${hit === areas.length ? `${areas.length} area${areas.length > 1 ? 's' : ''}` : `${hit} of ${areas.length} areas`} · ${cover}${left}${pts}${ver}${err}`,
            more: areas.map((a) => `${AREAS[a.area].short} ${a.list.reduce((t, x) => t + (b.byKey[keyOf(x)] || 0), 0)}`).join(', ') + ' · answer key at the end' };
    }
    const names = list.map((x) => `${x.label} ${x.leftOut ? '(left out)' : b.byKey[keyOf(x)] || 0}`).join(', ');
    const warn = p.warn.length ? ' · ' + p.warn.join(' ') : '';
    const each = quiz ? 'new' : p.each;
    if (each === 'copy') return { line: `${b.pages} copies of the same page · ${b.total / Math.max(1, b.pages) | 0} ${noun} on each · ${b.total} in all · one key: “Key for all ${b.pages} copies”${left}`, more: names + ' · New numbers re-deals the page' };
    if (each === 'same') return { line: `${pg} · the same ${noun} on each, new numbers · ${b.total} in all · answer key at the end${left}`, more: names + ' · New numbers re-deals every page' };
    return { line: `${pg} · ${b.total} ${noun}${pts} · answer key at the end${left}${ver}${err}`,
        more: names + (p.added === 'single' ? ` · pages raised to ${p.pages} so every skill keeps a page and the held % is met` : p.added ? ' · pages added so every skill comes up at least twice' : '') + warn };
}
function byArea(list) {
    const by = {};
    list.forEach((x) => (by[x.area] = by[x.area] || []).push(x));
    return AREA_ORDER.filter((a) => by[a]).map((a) => ({ area: a, list: by[a] }));
}
function byGrade(list) {
    const by = {};
    list.forEach((x) => (by[x.grade] = by[x.grade] || []).push(x));
    return GRADE_ORDER.filter((g) => by[g]).map((g) => ({ grade: g, list: by[g] }));
}

/* ================================================================= markup helpers */

const gradeName = (g) => (g === 'K' ? 'Kindergarten' : g === 'M' ? 'Mixed levels' : `Grade ${g}`);
const gradeBadge = (g) => `<span class="tvs-grade" aria-label="${esc(gradeName(g))}">${esc(g === 'M' ? 'M' : g)}</span>`;
function chip(it) {
    const a = AREAS[it.area] || AREAS.NOSTD;
    return `<span class="tvs-chip" data-domain="${esc(it.area)}">${gradeBadge(it.grade)}${areaIcon(it.area, 18)}<span class="tvs-chip-name">${esc(it.label)}</span><span class="tvs-chip-area">${esc(a.short)}</span></span>`;
}
function seg(act, cur, list, label, extra = '') {
    return `<div class="tvs-seg" role="group" aria-label="${esc(label)}"${extra}>${list.map(([v, l]) => `<button type="button" class="tvs-btn" data-act="${act}" data-v="${esc(v)}" aria-pressed="${String(cur) === String(v)}">${String(cur) === String(v) ? icon('check', 16) : ''}<span>${esc(l)}</span></button>`).join('')}</div>`;
}
function stepper(act, v, min, max, label) {
    return `<div class="tvs-stepper" role="group" aria-label="${esc(label)}"><button type="button" class="tvs-btn" data-act="${act}" data-v="${v - 1}" aria-label="Fewer"${v <= min ? ' disabled' : ''}>${icon('minus', 18)}</button><output class="tvs-step-n" aria-live="polite">${v}</output><button type="button" class="tvs-btn" data-act="${act}" data-v="${v + 1}" aria-label="More"${v >= max ? ' disabled' : ''}>${icon('plus', 18)}</button></div>`;
}
function row(title, sub, body, id = '') {
    return `<section class="tvs-row"${id ? ` id="${id}"` : ''}><div class="tvs-row-head"><h3 class="tvs-row-title">${esc(title)}</h3>${sub ? `<p class="tvs-row-sub">${esc(sub)}</p>` : ''}</div><div class="tvs-row-body">${body}</div></section>`;
}
function radios(act, cur, list, label) {
    return `<div class="tvs-radios" role="radiogroup" aria-label="${esc(label)}">${list.map(([v, l]) => `<button type="button" class="tvs-radio" role="radio" data-act="${act}" data-v="${esc(v)}" aria-checked="${cur === v}"><span class="tvs-radio-dot" aria-hidden="true"></span><span>${esc(l)}</span></button>`).join('')}</div>`;
}

/* ================================================================= the sheet frame */

let root = null;
let lastFocus = null;
const INERT = ['teacherMain'];

function open(kind, ctx = {}) {
    if (!['print', 'quiz', 'share'].includes(kind)) kind = 'print';
    lastFocus = document.activeElement;
    S.sheet = kind;
    S.fromLesson = !!ctx.fromLesson;
    if (S.fromLesson && !touched('kind')) S.kind = null;
    S.quizLink = '';
    S.popup = null;
    if (kind === 'quiz') {
        if (ctx.buildFrom) { S.quiz.from = ctx.buildFrom; S.quiz.fromQuery = ''; } else if (!currentSet().length && S.quiz.from === 'skills') S.quiz.from = 'ccss';
        if (currentSet().length && !ctx.buildFrom) S.quiz.from = 'skills';
    }
    mount();
    render();
    if (kind === 'share') makeLink();
    else scheduleBuild(0);
    const one = items();
    if (one.length === 1) probeLayouts(one[0]).then(() => { if (S.sheet && S.sheet !== 'share') renderMain(); });
}
function close() {
    S.sheet = null;
    S.popup = null;
    token++;
    persist();
    if (root) root.remove();
    root = null;
    for (const id of INERT) { const el = document.getElementById(id); if (el) el.removeAttribute('inert'); }
    document.querySelectorAll('#teacherApp .tv2-nav').forEach((el) => el.removeAttribute('inert'));
    document.body.classList.remove('tvs-open');
    document.removeEventListener('keydown', onKey, true);
    if (lastFocus && lastFocus.isConnected) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* */ } }
}
function mount() {
    if (root && root.isConnected) return;
    const host = document.getElementById('teacherApp') || document.body;
    root = document.createElement('div');
    root.id = 'tvSheet';
    root.className = 'tvs-overlay';
    host.appendChild(root);
    for (const id of INERT) { const el = document.getElementById(id); if (el) el.setAttribute('inert', ''); }
    document.querySelectorAll('#teacherApp .tv2-nav').forEach((el) => el.setAttribute('inert', ''));
    document.body.classList.add('tvs-open');
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey, true);
}
function onKey(e) {
    if (!root) return;
    if (e.key === 'Escape') {
        if (document.getElementById('tvBoardOverlay')) return;
        e.preventDefault();
        if (S.popup) { S.popup = null; renderPopup(); return; }
        close();
    }
}

function titles() {
    const n = currentSet().length;
    const kick = `${S.sheet === 'quiz' ? 'Quiz' : S.sheet === 'share' || S.sheet === 'quizshare' ? 'Share' : 'Print'} · ${n} skill${n === 1 ? '' : 's'}`;
    const h = S.sheet === 'quiz' ? 'Make a quiz' : S.sheet === 'quizshare' ? 'Share the quiz with pupils' : S.sheet === 'share' ? 'Share with pupils' : 'Print a worksheet';
    return { kick, h };
}
function render() {
    if (!root) return;
    const t = titles();
    const narrow = S.sheet === 'share' || S.sheet === 'quizshare';
    root.innerHTML = `<div class="tvs-sheet${narrow ? ' tvs-narrow' : ''}" role="dialog" aria-modal="true" aria-labelledby="tvsTitle">
  <header class="tvs-head"><div><p class="tvs-kicker">${esc(t.kick)}</p><h2 class="tvs-title" id="tvsTitle">${esc(t.h)}</h2></div>
    <button type="button" class="tvs-btn tvs-close" data-act="close" aria-label="Close">${icon('x', 22)}</button></header>
  ${narrow ? '<div class="tvs-body tvs-body-one" id="tvsMain"></div>' : `<div class="tvs-body"><div class="tvs-main" id="tvsMain"></div><aside class="tvs-side" id="tvsSide" aria-label="Summary and preview"></aside></div>`}
  <div class="tvs-popup" id="tvsPopup" hidden></div>
</div>`;
    renderMain();
    if (!narrow) renderSide();
    const first = root.querySelector('.tvs-close');
    if (first) first.focus({ preventScroll: true });
}

/* ================================================================= main column */

function renderMain() {
    const box = root && root.querySelector('#tvsMain');
    if (!box) return;
    const keep = box.scrollTop;
    if (S.sheet === 'share') box.innerHTML = shareHTML();
    else if (S.sheet === 'quizshare') box.innerHTML = quizShareHTML();
    else box.innerHTML = optionsHTML();
    box.scrollTop = keep;
    // the side panel's content follows the options on a phone (the preview is never first)
    const side = root.querySelector('#tvsSide');
    if (side) side.dataset.kind = kindOf(items());
}

function skillsHTML(list) {
    if (!list.length) return '';
    if (isBig(list)) {
        const grades = byGrade(list).map((g) => g.grade);
        const gt = grades.length === 1 ? gradeName(grades[0]) : `${grades.length} grades`;
        return `<div class="tvs-trayline"><p class="tvs-strong">${esc(gt)} · ${list.length} skills · ${byArea(list).length} maths areas</p>${typeof window.tvOpenTray === 'function' ? `<button type="button" class="tvs-btn" data-act="tray">Open the tray ▸</button>` : ''}</div>${groupedListHTML(list)}`;
    }
    if (list.length > CHIP_MAX) return groupedListHTML(list);
    return `<div class="tvs-chips">${list.map(chip).join('')}</div>`;
}
/** Queued item 2: above 5 skills a list grouped area → grade (no chips); each row opens a popup preview. */
function groupedListHTML(list) {
    return `<div class="tvs-glist">${byArea(list).map((a) => `<div class="tvs-garea" data-domain="${esc(a.area)}"><p class="tvs-garea-name">${areaIcon(a.area, 18)}<span>${esc(AREAS[a.area].name)}</span><span class="tvs-muted">${a.list.length} skill${a.list.length > 1 ? 's' : ''}</span></p>${byGrade(a.list).map((g) => `<ul class="tvs-gg" aria-label="${esc(AREAS[a.area].short + ', ' + gradeName(g.grade))}">${g.list.map((x) => `<li><button type="button" class="tvs-grow" data-act="popup" data-v="${esc(keyOf(x))}">${gradeBadge(x.grade)}<span class="tvs-grow-name">${esc(x.label)}</span>${x.leftOut ? '<span class="tvs-muted">left out</span>' : ''}${icon('eye', 18)}</button></li>`).join('')}</ul>`).join('')}</div>`).join('')}</div>`;
}

function optionsHTML() {
    const list = items();
    const quiz = S.sheet === 'quiz';
    let h = '';
    if (quiz && (S.quiz.from !== 'skills' || !list.length)) h += buildFromHTML(list);
    if (!list.length) {
        return h + (quiz ? '' : `<div class="tvs-empty"><p class="tvs-strong">Tick skills first</p><p class="tvs-muted">Tick one or more skills on Skills, then press Print.</p></div>`);
    }
    if (quiz) h += `<div class="tvs-field"><label class="tvs-label" for="tvsQuizName">Quiz name</label><input id="tvsQuizName" class="tvs-input" data-in="quizname" value="${esc(S.quiz.name || autoQuizName(list))}"></div>`;
    h += skillsHTML(list);
    const p = plan(list);
    const k = p.kind;
    h += `<div class="tvs-kinds" role="radiogroup" aria-label="Kind of worksheet">${[['single', 'Single skill', 'One skill on a page'], ['sections', 'Sections', 'Each skill in its own part'], ['mixed', 'Mixed practice', 'Skills mixed together']].map(([v, l, s]) => `<button type="button" class="tvs-kind" role="radio" data-act="kind" data-v="${v}" aria-checked="${k === v}">${k === v ? icon('check', 18) : ''}<span class="tvs-kind-name">${l}</span><span class="tvs-kind-sub">${s}</span></button>`).join('')}</div>`;
    if (!S.kind) h += `<p class="tvs-muted tvs-chosen">Chosen for you: ${S.fromLesson ? 'practice from a lesson prints in Sections' : list.length === 1 ? 'one skill makes a Single skill page' : `${list.length} skills make a Mixed practice page`}.</p>`;
    if (p.error) h += `<p class="tvs-warn" role="alert">${icon('info', 18)}<span>${esc(p.error)} Change the held amounts in the tray.</span></p>`;
    else if (p.warn.length) h += p.warn.map((w) => `<p class="tvs-warn">${icon('info', 18)}<span>${esc(w)}</span></p>`).join('');

    // How many pages? / questions?
    if (quiz) {
        h += row('How many questions?', 'Shared by how often each skill comes up', `<div class="tvs-pages">${stepper('qn', S.quiz.n, 1, 60, 'Questions')}${seg('qn', S.quiz.n, [['5', '5'], ['10', '10'], ['20', '20']], 'Questions')}</div>`);
    } else {
        const pg = p.pagesBy ? Math.max(1, Object.values(p.pagesBy).reduce((a, b) => a + b, 0)) : p.pages;
        const sub = k === 'single' && list.length > 1 ? 'Shared by how often each skill comes up; starts at one page per skill' : isBig(list) ? `${p.total} problems; fewer pages take a sample of the skills` : 'The key follows';
        h += row('How many pages?', sub, `<div class="tvs-pages">${stepper('pages', pg, 1, 30, 'Pages')}${seg('pages', pg, [['2', '2'], ['3', '3'], ['5', '5']], 'Pages')}</div>`);
    }
    // How often
    if (list.length > 1 && !isBig(list)) {
        h += row('How often does each skill come up?', 'Less · Equal · More = 1 : 2 : 3', `<div class="tvs-often">${list.map((x) => `<div class="tvs-often-row"><span class="tvs-often-name" data-domain="${esc(x.area)}">${gradeBadge(x.grade)}<span>${esc(x.label)}</span></span>${x.lockPct !== undefined ? `<span class="tvs-held">${Math.round(x.lockPct)} % ${icon('lock', 16)}</span>` : seg('often', levelOf(x, list), [['1', 'Less'], ['2', 'Equal'], ['3', 'More']], 'How often: ' + x.label, ` data-key="${esc(keyOf(x))}"`)}</div>`).join('')}</div>`);
    } else if (isBig(list)) {
        const pct = p.pct || {};
        h += row('How often does each area come up?', 'Set in the tray: one place for every skill’s How often', `<table class="tvs-areas"><tbody>${byArea(list.filter((x) => !x.leftOut)).map((a) => `<tr data-domain="${esc(a.area)}"><th scope="row">${areaIcon(a.area, 18)}<span>${esc(AREAS[a.area].short)}</span></th><td>${a.list.length} skill${a.list.length > 1 ? 's' : ''}</td><td>${Math.round(a.list.reduce((t, x) => t + (pct[keyOf(x)] || 0), 0))} %</td></tr>`).join('')}</tbody></table>${typeof window.tvOpenTray === 'function' ? '<button type="button" class="tvs-btn" data-act="tray">Fine-tune in the tray ▸</button>' : ''}`);
    }
    // Examples (anchors.js: off · sections · side; 'top' and 'first' are not in the engine yet)
    h += row('Examples', 'Worked examples on the page', radios('examples', S.opts.examples, [['off', 'None'], ['sections', 'An example to start each group'], ['side', 'An example with each problem (where it fits)']], 'Examples'));
    // Each page (only with more than one page; a quiz uses versions instead)
    if (!quiz && p.pages > 1) {
        h += row('Each page', S.opts.each === 'copy' ? `One key: “Key for all ${p.pages} copies”` : 'What changes from page to page', seg('each', S.opts.each, [['new', 'New problems'], ['same', 'Same problems, new numbers'], ['copy', 'Same page again']], 'Each page'));
    }
    // Layout: Single skill only, and only for a skill whose items fit the fact layouts
    if (k === 'single' && list.some((x) => layoutOk(x, 'fact-rows') || layoutOk(x, 'fact-probe'))) {
        const opts = [['standard', 'Standard']];
        if (list.some((x) => layoutOk(x, 'fact-rows'))) opts.push(['fact-rows', 'Fact rows (5–10 across)']);
        if (list.some((x) => layoutOk(x, 'fact-probe'))) opts.push(['fact-probe', 'Timed check']);
        h += row('Layout', 'Only for skills that have one', seg('layout', S.opts.layout, opts, 'Layout'));
    }
    h += row('Size', 'Bigger digits, fewer problems', seg('size', S.opts.size, [['S', 'S'], ['M', 'M'], ['L', 'L']], 'Size'));
    if (quiz) {
        h += row('Points', 'Shown on the summary', seg('points', S.quiz.points, [['1', '1 per question'], ['2', '2 per question']], 'Points'));
        h += row('How many versions?', 'Each version has its own order and its own key', stepper('versions', S.quiz.versions, 1, 6, 'Versions'));
    }
    h += moreHTML();
    return h;
}
function moreHTML() {
    const o = S.opts, hd = o.header || {};
    const ck = (key, label) => `<label class="tvs-check"><input type="checkbox" data-in="hdr" data-v="${key}"${hd[key] !== false ? ' checked' : ''}><span>${esc(label)}</span></label>`;
    return `<details class="tvs-more"${S.moreOpen ? ' open' : ''}><summary class="tvs-more-sum">More options</summary>
  ${row('Header', 'On every pupil page', `<div class="tvs-checks">${ck('name', 'Name')}${ck('date', 'Date')}${S.sheet === 'quiz' ? '' : `<label class="tvs-check"><input type="checkbox" data-in="hdr" data-v="score"${hd.score ? ' checked' : ''}><span>Score</span></label>`}</div>`)}
  ${row('Answer key', 'Where it prints and how it looks', `${seg('keyplace', o.keyPlace === 'after-page' ? 'after-page' : 'end', [['end', 'At the end'], ['after-page', 'After each page']], 'Key placement')}${seg('keystyle', o.keyStyle === 'short' ? 'short' : 'copy', [['copy', 'Copy of the page'], ['short', 'Answers only']], 'Key style')}`)}
  ${row('Paper', '', seg('paper', o.paper === 'Letter' ? 'Letter' : 'A4', [['A4', 'A4'], ['Letter', 'Letter']], 'Paper'))}
  <p class="tvs-muted">The old Print worksheets screen (every page type) is still under Skills › <button type="button" class="tvs-link" data-act="oldprint">Print worksheets</button>.</p>
</details>`;
}
function autoQuizName(list) {
    if (S.quiz.std) return `Quiz: ${S.quiz.std}`;
    return `Quiz: ${list.slice(0, 2).map((x) => x.label).join(' and ')}${list.length > 2 ? ` and ${list.length - 2} more` : ''}`;
}

/* ================================================================= side column: summary, preview, actions */

function renderSide() {
    const side = root && root.querySelector('#tvsSide');
    if (!side) return;
    const sm = summary();
    const quiz = S.sheet === 'quiz';
    const has = items().length > 0;
    const ready = has && !sm.error && S.built && !S.building;
    const first = side.querySelector('#tvsPrevBox');
    side.innerHTML = `<div class="tvs-sum" aria-live="polite"><p class="tvs-sum-line${sm.error ? ' is-error' : ''}" data-tvs-summary>${esc(sm.line)}</p>${sm.more ? `<p class="tvs-sum-more">${esc(sm.more)}</p>` : ''}</div>
  <div class="tvs-prev" id="tvsPrevBox">${has ? '<iframe class="tvs-prev-frame" id="tvsPrevFrame" title="Page 1 preview" tabindex="-1"></iframe>' : ''}</div>
  ${has ? '<p class="tvs-muted tvs-prev-cap">First page · every item drawn live by the app · Print shows every page</p>' : ''}
  <div class="tvs-actions">
    <button type="button" class="tvs-btn tvs-primary" data-act="print"${ready ? '' : ' aria-disabled="true"'}>${icon('print', 20)}<span>${has ? 'Print' : 'Tick skills first'}</span></button>
    ${quiz ? `<button type="button" class="tvs-btn" data-act="quizshare"${has ? '' : ' aria-disabled="true"'}>${icon('link', 18)}<span>Share with pupils</span></button>
    <button type="button" class="tvs-btn" data-act="quizsave"${has ? '' : ' aria-disabled="true"'}>${icon('bookmark', 18)}<span>Save</span></button>` : ''}
    <button type="button" class="tvs-btn" data-act="renew"${has ? '' : ' aria-disabled="true"'}>${icon('shuffle', 18)}<span>New numbers</span></button>
  </div>`;
    if (first) { /* the iframe was replaced: redraw it */ }
    if (S.built && S.built.pupil && S.built.pupil[0] && !S.building) showPreview(S.built.pupil[0]);
    else if (S.firstHtml) showPreview(S.firstHtml);
}
function showPreview(html) {
    S.firstHtml = html;
    const frame = root && root.querySelector('#tvsPrevFrame');
    if (!frame || !html) return;
    if (frame.dataset.html === String(html.length) + ':' + html.slice(0, 64)) return;
    frame.dataset.html = String(html.length) + ':' + html.slice(0, 64);
    const extra = '<style>html,body{background:#fff!important;margin:0!important;padding:0!important;overflow:hidden!important}.ws-page{margin:0!important;outline:0!important;box-shadow:none!important}</style>';
    const doc = sheetDocument(html, 'Preview', { paper: S.opts.paper || 'A4' }).replace('</head>', extra + '</head>');
    frame.onload = () => {
        try {
            const pages = frame.contentDocument.querySelectorAll('.ws-page');
            pages.forEach((p, i) => { if (i > 0) p.remove(); });
        } catch (e) { /* preview only */ }
    };
    frame.srcdoc = doc;
}

/* ================================================================= popup preview (a row of the grouped list) */

function renderPopup() {
    const box = root && root.querySelector('#tvsPopup');
    if (!box) return;
    const it = S.popup ? items().find((x) => keyOf(x) === S.popup) : null;
    if (!it) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    box.innerHTML = `<div class="tvs-pop" role="dialog" aria-modal="true" aria-labelledby="tvsPopT" data-domain="${esc(it.area)}">
  <div class="tvs-pop-head"><p class="tvs-pop-title" id="tvsPopT">${gradeBadge(it.grade)}${areaIcon(it.area, 18)}<span>${esc(it.label)}</span></p><button type="button" class="tvs-btn tvs-close" data-act="popclose" aria-label="Close the preview">${icon('x', 20)}</button></div>
  <div class="tvp-frame tvs-pop-frame" id="tvsPopFrame"></div>
  <p class="tvs-muted">${esc(AREAS[it.area].name)} · ${esc(gradeName(it.grade))}</p>
</div>`;
    try { mountSample(box.querySelector('#tvsPopFrame'), it.categoryId, it.skillId, it.opts); } catch (e) { /* preview only */ }
    box.querySelector('[data-act="popclose"]').focus();
}

/* ================================================================= Build from (the Quiz sheet, tray empty) */

const FROM = [['skills', 'Ticked skills'], ['ccss', 'A standard (CCSS)'], ['ee', 'An Essential Element'], ['wrm', 'A White Rose unit or step'], ['lesson', 'A lesson']];
function buildFromHTML(list) {
    const f = S.quiz.from;
    let h = `<section class="tvs-from" aria-labelledby="tvsFromH"><p class="tvs-kicker" id="tvsFromH">Build from</p>${seg('from', f, FROM.filter(([v]) => v !== 'skills' || list.length), 'Build from')}`;
    if (f === 'skills') return h + '</section>';
    const ph = { ccss: 'A code like 2.NBT.5, or words like “add within 100”', ee: 'A code like EE.3.OA.4, or words', wrm: 'A unit or step: “Y3 addition”, “Place value”', lesson: 'A lesson name' }[f];
    h += `<div class="tvs-field"><label class="tvs-label" for="tvsFromQ">Search</label><input id="tvsFromQ" class="tvs-input" data-in="fromq" type="search" autocomplete="off" placeholder="${esc(ph)}" value="${esc(S.quiz.fromQuery)}"></div>`;
    h += `<ul class="tvs-from-list" id="tvsFromList">${fromResultsHTML()}</ul>`;
    if (!list.length) h += '<p class="tvs-muted">Pick one: its skills make the quiz (up to 6). You can change any of them after.</p>';
    return h + '</section>';
}
function fromResults() {
    const f = S.quiz.from, q = String(S.quiz.fromQuery || '').trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    const match = (txt) => !words.length || words.every((w) => txt.toLowerCase().includes(w));
    const out = [];
    const norm = (c) => String(c).toLowerCase().replace(/^m\./, '');
    if (f === 'ccss') {
        for (const s of CCSS_STANDARDS) {
            if (!match(`${s.code} ${s.short || ''} ${s.text}`) && !(q && norm(s.short || '').startsWith(norm(q)))) continue;
            const keys = skillsForStandard(s.code);
            if (keys.length) out.push({ id: s.code, code: s.short || s.code, text: s.text, keys });
            if (out.length >= 40) break;
        }
    } else if (f === 'ee') {
        const idx = {};
        for (const [k, e] of Object.entries(SKILL_STANDARDS)) for (const c of (e && e.ee) || []) (idx[c] = idx[c] || []).push(k);
        for (const s of ESSENTIAL_ELEMENTS) {
            if (!match(`${s.code} ${s.text}`)) continue;
            const keys = idx[s.code] || [];
            if (keys.length) out.push({ id: s.code, code: s.code.replace(/^M\./, ''), text: s.text, keys });
            if (out.length >= 40) break;
        }
    } else if (f === 'wrm') {
        const blocks = Object.values(WRM_BLOCKS);
        for (const b of blocks) {
            const steps = Object.values(WRM_STEPS).filter((s) => String(s.id).startsWith(b.id + '.'));
            const keys = [...new Set(steps.flatMap((s) => skillsForWrmStep(s.id)))];
            const yr = String(b.id).split('.')[0];
            if (keys.length && match(`${yr} ${b.id} ${b.name} unit`)) out.push({ id: b.id, code: `${yr} unit`, text: b.name, keys });
            for (const s of steps) {
                const sk = skillsForWrmStep(s.id);
                if (sk.length && words.length && match(`${yr} ${s.id} ${s.title} ${b.name}`)) out.push({ id: s.id, code: `${yr} step`, text: s.title, keys: sk });
            }
            if (out.length >= 40) break;
        }
    } else if (f === 'lesson') {
        for (const l of SITE_LESSONS) {
            const [id, grade, name, , , ccss] = l;
            if (!match(`${grade} ${name}`)) continue;
            const keys = [...new Set((ccss || []).flatMap((c) => skillsForStandard(c)))];
            if (keys.length) out.push({ id, code: gradeName(grade), text: name, keys });
            if (out.length >= 40) break;
        }
    }
    return out.map((r) => Object.assign(r, { keys: r.keys.filter((k) => { const [c, s] = k.split(':'); return !!findSkill(c, s); }) })).filter((r) => r.keys.length);
}
function fromResultsHTML() {
    const res = fromResults();
    if (!res.length) return `<li class="tvs-muted">Nothing found${S.quiz.fromQuery ? ` for “${esc(S.quiz.fromQuery)}”` : ''}.</li>`;
    return res.slice(0, 40).map((r) => `<li><button type="button" class="tvs-from-row" data-act="pickfrom" data-v="${esc(r.id)}"><span class="tvs-from-code">${esc(r.code)}</span><span class="tvs-from-text">${esc(r.text)}</span><span class="tvs-muted">${r.keys.length} skill${r.keys.length > 1 ? 's' : ''}</span></button></li>`).join('');
}
function pickFrom(id) {
    const r = fromResults().find((x) => x.id === id);
    if (!r) return;
    if (typeof window.UnifiedSkills !== 'undefined' && window.UnifiedSkills.clear) window.UnifiedSkills.clear();
    r.keys.slice(0, MAX_FROM).forEach((k) => { const [c, s] = k.split(':'); addToCurrentSet(c, s); });
    window.skillQueue = [...currentSet()];
    S.quiz.std = r.code && /unit|step|Grade|Kinder|Mixed/.test(r.code) ? r.text : r.code;
    S.quiz.name = `Quiz: ${S.quiz.std}`;
    S.quiz.from = 'skills';
    if (!touched('kind')) S.kind = null;
    render();
    scheduleBuild(0);
    toast(`${Math.min(MAX_FROM, r.keys.length)} skills in the tray`);
}

/* ================================================================= Share (a code and a link at once) */

function makeLink() {
    const s = S.share;
    S.shareRes = currentSet().length ? makeShareLink({ gameMode: s.gameMode, problemCount: s.problemCount, timer: s.timer }, 'direct', !!s.lock) : null;
    renderMain();
}
function shareHTML() {
    const list = items();
    if (!list.length) return `<div class="tvs-empty"><p class="tvs-strong">Tick skills first</p><p class="tvs-muted">Tick one or more skills on Skills, then press Share.</p></div>`;
    const r = S.shareRes;
    const code = r ? pupilCode(r.code) : '';
    const s = S.share;
    const sel = (field, label, opts) => `<div class="tvs-field"><label class="tvs-label" for="tvsSh_${field}">${esc(label)}</label><select id="tvsSh_${field}" class="tvs-input" data-in="share" data-v="${field}">${opts.map(([v, l]) => `<option value="${esc(v)}"${String(s[field]) === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
    return `${skillsHTML(list)}
  <div class="tvs-codebox">${r ? `<p class="tvs-muted">Code · ${code.replace(/-/g, '').length} characters</p><p class="tvs-code" aria-label="Code ${esc(code.split('-').join(' dash '))}">${esc(code)}</p><p class="tvs-link-line"><code>${esc(r.link)}</code></p>` : '<p class="tvs-warn">Could not make a link for this set.</p>'}</div>
  <p class="tvs-muted">Pupils open the link, or type the code, and start straight away.</p>
  <div class="tvs-share-actions">
    <button type="button" class="tvs-btn tvs-primary" data-act="copylink"${r ? '' : ' aria-disabled="true"'}>${icon('copy', 20)}<span>Copy link</span></button>
    <div class="tvs-two"><button type="button" class="tvs-btn" data-act="board"${r ? '' : ' aria-disabled="true"'}>${icon('board', 18)}<span>Show on the board</span></button><button type="button" class="tvs-btn" data-act="copycode"${r ? '' : ' aria-disabled="true"'}>${icon('copy', 18)}<span>Copy code</span></button></div>
    <button type="button" class="tvs-btn" data-act="close">Done</button>
  </div>
  <details class="tvs-more"${S.moreOpen ? ' open' : ''}><summary class="tvs-more-sum">More options</summary><div class="tvs-fields">
    ${sel('gameMode', 'Mode', [['?', "Pupil's choice"], ['practice', 'Practice'], ['boss', 'Boss Battle'], ['race', 'Car Race'], ['worksheet', 'Worksheet']])}
    ${sel('timer', 'Timer', [['?', "Pupil's choice"], ['0', 'No limit'], ['60', '1 min'], ['120', '2 min'], ['180', '3 min'], ['300', '5 min'], ['600', '10 min'], ['900', '15 min']])}
    ${sel('problemCount', 'Number of problems', [['?', "Pupil's choice"], ['10', '10'], ['15', '15'], ['20', '20'], ['25', '25'], ['30', '30'], ['50', '50'], ['0', 'Unlimited']])}
    <label class="tvs-check"><input type="checkbox" data-in="sharelock"${s.lock ? ' checked' : ''}><span>Lock (pupils cannot change the skills)</span></label>
  </div></details>`;
}

/* ================================================================= Quiz: Save and Share with pupils */

async function quizTest() {
    const list = items().filter((x) => !x.leftOut);
    const k = kindOf(list);
    const pc = planCounts(list, S.quiz.n, { seed: S.seed });
    if (pc.error) throw new Error(pc.error);
    const bySkill = [];
    list.forEach((it, i) => {
        const qs = [], seen = new Set();
        const want = pc.counts[i] || 0;
        for (let j = 0, tries = 0; qs.length < want && tries < want * 4 + 4; tries++, j++) {
            let q = null;
            try { q = generateQuestionFor({ category: it.categoryId, skill: it.skillId, opts: it.opts, seed: (S.seed + j * 7919 + i * 104729) >>> 0, itemIndex: qs.length, itemCount: want }); } catch (e) { q = null; }
            if (!q) continue;
            const sig = String(q.text || '') + '|' + JSON.stringify(q.ans);
            if (seen.has(sig) && tries < want * 3) continue;
            seen.add(sig);
            qs.push({ skillId: it.skillId, questionData: quizQuestionData(q), points: S.quiz.points === 2 ? 2 : 1 });
        }
        bySkill.push({ it, qs });
    });
    let sections;
    if (k === 'mixed') {
        const all = bySkill.flatMap((b) => b.qs);
        let a = S.seed >>> 0 || 1;
        const r = () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 1e6) / 1e6; };
        for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
        sections = [{ id: 0, label: 'Mixed practice', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: all.map((q, i) => Object.assign({ id: i }, q)) }];
    } else {
        sections = bySkill.filter((b) => b.qs.length).map((b, si) => ({ id: si, label: b.it.label, layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: b.qs.map((q, i) => Object.assign({ id: i }, q)) }));
    }
    return {
        id: S.quiz.savedId || null, name: (S.quiz.name || autoQuizName(list)).trim() || 'Quiz',
        createdAt: null, updatedAt: null, sections,
        settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: S.quiz.versions },
    };
}
async function saveQuiz(silent) {
    const t = await quizTest();
    const saved = await saveTest(t);
    S.quiz.savedId = saved.id;
    if (!silent) toast('Quiz saved. It is in Classes › Quizzes.');
    return saved;
}
async function quizShare() {
    try {
        const saved = await saveQuiz(true);
        const c = compressTestForURL(saved);
        S.quizLink = location.origin + location.pathname + '?quiz=' + c;
        S.sheet = 'quizshare';
        render();
    } catch (e) { console.warn('[teacher-sheet] quiz share failed', e); toast('Could not make the quiz link'); }
}
function quizShareHTML() {
    const long = S.quizLink.length > 8000;
    return `<div class="tvs-codebox"><p class="tvs-muted">Quiz link</p><p class="tvs-link-line"><code>${esc(S.quizLink)}</code></p></div>
  <p class="tvs-muted">${long ? 'This quiz is too long for a link: make it shorter, or export it from Classes › Quizzes.' : 'The whole quiz travels in the link; pupils take it exactly as today. It is also saved in your quizzes.'}</p>
  <div class="tvs-share-actions"><button type="button" class="tvs-btn tvs-primary" data-act="copyquiz"${long ? ' aria-disabled="true"' : ''}>${icon('copy', 20)}<span>Copy link</span></button>
  <div class="tvs-two"><button type="button" class="tvs-btn" data-act="backquiz">${icon('back', 18)}<span>Back to the quiz</span></button><button type="button" class="tvs-btn" data-act="close">Done</button></div></div>`;
}

/* ================================================================= print */

async function doPrint() {
    const list = items();
    if (!list.length) { toast('Tick skills first'); return; }
    const p = plan(list);
    if (p.error) { toast(p.error); return; }
    if (S.building || !S.built || S.built.sig !== sigOf(p, list, S.sheet === 'quiz')) {
        toast('Preparing the pages…');
        clearTimeout(buildTimer);
        await runBuild();
    }
    const b = S.built;
    if (!b || !b.doc) { toast('These pages could not be built'); return; }
    const title = S.sheet === 'quiz' ? (S.quiz.name || autoQuizName(list)) : list.length === 1 ? list[0].label : 'Worksheet';
    S.lastDoc = sheetDocument(b.doc, title, { paper: S.opts.paper || 'A4' });
    try { await printHtml(b.doc, title, S.opts.paper || 'A4'); } catch (e) { console.warn('[teacher-sheet] print failed', e); toast('Could not open the print dialog'); }
}

/* ================================================================= events */

function changed(rebuild = true) {
    persist();
    renderMain();
    if (rebuild) { scheduleBuild(); renderSide(); }
}
function onClick(e) {
    if (e.target === root) { close(); return; }
    const b = e.target.closest('[data-act]');
    if (!b || !root.contains(b)) return;
    if (b.getAttribute('aria-disabled') === 'true') { toast(currentSet().length ? 'One moment: the pages are being made' : 'Tick skills first'); return; }
    const v = b.dataset.v;
    const more = root.querySelector('.tvs-more');
    S.moreOpen = !!(more && more.open);
    switch (b.dataset.act) {
        case 'close': close(); return;
        case 'kind': S.kind = v; touch('kind'); if (v !== 'single') S.opts.layout = 'standard'; changed(); return;
        case 'pages': S.opts.pages = Math.max(1, Math.min(30, Number(v) || 1)); touch('pages'); changed(); return;
        case 'qn': S.quiz.n = Math.max(1, Math.min(60, Number(v) || 10)); changed(); return;
        case 'versions': S.quiz.versions = Math.max(1, Math.min(6, Number(v) || 1)); changed(); return;
        case 'points': S.quiz.points = Number(v) === 2 ? 2 : 1; changed(false); renderSide(); return;
        case 'often': { const key = b.closest('[data-key]').dataset.key; setLevel(key, Number(v)); changed(); return; }
        case 'examples': S.opts.examples = v; changed(); return;
        case 'each': S.opts.each = v; changed(); return;
        case 'layout': S.opts.layout = v; changed(); return;
        case 'size': S.opts.size = v; changed(); return;
        case 'keyplace': S.opts.keyPlace = v; changed(); return;
        case 'keystyle': S.opts.keyStyle = v; changed(); return;
        case 'paper': S.opts.paper = v; changed(); return;
        case 'renew': S.seed = freshSeed(); S.built = null; scheduleBuild(0); renderSide(); return;
        case 'print': doPrint(); return;
        case 'popup': S.popup = v; renderPopup(); return;
        case 'popclose': { const k = S.popup; S.popup = null; renderPopup(); const back = root.querySelector(`[data-act="popup"][data-v="${CSS.escape(k || '')}"]`); if (back) back.focus(); return; }
        case 'tray': if (typeof window.tvOpenTray === 'function') { close(); window.tvOpenTray(); } return;
        case 'oldprint': close(); if (window.tvOpenPrintWith) window.tvOpenPrintWith(currentSet()); return;
        case 'from': S.quiz.from = v; S.quiz.fromQuery = ''; renderMain(); { const q = root.querySelector('#tvsFromQ'); if (q) q.focus(); } return;
        case 'pickfrom': pickFrom(v); return;
        case 'quizsave': saveQuiz(false).catch(() => toast('Could not save the quiz')); return;
        case 'quizshare': quizShare(); return;
        case 'backquiz': S.sheet = 'quiz'; render(); scheduleBuild(0); return;
        case 'copyquiz': copyText(S.quizLink).then((ok) => toast(ok ? 'Quiz link copied' : 'Could not copy')); return;
        case 'copylink': if (S.shareRes) copyText(S.shareRes.link).then((ok) => toast(ok ? 'Link copied' : 'Could not copy')); return;
        case 'copycode': if (S.shareRes) copyText(pupilCode(S.shareRes.code)).then((ok) => toast(ok ? 'Code copied' : 'Could not copy')); return;
        case 'board': if (S.shareRes) showBoardCodeFor({ link: S.shareRes.link, code: S.shareRes.code, name: shareName() }); return;
        default:
    }
}
function shareName() {
    const list = items();
    return list.length === 1 ? list[0].label : `${list[0].label} + ${list.length - 1} more`;
}
let fromTimer = null;
function onInput(e) {
    const t = e.target;
    if (t.dataset.in === 'fromq') {
        S.quiz.fromQuery = t.value;
        clearTimeout(fromTimer);
        fromTimer = setTimeout(() => { const ul = root && root.querySelector('#tvsFromList'); if (ul) ul.innerHTML = fromResultsHTML(); }, 150);
    } else if (t.dataset.in === 'quizname') {
        S.quiz.name = t.value;
        S.built = null; scheduleBuild(600);
    }
}
function onChange(e) {
    const t = e.target;
    const more = root.querySelector('.tvs-more');
    S.moreOpen = !!(more && more.open);
    if (t.dataset.in === 'hdr') { S.opts.header = Object.assign({}, S.opts.header, { [t.dataset.v]: t.checked }); changed(); }
    else if (t.dataset.in === 'share') { S.share[t.dataset.v] = t.value; persist(); makeLink(); }
    else if (t.dataset.in === 'sharelock') { S.share.lock = t.checked; persist(); makeLink(); }
}

/* ================================================================= public */

export function openSheet(kind, ctx) { open(kind, ctx || {}); }
export function closeSheet() { if (S.sheet) close(); }
/** For checks and the flow counter: what the open sheet would print, and its summary. */
export function sheetState() {
    const list = items();
    let p = null; try { p = list.length ? plan(list) : null; } catch (e) { p = null; }
    return { sheet: S.sheet, kind: list.length ? kindOf(list) : null, plan: p, summary: summary(), built: S.built ? { pages: S.built.pages, total: S.built.total, byKey: S.built.byKey, versions: S.built.versions, errors: S.built.errors } : null, building: !!S.building, share: S.shareRes, quizLink: S.quizLink, lastDoc: S.lastDoc || '', doc: S.built ? sheetDocument(S.built.doc, 'Worksheet', { paper: S.opts.paper || 'A4' }) : '' };
}

if (typeof window !== 'undefined') {
    window.tvOpenSheet = openSheet;
    window.tvCloseSheet = closeSheet;
    window.tvSheetState = sheetState;
}
