// js/modules/sheet/roles/stretch.js
// STRETCH (design/PAGE_TYPES.md 6.3): an open problem with several answers. A results table is
// the entry scaffold, so every pupil can start.
//
//   Prompt     a rounded read box (a read container, not a cell)
//   Table      header, one worked row traced in grey (PT-STC-1), then 3 to 6 empty rows; the
//              last column is always a self-check the pupil can compute (PT-STC-2)
//   Closing    "I found __ answers."  [ ] There are more.  [ ] I found them all. (PT-STC-3)
//   Count      one problem per page; two at S when both fit (ceiling 2 / 1 / 1)
//   Score      none - the answers vary (the approved mock-up); footer right says so
//   Key        the table filled with example answers that satisfy the check rule, so the key is
//              still a facsimile; "I found them all" is not ticked (there are more)
//
// WHERE THE OPEN PROBLEM COMES FROM (2026-09-26, systemic-fix lane). In this order:
//   1. The skill's provider `open(q, {size})` (SCC 3.2): the skill's own open problem, written by
//      its family lane. It returns the task below — {prompt: string[], columns: string[],
//      example: [], keyRows: [[]], rule?, total?, basic?} — or null when this item has none (the
//      host then deals another).
//   2. The DEFAULT, only where it is ON TOPIC: an item of one of the four operations with its own
//      two operands and a whole-number answer N: "two numbers <op> to N, find different pairs"
//      (the problem's own operation and numbers, so it is the skill's own question opened up).
//   3. Otherwise the skill has NO STRETCH YET and the role is WITHHELD for it (PAGE_TYPES allows a
//      role to be withheld): `supports()` names the reason, buildSheet throws it as `unsupported`,
//      and the print screen marks the Stretch card with it.
// Why withhold rather than a generic fallback: the two generic tasks this role used to print for
// every other skill were off topic — "Two numbers add to 18" on a counting picture, "Here is one
// problem and its answer" with the instruction as the problem and "B" as its answer, a figure skill
// without its figure — and failed every K picture skill and every figure skill (critics k2-r1,
// figures-r6). A made-up "make a problem like this one" for a picture, a graph or a clock asks a
// K pupil to author a drawn problem, which is not a stretch of the skill but a new, harder skill,
// and its key could only say "answers vary". An honest "not yet" costs the teacher one click; an
// off-topic page costs the pupil the lesson.
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, planItem, gridPart, instructionPart, assemble, poolItems,
    answerOf, opOf, operandsOf, esc, blank, writeLine, checkLine, slotKey,    judgeGroup,
} from './compose.js';
import { getProvider } from '../index.js';

export const ROLE_ID = 'stretch';

/** The reason the print screen shows when no chosen skill has an open problem yet. */
export const NO_STRETCH_REASON = 'No Stretch for this skill yet: it has no open problem of its own. '
    + 'Choose Reason It or True or False? for a thinking page.';

/** A provider's open task, checked for the shape this role draws; null when it is not usable. */
function providerTask(q, size) {
    let p = null;
    try { p = getProvider(q.categoryId || '', q.skillId || ''); } catch (e) { p = null; }
    if (!p || !Array.isArray(p.real) || !p.real.includes('open') || typeof p.open !== 'function') return undefined;
    let t = null;
    try { t = p.open(q, { size }); } catch (e) { t = null; }
    if (!t || !Array.isArray(t.prompt) || !t.prompt.length || !Array.isArray(t.columns) || !t.columns.length) return null;
    return {
        prompt: t.prompt.map(String), columns: t.columns.map(String),
        example: Array.isArray(t.example) ? t.example : [],
        keyRows: Array.isArray(t.keyRows) ? t.keyRows : [],
        rule: t.rule || '', total: t.total === undefined ? Infinity : t.total, basic: !!t.basic,
    };
}

/** True when this skill has a provider-written open problem (`open(q)`), whatever the item. */
export function hasOwnOpen(categoryId, skillId) {
    try {
        const p = getProvider(categoryId || '', skillId || '');
        return !!(p && Array.isArray(p.real) && p.real.includes('open') && typeof p.open === 'function');
    } catch (e) { return false; }
}

/**
 * Whether one question can be a Stretch problem, and why not. '' = yes (the provider's own open
 * problem, or the on-topic operation default); otherwise the reason. Pure: the print screen asks
 * it of sample items to mark the Stretch card before the teacher picks it.
 */
