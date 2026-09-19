// 06 · Lesson packet for older pupils — Level 4, "I Can find equivalent fractions" (I Can look, size M).
// A opener · B independent with bars · C independent, pictures gone · D discrimination · E number line · F Test A.
//
// KIT PROPOSALS (nothing in the kit was edited; everything below is local and prefixed .p06-)
//  1. fracBars(list, opts)   — stacked equal-length fraction bars as one SVG (1.5 pt outline, 0.75 pt partitions,
//                              grey shading from the left, optional dotted grey "same length" guide for Model / Guided).
//  2. fracEq(left, right)    — an equation of two stacked fractions whose rows line up, with a B(n) x (Hw + 2) box slot
//                              in the numerator or the denominator position and an optional "x [] ->" factor frame.
//                              The kit's frac() cannot hold a slot and its rows do not align across an equals sign.
//  3. numberLine(opts)       — fraction number line (RP-50): 1.5 pt axis, solid arrowheads, heavy whole ticks, hairline part ticks.
//  4. band() needs a class hook and a "two columns with their own strips" form (Model beside Steps, BD-4 / PT-OPN-2).
//  5. A tick-box decision row helper: checkRow(['Equivalent', 'Not equivalent']); .ws-check should follow the size (5 / 6 / 7 mm).
//  6. A vocabulary-card helper (mini-diagram + bold term + gloss) and an oral-frame line ("Say: ...") for the Model band.
//  7. Instruction library: a decide string for this step is missing — used "Are the fractions equivalent? Tick one box."
//     (same grammar as `decide-regroup`); oral frame "__ is equivalent to __." is also new.
//  8. (reviewer) A drawn relation sign for fraction equations: eqSign('=' | '≠'), two 1.5 pt bars 4.2 mm wide centred on the
//     fraction bar. The set "=" glyph at fraction size was lighter than the fraction bars and got lost between the factor rows.
//  9. (reviewer) numberLine() should take the label size from RP-50: working digit size when the line is the problem, zone size otherwise.
// 10. (reviewer) An oralFrame(text) helper: 8 mm strip at M, 14 mm said-not-written blanks (PT-OPN-5), text centred in the strip.
import { page, instruction, grid, cell, steps, line, doc } from '../kit/kit.mjs';

// ---------- constants (mm) ----------
const PT = 0.3528;
const S = { fine: 0.5 * PT, hair: 0.75 * PT, one: 1 * PT, heavy: 1.5 * PT, rule: 2.25 * PT };
const GREY = '#949494';
const BAR_W = 72, BAR_H = 16, BAR_GAP = 3;
const f2 = n => Number(n.toFixed(2));

const TITLE = 'I Can find equivalent fractions';
const TAB = ['Level 4', 'Fractions', 'Lesson 3'];
const FOOT = 'equivalent · Grade 4 · 4.NF.A.1';
const SHADE_WRITE = 'Shade the fraction. Write the missing number.';
const WRITE = 'Write the missing number.';

