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
    metricsFor, SIZES,
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
/**
 * A bracket's digit track on a fact-rows page, in em of the rung's digit: 1 em leaves 0.44 em
 * between two dividend digits (under one digit's width, so "72" reads as one number) and room to
 * write the quotient digit over its track.
 */
const FACT_ROW_TRACK_EM = 1;

/** A division fact prints ACROSS ("24 ÷ 6 = ___", PT-FRW-6/7): vertical division is not a fact form. */
// A division fact the teacher asked for Vertical (div_facts `divForm`) is stacked in the vertical
// rows (up to 10 columns), like + - x; every other division fact prints across.
// Long division and Fraction (and Mix, which deals them with Standard) are drawn in their own
// forms too (critic R1 D5; PT-FRW-5/6): see `formRows` below.
const notationOfItem = (it) => String((((it.q || {}).cell || {}).payload || {}).notation || '');
const isAcross = (items) => items.some((it) => (opOf(it.q || {}) === 'divide' && notationOfItem(it) !== 'vertical')
    || /horiz/.test(notationOfItem(it)));

/* ------------------------------------------- div_facts forms on fact rows (divForm, critic R1 D5) */

/** The div_facts form of an item: 'long' | 'fraction' | 'standard' | 'vertical' | ''. */
const formOf = (it) => String(((it.q || {}).divForm) || '');
/** The section's written forms when it is a division section with a bracket or a fraction in it, else null. */
export function divForms(items) {
    if (!items.length || !items.every((it) => opOf(it.q || {}) === 'divide' && formOf(it))) return null;
    const f = new Set(items.map(formOf));
    return f.has('long') || f.has('fraction') ? f : null;
}
/** Width (mm) of the widest item of `forms` at `pt` (the templates' own geometry, + the cell pads). */
function formWidthMm(items, forms, pt, size) {
    const em = EM_MM[pt] || (pt / 72) * 25.4;
    // A bracket on a fact-rows page is drawn at the rung's digit with tracks from THAT digit
    // (formCell's factRowTrack; critic R2 D-C: tracks from the size's writing height spread
    // "72" into "7  2").
    // (a page of one form keeps the size's writing-height track: critic R2 passed those pages)
    const mixed = forms.size > 1;
    const track = mixed ? em * FACT_ROW_TRACK_EM : Math.max(em * FACT_TRACK_EM, (SIZES[size] || SIZES.L).writeMm * (size === 'S' ? 1 : 0.8));
    let w = 0;
    for (const it of items) {
        const o = operandsOf(it.q || {});
        const A = String(o[0] || '').length, B = String(o[1] || '').length;
        const f = formOf(it);
        if (f === 'long') w = Math.max(w, (A + B + 1.1) * track + 6);
        // the bar (digits + 0.4 em pad), two .28 em gaps, "=" (1 em), the line; + the cell's pads
        else if (f === 'fraction') w = Math.max(w, em * (0.6 * Math.max(A, B) + 0.4 + 1 + 0.56) + blankWidth(2, size) + 10);
        // Mix: the across sentence with its line under it (the equation template's narrow form,
        // so every form of a Mix page is a two-line cell of one height); else the line beside it
        else if (mixed) w = Math.max(w, Math.max(em * (0.56 * (A + B) + 2 * 0.8 + 3 * 0.18), blankWidth(2, size)) + 10);
        // the equation template's across sentence: digits, tight "÷" and "=" tracks, the line beside
        else w = Math.max(w, em * (0.56 * (A + B) + 2 * 0.8 + 4 * 0.18) + blankWidth(2, size) + 10);
    }
    return w;
}
/** Height (mm) of the tallest form in the section at `pt`: a bracket under its answer strip, a bar. */
function formHeightMm(forms, pt, size, cols) {
    const em = EM_MM[pt] || (pt / 72) * 25.4;
    const sz = SIZES[size] || SIZES.L;
    let h = 0;
    // A Mix page's pads follow the size (S is the denser page, LESSONS L1); a page of one form
    // keeps its own.
    const pad = forms.size > 1 ? { S: 5, M: 6, L: 7 }[size] || 7 : 7;
    if (forms.has('long')) h = Math.max(h, (sz.stripMm || sz.writeMm) + 1.3 * em + pad + 2);
    if (forms.has('fraction')) h = Math.max(h, 2.45 * em + pad);
    // (Mix: the across fact two lines, the sentence over its line, as tall as the other forms)
    if (forms.has('standard')) h = Math.max(h, forms.size > 1 ? 1.3 * em + sz.writeMm + pad : ACROSS_ROW[size]);
    // (a Mix page's cells are its forms' own height: the vertical-fact table's cell is not a floor)
    return forms.size > 1 ? h : Math.max(h, factCellHMmSafe(cols, size));
}
const factCellHMmSafe = (cols, size) => { try { return factRowsCapacity(cols, size).cellH * 0.8; } catch (e) { return 0; } };

