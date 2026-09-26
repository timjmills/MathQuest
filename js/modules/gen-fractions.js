// gen-fractions.js - Fractions, Decimals & Conversions question generation
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions, simplifyFraction, fractionToPercent, pickName, pickTwoNames, pickNoun } from './utils.js';
import { fracHTML, fracCircleSVG, fracBarHTML } from './svg-fractions.js';
import { getSkillGrade, maxDenominatorForGrade } from './data.js';
import { COLORS, STROKE, FONTS, softFill, categoricalFill } from './design-tokens.js';
import { optionsFor } from './skill-options.js';
import { fracModelSVG, fracModelSizedHTML, fracStackHTML, fracTwin, tickLabelSet, nlPlacePayload, nlPlaceAnswer, nlPlaceTwin } from './sheet/index.js';

// ---- O6 APPEARANCE (lane AP3, 2026-09-25) --------------------------------------------------
// `model` (skill-options.js, "Fraction model"): the teacher ticks the models a page draws. The
// skill's own mix (every model it drew before the option existed) is the default, and then the
// branch below runs exactly as it always did. A changed tick set draws every model with the
// kit's ONE black-and-white builder (sheet/cells/frac-model.js), on screen (q.visual) and in
// print (the legacy print handler reads q.fractionData.model / prints q.visual), so both
// surfaces show the same picture.
function _fModelPick() {
    const t = _fChanged('model');
    return t && t.length ? pick(t) : null;
}
/** One model for the SCREEN only (the skill's print handler draws its own from fractionData). */
const _fModel = (n, d, kind, extra = {}) => fracModelSVG(Object.assign({ n, d, kind, size: 'L' }, extra)).svg;
/** One model that is also PRINTED from q.visual: its S, M and L drawings, the sheet's preset showing. */
const _fModelP = (n, d, kind, extra = {}) => fracModelSizedHTML(Object.assign({ n, d, kind }, extra));
/** A fraction term: its stacked numerals over its model, on a fixed whole (28 mm at L) so the terms match and a sum fits two columns. */
const _fTerm = (n, d, kind) => `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:6px;vertical-align:middle;">`
    + `<span style="font-size:1.5rem;">${fracStackHTML(n, d)}</span>${_fModelP(n, d, kind, { wholeMm: 28 })}</span>`;
const _fSign = (s) => `<span style="font-size:1.6rem;font-weight:700;margin:0 6px;align-self:center;">${s}</span>`;
/** The `ticks` value (Numbers on the line) when the teacher changed it from the skill's default, else null. */
function _fTicks() {
    let def = null;
    try { def = optionsFor(state.category, state.skill).find(o => o.id === 'ticks') || null; } catch (e) { def = null; }
    const v = state.skillOptions && state.skillOptions.ticks;
    return def && typeof v === 'string' && v !== def.default && def.values.some(x => x.v === v) ? v : null;
}

/**
 * "Numbers on the line" on a drag-onto-the-line item: the labelled tick indices (line-labels.js)
 * written into nlData.labelAt, which the screen widget and the printed twin both read. Written
 * only when the teacher changed the value AND it labels other ticks than nlData.labelStep already
 * does, so an untouched item is exactly the item it always was.
 */
function _fNlTicks(nl, period) {
    const v = _fTicks();
    if (!v || !nl) return;
    const N = Math.round((Number(nl.max) - Number(nl.min)) / Number(nl.tickStep));
    const zero = Number(nl.min) <= 0 && Number(nl.max) >= 0 ? Math.round(-Number(nl.min) / Number(nl.tickStep)) : null;
    const set = tickLabelSet(N, v, { period, zero });
    const mult = Math.max(1, Math.round(Number(nl.labelStep || nl.tickStep) / Number(nl.tickStep)));
    const old = [];
    for (let i = 0; i <= N; i++) if (i % mult === 0) old.push(i);
    if (old.length === set.length && old.every((x, k) => x === set[k])) return;
    nl.labelAt = set;
}

/**
 * The whole of a READ item's model (the pupil counts parts, never shades them): one width at
 * every denominator, so the cell keeps to one of two columns. A circle keeps its own size.
 */
const _fWriteWhole = (kind) => (kind === 'circle' ? null : kind === 'line' ? 46 : 50);
/**
 * A place-it-on-the-line item as the kit's `nl-place` cell (O6 lane AP3 fixes): one drawing for
 * paper, key and every screen host - the pupil taps a number, then its tick. The host grades the
 * numbers read back from the ticks (q.ans, in the tiles' order). `nlData` stays for old links.
 */
function _nlKit(q) {
    const p = nlPlacePayload(q.nlData);
    if (!p) return;
    q.cell = { template: 'nl-place', v: 1, payload: p };
    q.visual = nlPlaceTwin(p);
    q.answerType = 'text';
    q.ans = nlPlaceAnswer(p);
    q.options = [];
    q.text = p.chips.length > 1 ? 'Put each number on the number line.' : `Put ${String(p.chips[0].label).replace(/^-/, '\u2212')} on the number line.`;
}
/**
 * Bar modes (build list vis_frac_bar_modes): the `model` value 'wall' draws the item's bars one
 * under another on the same whole with their left edges lined up (a fraction wall), the number
 * sentence on one line under them; the `labels` support writes each part's size in it (1/4).
 */
function _fBarModes(payload) {
    if (!payload || !Array.isArray(payload.terms)) return payload;
    if (payload.terms.some(t => t.kind === 'wall')) {
        payload.terms = payload.terms.map(t => (t.kind === 'wall' ? Object.assign({}, t, { kind: 'bar' }) : t));
        payload.wall = true;
        payload.modelTop = true;
        payload.wholeMm = 64;
    }
    // Line modes (vis_frac_line_modes): two fractions on number lines are two lines one under the
    // other, 0 under 0 and every whole under its whole, the same length (past 1 when a value is),
    // so equal fractions sit at one point and the bigger one lies further right.
    const lines = payload.terms.filter(t => t.kind === 'line');
    if (lines.length >= 2 && (payload.task === 'sign' || payload.task === 'op') && !payload.story) {
        payload.wall = true;
        payload.modelTop = true;
        payload.wholeMm = 64;
        payload.lineWholes = Math.max(1, ...lines.map(t => Math.ceil(((t.w || 0) * t.d + t.n) / t.d)));
        if (payload.lineWholes > 1) payload.wholeMm = Math.max(30, Math.floor(96 / payload.lineWholes));
    }
    // `lineHops` (a hint): arcs over the parts from 0 to the dot, on a write-the-fraction line
    const oh = state.skillOptions;
    if (oh && oh.lineHops === true && payload.task === 'write' && payload.terms.some(t => t.kind === 'line')) payload.hops = true;
    const o = state.skillOptions;
    if (o && o.partLabels === true && payload.terms.some(t => t.kind && t.kind !== 'line' && t.kind !== 'hundred')) payload.labels = 'unit';
    return payload;
}

/** A migrated item: the kit's `frac-model` cell for paper and key, its twin for every screen host. */
function _fKit(q, payload) {
    _fBarModes(payload);
    q.cell = { template: 'frac-model', v: 1, payload };
    q.visual = fracTwin(payload);
    // A sign is written in the circle on paper and tapped from the sign tiles on screen: never a
    // row of option buttons (a production item stays a production item, SP-3).
    if (payload.task === 'sign') q.options = [];
}

/** A story's sentences, one per line (P-WP-17): "Ann ate 2/8. Bo ate 3/8. How much?" -> 3 lines. */
const _fStoryLines = (text) => String(text).split(/(?<=[.?!])\s+/).map(t => t.trim()).filter(Boolean);

/**
 * A plain word problem (`*_plain`, generate-question.js): the kit sentence keeps its story and
 * its numbers and loses its pictures, on paper and on screen alike.
 */
export function fracPlainStrip(q) {
    if (!q || !q.cell || q.cell.template !== 'frac-model' || !q.cell.payload) return false;
    const p = Object.assign({}, q.cell.payload);
    p.terms = (p.terms || []).map(t => Object.assign({}, t, { kind: null }));
    delete p.area; delete p.stack; delete p.modelTop;
    q.cell = Object.assign({}, q.cell, { payload: p });
    q.visual = fracTwin(p);
    q.fractionModel = null;
    return true;
}

/** Pictures ticked off (the `pictures` option, strip): a kit sentence prints numbers only. */
function _fPicturesOff() {
    return !!(state.skillOptions && state.skillOptions.pictures === false);
}
/** The parts of an answer string: "1 3/8" -> {w:1, n:3, d:8}; "3/8" -> {n:3, d:8}; "2" -> {w:2}. */
function _fParts(str) {
    const t = String(str).trim();
    let m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(t);
    if (m) return { w: +m[1], n: +m[2], d: +m[3] };
    m = /^(\d+)\/(\d+)$/.exec(t);
    if (m) return { n: +m[1], d: +m[2] };
    return /^\d+$/.test(t) ? { w: +t, n: 0, d: 1 } : null;
}
/**
 * A fraction number sentence as the kit's `frac-model` cell: every term drawn as `kind` on one
 * whole (never the answer: RP-1), "=", and the answer boxes - a mixed number's three boxes when
 * the answer can be 1 or more (`mixed`), a fraction's two otherwise. Pictures off: numbers only.
 */
function _fSentenceKit(q, terms, ops, kind, { mixed = false, wholeMm = 26, stack = false, perRow = 0, area = null, barH = 0, story = null, modelTop = false, boxDigits = 0 } = {}) {
    const k = _fPicturesOff() ? null : kind;
    const a = _fParts(q.ans) || {};
    // the answer's boxes: a mixed number's three where the answer can reach 1, a fraction's two,
    // one box where the answer can only be a whole number (a whole divided by a unit fraction)
    const whole = !a.n && !mixed;
    const payload = {
        task: 'op',
        terms: [...terms.map(t => Object.assign({}, t, { kind: t.kind === null ? null : k })),
            { n: a.n || 0, d: a.d || 1, frac: mixed ? 'wnd' : whole ? 'w' : 'nd' }],
        joins: [...ops, '='],
        answer: { w: a.w || 0, n: a.n || 0, d: a.d || 1 },
        wholeMm,
    };
    if (stack && k) payload.stack = true;
    if (perRow) payload.perRow = perRow;
    if (barH) payload.barH = barH;
    if (area && !_fPicturesOff()) payload.area = area;
    if (Array.isArray(story) && story.length) { payload.story = story; payload.oneLine = true; }
    // `modelTop`: the first term's picture alone above, the whole sentence on one line under it
    if (modelTop && k) payload.modelTop = true;
    // one-digit answer boxes when every number of the answer is a single digit (a narrower
    // sentence keeps to one of two columns)
    if (boxDigits) payload.boxDigits = boxDigits;
    _fKit(q, payload);
    q.fractionModel = k;
}

/** `regroup` on the mixed-number add / subtract skills: 'none' | 'always', or null (some items). */
function _fRegroup() {
    const v = state.skillOptions && state.skillOptions.regroup;
    return v === 'none' || v === 'always' ? v : null;
}

/**
 * Two mixed-number fraction parts with one denominator, honouring `regroup` (options-r3 O2: the
 * essential difficulty step). Adding: the parts make a whole or more (regroup) or not. Taking away:
 * the second part is bigger than the first (borrow a whole) or not. `null` mixes them.
 */
function _fMixedParts(sub) {
    const rg = _fRegroup();
    const need = rg === 'always' ? true : rg === 'none' ? false : Math.random() < 0.5;
    // a page with no regrouping needs 3 parts at least (halves always regroup 1/2 + 1/2)
    const den = pick(need && !sub ? [2, 3, 4, 5, 6, 8] : [3, 4, 5, 6, 8]);
    let f1, f2;
    if (!sub) {
        if (need) { f1 = randInt(Math.ceil(den / 2), den - 1); f2 = randInt(Math.max(1, den - f1), den - 1); }
        else { f1 = randInt(1, den - 2); f2 = randInt(1, den - 1 - f1); }
    } else if (need) { f1 = randInt(1, den - 2); f2 = randInt(f1 + 1, den - 1); }
    else { f1 = randInt(2, den - 1); f2 = randInt(1, f1 - 1); }
    return { den, f1, f2, regroup: sub ? f2 > f1 : f1 + f2 >= den };
}

/**
 * compare `pairs` (options-r3 O2, the 3.NF.A.3d / 4.NF.A.2 ladder): 'like' one denominator,
 * 'sameNum' one numerator, 'unlike' both different; null mixes them. Never the same fraction twice.
 */
function _fComparePair(dens) {
    const v = state.skillOptions && state.skillOptions.pairs;
    const kind = v === 'like' || v === 'sameNum' || v === 'unlike' ? v : pick(['like', 'sameNum', 'unlike', 'unlike']);
    for (let t = 0; t < 40; t++) {
        const d1 = pick(dens);
        if (kind === 'like') {
            if (d1 < 3) continue;
            const n1 = randInt(1, d1 - 1);
            let n2 = randInt(1, d1 - 1);
            if (n2 === n1) n2 = n1 < d1 - 1 ? n1 + 1 : n1 - 1;
            return { n1, d1, n2, d2: d1 };
        }
        const d2 = pick(dens.filter(d => d !== d1));
        if (kind === 'sameNum') {
            const n = randInt(1, Math.min(d1, d2) - 1);
            return { n1: n, d1, n2: n, d2 };
        }
        const n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
        if (n1 === n2 || n1 * d2 === n2 * d1) continue;
        return { n1, d1, n2, d2 };
    }
    return { n1: 1, d1: 3, n2: 2, d2: 5 };
}

// P12: a SET option the teacher changed from its default (skill-options.js), else null.
function _fChanged(id) {
    let def = null;
    try { def = optionsFor(state.category, state.skill).find(o => o.id === id) || null; } catch (e) { def = null; }
    const o = state.skillOptions;
    if (!def || def.type !== 'set' || !o || !Array.isArray(o[id])) return null;
    const legal = def.values.map(x => x.v);
    const t = legal.filter(v => o[id].includes(v));
    const d = legal.filter(v => (def.default || []).includes(v));
    return t.length && !(t.length === d.length && t.every(v => d.includes(v))) ? t : null;
}

