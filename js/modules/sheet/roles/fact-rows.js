// js/modules/sheet/roles/fact-rows.js
// FACT ROWS, 5 TO 10 COLUMNS (design/PAGE_TYPES.md 4.1): dense daily fact practice in vertical
// form, 25 to 90 facts a page.
//
//   Who        fact-like skills only (`footprint.factLike`, PT-CMP-2). Any other skill gets
//              `unsupported` with the reason, and the dialog routes it to the Computation grid.
//   Cell       every item redrawn by the FACT template (critic round 2: the page used to be the
//              Independent grid with tabs - 4 columns, or 2 x 3 for division): vertical facts at
//              the ladder's point size, stepped down when the widest fact would not fit its column
//              (VA-2's operator track included); division facts ACROSS, "24 ÷ 6 = ___"
//              (PT-FRW-6/7), 3 columns (2 when 3 do not fit) in 16 / 20 / 24 mm rows
//   Columns    Auto 10 / 6 / 5 (S / M / L, PT-FRW-2); columns drive the digit size along the
//              fact ladder (PT-FRW-1)
//   Rows       floor((G - 1) / h) with h from table 4.1 (`factRowsCapacity`), stretch cap 1.3;
//              answers over 99 clamp to 8 columns (PT-FRW-5). The page is filled to the table.
//   Who        two numbers and one sign per cell: a sum of three or four addends is refused
//   Look       Daily by default (PAGE_TYPES appendix 4): hairline interiors, black number tabs
//              ("every fact numbered", PT-FRW-4); tab "Facts"; title the fact stub (HD-13)
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, instructionKeyOf, assemble, poolItems,
    labelStyleOf, LIVE_W_MM, opOf, opGlyphOf, operandsOf, answerOf, writeLine, slotKey, esc,
} from './compose.js';
import { factRowsCapacity, gridHeightMm, cellWidthMm, SAFETY_H_MM } from '../layout.js';
import {
    renderCell, cellAnswerKey, factDigitPt, factPadTop, EM_MM, FACT_TRACK_EM, FACT_OP_TRACK_EM, blankWidth,
} from '../index.js';

export const ROLE_ID = 'fact-rows';
export const DEFAULT_LOOK = 'daily';
const AUTO = { S: 10, M: 6, L: 5 };

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = (ctx) => [...new Set([5, 6, 8, 10, AUTO[(ctx && ctx.size) || 'L']])];

const FACT_SKILL_RE = /^(add|sub|mult|div)_facts$/;
/** A one-step computation printed as a column stack: the operations skills' own format. */
const COLUMN_RE = /^column-(add|sub)(-multi)?$|^column-mult$/;
/** Formats that are never a bare computation (a picture, a line, a model, a story ...). */
const NOT_OPERATION_RE = /word|line|picture|array|group|model|bond|chart|frame|cloze|family|compare|share|remainder|long|area|base10|tape|story/;
const NOT_OPERATION_SKILL_RE = /word|_wp|line|picture|array|model|bond|chart|frame|cloze|family|compare|share|remainder|long|area|base10|tape|story|groups/;

/**
 * Is this item a vertical fact (PT-CMP-2)? CLAUDE.md: "Fact AND operations skills additionally
 * get the 5-10 column fact layouts" - so besides the fact skills, a single-step computation of
 * an operations skill qualifies (add / subtract within N, column addition of several addends as
 * stacked rows, 2-digit x 1-digit): see `isOperation`.
 */
export function isFact(it) {
    const q = it.q || {};
    if (it.template === 'fact') return true;
    if (q.__factLike || (it.footprint && it.footprint.factLike)) return true;
    if (FACT_SKILL_RE.test(String(q.skillId || ''))) return true;
    if (/-facts-(vertical|horizontal)$/.test(String(q.printFormat || ''))) return true;
    return isOperation(it);
}

