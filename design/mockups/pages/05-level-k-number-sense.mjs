// Level K-1 number sense: K one-page lesson, count and write (pictures / counters), ten frames,
// numeral trace rows, the 1-120 chart with a more-and-less table, compare two groups.
//
// KIT PROPOSALS (nothing in the kit was edited; everything below lives in this file as .p05-* / local helpers)
//   1. counters(n, { solid, d, pitch, perRow })  - plain counters in ten-frame order (RP-11 / RP-20 / RP-21).
//   2. pictures(kind, n)                         - the in-house 24 x 24 line-art set (star, apple, fish, ball here;
//                                                  car, flower, turtle, block still to draw), 1.5 pt outline, 0.75 pt detail.
//   3. tenFrame(n, cellMm)                       - 2 x 5 frame, 1.5 pt border, 0.75 pt interior, solid counters.
//   4. answerSquare(mm)                          - the K answer square (16 / 20 / 24 mm); the kit's box() is tied to --ws-hw.
//   5. stepsBox(items)                           - rounded 1.5 pt "Steps:" read-box that spans the page (K one-page lesson);
//                                                  kit steps() only gives the list.
//   6. traceRow(digit, N)                        - numeral-formation row: model digit + start dot + numbered stroke arrows,
//                                                  grey trace cells, dot-only cells. Needs a per-digit table of start-dot and
//                                                  arrow positions in em (STROKES below) - belongs in the kit beside the font.
//   7. chartGrid(from, to, blanks, traced)       - hundred chart; cells are the blanks (PT-CHT-1).
//   8. band() could take { style / cls } so a band can follow a grid with a gap (used a local copy of the markup on page F),
//      and grid() could take explicit row tracks (the more-and-less table needs 8 / 12 / 12 mm rows).
//
// DEPARTURES FROM THE STANDARD (reviewer pass)
//   - Table 11.2 asks for 12 mm count items at L. Page A uses 12 mm; B / C use 10 mm pictures and 9 mm counters because the brief's
//     2 x 4 side layout with a 24 mm answer square leaves 57 mm for a row of 5 (PAGE_TYPES 3.5 gives a 55 mm picture box, which a
//     row of five 12 mm items at item + 3 pitch (72 mm) cannot enter - the two documents disagree; flagged for a ruling).
//     G uses 10 mm so two rows of 5 sit inside the 72 mm group box with a margin.
//   - B / C cells are 56 mm tall (brief: 2 x 4) against the standard's 44 mm x 5 rows, so the picture field and answer square are
//     centred on one axis a little above the cell's middle instead of hugging the top: a count cell needs no working room below.
import { page, instruction, grid, band, cell, label, equation, circle, steps, doc } from '../kit/kit.mjs';

// ---------- drawing helpers (mm user units; stroke widths are the allowed pt set in mm) ----------
const PT = 0.3528;
const SW = { fine: 0.5 * PT, hair: 0.75 * PT, one: PT, heavy: 1.5 * PT };
const n2 = v => +v.toFixed(2);
const svg = (w, h, inner) => `<svg class="ws-svg" xmlns="http://www.w3.org/2000/svg" width="${n2(w)}mm" height="${n2(h)}mm" viewBox="0 0 ${n2(w)} ${n2(h)}">${inner}</svg>`;

// plain counters, rows of perRow, top row first (ten-frame order). fullWidth keeps the 5-column field so groups line up.
function counters(n, { solid = true, d = 7, pitch = 10, rowPitch = pitch, perRow = 5, fullWidth = false, rows = 0 } = {}) {
    const cols = fullWidth ? perRow : Math.min(n, perRow);
    const rws = rows || Math.ceil(n / perRow);
    const m = 0.3;                                                     // keeps the round edges off the SVG clip edge
    const w = (cols - 1) * pitch + d + 2 * m, h = (rws - 1) * rowPitch + d + 2 * m;
    let s = '';
    for (let i = 0; i < n; i++) {
        const cx = m + d / 2 + (i % perRow) * pitch, cy = m + d / 2 + Math.floor(i / perRow) * rowPitch;
        s += solid ? `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(d / 2)}" fill="#000"/>`
            : `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(d / 2 - SW.hair / 2)}" fill="#fff" stroke="#000" stroke-width="${n2(SW.hair)}"/>`;
    }
    return svg(w, h, s);
}

