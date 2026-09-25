// js/modules/sheet/cells/bond.js
// The `bond` template: a number bond (RP-60), number_bonds.
//
// The whole box above, two part boxes below, joined by 0.75 pt lines. Square-cornered boxes of
// side 14 / 16 / 20 mm (S / M / L); the whole box has a 1.5 pt border, the parts 0.75 pt. The
// unknown is the EMPTY box — solid, never dashed (LS-3) — and it is the item's ONE answer place:
// the key writes the answer into it (AK-1), Error analysis writes the finished-but-wrong number
// into it, and in the screen twin it carries `data-mq-blank="box"`, so the host's input takes its
// place and the pupil types INTO the bond (SL-7). The twin sizes the bond by `--mq-bond`, which
// screen-cell.css already sets per breakpoint.
//
// payload: {whole, a, b, unknown: 'A'|'B'|'whole', orientation?: 'horizontal' (the whole at the side)}
//
// kind 'table' (build lane k2, bonds_in_order; WRM Y1.B2.S6, K.OA.A.3): ALL the bonds of one
// number, in order. The whole n sits in the heavy bond box and its two lines run down to the two
// columns of a table (the bond's parts, listed): 0 | n, 1 | n-1 ... n | 0. `notation: 'across'`
// writes each row as a sentence instead, 0 + n = n (the EE's "record each decomposition as an
// equation"). Blanks are the table's own cells (a heavy outline, hairline rules, XP-D-15), each a
// slot `r<i>a` / `r<i>b` in reading order; `dots` (support level 3) draws beside each row n dots,
// the first part solid and the second hollow, so the pattern is seen as well as read.
// Task 'pattern' prints every row and asks how one column changes (a check-box bank).
//   payload: {kind: 'table', task: 'fill'|'missing'|'pattern', n, rows: [{a, b, hide: null|'b'|'both'}],
//             notation: 'table'|'across', dots: bool, ask?: 'first'|'second', labels?, correct?}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import {
    B, L, P, INK, GREY, SW, n2, root, sizeOf, inkOf, isTwin, slotValue, svg, dot, digitPt, textPt, inlineBoxMm,
    checkedChoice, choiceRow, KEY_FEATURES,
} from './k2kit.js';

const SIDE = { S: 14, M: 16, L: 20 };

/** The table's blanks in reading order: [{id, value}] (row by row, first part then second). */
export function bondTableBlanks(p) {
    const out = [];
    (p.rows || []).forEach((r, i) => {
        if (r.hide === 'both') out.push({ id: `r${i}a`, value: String(r.a) });
        if (r.hide === 'both' || r.hide === 'b') out.push({ id: `r${i}b`, value: String(r.b) });
    });
    return out;
}

/** What a blank shows: nothing on the pupil page, the key's value, or the wrong work (by slot, else by position). */
function blankShown(ctx, id, idx, keyValue) {
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        if (w.slots && w.slots[id] !== undefined) return String(w.slots[id]);
        const parts = String(w.value == null ? '' : w.value).split(/\s*,\s*/).filter((x) => x !== '');
        return parts[idx] !== undefined ? parts[idx] : '';
    }
    return slotValue(ctx, id, keyValue);
}

/** n dots in a line (a gap after five): the first `a` solid, the rest hollow. */
function partDots(ctx, a, n) {
    const d = 3.4, pitch = 4.4, gap = 1.6;
    let body = '';
    for (let k = 0; k < n; k++) {
        const cx = 0.5 + d / 2 + k * pitch + (k >= 5 ? gap : 0), cy = 0.5 + d / 2;
        body += k < a ? dot(cx, cy, d) : `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(d / 2 - SW.hair / 2)}" fill="#fff" stroke="${INK}" stroke-width="${n2(SW.hair)}"/>`;
    }
    const w = 1 + d + (n - 1) * pitch + (n > 5 ? gap : 0);
    return svg(ctx, w, d + 1, body, { label: `${a} and ${n - a}` });
}

