// js/modules/sheet/cells/clock.js
// The `clock` template: every P10 cell built on a clock face (design/research/time-money.md
// §13.1 - §13.4). One template, switched on `payload.kind` (plain data, SCC-Q3):
//
//   read    TR-2 ... TR-9, TO-1   a face with hands, the two-box time slot `[ ]:[ ]` under it
//                                 (RP-104). `readoutSlot` frames the slot as a digital readout
//                                 (TO-1 "write the digital time").
//   draw    TH-1 ... TH-7, TE-4   the time above (a digital readout, or words), a face with NO
//                                 hands (RP-103e) at D 46 / 50 / 52 so two hands of different
//                                 length can be drawn in pencil (RP-102). Hint: the hand-length
//                                 guide rings (ruling Q8) in Model and Guided.
//   words   TR-10                 the time in words, the two-box slot. No face.
//   choose  TO-2, TO-3            the time (readout or words) and THREE faces, each with a check
//                                 box under it (a 1-of-2 choice is a coin toss, §1.4).
//   order   TO-4 ... TO-8         3-5 faces (or readouts) in a row, an order box under each.
//   parts   TR-1                  clock_parts: a face with numerals missing (boxes in their
//                                 places), or hands lettered A / B and "which is the hour hand?"
//   fives   TR-7                  time_fives_ring: a face ringed by 12 boxes for the minute
//                                 counts; some given, the pupil writes the rest.
//   sense   TR-11                 time_sense: a time, an activity, "a.m." / "p.m." to check.
//
// HINTS FADE BY PAGE ROLE (P-7, SKILL_CELL_CONTRACT 2.5): the template reads ctx.scaffoldLevel.
// Model (3): the outer minute ring black, the half-past face shaded, the guide rings labelled
// "short" / "long". Guided (2): the ring and the guide rings grey. Independent (1) and Test (0):
// none, unless the skill's `face: ring` option asks for the ring on every page.
//
// Key (AK-1): the same cell with the answer written (the time in both boxes, minutes two digits)
// or drawn (both hands at RP-101 weights, the hour hand at 30h + 0.5m). Error analysis writes or
// draws the wrong work from ctx.wrong instead.
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import {
    L, P, INK, GREY, esc, isTwin, sizeOf, S, textPt, digitPt, zonePt, box, checkBox, levelOf,
    faceSVG, faceDiameter, readout, timeSlot, words, row, tickList, tickedIndex, splitTime, splitList, partValue,
    fmtTime, h12, numeralAt, numeralMm,
} from './tmkit.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** The ring the face shows at this level (RP-103c): Model black, Guided grey, else none. */
function ringFor(p, ctx) {
    const lv = levelOf(ctx);
    // `ring` is an explicit payload flag the supports allocator may drive: 'on' | 'off' | 'auto'.
    if (p.ring === 'off') return false;
    if (p.ring === 'on' || p.face === 'ring') return lv === 2 ? 'grey' : 'black';
    if ((p.precision || 60) > 5) return false;
    return lv >= 3 ? 'black' : lv === 2 ? 'grey' : false;
}

/** The numerals a face leaves out (`numerals`: all | quarters | twelve), an explicit payload flag. */
function hiddenNumerals(p) {
    if (p.numerals === 'quarters') return [1, 2, 4, 5, 7, 8, 10, 11];
    if (p.numerals === 'twelve') return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    return [];
}

/** The hands a draw cell shows in this state: none on the pupil page. */
function drawnHands(p, ctx) {
    if (ctx.state === 'blank') return null;
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const v = w.value && typeof w.value === 'object' ? w.value : splitTime(w.slots && w.slots.hands !== undefined ? w.slots.hands : w.value);
        if (!v) return null;
        return { h: Number(v.hour), m: Number(v.minute), color: INK };
    }
    return { h: p.h, m: p.m, color: ctx.state === 'traced' ? GREY : INK };
}

const cellRoot = (ctx, cls, inner, attrs = '') => `<div class="tm-cell ${cls}"${isTwin(ctx) ? ' data-mq-tm="1"' : ''}${attrs} `
    + `style="color:${INK};font-family:'Andika','Open Sans',sans-serif;text-align:center;display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};">${inner}</div>`;

