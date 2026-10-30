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
import { trayGroups, trayLocks, editShareInPlace, setShareFromText, shareHeldText, trayRecord, trayFromSetName } from './teacher-tray.js';
import { encodeSetParam } from './teacher-ui.js';
import { printHtml } from './teacher-print.js';
import { isFact as isFactItem } from './sheet/roles/fact-rows.js';
import { makeShareLink, showBoardCodeFor } from './teacher-sets.js';
import { mountSample } from './teacher-preview.js';
import { generateQuestionFor } from './generate-question.js';
import { quizQuestionData } from './quiz-take.js';
import { cellKindFor, screenTwin } from './screen-cell.js';
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
        opts: { pages: 1, mode: 'pages', nTotal: 24, nEach: 4, each: 'new', examples: 'off', layout: 'standard', size: 'M', paper: d.paper,
            keyPlace: d.keyPlace, keyStyle: d.keyStyle, header: { name: true, date: true, score: false } },
        quiz: { mode: 'total', n: 20, nEach: 4, pages: 1, versions: 1, points: 1, name: '', from: 'skills', fromQuery: '' },
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
    writeStore(STORE_KEY, { opts: S.opts, quiz: { mode: S.quiz.mode, n: S.quiz.n, nEach: S.quiz.nEach, pages: S.quiz.pages, versions: S.quiz.versions, points: S.quiz.points }, share: S.share, touched: S.touched, kind: S.kind });
}
function freshSeed() { return Math.floor(Math.random() * 900000) + 100000; }
const touched = (k) => S.touched.includes(k);
const touch = (k) => { if (!touched(k)) S.touched.push(k); };

/* ================================================================= the set */

