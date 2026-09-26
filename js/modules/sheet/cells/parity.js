// js/modules/sheet/cells/parity.js
// The `parity` template (odd and even, 2.OA.C.3): composing:odd_even and composing:select_even_odd,
// moved off their legacy colour cells (2026-09-26: the kit lint found translucent white borders,
// the answer pages out of step with the pupil pages, and cells a third empty).
//
//   pairs  "Is 7 odd or even?": the number, and under it the number drawn as dots in PAIRS - two
//          rows, one pair to a column, the odd one out alone at the end of the top row. The pupil
//          checks Odd or Even (two check boxes under the words). `rings` (the fading hint) rings
//          each pair; `dots: false` is the number alone (the abstract step).
//   which  "Which is even?": three numbers, a check box under each; the question over them names
//          the parity asked for (a page may ask both).
//   sort   "Circle the even numbers. Cross out the odd numbers.": a row of numbers. The key rings
//          every even number and crosses every odd one (the pupil's marks are the answer).
//
// Nothing prints the answer (RP-1): the dots are the number itself, never a verdict ("one has no
// partner" was the old cell's caption, which answered the question).
//
// payload: {task: 'pairs'|'which'|'sort', n?, dots?, rings?, nums?, target?: 'even'|'odd', correct?}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import {
    L, P, D, B, INK, GREY, n2, svg, root, textPt, digitPt, isTwin, pscale, checkedChoice, choiceRow, inkOf,
    k2StepCtx, workInk, ringWrap, sizeOf,
} from './k2kit.js';

const WORDS = ['Odd', 'Even'];

/**
 * The dots of n in pairs: one pair to a column (two rows), five pairs to a block, blocks of ten
 * stacked like ten frames (11-20 is a full block and the rest under it), the leftover dot alone
 * at the end of the top row of the last block.
 */
function pairsPicture(ctx, n, { rings = false } = {}) {
    const k = pscale(ctx);
    const d = 4.6 * k, pitch = 7 * k, rowGap = 5.3 * k, pad = 1.2 * k, blockGap = 4.2 * k;   // pairs read down: columns further apart than the rows
    const blockH = rowGap + d;
    const blocks = Math.max(1, Math.ceil(n / 10));
    const cols = Math.min(5, Math.ceil(n / 2));
    const w = cols * pitch + 2 * pad, h = blocks * blockH + (blocks - 1) * blockGap + 2 * pad;
    const at = (i) => {
        const b = Math.floor(i / 10), j = i % 10;
        return { x: pad + (Math.floor(j / 2) + 0.5) * pitch, y: pad + b * (blockH + blockGap) + d / 2 + (j % 2) * rowGap, col: Math.floor(j / 2), b };
    };
    let body = '';
    for (let i = 0; i < n; i++) {
        const c = at(i);
        body += `<circle cx="${n2(c.x)}" cy="${n2(c.y)}" r="${n2(d / 2)}" fill="${INK}"/>`;
    }
    if (rings) {
        // the hint: each PAIR in its own ring (a leftover dot gets none - that is what odd means)
        for (let pIdx = 0; pIdx < Math.floor(n / 2); pIdx++) {
            const c = at(pIdx * 2);
            body += `<rect x="${n2(pad + c.col * pitch + 0.35 * k)}" y="${n2(c.y - d / 2 - 0.9 * k)}" width="${n2(pitch - 0.7 * k)}" height="${n2(rowGap + d + 1.8 * k)}" `
                + `rx="${n2((pitch - 0.7 * k) / 2)}" fill="none" stroke="${INK}" stroke-width="0.35"/>`;
        }
    }
    return svg(ctx, w, h, body, { label: `${n} dots in pairs` });
}

/** A number printed at the working digit size (TY-10), bold, in lining figures. */
function numeral(ctx, v, pt = null) {
    return `<span style="display:inline-block;font-size:${D(ctx, pt || digitPt(ctx))};font-weight:700;line-height:1;">${esc(v)}</span>`;
}

/** The question over a `which` row ("Which is even?"), at the label size. */
function question(ctx, target) {
    return `<div style="font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;line-height:1.2;margin-bottom:${L(ctx, 3)};">Which is ${esc(target)}?</div>`;
}

/** A cross drawn over a printed number (the key's mark for an odd number in a sort). */
function crossOver(ctx, html, ink) {
    const grey = ink === 'trace';
    return `<span data-ws-ink="${grey ? 'trace' : 'solid'}" style="position:relative;display:inline-block;">${html}`
        + `<svg aria-hidden="true" viewBox="0 0 10 10" preserveAspectRatio="none" style="position:absolute;left:-12%;top:-8%;width:124%;height:116%;overflow:visible;">`
        + `<path d="M1 1L9 9M9 1L1 9" fill="none" stroke="${grey ? GREY : INK}" stroke-width="${isTwin(ctx) ? 1.2 : 0.9}" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:${B(ctx, 1.5)}"/></svg></span>`;
}

/** A sort's numbers in rows: up to four in one row, five or six in two (the longer row first). */
function sortRows(nums) {
    if (nums.length <= 4) return [nums];
    const h = Math.ceil(nums.length / 2);
    return [nums.slice(0, h), nums.slice(h)];
}

