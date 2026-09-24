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
// The DEFAULT ADAPTER of section 10 (`open(q)` not supplied): "find different problems with the
// answer N", columns = the skill's operands plus the check. For the four operations the operands
// are the problem's own; for any other whole-number answer N the task is "two numbers that add to
// N". A skill whose answer is not a whole number prints the "problems like this one" table (basic).
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, bandMetrics, planItem, gridPart, instructionPart, assemble, poolItems,
    answerOf, opOf, operandsOf, esc, blank, writeLine, checkLine, slotKey,
} from './compose.js';

export const ROLE_ID = 'stretch';

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1];

const EMPTY_ROWS = { S: 4, M: 5, L: 5 };
const toInt = (v) => Number(String(v).replace(/,/g, ''));

/** The open task of one question (`open(q)` default): prompt, columns, example row, key rows. */
export function openTask(it, size = 'L') {
    const q = it.q || {};
    const ans = answerOf(it);
    const op = opOf(q);
    const ops = operandsOf(q);
    const N = /^-?\d+$/.test(ans.replace(/,/g, '')) ? toInt(ans) : null;
    const rowsN = EMPTY_ROWS[size] || 5;
    const pairs = [];
    const add = (a, b) => { const k = `${a},${b}`; if (!pairs.some((p) => p.k === k) && !(a === ops[0] && b === ops[1])) pairs.push({ a, b, k }); };
    if (N !== null && op && ops.length >= 2 && N >= 0) {
        if (op === 'add') { for (let a = N; a >= 0 && pairs.length < 8; a -= Math.max(1, Math.round(N / 7))) add(a, N - a); }
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
            basic: false,
        };
    }
    if (N !== null && N >= 2) {
        for (let a = N - 1; a >= 0 && pairs.length < 8; a -= Math.max(1, Math.round(N / 7))) add(a, N - a);
        return {
            prompt: [`Two numbers add to ${N}.`, 'Find different pairs.'],
            columns: ['First number', 'Second number', 'Check: total'],
            example: [N, 0, N],
            keyRows: pairs.filter((p) => !(p.a === N && p.b === 0)).slice(0, rowsN).map((p) => [p.a, p.b, N]),
            rule: `+ = ${N}`,
            basic: false,
        };
    }
    // Basic: not a whole-number answer. The pupil finds more problems with the same kind of answer.
    const text = String(q.printText || q.text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
    return {
        prompt: ['Here is one problem and its answer.', 'Find more problems like it. Solve them.'],
        columns: ['Problem', 'Answer'],
        example: [text || 'the problem above', ans || '—'],
        keyRows: [],
        rule: '',
        basic: true,
    };
}

export function prepare(it, info = {}) {
    const size = info.size || 'L';
    const task = openTask(it, size);
    const nRows = EMPTY_ROWS[size] || 5;
    const slots = {};
    task.keyRows.forEach((row, r) => row.forEach((v, c) => { slots[`st-${r}-${c}`] = v; }));
    slots['st-found'] = task.keyRows.length ? String(task.keyRows.length + 1) : '';
    slots['st-more'] = task.keyRows.length ? '✓' : '';
    const key = slotKey(slots, task.keyRows.length ? `${task.keyRows.length + 1} answers shown` : 'Answers vary');
    const render = (c) => {
        const head = `<tr>${task.columns.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>`;
        const ex = `<tr class="mq-ex">${task.example.map((v) => `<td><span class="ws-trace" data-ws-ink="trace">${esc(String(v))}</span></td>`).join('')}</tr>`;
        let body = '';
        for (let r = 0; r < nRows; r++) {
            body += `<tr>${task.columns.map((_, col) => {
                const v = c.state === 'answered' ? slots[`st-${r}-${col}`] : undefined;
                return `<td data-ws-slot="st-${r}-${col}" data-ws-shape="open">${v !== undefined && v !== '' ? `<b data-ws-ink="solid">${esc(String(v))}</b>` : ''}</td>`;
            }).join('')}</tr>`;
        }
        return `<div class="mq-stretch">`
            + `<div class="ws-story mq-prompt">${task.prompt.map((l) => `<div>${esc(l)}</div>`).join('')}</div>`
            + `<div class="mq-stretch-main"><table class="mq-table mq-cols${task.columns.length}">${head}${ex}${body}</table>`
            + `<div class="mq-closing"><div class="mq-frame">I found ${writeLine('st-found', c, key, 2)} answers.</div>`
            + `${checkLine('st-more', 'There are more.', c, key)}${checkLine('st-all', 'I found them all.', c, key)}</div></div>`
            + `</div>`;
    };
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true, visual: false,
        footprint: { measure: true, hMm: null, maxCols: 1, size: 'spacious' },
        fclass: 'standard', thinking: { task },
        cellCls: [it.cellCls || '', 'mq-thinkcell mq-stretchcell'].join(' ').trim(),
    });
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
    const all = poolItems(input, 'main');
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

export default { ROLE_ID, sources, measureCols, prepare, counts, plan, openTask };
