// js/modules/sheet/cells/family.js
// Two number-sentence templates with real writing boxes:
//
//   `fact-family`  the three numbers in a number bond ABOVE the four facts, one per line:
//                      (11)
//                     /    \
//                   (8)    (3)
//                  8  + [ ] = [  ]
//                  3  + [ ] = [  ]
//                 [  ] −  8  = [ ]
//                 [  ] −  3  = [ ]
//                  The pupil WRITES the facts: each fact prints one number that fixes its order
//                  and the other two are boxes (payload `given`: 'anchor' default, 'none' for
//                  all three boxes, 'answer' for the old complete-the-answer form). The bond sat
//                  beside the facts (about 118 mm at L), which wrapped the facts under it in a
//                  2-column cell and held the page to 1 x 3; stacked, the cell is as wide as one
//                  fact line (about 70 mm at L), so 2 x 2 fits. Error analysis (`fix`) adds one
//                  fix box at the end of each fact; the key fills it only on the wrong fact.
//   `cloze-bank`   [  ] + [  ] = 12 with a NUMBER BANK printed inside the cell under each box:
//                   ( 5  7  8 )   ( 4  6  9 )
//
// Every equation is one unbreakable line (white-space: nowrap on the whole sentence), so "8 +"
// can never end a line with "11 =" on the next (the critic's wrapped facts). Each cloze addend
// has exactly one box and its own bank. The key writes every box (AK-1).
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

/**
 * Which numbers of each fact are PRINTED (the rest are boxes the pupil writes), by payload
 * `given` (the scaffold, 2026-09-25 regrade: "the pupil copies numbers and never writes a fact"):
 *   'anchor' (default)  one number per fact, the one that fixes its order: the first addend of
 *                       each addition fact, the subtrahend of each subtraction fact
 *                       ("8 + [ ] = [ ]", "[ ] − 8 = [ ]"), so every box has ONE right value
 *                       and the pupil writes the other two numbers of every fact
 *   'none'              nothing: "[ ] + [ ] = [ ]" (the fade; the key shows the family's order)
 *   'answer'            the operands, the answer a box (the old form: complete each fact)
 */
const GIVEN = {
    anchor: (f) => (f.op === '+' ? ['a'] : ['b']),
    none: () => [],
    answer: () => ['a', 'b'],
};
/**
 * The screen twin keeps the answer-only form unless the payload names one: the online
 * worksheet and the quiz join every `fact-family-input` in order and compare the list with
 * `q.ans` (the four answers), so operand boxes on screen would fail a right answer. Paper and
 * the practice card's per-box check are not affected; typing the operands on screen needs those
 * hosts to check box by box (`data-answer`) first.
 */
const givenOf = (p, ctx) => (ctx && ctx.mode === 'screen' && p.given === undefined ? GIVEN.answer : GIVEN[p.given] || GIVEN.anchor);
/** The slot id of one part of fact i: the answer keeps its old id `f<i>`. */
const partId = (i, part) => (part === 'c' ? `f${i}` : `f${i}${part}`);
/** Every writing slot of the family, in reading order: [{i, part, id, value}]. */
function blanksOf(p, ctx) {
    const fs = facts(p);
    const given = givenOf(p, ctx);
    const out = [];
    fs.forEach((f, i) => {
        const g = given(f);
        for (const part of ['a', 'b', 'c']) {
            if (g.includes(part)) continue;
            out.push({ i, part, id: partId(i, part), value: String(part === 'a' ? f.a : part === 'b' ? f.b : f.ans) });
        }
    });
    return out;
}
/** Error analysis: one fix box per fact line (`fix: 'line'`, or any `fix` the role passes). */
const fixLines = (p, ctx) => !!(p.fix || (ctx && ctx.options && ctx.options.fix));

