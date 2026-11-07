// js/modules/sheet/cells/growing-pattern.js
// The `growing-pattern` template (lane lf-algebra, 2026-11-07): patterns:growing_shape_patterns (4.OA.C.5).
//
//   the drawing   four boxes in one row, labelled Term 1 … Term 4 above them, all the same size (7 x 7 units, so the
//                 empty box never tells how big Term 4 is - L3). Terms 1-3 are drawn in black outline: dots (circles)
//                 or squares (unit squares that share their sides). The Term 4 box is EMPTY: the place to draw the next
//                 term (working space, `data-ws-graded="0"`; the key draws it). Term 4 is never drawn on the pupil page.
//   the count row under each box a number box: Terms 1-3 carry their counts (the hint `show`) or are empty working
//                 boxes (hint off, never graded); under Term 4 the ANSWER box (1.5 pt, the heaviest place, VQ-6) -
//                 or, on task `far`, a working box, the answer then on its own line "Term 10 has [ ] dots".
//   task `rule`   one more line: "Rule: + [ ]", a second graded box (the step), so two answers have two places.
//   sizes         one unit u = 2.0 / 2.8 / 3.3 mm (S / M / L), dots 0.8 u across, squares u; strokes 0.75 pt (parts),
//                 the box 0.75 pt, the answer 1.5 pt. S fits two cells across (82 mm), M and L one.
//   screen twin   the same three drawings; the Term 4 box is a 7 x 7 grid of tap targets (>= 44 px on a card): a tap
//                 puts a dot / square there, a second tap takes it away (working, never graded); the count and rule
//                 boxes are the host's inputs (`data-mq-cell`), the working boxes `input.mq-wwork`.
//
// payload: {fam: 'line'|'rows2'..'rows5' (+ 'p': one more on top)|'L'|'T'|'plus', e: shift 0-3, shape: 'dots'|'squares', ask: 'next'|'rule'|'far',
//           step, counts: [Term 1..4], count10, show, unit: 'dots'|'squares'}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, n2, root, textPt, digitPt, isTwin, sizeOf, inkOf, KEY_FEATURES } from './k2kit.js';
import { answerArea } from '../graphics/answer-area.js';

export const GROW_TEMPLATE = 'growing-pattern';
const GRID = 7;                                   // every term fits 7 x 7 units at Term 4
const UNIT = { S: 2.0, M: 2.8, L: 3.3 };
const PAD = 0.9;                                  // units of white round the drawing inside its box

/** How many objects Term t has (start + (t - 1) × step); NaN for an unknown family. */
export function growCount(fam, e, t) {
    const k = Math.max(0, Number(e) || 0);
    const n = t - 1 + k;                          // the arm length / the shift
    const rows = /^rows(\d)(p?)$/.exec(String(fam));
    if (rows) return Number(rows[1]) * (t + k) + (rows[2] ? 1 : 0);   // r rows of (t + k), and one more on top (p)
    switch (fam) {
        case 'line': return 1 + n;
        case 'L': return 1 + 2 * n;
        case 'T': return 1 + 3 * n;
        case 'plus': return 1 + 4 * n;
        default: return NaN;
    }
}

/**
 * The unit squares of Term t as [x, y] in a 7 x 7 grid (0, 0 top left), centred; null when the term does not fit
 * (so the generator never deals a pattern whose Term 4 cannot be drawn in its box).
 */
export function growthCells(fam, e, t) {
    const k = Math.max(0, Number(e) || 0);
    const n = t - 1 + k;
    let cells = [];
    if (fam === 'line') for (let x = 0; x <= n; x++) cells.push([x, 0]);
    else if (/^rows\d p?$/.test(String(fam).replace(/^(rows\d)/, '$1 '))) {
        const r = Number(String(fam).charAt(4));
        const extra = String(fam).endsWith('p');
        if (extra) cells.push([0, 0]);                   // the one more, on its own row above the first column
        for (let y = 0; y < r; y++) for (let x = 0; x < t + k; x++) cells.push([x, y + (extra ? 1 : 0)]);
    } else if (fam === 'L') {
        cells.push([0, n]);
        for (let i = 1; i <= n; i++) { cells.push([i, n]); cells.push([0, n - i]); }
    } else if (fam === 'T') {
        cells.push([n, n]);
        for (let i = 1; i <= n; i++) { cells.push([n - i, n]); cells.push([n + i, n]); cells.push([n, n - i]); }
    } else if (fam === 'plus') {
        cells.push([n, n]);
        for (let i = 1; i <= n; i++) { cells.push([n - i, n]); cells.push([n + i, n]); cells.push([n, n - i]); cells.push([n, n + i]); }
    } else return null;
    const w = Math.max(...cells.map((c) => c[0])) + 1, h = Math.max(...cells.map((c) => c[1])) + 1;
    if (w > GRID || h > GRID) return null;
    const dx = Math.floor((GRID - w) / 2), dy = Math.floor((GRID - h) / 2);
    return cells.map(([x, y]) => [x + dx, y + dy]);
}