// ---------- fraction bars ----------
// one bar at (x, y): shading first, then hairline partitions, then the heavy outline on top
function barMarks(x, y, w, h, parts, shaded) {
    let s = '';
    if (shaded > 0) s += `<rect x="${x}" y="${y}" width="${f2(w * shaded / parts)}" height="${h}" fill="${GREY}"/>`;
    for (let i = 1; i < parts; i++) { const px = f2(x + w * i / parts); s += `<line x1="${px}" y1="${y}" x2="${px}" y2="${y + h}" stroke="#000" stroke-width="${S.hair}"/>`; }
    return s + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-width="${S.heavy}"/>`;
}
// list: [[parts, shaded], ...] stacked, left-aligned, equal length.
// guide = fraction of the length (0..1): a dotted "same length" line, black in the Model, grey in Guided (BD-7).
// region = true: also a dotted grey outline inside the last bar showing the part to shade (first Guided cell only).
function fracBars(list, { w = BAR_W, h = BAR_H, gap = BAR_GAP, guide = null, guideInk = GREY, region = false, over = 3 } = {}) {
    const m = 0.5, top = guide === null ? m : over;
    const H = top * 2 + list.length * h + (list.length - 1) * gap, W = w + m * 2;
    let s = list.map(([p, n], i) => barMarks(m, top + i * (h + gap), w, h, p, n)).join('');
    if (guide !== null) {
        const gx = f2(m + w * guide), dots = `stroke-width="${S.heavy}" stroke-dasharray="0 1.7" stroke-linecap="round"`;
        if (region) { const y = top + (list.length - 1) * (h + gap); s += `<rect x="${m + 1.5}" y="${y + 1.5}" width="${f2(w * guide - 3)}" height="${h - 3}" fill="none" stroke="${GREY}" ${dots}/>`; }
        s += `<line x1="${gx}" y1="0.5" x2="${gx}" y2="${H - 0.5}" stroke="${guideInk}" ${dots}/>`;
    }
    return `<svg class="ws-svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

// ---------- fraction equation ----------
// a side is [numerator, denominator]; a value may be a number, '_' (empty box slot) or { t: n } (box with a grey trace digit)
const isBox = v => v === '_' || (v && typeof v === 'object');
const part = v => v === '_' ? `<span class="p06-box" data-ws-slot="answer" data-ws-shape="box"></span>`
    : typeof v === 'object' ? `<span class="p06-box"><span class="ws-trace">${v.t}</span></span>` : v;
const side = ([n, d], hug) => `<span class="p06-f${hug ? ' hug' : ''}"><span class="n">${part(n)}</span><span class="b"></span><span class="d">${part(d)}</span></span>`;
// the factor arrow: "x", a small scaffold box (or a printed factor), then a hairline arrow, centred on the digits of its row
function arrow(rowH, pad, atTop, factor) {
    const W = 22, y = f2(atTop ? (rowH - pad) / 2 : pad + (rowH - pad) / 2);
    const head = `<path d="M${W - 0.3} ${y} l-2.6 -1.2 v2.4 z" fill="#000"/>`;
    const txt = (x, t, fs = 4.6) => `<text x="${x}" y="${f2(y + fs * 0.352)}" font-family="Andika" font-size="${fs}" font-weight="700" text-anchor="middle">${t}</text>`;
    const mid = factor ? txt(3.2, '×', 5.8) + txt(7.6, factor, 5.2) + `<line x1="12" y1="${y}" x2="${W - 2.4}" y2="${y}" stroke="#000" stroke-width="${S.hair}"/>`
        : txt(2.8, '×', 5.8) + `<rect x="5.6" y="${f2(y - 3.5)}" width="7" height="7" fill="#fff" stroke="#000" stroke-width="${S.hair}"/><line x1="14" y1="${y}" x2="${W - 2.4}" y2="${y}" stroke="#000" stroke-width="${S.hair}"/>`;
    return `<svg class="ws-svg" width="${W}mm" height="${rowH}mm" viewBox="0 0 ${W} ${rowH}">${mid}${head}</svg>`;
}
// the sign between two fractions is drawn, not set: two 1.5 pt bars (INK-10 "equals bars"), 4.2 mm wide, centred on the fraction bar
const eqSign = sign => `<svg class="ws-svg" width="6mm" height="6mm" viewBox="0 0 6 6"><path d="M0.9 2 H5.1 M0.9 4 H5.1${sign === '≠' ? ' M4 0.8 L2 5.2' : ''}" fill="none" stroke="#000" stroke-width="${S.heavy}"/></svg>`;
// opts.frame: true (empty factor boxes) | [top, bottom] printed factors | false.  opts.sign: '=' or '≠'
// Row heights: a row that holds a box slot is Hw + 2 + 1.5 = 11.5 mm. With the factor frame both rows are equal
// (11.5 mm, scaffold boxes or printed factors alike) so the sign has clear air above and below it.
function fracEq(left, right, { frame = false, sign = '=' } = {}) {
    const nbox = isBox(left[0]) || isBox(right[0]), dbox = isBox(left[1]) || isBox(right[1]);
    const mode = frame === true ? 'framed' : frame ? 'printed' : `${nbox ? 'nbox' : ''} ${dbox ? 'dbox' : ''}`;
    const H = 11.5, P = 1.5;
    const fac = Array.isArray(frame) ? frame : [null, null];
    const mid = frame
        ? `<span class="p06-m wide"><span class="n">${arrow(H, P, true, fac[0])}</span><span class="e">${eqSign(sign)}</span><span class="d">${arrow(H, P, false, fac[1])}</span></span>`
        : `<span class="p06-m"><span class="n"></span><span class="e">${eqSign(sign)}</span><span class="d"></span></span>`;
    return `<div class="p06-eq ${mode}">${side(left, !frame)}${mid}${side(right, !frame)}</div>`;
}

// ---------- number line ----------
// from 0 to `wholes`, `parts` equal spaces per whole; only the whole numbers are labelled
function numberLine({ wholes = 1, parts = 4, len = 144 } = {}) {
    const x0 = 9, y = 12, W = len + 18, H = 27, DIGIT = 7.76;   // 22 pt = size M working digit
    let s = `<line x1="2.5" y1="${y}" x2="${W - 2.5}" y2="${y}" stroke="#000" stroke-width="${S.heavy}"/>`
        + `<path d="M0.3 ${y} l3.6 -1.6 v3.2 z M${W - 0.3} ${y} l-3.6 -1.6 v3.2 z" fill="#000"/>`;
    for (let i = 0; i <= wholes * parts; i++) {
        const x = f2(x0 + len * i / (wholes * parts)), whole = i % parts === 0;
        s += `<line x1="${x}" y1="${y - (whole ? 2.5 : 1.5)}" x2="${x}" y2="${y + (whole ? 2.5 : 1.5)}" stroke="#000" stroke-width="${whole ? S.heavy : S.hair}"/>`;
        if (whole) s += `<text x="${x}" y="${y + 10.6}" font-family="Andika" font-size="${DIGIT}" text-anchor="middle">${i / parts}</text>`;
    }
    return `<svg class="ws-svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

// ---------- small parts ----------
const bandOpen = (label, instr = '', cls = '') => `<div class="ws-band ${cls}"><div class="ws-strip"><b>${label}</b><span>${instr}</span></div>`;
const checkRow = words => `<div class="p06-ticks">${words.map(w => `<span><i class="ws-check" data-ws-slot="answer" data-ws-shape="check"></i>${w}</span>`).join('')}</div>`;

// vocabulary mini-diagrams (22 x 18 mm): the named digit is bold and a hairline arrow points at it
function fracPointer(which) {
    const top = which === 'n', ay = top ? 4.6 : 13.6;
    return `<svg class="ws-svg" width="22mm" height="18mm" viewBox="0 0 22 18">
      <text x="6" y="6.7" font-family="Andika" font-size="5.64" font-weight="${top ? 700 : 400}" text-anchor="middle">3</text>
      <line x1="2.4" y1="8.9" x2="9.6" y2="8.9" stroke="#000" stroke-width="${S.heavy}"/>
      <text x="6" y="15.6" font-family="Andika" font-size="5.64" font-weight="${top ? 400 : 700}" text-anchor="middle">4</text>
      <line x1="21.5" y1="${ay}" x2="12.6" y2="${ay}" stroke="#000" stroke-width="${S.hair}"/><path d="M10.4 ${ay} l2.4 -1.1 v2.2 z" fill="#000"/></svg>`;
}
const vocabCard = (pic, term, gloss) => `<div class="p06-vcard">${pic}<div><b>${term}</b><span>${gloss}</span></div></div>`;
const mark = ok => `<svg class="ws-svg" width="7mm" height="7mm" viewBox="0 0 7 7"><path d="${ok ? 'M1.2 3.9 L2.9 5.6 L5.9 1.4' : 'M1.5 1.5 L5.5 5.5 M5.5 1.5 L1.5 5.5'}" fill="none" stroke="#000" stroke-width="${S.heavy}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// the lesson cell: two equal bars above the statement. level 3 = Model (traced), 2 = Guided (grey guide), 1 = Independent
function barCell([n1, d1], d2, level, region = false) {
    const n2 = n1 * d2 / d1;
    const bars = fracBars([[d1, n1], [d2, level === 3 ? n2 : 0]], { guide: level >= 2 ? n1 / d1 : null, guideInk: level === 3 ? '#000' : GREY, region });
    return `<div class="p06-barcell${level === 1 ? ' ind' : ''}">${bars}${fracEq([n1, d1], [level === 3 ? { t: n2 } : '_', d2])}</div>`;
}

// =====================================================================================
// A. OPENER
// =====================================================================================
const opener = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: false, tab: TAB, title: TITLE },
    footer: { left: FOOT, center: '1/5', right: 'Form A' },
    body: [
        bandOpen("What's New:", 'Two fractions can look different and show the same amount.', 'p06-new') + `</div>`,

        bandOpen('Vocabulary:') + `<div class="p06-vocab">
            ${vocabCard(fracPointer('n'), 'numerator', 'the top number')}
            ${vocabCard(fracPointer('d'), 'denominator', 'the bottom number')}
            ${vocabCard(fracBars([[2, 1], [4, 2]], { w: 21, h: 6.5, gap: 2.5 }), 'equivalent', 'the same amount')}
        </div></div>`,

        bandOpen('Rule:', 'Multiply the numerator and the denominator by the same number.') + `<div class="p06-rule">
            <div>${mark(true)}${fracEq([1, 2], [2, 4], { frame: [2, 2] })}</div>
            <div>${mark(false)}${fracEq([1, 2], [2, 6], { frame: [2, 3], sign: '≠' })}</div>
        </div></div>`,

        `<div class="ws-band p06-model"><div class="p06-mrow">
            <div class="p06-mcol"><div class="ws-strip"><b>Model:</b><span>Trace the answer. Say the steps.</span></div>${cell(barCell([1, 2], 4, 3))}</div>
            <div class="p06-scol"><div class="ws-strip"><b>Steps:</b></div><div class="p06-stepbox">${steps([
                'Look at the shaded part of the first bar.', 'Shade the same amount on the second bar.', 'Count the shaded parts.', 'Write the missing number.'])}</div></div>
          </div>
          <div class="p06-say">Say: “${line(1, 'M')} is equivalent to ${line(1, 'M')}.”</div></div>`,

        bandOpen('Guided Practice:', SHADE_WRITE, 'grow') + grid([barCell([1, 2], 6, 2, true), barCell([1, 4], 8, 2)], { cols: 2, rows: 1 }) + `</div>`,
    ].join(''),
    note: '<b>06-A · Lesson opener — I Can look, size M.</b> Bands on: What’s New, Vocabulary (3 terms, each with a mini-diagram), Rule (one sentence, one example, one non-example), Model beside Steps, oral frame, Guided Practice (2 cells). Model and Guided cells are unlabelled and unscored, so Score is off. Model: both bars shaded, answer in grey trace, dotted “same length” guide in black. Guided: the guide turns grey; the first cell also dots the part to shade, the second does not (fade inside the band). The second bar and the box are the pupil’s.',
});

