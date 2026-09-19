// Daily review pages (Daily look): Daily Spiral Review spread, Mixed Skill Practice (grouped and
// shuffled), Today's Number (two sides) and Daily 4.
//
// KIT PROPOSALS (nothing in the kit was edited; everything below lives in this file as .p08-*)
//  1. instruction() and band() escape their text, so the library strings that carry an underline
//     ("Look at the _sign_.") or a "<" cannot be passed. Proposal: accept trusted HTML, or a tiny
//     markup (_word_ -> <u>). Local: instrRaw(), shelf().
//  2. A "titled section" part for the Daily look (BD-6): bold sentence-case title + instruction on one
//     baseline, under a 2.25 pt rule, holding hairline item cells. Local: sec() / .p08-sec.
//  3. grid() always appends a blank-run cell when cells < cols x rows, so it cannot hold spanning
//     cells (mixed-practice 2 x 2 blocks). Proposal: grid({ spans:true }) or a lattice() helper
//     that takes explicit row / column placement. Local: lattice().
//  4. dayBand() hard-codes a 10 mm strip (the L value). Proposal: read --ws-daystrip 7 / 8 / 10.
//     Local: day4Band().
//  5. Representations to promote into the kit: clock(h, m, D), coin(v, scale), timeSlot(),
//     numberLine(), track() (RP-54 number track), cross() (more / less puzzle), wordProblem()
//     (story box + work space + number-and-label slot), fraction shapes, base-ten key.
//     ONE clock for the whole pack: 08, 10 and 12 each carry a copy; 08 and 10 now agree (hands 0.47 R / 0.30 R,
//     numerals 0.12 D untouched), 12 passes a 0.85 R hand behind haloed numerals. The owner should pick one and
//     RP-101 should be rewritten to match (0.78 R strikes through the numeral at every five-minute time).
//  6. A cue() label part for shuffled mixed practice (text beside the tab, PT-MIX-5).
//  7. Library gap: half-width spiral sections allow 20 characters of instruction, but `coins`
//     ("Count the coins. Write the total.") is 33. Proposal: compact keys `coins-short`
//     "Write the total." and `boxes` "Fill in the boxes."
import { page, grid, cell, label, stack, fact, equation, frac, steps, doc } from '../kit/kit.mjs';

// ---------- units: SVG is drawn in mm; strokes are the allowed point weights ----------
const PT = 0.3528, S05 = 0.5 * PT, S075 = 0.75 * PT, S1 = PT, S15 = 1.5 * PT, S225 = 2.25 * PT;
const f = n => Number(n.toFixed(3));
const svg = (w, h, inner) => `<svg class="ws-svg" xmlns="http://www.w3.org/2000/svg" width="${f(w)}mm" height="${f(h)}mm" viewBox="0 0 ${f(w)} ${f(h)}">${inner}</svg>`;
const txt = (x, y, s, sizeMm, weight = 700, anchor = 'middle') =>
    `<text x="${f(x)}" y="${f(y + sizeMm * 0.36)}" font-family="Andika" font-weight="${weight}" font-size="${f(sizeMm)}" text-anchor="${anchor}" fill="#000">${s}</text>`;

// ---------- representations ----------
// RP-100 analog face, drawn exactly as the pack's time page (10-visual-grids) draws it, so a pupil meets one clock
// everywhere: true-D rim on a D + 1 canvas (the rim stroke is never clipped), numerals 0.12 D on 0.66 R.
// DEPARTURES FROM RP-101, shared with 10-visual-grids: plain round hand ends (pack brief: no arrow tips), and hands of
// 0.47 R (minute) and 0.30 R (hour) instead of 0.78 R and 0.46 R. At 0.78 R the minute hand is struck through its
// numeral at every five-minute time (the first build printed 4:35 with the 7 crossed out and 10:10 with the 2 crossed
// out). At 0.47 R the hand points at its numeral and stops short of it; nothing on the face touches a numeral.
const MIN_HAND = 0.47, HOUR_HAND = 0.30;
function clock(h, m, D) {
    const c = (D + 1) / 2, R = D / 2;
    const pol = (deg, r) => [c + r * Math.sin(deg * Math.PI / 180), c - r * Math.cos(deg * Math.PI / 180)];
    let s = `<circle cx="${c}" cy="${c}" r="${f(R)}" fill="#fff" stroke="#000" stroke-width="${S15}"/><circle cx="${c}" cy="${c}" r="${f(R * 0.9)}" fill="none" stroke="#000" stroke-width="${S05}"/>`;
    for (let i = 0; i < 60; i++) {
        const five = i % 5 === 0, [x1, y1] = pol(i * 6, R * 0.9), [x2, y2] = pol(i * 6, R * (five ? 0.8 : 0.85));
        s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#000" stroke-width="${five ? S075 : S05}"/>`;
    }
    for (let n = 1; n <= 12; n++) { const [x, y] = pol(n * 30, R * 0.66); s += txt(x, y, n, D * 0.12); }
    const hand = (deg, len, sw) => { const [x, y] = pol(deg, R * len); return `<line x1="${c}" y1="${c}" x2="${f(x)}" y2="${f(y)}" stroke="#000" stroke-width="${sw}" stroke-linecap="round"/>`; };
    s += hand(30 * (h % 12) + 0.5 * m, HOUR_HAND, S225) + hand(6 * m, MIN_HAND, S15) + `<circle cx="${c}" cy="${c}" r="1" fill="#000"/>`;
    return svg(D + 1, D + 1, s);
}
// section 6 time slot: two boxes with a printed colon between
const timeSlot = () => `<span class="p08-time" data-ws-slot="answer" data-ws-shape="time"><i></i><b>:</b><i></i></span>`;

