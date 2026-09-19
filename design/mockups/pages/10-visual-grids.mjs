// Visual grids (clocks, generic coins, fraction models, base-10 blocks) and two EXTENSION exemplars
// (area + perimeter, bar graphs). I Can look throughout. Every picture is drawn here as inline SVG,
// viewBox in mm, strokes from the closed set 0.5 / 0.75 / 1 / 1.5 / 2.25 pt.
//
// KIT PROPOSALS (nothing in the kit was edited):
//  1. slot `time(size)`      : the two-box "__ : __" slot (boxes 16 / 18 / 20 x Hw + 2, two solid colon dots in a
//                              5 mm gap, data-ws-shape="time"). Local version: timeSlot().
//  2. `answerZone(html)`     : the bottom-pinned answer zone of a visual cell (height Hw + 4, margin-top:auto) so
//                              every visual page pins its slot the same way. Local version: az().
//  3. `unitSlot(n, word)`    : line + pre-printed unit word (data-ws-shape="unit"). Local version: unitLine().
//  4. `frac()` at digit size : the kit's .ws-frac prints at --ws-frac (20 pt at L). A printed TARGET fraction in a
//                              shade-it cell should be working digit size (RP-6) on a 16 mm stack (RP-91).
//                              Local version: bigFrac().
//  5. SVG builders           : clock(), coin(), fracCircle(), fracBar(), fracRect(), base10(), gridRect(),
//                              barGraph(), tally() below are written to move into the shared builders as they are
//                              (mm viewBox, `PT` stroke table, Andika text helper with optical centring).
//  6. `split(left, right)`   : a band body with one tall chart cell on the left and a one-column cell grid on the
//                              right (graph + questions). Local version: .p10-split.
//  7. `table()`              : XP-D-15 table (heavy outer rule, heavy rule under the head row, hairline inside,
//                              rows Hw + 4). Local version: .p10-table.
//  8. Instruction library    : no string exists for "area and perimeter of one rectangle" or for "build a bar graph
//                              from a tally table". Used here: "Write the area. Write the perimeter." and
//                              "Write each number. Shade the bars." (print verbs, <= 12 words).
import { page, grid, band, line, doc } from '../kit/kit.mjs';

// ---------- SVG basics ----------
const PT = 0.3528;                                               // mm per pt
const SW = { fine: 0.5 * PT, hair: 0.75 * PT, grey: 1 * PT, heavy: 1.5 * PT, rule: 2.25 * PT };
const INK = '#000', GREY = '#949494', PAPER = '#fff';
const n2 = v => +v.toFixed(2);
const svg = (w, h, inner, vb) => `<svg class="ws-svg" xmlns="http://www.w3.org/2000/svg" width="${n2(w)}mm" height="${n2(h)}mm" viewBox="${vb || `0 0 ${n2(w)} ${n2(h)}`}">${inner}</svg>`;
const CAP = 0.7;                                                 // Andika lining-digit / cap height in em
// text centred optically on (x, y): the baseline is dropped by half the cap height
const txt = (x, y, fs, s, { w = 700, anchor = 'middle', fill = INK, rot = null } = {}) =>
    `<text x="${n2(x)}" y="${n2(y + fs * CAP / 2)}" font-family="Andika" font-weight="${w}" font-size="${n2(fs)}" text-anchor="${anchor}" fill="${fill}"${rot !== null ? ` transform="rotate(${rot} ${n2(x)} ${n2(y)})"` : ''}>${s}</text>`;
const ln = (x1, y1, x2, y2, sw, extra = '') => `<line x1="${n2(x1)}" y1="${n2(y1)}" x2="${n2(x2)}" y2="${n2(y2)}" stroke="${INK}" stroke-width="${n2(sw)}"${extra}/>`;
const rc = (x, y, w, h, sw, fill = 'none') => `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="${fill}" stroke="${INK}" stroke-width="${n2(sw)}"/>`;
const pol = (r, deg) => [r * Math.sin(deg * Math.PI / 180), -r * Math.cos(deg * Math.PI / 180)];   // 0 deg = 12 o'clock, clockwise

