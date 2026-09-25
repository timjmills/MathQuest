// js/modules/sheet/cells/sort-rings.js
// The `sort-rings` template (build lane k2, 2026-09-25; design/BUILD_LIST.md "New templates"):
// sorting into two or three labelled rings (hoops), or into the boxes of a two- or three-box table
// (payload.model 'grid', the Carroll-style boxes side by side).
//
//   the tiles   a row of line-drawn pictures (k2kit SHAPES), each tagged with a letter A, B, C ...
//               (task 'count'), or drawn already sorted INSIDE the rings (tasks 'rule', 'most',
//               'order', where the sort is given and the pupil reasons about it)
//   the rings   one outline per group, its RULE printed at the top inside it: a specimen picture
//               (sort by kind or shape), or a word with a small picture (Big / Small, Heavy / Light).
//               The inside is the pupil's working room: the letters of the tiles are written there
//               (the working is never graded; the key writes them in, a traced Model in grey).
//   the answer  count: a number box under each ring (how many), read left to right "3, 4";
//               most:  a check box under each ring (the one with the most);
//               order: a number box under each ring (1 = the fewest);
//               rule:  a word bank to the right (By kind / By size / By shape / By weight).
//
// Nothing prints the answer (RP-1): no count label, and the rule of a 'rule' item is not printed
// (its rings carry no labels). The screen twin needs no widget: several boxes carry data-mq-cell,
// the check boxes are wireTickBoxes rows (k2kit choiceRow).
//
// payload: {task, model, tiles: [{shape, s}], groups: [{label, pic?: {shape, s}, icon?, members: [tileIndex]}],
//           counts, correct?, order?, words?, work: bool (the first tile placed, level 3)}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import {
    L, P, B, INK, GREY, SW, n2, svg, root, box, shapeOf, textPt, digitPt, inlineBoxMm, isTwin, pscale,
    checkedChoice, choiceRow, LETTERS, shownParts, inkOf, KEY_FEATURES,
} from './k2kit.js';

/** One picture of `d` mm, centred in a square svg. */
function pic(ctx, spec, d) {
    const s = spec && spec.s ? spec.s : 1;
    return svg(ctx, d + 1, d + 1, shapeOf(spec && spec.shape).draw((d + 1) / 2, (d + 1) - (d * s) / 2 - 0.5, d * s), { label: 'a picture' });
}

/** The tile row: pictures with their letter under each. */
function tileRow(ctx, tiles, d) {
    return `<div style="display:flex;justify-content:center;align-items:flex-end;gap:${L(ctx, 4)};flex-wrap:wrap;">`
        + tiles.map((t, i) => `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1)};">${pic(ctx, t, d)}`
            + `<span style="font-size:${P(ctx, textPt(ctx))};font-weight:700;line-height:1;">${LETTERS[i]}</span></div>`).join('') + '</div>';
}

/** What the pupil wrote in a ring (the working): the letters of its members, in the key's ink. */
function workLetters(ctx, members, show) {
    if (!show || !members.length) return '';
    const grey = show === 'trace';
    return `<div data-ws-part="work" style="font-size:${P(ctx, textPt(ctx) + 2)};font-weight:700;line-height:1.3;letter-spacing:.12em;`
        + `color:${grey ? GREY : INK};${KEY_FEATURES}">${members.map((i) => LETTERS[i]).join(' ')}</div>`;
}

