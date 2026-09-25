// js/modules/sheet/cells/function-table.js
// The `function-table` template: an In / Out table ruled by a rule (function_table_easy,
// function_table_hard). One drawing, five tasks:
//
//   outputs   the rule is given; the In numbers are printed, the Out numbers are the blanks.
//             With support 'frame' a middle column shows the rule on each In number ("3 + 7"):
//             the In (x) | x + 7 | Out table of the owner's sample, a structural frame.
//   rule      every row is printed; the pupil finds the rule and writes it under the table,
//             in a frame "x (○) [ ]" (support 'frame': the sign in a circle, the number in a
//             box, one pair per step) or on a free line after a printed x (support 'line').
//   inputs    the rule is given; the Out numbers are printed, the In numbers are the blanks
//             (the rule worked backward).
//   mixed     the rule is given; each row has one blank, some In and some Out.
//   make      the rule is given; the pupil writes In numbers of their own and the Out number
//             each one gives. The key shows one right set and says any rows that follow the
//             rule are right; on screen each row is checked against the rule (ftAnswerMatches).
//
// Around the table:
//   machine   (payload.machine) a small black-and-white function machine above the columns:
//             "In -> [ rule ] -> Out". The box holds the rule when it is given and the word
//             "rule" when the pupil has to find it. No picture, no colour: a box and two arrows.
//   check     (payload.check) a separate Check row under the table: a new In number, and an Out
//             box where the pupil tests the rule once more.
//   note      (task 'make') one line saying which In numbers to use, printed on the pupil page
//             AND the key, so both have the same geometry (AK-1).
//
// Drawing: XP-D-15 (EXTENSION_PLAYBOOK): heavy outer rule, hairline inner rules, a heavy rule
// under the head row, head row in bold; the head band is the single grey (white, with the same
// rules, when photocopy-safe: grey is never hatched behind text). Cells are Hw + 4 mm tall, every
// writing box at least 14 mm wide (RUBRIC H9), the same size in every blank so its width never
// tells the pupil how many digits to write (L-LEAK). Numbers print at the digit size; the head
// and the rule column at the text size.
//
// Slots, in reading order (the order of q.ans, joined ", "):
//   r<i>in / r<i>out      a blank In / Out of row i (display order)
//   s0 n0 [s1 n1]         the rule frame: sign, number (per step)       (task 'rule', frame)
//   rule                  the rule line after the printed x              (task 'rule', line)
//   chk                   the Out of the Check row
// On screen (the static twin) every slot carries `data-mq-cell`; a sign slot also carries
// `data-mq-kind="sign"` and the rule line `data-mq-kind="rule"`, so screen-cell.js lets the
// pupil type a sign there (every other box takes digits only).
//
// payload: {task, rule: [{op: '+'|'-'|'x'|'/', n}], rows: [{x, y, hide: null|'in'|'out'|'both'}],
//           check: null|{x, y}, support: 'frame'|'line', machine: bool, note?: string}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { geo, root, inkOf, slotValues, box, esc, HAIR, HEAVY, KEY_FEATURES } from './ops-common.js';
import { INK } from '../tokens.js';

const PT_MM = 25.4 / 72;
export const FT_GLYPH = Object.freeze({ '+': '+', '-': '−', x: '×', '/': '÷' });
const SIGN_OF = { '+': '+', '-': '-', '−': '-', '–': '-', x: 'x', X: 'x', '×': 'x', '*': 'x', '/': '/', '÷': '/', ':': '/' };

/* ================================================================== the rule, as maths */

/** One step of a rule on one number; NaN when it leaves the whole numbers (÷ not exact, < 0). */
function stepOn(v, s) {
    const n = Number(s.n);
    if (!Number.isFinite(v) || !Number.isFinite(n)) return NaN;
    if (s.op === '+') return v + n;
    if (s.op === '-') return v - n >= 0 ? v - n : NaN;
    if (s.op === 'x') return v * n;
    if (s.op === '/') return n !== 0 && v % n === 0 ? v / n : NaN;
    return NaN;
}

