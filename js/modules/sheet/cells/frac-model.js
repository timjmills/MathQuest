// js/modules/sheet/cells/frac-model.js
// ONE drawing of a fraction model for paper and screen (RP-2), and the kit template
// `frac-model` that the fraction family prints and shows through (O6 lane AP3, 2026-09-25).
//
// THE MODELS (the `model` option, skill-options.js)
//   area     a rectangle cut into rows x columns of equal parts, shaded row by row
//   bar      a strip cut into equal parts, shaded from the left (RP-90)
//   circle   a circle cut into equal sectors from 12 o'clock, clockwise (RP-90)
//   line     a number line from 0 cut into equal parts, the fraction marked with a dot; only the
//            whole numbers are labelled (RP-1: never the answer's tick)
// A value past 1 (an improper fraction, a mixed number) is a row of whole models with a 3 mm gap,
// the last one partly shaded; its line runs past 1 (RP-92).
//
// Black and white (INK-1): outline 1.5 pt, partitions 0.75 pt, shaded parts flat grey (INK-3);
// with the print dialog's Photocopy-safe switch the grey becomes a 0.75 pt hatch (INK-20..22).
// Sizes are the section 11.2 minimums at S / M / L, widened so a part the pupil shades is at
// least 6 mm (RP-5, RP-93); two fractions compared share one whole (`wholeMm`).
//
// THE TEMPLATE `frac-model` draws one problem as a row of TERMS, each a model with its fraction
// written beside it (RP-91) or under it, joined by signs; one term, or the sign between two, is
// where the pupil answers. payload:
//   task     'write'   write the fraction a model shows (identify, write_fraction)
//            'shade'   shade the model to show the printed fraction (shade_fraction)
//            'pick'    circle the model (A, B, C, D) that shows the printed fraction
//            'sign'    write <, > or = (or = / ≠) in the circle between two models (compare)
//            'op'      a number sentence of fractions; one term holds the answer boxes
//            'part'    name a part of a printed fraction: "3/8  numerator = [ ]" (`part`: 'n' | 'd')
//   terms    [{n, d, w?, kind?, frac?, blank?, letter?}]
//            n / d (w: a mixed number's whole part); kind: a model (none: the fraction alone);
//            frac: 'show' (written), 'none', or where the answer boxes are: 'n', 'd', 'nd'
//            (a fraction), 'wnd' (a mixed number); blank: the model is empty (shade it)
//   joins    one glyph between two terms: '+', '−', '×', '÷', '=', or 'sign' (the answer circle)
//   signs    the signs the circle takes on screen (default < = >; ['=', '≠'] for equivalence)
//   show     {n, d}: the printed fraction of a shade / pick task
//   answer   {n, d, w} | {sign} | {letter} | {shade}: the key
//   wholeMm  one whole's width at L (S and M scale it), for terms that must match
//   fracAt   'left' | 'below' (default: left for one term, below for several)
//   showAbove  a shade task prints its fraction ABOVE a short model (a bar, a rectangle)
// The key writes the answer in the pupil's own boxes (AK-1), shades the pupil's model, rings
// the right letter, or writes the sign in the circle. The screen twin (ctx.options.twin) is the
// same drawing: its boxes carry `data-mq-cell` (joined "/" for a fraction, "mixed" for a mixed
// number) or `data-mq-blank`, the sign circle `data-mq-blank="circle"`, and a shade-it model
// `data-mq-model="shade"` with one `.shade-target` per part (screen-cell.js mountModel).
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

import { register, renderCell } from '../registry.js';
import { esc } from '../cell.js';
import { INK, HATCH } from '../tokens.js';
import { L, P, B, isTwin, sizeOf, digitPt, textPt, inkOf, KEY_FEATURES, GREY, inlineBoxMm } from './k2kit.js';
import { hundredGeom } from './hundred-square.js';
import { escText } from '../frac-text.js';

const PT_MM = 25.4 / 72;
const HEAVY = (1.5 * PT_MM).toFixed(3);   // 1.5 pt outline
const HAIR = (0.75 * PT_MM).toFixed(3);   // 0.75 pt partitions and part ticks
const GAP_MM = 3;                         // RP-92: the gap between whole models

/** Every model a fraction item can be drawn as. */
export const FRAC_MODELS = Object.freeze(['area', 'bar', 'circle', 'line', 'hundred']);

// Section 11.2 minimums (mm) and the part sizes that keep RP-5 (6 mm) when a pupil shades.
const DIM = Object.freeze({
    S: { circle: 36, barW: 48, barH: 14, barPart: 6, cell: 9, linePitch: 10, lineMin: 60, label: 9 },
    M: { circle: 42, barW: 52, barH: 16, barPart: 6, cell: 10, linePitch: 11, lineMin: 66, label: 10 },
    L: { circle: 50, barW: 56, barH: 18, barPart: 6, cell: 11, linePitch: 12, lineMin: 72, label: 12 },
});
/** A fixed whole scales with the preset (S and M are 0.72 and 0.84 of L, the circle minimums). */
const WHOLE_K = Object.freeze({ S: 0.72, M: 0.84, L: 1 });

const f2 = (v) => Number(v).toFixed(2);

/** Rows x columns of an area model: the most square split of d (4 -> 2 x 2, 6 -> 2 x 3, 7 -> 1 x 7). */
export function areaGrid(d) {
    let rows = 1;
    for (let r = 1; r * r <= d; r++) if (d % r === 0) rows = r;
    return { rows, cols: d / rows };
}

