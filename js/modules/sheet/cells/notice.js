// js/modules/sheet/cells/notice.js
// The `notice` template (lane lf-algebra, 2026-11-07): patterns:notice_patterns "What Do You Notice?"
// (3.OA.D.9, 4.OA.C.5). ONE decision per cell, so ONE graded slot (VQ-2, AK-2), in three task kinds:
//
//   parity     the fact "6 × 7" at the working digit size; with the hint (`show`) each factor carries the word
//              even / odd under it in the single grey (a hint scaffold: it fades, `patShow` off). The pupil CIRCLES
//              Even or Odd (printed words, 12 mm apart: family-check's response). The product is never printed:
//              the lesson is to know it from the factors (an even factor makes an even product).
//   feature    the rule "Start at 5. Add 5 each time." over a track of six number tiles - the six numbers printed
//              (`show`), or the first printed and five EMPTY working boxes the pupil fills (never graded,
//              `data-ws-graded="0"`); under it three sentences, each with a check box on its right (P-TH-11: the
//              compare cell's word list). The pupil checks the ONE true sentence.
//   truefalse  a sentence about one times-table in a ruled box; with the hint the row of products printed under it
//              in small tiles. The pupil circles True or False.
//
// Key: the right word ringed / the right box checked (1.5 pt); the feature track's working boxes written in.
// Error analysis rings / checks the wrong one (ctx.wrong). Screen twin (screen-cell.js wireTickBoxes): the words are
// buttons `data-mq-choice` (>= 44 px), the sentence list is the label + box rows wireTickBoxes turns into radios, the
// working boxes are `input.mq-wwork` (typed, checked live, never the answer).
//
// payload: parity    {task, a, b, product, labels: ['Even','Odd'], correct: 0|1, show}
//          feature   {task, start, step, terms: [6], choices: [3 sentences], kinds, correct: 0..2, show}
//          truefalse {task, table, products, statement, labels: ['True','False'], correct: 0|1, show}
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { L, P, B, INK, GREY, root, textPt, digitPt, isTwin, sizeOf, inkOf, checkBox, checkedChoice, KEY_FEATURES, S, LETTERS } from './k2kit.js';

export const NOTICE_TEMPLATE = 'notice';

/* ------------------------------------------------------------------ the sentences a pattern can be judged by */

/**
 * Every sentence the feature task can print about "start s, add d", each with its truth computed from the numbers
 * given (pass at least twelve, so a cycle of five is seen twice). Ids: all-even, all-odd, odd-even, even-odd (about
 * 'parity'); ends, ones2, ones5 (about 'ones', built from the first ones digits, so a false one reads a pattern off
 * the first numbers - the misconception "a pattern seen in three terms always continues"). `firstRead`: a false
 * sentence that is true of the FIRST number (the "every number is odd" error on 5, 10, 15).
 */
export function noticeStatements(terms) {
    const t = (terms || []).map(Number).filter(Number.isFinite);
    if (t.length < 2) return [];
    const ones = t.map((v) => v % 10);
    const par = (v) => v % 2;
    const out = [];
    const put = (id, about, text, truth, firstRead = false) => out.push({ id, about, text, truth: !!truth, firstRead: !truth && firstRead });
    put('all-even', 'parity', 'Every number is even.', t.every((v) => par(v) === 0), par(t[0]) === 0);
    put('all-odd', 'parity', 'Every number is odd.', t.every((v) => par(v) === 1), par(t[0]) === 1);
    put('odd-even', 'parity', 'The numbers go odd, even, odd, even.', t.every((v, i) => par(v) === (i % 2 === 0 ? 1 : 0)), par(t[0]) === 1);
    put('even-odd', 'parity', 'The numbers go even, odd, even, odd.', t.every((v, i) => par(v) === (i % 2 === 0 ? 0 : 1)), par(t[0]) === 0);
    const cyc = (list) => ones.every((x, i) => x === list[i % list.length]);
    put('ends', 'ones', `Every number ends in ${ones[0]}.`, cyc([ones[0]]), true);
    if (ones[1] !== ones[0]) put('ones2', 'ones', `The ones digits go ${ones[0]}, ${ones[1]}, ${ones[0]}, ${ones[1]}.`, cyc(ones.slice(0, 2)), true);
    const five = ones.slice(0, 5);
    if (new Set(five).size === 5) put('ones5', 'ones', `The ones digits go ${five.join(', ')}, then start again.`, cyc(five), true);
    return out;
}

