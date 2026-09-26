// js/modules/sheet/cells/ops-counters.js
// Two templates that print COUNTABLE objects and a sentence of boxes:
//
//   `arrays`     an array of dots, or ringed equal groups, with "[ ] rows of [ ]. [ ] in all."
//                (or "[ ] groups of [ ]. [ ] in all.", or "[ ] in all."), one clause per line
//   `remainder`  counters in a neutral array to ring, with "19 ÷ 3 = [ ] R [ ]"
//
// Counters are solid dots (arrays) or open circles (remainder) of at least 4 mm (RP-3: a pupil
// counts them by touching each one), on a fixed pitch, so 40 of them are still countable and
// the size never shrinks with the page's columns (DN-10). The picture never states the answer
// (RP-1): nothing is labelled, counted or ringed for the pupil. Equal groups are dealt in a
// subitisable pattern inside each ring (4 = 2 x 2, 6 = 3 x 2, never 3 + 1). Remainder counters
// are laid in rows of five (7.5 / 8 / 9 mm open circles, 5 mm between rows), neutral for the
// groups, so a ring can be drawn round any few of them without crossing another counter (H12).
//
// Every writing place is the same box (SL-11), sized for the section's widest answer; the key
// fills every box (AK-1).
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc, splitList, splitRemainder, HAIR, HEAVY } from './ops-common.js';
import { INK } from '../tokens.js';

/* ------------------------------------------------------------------ shared drawing */

const DOT = { S: 4.5, M: 5, L: 5.5 };          // counter diameter, mm (>= 4 mm)
const PITCH = { S: 7.5, M: 8.5, L: 9.5 };      // centre to centre in a row, mm
// RP-3 / layout VISUAL_MIN 'array-5' (35 / 40 / 45 mm for five dots): the pitch an array or a
// group ring is never drawn below. Between it and PITCH the pitch closes up so the picture
// stays inside the box below, which is what a 2-column cell leaves it (86 mm wide at every
// size; about 38 mm tall at L for 3 rows once the two sentence lines are drawn).
const MIN_PITCH = { S: 7, M: 8, L: 9 };
const PIC_BOX = { S: [84, 40], M: [84, 39], L: [84, 38] };
const RING_SEP = 4;                             // gap between two group rings, mm
const RING_PAD = 2;                             // ring to dot, mm
/** Dots per line inside a group ring, by group size: subitisable, never n - 1 + 1. */
const PER_LINE = { 1: 1, 2: 2, 3: 3, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 3, 10: 5, 11: 4, 12: 4 };

/** An SVG whose user unit is 1 mm, drawn at `wMm` x `hMm` in em of the digit size. */
const svgMm = (g, wMm, hMm, body, label) =>
    `<svg viewBox="0 0 ${wMm.toFixed(2)} ${hMm.toFixed(2)}" role="img" aria-label="${esc(label)}" `
    + `style="display:block;margin:0 auto;width:${g.em(wMm)};height:${g.screen ? 'auto' : g.em(hMm)};max-width:${g.screen ? '100%' : 'none'};overflow:visible">${body}</svg>`;

const dot = (cx, cy, r, open) => `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" `
    + (open ? `fill="none" stroke="${INK.ink}" stroke-width="0.265"` : `fill="${INK.ink}"`) + '/>';

/**
 * The sentence: literal words and slot boxes. Each clause is a line of its own, centred, at
 * every column count - so the drawing is the same in 1 column and in 2 (DN-10: a narrower
 * column never re-flows it), and each line is at most about 66 mm wide at L.
 */
function sentence(g, parts, { vals, ink, twin, textEm }) {
    const bw = Math.max(g.writeMm * 1.8, 2 * 0.62 * g.E + 3);
    const clauses = [];
    let cur = [];
    for (const part of parts) {
        if (part === '|') { clauses.push(cur); cur = []; continue; }
        cur.push(typeof part === 'string'
            ? `<span style="font-size:${textEm.toFixed(3)}em">${esc(part)}</span>`
            : box(g, part.id, { wMm: part.wMm || bw, hMm: g.stripMm, value: vals[part.id] || '', ink, mark: twin ? part.mark || 'cell' : null }));
    }
    if (cur.length) clauses.push(cur);
    return `<div style="margin-top:${g.em(2.5)};display:flex;flex-direction:column;align-items:center;gap:${g.em(1.5)};line-height:1.15">`
        + `${clauses.map((c) => `<span style="display:inline-flex;align-items:center;gap:0.2em;white-space:nowrap">${c.join('')}</span>`).join('')}</div>`;
}