// ---------- local slots ----------
const az = html => `<div class="p10-az">${html}</div>`;
const colon = `<span class="p10-colon"><i></i><i></i></span>`;
const timeSlot = () => `<span class="p10-time" data-ws-slot="answer" data-ws-shape="time"><span class="ws-box"></span>${colon}<span class="ws-box"></span></span>`;
const unitLine = (n, word, trace = '') => `<span class="p10-unit" data-ws-slot="answer" data-ws-shape="unit"><span class="ws-line p10-fill" style="--w:${n}mm">${trace}</span><span>${word}</span></span>`;
const bigFrac = (n, d) => `<span class="p10-frac"><span>${n}</span><span>${d}</span></span>`;

// ---------- RP-100..103 analog clock ----------
// time = [h, m] draws the hands; null = draw-the-hands face (no hands, pivot kept so the pupil knows where they start)
// DEPARTURES FROM RP-101 (both reported in the 10-A note):
//  - hands have plain round ends, no arrow tips (the mock-up brief asks for arrow-free hands);
//  - the hands are 0.47 R (minute) and 0.30 R (hour), not 0.78 R and 0.46 R. RP-100 puts 0.12 D numerals on 0.66 R, so
//    their inner edge is at about 0.50 R ("10") to 0.58 R. A 0.78 R hand is struck through the numeral at every
//    five-minute time, which reads as a crossed-out number; passing the hand behind a haloed numeral leaves "-3-".
//    At 0.47 R the minute hand POINTS AT its numeral and stops about 1 mm short of it, on every face, and nothing on
//    the face ever touches a numeral. The 1.57 : 1 length ratio plus the 1.5 / 2.25 pt weights keep the hands apart.
const MIN_HAND = 0.47, HOUR_HAND = 0.30;
function clock(D, time = null) {
    const R = D / 2, S = D + 2, c = S / 2;
    let g = `<circle cx="${c}" cy="${c}" r="${R}" fill="${PAPER}" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`
        + `<circle cx="${c}" cy="${c}" r="${n2(0.9 * R)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.fine)}"/>`;
    for (let i = 0; i < 60; i++) {
        const five = i % 5 === 0, [x1, y1] = pol(0.9 * R, i * 6), [x2, y2] = pol((five ? 0.8 : 0.85) * R, i * 6);
        g += ln(c + x1, c + y1, c + x2, c + y2, five ? SW.hair : SW.fine);
    }
    if (time) {
        const [h, m] = time, [hx, hy] = pol(HOUR_HAND * R, 30 * (h % 12) + 0.5 * m), [mx, my] = pol(MIN_HAND * R, 6 * m);
        g += ln(c, c, c + hx, c + hy, SW.rule, ' stroke-linecap="round"') + ln(c, c, c + mx, c + my, SW.heavy, ' stroke-linecap="round"');
    }
    const fs = 0.12 * D;
    for (let h = 1; h <= 12; h++) {
        const [x, y] = pol(0.66 * R, h * 30);
        g += txt(c + x, c + y, fs, h);
    }
    g += `<circle cx="${c}" cy="${c}" r="1" fill="${INK}"/>`;
    return svg(S, S, g);
}
// RP-103 (f) digital face: rounded box, plain solid digits, two colon dots, no leading zero
const digital = (h, m) => `<div class="p10-digital"><span>${h}</span>${colon}<span>${String(m).padStart(2, '0')}</span></div>`;