/** The rule on an In number (steps left to right); NaN when a step is not a whole number. */
export function applyRule(rule, x) {
    let v = Number(x);
    for (const s of rule || []) v = stepOn(v, s);
    return v;
}

/** The In number a rule sends to `y` (the rule undone, last step first); NaN when there is none. */
export function undoRule(rule, y) {
    let v = Number(y);
    for (const s of (rule || []).slice().reverse()) {
        const inv = { '+': '-', '-': '+', x: '/', '/': 'x' }[s.op];
        v = stepOn(v, { op: inv, n: s.n });
    }
    return v;
}

/** "x + 7", "x × 2 + 1" (with the variable) or "+ 7", "× 2 + 1" (without). */
export function ruleText(rule, { variable = true } = {}) {
    const body = (rule || []).map((s) => `${FT_GLYPH[s.op] || s.op} ${s.n}`).join(' ');
    return variable ? `x ${body}` : body;
}

/** "3 + 7" / "3 × 2 + 1": the rule written on one In number. */
export const ruleOn = (rule, x) => `${x} ${ruleText(rule, { variable: false })}`;

/** Does a rule send every [x, y] pair where it should? */
export const ruleFits = (rule, pairs) => pairs.every(([x, y]) => applyRule(rule, x) === y);

/** The sign a pupil wrote, as '+', '-', 'x' or '/' ('' when it is not a sign). */
export function signOf(v) {
    const t = String(v == null ? '' : v).trim();
    return SIGN_OF[t] || '';
}

/**
 * Parse a rule written on a line: "+ 7", "x + 7", "×2+1", "add 7" is not accepted (the line
 * asks for the rule in signs). The leading variable (x or n) is optional. null when unreadable.
 */
export function parseRule(text) {
    let t = String(text == null ? '' : text).replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/[×*]/g, 'x').replace(/[÷:]/g, '/');
    t = t.replace(/^[xn](?=[-+x/])/i, '');
    const steps = [];
    const re = /([-+x/])(\d+)/gy;
    let m;
    let at = 0;
    while ((m = re.exec(t))) { steps.push({ op: m[1], n: Number(m[2]) }); at = re.lastIndex; }
    return steps.length && at === t.length ? steps : null;
}

const sameRule = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length
    && a.every((s, i) => s.op === b[i].op && Number(s.n) === Number(b[i].n));

/* ================================================================== slots */

/**
 * The slots of a table in reading order, each with the value the key writes in it.
 * kind: 'num' (a number box), 'sign' (a sign circle), 'rule' (the rule line).
 */
export function ftSlots(p) {
    const out = [];
    const rule = p.rule || [];
    (p.rows || []).forEach((r, i) => {
        if (r.hide === 'in' || r.hide === 'both') out.push({ id: `r${i}in`, kind: 'num', value: String(r.x), row: i, col: 'in' });
        if (r.hide === 'out' || r.hide === 'both') out.push({ id: `r${i}out`, kind: 'num', value: String(r.y), row: i, col: 'out' });
    });
    if (p.task === 'rule') {
        if (p.support === 'line') out.push({ id: 'rule', kind: 'rule', value: ruleText(rule, { variable: false }) });
        else rule.forEach((s, k) => {
            out.push({ id: `s${k}`, kind: 'sign', value: FT_GLYPH[s.op] });
            out.push({ id: `n${k}`, kind: 'num', value: String(s.n) });
        });
    }
    if (p.check) out.push({ id: 'chk', kind: 'num', value: String(p.check.y), col: 'out' });
    return out;
}

const splitParts = (v) => String(v == null ? '' : v).split(/\s*,\s*/).map((s) => s.trim());
const numOf = (s) => (/^\d+$/.test(String(s).replace(/,/g, '').trim()) ? Number(String(s).replace(/,/g, '')) : NaN);

