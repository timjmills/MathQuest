// gen-counting.js — Counting & Cardinality (K-2 number sense) question generation
//
// P6. THE PAGE HOLDS SIX ITEMS, AND MOST OF THESE PUPILS CANNOT YET READ AN INSTRUCTION, so the
// cell has to carry the question through its picture and its structure rather than through words:
//
//   * THE PICTURE IS THE QUESTION. Every visual skill here draws exactly what its answer counts,
//     and nothing in the cell states the answer. Three cells used to give it away — the teen cell
//     printed "10 + 8 = 18" under an item whose answer was 8, the tens cell printed "50" under
//     five rods when the answer was 5, and the number-bond ten frame said "fill the ten-frame
//     to 9" when 9 was the answer.
//   * ONE CELL SHAPE PER SKILL (P-28). Three skills used to flip into a "Click ALL ..."
//     multi-select on a quarter of their items, and three more flipped into a ten-frame widget;
//     a page therefore changed kind halfway down. The drag ten frame is its own skill
//     (ten_frame_build / ten_frame_build_teen) and stays there.
//   * BLACK, WHITE AND ONE GREY inside question content (INK-1), drawn once and used on screen
//     and on paper. NO EMOJI: they render in colour, they vary by platform and they are not
//     age-neutral (owner, 2026-09-20). Counters are plain shapes.
//   * THE INSTRUCTION IS AT MOST 12 WORDS AND LIVES ABOVE THE CELLS (BD-10). `q.text` keeps the
//     per-item sentence for the screen, the answer check and the audit's distinctness key;
//     `q.printText` is the short paper wording, which print-generate.js prefers. A cell may carry
//     a short RULE reminder, never a restatement of the instruction.
//   * THE WRITTEN RESPONSE IS A NUMBER, A WORD OR A MARK IN A CHECK BOX — never multiple choice
//     (P-29). The comparing skills answered "Group A" / "Group B" from a button row; on paper that
//     item is a check box, so the cell now draws a check-box list and the response is written.
//     The printed instruction says `Check one box.` and never "Tick" (BD-17, owner 2026-09-19),
//     and the printed key reads the label the cell prints, via `q.printAnswer`.
//   * ANYTHING A TEACHER WOULD CHOOSE (which form, which attribute, which count) is DEALT
//     round-robin off state.itemIndex rather than rolled, so six items are six different items.
//
// STILL OUTSTANDING, and deliberately not faked here: skill-options.js is not this wave's to
// edit, so the teacher choices these skills want (counter style; the comparing form; the count
// band; how many blanks a hundreds chart carries) are dealt across the page instead of ticked.
// The registrations wanted are named in the wave report.
import { state } from './state.js';
import { randInt, shuffle, pick } from './utils.js';
import { MONO, MONO_STROKE } from './design-tokens.js';

/* ============================================================== the black-and-white K-2 cell kit */

// INK-1: ink, paper and one grey are all that exist inside question content. Nothing in this
// family SHADES anything (a counter is ink, a frame is ink, an unknown is a dashed outline), so
// the grey is simply never reached — which is the point of naming the set.
const K_INK = MONO.ink;
const K_FONT = `'Andika','Open Sans',sans-serif`;
const K_HEAVY = MONO_STROKE.heavy;   // 1.5 — shape outlines and cell borders
const K_HAIR = MONO_STROKE.hair;     // 0.75 — grid interiors

/**
 * One boxed cell. No title, no colour: the drawing is the whole cell.
 *
 * `selfContained` marks a cell that already carries its own number sentence, so `q.text` would
 * be a second copy of it on screen. `facts-column-visual` is the repo's existing marker for
 * "the visual IS the question": question-render.js keeps q.text in the DOM for screen readers,
 * TTS and the headless tests but takes it out of the layout, and worksheet.js shows the visual
 * alone. Neither print-generate.js nor any stylesheet looks at the class, so paper is untouched
 * (verified: no other reference outside question-render.js and worksheet.js).
 */
const _kCell = (inner, note, selfContained) => `<div class="k2-cell`
    + `${selfContained ? ' facts-column-visual' : ''}" style="text-align:center;color:${K_INK};`
    + `font-family:${K_FONT};">${inner}`
    + `${note ? `<div style="margin-top:8px;font-size:0.95rem;line-height:1.35;">${note}</div>` : ''}</div>`;

/** The rule reminder a cell may carry (BD-10) — never a restatement of the instruction. */
const _kRuleBox = (text) => `<div style="display:inline-block;border:${K_HEAVY}px solid ${K_INK};`
    + `border-radius:10px;padding:4px 12px;margin-bottom:10px;font-size:0.95rem;">${text}</div>`;

/** Tick boxes: a LIST, with the box on the RIGHT of its label (owner, 2026-09-20). */
const _kTickList = (labels) => `<div style="display:inline-block;text-align:left;margin-top:10px;">`
    + labels.map(l => `<div style="display:flex;align-items:center;gap:10px;margin:5px 0;font-size:1.05rem;">`
        + `<span style="min-width:6.5em;">${l}</span>`
        + `<span style="display:inline-block;width:1.15em;height:1.15em;border:${K_HEAVY}px solid ${K_INK};"></span>`
        + `</div>`).join('') + `</div>`;

/**
 * A round-robin deal, so every ticked / available value actually appears on a page of six
 * instead of being rolled six times. `state.itemIndex` is the kept-item index the print
 * pipeline and the audit both pass; live play falls back to an internal cursor. The offset is
 * rolled once per page (at index 0) so two pages of the same skill do not open identically.
 */
let _kLiveCursor = -1;
let _kAt = 0;
const _kOffset = {};
/**
 * Start a new item. The position has to be fixed ONCE PER QUESTION, not once per deal: a cell
 * that deals two things (compare_groups deals its form AND its counter shape) would otherwise
 * advance a shared cursor twice per question, and `(at + off) % 3` with `at` stepping by 3 is
 * the same number every time — every live question would come out in the same form.
 */
function _kBeginItem() {
    _kAt = Number.isFinite(state.itemIndex) ? state.itemIndex : (++_kLiveCursor);
}
function _kDeal(n) {
    if (_kAt === 0) _kOffset[n] = Math.floor(Math.random() * n);
    return (((_kAt + (_kOffset[n] || 0)) % n) + n) % n;
}

/**
 * P8: the same deal, but through a permutation shuffled once per page, so every value still
 * appears but not in counting order. A ten-frame page that dealt 5, 6, 7, 8, 9, 10, 1, 2 ...
 * let the pupil copy the pattern instead of counting (critic, baseline 2026-09-24).
 */
const _kPerm = {};
function _kDealShuffled(n) {
    if (_kAt === 0 || !_kPerm[n]) _kPerm[n] = shuffle(Array.from({ length: n }, (_, i) => i));
    return _kPerm[n][((_kAt % n) + n) % n];
}

/**
 * The counters. Owner ruling (2026-09-20): a counter is EITHER a plain age-neutral shape OR one
 * of the in-house line-art pictures — never an emoji. The line-art set does not exist in the
 * repo yet, so these four plain shapes are all of it; `counterStyle` is the option that would
 * choose between the two families once the pictures land.
 */
