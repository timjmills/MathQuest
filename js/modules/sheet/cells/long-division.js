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
// row, so a quotient digit stands exactly over the dividend digit it belongs to. The work rows
// are a DIGIT GRID on the dividend's tracks (a 0.75 pt grey cell on every track, the scaffold
// that keeps each bring-down in its column) and there are exactly two per step of the algorithm
// (product, then difference and bring-down): 152 ÷ 19 is one step and draws two rows, never a
// spare "−" row left empty on the key (2026-09-25 regrade). The key writes the quotient into its
// boxes AND the finished work into the work rows (AK-1: the key is the page, finished).
//
// Payload: { dividend, divisor, quotient?, remainder?, workRows? }
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { markWriteAbove } from '../cell.js';
import { geo, root, inkOf, slotValues, inked, box, esc, HAIR, HEAVY } from './ops-common.js';
import { INK, stripPos } from '../tokens.js';
import { stepMarks, WHOLE_SLOTS } from '../steps.js';

/**
 * The bracket's arc in its gutter (viewBox 10 x 40): `x` where the arc starts at the top and ends
 * at the bottom, `q` the control point of its bow. WIDE_ARC is VA-60's gutter of 1.1 tracks. On a
 * fact-rows page of 5 to 10 columns the gutter is narrow and the arc is placed from the glyphs' INK
 * (`compactArc`, critic r1 R1-1: an arc placed in the side bearing ran into the ink of "4", "3", "6"
 * and "8", which have almost none, so "4 ) 8" read as "48").
 */
const WIDE_ARC = Object.freeze({ x: 1.5, q: 9 });
/**
 * Andika's digit advance (em) and each digit's ink, left and right edge within its advance (em),
 * measured in the browser (canvas measureText, Andika Regular). A compact bracket is centred on its
 * INK, not its box: a divisor starting "1" (10, 11, 12) has 0.1 em of white before its ink, so a
 * box-centred "12 ) 144" leaves the fit gate's 1 mm on the left and too little on the right.
 */
export const DIGIT_ADV_EM = 0.586;
// (re-measured 2026-10-31 at 1000 px, critic r1 R1-1: at print size canvas rounds the ink to whole
// pixels, and the old table put "4" / "8" 0.01 em further right and "4" / "7" 0.01 em short)
export const DIGIT_INK_EM = Object.freeze({
    0: [0.031, 0.547], 1: [0.094, 0.516], 2: [0.047, 0.531], 3: [0.047, 0.547], 4: [0.031, 0.563],
    5: [0.063, 0.531], 6: [0.047, 0.547], 7: [0.047, 0.547], 8: [0.031, 0.547], 9: [0.047, 0.547],
});
/** White (em) before the ink of a bracket's first divisor digit on a track of `t` em (glyph centred). */
export const bracketLeadEm = (divisor, t) => t / 2 - DIGIT_ADV_EM / 2 + (DIGIT_INK_EM[String(divisor)[0]] || [0.04])[0];

/* ---------------------------------------------- the compact bracket's arc (fact rows, R1-1) */
//
// Between the divisor's last digit and the dividend's first the gutter holds, from left to right:
// white `a` (the divisor reads as its own number), the arc's 1.5 pt stroke and its bow, and white
// `b` (the arc never touches or crowds the dividend's first digit: owner 2026-10-31). Each white is
// measured on the glyphs' INK (DIGIT_INK_EM), never on the track edges. `b` aims at 0.7 mm (at least 0.6 mm
// as printed, the canvas ink less a 1/64 em rounding) and is
// never under 0.3 mm (ws-print-lint L-OVERLAP ARC-INK).

