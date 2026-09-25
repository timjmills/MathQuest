// js/modules/sheet/cells/frac-model.js
// ONE drawing of a fraction model, for paper and screen (RP-2): the `model` appearance option
// (skill-options.js, O6 lane AP3, 2026-09-25).
//
//   area     a rectangle cut into rows x columns of equal parts, shaded row by row
//   bar      a strip cut into equal parts, shaded from the left (RP-90)
//   circle   a circle cut into equal sectors from 12 o'clock, clockwise (RP-90)
//   line     a number line from 0 to 1 cut into equal parts, the fraction marked with a dot;
//            only 0 and 1 are labelled (RP-1: never the answer's tick)
//
// Black and white (INK-1): outline 1.5 pt, partitions 0.75 pt, shaded parts flat grey (INK-3).
// Sizes are the section 11.2 minimums at S / M / L, widened so a part the pupil shades is at
// least 6 mm (RP-5, RP-93). The SVG is drawn in millimetres (viewBox) and sized in mm, so a
// printed model is its true size and the screen shows the same proportions (max-width 100%).
//
// Shade-it items: `blank` draws every part empty; `targets` wraps each part in the
// `.shade-target` group the screen's shade-parts host toggles (question-render.js), its fill
// element carrying `data-fill-color` (the one grey).
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

import { INK } from '../tokens.js';

const PT_MM = 25.4 / 72;
const HEAVY = (1.5 * PT_MM).toFixed(3);   // 1.5 pt outline
const HAIR = (0.75 * PT_MM).toFixed(3);   // 0.75 pt partitions and part ticks

/** Every model a fraction item can be drawn as. */
export const FRAC_MODELS = Object.freeze(['area', 'bar', 'circle', 'line']);

// Section 11.2 minimums (mm) and the part sizes that keep RP-5 (6 mm) when a pupil shades.
const DIM = Object.freeze({
    S: { circle: 36, barW: 48, barH: 14, barPart: 7, cell: 9, linePitch: 10, lineMin: 60, label: 9 },
    M: { circle: 42, barW: 52, barH: 16, barPart: 7.5, cell: 10, linePitch: 11, lineMin: 66, label: 10 },
    L: { circle: 50, barW: 56, barH: 18, barPart: 8, cell: 11, linePitch: 12, lineMin: 72, label: 12 },
});

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

/** One part: a shape, grey or paper, optionally wrapped as a screen shade target. */
function part(shapeTag, attrs, idx, shaded, targets) {
    const fill = shaded ? INK.grey : INK.paper;
    const el = `<${shapeTag} ${attrs} fill="${fill}" stroke="${INK.ink}" stroke-width="${HAIR}"${targets ? ` data-fill-color="${INK.grey}"` : ''}/>`;
    return targets ? `<g class="shade-target" data-idx="${idx}" data-shaded="0" style="cursor:pointer">${el}</g>` : el;
}

/**
 * The model's size in mm at a size preset, before drawing (the layout reads it).
 * @returns {{wMm: number, hMm: number}}
 */
export function fracModelSize(kind, d, size = 'L', wholeMm = null) {
    const D = DIM[size] || DIM.L;
    const den = Math.max(1, Math.round(Number(d) || 1));
    // A fixed whole: two fractions compared or matched are drawn on the SAME whole (the width
    // of a bar, area model or line; a circle's diameter), however many parts each has.
    const whole = Number(wholeMm) > 0 ? Number(wholeMm) : null;
    if (whole) {
        if (kind === 'circle') return { wMm: whole + 1, hMm: whole + 1 };
        if (kind === 'bar') return { wMm: whole + 1, hMm: D.barH + 1 };
        if (kind === 'area') return { wMm: whole + 1, hMm: Math.round(whole * 0.6) + 1 };
        return { wMm: whole + 10, hMm: 6 + 3 + D.label * PT_MM * 1.3 + 1 };
    }
    if (kind === 'circle') {
        // RP-93: a part at least 6 mm at mid-radius -> D >= 12 d / pi
        const dia = Math.max(D.circle, Math.ceil((12 * den) / Math.PI));
        return { wMm: dia + 1, hMm: dia + 1 };
    }
    if (kind === 'bar') return { wMm: Math.max(D.barW, den * D.barPart) + 1, hMm: D.barH + 1 };
    if (kind === 'area') {
        const { rows, cols } = areaGrid(den);
        return { wMm: cols * D.cell + 1, hMm: rows * D.cell + 1 };
    }
    // line: 0 to 1, every part at least the pitch; room for the labels and the dot
    const len = Math.max(D.lineMin, den * D.linePitch);
    const lab = D.label * PT_MM;
    return { wMm: len + 10, hMm: 6 + 3 + lab * 1.3 + 1 };
}

/**
 * The SVG of one fraction model.
 *
 * @param {{n: number, d: number, kind: 'area'|'bar'|'circle'|'line', size?: 'S'|'M'|'L',
 *          blank?: boolean, targets?: boolean, wholeMm?: number}} p
 *   n, d     the fraction (n parts of d shaded; the dot at n/d on a line). n may be 0.
 *   blank    draw every part empty (a shade-it item's pupil page)
 *   targets  make each part a screen shade target (implies blank)
 *   wholeMm  draw the whole at this width (diameter for a circle) - for fractions compared side by side
 * @returns {{svg: string, wMm: number, hMm: number}}
 */
