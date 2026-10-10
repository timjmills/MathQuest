// js/modules/sheet/cells/count-row.js
// The `count-row` template: ONE row of a count (count_by_tables: "Count by 1-12") or of a number
// pattern (number_patterns_rule), with the missing numbers as writing places IN the row.
//
// Two looks, one template (owner's examples, 2026-09-25):
//
//   'arcs'   the skip-count row:   [7>  7 ⌒ __ ⌒ 21 ⌒ __ ⌒ 35 ⌒ ... ⌒ __
//            The step sits in a bold boxed tab at the left of the row (a pentagon pointing into
//            the row). A hop arc joins every pair of neighbouring numbers along the top. Printed
//            numbers stand plain under the arcs; each missing number is an EMPTY writing box
//            (SL-11) in its own place, never a line under the row. Twelve numbers fit one row of
//            the 186 mm live width at every size (14 mm pitch at L), so a page stacks one row
//            per table, about ten rows at M.
//   'train'  the pattern track:   [ 5 ][   ][ 15 ][   ][   ]      Rule: add [   ] each time
//            Every number in a tile: printed ones in a 0.75 pt outline, missing ones in a
//            1.5 pt outline. An optional printed rule caption stands above the track ("Rule:
//            count on by 5."), or, when the pupil must find the rule, a rule frame with one box
//            stands under it.
//
// SHAPES (option `shape`): the tiles and boxes can be boxes, circles or hexagons (or circles and
// hexagons in turn), outlines only - see shapes.js. A shaped track that does not fit one row wraps
// to two even rows (the owner's "wrap to 2 rows of 6").
//
// Key (AK-1, AK-2): the same row with every missing number written in its box, and the rule's
// number in the rule box. In the screen twin every box carries `data-mq-cell` (one input each,
// joined ", " in reading order, the rule box last - which is what `q.ans` holds). The twin wraps
// to rows of at most six, so a box stays >= 44 px on a 390 px phone.
//
// payload: {
//   values: [n0 ..], blanks: [index, ...] (ascending), look: 'arcs' | 'train',
//   tab?: '7'                         the step tab of an 'arcs' row
//   shape?: 'box'|'circle'|'hex'|'mixed'
//   rule?: 'Rule: count on by 5.'     a printed rule caption (the rule is given)
//   ruleBox?: {pre: 'Rule: add', post: 'each time', value: '5'}   the pupil writes the rule
//   shown?: {index: value}            Error analysis: a value printed in the finished row
//   times?: 'each'|'given', labels?: ['1 × 4', ...]   (wave 1 C2) the multiplication fact under each number
//                                     (every number, or only the printed ones). A HINT: drawn black at
//                                     levels 1 and 3, grey at level 2 (Guided), and dropped at level 0
//                                     (Test, pre-skill check, review: PEDAGOGY P-7 "hints off on tests").
// }
//
// WIDE NUMBERS (wave 1 C2). A box is as wide as the widest number ("1,200,000"), content never
// shrinks; a row that no longer fits one line wraps to even lines (a turn arrow leaves and enters
// each line). The step tab widens with its text ("−25,000").
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, digitPt, textPt, zonePt, sizeOf, inkOf, isTwin, S, SW, PT_MM, n2, KEY_FEATURES } from './k2kit.js';
import { tile, tileSize, shapeAt } from './shapes.js';

/** The widest box pitch of an 'arcs' row (mm), and the narrowest box a size may print. */
const PITCH = { S: 13.5, M: 14, L: 15.5 };
const MIN_BOX = { S: 11, M: 11.5, L: 14 };
// R3: wide enough for a two-digit step ("12" ran out of the pentagon at 11 mm).
const TAB_MM = { S: 12, M: 12.5, L: 13.5 };
const GAP_MM = 1.5;
/** The width a one-column cell gives its content (186 mm less the cell's pads). */
const LIVE_MM = 172;
const COMPACT_LIVE_MM = 178;  // the one-page sheet's single full-width column (critic round 4, H)
const COMPACT_GAP_MM = 2.8;    // room for the short jump arrow between boxes (owner 2026-10-03); count-rows.js S_GAP matches
/** Most boxes in one row of the screen twin: four (and the step tab) fit a 390 px phone at >= 44 px a box. */
const TWIN_ROW = 4;
const TWIN_GAP_MM = 7;   // the screen twin's widest gap between count-by columns (~24 px at the card's 3.4 px/mm)

/**
 * Item 7 (wave 1): a count row placed in a cell narrower than the full line - the Opener's and the Scripted Model's
 * Model cell, half the page wide - wraps to THAT cell's width (more, shorter lines), never shrinking its digits for it.
 * Only a print cell of 2+ columns narrows; the one-column sheets, the one-page sheet and the screen twin keep their line.
 * A one-page (compact) row placed in such a cell (critic r1 D5) draws as the ordinary row there: the compact single line is the
 * one-page SHEET's layout, which only a full-width one-column cell holds.
 */