/**
 * The drawing pitch and dot of an arrays picture: PITCH, closed up (never below RP-3's
 * MIN_PITCH) until the picture fits PIC_BOX. For equal groups it also picks how many rings
 * stand in a row: the most that fit the box's width at the largest pitch.
 */
function arrayGeometry(size, p) {
    const rows = Number(p.rows), cols = Number(p.cols);
    const [bw, bh] = PIC_BOX[size] || PIC_BOX.L;
    const top = PITCH[size], min = MIN_PITCH[size], d0 = DOT[size];
    const clamp = (v) => Math.max(min, Math.min(top, v));
    if (p.kind !== 'equal_groups') {
        const pitch = clamp(Math.min(bw / Math.max(1, cols), bh / Math.max(1, rows)));
        return { pitch, d: Math.min(d0, pitch - 2.5) };
    }
    const per = PER_LINE[cols] || Math.ceil(Math.sqrt(cols));
    const lines = Math.ceil(cols / per);
    // Ring size at pitch q: 2 pads + (per - 1) pitches + one dot, likewise down.
    const ring = (q) => { const d = Math.min(d0, q - 2.5); return { gw: RING_PAD * 2 + (per - 1) * q + d, gh: RING_PAD * 2 + (lines - 1) * q + d, d }; };
    let best = null;
    for (let across = Math.min(rows, 5); across >= 1; across--) {
        const down = Math.ceil(rows / across);
        // The largest pitch in [min, top] at which `across` rings fit the box (width first).
        let q = top;
        for (; q > min; q = Math.round((q - 0.1) * 100) / 100) {
            const r = ring(q);
            if (across * r.gw + (across - 1) * RING_SEP + 1 <= bw && down * r.gh + (down - 1) * RING_SEP + 1 <= bh) break;
        }
        const r = ring(q);
        const W = across * r.gw + (across - 1) * RING_SEP + 1, H = down * r.gh + (down - 1) * RING_SEP + 1;
        const over = Math.max(0, W - bw) * 10 + Math.max(0, H - bh);   // width overflow is worse
        const cand = { across, pitch: q, d: r.d, over };
        if (!best || over < best.over || (over === best.over && q > best.pitch)) best = cand;
    }
    return best;
}

/* ------------------------------------------------------------------------- arrays */

function arraysPicture(g, p) {
    const geom = arrayGeometry(g.size, p);
    const d = geom.d, pitch = geom.pitch, r = d / 2;
    const rows = Number(p.rows), cols = Number(p.cols);
    let body = '';
    if (p.kind === 'equal_groups') {
        // `rows` rings of `cols` dots each, as many rings to a row as the 2-column box allows.
        const per = PER_LINE[cols] || Math.ceil(Math.sqrt(cols));
        const lines = Math.ceil(cols / per);
        const pad = RING_PAD;
        const gw = pad * 2 + (per - 1) * pitch + d, gh = pad * 2 + (lines - 1) * pitch + d;
        const across = geom.across;
        const down = Math.ceil(rows / across), sep = RING_SEP;
        const W = across * gw + (across - 1) * sep + 1, H = down * gh + (down - 1) * sep + 1;
        for (let k = 0; k < rows; k++) {
            const ox = 0.5 + (k % across) * (gw + sep), oy = 0.5 + Math.floor(k / across) * (gh + sep);
            body += `<rect x="${ox.toFixed(2)}" y="${oy.toFixed(2)}" width="${gw.toFixed(2)}" height="${gh.toFixed(2)}" rx="${(Math.min(gw, gh) / 2).toFixed(2)}" fill="none" stroke="${INK.ink}" stroke-width="0.53"/>`;
            for (let i = 0; i < cols; i++) {
                const line = Math.floor(i / per), inLine = i % per;
                // A short last line is centred under the full ones (5 = 3 over 2).
                const lineCount = line === lines - 1 ? cols - per * (lines - 1) : per;
                const off = ((per - lineCount) * pitch) / 2;
                body += dot(ox + pad + r + off + inLine * pitch, oy + pad + r + line * pitch, r, false);
            }
        }
        return { svg: svgMm(g, W, H, body, `${rows} groups`), wMm: W };
    }
    const W = cols * pitch, H = rows * pitch;
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) body += dot(pitch / 2 + j * pitch, pitch / 2 + i * pitch, r, false);
    return { svg: svgMm(g, W, H, body, 'array of dots'), wMm: W };
}

