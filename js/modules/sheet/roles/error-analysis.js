// js/modules/sheet/roles/error-analysis.js
// ERROR ANALYSIS, "Check it" (design/PAGE_TYPES.md 2.7): judge finished work, then fix only
// what is wrong.
//
//   Cell       the skill's own cell with an answer written in its slot (state `answered` or
//              `wrong`) and WITHOUT the cell's own stem ("Add." over finished work contradicts
//              "Check the work"), then beside it the decision "[ ] Correct  [ ] Fix it" (library
//              `check-fix`, labels JUDGE_LABELS) and the fix slot
//   Pupil ink  what the pupil wrote is drawn in "pupil writing" - trace grey, under a
//              "<name> wrote:" tag - so it is never confused with the printed numbers (critic
//              round 2); a story's worked number sentence is shown, not a bare answer
//   Fix slot   in the SKILL's answer shape (PT-ERR-2, critic round 2):
//                one value          one square write box, captioned "correct answer"
//                several values     one box per value (a fact family's four facts, a chart's
//                                   three products), numbered in reading order; the key fills
//                                   only the wrong ones
//                a choice           the item's own choice labels with check boxes (compare)
//                a drawing          a redraw zone under the work (base-10 blocks, ten frame),
//                                   drawn by the template: `ctx.options.fix = 'draw'` (SCC 2.4.1)
//                a fact family      a fix box beside each fact, drawn by the template: `fix: 'line'`
//                The work is drawn in state `wrong` on both pages, so the key render sets
//                `ctx.options.fixKey` and the template fills its fix place only there (SCC-T21)
//   Wrong      40 to 60% of the shown answers are wrong (PT-ERR-1), each a REAL misconception
//              from the skill's `wrongAnswer(q)`. An item flagged wrong that has none is skipped
//              (the host deals another); a skill with no real wrong answer at all is
//              `unsupported`, never a page on which every answer is right
//   Grid       the page takes as many items as their MEASURED heights allow (ceiling 6 / 4 / 4,
//              WORKSHEET_DESIGN_STANDARD 12.1): full-width rows (work left, judgement right) or
//              2 columns with the judgement under the work, whichever holds more (critic round 2:
//              three pages held 2 items and were half empty)
//   Labels     letters from a. (PT-LBL-7); Score in the header, one point per item (PT-ERR-2)
//   Key        the right box checked; the fix slot holds the correct answer on wrong items
//
// Pure module (SCC-01).

import {
    ctxOf, frameOf, layoutHeader, planItem, gridPart, instructionPart, assemble, poolItems,
    labelStyleOf, resolveSectionLayout, LIVE_W_MM, fitsLine, answerOf, wrongOf, wrongPattern,
    checkLine, slotKey, slotOnly, JUDGE_LABELS, esc, blank, judgeGroup, opOf, opGlyphOf, operandsOf,
} from './compose.js';
import { gridHeightMm, SAFETY_H_MM } from '../layout.js';

export const ROLE_ID = 'error-analysis';
// WORKSHEET_DESIGN_STANDARD 12.1: Error analysis 6 / 4 / 2-4 (the 04-E mock-up's 2 x 3 at L
// predates the ceiling; the standard is law for capacity).
const CEILING = { S: 6, M: 4, L: 4 };
/** The pupils whose work is checked: short, mixed names (P-WP-21), one per item in turn. */
const PUPILS = ['Sam', 'Ana', 'Leo', 'Mia', 'Omar', 'Zara'];
/** Templates whose answer IS a drawing: the fix is to draw it again. */
const DRAWN = new Set(['base10', 'tenframe']);
/** Templates whose answer is a choice among the item's own labels. */
const CHOICE = new Set(['compare']);
/** Templates that draw one fix box beside each line of the work (a fact family's four facts). */
const LINED = new Set(['fact-family']);

export const sources = (skills) => [{ id: 'main', skills }];
export const measureCols = () => [1, 2];

/**
 * A wrong answer a pupil could really have written: the provider's `wrongAnswer(q)`, but never
 * the default adapter's "nudge" (a near miss with no named error). PT-ERR-1: "a real
 * misconception, never a random number".
 */
export function realWrongOf(it) {
    const w = wrongOf(it);
    if (!w) return null;
    if (w.basis === 'nudge') return null;
    return w;
}

