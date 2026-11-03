// simple-print.js — ONE simple print everywhere (owner, 2026-11-03: "I want the print to be easy: just the skill —
// number of problems OR percentage, how many problems or pages, how big/columns." … "Right now it is too complicated
// and is broken.")
//
//   window.openSimplePrint(skills, ctx)
//     skills  [{ categoryId, skillId, opts?, count?, lockPct? }]   the skills to print (a tray, a link, a card)
//     ctx     { from: 'tray' | 'student' | 'quick', title?, more?: () => void }
//             `more` = the "More options" link (the teacher's full print dialog); without it the link is hidden
//
// Four steps, then Print:
//   1 Skills      each with a number OR a % of the problems (blank = share evenly)
//   2 How many    Problems | Pages, and the number
//   3 Size        Big / Medium / Small (each shows its columns) + Columns "Auto (n)" or 2–10
//   4 Answer key  on / off
//   More options  Arrange: In sections (default) | Mixed up; the full dialog (teacher only)
//
// The page always FILLS the paper (the bug this replaces: one request per small page plan, three one-problem rows a
// page). How the request is made (buildSheet, print-sheet.js, unchanged):
//   In sections   ONE 'independent' request, a section per skill with its count: full grids, the engine paginates.
//                 Pages mode: each section's own full-page capacity is read from a probe build, the total that fills
//                 the pages is dealt by the shares and rounded to whole rows, then trimmed a row at a time until the
//                 engine's page count is the pages asked.
//   Fast facts    Pages mode with every skill a fact (sheet/roles/fact-rows.js isFact): the 'fact-rows' role, one
//                 request per page (5–10 columns: 10 / 6 / 5 at S / M / L); division facts print across, so they get
//                 their own pages and never pull the other facts down to 3 columns.
//   Mixed up      'mixed-practice' with arrangement 'mixed' (the engine prints in sections, with its note, when the
//                 skills cannot interleave).
//   Columns       an asked count the problems cannot take is clamped by the engine to what fits (and the page is built
//                 again at that count, so a clamped grid never collapses to one row a page); the line says so.
//
// Lazy: this file is in js/modules/deferred.js, so a pupil's startup never loads it (globals.js stubs the name and
// loads the deferred half on the first press). Styles: css/simple-print.css (.sp-*), self-contained tokens, so it
// looks the same on the student page and the teacher site.

import { buildSheet, sheetDocument } from './print-sheet.js';
import { printHtml } from './teacher-print.js';
import { openPdfPreview } from './teacher-pdf-preview.js';
import { generateQuestionFor } from './generate-question.js';
import { isFact as isFactItem } from './sheet/roles/fact-rows.js';
import { SKILLS } from './data.js';

const STORE_KEY = 'mq_simple_print';
const SIZES = [['L', 'Big'], ['M', 'Medium'], ['S', 'Small']];
const SIZE_NAME = Object.fromEntries(SIZES);
const FACT_AUTO = { S: 10, M: 6, L: 5 };
const MAX_PROBLEMS = 400, MAX_PAGES = 30, MAX_SETS = 30;

/* ================================================================= state */

function loadPrefs() {
    const d = { how: 'pages', n: 1, nProblems: 24, nPages: 1, sets: 1, size: 'M', cols: 'auto', key: true, arrange: 'sections' };
    try {
        const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
        if (s && typeof s === 'object') {
            if (s.how === 'problems' || s.how === 'pages') d.how = s.how;
            if (Number(s.nProblems) > 0) d.nProblems = Math.min(MAX_PROBLEMS, Math.round(Number(s.nProblems)));
            if (Number(s.nPages) > 0) d.nPages = Math.min(MAX_PAGES, Math.round(Number(s.nPages)));
            if (Number(s.sets) >= 1) d.sets = Math.min(MAX_SETS, Math.round(Number(s.sets)));
            if (SIZE_NAME[s.size]) d.size = s.size;
            if (s.cols === 'auto' || (Number(s.cols) >= 2 && Number(s.cols) <= 10)) d.cols = s.cols === 'auto' ? 'auto' : Number(s.cols);
            if (typeof s.key === 'boolean') d.key = s.key;
            if (s.arrange === 'mixed' || s.arrange === 'sections') d.arrange = s.arrange;
        }
    } catch (e) { /* defaults */ }
    return d;
}
function savePrefs() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ how: P.how, nProblems: P.nProblems, nPages: P.nPages, sets: P.sets, size: P.size, cols: P.cols, key: P.key, arrange: P.arrange })); } catch (e) { /* not saved */ }
}

const P = loadPrefs();
let S = null;   // the open dialog: { list, ctx, root, built, token, probes, lastFocus }

export const keyOf = (s) => `${s.categoryId}:${s.skillId}`;
function labelOf(s) {
    const hit = (SKILLS[s.categoryId] || []).find((x) => x.v === s.skillId);
    return String(hit ? hit.l : s.skillId).replace(/\s*\((?:Visual|MAP|black and white)\)/g, '');
}
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ================================================================= the request (pure; also used by ws-simple-print) */

/** One amount box: '' (share evenly) | {n} (a number of problems) | {pct} (a % of the problems). */
export function parseAmount(v) {
    const t = String(v == null ? '' : v).trim();
    if (!t) return null;
    const m = /^(\d+(?:\.\d+)?)\s*(%?)$/.exec(t);
    if (!m) return { bad: true };
    const x = Number(m[1]);
    if (m[2]) return x > 0 && x <= 100 ? { pct: x } : { bad: true };
    return x >= 1 ? { n: Math.min(MAX_PROBLEMS, Math.round(x)) } : { bad: true };
}