function arraysKey(p) {
    const rows = Number(p.rows), cols = Number(p.cols);
    return p.kind === 'count_all' ? { total: String(rows * cols) } : { first: String(rows), second: String(cols), total: String(rows * cols) };
}

register('arrays', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const key = arraysKey(p);
        const vals = slotValues(ctx, key, (w) => {
            const l = splitList(w);
            if (p.kind === 'count_all' || l.length === 1) return { total: l[l.length - 1] };
            return { first: l[0], second: l[1], total: l[2] };
        });
        const pic = arraysPicture(g, p);
        // "[ ] groups of [ ]." mirrors "[ ] rows of [ ]." ("There are" made the line 97 mm at L,
        // wider than a 2-column cell).
        const words = p.kind === 'equal_groups'
            ? [{ id: 'first' }, 'groups of', { id: 'second' }, '|', { id: 'total' }, 'in all.']
            : p.kind === 'write_mult'
                ? [{ id: 'first' }, 'rows of', { id: 'second' }, '|', { id: 'total' }, 'in all.']
                : [{ id: 'total', mark: 'blank' }, 'in all.'];
        // On screen the rows-of / groups-of sentence is the host's own inline-blank prompt, so
        // the twin draws the picture alone; the count-all box is the one answer (SL-7).
        const showSentence = !g.twin || p.kind === 'count_all';
        const sent = showSentence ? sentence(g, words, { vals, ink, twin: g.twin, textEm: g.textEm * 1.1 }) : '';
        return root(g, 'arrays', `${pic.svg}${sent}`, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const k = arraysKey(p);
        const slots = {};
        for (const [id, v] of Object.entries(k)) slots[id] = { value: v, graded: true };
        return { value: Number(k.total), display: p.kind === 'count_all' ? k.total : `${k.first}, ${k.second}, ${k.total}`, slots };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const pic = arraysPicture(g, p);
        // The picture or the widest sentence line (about 66 mm at L), plus the pads.
        return { wMm: Math.ceil(Math.max(pic.wMm, 66) + 6), hMm: null, measure: true, factLike: false, maxCols: 2 };
    },
    inputs(p) {
        const ids = p.kind === 'count_all' ? ['total'] : ['first', 'second', 'total'];
        return ids.map((id, i) => ({ id, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full'] }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'inline-blanks', requiresVisual: true }; },
});

/* ---------------------------------------------------------------------- remainder */

/*
 * The remainder counters (owner backlog 2026-09-26, critic EA r5: "4.7 mm circles in rows of 10",
 * "a 32 % band under a one-row picture"). Open counters of 6.5 / 7 / 9 mm (S / M / L) in ROWS OF
 * FIVE - the five-structure a pupil already counts by - with 2.5-3 mm between two counters and
 * 4-5 mm between rows, so a ring can be drawn round any few of them (RUBRIC H12). Rows of five are
 * neutral for every group size but 5, so the picture does not draw the quotient or the remainder
 * (R3: runs of the divisor did). The picture is as tall as its own rows, but never shorter than
 * three: with at most five rows (25 counters, the generator's cap) every cell of a page is within
 * 1.5 x of the tallest, one even grid holds them all, and no cell leaves a band of a third.
 */
const REM_GEO = { S: { d: 6.5, gap: 2.5, rowGap: 4 }, M: { d: 7, gap: 2.5, rowGap: 4 }, L: { d: 9, gap: 3, rowGap: 5 } };
const REM_PER_ROW = 5;
const REM_MIN_ROWS = 3;
function remainderGeometry(size, n) {
    const { d, gap, rowGap } = REM_GEO[size] || REM_GEO.L;
    const pad = 0.5;
    const cols = Math.max(1, Math.min(REM_PER_ROW, n));
    const rows = Math.max(1, Math.ceil(n / REM_PER_ROW));
    // The picture keeps room for three rows (REM_MIN_ROWS): the generator deals 5 to 25 counters
    // (one to five rows), so every cell of a page is within 1.5 x of the tallest and the page keeps
    // one even grid; the spare row of a short picture is under a third of its cell (H13).
    const hRows = Math.max(rows, REM_MIN_ROWS);
    return { d, gap, rowGap, pad, cols, rows, w: 2 * pad + (cols - 1) * (d + gap) + d, h: 2 * pad + (hRows - 1) * (d + rowGap) + d };
}

function remainderCounters(g, p) {
    const n = Math.max(0, Math.floor(Number(p.dividend)) || 0);
    const G = remainderGeometry(g.size, n);
    const r = G.d / 2;
    let body = '';
    for (let i = 0; i < n; i++) {
        body += dot(G.pad + r + (i % REM_PER_ROW) * (G.d + G.gap), G.pad + r + Math.floor(i / REM_PER_ROW) * (G.d + G.rowGap), r, true);
    }
    return { svg: svgMm(g, G.w, G.h, body, `${n} counters`), wMm: G.w };
}

const remKey = (p) => {
    const q = Math.floor(Number(p.dividend) / Number(p.divisor));
    return { q: String(q), r: String(Number(p.dividend) - q * Number(p.divisor)) };
};

/* ---------------------------------------------------------------------- add three */

/**
 * add_three (2026-09-25, AP4): three groups of solid counters, "+" between them, then the sentence
 * `a + b + c = [ ]` (1.OA.2). Each group stands in COLUMNS OF FIVE (a group of 7 is a full column
 * of five and two beside it), so every group is read by its five-structure and the three groups sit
 * side by side in a 2-column cell. The picture always reserves five rows, so every cell of a page
 * is one height. `pictures: false` draws the sentence alone (the Pictures option's fade).
 * Payload: { a, b, c, pictures? }
 */
function threeGroups(g, p) {
    const d = DOT[g.size], pitch = PITCH[g.size] - 1, r = d / 2;
    const H = 4 * pitch + d + 1;
    const group = (n) => {
        const cols = Math.max(1, Math.ceil(n / 5));
        const W = (cols - 1) * pitch + d + 1;
        let body = '';
        for (let i = 0; i < n; i++) body += dot(0.5 + r + Math.floor(i / 5) * pitch, 0.5 + r + (i % 5) * pitch, r, false);
        return { svg: svgMm(g, W, H, body, `${n} counters`), W };
    };
    const gs = [p.a, p.b, p.c].map((n) => group(Number(n)));
    const plus = `<span style="font-weight:700;width:1em;text-align:center;flex:none">+</span>`;
    const W = gs.reduce((t, x) => t + x.W, 0) + 2 * g.E + 4 * 3;
    return {
        html: `<div style="display:flex;align-items:center;justify-content:center;gap:${g.em(3)};white-space:nowrap">`
            + gs.map((x) => `<div style="flex:none">${x.svg}</div>`).join(plus) + `</div>`,
        W,
    };
}

register('add-three', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const sum = String(Number(p.a) + Number(p.b) + Number(p.c));
        const vals = slotValues(ctx, { answer: sum });
        const slot = box(g, 'answer', { wMm: 2 * 0.62 * g.E + 5, hMm: g.stripMm, value: vals.answer || '', ink, mark: g.twin ? 'blank' : null });
        const o = (t) => `<span style="font-weight:700;width:1em;text-align:center">${t}</span>`;
        const eq = `<div class="ws-eq" style="display:inline-flex;align-items:center;gap:0.2em;white-space:nowrap;margin-top:${p.pictures === false ? 0 : g.em(4)}">`
            + `<span>${esc(p.a)}</span>${o('+')}<span>${esc(p.b)}</span>${o('+')}<span>${esc(p.c)}</span>${o('=')}${slot}</div>`;
        const pic = p.pictures === false ? '' : threeGroups(g, p).html;
        return root(g, 'add-three', `${pic}${eq}`, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const v = Number(p.a) + Number(p.b) + Number(p.c);
        return { value: v, display: String(v), slots: { answer: { value: String(v), graded: true } } };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        // the sentence "8 + 5 + 3 = [ ]": five glyphs, three operators, the box
        const eqW = (5 * 0.6 + 3 * 1.2 + 1.6) * g.E + (2 * 0.62 * g.E + 5);
        const picW = p.pictures === false ? 0 : threeGroups(g, p).W;
        return { wMm: Math.ceil(Math.max(eqW, picW) + 6), hMm: null, measure: true, factLike: false, maxCols: 2 };
    },
    inputs() {
        return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] }];
    },
    layout() { return { card: 'card-medium-visual', checker: 'value', requiresVisual: true }; },
});