/** The arc's stroke (HEAVY, 1.5 pt) in mm. */
export const ARC_STROKE_MM = 1.5 * 25.4 / 72;
/** The whites and the bow (mm): the floor, the aim, and the aim's share of the em at large digits. */
export const ARC_SPACE = Object.freeze({
    a: Object.freeze({ min: 0.22, aim: 0.4, em: 0.08 }),
    bow: Object.freeze({ min: 0.1, aim: 0.4, em: 0.07 }),
    b: Object.freeze({ min: 0.3, aim: 0.7, em: 0.11 }),
});
const inkL = (d) => (DIGIT_INK_EM[d] || [0.04, 0.55])[0];
const inkR = (d) => (DIGIT_INK_EM[d] || [0.04, 0.55])[1];
/**
 * The white (em) between the divisor's last digit's ink and the dividend's first digit's ink, on
 * tracks of `t` em (glyphs centred) with a gutter of `g` em.
 */
export function arcWhiteEm(divisor, dividend, t, g) {
    const V = String(divisor), D = String(dividend);
    const dvRight = -t / 2 - DIGIT_ADV_EM / 2 + inkR(V[V.length - 1]);
    const ddLeft = g + t / 2 - DIGIT_ADV_EM / 2 + inkL(D[0]);
    return ddLeft - dvRight;
}
/** The white (em) the arc needs at a digit of `emMm` mm: 'aim' or 'min' (a + stroke + bow + b). */
export function arcNeedEm(emMm, level = 'aim') {
    const part = (k) => (level === 'min' ? ARC_SPACE[k].min : Math.max(ARC_SPACE[k].aim, ARC_SPACE[k].em * emMm));
    return (part('a') + part('bow') + part('b') + ARC_STROKE_MM) / emMm;
}
/** The ink width (em) of a compact bracket fact: the divisor's first digit's ink to the vinculum's end. */
export const compactInkEm = (divisor, dividend, t, g) => (String(divisor).length + String(dividend).length) * t + g - bracketLeadEm(divisor, t);
/**
 * The gutter (em) of one compact bracket fact: the white its arc aims at, but no wider than keeps its
 * ink within `roomEm`. Below the floor's white it is still returned: `compactFits` refuses it.
 */
export function compactGutterEm(divisor, dividend, t, emMm, roomEm = Infinity) {
    // (never narrower than the arc's own ink - its stroke and bow - so the arc keeps its gutter on wide
    // tracks too, where the digits' side bearings alone hold the whites)
    const own = (ARC_STROKE_MM + Math.max(ARC_SPACE.bow.aim, ARC_SPACE.bow.em * emMm)) / emMm;
    const aim = Math.max(own, arcNeedEm(emMm, 'aim') - arcWhiteEm(divisor, dividend, t, 0));
    const fit = roomEm - compactInkEm(divisor, dividend, t, 0);
    return Math.max(0, Math.min(aim, fit));
}
/** Does a compact bracket fact on tracks of `t` em keep the arc's floor whites with its ink inside `roomEm`? */
export function compactFits(divisor, dividend, t, emMm, roomEm) {
    const g = compactGutterEm(divisor, dividend, t, emMm, roomEm);
    return compactInkEm(divisor, dividend, t, g) <= roomEm + 1e-9
        && arcWhiteEm(divisor, dividend, t, g) >= arcNeedEm(emMm, 'min') - 1e-9;
}
/**
 * The arc of one compact bracket fact (em, from the gutter's left edge): `x0` where the stroke's
 * centre line starts and ends, `apex` its outermost point, and the whites `a` (divisor ink to arc
 * ink) and `b` (arc ink to dividend ink). `b` (the white the owner's ruling is about) takes its aim
 * first, over the floors of `a` and the bow; then `a` and the bow grow toward their aims together;
 * white left over goes half to `b`.
 */
