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
import { getProvider } from '../index.js';

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
    const mark = (tag, attrs) => (/\sclass="/.test(attrs)
        ? `<${tag}${attrs.replace(/\sclass="([^"]*)"/, ' class="$1 mq-pupil"')}>`
        : `<${tag} class="mq-pupil"${attrs}>`);
    return String(html).replace(/<([a-z][a-z0-9]*)\b([^>]*?)\sdata-ws-ink="solid"([^>]*)>/gi, (m, tag, pre, post) => {
        const attrs = `${pre} data-ws-ink="solid"${post}`;
        // A template's own fix place (a fix box per fact, the redraw zone) is the KEY's ink.
        if (/data-ws-slot="(?:x\d+|fix)/.test(attrs) || /\bmq-pupil\b/.test(attrs)) return m;
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
const likeCorrect = (v, correct) => (/^\d{1,3}(,\d{3})+$/.test(correct) ? commas(v) : String(v));

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
    // One number rounded to several places (build lane placevalue): one labelled fix box a place.
    if (it.template === 'pv' && p.kind === 'round-multi' && every(/^[bt]\d+$/) && Array.isArray(p.places) && p.places.length === n) {
        return p.places.map((pl) => ({ text: `to ${commas(pl)}` }));
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

/** The choices of a one-value answer that is one of a few words (Enough / Not enough, a.m. / p.m.). */
function choicesOf(it, correct, shown) {
    const q = it.q || {};
    const payload = (q.cell && q.cell.payload) || {};
    // pv lane: a word-choice payload (number_word_names A-D) is fixed by letter too.
    if ((CHOICE.has(it.template) || payload.kind === 'word-choice') && Array.isArray(payload.labels) && payload.labels.length) {
        return { labels: payload.labels.map(String), correct: Number(payload.correct) || 0 };
    }
    if (/^\d[\d,.]*$/.test(correct)) return null;
    const opts = Array.isArray(q.options) ? q.options.filter((o) => o !== null && typeof o !== 'object').map(String) : [];
    const i = opts.indexOf(correct);
    // A multiple-choice item: the fix is the item's own choice. Long options (a word name) are
    // named by the letters the item prints beside them (A-D), never copied out again.
    if (opts.length >= 2 && opts.length <= 4 && i >= 0) {
        const long = opts.some((t) => t.length > 12);
        return { labels: long ? opts.map((_, k) => 'ABCD'[k]) : opts, correct: i };
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
    const shown = isWrong ? (P ? wrong.value : likeCorrect(wrong.value, correct)) : correct;
    const who = PUPILS[(Number(info.index) || 0) % PUPILS.length];
    // The word-work cell draws its own finished working (sign, columns, answer): no extra line.
    const story = (it.fclass === 'word' || it.template === 'wordpic') && it.template !== 'word-work';
    const fp0 = it.footprint || {};
    // The item's answer slots, and what the pupil wrote in each (critic round 3): a correct item
    // shows the RIGHT value in every slot ("10 + 30 = 40", never "40 + 40 = 40"), a wrong one the
    // wrong answer split into the same slots ("4 | 6 | 2", never "462" in every column).
    let glue = P ? glueOf(P.display, P.parts) : null;
    let shownSlots = isWrong && wrong.slots ? wrong.slots : undefined;
    let sParts = null;
    if (P) {
        const ids = P.parts.map((x) => x.id);
        if (!isWrong) sParts = P.parts.map((x) => x.value);
        else {
            const split = splitLike(wrong.value, glue, ids.length)
                || (/[;,]\s/.test(String(wrong.value)) ? String(wrong.value).split(/[;,]\s*/) : null);
            sParts = ids.map((id, i) => {
                if (wrong.slots && wrong.slots[id] !== undefined) return String(wrong.slots[id]);
                // a part the wrong answer does not name was written right ("5, 7, 28": one
                // group short leaves the 5 and the 7 as they were)
                return split && split.length === ids.length ? split[i] : (i === ids.length - 1 && !split ? String(wrong.value) : P.parts[i].value);
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
    const choice = !P && !redraw && (!story || (Array.isArray(q.options) && q.options.length >= 2)) ? choicesOf(it, correct, shown) : null;
    // ONE number written a digit per box (a column sum's answer row, a quotient, a place-value
    // chart): the fix is that number, in one box - the work above already shows it split.
    const digitSplit = !!(P && glue && P.parts.every((x) => /^\d$/.test(x.value))
        && glue.slice(1, -1).some((g) => !g.trim()) && glue.slice(1, -1).every((g) => !g.trim() || g.trim() === ','));
    // How the fix is written (PT-ERR-2): in the item's OWN answer shape.
    let kind;
    let labels = null;
    if (DRAWN.has(it.template)) kind = 'draw';
    else if (redraw) kind = 'redo';
    else if (LINED.has(it.template)) kind = 'line';
    else if (choice) kind = 'choice';
    else if (P && P.parts.length > 1 && digitSplit) kind = 'value';
    else if (P && P.parts.length > 1) {
        labels = isList(glue) || !glue ? partLabels(it, P.parts, null) : null;
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
    // The fix's width on paper (mm), so a wide fix goes under the work, never over the edge.
    const fixWidth = (size) => {
        if (kind === 'value') return Math.max(26, Math.max(correct.length, String(shown).length) * digitMm(size) + 8);
        if (kind === 'text') return Math.min(80, Math.max(40, Math.max(correct.length, String(shown).length) * 2.9 + 10));
        if (kind === 'parts') {
            return P.parts.reduce((s, x, i) => s + Math.max(16, Math.max(x.value.length, String((sParts || [])[i] || '').length) * digitMm(size) + 6) + 4, 0)
                + (labels ? 0 : glue.join('').length * 3.2);
        }
        return 0;
    };
    const boxW = (x, i, size) => Math.max(16, Math.max(x.value.length, String((sParts || [])[i] || '').length) * digitMm(size) + 6);
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
        const verb = kind === 'draw' || drewWork ? 'drew' : redraw === 'mark' ? 'marked' : 'wrote';
        // A line-mark item names its number only in the page's own instruction: the finished
        // work says which number was to be marked, or it cannot be checked (critic round 3).
        // An estimate is judged against ITS rounding rule, so the rule is printed with the work
        // (critic round 3: "84 + 13 ≈ 100" was keyed wrong on a page that never said "nearest 10").
        const place = it.template === 'pv' && /^estimate_(sum|diff|sums_diffs)$/.test(String(q.skillId || '')) ? Number((q.pv && q.pv.place) || (q.cell && q.cell.payload && q.cell.payload.place) || 0) : 0;
        const task = redraw === 'mark' && q.cell.payload.n !== undefined ? `<div class="mq-eatask">Mark <b>${esc(commas(q.cell.payload.n))}</b>.</div>`
            : place >= 10 ? `<div class="mq-eatask">Round each number to the nearest <b>${esc(commas(place))}</b>.</div>` : '';
        const shownWork = `<div class="mq-judge-work"><span class="mq-pupiltag${story ? ' mq-pupiltag-flow' : ''}">${esc(who)} ${verb}:</span>${task}${kind === 'draw' ? body : pupilInk(body)}`
            + (work ? `<div class="mq-pupilwork mq-pupil" data-ws-ink="solid">${esc(work)}</div>` : '') + '</div>';
        const box = (id, w, text) => blank({ id, kind: 'number', shape: 'box', widthMm: w, graded: false }, c, slotOnly(key, id)) + (text ? '' : '');
        let fix = '';
        let drawnJudge = false;
        if (kind === 'value' && /^[<>=]$/.test(correct)) {
            // a sign is written in a circle, as in the item (critic round 3)
            fix = `<span class="mq-ansslot mq-fixslot mq-fixsign">${blank({ id: 'ea-ans', kind: 'sign', shape: 'circle', graded: false }, c, slotOnly(key, 'ea-ans'))}<small>right sign</small></span>`;
        } else if (kind === 'value') {
            fix = `<span class="mq-ansslot mq-fixslot">${box('ea-ans', fixWidth(c.size))}<small>correct answer</small></span>`;
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
                fix = `<span class="mq-fixpat mq-fixslot${cols ? ' mq-fixcols' : ''}">${g(glue[0])}`
                    + P.parts.map((x, i) => box(`ea-ans-${i}`, w(x, i)) + g(glue[i + 1])).join('')
                    + '</span>';
            }
        } else if (kind === 'line' && !askedFix) {
            const cParts = partsOfList(correct) || [];
            const wMax = Math.max(...cParts.map((v) => String(v).length));
            const fixW = Math.max({ S: 18, M: 20, L: 22 }[c.size] || 22, wMax * digitMm(c.size) + 6);
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
        // The flow: the work, then the judgement beside it when it fits (else under it), then a
        // redraw zone across the whole cell. The decision boxes always come before the fix.
        return `<div class="mq-judge mq-judge3${drawnJudge ? ' mq-judge-drawn' : ''}" style="--mq-jw:${Math.round(judgeMin(c.size))}mm">`
            + shownWork
            + judgeGroup('ea-judge', `${checkLine('ea-ok', JUDGE_LABELS.correct, c, key, { graded: false })}`
                + `<span class="mq-fixrow">${checkLine('ea-fix', JUDGE_LABELS.fixIt, c, key, { graded: false })}${below ? '' : fix}</span>`)
            + (below ? fix : '')
            + `</div>`;
    };
    return Object.assign({}, it, {
        render, key, measured: null, drawsAnswer: true, answerWords: isWrong ? `Fix it: ${correct}` : 'Correct',
        // The judgement flows beside the work in one column and under it in two: a taller cell in
        // two columns is that layout, not markup collapsing, so the host measures each count as
        // it is and the page takes whichever holds more (critic round 3: half-empty pages).
        colsLayout: true,
        // The judgement column sits beside the work; a word problem or a wide picture keeps its
        // own single column (PT-WPR-1).
        footprint: Object.assign({}, it.footprint || {}, { measure: true, hMm: null, maxCols: Math.min(2, (it.footprint && it.footprint.maxCols) || 2) }),
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
    const items = M ? M.items : balanced(all, L.perPage);
    const frame = frameOf({ skills: input.skills || [], input, tabId: 'Check it', score: items.length });
    const rows = Math.max(1, Math.ceil(items.length / L.cols));
    const grid = gridPart(items.map((it) => planItem(it, { cols: L.cols })), { cols: L.cols, rows, cellH: L.cellH, labels: labelStyleOf(ctx.look, input.labels), start: 1 });
    if (rows === L.rows && L.fill !== false) { grid.cls = ''; grid.height = ''; }
    const wrongShare = items.length ? items.filter((it) => it.thinking && it.thinking.isWrong).length / items.length : 0;
    const fit = Object.assign({}, L, { items: undefined });
    // The instruction says where the fix goes (critic round 3): written, or drawn again.
    const drawn = items.length && items.every((it) => it.thinking && (it.thinking.kind === 'draw' || it.thinking.redraw === 'draw'));
    const marked = items.length && items.every((it) => it.thinking && it.thinking.redraw === 'mark');
    return assemble(ROLE_ID, input, frame, [{ sections: [instructionPart(drawn ? 'check-fix-draw' : marked ? 'check-fix-mark' : 'check-fix-write'), grid] }], {
        meta: { items: items.length, scoreOutOf: items.length, wrongShare, fits: [Object.assign(fit, { line: fitsLine(fit) })], notes: L.note ? [L.note] : [] },
    });
}

/** Which items show a wrong answer: a seeded 40-60% pattern over the run (PT-ERR-1). */
export const wrongFlags = (n, seed) => wrongPattern(n, seed, ROLE_ID);

export default { ROLE_ID, sources, measureCols, prepare, supports, counts, plan, wrongFlags, realWrongOf, pupilInk };
export { esc };
