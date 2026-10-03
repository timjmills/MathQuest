// js/modules/sheet/refline.js
// THE REFERENCE NUMBER LINE AT THE TOP OF THE PAGE (design/MASTER_PLAN.md Wave 5.2, owner 2026-10-03).
//
// A support option on the skills where a number line helps (skill-options.js numberLineOptions):
// ONE line printed under the header, above the cells, on every page of the sheet and of its key,
// and above the practice card / the online worksheet on screen. It is a HINT scaffold
// (PEDAGOGY_STANDARD 4.1): off is the fade.
//
// It extends the support panes' number line (cells/panes/models.js markedLine): the same kit
// (black and white, Andika, strokes from the closed set, RP-50 axis 1.5 pt with solid arrowheads,
// labelled ticks 5 mm at 1.5 pt, part ticks 3 mm at 0.75 pt, labels below at zone-label size,
// fraction labels stacked). It is drawn across the full live width; it never shrinks its type to
// fit a long range - it raises the label interval (and thins the ticks) instead.
//
// Every label is a REFERENCE SCALE number (`data-ws-ref="1"`, kit.js): printed evenly, never
// singled out, so the answer may be one of them (SUPPORTS.md §S4.2).
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

import { SW, n2, st, text, mm, pc, textW, esc } from './cells/panes/kit.js';
import { arrowHead } from './cells/panes/models.js';

/** The step values a teacher can choose (skill-options.js nlStep). 'auto' = from the page. */
export const NL_STEP_VALUES = Object.freeze(['auto', '1', '2', '5', '10', '20', '25', '50', '100', '1000',
    '1/2', '1/3', '1/4', '1/5', '1/6', '1/8', '1/10', '1/12', '0.1', '0.01']);
export const NL_FRAC_DENS = Object.freeze([2, 3, 4, 5, 6, 8, 10, 12]);
/** Which ticks carry a number (nlLabels). */
export const NL_LABEL_VALUES = Object.freeze(['auto', 'all', '2', '5', '10', 'ends', 'none']);
/** Small ticks between two steps (nlMinor). */
export const NL_MINOR_VALUES = Object.freeze(['auto', '0', '2', '4', '5', '10']);

const EPS = 1e-9;
const NICE = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const lcm = (a, b) => (a / gcd(a, b)) * b;

/** A step as an exact ratio: {num, den, kind: 'whole'|'frac'|'dec'}. null for 'auto' / unknown. */
export function parseStep(s) {
    const t = String(s == null ? '' : s).trim();
    let m = /^1\/(\d+)$/.exec(t);
    if (m) return { num: 1, den: Number(m[1]), kind: 'frac' };
    m = /^0\.(0*)1$/.exec(t);
    if (m) return { num: 1, den: 10 ** (m[1].length + 1), kind: 'dec' };
    if (/^\d+$/.test(t) && Number(t) > 0) return { num: Number(t), den: 1, kind: 'whole' };
    return null;
}
export const stepValue = (st0) => st0.num / st0.den;
export const stepName = (st0) => (st0.kind === 'frac' ? `1/${st0.den}` : st0.kind === 'dec' ? String(1 / st0.den) : String(st0.num));

/* ------------------------------------------------------------------ the numbers a page uses */

const MINUS = /[−–]/g;
const cleanNum = (s) => Number(String(s).replace(MINUS, '-').replace(/,/g, ''));
const placesOf = (s) => { const m = /\.(\d+)/.exec(String(s)); return m ? m[1].length : 0; };

/** Numbers in a piece of text: mixed numbers, fractions, decimals and whole numbers (commas allowed). */
export function numbersInText(s) {
    let t = String(s == null ? '' : s).replace(/<sup>(\d+)<\/sup>\s*(?:\/|⁄)?\s*<sub>(\d+)<\/sub>/g, ' $1/$2 ')
        .replace(/<[^>]*>/g, ' ').replace(/&minus;/g, '−').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ');
    const out = [];
    t = t.replace(/([-−]?)(\d+)\s+(\d+)\s*\/\s*(\d+)/g, (m, sg, w, a, b) => {
        if (Number(b) > 0) out.push({ v: (sg ? -1 : 1) * (Number(w) + Number(a) / Number(b)), den: Number(b), places: 0 });
        return ' ';
    });
    t = t.replace(/(^|[^\d.])([-−]?)(\d+)\s*\/\s*(\d+)/g, (m, pre, sg, a, b) => {
        if (Number(b) > 0) out.push({ v: (sg ? -1 : 1) * Number(a) / Number(b), den: Number(b), places: 0 });
        return pre + ' ';
    });
    const re = /(^|[^\w.])([-−]?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?/g;
    let m;
    while ((m = re.exec(t))) {
        // A minus sign is a sign only when it is not the operator between two numbers ("7 - 2").
        const before = t.slice(0, m.index + m[1].length).trimEnd();
        const signed = m[2] && !/[\d)]$/.test(before);
        const raw = (signed ? '-' : '') + m[3] + (m[4] || '');
        const v = cleanNum(raw);
        if (Number.isFinite(v)) out.push({ v, den: 1, places: placesOf(raw) });
    }
    return out;
}