function stimulus(ctx, p) {
    if (p.stimulus === 'words') return words(ctx, `<b>${esc(p.text)}</b>`, { pt: textPt(ctx) + 2 });
    return readout(ctx, p.text || fmtTime(p.h, p.m));
}

/* ---------------------------------------------------------------- kinds */

function read(p, ctx) {
    const lv = levelOf(ctx);
    const D = faceDiameter(ctx, { precision: p.precision });
    const face = faceSVG(ctx, {
        D, hands: true, hour: p.h, minute: p.m, ticks1: p.precision === 1, ring: ringFor(p, ctx), missing: hiddenNumerals(p),
        half: p.m === 30 && p.precision === 30 && lv >= 2, label: 'clock',
    });
    const slot = timeSlot(ctx, fmtTime(p.h, p.m));
    const framed = p.readoutSlot
        ? `<span style="display:inline-flex;align-items:center;border:${L(ctx, 0.53)} solid ${INK};border-radius:${L(ctx, 3)};padding:${L(ctx, 1.5)} ${L(ctx, 2.5)};">${slot}</span>`
        : slot;
    return cellRoot(ctx, 'tm-read', `${face}${framed}`);
}

function draw(p, ctx) {
    const lv = levelOf(ctx);
    const D = faceDiameter(ctx, { draw: true });
    const hands = drawnHands(p, ctx);
    const face = faceSVG(ctx, {
        D, hands: !!hands, hour: hands ? hands.h : 0, minute: hands ? hands.m : 0, handColor: hands ? hands.color : INK,
        ticks1: p.precision === 1, ring: ringFor(p, ctx), missing: hiddenNumerals(p),
        guides: lv >= 2, guideLabels: lv >= 3, label: 'clock face with no hands',
    });
    const model = isTwin(ctx) ? ` data-mq-model="clock-set" data-mq-snap="${p.precision === 1 ? 1 : 5}"` : '';
    return cellRoot(ctx, 'tm-draw', `${stimulus(ctx, p)}<div data-ws-slot="hands" data-ws-shape="draw"${model} style="line-height:0;">${face}</div>`);
}

function wordsKind(p, ctx) {
    return cellRoot(ctx, 'tm-words', `${words(ctx, `<b>${esc(p.text)}</b>`, { pt: textPt(ctx) + 2 })}${timeSlot(ctx, fmtTime(p.h, p.m))}`);
}

function choose(p, ctx) {
    const D = faceDiameter(ctx, { choose: true });
    const labels = (p.faces || []).map((_, i) => LETTERS[i]);
    const on = tickedIndex(ctx, labels, LETTERS[p.correct]);
    const cols = (p.faces || []).map((f, i) => `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1.5)};">`
        + faceSVG(ctx, { D, hands: true, hour: f.h, minute: f.m, missing: hiddenNumerals(p), label: `clock ${LETTERS[i]}` })
        // one label span + one box span: the shape wireTickBoxes turns into a tap target
        + `<div style="display:flex;align-items:center;gap:${L(ctx, 2)};"><span style="font-size:${P(ctx, textPt(ctx) + 1)};font-weight:700;">${LETTERS[i]}</span>`
        + checkBox(ctx, { id: `choice${i}`, on: i === on, slot: false }) + `</div></div>`).join('');
    const ink = on >= 0 ? ` data-ws-ink="${ctx.state === 'traced' ? 'trace' : 'solid'}"` : '';
    return cellRoot(ctx, 'tm-choose', `${stimulus(ctx, p)}<div data-ws-slot="choice" data-ws-shape="check"${ink} style="display:flex;justify-content:center;gap:${L(ctx, 10)};">${cols}</div>`);
}