function sectorPath(cx, cy, r, a0, a1) {
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${f2(cx)} ${f2(cy)} L${f2(x0)} ${f2(y0)} A${f2(r)} ${f2(r)} 0 ${large} 1 ${f2(x1)} ${f2(y1)} Z`;
}

/** The clip ids of a render: deterministic (a counter), unique within one document. */
let HATCH_SEQ = 0;

/**
 * One part: a shape, grey or paper (or hatched, photocopy-safe), optionally wrapped as a screen
 * shade target. `box` is the part's bounding box, for the hatch lines.
 */
function part(tag, attrs, idx, shaded, o, box) {
    const hatch = shaded && o.hatch;
    const fill = shaded && !hatch ? INK.grey : INK.paper;
    const el = `<${tag} ${attrs} fill="${fill}" stroke="${INK.ink}" stroke-width="${HAIR}"${o.targets ? ` data-fill-color="${INK.grey}"` : ''}/>`;
    let lines = '';
    if (hatch) {
        const id = `fmh${++HATCH_SEQ}`;
        const pitch = HATCH.pitchMm, w = (HATCH.pt * PT_MM).toFixed(3);
        let s = '';
        for (let t = -box.h; t < box.w; t += pitch) {
            s += `<line x1="${f2(box.x + t)}" y1="${f2(box.y + box.h)}" x2="${f2(box.x + t + box.h)}" y2="${f2(box.y)}" stroke="${INK.ink}" stroke-width="${w}"/>`;
        }
        lines = `<clipPath id="${id}"><${tag} ${attrs}/></clipPath><g clip-path="url(#${id})" data-ws-hatch="1">${s}</g>`;
    }
    const body = el + lines;
    return o.targets ? `<g class="shade-target" data-idx="${idx}" data-shaded="0" style="cursor:pointer">${body}</g>` : body;
}

/**
 * The size of one part written inside it: "1/4" stacked, or "0.1" for tenths (`labels`:
 * 'unit' | 'decimal'). Only where the part is wide enough to hold it (6 mm), never shrunk.
 */
function partLabel(kind, d, box, lab) {
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    const t = (x, y, v) => `<text x="${f2(x)}" y="${f2(y)}" text-anchor="middle" font-size="${f2(lab)}" font-weight="700" `
        + `font-family="Andika, sans-serif" fill="${INK.ink}" paint-order="stroke" stroke="${INK.paper}" stroke-width="0.6">${v}</text>`;
    if (kind === 'decimal' && d === 10) return box.w >= 6 ? t(cx, cy + lab * 0.35, '0.1') : '';
    const dw = String(d).length * lab * 0.55;
    if (box.w < Math.max(6, dw + 1.5) || box.h < lab * 2.4) return '';
    const half = Math.max(dw, lab * 0.6) / 2 + 0.4;
    return t(cx, cy - lab * 0.15, '1')
        + `<line x1="${f2(cx - half)}" y1="${f2(cy + lab * 0.05)}" x2="${f2(cx + half)}" y2="${f2(cy + lab * 0.05)}" stroke="${INK.ink}" stroke-width="${HAIR}"/>`
        + t(cx, cy + lab * 0.95, String(d));
}

/** How many whole models a value needs, and how many parts are shaded in all. */
function countsOf(p) {
    const d = Math.max(1, Math.round(Number(p.d) || 1));
    const copies = Math.max(0, Math.round(Number(p.copies) || 0));
    if (copies > 1) {
        // k equal groups of the same fraction (fraction x whole): k models, each shaded n
        return { d, total: Math.max(0, Math.round(Number(p.n) || 0)), models: copies, copies };
    }
    const total = Math.max(0, Math.round((Number(p.w) || 0) * d + (Number(p.n) || 0)));
    const models = Math.max(1, Number(p.models) || Math.ceil(total / d) || 1);
    return { d, total, models, copies: 0 };
}

/** Models per row: a long row of wholes (a mixed number, k groups) folds after `perRow`. */
const perRowOf = (p, models) => {
    const k = Math.round(Number(p.perRow) || 0);
    return k > 0 ? Math.min(k, models) : models;
};

/** One whole's size in mm at a preset. */
function wholeSize(kind, d, size, wholeMm, barHmm = null) {
    const D = DIM[size] || DIM.L;
    const whole = Number(wholeMm) > 0 ? Number(wholeMm) * (WHOLE_K[size] || 1) : null;
    // a slim strip (a mixed number's wholes, k equal groups): read, never shaded by the pupil
    if (kind === 'bar' && Number(barHmm) > 0) return { w: whole || Math.max(D.barW, d * D.barPart), h: Number(barHmm) * (WHOLE_K[size] || 1) };
    if (kind === 'circle') {
        // RP-93: a part at least 6 mm at mid-radius -> D >= 12 d / pi
        const dia = whole || Math.max(D.circle, Math.ceil((12 * d) / Math.PI));
        return { w: dia, h: dia };
    }
    if (kind === 'bar') return { w: whole || Math.max(D.barW, d * D.barPart), h: D.barH };
    if (kind === 'area') {
        if (whole) return { w: whole, h: Math.round(whole * 0.6) };
        const { rows, cols } = areaGrid(d);
        return { w: cols * D.cell, h: rows * D.cell };
    }
    return { w: whole || Math.max(D.lineMin, d * D.linePitch), h: 0 };
}

/**
 * The model's geometry and SVG body (mm, origin 0,0).
 * @returns {{body: string, wMm: number, hMm: number, aria: string}}
 */
export function fracModelGeom(p) {
    const kind = FRAC_MODELS.includes(p.kind) ? p.kind : 'bar';
    const size = DIM[p.size] ? p.size : 'L';
    // tenths and hundredths: the hundred square (hundred-square.js), columns = tenths
    if (kind === 'hundred') return hundredGeom({ n: p.n, d: p.d, w: p.w, size, hatch: !!p.hatch, blank: !!p.blank });
    const D = DIM[size];
    const { d, total, models, copies } = countsOf(p);
    const o = { targets: !!p.targets, hatch: !!p.hatch };
    const blank = !!p.blank || o.targets;
    const one = wholeSize(kind, d, size, p.wholeMm, p.barH);
    let body = '';
    if (kind === 'line') {
        // One line from 0 to the last whole, a tick per part; the whole numbers labelled.
        const lab = D.label * PT_MM;
        const len = one.w * models, x0 = 4, y = 5.5;
        const X = (k) => x0 + (len * k) / (d * models);
        body += `<line x1="${f2(x0 - 2)}" y1="${y}" x2="${f2(X(d * models) + 3)}" y2="${y}" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
        body += `<path d="M${f2(X(d * models) + 4.5)} ${y} l-2.4 -1.3 v2.6 z" fill="${INK.ink}"/>`;
        for (let k = 0; k <= d * models; k++) {
            const whole = k % d === 0;
            const t = whole ? 2.5 : 1.5;
            body += `<line x1="${f2(X(k))}" y1="${f2(y - t)}" x2="${f2(X(k))}" y2="${f2(y + t)}" stroke="${INK.ink}" stroke-width="${whole ? HEAVY : HAIR}"/>`;
            if (whole) {
                body += `<text x="${f2(X(k))}" y="${f2(y + 3 + lab)}" text-anchor="middle" font-size="${f2(lab)}" `
                    + `font-family="Andika, sans-serif" fill="${INK.ink}">${k / d}</text>`;
            }
        }
        if (!blank) body += `<circle cx="${f2(X(total))}" cy="${y}" r="1.25" fill="${INK.ink}" data-frac-dot="${total}"/>`;
        // `hops` (a hint): one arc over each part from 0 to the dot, so the pupil counts the parts
        let top = 0;
        if (p.hops) {
            // the room is kept even for a blank model, so the layout measures the drawn one
            const rise = Math.min(3.2, Math.max(1.8, (X(1) - X(0)) * 0.45));
            for (let k = 0; !blank && k < total; k++) {
                body += `<path d="M${f2(X(k) + 0.4)} ${f2(y - 1)} Q${f2((X(k) + X(k + 1)) / 2)} ${f2(y - 1 - rise * 2)} ${f2(X(k + 1) - 0.4)} ${f2(y - 1)}" `
                    + `fill="none" stroke="${INK.ink}" stroke-width="${HAIR}" data-frac-hop="${k + 1}"/>`;
            }
            top = rise + 1.5;
        }
        if (top) body = `<g transform="translate(0 ${f2(top)})">${body}</g>`;
        return { body, wMm: len + 10, hMm: top + 6 + 3 + lab * 1.3 + 1, aria: `number line from 0 to ${models}` };
    }
    let idx = 0;
    const per = perRowOf(p, models);
    // a part is shaded while the running count is under the total (a mixed number fills whole
    // after whole); k groups of one fraction shade the same n parts of every model
    const on = (i, k) => !blank && (copies ? k < total : i < total);
    for (let m = 0; m < models; m++) {
        const ox = 0.5 + (m % per) * (one.w + GAP_MM), oy = 0.5 + Math.floor(m / per) * (one.h + GAP_MM);
        if (kind === 'circle') {
            const r = one.w / 2, cx = ox + r, cy = oy + r;
            for (let i = 0; i < d; i++, idx++) {
                const a0 = -Math.PI / 2 + (2 * Math.PI * i) / d;
                const a1 = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / d;
                const box = { x: ox, y: oy, w: one.w, h: one.w };
                body += d === 1
                    ? part('circle', `cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r)}"`, idx, on(idx, i), o, box)
                    : part('path', `d="${sectorPath(cx, cy, r, a0, a1)}"`, idx, on(idx, i), o, box);
            }
            body += `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
        } else {
            const { rows, cols } = kind === 'bar' ? { rows: 1, cols: d } : areaGrid(d);
            const cw = one.w / cols, ch = one.h / rows;
            for (let i = 0; i < d; i++, idx++) {
                const r = Math.floor(i / cols), k = i % cols;
                const box = { x: ox + k * cw, y: oy + r * ch, w: cw, h: ch };
                body += part('rect', `x="${f2(box.x)}" y="${f2(box.y)}" width="${f2(cw)}" height="${f2(ch)}"`, idx, on(idx, i), o, box);
                // `labels`: each part names its size (1/4, or 0.1 for tenths) - a hint the pupil reads
                if (p.labels && kind === 'bar') body += partLabel(p.labels, d, box, D.label * PT_MM);
            }
            body += `<rect x="${f2(ox)}" y="${f2(oy)}" width="${f2(one.w)}" height="${f2(one.h)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
        }
    }
    const rowsOf = Math.ceil(models / per);
    const wMm = per * one.w + (per - 1) * GAP_MM + 1, hMm = rowsOf * one.h + (rowsOf - 1) * GAP_MM + 1;
    // the label names the picture and never counts it: the counts are the answer (RUBRIC C2)
    const aria = copies ? `${copies} ${kind} models` : models > 1 ? `${models} ${kind} models` : `${kind} model`;
    return { body, wMm, hMm, aria };
}

/** The model's size in mm at a size preset, before drawing (the layout reads it). */
export function fracModelSize(kind, d, size = 'L', wholeMm = null) {
    const g = fracModelGeom({ kind, d, n: 1, size, wholeMm, blank: true });
    return { wMm: g.wMm, hMm: g.hMm };
}

/**
 * A stand-alone SVG of one model, sized in mm (the legacy print handlers of saved items).
 * @returns {{svg: string, wMm: number, hMm: number}}
 */
export function fracModelSVG(p) {
    const g = fracModelGeom(p);
    const kind = FRAC_MODELS.includes(p.kind) ? p.kind : 'bar';
    const svg = `<svg class="mq-frac-model" data-frac-model="${kind}" data-frac-d="${countsOf(p).d}" viewBox="0 0 ${f2(g.wMm)} ${f2(g.hMm)}" `
        + `width="${f2(g.wMm)}mm" height="${f2(g.hMm)}mm" role="img" aria-label="${g.aria}" `
        + `style="display:inline-block;vertical-align:middle;max-width:100%;height:auto;overflow:visible">${g.body}</svg>`;
    return { svg, wMm: g.wMm, hMm: g.hMm };
}

/**
 * The model at every size preset, for a legacy printed cell (a saved item's markup): the S, M and
 * L drawings in one span; the sheet's preset shows its own (css/sheet-kit.css `.mq-fm`).
 */
export function fracModelSizedHTML(p) {
    const one = (sz) => fracModelSVG(Object.assign({}, p, { size: sz }))
        .svg.replace('<svg class="mq-frac-model"', `<svg class="mq-frac-model" data-fm-size="${sz}"`);
    return `<span class="mq-fm" style="display:inline-block;vertical-align:middle;max-width:100%">${one('S')}${one('M')}${one('L')}</span>`;
}

/** The fraction stacked over a bar (TY-7), in Andika at the surrounding size (legacy screens). */
export function fracStackHTML(n, d, { bold = true } = {}) {
    return `<span class="mq-frac-stack" style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.05;font-weight:${bold ? 700 : 400}">`
        + `<span>${n}</span><span style="display:block;align-self:stretch;min-width:0.9em;border-top:1.5pt solid ${INK.ink};margin:0.06em 0"></span><span>${d}</span></span>`;
}

/* ================================================================== the template */

const GLYPH = { '+': '+', '-': '−', '−': '−', 'x': '×', '×': '×', '/': '÷', '÷': '÷', '=': '=' };