const PAYLOAD_KEYS = ['a', 'b', 'c', 'operands', 'terms', 'numbers', 'values', 'start', 'target', 'value', 'whole'];
function payloadNumbers(p, out, depth = 0) {
    if (!p || typeof p !== 'object' || depth > 3) return;
    if (Array.isArray(p)) { p.forEach((x) => (typeof x === 'number' ? out.push({ v: x, den: 1, places: placesOf(x) }) : payloadNumbers(x, out, depth + 1))); return; }
    if (Number.isFinite(Number(p.n)) && Number(p.d) > 0 && typeof p.n !== 'object') {
        const w = Number(p.w || p.whole || 0);
        out.push({ v: w + Number(p.n) / Number(p.d), den: Number(p.d), places: 0 });
        return;
    }
    for (const k of PAYLOAD_KEYS) {
        const v = p[k];
        if (typeof v === 'number' && Number.isFinite(v)) out.push({ v, den: 1, places: placesOf(v) });
        else if (typeof v === 'string' && /^[-−]?\d/.test(v)) out.push(...numbersInText(v));
        else if (v && typeof v === 'object') payloadNumbers(v, out, depth + 1);
    }
}

/** Every number one generated item uses: its text, its answer and its cell payload. */
export function lineNumbers(q) {
    if (!q || typeof q !== 'object') return [];
    const out = numbersInText(q.text);
    const a = q.ans;
    if (typeof a === 'number' && Number.isFinite(a)) out.push({ v: a, den: 1, places: placesOf(a) });
    else if (typeof a === 'string') out.push(...numbersInText(a));
    if (q.cell && q.cell.payload) payloadNumbers(q.cell.payload, out);
    return out.filter((x) => Number.isFinite(x.v) && Math.abs(x.v) < 1e7);
}

/* ------------------------------------------------------------------ the line's spec */

/**
 * The default line for a page's numbers: it always covers every one of them. Fractions give a
 * fraction step (their common denominator when it is one of the offered ones), decimals 0.1 or
 * 0.01, whole numbers a step of 1 up to a span of 20 and a "nice" step above.
 */
export function defaultLine(nums = [], { fraction = false } = {}) {
    const vals = nums.map((x) => x.v).filter(Number.isFinite);
    let lo = Math.min(0, ...vals), hi = Math.max(...vals, 0);
    if (!vals.length) { lo = 0; hi = 20; }
    const fracDens = nums.filter((x) => x.den > 1 && Math.abs(x.v - Math.round(x.v)) > EPS).map((x) => x.den);
    const allDens = nums.filter((x) => x.den > 1).map((x) => x.den);
    const places = Math.max(0, ...nums.map((x) => x.places || 0));
    let step;
    if (fracDens.length || (fraction && allDens.length)) {
        const L = (fracDens.length ? fracDens : allDens).reduce(lcm, 1);
        const den = NL_FRAC_DENS.includes(L) ? L : Math.max(...(fracDens.length ? fracDens : allDens).filter((d) => NL_FRAC_DENS.includes(d)), 2);
        step = { num: 1, den, kind: 'frac' };
        lo = Math.floor(lo); hi = Math.max(Math.ceil(hi), lo + 1);
    } else if (places >= 1) {
        step = { num: 1, den: places >= 2 ? 100 : 10, kind: 'dec' };
        lo = Math.floor(lo); hi = Math.max(Math.ceil(hi), lo + 1);
    } else {
        const span = Math.max(1, hi - lo);
        const s = span <= 20 ? 1 : (NICE.find((k) => span / k <= 20) || 100000);
        step = { num: s, den: 1, kind: 'whole' };
        // Round the ends out to a friendly number: fives on a line of ones (0 to 20, not 0 to 17),
        // two steps on a longer one (0 to 100 by 5, not 0 to 95).
        const r = s === 1 ? 5 : 2 * s;
        lo = Math.floor(lo / r) * r; hi = Math.ceil(hi / r) * r;
        if (s === 1 && hi - lo < 10 && lo >= 0) hi = lo + 10;
        if (hi <= lo) hi = lo + 10 * s;
    }
    return { from: lo, to: hi, step };
}