function order(p, ctx) {
    const n = (p.times || []).length;
    const D = n >= 5 ? 34 : faceDiameter(ctx, { choose: true });
    const ranks = (p.ranks || []).map(String);
    const kv = Object.fromEntries(ranks.map((r, i) => [`o${i}`, r]));
    const s = S(ctx);
    const cols = (p.times || []).map((t, i) => {
        const pic = p.analog === false ? readout(ctx, fmtTime(t.h, t.m), { small: n >= 5 })
            : faceSVG(ctx, { D, hands: true, hour: t.h, minute: t.m, ticks1: false, missing: hiddenNumerals(p), label: 'clock' });
        const ap = t.ap ? words(ctx, esc(t.ap), { pt: zonePt(ctx), bold: true }) : '';
        const val = partValue(ctx, `o${i}`, kv, splitList('o'));
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 1.5)};">${pic}${ap}`
            + box(ctx, { id: `o${i}`, value: val, w: 12, h: s.writeMm + 2, mark: 'cell' }) + `</div>`;
    }).join('');
    const join = isTwin(ctx) ? ' data-mq-join=", "' : '';
    return cellRoot(ctx, 'tm-order', `<div data-ws-slot="order"${join} style="display:flex;justify-content:center;align-items:flex-end;gap:${L(ctx, n >= 5 ? 4 : 8)};">${cols}</div>`);
}

function parts(p, ctx) {
    const D = faceDiameter(ctx, { draw: true });
    if (p.task === 'hands') {
        const labels = ['A', 'B'];
        const right = p.hourLetter || 'A';
        const on = tickedIndex(ctx, labels, right);
        // letter the hour hand A or B, as the item says
        const lab = right === 'A' ? ['A', 'B'] : ['B', 'A'];
        const face = faceSVG(ctx, { D, hands: true, hour: p.h, minute: p.m, labelHands: lab, missing: hiddenNumerals(p), label: 'clock with hands lettered A and B' });
        return cellRoot(ctx, 'tm-parts', `${face}${words(ctx, 'The hour hand is:', { pt: textPt(ctx) })}${tickList(ctx, labels, { on, vertical: false })}`);
    }
    const missing = (p.missing || []).map(Number);
    // Critic round 3: on a 50 mm face the write-in boxes overlapped each other and covered the
    // printed numerals. The face is bigger (the cell is half a page wide) and each box stands on
    // its own numeral's place, inside the tick ring, a box's width from its neighbours.
    const Dp = { S: 56, M: 62, L: 66 }[sizeOf(ctx)];
    // O6 (AP4): a face printing only 12, 3, 6, 9 (or 12) leaves its other places empty too.
    const unprinted = [...new Set([...missing, ...hiddenNumerals(p)])];
    const face = faceSVG(ctx, { D: Dp, hands: false, missing: unprinted, label: 'clock face with numbers missing' });
    const R = Dp / 2, pad = 1.5 * 0.35278, W = Dp + 2 * pad, c = W / 2;
    const bw = Math.min(S(ctx).writeMm + 1, 9.5);
    const numMm = numeralMm(ctx, Dp);
    const kv = Object.fromEntries(missing.map((v, i) => [`n${i}`, String(v)]));
    const holes = missing.map((v, i) => {
        const at = numeralAt(v, R, numMm);
        const rb = Math.min(at.r, 0.845 * R - 0.6 - bw * 0.62);
        const a = (v * 30 - 90) * Math.PI / 180;
        const x = c + rb * Math.cos(a) - bw / 2, y = c + rb * Math.sin(a) - bw / 2;
        return `<span style="position:absolute;left:${L(ctx, x)};top:${L(ctx, y)};">`
            + box(ctx, { id: `n${i}`, value: partValue(ctx, `n${i}`, kv, splitList('n')), w: bw, h: bw, mark: 'cell', pt: zonePt(ctx) + 2 }) + `</span>`;
    }).join('');
    const join = isTwin(ctx) ? ' data-mq-join=", "' : '';
    return cellRoot(ctx, 'tm-parts', `<div data-ws-slot="numerals"${join} style="position:relative;width:${L(ctx, W)};height:${L(ctx, W)};line-height:0;">${face}${holes}</div>`);
}