/** The marks a sort shows: none on the pupil page; the key's (every even ringed, every odd crossed). */
function sortInk(ctx) {
    if (ctx.state === 'blank') return null;
    return inkOf(ctx) || workInk(ctx, 'sort') || null;
}

register('parity', {
    render(p, ctx) {
        const k = pscale(ctx);
        const task = p.task || 'pairs';
        if (task === 'sort') {
            const ink = sortInk(ctx);
            const one = (v) => {
                const html = numeral(ctx, v);
                if (!ink) return `<span style="flex:none;padding:${L(ctx, 1.5)} ${L(ctx, 1)};">${html}</span>`;
                const even = Number(v) % 2 === 0;
                return `<span style="flex:none;padding:${L(ctx, 1.5)} ${L(ctx, 1)};">${even ? ringWrap(ctx, html, ink) : crossOver(ctx, html, ink)}</span>`;
            };
            // five or six numbers in two rows (3 + 2, 3 + 3): the cell stays a column of a 2- or
            // 3-column page instead of a full-width row of five numbers
            const rows = sortRows(p.nums || []).map((r) => `<div data-mq-nowrap="1" style="display:flex;justify-content:center;align-items:center;flex-wrap:nowrap;gap:${L(ctx, 6 * k)};">${r.map(one).join('')}</div>`);
            // `caption`: the task in the cell's own words, for a page that mixes it with other kinds
            // of item (odd_even); a page of sorts alone says it once in the instruction (BD-10)
            const cap = p.caption ? `<div style="font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;line-height:1.2;margin-bottom:${L(ctx, 3)};">Circle even. Cross out odd.</div>` : '';
            return root(ctx, 'k2-parity', `${cap}<div data-ws-slot="answer" data-ws-shape="draw"${ink === 'solid' ? ' data-ws-ink="solid"' : ''} `
                + `style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3 * k)};">${rows.join('')}</div>`);
        }
        if (task === 'which') {
            const labels = (p.nums || []).map(String);
            const on = checkedChoice(p, ctx, labels);
            const row = choiceRow(ctx, labels.map((label) => ({ label })), {
                on, gapMm: 9 * k, labelPt: digitPt(ctx), ring: { index: p.correct || 0, ink: workInk(ctx, 'ring') },
            });
            return root(ctx, 'k2-parity', `${question(ctx, p.target || 'even')}<div style="display:inline-block;">${row}</div>`);
        }
        // pairs
        const on = checkedChoice(p, ctx, WORDS);
        const pic = p.dots === false ? '' : `<div style="display:flex;justify-content:center;margin-top:${L(ctx, 3)};">${pairsPicture(ctx, Number(p.n) || 0, { rings: !!p.rings || !!workInk(ctx, 'pairs') })}</div>`;
        const row = choiceRow(ctx, WORDS.map((label) => ({ label })), {
            on, gapMm: 10 * k, labelPt: textPt(ctx) + 4, ring: { index: p.correct || 0, ink: workInk(ctx, 'ring') },
        });
        return root(ctx, 'k2-parity', `<div>${numeral(ctx, p.n)}</div>${pic}<div style="display:inline-block;margin-top:${L(ctx, 4)};">${row}</div>`);
    },
    answerKey(p) {
        if (p.task === 'sort') {
            const nums = (p.nums || []).map(Number);
            const ev = nums.filter((v) => v % 2 === 0), od = nums.filter((v) => v % 2 !== 0);
            const v = `Circle: ${ev.join(', ') || '(none)'}; Cross out: ${od.join(', ') || '(none)'}`;
            return { value: v, display: v, slots: { answer: { value: v, graded: true } } };
        }
        const labels = p.task === 'which' ? (p.nums || []).map(String) : WORDS;
        const v = labels[p.correct || 0];
        return { value: v, display: v, slots: { answer: { value: v, graded: true } } };
    },
    footprint(p, ctx) {
        const k = ctx ? pscale(ctx) : 1;
        const small = sizeOf(ctx || {}) === 'S';
        let w;
        if (p.task === 'sort') {
            w = Math.max(...sortRows(p.nums || []).map((r) => r.reduce((a, v) => a + String(v).length * 6.2 * k + 7 * k, 0)), 20);
        } else if (p.task === 'which') {
            w = (p.nums || []).reduce((a, v) => a + Math.max(9, String(v).length * 6.2) * k, 0) + 2 * 9 * k;
        } else {
            w = Math.max(Math.min(5, Math.ceil((Number(p.n) || 0) / 2)) * 7 * k + 3, 44 * k);
        }
        w += 6;
        const third = small ? 55 : 61;
        return { wMm: Math.min(186, Math.ceil(w)), hMm: null, measure: true, factLike: false, maxCols: w <= third ? 3 : w <= 93 ? 2 : 1 };
    },
    inputs(p) {
        if (p && p.task === 'sort') return [{ id: 'answer', kind: 'choice', shape: 'draw', graded: true, order: 0, scopes: ['full'] }];
        return [{ id: 'answer', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full'] }];
    },
    layout() { return { card: 'card-wide-visual', checker: 'choice' }; },
    modelStates: true,
    stepState(p, steps, k, ctx) { return this.render(p, k2StepCtx(steps, k, ctx)); },
});

export const PARITY_TEMPLATE = 'parity';