// ---------- RP-110..113 generic coins ----------
const COIN_D = { 1: 17.5, 5: 19.75, 10: 22, 25: 24.26 };   // RP-111: sized by value, 1 smallest, 25 largest (owner ruling 2026-09-19)
const COIN_ROW = 24.26 + 0.6;
function coin(v) {
    const D = COIN_D[v], r = D / 2, S = D + 0.6, c = S / 2;
    return svg(S, S, `<circle cx="${n2(c)}" cy="${n2(c)}" r="${n2(r)}" fill="${PAPER}" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`
        + `<circle cx="${n2(c)}" cy="${n2(c)}" r="${n2(0.88 * r)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.fine)}"/>`
        + txt(c, c, 0.4 * D / CAP, v));
}
// one full-width coin row: coins largest first, a running-total box under each coin, the total in its own ruled zone
function coinRow(values, { model = false } = {}) {
    let run = 0;
    const cols = values.map(v => { run += v; return `<div class="p10-coincol"><div class="p10-coinpic">${coin(v)}</div><span class="ws-box p10-fill p10-run" data-ws-slot="work" data-ws-shape="box">${model ? `<b class="ws-trace">${run}</b>` : ''}</span></div>`; }).join('');
    return { style: 'padding:0', nolabel: model, html: `<div class="p10-coinrow"><div class="p10-coins">${cols}</div><div class="p10-total"><div class="p10-totalcol"><span class="ws-zone">Total</span><span class="ws-line p10-fill" style="--w:25mm" data-ws-slot="answer" data-ws-shape="line">${model ? `<b class="ws-trace">${run}</b>` : ''}</span></div></div></div>` };
}

// ---------- RP-90..93 fraction models ----------
function fracCircle(D, parts, shaded = 0) {
    const R = D / 2, S = D + 1, c = S / 2; let g = '';
    for (let i = 0; i < shaded; i++) {
        const [x1, y1] = pol(R, i * 360 / parts), [x2, y2] = pol(R, (i + 1) * 360 / parts);
        g += `<path d="M${c} ${c} L${n2(c + x1)} ${n2(c + y1)} A${R} ${R} 0 0 1 ${n2(c + x2)} ${n2(c + y2)} Z" fill="${GREY}"/>`;
    }
    for (let i = 0; i < parts; i++) { const [x, y] = pol(R, i * 360 / parts); g += ln(c, c, c + x, c + y, SW.hair); }
    return svg(S, S, g + `<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}"/>`);
}
function fracRect(w, h, rows, cols, shaded = 0) {            // a bar is rows = 1; shading runs from the left
    const o = 0.5, pw = w / cols, ph = h / rows; let g = '';
    for (let i = 0; i < shaded; i++) g += `<rect x="${n2(o + (i % cols) * pw)}" y="${n2(o + Math.floor(i / cols) * ph)}" width="${n2(pw)}" height="${n2(ph)}" fill="${GREY}"/>`;
    for (let i = 1; i < cols; i++) g += ln(o + i * pw, o, o + i * pw, o + h, SW.hair);
    for (let j = 1; j < rows; j++) g += ln(o, o + j * ph, o + w, o + j * ph, SW.hair);
    return svg(w + 1, h + 1, g + rc(o, o, w, h, SW.heavy));
}
const BAR = [60, 20], RECT = [54, 40];
const fracCell = (n, d, model) => `<div class="p10-fr">${bigFrac(n, d)}${model}</div>`;

// ---------- RP-30 base-10 blocks, gridded, shape only ----------
function base10(n) {
    const u = 3.4, H = Math.floor(n / 100), T = Math.floor(n / 10) % 10, O = n % 10, h = 10 * u, o = 0.4;
    let x = o, g = '';
    for (let k = 0; k < H; k++) {
        for (let i = 1; i < 10; i++) g += ln(x + i * u, o, x + i * u, o + h, SW.fine) + ln(x, o + i * u, x + h, o + i * u, SW.fine);
        g += rc(x, o, h, h, SW.hair); x += h + 2;
    }
    if (H) x += 1;
    for (let k = 0; k < T; k++) {
        for (let i = 1; i < 10; i++) g += ln(x, o + i * u, x + u, o + i * u, SW.fine);
        g += rc(x, o, u, h, SW.hair); x += u + 1;
    }
    if (T) x += 2;
    for (let k = 0; k < O; k++) g += rc(x + (k % 2) * (u + 1), o + h - (Math.floor(k / 2) + 1) * u - Math.floor(k / 2), u, u, SW.hair);
    if (O) x += (O > 1 ? 2 * u + 1 : u) + 3;
    return svg(x - 3 + o, h + 2 * o, g);
}