// in-house pictures on a 24 x 24 grid: o = 1.5 pt outline, i = 0.75 pt interior detail
const PICS = {
    star: (o, i) => {
        const pts = Array.from({ length: 10 }, (_, k) => { const r = k % 2 ? 4.9 : 11.2, a = -Math.PI / 2 + k * Math.PI / 5; return `${n2(12 + r * Math.cos(a))},${n2(12.9 + r * Math.sin(a))}`; });
        return `<polygon points="${pts.join(' ')}" ${o}/>`;
    },
    apple: (o, i) => `<path d="M12 8.2C10.2 5.8 3.2 5.6 3.2 12.6C3.2 18.2 7 22.4 9.6 22.4C10.8 22.4 11.2 21.7 12 21.7C12.8 21.7 13.2 22.4 14.4 22.4C17 22.4 20.8 18.2 20.8 12.6C20.8 5.6 13.8 5.8 12 8.2Z" ${o}/><path d="M12 8.2C12 5.8 12.5 3.6 13.6 1.8" ${o}/><path d="M13.2 5.3C14.8 3.1 17.8 2.9 19.2 3.7C18.2 5.9 15.2 6.7 13.2 5.3Z" ${i}/>`,
    fish: (o, i) => `<path d="M1.6 12C5 2.6 13.5 2.4 17.6 10.4L22.4 5.2L22.4 18.8L17.6 13.6C13.5 21.6 5 21.4 1.6 12Z" ${o}/><path d="M8.8 6.4C10.6 9.8 10.6 14.2 8.8 17.6" ${i}/><circle cx="5.6" cy="10.2" r="0.9" fill="#000"/>`,
    ball: (o, i) => `<circle cx="12" cy="12" r="10.6" ${o}/><path d="M5 4.05C9.4 8.4 9.4 15.6 5 19.95" ${i}/><path d="M19 4.05C14.6 8.4 14.6 15.6 19 19.95" ${i}/>`,
};
function pictures(kind, n, { size = 10, pitch = 11.6, rowPitch = 15, perRow = 5 } = {}) {
    const s = size / 24, cols = Math.min(n, perRow), rws = Math.ceil(n / perRow);
    const o = `fill="#fff" stroke="#000" stroke-width="${n2(SW.heavy / s)}" stroke-linejoin="round" stroke-linecap="round"`;
    const i = `fill="none" stroke="#000" stroke-width="${n2(SW.hair / s)}" stroke-linecap="round" stroke-linejoin="round"`;
    let g = '';
    for (let k = 0; k < n; k++) g += `<g transform="translate(${n2((k % perRow) * pitch)} ${n2(Math.floor(k / perRow) * rowPitch)}) scale(${n2(s)})">${PICS[kind](o, i)}</g>`;
    return svg((cols - 1) * pitch + size, (rws - 1) * rowPitch + size, g);
}

// ten frame (RP-10 / RP-11): border 1.5 pt, interior 0.75 pt, solid counters filled left to right, top row first
function tenFrame(n, c = 11, d = 7) {
    const m = SW.heavy / 2, w = 5 * c, h = 2 * c;
    let s = `<rect x="${n2(m)}" y="${n2(m)}" width="${w}" height="${h}" fill="#fff" stroke="#000" stroke-width="${n2(SW.heavy)}"/>`;
    for (let k = 1; k < 5; k++) s += `<line x1="${n2(m + k * c)}" y1="${n2(m)}" x2="${n2(m + k * c)}" y2="${n2(m + h)}" stroke="#000" stroke-width="${n2(SW.hair)}"/>`;
    s += `<line x1="${n2(m)}" y1="${n2(m + c)}" x2="${n2(m + w)}" y2="${n2(m + c)}" stroke="#000" stroke-width="${n2(SW.hair)}"/>`;
    for (let k = 0; k < n; k++) s += `<circle cx="${n2(m + (k % 5 + 0.5) * c)}" cy="${n2(m + (Math.floor(k / 5) + 0.5) * c)}" r="${d / 2}" fill="#000"/>`;
    return svg(w + 2 * m, h + 2 * m, s);
}

