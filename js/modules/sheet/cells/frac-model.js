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
import { L, P, B, D, S as SZ, isTwin, sizeOf, digitPt, textPt, zonePt, inkOf, KEY_FEATURES, GREY, inlineBoxMm } from './k2kit.js';
import { blankWidth, SLOT } from '../tokens.js';

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
        // `span` (fraction_number_line, "what fraction is shaded"): the stretch from 0 is shaded in
        // the one grey, under the ticks, and no dot is drawn (the line's end of grey is the number).
        if (p.span && !blank) body += `<rect x="${f2(X(0))}" y="${f2(y - 1.9)}" width="${f2(X(total) - X(0))}" height="3.8" fill="${INK.grey}" data-frac-span="${total}"/>`;
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
        if (!blank && !p.span) body += `<circle cx="${f2(X(total))}" cy="${y}" r="1.25" fill="${INK.ink}" data-frac-dot="${total}"/>`;
        return { body, wMm: len + 10, hMm: 6 + 3 + lab * 1.3 + 1, aria: `number line from 0 to ${models} in parts of 1/${d}` };
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
            }
            body += `<rect x="${f2(ox)}" y="${f2(oy)}" width="${f2(one.w)}" height="${f2(one.h)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
        }
    }
    const rowsOf = Math.ceil(models / per);
    const wMm = per * one.w + (per - 1) * GAP_MM + 1, hMm = rowsOf * one.h + (rowsOf - 1) * GAP_MM + 1;
    const aria = copies
        ? `${copies} ${kind} models, each in ${d} equal parts${blank ? '' : `, ${total} shaded in each`}`
        : `${models > 1 ? `${models} ${kind} models` : `${kind} model`} in ${d} equal parts${blank ? '' : `, ${total} shaded`}`;
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
    const key = { n: whole ? '' : a.n, d: whole ? '' : a.d, w: a.w || '', sign: a.sign, letter: a.letter, shade: a.shade, part: a.part };
    if (ctx.state === 'blank') return {};
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const out = {};
        const raw = w.value === undefined || w.value === null ? '' : String(w.value).trim();
        const m = /^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/.exec(raw);
        if (m) { out.w = m[1] || ''; out.n = m[2]; out.d = m[3]; }
        else if (/^\d+$/.test(raw)) { out.n = raw; out.d = raw; out.w = raw; out.shade = Number(raw); }
        out.sign = raw; out.letter = raw.toUpperCase(); out.part = raw;
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
    for (const t of p.terms || []) n += { n: 1, d: 1, w: 1, nd: 2, wnd: 3 }[t.frac] || 0;
    return n;
}

/** The fraction part of a term: written, or the answer boxes. */
function termFrac(p, t, ctx, vals) {
    const single = boxCount(p) === 1;
    const mark = single ? 'blank' : 'cell';
    const v = (k) => (vals[k] === undefined || vals[k] === null ? '' : String(vals[k]));
    switch (t.frac) {
        case 'none': return '';
        case 'w': return slotBox(ctx, 'w', v('w'), mark);
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
        copies: t.copies, perRow: p.perRow, barH: p.barH, span: !!t.span,
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
    const k = WHOLE_K[size] || 1;
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
    return { body, wMm, hMm, aria: `area model: ${rows} rows and ${cols} columns, ${a.shadeRows} rows shaded, ${a.markCols} columns bracketed` };
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
        // Number lines stand one under another (each is 60 mm or more across); other models two by two.
        const pickCols = terms.every((t) => t.kind === 'line') ? 1 : Math.min(2, terms.length);
        parts.push(`<span class="fm-choices" style="display:inline-grid;grid-template-columns:repeat(${pickCols}, auto);`
            + `gap:${L(ctx, 3)} ${L(ctx, 6)};align-items:end;justify-items:center;flex:none;">${cells}</span>`);
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
    return `<div class="fm-row"${slotAttrs}${shadeSlot}${model}${isTwin(ctx) ? ' data-mq-wrapped="1"' : ''} style="display:flex;${col}flex-wrap:nowrap;align-items:center;justify-content:center;`
        + `gap:${L(ctx, pick ? 6 : 4)};row-gap:${L(ctx, 4)};">${parts.join('')}</div>`;
}