/** True when every number lies on the line's span. */
export function lineCovers(spec, nums = []) {
    const missing = nums.map((x) => x.v).filter((v) => v < spec.from - EPS || v > spec.to + EPS);
    return { ok: !missing.length, missing: [...new Set(missing)].sort((a, b) => a - b) };
}

/**
 * Resolve the teacher's options (nlFrom, nlTo, nlStep, nlLabels, nlMinor, nlHops) against the
 * page's numbers. Unset values come from the numbers. Returns the spec plus `covers`/`missing`,
 * and a `warn` line for the panel when the teacher's own range misses some of them.
 */
export function resolveLine(opts = {}, nums = [], { fraction = false } = {}) {
    const d = defaultLine(nums, { fraction });
    const own = parseStep(opts.nlStep);
    const hasFrom = opts.nlFrom !== null && opts.nlFrom !== undefined && opts.nlFrom !== '' && Number.isFinite(Number(opts.nlFrom));
    const hasTo = opts.nlTo !== null && opts.nlTo !== undefined && opts.nlTo !== '' && Number.isFinite(Number(opts.nlTo));
    let step = own || d.step;
    // An Auto step on the teacher's own range counts in what suits THAT range (−10 to 10 by ones).
    if (!own && step.kind === 'whole' && (hasFrom || hasTo)) {
        const span = Math.max(1, Math.abs((hasTo ? Number(opts.nlTo) : d.to) - (hasFrom ? Number(opts.nlFrom) : d.from)));
        step = { num: span <= 20 ? 1 : (NICE.find((k) => span / k <= 20) || 100000), den: 1, kind: 'whole' };
    }
    const sv = stepValue(step);
    let from = hasFrom ? Number(opts.nlFrom) : (own ? Math.floor(d.from / sv + EPS) * sv : d.from);
    let to = hasTo ? Number(opts.nlTo) : (own ? Math.ceil(d.to / sv - EPS) * sv : d.to);
    if (to < from) [from, to] = [to, from];
    if (to - from < sv - EPS) to = from + sv;
    const spec = {
        from, to, step,
        labels: NL_LABEL_VALUES.includes(String(opts.nlLabels)) ? String(opts.nlLabels) : 'auto',
        minor: NL_MINOR_VALUES.includes(String(opts.nlMinor)) ? String(opts.nlMinor) : 'auto',
        hops: !!opts.nlHops,
    };
    const cov = lineCovers(spec, nums);
    const fmt = (v) => String(Math.round(v * 1000) / 1000).replace('-', '−');
    spec.covers = cov.ok;
    spec.missing = cov.missing;
    spec.warn = cov.ok ? '' : `The number line runs ${fmt(from)} to ${fmt(to)}, but the page uses ${cov.missing.slice(0, 4).map(fmt).join(', ')}${cov.missing.length > 4 ? ' …' : ''}. Widen it or leave Start and End on Auto.`;
    return spec;
}

/* ------------------------------------------------------------------ the drawing */

/** The label of tick index i: {whole: '3'} or {num: '5', den: '4'} (stacked). */
function labelOf(i, step) {
    if (step.kind === 'frac') {
        const g = gcd(i, step.den);
        if (i % step.den === 0) return { whole: String(i / step.den).replace('-', '−') };
        return { num: String(i * step.num).replace('-', '−'), den: String(step.den), g };
    }
    if (step.kind === 'dec') {
        const places = String(step.den).length - 1;
        const v = (i * step.num) / step.den;
        return { whole: (Number.isInteger(v) ? String(v) : v.toFixed(places)).replace('-', '−') };
    }
    const v = i * step.num;
    return { whole: (Math.abs(v) >= 10000 ? v.toLocaleString('en-US') : String(v)).replace('-', '−') };
}
const labelWidth = (lab, pt) => (lab.whole !== undefined ? textW(lab.whole, pt) : Math.max(textW(lab.num, pt), textW(lab.den, pt)));

/**
 * The geometry of the line across `widthMm`. `c` is the pane kit's context (pc()).
 * Returns {w, h, body, label, labelEvery, tickEvery, notes}.
 */