/** The answer written in the pupil's slots, by state: the key's, a wrong one's, or none. */
function answerValues(p, ctx) {
    const a = p.answer || {};
    const whole = !Number(a.n) && Number(a.w) > 0;
    const key = { n: whole ? '' : a.n, d: whole ? '' : a.d, w: a.w || '', sign: a.sign, letter: a.letter, shade: a.shade, part: a.part, answer: a.value };
    // several answer terms: n0, d0, n1, d1 ...
    if (Array.isArray(a.terms)) a.terms.forEach((t, i) => { key[`n${i}`] = t.n; key[`d${i}`] = t.d; key[`w${i}`] = t.w || ''; });
    if (ctx.state === 'blank') return {};
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const out = {};
        const raw = w.value === undefined || w.value === null ? '' : String(w.value).trim();
        const m = /^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/.exec(raw);
        if (m) { out.w = m[1] || ''; out.n = m[2]; out.d = m[3]; }
        else if (/^\d+$/.test(raw)) { out.n = raw; out.d = raw; out.w = raw; out.shade = Number(raw); }
        out.sign = raw; out.letter = raw.toUpperCase(); out.part = raw; out.answer = raw;
        // several answer terms ("1/6 + 1/6 + 1/6", "2 + 3/4"): each term into its own boxes, so a
        // True or False? statement or shown work is written in the sentence itself
        if (Array.isArray(a.terms) && /[+]/.test(raw)) {
            raw.split(/\s*\+\s*/).forEach((part, i) => {
                const f = /^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/.exec(part);
                if (f) { out[`w${i}`] = f[1] || ''; out[`n${i}`] = f[2]; out[`d${i}`] = f[3]; }
                else if (/^\d+$/.test(part)) { out[`w${i}`] = part; out[`n${i}`] = ''; out[`d${i}`] = ''; }
            });
        }
        if (w.slots) for (const k of Object.keys(w.slots)) out[k] = w.slots[k];
        return out;
    }
    return key;
}

/** A writing box for one number of the answer. */
function slotBox(ctx, id, value, mark, graded = true, extra = '', digits = 2) {
    const { w, h } = inlineBoxMm(ctx, digits);
    const ink = value !== '' && value !== undefined && value !== null ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK.ink;
    const hook = isTwin(ctx) && mark ? (mark === 'cell' ? ' data-mq-cell="1" data-mq-w="3"' : ' data-mq-blank="box"') : '';
    // a box the right answer leaves empty (the whole box of 5/8, the parts of a whole-number
    // answer) is not scored: the key leaves it empty on purpose (AK-2)
    return `<span class="fm-box" data-ws-slot="${id}" data-ws-shape="box"${graded ? '' : ' data-ws-graded="0"'}${ink ? ` data-ws-ink="${ink}"` : ''}${hook}${extra} `
        + `style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, w)};height:${L(ctx, h)};`
        + `border:${B(ctx, 0.75)} solid ${INK.ink};border-radius:${L(ctx, 1.25)};background:#fff;font-size:${P(ctx, digitPt(ctx))};`
        + `font-weight:700;line-height:1;color:${color};flex:none;${KEY_FEATURES}">${ink ? esc(value) : ''}</span>`;
}

/** A number written at the digit size. */
const numeral = (ctx, v) => `<span style="font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1.05;${KEY_FEATURES}">${esc(v)}</span>`;

/** A fraction stacked over its bar: numerals or boxes on top and below. */
function stack(ctx, top, bottom, { attrs = '' } = {}) {
    return `<span${attrs} style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;flex:none;">`
        + `${top}<span aria-hidden="true" style="display:block;align-self:stretch;min-width:${L(ctx, 7)};border-top:${B(ctx, 1.5)} solid ${INK.ink};margin:${L(ctx, 0.8)} 0;"></span>${bottom}</span>`;
}

/** The answer terms of a sentence with several (each carries its index `ai`). */
const answerTerms = (p) => (p.terms || []).filter((x) => /^(n|d|w|nd|wnd)$/.test(x.frac || '') && x.ai !== undefined && x.ai !== null);

/** How many answer boxes the payload carries (one box alone is the twin's single blank). */
function boxCount(p) {
    let n = 0;
    for (const t of p.terms || []) n += { n: 1, d: 1, w: 1, nd: 2, wnd: 3 }[t.frac] || 0;
    return n;
}

/** The fraction part of a term: written, or the answer boxes. */
function termFrac(p, t, ctx, vals) {
    const single = boxCount(p) === 1;
    const mark = single ? 'blank' : 'cell';
    const v = (k) => (vals[k] === undefined || vals[k] === null ? '' : String(vals[k]));
    // which of a mixed number's three boxes the answer fills (a whole answer: the whole box only)
    // several answer terms (1/[ ] + 1/[ ] + 1/[ ]): each box's id carries its term's index `ai`;
    // on screen each box names its place (`data-mq-part`) and the term its template, so the
    // term's boxes compose "1/6" or "1 3/4" (screen-cell.js wireCellSlots)
    const sfx = t.ai === undefined || t.ai === null ? '' : String(t.ai);
    const an = sfx ? (((p.answer || {}).terms || [])[t.ai] || {}) : (p.answer || {});
    const wholeOnly = t.frac === 'wnd' && !Number(an.n) && Number(an.w) > 0;
    const noWhole = t.frac === 'wnd' && !Number(an.w) && Number(an.n) > 0;
    const part = sfx && isTwin(ctx) ? (id) => ` data-mq-part="${id}"` : () => '';
    const box = (id) => slotBox(ctx, id + sfx, v(id + sfx), mark, !(wholeOnly && id !== 'w') && !(noWhole && id === 'w'), part(id), p.boxDigits || 2);
    const TPL = { w: '{w}', n: `{n}/${t.d}`, d: `${t.n}/{d}`, nd: '{n}/{d}', wnd: '{w} {n}/{d}' };
    const wrapTerm = (html) => (sfx && isTwin(ctx) && TPL[t.frac] ? `<span data-mq-tpl="${TPL[t.frac]}" style="display:inline-flex;align-items:center;flex:none;">${html}</span>` : html);
    return wrapTerm(termFracInner(p, t, ctx, vals, box, v, sfx));
}

function termFracInner(p, t, ctx, vals, box, v, sfx) {
    switch (t.frac) {
        case 'none': return '';
        case 'text': {
            // a short label ("45%") at the digit size; words ("GCF of 8 and 12") at text size
            const long = String(t.text || '').length > 6;
            return `<span style="font-size:${P(ctx, long ? textPt(ctx) + 4 : digitPt(ctx))};font-weight:700;line-height:1.05;white-space:nowrap;${KEY_FEATURES}">${escText(t.text || '')}</span>`;
        }
        case 'w': {
            // a whole-number answer, with its unit written after the box ("[ ] %", "[ ] squares")
            const u = t.unit ? `<span style="font-size:${P(ctx, t.unit.length > 2 ? textPt(ctx) + 2 : digitPt(ctx))};font-weight:700;line-height:1;flex:none;">${esc(t.unit)}</span>` : '';
            return u ? `<span style="display:inline-flex;align-items:center;gap:${L(ctx, 1.5)};flex:none;">${box('w')}${u}</span>` : box('w');
        }
        case 'n': return stack(ctx, box('n'), numeral(ctx, t.d));
        case 'd': return stack(ctx, numeral(ctx, t.n), box('d'));
        case 'nd': return stack(ctx, box('n'), box('d'), { attrs: isTwin(ctx) && !sfx ? ' data-mq-join="/"' : '' });
        case 'wnd': {
            const wb = box('w');
            return `<span${isTwin(ctx) && !sfx ? ' data-mq-join="mixed"' : ''} style="display:inline-flex;align-items:center;gap:${L(ctx, 1.5)};flex:none;">${wb}`
                + `${stack(ctx, box('n'), box('d'))}</span>`;
        }
        default: {
            const w = Number(t.w) || 0;
            const fr = stack(ctx, numeral(ctx, t.n), numeral(ctx, t.d));
            if (!w) return fr;
            return `<span style="display:inline-flex;align-items:center;gap:${L(ctx, 1)};flex:none;">${numeral(ctx, w)}${Number(t.n) ? fr : ''}</span>`;
        }
    }
}

/** The SVG of a term's model, at the host's scale. */
function termModel(p, t, ctx, { shaded = null, targets = false } = {}) {
    if (!t.kind) return '';
    const size = sizeOf(ctx);
    const n = shaded === null ? t.n : shaded;
    const g = fracModelGeom({
        n, d: t.d, w: shaded === null ? t.w : 0, kind: t.kind, size, wholeMm: p.wholeMm,
        blank: !!t.blank && shaded === null, targets, hatch: !!ctx.photocopySafe,
        models: p.wall && t.kind === 'line' && p.lineWholes ? p.lineWholes : t.blank || shaded !== null ? countsOf(t).models : null,
        copies: t.copies, perRow: p.perRow, barH: p.barH, labels: p.labels || null, hops: !!p.hops,
    });
    const tgt = targets ? ' data-mq-shade="1"' : '';
    return `<svg class="fm-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f2(g.wMm)} ${f2(g.hMm)}" role="img" aria-label="${esc(g.aria)}"${tgt} `
        + `data-frac-model="${esc(t.kind)}" style="display:block;width:${L(ctx, g.wMm)};height:auto;max-width:100%;overflow:visible;">${g.body}</svg>`;
}

/** A sign between two terms, or the answer circle. */
function join(p, j, ctx, vals) {
    if (j === 'sign') {
        const dia = inlineBoxMm(ctx, 1).h;
        const v = vals.sign === undefined || vals.sign === null ? '' : String(vals.sign);
        const ink = v ? inkOf(ctx) : null;
        const hook = isTwin(ctx) ? ` data-mq-blank="circle"${Array.isArray(p.signs) ? ` data-mq-signs="${esc(p.signs.join(','))}"` : ''}` : '';
        return `<span data-ws-slot="sign" data-ws-shape="circle"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} style="display:inline-flex;align-items:center;`
            + `justify-content:center;box-sizing:border-box;width:${L(ctx, dia)};height:${L(ctx, dia)};border:${B(ctx, 0.75)} solid ${INK.ink};`
            + `border-radius:50%;background:#fff;font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;flex:none;`
            + `color:${ink === 'trace' ? GREY : INK.ink};">${ink ? esc(v) : ''}</span>`;
    }
    return `<span aria-hidden="false" style="font-size:${P(ctx, digitPt(ctx))};font-weight:700;line-height:1;flex:none;">${esc(GLYPH[j] || j)}</span>`;
}