/**
 * Split `total` problems across the skills: a number is exact, a % is that share of the total, a blank shares what is
 * left evenly. Returns { counts: [..], total } (the total rises when the numbers alone add up to more).
 */
export function splitCounts(amounts, total) {
    const n = amounts.length;
    const counts = new Array(n).fill(0);
    let fixed = 0;
    amounts.forEach((a, i) => { if (a && a.n) { counts[i] = a.n; fixed += a.n; } });
    let T = Math.max(total, fixed);
    let pctUsed = 0;
    amounts.forEach((a, i) => { if (a && a.pct) { counts[i] = Math.max(1, Math.round(T * a.pct / 100)); pctUsed += counts[i]; } });
    const blanks = amounts.map((a, i) => (!a || a.bad ? i : -1)).filter((i) => i >= 0);
    let rest = Math.max(0, T - fixed - pctUsed);
    if (blanks.length) {
        const each = Math.floor(rest / blanks.length);
        let extra = rest - each * blanks.length;
        blanks.forEach((i) => { counts[i] = each + (extra-- > 0 ? 1 : 0); });
    }
    const sum = counts.reduce((t, c) => t + c, 0);
    return { counts, total: sum };
}
/** The share of the page each skill gets (for Pages mode): numbers become shares of the numbers' own total. */
function sharesOf(amounts) {
    const r = splitCounts(amounts, 1000);
    const t = r.total || 1;
    return r.counts.map((c) => c / t);
}

/** Is every skill of the set a fast fact (the fact-rows role takes it)? */
const factCache = new Map();
export function isFactSkill(s) {
    const k = keyOf(s) + JSON.stringify(s.opts || {});
    if (factCache.has(k)) return factCache.get(k);
    let ok = false;
    try {
        ok = [11, 23, 37].every((seed) => {
            const q = generateQuestionFor({ category: s.categoryId, skill: s.skillId, opts: s.opts, seed });
            return !!q && isFactItem({ q: Object.assign({ skillId: s.skillId, categoryId: s.categoryId }, q), template: q.cell && q.cell.template });
        });
    } catch (e) { ok = false; }
    factCache.set(k, ok);
    return ok;
}
const isDivisionFact = (s) => s.categoryId === 'division';

function baseReq(o) {
    return {
        size: o.size, look: 'auto', paper: o.paper || 'A4', seed: o.seed >>> 0,
        header: { name: true, date: true, score: false, title: o.title || true },
        key: o.key ? { on: true, placement: 'end', style: 'copy' } : { on: false },
    };
}
const skillRef = (s) => ({ categoryId: s.categoryId, skillId: s.skillId, opts: s.opts || {} });
const colsAsked = (o) => (o.cols && o.cols !== 'auto' ? Number(o.cols) : undefined);

/**
 * Which arrangement this print takes: 'facts' (fact rows), 'mixed' (Mixed up) or 'sections'.
 * Fact rows fill whole pages, so they are used in Pages mode only (Problems mode keeps the exact count).
 */
export function arrangementOf(list, o) {
    if (o.arrange === 'mixed' && list.length >= 2) return 'mixed';
    if (o.how === 'pages' && list.length && list.every(isFactSkill)) return 'facts';
    return 'sections';
}

/** A sections request: one section per skill with its count (and the asked columns, or each section's clamp). */
function sectionsReq(list, counts, o, colsBy) {
    return Object.assign(baseReq(o), {
        role: 'independent',
        sections: list.map((s, i) => {
            const sec = { skills: [skillRef(s)], count: counts[i] };
            const c = colsBy ? colsBy[i] : colsAsked(o);
            if (c) sec.columns = c;
            return sec;
        }).filter((x) => x.count > 0),
    });
}

/** Build a sections request; an asked column count the engine clamped is asked again at the clamp (never 1 row a page). */
async function buildSections(list, counts, o) {
    // Auto: a fast-fact part asks for the fact columns (10 / 6 / 5) and takes the most that fit (critic r1 D4: Auto
    // printed 5 across where 6 fit); every other part keeps the engine's own Auto
    let colsBy = list.map((s) => colsAsked(o) || (isFactSkill(s) ? FACT_AUTO[o.size] : undefined));
    let res = await buildSheet(sectionsReq(list, counts, o, colsBy));
    const live = list.map((_, i) => i).filter((i) => counts[i] > 0);
    const fs = (res.fits && res.fits.sections) || [];
    let clamped = false, refit = false;
    colsBy = colsBy.slice();
    live.forEach((i, j) => {
        const f = fs[j];
        if (colsBy[i] && f && f.cols && (f.clamped || f.cols < colsBy[i])) { if (colsAsked(o)) clamped = true; colsBy[i] = f.cols; refit = true; }
    });
    if (refit) res = await buildSheet(sectionsReq(list, counts, o, colsBy));
    res.__clamped = clamped;
    return res;
}

/**
 * Build the whole print for the chosen settings. Returns
 *   { pupilHtml, keyHtml, doc, pages, keyPages, total, counts, arrangement, cols, rows, perPage, notes, firstHtml }
 */