function items() {
    const set = currentSet();
    // Owner 2026-10-25: with up to BIG skills the dialog sets each skill's share by its own box only (blank = even,
    // a number = exact, a % = held), so any Less/More weight from the tray does not change what this dialog prints.
    // Above BIG, How often stays set per area in the tray and the weights still count.
    const even = set.length <= BIG;
    return set.map((s) => {
        const hit = findSkill(s.categoryId, s.skillId);
        return {
            categoryId: s.categoryId, skillId: s.skillId,
            weight: !even && Number(s.weight) > 0 ? Number(s.weight) : 0,
            lockPct: typeof s.lockPct === 'number' ? s.lockPct : undefined,
            count: Number(s.count) > 0 ? Math.round(Number(s.count)) : undefined,
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

/**
 * The page plan of the open sheet: the ONE source of every number the sheet shows (stepper, sub-lines, summary,
 * area counts) and of every count the printed pages carry (requests() hands each page its exact counts).
 * `perPage` is what one page holds: learned from the engine (a page-1 build that spills lowers it), else the
 * size's default.
 */
function plan(list = items()) {
    const k = kindOf(list), o = S.opts, quiz = S.sheet === 'quiz';
    const per = perPageFor(list);
    let pages = o.pages;
    if (!touched('pages')) pages = k === 'single' ? Math.max(1, list.filter((x) => !x.leftOut).length) : isBig(list) ? Math.min(30, Math.ceil(list.length / per)) : 1;
    return planPages(k, list, { groups: trayGroups(), locks: trayLocks(), amount: amountOf(pages), perPage: per, each: quiz ? 'new' : o.each, seed: S.seed, quiz, labelOf: (key) => (list.find((x) => keyOf(x) === key) || {}).label || key });
}
/** How much? Pages · Problems in all · Problems of each skill (owner 2026-10-24). */
function amountOf(defaultPages) {
    if (S.sheet === 'quiz') {
        const m = S.quiz.mode;
        return { mode: m, n: m === 'pages' ? S.quiz.pages : m === 'each' ? S.quiz.nEach : S.quiz.n };
    }
    const m = S.opts.mode || 'pages';
    return { mode: m, n: m === 'pages' ? defaultPages : m === 'each' ? S.opts.nEach : S.opts.nTotal };
}
/* What one page holds, per size and set of skills, learned from the engine's own page 1. */
const perLearned = new Map();
// the sets of skills whose page 1 the engine has built: until then the page count is a first guess (check r2 bug 2)
const perChecked = new Set();
function perBase(list) { return [kindOf(list), S.opts.size, S.opts.examples, list.filter((x) => !x.leftOut).map((x) => keyOf(x) + JSON.stringify(x.opts || {})).join('|')].join('#'); }
function perPageFor(list) { return perLearned.get(perBase(list)) || PER_PAGE[S.opts.size] || PER_PAGE.M; }

/* ================================================================= requests (the engine mapping) */

function skillRef(it, weight, force = false) {
    const o = { categoryId: it.categoryId, skillId: it.skillId, opts: it.opts || {} };
    if (weight > 1 || (force && weight > 0)) o.weight = weight;
    return o;
}
function common(seed, quiz, version) {
    const o = S.opts;
    const sameKeyEnd = setsSame();
    const h = o.header || {};
    const V = versionsOf(quiz);
    return {
        size: o.size, look: 'auto', paper: o.paper || 'A4',
        anchors: o.examples === 'sections' || o.examples === 'side' ? o.examples : 'off',
        header: { name: h.name !== false, date: h.date !== false, score: quiz ? true : !!h.score, title: quiz ? ((S.quiz.name || '').trim() || autoQuizName(items())) : (S.batchTitle || true) },
        key: { on: true, placement: !sameKeyEnd && o.keyPlace === 'after-page' ? 'after-page' : 'end', style: o.keyStyle === 'short' ? 'short' : 'copy' },
        seed: (seed + version * 104729) >>> 0,
        version: V > 1 ? `${quiz ? 'Version' : 'Set'} ${version + 1} of ${V}` : '',
    };
}
/**
 * The buildSheet requests: ONE request per plan page, a section per skill on that page with the plan's exact count
 * (so the printed counts are the plan's, and a section maps each printed item back to its plan key, presets too).
 * [{req, copies, keys}] — copies > 1 = "Same page again" (that page printed N times, ONE key for all).
 * Single skill with a fact Layout keeps its own role, by pages.
 */
function requests(p, list, quiz, version = 0) {
    const byKey = Object.fromEntries(list.map((x) => [keyOf(x), x]));
    const out = [];
    let n = 0;
    const base = () => common(S.seed + 7919 * (n++), quiz, version);
    if (p.kind === 'single' && S.opts.layout !== 'standard') {
        for (const it of list) {
            const pg = p.pagesBy ? p.pagesBy[keyOf(it)] || 0 : 0;
            if (pg && layoutOk(it)) out.push({ req: Object.assign(base(), { role: S.opts.layout, look: 'auto', sections: [{ skills: [skillRef(it)], pages: pg, columns: factColsFor(it) }] }), copies: 1, keys: [keyOf(it)], pages: pg, fact: true });
        }
        if (out.length) return out;
    }
    const copy = p.each === 'copy' && p.pages > 1;
    const pages = copy ? [p.pageItems[0]] : p.pageItems;
    for (const pg of pages) {
        const c = {}; const order = [];
        (pg || []).forEach((k) => { if (!c[k]) order.push(k); c[k] = (c[k] || 0) + 1; });
        if (!order.length) continue;
        out.push({ req: Object.assign(base(), { role: 'independent', sections: order.map((k) => ({ skills: [skillRef(byKey[k])], count: c[k] })) }), copies: copy ? p.pages : 1, keys: order, pages: 1 });
    }
    return out;
}

/** The plan key of each printed item: by its section (a preset prints under its host id). */
function countParts(res, part, copies, into) {
    let n = 0;
    for (const it of res.items || []) {
        if (!it) continue;
        const k = part.keys.length === 1 ? part.keys[0] : (Number.isInteger(it.section) && part.keys[it.section]) || (part.keys.includes(it.skill) ? it.skill : null);
        if (!k) continue;
        into[k] = (into[k] || 0) + copies; n += copies;
    }
    return n;
}
/** The problems the built page 1 holds (fact rows: its own count, from the built page). */
function countOnPage1(res) {
    const items = res.items || [];
    const per = res.fits && res.fits.perPage;
    return per ? Math.min(per, items.length) : items.length;
}
const yieldNow = () => new Promise((r) => setTimeout(r, 0));

/* ================================================================= Layout (fact rows / timed check), probed per skill */

const layoutCache = new Map();   // 'cat:skill|role' -> true | false | Promise
/** Fact rows: how many across ('auto' = the engine's 10 / 6 / 5 at S / M / L; bracket division at most 8). */
const isDivision = (it) => it.categoryId === 'division';
function factColsFor(it) {
    const c = S.opts.factCols;
    if (S.opts.layout !== 'fact-rows' || !c || c === 'auto') return undefined;
    return isDivision(it) ? Math.min(8, Number(c)) : Number(c);
}
function layoutOk(it, role = S.opts.layout) {
    if (role === 'standard') return true;
    return layoutCache.get(keyOf(it) + '|' + role) === true;
}
async function probeLayouts(it) {
    // cheap: one generated item read by the fact-rows role's own test (no page build, so no long frame)
    let ok = false;
    try {
        const q = generateQuestionFor({ category: it.categoryId, skill: it.skillId, opts: it.opts, seed: 11 });
        ok = !!q && isFactItem({ q: Object.assign({ skillId: it.skillId, categoryId: it.categoryId }, q), template: q.cell && q.cell.template });
    } catch (e) { ok = false; }
    for (const role of ['fact-rows', 'fact-probe']) layoutCache.set(keyOf(it) + '|' + role, ok);
}

/* ================================================================= building */

function sigOf(p, list, quiz) {
    return JSON.stringify({ t: S.batchTitle || '', g: trayGroups(), l: trayLocks(), k: p.kind, pi: p.pageItems, pb: p.pagesBy, o: S.opts, seed: S.seed, quiz: quiz ? { v: S.quiz.versions, q: S.quiz, name: S.quiz.name } : null, cnt: list.map((x) => [x.count || 0, x.lockPct === undefined ? -1 : x.lockPct, x.weight]),
        skills: list.map((x) => [keyOf(x), x.opts || null, x.leftOut ? 0 : 1]) });
}

/** The version line on every pupil and key page ("Version 2 of 3"), where the engine prints its form letter. */
function versionFooter(html, label) {
    // one version: no form letter at all (a worksheet has no Form A); several: "Version 2 of 3"
    if (!label) return String(html).replace(/Form [AB]\b\s*(·\s*)?/g, '');
    return String(html).replace(/Form [AB]\b/g, label);
}

/**
 * Build every page of every version into ONE document (Print only; yields between pages, so the page stays live).
 * Each version: its own seed (seed + v), the same plan (mix, per-skill counts, layout). Keys "after each version"
 * (default) or "all at the end" (S.opts.keyVersions).
 */
async function buildAll(p, list, quiz, onProgress) {
    const versions = versionsOf(quiz);
    const keysAtEnd = versions > 1 && S.opts.keyVersions === 'end';
    const out = { pupil: [], key: [], doc: '', pages: 0, pagesAll: 0, keyPages: 0, byKey: {}, total: 0, printed: 0, errors: [], perVersion: [] };
    let tailKeys = '', done = 0;
    const parts0 = requests(p, list, quiz, 0).length;
    for (let v = 0; v < versions; v++) {
        let vp = '', vk = '', vd = '', after = false, vp0 = '';
        const vv = { byKey: {}, total: 0, pages: 0, first: '' };
        const label = versions > 1 ? `${quiz ? 'Version' : 'Set'} ${v + 1} of ${versions}` : '';
        if (!quiz && v > 0) { const cv = coverHTML(v + 1, versions); vd = cv; vp0 = cv; }
        for (const part of requests(p, list, quiz, v)) {
            if (onProgress) onProgress(++done, parts0 * versions);
            await yieldNow();
            const rq = versions > 1 ? Object.assign({}, part.req, { keySection: label }) : part.req;
            let res;
            try { res = await buildSheet(rq); } catch (e) {
                out.errors.push((e && e.message) || 'This page could not be built.');
                continue;
            }
            if (!out.fits0) out.fits0 = res.fits ? { cols: res.fits.cols, rows: res.fits.rows, perPage: res.fits.perPage } : null;
            const copies = Math.max(1, part.copies || 1);
            const pupil1 = versionFooter(res.pupilHtml, label);
            if (!vv.first) vv.first = (res.pupilPages && res.pupilPages[0]) || pupil1;
            const pupil = copies > 1 ? Array.from({ length: copies }, () => pupil1).join('\n') : pupil1;
            const key = versionFooter(res.keyHtml || '', label);
            vp += pupil + '\n';
            vk += key + '\n';
            if (res.keyOptions && res.keyOptions.placement === 'after-page') { after = true; vd += (copies > 1 ? pupil + key : versionFooter(res.docHtml || pupil, label)) + '\n'; }
            vv.pages += (res.pageCount || 0) * copies;
            out.keyPages += res.keyPageCount || 0;
            vv.total += countParts(res, part, copies, vv.byKey);
            out.printed += (res.items || []).filter(Boolean).length * copies;   // every printed problem (T4 batch summary)
        }
        out.perVersion.push(vv);
        out.pupil.push(vp); out.key.push(vk);
        if (after) out.doc += vd;
        else if (keysAtEnd) { out.doc += vp0 + vp; tailKeys += vk; }
        else out.doc += vp0 + vp + vk;
        out.pagesAll += vv.pages;
    }
    out.doc += tailKeys;
    if (setsSame()) {
        // Same problems: the one build's pupil pages again for sets 2..N, each after its cover; ONE key for all, at the end
        const N = setsOf(), pupil = out.pupil[0] || '', key = out.key[0] || '';
        out.doc = '';
        for (let i = 1; i <= N; i++) out.doc += (i > 1 ? coverHTML(i, N) : '') + pupil;
        out.doc += key;
        out.pagesAll = (out.perVersion[0] ? out.perVersion[0].pages : 0) * N;
    }
    out.sets = quiz ? 1 : setsOf();
    out.pupilHtml = out.pupil.join('\n');
    out.keyHtml = out.key.join('\n');
    const v0 = out.perVersion[0] || { byKey: {}, total: 0, pages: 0 };
    out.byKey = Object.assign({}, v0.byKey); out.total = v0.total; out.pages = v0.pages;
    out.sameCounts = out.perVersion.every((x) => JSON.stringify(Object.entries(x.byKey).sort()) === JSON.stringify(Object.entries(v0.byKey).sort()));
    // the printed counts against the plan: never a silent drift
    out.matchesPlan = Object.keys(p.byKey).every((k) => (p.byKey[k] || 0) === (out.byKey[k] || 0)) && Object.keys(out.byKey).every((k) => (p.byKey[k] || 0) === out.byKey[k]);
    out.versions = versions;
    return out;
}
/** Versions: a quiz 1–6 (the quiz path), a worksheet 1–20 (owner 2026-10-24). */
function versionsOf(quiz) { return quiz ? Math.max(1, Math.min(6, S.quiz.versions)) : setsSame() ? 1 : setsOf(); }
/** How many sets? (owner 2026-10-25): a worksheet prints 1–30 sets; Same problems = one build copied, ONE key. */
function setsOf() { return Math.max(1, Math.min(30, Number(S.opts.versions) || 1)); }
function setsSame() { return S.sheet !== 'quiz' && S.opts.setsSame === true && setsOf() > 1; }
/** The plain page between sets: "Set 2 of 5", the title and the date, nothing else. */
function coverHTML(i, n) {
    const list = items();
    const t = S.batchTitle || (list.length === 1 ? list[0].label : 'Worksheet');
    const d = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    return `<section class="ws-page ws-M mq-set-cover" data-ws-size="M" data-set-cover="${i}"><div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:240mm;text-align:center;color:#000;font-family:'Andika',sans-serif;"><p style="font-size:64px;font-weight:700;margin:0 0 24px;">Set ${i} of ${n}</p><p style="font-size:32px;margin:0 0 12px;">${esc(t)}</p><p style="font-size:24px;margin:0;">${esc(d)}</p></div></section>\n`;
}

let buildTimer = null;
let token = 0;
function scheduleBuild(delay = 250) {
    clearTimeout(buildTimer);
    // after the sheet has painted: the preview never holds up the first frame
    buildTimer = setTimeout(() => requestAnimationFrame(() => setTimeout(runPreview, 0)), delay);
}
/**
 * The page-1 preview: ONE request (the plan's first page). If the engine needs more than one page for it, the plan's
 * page holds too much: perPage is lowered and the plan dealt again (at most 3 tries), so the plan's pages are the
 * printed pages.
 */
async function runPreview() {
    if (!S.sheet || S.sheet === 'share' || S.sheet === 'quizshare') return;
    if (batchActive()) { ensureBatch(); return; }   // lesson groups: the side shows what Print all makes
    const list = items();
    if (!list.length) { S.preview = null; renderSide(); return; }
    const my = ++token;
    let last = null;   // the last page built: shown when the tries run out (never "Working out…" for good)
    for (let tries = 0; tries < 3; tries++) {
        const p = plan(list);
        if (p.error) { S.preview = null; renderSide(); return; }
        const quiz = S.sheet === 'quiz';
        const sig = sigOf(p, list, quiz) + '|' + perPageFor(list);
        if (S.preview && S.preview.sig === sig) { renderSide(); return; }
        const part = requests(p, list, quiz, 0)[0];
        if (!part) { S.preview = null; renderSide(); return; }
        S.building = true; renderSide();
        await yieldNow();
        let res = null;
        try { res = await buildSheet(part.req); } catch (e) { res = null; }
        if (my !== token) return;
        S.building = false;
        if (!res) { perChecked.add(perBase(list)); S.preview = { sig, html: '', error: true }; renderSide(); return; }
        last = { sig, res, list };
        const planned = part.pages || 1;
        const got = res.pageCount || 1;
        const onPage = (part.req.sections || []).reduce((t, x) => t + (x.count || 0), 0);
        if (got > planned && onPage > 1 && p.kind !== 'single') {
            // the engine's page holds fewer: learn it and deal the plan again
            // what the engine's own page 1 holds (its cells), not a share of the spill: the same set learns the same number
            const cells = ((res.pupilPages && res.pupilPages[0]) || '').split('class="ws-cell ').length - 1;
            perLearned.set(perBase(list), Math.max(1, cells && cells < onPage ? cells : Math.floor(onPage * planned / got)));
            continue;
        }
        if (got > planned && p.kind === 'single' && onPage > 1) {
            perLearned.set(perBase(list), Math.max(1, Math.floor(onPage / got)));
            continue;
        }
        perChecked.add(perBase(list));
        S.preview = { sig, html: (res.pupilPages && res.pupilPages[0]) || res.pupilHtml, fact: part.fact ? { cols: (res.fits && res.fits.cols) || 0, rows: (res.fits && res.fits.rows) || 0, onPage1: countOnPage1(res), pages: res.pageCount || 1 } : null };
        renderMain(); renderSide();
        return;
    }
    S.building = false;
    // A big mix (two whole grades) can still spill after 3 tries: show the last page built and stop
    // "Working out how many fit on a page…" (it never ended before, 2026-10-30).
    if (last && my === token) {
        perChecked.add(perBase(last.list));
        S.preview = { sig: last.sig, html: (last.res.pupilPages && last.res.pupilPages[0]) || last.res.pupilHtml, fact: null };
    }
    renderMain(); renderSide();
}

/* ================================================================= the summary line (from the plan) */

function summary() {
    const r = summaryCore();
    const list0 = items();
    if (!r.error && list0.length && !perChecked.has(perBase(list0))) {
        r.line = 'Working out how many fit on a page…';
        return r;
    }
    if (setsSame() && !r.error) {
        const N = setsOf();
        r.line = `${N} sets of the same problems · ${r.line.replace(/ · answer key at the end/, '')} · each set · a cover page between sets · one key for all`;
    }
    return r;
}
function summaryCore() {
    const list = items();
    if (!list.length) return { line: 'Tick skills first', more: '' };
    const p = plan(list);
    if (p.error) return { line: p.error, more: '', error: true };
    const quiz = S.sheet === 'quiz';
    const noun = quiz ? 'questions' : 'problems';
    const pages = p.pagesBy ? Object.values(p.pagesBy).reduce((a, b) => a + b, 0) || p.pages : p.pages;
    const pg = `${pages} page${pages === 1 ? '' : 's'}`;
    const total = p.total;
    const pts = quiz ? ` · ${total * (S.quiz.points === 2 ? 2 : 1)} points` : '';
    const active = list.filter((x) => !x.leftOut);
    const left = list.length - active.length ? ` · ${list.length - active.length} left out` : '';
    const by = p.byKey;
    const shown = active.filter((x) => (by[keyOf(x)] || 0) > 0).length;
    const vals = active.map((x) => by[keyOf(x)] || 0).filter((c) => c > 0);
    const eachN = vals.length ? (vals.every((c) => c === vals[0]) ? `${vals[0]} of each` : (Math.max(...vals) - Math.min(...vals) <= 1 ? `about ${Math.round(total / vals.length)} of each` : '')) : '';
    const ofEach = eachN && active.length > 1 ? ` · ${eachN}` : '';
    const names = isBig(list) ? byArea(active).map((a) => `${AREAS[a.area].short} ${a.list.reduce((t, x) => t + (by[keyOf(x)] || 0), 0)}`).join(', ')
        : list.map((x) => `${x.label} ${x.leftOut ? '(left out)' : (by[keyOf(x)] || 0) + (x.count > 0 ? ' (count)' : x.lockPct !== undefined ? ' (held)' : '')}`).join(', ');
    const pr = S.printed && S.printed.sig === sigOf(p, list, quiz) ? S.printed : null;
    const factLayout = p.kind === 'single' && S.opts.layout !== 'standard';
    const drift = pr && !factLayout && (pr.pages !== pages || !pr.matchesPlan) ? ` · printed on ${pr.pages} page${pr.pages === 1 ? '' : 's'}${pr.matchesPlan ? '' : ', the engine changed some counts'}` : '';
    const V = versionsOf(quiz);
    const fx = S.preview && S.preview.fact && S.preview.sig === sigOf(p, list, quiz) + '|' + perPageFor(list) && S.opts.layout === 'fact-rows' && p.kind === 'single' ? S.preview.fact : null;
    if (fx && fx.cols && fx.rows) {
        // counted from the built page: "10 across × 7 rows = 70 facts"
        return { line: `${fx.cols} across × ${fx.rows} rows = ${fx.cols * fx.rows} facts${fx.pages > 1 ? ` a page · ${fx.pages} pages` : ''} · answer key at the end${drift}`, more: names.replace(/ \d+( \((count|held)\))?/g, '') + ' · fact rows' };
    }
    if (V > 1) {
        const w = quiz ? 'version' : 'set';
        return { line: `${V} ${w}s · ${total} ${noun} each${ofEach}${pts} · ${pages * V} pages + keys${!quiz && S.opts.keyPlace === 'after-page' && !setsSame() ? ' (a key after each page)' : S.opts.keyVersions === 'end' ? ' (keys at the end)' : ` (a key after each ${w})`}${quiz ? '' : ' · a cover page between sets'}${left}${drift}`,
            more: names + ' · every version has its own problems, the same mix and counts' };
    }
    if (isBig(list)) {
        const areas = byArea(active);
        const hit = areas.filter((a) => a.list.some((x) => by[keyOf(x)] > 0)).length;
        const cover = shown >= active.length ? 'every skill at least once' : `a sample of ${shown} of ${active.length} skills, New numbers re-deals the sample`;
        return { line: `${pg} · ${total} ${noun}${ofEach} · ${hit === areas.length ? `${areas.length} area${areas.length > 1 ? 's' : ''}` : `${hit} of ${areas.length} areas`} · ${cover}${left}${pts}${drift}`,
            more: names + ' · answer key at the end' };
    }
    const warn = p.warn.length ? ' · ' + p.warn.join(' ') : '';
    const each = quiz ? 'new' : p.each;
    if (each === 'copy') return { line: `${pages} copies of the same page · ${Math.round(total / Math.max(1, pages))} ${noun} on each · ${total} in all${ofEach} · one key: “Key for all ${pages} copies”${left}${drift}`, more: names + ' · New numbers re-deals the page' };
    if (each === 'same') return { line: `${pg} · the same ${noun} on each, new numbers · ${total} in all${ofEach} · answer key at the end${left}${drift}`, more: names + ' · New numbers re-deals every page' };
    return { line: `${pg} · ${total} ${noun}${ofEach}${pts} · answer key at the end${left}${drift}`,
        more: names + (p.added === 'single' ? ` · pages raised to ${pages} so every skill keeps a page and the held % is met` : p.added ? ' · pages added so every skill comes up at least twice' : '') + warn };
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
const gradeBadge = (g) => `<span class="tvs-grade" data-grade="${esc(g)}" aria-label="${esc(gradeName(g))}">${esc(g === 'M' ? 'M' : g)}</span>`;
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
    // the same set opens on the same problems (so the same page count) every time; New numbers re-deals it
    if (!S.userSeed) S.seed = 100000 + (parseInt(hashStr(currentSet().map((x) => `${x.categoryId}:${x.skillId}`).join('|')), 36) % 900000);
    if (S.fromLesson && !touched('kind')) S.kind = null;
    S.batchTitle = typeof ctx.title === 'string' ? ctx.title : '';   // T4: a lesson's practice carries the lesson's name
    S.quizLink = '';
    if (kind === 'share') S.shareRes = undefined;
    S.popup = null;
    if (kind === 'quiz') {
        if (ctx.buildFrom) { S.quiz.from = ctx.buildFrom; S.quiz.fromQuery = ''; } else if (!currentSet().length && S.quiz.from === 'skills') S.quiz.from = 'ccss';
        if (currentSet().length && !ctx.buildFrom) S.quiz.from = 'skills';
    }
    mount();
    render();
    // after the first paint: the code (Share) or the page-1 preview (Print / Quiz); the fact-layout probe last
    if (kind === 'share') setTimeout(() => requestAnimationFrame(() => setTimeout(() => { if (S.sheet === 'share') makeLink(); }, 0)), 0);
    else scheduleBuild(0);
    const one = items();
    if (one.length === 1 && kind === 'print') setTimeout(() => { if (S.sheet === 'print') probeLayouts(one[0]).then(() => { if (S.sheet === 'print') { renderMain(); if (S.opts.layout !== 'standard') { S.preview = null; scheduleBuild(0); } } }); }, 300);
}
function close() {
    S.sheet = null;
    S.batchTitle = '';
    B.tok++; B.sig = ''; B.res = null; B.busy = null;
    S.popup = null;
    token++;
    persist();
    if (root) root.remove();
    root = null;
    for (const id of INERT) { const el = document.getElementById(id); if (el) el.removeAttribute('inert'); }
    document.querySelectorAll('#teacherApp .tv2-nav').forEach((el) => el.removeAttribute('inert'));
    document.body.classList.remove('tvs-open');
    document.removeEventListener('keydown', onKey, true);
    for (const fn of [...closeFns]) { try { fn(); } catch (e) { console.warn('[teacher-sheet] close hook', e); } }
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
        if (e.target && e.target.classList && e.target.classList.contains('tv-share-in')) return;   // the share input cancels itself
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
    // a share button that had focus (or was just committed) gets it back after the redraw
    const ae = document.activeElement;
    const had = ae && box.contains(ae) && ae.dataset ? ae.dataset.shareKey || null : null;
    const want = had || (S.refocus && (!ae || ae === document.body || box.contains(ae)) ? S.refocus : null);
    if (S.sheet === 'share') box.innerHTML = shareHTML();
    else if (S.sheet === 'quizshare') box.innerHTML = quizShareHTML();
    else box.innerHTML = optionsHTML();
    box.scrollTop = keep;
    if (want) { const nb = box.querySelector(`[data-share-key="${CSS.escape(want)}"]`); if (nb) nb.focus({ preventScroll: true }); }
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
    return `<div class="tvs-glist">${byArea(list).map((a) => `<div class="tvs-garea" data-domain="${esc(a.area)}"><p class="tvs-garea-name">${areaIcon(a.area, 18)}<span>${esc(AREAS[a.area].name)}</span><span class="tvs-muted">${a.list.length} skill${a.list.length > 1 ? 's' : ''}</span></p>${byGrade(a.list).map((g) => `<p class="tvs-ghead">${gradeBadge(g.grade)}<span>${esc(gradeName(g.grade))}</span></p><ul class="tvs-gg" aria-label="${esc(AREAS[a.area].short + ', ' + gradeName(g.grade))}">${g.list.map((x) => `<li><button type="button" class="tvs-grow" data-act="popup" data-v="${esc(keyOf(x))}">${gradeBadge(x.grade)}<span class="tvs-grow-name">${esc(x.label)}</span>${x.leftOut ? '<span class="tvs-muted">left out</span>' : ''}${icon('eye', 18)}</button></li>`).join('')}</ul>`).join('')}</div>`).join('')}</div>`;
}

function optionsHTML() {
    const list = items();
    const quiz = S.sheet === 'quiz';
    let h = '';
    if (quiz) h += buildFromHTML(list);
    if (!list.length) {
        return h + (quiz ? '' : `<div class="tvs-empty"><p class="tvs-strong">Tick skills first</p><p class="tvs-muted">Tick one or more skills on Skills, then press Print.</p></div>`);
    }
    if (quiz) h += `<div class="tvs-field"><label class="tvs-label" for="tvsQuizName">Quiz name</label><input id="tvsQuizName" class="tvs-input" data-in="quizname" value="${esc(S.quiz.name || autoQuizName(list))}"></div>`;
    h += skillsHTML(list);
    if (!quiz && EXTRA && EXTRA.html) { try { h += EXTRA.html(list) || ''; } catch (e) { console.warn('[teacher-sheet] extra', e); } }
    const p = plan(list);
    const k = p.kind;
    h += `<div class="tvs-kinds" role="radiogroup" aria-label="Kind of worksheet">${[['single', 'Single skill', 'One skill on a page'], ['sections', 'Sections', 'Each skill in its own part'], ['mixed', 'Mixed practice', 'Skills mixed together']].map(([v, l, s]) => `<button type="button" class="tvs-kind" role="radio" data-act="kind" data-v="${v}" aria-checked="${k === v}">${k === v ? icon('check', 18) : ''}<span class="tvs-kind-name">${l}</span><span class="tvs-kind-sub">${s}</span></button>`).join('')}</div>`;
    if (!S.kind) h += `<p class="tvs-muted tvs-chosen">Chosen for you: ${S.fromLesson ? 'practice from a lesson prints in Sections' : list.length === 1 ? 'one skill makes a Single skill page' : `${list.length} skills make a Mixed practice page`}.</p>`;
    // How much? Pages · Problems in all · Problems of each skill
    {
        const q = quiz ? S.quiz : null;
        const mode = quiz ? q.mode : (S.opts.mode || 'pages');
        const pg = p.pagesBy ? Math.max(1, Object.values(p.pagesBy).reduce((a, b) => a + b, 0)) : p.pages;
        const noun = quiz ? 'questions' : 'problems';
        let ctl;
        if (mode === 'pages') ctl = `${stepper('pages', quiz ? q.pages : pg, 1, 30, 'Pages')}${seg('pages', quiz ? q.pages : pg, [['2', '2'], ['3', '3'], ['5', '5']], 'Pages')}`;
        else if (mode === 'total') ctl = `${stepper('ntotal', quiz ? q.n : S.opts.nTotal, 1, 300, noun + ' in all')}${seg('ntotal', quiz ? q.n : S.opts.nTotal, [['10', '10'], ['20', '20'], ['30', '30']], noun + ' in all')}`;
        else ctl = `${stepper('neach', quiz ? q.nEach : S.opts.nEach, 1, 50, noun + ' of each skill')}${seg('neach', quiz ? q.nEach : S.opts.nEach, [['2', '2'], ['4', '4'], ['6', '6']], noun + ' of each skill')}`;
        const sub = mode === 'pages' ? (k === 'single' && list.length > 1 ? 'Shared by how often each skill comes up; starts at one page per skill' : isBig(list) ? `${p.total} ${noun}; fewer pages take a sample of the skills` : 'Pages of problems; the answer key is extra')
            : mode === 'total' ? `Pages = ${noun} ÷ ${p.perPage} a page; the last page holds the rest` : 'A skill with its own count keeps it';
        h += row('How much?', sub, `${seg('mode', mode, [['pages', 'Pages'], ['total', quiz ? 'Questions in all' : 'Problems in all'], ['each', quiz ? 'Questions of each skill' : 'Problems of each skill']], 'How much')}<div class="tvs-pages">${ctl}</div>`);
    }
    if (p.error) h += `<p class="tvs-warn" role="alert">${icon('info', 18)}<span>${esc(String(p.error).replace(/\s*Raise to \d+ pages?\?$/, '').replace(/\s*Raise the total to \d+\.?/, ''))}</span></p>`;
    else if (p.warn.length) h += p.warn.map((w) => `<p class="tvs-warn">${icon('info', 18)}<span>${esc(w)}</span></p>`).join('');

    h += keyRowHTML();
    if (p.error && p.lower && p.lower.key) { const lx = list.find((x) => keyOf(x) === p.lower.key); h += `<div class="tvs-raise"><button type="button" class="tvs-btn" data-act="lower" data-v="${esc(p.lower.key)}" data-n="${p.lower.count}">Lower ${esc(lx ? lx.label : p.lower.key)} to ${p.lower.count}</button></div>`; }
    if (p.error && (p.needPages || p.needTotal)) h += `<div class="tvs-raise"><button type="button" class="tvs-btn" data-act="raise" data-v="${p.needPages ? 'p' + p.needPages : 't' + p.needTotal}">${p.needPages ? `Raise to ${p.needPages} pages` : `Raise the total to ${p.needTotal}`}</button></div>`;
    // How often
    if (list.length > 1 && !isBig(list)) {
        h += row('Problems of each skill', 'Leave blank to share evenly, or type a number or a %', `<div class="tvs-often">${list.map((x) => `<div class="tvs-often-row"><span class="tvs-often-name" data-domain="${esc(x.area)}">${gradeBadge(x.grade)}<span>${esc(x.label)}</span></span><span class="tvs-often-ctl">${shareBtnHTML(x, p)}</span></div>`).join('')}</div>`);
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
    // Versions (worksheet): the same set again with different problems, all in one PDF
    // Layout: Single skill only, and only for a skill whose items fit the fact layouts
    if (k === 'single' && list.some((x) => layoutOk(x, 'fact-rows') || layoutOk(x, 'fact-probe'))) {
        const opts = [['standard', 'Standard']];
        if (list.some((x) => layoutOk(x, 'fact-rows'))) opts.push(['fact-rows', 'Fact rows (5–10 across)']);
        if (list.some((x) => layoutOk(x, 'fact-probe'))) opts.push(['fact-probe', 'Timed check']);
        h += row('Layout', 'Only for skills that have one', seg('layout', S.opts.layout, opts, 'Layout'));
        if (S.opts.layout === 'fact-rows') {
            const div = list.some(isDivision);
            const cur = String(S.opts.factCols || 'auto');
            const cols = `<div class="tvs-seg" role="group" aria-label="Columns">${[['auto', 'Auto'], ['5', '5'], ['6', '6'], ['8', '8'], ['10', '10']].map(([v, l]) => { const off = div && v === '10'; return `<button type="button" class="tvs-btn" data-act="factcols" data-v="${v}" aria-pressed="${cur === v}"${off ? ' disabled title="8 is the most for ÷"' : ''}>${cur === v ? icon('check', 16) : ''}<span>${l}</span></button>`; }).join('')}</div>`;
            // Size S stays one tap away beside the columns (more across needs the smaller digits)
            h += row('Columns', div ? 'Facts across each row · 8 is the most for ÷' : 'Facts across each row', cols + seg('size', S.opts.size, [['S', 'S'], ['M', 'M'], ['L', 'L']], 'Size'));
        }
    }
    h += row('Size', 'Bigger digits, fewer problems', seg('size', S.opts.size, [['S', 'S'], ['M', 'M'], ['L', 'L']], 'Size'));
    if (quiz) {
        h += row('Points', 'Shown on the summary', seg('points', S.quiz.points, [['1', '1 per question'], ['2', '2 per question']], 'Points'));
        h += row('How many versions?', 'Each version has its own order and its own key', stepper('versions', S.quiz.versions, 1, 6, 'Versions') + (S.quiz.versions > 1 ? keyVersionsSeg() : ''));
    }
    h += moreHTML();
    return h;
}
/** The skill's share as a button typed over in place ("≈ 6 of 18", "40 % 🔒"); teacher-tray.js parses and checks it. */
function shareBtnHTML(x, p) {
    const k = keyOf(x);
    const held = x.count > 0 ? String(x.count) : x.lockPct !== undefined ? `${Math.round(x.lockPct)} %` : null;
    const n = p && p.byKey ? (p.byKey[k] || 0) : null;
    const txt = held !== null ? `${esc(held)} ${icon('lock', 14)}` : n === null ? '' : `≈ ${n}<span class="tvs-share-of"> of ${p.total}</span>`;
    if (!txt) return '';
    const said = held !== null ? `held at ${held}` : `about ${n} of ${p.total}`;
    return `<button type="button" class="tvs-btn tvs-share-btn${held !== null ? ' is-held' : ''}" data-act="shareedit" data-v="${esc(k)}" data-share-key="${esc(k)}" aria-label="Share of ${esc(x.label)}: ${esc(said)}. Press to type a number of problems or a %">${txt}</button>`;
}
/** A skill held at an exact count ("6 🔒") or a % ("40 % 🔒"): changing it first asks "Release the 6?". */
function heldHTML(x) {
    const what = x.count > 0 ? String(x.count) : `${Math.round(x.lockPct)} %`;
    const k = keyOf(x);
    if (S.release === k) return `<span class="tvs-held" role="group" aria-label="Release ${esc(what)}?"><span>Release the ${esc(what)}?</span><button type="button" class="tvs-btn" data-act="release" data-v="${esc(k)}">Release</button><button type="button" class="tvs-btn" data-act="keep">Keep</button></span>`;
    return `<button type="button" class="tvs-btn tvs-held-btn" data-act="askrelease" data-v="${esc(k)}" aria-label="${esc(what)}, held. Change it">${esc(what)} ${icon('lock', 16)}</button>`;
}
function keyVersionsSeg() {
    const w = S.sheet === 'quiz' ? 'version' : 'set';
    return seg('keyversions', S.opts.keyVersions === 'end' ? 'end' : 'after', [['after', `Key after each ${w}`], ['end', 'All keys at the end']], 'Answer keys');
}
/** Answer key, near the amounts (owner 2026-10-25): where it prints and what it looks like. */
function keyRowHTML() {
    const o = S.opts;
    const same = setsSame();
    return row('Answer key', same ? 'Same problems: one key for every set, at the end' : 'Where it prints and how it looks', `${same ? '' : seg('keyplace', o.keyPlace === 'after-page' ? 'after-page' : 'end', [['after-page', 'After each page'], ['end', 'At the end']], 'Key placement')}${seg('keystyle', o.keyStyle === 'short' ? 'short' : 'copy', [['copy', 'Copy of the page with answers'], ['short', 'Short answer key']], 'Key style')}`);
}
/** How many sets? beside Print (worksheet): 1–30, Same problems (one key) or Different problems (a key each). */
function setsHTML() {
    const n = setsOf();
    let h = `<div class="tvs-sets" role="group" aria-label="How many sets?"><p class="tvs-label">How many sets?</p>${stepper('wversions', n, 1, 30, 'Sets')}`;
    if (n > 1) {
        h += seg('setssame', S.opts.setsSame === true ? 'same' : 'diff', [['same', 'Same problems'], ['diff', 'Different problems']], 'Sets');
        h += `<p class="tvs-muted">${S.opts.setsSame === true ? `${n} identical copies · one key for all · a cover page between sets` : 'Each set has new problems and its own key · a cover page between sets'}</p>`;
        // "After each page" already puts every key right after its page: the per-set key choice only applies to "At the end"
        if (S.opts.setsSame !== true && S.opts.keyPlace !== 'after-page') h += keyVersionsSeg();
    }
    return h + '</div>';
}
function moreHTML() {
    const o = S.opts, hd = o.header || {};
    const ck = (key, label) => `<label class="tvs-check"><input type="checkbox" data-in="hdr" data-v="${key}"${hd[key] !== false ? ' checked' : ''}><span>${esc(label)}</span></label>`;
    return `<details class="tvs-more"${S.moreOpen ? ' open' : ''}><summary class="tvs-more-sum">More options</summary>
  ${row('Header', 'On every pupil page', `<div class="tvs-checks">${ck('name', 'Name')}${ck('date', 'Date')}${S.sheet === 'quiz' ? '' : `<label class="tvs-check"><input type="checkbox" data-in="hdr" data-v="score"${hd.score ? ' checked' : ''}><span>Score</span></label>`}</div>`)}
  ${row('Paper', '', seg('paper', o.paper === 'Letter' ? 'Letter' : 'A4', [['A4', 'A4'], ['Letter', 'Letter']], 'Paper'))}
  <p class="tvs-muted">Need another page type? Open the <button type="button" class="tvs-link" data-act="oldprint">Old print screen (all page types)</button>.</p>
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
    if (batchActive()) { renderBatchSide(side); return; }
    if (side.dataset.batch) { delete side.dataset.batch; side.innerHTML = ''; }
    const sm = summary();
    const quiz = S.sheet === 'quiz';
    const has = items().length > 0;
    const ready = has && !sm.error;
    // the preview frame is made once and kept: re-rendering the summary never reloads it
    if (!side.querySelector('#tvsSumBox')) {
        side.innerHTML = `<div class="tvs-sum" id="tvsSumBox" aria-live="polite"></div>
  <div class="tvs-prev" id="tvsPrevBox"></div>
  <p class="tvs-muted tvs-prev-cap" id="tvsPrevCap"></p>
  <div class="tvs-actions" id="tvsActBox"></div>`;
    }
    side.querySelector('#tvsSumBox').innerHTML = `<p class="tvs-sum-line${sm.error ? ' is-error' : ''}" data-tvs-summary>${esc(sm.line)}</p>${sm.more ? `<p class="tvs-sum-more">${esc(sm.more)}</p>` : ''}`;
    const box = side.querySelector('#tvsPrevBox');
    if (has && !box.querySelector('iframe')) box.innerHTML = '<iframe class="tvs-prev-frame" id="tvsPrevFrame" title="Page 1 preview" tabindex="-1"></iframe>';
    if (!has) box.innerHTML = '';
    side.querySelector('#tvsPrevCap').textContent = !has ? '' : S.building ? 'Drawing page 1…' : 'First page · every item drawn live by the app · Print makes every page';
    side.querySelector('#tvsActBox').innerHTML = `${!quiz && has ? setsHTML() : ''}<button type="button" class="tvs-btn tvs-primary" data-act="print"${ready ? '' : ` aria-disabled="true" data-why="${esc(has ? sm.line : 'Tick skills first')}"`}>${icon('print', 20)}<span>${has ? 'Print' : 'Tick skills first'}</span></button>
    ${quiz ? `<button type="button" class="tvs-btn" data-act="quizshare"${ready ? '' : ' aria-disabled="true" data-why="Tick skills first"'}>${icon('link', 18)}<span>Share with pupils</span></button>
    <button type="button" class="tvs-btn" data-act="quizsave"${ready ? '' : ' aria-disabled="true" data-why="Tick skills first"'}>${icon('bookmark', 18)}<span>Save</span></button>` : ''}
    <button type="button" class="tvs-btn" data-act="renew"${has ? '' : ' aria-disabled="true" data-why="Tick skills first"'}>${icon('shuffle', 18)}<span>New numbers</span></button>`;
    if (S.preview && S.preview.html) showPreview(S.preview.html);
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
    // owner 2026-10-25: the link also carries the whole set (skills, options, amounts, print settings) as an optional
    // &set= suffix, so a teacher who opens it gets it in My sets. ?c= is unchanged, so old readers ignore it.
    if (S.shareRes) {
        try { const p = encodeSetParam(Object.assign({ name: trayFromSetName() || '' }, trayRecord(), { print: printSettings() })); if (p) S.shareRes = { ...S.shareRes, link: S.shareRes.link + '&set=' + p }; } catch (e) { /* the plain link still works */ }
    }
    renderMain();
}
function shareHTML() {
    const list = items();
    if (!list.length) return `<div class="tvs-empty"><p class="tvs-strong">Tick skills first</p><p class="tvs-muted">Tick one or more skills on Skills, then press Share.</p></div>`;
    const r = S.shareRes;
    if (r === undefined) return `${skillsHTML(list)}<div class="tvs-codebox"><p class="tvs-muted">Making the code…</p></div>`;
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
    const pp = plan(items());
    if (pp.error) throw new Error(pp.error);
    const pc = { counts: list.map((x) => pp.byKey[keyOf(x)] || 0) };
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
            const qd = quizQuestionData(q);
            qs.push({ skillId: it.skillId, questionData: qd, points: S.quiz.points === 2 ? 2 : 1 });
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
        let c = compressTestForURL(saved);
        const base = location.origin + location.pathname + '?quiz=';
        if ((base + c).length > 8000) {
            // The link carries the whole quiz (8000 characters at most). The LINK leaves out what the quiz screen never
            // reads: the legacy visual of an item it draws from its kit cell (cellKindFor) or its screen twin
            // (screenTwin), the hint, the label, the answer options (the quiz takes typed answers) and default options.
            // The saved quiz keeps everything.
            const slim = JSON.parse(JSON.stringify(saved));
            const own = new Set(items().filter((x) => x.opts && Object.keys(x.opts).length).map((x) => x.skillId));
            for (const sec of slim.sections || []) for (const q of sec.questions || []) {
                const qd = q.questionData || {};
                let k = null, tw = null;
                try { k = cellKindFor({ ...qd, options: [] }); } catch (e) { k = null; }
                if (!k) { try { tw = screenTwin({ ...qd, skillId: qd.skillId || q.skillId }, { typedOrder: true }); } catch (e) { tw = null; } }
                if ((k || tw) && qd.visual) delete qd.visual;
                delete qd.hint; delete qd.skillLabel; delete qd.options;
                if (!own.has(q.skillId)) delete qd.skillOptions;
            }
            c = compressTestForURL(slim);
            if ((base + c).length > 8000) {
                // still too long: say how many questions fit, and offer that
                const n = (slim.sections || []).reduce((t, x) => t + (x.questions || []).length, 0);
                S.quizFit = Math.max(1, Math.floor(n * (7900 - base.length) / c.length));
            } else S.quizFit = 0;
        } else S.quizFit = 0;
        S.quizLink = base + c;
        S.sheet = 'quizshare';
        render();
    } catch (e) { console.warn('[teacher-sheet] quiz share failed', e); toast('Could not make the quiz link'); }
}
function quizShareHTML() {
    const long = S.quizLink.length > 8000;
    return `<div class="tvs-codebox"><p class="tvs-muted">Quiz link</p><p class="tvs-link-line"><code>${esc(S.quizLink)}</code></p></div>
  <p class="tvs-muted">${long ? `This quiz is too long for one link. ${S.quizFit ? `${S.quizFit} questions fit.` : ''} It is saved in Classes › Quizzes.` : 'The whole quiz travels in the link; pupils take it exactly as today. It is also saved in your quizzes.'}</p>
  ${long && S.quizFit ? `<button type="button" class="tvs-btn" data-act="quizfit" data-v="${S.quizFit}">Make it ${S.quizFit} questions and share</button>` : ''}
  <div class="tvs-share-actions"><button type="button" class="tvs-btn tvs-primary" data-act="copyquiz"${long ? ' aria-disabled="true" data-why="This quiz is too long for one link"' : ''}>${icon('copy', 20)}<span>Copy link</span></button>
  <div class="tvs-two"><button type="button" class="tvs-btn" data-act="backquiz">${icon('back', 18)}<span>Back to the quiz</span></button><button type="button" class="tvs-btn" data-act="close">Done</button></div></div>`;
}

/* ================================================================= print */

async function doPrint() {
    if (S.sheet === 'print' && EXTRA && EXTRA.print) { const r = EXTRA.print(); if (r) { await r; return; } }
    const list = items();
    if (!list.length) { toast('Tick skills first'); return; }
    const p = plan(list);
    if (p.error) { toast(p.error); return; }
    const quiz = S.sheet === 'quiz';
    const sig = sigOf(p, list, quiz);
    if (S.printing) return;
    S.printing = true;
    try {
        let b = S.built && S.built.sig === sig ? S.built : null;
        if (!b) {
            b = await buildAll(p, list, quiz, (i, n) => { if (n > 2) toast(`Making the pages… ${i} of ${n}`); });
            b.sig = sig;
            S.built = b;
            S.printed = { sig, pages: b.pages, matchesPlan: b.matchesPlan };
            renderSide();
        }
        if (!b.doc) { toast('These pages could not be built'); return; }
        const title = quiz ? (S.quiz.name || autoQuizName(list)) : list.length === 1 ? list[0].label : 'Worksheet';
        S.lastDoc = sheetDocument(b.doc, title, { paper: S.opts.paper || 'A4' });
        try { await printHtml(b.doc, title, S.opts.paper || 'A4'); } catch (e) { console.warn('[teacher-sheet] print failed', e); toast('Could not open the print dialog'); }
    } finally { S.printing = false; }
}
/** For checks: build the whole paper now (as Print does) and return what it holds. */
export async function buildNow() {
    const list = items(); const p = plan(list); const quiz = S.sheet === 'quiz';
    if (p.error) return { error: p.error };
    const b = await buildAll(p, list, quiz);
    b.sig = sigOf(p, list, quiz); S.built = b; S.printed = { sig: b.sig, pages: b.pages, matchesPlan: b.matchesPlan };
    return { plan: { byKey: p.byKey, pages: p.pagesBy ? Object.values(p.pagesBy).reduce((a, c) => a + c, 0) : p.pages, total: p.total }, byKey: b.byKey, pages: b.pages, matchesPlan: b.matchesPlan, sameCounts: b.sameCounts, versions: b.versions,
        perVersion: b.perVersion.map((x) => ({ byKey: x.byKey, total: x.total, pages: x.pages, firstHash: hashStr(x.first) })), formA: /Form A\b/.test(b.doc), fits0: b.fits0, firstPage: (b.pupil[0] || '').split(/<section\b[^>]*class="ws-page/)[1] || '', doc: sheetDocument(b.doc, 'Worksheet', { paper: S.opts.paper || 'A4' }) };
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
    if (b.getAttribute('aria-disabled') === 'true') { toast(b.dataset.why || (currentSet().length ? 'Not ready yet' : 'Tick skills first')); return; }
    const v = b.dataset.v;
    if (b.dataset.act !== 'shareedit') S.refocus = null;
    const more = root.querySelector('.tvs-more');
    S.moreOpen = !!(more && more.open);
    if (EXTRA && EXTRA.click && /^x-/.test(b.dataset.act)) { if (EXTRA.click(b)) { changed(false); renderSide(); } return; }
    switch (b.dataset.act) {
        case 'close': close(); return;
        case 'kind': S.kind = v; touch('kind'); if (v !== 'single') S.opts.layout = 'standard'; changed(); return;
        case 'pages': { const n = Math.max(1, Math.min(30, Number(v) || 1)); if (S.sheet === 'quiz') S.quiz.pages = n; else { S.opts.pages = n; touch('pages'); } changed(); return; }
        case 'ntotal': { const n = Math.max(1, Math.min(300, Number(v) || 1)); if (S.sheet === 'quiz') S.quiz.n = n; else S.opts.nTotal = n; changed(); return; }
        case 'neach': { const n = Math.max(1, Math.min(50, Number(v) || 1)); if (S.sheet === 'quiz') S.quiz.nEach = n; else S.opts.nEach = n; changed(); return; }
        case 'mode': if (S.sheet === 'quiz') S.quiz.mode = v; else S.opts.mode = v; changed(); return;
        case 'raise': { const n = Number(v.slice(1)); if (v[0] === 'p') { if (S.sheet === 'quiz') { S.quiz.mode = 'pages'; S.quiz.pages = n; } else { S.opts.mode = 'pages'; S.opts.pages = n; touch('pages'); } } else if (S.sheet === 'quiz') S.quiz.n = n; else S.opts.nTotal = n; changed(); return; }
        case 'lower': { const it = currentSet().find((x) => `${x.categoryId}:${x.skillId}` === v); if (it) it.count = Math.max(0, Number(b.dataset.n) || 0) || undefined; window.skillQueue = [...currentSet()]; changed(); return; }
        case 'shareedit': {
            const x = items().find((y) => keyOf(y) === v);
            editShareInPlace(b, x ? x.label : v, shareHeldText(v), (text, refocus) => {
                const err = setShareFromText(v, text, () => { const pp = plan(); return pp.error || ''; });
                window.skillQueue = [...currentSet()];
                changed();
                if (err) toast(err);
                S.refocus = v;   // kept through the redraws that follow (renderMain gives it back)
                const nb = root && root.querySelector(`[data-share-key="${CSS.escape(v)}"]`); if (nb && refocus) nb.focus();
            });
            return;
        }
        case 'askrelease': S.release = v; renderMain(); return;
        case 'keep': S.release = null; renderMain(); return;
        case 'release': { const it = currentSet().find((x) => `${x.categoryId}:${x.skillId}` === v); if (it) { delete it.count; delete it.lockPct; } S.release = null; window.skillQueue = [...currentSet()]; changed(); return; }
        case 'versions': S.quiz.versions = Math.max(1, Math.min(6, Number(v) || 1)); changed(); return;
        case 'wversions': S.opts.versions = Math.max(1, Math.min(30, Number(v) || 1)); changed(); renderSide(); return;
        case 'setssame': S.opts.setsSame = v === 'same'; changed(); renderMain(); renderSide(); return;
        case 'keyversions': S.opts.keyVersions = v === 'end' ? 'end' : 'after'; changed(); return;
        case 'points': S.quiz.points = Number(v) === 2 ? 2 : 1; changed(false); renderSide(); return;
        case 'examples': S.opts.examples = v; changed(); return;
        case 'each': S.opts.each = v; changed(); return;
        case 'layout': S.opts.layout = v; changed(); return;
        case 'factcols': S.opts.factCols = v; changed(); return;
        case 'size': S.opts.size = v; changed(); return;
        case 'keyplace': S.opts.keyPlace = v; changed(); return;
        case 'keystyle': S.opts.keyStyle = v; changed(); return;
        case 'paper': S.opts.paper = v; changed(); return;
        case 'renew': S.seed = freshSeed(); S.userSeed = true; S.built = null; S.preview = null; scheduleBuild(0); renderSide(); return;
        case 'print': doPrint(); return;
        case 'popup': S.popup = v; renderPopup(); return;
        case 'popclose': { const k = S.popup; S.popup = null; renderPopup(); const back = root.querySelector(`[data-act="popup"][data-v="${CSS.escape(k || '')}"]`); if (back) back.focus(); return; }
        case 'tray': if (typeof window.tvOpenTray === 'function') { close(); window.tvOpenTray(); } return;
        case 'oldprint': close(); if (window.tvOpenPrintWith) window.tvOpenPrintWith(currentSet()); return;
        case 'from': S.quiz.from = v; S.quiz.fromQuery = ''; renderMain(); { const q = root.querySelector('#tvsFromQ'); if (q) q.focus(); } return;
        case 'pickfrom': pickFrom(v); return;
        case 'quizsave': saveQuiz(false).catch(() => toast('Could not save the quiz')); return;
        case 'quizshare': quizShare(); return;
        case 'quizfit': S.quiz.mode = 'total'; S.quiz.n = Number(v) || S.quiz.n; S.quiz.savedId = null; persist(); quizShare(); return;
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
        S.built = null; S.preview = null; scheduleBuild(600);
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

function hashStr(t) { let h = 2166136261; for (let i = 0; i < String(t).length; i++) { h ^= String(t).charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

export function openSheet(kind, ctx) { open(kind, ctx || {}); }
export function closeSheet() { if (S.sheet) close(); }
/** For checks and the flow counter: what the open sheet would print, and its summary. */
export function sheetState() {
    const list = items();
    let p = null; try { p = list.length ? plan(list) : null; } catch (e) { p = null; }
    return { sheet: S.sheet, kind: list.length ? kindOf(list) : null, plan: p, summary: summary(), preview: !!(S.preview && S.preview.html), building: !!S.building,
        built: S.built ? { pages: S.built.pages, total: S.built.total, byKey: S.built.byKey, versions: S.built.versions, errors: S.built.errors, matchesPlan: S.built.matchesPlan } : null,
        share: S.shareRes, quizLink: S.quizLink, lastDoc: S.lastDoc || '' };
}

/** The worksheet's How much, shared with the tray popup's "Total" (T3a): { mode: 'pages' | 'total' | 'each', n, pages, total }. */
export function sheetAmount() {
    const list = items();
    let p = null; try { p = list.length ? plan(list) : null; } catch (e) { p = null; }
    const m = S.opts.mode || 'pages';
    return { mode: m, n: m === 'pages' ? (p && p.pages ? p.pages : S.opts.pages) : m === 'each' ? S.opts.nEach : S.opts.nTotal, pages: p ? p.pages : null, total: p && !p.error ? p.total : null };
}
/** Set How much from the tray popup: 'pages' (1–30) or 'total' problems in all (1–999); kept like the sheet's own choice. */
export function setSheetAmount(mode, n) {
    if (mode === 'pages') { S.opts.mode = 'pages'; S.opts.pages = Math.max(1, Math.min(30, Math.round(Number(n) || 1))); touch('pages'); }
    else { S.opts.mode = 'total'; S.opts.nTotal = Math.max(1, Math.min(999, Math.round(Number(n) || 1))); }
    persist();
}

/** The print settings a saved set keeps (owner 2026-10-25): How much, sets, key, layout, size, examples, columns, paper, header, and the quiz's own amount. */
export function printSettings() {
    return { opts: JSON.parse(JSON.stringify(S.opts)), quiz: { mode: S.quiz.mode, n: S.quiz.n, nEach: S.quiz.nEach, pages: S.quiz.pages, versions: S.quiz.versions, points: S.quiz.points } };
}
/** Put a set's stored print settings back (a set saved before they were stored changes nothing). */
export function applyPrintSettings(p) {
    if (!p || typeof p !== 'object') return;
    if (p.opts && typeof p.opts === 'object') Object.assign(S.opts, p.opts, { header: Object.assign({}, S.opts.header, p.opts.header || {}) });
    if (p.quiz && typeof p.quiz === 'object') for (const k of ['mode', 'n', 'nEach', 'pages', 'versions', 'points']) if (p.quiz[k] !== undefined) S.quiz[k] = p.quiz[k];
    S.preview = null;
    persist();
    if (root && S.sheet) changed(false);
}

/* ================================================================= hooks (lane S2 T4: lesson sets)
 * The Lessons place adds lesson groups to the tray. When the tray holds them, the Print sheet shows a block that
 * asks "one worksheet per lesson / one for all / both" (EXTRA.html), and Print makes ONE document from a batch of
 * buildSheet requests (buildBatch): each lesson its own pages and key, then the combined paper. */
let EXTRA = null;
const closeFns = new Set();
/** { html(list) → string, click(button) → true to redraw, print() → Promise | null (null = the sheet prints as usual) }.
 *  Its buttons use data-act="x-…". */
export function setPrintExtra(x) { EXTRA = x && typeof x === 'object' ? x : null; }
/** fn runs each time the sheet closes. Returns the remover. */
export function onSheetClose(fn) { closeFns.add(fn); return () => closeFns.delete(fn); }
/** The open sheet redraws (an EXTRA choice changed from outside). */
export function redrawSheet() { if (root && S.sheet) changed(false); }
/**
 * Several worksheets in ONE document, in the order given, each with its own pages and key:
 *   { keys, kind?: 'sections' | 'mixed' | 'single', title? }   a worksheet of those skills, planned as the sheet plans
 *   { lessons: [{ title, keys }], title? }                        one worksheet, a section per lesson (each lesson's
 *                                                                 skills together, as many problems as its own sheet)
 * Returns { doc, pages, keyPages, parts: [{ title, pages, total, error? }] }.
 */
export function buildBatch(parts, onProgress) {
    // one batch at a time: a batch sets the sheet's kind and title while it builds
    const run = B.chain.then(() => buildBatchNow(parts, onProgress));
    B.chain = run.catch(() => null);
    return run;
}
async function buildBatchNow(parts, onProgress) {
    const all = items();
    const pick = (keys) => keys.map((k) => all.find((x) => keyOf(x) === k)).filter((x) => x && !x.leftOut);
    const keepKind = S.kind, keepTitle = S.batchTitle;
    const out = { doc: '', pages: 0, keyPages: 0, parts: [] };
    let i = 0;
    try {
        for (const part of parts) {
            if (onProgress) onProgress(++i, parts.length);
            await yieldNow();
            S.batchTitle = part.title || '';
            if (part.lessons) {
                const secs = [];
                for (const l of part.lessons) {
                    const list = pick(l.keys || []);
                    if (!list.length) continue;
                    S.kind = 'mixed';
                    const p = plan(list);
                    secs.push({ skills: list.map((it) => skillRef(it)), count: Math.max(1, p.error ? list.length * 2 : p.total) });
                }
                if (!secs.length) continue;
                const req = Object.assign(common(S.seed + 7919 * (i + 50), false, 0), { role: 'independent', sections: secs });
                let res;
                try { res = await buildSheet(req); } catch (e) { out.parts.push({ title: part.title, pages: 0, total: 0, error: (e && e.message) || 'Could not be built' }); continue; }
                out.doc += (res.keyOptions && res.keyOptions.placement === 'after-page' ? res.docHtml || res.pupilHtml : `${res.pupilHtml}\n${res.keyHtml || ''}`) + '\n';
                out.pages += res.pageCount || 0; out.keyPages += res.keyPageCount || 0;
                out.parts.push({ title: part.title, pages: res.pageCount || 0, keyPages: res.keyPageCount || 0, total: (res.items || []).filter(Boolean).length, first: (res.pupilPages && res.pupilPages[0]) || res.pupilHtml });
                continue;
            }
            const list = pick(part.keys || []);
            if (!list.length) continue;
            S.kind = part.kind || keepKind;
            const p = plan(list);
            if (p.error) { out.parts.push({ title: part.title, pages: 0, total: 0, error: p.error }); continue; }
            const b = await buildAll(p, list, false);
            out.doc += b.doc + '\n';
            out.pages += b.pages; out.keyPages += b.keyPages;
            out.parts.push({ title: part.title, pages: b.pages, keyPages: b.keyPages, total: b.printed, first: (b.perVersion[0] || {}).first || '' });
        }
    } finally { S.kind = keepKind; S.batchTitle = keepTitle; }
    return out;
}
/* The lesson-group summary: built from the SAME batch Print all prints, so its numbers are the PDF's. */
const B = { sig: '', res: null, busy: null, tok: 0, prog: '', chain: Promise.resolve() };
function batchActive() { try { return S.sheet === 'print' && !!EXTRA && typeof EXTRA.parts === 'function' && (EXTRA.parts() || []).length > 0; } catch (e) { return false; } }
function batchSig(parts) {
    return JSON.stringify({ parts, seed: S.seed, o: S.opts, k: S.kind, l: trayLocks(), g: trayGroups(), it: items().map((x) => [keyOf(x), x.opts || null, x.weight, x.count || 0, x.lockPct === undefined ? -1 : x.lockPct, x.leftOut ? 0 : 1]) });
}
function ensureBatch(onProgress) {
    const parts = EXTRA.parts();
    const sig = batchSig(parts);
    if (B.sig === sig && B.res) return Promise.resolve(B.res);
    if (B.sig === sig && B.busy) { if (onProgress) B.onProg = onProgress; return B.busy; }
    B.sig = sig; B.res = null; B.onProg = onProgress || null;
    const my = ++B.tok;
    B.busy = buildBatch(parts, (i, n) => {
        if (my !== B.tok) return;
        B.prog = `Making worksheet ${i} of ${n}…`;
        if (B.onProg) B.onProg(i, n);
        if (root) renderSide();
    }).then((r) => { if (my === B.tok) { B.res = r; B.busy = null; B.prog = ''; if (root) renderSide(); } return r; });
    return B.busy;
}
const pl = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
/** The words of a built batch: "4 worksheets · 9 pages + 4 key pages · 38 problems", and a line per worksheet. */
export function batchSummary(r) {
    if (!r) return null;
    const ok = r.parts.filter((x) => !x.error);
    const problems = ok.reduce((t, x) => t + x.total, 0);
    return {
        line: `${pl(ok.length, 'worksheet')} · ${pl(r.pages, 'page')} + ${pl(r.keyPages, 'key page')} · ${pl(problems, 'problem')}`,
        rows: r.parts.map((x) => (x.error ? `${x.title}: ${x.error}` : `${x.title}: ${pl(x.pages, 'page')} · ${pl(x.total, 'problem')} · key ${pl(x.keyPages, 'page')}`)),
        pages: r.pages, keyPages: r.keyPages, problems, worksheets: ok.length,
    };
}
function renderBatchSide(side) {
    if (!side.dataset.batch) {
        side.dataset.batch = '1';
        side.innerHTML = `<div class="tvs-sum" id="tvsSumBox" aria-live="polite"></div><div class="tvs-prev" id="tvsPrevBox"><iframe class="tvs-prev-frame" id="tvsPrevFrame" title="Page 1 preview" tabindex="-1"></iframe></div>
  <p class="tvs-muted tvs-prev-cap" id="tvsPrevCap"></p><div class="tvs-actions" id="tvsActBox"></div>`;
    }
    const parts = EXTRA.parts();
    const fresh = B.res && B.sig === batchSig(parts);
    if (!fresh && !B.busy) setTimeout(() => ensureBatch(), 0);
    const sm = fresh ? batchSummary(B.res) : null;
    side.querySelector('#tvsSumBox').innerHTML = sm
        ? `<p class="tvs-sum-line" data-tvs-summary data-tvs-batch="${sm.worksheets}|${sm.pages}|${sm.keyPages}|${sm.problems}">${esc(sm.line)}</p><ul class="tvs-sum-more tvs-batch-rows">${sm.rows.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`
        : `<p class="tvs-sum-line" data-tvs-summary>${esc(`${pl(parts.length, 'worksheet')} · counting the pages…`)}</p><p class="tvs-sum-more" data-tvs-progress>${esc(B.prog || 'Making the worksheets…')}</p>`;
    side.querySelector('#tvsPrevCap').textContent = fresh ? `First page of “${(B.res.parts[0] || {}).title || 'the first worksheet'}” · Print all makes every page` : 'Drawing the first page…';
    side.querySelector('#tvsActBox').innerHTML = `<button type="button" class="tvs-btn tvs-primary" data-act="x-lpprint">${icon('print', 20)}<span>Print all</span></button>
    <button type="button" class="tvs-btn" data-act="renew">${icon('shuffle', 18)}<span>New numbers</span></button>`;
    if (fresh && B.res.parts[0] && B.res.parts[0].first) showPreview(B.res.parts[0].first);
}

/** buildBatch, then the print dialog (the document is kept as the sheet's last document). */
export async function printBatch(parts, title, onProgress) {
    // the same build the summary counted (built once, for the summary and the print), else a fresh one
    const b = batchActive() && batchSig(parts) === B.sig ? await ensureBatch(onProgress) : await buildBatch(parts, onProgress);
    if (!b.doc) { toast('These pages could not be built'); return b; }
    S.lastDoc = sheetDocument(b.doc, title, { paper: S.opts.paper || 'A4' });
    try { await printHtml(b.doc, title, S.opts.paper || 'A4'); } catch (e) { console.warn('[teacher-sheet] print failed', e); toast('Could not open the print dialog'); }
    return b;
}

if (typeof window !== 'undefined') {
    window.tvOpenSheet = openSheet;
    window.tvSheetAmount = { get: sheetAmount, set: setSheetAmount };
    window.tvSheetPrint = { get: printSettings, set: applyPrintSettings };
    window.tvCloseSheet = closeSheet;
    window.tvSheetState = sheetState;
    window.tvSheetBuildNow = buildNow;
    window.tvSheetHooks = { setPrintExtra, onSheetClose, redrawSheet, buildBatch, printBatch, batchSummary, batchNow: () => (batchActive() ? ensureBatch() : Promise.resolve(null)) };
}
