// js/modules/sheet/paginate.js
// PAGINATION: split a section's items into pages, keep labels running, count the Score, and
// place the sections of a sheet onto pages without ever splitting a cell.
//
// Rules this file implements (WORKSHEET_DESIGN_STANDARD.md, design/PAGE_TYPES.md):
//   PG-20  content never shrinks to fit; items flow to the next page
//   PG-21  a cell is never split across pages (a whole row moves or none of it)
//   PG-22  the instruction line repeats on every page its section continues on
//   PG-23  a short last page is rebalanced: rows are spread evenly across the section's pages
//   PG-24 / HD-20 / PT-FRM-2  pages 2+ carry the 12 mm continuation header
//   PT-ENG-6  rows and cell height are computed ONCE per section and reused on every page
//   CL-12 / CL-13 / PT-LBL-7  letters run on across a sheet and never pass z.; each More
//          Practice page restarts at a.; Daily tabs number 1 to N across the sheet
//   PT-FRM-4  the Score denominator is the number of scored cells on the WHOLE sheet
//
// PG-23 AS THIS ENGINE READS IT. The standard says "fewer than one third of a full page's
// rows"; the owner's example is sharper: 20 items at 6 a page prints 6 / 6 / 4 / 4 (or
// 5 / 5 / 5 / 5), never 6 / 6 / 6 / 2 - and 2 is exactly one third of 6. So the threshold is
// read inclusively: a last page holding one third of a page or LESS is rebalanced. Rows (not
// items) are what is spread, because the grid is row-based (PG-11) and a row is never split.
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`.

/* ================================================================ one section's pages */

/**
 * Split `count` items into pages for a layout `{cols, rows}`.
 *
 * @param {number} count
 * @param {{cols: number, rows: number}} layout
 * @param {{rebalance?: boolean}} [opts]
 * @returns {{index: number, from: number, count: number, rows: number, rebalanced: boolean}[]}
 */
export function paginate(count, layout, { rebalance = true } = {}) {
    const n = Math.max(0, Math.floor(Number(count) || 0));
    const cols = Math.max(1, layout.cols || 1);
    const rows = Math.max(1, layout.rows || 1);
    if (!n) return [];
    const totalRows = Math.ceil(n / cols);
    const pageCount = Math.ceil(totalRows / rows);
    let rowsPerPage = Array.from({ length: pageCount }, (_, i) => (i < pageCount - 1 ? rows : totalRows - rows * (pageCount - 1)));
    let rebalanced = false;
    if (rebalance && pageCount > 1) {
        const last = rowsPerPage[pageCount - 1];
        if (last * 3 <= rows) {
            // PG-23: spread the rows evenly; the first pages take the one extra row each.
            const base = Math.floor(totalRows / pageCount);
            const extra = totalRows % pageCount;
            rowsPerPage = rowsPerPage.map((_, i) => base + (i < extra ? 1 : 0));
            rebalanced = true;
        }
    }
    const out = [];
    let from = 0;
    rowsPerPage.forEach((r, i) => {
        const take = Math.min(r * cols, n - from);
        out.push({ index: i, from, count: take, rows: Math.ceil(take / cols), rebalanced });
        from += take;
    });
    return out;
}

/* ===================================================================== labels and Score */

const LETTER_CAP = 26;

/**
 * CL-12 / CL-13 / PT-LBL-7: the first label number of every page.
 *
 * @param {number[]} counts           labelled cells on each page, in order
 * @param {Object} [opts]
 * @param {'letter'|'tab'|'none'} [opts.style]
 * @param {boolean} [opts.restartEachPage]  More Practice, Review, Test ...: every page starts at a.
 * @returns {{starts: number[], notes: string[]}}
 */
export function labelStarts(counts, { style = 'letter', restartEachPage = false } = {}) {
    const starts = [];
    const notes = [];
    let next = 1;
    counts.forEach((c, i) => {
        if (restartEachPage) next = 1;
        // CL-13: a letter run never passes z.; if a page would, the run restarts at a. at that
        // page boundary and the dialog says so. Tabs (Daily look) have no such limit.
        if (style === 'letter' && next > 1 && next + c - 1 > LETTER_CAP) {
            next = 1;
            notes.push(`Letters restart at a. on page ${i + 1} (a run never passes z.).`);
        }
        starts.push(next);
        next += c;
    });
    return { starts, notes };
}

/** PT-FRM-4: the Score denominator is every scored cell on the whole sheet. */
export const scoreDenominator = (counts) => counts.reduce((a, b) => a + (Number(b) || 0), 0);

/* ================================================================= placing sections */

/**
 * Place the paginated chunks of every section of ONE sheet onto pages.
 *
 * A chunk is one page's worth of one section (from `paginate`). The first chunk of a section may
 * share the page its predecessor ended on when the instruction line and all of its rows fit
 * under what is already there; every later chunk of a section starts a new page (that is what
 * the section's pagination decided). Nothing is ever split (PG-21) and nothing shrinks (PG-20).
 *
 * @param {{layout: {cellH: number, rows: number}, chunks: Object[], instrMm: number}[]} sections
 * @param {{bodyFirstMm: number, bodyContMm: number}} bodies  body heights of page 1 and pages 2+
 * @returns {{cont: boolean, parts: {section: number, chunk: Object, heightMm: number}[], usedMm: number, bodyMm: number}[]}
 */
export function placeSections(sections, { bodyFirstMm, bodyContMm }) {
    const pages = [];
    let cur = null;
    // PG-12: once a second block shares a page, its grids carry fixed heights, and fixed
    // heights on a page total no more than the body less 1 mm.
    const SAFETY = 1;
    const open = () => {
        const cont = pages.length > 0;
        cur = { cont, parts: [], usedMm: 0, bodyMm: cont ? bodyContMm : bodyFirstMm };
        pages.push(cur);
    };
    sections.forEach((s, si) => {
        (s.chunks || []).forEach((chunk, ci) => {
            const heightMm = s.instrMm + chunk.rows * s.layout.cellH;
            const fitsHere = cur && ci === 0 && cur.usedMm + heightMm <= cur.bodyMm - SAFETY;
            if (!fitsHere) open();
            cur.parts.push({ section: si, chunk, heightMm });
            cur.usedMm += heightMm;
        });
    });
    return pages;
}

export default { paginate, labelStarts, scoreDenominator, placeSections };