const K_SHAPES = [
    {
        name: 'counter', plural: 'counters',
        draw: (cx, cy, s) => `<circle cx="${cx}" cy="${cy}" r="${s}" fill="${K_INK}"/>`,
    },
    {
        name: 'square', plural: 'squares',
        draw: (cx, cy, s) => `<rect x="${(cx - s).toFixed(1)}" y="${(cy - s).toFixed(1)}" `
            + `width="${(s * 2).toFixed(1)}" height="${(s * 2).toFixed(1)}" fill="none" `
            + `stroke="${K_INK}" stroke-width="${K_HEAVY}"/>`,
    },
    {
        name: 'triangle', plural: 'triangles',
        draw: (cx, cy, s) => `<polygon points="${cx},${(cy - s).toFixed(1)} `
            + `${(cx + s).toFixed(1)},${(cy + s * 0.85).toFixed(1)} `
            + `${(cx - s).toFixed(1)},${(cy + s * 0.85).toFixed(1)}" fill="none" `
            + `stroke="${K_INK}" stroke-width="${K_HEAVY}" stroke-linejoin="round"/>`,
    },
    {
        // Drawn as a <path> rather than a <polygon> ON PURPOSE. A pupil tells a star from a
        // triangle at a glance, but a checker counting SVG primitives cannot if both are
        // polygons — and "the answer matches the picture" is the one claim in this family that
        // has to be provable from the printed page. One primitive per counter kind makes it so.
        name: 'star', plural: 'stars',
        draw: (cx, cy, s) => {
            const pts = [];
            for (let i = 0; i < 5; i++) {
                const o = (i * 72 - 90) * Math.PI / 180;
                const n = ((i * 72) + 36 - 90) * Math.PI / 180;
                pts.push(`${(cx + s * Math.cos(o)).toFixed(1)},${(cy + s * Math.sin(o)).toFixed(1)}`);
                pts.push(`${(cx + s * 0.42 * Math.cos(n)).toFixed(1)},${(cy + s * 0.42 * Math.sin(n)).toFixed(1)}`);
            }
            return `<path d="M${pts.join('L')}Z" fill="none" stroke="${K_INK}" `
                + `stroke-width="${K_HEAVY}" stroke-linejoin="round"/>`;
        },
    },
];

/**
 * A count of one shape, laid out in ROWS OF FIVE. The five-row is a STRUCTURAL scaffold — it is
 * what makes one-to-one counting and subitising possible for these pupils — so it persists at
 * every level rather than fading.
 */
function _kShapeGrid(count, shape, { cell = 40, cols = 5, frame = false, tenGap = 0 } = {}) {
    const c = Math.max(1, Math.min(cols, count));
    const rows = Math.ceil(count / c);
    const pad = 8;
    // `tenGap` (P8): extra space under the second row of five, so a teen count reads as a ten
    // and some. Only meaningful with five to a row.
    const gapAfter = (r) => (tenGap && c === 5 && r >= 2 ? tenGap : 0);
    const w = (frame ? cols : c) * cell + pad * 2;
    const h = rows * cell + pad * 2 + gapAfter(rows - 1);
    let body = frame
        ? `<rect x="${K_HEAVY / 2}" y="${K_HEAVY / 2}" width="${w - K_HEAVY}" height="${h - K_HEAVY}" `
          + `rx="6" fill="none" stroke="${K_INK}" stroke-width="${K_HEAVY}"/>`
        : '';
    for (let i = 0; i < count; i++) {
        const cx = pad + (i % c) * cell + cell / 2;
        const cy = pad + Math.floor(i / c) * cell + cell / 2 + gapAfter(Math.floor(i / c));
        body += shape.draw(cx, cy, cell * 0.33);
    }
    return { svg: `<svg viewBox="0 0 ${w} ${h}" width="${Math.min(w, 330)}" `
        + `style="display:block;margin:0 auto;">${body}</svg>`, w, h, rows };
}

/** A 5x2 ten frame with the first `filled` cells carrying a black counter. */
function _kTenFrame(filled, { frames = 1, cell = 36 } = {}) {
    const pad = 6;
    const w = 5 * cell + pad * 2;
    const h = 2 * cell + pad * 2;
    const one = (from) => {
        let body = `<rect x="${K_HEAVY / 2}" y="${K_HEAVY / 2}" width="${w - K_HEAVY}" `
            + `height="${h - K_HEAVY}" fill="none" stroke="${K_INK}" stroke-width="${K_HEAVY}"/>`;
        for (let i = 0; i < 10; i++) {
            const x = pad + (i % 5) * cell;
            const y = pad + Math.floor(i / 5) * cell;
            body += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="none" `
                + `stroke="${K_INK}" stroke-width="${K_HAIR}"/>`;
            if (from + i < filled) {
                body += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${(cell * 0.3).toFixed(1)}" fill="${K_INK}"/>`;
            }
        }
        return `<svg viewBox="0 0 ${w} ${h}" width="${Math.min(w, 250)}" style="display:block;margin:4px auto;">${body}</svg>`;
    };
    let out = '';
    for (let f = 0; f < frames; f++) out += one(f * 10);
    return out;
}

/**
 * Base-10 rods of ten.
 *
 * Drawn here rather than by createBase10Blocks(), because that helper prints the stack's VALUE
 * underneath it — "50" under five rods — and that is a different number from the answer to "How
 * many tens?". For a pupil who cannot read the question, the number in the picture IS the answer
 * the picture gives, so five rods labelled 50 is the worst kind of item this family can print.
 *
 * Each rod is ONE outlined box divided into ten by nine hairlines, so a rod is visibly a ten and
 * the drawing is made of SVG primitives a gate can count — rather than of a CSS height a
 * restyle would move.
 */
function _kRods(rods) {
    const rodW = 18, rodH = 76, gap = 10, pad = 4;
    const w = rods * (rodW + gap) - gap + pad * 2;
    const h = rodH + pad * 2;
    let body = '';
    for (let i = 0; i < rods; i++) {
        const x = pad + i * (rodW + gap);
        body += `<rect x="${x}" y="${pad}" width="${rodW}" height="${rodH}" fill="none" `
            + `stroke="${K_INK}" stroke-width="${K_HEAVY}"/>`;
        for (let j = 1; j < 10; j++) {
            const y = (pad + (j / 10) * rodH).toFixed(1);
            body += `<line x1="${x}" y1="${y}" x2="${x + rodW}" y2="${y}" `
                + `stroke="${K_INK}" stroke-width="${K_HAIR}"/>`;
        }
    }
    return `<svg viewBox="0 0 ${w} ${h}" width="${Math.min(w * 1.3, 320)}" `
        + `style="display:block;margin:0 auto;">${body}</svg>`;
}

