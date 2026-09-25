// Unit tests for the step-by-step anchor problems (design/SUPPORTS.md S5-S6):
// js/modules/sheet/steps.js, js/modules/sheet/anchors.js, the templates' `stepState`, and the
// anchor layouts of the practice roles (roles/practice.js) and Mixed practice.
//
//   node tests/scripts/ws-anchors-unit.mjs              # pure node, then a real build in Chrome
//   node tests/scripts/ws-anchors-unit.mjs --no-browser # pure node only
//
// What is held here
//   - STEP STATES per template (P-LC-9): stack, fact, equation, long division and the area model
//     draw the cell after step k with the NEWEST marks grey and the earlier marks black, and
//     nothing from a later step
//   - the anchor's strip: 2-4 states, numbered step lines of at most 10 words (P-5), a Say line
//   - UNSCORED + MODEL TAB (PT-LBL-6): no data-ws-slot inside an anchor, the Model tab on its cell,
//     no label, and the Score counts pupil problems only
//   - KEY GEOMETRY (AK-1): every anchor draws byte-for-byte the same on the pupil page and the key,
//     with no gap reported
//   - NO ORPHANED ANCHOR (PG-21 / PG-23): an anchor band is always followed, on its own page, by its
//     block's problems; blocks are never split and short last pages are rebalanced
//   - NEVER A PUPIL ITEM (review note 5): pickDistinct, and in the browser every real anchor of
//     add, subtract, mult_facts, add_column_multi, long_div_2digit and area_model_mult is none of
//     the page's problems
//
// Prints `ws-anchors-unit: OK` or `ws-anchors-unit: FAIL (n)` and exits non-zero on failure.

import { createRequire } from 'module';
import {
    renderCell, cellAnswerKey, cellFootprint, resolveCtx, getCell, getProvider,
} from '../../js/modules/sheet/index.js';
import { stepMarks, placeDigits } from '../../js/modules/sheet/steps.js';
import {
    anchorGroups, anchorHtml, anchorItem, stepLines, wordCount, blockPlan, blockPages, pickDistinct,
    sideItems, pupilCount, normaliseAnchors, anchorEligible,
} from '../../js/modules/sheet/anchors.js';
import { plan as independentPlan } from '../../js/modules/sheet/roles/independent.js';
import { plan as morePracticePlan } from '../../js/modules/sheet/roles/more-practice.js';
import { plan as mixedPlan, counts as mixedCounts } from '../../js/modules/sheet/roles/mixed-practice.js';
import { renderPlan } from '../../js/modules/sheet/roles/practice.js';