const unitOf = (ctx) => (isTwin(ctx) ? 3.0 : UNIT[sizeOf(ctx)] || UNIT.L);
const boxMm = (ctx) => (GRID + 2 * PAD) * unitOf(ctx);

/** One term drawn as an SVG in units (viewBox), black outline only. */
function termSVG(ctx, cells, shape, { ink = INK, label = '' } = {}) {
    const u = unitOf(ctx);
    const side = GRID + 2 * PAD;
    const sw = n2(0.75 * 0.3528 / u);             // 0.75 pt in units
    const body = cells.map(([x, y]) => (shape === 'squares'
        ? `<rect x="${n2(PAD + x)}" y="${n2(PAD + y)}" width="1" height="1" fill="#fff" stroke="${ink}" stroke-width="${sw}"/>`
        : `<circle cx="${n2(PAD + x + 0.5)}" cy="${n2(PAD + y + 0.5)}" r="0.4" fill="#fff" stroke="${ink}" stroke-width="${n2(sw * 1.6)}"/>`)).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" role="img" aria-label="${esc(label)}" style="display:block;width:100%;height:100%;">${body}</svg>`;
}

/** The Term 4 tap grid of the screen twin: 49 toggles, each a dot or a square when on. Working space only. */
function tapGrid(ctx, shape) {
    const mark = shape === 'squares'
        ? `<span style="visibility:hidden;display:block;width:70%;height:70%;box-sizing:border-box;border:2px solid ${INK};background:#fff;"></span>`
        : `<span style="visibility:hidden;display:block;width:58%;height:58%;box-sizing:border-box;border:2px solid ${INK};border-radius:50%;background:#fff;"></span>`;
    const toggle = "var s=this.firstChild;var on=s.style.visibility!=='visible';s.style.visibility=on?'visible':'hidden';this.setAttribute('aria-pressed',on?'true':'false');";
    let cells = '';
    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            cells += `<button type="button" class="mq-gp-tap" data-ws-graded="0" aria-pressed="false" aria-label="row ${y + 1}, place ${x + 1}" onclick="${toggle}" `
                + `style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;margin:0;border:1px dotted ${GREY};background:#fff;cursor:pointer;">${mark}</button>`;
        }
    }
    return `<div class="mq-gp-grid" role="group" aria-label="make Term 4" style="display:grid;grid-template-columns:repeat(${GRID}, 44px);gap:0;border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};width:max-content;margin:0 auto;">${cells}</div>`;
}