/** A horizontal bar: `len` is its length, `thick` its thickness. White inside, outline carries it. */
const _kHBar = (len, thick, boxW) =>
    `<svg viewBox="0 0 ${boxW} 44" width="${Math.min(boxW, 300)}" height="44" style="display:block;flex:0 1 auto;min-width:0;">`
    + `<rect x="1" y="${((44 - thick) / 2).toFixed(1)}" width="${len.toFixed(1)}" height="${thick.toFixed(1)}" `
    + `fill="none" stroke="${K_INK}" stroke-width="${K_HEAVY}"/></svg>`;

/** A vertical bar standing on the bottom of its box, so two of them share a baseline. */
const _kVBar = (h, boxH) =>
    `<svg viewBox="0 0 44 ${boxH}" width="44" height="${boxH}" style="display:block;">`
    + `<rect x="9" y="${(boxH - h).toFixed(1)}" width="26" height="${h.toFixed(1)}" `
    + `fill="none" stroke="${K_INK}" stroke-width="${K_HEAVY}"/></svg>`;

/** An answer rule: a line a pupil writes a number on (section 6 — a line means "write a number"). */
const _kLine = (chars = 2) => `<span style="display:inline-block;min-width:${(chars * 1.1).toFixed(2)}em;`
    + `border-bottom:${K_HEAVY}px solid ${K_INK};">&nbsp;</span>`;

/**
 * Two sizes inside [lo,hi], in a direction that is a coin flip, that a pupil can tell apart ON
 * PAPER (RP-3 / RP-5). The sizes are CSS px of an SVG that prints at 1 px = 0.265 mm.
 *
 * The old pair only promised `gapLo` px apart: a thickness pair of 10..34 with a gap of 8 printed
 * two bars 2 mm apart, and with the 50 px print cap on top the owner's printout showed "Which bar
 * is thicker?" over two bars that looked the same. Now the difference is at least
 *   - `gapLo` px, and
 *   - 18 px (4.8 mm at print size; still over 4 mm if the row has to shrink a little), and
 *   - a quarter of the larger size,
 * so both the absolute and the relative difference survive a photocopy.
 */
const K_MIN_DIFF_PX = 18;
const K_MIN_DIFF_REL = 0.25;
function _kPair(rng, lo, hi, gapLo, gapHi) {
    for (let t = 0; t < 40; t++) {
        const big = rng(lo, hi);
        const need = Math.max(gapLo, K_MIN_DIFF_PX, Math.ceil(big * K_MIN_DIFF_REL));
        if (big - need < lo) continue;
        const d = rng(need, Math.max(need, Math.min(Math.max(gapHi, need), big - lo)));
        const small = big - d;
        return rng(0, 1) === 1 ? [big, small] : [small, big];
    }
    return rng(0, 1) === 1 ? [hi, lo] : [lo, hi];
}

/* ================================================================================ the generator */