const sq = (inner = '', cls = '') => `<span class="p05-sq ${cls}" data-ws-slot="answer" data-ws-shape="box">${inner}</span>`;
const trace = v => `<span class="ws-trace">${v}</span>`;

// ================= A. K one-page lesson: I Can add within 5 =================
// state: 'traced' (Model 1) | 'first' (Guided: first addend in grey, H5 partial trace) | 'blank'
function addCell(a, b, state = 'blank') {
    const t = state === 'traced';
    return `<div class="p05-add">
  <div class="p05-grps">${counters(a, { solid: true, d: 12, pitch: 15 })}${counters(b, { solid: false, d: 12, pitch: 15 })}</div>
  ${sq(t || state === 'first' ? trace(a) : '')}<span class="o">+</span>${sq(t ? trace(b) : '')}<span class="o">=</span>${sq(t ? trace(a + b) : '')}
</div>`;
}
const stepsBox = items => `<div class="p05-stepsbox"><b>Steps:</b>${steps(items)}</div>`;
const lessonK = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 2, tab: ['Level K', 'Addition', 'Lesson 4'], title: 'I Can add within 5' },
    footer: { left: 'add_within_5 · Grade K · K.OA.A.5', right: 'Form A' },
    body: stepsBox(['Count the black counters. Write the number.', 'Count the white counters. Write the number.', 'Count them all. Write the total.'])
        + band('Model:', 'Trace the answer. Say the steps.', grid([addCell(2, 1, 'traced'), addCell(1, 3)], { cols: 2, rows: 1 }), { grow: true })
        + band('Guided Practice:', 'Add.', grid([addCell(3, 1, 'first'), addCell(2, 2, 'first')], { cols: 2, rows: 1 }), { grow: true })
        + band('Independent Practice:', 'Add.', grid([addCell(4, 1), addCell(2, 3)], { cols: 2, rows: 1, labels: 'letter' }), { grow: true }),
    note: '<b>05-A · K one-page lesson (2 Model / 2 Guided / 2 alone).</b> Rounded Steps box, three bands on one sheet. Solid and hollow 12 mm counters (the size-L item size, pitch = item + 3) stand for the two addends (one row, a clear gap between the groups) over the frame box + box = box. Model 1 is traced in grey, Model 2 is blank for the teacher to work live, Guided keeps only the first addend in grey, the last two cells are lettered and scored (Score /2). Objects: plain counters.',
});

// ================= B / C. Count and write, size L, 2 x 4 =================
const COUNT_SET = [['star', 3], ['apple', 5], ['fish', 7], ['ball', 2], ['star', 8], ['apple', 10], ['fish', 6], ['ball', 9]];
const countCell = (pic) => `<div class="p05-count"><div class="p05-pic">${pic}</div>${sq('', 'big')}</div>`;
const countPage = (objects) => page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 8, tab: ['Level K', 'Counting', objects === 'pictures' ? 'Practice A' : 'Practice B'], title: 'I Can count to 10' },
    footer: { left: 'count_objects · Grade K · K.CC.B.5', right: objects === 'pictures' ? 'Form A · pictures' : 'Form A · counters' },
    body: instruction('Count. Write the number.')
        + grid(COUNT_SET.map(([k, n]) => ({ html: countCell(objects === 'pictures' ? pictures(k, n) : counters(n, { d: 9, pitch: 11.6, rowPitch: 15 })), style: 'padding:3mm 3mm 3mm 5mm' })), { cols: 2, rows: 4, labels: 'letter' }),
    note: objects === 'pictures'
        ? '<b>05-B · Count and write — size L, objects: pictures.</b> 2 × 4 side layout: one kind of in-house line-art object per cell (star, apple, fish, ball) in tidy rows of 5, a 24 mm answer square in the same place in every cell. Pictures are 10 mm, the largest a row of 5 allows beside the 24 mm square. Arrangement: rows of 5. Response: write.'
        : '<b>05-C · The same page with objects: plain counters (the age-neutral default).</b> Identical cells, counts and answer squares; solid 9 mm counters in ten-frame order on the same 11.6 mm grid replace the pictures, so the sheet suits an older pupil working at Level K.',
});

