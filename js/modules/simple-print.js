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

import { buildSheet as buildSheetRaw, sheetDocument } from './print-sheet.js';
import * as printSheetNS from './print-sheet.js';
// every request this dialog sends, last few kept for the gate (ws-simple-print reads lastSimpleRequests)
const REQS = [];
const buildSheet = (req) => { REQS.push(req); if (REQS.length > 40) REQS.shift(); return buildSheetRaw(req); };
export const lastSimpleRequests = () => REQS.slice();
import { printHtml } from './teacher-print.js';
import { openPdfPreview } from './teacher-pdf-preview.js';
import { generateQuestionFor } from './generate-question.js';
import { isFact as isFactItem } from './sheet/roles/fact-rows.js';
import { SKILLS } from './data.js';
import { mergedSkillFor } from './skill-aliases.js';
import { optionsFor, offeredOptionsFor, describeOptions } from './skill-options.js';

const STORE_KEY = 'mq_simple_print';
const SIZES = [['L', 'Big'], ['M', 'Medium'], ['S', 'Small']];
const SIZE_NAME = Object.fromEntries(SIZES);
// (facts-print-fix r3, owner rule 2026-11-05: "Columns: Auto = 9; 10 only if the owner picks it")
const FACT_AUTO = { S: 9, M: 6, L: 5 };
// Owner 2026-11-03 (item 4): "7, 8, 9, 10 should be just for small problems": a fast fact may go up to 10 across, every
// larger cell at most 6 (and the engine clamps either to what really fits at the size).
const FACT_MAX_COLS = 10, CELL_MAX_COLS = 6;
// owner ruling 2026-11-05: "If division is included don't make 10 columns an option, just 9" (PT-FRW-9)
const DIV_MAX_COLS = 9;
// Mixed up layouts (owner 2026-11-03): sent as req.mixLayout; absent = 'rows'
const MIX_LAYOUTS = { rows: ['Rows by type', 'each row one kind, full-size boxes'], grid: ['One grid', 'one grid, bigger problems stand two rows tall'], even: ['Even grid', 'one even grid, bigger problems get less room'] };
/**
 * The layouts the print engine can really draw (ui3 check D1). The engine announces them as `MIX_LAYOUTS` exported from
 * print-sheet.js (an array of ids, or an object keyed by id; the mixed-m2 lane adds it and reports fits.mixLayout).
 * Absent today: the Layout choice stays hidden (the request field and the saved value are still carried).
 */
export function engineMixLayouts() {
    const e = printSheetNS.MIX_LAYOUTS;
    const ids = Array.isArray(e) ? e : e && typeof e === 'object' ? Object.keys(e) : [];
    return ids.filter((v) => MIX_LAYOUTS[v]);
}
const FELL_BACK_NOTE = 'Mixed up isn’t possible for these skills yet — printing in sections.';
const MAX_PROBLEMS = 400, MAX_PAGES = 30, MAX_SETS = 30;

/* ================================================================= state */

function loadPrefs() {
    const d = { how: 'pages', n: 1, nProblems: 24, nPages: 1, sets: 1, size: 'M', cols: 'auto', colsMode: 'aim', key: true, arrange: 'sections', mixLayout: 'rows' };
    try {
        const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
        if (s && typeof s === 'object') {
            if (s.how === 'problems' || s.how === 'pages') d.how = s.how;
            if (Number(s.nProblems) > 0) d.nProblems = Math.min(MAX_PROBLEMS, Math.round(Number(s.nProblems)));
            if (Number(s.nPages) > 0) d.nPages = Math.min(MAX_PAGES, Math.round(Number(s.nPages)));
            if (Number(s.sets) >= 1) d.sets = Math.min(MAX_SETS, Math.round(Number(s.sets)));
            if (SIZE_NAME[s.size]) d.size = s.size;
            if (s.cols === 'auto' || (Number(s.cols) >= 1 && Number(s.cols) <= 10)) d.cols = s.cols === 'auto' ? 'auto' : Number(s.cols);
            if (s.colsMode === 'aim' || s.colsMode === 'exact') d.colsMode = s.colsMode;
            if (typeof s.key === 'boolean') d.key = s.key;
            if (s.arrange === 'mixed' || s.arrange === 'sections') d.arrange = s.arrange;
            if (MIX_LAYOUTS[s.mixLayout]) d.mixLayout = s.mixLayout;
        }
    } catch (e) { /* defaults */ }
    return d;
}
function savePrefs() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ how: P.how, nProblems: P.nProblems, nPages: P.nPages, sets: P.sets, size: P.size, cols: P.cols, colsMode: P.colsMode, key: P.key, arrange: P.arrange, mixLayout: P.mixLayout })); } catch (e) { /* not saved */ }
}

const P = loadPrefs();
let S = null;   // the open dialog: { list, ctx, root, built, token, probes, lastFocus }

export const keyOf = (s) => `${s.categoryId}:${s.skillId}`;
/**
 * A skill's name in words, never its id (coordinator, 2026-11-05: a footer printed a raw id beside "Missing Numbers
 * (+/−)"): its own category's entry, else its live id through the alias table (a retired id), else the same id in any
 * category (a skill queued under another category), else the id spelt as words ("add_two_digit" -> "Add two digit").
 */