function bondTable(p, ctx) {
    const bx = inlineBoxMm(ctx, 2);
    // a table with nothing to write (task 'pattern') is read, not written in: its rows are lower
    const cw = Math.max(14, bx.w + 4), ch = p.task === 'pattern' ? bx.h - 3 : bx.h;
    const rows = p.rows || [];
    const keyBlanks = bondTableBlanks(p);
    const idxOf = Object.fromEntries(keyBlanks.map((b, i) => [b.id, i]));
    const ink = inkOf(ctx);
    const across = p.notation === 'across';
    const dp = digitPt(ctx);
    const cellStyle = (w) => `display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, w)};height:${L(ctx, ch)};`
        + `font-size:${P(ctx, dp)};font-weight:700;line-height:1;${KEY_FEATURES}flex:none;`;
    // one number: printed, or a blank the pupil writes in (the cell IS the writing place)
    const num = (i, part, value, border) => {
        const id = `r${i}${part}`;
        const blank = rows[i].hide === 'both' || (part === 'b' && rows[i].hide === 'b');
        if (!blank) return `<span style="${cellStyle(cw)}${border}color:${INK};">${value}</span>`;
        const shown = blankShown(ctx, id, idxOf[id], value);
        const si = shown !== '' ? ink : null;
        const hook = isTwin(ctx) ? ' data-mq-cell="1"' : '';
        return `<span class="k2-box" data-ws-slot="${id}" data-ws-shape="box"${si ? ` data-ws-ink="${si}"` : ''}${hook} `
            + `style="${cellStyle(cw)}${border}background:#fff;color:${si === 'trace' ? GREY : INK};">${shown}</span>`;
    };
    const dotsOf = (r) => (p.dots ? `<span style="display:inline-flex;align-items:center;margin-left:${L(ctx, 4)};flex:none;">${partDots(ctx, r.a, p.n)}</span>` : '');
    let body;
    if (across) {
        // 0 + 5 = 5: each blank a writing box, the signs and the whole printed
        const boxB = `border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1.25)};`;
        const lines = rows.map((r, i) => {
            const cell = (part, v) => (r.hide === 'both' || (part === 'b' && r.hide === 'b') ? num(i, part, v, boxB) : `<span style="${cellStyle(bx.w)}color:${INK};">${v}</span>`);
            const sym = (t) => `<span style="font-size:${P(ctx, dp)};font-weight:700;line-height:1;width:${L(ctx, 9)};text-align:center;flex:none;">${t}</span>`;
            return `<div style="display:flex;align-items:center;justify-content:flex-start;margin:${L(ctx, 1.5)} 0;">`
                + `${cell('a', r.a)}${sym('+')}${cell('b', r.b)}${sym('=')}<span style="${cellStyle(bx.w)}color:${INK};">${p.n}</span>${dotsOf(r)}</div>`;
        }).join('');
        body = `<div style="display:inline-block;text-align:left;">${lines}</div>`;
    } else {
        // the bond on top: the whole in the heavy box, two lines down to the column heads
        const whole = `<div style="display:flex;justify-content:center;width:${L(ctx, 2 * cw)};">`
            + `<span style="${cellStyle(cw)}border:${B(ctx, 1.5)} solid ${INK};color:${INK};">${p.n}</span></div>`;
        const legs = svg(ctx, 2 * cw, 8, `<path d="M${n2(cw)} 0.4L${n2(cw / 2)} 7.6M${n2(cw)} 0.4L${n2(1.5 * cw)} 7.6" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}" stroke-linecap="round"/>`);
        const hair = `${B(ctx, 0.75)} solid ${INK}`;
        const trs = rows.map((r, i) => {
            const bottom = i < rows.length - 1 ? `border-bottom:${hair};` : '';
            return `<div style="display:flex;align-items:center;">`
                + `<span style="display:inline-flex;border:${B(ctx, 1.5)} solid ${INK};border-top:${i === 0 ? `${B(ctx, 1.5)} solid ${INK}` : '0'};border-bottom:${i === rows.length - 1 ? `${B(ctx, 1.5)} solid ${INK}` : '0'};${bottom ? '' : ''}">`
                + num(i, 'a', r.a, `${bottom}border-right:${hair};`) + num(i, 'b', r.b, bottom) + `</span>${dotsOf(r)}</div>`;
        }).join('');
        body = `<div style="display:inline-block;text-align:left;">${whole}<div style="width:${L(ctx, 2 * cw)};">${legs}</div>${trs}</div>`;
    }
    if (p.task === 'pattern') {
        const labels = p.labels || [];
        const on = checkedChoice(p, ctx, labels);
        const ask = `<div style="font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;line-height:1.2;margin-bottom:${L(ctx, 2)};text-align:left;">`
            + `The ${p.ask === 'first' ? 'first' : 'second'} number:</div>`;
        body = `<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:${L(ctx, 4)} ${L(ctx, 8)};">`
            + `<div style="flex:none;">${body}</div><div style="flex:none;">${ask}${choiceRow(ctx, labels.map((l) => ({ label: l })), { on, vertical: true, labelPt: textPt(ctx) + 2 })}</div></div>`;
    }
    return root(ctx, 'k2-bond-table', body);
}