/** A number box: given (thin), working (thin, never graded) or the graded answer (heavy, via the library's answerArea). */
function countBox(ctx, { value = '', kind = 'given', id = '', expect = '', ink = null, unit = '' }) {
    if (kind === 'answer') return answerArea(ctx, { id, shown: value, expect, digits: 2, ink, unit });
    const sz = sizeOf(ctx);
    const w = isTwin(ctx) ? 12 : sz === 'S' ? 10 : sz === 'M' ? 11.5 : 13;
    const h = isTwin(ctx) ? 12 : sz === 'S' ? 9 : sz === 'M' ? 10.5 : 12;
    const pt = Math.min(digitPt(ctx) * 0.75, 20);
    const base = `box-sizing:border-box;flex:none;display:inline-flex;align-items:center;justify-content:center;border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;font-size:${P(ctx, pt)};font-weight:700;line-height:1;${KEY_FEATURES}`;
    if (kind === 'given') return `<span class="mq-gp-count" style="${base}width:${L(ctx, w)};height:${L(ctx, h)};color:${INK};">${esc(value)}</span>`;
    if (isTwin(ctx)) {
        return `<input type="text" class="mq-wwork" data-mq-kind="number" data-mq-expect="${esc(expect)}" data-ws-graded="0" inputmode="numeric" maxlength="2" autocomplete="off" spellcheck="false" aria-label="${esc(id)}" `
            + `style="${base}width:max(44px, ${L(ctx, w)});height:max(44px, ${L(ctx, h)});color:${INK};text-align:center;padding:0;margin:0;font-family:'Andika','Open Sans',sans-serif;">`;
    }
    return `<span class="mq-gp-count" data-ws-slot="${esc(id)}" data-ws-shape="box" data-ws-graded="0"${ink ? ` data-ws-ink="${ink}"` : ''} style="${base}width:${L(ctx, w)};height:${L(ctx, h)};color:${ink === 'trace' ? GREY : INK};">${esc(value)}</span>`;
}