/* ------------------------------------------------------------------ drawing helpers */

const LABELS2 = (p, d) => (Array.isArray(p.labels) && p.labels.length === 2 ? p.labels.map(String) : d);
const correctOf = (p) => Math.max(0, Number(p.correct) || 0);
/**
 * The fading hint (`patShow`) shows only where the page gives hints: never at scaffold level 0 - the Test (
 * roles/test.js plans level 0) - whatever the option says (critic r1 F1: "even / odd" under each factor printed on the Test
 * decided the item). The quiz hides the parts marked data-ws-hint (css/quiz-mode.css), the twin being dealt once for every
 * host. Checked by ws-cell-checks HINT-ON-TEST (proposed, lf-checks) and the lane probe in design/status/lf-algebra.md.
 */
const showOn = (p, ctx) => !!p && p.show !== false && !(ctx && ctx.scaffoldLevel === 0);
/** The mark every fading-hint part carries: the quiz hides it; the screen ink pass keeps its grey (mq-keep-color). */
const HINT_ATTR = ' data-ws-hint="fade"';

/** Which printed word a state rings: the key's, Error analysis's wrong one, or none (family-check's rule). */
function ringedIndex(labels, p, ctx) {
    if (!ctx || !ctx.state || ctx.state === 'blank') return -1;
    if (ctx.state === 'wrong') {
        const w = String((ctx.wrong && ctx.wrong.value) || '').trim().toLowerCase();
        const i = labels.findIndex((l) => l.toLowerCase() === w || l.charAt(0).toLowerCase() === w);
        return i >= 0 ? i : 1 - correctOf(p);
    }
    return correctOf(p);
}

/** Two printed words the pupil circles (paper) or taps (screen): ONE slot, the pair. */
function wordChoice(ctx, labels, p) {
    const twin = isTwin(ctx);
    const on = twin ? -1 : ringedIndex(labels, p, ctx);
    const ink = on >= 0 ? (ctx.state === 'traced' ? 'trace' : 'solid') : null;
    const pt = textPt(ctx) + 6;
    const words = labels.map((w, i) => {
        if (twin) {
            return `<button type="button" class="mq-choicebtn" data-mq-choice="${esc(w)}" aria-pressed="false" `
                + `style="min-width:max(64px, ${L(ctx, 22)});min-height:max(48px, ${L(ctx, 12)});padding:0 ${L(ctx, 3)};border:${B(ctx, 1)} solid ${INK};border-radius:999px;`
                + `background:#fff;color:${INK};font-family:'Andika','Open Sans',sans-serif;font-size:${P(ctx, pt)};font-weight:700;line-height:1;cursor:pointer;"><span>${esc(w)}</span></button>`;
        }
        const ring = i === on
            ? `<span data-ws-ink="${ink}" style="position:absolute;left:${L(ctx, -2.2)};top:${L(ctx, -1.6)};right:${L(ctx, -2.2)};bottom:${L(ctx, -1.6)};color:${ink === 'trace' ? GREY : INK};border:${B(ctx, 1.5)} solid currentColor;border-radius:50%;"></span>`
            : '';
        // (the ring stands 2.2 mm out of the word's box at each side: a RINGED word keeps that room beside it, so at the cell's edge
        // the ring never reaches the border - ws-empty-band EB-EDGE, notice guided M Model 0.8 mm, precritic r9. Only the ringed
        // word: a margin on every word changed the pupil rows - ws-options-verify --render patShow=false @S H13 0 -> 20)
        return `<span class="mq-nt-word" style="position:relative;display:inline-flex;align-items:center;justify-content:center;${ring ? `margin:0 ${L(ctx, 2.2)};` : ''}padding:${L(ctx, 1)} ${L(ctx, 2.5)};font-size:${P(ctx, pt)};font-weight:700;line-height:1.1;color:${INK};">${esc(w)}${ring}</span>`;
    }).join('');
    return twin
        ? `<div class="mq-nt-choice" role="group" aria-label="answer choices" style="display:flex;justify-content:center;gap:${L(ctx, 10)};">${words}</div>`
        : `<div class="mq-nt-choice" data-ws-slot="answer" data-ws-shape="choice"${ink ? ` data-ws-ink="${ink}"` : ''} style="display:flex;justify-content:center;gap:${L(ctx, 12)};">${words}</div>`;
}