/** Mark what the pupil wrote: every solid-ink element of the finished work becomes pupil ink. */
export function pupilInk(html) {
    return String(html).replace(/<([a-z][a-z0-9]*)\b([^>]*?)\sdata-ws-ink="solid"([^>]*)>/gi, (m, tag, pre, post) => {
        const attrs = `${pre} data-ws-ink="solid"${post}`;
        // A template's own fix place (a fix box per fact, the redraw zone) is the KEY's ink.
        if (/data-ws-slot="(?:x\d+|fix)/.test(attrs)) return m;
        if (/\sclass="/.test(attrs)) return `<${tag}${attrs.replace(/\sclass="([^"]*)"/, ' class="$1 mq-pupil"')}>`;
        return `<${tag} class="mq-pupil"${attrs}>`;
    });
}

/** The parts of a several-value answer ("30, 35, 42" -> three), or null for one value. */
const partsOf = (v) => (/,\s/.test(String(v)) ? String(v).split(/,\s*/) : null);

/** The number sentence of a story item, as the pupil would have written it. */
function storyWork(it, shown, wrong, isWrong) {
    if (isWrong && wrong && wrong.work) return wrong.work;
    const q = it.q || {};
    const o = operandsOf(q);
    const g = opGlyphOf(opOf(q));
    return o.length >= 2 && g ? `${o[0]} ${g} ${o[1]} = ${shown}` : '';
}

const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

/**
 * The role's cell around the skill's cell. `info.index` / `info.seed` choose wrong or right, so
 * the choice is part of the item and survives measurement, pagination and the key.
 */
export function prepare(it, info = {}) {
    const correct = answerOf(it);
    if (!correct) return null;                               // nothing to show in the slot
    const wrong = realWrongOf(it);
    // PT-ERR-1: an item flagged wrong without a real wrong answer is skipped, never shown
    // correct instead (that is how a page ended up with every answer right).
    if (info.wrong && !wrong) return null;
    const isWrong = !!(wrong && info.wrong);
    // A story keeps its judgement beside it (its text wraps); a wide picture puts it underneath.
    const wide = it.fclass === 'wide' || (it.fclass !== 'word' && it.template !== 'wordpic' && Number((it.footprint || {}).wMm) > 95);
    const shown = isWrong ? wrong.value : correct;
    const who = PUPILS[(Number(info.index) || 0) % PUPILS.length];
    const q = it.q || {};
    const payload = (q.cell && q.cell.payload) || {};
    // SCC 2.4.1 / SCC-T21: the templates that draw their OWN fix place (a redraw zone, a box per fact).
    const kind = DRAWN.has(it.template) ? 'draw'
        : LINED.has(it.template) ? 'line'
        : CHOICE.has(it.template) && Array.isArray(payload.labels) && payload.labels.length ? 'choice'
            : partsOf(correct) && partsOf(shown) && partsOf(correct).length === partsOf(shown).length ? 'parts' : 'value';
    const story = it.fclass === 'word' || it.template === 'wordpic';
    const work = story ? storyWork(it, shown, wrong, isWrong) : '';
    // The key's slots: the judgement, and the fix in the slot(s) of its kind.
    const slots = { 'ea-ok': isWrong ? '' : '✓', 'ea-fix': isWrong ? '✓' : '' };
    const cParts = partsOf(correct) || [];
    const sParts = partsOf(shown) || [];
    if (kind === 'value') slots['ea-ans'] = isWrong ? correct : '';
    if (kind === 'parts' || kind === 'line') cParts.forEach((v, i) => { slots[`ea-ans-${i}`] = isWrong && sParts[i] !== v ? v : ''; });
    if (kind === 'choice') payload.labels.forEach((lab, i) => { slots[`ea-pick-${i}`] = isWrong && i === (payload.correct || 0) ? '✓' : ''; });
    const key = slotKey(slots, correct);
    const digits = Math.max(2, Math.min(6, correct.replace(/[^0-9]/g, '').length || 2));
    const render = (c, o = {}) => {
        const stack = wide || kind === 'draw' || (Number(o.cols) || 1) >= 2;
        let body = '';
        try {
            // The work is drawn in state `wrong` on BOTH pages, so a key render says so itself
            // (`options.fixKey`), and the template fills its fix place only there.
            const fixOpts = kind === 'draw' || kind === 'line' ? { fix: kind, fixKey: c.state === 'answered' && isWrong } : {};
            body = it.render(Object.assign({}, c, { state: 'blank', options: Object.assign({}, c.options || {}, fixOpts) }), Object.assign({}, o, {
                shown, prompt: false, shownSlots: isWrong && wrong.slots ? wrong.slots : undefined,
            }));
        } catch (e) { body = ''; }
        // A template's own fix places are judged with the item's one point (PT-ERR-2), like the
        // role's fix box: ungraded, so a correct item's empty fix place is not a missing answer.
        body = body.replace(/(data-ws-slot="(?:x\d+|fix)")(?![^>]*data-ws-graded)/g, '$1 data-ws-graded="0"');
        const askedFix = (kind === 'draw' || kind === 'line') && /data-ws-slot="(?:fix|x\d)/.test(body);
        const shownWork = `<div class="mq-judge-work"><span class="mq-pupiltag${story ? ' mq-pupiltag-flow' : ''}">${esc(who)} wrote:</span>${kind === 'choice' || kind === 'draw' ? body : pupilInk(body)}`
            + (work ? `<div class="mq-pupilwork mq-pupil" data-ws-ink="solid">${esc(work)}</div>` : '') + '</div>';
        let fix = '';
        if (kind === 'value') {
            const fixW = Math.max({ S: 26, M: 30, L: 34 }[c.size] || 34, digits * ({ S: 6, M: 7, L: 8 }[c.size] || 8) + 6);
            fix = `<span class="mq-ansslot mq-fixslot">${blank({ id: 'ea-ans', kind: 'number', shape: 'box', widthMm: fixW, graded: false }, c, slotOnly(key, 'ea-ans'))}<small>correct answer</small></span>`;
        } else if (kind === 'parts' || (kind === 'line' && !askedFix)) {
            const w = Math.max(...cParts.map((v) => String(v).length));
            const fixW = Math.max({ S: 18, M: 20, L: 22 }[c.size] || 22, w * ({ S: 6, M: 7, L: 8 }[c.size] || 8) + 6);
            fix = `<span class="mq-fixes mq-fixslot">${cParts.map((v, i) => `<span class="mq-ansslot">${blank({ id: `ea-ans-${i}`, kind: 'number', shape: 'box', widthMm: fixW, graded: false }, c, slotOnly(key, `ea-ans-${i}`))}<small>${ORD[i] || i + 1}</small></span>`).join('')}</span>`;
        } else if (kind === 'choice') {
            fix = `<span class="mq-fixchoice mq-fixslot">${payload.labels.map((lab, i) => checkLine(`ea-pick-${i}`, String(lab), c, key, { graded: false })).join('')}</span>`;
        } else if (kind === 'draw' && !askedFix) {
            // The redraw zone: the skill's own model, empty on the pupil page and drawn right on
            // the key of a wrong item. (A template that draws its own `fix: 'draw'` zone keeps it.)
            let zone = '';
            try {
                zone = it.render(Object.assign({}, c, { state: c.state === 'answered' && isWrong ? 'answered' : 'blank' }), Object.assign({}, o, { prompt: false }));
            } catch (e) { zone = ''; }
            // The zone is drawing space, not a set of scored slots: its own slot marks are dropped.
            zone = zone.replace(/\sdata-ws-slot="/g, ' data-ws-part="');
            fix = `<span class="mq-redraw mq-fixslot" data-ws-slot="ea-draw" data-ws-shape="open" data-ws-graded="0"><small>Fix it: draw it again.</small>${zone}</span>`;
        }
        return `<div class="mq-judge mq-judge2${stack ? ' mq-judge-stack' : ''}">`
            + shownWork
            + judgeGroup('ea-judge', `${checkLine('ea-ok', JUDGE_LABELS.correct, c, key, { graded: false })}`
                + `<span class="mq-fixrow">${checkLine('ea-fix', JUDGE_LABELS.fixIt, c, key, { graded: false })}${kind === 'draw' ? '' : fix}</span>`)
            + (kind === 'draw' ? fix : '')
            + `</div>`;
    };
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true, answerWords: isWrong ? `Fix it: ${correct}` : 'Correct',
        // The judgement column sits beside the work; a word problem or a wide picture keeps its
        // own single column (PT-WPR-1).
        footprint: Object.assign({}, it.footprint || {}, { measure: true, hMm: null, maxCols: Math.min(2, (it.footprint && it.footprint.maxCols) || 2) }),
        fclass: it.fclass === 'word' || it.fclass === 'wide' ? it.fclass : 'standard', thinking: { shown, correct, isWrong, basis: wrong ? wrong.basis : '', kind },
        cellCls: [it.cellCls || '', 'mq-thinkcell mq-eacell'].join(' ').trim(),
    });
}

/**
 * PT-ERR-1 needs something to find: a page with no real wrong answer on it is not an Error
 * analysis page, so the role says why instead of printing a page of correct work (or nothing).
 */
export function supports(items) {
    if (!items.length) {
        return 'This skill has no misconception-based wrong answer (wrongAnswer), or no single answer that can be written in as finished work, so it cannot print as Error analysis yet.';
    }
    if (!items.some((it) => it.thinking && it.thinking.isWrong)) {
        return 'This skill has no misconception-based wrong answer (wrongAnswer) yet, so an Error analysis page would have no mistake to find.';
    }
    return null;
}

/** The old layout (no measurement: unit tests, a host without a DOM). */
function staticLayout(items, input) {
    const ctx = ctxOf(input);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Check it', score: 1 });
    const opts = { size: ctx.size, look: ctx.look, header: layoutHeader(frame.header) };
    const floor = (input.floors || {}).main;
    const one = resolveSectionLayout({
        role: ROLE_ID, columns: 1, count: items.length,
        target: { cols: 1, rows: CEILING }, ceiling: CEILING, floor,
    }, items, ctx.paper, LIVE_W_MM, opts);
    if (one.cols === 1 && one.rows >= CEILING[ctx.size] && !one.clamped) return one;
    return resolveSectionLayout({
        role: ROLE_ID, columns: 'auto', count: items.length,
        target: { cols: 2, rows: { S: 3, M: 2, L: 2 }, rowsByCols: { 1: 4 } }, ceiling: CEILING, floor,
    }, items, ctx.paper, LIVE_W_MM, opts);
}

// + 4 mm: the grid's rules and the band edge come out of the row, and a measured cell is rounded
// to 0.1 mm (a mult chart at 112 mm in a 113 mm row overflowed by 3.5 mm).
const heightAt = (it, cols) => { const m = it.measured && it.measured[cols]; return m && Number.isFinite(m.hMm) && m.fits !== false ? m.hMm + 4 : Infinity; };

/**
 * Choose n items (in order) that fit `rows` rows of `cols` columns, about half of them wrong
 * (PT-ERR-1): an item is taken while its measured height fits G / rows and its kind (wrong or
 * right) still has room. null when fewer than n fit.
 */
function pick(items, cols, rows, G) {
    const n = cols * rows;
    const h = (G - SAFETY_H_MM) / rows;
    const wantWrong = Math.max(1, Math.round(n / 2));
    const out = [];
    let w = 0;
    for (const it of items) {
        if (out.length >= n) break;
        if (heightAt(it, cols) > h) continue;
        const bad = !!(it.thinking && it.thinking.isWrong);
        if (bad ? w >= wantWrong : out.length - w >= n - wantWrong) continue;
        out.push(it);
        if (bad) w++;
    }
    return out.length === n && w >= 1 ? out : null;
}

/**
 * The page: the most items the measured heights allow, as full-width rows or 2 columns, never
 * above the ceiling. Falls back to the static layout when nothing was measured.
 */
function measuredLayout(items, input) {
    const ctx = ctxOf(input);
    if (!items.length || !items.every((it) => it.measured && it.measured[1])) return null;
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Check it', score: 1 });
    const G = gridHeightMm(ctx.paper, ctx.size, layoutHeader(frame.header));
    const ceil = CEILING[ctx.size];
    const word = items.some((it) => it.fclass === 'word' || it.fclass === 'wide');
    let best = null;
    for (const cols of word ? [1] : [1, 2]) {
        for (let rows = Math.floor(ceil / cols); rows >= 1; rows--) {
            const got = pick(items, cols, rows, G);
            if (got && (!best || got.length > best.items.length)) best = { cols, rows, items: got };
            if (got) break;
        }
    }
    if (!best) return null;
    const perPage = best.cols * best.rows;
    return {
        role: ROLE_ID, cols: best.cols, rows: best.rows, perPage, pages: 1, count: perPage, cellH: G / best.rows, gridH: G,
        items: best.items, clamped: false, note: '', notes: [], digitPt: ctx.s.digitPt, size: ctx.size, look: ctx.look, cls: 'standard',
    };
}

// The host deals twice the ceiling, so the page can choose the items that fit (measured).
export const counts = (pools, input) => {
    const ctx = ctxOf(input);
    const items = pools.main || [];
    return { main: items.length && items.every((it) => it.measured && it.measured[1]) ? CEILING[ctx.size] * 2 + 2 : staticLayout(items, input).perPage };
};

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const all = poolItems(input, 'main');
    const M = measuredLayout(all, input);
    const L = M || staticLayout(all, input);
    const items = M ? M.items : all.slice(0, L.perPage);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Check it', score: items.length });
    const rows = Math.max(1, Math.ceil(items.length / L.cols));
    const grid = gridPart(items.map((it) => planItem(it, { cols: L.cols })), { cols: L.cols, rows, cellH: L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1 });
    if (rows === L.rows) { grid.cls = ''; grid.height = ''; }
    const wrongShare = items.length ? items.filter((it) => it.thinking && it.thinking.isWrong).length / items.length : 0;
    const fit = Object.assign({}, L, { items: undefined });
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart('check-fix'), grid] }], {
        meta: { items: items.length, scoreOutOf: items.length, wrongShare, fits: [Object.assign(fit, { line: fitsLine(fit) })], notes: L.note ? [L.note] : [] },
    });
}

/** Which items show a wrong answer: a seeded 40-60% pattern over the run (PT-ERR-1). */
export const wrongFlags = (n, seed) => wrongPattern(n, seed, ROLE_ID);

export default { ROLE_ID, sources, measureCols, prepare, supports, counts, plan, wrongFlags, realWrongOf, pupilInk };
export { esc };