export async function buildSimple(list, o) {
    const amounts = list.map((s) => parseAmount(s.amt));
    const arrangement = arrangementOf(list, o);
    const notes = [];
    if (o.probe) return probeCols(list, arrangement, o);
    if (arrangement === 'facts') return buildFacts(list, amounts, o);
    if (arrangement === 'mixed') return buildMixed(list, amounts, o);

    let counts;
    let res;
    if (o.how === 'problems') {
        counts = splitCounts(amounts, o.n).counts;
        res = await buildSections(list, counts, o);
    } else {
        const asked = Math.max(1, Math.min(MAX_PAGES, o.n));
        // each section's own full page: cols x rows, read from a probe build of every skill at once
        const probe = await buildSections(list, list.map(() => 12), o);
        const fs = (probe.fits && probe.fits.sections) || [];
        const per = list.map((_, i) => Math.max(1, (fs[i] && fs[i].perPage) || 12));
        const across = list.map((_, i) => Math.max(1, (fs[i] && fs[i].cols) || 1));
        const shares = sharesOf(amounts);
        const fill = async (pages) => {
            const T = Math.max(list.length, Math.floor(pages / shares.reduce((t, f, i) => t + f / per[i], 0)));
            let c = shares.map((f, i) => (amounts[i] && amounts[i].n ? amounts[i].n : Math.max(1, Math.round(f * T))));
            // whole rows: a skill's part ends on a full row (the page never shows a half-empty row it could fill)
            c = c.map((x, i) => (amounts[i] && amounts[i].n ? x : Math.max(across[i], Math.round(x / across[i]) * across[i])));
            let r = await buildSections(list, c, o);
            // too much for the pages: take a row off the skill with the most rows, until it fits (at most 12 builds)
            for (let k = 0; k < 12 && (r.pageCount || 1) > pages; k++) {
                let best = -1;
                c.forEach((x, i) => {
                    if (amounts[i] && amounts[i].n) return;
                    if (x - across[i] < 1) return;
                    if (best < 0 || x / across[i] > c[best] / across[best]) best = i;
                });
                if (best < 0) break;
                c = c.slice(); c[best] -= across[best];
                r = await buildSections(list, c, o);
            }
            // room left: give a row more to the skills with the fewest rows, while the pages still hold it
            const full = new Set(c.map((_, i) => i).filter((i) => amounts[i] && amounts[i].n));
            for (let k = 0; k < 3 * list.length && full.size < list.length && (r.pageCount || 1) <= pages; k++) {
                let best = -1;
                c.forEach((x, i) => { if (!full.has(i) && (best < 0 || x / across[i] < c[best] / across[best])) best = i; });
                if (best < 0) break;
                const c2 = c.slice(); c2[best] += across[best];
                const r2 = await buildSections(list, c2, o);
                if ((r2.pageCount || 1) <= pages) { c = c2; r = r2; } else full.add(best);
            }
            return { r, c };
        };
        let f = await fill(asked);
        // one row of every skill already needs more pages than asked: fill the pages it needs (never half-empty pages)
        if ((f.r.pageCount || 1) > asked) {
            const need = f.r.pageCount || 1;
            f = await fill(need);
            notes.push(`${list.length} skills need at least ${need} pages at ${SIZE_NAME[o.size]}: each skill has its own part.`);
        }
        res = f.r; counts = f.c;
    }
    if (res.__clamped) notes.push(`${o.cols} columns do not fit some of these problems at ${SIZE_NAME[o.size]}: they print at the most that fit.`);
    return finish(res, { counts, arrangement, notes, list });
}

/** The Auto columns at a size (the size buttons' "n columns"): one small build, no filling. */
async function probeCols(list, arrangement, o) {
    if (arrangement === 'facts') {
        const g = list.filter((s) => !isDivisionFact(s));
        const res = await buildSheet(Object.assign(baseReq(o), { role: 'fact-rows', look: 'auto', sections: [{ skills: (g.length ? g : list).map(skillRef), pages: 1 }] }));
        const f = res.fits || {};
        return { cols: f.cols || 0, colsList: [f.cols || 0] };
    }
    if (arrangement === 'mixed') {
        const res = await buildSheet(Object.assign(baseReq(o), { role: 'mixed-practice', arrangement: 'mixed', sections: [{ skills: list.map(skillRef), count: 4 * list.length }] }));
        const fs = (res.fits && res.fits.sections) || [];
        return { cols: (fs[0] || res.fits || {}).cols || 0, colsList: fs.map((x) => x.cols).filter(Boolean) };
    }
    const res = await buildSections(list, list.map(() => 12), o);
    const fs = (res.fits && res.fits.sections) || [];
    return { cols: (fs[0] || {}).cols || 0, colsList: fs.map((x) => x.cols).filter(Boolean) };
}

