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
import { L, P, B, INK, GREY, root, digitPt, textPt, zonePt, sizeOf, inkOf, isTwin, S, SW, PT_MM, n2 } from './k2kit.js';
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
const COMPACT_GAP_MM = 1;      // and a tighter gap, so the box takes the width (3-digit keys keep clear space)
/** Most boxes in one row of the screen twin: four (and the step tab) fit a 390 px phone at >= 44 px a box. */
const TWIN_ROW = 4;

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
    const tabPtEst = Math.min(digitPt(ctx) * (p.compact ? 1 : 0.64) * 1.05, 20);
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
    const baseH = S(ctx).writeMm + (p.compact ? 3.4 : 2.5);
    const live = p.compact ? COMPACT_LIVE_MM : LIVE_MM;
    // THE ONE-PAGE SHEET (owner 2026-10-02 ruling): "All rows on one page" keeps its compact SINGLE line of 12 numbers at the
    // size's working digit size (16 pt at S), exactly as it was. A row whose widest number (> 3 characters) cannot be written
    // on one line at FLOOR_PT shrinks its digits down to the floor first (TY-10a) and otherwise takes two lines of six.
    if (look === 'arcs' && p.compact && shape === 'box') {
        const fitPitch = (live - tab + gap) / n;
        const chars = maxDigits(p);
        const ptFit = Math.min(digitPt(ctx), 18, (fitPitch - gap - 2) / (0.56 * Math.max(2, chars)) * 72 / 25.4);
        if (chars <= 3 ? fitPitch - gap >= MIN_BOX[size] : ptFit >= FLOOR_PT) {
            const w = fitPitch - gap;
            return { size, n, look, shape, w, h: baseH, pitch: w + gap, gap, tab, tabBody, perRow: n, rows: 1, arcH: 3, pt: ptFit, hasLbl, lblH, lblPt };
        }
    }
    if (look === 'arcs') return arcsGeom(p, ctx, { size, n, shape, gap, tabBody, tab, baseH, live, lblPt, lblChars, hasLbl, lblH });
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
const MIN_GAP = 3;          // mm between two boxes, at least
const EXIT_MM = 7.5;        // the turn arrow that leaves a line (6 mm + its margin)