// RP-110..113 generic coins: a double ring and a value, true relative sizes
const COIN_D = { 1: 19.05, 5: 21.21, 10: 17.91, 25: 24.26 };
function coin(v, scale = 1) {
    const D = COIN_D[v] * scale, c = D / 2, r = c - S15 / 2;
    return svg(D, D, `<circle cx="${f(c)}" cy="${f(c)}" r="${f(r)}" fill="#fff" stroke="#000" stroke-width="${S15}"/><circle cx="${f(c)}" cy="${f(c)}" r="${f(r * 0.88)}" fill="none" stroke="#000" stroke-width="${S05}"/>${txt(c, c, v, 0.4 * D / 0.78)}`);
}
const coinRow = (values, scale) => `<div class="p08-coins">${values.map(v => coin(v, scale)).join('')}</div>`;

// fraction models to shade: 1.5 pt outline, 0.75 pt partitions
function shape(kind, parts, W = 26) {
    const o = S15 / 2;
    if (kind === 'bar') {
        const H = W * 0.62; let s = `<rect x="${o}" y="${o}" width="${f(W - S15)}" height="${f(H - S15)}" fill="#fff" stroke="#000" stroke-width="${S15}"/>`;
        for (let i = 1; i < parts; i++) { const x = o + (W - S15) * i / parts; s += `<line x1="${f(x)}" y1="${o}" x2="${f(x)}" y2="${f(H - o)}" stroke="#000" stroke-width="${S075}"/>`; }
        return svg(W, H, s);
    }
    const c = W / 2, R = c - o, pts = Array.from({ length: parts }, (_, i) => [c + R * Math.sin(i * 2 * Math.PI / parts), c - R * Math.cos(i * 2 * Math.PI / parts)]);
    const spokes = pts.map(([x, y]) => `<line x1="${c}" y1="${c}" x2="${f(x)}" y2="${f(y)}" stroke="#000" stroke-width="${S075}"/>`).join('');
    const rim = kind === 'circle' ? `<circle cx="${c}" cy="${c}" r="${f(R)}" fill="#fff" stroke="#000" stroke-width="${S15}"/>`
        : `<polygon points="${pts.map(p => p.map(f).join(',')).join(' ')}" fill="#fff" stroke="#000" stroke-width="${S15}" stroke-linejoin="miter"/>`;
    return svg(W, W, rim + spokes);
}