function fives(p, ctx) {
    const size = sizeOf(ctx);
    // Critic round 3: a 30 mm face with the numerals crowding and the boxes off their hours. The
    // face is bigger, and each box is centred on its hour's own angle at one clear gap from the
    // rim, measured along that angle (a box is wider than tall, so the 3 and 9 boxes sit farther
    // out than the 12 and 6 boxes, and every box keeps the same 2.5 mm from the face).
    const D = { S: 40, M: 44, L: 48 }[size];
    const bw = { S: 12, M: 13, L: 15 }[size];
    const bh = S(ctx).writeMm + 1;
    const gap = 2.5;
    const rOf = (i) => { const a = (i * 30 - 90) * Math.PI / 180; return D / 2 + gap + (bw / 2) * Math.abs(Math.cos(a)) + (bh / 2) * Math.abs(Math.sin(a)); };
    const Rr = Math.max(...Array.from({ length: 12 }, (_, k) => rOf(k + 1)));
    const W = 2 * (Rr + bw / 2) + 2;
    const c = W / 2;
    const face = faceSVG(ctx, { D, hands: false, missing: hiddenNumerals(p), label: 'clock face' });
    const given = new Set((p.given || []).map(Number));
    const blanks = [];
    for (let i = 1; i <= 12; i++) if (!given.has(i)) blanks.push(i);
    const kv = Object.fromEntries(blanks.map((pos, k) => [`r${k}`, String(pos === 12 ? 0 : pos * 5)]));
    const boxes = [];
    for (let i = 1; i <= 12; i++) {
        const a = (i * 30 - 90) * Math.PI / 180;
        const x = c + rOf(i) * Math.cos(a) - bw / 2, y = c + rOf(i) * Math.sin(a) - bh / 2;
        const v = i === 12 ? 0 : i * 5;
        const k = blanks.indexOf(i);
        const inner = k < 0
            ? `<span style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${L(ctx, bw)};height:${L(ctx, bh)};`
                + `border:${L(ctx, 0.26)} solid ${INK};border-radius:${L(ctx, 1.25)};font-size:${P(ctx, zonePt(ctx) + 2)};font-weight:700;background:#fff;">${v}</span>`
            : box(ctx, { id: `r${k}`, value: partValue(ctx, `r${k}`, kv, splitList('r')), w: bw, h: bh, mark: 'cell', pt: zonePt(ctx) + 2 });
        boxes.push(`<span style="position:absolute;left:${L(ctx, x)};top:${L(ctx, y)};line-height:0;">${inner}</span>`);
    }
    const off = (W - (D + 1.06)) / 2;
    const join = isTwin(ctx) ? ' data-mq-join=", "' : '';
    return cellRoot(ctx, 'tm-fives', `<div data-ws-slot="ring"${join} style="position:relative;width:${L(ctx, W)};height:${L(ctx, W)};">`
        + `<span style="position:absolute;left:${L(ctx, off)};top:${L(ctx, off)};line-height:0;">${face}</span>${boxes.join('')}</div>`);
}

function sense(p, ctx) {
    const labels = ['a.m.', 'p.m.'];
    const on = tickedIndex(ctx, labels, p.ap);
    return cellRoot(ctx, 'tm-sense', `${words(ctx, esc(p.activity), { pt: textPt(ctx) + 1 })}${readout(ctx, fmtTime(p.h, p.m))}`
        + tickList(ctx, labels, { on, vertical: false }));
}

/* ---------------------------------------------------------------- the template */

