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

const PT_MM = 25.4 / 72;
const HEAVY = (1.5 * PT_MM).toFixed(3);   // 1.5 pt outline
const HAIR = (0.75 * PT_MM).toFixed(3);   // 0.75 pt partitions and part ticks
const GAP_MM = 3;                         // RP-92: the gap between whole models

/** Every model a fraction item can be drawn as. */
export const FRAC_MODELS = Object.freeze(['area', 'bar', 'circle', 'line']);

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

/** How many whole models a value needs, and how many parts are shaded in all. */
function countsOf(p) {
    const d = Math.max(1, Math.round(Number(p.d) || 1));
    const total = Math.max(0, Math.round((Number(p.w) || 0) * d + (Number(p.n) || 0)));
    const models = Math.max(1, Number(p.models) || Math.ceil(total / d) || 1);
    return { d, total, models };
}

/** One whole's size in mm at a preset. */
function wholeSize(kind, d, size, wholeMm) {
    const D = DIM[size] || DIM.L;
    const whole = Number(wholeMm) > 0 ? Number(wholeMm) * (WHOLE_K[size] || 1) : null;
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
    const D = DIM[size];
    const { d, total, models } = countsOf(p);
    const o = { targets: !!p.targets, hatch: !!p.hatch };
    const blank = !!p.blank || o.targets;
    const one = wholeSize(kind, d, size, p.wholeMm);
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
        return { body, wMm: len + 10, hMm: 6 + 3 + lab * 1.3 + 1, aria: `number line from 0 to ${models} in parts of 1/${d}` };
    }
    let idx = 0;
    for (let m = 0; m < models; m++) {
        const ox = 0.5 + m * (one.w + GAP_MM), oy = 0.5;
        if (kind === 'circle') {
            const r = one.w / 2, cx = ox + r, cy = oy + r;
            for (let i = 0; i < d; i++, idx++) {
                const a0 = -Math.PI / 2 + (2 * Math.PI * i) / d;
                const a1 = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / d;
                const box = { x: ox, y: oy, w: one.w, h: one.w };
                body += d === 1
                    ? part('circle', `cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r)}"`, idx, !blank && idx < total, o, box)
                    : part('path', `d="${sectorPath(cx, cy, r, a0, a1)}"`, idx, !blank && idx < total, o, box);
            }
            body += `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
        } else {
            const { rows, cols } = kind === 'bar' ? { rows: 1, cols: d } : areaGrid(d);
            const cw = one.w / cols, ch = one.h / rows;
            for (let i = 0; i < d; i++, idx++) {
                const r = Math.floor(i / cols), k = i % cols;
                const box = { x: ox + k * cw, y: oy + r * ch, w: cw, h: ch };
                body += part('rect', `x="${f2(box.x)}" y="${f2(box.y)}" width="${f2(cw)}" height="${f2(ch)}"`, idx, !blank && idx < total, o, box);
            }
            body += `<rect x="${f2(ox)}" y="${f2(oy)}" width="${f2(one.w)}" height="${f2(one.h)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
        }
    }
    const wMm = models * one.w + (models - 1) * GAP_MM + 1, hMm = one.h + 1;
    const aria = `${models > 1 ? `${models} ${kind} models` : `${kind} model`} in ${d} equal parts${blank ? '' : `, ${total} shaded`}`;
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
    const key = { n: a.n, d: a.d, w: a.w, sign: a.sign, letter: a.letter, shade: a.shade };
    if (ctx.state === 'blank') return {};
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const out = {};
        const raw = w.value === undefined || w.value === null ? '' : String(w.value).trim();
        const m = /^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/.exec(raw);
        if (m) { out.w = m[1] || ''; out.n = m[2]; out.d = m[3]; }
        else if (/^\d+$/.test(raw)) { out.n = raw; out.d = raw; out.w = raw; out.shade = Number(raw); }
        out.sign = raw; out.letter = raw.toUpperCase();
        if (w.slots) for (const k of Object.keys(w.slots)) out[k] = w.slots[k];
        return out;
    }
    return key;
}