const narrowCols = (p, ctx) => (ctx && ctx.wrapToCell && !p.noWrap && !isTwin(ctx) && Number(ctx.columns) > 1 ? Number(ctx.columns) : 1);
const narrowLive = (p, ctx, live) => { const c = narrowCols(p, ctx); return c > 1 ? Math.min(live, 186 / c - 14) : live; };
/** The fewest even lines whose numbers keep `boxW` mm each (and `gap` between) in `avail(rows)` mm. */
function wrapRows(n, rows0, boxW, gap, avail) {
    for (let rows = rows0; rows <= n; rows++) {
        const per = Math.ceil(n / rows);
        if (per * boxW + (per - 1) * gap <= avail(rows) + 1e-6) return { rows: Math.ceil(n / per), perRow: per };
    }
    return { rows: n, perRow: 1 };
}
/** The one-page sheet's air above and below a row; none where the role sizes the cell to the row (opener, critic r2 N4). */
const vpadOf = (p, ctx) => (ctx && ctx.tightRows ? 0 : Number(p.vpad) > 0 ? Number(p.vpad) : 0);
const fmt = (v) => (Number.isFinite(Number(v)) && String(v).trim() !== '' ? Number(v).toLocaleString('en-US') : String(v));
const maxDigits = (p) => Math.max(1, ...(p.values || []).map((v) => fmt(v).length));
const lvlOf = (ctx) => (ctx && Number.isFinite(ctx.scaffoldLevel) ? ctx.scaffoldLevel : 1);
/** The multiplication label drawn under number `i`, or '' (none): a hint, so never at level 0. */
function labelAt(p, ctx, i) {
    if (!Array.isArray(p.labels) || !p.times || p.times === 'none' || p.look === 'train' || lvlOf(ctx) < 1) return '';
    if (p.times === 'given' && (p.blanks || []).map(Number).includes(i)) return '';
    return String(p.labels[i] === undefined ? '' : p.labels[i]);
}

/**
 * The geometry of one render: box size, pitch, how many numbers stand in a row. An 'arcs' row
 * of twelve stands on ONE line when its boxes can stay at least MIN_BOX wide (S and M: a page of
 * about ten tables); otherwise (L, or a shaped track) it wraps to two even lines of six, so no box
 * is ever squeezed below the size's writing width (RUBRIC H9: 14 mm at L).
 */
function geom(p, ctx) {
    const p0 = p;
    if (p.compact && narrowCols(p, ctx) > 1) p = Object.assign({}, p, { compact: false, fullPt: true });   // keeps the one-page sheet's digit size
    const size = sizeOf(ctx);
    const n = (p.values || []).length || 1;
    const look = p.look === 'train' ? 'train' : 'arcs';
    const shape = p.shape || 'box';
    // "1,000" needs a wider box; R3 (critic round 3): on a pattern track so does a 3-digit number
    // (152, 227), which filled a 14 mm tile edge to edge in the key's bold. A count-by row keeps
    // one box width for every table, so the rows of a page line up.
    let wide = Math.max(0, maxDigits(p) - (look === 'train' ? 2 : 3)) * 3;
    const gap = p.compact ? COMPACT_GAP_MM : GAP_MM;
    // The step tab grows with its text ("−25,000"): the pentagon's point and padding plus the digits at the tab's own size.
    const tabPtEst = Math.min(digitPt(ctx) * (p.compact || p.fullPt ? 1 : 0.64) * 1.05, 20);
    const tabLen = String(p.tab || '').length;
    const tabBody = look === 'arcs' && p.tab ? (tabLen <= 2 ? TAB_MM[size] : Math.max(TAB_MM[size], tabLen * 0.6 * tabPtEst * PT_MM + 7)) : 0;
    const tab = tabBody ? tabBody + 2 : 0;
    // The multiplication label ("12 × 25") is at least as wide as its text: the box widens so neighbouring labels never touch.
    const lblPt = Math.max(8, zonePt(ctx));
    let lblChars = 0;
    for (let i = 0; i < n; i++) lblChars = Math.max(lblChars, labelAt(p, ctx, i).length);
    const hasLbl = lblChars > 0;
    const lblH = hasLbl ? lblPt * PT_MM * 1.2 + 0.9 : 0;
    if (hasLbl && look !== 'arcs') wide = Math.max(wide, lblChars * 0.6 * lblPt * PT_MM + 0.8 - gap - 14);
    // compact (12 tables on one page): less chrome, never smaller digits. Critic round 4 (H): the page had
    // about 30 mm spare under row l, so the boxes take it - taller (+3 mm, the most Letter still holds on one page) and wider (the one-column cell's
    // full 178 mm line), so 108 / 121 / 144 sit with clear space in the pupil's box and in the key.
    // owner 2026-10-03: the arcs are gone, so the one-page sheet gives their 3 mm to the boxes (the page stays as full as before)
    const baseH = S(ctx).writeMm + (p.compact ? 6.4 : 2.5);
    const live = narrowLive(p, ctx, p.compact ? COMPACT_LIVE_MM : LIVE_MM);
    // THE ONE-PAGE SHEET (owner 2026-10-02 ruling): "All rows on one page" keeps its compact SINGLE line of 12 numbers at the
    // size's working digit size (16 pt at S), exactly as it was. A row whose widest number (> 3 characters) cannot be written
    // on one line at FLOOR_PT shrinks its digits down to the floor first (TY-10a) and otherwise takes two lines of six.
    // critic r2 N5: in a narrow (Model) cell a long step tab ("25,000") stands on its own line above the row, so the numbers keep
    // the cell's width and wrap before they shrink; the lines below start after a short lane for the turn arrow
    const tabAbove = narrowCols(p, ctx) > 1 && look === 'arcs' && tabBody > TAB_MM[size] + 1;
    const above = (g) => (g && tabAbove ? Object.assign(g, { tabAbove: true }) : g);
    if (look === 'arcs' && p.lines) return above(linesGeom(p, ctx, { size, n, tabBody, tab: tabAbove ? IN_MM : tab, live, lblPt, lblChars, hasLbl, lblH }));
    if (look === 'arcs' && p.compact && shape === 'box') {
        // Owner 2026-10-03: each box is its MINIMUM writing width (the widest number at the working size + a margin, never under
        // COMPACT_MIN_BOX) and the rest of the line is the gaps, so every jump arrow keeps >= 1 mm clear each side (COMPACT_MIN_GAP).
        // A row too wide for that (3+ digits) shrinks its digits under TY-10a, never below FLOOR_PT; otherwise two lines of six.
        const fit = compactFit(maxDigits(p), live - tab, n, digitPt(ctx), (p.blanks || []).length);
        if (fit) {
            return { size, n, look, shape, w: fit.w, h: baseH, pitch: fit.w + fit.gap, gap: fit.gap, tab, tabBody, perRow: n, rows: 1, arcH: 0, pt: fit.pt, gw: fit.gw, hasLbl, lblH, lblPt, compact: true };
        }
    }
    if (look === 'arcs') {
        const ga = above(arcsGeom(p, ctx, { size, n, shape, gap, tabBody, tab: tabAbove ? IN_MM : tab, baseH, live, lblPt, lblChars, hasLbl, lblH }));
        // a row too wide for two numbers a line even at FLOOR_PT keeps its full-line geometry: it does not fit the narrow cell
        // (measured so), and the role gives the Model the whole width instead (opener: Steps underneath, LESSONS_LEARNED L11)
        return ga || geom(Object.assign({}, p0, { noWrap: true }), ctx);
    }
    let boxW = 14 + wide;
    let perRow = n;
    const sz = shape === 'box' ? { w: boxW, h: baseH } : tileSize(shape === 'mixed' ? 'hex' : shape, boxW, baseH);
    const pitch = sz.w + gap;
    const fitN = Math.max(1, Math.floor((live - tab + gap) / pitch));
    if (fitN < perRow) perRow = Math.ceil(n / Math.ceil(n / fitN));
    if (isTwin(ctx) && perRow > TWIN_ROW) perRow = Math.ceil(n / Math.ceil(n / TWIN_ROW));
    const rows = Math.ceil(n / perRow);
    const pt = Math.min(digitPt(ctx) * (p.compact ? 1 : 0.64), 18, (sz.w - 2) / (0.56 * Math.max(2, maxDigits(p))) * 72 / 25.4);
    return { size, n, look, shape, w: sz.w, h: sz.h, pitch, gap, tab, tabBody, perRow, rows, arcH: 0, pt, hasLbl, lblH, lblPt };
}