/** Is this the key (or a trace) of a shade task: the pupil's model drawn shaded? */
const shadeShown = (p, ctx, vals) => p.task === 'shade' && ctx.state !== 'blank' && Number.isFinite(Number(vals.shade));

function renderTerm(p, t, i, ctx, vals, below) {
    const shade = p.task === 'shade' && t.blank;
    const shaded = shade && shadeShown(p, ctx, vals) ? Number(vals.shade) : null;
    const targets = shade && isTwin(ctx);
    const model = termModel(p, t, ctx, { shaded, targets });
    const frac = termFrac(p, t, ctx, vals);
    let letter = '';
    if (t.letter) {
        const on = vals.letter && String(vals.letter).toUpperCase() === String(t.letter).toUpperCase();
        const ink = on ? inkOf(ctx) : null;
        const ring = on ? `border:${B(ctx, 1.5)} solid ${ink === 'trace' ? GREY : INK.ink};` : `border:${B(ctx, 1.5)} solid transparent;`;
        letter = `<span data-fm-letter="${esc(t.letter)}"${on ? ` data-ws-ink="${ink}"` : ''} style="display:inline-flex;align-items:center;justify-content:center;`
            + `width:${L(ctx, 8)};height:${L(ctx, 8)};border-radius:50%;box-sizing:border-box;${ring}font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;">${esc(t.letter)}</span>`;
    }
    if (t.letter) {
        // a choice: its letter to the left of its model, so a row of choices is as tall as a model
        return `<span class="fm-term" data-fm-term="${i}" style="display:inline-flex;flex-direction:row;align-items:center;gap:${L(ctx, 1.5)};flex:none;">${letter}${model}</span>`;
    }
    const gap = L(ctx, below ? 2 : 5);
    const inner = below
        ? `${model}${frac ? `<span style="display:flex;justify-content:center;">${frac}</span>` : ''}`
        : `${frac}${model}`;
    return `<span class="fm-term" data-fm-term="${i}" style="display:inline-flex;flex-direction:${below ? 'column' : 'row'};align-items:center;gap:${gap};flex:none;">${inner}</span>`;
}

/** A sentence of pictured terms whose answer is a last term with no picture: "= answer" goes under. */
const answerLine = (p) => {
    const t = p.terms || [];
    const last = t[t.length - 1];
    return p.task === 'op' && t.length >= 3 && last && !last.kind && /^(nd|wnd|n|d|w)$/.test(last.frac || '')
        && (t.slice(0, -1).some((x) => x.kind) || !!p.area);
};

/**
 * The area model of a fraction times a fraction (5.NF.4b), drawn WITHOUT the answer (RP-1): a
 * rectangle cut into d1 rows and d2 columns, the first factor's n1 rows shaded, the second
 * factor's n2 columns marked with a bracket under them. The pupil counts the shaded cells inside
 * the bracket and all the cells; the overlap is never set apart.
 */
const AREA_W = 56, AREA_H = 40;
function areaProductGeom(a, size, hatch) {
    const k = (WHOLE_K[size] || 1) * (Number(a.k) > 0 ? Number(a.k) : 1);
    const W = AREA_W * k, H = AREA_H * k;
    const rows = Math.max(1, a.rows | 0), cols = Math.max(1, a.cols | 0);
    const lab = (DIM[size] || DIM.L).label * PT_MM;
    const x0 = 0.5 + lab * 2.4 + 3, y0 = 0.5;
    const cw = W / cols, ch = H / rows;
    const o = { targets: false, hatch };
    let body = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const box = { x: x0 + c * cw, y: y0 + r * ch, w: cw, h: ch };
            body += part('rect', `x="${f2(box.x)}" y="${f2(box.y)}" width="${f2(cw)}" height="${f2(ch)}"`, r * cols + c, r < (a.shadeRows | 0), o, box);
        }
    }
    body += `<rect x="${f2(x0)}" y="${f2(y0)}" width="${f2(W)}" height="${f2(H)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
    const text = (x, y, t) => `<text x="${f2(x)}" y="${f2(y)}" text-anchor="middle" font-size="${f2(lab)}" font-weight="700" font-family="Andika, sans-serif" fill="${INK.ink}">${esc(t)}</text>`;
    // the rows' bracket (left) and the columns' bracket (under), each with its fraction
    const rb = (a.shadeRows | 0) * ch, bx = x0 - 2;
    body += `<path d="M${f2(bx + 1.2)} ${f2(y0)} H${f2(bx)} V${f2(y0 + rb)} H${f2(bx + 1.2)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
    body += text(bx - lab * 1.2 - 0.5, y0 + rb / 2 + lab * 0.35, `${a.n1}/${a.d1}`);
    const cb = (a.markCols | 0) * cw, by = y0 + H + 2;
    body += `<path d="M${f2(x0)} ${f2(by - 1.2)} V${f2(by)} H${f2(x0 + cb)} V${f2(by - 1.2)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
    body += text(x0 + cb / 2, by + lab + 0.8, `${a.n2}/${a.d2}`);
    const wMm = x0 + W + 1, hMm = by + lab * 1.3 + 1.5;
    return { body, wMm, hMm, aria: `area model: rows and columns` };
}
function areaProduct(p, ctx) {
    const g = areaProductGeom(p.area, sizeOf(ctx), !!ctx.photocopySafe);
    return `<svg class="fm-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f2(g.wMm)} ${f2(g.hMm)}" role="img" aria-label="${esc(g.aria)}" `
        + `data-frac-model="area-product" style="display:block;width:${L(ctx, g.wMm)};height:auto;max-width:100%;overflow:visible;">${g.body}</svg>`;
}

/** The printed fraction over "numerator = [ ]": the fraction, the part's name and one box. */
function partRow(p, ctx, vals) {
    const t = (p.terms || [])[0] || {};
    const v = vals.part === undefined || vals.part === null ? '' : String(vals.part);
    const name = p.part === 'd' ? 'denominator' : 'numerator';
    return `<div class="fm-row" style="display:flex;flex-direction:column;flex-wrap:nowrap;align-items:center;justify-content:center;gap:${L(ctx, 4)};">`
        + `${termFrac(p, { n: t.n, d: t.d, frac: 'show' }, ctx, {})}`
        + `<span style="display:inline-flex;align-items:center;gap:${L(ctx, 3)};flex:none;">`
        + `<span style="font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;line-height:1;">${name}</span>`
        + `${join(p, '=', ctx, vals)}${slotBox(ctx, 'part', v, 'blank')}</span></div>`;
}

function renderRow(p, ctx) {
    const vals = answerValues(p, ctx);
    if (p.task === 'part') return partRow(p, ctx, vals);
    if (p.task === 'amount') return amountRow(p, ctx, vals);
    if (p.task === 'count') return countRow(p, ctx, vals);
    if (p.arcs && (p.terms || []).length === 2 && (p.task === 'op' || p.task === 'sign')) return arcsRow(p, ctx, vals);
    const terms = p.terms || [];
    const below = p.fracAt ? p.fracAt === 'below' : terms.length > 1;
    const parts = [];
    // A shade or pick task prints the fraction to show first (RP-91: the fraction, then the model).
    if (p.show && (p.task === 'shade' || p.task === 'pick')) {
        const s = p.show;
        parts.push(`<span class="fm-show" style="display:inline-flex;flex:none;">${termFrac(p, { n: s.n, d: s.d, w: s.w, frac: 'show' }, ctx, {})}</span>`);
    }
    const pick = p.task === 'pick';
    if (p.modelTop && terms[0] && terms[0].kind) {
        // `modelTop`: the first term's model alone above, then the whole sentence in numbers on
        // one line under it (a fraction decomposed into several parts: 4/6 = 1/[ ] + 1/[ ] ...)
        const line = [];
        terms.forEach((t, i) => {
            if (i > 0) line.push(join(p, (p.joins || [])[i - 1] || '', ctx, vals));
            line.push(`<span class="fm-term" data-fm-term="${i}" style="display:inline-flex;flex:none;">${termFrac(p, t, ctx, vals)}</span>`);
        });
        // `wall`: every pictured term's model, one under another on the same whole with their left
        // edges lined up (a fraction wall), so the pupil compares the lengths directly
        const pics = p.wall
            ? `<span class="fm-wall" style="display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 2)};">${terms.filter((t) => t.kind).map((t) => termModel(p, t, ctx)).join('')}</span>`
            : termModel(p, terms[0], ctx);
        // The model and the sentence WRAP: under each other in a cell of one of two columns, side
        // by side (model left, sentence right) when the item has a whole-width cell to itself, so
        // a narrow item never sits pinned in a wide empty cell (RUBRIC H13).
        parts.push(`<span class="fm-mtop" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:${L(ctx, 4)} ${L(ctx, 10)};flex:1 1 auto;min-width:0;">`
            + `<span style="display:flex;flex:none;">${pics}</span><span style="display:flex;align-items:center;gap:${L(ctx, 3)};flex:none;">${line.join('')}</span></span>`);
    } else if (pick) {
        // The choices stand two by two (a 2 x 2 grid), so the cell keeps to one of two columns.
        const cells = terms.map((t, i) => renderTerm(p, t, i, ctx, vals, true)).join('');
        parts.push(`<span class="fm-choices" style="display:inline-grid;grid-template-columns:repeat(${Math.min(2, terms.length)}, auto);`
            + `gap:${L(ctx, 3)} ${L(ctx, 5)};align-items:end;justify-items:center;flex:none;">${cells}</span>`);
    } else if (answerLine(p)) {
        // A number sentence of pictures: the pictures and their signs on one line, "= answer" on
        // the line under it (the sentence stays within one of two columns).
        const n = terms.length - 1;
        const top = [];
        // `stack`: the terms one under another, each with its fraction to the left of its models
        // (a mixed number's wholes need the width); else side by side, the fraction under each
        const stacked = !!p.stack;
        terms.slice(0, n).forEach((t, i) => {
            if (i > 0) top.push(join(p, (p.joins || [])[i - 1] || '', ctx, vals));
            top.push(renderTerm(p, t, i, ctx, vals, !stacked));
        });
        const hold = isTwin(ctx) ? ' data-mq-wrapped="1"' : '';
        let topRow;
        if (stacked) {
            topRow = `<span style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 2)};">${top.join('')}</span>`;
        } else {
            // two lines of one grid: each model above its own number, and the signs on the
            // numbers' line (a sign never floats halfway up a picture)
            const cols = [];
            terms.slice(0, n).forEach((t, i) => {
                if (i > 0) cols.push({ pic: '', num: join(p, (p.joins || [])[i - 1] || '', ctx, vals) });
                cols.push({ pic: termModel(p, t, ctx), num: termFrac(p, t, ctx, vals) });
            });
            // `oneLine` (a story's sentence, one column wide): "= answer" on the numbers' line too
            if (p.oneLine) {
                cols.push({ pic: '', num: join(p, (p.joins || [])[n - 1] || '=', ctx, vals) });
                cols.push({ pic: '', num: termFrac(p, terms[n], ctx, vals) });
            }
            topRow = `<span class="fm-grid" style="display:inline-grid;grid-template-columns:repeat(${cols.length}, auto);column-gap:${L(ctx, 4)};row-gap:${L(ctx, 2)};">`
                + cols.map((c) => `<span style="display:flex;align-items:flex-end;justify-content:center;">${c.pic}</span>`).join('')
                + cols.map((c) => `<span style="display:flex;align-items:center;justify-content:center;">${c.num}</span>`).join('')
                + `</span>`;
        }
        const eq = `${join(p, (p.joins || [])[n - 1] || '=', ctx, vals)}${renderTerm(p, terms[n], n, ctx, vals, true)}`;
        parts.push(`<span style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};flex:none;">`
            + (p.area
                // the area model above a sentence of numbers, the sentence on one line
                ? `${areaProduct(p, ctx)}<span${hold} style="display:flex;align-items:center;gap:${L(ctx, 4)};">${top.join('')}${eq}</span>`
                : p.oneLine && !stacked ? topRow
                    : `${topRow}<span${hold} style="display:flex;align-items:center;gap:${L(ctx, 4)};">${eq}</span>`)
            + `</span>`);
    } else {
        terms.forEach((t, i) => {
            if (i > 0) parts.push(join(p, (p.joins || [])[i - 1] || '', ctx, vals));
            parts.push(renderTerm(p, t, i, ctx, vals, below));
        });
    }
    // A pick task's key rings its letter; the choice itself is the slot (one decision, one slot).
    const slotAttrs = pick ? ` data-ws-slot="answer" data-ws-shape="choice"${vals.letter ? ` data-ws-ink="${inkOf(ctx)}"` : ''}` : '';
    const model = p.task === 'shade' && isTwin(ctx) ? ' data-mq-model="shade"' : '';
    // A shade task's answer is the shading: the model is its slot.
    const shadeSlot = p.task === 'shade' ? ` data-ws-slot="answer" data-ws-shape="draw"${shadeShown(p, ctx, vals) ? ` data-ws-ink="${inkOf(ctx)}"` : ''}` : '';
    // A sentence stays on ONE line on screen too (model, sign, model): the host shrinks the
    // drawing to fit rather than wrap a sign away from what it joins (data-mq-wrapped tells
    // fitTwinRows not to wrap it). A long sum already puts "= answer" on its own line.
    const col = p.task === 'shade' && p.showAbove ? 'flex-direction:column;' : '';
    // several answer terms: their boxes compose "1/6 + 1/6 + 1/6" on screen (screen-cell.js)
    const multi = isTwin(ctx) && answerTerms(p).length > 1 ? ` data-mq-join="${esc(p.answerJoin || ' + ')}"` : '';
    return `<div class="fm-row"${slotAttrs}${shadeSlot}${model}${multi}${isTwin(ctx) ? ' data-mq-wrapped="1"' : ''} style="display:flex;${col}flex-wrap:nowrap;align-items:center;justify-content:center;`
        + `gap:${L(ctx, pick ? 5 : 4)};row-gap:${L(ctx, 4)};">${parts.join('')}</div>`;
}