/** A writing box for one number of the answer. */
function slotBox(ctx, id, value, mark) {
    const { w, h } = inlineBoxMm(ctx, 2);
    const ink = value !== '' && value !== undefined && value !== null ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK.ink;
    const hook = isTwin(ctx) && mark ? (mark === 'cell' ? ' data-mq-cell="1" data-mq-w="3"' : ' data-mq-blank="box"') : '';
    return `<span class="fm-box" data-ws-slot="${id}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} `
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

/** How many answer boxes the payload carries (one box alone is the twin's single blank). */
function boxCount(p) {
    let n = 0;
    for (const t of p.terms || []) n += { n: 1, d: 1, nd: 2, wnd: 3 }[t.frac] || 0;
    return n;
}

/** The fraction part of a term: written, or the answer boxes. */
function termFrac(p, t, ctx, vals) {
    const single = boxCount(p) === 1;
    const mark = single ? 'blank' : 'cell';
    const v = (k) => (vals[k] === undefined || vals[k] === null ? '' : String(vals[k]));
    switch (t.frac) {
        case 'none': return '';
        case 'n': return stack(ctx, slotBox(ctx, 'n', v('n'), mark), numeral(ctx, t.d));
        case 'd': return stack(ctx, numeral(ctx, t.n), slotBox(ctx, 'd', v('d'), mark));
        case 'nd': return stack(ctx, slotBox(ctx, 'n', v('n'), mark), slotBox(ctx, 'd', v('d'), mark), { attrs: isTwin(ctx) ? ' data-mq-join="/"' : '' });
        case 'wnd': {
            const wb = slotBox(ctx, 'w', v('w'), mark);
            return `<span${isTwin(ctx) ? ' data-mq-join="mixed"' : ''} style="display:inline-flex;align-items:center;gap:${L(ctx, 1.5)};flex:none;">${wb}`
                + `${stack(ctx, slotBox(ctx, 'n', v('n'), mark), slotBox(ctx, 'd', v('d'), mark))}</span>`;
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
        models: t.blank || shaded !== null ? countsOf(t).models : null,
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
            + `width:${L(ctx, 9)};height:${L(ctx, 9)};border-radius:50%;box-sizing:border-box;${ring}font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;">${esc(t.letter)}</span>`;
    }
    if (t.letter) {
        // a choice: its letter to the left of its model, so a row of choices is as tall as a model
        return `<span class="fm-term" data-fm-term="${i}" style="display:inline-flex;flex-direction:row;align-items:center;gap:${L(ctx, 2)};flex:none;">${letter}${model}</span>`;
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
    return p.task === 'op' && t.length >= 3 && last && !last.kind && /^(nd|wnd|n|d)$/.test(last.frac || '')
        && t.slice(0, -1).some((x) => x.kind);
};

function renderRow(p, ctx) {
    const vals = answerValues(p, ctx);
    const terms = p.terms || [];
    const below = p.fracAt ? p.fracAt === 'below' : terms.length > 1;
    const parts = [];
    // A shade or pick task prints the fraction to show first (RP-91: the fraction, then the model).
    if (p.show && (p.task === 'shade' || p.task === 'pick')) {
        const s = p.show;
        parts.push(`<span class="fm-show" style="display:inline-flex;flex:none;">${termFrac(p, { n: s.n, d: s.d, w: s.w, frac: 'show' }, ctx, {})}</span>`);
    }
    const pick = p.task === 'pick';
    if (pick) {
        // The choices stand two by two (a 2 x 2 grid), so the cell keeps to one of two columns.
        const cells = terms.map((t, i) => renderTerm(p, t, i, ctx, vals, true)).join('');
        parts.push(`<span class="fm-choices" style="display:inline-grid;grid-template-columns:repeat(${Math.min(2, terms.length)}, auto);`
            + `gap:${L(ctx, 3)} ${L(ctx, 6)};align-items:end;justify-items:center;flex:none;">${cells}</span>`);
    } else if (answerLine(p)) {
        // A number sentence of pictures: the pictures and their signs on one line, "= answer" on
        // the line under it (the sentence stays within one of two columns).
        const n = terms.length - 1;
        const top = [];
        terms.slice(0, n).forEach((t, i) => {
            if (i > 0) top.push(join(p, (p.joins || [])[i - 1] || '', ctx, vals));
            top.push(renderTerm(p, t, i, ctx, vals, true));
        });
        const hold = isTwin(ctx) ? ' data-mq-wrapped="1"' : '';
        parts.push(`<span style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};flex:none;">`
            + `<span${hold} style="display:flex;align-items:center;gap:${L(ctx, 4)};">${top.join('')}</span>`
            + `<span${hold} style="display:flex;align-items:center;gap:${L(ctx, 4)};">${join(p, (p.joins || [])[n - 1] || '=', ctx, vals)}${renderTerm(p, terms[n], n, ctx, vals, true)}</span></span>`);
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
    return `<div class="fm-row"${slotAttrs}${shadeSlot}${model}${isTwin(ctx) ? ' data-mq-wrapped="1"' : ''} style="display:flex;flex-wrap:nowrap;align-items:center;justify-content:center;`
        + `gap:${L(ctx, pick ? 6 : 4)};row-gap:${L(ctx, 4)};">${parts.join('')}</div>`;
}

/** Natural size of the row (mm at the ctx preset), for the layout. */
function rowSize(p, ctx) {
    const size = sizeOf(ctx);
    const dig = digitPt(ctx) * PT_MM;
    const box = inlineBoxMm(ctx, 2);
    const terms = p.terms || [];
    const below = p.fracAt ? p.fracAt === 'below' : terms.length > 1;
    const fracW = (t) => (t.frac === 'none' ? 0 : t.frac === 'wnd' ? 2 * box.w + 1.5 : /^(n|d|nd)$/.test(t.frac || '') ? box.w
        : Math.max(7, String(Math.max(Number(t.n) || 0, Number(t.d) || 0)).length * dig * 0.62) + (Number(t.w) ? dig * 0.7 : 0));
    const fracH = (t) => (t.frac === 'none' ? 0 : /^(n|d|nd|wnd)$/.test(t.frac || '') ? 2 * box.h + 2 : 2 * dig * 1.05 + 2);
    let w = 0, h = 0;
    if (p.task === 'pick') {
        const one = terms.map((t) => (t.kind ? fracModelGeom({ n: t.n, d: t.d, kind: t.kind, size, wholeMm: p.wholeMm, blank: true }) : { wMm: 0, hMm: 0 }));
        const cw = Math.max(...one.map((g) => g.wMm)) + 11, ch = Math.max(...one.map((g) => g.hMm), 9);
        const cols = Math.min(2, terms.length), rows = Math.ceil(terms.length / cols);
        w = 12 + 5 + cols * cw + (cols - 1) * 6;
        h = Math.max(rows * ch + (rows - 1) * 3, 2 * dig * 1.05 + 2);
        return { w, h };
    }
    const split = answerLine(p);
    const list = split ? terms.slice(0, -1) : terms;
    list.forEach((t, i) => {
        const g = t.kind ? fracModelGeom({ n: t.n, d: t.d, w: t.w, kind: t.kind, size, wholeMm: p.wholeMm, blank: true, models: countsOf(t).models }) : { wMm: 0, hMm: 0 };
        const tw = below ? Math.max(g.wMm, fracW(t)) : g.wMm + (fracW(t) ? fracW(t) + 5 : 0);
        const th = below ? g.hMm + (fracH(t) ? fracH(t) + 2 : 0) : Math.max(g.hMm, fracH(t));
        w += tw + (i > 0 ? 8 + 8 : 0);
        h = Math.max(h, th + (t.letter ? 11 : 0));
    });
    if (split) {
        const last = terms[terms.length - 1];
        w = Math.max(w, 8 + fracW(last));
        h += fracH(last) + 3;
    }
    if (p.show && (p.task === 'shade' || p.task === 'pick')) { w += 12 + 5; h = Math.max(h, 2 * dig * 1.05 + 2); }
    return { w, h };
}

register('frac-model', {
    render(p, ctx) {
        const twin = isTwin(ctx);
        return `<div class="k2-cell fm-cell" data-fm-task="${esc(p.task || '')}"${twin ? ' data-mq-k2="1"' : ''} `
            + `style="color:${INK.ink};font-family:'Andika','Open Sans',sans-serif;text-align:center;">${renderRow(p, ctx)}</div>`;
    },
    answerKey(p) {
        const a = p.answer || {};
        if (p.task === 'shade') return { value: String(a.shade), display: `${a.shade} parts shaded`, slots: { answer: { value: String(a.shade), graded: true } } };
        if (p.task === 'pick') return { value: a.letter, display: a.letter, slots: { answer: { value: a.letter, graded: true } } };
        if (p.task === 'sign') return { value: a.sign, display: a.sign, slots: { sign: { value: a.sign, graded: true } } };
        const t = (p.terms || []).find((x) => /^(n|d|nd|wnd)$/.test(x.frac || '')) || {};
        const slots = {};
        if (/n/.test(t.frac)) slots.n = { value: String(a.n), graded: true };
        if (/d/.test(t.frac)) slots.d = { value: String(a.d), graded: true };
        if (t.frac === 'wnd') slots.w = { value: a.w ? String(a.w) : '', graded: !!a.w };
        const display = t.frac === 'n' ? String(a.n) : t.frac === 'd' ? String(a.d)
            : `${a.w ? `${a.w} ` : ''}${Number(a.n) ? `${a.n}/${a.d}` : ''}`.trim() || String(a.w || 0);
        return { value: t.frac === 'n' ? Number(a.n) : t.frac === 'd' ? Number(a.d) : display, display, slots };
    },
    footprint(p, ctx) {
        const { w, h } = rowSize(p, ctx);
        const wMm = Math.ceil(w + 8), hMm = Math.ceil(h + 8);
        return { wMm, hMm, measure: true, factLike: false, maxCols: wMm <= 56 ? 3 : wMm <= 88 ? 2 : 1 };
    },
    inputs(p) {
        if (p.task === 'shade') return [{ id: 'answer', kind: 'number', shape: 'draw', graded: true, order: 0, scopes: ['full'] }];
        if (p.task === 'pick') return [{ id: 'answer', kind: 'choice', shape: 'choice', graded: true, order: 0, scopes: ['full'] }];
        if (p.task === 'sign') return [{ id: 'sign', kind: 'sign', shape: 'circle', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
        const t = (p.terms || []).find((x) => /^(n|d|nd|wnd)$/.test(x.frac || '')) || {};
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