/** A number tile of a track or a row: given (0.75 pt) or a working box (empty, never graded). */
function tile(ctx, { value = '', wMm, hMm, pt, work = false, expect = '', id = '', ink = null, hint = false }) {
    const base = `box-sizing:border-box;flex:none;width:${L(ctx, wMm)};height:${L(ctx, hMm)};display:inline-flex;align-items:center;justify-content:center;`
        + `font-size:${P(ctx, pt)};font-weight:700;line-height:1;background:#fff;border-radius:${L(ctx, 1)};${KEY_FEATURES}`;
    if (!work) return `<span class="mq-nt-tile"${hint ? HINT_ATTR : ''} style="${base}border:${B(ctx, 0.75)} solid ${INK};color:${INK};">${esc(value)}</span>`;
    if (isTwin(ctx)) {
        return `<input type="text" class="mq-wwork" data-mq-kind="number" data-mq-expect="${esc(expect)}" data-ws-graded="0" inputmode="numeric" maxlength="3" autocomplete="off" spellcheck="false" aria-label="number ${esc(id)}" `
            + `style="${base}width:max(44px, ${L(ctx, wMm)});height:max(44px, ${L(ctx, hMm)});border:${B(ctx, 0.75)} solid ${INK};color:${INK};text-align:center;padding:0;margin:0;font-family:'Andika','Open Sans',sans-serif;">`;
    }
    return `<span class="mq-nt-tile" data-ws-slot="${esc(id)}" data-ws-shape="box" data-ws-graded="0"${ink ? ` data-ws-ink="${ink}"` : ''} style="${base}border:${B(ctx, 0.75)} solid ${INK};color:${ink === 'trace' ? GREY : INK};">${esc(value)}</span>`;
}

/* ------------------------------------------------------------------ the three tasks */