/** A computation that qualifies only as an operation, not as a fact skill (its title stays its own). */
function isOperationOnly(it) {
    const q = it.q || {};
    const fact = it.template === 'fact' || q.__factLike || (it.footprint && it.footprint.factLike)
        || FACT_SKILL_RE.test(String(q.skillId || '')) || /-facts-(vertical|horizontal)$/.test(String(q.printFormat || ''));
    return !fact;
}

/**
 * A one-step whole-number computation of an operations skill in a column format: two or more
 * whole-number operands, one operation, one whole-number answer. Pictures, number lines, models,
 * stories, remainders and long division stay out (they are not fact rows).
 */
export function isOperation(it) {
    const q = it.q || {};
    const f = String(q.printFormat || '');
    if (NOT_OPERATION_RE.test(f) || NOT_OPERATION_SKILL_RE.test(String(q.skillId || ''))) return false;
    if (!opOf(q) || !/^(addition|subtraction|multiplication|division)$/.test(String(q.categoryId || ''))) return false;
    if (!/^\d+$/.test(answerOf(it))) return false;
    if (it.template === 'stack') return true;
    if (!COLUMN_RE.test(f)) return false;
    // 2-digit x 1-digit at most: a multi-row multiplication is a long procedure, not a fact row.
    if (f === 'column-mult') { const o = operandsOf(q); return o.length >= 2 && Math.min(Math.abs(o[0]), Math.abs(o[1])) < 10; }
    return true;
}

export function supports(items) {
    if (!items.length) return 'no items were generated';
    // Critic round 2: a column sum of three or four addends is a procedure, not a fact row.
    if (items.some((it) => operandsOf(it.q || {}).length > 2)) {
        return 'Fact rows print one fact per cell: two numbers and one sign. This skill adds three or four numbers in columns: use the Independent page or the Test.';
    }
    return items.every(isFact) ? null
        : 'Fact rows need a fact or a one-step computation (add, subtract, multiply or divide in columns). This skill is a picture, model or story: use the Independent page or the Test.';
}

/**
 * The fact stub title (HD-13): "Multiply by 3" for one constant, else "Multiplication facts".
 * A one-step computation that is not a fact skill (column addition, subtract within 20) keeps its
 * own I Can title - and so does any section whose items are two-digit work (critic round 2: a page
 * of 17 + 16 titled "Addition facts"): undefined here, and the frame takes the skill's line.
 */
export function factTitle(items) {
    if (items.length && !items.every((it) => isFact(it) && !isOperationOnly(it))) return undefined;
    const factSkill = items.every((it) => FACT_SKILL_RE.test(String((it.q || {}).skillId || '')));
    if (!factSkill && items.some((it) => operandsOf(it.q || {}).some((v) => Math.abs(v) >= 10))) return undefined;
    const q0 = (items[0] || {}).q || {};
    const op = opOf(q0);
    const seconds = [...new Set(items.map((it) => operandsOf(it.q || {})[1]).filter((v) => v !== undefined))];
    const one = seconds.length === 1 ? seconds[0] : null;
    if (op === 'add') return one !== null ? `Add ${one}` : 'Addition facts';
    if (op === 'subtract') return one !== null ? `Subtract ${one}` : 'Subtraction facts';
    if (op === 'multiply') return one !== null ? `Multiply by ${one}` : 'Multiplication facts';
    if (op === 'divide') return one !== null ? `Divide by ${one}` : 'Division facts';
    return 'Facts';
}

/* ======================================================================== the geometry */

const OP_SIGN = { add: '+', subtract: '-', multiply: 'x', divide: '/' };
const LADDER_PTS = [28, 24, 20, 18, 16];
const ACROSS_ROW = { S: 18, M: 21, L: 24 };      // PT-FPR's horizontal row, 16 / 20 / 24 + the tab clearance

/** A division fact prints ACROSS ("24 ÷ 6 = ___", PT-FRW-6/7): vertical division is not a fact form. */
const isAcross = (items) => items.some((it) => opOf(it.q || {}) === 'divide'
    || /horiz/.test(String((((it.q || {}).cell || {}).payload || {}).notation || '')));