register('fact-family', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const fs = facts(p);
        const blanks = blanksOf(p, ctx);
        const key = {};
        for (const b of blanks) key[b.id] = b.value;
        // A shown wrong answer list ("20, 20, 3, 17") is the four facts' answers, in order.
        const vals = slotValues(ctx, key, (w) => {
            const l = splitList(w);
            const o = {};
            fs.forEach((_, i) => { if (l[i] !== undefined) o[`f${i}`] = l[i]; });
            return o;
        });
        // One box width for every box: the whole's digits (L-LEAK: no box tells a length).
        const n = String(Number(p.a) + Number(p.b)).length;
        const bw = boxMm(g, n);
        const input = (b) => `<input type="text" class="fact-family-input" inputmode="numeric" autocomplete="off" data-eq="${b.i}" data-part="${b.part}" data-answer="${esc(b.value)}" data-ws-slot="${b.id}" data-ws-shape="box" aria-label="fact ${b.i + 1} ${b.part === 'c' ? 'answer' : 'number'}" `
            + `style="box-sizing:border-box;width:${(bw / (g.E * EQ_EM)).toFixed(3)}em;height:${(g.stripMm / (g.E * EQ_EM)).toFixed(3)}em;border:${HAIR} solid ${INK.ink};border-radius:${(g.rMm / (g.E * EQ_EM)).toFixed(3)}em;background:#fff;color:${INK.ink};font:inherit;font-size:1em;text-align:center;padding:0">`;
        const slot = (b) => (g.twin ? input(b) : box(g, b.id, { wMm: bw / EQ_EM, hMm: g.stripMm / EQ_EM, value: vals[b.id] || '', ink, mark: null }));
        const bond = bondSVG(g, p);
        // The four facts on one grid, so the numbers, the operators, the "=" and the boxes stand
        // in columns (a number stands centred where the box above or below it is).
        const c = (t, extra = '') => `<span style="${extra}">${t}</span>`;
        const num = (v) => c(esc(v), 'text-align:center');
        const fix = fixLines(p, ctx);
        const fixKey = fix && !!((ctx.options && ctx.options.fixKey) || ctx.state === 'answered' || ctx.state === 'traced');
        const cells = fs.map((f, i) => {
            const part = (pt, v) => { const b = blanks.find((x) => x.i === i && x.part === pt); return b ? slot(b) : num(v); };
            let row = part('a', f.a) + c(f.op, 'font-weight:700;text-align:center') + part('b', f.b)
                + c('=', 'font-weight:700;text-align:center') + part('c', f.ans);
            if (fix) {
                // H9: the fix goes beside the fact it corrects. The key writes the right answer
                // only where the shown answer is wrong.
                const shown = vals[`f${i}`];
                const wrongLine = fixKey && shown !== undefined && shown !== '' && String(shown) !== String(f.ans);
                row += box(g, `x${i}`, { wMm: bw / EQ_EM, hMm: g.stripMm / EQ_EM, value: wrongLine ? String(f.ans) : '', ink: wrongLine ? 'solid' : null, mark: g.twin ? 'cell' : null, extra: 'margin-left:0.6em' });
            }
            return row;
        }).join('');
        const tracks = `auto 1em auto 1em auto${fix ? ' auto' : ''}`;
        const lines = `<div style="display:inline-grid;grid-template-columns:${tracks};column-gap:0.28em;row-gap:${g.em(1.5 / EQ_EM)};align-items:center;justify-items:center;white-space:nowrap;font-size:${EQ_EM}em">${cells}</div>`;
        // The bond above, the facts under it, both centred: one drawing at every column count,
        // so a narrower column never re-flows it (DN-10).
        const body = `<div style="display:flex;flex-direction:column;align-items:center;gap:0.3em">`
            + `<div style="flex:0 0 auto">${bond.svg}</div><div style="flex:0 0 auto;text-align:left">${lines}</div></div>`;
        return root(g, 'fact-family', body, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const fs = facts(p);
        const slots = {};
        for (const b of blanksOf(p)) slots[b.id] = { value: b.value, graded: true };
        // The value stays the four answers in order (q.ans, SCC-T16); every box is keyed.
        const list = fs.map((f) => f.ans).join(', ');
        return { value: list, display: list, slots };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const bond = bondSVG(g, p);
        // The wider of the bond and one fact line (three places, at most two of them boxes,
        // two operators and four gaps at 0.85 of the digit size), plus the side pads.
        const n = String(Number(p.a) + Number(p.b)).length;
        const bw = boxMm(g, n);
        const boxes = Math.max(...facts(p).map((f) => 3 - givenOf(p, ctx)(f).length)) + (p.fix ? 1 : 0);
        const line = (Math.max(0, 3 - boxes) * n * 0.56 + 2 + 4 * 0.28) * g.E * EQ_EM + boxes * bw;
        return { wMm: Math.ceil(Math.max(bond.wMm, line) + 8), hMm: null, measure: true, factLike: false, maxCols: 2 };
    },
    inputs(p, ctx) {
        return blanksOf(p || {}, ctx).map((b, k) => ({ id: b.id, kind: 'number', shape: 'box', graded: true, order: k, inputmode: 'numeric', scopes: ['full'] }));
    },
    layout() { return { card: 'card-number-family', checker: 'fact-family', requiresVisual: true }; },
});