function parityCell(p, ctx) {
    const labels = LABELS2(p, ['Even', 'Odd']);
    const dp = digitPt(ctx);
    const hint = (n) => (showOn(p, ctx)
        ? `<span class="mq-nt-hint mq-keep-color"${HINT_ATTR} style="display:block;margin-top:${L(ctx, 1)};font-size:${P(ctx, textPt(ctx))};font-weight:400;color:${GREY};line-height:1.1;">${n % 2 === 0 ? 'even' : 'odd'}</span>`
        // (at level 0 the hint's line is kept EMPTY - a no-break space, no word - so the Test cell is as tall as the cell the
        // bridge measures at level 1: the drawn height matches its footprint, ws-empty-band EB-FOOT, precritic r8 notice test 15)
        : ctx && ctx.scaffoldLevel === 0 && p.show !== false
            ? `<span class="mq-nt-hint" aria-hidden="true" style="display:block;margin-top:${L(ctx, 1)};font-size:${P(ctx, textPt(ctx))};line-height:1.1;">\u00a0</span>`
            : '');
    const num = (n) => `<span style="display:inline-flex;flex-direction:column;align-items:center;min-width:${L(ctx, 10)};">`
        + `<span style="font-size:${P(ctx, dp)};font-weight:700;line-height:1;${KEY_FEATURES}">${esc(n)}</span>${hint(n)}</span>`;
    const fact = `<div class="mq-nt-fact" role="img" aria-label="${esc(`${p.a} times ${p.b}`)}" style="display:flex;justify-content:center;align-items:flex-start;gap:${L(ctx, 3)};">`
        + `${num(p.a)}<span style="font-size:${P(ctx, dp)};font-weight:700;line-height:1;">×</span>${num(p.b)}</div>`;
    const ask = `<div style="font-size:${P(ctx, textPt(ctx) + 1)};line-height:1.2;">The product is</div>`;
    // Finished work (state 'wrong': Error analysis and the other thinking pages show a pupil's choice; lf-algebra r4,
    // H13): "The product is" and the circled word read as ONE sentence on one line where the column is wide enough
    // (wrapping as before where it is not), and the column is marked data-ws-anscol, so Error analysis puts its
    // Correct / Fix-it block under the sentence, in the column (roles/error-analysis.js intoAnswerColumn). The block
    // beside the whole 39 mm fact left a 31 mm empty band under both at S (45 mm at L). Every other state draws as before.
    if (ctx.state === 'wrong' && !isTwin(ctx)) {
        const g3 = L(ctx, 3);
        const line = `<div class="mq-nt-sentence" style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;column-gap:${L(ctx, 4)};row-gap:${g3};">${ask}${wordChoice(ctx, labels, p)}</div>`;
        const col = `<div class="mq-nt-answer" data-ws-anscol style="display:flex;flex-direction:column;align-items:center;gap:${g3};">${line}</div>`;
        return root(ctx, 'mq-nt mq-nt--parity', `${fact}${col}`,
            { attrs: ' data-ws-inplace data-read', style: `display:flex;flex-direction:column;align-items:center;gap:${g3};${pad(ctx)}` });
    }
    return root(ctx, 'mq-nt mq-nt--parity', `${fact}${ask}${wordChoice(ctx, labels, p)}`,
        { attrs: ' data-ws-inplace data-read', style: `display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 3)};${pad(ctx)}` });
}

/** The feature track's tile side (mm), the patterns card §3. */
export const FEATURE_TILE_MM = Object.freeze({ S: 10, M: 11.5, L: 13 });

function trackTiles(p, ctx) {
    const terms = p.terms || [];
    const digits = Math.max(2, ...terms.map((v) => String(v).length));
    const sz = sizeOf(ctx);
    // the card's feature tiles (§3 Sizes: 10 / 11.5 / 13 mm at S / M / L), square: on the Test the pupil WRITES five
    // numbers in them (critic r2 G6: 9 x 8.5 mm at S measured 8.7 mm against the card's 10)
    // (an anchor-chart state, ntTight, is a picture nobody writes in, drawn at one fixed 64 mm width: it keeps the 9 x 8.5 mm
    // tiles its chart panels were measured with, so six still sit on one line)
    const side = ctx.ntTight ? 9 : FEATURE_TILE_MM[sz] || FEATURE_TILE_MM.L;
    const w = side + (digits > 2 ? 2.5 : 0);
    const h = ctx.ntTight ? 8.5 : side;
    const pt = Math.min(digitPt(ctx) * 0.7, 18);
    const filled = !!ctx.state && ctx.state !== 'blank' && ctx.state !== 'wrong';
    return terms.map((v, i) => {
        if (i === 0 || showOn(p, ctx)) return tile(ctx, { value: v, wMm: w, hMm: h, pt, hint: i > 0 });
        return tile(ctx, { value: filled ? v : '', wMm: w, hMm: h, pt, work: true, expect: String(v), id: `w${i}`, ink: filled ? inkOf(ctx) : null });
    });
}