// fraction of a set: tidy rows of outlined counters (RP-21)
function counterSet(rows, cols, d = 7, gap = 3) {
    const W = cols * d + (cols - 1) * gap, H = rows * d + (rows - 1) * gap; let s = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<circle cx="${f(d / 2 + c * (d + gap))}" cy="${f(d / 2 + r * (d + gap))}" r="${f(d / 2 - S1 / 2)}" fill="#fff" stroke="#000" stroke-width="${S1}"/>`;
    return svg(W, H, s);
}

// RP-30 gridded base-ten blocks for the key
function block(w, h, u) {
    const W = w * u, H = h * u, o = S075 / 2; let s = `<rect x="${o}" y="${o}" width="${f(W - S075)}" height="${f(H - S075)}" fill="#fff" stroke="#000" stroke-width="${S075}"/>`;
    for (let i = 1; i < w; i++) s += `<line x1="${f(i * u)}" y1="0" x2="${f(i * u)}" y2="${f(H)}" stroke="#000" stroke-width="${S05}"/>`;
    for (let j = 1; j < h; j++) s += `<line x1="0" y1="${f(j * u)}" x2="${f(W)}" y2="${f(j * u)}" stroke="#000" stroke-width="${S05}"/>`;
    return svg(W, H, s);
}
const blocksKey = u => `<div class="p08-key"><b>Key</b><div><figure>${block(10, 10, u)}<figcaption>100</figcaption></figure><figure>${block(1, 10, u)}<figcaption>10</figcaption></figure><figure>${block(1, 1, u)}<figcaption>1</figcaption></figure></div></div>`;

// RP-50 number line: 1.5 pt axis, arrowheads at both ends, heavy labelled ticks, hairline part ticks
function numberLine(lo, hi, step, labelled, W = 128, sizePt = 15) {
    const y = 5, x0 = 10, x1 = W - 10, fs = sizePt * PT; let s = `<line x1="3" y1="${y}" x2="${W - 3}" y2="${y}" stroke="#000" stroke-width="${S15}"/>`;
    s += `<polygon points="0.4,${y} 4,${y - 1.7} 4,${y + 1.7}" fill="#000"/><polygon points="${W - 0.4},${y} ${W - 4},${y - 1.7} ${W - 4},${y + 1.7}" fill="#000"/>`;
    for (let v = lo; v <= hi; v += step) {
        const x = x0 + (v - lo) / (hi - lo) * (x1 - x0), big = labelled.includes(v), t = big ? 2.5 : 1.5;
        s += `<line x1="${f(x)}" y1="${y - t}" x2="${f(x)}" y2="${y + t}" stroke="#000" stroke-width="${big ? S15 : S075}"/>`;
        if (big) s += txt(x, y + 2.5 + 1.4 + fs * 0.36, v, fs, 700);
    }
    return svg(W, y + 2.5 + 1.4 + fs * 0.8 + 0.6, s);
}

// RP-54 number track: rounded strip, hairline dividers, empty entries are the pupil's
const track = (vals, w, h) => `<div class="p08-track" style="--tw:${w}mm;--th:${h}mm">${vals.map(v => v === null ? '<span data-ws-slot="answer" data-ws-shape="box"></span>' : `<span>${v}</span>`).join('')}</div>`;

// more / less puzzle: the hundred-chart directions (left 1 less, right 1 more, up 10 less, down 10 more);
// with `hundred` the row grows to 100 less ... 100 more, still reading smallest to largest
function cross(n, { hundred = false, bw, bh, numPt, rowGap = 2.5 }) {
    const mid = hundred ? 3 : 2;
    const arm = (r, c, cap) => `<div class="p08-cx" style="grid-area:${r}/${c}"><small>${cap}</small><i data-ws-slot="answer" data-ws-shape="box"></i></div>`;
    return `<div class="p08-cross" style="--bw:${bw}mm;--bh:${bh}mm;--np:${numPt}pt;--rg:${rowGap}mm">${arm(1, mid, '10 less')}${hundred ? arm(2, 1, '100 less') : ''}${arm(2, mid - 1, '1 less')}
        <div class="p08-cx mid" style="grid-area:2/${mid}"><small>&nbsp;</small><b>${n}</b></div>${arm(2, mid + 1, '1 more')}${hundred ? arm(2, 5, '100 more') : ''}${arm(3, mid, '10 more')}</div>`;
}

const arrow = (w = 9) => svg(w, 4, `<line x1="0.3" y1="2" x2="${w - 2.6}" y2="2" stroke="#000" stroke-width="${S1}" stroke-linecap="round"/><polygon points="${w - 0.2},2 ${w - 3.2},0.5 ${w - 3.2},3.5" fill="#000"/>`);
const slotBox = (w, h) => `<span class="ws-box" style="--w:${w}mm;height:${h}mm" data-ws-slot="answer" data-ws-shape="box"></span>`;

// word-problem band, v2 form (P-RV-12): story box, open work space, number-and-label slot
function wordProblem(lines, { workW, numW, labW }) {
    return `<div class="p08-wp"><div class="p08-wpstory"><div class="ws-story">${lines.join('<br>')}</div></div>
      <div class="p08-wpwork" style="width:${workW}mm"><small>Work space</small>
        <div class="p08-wpans" data-ws-slot="answer" data-ws-shape="unit-open"><span><i style="width:${numW}mm"></i><small>number</small></span><span><i style="width:${labW}mm"></i><small>label</small></span></div></div></div>`;
}

// ---------- local layout parts ----------
const instrRaw = html => `<div class="ws-instrline">${html}</div>`;
const SIGN = 'Add or subtract. Look at the <u>sign</u>.';
// kit band with a trusted-HTML instruction and a flex weight
const shelf = (title, instrHtml, content, weight = 1) =>
    `<div class="ws-band grow" style="flex-grow:${weight}"><div class="ws-strip"><b>${title}</b><span>${instrHtml}</span></div>${content}</div>`;
// BD-6 titled section with hairline item cells
const sec = (title, instrHtml, cells, { cols = 1, rows = 1, span = false } = {}) =>
    `<div class="p08-sec"${span ? ' style="grid-column:1/-1"' : ''}><div class="p08-sstrip"><b>${title}</b><span>${instrHtml}</span></div>
     <div class="p08-items" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)">${cells.join('')}</div></div>`;
const tabCell = (n, html, cls = '', style = '') => cell(html, { label: label('tab', n), cls, style });
// explicit-placement unit lattice for shuffled mixed practice
const lattice = (cells, cols, rows) => `<div class="ws-grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)">${cells.join('')}</div>`;
const cue = text => `<span class="p08-cue">${text}</span>`;
// Today's Number band: tab, bold title + instruction on the first line, then the work area
const tband = (n, title, instrHtml, work, weight = 1, workCls = '') =>
    cell(`<div class="p08-tline"><b>${title}</b><span>${instrHtml}</span></div><div class="p08-work ${workCls}">${work}</div>`, { label: label('tab', n), cls: 'p08-tband', style: `flex:${weight} 1 0` });

// =====================================================================================
// A + B. DAILY SPIRAL REVIEW — two-page spread, Level 3, Week 2 - Day 4
// =====================================================================================
const SPIRAL_TAB = ['Level 3', 'Week 2 - Day 4'];
const comp = [[368, 257, '+'], [542, 176, '-'], [275, 548, '+'], [731, 364, '-'], [486, 239, '+'], [650, 283, '-'], [159, 674, '+'], [804, 526, '-']];
const compCells = comp.map(([a, b, op]) => stack(a, b, op, { T: 4, regroup: op === '+' ? 'add' : 'sub' }));
const badgeCell = {
    nolabel: true, cls: 'p08-refcell',
    html: `<div class="p08-badge">Week 2 · Day 4</div><div class="p08-remember"><b>Remember</b>${steps(['Look at the sign.', 'Start with the ones.', 'Regroup if you need to.'])}</div>`,
};
compCells.splice(2, 0, badgeCell);

