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
import { coinSVG } from '../cells/tmkit.js';
import { gridSlots } from '../cells/mult-grid.js';
import { getProvider, resolveCtx, getCell, hasCell } from '../index.js';

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
/** Templates that draw one fix box beside each line of the work (a fact family's four facts;
 *  a function table's rows, its rule and its Check row). */
const LINED = new Set(['fact-family', 'function-table']);

export const sources = (skills) => [{ id: 'main', skills }];
// Size S is the size that holds MORE (L1): its one-line items and small figures also get three
// columns, so an S page reaches its ceiling of 6 where L holds 4 (critic EA r5, A).
export const measureCols = (ctx) => (ctx && ctx.size === 'S' ? [1, 2, 3] : [1, 2]);
const colsFor = (size) => (size === 'S' ? [1, 2, 3] : [1, 2]);

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
    // The pupil's own dot on a number line (the `mark` slot) is the pupil's pencil too (critic
    // round 4: drawn solid black like a printed point).
    if (/data-ws-slot="mark"/.test(html)) html = String(html).replace(/<circle data-pv-dot="([^"]*)"([^>]*?) fill="#000"/g, '<circle data-pv-dot="$1"$2 fill="#949494" class="mq-pupil"');
    const mark =(tag, attrs) => (/\sclass="/.test(attrs)
        ? `<${tag}${attrs.replace(/\sclass="([^"]*)"/, ' class="$1 mq-pupil"')}>`
        : `<${tag} class="mq-pupil"${attrs}>`);
    return String(html).replace(/<([a-z][a-z0-9]*)\b([^>]*?)\sdata-ws-ink="solid"([^>]*)>/gi, (m, tag, pre, post) => {
        const attrs = `${pre} data-ws-ink="solid"${post}`;
        // A template's own fix place (a fix box per fact, the redraw zone) is the KEY's ink.
        if (/data-ws-slot="(?:x\d+|fix)/.test(attrs) || /\bmq-pupil\b/.test(attrs)) return m;
        // A choice slot WRAPS the printed choices (a pick task's fraction and its models): only
        // the ring the pupil drew is pupil ink, never the printed prompt inside (critic EA r5).
        if (/data-ws-shape="choice"/.test(attrs)) return m;
        return mark(tag, attrs);
    }).replace(/<([a-z][a-z0-9]*)\b([^>]*\sdata-ws-slot="(?!x\d|fix|ea-)[^"]*"[^>]*)>/gi, (m, tag, attrs) => {
        // A slot the template fills without an ink mark (the rounding table's cells): what is
        // written in the pupil's own slot is still the pupil's writing (critic round 3, INK).
        // Only a WRITING place: a box, a line, a table cell, a sign circle - never a wrapper
        // round a picture (a clock ring, a row of coins) or a drawing zone.
        if (/\bmq-pupil\b/.test(attrs) || !/data-ws-shape="(?:box|box-unknown|cell|circle|line|time|unit|check)"/.test(attrs)) return m;
        return mark(tag, ` ${attrs.trim()}`);
    });
}

/** The parts of a several-value list ("30, 35, 42" -> three), or null for one value. */
const partsOfList = (v) => (/,\s/.test(String(v)) ? String(v).split(/,\s*/) : null);

/* ------------------------------------------------------------------ the answer's own slots */

/** "9000" -> "9,000": a plain whole number of 4+ digits written the way the kit writes numbers. */
const commas = (v) => (/^\d{4,}$/.test(String(v)) ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : String(v));
/** Written the same way as the right answer: a wrong "9000" beside a right "6,000" becomes "9,000". */
const likeCorrect = (v, correct) => likeAnswer(v, correct);

/**
 * A shown value written EXACTLY the way the right answer is (L3, critic pv-r1 / EA r5): its
 * thousands commas (or none), its decimal places and its unit. A wrong "40000" beside a right
 * "60,000" - or "3.5" beside "2.75", "5" beside "7 cm" - lets the pupil read the verdict from the
 * typography. Anything that is not a number is left as it is.
 */
export function likeAnswer(v, correct) {
    const s = String(v === undefined || v === null ? '' : v).trim();
    const c = String(correct === undefined || correct === null ? '' : correct).trim();
    const num = /^(-?)([\d,]*\d)(?:\.(\d+))?\s*(.*)$/;
    const mv = num.exec(s), mc = num.exec(c);
    if (!mv || !mc || !/^[\d,]+$/.test(mv[2]) || !/^[\d,]+$/.test(mc[2])) return s;
    if (mv[4] && mc[4] && mv[4] !== mc[4]) return s;          // a different unit is the pupil's own
    let whole = mv[2].replace(/,/g, '');
    // commas exactly when the right answer has them; a short right answer says nothing
    const cWhole = mc[2];
    if (cWhole.includes(',')) whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    else if (cWhole.length < 4) whole = mv[2];                 // no telling: as the pupil wrote it
    const dp = mc[3] ? mc[3].length : 0;
    let frac = mv[3] || '';
    if (dp > frac.length) frac = frac.padEnd(dp, '0');
    const unit = mv[4] || mc[4];
    return `${mv[1]}${whole}${frac ? `.${frac}` : ''}${unit ? `${/^[%°]/.test(unit) ? '' : ' '}${unit}` : ''}`;
}

/**
 * The item's OWN answer slots, in order: [{id, value}] from the cell's key (a clock's hour and
 * minutes, an expanded form's three parts, a table's cells), or null for a one-value answer.
 * The key's whole-answer `answer` entry is dropped when the parts are listed beside it. A table
 * answer "a; b; c" (the rounding table) is split into its cells `t0..`, a list "a, b" into `p0..`.
 * `display` is the whole answer as the cell writes it ("80 + 80 = 160", "1 h 15 min").
 */
export function answerParts(it, correct) {
    const slots = (it.key && it.key.slots) || {};
    // A slot the answer leaves empty (the tens box of a one-digit difference) is not a part.
    let ids = Object.keys(slots).filter((id) => slots[id] && slots[id].graded !== false && !/^(x\d+|fix|ea-)/.test(id)
        && String(slots[id].value === undefined || slots[id].value === null ? '' : slots[id].value) !== '');
    if (ids.length > 1) ids = ids.filter((id) => id !== 'answer');
    const display = String((it.key && it.key.display) || correct);
    // A mixed-number place ("[w] [n]/[d]") is ONE shape, whole-number answers included: its fix is
    // the same three places, the fraction left empty (critic EA r5: a box on one ruler item, a
    // slashed three-box slot on the next).
    if (['w', 'n', 'd'].every((id) => id in slots) && ids.length >= 1 && ids.every((id) => ['w', 'n', 'd'].includes(id))) {
        const v = (id) => String(slots[id].value === undefined || slots[id].value === null ? '' : slots[id].value);
        return { parts: ['w', 'n', 'd'].map((id) => ({ id, value: v(id) })), display, glue: ['', ' ', '/', ''] };
    }
    if (ids.length > 1) return { parts: ids.map((id) => ({ id, value: String(slots[id].value) })), display };
    if (/;\s/.test(correct) && correct.split(/;\s*/).every((v) => /\d/.test(v))) return { parts: correct.split(/;\s*/).map((v, i) => ({ id: `t${i}`, value: v })), display: correct };
    if (/,\s/.test(correct) && correct.split(/,\s*/).every((v) => /\d/.test(v))) return { parts: correct.split(/,\s*/).map((v, i) => ({ id: `p${i}`, value: v })), display: correct };
    return null;
}