/** Natural size of the row (mm at the ctx preset), for the layout. */
function rowSize(p, ctx) {
    const size = sizeOf(ctx);
    const dig = digitPt(ctx) * PT_MM;
    const box = inlineBoxMm(ctx, p.boxDigits || 2);
    const terms = p.terms || [];
    const below = p.fracAt ? p.fracAt === 'below' : terms.length > 1;
    const fracW = (t) => (t.frac === 'none' ? 0 : t.frac === 'text' ? String(t.text || '').length * (String(t.text || '').length > 6 ? (textPt(ctx) + 4) * PT_MM * 0.52 : dig * 0.6)
        : t.frac === 'w' && t.unit ? box.w + 1.5 + t.unit.length * (t.unit.length > 2 ? 3 : dig * 0.62)
        : t.frac === 'wnd' ? 2 * box.w + 1.5 : /^(n|d|nd|w)$/.test(t.frac || '') ? box.w
        : Math.max(7, String(Math.max(Number(t.n) || 0, Number(t.d) || 0)).length * dig * 0.62) + (Number(t.w) ? dig * 0.7 : 0));
    const fracH = (t) => (t.frac === 'none' ? 0 : t.frac === 'text' ? dig * 1.05 : t.frac === 'w' ? box.h : /^(n|d|nd|wnd)$/.test(t.frac || '') ? 2 * box.h + 2
        : (!Number(t.n) && Number(t.w)) ? dig * 1.05 : 2 * dig * 1.05 + 2);
    let w = 0, h = 0;
    if (p.task === 'part') {
        const t = terms[0] || {};
        const label = (p.part === 'd' ? 11 : 9) * (textPt(ctx) + 2) * PT_MM * 0.55;
        return { w: Math.max(fracW(t), label + 3 + dig * 0.7 + 3 + box.w), h: fracH(t) + 4 + box.h };
    }
    if (p.task === 'pick') {
        const one = terms.map((t) => (t.kind ? fracModelGeom({ n: t.n, d: t.d, kind: t.kind, size, wholeMm: p.wholeMm, barH: p.barH, blank: true }) : { wMm: 0, hMm: 0 }));
        const cw = Math.max(...one.map((g) => g.wMm)) + 9.5, ch = Math.max(...one.map((g) => g.hMm), 8);
        const cols = Math.min(2, terms.length), rows = Math.ceil(terms.length / cols);
        w = fracW(Object.assign({ frac: 'show' }, p.show || {})) + 5 + cols * cw + (cols - 1) * 5;
        h = Math.max(rows * ch + (rows - 1) * 3, 2 * dig * 1.05 + 2);
        return { w, h };
    }
    if (p.modelTop && terms[0] && terms[0].kind) {
        const geo = (t) => fracModelGeom({ n: t.n, d: t.d, w: t.w, kind: t.kind, size, wholeMm: p.wholeMm, blank: true, barH: p.barH,
            models: p.wall && t.kind === 'line' && p.lineWholes ? p.lineWholes : countsOf(t).models, copies: t.copies, perRow: p.perRow,
            hops: !!p.hops, n0: t.n });
        const gs = (p.wall ? terms.filter((t) => t.kind) : [terms[0]]).map(geo);
        const g = { wMm: Math.max(...gs.map((x) => x.wMm)), hMm: gs.reduce((a, x) => a + x.hMm, 0) + (gs.length - 1) * 2 };
        const joinsW = (terms.length - 1) * (dig * 0.75 + 2 * 3);
        const lineW = terms.reduce((a, t) => a + fracW(t), 0) + joinsW;
        const lineH = Math.max(...terms.map((t) => fracH(t)));
        return { w: Math.max(g.wMm, lineW), h: g.hMm + 4 + lineH };
    }
    const split = answerLine(p);
    const list = split ? terms.slice(0, -1) : terms;
    const stacked = split && !!p.stack;
    const tb = stacked ? false : below;
    list.forEach((t, i) => {
        const g = t.kind ? fracModelGeom({ n: t.n, d: t.d, w: t.w, kind: t.kind, size, wholeMm: p.wholeMm, blank: true, models: countsOf(t).models, copies: t.copies, perRow: p.perRow, barH: p.barH, hops: !!p.hops }) : { wMm: 0, hMm: 0 };
        const tw = tb ? Math.max(g.wMm, fracW(t)) : g.wMm + (fracW(t) ? fracW(t) + 5 : 0);
        const th = tb ? g.hMm + (fracH(t) ? fracH(t) + 2 : 0) : Math.max(g.hMm, fracH(t));
        if (stacked) {
            // one term under another, a sign line between them
            w = Math.max(w, tw);
            h += th + (i > 0 ? dig * 1.05 + 4 : 0);
        } else {
            w += tw + (i > 0 ? 8 + 8 : 0);
            h = Math.max(h, th + (t.letter ? 11 : 0));
        }
    });
    if (split) {
        const last = terms[terms.length - 1];
        if (p.area) {
            // the area model over one line: the numbers, "=", the answer
            const g = areaProductGeom(p.area, size, false);
            w = Math.max(g.wMm, w + 16 + fracW(last));
            h = g.hMm + 3 + Math.max(h, fracH(last));
        } else if (p.oneLine && !stacked) {
            w += 16 + fracW(last);
            h = Math.max(h, (list.reduce((m, t) => Math.max(m, t.kind ? fracModelGeom({ n: t.n, d: t.d, w: t.w, kind: t.kind, size, wholeMm: p.wholeMm, blank: true, models: countsOf(t).models, copies: t.copies, perRow: p.perRow, barH: p.barH }).hMm : 0), 0)) + 2 + fracH(last));
        } else {
            w = Math.max(w, 8 + fracW(last));
            h += fracH(last) + 3;
        }
    }
    if (p.show && p.task === 'shade' && p.showAbove) { w = Math.max(w, 12); h += 2 * dig * 1.05 + 2 + 4; }
    else if (p.show && (p.task === 'shade' || p.task === 'pick')) { w += 12 + 5; h = Math.max(h, 2 * dig * 1.05 + 2); }
    return { w, h };
}