/**
 * O6 (AP4): the same answer written in the long-division bracket (`notation: 'bracket'`):
 *
 *       [ q ] R [ r ]
 *     5 ) 23
 *
 * the quotient box over the dividend, "R [ ]" beside it on the quotient's row, the divisor
 * against the bracket's arc and the vinculum over the dividend (the arc and rule of the
 * `division` template, VA-60). The two boxes keep their ids and their order, so the key, the
 * screen inputs (q then r, joined " R ") and the checker are unchanged.
 */
function remainderBracket(p, slot) {
    const arc = `<svg viewBox="0 0 10 40" preserveAspectRatio="none" aria-hidden="true" style="display:block;width:100%;height:100%;overflow:visible">`
        + `<path d="M1.5 0 H10 M1.5 0 Q9 20 1.5 40" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}" vector-effect="non-scaling-stroke"/></svg>`;
    const at = (c, r, inner, extra = '') => `<span style="grid-column:${c};grid-row:${r};display:flex;align-items:center;justify-content:center;${extra}">${inner}</span>`;
    return `<div data-mq-join=" R " role="group" aria-label="${esc(p.dividend)} divided by ${esc(p.divisor)}" `
        + `style="display:inline-grid;grid-template-columns:auto 0.55em auto auto auto;grid-template-rows:auto 1.3em;column-gap:0.15em;row-gap:0.15em;white-space:nowrap;margin-top:0.4em">`
        + at(3, 1, slot('q'), 'align-items:flex-end;')
        + at(4, 1, '<span style="font-weight:700">R</span>', 'align-items:flex-end;')
        + at(5, 1, slot('r'), 'align-items:flex-end;')
        + at(1, 2, esc(p.divisor), 'padding-right:0.1em;')
        + `<span style="grid-column:2;grid-row:2;align-self:stretch;display:block">${arc}</span>`
        + at(3, 2, esc(p.dividend), `border-top:${HEAVY} solid ${INK.ink};padding:0 0.15em;`)
        + `</div>`;
}