function labelOf(s) {
    const find = (cat, id) => (SKILLS[cat] || []).find((x) => x && x.v === id);
    let hit = find(s.categoryId, s.skillId);
    if (!hit) { try { const m = mergedSkillFor(s.categoryId, s.skillId); hit = find(m.categoryId, m.skillId); } catch (e) { hit = null; } }
    if (!hit) for (const cat of Object.keys(SKILLS)) { hit = find(cat, s.skillId); if (hit) break; }
    const words = (id) => { const t = String(id || '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim(); return t.charAt(0).toUpperCase() + t.slice(1); };
    return String(hit && hit.l ? hit.l : words(s.skillId)).replace(/\s*\((?:Visual|MAP|black and white)\)/g, '');
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

/**
 * The skill's name with its chosen number options (critic r1 #4: the footer said "Multiplication Facts (1-12)" on a
 * tables 6–8 page and "Add within 100" under "I Can add within 50"): "within N" follows Highest number, a band that
 * is not an answer bound is said in its own words, and ticked fact sets / tables replace "(1-12)" / "(within 20)".
 */
export function footerName(s) {
    let name = String(s.label || labelOf(s));
    const { band, sets } = numberOptionsOf(s);
    if (band) {
        const v = Number(optVal(s, band.def));
        if (v !== Number(band.def.default)) {
            if (band.answer && /within [\d,]+/i.test(name)) name = name.replace(/within [\d,]+/i, `within ${v.toLocaleString('en-US')}`);
            else name = `${name.replace(/\s*\([^)]*\)/g, '')}, ${band.def.label.toLowerCase()} ${band.labelOf(v)}`;
        }
    }
    if (sets) {
        const all = sets.values.map((x) => x.v);
        const cur = setsOf(s, sets);
        if (cur.length !== all.length) name = `${name.replace(/\s*\([^)]*\)/g, '')}: ${s.categoryId === 'multiplication' || s.categoryId === 'division' ? 'tables' : 'fact sets'} ${setWords(cur, all)}`;
    }
    return name;
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
/**
 * What a fact skill can REACH (facts-print-fix r3 D2 / D4): the most digit tracks of its numbers and the digits of its
 * answers over one seeded probe of 60 items (x 1-12: 3 tracks, 3-digit answers; + − within 20: 2; ÷ 1-12: 3 for 144).
 * A fact-rows page takes its columns and digit size from this, never from the facts one page happens to deal.
 */
const reachCache = new Map();
export function reachOf(s) {
    const k = keyOf(s) + JSON.stringify(s.opts || {});
    if (reachCache.has(k)) return reachCache.get(k);
    const dg = (v) => String(v === undefined || v === null ? '' : v).replace(/[^0-9]/g, '').length;
    let tracks = 2, ans = 1;
    for (let i = 0; i < 60; i++) {
        let q = null;
        try { q = generateQuestionFor({ category: s.categoryId, skill: s.skillId, opts: s.opts, seed: 7001 + i * 131 }); } catch (e) { q = null; }
        if (!q) continue;
        const p = (q.cell && q.cell.payload) || {};
        const nums = p.a !== undefined && p.b !== undefined ? [p.a, p.b] : (String(q.text || '').match(/\d+/g) || []).slice(0, 2);
        const an = p.ans !== undefined ? p.ans : q.ans;
        tracks = Math.max(tracks, ...nums.map(dg), dg(an));
        ans = Math.max(ans, dg(an));
    }
    const r = { tracks: Math.min(7, tracks), ans };
    reachCache.set(k, r);
    return r;
}

function baseReq(o) {
    return {
        size: o.size, look: 'auto', paper: o.paper || 'A4', seed: o.seed >>> 0,
        header: Object.assign({ name: true, date: true, score: false, title: o.title || true }, o.footer ? { footerLeft: o.footer } : {}),
        key: o.key ? { on: true, placement: 'end', style: 'copy' } : { on: false },
        ...(o.arrange === 'mixed' ? { mixLayout: MIX_LAYOUTS[o.mixLayout] ? o.mixLayout : 'rows' } : {}),
    };
}
const skillRef = (s) => ({ categoryId: s.categoryId, skillId: s.skillId, opts: s.opts || {} });
const colsAsked = (o) => (o.cols && o.cols !== 'auto' ? Number(o.cols) : undefined);
/** The columns a part may be ASKED for: a fast fact up to 10, any larger cell up to 6 (never 7+ across). */
export const capFor = (s) => (isFactSkill(s) ? (isDivisionFact(s) ? DIV_MAX_COLS : FACT_MAX_COLS) : CELL_MAX_COLS);
/** Aim / Exactly: the columns this part asks for (the engine may still clamp it to what fits at the size). */
const askFor = (s, o) => { const n = colsAsked(o); return n ? Math.min(n, capFor(s)) : undefined; };
const modeOf = (o) => (colsAsked(o) ? (o.colsMode === 'exact' ? 'exact' : 'aim') : 'auto');

/**
 * Which arrangement this print takes: 'facts' (fact rows), 'mixed' (Mixed up) or 'sections'.
 * Fact rows take a facts-only set in both modes: Pages fills whole pages, Problems prints the exact count (buildFacts).
 */
export function arrangementOf(list, o) {
    // facts-print-fix (owner 2026-11-05): a fast-facts-only set in Pages mode is ALWAYS fact rows, whichever Arrange is
    // chosen: In sections deals each skill's facts together, Mixed up interleaves the operations in the same grid
    // (buildFacts, o.arrange === 'mixed'), at the same count a page. It never falls back to the sparse Mixed practice plan.
    // D2 (critic 2026-11-05): Problems mode too - the asked count in fact rows, never the sparse each-skill-its-own-grid plan
    if (list.length && list.every(isFactSkill)) return 'facts';
    if (o.arrange === 'mixed' && list.length >= 2) return 'mixed';
    return 'sections';
}

/** A sections request: one section per skill with its count (and the asked columns, or each section's clamp). */
function sectionsReq(list, counts, o, colsBy) {
    return Object.assign(baseReq(o), {
        role: 'independent',
        sections: list.map((s, i) => {
            const sec = { skills: [skillRef(s)], count: counts[i] };
            const c = colsBy ? colsBy[i] : askFor(s, o);
            if (c) { sec.columns = c; sec.columnsMode = modeOf(o); }
            return sec;
        }).filter((x) => x.count > 0),
    });
}

/** Build a sections request; an asked column count the engine clamped is asked again at the clamp (never 1 row a page). */
async function buildSections(list, counts, o) {
    // Auto: a fast-fact part asks for the fact columns (10 / 6 / 5) and takes the most that fit (critic r1 D4: Auto
    // printed 5 across where 6 fit); every other part keeps the engine's own Auto
    let colsBy = list.map((s) => askFor(s, o) || (isFactSkill(s) ? FACT_AUTO[o.size] : undefined));
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
    // critic r1 #1: Aim for n may take ONE column fewer on a part when that ends the part on a full row (25 problems:
    // 5 × 5, not 6 + 6 + 6 + 6 + 1), as long as the pages do not grow. Exactly n never does: every part that can take n
    // prints n.
    if (colsAsked(o) && o.colsMode !== 'exact') {
        const gap = (k, c) => Math.ceil(k / c) * c - k;
        const alt = colsBy.slice();
        let better = false;
        live.forEach((i) => {
            const c = alt[i], k = counts[i];
            if (!c || c < 3 || !k || gap(k, c) === 0) return;
            if (gap(k, c - 1) < gap(k, c)) { alt[i] = c - 1; better = true; }
        });
        if (better) {
            const r2 = await buildSheet(sectionsReq(list, counts, o, alt));
            if ((r2.pageCount || 1) <= (res.pageCount || 1)) { res = r2; colsBy = alt; }
        }
    }
    res.__clamped = clamped;
    // each part's asked count and its own max: "(max)" where Exactly n is more than the part can take
    res.__capped = list.map((s, i) => (colsAsked(o) && colsBy[i] && colsBy[i] < colsAsked(o) ? colsBy[i] : 0));
    return res;
}

/**
 * Build the whole print for the chosen settings. Returns
 *   { pupilHtml, keyHtml, doc, pages, keyPages, total, counts, arrangement, cols, rows, perPage, notes, firstHtml }
 */
/** The teacher footer in words (lead, 2026-11-03: never the raw ids "add_facts, sub_facts +4"): the skills' names. */
export function footerOf(list, max = 3) {
    const names = [...new Set(list.map(footerName))];
    return names.length > max ? `${names.slice(0, max).join(', ')} and ${names.length - max} more` : names.join(', ');
}

export async function buildSimple(list, o) {
    // (a footer the caller did not give names the skills; a fact print names each page's own skills, D4)
    if (!o.footer) o = Object.assign({}, o, { footer: footerOf(list), __footerAuto: true });
    const amounts = list.map((s) => parseAmount(s.amt));
    const arrangement = arrangementOf(list, o);
    const notes = [];
    if (o.probe) return probeCols(list, arrangement, o);
    if (arrangement === 'facts') return buildFacts(list, amounts, o);
    if (arrangement === 'mixed') {
        const r = await buildMixed(list, amounts, o);
        // the engine fell back to sections: the print is then EXACTLY the In sections print (facts-print-fix, owner
        // 2026-11-05: Mixed up fell back to the engine's own sparse plan, "16 on page 1 · 2 pages · 20 problems", where
        // In sections printed 70 a page) - same counts, same pages, same grids - and the summary says it fell back
        if (r.fellBack) {
            const r2 = await buildSimple(list, Object.assign({}, o, { arrange: 'sections' }));
            return Object.assign(r2, { fellBack: true, notes: [FELL_BACK_NOTE, ...(r2.notes || []).filter((t) => !/prints in sections/i.test(t))] });
        }
        return r;
    }

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
    if (res.__clamped || (res.__capped || []).some(Boolean)) notes.push(o.colsMode === 'exact'
        ? `Exactly ${o.cols}: problems that cannot take ${o.cols} across at ${SIZE_NAME[o.size]} print at their own max (marked "max").`
        : `Aim for ${o.cols}: some parts print fewer across at ${SIZE_NAME[o.size]}: the most that fit, or one fewer so a part ends on a full row.`);
    return finish(res, { counts, arrangement, notes, list, capped: res.__capped, o });
}

/** The Auto columns at a size (the size buttons' "n columns"): one small build, no filling. */
async function probeCols(list, arrangement, o) {
    if (arrangement === 'facts') {
        const g = list.filter((s) => !isDivisionFact(s));
        // (the reach of the skills, as the print takes it: r3 D2 - the size button says what prints)
        const gl = g.length ? g : list;
        const rc = gl.reduce((r, s) => { const x = reachOf(s); return { tracks: Math.max(r.tracks, x.tracks), ans: Math.max(r.ans, isDivisionFact(s) ? 0 : x.ans) }; }, { tracks: 2, ans: 0 });
        const res = await buildSheet(Object.assign(baseReq(o), { role: 'fact-rows', look: 'auto', sections: [{ skills: gl.map(skillRef), pages: 1, tracks: rc.tracks, ansTracks: rc.ans }] }));
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

/** Whole numbers that add up to `total`, in proportion to `w` (largest remainder, the first on a tie). */
function apportion(w, total) {
    const t = w.reduce((x, y) => x + y, 0);
    if (!t || total <= 0) return w.map(() => 0);
    const exact = w.map((x) => (x / t) * total);
    const out = exact.map(Math.floor);
    let left = total - out.reduce((x, y) => x + y, 0);
    exact.map((x, i) => [x - Math.floor(x), i]).sort((p, q) => q[0] - p[0] || p[1] - q[1]).forEach(([, i]) => { if (left > 0) { out[i]++; left--; } });
    return out;
}

/** The cells of a built page set that hold a problem (never the blank cells of a short last row). */
const cellsIn = (h) => (String(h).split('class="ws-cell ').length - 1) - (String(h).split('blankrun').length - 1);

/**
 * "k/n" on page k of n (facts-print-fix D4, critic 2026-11-05: a fact print is built page by page, so every footer said
 * "1/1"): the footers of the joined pages, numbered in order.
 */
export function renumberFooters(html) {
    const re = /(<footer class="ws-foot"(?![^>]*ws-blank-foot)[^>]*><span>[\s\S]*?<\/span><b>)[^<]*(<\/b>)/g;
    const n = (String(html).match(re) || []).length;
    let k = 0;
    return String(html).replace(re, (m, x, y) => `${x}${++k}/${n}${y}`);
}

/**
 * Each skill name in a footer on ONE line (facts-print-fix r4 FOOTWRAP, critic 2026-11-05: a shared page's footer broke
 * "Division Facts (1-" / "12)"): the names of the left part, each in a no-wrap span (the text is unchanged), so a long
 * list wraps only between names.
 */
export function nowrapFooterNames(html) {
    return String(html).replace(/(<footer class="ws-foot"(?![^>]*ws-blank-foot)[^>]*><span>)([^<]*)(<\/span>)/g,
        (m, a, t, z) => `${a}${t.split(', ').map((x) => `<span style="white-space:nowrap">${x}</span>`).join(', ')}${z}`);
}

/** facts-print-fix r4 (owner 2026-11-05): a page but the last holds at most this much white under its rows (mm). */
export const FACT_FULL_MM = 6;
/** PG-11's stretch cap for fact rows (owner 2026-11-05: "cells never stretch beyond 1.3x"). */
export const FACT_STRETCH = 1.3;

/**
 * The page plan of fact rows (facts-print-fix r4, owner 2026-11-05: "every page except the LAST must be full; only the
 * last page may run short; cells never stretch beyond 1.3x"): the groups' rows in order (+ − × first, then each ÷
 * section), packed over the FEWEST pages; each group takes ONE row stretch for the whole print (PG-11: one row height a
 * section on every page), 1.00 to 1.30, chosen so that every page but the last is full to within FACT_FULL_MM. Pure.
 *   lay[g] = {cols, hMin}; R[g] = rows of group g; G = the grid's height (mm); GAP = a section's instruction and gap (mm);
 *   order = the groups in page order (default 0, 1, 2 ...)
 *   returns {pages: [{rows: [...], order: [g ...], h}], stretch: [...], filled}
 */
export function planFactRows(lay, R, G, GAP, order = null) {
    const k = lay.length;
    const seq = [];
    (order || R.map((_, g) => g)).forEach((g) => { for (let i = 0; i < R[g]; i++) seq.push(g); });
    const pack = (st) => {
        const pages = [];
        let cur = null;
        for (const g of seq) {
            const add = lay[g].hMin * st[g] + (cur && !cur.rows[g] && cur.rows.some(Boolean) ? GAP : 0);
            if (!cur || cur.h + add > G + 1e-6) { cur = { rows: lay.map(() => 0), order: [], h: lay[g].hMin * st[g] }; pages.push(cur); } else cur.h += add;
            if (!cur.rows[g]) cur.order.push(g);
            cur.rows[g]++;
        }
        return pages;
    };
    const ones = lay.map(() => 1);
    const P = pack(ones).length;
    if (P <= 1) {
        // one page: the rows stretched to the grid (1.3 at most; a short count keeps its white at the foot)
        const pg = pack(ones)[0] || { rows: lay.map(() => 0), order: [], h: 0 };
        const gaps = (pg.rows.filter(Boolean).length - 1) * GAP;
        const one = pg.h > gaps ? Math.max(1, Math.min(FACT_STRETCH, (G - gaps) / (pg.h - gaps))) : 1;
        const st = lay.map(() => Math.floor(one * 100) / 100);
        return { pages: pack(st), stretch: st, filled: true };
    }
    // the stretches tried: every group its own from 1.00 to 1.30; past two groups the ÷ sections share one
    const vs = [];
    for (let x = 100; x <= FACT_STRETCH * 100 + 1e-9; x++) vs.push(x / 100);
    const combos = k === 1 ? vs.map((x) => [x]) : k === 2 ? vs.flatMap((x) => vs.map((y) => [x, y])) : vs.flatMap((x) => vs.map((y) => [x, ...lay.slice(1).map(() => y)]));
    // (r5: when no stretch fills every page but the last at the fewest pages, one page more is tried - the owner's rule is
    // full pages, only the last short - and the fewest-pages plan is kept only when that fails too)
    let best = null;
    for (const target of [P, P + 1]) {
    if (best && best.ok) break;
    let bestT = null;
    for (const st of combos) {
        const pages = pack(st);
        if (pages.length !== target) continue;
        const whites = pages.slice(0, -1).map((pg) => G - pg.h);
        const worst = Math.max(...whites);
        const sum = whites.reduce((t, x) => t + x, 0);
        const tall = Math.max(...st);
        const ok = worst <= FACT_FULL_MM;
        const better = !bestT || (ok && !bestT.ok) || (ok === bestT.ok && (ok ? sum < bestT.sum - 0.05 || (Math.abs(sum - bestT.sum) <= 0.05 && tall < bestT.tall) : worst < bestT.worst - 0.05));
        if (better) bestT = { st, pages, ok, worst, sum, tall };
    }
    if (bestT && (!best || (bestT.ok && !best.ok))) best = bestT;
    }
    return { pages: best.pages, stretch: best.st, filled: best.ok };
}

/**
 * Fact rows for a facts-only set, in Pages mode AND Problems mode.
 *   Groups:   + − × together, then ÷. In sections with div_facts "How it is written" = Mix, each written form is its own
 *             ÷ section with its own instruction (owner 2026-11-05); Mixed up keeps the forms mixed cell by cell.
 *   Pages:    each group fills its share of the pages, every page a full grid; fewer pages than groups (Pages 1 with ÷):
 *             the groups share the page(s) as sections, rows by their shares, the page filled (critic D-R4-8).
 *   Problems: the asked count, planned over the fewest pages (planFactRows): every page but the last full, no row past
 *             1.3 x its minimum, one row height a section over the whole print.
 * One digit size on a page: groups that share a page take the smallest of their digit sizes (critic D-R4-4). Every page
 * names its own skills in its footer, numbered k/n. The per-skill counts are the facts PRINTED (the role's own record).
 */
async function buildFacts(list, amounts, o) {
    const mixed = o.arrange === 'mixed' && list.length >= 2;
    const problems = o.how === 'problems';
    const asked = problems ? splitCounts(amounts, o.n).counts : null;
    const shares = sharesOf(amounts);
    const live = (i) => !problems || asked[i] > 0;
    // the groups: parts {s (the skill, its options), i (its place in the list), w (its share of the skill)}
    const DIV_SPLIT = ['standard', 'long', 'fraction'];
    const groups = [];
    const mainParts = list.map((s, i) => ({ s, i, w: 1 })).filter((p) => !isDivisionFact(p.s) && live(p.i));
    if (mainParts.length) groups.push({ parts: mainParts, div: false });
    const divParts = list.map((s, i) => ({ s, i, w: 1 })).filter((p) => isDivisionFact(p.s) && live(p.i));
    const splitDiv = !mixed && list.length >= 2 && divParts.length === 1 && divParts[0].s.skillId === 'div_facts' && (divParts[0].s.opts || {}).divForm === 'mix';
    if (splitDiv) {
        for (const f of DIV_SPLIT) groups.push({ parts: [{ s: Object.assign({}, divParts[0].s, { opts: Object.assign({}, divParts[0].s.opts, { divForm: f }) }), i: divParts[0].i, w: 1 / 3 }], div: true, form: f });
    } else if (divParts.length) groups.push({ parts: divParts, div: true });
    // the asked count of each part (Problems): a split ÷ skill's count shared over its forms in thirds
    const splitN = splitDiv && problems ? apportion([1, 1, 1], asked[divParts[0].i]) : null;
    // r3 D2 / D4: what each group's skills can REACH, from one probe of the skills - never the facts dealt on a page
    const reach = groups.map((grp) => grp.parts.reduce((r, p) => { const x = reachOf(p.s); return { tracks: Math.max(r.tracks, x.tracks), ans: Math.max(r.ans, isDivisionFact(p.s) ? 0 : x.ans) }; }, { tracks: 2, ans: 0 }));
    let cap = 0;
    let n = 0;
    const secOf = (g, per) => {
        const grp = groups[g];
        const w = per || grp.parts.map((p) => shares[p.i] * p.w);
        const count = per ? per.reduce((t, x) => t + x, 0) : 0;
        return { skills: grp.parts.map((p, j) => Object.assign(skillRef(p.s), { weight: w[j] })).filter((x) => x.weight > 0), pages: 1, ...(count ? { count } : {}),
            tracks: reach[g].tracks, ansTracks: reach[g].ans, ...(cap ? { maxPt: cap } : {}), sizeCap: true,
            ...(colsAsked(o) ? { columns: Math.min(colsAsked(o), grp.div ? DIV_MAX_COLS : FACT_MAX_COLS), columnsMode: modeOf(o) } : {}) };
    };
    // one page: `parts` = [{g, per}] (per = how many of each of the group's parts; null: the full page by the shares)
    const page = (parts, stretch = null) => {
        const named = [...new Set(parts.flatMap((x) => groups[x.g].parts.filter((_, j) => !x.per || x.per[j] > 0).map((p) => list[p.i])))];
        const req = Object.assign(baseReq(Object.assign({}, o, { seed: o.seed + 7919 * (n++), ...(o.__footerAuto ? { footer: footerOf(named, 4) } : {}) })), {
            role: 'fact-rows', look: 'auto',
            // Mixed up: the + − × operations interleaved in their one grid (owner ruling 2026-10-31, M1 run rules)
            ...(mixed && parts.some((x) => groups[x.g].parts.length > 1) ? { arrangement: 'mixed' } : {}),
            ...(parts.length > 1 ? { factSections: true } : {}),
            sections: parts.map((x) => Object.assign(secOf(x.g, x.per), stretch ? { stretch: stretch[x.g] } : {})),
        });
        return buildSheet(req);
    };
    // each group's own full page: columns, row height, digit size (a probe page each; the page counter is not advanced)
    let lay = [];
    const probeAll = async () => {
        lay = [];
        for (let g = 0; g < groups.length; g++) {
            const t0 = n;
            const probe = await page([{ g, per: null }]);
            n = t0;
            const f = ((probe.fits && probe.fits.sections) || [])[0] || probe.fits || {};
            lay.push({ cols: Math.max(1, f.cols || 1), hMin: f.hMin || f.cellH || 30, G: f.gridH || ((f.cellH || 30) * (f.rows || 1)), instr: f.instrMm || 8, rows: f.rows || 1, pt: f.digitPt || 0 });
        }
    };
    await probeAll();
    // (the grid's height less its heavy frame, top and bottom: 2 x 1.5 pt - it stands for the page's 1 mm safety - and
    // 0.15 mm back: a row's minimum is rounded UP to 0.1 mm, sheet/roles/fact-rows.js planSections SLACK)
    const FRAME2 = 1.06;
    const gridG = () => Math.min(...lay.map((l) => l.G)) - FRAME2 + 0.15;
    // (a section's instruction line, straight under the grid above it - sheet/roles/fact-rows.js SECTION_GAP_MM - and its frame)
    const gapOf = () => Math.max(...lay.map((l) => l.instr)) + FRAME2;
    // pages: [{rows: [...]}]; stretch: one per group
    let pages = null;
    let stretch = null;
    let filled = true;
    const planNotes = [];
    const pagesN = Math.max(1, Math.min(MAX_PAGES, o.n));
    const shareOf = (g) => groups[g].parts.reduce((t, p) => t + shares[p.i] * p.w, 0);
    // Pages mode with + − × and ÷ (facts-print-fix r5, owner 2026-11-05, critic D-R5-1): the pages are planned as Problems
    // mode is, for the most problems that fill exactly the pages asked - each skill at its share (within a row), every page
    // full - never "a page for each group" (Pages 2 gave ÷ a whole page: 19 / 19 / 18 / 63).
    const pagesFill = !problems && groups.length > 1;
    // facts-print-fix r5 (owner 2026-11-05: "only the last page may run short"; critic D-R5-2 / D-R5-4: a section's short row
    // mid-print left 1 fact and 4 empty cells on page 1): every group but the LAST prints whole rows - its count rounded to
    // its columns, the difference given to the last group - so the print's only short row is its last. Each skill keeps its
    // share within the group. `shift` moves whole rows from the + − × group to the last (or back) when that is what fills
    // every page; the teacher's order is never changed (the r4 "÷ first" reorder is gone).
    const rebalance = (want0, shift) => {
        const nAll = want0.flat().reduce((t, x) => t + x, 0);
        const last = groups.length - 1;
        const tot = want0.map((w) => w.reduce((t, x) => t + x, 0));
        const out = tot.map((t, g) => (g === last || !t ? t : Math.max(lay[g].cols, Math.round(t / lay[g].cols) * lay[g].cols)));
        if (last > 0 && shift) out[0] = Math.max(lay[0].cols, out[0] + shift * lay[0].cols);
        if (last > 0) {
            out[last] = nAll - out.slice(0, last).reduce((t, x) => t + x, 0);
            // (the last group keeps at least one fact: rows come back from the largest group before it)
            while (out[last] < 1) { const g = out.slice(0, last).indexOf(Math.max(...out.slice(0, last))); if (out[g] <= lay[g].cols) break; out[g] -= lay[g].cols; out[last] += lay[g].cols; }
        }
        // (the facts added or taken go one at a time to the skill with the fewest / most, so a page stays balanced)
        const respread = (w, total) => {
            const b = w.slice();
            let d = total - b.reduce((t, x) => t + x, 0);
            while (d > 0) { const i = b.indexOf(Math.min(...b)); b[i]++; d--; }
            while (d < 0) { const i = b.indexOf(Math.max(...b)); if (b[i] <= 0) break; b[i]--; d++; }
            return b;
        };
        return want0.map((w, g) => respread(w, out[g]));
    };
    const planOf = (want0, shift = 0) => {
        const w = rebalance(want0, shift);
        const tot = w.map((x) => x.reduce((t, y) => t + y, 0));
        const R = tot.map((t, g) => Math.ceil(t / lay[g].cols));
        const r = planFactRows(lay, R, gridG(), gapOf());
        const lastPg = r.pages[r.pages.length - 1];
        // (ORPHAN, r5 D-R5-3: does the last page hold a full row? more than one row, or its one row complete)
        const lastRows = lastPg ? lastPg.rows.reduce((t, x) => t + x, 0) : 0;
        const lastG = lastPg ? lastPg.rows.map((x, g) => (x ? g : -1)).filter((g) => g >= 0).pop() : -1;
        const lastFull = lastRows > 1 || (lastG >= 0 && tot[lastG] % lay[lastG].cols === 0);
        return { w, pages: r.pages, stretch: r.stretch, filled: r.filled, lastWhite: lastPg ? gridG() - lastPg.h : 0, lastFull };
    };
    // every page but the last full first, then the fewest pages, then a last page that holds a full row; the smallest row
    // shift wins a tie
    const choose = (want0) => {
        let best = null;
        const perSkill = (w) => { const m = new Map(); w.forEach((x, g) => x.forEach((v, j) => { const i = groups[g].parts[j].i; m.set(i, (m.get(i) || 0) + v); })); return m; };
        const ask = perSkill(want0);
        const rowOf = (i) => Math.max(...groups.filter((g) => g.parts.some((p) => p.i === i)).map((g) => lay[groups.indexOf(g)].cols));
        for (const sh of groups.length > 1 ? [0, 1, -1, 2, -2] : [0]) {
            const p = planOf(want0, sh);
            // (a row shift never moves a skill more than one row from what was asked)
            const got = perSkill(p.w);
            if (sh && [...ask.entries()].some(([i, x]) => Math.abs((got.get(i) || 0) - x) > rowOf(i))) continue;
            const better = !best || (p.filled && !best.filled) || (p.filled === best.filled && (p.pages.length < best.pages.length || (p.pages.length === best.pages.length && p.lastFull && !best.lastFull)));
            if (better) best = p;
        }
        return best;
    };
    // each skill's count of a print of N at the shares, shared over its groups' parts (a split ÷ skill in thirds)
    const wantFor = (N) => {
        const c = apportion(shares.map((x) => x || 0), N);
        return groups.map((grp) => grp.parts.map((p) => {
            if (!grp.form) return c[p.i];
            const k = groups.filter((x) => x.form && x.parts[0].i === p.i);
            return apportion(k.map(() => 1), c[p.i])[k.indexOf(grp)];
        }));
    };
    // is every skill within one row of its share? (r5 SHARES)
    const sharesOk = (w) => {
        const per = new Map();
        w.forEach((x, g) => x.forEach((v, j) => { const i = groups[g].parts[j].i; per.set(i, (per.get(i) || 0) + v); }));
        const sum = [...per.values()].reduce((t, x) => t + x, 0);
        const sh = [...per.keys()].reduce((t, i) => t + shares[i], 0) || 1;
        return [...per.entries()].every(([i, x]) => Math.abs(x - (sum * shares[i]) / sh) <= Math.max(...groups.filter((g) => g.parts.some((p) => p.i === i)).map((g) => lay[groups.indexOf(g)].cols)) + 1e-9);
    };
    let want = null;
    const settle = async () => {
        if (problems) {
            want = groups.map((grp) => grp.parts.map((p) => (grp.form ? splitN[DIV_SPLIT.indexOf(grp.form)] : asked[p.i])));
            let best = choose(want);
            // one digit size on a page (D-R4-4): groups that share a page at different sizes take the smallest, planned again;
            // pages that cannot all be filled are planned again at the one size too (a smaller ÷ row fills the shared page)
            const mixedPt = (pp) => pp.some((pg) => new Set(pg.rows.map((x, g) => (x ? lay[g].pt : 0)).filter(Boolean)).size > 1);
            if ((mixedPt(best.pages) || !best.filled) && new Set(lay.map((l) => l.pt)).size > 1) { cap = Math.min(...lay.map((l) => l.pt).filter(Boolean)); await probeAll(); best = choose(want); }
            return best;
        }
        // Pages mode: one digit size (the groups may share a page), then the most problems that fill the pages asked
        cap = Math.min(...lay.map((l) => l.pt).filter(Boolean));
        await probeAll();
        const perPage = Math.max(...lay.map((l) => l.cols * l.rows));
        let best = null;
        for (let N = pagesN * perPage + perPage; N >= groups.length; N--) {
            const w0 = wantFor(N);
            if (w0.some((x) => x.reduce((t, y) => t + y, 0) < 1)) break;
            const p = choose(w0);
            if (p.pages.length !== pagesN || !p.filled) continue;
            p.N = N;
            p.ok = sharesOk(p.w);
            // the first (largest) N with a full last page wins; otherwise the fullest last page
            if (!best || p.lastWhite < best.lastWhite - 0.5) best = p;
            if (p.lastWhite <= FACT_FULL_MM) break;
        }
        return best;
    };
    if (problems || pagesFill) {
        let best = await settle();
        if (pagesFill && best && splitDiv && !best.ok) {
            // the page cannot give each ÷ form a row of its own and keep the shares (critic D-R5-1, owner 2026-11-05): the ÷
            // forms share ONE section, mixed cell by cell (one frame a cell), and the note says so
            const d = divParts[0];
            const k0 = groups.findIndex((x) => x.form);
            groups.splice(k0, groups.length - k0, { parts: [{ s: d.s, i: d.i, w: 1 }], div: true });
            reach.splice(k0, reach.length - k0, (() => { const x = reachOf(d.s); return { tracks: Math.max(2, x.tracks), ans: 0 }; })());
            cap = 0;
            await probeAll();
            best = await settle();
            planNotes.push(`${SIZE_NAME[o.size]}, Pages ${pagesN}: the ÷ forms share one section, mixed, so every skill keeps its share of the page.`);
        }
        if (best) {
            want = best.w; pages = best.pages; stretch = best.stretch; filled = best.filled;
            if (pagesFill && !best.ok) planNotes.push(`${SIZE_NAME[o.size]}, Pages ${pagesN}: each part needs whole rows, so the skills' shares are only roughly even.`);
        }
    }
    // the pages, built: [{parts, r}]
    const built = [];
    if (pages) {
        // each page's facts of each group (whole rows; a group's last page the rest), each part's share from what is left
        const left = want.map((w) => w.slice());
        const tot = want.map((w) => w.reduce((t, x) => t + x, 0));
        const placed = groups.map(() => 0);
        const lastOf = groups.map((_, g) => { let k = -1; pages.forEach((pg, i) => { if (pg.rows[g]) k = i; }); return k; });
        for (let i = 0; i < pages.length; i++) {
            if (pages[i].own) { const parts = [{ g: 0, per: null }]; built.push({ parts, r: await page(parts) }); continue; }
            const parts = [];
            (pages[i].order || pages[i].rows.map((_, g) => g)).forEach((g) => {
                const r = pages[i].rows[g];
                if (!r) return;
                const k = i === lastOf[g] ? tot[g] - placed[g] : Math.min(tot[g] - placed[g], r * lay[g].cols);
                const per = i === lastOf[g] ? left[g].slice() : apportion(left[g], k);
                per.forEach((x, j) => { left[g][j] -= x; });
                placed[g] += k;
                parts.push({ g, per });
            });
            built.push({ parts, r: await page(parts, stretch) });
        }
    } else {
        // Pages mode, a page (or more) for each group: pages per group by the groups' shares
        const gShare = groups.map((_, g) => shareOf(g));
        const gPages = gShare.map((f) => Math.max(1, Math.round(f * pagesN)));
        while (gPages.reduce((t, x) => t + x, 0) > pagesN && gPages.some((x) => x > 1)) { const i = gPages.indexOf(Math.max(...gPages)); gPages[i]--; }
        while (gPages.reduce((t, x) => t + x, 0) < pagesN) { const i = gShare.indexOf(Math.max(...gShare)); gPages[i]++; }
        for (let g = 0; g < groups.length; g++) for (let p = 0; p < gPages[g]; p++) { const parts = [{ g, per: null }]; built.push({ parts, r: await page(parts) }); }
    }
    const factPlan = { lay, G: gridG(), GAP: gapOf(), P: built.length, stretch, filled, cap,
        rows: pages ? pages.map((pg) => pg.rows) : built.map((b) => groups.map((_, g) => (b.parts.some((x) => x.g === g) ? 1 : 0))) };
    const out = { pupil: [], key: [], pages: 0, keyPages: 0, items: 0, fits: null, notes: [], first: '', counts: list.map(() => 0), grids: [], perPage: [], factPages: [] };
    const seen = new Set();
    for (const { parts, r: res } of built) {
        out.pupil.push(res.pupilHtml || '');
        out.key.push(res.keyHtml || '');
        out.pages += res.pageCount || 1;
        out.keyPages += res.keyPageCount || 0;
        const c1 = cellsIn(res.pupilHtml || '');
        out.perPage.push(c1);
        // each group's own grid (its first page): a ÷ part may take other columns than the + − × part
        const fsec = (res.fits && res.fits.sections) || [];
        out.factPages.push(parts.map((pp, j) => { const fj = fsec[j] || (j === 0 ? res.fits : null) || {}; return { hMin: fj.hMin || 0, cellH: fj.cellH || 0 }; }));
        parts.forEach((pp, j) => {
            const fj = fsec[j] || (j === 0 ? res.fits : null);
            if (seen.has(pp.g) || !fj || !fj.cols) return;
            seen.add(pp.g);
            out.grids.push({ div: groups[pp.g].div, cols: fj.cols, rows: problems ? fj.rows : Math.ceil(c1 / fj.cols), perPage: problems ? fj.perPage : c1, pt: fj.digitPt });
        });
        if (!out.fits && res.fits) out.fits = res.fits;
        out.lastCols = Math.max(0, ...((res.fits && res.fits.sections) || [res.fits || {}]).map((x) => x.cols || 0));
        // the per-skill counts are what the page PRINTS (D1), from the role's own record of the kept facts
        const printed = res.printedSkills || (res.items || []).filter(Boolean).map((it) => it.skill);
        for (const k of printed) { const i = list.findIndex((s) => keyOf(s) === k); if (i >= 0) out.counts[i]++; }
        out.items += c1;
        for (const t of res.notes || []) if (!out.notes.includes(t) && !/^Fits:/.test(t)) out.notes.push(t);
    }
    // (D-R4-8: Pages n with ÷ on fewer pages than groups prints n pages; the note says the ÷ shares the page)
    out.notes.push(...planNotes);
    // ORPHAN (r5, D-R5-3): a last page that holds less than a row says so
    if (out.perPage.length > 1 && out.perPage[out.perPage.length - 1] < out.lastCols) out.notes.push(`The last page holds only ${out.perPage[out.perPage.length - 1]} problem${out.perPage[out.perPage.length - 1] === 1 ? '' : 's'}: the pages before it are full.`);
    if (!problems && pages && pages.some((pg) => pg.rows.filter(Boolean).length > 1)) out.notes.push(`${pagesN === 1 ? 'Pages 1' : `Pages ${pagesN}`}: the division ${groups.filter((x) => x.div).length > 1 ? 'sections share' : 'section shares'} a page with the other facts.`);
    const f = out.fits || {};
    const pupilHtml = nowrapFooterNames(renumberFooters(out.pupil.join('\n')));
    const keyHtml = o.key ? nowrapFooterNames(renumberFooters(out.key.join('\n'))) : '';
    // page 1 as printed (its footer numbered): the thumbnail
    const r0 = built[0] && built[0].r;
    const first0 = (r0 && r0.pupilPages && r0.pupilPages[0]) || (r0 && r0.pupilHtml) || '';
    const first = nowrapFooterNames(renumberFooters(first0).replace(/<b>1\/1<\/b>/, `<b>1/${out.pages}</b>`));
    const p1 = out.perPage[0] || f.perPage || 0;
    return {
        pupilHtml, keyHtml, doc: pupilHtml + (keyHtml ? '\n' + keyHtml : ''),
        pages: out.pages, keyPages: o.key ? out.keyPages : 0, total: out.items, counts: out.counts, arrangement: 'facts', mixedFacts: mixed, how: o.how,
        // what page 1 really holds (critic r2: a 6 x 6 grid that printed 30 said "36 a page")
        cols: f.cols || 0, rows: f.cols ? Math.ceil(p1 / f.cols) : f.rows || 0, perPage: p1, pageCounts: out.perPage,
        colsList: [f.cols || 0], notes: out.notes, divMax9: colsAsked(o) > DIV_MAX_COLS && list.some(isDivisionFact), firstHtml: first, grids: out.grids,
        capped: colsAsked(o) && f.cols && f.cols < colsAsked(o) ? f.cols : 0, colsMode: modeOf(o),
        // the page plan (each group's layout, the rows a page, the one stretch) and each page's grids' row heights, for the gate
        factPlan, factPages: out.factPages,
        // (Pages mode with the groups sharing a page: the line names each part's columns, as in Problems mode)
        factShared: !problems && !!pages,
    };
}

async function buildMixed(list, amounts, o) {
    const cap = list.every(isFactSkill) ? (list.some(isDivisionFact) ? DIV_MAX_COLS : FACT_MAX_COLS) : CELL_MAX_COLS;
    const mk = (counts) => Object.assign(baseReq(o), {
        role: 'mixed-practice', arrangement: 'mixed',
        ...(colsAsked(o) ? { columns: Math.min(colsAsked(o), cap), columnsMode: modeOf(o) } : {}),
        sections: [{ skills: list.map((s, i) => Object.assign(skillRef(s), counts ? { weight: Math.max(1, counts[i]) } : {})), count: counts.reduce((t, c) => t + c, 0),
            ...(colsAsked(o) ? { columns: Math.min(colsAsked(o), cap), columnsMode: modeOf(o) } : {}) }],
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
    return finish(res, { counts, arrangement: 'mixed', notes: [], list, o });
}

/** The problems the built page 1 really holds (never the grid's nominal capacity: the engine may cap a page). */
const page1Cells = (res) => (((res.pupilPages && res.pupilPages[0]) || '').split('class="ws-cell ').length - 1) || (res.fits && res.fits.perPage) || 0;

function finish(res, { counts, arrangement, notes, list, capped = [], o = {} }) {
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
        types: arrangement === 'sections' ? typesOf(list, counts, fs, capped) : [],
        capped: (capped || []).find(Boolean) || (colsAsked(o) && first.cols && first.cols < colsAsked(o) ? first.cols : 0), colsMode: modeOf(o),
        cols: first.cols || 0, rows: fs.length === 1 && first.cols ? Math.ceil(page1Cells(res) / first.cols) : first.rows || 0, perPage: page1Cells(res), colsList,
        // Mixed up asked, the engine printed sections: ONE plain reason, not the engine's own wording (ui3 check D1)
        notes: arrangement === 'mixed' && (res.arrangement !== 'mixed' || engineNotes.some((t) => /prints in sections/i.test(t)))
            ? [...notes, FELL_BACK_NOTE, ...engineNotes.filter((t) => !/prints in sections/i.test(t))] : [...notes, ...engineNotes],
        firstHtml: (res.pupilPages && res.pupilPages[0]) || res.pupilHtml || '',
    };
}

/**
 * The count across Auto chose for each problem type (owner 2026-11-03: "choosing big medium small … is intelligent
 * fitting"): fast facts are one type ("Facts"), every other skill is its own type by its short name.
 */
function typesOf(list, counts, fs, capped = []) {
    const live = list.map((_, i) => i).filter((i) => (counts || [])[i] > 0);
    const out = [];
    live.forEach((i, j) => {
        const c = fs[j] && fs[j].cols;
        if (!c) return;
        // critic r1 #5: only the fast-fact ids are "Facts"; a column addition is named by its own skill
        const name = /_facts$/.test(list[i].skillId) ? 'Facts' : String(list[i].label || labelOf(list[i])).replace(/\s*\([^)]*\)/g, '').trim();
        const t = out.find((x) => x.name === name);
        const atMax = !!(capped && capped[i]);
        if (t) { t.min = Math.min(t.min, c); t.max = Math.max(t.max, c); t.atMax = t.atMax || atMax; } else out.push({ name, min: c, max: c, atMax });
    });
    return out;
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
        const b = k === 0 ? first : await buildSimple(list.map((s, i) => Object.assign({}, s, { amt: String(first.counts[i] || 0) })), Object.assign({}, o, { seed: (o.seed + k * 104729) >>> 0, how: o.how === 'pages' && first.arrangement === 'facts' && !first.factShared ? 'pages' : 'problems', n: o.how === 'pages' && first.arrangement === 'facts' && !first.factShared ? o.n : first.total }));
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
    // Exactly n (owner item 4): a part that cannot take n across prints at its own max, and the line says so
    const mx = b.colsMode === 'exact' ? ' (max)' : '';
    const one = b.capped && mx ? mx : '';
    // fact rows in Problems mode (D2): the asked count, so the line says the columns and what each page holds
    if (b.arrangement === 'facts' && (b.how === 'problems' || b.factShared)) {
        const gs = b.grids && b.grids.length ? b.grids : [{ cols: b.cols }];
        const pc = b.pageCounts || [b.perPage];
        // (r3 D7: "20 a page" when every page holds the same, never "20–20")
        const held = pc.length > 1 ? (Math.min(...pc) === Math.max(...pc) ? `${pc[0]} a page` : `${Math.min(...pc)}–${Math.max(...pc)} a page`) : `${pc[0]} on the page`;
        // (r3 D1: the ÷ facts are their own section, on the + − × pages when their rows fit: "division 9 columns")
        grid = `${b.mixedFacts ? 'Mixed up, ' : ''}${gs[0].cols} columns${one}${[...new Set(gs.slice(1).filter((x) => x.cols !== gs[0].cols).map((x) => ` · ${x.div ? 'division' : 'next part'} ${x.cols} columns`))].join('')} · ${held}`;
    } else if (b.rows && b.cols && b.cols * b.rows === b.perPage && (b.arrangement === 'facts' || (cl.length === 1 && (b.colsList || []).length <= 1 && !b.fellBack))) grid = `${b.mixedFacts ? 'Mixed up, ' : ''}${b.cols} columns${one} × ${b.rows} rows = ${b.perPage || b.cols * b.rows} a page`;
    // a ÷ page on its own grid (facts-print-fix: 9 across at S so 3-digit numbers have room): the line names both
    const g2 = b.arrangement === 'facts' && b.how !== 'problems' && !b.factShared && (b.grids || []).length > 1 && b.grids.some((x) => x.cols !== b.grids[0].cols || x.perPage !== b.grids[0].perPage) ? b.grids.slice(1).filter((x) => x.cols !== b.grids[0].cols || x.perPage !== b.grids[0].perPage) : [];
    if (grid) { if (g2.length) grid += g2.map((x) => ` · ${x.div ? 'division' : 'next'} pages ${x.cols} columns × ${x.rows} rows = ${x.perPage}`).join(''); } else if (b.types && b.types.length > 1) grid = `${b.types.map((t) => `${t.name} ${t.min === t.max ? t.min : `${t.min}–${t.max}`} across${t.atMax ? mx : ''}`).join(' · ')} · ${b.perPage} on page 1`;
    else if (b.fellBack) grid = `In sections, ${cl.length > 1 ? `${Math.min(...cl)}–${Math.max(...cl)}` : cl[0]} columns${one} · ${b.perPage} on page 1`;
    else if (cl.length === 1) grid = `${b.arrangement === 'mixed' ? 'Mixed up, ' : ''}${cl[0]} columns${one} · ${b.perPage} on page 1`;
    else if (b.arrangement === 'mixed') grid = `Mixed up, ${Math.min(...cl)}–${Math.max(...cl)} columns · ${b.perPage} on page 1`;
    else grid = `Each skill its own grid, ${Math.min(...cl)}–${Math.max(...cl)} columns · ${b.perPage} on page 1`;
    // an asked 10 prints 9 on the division parts (owner 2026-11-05)
    if (b.divMax9 && grid) grid = / · division(?: pages)? \d+ columns/.test(grid) ? grid.replace(/( · division(?: pages)? \d+ columns)/, '$1 (max 9 with division)') : `${grid} (max 9 with division)`;
    // a Mixed up that fell back says so on every kind of line (facts-print-fix FALLBACK)
    if (b.fellBack && !/^In sections/.test(grid)) grid = `In sections, ${grid}`;
    return [grid, pages, probs, ...(sets > 1 ? [`${sets} sets, each with different problems`] : []), key].join(' · ');
}

/* ================================================================= number options (owner item 6) */
// "Highest number" is each operation skill's own `band` option (skill-options.js; "within N" bounds the ANSWER: the sum,
// the number you start from, the product, the number shared) and "Fact sets" its `constant` set (the *_facts ids).
// Only the values the skill itself declares are offered, so print, practice, quiz and share codes all carry them.
const OPS_CATS = new Set(['addition', 'subtraction', 'multiplication', 'division']);
export function numberOptionsOf(s) {
    if (!s || !OPS_CATS.has(s.categoryId)) return { band: null, sets: null };
    let defs = [];
    try { defs = optionsFor(s.categoryId, s.skillId) || []; } catch (e) { defs = []; }
    const band = defs.find((d) => d.id === 'band' && d.type === 'enum' && !d.hidden);
    // fact sets / tables on the fast-fact ids (*_facts); other skills' sets (tables with blanks …) stay in All print options
    const sets = /_facts$/.test(s.skillId) ? defs.find((d) => d.id === 'constant' && d.type === 'set' && !d.hidden) : null;
    const bandVals = band ? band.values.map((x) => x.v).filter((v) => typeof v === 'number') : [];
    if (bandVals.length < 2) return { band: null, sets: sets || null };
    // critic r1 #2: a band whose values are not answer bounds ("Tables to 10 × 10 / 12 × 12") keeps its own label and
    // value words; only a band of plain numbers is "Highest number" (the largest sum / start / product / number shared)
    const lbl = (v) => { const x = band.values.find((y) => y.v === v); return x ? x.l : String(v); };
    const answer = bandVals.every((v) => lbl(v) === v.toLocaleString('en-US') || lbl(v) === String(v));
    return { band: { def: band, values: bandVals, answer, title: answer ? 'Highest number' : band.label, labelOf: answer ? (v) => v.toLocaleString('en-US') : lbl }, sets: sets || null };
}
const optVal = (s, d) => (s.opts && s.opts[d.id] !== undefined && s.opts[d.id] !== null ? s.opts[d.id] : d.default);
const setsOf = (s, d) => { const v = optVal(s, d); return Array.isArray(v) && v.length ? v.map(Number) : d.values.map((x) => x.v); };
/** "0–12", "6–8", "2, 5, 10": a fact-set list in words. */
function setWords(v, all) {
    if (v.length === all.length) return 'all';
    const a = [...v].sort((x, y) => x - y);
    const runs = [];
    for (const x of a) { const r = runs[runs.length - 1]; if (r && x === r[1] + 1) r[1] = x; else runs.push([x, x]); }
    return runs.map(([x, y]) => (x === y ? String(x) : y === x + 1 ? `${x}, ${y}` : `${x}–${y}`)).join(', ');
}
/** The shared Highest number: the largest value of each skill's own at or below v (never above: "within N"). */
function bandAtMost(values, v) { const ok = values.filter((x) => x <= v); return ok.length ? Math.max(...ok) : Math.min(...values); }

/* ================================================================= quick prints (owner item 5) */
// A quick print is a whole saved print setup: the skills with their options and amounts, and how many / sets / size /
// columns + mode / key / arrange. Kept in localStorage like My sets (teacher-ui.js mq_teacher_sets) and carried by a
// share code "QP1.<base64url JSON>" or a link ?qp=<code> (init.js imports it into the teacher's Quick prints).
const QP_KEY = 'mq_quick_prints';
const F = (c, k) => ({ categoryId: c, skillId: k });
const FF_PRINT = { how: 'pages', n: 1, sets: 1, size: 'M', cols: 'auto', colsMode: 'aim', key: true, arrange: 'sections' };
export const FAST_FACTS = [
    { id: 'ff_add', name: '+ facts', skills: [F('addition', 'add_facts')] },
    { id: 'ff_sub', name: '− facts', skills: [F('subtraction', 'sub_facts')] },
    { id: 'ff_mul', name: '× facts', skills: [F('multiplication', 'mult_facts')] },
    { id: 'ff_div', name: '÷ facts', skills: [F('division', 'div_facts')] },
    { id: 'ff_mix', name: 'Mixed facts', skills: [F('addition', 'add_facts'), F('subtraction', 'sub_facts'), F('multiplication', 'mult_facts'), F('division', 'div_facts')] },
].map((r) => Object.assign({ builtIn: true, print: FF_PRINT }, r));

function cleanPrint(p) {
    const o = Object.assign({}, FF_PRINT);
    if (!p || typeof p !== 'object') return o;
    if (p.how === 'problems' || p.how === 'pages') o.how = p.how;
    if (Number(p.n) >= 1) o.n = Math.min(o.how === 'pages' ? MAX_PAGES : MAX_PROBLEMS, Math.round(Number(p.n)));
    if (Number(p.sets) >= 1) o.sets = Math.min(MAX_SETS, Math.round(Number(p.sets)));
    if (SIZE_NAME[p.size]) o.size = p.size;
    if (p.cols === 'auto' || (Number(p.cols) >= 1 && Number(p.cols) <= 10)) o.cols = p.cols === 'auto' ? 'auto' : Number(p.cols);
    if (p.colsMode === 'exact' || p.colsMode === 'aim') o.colsMode = p.colsMode;
    if (typeof p.key === 'boolean') o.key = p.key;
    if (p.arrange === 'mixed' || p.arrange === 'sections') o.arrange = p.arrange;
    if (MIX_LAYOUTS[p.mixLayout]) o.mixLayout = p.mixLayout;
    return o;
}
function cleanSkills(list) {
    return (Array.isArray(list) ? list : []).filter((x) => x && typeof x.categoryId === 'string' && typeof x.skillId === 'string')
        .map((x) => Object.assign({ categoryId: x.categoryId, skillId: x.skillId }, x.opts && typeof x.opts === 'object' && Object.keys(x.opts).length ? { opts: x.opts } : {}, x.amt ? { amt: String(x.amt).slice(0, 8) } : {}));
}
export function quickPrints() {
    try { const l = JSON.parse(localStorage.getItem(QP_KEY) || '[]'); return Array.isArray(l) ? l.filter((r) => r && r.id && Array.isArray(r.skills) && r.skills.length) : []; } catch (e) { return []; }
}
function writeQuick(list) { try { localStorage.setItem(QP_KEY, JSON.stringify(list.slice(0, 40))); return true; } catch (e) { return false; } }
export function saveQuickPrint(name, skills, print) {
    const rec = { id: 'qp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: String(name || 'Quick print').slice(0, 60), skills: cleanSkills(skills), print: cleanPrint(print), createdAt: Date.now() };
    if (!rec.skills.length) return null;
    writeQuick([rec, ...quickPrints()]);
    return rec;
}
export function renameQuickPrint(id, name) { const nm = String(name || '').trim().slice(0, 60); if (!nm) return false; writeQuick(quickPrints().map((r) => (r.id === id ? Object.assign({}, r, { name: nm }) : r))); return true; }
export function deleteQuickPrint(id) { writeQuick(quickPrints().filter((r) => r.id !== id)); }
export function encodeQuickPrint(rec) {
    const o = { v: 1, n: rec.name || '', s: cleanSkills(rec.skills).map((x) => Object.assign({ c: x.categoryId, k: x.skillId }, x.opts ? { o: x.opts } : {}, x.amt ? { a: x.amt } : {})), p: cleanPrint(rec.print) };
    const bytes = new TextEncoder().encode(JSON.stringify(o));
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return 'QP1.' + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeQuickPrint(code) {
    try {
        const t = String(code || '').trim().replace(/^.*[?&]qp=/, '').replace(/&.*$/, '');
        if (!/^QP1\./.test(t)) return null;
        const b = t.slice(4).replace(/-/g, '+').replace(/_/g, '/');
        const bin = atob(b + '==='.slice((b.length + 3) % 4));
        const o = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
        if (!o || o.v !== 1 || !Array.isArray(o.s)) return null;
        const skills = cleanSkills(o.s.map((x) => x && { categoryId: x.c, skillId: x.k, opts: x.o, amt: x.a }));
        return skills.length ? { name: String(o.n || 'Shared quick print').slice(0, 60), skills, print: cleanPrint(o.p) } : null;
    } catch (e) { return null; }
}
/** A shared code or link: kept in Quick prints (the same setup twice is kept once). Returns the record or null. */
export function importQuickPrint(code) {
    const rec = decodeQuickPrint(code);
    if (!rec) return null;
    const same = quickPrints().find((r) => JSON.stringify([r.skills, r.print]) === JSON.stringify([rec.skills, rec.print]));
    return same || saveQuickPrint(rec.name, rec.skills, rec.print);
}
export const quickLink = (rec) => `${location.origin}${location.pathname}?qp=${encodeQuickPrint(rec)}`;
const findQuick = (id) => FAST_FACTS.find((r) => r.id === id) || quickPrints().find((r) => r.id === id);
/** Open the simple print filled in from a quick print (from the Skills page, or a card inside the dialog). */
export function openQuickPrint(id, ctx = {}) {
    const rec = typeof id === 'object' ? id : findQuick(id);
    if (!rec) return;
    const pr = cleanPrint(rec.print);
    Object.assign(P, { how: pr.how, sets: pr.sets, size: pr.size, cols: pr.cols, colsMode: pr.colsMode, key: pr.key, arrange: pr.arrange, mixLayout: pr.mixLayout || 'rows' });
    if (pr.how === 'pages') P.nPages = pr.n; else P.nProblems = pr.n;
    savePrefs();
    const keep = S && S.ctx ? S.ctx : {};
    openSimplePrint(rec.skills.map((x) => ({ categoryId: x.categoryId, skillId: x.skillId, opts: x.opts })), Object.assign({ from: 'quick' }, keep, ctx, { quick: rec.id }));
    if (S) { rec.skills.forEach((x, i) => { if (S.list[i]) S.list[i].amt = x.amt || ''; }); render(); schedule(0); }
}
const isTeacher = () => typeof document !== 'undefined' && document.body && document.body.classList.contains('teacher-mode');
let qpMenu = null, qpRename = null;
/** The Quick prints row: the teacher's saved setups, then the built-in Fast facts group. */
export function quickRowHTML(inDialog) {
    const mine = quickPrints();
    const card = (r) => {
        const words = `${r.skills.length} skill${r.skills.length === 1 ? '' : 's'} · ${cleanPrint(r.print).n} ${cleanPrint(r.print).how === 'pages' ? 'page' : 'problem'}${cleanPrint(r.print).n === 1 ? '' : 's'} · ${SIZE_NAME[cleanPrint(r.print).size]}`;
        const name = qpRename === r.id
            ? `<input class="sp-qp-in" data-qp-rename="${esc(r.id)}" type="text" value="${esc(r.name)}" aria-label="New name" maxlength="60">`
            : `<span class="sp-qp-name">${esc(r.name)}</span>`;
        let h = `<div class="sp-qp${r.builtIn ? ' sp-qp-ff' : ''}" data-qp-id="${esc(r.id)}"><button type="button" class="sp-qp-open" data-sp="qpopen" data-v="${esc(r.id)}" aria-label="Quick print: ${esc(r.name)}">${qpRename === r.id ? '' : name}<span class="sp-qp-sub">${esc(words)}</span></button>`;
        if (qpRename === r.id) h = `<div class="sp-qp" data-qp-id="${esc(r.id)}"><span class="sp-qp-open">${name}</span>`;
        if (!r.builtIn) {
            h += `<button type="button" class="sp-qp-more" data-sp="qpmenu" data-v="${esc(r.id)}" aria-haspopup="true" aria-expanded="${qpMenu === r.id}" aria-label="More for ${esc(r.name)}">⋯</button>`;
            if (qpMenu === r.id) h += `<span class="sp-qp-menu" role="menu"><button type="button" role="menuitem" data-sp="qprename" data-v="${esc(r.id)}">Rename</button><button type="button" role="menuitem" data-sp="qplink" data-v="${esc(r.id)}">Copy link</button><button type="button" role="menuitem" class="is-danger" data-sp="qpdelete" data-v="${esc(r.id)}">Delete</button></span>`;
        }
        return h + '</div>';
    };
    return `<div class="sp-quick" role="region" aria-label="Quick prints"><div class="sp-qp-head"><h3 class="sp-h">Quick prints</h3>${inDialog ? '<button type="button" class="sp-link sp-qp-save" data-sp="qpsave">★ Save as quick print</button>' : ''}</div>`
        + (mine.length ? `<div class="sp-qp-row">${mine.map(card).join('')}</div>` : `<p class="sp-hint">${inDialog ? 'Save this setup with ★ to print it again in one tap.' : 'Save a print setup with ★ in the Print dialog to print it again in one tap.'}</p>`)
        + `<div class="sp-qp-group"><span class="sp-lbl">Fast facts</span><div class="sp-qp-row">${FAST_FACTS.map(card).join('')}</div></div></div>`;
}
/** Quick prints actions shared by the dialog and the Skills page row. Returns true when handled. */
function quickAct(act, v, rerender) {
    if (act === 'qpopen') { qpMenu = null; openQuickPrint(v); return true; }
    if (act === 'qpmenu') { qpMenu = qpMenu === v ? null : v; qpRename = null; rerender(); return true; }
    if (act === 'qprename') { qpMenu = null; qpRename = v; rerender(); const el = document.querySelector(`[data-qp-rename="${CSS.escape(v)}"]`); if (el) { el.focus(); el.select(); } return true; }
    if (act === 'qpdelete') { qpMenu = null; deleteQuickPrint(v); rerender(); try { window.showToast?.('Quick print deleted', 'info'); } catch (e) { /* */ } return true; }
    if (act === 'qplink') {
        qpMenu = null; rerender();
        const r = findQuick(v);
        if (r) { const t = quickLink(r); try { navigator.clipboard.writeText(t).then(() => window.showToast?.('Link copied: it opens this quick print', 'success'), () => window.prompt('Copy this link', t)); } catch (e) { window.prompt('Copy this link', t); } }
        return true;
    }
    return false;
}
function quickRenameKey(e, rerender) {
    const t = e.target;
    if (!t || !t.dataset || t.dataset.qpRename === undefined) return false;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== 'Escape') return false;
    if (e.type === 'keydown') { e.preventDefault(); e.stopPropagation(); }
    if (!(e.type === 'keydown' && e.key === 'Escape')) renameQuickPrint(t.dataset.qpRename, t.value);
    qpRename = null; rerender();
    return true;
}
/** Close an open ⋯ menu in place (no re-render, so the press that closed it still lands on what it pressed). */
function closeQpMenu(scope) {
    qpMenu = null;
    scope.querySelectorAll('.sp-qp-menu').forEach((m) => m.remove());
    scope.querySelectorAll('[data-sp="qpmenu"][aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
}
/** The teacher Skills page row (teacher-library.js): the same cards, tap opens the simple print filled in. */
export function mountQuickPrints(el) {
    if (!el) return;
    const draw = () => { el.innerHTML = quickRowHTML(false); };
    draw();
    if (el.dataset.qpWired) return;
    el.dataset.qpWired = '1';
    el.addEventListener('click', (e) => { const t = e.target.closest('[data-sp]'); if (t && el.contains(t)) quickAct(t.dataset.sp, t.dataset.v, draw); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && qpMenu) { qpMenu = null; draw(); return; } quickRenameKey(e, draw); });
    // the ⋯ menu closes on a click outside it
    document.addEventListener('pointerdown', (e) => { if (qpMenu && el.isConnected && !(e.target.closest && e.target.closest('.sp-qp-menu, [data-sp="qpmenu"]'))) closeQpMenu(el); }, true);
    el.addEventListener('focusout', (e) => { if (e.target.dataset && e.target.dataset.qpRename !== undefined && qpRename) quickRenameKey({ type: 'blur', target: e.target }, draw); });
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
    qpMenu = null; qpRename = null;
    if (!S) return;
    savePrefs();
    if (S.lgObs) S.lgObs.disconnect();
    if (S.root) S.root.remove();
    document.removeEventListener('keydown', onKey, true);
    document.body.classList.remove('sp-open');
    const f = S.lastFocus;
    S = null;
    if (f && f.isConnected) { try { f.focus({ preventScroll: true }); } catch (e) { /* */ } }
}

const hasFacts = () => !!(S && S.list.some(isFactSkill));
function opts() {
    // 7–10 across only with fast facts in the set (owner item 4): without them an asked 7+ is read as 6
    const cols = P.cols !== 'auto' && Number(P.cols) > CELL_MAX_COLS && !hasFacts() ? CELL_MAX_COLS : P.cols;
    return { how: P.how, n: P.how === 'pages' ? P.nPages : P.nProblems, sets: P.sets, size: P.size, cols, colsMode: P.colsMode, key: P.key, arrange: P.arrange, mixLayout: P.mixLayout || 'rows', seed: S.seed, title: S.ctx.title || true, paper: 'A4' };
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
    root.addEventListener('pointerdown', (e) => { if (qpMenu && !(e.target.closest && e.target.closest('.sp-qp-menu, [data-sp="qpmenu"]'))) closeQpMenu(root); }, true);
    // Remember whether a skill's Options panel was open when this press began (the panel closes itself on mousedown).
    root.addEventListener('pointerdown', () => { if (S) S.popAtPress = !!document.getElementById('skillOptionsPopover'); }, true);
    root.addEventListener('focusout', (e) => { if (S && qpRename && e.target.dataset && e.target.dataset.qpRename !== undefined) quickRenameKey({ type: 'blur', target: e.target }, render); });
    document.addEventListener('keydown', onKey, true);
    // hover zoom (owner 2026-11-05): a very large page beside the pointer, mouse and trackpad only
    {
        root.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse' || !S || !S.zoomOn) return; const t = e.target.closest && e.target.closest('[data-zpage]'); if (t && root.contains(t)) showZoom(Number(t.dataset.zpage), e.clientX, t); });
        root.addEventListener('pointerover', (e) => { if (e.pointerType !== 'mouse') return; if (window.innerWidth < 700) return; const t = e.target.closest && e.target.closest('[data-zpage]'); if (t && root.contains(t)) showZoom(Number(t.dataset.zpage), e.clientX, t); });
        root.addEventListener('pointerout', (e) => { const t = e.target.closest && e.target.closest('[data-zpage]'); if (t && !(e.relatedTarget && t.contains(e.relatedTarget))) hideZoom(); });
    }
    S.root = root;
}

function stepHead(n, title, sub = '') {
    return `<div class="sp-step-head"><span class="sp-num" aria-hidden="true">${n}</span><h3 class="sp-h">${title}</h3>${sub ? `<span class="sp-sub">${sub}</span>` : ''}</div>`;
}

/** One skill's number options: Highest number (its own `band` values) and its fact sets (`constant`), owner item 6. */
function skillOptsHTML(s, i) {
    // critic r1 #5: one compact row: the number option is a select ON the skill row; only fact sets / tables open below
    const { band, sets } = numberOptionsOf(s);
    const out = { inline: '', below: '' };
    if (band) {
        const bv = Number(optVal(s, band.def));
        out.inline = `<label class="sp-band"><span>${esc(band.title)}</span><select id="spBand${i}" data-band="${i}" aria-label="${esc(s.label)}: ${esc(band.title)}">${band.values.map((v) => `<option value="${v}"${v === bv ? ' selected' : ''}>${esc(band.labelOf(v))}</option>`).join('')}</select></label>`;
    }
    if (sets) {
        const sv = setsOf(s, sets);
        const allV = sets.values.map((x) => x.v);
        const lbl = s.categoryId === 'multiplication' || s.categoryId === 'division' ? 'Tables' : 'Fact sets';
        out.below = `<details class="sp-skopt"${S.openOpts && S.openOpts.has(i) ? ' open' : ''}><summary data-sp="skopt" data-v="${i}">${lbl}: ${esc(setWords(sv, allV))}</summary><div class="sp-skopt-body">`
            + `<div class="sp-facts" role="group" aria-label="${lbl}">${allV.map((v) => `<button type="button" class="sp-fact" data-sp="fact" data-i="${i}" data-v="${v}" aria-pressed="${sv.includes(Number(v))}">${v}</button>`).join('')}<button type="button" class="sp-link sp-fact-all" data-sp="factall" data-i="${i}">All</button></div></div></details>`;
    }
    return out;
}
function setOpt(i, id, v) {
    const s = S.list[i];
    s.opts = Object.assign({}, s.opts || {}, { [id]: v });
    S.probes = {};
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
    if (isTeacher() && S.ctx.from !== 'student') h += quickRowHTML(true);

    // 1 Skills (+ Highest number shared by several chosen skills, owner item 6)
    const withBand = S.list.map((s) => numberOptionsOf(s).band).filter((x) => x && x.answer);
    const sharedBand = withBand.length >= 2;
    h += `<section class="sp-step">${stepHead(1, many ? 'Skills' : 'Skill', many ? 'Leave blank to share evenly, or type a number or a %' : '')}`;
    if (sharedBand) {
        const all = [...new Set(withBand.flatMap((x) => x.values))].sort((x, y) => x - y);
        const cur = [...new Set(S.list.map((s) => { const nb = numberOptionsOf(s).band; return nb && nb.answer ? Number(optVal(s, nb.def)) : null; }).filter((x) => x !== null))];
        h += `<label class="sp-cols sp-shared"><span>Highest number (all)</span><select id="spBandAll" data-sp-band-all><option value=""${cur.length > 1 ? ' selected' : ''} disabled>${cur.length > 1 ? 'Different for each' : ''}</option>${all.map((v) => `<option value="${v}"${cur.length === 1 && cur[0] === v ? ' selected' : ''}>${v.toLocaleString('en-US')}</option>`).join('')}</select></label>`;
    }
    h += `<ul class="sp-skills">`;
    S.list.forEach((s, i) => {
        const a = parseAmount(s.amt);
        const so = skillOptsHTML(s, i);
        // owner 2026-11-03: every option of the skill (How it is written, supports …) behind its own Options button
        let osum = '';
        try { osum = s.opts && Object.keys(s.opts).length ? describeOptions(s.categoryId, s.skillId, s.opts) : ''; } catch (e) { osum = ''; }
        // short: "Long division · Tables: 6, 7" (the long wording in brackets is for the options sheet)
        osum = osum.split(' · ').map((x) => x.replace(/\s*\(.*$/, '').replace(/^How it is written:\s*/, '').trim()).filter(Boolean).join(' · ');
        const hasOpts = (() => { try { return (offeredOptionsFor(s.categoryId, s.skillId) || []).length > 0; } catch (e) { return false; } })();
        // ui3 check D5: ONE place to change a skill's options: with an Options sheet, its Highest number and Tables live
        // there (the sheet offers both), not again on the row; the row is name · ⚙ · how many
        const inline = hasOpts ? '' : so.inline;
        h += `<li class="sp-skill${inline ? ' has-band' : ''}${hasOpts ? ' has-optbtn' : ''}"><span class="sp-skill-name">${esc(s.label)}${osum ? `<span class="sp-optsum">${esc(osum)}</span>` : ''}</span>${inline}`;
        if (hasOpts) h += `<button type="button" class="sp-optbtn" data-sp="skoptions" data-v="${i}" aria-label="Options for ${esc(s.label)}" aria-haspopup="dialog" title="Options"><span aria-hidden="true">&#9881;</span></button>`;
        if (many) h += `<input id="spAmt${i}" class="sp-amt${a && a.bad ? ' is-bad' : ''}" data-amt="${i}" type="text" inputmode="numeric" autocomplete="off" value="${esc(s.amt)}" placeholder="even" aria-label="${esc(s.label)}: number of problems or %" aria-invalid="${a && a.bad ? 'true' : 'false'}">`;
        if (b && b.counts && many) h += `<span class="sp-got" aria-label="prints">${b.counts[i] || 0}</span>`;
        if (!hasOpts) h += so.below;
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
    // Columns: Auto, or a number with Aim for n | Exactly n (owner item 4); 7–10 only when the set has fast facts
    // a set with division facts offers 1–9, never 10 (owner 2026-11-05); a saved 10 shows as 9 (+ − × parts keep 10)
    const hasDiv = !!(S && S.list.some((s) => isFactSkill(s) && isDivisionFact(s)));
    const colMax = hasFacts() ? (hasDiv ? DIV_MAX_COLS : FACT_MAX_COLS) : CELL_MAX_COLS;
    const colsNow = o.cols !== 'auto' && Number(o.cols) > colMax ? colMax : o.cols;
    h += `</div><label class="sp-cols"><span>Columns</span><select id="spCols" data-sp-cols>
        <option value="auto"${colsNow === 'auto' ? ' selected' : ''}>Auto — fitted by size${autoCols ? ` (${autoCols})` : ''}</option>
        ${Array.from({ length: colMax }, (_, k) => k + 1).map((c) => `<option value="${c}"${Number(colsNow) === c ? ' selected' : ''}>${c === 1 ? '1 (across the page)' : c}</option>`).join('')}
    </select></label>`;
    if (colsNow !== 'auto') h += `<div class="sp-row sp-cmode"><div class="sp-seg" role="radiogroup" aria-label="Columns mode">${[['aim', `Aim for ${colsNow}`], ['exact', `Exactly ${colsNow}`]].map(([v, l]) => `<button type="button" role="radio" class="sp-segb" data-sp="cmode" data-v="${v}" aria-checked="${P.colsMode === v}">${l}</button>`).join('')}</div><span class="sp-hint">${P.colsMode === 'exact' ? `every part ${colsNow} across; bigger problems at their own max` : `${colsNow} across where it fits (one fewer when that ends a part on a full row), else the most that fit`}</span></div>`;
    h += `</section>`;

    // 4 Answer key
    h += `<section class="sp-step">${stepHead(4, 'Answer key')}<div class="sp-seg" role="radiogroup" aria-label="Answer key">${[[true, 'On'], [false, 'Off']].map(([v, l]) => `<button type="button" role="radio" class="sp-segb" data-sp="key" data-v="${v}" aria-checked="${P.key === v}">${l}</button>`).join('')}</div></section>`;

    // summary + page 1
    const line = S.error ? 'These pages could not be built.' : b && !S.busy ? summaryLine(b, o) : 'Working out the pages…';
    h += `<section class="sp-sum" aria-live="polite"><p class="sp-line" id="spLine">${esc(line)}</p>`;
    if (b && b.notes && b.notes.length && !S.busy) h += `<p class="sp-note">${esc(b.notes.join(' '))}</p>`;
    if (arr === 'facts') h += `<p class="sp-note">${many && P.arrange === 'mixed' ? 'Fast facts in fact rows, the signs mixed on each page' : 'Fast facts in fact rows'}: ${P.how === 'pages' ? 'every page is full' : 'each page as full as the count allows'}.</p>`;
    h += `<div class="sp-thumb" data-sp="larger" data-zpage="0"><iframe id="spFrame" title="Page 1 preview" tabindex="-1" aria-hidden="true"></iframe></div>`;
    h += `<button type="button" class="sp-larger" data-sp="larger" aria-expanded="${!!S.large}">Larger preview</button></section>`;

    // More options
    h += `<details class="sp-more"${S.moreOpen ? ' open' : ''}><summary data-sp="more">More options</summary><div class="sp-more-body">`;
    if (many) h += `<div class="sp-row"><span class="sp-lbl">Arrange</span><div class="sp-seg" role="radiogroup" aria-label="Arrange">${[['sections', 'In sections'], ['mixed', 'Mixed up']].map(([v, l]) => `<button type="button" role="radio" class="sp-segb" data-sp="arrange" data-v="${v}" aria-checked="${P.arrange === v}">${l}</button>`).join('')}</div></div>`;
    const mixIds = engineMixLayouts();
    if (many && P.arrange === 'mixed' && mixIds.length > 1) { const ml = mixIds.includes(P.mixLayout) ? P.mixLayout : mixIds[0]; h += `<div class="sp-row sp-mixl"><span class="sp-lbl">Layout</span><div class="sp-seg" role="radiogroup" aria-label="Mixed up layout">${Object.entries(MIX_LAYOUTS).filter(([v]) => mixIds.includes(v)).map(([v, [l]]) => `<button type="button" role="radio" class="sp-segb" data-sp="mixlayout" data-v="${v}" aria-checked="${ml === v}">${l}</button>`).join('')}</div><span class="sp-hint">${MIX_LAYOUTS[ml][1]}</span></div>`; }
    h += `<button type="button" class="sp-link" data-sp="newnums">New numbers</button>`;
    if (typeof S.ctx.more === 'function') h += `<button type="button" class="sp-link" data-sp="full">All print options (page types, examples, key style, sets)…</button>`;
    h += `</div></details>`;

    h += `</div><footer class="sp-foot"><button type="button" class="sp-btn sp-btn-2" data-sp="preview" aria-label="Preview every page"><span class="sp-wide">Preview every page</span><span class="sp-narrow">Preview</span></button><button type="button" class="sp-btn sp-btn-1" data-sp="print"${S.busy && !b ? ' aria-disabled="true"' : ''}>Print</button></footer>`;
    dlg.innerHTML = h;
    showThumb();
    if (focusId) { const el = document.getElementById(focusId); if (el) { try { el.focus({ preventScroll: true }); if (el.setSelectionRange && el.type === 'text') el.setSelectionRange(el.value.length, el.value.length); } catch (e) { /* */ } } }
    else if (focusSel && dlg.querySelector(focusSel)) { try { dlg.querySelector(focusSel).focus({ preventScroll: true }); } catch (e) { /* */ } }
    // Focus inside a skill's Options panel (a popover outside the dialog) stays there while the preview redraws.
    else if (document.activeElement && document.activeElement.closest && document.activeElement.closest('#skillOptionsPopover')) { /* keep */ }
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
    hideZoom();
    updateLine();
    S.timer = setTimeout(run, delay);
}

async function run() {
    if (!S) return;
    const my = ++S.token;
    hideZoom();   // critic D4: never leave the old pages in the zoom while the new ones build
    const o = opts();
    let b = null;
    try { b = await buildSets(S.list, o); } catch (e) { console.warn('[simple-print] build failed', e); b = null; }
    if (!S || my !== S.token) return;
    S.busy = false;
    S.error = !b;
    S.built = b;
    S.split = null;
    hideZoom();
    if (b && P.cols === 'auto' && b.cols) S.probes[P.size] = colsLabel(b);
    render();
    if (S.large) drawLarge();
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
        if (v === P.size) { const opt = S.root.querySelector('#spCols option[value="auto"]'); if (opt) opt.textContent = `Auto — fitted by size (${S.probes[v]})`; }
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
    if (act === 'close') {
        // A click on the backdrop while a skill's Options panel is open closes only that panel.
        if (t.classList && t.classList.contains('sp-scrim') && (S.popAtPress || document.getElementById('skillOptionsPopover'))) {
            S.popAtPress = false;
            if (document.getElementById('skillOptionsPopover') && typeof window.closeSkillOptionsPanel === 'function') window.closeSkillOptionsPanel();
            return;
        }
        closeSimplePrint(); return;
    }
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
    if (act === 'skoptions') {
        const i = Number(v), s = S.list[i];
        if (!s || typeof window.openSkillOptionsPanel !== 'function') return;
        window.openSkillOptionsPanel(s.categoryId, s.skillId, t, { opts: s.opts || {}, onChange: (next) => {
            if (!S || S.list[i] !== s) return;
            s.opts = next && Object.keys(next).length ? next : {};
            S.probes = {};
            render();
            schedule(0);
        } });
        return;
    }
    if (act === 'arrange') { if (P.arrange !== v) { P.arrange = v; changed(true); } return; }
    if (act === 'mixlayout') { if (MIX_LAYOUTS[v] && P.mixLayout !== v) { P.mixLayout = v; changed(true); } return; }
    if (act === 'more') { S.moreOpen = !t.parentElement.open; return; }
    if (act === 'cmode') { if (P.colsMode !== v) { P.colsMode = v; changed(false); } return; }
    if (act === 'skopt') { S.openOpts = S.openOpts || new Set(); const i = Number(v); if (t.parentElement.open) S.openOpts.delete(i); else S.openOpts.add(i); return; }
    if (act === 'fact' || act === 'factall') {
        const i = Number(t.dataset.i);
        const d = numberOptionsOf(S.list[i]).sets;
        if (!d) return;
        const all = d.values.map((x) => Number(x.v));
        let cur = setsOf(S.list[i], d);
        if (act === 'factall') cur = all;
        else { const x = Number(v); cur = cur.includes(x) ? cur.filter((y) => y !== x) : [...cur, x].sort((a, b) => a - b); if (!cur.length) cur = [x]; }
        setOpt(i, 'constant', cur);
        changed(true); return;
    }
    if (act === 'qpsave') {
        const rec = saveQuickPrint(footerOf(S.list).slice(0, 60), S.list, Object.assign({}, opts(), { n: P.how === 'pages' ? P.nPages : P.nProblems }));
        if (rec) { qpRename = rec.id; render(); const el = S.root.querySelector(`[data-qp-rename="${CSS.escape(rec.id)}"]`); if (el) { el.focus(); el.select(); } try { window.showToast?.('Saved as a quick print: type a name', 'success'); } catch (e) { /* */ } }
        return;
    }
    if (quickAct(act, v, render)) return;
    if (act === 'newnums') { S.seed = 100000 + Math.floor(Math.random() * 900000); schedule(0); return; }
    if (act === 'full') { const more = S.ctx.more; closeSimplePrint(); more(); return; }
    if (act === 'larger') { openLarge(); return; }
    if (act === 'smaller') { closeLarge(); return; }
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
    const t = e.target;
    if (t.id === 'spCols') { const v = t.value; P.cols = v === 'auto' ? 'auto' : Number(v); changed(false); return; }
    if (t.dataset.band !== undefined) { setOpt(Number(t.dataset.band), 'band', Number(t.value)); changed(true); return; }
    if (t.id === 'spBandAll' && t.value) {
        const v = Number(t.value);
        S.list.forEach((s, i) => { const nb = numberOptionsOf(s).band; if (nb && nb.answer) setOpt(i, 'band', bandAtMost(nb.values, v)); });
        changed(true);
    }
}
function onKey(e) {
    if (!S) return;
    if (S.root.contains(e.target) && quickRenameKey(e, render)) return;
    if (e.key === 'Escape' && qpMenu) { e.preventDefault(); e.stopPropagation(); qpMenu = null; render(); return; }
    if (e.key === 'Escape' && S.zoomOn) { e.preventDefault(); e.stopPropagation(); hideZoom(); return; }
    if (e.key === 'Escape' && S.large && !(document.getElementById('tvPdfPreview') && !document.getElementById('tvPdfPreview').hidden)) { e.preventDefault(); e.stopPropagation(); closeLarge(); return; }
    if (S.large && /^(ArrowDown|ArrowUp|PageDown|PageUp|Home|End)$/.test(e.key) && !/^(INPUT|SELECT|TEXTAREA)$/.test((e.target && e.target.tagName) || '')) {
        const sc = S.root.querySelector('.sp-lg-scroll');
        if (sc) {
            e.preventDefault();
            const step = /Page/.test(e.key) ? sc.clientHeight * 0.9 : 80;
            const top = e.key === 'Home' ? 0 : e.key === 'End' ? sc.scrollHeight : sc.scrollTop + (/Down/.test(e.key) ? step : -step);
            sc.scrollTo({ top });
        }
        return;
    }
    if (e.key === 'Escape') {
        if (document.getElementById('tvPdfPreview') && !document.getElementById('tvPdfPreview').hidden) return;
        e.preventDefault(); e.stopPropagation(); closeSimplePrint(); return;
    }
    if (e.key === 'Tab') {
        const scope = (S.large && S.root.querySelector('.sp-large')) || S.root;
        const f = [...scope.querySelectorAll('button, input, select, summary, [tabindex="0"]')].filter((x) => !x.disabled && x.offsetParent !== null);
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

/* ============================================ larger preview and hover zoom (owner 2026-11-05) */

/** The one built document split into single pages (pupil, then key), each a printable page document's body. */
function pagesOf() {
    if (!S || !S.built) return [];
    if (S.split) return S.split;
    const tpl = document.createElement('template');
    tpl.innerHTML = S.built.doc || S.built.firstHtml || '';
    const styles = [...tpl.content.querySelectorAll('style')].filter((x) => !x.closest('.ws-page')).map((x) => x.outerHTML).join('');
    const pages = [...tpl.content.querySelectorAll('.ws-page')];
    // critic D3: key or not is read from each page itself (the kit's .ws-key page, its "Answer Key" name line), and the
    // set from its own "Set n of N" footer, so set 2's pupil pages are never taken for set 1's key
    let set = 1, prevKey = false;
    S.split = pages.map((pg) => {
        const key = pg.classList.contains('ws-key') || !!pg.querySelector('[data-ws-key="name"]');
        const m = /Set (\d+) of \d+/.exec(pg.textContent || '');
        if (m) set = Number(m[1]); else if (prevKey && !key) set += 1;
        prevKey = key;
        // keep the page's wrappers (their classes carry the sheet's look), without the other pages
        let html = pg.outerHTML;
        for (let a = pg.parentElement; a; a = a.parentElement) { const c = a.cloneNode(false); c.innerHTML = '\u0001'; html = c.outerHTML.replace('\u0001', html); }
        return { html: styles + html, key, set };
    });
    // the page's place in its own set's pupil pages or key pages ("Set 2 · page 1 of 2")
    const cnt = {};
    S.split.forEach((p) => { const k = p.set + (p.key ? 'k' : 'p'); p.nth = (cnt[k] = (cnt[k] || 0) + 1); });
    S.split.forEach((p) => { p.of = cnt[p.set + (p.key ? 'k' : 'p')]; });
    return S.split;
}
const PAGE_EXTRA = '<style>html,body{background:#fff!important;margin:0!important;padding:0!important;overflow:hidden!important}.ws-page{margin:0!important;outline:0!important;box-shadow:none!important}</style>';
function pageDoc(i) {
    const p = pagesOf()[i];
    if (!p) return '';
    return sheetDocument(p.html, 'Preview', { paper: 'A4' }).replace('</head>', PAGE_EXTRA + '</head>');
}
function mountFrame(slot, i, title) {
    if (!slot || slot.querySelector('iframe')) return;
    const f = document.createElement('iframe');
    f.title = title; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
    f.srcdoc = pageDoc(i);
    slot.appendChild(f);
}
function openLarge() {
    if (!S) return;
    S.large = true;
    S.root.classList.add('sp-is-large');
    hideZoom();
    drawLarge();
    const sc = S.root.querySelector('.sp-lg-scroll');
    if (sc) try { sc.focus({ preventScroll: true }); } catch (e) { /* */ }
}
function closeLarge() {
    if (!S) return;
    S.large = false;
    hideZoom();
    if (S.lgObs) { S.lgObs.disconnect(); S.lgObs = null; }
    const el = S.root.querySelector('.sp-large');
    if (el) el.remove();
    S.root.classList.remove('sp-is-large');
    const btn = S.root.querySelector('.sp-larger');
    if (btn) { btn.setAttribute('aria-expanded', 'false'); try { btn.focus({ preventScroll: true }); } catch (e) { /* */ } }
}
function drawLarge() {
    if (!S || !S.large) return;
    if (S.lgObs) { S.lgObs.disconnect(); S.lgObs = null; }
    let el = S.root.querySelector('.sp-large');
    const keepTop = el ? (el.querySelector('.sp-lg-scroll') || {}).scrollTop || 0 : 0;
    if (!el) { el = document.createElement('div'); el.className = 'sp-large'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Larger preview'); S.root.appendChild(el); }
    const pages = S.built && !S.busy ? pagesOf() : [];
    const n = pages.length;
    const nSets = Math.max(1, ...pages.map((p) => p.set || 1));
    const nKey = pages.filter((p) => p.key).length, nPupil = n - nKey;
    const pl = (k, w) => `${k} ${w}${k === 1 ? '' : 's'}`;
    // D7: what the print holds, in words, and Print right here (the dialog's Print sits under the pane)
    const meta = n ? `${nSets > 1 ? `${nSets} sets · ` : ''}${pl(nPupil, 'pupil page')}${nKey ? ` + ${pl(nKey, 'answer key page')}` : ''}` : 'Working out the pages…';
    let h = `<header class="sp-lg-top"><h3 class="sp-lg-title">Larger preview</h3><span class="sp-lg-meta">${meta}</span><button type="button" class="sp-lg-print" data-sp="print"${n ? '' : ' disabled'}>Print</button><button type="button" class="sp-lg-small" data-sp="smaller">Smaller</button></header><div class="sp-lg-scroll" tabindex="0" aria-label="Pages">`;
    let prev = null;
    pages.forEach((p, i) => {
        // D3: a divider at each set (sets > 1) and at each set's answer key
        if (nSets > 1 && (!prev || prev.set !== p.set)) h += `<div class="sp-lg-div sp-lg-set" role="separator" data-set="${p.set}"><span>Set ${p.set}</span></div>`;
        if (p.key && (!prev || !prev.key || prev.set !== p.set)) h += `<div class="sp-lg-div" role="separator"><span>${nSets > 1 ? `Set ${p.set} answer key` : 'Answer key'}</span></div>`;
        const cap = nSets > 1 ? `Set ${p.set} · ${p.key ? 'answer key ' : ''}page ${p.nth} of ${p.of}` : `Page ${i + 1} of ${n}${p.key ? ' · answer key' : ''}`;
        h += `<figure class="sp-lg-page" data-pg="${i}"><figcaption>${cap}</figcaption><div class="sp-lg-sheet" data-zpage="${i}"></div></figure>`;
        prev = p;
    });
    h += `</div>`;
    el.innerHTML = h;
    const btn = S.root.querySelector('.sp-larger');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    const sc = el.querySelector('.sp-lg-scroll');
    const w = Math.min(820, Math.max(200, sc.clientWidth - 40));
    sc.style.setProperty('--sp-lg-w', w + 'px');
    sc.style.setProperty('--sp-lg-s', String(w / 794));
    const slots = [...sc.querySelectorAll('.sp-lg-sheet')];
    if (slots[0]) mountFrame(slots[0], 0, 'Page 1');
    if (typeof IntersectionObserver === 'function') {
        S.lgObs = new IntersectionObserver((ents) => {
            for (const en of ents) if (en.isIntersecting) { const i = Number(en.target.dataset.zpage); mountFrame(en.target, i, `Page ${i + 1}`); S.lgObs && S.lgObs.unobserve(en.target); }
        }, { root: sc, rootMargin: '200px 0px' });
        slots.slice(1).forEach((x) => S.lgObs.observe(x));
    } else slots.forEach((x, i) => mountFrame(x, i, `Page ${i + 1}`));
    sc.scrollTop = keepTop;
}
/**
 * Where the zoom goes: beside the pointer, never under it (critic D1), and only when it is clearly larger than the
 * page under the pointer (critic D2: >= ZOOM_GAIN times as wide). Returns null when it cannot be both.
 */
const ZOOM_GAIN = 1.3, ZOOM_MIN_W = 320, ZOOM_EDGE = 16, ZOOM_GAP = 24;
export function zoomBox(x, srcW, vw, vh) {
    const left = x - ZOOM_GAP - ZOOM_EDGE, right = vw - x - ZOOM_GAP - ZOOM_EDGE;
    const side = right >= left ? 'right' : 'left';
    const H0 = Math.round(vh * 0.94);
    const W = Math.floor(Math.min(H0 * 794 / 1123, Math.max(left, right)));
    if (W < ZOOM_MIN_W || W < ZOOM_GAIN * (srcW || 0)) return null;
    const H = Math.round(W * 1123 / 794);
    return { w: W, h: H, top: Math.round((vh - H) / 2), left: side === 'right' ? vw - ZOOM_EDGE - W : ZOOM_EDGE };
}
function showZoom(i, x, src) {
    if (!S || !S.built || S.busy || !pagesOf()[i]) return;
    const srcW = src && src.getBoundingClientRect ? src.getBoundingClientRect().width : 0;
    const box = zoomBox(x, srcW, window.innerWidth, window.innerHeight);
    if (!box) { hideZoom(); return; }
    let z = S.root.querySelector('.sp-zoom');
    if (!z) { z = document.createElement('div'); z.className = 'sp-zoom'; z.setAttribute('aria-hidden', 'true'); S.root.appendChild(z); }
    z.style.height = box.h + 'px'; z.style.width = box.w + 'px';
    z.style.top = box.top + 'px'; z.style.left = box.left + 'px';
    z.style.setProperty('--sp-z-s', String(box.w / 794));
    if (z.dataset.pg !== String(i) || z.dataset.v !== String(S.token)) {
        z.dataset.pg = String(i); z.dataset.v = String(S.token);
        z.innerHTML = '';
        mountFrame(z, i, `Page ${i + 1}, large`);
    }
    z.hidden = false;
    S.zoomOn = true;
}
function hideZoom() {
    if (!S) return;
    const z = S.root && S.root.querySelector('.sp-zoom');
    if (z) z.hidden = true;
    S.zoomOn = false;
}

/** For checks: the open dialog's state. */
export function simplePrintState() {
    return S ? { list: S.list.map((s) => ({ key: keyOf(s), amt: s.amt, opts: s.opts || null })), quick: S.ctx.quick || null, prefs: Object.assign({}, P), built: S.built ? { pages: S.built.pages, total: S.built.total, cols: S.built.cols, rows: S.built.rows, perPage: S.built.perPage, arrangement: S.built.arrangement, fellBack: !!S.built.fellBack, counts: S.built.counts, sets: S.built.sets, line: summaryLine(S.built, opts()) } : null, busy: !!S.busy, probes: Object.assign({}, S.probes), large: !!S.large, zoom: !!S.zoomOn } : null;
}