export function generateFractionsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

    // ========================================
    // GRADE 5 — COMPARE DECIMALS TO THOUSANDTHS (5.NBT.A.3)
    // ========================================
    if (mappedSkill === 'compare_thousandths') {
        // 25% chance of an equal pair (e.g. 0.450 vs 0.45)
        // P12: `forms` [0] different values only, [1] equal pairs only (a trailing zero changes nothing).
        let aStr, bStr, cmp;
        const _ctForms = _fChanged('forms');
        if (_ctForms ? _ctForms[0] === 1 : Math.random() < 0.25) {
            const base = randInt(10, 99) / 100; // hundredths value
            aStr = base.toFixed(3);              // padded thousandths
            bStr = base.toFixed(2);              // hundredths form
            cmp = '=';
        } else {
            const aN = randInt(100, 999) / 1000;
            let bN = randInt(100, 999) / 1000;
            if (aN === bN) bN = (bN + 0.001 <= 0.999) ? bN + 0.001 : bN - 0.001;
            aStr = aN.toFixed(3);
            bStr = bN.toFixed(3);
            cmp = aN < bN ? '<' : aN > bN ? '>' : '=';
        }
        // Dispatcher-style: mutate q in place, return void.
        q.text = `Compare: ${aStr} ___ ${bStr}  (use <, >, or =)`;
        q.ans = cmp;
        q.answerType = 'multiple-choice';
        q.options = ['<', '>', '='];
        q.hint = `Line up the decimal points. Compare digits from left to right (tenths, hundredths, thousandths).`;
        q.skillLabel = 'Compare Decimals · Thousandths';
        q.printFormat = 'compact';
        return;
    }

    // ========================================
    // GRADE 5 — ROUND DECIMALS TO THOUSANDTHS (5.NBT.A.4)
    // ========================================
    if (mappedSkill === 'round_thousandths') {
        const n = randInt(100, 999) / 1000;
        const place = (typeof pick === 'function') ? pick(['tenth', 'hundredth']) : (Math.random() < 0.5 ? 'tenth' : 'hundredth');
        const rounded = place === 'tenth' ? Math.round(n * 10) / 10 : Math.round(n * 100) / 100;
        // Dispatcher-style: mutate q in place, return void.
        q.text = `Round ${n.toFixed(3)} to the nearest ${place}.`;
        q.ans = place === 'tenth' ? rounded.toFixed(1) : rounded.toFixed(2);
        q.answerType = 'text';
        q.hint = `Look at the digit just to the right of the ${place} place. If it is 5 or more, round up; otherwise round down.`;
        q.skillLabel = `Round to Nearest ${place === 'tenth' ? 'Tenth' : 'Hundredth'}`;
        q.printFormat = 'standard';
        return;
    }


    // ===== PER-GRADE DENOMINATOR CAP (worksheet-feedback §8.1) =====
    // Grade 3 fractions: denominators ≤ 8. Grade 4 ≤ 12. Grade 5+ ≤ 100.
    // Skills that pick a denominator from a fixed pool or via rng(2, N) should
    // pass it through _capDen() to honor the grade-level cap. We expose the cap
    // as `_maxDen` so per-skill blocks can also filter their pick() pools when
    // the maximum candidate exceeds the cap.
    const _fracGrade = getSkillGrade(mappedSkill);
    const _maxDen = maxDenominatorForGrade(_fracGrade);
    const _capDen = (d) => Math.max(2, Math.min(d, _maxDen));
    const _filterDens = (arr) => {
        const filtered = arr.filter(d => d <= _maxDen);
        return filtered.length > 0 ? filtered : [Math.min(arr[0], _maxDen)];
    };

            // Use only denominators that give standard/clean decimal equivalents
            const standardFractions = [
                {n: 1, d: 2}, {n: 1, d: 3}, {n: 2, d: 3},
                {n: 1, d: 4}, {n: 2, d: 4}, {n: 3, d: 4},
                {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5},
                {n: 1, d: 6}, {n: 5, d: 6},
                {n: 1, d: 8}, {n: 3, d: 8}, {n: 5, d: 8}, {n: 7, d: 8}
            ];
            const frac = pick(standardFractions);
            const numerator = frac.n;
            const denominator = frac.d;

            // For mixed, pick random fraction skill with weighted distribution
            let fracSkill = mappedSkill;
            if (fracSkill === "mixed") {
                fracSkill = pick([
                    // Fractions - visual
                    "identify", "equivalent", "compare", "simplify", "improper_mixed",
                    "equiv_frac_visual", "fraction_of_set", "fraction_of_set_hard", "mixed_improper_visual",
                    "order_fractions", "order_frac_numline", "benchmark_fractions", "compare_frac_lcd",
                    "graph_fractions", "round_fractions",
                    // Fractions - NV
                    "identify_nv", "equiv_frac_nv", "fraction_of_set_nv", "fraction_of_set_hard_nv",
                    // Fraction operations - visual
                    "add_fractions_like", "sub_fractions_like", "add_mixed_like", "sub_mixed_like",
                    "add_frac_unlike", "sub_frac_unlike", "add_mixed_unlike", "sub_mixed_unlike",
                    "mult_frac_whole", "decompose_fractions", "frac_10_100",
                    "mult_frac_frac", "div_unit_fraction", "frac_as_division", "mult_scaling",
                    "frac_mult_word", "estimate_frac_ops",
                    // Fraction operations - NV
                    "add_frac_like_nv", "sub_frac_like_nv", "add_frac_unlike_nv", "sub_frac_unlike_nv",
                    "add_mixed_like_nv", "sub_mixed_like_nv", "add_mixed_unlike_nv", "sub_mixed_unlike_nv",
                    "mult_frac_whole_nv", "decompose_frac_nv", "frac_10_100_nv",
                    "mult_frac_frac_nv", "div_unit_frac_nv", "frac_as_div_nv", "mult_scaling_nv",
                    "frac_as_div_word"
                ]);
            }

            // --- Local helpers for fraction string formatting ---
            function _gcd(a, b) { return b === 0 ? Math.abs(a) : _gcd(b, a % b); }
            function _simplify(n, d) { const g = _gcd(n, d); return [n / g, d / g]; }
            function _fracStr(n, d) {
                if (n === 0) return "0";
                const [sn, sd] = _simplify(Math.abs(n), Math.abs(d));
                const sign = (n < 0) !== (d < 0) ? '-' : '';
                if (sd === 1) return sign + sn;
                if (sn > sd) return sign + Math.floor(sn / sd) + ' ' + (sn % sd) + '/' + sd;
                return sign + sn + '/' + sd;
            }
            // Build an SVG fraction bar (horizontal, inline)
            function _svgBar(num, den, w, h, fillColor, emptyColor) {
                const segW = w / den;
                let rects = '';
                for (let i = 0; i < den; i++) {
                    const fill = i < num ? fillColor : (emptyColor || 'var(--bg-card)');
                    const opacity = i < num ? '1' : '0.3';
                    rects += `<rect x="${i * segW}" y="0" width="${segW}" height="${h}" fill="${fill}" stroke="var(--text-bright)" stroke-width="1.5" opacity="${opacity}"/>`;
                }
                return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;margin:4px auto;">${rects}</svg>`;
            }
            // LCD helper
            function _lcm(a, b) { return (a * b) / _gcd(a, b); }

            // ==================== NEW FRACTION SKILLS ====================

            if (fracSkill === "add_fractions_like") {
                // Grade 4: Add fractions with SAME denominator
                const den = rng(2, 12);
                const maxNum = den - 1;
                // `sums` (options-r3 O2): the sum less than 1, or past 1 (an improper sum to write
                // as a mixed number); by default either
                const _sums = state.skillOptions && state.skillOptions.sums;
                const den2 = _sums === 'under' || _sums === 'over' ? Math.max(3, den) : den;
                let n1 = rng(1, maxNum);
                let n2 = rng(1, maxNum);
                if (_sums === 'under') { n1 = rng(1, den2 - 2); n2 = rng(1, den2 - 1 - n1); }
                else if (_sums === 'over') { n1 = rng(Math.ceil(den2 / 2), den2 - 1); n2 = rng(den2 - n1 + 1, den2 - 1); }
                else { n1 = Math.min(n1, den2 - 1); n2 = Math.min(n2, den2 - 1); }
                const sumNum = n1 + n2;
                const answer = _fracStr(sumNum, den2);

                q.text = `Calculate: ${n1}/${den2} + ${n2}/${den2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Same denominator! Add the numerators: ${n1} + ${n2} = ${sumNum}. Then simplify ${sumNum}/${den2} if possible.`;

                // KIT (O6 lane AP3): both fractions drawn on one whole as the ticked model (bars by
                // default), never the sum (RP-1); the pupil writes the sum in the boxes after "=".
                _fSentenceKit(q, [{ n: n1, d: den2 }, { n: n2, d: den2 }], ['+'], _fModelPick() || 'bar', { mixed: sumNum >= den2 });
                return;

            } else if (fracSkill === "sub_fractions_like") {
                // Grade 4: Subtract fractions with SAME denominator
                const den = rng(2, 12);
                let n1 = rng(2, den);
                let n2 = rng(1, n1 - 1);
                const diffNum = n1 - n2;
                const answer = _fracStr(diffNum, den);

                q.text = `Calculate: ${n1}/${den} \u2212 ${n2}/${den} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Same denominator! Subtract the numerators: ${n1} \u2212 ${n2} = ${diffNum}. Then simplify ${diffNum}/${den} if possible.`;

                // KIT (O6 lane AP3): both fractions drawn on one whole as the ticked model (bars by
                // default), never the difference (RP-1); the pupil writes it in the boxes after "=".
                _fSentenceKit(q, [{ n: n1, d: den }, { n: n2, d: den }], ['−'], _fModelPick() || 'bar', { mixed: diffNum >= den });
                return;

            } else if (fracSkill === "add_mixed_like") {
                // Grade 4: Add mixed numbers with SAME denominator; `regroup` sets whether the parts
                // make a whole
                const { den, f1, f2 } = _fMixedParts(false);
                // wholes 1 to 3 and 1 to 2: every mixed number fits two rows of bars
                const w1 = rng(1, 3);
                const w2 = rng(1, 2);
                const totalNum = (w1 * den + f1) + (w2 * den + f2);
                const answer = _fracStr(totalNum, den);

                q.text = `Calculate: ${w1} ${f1}/${den} + ${w2} ${f2}/${den} = ?`;
                q.ans = answer;
                q.answerType = "text";
                const fracSum = f1 + f2;
                const needsRegroup = fracSum >= den;
                q.hint = needsRegroup
                    ? `Add wholes: ${w1} + ${w2} = ${w1 + w2}. Add fractions: ${f1}/${den} + ${f2}/${den} = ${fracSum}/${den} = 1 ${fracSum - den}/${den}. Regroup!`
                    : `Add wholes: ${w1} + ${w2} = ${w1 + w2}. Add fractions: ${f1}/${den} + ${f2}/${den} = ${fracSum}/${den}.`;

                // KIT (O6 lane AP3): the two mixed numbers drawn as wholes and a part, one under the
                // other, in black and white on paper and screen; never the sum (RP-1). Bars unless
                // the teacher ticked other models.
                {
                    const _mk = _fModelPick() || 'bar';
                    _fSentenceKit(q, [{ w: w1, n: f1, d: den }, { w: w2, n: f2, d: den }], ['+'], _mk,
                        { mixed: true, wholeMm: _mk === 'line' ? 12 : 20, stack: true, perRow: 2, barH: 9 });
                }
                return;

            } else if (fracSkill === "sub_mixed_like") {
                // Grade 4: Subtract mixed numbers with SAME denominator; `regroup` sets whether a
                // whole is broken up (the second part bigger than the first). w1 > w2, so the
                // difference is always positive.
                const { den, f1, f2 } = _fMixedParts(true);
                const w1 = rng(2, 3);
                const w2 = rng(1, w1 - 1);
                const resultNum = (w1 * den + f1) - (w2 * den + f2);
                const answer = _fracStr(Math.max(0, resultNum), den);
                const needsBorrow = f1 < f2;

                q.text = `Calculate: ${w1} ${f1}/${den} \u2212 ${w2} ${f2}/${den} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = needsBorrow
                    ? `Since ${f1}/${den} < ${f2}/${den}, borrow 1 whole (${den}/${den}) from ${w1}. Then ${w1 - 1} ${f1 + den}/${den} \u2212 ${w2} ${f2}/${den}.`
                    : `Subtract wholes: ${w1} \u2212 ${w2} = ${w1 - w2}. Subtract fractions: ${f1}/${den} \u2212 ${f2}/${den} = ${f1 - f2}/${den}.`;

                // KIT (O6 lane AP3): the two mixed numbers drawn as wholes and a part, one under the
                // other, in black and white on paper and screen; never the sum (RP-1). Bars unless
                // the teacher ticked other models.
                {
                    const _mk = _fModelPick() || 'bar';
                    _fSentenceKit(q, [{ w: w1, n: f1, d: den }, { w: w2, n: f2, d: den }], ['\u2212'], _mk,
                        { mixed: true, wholeMm: _mk === 'line' ? 12 : 20, stack: true, perRow: 2, barH: 9 });
                }
                return;

            } else if (fracSkill === "mult_frac_whole") {
                // Grade 4: Multiply fraction x whole number
                const den = pick([2, 3, 4, 5, 6, 8]);
                const num = rng(1, den - 1);
                const whole = rng(2, 6);
                const prodNum = num * whole;
                const answer = _fracStr(prodNum, den);
                const showOrder = Math.random() < 0.5;

                q.text = showOrder
                    ? `Calculate: ${whole} × ${num}/${den} = ?`
                    : `Calculate: ${num}/${den} × ${whole} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Multiply the numerator by the whole number: ${num} × ${whole} = ${prodNum}. Keep the denominator: ${prodNum}/${den}. Simplify if needed.`;

                // KIT (O6 lane AP3): the whole number of equal groups of the fraction, each group a
                // model of n/d (4.NF.4a); the pupil counts the shaded parts, the answer is never drawn.
                {
                    const _mk = _fModelPick() || 'bar';
                    const _grp = { n: num, d: den, copies: whole };
                    const _wn = { w: whole, n: 0, d: 1, kind: null };
                    _fSentenceKit(q, showOrder ? [_wn, _grp] : [_grp, _wn], ['\u00d7'], _mk,
                        { mixed: prodNum >= den, wholeMm: 16, perRow: 2, barH: 9 });
                }
                return;

            } else if (fracSkill === "decompose_fractions") {
                // Grade 4 (4.NF.B.3b): decompose a fraction into unit fractions. KIT (fractions
                // lane): the fraction's model above (bars unless the teacher ticked another), and
                // "4/6 = 1/[ ] + 1/[ ] + 1/[ ] + 1/[ ]" under it: one unit fraction per shaded part,
                // the pupil writes the size of each part. Paper, key and screen are one drawing.
                const den = pick([2, 3, 4, 5, 6, 8]);
                const num = rng(2, Math.min(den, 6));
                const answer = Array.from({length: num}, () => `1/${den}`).join(' + ');

                q.text = `Write ${num}/${den} as a sum of unit fractions.`;
                q.ans = answer;
                q.answerType = "text";
                q.noSimplify = true;          // the sum itself, term by term (never evaluated to one fraction)
                q.options = [];
                q.hint = `A unit fraction has 1 as its numerator. The model has ${den} equal parts, so each part is 1/${den}. ${num} parts are shaded.`;
                const _dcModel = _fPicturesOff() ? null : (_fModelPick() || 'bar');
                const _dcTerms = [{ n: num, d: den, kind: _dcModel, frac: 'show' }];
                for (let i = 0; i < num; i++) _dcTerms.push({ n: 1, d: den, frac: 'd', ai: i });
                const _dcPayload = {
                    task: 'op', terms: _dcTerms, joins: ['=', ...Array(num - 1).fill('+')],
                    answer: { terms: Array.from({ length: num }, () => ({ n: 1, d: den })), text: answer },
                    wholeMm: _dcModel === 'circle' ? 40 : _dcModel === 'area' ? 48 : 56, modelTop: !!_dcModel,
                    boxDigits: den < 10 ? 1 : 2,
                };
                q.fractionModel = _dcModel;
                _fKit(q, _dcPayload);
                return;

            } else if (fracSkill === "frac_word_problems") {
                // Grade 4 (4.NF.B.3d): add and subtract fractions with one denominator in a story.
                // KIT (fractions lane): the story, one sentence per line with its fractions stacked,
                // over the number sentence the story makes - each fraction drawn as a bar on one
                // whole (the Visual skill) - and the answer boxes. The _plain twin prints the same
                // story and sentence without the bars (fracPlainStrip).
                const den = pick([4, 5, 6, 8, 10]);
                const items = [
                    {item: "pizza", unit: "of a pizza"},
                    {item: "chocolate bar", unit: "of a chocolate bar"},
                    {item: "pie", unit: "of a pie"},
                    {item: "cake", unit: "of a cake"},
                    {item: "watermelon", unit: "of a watermelon"}
                ];
                const [name1, name2] = pickTwoNames();
                const thing = pick(items);
                const isAdd = Math.random() < 0.6;

                let n1, n2, resultNum, questionText;
                if (isAdd) {
                    n1 = rng(1, Math.floor(den / 2));
                    n2 = rng(1, Math.floor(den / 2));
                    resultNum = n1 + n2;
                    questionText = `${name1} ate ${n1}/${den} ${thing.unit}. ${name2} ate ${n2}/${den} ${thing.unit}. How much did they eat in all?`;
                } else {
                    n1 = rng(Math.floor(den / 2) + 1, den - 1);
                    n2 = rng(1, n1 - 1);
                    resultNum = n1 - n2;
                    questionText = `${name1} had ${n1}/${den} ${thing.unit}. ${name2} ate ${n2}/${den} ${thing.unit}. How much is left?`;
                }
                const answer = _fracStr(resultNum, den);

                q.text = questionText;
                q.ans = answer;
                q.answerType = "text";
                q.options = [];
                if (answer !== `${resultNum}/${den}`) q.acceptedAnswers = [answer, `${resultNum}/${den}`];
                q.hint = isAdd
                    ? `Add the fractions: ${n1}/${den} + ${n2}/${den} = ${resultNum}/${den}. Simplify if you can.`
                    : `Subtract: ${n1}/${den} \u2212 ${n2}/${den} = ${resultNum}/${den}. Simplify if you can.`;
                _fSentenceKit(q, [{ n: n1, d: den }, { n: n2, d: den }], [isAdd ? '+' : '\u2212'], 'bar',
                    { mixed: resultNum >= den, wholeMm: 30, story: _fStoryLines(questionText) });
                return;

            } else if (fracSkill === "frac_10_100") {
                // Grade 4 (4.NF.C.5): tenths as hundredths, and back. KIT (fractions lane): the
                // given fraction drawn as ONE hundred square (columns are tenths, cells hundredths,
                // sheet/cells/hundred-square.js), "7/10 = [ ]/100" beside it. 7 columns shaded are
                // 70 cells: the square shows both names at once. Pictures off: the sentence alone.
                const toTenths = Math.random() < 0.35;
                const num10 = rng(1, 9);
                const num100 = num10 * 10;
                if (toTenths) {
                    q.text = `Write ${num100}/100 as a fraction with denominator 10.`;
                    q.ans = `${num10}/10`;
                    q.hint = `Every 10 hundredths make 1 tenth (one column of the square). ${num100} ÷ 10 = ${num10}.`;
                } else {
                    q.text = `Write ${num10}/10 as a fraction with denominator 100.`;
                    q.ans = `${num100}/100`;
                    q.hint = `Each tenth is a column of 10 hundredths. ${num10} × 10 = ${num100}.`;
                }
                q.answerType = "text";
                q.noSimplify = true;
                q.options = [];
                const _thKind = _fPicturesOff() ? null : 'hundred';
                const _thA = toTenths ? { n: num100, d: 100 } : { n: num10, d: 10 };
                const _thB = toTenths ? { n: num10, d: 10 } : { n: num100, d: 100 };
                q.fractionModel = _thKind;
                _fKit(q, { task: 'op', terms: [Object.assign({ kind: _thKind }, _thA), Object.assign({ frac: 'n' }, _thB)],
                    joins: ['='], answer: _thB, modelTop: !!_thKind });
                return;

            } else if (fracSkill === "add_frac_unlike") {
                // Grade 5: Add fractions with UNLIKE denominators
                const denOptions = [2, 3, 4, 5, 6, 8, 10, 12];
                let d1 = pick(denOptions);
                let d2 = pick(denOptions);
                while (d1 === d2) d2 = pick(denOptions);
                const n1 = rng(1, d1 - 1);
                const n2 = rng(1, d2 - 1);
                const lcd = _lcm(d1, d2);
                const conv1 = n1 * (lcd / d1);
                const conv2 = n2 * (lcd / d2);
                const sumNum = conv1 + conv2;
                const answer = _fracStr(sumNum, lcd);

                q.text = `Calculate: ${n1}/${d1} + ${n2}/${d2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Find LCD = ${lcd}. Convert: ${n1}/${d1} = ${conv1}/${lcd} and ${n2}/${d2} = ${conv2}/${lcd}. Add: ${conv1}/${lcd} + ${conv2}/${lcd} = ${sumNum}/${lcd}. Simplify.`;

                // KIT (O6 lane AP3): both fractions drawn on the same whole, each cut into its own
                // parts - the pupil finds the common denominator; never the answer (RP-1).
                {
                    const _mk = _fModelPick() || 'bar';
                    _fSentenceKit(q, [{ n: n1, d: d1 }, { n: n2, d: d2 }], ['+'], _mk,
                        { mixed: sumNum >= lcd, wholeMm: _mk === 'line' ? 40 : 26 });
                }
                return;

            } else if (fracSkill === "sub_frac_unlike") {
                // Grade 5: Subtract fractions with UNLIKE denominators
                const denOptions = [2, 3, 4, 5, 6, 8, 10, 12];
                let d1 = pick(denOptions);
                let d2 = pick(denOptions);
                while (d1 === d2) d2 = pick(denOptions);
                let n1 = rng(1, d1 - 1);
                let n2 = rng(1, d2 - 1);
                const lcd = _lcm(d1, d2);
                let conv1 = n1 * (lcd / d1);
                let conv2 = n2 * (lcd / d2);
                // Ensure positive result
                if (conv1 < conv2) {
                    [n1, n2] = [n2, n1];
                    [d1, d2] = [d2, d1];
                    [conv1, conv2] = [conv2, conv1];
                }
                const diffNum = conv1 - conv2;
                const answer = _fracStr(diffNum, lcd);

                q.text = `Calculate: ${n1}/${d1} \u2212 ${n2}/${d2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Find LCD = ${lcd}. Convert: ${n1}/${d1} = ${conv1}/${lcd} and ${n2}/${d2} = ${conv2}/${lcd}. Subtract: ${conv1}/${lcd} \u2212 ${conv2}/${lcd} = ${diffNum}/${lcd}. Simplify.`;

                // KIT (O6 lane AP3): both fractions drawn on the same whole, each cut into its own
                // parts - the pupil finds the common denominator; never the answer (RP-1).
                {
                    const _mk = _fModelPick() || 'bar';
                    _fSentenceKit(q, [{ n: n1, d: d1 }, { n: n2, d: d2 }], ['\u2212'], _mk,
                        { mixed: false, wholeMm: _mk === 'line' ? 40 : 26 });
                }
                return;

            } else if (fracSkill === "add_mixed_unlike") {
                // Grade 5: Add mixed numbers with UNLIKE denominators
                const denPairs = [{d1:2,d2:3},{d1:2,d2:4},{d1:3,d2:4},{d1:2,d2:6},{d1:3,d2:6},{d1:4,d2:8},{d1:2,d2:5},{d1:5,d2:10}];
                const dp = pick(denPairs);
                const d1 = dp.d1, d2 = dp.d2;
                const lcd = _lcm(d1, d2);
                const w1 = rng(1, 4);
                const f1 = rng(1, d1 - 1);
                const w2 = rng(1, 3);
                const f2 = rng(1, d2 - 1);
                const totalImp = (w1 * d1 + f1) * (lcd / d1) + (w2 * d2 + f2) * (lcd / d2);
                const answer = _fracStr(totalImp, lcd);
                const conv1 = f1 * (lcd / d1);
                const conv2 = f2 * (lcd / d2);
                const fracSum = conv1 + conv2;

                q.text = `Calculate: ${w1} ${f1}/${d1} + ${w2} ${f2}/${d2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Find LCD = ${lcd}. Convert fractions: ${f1}/${d1} = ${conv1}/${lcd}, ${f2}/${d2} = ${conv2}/${lcd}. Add wholes: ${w1} + ${w2} = ${w1 + w2}. Add fractions: ${conv1}/${lcd} + ${conv2}/${lcd} = ${fracSum}/${lcd}. Simplify.`;

                // KIT (O6 lane AP3): the two mixed numbers drawn as wholes and a part, one under the
                // other, in black and white on paper and screen; never the sum (RP-1). Bars unless
                // the teacher ticked other models.
                {
                    const _mk = _fModelPick() || 'bar';
                    _fSentenceKit(q, [{ w: w1, n: f1, d: d1 }, { w: w2, n: f2, d: d2 }], ['+'], _mk,
                        { mixed: true, wholeMm: _mk === 'line' ? 12 : 20, stack: true, perRow: 2, barH: 9 });
                }
                return;

            } else if (fracSkill === "sub_mixed_unlike") {
                // Grade 5: Subtract mixed numbers with UNLIKE denominators
                const denPairs = [{d1:2,d2:3},{d1:2,d2:4},{d1:3,d2:4},{d1:2,d2:6},{d1:3,d2:6},{d1:4,d2:8},{d1:2,d2:5},{d1:5,d2:10}];
                const dp = pick(denPairs);
                const d1 = dp.d1, d2 = dp.d2;
                const lcd = _lcm(d1, d2);
                let w1 = rng(2, 5);
                const f1 = rng(1, d1 - 1);
                let w2 = rng(1, w1 - 1);
                const f2 = rng(1, d2 - 1);
                const total1 = (w1 * d1 + f1) * (lcd / d1);
                const total2 = (w2 * d2 + f2) * (lcd / d2);
                // Ensure positive
                if (total1 <= total2) {
                    w1 = w2 + 2;
                }
                const newTotal1 = (w1 * d1 + f1) * (lcd / d1);
                const diffImp = newTotal1 - total2;
                const answer = _fracStr(Math.max(0, diffImp), lcd);
                const conv1 = f1 * (lcd / d1);
                const conv2 = f2 * (lcd / d2);
                const needsBorrow = conv1 < conv2;

                q.text = `Calculate: ${w1} ${f1}/${d1} \u2212 ${w2} ${f2}/${d2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Find LCD = ${lcd}. Convert: ${f1}/${d1} = ${conv1}/${lcd}, ${f2}/${d2} = ${conv2}/${lcd}.${needsBorrow ? ` Since ${conv1}/${lcd} < ${conv2}/${lcd}, borrow 1 whole (${lcd}/${lcd}).` : ''} Subtract.`;

                // KIT (O6 lane AP3): the two mixed numbers drawn as wholes and a part, one under the
                // other, in black and white on paper and screen; never the sum (RP-1). Bars unless
                // the teacher ticked other models.
                {
                    const _mk = _fModelPick() || 'bar';
                    _fSentenceKit(q, [{ w: w1, n: f1, d: d1 }, { w: w2, n: f2, d: d2 }], ['\u2212'], _mk,
                        { mixed: true, wholeMm: _mk === 'line' ? 12 : 20, stack: true, perRow: 2, barH: 9 });
                }
                return;

            // ==================== NON-VISUAL ADD/SUB FRACTION SKILLS ====================

            } else if (fracSkill === "add_frac_like_nv" || fracSkill === "sub_frac_like_nv") {
                // Grade 4 (4.NF.B.3a): add or subtract fractions with one denominator, numbers only.
                // KIT (fractions lane; options-r3 O4: the page ignored the ticked item type and
                // printed 2-3 legacy cells): three forms, the `forms` option, each exactly what its
                // label says -
                //   straight     2/6 + 3/6 = [ ]/[ ]      (any equal answer is right on screen)
                //   missing_num  2/6 + [ ]/6 = 5/6
                //   simplify     2/6 + 2/6 = [ ]/[ ] in simplest form (a mixed number past 1)
                // The old sort-into-bins form was legacy print only and is gone.
                const sub = fracSkill === "sub_frac_like_nv";
                const op = sub ? '\u2212' : '+';
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant(fracSkill, ["straight", "missing_num", "simplify"])
                    : pick(['straight', 'missing_num', 'simplify']);
                q._variant = roll;
                const den = rng(3, 12);
                // `sums` (adding): the sum under 1 or past 1; by default either
                const _sums = !sub && state.skillOptions && state.skillOptions.sums;
                let n1, n2;
                if (sub) { n1 = rng(2, den); n2 = rng(1, n1 - 1); }
                else if (_sums === 'under') { n1 = rng(1, den - 2); n2 = rng(1, den - 1 - n1); }
                else if (_sums === 'over') { n1 = rng(Math.ceil(den / 2), den - 1); n2 = rng(den - n1 + 1, den - 1); }
                else { n1 = rng(1, den - 1); n2 = rng(1, den - 1); }
                // a whole-number sum has no fraction to write or simplify: one part less
                if (!sub && n1 + n2 === den) { if (n2 > 1) n2 -= 1; else n1 -= 1; }
                const res = sub ? n1 - n2 : n1 + n2;
                q.answerType = 'text';
                q.options = [];
                q.skillLabel = sub ? 'Subtract Fractions (Like)' : 'Add Fractions (Like)';
                if (roll === 'missing_num') {
                    q.text = `${n1}/${den} ${op} ?/${den} = ${res}/${den}. Find the missing numerator.`;
                    q.ans = String(n2);
                    q.hint = sub ? `${n1} take away what makes ${res}? ${n1} \u2212 ${res} = ${n2}.` : `What plus ${n1} makes ${res}? ${res} \u2212 ${n1} = ${n2}.`;
                    _fKit(q, { task: 'op', terms: [{ n: n1, d: den }, { n: n2, d: den, frac: 'n' }, { n: res, d: den }], joins: [op, '='], answer: { n: n2, d: den }, boxDigits: n2 < 10 ? 1 : 2 });
                    return;
                }
                if (roll === 'simplify') {
                    q.text = `${sub ? 'Subtract' : 'Add'} and simplify: ${n1}/${den} ${op} ${n2}/${den}`;
                    q.ans = _fracStr(res, den);
                    const [sn, sd] = _simplify(res, den);
                    q.hint = `${n1} ${op} ${n2} = ${res}. So the answer is ${res}/${den}${sn !== res || sd !== den ? ` = ${sn}/${sd}` : ''}.${res > den ? ` Past 1: write it as ${_fracStr(res, den)}.` : ''}`;
                    _fSentenceKit(q, [{ n: n1, d: den }, { n: n2, d: den }], [op], null, { mixed: res > den, boxDigits: den < 10 ? 1 : 2 });
                    return;
                }
                q.text = `${n1}/${den} ${op} ${n2}/${den} = ?`;
                q.ans = `${res}/${den}`;
                q.noSimplify = false;
                q.hint = `Same denominator: ${sub ? 'subtract' : 'add'} the numerators. ${n1} ${op} ${n2} = ${res}. The denominator stays ${den}.`;
                _fSentenceKit(q, [{ n: n1, d: den }, { n: n2, d: den }], [op], null, { mixed: false, boxDigits: den < 10 && res < 10 ? 1 : 2 });
                return;

            } else if (fracSkill === "add_frac_unlike_nv" || fracSkill === "sub_frac_unlike_nv") {
                // Grade 5 (5.NF.A.1): add or subtract fractions with different denominators, numbers
                // only. KIT (fractions lane; options-r3 O4: each form printed another form's item
                // in a legacy cell). Each form is what its label says -
                //   straight     1/2 + 1/3 = [ ]/[ ]       (any equal answer is right on screen)
                //   missing_num  1/2 + [ ]/3 = 5/6
                //   simplify     the same, the answer in simplest form (a mixed number past 1)
                const sub = fracSkill === "sub_frac_unlike_nv";
                const op = sub ? '\u2212' : '+';
                const denPairs = [[2,3],[2,4],[3,4],[2,5],[3,5],[4,5],[2,6],[3,6],[4,6],[5,6],[2,8],[3,8],[4,8],[5,10],[2,10],[3,10],[4,10],[6,10],[2,12],[3,12],[4,12],[6,12]];
                const [d1, d2] = pick(denPairs);
                const lcd = _lcm(d1, d2);
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant(fracSkill, ["straight", "missing_num", "simplify"])
                    : pick(['straight', 'missing_num', 'simplify']);
                q._variant = roll;
                let n1, n2, c1, c2, t = 0;
                do {
                    n1 = rng(1, d1 - 1); n2 = rng(1, d2 - 1);
                    c1 = n1 * (lcd / d1); c2 = n2 * (lcd / d2);
                } while (((sub && c1 <= c2) || (!sub && (c1 + c2) % lcd === 0)) && ++t < 40);
                if (sub && c1 <= c2) { n1 = d1 - 1; n2 = 1; c1 = n1 * (lcd / d1); c2 = lcd / d2; }
                const res = sub ? c1 - c2 : c1 + c2;
                q.answerType = 'text';
                q.options = [];
                q.skillLabel = sub ? 'Subtract Fractions (Unlike)' : 'Add Fractions (Unlike)';
                if (roll === 'missing_num') {
                    q.text = `${n1}/${d1} ${op} ?/${d2} = ${res}/${lcd}. Find the missing numerator.`;
                    q.ans = String(n2);
                    q.hint = `${n1}/${d1} = ${c1}/${lcd}. ${sub ? `${c1} \u2212 ${res}` : `${res} \u2212 ${c1}`} = ${c2}, so the missing fraction is ${c2}/${lcd} = ${n2}/${d2}.`;
                    _fKit(q, { task: 'op', terms: [{ n: n1, d: d1 }, { n: n2, d: d2, frac: 'n' }, { n: res, d: lcd }], joins: [op, '='], answer: { n: n2, d: d2 }, boxDigits: 1 });
                    return;
                }
                q.hint = `Make the denominators the same: ${lcd}. ${n1}/${d1} = ${c1}/${lcd}, ${n2}/${d2} = ${c2}/${lcd}. ${c1} ${op} ${c2} = ${res}.`;
                if (roll === 'simplify') {
                    q.text = `${sub ? 'Subtract' : 'Add'} and simplify: ${n1}/${d1} ${op} ${n2}/${d2}`;
                    q.ans = _fracStr(res, lcd);
                    _fSentenceKit(q, [{ n: n1, d: d1 }, { n: n2, d: d2 }], [op], null, { mixed: res > lcd, boxDigits: lcd < 10 ? 1 : 2 });
                    return;
                }
                q.text = `${n1}/${d1} ${op} ${n2}/${d2} = ?`;
                q.ans = `${res}/${lcd}`;
                _fSentenceKit(q, [{ n: n1, d: d1 }, { n: n2, d: d2 }], [op], null, { mixed: false, boxDigits: lcd < 10 && res < 10 ? 1 : 2 });
                return;

            } else if (fracSkill === "add_mixed_like_nv" || fracSkill === "sub_mixed_like_nv") {
                // Grade 4 (4.NF.B.3c): add or subtract mixed numbers with one denominator, numbers
                // only. KIT (fractions lane; options-r3 O4: "Work it out and simplify" printed
                // missing-number items). Each form is what its label says -
                //   straight  2 1/4 + 1 3/4 = [ ] [ ]/[ ]   (regrouped, the fraction part as it comes)
                //   missing   2 1/4 + [ ] [ ]/[ ] = 4
                //   simplify  the same sum, the answer in simplest form
                // and `regroup` sets whether the parts make a whole (or a whole is broken up).
                const sub = fracSkill === "sub_mixed_like_nv";
                const op = sub ? '\u2212' : '+';
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant(fracSkill, ["straight", "missing", "simplify"])
                    : pick(['straight', 'missing', 'simplify']);
                q._variant = roll;
                const { den, f1, f2, regroup } = _fMixedParts(sub);
                const w1 = sub ? rng(2, 9) : rng(1, 8);
                const w2 = sub ? rng(1, w1 - 1) : rng(1, 9 - w1);
                const t1 = w1 * den + f1, t2 = w2 * den + f2;
                const tot = sub ? t1 - t2 : t1 + t2;
                const raw = (v) => { const w = Math.floor(v / den), r = v % den; return w && r ? `${w} ${r}/${den}` : w ? String(w) : `${r}/${den}`; };
                q.answerType = 'text';
                q.options = [];
                q.skillLabel = sub ? 'Subtract Mixed (Like)' : 'Add Mixed (Like)';
                if (roll === 'missing') {
                    const tw = Math.floor(tot / den), tn = tot % den;
                    q.text = `${w1} ${f1}/${den} ${op} ? = ${raw(tot)}. Find the missing number.`;
                    q.ans = raw(t2);
                    q.hint = sub ? `${w1} ${f1}/${den} \u2212 ${raw(tot)} = ${raw(t2)}.` : `${raw(tot)} \u2212 ${w1} ${f1}/${den} = ${raw(t2)}.`;
                    _fKit(q, { task: 'op', terms: [{ w: w1, n: f1, d: den }, { w: w2, n: f2, d: den, frac: 'wnd' }, { w: tw, n: tn, d: tn ? den : 1 }],
                        joins: [op, '='], answer: { w: w2, n: f2, d: den }, boxDigits: 1 });
                    return;
                }
                q.text = `${w1} ${f1}/${den} ${op} ${w2} ${f2}/${den} = ?`;
                q.ans = roll === 'simplify' ? _fracStr(tot, den) : raw(tot);
                q.hint = sub
                    ? (regroup ? `${f1}/${den} is less than ${f2}/${den}: break a whole. ${w1} ${f1}/${den} = ${w1 - 1} ${f1 + den}/${den}. Then subtract.` : `Subtract the wholes: ${w1} \u2212 ${w2} = ${w1 - w2}. Subtract the parts: ${f1} \u2212 ${f2} = ${f1 - f2}.`)
                    : (regroup ? `Add the wholes: ${w1 + w2}. Add the parts: ${f1 + f2}/${den} = 1 ${f1 + f2 - den}/${den}. Regroup the whole.` : `Add the wholes: ${w1 + w2}. Add the parts: ${f1 + f2}/${den}.`);
                if (roll === 'simplify') q.text = `${sub ? 'Subtract' : 'Add'} and simplify: ${w1} ${f1}/${den} ${op} ${w2} ${f2}/${den}`;
                _fSentenceKit(q, [{ w: w1, n: f1, d: den }, { w: w2, n: f2, d: den }], [op], null, { mixed: true, boxDigits: tot < 10 * den ? 1 : 2 });
                return;

            } else if (fracSkill === "add_mixed_unlike_nv" || fracSkill === "sub_mixed_unlike_nv") {
                // Grade 5 (5.NF.A.1): add or subtract mixed numbers with different denominators,
                // numbers only. KIT (fractions lane; options-r3 O4: the forms printed each other's
                // items in legacy cells). Each form is what its label says -
                //   straight  2 1/2 + 1 1/3 = [ ] [ ]/[ ]   (in the common denominator)
                //   missing   2 1/2 + [ ] [ ]/[ ] = 3 5/6
                //   simplify  (adding only) the answer in simplest form
                const sub = fracSkill === "sub_mixed_unlike_nv";
                const op = sub ? '\u2212' : '+';
                const denPairs = [[2,3],[2,4],[3,4],[2,5],[3,5],[4,5],[2,6],[3,6],[4,6],[5,6],[2,8],[3,8],[4,8],[5,10],[2,10],[3,10],[4,10],[6,10],[2,12],[3,12],[4,12],[6,12]];
                const [d1, d2] = pick(denPairs);
                const lcd = _lcm(d1, d2);
                const forms = sub ? ["straight", "missing"] : ["straight", "missing", "simplify"];
                const roll = (typeof window !== 'undefined' && window.pickVariant) ? window.pickVariant(fracSkill, forms) : pick(forms);
                q._variant = roll;
                const f1 = rng(1, d1 - 1), f2 = rng(1, d2 - 1);
                const w1 = sub ? rng(2, 6) : rng(1, 5);
                const w2 = sub ? rng(1, w1 - 1) : rng(1, 4);
                const t1 = (w1 * d1 + f1) * (lcd / d1), t2 = (w2 * d2 + f2) * (lcd / d2);
                const tot = sub ? t1 - t2 : t1 + t2;
                const raw = (v) => { const w = Math.floor(v / lcd), r = v % lcd; return w && r ? `${w} ${r}/${lcd}` : w ? String(w) : `${r}/${lcd}`; };
                q.answerType = 'text';
                q.options = [];
                q.skillLabel = sub ? 'Subtract Mixed (Unlike)' : 'Add Mixed (Unlike)';
                const big = lcd >= 10 || tot >= 10 * lcd;
                if (roll === 'missing') {
                    const tw = Math.floor(tot / lcd), tn = tot % lcd;
                    q.text = `${w1} ${f1}/${d1} ${op} ? = ${raw(tot)}. Find the missing number.`;
                    q.ans = `${w2} ${f2}/${d2}`;
                    q.hint = sub ? `${w1} ${f1}/${d1} \u2212 ${raw(tot)} = ${w2} ${f2}/${d2}.` : `${raw(tot)} \u2212 ${w1} ${f1}/${d1} = ${w2} ${f2}/${d2}.`;
                    _fKit(q, { task: 'op', terms: [{ w: w1, n: f1, d: d1 }, { w: w2, n: f2, d: d2, frac: 'wnd' }, { w: tw, n: tn, d: tn ? lcd : 1 }],
                        joins: [op, '='], answer: { w: w2, n: f2, d: d2 }, boxDigits: d2 >= 10 ? 2 : 1 });
                    return;
                }
                q.text = roll === 'simplify' ? `${sub ? 'Subtract' : 'Add'} and simplify: ${w1} ${f1}/${d1} ${op} ${w2} ${f2}/${d2}` : `${w1} ${f1}/${d1} ${op} ${w2} ${f2}/${d2} = ?`;
                q.ans = roll === 'simplify' ? _fracStr(tot, lcd) : raw(tot);
                q.hint = `Make the denominators the same: ${lcd}. ${f1}/${d1} = ${f1 * (lcd / d1)}/${lcd}, ${f2}/${d2} = ${f2 * (lcd / d2)}/${lcd}. Then ${sub ? 'subtract' : 'add'} the wholes and the parts.`;
                _fSentenceKit(q, [{ w: w1, n: f1, d: d1 }, { w: w2, n: f2, d: d2 }], [op], null, { mixed: true, boxDigits: big ? 2 : 1 });
                return;

            } else if (fracSkill === "identify_nv") {
                // Grade 3: Identify Fractions (no visual)
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('identify_nv', ["type1","type2","type3"])
                    : (Math.random() < 0.5 ? 'type1' : (Math.random() < 0.5 ? 'type2' : 'type3'));
                q._variant = roll;
                if (roll === 'type1') {
                    // Type 1: "What fraction is shaded? X out of Y parts"
                    const den = rng(2, 10);
                    const num = rng(1, den - 1);
                    q.text = `What fraction is shaded? ${num} out of ${den} parts are shaded.`;
                    q.ans = _fracStr(num, den);
                    q.hint = `The shaded parts are the numerator (${num}) and the total parts are the denominator (${den}). The fraction is ${num}/${den}.`;
                } else if (roll === 'type2') {
                    // Type 2: "Write the fraction: numerator X, denominator Y"
                    const den = rng(2, 12);
                    const num = rng(1, den - 1);
                    q.text = `Write the fraction: numerator ${num}, denominator ${den}.`;
                    q.ans = _fracStr(num, den);
                    q.hint = `The numerator goes on top and the denominator goes on the bottom: ${num}/${den}.`;
                } else {
                    // Type 3: Word problem context
                    const contexts = [
                        { item: "pizza", unit: "slices", den: rng(4, 10) },
                        { item: "pie", unit: "pieces", den: rng(4, 8) },
                        { item: "chocolate bar", unit: "squares", den: rng(4, 12) },
                        { item: "cake", unit: "slices", den: rng(4, 8) }
                    ];
                    const ctx = pick(contexts);
                    const num = rng(1, ctx.den - 1);
                    q.text = `A ${ctx.item} is cut into ${ctx.den} ${ctx.unit}. You eat ${num} ${ctx.unit}. What fraction did you eat?`;
                    q.ans = _fracStr(num, ctx.den);
                    q.hint = `You ate ${num} out of ${ctx.den} ${ctx.unit}, so the fraction is ${num}/${ctx.den}. Simplify if possible.`;
                }
                q.answerType = "text";
                q.printFormat = "identify-nv";
                q.skillLabel = "Identify Frac";
                return;

            } else if (fracSkill === "fraction_of_set_nv" && Math.random() < 0.25) {
                // Phase 4.5 batch 9: multi-select-check variant — pick equivalent fraction expressions
                const den = rng(2, 6);
                const mult = rng(2, 5);
                const total = den * mult;
                const correctVal = mult; // 1/den of total
                // Generate options: a mix of correct and incorrect numerical expressions
                const correctOpts = [
                    `${total} ÷ ${den}`,
                    `1/${den} of ${total}`,
                    `${total}/${den}`
                ];
                const wrongOpts = [
                    `${total} ÷ ${den + 1}`,
                    `${total} ÷ ${Math.max(1, den - 1)}`,
                    `1/${den + 1} of ${total}`,
                    `${den}/${total}`,
                    `${total} × ${den}`,
                    `${den + total}`,
                    `${total - den}`
                ];
                const cCount = randInt(2, 3);
                const wCount = 6 - cCount;
                const chosenC = shuffle(correctOpts.slice()).slice(0, cCount);
                const seen = new Set(chosenC);
                const chosenW = [];
                let safety = 0;
                while (chosenW.length < wCount && safety < 30) {
                    safety++;
                    const w = pick(wrongOpts);
                    if (!seen.has(w)) { seen.add(w); chosenW.push(w); }
                }
                while (chosenW.length < wCount) chosenW.push(`${total + chosenW.length}`);
                const all = shuffle([
                    ...chosenC.map(label => ({ label, correct: true })),
                    ...chosenW.map(label => ({ label, correct: false }))
                ]);
                const opts = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL expressions equal to 1/${den} of ${total}.`;
                q.answerType = 'multi-select-check';
                q.options = opts;
                q.ans = ans;
                q.hint = `1/${den} of ${total} = ${correctVal}. Each correct expression evaluates to ${correctVal}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Frac of Set';
                return;
            } else if (fracSkill === "fraction_of_set_nv") {
                // Grade 3: Fraction of a Set (no visual)
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('fraction_of_set_nv', ["type1","type2","type3"])
                    : (Math.random() < 0.5 ? 'type1' : (Math.random() < 0.5 ? 'type2' : 'type3'));
                q._variant = roll;
                if (roll === 'type1') {
                    // Type 1: "What is 1/d of N?"
                    const den = rng(2, 8);
                    const mult = rng(2, 6);
                    const total = den * mult;
                    q.text = `What is 1/${den} of ${total}?`;
                    q.ans = mult;
                    q.answerType = "number";
                    q.hint = `Divide ${total} by ${den}: ${total} ÷ ${den} = ${mult}.`;
                } else if (roll === 'type2') {
                    // Type 2: "What is n/d of N?"
                    const den = rng(2, 8);
                    const num = rng(2, den - 1);
                    const mult = rng(2, 5);
                    const total = den * mult;
                    const answer = num * mult;
                    q.text = `What is ${num}/${den} of ${total}?`;
                    q.ans = answer;
                    q.answerType = "number";
                    q.hint = `First find 1/${den} of ${total}: ${total} ÷ ${den} = ${mult}. Then multiply by ${num}: ${mult} × ${num} = ${answer}.`;
                } else {
                    // Type 3: Word problem
                    const den = rng(2, 8);
                    const num = rng(1, den - 1);
                    const mult = rng(2, 5);
                    const total = den * mult;
                    const answer = num * mult;
                    const items = pick(["marbles", "stickers", "crayons", "cookies", "buttons", "beads"]);
                    const colors = pick(["blue", "red", "green", "yellow", "purple", "orange"]);
                    q.text = `There are ${total} ${items}. ${num}/${den} are ${colors}. How many are ${colors}?`;
                    q.ans = String(answer);
                    q.answerType = "text";
                    q.hint = `Find ${num}/${den} of ${total}: divide ${total} ÷ ${den} = ${mult}, then multiply ${mult} × ${num} = ${answer}.`;
                }
                q.printFormat = "fraction-of-set-nv";
                q.skillLabel = "Frac of Set";
                return;

            } else if (fracSkill === "fraction_of_set_hard_nv") {
                // Grade 4-5: a fraction of an amount, and finding the whole (build list
                // frac_find_whole, WRM Y6.B4.S7). KIT (fractions lane): the frac-model `amount`
                // task - "3/5 of 40 = [ ]", "3/5 of [ ] = 24", or a short story over it - with the
                // BAR MODEL as a support the teacher switches on (`barModel`): d equal boxes, a brace
                // over the n known boxes and one under the whole, the unknown marked "?".
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('fraction_of_set_hard_nv', ["type1","type2","type3"])
                    : (Math.random() < 0.5 ? 'type1' : (Math.random() < 0.5 ? 'type2' : 'type3'));
                q._variant = roll;
                const _bar = !!(state.skillOptions && state.skillOptions.barModel === true);
                let _am;
                if (roll === 'type1') {
                    // Type 1: "What is n/d of N?" with larger numbers
                    const den = rng(3, 12);
                    const num = rng(2, Math.min(5, den - 1));
                    const mult = rng(3, Math.floor(100 / den));
                    const total = den * mult;
                    const answer = num * mult;
                    q.text = `What is ${num}/${den} of ${total}?`;
                    q.ans = answer;
                    q.answerType = "number";
                    q.hint = `Divide ${total} by ${den}: ${total} ÷ ${den} = ${mult}. Multiply by ${num}: ${mult} × ${num} = ${answer}.`;
                    _am = { n: num, d: den, total, part: answer, ask: 'part', answer: { value: answer } };
                } else if (roll === 'type2') {
                    // Type 2: find the whole from the part (a unit fraction first: 1/4 of a number is 6)
                    const den = rng(3, 10);
                    const num = rng(1, Math.min(5, den - 1));
                    const mult = rng(3, 8);
                    const part = num * mult;
                    const total = den * mult;
                    // half of them a short story: the part is known, the whole is asked
                    const _fwStory = Math.random() < 0.5 ? pick([
                        [`Maya read ${part} pages.`, `That is ${num}/${den} of her book.`, 'How many pages are in the book?'],
                        [`Leo has walked ${part} meters.`, `That is ${num}/${den} of the path.`, 'How long is the path?'],
                        [`${part} children are in the hall.`, `That is ${num}/${den} of the school.`, 'How many children are in the school?'],
                    ]) : null;
                    q.text = _fwStory ? _fwStory.join(' ') : `${num}/${den} of a number is ${part}. What is the number?`;
                    q.ans = total;
                    q.answerType = "number";
                    q.hint = `If ${num}/${den} is ${part}, then 1/${den} is ${part} ÷ ${num} = ${mult}. The whole is ${mult} × ${den} = ${total}.`;
                    _am = { n: num, d: den, total, part, ask: 'whole', answer: { value: total }, ...(_fwStory ? { story: _fwStory } : {}) };
                } else {
                    // Type 3: a short story with larger numbers
                    const den = rng(3, 10);
                    const num = rng(2, Math.min(5, den - 1));
                    const mult = rng(4, Math.floor(100 / den));
                    const total = den * mult;
                    const answer = num * mult;
                    const contexts = [
                        [`A school has ${total} students.`, `${num}/${den} of them ride the bus.`, 'How many ride the bus?'],
                        [`A bag has ${total} beans.`, `${num}/${den} of them are red.`, 'How many are red?'],
                        [`A shelf has ${total} books.`, `${num}/${den} of them are about animals.`, 'How many are about animals?'],
                        [`A farm has ${total} animals.`, `${num}/${den} of them are hens.`, 'How many are hens?'],
                    ];
                    const story = pick(contexts);
                    q.text = story.join(' ');
                    q.ans = answer;
                    q.answerType = "number";
                    q.hint = `Find ${num}/${den} of ${total}: divide ${total} ÷ ${den} = ${mult}, then multiply ${mult} × ${num} = ${answer}.`;
                    _am = { n: num, d: den, total, part: answer, ask: 'part', answer: { value: answer }, story };
                }
                q.options = [];
                q.printFormat = "fraction-of-set-hard-nv";
                q.skillLabel = "Frac of Set";
                _fKit(q, Object.assign({ task: 'amount', bar: _bar }, _am));
                return;

            } else if (fracSkill === "mult_frac_whole_nv" && Math.random() < 0.25) {
                // Phase 4.5 batch 9: multi-select-check variant — same as mult_frac_whole but NV
                const dDen = pick([2, 3, 4, 5, 6]);
                const dWhole = rng(3, 8);
                const correctOpts = [
                    `${dWhole} × 1/${dDen}`,
                    `1/${dDen} × ${dWhole}`,
                    `${dWhole}/${dDen}`,
                    `${dWhole} ÷ ${dDen}`,
                    Array.from({length: dWhole}, () => `1/${dDen}`).join(' + ')
                ];
                const wrongOpts = [
                    `${dWhole} × ${dDen}`,
                    `${dWhole + 1} × 1/${dDen}`,
                    `1/${dWhole} × ${dDen}`,
                    `${dDen}/${dWhole}`,
                    `${dWhole - 1}/${dDen}`,
                    `${dWhole} + 1/${dDen}`,
                    `${dWhole} - 1/${dDen}`
                ];
                const cCount = randInt(2, 3);
                const wCount = 5 - cCount;
                const chosenC = shuffle(correctOpts.slice()).slice(0, cCount);
                const seen = new Set(chosenC);
                const chosenW = [];
                let safety = 0;
                while (chosenW.length < wCount && safety < 30) {
                    safety++;
                    const w = pick(wrongOpts);
                    if (!seen.has(w)) { seen.add(w); chosenW.push(w); }
                }
                while (chosenW.length < wCount) chosenW.push(`${dWhole + chosenW.length + 3} × ${dDen}`);
                const all = shuffle([
                    ...chosenC.map(label => ({ label, correct: true })),
                    ...chosenW.map(label => ({ label, correct: false }))
                ]);
                const opts = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL expressions equal to ${dWhole} × 1/${dDen}.`;
                q.answerType = 'multi-select-check';
                q.options = opts;
                q.ans = ans;
                q.hint = `${dWhole} × 1/${dDen} = ${dWhole}/${dDen}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Frac × Whole';
                return;
            } else if (fracSkill === "mult_frac_whole_nv") {
                // Grade 4: Fraction x Whole Number (no visual)
                const den = rng(2, 8);
                const num = rng(1, den - 1);
                const whole = rng(2, 9);
                const prodNum = num * whole;
                // LRU rotation across 3 sub-types (was 50/25/25 weighted random).
                const _v_mfwn = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('mult_frac_whole_nv', ['straight', 'missing_whole', 'simplify'], [2, 1, 1])
                    : (Math.random() < 0.5 ? 'straight' : (Math.random() < 0.5 ? 'missing_whole' : 'simplify'));
                q._variant = _v_mfwn;

                if (_v_mfwn === 'straight') {
                    // Type 1: Straightforward multiply (randomize order)
                    if (Math.random() < 0.5) {
                        q.text = `${whole} × ${num}/${den} = ?`;
                    } else {
                        q.text = `${num}/${den} × ${whole} = ?`;
                    }
                    q.ans = _fracStr(prodNum, den);
                    q.hint = `Multiply the numerator by the whole: ${num} × ${whole} = ${prodNum}. Keep the denominator: ${prodNum}/${den}. Simplify: ${_fracStr(prodNum, den)}.`;
                } else if (_v_mfwn === 'missing_whole') {
                    // Type 2: Missing whole number
                    q.text = `? × ${num}/${den} = ${_fracStr(prodNum, den)}. Find the missing number.`;
                    q.ans = whole;
                    q.answerType = "number";
                    q.hint = `${_fracStr(prodNum, den)} ÷ ${num}/${den} = ? The numerator ${prodNum} ÷ ${num} = ${whole}.`;
                    q.printFormat = "mult-frac-whole-nv";
                    q.skillLabel = "Frac × Whole";
                    return;
                } else {
                    // Type 3: Multiply and simplify (always produces improper)
                    const w2 = rng(3, 9);
                    const prodNum2 = num * w2;
                    q.text = `Multiply and simplify: ${w2} × ${num}/${den}`;
                    q.ans = _fracStr(prodNum2, den);
                    q.hint = `${num} × ${w2} = ${prodNum2}. So ${prodNum2}/${den}. Simplify: ${_fracStr(prodNum2, den)}.`;
                }
                q.answerType = "text";
                q.printFormat = "mult-frac-whole-nv";
                q.skillLabel = "Frac × Whole";
                return;

            } else if (fracSkill === "decompose_frac_nv" && Math.random() < 0.25) {
                // Phase 4.5 batch 9: multi-select-check variant — click ALL valid decompositions (NV)
                const dDen = pick([3, 4, 5, 6, 8]);
                const dNum = rng(2, Math.min(dDen, 5));
                const correctOpts = [];
                correctOpts.push(Array.from({length: dNum}, () => `1/${dDen}`).join(' + '));
                for (let a = 1; a < dNum; a++) {
                    const b = dNum - a;
                    correctOpts.push(`${a}/${dDen} + ${b}/${dDen}`);
                }
                const wrongOpts = [
                    `${dNum}/${dDen} + ${dNum}/${dDen}`,
                    `1/${dDen} + ${dNum}/${dDen}`,
                    `${dNum + 1}/${dDen}`,
                    `${dNum - 1}/${dDen} + ${dNum}/${dDen}`,
                    `${dNum}/${dDen + 1} + ${dNum}/${dDen + 1}`,
                    Array.from({length: dNum + 1}, () => `1/${dDen}`).join(' + ')
                ];
                const cCount = randInt(2, 3);
                const wCount = 5 - cCount;
                const chosenC = shuffle(correctOpts.slice()).slice(0, cCount);
                const seen = new Set(chosenC);
                const chosenW = [];
                let safety = 0;
                while (chosenW.length < wCount && safety < 30) {
                    safety++;
                    const w = pick(wrongOpts);
                    if (!seen.has(w)) { seen.add(w); chosenW.push(w); }
                }
                while (chosenW.length < wCount) chosenW.push(`${dNum + chosenW.length + 2}/${dDen}`);
                const all = shuffle([
                    ...chosenC.map(label => ({ label, correct: true })),
                    ...chosenW.map(label => ({ label, correct: false }))
                ]);
                const opts = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL ways to decompose ${dNum}/${dDen} into a sum.`;
                q.answerType = 'multi-select-check';
                q.options = opts;
                q.ans = ans;
                q.hint = `Each correct expression sums to ${dNum}/${dDen}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Decompose Frac';
                return;
            } else if (fracSkill === "decompose_frac_nv") {
                // Grade 4: Decompose to Unit Fractions (no visual)
                const den = rng(2, 8);
                const num = rng(2, den - 1);
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('decompose_frac_nv', ["type1","type2","type3"])
                    : (Math.random() < 0.5 ? 'type1' : (Math.random() < 0.5 ? 'type2' : 'type3'));
                q._variant = roll;

                if (roll === 'type1') {
                    // Type 1: Write as sum of unit fractions
                    const unitParts = [];
                    for (let i = 0; i < num; i++) unitParts.push(`1/${den}`);
                    const answer = unitParts.join(" + ");
                    q.text = `Write ${num}/${den} as a sum of unit fractions.`;
                    q.ans = answer;
                    q.hint = `A unit fraction has 1 as the numerator. ${num}/${den} = ${answer}.`;
                } else if (roll === 'type2') {
                    // Type 2: Write as sum of two fractions with same denominator
                    const a = rng(1, num - 1);
                    const b = num - a;
                    q.text = `Write ${num}/${den} as a sum of two different fractions with denominator ${den}.`;
                    q.ans = `${a}/${den} + ${b}/${den}`;
                    q.hint = `Find two numbers that add to ${num}: ${a} + ${b} = ${num}. So ${a}/${den} + ${b}/${den} = ${num}/${den}.`;
                } else {
                    // Type 3: How many unit fractions
                    q.text = `How many 1/${den}'s make up ${num}/${den}?`;
                    q.ans = num;
                    q.answerType = "number";
                    q.printFormat = "decompose-frac-nv";
                    q.skillLabel = "Decompose Frac";
                    return;
                }
                q.answerType = "text";
                q.printFormat = "decompose-frac-nv";
                q.skillLabel = "Decompose Frac";
                return;

            } else if (fracSkill === "frac_10_100_nv" && Math.random() < 0.25) {
                // Phase 4.5 batch 9: multi-select-check variant — same as frac_10_100 but for NV
                const targetN100 = pick([5, 7, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]);
                const decStr = targetN100 < 10 ? `0.0${targetN100}` : `0.${targetN100 < 100 && targetN100 % 10 === 0 ? targetN100 / 10 : targetN100}`;
                const correctOpts = [`${targetN100}/100`];
                if (targetN100 % 10 === 0) correctOpts.push(`${targetN100 / 10}/10`);
                function _gcdLocal2(a, b) { return b === 0 ? Math.abs(a) : _gcdLocal2(b, a % b); }
                const gd = _gcdLocal2(targetN100, 100);
                if (gd > 1 && gd !== 10) correctOpts.push(`${targetN100 / gd}/${100 / gd}`);
                const wrongOpts = [
                    `${targetN100 + 1}/100`,
                    `${targetN100 - 1}/100`,
                    `${targetN100}/10`,
                    `${targetN100}/1000`,
                    `${100 - targetN100}/100`,
                    targetN100 % 10 === 0 ? `${targetN100 / 10 + 1}/10` : `${Math.floor(targetN100 / 10) + 1}/10`,
                    `${targetN100 + 5}/100`
                ];
                const cCount = Math.min(correctOpts.length, randInt(2, 3));
                const wCount = 6 - cCount;
                const chosenC = shuffle(correctOpts.slice()).slice(0, cCount);
                const seen = new Set(chosenC);
                const chosenW = [];
                let safety = 0;
                while (chosenW.length < wCount && safety < 30) {
                    safety++;
                    const w = pick(wrongOpts);
                    if (!seen.has(w)) { seen.add(w); chosenW.push(w); }
                }
                while (chosenW.length < wCount) chosenW.push(`${targetN100 + chosenW.length + 7}/100`);
                const all = shuffle([
                    ...chosenC.map(label => ({ label, correct: true })),
                    ...chosenW.map(label => ({ label, correct: false }))
                ]);
                const opts = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL fractions equivalent to ${decStr}.`;
                q.answerType = 'multi-select-check';
                q.options = opts;
                q.ans = ans;
                q.hint = `${decStr} = ${targetN100}/100.`;
                q.printFormat = 'multi-select';
                q.skillLabel = '10ths & 100ths';
                return;
            } else if (fracSkill === "frac_10_100_nv") {
                // Grade 4: Fractions with denominators 10 and 100 (no visual)
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('frac_10_100_nv', ["type1","type2","type3"])
                    : (Math.random() < 0.5 ? 'type1' : (Math.random() < 0.5 ? 'type2' : 'type3'));
                q._variant = roll;

                if (roll === 'type1') {
                    // Type 1: Convert /10 to /100
                    const num10 = rng(1, 9);
                    q.text = `Write ${num10}/10 as a fraction with denominator 100.`;
                    q.ans = `${num10 * 10}/100`;
                    q.hint = `Multiply both numerator and denominator by 10: ${num10}/10 = ${num10 * 10}/100.`;
                } else if (roll === 'type2') {
                    // Type 2: Missing numerator
                    const num10 = rng(1, 9);
                    q.text = `${num10}/10 = ?/100. Find the missing numerator.`;
                    q.ans = num10 * 10;
                    q.answerType = "number";
                    q.printFormat = "frac-10-100-nv";
                    q.skillLabel = "10ths & 100ths";
                    return;
                } else {
                    // Type 3: Add tenths and hundredths
                    const num10 = rng(1, 9);
                    const num100 = rng(1, 9);
                    const sum = num10 * 10 + num100;
                    q.text = `${num10}/10 + ${num100}/100 = ?/100`;
                    q.ans = `${sum}/100`;
                    q.hint = `Convert ${num10}/10 to ${num10 * 10}/100. Then add: ${num10 * 10}/100 + ${num100}/100 = ${sum}/100.`;
                }
                q.answerType = "text";
                q.printFormat = "frac-10-100-nv";
                q.skillLabel = "10ths & 100ths";
                return;

            } else if (fracSkill === "mult_frac_frac_nv" && Math.random() < 0.25) {
                // Phase 4.5 batch 9: multi-select-check variant - same as mult_frac_frac NV
                const tD1 = pick([2, 3, 4]);
                const tD2 = pick([2, 3, 4]);
                const tN1 = rng(1, tD1 - 1);
                const tN2 = rng(1, tD2 - 1);
                const targetProdN = tN1 * tN2;
                const targetProdD = tD1 * tD2;
                const correctOpts = [
                    `${tN1}/${tD1} × ${tN2}/${tD2}`,
                    `${tN2}/${tD2} × ${tN1}/${tD1}`,
                    `${targetProdN}/${targetProdD}`
                ];
                const wrongOpts = [
                    `${tN1}/${tD1} + ${tN2}/${tD2}`,
                    `${tN1 + tN2}/${tD1 + tD2}`,
                    `${tN1}/${tD2} × ${tN2}/${tD1}`,
                    `${tD1}/${tN1} × ${tN2}/${tD2}`,
                    `${tN1}/${tD1} ÷ ${tN2}/${tD2}`,
                    `${targetProdD}/${targetProdN}`,
                    `${targetProdN + 1}/${targetProdD}`
                ];
                const cCount = randInt(2, 3);
                const wCount = 5 - cCount;
                const chosenC = shuffle(correctOpts.slice()).slice(0, cCount);
                const seen = new Set(chosenC);
                const chosenW = [];
                let safety = 0;
                while (chosenW.length < wCount && safety < 30) {
                    safety++;
                    const w = pick(wrongOpts);
                    if (!seen.has(w)) { seen.add(w); chosenW.push(w); }
                }
                while (chosenW.length < wCount) chosenW.push(`${targetProdN + chosenW.length + 2}/${targetProdD}`);
                const all = shuffle([
                    ...chosenC.map(label => ({ label, correct: true })),
                    ...chosenW.map(label => ({ label, correct: false }))
                ]);
                const opts = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL expressions equal to ${tN1}/${tD1} × ${tN2}/${tD2}.`;
                q.answerType = 'multi-select-check';
                q.options = opts;
                q.ans = ans;
                q.hint = `${tN1}/${tD1} × ${tN2}/${tD2} = ${targetProdN}/${targetProdD}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Frac × Frac';
                return;
            } else if (fracSkill === "mult_frac_frac_nv") {
                // Grade 5: Fraction x Fraction (no visual)
                const d1 = pick([2, 3, 4, 5, 6]);
                const d2 = pick([2, 3, 4, 5, 6]);
                const n1 = rng(1, d1 - 1);
                const n2 = rng(1, d2 - 1);
                const prodN = n1 * n2;
                const prodD = d1 * d2;
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('mult_frac_frac_nv', ["straight","missing","simplify"])
                    : (Math.random() < 0.5 ? 'straight' : (Math.random() < 0.5 ? 'missing' : 'simplify'));
                q._variant = roll;

                if (roll === 'straight') {
                    // Type 1: Straightforward multiply
                    q.text = `${n1}/${d1} × ${n2}/${d2} = ?`;
                    q.ans = _fracStr(prodN, prodD);
                    q.hint = `Multiply numerators: ${n1} × ${n2} = ${prodN}. Multiply denominators: ${d1} × ${d2} = ${prodD}. Simplify ${prodN}/${prodD}.`;
                } else if (roll === 'missing') {
                    // Type 2: Missing numerator
                    q.text = `${n1}/${d1} × ?/${d2} = ${_fracStr(prodN, prodD)}. Find the missing numerator.`;
                    q.ans = n2;
                    q.answerType = "number";
                    q.printFormat = "mult-frac-frac-nv";
                    q.skillLabel = "Frac × Frac";
                    return;
                } else {
                    // Type 3: Multiply and simplify
                    q.text = `Multiply and simplify: ${n1}/${d1} × ${n2}/${d2}`;
                    q.ans = _fracStr(prodN, prodD);
                    q.hint = `${n1} × ${n2} = ${prodN}, ${d1} × ${d2} = ${prodD}. Simplify ${prodN}/${prodD} = ${_fracStr(prodN, prodD)}.`;
                }
                q.answerType = "text";
                q.printFormat = "mult-frac-frac-nv";
                q.skillLabel = "Frac × Frac";
                return;

            } else if (fracSkill === "div_unit_frac_nv" && Math.random() < 0.25) {
                // Phase 4.5 batch 9: multi-select-check variant - same as div_unit_fraction NV
                const dDen = pick([2, 3, 4, 5]);
                const dWhole = rng(2, 6);
                const targetVal = dWhole * dDen;
                const correctOpts = [
                    `${dWhole} ÷ 1/${dDen}`,
                    `${dWhole} × ${dDen}`,
                    `${dDen} × ${dWhole}`,
                    `${targetVal}`
                ];
                const wrongOpts = [
                    `${dWhole} × 1/${dDen}`,
                    `1/${dDen} ÷ ${dWhole}`,
                    `${dWhole} ÷ ${dDen}`,
                    `${dWhole}/${dDen}`,
                    `${dDen}/${dWhole}`,
                    `${targetVal + 1}`,
                    `${targetVal - 1}`,
                    `1/(${dWhole} × ${dDen})`
                ];
                const cCount = randInt(2, 3);
                const wCount = 5 - cCount;
                const chosenC = shuffle(correctOpts.slice()).slice(0, cCount);
                const seen = new Set(chosenC);
                const chosenW = [];
                let safety = 0;
                while (chosenW.length < wCount && safety < 30) {
                    safety++;
                    const w = pick(wrongOpts);
                    if (!seen.has(w)) { seen.add(w); chosenW.push(w); }
                }
                while (chosenW.length < wCount) chosenW.push(`${targetVal + chosenW.length + 5}`);
                const all = shuffle([
                    ...chosenC.map(label => ({ label, correct: true })),
                    ...chosenW.map(label => ({ label, correct: false }))
                ]);
                const opts = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL expressions equal to ${dWhole} ÷ 1/${dDen}.`;
                q.answerType = 'multi-select-check';
                q.options = opts;
                q.ans = ans;
                q.hint = `${dWhole} ÷ 1/${dDen} = ${dWhole} × ${dDen} = ${targetVal}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Div Unit Frac';
                return;
            } else if (fracSkill === "div_unit_frac_nv") {
                // Grade 5: Divide with Unit Fractions (no visual)
                // LRU rotation across 4 sub-types: Mode A (whole ÷ unit) and B (unit ÷ whole),
                // each with straightforward + missing-value variants. Original was nested
                // 50/50 then 70/30 random.
                const _v_dufnv = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('div_unit_frac_nv', ['A_straight', 'A_missing', 'B_straight', 'B_missing'], [3, 1, 3, 1])
                    : (Math.random() < 0.5 ? (Math.random() < 0.7 ? 'A_straight' : 'A_missing') : (Math.random() < 0.7 ? 'B_straight' : 'B_missing'));
                q._variant = _v_dufnv;
                const _modeA = (_v_dufnv === 'A_straight' || _v_dufnv === 'A_missing');
                const _isStraight = (_v_dufnv === 'A_straight' || _v_dufnv === 'B_straight');

                if (_modeA) {
                    // Mode A: whole ÷ unit fraction
                    const den = rng(2, 6);
                    const whole = rng(2, 8);
                    const answer = whole * den;
                    if (_isStraight) {
                        // Type 1: Straightforward
                        q.text = `${whole} ÷ 1/${den} = ?`;
                        q.ans = answer;
                        q.hint = `Dividing by 1/${den} is the same as multiplying by ${den}: ${whole} × ${den} = ${answer}.`;
                    } else {
                        // Type 3: Missing dividend
                        q.text = `? ÷ 1/${den} = ${answer}. Find the missing number.`;
                        q.ans = whole;
                        q.hint = `If ? ÷ 1/${den} = ${answer}, then ? = ${answer} × 1/${den} = ${answer}/${den} = ${whole}.`;
                    }
                    q.answerType = "number";
                } else {
                    // Mode B: unit fraction ÷ whole
                    const den = rng(2, 6);
                    const whole = rng(2, 6);
                    const ansDen = den * whole;
                    if (_isStraight) {
                        // Type 1: Straightforward
                        q.text = `1/${den} ÷ ${whole} = ?`;
                        q.ans = `1/${ansDen}`;
                        q.hint = `Dividing by ${whole} is the same as multiplying by 1/${whole}: 1/${den} × 1/${whole} = 1/${ansDen}.`;
                    } else {
                        // Type 3: Missing divisor
                        q.text = `1/${den} ÷ ? = 1/${ansDen}. Find the missing number.`;
                        q.ans = whole;
                        q.hint = `1/${den} ÷ ? = 1/${ansDen}. Since ${den} × ${whole} = ${ansDen}, the missing number is ${whole}.`;
                        q.answerType = "number";
                        q.printFormat = "div-unit-frac-nv";
                        q.skillLabel = "Div Unit Frac";
                        return;
                    }
                    q.answerType = "text";
                }
                q.printFormat = "div-unit-frac-nv";
                q.skillLabel = "Div Unit Frac";
                return;

            } else if (fracSkill === "frac_as_div_nv" && Math.random() < 0.25) {
                // Phase 4.5 batch 9: multi-select-check variant - same as frac_as_division NV
                const dB = pick([2, 3, 4, 5, 6, 8]);
                const dA = rng(2, Math.min(dB + 2, 9));
                function _gcdLocal4(a, b) { return b === 0 ? Math.abs(a) : _gcdLocal4(b, a % b); }
                const gd = _gcdLocal4(dA, dB);
                const correctOpts = [`${dA}/${dB}`];
                if (gd > 1) correctOpts.push(`${dA / gd}/${dB / gd}`);
                correctOpts.push(`${dA * 2}/${dB * 2}`);
                correctOpts.push(`${dA * 3}/${dB * 3}`);
                const wrongOpts = [
                    `${dB}/${dA}`,
                    `${dA + 1}/${dB}`,
                    `${dA}/${dB + 1}`,
                    `${dA - 1}/${dB}`,
                    `${dA + dB}/${dB}`,
                    `${dA * 2}/${dB}`,
                    `${dA}/${dB * 2}`
                ];
                const cCount = randInt(2, 3);
                const wCount = 5 - cCount;
                const chosenC = shuffle(correctOpts.slice()).slice(0, cCount);
                const seen = new Set(chosenC);
                const chosenW = [];
                let safety = 0;
                while (chosenW.length < wCount && safety < 30) {
                    safety++;
                    const w = pick(wrongOpts);
                    if (!seen.has(w)) { seen.add(w); chosenW.push(w); }
                }
                while (chosenW.length < wCount) chosenW.push(`${dA + chosenW.length + 5}/${dB}`);
                const all = shuffle([
                    ...chosenC.map(label => ({ label, correct: true })),
                    ...chosenW.map(label => ({ label, correct: false }))
                ]);
                const opts = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL fractions that mean ${dA} ÷ ${dB}.`;
                q.answerType = 'multi-select-check';
                q.options = opts;
                q.ans = ans;
                q.hint = `${dA} ÷ ${dB} = ${dA}/${dB}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Frac as Div';
                return;
            } else if (fracSkill === "frac_as_div_nv") {
                // Grade 5: Fraction as Division (no visual)
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('frac_as_div_nv', ["type1","type2","type3"])
                    : (Math.random() < 0.5 ? 'type1' : (Math.random() < 0.5 ? 'type2' : 'type3'));
                q._variant = roll;

                if (roll === 'type1') {
                    // Type 1: Express division as a fraction
                    const num = rng(1, 9);
                    const den = rng(2, 10);
                    q.text = `Express ${num} ÷ ${den} as a fraction.`;
                    q.ans = _fracStr(num, den);
                    q.hint = `${num} ÷ ${den} can be written as the fraction ${num}/${den}. Simplify if possible.`;
                } else if (roll === 'type2') {
                    // Type 2: Sharing word problem
                    const items = rng(2, 9);
                    const people = rng(2, 10);
                    // Avoid cases where it divides evenly (that's too easy)
                    const finalItems = items % people === 0 ? items + 1 : items;
                    const contexts = [
                        `Share ${finalItems} pizzas equally among ${people} people. How much does each person get?`,
                        `Divide ${finalItems} sandwiches equally among ${people} friends. How much does each get?`,
                        `Split ${finalItems} pies equally among ${people} families. How much does each family get?`
                    ];
                    q.text = pick(contexts);
                    q.ans = _fracStr(finalItems, people);
                    q.hint = `${finalItems} ÷ ${people} = ${finalItems}/${people} = ${_fracStr(finalItems, people)}.`;
                } else {
                    // Type 3: Fraction to mixed number
                    const den = rng(2, 6);
                    const whole = rng(1, 4);
                    const rem = rng(1, den - 1);
                    const num = whole * den + rem;
                    q.text = `If ${num}/${den} means ${num} ÷ ${den}, what is the result as a mixed number?`;
                    q.ans = `${whole} ${rem}/${den}`;
                    q.hint = `${num} ÷ ${den} = ${whole} remainder ${rem}. So ${num}/${den} = ${whole} ${rem}/${den}.`;
                }
                q.answerType = "text";
                q.printFormat = "frac-as-div-nv";
                q.skillLabel = "Frac as Div";
                return;

            } else if (fracSkill === "frac_as_div_word") {
                // Grade 5 Fraction-as-Division Word Problems (no visual).
                // Three problem types weighted 40/30/30:
                //   type1 (proper, < 1): 5 friends share 3 pizzas → 3/5
                //   type2 (improper → mixed > 1): 2 children share 7 muffins → 7/2 = 3 1/2
                //   type3 (proper, < 1, measurement context): 4 yards / 5 people → 4/5
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('frac_as_div_word', ["type1","type2","type3"])
                    : (Math.random() < 0.4 ? 'type1' : (Math.random() < 0.5 ? 'type2' : 'type3'));
                q._variant = roll;

                let people, items, itemSing, itemPlural, scenario;
                if (roll === 'type1') {
                    // Proper-fraction sharing (items < people)
                    people = rng(3, 8);
                    items = rng(2, people - 1);
                    const itemPool = [
                        { s: 'pizza', p: 'pizzas', actorPl: 'friends', actorSg: 'friend' },
                        { s: 'sandwich', p: 'sandwiches', actorPl: 'children', actorSg: 'child' },
                        { s: 'pie', p: 'pies', actorPl: 'people', actorSg: 'person' },
                        { s: 'cake', p: 'cakes', actorPl: 'students', actorSg: 'student' },
                        { s: 'chocolate bar', p: 'chocolate bars', actorPl: 'kids', actorSg: 'kid' }
                    ];
                    const c = pick(itemPool);
                    itemSing = c.s; itemPlural = c.p;
                    scenario = `${people} ${c.actorPl} share ${items} ${items === 1 ? c.s : c.p} equally. How much does each ${c.actorSg} get?`;
                } else if (roll === 'type2') {
                    // Improper-fraction sharing → mixed number (items > people)
                    people = rng(2, 5);
                    const wholeMin = 1, wholeMax = 4;
                    const whole = rng(wholeMin, wholeMax);
                    const rem = rng(1, people - 1);
                    items = whole * people + rem;
                    const itemPool = [
                        { s: 'muffin', p: 'muffins', actorPl: 'children', actorSg: 'child' },
                        { s: 'apple', p: 'apples', actorPl: 'friends', actorSg: 'friend' },
                        { s: 'granola bar', p: 'granola bars', actorPl: 'students', actorSg: 'student' },
                        { s: 'cookie', p: 'cookies', actorPl: 'kids', actorSg: 'kid' }
                    ];
                    const c = pick(itemPool);
                    itemSing = c.s; itemPlural = c.p;
                    scenario = `${people} ${c.actorPl} share ${items} ${items === 1 ? c.s : c.p} equally. How many ${c.p} does each ${c.actorSg} get?`;
                } else {
                    // Measurement-context (proper, items < people)
                    people = rng(3, 8);
                    items = rng(2, people - 1);
                    const measPool = [
                        { unit: 'yard', units: 'yards', material: 'ribbon', recPl: 'people', recSg: 'person' },
                        { unit: 'meter', units: 'meters', material: 'rope', recPl: 'students', recSg: 'student' },
                        { unit: 'foot', units: 'feet', material: 'string', recPl: 'friends', recSg: 'friend' },
                        { unit: 'pound', units: 'pounds', material: 'clay', recPl: 'children', recSg: 'child' },
                        { unit: 'gallon', units: 'gallons', material: 'paint', recPl: 'rooms', recSg: 'room' }
                    ];
                    const c = pick(measPool);
                    itemSing = c.unit; itemPlural = c.units;
                    scenario = `If you split ${items} ${items === 1 ? c.unit : c.units} of ${c.material} equally among ${people} ${c.recPl}, how many ${c.units} does each ${c.recSg} get?`;
                }

                const answer = _fracStr(items, people);
                q.text = scenario;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `${items} ÷ ${people} = ${items}/${people}${items >= people ? ` = ${answer}` : ''}. Sharing ${items} item${items===1?'':'s'} among ${people} people means each gets ${items}/${people} of ${itemSing === 'pizza' || itemSing === 'sandwich' || itemSing === 'pie' || itemSing === 'cake' || itemSing === 'chocolate bar' ? `a ${itemSing}` : `${itemPlural}`}.`;
                q.printFormat = "word-problem";
                q.skillLabel = "Frac as Div Word";
                return;

            } else if (fracSkill === "mult_scaling_nv" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-categorize variant — sort 4-6 expressions into Larger/Smaller/Equal bins
                const whole = pick([6, 8, 10, 12]);
                const dPool = [2, 3, 4, 5, 6, 8];
                const totalCount = randInt(5, 6);
                const expressions = [];
                const seen = new Set();
                let safety = 0;
                // Build one of each category first for variety
                while (expressions.filter(e => e.cat === 'larger').length < 1 && safety < 50) {
                    safety++;
                    const d = pick(dPool);
                    const n = rng(d + 1, d * 2);
                    const key = n + '/' + d;
                    if (!seen.has(key)) { seen.add(key); expressions.push({ n, d, cat: 'larger' }); }
                }
                safety = 0;
                while (expressions.filter(e => e.cat === 'smaller').length < 1 && safety < 50) {
                    safety++;
                    const d = pick(dPool);
                    const n = rng(1, d - 1);
                    const key = n + '/' + d;
                    if (!seen.has(key)) { seen.add(key); expressions.push({ n, d, cat: 'smaller' }); }
                }
                safety = 0;
                while (expressions.filter(e => e.cat === 'equal').length < 1 && safety < 50) {
                    safety++;
                    const d = pick(dPool);
                    const key = d + '/' + d;
                    if (!seen.has(key)) { seen.add(key); expressions.push({ n: d, d, cat: 'equal' }); }
                }
                // Fill remaining with random selections
                safety = 0;
                while (expressions.length < totalCount && safety < 200) {
                    safety++;
                    const d = pick(dPool);
                    const cat = pick(['larger', 'smaller', 'equal']);
                    let n;
                    if (cat === 'larger') n = rng(d + 1, d * 2);
                    else if (cat === 'smaller') n = rng(1, d - 1);
                    else n = d;
                    const key = n + '/' + d;
                    if (!seen.has(key)) { seen.add(key); expressions.push({ n, d, cat }); }
                }
                const tilesArr = shuffle(expressions);
                const tiles = tilesArr.map((e, i) => ({ id: 't' + i, label: `${e.n}/${e.d} × ${whole}` }));
                const ans = {};
                tilesArr.forEach((e, i) => {
                    ans['t' + i] = e.cat === 'larger' ? 'binL' : e.cat === 'smaller' ? 'binS' : 'binE';
                });
                q.text = `Drag each expression into the correct bin (compared to ${whole}).`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binL', label: `Larger than ${whole}` },
                    { id: 'binS', label: `Smaller than ${whole}` },
                    { id: 'binE', label: `Equal to ${whole}` }
                ];
                q.hint = `Multiplying by a fraction > 1 grows the number; < 1 shrinks it; = 1 keeps it the same.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Scaling';
                return;
            } else if (fracSkill === "mult_scaling_nv" && Math.random() < 0.30) {
                const whole = pick([5, 6, 8, 10, 12]);
                const correctCount = randInt(2, 3);
                const totalCount = randInt(5, 6);
                const dPool = [2, 3, 4, 5, 6, 8];
                const correctSet = [];
                const wrongSet = [];
                const seen = new Set();
                let safety = 0;
                while (correctSet.length < correctCount && safety < 200) {
                    safety++;
                    const d = pick(dPool);
                    const n = rng(d + 1, d * 2 + 1);
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    if ((n * whole) / d > whole) {
                        seen.add(key);
                        correctSet.push({ n, d });
                    }
                }
                safety = 0;
                while (wrongSet.length < (totalCount - correctSet.length) && safety < 200) {
                    safety++;
                    const d = pick(dPool);
                    const n = rng(1, d - 1);
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    if ((n * whole) / d <= whole) {
                        seen.add(key);
                        wrongSet.push({ n, d });
                    }
                }
                const all = shuffle([...correctSet, ...wrongSet]);
                const options = all.map((f, i) => ({
                    id: 'opt' + i,
                    label: `${f.n}/${f.d} × ${whole}`,
                    correct: (f.n * whole) / f.d > whole
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the results that are LARGER than ${whole}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Multiplying by a fraction greater than 1 makes the answer bigger; less than 1 makes it smaller.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Scaling';
                return;
            } else if (fracSkill === "mult_scaling_nv") {
                // Grade 5: Multiplication as Scaling (no visual)
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('mult_scaling_nv', ["type1","type2","type3"])
                    : (Math.random() < 0.5 ? 'type1' : (Math.random() < 0.5 ? 'type2' : 'type3'));
                q._variant = roll;

                if (roll === 'type1') {
                    // Type 1: Fraction < 1, compare to original
                    const den = rng(2, 6);
                    const num = rng(1, den - 1);
                    const n = rng(5, 20);
                    q.text = `Is ${num}/${den} × ${n} greater than, less than, or equal to ${n}?`;
                    q.ans = `Less than ${n}`;
                    q.answerType = "multiple-choice";
                    q.options = [`Greater than ${n}`, `Less than ${n}`, `Equal to ${n}`];
                    q.hint = `Since ${num}/${den} is less than 1, multiplying ${n} by it gives a result less than ${n}.`;
                } else if (roll === 'type2') {
                    // Type 2: Fraction > 1, compare to original
                    const den = rng(2, 5);
                    const num = den + rng(1, 3);
                    const n = rng(5, 15);
                    q.text = `Without calculating, is ${num}/${den} × ${n} greater than, less than, or equal to ${n}?`;
                    q.ans = `Greater than ${n}`;
                    q.answerType = "multiple-choice";
                    q.options = [`Greater than ${n}`, `Less than ${n}`, `Equal to ${n}`];
                    q.hint = `Since ${num}/${den} is greater than 1, multiplying ${n} by it gives a result greater than ${n}.`;
                } else {
                    // Type 3: Fill in comparison operator
                    const type = pick(["less", "greater", "equal"]);
                    let num, den, n;
                    if (type === "less") {
                        den = rng(2, 6);
                        num = rng(1, den - 1);
                        n = rng(5, 15);
                        q.text = `Fill in <, >, or =: ${num}/${den} × ${n} ___ ${n}`;
                        q.ans = "<";
                        q.hint = `${num}/${den} < 1, so ${num}/${den} × ${n} < ${n}.`;
                    } else if (type === "greater") {
                        den = rng(2, 5);
                        num = den + rng(1, 3);
                        n = rng(5, 15);
                        q.text = `Fill in <, >, or =: ${num}/${den} × ${n} ___ ${n}`;
                        q.ans = ">";
                        q.hint = `${num}/${den} > 1, so ${num}/${den} × ${n} > ${n}.`;
                    } else {
                        den = pick([2, 3, 4, 5, 6]);
                        num = den;
                        n = rng(5, 15);
                        q.text = `Fill in <, >, or =: ${num}/${den} × ${n} ___ ${n}`;
                        q.ans = "=";
                        q.hint = `${num}/${den} = 1, so ${num}/${den} × ${n} = ${n}.`;
                    }
                    q.answerType = "text";
                }
                q.printFormat = "mult-scaling-nv";
                q.skillLabel = "Scaling";
                return;

            } else if (fracSkill === "mult_frac_frac") {
                // Grade 5: Fraction x Fraction
                const d1 = pick([2, 3, 4, 5, 6]);
                const d2 = pick([2, 3, 4, 5, 6]);
                const n1 = rng(1, d1 - 1);
                const n2 = rng(1, d2 - 1);
                const prodN = n1 * n2;
                const prodD = d1 * d2;
                const answer = _fracStr(prodN, prodD);

                q.text = `Calculate: ${n1}/${d1} × ${n2}/${d2} = ?`;
                q.ans = answer;
                q.answerType = "text";
                q.hint = `Multiply numerators: ${n1} × ${n2} = ${prodN}. Multiply denominators: ${d1} × ${d2} = ${prodD}. Answer: ${prodN}/${prodD}. Simplify.`;

                // KIT (O6 lane AP3): the area model of 5.NF.4b WITHOUT the answer (the legacy picture
                // coloured the overlap and printed "overlap = n/d"): d1 rows by d2 columns, the
                // first factor's rows shaded, the second factor's columns bracketed. The pupil
                // counts the shaded cells inside the bracket and all the cells.
                _fSentenceKit(q, [{ n: n1, d: d1, kind: null }, { n: n2, d: d2, kind: null }], ['\u00d7'], 'area',
                    { area: { rows: d1, cols: d2, shadeRows: n1, markCols: n2, n1, d1, n2, d2 } });
                return;

            } else if (fracSkill === "div_unit_fraction") {
                // Grade 5: Divide with unit fractions. KIT (O6 lane AP3): the dividend is drawn - the
                // wholes cut into 1/d parts, or the one unit fraction - and the divisor is a number;
                // the answer is never drawn (the legacy strip split 1/d and lit one piece of the
                // answer's size). Bars unless the teacher ticked other models.
                const mode = Math.random() < 0.5 ? "whole_div_frac" : "frac_div_whole";
                q.answerType = "text";
                if (mode === "whole_div_frac") {
                    // whole / (1/d) = whole * d
                    const d = pick([2, 3, 4, 5, 6, 8]);
                    const whole = rng(1, 5);
                    const ans = whole * d;
                    q.text = `${whole} ÷ 1/${d} = ?`;
                    q.ans = String(ans);
                    q.hint = `How many 1/${d}'s fit into ${whole}? Each whole has ${d} pieces of 1/${d}, so ${whole} × ${d} = ${ans}.`;
                    _fSentenceKit(q, [{ w: whole, n: 0, d }, { n: 1, d, kind: null }], ['\u00f7'], _fModelPick() || 'bar', { wholeMm: 18, perRow: 4, barH: 9, modelTop: true });
                } else {
                    // (1/d) / whole = 1/(d*whole)
                    const d = pick([2, 3, 4, 5, 6]);
                    const whole = rng(2, 5);
                    const ansD = d * whole;
                    q.text = `1/${d} ÷ ${whole} = ?`;
                    q.ans = `1/${ansD}`;
                    q.hint = `Split 1/${d} into ${whole} equal parts. Each part is 1/(${d} × ${whole}) = 1/${ansD}.`;
                    _fSentenceKit(q, [{ n: 1, d }, { w: whole, n: 0, d: 1, kind: null }], ['\u00f7'], _fModelPick() || 'bar', { wholeMm: 26 });
                }
                return;

            } else if (fracSkill === "frac_as_division") {
                // Grade 5 (5.NF.B.3): a/b is a shared by b. KIT (fractions lane): the a wholes drawn
                // cut into b equal parts (circles unless the teacher ticked another model), "a ÷ b =",
                // and the answer boxes - a fraction, or a mixed number's three boxes when a >= b.
                // The pupil shares the parts; nothing is shaded, so the picture never gives the answer.
                const b = pick([2, 3, 4, 5, 6, 8]);
                const a = rng(1, Math.min(b + 2, 6));
                const answer = a >= b ? _fracStr(a, b) : `${a}/${b}`;

                const scenarios = [
                    `Share ${a} pizza${a > 1 ? 's' : ''} equally among ${b} friends. How much does each friend get?`,
                    `Share ${a} cookie${a > 1 ? 's' : ''} equally among ${b} children. How much does each child get?`,
                    `Share ${a} cake${a > 1 ? 's' : ''} equally among ${b} people. How much does each person get?`,
                    `Share ${a} sandwich${a > 1 ? 'es' : ''} equally among ${b} students. How much does each student get?`
                ];
                q.text = pick(scenarios);
                q.ans = answer;
                q.acceptedAnswers = [...new Set([answer, `${a}/${b}`, _fracStr(a, b)])];
                q.answerType = "text";
                q.options = [];
                q.hint = `${a} ÷ ${b} = ${a}/${b}. Cut every whole into ${b} equal parts. Each one gets 1 part of each whole: ${a} parts of size 1/${b}.`;
                const _adKind = _fModelPick() || 'circle';
                _fSentenceKit(q, [{ w: a, n: 0, d: b, blank: true }, { w: b, n: 0, d: 1, kind: null }], ['\u00f7'], _adKind,
                    { mixed: a >= b, wholeMm: _adKind === 'circle' ? 18 : 22, perRow: 3, barH: 9, modelTop: true });
                // the answer's boxes hold a/b as written (never simplified: 2 / 4 = 2/4)
                const _adP = q.cell.payload;
                const _adAns = a >= b ? _fParts(_fracStr(a, b)) : { w: 0, n: a, d: b };
                _adP.answer = { w: _adAns.w || 0, n: _adAns.n || 0, d: _adAns.d || 1 };
                _adP.terms[_adP.terms.length - 1] = Object.assign({}, _adP.terms[_adP.terms.length - 1], { n: _adAns.n || 0, d: _adAns.d || 1 });
                q.visual = fracTwin(_adP);
                return;

            } else if (fracSkill === "mult_scaling") {
                // Grade 5 (5.NF.B.5): multiplication as scaling - without multiplying, is n/d x w
                // greater than, less than or equal to w? KIT (fractions lane): "3/4 × 6 ( ) 6", the
                // pupil writes <, > or = in the circle; the fraction is drawn as bars against one
                // whole, so he sees whether it is less than, equal to or more than 1 (the reason).
                const d = pick([2, 3, 4, 5, 6, 8]);
                const n = rng(1, d * 2);
                const whole = rng(2, 10);
                const fracVal = n / d;
                const sign = fracVal > 1 ? '>' : fracVal < 1 ? '<' : '=';
                q.text = `Is ${n}/${d} × ${whole} greater than, less than, or equal to ${whole}?`;
                q.ans = sign;
                q.answerType = 'symbol';
                q.options = [];
                q.hint = fracVal > 1 ? `${n}/${d} is more than 1 whole, so ${n}/${d} × ${whole} is more than ${whole}.`
                    : fracVal < 1 ? `${n}/${d} is less than 1 whole, so ${n}/${d} × ${whole} is less than ${whole}.`
                        : `${n}/${d} is 1 whole, so ${n}/${d} × ${whole} is ${whole}.`;
                const _msKind = _fPicturesOff() ? null : 'bar';
                q.fractionModel = _msKind;
                // the fraction's bars above (one whole each, a value past 1 runs into a second
                // bar), the comparison on one line under them
                _fKit(q, { task: 'sign', terms: [{ n, d, kind: _msKind }, { w: whole, n: 0, d: 1 }, { w: whole, n: 0, d: 1 }],
                    joins: ['\u00d7', 'sign'], answer: { sign }, wholeMm: 30, perRow: 2, barH: 11, modelTop: !!_msKind });
                return;

            } else if (fracSkill === "frac_mult_word") {
                // Grade 5 (5.NF.B.6, 5.NF.B.7c): multiply and divide with fractions in a story. KIT
                // (fractions lane): the story, one sentence per line, over the number sentence it
                // makes, drawn as the matching skill draws it - equal groups of a fraction, the area
                // model of a fraction of a fraction, the wholes cut into unit fractions - and the
                // answer boxes. The _plain twin keeps the story and the sentence without pictures.
                // the four stories in turn (a page never repeats one kind three times)
                const kind = window.pickVariant ? window.pickVariant('frac_mult_word', ['groups', 'servings', 'area', 'cut']) : pick(['groups', 'servings', 'area', 'cut']);
                if (kind === 'groups' || kind === 'servings') {
                    const d = kind === 'groups' ? pick([2, 3, 4]) : pick([3, 4, 5, 6]);
                    const n = rng(1, d - 1);
                    const k = kind === 'groups' ? rng(2, 4) : rng(2, 5);
                    const prodN = n * k;
                    const text = kind === 'groups'
                        ? `A recipe needs ${n}/${d} of a cup of flour. You make the recipe ${k} times. How much flour do you need?`
                        : `Each glass holds ${n}/${d} of a liter of juice. How much juice is in ${k} glasses?`;
                    q.text = text;
                    q.ans = _fracStr(prodN, d);
                    q.acceptedAnswers = [...new Set([q.ans, `${prodN}/${d}`])];
                    q.hint = `${k} groups of ${n}/${d}: ${k} × ${n}/${d} = ${prodN}/${d} = ${q.ans}.`;
                    _fSentenceKit(q, [{ w: k, n: 0, d: 1, kind: null }, { n, d, copies: k }], ['\u00d7'], 'bar',
                        { mixed: prodN >= d, wholeMm: 16, perRow: 5, barH: 8, story: _fStoryLines(text) });
                } else if (kind === 'area') {
                    const d1 = pick([2, 3, 4]), n1 = rng(1, d1 - 1);
                    const d2 = pick([2, 3, 4, 5]), n2 = rng(1, d2 - 1);
                    const text = `A garden is ${n1}/${d1} of a yard long and ${n2}/${d2} of a yard wide. What is its area in square yards?`;
                    q.text = text;
                    q.ans = _fracStr(n1 * n2, d1 * d2);
                    q.acceptedAnswers = [...new Set([q.ans, `${n1 * n2}/${d1 * d2}`])];
                    q.hint = `Area = ${n1}/${d1} × ${n2}/${d2} = ${n1 * n2}/${d1 * d2}${q.ans !== `${n1 * n2}/${d1 * d2}` ? ` = ${q.ans}` : ''} square yards.`;
                    _fSentenceKit(q, [{ n: n1, d: d1, kind: null }, { n: n2, d: d2, kind: null }], ['\u00d7'], 'area',
                        { area: { rows: d1, cols: d2, shadeRows: n1, markCols: n2, n1, d1, n2, d2, k: 0.6 }, story: _fStoryLines(text) });
                } else {
                    const d = pick([2, 3, 4, 5, 6]);
                    const whole = rng(2, 4);
                    const ans = whole * d;
                    const text = `You have ${whole} meters of ribbon. You cut it into pieces 1/${d} of a meter long. How many pieces do you get?`;
                    q.text = text;
                    q.ans = String(ans);
                    q.hint = `${whole} ÷ 1/${d}: each meter makes ${d} pieces. ${whole} × ${d} = ${ans} pieces.`;
                    _fSentenceKit(q, [{ w: whole, n: 0, d }, { n: 1, d, kind: null }], ['\u00f7'], 'bar',
                        { wholeMm: 18, perRow: 4, barH: 9, story: _fStoryLines(text), modelTop: true });
                }
                q.answerType = "text";
                q.options = [];
                return;

            } else if (fracSkill === "compose_whole" || fracSkill === "compose_target_frac") {
                // Compose-fraction-tiles widget. Student drags unit-fraction
                // tiles into a target bar so their sum equals a target.
                //
                // compose_whole       → target = 1 (one whole)
                // compose_target_frac → target = a non-trivial fraction (e.g. 3/4)
                const isWhole = (fracSkill === "compose_whole");

                // Choose target fraction.
                let tNum, tDen;
                if (isWhole) {
                    tNum = 1; tDen = 1;
                } else {
                    // Pick a denominator the student can solve cleanly with
                    // available unit tiles. Bias toward 4 / 6 / 8.
                    const denPool = [4, 4, 6, 8, 8, 10, 12].filter(d => d <= _maxDen);
                    const den = (denPool[Math.floor(Math.random() * denPool.length)]) || _capDen(4);
                    // Pick a numerator that's not the whole and not 1 (1/d is trivial).
                    const numPool = [];
                    for (let n = 2; n < den; n++) numPool.push(n);
                    tNum = numPool[Math.floor(Math.random() * numPool.length)] || 2;
                    tDen = den;
                }

                // Build a generous palette of unit fractions covering common
                // denominators. Counts are large enough that many valid
                // solutions exist (1/2 + 1/4 + 1/4, 1/4 + 1/4 + 1/4 + 1/4, etc.).
                const DEN_NAME = { 2: 'halves', 3: 'thirds', 4: 'quarters', 5: 'fifths',
                    6: 'sixths', 8: 'eighths', 10: 'tenths', 12: 'twelfths' };
                let palette, tileNames = '';
                if (isWhole) {
                    // One family per item. Every family can make exactly 1 whole, and each asks
                    // for a different piece of thinking.
                    const FAMILIES = [[2, 4], [3, 6], [4, 8], [2, 3, 6], [5, 10], [2, 4, 8],
                        [2, 6], [3, 12], [4, 12], [2, 5, 10]];
                    const usable = FAMILIES.filter(f => f.every(d => d <= Math.max(8, _maxDen)));
                    const fam = (usable.length ? usable : [[2, 4]])[
                        Math.floor(Math.random() * (usable.length || 1))];
                    palette = fam.map(d => ({ n: 1, d, count: d }));
                    tileNames = fam.map(d => DEN_NAME[d] || ('1/' + d)).join(' and ');
                } else {
                    palette = [
                        { n: 1, d: 2, count: 2 },
                        { n: 1, d: 3, count: 3 },
                        { n: 1, d: 4, count: 4 },
                        { n: 1, d: 6, count: 6 },
                        { n: 1, d: 8, count: 8 }
                    ].filter(p => p.d <= Math.max(8, _maxDen));
                }

                // For compose_target_frac, ensure the palette includes the
                // target's denominator so AT LEAST one trivial solution exists.
                if (!isWhole && !palette.find(p => p.d === tDen)) {
                    palette.push({ n: 1, d: tDen, count: tNum });
                }

                const targetLabel = (tDen === 1) ? '1 whole' : `${tNum}/${tDen}`;
                q.text = isWhole
                    ? `Use ${tileNames} to make 1 whole.`
                    : `Drag fraction tiles into the bar to make ${targetLabel}.`;
                q.printText = isWhole
                    ? `Write the fractions that add up to 1 whole.`
                    : `Write the fractions that add up to ${targetLabel}.`;
                q.answerType = "compose-fraction-tiles";
                q.targetNum = tNum;
                q.targetDen = tDen;
                q.palette = palette;
                q.ans = targetLabel;
                // The pupil writes the fractions they used, so the key must show a worked
                // combination, not the target. Any combination summing to the target is correct;
                // the key names one and says so, which is what a teacher marks against.
                //
                // It must also be a combination THIS item could have been built from. A greedy
                // solver takes the largest tile first, so every family printed "1/2 + 1/2" and
                // four different items got four identical, family-blind keys. This one enumerates
                // every combination the item's own palette can make - a handful of tiles, so the
                // search is tiny and exact (counted in 1/L units, no float drift) - and scores
                // them. For 1 whole the score prefers the MOST DIFFERENT tile sizes, because
                // mixing sizes is the thinking this step teaches, then the fewest tiles; for a
                // target fraction it prefers the shortest key, which keeps that step's key plain.
                const _solve = (num, den, pal, preferVariety) => {
                    const tiles = pal
                        .map(p => ({ n: Math.max(1, Math.floor(p.n || 1)), d: Math.max(1, Math.floor(p.d || 1)),
                            max: Math.max(0, Math.floor(p.count || 0)) }))
                        .filter(t => t.max > 0)
                        .sort((a, b) => (a.n / a.d === b.n / b.d ? 0 : (a.n / a.d < b.n / b.d ? 1 : -1)));
                    if (!tiles.length) return null;
                    // Common unit: one L-th. Every tile and the target are whole numbers of it.
                    let L = Math.max(1, den);
                    for (const t of tiles) L = _lcm(L, t.d);
                    const target = Math.round(L * num / den);
                    const step = tiles.map(t => Math.round(L * t.n / t.d));
                    const counts = new Array(tiles.length).fill(0);
                    let best = null;
                    const walk = (i, left) => {
                        if (left === 0) {
                            const used = counts.reduce((a, c) => a + c, 0);
                            if (!used) return;
                            const sizes = counts.reduce((a, c) => a + (c > 0 ? 1 : 0), 0);
                            const rank = preferVariety ? [-sizes, used] : [used, -sizes];
                            if (!best || rank[0] < best.rank[0]
                                || (rank[0] === best.rank[0] && rank[1] < best.rank[1])) {
                                best = { rank, counts: counts.slice() };
                            }
                            return;
                        }
                        if (i >= tiles.length || left < 0) return;
                        const lim = Math.min(tiles[i].max, Math.floor(left / step[i]));
                        for (let k = lim; k >= 0; k--) { counts[i] = k; walk(i + 1, left - k * step[i]); }
                        counts[i] = 0;
                    };
                    walk(0, target);
                    if (!best) return null;
                    const used = [];
                    best.counts.forEach((c, i) => {
                        for (let k = 0; k < c; k++) used.push(`${tiles[i].n}/${tiles[i].d}`);
                    });
                    return used;
                };
                const _combo = _solve(tNum, tDen, palette, isWhole);
                q.printAnswer = _combo ? `${_combo.join(' + ')}  (any combination that makes ${targetLabel})`
                    : targetLabel;
                // The printed cell drew slotCount = max(targetNum, 2) = 2 boxes, because the
                // target of compose_whole is 1/1. A solution needs 3-5 tiles, so the boxes
                // contradicted the key on every cell. Publish the real count.
                q.slotCount = Math.max(2, (_combo && _combo.length) || 2);
                q.options = [];
                q.hint = isWhole
                    ? `One whole = 2 halves = 4 fourths = 8 eighths. Pick tiles whose values add up to 1.`
                    : `${targetLabel} can be made from smaller unit-fraction tiles. Try ${tNum}/${tDen} OR equivalent combinations.`;
                q.skillLabel = isWhole ? 'Compose 1 Whole' : 'Compose Target Fraction';
                q.printFormat = 'compose-fraction-tiles';
                // Static visual fallback for print so the printable shows the prompt
                // and target. The interactive bar/palette only renders on screen.
                const _tile = (n, d) => `<span style="display:inline-block;min-width:3.1em;padding:2px 6px;`
                    + `margin:2px;border:1.5px solid #000;text-align:center;font-size:1.05rem;">`
                    + `${n}<span style="border-top:1.5px solid #000;display:block;">${d}</span></span>`;
                q.visual = `<div style="text-align:center;color:#000;">`
                    + `<div style="font-weight:700;margin-bottom:4px;">Target: ${targetLabel}</div>`
                    + `<div style="border:1.5px solid #000;height:2.2em;margin:0 auto 8px;max-width:22em;"></div>`
                    + `<div>${palette.map(t => _tile(t.n, t.d)).join('')}</div></div>`;
                return;

            } else if (fracSkill === "fraction_number_line") {
                // Grade 3 (3.NF.A.2a/b, 3.NF.A.3c; WRM Y3.B6.S8-S9). KIT (fractions lane, options-r3:
                // it printed ONE item per page in the legacy layout with a colour bar and an "Answer:"
                // line). Four forms, the `forms` option:
                //   0 read    a dot on a 0-1 line cut into equal parts: write the fraction at the dot
                //   1 jumps   the same line with the jumps from 0 drawn (count the jumps)
                //   2 place   mark the fraction on the line (the kit's nl-place cell: tap on screen)
                //   3 past 1  a line from 0 to 2 or 3: write the fraction at the dot (6/4)
                // Read, jumps and past-1 are one instruction ("Write the number at each dot."), so
                // the default mixes them; placing is its own page when ticked alone.
                const _fnlForms = _fChanged('forms');
                const form = _fnlForms ? pick(_fnlForms) : pick([0, 0, 1, 3]);
                q.skillLabel = 'Fractions on a Number Line';
                q.options = [];
                if (form === 2) {
                    const den = pick(_filterDens([2, 3, 4, 5, 6, 8, 10]));
                    const num = rng(1, den - 1);
                    q.ans = [num / den];
                    q.nlData = { min: 0, max: 1, tickStep: 1 / den, labelStep: 1, mode: 'fraction', denom: den, targets: [{ value: num / den, label: `${num}/${den}` }] };
                    q.hint = `The line is cut into ${den} equal parts. Count ${num} parts from 0.`;
                    q.printFormat = 'nl-drag';
                    _nlKit(q);
                    return;
                }
                q.answerType = 'text';
                q.noSimplify = true;
                if (form === 3) {
                    const den = pick(_filterDens([2, 3, 4, 5, 6]));
                    const maxW = den <= 3 ? 3 : 2;
                    let num;
                    do { num = rng(den + 1, maxW * den - 1); } while (num % den === 0);
                    q.text = `What fraction is at the dot?`;
                    q.ans = `${num}/${den}`;
                    const w = Math.floor(num / den), r = num % den;
                    q.acceptedAnswers = [q.ans, `${w} ${r}/${den}`];
                    q.hint = `Each whole is cut into ${den} equal parts. Count the parts from 0 to the dot: ${num}.`;
                    _fKit(q, { task: 'write', terms: [{ n: num, d: den, kind: 'line', frac: 'nd', models: maxW }], answer: { n: num, d: den },
                        wholeMm: maxW === 3 ? 22 : 32, fracAt: 'below' });
                    return;
                }
                const den = pick(_filterDens([2, 3, 4, 5, 6, 8, 10]));
                const num = rng(1, den - 1);
                q.text = form === 1 ? `Count the jumps from 0. What fraction is at the dot?` : `What fraction is at the dot?`;
                q.ans = `${num}/${den}`;
                q.hint = `The line from 0 to 1 is cut into ${den} equal parts. Count the parts from 0 to the dot.`;
                // the fraction boxes beside the line (a 0-1 line keeps to one of two columns at every
                // size, so Size S holds more rows than L)
                _fKit(q, { task: 'write', terms: [{ n: num, d: den, kind: 'line', frac: 'nd' }], answer: { n: num, d: den },
                    wholeMm: _fWriteWhole('line'), hops: form === 1 });
                return;

            } else if (fracSkill === "whole_as_fraction") {
                // Grade 3: Express whole number as fraction
                //
                // THE PICTURE (P7.1, WORKSHEET_DESIGN_STANDARD RP-1, RP-90, INK-3). The bars used
                // to be coloured `--accent-cyan`, which print turned into solid black slabs whose
                // black partitions vanished into them, a second model (a pie) sat under the first
                // (RP-4: one visual per cell), and the captions printed the answer ("1 whole =
                // 1/1", "All 6 parts are filled = 1 whole") under every item. Now: one bar model,
                // shaded parts in the one grey, every partition an ink line, no caption.
                const mode = Math.random() < 0.5 ? "whole_over_1" : "one_as_fraction";
                let questionText, answer, hintText, visualHTML;
                const SHADE = '#949494';        // INK-3(a): the fill of a shaded part
                const LINE = 'var(--text-bright, #000)';
                // One whole, `parts` equal parts, every part shaded. Outline 1.5, partitions 0.75.
                const wholeBar = (parts, w, h) => {
                    const segW = w / parts;
                    let body = `<rect x="0.75" y="0.75" width="${(w - 1.5).toFixed(2)}" height="${(h - 1.5).toFixed(2)}" fill="${SHADE}" stroke="none"/>`;
                    for (let i = 1; i < parts; i++) {
                        const x = (i * segW).toFixed(2);
                        body += `<line x1="${x}" y1="0.75" x2="${x}" y2="${(h - 0.75).toFixed(2)}" stroke="${LINE}" stroke-width="0.75"/>`;
                    }
                    body += `<rect x="0.75" y="0.75" width="${(w - 1.5).toFixed(2)}" height="${(h - 1.5).toFixed(2)}" fill="none" stroke="${LINE}" stroke-width="1.5"/>`;
                    return `<svg class="waf-bar" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;">${body}</svg>`;
                };

                if (mode === "whole_over_1") {
                    const whole = rng(1, 10);
                    questionText = `Write ${whole} as a fraction with denominator 1.`;
                    answer = `${whole}/1`;
                    hintText = `Any whole number can be written as that number over 1. ${whole} = ${whole}/1.`;

                    // Every whole is drawn (RP-92: values above 1 are a row of whole models with a
                    // gap), so ten wholes are ten bars, never six and an ellipsis. Each whole stays
                    // at least 6 mm across (RP-5).
                    const barW = whole > 6 ? 26 : 40;
                    let bars = '';
                    for (let i = 0; i < whole; i++) bars += wholeBar(1, barW, 30);

                    visualHTML = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Whole Numbers as Fractions</div>
                        <div style="font-size:1.5rem;margin-bottom:14px;">
                            <span style="font-weight:700;">${whole}</span>
                            <span style="margin:0 10px;font-size:1.3rem;">=</span>
                            ${fracHTML('?', '1', 'xl')}
                        </div>
                        <div style="display:flex;justify-content:center;gap:11px;flex-wrap:wrap;margin-bottom:8px;">${bars}</div>
                    </div>`;
                } else {
                    const den = pick([2, 3, 4, 5, 6, 8]);
                    questionText = `Write 1 as a fraction with denominator ${den}.`;
                    answer = `${den}/${den}`;
                    hintText = `1 whole = ${den}/${den}. When numerator equals denominator, the fraction equals 1.`;

                    // Fraction bar minimum 52 x 16 mm (section 11.2): 200 x 60 px is 53 x 16 mm.
                    visualHTML = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Whole Numbers as Fractions</div>
                        <div style="font-size:1.5rem;margin-bottom:14px;">
                            <span style="font-weight:700;">1</span>
                            <span style="margin:0 10px;font-size:1.3rem;">=</span>
                            ${fracHTML('?', den, 'xl')}
                        </div>
                        <div style="display:flex;justify-content:center;">${wholeBar(den, 200, 60)}</div>
                    </div>`;
                }

                q.text = questionText;
                q.ans = answer;
                q.answerType = "text";
                q.hint = hintText;
                q.visual = visualHTML;
                return;

            // ==================== END NEW FRACTION SKILLS ====================

            } else if (fracSkill === "fraction_of_set" || fracSkill === "fraction_of_set_hard") {
                // FRACTION OF A SET (3.NF.1, 4.NF.4; WRM Y3.B8.S4-S6). KIT (fractions lane, build
                // list vis_migrate_fraction_ops): the set drawn as open counters, one row per
                // equal group (d rows), black and white on paper and screen - the pupil shades
                // the groups he needs; nothing is shaded for him. Under it the sentence:
                // "3/4 of 12 = [ ]", "[ ]/4 of 12 = 9", or a short story over "3/4 of 12 = [ ]".
                // (The legacy item also asked the pupil to CLICK emoji: a screen-only task.)
                const _fosVariant = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant(fracSkill + '_kit', ['numeric', 'missing', 'word'])
                    : pick(['numeric', 'missing', 'word']);
                q._variant = _fosVariant;
                // Pick denominator: hard biases toward larger denoms.
                const fosDenomPool = fracSkill === "fraction_of_set_hard" ? [3, 4, 5, 6, 6, 8] : [2, 3, 4, 5, 6];
                const fosDen = pick(fosDenomPool);
                // Numerator uniform in [1..den-1]; ~15% chance num == den.
                let fosNum = Math.random() < 0.15 ? fosDen : rng(1, fosDen - 1);
                // For HARD: avoid trivial 1/N most of the time.
                if (fracSkill === "fraction_of_set_hard" && fosNum === 1 && Math.random() < 0.6) fosNum = rng(2, fosDen - 1);
                // The set stays countable: at most 10 in a group, 40 in all (RP-3).
                const fosMultMax = Math.max(2, Math.min(Math.floor(range / fosDen), Math.floor(40 / fosDen), fracSkill === "fraction_of_set_hard" ? 8 : 6));
                const fosMultiplier = rng(2, fosMultMax);
                const fosTotal = fosDen * fosMultiplier;
                const fosAnswer = fosNum * fosMultiplier;
                let _fosAm;
                if (_fosVariant === 'missing' && fosNum < fosDen) {
                    q.text = `?/${fosDen} of ${fosTotal} = ${fosAnswer}. Find the missing numerator.`;
                    q.ans = fosNum;
                    q.hint = `Each group has ${fosTotal} ÷ ${fosDen} = ${fosMultiplier}. ${fosAnswer} ÷ ${fosMultiplier} = ${fosNum} groups.`;
                    _fosAm = { ask: 'num', answer: { value: fosNum } };
                } else if (_fosVariant === 'word') {
                    const wpItems = pick(["marbles", "stickers", "crayons", "cookies", "buttons", "beads", "apples", "stars"]);
                    const wpColor = pick(["blue", "red", "green", "yellow", "purple", "orange"]);
                    const story = [`There are ${fosTotal} ${wpItems}.`, `${fosNum}/${fosDen} of them are ${wpColor}.`, `How many are ${wpColor}?`];
                    q.text = story.join(' ');
                    q.ans = fosAnswer;
                    q.hint = `Find ${fosNum}/${fosDen} of ${fosTotal}: ${fosTotal} ÷ ${fosDen} = ${fosMultiplier}, then × ${fosNum} = ${fosAnswer}.`;
                    _fosAm = { ask: 'part', answer: { value: fosAnswer }, story };
                } else {
                    q.text = `What is ${fosNum}/${fosDen} of ${fosTotal}?`;
                    q.ans = fosAnswer;
                    q.hint = fosNum === 1
                        ? `Divide ${fosTotal} into ${fosDen} equal groups. Each group has ${fosTotal} ÷ ${fosDen} = ${fosMultiplier} objects.`
                        : `Divide ${fosTotal} into ${fosDen} equal groups (${fosMultiplier} each), then take ${fosNum} groups: ${fosNum} × ${fosMultiplier} = ${fosAnswer}.`;
                    _fosAm = { ask: 'part', answer: { value: fosAnswer } };
                }
                q.answerType = "number";
                q.options = [];
                q.printFormat = 'fraction-of-set';
                q.skillLabel = 'Frac of Set';
                _fKit(q, Object.assign({ task: 'amount', pic: 'set', n: fosNum, d: fosDen, total: fosTotal, part: fosAnswer }, _fosAm));
                return;
            } else if (fracSkill === "equiv_frac_visual") {
                // Equivalent Fractions Visual — 4 problem types
                const efvBaseDens = [2, 3, 4, 5, 6];
                const efvBaseDen = pick(efvBaseDens);
                const efvBaseNum = rng(1, efvBaseDen - 1);
                // O6 `model`: the ticked model (else circles), both fractions on the SAME whole.
                const _efvModel = _fModelPick();
                // a circle keeps to 12 parts at most (a 24-part circle is slivers: options-r3)
                const _efvMults = [2, 3, 4].filter(m => (_efvModel && _efvModel !== 'circle') || efvBaseDen * m <= 12);
                const efvMultiplier = pick(_efvMults.length ? _efvMults : [2]);
                const efvEquivNum = efvBaseNum * efvMultiplier;
                const efvEquivDen = efvBaseDen * efvMultiplier;

                const efvRoll = Math.random();
                if (efvRoll < 0.30) {
                    // Type 1: Both circles shaded, write equivalent fraction
                    q.text = `Look at the two fraction models. Write each fraction and tell if they are equivalent.`;
                    q.ans = `${efvEquivNum}/${efvEquivDen}`;
                    q.answerType = "text";
                    q.hint = `The first circle shows ${efvBaseNum}/${efvBaseDen}. Count the shaded parts in the second circle. Multiply numerator and denominator by ${efvMultiplier}.`;
                    q.visual = '';
                    q.fractionData = { num1: efvBaseNum, den1: efvBaseDen, num2: efvEquivNum, den2: efvEquivDen, isEquivalent: true, missingPart: null, printType: pick(['both_shaded', 'shade_second', 'fill_numbers']) };
                } else if (efvRoll < 0.55) {
                    // Type 2: One circle shaded, identify the equivalent fraction
                    q.text = `The first model shows ${efvBaseNum}/${efvBaseDen}. What equivalent fraction does the second model show?`;
                    q.ans = `${efvEquivNum}/${efvEquivDen}`;
                    q.answerType = "text";
                    q.hint = `The second circle has ${efvEquivDen} equal parts with ${efvEquivNum} shaded. Multiply top and bottom of ${efvBaseNum}/${efvBaseDen} by ${efvMultiplier}.`;
                    q.visual = '';
                    q.fractionData = { num1: efvBaseNum, den1: efvBaseDen, num2: efvEquivNum, den2: efvEquivDen, isEquivalent: true, missingPart: null, printType: pick(['shade_second', 'fill_numbers', 'both_shaded']) };
                } else if (efvRoll < 0.80) {
                    // Type 3: Both circles shown, compare with = or ≠
                    const efvIsEquiv = Math.random() < 0.5;
                    let efvCmpNum2, efvCmpDen2;
                    if (efvIsEquiv) {
                        efvCmpNum2 = efvEquivNum;
                        efvCmpDen2 = efvEquivDen;
                    } else {
                        // Generate a meaningful non-equivalent fraction distractor
                        efvCmpDen2 = efvEquivDen;
                        const distractorStrategies = [
                            // Strategy: add to both num and den (common student error)
                            { fn: () => ({ n: efvBaseNum + efvMultiplier, d: efvBaseDen + efvMultiplier }),
                              msg: "Looks like you added the same number to the top and bottom — that changes the fraction's value. To make an equivalent fraction, MULTIPLY (or divide) the top and bottom by the same number." },
                            // Strategy: flip numerator and denominator of base
                            { fn: () => ({ n: efvBaseDen * efvMultiplier, d: efvBaseNum * efvMultiplier }),
                              msg: "That fraction is the reciprocal (top and bottom swapped). Equivalent fractions keep the same numerator-to-denominator ratio." },
                            // Strategy: multiply only numerator (forget denominator)
                            { fn: () => ({ n: efvEquivNum, d: efvBaseDen }),
                              msg: "It looks like only the top was multiplied. To stay equivalent you must multiply BOTH the numerator and denominator by the same number." },
                            // Strategy: multiply only denominator (forget numerator)
                            { fn: () => ({ n: efvBaseNum, d: efvEquivDen }),
                              msg: "It looks like only the bottom was multiplied. To stay equivalent you must multiply BOTH the numerator and denominator by the same number." },
                            // Strategy: use a different multiplier
                            { fn: () => {
                                const altMult = efvMultiplier === 2 ? 3 : 2;
                                return { n: efvBaseNum * altMult, d: efvBaseDen * efvMultiplier };
                            },
                              msg: "Different multipliers were used on the top and bottom. The SAME number must multiply both for an equivalent fraction." }
                        ];
                        const strategy = pick(distractorStrategies);
                        const distractor = strategy.fn();
                        // a proper fraction on one whole: the denominator first, then the numerator under it
                        efvCmpDen2 = Math.max(2, distractor.d);
                        if (efvCmpDen2 > 12 && (!_efvModel || _efvModel === 'circle')) efvCmpDen2 = efvEquivDen;
                        efvCmpNum2 = Math.max(1, Math.min(efvCmpDen2 - 1, distractor.n));
                        // Ensure it's actually non-equivalent
                        if (efvCmpNum2 * efvBaseDen === efvBaseNum * efvCmpDen2) {
                            // one part off the equivalent fraction: never equal, always proper
                            efvCmpDen2 = efvEquivDen;
                            efvCmpNum2 = efvEquivNum + 1 < efvEquivDen ? efvEquivNum + 1 : efvEquivNum - 1;
                        }
                        // Tag the wrong choice ("=" since correct answer is "≠") with the
                        // misconception message corresponding to the strategy used.
                        if (typeof window !== 'undefined' && typeof window.tagDistractor === 'function') {
                            window.tagDistractor(q, "=", strategy.msg);
                        }
                    }
                    q.text = `Are these fractions equivalent? Answer = or \u2260`;
                    q.ans = efvIsEquiv ? "=" : "\u2260";
                    q.answerType = "text";
                    q.options = ["=", "\u2260"];
                    q.hint = efvIsEquiv
                        ? `Both fractions equal ${(efvBaseNum / efvBaseDen).toFixed(2)} so they are equivalent.`
                        : `${efvBaseNum}/${efvBaseDen} = ${(efvBaseNum / efvBaseDen).toFixed(2)} but ${efvCmpNum2}/${efvCmpDen2} = ${(efvCmpNum2 / efvCmpDen2).toFixed(2)}, so they are NOT equivalent.`;
                    q.visual = '';
                    q.fractionData = { num1: efvBaseNum, den1: efvBaseDen, num2: efvCmpNum2, den2: efvCmpDen2, isEquivalent: efvIsEquiv, missingPart: null, printType: pick(['compare', 'shade_both_compare']) };
                } else {
                    // Type 4: Find missing numerator or denominator
                    const efvMissNum = Math.random() < 0.5; // true = missing numerator
                    if (efvMissNum) {
                        q.text = `Find the missing number: ${efvBaseNum}/${efvBaseDen} = ?/${efvEquivDen}`;
                        q.ans = efvEquivNum;
                        q.hint = `Multiply the numerator by ${efvMultiplier}: ${efvBaseNum} × ${efvMultiplier} = ${efvEquivNum}.`;
                    } else {
                        q.text = `Find the missing number: ${efvBaseNum}/${efvBaseDen} = ${efvEquivNum}/?`;
                        q.ans = efvEquivDen;
                        q.hint = `Multiply the denominator by ${efvMultiplier}: ${efvBaseDen} × ${efvMultiplier} = ${efvEquivDen}.`;
                    }
                    q.answerType = "number";
                    q.visual = '';
                    q.fractionData = { num1: efvBaseNum, den1: efvBaseDen, num2: efvEquivNum, den2: efvEquivDen, isEquivalent: true, missingPart: efvMissNum ? "num2" : "den2", printType: 'missing_number' };
                }
                // KIT (O6 lane AP3): both fractions on the SAME whole, the kit's `frac-model` cell for
                // paper, key and screen. Circles unless the teacher ticked other models.
                {
                    const fd = q.fractionData;
                    const kind = _efvModel || 'circle';
                    fd.model = kind;
                    q.fractionModel = kind;
                    const t1 = { n: fd.num1, d: fd.den1, kind };
                    if (q.answerType === 'text' && q.options && q.options.length) {
                        // = or not equal: the sign in the circle between the two pictures
                        q.answerType = 'symbol';
                        _fKit(q, { task: 'sign', terms: [t1, { n: fd.num2, d: fd.den2, kind }], joins: ['sign'], signs: ['=', '\u2260'], answer: { sign: q.ans }, wholeMm: 30 });
                    } else if (fd.missingPart) {
                        const frac = fd.missingPart === 'num2' ? 'n' : 'd';
                        _fKit(q, { task: 'op', terms: [t1, { n: fd.num2, d: fd.den2, kind, frac }], joins: ['='], answer: { n: fd.num2, d: fd.den2 }, wholeMm: 30 });
                    } else {
                        // write the fraction the second picture shows
                        q.text = `The first model shows ${fd.num1}/${fd.den1}. Write the fraction the second model shows.`;
                        q.noSimplify = true;
                        _fKit(q, { task: 'op', terms: [t1, { n: fd.num2, d: fd.den2, kind, frac: 'nd' }], joins: ['='], answer: { n: fd.num2, d: fd.den2 }, wholeMm: 30 });
                    }
                }
                q.printFormat = 'equiv-frac-visual';
                q.skillLabel = 'Equiv Frac (Visual)';

            } else if (fracSkill === "equiv_frac_nv") {
                // Equivalent fractions, numbers only (3.NF.A.3b, 4.NF.A.1; WRM Y4.B7.S10, Y5.B4.S1).
                // KIT (fractions lane, vis_migrate_fraction_ops): four forms, one thing each -
                //   up    2/3 = [ ]/12   (missing numerator, multiply up)
                //   upD   2/3 = 8/[ ]    (missing denominator, multiply up)
                //   same  2/3 ( ) 8/12   (= or ≠ in the circle; the ≠ pairs are the real errors)
                //   down  8/12 = [ ]/3   (divide down)
                // with operator arcs (× n / ÷ n over the numerators and under the denominators) as
                // the `opArcs` option. The old drag-into-bins and "click ALL" forms were legacy print
                // and were dropped: the = / ≠ form asks the same question one pair at a time.
                const nvForm = window.pickVariant
                    ? window.pickVariant('equiv_frac_nv', ['up', 'upD', 'same', 'down'])
                    : pick(['up', 'upD', 'same', 'down']);
                const _nvArcsOpt = (state.skillOptions && state.skillOptions.opArcs) || 'blank';
                const _nvArcs = (op, k) => (_nvArcsOpt === 'none' ? null : { op, k, show: _nvArcsOpt === 'value' ? 'value' : 'blank' });
                const baseDen = pick([2, 3, 4, 5, 6]);
                const baseNum = rng(1, baseDen - 1);
                const m = pick([2, 3, 4]);
                const eqNum = baseNum * m, eqDen = baseDen * m;
                q.options = [];
                q.skillLabel = 'Equiv Frac (NV)';
                if (nvForm === 'same') {
                    const isEquiv = Math.random() < 0.5;
                    let n2 = eqNum, d2 = eqDen;
                    if (!isEquiv) {
                        // the ≠ pair is a real error: the same number ADDED to both parts, only one
                        // part multiplied, or two different multipliers.
                        const errs = [
                            () => [baseNum + m, baseDen + m],
                            () => [eqNum, baseDen],
                            () => [baseNum, eqDen],
                            () => [baseNum * (m === 2 ? 3 : 2), eqDen],
                        ];
                        [n2, d2] = pick(errs)();
                        if (n2 >= d2) [n2, d2] = [baseNum + m, baseDen + m];
                        if (n2 * baseDen === baseNum * d2) n2 += 1;
                    }
                    q.text = `Are ${baseNum}/${baseDen} and ${n2}/${d2} equivalent? Write = or \u2260.`;
                    q.ans = isEquiv ? '=' : '\u2260';
                    q.answerType = 'symbol';
                    q.hint = isEquiv
                        ? `Multiply the top and the bottom of ${baseNum}/${baseDen} by ${m}: you get ${eqNum}/${eqDen}.`
                        : `Multiply the top and the bottom of ${baseNum}/${baseDen} by the same number. Can you get ${n2}/${d2}?`;
                    _fKit(q, { task: 'sign', terms: [{ n: baseNum, d: baseDen }, { n: n2, d: d2 }], joins: ['sign'], signs: ['=', '\u2260'], answer: { sign: q.ans } });
                    return;
                }
                q.answerType = 'number';
                if (nvForm === 'down') {
                    q.text = `Find the missing number: ${eqNum}/${eqDen} = ?/${baseDen}`;
                    q.ans = baseNum;
                    q.hint = `The denominator was divided by ${m} (${eqDen} \u00f7 ${m} = ${baseDen}), so divide the numerator by ${m} too: ${eqNum} \u00f7 ${m} = ${baseNum}.`;
                    _fKit(q, { task: 'op', terms: [{ n: eqNum, d: eqDen }, { n: baseNum, d: baseDen, frac: 'n' }], joins: ['='],
                        answer: { n: baseNum, d: baseDen }, arcs: _nvArcs('\u00f7', m) });
                    return;
                }
                if (nvForm === 'upD') {
                    q.text = `Find the missing number: ${baseNum}/${baseDen} = ${eqNum}/?`;
                    q.ans = eqDen;
                    q.hint = `The numerator was multiplied by ${m} (${baseNum} \u00d7 ${m} = ${eqNum}), so multiply the denominator by ${m} too: ${baseDen} \u00d7 ${m} = ${eqDen}.`;
                    _fKit(q, { task: 'op', terms: [{ n: baseNum, d: baseDen }, { n: eqNum, d: eqDen, frac: 'd' }], joins: ['='],
                        answer: { n: eqNum, d: eqDen }, arcs: _nvArcs('\u00d7', m) });
                    return;
                }
                q.text = `Find the missing number: ${baseNum}/${baseDen} = ?/${eqDen}`;
                q.ans = eqNum;
                q.hint = `The denominator was multiplied by ${m} (${baseDen} \u00d7 ${m} = ${eqDen}), so multiply the numerator by ${m} too: ${baseNum} \u00d7 ${m} = ${eqNum}.`;
                _fKit(q, { task: 'op', terms: [{ n: baseNum, d: baseDen }, { n: eqNum, d: eqDen, frac: 'n' }], joins: ['='],
                    answer: { n: eqNum, d: eqDen }, arcs: _nvArcs('\u00d7', m) });
                return;

            } else if (fracSkill === "order_fractions" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-order modernization of legacy "interactive ordering"
                const count = pick([4, 5]);
                const denPool = [2, 3, 4, 5, 6, 8, 10, 12];
                const fracs = [];
                const usedValues = new Set();
                let attempts = 0;
                while (fracs.length < count && attempts < 100) {
                    attempts++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const val = n / d;
                    const valKey = val.toFixed(6);
                    if (!usedValues.has(valKey)) {
                        usedValues.add(valKey);
                        fracs.push({ n, d, val, str: _fracStr(n, d) });
                    }
                }
                const direction = pick(["asc", "desc"]);
                const sorted = [...fracs].sort((a, b) => direction === "asc" ? a.val - b.val : b.val - a.val);
                const presentation = shuffle(fracs.map((f, i) => ({ id: 't' + i, label: f.str, val: f.val })));
                const ans = sorted.map(f => presentation.find(t => Math.abs(t.val - f.val) < 1e-9).id);
                q.text = `Drag the fractions from ${direction === "asc" ? "least to greatest" : "greatest to least"}.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = direction === "asc" ? "least to greatest" : "greatest to least";
                q.hint = `Convert to a common denominator or compare to benchmarks like 1/2.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Order Fractions';
                return;
            } else if (fracSkill === "order_fractions") {
                // Grade 4: Interactive click-to-order 3-6 fractions least-to-greatest or greatest-to-least
                const count = randInt(3, 6);
                const denPool = [2, 3, 4, 5, 6, 8, 10, 12];
                const fracs = [];
                const usedValues = new Set();
                let attempts = 0;
                while (fracs.length < count && attempts < 100) {
                    attempts++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const val = n / d;
                    const valKey = val.toFixed(6);
                    if (!usedValues.has(valKey)) {
                        usedValues.add(valKey);
                        fracs.push({ n, d, val, str: _fracStr(n, d) });
                    }
                }
                const direction = pick(["asc", "desc"]);
                const sorted = [...fracs].sort((a, b) => direction === "asc" ? a.val - b.val : b.val - a.val);
                const orderItems = fracs.map(f => f.str);
                const correctOrder = sorted.map(f => f.str);

                q.text = `Order these fractions from ${direction === "asc" ? "least to greatest" : "greatest to least"}:`;
                q.ans = correctOrder.join(",");
                q.answerType = "interactive";
                q.interactiveType = "ordering";
                q.orderMode = "click";
                q.orderDirection = direction;
                q.orderIcon = direction === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least";
                q.numbers = orderItems;
                q.sortedNumbers = correctOrder;
                q.hint = `Convert to a common denominator or compare to benchmarks like 1/2.`;
                q.options = [];
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Order Fractions</div>
                    <div style="font-size:0.9rem;margin-bottom:10px;">${direction === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least"}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:15px;margin:15px 0;">
                        ${fracs.map(f => `<div style="text-align:center;">
                            ${fracCircleSVG(f.n, f.d, 50, 'var(--accent-cyan)', 'var(--bg-card-light)')}
                            <div style="margin-top:4px;font-size:1rem;font-weight:600;">${fracHTML(f.n, f.d, 'md')}</div>
                        </div>`).join('')}
                    </div>
                </div>`;
                q.printFormat = "fraction-order";
                q.skillLabel = "Order Fractions";
                return;

            } else if (fracSkill === "order_frac_numline" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-order modernization — drag fractions in order along the number line
                // Ensure denominator is large enough to provide unique positions
                const wantCount = pick([4, 5]);
                const denChoices = [4, 5, 6, 8, 10, 12].filter(d => d - 1 >= wantCount);
                const den = pick(denChoices);
                const count = wantCount;
                const positions = [];
                const usedPos = new Set();
                let posAttempts = 0;
                while (positions.length < count && posAttempts < 200) {
                    posAttempts++;
                    const n = rng(1, den - 1);
                    if (!usedPos.has(n)) {
                        usedPos.add(n);
                        positions.push(n);
                    }
                }
                // Defensive: enumerate sequentially if random sampling failed
                if (positions.length < count) {
                    for (let n = 1; n < den && positions.length < count; n++) {
                        if (!usedPos.has(n)) { usedPos.add(n); positions.push(n); }
                    }
                }
                const fracs = positions.map(n => {
                    const [sn, sd] = _simplify(n, den);
                    return { n, d: den, val: n / den, str: _fracStr(sn, sd) };
                });
                const direction = pick(["asc", "desc"]);
                const sorted = [...fracs].sort((a, b) => direction === "asc" ? a.val - b.val : b.val - a.val);
                const presentation = shuffle(fracs.map((f, i) => ({ id: 't' + i, label: f.str, val: f.val })));
                const ans = sorted.map(f => presentation.find(t => Math.abs(t.val - f.val) < 1e-9).id);
                q.text = `Drag the fractions from ${direction === "asc" ? "least to greatest" : "greatest to least"} on the number line.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = direction === "asc" ? "least to greatest" : "greatest to least";
                q.hint = `Imagine each fraction's position between 0 and 1. The line is divided into ${den} equal parts.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Fractions on Number Line';
                return;
            } else if (fracSkill === "order_frac_numline") {
                // Grade 4: SVG number line with lettered dots, identify position as MC
                const pointCount = pick([4, 5]);
                // Filter denominators to those that can yield enough unique positions in 1..den-1
                const denChoices = [4, 5, 6, 8].filter(d => d - 1 >= pointCount);
                const den = pick(denChoices);
                const positions = [];
                const usedPos = new Set();
                let posAttempts = 0;
                while (positions.length < pointCount && posAttempts < 200) {
                    posAttempts++;
                    const n = rng(1, den - 1);
                    if (!usedPos.has(n)) {
                        usedPos.add(n);
                        positions.push(n);
                    }
                }
                // Defensive: enumerate sequentially if random sampling failed
                if (positions.length < pointCount) {
                    for (let n = 1; n < den && positions.length < pointCount; n++) {
                        if (!usedPos.has(n)) { usedPos.add(n); positions.push(n); }
                    }
                }
                const labels = ["A", "B", "C", "D", "E"].slice(0, pointCount);
                const targetIdx = rng(0, pointCount - 1);
                const targetPos = positions[targetIdx];
                const [sn, sd] = _simplify(targetPos, den);
                const correctLetter = labels[targetIdx];

                // Build SVG number line
                const W = 440, H = 110, lineY = 55, leftX = 30, rightX = W - 30;
                const span = rightX - leftX;
                const totalParts = den;
                const colors = ['var(--accent-cyan)', 'var(--accent-purple)', 'var(--accent-orange)', 'var(--accent-green)', '#e74c3c'];
                let nlSvg = '';
                nlSvg += `<line x1="${leftX}" y1="${lineY}" x2="${rightX}" y2="${lineY}" stroke="var(--text-bright)" stroke-width="2.5"/>`;
                // Ticks
                for (let i = 0; i <= totalParts; i++) {
                    const x = leftX + (i / totalParts) * span;
                    const isWhole = i === 0 || i === totalParts;
                    const tickH = isWhole ? 14 : 8;
                    nlSvg += `<line x1="${x}" y1="${lineY - tickH}" x2="${x}" y2="${lineY + tickH}" stroke="var(--text-bright)" stroke-width="${isWhole ? 2.5 : 1.5}"/>`;
                    if (isWhole) {
                        nlSvg += `<text x="${x}" y="${lineY + 30}" text-anchor="middle" fill="var(--text-bright)" font-size="14" font-weight="bold">${i / totalParts}</text>`;
                    }
                }
                // Lettered dots
                for (let i = 0; i < pointCount; i++) {
                    const x = leftX + (positions[i] / totalParts) * span;
                    nlSvg += `<circle cx="${x}" cy="${lineY}" r="8" fill="${colors[i % colors.length]}" stroke="#fff" stroke-width="2"/>`;
                    nlSvg += `<text x="${x}" y="${lineY - 16}" text-anchor="middle" fill="${colors[i % colors.length]}" font-size="13" font-weight="bold">${labels[i]}</text>`;
                }

                q.text = `Which letter shows ${sn}/${sd} on the number line?`;
                q.ans = correctLetter;
                q.answerType = "multiple-choice";
                q.options = shuffle([...labels]);
                q.hint = `Find the fraction's position between the tick marks. The line is divided into ${den} equal parts.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Fractions on Number Line</div>
                    <svg viewBox="0 0 ${W} ${H}" style="display:block;margin:0 auto;max-width:100%;width:100%;">${nlSvg}</svg>
                </div>`;
                q.printFormat = "fraction-numline-order";
                q.skillLabel = "Fractions on Number Line";
                return;

            } else if (fracSkill === "benchmark_fractions" && Math.random() < 0.20) {
                // Phase 4.5 batch 2: dnd-order variant — order 4 fractions least to greatest
                const denPool = [3, 4, 5, 6, 8, 10, 12];
                const fracs = [];
                const seenVals = new Set();
                let attempts = 0;
                while (fracs.length < 4 && attempts < 100) {
                    attempts++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const val = n / d;
                    const key = val.toFixed(6);
                    if (!seenVals.has(key)) {
                        seenVals.add(key);
                        fracs.push({ n, d, val });
                    }
                }
                const direction = pick(["asc", "desc"]);
                const sorted = [...fracs].sort((a, b) => direction === "asc" ? a.val - b.val : b.val - a.val);
                const presentation = shuffle(fracs.map((f, i) => ({ id: 't' + i, label: f.n + '/' + f.d, val: f.val })));
                const ans = sorted.map(f => presentation.find(t => Math.abs(t.val - f.val) < 1e-9).id);
                q.text = `Drag the fractions from ${direction === "asc" ? "least to greatest" : "greatest to least"} relative to 0, 1/2, and 1.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = direction === "asc" ? "least to greatest" : "greatest to least";
                q.hint = `Use 0, 1/2, and 1 as anchors to estimate each fraction's size.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Benchmark Fractions';
                return;
            } else if (fracSkill === "benchmark_fractions" && Math.random() < 0.20) {
                // Phase 4.5 batch 2: dnd-categorize variant — sort 6 fractions into 3 benchmark bins
                const benchmarks = [
                    { val: 0, label: '0', binId: 'bin0' },
                    { val: 0.5, label: '1/2', binId: 'binHalf' },
                    { val: 1, label: '1', binId: 'bin1' }
                ];
                const denPool = [3, 4, 5, 6, 8, 10, 12];
                const fracs = [];
                const seen = new Set();
                // Try to seed at least 1 per bin
                for (const b of benchmarks) {
                    let safety = 0;
                    while (fracs.filter(f => f.binId === b.binId).length < 1 && safety < 80) {
                        safety++;
                        const d = pick(denPool);
                        const n = rng(1, d - 1);
                        const v = n / d;
                        const key = n + '/' + d;
                        if (seen.has(key)) continue;
                        let closest = benchmarks[0];
                        let bestDist = Math.abs(v - closest.val);
                        for (const bb of benchmarks) {
                            const dd = Math.abs(v - bb.val);
                            if (dd < bestDist) { bestDist = dd; closest = bb; }
                        }
                        if (closest.binId === b.binId) {
                            seen.add(key);
                            fracs.push({ n, d, binId: b.binId });
                        }
                    }
                }
                let safety = 0;
                while (fracs.length < 6 && safety < 200) {
                    safety++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const v = n / d;
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    let closest = benchmarks[0];
                    let bestDist = Math.abs(v - closest.val);
                    for (const bb of benchmarks) {
                        const dd = Math.abs(v - bb.val);
                        if (dd < bestDist) { bestDist = dd; closest = bb; }
                    }
                    seen.add(key);
                    fracs.push({ n, d, binId: closest.binId });
                }
                const tilesArr = shuffle(fracs);
                const tiles = tilesArr.map((f, i) => ({ id: 't' + i, label: f.n + '/' + f.d }));
                const ans = {};
                tilesArr.forEach((f, i) => { ans['t' + i] = f.binId; });
                q.text = `Drag each fraction into the bin for the closest benchmark.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'bin0', label: 'Closer to 0' },
                    { id: 'binHalf', label: 'Closer to 1/2' },
                    { id: 'bin1', label: 'Closer to 1' }
                ];
                q.hint = `Compare each fraction's value to 0, 1/2, and 1. Pick the nearest.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Benchmark Fractions';
                return;
            } else if (fracSkill === "benchmark_fractions" && Math.random() < 0.30) {
                const targetBenchmarks = [
                    { val: 0, label: '0' },
                    { val: 0.5, label: '1/2' },
                    { val: 1, label: '1' }
                ];
                const target = pick(targetBenchmarks);
                const denPool = [3, 4, 5, 6, 8, 10, 12];
                const correctCount = randInt(2, 3);
                const totalCount = randInt(6, 8);
                const correctSet = [];
                const wrongSet = [];
                const seen = new Set();
                let safety = 0;
                while (correctSet.length < correctCount && safety < 200) {
                    safety++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const v = n / d;
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    let closest = targetBenchmarks[0];
                    let bestDist = Math.abs(v - closest.val);
                    for (const b of targetBenchmarks) {
                        const d2 = Math.abs(v - b.val);
                        if (d2 < bestDist) { bestDist = d2; closest = b; }
                    }
                    if (closest.label === target.label) {
                        seen.add(key);
                        correctSet.push({ n, d });
                    }
                }
                safety = 0;
                while (wrongSet.length < (totalCount - correctSet.length) && safety < 200) {
                    safety++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const v = n / d;
                    const key = n + '/' + d;
                    if (seen.has(key)) continue;
                    let closest = targetBenchmarks[0];
                    let bestDist = Math.abs(v - closest.val);
                    for (const b of targetBenchmarks) {
                        const d2 = Math.abs(v - b.val);
                        if (d2 < bestDist) { bestDist = d2; closest = b; }
                    }
                    if (closest.label !== target.label) {
                        seen.add(key);
                        wrongSet.push({ n, d });
                    }
                }
                const all = shuffle([...correctSet, ...wrongSet]);
                const options = all.map((f, i) => {
                    const v = f.n / f.d;
                    let closest = targetBenchmarks[0];
                    let bestDist = Math.abs(v - closest.val);
                    for (const b of targetBenchmarks) {
                        const d2 = Math.abs(v - b.val);
                        if (d2 < bestDist) { bestDist = d2; closest = b; }
                    }
                    return { id: 'opt' + i, label: f.n + '/' + f.d, correct: closest.label === target.label };
                });
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the fractions closest to ${target.label}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `A fraction is closest to ${target.label} if its value is nearer to ${target.label} than to any other benchmark.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Benchmark Fractions';
                return;
            } else if (fracSkill === "benchmark_fractions") {
                // Grade 4: Compare fractions to benchmarks (0, 1/4, 1/2, 3/4, 1)
                const benchmarks = [0, 0.25, 0.5, 0.75, 1];
                const benchmarkLabels = ["0", "1/4", "1/2", "3/4", "1"];
                const denPool = [3, 4, 5, 6, 8, 10, 12];
                const den = pick(denPool);
                const num = rng(1, den - 1);
                const val = num / den;
                // Find closest benchmark
                let closestIdx = 0;
                let closestDist = Math.abs(val - benchmarks[0]);
                for (let i = 1; i < benchmarks.length; i++) {
                    const dist = Math.abs(val - benchmarks[i]);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestIdx = i;
                    }
                }
                const correctBenchmark = benchmarkLabels[closestIdx];

                // Build visual: number line from 0 to 1 with benchmarks
                const W = 440, H = 100, lineY = 50, leftX = 30, rightX = W - 30;
                const bmSpan = rightX - leftX;
                let bmSvg = '';
                bmSvg += `<line x1="${leftX}" y1="${lineY}" x2="${rightX}" y2="${lineY}" stroke="var(--text-bright)" stroke-width="2.5"/>`;
                // Benchmark ticks and labels
                for (let i = 0; i < benchmarks.length; i++) {
                    const x = leftX + benchmarks[i] * bmSpan;
                    bmSvg += `<line x1="${x}" y1="${lineY - 12}" x2="${x}" y2="${lineY + 12}" stroke="var(--text-bright)" stroke-width="2"/>`;
                    bmSvg += `<text x="${x}" y="${lineY + 28}" text-anchor="middle" fill="var(--text-bright)" font-size="11" font-weight="bold">${benchmarkLabels[i]}</text>`;
                }
                // Fraction dot
                const fracX = leftX + val * bmSpan;
                bmSvg += `<circle cx="${fracX}" cy="${lineY}" r="7" fill="var(--accent-green)" stroke="#fff" stroke-width="2"/>`;
                bmSvg += `<text x="${fracX}" y="${lineY - 16}" text-anchor="middle" fill="var(--accent-green)" font-size="12" font-weight="bold">${num}/${den}</text>`;

                q.text = `Is ${num}/${den} closest to 0, 1/4, 1/2, 3/4, or 1?`;
                q.ans = correctBenchmark;
                q.answerType = "multiple-choice";
                q.options = shuffle([...benchmarkLabels]);
                q.hint = `Compare the fraction to each benchmark to find the closest. ${num}/${den} = ${val.toFixed(3)} as a decimal.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Benchmark Fractions</div>
                    <svg viewBox="0 0 ${W} ${H}" style="display:block;margin:0 auto;max-width:100%;width:100%;">${bmSvg}</svg>
                </div>`;
                q.printFormat = "fraction-benchmark";
                q.skillLabel = "Benchmark Fractions";
                return;

            } else if (fracSkill === "compare_frac_lcd" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-order modernization — order 3-4 fractions with unlike denominators
                const count = pick([3, 4]);
                const denPool = [2, 3, 4, 5, 6, 8, 10, 12];
                const fracs = [];
                const usedValues = new Set();
                let attempts = 0;
                while (fracs.length < count && attempts < 100) {
                    attempts++;
                    const d = pick(denPool);
                    const n = rng(1, d - 1);
                    const val = n / d;
                    const valKey = val.toFixed(6);
                    if (!usedValues.has(valKey)) {
                        usedValues.add(valKey);
                        fracs.push({ n, d, val, str: _fracStr(n, d) });
                    }
                }
                const direction = pick(["asc", "desc"]);
                const sorted = [...fracs].sort((a, b) => direction === "asc" ? a.val - b.val : b.val - a.val);
                const presentation = shuffle(fracs.map((f, i) => ({ id: 't' + i, label: f.str, val: f.val })));
                const ans = sorted.map(f => presentation.find(t => Math.abs(t.val - f.val) < 1e-9).id);
                q.text = `Drag the fractions from ${direction === "asc" ? "least to greatest" : "greatest to least"}.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = direction === "asc" ? "least to greatest" : "greatest to least";
                q.hint = `Find a common denominator (LCD) and compare numerators.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Compare (LCD)';
                return;
            } else if (fracSkill === "compare_frac_lcd") {
                // Grade 4: Find LCD, convert fractions, compare with >, <, =
                const denPool = [2, 3, 4, 5, 6, 8, 10, 12];
                const d1 = pick(denPool);
                let d2 = pick(denPool);
                while (d2 === d1) d2 = pick(denPool);
                const n1 = rng(1, d1 - 1);
                const n2 = rng(1, d2 - 1);
                const lcd = _lcm(d1, d2);
                const equiv1 = n1 * (lcd / d1);
                const equiv2 = n2 * (lcd / d2);
                let correctSymbol;
                if (equiv1 > equiv2) correctSymbol = ">";
                else if (equiv1 < equiv2) correctSymbol = "<";
                else correctSymbol = "=";

                q.text = `Compare: ${n1}/${d1} ___ ${n2}/${d2}  (Use >, <, or =)`;
                q.ans = correctSymbol;
                q.answerType = "multiple-choice";
                q.options = [">", "<", "="];
                q.hint = `Find the LCD of ${d1} and ${d2}, which is ${lcd}. Convert: ${n1}/${d1} = ${equiv1}/${lcd} and ${n2}/${d2} = ${equiv2}/${lcd}. Then compare numerators.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Compare Fractions (LCD)</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:15px;">
                        ${fracHTML(n1, d1, 'xl')}
                        <span style="font-size:2rem;color:var(--accent-orange);font-weight:700;">?</span>
                        ${fracHTML(n2, d2, 'xl')}
                    </div>
                    <div style="background:var(--bg-card);padding:12px 20px;border-radius:10px;display:inline-block;">
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:6px;">LCD = <span style="display:inline-block;min-width:40px;border-bottom:2px solid var(--text-dim);">&nbsp;</span></div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                            ${fracHTML('?', '?', 'lg')}
                            <span style="font-size:1.5rem;color:var(--accent-orange);font-weight:700;">?</span>
                            ${fracHTML('?', '?', 'lg')}
                        </div>
                    </div>
                </div>`;
                q.printFormat = "fraction-compare-lcd";
                q.skillLabel = "Compare (LCD)";
                return;

            } else if (fracSkill === "graph_fractions") {
                // Grade 3: Place fractions on a number line (click/tap)
                const denChoices = [2, 3, 4, 6, 8];
                const den = pick(denChoices);
                const num = rng(1, den - 1);
                const [sn, sd] = _simplify(num, den);

                q.text = `Place ${sn}/${sd} on the number line by clicking the correct tick mark.`;
                // Same paper wording as fraction_number_line's placement item: the screen keeps
                // "click", the printed cell takes the `line-mark` string from the instruction
                // library, and the key names the fraction (q.ans is the tick INDEX the screen
                // checks, and a key reading "2" cannot be marked against a pencil mark).
                q.printText = `Mark ${sn}/${sd} on the line.`;
                q.ans = num; // tick index
                q.printAnswer = `${sn}/${sd} — tick mark ${num} of ${den} after 0`;
                q.answerType = "number-line-place";
                q.hint = `Count the equal parts between 0 and 1. The line has ${den} parts. ${sn}/${sd} is at position ${num}.`;
                q.printFormat = "fraction-numberline";
                q.skillLabel = "Graph Fractions";
                q.nlpDen = den;
                q.nlpCorrectTick = num;

                // Build inline number line SVG with clickable ticks
                const gfW = 440, gfH = 110, gfLineY = 55, gfLeftX = 30, gfRightX = gfW - 30;
                const gfSpan = gfRightX - gfLeftX;
                let gfSvg = '';
                gfSvg += `<line x1="${gfLeftX}" y1="${gfLineY}" x2="${gfRightX}" y2="${gfLineY}" stroke="var(--text-bright)" stroke-width="2.5"/>`;
                for (let i = 0; i <= den; i++) {
                    const x = gfLeftX + (i / den) * gfSpan;
                    const isWhole = i === 0 || i === den;
                    const tickH = isWhole ? 14 : 8;
                    gfSvg += `<line x1="${x}" y1="${gfLineY - tickH}" x2="${x}" y2="${gfLineY + tickH}" stroke="var(--text-bright)" stroke-width="${isWhole ? 2.5 : 1.5}"/>`;
                    if (isWhole) {
                        gfSvg += `<text x="${x}" y="${gfLineY + 30}" text-anchor="middle" fill="var(--text-bright)" font-size="14" font-weight="bold">${i === 0 ? 0 : 1}</text>`;
                    }
                    // Clickable hit areas
                    gfSvg += `<rect x="${x - 12}" y="${gfLineY - 22}" width="24" height="44" fill="transparent" class="fnl-tick-target" data-tick="${i}" onclick="selectNumberLineTick('gf', ${i}, ${den})" style="cursor:pointer;"/>`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Graph Fractions</div>
                    <div style="margin-bottom:8px;font-size:1.3rem;"><strong style="color:var(--accent-green);">${sn}/${sd}</strong></div>
                    <svg viewBox="0 0 ${gfW} ${gfH}" style="display:block;margin:0 auto;max-width:100%;width:100%;" id="gf_svg">${gfSvg}</svg>
                    <div style="margin-top:10px;">
                        <button class="btn btn-primary" id="checkPlacementBtn" onclick="checkNumberLinePlacement()" style="opacity:0.5;pointer-events:none;">Check Placement</button>
                    </div>
                </div>`;
                return;

            } else if (fracSkill === "round_fractions") {
                // Grade 4: Round mixed numbers to nearest whole or nearest 1/2
                const roundType = pick(["whole", "half"]);
                const wholeNum = rng(1, 9);
                const den = pick([3, 4, 5, 6, 8, 10]);
                let num = rng(1, den - 1);
                // Pedagogical guard: when rounding to nearest half, the fraction must NOT
                // already be exactly 1/2 (e.g. 2/4, 3/6, 4/8, 5/10) — otherwise the answer
                // is the number itself and the question is trivial.
                if (roundType === "half") {
                    let _g = 0;
                    while (num * 2 === den && _g++ < 20) num = rng(1, den - 1);
                    if (num * 2 === den) num = (num === 1 ? 2 : num - 1);
                }
                const fracVal = num / den;
                const mixedVal = wholeNum + fracVal;

                let correctAns;
                let options;
                if (roundType === "whole") {
                    correctAns = fracVal >= 0.5 ? wholeNum + 1 : wholeNum;
                    const wrong1 = fracVal >= 0.5 ? wholeNum : wholeNum + 1;
                    const wrong2 = wholeNum + 2;
                    const wrong3 = Math.max(0, wholeNum - 1);
                    options = shuffle([String(correctAns), String(wrong1), String(wrong2), String(wrong3)]);
                } else {
                    // Round to nearest half
                    const halfOptions = [wholeNum, wholeNum + 0.5, wholeNum + 1];
                    let closestHalf = halfOptions[0];
                    let closestDist = Math.abs(mixedVal - halfOptions[0]);
                    for (const h of halfOptions) {
                        const dist = Math.abs(mixedVal - h);
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestHalf = h;
                        }
                    }
                    correctAns = closestHalf;
                    const wrongHalves = halfOptions.filter(h => h !== correctAns);
                    const extra = wholeNum + 1.5;
                    options = shuffle([String(correctAns), ...wrongHalves.map(String), String(extra)]);
                }

                // Mini number line visual
                const rfW = 300, rfH = 70, rfLineY = 35, rfLeftX = 20, rfRightX = rfW - 20;
                const rfSpan = rfRightX - rfLeftX;
                let rfSvg = '';
                rfSvg += `<line x1="${rfLeftX}" y1="${rfLineY}" x2="${rfRightX}" y2="${rfLineY}" stroke="var(--text-bright)" stroke-width="2"/>`;
                // Whole number ticks
                for (let w = wholeNum; w <= wholeNum + 1; w++) {
                    const x = rfLeftX + ((w - wholeNum) / 1) * rfSpan;
                    rfSvg += `<line x1="${x}" y1="${rfLineY - 10}" x2="${x}" y2="${rfLineY + 10}" stroke="var(--text-bright)" stroke-width="2"/>`;
                    rfSvg += `<text x="${x}" y="${rfLineY + 25}" text-anchor="middle" fill="var(--text-bright)" font-size="12" font-weight="bold">${w}</text>`;
                }
                // Half tick
                const halfX = rfLeftX + 0.5 * rfSpan;
                rfSvg += `<line x1="${halfX}" y1="${rfLineY - 6}" x2="${halfX}" y2="${rfLineY + 6}" stroke="var(--text-dim)" stroke-width="1.5"/>`;
                // Fraction dot
                const fracDotX = rfLeftX + fracVal * rfSpan;
                rfSvg += `<circle cx="${fracDotX}" cy="${rfLineY}" r="6" fill="var(--accent-green)" stroke="#fff" stroke-width="1.5"/>`;

                q.text = `Round ${wholeNum} ${num}/${den} to the nearest ${roundType === "whole" ? "whole number" : "half"}.`;
                q.ans = String(correctAns);
                q.answerType = "multiple-choice";
                q.options = options;
                q.hint = `Look at the fraction part ${num}/${den} (${fracVal.toFixed(2)}). Is it more or less than 1/2?`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Round Fractions</div>
                    <div style="font-size:1.3rem;margin-bottom:10px;">${wholeNum} ${fracHTML(num, den, 'lg')}</div>
                    <svg viewBox="0 0 ${rfW} ${rfH}" style="display:block;margin:0 auto;max-width:280px;">${rfSvg}</svg>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-top:6px;">Round to nearest ${roundType === "whole" ? "whole number" : "1/2"}</div>
                </div>`;
                q.printFormat = "fraction-round";
                q.skillLabel = "Round Fractions";
                return;

            } else if (fracSkill === "estimate_frac_ops") {
                // Grade 5: Estimate sums/differences using benchmarks
                const op = pick(["+", "-"]);
                const denPool = [3, 4, 5, 6, 8, 10, 12];
                const d1 = pick(denPool);
                const d2 = pick(denPool);
                const n1 = rng(1, d1 - 1);
                let n2 = rng(1, d2 - 1);
                const val1 = n1 / d1;
                const val2 = n2 / d2;

                // Ensure subtraction doesn't go negative
                if (op === "-" && val1 < val2) {
                    n2 = rng(1, Math.max(1, Math.floor(val1 * d2)));
                }
                const actualVal2 = (op === "-" && n1 / d1 < n2 / d2) ? rng(1, Math.max(1, d2 - 2)) / d2 : n2 / d2;

                // Round each to nearest benchmark (0, 0.5, 1)
                function toBenchmark(v) {
                    if (v <= 0.25) return 0;
                    if (v <= 0.75) return 0.5;
                    return 1;
                }
                function benchmarkStr(v) {
                    if (v === 0) return "0";
                    if (v === 0.5) return "1/2";
                    return "1";
                }
                const b1 = toBenchmark(val1);
                const b2 = toBenchmark(actualVal2);
                const estimated = op === "+" ? b1 + b2 : b1 - b2;
                const estimatedStr = estimated === 0.5 ? "1/2" : String(estimated);

                // Wrong options
                const wrongSet = new Set();
                wrongSet.add(estimatedStr);
                const possibles = ["0", "1/2", "1", "1 1/2", "2"];
                for (const p of possibles) {
                    if (p !== estimatedStr) wrongSet.add(p);
                    if (wrongSet.size >= 5) break;
                }
                const allOptions = Array.from(wrongSet);
                const options = shuffle(allOptions.slice(0, 4));
                if (!options.includes(estimatedStr)) {
                    options[rng(0, 3)] = estimatedStr;
                }

                q.text = `Estimate: ${n1}/${d1} ${op} ${n2}/${d2}`;
                q.ans = estimatedStr;
                q.answerType = "multiple-choice";
                q.options = options;
                q.hint = `Round each fraction to the nearest benchmark (0, 1/2, or 1): ${n1}/${d1} \u2248 ${benchmarkStr(b1)}, ${n2}/${d2} \u2248 ${benchmarkStr(b2)}. Then ${op === "+" ? "add" : "subtract"}: ${benchmarkStr(b1)} ${op} ${benchmarkStr(b2)} = ${estimatedStr}.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Estimate Fraction Operations</div>
                    <div style="font-size:1.3rem;margin-bottom:15px;">
                        ${fracHTML(n1, d1, 'xl')} <span style="margin:0 8px;font-size:1.5rem;">${op}</span> ${fracHTML(n2, d2, 'xl')}
                    </div>
                    <div style="background:var(--bg-card);padding:12px 20px;border-radius:10px;display:inline-block;">
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:6px;">Round to benchmarks:</div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:12px;">
                            <span style="font-size:1.1rem;">${fracHTML(n1, d1, 'md')} <span style="color:var(--accent-orange);">\u2248</span> <strong>${benchmarkStr(b1)}</strong></span>
                            <span style="font-size:1.3rem;">${op}</span>
                            <span style="font-size:1.1rem;">${fracHTML(n2, d2, 'md')} <span style="color:var(--accent-orange);">\u2248</span> <strong>${benchmarkStr(b2)}</strong></span>
                        </div>
                    </div>
                </div>`;
                q.printFormat = "fraction-estimate";
                q.skillLabel = "Estimate Frac Ops";
                return;

            } else if (fracSkill === "identify") {
                // KIT (O6 lane AP3, 2026-09-25): every picture item is the kit's `frac-model` cell -
                // one drawing on paper, in the key and on screen (sheet/cells/frac-model.js).
                const idVariant = window.pickVariant
                    ? window.pickVariant('identify', ['standard', 'pickModel', 'partLabel'], state)
                    : pick(['standard', 'pickModel', 'partLabel']);
                if (idVariant === 'pickModel') {
                    // Pick the model that shows a target fraction
                    const tDen = pick([2, 3, 4, 5, 6, 8]);
                    const tNum = rng(1, tDen - 1);
                    // Build 4 visual options: 1 correct + 3 distractors with same denom
                    const usedKeys = new Set([`${tNum}/${tDen}`]);
                    const distractors = [];
                    let dAttempts = 0;
                    while (distractors.length < 3 && dAttempts < 30) {
                        dAttempts++;
                        const wDen = pick([2, 3, 4, 5, 6, 8]);
                        const wNum = rng(1, wDen - 1);
                        const key = `${wNum}/${wDen}`;
                        if (usedKeys.has(key)) continue;
                        // Skip if the fraction equals the target
                        if (wNum / wDen === tNum / tDen) continue;
                        usedKeys.add(key);
                        distractors.push({ n: wNum, d: wDen });
                    }
                    const all = shuffle([
                        { n: tNum, d: tDen, correct: true },
                        ...distractors.map(x => ({ ...x, correct: false }))
                    ]);
                    // The models are the choices (they used to be thrown away, leaving "3/8" to
                    // match "3/8"): lettered A-D on paper and on screen, the pupil circles or taps
                    // the letter. The ticked models, else circles and bars as the skill drew.
                    const _pmModels = _fChanged('model');
                    const letters = ['A', 'B', 'C', 'D'];
                    const terms = all.map((f, i) => {
                        const useCircle = Math.random() < 0.5;
                        const kind = _pmModels ? pick(_pmModels) : (useCircle ? 'circle' : 'bar');
                        return { n: f.n, d: f.d, kind, frac: 'none', letter: letters[i] };
                    });
                    const right = letters[all.findIndex(f => f.correct)];
                    q.text = `Which model shows ${tNum}/${tDen}?`;
                    q.ans = right;
                    q.answerType = 'multiple-choice';
                    q.options = letters.slice(0, all.length);
                    q.hint = `Count the equal parts (${tDen}). Find the model with ${tNum} of them shaded.`;
                    q.skillLabel = 'Identify Fractions';
                    _fKit(q, { task: 'pick', show: { n: tNum, d: tDen }, terms, answer: { letter: right }, wholeMm: 19, barH: 11 });
                    return;
                }
                if (idVariant === 'partLabel') {
                    // Numeric: numerator or denominator question
                    const plDen = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
                    const plNum = rng(1, plDen - 1);
                    const askNum = Math.random() < 0.5;
                    if (askNum) {
                        q.text = `What is the numerator of ${plNum}/${plDen}?`;
                        q.ans = plNum;
                        q.hint = `The numerator is the TOP number of a fraction.`;
                    } else {
                        q.text = `What is the denominator of ${plNum}/${plDen}?`;
                        q.ans = plDen;
                        q.hint = `The denominator is the BOTTOM number of a fraction.`;
                    }
                    q.answerType = 'number';
                    // Written on paper, so typed on screen (never a row of number buttons): the
                    // printed fraction, the part's name and one box (the kit's `part` task).
                    q.options = [];
                    q.skillLabel = 'Identify Fractions';
                    _fKit(q, { task: 'part', part: askNum ? 'n' : 'd', terms: [{ n: plNum, d: plDen }], answer: { part: q.ans } });
                    return;
                }
                // Level 1: Identify fractions from visual
                const den = pick([2, 3, 4, 5, 6, 8]);
                const num = rng(1, den - 1);
                const simple = simplifyFraction(num, den);
                const wrongs = new Set();
                wrongs.add(`${den - num}/${den}`);
                wrongs.add(`${num}/${den + 1}`);
                wrongs.add(`${Math.min(num + 1, den)}/${den}`);
                shuffle([simple, ...Array.from(wrongs).slice(0, 3)]);   // kept: the draws of the old choice list
                const useCircle = Math.random() < 0.5;
                const _idModel = _fModelPick() || (useCircle ? 'circle' : 'bar');
                // Written, not picked (a production item on paper stays one on screen): the pupil
                // writes the numerator and the denominator; the simplest form is right too.
                q.text = _idModel === 'line' ? `What fraction does the dot show?` : `What fraction is shaded?`;
                q.ans = `${num}/${den}`;
                q.acceptedAnswers = simple !== q.ans ? [q.ans, simple] : [q.ans];
                q.answerType = 'text';
                q.options = [];
                q.hint = _idModel === 'line'
                    ? `Count the equal parts from 0 to 1 (the denominator). Count the parts from 0 to the dot (the numerator).`
                    : `Count the shaded parts (numerator) and total parts (denominator).`;
                q.fractionModel = _idModel;
                q.fractionData = { num, den, model: _idModel };
                q.skillLabel = 'Identify Fractions';
                _fKit(q, { task: 'write', terms: [{ n: num, d: den, kind: _idModel, frac: 'nd' }], answer: { n: num, d: den }, wholeMm: _fWriteWhole(_idModel) });
            } else if (fracSkill === "write_fraction") {
                // Write the fraction shown: the pupil writes the numerator and the denominator in
                // the two boxes of the fraction (paper and screen). Equivalent fractions are NOT
                // accepted: the literal counted parts (2/4 shaded -> 2/4, not 1/2).
                const den = pick([2, 3, 4, 5, 6, 8, 10]);
                const num = rng(1, den - 1);
                const visualPick = Math.random();
                const _wfModel = _fModelPick() || (visualPick < 0.34 ? 'circle' : visualPick < 0.67 ? 'bar' : 'area');
                q.text = _wfModel === 'line' ? `Write the fraction the dot shows.` : `Write the fraction that is shaded.`;
                q.ans = `${num}/${den}`;
                q.answerType = 'text';
                q.noSimplify = true;
                q.hint = _wfModel === 'line'
                    ? `Count the parts from 0 to the dot. That's the numerator. Count the equal parts from 0 to 1. That's the denominator.`
                    : `Count the shaded parts. That's the numerator. Count the total parts. That's the denominator.`;
                q.options = [];
                q.printFormat = 'write-fraction';
                q.fractionData = { num, den, model: _wfModel };
                q.fractionModel = _wfModel;
                q.skillLabel = 'Write Frac';
                _fKit(q, { task: 'write', terms: [{ n: num, d: den, kind: _wfModel, frac: 'nd' }], answer: { n: num, d: den }, wholeMm: _fWriteWhole(_wfModel) });
                return;
            } else if (fracSkill === "shade_fraction") {
                // Shade the fraction: the pupil shades parts of an empty model (any parts: the
                // COUNT is the answer). Paper: shade with a pencil; the key shades the model.
                // Screen: tap the parts (the card's shade handler, or the grid hosts' model mount).
                const den = pick([2, 3, 4, 5, 6, 8, 10]);
                const num = rng(1, den - 1);
                const visualPick = Math.random();
                const _sfModel = _fModelPick() || (visualPick < 0.34 ? 'circle' : visualPick < 0.67 ? 'bar' : 'area');
                // Verb-free on purpose: the screen verb map turns a leading "Shade" into "Tap the parts".
                q.text = `Show ${num}/${den} on the model.`;
                q.ans = String(num);
                q.shadeTarget = num;
                q.answerType = "shade-parts";
                q.hint = `Tap ${num} parts to shade them. Tap again to clear one. The denominator is ${den}: that's how many equal parts.`;
                q.options = [];
                q.printFormat = 'shade-fraction';
                q.fractionData = { num, den, model: _sfModel };
                q.fractionModel = _sfModel;
                q.skillLabel = 'Shade Frac';
                // a bar or a rectangle is short: its fraction stands above it, so the cell is as
                // tall as a circle's and a row of mixed models has no empty band (RUBRIC H13)
                _fKit(q, { task: 'shade', show: { n: num, d: den }, terms: [{ n: num, d: den, kind: _sfModel, blank: true, frac: 'none' }], answer: { shade: num },
                    ...(_sfModel === 'bar' || _sfModel === 'area' ? { showAbove: true } : {}) });
                return;
            } else if (fracSkill === "select_equiv_frac") {
                // MAP-style multi-select-check: "Click ALL fractions equivalent to N/D"
                // Cited as a real MAP sample item ("Choose ALL the expressions
                // equivalent to 1/3"). Uses simple base fractions; distractors include
                // common student errors (added same value to top/bottom, etc.).
                const sefBaseDens = [2, 3, 4, 5, 6, 8];
                const sefBaseDen = pick(sefBaseDens);
                const sefBaseNum = rng(1, sefBaseDen - 1);
                const sefBaseGcd = (function gcd(a, b){ return b === 0 ? a : gcd(b, a % b); })(sefBaseNum, sefBaseDen);
                const sefRedNum = sefBaseNum / sefBaseGcd;
                const sefRedDen = sefBaseDen / sefBaseGcd;
                // Build correct equivalents: x2, x3, x4, x5 of the reduced form
                const correctSet = [];
                for (const m of [2, 3, 4, 5]) {
                    correctSet.push({ n: sefRedNum * m, d: sefRedDen * m });
                }
                // Pick 2-3 correct equivalents
                const cCount = randInt(2, 3);
                const correctPick = shuffle([...correctSet]).slice(0, cCount);
                // Build distractors: common misconceptions (each tagged with msg)
                const wrongCands = [
                    { n: sefBaseNum + 1, d: sefBaseDen + 1, msg: "Looks like 1 was added to both top and bottom. Adding the same number changes the fraction — multiply (or divide) both by the same number instead." },
                    { n: sefBaseNum + 2, d: sefBaseDen + 2, msg: "Looks like 2 was added to both top and bottom. Adding the same number changes the fraction — multiply (or divide) both by the same number instead." },
                    { n: sefRedNum * 2, d: sefRedDen * 3, msg: "Different multipliers were used on top and bottom. Equivalent fractions need the SAME factor on the numerator and denominator." },
                    { n: sefRedNum * 3, d: sefRedDen * 2, msg: "Different multipliers were used on top and bottom. Equivalent fractions need the SAME factor on the numerator and denominator." },
                    { n: sefRedNum + 2, d: sefRedDen * 2, msg: "Mixing addition on the top with multiplication on the bottom doesn't preserve the value. Use the SAME operation and number on both." },
                    { n: sefRedDen, d: sefRedNum * 2, msg: "That's the reciprocal pattern (top and bottom swapped). Equivalent fractions keep the original ratio of top to bottom." },
                ].filter(f => {
                    if (f.d === 0 || f.n === 0 || f.n >= f.d) return false;
                    return (f.n / f.d) !== (sefRedNum / sefRedDen);
                });
                const wCount = 6 - correctPick.length;
                const wrongPick = shuffle(wrongCands).slice(0, wCount);
                // Tag each wrong fraction option with its misconception message so
                // students see specific feedback when they pick a known-bad equiv.
                if (typeof window !== 'undefined' && typeof window.tagDistractor === 'function') {
                    wrongPick.forEach(w => {
                        if (w && w.msg) window.tagDistractor(q, `${w.n}/${w.d}`, w.msg);
                    });
                }
                const all = shuffle([
                    ...correctPick.map(f => ({ ...f, correct: true })),
                    ...wrongPick.map(f => ({ ...f, correct: false }))
                ]);
                const options = all.map((f, i) => ({
                    id: 'opt' + i,
                    label: `${f.n}/${f.d}`,
                    correct: f.correct
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL fractions equivalent to ${sefBaseNum}/${sefBaseDen}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Multiply (or divide) the top AND bottom by the same number to get an equivalent fraction. ${sefBaseNum}/${sefBaseDen} reduces to ${sefRedNum}/${sefRedDen}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Equiv Fractions';
                return;
            } else if (fracSkill === "equivalent") {
                // Equivalent fractions, numbers only (3.NF.A.3b, 4.NF.A.1; WRM Y5.B4.S1-S2). KIT
                // (fractions lane): "2/3 = [ ]/12" with OPERATOR ARCS (build list vis_operator_arcs):
                // an arc over the numerators and one under the denominators, each "× [ ]" for the
                // pupil to fill (or "× 4" shown, the hint; or no arcs) - the `opArcs` option. The
                // yes / no form writes = or ≠ in the circle between the two fractions.
                const eqVariant = window.pickVariant
                    ? window.pickVariant('equivalent', ['standard', 'yesNoEquiv', 'multiSelectHalf'])
                    : pick(['standard', 'yesNoEquiv', 'multiSelectHalf']);
                const _eqArcsOpt = (state.skillOptions && state.skillOptions.opArcs) || 'blank';
                const _eqArcs = (op, k) => (_eqArcsOpt === 'none' ? null : { op, k, show: _eqArcsOpt === 'value' ? 'value' : 'blank' });
                q.skillLabel = 'Equivalent Fractions';
                q.options = [];
                if (eqVariant === 'yesNoEquiv') {
                    // = or not equal: are these two fractions equivalent?
                    const baseDen = pick([2, 3, 4, 5, 6]);
                    const baseNum = rng(1, baseDen - 1);
                    const isEquiv = Math.random() < 0.5;
                    const m = rng(2, 4);
                    let n2 = baseNum * m, d2 = baseDen * m;
                    if (!isEquiv) {
                        // a near miss: one part changed (the common error: only one part multiplied)
                        if (Math.random() < 0.5) n2 += 1; else d2 += 1;
                        if (baseNum * d2 === n2 * baseDen) n2 += 1;
                    }
                    q.text = `Are ${baseNum}/${baseDen} and ${n2}/${d2} equivalent? Write = or \u2260.`;
                    q.ans = isEquiv ? '=' : '\u2260';
                    q.answerType = 'symbol';
                    q.hint = `Multiply top and bottom of ${baseNum}/${baseDen} by the same number. Do you get ${n2}/${d2}?`;
                    _fKit(q, { task: 'sign', terms: [{ n: baseNum, d: baseDen }, { n: n2, d: d2 }], joins: ['sign'], signs: ['=', '\u2260'], answer: { sign: q.ans } });
                    return;
                }
                if (eqVariant === 'multiSelectHalf') {
                    // fractions equal to one half: 1/2 = [ ]/8
                    const d2 = pick([4, 6, 8, 10, 12, 14, 16, 20]);
                    q.text = `Find the missing number: 1/2 = ?/${d2}`;
                    q.ans = d2 / 2;
                    q.answerType = 'number';
                    q.hint = `Half of ${d2} is ${d2 / 2}. The numerator is half the denominator.`;
                    _fKit(q, { task: 'op', terms: [{ n: 1, d: 2 }, { n: d2 / 2, d: d2, frac: 'n' }], joins: ['='], answer: { n: d2 / 2, d: d2 }, arcs: _eqArcs('\u00d7', d2 / 2) });
                    return;
                }
                // Level 1: Equivalent fractions
                const simpleDen = pick([2, 3, 4, 5]);
                const simpleNum = rng(1, simpleDen - 1);
                const multiplier = rng(2, 4);
                const expandedNum = simpleNum * multiplier;
                const expandedDen = simpleDen * multiplier;
                const missNum = Math.random() < 0.5;
                q.text = missNum ? `Find the missing number: ${simpleNum}/${simpleDen} = ?/${expandedDen}` : `Find the missing number: ${simpleNum}/${simpleDen} = ${expandedNum}/?`;
                q.ans = missNum ? expandedNum : expandedDen;
                q.answerType = 'number';
                q.hint = `Multiply both numerator and denominator by the same number (${multiplier}) to get equivalent fractions.`;
                _fKit(q, { task: 'op', terms: [{ n: simpleNum, d: simpleDen }, { n: expandedNum, d: expandedDen, frac: missNum ? 'n' : 'd' }], joins: ['='],
                    answer: { n: expandedNum, d: expandedDen }, arcs: _eqArcs('\u00d7', multiplier) });
                return;
            } else if (fracSkill === "compare") {
                const cmpVariant = window.pickVariant
                    ? window.pickVariant('compare', ['standard', 'numericOnly', 'compareHalf'], state)
                    : pick(['standard', 'numericOnly', 'compareHalf']);
                if (cmpVariant === 'numericOnly') {
                    // Numeric-only comparison (no visual)
                    // `pairs`: one denominator, one numerator, or both different (never the same fraction)
                    const { n1: cn1, d1: cd1, n2: cn2, d2: cd2 } = _fComparePair([2, 3, 4, 5, 6, 8, 10, 12]);
                    // Numbers only, in the same cell as the picture items: <, > or = in the circle
                    // between the two fractions (one instruction for the page, P-LG-5).
                    const v1 = cn1 / cd1, v2 = cn2 / cd2;
                    q.text = `Compare the fractions: ${cn1}/${cd1} and ${cn2}/${cd2}.`;
                    q.ans = v1 > v2 ? '>' : v1 < v2 ? '<' : '=';
                    q.answerType = 'symbol';
                    q.options = ['>', '<', '='];
                    q.hint = `Find a common denominator, or compare each to 1/2 or 1.`;
                    q.skillLabel = 'Compare Fractions';
                    _fKit(q, { task: 'sign', terms: [{ n: cn1, d: cd1 }, { n: cn2, d: cd2 }], joins: ['sign'], answer: { sign: q.ans } });
                    return;
                }
                if (cmpVariant === 'compareHalf') {
                    // Compare a fraction to 1/2
                    const halfDens = [3, 4, 5, 6, 8, 10, 12];
                    const hd = pick(halfDens);
                    const hn = rng(1, hd - 1);
                    const val = hn / hd;
                    // The benchmark 1/2, in the same circle cell as the other compare items.
                    q.text = `Compare the fractions: ${hn}/${hd} and 1/2.`;
                    q.ans = val > 0.5 ? '>' : val < 0.5 ? '<' : '=';
                    q.answerType = 'symbol';
                    q.options = ['>', '<', '='];
                    q.hint = `Half of ${hd} is ${hd / 2}. Compare ${hn} to ${hd / 2}.`;
                    q.skillLabel = 'Compare Fractions';
                    _fKit(q, { task: 'sign', terms: [{ n: hn, d: hd }, { n: 1, d: 2 }], joins: ['sign'], answer: { sign: q.ans }, benchmark: true });
                    return;
                }
                // Level 2: compare two fractions drawn on the SAME whole (the kit's `frac-model`
                // cell, O6 lane AP3): the pupil writes <, > or = in the circle between them. Bars
                // unless the teacher ticked other models; paper, key and screen are one drawing.
                // `pairs`: one denominator, one numerator, or both different (never the same fraction)
                const { n1, d1, n2, d2 } = _fComparePair([2, 3, 4, 5, 6, 8]);
                const val1 = n1 / d1;
                const val2 = n2 / d2;

                q.text = `Compare the fractions: ${n1}/${d1} and ${n2}/${d2}.`;
                q.ans = val1 > val2 ? ">" : val1 < val2 ? "<" : "=";
                q.answerType = "symbol";
                q.options = [">", "<", "="];
                q.hint = `Both pictures are the same whole. Which one has more shaded? Or give them the same denominator.`;
                const _cmpModel = _fModelPick() || 'bar';
                q.printFormat = 'fraction-compare';
                q.fractionData = { num1: n1, denom1: d1, num2: n2, denom2: d2, model: _cmpModel };
                q.fractionModel = _cmpModel;
                _fKit(q, { task: 'sign', terms: [{ n: n1, d: d1, kind: _cmpModel }, { n: n2, d: d2, kind: _cmpModel }],
                    joins: ['sign'], answer: { sign: q.ans }, wholeMm: _cmpModel === 'line' ? 40 : 26 });
            } else if (fracSkill === "fraction_bar_ops") {
                // Fraction bar operations — add/subtract with visual bar models
                const isAdd = Math.random() < 0.55;
                const op = isAdd ? '+' : '\u2212';
                let fbNum1, fbDen1, fbNum2, fbDen2;

                if (Math.random() < 0.6) {
                    // Like denominators (60%)
                    fbDen1 = pick([2, 3, 4, 5, 6, 8]);
                    fbDen2 = fbDen1;
                    fbNum1 = rng(1, fbDen1 - 1);
                    fbNum2 = rng(1, fbDen2 - 1);
                } else {
                    // Unlike denominators with obvious LCD (40%)
                    const pairPool = [[2, 4], [3, 6], [4, 8], [2, 6], [2, 8], [3, 9]];
                    const pair = pick(pairPool);
                    if (Math.random() < 0.5) { fbDen1 = pair[0]; fbDen2 = pair[1]; }
                    else { fbDen1 = pair[1]; fbDen2 = pair[0]; }
                    fbNum1 = rng(1, fbDen1 - 1);
                    fbNum2 = rng(1, fbDen2 - 1);
                }

                // Compute answer using LCD
                const fbLcd = _lcm(fbDen1, fbDen2);
                const fbConv1 = fbNum1 * (fbLcd / fbDen1);
                const fbConv2 = fbNum2 * (fbLcd / fbDen2);
                let fbResNum = isAdd ? fbConv1 + fbConv2 : fbConv1 - fbConv2;
                let fbResDen = fbLcd;

                // If subtraction gives non-positive, swap operands
                if (fbResNum <= 0) {
                    const tmpN = fbNum1; const tmpD = fbDen1;
                    fbNum1 = fbNum2; fbDen1 = fbDen2;
                    fbNum2 = tmpN; fbDen2 = tmpD;
                    const c1 = fbNum1 * (fbLcd / fbDen1);
                    const c2 = fbNum2 * (fbLcd / fbDen2);
                    fbResNum = c1 - c2;
                }

                const fbAns = _fracStr(fbResNum, fbResDen);

                q.text = `Use the fraction bars: ${fbNum1}/${fbDen1} ${op} ${fbNum2}/${fbDen2} = ?`;
                q.ans = fbAns;
                q.answerType = 'text';
                q.printFormat = 'fraction-bar-visual';
                q.fractionData = { num1: fbNum1, den1: fbDen1, num2: fbNum2, den2: fbDen2, op: op };
                q.hint = isAdd
                    ? `Find a common denominator (LCD = ${fbLcd}), convert both fractions, then add the numerators.`
                    : `Find a common denominator (LCD = ${fbLcd}), convert both fractions, then subtract the numerators.`;

                // KIT (fractions lane, vis_migrate_fraction_ops): both fractions drawn as bars on one
                // whole - side by side, or one under the other as a fraction wall (the `model`
                // option) - never the answer (RP-1); the pupil writes the answer in the boxes after
                // "=", a mixed number's three boxes when it can reach 1.
                q.options = [];
                q.skillLabel = 'Fraction Bar Ops';
                _fSentenceKit(q, [{ n: fbNum1, d: fbDen1 }, { n: fbNum2, d: fbDen2 }], [op], _fModelPick() || 'bar',
                    { mixed: fbResNum >= fbResDen, wholeMm: 30 });
                return;
            } else if (fracSkill === "of_number") {
                // Level 2: Fraction of a number
                const maxMultiple = Math.floor(Math.min(range, 100) / denominator);
                const multiple = rng(1, Math.max(1, maxMultiple));
                const whole = multiple * denominator;
                q.text = `What is ${numerator}/${denominator} of ${whole}?`;
                q.ans = (numerator * whole) / denominator;
                q.options = buildNumericOptions(q.ans);
                q.hint = `Step 1: ${whole} ÷ ${denominator} = ${whole/denominator}. Step 2: ${whole/denominator} × ${numerator} = ?`;

                q.visual = `<div style="text-align:center;">
                    <div class="frac-equation" style="margin-bottom:20px;">
                        ${fracHTML(numerator, denominator, '2xl')}
                        <span style="font-size:1.8rem;margin:0 10px;">of</span>
                        <span style="font-size:2.5rem;font-weight:800;color:var(--accent-purple);">${whole}</span>
                        <span class="frac-equals">=</span>
                        <span style="min-width:60px;font-size:2.5rem;color:var(--accent-green);font-weight:800;">?</span>
                    </div>
                    <div style="margin-bottom:15px;">
                        ${fracCircleSVG(numerator, denominator, 100, 'var(--accent-cyan)')}
                    </div>
                    <div style="font-size:0.95rem;color:var(--text-dim);">
                        Find <strong style="color:var(--accent-cyan);">${numerator}</strong> out of <strong>${denominator}</strong> equal parts of <strong style="color:var(--accent-purple);">${whole}</strong>
                    </div>
                </div>`;
            } else if (fracSkill === "mixed_numbers_intro") {
                // Fractions beyond 1 (build list frac_beyond_1; 3.NF.A.1, 4.NF.B.3; WRM Y4.B7.S2, S3,
                // S5). KIT (fractions lane): (0) whole shapes and a part, the pupil writes the mixed
                // number; (1) a mixed number split into its wholes and its fraction, 2 3/4 = [ ] + [ ]/4;
                // (2) a number line from 0 past 1, the pupil writes the mixed number the dot shows.
                const _mnForms = _fChanged('forms');
                const mode = _mnForms ? pick(_mnForms) : pick([0, 1, 2]);
                // a line past 1 keeps its parts countable: halves, thirds and quarters
                const d = pick(_filterDens(mode === 2 ? [2, 3, 4] : [2, 3, 4, 5, 6, 8]));
                const w = rng(1, mode === 2 ? 2 : 3);
                const n = rng(1, d - 1);
                const mixedStr = `${w} ${n}/${d}`;
                q.answerType = 'text';
                q.options = [];
                q.skillLabel = 'Fractions Beyond 1';
                q.noSimplify = true;
                if (mode === 1) {
                    q.text = `Write ${mixedStr} as wholes and a fraction.`;
                    q.ans = `${w} + ${n}/${d}`;
                    q.hint = `${mixedStr} is ${w} whole${w > 1 ? 's' : ''} and ${n}/${d} more.`;
                    const _mnKind = _fPicturesOff() ? null : (_fModelPick() || 'bar');
                    _fKit(q, { task: 'op', terms: [{ w, n, d, kind: _mnKind, frac: 'show' }, { w, n: 0, d: 1, frac: 'w', ai: 0 }, { n, d, frac: 'n', ai: 1 }],
                        joins: ['=', '+'], answer: { terms: [{ w, n: 0, d: 1 }, { w: 0, n, d }], text: q.ans },
                        wholeMm: _mnKind === 'bar' ? 36 : _mnKind === 'area' ? 20 : 16, perRow: _mnKind === 'bar' ? 2 : 4, barH: 10, modelTop: !!_mnKind });
                    return;
                }
                q.ans = mixedStr;
                if (mode === 2) {
                    q.text = `What mixed number does the dot show?`;
                    q.hint = `Count the whole numbers first, then the parts after ${w}: each whole is cut into ${d} parts.`;
                    _fKit(q, { task: 'write', terms: [{ w, n, d, kind: 'line', frac: 'wnd' }], answer: { w, n, d }, wholeMm: w + 1 > 2 ? 24 : 32, fracAt: 'below' });
                    return;
                }
                q.text = `Write the mixed number the shapes show.`;
                q.hint = `Count the whole shapes: ${w}. Then the part of the last shape: ${n}/${d}.`;
                const _mnKind = _fPicturesOff() ? 'bar' : (_fModelPick() || 'circle');
                _fKit(q, { task: 'write', terms: [{ w, n, d, kind: _mnKind, frac: 'wnd' }], answer: { w, n, d },
                    wholeMm: _mnKind === 'bar' ? 36 : _mnKind === 'area' ? 20 : 16, perRow: _mnKind === 'bar' ? 2 : 4, barH: 10, fracAt: 'below' });
                return;

            } else if (fracSkill === "count_in_fractions") {
                // Count in fractions (build list frac_count; 3.NF.A.2, 3.NF.A.3a/c; WRM Y2.B8.S15,
                // Y3.B6.S8-S9, Y4.B7.S9). KIT (fractions lane): a row of six counts in one unit
                // fraction, two or three of them the pupil's boxes, under a number line with a tick
                // over every count, the wholes heavy (the `countLine` support). The forms climb one
                // step at a time: within one whole; past one written as fractions (4/4, 5/4);
                // past one written as whole and mixed numbers (1, 1 1/4); counting back.
                const _cfForms = _fChanged('forms');
                const mode = _cfForms ? pick(_cfForms) : pick([0, 1, 2, 3]);
                const d = mode === 0 ? pick(_filterDens([3, 4, 5, 6, 8])) : pick(_filterDens([2, 3, 4, 5, 6, 8]));
                // six counts (fewer inside one whole when the denominator is small)
                // five counts on the mixed ladder under a number line: its ticks are equally spaced,
                // so every count takes the width of a mixed-number frame
                const _cfLine0 = !(state.skillOptions && state.skillOptions.countLine === false);
                const nT = mode === 0 ? Math.min(6, d + 1) : (mode >= 2 && _cfLine0 ? 5 : 6);
                const k0 = mode === 0 ? d + 1 - nT : Math.max(1, d - rng(1, Math.min(3, d - 1)));
                let ks = Array.from({ length: nT }, (_, i) => k0 + i);
                if (mode === 3) ks = ks.reverse();
                const mixedForm = mode !== 1;
                const names = { 2: 'halves', 3: 'thirds', 4: 'quarters', 5: 'fifths', 6: 'sixths', 8: 'eighths', 10: 'tenths' };
                const cand = shuffle(Array.from({ length: nT - 2 }, (_, i) => i + 2));
                const nBlank = nT >= 5 ? (Math.random() < 0.5 ? 2 : 3) : 2;
                const blanks = cand.slice(0, nBlank).sort((a, b) => a - b);
                const text = (k) => (mixedForm && k % d === 0 ? String(k / d) : mixedForm && k > d ? `${Math.floor(k / d)} ${k % d}/${d}` : `${k}/${d}`);
                const terms = [], answers = [];
                ks.forEach((k, i) => {
                    const w = mixedForm ? Math.floor(k / d) : 0, n = mixedForm ? k % d : k;
                    const t = { n, d, w, whole: k % d === 0 };
                    if (blanks.includes(i)) {
                        t.frac = mixedForm && k % d === 0 ? 'w' : mixedForm && k > d ? 'wnd' : 'nd';
                        t.ai = answers.length;
                        answers.push({ w, n, d, text: text(k) });
                    } else if (mixedForm && k === 0) {
                        t.w = 0; t.n = 0; t.frac = 'text'; t.text = '0';
                    } else if (!mixedForm || k % d !== 0) {
                        t.frac = 'show';
                    } else {
                        t.frac = 'show';
                    }
                    terms.push(t);
                });
                q.text = `Count ${mode === 3 ? 'back ' : ''}in ${names[d] || `1/${d}s`}. Write the missing numbers.`;
                q.ans = answers.map(a => a.text).join(', ');
                q.answerType = 'text';
                q.noSimplify = true;            // the count itself: 2/4, not 1/2
                q.options = [];
                q.hint = `Each step is 1/${d}: the numerator goes ${mode === 3 ? 'down' : 'up'} by 1. ${d}/${d} is 1 whole.`;
                q.skillLabel = 'Count in Fractions';
                const _cfLine = !(state.skillOptions && state.skillOptions.countLine === false);
                const _cfDigits = Math.max(1, ...answers.map(a => Math.max(String(a.n).length, String(a.d).length, String(a.w).length)));
                _fKit(q, { task: 'count', terms, answer: { terms: answers.map(a => ({ w: a.w, n: a.n, d: a.d })), text: q.ans }, line: _cfLine, mode, boxDigits: _cfDigits });
                return;

            } else if (fracSkill === "fraction_nl_drag") {
                // Drag-onto-number-line — fractions on [0, 1] with ticks every 1/denom.
                // Single-target most of the time; multi-target ~35% to push deeper practice.
                const denPool = [3, 4, 5, 6, 8];
                const den = pick(denPool);
                const isMulti = Math.random() < 0.35 && den >= 4;
                const numCount = isMulti ? Math.min(3, den - 1) : 1;
                // Sample distinct numerators in (0, den).
                const candidates = [];
                for (let i = 1; i < den; i++) candidates.push(i);
                shuffle(candidates);
                const nums = candidates.slice(0, numCount).sort((a, b) => a - b);
                const targets = nums.map(n => ({
                    value: n / den,
                    label: `${n}/${den}`,
                }));

                q.text = isMulti
                    ? `Drag each fraction onto the correct tick on the number line.`
                    : `Drag ${nums[0]}/${den} onto the correct tick on the number line.`;
                q.ans = targets.map(t => t.value);
                q.answerType = "nl-drag";
                q.nlData = {
                    min: 0, max: 1, tickStep: 1 / den, labelStep: 1 / den,
                    mode: 'fraction', denom: den,
                    targets,
                };
                // O6 "Numbers on the line": 'some' is 0, the halfway tick (an even line) and 1.
                _fNlTicks(q.nlData, den % 2 === 0 ? den / 2 : den);
                q.hint = `The line is split into ${den} equal parts. Each tick is 1/${den}.`;
                q.printFormat = "nl-drag";
                q.skillLabel = isMulti ? "Drag Fractions on Number Line (Multi)" : "Drag Fraction on Number Line";
                _nlKit(q);
                return;

            } else if (fracSkill === "mixed_nl_drag") {
                // Multi-marker drag — mixed numbers on [0, 3] with quarter ticks.
                // P12: `denoms` families (2 = fourths, 3 = thirds and sixths, 5 = fifths).
                const _mnFam = _fChanged('denoms');
                const _mnDens = _mnFam ? [3, 4, 5, 6].filter(d => _mnFam.includes(d === 4 ? 2 : d === 5 ? 5 : 3)) : [];
                const den = pick(_mnDens.length ? _mnDens : [3, 4, 5, 6]);
                const wholeMax = 3;
                // Build candidate values strictly between 0 and wholeMax (skip
                // bare 0 / wholeMax to keep targets non-trivial).
                const allTicks = [];
                for (let i = 1; i < wholeMax * den; i++) allTicks.push(i / den);
                shuffle(allTicks);
                const numCount = Math.min(3, Math.max(2, Math.floor(allTicks.length / 4)));
                const chosen = allTicks.slice(0, numCount).sort((a, b) => a - b);

                // Format labels: alternate improper (n/d) and mixed (w r/d) so the
                // student sees both forms in the same problem.
                const targets = chosen.map((v, i) => {
                    const totalNum = Math.round(v * den);
                    const useImproper = (i % 2 === 0);
                    let label;
                    if (useImproper) {
                        label = `${totalNum}/${den}`;
                    } else {
                        const w = Math.floor(totalNum / den);
                        const r = totalNum - w * den;
                        if (w === 0) label = `${r}/${den}`;
                        else if (r === 0) label = `${w}`;
                        else label = `${w} ${r}/${den}`;
                    }
                    return { value: v, label };
                });

                q.text = `Drag each label onto the correct spot on the number line.`;
                q.ans = targets.map(t => t.value);
                q.answerType = "nl-drag";
                q.nlData = {
                    min: 0, max: wholeMax, tickStep: 1 / den, labelStep: 1,
                    mode: 'mixed', denom: den,
                    targets,
                };
                // O6 "Numbers on the line": 'some' (the default) is every whole number.
                _fNlTicks(q.nlData, den);
                q.hint = `Whole-number ticks are labeled. Between each whole there are ${den} equal parts.`;
                q.printFormat = "nl-drag";
                q.skillLabel = "Drag Mixed Numbers on Number Line";
                _nlKit(q);
                return;

            } else if (fracSkill === "simplify") {
                // Simplify fractions (4.NF.A.1; WRM Y6.B3.S1). KIT (fractions lane): "12/16 = [ ]/[ ]"
                // with OPERATOR ARCS "÷ [ ]" over the numerators and under the denominators (the
                // `opArcs` option: blank / written / none); a fraction that is already in simplest
                // form is copied (the "is it simplest?" judgement written, not picked); the common
                // factor step is "the greatest common factor of 8 and 12 = [ ]".
                const simpVariant = window.pickVariant
                    ? window.pickVariant('simplify_main', ['standard', 'isSimplest', 'gcfStep'])
                    : pick(['standard', 'isSimplest', 'gcfStep']);
                const _sfArcsOpt = (state.skillOptions && state.skillOptions.opArcs) || 'blank';
                const _sfArcs = (k) => (_sfArcsOpt === 'none' ? null : { op: '\u00f7', k, show: _sfArcsOpt === 'value' ? 'value' : 'blank' });
                q.skillLabel = 'Simplify';
                q.options = [];
                if (simpVariant === 'gcfStep') {
                    const pairs = [
                        [8, 12], [6, 9], [10, 15], [12, 18], [9, 12],
                        [16, 24], [14, 21], [18, 24], [20, 30], [15, 25],
                        [12, 16], [10, 25], [8, 20]
                    ];
                    const [aN, bN] = pick(pairs);
                    q.text = `What is the greatest common factor of ${aN} and ${bN}? (Use it to simplify ${aN}/${bN}.)`;
                    q.ans = _gcd(aN, bN);
                    q.answerType = 'number';
                    q.hint = `List the factors of each, or use the largest number that divides both.`;
                    _fKit(q, { task: 'op', terms: [{ frac: 'text', text: 'GCF' }, { frac: 'w' }], joins: ['='], answer: { w: q.ans, n: 0, d: 1 },
                        story: ['The greatest common factor', `of ${aN} and ${bN}:`] });
                    return;
                }
                let rawNum, rawDen, k;
                if (simpVariant === 'isSimplest' && Math.random() < 0.5) {
                    // already in simplest form: the pupil writes it again
                    const f = pick([{ n: 1, d: 2 }, { n: 2, d: 3 }, { n: 3, d: 4 }, { n: 1, d: 5 }, { n: 4, d: 5 }, { n: 5, d: 6 }, { n: 3, d: 7 }, { n: 5, d: 8 }, { n: 7, d: 9 }, { n: 3, d: 10 }]);
                    rawNum = f.n; rawDen = f.d; k = 1;
                } else {
                    k = randInt(2, 4);
                    rawNum = numerator * k; rawDen = denominator * k;
                }
                const [sN, sD] = _simplify(rawNum, rawDen);
                q.text = `Write ${rawNum}/${rawDen} in simplest form.`;
                q.answerType = "text";
                q.ans = `${sN}/${sD}`;
                q.noSimplify = true;         // the simplest form itself (6/8 is not simplest)
                q.hint = k > 1 ? `Find a number that divides both ${rawNum} and ${rawDen}. The greatest is ${k}.`
                    : `${rawNum} and ${rawDen} have no common factor but 1: it is already in simplest form.`;
                q.printFormat = 'fraction-simplify';
                q.fractionData = { rawNum, rawDenom: rawDen };
                _fKit(q, { task: 'op', terms: [{ n: rawNum, d: rawDen }, { n: sN, d: sD, frac: 'nd' }], joins: ['='], answer: { n: sN, d: sD },
                    arcs: _sfArcs(rawNum / sN) });
                return;
            } else if (fracSkill === "improper_mixed") {
                // Improper <-> mixed (4.NF.B.3, WRM Y4.B7.S6-S8, Y5.B4.S4-S5). KIT (fractions lane,
                // vis_migrate_fraction_ops): the amount drawn as whole shapes and a part (circles
                // unless the teacher ticked another model; pictures can come off), and under it the
                // given form "=" the boxes of the other, or - from the picture alone - the improper
                // fraction. The pupil WRITES the answer (the legacy screen offered four buttons).
                const den = pick([2, 3, 4, 5, 6, 8]);
                const wholes = rng(1, 3);
                const extraNum = rng(1, den - 1);
                const totalNum = wholes * den + extraNum;
                const _imForms = _fChanged('forms');
                const _imModes = ['improper_to_mixed', 'mixed_to_improper', 'visual_to_both'];
                const mode = _imForms ? _imModes[pick(_imForms)] : pick(_imModes);
                const mixedStr = `${wholes} ${extraNum}/${den}`, impStr = `${totalNum}/${den}`;
                const _imKind = _fPicturesOff() ? null : (_fModelPick() || 'circle');
                let given, ansTerm, answer, joins = ['='];
                if (mode === 'improper_to_mixed') {
                    q.text = `Write ${impStr} as a mixed number.`;
                    q.ans = mixedStr;
                    q.hint = `Divide ${totalNum} by ${den}. The quotient is the whole number, the remainder is the numerator.`;
                    given = { n: totalNum, d: den }; ansTerm = { n: extraNum, d: den, frac: 'wnd' }; answer = { w: wholes, n: extraNum, d: den };
                } else if (mode === 'mixed_to_improper' || !_imKind) {
                    q.text = `Write ${mixedStr} as an improper fraction.`;
                    q.ans = impStr;
                    q.hint = `Multiply ${wholes} × ${den} = ${wholes * den}, then add ${extraNum} to get the numerator.`;
                    given = { w: wholes, n: extraNum, d: den }; ansTerm = { n: totalNum, d: den, frac: 'nd' }; answer = { w: 0, n: totalNum, d: den };
                } else {
                    // the picture alone: how many parts in all, as an improper fraction
                    q.text = `Write the amount shown as an improper fraction.`;
                    q.ans = impStr;
                    q.hint = `Count all the shaded parts: that is the numerator. Each whole has ${den} parts.`;
                    given = { w: wholes, n: extraNum, d: den, frac: 'none' }; ansTerm = { n: totalNum, d: den, frac: 'nd' }; answer = { w: 0, n: totalNum, d: den };
                    joins = [''];
                }
                q.answerType = 'text';
                // an improper answer is written as one (2 1/2 is not 5/2 here); a mixed answer may
                // come simplified (10/4 = 2 2/4 = 2 1/2)
                q.noSimplify = mode !== 'improper_to_mixed';
                q.options = [];
                q.skillLabel = 'Improper/Mixed';
                q.fractionData = { wholes, extraNum, den, totalNum };
                q.fractionModel = _imKind;
                _fKit(q, { task: 'op', terms: [Object.assign({ kind: _imKind }, given), ansTerm], joins, answer,
                    wholeMm: _imKind === 'bar' ? 36 : _imKind === 'area' ? 20 : 16, perRow: _imKind === 'bar' ? 2 : 4, barH: 10, modelTop: !!_imKind });
                return;
            } else if (fracSkill === "mixed_improper_visual") {
                // Mixed <-> improper with a picture (4.NF.B.3, WRM Y4.B7 / Y5.B3). KIT (fractions
                // lane, build list vis_migrate_fraction_ops): the amount drawn as whole models and a
                // part (circles unless the teacher ticked another model), and under it the amount in
                // one form "=" the boxes of the other: "2 3/4 = [ ]/[ ]" or "11/4 = [ ] [ ]/[ ]".
                // One written answer per item (the legacy item asked for both in two typed boxes
                // that never printed); a page mixes the two directions.
                const visDen = pick([2, 3, 4, 5, 6, 8]);
                const visWholes = rng(1, 3);
                const visExtra = rng(1, visDen - 1);
                const visTotalNum = visWholes * visDen + visExtra;
                const _miForms = _fChanged('forms');
                const toImproper = _miForms && _miForms.length === 1 ? _miForms[0] === 0 : Math.random() < 0.5;
                const mixedStr = `${visWholes} ${visExtra}/${visDen}`, impStr = `${visTotalNum}/${visDen}`;
                q.text = toImproper ? `Write ${mixedStr} as an improper fraction.` : `Write ${impStr} as a mixed number.`;
                q.ans = toImproper ? impStr : mixedStr;
                q.answerType = 'text';
                q.noSimplify = toImproper;
                q.options = [];
                q.hint = `Count ${visWholes} whole${visWholes > 1 ? 's' : ''} and ${visExtra}/${visDen} more. Each whole is ${visDen}/${visDen}: ${visWholes} × ${visDen} + ${visExtra} = ${visTotalNum}.`;
                q.skillLabel = 'Mixed↔Improper';
                q.fractionData = { wholes: visWholes, extraNum: visExtra, den: visDen, totalNum: visTotalNum };
                const _miKind = _fPicturesOff() ? null : (_fModelPick() || 'circle');
                const _miGiven = toImproper ? { w: visWholes, n: visExtra, d: visDen } : { n: visTotalNum, d: visDen };
                const _miAns = toImproper ? { n: visTotalNum, d: visDen, frac: 'nd' } : { n: visExtra, d: visDen, frac: 'wnd' };
                q.fractionModel = _miKind;
                _fKit(q, { task: 'op', terms: [Object.assign({ kind: _miKind }, _miGiven), _miAns], joins: ['='],
                    answer: toImproper ? { w: 0, n: visTotalNum, d: visDen } : { w: visWholes, n: visExtra, d: visDen },
                    wholeMm: _miKind === 'bar' ? 36 : _miKind === 'area' ? 20 : 16, perRow: _miKind === 'bar' ? 2 : 4, barH: 10, modelTop: !!_miKind });
                return;

            } else if (fracSkill === "add" || fracSkill === "sub") {
                // Level 3: Add/Subtract fractions with SAME denominator
                const num2 = randInt(1, Math.min(denominator - 1, denominator - numerator + 2));
                const opSymbol = fracSkill === "add" ? "+" : "\u2212";
                q.text = `Calculate:`;
                const result = fracSkill === "add" ? numerator + num2 : Math.abs(numerator - num2);
                q.ans = simplifyFraction(result, denominator);
                q.answerType = "text";
                const wrongs = new Set();
                let fracAttempts = 0;
                while (wrongs.size < 3 && fracAttempts < 30) {
                    fracAttempts++;
                    const offset = randInt(-2, 2);
                    if (offset === 0) continue;
                    wrongs.add(simplifyFraction(Math.abs(result + offset), denominator));
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `Same denominator! Just ${fracSkill === "add" ? "add" : "subtract"} the numerators: ${numerator} ${opSymbol} ${num2} = ${result}`;

                q.visual = `<div style="text-align:center;">
                    <div class="frac-equation" style="margin-bottom:25px;">
                        <span class="frac frac-2xl" style="color:var(--accent-cyan);">
                            <span class="num">${numerator}</span>
                            <span class="den">${denominator}</span>
                        </span>
                        <span class="frac-op">${opSymbol}</span>
                        <span class="frac frac-2xl" style="color:var(--accent-purple);">
                            <span class="num">${num2}</span>
                            <span class="den">${denominator}</span>
                        </span>
                        <span class="frac-equals">=</span>
                        <span class="frac-answer-box">
                            <span class="answer-num">?</span>
                            <span class="answer-bar"></span>
                            <span class="answer-den">${denominator}</span>
                        </span>
                    </div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:15px;">
                        <div style="text-align:center;">
                            ${fracCircleSVG(numerator, denominator, 80, '#00bcd4')}
                        </div>
                        <span style="font-size:2rem;font-weight:700;color:var(--accent-orange);">${opSymbol}</span>
                        <div style="text-align:center;">
                            ${fracCircleSVG(num2, denominator, 80, '#9c27b0')}
                        </div>
                    </div>
                    <div style="display:flex;justify-content:center;gap:8px;margin-top:10px;">
                        ${fracBarHTML(numerator, denominator, 'var(--accent-cyan)')}
                        <span style="font-size:1.3rem;color:var(--accent-orange);align-self:center;">${opSymbol}</span>
                        ${fracBarHTML(num2, denominator, 'var(--accent-purple)')}
                    </div>
                </div>`;
            } else if (fracSkill === "add_unlike" || fracSkill === "sub_unlike") {
                // Level 4: Add/Subtract fractions with UNLIKE denominators
                const denomPairs = [
                    {d1: 2, d2: 4, lcd: 4},
                    {d1: 2, d2: 6, lcd: 6},
                    {d1: 3, d2: 6, lcd: 6},
                    {d1: 4, d2: 8, lcd: 8},
                    {d1: 2, d2: 3, lcd: 6},
                    {d1: 3, d2: 4, lcd: 12}
                ];
                const pair = pick(denomPairs);
                const n1 = rng(1, pair.d1 - 1);
                const n2 = rng(1, pair.d2 - 1);

                const mult1 = pair.lcd / pair.d1;
                const mult2 = pair.lcd / pair.d2;
                const converted1 = n1 * mult1;
                const converted2 = n2 * mult2;

                const isAdd = fracSkill === "add_unlike";
                const opSymbol = isAdd ? "+" : "\u2212";

                let num1Final = n1, den1Final = pair.d1;
                let num2Final = n2, den2Final = pair.d2;
                let conv1Final = converted1, conv2Final = converted2;
                let resultNum = isAdd ? converted1 + converted2 : converted1 - converted2;

                if (!isAdd && converted1 < converted2) {
                    [num1Final, num2Final] = [n2, n1];
                    [den1Final, den2Final] = [pair.d2, pair.d1];
                    [conv1Final, conv2Final] = [converted2, converted1];
                    resultNum = converted2 - converted1;
                }

                q.text = `Calculate:`;
                q.ans = simplifyFraction(Math.abs(resultNum), pair.lcd);
                q.answerType = "text";

                const wrongs = new Set();
                wrongs.add(`${num1Final + num2Final}/${den1Final + den2Final}`);
                wrongs.add(simplifyFraction(Math.abs(resultNum) + 1, pair.lcd));
                wrongs.add(simplifyFraction(Math.max(1, Math.abs(resultNum) - 1), pair.lcd));

                q.options = shuffle([q.ans, ...Array.from(wrongs).slice(0, 3)]);
                q.hint = `Step 1: Find LCD (${pair.lcd}). Step 2: Convert fractions. Step 3: ${isAdd ? 'Add' : 'Subtract'} numerators.`;

                q.visual = `<div style="text-align:center;">
                    <!-- Original equation -->
                    <div class="frac-equation" style="margin-bottom:20px;">
                        <span class="frac frac-2xl" style="color:var(--accent-cyan);">
                            <span class="num">${num1Final}</span>
                            <span class="den">${den1Final}</span>
                        </span>
                        <span class="frac-op">${opSymbol}</span>
                        <span class="frac frac-2xl" style="color:var(--accent-purple);">
                            <span class="num">${num2Final}</span>
                            <span class="den">${den2Final}</span>
                        </span>
                    </div>

                    <!-- Visual comparison -->
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;margin-bottom:20px;">
                        ${fracCircleSVG(num1Final, den1Final, 70, '#00bcd4')}
                        <span style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);">${opSymbol}</span>
                        ${fracCircleSVG(num2Final, den2Final, 70, '#9c27b0')}
                    </div>

                    <!-- Conversion step -->
                    <div style="background:rgba(255,255,255,0.08);padding:15px 20px;border-radius:12px;margin-bottom:15px;">
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">
                            <strong>Find common denominator:</strong> LCD = <span style="display:inline-block;min-width:40px;border-bottom:2px solid var(--accent-green);">&nbsp;</span>
                        </div>
                        <div class="frac-equation" style="padding:10px;background:transparent;">
                            <span class="frac frac-xl" style="color:var(--accent-cyan);">
                                <span class="num">?</span>
                                <span class="den">?</span>
                            </span>
                            <span class="frac-op">${opSymbol}</span>
                            <span class="frac frac-xl" style="color:var(--accent-purple);">
                                <span class="num">?</span>
                                <span class="den">?</span>
                            </span>
                            <span class="frac-equals">=</span>
                            <span class="frac-answer-box">
                                <span class="answer-num">?</span>
                                <span class="answer-bar"></span>
                                <span class="answer-den">?</span>
                            </span>
                        </div>
                    </div>

                    <!-- Bar visualization with LCD -->
                    <div style="display:flex;justify-content:center;gap:8px;">
                        ${fracBarHTML(conv1Final, pair.lcd, 'var(--accent-cyan)')}
                        <span style="font-size:1.3rem;color:var(--accent-orange);align-self:center;">${opSymbol}</span>
                        ${fracBarHTML(conv2Final, pair.lcd, 'var(--accent-purple)')}
                    </div>
                </div>`;
            } else {
                // Default to simplify
                const multiplier = randInt(2,4);
                const rawNum = numerator * multiplier;
                const rawDen = denominator * multiplier;
                q.text = `Simplify: ${rawNum}/${rawDen}`;
                q.answerType = "text";
                q.ans = simplifyFraction(rawNum, rawDen);
                const wrongs = new Set();
                let simpAttempts = 0;
                while (wrongs.size < 3 && simpAttempts < 30) {
                    simpAttempts++;
                    const wrongSimp = simplifyFraction(rawNum + randInt(-3,3), rawDen);
                    if (wrongSimp !== q.ans) wrongs.add(wrongSimp);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `Find a number that divides both ${rawNum} and ${rawDen} evenly. Try dividing by ${multiplier}!`;
                q.visual = `<div style="text-align:center;">
                    <div style="margin-bottom:15px;">
                        ${fracHTML(rawNum, rawDen, 'xl')}
                    </div>
                    <div style="font-size:0.9rem;color:var(--text-dim);">Divide top and bottom by the same number</div>
                </div>`;
            }
            return;
}

export function generateConversionsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // Local GCD helper
            function _gcdRatio(a, b) { return b === 0 ? Math.abs(a) : _gcdRatio(b, Math.abs(a) % b); }

            // ===== RATIO INTRO (Grade 6) — Phase 5 batch 3 =====
            if (mappedSkill === "ratio_intro") {
                const ratioVariant = window.pickVariant
                    ? window.pickVariant('ratio_intro', ['standard', 'partWhole', 'equivRatio'], state)
                    : pick(['standard', 'partWhole', 'equivRatio']);
                if (ratioVariant === 'partWhole') {
                    // Boys-to-girls vs boys-to-total — student must pick correct ratio type
                    const pwContexts = [
                        { itemA: 'boys', itemB: 'girls', total: 'students' },
                        { itemA: 'red apples', itemB: 'green apples', total: 'apples' },
                        { itemA: 'cats', itemB: 'dogs', total: 'pets' },
                        { itemA: 'blue marbles', itemB: 'red marbles', total: 'marbles' },
                    ];
                    const ctx2 = pick(pwContexts);
                    const aV = randInt(3, 12);
                    const bV = randInt(3, 12);
                    const totV = aV + bV;
                    // Pick which ratio type: part-to-part or part-to-whole
                    const isPartPart = Math.random() < 0.5;
                    let askText, ansVal;
                    if (isPartPart) {
                        askText = `A class has ${aV} ${ctx2.itemA} and ${bV} ${ctx2.itemB}. What is the ratio of ${ctx2.itemA} to ${ctx2.itemB}? (a:b format)`;
                        ansVal = `${aV}:${bV}`;
                    } else {
                        askText = `A class has ${aV} ${ctx2.itemA} and ${bV} ${ctx2.itemB}. What is the ratio of ${ctx2.itemA} to total ${ctx2.total}? (a:b format)`;
                        ansVal = `${aV}:${totV}`;
                    }
                    q.text = askText;
                    q.ans = ansVal;
                    q.answerType = 'text';
                    q.hint = isPartPart
                        ? `Part-to-part: compare one group to the other group.`
                        : `Part-to-whole: total = ${aV} + ${bV} = ${totV}.`;
                    q.visual = "";
                    q.skillLabel = 'Ratio';
                    q.printFormat = 'ratio-intro';
                    q.ratioData = { a: aV, b: bV, aAns: aV, bAns: isPartPart ? bV : totV, wantSimplified: false, ctx: ctx2 };
                    return;
                }
                if (ratioVariant === 'equivRatio') {
                    // Equivalent ratios: 2:3 = ?:9
                    const baseA = randInt(2, 6);
                    const baseB = randInt(2, 6);
                    const mult = randInt(2, 5);
                    const expA = baseA * mult;
                    const expB = baseB * mult;
                    // Pick which side is missing
                    const missTop = Math.random() < 0.5;
                    let askText, ansVal;
                    if (missTop) {
                        askText = `Find the missing number to make the ratios equivalent: ${baseA}:${baseB} = ?:${expB}`;
                        ansVal = expA;
                    } else {
                        askText = `Find the missing number to make the ratios equivalent: ${baseA}:${baseB} = ${expA}:?`;
                        ansVal = expB;
                    }
                    q.text = askText;
                    q.ans = ansVal;
                    q.answerType = 'number';
                    q.options = buildNumericOptions(ansVal);
                    q.hint = `Multiply both parts of ${baseA}:${baseB} by ${mult}.`;
                    q.visual = "";
                    q.skillLabel = 'Ratio';
                    q.printFormat = 'ratio-intro';
                    q.ratioData = { a: baseA, b: baseB, aAns: expA, bAns: expB, wantSimplified: false, ctx: { itemA: 'parts', itemB: 'parts' } };
                    return;
                }
                const contexts = [
                    { itemA: 'dogs', itemB: 'cats' },
                    { itemA: 'red marbles', itemB: 'blue marbles' },
                    { itemA: 'apples', itemB: 'oranges' },
                    { itemA: 'boys', itemB: 'girls' },
                    { itemA: 'pencils', itemB: 'pens' },
                    { itemA: 'bicycles', itemB: 'tricycles' },
                    { itemA: 'roses', itemB: 'tulips' },
                    { itemA: 'cubes', itemB: 'spheres' },
                ];
                const ctx = pick(contexts);
                const a = randInt(2, 12);
                const b = randInt(2, 12);

                // Pick variant: 50% raw a:b form (just the counts), 50% in simplified form
                const wantSimplified = Math.random() < 0.5;
                let aAns = a, bAns = b;
                if (wantSimplified) {
                    const g = _gcdRatio(a, b);
                    aAns = a / g;
                    bAns = b / g;
                }

                const askText = wantSimplified
                    ? `There are ${a} ${ctx.itemA} and ${b} ${ctx.itemB}. Write the ratio of ${ctx.itemA} to ${ctx.itemB} in simplest form (use a:b format).`
                    : `There are ${a} ${ctx.itemA} and ${b} ${ctx.itemB}. What is the ratio of ${ctx.itemA} to ${ctx.itemB}? (Write your answer as a:b)`;

                q.text = askText;
                q.ans = `${aAns}:${bAns}`;
                q.answerType = "text";
                q.hint = wantSimplified
                    ? `Find the GCF of ${a} and ${b}, then divide both numbers by it.`
                    : `Write the ratio in the form first:second using a colon.`;
                q.visual = "";
                q.skillLabel = "Ratio";
                q.printFormat = "ratio-intro";
                q.ratioData = { a, b, aAns, bAns, wantSimplified, ctx };
                return;
            }

            // ===== UNIT RATE INTRO (Grade 6) — Phase 5 batch 3 =====
            if (mappedSkill === "unit_rate_intro") {
                const templates = [
                    { unit: 'mph', perUnit: 'hour', amountUnit: 'miles', verb: 'travels',
                      build: (rate, hrs) => `A car ${'travels'} ${rate * hrs} miles in ${hrs} hours. How many miles per hour does it travel?` },
                    { unit: 'pages per minute', perUnit: 'minute', amountUnit: 'pages', verb: 'reads',
                      build: (rate, mins) => `Sara reads ${rate * mins} pages in ${mins} minutes. How many pages does she read per minute?` },
                    { unit: 'dollars per pound', perUnit: 'pound', amountUnit: 'dollars', verb: 'cost',
                      build: (rate, lbs) => `${lbs} pounds of apples cost $${rate * lbs}. What is the cost per pound?` },
                    { unit: 'words per minute', perUnit: 'minute', amountUnit: 'words', verb: 'types',
                      build: (rate, mins) => `Liam types ${rate * mins} words in ${mins} minutes. How many words per minute does he type?` },
                    { unit: 'questions per hour', perUnit: 'hour', amountUnit: 'questions', verb: 'answers',
                      build: (rate, hrs) => `A student answers ${rate * hrs} questions in ${hrs} hours. How many questions per hour?` },
                    { unit: 'pages per day', perUnit: 'day', amountUnit: 'pages', verb: 'wrote',
                      build: (rate, days) => `An author wrote ${rate * days} pages in ${days} days. How many pages per day?` },
                    { unit: 'cans per box', perUnit: 'box', amountUnit: 'cans', verb: 'contain',
                      build: (rate, boxes) => `${boxes} boxes contain ${rate * boxes} cans. How many cans are in each box?` },
                ];
                const tpl = pick(templates);
                // Pick a clean unit rate and a small number of units so the product stays simple
                const unitRate = pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]);
                const units = pick([2, 3, 4, 5, 6]);
                const text = tpl.build(unitRate, units);

                q.text = text;
                q.ans = unitRate;
                q.answerType = "number";
                q.hint = `Divide the total by the number of ${tpl.perUnit}s.`;
                q.visual = "";
                q.skillLabel = "Unit Rate";
                q.printFormat = "unit-rate-intro";
                q.unitRateData = { unitRate, units, template: tpl.unit, ans: unitRate };
                return;
            }

            // ===== EQUIVALENT RATIOS (Grade 6) =====
            if (mappedSkill === "equiv_ratios") {
                const variant = window.pickVariant
                    ? window.pickVariant('equiv_ratios', ['findMissing', 'isEquiv', 'simplify'], state)
                    : pick(['findMissing', 'isEquiv', 'simplify']);
                const a = randInt(2, 12);
                const b = randInt(2, 12);
                const k = randInt(2, 6);
                if (variant === 'findMissing') {
                    q.text = `Fill in the missing value: ${a} : ${b} = ? : ${b * k}`;
                    q.ans = String(a * k);
                    q.answerType = 'number';
                    q.hint = `If the second number is multiplied by ${k}, multiply the first by ${k} too.`;
                    q.skillLabel = 'Equivalent Ratios · Find Missing';
                    q.printFormat = 'standard';
                    q.visual = "";
                    return;
                }
                if (variant === 'isEquiv') {
                    const equiv = Math.random() < 0.5;
                    const c = equiv ? a * k : a * k + (Math.random() < 0.5 ? 1 : -1);
                    const d = b * k;
                    q.text = `Are ${a} : ${b} and ${c} : ${d} equivalent?`;
                    q.ans = equiv ? 'yes' : 'no';
                    q.answerType = 'multiple-choice';
                    q.options = ['yes', 'no'];
                    q.hint = `Cross-multiply: a×d should equal b×c if equivalent.`;
                    q.skillLabel = 'Equivalent Ratios · Yes/No';
                    q.printFormat = 'standard';
                    q.visual = "";
                    return;
                }
                // simplify variant — give a non-simplified ratio, ask for simplest form.
                // Reduce a:b first since randInt may produce non-coprime pairs (e.g.,
                // a=4, b=6 → student is shown 8:12 but simplest form is 2:3, not 4:6).
                const _gcd2 = (x, y) => { x = Math.abs(x); y = Math.abs(y); while (y) { [x, y] = [y, x % y]; } return x || 1; };
                const sg = _gcd2(a, b);
                const sa = a / sg, sb = b / sg;
                const da = a * k, db = b * k;
                q.text = `Write the ratio ${da} : ${db} in simplest form (use the format a:b):`;
                q.ans = `${sa}:${sb}`;
                q.acceptedAnswers = [`${sa}:${sb}`, `${sa} : ${sb}`, `${sa}/${sb}`];
                q.answerType = 'text';
                q.hint = `Find the GCF of ${da} and ${db}, then divide both by it.`;
                q.skillLabel = 'Ratios · Simplify';
                q.printFormat = 'standard';
                q.visual = "";
                return;
            }

            // ===== RATIO TABLES (Grade 6) =====
            if (mappedSkill === "ratio_tables") {
                const a = randInt(2, 8);
                const b = randInt(3, 10);
                const k1 = randInt(2, 4);
                const k2 = randInt(5, 8);
                const missingCol = randInt(1, 3); // which column is the missing value
                const cols = [
                    { x: a, y: b },
                    { x: a * k1, y: b * k1 },
                    { x: a * k2, y: b * k2 }
                ];
                const missingVal = cols[missingCol - 1];
                const tableHTML = `
                    <table style="border-collapse:collapse;margin:8px auto;font-size:1.1rem;">
                        <tr>
                            <th style="border:2px solid #333;padding:8px 16px;background:#f4f0fb;">x</th>
                            ${cols.map((c, i) => `<td style="border:2px solid #333;padding:8px 16px;text-align:center;">${i === (missingCol - 1) ? '?' : c.x}</td>`).join('')}
                        </tr>
                        <tr>
                            <th style="border:2px solid #333;padding:8px 16px;background:#f4f0fb;">y</th>
                            ${cols.map((c, i) => `<td style="border:2px solid #333;padding:8px 16px;text-align:center;">${c.y}</td>`).join('')}
                        </tr>
                    </table>
                `;
                q.text = `In the ratio table below, find the missing x value (the one with ?). The y row is fully filled.`;
                q.visual = tableHTML;
                q.ans = String(missingVal.x);
                q.answerType = 'number';
                q.hint = `The ratio x:y stays constant. Use a column where both are filled to find the constant, then apply it.`;
                q.skillLabel = 'Ratio Tables · Find Missing';
                q.printFormat = 'wide';
                return;
            }

            // ===== DOUBLE NUMBER LINE (Grade 6) — Phase 5 batch 3 =====
            if (mappedSkill === "double_num_line") {
                // Two paired scales — top is "miles", bottom is "hours" (or similar pair)
                // Map a target value on one scale to its partner.
                const pairs = [
                    { topUnit: 'miles', botUnit: 'hours', topPerBot: pick([20, 30, 40, 50, 60]) },
                    { topUnit: 'cups', botUnit: 'pancakes', topPerBot: pick([1, 2, 3]) },
                    { topUnit: 'dollars', botUnit: 'pounds', topPerBot: pick([2, 3, 4, 5]) },
                    { topUnit: 'pages', botUnit: 'minutes', topPerBot: pick([2, 3, 4, 5]) },
                    { topUnit: 'kilometers', botUnit: 'hours', topPerBot: pick([10, 20, 25, 50]) },
                    { topUnit: 'liters', botUnit: 'baskets', topPerBot: pick([2, 3, 4, 5]) },
                ];
                const pair = pick(pairs);

                // Number of bot ticks (3 to 5)
                const botMax = pick([2, 3, 4, 5]);
                const topMax = pair.topPerBot * botMax;

                // Ask either: given bot, find top OR given top, find bot
                const askGivenBot = Math.random() < 0.6;
                // Pick target — for "given bot" use a half-step (e.g. 1.5) so it requires reasoning
                let targetBot, targetTop;
                if (askGivenBot) {
                    // Half-step targets: 0.5, 1.5, ..., (botMax - 0.5)
                    const halfSteps = [];
                    for (let h = 0.5; h < botMax; h += 1) halfSteps.push(h);
                    // Also allow whole-step targets to vary difficulty
                    const wholeSteps = [];
                    for (let w = 1; w <= botMax; w++) wholeSteps.push(w);
                    targetBot = Math.random() < 0.6 ? pick(halfSteps) : pick(wholeSteps);
                    targetTop = targetBot * pair.topPerBot;
                } else {
                    // Pick a clean top value at a tick (whole bot)
                    const wholeSteps = [];
                    for (let w = 1; w <= botMax; w++) wholeSteps.push(w);
                    const wholeBot = pick(wholeSteps);
                    targetTop = wholeBot * pair.topPerBot;
                    targetBot = wholeBot;
                }

                const ans = askGivenBot ? targetTop : targetBot;
                const ansClean = Number(ans.toFixed(2));

                // Build SVG double number line
                const W = 480, H = 130, padX = 40;
                const lineY1 = 40, lineY2 = 90;
                const usable = W - padX * 2;
                const xForBot = (v) => padX + (v / botMax) * usable;
                let topTicks = '', botTicks = '';
                for (let i = 0; i <= botMax; i++) {
                    const x = xForBot(i);
                    botTicks += `<line x1="${x}" y1="${lineY2 - 8}" x2="${x}" y2="${lineY2 + 8}" stroke="#333" stroke-width="1.6"/>`;
                    botTicks += `<text x="${x}" y="${lineY2 + 24}" text-anchor="middle" font-size="11" fill="#333">${i}</text>`;
                    const tv = i * pair.topPerBot;
                    topTicks += `<line x1="${x}" y1="${lineY1 - 8}" x2="${x}" y2="${lineY1 + 8}" stroke="#333" stroke-width="1.6"/>`;
                    topTicks += `<text x="${x}" y="${lineY1 - 14}" text-anchor="middle" font-size="11" fill="#333">${tv}</text>`;
                }
                // Marker for the target value
                const markX = xForBot(targetBot);
                const marker = `<circle cx="${markX}" cy="${(lineY1 + lineY2) / 2}" r="6" fill="#ff9800" stroke="#333" stroke-width="1.5"/>
                                <text x="${markX}" y="${(lineY1 + lineY2) / 2 + 4}" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">?</text>`;

                const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:480px;display:block;margin:0 auto;background:#fff;">
                    <text x="${padX - 6}" y="${lineY1 + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#1565c0">${pair.topUnit}</text>
                    <line x1="${padX}" y1="${lineY1}" x2="${W - padX}" y2="${lineY1}" stroke="#1565c0" stroke-width="2"/>
                    ${topTicks}
                    <text x="${padX - 6}" y="${lineY2 + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#7b1fa2">${pair.botUnit}</text>
                    <line x1="${padX}" y1="${lineY2}" x2="${W - padX}" y2="${lineY2}" stroke="#7b1fa2" stroke-width="2"/>
                    ${botTicks}
                    ${marker}
                </svg>`;

                const askText = askGivenBot
                    ? `Use the double number line. How many ${pair.topUnit} correspond to ${targetBot} ${pair.botUnit}?`
                    : `Use the double number line. How many ${pair.botUnit} correspond to ${targetTop} ${pair.topUnit}?`;

                q.text = askText;
                q.ans = ansClean;
                q.answerType = "number";
                q.hint = `Each ${pair.botUnit} on the bottom matches ${pair.topPerBot} ${pair.topUnit} on the top.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.05rem;">Double Number Line</div>
                    ${svg}
                </div>`;
                q.skillLabel = "Double Number Line";
                q.printFormat = "double-num-line";
                q.doubleNumLineData = { pair, botMax, topMax, targetBot, targetTop, askGivenBot, ans: ansClean };
                return;
            }

            // Standard fractions for clean decimal conversions
            // Only include fractions where denominator divides evenly into 10, 100, or 1000
            // and numerator/denominator gives a nice terminating decimal
            const conversionFractions = [
                {n: 1, d: 2, hint: "Half of 1 is 0.5"}, // 0.5
                {n: 1, d: 4, hint: "1/4 = 25/100 = 0.25"}, {n: 2, d: 4, hint: "2/4 = 1/2 = 0.5"}, {n: 3, d: 4, hint: "3/4 = 75/100 = 0.75"}, // 0.25, 0.5, 0.75
                {n: 1, d: 5, hint: "1/5 = 2/10 = 0.2"}, {n: 2, d: 5, hint: "2/5 = 4/10 = 0.4"}, {n: 3, d: 5, hint: "3/5 = 6/10 = 0.6"}, {n: 4, d: 5, hint: "4/5 = 8/10 = 0.8"}, // 0.2, 0.4, 0.6, 0.8
                {n: 1, d: 10, hint: "1/10 = 0.1"}, {n: 3, d: 10, hint: "3/10 = 0.3"}, {n: 7, d: 10, hint: "7/10 = 0.7"}, {n: 9, d: 10, hint: "9/10 = 0.9"}, // 0.1, 0.3, 0.7, 0.9
                {n: 1, d: 100, hint: "1/100 = 0.01"}, {n: 7, d: 100, hint: "7/100 = 0.07"}, {n: 25, d: 100, hint: "25/100 = 0.25"}, {n: 50, d: 100, hint: "50/100 = 0.50"} // 0.01, 0.07, 0.25, 0.50
            ];
            // For mixed, pick random conversion skill
            // Local helpers for conversion skills
            function _gcdConv(a, b) { return b === 0 ? Math.abs(a) : _gcdConv(b, a % b); }
            function _simplifyConv(n, d) { const g = _gcdConv(n, d); return [n / g, d / g]; }
            function _fracStrConv(n, d) {
                if (n === 0) return "0";
                const [sn, sd] = _simplifyConv(Math.abs(n), Math.abs(d));
                const sign = (n < 0) !== (d < 0) ? '-' : '';
                if (sd === 1) return sign + sn;
                if (sn > sd) return sign + Math.floor(sn / sd) + ' ' + (sn % sd) + '/' + sd;
                return sign + sn + '/' + sd;
            }
            const convSkill = mappedSkill === "mixed" ? pick(["f_to_d", "d_to_f", "f_to_p", "p_to_f", "length_metric", "mass_metric", "time", "percent_visual", "d_to_p", "p_to_d", "percent_of_number", "order_fdp", "find_whole_from_pct"]) : mappedSkill;
            // Phase 4.5 batch 2: dnd-categorize variant for f<->d and f<->p conversions
            // Group 6 mixed-form items by which "whole" benchmark they represent (1/4, 1/2, 3/4)
            if ((convSkill === "f_to_d" || convSkill === "d_to_f" || convSkill === "f_to_p" || convSkill === "p_to_f") && Math.random() < 0.30) {
                // Each item is a value expressed in some form (fraction, decimal, or percent)
                const items = {
                    'binQuarter': [
                        { label: '1/4', val: 0.25 },
                        { label: '0.25', val: 0.25 },
                        { label: '25%', val: 0.25 },
                        { label: '2/8', val: 0.25 },
                        { label: '3/12', val: 0.25 }
                    ],
                    'binHalf': [
                        { label: '1/2', val: 0.5 },
                        { label: '0.5', val: 0.5 },
                        { label: '50%', val: 0.5 },
                        { label: '2/4', val: 0.5 },
                        { label: '5/10', val: 0.5 },
                        { label: '0.50', val: 0.5 }
                    ],
                    'binThreeQ': [
                        { label: '3/4', val: 0.75 },
                        { label: '0.75', val: 0.75 },
                        { label: '75%', val: 0.75 },
                        { label: '6/8', val: 0.75 },
                        { label: '9/12', val: 0.75 }
                    ]
                };
                // Pick 2 items per bin
                const allTiles = [];
                for (const binId of ['binQuarter', 'binHalf', 'binThreeQ']) {
                    const pool = shuffle([...items[binId]]).slice(0, 2);
                    pool.forEach(it => allTiles.push({ ...it, binId }));
                }
                const tilesArr = shuffle(allTiles);
                const tiles = tilesArr.map((it, i) => ({ id: 't' + i, label: it.label }));
                const ans = {};
                tilesArr.forEach((it, i) => { ans['t' + i] = it.binId; });
                q.text = `Drag each value into the bin for the equivalent fraction.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'categorize';
                q.tiles = tiles;
                q.bins = [
                    { id: 'binQuarter', label: 'Equal to 1/4' },
                    { id: 'binHalf', label: 'Equal to 1/2' },
                    { id: 'binThreeQ', label: 'Equal to 3/4' }
                ];
                q.hint = `Convert each form to the same kind (fraction, decimal, or percent) to compare.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                const convLabels = { 'f_to_d': 'Frac→Dec', 'd_to_f': 'Dec→Frac', 'f_to_p': 'Frac→%', 'p_to_f': '%→Frac' };
                q.skillLabel = convLabels[convSkill] || 'Conversions';
                return;
            }
            if (convSkill === "f_to_d") {
                const frac = pick(conversionFractions);
                const numerator = frac.n;
                const denominator = frac.d;
                const decimalAns = +(numerator / denominator).toFixed(3);
                q.text = `Convert to decimal: ${numerator}/${denominator}`;
                q.ans = decimalAns;
                q.options = buildNumericOptions(q.ans);

                // Generate helpful hint based on denominator
                let hintText = frac.hint || `${numerator} ÷ ${denominator} = ${decimalAns}`;
                if (denominator === 10) {
                    hintText = `Tenths: ${numerator}/10 = 0.${numerator}`;
                } else if (denominator === 100) {
                    hintText = `Hundredths: ${numerator}/100 = 0.${numerator.toString().padStart(2, '0')}`;
                } else if (denominator === 5) {
                    hintText = `Multiply top and bottom by 2: ${numerator}/5 = ${numerator * 2}/10 = 0.${numerator * 2}`;
                } else if (denominator === 4) {
                    hintText = `Multiply top and bottom by 25: ${numerator}/4 = ${numerator * 25}/100 = 0.${(numerator * 25).toString().padStart(2, '0')}`;
                } else if (denominator === 2) {
                    hintText = `Multiply top and bottom by 5: ${numerator}/2 = ${numerator * 5}/10 = 0.${numerator * 5}`;
                }
                q.hint = hintText;

                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        ${fracHTML(numerator, denominator, 'xl')}
                        <span style="font-size:2rem;color:var(--accent-orange);">\u2192</span>
                        <div style="font-size:1.5rem;font-weight:700;color:var(--accent-green);">0.???</div>
                    </div>
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">Convert to tenths or hundredths first!</div>
                </div>`;
            } else if (convSkill === "d_to_f") {
                const simpleFractions = [
                    {n: 1, d: 2}, {n: 1, d: 4}, {n: 3, d: 4},
                    {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5},
                    {n: 1, d: 10}, {n: 3, d: 10}, {n: 7, d: 10}, {n: 9, d: 10}
                ];
                const frac = pick(simpleFractions);
                const numerator = frac.n;
                const denominator = frac.d;
                const decimal = +(numerator / denominator).toFixed(2);
                q.text = `Convert ${decimal} to a fraction.`;
                q.answerType = "text";
                q.ans = simplifyFraction(numerator, denominator);
                const wrongs = new Set();
                while (wrongs.size < 3) {
                    const wrongFrac = pick(simpleFractions);
                    const wrongAns = simplifyFraction(wrongFrac.n, wrongFrac.d);
                    if (wrongAns !== q.ans) wrongs.add(wrongAns);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `${decimal} means "${decimal.toString().split('.')[1] || '0'}" out of "${Math.pow(10, (decimal.toString().split('.')[1] || '0').length)}". Simplify if needed!`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        <div style="font-size:2rem;font-weight:700;color:var(--accent-cyan);">${decimal}</div>
                        <span style="font-size:2rem;color:var(--accent-orange);">\u2192</span>
                        ${fracHTML('?', '?', 'xl')}
                    </div>
                </div>`;
            } else if (convSkill === "f_to_p") {
                // Only use fractions that convert to whole number percentages
                const percentFractions = [
                    {n: 1, d: 2}, // 50%
                    {n: 1, d: 4}, {n: 2, d: 4}, {n: 3, d: 4}, // 25%, 50%, 75%
                    {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5}, // 20%, 40%, 60%, 80%
                    {n: 1, d: 10}, {n: 2, d: 10}, {n: 3, d: 10}, {n: 4, d: 10}, {n: 5, d: 10}, {n: 6, d: 10}, {n: 7, d: 10}, {n: 8, d: 10}, {n: 9, d: 10}, // 10-90%
                    {n: 1, d: 20}, {n: 2, d: 20}, {n: 3, d: 20}, {n: 4, d: 20}, {n: 5, d: 20}, // 5%, 10%, 15%, 20%, 25%
                    {n: 1, d: 100}, {n: 5, d: 100}, {n: 10, d: 100}, {n: 25, d: 100}, {n: 50, d: 100}, {n: 75, d: 100} // 1%, 5%, 10%, 25%, 50%, 75%
                ];
                const frac = pick(percentFractions);
                const numerator = frac.n;
                const denominator = frac.d;
                q.text = `Convert to percent: ${numerator}/${denominator}`;
                q.answerType = "text";
                q.ans = fractionToPercent(numerator, denominator);
                const wrongs = new Set();
                while (wrongs.size < 3) {
                    const wrongFrac = pick(percentFractions);
                    const wrongAns = fractionToPercent(wrongFrac.n, wrongFrac.d);
                    if (wrongAns !== q.ans) wrongs.add(wrongAns);
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `To convert to percent: (${numerator} ÷ ${denominator}) × 100 = ?%`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        ${fracHTML(numerator, denominator, 'xl')}
                        <span style="font-size:2rem;color:var(--accent-orange);">\u2192</span>
                        <div style="font-size:1.8rem;font-weight:700;color:var(--accent-green);">?%</div>
                    </div>
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">Percent = out of 100</div>
                </div>`;
            } else if (convSkill === "p_to_f") {
                const percent = pick([10,20,25,50,75]);
                q.text = `Convert ${percent}% to a fraction.`;
                q.answerType = "text";
                q.ans = simplifyFraction(percent, 100);
                const wrongs = new Set();
                while (wrongs.size < 3) {
                    const p = pick([15,30,40,60,80]);
                    wrongs.add(simplifyFraction(p, 100));
                }
                q.options = shuffle([q.ans, ...wrongs]);
                q.hint = `${percent}% means ${percent}/100. Now simplify by finding a common factor!`;
                q.visual = `<div style="text-align:center;">
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;">
                        <div style="font-size:2rem;font-weight:700;color:var(--accent-purple);">${percent}%</div>
                        <span style="font-size:2rem;color:var(--accent-orange);">\u2192</span>
                        ${fracHTML(percent, 100, 'lg')}
                        <span style="font-size:2rem;color:var(--accent-orange);">\u2192</span>
                        ${fracHTML('?', '?', 'xl')}
                    </div>
                </div>`;
            } else if (convSkill === "percent_visual") {
                // Grade 6 (6.RP.A.3c; WRM Y5.B7.S12, Y6.B9.S3): percent on the HUNDRED SQUARE. KIT
                // (fractions lane, vis_hundred_square): one 10 x 10 square as one whole, the shaded
                // cells filled column by column (sheet/cells/hundred-square.js), and under it the
                // pupil writes the percent, the fraction, the number of squares, or the hundredths.
                const pctMultiples = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
                const percent = pick(pctMultiples);
                // LRU rotation across the problem types so students see all forms.
                const problemType = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('percent_visual', ["identify", "fraction", "shade", "hundredths"])
                    : pick(["identify", "fraction", "shade", "hundredths"]);
                q._variant = problemType;
                const grid = { n: percent, d: 100, kind: _fPicturesOff() ? null : 'hundred', frac: 'none' };
                let terms, joins, answer;
                q.options = [];
                if (problemType === "identify") {
                    q.text = `What percent of the grid is shaded?`;
                    q.ans = percent;
                    q.answerType = "number";
                    q.hint = `Each small square = 1%. Count the shaded squares: a whole column is 10.`;
                    terms = [grid, { frac: 'w', unit: '%' }]; joins = [''];
                    answer = { w: percent, n: 0, d: 1 };
                } else if (problemType === "fraction") {
                    const [sn, sd] = _simplifyConv(percent, 100);
                    q.text = `What fraction of the grid is shaded? Write it in simplest form.`;
                    q.ans = sd === 1 ? String(sn) : `${sn}/${sd}`;
                    q.answerType = "text";
                    q.hint = `${percent} shaded out of 100 = ${percent}/100. Simplify to lowest terms.`;
                    terms = [grid, { n: sn, d: sd, frac: 'nd' }]; joins = [''];
                    answer = { w: 0, n: sn, d: sd };
                } else if (problemType === "shade") {
                    q.text = `${percent}% of this grid is shaded. How many squares are shaded?`;
                    q.ans = percent;
                    q.answerType = "number";
                    q.hint = `Each small square = 1%. ${percent}% means ${percent} squares.`;
                    terms = [grid, { frac: 'text', text: `${percent}%` }, { frac: 'w', unit: 'squares' }]; joins = ['', '='];
                    answer = { w: percent, n: 0, d: 1 };
                } else {
                    q.text = `Write ${percent}% as hundredths.`;
                    q.ans = `${percent}/100`;
                    q.answerType = "text";
                    q.noSimplify = true;
                    q.hint = `Percent means out of 100: ${percent}% = ${percent}/100.`;
                    terms = [grid, { frac: 'text', text: `${percent}%` }, { n: percent, d: 100, frac: 'n' }]; joins = ['', '='];
                    answer = { w: 0, n: percent, d: 100 };
                }
                q.printFormat = "percent-grid";
                q.skillLabel = "Percent Visual";
                q.fractionModel = grid.kind;
                _fKit(q, { task: 'op', terms, joins, answer, modelTop: !!grid.kind });
                return;

            } else if (convSkill === "d_to_p") {
                // Grade 6: Decimal to Percent conversion
                const decOptions = [
                    { dec: 0.1, pct: "10%" }, { dec: 0.2, pct: "20%" }, { dec: 0.25, pct: "25%" },
                    { dec: 0.3, pct: "30%" }, { dec: 0.4, pct: "40%" }, { dec: 0.45, pct: "45%" },
                    { dec: 0.5, pct: "50%" }, { dec: 0.6, pct: "60%" }, { dec: 0.65, pct: "65%" },
                    { dec: 0.7, pct: "70%" }, { dec: 0.75, pct: "75%" }, { dec: 0.8, pct: "80%" },
                    { dec: 0.85, pct: "85%" }, { dec: 0.9, pct: "90%" }, { dec: 0.95, pct: "95%" },
                    { dec: 0.05, pct: "5%" }, { dec: 0.08, pct: "8%" }, { dec: 0.125, pct: "12.5%" },
                    { dec: 1.5, pct: "150%" }, { dec: 2.0, pct: "200%" }, { dec: 0.01, pct: "1%" }
                ];
                const chosen = pick(decOptions);
                q.text = `Convert to a percent: ${chosen.dec}`;
                q.ans = chosen.pct;
                q.answerType = "text";
                q.hint = `Multiply by 100 and add %. ${chosen.dec} × 100 = ${chosen.pct}`;
                q.printFormat = "conversion";
                q.skillLabel = "Dec \u2192 %";

            } else if (convSkill === "p_to_d") {
                // Grade 6: Percent to Decimal conversion
                const pctOptions = [
                    { pct: 5, dec: "0.05" }, { pct: 8, dec: "0.08" }, { pct: 10, dec: "0.1" },
                    { pct: 12, dec: "0.12" }, { pct: 20, dec: "0.2" }, { pct: 25, dec: "0.25" },
                    { pct: 30, dec: "0.3" }, { pct: 33, dec: "0.33" }, { pct: 40, dec: "0.4" },
                    { pct: 50, dec: "0.5" }, { pct: 60, dec: "0.6" }, { pct: 75, dec: "0.75" },
                    { pct: 80, dec: "0.8" }, { pct: 90, dec: "0.9" }, { pct: 100, dec: "1" },
                    { pct: 125, dec: "1.25" }, { pct: 150, dec: "1.5" }, { pct: 200, dec: "2" }
                ];
                const chosen = pick(pctOptions);
                q.text = `Convert to a decimal: ${chosen.pct}%`;
                q.ans = chosen.dec;
                q.answerType = "text";
                q.hint = `Divide by 100 (move decimal 2 places left). ${chosen.pct} ÷ 100 = ${chosen.dec}`;
                q.printFormat = "conversion";
                q.skillLabel = "% \u2192 Dec";

            } else if (convSkill === "percent_of_number" && Math.random() < 0.25) {
                // Phase 4.5 batch 9: multi-select-check variant - click ALL expressions equal to P% of N
                const pctCombos = [
                    { pct: 10, base: 50, ans: 5 }, { pct: 20, base: 50, ans: 10 }, { pct: 25, base: 80, ans: 20 },
                    { pct: 50, base: 60, ans: 30 }, { pct: 25, base: 40, ans: 10 }, { pct: 75, base: 80, ans: 60 },
                    { pct: 10, base: 80, ans: 8 }, { pct: 20, base: 60, ans: 12 }, { pct: 50, base: 40, ans: 20 }
                ];
                const c = pick(pctCombos);
                const correctOpts = [
                    `${c.pct}% × ${c.base}`,
                    `${c.pct}/100 × ${c.base}`,
                    `${c.base} × ${c.pct / 100}`,
                    `${c.ans}`,
                    `${c.base} × ${c.pct}/100`
                ];
                const wrongOpts = [
                    `${c.pct} × ${c.base}`,
                    `${c.pct}/${c.base}`,
                    `${c.base}/${c.pct}`,
                    `${c.pct}% × ${c.base + 10}`,
                    `${c.pct + 5}% × ${c.base}`,
                    `${c.ans + 1}`,
                    `${c.ans - 1}`,
                    `${c.base - c.pct}`
                ];
                const cCount = randInt(2, 3);
                const wCount = 5 - cCount;
                const chosenC = shuffle(correctOpts.slice()).slice(0, cCount);
                const seen = new Set(chosenC);
                const chosenW = [];
                let safety = 0;
                while (chosenW.length < wCount && safety < 30) {
                    safety++;
                    const w = pick(wrongOpts);
                    if (!seen.has(w)) { seen.add(w); chosenW.push(w); }
                }
                while (chosenW.length < wCount) chosenW.push(`${c.ans + chosenW.length + 5}`);
                const all = shuffle([
                    ...chosenC.map(label => ({ label, correct: true })),
                    ...chosenW.map(label => ({ label, correct: false }))
                ]);
                const opts = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL expressions equal to ${c.pct}% of ${c.base}.`;
                q.answerType = 'multi-select-check';
                q.options = opts;
                q.ans = ans;
                q.hint = `${c.pct}% of ${c.base} = ${c.ans}. (${c.pct}% means ${c.pct}/100 or ${c.pct / 100}.)`;
                q.printFormat = 'multi-select';
                q.skillLabel = '% of Number';
                return;
            } else if (convSkill === "percent_of_number") {
                // Grade 6: "What is 25% of 80?"
                const combos = [
                    { pct: 10, base: 50, ans: 5 }, { pct: 10, base: 80, ans: 8 }, { pct: 10, base: 120, ans: 12 },
                    { pct: 20, base: 45, ans: 9 }, { pct: 20, base: 60, ans: 12 }, { pct: 20, base: 75, ans: 15 },
                    { pct: 25, base: 40, ans: 10 }, { pct: 25, base: 80, ans: 20 }, { pct: 25, base: 120, ans: 30 },
                    { pct: 50, base: 36, ans: 18 }, { pct: 50, base: 48, ans: 24 }, { pct: 50, base: 90, ans: 45 },
                    { pct: 75, base: 40, ans: 30 }, { pct: 75, base: 80, ans: 60 }, { pct: 75, base: 120, ans: 90 },
                    { pct: 33, base: 30, ans: 10 }, { pct: 33, base: 60, ans: 20 }, { pct: 33, base: 90, ans: 30 },
                    { pct: 15, base: 60, ans: 9 }, { pct: 40, base: 50, ans: 20 }, { pct: 60, base: 50, ans: 30 }
                ];
                const combo = pick(combos);

                // Bar model visual: show the full bar and the percent portion
                const barW = 300, barH = 40;
                const filledW = Math.round((combo.pct / 100) * barW);
                let barSvg = '';
                barSvg += `<rect x="0" y="0" width="${barW}" height="${barH}" fill="var(--bg-card)" stroke="var(--text-bright)" stroke-width="1.5" rx="4"/>`;
                barSvg += `<rect x="0" y="0" width="${filledW}" height="${barH}" fill="var(--accent-cyan)" opacity="0.7" rx="4"/>`;
                barSvg += `<text x="${filledW / 2}" y="${barH / 2 + 5}" text-anchor="middle" fill="var(--text-bright)" font-size="14" font-weight="bold">${combo.pct}%</text>`;
                barSvg += `<text x="${barW / 2 + filledW / 2}" y="${barH / 2 + 5}" text-anchor="middle" fill="var(--text-dim)" font-size="12">${100 - combo.pct}%</text>`;

                q.text = `What is ${combo.pct}% of ${combo.base}?`;
                q.ans = combo.ans;
                q.answerType = "number";
                q.options = buildNumericOptions(combo.ans);
                q.hint = `${combo.pct}% = ${combo.pct}/100. Multiply: ${combo.base} × ${combo.pct}/100 = ${combo.ans}.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Percent of a Number</div>
                    <div style="font-size:1.2rem;margin-bottom:10px;">${combo.pct}% of <strong>${combo.base}</strong></div>
                    <svg viewBox="0 0 ${barW} ${barH + 20}" style="display:block;margin:0 auto;max-width:320px;">
                        <g transform="translate(0,10)">${barSvg}</g>
                    </svg>
                    <div style="font-size:0.85rem;color:var(--text-dim);margin-top:6px;">Total: ${combo.base}</div>
                </div>`;
                q.printFormat = "percent-of";
                q.skillLabel = "% of Number";

            } else if (convSkill === "order_fdp") {
                // Grade 6: Interactive ordering of mixed FDP values (3-6)
                const count = randInt(3, 6);
                // Generate mixed fractions, decimals, and percents with distinct values
                const fdpPool = [
                    { str: "1/4", val: 0.25 }, { str: "1/2", val: 0.5 }, { str: "3/4", val: 0.75 },
                    { str: "1/3", val: 0.333 }, { str: "2/3", val: 0.667 }, { str: "1/5", val: 0.2 },
                    { str: "2/5", val: 0.4 }, { str: "3/5", val: 0.6 }, { str: "4/5", val: 0.8 },
                    { str: "1/8", val: 0.125 }, { str: "3/8", val: 0.375 }, { str: "5/8", val: 0.625 },
                    { str: "7/8", val: 0.875 }, { str: "1/10", val: 0.1 }, { str: "7/10", val: 0.7 },
                    { str: "0.15", val: 0.15 }, { str: "0.3", val: 0.3 }, { str: "0.45", val: 0.45 },
                    { str: "0.55", val: 0.55 }, { str: "0.65", val: 0.65 }, { str: "0.85", val: 0.85 },
                    { str: "0.9", val: 0.9 }, { str: "0.05", val: 0.05 }, { str: "0.95", val: 0.95 },
                    { str: "10%", val: 0.1 }, { str: "20%", val: 0.2 }, { str: "25%", val: 0.25 },
                    { str: "30%", val: 0.3 }, { str: "40%", val: 0.4 }, { str: "50%", val: 0.5 },
                    { str: "60%", val: 0.6 }, { str: "75%", val: 0.75 }, { str: "80%", val: 0.8 },
                    { str: "90%", val: 0.9 }, { str: "5%", val: 0.05 }, { str: "15%", val: 0.15 }
                ];
                const shuffledPool = shuffle([...fdpPool]);
                const selected = [];
                const usedVals = new Set();
                for (const item of shuffledPool) {
                    if (selected.length >= count) break;
                    const valKey = item.val.toFixed(4);
                    if (!usedVals.has(valKey)) {
                        usedVals.add(valKey);
                        selected.push(item);
                    }
                }

                const direction = pick(["asc", "desc"]);
                const sorted = [...selected].sort((a, b) => direction === "asc" ? a.val - b.val : b.val - a.val);
                const orderItems = selected.map(s => s.str);
                const correctOrder = sorted.map(s => s.str);

                q.text = `Order from ${direction === "asc" ? "least to greatest" : "greatest to least"}:`;
                q.ans = correctOrder.join(",");
                q.answerType = "interactive";
                q.interactiveType = "ordering";
                q.orderMode = "click";
                q.orderDirection = direction;
                q.orderIcon = direction === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least";
                q.numbers = orderItems;
                q.sortedNumbers = correctOrder;
                q.hint = `Convert all values to decimals first, then order. Fractions: divide. Percents: divide by 100.`;
                q.options = [];
                const cardColors = ['var(--accent-cyan)', 'var(--accent-purple)', 'var(--accent-orange)', 'var(--accent-green)', '#e74c3c'];
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);">Order Fractions, Decimals & Percents</div>
                    <div style="font-size:0.9rem;margin-bottom:10px;">${direction === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least"}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin:15px 0;">
                        ${selected.map((s, i) => `<div style="padding:10px 16px;background:var(--bg-card);border:2px solid ${cardColors[i % cardColors.length]};border-radius:10px;font-size:1.2rem;font-weight:600;">${s.str}</div>`).join('')}
                    </div>
                </div>`;
                q.printFormat = "fdp-order";
                q.skillLabel = "Order FDP";

            } else if (convSkill === "find_whole_from_pct" && Math.random() < 0.25) {
                // Phase 4.5 batch 9: multi-select-check variant - click ALL whole numbers that satisfy P% of __ = Part
                const findCombos = [
                    { part: 8, pct: 25, whole: 32 },
                    { part: 5, pct: 10, whole: 50 },
                    { part: 12, pct: 25, whole: 48 },
                    { part: 20, pct: 50, whole: 40 },
                    { part: 15, pct: 25, whole: 60 },
                    { part: 9, pct: 50, whole: 18 },
                    { part: 6, pct: 20, whole: 30 }
                ];
                const c = pick(findCombos);
                // Add equivalent correct multiples? Only one correct answer here, so include just c.whole as correct
                // For multi-select with several correct, include 2 correct (whole and a way to express it)
                const correctOpts = [
                    `${c.whole}`,
                    `${c.whole / 10} × 10`.replace(/\.\d+/, '') === `${c.whole / 10} × 10` && c.whole % 10 === 0 ? `${c.whole / 10} × 10` : `${c.whole}`
                ];
                // Dedupe correct
                const correctUnique = [...new Set(correctOpts)];
                const wrongOpts = [
                    `${c.whole + 10}`,
                    `${c.whole - 10}`,
                    `${c.part * c.pct}`,
                    `${c.part + c.pct}`,
                    `${c.part * 100}`,
                    `${c.whole + 5}`,
                    `${c.whole - 5}`,
                    `${c.pct}`,
                    `${c.whole / 2}`,
                    `${c.whole * 2}`
                ];
                const cCount = Math.min(correctUnique.length, randInt(1, 2));
                const wCount = 5 - cCount;
                const chosenC = correctUnique.slice(0, cCount);
                const seen = new Set(chosenC);
                const chosenW = [];
                let safety = 0;
                while (chosenW.length < wCount && safety < 30) {
                    safety++;
                    const w = pick(wrongOpts);
                    if (!seen.has(w)) { seen.add(w); chosenW.push(w); }
                }
                while (chosenW.length < wCount) chosenW.push(`${c.whole + chosenW.length + 11}`);
                const all = shuffle([
                    ...chosenC.map(label => ({ label, correct: true })),
                    ...chosenW.map(label => ({ label, correct: false }))
                ]);
                const opts = all.map((o, i) => ({ id: 'opt' + i, label: o.label, correct: o.correct }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL values that satisfy: ${c.pct}% of __ = ${c.part}.`;
                q.answerType = 'multi-select-check';
                q.options = opts;
                q.ans = ans;
                q.hint = `${c.pct}% of ${c.whole} = ${c.part}, since ${c.whole} × ${c.pct}/100 = ${c.part}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Find Whole';
                return;
            } else if (convSkill === "find_whole_from_pct") {
                // Grade 6: "12 is 25% of what number?"
                const combos = [
                    { part: 5, pct: 10, whole: 50 }, { part: 8, pct: 10, whole: 80 },
                    { part: 12, pct: 25, whole: 48 }, { part: 15, pct: 25, whole: 60 },
                    { part: 20, pct: 25, whole: 80 }, { part: 30, pct: 25, whole: 120 },
                    { part: 15, pct: 50, whole: 30 }, { part: 24, pct: 50, whole: 48 },
                    { part: 40, pct: 50, whole: 80 }, { part: 18, pct: 20, whole: 90 },
                    { part: 12, pct: 20, whole: 60 }, { part: 30, pct: 75, whole: 40 },
                    { part: 60, pct: 75, whole: 80 }, { part: 9, pct: 15, whole: 60 },
                    { part: 16, pct: 40, whole: 40 }, { part: 21, pct: 30, whole: 70 },
                    { part: 6, pct: 10, whole: 60 }, { part: 45, pct: 50, whole: 90 }
                ];
                const combo = pick(combos);
                const multiplier = 100 / combo.pct;

                q.text = `${combo.part} is ${combo.pct}% of what number?`;
                q.ans = combo.whole;
                q.answerType = "number";
                q.options = buildNumericOptions(combo.whole);
                q.hint = `If ${combo.part} is ${combo.pct}%, then ${combo.part} × ${multiplier} = ${combo.whole} (since ${combo.pct}% × ${multiplier} = 100%).`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Find the Whole from a Percent</div>
                    <div style="font-size:1.2rem;margin-bottom:12px;">
                        <strong style="color:var(--accent-cyan);">${combo.part}</strong> is <strong style="color:var(--accent-orange);">${combo.pct}%</strong> of <strong style="color:var(--accent-green);">?</strong>
                    </div>
                    <div style="background:var(--bg-card);padding:12px 20px;border-radius:10px;display:inline-block;">
                        <div style="font-size:0.9rem;color:var(--text-dim);">Part ÷ Percent = Whole</div>
                        <div style="font-size:1.1rem;margin-top:4px;">${combo.part} ÷ ${combo.pct}% = ?</div>
                    </div>
                </div>`;
                q.printFormat = "percent-find-whole";
                q.skillLabel = "Find Whole from %";

            } else if (convSkill === "length_metric") {
                // Level 3: Length conversions (cm, m, km)
                const convType = pick(["cm_to_m", "m_to_cm", "m_to_km", "km_to_m", "mm_to_cm", "cm_to_mm"]);

                if (convType === "cm_to_m") {
                    const cm = pick([100, 200, 250, 300, 500, 150, 450]) ;
                    q.ans = cm / 100;
                    q.text = `Convert ${cm} cm to meters.`;
                    q.hint = `100 cm = 1 m. Divide by 100!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4CF} ${cm} centimeters = ? meters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">100 cm = 1 m</div>
                    </div>`;
                } else if (convType === "m_to_cm") {
                    const m = pick([1, 2, 3, 4, 5, 1.5, 2.5, 3.5]);
                    q.ans = m * 100;
                    q.text = `Convert ${m} m to centimeters.`;
                    q.hint = `1 m = 100 cm. Multiply by 100!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4CF} ${m} meters = ? centimeters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 m = 100 cm</div>
                    </div>`;
                } else if (convType === "m_to_km") {
                    const m = pick([1000, 2000, 3000, 5000, 500, 1500, 2500]);
                    q.ans = m / 1000;
                    q.text = `Convert ${m.toLocaleString()} m to kilometers.`;
                    q.hint = `1000 m = 1 km. Divide by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F6E3}\uFE0F ${m.toLocaleString()} meters = ? kilometers</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1000 m = 1 km</div>
                    </div>`;
                } else if (convType === "km_to_m") {
                    const km = pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
                    q.ans = km * 1000;
                    q.text = `Convert ${km} km to meters.`;
                    q.hint = `1 km = 1000 m. Multiply by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F6E3}\uFE0F ${km} kilometers = ? meters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 km = 1000 m</div>
                    </div>`;
                } else if (convType === "mm_to_cm") {
                    const mm = pick([10, 20, 30, 50, 100, 25, 15, 45]);
                    q.ans = mm / 10;
                    q.text = `Convert ${mm} mm to centimeters.`;
                    q.hint = `10 mm = 1 cm. Divide by 10!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4CF} ${mm} millimeters = ? centimeters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">10 mm = 1 cm</div>
                    </div>`;
                } else {
                    const cm = pick([1, 2, 3, 5, 10, 1.5, 2.5, 4.5]);
                    q.ans = cm * 10;
                    q.text = `Convert ${cm} cm to millimeters.`;
                    q.hint = `1 cm = 10 mm. Multiply by 10!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4CF} ${cm} centimeters = ? millimeters</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 cm = 10 mm</div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
            } else if (convSkill === "mass_metric") {
                // Level 3: Mass conversions (g, kg)
                const convType = pick(["g_to_kg", "kg_to_g", "mg_to_g", "g_to_mg"]);

                if (convType === "g_to_kg") {
                    const g = pick([1000, 2000, 3000, 5000, 500, 1500, 2500, 250]);
                    q.ans = g / 1000;
                    q.text = `Convert ${g.toLocaleString()} g to kilograms.`;
                    q.hint = `1000 g = 1 kg. Divide by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u2696\uFE0F ${g.toLocaleString()} grams = ? kilograms</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1000 g = 1 kg</div>
                    </div>`;
                } else if (convType === "kg_to_g") {
                    const kg = pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
                    q.ans = kg * 1000;
                    q.text = `Convert ${kg} kg to grams.`;
                    q.hint = `1 kg = 1000 g. Multiply by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u2696\uFE0F ${kg} kilograms = ? grams</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 kg = 1000 g</div>
                    </div>`;
                } else if (convType === "mg_to_g") {
                    const mg = pick([1000, 2000, 5000, 500, 100, 250]);
                    q.ans = mg / 1000;
                    q.text = `Convert ${mg.toLocaleString()} mg to grams.`;
                    q.hint = `1000 mg = 1 g. Divide by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u2696\uFE0F ${mg.toLocaleString()} milligrams = ? grams</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1000 mg = 1 g</div>
                    </div>`;
                } else {
                    const g = pick([1, 2, 3, 5, 0.5, 1.5, 2.5]);
                    q.ans = g * 1000;
                    q.text = `Convert ${g} g to milligrams.`;
                    q.hint = `1 g = 1000 mg. Multiply by 1000!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u2696\uFE0F ${g} grams = ? milligrams</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 g = 1000 mg</div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
            } else if (convSkill === "time") {
                // Level 4: Time conversions
                const convType = pick(["min_to_sec", "hr_to_min", "sec_to_min", "min_to_hr", "days_to_hr", "hr_to_days"]);

                if (convType === "min_to_sec") {
                    const min = pick([1, 2, 3, 5, 10, 15, 1.5, 2.5]);
                    q.ans = min * 60;
                    q.text = `Convert ${min} minute${min !== 1 ? 's' : ''} to seconds.`;
                    q.hint = `1 minute = 60 seconds. Multiply by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u23F1\uFE0F ${min} minute${min !== 1 ? 's' : ''} = ? seconds</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 min = 60 sec</div>
                    </div>`;
                } else if (convType === "hr_to_min") {
                    const hr = pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
                    q.ans = hr * 60;
                    q.text = `Convert ${hr} hour${hr !== 1 ? 's' : ''} to minutes.`;
                    q.hint = `1 hour = 60 minutes. Multiply by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u23F0 ${hr} hour${hr !== 1 ? 's' : ''} = ? minutes</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 hr = 60 min</div>
                    </div>`;
                } else if (convType === "sec_to_min") {
                    const sec = pick([60, 120, 180, 300, 600, 90, 150, 240]);
                    q.ans = sec / 60;
                    q.text = `Convert ${sec} seconds to minutes.`;
                    q.hint = `60 seconds = 1 minute. Divide by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u23F1\uFE0F ${sec} seconds = ? minutes</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">60 sec = 1 min</div>
                    </div>`;
                } else if (convType === "min_to_hr") {
                    const min = pick([60, 120, 180, 240, 300, 30, 90, 150]);
                    q.ans = min / 60;
                    q.text = `Convert ${min} minutes to hours.`;
                    q.hint = `60 minutes = 1 hour. Divide by 60!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u23F0 ${min} minutes = ? hours</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">60 min = 1 hr</div>
                    </div>`;
                } else if (convType === "days_to_hr") {
                    const days = pick([1, 2, 3, 5, 7, 0.5]);
                    q.ans = days * 24;
                    q.text = `Convert ${days} day${days !== 1 ? 's' : ''} to hours.`;
                    q.hint = `1 day = 24 hours. Multiply by 24!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4C5} ${days} day${days !== 1 ? 's' : ''} = ? hours</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">1 day = 24 hr</div>
                    </div>`;
                } else {
                    const hr = pick([24, 48, 72, 12, 36, 96, 120]);
                    q.ans = hr / 24;
                    q.text = `Convert ${hr} hours to days.`;
                    q.hint = `24 hours = 1 day. Divide by 24!`;
                    q.visual = `<div style="text-align:center;font-size:1.2rem;">
                        <div style="margin-bottom:10px;">\u{1F4C5} ${hr} hours = ? days</div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">24 hr = 1 day</div>
                    </div>`;
                }
                q.options = buildNumericOptions(q.ans);
            } else {
                // Default: fraction to decimal
                const conversionFractions = [
                    {n: 1, d: 2}, {n: 1, d: 4}, {n: 3, d: 4},
                    {n: 1, d: 5}, {n: 2, d: 5}, {n: 3, d: 5}, {n: 4, d: 5}
                ];
                const frac = pick(conversionFractions);
                const decimalAns = +(frac.n / frac.d).toFixed(2);
                q.text = `Convert to decimal: ${frac.n}/${frac.d}`;
                q.ans = decimalAns;
                q.options = buildNumericOptions(q.ans);
                q.hint = `A fraction means top ÷ bottom. Divide ${frac.n} ÷ ${frac.d} to get the decimal.`;
                q.visual = `<div style="text-align:center;">
                    ${fracHTML(frac.n, frac.d, 'xl')}
                    <span style="font-size:2rem;margin:0 15px;">\u2192</span>
                    <span style="font-size:1.5rem;color:var(--accent-green);">?</span>
                </div>`;
            }
            return;
}

export function generateDecimalsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // Decimals Category
            const decSkill = mappedSkill === "mixed" ? pick(["add_decimal", "sub_decimal", "mult_decimal", "div_decimal", "compare_decimal", "order_decimal", "number_line_decimal", "order_decimals"]) : mappedSkill;

            // Helper to generate decimal numbers
            const genDecimal = (maxWhole, decPlaces) => {
                const whole = rng(0, maxWhole);
                const decimal = rng(1, Math.pow(10, decPlaces) - 1);
                return parseFloat(`${whole}.${decimal.toString().padStart(decPlaces, '0')}`);
            };

            // Use decimalPlaces setting when > 0, otherwise skill defaults
            const decPlaces = state.decimalPlaces > 0 ? state.decimalPlaces : 0;

            if (decSkill === "add_decimal") {
                // Adding decimals — col-arith widget gives regroup boxes ABOVE
                // each digit and pre-places the decimal in the answer row.
                const places = decPlaces || pick([1, 2]);
                let a = genDecimal(range <= 100 ? 9 : 99, places);
                let b = genDecimal(range <= 100 ? 9 : 99, places);
                q.ans = parseFloat((a + b).toFixed(places));
                q.text = `${a} + ${b} = ?`;
                q.hint = `Line up the decimal points. Use the small boxes above for any regrouping.`;
                q.answerType = 'col-arith';
                q.colMode = 'add';
                q.operands = [a, b];
                q.decimalPlaces = places;
                q.visual = '';
                q.decimalData = { a, b, op: '+', places };
                q.printFormat = "decimal-column-add";
            } else if (decSkill === "sub_decimal") {
                // Subtracting decimals — col-arith widget gives borrow boxes
                // above each digit and pre-places the decimal in the answer.
                const places = decPlaces || pick([1, 2]);
                let a = genDecimal(range <= 100 ? 9 : 99, places);
                let b = genDecimal(range <= 100 ? 9 : 99, places);
                if (b > a) [a, b] = [b, a]; // Ensure positive result
                q.ans = parseFloat((a - b).toFixed(places));
                q.text = `${a} - ${b} = ?`;
                q.hint = `Line up the decimal points. Use the small boxes above to borrow when needed.`;
                q.answerType = 'col-arith';
                q.colMode = 'sub';
                q.minuend = a;
                q.subtrahend = b;
                q.decimalPlaces = places;
                q.visual = '';
                q.decimalData = { a, b, op: '-', places };
                q.printFormat = "decimal-column-sub";
            } else if (decSkill === "mult_decimal") {
                // Multiplying decimals
                const places = decPlaces || pick([1, 2]);
                let a = genDecimal(range <= 100 ? 9 : 99, places);
                let b = rng(2, 9);
                q.ans = parseFloat((a * b).toFixed(places + 1));
                q.text = `${a} × ${b} = ?`;
                q.hint = `Multiply as if whole numbers, then place the decimal!`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\u{1F522} Multiplying Decimals</div>
                    <div style="font-size:1.8rem;font-weight:700;margin:15px 0;">${a} × ${b} = ?</div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin:10px auto;max-width:250px;">
                        <div style="font-size:0.9rem;color:var(--text-dim);">
                            <div>1\uFE0F\u20E3 Multiply: ${Math.round(a * Math.pow(10, places))} × ${b} = ${Math.round(a * Math.pow(10, places)) * b}</div>
                            <div>2\uFE0F\u20E3 Count decimal places: ${places}</div>
                            <div>3\uFE0F\u20E3 Place decimal in answer</div>
                        </div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { a, b, op: '×', places };
                q.printFormat = "decimal-mult";
            } else if (decSkill === "div_decimal") {
                // Dividing decimals — at least one operand MUST be a decimal.
                // Three variants: decimal/whole, whole/decimal, decimal/decimal.
                // Result is always a clean number (whole or short terminating decimal).
                // Use LRU rotation so students see all 3 forms instead of clustering.
                const variant = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('div_decimal', ['dec_by_whole', 'whole_by_dec', 'dec_by_dec'])
                    : pick(['dec_by_whole', 'whole_by_dec', 'dec_by_dec']);
                q._variant = variant;
                const allowTwoPlaces = (state.decimalPlaces || 0) >= 2;
                const rangeMag = range || 100;
                let dividend, divisor, ans;
                if (variant === 'dec_by_whole') {
                    // e.g. 4.5 / 5 = 0.9, 7.2 / 4 = 1.8 — dividend MUST end up decimal.
                    // Retry the tenths digit until ans*divisor is non-integer.
                    let attempts = 0;
                    do {
                        divisor = randInt(2, 9);
                        const ansWhole = randInt(0, Math.max(1, Math.min(12, Math.floor(rangeMag / 10))));
                        const ansFrac = randInt(1, 9); // tenths digit 1-9
                        ans = parseFloat((ansWhole + ansFrac / 10).toFixed(1));
                        dividend = parseFloat((ans * divisor).toFixed(2));
                        attempts++;
                    } while (Number.isInteger(dividend) && attempts < 10);
                } else if (variant === 'whole_by_dec') {
                    // e.g. 10 / 0.5 = 20, 15 / 0.25 = 60
                    const decOptions = allowTwoPlaces
                        ? [0.1, 0.2, 0.25, 0.4, 0.5, 0.75]
                        : [0.1, 0.2, 0.4, 0.5];
                    divisor = pick(decOptions);
                    const maxAns = Math.max(2, Math.min(20, Math.floor(rangeMag / 5)));
                    ans = randInt(2, maxAns);
                    dividend = parseFloat((ans * divisor).toFixed(2));
                } else {
                    // dec_by_dec: e.g. 2.4 / 0.8 = 3
                    divisor = parseFloat((randInt(2, 9) / 10).toFixed(1)); // 0.2 .. 0.9
                    const maxAns = Math.max(2, Math.min(8, Math.floor(rangeMag / 10)));
                    ans = randInt(2, maxAns);
                    dividend = parseFloat((ans * divisor).toFixed(2));
                }
                const ansStr = String(ans).replace(/\.0+$/, '');
                q.ans = ansStr;
                q.answerType = 'text'; // accept decimal text answers
                q.text = `${dividend} ÷ ${divisor} = ?`;
                q.hint = `Move the decimal point to make the divisor a whole number, then divide.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\u{1F522} Dividing Decimals</div>
                    <div style="font-size:1.8rem;font-weight:700;margin:15px 0;">${dividend} ÷ ${divisor} = ?</div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin:10px auto;max-width:200px;font-family:monospace;">
                        <div style="display:flex;align-items:center;justify-content:center;gap:5px;">
                            <span style="font-size:1.3rem;">${divisor}</span>
                            <span style="border-left:2px solid currentColor;border-top:2px solid currentColor;padding:5px 10px;font-size:1.3rem;">${dividend}</span>
                        </div>
                    </div>
                </div>`;
                q.options = []; // text-input answer; no MC distractors
                q.decimalData = { dividend, divisor, quotient: ans, variant };
                q.printFormat = "decimal-div";
            } else if (decSkill === "compare_decimal" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-order variant — order 4 decimals least to greatest
                const places = decPlaces || pick([1, 2]);
                const maxW = range <= 100 ? 9 : 99;
                const decimals = [];
                const seen = new Set();
                let attempts = 0;
                while (decimals.length < 4 && attempts < 100) {
                    attempts++;
                    const v = genDecimal(maxW, places);
                    if (!seen.has(v)) { seen.add(v); decimals.push(v); }
                }
                const direction = pick(['asc', 'desc']);
                const sorted = [...decimals].sort((a, b) => direction === 'asc' ? a - b : b - a);
                const presentation = shuffle(decimals).map((d, i) => ({ id: 't' + i, label: String(d), val: d }));
                const ans = sorted.map(v => presentation.find(t => t.val === v).id);
                q.text = `Drag the decimals from ${direction === 'asc' ? 'least to greatest' : 'greatest to least'}.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = direction === 'asc' ? 'least to greatest' : 'greatest to least';
                q.hint = `Compare digits left to right; line up decimal points.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Compare Decimals';
                return;
            } else if (decSkill === "compare_decimal" && Math.random() < 0.30) {
                const places = decPlaces || pick([1, 2]);
                const maxW = range <= 100 ? 9 : 99;
                const threshold = genDecimal(maxW, places);
                const direction = pick(['greater', 'less']);
                const correctCount = randInt(2, 4);
                const totalCount = randInt(6, 8);
                const candidates = new Set();
                let safety = 0;
                while (candidates.size < correctCount && safety < 200) {
                    safety++;
                    const v = genDecimal(maxW, places);
                    if (v === threshold) continue;
                    if (direction === 'greater' ? v > threshold : v < threshold) candidates.add(v);
                }
                safety = 0;
                while (candidates.size < totalCount && safety < 400) {
                    safety++;
                    const v = genDecimal(maxW, places);
                    if (v === threshold) continue;
                    candidates.add(v);
                }
                const arr = shuffle(Array.from(candidates));
                const options = arr.map((v, i) => ({
                    id: 'opt' + i,
                    label: String(v),
                    correct: direction === 'greater' ? v > threshold : v < threshold
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                if (ans.length === 0 || ans.length === options.length) {
                    // Fallback: ensure at least one of each by toggling threshold
                    options.forEach((o, i) => { o.correct = i < Math.ceil(options.length / 2); });
                    const newAns = options.filter(o => o.correct).map(o => o.id);
                    q.ans = newAns;
                } else {
                    q.ans = ans;
                }
                q.text = `Click ALL the decimals ${direction === 'greater' ? 'greater than' : 'less than'} ${threshold}.`;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `Line up the decimal points, then compare digits from left to right. The first different digit decides which is bigger.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Compare Decimals';
                return;
            } else if (decSkill === "compare_decimal") {
                // Comparing decimals
                const places = decPlaces || pick([1, 2, 3]);
                const maxW = range <= 100 ? 9 : 99;
                let a = genDecimal(maxW, places);
                let b = genDecimal(maxW, places);
                while (a === b) b = genDecimal(maxW, places);

                const correctSymbol = a > b ? ">" : a < b ? "<" : "=";
                q.text = `Compare: ${a} ___ ${b}`;
                q.ans = correctSymbol;
                q.answerType = "choice";
                q.hint = `Line up the decimal points, then compare digits from left to right. The first different digit decides which is bigger.`;
                q.options = [">", "<", "="];

                // Create visual comparison with place value grid
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\u{1F522} Compare Decimals</div>
                    <div style="font-size:2rem;margin:20px 0;">
                        <span style="color:var(--accent-green);font-weight:700;">${a}</span>
                        <span style="margin:0 15px;border:2px dashed var(--text-dim);padding:5px 15px;border-radius:8px;">?</span>
                        <span style="color:var(--accent-orange);font-weight:700;">${b}</span>
                    </div>
                    <div style="display:flex;justify-content:center;gap:10px;margin-top:15px;">
                        <div style="padding:8px 20px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;">></div>
                        <div style="padding:8px 20px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;"><</div>
                        <div style="padding:8px 20px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;">=</div>
                    </div>
                </div>`;
                q.decimalData = { a, b, answer: correctSymbol };
                q.printFormat = "decimal-compare";
            } else if (decSkill === "order_decimal") {
                // Ordering decimals
                const count = pick([4, 5]);
                const places = decPlaces || pick([1, 2]);
                const maxW = range <= 100 ? 9 : 99;
                let nums = [];
                for (let i = 0; i < count; i++) {
                    let n = genDecimal(maxW, places);
                    while (nums.includes(n)) n = genDecimal(maxW, places);
                    nums.push(n);
                }
                const sorted = [...nums].sort((x, y) => x - y);
                const direction = pick(["asc", "desc"]);
                const answer = direction === "asc" ? sorted : sorted.reverse();

                q.text = `Order from ${direction === "asc" ? "least to greatest" : "greatest to least"}: ${nums.join(", ")}`;
                q.ans = answer.join(", ");
                q.answerType = "text";
                q.hint = `Line up the decimal points and compare digits left to right. Add zeros if one number has fewer decimal places.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">\u{1F522} Order Decimals</div>
                    <div style="font-size:0.9rem;margin-bottom:15px;">${direction === "asc" ? "Smallest \u2192 Largest" : "Largest \u2192 Smallest"}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:15px 0;">
                        ${nums.map(n => `<div style="padding:10px 15px;background:var(--bg-card);border-radius:8px;font-size:1.2rem;font-weight:600;">${n}</div>`).join('')}
                    </div>
                    <div style="margin-top:15px;display:flex;justify-content:center;gap:5px;align-items:center;">
                        ${Array(count).fill(0).map((_, i) => `<input type="text" style="width:50px;height:35px;border:2px solid var(--accent-green);border-radius:6px;text-align:center;font-size:1rem;" placeholder="${i + 1}">`).join('<span style="font-size:1.2rem;"> \u2192 </span>')}
                    </div>
                </div>`;
                q.decimalData = { nums, sorted: answer, direction };
                q.printFormat = "decimal-order";
            } else if (decSkill === "order_decimals" && Math.random() < 0.30) {
                // Phase 4.5 batch 2: dnd-order modernization — drag decimals into sequence
                const odCount = pick([4, 5]);
                const odPlaces = decPlaces || pick([1, 2, 3]);
                const odMaxW = range <= 100 ? 9 : 99;
                const decimals = [];
                const seen = new Set();
                let attempts = 0;
                while (decimals.length < odCount && attempts < 200) {
                    attempts++;
                    const v = genDecimal(odMaxW, odPlaces);
                    if (!seen.has(v)) { seen.add(v); decimals.push(v); }
                }
                const direction = pick(["asc", "desc"]);
                const sorted = [...decimals].sort((a, b) => direction === "asc" ? a - b : b - a);
                const presentation = shuffle(decimals).map((d, i) => ({ id: 't' + i, label: String(d), val: d }));
                const ans = sorted.map(v => presentation.find(t => t.val === v).id);
                q.text = `Drag the decimals from ${direction === "asc" ? "least to greatest" : "greatest to least"}.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.orderLabel = direction === "asc" ? "least to greatest" : "greatest to least";
                q.hint = `Line up the decimal points and compare place by place.`;
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Order Decimals';
                return;
            } else if (decSkill === "order_decimals") {
                // Grade 5: Interactive ordering of 3-6 decimal numbers (click-to-order)
                const odCount = randInt(3, 6);
                const odPlaces = decPlaces || pick([1, 2, 3]);
                const odMaxW = range <= 100 ? 9 : 99;
                let odNums = [];
                for (let i = 0; i < odCount; i++) {
                    let n = genDecimal(odMaxW, odPlaces);
                    let odAttempts = 0;
                    while (odNums.includes(n) && odAttempts < 50) {
                        n = genDecimal(odMaxW, odPlaces);
                        odAttempts++;
                    }
                    odNums.push(n);
                }
                const odDirection = pick(["asc", "desc"]);
                const odSorted = [...odNums].sort((x, y) => x - y);
                const odAnswer = odDirection === "asc" ? odSorted : [...odSorted].reverse();
                const odItems = odNums.map(String);
                const odCorrect = odAnswer.map(String);

                q.text = `Order from ${odDirection === "asc" ? "least to greatest" : "greatest to least"}:`;
                q.ans = odCorrect.join(",");
                q.answerType = "interactive";
                q.interactiveType = "ordering";
                q.orderMode = "click";
                q.orderDirection = odDirection;
                q.orderIcon = odDirection === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least";
                q.numbers = odItems;
                q.sortedNumbers = odCorrect;
                q.hint = `Line up the decimal points and compare place by place, from left to right.`;
                q.options = [];
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Order Decimals</div>
                    <div style="font-size:0.9rem;margin-bottom:10px;">${odDirection === "asc" ? "Least \u2192 Greatest" : "Greatest \u2192 Least"}</div>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin:15px 0;">
                        ${odNums.map(n => `<div style="padding:10px 16px;background:var(--bg-card);border:2px solid var(--accent-cyan);border-radius:10px;font-size:1.3rem;font-weight:600;">${n}</div>`).join('')}
                    </div>
                </div>`;
                q.printFormat = "decimal-order";
                q.skillLabel = "Order Decimals";
            } else if (decSkill === "decimal_nl_drag") {
                // Drag-onto-number-line — decimals on [0, 1] with ticks every 0.1.
                // ~30% multi-target so single-marker stays the dominant flow.
                const isMulti = Math.random() < 0.30;
                const numCount = isMulti ? 3 : 1;
                // Sample distinct tenths in {0.1, 0.2, ... 0.9}.
                const candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                shuffle(candidates);
                const chosen = candidates.slice(0, numCount).sort((a, b) => a - b);
                const targets = chosen.map(k => ({
                    value: k / 10,
                    label: (k / 10).toFixed(1),
                }));

                q.text = isMulti
                    ? `Drag each decimal onto the correct tick on the number line.`
                    : `Drag ${(chosen[0] / 10).toFixed(1)} onto the correct tick on the number line.`;
                q.ans = targets.map(t => t.value);
                q.answerType = "nl-drag";
                q.nlData = {
                    min: 0, max: 1, tickStep: 0.1, labelStep: 0.5,
                    mode: 'decimal',
                    targets,
                };
                // O6 "Numbers on the line": 'some' (the default) is 0, 0.5 and 1.
                _fNlTicks(q.nlData, 5);
                q.hint = `The line goes from 0 to 1 in tenths. Each tick is 0.1.`;
                q.printFormat = "nl-drag";
                q.skillLabel = isMulti ? "Drag Decimals on Number Line (Multi)" : "Drag Decimal on Number Line";
                _nlKit(q);
                return;
            } else if (decSkill === "number_line_decimal") {
                // Decimals on number line
                const wholeStart = rng(0, 5);
                const wholeEnd = wholeStart + 1;
                const targetDecimal = parseFloat((wholeStart + (rng(1, 9) / 10)).toFixed(1));

                q.text = `What decimal is shown on the number line?`;
                q.ans = targetDecimal;
                q.hint = `Count the tick marks between ${wholeStart} and ${wholeEnd}!`;

                // Create SVG number line
                const tickPosition = ((targetDecimal - wholeStart) / (wholeEnd - wholeStart)) * 100;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">\u{1F522} Decimals on Number Line</div>
                    <svg width="320" height="80" viewBox="0 0 320 80" style="max-width:100%;">
                        <!-- Main line -->
                        <line x1="20" y1="40" x2="300" y2="40" stroke="currentColor" stroke-width="3"/>
                        <!-- End caps -->
                        <line x1="20" y1="30" x2="20" y2="50" stroke="currentColor" stroke-width="3"/>
                        <line x1="300" y1="30" x2="300" y2="50" stroke="currentColor" stroke-width="3"/>
                        <!-- Tick marks for tenths -->
                        ${Array(11).fill(0).map((_, i) => {
                            const x = 20 + (i * 28);
                            const isMajor = i === 0 || i === 10;
                            return `<line x1="${x}" y1="${isMajor ? 30 : 35}" x2="${x}" y2="${isMajor ? 50 : 45}" stroke="currentColor" stroke-width="${isMajor ? 2 : 1}"/>`;
                        }).join('')}
                        <!-- Labels -->
                        <text x="20" y="70" text-anchor="middle" fill="currentColor" font-size="14">${wholeStart}</text>
                        <text x="300" y="70" text-anchor="middle" fill="currentColor" font-size="14">${wholeEnd}</text>
                        <!-- Arrow pointing to target -->
                        <polygon points="${20 + tickPosition * 2.8 - 8},20 ${20 + tickPosition * 2.8 + 8},20 ${20 + tickPosition * 2.8},32" fill="var(--accent-green)"/>
                        <text x="${20 + tickPosition * 2.8}" y="12" text-anchor="middle" fill="var(--accent-green)" font-size="12" font-weight="bold">?</text>
                    </svg>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.decimalData = { wholeStart, wholeEnd, target: targetDecimal };
                q.printFormat = "decimal-number-line";
            }
            return;
}