register(GROW_TEMPLATE, {
    render(p, ctx) {
        const twin = isTwin(ctx);
        const shape = p.shape === 'squares' ? 'squares' : 'dots';
        const unitWord = shape === 'squares' ? 'squares' : 'dots';
        const ask = ['next', 'rule', 'far'].includes(p.ask) ? p.ask : 'next';
        const counts = (p.counts || []).map(Number);
        const state = ctx.state || 'blank';
        const keyed = state === 'answered' || state === 'traced';
        const ink = inkOf(ctx);
        const wrong = state === 'wrong' ? (ctx.wrong || {}) : null;
        const wrongSlot = (id) => (wrong && wrong.slots && wrong.slots[id] !== undefined ? String(wrong.slots[id]) : '');
        const box = boxMm(ctx);
        const tp = textPt(ctx);
        const term = (t) => {
            const head = `<div class="mq-gp-label" style="font-size:${P(ctx, tp)};font-weight:700;line-height:1.2;margin-bottom:${L(ctx, 1)};">Term ${t}</div>`;
            let pic;
            if (t < 4) pic = termSVG(ctx, growthCells(p.fam, p.e, t) || [], shape, { label: `Term ${t}: ${counts[t - 1]} ${unitWord}` });
            else if (twin) pic = '';
            else if (keyed) pic = termSVG(ctx, growthCells(p.fam, p.e, 4) || [], shape, { ink: state === 'traced' ? GREY : INK, label: `Term 4: ${counts[3]} ${unitWord}` });
            else pic = '';
            const frame = twin && t === 4
                ? tapGrid(ctx, shape)
                : `<div class="mq-gp-box"${t === 4 ? ' data-ws-slot="draw" data-ws-shape="draw" data-ws-graded="0"' : ''}${t === 4 && keyed ? ` data-ws-ink="${state === 'traced' ? 'trace' : 'solid'}"` : ''} style="box-sizing:border-box;width:${L(ctx, box)};height:${L(ctx, box)};border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1)};background:#fff;">${pic}</div>`;
            // the count under the box
            let cnt;
            if (t < 4) {
                if (p.show !== false) cnt = countBox(ctx, { value: counts[t - 1], kind: 'given' });
                else cnt = countBox(ctx, { value: keyed ? counts[t - 1] : wrongSlot(`n${t}`), kind: 'work', id: `n${t}`, expect: String(counts[t - 1]), ink: keyed ? ink : null });
            } else if (ask === 'far') {
                cnt = countBox(ctx, { value: keyed ? counts[3] : wrongSlot('n4'), kind: 'work', id: 'n4', expect: String(counts[3]), ink: keyed ? ink : null });
            } else {
                const v = keyed ? String(counts[3]) : wrong ? (wrongSlot('answer') || String(wrong.value || '').split(/\s*,\s*/)[0] || '') : '';
                cnt = countBox(ctx, { value: v, kind: 'answer', id: 'answer', expect: String(counts[3]), ink: v ? (wrong ? 'solid' : ink) : null });
            }
            return `<div class="mq-gp-term" style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1.5)};flex:none;">${head}${frame}${cnt}</div>`;
        };
        const gap = L(ctx, sizeOf(ctx) === 'S' ? 1.6 : 2.5);
        const row = twin
            ? `<div class="mq-gp-row" style="display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:12px;">${[1, 2, 3].map(term).join('')}</div>`
                + `<div class="mq-gp-row4" style="display:flex;justify-content:center;margin-top:12px;">${term(4)}</div>`
            // two pairs side by side: one row of four where the cell is wide enough (an independent page), Terms 1-2 over
            // Terms 3-4 in a half-width cell (the lesson's two columns) - never a 3 + 1 split
            : `<div class="mq-gp-row" style="display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:${gap};">`
                + `<div class="mq-gp-pair" style="display:flex;flex-wrap:nowrap;gap:${gap};">${term(1)}${term(2)}</div>`
                + `<div class="mq-gp-pair" style="display:flex;flex-wrap:nowrap;gap:${gap};">${term(3)}${term(4)}</div></div>`;
        let extra = '';
        const line = (inner) => `<div class="mq-gp-line" style="display:flex;justify-content:center;align-items:center;gap:${L(ctx, 2)};font-size:${P(ctx, tp + 2)};font-weight:700;line-height:1;">${inner}</div>`;
        if (ask === 'rule') {
            const v = keyed ? String(p.step) : wrong ? (wrongSlot('rule') || String(wrong.value || '').split(/\s*,\s*/)[1] || '') : '';
            extra = line(`<span>Rule:</span><span style="font-size:${P(ctx, digitPt(ctx) * 0.8)};">+</span>${answerArea(ctx, { id: 'rule', shown: v, expect: String(p.step), digits: 1, ink: v ? (wrong ? 'solid' : ink) : null })}`);
        } else if (ask === 'far') {
            const v = keyed ? String(p.count10) : wrong ? (wrongSlot('answer') || String(wrong.value || '')) : '';
            extra = line(`<span>Term 10 has</span>${answerArea(ctx, { id: 'answer', shown: v, expect: String(p.count10), digits: 2, ink: v ? (wrong ? 'solid' : ink) : null, unit: unitWord })}`);
        }
        const pad = twin ? 'padding:0;' : `padding:${L(ctx, 1)} 0 ${L(ctx, 1)} calc(var(--ws-tab, 5mm) + 1mm);box-sizing:border-box;width:100%;`;
        const join = ask === 'rule' ? ' data-mq-join=", "' : '';
        return root(ctx, 'mq-gp', `${row}${extra}`, { attrs: ` data-read${join}`, style: `display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};${pad}` });
    },
    answerKey(p) {
        const counts = (p.counts || []).map(Number);
        const slots = {};
        if (p.show === false) for (let t = 1; t <= 3; t++) slots[`n${t}`] = { value: String(counts[t - 1]), graded: false };
        if (p.ask === 'far') {
            slots.n4 = { value: String(counts[3]), graded: false };
            slots.answer = { value: String(p.count10), graded: true };
            return { value: String(p.count10), display: String(p.count10), slots };
        }
        slots.answer = { value: String(counts[3]), graded: true };
        if (p.ask === 'rule') {
            slots.rule = { value: String(p.step), graded: true };
            return { value: `${counts[3]}, ${p.step}`, display: `${counts[3]}; rule + ${p.step}`, slots };
        }
        return { value: String(counts[3]), display: String(counts[3]), slots };
    },
    footprint(p, ctx) {
        const box = boxMm(ctx);
        const gap = sizeOf(ctx) === 'S' ? 1.6 : 2.5;
        const w = 4 * box + 3 * gap + 7;
        // answered in place (boxes in the drawing): rows packed to the measured height, never stretched
        return { wMm: Math.ceil(w), hMm: null, measure: true, factLike: false, maxCols: w <= 90 ? 2 : 1, denseRoom: 1, inPlace: true };
    },
    inputs(p) {
        const out = [{ id: 'answer', kind: 'number', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
        if (p.ask === 'rule') out.push({ id: 'rule', kind: 'number', shape: 'box', graded: true, order: 1, scopes: ['full', 'answer-only'] });
        return out;
    },
    layout(p) { return { card: 'card-medium-visual', checker: p && p.ask === 'rule' ? 'list' : 'number' }; },
});
