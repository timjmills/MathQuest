// js/modules/sheet/cells/fact-ladder.js
// The `fact-ladder` template: one known fact and the same fact in tens, hundreds (and thousands),
// one row each, for addition:add_sub_patterns ("Spot the Pattern (+/−)", build list, lane
// operations, entry 3; 2.NBT.8-9, 3.NBT.2).
//
//        3 +    4 =    7          the known fact (printed at support level 2; boxed at level 1)
//       30 +   40 = [    ]        each row the fact times the place
//      300 +  400 = [    ]
//
// The numbers stand in right-aligned columns (the zeros line up under each other, so the pupil
// SEES what changes and what stays). Kinds (payload.kind):
//   result   write each answer (+ or −)
//   missing  the second number is missing: 30 + [ ] = 70
//   words    in place-value words: 3 tens + 4 tens = [ ] tens = [ ]  (why it works, 2.NBT.9)
// Looks (payload.look): 'across' (the ladder of sentences) or 'stacked' (the same facts as column
// sums side by side). Every box on an item is one width, sized for the widest answer the ladder
// can have (L3), never for its own answer.
//
// payload: { kind, op: '+'|'-', a, b, places: [1, 10, 100 ...], given: bool, look }
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, slotValue, digitPt, textPt, sizeOf, isTwin, inkOf, KEY_FEATURES } from './k2kit.js';
import { blankWidth } from '../tokens.js';

const PT_MM = 25.4 / 72;
// four digits at most, written without a comma (the screen's digit boxes compose "7000")
const fmt = (n) => String(Number(n));
const PLACE_WORD = { 10: 'tens', 100: 'hundreds', 1000: 'thousands' };
// place words are text beside the digits: the text size, a little larger so they read as part of
// the number sentence
const WORD_EM = 1.1;
const WORD_GAP = 1.6;
// Andika's average advance for a lower-case word, in em
const WORD_ADV = 0.52;

/** One row of the ladder: its two numbers and answer. */
export function ladderRows(p) {
    const a = Number(p.a), b = Number(p.b), op = p.op === '-' ? '-' : '+';
    return (p.places || [1, 10, 100]).map((pl) => {
        const A = a * pl, Bn = b * pl;
        return { place: pl, A, B: Bn, R: op === '+' ? A + Bn : A - Bn };
    });
}

/** The answers in reading order (the rows the pupil writes, top to bottom). */
export function ladderAnswers(p) {
    const rows = ladderRows(p);
    const out = [];
    rows.forEach((r, i) => {
        if (i === 0 && p.given) return;
        if (p.kind === 'missing') out.push(fmt(r.B));
        else if (p.kind === 'words' && r.place > 1) { out.push(String(Number(p.op === '-' ? p.a - p.b : p.a + p.b))); out.push(fmt(r.R)); }
        else out.push(fmt(r.R));
    });
    return out;
}

function geom(ctx, p) {
    const rows = ladderRows(p);
    const widest = Math.max(...rows.map((r) => Math.max(fmt(r.A).length, fmt(r.B).length, fmt(Math.abs(r.R)).length)));
    const pt = digitPt(ctx);
    const chW = pt * PT_MM * 0.6;
    return { rows, widest, pt, chW, box: { w: blankWidth(widest, sizeOf(ctx), widest > 3 ? 1 : 0), h: S_h(ctx) } };
}
/** Width of the numeric ladder (the result kind, across) for this payload's band and size. */
const numericW = (g) => 2 * g.widest * g.chW + g.box.w + 4 * g.chW + 8;
/** The column limit for two ladders side by side. */
const TWO_COL_MM = 88;
const S_h = (ctx) => ({ S: 10, M: 12, L: 14 }[sizeOf(ctx)] || 14);