const spiral1 = page({
    look: 'daily', size: 'L', tab: 6,
    header: { score: 24, tab: SPIRAL_TAB, title: 'Daily review' },
    footer: { left: 'Daily review · L3-W2-D4 · Grade 3 · 3.NBT.A.2', center: '1/2', right: 'Week 2 · Day 4' },
    body: shelf('Computation', SIGN, grid(compCells, { cols: 3, rows: 3, labels: 'tab' })),
    note: '<b>08-A · Daily Spiral Review, page 1 of the spread — Daily look, size L.</b> 3 × 3 heavy grid: eight three-digit add / subtract cells with black tabs and regroup boxes; slot 3 (top right) is the outlined Week · Day badge over the rounded Remember box (PT-DSR-4). Two-line strand tab. Score /24 counts both pages.',
});

let n = 9;
const wpSpiral = tabCell(n++, wordProblem(['Mia has 235 stickers.', 'Omar gives her 148 more.', 'How many stickers does Mia have now?'], { workW: 80, numW: 20, labW: 46 }), 'p08-wpcell');
const timeCells = [[4, 35], [10, 10]].map(([h, m]) => tabCell(n++, clock(h, m, 38) + timeSlot(), 'p08-clockcell p08-tight'));
const fracCells = [['circle', 4, 3], ['bar', 3, 2], ['hex', 6, 5]].map(([k, d, num]) => tabCell(n++, `${frac(num, d)}<div class="p08-shape">${shape(k, d, 25)}</div>`, 'p08-fraccell'));
const coinCells = [[25, 10, 5], [25, 25, 10]].map(v => tabCell(n++, `<div class="p08-coinrow">${coinRow(v, 0.8)}${slotBox(17, 10)}</div>`, 'p08-coincell'));
const puzzleCells = [58, 472].map(v => tabCell(n++, cross(v, { bw: 13, bh: 10, numPt: 13 }), 'p08-pzcell'));
const roundCells = [47, 83, 265].map(v => tabCell(n++, `<div class="p08-round"><span class="p08-num">${v}</span>${arrow()}${slotBox(20, 10)}</div>`, 'p08-rowcell'));
const patCells = [[12, 15, 18, null, null, 27], [20, 24, null, 32, null, null], [215, 315, null, null, 615, null]].map(v => tabCell(n++, track(v, 12.8, 11), 'p08-rowcell p08-left'));

const spiral2 = page({
    look: 'daily', size: 'M', tab: 5,
    header: { date: false, score: false, tab: SPIRAL_TAB, title: '' },
    footer: { left: 'Daily review · L3-W2-D4 · Grade 3 · 3.OA.D.8 · 3.MD.A.1 · 3.NF.A.1 · 2.MD.C.8 · 2.NBT.B.8 · 3.NBT.A.1 · 3.OA.D.9', center: '2/2', right: 'Week 2 · Day 4' },
    body: `<div class="p08-spread">
        ${sec('Word problem', 'Solve. Write the number and the label.', [wpSpiral], { span: true })}
        ${sec('Telling time', 'Write the time.', timeCells, { cols: 2 })}${sec('Fraction models', 'Shade the fraction.', fracCells, { cols: 3 })}
        ${sec('Counting coins', 'Write the total.', coinCells, { rows: 2 })}${sec('Number puzzle', 'Fill in the boxes.', puzzleCells, { cols: 2 })}
        ${sec('Rounding', 'Round to the nearest ten.', roundCells, { rows: 3 })}${sec('Patterns', 'Write the missing numbers.', patCells, { rows: 3 })}</div>`,
    note: '<b>08-B · Daily Spiral Review, page 2 — fixed titled sections.</b> Plain bold sentence-case titles with the instruction on the same line under a 2.25 pt rule; hairline item cells inside each section; black tabs continue 9–24 from page 1. Size M on this side: the half-width titles and library instructions do not share one line at L. Name-only header (no title) so the body is 245 mm. Item counts were cut (3 fraction models, 2 puzzles, 3 rounding rows) rather than shrinking anything. <b>Departs from RP-101</b> (as 10-visual-grids does): plain hand ends, hands 0.47 R and 0.30 R, so the minute hand points at its numeral and never strikes it through.',
});

// =====================================================================================
// C + D. MIXED SKILL PRACTICE — size M, Daily look, N = 6 units (31 mm); the same ten problems
// =====================================================================================
const sums = [[368, 257], [486, 239], [275, 548]], times = [[4, 35], [10, 10], [7, 50]], sets = [[1, 2, 2, 4], [2, 3, 2, 3], [3, 4, 2, 4]];
const mixStory = ['Lina picks 126 apples.', 'Noor picks 58 apples.', 'How many apples do they pick in all?'];
const sumCell = ([a, b]) => stack(a, b, '+', { T: 4 });
const clockCell = D => ([h, m]) => ({ html: clock(h, m, D) + timeSlot(), cls: 'p08-clockcell' });
const setCell = ([num, den, rows, cols]) => ({ html: `<div class="p08-set">${frac(num, den)}${counterSet(rows, cols)}</div>`, cls: 'p08-setcell' });
const mixWp = { html: wordProblem(mixStory, { workW: 84, numW: 20, labW: 46 }), cls: 'p08-wpcell' };
const MIX_FOOT = 'Grade 3 · 3.NBT.A.2 · 3.MD.A.1 · 3.NF.A.1 · 3.OA.D.8';

