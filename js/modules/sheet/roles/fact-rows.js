// js/modules/sheet/roles/fact-rows.js
// FACT ROWS, 5 TO 10 COLUMNS (design/PAGE_TYPES.md 4.1): dense daily fact practice in vertical
// form, 25 to 90 facts a page.
//
//   Who        fact-like skills only (`footprint.factLike`, PT-CMP-2). Any other skill gets
//              `unsupported` with the reason, and the dialog routes it to the Computation grid.
//   Cell       every item redrawn by the FACT template (critic round 2: the page used to be the
//              Independent grid with tabs - 4 columns, or 2 x 3 for division): vertical facts at
//              the ladder's point size, stepped down when the widest fact would not fit its column
//              (VA-2's operator track included). Division facts (owner ruling 2026-10-30: ÷ facts
//              reach the full 10 columns in all three notations) take the vertical-fact grammar
//              in the column's own width: the ÷ sign STACKED like + - x (div_facts Standard and
//              Vertical), the fraction with its "=" over the answer line, the long-division
//              bracket on narrow tracks with the quotient above (`formRows`, PT-FRW-6/7). A ÷
//              fact of another skill whose notation is across still prints across, 3 columns
//              (2 when 3 do not fit) in 16 / 20 / 24 mm rows
//   Columns    Auto 10 / 6 / 5 (S / M / L, PT-FRW-2); columns drive the digit size along the
//              fact ladder (PT-FRW-1)
//   Rows       floor((G - 1) / h) with h from table 4.1 (`factRowsCapacity`), stretch cap 1.3;
//              answers over 99 clamp to 8 columns (PT-FRW-5; a ÷ fact's answer never passes 12,
//              so the ÷ sign and the fraction keep 10). The long-division BRACKET prints at most 8
//              columns (owner 2026-10-31, revised Q3): >= 0.5 mm of white between the arc and the
//              digits on both sides; a Mix or mixed page holding a bracket takes its 8-column grid.
//              The count printed = columns x rows = Score /N on every seed (critic r2 R2-2, plan). The page is filled to the table. Every ÷ form passes the
//              real-fit gate - drawn ink + 1 mm of white each side (FIT_CLEAR_MM) - at the
//              column's ladder digit, never below the Size S fact digit (16 pt).
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
    metricsFor, SIZES, markWriteAbove, needsRegroup, factOpTrackEm, SLOT,
} from '../index.js';
import { FRAC_ROW_PAD_EM, FRAC_ROW_GAP_EM, FRAC_ROW_EQ_EM } from '../cells/equation.js';
import { DIGIT_ADV_EM, bracketLeadEm, compactFits, compactGutterEm, compactInkEm } from '../cells/long-division.js';

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
    // a page mixing operations (owner ruling 2026-10-31)
    if (opsOf(items).size > 1) return 'Facts';
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
/** The real-fit clearance of the column gate: 1 mm of white either side of the fact's ink (R1). */
export const FIT_CLEAR_MM = 2;
const ACROSS_ROW = { S: 18, M: 21, L: 24 };      // PT-FPR's horizontal row, 16 / 20 / 24 + the tab clearance
/**
 * A bracket's digit track on a fact-rows page, in em of the rung's digit: 1 em leaves 0.44 em
 * between two dividend digits (under one digit's width, so "72" reads as one number) and room to
 * write the quotient digit over its track.
 */
const FACT_ROW_TRACK_EM = 1;

/**
 * A division fact of a skill that is not div_facts prints ACROSS ("24 ÷ 6 = ___") when its
 * notation is across. div_facts' own forms (`divForm`) never do on fact rows (owner ruling
 * 2026-10-30): Standard and Vertical are the stacked ÷ fact in the vertical rows, Long division
 * and Fraction (and Mix, which deals them with Standard) their fact-rows drawings (`formRows`).
 */
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
/** The operations of a section ('add' | 'subtract' | 'multiply' | 'divide'). */
const opsOf = (items) => new Set(items.map((it) => opOf(it.q || {})));
/**
 * A fact-rows section that MIXES operations with div_facts' written forms (owner ruling 2026-10-31:
 * "mix the fraction, division sign and long division on the fast facts together with the
 * multiplication, division, subtraction and addition fast facts, OR have them on their own"): its
 * forms - 'standard' for every stacked fact (+ - x and the ÷ sign), 'long' and 'fraction' for the
 * brackets and fractions - else null. Every ÷ item must be a div_facts item (its `divForm`); a ÷
 * fact of another skill keeps the across page.
 */