function writeBox(ctx, g, id, value, wMm = g.box.w) {
    const ink = value !== '' ? inkOf(ctx) : null;
    const color = ink === 'trace' ? GREY : INK;
    const hook = isTwin(ctx) ? ' data-mq-cell="1" data-mq-w="6"' : '';
    return `<span data-ws-slot="${esc(id)}" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} style="display:inline-flex;align-items:center;`
        + `justify-content:center;box-sizing:border-box;width:${L(ctx, wMm)};height:${L(ctx, g.box.h)};border:${B(ctx, 0.75)} solid ${INK};`
        + `border-radius:${L(ctx, 1.25)};background:#fff;font-weight:700;color:${color};${KEY_FEATURES}">${esc(value)}</span>`;
}

const cellSpan = (ctx, t, { right = true, bold = false } = {}) => `<span style="display:flex;justify-content:${right ? 'flex-end' : 'center'};align-items:center;${bold ? 'font-weight:700;' : ''}white-space:nowrap;">${t}</span>`;

function acrossHTML(ctx, p, g) {
    const glyph = p.op === '-' ? '−' : '+';
    const keys = ladderAnswers(p);
    let k = 0;
    const next = (wMm) => { const id = `b${k}`; const v = slotValue(ctx, id, keys[k]); k++; return writeBox(ctx, g, id, v, wMm); };
    // how many tens (or hundreds) is the fact's own answer: always one digit, so its box is the
    // one-digit width on every row (L3: sized for the widest answer that slot can hold)
    const oneBox = blankWidth(1, sizeOf(ctx));
    const tp = textPt(ctx);
    const word = (t) => `<span style="font-size:${P(ctx, tp * WORD_EM)};white-space:nowrap;">${esc(t)}</span>`;
    const numW = L(ctx, g.widest * g.chW + 1);
    const flexRow = (inner, pad = 0) => `<div style="display:flex;align-items:center;gap:${L(ctx, WORD_GAP)};white-space:nowrap;${pad ? `padding-left:${L(ctx, pad)};` : ''}">${inner}</div>`;
    const lines = g.rows.map((r, i) => {
        const given = i === 0 && p.given;
        if (p.kind === 'words') {
            if (r.place === 1) {
                // the known fact, written plainly (its numbers are single digits)
                const res = given ? esc(fmt(r.R)) : next(oneBox);
                return flexRow(`${esc(fmt(r.A))}<b>${glyph}</b>${esc(fmt(r.B))}<b>=</b>${res}`);
            }
            // the chain, one step a line (the equals signs stand under each other):
            //   3 tens + 4 tens
            //      = [ ] tens
            //      = [ ]
            // so the ladder is as narrow as its widest phrase and sits beside other ladders
            const w = PLACE_WORD[r.place] || '';
            const indent = g.chW * 1.6;
            const expr = flexRow(`${esc(fmt(p.a))}${word(w)}<b>${glyph}</b>${esc(fmt(p.b))}${word(w)}`);
            const count = `<b>=</b>${next(oneBox)}${word(w)}`;
            const number = `<b>=</b>${next()}`;
            return `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 1.5)};">`
                + expr + flexRow(count, indent) + flexRow(number, indent) + '</div>';
        }
        const Bcell = p.kind === 'missing' && !given ? next() : esc(fmt(r.B));
        // a printed answer stands right-aligned in the box's width, so its digits line up with the
        // numbers above and below it
        const Rcell = p.kind === 'missing' || given
            ? `<span style="display:inline-flex;justify-content:flex-end;width:${L(ctx, p.kind === 'missing' ? g.widest * g.chW + 1 : g.box.w - 2)};">${esc(fmt(r.R))}</span>` : next();
        return `<div style="display:grid;grid-template-columns:${numW} ${L(ctx, g.chW * 1.6)} ${p.kind === 'missing' ? L(ctx, g.box.w) : numW} ${L(ctx, g.chW * 1.6)} auto;`
            + `align-items:center;column-gap:${L(ctx, 1.2)};">`
            + cellSpan(ctx, esc(fmt(r.A))) + cellSpan(ctx, glyph, { right: false, bold: true })
            + cellSpan(ctx, Bcell) + cellSpan(ctx, '=', { right: false, bold: true }) + `<span style="display:flex;justify-content:flex-start;">${Rcell}</span></div>`;
    });
    return `<div style="display:inline-flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 3)};">${lines.join('')}</div>`;
}

