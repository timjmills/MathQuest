// js/modules/sheet/graphics/fact-triangle.js
// Library entry `factTriangle` (design/GRAPHIC_LIBRARY.md): the three numbers of a fact family
// at the corners of a triangle, the WHOLE (the largest number) at the top corner, the two parts at
// the base corners (c-research §1: the US fact-triangle convention; the whole is always in the same
// place). One 1.5 pt outline (VQ-6 structure), numbers inside their corners at the working digit
// size in proportional Andika (VQ-5). Equilateral, side 34 / 42 / 50 mm (S / M / L).
//
// The triangle draws the RELATION (two parts make the whole) without stating whether it holds:
// a non-example (4, 5, 11) is drawn the same way, its largest number on top, so the pupil checks it.
// An optional `signs` string (e.g. '+ −') is printed small in the centre.
//
// Paper: an SVG in mm. Screen twin: the same SVG, its width in --mq-k2 units (one drawing, VQ-8).
//
// Pure module (SCC-01).

import { INK, L, n2, digitPt, zonePt, sizeOf, PT_MM, esc, stroke } from './units.js';

export const TRIANGLE_SIDE = Object.freeze({ S: 34, M: 42, L: 50 });

/** The triangle's drawn size in mm, for a cell that lays it out. */
export function factTriangleSize(ctx) {
    const s = TRIANGLE_SIDE[sizeOf(ctx)] || TRIANGLE_SIDE.L;
    return { wMm: s, hMm: n2(s * Math.sqrt(3) / 2) };
}

/**
 * @param {Object} ctx  the cell context
 * @param {Object} o    {top: the whole, left, right: the parts, signs: '' | '+ −', label}
 */
export function factTriangle(ctx, o = {}) {
    const s = TRIANGLE_SIDE[sizeOf(ctx)] || TRIANGLE_SIDE.L;
    const h = s * Math.sqrt(3) / 2;
    const sw = stroke(1.5) * PT_MM;
    const m = sw;                                   // the outline stays inside the box
    const fs = digitPt(ctx) * PT_MM;                // the working digit size, in mm
    const num = (x, y, v) => `<text x="${n2(x)}" y="${n2(y + fs * 0.35)}" text-anchor="middle" font-size="${n2(fs)}" font-weight="700" `
        + `font-family="Andika, 'Open Sans', sans-serif" fill="${INK}" style="font-variant-numeric:lining-nums proportional-nums;letter-spacing:0;">${esc(v)}</text>`;
    const outline = `<path d="M${n2(m + s / 2)} ${n2(m)} L${n2(m + s)} ${n2(m + h)} L${n2(m)} ${n2(m + h)} Z" fill="#fff" stroke="${INK}" stroke-width="${n2(sw)}" stroke-linejoin="round"/>`;
    const signs = o.signs
        ? `<text x="${n2(m + s / 2)}" y="${n2(m + h * 0.66 + zonePt(ctx) * PT_MM * 0.35)}" text-anchor="middle" font-size="${n2(zonePt(ctx) * PT_MM)}" font-weight="700" font-family="Andika, 'Open Sans', sans-serif" fill="${INK}">${esc(o.signs)}</text>`
        : '';
    // Each number is placed from its own width so its ink keeps >= 2 mm to the slant it faces (critic r1 F10: a
    // two-digit part came within 0.8 mm of the side at S and on the quiz host). Widths are a generous 0.6 em a digit.
    const half = 0.36 * fs;
    const wOf = (v) => Math.max(1, String(v === undefined || v === null ? '' : v).length) * 0.6 * fs;
    const gapH = 2 / Math.sin(Math.PI / 3) + sw / 2;           // 2 mm square to a 60 degree side, as a horizontal gap
    const yb = Math.min(h * 0.82, h - 2.2 - half);               // the base row, 2.2 mm over the base line
    const xb = (v) => Math.max(s * 0.29, (s / 2) * (1 - (yb - half) / h) + gapH + wOf(v) / 2);
    const yt = Math.max(h * 0.43, (h * (wOf(o.top) / 2 + gapH)) / (s / 2) + half);
    const body = outline
        + num(m + s / 2, m + yt, o.top)
        + num(m + Math.min(s / 2 - 1, xb(o.left)), m + yb, o.left)
        + num(m + Math.max(s / 2 + 1, s - xb(o.right)), m + yb, o.right)
        + signs;
    const W = s + 2 * m, H = h + 2 * m;
    const label = esc(o.label || `fact triangle: ${o.top} at the top, ${o.left} and ${o.right} below`);
    return `<svg class="mq-gl-triangle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(W)} ${n2(H)}" role="img" aria-label="${label}" `
        + `style="display:block;width:${L(ctx, W)};height:auto;max-width:100%;overflow:visible;">${body}</svg>`;
}