let pass = 0;
const fails = [];
const ok = (cond, what) => { if (cond) pass++; else fails.push(what); return !!cond; };
const eq = (got, want, what) => ok(JSON.stringify(got) === JSON.stringify(want), `${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

const ctxL = (extra = {}) => resolveCtx(Object.assign({ mode: 'print', size: 'L', look: 'ican', state: 'blank', scaffoldLevel: 3 }, extra));
/** The characters written in trace grey / solid black inside a drawing. */
const inked = (html, ink) => [...String(html).matchAll(new RegExp(`data-ws-ink="${ink}"[^>]*>([^<]*)<`, 'g'))].map((m) => m[1]).join('');
const traced = (h) => inked(h, 'trace');
const solid = (h) => inked(h, 'solid');

/* ======================================================================= 1. steps.js */

{
    const steps = [{ marks: [] }, { marks: [{ slot: 'ones', value: '4' }, { slot: 'regroup:tens', value: '1' }] }, { marks: [{ slot: 'tens', value: '22' }] }, { marks: [{ slot: 'answer', value: '224' }] }];
    eq(stepMarks(steps, 0), [], 'stepMarks k=0 draws nothing');
    eq(stepMarks(steps, 1).map((m) => m.ink), ['trace', 'trace'], 'stepMarks: the newest step is grey');
    eq(stepMarks(steps, 2).map((m) => m.ink), ['solid', 'solid', 'trace'], 'stepMarks: earlier steps are black');
    const row = placeDigits(4, stepMarks(steps, 2));
    eq(row.map((t) => (t ? t.ch + t.ink[0] : '.')), ['.', '2t', '2t', '4s'], 'placeDigits: "22" for the tens fills tens and hundreds');
    const all = placeDigits(4, stepMarks(steps, 3));
    eq(all.map((t) => (t ? t.ch + t.ink[0] : '.')), ['.', '2s', '2s', '4s'], 'placeDigits: a final whole answer keeps the ink of digits already written');
}

/* ================================================================== 2. step states */

const STACK = { operands: [57, 64, 50, 53], op: '+', regroup: 'add', heads: false, answer: 'boxes', ansDigits: 3 };
const STACK_STEPS = [
    { marks: [{ slot: 'ones', value: '4' }, { slot: 'regroup:tens', value: '1' }] },
    { marks: [{ slot: 'tens', value: '22' }] },
    { marks: [{ slot: 'answer', value: '224' }] },
];
{
    const t = getCell('stack');
    ok(typeof t.stepState === 'function', 'stack has stepState');
    const s0 = t.stepState(STACK, STACK_STEPS, 0, ctxL());
    eq([traced(s0), solid(s0)], ['14', ''], 'stack k=0: the ones digit and its regroup digit, both grey');
    const s1 = t.stepState(STACK, STACK_STEPS, 1, ctxL());
    eq([traced(s1).split('').sort().join(''), solid(s1).split('').sort().join('')], ['22', '14'], 'stack k=1: tens grey, ones and regroup black');
    const s2 = t.stepState(STACK, STACK_STEPS, 2, ctxL());
    eq(traced(s2), '', 'stack k=2: the final answer mark writes no new digit');
    // Same geometry as the blank cell: the same tracks and the same boxes.
    const blank = renderCell({ cell: { template: 'stack', payload: STACK } }, ctxL());
    eq((s1.match(/class="ab/g) || []).length, (blank.match(/class="ab/g) || []).length, 'stack step state keeps the answer boxes of the cell');
    eq((s1.match(/class="rg/g) || []).length, (blank.match(/class="rg/g) || []).length, 'stack step state keeps the regroup boxes of the cell');
}
{
    const t = getCell('fact');
    ok(typeof t.stepState === 'function', 'fact has stepState');
    const p = { a: 6, b: 13, op: '+', notation: 'vertical', digits: 2 };
    const st = [{ text: 'Line up.', marks: [] }, { marks: [{ slot: 'ones', value: '9' }] }, { marks: [{ slot: 'tens', value: '1' }] }, { marks: [{ slot: 'answer', value: '19' }] }];
    const c = ctxL({ options: { factColumns: 5 } });
    eq(traced(t.stepState(p, st, 0, c)) + solid(t.stepState(p, st, 0, c)), '', 'fact k=0: nothing written');
    eq(traced(t.stepState(p, st, 1, c)), '9', 'fact k=1: the ones grey');
    const k2 = t.stepState(p, st, 2, c);
    eq([traced(k2), solid(k2)], ['1', '9'], 'fact k=2: tens grey, ones black');
    // A 3-track addition fact at 4 columns is drawn as a stack, and hands over to its step state.
    const st3 = t.stepState({ a: 46, b: 38, op: '+', notation: 'vertical', digits: 3 }, [{ marks: [{ slot: 'ones', value: '4' }, { slot: 'regroup:tens', value: '1' }] }], 0, ctxL({ options: { factColumns: 4 } }));
    ok(/ws-stack/.test(st3) && traced(st3) === '14', 'fact drawn as a stack uses the stack step state');
    // Horizontal: one slot.
    const across = { a: 7, b: 8, op: '*', notation: 'horiz', digits: 2 };
    const ast = [{ marks: [] }, { marks: [{ slot: 'ans', value: '56' }] }];
    ok(!/56/.test(t.stepState(across, ast, 0, c).replace(/data-[^ >]*/g, '')), 'across fact k=0: blank');
    eq(traced(t.stepState(across, ast, 1, c)), '56', 'across fact k=1: the answer written, grey');
}
{
    const t = getCell('equation');
    ok(typeof t.stepState === 'function', 'equation has stepState');
    const p = { a: 3, b: 4, op: '+', unknown: 'result' };
    const st = [{ marks: [] }, { marks: [{ slot: 'answer', value: '7' }] }];
    ok(!/>7</.test(t.stepState(p, st, 0, ctxL())), 'equation k=0: blank');
    ok(/ws-trace|data-ws-ink="trace"/.test(t.stepState(p, st, 1, ctxL())), 'equation k=1: the answer in trace grey');
}
{
    const t = getCell('division');
    ok(typeof t.stepState === 'function', 'division has stepState');
    const p = { dividend: 2304, divisor: 36, quotient: 64, workRows: 4 };
    const st = [{ marks: [] }, { marks: [{ slot: 'q0', value: '6' }] }, { marks: [{ slot: 'q1', value: '4' }] }, { marks: [{ slot: 'answer', value: '64' }] }];
    eq([traced(t.stepState(p, st, 0, ctxL())), solid(t.stepState(p, st, 0, ctxL()))], ['', ''], 'division k=0: nothing written');
    const k1 = t.stepState(p, st, 1, ctxL());
    ok(traced(k1).startsWith('6') && solid(k1) === '', 'division k=1: the first quotient digit and its work rows grey');
    const k2 = t.stepState(p, st, 2, ctxL());
    ok(traced(k2).startsWith('4') && solid(k2).startsWith('6'), 'division k=2: the new digit grey, the first black');
}
{
    const t = getCell('area-model');
    ok(typeof t.stepState === 'function', 'area-model has stepState');
    const p = { multiplier: 6, parts: [60, 8], product: 408 };
    const st = [{ marks: [] }, { marks: [{ slot: 'part0', value: '360' }] }, { marks: [{ slot: 'part1', value: '48' }] }, { marks: [{ slot: 'total', value: '408' }] }];
    eq(traced(t.stepState(p, st, 1, ctxL())), '360', 'area model k=1: part 1 grey');
    const k3 = t.stepState(p, st, 3, ctxL());
    eq([traced(k3), solid(k3)], ['408', '36048'], 'area model k=3: the total grey, the parts black');
}

/* ================================================================ 3. the strip */

{
    const none = { text: 'Think.', marks: [] };
    const m = (slot) => ({ text: 'Write it.', marks: [{ slot, value: '1' }] });
    eq(anchorGroups([none, none, none, m('ans')]).map((g) => g.steps), [[0, 1, 2], [3]], 'groups: a fact with one mark gets the problem, then the answer');
    eq(anchorGroups([none, m('ones'), m('tens'), m('answer')]).map((g) => g.steps), [[0], [1], [2], [3]], 'groups: four states');
    ok(anchorGroups([m('a'), m('b'), m('c'), m('d'), m('e'), m('f')]).length === 4, 'groups: at most 4 states');
    ok(anchorGroups([none, m('ones'), m('answer')]).length >= 2, 'groups: at least 2 states');
    eq(stepLines('Bring down 4: 144. 144 ÷ 36 = 4. 4 × 36 = 144.'), ['Bring down 4: 144.', '144 ÷ 36 = 4.', '4 × 36 = 144.'], 'stepLines: one sentence a line');
    eq(stepLines('Think addition: 5 + ? = 11.'), ['Think addition: 5 + ? = 11.'], 'stepLines: never splits a number sentence');
    eq(normaliseAnchors('Side by side'), 'side', 'normaliseAnchors side');
    eq(normaliseAnchors('on'), 'sections', 'normaliseAnchors on = sections');
    eq(normaliseAnchors(undefined), 'off', 'normaliseAnchors default off');
}

/* =============================================== 4. host-shaped items, pure node */

/** A host item (the shape print-sheet.js hostItem makes), drawn through the kit. */
function hostItem(q, section = 0) {
    const key = cellAnswerKey(q);
    const ans = String(q.ans);
    const render = (c, { shown, ink } = {}) => renderCell(q, resolveCtx(Object.assign({}, c, shown !== undefined ? { state: ink === 'trace' && String(shown) === ans ? 'traced' : 'wrong', wrong: { value: shown } } : {})));
    let fp;
    try { fp = cellFootprint(q, resolveCtx({ mode: 'print', size: 'L', look: 'ican' })); } catch (e) { fp = { wMm: 60, hMm: 40, maxCols: 3 }; }
    return { q, render, key, footprint: fp, section, skill: `${q.categoryId}:${q.skillId}`, fclass: 'standard', template: q.cell.template, answerType: 'number' };
}
const addQ = (a, b) => ({ categoryId: 'addition', skillId: 'add_column_multi', text: `${a} + ${b} = ?`, ans: a + b, operands: [a, b],
    cell: { template: 'stack', payload: { operands: [a, b], op: '+', regroup: 'add', answer: 'boxes', ansDigits: 3 } } });
const factQ = (a, b) => ({ categoryId: 'multiplication', skillId: 'mult_facts', text: `${a} × ${b} = ?`, ans: a * b, a, b,
    cell: { template: 'fact', payload: { a, b, op: '*', notation: 'vertical', digits: 3 } } });

{
    const ex = hostItem(addQ(21, 13));
    ok(anchorEligible(ex), 'add_column_multi has an anchor (real workedSteps)');
    const html = anchorHtml(ex, ctxL({ scaffoldLevel: 1 }), { variant: 'band', twinCols: 4 });
    ok(!/ data-ws-slot=/.test(html), 'an anchor offers no slot (unscored, the key cannot re-fill it)');
    ok(/data-ws-anchor="band"/.test(html) && /Say:/.test(html), 'the band carries its Say line');
    const n = Number((/data-ws-states="(\d)"/.exec(html) || [])[1]);
    ok(n >= 2 && n <= 4, `the band has 2-4 states (${n})`);
    const lines = [...html.matchAll(/<li[^>]*><em>[^<]*<\/em><span>([^<]*)<\/span><\/li>/g)].map((m) => m[1]);
    ok(lines.length >= 2 && lines.every((t) => wordCount(t) <= 10), `every step line is 10 words or fewer (${lines.filter((t) => wordCount(t) > 10).join(' | ')})`);
    ok(/ws-trace|data-ws-ink="trace"/.test(html), 'the newest marks are grey');
    // A skill without real workedSteps: no anchor.
    const legacyQ = { categoryId: 'geometry', skillId: 'angle_measure', text: 'x', ans: 1, cell: { template: 'equation', payload: { a: 1, b: 0, op: '+' } } };
    ok(!anchorEligible(hostItem(legacyQ)), 'a skill with no real workedSteps gets no anchor');
}
{
    const cands = ['a', 'b', 'c'].map((s) => ({ s }));
    eq(pickDistinct(cands, new Set(['b']), 3, (x) => x.s).map((x) => x.s), ['a', 'c', 'a'], 'pickDistinct skips a pupil item and cycles');
    eq(pickDistinct(cands, new Set(['a', 'b', 'c']), 2, (x) => x.s), [], 'pickDistinct: nothing when every example is a pupil item');
    const tw = { anchor: 'side' };
    eq(sideItems([{ i: 1 }, { i: 2 }], [tw, tw]).map((x) => (x.anchor ? 'T' : x.i)), ['T', 1, 'T', 2], 'side by side: example first, then the problem');
    eq(pupilCount([tw, { q: 1 }, tw, { q: 2 }]), 2, 'pupilCount skips anchors');
}

/* ============================================================== 5. block pagination */

{
    const bp = blockPlan({ cols: 3, hMin: 50, cellH: 60, bodyMm: 232, instrMm: 9, anchorMm: 50 });
    eq([bp.blockRows, bp.perBlock, bp.blocksPerPage, bp.perPage], [1, 3, 2, 6], 'blockPlan: 3 columns, 2 blocks of 3');
    ok(2 * bp.blockMm + 9 <= 232, 'blockPlan: the blocks fit the body');
    const bp2 = blockPlan({ cols: 2, hMin: 35, cellH: 45, bodyMm: 232, instrMm: 9, anchorMm: 38 });
    eq([bp2.blockRows, bp2.perBlock], [2, 4], 'blockPlan: 2 columns, blocks of 4');
    const tall = blockPlan({ cols: 3, hMin: 70, cellH: 70, bodyMm: 232, instrMm: 9, anchorMm: 70 });
    eq([tall.blocksPerPage, tall.blockRows], [1, 2], 'blockPlan: one block a page takes the rows that fit (never a half-empty page)');
    // 5 blocks at 2 a page: 2 / 2 / 1 would leave a lone block, a third of a page or less -> rebalanced.
    const pages = blockPages(15, { perBlock: 3, blocksPerPage: 3 }, 3, 50);
    eq(pages.map((p) => p.blocks.length), [3, 2], 'blockPages: whole blocks per page');
    const reb = blockPages(21, { perBlock: 3, blocksPerPage: 3 }, 3, 50);
    eq(reb.map((p) => p.blocks.length), [3, 2, 2], 'blockPages: PG-23 rebalances a lone last block');
    ok(reb.every((p) => p.anchorMm === p.blocks.length * 50), 'blockPages: each page carries its anchor bands');
}

/* =============================================================== 6. whole plans */

/** Measured sizes (pure node has no DOM): generous fixed heights so the layout is deterministic. */
function measured(it, h = 45) { it.measured = { 1: { hMm: h, fits: true }, 2: { hMm: h, fits: true }, 3: { hMm: h, fits: true }, 4: { hMm: h, fits: true }, 6: { hMm: h, fits: true } }; return it; }

function checkPlan(plan, what, { anchors, scored }) {
    const out = renderPlan(plan, { key: true });
    const pupil = out.pupilHtml;
    const key = out.keyHtml;
    const tabs = (pupil.match(/data-ws-label="model"/g) || []).length;
    ok(tabs === anchors, `${what}: ${anchors} Model tabs (got ${tabs})`);
    const aP = pupil.match(/<div class="mq-anchor[\s\S]*?(?=<\/div><\/div><div class="ws-cell|<\/div><\/div><\/div>)/g) || [];
    const aK = key.match(/<div class="mq-anchor[\s\S]*?(?=<\/div><\/div><div class="ws-cell|<\/div><\/div><\/div>)/g) || [];
    ok(aP.length === anchors && JSON.stringify(aP) === JSON.stringify(aK), `${what}: every anchor draws the same on the pupil page and the key`);
    ok(!(out.gaps || []).length, `${what}: no key gap`);
    const scores = [...pupil.matchAll(/class="ws-field score">Score<i><\/i><b>\/(\d+)<\/b>/g)].map((m) => Number(m[1]));
    ok(scores.length && scores.every((s) => s === scored), `${what}: Score /${scored} counts pupil problems only (got ${scores.join(',')})`);
    const letters = (pupil.match(/data-ws-label="(?:letter|tab)"/g) || []).length;
    ok(letters === scored * (plan.sheets ? plan.sheets.length : 1) || letters === scored, `${what}: only pupil problems are labelled (${letters})`);
    // No orphan: on every page an anchor grid is followed by a problem grid on the same page.
    for (const [pi, pg] of (plan.pages || []).entries()) {
        const parts = pg.sections;
        parts.forEach((p, i) => {
            if (p.kind === 'grid' && /mq-anchorgrid/.test(p.cls || '')) {
                const nx = parts[i + 1];
                ok(nx && nx.kind === 'grid' && !/mq-anchorgrid/.test(nx.cls || '') && nx.items.length > 0, `${what}: page ${pi + 1} anchor ${i} is followed by its problems`);
            }
        });
    }
    return out;
}

{
    // SECTIONS, Independent: 12 problems of a skill, an anchor per block.
    const pupil = Array.from({ length: 12 }, (_, i) => measured(hostItem(addQ(20 + i * 3, 11 + i))));
    const exs = [addQ(10, 11), addQ(12, 13), addQ(14, 15), addQ(16, 11)].map((q) => measured(anchorItem(hostItem(q), { variant: 'band', twinCols: 4 }), 40));
    const input = {
        items: pupil, skills: [{ categoryId: 'addition', skillId: 'add_column_multi', label: 'Add', grade: '2' }],
        sections: [{ columns: 'auto', maxCols: 4 }], ctx: { size: 'L', look: 'ican', paper: 'A4' }, seed: 5,
        anchors: { mode: 'sections', bySection: [exs], bandMm: [46] },
    };
    const plan = independentPlan(input);
    const f = plan.meta.fits[0];
    ok(f.blocks && f.blocks.perBlock >= 3 && f.blocks.perBlock <= 6, `sections: a block holds 3-6 problems (${f.blocks && f.blocks.perBlock})`);
    const nBlocks = plan.pages.flatMap((p) => p.sections).filter((p) => /mq-anchorgrid/.test(p.cls || '')).length;
    checkPlan(plan, 'independent sections', { anchors: nBlocks, scored: 12 });
    ok(nBlocks === Math.ceil(12 / f.blocks.perBlock), `sections: one anchor per block (${nBlocks})`);
    // Distinct examples in order, never the pupil's own.
    const pupilTexts = new Set(pupil.map((it) => it.q.text));
    ok(exs.every((a) => !pupilTexts.has(a.source.q.text)), 'sections: the examples are none of the pupil problems');
}
{
    // SIDE BY SIDE, Independent and More Practice: rows of [twin | problem].
    const pupil = Array.from({ length: 6 }, (_, i) => measured(hostItem(factQ(3 + i, 7))));
    pupil.forEach((it, i) => { it.twin = measured(anchorItem(hostItem(factQ(2, 2 + i)), { variant: 'side', twinCols: 2 }), 50); });
    const input = {
        items: pupil, skills: [{ categoryId: 'multiplication', skillId: 'mult_facts', label: 'Multiply', grade: '3' }],
        sections: [{ columns: 2 }], ctx: { size: 'L', look: 'ican', paper: 'A4' }, seed: 5,
        anchors: { mode: 'side', bySection: [[]], bandMm: [0] },
    };
    const plan = independentPlan(input);
    const cells = plan.pages.flatMap((p) => p.sections).filter((p) => p.kind === 'grid').flatMap((g) => g.items);
    ok(cells.every((it, i) => (i % 2 === 0 ? it.anchor && it.model && it.nolabel : !it.anchor)), 'side: every row is [twin | problem], the twin first');
    checkPlan(plan, 'independent side', { anchors: 6, scored: 6 });
    const mp = morePracticePlan(Object.assign({}, input, { items: pupil.map((it, i) => Object.assign(it, { letter: i < 3 ? 'A' : 'B' })) }));
    ok(mp.sheets.length === 2 && mp.sheets.every((s) => s.meta.scoreOutOf === 3), `more practice side: each letter scores its own 3 problems (${mp.sheets.map((s) => s.meta.scoreOutOf)})`);
}
{
    // MIXED PRACTICE, sections: one compact anchor on each skill's first shelf band.
    const pools = { s0: Array.from({ length: 8 }, (_, i) => measured(hostItem(addQ(20 + i, 15)), 40)), s1: Array.from({ length: 8 }, (_, i) => measured(hostItem(factQ(4 + i % 6, 6)), 40)) };
    Object.entries(pools).forEach(([id, list]) => list.forEach((it) => { it.pool = id; }));
    const band = (q) => measured(anchorItem(hostItem(q), { variant: 'compact', twinCols: 4 }), 36);
    const input = {
        skills: [{ categoryId: 'addition', skillId: 'add_column_multi', label: 'Add', grade: '2' }, { categoryId: 'multiplication', skillId: 'mult_facts', label: 'Multiply', grade: '3' }],
        pools: [{ id: 's0', weight: 1 }, { id: 's1', weight: 1 }], ctx: { size: 'L', look: 'daily', paper: 'A4' }, seed: 3,
        anchors: { mode: 'sections', byPool: { s0: { band: [band(addQ(10, 11))] }, s1: { band: [band(factQ(2, 3))] } } },
    };
    const want = mixedCounts(pools, input);
    input.items = [...pools.s0.slice(0, want.s0), ...pools.s1.slice(0, want.s1)];
    const plan = mixedPlan(input);
    const total = want.s0 + want.s1;
    checkPlan(plan, 'mixed sections', { anchors: 2, scored: total });
    const bands = plan.pages.flatMap((p) => p.sections).filter((p) => p.kind === 'band' && Array.isArray(p.contents));
    ok(bands.length === 2 && bands.every((b) => /mq-anchorgrid/.test(b.contents[0].cls) && b.contents[1].items.length), 'mixed: each skill band opens with its example, then its problems');
}

{
    // SIDE BY SIDE in ONE column (a wide problem): whole pairs per page, never a twin at the foot of
    // a page with its problem overleaf.
    const wide = (it) => Object.assign(it, { fclass: 'wide', footprint: Object.assign({}, it.footprint, { maxCols: 1 }) });
    const pupil = Array.from({ length: 5 }, (_, i) => wide(measured(hostItem(addQ(30 + i, 12)), 60)));
    pupil.forEach((it, i) => { it.twin = wide(measured(anchorItem(hostItem(addQ(10 + i, 11)), { variant: 'side', twinCols: 1 }), 60)); });
    const plan = independentPlan({
        items: pupil, skills: [{ categoryId: 'addition', skillId: 'add_column_multi', label: 'Add', grade: '2' }],
        sections: [{ columns: 2 }], ctx: { size: 'L', look: 'ican', paper: 'A4' }, seed: 5, anchors: { mode: 'side', bySection: [[]], bandMm: [0] },
    });
    const grids = plan.pages.map((pg) => pg.sections.filter((p) => p.kind === 'grid').flatMap((g) => g.items));
    ok(grids.every((its) => its.length % 2 === 0 && its.every((it, i) => !!it.anchor === (i % 2 === 0))), `side, one column: whole [twin, problem] pairs on every page (${grids.map((g) => g.length)})`);
    checkPlan(plan, 'independent side 1 column', { anchors: 5, scored: 5 });
}

/* ================================================= 7. the real builds (Chrome) */

async function browserChecks() {
    const require = createRequire(import.meta.url);
    let harness;
    try { harness = require('../lib/ws-harness.cjs'); } catch (e) { fails.push(`browser harness: ${e.message}`); return; }
    const app = await harness.open({ seed: 1 });
    try {
        const SKILLS = ['addition:add', 'subtraction:subtract', 'multiplication:mult_facts', 'addition:add_column_multi', 'division:long_div_2digit', 'multiplication:area_model_mult'];
        const res = await app.page.evaluate(async (SKILLS) => {
            const out = [];
            const one = async (role, skills, anchors) => {
                const r = await window.buildSheet({ role, sections: [{ skills, columns: 'auto' }], size: 'L', seed: 4242, anchors, key: true });
                const d = document.createElement('div');
                d.innerHTML = r.pupilHtml;
                const k = document.createElement('div');
                k.innerHTML = r.keyHtml;
                const pupilKeys = new Set(r.items.map((it) => `${it.text}|${typeof it.ans === 'object' ? JSON.stringify(it.ans) : it.ans}`));
                const labelled = d.querySelectorAll('[data-ws-label="letter"],[data-ws-label="tab"]').length;
                const scores = [...d.querySelectorAll('.ws-field.score b')].map((b) => b.textContent.replace(/\D/g, ''));
                const anchorsP = [...d.querySelectorAll('.mq-anchor')].map((a) => a.outerHTML);
                const anchorsK = [...k.querySelectorAll('.mq-anchor')].map((a) => a.outerHTML);
                const lines = [...d.querySelectorAll('.mq-anchor-steps li span')].map((s) => s.textContent);
                out.push({
                    role, anchors, skills: skills.map((s) => s.skillId).join('+'), items: r.items.length, labelled, scores,
                    examples: r.anchors.examples.map((a) => `${a.text}|${typeof a.ans === 'object' ? JSON.stringify(a.ans) : a.ans}`),
                    clash: r.anchors.examples.filter((a) => pupilKeys.has(`${a.text}|${typeof a.ans === 'object' ? JSON.stringify(a.ans) : a.ans}`)).map((a) => a.text),
                    tabs: d.querySelectorAll('[data-ws-label="model"]').length, nAnchors: anchorsP.length,
                    same: JSON.stringify(anchorsP) === JSON.stringify(anchorsK), slots: d.querySelectorAll('.mq-anchor [data-ws-slot]').length,
                    gaps: (r.gaps || []).length, long: lines.filter((t) => t.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length > 10),
                    notes: r.anchors.notes, pages: r.pageCount,
                });
            };
            for (const k of SKILLS) {
                const [categoryId, skillId] = k.split(':');
                for (const mode of ['sections', 'side']) for (const role of ['independent', 'more-practice']) await one(role, [{ categoryId, skillId }], mode);
            }
            const set = SKILLS.slice(0, 3).map((k) => ({ categoryId: k.split(':')[0], skillId: k.split(':')[1] }));
            for (const mode of ['sections', 'side']) await one('mixed-practice', set, mode);
            // A skill with no real worked steps: no anchor, and the dialog says so.
            await one('independent', [{ categoryId: 'fractions', skillId: 'simplify' }], 'sections');
            return out;
        }, SKILLS);
        for (const r of res) {
            const what = `${r.role} ${r.anchors} ${r.skills}`;
            ok(!r.clash.length, `${what}: an anchor equals a pupil problem (${r.clash.join(', ')})`);
            ok(r.slots === 0, `${what}: anchors carry no scored slot`);
            ok(r.same, `${what}: anchors draw the same on the key`);
            ok(r.gaps === 0, `${what}: key gaps ${r.gaps}`);
            ok(r.tabs === r.nAnchors, `${what}: every anchor has its Model tab (${r.tabs}/${r.nAnchors})`);
            ok(!r.long.length, `${what}: step lines over 10 words: ${r.long.join(' | ')}`);
            if (r.skills === 'simplify') { ok(r.nAnchors === 0 && r.notes.length === 1, `${what}: no anchor, one note (${r.notes})`); continue; }
            ok(r.nAnchors > 0, `${what}: has anchors`);
            // Score: the header denominator(s) sum to the labelled problems, which are all the items.
            const sum = r.scores.reduce((a, b) => a + Number(b || 0), 0);
            ok(r.labelled === r.items && sum === r.items, `${what}: Score ${r.scores.join('+')} and ${r.labelled} labels for ${r.items} problems`);
        }
        ok(res.length >= 26, `browser: ${res.length} builds`);

        // The PRINT SCREEN's own request (teacher-print.js requestFor: pages 1, columns auto, the
        // header on, opts {}), Side by side: (a) every pupil problem of a skill with worked steps
        // stands beside ITS OWN worked twin, rows of [twin | problem], on every page; (b) the Score
        // on a sheet's first page counts the pupil problems of that sheet only, and a page-driven
        // sheet ("a page") stays one page, so the Score is the problems the teacher sees.
        const screen = await app.page.evaluate(async () => {
            const req = (role, skills, anchors) => ({
                role, letters: role === 'more-practice' ? ['A', 'B'] : undefined, anchors, key: true, seed: 835139, size: 'L', look: 'auto', paper: 'A4',
                header: { name: true, date: true, score: true, tab: undefined, title: true },
                sections: [{ skills: skills.map(([categoryId, skillId]) => ({ categoryId, skillId, opts: {} })), columns: 'auto', pages: role === 'independent' ? 1 : undefined }],
            });
            const read = async (r) => {
                const out = await window.buildSheet(r);
                const d = document.createElement('div');
                d.innerHTML = out.pupilHtml;
                const pages = [...d.querySelectorAll('[data-ws-page]')].map((pg) => ({
                    score: Number(((pg.querySelector('.ws-field.score b') || {}).textContent || '').replace(/\D/g, '')) || null,
                    grids: [...pg.querySelectorAll('.ws-grid')].map((g) => [...g.children].filter((c) => c.classList.contains('ws-cell'))
                        .map((c) => (/mq-anchorcell/.test(c.className) ? 'M' : 'p')).join('')),
                }));
                return { pages, count: out.pageCount };
            };
            const out = [];
            for (const sk of [['addition', 'add_facts'], ['subtraction', 'subtract'], ['addition', 'add_column_multi']]) {
                for (const role of ['independent', 'more-practice']) out.push({ what: `${role} side ${sk[1]}`, one: true, ...(await read(req(role, [sk], 'side'))) });
            }
            out.push({ what: 'independent side, 3 skills (one without worked steps)', grouped: true,
                ...(await read(req('independent', [['addition', 'add_facts'], ['addition', 'add_20_no_regroup'], ['subtraction', 'sub_facts']], 'side'))) });
            return out;
        });
        for (const r of screen) {
            const grids = r.pages.flatMap((pg) => pg.grids);
            if (r.one) {
                ok(grids.every((g) => /^(Mp)+$/.test(g)), `${r.what}: every problem beside its own worked twin (${grids.join(' / ')})`);
            } else {
                // A skill without worked steps has no twin; every other problem still has its own.
                ok(grids.every((g) => /^(Mp)+$/.test(g) || /^p+$/.test(g)), `${r.what}: pairs or a skill without steps (${grids.join(' / ')})`);
                ok(r.count === 1, `${r.what}: "a page" stays one page (${r.count})`);
            }
            // Sheets: each page with a Score starts a sheet; the sheet runs to the next Score.
            let sheet = null;
            const sheets = [];
            for (const pg of r.pages) {
                if (pg.score !== null) { sheet = { score: pg.score, pupil: 0 }; sheets.push(sheet); }
                if (sheet) sheet.pupil += pg.grids.join('').replace(/M/g, '').length;
            }
            ok(sheets.length > 0 && sheets.every((s) => s.score === s.pupil), `${r.what}: Score counts the sheet's pupil problems only (${sheets.map((s) => `/${s.score} for ${s.pupil}`).join(', ')})`);
            if (r.one || r.grouped) ok(r.pages.every((pg) => pg.score === null || pg.score === pg.grids.join('').replace(/M/g, '').length || r.pages.length > sheets.length), `${r.what}: page-1 Score equals the problems on it`);
        }
    } finally {
        await app.close();
    }
}

if (!process.argv.includes('--no-browser')) {
    try { await browserChecks(); } catch (e) { fails.push(`browser: ${e.stack || e}`); }
}

if (fails.length) {
    for (const f of fails) console.log(`  FAIL ${f}`);
    console.log(`ws-anchors-unit: FAIL (${fails.length}) - ${pass} passed`);
    process.exit(1);
}
console.log(`ws-anchors-unit: OK (${pass} checks)`);