/** Natural size of the row (mm at the ctx preset), for the layout. */
function rowSize(p, ctx) {
    const size = sizeOf(ctx);
    const dig = digitPt(ctx) * PT_MM;
    const box = inlineBoxMm(ctx, 2);
    const terms = p.terms || [];
    const below = p.fracAt ? p.fracAt === 'below' : terms.length > 1;
    const fracW = (t) => (t.frac === 'none' ? 0 : t.frac === 'wnd' ? 2 * box.w + 1.5 : /^(n|d|nd|w)$/.test(t.frac || '') ? box.w
        : Math.max(7, String(Math.max(Number(t.n) || 0, Number(t.d) || 0)).length * dig * 0.62) + (Number(t.w) ? dig * 0.7 : 0));
    const fracH = (t) => (t.frac === 'none' ? 0 : t.frac === 'w' ? box.h : /^(n|d|nd|wnd)$/.test(t.frac || '') ? 2 * box.h + 2
        : (!Number(t.n) && Number(t.w)) ? dig * 1.05 : 2 * dig * 1.05 + 2);
    let w = 0, h = 0;
    if (p.task === 'part') {
        const t = terms[0] || {};
        const label = (p.part === 'd' ? 11 : 9) * (textPt(ctx) + 2) * PT_MM * 0.55;
        return { w: Math.max(fracW(t), label + 3 + dig * 0.7 + 3 + box.w), h: fracH(t) + 4 + box.h };
    }
    if (p.task === 'pick') {
        const one = terms.map((t) => (t.kind ? fracModelGeom({ n: t.n, d: t.d, kind: t.kind, size, wholeMm: p.wholeMm, barH: p.barH, blank: true }) : { wMm: 0, hMm: 0 }));
        const cw = Math.max(...one.map((g) => g.wMm)) + 11, ch = Math.max(...one.map((g) => g.hMm), 9);
        const cols = Math.min(2, terms.length), rows = Math.ceil(terms.length / cols);
        w = 12 + 5 + cols * cw + (cols - 1) * 6;
        h = Math.max(rows * ch + (rows - 1) * 3, 2 * dig * 1.05 + 2);
        return { w, h };
    }
    const split = answerLine(p);
    const list = split ? terms.slice(0, -1) : terms;
    const stacked = split && !!p.stack;
    const tb = stacked ? false : below;
    list.forEach((t, i) => {
        const g = t.kind ? fracModelGeom({ n: t.n, d: t.d, w: t.w, kind: t.kind, size, wholeMm: p.wholeMm, blank: true, models: countsOf(t).models, copies: t.copies, perRow: p.perRow, barH: p.barH }) : { wMm: 0, hMm: 0 };
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
        } else {
            w = Math.max(w, 8 + fracW(last));
            h += fracH(last) + 3;
        }
    }
    if (p.show && p.task === 'shade' && p.showAbove) { w = Math.max(w, 12); h += 2 * dig * 1.05 + 2 + 4; }
    else if (p.show && (p.task === 'shade' || p.task === 'pick')) { w += 12 + 5; h = Math.max(h, 2 * dig * 1.05 + 2); }
    return { w, h };
}


/* ============================================================ task 'partition' (mixed numbers)
 * fractions:mixed_numbers_intro (card design/cards/mixed-partition, WRM Y4.B7.S3; lane lf-algebra 2026-11-20).
 * A mixed number in the WHOLE box of a part-whole diagram (RP-60): the whole box printed (1.5 pt, square: not a
 * writing place), the part boxes under it (0.75 pt, rounded SL-11: writing places, card Q4), 0.75 pt joins, the
 * printed labels "wholes" / "fraction" under the part boxes (structural: they never fade, RP-71). The fraction part
 * box holds a 1.5 pt fraction bar B(2) wide with a writing zone Hw above and below it (WDS 6). On the model steps the
 * mixed number's bar model stands LEFT of the diagram: one fully shaded bar per whole and one part-shaded bar,
 * STACKED with 3 mm gaps (WRM R50; RP-90 grey from the left), the diagram centred in the width after the bars
 * (card Q10, EB-SIDE). payload:
 *   {task: 'partition', w, n, d, form: 'two' | 'ones' | 'compose' | 'eq', model: 'bar' | 'none', answer: {w, n, d}}
 *   two      write the wholes and the fraction in the two part boxes (default)
 *   ones     one part box per whole (each 1) and the fraction box (2 3/4 = 1 + 1 + 3/4)
 *   compose  the parts printed; the pupil writes the mixed number in the whole box (the reverse)
 *   eq       no diagram: "2 3/4 = [ ] + [ ]/[ ]" (and "= [ ] + [ ] + [ ]/[ ]" with `ones: true`)
 * Slots: w (or w1 .. wk for 'ones'), n, d: ONE graded answer (all boxes right). The twin's boxes carry
 * data-mq-cell and data-mq-pk (w / n / d); their wrapper data-mq-join="parts" and data-mq-sep, so the host composes
 * "2 + 3/4" ("1 + 1 + 3/4", or "2 3/4" for compose) - screen-cell.js wireCellSlots.
 */