// ================= D. Ten frames: I Can make ten =================
const tenCell = n => `<div class="p05-ten">${tenFrame(n)}<div class="p05-eq"><span>${n}</span><span class="o">+</span>${sq()}<span class="o">=</span><span>10</span></div></div>`;
const makeTen = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 6, tab: ['Level K', 'Addition', 'Lesson 9'], title: 'I Can make ten' },
    footer: { left: 'make_ten · Grade K · K.OA.A.4', center: '2/2', right: 'Form A' },
    body: band('Independent Practice:', 'Write the missing number.', grid([6, 8, 5, 7, 9, 4].map(tenCell), { cols: 2, rows: 3, labels: 'letter' }), { grow: true }),
    note: '<b>05-D · Ten frames — make ten.</b> 2 × 3, a 55 × 22 mm frame (1.5 pt border, 0.75 pt interior, 11 mm cells so the pupil can draw the missing counters), solid counters filled top row first, the equation under it with a box for the missing number. Nothing is drawn in the empty cells. Footer 2/2: this is the practice side of a two-page lesson packet.',
});

// ================= E. Trace numerals 0-9 (N = 5, 80 pt) =================
// positions are in 1/1000 em of the digit box (0.586 em wide x 1 em tall): dots = stroke starts, arrows = [from, to, label]
const STROKES = {
    0: { dots: [[293, 245]], arrows: [[[225, 95], [40, 215], [300, 70]]] },
    1: { dots: [[135, 335]], arrows: [[[60, 250], [215, 135], [10, 292]]] },
    2: { dots: [[110, 323]], arrows: [[[20, 220], [150, 105], [-28, 265]]] },
    3: { dots: [[130, 303]], arrows: [[[35, 205], [170, 100], [-12, 250]]] },
    4: { dots: [[156, 229], [405, 363]], arrows: [[[25, 300], [-25, 540], [15, 222]], [[530, 370], [530, 590], [530, 300]]] },
    5: { dots: [[132, 232]], arrows: [[[-8, 300], [-8, 505], [-8, 215]], [[215, 120], [460, 120], [150, 115]]] },
    6: { dots: [[457, 270]], arrows: [[[440, 100], [205, 160], [510, 92]]] },
    7: { dots: [[80, 237]], arrows: [[[110, 120], [370, 120], [45, 118]]] },
    8: { dots: [[293, 243]], arrows: [[[225, 95], [40, 215], [300, 70]]] },
    9: { dots: [[503, 293]], arrows: [[[480, 130], [250, 85], [555, 140]]] },
};
function glyph(d, kind) {           // kind: 'model' | 'trace' | 'dot'
    const S = STROKES[d];
    let o = '';
    if (kind === 'model') S.arrows.forEach(([a, b, n], k) => {
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
        const bx = b[0] - ux * 62, by = b[1] - uy * 62;
        o += `<line x1="${a[0]}" y1="${a[1]}" x2="${n2(bx)}" y2="${n2(by)}" stroke="#000" stroke-width="9.4"/>`
            + `<polygon points="${b[0]},${b[1]} ${n2(bx - uy * 26)},${n2(by + ux * 26)} ${n2(bx + uy * 26)},${n2(by - ux * 26)}" fill="#000"/>`
            + `<text x="${n[0]}" y="${n[1]}" font-family="Andika" font-weight="700" font-size="125" text-anchor="middle" dominant-baseline="central">${k + 1}</text>`;
    });
    S.dots.forEach(([x, y]) => { o += `<circle cx="${x}" cy="${y}" r="50" fill="#000" stroke="#fff" stroke-width="24"/>`; });
    return `<span class="p05-glyph ${kind}"><span class="d${kind === 'trace' ? ' ws-trace' : ''}">${d}</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 586 1000" preserveAspectRatio="none">${o}</svg></span>`;
}
const traceRow = d => ['model', 'trace', 'trace', 'dot', 'dot'].map(k => ({ html: glyph(d, k), cls: 'p05-tr' }));
const reviewRow = digits => digits.map(d => ({ html: glyph(d, 'trace'), cls: 'p05-tr' }));          // last row: the five numerals in counting order
const tracePage = (digits, id, pg) => page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: false, tab: ['Level K', 'Counting', id], title: 'I Can write the numbers 0 to 9' },
    footer: { left: 'numeral_formation · Grade K · K.CC.A.3', center: pg, right: 'N = 5' },
    body: instruction('Trace the number. Then write it.') + grid([...digits.flatMap(traceRow), ...reviewRow(digits)], { cols: 5, rows: 6, labels: 'none' }),
    note: `<b>05-E · Trace numerals ${digits[0]}–${digits[4]} (N = 5, 80 pt).</b> Per row: a black model digit with the start dot and numbered stroke arrows, two grey trace digits with the start dot, then two empty ruled boxes that keep only the start dot. Six rows of 37.2 × 37.8 mm cells (the N = 5 capacity): five numerals, then one row that traces all five in counting order. No cell labels, no Score. 0–9 is a two-sided sheet.`,
});

