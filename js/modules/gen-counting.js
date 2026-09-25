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
import { k2Twin, K2_SHAPES } from './sheet/index.js';
import { optionsFor } from './skill-options.js';
import { fadeRung } from './sheet/index.js';

/* ================================================= P11 · the teacher's options (skill-options.js) */
// The K-2 options P11_K2_OPTIONS declares (count to, objects, arrangement, support level, compare
// by, count by, direction, what is missing, pictures) are read here. Each defaults to what the skill
// dealt before (R2), and every default path draws exactly the random numbers it drew before.
function _kOpt(id) {
    let def = null;
    try { def = optionsFor(state.category, state.skill).find(o => o.id === id) || null; } catch (e) { def = null; }
    if (!def) return undefined;
    const o = state.skillOptions;
    const v = o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, id) ? o[id] : undefined;
    return v === undefined ? def.default : v;
}
/** The support level for this item: the ticked levels dealt most-support-first (a fading page). */
function _kLevel(fallback = 1) {
    let t = _kOpt('level');
    if (typeof t === 'number') t = [t];
    t = Array.isArray(t) ? t.map(Number).filter(Number.isFinite) : [];
    if (!t.length) return fallback;
    t = t.slice().sort((x, y) => y - x);
    // S2: a fade down the page (sheet/supports.js fadeRung), never a cycle, on a printed page.
    return t[fadeRung(_kAt, t.length, state.itemCount, Number.isFinite(state.itemIndex))];
}
/** Scattered positions (mm) for `n` objects: a jittered lattice with empty cells, never touching. */
function _kScatter(n, rng) {
    const cols = 6, rows = Math.ceil(n / cols) + 1, pitch = 12.5;
    const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, n);
    return cells.map(c => [
        +(6 + (c % cols) * pitch + (rng(0, 40) - 20) / 10).toFixed(1),
        +(6 + Math.floor(c / cols) * pitch + (rng(0, 40) - 20) / 10).toFixed(1),
    ]);
}

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
function _kTenFrame(filled, { frames = 1, cell = 36, rows = 2 } = {}) {
    // rows: 1 draws a FIVE frame (make_ten "Make 5").
    const pad = 6;
    const w = 5 * cell + pad * 2;
    const h = rows * cell + pad * 2;
    const one = (from) => {
        let body = `<rect x="${K_HEAVY / 2}" y="${K_HEAVY / 2}" width="${w - K_HEAVY}" `
            + `height="${h - K_HEAVY}" fill="none" stroke="${K_INK}" stroke-width="${K_HEAVY}"/>`;
        for (let i = 0; i < rows * 5; i++) {
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

/* ===================================================== the kit cell (SKILL_CELL_CONTRACT 10.1) */

// P10: the migrated skills hand their item to a SHEET KIT template (`q.cell`), and the screen
// hosts draw that same template's twin (`q.visual`), so paper, key and screen are one drawing.
function _kSetCell(q, template, payload) {
    q.cell = { template, v: 1, payload };
    q.visual = k2Twin(template, payload);
}

/** The plain counters of the count cells (one SVG primitive each, RP-20 plain set). */
const K2_COUNT_SHAPES = ['circle', 'square', 'triangle', 'star'];
/** O6 AP1: the in-house line-art pictures (RP-20 picture set) the "Objects: Pictures" value draws. */
const K2_PICTURE_KINDS = ['ball', 'apple', 'fish', 'flower'];

/**
 * A choice held for a whole printed page: drawn at the page's first item and kept (one routine
 * per page, P-28). Live play has no page, so it deals round-robin instead.
 */
const _kPageHeld = {};
function _kPageDeal(key, n) {
    if (!Number.isFinite(state.itemIndex)) return _kDeal(n);
    if (state.itemIndex === 0 || _kPageHeld[key] === undefined) _kPageHeld[key] = Math.floor(Math.random() * n);
    return _kPageHeld[key];
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
        // P10 (critic, regrade 2026-09-25): the kit's `counters` cell. Outline objects 9 mm across
        // (never a solid fill over 7 mm, INK-5) in rows of five, a ten as two rows and the ones
        // under a gap, beside the K answer square — the only answer place, no "Answer:" line.
        // The count is dealt through a shuffled permutation of 3-20 (one cell in ten a 1 or 2), so
        // a page spreads it instead of rolling six numbers that may repeat.
        // P11: "Count to" 5 / 10 / 20 (20 is the stand-alone default).
        const band = Number(_kOpt('band')) || 20;
        const count = band <= 5 ? 1 + _kDealShuffled(5)
            : band <= 10 ? ((_kAt % 10 === 9) ? rng(1, 2) : 3 + _kDealShuffled(8))
                : (_kAt % 10 === 9) ? rng(1, 2) : 3 + _kDealShuffled(18);
        const objects = _kOpt('objects') || 'shapes';
        const shape = objects === 'pictures' ? ['ball', 'apple', 'fish'][rng(0, 2)]
            : objects === 'frame' || objects === 'dice' ? 'circle'
                : K2_COUNT_SHAPES[rng(0, K2_COUNT_SHAPES.length - 1)];
        const plural = objects === 'frame' || objects === 'dice' ? 'dots' : K2_SHAPES[shape].plural;
        // "are there" is not padding: it is the count-EVERYTHING wording ws-content-audit keys its
        // "the number drawn equals the answer key" rule on.
        q.text = `How many ${plural} are there?`;
        q.printText = 'Count. Write how many.';
        q.ans = count;
        q.answerType = "number";
        q.options = [];
        q.selfAnswering = true;
        q.hint = "Touch each one as you count. The last number you say is how many.";
        // The two real counting errors (a K pupil's error analysis): one counted twice, one missed.
        q.distractorTags = _kDeal(2) === 0 || count === 1
            ? { [count + 1]: 'counted one object twice' }
            : { [count - 1]: 'missed one object' };
        const _coPayload = { kind: 'count', n: count, shape, ans: count };
        if (objects === 'frame' || objects === 'dice') _coPayload.objects = objects;
        const layout = _kOpt('orientation') || 'rows';
        if (layout === 'line' || layout === 'scattered') _coPayload.layout = layout;
        if (layout === 'scattered' && objects !== 'frame' && objects !== 'dice') _coPayload.pos = _kScatter(count, rng);
        const lvl = _kLevel(1);
        if (lvl >= 2) _coPayload.track = band;          // a number track 1..band to point along (hint)
        if (lvl >= 3) _coPayload.traced = true;         // the answer written in grey to trace
        q.supportLevel = lvl;
        _kSetCell(q, 'counters', _coPayload);
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
        // P11: "Which number" (after / before / all three) and "Count to" (10 / 20 / 100).
        const _csDir = _kOpt('dir');
        const form = _csDir === 'forward' ? 'after' : _csDir === 'back' ? 'before' : FORMS[_kDeal(3)];
        const _csTop = Number(_kOpt('band')) || 20;
        let answer, questionText, blankPos, anchor;
        if (form === 'after') {
            // num 3..19 keeps the whole five-box window inside 0..20 without clamping.
            anchor = rng(3, _csTop - 1);
            answer = anchor + 1;
            questionText = `What number comes after ${anchor}?`;
            blankPos = 4;
        } else if (form === 'before') {
            anchor = rng(1, _csTop - 3);
            answer = anchor - 1;
            questionText = `What number comes before ${anchor}?`;
            blankPos = 0;
        } else {
            answer = rng(2, _csTop - 2);
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
        // P11 Support level 0: the question alone, with no number path to read the gap from.
        if (_kLevel(1) === 0) {
            q.visual = _kCell(`<div style="font-size:1.6rem;font-weight:700;">${questionText.replace('?', '')} ${_kLine(2)}</div>`, null, true);
            q.supportLevel = 0;
        }
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
        // P10 (critic, regrade 2026-09-25): the kit's `compare` cell. Two fixed 2 x 5 frames, one
        // above the other, aligned column by column for one-to-one matching; the two labelled
        // check boxes are the only answer place.
        //   ONE ROUTINE PER PAGE: the form (more / fewer / same) is drawn at a page's first item
        // and held, so a sheet never switches task between cells (P-28). Live play deals it.
        //   NEAR MISSES: the two counts differ by 1 to 3 (never 1 against 10), so the pupil has to
        // match to decide; half the "same?" items really are the same.
        const FORMS = ['more', 'fewer', 'same'];
        // P11: "Compare by" fixes the question for the page; the default deals one per page.
        const _cgDir = _kOpt('dir');
        // P11 (critic round 2): Mixed deals more, fewer and same across the page, two of each per six,
        // through a shuffled permutation, so there is no question pattern to copy.
        const form = FORMS.includes(_cgDir) ? _cgDir : FORMS[_kDealShuffled(6) % 3];
        const _cgTop = Number(_kOpt('band')) || 10;
        q._variant = form;
        const wantSame = form === 'same' && rng(0, 1) === 0;   // rolled: a dealt same / not alternated
        let countA, countB;
        if (wantSame) {
            countA = countB = 2 + _kDealShuffled(_cgTop - 1);
        } else {
            const diff = [1, 1, 2, 2, 3][_kDeal(5)];
            const lo = Math.max(1, Math.min(2, _cgTop - diff - 1)) + rng(0, Math.max(0, _cgTop - 2 - diff));   // 2 .. top - diff
            const big = lo + diff;
            [countA, countB] = rng(0, 1) === 1 ? [big, lo] : [lo, big];
        }
        let labels, values, correct, questionText, printText;
        if (form === 'same') {
            labels = ['Same', 'Not the same'];
            values = ['same', 'not the same'];
            correct = countA === countB ? 0 : 1;
            questionText = 'Do the groups have the same number of counters?';
            printText = 'Check one box: Same or Not the same.';
            q.acceptedAnswers = correct === 0 ? ['same', 'yes'] : ['not the same', 'no', 'different'];
        } else {
            const word = form === 'more' ? 'more' : 'fewer';
            labels = [`A has ${word}`, `B has ${word}`];
            values = ['A', 'B'];
            const aWins = form === 'more' ? countA > countB : countA < countB;
            correct = aWins ? 0 : 1;
            questionText = `Which group has ${word} counters?`;
            printText = `Which group has ${word}? Check one box.`;
            q.acceptedAnswers = correct === 0 ? ['A', 'group a', `a has ${word}`] : ['B', 'group b', `b has ${word}`];
        }
        q.text = questionText;
        q.printText = printText;
        q.ans = values[correct];
        q.printAnswer = labels[correct];
        q.selfAnswering = true;             // the check boxes are the answer place (SL-7)
        q.answerType = "text";              // P-29: a check box on paper is a written answer on screen
        q.options = [];
        q.hint = `Match them one to one. Group A has ${countA}. Group B has ${countB}.`;
        q.distractorTags = { [values[1 - correct]]: 'judged by how the groups look, not by matching one to one' };
        const _cgPayload = { a: countA, b: countB, labels, values, correct };
        // O6 AP1 "Objects": both groups drawn the same way — counters in ten frames (the default,
        // unchanged), plain shapes or pictures in rows of five, or dice. Only the picture changes;
        // the counts above were dealt first, so they are the same items.
        const _cgObj = _kOpt('objects');
        if (_cgObj === 'shapes' || _cgObj === 'pictures' || _cgObj === 'dice') {
            _cgPayload.objects = _cgObj;
            let noun = 'dots';
            if (_cgObj !== 'dice') {
                _cgPayload.shape = _cgObj === 'pictures' ? K2_PICTURE_KINDS[_kDeal(3)] : K2_COUNT_SHAPES[_kDeal(K2_COUNT_SHAPES.length)];
                noun = K2_SHAPES[_cgPayload.shape].plural;
            }
            q.text = form === 'same' ? `Do the groups have the same number of ${noun}?` : `Which group has ${form === 'more' ? 'more' : 'fewer'} ${noun}?`;
        }
        if (_kLevel(1) >= 2) _cgPayload.showCounts = true;   // P11 hint: how many, beside each frame
        _kSetCell(q, 'compare', _cgPayload);
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
        // P11: "Compare by" (bigger / smaller words) and "What is compared" filter the six wordings.
        const _coDir = _kOpt('dir'), _coTask = _kOpt('task');
        const _coPool = ATTRS.filter(x => (_coDir === 'more' ? x.bigger : _coDir === 'fewer' ? !x.bigger : true)
            && (['length', 'height', 'thickness'].includes(_coTask) ? x.dim === _coTask : true));
        const attr = _coPool.length === ATTRS.length ? ATTRS[_kDeal(ATTRS.length)] : _coPool[_kDeal(_coPool.length)];

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
        // P11: "Kinds of shape" (2 / 3 / 4) and "Count to" (3 / 6 / 10; 6 is the default).
        const _ccKinds = Number(_kOpt('tiles'));
        // O6 AP1 round 2: drawn by the kit's `counters` cell (kind 'sort'): a key box with one
        // specimen of the kind to count, the mixed bag six to a row, and the K answer square — the
        // same content the old HTML cell drew, now one drawing on paper, key and screen, with no
        // "Answer:" line under it. "Objects": four plain outline shapes (the default) or four
        // line-art pictures. The draws are the old ones (a four-way shuffle, the counts, the bag).
        const _ccPics = _kOpt('objects') === 'pictures';
        const _ccPool = _ccPics ? K2_PICTURE_KINDS : K2_COUNT_SHAPES;
        const kinds = shuffle(_ccPool.slice()).slice(0, _ccKinds >= 2 ? _ccKinds : 2 + _kDeal(2));   // 2 or 3 kinds
        const _ccTop = Number(_kOpt('band')) || 6;
        const counts = kinds.map(() => rng(_ccTop <= 3 ? 1 : 2, _ccTop));
        const _ccCap = _ccTop <= 3 ? 9 : _ccTop <= 6 ? 14 : 24;
        while (counts.reduce((s, n) => s + n, 0) > _ccCap) {
            const i = counts.indexOf(Math.max(...counts));
            counts[i] = Math.max(2, counts[i] - 1);
        }
        const askIdx = rng(0, kinds.length - 1);
        const asked = kinds[askIdx];
        const answer = counts[askIdx];
        const bag = shuffle(kinds.flatMap((k, i) => Array.from({ length: counts[i] }, () => k)));
        const plural = K2_SHAPES[asked].plural;

        // NOT "how many ...?". This is a SUBSET question — the picture holds three kinds and the
        // answer counts one of them — and "how many" is how ws-content-audit recognises a cell
        // that asks for the WHOLE picture. Phrased that way the gate would count every shape
        // drawn and call a correct answer wrong. "Count only the ..." says the same thing in
        // plainer English and leaves the item honestly unchecked, which is what that gate says
        // it wants for a subset.
        q.text = `Count only the ${plural}.`;
        q.printText = 'Count one kind. Write how many.';
        q.ans = answer;
        q.answerType = "number";
        q.options = [];
        q.selfAnswering = true;     // the answer square is the one slot (SL-7)
        q.hint = `Look only at the ${plural}. Touch each one as you count.`;
        // The sort's real errors: counting every object, or counting the kind next to it.
        const _ccOther = counts.find((c, i) => i !== askIdx && c !== answer);
        q.distractorTags = _ccOther !== undefined ? { [_ccOther]: 'counted a different kind' } : { [bag.length]: 'counted every object' };
        _kSetCell(q, 'counters', { kind: 'sort', bag, asked, ans: answer });
        q.skillLabel = 'Sort & Count';
        return;
    }

    // ========================================
    // NUMBER BONDS (Grade K) — "within 10", so the whole is 2-10 and the parts are whole numbers.
    // One cell shape: the bond (RP-60) — the whole box above, two part boxes below, joined by
    // hair lines. The unknown is the EMPTY box and it is the item's one answer slot, on paper
    // (the key writes the answer into it) and on screen (the input takes its place).
    //
    // P8 (critic, baseline 2026-09-24): the old cell only ever hid a part, drew 6 mm circles, and
    // dealt the answer 1 on six items of twenty (every whole of 2 answers 1, and a uniform part
    // below a small whole piles up on 1). Now a third of the items hide the WHOLE, and the answer
    // is dealt first, through a shuffled permutation, so a page spreads it across 1-9 (part) and
    // 2-10 (whole) instead of letting it fall where the whole happens to put it.
    // ========================================
    else if (mappedSkill === "number_bonds") {
        // The kit's `bond` cell (RP-60): the unknown is the EMPTY box, and it is the item's one
        // answer place on paper, in the key and on screen (the host input takes its place).
        // Answers are dealt first, through a shuffled permutation, so a page spreads them over
        // 1-9 (a part) and 3-10 (the whole); a third of the items hide the whole.
        // P11: "What is missing" and "Bonds to" (5 / 10 / 20; 10 is the default).
        const _nbU = { answer: 'whole', first: 'A', second: 'B' }[_kOpt('unknown')];
        const unknown = _nbU || ['A', 'B', 'whole'][_kDeal(3)];
        const _nbTop = Number(_kOpt('band')) || 10;
        let total, partA, partB, answer;
        if (unknown === 'whole') {
            total = 3 + _kDealShuffled(_nbTop - 2);       // 3..10: a whole of 2 is only 1 + 1
            partA = rng(1, total - 1);
            partB = total - partA;
            answer = total;
        } else {
            answer = 1 + _kDealShuffled(_nbTop - 1);      // 1..9, each once per nine items
            total = rng(answer + 1, _nbTop);
            const shown = total - answer;
            partA = unknown === 'A' ? answer : shown;
            partB = unknown === 'B' ? answer : shown;
        }
        // part + part = whole, the order ws-content-audit reads as an equation.
        q.text = unknown === 'whole' ? `${partA} + ${partB} = ?`
            : `${unknown === 'A' ? '?' : partA} + ${unknown === 'B' ? '?' : partB} = ${total}`;
        q.printText = 'Write the missing number.';
        q.selfAnswering = true;
        q.ans = answer;
        q.answerType = "number";
        q.options = [];
        q.hint = unknown === 'whole'
            ? `The two parts are ${partA} and ${partB}. Put them together to find the whole.`
            : `${total} splits into two parts. One part is ${total - answer}. `
                + `Count on from ${total - answer} to ${total} to find the other part.`;
        // The bond's real errors: a missing part answered by ADDING the two numbers shown, and a
        // missing whole answered by taking one part from the other.
        const known = unknown === 'whole' ? 0 : total - answer;
        const wrong = unknown === 'whole' ? (partA === partB ? total - 1 : Math.abs(partA - partB)) : total + known;
        q.distractorTags = { [wrong]: unknown === 'whole' ? 'took one part from the other' : 'added the two numbers it could see' };
        const _nbPayload = { whole: total, a: partA, b: partB, unknown };
        // O6 AP1: "How the bond is drawn" — whole above (the default, unchanged) or at the side.
        if (_kOpt('orientation') === 'horizontal') _nbPayload.orientation = 'horizontal';
        _kSetCell(q, 'bond', _nbPayload);
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
        // "Make" (option-panel round 3): 5 on a five frame, 10 on a ten frame (the default, and
        // exactly the draws it made before), 20 on two ten frames with the first one full.
        const target = [5, 20].includes(Number(_kOpt('band'))) ? Number(_kOpt('band')) : 10;
        const filled = target === 5 ? 1 + _kDeal(4)       // 1..4
            : target === 20 ? 11 + _kDeal(9)              // 11..19: the first frame full
            : 1 + _kDeal(9);                              // 1..9, every value on a page of six or more
        const answer = target - filled;

        q.text = `The frame shows ${filled}. How many more make ${target}?`;
        q.printText = `Write how many more make ${target}.`;
        q.ans = answer;
        q.answerType = "number";
        q.hint = `Count the empty boxes. ${filled} and ${answer} make ${target}.`;
        q.visual = _kCell(target === 5 ? _kTenFrame(filled, { rows: 1 }) : _kTenFrame(filled, { frames: target === 20 ? 2 : 1 }));
        // P11 Support level 0: the number sentence alone, no frame to count the empty boxes of.
        if (_kLevel(1) === 0) {
            q.text = `${filled} + ? = ${target}`;
            q.printText = 'Write the missing number.';
            q.visual = _kCell(`<div style="font-size:1.6rem;font-weight:700;white-space:nowrap;">${filled} + ${_kLine(2)} = ${target}</div>`, null, true);
            q.supportLevel = 0;
        }
        q.skillLabel = `Make ${target}`;
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
        // "Teen numbers to" 15 keeps the loose ones to one row of five (option-panel round 3).
        const ones = 1 + _kDeal(Number(_kOpt('band')) === 15 ? 5 : 9);   // 1..9 -> 11..19 (or 11..15)
        const teen = 10 + ones;
        const askTotal = _kDeal(2) === 1;

        // THE NUMBER SENTENCE IS PART OF THE CELL, not part of the instruction: "Write the missing
        // number." over a ten frame and five loose counters is unanswerable (5 and 15 both fit), so
        // the sentence with its one box sits under the picture it describes.
        //
        // O6 AP1 round 2: drawn by the kit's `counters` cell (kind 'teen'), so paper, key and
        // screen are one drawing and the sentence's box is the item's one answer slot (AK-4: the
        // old HTML line carried no slot, so the pupil page had none while the key had one). The
        // online worksheet used to redraw "10 + 1 = ___" as a bare vertical fact and drop the
        // picture; a kit cell keeps it.
        // The sentence is IN the cell, so q.text says it in words rather than repeating it above
        // the cell on screen (CL-1); TTS reads it, and the teen stays the largest number named.
        q.text = askTotal ? `What number is 10 and ${ones} more?` : `10 and what number make ${teen}?`;
        q.printText = 'Write the missing number.';
        q.ans = askTotal ? teen : ones;
        q.answerType = "number";
        q.options = [];
        q.selfAnswering = true;
        q.hint = askTotal
            ? `The full frame is 10. Count on from 10 for each loose counter.`
            : `The full frame is 10. Count the loose counters — that is how many more than 10.`;
        // The teen number's real errors: the loose ones written for the whole, or the whole
        // written for the ones.
        q.distractorTags = askTotal ? { [ones]: 'wrote only the loose ones' } : { [teen]: 'wrote the whole number, not the ones' };
        const _tcPayload = { kind: 'teen', ones, askTotal, ans: q.ans };
        // "Objects: A ten rod and unit cubes": the same ten and ones as base-10 blocks (RP-30).
        if (_kOpt('objects') === 'blocks') {
            _tcPayload.objects = 'blocks';
            q.hint = askTotal
                ? `The rod is 10. Count on from 10 for each loose cube.`
                : `The rod is 10. Count the loose cubes — that is how many more than 10.`;
        }
        _kSetCell(q, 'counters', _tcPayload);
        // P11 Support level 0: the number sentence alone (the kit's equation cell), no picture.
        if (_kLevel(1) === 0) {
            _kSetCell(q, 'equation', { a: 10, b: ones, op: '+', result: teen, unknown: askTotal ? 'result' : 'b', digits: 2 });
            q.supportLevel = 0;
        }
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
        const rods = 1 + _kDeal(Number(_kOpt('band')) === 50 ? 5 : 9);   // 1..9 (P11: or 1..5), dealt

        q.text = `How many tens?`;
        q.printText = 'Write how many tens.';
        q.ans = rods;
        q.answerType = "number";
        q.options = [];
        q.selfAnswering = true;     // `[ ] tens` is the one slot (SL-7)
        q.hint = `Each rod is one ten. Count the rods.`;
        // The real error: writing the value (50) for the number of tens (5).
        q.distractorTags = { [rods * 10]: 'wrote the value, not how many tens' };
        // O6 AP1 round 2: drawn by the kit's `counters` cell (kind 'tens'): the rule box, the rods
        // (gridded, RP-30) and `[ ] tens`, one drawing on paper, key and screen (the old print
        // handler drew its own grey rods from q.tensData). "Objects: Full ten frames" draws the
        // same number of tens as full ten frames, with the rule "One full frame is one ten."
        const _tfPayload = { kind: 'tens', n: rods, ans: rods };
        if (_kOpt('objects') === 'frame') {
            _tfPayload.objects = 'frame';
            q.hint = `Each full frame is one ten. Count the frames.`;
        }
        _kSetCell(q, 'counters', _tfPayload);
        q.skillLabel = "Count Tens";
        // printFormat keeps the card's size class; no q.tensData, so the legacy print path draws the
        // kit twin too (its own rod handler needs tensData) — one drawing everywhere.
        q.printFormat = "tens-foundation";
        return;
    }

    // ========================================
    // HUNDREDS CHART FILL (Grade 1) — one blank on a 1-100 chart, row-major, +1 across and
    // +10 down. Black and white: the blank is a dashed box (LS-8), not an orange one, and the
    // cell no longer carries a caption naming a colour that paper does not have.
    // ========================================
    else if (mappedSkill === "hundreds_chart_fill" || mappedSkill === "number_chart_fill") {
        // P10 (critic, regrade 2026-09-25): the kit's `chartwindow` cell. A 3 x 5 window cut from
        // ANYWHERE on the 1-100 chart (its first row and its last row included), with one to three
        // empty cells ANYWHERE in it — a corner, an edge or the middle — each one a whole chart
        // cell to write in (17 x 15 mm at L). The only rule: every gap has a printed number beside
        // it in its row or its column, so the pupil always has one to count on from (across: one
        // more; down: ten more). The window and the gaps are dealt, so a page is never six
        // centre cells read off their left neighbour.
        // P11: "Numbers to" 50 / 100 (the chart's rows) and "Empty boxes" 1 to 7 (default 1 to 3, dealt).
        //
        // Owner (2026-09-25): "Numbers to" 10, 20, 30, 40, 50 and 100, and a bigger chart as its own
        // skill (number_chart_fill: "Numbers in" 101-200 ... 5,001-10,000). The chart is always
        // rows of ten, row r holding r*10+1 .. r*10+10, so a window is a run of whole chart rows
        // and five of its columns (four on the big chart) — except the chart to 10, which is its one row, drawn whole
        // (1 x 10). A window of R rows and C columns holds at most R * min(ceil(C/2), C-2) gaps:
        // no two side by side in a row, at least two printed numbers left in every row. At 100
        // and 50 the draws are exactly the old ones.
        const big = mappedSkill === "number_chart_fill";
        const band = Number(_kOpt('band')) || (big ? 200 : 100);
        let rowLo, rowHi;                                  // the chart rows inside the band
        if (big) {
            const lo = { 200: 101, 500: 201, 1000: 501, 5000: 1001, 10000: 5001 }[band] || 101;
            rowLo = (lo - 1) / 10; rowHi = (lo === 101 ? 200 : band) / 10 - 1;   // an unknown band falls back to 101-200
        } else {
            rowLo = 0; rowHi = [10, 20, 30, 40, 50].includes(band) ? band / 10 - 1 : 9;
        }
        const R = Math.min(3, rowHi - rowLo + 1);
        // The big chart's numbers need wider boxes (three to five digits at the working size), so
        // its window is four columns wide: two windows still share a row at size L.
        const C = big ? 4 : band === 10 ? 10 : 5;
        const r0 = big ? rng(rowLo, rowHi - (R - 1)) : rng(0, rowHi - (R - 1));
        const c0 = C === 10 ? 0 : rng(0, 10 - C);
        const rows = Array.from({ length: R }, (_, k) => r0 + k);
        const cols = Array.from({ length: C }, (_, k) => c0 + k);
        const N = R * C;
        const _hcWant = Number(_kOpt('tiles'));
        const cap = R * Math.min(Math.ceil(C / 2), C - 2);
        const want = Math.min(cap, [1, 2, 3, 4, 5, 6, 7].includes(_hcWant) ? _hcWant : [1, 2, 2, 3][_kDeal(4)]);
        const at = (i) => rows[Math.floor(i / C)] * 10 + cols[i % C] + 1;
        const neighbours = (i) => {
            const r = Math.floor(i / C), c = i % C, out = [];
            if (c > 0) out.push(i - 1);
            if (c < C - 1) out.push(i + 1);
            if (r > 0) out.push(i - C);
            if (r < R - 1) out.push(i + C);
            return out;
        };
        let pickIdx = [];
        for (let t = 0; t < 400; t++) {
            const cand = shuffle(Array.from({ length: N }, (_, i) => i)).slice(0, want);
            const set = new Set(cand);
            // every gap keeps a printed neighbour, and no two gaps sit side by side in a row
            if (!cand.every(i => neighbours(i).some(j => !set.has(j)))) continue;
            if (cand.some(i => i % C < C - 1 && set.has(i + 1))) continue;
            pickIdx = cand;
            break;
        }
        // Fallback (never expected): a checkerboard of gaps honours both rules at any count to 7.
        if (!pickIdx.length) pickIdx = shuffle(R === 3 && C === 5 ? [0, 2, 4, 6, 8, 10, 12, 14] : Array.from({ length: N }, (_, i) => i).filter(i => (i % C) % 2 === 0)).slice(0, want);
        const blanks = pickIdx.sort((x, y) => x - y).map(at);
        const top = (rowHi + 1) * 10;
        q.chartWindow = { rows, cols };
        q.chartData = { target: blanks[0], targets: blanks.slice() };
        q.text = blanks.length === 1 ? 'What number goes in the empty box?' : 'Write the missing numbers in the empty boxes.';
        q.printText = 'Write the missing numbers.';
        q.keyParts = blanks.map(String);
        q.ans = blanks.length === 1 ? blanks[0] : blanks.join(', ');
        if (blanks.length > 1) q.acceptedAnswers = [blanks.join(','), blanks.join(', '), blanks.join(' ')];
        q.answerType = blanks.length === 1 ? "number" : "text";
        q.options = [];
        q.selfAnswering = true;
        q.hint = R > 1 ? `Across a row the number goes up by 1. Down a column it goes up by 10.`
            : `Along the row the number goes up by 1.`;
        // The chart's real error: moving ten (down a column) where the gap is one along the row.
        const wrongFirst = blanks[0] + 10 <= top ? blanks[0] + 10 : blanks[0] - 10;
        q.distractorTags = { [[wrongFirst, ...blanks.slice(1)].join(', ')]: 'moved ten instead of one along the row' };
        _kSetCell(q, 'chartwindow', { rows, cols, blanks });
        q.skillLabel = big ? "Number Chart Fill" : "100-Chart Fill";
        q.printFormat = "hundreds-chart-fill";
        return;
    }

    // ========================================
    // TEN-FRAME BUILD (Grade K) — drag counters into a 5x2 frame. The print handler draws the
    // empty frame and writes its own "Draw N dots" prompt, so the cell is honest on paper too.
    // ========================================
    else if (mappedSkill === "ten_frame_build") {
        // P10 (critic, regrade 2026-09-25): the kit's `tenframe` cell — the target printed big
        // beside a 55 x 22 mm frame of 11 mm cells (the RP-10 "pupil draws counters" size), and
        // the cell is sized to that frame, never a frame at the top of a half-empty cell.
        const target = 1 + _kDealShuffled(Number(_kOpt('band')) === 5 ? 5 : 10);  // 1..10 (P11: or 1..5), shuffled
        q.text = `Build ${target} on the ten frame.`;
        q.printText = `Draw counters to show the number.`;
        q.target = target;
        q.ans = target;
        q.maxDots = 10;
        q.answerType = "ten-frame-build";
        q.hint = `Put one counter in each box until you have ${target}.`;
        q.skillLabel = "Ten Frame Build";
        q.printFormat = "ten-frame-build";
        q.options = [];
        q.distractorTags = target === 10 ? { 9: 'stopped one counter short' } : { [target + 1]: 'drew one counter too many' };
        _kSetCell(q, 'tenframe', { target, frames: 1 });
        return;
    }

    // ========================================
    // TEN-FRAME BUILD TEEN (Grade K/1) — a TEEN number is 11 to 19. The old code dealt 11-20,
    // so "Build a Teen Number" printed 20, which is not one (owner: fix the content or fix the
    // name; the id and the label both say teen, so the content moves).
    // ========================================
    else if (mappedSkill === "ten_frame_build_teen") {
        // P12: `band` 15 keeps the target to 11-15 (one row of the second frame).
        const target = 11 + (Number(_kOpt('band')) === 15 ? _kDealShuffled(5) : _kDealShuffled(9));  // 11..19, shuffled
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
        // P10 (critic, regrade 2026-09-25): the kit's `base10` cell — the number, then a Tens |
        // Ones mat whose zones hold nine sticks and nine dots with room to spare (H12). The tens
        // digit (1-9) and the ones digit (0-9) are dealt through two shuffled permutations, so a
        // page spans the decades — teens, a zero in the ones (40), a nine in the ones (69) —
        // instead of clustering in one decade.
        // P11: "Numbers to" 20 / 50 / 99 (99 is the default: 11 to 99).
        const _bTop = Number(_kOpt('band')) || 99;
        const tens = 1 + _kDealShuffled(_bTop >= 99 ? 9 : Math.max(1, Math.floor(_bTop / 10) - 1));
        let ones = _kDealShuffled(10);
        if (tens === 1 && ones === 0) ones = rng(1, 9);   // 10 is not "11-99"
        const target = tens * 10 + ones;
        q.text = `Build ${target} with base-10 blocks.`;
        q.printText = `Draw the number with tens and ones.`;
        q.target = target;
        q.ans = target;
        q.maxPlace = 10;
        q.allowRegroup = false;
        q.places = [10, 1];
        q.answerType = "base10-build";
        q.hint = `${target} is ${tens} ten${tens === 1 ? '' : 's'} and ${ones} one${ones === 1 ? '' : 's'}.`;
        q.skillLabel = "Base-10 Build";
        q.printFormat = "base10-build";
        q.options = [];
        // The base-10 error: tens and ones swapped (57 drawn as 75); with a zero or a double digit
        // that cannot be seen, so the other real one: the wrong number of tens.
        const swapped = ones * 10 + tens;
        q.distractorTags = ones > 0 && ones !== tens && swapped >= 11
            ? { [swapped]: 'swapped the tens and the ones' }
            : { [target + (tens < 9 ? 10 : -10)]: 'drew the wrong number of tens' };
        _kSetCell(q, 'base10', { target, places: [10, 1], counts: { 10: tens, 1: ones } });
        return;
    }

    // ========================================
    // BASE-10 REGROUP (Grade 2) — build, then trade one ten for ten ones and check the total has
    // not moved. The instruction no longer names an on-screen button: paper has no button, and
    // twenty words is not a cell (BD-10). The button name stays in the hint, where it belongs.
    // ========================================
    else if (mappedSkill === "base10_regroup") {
        const target = rng(20, Number(_kOpt('band')) || 99);     // P11: "Numbers to" 50 / 99
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
        const target = rng(100, Number(_kOpt('band')) || 999);   // P11: "Numbers to" 500 / 999
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
    // ADD 5 PICTURES (Grade K) — sums to 5, drawn as two groups of objects.
    //
    // These two live in the addition / subtraction categories rather than in this family, but
    // they are generated here. No emoji (owner): they render in colour and vary by platform.
    //
    // O6 AP1 round 2: drawn by the kit's `counters` cell (kind 'join'), the twin of sub_5_pictures:
    // the two groups joined by +, and `n + m = [ ]` under them, the box the item's one answer place
    // on paper, in the key and on screen. The old cell printed font glyphs on a ruled line and
    // asked for the answer on screen as a choice of three buttons — a production item turned into
    // multiple choice on screen only (P-29); the pupil now writes the number everywhere.
    // "Objects": plain shapes (the default: the glyph the old cell dealt, as an outline shape),
    // pictures, a five frame (the first group solid, the second hollow), or two dice.
    // ========================================
    else if (mappedSkill === "add_5_pictures") {
        const counterSet = ["●", "■", "▲", "★", "◆"];
        const counter = pick(counterSet);
        let n, m;
        do { n = randInt(1, 3); m = randInt(1, 3); } while (n + m > 5);
        const total = n + m;
        // The old choice row's draws are still made (and dropped), so a page deals the same sums
        // in the same order as before the migration.
        const optsSet = new Set([total]);
        while (optsSet.size < 3) {
            const cand = total + (Math.random() < 0.5 ? -1 : 1) * randInt(1, 2);
            if (cand >= 0 && cand <= 5) optsSet.add(cand);
        }
        shuffle([...optsSet]);

        q.text = `How many in all? ${n} + ${m} = ?`;
        q.printText = 'Count them all. Write how many.';
        q.ans = total;
        q.answerType = "number";
        q.options = [];
        q.selfAnswering = true;     // the sentence's box is the one slot (SL-7)
        q.hint = `Count the first group, then keep counting into the second. ${n} + ${m} = ${total}.`;
        // The real joining errors: counting one group only, or counting one object twice.
        q.distractorTags = n !== m ? { [Math.max(n, m)]: 'counted only one group' } : { [total + 1]: 'counted one object twice' };
        const _a5Obj = _kOpt('objects');
        const _a5Idx = counterSet.indexOf(counter);
        const shape = _a5Obj === 'pictures' ? K2_PICTURE_KINDS[_a5Idx % K2_PICTURE_KINDS.length]
            : ['circle', 'square', 'triangle', 'star', 'diamond'][_a5Idx];
        const _a5Payload = { kind: 'join', n, m, shape, ans: total };
        if (_a5Obj === 'frame' || _a5Obj === 'dice') _a5Payload.objects = _a5Obj;
        _kSetCell(q, 'counters', _a5Payload);
        q.skillLabel = "Add ≤5 Pics";
        // The card's size class; no q.pictureData, so the legacy print path draws the kit twin too.
        q.printFormat = "add-5-pictures";
        // P11 Pictures off: the same sum as a number sentence (the kit's equation cell).
        if (_kOpt('pictures') === false) {
            q.picturesOff = true;
            q.printText = 'Write the answer.';
            _kSetCell(q, 'equation', { a: n, b: m, op: '+', result: total, unknown: 'result', digits: 1 });
            q.visual = '';
            q.printFormat = 'add-facts-horizontal';
        }
        return;
    }

    // ========================================
    // SUB 5 PICTURES (Grade K) — take away from a group of at most 5, the taken ones crossed out.
    // ========================================
    else if (mappedSkill === "sub_5_pictures") {
        // The kit's `counters` cell, take-away form: outline objects 10 mm across in one row, the
        // taken ones crossed out with a bold X, and `n − m = [ ]` under them (the box is the one
        // answer place). The answer 0-4 is dealt through a shuffled permutation, which also deals
        // the two edge facts a within-5 page otherwise never shows: take away none (m = 0) and
        // take away all (the answer 0).
        // O6 AP1 "Objects": plain shapes (the default), pictures, or counters in a five frame. The
        // pictures are dealt off the same four-way deal as the shapes, so the numbers that follow
        // are the same items whichever kind is drawn.
        const _sbObj = _kOpt('objects');
        const shape = (_sbObj === 'pictures' ? K2_PICTURE_KINDS : K2_COUNT_SHAPES)[_kDeal(K2_COUNT_SHAPES.length)];
        // R3 (critic round 3): "take away 0" came up on a fifth of the items (three of six on a
        // worksheet). Now each edge fact is ONE slot in ten - take away all (answer 0) and take
        // away none (m = 0) - and every other item takes at least one away and leaves 1 to 4.
        const _sv = _kDealShuffled(10);
        let remain, n;
        if (_sv === 0) { remain = 0; n = rng(2, 5); }
        else if (_sv === 1) { n = 5; remain = 5; }        // take none from 5: the one answer 5, so no answer tops 1 in 5
        else { remain = 1 + ((_sv - 2) % 4); n = rng(remain + 1, 5); }
        const m = n - remain;
        q.text = `Start with ${n}, take away ${m}. How many are left?`;
        q.printText = 'Write how many are left.';
        q.ans = remain;
        q.a = n; q.b = m; q.op = '−';
        q.answerType = "number";
        q.options = [];
        q.selfAnswering = true;     // the equation's box is the one slot (SL-7)
        q.hint = `Count only the ones that are NOT crossed out. ${n} − ${m} = ${remain}.`;
        q.distractorTags = m > 0 && m !== remain ? { [m]: 'counted the ones crossed out' }
            : m === 0 ? { [n - 1]: 'took one away when none were taken' } : { [n]: 'did not take any away' };
        const _sbPayload = { kind: 'takeaway', n, m, shape, ans: remain };
        if (_sbObj === 'frame') _sbPayload.objects = 'frame';
        _kSetCell(q, 'counters', _sbPayload);
        q.skillLabel = "Sub ≤5 Pics";
        q.printFormat = "sub-5-pictures";
        q.pictureData = { shape, n, m, remain };
        // P11 Pictures off: the same take-away as a number sentence (the kit's equation cell).
        if (_kOpt('pictures') === false) {
            q.picturesOff = true;
            q.printText = 'Write the answer.';
            _kSetCell(q, 'equation', { a: n, b: m, op: '-', result: remain, unknown: 'result', digits: 1 });
            q.visual = '';
            q.printFormat = 'sub-facts-horizontal';
        }
        return;
    }

    // ========================================
    // NUMBER SEQUENCE FILL (counting, K-2) — a five-tile number track with missing numbers.
    //
    // P10 (critic, regrade 2026-09-25): generated here now (it was a 'patterns' override into
    // gen-algebraic.js) and drawn by the kit's `seqstrip` cell. What changed:
    //   * the STEP and the START vary item by item — count by 1, 2, 5 and 10 (and 100 above Max
    //     Number 100), from on and off the decade, one track in four counting BACK — instead of a
    //     page of count-by-10 strips from the same start;
    //   * no caption: "10s: 3-93" and "Numbers 71-80" named the ends of the strip, which gave the
    //     first and last blanks away. The step is read off two printed neighbours, which every
    //     track keeps;
    //   * the missing numbers are boxes IN the track (14 x 15 mm at L, RUBRIC H9), and each is
    //     one screen input (data-mq-cell) — so the quiz, which drew no strip at all, draws it.
    // ========================================
    else if (mappedSkill === "number_seq_fill") {
        const range = Number(state.range) || 100;
        const cap = Math.max(10, Math.min(range, 999));
        const steps = cap < 20 ? [1] : cap <= 20 ? [1, 2] : cap <= 100 ? [1, 2, 5, 10] : [2, 5, 10, 100];
        const LEN = 5;
        // P11: "Count by" fixes the step and "Direction" the way the track runs; the defaults deal both.
        const _sfStep = Number(_kOpt('step'));
        const step = [1, 2, 5, 10].includes(_sfStep) ? _sfStep : steps[_kDeal(steps.length)];
        const _sfDir = _kOpt('dir');
        const down = _sfDir === 'forward' ? false : _sfDir === 'back' ? true : _kDeal(4) === 3;
        const span = step * (LEN - 1);
        const lo = step >= 10 ? 1 : (step === 1 ? 0 : 1);
        let start;
        if (step >= 5 && _kDeal(2) === 0) {
            // on the decade / on the step (5, 10, 15 ... or 20, 30, 40 ...)
            start = step * rng(1, Math.max(1, Math.floor((cap - span) / step)));
        } else {
            start = rng(lo, Math.max(lo, cap - span));
        }
        if (start + span > cap) start = Math.max(lo, cap - span);
        let values = Array.from({ length: LEN }, (_, i) => start + i * step);
        if (down) values = values.reverse();

        // Blanks: one or two; never both ends, never three in a row, and always two printed
        // neighbours side by side somewhere, so the step can be read.
        const want = [1, 2, 2, 1, 2][_kDeal(5)];
        let blanks = [];
        for (let t = 0; t < 80; t++) {
            const cand = shuffle(Array.from({ length: LEN }, (_, i) => i)).slice(0, want).sort((x, y) => x - y);
            const set = new Set(cand);
            if (set.has(0) && set.has(LEN - 1)) continue;
            let run = 0, bad = false;
            for (let i = 0; i < LEN; i++) { run = set.has(i) ? run + 1 : 0; if (run >= 3) bad = true; }
            if (bad) continue;
            let pair = false;
            for (let i = 0; i < LEN - 1; i++) if (!set.has(i) && !set.has(i + 1)) pair = true;
            if (!pair) continue;
            blanks = cand;
            break;
        }
        if (!blanks.length) blanks = [rng(2, LEN - 2)];
        const parts = blanks.map(i => values[i]);

        // P11 (critic round 2): the instruction follows the blank count (one number / numbers), and the
        // track is handed to the sheet provider as `gridFill` so its skip-count line can name the step.
        const _one = parts.length === 1;
        q.text = _one ? 'Write the missing number in the number track.' : 'Write the missing numbers in the number track.';
        q.printText = _one ? 'Write the missing number.' : 'Write the missing numbers.';
        q.blankCount = parts.length;
        q.gridFill = { cells: values.map((v, i) => ({ row: 0, col: i, value: v, blank: blanks.includes(i) })) };
        q.hint = `Look at two numbers side by side. Each number is ${step} ${down ? 'less' : 'more'} than the one before it.`;
        q.skillLabel = 'Number Sequence';
        q.keyParts = parts.map(String);
        q.ans = parts.length === 1 ? parts[0] : parts.join(', ');
        if (parts.length > 1) q.acceptedAnswers = [parts.join(','), parts.join(', '), parts.join(' ')];
        q.answerType = parts.length === 1 ? 'number' : 'text';
        q.options = [];
        q.selfAnswering = true;
        q.seqData = { step, down, values: values.slice(), blanks: blanks.slice() };
        // The track's real error: counting on by ONE where the step is bigger (or by two by ones).
        const prev = (i) => (i > 0 ? values[i - 1] : values[i + 1]);
        const wrongFirst = step === 1 ? prev(blanks[0]) + (down ? -2 : 2) : prev(blanks[0]) + (down ? -1 : 1);
        q.distractorTags = { [[wrongFirst, ...parts.slice(1)].join(', ')]: 'counted on by one, not by the step' };
        // The tile shape (owner, 2026-09-25): circles and hexagons for the younger years by default.
        const _sfShape = _kOpt('shape');
        _kSetCell(q, 'seqstrip', { values, blanks, ...(_sfShape && _sfShape !== 'box' ? { shape: _sfShape } : {}) });
        q.printFormat = 'seq-strip';
        return;
    }

    // ========================================
    // SHARE INTO GROUPS (division family, a picture skill) — ring groups of d, count the groups.
    //
    // P10 (critic, regrade 2026-09-25): generated here now (the dispatcher routes it) and drawn by
    // the kit's `counters` cell. The counters were 5 mm dots packed in 5 + 5 rows with 2 mm gaps,
    // so a ring of 6 or 4 across the frame split could not be drawn (H12). Now: solid 5 mm
    // counters in a LOOSE array, 6 mm apart, in rows that are NOT a group long (so the pupil
    // rings, not reads rows), and `[ ] groups of d` under them — the one answer place. The group
    // size is 3 to 8 and the number of groups is dealt over 2-8.
    // ========================================
    else if (mappedSkill === "share_into_groups") {
        // P12: `band` "Counters to" 12 keeps the picture to 12 counters and 2-4 groups; the
        // default, 24, is the old draw.
        const _sgCap = Number(_kOpt('band')) === 12 ? 12 : 24;
        const groups = _sgCap === 12 ? 2 + _kDealShuffled(3) : 2 + _kDealShuffled(7);   // 2..4 | 2..8
        // At most 24 counters: four rows of a 6- or 7-wide array, so six cells fit a page.
        const sizes = [3, 4, 5, 6, 7, 8].filter(s => s * groups >= 8 && s * groups <= _sgCap);
        const size = sizes.length ? sizes[rng(0, sizes.length - 1)] : 3;
        const total = size * groups;
        q.text = `There are ${total} counters. Make groups of ${size}. How many groups are there?`;
        // "Ring" is not a library verb: paper circles.
        q.printText = 'Circle the groups. Write how many groups.';
        q.ans = groups;
        q.a = total; q.b = size; q.op = '÷';
        q.answerType = 'number';
        q.options = [];
        q.selfAnswering = true;
        q.skillLabel = 'Make Equal Groups to Divide';
        q.hint = `Circle ${size} counters, then ${size} more, until they are all used. Count the circles.`;
        q.distractorTags = size !== groups ? { [size]: 'wrote the size of a group, not how many groups' } : { [groups + 1]: 'counted one group twice' };
        _kSetCell(q, 'counters', { kind: 'share', n: total, size, ans: groups });
        q.printFormat = 'share-into-groups';
        return;
    }

    // ========================================
    // ADD WORD PROBLEMS WITHIN 10 (Grade K) — the K picture word problem (SF-52).
    //
    // P10 (critic, regrade 2026-09-25): generated here now (the dispatcher routes it) and drawn by
    // the kit's `wordpic` cell: a short story, the two groups it names as 10 mm line-art objects
    // (no rounded pills, no count caption), an empty work box, and ONE number box with the label
    // word after it. The dealing no longer leans on 1 + 1 / 2 + 1: the total is dealt over 4-10
    // through a shuffled permutation and both parts are at least 2; the stories are three
    // frames (add to, put together, "I have") dealt round-robin, and every count is at least 2, so
    // no story can print "There are 1 ball".
    // ========================================
    else if (mappedSkill === "add_wp_10") {
        const SCENES = [
            { shape: 'ball', many: 'balls', place: 'in a box', place2: 'on the grass', arrive: 'roll in' },
            { shape: 'apple', many: 'apples', place: 'in a bag', place2: 'on a plate', arrive: 'are put in' },
            { shape: 'fish', many: 'fish', place: 'in a pond', place2: 'in a tank', arrive: 'swim in' },
            { shape: 'star', many: 'stars', place: 'on a card', place2: 'on a page', arrive: 'are added' },
        ];
        const scene = SCENES[_kDeal(SCENES.length)];
        // P12: `band` "Total to" 5 or 7 (read off the raw options: the plain twin is generated here
        // under the base id, whose own panel does not declare it). The default, 10, is the old deal.
        const _wpBand = state.skillOptions && typeof state.skillOptions === 'object' ? Number(state.skillOptions.band) : NaN;
        const sum = 4 + (_wpBand === 5 ? _kDealShuffled(2) : _wpBand === 7 ? _kDealShuffled(4) : _kDealShuffled(7));   // 4..10
        const a = rng(2, sum - 2);
        const b = sum - a;
        const N = scene.many;
        const FRAMES = [
            [`There are ${a} ${N} ${scene.place}.`, `${b} more ${N} ${scene.arrive}.`, `How many ${N} are there now?`],
            [`${a} ${N} are ${scene.place}.`, `${b} ${N} are ${scene.place2}.`, `How many ${N} are there in all?`],
            [`I have ${a} ${N}.`, `I get ${b} more ${N}.`, `How many ${N} do I have now?`],
        ];
        const lines = FRAMES[_kDeal(FRAMES.length)];
        q.text = lines.join(' ');
        q.printText = 'Write the total in the box.';
        q.ans = sum;
        q.a = a; q.b = b; q.op = '+';
        q.answerType = 'number';
        q.options = [];
        q.selfAnswering = true;
        q.skillLabel = 'Add Word ≤10';
        q.hint = `Count the first group: ${a}. Keep counting the next group: ${b} more. How many in all?`;
        q.distractorTags = { [a]: 'counted only the first group' };
        // P11 Pictures off: the same story with no picture row (the wordpic cell's plain variant).
        const _wpPics = _kOpt('pictures') !== false;
        if (!_wpPics) q.picturesOff = true;
        _kSetCell(q, 'wordpic', { lines, a, b, shape: scene.shape, unit: N, ans: sum, pictures: _wpPics });
        q.printFormat = 'word-add';
        return;
    }

    // ================================================================================
    // BUILD LANE k2 (2026-09-25, design/BUILD_LIST.md lane k2). Each new skill hands its item to
    // a sheet-kit template (q.cell) and its screen twin (q.visual), one drawing on paper, key and
    // the three screen hosts. Every teacher choice is an option (skill-options.js K2_LANE_OPTIONS).
    // ================================================================================
    else if (_k2LaneSkill(q, mappedSkill, rng)) {
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

/* ================================================================================================
 * BUILD LANE k2 (2026-09-25): the new K-1 skills of design/BUILD_LIST.md, lane k2.
 *
 * Each one is ONE cell shape per page (P-28): the task, the picture kind and the number range are
 * the teacher's options (K2_LANE_OPTIONS in skill-options.js), each defaulting to the stand-alone
 * value (R2). What a teacher does not choose is DEALT (round-robin off the page index, through a
 * shuffled permutation where counting order would let a pupil copy a pattern), never rolled six
 * times. The response is a number in a box, a check box under a picture or a word, or a row of
 * number boxes - never a screen-only multiple choice (P-29, SP-3).
 * ================================================================================================ */

/** The holders "zero means none" draws its objects in: the noun the question uses. */
const K2_HOLDER_WORD = { plates: 'plate', boxes: 'box', frame: 'ten frame' };
const K2_HOLDER_PREP = { plates: 'on the', boxes: 'in the', frame: 'in the' };

function _k2LaneSkill(q, id, rng) {
    switch (id) {
        case 'zero_none': return _k2Zero(q, rng);
        default: return false;
    }
}

/**
 * ZERO MEANS NONE (R.B7.S1; K.CC.A.3 "represent a count of no objects with 0"). A plate, a box or
 * a ten frame holding 0 to `Count to` objects; a third of a page's items are EMPTY, dealt through a
 * shuffled permutation so the empty ones are not every third cell.
 *   count     How many are on the plate? The K answer square; 0 is written for none.
 *   find      Three holders A, B, C, one empty: check the one with none.
 *   compute   Every object crossed out: n − n = [ ]. Take them all away: none are left.
 * Support level 2 prints a number track 0 to `Count to` under the picture (0 is on it, first).
 */
function _k2Zero(q, rng) {
    const band = Number(_kOpt('band')) || 5;
    const holder = ['plates', 'boxes', 'frame'].includes(_kOpt('objects')) ? _kOpt('objects') : 'plates';
    const task = ['count', 'find', 'compute'].includes(_kOpt('task')) ? _kOpt('task') : 'count';
    const shape = holder === 'frame' ? 'circle' : K2_PICTURE_KINDS[_kPageDeal('zero-shape', K2_PICTURE_KINDS.length)];
    const word = K2_HOLDER_WORD[holder], prep = K2_HOLDER_PREP[holder];
    const nonzero = () => 1 + _kDealShuffled(band);
    q.options = [];
    q.selfAnswering = true;
    q.skillLabel = 'Zero Means None';
    if (task === 'find') {
        // one empty holder among three, at a dealt place; the other two hold different counts
        const at = _kDealShuffled(3);
        const a = rng(1, band);
        let b = rng(1, Math.max(1, band - 1));
        if (b >= a) b = Math.min(band, b + 1);
        const counts = [0, 0, 0];
        let k = 0;
        for (let i = 0; i < 3; i++) if (i !== at) counts[i] = [a, b][k++];
        const letter = ['A', 'B', 'C'][at];
        const fewest = counts.indexOf(Math.min(...counts.filter((c) => c > 0)));
        q.text = `Which ${word} has none?`;
        q.printText = `Check the ${word} with none.`;
        q.ans = letter;
        q.printAnswer = letter;
        q.acceptedAnswers = [letter, letter.toLowerCase()];
        q.answerType = 'text';
        q.hint = `Look for the ${word} with nothing ${prep.split(' ')[0]} it. None is zero.`;
        q.distractorTags = { [['A', 'B', 'C'][fewest]]: 'chose the one with the fewest, not none' };
        q._variant = 'find';
        _kSetCell(q, 'counters', { kind: 'zero', task: 'find', objects: holder, shape, counts, correct: at, ans: letter });
        return true;
    }
    if (task === 'compute') {
        const n = nonzero();
        q.text = `Take them all away. ${n} − ${n} = ?`;
        q.printText = 'Write how many are left.';
        q.ans = 0;
        q.a = n; q.b = n;
        q.answerType = 'number';
        q.hint = 'Every one is crossed out. None are left. None is zero.';
        q.distractorTags = { [n]: 'wrote how many there were, not how many are left' };
        q._variant = 'compute';
        _kSetCell(q, 'counters', { kind: 'zero', task: 'compute', objects: holder, shape, n, ans: 0 });
        return true;
    }
    // count: a third of the page is empty (R.B7.S1: zero is a count like any other)
    const empty = _kDealShuffled(3) === 0;
    const n = empty ? 0 : nonzero();
    q.text = `How many are ${prep} ${word}?`;
    q.printText = 'Count. Write how many. None is 0.';
    q.ans = n;
    q.answerType = 'number';
    q.hint = n === 0 ? `There is nothing ${prep} ${word}. None is zero. Write 0.` : 'Touch each one as you count. The last number you say is how many.';
    q.distractorTags = n === 0 ? { 1: 'wrote 1 for an empty set' } : { [n + 1]: 'counted one object twice' };
    q._variant = 'count';
    const payload = { kind: 'zero', task: 'count', objects: holder, shape, n, ans: n };
    const lvl = _kLevel(1);
    if (lvl >= 2) payload.track = band;
    q.supportLevel = lvl;
    _kSetCell(q, 'counters', payload);
    return true;
}