async function buildFacts(list, amounts, o) {
    const pages = Math.max(1, Math.min(MAX_PAGES, o.n));
    const groups = [list.filter((s) => !isDivisionFact(s)), list.filter(isDivisionFact)].filter((g) => g.length);
    // pages per group by the groups' shares (each group at least one page when the pages allow)
    const shares = sharesOf(amounts);
    const gShare = groups.map((g) => g.reduce((t, s) => t + shares[list.indexOf(s)], 0));
    let gPages = gShare.map((f) => Math.max(1, Math.round(f * pages)));
    while (gPages.reduce((t, x) => t + x, 0) > pages && gPages.some((x) => x > 1)) { const i = gPages.indexOf(Math.max(...gPages)); gPages[i]--; }
    while (gPages.reduce((t, x) => t + x, 0) < pages) { const i = gShare.indexOf(Math.max(...gShare)); gPages[i]++; }
    const out = { pupil: [], key: [], pages: 0, keyPages: 0, items: 0, fits: null, notes: [], first: '', counts: list.map(() => 0) };
    let n = 0;
    for (let g = 0; g < groups.length; g++) {
        for (let p = 0; p < gPages[g]; p++) {
            const req = Object.assign(baseReq(Object.assign({}, o, { seed: o.seed + 7919 * (n++) })), {
                role: 'fact-rows', look: 'auto',
                sections: [{ skills: groups[g].map(skillRef), pages: 1, ...(colsAsked(o) ? { columns: colsAsked(o) } : {}) }],
            });
            const res = await buildSheet(req);
            out.pupil.push(res.pupilHtml || '');
            out.key.push(res.keyHtml || '');
            out.pages += res.pageCount || 1;
            out.keyPages += res.keyPageCount || 0;
            if (!out.first) out.first = (res.pupilPages && res.pupilPages[0]) || res.pupilHtml;
            if (!out.fits && res.fits) out.fits = res.fits;
            for (const it of res.items || []) { if (!it) continue; out.items++; const i = list.findIndex((s) => keyOf(s) === it.skill); if (i >= 0) out.counts[i]++; }
            for (const t of res.notes || []) if (!out.notes.includes(t) && !/^Fits:/.test(t)) out.notes.push(t);
        }
    }
    const f = out.fits || {};
    const keyHtml = o.key ? out.key.join('\n') : '';
    return {
        pupilHtml: out.pupil.join('\n'), keyHtml, doc: out.pupil.join('\n') + (keyHtml ? '\n' + keyHtml : ''),
        pages: out.pages, keyPages: o.key ? out.keyPages : 0, total: out.items, counts: out.counts, arrangement: 'facts',
        // what page 1 really holds (critic r2: a 6 x 6 grid that printed 30 said "36 a page")
        ...(() => { const p1 = (out.first.split('class="ws-cell ').length - 1) || f.perPage || 0; return { cols: f.cols || 0, rows: f.cols ? Math.ceil(p1 / f.cols) : f.rows || 0, perPage: p1 }; })(),
        colsList: [f.cols || 0], notes: out.notes, firstHtml: out.first,
    };
}

async function buildMixed(list, amounts, o) {
    const mk = (counts) => Object.assign(baseReq(o), {
        role: 'mixed-practice', arrangement: 'mixed',
        sections: [{ skills: list.map((s, i) => Object.assign(skillRef(s), counts ? { weight: Math.max(1, counts[i]) } : {})), count: counts.reduce((t, c) => t + c, 0) }],
    });
    let counts;
    let res;
    if (o.how === 'problems') {
        counts = splitCounts(amounts, o.n).counts;
        res = await buildSheet(mk(counts));
    } else {
        const pages = Math.max(1, Math.min(MAX_PAGES, o.n));
        const shares = sharesOf(amounts);
        const probe = await buildSheet(mk(shares.map((f) => Math.max(1, Math.round(f * 40)))));
        const per = Math.max(list.length, (probe.fits && probe.fits.perPage) || 12);
        let T = per * pages;
        counts = shares.map((f) => Math.max(1, Math.round(f * T)));
        res = await buildSheet(mk(counts));
        for (let k = 0; k < 6 && (res.pageCount || 1) > pages; k++) {
            T = Math.max(list.length, Math.floor(T * pages / (res.pageCount || 1)) - (k > 2 ? 2 : 0));
            counts = shares.map((f) => Math.max(1, Math.round(f * T)));
            res = await buildSheet(mk(counts));
        }
    }
    return finish(res, { counts, arrangement: 'mixed', notes: [], list });
}

/** The problems the built page 1 really holds (never the grid's nominal capacity: the engine may cap a page). */
const page1Cells = (res) => (((res.pupilPages && res.pupilPages[0]) || '').split('class="ws-cell ').length - 1) || (res.fits && res.fits.perPage) || 0;

function finish(res, { counts, arrangement, notes, list }) {
    const fs = (res.fits && res.fits.sections) || [];
    const colsList = fs.map((f) => f.cols).filter(Boolean);
    const first = fs[0] || res.fits || {};
    const engineNotes = (res.notes || []).filter((t) => /prints in sections|old drawing|do not fit|cannot/i.test(t));
    const got = list.map(() => 0);
    for (const it of res.items || []) { if (!it) continue; const i = Number.isInteger(it.section) && arrangement === 'sections' ? it.section : list.findIndex((s) => keyOf(s) === it.skill); if (i >= 0 && i < got.length) got[i]++; }
    return {
        pupilHtml: res.pupilHtml || '', keyHtml: res.keyHtml || '', doc: (res.pupilHtml || '') + (res.keyHtml ? '\n' + res.keyHtml : ''),
        pages: res.pageCount || 1, keyPages: res.keyPageCount || 0, total: (res.items || []).filter(Boolean).length, counts: got.some(Boolean) ? got : counts,
        arrangement: arrangement === 'mixed' && (res.arrangement !== 'mixed' || engineNotes.some((t) => /prints in sections/i.test(t))) ? 'sections' : arrangement,
        fellBack: arrangement === 'mixed' && (res.arrangement !== 'mixed' || engineNotes.some((t) => /prints in sections/i.test(t))),
        cols: first.cols || 0, rows: fs.length === 1 && first.cols ? Math.ceil(page1Cells(res) / first.cols) : first.rows || 0, perPage: page1Cells(res), colsList,
        notes: [...notes, ...engineNotes], firstHtml: (res.pupilPages && res.pupilPages[0]) || res.pupilHtml || '',
    };
}