/* ============================================== a fraction of an amount, and find the whole */

/**
 * `task: 'amount'` (build list frac_find_whole; 4.NF.4, 5.NF.4, 6.RP): "3/5 of 40 = [ ]" or
 * "3/5 of a number is 24. The number is [ ]", with an optional BAR MODEL (`bar: true`, a hint):
 * one bar of `d` equal boxes; a brace over the `n` known boxes carries the part (or "?"), a
 * brace under the whole bar carries the whole (or "?"). The boxes are never filled with the
 * answer, the pupil works it out: one box is the whole divided by d. payload:
 *   {task: 'amount', n, d, total, part, ask: 'part' | 'whole', bar, story?, answer: {value}}
 */
const AMOUNT_BAR = Object.freeze({ S: 58, M: 66, L: 74 });
function amountBarGeom(p, size, lab) {
    const d = Math.max(1, p.d | 0), n = Math.max(0, p.n | 0);
    const W = AMOUNT_BAR[size] || AMOUNT_BAR.L, H = ({ S: 9, M: 10, L: 11 })[size] || 11;
    const x0 = 0.5, braceH = 2.4, top = lab * 1.25 + braceH + 1.2, y0 = top;
    const cw = W / d;
    let body = '';
    for (let i = 0; i < d; i++) {
        body += `<rect x="${f2(x0 + i * cw)}" y="${f2(y0)}" width="${f2(cw)}" height="${f2(H)}" fill="${INK.paper}" stroke="${INK.ink}" stroke-width="${HAIR}"/>`;
    }
    body += `<rect x="${f2(x0)}" y="${f2(y0)}" width="${f2(W)}" height="${f2(H)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
    const brace = (xa, xb, y, up) => {
        const m = (xa + xb) / 2, s = up ? -1 : 1;
        return `<path d="M${f2(xa)} ${f2(y)} q0 ${f2(s * braceH * 0.5)} ${f2(braceH * 0.5)} ${f2(s * braceH * 0.5)} H${f2(m - braceH * 0.5)} `
            + `q${f2(braceH * 0.5)} 0 ${f2(braceH * 0.5)} ${f2(s * braceH * 0.5)} q0 ${f2(-s * braceH * 0.5)} ${f2(braceH * 0.5)} ${f2(-s * braceH * 0.5)} `
            + `H${f2(xb - braceH * 0.5)} q${f2(braceH * 0.5)} 0 ${f2(braceH * 0.5)} ${f2(-s * braceH * 0.5)}" fill="none" stroke="${INK.ink}" stroke-width="${HAIR}"/>`;
    };
    const text = (x, y, t) => `<text x="${f2(x)}" y="${f2(y)}" text-anchor="middle" font-size="${f2(lab)}" font-weight="700" font-family="Andika, sans-serif" fill="${INK.ink}">${esc(t)}</text>`;
    const partLab = p.ask === 'part' ? '?' : String(p.part);
    const wholeLab = p.ask === 'whole' ? '?' : String(p.total);
    if (n > 0) {
        body += brace(x0, x0 + n * cw, y0 - 0.8, true);
        body += text(x0 + (n * cw) / 2, y0 - braceH - 1.4, partLab);
    }
    const yb = y0 + H + 0.8;
    body += brace(x0, x0 + W, yb, false);
    body += text(x0 + W / 2, yb + braceH + lab * 1.05, wholeLab);
    return { body, wMm: W + 1, hMm: yb + braceH + lab * 1.35 + 0.5, aria: `bar model in ${d} equal parts` };
}
/**
 * `pic: 'set'`: the whole as a SET of counters dealt into d equal groups, each group a ring of
 * open counters in a pattern a pupil sees at a glance (4 = 2 x 2, 6 = 3 x 2), the rings in rows
 * - the pupil shades the groups he needs. Nothing is shaded or counted for him (RP-1); counters
 * are at least 4 mm (RP-3).
 */
const SET_DOT = Object.freeze({ S: 4.2, M: 4.4, L: 4.8 });
const SET_PITCH = Object.freeze({ S: 5.6, M: 6, L: 6.4 });
const SET_PER_LINE = Object.freeze({ 1: 1, 2: 2, 3: 3, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 3, 10: 5 });
const SET_MAX_W = Object.freeze({ S: 66, M: 72, L: 78 });
function amountSetGeom(p, size) {
    const d = Math.max(1, p.d | 0), per = Math.max(1, Math.round(p.total / d));
    const dot = SET_DOT[size] || SET_DOT.L, q = SET_PITCH[size] || SET_PITCH.L, pad = 1.6, sep = 3;
    const perLine = SET_PER_LINE[per] || Math.ceil(Math.sqrt(per));
    const lines = Math.ceil(per / perLine);
    const gw = (perLine - 1) * q + dot + 2 * pad, gh = (lines - 1) * q + dot + 2 * pad;
    const across = Math.max(1, Math.min(d, Math.floor(((SET_MAX_W[size] || 78) + sep) / (gw + sep))));
    const rowsOf = Math.ceil(d / across);
    let body = '';
    for (let g = 0; g < d; g++) {
        const row = Math.floor(g / across), col = g % across;
        const inRow = Math.min(across, d - row * across);
        // a short last row is centred under the full ones
        const ox = 0.5 + (across - inRow) * (gw + sep) / 2 + col * (gw + sep), oy = 0.5 + row * (gh + sep);
        body += `<rect x="${f2(ox)}" y="${f2(oy)}" width="${f2(gw)}" height="${f2(gh)}" rx="${f2(Math.min(gw, gh) * 0.3)}" fill="none" stroke="${INK.ink}" stroke-width="${HAIR}"/>`;
        for (let i = 0; i < per; i++) {
            const ln = Math.floor(i / perLine), k = i % perLine;
            const inLine = Math.min(perLine, per - ln * perLine);
            const cx = ox + pad + dot / 2 + (perLine - inLine) * q / 2 + k * q, cy = oy + pad + dot / 2 + ln * q;
            body += `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(dot / 2)}" fill="${INK.paper}" stroke="${INK.ink}" stroke-width="${HAIR}"/>`;
        }
    }
    return { body, wMm: 1 + across * gw + (across - 1) * sep, hMm: 1 + rowsOf * gh + (rowsOf - 1) * sep, aria: `${d} equal groups of counters` };
}
function amountRow(p, ctx, vals) {
    const size = sizeOf(ctx);
    const lab = (DIM[size] || DIM.L).label * PT_MM * 1.25;
    const v = vals.answer === undefined || vals.answer === null ? '' : String(vals.answer);
    const f = `<span style="display:inline-flex;align-items:center;flex:none;">${stack(ctx, numeral(ctx, p.n), numeral(ctx, p.d))}</span>`;
    const word = (t) => `<span style="font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;line-height:1.2;flex:none;">${esc(t)}</span>`;
    const box = slotBox(ctx, 'answer', v, 'blank', true, '', Math.max(2, String(p.answer && p.answer.value).length));
    const fNum = `<span style="display:inline-flex;align-items:center;flex:none;">${stack(ctx, slotBox(ctx, 'answer', v, 'blank'), numeral(ctx, p.d))}</span>`;
    const line = p.ask === 'whole'
        ? `${f}${word('of')}${box}${join(p, '=', ctx, vals)}${numeral(ctx, p.part)}`
        : p.ask === 'num'
            ? `${fNum}${word('of')}${numeral(ctx, p.total)}${join(p, '=', ctx, vals)}${numeral(ctx, p.part)}`
            : `${f}${word('of')}${numeral(ctx, p.total)}${join(p, '=', ctx, vals)}${box}`;
    let bar = '';
    if (p.pic === 'set') {
        const g = amountSetGeom(p, size);
        bar = `<svg class="fm-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f2(g.wMm)} ${f2(g.hMm)}" role="img" aria-label="${esc(g.aria)}" `
            + `data-frac-model="amount-set" style="display:block;width:${L(ctx, g.wMm)};height:auto;max-width:100%;overflow:visible;">${g.body}</svg>`;
    } else if (p.bar) {
        const g = amountBarGeom(p, size, lab);
        bar = `<svg class="fm-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f2(g.wMm)} ${f2(g.hMm)}" role="img" aria-label="${esc(g.aria)}" `
            + `data-frac-model="amount-bar" style="display:block;width:${L(ctx, g.wMm)};height:auto;max-width:100%;overflow:visible;">${g.body}</svg>`;
    }
    return `<div class="fm-row" data-ws-slot-row="amount" style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 4)};">`
        + `${bar}<span style="display:flex;align-items:center;gap:${L(ctx, 3)};">${line}</span></div>`;
}
function amountSize(p, ctx) {
    const size = sizeOf(ctx);
    const dig = digitPt(ctx) * PT_MM;
    const box = inlineBoxMm(ctx, 3);
    const fw = Math.max(7, String(p.d).length * dig * 0.62);
    const numW = (v) => String(v).length * dig * 0.62;
    const lineW = fw + 3 + 7 + 3 + box.w + 3 + dig * 0.7 + 3 + numW(p.ask === 'whole' ? p.part : p.total);
    const lineH = Math.max(2 * dig * 1.05 + 2, p.ask === 'num' ? 2 * box.h + 2 : box.h);
    if (p.pic === 'set') { const g = amountSetGeom(p, size); return { w: Math.max(lineW, g.wMm), h: g.hMm + 4 + lineH }; }
    if (!p.bar) return { w: lineW, h: lineH };
    const g = amountBarGeom(p, size, (DIM[size] || DIM.L).label * PT_MM * 1.25);
    return { w: Math.max(lineW, g.wMm), h: g.hMm + 4 + lineH };
}

