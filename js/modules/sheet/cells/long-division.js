// js/modules/sheet/cells/long-division.js
// The US long-division bracket (VA-60 .. VA-65), template id `division`.
//
//      [ ][5][5]      <- quotient strip: one box over EVERY dividend track (VA-61, SL-12)
//   13 ) 7  1  5      <- divisor attached to the bracket; 1.5 pt arc + vinculum (VA-60)
//     −  6  5         <- work rows: two per quotient digit (VA-63), "−" pre-printed in the
//     ─────────          gutter of each subtract row, a 0.75 pt rule under each pair
//        6  5
//     −  6  5
//     ─────────
//           0
//
// Digits are Andika at the preset's digit size (TY-1, TY-10) and sit on the SAME tracks in every
// row, so a quotient digit stands exactly over the dividend digit it belongs to. Four work rows
// are always drawn (enough for a two-digit quotient), so the row count never tells the pupil how
// many steps the item takes (RP-1, L-LEAK). The key writes the quotient into its boxes AND the
// finished work into the work rows (AK-1: the key is the page, finished).
//
// Payload: { dividend, divisor, quotient?, remainder?, workRows? }
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, inked, box, esc, HAIR, HEAVY } from './ops-common.js';
import { INK, stripPos } from '../tokens.js';

const DEFAULT_WORK_ROWS = 4;

/** The steps of the standard algorithm: where each quotient digit sits and what is written. */
export function divisionSteps(dividend, divisor) {
    const D = String(dividend);
    const d = Number(divisor);
    const steps = [];
    let rem = 0;
    let started = false;
    for (let j = 0; j < D.length; j++) {
        const partial = rem * 10 + Number(D[j]);
        if (!started && partial < d && j < D.length - 1) { rem = partial; continue; }
        started = true;
        const qd = Math.floor(partial / d);
        const product = qd * d;
        rem = partial - product;
        steps.push({ col: j, digit: qd, product, rem, bring: j < D.length - 1 ? D[j + 1] : null });
    }
    return steps;
}

function keyOf(p) {
    const dividend = Number(p.dividend), divisor = Number(p.divisor);
    const quotient = p.quotient !== undefined ? Number(p.quotient) : Math.floor(dividend / divisor);
    const n = String(dividend).length;
    const q = String(quotient).padStart(n, ' ');
    const slots = {};
    for (let i = 0; i < n; i++) slots[`q-${i}`] = q[i] === ' ' ? '' : q[i];
    return { quotient, slots };
}

/**
 * The finished work: one string per work row, right-aligned to its column (empty = blank row).
 * `shown` is the quotient written in the boxes. The work is always the work THAT quotient
 * produces, so a wrong quotient on an Error analysis page carries the wrong product that gives
 * it away (a product larger than its partial dividend leaves its difference row empty).
 */
function workRows(p, rows, shown = null) {
    const D = String(p.dividend), d = Number(p.divisor);
    const steps = divisionSteps(p.dividend, p.divisor);
    const q = shown === null ? null : String(shown).replace(/\D/g, '').padStart(D.length, ' ');
    const out = [];
    let rem = 0;
    for (const [k, st] of steps.entries()) {
        if (k === 0) rem = Math.floor(Number(D.slice(0, st.col)) || 0);
        const partial = rem * 10 + Number(D[st.col]);
        const digit = q === null ? st.digit : Number(q[st.col] === ' ' ? 0 : q[st.col]);
        const product = digit * d;
        out.push({ text: String(product), col: st.col });
        if (product > partial) { out.push(null); break; }
        rem = partial - product;
        const bring = st.col < D.length - 1 ? D[st.col + 1] : null;
        out.push({ text: bring !== null ? (rem === 0 ? bring : `${rem}${bring}`) : String(rem), col: bring !== null ? st.col + 1 : st.col });
    }
    return out.slice(0, rows);
}