export function refLineGeom(c, spec, widthMm) {
    const step = spec.step;
    const notes = [];
    let i0 = Math.round((spec.from * step.den) / step.num);
    let i1 = Math.round((spec.to * step.den) / step.num);
    if (Math.abs(i0 * step.num / step.den - spec.from) > EPS) i0 = Math.floor((spec.from * step.den) / step.num + EPS);
    if (Math.abs(i1 * step.num / step.den - spec.to) > EPS) i1 = Math.ceil((spec.to * step.den) / step.num - EPS);
    if (i1 <= i0) i1 = i0 + 1;
    const W = Math.max(60, widthMm);
    const pad = 6;
    const usable = W - 2 * pad;
    const n = i1 - i0;
    const pitch = usable / n;
    const pt = c.S.zonePt;
    const frac = step.kind === 'frac';
    // Ticks: every step while they stand 1.5 mm apart, else every 2nd, 5th, 10th ... (on round numbers).
    const tickEvery = NICE.find((k) => k * pitch >= 1.5) || NICE[NICE.length - 1];
    if (tickEvery > 1) notes.push(`ticks every ${tickEvery} steps (the range is long)`);
    // Labels: never smaller type; a wider interval instead.
    let maxW = 0;
    for (let i = i0; i <= i1; i += Math.max(1, Math.ceil(n / 400))) maxW = Math.max(maxW, labelWidth(labelOf(i, step), pt));
    maxW = Math.max(maxW, labelWidth(labelOf(i0, step), pt), labelWidth(labelOf(i1, step), pt));
    const gapMm = 1.5;
    const fitEvery = NICE.find((k) => k % tickEvery === 0 && k * pitch >= maxW + gapMm) || NICE[NICE.length - 1];
    const want = spec.labels;
    let labelEvery = 0;
    if (want === 'all') labelEvery = tickEvery;
    else if (want === '2' || want === '5' || want === '10') labelEvery = Number(want) * tickEvery;
    else if (want === 'auto') labelEvery = fitEvery;
    if (labelEvery && labelEvery < fitEvery) {
        notes.push(`labels every ${fitEvery} steps so the numbers do not crowd`);
        labelEvery = NICE.find((k) => k >= fitEvery && k % labelEvery === 0) || fitEvery;
    }
    const hopEvery = spec.hops ? (n / tickEvery <= 40 ? tickEvery : (labelEvery || fitEvery)) : 0;
    // Minor ticks between two drawn ticks.
    let minor = spec.minor === 'auto' ? 0 : Number(spec.minor) || 0;
    if (spec.minor === 'auto' && step.kind === 'whole' && tickEvery === 1 && step.num > 1) {
        minor = [10, 5, 4, 2].find((m) => step.num % m === 0 && pitch / m >= 1.6) || 0;
    }
    if (minor && (pitch * tickEvery) / minor < 1.2) { notes.push('no small ticks: they would touch'); minor = 0; }

    const hopH = hopEvery ? 7 : 0;
    const axisY = 3.2 + hopH;
    const labTop = axisY + 2.5 + 1.6;
    const H = labTop + (frac ? mm(pt) * 2.25 : mm(pt) * 1.05) + 1;
    const x = (i) => pad + (i - i0) * pitch;
    const oneEnd = spec.from === 0 && step.kind === 'whole';
    let body = `<line x1="${n2(oneEnd ? pad : 1)}" y1="${n2(axisY)}" x2="${n2(W - 1)}" y2="${n2(axisY)}" ${st(c, SW.heavy)}/>`;
    if (!oneEnd) body += arrowHead(c, 0, axisY, -1);
    body += arrowHead(c, W, axisY, 1);
    const onGrid = (i, k) => k > 0 && ((i % k) + k) % k === 0;
    // Both ends always carry their number (the pupil reads where the line starts and stops); a grid
    // label too close to an end gives way to it.
    const nearEnd = (i) => !(i === i0 || i === i1) && (Math.abs(i - i0) * pitch < maxW + gapMm || Math.abs(i1 - i) * pitch < maxW + gapMm);
    const labelled = (i) => (want === 'none' ? false : (i === i0 || i === i1) ? true : want === 'ends' ? false : onGrid(i, labelEvery) && !nearEnd(i));
    let labels = '', ticks = '', hops = '';
    for (let i = i0; i <= i1; i++) {
        const drawn = onGrid(i, tickEvery) || i === i0 || i === i1;
        if (drawn) {
            const big = labelled(i) || (frac && i % step.den === 0);
            ticks += `<line x1="${n2(x(i))}" y1="${n2(axisY - (big ? 2.5 : 1.5))}" x2="${n2(x(i))}" y2="${n2(axisY + (big ? 2.5 : 1.5))}" ${st(c, big ? SW.heavy : SW.hair)}/>`;
        }
        if (minor && onGrid(i, tickEvery) && i + tickEvery <= i1) {
            for (let m = 1; m < minor; m++) {
                const mx = x(i) + (m * pitch * tickEvery) / minor;
                ticks += `<line x1="${n2(mx)}" y1="${n2(axisY - 1)}" x2="${n2(mx)}" y2="${n2(axisY + 1)}" ${st(c, SW.fine)}/>`;
            }
        }
        if (hopEvery && onGrid(i, hopEvery) && i + hopEvery <= i1) {
            const xa = x(i), xb = x(i + hopEvery), xm = (xa + xb) / 2, top = axisY - 1.2 - Math.min(5.5, (xb - xa) * 0.45);
            hops += `<path d="M${n2(xa + 0.4)} ${n2(axisY - 1.2)}Q${n2(xm)} ${n2(top)} ${n2(xb - 0.4)} ${n2(axisY - 1.2)}" fill="none" ${st(c, SW.hair)}/>`
                + `<path d="M${n2(xb - 0.4)} ${n2(axisY - 1.2)}l-1.6 -1.1l0.3 1.7Z" fill="#000" ${st(c, SW.fine)}/>`;
        }
        if (!labelled(i)) continue;
        const lab = labelOf(i, step);
        if (lab.whole !== undefined) labels += text(c, x(i), labTop + mm(pt) * 0.8, lab.whole, { pt, ref: true });
        else {
            const bw = Math.max(textW(lab.num, pt), textW(lab.den, pt)) + 0.8;
            labels += `<g data-ws-ref="1" data-ws-frac="1">${text(c, x(i), labTop + mm(pt) * 0.8, lab.num, { pt, ref: true })}`
                + `<line x1="${n2(x(i) - bw / 2)}" y1="${n2(labTop + mm(pt) * 1.05)}" x2="${n2(x(i) + bw / 2)}" y2="${n2(labTop + mm(pt) * 1.05)}" ${st(c, SW.one)}/>`
                + `${text(c, x(i), labTop + mm(pt) * 1.98, lab.den, { pt, ref: true })}</g>`;
        }
    }
    // Labels the teacher asked for but did not get (each end): not repeated here, the dialog names them.
    if (want === 'all' || want === 'auto') { /* ends handled above */ }
    body += ticks + hops + labels;
    const lf = (v) => String(Math.round(v * 1000) / 1000).replace('-', '−');
    return { w: W, h: H, body, label: `number line ${lf(i0 * step.num / step.den)} to ${lf(i1 * step.num / step.den)}, steps of ${stepName(step)}`, tickEvery, labelEvery, notes };
}