/** The one-page sheet's single line of `n` boxes in `avail` mm: {w, gap, pt} or null (two lines). Mirrored by count-rows.js rowLines. */
// Owner / coordinator 2026-10-03: keep 12 per line; every gap holds a REAL arrow (COMPACT_ARROW_MM, the same on every row) with
// 1 mm clear each side. Only a box needs writing width; a printed number takes its glyph width (+ 0.3 mm each side).
export const COMPACT_MIN_BOX = 9, COMPACT_ARROW_MM = 2.2, COMPACT_MIN_GAP = COMPACT_ARROW_MM + 2;
/**
 * `nBox` of the `n` numbers are boxes (the rest printed). Returns {w (box), gw (printed), gap, pt} or null (two lines). The digits
 * keep the working size whenever the line holds them; only a row too full even then (very many boxes of 3+ digits) shrinks them
 * just enough under TY-10a, never below FLOOR_PT.
 */
export function compactFit(chars, avail, n, digit, nBox = n) {
    const pt0 = Math.min(digit, 18);
    const glyph = (pt) => chars * 0.56 * pt * PT_MM;
    const sizes = (pt) => ({ w: Math.max(COMPACT_MIN_BOX, glyph(pt) + 1.8), gw: glyph(pt) + 0.6 });
    const used = (pt) => { const s = sizes(pt); return nBox * s.w + (n - nBox) * s.gw; };
    const room = avail - (n - 1) * COMPACT_MIN_GAP;
    let pt = pt0;
    if (used(pt0) > room) {
        // solve for the digit size that fills the line exactly (the box minimum may bind: step down)
        for (pt = pt0; pt >= FLOOR_PT && used(pt) > room; pt -= 0.1);
        if (pt < FLOOR_PT) return null;
    }
    const s = sizes(pt);
    // critic r1 D5 (2026-10-09): a printed number takes the box's width (centred) whenever the line still holds every arrow at
    // this digit size, so the columns line up row to row; only a line too full for that (3-digit rows) keeps glyph widths.
    if (n * s.w <= room + 1e-6) s.gw = s.w;
    return { w: s.w, gw: s.gw, gap: (avail - (nBox * s.w + (n - nBox) * s.gw)) / (n - 1), pt };
}

/**
 * THE COUNT-BY ROW (owner 2026-10-02, wave 1 C2): every row is EXACTLY two lines of six numbers (the 15-number long row is
 * three lines of five), on paper and in the screen twin, filling the whole width the cell gives it: the boxes take
 * their writing width and the rest of the line is the space BETWEEN them, so the gaps are wide and no width is wasted.
 *
 * OWNER EXCEPTION to "content never shrinks" (WORKSHEET_DESIGN_STANDARD.md TY-10a), count-by rows only: when the widest
 * number is too wide for six boxes on a line ("1,000,000"), its digits and its box shrink just enough to fit, never below
 * FLOOR_PT (9 pt, above the standard's 8 pt minimum for pupil-facing type, TY-11). A table row whose six boxes already
 * fit keeps today's digit size.
 */
export const FLOOR_PT = 9;
const CLEAR_MM = 1.5;       // the jump arrow's clearance from each neighbour (owner mark-up 2026-10-03)
const COMPACT_CLEAR_MM = 1.0;   // the one-page sheet and the Lines rows: at least 1 mm clear (coordinator 2026-10-03)
const MIN_GAP = 2 * CLEAR_MM + 3.5;   // mm between two boxes, at least: a 3.5 mm arrow and its clearance
const EXIT_MM = 7.5;
const IN_MM = 7.5;          // the lane a line starts with when the step tab stands above the row (narrow Model cell)        // the turn arrow that leaves a line (6 mm + its margin)