// ================= F. Hundred chart 1-120 + more-and-less table =================
const BLANKS = new Set([7, 10, 13, 19, 20, 21, 28, 30, 34, 39, 41, 47, 50, 52, 59, 60, 65, 70, 74, 78, 81, 87, 90, 94, 99]);
const GREY = new Set([100, 104, 110, 115, 120]);
const chartCells = Array.from({ length: 120 }, (_, k) => k + 1).map(v => ({
    html: BLANKS.has(v) ? '' : `<span class="p05-cn${GREY.has(v) ? ' ws-trace' : ''}">${v}</span>`, cls: 'p05-cc',
}));
const mlHead = ['10 less', '1 less', 'Number', '1 more', '10 more'];
const mlRow = (v, traced) => [v - 10, v - 1, v, v + 1, v + 10].map((x, k) => cell(k === 2 ? `<span class="p05-cn">${x}</span>` : traced ? `<span class="p05-cn ws-trace">${x}</span>` : '', { cls: 'p05-cc' }));
const moreLess = `<div class="ws-band p05-ml"><div class="ws-strip"><b>More and less:</b><span>Use the chart. Write the missing numbers.</span></div>
<div class="ws-grid fixed" style="grid-template-columns:repeat(5,1fr);grid-template-rows:8mm 12mm 12mm">${mlHead.map(h => cell(`<b class="p05-mh">${h}</b>`, { cls: 'p05-cc' })).join('')}${mlRow(36, true).join('')}${mlRow(72, false).join('')}</div></div>`;
const chart120 = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 29, tab: ['Level 1', 'Counting', 'Chart 120'], title: 'I Can count to 120' },
    footer: { left: 'hundred_chart · Grade 1 · 1.NBT.A.1', right: 'Form A' },
    body: instruction('Write the missing numbers.') + grid(chartCells, { cols: 10, rows: 12, labels: 'none' }) + moreLess,
    note: '<b>05-F · Hundred chart 1–120 with a follow-up band.</b> 10 × 12 ruled cells (18.6 × 15.2 mm), 24 pt digits, 25 targeted blanks at the decade changes and teens; numbers above 99 are never blanked at size L — five of them print in trace grey instead. The 40 mm band is a more-and-less table (first row traced as the model, second row alone). Score = 25 + 4.',
});