/** The set line on every pupil and key page ("Set 2 of 3") where the engine prints its form letter; one set: none. */
function setFooter(html, label) {
    if (!label) return String(html).replace(/Form [AB]\b\s*(·\s*)?/g, '');
    return String(html).replace(/Form [AB]\b/g, label);
}

/**
 * Several sets (owner 2026-11-03: "also how many sets"): each set is the same plan with its own seed, so its own
 * problems, and its own answer key straight after it. The page counts and the summary are set 1's (every set is
 * built from the same counts).
 */
export async function buildSets(list, o) {
    const n = Math.max(1, Math.min(MAX_SETS, Math.round(Number(o.sets) || 1)));
    const first = await buildSimple(list, o);
    if (n === 1) return Object.assign({}, first, { pupilHtml: setFooter(first.pupilHtml, ''), keyHtml: setFooter(first.keyHtml, ''), doc: setFooter(first.doc, ''), firstHtml: setFooter(first.firstHtml, ''), sets: 1, pagesAll: first.pages + first.keyPages });
    const docs = [];
    let pagesAll = 0;
    for (let k = 0; k < n; k++) {
        // set 1 is the build already made; sets 2..n keep set 1's counts (amounts as numbers) with a new seed
        const b = k === 0 ? first : await buildSimple(list.map((s, i) => Object.assign({}, s, { amt: String(first.counts[i] || 0) })), Object.assign({}, o, { seed: (o.seed + k * 104729) >>> 0, how: o.how === 'pages' && first.arrangement === 'facts' ? 'pages' : 'problems', n: o.how === 'pages' && first.arrangement === 'facts' ? o.n : first.total }));
        const label = `Set ${k + 1} of ${n}`;
        docs.push(setFooter(b.pupilHtml, label) + (o.key && b.keyHtml ? '\n' + setFooter(b.keyHtml, label) : ''));
        pagesAll += b.pages + (o.key ? b.keyPages : 0);
    }
    return Object.assign({}, first, { doc: docs.join('\n'), firstHtml: setFooter(first.firstHtml, `Set 1 of ${n}`), sets: n, pagesAll });
}

/** The plain-words line: "5 columns × 6 rows = 30 a page · 2 pages · 60 problems · answer key at the end". */
export function summaryLine(b, o) {
    if (!b) return '';
    const cl = [...new Set(b.colsList && b.colsList.length ? b.colsList : [b.cols])].filter(Boolean);
    const pages = `${b.pages} page${b.pages === 1 ? '' : 's'}`;
    const probs = `${b.total} problem${b.total === 1 ? '' : 's'}`;
    const sets = Math.max(1, Number(b.sets) || 1);
    const key = o.key ? (sets > 1 ? 'each set with its answer key' : 'answer key at the end') : 'no answer key';
    let grid;
    if (b.rows && b.cols && b.cols * b.rows === b.perPage && (b.arrangement === 'facts' || (cl.length === 1 && (b.colsList || []).length <= 1 && !b.fellBack))) grid = `${b.cols} columns × ${b.rows} rows = ${b.perPage || b.cols * b.rows} a page`;
    else if (cl.length === 1) grid = `${cl[0]} columns · ${b.perPage} on page 1`;
    else grid = `Each skill its own grid, ${Math.min(...cl)}–${Math.max(...cl)} columns · ${b.perPage} on page 1`;
    return [grid, pages, probs, ...(sets > 1 ? [`${sets} sets, each with different problems`] : []), key].join(' · ');
}

/* ================================================================= the dialog */

export function openSimplePrint(skills, ctx = {}) {
    const list = (Array.isArray(skills) ? skills : []).filter((s) => s && s.categoryId && s.skillId && s.leftOut !== true)
        .map((s) => ({
            categoryId: s.categoryId, skillId: s.skillId, opts: s.opts && typeof s.opts === 'object' ? s.opts : undefined,
            label: s.label || labelOf(s),
            amt: Number(s.count) > 0 ? String(Math.round(Number(s.count))) : typeof s.lockPct === 'number' && s.lockPct > 0 ? `${Math.round(s.lockPct)}%` : '',
        }));
    if (!list.length) { try { window.showToast?.('Choose a skill to print first', 'info'); } catch (e) { /* */ } return; }
    closeSimplePrint();
    S = { list, ctx, root: null, built: null, token: 0, probes: {}, lastFocus: document.activeElement, timer: 0, seed: seedOf(list) };
    mount();
    render();
    schedule(0);
}

function seedOf(list) {
    let h = 7;
    for (const ch of list.map(keyOf).join('|')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return 100000 + (h % 900000);
}

export function closeSimplePrint() {
    if (!S) return;
    savePrefs();
    if (S.root) S.root.remove();
    document.removeEventListener('keydown', onKey, true);
    document.body.classList.remove('sp-open');
    const f = S.lastFocus;
    S = null;
    if (f && f.isConnected) { try { f.focus({ preventScroll: true }); } catch (e) { /* */ } }
}

function opts() {
    return { how: P.how, n: P.how === 'pages' ? P.nPages : P.nProblems, sets: P.sets, size: P.size, cols: P.cols, key: P.key, arrange: P.arrange, seed: S.seed, title: S.ctx.title || true, paper: 'A4' };
}

function mount() {
    const root = document.createElement('div');
    root.id = 'spRoot';
    root.className = 'sp-root';
    root.innerHTML = `<div class="sp-scrim" data-sp="close"></div><div class="sp-dialog" role="dialog" aria-modal="true" aria-labelledby="spTitle"></div>`;
    document.body.appendChild(root);
    document.body.classList.add('sp-open');
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey, true);
    S.root = root;
}