/**
 * Is a pupil's answer right? `value` is the slots in reading order joined ", " (what every screen
 * host composes). Signs may be typed as + - x * / or the glyphs; numbers with or without a
 * thousands comma. Task 'make': every row must follow the rule (the Out is the rule on the In),
 * with whole In numbers that are all different; the pupil's own In numbers are accepted.
 */
export function ftAnswerMatches(value, p) {
    if (!p || !Array.isArray(p.rows)) return false;
    const slots = ftSlots(p);
    // A thousands comma inside one number would split it: rejoin "1,000" style runs first.
    const raw = String(value == null ? '' : value).replace(/(\d),(\d{3})(?!\d)/g, '$1$2');
    const parts = splitParts(raw);
    if (parts.length !== slots.length) return false;
    if (p.task === 'make') {
        const byRow = {};
        slots.forEach((s, k) => { if (s.row !== undefined) (byRow[s.row] = byRow[s.row] || {})[s.col] = numOf(parts[k]); });
        const ins = [];
        for (const r of Object.values(byRow)) {
            if (!Number.isFinite(r.in) || !Number.isFinite(r.out)) return false;
            if (applyRule(p.rule, r.in) !== r.out) return false;
            ins.push(r.in);
        }
        if (new Set(ins).size !== ins.length) return false;
        const chk = slots.findIndex((s) => s.id === 'chk');
        return chk < 0 || numOf(parts[chk]) === Number(p.check.y);
    }
    return slots.every((s, k) => {
        const got = parts[k];
        if (s.kind === 'sign') return signOf(got) !== '' && signOf(got) === signOf(s.value);
        if (s.kind === 'rule') return sameRule(parseRule(got), p.rule);
        return numOf(got) === Number(s.value);
    });
}

/* ================================================================== geometry */

const BOX_MIN_MM = { S: 14, M: 14, L: 16 };

function dims(p, g) {
    const rowH = g.writeMm + 4;                         // XP-D-15: cell height Hw + 4 mm
    const headH = Math.max(rowH - 4.5, (g.pt * g.textEm) * PT_MM * 1.6);
    const digitMm = 0.56 * g.E;                          // one Andika digit at the digit size
    const vals = [];
    for (const r of p.rows || []) vals.push(r.x, r.y);
    if (p.check) vals.push(p.check.x, p.check.y);
    const maxDigits = Math.max(2, ...vals.map((v) => String(v).length));
    // the key writes in bold (wider figures): room for them plus air on both sides
    const boxW = Math.max((BOX_MIN_MM[g.size] || 14) + (g.size === 'L' ? 1 : 0), maxDigits * digitMm * 1.05 + 4);
    const boxH = g.writeMm + 1;
    const colW = Math.max(boxW + 4, 16);
    // The rule column (task 'outputs' with the frame): "12 × 2 + 1" at the text size.
    const textMm = g.pt * g.textEm * PT_MM;              // one em of the text size, in mm
    const exprChars = Math.max(ruleText(p.rule).length, ...(p.rows || []).map((r) => ruleOn(p.rule, r.x).length));
    const exprW = Math.max(colW, exprChars * 0.5 * textMm + 5);
    // The rule frame: a sign circle and a number box per step, the box sized for the rule's own
    // numbers (never under the 14 mm writing minimum).
    const ruleDigits = Math.max(2, ...(p.rule || []).map((s) => String(s.n).length));
    const ruleBoxW = Math.max(BOX_MIN_MM[g.size] || 14, ruleDigits * digitMm + 4);
    const signW = boxH;
    const frameW = 0.6 * g.E + (p.rule || []).length * (signW + ruleBoxW + 2.3);
    const machineH = Math.max(7, textMm * 1.5);
    return { rowH, headH, boxW, boxH, colW, exprW, textMm, ruleBoxW, signW, frameW, machineH, digitMm, maxDigits };
}