/**
 * The text around the parts in the whole answer: "80 + 80 = 160" with parts 80, 80, 160 gives
 * ['', ' + ', ' = ', '']. null when a part cannot be found in order.
 */
export function glueOf(display, parts) {
    const s = String(display);
    const glue = [];
    let pos = 0;
    for (const p of parts) {
        if (p.value === '') return null;
        const i = s.indexOf(p.value, pos);
        if (i < 0) return null;
        glue.push(s.slice(pos, i));
        pos = i + p.value.length;
    }
    glue.push(s.slice(pos));
    return glue;
}

/** A plain list: nothing before or after, and only commas / semicolons between the parts. */
const isList = (glue) => !!glue && !glue[0].trim() && !glue[glue.length - 1].trim() && glue.slice(1, -1).every((g) => /^\s*[,;]\s*$/.test(g));

/**
 * A wrong answer split into the same parts ("8,000 + 800 + 70" by ['', ' + ', ' + ', '']);
 * digit columns (no text between the parts) take one character each. null when it does not fit.
 */
export function splitLike(value, glue, n) {
    const v = String(value).trim();
    if (!glue || glue.length !== n + 1) return null;
    const inner = glue.slice(1, -1);
    if (inner.every((g) => !g.trim() || g.trim() === ',') && inner.some((g) => !g.trim())) {
        const ch = v.replace(/[^0-9A-Za-z]/g, '');
        return ch.length === n ? ch.split('') : null;
    }
    if (inner.some((g) => !g.trim())) return null;
    const re = (t) => t.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
    let src = `^\\s*${re(glue[0])}\\s*`;
    for (let i = 0; i < n; i++) src += `(.+?)\\s*${re(glue[i + 1])}\\s*`;
    const m = new RegExp(`${src}$`).exec(v);
    return m ? m.slice(1, n + 1).map((x) => x.trim()) : null;
}

/**
 * What `b` adds to `a` when it is `a` with one piece of markup inserted ("the work" and "the work
 * with its Fix-it mat"), cut on tag boundaries; null when the two differ in any other way.
 */
export function insertOf(a, b) {
    const A = String(a), B = String(b);
    const n = Math.min(A.length, B.length);
    let p = 0;
    while (p < n && A[p] === B[p]) p++;
    while (p > 0 && B[p - 1] !== '>') p--;
    let s = 0;
    while (s < n - p && A[A.length - 1 - s] === B[B.length - 1 - s]) s++;
    while (s > 0 && B[B.length - s] !== '<') s--;
    if (A.length - s !== p || B.length - s <= p) return null;
    return B.slice(p, B.length - s);
}

/**
 * `html` with `extra` appended inside the item's own ANSWER COLUMN - the block beside a picture
 * that holds the question and its answer place (`fg-ask` on the data cells, or any element a
 * template marks `data-ws-anscol`). null when the item has none. The Correct / Fix-it block then
 * sits under the pupil's answer in every cell, whatever the width of the picture (AX-4, critic
 * regrade 5: "a places the check block under the chart, b to its right").
 */
export function intoAnswerColumn(html, extra) {
    const H = String(html);
    const m = /<div\b[^>]*(?:class="[^"]*\bfg-ask\b[^"]*"|data-ws-anscol)[^>]*>/.exec(H);
    if (!m) return null;
    const tag = /<(\/?)div\b[^>]*>/g;
    tag.lastIndex = m.index + m[0].length;
    let depth = 1;
    for (let t = tag.exec(H); t; t = tag.exec(H)) {
        depth += t[1] ? -1 : 1;
        if (!depth) return H.slice(0, t.index) + extra + H.slice(t.index);
    }
    return null;
}

/** Templates whose several answers sit in a strip or chart: the fix is the strip again, clean. */
const REDO = new Set(['seqstrip', 'count-row', 'cloze-bank']);

/**
 * What names each part when the parts are a plain list inside a picture (critic round 3: "1st
 * 2nd 3rd" collided with the ranks a pupil writes under clocks). By identity, never by rank:
 * the coin, the clock's place in the row, the table row, the chart's row x column, the minute
 * ring's numeral. null when there is no such name (the picture is redrawn instead, or the list
 * is written with its commas).
 */
function partLabels(it, parts, c) {
    const q = it.q || {};
    const p = (q.cell && q.cell.payload) || {};
    const n = parts.length;
    const ids = parts.map((x) => x.id);
    const every = (re) => ids.every((id) => re.test(id));
    const place = (i) => (n === 2 ? ['left', 'right'][i] : n === 3 ? ['left', 'middle', 'right'][i] : `${['1st', '2nd', '3rd', '4th', '5th', '6th'][i] || i + 1} from left`);
    if (it.template === 'coins' && every(/^n\d+$/) && Array.isArray(p.values) && p.values.length === n) {
        return p.values.map((v) => { try { return c ? { html: coinSVG(c, v, { compact: true }) } : { text: String(v) }; } catch (e) { return { text: String(v) }; } });
    }
    if ((it.template === 'clock' || it.template === 'coins') && every(/^o\d+$/)) return parts.map((_, i) => ({ text: place(i) }));
    if (it.template === 'clock' && every(/^r\d+$/) && Array.isArray(p.given)) {
        const given = new Set(p.given.map(Number));
        const pos = [];
        for (let i = 1; i <= 12; i++) if (!given.has(i)) pos.push(i);
        return pos.length === n ? pos.map((k) => ({ text: `at ${k}` })) : null;
    }
    if (it.template === 'mult-grid' && every(/^mc\d+$/)) {
        try {
            const g = gridSlots(p);
            const lab = ids.map((id) => g.find((s) => s.id === id)).map((s) => (s && s.kind === 'cell' ? { text: `${p.rows[s.i]} × ${p.cols[s.j]}` } : null));
            return lab.every(Boolean) ? lab : null;
        } catch (e) { return null; }
    }
    if (it.template === 'pv' && every(/^t\d+$/) && Array.isArray(p.rows) && Array.isArray(p.places)) {
        // The rounding table's blank cells, in reading order: "171 to 100".
        const lab = [];
        p.rows.forEach((row, r) => p.places.forEach((pl, col) => {
            const v = p.view && p.view[r] ? p.view[r][col] : null;
            if (v === null || v === undefined) lab.push({ text: `${commas(row)} to ${commas(pl)}` });
        }));
        return lab.length === n ? lab : null;
    }
    return null;
}

/** The number sentence of a story item, as the pupil would have written it. */
function storyWork(it, shown, wrong, isWrong) {
    if (isWrong && wrong && wrong.work) return wrong.work;
    const q = it.q || {};
    const o = operandsOf(q);
    const g = opGlyphOf(opOf(q));
    return o.length >= 2 && g ? `${o[0]} ${g} ${o[1]} = ${shown}` : '';
}

/**
 * How many characters a fix place needs: the longest number the QUESTION prints (its text, the
 * numbers its picture draws) - never the right answer, and never the pupil's shown one, so a box
 * is as wide for "10,000" as for "9,000" (L3, critic EA r5: round_nl 55 vs 47 mm). The caller
 * adds its own headroom (a sum or a rounding can be a digit longer).
 */
