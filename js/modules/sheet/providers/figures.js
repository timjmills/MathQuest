// js/modules/sheet/providers/figures.js
// Skill providers for the figure and data cells of O6 lane AP2, round 3 (sheet/cells/figures.js):
// measurement:temperature (thermometer), measurement:reading_ruler / reading_ruler_hard (ruler),
// graphs:bar_graph and measurement:bar_graph_intro (bar-graph), graphs:pictograph and
// measurement:pictograph_intro (pictograph), graphs:tally_chart (tally-chart),
// area_perimeter:perimeter_intro (perimeter-shape). Every member reads the item's kit payload (`q.cell.payload`, plain data the
// generator wrote), never the drawing.
//
// THE MISCONCEPTION BANK. The error-analysis lane's legacy-wrong.js ids are kept (M-TM1 ... M-TM3,
// M-P1 ... M-P3, M-D1 ... M-D4); M-TC1 / M-TC2 are not (conversions left the skill, critic round
// 4). New ones, each a real, computable error:
//   M-TM4 counted the small marks up from the numbered line ABOVE the column
//   M-RL1 read the small mark next to the arrow       M-RL2 a half inch too far
//   M-RL3 read the next inch number after the arrow   M-RL4 counted the marks, not the spaces
//   M-D5  read the next number up the scale           M-D6  wrote the taller bar, not how many more
//   M-PG1 counted the pictures, not what each stands for   M-TL1 counted a bundle of five as four
//   M-D7  counted one mark or picture twice               M-PG2 counted half a picture as a whole
//   M-TM5 counted a 2-degree mark as 1 degree              M-RL5 read the end number, not the length
//   M-P4  added only one length and one width
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

import { registerSkill } from '../contract.js';
import { resolveCtx } from '../tokens.js';
import { thermometerSVG, rulerSVG, barGraphSVG, tallySVG } from '../cells/figures.js';
import { chooseWrong, strings, step, clampSteps, countList } from './util.js';

const payloadOf = (q) => (q && q.cell && q.cell.payload) || {};
const sum = (a) => a.reduce((s, v) => s + v, 0);
/** A temperature as a pupil writes it: the true minus sign below zero. */
const deg = (v) => (v < 0 ? `−${Math.abs(v)}` : String(v));

/* ============================================================================ open tasks */
// AP2 rounds 5-6 (critic figures-r6 H3, figures-r7): the Stretch role's open problem for each
// figure skill - several right answers about the skill's OWN model, drawn over the table (a
// thermometer, a ruler, an empty graph, a tally row, a grid), a results table the pupil fills,
// and a last column the pupil can check. Built from the item (pure: no rng), so two items give
// two tasks. {prompt: [lines], figure (html), columns, example, keyRows, total}.

const ctxFor = (size) => resolveCtx({ mode: 'print', size: size || 'L', look: 'ican', state: 'blank' });

/** A length in inches for a table: a whole number, or a stacked fraction (never a slash). */
const inchCell = (x) => {
    const q4 = Math.round(x * 4), w = Math.floor(q4 / 4), r = q4 % 4;
    if (!r) return String(w);
    const [n, d] = r === 2 ? [1, 2] : [r, 4];
    const html = `<span style="display:inline-flex;align-items:center;gap:0.8mm;">${w ? `<span>${w}</span>` : ''}`
        + `<span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1.05;font-size:0.85em;">`
        + `<span>${n}</span><span style="border-top:0.35mm solid currentColor;padding:0 0.8mm;">${d}</span></span></span>`;
    return { text: w ? `${w} ${n}/${d}` : `${n}/${d}`, html };
};