/** Digit tracks of the widest fact in the section (operands and answer, TY-22, at least 2). */
const tracksOf = (items) => Math.max(2, ...items.map((it) => {
    const o = operandsOf(it.q || {});
    return Math.max(String(Math.abs(o[0] || 0)).length, String(Math.abs(o[1] || 0)).length, String(answerOf(it)).length);
}));

/**
 * The largest ladder point size at or below the column's own (PT-FRW-1) at which the widest
 * vertical fact fits its cell with the pads - the fact template's own width formula (VA-2: an
 * operator track of its own). 5 columns of x12 facts at 28 pt needed 37.2 mm in a 37.2 mm cell,
 * so the old page fell back to 4 columns of the Independent grid.
 */
function verticalPt(cols, n, look) {
    const { inner } = cellWidthMm(cols, LIVE_W_MM, look);
    const top = factDigitPt(cols);
    for (const pt of LADDER_PTS.filter((p) => p <= top)) {
        if ((FACT_OP_TRACK_EM + n * FACT_TRACK_EM) * (EM_MM[pt] || (pt / 72) * 25.4) + 5 <= inner) return pt;
    }
    return LADDER_PTS[LADDER_PTS.length - 1];
}

/** The width of an across fact "144 ÷ 12 = ___" at `pt` (Andika digits 0.55 em, signs 0.6 em). */
function acrossWidthMm(items, pt, size) {
    const em = EM_MM[pt] || (pt / 72) * 25.4;
    const digits = Math.max(...items.map((it) => { const o = operandsOf(it.q || {}); return String(o[0] || '').length + String(o[1] || '').length; }));
    const ansDigits = Math.max(2, ...items.map((it) => String(answerOf(it)).length));
    return em * (0.55 * digits + 2 * 0.6 + 4 * 0.28) + 2 + blankWidth(ansDigits, size) + 6;
}

/**
 * The page (PT 4.1): columns, rows, point size and cell height, from the table, not from the
 * Independent grid. Vertical facts: Auto 10 / 6 / 5 columns (8 at most when an answer passes
 * 99, PT-FRW-5), rows floor((G - 1) / h) with h from table 4.1, stretch cap 1.3. Division
 * facts: across, in 3 columns (2 when 3 do not fit), rows of 16 / 20 / 24 mm down the page.
 */
export function factRowsLayout(items, input) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Facts', title: factTitle(items), score: 1 });
    const header = layoutHeader(frame.header);
    const G = gridHeightMm(ctx.paper, ctx.size, header);
    const n = tracksOf(items);
    const labels = labelStyleOf(ctx.look, input.labels);
    if (isAcross(items)) {
        let cols = 3;
        let pt = 24;
        for (const c of [3, 2]) {
            cols = c;
            const { inner } = cellWidthMm(c, LIVE_W_MM, ctx.look);
            pt = [24, 20, 18].find((p) => acrossWidthMm(items, p, ctx.size) <= inner) || 0;
            if (pt) break;
        }
        pt = pt || 18;
        const h = ACROSS_ROW[ctx.size] + (labels === 'tab' ? 2 : 0);
        const rows = Math.max(1, Math.floor((G - SAFETY_H_MM) / h));
        const firstDigits = Math.max(1, ...items.map((it) => String(operandsOf(it.q || {})[0] || '').length));
        return { across: true, cols, rows, perPage: cols * rows, cellH: G / rows, hMin: h, digitPt: pt, tracks: n, gridH: G, labels, firstDigits,
            note: `Division facts print across: ${cols} columns x ${rows} rows.` };
    }
    const big = items.some((it) => Number(answerOf(it)) > 99);
    let cols = input.columns && input.columns !== 'auto' ? Math.max(5, Math.min(10, Number(input.columns) || 5)) : AUTO[ctx.size];
    let note = '';
    if (big && cols > 8) { cols = 8; note = 'Answers over 99: at most 8 columns (PT-FRW-5).'; }
    const pt = verticalPt(cols, n, ctx.look);
    if (pt < factDigitPt(cols)) note = [note, `Digits ${pt} pt so ${n}-digit facts fit ${cols} columns.`].filter(Boolean).join(' ');
    const cap = factRowsCapacity(cols, ctx.size, ctx.paper, header);
    const rows = cap.rows;
    return { across: false, cols, rows, perPage: cols * rows, cellH: Math.min(G / rows, cap.cellH * 1.3), hMin: cap.cellH, digitPt: pt, tracks: n, gridH: G, labels, note };
}