const mixedGrouped = page({
    look: 'daily', size: 'M', tab: 5,
    header: { score: 10, tab: ['Level 3', 'Mixed 1'], title: 'Mixed practice' },
    footer: { left: `Mixed 1 · grouped · ${MIX_FOOT}`, right: 'Form A' },
    body: shelf('Addition', 'Add.', grid(sums.map(sumCell), { cols: 3, rows: 1, labels: 'tab', start: 1 }), 54)
        + shelf('Time', 'Write the time.', grid(times.map(clockCell(44)), { cols: 3, rows: 1, labels: 'tab', start: 4 }), 70)
        + shelf('Fractions', 'Shade the fraction.', grid(sets.map(setCell), { cols: 3, rows: 1, labels: 'tab', start: 7 }), 38)
        + shelf('Word problem', 'Solve. Write the number and the label.', grid([mixWp], { cols: 1, rows: 1, labels: 'tab', start: 10 }), 42),
    note: '<b>08-C · Mixed Skill Practice, GROUPED — Daily look, size M, N = 6 units of 31 mm.</b> One shelf per skill, each opening with a thin strip (bold skill title + one instruction). Stacks and fraction-of-a-set cells are 2 × 1 units, clocks 2 × 2, the word problem N × 1, so every vertical rule lands on the lattice. Continuous black tabs 1–10; spare height is shared into the answer zones. Clock faces are the pack clock of 10-visual-grids (short hands, no numeral struck through).',
});

const at = (r, c, rs = 1, cs = 1) => `grid-area:${r}/${c}/span ${rs}/span ${cs}`;
const shCell = (k, item, cueText, place) => cell(cue(cueText) + item.html, { label: label('tab', k), cls: `${item.cls || ''} p08-cued${k > 9 ? ' p08-w2' : ''}`, style: place });
const S = v => ({ html: sumCell(v) }), C = clockCell(52);
const shuffled = [
    shCell(1, C(times[0]), 'Write the time.', at(1, 1, 2)), shCell(2, S(sums[0]), 'Add.', at(1, 2)), shCell(3, setCell(sets[0]), 'Shade the fraction.', at(2, 2)), shCell(4, C(times[1]), 'Write the time.', at(1, 3, 2)),
    shCell(5, S(sums[1]), 'Add.', at(3, 1)), shCell(6, setCell(sets[1]), 'Shade the fraction.', at(4, 1)), shCell(7, C(times[2]), 'Write the time.', at(3, 2, 2)), shCell(8, S(sums[2]), 'Add.', at(3, 3)), shCell(9, setCell(sets[2]), 'Shade the fraction.', at(4, 3)),
    shCell(10, mixWp, 'Read the story.', at(5, 1, 1, 3)),
];
const mixedShuffled = page({
    look: 'daily', size: 'M', tab: 5,
    header: { score: 10, tab: ['Level 3', 'Mixed 1'], title: 'Mixed practice' },
    footer: { left: `Mixed 1 · shuffled · ${MIX_FOOT}`, right: 'Form B' },
    body: instrRaw('Solve.') + lattice(shuffled, 3, 5),
    note: '<b>08-D · Mixed Skill Practice, SHUFFLED — the same ten problems.</b> One sheet instruction; two strips of 2 × 2-unit blocks (a clock, or a stack over a fraction cell) and a closing word-problem row; a cue of four words or fewer sits beside every tab; numbering runs by strip, then block, then down the block. Five rows of 45 mm (not the seven of PT-MIX) because a stacked cell with a real answer zone needs 40 mm.',
});

// =====================================================================================
// E + F. TODAY'S NUMBER — range to 1,000, Version B, today's number 346
// =====================================================================================
const TN = 346, TN_TAB = ['Level 3', 'to 1,000 - B'], TN_FOOT = "Today's Number 346 · to 1,000 · Version B · Grade 2 · 2.NBT.A.1 · 2.NBT.A.3 · 2.NBT.A.4";
const chartHTO = `<div class="p08-hto"><b>Hundreds</b><b>Tens</b><b>Ones</b><i data-ws-slot="answer" data-ws-shape="box"></i><i data-ws-slot="answer" data-ws-shape="box"></i><i data-ws-slot="answer" data-ws-shape="box"></i></div>`;
const drawFrame = `<div class="p08-draw"><b>Hundreds</b><b>Tens</b><b>Ones</b><i></i><i></i><i></i></div>`;
const bank = `<div class="p08-bank">${['three', 'four', 'six', 'forty', 'sixty', 'hundred'].map(w => `<span>${w}</span>`).join('')}</div>`;

const today1 = page({
    look: 'daily', size: 'L', tab: 6,
    header: { score: 9, tab: TN_TAB, title: "Today's Number" },
    footer: { left: TN_FOOT, center: '1/2', right: 'Version B' },
    body: `<div class="p08-bands">
        ${tband(1, 'Count on', 'Count by 1. Write the missing numbers.', `<div class="p08-plate">${TN}</div>${track([347, null, null, 350, null, null, 353], 18, 13)}`)}
        ${tband(2, 'Write it in words', 'Use the word bank. Write the number in words.', `${bank}<span class="p08-ruled" data-ws-slot="answer" data-ws-shape="line"></span>`, 1, 'col')}
        ${tband(3, 'Place-value chart', `Write ${TN} in the chart.`, chartHTO)}
        ${tband(4, 'Draw the blocks', `Draw blocks to show ${TN}.`, drawFrame + blocksKey(1.6), 1, 'draw')}
        ${tband(5, 'Expanded form', 'Write the number in expanded form.', equation([TN, '=', '_box', '+', '_box', '+', '_box'], 'L', 3))}
        ${tband(6, 'Compare', 'Write &lt;, &gt; or = in the circle.', [364, 329, 346].map(v => `<div class="p08-sub">${equation([TN, '_circle', v], 'L')}</div>`).join(''), 1, 'cells')}</div>`,
    note: "<b>08-E · Today's Number, side 1 — range to 1,000, Version B (no trace, captions on), number 346.</b> Six equal bands in the Daily look: black tab, bold title and instruction on the first line, work area below. Count-on track, word form copied from a closed bank, H T O chart, draw-the-blocks frame with a gridded key, expanded form, compare. Only the number changes from day to day.",
});