export function compactArc(divisor, dividend, t, g, emMm) {
    const W = arcWhiteEm(divisor, dividend, t, g);
    const s = ARC_STROKE_MM / emMm;
    const mn = (k) => ARC_SPACE[k].min / emMm;
    const am = (k) => Math.max(ARC_SPACE[k].aim, ARC_SPACE[k].em * emMm) / emMm;
    const free = W - s;
    const b0 = Math.min(am('b'), Math.max(mn('b'), free - mn('a') - mn('bow')));
    const rest = Math.max(0, free - b0 - mn('a') - mn('bow'));
    const span = (am('a') - mn('a')) + (am('bow') - mn('bow'));
    const f = Math.min(1, rest / Math.max(1e-9, span));
    let a = mn('a') + f * (am('a') - mn('a'));
    let bow = mn('bow') + f * (am('bow') - mn('bow'));
    const over = Math.max(0, rest - span);
    a += 0.3 * over; bow += 0.2 * over;
    const V = String(divisor);
    const dvRight = -t / 2 - DIGIT_ADV_EM / 2 + inkR(V[V.length - 1]);
    const x0 = dvRight + a + s / 2;
    return { x0, apex: x0 + bow, a, bow, b: W - s - a - bow, white: W };
}

/** Work rows: the payload's count, else two per step of the algorithm (at least two). */
// A division FACT (`fact: true`, div_facts' long-division form): the bracket and the quotient
// boxes only - a fact is recalled, not worked, so no work rows.
const rowsOf = (p) => (p.fact ? 0 : Number(p.workRows) > 0 ? Number(p.workRows) : Math.max(2, 2 * divisionSteps(p.dividend, p.divisor).length));

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
    // P11: `rbox` adds an "R [ ]" slot after the quotient strip for a remainder (divide, Remainders).
    if (p.rbox) slots.r = String(dividend - quotient * divisor);
    return { quotient, slots, remainder: p.rbox ? dividend - quotient * divisor : null };
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

/**
 * The digit track (mm). ONE pitch for every problem of a page (critic 2026-10-03: a per-problem
 * widening gave "8 8 0" wider digits than "4183" in the next cell). On paper at Size S the
 * tracks are 1.2 x wider for every problem alike, so the small digits get more room to write and
 * the cell is not three quarters empty (RUBRIC H13); M and L keep the base pitch.
 */
function trackOf(p, ctx, g) {
    // A division fact's quotient box is at least the writing height wide (critic R1 D13: 4.5 mm
    // boxes for 6 mm handwriting at S).
    // A fact on a fact-rows / probe page is drawn at the row's rung and tracked from THAT digit
    // (`factRowTrack`, critic R2 D-C: a writing-height track spread "72" into "7  2").
    const rowTrack = p.fact && ctx.mode !== 'screen' && Number((ctx.metrics || {}).factRowTrack) > 0 ? Number(ctx.metrics.factRowTrack) : 0;
    if (rowTrack) return rowTrack;
    const base = Math.max(ctx.metrics.trackMm || 0, g.writeMm * (p.fact && ctx.size === 'S' ? 1 : 0.8));
    if (ctx.mode === 'screen' || p.fact) return base;
    return ctx.size === 'S' ? base * 1.2 : base;
}

/**
 * The compact gutter (mm) of a division fact on a fact-rows page past 4 columns, or 0. The page hands
 * the room its ink may take (`factRowRoom`, mm: the column less 1 mm each side) and each fact takes
 * the gutter its arc aims at within that room (compactGutterEm); an older page hands one gutter for
 * all (`factRowGutter`, mm).
 */
function compactGutterMm(p, ctx, trackMm, g) {
    const m = ctx.metrics || {};
    if (!p.fact || ctx.mode === 'screen' || !(Number(m.factRowTrack) > 0)) return 0;
    if (Number(m.factRowRoom) > 0) {
        const gEm = compactGutterEm(p.divisor, p.dividend, trackMm / g.E, g.E, Number(m.factRowRoom) / g.E);
        return Math.max(0.01, gEm * g.E);
    }
    return Number(m.factRowGutter) > 0 ? Number(m.factRowGutter) : 0;
}

