// js/modules/sheet/lesson-pages/practice.js
// LESSON PAGE BUILDER "practice" (design/LESSON_LIBRARY_PLAN.md §8c): the lesson sheet's INDEPENDENT rows (whole rows of
// the skill filling the page the Guided band ends on), the practice pages' step strip, and the request of a lesson
// PRACTICE page (the Independent frame with the strip; was: Independent / More practice).
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz paper; the skill
// supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved verbatim from roles/lesson.js (lessons-phase0 0.5: the
// sample lessons and the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random.

import { bestCols, planItem, gridPart, instructionKeyOf, instructionText, answerOf, opOf, stripExtraMm, esc } from '../roles/compose.js';
import { resolveCtx } from '../index.js';
import { stepIcon } from '../lesson-icons.js';
import { CASE_TESTS } from '../lesson-arch/index.js';
import { winShare } from '../lesson-arch/grid.js';
import { reflowsAt, CL8_MM, namedSteps, stepMarker, hAt, phase0On } from './common.js';

export const AUTO_COLS = { S: 4, M: 3, L: 3 };

/**
 * The step reminder of a practice page: the chart's numerals, icons and step names in one strip,
 * so every later problem points back to the anchor chart. Carries its own styles (a practice page
 * does not load the lesson stylesheet).
 */
export function stripHtml(data, steps, size = 'L') {
    const named = namedSteps(steps, data, { general: true });
    if (!named.length) return '';
    return `<div class="mq-lstrip" data-mq-lesson-strip><b class="mq-lstrip-l">Steps:</b><ol>${named.map((s, i) => `<li>${stepMarker(i + 1)}${stepIcon(s.icon, size)}<span>${esc(s.name)}</span></li>`).join('')}</ol></div>`;
}

/** The strip as a host-shaped item, so the host measures its height at the full width. */
export function stripItem(data, steps) {
    return {
        q: null, render: (c) => stripHtml(data, steps, c.size), key: { value: '', display: '', slots: {} }, drawsAnswer: true, visual: false,
        cellCls: 'mq-lstripcell', footprint: { wMm: 186, hMm: null, measure: true, maxCols: 1 }, fclass: 'wide', measureLevel: 1,
        template: 'lesson-strip', skill: '', pool: 'extra', lessonStrip: true,
    };
}

/**
 * The lesson sheet's Independent Practice rows (roles/lesson.js planOnce, after the bands are packed):
 * whole rows of the skill filling the last page `cur` (PT-OPN-7, H5), lettered on from `letter`.
 * Returns the items placed.
 */