const hasExprCol = (p) => p.task === 'outputs' && p.support !== 'line';

function tableWidth(p, d) {
    return d.colW * 2 + (hasExprCol(p) ? d.exprW : 0);
}

/* ================================================================== drawing */

/** A text run at the text size (relative to the digit-size root). */
const txt = (g, s, { bold = false, em = null } = {}) =>
    `<span style="font-size:${(em || g.textEm).toFixed(3)}em;font-weight:${bold ? 700 : 400};white-space:nowrap">${s}</span>`;

/** The variable x: upright (TY-2 allows no italic); the times sign is always the × glyph, never x. */
const X = '<span style="font-weight:400">x</span>';
const ruleHtml = (rule, variable = true) => `${variable ? `${X} ` : ''}${esc(ruleText(rule, { variable: false }))}`;

/** A right-pointing arrow (mm), black: a hairline shaft and a small solid head (INK-5). */
function arrow(g, wMm) {
    const h = 3;
    return `<svg viewBox="0 0 ${wMm} ${h}" width="${g.em(wMm)}" height="${g.em(h)}" style="display:inline-block;vertical-align:middle;overflow:visible" aria-hidden="true">`
        + `<line x1="0.3" y1="${h / 2}" x2="${wMm - 2}" y2="${h / 2}" stroke="#000" stroke-width="${(1 * PT_MM).toFixed(3)}"/>`
        + `<path d="M${wMm - 2.4} 0.2 L${wMm} ${h / 2} L${wMm - 2.4} ${h - 0.2} Z" fill="#000"/></svg>`;
}

/** The function machine: In -> [ rule ] -> Out, a box and two arrows (no picture, no colour). */
function machine(p, g, d, wMm) {
    const given = p.task !== 'rule';
    const inner = given ? txt(g, ruleHtml(p.rule), { bold: true }) : txt(g, 'rule');
    const boxH = d.machineH;
    return `<div class="ft-machine" data-ft-machine="1" style="display:flex;align-items:center;justify-content:center;gap:${g.em(1.5)};`
        + `width:${g.em(wMm)};margin:0 auto ${g.em(0.8)};white-space:nowrap">`
        + `${txt(g, 'In', { bold: true })}${arrow(g, 7)}`
        + `<span style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:${g.em(18)};height:${g.em(boxH)};`
        + `padding:0 ${g.em(2.5)};border:${HEAVY} solid ${INK.ink};background:#fff">${inner}</span>`
        + `${arrow(g, 7)}${txt(g, 'Out', { bold: true })}</div>`;
}

/** A writing box for slot `s` (screen twin: an input; sign / rule slots say what they take). */
function slotBox(g, s, d, vals, ink, extra = {}) {
    const shape = s.kind === 'sign' ? 'circle' : s.kind === 'rule' ? 'line' : 'box';
    const o = { wMm: d.boxW, hMm: d.boxH, value: vals[s.id] || '', ink, mark: 'cell', shape, ...extra };
    if (s.kind === 'sign') { o.wMm = d.signW; o.hMm = d.signW; o.extra = 'border-radius:50%;'; }
    let html = box(g, s.id, o);
    if (s.kind === 'rule') {
        // a writing LINE, not a box: the bottom rule only (the design standard's line slot)
        html = html.replace(/border:[^;]*;border-radius:[^;]*;/, `border:0;border-bottom:${HAIR} solid ${INK.ink};border-radius:0;`);
    }
    if (g.twin && (s.kind === 'sign' || s.kind === 'rule')) {
        html = html.replace(`data-ws-slot="${s.id}"`, `data-ws-slot="${s.id}" data-mq-kind="${s.kind}"${s.kind === 'rule' ? ' data-mq-w="12"' : ' data-mq-w="1"'}`);
    }
    return html;
}