/**
 * The page for a section of bracket / fraction division facts (or Mix): every fact in its own
 * form, one uniform cell. Columns from the Auto count down, clamped at 8 for bracket facts and 6
 * for a 3-digit dividend (PT-FRW-5); the ladder's point size for the column count, stepped down
 * (never below 16 pt) only when the widest fact would not fit; rows as the cell height allows.
 * Mix keeps one third of each form: its count is a multiple of 3 where the grid allows.
 */
function formRows(items, input, ctx, G, labels, forms) {
    let cols = input.columns && input.columns !== 'auto' ? Math.max(2, Math.min(10, Number(input.columns) || 5)) : AUTO[ctx.size];
    const notes = [];
    if (forms.has('long')) {
        const wide = items.some((it) => formOf(it) === 'long' && String(operandsOf(it.q || {})[0] || '').length >= 3);
        const cap = wide ? 6 : 8;
        if (cols > cap) { cols = cap; notes.push(`Bracket division: at most ${cap} columns (PT-FRW-5).`); }
    }
    let pt = 0;
    // Mix (critic R2 D-C): every form at the Standard fact rows' rung (MIX_RUNG_PT), in the most
    // columns at which the widest fact of each form fits at it - never a smaller rung to squeeze a
    // fourth column in. A page whose facts do not fit the rung in 2 columns falls back below.
    const mixPick = forms.size > 1 && !(input.columns && input.columns !== 'auto') ? pickMixRung(items, forms, ctx, Math.min(cols, 4)) : null;
    if (mixPick) ({ cols, pt } = mixPick);
    for (; !mixPick && cols >= 2; cols--) {
        const { inner } = cellWidthMm(cols, LIVE_W_MM, ctx.look);
        pt = LADDER_PTS.filter((p) => p <= factDigitPt(cols)).find((p) => formWidthMm(items, forms, p, ctx.size) <= inner) || 0;
        if (pt) break;
    }
    cols = Math.max(2, cols);
    pt = pt || 16;
    const h = formHeightMm(forms, pt, ctx.size, cols) + (labels === 'tab' ? 2 : 0);
    let rows = Math.max(1, Math.floor((G - SAFETY_H_MM) / h));
    let perPage = cols * rows;
    if (forms.size > 1) perPage -= perPage % 3;
    const names = [...forms].map((f) => ({ long: 'bracket', fraction: 'fraction', standard: 'across', vertical: 'vertical' }[f] || f)).join(' + ');
    notes.unshift(`Division facts as written (${names}): ${cols} columns x ${rows} rows.`);
    return { across: false, forms, cols, rows, perPage, cellH: Math.min(G / rows, h * 1.3), hMin: h, digitPt: pt, tracks: tracksOf(items), gridH: G, labels, note: notes.join(' ') };
}

/** The rung every form of a Mix page is drawn at: the Standard fact rows' across rung (20 pt). */
const MIX_RUNG_PT = 20;
/**
 * A Mix page's columns and rung: the most columns (from `maxCols` down to 2) at which every
 * fact fits at MIX_RUNG_PT - the across facts on one line over their answer line, the brackets
 * tracked from the rung's digit - so the three forms share one cell size and the across digits
 * are the Standard rows' digits (critic R2 D-C: 15 px digits against 19 px). null when even 2
 * columns cannot hold them at the rung.
 */