/**
 * ANSWER SPACES: LINES (owner 2026-10-03, an owner exception to SL-3, count rows only): "____ -> ____ -> ____". Each missing
 * number is a bare write-on line, the row has no box height, and the row takes its numbers on ONE line wherever the width holds
 * them at today's digit size (with a jump arrow and its clearance in every gap); otherwise two even lines (6 + 6, 5 + 5 + 5).
 * A row of up to 12 narrows its lines (digits down to FLOOR_PT) to stay on ONE line (owner ruling: 12 per row); only a row
 * whose numbers are too wide even then takes two lines.
 */
const LINE_GAP_MIN = { paper: 2 * 1.0 + 3, compact: 2 * 1.0 + 3 };   // a 3 mm arrow (head 2.4 mm), 1 mm clear each side
const LINE_GAP_MAX = 10;
function linesGeom(p, ctx, c) {
    const { size, n, tabBody, tab, live, lblPt: lblPt0, lblChars, hasLbl } = c;
    const chars = maxDigits(p);
    const basePt = Math.min(digitPt(ctx) * (p.compact || p.fullPt ? 1 : 0.64), 18);
    const need = (pt) => Math.max(7, chars * 0.56 * pt * PT_MM + 2.4);   // the line is as wide as its widest number + a margin
    const minGap = p.compact ? LINE_GAP_MIN.compact : LINE_GAP_MIN.paper;
    const gapFor = (per, w, exit) => (live - tab - (exit ? EXIT_MM : 0) - per * w) / Math.max(1, per - 1);
    let pt = basePt, w = need(basePt), perRow = n;
    const twin = isTwin(ctx);
    // owner 2026-10-09 (critic r1 D2/D3): 12 on ONE line is a PAPER rule at Size S only ("use small to fit more"): there the
    // lines narrow (digits down to FLOOR_PT) before the row splits. At M and L, and on the one-page sheet, a row never shrinks
    // its digits or tab below the size's working size - it takes two lines of six. On SCREEN Lines wraps 6 + 6 like Boxes.
    const mayNarrow = !twin && !p.compact && size === 'S';
    if (twin) perRow = n >= 13 ? 5 : Math.ceil(n / 2);
    else if (gapFor(n, w, false) < minGap && n <= 12 && mayNarrow) {
        const w1 = (live - tab - (n - 1) * minGap) / n, pt1 = (w1 - 2.4) / (chars * 0.56 * PT_MM);
        if (pt1 >= FLOOR_PT) { w = w1; pt = Math.min(basePt, pt1); }
    }
    if (!twin && gapFor(n, w, false) < minGap - 1e-6) {
        perRow = n >= 13 ? 5 : Math.ceil(n / 2);
        // a narrow (Model) cell: more lines before any digit shrinks
        if (narrowCols(p, ctx) > 1) perRow = Math.max(Math.min(2, n), wrapRows(n, Math.ceil(n / perRow), w, minGap, (r) => live - tab - (r > 1 ? EXIT_MM : 0)).perRow);   // never one number a line (critic r2 N3)
        if (gapFor(perRow, w, true) < minGap) {
            w = (live - tab - EXIT_MM - (perRow - 1) * minGap) / perRow;
            pt = Math.max(FLOOR_PT, Math.min(basePt, (w - 2.4) / (chars * 0.56 * PT_MM)));
        }
    }
    // the spare width widens the lines a little (a line up to 8 mm wider than its number), the rest stays as the gaps
    const spare = gapFor(perRow, w, perRow < n);
    if (spare > LINE_GAP_MAX) w = Math.min(w + 8, w + (spare - LINE_GAP_MAX) * (perRow - 1) / perRow);
    let gap = Math.max(minGap, Math.min(LINE_GAP_MAX, gapFor(perRow, w, perRow < n)));
    if (twin && gap > TWIN_GAP_MM) gap = TWIN_GAP_MM;
    const rows = Math.ceil(n / perRow);
    // critic r3 N9: where the role sizes the cell to the row (opener), a Lines row spends 3 mm more on writing height above
    // its line instead of leaving it as empty band round a short row
    const h = S(ctx).writeMm + (p.compact ? 2 : 1) + (ctx && ctx.tightRows ? 3 : 0);
    const lblPt = hasLbl ? Math.max(8, Math.min(lblPt0, (w + gap - 0.8) / (Math.max(1, lblChars) * 0.6 * PT_MM))) : lblPt0;
    const lblH = hasLbl ? lblPt * PT_MM * 1.2 + 0.9 : 0;
    return { size, n, look: 'arcs', shape: 'box', w, h, pitch: w + gap, gap, tab, tabBody, perRow, rows, arcH: 0, pt, tabPt: basePt, hasLbl, lblH, lblPt, compact: !!p.compact, lines: true };
}