// ---------- XP-D-04 / 05 rectangle on a unit grid with side labels ----------
function gridRect(wu, hu) {
    const u = 8, m = 10, top = 8, W = wu * u + 2 * m, H = hu * u + top + 1, fs = 15 * PT; let g = '';
    for (let i = 1; i < wu; i++) g += ln(m + i * u, top, m + i * u, top + hu * u, SW.hair);
    for (let j = 1; j < hu; j++) g += ln(m, top + j * u, m + wu * u, top + j * u, SW.hair);
    g += rc(m, top, wu * u, hu * u, SW.heavy) + txt(m + wu * u / 2, top - 1.5 - fs * CAP / 2, fs, wu, { w: 400 }) + txt(m - 1.8, top + hu * u / 2, fs, hu, { w: 400, anchor: 'end' });
    return svg(W, H, g);
}
const apSlots = () => `<div class="p10-ap"><span>Area</span><span>=</span>${unitLine(17, 'square units')}<span>Perimeter</span><span>=</span>${unitLine(17, 'units')}</div>`;

// ---------- RP-130 / 131, XP-D-14 bar graph ----------
// vals = null draws the empty pre-labelled frame of a construct-a-graph item (axes, grid and bar columns only)
function barGraph({ W, H, title, yTitle, xTitle, cats, vals = null, max }) {
    const zone = 12 * PT, big = 15 * PT, gut = 17, right = 4, top = 14, bot = 8 + 9;
    const px = gut, py = top, pw = W - gut - right, ph = H - top - bot, step = ph / max, pitch = pw / cats.length, bw = 0.6 * pitch;
    let g = txt(px + pw / 2, 4, big, title);
    for (let v = 0; v <= max; v++) { const y = py + ph - v * step; if (v) g += ln(px, y, px + pw, y, SW.fine); g += txt(px - 2.2, y, zone, v, { w: 400, anchor: 'end' }); }
    cats.forEach((cname, i) => {
        const x = px + i * pitch + (pitch - bw) / 2;
        if (vals) g += rc(x, py + ph - vals[i] * step, bw, vals[i] * step, SW.heavy, GREY);
        else g += ln(x, py, x, py + ph, SW.hair) + ln(x + bw, py, x + bw, py + ph, SW.hair);
        g += txt(x + bw / 2, py + ph + 4.6, zone, cname, { w: 400 });
    });
    g += ln(px, py - 1, px, py + ph, SW.heavy) + ln(px - SW.heavy / 2, py + ph, px + pw, py + ph, SW.heavy);
    g += txt(px + pw / 2, H - 3, zone, xTitle) + txt(3.2, py + ph / 2, zone, yTitle, { rot: -90 });
    return svg(W, H, g);
}
// RP-22 tally marks: 0.75 pt strokes 10 mm tall at 2.5 mm pitch, diagonal fifth
function tally(n) {
    let g = '', x = 1.5;
    for (let k = 0; k < Math.floor(n / 5); k++) { for (let i = 0; i < 4; i++) g += ln(x + i * 2.5, 0.5, x + i * 2.5, 10.5, SW.hair); g += ln(x - 1.5, 8.6, x + 9, 2.4, SW.hair); x += 7.5 + 5.5; }
    for (let i = 0; i < n % 5; i++) g += ln(x + i * 2.5, 0.5, x + i * 2.5, 10.5, SW.hair);
    return svg(x + 8, 11, g);
}

// =====================================================================================
// A. Telling time to 5 minutes — size L, 2 x 3
const timesA = [[3, 25], [7, 50], [10, 5], [1, 40], [12, 15], [8, 35]];
const pgA = page({
    look: 'ican', size: 'L',
    header: { score: 6, tab: ['Level 2', 'Time', 'Lesson 4'], title: 'I Can tell time to five minutes' },
    footer: { left: 'time_5min · Grade 2 · 2.MD.C.7', right: 'Form A' },
    body: band('Independent Practice:', 'Write the time.', grid(timesA.map(t => clock(50, t) + az(timeSlot())), { cols: 2, rows: 3, labels: 'letter' }), { grow: true }),
    note: '<b>10-A · Visual grid — telling time to 5 minutes, size L.</b> 2 × 3, 50 mm faces (1.5 pt rim, 0.5 pt inner ring, 60 ticks with longer five-minute ticks, numerals at 0.66 R, short heavy hour hand + long lighter minute hand, solid pivot). The two-box “ : ” time slot is pinned to the bottom of every cell. Minute ring off. <b>Departs from RP-101:</b> plain hand ends (no arrow tips), and the hands are 0.47 R and 0.30 R (not 0.78 R and 0.46 R): with 0.12 D numerals on 0.66 R a 0.78 R hand strikes through the numeral at every five-minute time, so here the minute hand points at its numeral and stops 1 mm short of it. Nothing on the face touches a numeral. Alternative for the standard: move the numerals out and keep the long hand.',
});