/**
 * The sentence list: one row a sentence, the sentence WRAPPING in the cell's width and its check box on the right, every
 * box in one column (VQ-7). Each row is a div of exactly two spans [the sentence][the empty bordered box], the shape
 * screen-cell.js wireTickBoxes turns into one tap target a row. The whole list is ONE slot (shape check, AK-2).
 */
function sentenceList(ctx, choices, on) {
    const pt = textPt(ctx);
    const rows = choices.map((c, i) => {
        const box = checkBox(ctx, { id: `c${i}`, on: on === i, slot: false });
        const inner = `<div style="display:flex;align-items:center;gap:${L(ctx, 3)};margin:${L(ctx, ctx.ntTight ? 0.4 : 1.2)} 0;">`
            + `<span style="flex:1 1 auto;min-width:0;white-space:normal;text-align:left;font-size:${P(ctx, pt)};font-weight:700;line-height:1.25;">${esc(c)}</span>${box}</div>`;
        if (ctx.ntTight) return inner;
        // Each sentence carries its letter A / B / C, on paper and on screen: Error analysis's Fix-it row offers A / B / C
        // (roles/error-analysis.js choicesOf: "the letter the item prints beside the option"), so the item must print
        // them (critic r2 G5, H2: "Fix it [ ] A [ ] B [ ] C" beside unlettered sentences). The letter sits OUTSIDE the
        // [sentence][box] pair, so screen-cell.js wireTickBoxes still reads each pair as one tap row by its sentence.
        // (not on an anchor-chart state, ntTight: a 64 mm picture whose sentences would rewrap past the chart panel)
        // On paper the letter HANGS in the item-tab keep-out (the root's left pad, tab + 1 mm, empty below the tab), so the
        // sentences keep their whole width and wrap as before (a letter column inside the width wrapped them and Error
        // analysis S fell from 6 items to 4); on screen (no pad) it takes its own narrow column.
        const lw = pt * 0.3528 * 0.75, lg = 2;
        const hang = isTwin(ctx) ? '' : `margin-left:-${L(ctx, lw + lg)};`;
        const letter = `<span class="mq-nt-letter" style="flex:none;width:${L(ctx, lw)};font-size:${P(ctx, pt)};font-weight:700;line-height:1.25;text-align:left;">${LETTERS[i] || ''}</span>`;
        return `<div class="mq-nt-opt" data-ws-letter="${LETTERS[i] || ''}" style="display:flex;align-items:center;gap:${L(ctx, lg)};${hang}">${letter}<div style="flex:1 1 auto;min-width:0;">${inner}</div></div>`;
    }).join('');
    const ink = on >= 0 && ctx.state === 'answered' ? ' data-ws-ink="solid"' : '';
    // The ONE graded slot (AK-2) is the column of boxes, not the printed sentences: a sentence ("The ones digits go 4,
    // 6, 8") is a printed choice, never a written answer, so the key's slot holds only the tick (ws-cell-checks KEYJOIN,
    // precritic r5: 314 + 26 findings when the slot wrapped the sentences). An empty overlay over the box column, no taps.
    const side = S(ctx).checkMm;
    const slot = `<div data-ws-slot="answer" data-ws-shape="check"${ink} aria-hidden="true" style="position:absolute;top:0;bottom:0;right:0;width:${L(ctx, side)};pointer-events:none;"></div>`;
    return `<div class="k2-choices mq-nt-list" style="display:block;position:relative;text-align:left;">${rows}${slot}</div>`;
}

/** The anchor-chart state's drawing width (mm, drawn at S): the rule, the six tiles on one line, the three sentences. */
const FEATURE_STATE_W = 64;