// ================= G. Compare two groups (Level 1: numerals + comparison circle) =================
const cmpCell = ([a, b]) => `<div class="p05-cmp">
  <div class="p05-gbox">${counters(a, { solid: true, d: 10, pitch: 13, rowPitch: 13, fullWidth: true, rows: 2 })}</div><span></span><div class="p05-gbox">${counters(b, { solid: false, d: 10, pitch: 13, rowPitch: 13, fullWidth: true, rows: 2 })}</div>
  <span class="p05-num">${a}</span>${circle()}<span class="p05-num">${b}</span>
</div>`;
const compare = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 4, tab: ['Level 1', 'Comparing', 'Practice A'], title: 'I Can compare two groups' },
    footer: { left: 'compare_groups · Grade 1 · 1.NBT.B.3', right: 'Form A' },
    body: instruction('Write <, > or = in the circle.') + grid([[7, 4], [3, 6], [5, 5], [8, 10]].map(cmpCell), { cols: 1, rows: 4, labels: 'letter' }),
    note: '<b>05-G · Compare two groups — 1 × 4 full-width rows.</b> Each group of 10 mm counters sits in its own 72 x 28 mm box in ten-frame order (solid set against hollow set), its numeral prints under it and the 12 mm comparison circle sits between the numerals so the line reads as a number sentence. Level 1 form; the Level K form drops the numerals and the circle (pupil circles a box).',
});

const css = `
.p05-stepsbox { flex: none; display: flex; align-items: center; gap: 5mm; border: var(--ws-heavy) solid var(--ws-ink); border-radius: 3mm; padding: 3mm 5mm; margin: 1.5mm 0 3mm; }
.p05-stepsbox > b { font-size: var(--ws-text); font-weight: 700; }
.p05-sq { display: flex; align-items: center; justify-content: center; width: 16mm; height: 16mm; border: var(--ws-hair) solid var(--ws-ink); font-size: var(--ws-digit); line-height: 1; }
.p05-sq.big { flex: none; width: 24mm; height: 24mm; }
.p05-add { display: grid; grid-template-columns: 16mm 1em 16mm 1em 16mm; column-gap: 2mm; row-gap: 6mm; justify-content: center; align-items: center; margin-top: 6mm; font-size: var(--ws-digit); line-height: 1; }
.p05-add .o { font-weight: 700; text-align: center; grid-row: 2; }
.p05-add .p05-sq { grid-row: 2; }
.p05-grps { grid-row: 1; grid-column: 1 / -1; display: flex; justify-content: center; gap: 10mm; }
.p05-count { width: 100%; display: flex; align-items: center; justify-content: space-between; margin-top: 7mm; }
.p05-pic { height: 36mm; display: flex; align-items: center; }
.p05-ten { display: flex; flex-direction: column; align-items: center; gap: 8mm; margin-top: 8mm; }
.p05-eq { display: flex; align-items: center; justify-content: center; gap: .28em; font-size: var(--ws-digit); line-height: 1; white-space: nowrap; }
.p05-eq .o { font-weight: 700; width: 1em; text-align: center; }
.ws-cell.p05-tr { padding: 0; justify-content: center; }
.p05-glyph { position: relative; display: inline-block; font-size: 80pt; line-height: 1; margin-top: -.06em; }
.p05-glyph .d { display: block; height: 1em; overflow: hidden; }
.p05-glyph.dot .d { visibility: hidden; }
.p05-glyph svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; }
.ws-cell.p05-cc { padding: 0; justify-content: center; }
.p05-cn { font-size: 24pt; line-height: 1; }
.p05-mh { font-size: var(--ws-zone); font-weight: 700; line-height: 1; }
.ws-band.p05-ml { margin-top: 4mm; }
.p05-cmp { display: grid; grid-template-columns: 72mm 25mm 72mm; justify-content: center; justify-items: center; align-items: center; row-gap: 4mm; margin-top: 4mm; }
.p05-gbox { width: 72mm; height: 28mm; border: var(--ws-hair) solid var(--ws-ink); display: flex; align-items: center; justify-content: center; }
.p05-num { font-size: var(--ws-digit); line-height: 1; }
`;

export default doc('05 Level K-1 number sense', [lessonK, countPage('pictures'), countPage('counters'), makeTen, tracePage([0, 1, 2, 3, 4], 'Trace A', '1/2'), tracePage([5, 6, 7, 8, 9], 'Trace B', '2/2'), chart120, compare], css);