register('remainder', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const key = remKey(p);
        const vals = slotValues(ctx, key, (w) => splitRemainder(w));
        const pic = remainderCounters(g, p);
        // R3: one-digit answers take the 14 mm writing box (RUBRIC H9), not two writing widths,
        // so "23 ÷ 4 = [ ] R [ ]" is one line inside a 2-column cell (it was ~100 mm, one column).
        const bw = Math.max(14, 0.62 * g.E + 5);
        const slot = (id) => box(g, id, { wMm: bw, hMm: g.stripMm, value: vals[id] || '', ink, mark: g.twin ? 'cell' : null });
        // VA-62: the "R" and its box print in every cell, whatever the remainder.
        const eq = p.notation === 'bracket' ? remainderBracket(p, slot)
            // 0.8 em operators and 0.15 em gaps keep the line inside a 3-column cell at S (L1).
            : `<div data-mq-join=" R " style="display:inline-flex;align-items:center;gap:0.15em;white-space:nowrap;margin-top:0.4em">`
            + `<span>${esc(p.dividend)}</span><span style="font-weight:700;width:0.8em;text-align:center">÷</span><span>${esc(p.divisor)}</span>`
            + `<span style="font-weight:700;width:0.8em;text-align:center">=</span>${slot('q')}<span style="font-weight:700">R</span>${slot('r')}</div>`;
        return root(g, 'remainder', `${pic.svg}${eq}`, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const k = remKey(p);
        return {
            value: `${k.q} R ${k.r}`, display: `${k.q} R ${k.r}`,
            slots: { q: { value: k.q, graded: true }, r: { value: k.r, graded: true } },
        };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const pic = remainderCounters(g, p);
        // the sentence: the numbers, two operators, "R", two 14 mm boxes and six gaps
        const digits = String(p.dividend).length + String(p.divisor).length;
        const eqW = (digits * 0.62 + 2 * 0.8 + 0.7 + 6 * 0.15) * g.E + 2 * Math.max(14, 0.62 * g.E + 5);
        // denseRoom 1.05: the measured height already holds the letter, the pads and the answer boxes,
        // so a page of pictures packs a third column at S (L1) with its cells sized to them.
        return { wMm: Math.ceil(Math.max(pic.wMm, eqW) + 6), hMm: null, measure: true, factLike: false, maxCols: 3, denseRoom: 1.05 };
    },
    inputs() {
        return [
            { id: 'q', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] },
            { id: 'r', kind: 'number', shape: 'box', graded: true, order: 1, inputmode: 'numeric', scopes: ['full', 'answer-only'] },
        ];
    },
    layout() { return { card: 'card-medium-visual', checker: 'remainder', requiresVisual: true }; },
});