function arcsGeom(p, ctx, c) {
    const { size, n, shape, tabBody, tab, baseH, live, lblPt: lblPt0, lblChars, hasLbl, lblH } = c;
    let perRow = n >= 13 ? 5 : Math.ceil(n / 2);             // 12 -> 6 + 6; 15 -> 5 + 5 + 5
    let rows = Math.ceil(n / perRow);
    const chars = maxDigits(p);
    const basePt = Math.min(digitPt(ctx) * (p.compact || p.fullPt ? 1 : 0.64), 18);
    if (narrowCols(p, ctx) > 1) {
        // a narrow (Model) cell: more lines, each box keeping today's digits (never below the size's floor)
        const kS = shape === 'hex' || shape === 'mixed' ? 1.12 : 1;
        const bMin = Math.max(MIN_BOX[size], chars * 0.56 * basePt * PT_MM + 2.4) * kS;
        const availR = (r) => live - tab - (r > 1 ? EXIT_MM : 0);
        const w1 = wrapRows(n, rows, bMin, MIN_GAP, availR);
        // at most lines of three at today's digits; a wider number (14,000, 1,000,000) shrinks its digits toward FLOOR_PT
        // (TY-10a, as on the full line) before the row takes more lines, so the Model stays on its page
        if (w1.perRow >= Math.min(3, n)) ({ rows, perRow } = w1);
        else {
            const bFloor = Math.max(MIN_BOX[size], chars * 0.56 * FLOOR_PT * PT_MM + 2.4) * kS;
            const w2 = wrapRows(n, rows, bFloor, MIN_GAP, availR);
            if (w2.perRow < Math.min(2, n)) return null;
            perRow = Math.min(3, n, w2.perRow);
            rows = Math.ceil(n / perRow);
        }
    }
    const avail = live - tab - (rows > 1 ? EXIT_MM : 0);        // the width the numbers of one line may fill
    const pitch = (avail + MIN_GAP) / perRow;                   // box + gap, so six boxes and five gaps fill the line
    const shapeK = shape === 'hex' || shape === 'mixed' ? 1.12 : 1;
    const maxW = (pitch - MIN_GAP) / shapeK;                    // the widest box that leaves the least gap
    const boxMin = Math.max(MIN_BOX[size], chars * 0.56 * basePt * PT_MM + 2.4);   // wide enough for today's digits
    const boxCap = PITCH[size] + 2;                             // a table's box stays near today's writing width
    let boxW = maxW >= boxMin ? Math.min(maxW, Math.max(boxMin, boxCap)) : maxW;
    const sz = shape === 'box' ? { w: boxW, h: baseH } : tileSize(shape === 'mixed' ? 'hex' : shape, boxW, baseH);
    if (sz.w > pitch - 1) { sz.w = pitch - 1; }
    // the screen twin (critic C2 r6): the gap between columns is capped at TWIN_GAP_MM (about 24 px on a phone card), so four
    // columns fit the 322 px phone window; the arcs are drawn from this pitch, never restyled afterwards
    let gap = pitch - sz.w;
    if (isTwin(ctx) && gap > TWIN_GAP_MM) gap = TWIN_GAP_MM;
    // digits: today's size, shrunk only as far as the widest number needs, never below the floor
    const pt = Math.max(FLOOR_PT, Math.min(basePt, (sz.w - 2) / (0.56 * Math.max(2, chars)) * 72 / 25.4));
    // the PHONE twin (TY-10b, critic phone29): the screen draws the digits at ~29 px, so px per mm there is 29 / (pt mm);
    // the gap is capped at `twinGapPx` px absolute (24, set by the screen host on a phone), never under MIN_GAP
    if (isTwin(ctx) && Number(p.twinGapPx) > 0) {
        const kPhone = 29 / Math.max(1, pt * PT_MM);
        // the cap wins over the paper's arrow clearance (MIN_GAP): the jump arrow sizes itself to the gap it gets, and the
        // gap never falls under 14 px (3 mm on the phone) so the arrow still reads (lane a91a01fc, after merging TY-10b)
        gap = Math.min(gap, Math.max(14 / kPhone, Number(p.twinGapPx) / kPhone));
    }
    // the multiplication label shrinks to its box pitch too (a hint: floor 8 pt, TY-11)
    const lblPt = hasLbl ? Math.max(8, Math.min(lblPt0, (pitch - 0.8) / (Math.max(1, lblChars) * 0.6 * PT_MM))) : lblPt0;
    const lblHh = hasLbl ? lblPt * PT_MM * 1.2 + 0.9 : lblH;
    return { size, n, look: 'arcs', shape, w: sz.w, h: sz.h, pitch: sz.w + gap, gap, tab, tabBody, perRow, rows, arcH: 0, pt, hasLbl, lblH: lblHh, lblPt, compact: !!p.compact };
}

/** The keyed values in reading order: the missing numbers, then the rule's number. */
function keyParts(p) {
    const parts = (p.blanks || []).map((i) => String((p.values || [])[i]));
    if (p.ruleBox && p.ruleBox.value !== undefined && p.ruleBox.value !== null) parts.push(String(p.ruleBox.value));
    return parts;
}

/** What each slot shows in this state (Error analysis: the pupil's finished work). */
function shownValues(p, ctx) {
    const key = keyParts(p);
    if (ctx.state === 'blank') return key.map(() => '');
    if (ctx.state === 'wrong') {
        const w = ctx.wrong || {};
        const raw = w.value === undefined || w.value === null ? '' : String(w.value);
        const parts = raw.split(/\s*,\s*/).filter((s) => s !== '');
        return key.map((k, i) => {
            const id = i < (p.blanks || []).length ? `b${i}` : 'rule';
            if (w.slots && w.slots[id] !== undefined) return String(w.slots[id]);
            return parts[i] !== undefined ? parts[i] : k;
        });
    }
    return key;
}

const shownAt = (p, i) => {
    const s = p.shown;
    if (!s) return undefined;
    const v = s[i] !== undefined ? s[i] : s[String(i)];
    return v === undefined || v === null || v === '' ? undefined : v;
};

/**
 * The step tab's type: the row's digit size, and on the one-page sheet never below TAB_FLOOR_PT (critic C2 r4: "+100" printed at
 * 9 pt beside "+3" at 17 pt; the step is the cue the pupil reads first). geom() already sizes the tab for the size's full digit.
 */
const TAB_FLOOR_PT = 14;
const tabPt = (g) => { const pt = Math.min((g.tabPt || g.pt) * 1.05, 20); return g.compact ? Math.max(TAB_FLOOR_PT, pt) : pt; };