function keyOf(p) {
    switch (p.kind) {
        case 'draw': return { value: { hour: p.h % 12, minute: p.m }, display: fmtTime(p.h, p.m), slots: { hands: { value: fmtTime(p.h, p.m), graded: true } } };
        case 'choose': { const v = LETTERS[p.correct]; return { value: v, display: v, slots: { choice: { value: v, graded: true } } }; }
        case 'order': {
            const r = (p.ranks || []).map(String);
            return { value: r.join(', '), display: r.join(', '), slots: Object.fromEntries(r.map((x, i) => [`o${i}`, { value: x, graded: true }])) };
        }
        case 'parts': {
            if (p.task === 'hands') { const v = p.hourLetter || 'A'; return { value: v, display: v, slots: { choice: { value: v, graded: true } } }; }
            const m = (p.missing || []).map(String);
            return { value: m.join(', '), display: m.join(', '), slots: Object.fromEntries(m.map((x, i) => [`n${i}`, { value: x, graded: true }])) };
        }
        case 'fives': {
            const given = new Set((p.given || []).map(Number));
            const vals = [];
            for (let i = 1; i <= 12; i++) if (!given.has(i)) vals.push(String(i === 12 ? 0 : i * 5));
            return { value: vals.join(', '), display: vals.join(', '), slots: Object.fromEntries(vals.map((x, i) => [`r${i}`, { value: x, graded: true }])) };
        }
        case 'sense': return { value: p.ap, display: p.ap, slots: { choice: { value: p.ap, graded: true } } };
        default: {
            const t = fmtTime(p.h, p.m);
            const [hh, mm] = t.split(':');
            return { value: t, display: t, slots: { hour: { value: hh, graded: true }, minute: { value: mm, graded: true, accept: [String(Number(mm))] } } };
        }
    }
}

register('clock', {
    render(p, ctx) {
        switch (p.kind) {
            case 'draw': return draw(p, ctx);
            case 'words': return wordsKind(p, ctx);
            case 'choose': return choose(p, ctx);
            case 'order': return order(p, ctx);
            case 'parts': return parts(p, ctx);
            case 'fives': return fives(p, ctx);
            case 'sense': return sense(p, ctx);
            default: return read(p, ctx);
        }
    },
    answerKey: keyOf,
    footprint(p, ctx) {
        const size = sizeOf(ctx);
        switch (p.kind) {
            case 'choose': case 'order': return { wMm: 186, hMm: null, measure: true, factLike: false, maxCols: 1 };
            case 'draw': return { wMm: 62, hMm: null, measure: true, factLike: false, maxCols: 3 };
            case 'parts': case 'sense': return { wMm: 93, hMm: null, measure: true, factLike: false, maxCols: 2 };
            // The fives ring answers in 12 boxes round the face: a page role that lays a judgement
            // or fix boxes BESIDE narrower work (error analysis: > 95 mm is "wide") puts them under it.
            case 'fives': return { wMm: 96, hMm: null, measure: true, factLike: false, maxCols: 2 };
            default: {
                const one = p.precision === 1;
                return { wMm: one ? 62 : { S: 46.5, M: 62, L: 62 }[size], hMm: null, measure: true, factLike: false, maxCols: one ? 3 : { S: 4, M: 3, L: 3 }[size] };
            }
        }
    },
    inputs(p) {
        switch (p.kind) {
            case 'draw': return [{ id: 'hands', kind: 'time', shape: 'draw', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
            case 'choose': case 'sense': return [{ id: 'choice', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full', 'answer-only', 'decision'] }];
            case 'parts':
                if (p.task === 'hands') return [{ id: 'choice', kind: 'check', shape: 'check', graded: true, order: 0, scopes: ['full', 'notation'] }];
                return (p.missing || []).map((_, i) => ({ id: `n${i}`, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full'] }));
            case 'order': return (p.times || []).map((_, i) => ({ id: `o${i}`, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full', 'answer-only'] }));
            case 'fives': {
                const n = 12 - (p.given || []).length;
                return Array.from({ length: n }, (_, i) => ({ id: `r${i}`, kind: 'number', shape: 'box', graded: true, order: i, scopes: ['full'] }));
            }
            default: return [
                { id: 'hour', kind: 'time', shape: 'box', graded: true, order: 0, scopes: ['full', 'answer-only'] },
                { id: 'minute', kind: 'time', shape: 'box', graded: true, order: 1, scopes: ['full', 'answer-only'] },
            ];
        }
    },
    layout(p) {
        const wide = p && (p.kind === 'choose' || p.kind === 'order');
        return { card: wide ? 'card-wide-visual' : 'card-medium-visual', checker: 'value' };
    },
});

export { LETTERS as CLOCK_LETTERS, h12 };