// =====================================================================================
// B. INDEPENDENT 2 x 3 — bars given, second bar for the pupil to shade
// =====================================================================================
const indB = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 6, tab: TAB, title: TITLE },
    footer: { left: FOOT, center: '2/5', right: 'Form A' },
    body: bandOpen('Independent Practice:', SHADE_WRITE, 'grow')
        + grid([[[1, 3], 6], [[1, 2], 8], [[3, 4], 8], [[2, 5], 10], [[1, 4], 12], [[5, 6], 12]].map(([f, d]) => barCell(f, d, 1)), { cols: 2, rows: 3, labels: 'letter' }) + `</div>`,
    note: '<b>06-B · Independent page, 2 × 3, with pictures.</b> Each cell: two equal-length bars (the second is empty for the pupil to shade) above the statement with a box slot in the numerator position. The dotted guide from the opener is gone. Same instruction string as Guided. Quiet letters a.–f.',
});

// =====================================================================================
// C. INDEPENDENT 2 x 4 — the planned fade: pictures gone, factor frame instead
// =====================================================================================
const fadeItems = [[[1, 2], ['_', 10]], [[2, 3], ['_', 12]], [[3, 4], [6, '_']], [[1, 5], [2, '_']],
    [[3, 5], ['_', 10]], [[1, 6], [2, '_']], [['_', 3], [4, 6]], [[1, '_'], [3, 12]]];