// B. Draw the hands — 2 x 2
const timesB = [[4, 35], [9, 10], [11, 50], [2, 25]];
const pgB = page({
    look: 'ican', size: 'L',
    header: { score: 4, tab: ['Level 2', 'Time', 'Lesson 6'], title: 'I Can draw the hands on a clock' },
    footer: { left: 'time_draw_hands · Grade 2 · 2.MD.C.7', right: 'Form A' },
    body: band('Independent Practice:', 'Draw the hands.', grid(timesB.map(([h, m]) => digital(h, m) + `<div class="p10-face">${clock(62, null)}</div>`), { cols: 2, rows: 2, labels: 'letter' }), { grow: true }),
    note: '<b>10-B · Visual grid — draw the hands.</b> 2 × 2 because a draw-the-hands face needs D ≥ 52 mm at L (drawn at 62). Faces carry rim, ticks, numerals and pivot but no hands (RP-1). The given time sits above each face as a digital read-out: rounded box, plain solid digits, two colon dots. The face is the workspace, so there is no bottom answer zone.',
});

// C. Counting generic coins — 1 x 4 full-width rows (1 Model + 3 Independent), running-total boxes on
const pgC = page({
    look: 'ican', size: 'L',
    header: { score: 3, tab: ['Level 2', 'Money', 'Lesson 3'], title: 'I Can count coins to find the total' },
    footer: { left: 'count_coins · Grade 2 · 2.MD.C.8', right: 'Form A' },
    body: band('Model:', 'Count the coins. Write the total.', grid([coinRow([25, 10, 5, 1, 1], { model: true })], { cols: 1, rows: 1, cls: 'fixed', height: '54.5mm' }))
        + band('Independent Practice:', 'Count the coins. Write the total.', grid([coinRow([25, 25, 10, 5, 1]), coinRow([10, 10, 10, 5, 5, 1]), coinRow([25, 10, 10, 5, 1, 1])], { cols: 1, rows: 3, labels: 'letter' }), { grow: true }),
    note: '<b>10-C · Visual grid — counting generic coins.</b> Four full-width rows of equal height (one Model, three Independent). Coins are double-ring circles sized by value (17.5, 19.75, 22 and 24.26 mm: 1 smallest, 25 largest) showing only 1, 5, 10, 25 — no portraits, no currency sign. One tidy row, largest first, 2 mm apart; a running-total box under every coin (support on); the total is a plain number on a line in its own ruled zone at the right. The Model row shows the count-on in grey trace.',
});

// D. Fraction models — Model row + 2 x 3
const pgD = page({
    look: 'ican', size: 'L',
    header: { score: 6, tab: ['Level 3', 'Fractions', 'Lesson 10'], title: 'I Can shade a fraction of a shape' },
    footer: { left: 'fraction_shade · Grade 3 · 3.NF.A.1', right: 'Form A' },
    body: band('Model:', 'Shade the fraction.', grid([
        { nolabel: true, html: fracCell(4, 6, fracRect(...BAR, 1, 6, 4)) },
        { nolabel: true, html: fracCell(7, 8, fracRect(...BAR, 1, 8, 7)) },
    ], { cols: 2, rows: 1, cls: 'fixed p10-mid', height: '36mm' }))
        + band('Independent Practice:', 'Shade the fraction.', grid([
            fracCell(3, 4, fracCircle(50, 4)), fracCell(2, 3, fracRect(...BAR, 1, 3)),
            fracCell(5, 6, fracRect(...RECT, 2, 3)), fracCell(3, 8, fracCircle(50, 8)),
            fracCell(1, 4, fracRect(...BAR, 1, 4)), fracCell(5, 8, fracRect(...RECT, 2, 4)),
        ], { cols: 2, rows: 3, labels: 'letter', cls: 'p10-mid' }), { grow: true }),
    note: '<b>10-D · Visual grid — shade the fraction.</b> Model row + 2 × 3. The target fraction is a stacked fraction at working digit size at the left, the model beside it (never under it). Circles 50 mm, bars 60 × 20, rectangles 54 × 40: 1.5 pt outline, 0.75 pt partitions, every part ≥ 6 mm. Independent models are empty. The Model band shows the one flat grey fill on two worked bars (4/6 and 7/8), shaded from the left.',
});