export function pickMixRung(items, forms, ctx, maxCols = 4) {
    for (let cols = maxCols; cols >= 2; cols--) {
        const { inner } = cellWidthMm(cols, LIVE_W_MM, ctx.look);
        if (formWidthMm(items, forms, MIX_RUNG_PT, ctx.size) <= inner) return { cols, pt: MIX_RUNG_PT };
    }
    return null;
}

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
    const forms = divForms(items);
    if (forms) return formRows(items, input, ctx, G, labels, forms);
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
    // A 3-digit operand (a vertical division fact's dividend: 144 ÷ 12) needs a fourth track: the
    // page drops columns until the ladder's own digit size fits, rather than shrink the digits
    // (PG-20: content never shrinks to fit).
    const askedCols = cols;
    const divide = items.some((it) => opOf(it.q || {}) === 'divide');
    // The drawn width: a 3-track division fact's divisor is shorter than its dividend, so the
    // operator takes the tight track (cells/fact.js factOpTrackEm): n + 1 tracks of 0.72 em, inside
    // the cell's side pads (about 4 mm).
    const tightDiv = divide && n >= 3;
    const fitsAt = (c) => { const pt = factDigitPt(c); return (n + 1) * FACT_TRACK_EM * (EM_MM[pt] || (pt / 72) * 25.4) <= cellWidthMm(c, LIVE_W_MM, ctx.look).inner - 4.5; };
    while (tightDiv && cols > 5 && !fitsAt(cols)) cols--;
    if (cols < askedCols) note = [note, `${n}-digit numbers: ${cols} columns so the digits keep their size.`].filter(Boolean).join(' ');
    const pt = tightDiv && fitsAt(cols) ? factDigitPt(cols) : verticalPt(cols, n, ctx.look);
    if (pt < factDigitPt(cols)) note = [note, `Digits ${pt} pt so ${n}-digit facts fit ${cols} columns.`].filter(Boolean).join(' ');
    const cap = factRowsCapacity(cols, ctx.size, ctx.paper, header);
    const rows = cap.rows;
    return { across: false, cols, rows, perPage: cols * rows, cellH: Math.min(G / rows, cap.cellH * 1.3), hMin: cap.cellH, digitPt: pt, tracks: n, gridH: G, labels, note };
}


/**
 * A fixed count of form cells on ONE page (the fact probe, PT-FPR-6: 20 facts, one sheet): the
 * most columns (from `maxCols` down) and the largest ladder size at which the widest fact fits its
 * column AND ceil(count / cols) rows of the form's height fit the grid. The rows then take the
 * grid's whole height (PG-14), so S is not left a third empty. null when even 2 columns at 16 pt
 * cannot hold them.
 */
export function formGrid(items, ctx, G, forms, count, maxCols = 5) {
    // Mix: the rung of the Standard rows, in the most columns that hold it (pickMixRung).
    if (forms.size > 1) {
        for (let cols = Math.min(maxCols, 4); cols >= 2; cols--) {
            const { inner } = cellWidthMm(cols, LIVE_W_MM, ctx.look);
            const rows = Math.ceil(count / cols);
            const h = formHeightMm(forms, MIX_RUNG_PT, ctx.size, cols);
            if (formWidthMm(items, forms, MIX_RUNG_PT, ctx.size) > inner || rows * h > G - SAFETY_H_MM) continue;
            return { forms, cols, rows, perPage: cols * rows, cellH: (G - SAFETY_H_MM) / rows, hMin: h, digitPt: MIX_RUNG_PT, size: ctx.size, look: ctx.look };
        }
    }
    for (let cols = maxCols; cols >= 2; cols--) {
        const { inner } = cellWidthMm(cols, LIVE_W_MM, ctx.look);
        const rows = Math.ceil(count / cols);
        for (const pt of LADDER_PTS.filter((p) => p <= factDigitPt(Math.max(cols, 5)))) {
            if (formWidthMm(items, forms, pt, ctx.size) > inner) continue;
            const h = formHeightMm(forms, pt, ctx.size, cols);
            if (rows * h > G - SAFETY_H_MM) continue;
            return { forms, cols, rows, perPage: cols * rows, cellH: (G - SAFETY_H_MM) / rows, hMin: h, digitPt: pt, size: ctx.size, look: ctx.look };
        }
    }
    return null;
}
/** One item drawn in its own form at a form grid's size (see factCell). */
export const formCell = (it, L) => factCell(it, L);

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
    if (L.forms) {
        // the item's OWN cell (bracket, fraction or across), at the page's point size and tracks
        const metrics = Object.assign({}, metricsFor(L.size || 'L', L.look || DEFAULT_LOOK, { factColumns: L.cols }),
            { digitPt: L.digitPt, ...(L.forms.size > 1 ? { factRowTrack: (EM_MM[L.digitPt] || (L.digitPt / 72) * 25.4) * FACT_ROW_TRACK_EM } : {}) });
        return Object.assign({}, it, {
            // (the equation template's digits follow the page's --ws-digit: set it to the row's size)
            render: (c) => `<div style="--ws-digit:${L.digitPt}pt">${renderCell(q, Object.assign({}, c, { columns: L.cols, metrics: Object.assign({}, c.metrics || {}, metrics) }))}</div>`,
            key: cellAnswerKey(q), drawsAnswer: true, visual: false, cellCls: '',
        });
    }
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
    const L = Object.assign({}, factRowsLayout(all, input), { size: ctx.size, look: ctx.look });
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