const PW = Object.freeze({
    // whole box, part drop, part gap (mm); the bars of the model (WDS 11.2 minimums)
    M: { topW: 34, topH: 22, drop: 12, gap: 22, onesGap: 6, barW: 52, barH: 16 },
    // (`modelDrop`, L: beside the bars an 18 mm drop - the diagram as tall as the 4-bar model, so a model row's cell holds no
    // 30 % band, ws-empty-band; without the bars the 12 mm drop, so two Reason It pairs still fit a page)
    L: { topW: 40, topH: 26, drop: 14, modelDrop: 18, gap: 22, onesGap: 6, barW: 56, barH: 18 },
});
const pwSize = (ctx) => (sizeOf(ctx) === 'L' ? 'L' : 'M');
/** The part boxes' geometry at the ctx size (mm). */
function pwGeom(p, ctx) {
    const k = pwSize(ctx), G0 = PW[k];
    // (on screen the joins drop 8 mm: the card fits the drawing to its height, and a taller diagram drew every digit smaller - ws-screen-ink-size)
    // (a lesson chart panel, `_barsUnder`: an anchor chart read, not written in - 6 mm joins and boxes 2 mm over their digits,
    // so two panels with their bars fit the chart page, lead ruling 2026-11-21 (2))
    const G = isTwin(ctx) ? Object.assign({}, G0, { drop: 8 }) : p._barsUnder ? Object.assign({}, G0, { drop: 6 }) : p.model === 'bar' && G0.modelDrop && !p._barsUnder ? Object.assign({}, G0, { drop: G0.modelDrop }) : G0;
    const hw = SZ(ctx).writeMm;
    const wholeW = blankWidth(1, k) + 6, fracBar = blankWidth(2, k), fracW = fracBar + 6;
    const partH = 2 * hw + (p._barsUnder ? 2 : 8);
    const ones = p.form === 'ones' ? Math.max(1, Math.round(Number(p.w) || 1)) : 1;
    const gap = ones > 1 ? G.onesGap : 16;
    const parts = [...Array.from({ length: ones }, () => wholeW), fracW];
    // the part boxes stand centred in EQUAL columns (each the widest box and the least gap), so the joins land at known
    // fractions of the row; the diagram takes the width its cell gives it, up to `maxW` (card Q10: in a wide cell the parts
    // spread rather than leave a band at each side)
    const colW = Math.max(wholeW, fracW) + gap;
    const rowW = colW * parts.length;
    const maxW = Math.max(rowW, parts.length > 2 ? parts.length * (Math.max(wholeW, fracW) + 14) : 140);
    // the least width: the boxes 4 mm apart (a narrow lesson panel or Model pane); the top box never narrower than itself
    const minW = Math.max(parts.length * Math.max(wholeW, fracW) + (parts.length - 1) * 4, 0);
    // compose: the whole box is the writing place - a wholes zone beside the fraction slot
    const writeTop = p.form === 'compose' || p.form === 'name';
    const topW = writeTop ? Math.max(G.topW, wholeW + 2 + fracW) : G.topW;
    const topH = writeTop ? partH : G.topH;
    const lab = zonePt(ctx) * PT_MM * 1.35;
    const W = Math.max(topW, rowW);
    return { k, G, hw, wholeW, fracBar, fracW, partH, parts, gap, colW, rowW, maxW, minW: Math.max(minW, topW), topW, topH, lab, W, H: topH + G.drop + partH + 1.5 + lab };
}
/** A value as the slot shows it in this state ('' on the pupil page). */
function pwVal(p, ctx, id) {
    // a lesson / Model state (stepState): the slots the worked steps have marked so far, each in its own ink
    if (p._marks) { const st = p._marks[id]; return st && st.value !== undefined && st.value !== null ? String(st.value) : ''; }
    if (ctx.state === 'blank') return '';
    const a = p.answer || {};
    const k0 = id.replace(/^m(?=[wnd]$)/, '');
    const key = /^w\d+$/.test(id) ? '1' : k0 === 'w' ? a.w : k0 === 'n' ? a.n : k0 === 'd' ? a.d : '';
    if (ctx.state === 'wrong') {
        const wr = ctx.wrong || {};
        if (wr.slots && wr.slots[id] !== undefined && wr.slots[id] !== null) return String(wr.slots[id]);
        // a shown answer given as its text ("2 + 3/4", "1 + 1 + 3/4", "2 3/4"): its parts in the boxes' order
        const halves = String(wr.value === undefined || wr.value === null ? '' : wr.value).split('=');
        const top = /^m[wnd]$/.test(id);
        const t = (top ? halves[0] : halves[halves.length - 1]).trim();
        if (top) { const mm = /^(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(t); return mm ? { mw: mm[1], mn: mm[2], md: mm[3] }[id] : ''; }
        const m = /^(.*?)\s*(\d+)\s*\/\s*(\d+)$/.exec(t);
        if (!m) return '';
        if (id === 'n') return m[2];
        if (id === 'd') return m[3];
        const wholes = m[1].split(/[+\s]+/).filter(Boolean);
        if (id === 'w') return wholes.length === 1 ? wholes[0] : '';
        const k = Number(id.slice(1)) - 1;
        return wholes[k] === undefined ? '' : wholes[k];
    }
    return key === undefined || key === null ? '' : String(key);
}
/** One writing place: a rounded box (or, `zone`, a fraction-bar writing zone) holding a written value. */
function pwSlot(ctx, id, v, { w, h, zone = false, pt, marks = null, bare = false }) {
    const st = marks && marks[id];
    const ink = v !== '' ? (st ? (st.ink === 'trace' ? 'trace' : 'solid') : inkOf(ctx)) : null;
    const twin = isTwin(ctx);
    // (the top box of task 'name' writes the mixed number: slots mw / mn / md, composed "2 3/4 = " before the parts)
    const base = id.replace(/\d+$/, '').replace(/^m(?=[wnd]$)/, '');
    const label = { n: 'numerator', d: 'denominator', w: 'wholes' }[base] || 'wholes';
    const after = id === 'mw' ? ' data-mq-after=" "' : id === 'md' ? ' data-mq-after=" = "' : '';
    const hook = twin ? ` data-mq-cell="1" data-mq-w="2" data-mq-pk="${base}" data-mq-label="${/^m[wnd]$/.test(id) ? `mixed number ${label}` : label}"${after}` : '';
    // a zone is a writing place on the bar (no outline on paper); on screen it is a 48 px touch target with a hairline
    // (`bare`: the slot IS its part box - the box draws the outline, on screen too)
    const border = (zone && !twin) || bare ? 'border:0;' : `border:${B(ctx, 0.75)} solid ${INK.ink};border-radius:${L(ctx, SLOT.slotRadiusMm[pwSize(ctx)])};`;
    // (52 px: the input inside a 1 px outline stays a 48 px touch target, H6)
    const height = twin ? `max(52px, ${L(ctx, h)})` : L(ctx, h);
    return `<span class="fm-pw-slot" data-ws-slot="${id}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} `
        + `style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, w)};height:${height};${border}`
        + `background:#fff;font-size:${twin ? D(ctx, pt) : P(ctx, pt)};font-weight:700;line-height:1;color:${ink === 'trace' ? GREY : INK.ink};flex:none;${KEY_FEATURES}">`
        + `${ink ? esc(v) : ''}</span>`;
}
/** The fraction writing place: a zone over a 1.5 pt bar over a zone (n / d slots). */
function pwFracSlot(p, ctx, g, pre = '') {
    const pt = SZ(ctx).fracPt;
    const z = (id0) => { const id = pre + id0; return pwSlot(ctx, id, pwVal(p, ctx, id), { marks: p._marks, w: g.fracBar, h: g.hw, zone: true, pt }); };
    return `<span style="display:inline-flex;flex-direction:column;align-items:center;flex:none;">${z('n')}`
        + `<span aria-hidden="true" style="display:block;width:${L(ctx, g.fracBar)};border-top:${B(ctx, 1.5)} solid ${INK.ink};margin:${L(ctx, 1)} 0;"></span>${z('d')}</span>`;
}
/** A printed mixed number (or whole number, or fraction): the whole at the digit size, the fraction at the fraction size (TY-7). */
function pwMixed(ctx, w, n, d) {
    const twin = isTwin(ctx);
    const dig = twin ? D(ctx, digitPt(ctx)) : P(ctx, digitPt(ctx));
    const fpt = SZ(ctx).fracPt;
    // (on screen a printed fraction's digits are working digits too: the host's digit size - ws-screen-ink-size TEXT-SIZE)
    const fs = twin ? D(ctx, fpt) : P(ctx, fpt);
    const whole = Number(w) ? `<span style="font-size:${dig};font-weight:700;line-height:1;">${esc(w)}</span>` : '';
    const frac = Number(n) ? `<span style="display:inline-flex;flex-direction:column;align-items:center;font-size:${fs};font-weight:700;line-height:1.1;">`
        + `<span>${esc(n)}</span><span aria-hidden="true" style="display:block;align-self:stretch;min-width:0.8em;border-top:${B(ctx, 1.5)} solid ${INK.ink};margin:${L(ctx, 0.6)} 0;"></span><span>${esc(d)}</span></span>` : '';
    return `<span class="fm-mixed" style="display:inline-flex;align-items:center;gap:${L(ctx, 1.2)};${KEY_FEATURES}">${whole}${frac}</span>`;
}
/** The mixed number's bar model: one bar per whole and the part bar, stacked 3 mm apart (WRM R50). */
function pwBars(p, ctx, rowMm = 0) {
    const g = PW[pwSize(ctx)];
    // `rowMm` (a lesson chart panel, lead ruling 2026-11-21 (2)): the bars in ONE ROW across that width under the diagram
    // (RP-92's row of wholes, 3 mm apart), each whole as wide as the row allows up to the bar's own width, a part >= 5 mm
    const k = Math.round(Number(p.w) || 0) + 1;
    const rowWhole = rowMm ? Math.min(g.barW, Math.max(Number(p.d) * 5, (rowMm - (k - 1) * GAP_MM - 1) / k)) : 0;
    // (in the row the bars are read, never shaded: a slim strip, 10 mm tall at M / L - fracModelGeom `barH`)
    const geom = fracModelGeom({ kind: 'bar', n: p.n, d: p.d, w: p.w, size: pwSize(ctx), wholeMm: rowMm ? rowWhole / (WHOLE_K[pwSize(ctx)] || 1) : null,
        perRow: rowMm ? k : 1, hatch: !!ctx.photocopySafe, ...(rowMm ? { barH: 10 / (WHOLE_K[pwSize(ctx)] || 1) } : {}) });
    return `<svg class="fm-svg fm-pw-bars" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f2(geom.wMm)} ${f2(geom.hMm)}" role="img" aria-label="${esc(geom.aria)}" `
        + `data-frac-model="bar"${rowMm ? ' data-fm-bars="row"' : ''} style="display:block;width:${L(ctx, rowMm ? geom.wMm : Math.max(g.barW, geom.wMm))};height:auto;max-width:100%;overflow:visible;flex:none;">${geom.body}</svg>`;
}
/** The part-whole diagram (RP-60). */
function pwDiagram(p, ctx) {
    const g = pwGeom(p, ctx);
    const twin = isTwin(ctx);
    const compose = p.form === 'compose';
    // task 'name' (A18): every box empty - the top box writes the mixed number (mw / mn / md), the parts as task 'two'
    const name = p.form === 'name';
    const ones = p.form === 'ones';
    const a = p.answer || {};
    // the whole box: the printed mixed number, or (compose) the writing place for it
    let top;
    if (compose || name) {
        const pre = name ? 'm' : '';
        const wv = pwVal(p, ctx, `${pre}w`);
        top = `<span class="fm-pw-whole" data-ws-slot-group="answer" style="display:inline-flex;align-items:center;justify-content:center;gap:${L(ctx, 2)};box-sizing:border-box;`
            + `width:${L(ctx, g.topW)};min-height:${L(ctx, g.topH)};padding:${L(ctx, 1)};border:${B(ctx, 0.75)} solid ${INK.ink};border-radius:${L(ctx, SLOT.slotRadiusMm[g.k])};background:#fff;">`
            + `${pwSlot(ctx, `${pre}w`, wv, { marks: p._marks, w: g.wholeW - 6, h: 2 * g.hw + 2, zone: true, pt: digitPt(ctx) })}${pwFracSlot(p, ctx, g, pre)}</span>`;
    } else {
        top = `<span class="fm-pw-whole" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, g.topW)};`
            + `${twin ? 'min-height' : 'height'}:${L(ctx, g.topH)};${twin ? `padding:${L(ctx, 1)} ${L(ctx, 2)};` : ''}border:${B(ctx, 1.5)} solid ${INK.ink};background:#fff;">${pwMixed(ctx, p.w, p.n, p.d)}</span>`;
    }
    // the joins: from the whole box's foot to each part box's top, drawn across the part row in percent of its width
    // (the row stretches with its cell); 1 CSS px = 0.75 pt, held at that width whatever the stretch
    const n = g.parts.length;
    // (`data-ws-natural`: the joins stretch with the row on purpose - held to the diagram's least width, never to its 1-column
    // width, so the measure does not read a two-across diagram as a shrunk picture; print-sheet DN-10. Practice pages only
    // (scaffold level 1): a Scripted Model / Guided page keeps its one-column rows)
    const joins = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${f2(g.G.drop)}" preserveAspectRatio="none"${Number(ctx.scaffoldLevel) >= 2 ? '' : ` data-ws-natural="${f2(g.minW)}"`} `
        + `style="display:block;width:100%;height:${L(ctx, g.G.drop)};overflow:visible;">`
        + g.parts.map((_, i) => `<line x1="50" y1="0" x2="${f2(((i + 0.5) / n) * 100)}" y2="${f2(g.G.drop)}" stroke="${INK.ink}" stroke-width="1" vector-effect="non-scaling-stroke"/>`).join('')
        + `</svg>`;
    // the part boxes and their labels
    const lab = (t) => `<span class="fm-pw-label" style="display:block;font-size:${P(ctx, zonePt(ctx))};line-height:1.3;margin-top:${L(ctx, 1)};white-space:nowrap;">${t}</span>`;
    const partBox = (inner, w, printed) => `<span class="fm-pw-part" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, w)};`
        + `min-height:${L(ctx, g.partH)};border:${B(ctx, 0.75)} solid ${INK.ink};${printed ? '' : `border-radius:${L(ctx, SLOT.slotRadiusMm[g.k])};`}background:#fff;">${inner}</span>`;
    const cols = [];
    // 'shown' (the Stretch's picture of its number, lf-algebra 2026-11-21): the mixed number AND its parts printed - the
    // standard partition the open task starts from; nothing to write
    if (compose || p.form === 'shown') {
        // the parts are printed (square boxes: not writing places)
        cols.push(`${partBox(pwMixed(ctx, a.w, 0, 1), g.wholeW, true)}${lab('wholes')}`);
        cols.push(`${partBox(pwMixed(ctx, 0, a.n, a.d), g.fracW, true)}${lab('fraction')}`);
    } else {
        const nW = g.parts.length - 1;
        for (let i = 0; i < nW; i++) {
            const id = ones ? `w${i + 1}` : 'w';
            cols.push(`${partBox(pwSlot(ctx, id, pwVal(p, ctx, id), { marks: p._marks, w: g.wholeW - 2, h: g.partH - 2, zone: true, bare: true, pt: digitPt(ctx) }), g.wholeW, false)}${lab(ones ? 'one' : 'wholes')}`);
        }
        cols.push(`${partBox(pwFracSlot(p, ctx, g), g.fracW, false)}${lab('fraction')}`);
    }
    const row = `<span style="display:grid;grid-template-columns:repeat(${n}, minmax(0, 1fr));align-items:start;width:100%;">`
        + cols.map((c) => `<span style="display:flex;flex-direction:column;align-items:center;">${c}</span>`).join('') + `</span>`;
    const join = twin ? ` data-mq-join="parts" data-mq-sep="${compose ? ' ' : ' + '}"` : '';
    return `<span class="fm-pw" data-ws-slot-group="answer"${join} style="display:flex;flex-direction:column;align-items:center;box-sizing:border-box;`
        + `width:100%;min-width:${L(ctx, g.minW)};max-width:${L(ctx, twin ? Math.max(g.rowW, g.topW) : g.maxW)};margin:0 auto;padding-top:${L(ctx, 0.6)};flex:0 1 auto;">${top}${joins}${row}</span>`;
}
/** The equation form: "2 3/4 = [ ] + [ ]/[ ]" (the faded form, no diagram). */
function pwEquation(p, ctx) {
    const g = pwGeom(Object.assign({}, p, { form: 'two' }), ctx);
    const twin = isTwin(ctx);
    const sign = (t) => `<span style="font-size:${twin ? D(ctx, digitPt(ctx)) : P(ctx, digitPt(ctx))};font-weight:700;line-height:1;flex:none;">${t}</span>`;
    const k = p.ones ? Math.max(1, Math.round(Number(p.w) || 1)) : 1;
    const parts = [];
    for (let i = 0; i < k; i++) {
        const id = p.ones ? `w${i + 1}` : 'w';
        parts.push(pwSlot(ctx, id, pwVal(p, ctx, id), { marks: p._marks, w: g.wholeW - 6, h: 2 * g.hw + 2, pt: digitPt(ctx) }));
    }
    parts.push(pwFracSlot(p, ctx, g));
    const join = twin ? ` data-mq-join="parts" data-mq-sep=" + "` : '';
    return `<span class="fm-pw-eq" data-ws-slot-group="answer"${join} style="display:inline-flex;align-items:center;gap:${L(ctx, 3)};flex:none;">`
        + `${pwMixed(ctx, p.w, p.n, p.d)}${sign('=')}${parts.join(sign('+'))}</span>`;
}
/**
 * The payload as this ctx draws it: at size L on paper a fading bar model stops after the page's first item
 * (`modelL: 'none'`, set by the generator from the item's place on the page; lead ruling 2026-11-21 (1)).
 */
function pwAt(p, ctx) {
    // (the practice pages only - scaffold level 1: a Model, Guided or Opener page (level 2-3) keeps the bars it teaches with)
    return p && p.modelL && p.model === 'bar' && !isTwin(ctx) && pwSize(ctx) === 'L' && !(Number(ctx.scaffoldLevel) >= 2) ? Object.assign({}, p, { model: p.modelL }) : p;
}
/** The whole partition row: bars beside the diagram (model on), the diagram alone, or the equation. */
function partitionRow(p0, ctx) {
    const p = pwAt(p0, ctx);
    if (p.form === 'eq') {
        return `<div class="fm-row fm-pw-row"${isTwin(ctx) ? ' data-mq-wrapped="1"' : ''} style="display:flex;align-items:center;justify-content:center;">${pwEquation(p, ctx)}</div>`;
    }
    const diagram = pwDiagram(p, ctx);
    if (p.model !== 'bar') {
        return `<div class="fm-row fm-pw-row" style="display:flex;align-items:flex-start;justify-content:center;width:100%;">${diagram}</div>`;
    }
    // a lesson chart panel (lead ruling 2026-11-21 (2): compose / name keep their bars on every panel): the diagram, then the
    // bars in one row the panel's full width UNDER it - beside it the pair was wider than the panel and the chart overflowed
    if (!isTwin(ctx) && Number(p._barsUnder) > 0) {
        const rowMm = Math.max(60, Math.min(Number(p._barsUnder) - 8, 170));
        return `<div class="fm-row fm-pw-row" data-fm-model="bar" data-fm-bars-under="1" style="display:flex;flex-direction:column;align-items:center;width:100%;box-sizing:border-box;gap:${L(ctx, 2.5)};">`
            + `${diagram}${pwBars(p, ctx, rowMm)}</div>`;
    }
    // model on: the bars at the left, the diagram centred in the width after them (card Q10, EB-SIDE); on a narrow
    // screen card the bars stand above the diagram (flex-wrap)
    return `<div class="fm-row fm-pw-row" data-fm-model="bar" style="display:flex;flex-wrap:${isTwin(ctx) ? 'nowrap' : 'wrap'};align-items:flex-start;row-gap:${L(ctx, 4)};justify-content:${isTwin(ctx) ? 'center' : 'flex-start'};width:100%;box-sizing:border-box;gap:${L(ctx, 6)};`
        // the tab keep-out on paper: the bars start after the item's tab
        + `${isTwin(ctx) ? '' : `padding-left:${L(ctx, SZ(ctx).tabMm + 3)};`}">`
        + `${pwBars(p, ctx)}<span style="flex:1 1 0;min-width:min-content;display:flex;justify-content:center;">${diagram}</span></div>`;
}
/** Natural size (mm) of a partition row at the ctx size. */
function partitionSize(p0, ctx) {
    const p = pwAt(p0, ctx);
    if (p.form === 'eq') {
        const g = pwGeom(Object.assign({}, p, { form: 'two' }), ctx);
        const dig = digitPt(ctx) * PT_MM;
        const k = p.ones ? Math.max(1, Math.round(Number(p.w) || 1)) : 1;
        // the printed mixed number, '=', k wholes boxes each with its '+', the fraction slot (2 Hw and the bar)
        return { w: dig * 1.8 + 3 + dig * 0.7 + 3 + k * (g.wholeW - 6 + 3 + dig * 0.7 + 3) + g.fracBar, h: 2 * g.hw + 4 };
    }
    const g = pwGeom(p, ctx);
    // (`ink`: the least width the diagram draws at - its boxes 4 mm apart; Reason It sets A and B beside their response column
    // when the work fits there, and a 78 mm natural row put the response under them, one pair a page at L - ws-cell-checks LONE-PAGE)
    if (p.model !== 'bar') return { w: g.W, h: g.H, ink: g.minW + 2 };
    const G = PW[pwSize(ctx)];
    const bars = (Math.round(Number(p.w) || 0) + 1);
    const barsH = bars * G.barH + (bars - 1) * GAP_MM + 1;
    // a model row takes the full width (bars left, the diagram centred in the rest)
    return { w: Math.max(G.barW + 1 + 6 + g.W, 150), h: Math.max(barsH, g.H), full: true, ink: G.barW + 1 + 6 + g.W };
}
/** The key and inputs of a partition cell. */
function partitionSlots(p) {
    const a = p.answer || {};
    const ids = p.form === 'ones' || (p.form === 'eq' && p.ones)
        ? [...Array.from({ length: Math.max(1, Math.round(Number(p.w) || 1)) }, (_, i) => `w${i + 1}`), 'n', 'd']
        : p.form === 'name' ? ['mw', 'mn', 'md', 'w', 'n', 'd'] : ['w', 'n', 'd'];
    const vals = { w: String(a.w), n: String(a.n), d: String(a.d), mw: String(a.w), mn: String(a.n), md: String(a.d) };
    const slots = {};
    for (const id of ids) slots[id] = { value: /^w\d+$/.test(id) ? '1' : vals[id], graded: true };
    const frac = `${a.n}/${a.d}`;
    const display = p.form === 'compose' ? `${a.w} ${frac}` : p.form === 'name' ? `${a.w} ${frac} = ${a.w} + ${frac}`
        : ids[0] === 'w1' ? [...ids.filter((i) => /^w\d+$/.test(i)).map(() => '1'), frac].join(' + ') : `${a.w} + ${frac}`;
    return { ids, slots, display };
}

register('frac-model', {
    render(p, ctx) {
        const twin = isTwin(ctx);
        const row = p.task === 'partition' ? partitionRow(p, ctx) : renderRow(p, ctx);
        return `<div class="k2-cell fm-cell" data-fm-task="${esc(p.task || '')}"${p.task === 'partition' ? ` data-fm-form="${esc(p.form || 'two')}"` : ''}${twin ? ' data-mq-k2="1"' : ''} `
            + `style="color:${INK.ink};font-family:'Andika','Open Sans',sans-serif;text-align:center;${p.task === 'partition' && p.form !== 'eq' ? 'width:100%;align-self:stretch;' : ''}">${row}</div>`;
    },
    // the Model / lesson states of a partition item: the slots the worked steps have marked, the newest in trace grey
    hasStepState(p) { return !!p && p.task === 'partition'; },
    // state k: the marks of steps 1..k written, step k's in trace grey (the Scripted Model's frozen states)
    statePayload(p, steps, k) {
        const mk = {};
        (steps || []).forEach((st, i) => {
            if (i > k) return;
            for (const x of (st && st.marks) || []) if (x && x.slot) mk[x.slot] = { value: String(x.value), ink: i < k ? 'solid' : 'trace' };
        });
        return { payload: { _marks: mk } };
    },
    // (a lesson chart panel passes its own width, `ctx.cellLiveMm`: a compose / name item draws its bars in a row under the
    // diagram there - lead ruling 2026-11-21 (2))
    stepState(p, steps, k, ctx) {
        // (`ctx.step`: every chart drawing - its panels and the drawings the chart measures for its zoom - so the measure and the
        // print are one drawing)
        const chart = ctx && (Number(ctx.cellLiveMm) > 0 || Number.isFinite(ctx.step));
        const under = p && p.task === 'partition' && p.model === 'bar' && chart ? { _barsUnder: Number(ctx.cellLiveMm) > 0 ? Number(ctx.cellLiveMm) : 178 } : {};
        return this.render(Object.assign({}, p, this.statePayload(p, steps, k).payload, under), ctx);
    },
    answerKey(p) {
        const a = p.answer || {};
        if (p.task === 'partition') {
            const k = partitionSlots(p);
            return { value: k.display, display: k.display, slots: k.slots };
        }
        if (p.task === 'shade') return { value: String(a.shade), display: `${a.shade} parts shaded`, slots: { answer: { value: String(a.shade), graded: true } } };
        if (p.task === 'pick') return { value: a.letter, display: a.letter, slots: { answer: { value: a.letter, graded: true } } };
        if (p.task === 'sign') return { value: a.sign, display: a.sign, slots: { sign: { value: a.sign, graded: true } } };
        if (p.task === 'part') return { value: Number(a.part), display: String(a.part), slots: { part: { value: String(a.part), graded: true } } };
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
        if (p.task === 'partition') {
            const z = partitionSize(p, ctx);
            const wMm = Math.ceil(z.w + 8), hMm = Math.ceil(z.h + 8);
            // (noStretch, lead ruling 2026-11-12 (b): answered in place in its own boxes, so a row is its measured height and
            // room, never stretched to the page - ws-empty-band EB-BAND at L)
            // inkWMm: the drawing's true width (Reason It / Error analysis choose their panel layout from it)
            return { wMm, hMm, measure: true, factLike: false, maxCols: z.full ? 1 : wMm <= 88 ? 2 : 1, noStretch: true, inkWMm: Math.ceil(z.ink || z.w) };
        }
        const { w, h } = rowSize(p, ctx);
        const wMm = Math.ceil(w + 8), hMm = Math.ceil(h + 8);
        // `oneCol` (whole_as_fraction, wave 1 lane D): every item of the page in one column, so a short
        // whole never stands alone beside an empty cell over a column of long ones
        return { wMm, hMm, measure: true, factLike: false, maxCols: p.oneCol ? 1 : wMm <= 56 ? 3 : wMm <= 88 ? 2 : 1 };
    },
    inputs(p) {
        if (p.task === 'partition') {
            return partitionSlots(p).ids.map((id, k) => ({ id, kind: 'number', shape: 'box', graded: true, order: k, inputmode: 'numeric', scopes: ['full', 'answer-only'] }));
        }
        if (p.task === 'shade') return [{ id: 'answer', kind: 'number', shape: 'draw', graded: true, order: 0, scopes: ['full'] }];
        if (p.task === 'pick') return [{ id: 'answer', kind: 'choice', shape: 'choice', graded: true, order: 0, scopes: ['full'] }];
        if (p.task === 'sign') return [{ id: 'sign', kind: 'sign', shape: 'circle', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
        if (p.task === 'part') return [{ id: 'part', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
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