register('sort-rings', {
    render(p, ctx) {
        const k = pscale(ctx);
        const groups = p.groups || [];
        const n = groups.length;
        const grid = p.model === 'grid';
        const w = (n === 3 ? 40 : 52) * k, h = (p.task === 'count' ? 30 : 38) * k;
        const d = 11 * k;
        const inside = p.task !== 'count';
        const task = p.task || 'count';
        const counts = (p.counts || groups.map((g) => g.members.length)).map(String);
        const shownCounts = task === 'count' || task === 'order' ? shownParts(ctx, task === 'order' ? (p.order || []).map(String) : counts) : [];
        const bx = inlineBoxMm(ctx, 1);
        const rings = groups.map((g, gi) => {
            const label = p.labels === false || task === 'rule' ? ''
                : `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 1.5)};font-size:${P(ctx, textPt(ctx) + 1)};font-weight:700;line-height:1.1;">`
                    + `${g.pic ? pic(ctx, g.pic, 8 * k) : ''}${g.word ? `<span>${esc(g.word)}</span>` : ''}</div>`;
            const members = inside ? `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:${L(ctx, 1.5)};max-width:${L(ctx, w - 10)};">`
                + g.members.map((ti) => pic(ctx, p.tiles[ti], 11 * k)).join('') + '</div>' : '';
            // the letters written in the ring (the working): all of them on the key (solid) and in a
            // traced Model (grey); at support level 3 the first tile placed (grey); never graded
            let letters = '';
            if (task === 'count') {
                if (ctx.state === 'answered') letters = workLetters(ctx, g.members, 'solid');
                else if (ctx.state === 'traced') letters = workLetters(ctx, g.members, 'trace');
                else if (p.work && ctx.state === 'blank' && g.members.includes(0)) letters = workLetters(ctx, [0], 'trace');
            }
            const shape = grid ? `border-radius:${L(ctx, 1.5)};` : 'border-radius:50%;';
            return `<div class="k2-ring" style="box-sizing:border-box;width:${L(ctx, w)};height:${L(ctx, h)};border:${B(ctx, 1.5)} solid ${INK};${shape}`
                + `display:flex;flex-direction:column;align-items:center;justify-content:${inside ? 'center' : 'flex-start'};gap:${L(ctx, 1.5)};padding:${L(ctx, grid ? 2 : 4)} ${L(ctx, 4)};background:#fff;">`
                + `${label}${members}${letters}</div>`;
        });
        let under = '';
        if (task === 'count' || task === 'order') {
            // each ring's box stands at its right, at the ring's middle: the page keeps three items
            const ink = inkOf(ctx);
            const pairs = rings.map((r, gi) => `<div style="display:flex;align-items:center;gap:${L(ctx, 2.5)};">${r}`
                + box(ctx, { id: `b${gi}`, value: shownCounts[gi], w: bx.w + 2, h: bx.h + 2, mark: 'cell' }) + '</div>').join('');
            const row = `<div data-ws-slot="answer" data-ws-shape="box"${ink === 'solid' && shownCounts.some(Boolean) ? ' data-ws-ink="solid"' : ''} `
                + `style="display:flex;justify-content:center;gap:${L(ctx, (grid ? 3 : 6) * k)};">${pairs}</div>`;
            const tiles = task === 'count' ? `<div style="margin-bottom:${L(ctx, 3)};">${tileRow(ctx, p.tiles || [], d)}</div>` : '';
            return root(ctx, 'k2-sort', `${tiles}${row}`);
        } else if (task === 'most') {
            const labels = groups.map((_, gi) => LETTERS[gi]);
            const on = checkedChoice(p, ctx, labels);
            // one check box under each ring: a spacer the ring's width keeps each box under its ring
            under = `<div style="margin-top:${L(ctx, 2)};">${choiceRow(ctx, labels.map((l) => ({ label: l, pic: `<span style="display:block;width:${L(ctx, w)};"></span>` })), { on, gapMm: grid ? 0 : 5 * k })}</div>`;
        }
        const ringRow = `<div style="display:flex;justify-content:center;gap:${L(ctx, grid ? 0 : 5 * k)};">${rings.join('')}</div>`;
        const main = `<div style="display:inline-block;">${ringRow}${under}</div>`;
        if (task === 'rule') {
            const labels = (p.words || []).map((x) => x.label);
            const on = checkedChoice(p, ctx, labels);
            return root(ctx, 'k2-sort', `<div style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 7)};">${main}`
                + `${choiceRow(ctx, labels.map((l) => ({ label: l })), { on, vertical: true, labelPt: textPt(ctx) + 2 })}</div>`);
        }
        const tiles = task === 'count' ? `<div style="margin-bottom:${L(ctx, 4)};">${tileRow(ctx, p.tiles || [], d)}</div>` : '';
        return root(ctx, 'k2-sort', `${tiles}${main}`);
    },
    answerKey(p) {
        const task = p.task || 'count';
        if (task === 'count' || task === 'order') {
            const vals = task === 'order' ? (p.order || []).map(String) : (p.counts || (p.groups || []).map((g) => g.members.length)).map(String);
            const slots = {};
            vals.forEach((v, i) => { slots[`b${i}`] = { value: v, graded: true }; });
            return { value: vals.join(', '), display: vals.join(', '), slots };
        }
        const labels = task === 'rule' ? (p.words || []).map((x) => x.label) : (p.groups || []).map((_, i) => LETTERS[i]);
        const v = labels[p.correct || 0];
        return { value: v, display: v, slots: { answer: { value: v, graded: true } } };
    },
    footprint() { return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 }; },
    inputs(p) {
        const task = (p && p.task) || 'count';
        if (task === 'count' || task === 'order') return (p.groups || []).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full'] }));
        return [{ id: 'answer', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full'] }];
    },
    layout() { return { card: 'card-wide-visual', checker: 'value' }; },
});

export const SORT_RINGS_TEMPLATE = 'sort-rings';