function stackedHTML(ctx, p, g) {
    const glyph = p.op === '-' ? '−' : '+';
    const keys = ladderAnswers(p);
    let k = 0;
    const next = () => { const id = `b${k}`; const v = slotValue(ctx, id, keys[k]); k++; return writeBox(ctx, g, id, v); };
    const colW = Math.max(g.box.w, (g.widest + 1.5) * g.chW) + 2;
    const sums = g.rows.map((r, i) => {
        const given = i === 0 && p.given;
        const right = (t) => `<div style="display:flex;justify-content:flex-end;align-items:center;min-height:${L(ctx, g.pt * PT_MM * 1.3)};">${t}</div>`;
        const Bcell = p.kind === 'missing' && !given ? next() : esc(fmt(r.B));
        const Rcell = p.kind === 'missing' || given ? esc(fmt(r.R)) : next();
        return `<div style="width:${L(ctx, colW)};display:flex;flex-direction:column;gap:${L(ctx, 1)};">`
            + right(esc(fmt(r.A)))
            + right(`<b style="margin-right:auto;">${glyph}</b>${Bcell}`)
            + `<div style="border-top:${B(ctx, 2.25)} solid ${INK};"></div>`
            + right(Rcell) + '</div>';
    });
    return `<div style="display:inline-flex;align-items:flex-start;gap:${L(ctx, 7)};">${sums.join('')}</div>`;
}

register('fact-ladder', {
    render(p, ctx) {
        const g = geom(ctx, p);
        // the words kind is read across (its place words are the point); the others take the look
        const body = p.look === 'stacked' && p.kind !== 'words' ? stackedHTML(ctx, p, g) : acrossHTML(ctx, p, g);
        return root(ctx, 'fact-ladder', `<div style="display:flex;justify-content:center;font-size:${P(ctx, g.pt)};line-height:1.1;">${body}</div>`,
            { attrs: `${isTwin(ctx) ? ' data-mq-join=", "' : ''} data-ladder-kind="${esc(p.kind)}"` });
    },
    answerKey(p) {
        const keys = ladderAnswers(p);
        const slots = {};
        keys.forEach((v, i) => { slots[`b${i}`] = { value: v, graded: true }; });
        return { value: keys.join(', '), display: keys.join(', '), slots };
    },
    footprint(p, ctx) {
        const g = geom(ctx, p);
        const n = g.rows.length;
        let w;
        if (p.look === 'stacked' && p.kind !== 'words') w = n * (Math.max(g.box.w, (g.widest + 1.5) * g.chW) + 2) + (n - 1) * 7;
        else if (p.kind === 'words') {
            // the widest line of the chain: "3 thousands + 4 thousands"
            const top = Math.max(...p.places);
            const wordW = (PLACE_WORD[top] || 'tens').length * WORD_ADV * textPt(ctx) * WORD_EM * PT_MM;
            const expr = 2 * g.chW + 2 * wordW + g.chW + 4 * WORD_GAP;
            const one = blankWidth(1, sizeOf(ctx));
            const eq = g.chW * 1.6 + g.chW + Math.max(g.box.w, one + wordW + WORD_GAP) + 2 * WORD_GAP;
            w = Math.max(expr, eq) + 2;
        }
        else w = numericW(g);
        return { wMm: Math.ceil(w + 6), hMm: null, measure: true, factLike: false, maxCols: w + 6 <= TWO_COL_MM ? 2 : 1, denseRoom: 1.05 };
    },
    inputs(p) {
        return ladderAnswers(p).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full'] }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'value', requiresVisual: true }; },
});