function featureCell(p, ctx) {
    const choices = (p.choices || []).map(String);
    const on = isTwin(ctx) ? -1 : checkedChoice(p, ctx, choices);
    const rule = `<div class="mq-nt-rule" style="font-size:${P(ctx, textPt(ctx) + 1)};font-weight:700;line-height:1.2;">Start at ${esc(p.start)}. Add ${esc(p.step)} each time.</div>`;
    const tiles = trackTiles(p, ctx);
    // two threes side by side: one row of six where it fits, else three over three (never 5 + 1)
    const g = L(ctx, 1.5);
    const triple = (a) => `<span class="mq-nt-triple" style="display:inline-flex;flex-wrap:nowrap;gap:${g};">${a.join('')}</span>`;
    const track = `<div class="mq-nt-track" style="display:flex;justify-content:center;flex-wrap:wrap;gap:${g};">${triple(tiles.slice(0, 3))}${triple(tiles.slice(3))}</div>`;
    const list = sentenceList(ctx, choices, on);
    // the list sits under the track, left-aligned in a centred block, so every box lines up (VQ-7)
    // the rule and the track share one line where the cell is wide enough (a full-width row: 12 mm, not 22), else the
    // track wraps under the rule
    const head = `<div class="mq-nt-head" style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;column-gap:${L(ctx, 4)};row-gap:${L(ctx, 1.5)};">${rule}${track}</div>`;
    const body = `${head}${list}`;
    // An anchor-chart state (ntTight) is drawn at ONE fixed width, so the chart's zoom scales it as a picture: in a
    // stretchy panel the zoomed sentences rewrapped to more lines than the chart measured at zoom 1 and the panels ran
    // past their cells (ws-cell-checks OVERFLOW, precritic r5: notice_patterns patTask=feature lesson, 16 a size).
    const fixedW = ctx.ntTight && !isTwin(ctx) ? `width:${L(ctx, FEATURE_STATE_W)};flex:none;align-self:center;box-sizing:border-box;` : '';
    return root(ctx, 'mq-nt mq-nt--feature', body, { attrs: ' data-ws-inplace data-read', style: `display:flex;flex-direction:column;align-items:stretch;gap:${L(ctx, ctx.ntTight ? 1.2 : 2.5)};${pad(ctx)}${fixedW}` });
}

function trueFalseCell(p, ctx) {
    const labels = LABELS2(p, ['True', 'False']);
    const st = `<div class="mq-nt-statement" style="border:${B(ctx, 0.75)} solid ${INK};border-radius:${L(ctx, 1.5)};padding:${L(ctx, 2)} ${L(ctx, 3)};`
        + `font-size:${P(ctx, textPt(ctx) + 2)};font-weight:400;line-height:1.3;text-align:left;">${esc(p.statement)}</div>`;
    let row = '';
    if (showOn(p, ctx)) {
        const prods = p.products || [];
        const digits = Math.max(1, ...prods.map((v) => String(v).length));
        const sz = sizeOf(ctx);
        const w = (sz === 'S' ? 5.2 : sz === 'M' ? 6.2 : 7.2) + digits * (sz === 'S' ? 1.3 : 1.6);
        const pt = sz === 'S' ? 10 : sz === 'M' ? 12 : 14;
        row = `<div class="mq-nt-row"${HINT_ATTR} role="img" aria-label="${esc(`the ${p.table} times-table: ${prods.join(', ')}`)}" style="display:flex;justify-content:center;flex-wrap:wrap;gap:${L(ctx, 1)};">`
            + prods.map((v) => tile(ctx, { value: v, wMm: w, hMm: w * 0.8, pt })).join('') + '</div>';
    }
    return root(ctx, 'mq-nt mq-nt--tf', `${st}${row}${wordChoice(ctx, labels, p)}`,
        { attrs: ' data-ws-inplace data-read', style: `display:flex;flex-direction:column;align-items:stretch;gap:${L(ctx, 3)};${pad(ctx)}` });
}

/** Paper: clear of the item tab (CL-40); the twin needs no pad. */
const pad = (ctx) => (isTwin(ctx) || ctx.ntTight ? 'padding:0;' : `padding:${L(ctx, 1)} ${L(ctx, 1)} ${L(ctx, 1)} calc(var(--ws-tab, 5mm) + 1mm);box-sizing:border-box;width:100%;`);