export function mixedForms(items) {
    if (!items.length || opsOf(items).size < 2 || !opsOf(items).has('divide')) return null;
    if (!items.filter((it) => opOf(it.q || {}) === 'divide').every((it) => formOf(it))) return null;
    if (!items.every((it) => OP_SIGN[opOf(it.q || {})] && operandsOf(it.q || {}).length === 2)) return null;
    return new Set(items.map((it) => (/^(long|fraction)$/.test(formOf(it)) ? formOf(it) : 'standard')));
}
/** Is this item drawn in a written form (bracket or fraction) rather than stacked, on a fact-rows page? */
const isFormItem = (it) => opOf(it.q || {}) === 'divide' && /^(long|fraction)$/.test(formOf(it));
/** The stacked ink (em) of one fact on its own tracks (a mixed page: + - x on theirs, ÷ on its tight track). */
function stackItemInkEm(it, n) {
    const o = operandsOf(it.q || {});
    return factOpTrackEm(n, o[1], OP_SIGN[opOf(it.q || {})]) + n * FACT_TRACK_EM;
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

/* ---------------------------------- ÷ facts at 5 to 10 columns (owner ruling 2026-10-30) */
//
// The owner's ruling (2026-10-30): a page of division facts reaches the full 10 columns of the
// fact rows in ALL THREE notations - the ÷ sign, the fraction and the long-division bracket - at
// Size S Auto and whenever the teacher picks 10 columns, at any size. Each form takes the
// vertical-fact grammar (the problem on top, the answer under it or, for the bracket, above it,
// in the column's own width), at the column's ladder digit (PT-FRW-1), never below the Size S fact
// digit (16 pt), and passes the real-fit gate: drawn ink + 1 mm of white each side (FIT_CLEAR_MM).
//
//   ÷ sign     stacked like + - x: dividend, "÷ divisor" under it, the rule, the answer row; a 3-digit
//              dividend over a shorter divisor takes the 0.62 em ÷ track (cells/fact.js
//              FACT_DIV_OP_TRACK_TIGHT_EM): (0.62 + 3 x 0.72) em = 15.7 mm at 16 pt in an 18.0 mm cell
//   fraction   the dividend over the divisor on a 1.5 pt bar, "=" beside the bar, the answer line under
//              them, centred (cells/equation.js FRAC_ROW_*): 144 over 12 is 15.0 mm of ink at 16 pt
//   bracket    the divisor, a narrow arc and the vinculum over the dividend, the quotient written above:
//              digit tracks from a ladder of 1.0 down to 0.54 em and a gutter of 0.6 track less 0.15 em
//              (BRACKET_TRACKS, bracketGutterEm), the largest that fits: "12 ) 144" is 15.8 mm of ink
//              at 16 pt (0.54 em tracks, 0.17 em gutter)
//
// Columns are never dropped while a form fits the column at its rung; Mix draws every form at one
// rung in one cell height, one third of each.

/** Size S's fact digit: the floor of a ÷ fact on a fact-rows page (owner ruling 2026-10-30). */
const FLOOR_PT = SIZES.S.digitPt;
/** The bracket's digit track (em) on a fact-rows page: the largest of these that fits the column. */
const BRACKET_TRACKS = [1, 0.9, 0.8, 0.72, 0.64, 0.58, 0.55, 0.54];
/** The bracket's gutter (em) for a digit track of `t` em: 0.6 track less 0.15, between 0.17 and 0.45. */
export const bracketGutterEm = (t) => Math.min(0.45, Math.max(0.17, 0.6 * t - 0.15));
/**
 * The ink width (em) of a bracket fact drawn on tracks of `t` em with a gutter of `g` em: from the
 * divisor's first digit's ink (a glyph centred on its track) to the vinculum's end, which is the
 * end of the dividend's last track. The template centres this ink in the cell (bracketLeadEm).
 */
export function bracketInkEm(divisor, dividend, t, g) {
    return (String(divisor).length + String(dividend).length) * t + g - bracketLeadEm(divisor, t);
}
/** The ink width (em) of a fraction fact: the bar over `digits` digits with its pads, the gap, "=". */
const fractionInkEm = (digits) => digits * DIGIT_ADV_EM + 2 * FRAC_ROW_PAD_EM + FRAC_ROW_GAP_EM
    + (FRAC_ROW_EQ_EM / 2 - DIGIT_ADV_EM / 2 + 0.53);
/** The ink width (em) of a stacked ÷ fact of `n` tracks: the rule spans the operator and the digits. */
const stackedInkEm = (n, b) => factOpTrackEm(n, b, '/') + n * FACT_TRACK_EM;

/**
 * The geometry of a division-forms row at `cols` columns and `pt` digits, or null when a form of
 * the section does not fit its column with FIT_CLEAR_MM of white: the bracket's track and gutter
 * (em), the fraction's answer line (mm), the widest ink (mm).
 */
export function rowGeometry(items, forms, cols, pt, size, look) {
    const em = EM_MM[pt] || (pt / 72) * 25.4;
    const { inner } = cellWidthMm(cols, LIVE_W_MM, look);
    const room = inner - FIT_CLEAR_MM;
    const n = tracksOf(items);
    const ops = (f) => items.filter((it) => formOf(it) === f).map((it) => operandsOf(it.q || {}));
    let ink = 0;
    const out = { pt, cols, inner, tracks: n };
    if ((forms.has('standard') || forms.has('vertical')) && opsOf(items).size > 1) {
        // a mixed page: each stacked fact on its own tracks (an addition fact keeps 2 beside 144 ÷ 12's 3)
        const w = Math.max(...items.filter((it) => !isFormItem(it)).map((it) => stackItemInkEm(it, tracksOf([it])))) * em;
        if (w > room) return null;
        ink = Math.max(ink, w);
    } else if (forms.has('standard') || forms.has('vertical')) {
        const bMax = Math.max(1, ...items.map((it) => String(operandsOf(it.q || {})[1] || '').length));
        const w = stackedInkEm(n, '9'.repeat(bMax)) * em;
        if (w > room) return null;
        ink = Math.max(ink, w);
    }
    if (forms.has('fraction')) {
        const digits = Math.max(1, ...ops('fraction').map((o) => Math.max(String(o[0] || '').length, String(o[1] || '').length)));
        const w = fractionInkEm(digits) * em;
        if (w > room) return null;
        ink = Math.max(ink, w);
        const ansDigits = Math.max(2, ...items.filter((it) => formOf(it) === 'fraction').map((it) => String(answerOf(it)).length));
        // the band's blank width (SL-6), capped at the column's room so the line keeps 1 mm each side
        out.lineMm = Math.floor(Math.min(blankWidth(ansDigits, size), room) * 10) / 10;
    }
    if (forms.has('long')) {
        // Each bracket takes the gutter its arc aims at (0.6 mm of white before the dividend's first
        // digit's ink), within the room; a track is refused when any fact would keep less than the
        // floor (0.3 mm) there (critic r1 R1-1, owner 2026-10-31: the arc never touches or crowds a digit).
        const os = ops('long');
        // (0.01 mm under the room: the ink is reported to 0.01 mm and must still fit when rounded up)
        const roomL = room - 0.01;
        const roomEm = roomL / em;
        // ... and its drawn box (the tracks and the gutter, wider than the ink by the divisor's lead) inside
        // the cell too (PG-12: "10 ) 110" on 1 em tracks at 5 columns stood 0.5 mm out of its cell)
        // (the box is shifted left by half the lead to centre the ink: box + lead fits the cell)
        const boxOk = (o, tt) => ((String(o[1]).length + String(o[0]).length) * tt + compactGutterEm(o[1], o[0], tt, em, roomEm) + bracketLeadEm(o[1], tt)) * em <= inner - 0.2;
        const t = BRACKET_TRACKS.find((tt) => os.every((o) => compactFits(o[1], o[0], tt, em, roomEm) && boxOk(o, tt)));
        if (!t) return null;
        out.trackEm = t;
        out.roomMm = Math.floor(roomL * 1000) / 1000;
        const gs = os.map((o) => compactGutterEm(o[1], o[0], t, em, roomEm));
        out.gutterEm = Math.max(...gs);
        ink = Math.max(ink, ...os.map((o, i) => compactInkEm(o[1], o[0], t, gs[i]) * em));
    }
    out.inkMm = Math.round(ink * 100) / 100;
    return out;
}

/** Height (mm) a row of these forms needs at the geometry's digit size: the tallest form's. */
function rowFormHeightMm(forms, geo, size, labels, cols) {
    const em = EM_MM[geo.pt] || (geo.pt / 72) * 25.4;
    const sz = SIZES[size] || SIZES.L;
    // the number tab's keep-out over a top cell (CL-40), as the + - x rows keep it
    const padTop = Math.max(factPadTop(labels, cols), sz.tabMm + 1);
    let h = 0;
    // the stacked ÷: the + - x fact's own need (factRowsLayout)
    if (forms.has('standard') || forms.has('vertical')) h = Math.max(h, padTop + 2.3 * em + 2.1 + Math.max(1.15 * em, sz.writeMm) + 2);
    // the fraction: two digit lines over and under the 1.5 pt bar, the 0.12 em gap, the answer line
    if (forms.has('fraction')) h = Math.max(h, padTop + 2.42 * em + 0.6 + sz.writeMm + 3);
    // the bracket (write-above, centred down the cell, CL-4b): the quotient zone and the bracket row
    if (forms.has('long')) h = Math.max(h, 2 + ((SLOT.digitStripMm || {})[size] || sz.writeMm) + 1.33 * em + 2 + 2);
    return Math.ceil(h * 10) / 10;
}

/**
 * The page for a section of division facts in their written forms (div_facts `divForm`: a bracket
 * or a fraction, alone or in Mix): Auto 10 / 6 / 5 columns (PT-FRW-2) or the teacher's count, at
 * the column's ladder digit (PT-FRW-1), every form in its fact-rows drawing (above). Should a form
 * not fit its column even at 16 pt, the page drops a column and says so. Rows: floor((G - 1) / h)
 * with h the tallest form's need, stretch cap 1.3. Mix deals its forms in thirds (within one on a full page).
 */
function formRows(items, input, ctx, G, labels, forms) {
    let asked = input.columns && input.columns !== 'auto' ? Math.max(2, Math.min(10, Number(input.columns) || 5)) : AUTO[ctx.size];
    // a page mixing operations (owner ruling 2026-10-31): one grid, the columns the narrowest form
    // fits; a + - x answer over 99 keeps its 8-column clamp (PT-FRW-5)
    const mixed = opsOf(items).size > 1;
    const notes = [];
    if (mixed && asked > 8 && (input.__clamp8 || items.some((it) => opOf(it.q || {}) !== 'divide' && Number(answerOf(it)) > 99))) { asked = 8; notes.push('Answers over 99: at most 8 columns (PT-FRW-5).'); }
    // The long-division bracket prints at 8 columns at most (owner 2026-10-31, revised Q3; critic r2 R2-1): at 10 the
    // arc keeps 0.5 mm of white on one side only. A Mix page or a mixed page with any bracket fact takes its grid.
    if (forms.has('long') && asked > 8) { asked = 8; notes.push('Long division: at most 8 columns, so the bracket keeps white on both sides.'); }
    let geo = null;
    let cols = asked;
    for (; cols >= 2; cols--) {
        const rung = factDigitPt(Math.max(cols, 5));
        for (const pt of [...new Set([rung, ...LADDER_PTS])].filter((p) => p <= rung && p >= FLOOR_PT).sort((a, b) => b - a)) {
            geo = rowGeometry(items, forms, cols, pt, ctx.size, ctx.look);
            if (geo) break;
        }
        if (geo) break;
    }
    cols = Math.max(2, cols);
    if (!geo) geo = { pt: FLOOR_PT, cols, tracks: tracksOf(items), trackEm: 0.54, gutterEm: 0.17, lineMm: 14 };
    const pt = geo.pt;
    const em = EM_MM[pt] || (pt / 72) * 25.4;
    if (cols < asked) notes.push(`${mixed ? 'Facts' : 'Division facts'}: ${cols} columns so every fact fits its cell.`);
    if (pt < factDigitPt(Math.max(cols, 5))) notes.push(`Digits ${pt} pt so every form fits ${cols} columns.`);
    const h = rowFormHeightMm(forms, geo, ctx.size, labels, cols);
    const rows = Math.max(1, Math.floor((G - SAFETY_H_MM) / h));
    let perPage = cols * rows;
    // Whole rows, every cell of the lattice dealt (critic r1 R1-2 / RUBRIC C3: no re-laid short last row, no
    // blank run, L-DENSITY GRID-EVEN and HOLE): a Mix page deals its forms in blocks of three, so its thirds
    // agree within one (70 facts: 24 / 23 / 23).
    const names = [...forms].map((f) => ({ long: 'bracket', fraction: 'fraction', standard: mixed ? 'stacked' : 'stacked ÷', vertical: 'stacked ÷' }[f] || f)).join(' + ');
    notes.unshift(`${mixed ? 'Facts' : 'Division facts'} as written (${names}): ${cols} columns x ${rows} rows.`);
    const row = {
        trackMm: geo.trackEm ? Math.round(geo.trackEm * em * 1000) / 1000 : 0,
        gutterMm: geo.gutterEm ? Math.round(geo.gutterEm * em * 1000) / 1000 : 0,
        roomMm: geo.roomMm || 0,
        lineMm: geo.lineMm || 0,
        inkMm: geo.inkMm || 0,
    };
    return { across: false, forms, row, cols, rows, perPage, cellH: Math.min(G / rows, h * 1.3), hMin: h, digitPt: pt, tracks: geo.tracks || tracksOf(items), gridH: G, labels, mixed, note: notes.join(' ') };
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

/**
 * The largest point size from the column's ladder rung down to `floor` (the size's working digits)
 * at which the widest vertical fact fits its cell (verticalPt's width formula); 0 when none does.
 * Below 5 columns the rung is the size's Auto one (16 / 24 / 28 pt at S / M / L): the cell's
 * height (FACT_CELL_H_MM) is the Auto page's, so a bigger digit would stand out of it.
 */
function verticalFitPt(cols, n, look, floor, size, clearMm = 5) {
    const { inner } = cellWidthMm(cols, LIVE_W_MM, look);
    const top = cols >= 5 ? factDigitPt(cols) : Math.min(factDigitPt(5), factDigitPt(AUTO[size] || 5));
    const pts = [...new Set([top, ...LADDER_PTS, floor])].filter((p) => p <= top && p >= Math.min(floor, top)).sort((a, b) => b - a);
    for (const pt of pts) {
        if ((FACT_OP_TRACK_EM + n * FACT_TRACK_EM) * (EM_MM[pt] || (pt / 72) * 25.4) + clearMm <= inner) return pt;
    }
    return 0;
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
    // (input.__clamp8: the page was dealt for the band's 3-digit answers - see plan, R2-2 COUNT-FITS)
    const n = Math.max(tracksOf(items), input.__clamp8 && items.some((it) => opOf(it.q || {}) !== 'divide') ? 3 : 0);
    const labels = labelStyleOf(ctx.look, input.labels);
    const forms = divForms(items) || mixedForms(items);
    if (forms) return formRows(items, input, ctx, G, labels, forms);
    // div_facts Standard ("12 ÷ 3 = __") and Vertical: on a fact-rows page both are the STACKED ÷
    // fact (owner ruling 2026-10-30: the ÷ sign reaches 10 columns; the across sentence of a 3-digit
    // dividend is 28 mm at 16 pt and cannot fit a 5-column cell at its rung, let alone 10).
    const divStacked = items.length > 0 && items.every((it) => opOf(it.q || {}) === 'divide' && /^(standard|vertical)$/.test(formOf(it)));
    if (isAcross(items) && !divStacked) {
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
    // (input.__clamp8: the page was dealt for the 8-column clamp, see plan / R2-2)
    if ((big || input.__clamp8) && cols > 8) { cols = 8; note = 'Answers over 99: at most 8 columns (PT-FRW-5).'; }
    // A 3-digit operand (a vertical division fact's dividend: 144 ÷ 12) needs a fourth track: the
    // page drops columns until the ladder's own digit size fits, rather than shrink the digits
    // (PG-20: content never shrinks to fit).
    const askedCols = cols;
    const divide = items.some((it) => opOf(it.q || {}) === 'divide');
    // The drawn width of a stacked ÷ fact: the operator's track (0.62 em when a 3-digit dividend sits
    // over a shorter divisor, cells/fact.js FACT_DIV_OP_TRACK_TIGHT_EM) and n tracks of 0.72 em, the
    // rule under all of them. The real-fit gate (FIT_CLEAR_MM, 1 mm of white each side) at the
    // column's own rung: it holds at 5, 6, 8 and 10 columns (owner ruling 2026-10-30: ÷ facts reach
    // 10 columns), so the page keeps its columns and its digits (PG-20: content never shrinks).
    const bMax = Math.max(1, ...items.map((it) => String(operandsOf(it.q || {})[1] || '').length));
    const divInk = (c) => { const pt = factDigitPt(c); return stackedInkEm(n, '9'.repeat(bMax)) * (EM_MM[pt] || (pt / 72) * 25.4); };
    const fitsAt = (c) => divInk(c) + FIT_CLEAR_MM <= cellWidthMm(c, LIVE_W_MM, ctx.look).inner;
    const tightDiv = divide;
    while (tightDiv && cols > 2 && !fitsAt(cols)) cols--;
    if (cols < askedCols) note = [note, `${n}-digit numbers: ${cols} columns so the digits keep their size.`].filter(Boolean).join(' ');
    // A long + - x fact (5-6 digits: sub_100k_regroup, sub_1m_regroup) that does not fit its cell
    // at the size's working digits drops columns until it does (PG-20: content never shrinks to
    // fit; print-lint ILLEGIBLE / PG-12 at 16 pt in 8 columns). Division keeps its own path above.
    // Only 5-6-digit facts (owner, 2026-10-24: "big sums only"); x12 and other short facts keep
    // their columns and step the digits down the ladder (ws-layout-unit VA-2).
    const bigFact = !divide && n >= 5;
    if (bigFact) {
        const floor = (SIZES[ctx.size] || SIZES.L).digitPt;
        const before = cols;
        while (cols > 2 && verticalFitPt(cols, n, ctx.look, floor, ctx.size) === 0) cols--;
        if (cols < before) note = [note, `${n}-digit facts: ${cols} columns so the digits keep the ${ctx.size} size.`].filter(Boolean).join(' ');
    }
    // A shorter fact steps its digits down the ladder first (VA-2); when even the ladder's last rung
    // does not fit the cell (critic s3-stack r2 F1: 4-digit sub_10k facts in 8 columns at S, ink on
    // both frames), it drops columns too, instead of printing past its cell. This gate tests REAL
    // fit - the fact's drawn width plus 1 mm of clearance each side (critic r3 R1: the 5 mm rung
    // budget used as a column gate cost add_facts / sub_facts their Auto 10 at S, and overrode an
    // explicit teacher choice, though the facts fit with 1.7-4.4 mm to spare).
    const lastRung = LADDER_PTS[LADDER_PTS.length - 1];
    if (!divide && !bigFact) {
        const before = cols;
        while (cols > 2 && verticalFitPt(cols, n, ctx.look, lastRung, ctx.size, FIT_CLEAR_MM) === 0) cols--;
        if (cols < before) note = [note, `${n}-digit facts: ${cols} columns so every fact fits its cell.`].filter(Boolean).join(' ');
    }
    const pt = tightDiv && fitsAt(cols) ? factDigitPt(cols)
        : (bigFact && verticalFitPt(cols, n, ctx.look, (SIZES[ctx.size] || SIZES.L).digitPt, ctx.size)) || verticalPt(cols, n, ctx.look);
    if (pt < factDigitPt(cols)) note = [note, `Digits ${pt} pt so ${n}-digit facts fit ${cols} columns.`].filter(Boolean).join(' ');
    const cap = factRowsCapacity(cols, ctx.size, ctx.paper, header);
    // The row height holds the WHOLE fact (critic s3-stack r1, lead item 6: VA-70's S heights left
    // the answer row out, so at S 10 x 9 the last row had no writing room and the key's answers
    // printed under the grid): the number tab's keep-out (tab + 1 mm, CL-40), the two operand rows
    // (1.15 em each), the rule (1 mm gap + 1 mm), the answer row - 1.15 em, at least the size's
    // writing height - and the 2 mm bottom pad, as the page measures them (S 28.5, M 39.2, L 45.1
    // mm content). The row count is chosen from that height.
    const dMm = EM_MM[pt] || (pt / 72) * 25.4;
    const sz = SIZES[ctx.size] || SIZES.L;
    const padTop = Math.max(factPadTop(labels, cols), sz.tabMm + 1);
    // (L keeps PT 4.1's 5 x 5: its 45.2 mm need fits 5 rows of 45.4 mm; the 0.4 mm grid rule leaves
    // a 45.0 mm box, so a 2-digit key answer reaches 0.1-0.2 mm into the 2 mm bottom pad there)
    const need = padTop + 2.3 * dMm + 2.1 + Math.max(1.15 * dMm, sz.writeMm) + 2;
    const hMin = Math.max(cap.cellH, Math.ceil(need * 10) / 10);
    const rows = Math.max(1, Math.floor((G - SAFETY_H_MM) / hMin));
    return { across: false, cols, rows, perPage: cols * rows, cellH: Math.min(G / rows, hMin * 1.3), hMin, digitPt: pt, tracks: n, gridH: G, labels, note };
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
        // A fixed count (the probe's 20) is laid in a column count that DIVIDES it, so every cell
        // keeps one width and no hole is left in the last row (Lane D r2 precritic, H13: 20 Mix
        // facts in 3 columns left cell 20 alone, re-laid 1.5 columns wide). The rung stays the
        // Standard rows' 20 pt where a divisor holds it, else the next ladder rung down (the
        // bracket "144 / 12" is 49 mm at 20 pt, a quarter of the page is 46 mm).
        // (more columns first: 2 x 10 holds the 20 pt rung at S but pins every across fact to the
        // left of a half-page cell, H13 - so 2 columns is left to the fallback below)
        for (let cols = Math.min(maxCols, 5); cols >= 3; cols--) {
            if (count % cols) continue;
            for (const pt of LADDER_PTS.filter((p) => p <= MIX_RUNG_PT)) {
                const { inner } = cellWidthMm(cols, LIVE_W_MM, ctx.look);
                const rows = count / cols;
                const h = formHeightMm(forms, pt, ctx.size, cols);
                if (formWidthMm(items, forms, pt, ctx.size) > inner || rows * h > G - SAFETY_H_MM) continue;
                return { forms, cols, rows, perPage: cols * rows, cellH: (G - SAFETY_H_MM) / rows, hMin: h, digitPt: pt, size: ctx.size, look: ctx.look };
            }
        }
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
 * Does a stacked ÷ fact's first dividend digit fall under the number tab's keep-out (tab side +
 * 1 mm, CL-40)? The fact is centred in its column: its first digit stands the operator's track
 * (0.62 em beside a 3-digit dividend, cells/fact.js) plus its own side bearing (about 0.1 em) in
 * from the fact's left edge.
 */
function divUnderTab(L, n = L.tracks) {
    const em = EM_MM[L.digitPt] || (L.digitPt / 72) * 25.4;
    const { inner } = cellWidthMm(L.cols, LIVE_W_MM, L.look || DEFAULT_LOOK);
    const opEm = factOpTrackEm(n, '9'.repeat(Math.max(1, n - 1)), '/');
    const firstX = (inner - (opEm + n * FACT_TRACK_EM) * em) / 2 + (opEm + 0.1) * em;
    return firstX < ((SIZES[L.size] || SIZES.L).tabMm || 4) + 1 + 0.3;
}

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
    // A fact-rows page (L.row, owner ruling 2026-10-30): Standard and Vertical are the stacked ÷
    // fact below; the bracket and the fraction take the row's narrow geometry.
    if (L.forms && !(L.row && (L.mixed ? !isFormItem(it) : /^(standard|vertical)$/.test(formOf(it))))) {
        // the item's OWN cell (bracket, fraction or across), at the page's point size and tracks
        const rowM = L.row ? { factRowTrack: L.row.trackMm, factRowGutter: L.row.gutterMm, factRowRoom: L.row.roomMm, factRowLineMm: L.row.lineMm }
            : L.forms.size > 1 ? { factRowTrack: (EM_MM[L.digitPt] || (L.digitPt / 72) * 25.4) * FACT_ROW_TRACK_EM } : {};
        const metrics = Object.assign({}, metricsFor(L.size || 'L', L.look || DEFAULT_LOOK, { factColumns: L.cols }),
            { digitPt: L.digitPt, ...rowM });
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
    // (a page mixing operations: each stacked fact on its own tracks, see rowGeometry)
    const tracks = L.mixed ? tracksOf([it]) : L.tracks;
    const payload = { a: o[0], b: o[1], op, ans: Number.isFinite(Number(ans)) && ans !== '' ? Number(ans) : undefined, columns: L.cols, pt: L.digitPt, digits: tracks,
        // CL-40: a stacked ÷ fact's narrow operator track (0.62 em) puts a 3-digit dividend's first
        // digit 5.7 mm in from the cell's edge, under the M / L number tab's keep-out (6 / 7 mm) at
        // 10 columns: it starts below the keep-out instead (the row height already holds it).
        padTop: op === '/' && L.labels === 'tab' && divUnderTab(L, tracks) ? Math.max(factPadTop(L.labels, L.cols), ((SIZES[L.size] || SIZES.L).tabMm || 4) + 1)
            : factPadTop(L.labels, L.cols),
        // a fact-rows page is a fact drill: a 3+-track sum stays a fact in 4 columns or fewer too
        // (cells/fact.js drawsStack turns it into the regroup stack on a practice page)
        ...(op === '+' ? { regroup: false } : {}) };
    const q2 = Object.assign({}, q, { cell: { template: 'fact', payload, v: 1 } });
    // CL-4b on fact rows (owner decision 2026-10-24 (3)): a 5-6-digit + - x fact whose working
    // carries or exchanges is written ABOVE, so its cell is centred down the box like the same item
    // on a practice page; every other fact starts at the top. Read from the digits, never the skill.
    const sign = { '+': '+', '-': '-', x: 'x' }[op];
    const wa = !!sign && Number(tracks) >= 5 && needsRegroup({ op: sign, a: o[0], b: o[1] }, Number(tracks) + 2);
    return Object.assign({}, it, {
        q: q2,
        template: 'fact',
        render: (c) => {
            const html = renderCell(q2, Object.assign({}, c, { columns: L.cols, options: Object.assign({}, c.options || {}, { factColumns: L.cols }) }));
            return wa ? markWriteAbove(html) : html;
        },
        key: cellAnswerKey(q2),
        drawsAnswer: true, visual: false, cellCls: '',
    });
}

/**
 * The items a page keeps. A page mixing operations is dealt skill by skill, and its layout can come out
 * smaller than the count it was dealt for (a 12 x 11 = 132 dealt after the probe brings PT-FRW-5's
 * 8-column clamp): it then keeps each operation's share of the page, in dealt order, so the last skill
 * (the ÷ facts) is never the one cut. Every other page keeps its first `perPage` items.
 */
function keepShares(all, L) {
    if (!L.mixed || all.length <= L.perPage) return all.slice(0, L.perPage);
    const key = (it) => `${(it.q || {}).categoryId}:${(it.q || {}).skillId}`;
    const counts = new Map();
    for (const it of all) counts.set(key(it), (counts.get(key(it)) || 0) + 1);
    const keys = [...counts.keys()];
    const quota = new Map(keys.map((k) => [k, Math.floor((L.perPage * counts.get(k)) / all.length)]));
    let left = L.perPage - [...quota.values()].reduce((a, b) => a + b, 0);
    // the remainder to the largest fractional shares, in dealt order on a tie
    const rest = keys.map((k) => [k, (L.perPage * counts.get(k)) / all.length - quota.get(k)]).sort((a, b) => b[1] - a[1]);
    for (const [k] of rest) { if (left <= 0) break; quota.set(k, quota.get(k) + 1); left--; }
    const used = new Map();
    return all.filter((it) => { const k = key(it); const u = used.get(k) || 0; if (u >= quota.get(k)) return false; used.set(k, u + 1); return true; });
}

export function plan(input = {}) {
    const ctx = ctxOf(input, DEFAULT_LOOK);
    const all = poolItems(input, 'main');
    let L0 = factRowsLayout(all, input);
    // COUNT-FITS (critic r2 R2-2): the count was dealt from the layout of a probe deal; when the probe brought
    // PT-FRW-5's 8-column clamp (a product over 99) and this deal did not, the page would lay the 8-column count
    // in 10 columns ("Score /56" in a grid said to hold 70), or 48 facts in a 56-cell grid (3 tracks set the
    // digits, so the rows). The layout follows what was dealt for: a deal short of the page is laid as the
    // band's 3-digit page when that holds it, so printed = cols x rows = Score /N on every seed.
    if (all.length < L0.perPage && !input.__clamp8) {
        const L8 = factRowsLayout(all, Object.assign({}, input, { __clamp8: true }));
        if (L8.perPage <= all.length) L0 = L8;
    }
    // ... and the other way round (a probe without a product over 99 dealt 48 facts at 18 pt in 8 x 6; this deal
    // has one, so 3 tracks at 16 pt hold 8 x 7): whole rows of what was dealt, each row as tall as the page lets
    // it be (the 1.3 stretch cap), so the grid says what it prints.
    if (all.length < L0.perPage && all.length >= L0.cols && all.length % L0.cols === 0 && all.length / L0.cols >= L0.rows - 2) {
        const rows = all.length / L0.cols;
        L0 = Object.assign({}, L0, { rows, perPage: all.length, cellH: Math.min(L0.gridH / rows, L0.hMin * 1.3) });
    }
    const L = Object.assign({}, L0, { size: ctx.size, look: ctx.look });
    const items = keepShares(all, L).map((it) => factCell(it, L));
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Facts', title: factTitle(items), score: items.length });
    const rows = Math.max(1, Math.ceil(items.length / L.cols));
    // one cell width per section (critic r1 R1-2): a short last row keeps the lattice, the rest unruled (PG-15)
    const grid = Object.assign(gridPart(items.map((it) => planItem(it, { cols: L.cols })), { cols: L.cols, rows, cellH: L.cellH, labels: L.labels, start: 1, cls: 'facts' }), { relay: false });
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