function stepHead(n, title, sub = '') {
    return `<div class="sp-step-head"><span class="sp-num" aria-hidden="true">${n}</span><h3 class="sp-h">${title}</h3>${sub ? `<span class="sp-sub">${sub}</span>` : ''}</div>`;
}

function render() {
    if (!S) return;
    const dlg = S.root.querySelector('.sp-dialog');
    const ae = document.activeElement && S.root.contains(document.activeElement) ? document.activeElement : null;
    const focusId = ae ? ae.id : '';
    const focusSel = ae && !focusId && ae.dataset && ae.dataset.sp ? `[data-sp="${ae.dataset.sp}"]${ae.dataset.v !== undefined ? `[data-v="${ae.dataset.v}"]` : ''}` : '';
    const many = S.list.length > 1;
    const o = opts();
    const arr = arrangementOf(S.list, o);
    const b = S.built;
    const autoCols = S.probes[P.size] ? S.probes[P.size] : (b && b.cols) || '';
    let h = `<header class="sp-top"><h2 id="spTitle" class="sp-title">Print</h2><button type="button" class="sp-x" data-sp="close" aria-label="Close">×</button></header><div class="sp-body">`;

    // 1 Skills
    h += `<section class="sp-step">${stepHead(1, many ? 'Skills' : 'Skill', many ? 'Leave blank to share evenly, or type a number or a %' : '')}<ul class="sp-skills">`;
    S.list.forEach((s, i) => {
        const a = parseAmount(s.amt);
        h += `<li class="sp-skill"><span class="sp-skill-name">${esc(s.label)}</span>`;
        if (many) h += `<input id="spAmt${i}" class="sp-amt${a && a.bad ? ' is-bad' : ''}" data-amt="${i}" type="text" inputmode="numeric" autocomplete="off" value="${esc(s.amt)}" placeholder="even" aria-label="${esc(s.label)}: number of problems or %" aria-invalid="${a && a.bad ? 'true' : 'false'}">`;
        if (b && b.counts && many) h += `<span class="sp-got" aria-label="prints">${b.counts[i] || 0}</span>`;
        h += `</li>`;
    });
    h += `</ul></section>`;

    // 2 How many
    const nVal = P.how === 'pages' ? P.nPages : P.nProblems;
    h += `<section class="sp-step">${stepHead(2, 'How many')}<div class="sp-row">
        <div class="sp-seg" role="radiogroup" aria-label="Count by">${[['problems', 'Problems'], ['pages', 'Pages']].map(([v, l]) => `<button type="button" role="radio" class="sp-segb" data-sp="how" data-v="${v}" aria-checked="${P.how === v}">${l}</button>`).join('')}</div>
        <div class="sp-stepper"><button type="button" class="sp-sb" data-sp="dec" aria-label="Fewer">−</button><input id="spN" class="sp-n" type="number" inputmode="numeric" min="1" max="${P.how === 'pages' ? MAX_PAGES : MAX_PROBLEMS}" value="${nVal}" aria-label="${P.how === 'pages' ? 'Pages' : 'Problems'}"><button type="button" class="sp-sb" data-sp="inc" aria-label="More">+</button></div>
    </div>
    <div class="sp-row sp-sets"><span class="sp-lbl" id="spSetsLbl">Sets</span><div class="sp-stepper"><button type="button" class="sp-sb" data-sp="sdec" aria-label="Fewer sets">−</button><input id="spSets" class="sp-n" type="number" inputmode="numeric" min="1" max="${MAX_SETS}" value="${P.sets}" aria-labelledby="spSetsLbl"><button type="button" class="sp-sb" data-sp="sinc" aria-label="More sets">+</button></div><span class="sp-hint">${P.sets > 1 ? 'each set has different problems' : ''}</span></div></section>`;

    // 3 Size
    h += `<section class="sp-step">${stepHead(3, 'Size')}<div class="sp-sizes" role="radiogroup" aria-label="Size">`;
    for (const [v, l] of SIZES) {
        const c = S.probes[v];
        h += `<button type="button" role="radio" class="sp-size sp-size-${v}" data-sp="size" data-v="${v}" aria-checked="${P.size === v}"><span class="sp-size-glyph" aria-hidden="true">7</span><span class="sp-size-name">${l}</span><span class="sp-size-cols">${c ? `${c} columns` : '…'}</span></button>`;
    }
    h += `</div><label class="sp-cols"><span>Columns</span><select id="spCols" data-sp-cols>
        <option value="auto"${P.cols === 'auto' ? ' selected' : ''}>Auto${autoCols ? ` (${autoCols})` : ''}</option>
        ${[2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => `<option value="${c}"${Number(P.cols) === c ? ' selected' : ''}>${c}</option>`).join('')}
    </select></label></section>`;

    // 4 Answer key
    h += `<section class="sp-step">${stepHead(4, 'Answer key')}<div class="sp-seg" role="radiogroup" aria-label="Answer key">${[[true, 'On'], [false, 'Off']].map(([v, l]) => `<button type="button" role="radio" class="sp-segb" data-sp="key" data-v="${v}" aria-checked="${P.key === v}">${l}</button>`).join('')}</div></section>`;

    // summary + page 1
    const line = S.error ? 'These pages could not be built.' : b && !S.busy ? summaryLine(b, o) : 'Working out the pages…';
    h += `<section class="sp-sum" aria-live="polite"><p class="sp-line" id="spLine">${esc(line)}</p>`;
    if (b && b.notes && b.notes.length && !S.busy) h += `<p class="sp-note">${esc(b.notes.join(' '))}</p>`;
    if (arr === 'facts') h += `<p class="sp-note">Fast facts in fact rows: every page is full.</p>`;
    h += `<div class="sp-thumb"><iframe id="spFrame" title="Page 1 preview" tabindex="-1" aria-hidden="true"></iframe></div></section>`;

    // More options
    h += `<details class="sp-more"${S.moreOpen ? ' open' : ''}><summary data-sp="more">More options</summary><div class="sp-more-body">`;
    if (many) h += `<div class="sp-row"><span class="sp-lbl">Arrange</span><div class="sp-seg" role="radiogroup" aria-label="Arrange">${[['sections', 'In sections'], ['mixed', 'Mixed up']].map(([v, l]) => `<button type="button" role="radio" class="sp-segb" data-sp="arrange" data-v="${v}" aria-checked="${P.arrange === v}">${l}</button>`).join('')}</div></div>`;
    h += `<button type="button" class="sp-link" data-sp="newnums">New numbers</button>`;
    if (typeof S.ctx.more === 'function') h += `<button type="button" class="sp-link" data-sp="full">All print options (page types, examples, key style, sets)…</button>`;
    h += `</div></details>`;

    h += `</div><footer class="sp-foot"><button type="button" class="sp-btn sp-btn-2" data-sp="preview" aria-label="Preview every page"><span class="sp-wide">Preview every page</span><span class="sp-narrow">Preview</span></button><button type="button" class="sp-btn sp-btn-1" data-sp="print"${S.busy && !b ? ' aria-disabled="true"' : ''}>Print</button></footer>`;
    dlg.innerHTML = h;
    showThumb();
    if (focusId) { const el = document.getElementById(focusId); if (el) { try { el.focus({ preventScroll: true }); if (el.setSelectionRange && el.type === 'text') el.setSelectionRange(el.value.length, el.value.length); } catch (e) { /* */ } } }
    else if (focusSel && dlg.querySelector(focusSel)) { try { dlg.querySelector(focusSel).focus({ preventScroll: true }); } catch (e) { /* */ } }
    else if (!S.focused || !ae) { S.focused = true; const p = dlg.querySelector('[data-sp="print"]'); if (p && !S.root.contains(document.activeElement)) try { p.focus({ preventScroll: true }); } catch (e) { /* */ } }
}