register(NOTICE_TEMPLATE, {
    render(p, ctx) {
        if (p.task === 'feature') return featureCell(p, ctx);
        if (p.task === 'truefalse') return trueFalseCell(p, ctx);
        return parityCell(p, ctx);
    },
    answerKey(p) {
        if (p.task === 'feature') {
            const lab = String((p.choices || [])[correctOf(p)] || '');
            const slots = { answer: { value: lab, graded: true, accept: [lab.toLowerCase()] } };
            if (!showOn(p)) (p.terms || []).forEach((v, i) => { if (i > 0) slots[`w${i}`] = { value: String(v), graded: false }; });
            return { value: lab, display: lab, slots };
        }
        const labels = LABELS2(p, p.task === 'truefalse' ? ['True', 'False'] : ['Even', 'Odd']);
        const lab = labels[correctOf(p)];
        return { value: lab, display: lab, slots: { answer: { value: lab, graded: true, accept: [lab.toLowerCase(), lab.charAt(0).toLowerCase()] } } };
    },
    // answered in place (a ring or a check): rows packed to the measured height. The fact is narrow (three a row);
    // the sentences need a wide cell (two a row at S, where the text is smallest; one at M and L).
    footprint(p, ctx) {
        // (one wide cell a row at every size: two across at S left a 37 % band beside a cell whose sentences wrap
        // to more lines, H13; S still fits more rows than L, its text being smaller)
        if (p.task === 'feature' || p.task === 'truefalse') return { wMm: 130, hMm: null, measure: true, factLike: false, maxCols: 1, denseRoom: 1, inPlace: true };
        return { wMm: 60, hMm: null, measure: true, factLike: false, maxCols: 3, denseRoom: 1, inPlace: true };
    },
    inputs(p) {
        return [{ id: 'answer', kind: 'choice', shape: p.task === 'feature' ? 'check' : 'choice', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
    },
    layout() { return { card: 'card-medium-visual', checker: 'choice' }; },
    stepState: noticeStepState,
});

/**
 * The anchor chart's step states (roles/lesson.js stateDrawing, anchors.js): the item blank on every step, its answer
 * ringed / checked in grey on the last. Drawn at the standard's S size, so a chart panel (about 50 mm) holds the rule,
 * the track and the three sentences with the step's words (the host zooms the chart up when there is room).
 */
function noticeStepState(p, steps, k, ctx) {
    const n = Array.isArray(steps) && steps.length ? steps.length : 4;
    // (ntTight: the anchor's spacing - rows 0.4 mm apart, no item-tab pad: an anchor carries no tab)
    const state = k >= n - 1 ? 'traced' : 'blank';
    // (only the sentence task needs the S-size state: the parity fact and the true / false sentence fill a 2 x 2 chart
    // panel at the chart's own size - drawn at S they left a third of each panel empty, H13)
    // (a true / false sentence in a full-width ROW panel - the chart passes `hops` to column panels only - sits beside
    // the step's words at S too: at the chart's size its ten-tile row made the drawing 66 mm in a 53 mm row panel and the
    // panels ran past their cells, ws-cell-checks OVERFLOW on pattern_features patTask=truefalse lesson, precritic r5)
    const tfRow = p.task === 'truefalse' && !ctx.hops;
    // (the parity fact: no item-tab pad and no stretch (ntTight), so the drawing is its own width and the chart's zoom
    // scales it as a picture - at 100 % of a zoomed panel with the tab pad, Even / Odd and the ring left the cell,
    // ws-cell-checks OVERFLOW on notice_patterns band=25 lesson, precritic r5)
    if (p.task === 'parity') return this.render(p, Object.assign({}, ctx, { state, ntTight: true }));
    if (p.task !== 'feature' && !tfRow) return this.render(p, Object.assign({}, ctx, { state }));
    return this.render(p, Object.assign({}, ctx, { size: 'S', metrics: undefined, ntTight: true, state }));
}