export function generateCountingQuestion(q, mappedSkill, helpers) {
    const { rng } = helpers;
    _kBeginItem();

    // ========================================
    // COUNT OBJECTS (Grade K) — "Count Objects (1-20)". The name bounds the count at 1-20 and
    // the picture is the only question a non-reader gets, so the cell draws `count` shapes in
    // rows of five and says nothing else.
    // ========================================
    if (mappedSkill === "count_objects") {
        // P8 (critic, baseline 2026-09-24):
        // - Counts of 1 or 2 are a glance, not a count: at most one cell in ten deals one, and
        //   the rest spread over 3-20 so the teen counts (the hard part of "1-20") get their share.
        // - Every object is drawn at a 52-unit pitch, which prints at about 9 mm (WS 11.2, the
        //   counting-picture minimum); the old 36-unit pitch printed 16-19 objects at 6 mm.
        // - A count above ten is drawn as TEN AND SOME: two rows of five, a gap, then the rest,
        //   so the picture teaches the ten inside a teen number (RP-21).
        const count = (_kAt % 10 === 9) ? rng(1, 2) : rng(3, 20);
        const shape = K_SHAPES[_kDeal(K_SHAPES.length)];
        const grid = _kShapeGrid(count, shape, { cell: 52, tenGap: count > 10 ? 18 : 0 });

        // "are there" is not padding: it is the count-EVERYTHING wording, and ws-content-audit
        // only proves "the number drawn equals the answer key" on cells that ask for the whole
        // picture. Losing it would switch off the one rule that catches the worst defect a
        // non-reader can meet.
        q.text = `How many ${shape.plural} are there?`;
        // The cell DRAWS the objects, so paper says only what the pupil must do (BD-10).
        q.printText = 'Count. Write how many.';
        q.ans = count;
        q.answerType = "number";
        q.hint = "Touch each one as you count. The last number you say is how many.";
        q.visual = _kCell(grid.svg);
        q.skillLabel = 'Count Objects';
        return;
    }

    // ========================================
    // COUNT SEQUENCE (Grade K) — next / before / BETWEEN, dealt so a page walks all three.
    // Every number printed and every answer stays inside 0-20, which is the band this K skill
    // sits in; the old code could print 21 beside an answer of 20.
    // ========================================
    else if (mappedSkill === "count_sequence") {
        const FORMS = ['after', 'before', 'between'];
        const form = FORMS[_kDeal(3)];
        let answer, questionText, blankPos, anchor;
        if (form === 'after') {
            // num 3..19 keeps the whole five-box window inside 0..20 without clamping.
            anchor = rng(3, 19);
            answer = anchor + 1;
            questionText = `What number comes after ${anchor}?`;
            blankPos = 4;
        } else if (form === 'before') {
            anchor = rng(1, 17);
            answer = anchor - 1;
            questionText = `What number comes before ${anchor}?`;
            blankPos = 0;
        } else {
            answer = rng(2, 18);
            questionText = `What number goes between ${answer - 1} and ${answer + 1}?`;
            blankPos = 2;
        }
        const start = answer - blankPos;
        const pathNums = [0, 1, 2, 3, 4].map(i => start + i);

        const boxW = 54, boxH = 46, gap = 8, pad = 6;
        const totalW = pathNums.length * (boxW + gap) - gap + pad * 2;
        const totalH = boxH + pad * 2;
        let boxesSvg = '';
        pathNums.forEach((n, i) => {
            const x = pad + i * (boxW + gap);
            const isBlank = n === answer;
            // LS-8: a dashed box is the one thing that means UNKNOWN.
            boxesSvg += `<rect x="${x}" y="${pad}" width="${boxW}" height="${boxH}" rx="6" fill="none" `
                + `stroke="${K_INK}" stroke-width="${K_HEAVY}"${isBlank ? ' stroke-dasharray="6,4"' : ''}/>`;
            if (!isBlank) {
                boxesSvg += `<text x="${x + boxW / 2}" y="${pad + boxH / 2 + 8}" text-anchor="middle" `
                    + `font-family="${K_FONT}" font-size="24" font-weight="700" fill="${K_INK}">${n}</text>`;
            }
        });

        q.text = questionText;
        q.printText = 'Write the missing number.';
        q.ans = answer;
        q.answerType = "number";
        q.hint = form === 'before'
            ? `Count back from ${anchor}. The number just before it goes in the box.`
            : form === 'after'
                ? `Count on from ${anchor}. The next number goes in the box.`
                : `Count on from ${answer - 1}. The next number goes in the box.`;
        q.visual = _kCell(`<svg viewBox="0 0 ${totalW} ${totalH}" width="${Math.min(totalW, 340)}" `
            + `style="display:block;margin:0 auto;">${boxesSvg}</svg>`);
        q.skillLabel = 'Next, Before, Between';
        return;
    }

    // ========================================
    // COMPARE GROUPS (Grade K) — more / fewer / same, dealt.
    //
    // Two things were wrong and both were about the picture. The groups were scattered circles
    // up to 14 a side, so 14-against-13 could not be judged by looking; and the answer was a
    // button row ("Group A"), which is not what this item is on paper. Both boxes now hold at
    // most ten counters in the SAME five-wide frame, one above the other, so the pupil can match
    // them column by column — and the response is a mark in a check box.
    // ========================================
    else if (mappedSkill === "compare_groups") {
        const FORMS = ['more', 'fewer', 'same'];
        const form = FORMS[_kDeal(3)];
        q._variant = form;

        // Both counts are drawn independently from 1..10, so which box holds more is a coin
        // flip rather than a rule ("B is always the bigger one") a pupil could learn instead of
        // looking. A difference of one is fair here: the five-wide frames line the counters up,
        // so nine against ten shows as one empty cell.
        const countA = rng(1, 10);
        let countB = rng(1, 10);
        // Half the "same?" items really ARE the same; otherwise that form always answers "not
        // the same" and the picture stops mattering.
        const wantSame = form === 'same' && _kDeal(2) === 0;
        if (wantSame) countB = countA;
        else for (let t = 0; t < 40 && countB === countA; t++) countB = rng(1, 10);
        if (!wantSame && countB === countA) countB = countA === 10 ? 9 : countA + 1;

        // The counter shape is dealt on its own cycle (4) beside the form's (3), so six cells
        // are six different pictures rather than three wordings printed twice.
        const shape = K_SHAPES[_kDeal(K_SHAPES.length)];
        const cell = 32, pad = 6, cols = 5;
        const boxW = cols * cell + pad * 2;
        // P8 (critic, baseline 2026-09-24): both frames are the SAME size — two rows of five,
        // whatever the count — so the frame's size never stands in for the number, and A's and
        // B's counters sit in the same columns for one-to-one matching.
        const drawBox = (n) => {
            const rows = 2;
            const h = rows * cell + pad * 2;
            let body = `<rect x="${K_HEAVY / 2}" y="${K_HEAVY / 2}" width="${boxW - K_HEAVY}" `
                + `height="${h - K_HEAVY}" rx="6" fill="none" stroke="${K_INK}" stroke-width="${K_HEAVY}"/>`;
            for (let i = 0; i < n; i++) {
                body += shape.draw(pad + (i % cols) * cell + cell / 2,
                    pad + Math.floor(i / cols) * cell + cell / 2, cell * 0.3);
            }
            return `<svg viewBox="0 0 ${boxW} ${h}" width="${boxW}" height="${h}" style="display:block;">${body}</svg>`;
        };
        const row = (label, n) => `<div style="display:flex;align-items:center;gap:12px;margin:5px 0;">`
            + `<span style="font-size:1.4rem;font-weight:700;width:1.2em;text-align:right;">${label}</span>`
            + drawBox(n) + `</div>`;

        // THE PAPER WORDING (BD-12 / BD-17, owner ruling 2026-09-19). "Tick" is not a word a
        // pupil ever reads, and `Check` is the library's verb for marking a printed box — but
        // P-LG-14 makes it name its object, so the string is "Check one box." and the two drawn
        // collections had to stop being called boxes or the pupil is told to check a box while
        // looking at two things also called boxes. They are GROUPS, which is what the skill's own
        // name calls them, so "box" now means the check box and nothing else.
        //   One string per task, byte-identical everywhere (P-LG-2 / BD-14): the question form
        // follows `decide-regroup` ("Do you need to regroup? Check one box."), and the same/not
        // the same form follows `true-false` ("Check one box: True or False."), which names its
        // two labels in the string.
        let questionText, answer, accepted, ticks;
        if (form === 'more') {
            questionText = `Which group has more ${shape.plural}?`;
            answer = countA > countB ? 'A' : 'B';
            accepted = answer === 'A' ? ['A', 'group a', 'box a'] : ['B', 'group b', 'box b'];
            ticks = ['Group A', 'Group B'];
            q.printText = 'Which group has more? Check one box.';
            q.selfAnswering = true;   // the cell draws the boxes; no writing rule beneath
            q.printAnswer = `Group ${answer}`;
        } else if (form === 'fewer') {
            questionText = `Which group has fewer ${shape.plural}?`;
            answer = countA < countB ? 'A' : 'B';
            accepted = answer === 'A' ? ['A', 'group a', 'box a'] : ['B', 'group b', 'box b'];
            ticks = ['Group A', 'Group B'];
            q.printText = 'Which group has fewer? Check one box.';
            q.selfAnswering = true;   // the cell draws the boxes; no writing rule beneath
            q.printAnswer = `Group ${answer}`;
        } else {
            questionText = `Do the groups have the same number of ${shape.plural}?`;
            answer = countA === countB ? 'same' : 'not the same';
            accepted = countA === countB ? ['same', 'yes'] : ['not the same', 'no', 'different'];
            ticks = ['Same', 'Not the same'];
            q.printText = 'Check one box: Same or Not the same.';
            q.selfAnswering = true;   // the cell draws the boxes; no writing rule beneath
            // The key is markable only if it reads one of the two labels the cell prints.
            q.printAnswer = countA === countB ? 'Same' : 'Not the same';
        }

        q.text = questionText;
        q.ans = answer;
        q.acceptedAnswers = accepted;
        q.answerType = "text";              // P-29: a check box on paper is a written answer on screen
        q.options = [];
        q.hint = `Match them one to one. Group A has ${countA}. Group B has ${countB}.`;
        q.visual = _kCell(
            `<div style="display:inline-block;">${row('A', countA)}${row('B', countB)}</div>`
            + _kTickList(ticks));
        q.skillLabel = 'More, Fewer, Same';
        return;
    }

    // ========================================
    // COMPARE OBJECTS (Grade K) — longer / shorter / taller, dealt over all four wordings.
    // Length bars share a left edge and height bars share a baseline, so the comparison is
    // decidable by looking; the response is a mark in a check box, not a button row.
    // ========================================
    else if (mappedSkill === "compare_objects") {
        // Three attributes, six wordings, dealt. Length and height were the only two the skill
        // used to teach, and its two "shorter" forms were word-for-word identical, so a page
        // could print the same sentence for a length item and a height item.
        const ATTRS = [
            { word: 'longer', noun: 'line', dim: 'length', bigger: true },
            { word: 'shorter', noun: 'line', dim: 'length', bigger: false },
            { word: 'taller', noun: 'tower', dim: 'height', bigger: true },
            { word: 'shorter', noun: 'tower', dim: 'height', bigger: false },
            { word: 'thicker', noun: 'bar', dim: 'thickness', bigger: true },
            { word: 'thinner', noun: 'bar', dim: 'thickness', bigger: false },
        ];
        const attr = ATTRS[_kDeal(ATTRS.length)];

        let a, b, picture, hint;
        const label = (l) => `<span style="font-size:1.4rem;font-weight:700;width:1.2em;text-align:right;">${l}</span>`;
        // nowrap !important: css/print-worksheet.css forces `flex-wrap: wrap !important` on every
        // flex row in a printed cell, which dropped the bar under its letter once the bars were
        // printed at their real size. The letter and its bar are one row.
        const stackedRow = (l, svg) => `<div style="display:flex;flex-wrap:nowrap !important;align-items:center;gap:10px;margin:4px 0;">${label(l)}${svg}</div>`;

        if (attr.dim === 'height') {
            [a, b] = _kPair(rng, 30, 100, 22, 45);
            // A COMMON BASELINE: both towers stand on the bottom of the same box, so the
            // comparison is decidable by looking at the tops and nothing else.
            picture = `<div style="display:flex;align-items:flex-end;justify-content:center;gap:40px;">`
                + `<div style="text-align:center;">${_kVBar(a, 110)}<div style="font-size:1.3rem;font-weight:700;">A</div></div>`
                + `<div style="text-align:center;">${_kVBar(b, 110)}<div style="font-size:1.3rem;font-weight:700;">B</div></div>`
                + `</div>`;
            hint = 'Both towers stand on the same line. Look at the tops.';
        } else if (attr.dim === 'length') {
            [a, b] = _kPair(rng, 60, 200, 45, 90);
            // A COMMON LEFT EDGE, and the same thickness on both, so only the length differs.
            picture = `<div style="display:inline-block;">`
                + stackedRow('A', _kHBar(a, 16, 210))
                + stackedRow('B', _kHBar(b, 16, 210))
                + `</div>`;
            hint = 'Both lines start in the same place. Look at the ends.';
        } else {
            [a, b] = _kPair(rng, 10, 40, 18, 26);   // 2.6..10.6 mm thick, >= 4.8 mm apart
            // The SAME length on both, so only the thickness differs.
            picture = `<div style="display:inline-block;">`
                + stackedRow('A', _kHBar(170, a, 180))
                + stackedRow('B', _kHBar(170, b, 180))
                + `</div>`;
            hint = 'Both bars are the same length. Look at how thick they are.';
        }
        const answer = (attr.bigger ? (a > b) : (a < b)) ? 'A' : 'B';

        const Noun = `${attr.noun[0].toUpperCase()}${attr.noun.slice(1)}`;

        q.text = `Which ${attr.noun} is ${attr.word}?`;
        // Paper wording (BD-12 / BD-17): "Tick" is not a word a pupil reads. `Check` is the
        // library's verb for marking a printed box and P-LG-14 makes it name that box, so the
        // string is the decide shape of `decide-regroup` — a question, then "Check one box."
        // Six attribute wordings, six strings, each byte-identical wherever that task appears
        // (P-LG-2 / BD-14) because both halves are built from the same `attr` record as q.text.
        q.printText = `Which ${attr.noun} is ${attr.word}? Check one box.`;
        q.selfAnswering = true;   // the cell draws the boxes; no writing rule beneath
        q.ans = answer;
        // The screen checks "A"; a teacher marks the label the cell actually prints.
        q.printAnswer = `${Noun} ${answer}`;
        q.acceptedAnswers = answer === 'A' ? ['A', `${attr.noun} a`] : ['B', `${attr.noun} b`];
        q.answerType = "text";
        q.options = [];
        q.hint = hint;
        q.visual = _kCell(picture + _kTickList([`${Noun} A`, `${Noun} B`]));
        q.skillLabel = 'Compare Attributes';
        return;
    }

    // ========================================
    // CLASSIFY & COUNT (Grade K, CCSS K.MD.B.3) — sort into categories and count one of them.
    //
    // The old cell could not be answered from its picture. Its categories were "Colour" and
    // "Shape", its items were coloured circles with a 9 px word under each, and a page that
    // drew seven circles (four of them labelled "Blue") then asked "How many are Shapes?" and
    // answered 4. In black and white the colour cue is gone entirely. The category is now the
    // SHAPE itself, which is the one thing the picture can carry, so the answer can never
    // disagree with the drawing — and the asked kind is shown as a specimen in a key box, so a
    // pupil who cannot read the word still knows what to count.
    // ========================================
    else if (mappedSkill === "classify_count") {
        const kinds = shuffle(K_SHAPES.slice()).slice(0, 2 + _kDeal(2));   // 2 or 3 kinds
        const counts = kinds.map(() => rng(2, 6));
        while (counts.reduce((s, n) => s + n, 0) > 14) {
            const i = counts.indexOf(Math.max(...counts));
            counts[i] = Math.max(2, counts[i] - 1);
        }
        const askIdx = rng(0, kinds.length - 1);
        const asked = kinds[askIdx];
        const answer = counts[askIdx];

        const bag = shuffle(kinds.flatMap((k, i) => Array.from({ length: counts[i] }, () => k)));
        const cell = 46, cols = Math.min(6, bag.length), pad = 8;
        const rows = Math.ceil(bag.length / cols);
        const w = cols * cell + pad * 2;
        const h = rows * cell + pad * 2;
        let body = '';
        bag.forEach((k, i) => {
            body += k.draw(pad + (i % cols) * cell + cell / 2,
                pad + Math.floor(i / cols) * cell + cell / 2, cell * 0.32);
        });

        // The key: one specimen of the asked kind in its own box. Not an instruction — the
        // referent the words "How many triangles?" point at.
        const keySvg = `<svg viewBox="0 0 46 46" width="46" height="46" style="vertical-align:middle;">`
            + `<rect x="${K_HEAVY / 2}" y="${K_HEAVY / 2}" width="${46 - K_HEAVY}" height="${46 - K_HEAVY}" `
            + `rx="5" fill="none" stroke="${K_INK}" stroke-width="${K_HEAVY}"/>`
            + asked.draw(23, 23, 13) + `</svg>`;

        // NOT "how many ...?". This is a SUBSET question — the picture holds three kinds and the
        // answer counts one of them — and "how many" is how ws-content-audit recognises a cell
        // that asks for the WHOLE picture. Phrased that way the gate would count every shape
        // drawn and call a correct answer wrong. "Count only the ..." says the same thing in
        // plainer English and leaves the item honestly unchecked, which is what that gate says
        // it wants for a subset.
        q.text = `Count only the ${asked.plural}.`;
        q.printText = 'Count one kind. Write how many.';
        q.ans = answer;
        q.answerType = "number";
        q.hint = `Look only at the ${asked.plural}. Touch each one as you count.`;
        q.visual = _kCell(
            `<div style="margin-bottom:8px;">${keySvg}</div>`
            + `<svg viewBox="0 0 ${w} ${h}" width="${Math.min(w, 340)}" style="display:block;margin:0 auto;">${body}</svg>`);
        q.skillLabel = 'Sort & Count';
        return;
    }

    // ========================================
    // NUMBER BONDS (Grade K) — "within 10", so the whole is 2-10 and the parts are whole numbers.
    // One cell shape: the bond diagram, with the missing part an empty dashed circle. The old
    // ten-frame variant asked the pupil to "fill the ten-frame to 9" on an item whose answer was
    // 9, in a seventeen-word cell; the drag ten frame lives in ten_frame_build.
    // ========================================
    else if (mappedSkill === "number_bonds") {
        const total = rng(2, 10);
        const partA = rng(1, total - 1);
        const partB = total - partA;
        // Deal which side is missing, so a page asks for both.
        const missingPart = _kDeal(2) === 0 ? "A" : "B";
        const answer = missingPart === "A" ? partA : partB;
        const shownPart = missingPart === "A" ? partB : partA;

        const svgW = 230, svgH = 168;
        const topCx = 115, topCy = 38, botLeftCx = 62, botRightCx = 168, botCy = 124, circR = 32;
        const circle = (cx, cy, label, unknown) =>
            `<circle cx="${cx}" cy="${cy}" r="${circR}" fill="none" stroke="${K_INK}" `
            + `stroke-width="${K_HEAVY}"/>`   // the unknown part is the EMPTY one, drawn solid (RP-60, LS-3)
            + (unknown ? '' : `<text x="${cx}" y="${cy + 9}" text-anchor="middle" font-family="${K_FONT}" `
                + `font-size="26" font-weight="700" fill="${K_INK}">${label}</text>`);

        // Written part + part = whole rather than whole = part + part. Both are number-bond
        // sentences and the diagram is the cell either way; this order is the one
        // ws-content-audit can read as an equation, so the answer key is checked on every item
        // instead of being taken on trust.
        q.text = `${missingPart === "A" ? "?" : partA} + ${missingPart === "B" ? "?" : partB} = ${total}`;
        q.printText = 'Write the missing part.';
        // The empty part of the bond IS the answer slot (RP-60), so paper gets no second
        // "Answer:" rule under the diagram (SL-7: one slot per item).
        q.selfAnswering = true;
        q.ans = answer;
        q.answerType = "number";
        q.hint = `${total} splits into two parts. One part is ${shownPart}. `
            + `Count on from ${shownPart} to ${total} to find the other part.`;
        q.visual = _kCell(
            `<svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 240)}" style="display:block;margin:0 auto;">`
            + `<line x1="${topCx}" y1="${topCy + circR}" x2="${botLeftCx}" y2="${botCy - circR}" `
            + `stroke="${K_INK}" stroke-width="${K_HEAVY}" stroke-linecap="round"/>`
            + `<line x1="${topCx}" y1="${topCy + circR}" x2="${botRightCx}" y2="${botCy - circR}" `
            + `stroke="${K_INK}" stroke-width="${K_HEAVY}" stroke-linecap="round"/>`
            + circle(topCx, topCy, total, false)
            + circle(botLeftCx, botCy, partA, missingPart === "A")
            + circle(botRightCx, botCy, partB, missingPart === "B")
            + `</svg>`);
        q.skillLabel = 'Number Bonds';
        return;
    }

    // ========================================
    // MAKE TEN (Grade K) — the frame shows what the pupil has; the answer is how many more.
    // The old ten-frame variant answered 10 every time (an answer key reading 10, 10, 10, 10,
    // 10, 10) and printed "The ten-frame already shows 5" above a frame the print handler drew
    // EMPTY. One cell shape now, and the filled count is dealt so six items differ.
    // ========================================
    else if (mappedSkill === "make_ten") {
        const filled = 1 + _kDeal(9);           // 1..9, every value on a page of six or more
        const answer = 10 - filled;

        q.text = `The frame shows ${filled}. How many more make 10?`;
        q.printText = 'Write how many more make 10.';
        q.ans = answer;
        q.answerType = "number";
        q.hint = `Count the empty boxes. ${filled} and ${answer} make 10.`;
        q.visual = _kCell(_kTenFrame(filled));
        q.skillLabel = 'Make 10';
        return;
    }

    // ========================================
    // TEEN COMPOSE (Grade K) — a teen number is one full ten and some ones.
    // The picture used to print "10 + 8 = 18" under an item whose answer was 8, and label the
    // loose counters "+ 8": the cell answered itself twice. It now draws ten and some ones and
    // says nothing. The two forms share one cell shape — a picture with a number sentence under
    // it that has exactly one blank — and are dealt.
    // ========================================
    else if (mappedSkill === "teen_compose") {
        const ones = 1 + _kDeal(9);             // 1..9 -> 11..19, every teen on a long enough page
        const teen = 10 + ones;
        const askTotal = _kDeal(2) === 1;

        const extras = _kShapeGrid(ones, K_SHAPES[0], { cell: 34, cols: 5 });
        // THE NUMBER SENTENCE IS PART OF THE CELL, not part of the instruction. Two wrong ways
        // round were tried on paper first: with `printText` the printed cell was a ten frame,
        // five loose counters and "Write the missing number." — unanswerable, because 5 and 15
        // are both defensible; without it, the underscores in the wording put the cell down
        // print-generate's inline-cloze path, which printed the sentence and threw the picture
        // away, on a skill whose title says "(Visual)". The sentence therefore lives in the
        // drawing, under the counters it describes, and q.text keeps it for the screen, the
        // answer check and the gate's equation rule.
        //
        // Because the sentence is IN the cell, q.text must not also be laid out beside it: on
        // screen the card rendered "10 + 8 =" twice, once from the drawing and once from
        // q.text, which is the restatement CL-1 forbids and the last thing a pupil who cannot
        // read a sentence needs two of. `_kCell(..., true)` marks the cell self-contained, so
        // q.text stays in the DOM for TTS, screen readers and the gate but out of the layout.
        q.text = askTotal ? `10 + ${ones} = ___` : `10 + ___ = ${teen}`;
        q.printText = 'Write the missing number.';
        q.ans = askTotal ? teen : ones;
        q.answerType = "number";
        q.hint = askTotal
            ? `The full frame is 10. Count on from 10 for each loose counter.`
            : `The full frame is 10. Count the loose counters — that is how many more than 10.`;
        q.visual = _kCell(
            _kTenFrame(10, { cell: 30 })
            + `<div style="margin-top:6px;">${extras.svg}</div>`
            + `<div style="margin-top:10px;font-size:1.6rem;font-weight:700;white-space:nowrap;">`
            + (askTotal ? `10 + ${ones} = ${_kLine(3)}` : `10 + ${_kLine(3)} = ${teen}`)
            + `</div>`, null, true);
        q.skillLabel = 'Teen Numbers';
        return;
    }

    // ========================================
    // TENS FOUNDATION (Grade K) — count the rods, not the value.
    // createBase10Blocks() prints the VALUE under the stack ("50" under five rods), which is a
    // different number from the answer (5) and, for a pupil who cannot read the question, IS the
    // answer the picture gives. The rods are drawn here instead, with the rule the pupil needs.
    // ========================================
    else if (mappedSkill === "tens_foundation_visual") {
        const rods = 1 + _kDeal(9);             // 1..9, dealt so six items differ

        q.text = `How many tens?`;
        q.printText = 'Write how many tens.';
        q.ans = rods;
        q.answerType = "number";
        q.options = [];
        q.hint = `Each rod is one ten. Count the rods.`;
        q.visual = _kCell(_kRuleBox('One rod is one ten.') + _kRods(rods));
        q.skillLabel = "Count Tens";
        q.printFormat = "tens-foundation";
        q.tensData = { rods };
        return;
    }

    // ========================================
    // HUNDREDS CHART FILL (Grade 1) — one blank on a 1-100 chart, row-major, +1 across and
    // +10 down. Black and white: the blank is a dashed box (LS-8), not an orange one, and the
    // cell no longer carries a caption naming a colour that paper does not have.
    // ========================================
    else if (mappedSkill === "hundreds_chart_fill") {
        // P8 (critic, baseline 2026-09-24): a WINDOW of the chart, not the whole chart. One
        // blank in a full 1-100 chart was a whole page representation per item (four to a page,
        // numerals ~7 pt), and a blank in row 1 is read off its neighbour. The window is three
        // rows of five cut from the chart, the blank in its MIDDLE row and never at a window
        // edge, so it has a number on all four sides: one more / one less across, ten more /
        // ten less down — the two patterns the chart exists to teach. Rows 2-9 only.
        const hcRow = randInt(1, 8);                       // 0-based chart row of the blank
        const hcCol = randInt(0, 9);                       // 0-based chart column
        const hcC0 = Math.max(0, Math.min(5, hcCol - 2));  // window's first column
        const hcCols = [0, 1, 2, 3, 4].map(k => hcC0 + k);
        // Keep the blank off the window's left and right edges.
        const target = hcRow * 10 + Math.max(hcC0 + 1, Math.min(hcC0 + 3, hcCol)) + 1;
        const hcRows = [hcRow - 1, hcRow, hcRow + 1];
        const cellW = 60, cellH = 48, padL = 4, padT = 4;
        const svgW = padL * 2 + 5 * cellW;
        const svgH = padT * 2 + 3 * cellH;
        let cells = '';
        hcRows.forEach((r, ri) => hcCols.forEach((c, ci) => {
            const n = r * 10 + c + 1;
            const x = padL + ci * cellW;
            const y = padT + ri * cellH;
            const isBlank = n === target;
            cells += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="none" `
                + `stroke="${K_INK}" stroke-width="${isBlank ? K_HEAVY * 1.5 : K_HAIR}"/>`;
            if (!isBlank) {
                cells += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 8}" text-anchor="middle" `
                    + `font-family="${K_FONT}" font-size="24" fill="${K_INK}">${n}</text>`;
            }
        }));
        q.chartWindow = { rows: hcRows, cols: hcCols };

        q.text = `What number goes in the blank?`;
        q.printText = 'Write the missing number.';
        q.ans = target;
        q.answerType = "number";
        q.options = [];
        q.hint = `Across a row the number goes up by 1. Down a column it goes up by 10.`;
        q.visual = _kCell(
            `<svg viewBox="0 0 ${svgW} ${svgH}" width="100%" preserveAspectRatio="xMidYMid meet" `
            + `style="width:100%;max-width:420px;height:auto;display:block;margin:0 auto;">${cells}</svg>`);
        q.skillLabel = "100-Chart Fill";
        q.printFormat = "hundreds-chart-fill";
        q.chartData = { target };
        return;
    }

    // ========================================
    // TEN-FRAME BUILD (Grade K) — drag counters into a 5x2 frame. The print handler draws the
    // empty frame and writes its own "Draw N dots" prompt, so the cell is honest on paper too.
    // ========================================
    else if (mappedSkill === "ten_frame_build") {
        const target = 1 + _kDealShuffled(10);  // 1..10, dealt so six items differ, shuffled
        q.text = `Build ${target} on the ten frame.`;
        q.printText = `Draw ${target} counter${target === 1 ? '' : 's'} in the ten frame.`;   // P8: "1 counter"
        q.target = target;
        q.ans = target;
        q.maxDots = 10;
        q.answerType = "ten-frame-build";
        q.hint = `Put one counter in each box until you have ${target}.`;
        q.skillLabel = "Ten Frame Build";
        q.printFormat = "ten-frame-build";
        q.visual = "";
        q.options = [];
        return;
    }

    // ========================================
    // TEN-FRAME BUILD TEEN (Grade K/1) — a TEEN number is 11 to 19. The old code dealt 11-20,
    // so "Build a Teen Number" printed 20, which is not one (owner: fix the content or fix the
    // name; the id and the label both say teen, so the content moves).
    // ========================================
    else if (mappedSkill === "ten_frame_build_teen") {
        const target = 11 + _kDealShuffled(9);  // 11..19, shuffled
        q.text = `Build ${target} on the ten frames.`;
        q.printText = `Draw ${target} counters in the ten frames.`;
        q.target = target;
        q.ans = target;
        q.maxDots = 20;
        q.answerType = "ten-frame-build";
        q.hint = `Fill the first frame to 10, then put ${target - 10} in the second frame.`;
        q.skillLabel = "Teen Ten Frame";
        q.printFormat = "ten-frame-build";
        q.visual = "";
        q.options = [];
        return;
    }

    // ========================================
    // BASE-10 BUILD (Grade 1) — model 11..99 with rods and units, no regrouping.
    // ========================================
    else if (mappedSkill === "base10_build") {
        const target = rng(11, 99);
        const tens = Math.floor(target / 10);
        const ones = target % 10;
        q.text = `Build ${target} with base-10 blocks.`;
        q.printText = `Draw ${target} with rods and units.`;
        q.target = target;
        q.ans = target;
        q.maxPlace = 10;
        q.allowRegroup = false;
        q.places = [10, 1];
        q.answerType = "base10-build";
        q.hint = `${target} is ${tens} ten${tens === 1 ? '' : 's'} and ${ones} one${ones === 1 ? '' : 's'}.`;
        q.skillLabel = "Base-10 Build";
        q.printFormat = "base10-build";
        q.visual = "";
        q.options = [];
        return;
    }

    // ========================================
    // BASE-10 REGROUP (Grade 2) — build, then trade one ten for ten ones and check the total has
    // not moved. The instruction no longer names an on-screen button: paper has no button, and
    // twenty words is not a cell (BD-10). The button name stays in the hint, where it belongs.
    // ========================================
    else if (mappedSkill === "base10_regroup") {
        const target = rng(20, 99);
        const tens = Math.floor(target / 10);
        const ones = target % 10;
        q.text = `Build ${target}. Trade 1 ten for 10 ones.`;
        q.printText = `Draw ${target}. Then trade 1 ten for 10 ones.`;
        q.target = target;
        q.ans = target;
        q.maxPlace = 10;
        q.allowRegroup = true;
        q.places = [10, 1];
        q.answerType = "base10-build";
        q.hint = `Build ${target} (${tens} tens and ${ones} ones), then press "Decompose 1 ten". `
            + `You now have ${tens - 1} tens and ${ones + 10} ones — still ${target}.`;
        q.skillLabel = "Base-10 Regroup";
        q.printFormat = "base10-build";
        q.visual = "";
        q.options = [];
        return;
    }

    // ========================================
    // BASE-10 BUILD HUNDREDS (Grade 2) — model 100..999 with flats, rods and units.
    // ========================================
    else if (mappedSkill === "base10_build_hundreds") {
        const target = rng(100, 999);
        const hundreds = Math.floor(target / 100);
        const tens = Math.floor((target % 100) / 10);
        const ones = target % 10;
        q.text = `Build ${target} with flats, rods and units.`;
        q.printText = `Draw ${target} with flats, rods and units.`;
        q.target = target;
        q.ans = target;
        q.maxPlace = 100;
        q.allowRegroup = true;
        q.places = [100, 10, 1];
        q.answerType = "base10-build";
        q.hint = `${target} is ${hundreds} hundred${hundreds === 1 ? '' : 's'}, `
            + `${tens} ten${tens === 1 ? '' : 's'} and ${ones} one${ones === 1 ? '' : 's'}.`;
        q.skillLabel = "Base-10 Hundreds";
        q.printFormat = "base10-build";
        q.visual = "";
        q.options = [];
        return;
    }

    // ========================================
    // ADD 5 PICTURES (Grade K) — sums to 5, drawn as two groups of counters.
    //
    // These two live in the addition / subtraction categories rather than in this family, but
    // they are generated here and they used emoji counters, which the owner has ruled out: they
    // render in colour, they differ from machine to machine and they are not age-neutral. The
    // counter is now a geometric glyph, which is monochrome text on every platform, prints in
    // the sheet's own ink and survives the cross-out rule the sub-5 print cell draws.
    // ========================================
    else if (mappedSkill === "add_5_pictures") {
        const counterSet = ["●", "■", "▲", "★", "◆"];
        const counter = pick(counterSet);
        let n, m;
        do { n = randInt(1, 3); m = randInt(1, 3); } while (n + m > 5);
        const total = n + m;

        const group = (k) => `<span style="font-size:1.9rem;letter-spacing:5px;color:${K_INK};">${counter.repeat(k)}</span>`;

        const optsSet = new Set([total]);
        while (optsSet.size < 3) {
            const cand = total + (Math.random() < 0.5 ? -1 : 1) * randInt(1, 2);
            if (cand >= 0 && cand <= 5) optsSet.add(cand);
        }
        if (optsSet.size < 3) { for (let v = 0; v <= 5 && optsSet.size < 3; v++) optsSet.add(v); }

        const mcOptions = shuffle([...optsSet]);
        q.text = `How many in all? ${n} + ${m} = ?`;
        q.printText = 'Count them all. Write how many.';
        q.ans = total;
        q.answerType = "multiple-choice";
        q.options = mcOptions;
        q.hint = `Count the first group, then keep counting into the second. ${n} + ${m} = ${total}.`;
        q.visual = _kCell(
            `<div style="display:inline-flex;align-items:center;justify-content:center;gap:14px;`
            + `border:${K_HEAVY}px solid ${K_INK};border-radius:10px;padding:12px 16px;white-space:nowrap;max-width:100%;">`
            + group(n)
            + `<span style="font-size:1.7rem;font-weight:800;">+</span>`
            + group(m)
            + `<span style="font-size:1.7rem;font-weight:800;">=</span>`
            + `<span style="display:inline-block;min-width:2.4em;border-bottom:${K_HEAVY}px solid ${K_INK};">&nbsp;</span>`
            + `</div>`);
        q.skillLabel = "Add ≤5 Pics";
        q.printFormat = "add-5-pictures";
        q.pictureData = { emoji: counter, n, m, total, mcOptions };
        return;
    }

    // ========================================
    // SUB 5 PICTURES (Grade K) — take away from a group of at most 5, the taken ones crossed out.
    // ========================================
    else if (mappedSkill === "sub_5_pictures") {
        const counterSet = ["●", "■", "▲", "★", "◆"];
        const counter = pick(counterSet);
        // P8: one cell in six is an edge case — take away 0, or take away all of them — the two
        // facts a within-5 page otherwise never deals (critic, baseline 2026-09-24).
        const n = randInt(2, 5);
        const m = (_kAt % 6 === 5) ? (randInt(0, 1) ? n : 0) : randInt(1, n - 1);
        const remain = n - m;

        // A bold X through each taken-away picture (black over a white halo), not a line-through.
        const crossX = `<svg viewBox="0 0 10 10" preserveAspectRatio="none" style="position:absolute;left:-8%;top:-8%;width:116%;height:116%;overflow:visible;">`
            + `<path d="M1 1 L9 9 M9 1 L1 9" stroke="#fff" stroke-width="5" vector-effect="non-scaling-stroke" stroke-linecap="round" fill="none"/>`
            + `<path d="M1 1 L9 9 M9 1 L1 9" stroke="${K_INK}" stroke-width="2.4" vector-effect="non-scaling-stroke" stroke-linecap="round" fill="none"/></svg>`;
        let pics = '';
        for (let i = 0; i < n; i++) {
            const crossed = i < m;
            pics += `<span style="font-size:1.9rem;display:inline-block;position:relative;margin:0 4px;color:${K_INK};">`
                + `${counter}${crossed ? crossX : ''}</span>`;
        }

        const optsSet = new Set([remain]);
        while (optsSet.size < 3) {
            const cand = remain + (Math.random() < 0.5 ? -1 : 1) * randInt(1, 2);
            if (cand >= 0 && cand <= 5) optsSet.add(cand);
        }
        if (optsSet.size < 3) { for (let v = 0; v <= 5 && optsSet.size < 3; v++) optsSet.add(v); }

        const mcOptions = shuffle([...optsSet]);
        q.text = `Start with ${n}, take away ${m}. How many are left?`;
        q.printText = 'Count the ones not crossed out.';
        q.ans = remain;
        q.answerType = "multiple-choice";
        q.options = mcOptions;
        q.hint = `Count only the ones that are NOT crossed out. ${n} − ${m} = ${remain}.`;
        q.visual = _kCell(
            `<div style="display:inline-block;border:${K_HEAVY}px solid ${K_INK};border-radius:10px;padding:12px 16px;">`
            + `<div style="line-height:1.1;">${pics}</div>`
            + `<div style="margin-top:10px;font-size:1.2rem;font-weight:700;">${n} − ${m} = `
            + `<span style="display:inline-block;min-width:2.2em;border-bottom:${K_HEAVY}px solid ${K_INK};">&nbsp;</span></div>`
            + `</div>`);
        q.skillLabel = "Sub ≤5 Pics";
        q.printFormat = "sub-5-pictures";
        q.pictureData = { emoji: counter, n, m, remain, mcOptions };
        return;
    }

    // Fallback
    else {
        q.text = `1 + 1 = ?`;
        q.printText = 'Write the answer.';
        q.ans = 2;
        q.answerType = "number";
        q.hint = "One and one more is two.";
        q.visual = _kCell(_kShapeGrid(2, K_SHAPES[0], { cell: 44 }).svg);
        return;
    }
}