/** The step tab: a bold number in a pentagon pointing into the row ("7>"). */
function stepTab(ctx, g, text) {
    const w = g.tabBody, h = g.h;
    const sw = SW.heavy;
    const body = `<polygon points="${n2(sw)},${n2(sw)} ${n2(w - 3.2)},${n2(sw)} ${n2(w - sw)},${n2(h / 2)} ${n2(w - 3.2)},${n2(h - sw)} ${n2(sw)},${n2(h - sw)}" `
        + `fill="#fff" stroke="${INK}" stroke-width="${n2(sw)}" stroke-linejoin="round"/>`
        + `<text x="${n2((w - 3) / 2 + 0.3)}" y="${n2(h / 2)}" dominant-baseline="central" text-anchor="middle" font-family="Andika, sans-serif" `
        + `font-weight="700" font-size="${n2(tabPt(g) * 25.4 / 72)}" fill="${INK}">${esc(text)}</text>`;
    return `<span class="k2-steptab" data-ws-steptab="${esc(text)}" style="flex:none;display:inline-block;width:${L(ctx, w)};height:${L(ctx, h)};margin-right:${L(ctx, 2)};${g.hasLbl ? `margin-bottom:${L(ctx, g.lblH)};` : ''}">`
        + `<svg viewBox="0 0 ${n2(w)} ${n2(h)}" role="img" aria-label="count by ${esc(text)}" style="display:block;width:100%;height:100%;overflow:visible;">${body}</svg></span>`;
}

/**
 * The jump arrow (owner 2026-10-03): a SHORT arrow "->" in the gap between two neighbouring boxes, centred on the
 * boxes' height, with a complete (filled) arrowhead. It replaced the long hop arcs over the row, so a row is no
 * taller than its boxes. `w` is the gap's width (mm).
 */
function jumpArrow(ctx, g, w) {
    const h = g.h, mid = h / 2;
    // owner mark-up (2026-10-03): a short BOLD arrow centred in the gap, >= 1.5 mm clear of both neighbours (CLEAR_MM). Only
    // the one-page sheet's 12-number line has no room for that and keeps COMPACT_CLEAR_MM.
    const clear = w >= 2 * CLEAR_MM + 4 ? CLEAR_MM : COMPACT_CLEAR_MM;
    const len = g.compact && !g.lines ? Math.min(COMPACT_ARROW_MM, w - 2 * clear) : Math.max(0.6, Math.min(w - 2 * clear, 5));
    const head = Math.min(2.5, len * 0.8), half = Math.max(head * 0.5, 0.9);
    const x0 = (w - len) / 2, x1 = x0 + len;
    const body = (len - head > 0.3 ? `<path d="M${n2(x0)} ${n2(mid)} H${n2(x1 - head + 0.2)}" fill="none" stroke="${INK}" stroke-width="${n2(SW.heavy)}" stroke-linecap="butt"/>` : '')
        + `<polygon points="${n2(x1 - head)},${n2(mid - half)} ${n2(x1)},${n2(mid)} ${n2(x1 - head)},${n2(mid + half)}" fill="${INK}" stroke="none"/>`;
    // drawn in the gap to the LEFT of the box it points at (absolute, so the row's columns stay one element each: the screen
    // twin's swipe snaps and its Tab order read the line's children as its columns)
    return `<span class="k2-jump" aria-hidden="true" style="position:absolute;top:0;right:100%;display:block;width:${L(ctx, w)};height:${L(ctx, h)};pointer-events:none;">`
        + `<svg viewBox="0 0 ${n2(w)} ${n2(h)}" style="display:block;width:100%;height:100%;overflow:visible;">${body}</svg></span>`;
}

/**
 * A write-on LINE (Answer spaces: Lines): the slot is the line's width and the row's height, drawn as a 1.5 pt rule along its
 * bottom; the key writes its number on the line. On screen the input fills the same place, so it reads as an underlined field,
 * and the per-box marks tint the area above the line.
 */
function lineSlot(ctx, g, { id, value, ink, shown, maxLen, full = 0 }) {
    const color = ink === 'trace' ? GREY : INK;
    const hook = isTwin(ctx) ? ` data-mq-cell="1"${maxLen > 0 ? ` data-mq-w="${maxLen}"` : ''}${full > 0 ? ` data-mq-max="${full}"` : ''}` : '';
    return `<span class="k2-shape k2-shape-line" style="position:relative;display:inline-flex;flex:none;box-sizing:border-box;width:${L(ctx, g.w)};height:${L(ctx, g.h)};vertical-align:middle;">`
        + `<span class="k2-tile k2-tile-slot k2-line-slot" data-ws-slot="${esc(id)}" data-ws-shape="line"${ink ? ` data-ws-ink="${ink}"` : ''}${hook}${shown ? ' data-ws-shown="1"' : ''} `
        + `style="position:relative;box-sizing:border-box;display:flex;align-items:flex-end;justify-content:center;width:100%;height:100%;padding-bottom:${L(ctx, 0.6)};`
        + `border:0;border-bottom:${B(ctx, 1.5)} solid ${INK};border-radius:0;background:transparent;font-size:${P(ctx, g.pt)};font-weight:700;line-height:1;color:${color};${KEY_FEATURES}">${esc(value)}</span></span>`;
}

/** A filled arrowhead at (x, y) pointing along (ux, uy): the turn arrows share the jump arrow's head. */
function headAt(x, y, ux, uy) {
    const head = 1.9, half = 1.05, bx = x - ux * head, by = y - uy * head;
    return `<polygon points="${n2(bx - uy * half)},${n2(by + ux * half)} ${n2(x)},${n2(y)} ${n2(bx + uy * half)},${n2(by - ux * half)}" fill="${INK}" stroke="${INK}" stroke-width="${n2(SW.hair * 0.5)}"/>`;
}

/**
 * A row that wraps (15 jumps on paper) says so: a small elbow arrow leaves the end of a line and a
 * short arrow enters the start of the next, so the last hop of a line has somewhere to land
 * (critic, wave 1 C). Paper only: the screen twin's short rows stay as they are.
 */