function showThumb() {
    const frame = S && S.root.querySelector('#spFrame');
    const b = S && S.built;
    if (!frame || !b || !b.firstHtml) return;
    const extra = '<style>html,body{background:#fff!important;margin:0!important;padding:0!important;overflow:hidden!important}.ws-page{margin:0!important;outline:0!important;box-shadow:none!important}</style>';
    frame.onload = () => { try { frame.contentDocument.querySelectorAll('.ws-page').forEach((p, i) => { if (i > 0) p.remove(); }); } catch (e) { /* */ } };
    frame.srcdoc = sheetDocument(b.firstHtml, 'Preview', { paper: 'A4' }).replace('</head>', extra + '</head>');
}

function updateLine() {
    // the inputs keep focus while the pages are worked out: only the summary, counts and page 1 change
    if (!S) return;
    const o = opts();
    const b = S.built;
    const line = S.root.querySelector('#spLine');
    if (line) line.textContent = S.error ? 'These pages could not be built.' : b && !S.busy ? summaryLine(b, o) : 'Working out the pages…';
}

function schedule(delay = 300) {
    if (!S) return;
    clearTimeout(S.timer);
    S.busy = true;
    updateLine();
    S.timer = setTimeout(run, delay);
}

async function run() {
    if (!S) return;
    const my = ++S.token;
    const o = opts();
    let b = null;
    try { b = await buildSets(S.list, o); } catch (e) { console.warn('[simple-print] build failed', e); b = null; }
    if (!S || my !== S.token) return;
    S.busy = false;
    S.error = !b;
    S.built = b;
    if (b && P.cols === 'auto' && b.cols) S.probes[P.size] = colsLabel(b);
    render();
    probeSizes(my);
}
const colsLabel = (b) => { const cl = [...new Set(b.colsList && b.colsList.length ? b.colsList : [b.cols])].filter(Boolean); return cl.length > 1 ? `${Math.min(...cl)}–${Math.max(...cl)}` : String(cl[0] || b.cols); };

/** Each size button shows its own Auto columns: the other sizes are built quietly after the page is shown. */
async function probeSizes(my) {
    for (const [v] of SIZES) {
        if (!S || my !== S.token) return;
        if (S.probes[v]) continue;
        await new Promise((r) => setTimeout(r, 30));
        if (!S || my !== S.token) return;
        let b = null;
        try { b = await buildSimple(S.list, Object.assign(opts(), { size: v, cols: 'auto', key: false, probe: true })); } catch (e) { b = null; }
        if (!S || my !== S.token || !b) return;
        S.probes[v] = colsLabel(b);
        const el = S.root.querySelector(`.sp-size-${v} .sp-size-cols`);
        if (el) el.textContent = `${S.probes[v]} columns`;
        if (v === P.size) { const opt = S.root.querySelector('#spCols option[value="auto"]'); if (opt) opt.textContent = `Auto (${S.probes[v]})`; }
    }
}