function td(g, content, { w, h, head = false, extra = '', photocopySafe = false } = {}) {
    const bg = head && !photocopySafe ? INK.grey : '#fff';
    return `<${head ? 'th' : 'td'} style="box-sizing:border-box;width:${g.em(w)};min-width:${g.em(w)};height:${g.em(h)};padding:0 ${g.em(1)};`
        + `text-align:center;vertical-align:middle;border:${HAIR} solid ${INK.ink};background:${bg};white-space:nowrap;`
        + `font-weight:${head ? 700 : 400};${extra}">${content}</${head ? 'th' : 'td'}>`;
}

const numCell = (v) => `<span style="display:inline-block;line-height:1;vertical-align:middle;${KEY_FEATURES}">${esc(v)}</span>`;

function tableHtml(p, g, d, vals, ink, slotsById, ctx) {
    const pcs = !!ctx.photocopySafe;
    const expr = hasExprCol(p);
    const heads = [td(g, txt(g, `In (${X})`, { bold: true }), { w: d.colW, h: d.headH, head: true, photocopySafe: pcs, extra: `border-bottom:${HEAVY} solid ${INK.ink};` })];
    if (expr) heads.push(td(g, txt(g, ruleHtml(p.rule), { bold: true }), { w: d.exprW, h: d.headH, head: true, photocopySafe: pcs, extra: `border-bottom:${HEAVY} solid ${INK.ink};` }));
    heads.push(td(g, txt(g, 'Out', { bold: true }), { w: d.colW, h: d.headH, head: true, photocopySafe: pcs, extra: `border-bottom:${HEAVY} solid ${INK.ink};` }));
    let rows = `<tr>${heads.join('')}</tr>`;
    (p.rows || []).forEach((r, i) => {
        const inS = slotsById[`r${i}in`];
        const outS = slotsById[`r${i}out`];
        const cells = [td(g, inS ? slotBox(g, inS, d, vals, ink) : numCell(r.x), { w: d.colW, h: d.rowH })];
        if (expr) cells.push(td(g, txt(g, esc(ruleOn(p.rule, r.x))), { w: d.exprW, h: d.rowH }));
        cells.push(td(g, outS ? slotBox(g, outS, d, vals, ink) : numCell(r.y), { w: d.colW, h: d.rowH }));
        rows += `<tr>${cells.join('')}</tr>`;
    });
    return `<table class="ft-table" role="grid" aria-label="function table" style="border-collapse:collapse;table-layout:fixed;margin:0 auto;`
        + `border:${HEAVY} solid ${INK.ink};background:#fff">${rows}</table>`;
}

/** The width a cell gives its content at the section's column count (unknown: one column). */
const availMm = (ctx) => 186 / Math.max(1, Number(ctx && ctx.columns) || 1) - 6.5;
const lineW = (d) => Math.max(34, d.colW * 2 - 8);

/** "Rule:" beside the frame when the row fits the cell, else "The rule is:" on its own line. */
function ruleInline(p, g, d, ctx) {
    const w = p.support === 'line' ? lineW(d) + 0.6 * g.E + 2 : d.frameW;
    return 5 * 0.55 * d.textMm + 2 + w <= availMm(ctx);
}

/** Under the table: the rule to write (task 'rule'). */
function ruleAnswer(p, g, d, vals, ink, slots, ctx) {
    const own = slots.filter((s) => s.kind === 'sign' || /^n\d$/.test(s.id) || s.kind === 'rule');
    const gap = (mm) => `<span style="display:inline-block;width:${g.em(mm)}"></span>`;
    let frame;
    if (p.support === 'line') {
        frame = `${txt(g, X, { em: 1 })}${gap(2)}${slotBox(g, own[0], d, vals, ink, { wMm: lineW(d) })}`;
    } else {
        frame = `${txt(g, X, { em: 1 })}` + own.map((s) => gap(s.kind === 'sign' ? 1.5 : 0.8)
            + slotBox(g, s, d, vals, ink, s.kind === 'sign' ? {} : { wMm: d.ruleBoxW })).join('');
    }
    const row = (inner) => `<div style="display:inline-flex;align-items:center;white-space:nowrap">${inner}</div>`;
    const body = ruleInline(p, g, d, ctx)
        ? row(`${txt(g, 'Rule:', { bold: true })}${gap(2)}${frame}`)
        : `<div style="margin-bottom:${g.em(0.4)};line-height:1">${txt(g, 'The rule is:', { bold: true, em: Math.max(11 / g.pt, g.zoneEm) })}</div>${row(frame)}`;
    return `<div class="ft-rule" style="margin:${g.em(1.2)} auto 0;text-align:center">${body}</div>`;
}

