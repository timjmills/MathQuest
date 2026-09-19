// Computation grids in both looks, and fact rows at 5 / 7 / 10 columns.
import { page, instruction, grid, band, dayBand, stack, fact, FACT_LADDER, factTab, doc, rng, int } from '../kit/kit.mjs';

const r = rng(20260919);

// ---- A. Daily look, size L, 3 x 3, three-digit addition (black tabs) ----
const addPairs = [[252, 247], [420, 515], [685, 302], [436, 153], [305, 410], [172, 626], [364, 235], [518, 271], [143, 650]];
const dailyAdd = page({
    look: 'daily', size: 'L', tab: 6,
    header: { score: 9, tab: ['Level 2', 'Addition', 'Practice A'], title: 'I Can add three-digit numbers' },
    footer: { left: 'add_1k_no_regroup · Grade 2 · 2.NBT.B.7', right: 'Form A' },
    body: instruction('Add.') + grid(addPairs.map(([a, b]) => stack(a, b, '+', { T: 4 })), { cols: 3, rows: 3, labels: 'tab' }),
    note: '<b>01-A · Computation grid — Daily look, size L.</b> 3 × 3, black number tabs, widely tracked digits (0.95 em), heavy grid. All spare height is answer space.',
});

// ---- B. I Can look, size L, 2 x 3, subtraction with regrouping: H T O heads + regroup boxes ----
const subPairs = [[632, 247], [546, 178], [804, 356], [980, 356], [443, 153], [746, 558]];
const icanSub = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 6, tab: ['Level 2', 'Subtraction', 'Lesson 5'], title: 'I Can subtract three-digit numbers with regrouping' },
    footer: { left: 'sub_1k_regroup · Grade 2 · 2.NBT.B.7', center: '2/3', right: 'Form A' },
    body: band('Independent Practice:', 'Subtract.', grid(subPairs.map(([a, b]) => stack(a, b, '-', { T: 4, heads: true, regroup: 'sub' })), { cols: 2, rows: 3, labels: 'letter', start: 3 }), { grow: true }),
    note: '<b>01-B · Independent page — I Can look, size L.</b> 2 × 3, quiet letters (continuing c.–h. from the opener), bold H T O heads, regroup boxes above every digit so nothing is given away.',
});

// ---- C. Same skill at size M, 3 x 4 (shows S/M/L) ----
const mPairs = Array.from({ length: 12 }, () => { const a = int(r, 310, 989), b = int(r, 105, a - 100); return [a, b]; });
const icanSubM = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 12, tab: ['Level 2', 'Subtraction', 'Practice B'], title: 'I Can subtract three-digit numbers with regrouping' },
    footer: { left: 'sub_1k_regroup · Grade 2 · 2.NBT.B.7', right: 'Form A' },
    body: band('More Practice:', 'Subtract.', grid(mPairs.map(([a, b]) => stack(a, b, '-', { T: 4, heads: true, regroup: 'sub' })), { cols: 3, rows: 4, labels: 'letter' }), { grow: true }),
    note: '<b>01-C · The same cell at size M.</b> 3 × 4 = 12 problems; 22 pt digits, 8 mm writing height.',
});

// ---- D. Fact rows ----
// rowH: fixed row height in mm, or 'fill' to let equal rows take the whole grid (allowed while cellH <= 1.3 x hMin, PG-11)
function factRows(cols, rows, op, table, { labels, size = 'M', start = 1, rowH = null }) {
    const pt = FACT_LADDER[cols] || 28;
    const cells = Array.from({ length: cols * rows }, () => {
        const b = table ?? int(r, 0, 9); const a = op === '+' ? int(r, 0, 9) : op === 'x' ? int(r, 0, 10) : int(r, b, b + 9);
        return fact(a, b, op, { pt, padTop: labels === 'tab' ? (cols >= 8 ? 4.5 : 3) : 2 });
    });
    return { pt, html: grid(cells, { cols, rows, labels, start, cls: rowH === 'fill' ? 'facts' : 'facts fixed', height: rowH === 'fill' ? '' : `${rows * (rowH || ({ 5: 37, 6: 34, 7: 31, 8: 28, 9: 26, 10: 26 })[cols])}mm` }) };
}

const f5 = factRows(5, 6, 'x', 3, { labels: 'tab', rowH: 'fill' });
const facts5 = page({
    look: 'daily', size: 'M', tab: factTab(f5.pt),
    header: { score: 30, tab: ['Level 3', 'Multiplying', 'Facts ×3'], title: 'Multiply by 3' },
    footer: { left: 'mult_facts ×3 · Grade 3 · 3.OA.C.7', right: 'Form A' },
    body: instruction('Multiply.') + f5.html,
    note: '<b>01-D · Fact rows, 5 columns.</b> 28 pt digits, every fact numbered with a black tab. One fact family per page.',
});

const f7 = factRows(7, 7, '+', null, { labels: 'tab', rowH: 'fill' });
const facts7 = page({
    look: 'daily', size: 'M', tab: factTab(f7.pt),
    header: { score: 49, tab: ['Level 1', 'Addition', 'Facts to 18'], title: 'Add facts to 18' },
    footer: { left: 'add_facts · Grade 1 · 1.OA.C.6', right: 'Form A' },
    body: instruction('Add.') + f7.html,
    note: '<b>01-E · Fact rows, 7 columns.</b> 20 pt digits (the column count drives digit size), 5 mm tabs.',
});

const day = d => dayBand(d, 30, factRows(10, 3, '+', null, { labels: 'none', rowH: 33 }).html);   // 26 mm minimum stretched to 33 (cap 1.3x) so two bands fill the page
const facts10 = page({
    look: 'daily', size: 'M', tab: 4,
    header: { score: false, tab: ['Level 1', 'Addition', 'Week 3'], title: 'Add facts to 18' },
    footer: { left: 'add_facts · Grade 1 · 1.OA.C.6', center: '1/2', right: 'Week 3' },
    body: instruction('Add.') + `<div style="margin-top:-3mm">${day(1)}${day(2)}</div>`,
    note: '<b>01-F · Fact rows, 10 columns, Day bands.</b> 16 pt digits, no cell labels, a black Day tab and a Score per band (the header Score switches off). Days 3–5 continue on the next side.',
});

const f10 = factRows(10, 8, '-', null, { labels: 'tab', rowH: 'fill' });
const facts10n = page({
    look: 'daily', size: 'M', tab: 4,
    header: { score: 80, tab: ['Level 1', 'Subtraction', 'Facts to 18'], title: 'Subtract facts to 18' },
    footer: { left: 'sub_facts · Grade 1 · 1.OA.C.6', right: 'Form A' },
    body: instruction('Subtract.') + f10.html,
    note: '<b>01-G · Fact rows, 10 columns, every fact numbered.</b> The alternative to Day bands: 4 mm black tabs in the free top-left corner. 80 facts.',
});

export default doc('01 Computation grids and fact rows', [dailyAdd, icanSub, icanSubM, facts5, facts7, facts10, facts10n]);