const indC = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 8, tab: TAB, title: TITLE },
    footer: { left: FOOT, center: '3/5', right: 'Form A' },
    body: bandOpen('Independent Practice:', WRITE, 'grow')
        + grid(fadeItems.map(([l, r]) => `<div class="p06-eqcell">${fracEq(l, r, { frame: true })}</div>`), { cols: 2, rows: 4, labels: 'letter', start: 7 }) + `</div>`,
    note: '<b>06-C · Independent page, 2 × 4, pictures gone (the planned fade).</b> The bars are replaced by the Rule band’s factor frame: a hairline arrow with “×” and a small scaffold box above and below the equals sign; the pupil writes the factor, then the missing number in the answer box. Unknown in the numerator, the denominator and (last row) on the left. Letters run on g.–n.',
});

// =====================================================================================
// D. DISCRIMINATION 2 x 4 — "Are they equivalent?"
// =====================================================================================
// answers: a E · b N (+1 top and bottom) · c N (x2 top, x3 bottom) · d E · e N (+2 top and bottom) · f E · g E · h N (x2 bottom only)
// -> neither column and neither row is all one answer, so there is no pattern to spot
const pairs = [[[1, 2], [2, 4]], [[1, 3], [2, 4]], [[3, 4], [6, 12]], [[2, 3], [4, 6]], [[2, 5], [4, 7]], [[1, 4], [2, 8]], [[3, 5], [6, 10]], [[1, 2], [1, 4]]];
const fracBig = ([n, d]) => `<span class="p06-f p06-solo"><span class="n">${n}</span><span class="b"></span><span class="d">${d}</span></span>`;
const decideCell = ([a, b]) => `<div class="p06-decide">
    <div class="p06-pair">${fracBig(a)}${fracBars([[a[1], a[0]]], { w: 62 })}${fracBig(b)}${fracBars([[b[1], b[0]]], { w: 62 })}</div>
    ${checkRow(['Equivalent', 'Not equivalent'])}</div>`;