export function stretchWhy(q, size = 'L') {
    const task = openTask({ q }, size);
    return task ? '' : NO_STRETCH_REASON;
}

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1];

const EMPTY_ROWS = { S: 4, M: 6, L: 6 };
const toInt = (v) => Number(String(v).replace(/,/g, ''));

/**
 * The open task of one question: the provider's `open(q)`, else the on-topic operation default,
 * else null (no Stretch for this item; see the header).
 */
export function openTask(it, size = 'L') {
    const q = it.q || {};
    const own = providerTask(q, size);
    if (own !== undefined) return own;
    const ans = answerOf(it);
    // Only the four operations have an on-topic default. opOf falls back to the category; an item
    // that names another operation in its own fields (a fraction sum) is not a whole-number pair.
    const op = opOf(q);
    const ops = operandsOf(q);
    const N = /^-?\d+$/.test(ans.replace(/,/g, '')) ? toInt(ans) : null;
    const rowsN = EMPTY_ROWS[size] || 5;
    const pairs = [];
    const add = (a, b) => { const k = `${a},${b}`; if (!pairs.some((p) => p.k === k) && !(a === ops[0] && b === ops[1])) pairs.push({ a, b, k }); };
    if (N !== null && op && ops.length >= 2 && N >= 0) {
        if (op === 'add') {
            for (let a = N; a >= 0 && pairs.length < 8; a -= Math.max(1, Math.round(N / 7))) add(a, N - a);
            for (let a = N; a >= 0 && pairs.length < rowsN; a--) add(a, N - a);      // small N: every pair
        }
        if (op === 'subtract') { for (let b = 1; pairs.length < 8 && b < 60; b += Math.max(1, Math.round(Math.max(N, 10) / 8))) add(N + b, b); }
        if (op === 'multiply') { for (let a = 1; a <= N && pairs.length < 8; a++) if (N % a === 0) add(a, N / a); }
        if (op === 'divide') { for (let b = 1; pairs.length < 8 && b <= 12; b++) add(N * b, b); }
        const glyph = { add: '+', subtract: '−', multiply: '×', divide: '÷' }[op];
        const verb = { add: 'add to', subtract: 'have a difference of', multiply: 'multiply to make', divide: 'divide to make' }[op];
        const check = { add: 'Check: total', subtract: 'Check: difference', multiply: 'Check: product', divide: 'Check: quotient' }[op];
        return {
            prompt: [`Two numbers ${verb} ${N}.`, 'Find different pairs.'],
            columns: ['First number', 'Second number', check],
            example: [ops[0], ops[1], N],
            keyRows: pairs.slice(0, rowsN).map((p) => [p.a, p.b, N]),
            rule: `${glyph} = ${N}`,
            // How many answers there are in all (ordered pairs), so the key knows whether "I found
            // them all" is the true box: a + b = N has N + 1; a x b = N one per divisor.
            total: op === 'add' ? N + 1 : op === 'multiply' ? Array.from({ length: N }, (_, i) => i + 1).filter((d) => N % d === 0).length : Infinity,
            basic: false,
        };
    }
    // No on-topic default: "two numbers add to N" on a counting picture, or "here is one problem"
    // without its drawing, was the off-topic page this role must never print (header). Withheld.
    return null;
}