/** A row of empty drawing boxes (a picture row to draw in), `label` on its left. */
function boxRows(labels, n, size) {
    const bx = { S: 8, M: 9, L: 10 }[size] || 10, gap = 1.8, labW = Math.max(...labels.map((t) => String(t).length)) * 2.6 + 6;
    const W = labW + n * (bx + gap) + 2, H = labels.length * (bx + 3) + 2;
    let s = '';
    labels.forEach((t, r) => {
        const y = 1 + r * (bx + 3);
        s += `<text x="1" y="${(y + bx * 0.7).toFixed(2)}" font-size="4.2" font-weight="700" font-family="Andika, 'Open Sans', sans-serif">${String(t).replace(/[<&>]/g, '')}</text>`;
        for (let k = 0; k < n; k++) s += `<rect x="${(labW + k * (bx + gap)).toFixed(2)}" y="${y.toFixed(2)}" width="${bx}" height="${bx}" rx="0.8" fill="#fff" stroke="#000" stroke-width="0.35"/>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" style="display:block;width:${W.toFixed(2)}mm;height:auto;max-width:100%;" aria-label="rows of boxes to draw in">${s}</svg>`;
}

/** A square grid to draw rectangles on (1 unit a square). */
function gridFigure(cols, rows, size) {
    const g = Math.min({ S: 5, M: 5.5, L: 6 }[size] || 6, 150 / cols);
    const W = cols * g + 1, H = rows * g + 1;
    let s = '';
    for (let c = 0; c <= cols; c++) s += `<line x1="${(0.5 + c * g).toFixed(2)}" y1="0.5" x2="${(0.5 + c * g).toFixed(2)}" y2="${(H - 0.5).toFixed(2)}" stroke="#949494" stroke-width="0.25"/>`;
    for (let r = 0; r <= rows; r++) s += `<line x1="0.5" y1="${(0.5 + r * g).toFixed(2)}" x2="${(W - 0.5).toFixed(2)}" y2="${(0.5 + r * g).toFixed(2)}" stroke="#949494" stroke-width="0.25"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" style="display:block;width:${W.toFixed(2)}mm;height:auto;max-width:100%;" aria-label="a square grid, 1 unit a square">${s}</svg>`;
}

function tempOpen(q, { size } = {}) {
    const p = payloadOf(q);
    const lo = Number(p.lo), hi = Number(p.hi), t = Number(p.temp);
    const unit = String(p.unit || '°');
    if (![lo, hi, t].every(Number.isFinite)) return null;
    const span = hi - lo;
    const rise = (3 + (Math.abs(t) % 6)) * (span > 20 ? 2 : 1);   // 3 to 8 degrees (6 to 16 on a 2-degree scale)
    const starts = [];
    for (let s = lo; s + rise <= hi; s += span / 5) starts.push(s);
    if (starts.length < 4) return null;
    const row = (s) => [deg(s), deg(s + rise), rise];
    let figure = '';
    try { figure = thermometerSVG({ lo, hi, every: p.every, step: p.step, unit, temp: lo, empty: true }, ctxFor(size)).html; } catch (e) { figure = ''; }
    return {
        prompt: [`On this thermometer the temperature went up ${rise} degrees.`, 'Where could it start and end? Find different ways.'],
        figure,
        columns: [`Start (${unit})`, `End (${unit})`, 'Check: went up'],
        example: row(starts[0]),
        keyRows: starts.slice(1).map(row),
        total: Infinity,
    };
}

function rulerOpen(q, { size } = {}) {
    const p = payloadOf(q);
    const L = Number(p.meas), res = Number(p.res) || 1, len = Number(p.len) || 6;
    if (!Number.isFinite(L) || L <= 0) return null;
    // every mark the ruler has is a start (critic figures-r7, H1: on a quarter-inch ruler the
    // quarter marks are starts too)
    const stepIn = 1 / res;
    const starts = [];
    for (let s = 0; s + L <= len + 1e-9; s += stepIn) starts.push(Math.round(s * 4) / 4);
    if (starts.length < 4) return null;
    const row = (s) => [inchCell(s), inchCell(s + L), inchCell(L)];
    let figure = '';
    try { figure = rulerSVG({ len, res, labels: 'all', object: 'none', start: 0, meas: 0 }, ctxFor(size)).html; } catch (e) { figure = ''; }
    return {
        // the length in words (a slash fraction is never printed, TY-7)
        prompt: [`A ${p.object || 'pencil'} is ${inchWords(L)} long.`,
            'Where on this ruler can it start and end?'],
        figure,
        columns: ['Starts at', 'Ends at', 'Check: how long'],
        example: row(starts[0]),
        keyRows: starts.slice(1).map(row),
        total: starts.length,
    };
}

function perimeterOpen(q, { size } = {}) {
    const p = payloadOf(q);
    const a = Number(p.ans);
    if (!Number.isFinite(a)) return null;
    const N = Math.max(16, Math.min(28, a - (a % 2)));
    const half = N / 2;
    const rows = [];
    for (let l = half - 1; l >= half - l; l--) rows.push([l, half - l, N]);
    if (rows.length < 4) return null;
    const unit = p.unit ? ` ${p.unit}` : '';
    return {
        prompt: [`Draw rectangles on the grid with a perimeter of ${N}${unit}.`, 'Write the length and the width of each.'],
        figure: gridFigure(half - 1, Math.min(half - 1, 7), size),
        columns: ['Length', 'Width', 'Check: perimeter'],
        example: rows[0],
        keyRows: rows.slice(1),
        total: rows.length,
    };
}

/** Bar graph: two bars, one d more than the other, drawn on an empty graph. */
function barOpen(q, { size } = {}) {
    const p = payloadOf(q);
    const cats = (p.categories || []).map(String);
    const vals = (p.values || []).map(Number);
    if (cats.length < 2) return null;
    const [A, B] = cats;
    const intro = q.skillId === 'bar_graph_intro';
    const d = intro ? 1 + ((sum(vals) + A.length) % 2) : 2 * (1 + (sum(vals) % 3));
    const top = intro ? 6 : 20, stepV = intro ? 1 : 2;
    const rows = [];
    for (let b = stepV; b + d <= top; b += stepV) rows.push([b + d, b, d]);
    if (rows.length < 4) return null;
    let figure = '';
    try {
        figure = barGraphSVG({ categories: [A, B], values: [0, 0], step: stepV, top, orientation: 'vertical', catTitle: '', valTitle: intro ? 'How many' : 'Number' }, ctxFor(size)).html;
    } catch (e) { figure = ''; }
    return {
        prompt: intro ? [`Draw the ${A} bar ${d} more than the ${B} bar.`, 'Find other ways.']
            : [`Draw the ${A} bar ${d} more than the ${B} bar.`, 'The scale counts by 2s. Find different graphs.'],
        figure,
        columns: [A, B, 'Check: how many more'],
        example: rows[0],
        keyRows: rows.slice(1),
        total: rows.length,
    };
}

/** Pictograph: one row of N shown with different keys (10 pictures a row at most). A graph of
 * ones: two rows set d apart, drawn in two rows of boxes. */
function pictoOpen(q, { size } = {}) {
    const p = payloadOf(q);
    const cats = (p.categories || []).map(String);
    const vals = (p.values || []).map(Number);
    if (Number(p.scale) === 1 || !Number(p.scale)) {
        if (cats.length < 2) return null;
        const d = 1 + ((sum(vals) + cats[0].length + cats[1].length) % 2);
        const rows = [];
        for (let b = 1; b + d <= 6; b++) rows.push([b, b + d, d]);
        if (rows.length < 4) return null;
        return {
            prompt: [`Draw ${d} more ${cats[1].toLowerCase()} than ${cats[0].toLowerCase()}.`, 'Find other ways.'],
            figure: boxRows([cats[0], cats[1]], 6, size),
            columns: [cats[0], cats[1], 'Check: how many more'],
            example: rows[0],
            keyRows: rows.slice(1),
            total: rows.length,
        };
    }
    const N = [20, 24, 30][sum(vals) % 3];
    const keys = [];
    for (let k = 2; k <= N / 2; k++) if (N % k === 0 && N / k <= 10) keys.push(k);
    const rows = keys.map((k) => [k, N / k, N]);
    if (rows.length < 4) return null;
    return {
        prompt: [`A row shows ${N} children. Choose a key.`, 'How many pictures does the row need? Find different keys.'],
        figure: boxRows([`Key: 1 picture = __`], 10, size),
        columns: ['Each picture stands for', 'Pictures in the row', 'Check: the row shows'],
        example: rows[0],
        keyRows: rows.slice(1),
        total: rows.length,
    };
}

/** Tally chart: a row between B and B + 10, as bundles of 5 and single marks. */
function tallyOpen(q, { size } = {}) {
    const p = payloadOf(q);
    const vals = (p.values || []).map(Number);
    const B = 5 * (2 + (sum(vals) % 3));                    // 10, 15 or 20
    const rows = [];
    for (let v = B + 1; v < B + 10; v++) rows.push([Math.floor(v / 5), v % 5, v]);
    let figure = '';
    try { figure = tallySVG({ categories: ['My row'], values: [0], catTitle: 'Row', valTitle: 'Tally', widest: B + 9 }, ctxFor(size)).html; } catch (e) { figure = ''; }
    return {
        prompt: [`A tally row shows more than ${B} and less than ${B + 10}.`, 'Draw one. Then find different rows.'],
        figure,
        columns: ['Bundles of 5', 'Single marks', 'Check: the number'],
        example: rows[0],
        keyRows: rows.slice(1),
        total: rows.length,
    };
}

/** The open task of a data display, by what it draws. */
const dataOpen = (q, o) => {
    const t = (q && q.cell && q.cell.template) || 'bar-graph';
    return t === 'pictograph' ? pictoOpen(q, o) : t === 'tally-chart' ? tallyOpen(q, o) : barOpen(q, o);
};

/* ============================================================================ temperature */

function tempWrong(q) {
    const p = payloadOf(q);
    const t = Number(p.temp), every = Number(p.every) || 5, st = Number(p.step) === 2 ? 2 : 1;
    if (!Number.isFinite(t)) return null;
    const below = Math.floor(t / every) * every, above = below + every;
    const c = [];
    // M-TM3: a reading below zero written as above zero (the minus sign left off)
    if (t < 0) c.push({ value: -t, misconception: 'M-TM3', explain: 'Read a temperature below zero as above zero: the minus sign is missing.' });
    // M-TM1: read the nearest numbered line, not the small marks
    c.push({ value: Math.round(t / every) * every, misconception: 'M-TM1', explain: 'Read the nearest numbered line, not the small marks.' });
    // M-TM4: started at the number above the column and counted the marks the wrong way
    if (t !== below) c.push({ value: above + (above - t), misconception: 'M-TM4', explain: `Counted the small marks up from ${deg(above)}, not up from ${deg(below)}.` });
    // M-TM5: counted each mark as one degree on a scale of 2 degrees a mark
    if (st === 2 && t !== below) c.push({ value: below + (t - below) / 2, misconception: 'M-TM5', explain: 'Counted each small mark as 1 degree: here a mark is 2 degrees.' });
    // M-TM2: counted the numbered line as the first mark
    c.push({ value: t + st, misconception: 'M-TM2', explain: 'Counted the numbered line as the first mark: one mark too many.' });
    return chooseWrong(q, c);
}

function tempSteps(q) {
    const p = payloadOf(q);
    const t = Number(p.temp), every = Number(p.every) || 5, st = Number(p.step) === 2 ? 2 : 1;
    const below = Math.floor(t / every) * every, k = (t - below) / st;
    const out = [
        step(k ? `The dark column stops between ${deg(below)} and ${deg(below + every)}.` : `The dark column stops at the ${deg(t)} line.`),
        k ? step(`Start at ${deg(below)}. Count up ${k} small mark${k > 1 ? 's' : ''}, ${st} degree${st > 1 ? 's' : ''} each.`)
            : step(`${deg(t)} has a number on the scale.`),
    ];
    if (t < 0) out.push(step('The column stops below 0, so write the minus sign.'));
    out.push(step(`Write ${deg(t)} in the box.`, [{ slot: 'answer', value: deg(t) }]));
    return out;
}

registerSkill('measurement:temperature', {
    strings: strings({
        iCan: 'I Can read a thermometer',
        instructionKey: 'read-thermometer',
        steps: ['Find the top of the dark column.', 'Find the numbered line just below it.', 'Count up the small marks, one degree each.'],
        say: 'The temperature is __ degrees.',
        sayValues: (q) => { const t = Number(payloadOf(q).temp); return [t < 0 ? `minus ${Math.abs(t)}` : t]; },
        // the steps follow the page's thermometer: 1 or 2 degrees a mark, below zero or not
        stepsFor: (q) => {
            const p = payloadOf(q);
            const st = Number(p.step) === 2 ? 2 : 1;
            const out = ['Find the top of the dark column.', 'Find the numbered line just below it.',
                st === 2 ? 'Count up the small marks, 2 degrees each.' : 'Count up the small marks, one degree each.'];
            if (Number(p.lo) < 0) out.push('Below 0? Write a minus sign.');
            return out;
        },
    }),
    misconceptions: ['M-TM1', 'M-TM2', 'M-TM3', 'M-TM4', 'M-TM5'],
    workedSteps: (q) => clampSteps(tempSteps(q)),
    wrongAnswer: tempWrong,
    open: tempOpen,
});

/* ============================================================================ ruler */

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
/** A length in inches as a pupil writes it: 3, 1/2, 2 3/4 (halves never 2/4). */
export function inchText(x, res = 4) {
    const total = Math.round(x * res);
    const w = Math.floor(total / res), r = total % res;
    if (!r) return String(w);
    const g = gcd(r, res);
    const f = `${r / g}/${res / g}`;
    return w ? `${w} ${f}` : f;
}
/** A length in inches as it is said: 3 inches, half an inch, 2 and three quarters inches. */
export function inchWords(x) {
    const q4 = Math.round(x * 4);
    const w = Math.floor(q4 / 4), r = q4 % 4;
    if (!r) return `${w} inch${w === 1 ? '' : 'es'}`;
    if (!w) return ['', 'a quarter of an inch', 'half an inch', 'three quarters of an inch'][r];
    return `${w} and ${['', 'a quarter', 'a half', 'three quarters'][r]} inches`;
}
const mixedSlots = (text) => {
    const m = /^\s*(\d+)?\s*(?:(\d+)\/(\d+))?\s*$/.exec(text) || [];
    return { w: m[1] || '', n: m[2] || '', d: m[3] || '' };
};

function rulerWrong(q) {
    const p = payloadOf(q);
    const meas = Number(p.meas), res = Number(p.res) || 1, len = Number(p.len) || 6;
    const start = Number(p.start) || 0, end = start + meas;
    if (!Number.isFinite(meas)) return null;
    const c = [];
    // (M-RL4 may pass the ruler's end: 6 inches has 7 long marks, 0 to 6, and a pupil who counts
    // the marks, not the spaces, writes 7.)
    const add = (x, misconception, explain) => { if (x > 0 && (x <= len || misconception === 'M-RL4' || misconception === 'M-RL5')) c.push({ x, misconception, explain }); };
    // M-RL5: the object does not start at 0 - wrote the number at its end, not its length
    if (start > 0) add(end, 'M-RL5', `Read the number at the end (${inchText(end, res === 1 ? 1 : 4)}), not the inches from ${start} to the end.`);
    if (res === 4) add(meas + (meas % 1 === 0.75 ? -0.25 : 0.25), 'M-RL1', 'Read the small mark next to the end, not the one it reaches.');
    if (res >= 2) add(meas + 0.5, 'M-RL2', 'Counted a half inch too far.');
    if (end % 1) add(Math.ceil(end) - start, 'M-RL3', 'Read the next inch number after the end, not the one before it.');
    add(meas + 1, 'M-RL4', 'Counted the long marks, not the spaces between them: one too many.');
    return chooseWrong(q, c.map(({ x, misconception, explain }) => {
        const text = inchText(x, res === 1 ? 1 : 4);
        return res === 1
            ? { value: x, misconception, explain }
            : { value: text, misconception, explain, slot: mixedSlots(text).n ? 'n' : 'w', slots: mixedSlots(text) };
    }));
}

function rulerSteps(q) {
    const p = payloadOf(q);
    const meas = Number(p.meas), res = Number(p.res) || 1;
    const start = Number(p.start) || 0, end = start + meas;
    const obj = p.object || 'pencil';
    const ans = inchText(meas, res === 1 ? 1 : 4);
    const parts = mixedSlots(ans);
    const marks = [];
    if (res === 1) marks.push({ slot: 'answer', value: String(meas) });
    else {
        if (parts.w) marks.push({ slot: 'w', value: parts.w });
        if (parts.n) marks.push({ slot: 'n', value: parts.n }, { slot: 'd', value: parts.d });
    }
    const write = step(parts.n ? `Write ${parts.w ? `${parts.w}, then ` : ''}${parts.n} over ${parts.d}.` : `Write ${parts.w || meas}.`, marks);
    const w = Math.floor(end), k = Math.round((end - w) * res);
    const endStep = k
        ? step(`It ends after the ${w} mark: ${k} small space${k > 1 ? 's' : ''}, ${res === 2 ? 'a half' : 'a quarter'} inch each.`)
        : step(`It ends at the long mark with ${w} under it.`);
    if (!start) return [step(`The ${obj} starts at 0.`), endStep, write];
    return [
        step(`The ${obj} starts at ${start}, not at 0.`),
        endStep,
        step(`Count the inches from ${start} to the end: ${inchWords(meas)}.`),
        write,
    ];
}

/** The ruler's strings: the title and the steps follow the marks the page reads (critic round 5). */
function rulerStrings(iCanWhole) {
    const TITLE = { 1: iCanWhole, 2: 'I Can measure to the half inch', 4: 'I Can measure to the quarter inch' };
    const byRes = {};
    for (const r of [1, 2, 4]) {
        byRes[r] = strings({
            iCan: TITLE[r],
            // a half / quarter page says what to do with the fraction boxes on a whole inch (critic
            // figures-r8 F: "6" left them blank with no word to the pupil)
            instructionKey: r === 1 ? 'measure-object' : 'measure-parts',
            steps: ['Find where the object starts.', 'Find where the object ends.', 'Read the number at the end.'],
            say: 'It is __ long.',
            // said in words (a slash fraction is never printed, TY-7)
            sayValues: (q) => [inchWords(Number(payloadOf(q).meas))],
            stepsFor: (q) => {
                const pp = payloadOf(q);
                const moved = Number(pp.start) > 0;
                const out = [moved ? 'Find where the object starts. It is not 0.' : 'The object starts at 0.', 'Find where the object ends.'];
                if (r > 1) out.push(`A small space is ${r === 2 ? 'a half' : 'a quarter'} inch.`);
                out.push(moved ? 'Count the inches from the start to the end.' : 'Read the inches at the end.');
                return out;
            },
        });
    }
    // the marks the page reads: the item's own, else the skill's "Parts" option, else the
    // skill's default (Quarter Inches reads all three)
    const resOf = (ref) => {
        const r = Number(payloadOf(ref && ref.q).res);
        if (byRes[r]) return r;
        const parts = ref && ref.opts && Array.isArray(ref.opts.parts) && ref.opts.parts.length ? ref.opts.parts
            : (ref && ref.skillId === 'reading_ruler_hard' ? [0, 1, 2] : [0]);
        return parts.includes(2) ? 4 : parts.includes(1) ? 2 : 1;
    };
    const fn = (ref = {}) => byRes[resOf(ref || {})](ref);
    fn.def = byRes[1].def;
    return fn;
}
registerSkill('measurement:reading_ruler', {
    strings: rulerStrings('I Can measure to the inch'),
    misconceptions: ['M-RL1', 'M-RL2', 'M-RL3', 'M-RL4', 'M-RL5'],
    workedSteps: (q) => clampSteps(rulerSteps(q)),
    wrongAnswer: rulerWrong,
    open: rulerOpen,
});
registerSkill('measurement:reading_ruler_hard', {
    strings: rulerStrings('I Can measure to the inch'),
    misconceptions: ['M-RL1', 'M-RL2', 'M-RL3', 'M-RL4', 'M-RL5'],
    workedSteps: (q) => clampSteps(rulerSteps(q)),
    wrongAnswer: rulerWrong,
    open: rulerOpen,
});

/* ============================================================================ bar graph, pictograph, tally chart */

/** Which display an item draws: 'bar-graph', 'pictograph' or 'tally-chart'. */
const displayOf = (q) => (q && q.cell && q.cell.template) || 'bar-graph';
/** Does row i of a pictograph end in half a picture? */
const halfRow = (p, i) => { const k = Number(p.values[i]) / (Number(p.scale) || 1); return Math.abs(k - Math.floor(k) - 0.5) < 1e-6; };

function barWrong(q) {
    const p = payloadOf(q);
    const a = p.ask || {};
    const cats = (p.categories || []).map(String);
    const vals = (p.values || []).map(Number);
    const kind = displayOf(q);
    const step1 = Number(p.step) || 1;
    const scale = Number(p.scale) || 1;
    if (!vals.length) return null;
    const c = [];
    const long = kind === 'bar-graph' ? 'bar' : 'row';
    switch (a.kind) {
        case 'value': {
            const i = a.i;
            // M-PG2: counted half a picture as a whole one
            if (kind === 'pictograph' && halfRow(p, i)) c.push({ value: vals[i] + scale / 2, misconception: 'M-PG2', explain: `Counted the half picture as a whole ${scale}: it is ${scale / 2}.` });
            // M-D1: read the bar (row) next to the one asked
            if (i + 1 < vals.length) c.push({ value: vals[i + 1], misconception: 'M-D1', explain: `Read the ${long} next to the one asked.` });
            if (i > 0) c.push({ value: vals[i - 1], misconception: 'M-D1', explain: `Read the ${long} next to the one asked.` });
            // M-D5: read the next number up the scale (a bar graph)
            if (kind === 'bar-graph') c.push({ value: Math.floor(vals[i] / step1) * step1 + step1, misconception: 'M-D5', explain: 'Read the next number up the scale, past the end of the bar.' });
            // M-PG1: counted the pictures, not what each one stands for (a pictograph with a key past 1)
            if (kind === 'pictograph' && scale > 1) c.push({ value: Math.ceil(vals[i] / scale), misconception: 'M-PG1', explain: `Counted the pictures, not ${scale} for each one.` });
            // M-D7: counted one mark or picture twice
            if (kind !== 'bar-graph' && scale === 1) c.push({ value: vals[i] + 1, misconception: 'M-D7', explain: 'Counted one mark twice: one too many.' });
            // M-TL1: counted a bundle of five as four (the line across not counted)
            if (kind === 'tally-chart' && vals[i] >= 5) c.push({ value: vals[i] - Math.floor(vals[i] / 5), misconception: 'M-TL1', explain: 'Did not count the line across: each bundle is 5, not 4.' });
            break;
        }
        case 'total': {
            const tot = sum(vals);
            c.push({ value: tot - vals[vals.length - 1], misconception: 'M-D2', explain: `Left the last ${long} out of the total.` });
            c.push({ value: tot - vals[0], misconception: 'M-D2', explain: `Left the first ${long} out of the total.` });
            break;
        }
        case 'most':
            // M-D3: picked the wrong end
            c.push({ value: cats[vals.indexOf(Math.min(...vals))], misconception: 'M-D3', explain: `Picked the shortest ${long}, not the longest.` });
            break;
        case 'least':
            c.push({ value: cats[vals.indexOf(Math.max(...vals))], misconception: 'M-D3', explain: `Picked the longest ${long}, not the shortest.` });
            break;
        case 'more': {
            const vi = vals[a.i], vj = vals[a.j];
            // M-D4: added the two; M-D6: wrote the bigger one, not how many more
            c.push({ value: vi + vj, misconception: 'M-D4', explain: `Added the two ${long}s instead of finding how many more.` });
            c.push({ value: Math.max(vi, vj), misconception: 'M-D6', explain: `Wrote the longer ${long}, not how many more it has.` });
            break;
        }
        default: break;
    }
    return chooseWrong(q, c);
}

/** How a pupil reads one value off the display, in words (the item's own key and marks). */
function readText(q, i) {
    const p = payloadOf(q);
    const v = Number((p.values || [])[i]);
    const kind = displayOf(q);
    if (kind === 'pictograph') {
        const scale = Number(p.scale) || 1;
        const whole = Math.floor(v / scale) * scale;
        const halfTxt = halfRow(p, i) ? ` Half a picture is ${scale / 2}: ${whole} + ${scale / 2} = ${v}.` : '';
        if (scale === 1) return `Count the pictures: ${countList(1, v)}.`;
        return whole ? `Count the whole pictures by ${scale}s: ${countList(scale, whole, scale)}.${halfTxt}` : `Half a picture is ${scale / 2}.`;
    }
    if (kind === 'tally-chart') {
        const b = Math.floor(v / 5), r = v % 5;
        if (!b) return `Count the marks: ${countList(1, v)}.`;
        return r ? `Count the bundles by 5s to ${b * 5}, then count on ${r}: ${v}.` : `Count the bundles by 5s: ${countList(5, v, 5)}.`;
    }
    const st = Number(p.step) || 1;
    return v % st ? `Follow the end of the bar to the scale: half way from ${v - st / 2} to ${v + st / 2} is ${v}.`
        : `Follow the end of the bar to the scale. It is at ${v}.`;
}

function barSteps(q) {
    const p = payloadOf(q);
    const a = p.ask || {};
    const cats = (p.categories || []).map(String);
    const vals = (p.values || []).map(Number);
    const kind = displayOf(q);
    const unit = kind === 'bar-graph' ? 'bar' : 'row';
    const long = kind === 'bar-graph' && p.orientation !== 'horizontal' ? 'tallest' : 'longest';
    const mark = (v) => [{ slot: 'answer', value: String(v) }];
    switch (a.kind) {
        case 'value': return [
            step(`Find the ${unit} for ${cats[a.i]}.`),
            step(readText(q, a.i)),
            step(`Write ${vals[a.i]}.`, mark(vals[a.i])),
        ];
        case 'most': case 'least': {
            const v = a.kind === 'most' ? Math.max(...vals) : Math.min(...vals);
            const cat = cats[vals.indexOf(v)];
            return [
                step(`Look at all the ${unit}s.`),
                step(`The ${a.kind === 'most' ? long : 'shortest'} ${unit} is ${cat}.`),
                step(`Check the box for ${cat}.`, mark(cat)),
            ];
        }
        case 'more': {
            const vi = vals[a.i], vj = vals[a.j];
            return [
                step(`${cats[a.i]} has ${vi}. ${cats[a.j]} has ${vj}.`),
                step(`Compare: ${cats[a.i]} has more, so subtract.`),
                step(`${vi} − ${vj} = ${vi - vj}.`),
                step(`Write ${vi - vj}.`, mark(vi - vj)),
            ];
        }
        case 'total': {
            const tot = sum(vals);
            return [
                step(`Read every ${unit}: ${vals.join(', ')}.`),
                step(`Add: ${vals.join(' + ')} = ${tot}.`),
                step(`Write ${tot}.`, mark(tot)),
            ];
        }
        default: return [step('Read the title.'), step(`Find the ${unit}.`), step(`Write ${p.answer}.`, mark(p.answer))];
    }
}

function barSay(q) {
    const p = payloadOf(q);
    const a = p.ask || {};
    const cats = (p.categories || []).map(String);
    const vals = (p.values || []).map(Number);
    switch (a.kind) {
        case 'value': return `${cats[a.i]} has ${vals[a.i]}.`;
        case 'most': return `${p.answer} has the most.`;
        case 'least': return `${p.answer} has the least.`;
        case 'more': return `${cats[a.i]} has ${p.answer} more than ${cats[a.j]}.`;
        case 'total': return `They make ${p.answer} in all.`;
        default: return `The answer is ${p.answer}.`;
    }
}

const DATA_MISCONCEPTIONS = ['M-D1', 'M-D2', 'M-D3', 'M-D4', 'M-D5', 'M-D6'];
/**
 * The Steps band (L6, critic round 5): built from what the PAGE deals - the question kinds its
 * forms allow (`p.kinds`) and, for a pictograph, its keys (`p.scales`). A step that only some
 * items need says which ("How many more? Subtract ..."), so no step tells a "most" item to
 * subtract; a page of one key counts by that key.
 */
function dataStepsFor(q) {
    const p = payloadOf(q);
    const kind = displayOf(q);
    const unit = kind === 'bar-graph' ? 'bar' : 'row';
    const kinds = Array.isArray(p.kinds) && p.kinds.length ? p.kinds : [(p.ask || {}).kind || 'value'];
    const scales = Array.isArray(p.scales) && p.scales.length ? p.scales : [Number(p.scale) || 1];
    const pick1 = (k) => kinds.length === 1 && kinds[0] === k;
    const out = [];
    if (kind === 'pictograph' && !(scales.length === 1 && scales[0] === 1)) {
        out.push(scales.length === 1 ? `Read the key: one picture stands for ${scales[0]}.` : 'Read the key: what one picture stands for.');
    }
    const read = kind === 'pictograph'
        ? (scales.length === 1 ? (scales[0] === 1 ? 'Count the pictures in the row.' : `Count the pictures by ${scales[0]}s.`) : 'Count the pictures by the key number.')
        : kind === 'tally-chart' ? 'Count the bundles by 5s, then the single marks.' : 'Follow the end of the bar to the scale.';
    if (kinds.some((k) => k === 'value' || k === 'more' || k === 'total')) {
        out.push(`Find the ${unit} the question names.`, read);
    }
    const tails = [];
    if (kinds.includes('more')) tails.push(pick1('more') ? 'Subtract the smaller number from the bigger one.' : 'How many more? Subtract the smaller number.');
    if (kinds.includes('total')) tails.push(pick1('total') ? `Add the numbers of every ${unit}.` : 'In all? Add all the numbers.');
    if (kinds.includes('most') || kinds.includes('least')) {
        tails.push(kinds.every((k) => k === 'most' || k === 'least') ? `Find the longest or shortest ${unit}. Check its box.` : `Most or fewest? Check the longest or shortest ${unit}.`);
    }
    // four steps at most: the two sums share a line, then the "find the bar" step goes
    if (out.length + tails.length > 4 && kinds.includes('more') && kinds.includes('total')) tails.splice(0, 2, 'How many more? Subtract. In all? Add.');
    const steps = out.concat(tails);
    if (steps.length > 4) { const k = steps.findIndex((x) => /the question names/.test(x)); if (k >= 0) steps.splice(k, 1); }
    return steps.length >= 2 ? steps : steps.concat([`Write the number, or check a box.`]);
}

const dataProvider = (iCan, instructionKey, steps, extra = []) => ({
    strings: strings({ iCan, instructionKey, steps, say: 'The graph shows __.', sayValues: barSay, stepsFor: dataStepsFor }),
    misconceptions: DATA_MISCONCEPTIONS.concat(extra),
    workedSteps: (q) => clampSteps(barSteps(q)),
    wrongAnswer: barWrong,
    open: dataOpen,
});
const BAR_STEPS = ['Read the title and the words on each side.', 'Find the bar the question names.', 'Follow the end of the bar to the scale.'];
registerSkill('graphs:bar_graph', dataProvider('I Can read a bar graph', 'graph', BAR_STEPS));
registerSkill('measurement:bar_graph_intro', dataProvider('I Can read a bar graph', 'graph', BAR_STEPS));
registerSkill('graphs:pictograph', dataProvider('I Can read a pictograph', 'graph',
    ['Read the key: what one picture stands for.', 'Find the row the question names.', 'Count the pictures by the key number.'], ['M-PG1', 'M-PG2']));
registerSkill('measurement:pictograph_intro', dataProvider('I Can read a picture graph', 'graph',
    ['Read the title and the words at the top.', 'Find the row the question names.', 'Count the pictures. One picture is one.'], ['M-D7']));
registerSkill('graphs:tally_chart', dataProvider('I Can read a tally chart', 'tally',
    ['A bundle with a line across is 5.', 'Count the bundles by 5s.', 'Count on the single marks.'], ['M-TL1', 'M-D7']));

/* ============================================================================ build a pictograph */
// AP2 round 6 (critic figures-r7): graphs:build_pictograph - the pupil draws one picture a box.
//   M-PB1 drew one picture too few in a row       M-PB2 drew one picture too many
//   M-PB3 filled every box of a row, not its number

const buildVals = (q) => (payloadOf(q).values || []).map(Number);

function buildWrong(q) {
    const p = payloadOf(q);
    const v = buildVals(q);
    if (!v.length) return null;
    const slots = Math.max(Number(p.slots) || 0, ...v);
    const c = [];
    const at = v.indexOf(Math.max(...v));
    const lo = v.findIndex((x) => x > 1);
    if (lo >= 0) { const w = v.slice(); w[lo] -= 1; c.push({ value: w.join(','), misconception: 'M-PB1', explain: `Drew one picture too few for ${(p.categories || [])[lo]}.` }); }
    { const w = v.slice(); if (w[at] < slots) { w[at] += 1; c.push({ value: w.join(','), misconception: 'M-PB2', explain: `Drew one picture too many for ${(p.categories || [])[at]}.` }); } }
    const mi = v.findIndex((x) => x < slots);
    if (mi >= 0) { const w = v.slice(); w[mi] = slots; c.push({ value: w.join(','), misconception: 'M-PB3', explain: `Filled every box for ${(p.categories || [])[mi]}, not its number.` }); }
    return chooseWrong(q, c);
}

function buildSteps(q) {
    const p = payloadOf(q);
    const cats = (p.categories || []).map(String);
    const v = buildVals(q);
    return [
        step('Read the number in each row.'),
        step(`${cats.map((c, i) => `${c}: ${v[i]}`).join(', ')}.`),
        step('Draw one picture a box for each. Leave the rest empty.', [{ slot: 'answer', value: v.join(',') }]),
    ];
}

function buildOpen(q, { size } = {}) {
    const v = buildVals(q);
    const N = [12, 8, 10][sum(v) % 3];
    const keys = [1, 2, 3, 4, 5, 6].filter((k) => N % k === 0 && N / k <= 12 && N / k >= 2);
    const rows = keys.map((k) => [k, N / k, N]);
    if (rows.length < 4) return null;
    return {
        prompt: [`Draw a row that shows ${N}. Choose what one picture stands for.`, 'Find different rows.'],
        figure: boxRows(['My row'], 12, size),
        columns: ['One picture stands for', 'Pictures', 'Check: the row shows'],
        example: rows[0],
        keyRows: rows.slice(1),
        total: rows.length,
    };
}

registerSkill('graphs:build_pictograph', {
    strings: strings({
        iCan: 'I Can build a pictograph',
        instructionKey: 'build-pictograph',
        steps: ['Read the number in each row.', 'Draw one picture in a box for each.', 'Leave the other boxes empty.'],
        say: 'The row has __ pictures.',
        sayValues: (q) => [buildVals(q)[0]],
    }),
    misconceptions: ['M-PB1', 'M-PB2', 'M-PB3'],
    workedSteps: (q) => clampSteps(buildSteps(q)),
    wrongAnswer: buildWrong,
    open: buildOpen,
});

/* ============================================================================ perimeter */

function perimeterWrong(q) {
    const p = payloadOf(q);
    const sides = (p.sides || []).map(Number);
    if (!sides.length) return null;
    const show = p.show || sides.map(() => true);
    const labelled = sides.filter((_, i) => show[i]);
    const c = [];
    // M-P1: added only the sides with a number on them
    if (labelled.length < sides.length) c.push({ value: sum(labelled), misconception: 'M-P1', explain: 'Added only the sides with numbers on them.' });
    // M-P2: multiplied length by width, found the area
    if (p.shape === 'rectangle' || p.shape === 'square') c.push({ value: sides[0] * sides[1], misconception: 'M-P2', explain: 'Multiplied: found the area, not the distance around.' });
    // M-P4: one length and one width
    if ((p.shape === 'rectangle' || p.shape === 'square') && labelled.length === sides.length) c.push({ value: sides[0] + sides[1], misconception: 'M-P4', explain: 'Added one length and one width, not all four sides.' });
    // M-P3: left one side out
    c.push({ value: sum(sides) - sides[sides.length - 1], misconception: 'M-P3', explain: 'Left one side out.' });
    return chooseWrong(q, c);
}

function perimeterSteps(q) {
    const p = payloadOf(q);
    const sides = (p.sides || []).map(Number);
    const show = p.show || sides.map(() => true);
    const tot = sum(sides);
    const out = [];
    if (show.some((v) => !v)) out.push(step(p.shape === 'pentagon' ? 'A side with no number is as long as the side that matches it.' : 'A side with no number is as long as the side opposite it.'));
    out.push(step(`Go all the way round: ${sides.length} sides, ${sides.join(', ')}.`));
    out.push(step(`Add: ${sides.join(' + ')} = ${tot}.`));
    out.push(step(`Write ${tot} in the box.`, [{ slot: 'answer', value: String(tot) }]));
    return out;
}

registerSkill('area_perimeter:perimeter_intro', {
    strings: strings({
        iCan: 'I Can find the perimeter by adding the sides',
        instructionKey: 'add-sides',
        steps: ['Start at one corner. Go all the way round.', 'Find the length of every side.', 'Add all the sides.'],
        say: 'The perimeter is __.',
        sayValues: (q) => { const p = payloadOf(q); return [`${p.ans} ${p.unit || ''}`.trim()]; },
    }),
    misconceptions: ['M-P1', 'M-P2', 'M-P3', 'M-P4'],
    workedSteps: (q) => clampSteps(perimeterSteps(q)),
    wrongAnswer: perimeterWrong,
    open: perimeterOpen,
});

/** The skills this module gives a real provider (the error-analysis lane's legacy-wrong.js skips them). */
export const FIGURE_PROVIDER_IDS = Object.freeze([
    'measurement:temperature', 'measurement:reading_ruler', 'measurement:reading_ruler_hard',
    'graphs:bar_graph', 'measurement:bar_graph_intro', 'graphs:pictograph', 'measurement:pictograph_intro', 'graphs:tally_chart',
    'area_perimeter:perimeter_intro', 'graphs:build_pictograph',
]);