const chartCells = Array.from({ length: 60 }, (_, i) => 321 + i);
const chartBlank = new Set([323, 328, 334, 336, 339, 345, 347, 351, 356, 358, 362, 367, 370, 374, 379]);
const chart = `<div class="p08-chart">${chartCells.map(v => chartBlank.has(v) ? '<span data-ws-slot="answer" data-ws-shape="box"></span>' : `<span${v === TN ? ' class="tn"' : ''}>${v}</span>`).join('')}</div>`;
const roundRow = (lo, hi, step, labs, cap) => `<div class="p08-nlrow">${numberLine(lo, hi, step, labs)}<div class="p08-nlans"><small>${cap}</small>${slotBox(25, 12)}</div></div>`;

const today2 = page({
    look: 'daily', size: 'L', tab: 6,
    header: { date: false, score: false, tab: TN_TAB, title: '' },
    footer: { left: TN_FOOT, center: '2/2', right: 'Version B' },
    body: `<div class="p08-bands">
        ${tband(7, 'Rounding', `Mark ${TN} on each line. Write the rounded number.`, roundRow(340, 350, 1, [340, 345, 350], 'Nearest ten') + roundRow(300, 400, 10, [300, 350, 400], 'Nearest hundred'), 56, 'col')}
        ${tband(8, 'More and less', 'Write the missing numbers.', cross(TN, { hundred: true, bw: 27, bh: 14, numPt: 28, rowGap: 3 }), 84)}
        ${tband(9, 'Number chart', 'Write the missing numbers.', chart, 102, 'flush')}</div>`,
    note: "<b>08-F · Today's Number, side 2.</b> Tabs continue 7–9: two number lines (340–350 and 300–400) with a box for the rounded number, the more / less cross (1, 10 and 100 each way, reading smallest to largest along the row), and the 321–380 fragment of the 301–400 chart with targeted blanks round 346. Name-only header.",
});

// =====================================================================================
// G. DAILY 4 — five Day bands, size M
// =====================================================================================
const d4 = [
    [[7, 6], [63, 28], 67, 45], [[8, 6], [52, 17], 34, 62], [[6, 9], [80, 46], 85, 27], [[7, 7], [71, 35], 58, 73], [[9, 7], [94, 58], 42, 36],
];
const d4Round = v => ({ cls: 'p08-d4cell', html: `<div class="p08-d4row"><span class="p08-num">${v}</span>${arrow(7)}<span class="p08-capbox">${slotBox(18, 10)}<small>nearest ten</small></span></div>` });
const d4More = v => ({ cls: 'p08-d4cell', html: `<div class="p08-d4row"><span class="p08-capbox">${slotBox(14, 10)}<small>10 less</small></span><span class="p08-num">${v}</span><span class="p08-capbox">${slotBox(14, 10)}<small>10 more</small></span></div>` });
const day4Band = (day, [m, s, r, t]) => `<div class="ws-band p08-day"><div class="ws-strip"><span class="ws-daytab">Day ${day}</span><div class="ws-field score">Score<i></i><b>/4</b></div></div>${
    grid([fact(m[0], m[1], 'x', { pt: 22, padTop: 2 }), fact(s[0], s[1], '-', { pt: 22, padTop: 2 }), d4Round(r), d4More(t)], { cols: 4, rows: 1, labels: 'tab' })}</div>`;

const daily4 = page({
    look: 'daily', size: 'M', tab: 5,
    header: { score: false, tab: ['Level 3', 'Week 12'], title: 'Daily 4' },
    footer: { left: 'Daily 4 · L3-W12 · last lesson 3.OA.C.7 · last week 3.NBT.A.2 · last unit 3.NBT.A.1 · last year 2.NBT.B.8', right: 'Week 12' },
    body: `${instrRaw('Solve.')}<div class="p08-d4head">${['Last lesson', 'Last week', 'Last unit', 'Last year'].map(t => `<small>${t}</small>`).join('')}</div><div class="p08-days">${d4.map((d, i) => day4Band(i + 1, d)).join('')}</div>`,
    note: '<b>08-G · Daily 4 — five Day bands on one page, size M.</b> Each band: black Day tab, its own Score /4 (the header Score is off), four boxed cells with tabs 1–4 restarting each day. "Source captions" option ON: the four sources print once as tiny column heads over the first band, never inside a box. Every question is the compact form that fits the 5-day cell (vertical facts, a rounding box, a 10 less / 10 more pair).',
});