// E. Base-10 blocks — 2 x 3, one number with a zero in the tens place
const numsE = [124, 136, 205, 152, 211, 143];
const pgE = page({
    look: 'ican', size: 'L',
    header: { score: 6, tab: ['Level 2', 'Place Value', 'Lesson 3'], title: 'I Can write the number the blocks show' },
    footer: { left: 'base10_blocks · Grade 2 · 2.NBT.A.1', right: 'Form A' },
    body: band('Independent Practice:', 'Count. Write the number.', grid(numsE.map(n => `<div class="p10-blocks">${base10(n)}</div>` + az(line(3, 'L'))), { cols: 2, rows: 3, labels: 'letter' }), { grow: true }),
    note: '<b>10-E · Visual grid — base-10 blocks, write the number.</b> 2 × 3 at size L (unit 3.4 mm): gridded 10 × 10 flats, segmented rods, unit squares two wide — shape only, no fill. Largest place at the left, blocks stand on one baseline. Cell c. (205) has no rods: a zero in the tens place. One answer line, same width and same place in every cell.',
});

// F. EXTENSION — area and perimeter, Level 3, 2 x 2
const rectsF = [[6, 4], [8, 3], [5, 5], [7, 5]];
const pgF = page({
    look: 'ican', size: 'L',
    header: { score: 4, tab: ['Level 3', 'Measurement', 'Lesson 5'], title: 'I Can find the area and perimeter of a rectangle' },
    footer: { left: 'area_perimeter · Grade 3 · 3.MD.C.7, 3.MD.D.8', right: 'Form A' },
    body: band('Independent Practice:', 'Write the area. Write the perimeter.', grid(rectsF.map(([w, h]) => `<div class="p10-rect">${gridRect(w, h)}</div>` + apSlots()), { cols: 2, rows: 2, labels: 'letter' }), { grow: true }),
    note: '<b>10-F · EXTENSION exemplar — area and perimeter (Level 3).</b> 2 × 2. Each rectangle is drawn on an 8 mm unit-square grid (1.5 pt outline, 0.75 pt unit lines) with its side lengths outside the sides. Two unit slots in the same place in every cell: “Area = ___ square units” and “Perimeter = ___ units”, equals signs and lines aligned. The open middle of the cell is working room.',
});

// G. EXTENSION — read a bar graph: graph left, 4 questions right
const qG = [
    'How many books did Sam read?',
    'How many books did Lina read?',
    '<u>How many more</u> books did Omar read than Mia?',
    'How many books did Sam and Lina read <u class="p10-nw">in all</u>?',
];
const graphG = barGraph({ W: 110, H: 214, title: 'Books read in May', yTitle: 'Number of books', xTitle: 'Reader', cats: ['Sam', 'Mia', 'Omar', 'Lina'], vals: [6, 3, 8, 4], max: 10 });
const pgG = page({
    look: 'ican', size: 'L',
    header: { score: 4, tab: ['Level 2', 'Data', 'Lesson 6'], title: 'I Can read a bar graph' },
    footer: { left: 'bar_graph · Grade 2 · 2.MD.D.10', right: 'Form A' },
    body: band('Independent Practice:', 'Use the graph. Answer the questions.',
        `<div class="p10-split"><div class="ws-cell p10-graphcell" data-ws-cell>${graphG}</div>${grid(qG.map(q => `<p class="p10-q">${q}</p>` + `<div class="p10-qa">${unitLine(17, 'books')}</div>`), { cols: 1, rows: 4, labels: 'letter', cls: 'p10-qs' })}</div>`, { grow: true }),
    note: '<b>10-G · EXTENSION exemplar — read a bar graph (Level 2–3).</b> One graph at the left (1.5 pt axes, 0.5 pt grid, numerals on the lines, grey bars with a 1.5 pt outline at 60% of the pitch, word labels under the bars, axis titles in words) and four lettered questions at the right, each with the same line + pre-printed unit word at the foot of its cell. The relational phrase is underlined. <b>Below the 11.2 minimum:</b> beside a 70 mm question column the plot area is 89 mm wide (the table asks for 100 × 80 at L); it is 183 mm tall, bars 13 mm wide. A full-width graph with the questions under it would meet the minimum.',
});