/**
 * The Check row: a new In number and an Out box, "Check:" beside them when the row fits the
 * cell, above them when it does not. Its two cells are sized to their content (the number, the
 * writing box), not to the table's columns, so the row fits a third of the page.
 */
const checkW = (d) => ({ inW: Math.max(11, d.digitMm * d.maxDigits + 4), outW: d.boxW + 2.5 });
const checkInline = (d, ctx) => 6 * 0.55 * d.textMm + 2 + checkW(d).inW + checkW(d).outW <= availMm(ctx);

/**
 * On a wide print cell (two columns or fewer) the Check row stands BESIDE the table, under its
 * own "Check:" label, so the cell is no taller than the table and its rule: a page of hard tables
 * keeps six to a page at M and fills the Guided page at L. Never on screen (the drawing there
 * scales to the phone as one column).
 */
const sideW = (d) => Math.max(6 * 0.55 * d.textMm, checkW(d).inW + checkW(d).outW);
const checkSide = (p, g, d, ctx) => !!p.check && !g.twin && Number(ctx && ctx.columns) > 0
    && tableWidth(p, d) + 7 + sideW(d) <= availMm(ctx);

function checkRow(p, g, d, vals, ink, slotsById, ctx, side = false) {
    const s = slotsById.chk;
    const { inW, outW } = checkW(d);
    const ch = d.boxH + 2.5;                   // the Check row: one writing box tall, not a table row
    const cells = td(g, numCell(p.check.x), { w: inW, h: ch }) + td(g, slotBox(g, s, d, vals, ink), { w: outW, h: ch, extra: `padding:0 ${g.em(0.5)};` });
    const table = `<table style="border-collapse:collapse;table-layout:fixed;border:${HEAVY} solid ${INK.ink};background:#fff"><tr>${cells}</tr></table>`;
    if (side) {
        return `<div class="ft-check" style="grid-area:check;align-self:end;text-align:center">`
            + `<div style="margin-bottom:${g.em(0.8)}">${txt(g, 'Check:', { bold: true })}</div><div style="display:inline-block">${table}</div></div>`;
    }
    if (!checkInline(d, ctx)) {
        return `<div class="ft-check" style="margin:${g.em(1)} auto 0;text-align:center">`
            + `<div style="margin-bottom:${g.em(0.8)}">${txt(g, 'Check:', { bold: true })}</div><div style="display:inline-block">${table}</div></div>`;
    }
    return `<div class="ft-check" style="margin:${g.em(1)} auto 0;display:flex;align-items:center;justify-content:center;gap:${g.em(2)}">`
        + `${txt(g, 'Check:', { bold: true })}${table}</div>`;
}

function keyMap(p) {
    const k = {};
    for (const s of ftSlots(p)) k[s.id] = s.value;
    return k;
}