export function independentBand({ input, ctx, m, data, main, example, example2, example3, example4, weDo, extrasList, cur, labels, letter }) {
    const used = new Set([example, example2, example3, example4, ...weDo]);
    const indepPool0 = main.filter((it) => !used.has(it));
    // `independent` (lesson data; the detailed lesson maker, critic r2 R3): the cases the Independent
    // cells must hold, one cell each, first (the Critical Atom's case on every sheet that states it).
    const indepFirst = [];
    for (const name of (data && Array.isArray(data.independent) ? data.independent : [])) {
        const t = CASE_TESTS[name];
        // (a window never shares a box with another window of the sheet - lesson 4 critic r1 D5)
        const hit = t ? indepPool0.find((it) => !indepFirst.includes(it) && t(it) && ![...weDo, ...indepFirst].some((y) => winShare(it, y))) : null;
        if (hit) indepFirst.push(hit);
    }
    const indepPool = indepFirst.concat(indepPool0.filter((it) => !indepFirst.includes(it)));
    const icWanted = AUTO_COLS[ctx.size];
    // One across look on the page (critic R3 N-2): the Guided cells keep a division fact's line
    // beside the sentence, so the Independent band takes only columns where it stays beside.
    const icOpts = [icWanted, 3, 2, 1].filter((c, i, a) => a.indexOf(c) === i && c <= icWanted);
    // ... and only columns where every problem the band may print keeps CL-8's 3 mm from the cell's
    // side borders, measured (`slackMm`; critic R4 R-4: "121 ÷ 11 = ___" ended 0.8 mm from its
    // border in 3 columns) - fewer columns, never a cramped or shrunk problem.
    const cramped = (it, c) => { const m = it.measured && it.measured[c]; return !!m && Number.isFinite(m.slackMm) && m.slackMm < CL8_MM; };
    const icKeep = icOpts.filter((c) => c === 1 || !indepPool.slice(0, 21).some((it) => reflowsAt(it, c) || cramped(it, c)));
    const ic = bestCols(indepPool.slice(0, 6), icKeep.length ? icKeep : icOpts, ctx);
    const twins = new Map(extrasList.filter((x) => x.lessonIndepOf).map((x) => [x.lessonIndepOf, x]));
    // (lf-engine PC r3 F3, LR-17b `indepFrame`: an Independent column subtraction draws the T O heads, the exchange row and
    // the answer boxes its Guided cells draw, so its row is at least a Guided cell's measured height - the pool's own level
    // measure left the sub L row at 64.8 mm for a 68.7 mm cell, which printed past its band's bottom rule. Check-on only.)
    const frameH = phase0On(data, 'indepFrame') ? hAt(weDo.filter((it) => it && it.template === 'stack'), ic) : 0;
    const hI = Math.max(hAt(indepPool.slice(0, ic * 3).map((it) => twins.get(it) || it), ic), frameH && indepPool.some((it) => it.template === 'stack') ? frameH : 0);
    let indep = [];
    if (Number.isFinite(hI) && hI > 0) {
        // The band's strip is as tall as its label and instruction wrap (critic R2 R-1: a two-line
        // "Circle groups of the second number. Write the quotient and the remainder." ran the
        // div_remainders lesson 4.5 mm past its page at L).
        const iText = instructionText(instructionKeyOf(indepPool.slice(0, ic), input.skills), indepPool.slice(0, ic));
        const room0 = cur.budget - cur.used - m.strip - stripExtraMm(ctx, 'Independent Practice:', iText);
        // 12.1: an Independent page holds 6 at most; a page of rows fills its height like one.
        // div_facts facts (any written form, critic R1 D8): one-number answers, so the rows fill the
        // room left on the page up to 12.1's one-symbol ceiling of 12, not the 6 of taller problems.
        // (any division FACT cell: `divide`'s "12 ÷ 4 = __" is the same one-number answer - critic
        // R2 R-2: its lesson page was left 44-48 % blank under 6 of them)
        // (a FACT: within the 12 x 12 table - long division "2134 ÷ 22" is worked, not recalled)
        const divFact = (it) => {
            if (!it.q || opOf(it.q) !== 'divide') return false;
            const m = /^\s*(\d+)\s*÷\s*(\d+)\s*=\s*\?\s*$/.exec(String(it.q.text || ''));
            return !!m && Number(m[1]) <= 144 && Number(m[2]) <= 12 && /^\d+$/.test(String(answerOf(it)));
        };
        // (a rounding cell "27 -> ___" is a one-number answer too - critic lessons-phase0 r1 D11: the round lesson's S sheet
        // ended on a 50 mm blank foot under two rows. LR-17b: only on a lesson record with `roundOneNum` whose Prerequisite
        // Check is live - phase0On; every other packet prints as master did)
        const roundRows = phase0On(data, 'roundOneNum');
        const frameOn = phase0On(data, 'indepFrame');
        const roundOne = (it) => roundRows && it.template === 'pv' && !!(it.q && it.q.cell && it.q.cell.payload && it.q.cell.payload.kind === 'round');
        const oneNum = indepPool.length && indepPool.every((it) => it.q && (it.q.divForm || divFact(it) || roundOne(it)));
        // A band of many short fact rows (up to 7 at S) keeps 3 mm for its frame and its rules, which
        // six rows of bracket facts ran 2 mm past at S; taller problems keep the room they had.
        const safety = oneNum ? 3 : 0;
        const room = room0 - safety;
        // (S holds more than L, LESSONS L1 - critic R3 N-3: 12 at S left 41 % of p2 blank - and the
        // rows are whole rows of the pool the lesson dealt, never a last row of one)
        const oneCeil = ctx.size === 'L' ? 12 : 21;   // (an S packet draws its lesson sheet at M type)
        let rows = Math.min(Math.max(1, Math.floor((oneNum ? oneCeil : 6) / ic)), Math.floor(room / hI));
        if (oneNum && indepPool.length >= ic) rows = Math.min(rows, Math.floor(indepPool.length / ic));
        // Each row as tall as the TALLEST problem the rows hold (R-1), re-checked against the room.
        const hRows = (k) => Math.max(hI, hAt(indepPool.slice(0, k * ic).map((it) => twins.get(it) || it), ic));
        while (rows > 1 && rows * hRows(rows) > room) rows--;
        // (critic r2 N1: how far ONE row is short of the room - roles/lesson.js frees it before it ever drops the row)
        cur.indepShort = rows >= 1 && hRows(rows) <= room ? 0 : hRows(1) - room;
        if (rows >= 1 && hRows(rows) <= room) {
            indep = indepPool.slice(0, rows * ic);
            const r = Math.ceil(indep.length / ic);
            const hTop = hRows(r);
            // The rows take the page's spare height (an Independent page's cells fill the grid,
            // PG-11), never more than half a cell again (H13: no cell mostly empty).
            const cellH = Math.min(room / r, hTop * 1.15);
            cur.sections.push({
                kind: 'band', label: 'Independent Practice:', instr: instructionText(instructionKeyOf(indep, input.skills), indep),
                // (critic r2 N8, LR-17b `indepFrame`: a column-subtraction Independent cell keeps the T O heads and the box per
                // answer digit its Guided cells draw - structural, PEDAGOGY 4 / VQ-2. The main pool is measured at level 3,
                // where both are drawn, so the row height holds them. Only on a record with the flag whose check is live.)
                content: gridPart(indep.map((it) => planItem(it, Object.assign({ cols: ic }, frameOn && it.template === 'stack' && typeof it.render === 'function'
                    ? { render: (c, o) => it.render(c, Object.assign({}, o, { payload: { heads: true, answer: 'boxes' } })) } : {}))), { cols: ic, rows: r, cellH, labels, start: letter }),
            });
            cur.used += m.strip + stripExtraMm(ctx, 'Independent Practice:', iText) + r * cellH + safety;
        }
    }
    return indep;
}