export function fracModelSVG(p) {
    const kind = FRAC_MODELS.includes(p.kind) ? p.kind : 'bar';
    const size = DIM[p.size] ? p.size : 'L';
    const D = DIM[size];
    const d = Math.max(1, Math.round(Number(p.d) || 1));
    const n = Math.max(0, Math.min(d, Math.round(Number(p.n) || 0)));
    const targets = !!p.targets;
    const blank = !!p.blank || targets;
    const { wMm, hMm } = fracModelSize(kind, d, size, p.wholeMm);
    let body = '';
    if (kind === 'circle') {
        const r = (wMm - 1) / 2, c = wMm / 2;
        for (let i = 0; i < d; i++) {
            const a0 = -Math.PI / 2 + (2 * Math.PI * i) / d;
            const a1 = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / d;
            body += d === 1
                ? part('circle', `cx="${f2(c)}" cy="${f2(c)}" r="${f2(r)}"`, i, !blank && i < n, targets)
                : part('path', `d="${sectorPath(c, c, r, a0, a1)}"`, i, !blank && i < n, targets);
        }
        body += `<circle cx="${f2(c)}" cy="${f2(c)}" r="${f2(r)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
    } else if (kind === 'bar' || kind === 'area') {
        const { rows, cols } = kind === 'bar' ? { rows: 1, cols: d } : areaGrid(d);
        const W = wMm - 1, H = hMm - 1, cw = W / cols, ch = H / rows;
        for (let i = 0; i < d; i++) {
            const r = Math.floor(i / cols), k = i % cols;
            body += part('rect', `x="${f2(0.5 + k * cw)}" y="${f2(0.5 + r * ch)}" width="${f2(cw)}" height="${f2(ch)}"`, i, !blank && i < n, targets);
        }
        body += `<rect x="0.5" y="0.5" width="${f2(W)}" height="${f2(H)}" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
    } else {
        const len = wMm - 10, x0 = 4, y = 5.5;
        const X = (k) => x0 + (len * k) / d;
        const lab = D.label * PT_MM;
        body += `<line x1="${f2(x0 - 2)}" y1="${y}" x2="${f2(X(d) + 3)}" y2="${y}" stroke="${INK.ink}" stroke-width="${HEAVY}"/>`;
        body += `<path d="M${f2(X(d) + 4.5)} ${y} l-2.4 -1.3 v2.6 z" fill="${INK.ink}"/>`;
        for (let k = 0; k <= d; k++) {
            const whole = k === 0 || k === d;
            const t = whole ? 2.5 : 1.5;
            body += `<line x1="${f2(X(k))}" y1="${f2(y - t)}" x2="${f2(X(k))}" y2="${f2(y + t)}" stroke="${INK.ink}" stroke-width="${whole ? HEAVY : HAIR}"/>`;
            if (whole) {
                body += `<text x="${f2(X(k))}" y="${f2(y + 3 + lab)}" text-anchor="middle" font-size="${f2(lab)}" `
                    + `font-family="Andika, sans-serif" fill="${INK.ink}">${k === 0 ? 0 : 1}</text>`;
            }
        }
        if (!blank) body += `<circle cx="${f2(X(n))}" cy="${y}" r="1.25" fill="${INK.ink}" data-frac-dot="${n}"/>`;
    }
    const aria = kind === 'line' ? `number line from 0 to 1 in ${d} equal parts` : `${kind} model in ${d} equal parts`;
    const svg = `<svg class="mq-frac-model" data-frac-model="${kind}" data-frac-d="${d}" viewBox="0 0 ${f2(wMm)} ${f2(hMm)}" `
        + `width="${f2(wMm)}mm" height="${f2(hMm)}mm" role="img" aria-label="${aria}" `
        + `style="display:inline-block;vertical-align:middle;max-width:100%;height:auto;overflow:visible">${body}</svg>`;
    return { svg, wMm, hMm };
}

/**
 * The model at every size preset, for a cell the kit does not size itself (a legacy cell prints
 * the generator's markup): the S, M and L drawings side by side in one span, and the sheet's own
 * preset (`.ws-S` / `.ws-M` on the page and on the measuring host) shows its own - css/sheet-kit.css
 * `.mq-fm`. Outside a sheet (the screen) the L drawing shows. Each is drawn at its true size with
 * true stroke widths; nothing is scaled (INK-10, RP-3).
 */
export function fracModelSizedHTML(p) {
    const k = { S: 0.72, M: 0.84, L: 1 };
    const one = (sz) => fracModelSVG(Object.assign({}, p, {
        size: sz, wholeMm: Number(p.wholeMm) > 0 ? Math.round(Number(p.wholeMm) * k[sz]) : null,
    })).svg.replace('<svg class="mq-frac-model"', `<svg class="mq-frac-model" data-fm-size="${sz}"`);
    return `<span class="mq-fm" style="display:inline-block;vertical-align:middle;max-width:100%">${one('S')}${one('M')}${one('L')}</span>`;
}

/**
 * The fraction written stacked over a bar (TY-7), in Andika at the surrounding size: the printed
 * fraction beside a shade-it model, or the terms of a like-denominator sum.
 */
export function fracStackHTML(n, d, { bold = true } = {}) {
    return `<span class="mq-frac-stack" style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.05;font-weight:${bold ? 700 : 400}">`
        + `<span>${n}</span><span style="display:block;align-self:stretch;min-width:0.9em;border-top:1.5pt solid ${INK.ink};margin:0.06em 0"></span><span>${d}</span></span>`;
}