register('division', {
    render(p, ctx) {
        const g = geo(ctx);
        const D = String(p.dividend), V = String(p.divisor);
        const n = D.length, dv = V.length;
        const rows = p.workRows || DEFAULT_WORK_ROWS;
        const trackMm = Math.max(ctx.metrics.trackMm || 0, g.writeMm * 0.8);
        const gutterMm = trackMm * 1.1;
        const k = keyOf(p);
        const ink = inkOf(ctx);
        const vals = slotValues(ctx, k.slots, (w) => {
            const s = String(w).replace(/\D/g, '').padStart(n, ' ');
            const o = {};
            for (let i = 0; i < n; i++) o[`q-${i}`] = s[i] === ' ' ? '' : s[i];
            return o;
        });
        const cols = `grid-template-columns:repeat(${dv}, ${g.em(trackMm)}) ${g.em(gutterMm)} repeat(${n}, ${g.em(trackMm)});`;
        const cell = (content, col, row, extra = '') =>
            `<span style="grid-column:${col};grid-row:${row};display:flex;align-items:center;justify-content:center;${extra}">${content}</span>`;
        let html = '';
        // Row 1: the quotient strip over every dividend track (VA-61, SL-12).
        for (let i = 0; i < n; i++) {
            html += cell(box(g, `q-${i}`, {
                wMm: trackMm, hMm: g.stripMm, value: vals[`q-${i}`] || '', ink, mark: 'cell', seg: stripPos(i, n),
                // A box before the quotient's first digit stays empty on the key: ungraded.
                graded: k.slots[`q-${i}`] !== '',
            }), dv + 2 + i, 1, 'align-items:flex-end;padding-bottom:0.08em;');
        }
        // Row 2: divisor, bracket, dividend. The vinculum is the top border of the dividend row.
        for (let i = 0; i < dv; i++) html += cell(esc(V[i]), i + 1, 2);
        const arc = `<svg viewBox="0 0 10 40" preserveAspectRatio="none" aria-hidden="true" style="display:block;width:100%;height:100%;overflow:visible">`
            + `<path d="M1.5 0 H10 M1.5 0 Q9 20 1.5 40" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}" vector-effect="non-scaling-stroke"/></svg>`;
        html += `<span style="grid-column:${dv + 1};grid-row:2;align-self:stretch;display:block">${arc}</span>`;
        for (let i = 0; i < n; i++) html += cell(esc(D[i]), dv + 2 + i, 2, `border-top:${HEAVY} solid ${INK.ink};`);
        // Work rows (VA-63). The key and a Model cell write the finished work; the pupil page
        // leaves the rows open. The "−" and the rule under each subtract row are structural.
        const shownQ = ctx.state === 'wrong' ? Object.keys(k.slots).map((id) => vals[id] || ' ').join('') : null;
        const work = ink === null ? [] : workRows(p, rows, shownQ);
        const rowH = g.em(Math.max(g.writeMm, 6) + 1);
        for (let r = 0; r < rows; r++) {
            const gridRow = 3 + r;
            const subtract = r % 2 === 0;
            const w = work[r];
            const t = w ? w.text.padStart(w.col + 1, ' ') : '';
            // The "−" is structural (VA-63): printed in the gutter of every subtract row, so it
            // never sits in a digit track and never touches the product's first digit.
            html += cell(subtract ? `<span style="font-weight:700">−</span>` : '', dv + 1, gridRow, `height:${rowH};`);
            for (let i = 0; i < n; i++) {
                const ch = t[i] && t[i] !== ' ' ? t[i] : '';
                html += cell(ch ? inked(ch, ink) : '', dv + 2 + i, gridRow,
                    `height:${rowH};${subtract ? `border-bottom:${HAIR} solid ${INK.ink};` : ''}`);
            }
        }
        const label = `${D} divided by ${V}`;
        return root(g, 'division',
            `<div role="group" aria-label="${esc(label)}" style="display:inline-grid;${cols}grid-template-rows:auto ${g.em(g.pt * 25.4 / 72 * 1.25)};align-items:stretch;margin:0 auto">${html}</div>`,
            'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const k = keyOf(p);
        const slots = {};
        for (const [id, v] of Object.entries(k.slots)) slots[id] = { value: v, graded: v !== '' };
        slots.answer = { value: String(k.quotient), graded: true };
        return { value: k.quotient, display: String(k.quotient), slots };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const n = String(p.dividend).length, dv = String(p.divisor).length;
        const trackMm = Math.max(ctx.metrics.trackMm || 0, g.writeMm * 0.8);
        const rows = p.workRows || DEFAULT_WORK_ROWS;
        return {
            wMm: Math.ceil((n + dv + 1.1) * trackMm + 8),
            hMm: Math.ceil(g.stripMm + g.E * 1.3 + rows * (Math.max(g.writeMm, 6) + 1) + 6),
            measure: true, factLike: false, maxCols: 2, tracks: n + dv + 1,
        };
    },
    inputs(p) {
        const n = String(p.dividend).length;
        return Array.from({ length: n }, (_, i) => ({
            id: `q-${i}`, kind: 'digit', shape: 'box', graded: true, order: i, maxLength: 1,
            inputmode: 'numeric', scopes: ['full', 'answer-only'],
        }));
    },
    layout() { return { card: 'card-division', checker: 'value', requiresVisual: true }; },
});
