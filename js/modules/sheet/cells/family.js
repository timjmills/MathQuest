// js/modules/sheet/cells/family.js
// Two number-sentence templates with real writing boxes:
//
//   `fact-family`  the three numbers in a number bond ABOVE the four facts, one per line:
//                      (11)
//                     /    \
//                   (8)    (3)
//                  8 + 3 = [  ]
//                  3 + 8 = [  ]
//                 11 − 8 = [  ]
//                 11 − 3 = [  ]
//                  The bond sat beside the facts (about 118 mm at L), which wrapped the facts
//                  under the bond in a 2-column cell and held the page to 1 x 3. Stacked, the
//                  cell is as wide as one fact line (about 65 mm at L), so 2 x 2 fits. A 2 x 2
//                  grid of facts would be about 130 mm: wider than a 2-column cell.
//   `cloze-bank`   [  ] + [  ] = 12 with a NUMBER BANK printed inside the cell under each box:
//                   ( 5  7  8 )   ( 4  6  9 )
//
// Every equation is one unbreakable line (white-space: nowrap on the whole sentence), so "8 +"
// can never end a line with "11 =" on the next (the critic's wrapped facts). Each fact family
// line has exactly one box, the answer; each cloze addend has exactly one box and its own bank.
// The key writes every box (AK-1).
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc, splitList, HAIR } from './ops-common.js';
import { INK } from '../tokens.js';

const PT_MM = 25.4 / 72;
const EQ_EM = 0.85;                 // a family line's digit size, relative to the preset digit

/* ---------------------------------------------------------------------- fact family */

const facts = (p) => {
    const a = Number(p.a), b = Number(p.b), w = a + b;
    return [
        { a, op: '+', b, ans: w },
        { a: b, op: '+', b: a, ans: w },
        { a: w, op: '−', b: a, ans: b },
        { a: w, op: '−', b, ans: a },
    ];
};

function bondSVG(g, p) {
    const a = Number(p.a), b = Number(p.b), w = a + b;
    const fs = g.pt * 0.8 * PT_MM;                   // numbers in the bond, mm
    const r = fs * 0.95;
    const W = r * 6 + 4, H = r * 5 + 2;
    const top = { x: W / 2, y: r + 1 }, left = { x: r + 1, y: H - r - 1 }, right = { x: W - r - 1, y: H - r - 1 };
    const circ = (c, v) => `<circle cx="${c.x.toFixed(2)}" cy="${c.y.toFixed(2)}" r="${r.toFixed(2)}" fill="#fff" stroke="${INK.ink}" stroke-width="0.265"/>`
        + `<text x="${c.x.toFixed(2)}" y="${(c.y + fs * 0.35).toFixed(2)}" text-anchor="middle" font-size="${fs.toFixed(2)}" font-family="Andika, sans-serif" fill="${INK.ink}">${v}</text>`;
    const ln = (c) => `<line x1="${top.x.toFixed(2)}" y1="${(top.y + r).toFixed(2)}" x2="${c.x.toFixed(2)}" y2="${(c.y - r).toFixed(2)}" stroke="${INK.ink}" stroke-width="0.265"/>`;
    const body = ln(left) + ln(right) + circ(top, w) + circ(left, a) + circ(right, b);
    return { svg: `<svg viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" role="img" aria-label="${w} is ${a} and ${b}" style="display:block;width:${g.em(W)};height:${g.screen ? 'auto' : g.em(H)};max-width:${g.screen ? '100%' : 'none'}">${body}</svg>`, wMm: W, hMm: H };
}