/** A family box: wide enough for the whole's digits at the family's size, never under 1.6 Hw. */
function boxMm(g, n) {
    return Math.max(g.writeMm * 1.6, (n * 0.62 + 0.8) * g.E * EQ_EM);
}

/* ------------------------------------------------------------------------ cloze bank */

/** A bank number's size: at least 16 pt (2026-09-25 regrade: 13 pt banks were too small to read). */
const BANK_PT = 16;
const BANK_GAP_EM = 0.55;          // between two bank numbers, in the bank's own em
const OP_EM = 0.62;                // the + and = tracks, in digit em

/**
 * The cloze's fixed geometry, mm: every item of a size draws the same tracks, so the boxes, the
 * + and the = stand in the same place in every cell of a column (the regrade's shifting rows).
 * A column is as wide as the wider of its box and its bank (three numbers of up to 2 digits).
 */
function clozeGeom(g, p) {
    const n = Math.max(2, ...[...((p.banks || [])[0] || []), ...((p.banks || [])[1] || [])].map((v) => String(v).length));
    const per = Math.max(3, ((p.banks || [])[0] || []).length, ((p.banks || [])[1] || []).length);
    const bankE = BANK_PT * PT_MM;
    const bankW = per * n * 0.56 * bankE + (per - 1) * BANK_GAP_EM * bankE + 2 * 1.5 + 0.6;
    const bw = Math.max(g.writeMm * 1.7, (n * 0.6 + 0.5) * g.E);
    const colW = Math.max(bw, bankW);
    const sumW = Math.max(2, String(p.sum).length) * 0.56 * g.E + 1;
    return { n, bw, colW, sumW, opW: OP_EM * g.E, width: 2 * colW + 2 * OP_EM * g.E + sumW + 1.5 };
}

register('cloze-bank', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const key = { a: String(p.a), b: String(p.b) };
        const vals = slotValues(ctx, key, (w) => { const l = splitList(w); return { a: l[0], b: l[1] }; });
        const k = clozeGeom(g, p);
        const slot = (id) => box(g, id, { wMm: k.bw, hMm: g.stripMm, value: vals[id] || '', ink, mark: g.twin ? 'cell' : null });
        // SF-40: a bank is a thing to READ, a reference list for the box above it (the pupil
        // WRITES the number: one answer format, H8), so it is a 3 mm rounded container of
        // regular-weight numbers at 16 pt or more, spaced so each one stands alone.
        const bank = (list) => `<span class="cz-bank" style="display:inline-flex;gap:${BANK_GAP_EM}em;align-items:center;justify-content:center;white-space:nowrap;`
            + `border:${HAIR} solid ${INK.ink};border-radius:${g.em(3)};padding:${g.em(0.8)} ${g.em(1.5)};font-size:${(BANK_PT / g.pt).toFixed(3)}em;font-weight:400;line-height:1.2">`
            + list.map((v) => `<span>${esc(v)}</span>`).join('') + '</span>';
        // Each addend is one column, its box over its bank (the screen host wires a bank to the
        // box it shares a column with), every column a fixed width.
        const col = (id, list) => `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:${g.em(2)};width:${g.em(k.colW)};flex:none">${slot(id)}${bank(list)}</span>`;
        const op = (t) => `<span style="font-weight:700;width:${g.em(k.opW)};flex:none;text-align:center;line-height:${g.em(g.stripMm)}">${t}</span>`;
        const eq = `<div style="display:inline-flex;align-items:flex-start;white-space:nowrap">`
            + `${col('a', p.banks[0] || [])}${op('+')}${col('b', p.banks[1] || [])}${op('=')}`
            + `<span style="width:${g.em(k.sumW)};flex:none;text-align:left;padding-left:${g.em(1.5)};box-sizing:content-box;line-height:${g.em(g.stripMm)}">${esc(p.sum)}</span></div>`;
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
        const k = clozeGeom(g, p);
        return { wMm: Math.ceil(k.width + 4), hMm: Math.ceil(g.stripMm + 2 + BANK_PT * PT_MM * 1.2 + 3 + 6), measure: true, factLike: false, maxCols: 3 };
    },
    inputs() {
        return ['a', 'b'].map((id, i) => ({ id, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full'] }));
    },
    layout() { return { card: 'card-simple', checker: 'list', requiresVisual: true }; },
});