const decide = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 8, tab: TAB, title: TITLE },
    footer: { left: FOOT, center: '4/5', right: 'Form A' },
    body: instruction('Are the fractions equivalent? Tick one box.') + grid(pairs.map(decideCell), { cols: 2, rows: 4, labels: 'letter' }),
    note: '<b>06-D · Discrimination page, 2 × 4 (decide only).</b> Two fractions, each beside its own bar (side-by-side fraction + model, equal-length bars stacked so the shading can be compared). One decision per cell: tick “Equivalent” or “Not equivalent”, always in the same place. Half the items are non-examples built from real slips (add the same number to top and bottom; multiply top and bottom by different numbers; multiply only the bottom). The answers are ordered so that no row or column is all one answer. Sub-skill page, so letters restart at a.',
});

// =====================================================================================
// E. NUMBER LINE — 4 full-width rows
// =====================================================================================
const lines = [[[3, 4], { parts: 4 }], [[1, 2], { parts: 6 }], [[2, 3], { parts: 6 }], [[3, 2], { wholes: 2, parts: 4 }]];
const lineCell = ([f, o]) => `<div class="p06-nl">${fracBig(f)}${numberLine(o)}</div>`;
const numline = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 4, tab: TAB, title: TITLE },
    footer: { left: FOOT, center: '5/5', right: 'Form A' },
    body: instruction('Mark the number on the line.') + grid(lines.map(lineCell), { cols: 1, rows: 4, labels: 'letter' }),
    note: '<b>06-E · Number-line page, 4 full-width rows.</b> Target fraction at the left, level with the axis; 1.5 pt axis with solid arrowheads, heavy whole ticks labelled at working digit size (0, 1 and, in row d, 2; RP-50), hairline part ticks, nothing else labelled. Row a is direct; rows b–d are cut into a multiple of the denominator, so the pupil must use an equivalent fraction to find the tick. Row d runs from 0 to 2. Bridging-representation sub-skill page, so letters restart at a.',
});