// H. EXTENSION — make the graph: tally table + empty pre-labelled axes
const dataH = [['Sunny', 8], ['Cloudy', 5], ['Rainy', 6], ['Windy', 3]];
const tableH = `<div class="p10-table"><b>Weather</b><b>Tally</b><b>Number</b>${dataH.map(([w, n]) => `<span class="w">${w}</span><span class="w">${tally(n)}</span><span data-ws-slot="answer" data-ws-shape="box"></span>`).join('')}</div>`;
const graphH = barGraph({ W: 172, H: 136, title: 'Weather in April', yTitle: 'Number of days', xTitle: 'Weather', cats: dataH.map(d => d[0]), max: 8 });
const pgH = page({
    look: 'ican', size: 'L',
    header: { score: 8, tab: ['Level 2', 'Data', 'Lesson 7'], title: 'I Can make a bar graph' },
    footer: { left: 'build_bar_graph · Grade 2 · 2.MD.D.10', right: 'Form A' },
    body: band('Independent Practice:', 'Write each number. Shade the bars.',
        `<div class="p10-make"><div class="ws-cell p10-tablecell" data-ws-cell>${tableH}</div><div class="ws-cell p10-graphcell" data-ws-cell>${graphH}</div></div>`, { grow: true }),
    note: '<b>10-H · EXTENSION exemplar — make the graph.</b> A tally table (heavy outer rule and head rule, hairline inside; printed tally bundles; the Number column is the blank) above empty pre-labelled axes: title, axis titles, scale and category words are printed, no bar is drawn (RP-1). The pupil writes four numbers and shades four bars: Score /8. <b>Departs from RP-131</b> (“draw-the-bars items show axes and grid only”): the four bar columns are ruled with 0.75 pt guides so a pupil shades a straight bar of the right width above its word.',
});