/* ======================================================= the lesson's PRACTICE pages (moved from print-sheet.js buildLesson) */

/**
 * The practice section of a lesson packet. One-line answers (facts, rounding): the engine fills the page (PAGE FILL,
 * DN-1) - one frame, no row gaps, because the count is the page's own. Lessons r2-r3: a rounding cell ("27 -> ___") is
 * short and narrow: M prints three across like L, and the lesson's own 15 at every size (never 12.1's 16 ceiling
 * passed). div_facts: a practice page of one-number facts holds what its stand-alone Independent page does at L (16,
 * 2 x 8 for the across facts - critic R3 N-2) and keeps the lesson's one across look (`besideCap`). Taller problems:
 * 12.1's six a page, 2 x 3, each cell with its working space and Check line (a ref's `instructionKey` - the detailed
 * lesson maker, lesson 2 - heads its Practice section too).
 */
export function practiceSection({ skill, facts, rounding, divFactsOnly, besideCap }) {
    const practiceSk = skill;
    return facts ? { skills: [practiceSk], pages: 0, noCap: true, dense: rounding ? { S: 15, M: 15, L: 15 } : { S: 16, M: 16, L: divFactsOnly ? 16 : 15 }, ...(besideCap < 4 ? { maxCols: besideCap } : {}) } : { skills: [practiceSk], count: 0, columns: 2, noCap: true, ...(practiceSk.instructionKey ? { instructionKey: practiceSk.instructionKey } : {}) };
}