export function roomOf(it) {
    const q = it.q || {};
    const p = (q.cell && q.cell.payload) || {};
    const printed = [q.text, q.printText];
    // the numbers a payload DRAWS (a chart's cells, a rounding target), never its answer fields
    const skip = /ans|answer|correct|result|solution|key|missing|blank|gap|hide|total|sum|product|quotient|diff|round|shown|wrong/i;
    const add = (v) => { if (typeof v === 'number' || (typeof v === 'string' && /^\d[\d,]*(?:\.\d+)?$/.test(v))) printed.push(String(v)); };
    for (const [k, v] of Object.entries(p)) {
        if (skip.test(k)) continue;
        if (Array.isArray(v)) v.slice(0, 200).forEach(add); else add(v);
    }
    const nums = printed.join(' ').match(/\d[\d,]*(?:\.\d+)?/g) || [];
    const commas = nums.some((t) => t.includes(','));
    // in DIGIT widths: a comma or a point is under half a digit wide
    const units = (t) => {
        const w = commas && /^\d{4,}$/.test(t) ? Number(t).toLocaleString('en-US') : t;
        return w.replace(/[,.]/g, '').length + 0.4 * (w.match(/[,.]/g) || []).length;
    };
    return Math.max(1, ...nums.map(units));
}

/** The shape of the item's own answer place ('box', 'line', 'circle' ...), or '' when unknown. */
function ownShapeOf(it) {
    const payload = (it.q && it.q.cell && it.q.cell.payload) || {};
    try {
        const ins = hasCell(it.template) ? (getCell(it.template).inputs(payload) || []) : [];
        const g = ins.find((x) => x && x.graded !== false) || ins[0];
        return g && g.shape ? String(g.shape) : '';
    } catch (e) { return ''; }
}

/** Is the item's own answer a check box (the pupil CHOSE it, rather than wrote it)? */
function answersByCheck(it) {
    const payload = (it.q && it.q.cell && it.q.cell.payload) || {};
    if (it.key && it.key.slots && it.key.slots.choice) return true;
    try {
        return hasCell(it.template) && (getCell(it.template).inputs(payload) || []).some((x) => x && (x.shape === 'check' || x.kind === 'check' || x.shape === 'choice' || x.kind === 'choice'));
    } catch (e) { return false; }
}

/** The choices of a one-value answer that is one of a few words (Enough / Not enough, a.m. / p.m.). */
function choicesOf(it, correct, shown) {
    const q = it.q || {};
    const payload = (q.cell && q.cell.payload) || {};
    // pv lane: a word-choice payload (number_word_names A-D) is fixed by letter too.
    if ((CHOICE.has(it.template) || payload.kind === 'word-choice') && Array.isArray(payload.labels) && payload.labels.length) {
        return { labels: payload.labels.map(String), correct: Number(payload.correct) || 0 };
    }
    if (/^\d[\d,.]*$/.test(correct)) return null;
    // A sign is WRITTEN, in a circle, as the item asks (critic round 4: check boxes beside < > =).
    if (/^[<>=]$/.test(correct)) return null;
    const opts = [...new Set(Array.isArray(q.options) ? q.options.filter((o) => o !== null && typeof o !== 'object').map(String) : [])];
    const i = opts.indexOf(correct);
    // The item's own answer is a check box (its key slot is `choice`): the fix is checking the
    // right one - A or B, a.m. or p.m. (critic round 4: a letter written in a box).
    const ks = (it.key && it.key.slots) || {};
    if (ks.choice) {
        const labs = opts.length >= 2 && i >= 0 ? opts : /^[A-D]$/.test(correct) ? ['A', 'B', 'C', 'D'].slice(0, Math.max(2, 'ABCD'.indexOf(correct) + 1, 'ABCD'.indexOf(String(shown)) + 1)) : null;
        if (labs && labs.includes(correct)) return { labels: labs, correct: labs.indexOf(correct) };
    }
    // The item's answer is a CHECK among its own categories ("Which has the most? Check one
    // box." on a graph): the fix is checking the right one, the item's shape - never the word
    // written on a line (critic regrade 5: a box on one item, a line on the next).
    const cats = Array.isArray(payload.categories) ? payload.categories.map(String) : [];
    if (answersByCheck(it) && cats.length >= 2 && cats.includes(correct)) {
        return { labels: cats, correct: cats.indexOf(correct) };
    }
    // A picked model (the pupil CIRCLED A, B, C or D): the fix is checking the right letter,
    // never a letter written in a box (critic EA r5: fractions:identify)
    const letters = Array.isArray(payload.terms) ? payload.terms.map((t) => (t && t.letter ? String(t.letter) : '')).filter(Boolean) : [];
    if (answersByCheck(it) && letters.length >= 2 && letters.includes(correct)) {
        return { labels: letters, correct: letters.indexOf(correct) };
    }
    // A multiple-choice item whose options are too long to write out again (a word name): the
    // fix is the letter the item prints beside the option (A-D). A short option (a fraction, a
    // number) is WRITTEN: a production item is never turned into a choice (critic round 4).
    if (opts.length >= 2 && opts.length <= 4 && i >= 0 && opts.some((t) => t.length > 12)) {
        return { labels: opts.map((_, k) => 'ABCD'[k]), correct: i };
    }
    // A two-way word answer (Yes / No, Enough / Not enough, a.m. / p.m.): the fix is a check box
    // pair, never the word written in a box (critic round 3).
    const PAIRS = [['Yes', 'No'], ['a.m.', 'p.m.'], ['Odd', 'Even'], ['True', 'False']];
    const low = (t) => String(t).toLowerCase();
    const pair = PAIRS.find((pr) => pr.map(low).includes(low(correct)))
        || (/^not\s/i.test(correct) ? [correct.replace(/^not\s+/i, (m) => '').replace(/^./, (x) => x.toUpperCase()), correct] : null)
        || (/^not\s/i.test(String(shown)) && low(String(shown).replace(/^not\s+/i, '')) === low(correct) ? [correct, String(shown)] : null);
    if (pair) {
        const labels = pair.map((t) => (low(t) === low(correct) ? correct : t));
        const i = labels.findIndex((t) => low(t) === low(correct));
        return i >= 0 ? { labels, correct: i } : null;
    }
    return null;
}