export function prepare(it, info = {}) {
    const size = info.size || 'L';
    const task = openTask(it, size);
    // No open problem for this item: the host deals another, and if none of the skill's items has
    // one, supports() withholds the role with its reason.
    if (!task) return null;
    // PT-STC-1: 3 to 6 empty rows, and never more rows than the key can fill (a key row per
    // empty row, AK-2). A number with fewer than three other answers (0 x n, a prime product,
    // a sum of 2) is no open problem: the host deals another.
    if (!task.basic && task.keyRows.length < 3) return null;
    const nRows = task.basic ? (EMPTY_ROWS[size] || 5) : Math.min(EMPTY_ROWS[size] || 5, task.keyRows.length);
    const slots = {};
    task.keyRows.slice(0, nRows).forEach((row, r) => row.forEach((v, c) => { slots[`st-${r}-${c}`] = v; }));
    slots['st-found'] = task.keyRows.length ? String(Math.min(nRows, task.keyRows.length) + 1) : '';
    const found = Math.min(nRows, task.keyRows.length) + 1;
    const all = task.keyRows.length > 0 && found >= (task.total || Infinity);
    slots['st-more'] = task.keyRows.length && !all ? '✓' : '';
    slots['st-all'] = all ? '✓' : '';
    const key = slotKey(slots, task.keyRows.length ? `${Math.min(nRows, task.keyRows.length) + 1} answers shown` : 'Answers vary');
    const render = (c) => {
        const head = `<tr>${task.columns.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>`;
        const ex = `<tr class="mq-ex">${task.example.map((v) => `<td><span class="ws-trace" data-ws-ink="trace">${esc(String(v))}</span></td>`).join('')}</tr>`;
        let body = '';
        for (let r = 0; r < nRows; r++) {
            body += `<tr>${task.columns.map((_, col) => {
                const v = c.state === 'answered' ? slots[`st-${r}-${col}`] : undefined;
                // A "problems like this one" table (basic) has no single right entry: its cells and
                // count are open answers, drawn but not graded, and the key says "Answers vary".
                return `<td data-ws-slot="st-${r}-${col}" data-ws-shape="open"${task.basic ? ' data-ws-graded="0"' : ''}>${v !== undefined && v !== '' ? `<b data-ws-ink="solid">${esc(String(v))}</b>` : ''}</td>`;
            }).join('')}</tr>`;
        }
        return `<div class="mq-stretch">`
            + `<div class="ws-story mq-prompt">${task.prompt.map((l) => `<div>${esc(l)}</div>`).join('')}</div>`
            + `<div class="mq-stretch-main"><table class="mq-table mq-cols${task.columns.length}">${head}${ex}${body}</table>`
            + `<div class="mq-closing"><div class="mq-frame">I found ${writeLine('st-found', c, key, 2, { graded: !task.basic })} answers.</div>`
            + judgeGroup('st-judge', `${checkLine('st-more', 'There are more.', c, key, { graded: false })}${checkLine('st-all', 'I found them all.', c, key, { graded: false })}`, 'mq-stjudge')
            + `</div></div></div>`;
    };
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true, visual: false,
        footprint: { measure: true, hMm: null, maxCols: 1, size: 'spacious' },
        fclass: 'standard', thinking: { task },
        cellCls: [it.cellCls || '', 'mq-thinkcell mq-stretchcell'].join(' ').trim(),
    });
}

/**
 * Withhold the role when nothing could be dealt (buildSheet throws the reason as `unsupported`,
 * and the print screen shows it on the Stretch card).
 */
export function supports(items) {
    return items && items.length ? '' : NO_STRETCH_REASON;
}

export function counts(pools, input) {
    const ctx = ctxOf(input);
    const items = pools.main || [];
    if (ctx.size !== 'S') return { main: 1 };
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Stretch A', title: 'Stretch' });
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const h = Math.max(...items.map((it) => (it.measured && it.measured[1] && it.measured[1].hMm) || 999), 0);
    return { main: 2 * h + 2 <= m.body - m.instr ? 2 : 1 };
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    // never the same open problem twice on one page (critic figures-r6)
    const seen = new Set();
    const all = poolItems(input, 'main').filter((it) => {
        const t = it.thinking && it.thinking.task;
        const k = t ? `${t.prompt.join(' ')}|${t.columns.join('|')}` : null;
        if (k === null) return true;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
    const n = Math.max(1, Math.min(ctx.size === 'S' ? 2 : 1, all.length));
    const items = all.slice(0, n);
    const basic = items.some((it) => it.thinking && it.thinking.task && it.thinking.task.basic);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Stretch A', title: 'Stretch', score: 0,
        footerRight: [`Form ${input.form || 'A'}`, 'Answers vary', basic ? 'basic' : ''].filter(Boolean).join(' · ') });
    const grid = gridPart(items.map((it) => planItem(it, { cols: 1 })), { cols: 1, rows: items.length, labels: 'letter', start: 1 });
    grid.cls = ''; grid.height = '';
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart('stretch'), grid] }], {
        meta: { items: items.length, scoreOutOf: 0, basic, fits: [{ cols: 1, rows: items.length, line: `Fits: 1 open problem${items.length > 1 ? 's' : ''} per page.` }] },
    });
}

export default { ROLE_ID, sources, measureCols, prepare, supports, counts, plan, openTask, stretchWhy, hasOwnOpen, NO_STRETCH_REASON };