// =====================================================================================
// F. TEST A — 12 items, open array
// =====================================================================================
const testItems = [[[1, 2], ['_', 6]], [[1, 3], ['_', 12]], [[2, 5], [4, '_']], [[3, 4], ['_', 12]], [[1, 4], [2, '_']], [[5, 6], [10, '_']],
    [[2, 3], ['_', 6]], [[1, 2], [5, '_']], [[3, 5], ['_', 10]], [['_', 2], [4, 8]], [[3, '_'], [6, 8]], [[4, 5], [8, '_']]];
const testA = page({
    look: 'ican', size: 'M', tab: 5,
    header: { score: 12, tab: ['Level 4', 'Fractions', 'Test A'], title: 'Test A: equivalent fractions' },
    footer: { left: FOOT, center: '1/1', right: 'Form A' },
    body: instruction(WRITE) + grid(testItems.map(([l, r]) => `<div class="p06-eqcell">${fracEq(l, r, { frame: true })}</div>`), { cols: 3, rows: 4, labels: 'letter', cls: 'open' }),
    note: '<b>06-F · Test A — 12 items, size M, open array (3 × 4).</b> Outer frame only, quiet letters a.–l., Score /12. Same cell as the faded Independent page: hints are off, the factor frame stays as a structural support (“keep structural supports on tests” ticked). The unknown appears in every position.',
});