const css = `
/* ---- shared ---- */
.p08-time { display:inline-flex; align-items:center; }
.p08-time i { display:block; width:18mm; height:calc(var(--ws-hw) + 2mm); border:var(--ws-hair) solid var(--ws-ink); }
.p08-time b { width:5mm; text-align:center; font-size:var(--ws-digit); line-height:1; font-weight:700; margin-top:-1mm; }
.p08-clockcell { justify-content:flex-start; gap:4mm; padding-top:3mm; }
.p08-num { font-size:var(--ws-digit); line-height:1; }
.p08-coins { display:flex; align-items:center; gap:2mm; }
.p08-track { display:inline-flex; border:var(--ws-heavy) solid var(--ws-ink); border-radius:3mm; overflow:hidden; background:var(--ws-ink); gap:var(--ws-hair); }
.p08-track span { width:var(--tw); height:var(--th); background:var(--ws-paper); display:flex; align-items:center; justify-content:center; font-size:var(--ws-text); font-weight:700; line-height:1; }
.p08-cross { display:grid; gap:var(--rg, 2.5mm) 1.2mm; justify-content:center; }
.p08-cx { display:flex; flex-direction:column; align-items:center; }
.p08-cx small { font-size:var(--ws-zone); line-height:1.25; white-space:nowrap; margin-bottom:.6mm; }
.p08-cx i { display:block; width:var(--bw); height:var(--bh); border:var(--ws-hair) solid var(--ws-ink); }
.p08-cx b { width:var(--bw); height:var(--bh); border:var(--ws-heavy) solid var(--ws-ink); display:flex; align-items:center; justify-content:center; font-size:var(--np); font-weight:700; line-height:1; }
/* word-problem band */
.ws-cell.p08-wpcell { padding:0; align-items:stretch; }
.p08-wp { flex:1; min-height:0; display:flex; }
.p08-wpstory { flex:1; min-width:0; display:flex; align-items:center; padding:3mm 4mm 3mm calc(var(--ws-tab) + 3mm); }
.p08-wpstory .ws-story { flex:1; }
.p08-wpwork { flex:none; border-left:var(--ws-hair) solid var(--ws-ink); padding:1.5mm 3mm 1.5mm; display:flex; flex-direction:column; justify-content:space-between; }
.p08-wpwork small, .p08-wpans small { font-size:var(--ws-zone); line-height:1.2; }
.p08-wpans { display:flex; gap:3mm; justify-content:flex-end; }
.p08-wpans span { display:flex; flex-direction:column; }
.p08-wpans i { display:block; height:var(--ws-hw); border-bottom:var(--ws-hair) solid var(--ws-ink); margin-bottom:.6mm; }
/* ---- A: reference cell ---- */
.ws-cell.p08-refcell { padding:3.5mm 3mm 3mm; gap:3.5mm; align-items:stretch; }
.p08-badge { align-self:center; border:var(--ws-heavy) solid var(--ws-ink); padding:1.6mm 5mm; font-size:var(--ws-text); font-weight:700; line-height:1.2; white-space:nowrap; }
.p08-remember { flex:1; min-height:0; border:1pt solid var(--ws-ink); border-radius:3mm; padding:2.5mm 2.5mm; display:flex; flex-direction:column; gap:2.5mm; }
.p08-remember > b { font-size:var(--ws-text); line-height:1.2; }
.p08-remember .ws-steps { gap:2.5mm; line-height:1.25; }
.p08-remember .ws-steps li { gap:2mm; }
/* ---- B: titled sections ---- */
.p08-spread { flex:1 1 0; min-height:0; margin-top:1.5mm; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:48fr 68fr 66fr 60fr; gap:var(--ws-rule) var(--ws-heavy); background:var(--ws-ink); border:var(--ws-heavy) solid var(--ws-ink); }
.p08-sec { background:var(--ws-paper); min-width:0; min-height:0; display:flex; flex-direction:column; }
.p08-sstrip { flex:none; height:7mm; display:flex; align-items:center; gap:3mm; padding:0 3mm; font-size:var(--ws-text); white-space:nowrap; }
.p08-items { flex:1 1 0; min-height:0; display:grid; gap:var(--ws-hair); background:var(--ws-ink); border-top:var(--ws-hair) solid var(--ws-ink); }
.ws-cell.p08-tight { padding:3mm 1mm 2mm; gap:3.5mm; }
.ws-cell.p08-fraccell { padding:3mm 1mm; gap:5mm; justify-content:flex-start; }
.p08-fraccell .ws-frac { font-size:20pt; }
.ws-cell.p08-coincell { padding:0 4mm 0 calc(var(--ws-tab) + 3mm); justify-content:center; align-items:stretch; }
.p08-coinrow { display:flex; align-items:center; justify-content:space-between; }
.ws-cell.p08-pzcell { padding:2.5mm 1mm 1mm; justify-content:flex-start; }
.ws-cell.p08-rowcell { padding:0 3mm 0 calc(var(--ws-tab) + 3mm); justify-content:center; }
.ws-cell.p08-left { align-items:flex-start; }
.p08-round { display:flex; align-items:center; gap:4mm; }
.p08-round .p08-num { width:21mm; text-align:right; }
/* ---- C / D: mixed practice ---- */
.ws-cell.p08-setcell { justify-content:flex-start; padding-top:calc(var(--ws-tab) + 3mm); }
.ws-cell.p08-setcell { align-items:stretch; }
.p08-set { display:grid; grid-template-columns:15mm 1fr; align-items:center; justify-items:center; }
.p08-set .ws-frac { font-size:22pt; }
.p08-cue { position:absolute; left:calc(var(--ws-tab) + 2mm); top:0; height:var(--ws-tab); display:flex; align-items:center; font-size:var(--ws-text); line-height:1; white-space:nowrap; }
.ws-cell.p08-cued.p08-clockcell { padding-top:calc(var(--ws-tab) + 5mm); gap:6mm; }
.ws-cell.p08-cued.p08-setcell { padding-top:calc(var(--ws-tab) + 5mm); }
.p08-w2 .p08-cue { left:calc(var(--ws-tab) * 1.4 + 2mm); }
/* ---- E / F: Today's Number ---- */
.p08-bands { flex:1 1 0; min-height:0; margin-top:1.5mm; display:flex; flex-direction:column; gap:var(--ws-rule); background:var(--ws-ink); border:var(--ws-heavy) solid var(--ws-ink); }
.ws-cell.p08-tband { padding:0; align-items:stretch; }
.p08-tline { flex:none; height:8mm; display:flex; align-items:center; gap:3mm; padding-left:calc(var(--ws-tab) + 3mm); font-size:var(--ws-text); white-space:nowrap; }
.p08-work { flex:1 1 0; min-height:0; display:flex; align-items:center; justify-content:center; gap:8mm; padding:0 4mm 2.5mm; }
.p08-work.col { flex-direction:column; gap:3mm; }
.p08-work.cells { padding:0; gap:0; align-items:stretch; border-top:var(--ws-hair) solid var(--ws-ink); }
.p08-sub { flex:1; display:flex; align-items:center; justify-content:center; border-left:var(--ws-hair) solid var(--ws-ink); }
.p08-sub:first-child { border-left:0; }
.p08-work.draw { padding-top:1mm; }
.p08-work.flush { padding:0; align-items:stretch; }
.p08-plate { border:var(--ws-heavy) solid var(--ws-ink); border-radius:3mm; width:40mm; height:22mm; display:flex; align-items:center; justify-content:center; font-size:40pt; font-weight:700; line-height:1; }
.p08-bank { border:1pt solid var(--ws-ink); border-radius:3mm; padding:1mm 5mm; display:flex; gap:9mm; font-size:var(--ws-text); line-height:1.3; }
.p08-ruled { display:block; width:150mm; height:var(--ws-answer); border-bottom:var(--ws-hair) solid var(--ws-ink); }
.p08-hto, .p08-draw { display:grid; grid-template-columns:repeat(3, var(--cw)); border:var(--ws-heavy) solid var(--ws-ink); background:var(--ws-ink); gap:var(--ws-hair); }
.p08-hto { --cw:30mm; } .p08-draw { --cw:37mm; align-self:stretch; grid-template-rows:6mm 1fr; }
.p08-hto b, .p08-draw b { background:var(--ws-paper); height:6mm; display:flex; align-items:center; justify-content:center; font-size:var(--ws-zone); line-height:1; }
.p08-hto i { background:var(--ws-paper); height:16mm; } .p08-draw i { background:var(--ws-paper); }
.p08-key { align-self:stretch; border:1pt solid var(--ws-ink); border-radius:3mm; padding:1.5mm 4mm; display:flex; align-items:center; gap:4mm; font-size:var(--ws-zone); line-height:1.2; }
.p08-key > div { display:flex; align-items:flex-end; gap:5mm; }
.p08-key figure { margin:0; display:flex; flex-direction:column; align-items:center; gap:.8mm; }
.p08-key figcaption { font-weight:700; }
.p08-nlrow { display:flex; align-items:center; gap:8mm; }
.p08-nlans { display:flex; flex-direction:column; align-items:center; gap:1mm; width:36mm; }
.p08-nlans small { font-size:var(--ws-zone); line-height:1.2; white-space:nowrap; }
.p08-chart { flex:1; display:grid; grid-template-columns:repeat(10, 1fr); grid-template-rows:repeat(6, 1fr); gap:var(--ws-hair); background:var(--ws-ink); border-top:var(--ws-hair) solid var(--ws-ink); }
.p08-chart span { background:var(--ws-paper); display:flex; align-items:center; justify-content:center; font-size:17pt; line-height:1; }
.p08-chart span.tn { font-weight:700; outline:var(--ws-heavy) solid var(--ws-ink); outline-offset:-1.5pt; }
/* ---- G: Daily 4 ---- */
.p08-d4head { flex:none; height:4.5mm; display:grid; grid-template-columns:repeat(4, 1fr); align-items:start; }
.p08-d4head small { text-align:center; font-size:var(--ws-zone); line-height:1; }
.p08-days { flex:1 1 0; min-height:0; display:flex; flex-direction:column; gap:3mm; }
.ws-band.p08-day { flex:1 1 0; min-height:0; margin-top:0; border-top-width:var(--ws-rule); }
.p08-day .ws-strip { min-height:8mm; }
.ws-cell.p08-d4cell { padding:calc(var(--ws-tab) + 2mm) 1mm 1mm; justify-content:flex-start; }
.p08-d4row { display:flex; align-items:flex-start; gap:2mm; }
.p08-d4row > .p08-num, .p08-d4row > svg { height:10mm; display:flex; align-items:center; }
.p08-d4row > svg { align-self:flex-start; margin-top:3mm; height:4mm; }
.p08-capbox { display:flex; flex-direction:column; align-items:center; gap:.6mm; }
.p08-capbox small { font-size:var(--ws-zone); line-height:1.1; white-space:nowrap; }
`;

export default doc('08 Daily review pages', [spiral1, spiral2, mixedGrouped, mixedShuffled, today1, today2, daily4], css);