function changed(rebuildProbes = false) {
    savePrefs();
    if (rebuildProbes) S.probes = {};
    S.built = S.built ? Object.assign({}, S.built) : null;
    render();
    schedule(rebuildProbes ? 0 : 250);
}

function onClick(e) {
    if (!S) return;
    const t = e.target.closest('[data-sp]');
    if (!t || !S.root.contains(t)) return;
    const act = t.dataset.sp, v = t.dataset.v;
    if (act === 'close') { closeSimplePrint(); return; }
    if (act === 'how') { if (P.how !== v) { P.how = v; changed(true); } return; }
    if (act === 'dec' || act === 'inc') {
        const d = act === 'inc' ? 1 : -1;
        if (P.how === 'pages') P.nPages = Math.max(1, Math.min(MAX_PAGES, P.nPages + d));
        else P.nProblems = Math.max(1, Math.min(MAX_PROBLEMS, P.nProblems + d * (P.nProblems >= 20 ? 4 : 1)));
        const n = S.root.querySelector('#spN'); if (n) n.value = P.how === 'pages' ? P.nPages : P.nProblems;
        savePrefs(); schedule(); return;
    }
    if (act === 'sdec' || act === 'sinc') {
        P.sets = Math.max(1, Math.min(MAX_SETS, P.sets + (act === 'sinc' ? 1 : -1)));
        const n = S.root.querySelector('#spSets'); if (n) n.value = P.sets;
        const h = S.root.querySelector('.sp-sets .sp-hint'); if (h) h.textContent = P.sets > 1 ? 'each set has different problems' : '';
        savePrefs(); schedule(); return;
    }
    if (act === 'size') { if (P.size !== v) { P.size = v; changed(false); } return; }
    if (act === 'key') { P.key = v === 'true'; changed(false); return; }
    if (act === 'arrange') { if (P.arrange !== v) { P.arrange = v; changed(true); } return; }
    if (act === 'more') { S.moreOpen = !t.parentElement.open; return; }
    if (act === 'newnums') { S.seed = 100000 + Math.floor(Math.random() * 900000); schedule(0); return; }
    if (act === 'full') { const more = S.ctx.more; closeSimplePrint(); more(); return; }
    if (act === 'print') { doPrint(); return; }
    if (act === 'preview') { doPreview(e); return; }
}
function onInput(e) {
    if (!S) return;
    const t = e.target;
    if (t.dataset.amt !== undefined) {
        const i = Number(t.dataset.amt);
        S.list[i].amt = t.value;
        const a = parseAmount(t.value);
        t.classList.toggle('is-bad', !!(a && a.bad));
        t.setAttribute('aria-invalid', a && a.bad ? 'true' : 'false');
        schedule(450);
        return;
    }
    if (t.id === 'spSets') {
        const x = Math.round(Number(t.value));
        if (!(x >= 1)) return;
        P.sets = Math.min(MAX_SETS, x);
        savePrefs(); schedule(450); return;
    }
    if (t.id === 'spN') {
        const x = Math.round(Number(t.value));
        if (!(x >= 1)) return;
        if (P.how === 'pages') P.nPages = Math.min(MAX_PAGES, x); else P.nProblems = Math.min(MAX_PROBLEMS, x);
        savePrefs(); schedule(450);
    }
}
function onChange(e) {
    if (!S) return;
    if (e.target.id === 'spCols') { const v = e.target.value; P.cols = v === 'auto' ? 'auto' : Number(v); changed(false); }
}
function onKey(e) {
    if (!S) return;
    if (e.key === 'Escape') {
        if (document.getElementById('tvPdfPreview') && !document.getElementById('tvPdfPreview').hidden) return;
        e.preventDefault(); e.stopPropagation(); closeSimplePrint(); return;
    }
    if (e.key === 'Tab') {
        const f = [...S.root.querySelectorAll('button, input, select, summary')].filter((x) => !x.disabled && x.offsetParent !== null);
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
}

/** The finished build for the current settings (waits for a running one). */
async function ready() {
    if (!S) return null;
    if (S.busy || !S.built) {
        clearTimeout(S.timer);
        const my = ++S.token;
        const b = await buildSets(S.list, opts());
        if (!S || my !== S.token) return b;
        S.busy = false; S.built = b; S.error = !b;
        render();
    }
    return S && S.built;
}
const titleOf = () => (S.ctx.title && typeof S.ctx.title === 'string' ? S.ctx.title : S.list.length === 1 ? S.list[0].label : 'Worksheet');

async function doPrint() {
    const b = await ready();
    if (!b || !S) return;
    await printHtml(b.doc, titleOf(), 'A4');
}
function doPreview(e) {
    const title = titleOf();
    openPdfPreview({
        title, paper: 'A4', t0: e && e.timeStamp,
        first: S.built && !S.busy ? S.built.firstHtml : '',
        load: async () => { const b = await ready(); return b ? { doc: b.doc } : null; },
        print: async () => { const b = await ready(); if (b) await printHtml(b.doc, title, 'A4'); },
    });
}

/** For checks: the open dialog's state. */
export function simplePrintState() {
    return S ? { list: S.list.map((s) => ({ key: keyOf(s), amt: s.amt })), prefs: Object.assign({}, P), built: S.built ? { pages: S.built.pages, total: S.built.total, cols: S.built.cols, rows: S.built.rows, perPage: S.built.perPage, arrangement: S.built.arrangement, counts: S.built.counts, sets: S.built.sets, line: summaryLine(S.built, opts()) } : null, busy: !!S.busy, probes: Object.assign({}, S.probes) } : null;
}