/* ============================================================== operator arcs (pane V187) */

/**
 * `arcs` (build list vis_operator_arcs): an ARC over the two numerators and one under the two
 * denominators of "a/b = c/d", each carrying its operator - "× 4" (the hint), or "×" and an empty
 * box the pupil fills (his working, not scored) - so the pupil sees that top and bottom change by
 * the same factor. payload.arcs = {op: '×' | '÷', k, show: 'value' | 'blank'}. Drawn only on a
 * sentence of two fractions; the geometry is fixed in mm, so the arcs meet the fractions' centres.
 */
function arcsRow(p, ctx, vals) {
    const a = p.arcs || {};
    const terms = p.terms || [];
    const dig = digitPt(ctx) * PT_MM;
    const box = inlineBoxMm(ctx, 2);
    const colW = (t) => Math.max(10, /^(n|d|nd)$/.test(t.frac || '') ? box.w + 2 : Math.max(String(t.n).length, String(t.d).length) * dig * 0.62 + 3);
    const w0 = colW(terms[0]), w1 = colW(terms[1]), eqW = dig * 0.8 + 6;
    const W = w0 + eqW + w1;
    const c0 = w0 / 2, c1 = w0 + eqW + w1 / 2;
    const archH = 5, labPt = Math.max(textPt(ctx), 12), glyphPt = Math.round(digitPt(ctx) * 0.7);
    const show = a.show === 'blank' ? 'blank' : 'value';
    const opGlyph = a.op === '÷' || a.op === '/' ? '÷' : '×';
    const kVal = ctx.state === 'answered' || ctx.state === 'traced' || show === 'value' ? String(a.k) : '';
    const label = (id) => {
        if (show === 'value') return `<span style="font-size:${P(ctx, glyphPt)};font-weight:700;line-height:1;background:#fff;padding:0 ${L(ctx, 1)};${KEY_FEATURES}">${opGlyph} ${esc(a.k)}</span>`;
        const bw = Math.max(8, box.w * 0.7), bh = Math.max(7, box.h * 0.7);
        if (isTwin(ctx)) {
            // on screen a scratch box the pupil can type in (never scored), marked as he goes
            // (word-work-screen.js reads `data-mq-expect`)
            return `<span style="display:inline-flex;align-items:center;gap:${L(ctx, 0.8)};background:#fff;padding:0 ${L(ctx, 1)};">`
                + `<span style="font-size:${P(ctx, glyphPt)};font-weight:700;line-height:1;">${opGlyph}</span>`
                + `<input type="text" class="mq-wwork" data-mq-kind="number" data-mq-expect="${esc(a.k)}" data-ws-graded="0" inputmode="numeric" maxlength="2" autocomplete="off" `
                + `aria-label="${opGlyph === '×' ? 'multiplied by' : 'divided by'}" style="box-sizing:border-box;width:max(44px, ${L(ctx, bw)});height:max(44px, ${L(ctx, bh)});`
                + `border:${B(ctx, 0.75)} solid ${INK.ink};border-radius:${L(ctx, 1)};background:#fff;color:${INK.ink};font-family:'Andika','Open Sans',sans-serif;`
                + `font-size:${P(ctx, labPt)};font-weight:700;text-align:center;padding:0;"></span>`;
        }
        const ink = kVal ? inkOf(ctx) : null;
        return `<span style="display:inline-flex;align-items:center;gap:${L(ctx, 0.8)};background:#fff;padding:0 ${L(ctx, 1)};">`
            + `<span style="font-size:${P(ctx, glyphPt)};font-weight:700;line-height:1;">${opGlyph}</span>`
            + `<span data-ws-slot="${id}" data-ws-shape="box" data-ws-graded="0"${ink ? ` data-ws-ink="${ink}"` : ''} style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;`
            + `width:${L(ctx, bw)};height:${L(ctx, bh)};border:${B(ctx, 0.75)} solid ${INK.ink};border-radius:${L(ctx, 1)};background:#fff;font-size:${P(ctx, labPt)};font-weight:700;`
            + `color:${ink === 'trace' ? GREY : INK.ink};${KEY_FEATURES}">${ink ? esc(kVal) : ''}</span></span>`;
    };
    const arc = (down, id) => {
        // the ends touch the two fractions (numerators above, denominators below); the operator
        // sits just past the apex, off the curve, so nothing covers the arc
        const yEnd = down ? 0.4 : archH - 0.4, yCtl = down ? 2 * archH - 0.4 : -archH + 0.4;
        const path = `M${f2(c0)} ${f2(yEnd)} Q${f2((c0 + c1) / 2)} ${f2(yCtl)} ${f2(c1)} ${f2(yEnd)}`;
        // the arrowhead at the pupil's fraction, pointing at it
        const tip = down ? `M${f2(c1)} ${f2(yEnd)} l-1.3 2.4 l2.6 0 z` : `M${f2(c1)} ${f2(yEnd)} l-1.3 -2.4 l2.6 0 z`;
        const svg = `<svg viewBox="0 0 ${f2(W)} ${f2(archH)}" style="display:block;width:${L(ctx, W)};height:${L(ctx, archH)};overflow:visible;" aria-hidden="true">`
            + `<path d="${path}" fill="none" stroke="${INK.ink}" stroke-width="${HAIR}"/><path d="${tip}" fill="${INK.ink}"/></svg>`;
        const off = (c0 + c1) / 2 - W / 2;
        const lab = `<span style="display:flex;justify-content:center;width:${L(ctx, W)};transform:translateX(${L(ctx, off)});">${label(id)}</span>`;
        return down ? svg + lab : lab + svg;
    };
    const cell = (t, i) => `<span class="fm-term" data-fm-term="${i}" style="display:flex;justify-content:center;width:${L(ctx, i ? w1 : w0)};flex:none;">${termFrac(p, t, ctx, vals)}</span>`;
    const mid = `<span style="display:flex;justify-content:center;align-items:center;width:${L(ctx, eqW)};flex:none;">${join(p, (p.joins || [])[0] || '=', ctx, vals)}</span>`;
    return `<div class="fm-row fm-arcs"${isTwin(ctx) ? ' data-mq-wrapped="1"' : ''} style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 0.8)};">`
        + `${arc(false, 'arc-top')}<span style="display:flex;align-items:center;">${cell(terms[0], 0)}${mid}${cell(terms[1], 1)}</span>${arc(true, 'arc-bottom')}</div>`;
}
function arcsSize(p, ctx) {
    const terms = p.terms || [];
    const dig = digitPt(ctx) * PT_MM;
    const box = inlineBoxMm(ctx, 2);
    const colW = (t) => Math.max(10, /^(n|d|nd)$/.test(t.frac || '') ? box.w + 2 : Math.max(String(t.n).length, String(t.d).length) * dig * 0.62 + 3);
    const W = colW(terms[0]) + dig * 0.8 + 6 + colW(terms[1]);
    const fracH = Math.max(2 * dig * 1.05 + 2, 2 * box.h + 2);
    const labH = Math.max(7, box.h * 0.7) + 1;
    return { w: W + 16, h: fracH + 2 * (5 + labH) + 4 * 0.8 + 2 };
}

/* =================================================================== count in fractions */

/**
 * `task: 'count'` (build list frac_count; 3.NF.A.2, 3.NF.A.3c; WRM Y3.B6.S8-S9, Y4.B7.S9): a
 * count in unit fractions, 1/4, 2/4, 3/4, 1, 1 1/4 ..., as a row of TILES, each tile a count
 * written as a fraction, a whole number or a mixed number, and the missing ones the pupil's boxes;
 * over the tiles (`line`, a hint) a number line with a tick over every tile, the wholes heavy, so
 * the pupil sees the count move one equal part at a time and pass through 1 whole.
 * payload: {task: 'count', d, tiles: [{n, d, w?, frac: 'show' | 'nd' | 'w' | 'wnd', ai?}], line,
 *           answer: {terms: [{w, n, d}], text}}
 */