register('fact-family', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const fs = facts(p);
        const key = {};
        fs.forEach((f, i) => { key[`f${i}`] = String(f.ans); });
        const vals = slotValues(ctx, key, (w) => {
            const l = splitList(w);
            const o = {};
            fs.forEach((_, i) => { if (l[i] !== undefined) o[`f${i}`] = l[i]; });
            return o;
        });
        // One box width for all four lines: the whole's digits (L-LEAK: no box tells a length).
        const n = String(Number(p.a) + Number(p.b)).length;
        const bw = Math.max(g.writeMm * 2, (n * 0.62 + 0.8) * g.E * EQ_EM);
        const slot = (i) => {
            if (g.twin) {
                return `<input type="text" class="fact-family-input" inputmode="numeric" autocomplete="off" data-eq="${i}" data-answer="${fs[i].ans}" data-ws-slot="f${i}" data-ws-shape="box" aria-label="answer ${i + 1}" `
                    + `style="box-sizing:border-box;width:${(bw / (g.E * EQ_EM)).toFixed(3)}em;height:${(g.stripMm / (g.E * EQ_EM)).toFixed(3)}em;border:${HAIR} solid ${INK.ink};border-radius:${(g.rMm / (g.E * EQ_EM)).toFixed(3)}em;background:#fff;color:${INK.ink};font:inherit;font-size:1em;text-align:center;padding:0">`;
            }
            return box(g, `f${i}`, { wMm: bw / EQ_EM, hMm: g.stripMm / EQ_EM, value: vals[`f${i}`] || '', ink, mark: null });
        };
        const bond = bondSVG(g, p);
        // The four facts on one grid, so the operators, the "=" and the boxes stand in columns.
        const c = (t, extra = '') => `<span style="${extra}">${t}</span>`;
        const lines = `<div style="display:inline-grid;grid-template-columns:auto 1em auto 1em auto;column-gap:0.28em;row-gap:0.15em;align-items:center;white-space:nowrap;font-size:${EQ_EM}em">`
            + fs.map((f, i) => c(esc(f.a), 'text-align:right') + c(f.op, 'font-weight:700;text-align:center') + c(esc(f.b), 'text-align:right')
                + c('=', 'font-weight:700;text-align:center') + slot(i)).join('') + '</div>';
        // The bond above, the facts under it, both centred: one drawing at every column count,
        // so a narrower column never re-flows it (DN-10).
        const body = `<div style="display:flex;flex-direction:column;align-items:center;gap:0.3em">`
            + `<div style="flex:0 0 auto">${bond.svg}</div><div style="flex:0 0 auto;text-align:left">${lines}</div></div>`;
        return root(g, 'fact-family', body, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const fs = facts(p);
        const slots = {};
        fs.forEach((f, i) => { slots[`f${i}`] = { value: String(f.ans), graded: true }; });
        const list = fs.map((f) => f.ans).join(', ');
        return { value: list, display: list, slots };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const bond = bondSVG(g, p);
        // The wider of the bond and one fact line ("20 − 12 = [  ]": about 5.4 em of text at
        // 0.85 of the digit size, then the box), plus the side pads.
        const n = String(Number(p.a) + Number(p.b)).length;
        const bw = Math.max(g.writeMm * 2, (n * 0.62 + 0.8) * g.E * EQ_EM);
        const line = (4 * 0.56 + 2 + 4 * 0.28) * g.E * EQ_EM + bw;
        return { wMm: Math.ceil(Math.max(bond.wMm, line) + 8), hMm: null, measure: true, factLike: false, maxCols: 2 };
    },
    inputs() {
        return [0, 1, 2, 3].map((i) => ({ id: `f${i}`, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full'] }));
    },
    layout() { return { card: 'card-number-family', checker: 'fact-family', requiresVisual: true }; },
});

/* ------------------------------------------------------------------------ cloze bank */

register('cloze-bank', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const key = { a: String(p.a), b: String(p.b) };
        const vals = slotValues(ctx, key, (w) => { const l = splitList(w); return { a: l[0], b: l[1] }; });
        const n = Math.max(...[...(p.banks[0] || []), ...(p.banks[1] || [])].map((v) => String(v).length), 1);
        const bw = Math.max(g.writeMm * 1.7, (n * 0.6 + 0.5) * g.E);
        const slot = (id) => box(g, id, { wMm: bw, hMm: g.stripMm, value: vals[id] || '', ink, mark: g.twin ? 'cell' : null });
        // SF-40: a bank is a thing to READ, so it is a 3 mm rounded container, never a slot.
        const bank = (list) => `<span style="display:inline-flex;gap:0.45em;align-items:center;justify-content:center;white-space:nowrap;`
            + `border:${HAIR} solid ${INK.ink};border-radius:${g.em(3)};padding:${g.em(1)} ${g.em(1.5)};font-size:0.62em;font-weight:700">`
            + list.map((v) => `<span>${esc(v)}</span>`).join('') + '</span>';
        const col = (id, list) => `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:0.3em">${slot(id)}${bank(list)}</span>`;
        const eq = `<div style="display:inline-flex;align-items:flex-start;gap:0.2em;white-space:nowrap">`
            + `${col('a', p.banks[0] || [])}`
            + `<span style="font-weight:700;width:1em;text-align:center;line-height:${g.em(g.stripMm)}">+</span>`
            + `${col('b', p.banks[1] || [])}`
            + `<span style="font-weight:700;width:1em;text-align:center;line-height:${g.em(g.stripMm)}">=</span>`
            + `<span style="line-height:${g.em(g.stripMm)}">${esc(p.sum)}</span></div>`;
        return root(g, 'cloze-bank', eq, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        return {
            value: `${p.a}, ${p.b}`, display: `${p.a}, ${p.b}`,
            slots: { a: { value: String(p.a), graded: true }, b: { value: String(p.b), graded: true } },
        };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        return { wMm: Math.ceil(g.E * 5.5 + 16), hMm: Math.ceil(g.stripMm + g.E * 1.4 + 8), measure: true, factLike: false, maxCols: 3 };
    },
    inputs() {
        return ['a', 'b'].map((id, i) => ({ id, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full'] }));
    },
    layout() { return { card: 'card-simple', checker: 'list', requiresVisual: true }; },
});
