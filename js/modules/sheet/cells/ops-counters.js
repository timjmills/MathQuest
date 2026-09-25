// js/modules/sheet/cells/ops-counters.js
// Two templates that print COUNTABLE objects and a sentence of boxes:
//
//   `arrays`     an array of dots, or ringed equal groups, with "[ ] rows of [ ]. [ ] in all."
//                (or "There are [ ] groups of [ ]. [ ] in all.", or "[ ] in all.")
//   `remainder`  loose counters to ring in groups, with "19 ÷ 3 = [ ] R [ ]"
//
// Counters are solid dots (arrays) or open circles (remainder) of at least 4 mm (RP-3: a pupil
// counts them by touching each one), on a fixed pitch, so 40 of them are still countable and
// the size never shrinks with the page's columns (DN-10). The picture never states the answer
// (RP-1): nothing is labelled, counted or ringed for the pupil. Equal groups are dealt in a
// subitisable pattern inside each ring (4 = 2 x 2, 6 = 3 x 2, never 3 + 1). Remainder counters
// are dealt in rows whose length is a whole number of groups, with a row gap of at least 6 mm,
// so each ring can be drawn round one run of a row without crossing another counter (H12).
//
// Every writing place is the same box (SL-11), sized for the section's widest answer; the key
// fills every box (AK-1).
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc, splitList, splitRemainder, HAIR } from './ops-common.js';
import { INK } from '../tokens.js';

/* ------------------------------------------------------------------ shared drawing */

const DOT = { S: 4.5, M: 5, L: 5.5 };          // counter diameter, mm (>= 4 mm)
const PITCH = { S: 7.5, M: 8.5, L: 9.5 };      // centre to centre in a row, mm
/** Dots per line inside a group ring, by group size: subitisable, never n - 1 + 1. */
const PER_LINE = { 1: 1, 2: 2, 3: 3, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 3, 10: 5, 11: 4, 12: 4 };

/** An SVG whose user unit is 1 mm, drawn at `wMm` x `hMm` in em of the digit size. */
const svgMm = (g, wMm, hMm, body, label) =>
    `<svg viewBox="0 0 ${wMm.toFixed(2)} ${hMm.toFixed(2)}" role="img" aria-label="${esc(label)}" `
    + `style="display:block;margin:0 auto;width:${g.em(wMm)};height:${g.screen ? 'auto' : g.em(hMm)};max-width:${g.screen ? '100%' : 'none'};overflow:visible">${body}</svg>`;

const dot = (cx, cy, r, open) => `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" `
    + (open ? `fill="none" stroke="${INK.ink}" stroke-width="0.265"` : `fill="${INK.ink}"`) + '/>';

/** The sentence: literal words and slot boxes, each clause kept on one line. */
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
    return `<div style="margin-top:0.35em;line-height:1.6">${clauses.map((c) => `<span style="display:inline-flex;align-items:center;gap:0.2em;white-space:nowrap;margin:0.1em 0.3em">${c.join('')}</span>`).join('')}</div>`;
}

/* ------------------------------------------------------------------------- arrays */

function arraysPicture(g, p) {
    const d = DOT[g.size], pitch = PITCH[g.size], r = d / 2;
    const rows = Number(p.rows), cols = Number(p.cols);
    let body = '';
    if (p.kind === 'equal_groups') {
        // `rows` rings of `cols` dots each.
        const per = PER_LINE[cols] || Math.ceil(Math.sqrt(cols));
        const lines = Math.ceil(cols / per);
        const pad = 2.2;
        const gw = pad * 2 + (per - 1) * pitch + d, gh = pad * 2 + (lines - 1) * pitch + d;
        const across = Math.min(rows, gw * 5 + 16 <= 150 ? 5 : 4);
        const down = Math.ceil(rows / across), sep = 5;
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
        const words = p.kind === 'equal_groups'
            ? ['There are', { id: 'first' }, 'groups of', { id: 'second' }, '|', { id: 'total' }, 'in all.']
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
        return { wMm: Math.ceil(Math.max(pic.wMm, 80) + 6), hMm: null, measure: true, factLike: false, maxCols: 2 };
    },
    inputs(p) {
        const ids = p.kind === 'count_all' ? ['total'] : ['first', 'second', 'total'];
        return ids.map((id, i) => ({ id, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full'] }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'inline-blanks', requiresVisual: true }; },
});

/* ---------------------------------------------------------------------- remainder */

function remainderCounters(g, p) {
    const d = DOT[g.size], r = d / 2;
    const inRow = d + 2.5;                               // centre pitch inside a row
    const rowGap = 7;                                    // >= 6 mm between rows (H12)
    const dv = Number(p.divisor), n = Number(p.dividend);
    // A row is a whole number of groups (at most 12 counters), so a ring never wraps a row end.
    const perRow = dv * Math.max(1, Math.floor(12 / dv));
    const rows = Math.ceil(n / perRow);
    const W = perRow * inRow + 1, H = rows * (d + rowGap) - rowGap + 2;
    let body = '';
    for (let i = 0; i < n; i++) {
        const c = i % perRow, rr = Math.floor(i / perRow);
        body += dot(0.5 + r + c * inRow, 1 + r + rr * (d + rowGap), r, true);
    }
    return { svg: svgMm(g, W, H, body, `${n} counters`), wMm: W };
}

const remKey = (p) => {
    const q = Math.floor(Number(p.dividend) / Number(p.divisor));
    return { q: String(q), r: String(Number(p.dividend) - q * Number(p.divisor)) };
};

register('remainder', {
    render(p, ctx) {
        const g = geo(ctx);
        const ink = inkOf(ctx);
        const key = remKey(p);
        const vals = slotValues(ctx, key, (w) => splitRemainder(w));
        const pic = remainderCounters(g, p);
        const bw = Math.max(g.writeMm * 2, 0.62 * g.E + 5);
        const slot = (id) => box(g, id, { wMm: bw, hMm: g.stripMm, value: vals[id] || '', ink, mark: g.twin ? 'cell' : null });
        // VA-62: the "R" and its box print in every cell, whatever the remainder.
        const eq = `<div data-mq-join=" R " style="display:inline-flex;align-items:center;gap:0.28em;white-space:nowrap;margin-top:0.4em">`
            + `<span>${esc(p.dividend)}</span><span style="font-weight:700;width:1em;text-align:center">÷</span><span>${esc(p.divisor)}</span>`
            + `<span style="font-weight:700;width:1em;text-align:center">=</span>${slot('q')}<span style="font-weight:700">R</span>${slot('r')}</div>`;
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
        return { wMm: Math.ceil(Math.max(pic.wMm, 70) + 6), hMm: null, measure: true, factLike: false, maxCols: 2 };
    },
    inputs() {
        return [
            { id: 'q', kind: 'number', shape: 'box', graded: true, order: 0, inputmode: 'numeric', scopes: ['full', 'answer-only'] },
            { id: 'r', kind: 'number', shape: 'box', graded: true, order: 1, inputmode: 'numeric', scopes: ['full', 'answer-only'] },
        ];
    },
    layout() { return { card: 'card-medium-visual', checker: 'remainder', requiresVisual: true }; },
});