function arcsGeom(p, ctx, c) {
    const { size, n, shape, tabBody, tab, baseH, live, lblPt: lblPt0, lblChars, hasLbl, lblH } = c;
    const perRow = n >= 13 ? 5 : Math.ceil(n / 2);             // 12 -> 6 + 6; 15 -> 5 + 5 + 5
    const rows = Math.ceil(n / perRow);
    const chars = maxDigits(p);
    const basePt = Math.min(digitPt(ctx) * (p.compact ? 1 : 0.64), 18);
    const avail = live - tab - (rows > 1 ? EXIT_MM : 0);        // the width the numbers of one line may fill
    const pitch = (avail + MIN_GAP) / perRow;                   // box + gap, so six boxes and five gaps fill the line
    const shapeK = shape === 'hex' || shape === 'mixed' ? 1.12 : 1;
    const maxW = (pitch - MIN_GAP) / shapeK;                    // the widest box that leaves the least gap
    const boxMin = Math.max(MIN_BOX[size], chars * 0.56 * basePt * PT_MM + 2.4);   // wide enough for today's digits
    const boxCap = PITCH[size] + 2;                             // a table's box stays near today's writing width
    let boxW = maxW >= boxMin ? Math.min(maxW, Math.max(boxMin, boxCap)) : maxW;
    const sz = shape === 'box' ? { w: boxW, h: baseH } : tileSize(shape === 'mixed' ? 'hex' : shape, boxW, baseH);
    if (sz.w > pitch - 1) { sz.w = pitch - 1; }
    const gap = pitch - sz.w;
    // digits: today's size, shrunk only as far as the widest number needs, never below the floor
    const pt = Math.max(FLOOR_PT, Math.min(basePt, (sz.w - 2) / (0.56 * Math.max(2, chars)) * 72 / 25.4));
    // the multiplication label shrinks to its box pitch too (a hint: floor 8 pt, TY-11)
    const lblPt = hasLbl ? Math.max(8, Math.min(lblPt0, (pitch - 0.8) / (Math.max(1, lblChars) * 0.6 * PT_MM))) : lblPt0;
    const lblHh = hasLbl ? lblPt * PT_MM * 1.2 + 0.9 : lblH;
    return { size, n, look: 'arcs', shape, w: sz.w, h: sz.h, pitch, gap, tab, tabBody, perRow, rows, arcH: p.compact ? 3 : 3.8, pt, hasLbl, lblH: lblHh, lblPt };
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

/** The step tab: a bold number in a pentagon pointing into the row ("7>"). */
function stepTab(ctx, g, text) {
    const w = g.tabBody, h = g.h;
    const sw = SW.heavy;
    const body = `<polygon points="${n2(sw)},${n2(sw)} ${n2(w - 3.2)},${n2(sw)} ${n2(w - sw)},${n2(h / 2)} ${n2(w - 3.2)},${n2(h - sw)} ${n2(sw)},${n2(h - sw)}" `
        + `fill="#fff" stroke="${INK}" stroke-width="${n2(sw)}" stroke-linejoin="round"/>`
        + `<text x="${n2((w - 3) / 2 + 0.3)}" y="${n2(h / 2)}" dominant-baseline="central" text-anchor="middle" font-family="Andika, sans-serif" `
        + `font-weight="700" font-size="${n2(Math.min(g.pt * 1.05, 20) * 25.4 / 72)}" fill="${INK}">${esc(text)}</text>`;
    return `<span class="k2-steptab" data-ws-steptab="${esc(text)}" style="flex:none;display:inline-block;width:${L(ctx, w)};height:${L(ctx, h)};margin-right:${L(ctx, 2)};${g.hasLbl ? `margin-bottom:${L(ctx, g.lblH)};` : ''}">`
        + `<svg viewBox="0 0 ${n2(w)} ${n2(h)}" role="img" aria-label="count by ${esc(text)}" style="display:block;width:100%;height:100%;overflow:visible;">${body}</svg></span>`;
}

/** The hop arcs over one row of `k` numbers. */
function arcsSVG(ctx, g, k) {
    const W = k * g.pitch - g.gap, H = g.arcH;
    let d = '';
    for (let i = 0; i < k - 1; i++) {
        const a = i * g.pitch + g.w / 2 + 1.2, b = (i + 1) * g.pitch + g.w / 2 - 1.2;
        const cx = (a + b) / 2, cy = -H * 0.55;
        d += `M${n2(a)} ${n2(H)} Q${n2(cx)} ${n2(cy)} ${n2(b)} ${n2(H)} `;
        // a small arrowhead where the hop lands: two equal wings either side of the arc's own
        // direction at the tip (the curve's end tangent points from the control point to the tip)
        const tx = b - cx, ty = H - cy, tl = Math.hypot(tx, ty) || 1;
        const ux = tx / tl, uy = ty / tl, len = 1.5, ang = 0.5;   // wing length mm, half-angle rad (~29°)
        const wing = (s) => {
            const c = Math.cos(s * ang), sn = Math.sin(s * ang);
            return [b - len * (ux * c - uy * sn), H - len * (ux * sn + uy * c)];
        };
        const [l1x, l1y] = wing(1), [l2x, l2y] = wing(-1);
        d += `M${n2(l1x)} ${n2(l1y)} L${n2(b)} ${n2(H)} L${n2(l2x)} ${n2(l2y)} `;
    }
    return `<svg aria-hidden="true" viewBox="0 0 ${n2(W)} ${n2(H)}" style="display:block;width:${L(ctx, W)};height:${L(ctx, H)};overflow:visible;">`
        + `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${n2(SW.hair)}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/**
 * A row that wraps (15 jumps on paper) says so: a small elbow arrow leaves the end of a line and a
 * short arrow enters the start of the next, so the last hop of a line has somewhere to land
 * (critic, wave 1 C). Paper only: the screen twin's short rows stay as they are.
 */
function turnArrow(ctx, g, kind, w) {
    const h = g.h, mid = h / 2, sw = n2(SW.hair);
    const d = kind === 'out'
        ? `M0.4 ${n2(mid)} H${n2(w - 2.2)} Q${n2(w - 0.8)} ${n2(mid)} ${n2(w - 0.8)} ${n2(mid + 1.6)} V${n2(h - 0.4)} M${n2(w - 2.1)} ${n2(h - 1.8)} L${n2(w - 0.8)} ${n2(h - 0.3)} L${n2(w + 0.5)} ${n2(h - 1.8)}`
        : `M${n2(w - 7)} ${n2(mid)} H${n2(w - 0.4)} M${n2(w - 2.0)} ${n2(mid - 1.4)} L${n2(w - 0.4)} ${n2(mid)} L${n2(w - 2.0)} ${n2(mid + 1.4)}`;
    return `<svg aria-hidden="true" viewBox="0 0 ${n2(w)} ${n2(h)}" style="display:block;width:${L(ctx, w)};height:${L(ctx, h)};overflow:visible;">`
        + `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
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
        const cells = values.map((v, i) => {
            const k = blanks.indexOf(i);
            const over = shownAt(p, i);
            const sh = shapeAt(g.shape, i);
            if (k < 0) {
                const text = fmt(over !== undefined ? over : v);
                if (plainGiven) {
                    return `<span class="k2-given"${over !== undefined ? ' data-ws-shown="1"' : ''} style="flex:none;display:inline-flex;align-items:center;justify-content:center;`
                        + `width:${L(ctx, g.w)};height:${L(ctx, g.h)};font-size:${P(ctx, g.pt)};font-weight:700;line-height:1;">${esc(text)}</span>`;
                }
                return tile(ctx, { shape: sh, w: g.w, h: g.h, pt: g.pt, value: text, shown: over !== undefined });
            }
            const val = over !== undefined ? String(over) : shown[k];
            const vInk = over !== undefined ? 'solid' : val !== '' ? ink : null;
            return tile(ctx, { shape: sh, w: g.w, h: g.h, pt: g.pt, value: val === '' ? '' : fmt(val), slot: { id: `b${k}`, mark: 'cell' }, ink: vInk, heavy: true, shown: over !== undefined, maxLen: keyDigits });
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
        for (let r = 0; r < g.rows; r++) {
            const part = cells.slice(r * g.perRow, (r + 1) * g.perRow);
            const arcs = g.look === 'arcs' ? arcsSVG(ctx, g, part.length) : '';
            const turns = g.look === 'arcs' && g.tab && g.rows > 1;
            const tabW = g.tab;
            const lift = g.hasLbl ? `margin-bottom:${L(ctx, g.lblH)};` : '';
            const tabCol = g.tab ? (r === 0 ? stepTab(ctx, g, p.tab) : `<span style="flex:none;width:${L(ctx, tabW)};${lift}">${turns ? turnArrow(ctx, g, 'in', tabW) : ''}</span>`) : '';
            const exitArrow = turns && r < g.rows - 1 ? `<span style="flex:none;width:${L(ctx, 6)};margin-left:${L(ctx, 1.5)};${lift}">${turnArrow(ctx, g, 'out', 6)}</span>` : '';
            rowsHtml.push(`<div class="k2-countrow-line"${isTwin(ctx) ? ' data-mq-wrapped="1"' : ''} style="display:flex;align-items:flex-end;justify-content:${g.tab ? 'flex-start' : 'center'};${r ? `margin-top:${L(ctx, 2.5)};` : ''}">`
                + `${tabCol}<div style="display:flex;flex-direction:column;align-items:flex-start;">${arcs}`
                + `<div${isTwin(ctx) ? ' data-mq-wrapped="1"' : ''} style="display:flex;gap:${L(ctx, g.gap)};${arcs ? `margin-top:${L(ctx, 0.6)};` : ''}">${part.join('')}</div></div>${exitArrow}</div>`);
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
        const align = g.tab ? 'left' : 'center';
        return root(ctx, `k2-countrow k2-countrow-${g.look}`,
            `${caption}${isTwin(ctx) && g.look === 'arcs' ? '<div data-mq-swiperow="1" style="overflow-x:auto;max-width:100%;padding-bottom:1px;">' : ''}`
            + `<div class="k2-countrow-body" data-mq-join=", " style="display:inline-block;text-align:left;">${rowsHtml.join('')}</div>`
            + `${isTwin(ctx) && g.look === 'arcs' ? '<span class="k2-swipe-cue" aria-hidden="true"><b>Swipe</b> <i>&#10142;</i> <b>for more boxes</b></span></div>' : ''}${ruleFrame}`,
            { style: `text-align:${align};` });
    },
    answerKey(p) {
        const parts = keyParts(p);
        const slots = {};
        (p.blanks || []).forEach((_, i) => { slots[`b${i}`] = { value: parts[i], graded: true }; });
        if (p.ruleBox) slots.rule = { value: parts[parts.length - 1], graded: true };
        return { value: parts.join(', '), display: parts.map(fmt).join(', '), slots };
    },
    footprint(p, ctx) {
        const g = geom(p, ctx || {});
        const w = g.tab + g.perRow * g.pitch - g.gap + 4;
        const h = g.rows * (g.arcH + g.h + g.lblH) + (g.rows - 1) * 2.5 + (p.rule ? 8 : 0) + (p.ruleBox ? g.h + 3 : 0) + 3;
        // denseRoom 1: a page of count-by rows packs one row per table, 9-12 at M (owner), each cell
        // exactly its measured height (the arcs and the pads are already in it).
        return { wMm: Math.ceil(w), hMm: Math.ceil(h), measure: true, factLike: false, maxCols: w <= 90 ? 2 : 1, denseRoom: 1 };
    },
    inputs(p) {
        const out = (p.blanks || []).map((_, i) => ({ id: `b${i}`, kind: 'number', shape: 'box', graded: true, order: i, inputmode: 'numeric', scopes: ['full', 'answer-only'] }));
        if (p.ruleBox) out.push({ id: 'rule', kind: 'number', shape: 'box', graded: true, order: out.length, inputmode: 'numeric', scopes: ['full', 'answer-only'] });
        return out;
    },
    layout(p) { return { card: (p && (p.values || []).length > 6) ? 'card-wide-visual' : 'card-medium-visual', checker: 'list' }; },
});