const normWork = (t) => String(t).replace(/<[^>]*>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ').replace(/[\s,/:]+/g, '').toLowerCase();

/**
 * Does the finished work really show the pupil's wrong answer? The work is drawn once, as it
 * prints; the text of its answer slots (or, for a legacy cell, of the whole cell) must hold the
 * shown value, and must not be just the right answer. A drawn model cannot be read this way and
 * is trusted to its template.
 */
export function showsWrong({ it, kind, shown, shownSlots, sParts, correct, P }) {
    if (kind === 'draw' || kind === 'line') return true;
    if (String(shown).replace(/[\s,]+/g, '') === String(correct).replace(/[\s,]+/g, '')) return false;
    let html = '';
    try {
        const ctx = resolveCtx({ mode: 'print', size: 'L', look: 'ican', state: 'blank' });
        html = it.render(ctx, { cols: 1, shown, prompt: false, shownSlots });
    } catch (e) { return true; }
    if (!html) return true;
    // the text inside the item's own writing places
    const slotText = [];
    const re = /<([a-z][a-z0-9]*)\b[^>]*\sdata-ws-slot="(?!x\d|fix|ea-)[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi;
    let m;
    while ((m = re.exec(html))) slotText.push(m[2]);
    const hay = normWork(slotText.join(' ')) || normWork(html);
    const want = (sParts && sParts.length ? sParts.filter((v, i) => P && String(v) !== String(P.parts[i].value)) : [shown])
        .map(normWork).filter(Boolean);
    return !want.length || want.every((w) => hay.includes(w));
}

/**
 * The role's cell around the skill's cell. `info.index` / `info.seed` choose wrong or right, so
 * the choice is part of the item and survives measurement, pagination and the key.
 */
export function prepare(it, info = {}) {
    const correct0 = answerOf(it);
    if (!correct0) return null;                              // nothing to show in the slot
    const wrong = realWrongOf(it);
    // PT-ERR-1: an item flagged wrong without a real wrong answer is skipped, never shown
    // correct instead (that is how a page ended up with every answer right).
    if (info.wrong && !wrong) return null;
    const isWrong = !!(wrong && info.wrong);
    const q = it.q || {};
    let P = LINED.has(it.template) || DRAWN.has(it.template) ? null : answerParts(it, correct0);
    const correct = correct0;
    // A place-value line slot writes the number the way the key does ("80,000", never "80000"
    // beside a wrong "80,000" - critic round 4); a digit grid keeps its bare digits.
    const kDisp = String((it.key && it.key.display) || '');
    const written = it.template === 'pv' && kDisp.replace(/,/g, '') === correct ? kDisp : correct;
    const shown = isWrong ? (P ? likeAnswer(wrong.value, P.display || written) : likeCorrect(wrong.value, written)) : written;
    const who = PUPILS[(Number(info.index) || 0) % PUPILS.length];
    // The word-work cell draws its own finished working (sign, columns, answer): no extra line.
    const story = (it.fclass === 'word' || it.template === 'wordpic') && it.template !== 'word-work';
    const fp0 = it.footprint || {};
    // The item's answer slots, and what the pupil wrote in each (critic round 3): a correct item
    // shows the RIGHT value in every slot ("10 + 30 = 40", never "40 + 40 = 40"), a wrong one the
    // wrong answer split into the same slots ("4 | 6 | 2", never "462" in every column).
    let glue = P ? (P.glue || glueOf(P.display, P.parts)) : null;
    // every value the pupil wrote in a slot is written like the right one there (L3)
    const keySlots = (it.key && it.key.slots) || {};
    let shownSlots = isWrong && wrong.slots
        ? Object.fromEntries(Object.entries(wrong.slots).map(([id, v]) => [id, keySlots[id] ? likeAnswer(v, keySlots[id].value) : v]))
        : undefined;
    let sParts = null;
    if (P) {
        const ids = P.parts.map((x) => x.id);
        if (!isWrong) sParts = P.parts.map((x) => x.value);
        else {
            const split = splitLike(wrong.value, glue, ids.length)
                // a whole number in a mixed-number place: the whole box, the fraction left empty
                || (P.glue && /^\d+$/.test(String(wrong.value).trim()) ? [String(wrong.value).trim(), '', ''] : null)
                || (/[;,]\s/.test(String(wrong.value)) ? String(wrong.value).split(/[;,]\s*/) : null);
            sParts = ids.map((id, i) => {
                if (wrong.slots && wrong.slots[id] !== undefined) return likeAnswer(wrong.slots[id], P.parts[i].value);
                // a part the wrong answer does not name was written right ("5, 7, 28": one
                // group short leaves the 5 and the 7 as they were)
                return likeAnswer(split && split.length === ids.length ? split[i] : (i === ids.length - 1 && !split ? String(wrong.value) : P.parts[i].value), P.parts[i].value);
            });
            if (sParts.every((v) => v === '')) sParts = null;
            // Parts the whole answer does not spell out (an area model's partial products under
            // its total): unless the provider names every one, the template splits the work.
            if (!glue && !split && !ids.every((id) => wrong.slots && wrong.slots[id] !== undefined)) sParts = null;
        }
        if (sParts) shownSlots = Object.assign({}, isWrong && wrong.slots ? wrong.slots : {}, Object.fromEntries(ids.map((id, i) => [id, sParts[i]])));
    }
    // A place-value mat the pupil DRAWS, or a dot the pupil MARKS: the fix is the mat or the
    // line again, clean (critic round 3: a number box asked for a drawing).
    const pvKind = it.template === 'pv' && q.cell && q.cell.payload ? q.cell.payload.kind : '';
    let redraw = pvKind === 'build' ? 'draw' : pvKind === 'line-mark' ? 'mark' : '';
    // A drawn place-value mat is fixed by writing HOW MANY disks go in each place, the mat's own
    // structure in words ("[ ] hundreds [ ] tens [ ] ones"): a second mat would hold one item a
    // page (critic round 3, density), and the count names exactly what the pupil must redraw.
    const drewWork = redraw === 'draw';
    const places = pvKind === 'build' && Array.isArray(q.cell.payload.places) ? q.cell.payload.places.map(Number) : [];
    const PW = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands' };
    const nBuild = Number(String(correct0).replace(/,/g, ''));
    if (places.length >= 2 && places.every((pl) => PW[pl]) && Number.isFinite(nBuild)) {
        P = { parts: places.map((pl, i) => ({ id: `u${i}`, value: String(Math.floor(nBuild / pl) % 10) })), display: '' };
        glue = [''].concat(places.map((pl) => ` ${PW[pl]}`));
        sParts = null;
        redraw = '';
    }
    // a multiple-choice item keeps its own choice even when it reads as a story (word names)
    // A one-value answer names its slot, so a template that fills slots from the key writes what
    // the pupil wrote there (critic round 4: add_three drew the right sum as the "wrong" work).
    if (!P) {
        const ks = (it.key && it.key.slots) || {};
        const one = Object.keys(ks).filter((id) => ks[id] && ks[id].graded !== false && !/^(x\d+|fix|ea-)/.test(id));
        if (one.length === 1 && !(shownSlots && shownSlots[one[0]] !== undefined)) shownSlots = Object.assign({}, shownSlots || {}, { [one[0]]: shown });
        // A misplaced dot is a second mistake the one fix slot cannot correct: the dot stays
        // where the number is, and the error is in the rounding only (critic round 4).
        if (shownSlots && shownSlots.mark !== undefined && !ks.mark) { shownSlots = Object.assign({}, shownSlots); delete shownSlots.mark; }
    }
    // a multiple-choice item keeps its own choice even when it reads as a story (word names)
    const choice = !P && !redraw && (!story || (Array.isArray(q.options) && q.options.length >= 2)) ? choicesOf(it, correct, shown) : null;
    // ONE number written a digit per box (a column sum's answer row, a quotient, a place-value
    // chart): the fix is that number, in one box - the work above already shows it split.
    const digitSplit = !!(P && glue && P.parts.every((x) => /^\d$/.test(x.value))
        && glue.slice(1, -1).some((g) => !g.trim()) && glue.slice(1, -1).every((g) => !g.trim() || g.trim() === ','));
    // How the fix is written (PT-ERR-2): in the item's OWN answer shape.
    let kind;
    let labels = null;
    let tagged = null;
    if (DRAWN.has(it.template)) kind = 'draw';
    else if (redraw) kind = 'redo';
    else if (LINED.has(it.template)) kind = 'line';
    else if (choice) kind = 'choice';
    else if (P && P.parts.length > 1 && digitSplit) kind = 'value';
    else if (P && P.parts.length > 1) {
        labels = isList(glue) || !glue ? partLabels(it, P.parts, null) : null;
        // Blanks scattered in a chart (a hundreds-chart window's two gaps): each grey number is
        // lettered A, B ... and so is its fix box (critic round 4: "[ ] , [ ]" said nothing about
        // which box fixes which number).
        if (!labels && isList(glue) && it.template !== 'pv' && !REDO.has(it.template) && it.template !== 'clock' && P.parts.length <= 6) {
            labels = P.parts.map((_, i) => ({ text: 'ABCDEF'[i] }));
            tagged = P.parts.map((x) => x.id);
        }
        kind = labels ? 'parts' : REDO.has(it.template) || (it.template === 'clock' && isList(glue)) ? 'redo' : glue ? 'parts' : 'value';
    } else kind = /[A-Za-z]{2}/.test(correct) && !/^\d/.test(correct) ? 'text' : 'value';
    const work = story ? storyWork(it, shown, wrong, isWrong) : '';
    // The key's slots: the judgement, and the fix in EVERY slot of its kind (critic round 3: a key
    // that fills only the changed boxes leaves a pupil slot unanswered, and "blank" reads as 0).
    const slots = { 'ea-ok': isWrong ? '' : '✓', 'ea-fix': isWrong ? '✓' : '' };
    // The fix is written the way the item writes its own numbers: "1,000,000" beside an item that
    // prints "981,156", never "1000000" (critic round 3).
    const commas = /\d,\d{3}/.test(`${q.printText || ''} ${q.text || ''} ${q.printAnswer || ''}`);
    const fixText = commas && /^\d{4,}$/.test(String(correct)) ? Number(correct).toLocaleString('en-US') : correct;
    if (kind === 'value' || kind === 'text') slots['ea-ans'] = isWrong ? fixText : '';
    if (kind === 'parts') P.parts.forEach((x, i) => { slots[`ea-ans-${i}`] = isWrong ? x.value : ''; });
    if (kind === 'line') (partsOfList(correct) || []).forEach((v, i) => { slots[`ea-ans-${i}`] = isWrong ? v : ''; });
    if (kind === 'choice') choice.labels.forEach((lab, i) => { slots[`ea-pick-${i}`] = isWrong && i === choice.correct ? '✓' : ''; });
    const key = slotKey(slots, correct);
    const digitMm = (size) => ({ S: 6, M: 7, L: 8 }[size] || 8);
    // L3 (critic EA r5): a fix box as wide as the RIGHT answer gives it away ("10,000" is wider
    // than "9,000": round_nl 55 vs 47 mm). Its room comes from the numbers the question prints,
    // never from the answer (roomOf).
    // headroom: a sum or a rounding can be one digit longer than any number it prints ("9,677"
    // rounds to "10,000"); a product as long as its two factors together
    const times = /×|\bx\b|\*/.test(String(q.text || '')) || opOf(q) === 'multiply';
    const room = times ? roomOf(it) * 2 : roomOf(it) + 1;
    const ownLine = kind === 'value' && ownShapeOf(it) === 'line';
    // a fraction ("n/d") or a mixed number ("w n/d") is fixed as one: the last two parts over a bar
    const fracFix = kind === 'parts' && !labels && glue && (P.parts.length === 2 || P.parts.length === 3) && glue[glue.length - 2].trim() === '/'
        && !glue[0].trim() && !glue[glue.length - 1].trim() && (P.parts.length === 2 || !glue[1].trim());
    // The fix's width on paper (mm), so a wide fix goes under the work, never over the edge.
    const fixWidth = (size) => {
        if (kind === 'value') return Math.max(26, room * digitMm(size) + 10);
        // a word is HANDWRITTEN: ~6 mm a letter at L (critic regrade 5: "trapezoid" on a 40 mm
        // line) - one width for every word on the page, whatever the answer
        if (kind === 'text') return { S: 52, M: 58, L: 64 }[size] || 64;
        if (kind === 'parts') {
            if (fracFix) return (P.parts.length - 1) * (boxW(null, 0, size) + 4);
            return P.parts.reduce((s, x, i) => s + boxW(x, i, size) + 4, 0) + (labels ? 0 : glue.join('').length * 3.2);
        }
        return 0;
    };
    // every box of a several-part fix the same width, from the printed numbers (L3)
    const boxW = (x, i, size) => Math.max(16, (room - 1) * digitMm(size) + 8);
    /**
     * The narrowest the judgement can be (mm): it sits BESIDE the work when the cell has that much
     * room left, and wraps UNDER it otherwise - decided by the page's own flow, so the measured
     * height is the real one (critic round 3: judgements stacked under narrow work left the page
     * half empty).
     */
    const judgeMin = (size) => {
        if (kind === 'parts' && labels) return Math.max(44, Math.max(...P.parts.map((x, i) => boxW(x, i, size) + 4)) * 2 + 4);
        if (kind === 'value' || kind === 'text' || kind === 'parts') return Math.max(44, fixWidth(size));
        if (kind === 'choice') return 48;
        if (kind === 'draw') return Math.min(Number(fp0.wMm) || 80, 82);
        if (kind === 'line') return 60;
        return 44;
    };
    const render = (c, o = {}) => {
        // The work is drawn in state `wrong` on BOTH pages, so a key render says so itself
        // (`options.fixKey`), and the template fills its fix place only there.
        const workOf = (fixOpts) => {
            try {
                return it.render(Object.assign({}, c, { state: 'blank', options: Object.assign({}, c.options || {}, fixOpts) }), Object.assign({}, o, {
                    shown, prompt: false, shownSlots,
                }));
            } catch (e) { return ''; }
        };
        let body = workOf(kind === 'draw' || kind === 'line' ? { fix: kind, fixKey: c.state === 'answered' && isWrong } : {});
        // A drawn model's own "Fix it:" mat is lifted out of the work, so the decision boxes come
        // BEFORE the fix (critic round 3: the pupil met the fix zone before deciding).
        let drawZone = '';
        if (kind === 'draw' && /data-ws-slot="fix"/.test(body)) {
            const plain = workOf({});
            const F = insertOf(plain, body);
            if (F && /data-ws-slot="fix"/.test(F)) { drawZone = F; body = plain; }
        }
        // A template's own fix places are judged with the item's one point (PT-ERR-2), like the
        // role's fix box: ungraded, so a correct item's empty fix place is not a missing answer.
        const ungraded = (h) => h.replace(/(data-ws-slot="(?:x\d+|fix)")(?![^>]*data-ws-graded)/g, '$1 data-ws-graded="0"');
        body = ungraded(body);
        drawZone = ungraded(drawZone);
        const askedFix = !!drawZone || ((kind === 'draw' || kind === 'line') && /data-ws-slot="(?:fix|x\d)/.test(body));
        // "Sam chose:" over a ticked box - he wrote nothing (critic regrade 5)
        const verb = kind === 'draw' || drewWork ? 'drew' : redraw === 'mark' ? 'marked' : kind === 'choice' && answersByCheck(it) ? 'chose' : 'wrote';
        // A line-mark item names its number only in the page's own instruction: the finished
        // work says which number was to be marked, or it cannot be checked (critic round 3).
        // An estimate is judged against ITS rounding rule, so the rule is printed with the work
        // (critic round 3: "84 + 13 ≈ 100" was keyed wrong on a page that never said "nearest 10").
        const place = it.template === 'pv' && /^estimate_(sum|diff|sums_diffs)$/.test(String(q.skillId || '')) ? Number((q.pv && q.pv.place) || (q.cell && q.cell.payload && q.cell.payload.place) || 0) : 0;
        const task = redraw === 'mark' && q.cell.payload.n !== undefined ? `<div class="mq-eatask">Mark <b>${esc(commas(q.cell.payload.n))}</b>.</div>`
            : place >= 10 ? `<div class="mq-eatask">Round each number to the nearest <b>${esc(commas(place))}</b>.</div>` : '';
        // the letters on the grey numbers the fix boxes are captioned with
        if (tagged) {
            tagged.forEach((id, i) => {
                const re = new RegExp(`(<[a-z][a-z0-9]*\\b[^>]*\\sdata-ws-slot="${id}"[^>]*)>`, 'i');
                body = body.replace(re, (m0, open) => `${open} data-ws-tagged="1"><i class="mq-slottag">${'ABCDEF'[i]}</i>`);
            });
        }
        const shownWork = `<div class="mq-judge-work"><span class="mq-pupiltag${story ? ' mq-pupiltag-flow' : ''}">${esc(who)} ${verb}:</span>${task}${kind === 'draw' ? body : pupilInk(body)}`
            + (work ? `<div class="mq-pupilwork mq-pupil" data-ws-ink="solid">${esc(work)}</div>` : '') + '</div>';
        const box = (id, w, text) => blank({ id, kind: 'number', shape: 'box', widthMm: w, graded: false }, c, slotOnly(key, id)) + (text ? '' : '');
        let fix = '';
        let drawnJudge = false;
        if (kind === 'value' && /^[<>=]$/.test(correct)) {
            // a sign is written in a circle, as in the item (critic round 3)
            fix = `<span class="mq-ansslot mq-fixslot mq-fixsign">${blank({ id: 'ea-ans', kind: 'sign', shape: 'circle', graded: false }, c, slotOnly(key, 'ea-ans'))}<small>right sign</small></span>`;
        } else if (kind === 'value') {
            // the item's own shape: a line answer is fixed on a line, a box answer in a box (critic
            // EA r5: "the pupil's slot is a line but the fix slot a box on the same item")
            const place = ownLine
                ? blank({ id: 'ea-ans', kind: 'number', shape: 'line', widthMm: fixWidth(c.size), graded: false }, c, slotOnly(key, 'ea-ans'))
                : box('ea-ans', fixWidth(c.size));
            fix = `<span class="mq-ansslot mq-fixslot${ownLine ? ' mq-fixtext' : ''}">${place}<small>correct answer</small></span>`;
            // a fraction is written stacked over its bar, never with a slash (TY-7)
            fix = fix.replace(/>(\d+)\s*\/\s*(\d+)</, '><span class="mq-frac"><span>$1</span><span>$2</span></span><');
        } else if (kind === 'text') {
            fix = `<span class="mq-ansslot mq-fixslot mq-fixtext">${blank({ id: 'ea-ans', kind: 'text', shape: 'line', widthMm: fixWidth(c.size), graded: false }, c, slotOnly(key, 'ea-ans'))}<small>correct answer</small></span>`;
        } else if (kind === 'parts') {
            const w = (x, i) => boxW(x, i, c.size);
            if (labels) {
                const lab = partLabels(it, P.parts, c) || labels;
                fix = `<span class="mq-fixes mq-fixslot">${P.parts.map((x, i) => `<span class="mq-ansslot">${box(`ea-ans-${i}`, w(x, i))}`
                    + `<small>${lab[i].html || esc(lab[i].text)}</small></span>`).join('')}</span>`;
            } else {
                // The item's own shape, joined by its own words: "[ ] h [ ] min", "[ ] + [ ] = [ ]".
                // Digit columns (a place-value chart) are boxes side by side, as in the chart.
                const inner = glue.slice(1, -1);
                const cols = inner.some((g) => !g.trim()) && inner.every((g) => !g.trim() || g.trim() === ',');
                // a sign keeps the size of the item's signs; a word ("h", "hundreds") the text size
                const g = (t) => (!cols && t.trim() ? `<span class="mq-fixglue${/^[+\-−×÷=:<>R,]$/.test(t.trim()) ? ' mq-fixsym' : ''}">${esc(t.trim())}</span>` : '');
                // a fraction is fixed as a fraction: two boxes over a bar, never "[ ] / [ ]"
                // (critic EA r5: a slashed fraction on paper, TY-7)
                const k0 = P.parts.length - 2;
                fix = fracFix
                    ? `<span class="mq-fixpat mq-fixslot">${k0 ? box('ea-ans-0', w(P.parts[0], 0)) : ''}<span class="mq-frac mq-fixfrac"><span>${box(`ea-ans-${k0}`, w(P.parts[k0], k0))}</span><span>${box(`ea-ans-${k0 + 1}`, w(P.parts[k0 + 1], k0 + 1))}</span></span></span>`
                    : `<span class="mq-fixpat mq-fixslot${cols ? ' mq-fixcols' : ''}">${g(glue[0])}`
                    + P.parts.map((x, i) => box(`ea-ans-${i}`, w(x, i)) + g(glue[i + 1])).join('')
                    + '</span>';
            }
        } else if (kind === 'line' && !askedFix) {
            const cParts = partsOfList(correct) || [];
            const fixW = Math.max({ S: 18, M: 20, L: 22 }[c.size] || 22, room * digitMm(c.size) + 6);
            fix = `<span class="mq-fixes mq-fixslot">${cParts.map((v, i) => `<span class="mq-ansslot">${box(`ea-ans-${i}`, fixW)}<small>${i + 1}</small></span>`).join('')}</span>`;
        } else if (kind === 'choice') {
            fix = `<span class="mq-fixchoice mq-fixslot${choice.labels.every((l) => /^[A-D]$/.test(String(l))) ? ' mq-fixletters' : ''}">${choice.labels.map((lab, i) => checkLine(`ea-pick-${i}`, String(lab), c, key, { graded: false })).join('')}</span>`;
        } else if (kind === 'draw' && drawZone) {
            fix = `<span class="mq-redraw mq-fixslot mq-fixzone">${drawZone}</span>`;
            drawnJudge = true;
        } else if ((kind === 'draw' && !askedFix) || kind === 'redo') {
            // The item again, clean: empty on the pupil page, every slot written on the key of a
            // wrong item (a redraw zone for a model; the strip, chart or clock for a list whose
            // parts only the picture can name).
            let zone = '';
            try {
                zone = it.render(Object.assign({}, c, { state: c.state === 'answered' && isWrong ? 'answered' : 'blank' }), Object.assign({}, o, { prompt: false }));
            } catch (e) { zone = ''; }
            // The zone is drawing space, not a set of scored slots: its own slot marks are dropped.
            zone = zone.replace(/\sdata-ws-slot="/g, ' data-ws-part="');
            fix = `<span class="mq-redraw mq-fixslot" data-ws-slot="ea-draw" data-ws-shape="open" data-ws-graded="0"><small>Fix it: ${kind === 'draw' || redraw === 'draw' ? 'draw' : redraw === 'mark' ? 'mark' : 'write'} it again.</small>${zone}</span>`;
        }
        const below = kind === 'redo';
        const judge = judgeGroup('ea-judge', `${checkLine('ea-ok', JUDGE_LABELS.correct, c, key, { graded: false })}`
            + `<span class="mq-fixrow">${checkLine('ea-fix', JUDGE_LABELS.fixIt, c, key, { graded: false })}${below ? '' : fix}</span>`);
        // An item with its own answer column (a graph and its question): the judgement goes under
        // the pupil's answer, inside that column, on every cell (AX-4) - and costs no width.
        const modal = !below && !drawnJudge && kind !== 'draw';
        // a graph's question sits beside its picture in one column, under it in more (EA r5, B)
        const ask = (Number(o.cols) || 1) >= 2 ? ' mq-askunder' : ' mq-askside';
        if (modal && (o.judge === 'incol' || !o.judge)) {
            const inCol = intoAnswerColumn(shownWork, `<div class="mq-judgecol">${judge}</div>`);
            if (inCol) return `<div class="mq-judge mq-judge3 mq-judge-incol${ask}" data-judge-mode="incol">${inCol}</div>`;
        }
        // The flow: the work, then the judgement, then a redraw zone across the whole cell. The
        // decision boxes always come before the fix. The page decides ONE place for every cell
        // (`o.judge`: 'beside' at the cell's right, 'below' in one row under the work - AX-4);
        // unset (measuring), it flows beside when it fits, else under.
        const mode = modal && (o.judge === 'beside' || o.judge === 'below') ? o.judge : '';
        return `<div class="mq-judge mq-judge3${ask}${mode ? ` mq-j${mode}` : ''}${drawnJudge ? ' mq-judge-drawn' : ''}"${mode ? ` data-judge-mode="${mode}"` : ''} style="--mq-jw:${Math.round(judgeMin(c.size))}mm">`
            + shownWork
            + judge
            + (below ? fix : '')
            + `</div>`;
    };
    // THE GUARD (critic round 4, H1): a "wrong" item whose finished work does not show the wrong
    // value - the template wrote the right answer, or the wrong value equals the right one - is
    // never printed; the host deals another item. The key would otherwise "fix" a right answer.
    if (isWrong && !showsWrong({ it, kind, shown, shownSlots, sParts, correct, P })) return null;
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true, answerWords: isWrong ? `Fix it: ${correct}` : 'Correct',
        // The judgement flows beside the work in one column and under it in two: a taller cell in
        // two columns is that layout, not markup collapsing, so the host measures each count as
        // it is and the page takes whichever holds more (critic round 3: half-empty pages).
        colsLayout: true,
        // the places the Correct / Fix-it block can take; the host measures each (AX-4)
        judgeModes: kind === 'draw' || kind === 'redo' ? undefined : ['incol', 'beside', 'below'],
        // the fix's SHAPE (boxes / a sign circle / a stacked fraction / check boxes / a word line),
        // so a page keeps to one (critic EA r5, B: a line, "+" boxes and a sign circle on one page)
        fixSig: kind === 'value' && /^[<>=]$/.test(correct) ? 'sign' : fracFix ? 'frac' : kind === 'choice' ? 'check'
            : kind === 'value' ? (ownLine ? 'line' : 'box') : kind === 'parts' ? 'boxes' : kind,
        // The judgement column sits beside the work; a word problem or a wide picture keeps its
        // own single column (PT-WPR-1).
        footprint: Object.assign({}, it.footprint || {}, { measure: true, hMm: null, maxCols: Math.min(3, (it.footprint && it.footprint.maxCols) || 3) }),
        fclass: it.fclass === 'word' || it.fclass === 'wide' ? it.fclass : 'standard', thinking: { shown, correct, isWrong, basis: wrong ? wrong.basis : '', kind, redraw },
        cellCls: [it.cellCls || '', 'mq-thinkcell mq-eacell'].join(' ').trim(),
    });
}

/**
 * PT-ERR-1 needs something to find: a page with no real wrong answer on it is not an Error
 * analysis page, so the role says why instead of printing a page of correct work (or nothing).
 */
/** Is this skill a sort (its answer is where every number goes)? From its own instruction key. */
function isSort(sk) {
    try {
        const p = getProvider(sk.categoryId || '', sk.skillId || '');
        const st = typeof p.strings === 'function' ? p.strings({ categoryId: sk.categoryId, skillId: sk.skillId }) : p.strings;
        return /^sort\b|^sort-/.test(String((st && st.instructionKey) || ''));
    } catch (e) { return false; }
}

export function supports(items, info = {}) {
    const skills = (info && info.skills) || [];
    if (!items.length && skills.length && skills.every(isSort)) {
        // A design decision, not a gap: the finished work of a sort is a placement of EVERY
        // number, so fixing it means sorting the whole set again - which is the Sort page itself.
        // Its two misconceptions (a halfway number in the lower column, sorting by the first
        // digits) are keyed on that page; Check it pages take skills with one answer to fix.
        return 'A sort has no single answer to fix: its work places every number, so fixing it is doing the whole sort again. Print the sort page instead; its key shows the halfway and first-digit mistakes.';
    }
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
// `mode` ('incol' | 'beside' | 'below'): the height with the Correct / Fix-it block in that one
// place (the host measures each `judgeModes`; null = it does not fit there); an item measured
// without modes (a drawn model) is the same height either way.
const JUDGE_MODES = ['incol', 'beside', 'below'];
const heightAt = (it, cols, mode) => {
    const m = it.measured && it.measured[cols];
    if (!m || !Number.isFinite(m.hMm) || m.fits === false) return Infinity;
    const h = mode && m.modes ? m.modes[mode] : m.hMm;
    return Number.isFinite(h) ? h + 4 : Infinity;
};

/**
 * The deal order with every item whose RIGHT answer is new to its kind (wrong or right) first,
 * the repeats after (L10, critic EA r5: every fixed sign on a page was ">"). Stable otherwise.
 */
export function varied(items) {
    const seen = new Set();
    const first = [], again = [];
    for (const it of items) {
        const t = it.thinking || {};
        const k = `${t.isWrong ? 'w' : 'r'}|${String(t.correct)}`;
        (seen.has(k) ? again : first).push(it);
        seen.add(k);
    }
    return first.concat(again);
}

/**
 * The height each row of a page gets (mm): what its tallest item needs (+10%), then every row
 * grown alike toward the grid's height - never past 1.4 times - so spare height goes INTO the
 * cells instead of a ~24 mm strip between rows (critic EA r5, A: rowGapFor strips of 18-33%).
 */
export function rowHeights(items, cols, G, mode) {
    const rows = Math.max(1, Math.ceil(items.length / cols));
    const need = [];
    for (let r = 0; r < rows; r++) {
        const hs = items.slice(r * cols, (r + 1) * cols).map((it) => heightAt(it, cols, mode)).filter(Number.isFinite);
        need.push(hs.length ? Math.min(G / rows, Math.max(...hs) * 1.1) : G / rows);
    }
    const sum = need.reduce((a, b) => a + b, 0);
    const grow = sum > 0 ? Math.max(1, Math.min((G - SAFETY_H_MM) / sum, 1.4)) : 1;
    return need.map((x) => Math.round(Math.min(G / rows, x * grow) * 100) / 100);
}

/**
 * How empty a layout leaves its cells: per item, the larger of its empty width and empty height
 * share, averaged (0 = full). A one-line item alone in a full-width cell scores ~0.6; the same
 * item in half the width ~0.2 (critic EA r5: placevalue:compare 51-57% H13 in one column).
 */
export function emptiness(items, cols, G, mode) {
    const rh = rowHeights(items, cols, G, mode);
    let tot = 0;
    items.forEach((it, i) => {
        const m = (it.measured && it.measured[cols]) || {};
        const cellW = Math.max(10, (Number(m.innerMm) || LIVE_W_MM / cols) - 6);
        const w = m.inkW && Number.isFinite(m.inkW[mode]) ? m.inkW[mode] : cellW * 0.8;
        const h = heightAt(it, cols, mode) - 4;
        const H = rh[Math.floor(i / cols)] || 1;
        tot += Math.max(0, 1 - w / cellW, 1 - h / H);
    });
    // ... plus the page left blank under the grid (critic figures-r6: temperature 2 x 1 left the
    // lower half of the page blank where 1 x 2 fills it)
    const under = Math.max(0, 1 - rh.reduce((a, b) => a + b, 0) / G);
    return items.length ? tot / items.length + under : 1;
}

/** The fix shape an item asks for ("value", "parts|2", "choice|4" ...): one per section (B). */
const sigOf = (it) => String(it.fixSig || (it.thinking && it.thinking.kind) || '');

/**
 * Choose n items (in order) that fit `rows` rows of `cols` columns, about half of them wrong
 * (PT-ERR-1): an item is taken while its measured height fits G / rows and its kind (wrong or
 * right) still has room. null when fewer than n fit.
 */
function pick(items, cols, rows, G, mode) {
    const n = cols * rows;
    const h = (G - SAFETY_H_MM) / rows;
    const wantWrong = Math.max(1, Math.round(n / 2));
    const out = [];
    let w = 0;
    for (const it of varied(items)) {
        if (out.length >= n) break;
        if (heightAt(it, cols, mode) > h) continue;
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
    // ONE fix shape per section (critic EA r5, B: a mixed pool printed a line, two boxes with +,
    // a sign circle and tens/ones boxes on one page): the page deals the pool's commonest shape.
    const count = new Map();
    for (const it of items) count.set(sigOf(it), (count.get(sigOf(it)) || 0) + 1);
    const tops = [...count.entries()].sort((a, b) => b[1] - a[1]).map((e) => e[0]);
    // the commonest shape that fills a page as well as the whole pool does (never a one-item
    // page to keep one shape: then the page mixes, as before)
    const full = layoutOf(items, ctx, G, ceil, word);
    let best = null;
    for (const sig of tops) {
        const got = layoutOf(items.filter((it) => sigOf(it) === sig), ctx, G, ceil, word);
        if (got && full && got.items.length >= full.items.length) { best = got; break; }
    }
    if (!best) best = full;
    if (!best) return null;
    const perPage = best.cols * best.rows;
    return {
        role: ROLE_ID, cols: best.cols, rows: best.rows, mode: best.mode, perPage, pages: 1, count: perPage, cellH: G / best.rows, gridH: G,
        items: best.items, clamped: false, note: '', notes: [], digitPt: ctx.s.digitPt, size: ctx.size, look: ctx.look, cls: 'standard',
    };
}

/** The best page `pool` makes: the most items, then the least empty cells (see measuredLayout). */
function layoutOf(pool, ctx, G, ceil, word) {
    if (!pool.length || !pool.some((it) => it.thinking && it.thinking.isWrong)) return null;
    let best = null;
    for (const cols of word ? [1] : colsFor(ctx.size)) {
        for (let rows = Math.floor(ceil / cols); rows >= 1; rows--) {
            // AX-4: the judgement in ONE place on the page - in the item's own answer column,
            // beside the work, or under it - the first that every item on the page has room for.
            let mode = null;
            let got = null;
            for (const m of JUDGE_MODES) { got = pick(pool, cols, rows, G, m); if (got) { mode = m; break; } }
            if (!got) continue;
            // More items wins; the same number goes to the layout that leaves its cells least
            // empty, in width as well as height (H13: a one-line item in a full-width cell).
            const empty = emptiness(got, cols, G, mode);
            if (!best || got.length > best.items.length || (got.length === best.items.length && empty < best.empty - 0.05)) best = { cols, rows, items: got, empty, mode };
            break;
        }
    }
    return best;
}

// The host deals three times the ceiling, so the page can choose the items that fit (measured)
// and still keep to one fix shape when a pool mixes kinds.
export const counts = (pools, input) => {
    const ctx = ctxOf(input);
    const items = pools.main || [];
    return { main: items.length && items.every((it) => it.measured && it.measured[1]) ? CEILING[ctx.size] * 3 + 3 : staticLayout(items, input).perPage };
};

/** n items in deal order, about half of them wrong and at least one (PT-ERR-1). */
function balanced(items, n) {
    const want = Math.max(1, Math.round(n / 2));
    const bad = items.filter((it) => it.thinking && it.thinking.isWrong);
    const good = items.filter((it) => !(it.thinking && it.thinking.isWrong));
    const takeBad = Math.min(bad.length, Math.max(want, n - good.length));
    const chosen = new Set([...bad.slice(0, takeBad), ...good.slice(0, n - takeBad)]);
    return items.filter((it) => chosen.has(it)).slice(0, n);
}

export function plan(input = {}) {
    const ctx = ctxOf(input);
    const all = poolItems(input, 'main');
    const M = measuredLayout(all, input);
    const L = M || staticLayout(all, input);
    // Unmeasured (or nothing fits the measured grid): the first items, still about half of them
    // wrong (PT-ERR-1) - a one-item page is never a page with no mistake on it.
    // Items whose fix is checked sit together after the written ones, so one row keeps one slot
    // shape (critic regrade 5: a box on one item, a line on the next). Stable: deal order kept.
    const isPick = (it) => (it.thinking && it.thinking.kind === 'choice' ? 1 : 0);
    const items = (M ? M.items : balanced(all, L.perPage)).slice().sort((a, b) => isPick(a) - isPick(b));
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Check it', score: items.length });
    const rows = Math.max(1, Math.ceil(items.length / L.cols));
    const judged = (it) => (L.mode && typeof it.render === 'function' ? (c, o) => it.render(c, Object.assign({}, o, { judge: L.mode })) : undefined);
    const grid = gridPart(items.map((it) => planItem(it, { cols: L.cols, render: judged(it) })), { cols: L.cols, rows, cellH: L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1 });
    if (rows === L.rows && L.fill !== false) { grid.cls = ''; grid.height = ''; }
    // RUBRIC H13 (critic round 4): a row is as tall as what it holds (+10%), never the page's
    // share of the grid - cells stretched to G / rows left 30-45% empty under the fix. Spare
    // height grows every row alike (at most 1.4 times), never a strip between rows (EA r5).
    if (M) {
        const rowH = rowHeights(items, L.cols, L.gridH, L.mode);
        const sum = rowH.reduce((a, b) => a + b, 0);
        if (sum < L.gridH * 0.97) {
            grid.cls = 'fixed';
            grid.rowsTpl = rowH.map((h) => `${h}fr`).join(' ');
            grid.height = `${Math.round(sum * 100) / 100}mm`;
        }
    }
    const wrongShare = items.length ? items.filter((it) => it.thinking && it.thinking.isWrong).length / items.length : 0;
    const fit = Object.assign({}, L, { items: undefined });
    // The instruction says where the fix goes (critic round 3): written, or drawn again.
    const drawn = items.length && items.every((it) => it.thinking && (it.thinking.kind === 'draw' || it.thinking.redraw === 'draw'));
    const marked = items.length && items.every((it) => it.thinking && it.thinking.redraw === 'mark');
    // the fix is checking the right option on every item: the instruction says so (critic round 4)
    const checked = items.length && items.every((it) => it.thinking && it.thinking.kind === 'choice');
    // some fixes are written and some checked (a graph page: "How many?" and "Which has the most?")
    const someChecked = items.some((it) => it.thinking && it.thinking.kind === 'choice');
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart(drawn ? 'check-fix-draw' : marked ? 'check-fix-mark' : checked ? 'check-fix-check' : someChecked ? 'check-fix-mixed' : 'check-fix-write'), grid] }], {
        meta: { items: items.length, scoreOutOf: items.length, wrongShare, fits: [Object.assign(fit, { line: fitsLine(fit) })], notes: L.note ? [L.note] : [] },
    });
}

/** Which items show a wrong answer: a seeded 40-60% pattern over the run (PT-ERR-1). */
export const wrongFlags = (n, seed) => wrongPattern(n, seed, ROLE_ID);

export default { ROLE_ID, sources, measureCols, prepare, supports, counts, plan, wrongFlags, realWrongOf, pupilInk, intoAnswerColumn, likeAnswer, roomOf, varied, rowHeights, emptiness };
export { esc };