function countGeom(p, ctx) {
    const dig = digitPt(ctx) * PT_MM;
    const box = inlineBoxMm(ctx, p.boxDigits || 2);
    const tileW = (t) => {
        if (t.frac === 'wnd') return 2 * box.w + 1.5;
        if (/^(nd|w)$/.test(t.frac || '')) return box.w;
        const fw = Math.max(String(t.n).length, String(t.d).length) * dig * 0.62;
        return Number(t.w) ? (Number(t.n) ? dig * 0.62 * String(t.w).length + 1 + Math.max(7, fw) : dig * 0.62 * String(t.w).length) : Math.max(7, fw);
    };
    // every tile as wide as it needs (a mixed number's boxes are wide); the ticks sit over the
    // tiles' centres, so the line's parts are only as even as the tiles
    const ws = (p.terms || []).map((t) => tileW(t) + 3);
    const gap = 6;
    const xs = [];
    let x = 0;
    ws.forEach((w) => { xs.push(x + w / 2); x += w + gap; });
    return { ws, xs, gap, W: Math.max(0, x - gap) };
}
function countRow(p, ctx, vals) {
    const tiles = p.terms || [];
    const { ws, xs, gap, W } = countGeom(p, ctx);
    let line = '';
    if (p.line) {
        const y = 4, x0 = xs[0], x1 = xs[xs.length - 1];
        let b = `<line x1="${f2(x0 - 3)}" y1="${y}" x2="${f2(x1 + 3)}" y2="${y}" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
        b += `<path d="M${f2(x1 + 4.5)} ${y} l-2.4 -1.3 v2.6 z" fill="${INK.ink}"/>`;
        tiles.forEach((t, i) => {
            const x = xs[i];
            const whole = t.whole;
            const h = whole ? 2.5 : 1.6;
            b += `<line x1="${f2(x)}" y1="${f2(y - h)}" x2="${f2(x)}" y2="${f2(y + h)}" stroke="${INK.ink}" stroke-width="${whole ? HEAVY : HAIR}"/>`;
        });
        line = `<svg viewBox="0 0 ${f2(W + 6)} 8" style="display:block;width:${L(ctx, W + 6)};height:${L(ctx, 8)};overflow:visible;" aria-hidden="true">${b}</svg>`;
    }
    const cells = tiles.map((t, i) => `<span class="fm-term" data-fm-term="${i}" style="display:flex;justify-content:center;align-items:center;width:${L(ctx, ws[i])};flex:none;">${termFrac(p, t, ctx, vals)}</span>`).join('');
    const joinAttr = isTwin(ctx) ? ` data-mq-join="${esc(p.answerJoin || ', ')}"` : '';
    return `<div class="fm-row fm-count"${joinAttr}${isTwin(ctx) ? ' data-mq-wrapped="1"' : ''} style="display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 1.5)};">`
        + `${line}<span style="display:flex;align-items:center;gap:${L(ctx, gap)};">${cells}</span></div>`;
}
function countSize(p, ctx) {
    const dig = digitPt(ctx) * PT_MM;
    const box = inlineBoxMm(ctx, p.boxDigits || 2);
    const { W } = countGeom(p, ctx);
    const h = Math.max(2 * dig * 1.05 + 2, 2 * box.h + 2) + (p.line ? 8 + 1.5 : 0);
    return { w: W + 6, h };
}

/** A story over the sentence (a fraction word problem): one sentence per line (P-WP-17), its fractions stacked. */
const STORY_PT = (ctx) => textPt(ctx) + 2;
function storyBlock(p, ctx) {
    const lines = Array.isArray(p.story) ? p.story.filter(Boolean) : [];
    if (!lines.length) return '';
    return `<div class="fm-story ws-story-lines" style="font-size:${P(ctx, STORY_PT(ctx))};line-height:1.45;text-align:left;margin:0 0 ${L(ctx, 4)};">`
        + lines.map((l) => `<div>${escText(l)}</div>`).join('') + `</div>`;
}
function storySize(p, ctx) {
    const lines = Array.isArray(p.story) ? p.story.filter(Boolean) : [];
    if (!lines.length) return { w: 0, h: 0 };
    const pt = STORY_PT(ctx) * PT_MM;
    // a stacked fraction in a line makes it taller (TY-7)
    const h = lines.reduce((t, l) => t + pt * (/\d\s*\/\s*\d/.test(l) ? 1.95 : 1.45), 0) + 4;
    const w = Math.max(...lines.map((l) => String(l).replace(/(\d+)\s*\/\s*(\d+)/g, '$1').length)) * pt * 0.5;
    return { w, h };
}

register('frac-model', {
    render(p, ctx) {
        const twin = isTwin(ctx);
        return `<div class="k2-cell fm-cell" data-fm-task="${esc(p.task || '')}"${twin ? ' data-mq-k2="1"' : ''} `
            + `style="color:${INK.ink};font-family:'Andika','Open Sans',sans-serif;text-align:center;">${storyBlock(p, ctx)}${renderRow(p, ctx)}</div>`;
    },
    answerKey(p) {
        const a = p.answer || {};
        if (p.task === 'shade') return { value: String(a.shade), display: `${a.shade} parts shaded`, slots: { answer: { value: String(a.shade), graded: true } } };
        if (p.task === 'pick') return { value: a.letter, display: a.letter, slots: { answer: { value: a.letter, graded: true } } };
        if (p.task === 'sign') return { value: a.sign, display: a.sign, slots: { sign: { value: a.sign, graded: true } } };
        if (p.task === 'part') return { value: Number(a.part), display: String(a.part), slots: { part: { value: String(a.part), graded: true } } };
        if (p.task === 'amount') return { value: Number(a.value), display: String(a.value), slots: { answer: { value: String(a.value), graded: true } } };
        const multi = answerTerms(p);
        if (multi.length > 1) {
            const slots = {};
            const parts = [];
            multi.forEach((t) => {
                const at = (a.terms || [])[t.ai] || {};
                const whole = t.frac === 'w' || (t.frac === 'wnd' && !Number(at.n));
                const noW = t.frac === 'wnd' && !Number(at.w);
                if (/w/.test(t.frac)) slots[`w${t.ai}`] = { value: at.w ? String(at.w) : '', graded: !noW };
                if (/n/.test(t.frac)) slots[`n${t.ai}`] = { value: whole ? '' : String(at.n), graded: !whole };
                if (/d/.test(t.frac)) slots[`d${t.ai}`] = { value: whole ? '' : String(at.d), graded: !whole };
                parts.push(whole ? String(at.w) : `${at.w && /w/.test(t.frac) ? `${at.w} ` : ''}${at.n}/${at.d}`);
            });
            const display = a.text || parts.join(' + ');
            return { value: display, display, slots };
        }
        const t = (p.terms || []).find((x) => /^(n|d|w|nd|wnd)$/.test(x.frac || '')) || {};
        const slots = {};
        // a whole-number answer in a mixed number's boxes: the whole box only (never "0/1")
        const part = t.frac !== 'wnd' || Number(a.n) > 0;
        if (/n/.test(t.frac)) slots.n = { value: part ? String(a.n) : '', graded: part };
        if (/d/.test(t.frac)) slots.d = { value: part ? String(a.d) : '', graded: part };
        if (t.frac === 'wnd' || t.frac === 'w') slots.w = { value: a.w ? String(a.w) : '', graded: !!a.w || t.frac === 'w' };
        const display = t.frac === 'n' ? String(a.n) : t.frac === 'd' ? String(a.d) : t.frac === 'w' ? String(a.w || 0)
            : `${a.w ? `${a.w} ` : ''}${Number(a.n) ? `${a.n}/${a.d}` : ''}`.trim() || String(a.w || 0);
        return { value: t.frac === 'n' ? Number(a.n) : t.frac === 'd' ? Number(a.d) : t.frac === 'w' ? Number(a.w || 0) : display, display, slots };
    },
    footprint(p, ctx) {
        const r = p.task === 'amount' ? amountSize(p, ctx) : p.task === 'count' ? countSize(p, ctx)
            : p.arcs && (p.terms || []).length === 2 && (p.task === 'op' || p.task === 'sign') ? arcsSize(p, ctx) : rowSize(p, ctx);
        const st = storySize(p, ctx);
        const wMm = Math.ceil(Math.max(r.w, st.w) + 8), hMm = Math.ceil(r.h + st.h + 8);
        // a story keeps its lines whole: two columns at most, one when a line is longer than half the page
        const maxCols = wMm <= 56 && !st.h ? 3 : wMm <= 88 ? 2 : 1;
        return { wMm, hMm, measure: true, factLike: false, maxCols };
    },
    inputs(p) {
        if (p.task === 'shade') return [{ id: 'answer', kind: 'number', shape: 'draw', graded: true, order: 0, scopes: ['full'] }];
        if (p.task === 'pick') return [{ id: 'answer', kind: 'choice', shape: 'choice', graded: true, order: 0, scopes: ['full'] }];
        if (p.task === 'sign') return [{ id: 'sign', kind: 'sign', shape: 'circle', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
        if (p.task === 'part') return [{ id: 'part', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
        if (p.task === 'amount') return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
        const multi = answerTerms(p);
        if (multi.length > 1) {
            const ids = [];
            multi.forEach((t) => { if (/w/.test(t.frac)) ids.push(`w${t.ai}`); if (/n/.test(t.frac)) ids.push(`n${t.ai}`); if (/d/.test(t.frac)) ids.push(`d${t.ai}`); });
            return ids.map((id, k) => ({ id, kind: 'number', shape: 'box', graded: true, order: k, inputmode: 'numeric', scopes: ['full'] }));
        }
        const t = (p.terms || []).find((x) => /^(n|d|w|nd|wnd)$/.test(x.frac || '')) || {};
        const ids = t.frac === 'wnd' ? ['w', 'n', 'd'] : t.frac === 'nd' ? ['n', 'd'] : [t.frac || 'n'];
        return ids.map((id, k) => ({ id, kind: 'number', shape: 'box', graded: true, order: k, inputmode: 'numeric', scopes: ['full', 'answer-only'] }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'value', requiresVisual: true }; },
});

/** The screen twin of a frac-model cell (the same drawing at the host's scale). */
export function fracTwin(payload) {
    const html = renderCell({ cell: { template: 'frac-model', payload, v: 1 } }, { mode: 'print', size: 'L', look: 'ican', state: 'blank', options: { twin: true } });
    return `<div class="k2-twin" data-mq-template="frac-model" style="text-align:center;color:${INK.ink};">${html}</div>`;
}