// ---------- local CSS ----------
const css = `
/* fraction equation: rows line up across the sign; box slot = B(n) x (Hw + 2) */
.p06-eq { display: inline-flex; align-items: stretch; font-size: var(--ws-frac); line-height: 1; }
.p06-f { display: flex; flex-direction: column; align-items: center; min-width: 9mm; font-size: var(--ws-frac); line-height: 1; }
.p06-f .n, .p06-f .d, .p06-m .n, .p06-m .d { display: flex; align-items: center; justify-content: center; height: 8mm; }
.p06-f .n, .p06-f .d { padding-left: 1mm; padding-right: 1mm; }
.p06-f .n, .p06-m .n { padding-bottom: .6mm; } .p06-f .d, .p06-m .d { padding-top: .6mm; }
.p06-eq.nbox .n, .p06-eq.framed .n, .p06-eq.printed .n { height: 11.5mm; padding-bottom: 1.5mm; } .p06-eq.dbox .d, .p06-eq.framed .d, .p06-eq.printed .d { height: 11.5mm; padding-top: 1.5mm; }
.p06-f.hug .n { align-items: flex-end; } .p06-f.hug .d { align-items: flex-start; }      /* printed digits sit close to the bar */
.p06-f .b { align-self: stretch; height: 0; border-top: var(--ws-heavy) solid var(--ws-ink); }
.p06-m { display: flex; flex-direction: column; align-items: center; width: 10mm; }
.p06-m.wide { width: 25mm; }
.p06-m .n, .p06-m .d { padding-left: 0; padding-right: 0; }
.p06-m .e { position: relative; align-self: stretch; height: var(--ws-heavy); }
.p06-m .e > svg { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
.p06-box { display: flex; align-items: center; justify-content: center; width: 14mm; height: calc(var(--ws-hw) + 2mm); border: var(--ws-hair) solid var(--ws-ink); }

/* cells */
.p06-barcell { display: flex; flex-direction: column; align-items: center; gap: 3mm; }
.p06-barcell.ind { gap: 6mm; }
.p06-eqcell { margin-top: 4mm; }
.p06-decide { width: 100%; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
.p06-pair { display: grid; grid-template-columns: 12mm auto; column-gap: 6mm; row-gap: 3mm; align-items: center; margin-left: 3mm; }
.p06-ticks { display: flex; gap: 10mm; font-size: var(--ws-text); line-height: 1; padding-bottom: 1mm; }
.p06-ticks span { display: flex; align-items: center; white-space: nowrap; }
.p06-ticks .ws-check { width: 6mm; height: 6mm; margin-right: 2mm; }
.p06-nl { width: 100%; display: flex; align-items: center; gap: 5mm; padding-left: 7mm; margin-top: 10mm; }
.p06-nl .p06-solo { margin-top: -3mm; }   /* fraction bar level with the axis (axis is 1.5 mm above the SVG's middle) */

/* opener bands */
.p06-new .ws-strip { min-height: 8mm; }
.p06-vocab { display: grid; grid-template-columns: repeat(3, 1fr); border-top: var(--ws-heavy) solid var(--ws-ink); }
.p06-vcard { display: flex; align-items: center; gap: 2.5mm; padding: 2mm 3mm; min-width: 0; }
.p06-vcard + .p06-vcard { border-left: var(--ws-hair) solid var(--ws-ink); }
.p06-vcard > svg { flex: none; }
.p06-vcard > div { display: flex; flex-direction: column; gap: .8mm; font-size: var(--ws-text); line-height: 1.2; }
.p06-vcard b { font-weight: 700; }
.p06-rule { display: grid; grid-template-columns: 1fr 1fr; border-top: var(--ws-heavy) solid var(--ws-ink); }
.p06-rule > div { display: flex; align-items: center; justify-content: center; gap: 5mm; padding: 1.5mm 3mm; }
.p06-rule > div + div { border-left: var(--ws-hair) solid var(--ws-ink); }
.p06-mrow { display: grid; grid-template-columns: minmax(0, 57fr) minmax(0, 43fr); }
.p06-mcol, .p06-scol { display: flex; flex-direction: column; min-width: 0; }
.p06-scol { border-left: var(--ws-heavy) solid var(--ws-ink); }
.p06-mrow .ws-strip { border-bottom: var(--ws-heavy) solid var(--ws-ink); }
.p06-mcol .ws-cell { flex: 1; }
.p06-stepbox { margin: 3mm; padding: 3mm; flex: 1; border: var(--ws-hair) solid var(--ws-ink); border-radius: 3mm; display: flex; flex-direction: column; justify-content: center; }
.p06-stepbox .ws-steps { gap: 3mm; line-height: 1.25; }
.p06-say { border-top: var(--ws-heavy) solid var(--ws-ink); height: 8mm; padding: 0 3mm; font-size: var(--ws-text); line-height: 7.4mm; white-space: nowrap; overflow: hidden; }
.p06-say .ws-line { width: 14mm; height: 4.5mm; margin: 0 1mm; vertical-align: baseline; }   /* oral frame: said, not written (PT-OPN-5: 14 mm blanks) */
`;

export default doc('06 Lesson packet, Level 4: equivalent fractions', [opener, indB, indC, decide, numline, testA], css);