register('function-table', {
    render(p, ctx) {
        const g = geo(ctx);
        const d = dims(p, g);
        const slots = ftSlots(p);
        const slotsById = Object.fromEntries(slots.map((s) => [s.id, s]));
        const key = keyMap(p);
        const ink = inkOf(ctx);
        const vals = slotValues(ctx, key, (w) => {
            const l = splitParts(w);
            const o = {};
            slots.forEach((s, n) => { if (l[n] !== undefined) o[s.id] = l[n]; });
            return o;
        });
        const wMm = tableWidth(p, d);
        let inner = '';
        if (p.machine) inner += machine(p, g, d, wMm);
        else if (p.task !== 'rule') inner += `<div style="text-align:center;margin-bottom:${g.em(1.5)}">${txt(g, `Rule: ${ruleHtml(p.rule)}`, { bold: true })}</div>`;
        const side = checkSide(p, g, d, ctx) && !!slotsById.chk;
        if (side) {
            // DOM order stays the reading order (table, rule, Check), the grid places the Check
            // beside the table
            inner += `<div style="display:grid;grid-template-columns:auto auto;grid-template-areas:'table check' 'rule rule';`
                + `column-gap:${g.em(7)};justify-content:center;align-items:end">`
                + `<div style="grid-area:table">${tableHtml(p, g, d, vals, ink, slotsById, ctx)}</div>`
                + (p.task === 'rule' ? `<div style="grid-area:rule">${ruleAnswer(p, g, d, vals, ink, slots, ctx)}</div>` : '')
                + checkRow(p, g, d, vals, ink, slotsById, ctx, true)
                + '</div>';
        } else {
            inner += tableHtml(p, g, d, vals, ink, slotsById, ctx);
            if (p.task === 'rule') inner += ruleAnswer(p, g, d, vals, ink, slots, ctx);
            if (p.check && slotsById.chk) inner += checkRow(p, g, d, vals, ink, slotsById, ctx);
        }
        if (p.note) inner += `<div class="ft-note" style="margin-top:${g.em(2.5)};text-align:center">${txt(g, esc(p.note), { em: g.zoneEm })}</div>`;
        return root(g, 'function-table', `<div data-mq-join=", " style="display:inline-block;text-align:center">${inner}</div>`, 'text-align:center;', this.footprint(p, ctx).wMm);
    },
    answerKey(p) {
        const slots = ftSlots(p);
        const out = {};
        for (const s of slots) out[s.id] = { value: s.value, graded: true };
        const list = slots.map((s) => s.value);
        return { value: list.join(', '), display: list.join(', '), slots: out };
    },
    footprint(p, ctx) {
        const g = geo(ctx);
        const d = dims(p, g);
        const w = Math.max(tableWidth(p, d) + (checkSide(p, g, d, ctx) ? 7 + sideW(d) : 0), p.machine ? 52 : 0, p.task === 'rule' ? (p.support === 'line' ? lineW(d) + 6 : d.frameW + 2) : 0);
        let h = d.headH + (p.rows || []).length * d.rowH + 2;
        if (p.machine || p.task !== 'rule') h += d.machineH + 0.8;
        if (p.task === 'rule') h += 1.2 + d.signW + (ruleInline(p, g, d, ctx) ? 0 : Math.max(11, g.pt * g.zoneEm) * PT_MM + 0.6);
        if (p.check && !checkSide(p, g, d, ctx)) h += 1 + d.boxH + 2.5 + (checkInline(d, ctx) ? 0 : d.textMm * 1.4);
        if (p.note) h += 3 + d.textMm * 1.4;
        return { wMm: Math.ceil(w + 4), hMm: Math.ceil(h + 4), measure: true, factLike: false, maxCols: 3 };
    },
    inputs(p) {
        return ftSlots(p).map((s, n) => ({
            id: s.id, kind: s.kind === 'sign' ? 'sign' : s.kind === 'rule' ? 'text' : 'number',
            shape: s.kind === 'sign' ? 'circle' : s.kind === 'rule' ? 'line' : 'box',
            graded: true, order: n, inputmode: s.kind === 'num' ? 'numeric' : 'text', scopes: ['full'],
        }));
    },
    layout() { return { card: 'card-medium-visual', checker: 'list', requiresVisual: true }; },
});
