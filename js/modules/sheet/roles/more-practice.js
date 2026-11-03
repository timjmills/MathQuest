// js/modules/sheet/roles/more-practice.js
// MORE PRACTICE A TO J (design/PAGE_TYPES.md 2.5): a repetition bank for the same step, up to ten
// parallel pages. Look, anatomy and geometry are the Independent page's (2.4); what differs:
//
//   PT-MPR-1   the tab reads "Practice A" .. "Practice J"; the title is the lesson title; letters
//              restart at a. on every page, because each page is handed out alone (CL-12). So
//              every letter is a sheet of its own: full header, its own Score /N, footer 1/1.
//   PT-MPR-2   each letter is its own seed (`letterSeed(seed, letter)`), so Practice C reprints
//              identically whatever else is printed with it. The host generates each letter's
//              items under that seed and tags them `letter`; untagged items are paginated like
//              an Independent run and each page becomes the next letter.
//   PT-MPR-3   supports match the last Independent page (scaffold level 1).
//
// `plan(input)` returns a PagePlan whose `pages` hold every letter (so `renderPageAndKey` works
// on it directly) plus `sheets`, one PagePlan per letter; `render(plan)` renders letter by letter
// so each keeps its own page counter and key seed.
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`, no app import.

import { composePractice, renderPlan, letterSeed } from './practice.js';
import { getCell, hasCell } from '../registry.js';
import { measuredH } from '../layout.js';

export const ROLE_ID = 'more-practice';
export const LETTERS = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);

/**
 * @param {Object} input   as `independent.plan`, plus
 * @param {string|number} [input.startLetter]  the first letter when items carry no `letter`
 */
export function plan(input = {}) {
    const items = Array.isArray(input.items) ? input.items : [];
    if (!items.some((it) => it && it.letter !== undefined && it.q)) return composePractice(ROLE_ID, input);
    // PT-MPR-4 (critic r7 D7-1): a letter page never prints the same problem twice while the
    // skill has distinct ones. Repeats inside one letter and section are dropped (the first copy
    // stays); repeats across letters are allowed (each letter is handed out alone).
    const groupKey = (it) => `${String(it.letter)}|${Number(it.section) || 0}`;
    const seen = new Map();
    const cut = new Set();
    const kept = items.filter((it) => {
        if (!it || !it.q || it.anchor) return true;
        const g = groupKey(it);
        if (!seen.has(g)) seen.set(g, new Set());
        const sig = it.sig || itemSignature(it);   // the host's own identity (print-sheet.js signature), else the kit's
        if (seen.get(g).has(sig)) { cut.add(g); return false; }
        seen.get(g).add(sig);
        return true;
    });
    // A group that lost repeats keeps WHOLE rows of its grid (no hole where a repeat was): the
    // letter is composed once to learn its columns, then cut back to a multiple of them.
    let out = kept;
    let whole = composePractice(ROLE_ID, Object.assign({}, input, { items: out }));
    const trim = new Map();
    if (cut.size) {
        for (const sheet of whole.sheets || []) {
            const L = sheet.meta && sheet.meta.letter;
            ((sheet.meta && sheet.meta.fits) || []).forEach((f, si) => {
                const g = [...cut].find((k) => k === `${L}|${si}` || k === `${LETTERS.indexOf(L)}|${si}`);
                if (!g || !f || !(f.cols > 1)) return;
                const n = out.filter((it) => it && !it.anchor && groupKey(it) === g).length;
                const k = n - (n % f.cols);
                if (n % f.cols && k >= Math.max(2, f.cols)) trim.set(g, k);
            });
        }
    }
    if (trim.size) {
        const count = new Map();
        out = out.filter((it) => {
            if (!it || it.anchor) return true;
            const g = groupKey(it);
            if (!trim.has(g)) return true;
            const c = (count.get(g) || 0) + 1;
            count.set(g, c);
            return c <= trim.get(g);
        });
        whole = composePractice(ROLE_ID, Object.assign({}, input, { items: out }));
    }
    return refitLetters(input, out, whole);
}

/** The fill of a letter sheet: its pages, and how much of the problem area its grids take. */
function sheetFill(sheet) {
    const pages = (sheet && sheet.pages) || [];
    let fill = 1;
    for (const pg of pages) {
        if (typeof pg.fill === 'number') { fill = Math.min(fill, pg.fill); continue; }
        const g = (pg.sections || []).filter((x) => x.kind === 'grid');
        const avail = g.length === 1 ? Number(g[0].availMm) : 0;
        const h = parseFloat(g.length === 1 ? g[0].height : '');
        if (avail > 0 && h > 0) fill = Math.min(fill, h / avail);
        else if (!(g.length > 1)) fill = NaN;          // not measurable: never judged
    }
    return { pages: pages.length, fill };
}

const FILL_OK = 0.81;

/**
 * PT-MPR-5 (critic r7 D7-1): every letter is ONE page asked, filled to the Independent page's
 * standard. A letter that spills onto a second side (dot arrays dealt taller than the first
 * letter's probe) or leaves a strip (a grid cut back to the skill's distinct problems) is laid
 * again at the column count that holds it on fewer pages and fills more of the page. Only an
 * Auto, single-section page is re-laid: a teacher's column count is never overridden.
 */
function refitLetters(input, items, whole) {
    const secs = Array.isArray(input.sections) && input.sections.length ? input.sections : [{ columns: 'auto' }];
    const sec0 = secs[0] || {};
    if (secs.length !== 1 || (sec0.columns !== undefined && sec0.columns !== 'auto') || sec0.gridH || sec0.noCap) return whole;
    const sheets = whole.sheets || [];
    let changed = false;
    const next = sheets.map((sheet) => {
        const now = sheetFill(sheet);
        const L = sheet.meta && sheet.meta.letter;
        const mine = items.filter((it) => it && (it.letter === L || LETTERS[Number(it.letter)] === L));
        const n = mine.filter((it) => !it.anchor).length;
        const cols = ((sheet.meta && sheet.meta.fits && sheet.meta.fits[0]) || {}).cols || 0;
        // a short last row is re-laid into wider cells (grid.js relaid): a small problem then
        // stands alone in a full-width cell (H13), so a letter with one is laid again too
        const short = cols > 1 && n > cols && n % cols !== 0;
        if (!Number.isFinite(now.fill) || (now.pages === 1 && now.fill >= FILL_OK && !short)) return sheet;
        let best = { sheet, q: now, n, ok: false };
        const probs = mine.filter((it) => !it.anchor);
        // what may be left out: nothing, the tallest one or two (a deal's one 10-row array that
        // sets every row's height), or the last one or two (whole rows of what is left)
        const tallest = probs.slice().sort((a, b) => measuredH(b, cols || 2) - measuredH(a, cols || 2));
        const drops = [[], [tallest[0]], tallest.slice(0, 2), probs.slice(-1), probs.slice(-2)]
            .filter((d, i, all) => n - d.length >= 2 && all.findIndex((e) => e.length === d.length && e.every((x, j) => x === d[j])) === i);
        const tried = new Set();
        for (const c of ['keep', 1, 2, 3, 4, 5, 6]) {
            // never one full-width column for problems laid in several (a 30 mm fact in a 185 mm
            // cell is a band, RUBRIC H13)
            if (c !== 'keep' && (c > n || (c === 1 && cols > 1))) continue;
            for (const d of drops) {
                const use = mine.filter((it) => !d.includes(it));
                const k = n - d.length;
                const sec = c === 'keep' ? Object.assign({}, sec0, { freeRows: true }) : Object.assign({}, sec0, { columns: c, freeRows: true });
                let s;
                try { s = composePractice(ROLE_ID, Object.assign({}, input, { items: use, sections: [sec] })).sheets[0]; } catch (e) { continue; }
                if (!s) continue;
                const f0 = (s.meta && s.meta.fits && s.meta.fits[0]) || {};
                const g = f0.cols || 0;
                const sig = `${g}x${f0.rows}|${k}|${d.map((x) => probs.indexOf(x)).join(',')}`;
                if (tried.has(sig)) continue;
                tried.add(sig);
                const q = sheetFill(s);
                // whole rows only, no row over its page
                if (!(g > 0) || (g === 1 && cols > 1) || k % g || !Number.isFinite(q.fill) || q.fill > 1.001) continue;
                // never trade a problem for fill unless the page then fills
                if (d.length && (q.fill < FILL_OK || q.pages > 1)) continue;
                const okQ = q.pages === 1 && q.fill >= FILL_OK;
                const okB = best.ok;
                const win = q.pages < best.q.pages
                    || (q.pages === best.q.pages && (okQ && okB ? k > best.n || (k === best.n && q.fill > best.q.fill + 0.02) : q.fill > best.q.fill + 0.04));
                if (win || (okQ && !okB && q.pages <= best.q.pages)) best = { sheet: s, q, n: k, ok: okQ };
            }
        }
        if (best.sheet !== sheet) changed = true;
        return best.sheet;
    });
    if (!changed) return whole;
    const first = next[0];
    return Object.assign({}, first, {
        pages: next.flatMap((s) => s.pages),
        sheets: next,
        meta: Object.assign({}, whole.meta, {
            items: next.reduce((a, s) => a + ((s.meta && s.meta.items) || 0), 0),
            scoreOutOf: next.map((s) => s.meta.scoreOutOf), pages: next.reduce((a, s) => a + s.pages.length, 0),
            fits: next[0].meta.fits,
        }),
    });
}

/**
 * A problem's identity for de-duplication: what the pupil would see as "the same problem". A
 * template that knows when two items are the same problem in another order (a number family:
 * 4, 5, 20 = 5, 4, 20) supplies an order-free `dedupeKey`; a legacy number family is keyed the
 * same way from its data (print-sheet.js `signature()` mirrors this).
 */
export function itemSignature(it) {
    const q = (it && it.q) || {};
    try {
        const t = q.cell && q.cell.template && q.cell.template !== 'legacy' && hasCell(q.cell.template) ? getCell(q.cell.template) : null;
        const dk = t && typeof t.dedupeKey === 'function' ? t.dedupeKey(q.cell.payload || {}) : '';
        if (dk) return `dk|${dk}`;
        const d = q.numberFamilyData;
        if (d && /^number-family-(add-sub|mult-div)$/.test(String(q.printFormat || ''))) {
            const nums = [d.a, d.b, d.c].map(Number).filter(Number.isFinite).sort((a, b) => a - b);
            if (nums.length >= 2) return `dk|nf${/mult/.test(q.printFormat) ? 'x' : '+'}:${nums.join(',')}`;
        }
    } catch (e) { /* fall through to the drawn identity */ }
    const payload = q.cell && q.cell.payload ? JSON.stringify(q.cell.payload) : '';
    const ans = typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans);
    return `${String(q.text || '').replace(/\s+/g, ' ').trim()}|${ans}|${payload}`;
}

export const render = (p, opts) => renderPlan(p, opts);

export { letterSeed };

export default { ROLE_ID, LETTERS, plan, render, letterSeed, itemSignature };