export const counts = (pools, input) => ({ main: factRowsLayout(pools.main || [], input).perPage });

/**
 * One item as a fact-row cell, drawn by the FACT template (VA-70): vertical at the page's point
 * size and track count, or across ("a ÷ b = ___") for division. The host's own cell (a stack,
 * an equation) is not used on this page: fact rows are one fact form in one size (PT-FRW-3).
 */
function factCell(it, L) {
    const q = it.q || {};
    const o = operandsOf(q);
    const op = OP_SIGN[opOf(q)];
    if (o.length < 2 || !op) return it;
    const ans = answerOf(it);
    if (L.across) {
        const key = slotKey({ answer: ans }, ans);
        const digits = Math.max(2, String(ans).length);
        const glyph = opGlyphOf(opOf(q));
        // The first operand in a fixed, right-aligned field, so "÷", "=" and the answer line sit
        // in one place down every column (mock-up 02, kit proposal 3).
        const lead = `<span style="display:inline-block;min-width:${(0.56 * L.firstDigits).toFixed(2)}em;text-align:right">${esc(String(o[0]))}</span>`;
        return Object.assign({}, it, {
            render: (c) => `<div class="mq-hfact mq-across" style="font-size:${L.digitPt}pt"><span>${lead} ${glyph} ${esc(String(o[1]))} =</span>${writeLine('answer', c, key, digits)}</div>`,
            key, drawsAnswer: true, visual: false, cellCls: 'mq-hfactcell',
        });
    }
    const payload = { a: o[0], b: o[1], op, ans: Number.isFinite(Number(ans)) && ans !== '' ? Number(ans) : undefined, columns: L.cols, pt: L.digitPt, digits: L.tracks,
        padTop: factPadTop(L.labels, L.cols) };
    const q2 = Object.assign({}, q, { cell: { template: 'fact', payload, v: 1 } });
    return Object.assign({}, it, {
        q: q2,
        template: 'fact',
        render: (c) => renderCell(q2, Object.assign({}, c, { columns: L.cols, options: Object.assign({}, c.options || {}, { factColumns: L.cols }) })),
        key: cellAnswerKey(q2),
        drawsAnswer: true, visual: false, cellCls: '',
    });
}

export function plan(input = {}) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const all = poolItems(input, 'main');
    const L = factRowsLayout(all, input);
    const items = all.slice(0, L.perPage).map((it) => factCell(it, L));
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Facts', title: factTitle(items), score: items.length });
    const rows = Math.max(1, Math.ceil(items.length / L.cols));
    const grid = gridPart(items.map((it) => planItem(it, { cols: L.cols })), { cols: L.cols, rows, cellH: L.cellH, labels: L.labels, start: 1, cls: 'facts' });
    const line = `Fits: ${L.cols} columns x ${L.rows} rows, ${L.perPage} per page. Digits ${L.digitPt} pt.${L.note ? ` ${L.note}` : ''}`;
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart(instructionKeyOf(items, input.skills), items), grid] }], {
        defaultLook: DEFAULT_LOOK,
        meta: {
            items: items.length, scoreOutOf: items.length,
            fits: [{ role: ROLE_ID, cols: L.cols, rows: L.rows, perPage: L.perPage, pages: 1, cellH: L.cellH, hMin: L.hMin, digitPt: L.digitPt, across: L.across, note: L.note, line }],
            notes: L.note ? [L.note] : [],
        },
    });
}

export default { ROLE_ID, DEFAULT_LOOK, sources, measureCols, supports, counts, plan, isFact, factTitle, factRowsLayout };