register('bond', {
    render(p, ctx) {
        if (p.kind === 'table') return bondTable(p, ctx);
        const unit = isTwin(ctx) ? 'var(--mq-bond, 18mm)' : `${SIDE[sizeOf(ctx)] || 20}mm`;
        const at = (k) => `calc(${unit} * ${k})`;
        const answer = p.unknown === 'whole' ? p.whole : p.unknown === 'A' ? p.a : p.b;
        const shown = slotValue(ctx, 'answer', answer);
        const ink = shown !== '' ? inkOf(ctx) : null;
        const boxAt = (col, row, value, heavy, isSlot, xy = null) => {
            const pos = xy ? `position:absolute;left:${at(xy[0])};top:${at(xy[1])};`
                : `position:absolute;left:${at(col * 1.6)};top:${at(row * 1.9)};`;
            const shape = `width:${unit};height:${unit};box-sizing:border-box;border:${B(ctx, heavy ? 1.5 : 0.75)} solid ${INK};`
                + `border-radius:0;background:#fff;display:inline-flex;align-items:center;justify-content:center;`
                + `font-weight:700;font-size:${at(0.52)};line-height:1;`;
            if (!isSlot) return `<span class="k2-bond-box" style="${pos}${shape}color:${INK};">${esc(value)}</span>`;
            const hook = isTwin(ctx) ? ' data-mq-blank="box"' : '';
            return `<span class="k2-bond-box k2-bond-slot" data-ws-slot="answer" data-ws-shape="box"${ink ? ` data-ws-ink="${ink}"` : ''}${hook} `
                + `style="${pos}${shape}color:${ink === 'trace' ? GREY : INK};">${esc(shown)}</span>`;
        };
        // O6 AP1 (2026-09-25): "Whole at the side" (RP-60 lets the orientation change per section):
        // the whole box at the left, halfway down, the two parts stacked at the right, the same
        // boxes, borders and slot. The default (whole above) is drawn exactly as before.
        if (p.orientation === 'horizontal') {
            const hl = (y2) => `<line x1="1" y1="1.45" x2="2.3" y2="${y2}" stroke="${INK}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`;
            const side = `<div class="k2-bond mq-bond" role="img" aria-label="number bond" style="position:relative;display:inline-block;`
                + `width:${at(3.3)};height:${at(2.9)};vertical-align:top;">`
                + `<svg viewBox="0 0 3.3 2.9" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;">${hl(0.5)}${hl(2.4)}</svg>`
                + boxAt(0, 0, p.whole, true, p.unknown === 'whole', [0, 0.95])
                + boxAt(0, 0, p.a, false, p.unknown === 'A', [2.3, 0])
                + boxAt(0, 0, p.b, false, p.unknown === 'B', [2.3, 1.9])
                + `</div>`;
            return root(ctx, 'k2-bond-cell', side);
        }
        const line = (x2) => `<line x1="2.1" y1="1" x2="${x2}" y2="1.9" stroke="${INK}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`;
        const bond = `<div class="k2-bond mq-bond" role="img" aria-label="number bond" style="position:relative;display:inline-block;`
            + `width:${at(4.2)};height:${at(2.9)};vertical-align:top;">`
            + `<svg viewBox="0 0 4.2 2.9" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;">${line(0.5)}${line(3.7)}</svg>`
            + boxAt(1, 0, p.whole, true, p.unknown === 'whole')
            + boxAt(0, 1, p.a, false, p.unknown === 'A')
            + boxAt(2, 1, p.b, false, p.unknown === 'B')
            + `</div>`;
        return root(ctx, 'k2-bond-cell', bond);
    },
    answerKey(p) {
        if (p.kind === 'table') {
            if (p.task === 'pattern') { const v = (p.labels || [])[p.correct || 0]; return { value: v, display: v, slots: { answer: { value: v, graded: true } } }; }
            const bl = bondTableBlanks(p);
            const slots = {};
            bl.forEach((b) => { slots[b.id] = { value: b.value, graded: true }; });
            return { value: bl.map((b) => b.value).join(', '), display: bl.map((b) => b.value).join(', '), slots };
        }
        const v = p.unknown === 'whole' ? p.whole : p.unknown === 'A' ? p.a : p.b;
        return { value: v, display: String(v), slots: { answer: { value: String(v), graded: true } } };
    },
    footprint(p) { return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2 }; },
    inputs(p) {
        if (p && p.kind === 'table') {
            if (p.task === 'pattern') return [{ id: 'answer', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full'] }];
            return bondTableBlanks(p).map((b, i) => ({ id: b.id, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full'] }));
        }
        return [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
    },
    layout() { return { card: 'card-medium-visual', checker: 'value' }; },
});