const css = `
/* answer zone pinned to the foot of a visual cell (CL-6): Hw + 4 */
.p10-az { margin-top: auto; height: calc(var(--ws-hw) + 4mm); display: flex; align-items: flex-end; justify-content: center; }
.p10-fill { display: inline-flex; align-items: flex-end; justify-content: center; font-size: var(--ws-digit); line-height: 1; }
.p10-fill b { font-weight: 400; }
/* time slot: two boxes 20 x (Hw + 2) with two colon dots in a 5 mm gap */
.p10-time { display: flex; align-items: center; }
.p10-time .ws-box { width: 20mm; height: calc(var(--ws-hw) + 2mm); }
.p10-colon { width: 5mm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3mm; }
.p10-colon i { display: block; width: 1.6mm; height: 1.6mm; border-radius: 50%; background: var(--ws-ink); }
/* digital read-out (RP-103 f) */
.p10-digital { flex: none; margin-top: 4mm; width: 48mm; height: 19mm; border: var(--ws-heavy) solid var(--ws-ink); border-radius: 3mm; display: flex; align-items: center; justify-content: center;
    font-size: 42pt; font-weight: 700; line-height: 1; }
.p10-digital > span:not(.p10-colon) { padding-bottom: 1.8mm; }
.p10-digital .p10-colon { width: 6mm; gap: 4mm; } .p10-digital .p10-colon i { width: 2.2mm; height: 2.2mm; }
.p10-face { flex: 1 1 0; min-height: 0; display: flex; align-items: center; }
/* coin rows */
.p10-coinrow { flex: 1 1 0; align-self: stretch; display: flex; min-height: 0; }
.p10-coins { flex: 1 1 0; display: flex; align-items: center; gap: 1.4mm; padding-left: 8mm; }
.p10-coincol { display: flex; flex-direction: column; align-items: center; gap: 2mm; }
.p10-coinpic { height: ${COIN_ROW}mm; display: flex; align-items: center; }
.p10-run { width: 17mm; height: calc(var(--ws-hw) + 2mm); }
.p10-total { flex: none; width: 40mm; border-left: var(--ws-hair) solid var(--ws-ink); display: flex; align-items: center; justify-content: center; }
.p10-totalcol { height: calc(${COIN_ROW}mm + 2mm + var(--ws-hw) + 2mm); display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 1mm; }
.p10-totalcol .ws-zone { font-weight: 700; }
/* fractions: target stack at digit size on a 16 mm stack, 6 mm gap, then the model (RP-91) */
.p10-mid > .ws-cell { justify-content: center; }
.p10-fr { width: 84mm; display: grid; grid-template-columns: 16mm 1fr; column-gap: 6mm; align-items: center; justify-items: center; }
.p10-frac { width: 16mm; display: flex; flex-direction: column; align-items: center; font-size: var(--ws-digit); line-height: 1.12; }
.p10-frac span:first-child { align-self: stretch; text-align: center; border-bottom: var(--ws-heavy) solid var(--ws-ink); padding-bottom: .6mm; }
.p10-frac span:last-child { padding-top: .4mm; }
/* base-10 */
.p10-blocks { margin-top: 5mm; }
/* area + perimeter */
.p10-rect { margin-top: 4mm; }
.p10-ap > span:nth-child(3n + 1) { justify-self: end; }
.p10-ap { margin-top: auto; display: grid; grid-template-columns: auto auto auto; column-gap: 2.5mm; row-gap: 4mm; align-items: end; justify-content: center; font-size: var(--ws-text); line-height: 1; padding-bottom: 2mm; }
.p10-unit { display: inline-flex; align-items: flex-end; gap: 2mm; font-size: var(--ws-text); line-height: 1; white-space: nowrap; }
/* graph + questions */
.p10-split { flex: 1 1 0; min-height: 0; display: flex; border-top: var(--ws-heavy) solid var(--ws-ink); }
.p10-graphcell { flex: 1 1 0; justify-content: center; }
.p10-split > .p10-qs { flex: 0 0 70mm; border: 0; border-left: var(--ws-hair) solid var(--ws-ink); }
.p10-qs > .ws-cell { align-items: flex-start; padding: 8mm 4mm 4mm 5mm; }
.p10-q { margin: 0; font-size: var(--ws-text); line-height: 1.4; }
.p10-q u { text-decoration-thickness: .75pt; text-underline-offset: 1.2mm; }
.p10-nw { white-space: nowrap; }
.p10-qa { margin-top: auto; }
/* make the graph */
.p10-make { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; border-top: var(--ws-heavy) solid var(--ws-ink); }
.p10-tablecell { flex: none; padding: 5mm 3mm; border-bottom: var(--ws-hair) solid var(--ws-ink); }
.p10-table { display: grid; grid-template-columns: 46mm 56mm 34mm; grid-template-rows: calc(12mm + .75pt) repeat(4, 15mm); gap: var(--ws-hair); background: var(--ws-ink); border: var(--ws-heavy) solid var(--ws-ink); font-size: var(--ws-text); line-height: 1; }
.p10-table > * { background: var(--ws-paper); display: flex; align-items: center; justify-content: center; }
.p10-table > b { font-size: var(--ws-zone); margin-bottom: calc(var(--ws-heavy) - var(--ws-hair)); }
.p10-table > .w { justify-content: flex-start; padding-left: 4mm; }
`;

export default doc('10 Visual grids and extension exemplars', [pgA, pgB, pgC, pgD, pgE, pgF, pgG, pgH], css);