/**
 * The band: the line across `widthMm` (paper: the live width; screen: the host's width / px per mm).
 * Returns {html, hMm, notes}. `twin` draws it for a screen host at `pxPerMm`.
 */
export function refLineHTML(spec, { size = 'M', widthMm = 186, twin = false, pxPerMm = 3.4, ink = 'black', hMm: fixedH = 0 } = {}) {
    const c = pc({ size, twin, ink });
    const g = refLineGeom(c, spec, widthMm);
    const M = 0.6;
    const vw = g.w + 2 * M, vh = g.h + 2 * M;
    const width = twin ? `${Math.round(vw * pxPerMm)}px` : `${n2(vw)}mm`;
    const svg = `<svg class="ws-refline-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${-M} ${-M} ${n2(vw)} ${n2(vh)}" role="img" aria-label="${esc(g.label)}" `
        + `style="display:block;width:${width};height:auto;max-width:100%;overflow:visible;">${g.body}</svg>`;
    const natural = Math.ceil((vh + 2.5) * 10) / 10;
    // A host that reserved the band already (print-sheet.js) keeps its height: the page was laid out with it.
    const hMm = fixedH > 0 ? Math.max(fixedH, 0) : natural;
    const html = `<div class="ws-refline" data-ws-support="refline" data-ws-band="refline" data-ws-answer-free="1" data-ws-scaffold="hint" `
        + `style="flex:none;${twin ? '' : `height:${hMm}mm;`}box-sizing:border-box;padding-top:1.5mm;display:flex;justify-content:center;color:#000;background:#fff;font-family:'Andika',sans-serif;line-height:1;">${svg}</div>`;
    return { html, hMm, natural, notes: g.notes, geom: { tickEvery: g.tickEvery, labelEvery: g.labelEvery } };
}

export default { parseStep, numbersInText, lineNumbers, defaultLine, lineCovers, resolveLine, refLineGeom, refLineHTML };