/**
 * The grid shapes [count, cols] a practice page of taller problems tries: 12.1's six a page (2 x 3) at every size - an
 * Independent page holds 6 at most, so M is the same six cells in smaller type (lessons r2: by design). `practiceShape`
 * (lesson data; the detailed lesson maker): a one-line item too wide for two columns prints [count, cols] a page
 * instead (expanded form: 8 x 1).
 */
// (`practiceShapes`: the shapes to try, densest first - the first that prints on its pages wins; visual-quality r2:
// eight stories at M, six at L, never six over a 25 % strip - ported from master 2026-11-07)
export const practiceStackShapes = (data) => (data && Array.isArray(data.practiceShapes) && data.practiceShapes.length ? data.practiceShapes
    : data && Array.isArray(data.practiceShape) ? [data.practiceShape] : [[6, 2]]);

/**
 * `practiceBlocks` (lesson data): 1-3 blocks [{shape: [count, cols], opts?}] - the Practice page prints one section per
 * block, in order. The well-formed blocks of `data`, or null (absent, empty or malformed: the page prints as before).
 */
export function practiceBlocksOf(data) {
    const list = data && Array.isArray(data.practiceBlocks) ? data.practiceBlocks : null;
    if (!list || !list.length) return null;
    const ok = list.slice(0, 3).filter((b) => b && Array.isArray(b.shape) && b.shape.length === 2 && b.shape.every((v) => Number.isInteger(v) && v > 0));
    return ok.length ? ok : null;
}

/**
 * The sections of a block Practice page: each the lesson's practice skill ref `sk` with the block's `opts` merged over its
 * own, the block's grid [count, cols] as its own page ceiling, and `blockShare` (its rows) - the body under the strip is
 * shared by rows (print-sheet.js buildSheet).
 */
export function practiceBlockSections(blocks, sk) {
    return blocks.map((b) => {
        const skill = b.opts ? Object.assign({}, sk, { opts: Object.assign({}, (sk && sk.opts) || {}, b.opts) }) : sk;
        const [count, cols] = b.shape;
        return Object.assign({ skills: [skill], count, columns: cols, noCap: true, pageCap: count, blockShare: Math.ceil(count / cols) },
            skill && skill.instructionKey ? { instructionKey: skill.instructionKey } : {});
    });
}

/**
 * The buildSheet request of a lesson practice page: the Independent role, the packet's frame (`common`), the step strip
 * when `withStrip` (at L type the strip's words are a point bigger: 2 mm more for it).
 */
export function practiceRequest({ common, size, practiceSize, lessonNo, section, facts, pages, withStrip, shape, seed, strip, stripH, stripHtml, blocks }) {
    return Object.assign({}, common, {
        size: practiceSize,
        role: 'independent', tabId: `Practice ${lessonNo}`,
        // (`blocks`: practiceBlockSections - one section per block, in order, on the one page)
        sections: blocks ? blocks : [facts ? Object.assign({}, section, { pages }) : Object.assign({}, section, { count: shape[0] * pages, columns: shape[1] })],
        seed,
        // (At L type the strip's words are a point bigger: 2 mm more for it.)
        stepStrip: withStrip && stripHtml ? (practiceSize === size ? { html: stripHtml, hMm: stripH }
            : { html: strip.render(resolveCtx({ size: practiceSize, look: 'ican', mode: 'print' })), hMm: stripH + 2 }) : undefined,
    });
}

export default { AUTO_COLS, stripHtml, stripItem, independentBand, practiceSection, practiceStackShapes, practiceBlocksOf, practiceBlockSections, practiceRequest };