register('division', {
    render(p, ctx) {
        const g = geo(ctx);
        const D = String(p.dividend), V = String(p.divisor);
        const n = D.length, dv = V.length;
        const rows = rowsOf(p);
        const trackMm = trackOf(p, ctx, g);
        // VA-61: the digit grid over the dividend is a Model / Guided scaffold. A division FACT on
        // an Independent, Test, Probe ... page (scaffold level below 2) writes its quotient on the
        // vinculum's open space, one digit per track, with no boxes (critic R1 D13). Screen twins
        // keep their typed boxes (the input needs a target).
        const openQ = !!p.fact && !g.twin && ctx.mode !== 'screen' && !((Number(ctx.scaffoldLevel) || 1) >= 2);
        // A fact-rows page past 4 columns (owner ruling 2026-10-30: the bracket reaches 10 columns)
        // hands its own narrow gutter (`factRowGutter`, mm): the arc then hugs the space between the
        // divisor's last digit and the dividend's first (bracketArc's compact path).
        const rowGutter = compactGutterMm(p, ctx, trackMm, g);
        const gutterMm = rowGutter || trackMm * 1.1;
        const k = keyOf(p);
        const ink = inkOf(ctx);
        const vals = slotValues(ctx, k.slots, (w) => {
            const s = String(w).replace(/\D/g, '').padStart(n, ' ');
            const o = {};
            for (let i = 0; i < n; i++) o[`q-${i}`] = s[i] === ' ' ? '' : s[i];
            return o;
        });
        const o = dv + 2;
        const cols = `grid-template-columns:repeat(${dv}, ${g.em(trackMm)}) ${g.em(gutterMm)} repeat(${n}, ${g.em(trackMm)})`
            + `${p.rbox ? ` ${g.em(trackMm * 0.9)} ${g.em(trackMm * 1.2)}` : ''};`;
        // S5 step state: {slot: {value, ink}} and one ink per work row (stepState below).
        const sv = ctx.stepVals || null;
        const vAt = (id) => (sv ? ((sv[id] && sv[id].value) || '') : vals[id] || '');
        const iAt = (id) => (sv ? ((sv[id] && sv[id].ink) || null) : ink);
        const cell = (content, col, row, extra = '') =>
            `<span style="grid-column:${col};grid-row:${row};display:flex;align-items:center;justify-content:center;${extra}">${content}</span>`;
        let html = '';
        // Row 1: the quotient strip over every dividend track (VA-61, SL-12).
        for (let i = 0; i < n; i++) {
            html += cell(box(g, `q-${i}`, {
                wMm: trackMm, hMm: g.stripMm, value: vAt(`q-${i}`), ink: iAt(`q-${i}`), mark: 'cell', seg: openQ ? null : stripPos(i, n),
                ...(openQ ? { shape: 'open', extra: 'border:0;background:transparent;' } : {}),
                // A box before the quotient's first digit stays empty on the key: ungraded.
                graded: k.slots[`q-${i}`] !== '',
            }), o + i, 1, 'align-items:flex-end;padding-bottom:0.08em;');
        }
        // P11: the remainder slot, "R [ ]", on the quotient's row after the last dividend track.
        if (p.rbox) {
            html += cell('<span style="font-weight:700">R</span>', dv + 2 + n, 1, 'align-items:flex-end;padding-bottom:0.08em;');
            html += cell(box(g, 'r', { wMm: trackMm, hMm: g.stripMm, value: vAt('r'), ink: iAt('r'), mark: 'cell' }), dv + 3 + n, 1, 'align-items:flex-end;padding-bottom:0.08em;');
        }
        // Row 2: divisor, bracket, dividend. The vinculum is the top border of the dividend row.
        for (let i = 0; i < dv; i++) html += cell(esc(V[i]), i + 1, 2);
        // The compact arc is placed from the glyphs' ink (compactArc): white before it, white after it.
        const A = rowGutter ? (() => {
            const gEm = rowGutter / g.E;
            const c = compactArc(V, D, trackMm / g.E, gEm, g.E);
            return { x: +(c.x0 / gEm * 10).toFixed(3), q: +((c.x0 + 2 * c.bow) / gEm * 10).toFixed(3) };
        })() : WIDE_ARC;
        const arc = `<svg viewBox="0 0 10 40" preserveAspectRatio="none" aria-hidden="true" style="display:block;width:100%;height:100%;overflow:visible">`
            + `<path d="M${A.x} 0 H10 M${A.x} 0 Q${A.q} 20 ${A.x} 40" fill="none" stroke="${INK.ink}" stroke-width="${HEAVY}" vector-effect="non-scaling-stroke"/></svg>`;
        // The arc's stroke is centred on y 0 while the vinculum (the dividend's border-top) lies
        // inside its row: the arc drops half a stroke so the two meet in one line.
        html += `<span style="grid-column:${dv + 1};grid-row:2;align-self:stretch;display:block;position:relative;top:calc(${HEAVY} / 2)">${arc}</span>`;
        // The vinculum is ONE rule over every dividend track (critic R3: per-track top borders showed
        // seams at the track joins); each digit keeps the rule's place above it (a clear border, which
        // the screen's work-row wiring still reads as "a dividend track").
        for (let i = 0; i < n; i++) html += cell(esc(D[i]), o + i, 2, `border-top:${HEAVY} solid transparent;`);
        // (it starts over the arc's own top stroke - 15 % into the arc's track, where the path starts -
        // so the arc and the bar meet in one unbroken line, no step at the join)
        html += `<span aria-hidden="true" style="grid-column:${dv + 1} / span ${n + 1};grid-row:2;align-self:start;display:block;height:0;margin-left:calc(${g.em(gutterMm)} * ${A.x / 10});border-top:${HEAVY} solid ${INK.ink}"></span>`;
        // Work rows (VA-63). The key and a Model cell write the finished work; the pupil page
        // leaves the rows open. The "−" and the rule under each subtract row are structural.
        const shownQ = ctx.state === 'wrong' ? Object.keys(k.slots).map((id) => vals[id] || ' ').join('') : null;
        const work = sv ? workRows(p, rows, null) : ink === null ? [] : workRows(p, rows, shownQ);
        const rowH = g.em(Math.max(g.writeMm, 6) + 1);
        for (let r = 0; r < rows; r++) {
            const gridRow = 3 + r;
            const subtract = r % 2 === 0;
            const w = work[r];
            const rInk = sv ? ((ctx.stepWork || [])[r] || null) : ink;
            const t = w && rInk ? w.text.padStart(w.col + 1, ' ') : '';
            // The "−" is structural (VA-63): printed in the gutter of every subtract row, so it
            // never sits in a digit track and never touches the product's first digit.
            html += cell(subtract ? `<span style="font-weight:700">−</span>` : '', dv + 1, gridRow, `height:${rowH};`);
            for (let i = 0; i < n; i++) {
                const ch = t[i] && t[i] !== ' ' ? t[i] : '';
                // The digit grid: a grey cell wall on every track boundary, a grey floor under a
                // difference row, the black subtraction rule under a product row (VA-63).
                const grid = `border-left:${HAIR} solid ${INK.grey};${i === n - 1 ? `border-right:${HAIR} solid ${INK.grey};` : ''}`
                    + (r === 0 ? `border-top:${HAIR} solid ${INK.grey};` : '')
                    + `border-bottom:${HAIR} solid ${subtract ? INK.ink : INK.grey};`;
                html += cell(ch ? inked(ch, rInk) : '', dv + 2 + i, gridRow, `box-sizing:border-box;height:${rowH};${grid}`);
            }
        }
        const label = `${D} divided by ${V}`;
        // CL-4b: the quotient is written above the bracket, so the cell is centred down the box.
        return markWriteAbove(root(g, 'division',
            `<div role="group" aria-label="${esc(label)}" style="display:inline-grid;${cols}grid-template-rows:auto ${g.em(g.pt * 25.4 / 72 * 1.25)};align-items:stretch;margin:0 auto${rowGutter ? `;position:relative;left:-${(bracketLeadEm(V, trackMm / g.E) / 2).toFixed(3)}em` : ''}">${html}</div>`,
            'text-align:center;', this.footprint(p, ctx).wMm));
    },
    answerKey(p) {
        const k = keyOf(p);
        const slots = {};
        for (const [id, v] of Object.entries(k.slots)) slots[id] = { value: v, graded: v !== '' };
        if (p.rbox) {
            const v = `${k.quotient} R ${k.remainder}`;
            slots.answer = { value: v, graded: true };
            return { value: v, display: v, slots };
        }
        slots.answer = { value: String(k.quotient), graded: true };
        return { value: k.quotient, display: String(k.quotient), slots };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const n = String(p.dividend).length, dv = String(p.divisor).length;
        const trackMm = trackOf(p, ctx, g);
        const rows = rowsOf(p);
        const rowGutter = compactGutterMm(p, ctx, trackMm, g);
        return {
            wMm: Math.ceil((n + dv + (p.rbox ? 2.1 : 0)) * trackMm + (rowGutter || 1.1 * trackMm) + 8),
            hMm: Math.ceil(g.stripMm + g.E * 1.3 + rows * (Math.max(g.writeMm, 6) + 1) + 6),
            measure: !p.fact, factLike: !!p.fact, maxCols: p.fact ? 4 : 2, tracks: n + dv + 1,
        };
    },
    inputs(p) {
        const n = String(p.dividend).length;
        const out = Array.from({ length: n }, (_, i) => ({
            id: `q-${i}`, kind: 'digit', shape: 'box', graded: true, order: i, maxLength: 1,
            inputmode: 'numeric', scopes: ['full', 'answer-only'],
        }));
        if (p.rbox) out.push({ id: 'r', kind: 'number', shape: 'box', graded: true, order: n, maxLength: 2, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
        return out;
    },
    layout() { return { card: 'card-division', checker: 'value', requiresVisual: true }; },
    /**
     * S5 / P-LC-9: the bracket after step k. A quotient-digit mark `q<j>` writes the j-th digit of
     * the quotient over its dividend digit AND the two work rows of that step of the algorithm
     * (product, then difference and bring-down) in the same ink; a whole `answer` / `quotient`
     * mark writes every quotient digit (keeping the ink of those already written); `remainder`
     * fills the "R" box. Newest grey, earlier black.
     */
    stepState(p, steps, k, ctx) {
        const D = String(p.dividend);
        const n = D.length;
        const alg = divisionSteps(p.dividend, p.divisor);
        const kk = keyOf(p);
        const sv = {};
        const work = [];
        for (const m of stepMarks(steps, k)) {
            const qd = /^q(\d+)$/.exec(m.slot);
            if (qd) {
                const j = Number(qd[1]);
                const st = alg[j];
                if (!st) continue;
                sv[`q-${st.col}`] = { value: String(m.value).replace(/\D/g, '') || String(st.digit), ink: m.ink };
                work[2 * j] = m.ink;
                work[2 * j + 1] = m.ink;
                continue;
            }
            if (m.slot === 'remainder' && p.rbox) { sv.r = { value: m.value, ink: m.ink }; continue; }
            if (WHOLE_SLOTS.has(m.slot)) {
                for (let i = 0; i < n; i++) {
                    const v = kk.slots[`q-${i}`];
                    if (!v) continue;
                    if (!sv[`q-${i}`] || sv[`q-${i}`].value !== v) sv[`q-${i}`] = { value: v, ink: m.ink };
                }
                for (let r = 0; r < 2 * alg.length; r++) if (!work[r]) work[r] = m.ink;
                if (p.rbox && /R/i.test(String(m.value)) && !sv.r) sv.r = { value: String(kk.remainder), ink: m.ink };
            }
        }
        return this.render(p, Object.assign({}, ctx, { state: 'blank', stepVals: sv, stepWork: work }));
    },
});