function turnArrow(ctx, g, kind, w) {
    const h = g.h, mid = h / 2, sw = n2(SW.one);
    // the same short line and filled head as the jump arrows: "out" leaves the line's last box and turns down,
    // "in" enters the next line's first box from the left
    const path = kind === 'out'
        ? `M0.4 ${n2(mid)} H${n2(w - 2.2)} Q${n2(w - 0.8)} ${n2(mid)} ${n2(w - 0.8)} ${n2(mid + 1.6)} V${n2(h - 1.5)}`
        : `M${n2(w - 6)} ${n2(mid)} H${n2(w - 3)}`;
    const head = kind === 'out' ? headAt(w - 0.8, h - 0.2, 0, 1) : headAt(w - 1.5, mid, 1, 0);
    return `<svg aria-hidden="true" viewBox="0 0 ${n2(w)} ${n2(h)}" style="display:block;width:${L(ctx, w)};height:${L(ctx, h)};overflow:visible;">`
        + `<path d="${path}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>${head}</svg>`;
}

register('count-row', {
    render(p, ctx) {
        const g = geom(p, ctx);
        const values = p.values || [];
        const blanks = (p.blanks || []).map(Number);
        const shown = shownValues(p, ctx);
        const ink = inkOf(ctx);
        const plainGiven = g.look === 'arcs' && g.shape === 'box';
        // the widest written answer, in digits (no separators): the screen box takes that many (a count by 25,000 writes 6 digits).
        const keyDigits = Math.max(4, ...blanks.map((i) => String(values[i]).replace(/\D/g, '').length));
        // small fixes item 1 (critic r2 N1/N2): on screen a box takes as many digits as the row's WIDEST number - the same for
        // every box, so it tells no box's answer; a digit typed past that goes on to the next box (active-box.js), never lost
        const rowMax = Math.max(1, ...values.map((x) => String(x).replace(/\D/g, '').length));
        const cells = values.map((v, i) => {
            const k = blanks.indexOf(i);
            const over = shownAt(p, i);
            const sh = shapeAt(g.shape, i);
            if (k < 0) {
                const text = fmt(over !== undefined ? over : v);
                if (plainGiven) {
                    return `<span class="k2-given"${over !== undefined ? ' data-ws-shown="1"' : ''} style="flex:none;display:inline-flex;align-items:center;justify-content:center;`
                        + `width:${L(ctx, g.gw || g.w)};height:${L(ctx, g.h)};font-size:${P(ctx, g.pt)};font-weight:700;line-height:1;">${esc(text)}</span>`;
                }
                return tile(ctx, { shape: sh, w: g.w, h: g.h, pt: g.pt, value: text, shown: over !== undefined });
            }
            const val = over !== undefined ? String(over) : shown[k];
            const vInk = over !== undefined ? 'solid' : val !== '' ? ink : null;
            if (g.lines) return lineSlot(ctx, g, { id: `b${k}`, value: val === '' ? '' : fmt(val), ink: vInk, shown: over !== undefined, maxLen: keyDigits, full: rowMax });
            return tile(ctx, { shape: sh, w: g.w, h: g.h, pt: g.pt, value: val === '' ? '' : fmt(val), slot: { id: `b${k}`, mark: 'cell' }, ink: vInk, heavy: true, shown: over !== undefined, maxLen: keyDigits, full: rowMax });
        });
        if (g.hasLbl) {
            const lblInk = lvlOf(ctx) === 2 ? GREY : INK;
            for (let i = 0; i < cells.length; i++) {
                const t = labelAt(p, ctx, i);
                cells[i] = `<span style="flex:none;display:flex;flex-direction:column;align-items:center;width:${L(ctx, g.w)};">${cells[i]}`
                    + `<span class="k2-timeslbl"${t ? ` data-ws-times="${esc(t)}"` : ''} style="display:flex;justify-content:center;width:100%;height:${L(ctx, g.lblH - 0.5)};margin-top:${L(ctx, isTwin(ctx) ? 2.6 : 0.5)};`
                    + `white-space:nowrap;font-size:${P(ctx, g.lblPt)};font-weight:400;line-height:1.2;color:${lblInk};">${esc(t)}</span></span>`;
            }
        }
        const rowsHtml = [];
        const swipeTabs = isTwin(ctx) && g.look === 'arcs' && !!g.tab;
        const tabsCol = [];
        if (g.tabAbove) rowsHtml.push(`<div class="k2-countrow-line k2-countrow-tabline" style="display:flex;margin-bottom:${L(ctx, 2.5)};">${stepTab(ctx, g, p.tab)}</div>`);
        for (let r = 0; r < g.rows; r++) {
            const part = cells.slice(r * g.perRow, (r + 1) * g.perRow);
            const arcs = '';
            const jumps = g.look === 'arcs';
            const lineCells = jumps ? part.map((c, k) => (k ? `<span class="k2-jumpcell" style="position:relative;flex:none;display:block;">${jumpArrow(ctx, g, g.gap)}${c}</span>` : c)) : part;
            const turns = g.look === 'arcs' && g.tab && g.rows > 1;
            const tabW = g.tab;
            const lift = g.hasLbl ? `margin-bottom:${L(ctx, g.lblH)};` : '';
            const tabCol = g.tab ? (r === 0 && !g.tabAbove ? stepTab(ctx, g, p.tab) : r === 0 ? `<span style="flex:none;width:${L(ctx, tabW)};"></span>` : `<span class="k2-steptab-in" style="flex:none;width:${L(ctx, tabW)};${lift}">${turns ? turnArrow(ctx, g, 'in', tabW) : ''}</span>`) : '';
            // screen twin (critic C2 r4): the step tab and the arrow column sit OUTSIDE the swiping row, in a fixed column beside it,
            // so no number or box can ever slide under them; wireSwipeRows (screen-cell.js) keeps each entry level with its line
            if (swipeTabs) { tabsCol.push(`<div data-mq-tabfor="${r}" style="display:flex;align-items:flex-end;${r ? `margin-top:${L(ctx, 2.5)};` : ''}">${tabCol}</div>`); }
            const exitArrow = turns && r < g.rows - 1 ? `<span style="flex:none;width:${L(ctx, 6)};margin-left:${L(ctx, 1.5)};${lift}">${turnArrow(ctx, g, 'out', 6)}</span>` : '';
            rowsHtml.push(`<div class="k2-countrow-line"${isTwin(ctx) ? ' data-mq-wrapped="1"' : ''} style="display:flex;align-items:flex-end;justify-content:${g.tab ? 'flex-start' : 'center'};${r ? `margin-top:${L(ctx, 2.5)};` : ''}">`
                + `${swipeTabs ? '' : tabCol}<div style="display:flex;flex-direction:column;align-items:flex-start;">${arcs}`
                + `<div${isTwin(ctx) ? ' data-mq-wrapped="1"' : ''} style="display:flex;align-items:flex-start;gap:${L(ctx, g.gap)};">${lineCells.join('')}</div></div>${exitArrow}</div>`);
        }
        let caption = '';
        if (p.rule) {
            caption = `<div class="k2-rule" style="font-size:${P(ctx, textPt(ctx))};font-weight:700;line-height:1.3;margin-bottom:${L(ctx, 2)};">${esc(p.rule)}</div>`;
        }
        let ruleFrame = '';
        if (p.ruleBox) {
            const k = blanks.length;
            const val = shown[k];
            const vInk = val !== '' ? ink : null;
            const rb = tile(ctx, { shape: 'box', w: 14 + Math.max(0, String(p.ruleBox.value).length - 3) * 3, h: g.h, pt: g.pt, value: val === '' ? '' : fmt(val), slot: { id: 'rule', mark: 'cell' }, ink: vInk, heavy: true });
            ruleFrame = `<div class="k2-rulebox" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 2)};margin-top:${L(ctx, 3)};`
                + `font-size:${P(ctx, textPt(ctx))};font-weight:400;white-space:nowrap;">`
                + `<span>${esc(p.ruleBox.pre || 'Rule:')}</span>${rb}${p.ruleBox.post ? `<span>${esc(p.ruleBox.post)}</span>` : ''}</div>`;
        }
        // screen only (critic r2 N1): how to move on between boxes - the caret never moves by itself
        const keys = isTwin(ctx) && blanks.length > 1
            ? `<div class="k2-countrow-keys" style="margin-top:${L(ctx, 2)};font-size:${P(ctx, textPt(ctx))};font-weight:400;line-height:1.3;color:${INK};text-align:${g.tab ? 'left' : 'center'};">`
                + `<span class="k2-keys-type">After each number, press Space.</span><span class="k2-keys-touch">After each number, tap the next box.</span></div>`
            : '';
        const align = g.tab ? 'left' : 'center';
        const vp = vpadOf(p, ctx);
        return root(ctx, `k2-countrow k2-countrow-${g.look}`,
            `${caption}${swipeTabs ? `<div class="k2-countrow-frame" style="display:flex;align-items:flex-start;max-width:100%;min-width:0;"><div class="k2-countrow-tabs" data-mq-tabcol="1" style="flex:none;">${tabsCol.join('')}</div>` : ''}`
            + `${isTwin(ctx) && g.look === 'arcs' ? `<div data-mq-swiperow="1" style="overflow-x:auto;max-width:100%;padding-bottom:1px;${swipeTabs ? 'flex:1 1 auto;min-width:0;width:auto;' : ''}">` : ''}`
            + `<div class="k2-countrow-body" data-mq-join=", " style="display:inline-block;text-align:left;">${rowsHtml.join('')}</div>`
            + `${isTwin(ctx) && g.look === 'arcs' ? '<div class="k2-swipe-cues" aria-hidden="true"><span class="k2-swipe-back"><i>&#10229;</i> <b>Back<span class="k2-cue-long"> to the start</span></b></span><span class="k2-swipe-cue"><b>Swipe</b> <i>&#10142;</i> <b>for more boxes</b></span></div></div>' : ''}${swipeTabs ? '</div>' : ''}${keys}${ruleFrame}`,
            { style: `text-align:${align};${vp ? `padding:${L(ctx, vp)} 0;` : ''}` });
    },
    answerKey(p) {
        const parts = keyParts(p);
        const slots = {};
        (p.blanks || []).forEach((_, i) => { slots[`b${i}`] = { value: parts[i], graded: true }; });
        if (p.ruleBox) slots.rule = { value: parts[parts.length - 1], graded: true };
        return { value: parts.join(', '), display: parts.map(fmt).join(', '), slots };
    },
    footprint(p, ctx) {
        const g = geom(p, Object.assign({}, ctx || {}, { columns: 1 }));   // item 7: the full-line geometry, so maxCols is unchanged
        const w = g.tab + g.perRow * g.pitch - g.gap + 4;
        const h = g.rows * (g.arcH + g.h + g.lblH) + (g.rows - 1) * 2.5 + (p.rule ? 8 : 0) + (p.ruleBox ? g.h + 3 : 0) + 3;
        // denseRoom 1: a page of count-by rows packs one row per table, 9-12 at M (owner), each cell
        // exactly its measured height (the arcs and the pads are already in it).
        return { wMm: Math.ceil(w), hMm: Math.ceil(h + 2 * (vpadOf(p, ctx))), measure: true, factLike: false, maxCols: w <= 90 ? 2 : 1, denseRoom: 1 };
    },
    inputs(p) {
        const out = (p.blanks || []).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full', 'answer-only'] }));
        if (p.ruleBox) out.push({ id: 'rule', kind: 'number', shape: 'box', graded: true, order: out.length, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
        return out;
    },
    layout(p) { return { card: (p && (p.values || []).length > 6) ? 'card-wide-visual' : 'card-medium-visual', checker: 'list' }; },
});
