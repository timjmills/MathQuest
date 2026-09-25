// gen-operations.js - Number & Operations + Integers question generation
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions, pickName, pickTwoNames, pickNoun } from './utils.js';
import { DEFAULT_TABLES, getSkillGrade, maxOperandForGrade, multCapsForGrade, divCapsForGrade } from './data.js';
import { createBase10Blocks, createCountingDots, createDotArray, createNumberLine, createHopNumberLine } from './svg-base10.js';
import { COLORS, STROKE, FONTS, MONO, softFill, categoricalFill } from './design-tokens.js';
import { optionsFor, normalizeOptions } from './skill-options.js';
import { genCountByTables, genMultChart, genHopLine } from './gen-mult-patterns.js';
const _MP_SKILLS = new Set(['count_by_tables', 'mult_chart', 'mult_chart_easy', 'mult_chart_medium', 'mult_chart_hard', 'nl_mult', 'nl_div']);
import { stripSegStyle, stripPos } from './sheet/tokens.js';
import { renderCell as _kitRender, fadeRung } from './sheet/index.js';

// ========================================
// HOW IT IS WRITTEN — the `notation` option (skill-options.js)
// ========================================
// The teacher chooses the notation once for the skill; it is never rolled per item. Before
// this, add / subtract / multiply tossed a coin between stacked and across and division rolled
// three ways, so one printed page mixed them — the defect ws-content-audit.cjs reports as
// "silently mixes N print formats", and the reason the owner's sheet stacked 48 ÷ 4.
//
// The value arrives on state.skillOptions (put there by generateQuestionFor ->
// normalizeOptions). Live play sets no options, so we fall back to the skill's own declared
// default, and then to the operation's natural default, so screen and print agree.
//
//   q.notation      the notation this item was actually written in
//   q.printFormat   the matching print cell (see CONTRACT 2 / print-generate.js)
// The option is a SET of ticked notations (owner, 2026-09-20 — check boxes, so a page can show a
// problem more than one way). One ticked gives a single-notation page; several mix them, which is
// how a discrimination step is built.
//
// The ticked notations are DEALT round-robin, not rolled. A roll is what produced the defect this
// replaced: with three ways ticked, six items could come out five brackets and one fraction, and
// a notation the teacher asked for might not appear at all. Dealing gives 2/2/2 and guarantees
// every ticked notation is on the page.
//
// `_notationCursor` advances once per question; `_notationItemCache` holds the answer for the
// rest of that question, because several call sites ask again for the same item and each must get
// the same notation back.
let _notationCursor = 0;
let _notationItemCache = null;

function _beginNotationItem() {
    _notationCursor++;
    _constantCursor++;
    _notationItemCache = Object.create(null);
}

// ========================================
// THE FACT CONSTANT — a dealt set, not a roll (owner ruling 4; skill-options.js constantOption)
// ========================================
// "Add 6" is one ladder step, "Add 7" the next, {2, 5, 10} a cumulative set, and everything
// ticked is mixed — which is the DEFAULT, so an untouched fact skill drills what it always
// drilled. The teacher, not the item, decides which fact set the page is about.
//
// The set is DEALT, exactly as the notation is (see notationFor above), and for the same reason:
// with {2, 5, 10} ticked, a six-item page must give two of each. A roll can hand back five 5s and
// a 2 and silently drop a set the teacher asked for — which is what a page of six items cannot
// survive.
//
// The constant runs FROM 0. That is what finally puts 7 + 0, 15 − 0, 8 × 0 and 0 ÷ 9 on a page:
// the zero facts are a taught set, and P-AT-5 exists because pupils routinely miss them.
//
// `narrowTo` is the legacy Number Selection grid (× and ÷ only). When the teacher has narrowed
// it — anything other than the whole 1-12 — it narrows the dealt set too, so the old control
// keeps working. When it is untouched the ticked set wins, zero set included; "the 3s and 4s"
// does not mean "and the zeros".
//
// THE DEAL MUST NOT WALK THE SET IN ITS OWN ORDER. A plain round-robin over a ticked set that is
// LARGER than the page never reaches the end of the set: with every constant ticked — the default
// — item 1 took 0, item 2 took 1, item 3 took 2, so every six-item page of "Multiplication Facts
// (1-12)" printed 0×, 1×, 2×, 3×, 4×, 5× in that order and the 6s to 12s appeared on no page at
// all. Notation gets away with it because it has two or three values, not thirteen.
//
// So the deal walks the set in STRIDES that are coprime with its length. That keeps every
// property a deal has — each ticked value still comes up exactly once per cycle, so {2, 5, 10}
// across six cells is still two of each — while a page of six now samples the whole set. It
// stays a deal, not a roll: no Math.random is consulted, so a seeded page is still reproducible
// and screen and print still agree.
function _dealStride(len) {
    if (len < 3) return 1;
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const target = Math.max(2, Math.round(len / 1.618));   // spread the walk across the set
    for (let d = 0; d < len; d++) {
        for (const c of [target + d, target - d]) {
            if (c >= 2 && c <= len - 1 && gcd(c, len) === 1) return c;
        }
    }
    return 1;
}
let _constantCursor = 0;
let _constantOffset = 0;   // where this page starts in the fact-set cycle; redrawn at item 0
function factConstantFor(narrowTo) {
    let def = null;
    try {
        def = optionsFor(state.category, state.skill).find(o => o.id === 'constant') || null;
    } catch (e) { def = null; }
    if (!def) return null;                       // this skill declares no constant: nothing to honour

    const legal = def.values.map(v => v.v);
    let ticked = state.skillOptions ? state.skillOptions.constant : undefined;
    // A scalar is a pre-check-box value (share code, saved section): treat it as one tick.
    if (typeof ticked === 'number' || typeof ticked === 'string') ticked = [ticked];
    ticked = Array.isArray(ticked) ? ticked.map(Number).filter(v => legal.includes(v)) : [];
    // Nothing ticked means no restriction, never an empty page (skill-options.js set semantics).
    if (!ticked.length) ticked = legal.slice();

    if (Array.isArray(narrowTo) && narrowTo.length && narrowTo.length < 12) {
        const narrowed = ticked.filter(v => narrowTo.includes(v));
        if (narrowed.length) ticked = narrowed;
    }

    // Prefer the caller's kept-item index for the same reason notationFor does: the internal
    // cursor counts ATTEMPTS, and a caller that discards duplicates would skew the deal.
    const at = Number.isFinite(state.itemIndex) ? state.itemIndex : _constantCursor;
    const len = ticked.length;

    // Start each PAGE at a different point in the cycle. The stride walk alone is indexed purely
    // off the item number, which restarts at 0 on every page, so with all 13 sets ticked and six
    // cells a sheet could only ever show the first six of the walk — "Multiplication Facts (1-12)"
    // printed the 0s, 8s, 3s, 11s, 6s and 1s on page after page and never dealt a 7 or a 9.
    // The offset is drawn once per page, from Math.random, so a seeded page still reproduces
    // exactly (the harness and generateQuestionFor both seed it) while successive live pages move
    // through the whole set.
    if (at === 0) _constantOffset = Math.floor(Math.random() * len);
    const step = (((at + _constantOffset) % len) + len) % len;
    return ticked[(step * _dealStride(len)) % len];
}

// P8 — THE MIXED FACT PAGE IS NOT A ZERO-AND-ONE PAGE. With every fact set ticked (the default,
// "Mixed (all of them)") a straight deal gave the 0 and 1 facts the same weight as the 7s, so a
// quarter of "Multiplication Facts (1-12)" was 0 × 5, 1 × 4, 12 × 1 and the critic counted 6 of 21
// trivial items. On a MIXED page the trivial facts are therefore capped at one cell in ten
// (`_factTrivialSlot`); when the teacher ticks the 0s or the 1s on purpose they are dealt in full,
// because then they are the lesson (PEDAGOGY §2.4: zero facts are content, not an accident).
function _factsAllTicked() {
    let def = null;
    try { def = optionsFor(state.category, state.skill).find(o => o.id === 'constant') || null; }
    catch (e) { def = null; }
    if (!def) return true;
    const legal = def.values.map(v => v.v);
    let ticked = state.skillOptions ? state.skillOptions.constant : undefined;
    if (typeof ticked === 'number' || typeof ticked === 'string') ticked = [ticked];
    ticked = Array.isArray(ticked) ? ticked.map(Number).filter(v => legal.includes(v)) : [];
    return !ticked.length || legal.every(v => ticked.includes(v));
}
function _factTrivialSlot() {
    const at = Number.isFinite(state.itemIndex) ? state.itemIndex : _constantCursor;
    return ((at % 10) + 10) % 10 === 7;
}

function notationFor(op) {
    const natural = (op === '÷' || op === '/') ? 'across' : 'stacked';
    if (_notationItemCache && _notationItemCache[op] !== undefined) return _notationItemCache[op];

    let def = null;
    try {
        def = optionsFor(state.category, state.skill).find(o => o.id === 'notation') || null;
    } catch (e) { def = null; }

    const legal = def ? def.values.map(v => v.v) : [natural];
    let ticked = state.skillOptions ? state.skillOptions.notation : undefined;
    // A scalar is a pre-check-box value (share code, saved section): treat it as one tick.
    if (typeof ticked === 'string') ticked = [ticked];
    if (!Array.isArray(ticked)) ticked = def ? def.default : null;
    ticked = Array.isArray(ticked) ? ticked.filter(v => legal.includes(v)) : [];
    // Nothing ticked means no restriction, never an empty page (skill-options.js set semantics).
    if (!ticked.length) ticked = legal.slice();

    // Prefer the caller's kept-item index (generateQuestionFor). The internal cursor counts
    // ATTEMPTS, so a caller that discards duplicates and regenerates skews the deal; the kept
    // index does not, and it also makes the page reproducible from a seed.
    const at = Number.isFinite(state.itemIndex) ? state.itemIndex : _notationCursor;
    const chosen = ticked[((at % ticked.length) + ticked.length) % ticked.length];
    if (_notationItemCache) _notationItemCache[op] = chosen;
    return chosen;
}

// ========================================
// THE SUPPORT LEVEL — a dealt set, exactly like the notation and the fact constant
// ========================================
// skill-options.js `levelOption` is universal: every skill carries it. 3 = worked and traced,
// 2 = hints shown, 1 = structure only, 0 = nothing given, and it is a SET, because "multiple
// support helps on the same page" (owner, 2026-09-20). Ticking several builds a FADING page.
//
// So the ticked levels are DEALT most-support-first rather than rolled: with {3, 2} ticked a
// six-cell page gives three of each and the page OPENS on the most supported cell, which is the
// fade order P-4.2 asks for. Nothing is rolled, so a seeded page still reproduces exactly.
//
// The default is [1] — structure only — so a skill that never consults this reads exactly as it
// read before, and no existing page changes shape.
function supportLevelFor(fallback = 1) {
    let def = null;
    try { def = optionsFor(state.category, state.skill).find(o => o.id === 'level') || null; } catch (e) { def = null; }
    const legal = def ? def.values.map(v => v.v) : [3, 2, 1, 0];
    let ticked = state.skillOptions ? state.skillOptions.level : undefined;
    // A scalar is a pre-check-box value (share code, saved section): treat it as one tick.
    if (typeof ticked === 'number' || typeof ticked === 'string') ticked = [ticked];
    ticked = Array.isArray(ticked) ? ticked.map(Number).filter(v => legal.includes(v)) : [];
    if (!ticked.length && def) ticked = [].concat(def.default).map(Number).filter(v => legal.includes(v));
    if (!ticked.length) ticked = [fallback];
    ticked = ticked.slice().sort((x, y) => y - x);   // most support first (P-4.2)
    const at = Number.isFinite(state.itemIndex) ? state.itemIndex : _constantCursor;
    // S2 (owner ruling 2026-09-25): a FADE DOWN THE PAGE, not a cycle (sheet/supports.js fadeRung).
    return ticked[fadeRung(at, ticked.length, state.itemCount, Number.isFinite(state.itemIndex))];
}

// ========================================
// INTERACTIVE EQUATION BUILDER
// Renders a read-aloud-friendly equation scaffold for word problems:
//   [a]   [+ − × ÷]   [b]   =   [?]
// Students tap an operator tile to commit their thinking before entering
// the numeric answer via the main keypad. The widget is PURELY scaffolding
// — it does not gate submission. Inline onclick mutates sibling styles to
// show which operator was chosen. Safe under the page CSP (unsafe-inline
// is already allowed for the 200+ legacy inline handlers in index.html).
// ========================================
function _equationBuilderHTML(a, b) {
    const ops = ['+', '−', '×', '÷'];
    const numTile = (n) => `<span style="display:inline-block;min-width:48px;padding:8px 14px;font-size:1.5rem;font-weight:700;background:#e3f2fd;color:#1565c0;border-radius:10px;text-align:center;">${n}</span>`;
    const opClick = "(function(btn){btn.parentElement.querySelectorAll('.eq-op-btn').forEach(function(x){x.style.background='#fff';x.style.color='#1565c0';});btn.style.background='#1565c0';btn.style.color='#fff';})(this)";
    const opBtn = (o) => `<button type="button" class="eq-op-btn" data-op="${o}" onclick="${opClick}" style="padding:6px 12px;font-size:1.4rem;font-weight:700;border:2px solid #1565c0;background:#fff;color:#1565c0;border-radius:8px;cursor:pointer;margin:0 2px;line-height:1;">${o}</button>`;
    return `<div class="visual-equation-builder" style="margin-top:12px;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;">
        ${numTile(a)}
        <div class="eq-op-tiles" style="display:inline-flex;gap:2px;">${ops.map(opBtn).join('')}</div>
        ${numTile(b)}
        <span style="font-size:1.4rem;font-weight:700;color:#555;">=</span>
        <span style="display:inline-block;min-width:64px;padding:8px 14px;font-size:1.5rem;font-weight:700;border-bottom:3px solid #1565c0;text-align:center;color:#1565c0;">?</span>
    </div>`;
}

// ========================================
// VERTICAL-COLUMN INSTRUCTION HELPER
// Renders a small SVG showing how to write a horizontal add/sub problem
// in vertical column format (digits right-aligned, operator at left,
// horizontal rule, ? as the answer slot).
// ========================================
function _renderVerticalColumnDiagram(a, op, b) {
    const maxLen = Math.max(a.length, b.length);
    const charW = 22; // px per char
    const width = (maxLen + 2) * charW + 24;
    return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;">
      <div style="font-size:0.85rem;color:${COLORS.primaryDark};font-weight:600;">Example: write it like this</div>
      <svg viewBox="0 0 ${width} 110" style="max-width:280px;width:100%;height:auto;">
        <text x="${width - 12}" y="32" font-family='${FONTS.sans}' font-size="22" text-anchor="end" fill="${COLORS.text}">${a.split('').join(' ')}</text>
        <text x="12" y="62" font-family='${FONTS.sans}' font-size="22" fill="${COLORS.text}">${op}</text>
        <text x="${width - 12}" y="62" font-family='${FONTS.sans}' font-size="22" text-anchor="end" fill="${COLORS.text}">${b.split('').join(' ')}</text>
        <line x1="12" y1="74" x2="${width - 12}" y2="74" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>
        <text x="${width - 12}" y="100" font-family='${FONTS.sans}' font-size="22" text-anchor="end" fill="${COLORS.neutral}">?</text>
      </svg>
    </div>
  `;
}

// Skills that should NEVER receive the vertical-column instruction (single-digit
// fact drills don't need a column diagram).
const _VERTICAL_COLUMN_EXEMPT_SKILLS = new Set(['add_facts', 'sub_facts']);

// Apply vertical-column instruction + diagram to a question if:
//  - the skill is not exempt
//  - q.visual is empty (don't override existing visuals)
//  - q.text contains a horizontal add/sub expression like "245 + 367" or "12.5 - 7.34"
function _applyVerticalColumnInstruction(q, mappedSkill) {
    if (!q || _VERTICAL_COLUMN_EXEMPT_SKILLS.has(mappedSkill)) return;
    if (q.visual && String(q.visual).trim().length > 0) return;
    if (!q.text || typeof q.text !== 'string') return;
    if (!/\d+\s*[+−\-]\s*\d+/.test(q.text)) return;
    const m = q.text.match(/(-?\d+(?:\.\d+)?)\s*([+−\-])\s*(-?\d+(?:\.\d+)?)/);
    if (!m) return;
    const a = m[1];
    const op = m[2] === '−' ? '-' : m[2];
    const b = m[3];
    const hasDecimal = a.includes('.') || b.includes('.');
    const baseHint = "Try writing this vertically — line up the digits by place value.";
    const decHint = hasDecimal ? " Don't forget to bring down the decimal point — line up the decimals!" : "";
    const newHintText = baseHint + decHint;
    if (q.hint && String(q.hint).trim().length > 0) {
        q.hint = q.hint + '\n\n' + newHintText;
    } else {
        q.hint = newHintText;
    }
    q.visual = _renderVerticalColumnDiagram(a, op, b);
}

// Skill IDs (and patterns) that the auto-add applies to. Used as an additional
// safety guard so we don't enrich unrelated skills that happen to have an
// "N + M" string in their text.
function _isVerticalColumnEligibleSkill(mappedSkill) {
    if (!mappedSkill) return false;
    if (_VERTICAL_COLUMN_EXEMPT_SKILLS.has(mappedSkill)) return false;
    if (mappedSkill === 'add' || mappedSkill === 'addition') return true;
    if (mappedSkill === 'subtract' || mappedSkill === 'subtraction') return true;
    if (mappedSkill === 'add_decimal' || mappedSkill === 'sub_decimal') return true;
    // Ranged variants: add_10_no_regroup, sub_1m_mixed, etc.
    if (/^(add|sub)_(10|20|50|100|1k|10k|100k|1m)_(no_regroup|regroup|mixed)$/.test(mappedSkill)) return true;
    return false;
}

// ========================================
// WORD-PROBLEM ITEM ICONS (inline-SVG illustrations)
// Replaces the old Unicode-glyph table where every item was essentially a
// circle/square/triangle. Each item now gets a visually distinct line-art
// illustration (apples look like apples, books like books, etc.) so the
// "Picture vs No Pictures" toggle is meaningful.
//
// bwIcon(name) \u2192 SVG markup string (drop-in for the old function signature).
// BW_ICONS[name] is preserved as a Proxy for any legacy callers.
// ========================================
import { getWordProblemIcon } from './word-problem-icons.js';

function bwIcon(name) {
    return getWordProblemIcon(name, 18, 'currentColor');
}

const BW_ICONS = new Proxy({}, {
    get(_target, name) {
        if (typeof name !== 'string') return undefined;
        return getWordProblemIcon(name, 18, 'currentColor');
    }
});

// ========================================
// MULTI-SELECT-CHECK: "click numbers needed to solve" variant helpers
// Phase 4.5 batch 5: shared by word-problem generators in this file.
// ========================================
// Build the multi-select-check question shape from problem text, the numbers
// that ARE needed to solve, and 1-3 plausible distractor numbers that aren't.
function _wrapAsClickNumbersNeeded(originalProblem, neededNumbers, distractorNumbers, skillLabel, hint) {
    const opts = [];
    let idx = 0;
    for (const n of neededNumbers) {
        opts.push({ id: 'opt' + (idx++), label: String(n), correct: true });
    }
    for (const n of distractorNumbers) {
        opts.push({ id: 'opt' + (idx++), label: String(n), correct: false });
    }
    const shuffled = shuffle(opts.slice());
    const ans = shuffled.filter(o => o.correct).map(o => o.id);
    return {
        text: originalProblem + '\n\nClick ALL the numbers you need to solve this problem.',
        ans,
        answerType: 'multi-select-check',
        options: shuffled,
        hint: hint || 'Look for numbers that fit into the question being asked. Ignore unrelated facts.',
        printFormat: 'multi-select',
        skillLabel: skillLabel,
        visual: '',
    };
}

// Pick a plausible distractor that does not collide with already-used numbers.
function _pickDistractor(usedSet, minVal, maxVal) {
    for (let attempt = 0; attempt < 30; attempt++) {
        const v = minVal + Math.floor(Math.random() * (maxVal - minVal + 1));
        if (!usedSet.has(v)) {
            usedSet.add(v);
            return v;
        }
    }
    let v = minVal;
    while (usedSet.has(v)) v++;
    usedSet.add(v);
    return v;
}

function _msc_addWordProblem(rng) {
    const scenarios = [
        { item: 'apples', verb: 'picked', extra: 'bought' },
        { item: 'stickers', verb: 'collected', extra: 'received' },
        { item: 'cookies', verb: 'baked', extra: 'made' },
        { item: 'marbles', verb: 'won', extra: 'found' },
        { item: 'coins', verb: 'saved', extra: 'earned' },
        { item: 'cards', verb: 'traded for', extra: 'collected' },
    ];
    const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
    const name = pickName();
    const a = rng(2, 25);
    const b = rng(2, 25);
    const used = new Set([a, b]);
    const ageD = _pickDistractor(used, 5, 12);
    const blocksD = _pickDistractor(used, 2, 9);
    const distractorMode = Math.floor(Math.random() * 3);
    let text;
    if (distractorMode === 0) {
        text = `${name} is ${ageD} years old. ${name} ${sc.verb} ${a} ${sc.item}. Then ${name} ${sc.extra} ${b} more ${sc.item}. How many ${sc.item} does ${name} have in all?`;
        return _wrapAsClickNumbersNeeded(text, [a, b], [ageD], 'Add Word Problem',
            `Age is not part of the count. Add: ${a} + ${b}.`);
    } else if (distractorMode === 1) {
        text = `${name} ${sc.verb} ${a} ${sc.item} on Monday. The store was ${blocksD} blocks away. On Tuesday, ${name} ${sc.extra} ${b} more ${sc.item}. How many ${sc.item} in all?`;
        return _wrapAsClickNumbersNeeded(text, [a, b], [blocksD], 'Add Word Problem',
            `Distance to the store does not change the count. Add: ${a} + ${b}.`);
    } else {
        const yearD = _pickDistractor(used, 2018, 2026);
        text = `In ${yearD}, ${name} had ${a} ${sc.item}. ${name} is ${ageD} years old now and ${sc.extra} ${b} more ${sc.item}. How many ${sc.item} does ${name} have now?`;
        return _wrapAsClickNumbersNeeded(text, [a, b], [yearD, ageD], 'Add Word Problem',
            `Year and age do not change the total. Add: ${a} + ${b}.`);
    }
}

function _msc_subWordProblem(rng) {
    const scenarios = [
        { item: 'cookies', verb: 'baked', away: 'gave away' },
        { item: 'apples', verb: 'picked', away: 'ate' },
        { item: 'stickers', verb: 'had', away: 'used' },
        { item: 'marbles', verb: 'collected', away: 'lost' },
        { item: 'crayons', verb: 'had', away: 'broke' },
        { item: 'cards', verb: 'collected', away: 'traded away' },
    ];
    const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
    const name = pickName();
    const total = rng(8, 30);
    const away = rng(2, total - 1);
    const used = new Set([total, away]);
    const ageD = _pickDistractor(used, 5, 12);
    const minutesD = _pickDistractor(used, 2, 15);
    const distractorMode = Math.floor(Math.random() * 3);
    let text;
    if (distractorMode === 0) {
        text = `${name} is ${ageD} years old. ${name} ${sc.verb} ${total} ${sc.item}. Then ${name} ${sc.away} ${away} of them. How many ${sc.item} does ${name} have left?`;
        return _wrapAsClickNumbersNeeded(text, [total, away], [ageD], 'Subtract Word Problem',
            `Age does not change the count. Subtract: ${total} - ${away}.`);
    } else if (distractorMode === 1) {
        text = `${name} ${sc.verb} ${total} ${sc.item} in ${minutesD} minutes. Then ${name} ${sc.away} ${away}. How many are left?`;
        return _wrapAsClickNumbersNeeded(text, [total, away], [minutesD], 'Subtract Word Problem',
            `Time taken does not change the count. Subtract: ${total} - ${away}.`);
    } else {
        const shoeD = _pickDistractor(used, 1, 13);
        text = `${name} wears a size ${shoeD} shoe. ${name} ${sc.verb} ${total} ${sc.item} and ${sc.away} ${away}. ${name} is ${ageD} years old. How many ${sc.item} are left?`;
        return _wrapAsClickNumbersNeeded(text, [total, away], [shoeD, ageD], 'Subtract Word Problem',
            `Shoe size and age do not matter here. Subtract: ${total} - ${away}.`);
    }
}

function _msc_multWordProblem(rng) {
    const scenarios = [
        { item: 'apples', container: 'basket' },
        { item: 'cookies', container: 'box' },
        { item: 'pencils', container: 'pack' },
        { item: 'marbles', container: 'bag' },
        { item: 'crayons', container: 'box' },
    ];
    const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
    const name = pickName();
    const groups = rng(2, 9);
    const per = rng(2, 9);
    const used = new Set([groups, per]);
    const ageD = _pickDistractor(used, 5, 12);
    const blocksD = _pickDistractor(used, 2, 10);
    const distractorMode = Math.floor(Math.random() * 3);
    let text;
    if (distractorMode === 0) {
        text = `${name} is ${ageD} years old. ${name} has ${groups} ${sc.container}s of ${sc.item}, with ${per} ${sc.item} in each ${sc.container}. How many ${sc.item} does ${name} have in all?`;
        return _wrapAsClickNumbersNeeded(text, [groups, per], [ageD], 'Multiply Word Problem',
            `Age does not affect the count. Multiply: ${groups} x ${per}.`);
    } else if (distractorMode === 1) {
        text = `The store is ${blocksD} blocks away. ${name} buys ${groups} ${sc.container}s with ${per} ${sc.item} in each. How many ${sc.item} does ${name} have?`;
        return _wrapAsClickNumbersNeeded(text, [groups, per], [blocksD], 'Multiply Word Problem',
            `Distance does not affect the count. Multiply: ${groups} x ${per}.`);
    } else {
        const minutesD = _pickDistractor(used, 5, 30);
        text = `${name} spent ${minutesD} minutes packing ${groups} ${sc.container}s. Each ${sc.container} holds ${per} ${sc.item}. ${name} is ${ageD} years old. How many ${sc.item} were packed?`;
        return _wrapAsClickNumbersNeeded(text, [groups, per], [minutesD, ageD], 'Multiply Word Problem',
            `Time and age do not change the count. Multiply: ${groups} x ${per}.`);
    }
}

function _msc_divWordProblem(rng) {
    const scenarios = [
        { item: 'apples', recipient: 'friends', recipientS: 'friend' },
        { item: 'cookies', recipient: 'plates', recipientS: 'plate' },
        { item: 'stickers', recipient: 'children', recipientS: 'child' },
        { item: 'marbles', recipient: 'bags', recipientS: 'bag' },
        { item: 'pencils', recipient: 'students', recipientS: 'student' },
    ];
    const sc = scenarios[Math.floor(Math.random() * scenarios.length)];
    const name = pickName();
    const groups = rng(2, 9);
    const per = rng(2, 9);
    const total = groups * per;
    const used = new Set([total, groups, per]);
    const ageD = _pickDistractor(used, 5, 12);
    const minutesD = _pickDistractor(used, 5, 25);
    const distractorMode = Math.floor(Math.random() * 3);
    let text;
    if (distractorMode === 0) {
        text = `${name} is ${ageD} years old. ${name} has ${total} ${sc.item} to share equally among ${groups} ${sc.recipient}. How many ${sc.item} will each ${sc.recipientS} get?`;
        return _wrapAsClickNumbersNeeded(text, [total, groups], [ageD], 'Divide Word Problem',
            `Age does not change the count. Divide: ${total} / ${groups}.`);
    } else if (distractorMode === 1) {
        text = `It took ${name} ${minutesD} minutes to count out ${total} ${sc.item}. ${name} shares them equally among ${groups} ${sc.recipient}. How many does each ${sc.recipientS} get?`;
        return _wrapAsClickNumbersNeeded(text, [total, groups], [minutesD], 'Divide Word Problem',
            `Time does not change the count. Divide: ${total} / ${groups}.`);
    } else {
        const blocksD = _pickDistractor(used, 2, 10);
        text = `${name} walked ${blocksD} blocks carrying ${total} ${sc.item}. ${name} is ${ageD} years old. ${name} shares the ${sc.item} equally among ${groups} ${sc.recipient}. How many does each ${sc.recipientS} get?`;
        return _wrapAsClickNumbersNeeded(text, [total, groups], [blocksD, ageD], 'Divide Word Problem',
            `Distance and age are not part of the math. Divide: ${total} / ${groups}.`);
    }
}

function _msc_multComparison(rng) {
    const namePair = pickTwoNames();
    const item = pickNoun();
    const base = rng(2, 9);
    const mult = rng(2, 8);
    const used = new Set([base, mult]);
    const ageD = _pickDistractor(used, 5, 12);
    const distractorMode = Math.floor(Math.random() * 3);
    let text;
    if (distractorMode === 0) {
        text = `${namePair[0]} is ${ageD} years old. ${namePair[0]} has ${base} ${item}. ${namePair[1]} has ${mult} times as many ${item}. How many ${item} does ${namePair[1]} have?`;
        return _wrapAsClickNumbersNeeded(text, [base, mult], [ageD], 'Multiply Comparison',
            `"${mult} times as many" means multiply ${base} by ${mult}.`);
    } else if (distractorMode === 1) {
        const minutesD = _pickDistractor(used, 5, 30);
        text = `${namePair[0]} has ${base} ${item}. After ${minutesD} minutes, ${namePair[1]} has ${mult} times as many. How many ${item} does ${namePair[1]} have?`;
        return _wrapAsClickNumbersNeeded(text, [base, mult], [minutesD], 'Multiply Comparison',
            `Time spent does not matter. Multiply ${base} by ${mult}.`);
    } else {
        const blocksD = _pickDistractor(used, 2, 10);
        text = `${namePair[0]} lives ${blocksD} blocks away and has ${base} ${item}. ${namePair[1]} is ${ageD} years old and has ${mult} times as many ${item} as ${namePair[0]}. How many ${item} does ${namePair[1]} have?`;
        return _wrapAsClickNumbersNeeded(text, [base, mult], [blocksD, ageD], 'Multiply Comparison',
            `Distance and age are unrelated. Multiply ${base} by ${mult}.`);
    }
}

function _msc_comparisonWord(rng) {
    const namePair = pickTwoNames();
    const item = pickNoun();
    let a = rng(5, 30);
    let b = rng(1, 30);
    while (b === a) b = rng(1, 30);
    const more = Math.max(a, b);
    const fewer = Math.min(a, b);
    const used = new Set([more, fewer]);
    const ageMore = _pickDistractor(used, 5, 12);
    const ageFewer = _pickDistractor(used, 5, 12);
    const distractorMode = Math.floor(Math.random() * 2);
    let text;
    if (distractorMode === 0) {
        text = `${namePair[0]} is ${ageMore} years old and has ${more} ${item}. ${namePair[1]} has ${fewer} ${item}. How many MORE ${item} does ${namePair[0]} have than ${namePair[1]}?`;
        return _wrapAsClickNumbersNeeded(text, [more, fewer], [ageMore], 'Comparison Word',
            `Age does not affect how many ${item}. Subtract: ${more} - ${fewer}.`);
    } else {
        text = `${namePair[0]} is ${ageMore} years old and has ${more} ${item}. ${namePair[1]} is ${ageFewer} years old and has ${fewer} ${item}. How many FEWER ${item} does ${namePair[1]} have?`;
        return _wrapAsClickNumbersNeeded(text, [more, fewer], [ageMore, ageFewer], 'Comparison Word',
            `Ages do not change the counts. Subtract: ${more} - ${fewer}.`);
    }
}

// ========================================
// THE RESPONSE MODE IS A TEACHER TICK, NOT A PER-ITEM ROLL  (P4, item 4)
// ========================================
// Six word-problem skills used to divert 20% of their items into the multi-select above
// ("Click ALL the numbers you need to solve this problem"), and `mult_word_problems` diverted
// others into an array builder. Those are different problem types with different print cells,
// rolled per item, so one page carried two or three kinds of task — the defect the audit reports
// as "silently mixes N print formats", and the reason a printed sheet asked a pupil to click.
// Options live on the SKILL, never on a roll (CLAUDE.md), so the variant is now a teacher choice
// and is OFF unless it is chosen.
//
// NEEDED IN js/modules/skill-options.js (another agent owns that file this wave):
//   id 'response', label "How the pupil answers", values:
//     'standard'      (default) — write the number
//     'which-numbers'           — click the numbers needed  (printFormat 'multi-select')
//     'array-builder'           — build the array           (printFormat 'array-builder')
//   on: add_word_problems, sub_word_problems, mult_word_problems, div_word_problems,
//       mult_comparison, comparison_word  ('array-builder' only on mult_word_problems)
// Until it is registered this reads 'standard' and every one of those skills emits one format.
function _responseMode() {
    let v = null;
    try { v = state.skillOptions ? state.skillOptions.response : null; } catch (e) { v = null; }
    if (Array.isArray(v)) v = v[0];
    return typeof v === 'string' && v ? v : 'standard';
}

// Apply a wrapped multi-select question onto the live `q` object.
function _applyMscQuestion(q, wrapped) {
    if (!wrapped) return false;
    q.text = wrapped.text;
    q.ans = wrapped.ans;
    q.options = wrapped.options;
    q.answerType = wrapped.answerType;
    q.hint = wrapped.hint;
    q.printFormat = wrapped.printFormat;
    q.skillLabel = wrapped.skillLabel;
    q.visual = '';
    return true;
}

// ========================================
// REGROUPING HELPERS
// ========================================
const RANGE_MAP = { '10': 10, '20': 20, '50': 50, '100': 100, '1k': 1000, '10k': 10000, '100k': 100000, '1m': 1000000 };

function hasCarry(a, b) {
    while (a > 0 || b > 0) {
        if ((a % 10) + (b % 10) >= 10) return true;
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
    }
    return false;
}

function hasBorrow(a, b) {
    while (a > 0 || b > 0) {
        if ((a % 10) < (b % 10)) return true;
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
    }
    return false;
}

// Worksheet-feedback §8.2: count how many digit columns require carrying when
// adding a + b. A column "carries" when the sum of that pair of digits (plus
// any incoming carry chain) reaches 10 or more. We use the simple per-column
// carry test: digit_a + digit_b >= 10 (no incoming-carry propagation needed
// to satisfy the "2-3 columns require carrying" rule).
function _countAddCarryColumns(a, b) {
    let count = 0;
    while (a > 0 || b > 0) {
        if ((a % 10) + (b % 10) >= 10) count++;
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
    }
    return count;
}

// Worksheet-feedback §8.2: count how many digit columns of `a` are SMALLER
// than the matching digit of `b`, forcing a borrow at that column.
function _countSubBorrowColumns(a, b) {
    let count = 0;
    while (a > 0 || b > 0) {
        if ((a % 10) < (b % 10)) count++;
        a = Math.floor(a / 10);
        b = Math.floor(b / 10);
    }
    return count;
}

// Public-ish helpers requested by worksheet-feedback §8.2. Returns true when
// the (a, b) pair requires regrouping in at least `minColumns` columns.
function _addRequiresRegrouping(a, b, minColumns = 2) {
    return _countAddCarryColumns(a, b) >= minColumns;
}

function _subRequiresRegrouping(a, b, minColumns = 2) {
    return _countSubBorrowColumns(a, b) >= minColumns;
}

// Returns true when `a` has at least one zero digit in a non-leading position
// AND `b` has a non-zero digit in that same position (forces borrowing across
// a zero, e.g., 5003 - 2847). Used for the ~15% across-zero subset.
function _subHasAcrossZero(a, b) {
    const aStr = a.toString();
    const bStr = b.toString().padStart(aStr.length, '0');
    // Skip leading digit (i=0) — only interior zeros matter.
    for (let i = 1; i < aStr.length - 1; i++) {
        if (aStr[i] === '0' && bStr[i] !== '0') return true;
    }
    return false;
}

// ========================================
// "WITHIN N" BOUNDS THE ANSWER  (owner ruling 1, P4)
// ========================================
// "Add within 20" promises the SUM is at most 20 — it never promised that both addends are.
// The old pair generators drew a and b from [minVal, maxVal] and let the answer land where it
// fell, so "within 20" printed 17 + 20 = 37 and "within 10,000" reached 19,897.
//
// Clamping the answer afterwards would be worse than the bug it fixes: every pair a clamp
// throws away is a large one, so the survivors pile up at the top of the band and six items
// read as the same item six times. So the ANSWER is drawn FIRST, uniformly across the band,
// and the pair is then BUILT to hit it:
//
//   no_regroup  a digit-wise split of the answer — for each digit s_i, a_i + b_i = s_i exactly.
//               No column can carry, by construction, so no draw is ever wasted and the old
//               "200 attempts then give up and return an unconstrained pair" fallback (which
//               is what let add_1m_no_regroup print regrouping items) is gone.
//   regroup     the answer is drawn, then the pair is CONSTRUCTED so the ONES column carries —
//               which is what the samples, PEDAGOGY_STANDARD.md and ws-content-audit.cjs all
//               mean by regrouping. An answer ending in 9 admits no such pair at all (two
//               digits reach 18 at most), so those step down by one instead of being retried.
//   mixed       a uniform split of the answer, no constraint.
//
// The answer is uniform over the band, so a histogram over the band comes out flat; the split
// is uniform given the answer, so operand sizes stay varied and ragged pairs still appear.

// The smallest answer a band should produce. Below "within 50" the whole band is in play; from
// "within 100" up, a tenth of the band is the floor, so "Add within 1,000" does not print 3 + 4.
function _bandMinAnswer(maxVal) {
    if (maxVal <= 10) return 2;
    if (maxVal <= 20) return 5;
    return Math.max(10, Math.floor(maxVal / 10));
}

// Split `sum` so that NO column carries: each digit of a is drawn from [0, that digit of sum],
// and b takes the remainder of that digit. a + b === sum always.
function _splitNoCarry(sum, rng) {
    let a = 0, place = 1, rest = sum;
    while (rest > 0) {
        const d = rest % 10;
        a += rng(0, d) * place;
        place *= 10;
        rest = Math.floor(rest / 10);
    }
    return [a, sum - a];
}

// Build a + b with the ONES column carrying and the sum inside [minSum, maxSum]. Exact — no
// rejection on the sum, so no band is ever "nearly impossible" and no draw is thrown away.
//
// The ones digits are drawn FIRST, uniformly over the 45 pairs that carry (a1 + b1 >= 10), and
// the sum's tens-and-above are drawn uniformly afterwards. Drawing the sum first instead and
// then splitting it looks tidier but is worse on the page: a sum whose ones digit is 8 has
// exactly one carrying split (9 + 9), so a flat sum makes 9 + 9 one item in nine, and 31% of
// the operands end in 9. Uniform digit pairs put that at 9 in 45, and the band spread is
// carried by the uniform `rest` either way — which is what the ruling is about.
// Neither scheme alone is right, so the two are blended half and half: uniform pairs left 9 + 9
// at 1 item in 45 and the hardest crossings barely appeared; a uniform sum digit put them at 1
// in 9 and filled the page with nines. Blended, a crossing of 17 or 18 turns up about half as
// often as a crossing of 11, which is the order the samples teach them in.
// Returns null when the band admits no carrying pair at all.
function _splitOnesCarry(maxSum, minSum, rng) {
    let a1 = 9, b1 = 9;
    if (rng(0, 1)) {
        const d = rng(0, 8);                // flat over the sum's ones digit
        a1 = rng(d + 1, 9);
        b1 = d + 10 - a1;
    } else {
        for (let t = 0; t < 40; t++) {      // flat over the 45 carrying digit pairs
            const x = rng(1, 9), y = rng(1, 9);
            if (x + y >= 10) { a1 = x; b1 = y; break; }
        }
    }
    const ones = a1 + b1 - 10;                          // 0..8, the sum's ones digit
    const restMax = Math.floor((maxSum - ones) / 10);   // the sum's tens-and-above
    if (restMax < 1) return null;
    const restMin = Math.min(restMax, Math.max(1, Math.ceil((minSum - ones) / 10)));
    const rest = rng(restMin, restMax);
    const aRest = rng(0, rest - 1);                     // the carry eats one from the columns above
    return [aRest * 10 + a1, (rest - 1 - aRest) * 10 + b1];
}

// Split so that NO column borrows: each digit of b is drawn from [0, that digit of a].
function _splitNoBorrow(a, rng) {
    let b = 0, place = 1, rest = a;
    while (rest > 0) {
        const d = rest % 10;
        b += rng(0, d) * place;
        place *= 10;
        rest = Math.floor(rest / 10);
    }
    return b;
}

// Build a − b with the ONES column borrowing and the minuend inside [minVal, maxVal].
// Same construction as _splitOnesCarry, and for the same reason: drawing the minuend first and
// then a subtrahend bigger in the ones made 31% of subtrahends end in 9 (a printed page read
// 35 − 19, 78 − 19, 65 − 19). The borrowing digit pair is uniform over its 45 pairs instead.
// Returns null when the band admits no borrowing pair at all.
function _subOnesBorrow(maxVal, minVal, rng) {
    let a1 = 0, b1 = 9;
    if (rng(0, 1)) {
        a1 = rng(0, 8);                     // flat over the minuend's ones digit
        b1 = rng(a1 + 1, 9);
    } else {
        for (let t = 0; t < 40; t++) {      // flat over the 45 borrowing digit pairs
            const x = rng(0, 9), y = rng(1, 9);
            if (x < y) { a1 = x; b1 = y; break; }
        }
    }
    const restMax = Math.floor((maxVal - a1) / 10);     // the minuend's tens-and-above
    if (restMax < 1) return null;
    const restMin = Math.min(restMax, Math.max(1, Math.ceil((minVal - a1) / 10)));
    const rest = rng(restMin, restMax);
    const bRest = rng(0, rest - 1);                     // keeps b < a even after the borrow
    return [rest * 10 + a1, bRest * 10 + b1];
}

// maxVal is the BAND: the largest SUM, not the largest addend.
function generateAddPair(maxVal, regroupType, rng, opts) {
    const o = opts || {};
    const minSum = Number.isFinite(o.minSum) ? o.minSum : _bandMinAnswer(maxVal);
    const minOperand = Number.isFinite(o.minOperand) ? o.minOperand : 1;

    if (regroupType === 'regroup') {
        const lo = Math.max(minSum, 10);    // 1 + 9 is the smallest carrying pair
        if (maxVal < 10) return [1, 9];     // no such pair exists in the band; caller guards
        // From "within 1,000" up the samples want more than one column working. Prefer that,
        // but never at the cost of the ones column, which is the column the skill is named for.
        const tries = maxVal >= 1000 ? 24 : 1;
        let best = null;
        for (let t = 0; t < tries; t++) {
            const pair = _splitOnesCarry(maxVal, lo, rng);
            if (!pair || pair[0] < 1 || pair[1] < 1) continue;
            best = pair;
            if (tries === 1 || _countAddCarryColumns(pair[0], pair[1]) >= 2) return pair;
        }
        return best || [Math.min(9, Math.max(1, maxVal - 9)), 9];
    }

    if (regroupType === 'no_regroup') {
        for (let t = 0; t < 60; t++) {
            const [a, b] = _splitNoCarry(rng(minSum, maxVal), rng);
            if (a >= minOperand && b >= minOperand) return [a, b];
        }
        for (let t = 0; t < 60; t++) {
            const [a, b] = _splitNoCarry(rng(minSum, maxVal), rng);
            if (a >= 1 && b >= 1) return [a, b];
        }
        return [1, 1];
    }

    // mixed
    const lo = Math.max(1, minOperand);
    for (let t = 0; t < 40; t++) {
        const s = rng(minSum, maxVal);
        if (s - lo < lo) continue;
        const a = rng(lo, s - lo);
        return [a, s - a];
    }
    const s = Math.max(2, rng(minSum, maxVal));
    const a = rng(1, s - 1);
    return [a, s - a];
}

// maxVal is the BAND: the largest MINUEND, which is the number "within N" is about for −.
function generateSubPair(maxVal, regroupType, rng, opts) {
    const o = opts || {};
    const minMinuend = Number.isFinite(o.minMinuend) ? o.minMinuend : _bandMinAnswer(maxVal);
    const minOperand = Number.isFinite(o.minOperand) ? o.minOperand : 1;

    if (regroupType === 'regroup') {
        const lo = Math.max(minMinuend, 10);
        if (maxVal < 10) return [Math.max(2, maxVal), 1];   // caller guards
        const tries = maxVal >= 1000 ? 24 : 1;
        let best = null;
        for (let t = 0; t < tries; t++) {
            const pair = _subOnesBorrow(maxVal, lo, rng);
            if (!pair) continue;
            const [a, b] = pair;
            if (b < 1 || b >= a) continue;
            best = [a, b];
            if (tries === 1) return best;
            // From "within 1,000" up, push for a second borrowing column, and take the
            // across-a-zero case when it turns up (worksheet-feedback §8.2).
            if (_countSubBorrowColumns(a, b) >= 2 || _subHasAcrossZero(a, b)) return best;
        }
        return best || [Math.max(10, Math.min(maxVal, 12)), 9];
    }

    if (regroupType === 'no_regroup') {
        for (let t = 0; t < 60; t++) {
            const a = rng(Math.max(2, minMinuend), maxVal);
            const b = _splitNoBorrow(a, rng);
            if (b >= Math.max(1, minOperand) && b < a) return [a, b];
        }
        for (let t = 0; t < 60; t++) {
            const a = rng(Math.max(2, minMinuend), maxVal);
            const b = _splitNoBorrow(a, rng);
            if (b >= 1 && b < a) return [a, b];
        }
        return [2, 1];
    }

    // mixed
    const lo = Math.max(1, minOperand);
    for (let t = 0; t < 40; t++) {
        const a = rng(Math.max(2, minMinuend), maxVal);
        if (a - 1 < lo) continue;
        return [a, rng(lo, a - 1)];
    }
    const a = Math.max(2, rng(minMinuend, maxVal));
    return [a, rng(1, a - 1)];
}

// ========================================
// BRIDGING TEN  (owner ruling 2, P4)
// ========================================
// "Add within 10 (With Regrouping)" cannot exist. Two single-digit addends whose sum is at most
// 10 never carry, and the nine pairs that make exactly 10 are the whole space — which is why the
// old generator printed 4 + 9 and 8 + 5 under a "within 10" heading and why the audit reports
// "the band makes regrouping impossible". "Subtract within 10 (With Regrouping)" is the same
// story from the other side: only 10 − n borrows, nine items in total.
//
// The rung the samples actually drill at this point is BRIDGING TEN: both numbers single digits,
// the ten crossed once. So `add_10_regroup` generates sums of 11 to 18 and `sub_10_regroup`
// minuends of 11 to 18 with a single-digit subtrahend and a single-digit difference. The skill
// IDS DO NOT CHANGE (four positional share-code systems index by position); only what they
// generate and what the cell calls itself change.
function _bridgingTenAddPair(rng) {
    const s = rng(11, 18);
    const a = rng(Math.max(2, s - 9), Math.min(9, s - 2));
    return [a, s - a];
}
function _bridgingTenSubPair(rng) {
    const m = rng(11, 18);          // the minuend crosses the ten
    const b = rng(m - 9, 9);        // b > m - 10, the ones digit of m, so the ones column borrows
    return [m, b];
}

// ============================================================================
// THE OPERATIONS LADDER v2 — the nineteen steps that needed an id of their own
// ============================================================================
// design/research/operations-facts-v2.md §22.1 maps every rung of the fourteen ladders onto the
// skill that hosts it. Nineteen rungs teach a PROCEDURE that no existing skill contains, so the
// ids wave appended nineteen ids to data.js (owner ruling R1: appending never moves a positional
// share code). Until this block existed those ids fell through to the per-category generator and
// dealt content their own titles did not promise — "Subtract Across Zeros" printing 79 − 19,
// "Zero in the Quotient" printing 45 ÷ 9. This is their generator.
//
// WHAT EVERY ONE OF THEM OBEYS
//   * the NAME is the contract (ws-content-audit.cjs): the cell deals the operation the title
//     names and nothing else, and a band in the title bounds the ANSWER;
//   * ONE cell shape per skill, so a page never changes kind halfway down (P-28);
//   * the written response is a number, a sign or a word from a two-word bank — never multiple
//     choice, because none of these items is multiple choice on paper (P-29);
//   * the cell is black, white and one grey (INK-1), drawn once and used on screen and on paper;
//   * a `judge` step prints HALF its items wrong, and the wrong answer comes from the §20
//     misconception bank, never from a random number (P-TH-2 / P-TH-3);
//   * no named character: A and B only (P-TH-14).
//
// HOW THE PRINTED CELL IS DRAWN. Two routes, both already in the repo:
//   1. `q.cell = {template, payload}` hands the item to the SHEET KIT (print-generate.js
//      `renderKitCell`, js/modules/sheet/cells/*). `stack` draws the place-value grid with the
//      LS-8 short-dash box, `equation` draws the number sentence with a circle for a sign. This
//      is the migration lever the kit was built for, and it is what makes the ANSWER KEY a
//      facsimile: the same cell with the value written in the slot the pupil writes in.
//   2. everything else draws its own black-and-white cell into `q.visual`, which the generic
//      visual branch of `formatProblemForPrint` prints under the instruction line.
// `q.visual` is set either way, because the screen renders that and not `q.cell`.
//
// STILL OUTSTANDING, and deliberately not faked here: the per-skill option schemas §2.5 asks for
// (`zeros`, `addends`, `responseScope`, `edgeCases`) do not exist in skill-options.js yet, and
// that file is not this wave's to edit. Where a rung is selected by one of them, the generator
// reads the option if it is ever added and otherwise DEALS the rungs across the page from the
// item index, so a page still walks the ladder instead of printing one rung six times.

const LADDER_V2_SKILLS = new Set([
    'add_column_multi', 'add_missing_digit', 'fact_family_sort',
    'sub_across_zeros', 'sub_missing_digit', 'sub_check_by_adding',
    'repeated_add_to_mult', 'equal_or_unequal_groups', 'mult_zeros',
    'mult_placeholder_zero', 'mult_missing_digit',
    'share_into_groups', 'div_equation_parts', 'div_zero_in_quotient',
    'remainder_too_big', 'div_check_by_multiplying', 'div_fix_estimate',
    'which_sign', 'missing_factor_or_addend',
]);

// ---------------------------------------------------------------- the black-and-white cell kit
// INK-1: ink, paper and one grey inside question content, nothing else. These helpers draw the
// screen cell in the ink the printed sheet uses, so the pupil meets ONE drawing.
const _WS_INK = MONO.ink;
const _WS_TRACK = '1.3em';
// SL-11 (owner ruling 2026-09-25): every writing box is slightly rounded - about 1.25 mm on
// paper at this cell's digit size - while frames and dividers stay square.
const _WS_SLOT_R = '0.18em';
/**
 * SL-12: one segment of a DIGIT STRIP. A row of digit boxes is one rounded outline with a thin
 * divider on every track boundary; each segment is a full track wide, so every divider sits
 * between two place-value columns of the numbers above it.
 */
const _wsSeg = (pos) => stripSegStyle(pos, { r: _WS_SLOT_R, w: '1.5px', dw: '1px', color: _WS_INK });

const _wsCell = (inner, note) => `<div class="ws-v2-cell" style="text-align:center;color:${_WS_INK};`
    + `font-family:'Andika','Open Sans',sans-serif;">${inner}`
    + `${note ? `<div style="margin-top:10px;font-size:0.95rem;line-height:1.4;">${_wsSayGaps(note)}</div>` : ''}</div>`;
/**
 * P8b: the gaps of a spoken frame ("Say: ___ times ___ equals ___ .") are drawn as short hair
 * rules, not typed underscores (SL-6: a blank is a rule or a box, never "___"). They are gaps to
 * SAY, so they are thinner and shorter than a writing line.
 */
const _wsSayGaps = (note) => String(note).replace(/_{3,}/g,
    () => `<span style="display:inline-block;width:2.2em;border-bottom:0.75pt solid ${_WS_INK};vertical-align:baseline;">&nbsp;</span>`);

/** An answer rule the pupil writes a number on (section 6: a line means "write a number"). */
const _wsLine = (chars = 3) => `<span style="display:inline-block;min-width:${(chars * 0.95).toFixed(2)}em;`
    + `border-bottom:1.5px solid ${_WS_INK};">&nbsp;</span>`;
/** A digit box: structure that says "one digit goes here". */
const _wsBox = () => `<span style="display:inline-block;width:1.15em;height:1.35em;`
    + `border:1.5px solid ${_WS_INK};border-radius:${_WS_SLOT_R};vertical-align:-0.35em;"></span>`;
/** LS-8: dashed means UNKNOWN, the one exception to "dashed means cut". */
const _wsUnknownBox = () => `<span style="display:inline-block;width:1.15em;height:1.35em;`
    + `border:1.5px dashed ${_WS_INK};border-radius:${_WS_SLOT_R};vertical-align:-0.35em;"></span>`;
/** A circle: the slot shape that says "write a SIGN here", never a number (section 6). */
const _wsCircle = () => `<span style="display:inline-block;width:1.5em;height:1.5em;border-radius:50%;`
    + `border:1.5px solid ${_WS_INK};vertical-align:-0.4em;"></span>`;

/**
 * Tick boxes: a LIST, with the box on the RIGHT of its label (owner, 2026-09-20). This is the
 * cell of every `decision` and `judge` step — the rule sits above it in a rounded box (P-TH-11).
 */
function _wsTickList(labels) {
    return `<div style="display:inline-block;text-align:left;margin-top:8px;">` + labels.map(l =>
        `<div style="display:flex;align-items:center;gap:10px;margin:4px 0;font-size:1rem;">`
        + `<span style="min-width:5.5em;">${l}</span>`
        + `<span style="display:inline-block;width:1.1em;height:1.1em;border:1.5px solid ${_WS_INK};border-radius:${_WS_SLOT_R};"></span>`
        + `</div>`).join('') + `</div>`;
}

/** The rule box a decision cell carries at the top (P-TH-11). */
const _wsRuleBox = (text) => `<div style="display:inline-block;border:1.5px solid ${_WS_INK};`
    + `border-radius:10px;padding:5px 12px;margin-bottom:10px;font-size:0.95rem;">${text}</div>`;

/**
 * Equal groups drawn as rings of dots — the picture MF-1, MF-4 and DF-1 share. One ring per
 * group, `counts[i]` dots inside ring i. Black outline, black dots, no fill.
 */
function _wsGroups(counts, { ring = true } = {}) {
    const r = 6, gap = 20, padX = 13, padY = 13;
    return `<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;">`
        + counts.map(n => {
            const cols = Math.min(3, Math.max(1, n));
            const rows = Math.ceil(Math.max(n, 1) / cols);
            const w = padX * 2 + (cols - 1) * gap + r * 2;
            const h = padY * 2 + (rows - 1) * gap + r * 2;
            let dots = '';
            for (let i = 0; i < n; i++) {
                dots += `<circle cx="${padX + r + (i % cols) * gap}" cy="${padY + r + Math.floor(i / cols) * gap}" r="${r}" fill="${_WS_INK}"/>`;
            }
            return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
                + (ring ? `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${(Math.min(w, h) / 2).toFixed(1)}" fill="none" stroke="${_WS_INK}" stroke-width="1.5"/>` : '')
                + dots + `</svg>`;
        }).join('') + `</div>`;
}

/**
 * A stacked place-value cell, drawn track by track (VA-1 … VA-13).
 *
 * `rows`      the operand rows, top first. The operator glyph sits on the LAST one (VA-2).
 * `regroup`   'add' | 'sub' | null — the empty regroup row. Addition's boxes sit above every
 *             column but the ones; subtraction's come from the TOP number's digits (VA-22).
 * `total`     a finished total printed in black under the rule (a missing-digit or judge cell
 *             has to show it, or the item is not solvable / not checkable).
 * `answer`    'boxes' (one empty digit box per track) | 'none'.
 * `unknown`   {row, index} — an LS-8 short-dash box over one digit of `rows[row]`, in the
 *             PADDED index space, which is the space the sheet kit's `stack` uses too.
 * `extra`     rows drawn under the rule: {text, ink: 'black'|'box'} — the multiplication
 *             partial-product rows.
 */
function _wsStack(rows, opSymbol, opts = {}) {
    const { regroup = null, total = null, answer = 'boxes', unknown = null, extra = [], width = 0 } = opts;
    const rs = rows.map(String);
    const w = Math.max(width, total === null ? 0 : String(total).length,
        ...rs.map(r => r.length), ...extra.map(e => String(e.text || '').length));
    const t = w + 1;                                   // VA-2: track 0 is the operator track
    const pad = (s) => String(s).padStart(t, ' ').split('');
    const cell = (ch) => `<span style="display:inline-block;width:${_WS_TRACK};text-align:center;">${ch === ' ' ? '&nbsp;' : ch}</span>`;
    const holeCell = () => `<span style="display:inline-block;width:${_WS_TRACK};text-align:center;">`
        + `<span style="display:inline-block;width:0.85em;height:1.15em;border:1.5px dashed ${_WS_INK};border-radius:${_WS_SLOT_R};"></span></span>`;
    // SL-12: every box row is ONE digit strip - a segment is a whole track (1.3em) wide, so the
    // dividers fall on the track boundaries. Answer segments are 1.4em tall (was a 0.85 x 1.15em
    // box), regroup segments 0.9em (was 0.7 x 0.75em). `vertical-align:top` keeps the row's
    // line box from growing under the taller box.
    const boxCell = (pos) => `<span data-ws-seg="${pos}" style="display:inline-block;box-sizing:border-box;width:${_WS_TRACK};`
        + `height:1.4em;vertical-align:top;${_wsSeg(pos)}"></span>`;
    // The answer box keeps `data-ws-box="1"` and stays empty, because the page engine's key
    // (print-sheet.js `legacyKeyFill`) finds it by exactly that; its own line-height centres the
    // digit the key writes into it.
    const ansBox = (pos) => `<span data-ws-box="1" data-ws-seg="${pos}" style="display:inline-block;box-sizing:border-box;`
        + `width:${_WS_TRACK};height:1.4em;line-height:1.4em;text-align:center;vertical-align:top;${_wsSeg(pos)}"></span>`;
    const smallBox = (pos) => `<span data-ws-seg="${pos}" style="display:inline-block;box-sizing:border-box;width:${_WS_TRACK};`
        + `height:0.9em;vertical-align:top;${_wsSeg(pos)}"></span>`;
    const blankTrack = () => `<span style="display:inline-block;width:${_WS_TRACK};">&nbsp;</span>`;

    const line = (html) => `<div style="white-space:nowrap;line-height:1.25;">${html}</div>`;
    let out = '';
    // A strip row: `on(i)` says which tracks hold a box; each contiguous run is one strip.
    const stripRow = (on, draw, blank = blankTrack) => {
        const flags = Array.from({ length: t }, (_, i) => !!on(i));
        return flags.map((f, i) => {
            if (!f) return blank(i);
            let a = i; while (a > 0 && flags[a - 1]) a--;
            let b = i; while (b < t - 1 && flags[b + 1]) b++;
            return draw(stripPos(i - a, b - a + 1));
        }).join('');
    };
    if (regroup === 'add') {
        out += line(stripRow((i) => i > 0 && i < t - 1, smallBox));
    } else if (regroup === 'sub') {
        const topLen = rs[0].length;
        out += line(stripRow((i) => i > t - 1 - topLen, smallBox));
    }
    rs.forEach((r, ri) => {
        const chars = pad(r);
        const body = chars.map((ch, i) => (i === 0)
            ? cell(ri === rs.length - 1 ? opSymbol : ' ')
            : (unknown && unknown.row === ri && unknown.index === i ? holeCell() : cell(ch))).join('');
        out += line(body);
    });
    out += `<div style="border-bottom:2.25px solid ${_WS_INK};width:${(t * 1.3).toFixed(2)}em;margin:3px 0;"></div>`;
    for (const e of extra) {
        const chars = pad(e.text === undefined ? '' : e.text);
        out += line(e.ink === 'box'
            ? stripRow((i) => chars[i] === '#', boxCell)
            : chars.map((ch, i) => cell(i === 0 ? (e.op || ' ') : ch)).join(''));
        if (e.rule) out += `<div style="border-bottom:2.25px solid ${_WS_INK};width:${(t * 1.3).toFixed(2)}em;margin:3px 0;"></div>`;
    }
    if (total !== null) out += line(pad(total).map((ch, i) => cell(i === 0 ? ' ' : ch)).join(''));
    // P8: the answer row is the cell's one answer slot. It is marked so the page engine's key
    // (print-sheet.js `legacyKeyFill`) writes each digit into its own box instead of stamping
    // the answer under the cell.
    else if (answer === 'boxes') out += `<div data-ws-slot="answer" data-ws-shape="boxes" style="white-space:nowrap;line-height:1.25;">`
        + stripRow((i) => i > 0, ansBox) + `</div>`;
    return `<div style="display:inline-block;text-align:right;font-size:1.7rem;font-weight:700;`
        + `letter-spacing:0;font-variant-numeric:tabular-nums;">${out}</div>`;
}

/** Is the top digit of some column a zero that has to PASS a borrow on to its left? */
function _borrowTravelsThroughZero(a, b) {
    const A = String(a).split('').reverse().map(Number);
    const B = String(b).padStart(String(a).length, '0').split('').reverse().map(Number);
    let borrow = 0;
    for (let i = 0; i < A.length; i++) {
        const top = A[i] - borrow;
        if (top < 0) return true;              // this column was 0 and had nothing to give
        borrow = top < B[i] ? 1 : 0;
    }
    return false;
}

/** M-S1, the smaller-from-larger bug: every column answered |top − bottom|. */
function _wrongSmallerFromLarger(a, b) {
    const A = String(a), B = String(b).padStart(A.length, '0');
    let out = '';
    for (let i = 0; i < A.length; i++) out += Math.abs(Number(A[i]) - Number(B[i]));
    return parseInt(out, 10);
}

/** A deal over `n` rungs that starts each PAGE at a different point, as factConstantFor does. */
let _rungOffset = 0;
function _dealRung(n) {
    const at = Number.isFinite(state.itemIndex) ? state.itemIndex : _constantCursor;
    if (at === 0) _rungOffset = Math.floor(Math.random() * n);
    return (((at + _rungOffset) % n) + n) % n;
}

/**
 * The nineteen appended ladder steps. Returns true when it handled the skill, false when the
 * caller should carry on down the per-category chain.
 */
function _generateLadderV2(q, skill, helpers, range) {
    const { rng } = helpers;

    // ======================================================================== ADDITION
    // CM-3 … CM-8. The one thing this contains that no two-addend skill does: a ones column that
    // can total more than 19, so the regroup box has to hold a two-digit carry (M-A10), and a
    // column the pupil can stop half way down (M-A9, the published "procedural / incomplete"
    // error). §2.5's `addends` option would choose 3 or 4; until it exists the two alternate.
    if (skill === 'add_column_multi') {
        const wide = range >= 1000 && rng(0, 2) === 0;          // CM-7: three-digit addends
        // P11: `tiles` ("Numbers to add") fixes 3 or 4; unset, the two alternate (CM-5 / CM-6).
        const _addends = Number(_opt('tiles'));
        const k = _addends === 3 || _addends === 4 ? _addends : 3 + (_dealRung(2) === 1 ? 1 : 0);
        const lo = wide ? 100 : 10, hi = wide ? 999 : 99;
        let addends = null;
        for (let t = 0; t < 60; t++) {
            const pick = Array.from({ length: k }, () => rng(lo, hi));
            // CM-8: one short addend beside the long ones, so "line the ones up" is a real
            // decision and not a shape the grid gives away.
            if (!wide && rng(0, 3) === 0) pick[k - 1] = rng(2, 9);
            const onesTotal = pick.reduce((s, n) => s + (n % 10), 0);
            // P-10 seeds items that do NOT regroup; the rest must, or the step teaches nothing.
            const wantRegroup = rng(0, 3) !== 0;
            if (wantRegroup === (onesTotal >= 10)) { addends = pick; break; }
        }
        if (!addends) addends = Array.from({ length: k }, () => rng(lo, hi));
        const sum = addends.reduce((s, n) => s + n, 0);
        const onesTotal = addends.reduce((s, n) => s + (n % 10), 0);
        q.text = `${addends.join(' + ')} = ?`;
        // On paper the column IS the problem, so printing the horizontal form above it would put
        // the same problem in the cell twice (CL-1: one problem, one boxed cell). `printText` is
        // the print layer's own hook for exactly this.
        q.printText = 'Add.';
        q.ans = sum;
        q.operands = addends.slice();
        q.answerType = 'number';
        q.options = buildNumericOptions(sum);
        q.skillLabel = 'Add Three or Four Numbers';
        q.hint = onesTotal >= 10
            ? `Add the ones first: ${addends.map(n => n % 10).join(' + ')} = ${onesTotal}. `
              + `Write ${onesTotal % 10}, regroup ${Math.floor(onesTotal / 10)}. Then add the tens — and do not stop half way.`
            : `Add the ones first: ${addends.map(n => n % 10).join(' + ')} = ${onesTotal}. `
              + `That is less than ten, so nothing is regrouped. Then add the tens.`;
        // P8: the answer row is as wide as the LARGEST sum this page can reach (4 x 99 = 396,
        // three boxes), never the sum of this item: two boxes under 24 + 66 + 92 = 182 left the
        // key unwritable (H1), and a box count that followed the item would tell the pupil how
        // many digits the answer has. The regroup row then sits over tens AND hundreds, since
        // a tens column of four addends regroups into the hundreds.
        const widest = String(k * hi).length;
        // The kit's `stack` template draws it: every addend on the digit tracks, the operator
        // in its own track, a regroup strip over the tens and hundreds (SL-12) and an answer
        // strip exactly as wide as the largest sum (never a box under the operator).
        const _cmPayload = { operands: addends.slice(), op: '+', regroup: 'add', heads: false, answer: 'boxes', ansDigits: widest };
        q.cell = { template: 'stack', v: 1, payload: _cmPayload };
        q.visual = _kitStackTwin(_cmPayload);
        // The boxes ARE the slot: no second "Answer: ____" line under them (H8).
        q.selfAnswering = true;
        q.printFormat = 'column-add-multi';
        q.notation = 'stacked';
        return true;
    }

    // AC-19 / SC-19 / MB-12. One digit of a FINISHED piece of column work is a short-dash box
    // (LS-8). The total is printed, or the item is not solvable. The sheet kit's `stack`
    // template draws exactly this cell and writes the given digit into the box on the key.
    if (skill === 'add_missing_digit' || skill === 'sub_missing_digit' || skill === 'mult_missing_digit') {
        const isAdd = skill === 'add_missing_digit';
        const isMul = skill === 'mult_missing_digit';
        let a, b, total, opSym, kitOp;
        if (isMul) {
            // P12: `tiles` 31 makes the top number three digits (the default, 21, is two).
            a = Number(_opt('tiles')) === 31 ? rng(102, 989) : rng(12, 98);
            b = rng(2, 9); total = a * b; opSym = '×'; kitOp = '*';
        } else if (isAdd) {
            // A floor of half the band: a missing digit inside "7 + 9" is not column work.
            const band = Math.max(100, Math.min(range, 1000));
            [a, b] = generateAddPair(band, 'regroup', rng, { minSum: Math.floor(band / 2) });
            total = a + b; opSym = '+'; kitOp = '+';
        } else {
            const band = Math.max(100, Math.min(range, 1000));
            [a, b] = generateSubPair(band, 'regroup', rng, { minMinuend: Math.floor(band / 2) });
            total = a - b; opSym = '−'; kitOp = '-';
        }
        // The hidden digit lives in one of the two printed operand rows. The answer row is the
        // one thing the cell must SHOW, so it is never the hole.
        const t = Math.max(String(a).length, String(b).length) + 1;
        const rowPick = rng(0, 1);                       // 0 = the top number, 1 = the bottom
        const src = String(rowPick === 0 ? a : b).padStart(t, ' ');
        const positions = [];
        for (let i = 1; i < t; i++) if (src[i] !== ' ') positions.push(i);
        const idx = positions[rng(0, positions.length - 1)];
        const digit = Number(src[idx]);
        q.text = 'Find the missing digit.';
        q.ans = digit;
        q.a = a; q.b = b; q.op = opSym;
        q.answerType = 'number';
        q.options = buildNumericOptions(digit);
        q.skillLabel = isMul ? 'Missing Digit (×)' : isAdd ? 'Missing Digit (+)' : 'Missing Digit (−)';
        q.hint = isAdd
            ? `Work the column the box is in. The two digits in that column have to make the digit under the rule — and remember any ten regrouped from the column to its right.`
            : isMul
                ? `Multiply the ones first: the ones digit of ? × ${b} has to be ${total % 10}.`
                : `Work the column the box is in. The two digits in that column have to leave the digit under the rule — and remember any ten regrouped away.`;
        // No in-cell caption: q.text already carries the instruction, and BD-10 puts it above
        // the cells, never inside one. The dashed box is itself the instruction (LS-8: dashed
        // means unknown), so repeating it in words only adds reading load.
        q.visual = _wsCell(
            _wsStack([a, b], opSym, { total, unknown: { row: rowPick, index: idx }, answer: 'none' }));
        // The sheet kit draws the printed cell and the answer key (see the header comment).
        q.cell = {
            template: 'stack', v: 1,
            payload: { operands: [a, b], op: kitOp, ans: total, answer: 'solid', regroup: false, heads: false,
                unknown: { row: rowPick === 0 ? 'a' : 'b', index: idx } },
        };
        q.printFormat = isAdd ? 'column-add' : isMul ? 'column-mult' : 'column-sub';
        q.notation = 'stacked';
        return true;
    }

    // FF-6. The one fact-family cell that must emit NON-EXAMPLES, at 1:1 (P-10) — which is why
    // it cannot be an option on a fact-family skill: a family skill that printed a triple that
    // is not a family would be lying in every other role it appears in.
    if (skill === 'fact_family_sort') {
        const band = Math.max(10, Math.min(range, 20));
        const isFamily = _dealRung(2) === 0;             // exactly half, dealt, never rolled
        // A triple IS a family exactly when its largest number is the sum of the other two. That
        // is the property, so it is the thing tested — a non-example that turned out to be a
        // family by accident (4, 5, 9 built as "a part too big") would be the worst kind of
        // wrong answer key, and no amount of careful construction proves it away.
        const isFam = (t) => {
            const s = t.slice().sort((x, y) => x - y);
            return s[0] + s[1] === s[2];
        };
        let trio = null, why = '';
        for (let t = 0; t < 60; t++) {
            const whole = rng(6, band);
            const p1 = rng(1, whole - 1);
            const p2 = whole - p1;
            let cand, note;
            if (isFamily) {
                cand = [p1, p2, whole];
                note = `${p1} and ${p2} make ${whole}, so it is a family.`;
            } else if (rng(0, 1)) {
                // M-F2, a near miss: the two parts do not quite make the whole.
                const off = rng(0, 1) ? 1 : 2;
                const bad = whole + off <= band + 2 ? whole + off : whole - off;
                cand = [p1, p2, bad];
                note = `${p1} and ${p2} make ${whole}, not ${bad}, so it is not a family.`;
            } else {
                // M-F1: one number is bigger than the largest, so it cannot be a part of it.
                const big = whole + rng(1, 3);
                const small = rng(2, Math.max(2, whole - 2));
                cand = [whole, big, small];
                note = `${big} is bigger than ${whole}, and ${whole} and ${small} do not make ${big}.`;
            }
            if (cand.every(n => n >= 1) && isFam(cand) === isFamily) { trio = cand; why = note; break; }
        }
        if (!trio) { trio = isFamily ? [3, 4, 7] : [3, 4, 9]; why = isFamily ? '3 and 4 make 7.' : '3 and 4 make 7, not 9.'; }
        const shown = shuffle(trio.slice());
        q.text = `Is ${shown.join(', ')} a fact family? Write yes or no.`;
        q.ans = isFamily ? 'yes' : 'no';
        q.acceptedAnswers = isFamily ? ['yes', 'y'] : ['no', 'n'];
        q.answerType = 'text';
        q.skillLabel = 'Is It a Fact Family?';
        q.hint = `Two of the numbers must make the third. ${why}`;
        q.visual = _wsCell(
            _wsRuleBox('Two parts make the whole.')
            + `<div style="font-size:2rem;font-weight:700;letter-spacing:0.15em;margin:6px 0;">${shown.join('&nbsp;&nbsp;')}</div>`
            + _wsTickList(['Yes', 'No']),
            `Say: ___ and ___ make ___ .`);
        q.printFormat = 'fact-family-sort';
        return true;
    }

    // ===================================================================== SUBTRACTION
    // SZ-1 … SZ-6. The procedure no other subtraction skill contains: the borrow has nothing to
    // take from, so it travels LEFT through a run of zeros (M-S3a, M-S3b). Every item below is
    // constructed to have that property and then CHECKED for it, because an item where nothing
    // crosses the zero is the exact defect this id was created to end.
    //
    // §12 makes the number of zeros and where they sit the `zeros` option. That option does not
    // exist yet, so the rungs legal for the teacher's band are dealt across the page.
    if (skill === 'sub_across_zeros') {
        // THE BAND HAS A FLOOR HERE, and it is the one place in this block where Max Number is
        // not obeyed to the letter. A borrow can only TRAVEL through a zero when the minuend has
        // an interior zero, and inside a two-digit band exactly one number does: 100. A page of
        // six would then be "100 − n" six times, which is the monotony this whole wave exists to
        // end. So the rung set is drawn from at least 400 and grows with Max Number from there.
        // The name declares no band, so nothing is promised and then broken (the content gate
        // agrees: `sub_across_zeros` has no band to exceed).
        // P11 (OPTIONS-CRITIC-R2 §5 #18): the skill's own "Start numbers to" band bounds the
        // minuend. 500 is the old default page (drawn to 400, minuends to 408); 1,000 stops below
        // the thousands rungs (whose 1,0xx minuends would pass it); 10,000 keeps them all. With no
        // option declared (an old caller) the page grows with Max Number as it always did.
        const _azBand = Number(_opt('band'));
        const band = _azBand ? ({ 500: 400, 1000: 999, 10000: 10000 }[_azBand] || 400) : Math.max(400, range);
        const build = () => {
            const rungs = [];
            if (band >= 100) rungs.push('whole-hundred');           // SZ-2   100 − 47, 400 − 157
            if (band >= 300) rungs.push('zero-in-tens');            // SZ-4   304 − 126
            if (band >= 1000) rungs.push('whole-thousand', 'zeros-inside', 'zero-middle'); // SZ-3, SZ-5, SZ-6
            if (!rungs.length) rungs.push('whole-ten');             // SZ-1   50 − 27, the only rung under 100
            const rung = rungs[_dealRung(rungs.length)];
            if (rung === 'whole-ten') {
                const a = rng(3, Math.max(3, Math.floor(band / 10))) * 10;
                return [a, rng(1, a - 1)];
            }
            if (rung === 'whole-hundred') {
                const h = band >= 200 ? rng(1, Math.min(9, Math.floor(band / 100))) : 1;
                const a = h * 100;
                const b = rng(Math.max(11, Math.floor(a / 8)), a - 1);
                return [a, b % 10 === 0 ? b - 1 : b];
            }
            if (rung === 'zero-in-tens') {
                const h = rng(1, Math.min(9, Math.floor(band / 100)));
                const o = rng(1, 8);
                const a = h * 100 + o;
                const bOnes = rng(o + 1, 9);                        // forces the ones to borrow
                const b = Math.min(a - 1, rng(1, h * 10 - 1) * 10 + bOnes);
                return [a, b];
            }
            if (rung === 'whole-thousand') {
                const k = rng(1, Math.min(9, Math.floor(band / 1000)));
                const a = k * 1000;
                const b = rng(Math.max(101, Math.floor(a / 8)), a - 1);
                return [a, b % 10 === 0 ? b - 1 : b];
            }
            if (rung === 'zeros-inside') {
                const k = rng(1, Math.min(9, Math.floor(band / 1000)));
                const o = rng(1, 8);
                const a = k * 1000 + o;
                const bOnes = rng(o + 1, 9);
                const b = rng(1, k * 100 - 1) * 10 + bOnes;
                return [a, Math.min(b, a - 1)];
            }
            // zero-middle (SZ-6): the zero sits inside the number and the TENS column is what
            // forces the crossing, so the ones may well not borrow at all.
            const k = rng(1, Math.min(9, Math.floor(band / 1000)));
            const tn = rng(0, 8), on = rng(0, 9);
            const a = k * 1000 + 0 * 100 + tn * 10 + on;
            const bTens = rng(tn + 1, 9);
            const b = rng(1, k) * 100 + bTens * 10 + rng(0, Math.min(on, 9));
            return [a, Math.min(b, a - 1)];
        };
        let a = 0, b = 0;
        for (let t = 0; t < 80; t++) {
            const [x, y] = build();
            if (y >= 1 && y < x && _borrowTravelsThroughZero(x, y)) { a = x; b = y; break; }
        }
        if (!a) { a = 100; b = rng(11, 89); }            // 100 − n always travels through the tens
        const ans = a - b;
        const zeroRun = String(a).slice(1).match(/0+/);
        q.text = `${a.toLocaleString()} − ${b.toLocaleString()} = ?`;
        q.ans = ans;
        q.a = a; q.b = b; q.op = '−';
        q.answerType = 'number';
        q.options = buildNumericOptions(ans);
        q.skillLabel = 'Subtract Across Zeros';
        q.hint = `There are not enough ones. The next column is a zero, so it has nothing to give — `
            + `go on to the next one. ${Math.floor(a / 10)} tens becomes ${Math.floor(a / 10) - 1} tens, and the ones get ten more.`;
        q.visual = _wsCell(_wsStack([a, b], '−', { regroup: 'sub', answer: 'boxes' }),
            zeroRun ? 'The borrow has to travel past the zero.' : '');
        q.printFormat = 'column-sub';
        q.notation = 'stacked';
        return true;
    }

    // SC-20. A `judge` cell (P-TH-4): finished work printed in BLACK, half of it wrong, and the
    // check is the INVERSE operation — which is why this is not an option on a subtraction
    // skill. The wrong answers come from the §20 bank, never from a random number (P-TH-2).
    if (skill === 'sub_check_by_adding') {
        const band = Math.max(100, Math.min(range, 1000));
        // The work being judged has to be worth checking: a floor of half the band keeps the
        // minuend off the bottom of the band, so the cell is not "14 − 8" with a borrow.
        const [a, b] = generateSubPair(band, 'regroup', rng, { minMinuend: Math.floor(band / 2) });
        const right = a - b;
        const isRight = _dealRung(2) === 0;
        let shown = right, bug = '';
        if (!isRight) {
            const s = _wrongSmallerFromLarger(a, b);
            if (s !== right && s > 0) { shown = s; bug = 'M-S1'; }
            else { shown = right + 10; bug = 'M-S4'; }
        }
        q.text = `Check this by adding: ${a} − ${b} = ${shown}. Write the correct answer.`;
        q.printText = 'Check by adding. Write the correct answer.';   // the cell draws the sum
        q.ans = right;
        q.a = a; q.b = b; q.op = '−';
        q.answerType = 'number';
        q.options = buildNumericOptions(right);
        q.skillLabel = 'Check a Subtraction by Adding';
        q.wrongFrom = bug || null;
        q.hint = `Add the answer back on: ${shown} + ${b} = ${shown + b}. `
            + (isRight ? `That is ${a}, so the work is correct.` : `That is not ${a}, so it is wrong — work it out again.`);
        q.visual = _wsCell(
            _wsStack([a, b], '−', { total: shown, answer: 'none' })
            + `<div style="margin-top:10px;font-size:1.15rem;">${shown} + ${b} = ${_wsLine(4)}</div>`
            + _wsTickList(['Correct', 'Fix it']),
            'Add the answer to the bottom number. Does it make the top number?');
        q.printFormat = 'sub-check-judge';
        q.responseScope = 'judge';
        return true;
    }

    // ================================================================== MULTIPLICATION
    // MF-3. An ADDITION expression inside a multiplication cell — the bridging step P-8 allows
    // exactly once, and the reason it cannot live on a multiplication drill (P-28).
    if (skill === 'repeated_add_to_mult') {
        // P12: `band` (products to 25 / 36 / 100) sets the largest group count and group size;
        // `pictures` off leaves only the two frames (the adding and the multiplying).
        const _fMax = { 25: 5, 36: 6, 100: 10 }[Number(_opt('band'))] || 6;
        const g = rng(2, _fMax), s = rng(2, _fMax);
        const _pics = _opt('pictures') !== false;
        const product = g * s;
        q.text = `${Array(g).fill(s).join(' + ')} = ${g} × ${s} = ?`;
        q.printText = 'Write the adding as multiplying.';   // the two frames are in the cell
        q.ans = product;
        q.a = g; q.b = s; q.op = '×';
        q.answerType = 'number';
        q.options = buildNumericOptions(product);
        q.skillLabel = 'Adding as Multiplying';
        q.hint = `${g} groups of ${s}. Adding ${s} ${g} times is the same as ${g} × ${s}.`;
        q.visual = _wsCell(
            (_pics ? _wsGroups(Array(g).fill(s)) : '')
            + `<div style="margin-top:10px;font-size:1.35rem;">${Array(g).fill(s).join(' + ')} = ${_wsLine(3)}</div>`
            + `<div style="margin-top:6px;font-size:1.35rem;">${g} × ${s} = ${_wsLine(3)}</div>`,
            `Say: ${g} groups of ${s}. ${g} times ${s} equals ___ .`);
        q.printFormat = 'repeated-add-mult';
        return true;
    }

    // MF-4 / XD-3. Needs UNEQUAL groups, which an "equal groups" skill must never emit — the
    // other half of the reason this is its own id.
    if (skill === 'equal_or_unequal_groups') {
        const g = rng(2, 5);
        // P12: `step` is the most counters in a group (6 or 10); `forms` deals equal / unequal.
        const s = rng(2, Number(_opt('step')) === 10 ? 10 : 6);
        const equal = _p12Form(() => _dealRung(2)) === 0;
        const counts = Array(g).fill(s);
        if (!equal) {
            // The non-example MOVES counters between two rings instead of adding or removing
            // them, so the TOTAL is the same as the matching equal item. That is deliberate
            // twice over: it is the harder and truer non-example (the total shares out perfectly
            // and the groups are still not the same), and it means the total printed in the
            // instruction below cannot decide the question. The pupil has to look.
            const from = rng(0, g - 1);
            let to = rng(0, g - 2); if (to >= from) to++;
            const k = Math.min(rng(1, 2), counts[from] - 1);
            counts[from] -= k; counts[to] += k;
        }
        const total = counts.reduce((x, n) => x + n, 0);
        q.text = `${g} groups, ${total} counters in all. `
            + `Write multiply if every group is the same, or add if they are not.`;
        // BD-10 caps the printed instruction at 12 words, and the cell already draws the groups,
        // so paper says only what the pupil must DO. q.text keeps the per-item description for
        // the screen, the answer check and the audit's distinctness key.
        q.printText = 'Write multiply if the groups are equal. If not, write add.';
        q.ans = equal ? 'multiply' : 'add';
        q.acceptedAnswers = equal ? ['multiply', 'x', '×'] : ['add', '+'];
        q.answerType = 'text';
        q.skillLabel = 'Equal Groups or Not?';
        q.hint = equal
            ? `Every group has ${s}. The groups are the same, so you can multiply.`
            : `The groups hold ${counts.join(', ')}. They are not the same, so you must add.`;
        q.visual = _wsCell(
            _wsRuleBox('Multiply only when every group is the same.')
            + _wsGroups(counts)
            + _wsTickList(['I can multiply', 'I must add']),
            'Say: Each group has ___ .');
        q.printFormat = 'equal-groups-decide';
        q.responseScope = 'decision';
        return true;
    }

    // MB-1, MB-2. Factors outside every fact skill's table, and taught BEFORE the algorithm on
    // every reference site — which is why it could not be an option on a fact drill.
    if (skill === 'mult_zeros') {
        const n = rng(2, 9);
        const form = _p12Form(() => _dealRung(3));     // P12: `forms` × 10 / × 100 / × tens
        let a, b, hint;
        if (form === 0) { a = n; b = 10; hint = `${n} × 1 = ${n}, so ${n} × 10 is ${n} tens = ${n * 10}.`; }
        else if (form === 1) { a = n; b = 100; hint = `${n} × 1 = ${n}, so ${n} × 100 is ${n} hundreds = ${n * 100}.`; }
        else {
            const d = rng(2, 9);
            if (rng(0, 1)) { a = n; b = d * 10; } else { a = d * 10; b = n; }
            hint = `${n} × ${d} = ${n * d}, so the answer is ${n * d} tens = ${n * d * 10}.`;
        }
        const product = a * b;
        q.text = `${a} × ${b} = ?`;
        q.ans = product;
        q.a = a; q.b = b; q.op = '×';
        q.answerType = 'number';
        q.options = buildNumericOptions(product);
        q.skillLabel = 'Multiply by Tens';
        q.hint = hint;
        q.visual = '';
        q.printFormat = 'mult-facts-horizontal';
        q.notation = 'across';
        return true;
    }

    // MB-9. `responseScope: notation` — the second partial-product row's ZERO BOX only, and
    // nothing is multiplied. M-M6, the omitted placeholder zero, is the single biggest 2 × 2
    // error, and this step exists for it alone. The answer is 0 every time, on purpose: the step
    // is about WHERE the row starts, not about the product.
    if (skill === 'mult_placeholder_zero') {
        // P12: `tiles` 32 makes the top number three digits (215 × 36); 22 (default) is 2 × 2.
        const a = Number(_opt('tiles')) === 32 ? rng(102, 989) : rng(13, 89);
        // The ones digit runs 2 … 9: a multiplier ending in 0 has no second row to start, and
        // one ending in 1 makes the printed first row a copy of the top number, which reads as
        // if nothing had been multiplied at all.
        const b = rng(1, 4) * 10 + rng(2, 9);
        const ones = b % 10, tens = Math.floor(b / 10);
        const firstPartial = a * ones;
        q.text = `${a} × ${b}. The first row is done. Start the second row.`;
        q.ans = 0;
        q.a = a; q.b = b; q.op = '×';
        q.answerType = 'number';
        q.options = [0, 1, a % 10, tens].filter((v, i, l) => l.indexOf(v) === i).map(String);
        q.skillLabel = 'Write the Placeholder Zero';
        q.responseScope = 'notation';
        q.hint = `The ${tens} is ${tens} TENS, not ${tens} ones, so the second row starts in the tens place. `
            + `Write 0 in the ones place first, then multiply. Do not multiply yet.`;
        q.visual = _wsCell(
            _wsStack([a, b], '×', {
                answer: 'none',
                extra: [
                    { text: String(firstPartial), ink: 'digits' },
                    { text: '#'.padStart(String(firstPartial).length, ' '), ink: 'box' },
                ],
            }),
            // "Start the second row" is already the instruction above the cells. All that is left
            // to say in the cell is the constraint the instruction cannot carry: this step is
            // notate-only, so the pupil must NOT work the product out (BD-10, one instruction).
            'Do <b>not</b> multiply.');
        q.printFormat = 'mult-placeholder-zero';
        q.notation = 'stacked';
        return true;
    }

    // ======================================================================== DIVISION
    // DF-1. The cell holds NO division equation at all: a total of counters, rings of d, and a
    // frame that counts the RINGS. That is why it is not an option on a division drill.
    if (skill === 'share_into_groups') {
        // P8: the answer (the number of groups) spreads over 2-10, not 2-6.
        let d = rng(2, 6), g = rng(2, 10);
        // Fewer than eight counters is not a sharing problem, it is a glance; and a total above
        // about forty is more counters than the cell can draw at a countable size.
        for (let t = 0; t < 20 && (d * g < 8 || d * g > 40); t++) { d = rng(2, 6); g = rng(2, 10); }
        const total = d * g;
        // "Ring" is a pencil verb: paper keeps it, the screen (which has no ring tool) says "make".
        q.text = `There are ${total} counters. Make groups of ${d}. How many groups are there?`;
        q.printText = `There are ${total} counters. Ring groups of ${d}. How many groups are there?`;
        q.ans = g;
        q.a = total; q.b = d; q.op = '÷';
        q.answerType = 'number';
        q.options = buildNumericOptions(g);
        q.skillLabel = 'Make Equal Groups to Divide';
        q.hint = `Ring ${d} counters, then ${d} more, until they are all used. Count the rings: ${g}.`;
        // P8 (critic, baseline 2026-09-24): the counters are ONE picture in rows of ten with a
        // gap after five — the old flex row of loose dots wrapped at seven, whatever the group
        // size, so the rows fought the grouping. And the item has ONE answer place, the
        // "Answer:" line: the in-cell "___ groups of 6" blank and the Say frame's blank made
        // three places for one number (H8). The Say frame is oral, has no blank, and speaks of
        // GROUPING (making groups of a size), the meaning the task uses, not "shared into".
        const sgPitch = 28, sgR = 9, sgGap = 12;
        const sgCols = Math.min(10, total), sgRows = Math.ceil(total / 10);
        const sgW = 12 + sgCols * sgPitch + (sgCols > 5 ? sgGap : 0), sgH = 12 + sgRows * sgPitch;
        let sgDots = '';
        for (let i = 0; i < total; i++) {
            const c = i % 10, r = Math.floor(i / 10);
            sgDots += `<circle cx="${6 + sgPitch / 2 + c * sgPitch + (c >= 5 ? sgGap : 0)}" cy="${6 + sgPitch / 2 + r * sgPitch}" r="${sgR}" fill="${_WS_INK}"/>`;
        }
        q.visual = _wsCell(
            `<svg width="${sgW}" height="${sgH}" viewBox="0 0 ${sgW} ${sgH}" style="max-width:100%;">${sgDots}</svg>`,
            `Say: I made groups of ${d}. I count the groups.`);
        q.printFormat = 'share-into-groups';
        return true;
    }

    // DF-2 / DF-3. Reading a division equation part by part. The number is GIVEN — the response
    // is which number means what, not a quotient, so the cell teaches the vocabulary M-D4 (the
    // dividend and divisor swapped) comes from.
    if (skill === 'div_equation_parts') {
        // P12: `band` is the largest total (group count and size to 5 for 25, to 9 for 81).
        const _dpMax = Number(_opt('band')) === 25 ? 5 : 9;
        const s = rng(2, _dpMax);
        const g = rng(2, _dpMax);
        const total = s * g;
        const ask = _p12Form(() => _dealRung(3));     // P12: `forms` which number is asked
        const wording = ['how many there are in all', 'how many are in each group', 'how many groups there are'];
        const answers = [total, s, g];
        q.text = `In ${total} ÷ ${s} = ${g}, which number tells ${wording[ask]}? Write it.`;
        q.printText = `Which number tells ${wording[ask]}? Write it.`;   // the cell draws the equation
        q.ans = answers[ask];
        q.a = total; q.b = s; q.op = '÷';
        q.answerType = 'number';
        q.options = buildNumericOptions(answers[ask]);
        q.skillLabel = 'Parts of a Division Equation';
        q.hint = `${total} is how many there are in all. ${s} is how many are in each group. ${g} is how many groups.`;
        q.visual = _wsCell(
            _wsGroups(Array(g).fill(s))
            + `<div style="margin-top:10px;font-size:1.6rem;font-weight:700;">${total} ÷ ${s} = ${g}</div>`
            + `<div style="margin-top:8px;font-size:1.1rem;">${_wsLine(3)} in all&nbsp;&nbsp;·&nbsp;&nbsp;`
            + `${_wsLine(3)} in each group&nbsp;&nbsp;·&nbsp;&nbsp;${_wsLine(3)} groups</div>`,
            `Say: ${total} in all, ${s} in each group.`);
        q.printFormat = 'div-equation-parts';
        return true;
    }

    // DL-6. A place the divisor does not go into still gets a digit — M-D2, `312 ÷ 3 = 14`. The
    // quotient is BUILT to carry an interior zero, and the item is checked for it below.
    if (skill === 'div_zero_in_quotient') {
        let dividend = 0, divisor = 0, quotient = 0;
        for (let t = 0; t < 40; t++) {
            const fourDigit = range >= 1000 && rng(0, 2) === 0;
            const d = fourDigit ? rng(2, 4) : rng(2, 9);
            if (fourDigit) {
                const h = rng(1, Math.max(1, Math.floor(9999 / d / 1000)));
                const qq = h * 1000 + 0 * 100 + rng(0, 9) * 10 + rng(1, 9);
                if (qq * d > 9999) continue;
                if (!/^\d0/.test(String(qq))) continue;
                dividend = qq * d; divisor = d; quotient = qq; break;
            }
            const maxQ = Math.floor(999 / d);
            if (maxQ < 101) continue;
            const h = rng(1, Math.min(9, Math.floor(maxQ / 100)));
            const o = rng(1, Math.min(9, maxQ - h * 100));
            const qq = h * 100 + o;                     // h, 0, o — the zero is the middle place
            dividend = qq * d; divisor = d; quotient = qq; break;
        }
        if (!divisor) { divisor = 3; quotient = 104; dividend = 312; }
        q.text = `${dividend.toLocaleString()} ÷ ${divisor} = ?`;
        q.ans = quotient;
        q.a = dividend; q.b = divisor; q.op = '÷';
        q.answerType = 'number';
        q.options = buildNumericOptions(quotient);
        q.skillLabel = 'Zero in the Quotient';
        const head = Math.floor(quotient / 100) * divisor;
        q.hint = `${divisor} does not go into the next digit, so write 0 above it — do not skip the place. `
            + `${divisor} goes into ${String(dividend)[0]}${String(dividend).length > 3 ? String(dividend)[1] : ''} `
            + `${Math.floor(quotient / Math.pow(10, String(quotient).length - 1))} times, then 0, then finish.`;
        q.visual = _wsCell(
            `<div style="display:inline-flex;align-items:flex-end;font-size:1.9rem;font-weight:700;">`
            + `<span style="padding-bottom:6px;">${divisor}</span>`
            + `<div style="border-top:2.25px solid ${_WS_INK};border-left:2.25px solid ${_WS_INK};`
            + `padding:6px 16px 6px 12px;border-top-left-radius:8px;">${dividend}</div></div>`
            + `<div style="margin-top:8px;font-size:1rem;">Write a digit in <b>every</b> place of the answer.</div>`);
        q.printFormat = 'long-division';
        q.notation = 'bracket';
        return true;
    }

    // DF-27. A `judge` cell built on M-D3: a remainder that is not finished because it is still
    // at least as big as the divisor. Half the items are already correct (P-10).
    if (skill === 'remainder_too_big') {
        // P12: a narrowed `constant` ("Divide by") picks the divisor; `forms` deals finished /
        // not finished; `band` bounds the number shared (the quotient shrinks to fit).
        const d = _p12Constant() || rng(3, 9);
        const _rtbBand = Number(_opt('band')) || 0;
        const _rtbMaxQ = _rtbBand ? Math.max(2, Math.min(12, Math.floor((_rtbBand - (d - 1)) / d))) : 12;
        const trueQ = rng(2, _rtbMaxQ);
        const r = rng(1, d - 1);
        const dividend = d * trueQ + r;
        const isRight = _p12Form(() => _dealRung(2)) === 0;
        const shownQ = isRight ? trueQ : trueQ - 1;
        const shownR = isRight ? r : r + d;             // still adds up, but is not finished
        q.text = `${dividend} ÷ ${d} = ${shownQ} R ${shownR}. Is the remainder finished? Write the finished answer.`;
        q.printText = 'Is the remainder finished? Write the finished answer.';   // the cell draws it
        q.ans = `${trueQ} R ${r}`;
        // P8b: one answer, two boxes (quotient, remainder), each filled on the key (AK-2).
        q.keyParts = [String(trueQ), String(r)];
        q.selfAnswering = true;
        q.acceptedAnswers = [`${trueQ} R ${r}`, `${trueQ}r${r}`, `${trueQ} r ${r}`, `${trueQ} remainder ${r}`];
        q.a = dividend; q.b = d; q.op = '÷';
        q.answerType = 'text';
        q.skillLabel = 'Is the Remainder Finished?';
        q.hint = isRight
            ? `${r} is smaller than ${d}, so no more groups can be made. It is finished.`
            : `${shownR} is bigger than ${d}, so one more group of ${d} still fits. ${shownQ} + 1 = ${trueQ}, and ${shownR} − ${d} = ${r}.`;
        // P8b: the cell overflowed its grid cell by 46 mm on paper (a rule box, the work, a
        // Correct / Fix it tick list, a "_ R _" line, a Say band AND the generic "Answer:" line),
        // which let the black grid show through (L-OVERFLOW, L-INK). It is one answer, so it
        // gets one slot: the finished answer, written into two boxes with the R between them.
        // A work that is already finished is copied; one that is not is fixed. The tick list
        // asked the same question a second time, and the key could fill only one of the two.
        const _rBox = (id) => `<span class="blank-box" data-ws-slot="${id}" data-ws-shape="box" data-mq-cell="1" style="display:inline-block;`
            + `width:14mm;height:12mm;border:1.5pt solid ${_WS_INK};border-radius:0;background:#fff;vertical-align:middle;`
            + `text-align:center;line-height:12mm;"></span>`;
        q.visual = _wsCell(
            _wsRuleBox('The remainder must be smaller than the divisor.')
            + `<div style="font-size:1.7rem;font-weight:700;">${dividend} ÷ ${d} = ${shownQ} R ${shownR}</div>`
            + `<div data-mq-join=" R " style="margin-top:10px;font-size:1.4rem;font-weight:700;display:inline-flex;align-items:center;gap:3mm;">`
            + `${dividend} ÷ ${d} = ${_rBox('rq')} R ${_rBox('rr')}</div>`);
        q.printFormat = 'remainder-judge';
        q.responseScope = 'judge';
        return true;
    }

    // DL-8. The check is quotient × divisor, on work printed in black and wrong half the time.
    // Miller & Milam found 42% of mistakes on a division item were multiplication or subtraction
    // errors inside the algorithm, which is why the check is a rung and not a footnote (M-D6).
    if (skill === 'div_check_by_multiplying') {
        const d = rng(2, 9);
        const maxQ = Math.max(12, Math.min(99, Math.floor(Math.max(100, Math.min(range, 999)) / d)));
        const trueQ = rng(11, maxQ);
        const dividend = d * trueQ;
        const isRight = _dealRung(2) === 0;
        const shown = isRight ? trueQ : (rng(0, 1) ? trueQ + 1 : Math.max(1, trueQ - 1));
        q.text = `Check by multiplying: ${dividend} ÷ ${d} = ${shown}. Write the correct answer.`;
        q.printText = 'Check by multiplying. Write the correct answer.';   // the cell draws it
        q.ans = trueQ;
        q.a = dividend; q.b = d; q.op = '÷';
        q.answerType = 'number';
        q.options = buildNumericOptions(trueQ);
        q.skillLabel = 'Check a Division by Multiplying';
        q.hint = `Multiply back: ${shown} × ${d} = ${shown * d}. `
            + (isRight ? `That is ${dividend}, so the work is correct.` : `That is not ${dividend}, so it is wrong — divide again.`);
        q.visual = _wsCell(
            `<div style="display:inline-flex;align-items:flex-end;font-size:1.7rem;font-weight:700;">`
            + `<span style="padding-bottom:6px;">${d}</span>`
            + `<div style="border-top:2.25px solid ${_WS_INK};border-left:2.25px solid ${_WS_INK};`
            + `padding:6px 16px 6px 12px;border-top-left-radius:8px;">${dividend}</div></div>`
            + `<div style="margin-top:4px;font-size:1.1rem;">answer written: <b>${shown}</b></div>`
            + `<div style="margin-top:8px;font-size:1.15rem;">${shown} × ${d} = ${_wsLine(4)}</div>`
            + _wsTickList(['Correct', 'Fix it']),
            `Say: ___ times ___ equals ___ .`);
        q.printFormat = 'div-check-judge';
        q.responseScope = 'judge';
        return true;
    }

    // DL-13 / DL-14. A crossed-out first attempt and a second one. The estimate is too big (the
    // product will not fit) or too small (what is left is still a whole group), and the pupil
    // writes the digit that works. Two-digit divisors, so the estimate is a real decision.
    if (skill === 'div_fix_estimate') {
        // P12: `tiles` is the largest divisor (19 or 29 for smaller numbers; 49 by default) and
        // `forms` deals the too-big / too-small first try.
        const divisor = rng(11, Number(_opt('tiles')) || 49);
        // 2 … 8, so the first attempt is 1 … 9 either way. An estimate is ONE DIGIT of the
        // quotient: "45 × 10 = 450" is not an estimate any pupil could write in the box.
        const quotient = rng(2, 8);
        const dividend = divisor * quotient;
        const tooBig = _p12Form(() => _dealRung(2)) === 0;
        const tried = tooBig ? quotient + 1 : quotient - 1;
        const prod = divisor * tried;
        q.text = tooBig
            ? `${dividend} ÷ ${divisor}. First try: ${divisor} × ${tried} = ${prod}. That is bigger than ${dividend}. Write the correct answer.`
            : `${dividend} ÷ ${divisor}. First try: ${divisor} × ${tried} = ${prod}, and ${dividend - prod} is left. `
              + `${dividend - prod} is still a whole group. Write the correct answer.`;
        // The cell already draws the dividend, the divisor and the failed first try.
        q.printText = 'The first try is wrong. Write the correct answer.';
        q.ans = quotient;
        q.a = dividend; q.b = divisor; q.op = '÷';
        q.answerType = 'number';
        q.options = buildNumericOptions(quotient);
        q.skillLabel = 'Fix the Estimate';
        q.hint = tooBig
            ? `${tried} is too big. Try one less: ${divisor} × ${quotient} = ${dividend}.`
            : `${tried} is too small — ${dividend - prod} left is another whole group. Try one more: ${divisor} × ${quotient} = ${dividend}.`;
        q.visual = _wsCell(
            `<div style="display:inline-flex;align-items:flex-end;font-size:1.7rem;font-weight:700;">`
            + `<span style="padding-bottom:6px;">${divisor}</span>`
            + `<div style="border-top:2.25px solid ${_WS_INK};border-left:2.25px solid ${_WS_INK};`
            + `padding:6px 16px 6px 12px;border-top-left-radius:8px;">${dividend}</div></div>`
            + `<div style="margin-top:8px;font-size:1.1rem;">First try: <span style="text-decoration:line-through;">${tried}</span>`
            + `&nbsp;&nbsp;${divisor} × ${tried} = ${prod}</div>`
            + `<div style="margin-top:6px;font-size:1.15rem;">Try again: ${_wsBox()}&nbsp;&nbsp;${divisor} × ${_wsLine(2)} = ${_wsLine(4)}</div>`,
            tooBig ? 'Say: ___ is too big. Try ___ .' : 'Say: ___ is left. That is too many. Try ___ .');
        q.printFormat = 'div-fix-estimate';
        return true;
    }

    // ============================================================== MIXED (+ − × ÷)
    // XD-7. The ONLY legal home for a missing-operator item in the whole family (§2.3), and its
    // response is a written sign in a circle — never four buttons (P-29). The sign is checked to
    // be the ONLY one that makes the sentence true, or the item has no answer.
    if (skill === 'which_sign') {
        const glyph = { '+': '+', '-': '−', '*': '×', '/': '÷' };
        const apply = (x, o, y) => o === '+' ? x + y : o === '-' ? x - y : o === '*' ? x * y : (y && x % y === 0 ? x / y : null);
        const ORDER = ['+', '-', '*', '/'];
        // EVERY number in the cell stays inside Max Number, not just the answer. A missing-sign
        // item is read three numbers at a time, so a dividend of 1,320 beside a band of 100
        // would be the item that is wrong, whatever the answer came to.
        const cap = Math.max(20, Math.min(range, 144));
        let a = 0, b = 0, c = 0, op = '+';
        for (let t = 0; t < 200; t++) {
            op = ORDER[_dealRung(4)];
            let X, Y;
            if (op === '*') { X = rng(2, 12); Y = rng(2, 12); }
            else if (op === '/') { Y = rng(2, 9); X = Y * rng(2, 12); }
            else { X = rng(2, cap); Y = rng(2, cap); if (op === '-' && X <= Y) continue; }
            const res = apply(X, op, Y);
            if (res === null || res < 1) continue;
            if (Math.max(X, Y, res) > cap) continue;    // nothing printed in the cell leaves the band
            const hits = ORDER.filter(o => apply(X, o, Y) === res);
            if (hits.length !== 1) continue;            // the sign must be the ONLY one that works
            a = X; b = Y; c = res; break;
        }
        if (!a) { a = 9; b = 4; c = 36; op = '*'; }
        q.text = `${a} ? ${b} = ${c}   Write + − × or ÷ in the circle.`;
        q.ans = glyph[op];
        q.acceptedAnswers = op === '*' ? ['×', 'x', 'X', '*'] : op === '/' ? ['÷', '/'] : op === '-' ? ['−', '-'] : ['+'];
        q.answerType = 'text';
        q.skillLabel = 'Which Sign Makes It True?';
        q.hint = `Try each sign. ${a} ${glyph[op]} ${b} = ${c}, and no other sign gives ${c}.`;
        q.visual = _wsCell(
            `<div style="display:inline-flex;align-items:center;gap:12px;font-size:2rem;font-weight:700;">`
            + `<span>${a}</span>${_wsCircle()}<span>${b}</span><span>=</span><span>${c}</span></div>`);
        q.cell = { template: 'equation', v: 1, payload: { a, b, op, result: c, unknown: 'op' } };
        q.printFormat = 'missing-operator';
        return true;
    }

    // XD-4. Missing addend or missing factor, in one cell, so the pupil has to read the sign
    // before reaching for a procedure (P-11). The two live together on purpose; that is the step.
    if (skill === 'missing_factor_or_addend') {
        const isAdd = _dealRung(2) === 0;
        let a, b, c;
        if (isAdd) {
            const band = Math.max(12, Math.min(range, 100));
            c = rng(Math.max(8, Math.floor(band / 4)), band);
            b = rng(2, c - 1);
            a = c - b;
        } else {
            a = rng(2, 12); b = rng(2, 12); c = a * b;
        }
        const opGly = isAdd ? '+' : '×';
        q.text = `___ ${opGly} ${b} = ${c}`;
        q.ans = a;
        q.answerType = 'number';
        q.options = buildNumericOptions(a);
        q.skillLabel = 'Missing Addend or Missing Factor?';
        q.hint = isAdd
            ? `The sign is +, so this is a missing ADDEND. ${c} − ${b} = ${a}.`
            : `The sign is ×, so this is a missing FACTOR. ${c} ÷ ${b} = ${a}.`;
        q.visual = _wsCell(
            _wsRuleBox('Read the sign first.')
            + `<div style="display:inline-flex;align-items:center;gap:12px;font-size:2rem;font-weight:700;">`
            + `${_wsBox()}<span>${opGly}</span><span>${b}</span><span>=</span><span>${c}</span></div>`
            + _wsTickList(['Add', 'Multiply']),
            `Say: ___ plus ___ , or ___ times ___ .`);
        q.cell = { template: 'equation', v: 1, payload: { a, b, op: isAdd ? '+' : '*', result: c, unknown: 'a' } };
        q.printFormat = 'missing-number';
        return true;
    }

    return false;
}

function buildColumnVisual(a, b, isAdd, uniqueId) {
    const ans = isAdd ? a + b : a - b;
    const opSymbol = isAdd ? '+' : '−';
    const aStr = a.toString();
    const bStr = b.toString();
    const displayLen = isAdd ? Math.max(aStr.length, bStr.length) : aStr.length;
    const answerLen = ans.toString().length;
    const paddedA = aStr.padStart(displayLen, ' ').split('');
    const paddedB = bStr.padStart(displayLen, ' ').split('');
    const carryBoxCount = displayLen;
    const borderColor = isAdd ? 'var(--accent-green)' : 'var(--accent-pink)';
    const carryBorderColor = isAdd ? 'var(--accent-cyan)' : 'var(--accent-orange)';
    const carryTextColor = isAdd ? 'var(--accent-cyan)' : 'var(--accent-orange)';
    const title = isAdd ? 'Column Addition' : 'Column Subtraction';
    const carryLabel = isAdd ? 'carrying' : 'borrowing';

    return `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.1rem;">
        <div style="font-weight:700;margin-bottom:10px;">${title}</div>
        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid ${borderColor};">
            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                ${Array(carryBoxCount).fill(0).map((_, i) => `<input type="text" maxlength="${isAdd ? '1' : '2'}" class="column-carry-input" data-col="${uniqueId}-carry-${i}" style="width:24px;height:18px;border:1px dashed ${carryBorderColor};border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:${isAdd ? '0.75' : '0.65'}rem;color:${carryTextColor};font-family:inherit;padding:0;" placeholder="">`).join('')}
            </div>
            <div style="padding-bottom:5px;">
                <span style="margin-right:12px;">&nbsp;</span>${paddedA.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
            </div>
            <div style="border-bottom:3px solid ${COLORS.axis};padding:5px 0;">
                <span style="margin-right:12px;">${opSymbol}</span>${paddedB.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
            </div>
            <div style="padding-top:8px;color:var(--accent-green);font-weight:700;">
                <span style="margin-right:12px;">&nbsp;</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueId}-ans-${i}" style="width:24px;height:24px;border:1px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
            </div>
        </div>
        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
            Type in boxes • Use top row for ${carryLabel}
        </div>
    </div>`;
}

// P8: NUMBER AGREEMENT after 1. The story templates print "{n} {plural}", so a count of one read
// "Ethan picks 1 flowers", "1 more kilometers", "1 days" — wrong English, on sheets written for
// pupils who are learning English (critic, baseline 2026-09-24; ws-content-audit `one-plural`).
// Applied once, to the wording every operations item prints, rather than in each template.
const _NOT_PLURAL = /^(is|was|has|does|plus|minus|less|times|this|its|us|as|yes|always|equals|makes|gives|goes|comes|means|shows|tells|bus|gas|glass|class|grass|dress|chess|lens)$/i;
const _IE_PLURALS = /^(cookies|pies|movies|brownies|ties|calories|smoothies|zombies|hoodies|goalies)$/i;
function _singularOf(word) {
    const w = String(word);
    if (_IE_PLURALS.test(w)) return w.slice(0, -1);
    if (/[^aeiou]ies$/i.test(w)) return w.slice(0, -3) + (w.slice(-3) === 'IES' ? 'Y' : 'y');
    if (/(xes|sses|shes|ches|zzes)$/i.test(w)) return w.slice(0, -2);
    if (/(shelves|halves|wolves|calves|leaves|loaves)$/i.test(w)) return w.slice(0, -3) + 'f';
    if (/(tomatoes|potatoes|heroes|echoes)$/i.test(w)) return w.slice(0, -2);
    return w.slice(0, -1);
}
export function agreeWithOne(text) {
    if (typeof text !== 'string' || text.indexOf('1 ') === -1) return text;
    return text.replace(/(^|[^\d,.\/])1 ((?:more |fewer |extra |other )?)([A-Za-z]+s)\b/g,
        (m, pre, adj, noun) => (_NOT_PLURAL.test(noun) ? m : `${pre}1 ${adj}${_singularOf(noun)}`));
}

// ---------------------------------------------------------------- the sheet-kit cells (P8c)
// The skills below draw ONE cell, through the sheet kit, on paper, on the key and on screen
// (SKILL_CELL_CONTRACT.md §10.1). `q.cell` is what print and the key read; `q.visual` is the
// same template rendered as its screen twin, whose writing places carry the markers
// screen-cell.js turns into inputs (data-mq-cell / data-mq-blank).

/** The screen twin of a kit template: the same drawing at the host's digit size. */
function _kitTwin(template, payload, { join = null } = {}) {
    let html = '';
    try {
        html = _kitRender({ cell: { template, v: 1, payload } }, { mode: 'screen', static: true, size: 'L', look: 'ican', state: 'blank' });
    } catch (e) { html = ''; }
    return join === null ? html : `<div data-mq-join="${join}">${html}</div>`;
}

/**
 * The screen twin of a stack: the kit's `.ws-stack` in a `.ws-sheet` scope, its answer strip
 * marked so each digit box becomes an input, typed digits composing the answer (join '').
 */
function _kitStackTwin(payload) {
    let html = _kitTwin('stack', payload);
    html = html.replace(/<span class="ab([^"]*)" data-ws-seg="([a-z]+)"><i([^>]*)><\/i><\/span>/g,
        (m, g, seg, rest) => `<span class="ab${g}" data-ws-seg="${seg}"><i${rest} data-mq-cell="1"></i></span>`);
    return `<div class="ws-sheet mq-kit" data-mq-join="">${html}</div>`;
}

/** Digits in the largest answer a basic-operations skill can reach at this Max Number (L-LEAK). */
function _bandDigits(skill, op, range) {
    if (skill === 'add_facts') return 2;
    if (skill === 'mult_facts' || op === '×') return 3;
    if (skill === 'div_facts' || op === '÷') return 2;
    if (op === '-' || op === '−') return String(Math.max(10, Math.min(range, 999))).length;
    return String(Math.max(10, Math.min(2 * range, 1998))).length;
}

/**
 * The + / − number-line items (nl_add, nl_sub, number_line_add, number_line_sub) on the kit's
 * `number-line` cell (owner request 2026-09-25): ONE HOP PER NUMBER, every whole number ticked and
 * labelled, the window only as long as the item needs (0-10, 0-20, else about 15 numbers around
 * the jump), and the answer box IN the equation. `unknown` 'result' | 'a' | 'b'.
 */
function _nlKitItem(q, { a, b, op, unknown = 'result', range = 20 }) {
    const end = op === '+' ? a + b : a - b;
    const lo0 = Math.min(a, end), hi0 = Math.max(a, end);
    let min = 0, max;
    if (hi0 <= 10 && range <= 10) max = 10;
    else if (hi0 <= 20) max = 20;
    else {
        min = Math.max(0, Math.floor((lo0 - 2) / 5) * 5);
        max = Math.max(min + 15, Math.ceil((hi0 + 1) / 5) * 5);
    }
    const payload = { min, max, start: a, add: b, op, unknown };
    const glyph = op === '+' ? '+' : '\u2212';
    q.text = unknown === 'a' ? `? ${glyph} ${b} = ${end}` : unknown === 'b' ? `${a} ${glyph} ? = ${end}` : `${a} ${glyph} ${b} = ?`;
    q.ans = unknown === 'a' ? a : unknown === 'b' ? b : end;
    q.a = a; q.b = b; q.op = op === '+' ? '+' : '-';
    if (unknown === 'a') q.missing = 'a'; else if (unknown === 'b') q.missing = 'b';
    q.answerType = 'number';
    q.options = buildNumericOptions(q.ans);
    q.cell = { template: 'number-line', v: 1, payload };
    q.visual = _kitTwin('number-line', payload);
    q.printText = unknown === 'result' ? 'Draw the jumps. Write the answer.' : 'Draw the jumps. Write the missing number.';
    q.printFormat = 'number-line-visual';
    q.startOnly = true;
    q.nlMax = max;
    return q;
}

const _KIT_FACT_SKILLS = new Set(['add_facts', 'mult_facts', 'div_facts', 'add', 'subtract']);
const _KIT_OP = { '+': '+', '-': '-', '−': '-', '×': '*', '÷': '/' };

/**
 * add, subtract and the three fact drills. A two-operand item of up to two digits each is a
 * FACT (the kit's `fact` template: the operator in its own track, the true minus, no regroup
 * boxes, one open answer zone sized to the section's widest answer), in the notation the
 * teacher chose; a wider column item is a `stack` with the regroup strip its page asks for.
 * Decimals and the fraction form of ÷ keep their legacy cells.
 */
function _applyKitFactCell(q, skill, range) {
    if (!_KIT_FACT_SKILLS.has(skill) || !q || q.cell) return;
    // P11: a fact drill is whole numbers whatever the Decimals setting, so its cell does not change with it.
    if (state.decimalPlaces > 0 && !/_facts$/.test(skill)) return;
    const op = _KIT_OP[q.op];
    const a = Number(q.a), b = Number(q.b);
    if (!op || !Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return;
    const digits = _bandDigits(skill, q.op, range);
    const small = String(a).length <= 2 && String(b).length <= 2;
    if (op === '/') {
        const not = q.notation;
        if (not === 'fraction') return;
        if (not === 'bracket' || q._variant === 'long') {
            const payload = { dividend: a, divisor: b, quotient: a / b, workRows: 0 };
            q.cell = { template: 'division', v: 1, payload };
            return;
        }
        q.cell = { template: 'fact', v: 1, payload: { a, b, op, notation: 'horiz', digits } };
        return;
    }
    const across = q.notation === 'across' || /horizontal/.test(String(q.printFormat || ''));
    // P11 (critic round 2): a stacked two-digit add / subtract item that REGROUPS is column work,
    // not a fact: it prints on the stack template with its carry (or borrow) strip, and the screen
    // shows the same stack, its digit boxes typed and composing the answer.
    // R3 (critic round 3): ONE template per section. Within 20 (the grade-1 band of `add` and
    // `subtract`, 1.OA.6) every item is a fact: the regroup strip on only the items that happened
    // to regroup made two typesettings on one page and pushed a column algorithm onto facts the
    // steps teach by counting on / back. Only a band past 20 is column work, on every item.
    const _band = Number((() => { try { return _opt('band'); } catch (e) { return 0; } })()) || range;
    if (small && !across && (skill === 'add' || skill === 'subtract') && _band > 20 && Math.max(a, b) >= 10
        && (op === '+' ? hasCarry(a, b) : hasBorrow(a, b))) {
        const payload = { operands: [a, b], op, heads: false, regroup: op === '+' ? 'add' : 'sub', ansDigits: digits };
        q.cell = { template: 'stack', v: 1, payload };
        q.visual = _kitStackTwin(payload);
        q.selfAnswering = true;
        q.printFormat = op === '+' ? 'column-add' : 'column-sub';
        q.notation = 'stacked';
        return;
    }
    if (small) {
        q.cell = { template: 'fact', v: 1, payload: { a, b, op, notation: across ? 'horiz' : 'vertical', digits } };
        if (!across && /column-(add|sub)/.test(String(q.printFormat || ''))) {
            // A basic fact on screen is the same vertical fact: no place heads, no regroup row
            // (screen-cell.js draws a `facts-column-visual` item with the kit's fact markup).
            const glyph = op === '-' ? '\u2212' : q.op;
            q.visual = `<div class="facts-column-visual" style="text-align:center;"><div style="display:inline-block;text-align:right;">`
                + `<div>${a}</div><div><span>${glyph}</span> ${b}</div></div></div>`;
            q.printFormat = op === '+' ? 'add-facts-vertical' : op === '-' ? 'sub-facts-vertical' : 'mult-facts-vertical';
            q.notation = 'stacked';
        }
        return;
    }
    if (op === '+' || op === '-') {
        const payload = { operands: [a, b], op, heads: false, ansDigits: digits };
        if (q.regroup === false) payload.regroup = false;
        q.cell = { template: 'stack', v: 1, payload };
    }
}

// ============================================================================================
// P11 · THE OPTION LAYER — the + − × ÷ options skill-options.js (P11_OPS_OPTIONS) declares
// ============================================================================================
// Every option there is read here, so the option panel never lies (an option a generator
// ignores is worse than no option). Four mechanisms, all driven by state.skillOptions and so
// identical on print (buildSheet -> generateQuestionFor) and on every screen host:
//   ROUTE   a ranged id (add_100_regroup, sub_wp_1k …) is one rung of a ladder; its `band` and
//           `regroup` pick the rung, and the rung's own branch generates it (_routeByOptions).
//   FILTER  `regroup` on add / subtract and `zeroPlace` (across zeros) keep an item only when it
//           has the property asked for; the item is regenerated otherwise (_optionAccepts).
//   READ    the fact band (`band` on the fact drills) and the digit sizes are read by the branch.
//   POST    the hint cue, the unknown position, pictures, the bar model and the column support
//           level are laid onto the finished item and its print cell (_applyOptionPost).
// The DEFAULT of every option is what the skill dealt before (R2), and each mechanism does
// nothing at its default, so an untouched skill draws exactly the same random numbers as before.
function _optDef(id) {
    try { return optionsFor(state.category, state.skill).find(o => o.id === id) || null; } catch (e) { return null; }
}
/** The value of option `id` for this item: the set's / caller's choice, else the default; undefined when not declared. */
function _opt(id) {
    const def = _optDef(id);
    if (!def) return undefined;
    const o = state.skillOptions;
    const v = o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, id) ? o[id] : undefined;
    return v === undefined ? def.default : v;
}
// ---- P12 OPTIONS (skill-options.js P12 block: the × / ÷ ladder steps and the number families) ----
// Same rule as the layer above: each helper returns "not chosen" at the option's default, so the
// untouched skill takes its old branch and draws the same random numbers as before.
/** A SET option the teacher CHANGED from its default: the ticked values, else null (untouched,
 *  or none ticked, which means "no restriction"). */
function _p12Narrowed(id) {
    const def = _optDef(id);
    if (!def || def.type !== 'set') return null;
    const legal = def.values.map(x => x.v);
    let t = _opt(id);
    if (typeof t === 'number' || typeof t === 'string') t = [t];
    t = Array.isArray(t) ? legal.filter(v => t.includes(v)) : [];
    const dflt = legal.filter(v => (def.default || []).includes(v));
    if (!t.length || (t.length === dflt.length && t.every(v => dflt.includes(v)))) return null;
    return t;
}
/** Which item form to draw: `forms` narrowed deals the ticked forms round-robin, else `dflt()`. */
function _p12Form(dflt) {
    const f = _p12Narrowed('forms');
    return f ? f[_dealRung(f.length)] : dflt();
}
/**
 * The number-family band. The support level routes these skills to a retired branch id
 * (skill-aliases.js SKILL_VARIANTS), so `_opt` cannot see the merged skill's definition from
 * inside the branch; the value is read straight off the item's options instead.
 */
function _p12FamilyBand(merged, dflt, legal) {
    const o = state.skillOptions;
    const v = o && typeof o === 'object' ? Number(o.band) : NaN;
    return legal.includes(v) ? v : dflt;
}
/** A divisor / factor from a narrowed `constant` ("Divide by"), else null. */
function _p12Constant() {
    return _p12Narrowed('constant') ? factConstantFor() : null;
}

const _BAND_CODE = { 10: '10', 20: '20', 50: '50', 100: '100', 1000: '1k', 10000: '10k', 100000: '100k', 1000000: '1m' };
const _RANGED_RE = /^(add|sub)_(10|20|50|100|1k|10k|100k|1m)_(no_regroup|regroup|mixed)$/;
const _WP_RE = /^(add|sub)_wp_(10|20|50|100|1k|10k|100k|1m)$/;

/**
 * The band code a ranged id may route to: the chosen band, but never above the id's own ("within
 * N" is the id's promise, OPTIONS-CRITIC-R2 §5 #1). The panel offers only bands at or below it;
 * this clamps a raw value that reached the generator unnormalised (an old saved set).
 */
function _bandCodeAtMost(ownCode, get = _opt) {
    const b = Number(get('band'));
    const code = _BAND_CODE[b];
    return code && b <= RANGE_MAP[ownCode] ? code : ownCode;
}

function _routeByOptions(skill, get = _opt) {
    let m = String(skill).match(_RANGED_RE);
    if (m) {
        const code = _bandCodeAtMost(m[2], get);
        // `regroup` is declared only on the _mixed ids above 10 (skill-options.js): elsewhere _opt
        // answers undefined and the id's own regrouping stands, whatever an old code carried.
        const rg = get('regroup');
        let rgId = rg === 'none' ? 'no_regroup' : rg === 'always' ? 'regroup' : rg === 'mixed' ? 'mixed' : m[3];
        // Band 10 reached from a higher id never lands on the bridging rung (answers 11 to 18):
        // within 10 nothing regroups. Only add_10_regroup / sub_10_regroup ARE that rung.
        if (code === '10' && m[2] !== '10' && rgId !== 'no_regroup') rgId = 'mixed';
        return `${m[1]}_${code}_${rgId}`;
    }
    m = String(skill).match(_WP_RE);
    if (m) {
        const code = _bandCodeAtMost(m[2], get);
        // add_wp_10 is the K picture story, generated in gen-counting.js: never routed into here.
        if (m[1] === 'add' && code === '10') return skill;
        return `${m[1]}_wp_${code}`;
    }
    return skill;
}

/**
 * The rung a ranged + / − id really deals with these options (pure: no state), e.g.
 * add_100_regroup with band 50 -> add_50_regroup. The sheet header names THAT rung, so a page
 * whose band is below the id's own is titled by what it prints (OPTIONS-CRITIC-R2 §5 #15).
 * Any other skill comes back unchanged.
 */
export function opsRoutedSkill(categoryId, skillId, opts) {
    const id = String(skillId || '');
    if (!_RANGED_RE.test(id) && !_WP_RE.test(id.replace(/_plain$/, ''))) return id;
    let declared, n;
    try {
        declared = new Set(optionsFor(categoryId, id).map(o => o.id));
        n = normalizeOptions(categoryId, id, opts || {});
    } catch (e) { return id; }
    const get = (k) => (declared.has(k) ? n[k] : undefined);
    const plain = /_plain$/.test(id);
    const routed = _routeByOptions(plain ? id.replace(/_plain$/, '') : id, get);
    if (!plain) return routed;
    return routed !== id.replace(/_plain$/, '') ? `${routed}_plain` : id;
}

function _optionAccepts(q, selected, routed) {
    if (!q || !Number.isInteger(q.a) || !Number.isInteger(q.b) || state.decimalPlaces > 0) return true;
    const isAdd = q.op === '+';
    if (selected === 'add' || selected === 'subtract') {
        const rg = _opt('regroup');
        const has = isAdd ? hasCarry(q.a, q.b) : hasBorrow(q.a, q.b);
        // The band bounds the ANSWER: the sum for +, the number taken from for −.
        const band = Number(_opt('band'));
        if (band && (isAdd ? q.a + q.b : q.a) > band) return false;
        if (rg === 'none' && has) return false;
        if (rg === 'always' && !has) return false;
    }
    const m = String(routed).match(_RANGED_RE);
    // Across zeros needs a borrow: on a no-regrouping rung it is not asked (the panel hides it).
    if (m && m[1] === 'sub' && RANGE_MAP[m[2]] >= 1000 && m[3] !== 'no_regroup') {
        const z = _opt('zeroPlace');
        if (z === 'always' && !_subHasAcrossZero(q.a, q.b)) return false;
        if (z === 'none' && _subHasAcrossZero(q.a, q.b)) return false;
    }
    return true;
}

/** The item index a page deals by (kept items), or the live cursor. */
const _optAt = () => (Number.isFinite(state.itemIndex) ? state.itemIndex : _constantCursor);

/** A part-part-whole bar under a story (the `support: bar` hint). + : whole unknown; − : a part unknown. */
function _barModelSVG(a, b, isAdd) {
    const whole = isAdd ? a + b : a;
    const partA = isAdd ? a : b, partB = isAdd ? b : a - b;
    const W = 300, x0 = 10, pw = W - 20;
    const wA = Math.max(40, Math.min(pw - 40, Math.round(pw * partA / Math.max(1, whole))));
    const t = (x, y, s) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Andika, sans-serif" font-size="15" fill="#000">${s}</text>`;
    const box = (x, y, w, h, dash) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-width="1.5"${dash ? ' stroke-dasharray="5 4"' : ''}/>`;
    const fmt = (n) => Number(n).toLocaleString('en-US');
    const body = box(x0, 6, pw, 26, !isAdd ? false : true) + t(x0 + pw / 2, 24, isAdd ? '?' : fmt(whole))
        + box(x0, 40, wA, 26) + t(x0 + wA / 2, 58, fmt(partA))
        + box(x0 + wA, 40, pw - wA, 26, !isAdd) + t(x0 + wA + (pw - wA) / 2, 58, isAdd ? fmt(partB) : '?');
    return `<div class="mq-bar-model" style="margin-top:10px;text-align:center;"><svg viewBox="0 0 ${W} 72" width="${W}" height="72" `
        + `style="max-width:100%;" role="img" aria-label="bar model">${body}</svg></div>`;
}

function _applyOptionPost(q, selected, routed) {
    if (!q) return;
    const isAdd = q.op === '+';
    const isSubOp = q.op === '-' || q.op === '−';
    const ints = Number.isInteger(q.a) && Number.isInteger(q.b) && !(state.decimalPlaces > 0);

    // --- the unknown position on add / subtract --------------------------------------------
    if ((selected === 'add' || selected === 'subtract') && ints && (isAdd || isSubOp)) {
        let u = _opt('unknown');
        if (u === 'mixed') u = ['answer', 'first', 'second'][((_optAt() % 3) + 3) % 3];
        if (u === 'first' || u === 'second') {
            const a = q.a, b = q.b, res = isAdd ? a + b : a - b, glyph = isAdd ? '+' : '−';
            q.text = u === 'first' ? `? ${glyph} ${b} = ${res}` : `${a} ${glyph} ? = ${res}`;
            q.ans = u === 'first' ? a : b;
            q.missing = u === 'first' ? 'a' : 'b';
            q.notation = 'across';
            q.answerType = 'number';
            q.options = buildNumericOptions(q.ans);
            q.hint = isAdd
                ? (u === 'first' ? `What number and ${b} make ${res}? Count on from ${b} to ${res}.` : `Start at ${a}. How many more to reach ${res}?`)
                : (u === 'first' ? `Add back what was taken: ${res} + ${b}.` : `How many do you take from ${a} to leave ${res}? Count back.`);
            q.printFormat = 'missing-add-sub';
            q.visual = '';
            const payload = { a, b, op: isAdd ? '+' : '-', result: res, unknown: u === 'first' ? 'a' : 'b', digits: String(q.ans).length };
            q.cell = { template: 'equation', v: 1, payload };
            q.printText = 'Write the missing number.';
        }
    }

    // --- the hint cue under a fact: NOT drawn here any more (S2, design/SUPPORTS.md §S2) --------
    // `support` is the unified set of supports, drawn at RENDER time round the problem the
    // generator made (sheet/support-draw.js, via the allocator in print-sheet.js and the screen
    // hosts). Baking a cue into `q.cell.payload.cue` and `q.visual` here drew it twice and turned a
    // cued fact into a legacy cell on screen; the generated item is now the same with or without a
    // support, so the pupil page, the key and the screen agree.

    // --- pictures off (word problems, the ≤ 5 picture sums) ---------------------------------
    if (_opt('pictures') === false) {
        q.visual = '';
        if (q.cell && q.cell.template === 'wordpic') q.cell = { ...q.cell, payload: { ...q.cell.payload, pictures: false } };
        // A story prints as the plain story with a work space; a sum (add_three) prints its sentence.
        if (/^word/.test(String(q.printFormat || '')) || _WP_RE.test(routed) || /word_problems/.test(selected)) q.printFormat = 'word-plain';
        q.picturesOff = true;
    }

    // --- the bar model under a story ---------------------------------------------------------
    if (_WP_RE.test(routed) && _opt('support') === 'bar' && Number.isFinite(q.a) && Number.isFinite(q.b)) {
        q.visual = `${q.visual || ''}${_barModelSVG(q.a, q.b, isAdd)}`;
        q.barModel = true;
        if (q.printFormat === 'word-plain') q.printFormat = routed.startsWith('add') ? 'word-add' : 'word-sub';
    }

    // --- the column support level (ranged ids from 50 up) ------------------------------------
    const rm = String(routed).match(_RANGED_RE);
    if (rm && RANGE_MAP[rm[2]] >= 50 && Number.isInteger(q.a) && Number.isInteger(q.b) && (isAdd || isSubOp) && _optDef('level')) {
        const lvl = supportLevelFor(1);
        const maxVal = RANGE_MAP[rm[2]];
        const payload = { operands: [q.a, q.b], op: isAdd ? '+' : '-', ansDigits: String(isAdd ? maxVal : maxVal - 1).length };
        if (lvl >= 2) payload.heads = true;
        if (lvl >= 3) payload.answer = 'traced';
        q.cell = { template: 'stack', v: 1, payload };
        q.supportLevel = lvl;
        if (lvl >= 2) {
            const PLACES = ['O', 'T', 'H', 'Th', 'TTh', 'HTh', 'M'];
            const heads = PLACES.slice(0, String(Math.max(q.a, q.b, isAdd ? q.a + q.b : q.a)).length).reverse().join('  ');
            const lead = lvl >= 3
                ? `<div class="mq-worked" style="color:#949494;font-weight:700;margin-bottom:6px;">Worked: ${q.a.toLocaleString()} ${isAdd ? '+' : '−'} ${q.b.toLocaleString()} = ${(isAdd ? q.a + q.b : q.a - q.b).toLocaleString()}</div>`
                : '';
            q.visual = `<div class="mq-col-support" style="text-align:center;">${lead}`
                + `<div class="mq-heads" style="font-weight:700;letter-spacing:0.2em;">${heads}</div>${q.visual || ''}</div>`;
        }
    }
}

/**
 * × and ÷ sized by the teacher (`tiles`: 11 = 1-digit × 1-digit, 21, 31, 22; ÷ 21, 31, 41, 32)
 * and ÷ remainders (`regroup`). Returns true when it drew the item; false leaves the legacy
 * branch to do it (the default, "Set by Max Number", with no remainders).
 */
function _generateSizedMultDiv(q, skill, helpers) {
    const { rng } = helpers;
    if (skill === 'multiply') {
        const d = Number(_opt('tiles'));
        if (!d) return false;
        const lo = (n) => (n === 1 ? 2 : 10 ** (n - 1)), hi = (n) => 10 ** n - 1;
        const da = Math.floor(d / 10), db = d % 10;
        const a = rng(lo(da), hi(da)), b = rng(lo(db), hi(db));
        const ans = a * b;
        q.a = a; q.b = b; q.op = '×'; q.ans = ans;
        q.text = `${a} × ${b} = ?`;
        q.answerType = 'number';
        q.options = [];
        q.hint = db >= 2 ? `Multiply ${a} × ${b % 10} first, then ${a} × ${Math.floor(b / 10)}0, then add the two.` : `Multiply each digit of ${a} by ${b}. Carry when needed.`;
        if (d === 11) {
            const not = notationFor('×');
            q.notation = not;
            q.cell = { template: 'fact', v: 1, payload: { a, b, op: '*', notation: not === 'across' ? 'horiz' : 'vertical', digits: 2 } };
            q.printFormat = not === 'across' ? 'mult-facts-horizontal' : 'mult-facts-vertical';
            q.visual = not === 'across' ? '' : `<div class="facts-column-visual" style="text-align:center;"><div style="display:inline-block;text-align:right;"><div>${a}</div><div><span>×</span> ${b}</div></div></div>`;
        } else {
            q.notation = 'stacked';
            if (notationFor('×') === 'across') q.notationClampedFrom = 'across';
            const payload = { operands: [a, b], op: '*', ansDigits: String(hi(da) * hi(db)).length };
            q.visual = _kitStackTwin(payload);
            // 2-digit × 2-digit needs its partial-product rows on paper: the column-mult cell.
            if (db >= 2) q.printFormat = 'column-mult';
            else { q.cell = { template: 'stack', v: 1, payload }; q.printFormat = 'column-mult'; }
        }
        q.skillLabel = 'Multiply';
        return true;
    }
    if (skill === 'divide') {
        const d = Number(_opt('tiles'));
        const rem = _opt('regroup');
        if (!d && (!rem || rem === 'none')) return false;
        const nDividend = d ? Math.floor(d / 10) : 2, nDivisor = d ? d % 10 : 1;
        const divisor = nDivisor === 1 ? rng(2, 9) : rng(11, 99);
        const withR = rem === 'always' || (rem === 'mixed' && _optAt() % 2 === 1);
        const lo = 10 ** (nDividend - 1), hi = 10 ** nDividend - 1;
        let dividend = lo, quotient = 1, r = 0;
        for (let t = 0; t < 80; t++) {
            quotient = rng(Math.max(2, Math.ceil(lo / divisor)), Math.max(2, Math.floor(hi / divisor)));
            r = withR ? rng(1, divisor - 1) : 0;
            dividend = divisor * quotient + r;
            if (dividend >= lo && dividend <= hi) break;
        }
        q.a = dividend; q.b = divisor; q.op = '÷';
        q.text = `${dividend.toLocaleString()} ÷ ${divisor} = ?`;
        q.notation = 'bracket';
        if (notationFor('÷') !== 'bracket') q.notationClampedFrom = notationFor('÷');
        const payload = { dividend, divisor, quotient, workRows: 4 };
        if (withR) {
            payload.rbox = true;
            q.ans = `${quotient} R ${r}`;
            q.quotientRemainder = { quotient, remainder: r };
            q.acceptedAnswers = [`${quotient} R ${r}`, `${quotient}R${r}`, `${quotient} R${r}`, `${quotient}R ${r}`, `${quotient} r ${r}`, `${quotient}r${r}`, `${quotient} remainder ${r}`];
            q.answerType = 'text';
            // On screen the answer is typed as "q R r" into one box (the digit strip cannot hold it).
            q.visual = '';
        } else {
            q.ans = quotient;
            q.answerType = 'number';
            q.visual = _kitTwin('division', payload, { join: '' });
        }
        q.cell = { template: 'division', v: 1, payload };
        q.printFormat = 'long-div-kit';
        q.options = [];
        q.hint = withR
            ? `How many whole groups of ${divisor} are in ${dividend}? What is left over is the remainder: less than ${divisor}.`
            : `Divide, multiply, subtract, bring down. ${divisor} × ${quotient} = ${dividend}.`;
        q.skillLabel = 'Divide';
        return true;
    }
    return false;
}

export function generateOperationsQuestion(q, mappedSkill, helpers) {
    // One deal per question: advance the notation cursor and clear the per-item cache, so the
    // several call sites below that ask for this item's notation all get the same answer.
    _beginNotationItem();
    // P11: the option layer. `selected` is the skill the teacher configured; `routed` the rung
    // its band / regrouping picks (the same id when those are at their defaults).
    const selected = mappedSkill;
    mappedSkill = _routeByOptions(mappedSkill);
    const _init = Object.assign({}, q);
    // Basic + and −: the band (10 / 20) caps the numbers dealt as well, so the sum filter rarely retries.
    const _selBand = (selected === 'add' || selected === 'subtract') ? Number(_opt('band')) : 0;
    const _genHelpers = _selBand ? { ...helpers, range: Math.min(Number(helpers.range) || _selBand, _selBand) } : helpers;
    let result;
    // Count by 1-12, the multiplication chart and the x / ÷ number lines (gen-mult-patterns.js,
    // owner requests of 2026-09-25): one generator reads every option those skills declare.
    if (_MP_SKILLS.has(mappedSkill)) {
        if (mappedSkill === 'count_by_tables') genCountByTables(q);
        else if (mappedSkill === 'nl_mult' || mappedSkill === 'nl_div') genHopLine(q, mappedSkill);
        else genMultChart(q, mappedSkill);
        if (q && typeof q.text === 'string') q.text = agreeWithOne(q.text);
        return q;
    }
    if (_generateSizedMultDiv(q, selected, helpers)) result = q;
    else {
        for (let t = 0; t < 60; t++) {
            if (t) { for (const k of Object.keys(q)) delete q[k]; Object.assign(q, _init); }
            result = _generateOperationsQuestionInner(q, mappedSkill, _genHelpers);
            if (_optionAccepts(q, selected, mappedSkill)) break;
        }
    }
    try { _applyKitFactCell(q, mappedSkill, Number((_genHelpers && _genHelpers.range) || state.range || 100)); } catch (e) { /* the legacy cell stays */ }
    try { _applyOptionPost(q, selected, mappedSkill); } catch (e) { /* the item stands as generated */ }
    if (q && typeof q.text === 'string') q.text = agreeWithOne(q.text);
    if (q && typeof q.printText === 'string') q.printText = agreeWithOne(q.printText);
    // Auto-add vertical-column instruction + SVG diagram to horizontal add/sub
    // problems that don't already have a visual. Skips add_facts / sub_facts.
    if (_isVerticalColumnEligibleSkill(mappedSkill)) {
        _applyVerticalColumnInstruction(q, mappedSkill);
    }
    return result;
}

function _generateOperationsQuestionInner(q, mappedSkill, helpers) {
    const { rng, range: rawRange, applyDecimals, ensureTables } = helpers;

    // ===== PER-GRADE RANGE CLAMP (worksheet-feedback §8.1) =====
    // Cap state.range against the skill's grade-appropriate maximum so a Grade 3
    // worksheet doesn't produce 7-digit problems when the user has range=10000.
    const _skillGrade = getSkillGrade(mappedSkill);
    const _gradeCap = maxOperandForGrade(_skillGrade);
    const range = Math.min(rawRange, _gradeCap);

            // ===== THE APPENDED LADDER STEPS (owner ruling R1) =====
            // First, so no earlier pattern match can intercept one of the nineteen ids and deal
            // it the generic per-category item — which is exactly what they did before this
            // block existed. It answers false for every other skill and costs one Set lookup.
            if (LADDER_V2_SKILLS.has(mappedSkill) && _generateLadderV2(q, mappedSkill, helpers, range)) {
                return;
            }

            // ========================================
            // BUILD EXPRESSION (drag tiles): build_expr_addsub
            // Student reads a word problem and drags number/operator tiles
            // into 5 slots to construct: A op B = C
            // ========================================
            if (mappedSkill === 'build_expr_addsub') {
                const maxNum = Math.max(10, Math.min(range, 100));
                const op = pick(['+', '-']);
                const items = [
                    { plural: 'apples', verb_have: 'had', verb_more: 'picked', verb_less: 'gave away' },
                    { plural: 'stickers', verb_have: 'had', verb_more: 'earned', verb_less: 'used' },
                    { plural: 'marbles', verb_have: 'had', verb_more: 'won', verb_less: 'lost' },
                    { plural: 'cookies', verb_have: 'baked', verb_more: 'baked', verb_less: 'ate' },
                    { plural: 'books', verb_have: 'had', verb_more: 'borrowed', verb_less: 'returned' },
                    { plural: 'crayons', verb_have: 'had', verb_more: 'found', verb_less: 'gave away' },
                    { plural: 'pencils', verb_have: 'had', verb_more: 'bought', verb_less: 'broke' },
                    { plural: 'shells', verb_have: 'collected', verb_more: 'found', verb_less: 'lost' },
                ];
                const name = pickName();
                const item = pick(items);
                let a, b, c;
                if (op === '+') {
                    a = rng(2, Math.max(3, Math.floor(maxNum * 0.6)));
                    b = rng(2, Math.max(3, Math.floor(maxNum * 0.4)));
                    c = a + b;
                    q.text = `${name} ${item.verb_have} ${a} ${item.plural}. Then ${name} ${item.verb_more} ${b} more ${item.plural}. How many ${item.plural} does ${name} have now? Build the expression.`;
                    q.hint = `"More" means add. The expression is ${a} + ${b} = ${c}.`;
                } else {
                    // Ensure a > b for clean subtraction at this grade level.
                    a = rng(5, Math.max(8, maxNum));
                    b = rng(2, Math.max(2, a - 1));
                    c = a - b;
                    q.text = `${name} ${item.verb_have} ${a} ${item.plural}. Then ${name} ${item.verb_less} ${b} ${item.plural}. How many ${item.plural} does ${name} have now? Build the expression.`;
                    q.hint = `"Gave away/used" means subtract. The expression is ${a} − ${b} = ${c}.`;
                }
                const target = [String(a), op, String(b), '=', String(c)];
                // Build palette: target tokens + 2-3 number distractors + the
                // unused operator (so students must pick the correct symbol).
                const distractors = new Set();
                const altOp = op === '+' ? '-' : '+';
                distractors.add(altOp);
                while (distractors.size < 4) {
                    const d = rng(1, Math.max(10, maxNum));
                    if (d !== a && d !== b && d !== c) distractors.add(String(d));
                }
                const paletteArr = shuffle([...target, ...distractors]);
                q.targetExpression = target;
                q.palette = paletteArr;
                q.ans = target.join(' ');  // Stored as a readable string for solution display
                q.a = a; q.b = b; q.op = op;
                q.answerType = 'build-expr';
                q.printFormat = 'build-expr';
                q.skillLabel = 'Build Expression +/−';
                return q;
            }

            // ========================================
            // NUMBER LINE SKILLS (nl_add, nl_sub, nl_mult, nl_div)
            // ========================================
            if (mappedSkill === 'nl_add') {
                // Owner request (2026-09-25): the kit's number line, one hop per number, so the
                // jump is at most 10 (a count of humps) and the line labels every number.
                const maxSum = Math.max(10, Math.min(range, 100));
                const b = rng(2, Math.min(10, maxSum - 1));
                const a = rng(1, Math.max(1, maxSum - b));
                // LRU rotation across 3 sub-types (was Math.random() chain).
                // P11: "What is missing" fixes the sub-type; Mixed (the default) keeps the weighted rotation.
                const _nlU = { answer: 'find_sum', first: 'find_start', second: 'find_addend' }[_opt('unknown')];
                const roll = _nlU || ((typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('nl_add', ["find_sum","find_addend","find_start"], [4,1,1])
                    : (Math.random() < 0.5 ? 'find_sum' : (Math.random() < 0.5 ? 'find_addend' : 'find_start')));
                q._variant = roll;
                _nlKitItem(q, { a, b, op: '+', unknown: roll === 'find_addend' ? 'b' : roll === 'find_start' ? 'a' : 'result', range });
                q.hint = roll === 'find_sum' ? `Start at ${a}. Hop ${b} times, one number each hop. Where do you land?`
                    : roll === 'find_addend' ? `Start at ${a}. Hop one number at a time to ${a + b}. Count the hops.`
                        : `Hop back ${b} times from ${a + b}. Where did it start?`;
                q.skillLabel = 'Addition Number Line';
                return q;
            }

            if (mappedSkill === 'nl_sub') {
                const maxVal = Math.max(10, Math.min(range, 100));
                const a = rng(3, maxVal);
                const b = rng(1, Math.min(10, a - 1));
                const diff = a - b;
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const _nlU = { answer: 'find_diff', first: 'find_min', second: 'find_sub' }[_opt('unknown')];
                const roll = _nlU || ((typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('nl_sub', ["find_diff","find_sub","find_min"], [4,1,1])
                    : (Math.random() < 0.5 ? 'find_diff' : (Math.random() < 0.5 ? 'find_sub' : 'find_min')));
                q._variant = roll;
                _nlKitItem(q, { a, b, op: '-', unknown: roll === 'find_sub' ? 'b' : roll === 'find_min' ? 'a' : 'result', range });
                q.hint = roll === 'find_diff' ? `Start at ${a}. Hop back ${b} times, one number each hop. Where do you land?`
                    : roll === 'find_sub' ? `Start at ${a}. Hop back one number at a time to ${diff}. Count the hops.`
                        : `Hop forward ${b} times from ${diff}. That is where it started.`;
                q.skillLabel = 'Subtraction Number Line';
                return q;
            }

            // nl_mult / nl_div: see gen-mult-patterns.js genHopLine (dispatched at the top of
            // generateOperationsQuestion, with count_by_tables and the multiplication chart).

            // ========================================
            // NUMBER LINE ADD / SUB (B&W print scaffold)
            // ========================================
            if (mappedSkill === 'number_line_add') {
                // P8: START-POINT-ONLY number line: only the start is marked; the pupil draws the
                // hops (one per number) and writes where they land. One scale per page - 0-10
                // below Max Number 20, else 0-20, every whole number labelled in Andika. "Within
                // the line" bounds the SUM, never the addends.
                const nlMax = range <= 10 ? 10 : 20;
                const a = rng(1, nlMax - 2);
                const b = rng(1, Math.min(10, nlMax - a));
                _nlKitItem(q, { a, b, op: '+', unknown: 'result', range: nlMax });
                q.text = `Use the number line: ${a} + ${b} = ?`;
                q.hint = `Start at ${a} on the number line. Jump forward ${b} times. Where do you land?`;
                q.skillLabel = 'Number Line Addition';
                return;
            }

            if (mappedSkill === 'number_line_sub') {
                // Owner request (2026-09-25): the kit's number line (was a coloured legacy SVG
                // labelled by 5s with its hops drawn): 0-10 or 0-20, every number labelled, only
                // the start marked, the pupil hops back one number at a time.
                const nlMax = range <= 10 ? 10 : 20;
                const a = rng(Math.min(5, nlMax - 1), nlMax);
                const b = rng(1, Math.min(10, a - 1));
                _nlKitItem(q, { a, b, op: '-', unknown: 'result', range: nlMax });
                q.text = `Use the number line: ${a} \u2212 ${b} = ?`;
                q.hint = `Start at ${a} on the number line. Jump backward ${b} times. Where do you land?`;
                q.skillLabel = 'Number Line Subtraction';
                return;
            }

            // ========================================
            // DOT ARRAY MULTIPLICATION (B&W print scaffold)
            // ========================================
            if (mappedSkill === 'dot_array_mult') {
                // P12: `band` 25 keeps rows and columns to 5 (the default, 100, runs them to 10);
                // `support` 'none' drops the "rows × columns" caption so the pupil counts both.
                const _daMax = Number(_opt('band')) === 25 ? 5 : 10;
                const _daBare = _opt('support') === 'none';
                const rows = rng(2, Math.min(_daMax, range));
                const cols = rng(2, Math.min(_daMax, range));
                const product = rows * cols;
                // Bumped from r=4/spacing=20 \u2014 at the previous size the dots
                // were tiny pinpricks in the visual-left layout's wide left
                // column. SVG scales to column width, so geometry units are
                // logical (not pixels).
                const dotR = 12;
                const spacing = 42;
                const padX = 28;
                const padY = 28;
                const svgW = padX * 2 + (cols - 1) * spacing + dotR * 2;
                const svgH = padY * 2 + (rows - 1) * spacing + dotR * 2;

                let dots = '';
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const cx = padX + dotR + c * spacing;
                        const cy = padY + dotR + r * spacing;
                        dots += `<circle cx="${cx}" cy="${cy}" r="${dotR}" fill="${COLORS.primary}"/>`;
                    }
                }

                q.text = `Count the array: ${rows} rows \u00d7 ${cols} columns = ?`;
                q.ans = product;
                q.a = rows; q.b = cols;
                q.answerType = 'number';
                q.hint = `Count ${rows} rows with ${cols} dots in each row. ${rows} \u00d7 ${cols} = ?`;
                q.options = buildNumericOptions(product);
                // Tag common array-multiplication misconceptions.
                if (typeof window !== 'undefined' && typeof window.tagDistractor === 'function') {
                    window.tagDistractor(q, String(rows + cols), "Looks like you ADDED the rows and columns. To find the total in an array, MULTIPLY rows \u00d7 columns.");
                    window.tagDistractor(q, String((rows + 1) * cols), "Off by one row \u2014 re-count how many ROWS the array has.");
                    window.tagDistractor(q, String(rows * (cols + 1)), "Off by one column \u2014 re-count how many DOTS are in each row.");
                    window.tagDistractor(q, String(rows * (cols - 1)), "Off by one column \u2014 re-count how many DOTS are in each row.");
                }
                q.visual = `<div style="text-align:center;">
                    <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:100%;height:auto;" font-family='${FONTS.sans}'>
                        ${dots}
                    </svg>
                    <div style="margin-top:6px;font-size:0.95rem;color:${COLORS.text};font-weight:600;">${rows} rows \u00d7 ${cols} columns</div>
                </div>`;
                if (_daBare) {
                    // P12 support 'none': the pupil counts the rows and the columns himself.
                    q.text = 'How many dots are in the array? Write the multiplication.';
                    q.hint = 'Count the rows, then the dots in one row. Multiply rows by dots in a row.';
                    q.visual = q.visual.replace(/<div style="margin-top:6px;[^>]*>[^<]*<\/div>/, '');
                }
                q.printFormat = 'dot-array-visual';
                q.skillLabel = 'Dot Array Multiplication';
                return;
            }

            // ========================================
            // EXPLICIT ADD/SUB BY RANGE & REGROUPING
            // ========================================
            const regroupMatch = mappedSkill.match(/^(add|sub)_(10|20|50|100|1k|10k|100k|1m)_(no_regroup|regroup|mixed)$/);
            if (regroupMatch) {
                const [, op, rangeCode, regroupType] = regroupMatch;
                const maxVal = RANGE_MAP[rangeCode];
                const isAdd = op === 'add';

                // Ruling 2: within 10 WITH regrouping is impossible as named, so that rung is
                // the bridging-ten rung instead — single digits either side of the ten.
                const isBridgingTen = maxVal === 10 && regroupType === 'regroup';

                let a, b;
                if (isBridgingTen) {
                    [a, b] = isAdd ? _bridgingTenAddPair(rng) : _bridgingTenSubPair(rng);
                } else if (isAdd) {
                    [a, b] = generateAddPair(maxVal, regroupType, rng);
                } else {
                    [a, b] = generateSubPair(maxVal, regroupType, rng);
                }

                const ans = isAdd ? a + b : a - b;
                const opSymbol = isAdd ? '+' : '−';

                q.text = `${a.toLocaleString()} ${opSymbol} ${b.toLocaleString()} = ?`;
                q.ans = ans;
                q.answerType = 'number';
                // The split the whole step is about: `9 + 5` is `9 + 1 + 4`, and `15 − 8` is
                // `15 − 5 − 3`. Both parts are forced by the numbers, so they are computed once
                // here and used by the hint, the cell and the answer key alike.
                //   +  p1 = what the second addend gives to fill the ten;  p2 = what is left
                //   −  p1 = the ones of the minuend, which take it down to ten;  p2 = the rest
                const bridgeP1 = isBridgingTen ? (isAdd ? 10 - a : a - 10) : 0;
                const bridgeP2 = isBridgingTen ? b - bridgeP1 : 0;

                if (isBridgingTen) {
                    // The cell must not keep saying "within 10" when the sum is 11 to 18.
                    q.skillLabel = isAdd ? 'Add — Bridging Ten' : 'Subtract — Bridging Ten';
                    q.hint = isAdd
                        ? `Make ten first. ${a} needs ${bridgeP1} to reach 10, so split ${b} into ${bridgeP1} and ${bridgeP2}. `
                          + `${a} + ${bridgeP1} = 10, and 10 + ${bridgeP2} = ${a + b}.`
                        : `Take away to ten first. Split ${b} into ${bridgeP1} and ${bridgeP2}. `
                          + `${a} − ${bridgeP1} = 10, and 10 − ${bridgeP2} = ${a - b}.`;
                } else {
                    q.hint = isAdd
                        ? `Line up digits by place value. Add each column from the ones.${regroupType === 'regroup' ? ' Carry when a column sums to 10 or more!' : ''}`
                        : `Line up digits by place value. Subtract each column from the ones.${regroupType === 'regroup' ? ' Borrow when the top digit is smaller!' : ''}`;
                }

                // NOTATION (CONTRACT 2). Within 10 and within 20 are single-digit items, so
                // "across" is genuinely available and is honoured. From within 50 up the item is
                // multi-digit column work and stays stacked, which is why the 50+ ids declare no
                // notation option at all (skill-options.js).
                const bandIsOneLineFact = maxVal <= 20;
                const bandNotation = bandIsOneLineFact ? notationFor(isAdd ? '+' : '−') : 'stacked';
                q.notation = bandNotation;
                const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
                if (bandNotation === 'across') {
                    q.visual = '';
                    q.printFormat = isAdd ? 'add-facts-horizontal' : 'sub-facts-horizontal';
                } else {
                    q.visual = buildColumnVisual(a, b, isAdd, uniqueId);
                    q.printFormat = isAdd ? 'column-add' : 'column-sub';
                }

                // ===== R3 — THE BRIDGING-TEN WRITING LOAD (owner ruling, 2026-09-20) =====
                // "Keep all three written numbers at the two steps where the split is the thing
                // being taught (9 + 5 -> 9 + 1 + 4 -> 14), then drop to answer-only at the next
                // rung." Those two steps are §7's BT-3 and BT-4; BT-5 is the `fade` step that
                // removes the split frame (P-SC-4).
                //
                // BT-3, BT-4 and BT-5 are one id, so something has to choose between them, and
                // the repo already has the control: skill-options.js's universal SUPPORT LEVEL.
                //   3  BT-3  two ten frames beside the split frame   -> THREE numbers written
                //   2  BT-4  the split frame alone                   -> THREE numbers written
                //   1  BT-5  the split frame removed                 -> ONE number (today's cell)
                //   0        bare
                // The default is [1], so an untouched bridging page prints exactly what it
                // printed before and the content gate sees no change; ticking 3 and 2 is the
                // pair of steps the ruling is about, and ticking 3, 2 and 1 fades across a page.
                //
                // WHAT IS GRADED. On paper all three blanks are written, which is the point --
                // if the pupil does not write the split, they are not practising it. On screen
                // the two part boxes are typed but ungraded, exactly as the regroup boxes of a
                // column cell are (VA-13): the sum stays the one scored slot, so nothing about
                // marking, XP or the answer key changes shape.
                if (isBridgingTen) {
                    const lvl = supportLevelFor(1);
                    q.supportLevel = lvl;
                    q.bridgeParts = [bridgeP1, bridgeP2];
                    q.bridgeWritten = lvl >= 2 ? 3 : 1;
                    if (lvl >= 2) {
                        const gap = isAdd ? '+' : '−';
                        const partBox = (n) => `<span style="display:inline-block;width:1.6em;height:1.6em;`
                            + `border:1.5px solid ${_WS_INK};vertical-align:-0.35em;" data-ws-part="${n}"></span>`;
                        const tenFrame = (filled) => {
                            const c = 26, pad = 4;
                            let cells = '';
                            for (let i = 0; i < 10; i++) {
                                const x = pad + (i % 5) * c, y = pad + Math.floor(i / 5) * c;
                                cells += `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="none" stroke="${_WS_INK}" stroke-width="1"/>`;
                                if (i < filled) cells += `<circle cx="${x + c / 2}" cy="${y + c / 2}" r="${c / 3}" fill="${_WS_INK}"/>`;
                            }
                            return `<svg width="${pad * 2 + c * 5}" height="${pad * 2 + c * 2}" viewBox="0 0 ${pad * 2 + c * 5} ${pad * 2 + c * 2}">${cells}</svg>`;
                        };
                        // BT-3 keeps the two ten frames beside the split frame (H1); BT-4 drops
                        // them. Nothing else moves between the two, which is P-1.
                        const frames = lvl >= 3
                            ? `<div style="display:flex;gap:12px;justify-content:center;margin-bottom:10px;">`
                              + `${tenFrame(isAdd ? a : 10)}${tenFrame(isAdd ? b : 0)}</div>`
                            : '';
                        // THE THREE WRITTEN NUMBERS ARE: the two part boxes, and the answer --
                        // the answer rule the print cell adds under every visual, and the typed
                        // box on screen. So the cell carries no fourth blank and no duplicate:
                        // the pupil writes the split and then the sum, which is the whole step.
                        q.visual = _wsCell(
                            frames
                            + `<div style="font-size:1.9rem;font-weight:700;">${a} ${gap} ${b}</div>`
                            + `<div style="margin-top:10px;font-size:1.6rem;font-weight:700;">`
                            + `${a} ${gap} ${partBox(1)} ${gap} ${partBox(2)}</div>`
                            + `<div style="margin-top:6px;font-size:0.95rem;">`
                            + (isAdd ? 'makes ten' : 'takes it to ten') + `</div>`,
                            `Say: ${a} ${isAdd ? 'plus' : 'minus'} ___ makes ten. Ten ${isAdd ? 'plus' : 'minus'} ___ equals ___ .`);
                        q.printText = isAdd ? 'Make ten first. Write both parts, then the answer.'
                            : 'Take it down to ten first. Write both parts, then the answer.';
                        q.printFormat = isAdd ? 'bridge-ten-split-add' : 'bridge-ten-split-sub';
                        q.notation = 'across';
                    }
                }

                q.a = a;
                q.b = b;
                q.op = opSymbol;
                q.options = buildNumericOptions(ans);
                // Tag common column-arithmetic misconceptions.
                if (typeof window !== 'undefined' && typeof window.tagDistractor === 'function') {
                    if (isAdd) {
                        window.tagDistractor(q, String(a - b), "Looks like you subtracted instead of adding. Re-read the operation and try again.");
                        window.tagDistractor(q, String(a + b - 10), "Check your place-value alignment — make sure ones go under ones, tens under tens, and remember to carry when a column sums to 10 or more.");
                    } else {
                        window.tagDistractor(q, String(a + b), "Looks like you added instead of subtracting. Re-read the operation and try again.");
                        // "Subtracted smaller from larger digit in each column" classic
                        // borrow-error often produces (a - b) shifted; surface a generic
                        // borrow-reminder for any near-miss.
                        window.tagDistractor(q, String(Math.abs(a - b) + 10), "Looks like you forgot to regroup (borrow). When the top digit is smaller than the bottom in a column, borrow 1 from the next column to the left.");
                    }
                }
                return;
            }

            // ========================================
            // WORD PROBLEMS BY RANGE (add_wp_*, sub_wp_*)
            // ========================================
            const wpRangeMatch = mappedSkill.match(/^(add|sub)_wp_(10|20|50|100|1k|10k|100k|1m)$/);
            if (wpRangeMatch) {
                const [, op, rangeCode] = wpRangeMatch;
                const maxVal = RANGE_MAP[rangeCode];
                const isAdd = op === 'add';

                const smallScenarios = [
                    { item: bwIcon('apples'), name: 'apples', color: 'pink', context: 'fruit basket', verb: 'ate' },
                    { item: bwIcon('stars'), name: 'stars', color: 'yellow', context: 'sticker chart', verb: 'gave away' },
                    { item: bwIcon('books'), name: 'books', color: 'blue', context: 'library', verb: 'returned' },
                    { item: bwIcon('cookies'), name: 'cookies', color: 'orange', context: 'cookie jar', verb: 'ate' },
                    { item: bwIcon('balloons'), name: 'balloons', color: 'purple', context: 'party', verb: 'popped' },
                    { item: bwIcon('flowers'), name: 'flowers', color: 'pink', context: 'garden', verb: 'picked' },
                    { item: bwIcon('balls'), name: 'balls', color: 'orange', context: 'gym', verb: 'lost' },
                    { item: bwIcon('pencils'), name: 'pencils', color: 'yellow', context: 'desk', verb: 'lost' },
                ];
                const medScenarios = [
                    { item: bwIcon('pages'), name: 'pages', color: 'blue', context: 'book', verb: 'read' },
                    { item: bwIcon('coins'), name: 'coins', color: 'yellow', context: 'piggy bank', verb: 'spent' },
                    { item: bwIcon('blocks'), name: 'blocks', color: 'orange', context: 'tower', verb: 'removed' },
                    { item: bwIcon('tickets'), name: 'tickets', color: 'purple', context: 'raffle', verb: 'sold' },
                    { item: bwIcon('trees'), name: 'trees', color: 'green', context: 'park', verb: 'cut down' },
                    { item: bwIcon('presents'), name: 'presents', color: 'pink', context: 'birthday party', verb: 'opened' },
                ];
                const lgScenarios = [
                    { name: 'students', context: 'school district', verb: 'graduated' },
                    { name: 'books', context: 'library system', verb: 'were checked out' },
                    { name: 'visitors', context: 'museum', verb: 'left' },
                    { name: 'tickets', context: 'concert venue', verb: 'were refunded' },
                    { name: 'bottles of water', context: 'warehouse', verb: 'were shipped' },
                    { name: 'miles', context: 'road trip', verb: 'were already driven' },
                ];
                const xlScenarios = [
                    { name: 'people', context: 'city', verb: 'moved away' },
                    { name: 'dollars', context: 'budget', verb: 'was spent' },
                    { name: 'gallons of water', context: 'reservoir', verb: 'was used' },
                    { name: 'website visitors', context: 'month', verb: 'bounced' },
                    { name: 'votes', context: 'election', verb: 'were disqualified' },
                    { name: 'units', context: 'factory', verb: 'were defective' },
                ];

                const [name1, name2] = pickTwoNames();

                let scenarios, useEmoji;
                if (maxVal <= 20) { scenarios = smallScenarios; useEmoji = true; }
                else if (maxVal <= 100) { scenarios = smallScenarios.concat(medScenarios); useEmoji = true; }
                else if (maxVal <= 1000) { scenarios = medScenarios; useEmoji = false; }
                else if (maxVal <= 10000) { scenarios = lgScenarios; useEmoji = false; }
                else { scenarios = xlScenarios; useEmoji = false; }

                const scenario = pick(scenarios);
                // Ruling 1: the band bounds the ANSWER. "Add within 100" is a story whose total
                // is at most 100, not a story with two numbers up to 100 in it. Neither number
                // should be trivially small either, so the split has a floor of a twentieth of
                // the band.
                const wpMinOperand = maxVal <= 20 ? 1 : Math.max(2, Math.floor(maxVal / 20));

                let a, b, answer;
                if (isAdd) {
                    [a, b] = generateAddPair(maxVal, 'mixed', rng, { minOperand: wpMinOperand });
                    answer = a + b;
                } else {
                    [a, b] = generateSubPair(maxVal, 'mixed', rng, { minOperand: wpMinOperand });
                    answer = a - b;
                }

                if (isAdd) {
                    const tpl = maxVal <= 100 ? [
                        `${name1} has ${a.toLocaleString()} ${scenario.name}. ${name2} gives ${name1} ${b.toLocaleString()} more ${scenario.name}. How many ${scenario.name} does ${name1} have now?`,
                        `There are ${a.toLocaleString()} ${scenario.name} in the ${scenario.context}. ${name1} adds ${b.toLocaleString()} more. How many ${scenario.name} are there in all?`,
                        `${name1} picks ${a.toLocaleString()} ${scenario.name}. Then ${name1} picks ${b.toLocaleString()} more. How many ${scenario.name} did ${name1} pick altogether?`,
                    ] : [
                        `A ${scenario.context} has ${a.toLocaleString()} ${scenario.name}. Then ${b.toLocaleString()} more ${scenario.name} arrive. How many ${scenario.name} are there now?`,
                        `${name1} counted ${a.toLocaleString()} ${scenario.name} in the morning. By evening, there were ${b.toLocaleString()} more. What is the total?`,
                        `One group has ${a.toLocaleString()} ${scenario.name} and another has ${b.toLocaleString()} ${scenario.name}. How many ${scenario.name} are there altogether?`,
                    ];
                    q.text = pick(tpl);
                } else {
                    const tpl = maxVal <= 100 ? [
                        `${name1} has ${a.toLocaleString()} ${scenario.name}. ${name1} ${scenario.verb} ${b.toLocaleString()} of them. How many ${scenario.name} does ${name1} have left?`,
                        `There were ${a.toLocaleString()} ${scenario.name}. ${b.toLocaleString()} were ${scenario.verb}. How many are left?`,
                        `${name1} started with ${a.toLocaleString()} ${scenario.name} and ${scenario.verb} ${b.toLocaleString()}. How many ${scenario.name} remain?`,
                    ] : [
                        `A ${scenario.context} had ${a.toLocaleString()} ${scenario.name}. Then ${b.toLocaleString()} ${scenario.verb}. How many ${scenario.name} remain?`,
                        `There were ${a.toLocaleString()} ${scenario.name}. After ${b.toLocaleString()} ${scenario.verb}, how many were left?`,
                        `${name1} recorded ${a.toLocaleString()} ${scenario.name}. Later, ${b.toLocaleString()} ${scenario.verb}. How many ${scenario.name} are left?`,
                    ];
                    q.text = pick(tpl);
                }

                // P8: English number agreement. "Ethan picks 1 flowers" and "1 stars" misteach
                // reading for an ELL pupil (critic, baseline 2026-09-24): a count of 1 takes the
                // singular noun, and a passive "were ate" / "1 were" reads as it should.
                const _one = scenario.name === 'people' ? 'person'
                    : scenario.name.replace(/^(\w+?)s\b/, '$1');
                const _reName = scenario.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                q.text = q.text
                    .replace(new RegExp(`(^|[^\\d,.])1 (more )?${_reName}\\b`, 'g'), (m, pre, more) => `${pre}1 ${more || ''}${_one}`)
                    .replace(/\bwere ate\b/g, 'were eaten')
                    .replace(/\bwere gave away\b/g, 'were given away')
                    .replace(/(^|[^\d,.])1 were\b/g, (m, pre) => `${pre}1 was`);
                const _label = (n) => `${n.toLocaleString()} ${n === 1 ? _one : scenario.name}`;

                q.ans = answer;
                q.a = a; q.b = b; q.op = isAdd ? '+' : '-';
                q.answerType = 'number';
                q.hint = isAdd ? `Words like "more", "altogether", "in all" mean ADD. Stack them up and add: ${a.toLocaleString()} + ${b.toLocaleString()} = ?` : `Words like "left", "remain", "took away" mean SUBTRACT. Stack them up: ${a.toLocaleString()} − ${b.toLocaleString()} = ?`;

                // ── Column workmat (col-arith) ──
                // add_wp_*/sub_wp_* templates always make the SUM/DIFFERENCE
                // the unknown, so the workmat is always safe to wire here.
                if (Number.isFinite(a) && Number.isFinite(b) && answer >= 0) {
                    q.answerType = 'col-arith';
                    q.colMode = isAdd ? 'add' : 'sub';
                    if (isAdd) {
                        q.operands = [a, b];
                    } else {
                        q.minuend = a;
                        q.subtrahend = b;
                    }
                    q.decimalPlaces = 0;
                }

                if (useEmoji && scenario.item) {
                    if (isAdd) {
                        const g1 = Array(Math.min(Math.floor(a), 15)).fill(scenario.item).join('');
                        const g2 = Array(Math.min(Math.floor(b), 15)).fill(scenario.item).join('');
                        q.visual = `<div class="word-problem-visual">
                            <div class="word-problem-scene">
                                <div class="visual-group group-${scenario.color}">
                                    <div style="font-size:1.1rem;letter-spacing:2px;color:#000;text-align:center;">${g1}</div>
                                    <div class="visual-label">${_label(a)}</div>
                                </div>
                                <div style="font-size:2rem;color:#7209b7;font-weight:700;">+</div>
                                <div class="visual-group group-${scenario.color}">
                                    <div style="font-size:1.1rem;letter-spacing:2px;color:#000;text-align:center;">${g2}</div>
                                    <div class="visual-label">${_label(b)}</div>
                                </div>
                            </div>
                            ${_equationBuilderHTML(a, b)}
                        </div>`;
                    } else {
                        const totalItems = Array(Math.min(Math.floor(a), 20)).fill(scenario.item);
                        const html = totalItems.map((it, i) =>
                            i < b ? `<span style="opacity:0.3;position:relative;display:inline-block;">${it}<span style="position:absolute;left:0;right:0;top:50%;border-top:2px solid #000;"></span></span>` : `<span>${it}</span>`
                        ).join('');
                        q.visual = `<div class="word-problem-visual">
                            <div style="text-align:center;margin-bottom:10px;">
                                <div style="font-size:0.9rem;color:#666;margin-bottom:8px;">Started with ${a.toLocaleString()}, ${scenario.verb} ${b.toLocaleString()}:</div>
                                <div class="visual-group group-${scenario.color}" style="max-width:300px;">
                                    <div style="font-size:1.1rem;letter-spacing:2px;color:#000;text-align:center;">${html}</div>
                                </div>
                            </div>
                            ${_equationBuilderHTML(a, b)}
                        </div>`;
                    }
                } else {
                    q.visual = `<div class="word-problem-visual">
                        ${_equationBuilderHTML(a, b)}
                    </div>`;
                }

                q.printFormat = isAdd ? 'word-add' : 'word-sub';
                q.options = buildNumericOptions(answer);
                return;
            }

            // ========================================
            // BOX METHOD DIVISION (Grade 3-4)
            // Per-digit guided long division. Each dividend digit becomes
            // a "box" with its own quotient roof, subtraction row, remainder.
            // Reference: Tim's Documents/Division Problems/Box Method Division Interactive Application.html
            // ========================================
            if (mappedSkill === "box_division_easy" || mappedSkill === "box_division_hard") {
                const isHard = mappedSkill === "box_division_hard";
                // Easy: 2-digit ÷ 1-digit, no remainder.  Hard: 3-digit ÷ 1-digit, ~30% may have remainder.
                const numDigits = isHard ? 3 : 2;
                // P12: `regroup` (Remainders: none / some / every item) and a changed `constant`
                // ("Divide by"). At their defaults the old draw is unchanged.
                const _bdRg = _opt('regroup');
                const allowRemainder = _bdRg === 'always' ? true : _bdRg === 'none' ? false : Math.random() < 0.3;
                const _bdDiv = _p12Constant();

                let divisor, dividend, quotient, remainder;
                let attempts = 0;
                do {
                    divisor = _bdDiv || rng(2, 9); // single-digit divisor 2-9
                    if (allowRemainder) {
                        // Pick any dividend in the digit range; remainder will fall out naturally.
                        const minD = isHard ? 100 : 10;
                        const maxD = isHard ? 999 : 99;
                        dividend = rng(minD, maxD);
                        quotient = Math.floor(dividend / divisor);
                        remainder = dividend % divisor;
                        // We require a real (>0) remainder when this branch is chosen.
                        if (remainder === 0) { attempts++; continue; }
                    } else {
                        // Clean division: pick a quotient and multiply.
                        // Quotient must be at least 2 digits for hard, 1+ for easy, and dividend
                        // must end up with the right digit count.
                        const minQ = isHard ? 10 : 2;
                        const maxQ = isHard ? Math.floor(999 / divisor) : Math.floor(99 / divisor);
                        quotient = rng(minQ, Math.max(minQ, maxQ));
                        dividend = quotient * divisor;
                        remainder = 0;
                        const dStr = dividend.toString();
                        if (dStr.length !== numDigits) { attempts++; continue; }
                    }
                    attempts++;
                    // Make sure dividend has the expected digit count
                    if (dividend.toString().length === numDigits) break;
                } while (attempts < 50);

                // Fallback if loop didn't converge (extremely unlikely)
                if (dividend.toString().length !== numDigits) {
                    if (isHard) { divisor = 3; quotient = 145; dividend = 435; remainder = 0; }
                    else        { divisor = 4; quotient = 24;  dividend = 96;  remainder = 0; }
                }

                // Build per-digit step trace.
                const digits = dividend.toString().split('').map(d => parseInt(d, 10));
                const steps = [];
                let prevRem = 0;
                for (let i = 0; i < digits.length; i++) {
                    const val = prevRem * 10 + digits[i];
                    const stepQ = Math.floor(val / divisor);
                    const sub = stepQ * divisor;
                    const newRem = val - sub;
                    steps.push({
                        idx: i,
                        digit: digits[i],
                        prevRem,
                        val,           // displayed inside the box (digit + carry)
                        roof: stepQ,   // quotient digit shown on roof
                        sub,           // amount subtracted
                        rem: newRem,   // remainder leaving the box
                    });
                    prevRem = newRem;
                }

                // Build interactive HTML scaffold (boxes side-by-side).
                // Inputs: .bx-roof (per box), .bx-sub (per box), .bx-rem (per box)
                const fontStack = FONTS.sans;
                const primary = COLORS.primary;
                const primaryDark = COLORS.primaryDark;
                const carryColor = COLORS.fill[2]; // orange — flags carried digits
                const inputBaseStyle = `width:42px;height:42px;text-align:center;font-family:${fontStack};font-size:1.4rem;font-weight:700;color:${COLORS.text};border:${STROKE.normal}px solid ${primary};border-radius:6px;background:${COLORS.bg};outline:none;padding:0;`;

                const boxesHtml = steps.map((s, i) => {
                    const isFirst = i === 0;
                    const isLast = i === steps.length - 1;
                    const valStr = s.val.toString();
                    return `
                        <div class="bx-box-wrap" data-box-idx="${i}" style="position:relative;display:flex;flex-direction:column;align-items:center;">
                            <!-- Roof / quotient input -->
                            <div style="height:54px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;">
                                <input type="text" maxlength="2" inputmode="numeric" class="bx-roof" data-i="${i}" data-answer="${s.roof}" style="${inputBaseStyle}" aria-label="Quotient digit for box ${i + 1}">
                            </div>

                            <!-- The box -->
                            <div class="bx-box" style="
                                width:108px;
                                min-height:170px;
                                padding:10px 10px 8px 10px;
                                box-sizing:border-box;
                                border-top:3px solid ${COLORS.axis};
                                border-right:3px solid ${COLORS.axis};
                                border-bottom:3px solid ${COLORS.axis};
                                ${isFirst ? `border-left:3px solid ${COLORS.axis};` : ''}
                                background:${COLORS.bg};
                                display:flex;
                                flex-direction:column;
                                align-items:flex-end;
                                gap:6px;
                                font-family:${fontStack};
                            ">
                                <!-- Current value (digit + carry) -->
                                <div class="bx-val" style="font-size:1.5rem;font-weight:700;color:${i > 0 && valStr.length > 1 ? carryColor : COLORS.text};line-height:1;">${valStr}</div>

                                <!-- Subtraction row -->
                                <div style="width:100%;display:flex;justify-content:space-between;align-items:center;border-bottom:${STROKE.normal}px solid ${COLORS.textMuted};padding-bottom:4px;margin-top:4px;">
                                    <span style="font-size:1.1rem;color:${COLORS.textMuted};font-weight:700;">−</span>
                                    <input type="text" maxlength="3" inputmode="numeric" class="bx-sub" data-i="${i}" data-answer="${s.sub}" style="width:48px;height:32px;text-align:center;font-family:${fontStack};font-size:1.05rem;font-weight:700;color:${COLORS.text};border:${STROKE.normal}px solid ${primary};border-radius:5px;background:${COLORS.bg};outline:none;padding:0;" aria-label="Subtract amount for box ${i + 1}">
                                </div>

                                <!-- Remainder -->
                                <input type="text" maxlength="2" inputmode="numeric" class="bx-rem" data-i="${i}" data-answer="${s.rem}" style="width:48px;height:36px;text-align:center;font-family:${fontStack};font-size:1.15rem;font-weight:700;color:${COLORS.wrong};border:${STROKE.normal}px solid ${primary};border-radius:5px;background:${COLORS.bg};outline:none;padding:0;margin-top:auto;" aria-label="Remainder for box ${i + 1}">
                            </div>

                            <!-- Carry arrow to next box -->
                            ${!isLast ? `
                                <div class="bx-arrow" style="position:absolute;right:-22px;top:50%;transform:translateY(-50%);z-index:2;color:${primaryDark};font-size:1.6rem;font-weight:700;line-height:1;">→</div>
                            ` : ''}
                        </div>
                    `;
                }).join('');

                q.text = `${dividend} ÷ ${divisor} = ?`;
                // THE KEY MUST CARRY THE REMAINDER. ~30% of the hard items are deliberately
                // inexact (allowRemainder above), and the key was printing the quotient alone:
                // a printed sheet asked 550 ÷ 8 and answered 68, so a pupil who worked the boxes
                // correctly to 68 R 6 was marked wrong off the key. The screen never reads q.ans
                // for this type (answer-check.js checks each box against boxDivisionData and
                // already says "68 R 6" back), so this is the answer key and nothing else.
                q.ans = remainder > 0 ? `${quotient} R ${remainder}` : quotient;
                q.a = dividend; q.b = divisor; q.op = '÷';
                q.boxDivisionData = { divisor, dividend, quotient, remainder, steps };
                q.answerType = 'box-division';
                q.printFormat = 'box-division';
                q.skillLabel = 'Box Method ÷';
                q.options = []; // never multiple choice
                q.hint = `Use the box method! Divide each digit of ${dividend} by ${divisor}, one box at a time. Carry the remainder of each step into the next box.`;

                q.visual = `
                    <div class="bx-wrap" style="display:flex;flex-direction:column;align-items:center;gap:12px;font-family:${fontStack};padding:16px 8px;">
                        <div style="font-size:1.05rem;font-weight:600;color:${primaryDark};">
                            Solve <span style="font-family:${fontStack};font-weight:700;color:${COLORS.text};">${dividend} ÷ ${divisor}</span> using the Box Method
                        </div>

                        <div style="display:flex;align-items:flex-start;gap:10px;">
                            <!-- Divisor on the outside -->
                            <div style="display:flex;flex-direction:column;justify-content:center;padding-top:78px;padding-right:6px;">
                                <div style="font-size:1.7rem;font-weight:700;color:${COLORS.text};">${divisor}</div>
                            </div>

                            <!-- Boxes -->
                            <div style="display:flex;align-items:flex-start;gap:0;">
                                ${boxesHtml}
                            </div>
                        </div>

                        <div style="font-size:0.85rem;color:${COLORS.textMuted};text-align:center;max-width:500px;line-height:1.45;">
                            Fill the <strong style="color:${primary};">roof</strong> with the quotient digit, the <strong style="color:${primary};">subtract</strong> box with that digit × divisor, and the <strong style="color:${primary};">remainder</strong> at the bottom. The carry shows up automatically in the next box.
                        </div>
                    </div>
                `;
                return;
            }

            // ========================================
            // ADD THREE (Grade 1) - Add three numbers <= 20
            // ========================================
            if (mappedSkill === "add_three") {
                // Generate 3 numbers, each <= 10, sum <= 20 (P11: "Sum to" 10 / 20 bounds the sum)
                const _a3Top = Number(_opt('band')) || 20;
                let a, b, c;
                do {
                    a = rng(1, Math.min(10, _a3Top - 2));
                    b = rng(1, Math.min(10, _a3Top - 2));
                    c = rng(1, Math.min(10, _a3Top - a - b));
                } while (a + b + c > _a3Top || c < 1);
                const sum = a + b + c;

                q.text = `${a} + ${b} + ${c} = ?`;
                q.ans = sum;
                q.a = a + b; q.b = c; q.op = '+';
                q.answerType = "number";
                q.hint = `Add the first two: ${a} + ${b} = ${a + b}. Then add the third: ${a + b} + ${c} = ${sum}`;

                // Visual: three groups of colored dots
                const dotR = 8;
                const dotGap = 22;
                const groupGap = 30;
                const maxPerRow = 5;

                const buildDotGroup = (count, color, startX, startY) => {
                    let dots = '';
                    for (let i = 0; i < count; i++) {
                        const col = i % maxPerRow;
                        const row = Math.floor(i / maxPerRow);
                        dots += `<circle cx="${startX + col * dotGap + dotR}" cy="${startY + row * dotGap + dotR}" r="${dotR}" fill="${color}" opacity="0.85"/>`;
                    }
                    const rows = Math.ceil(count / maxPerRow);
                    const cols = Math.min(count, maxPerRow);
                    return { svg: dots, w: cols * dotGap, h: rows * dotGap };
                };

                // Three groups get distinct categorical colors (color identifies
                // which addend each cluster belongs to).
                const colA = categoricalFill(0); // blue
                const colB = categoricalFill(1); // green
                const colC = categoricalFill(2); // orange
                const grpA = buildDotGroup(a, colA, 10, 30);
                const grpB = buildDotGroup(b, colB, 10 + grpA.w + groupGap, 30);
                const grpC = buildDotGroup(c, colC, 10 + grpA.w + groupGap + grpB.w + groupGap, 30);

                const svgW = 10 + grpA.w + groupGap + grpB.w + groupGap + grpC.w + 20;
                const svgH = Math.max(grpA.h, grpB.h, grpC.h) + 60;

                // Plus signs between groups
                const plusY = 30 + Math.max(grpA.h, grpB.h, grpC.h) / 2;
                const plus1X = 10 + grpA.w + groupGap / 2;
                const plus2X = 10 + grpA.w + groupGap + grpB.w + groupGap / 2;

                // Labels under groups
                const labelY = svgH - 8;
                const labelAX = 10 + grpA.w / 2;
                const labelBX = 10 + grpA.w + groupGap + grpB.w / 2;
                const labelCX = 10 + grpA.w + groupGap + grpB.w + groupGap + grpC.w / 2;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Add Three Numbers</div>
                    <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 360)}" style="background:var(--bg-card);border-radius:12px;padding:8px;" font-family='${FONTS.sans}'>
                        ${grpA.svg}${grpB.svg}${grpC.svg}
                        <text x="${plus1X}" y="${plusY + 5}" text-anchor="middle" font-family='${FONTS.sans}' font-size="18" font-weight="700" fill="${COLORS.text}">+</text>
                        <text x="${plus2X}" y="${plusY + 5}" text-anchor="middle" font-family='${FONTS.sans}' font-size="18" font-weight="700" fill="${COLORS.text}">+</text>
                        <text x="${labelAX}" y="${labelY}" text-anchor="middle" font-family='${FONTS.sans}' font-size="14" font-weight="700" fill="${colA}">${a}</text>
                        <text x="${labelBX}" y="${labelY}" text-anchor="middle" font-family='${FONTS.sans}' font-size="14" font-weight="700" fill="${colB}">${b}</text>
                        <text x="${labelCX}" y="${labelY}" text-anchor="middle" font-family='${FONTS.sans}' font-size="14" font-weight="700" fill="${colC}">${c}</text>
                    </svg>
                    <div style="margin-top:8px;font-size:1.1rem;font-weight:600;color:var(--text-bright);">
                        <span style="color:${colA};">${a}</span> + <span style="color:${colB};">${b}</span> + <span style="color:${colC};">${c}</span> = ?
                    </div>
                </div>`;
                q.options = buildNumericOptions(sum);
                // Tag common add-three misconceptions: only two addends summed.
                if (typeof window !== 'undefined' && typeof window.tagDistractor === 'function') {
                    window.tagDistractor(q, String(a + b), `Looks like you only added two of the three numbers (${a} + ${b}). Don't forget to add ${c} too.`);
                    window.tagDistractor(q, String(b + c), `Looks like you only added two of the three numbers (${b} + ${c}). Don't forget to add ${a} too.`);
                    window.tagDistractor(q, String(a + c), `Looks like you only added two of the three numbers (${a} + ${c}). Don't forget to add ${b} too.`);
                }
                return;
            }

            // ========================================
            // COMPARISON WORD (Grade 1-2) - How many more/fewer
            // ========================================
            else if (mappedSkill === "comparison_word") {
                // The "click the numbers you need" variant is a teacher tick now, not a 20% roll (P4).
                if (_responseMode() === 'which-numbers') {
                    const _msc_w = _msc_comparisonWord(rng);
                    if (_applyMscQuestion(q, _msc_w)) return;
                }

                const maxVal = Math.min(range, 50);
                const valA = rng(3, maxVal);
                let valB = rng(1, maxVal);
                // Ensure they are different
                while (valB === valA) { valB = rng(1, maxVal); }

                const larger = Math.max(valA, valB);
                const smaller = Math.min(valA, valB);
                const difference = larger - smaller;

                const namePair = pickTwoNames();
                const item = pickNoun();

                // Randomly assign who has more
                let nameMore, nameFewer, countMore, countFewer;
                if (Math.random() < 0.5) {
                    nameMore = namePair[0]; nameFewer = namePair[1];
                } else {
                    nameMore = namePair[1]; nameFewer = namePair[0];
                }
                countMore = larger;
                countFewer = smaller;

                const askMore = Math.random() < 0.5;
                if (askMore) {
                    q.text = `${nameMore} has ${countMore} ${item}. ${nameFewer} has ${countFewer} ${item}. How many MORE ${item} does ${nameMore} have than ${nameFewer}?`;
                } else {
                    q.text = `${nameMore} has ${countMore} ${item}. ${nameFewer} has ${countFewer} ${item}. How many FEWER ${item} does ${nameFewer} have than ${nameMore}?`;
                }
                q.ans = difference;
                q.answerType = "number";
                q.hint = `Subtract the smaller from the larger: ${countMore} - ${countFewer} = ${difference}`;

                // Visual: two bar models side by side showing comparison
                const barMaxW = 240;
                const barH = 32;
                const barGap = 16;
                const unitW = barMaxW / larger;
                const barAW = countMore * unitW;
                const barBW = countFewer * unitW;
                const svgW = barMaxW + 100;
                const svgH = barH * 2 + barGap + 70;

                const colorMore = "var(--accent-cyan)";
                const colorFewer = "var(--accent-green)";
                const colorDiff = "var(--accent-orange)";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Comparison Bar Model</div>
                    <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 340)}" style="background:var(--bg-card);border-radius:12px;padding:10px;">
                        <!-- Name labels -->
                        <text x="5" y="${20 + barH / 2 + 5}" font-size="12" font-weight="700" fill="var(--text-bright)">${nameMore}</text>
                        <text x="5" y="${20 + barH + barGap + barH / 2 + 5}" font-size="12" font-weight="700" fill="var(--text-bright)">${nameFewer}</text>
                        <!-- More bar -->
                        <rect x="60" y="20" width="${barAW}" height="${barH}" rx="6" fill="${colorMore}" opacity="0.8"/>
                        <text x="${60 + barAW / 2}" y="${20 + barH / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${countMore}</text>
                        <!-- Fewer bar -->
                        <rect x="60" y="${20 + barH + barGap}" width="${barBW}" height="${barH}" rx="6" fill="${colorFewer}" opacity="0.8"/>
                        <text x="${60 + barBW / 2}" y="${20 + barH + barGap + barH / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${countFewer}</text>
                        <!-- Difference bracket -->
                        <rect x="${60 + barBW}" y="20" width="${barAW - barBW}" height="${barH}" rx="4" fill="${colorDiff}" opacity="0.3" stroke="${colorDiff}" stroke-width="2" stroke-dasharray="5,3"/>
                        <text x="${60 + barBW + (barAW - barBW) / 2}" y="${20 + barH / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="${colorDiff}">?</text>
                        <!-- Difference label -->
                        <text x="${60 + barBW + (barAW - barBW) / 2}" y="${svgH - 10}" text-anchor="middle" font-size="11" font-weight="600" fill="${colorDiff}">Difference = ?</text>
                    </svg>
                </div>`;
                q.options = buildNumericOptions(difference);
                // Tag common comparison-word misconception values.
                if (typeof window !== 'undefined' && typeof window.tagDistractor === 'function') {
                    window.tagDistractor(q, String(larger + smaller), "Looks like you ADDED the two amounts. To find how many MORE / FEWER, SUBTRACT the smaller from the larger.");
                    window.tagDistractor(q, String(larger), "That's just the larger amount, not the difference. Subtract the smaller amount from it.");
                    window.tagDistractor(q, String(smaller), "That's just the smaller amount, not the difference. Subtract it from the larger amount.");
                }
                return;
            }

            // ========================================
            // LONG DIVISION BY 2-DIGIT DIVISOR (Grade 5)
            // ========================================
            else if (mappedSkill === "long_div_2digit") {
                // P8: GENUINE long division by a 2-digit divisor (5.NBT.B.6). The old draw scaled
                // off Max Number, and at the default 100 that left divisor 11 or 12 and a 2-digit
                // dividend — a times-table recall with one quotient digit, and so few distinct
                // items that 5 of 20 repeated. Now: divisor 11-99 (rounding to a friendly ten is
                // the estimate the pupil makes), dividend 3 or 4 digits, and the quotient either
                // one digit from a 3-digit dividend (the trial-quotient step on its own) or two
                // digits (the full divide-multiply-subtract-bring-down cycle). Exact quotients,
                // so the key and the checker stay one number.
                const divisor = rng(11, range >= 1000 ? 99 : 59);
                let quotient;
                if (rng(1, 10) <= 3) {
                    // one quotient digit, 3-digit dividend: 100 <= d x q <= 999
                    const lo = Math.max(2, Math.ceil(100 / divisor));
                    quotient = lo <= 9 ? rng(lo, 9) : rng(10, Math.max(10, Math.floor(999 / divisor)));
                } else {
                    quotient = rng(10, Math.max(11, Math.min(99, Math.floor(9999 / divisor))));
                }
                const dividend = divisor * quotient;
                const _est = Math.max(10, Math.round(divisor / 10) * 10);

                q.text = `${dividend} \u00F7 ${divisor} = ?`;
                q.ans = quotient;
                q.answerType = "number";
                q.hint = `How many times does ${divisor} go into ${dividend}? Estimate: ${divisor} is about ${_est}. Divide, multiply, subtract, bring down.`;

                // The sheet kit's `division` template draws the bracket on paper, on the key and
                // on screen: quotient boxes over the dividend tracks, the divisor attached to the
                // bracket, four work rows (a two-digit quotient's divide-multiply-subtract-bring
                // down twice), Andika at the digit size. The screen twin's quotient boxes are
                // typed one digit each and compose the quotient (data-mq-join="").
                const _ldPayload = { dividend, divisor, quotient, workRows: 4 };
                q.cell = { template: 'division', v: 1, payload: _ldPayload };
                q.visual = _kitTwin('division', _ldPayload, { join: '' });
                // `long-div-kit`, not 'long-division': screen-cell.js redraws 'long-division'
                // items with its own quotient-only bracket, which has no work rows.
                q.printFormat = "long-div-kit";
                q.a = dividend;
                q.b = divisor;
                q.options = buildNumericOptions(quotient);
                return;
            }

            // ========================================
            // MULTIPLICATION COMPARISON (Grade 4) - "Times as many"
            // ========================================
            else if (mappedSkill === "mult_comparison") {
                // The "click the numbers you need" variant is a teacher tick now, not a 20% roll (P4).
                if (_responseMode() === 'which-numbers') {
                    const _msc_w = _msc_multComparison(rng);
                    if (_applyMscQuestion(q, _msc_w)) return;
                }

                // Scale with state.range
                const maxBase = Math.max(5, Math.min(Math.floor(Math.sqrt(range)), 20));
                const base = rng(2, maxBase);
                const multiplier = rng(2, Math.min(9, Math.floor(range / base)));
                const product = base * multiplier;

                const namePair = pickTwoNames();
                const item = pickNoun();

                // Randomly decide format
                const format = rng(0, 2);
                if (format === 0) {
                    q.text = `${namePair[0]} has ${base} ${item}. ${namePair[1]} has ${multiplier} times as many. How many ${item} does ${namePair[1]} have?`;
                    q.ans = product;
                    q.hint = `"${multiplier} times as many" means multiply: ${base} \u00D7 ${multiplier} = ${product}`;
                } else if (format === 1) {
                    q.text = `${namePair[0]} has ${base} ${item}. ${namePair[1]} has ${product} ${item}. How many times as many ${item} does ${namePair[1]} have?`;
                    q.ans = multiplier;
                    q.hint = `Divide to find the multiplier: ${product} \u00F7 ${base} = ${multiplier}`;
                } else {
                    q.text = `${namePair[1]} has ${product} ${item}, which is ${multiplier} times as many as ${namePair[0]}. How many ${item} does ${namePair[0]} have?`;
                    q.ans = base;
                    q.hint = `Divide to find the base amount: ${product} \u00F7 ${multiplier} = ${base}`;
                }
                q.answerType = "number";

                // Tape diagram visual: two bars showing multiplier relationship
                const unitW = 36;
                const barH = 36;
                const barGap = 14;
                const topBarW = unitW;
                const bottomBarW = unitW * multiplier;
                const svgW = Math.max(bottomBarW + 120, 280);
                const svgH = barH * 2 + barGap + 80;

                const topColor = "var(--accent-cyan)";
                const bottomColor = "var(--accent-green)";
                const labelColor = "var(--text-bright)";

                // Build segments for bottom bar
                let segments = '';
                for (let i = 0; i < multiplier; i++) {
                    const x = 70 + i * unitW;
                    segments += `<rect x="${x}" y="${30 + barH + barGap}" width="${unitW - 2}" height="${barH}" rx="4" fill="${bottomColor}" opacity="${0.6 + (i % 2) * 0.2}" stroke="${bottomColor}" stroke-width="1"/>`;
                    segments += `<text x="${x + unitW / 2 - 1}" y="${30 + barH + barGap + barH / 2 + 5}" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">${base}</text>`;
                }

                // Brace annotation
                const braceY = 30 + barH * 2 + barGap + 10;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Tape Diagram - Times As Many</div>
                    <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 360)}" style="background:var(--bg-card);border-radius:12px;padding:10px;">
                        <!-- Top bar (base) -->
                        <text x="5" y="${30 + barH / 2 + 5}" font-size="11" font-weight="700" fill="${labelColor}">${namePair[0]}</text>
                        <rect x="70" y="30" width="${topBarW}" height="${barH}" rx="5" fill="${topColor}" opacity="0.85"/>
                        <text x="${70 + topBarW / 2}" y="${30 + barH / 2 + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${base}</text>

                        <!-- Bottom bar (product, segmented) -->
                        <text x="5" y="${30 + barH + barGap + barH / 2 + 5}" font-size="11" font-weight="700" fill="${labelColor}">${namePair[1]}</text>
                        ${segments}

                        <!-- Multiplier label -->
                        <text x="${70 + bottomBarW / 2}" y="${braceY + 5}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--accent-orange);">&times;${multiplier}</text>
                        <line x1="70" y1="${braceY - 4}" x2="${70 + bottomBarW}" y2="${braceY - 4}" stroke="var(--accent-orange)" stroke-width="1.5" stroke-dasharray="4,2"/>

                        <!-- Total label -->
                        <text x="${70 + bottomBarW + 10}" y="${30 + barH + barGap + barH / 2 + 5}" font-size="12" font-weight="700" fill="var(--accent-orange);">= ${format === 0 ? '?' : product}</text>
                    </svg>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                return;
            }

            // Check for new specialized skills first
            else if (mappedSkill === "add_sub_fact_family") {
                // Addition/Subtraction Fact Families (Grade 1, 1.OA.B.3 / 1.OA.C.6).
                //
                // P8 (critic, baseline 2026-09-24):
                // - A FACT family: the whole is within 20 (never 19 + 17 = 36 at Grade 1), and
                //   "within N" bounds the whole, never the parts. Max Number below 20 narrows it.
                // - No doubles (6, 6, 12 printed "6 + 6" twice and "12 − 6" twice) and no part
                //   of 1: a family needs two different parts to have four different facts.
                // - Every item asks all four blanks, and the key gives all four. The old
                //   `showAll` roll keyed 40 % of items with ONE number for four boxes (H1).
                // - No "Numbers: a, b, c" list: the equations already name the numbers, and the
                //   list turned every blank into "copy one of three numbers" (the answers given
                //   away). The pupil completes each fact; the family is the four facts together.
                const ffWhole = Math.max(5, Math.min(range, 20));
                let addend1 = 2, addend2 = 3;
                for (let t = 0; t < 40; t++) {
                    addend1 = rng(2, ffWhole - 2);
                    addend2 = rng(2, ffWhole - addend1);
                    if (addend1 !== addend2) break;
                }
                if (addend1 === addend2) addend2 = addend1 + 1 <= ffWhole - addend1 ? addend1 + 1 : Math.max(2, addend1 - 1);
                const sum = addend1 + addend2;

                // Create all four equations
                const equations = [
                    { text: `${addend1} + ${addend2} = ___`, ans: sum, type: 'add' },
                    { text: `${addend2} + ${addend1} = ___`, ans: sum, type: 'add' },
                    { text: `${sum} − ${addend1} = ___`, ans: addend2, type: 'sub' },
                    { text: `${sum} − ${addend2} = ___`, ans: addend1, type: 'sub' }
                ];

                q.text = `Complete the fact family.`;
                q.ans = equations.map(e => e.ans).join(', ');
                q.answerType = "fact-family";
                q.hint = `These four facts use the same three numbers. Addition and subtraction are related.`;

                q.factFamilyData = {
                    numbers: [addend1, addend2, sum],
                    equations: equations,
                    showAll: true
                };
                q.printFormat = "fact-family-add-sub";
                // The kit's `fact-family` template: the number bond of the three numbers, then the
                // four facts, one unbreakable line each, one box per fact (print, key and screen).
                // The screen twin keeps the `fact-family-input` inputs the checkers read.
                const _ffPayload = { a: addend1, b: addend2 };
                q.cell = { template: 'fact-family', v: 1, payload: _ffPayload };
                q.visual = _kitTwin('fact-family', _ffPayload);
                q.options = [];
                return;
            }
            
            if (mappedSkill === "mult_div_fact_family") {
                // Multiplication/Division Fact Families
                const factor1 = rng(2, 12);
                const factor2 = rng(2, 12);
                const product = factor1 * factor2;
                const isSquare = factor1 === factor2;
                
                // Create equations (2 or 4 depending on square)
                const equations = isSquare ? [
                    { text: `${factor1} × ${factor2} = ___`, ans: product, type: 'mult' },
                    { text: `${product} ÷ ${factor1} = ___`, ans: factor2, type: 'div' }
                ] : [
                    { text: `${factor1} × ${factor2} = ___`, ans: product, type: 'mult' },
                    { text: `${factor2} × ${factor1} = ___`, ans: product, type: 'mult' },
                    { text: `${product} ÷ ${factor1} = ___`, ans: factor2, type: 'div' },
                    { text: `${product} ÷ ${factor2} = ___`, ans: factor1, type: 'div' }
                ];
                
                // NOTATION (was: a notation picked per equation, so ONE cell could hold a bare
                // ÷, a fraction bar and a bracket at once — catalogue mult-div-integers.md).
                // One notation for the whole family now, chosen by the teacher. It governs only
                // the ÷ equations; the × ones have a single form.
                const _ffNotation = notationFor('÷');
                const notation = _ffNotation === 'across' ? 'symbol' : _ffNotation;
                q.notation = _ffNotation;
                equations.forEach(eq => {
                    if (eq.type === 'div') {
                        if (notation === 'fraction') {
                            eq.displayText = `<div style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;"><span style="border-bottom:2px solid currentColor;padding:0 5px;">${product}</span><span style="padding:0 5px;">${eq.text.includes(`÷ ${factor1}`) ? factor1 : factor2}</span></div> = ___`;
                        } else if (notation === 'bracket') {
                            const divisor = eq.text.includes(`÷ ${factor1}`) ? factor1 : factor2;
                            eq.displayText = `<span style="margin-right:2px;">${divisor}</span><span style="border-top:2px solid currentColor;border-left:2px solid currentColor;padding:2px 8px;border-top-left-radius:5px;">${product}</span> = ___`;
                        } else {
                            eq.displayText = eq.text;
                        }
                        // P11: print reads eq.text (fact-family-mult-div), so the ticked notation
                        // is written there too: the printed family matches the screen one.
                        if (notation === 'fraction' || notation === 'bracket') eq.text = eq.displayText;
                    } else {
                        eq.displayText = eq.text;
                    }
                });
                
                q.text = `Fact Family: ${factor1}, ${factor2}, ${product}${isSquare ? ' (square number)' : ''}`;
                q.ans = equations.map(e => e.ans).join(', ');
                q.answerType = "fact-family";
                q.hint = `Multiplication and division are related! ${factor1} × ${factor2} = ${product}, so ${product} ÷ ${factor1} = ${factor2}`;
                
                q.factFamilyData = {
                    numbers: [factor1, factor2, product],
                    equations: equations,
                    isSquare: isSquare
                };
                q.printFormat = "fact-family-mult-div";
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.2rem;">Multiplication/Division Fact Family</div>
                    <div style="font-size:1.5rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${factor1}</span>, <span style="color:var(--accent-cyan);">${factor2}</span>, <span style="color:var(--accent-green);">${product}</span>
                        ${isSquare ? '<span style="font-size:0.9rem;color:var(--text-dim);"> (square)</span>' : ''}
                    </div>
                    <div style="display:grid;grid-template-columns:${isSquare ? '1fr' : '1fr 1fr'};gap:14px;max-width:${isSquare ? '260px' : '500px'};margin:0 auto;">
                        ${equations.map((eq, i) => `<div style="padding:14px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${eq.type === 'mult' ? 'var(--accent-green)' : 'var(--accent-orange)'};">
                            <div style="font-size:1.4rem;">${(eq.displayText || eq.text).replace('___', '<input type="text" class="fact-family-input" data-eq="' + i + '" data-answer="' + eq.ans + '" style="width:60px;height:38px;border:2px solid var(--accent-cyan);border-radius:4px;text-align:center;font-size:1.3rem;background:var(--bg-card-light);" placeholder="?">')}</div>
                        </div>`).join('')}
                    </div>
                </div>`;
                q.options = [];
                return;
            }
            
            // ========================================
            // NUMBER FAMILIES - ENHANCED IMPLEMENTATION
            // ========================================
            
            // Addition/Subtraction Number Families with difficulty levels
            if (mappedSkill.startsWith("number_families_add")) {
                const isEasy = mappedSkill === "number_families_add";
                const isMedium = mappedSkill === "number_families_add_med";
                const isHard = mappedSkill === "number_families_add_hard";
                
                // P12 (the P-1 split): `band` bounds the SUM at every support level ("Numbers to
                // 20" = each addend to 10, so the sum is at most 20), and the level (the branch)
                // owns only which boxes are blank. The default, 20, is the old level-2 draw.
                const maxNum = Math.max(1, Math.floor(_p12FamilyBand('number_families_add', 20, [10, 20, 40, 100]) / 2));
                const addend1 = rng(1, maxNum);
                const addend2 = rng(1, maxNum);
                const sum = addend1 + addend2;
                
                // Create the four equations with consistent structure
                // Each equation: [num1, op, num2, equals, result]
                const familyData = {
                    a: addend1,
                    b: addend2,
                    c: sum,
                    equations: [
                        { nums: [addend1, addend2, sum], op: '+', type: 'add' },
                        { nums: [addend2, addend1, sum], op: '+', type: 'add' },
                        { nums: [sum, addend1, addend2], op: '−', type: 'sub' },
                        { nums: [sum, addend2, addend1], op: '−', type: 'sub' }
                    ]
                };
                
                // Determine which positions to hide based on difficulty
                // Each equation has 3 positions: [0, 1, 2] for the three numbers
                let missingPositions = [];
                
                if (isEasy) {
                    // Easy: 1-2 numbers missing total, always the result
                    familyData.equations.forEach((eq, idx) => {
                        missingPositions.push([2]); // Only result missing
                    });
                } else if (isMedium) {
                    // Medium: Multiple missing numbers - vary by position
                    familyData.equations.forEach((eq, idx) => {
                        if (idx === 0) missingPositions.push([0, 2]); // First num and result
                        else if (idx === 1) missingPositions.push([1, 2]); // Second num and result
                        else if (idx === 2) missingPositions.push([1, 2]); // Second num and result
                        else missingPositions.push([0, 2]); // First num and result
                    });
                } else {
                    // Hard: All numbers missing
                    familyData.equations.forEach(() => {
                        missingPositions.push([0, 1, 2]);
                    });
                }
                
                familyData.missingPositions = missingPositions;
                
                // Generate visual with aligned columns
                const createInputBox = (value, eqIdx, posIdx, isMissing) => {
                    if (isMissing) {
                        return `<input type="text" class="number-family-input" data-eq="${eqIdx}" data-pos="${posIdx}" data-answer="${value}" style="width:60px;height:44px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.4rem;font-weight:600;background:var(--bg-card-light);color:var(--text);" placeholder="?">`;
                    } else {
                        return `<span style="display:inline-block;width:60px;height:44px;line-height:44px;text-align:center;font-size:1.4rem;font-weight:700;color:var(--text);">${value}</span>`;
                    }
                };

                let equationsHTML = familyData.equations.map((eq, eqIdx) => {
                    const missing = missingPositions[eqIdx];
                    const borderColor = eq.type === 'add' ? 'var(--accent-green)' : 'var(--accent-orange)';

                    return `<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${borderColor};">
                        ${createInputBox(eq.nums[0], eqIdx, 0, missing.includes(0))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">${eq.op}</span>
                        ${createInputBox(eq.nums[1], eqIdx, 1, missing.includes(1))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">=</span>
                        ${createInputBox(eq.nums[2], eqIdx, 2, missing.includes(2))}
                    </div>`;
                }).join('');

                q.text = `Number Family: Complete all equations`;
                q.ans = `${addend1}, ${addend2}, ${sum}`;
                q.answerType = "number-family";
                q.hint = `These three numbers (${addend1}, ${addend2}, ${sum}) make a number family! Addition and subtraction are related.`;

                q.numberFamilyData = {
                    ...familyData,
                    operationType: 'add_sub',
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-add-sub";

                const difficultyLabel = isEasy ? 'Easy' : isMedium ? 'Medium' : 'Hard';

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.2rem;">Addition/Subtraction Number Family <span style="font-size:0.95rem;">(${difficultyLabel})</span></div>
                    <div style="font-size:1.5rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${addend1}</span>, <span style="color:var(--accent-cyan);">${addend2}</span>, <span style="color:var(--accent-green);">${sum}</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;max-width:420px;margin:0 auto;">
                        ${equationsHTML}
                    </div>
                    <div style="margin-top:15px;">
                        <button onclick="checkNumberFamily()" style="padding:10px 25px;background:var(--accent-green);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">✓ Check Answers</button>
                    </div>
                    <div id="numberFamilyFeedback" style="margin-top:12px;font-weight:600;"></div>
                </div>`;
                q.options = [];
                return;
            }
            
            // Multiplication/Division Number Families with difficulty levels
            if (mappedSkill.startsWith("number_families_mult")) {
                const isEasy = mappedSkill === "number_families_mult";
                const isMedium = mappedSkill === "number_families_mult_med";
                const isHard = mappedSkill === "number_families_mult_hard";
                
                // P12 (the P-1 split): `band` is the largest table (5 × 5, 10 × 10, 12 × 12) at every
                // support level; the level (the branch) owns only which boxes are blank.
                const maxFactor = { 25: 5, 100: 10, 144: 12 }[_p12FamilyBand('number_families_mult', 25, [25, 100, 144])] || 5;
                const factor1 = rng(2, maxFactor);
                const factor2 = rng(2, maxFactor);
                const product = factor1 * factor2;
                const isSquare = factor1 === factor2;
                
                // Create equations (2 for squares, 4 for non-squares)
                const familyData = {
                    a: factor1,
                    b: factor2,
                    c: product,
                    isSquare: isSquare,
                    equations: isSquare ? [
                        { nums: [factor1, factor2, product], op: '×', type: 'mult' },
                        { nums: [product, factor1, factor2], op: '÷', type: 'div' }
                    ] : [
                        { nums: [factor1, factor2, product], op: '×', type: 'mult' },
                        { nums: [factor2, factor1, product], op: '×', type: 'mult' },
                        { nums: [product, factor1, factor2], op: '÷', type: 'div' },
                        { nums: [product, factor2, factor1], op: '÷', type: 'div' }
                    ]
                };
                
                // Determine missing positions based on difficulty
                let missingPositions = [];
                
                if (isEasy) {
                    // Easy: Only result missing
                    familyData.equations.forEach(() => {
                        missingPositions.push([2]);
                    });
                } else if (isMedium) {
                    // Medium: Multiple missing
                    familyData.equations.forEach((eq, idx) => {
                        if (eq.type === 'mult') {
                            missingPositions.push(idx % 2 === 0 ? [0, 2] : [1, 2]);
                        } else {
                            missingPositions.push(idx % 2 === 0 ? [1, 2] : [0, 2]);
                        }
                    });
                } else {
                    // Hard: All missing
                    familyData.equations.forEach(() => {
                        missingPositions.push([0, 1, 2]);
                    });
                }
                
                familyData.missingPositions = missingPositions;
                
                // Generate visual
                const createInputBox = (value, eqIdx, posIdx, isMissing) => {
                    if (isMissing) {
                        return `<input type="text" class="number-family-input" data-eq="${eqIdx}" data-pos="${posIdx}" data-answer="${value}" style="width:60px;height:44px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.4rem;font-weight:600;background:var(--bg-card-light);color:var(--text);" placeholder="?">`;
                    } else {
                        return `<span style="display:inline-block;width:60px;height:44px;line-height:44px;text-align:center;font-size:1.4rem;font-weight:700;color:var(--text);">${value}</span>`;
                    }
                };

                let equationsHTML = familyData.equations.map((eq, eqIdx) => {
                    const missing = missingPositions[eqIdx];
                    const borderColor = eq.type === 'mult' ? 'var(--accent-green)' : 'var(--accent-orange)';

                    return `<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${borderColor};">
                        ${createInputBox(eq.nums[0], eqIdx, 0, missing.includes(0))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">${eq.op}</span>
                        ${createInputBox(eq.nums[1], eqIdx, 1, missing.includes(1))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">=</span>
                        ${createInputBox(eq.nums[2], eqIdx, 2, missing.includes(2))}
                    </div>`;
                }).join('');

                q.text = `Number Family: Complete all equations`;
                q.ans = `${factor1}, ${factor2}, ${product}`;
                q.answerType = "number-family";
                q.hint = `These three numbers (${factor1}, ${factor2}, ${product}) make a number family! Multiplication and division are related.`;

                q.numberFamilyData = {
                    ...familyData,
                    operationType: 'mult_div',
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-mult-div";

                const difficultyLabel = isEasy ? 'Easy' : isMedium ? 'Medium' : 'Hard';

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.2rem;">Multiplication/Division Number Family <span style="font-size:0.95rem;">(${difficultyLabel})</span>${isSquare ? ' <span style="font-size:0.9rem;color:var(--text-dim);">(square)</span>' : ''}</div>
                    <div style="font-size:1.5rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Numbers: <span style="color:var(--accent-orange);">${factor1}</span>, <span style="color:var(--accent-cyan);">${factor2}</span>, <span style="color:var(--accent-green);">${product}</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;max-width:420px;margin:0 auto;">
                        ${equationsHTML}
                    </div>
                    <div style="margin-top:15px;">
                        <button onclick="checkNumberFamily()" style="padding:10px 25px;background:var(--accent-green);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">✓ Check Answers</button>
                    </div>
                    <div id="numberFamilyFeedback" style="margin-top:12px;font-weight:600;"></div>
                </div>`;
                q.options = [];
                return;
            }
            
            // Mixed Number Families - ALL 4 Operations (Easy/Medium/Hard)
            // Shows addition, subtraction, multiplication, AND division in one problem
            if (mappedSkill.startsWith("number_families_mixed")) {
                const isEasy = mappedSkill === "number_families_mixed";
                const isMedium = mappedSkill === "number_families_mixed_med";
                const isHard = mappedSkill === "number_families_mixed_hard";
                
                // Pick two numbers that work well for all operations
                // P12 (the P-1 split): `band` owns the number size at every support level, and the
                // level (the branch) owns only which boxes are blank. Read off the raw options:
                // the level router has swapped state.skill to a retired branch id by now.
                const maxNum = _p12FamilyBand('number_families_mixed', 5, [5, 8, 10]);
                const a = rng(2, maxNum);
                const b = rng(2, maxNum);
                const sum = a + b;
                const product = a * b;
                const isSquare = a === b;
                
                // Build ALL equations - addition, subtraction, multiplication, division
                const equations = [];
                
                // Addition equations (2 equations, or 1 if a === b)
                equations.push({ nums: [a, b, sum], op: '+', type: 'add' });
                if (!isSquare) {
                    equations.push({ nums: [b, a, sum], op: '+', type: 'add' });
                }
                
                // Subtraction equations (2 equations)
                equations.push({ nums: [sum, a, b], op: '−', type: 'sub' });
                if (!isSquare) {
                    equations.push({ nums: [sum, b, a], op: '−', type: 'sub' });
                }
                
                // Multiplication equations (2 equations, or 1 if a === b)
                equations.push({ nums: [a, b, product], op: '×', type: 'mult' });
                if (!isSquare) {
                    equations.push({ nums: [b, a, product], op: '×', type: 'mult' });
                }
                
                // Division equations (2 equations)
                equations.push({ nums: [product, a, b], op: '÷', type: 'div' });
                if (!isSquare) {
                    equations.push({ nums: [product, b, a], op: '÷', type: 'div' });
                }
                
                // Set missing positions based on difficulty
                const missingPositions = [];
                if (isEasy) {
                    // Easy: only answers missing
                    equations.forEach(() => missingPositions.push([2]));
                } else if (isMedium) {
                    // Medium: mix of blanks
                    equations.forEach((eq, idx) => {
                        if (idx % 2 === 0) {
                            missingPositions.push([0, 2]);
                        } else {
                            missingPositions.push([1, 2]);
                        }
                    });
                } else {
                    // Hard: all positions missing
                    equations.forEach(() => missingPositions.push([0, 1, 2]));
                }
                
                const familyData = {
                    a: a,
                    b: b,
                    sum: sum,
                    product: product,
                    isSquare: isSquare,
                    equations: equations,
                    missingPositions: missingPositions,
                    operationType: 'all_four'
                };
                
                // Create input box helper
                const createInputBox = (value, eqIdx, posIdx, isMissing) => {
                    if (isMissing) {
                        return `<input type="text" class="number-family-input" data-eq="${eqIdx}" data-pos="${posIdx}" data-answer="${value}" style="width:60px;height:44px;border:2px solid var(--accent-cyan);border-radius:6px;text-align:center;font-size:1.4rem;font-weight:600;background:var(--bg-card-light);color:var(--text);" placeholder="?">`;
                    }
                    return `<span style="font-size:1.4rem;font-weight:700;width:60px;text-align:center;display:inline-block;">${value}</span>`;
                };

                // Create visual with two columns: Add/Sub on left, Mult/Div on right
                const addSubEqs = equations.filter(eq => eq.type === 'add' || eq.type === 'sub');
                const multDivEqs = equations.filter(eq => eq.type === 'mult' || eq.type === 'div');

                const renderEquation = (eq, eqIdx) => {
                    const globalIdx = equations.indexOf(eq);
                    const missing = missingPositions[globalIdx];
                    const borderColor = (eq.type === 'add' || eq.type === 'mult') ? 'var(--accent-green)' : 'var(--accent-orange)';

                    return `<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:10px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${borderColor};">
                        ${createInputBox(eq.nums[0], globalIdx, 0, missing.includes(0))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">${eq.op}</span>
                        ${createInputBox(eq.nums[1], globalIdx, 1, missing.includes(1))}
                        <span style="font-size:1.5rem;font-weight:700;width:28px;text-align:center;">=</span>
                        ${createInputBox(eq.nums[2], globalIdx, 2, missing.includes(2))}
                    </div>`;
                };

                const addSubHTML = addSubEqs.map((eq, idx) => renderEquation(eq, idx)).join('');
                const multDivHTML = multDivEqs.map((eq, idx) => renderEquation(eq, idx)).join('');

                q.text = `Number Family: Complete ALL equations using ${a} and ${b}`;
                q.ans = `${a}, ${b}, ${sum}, ${product}`;
                q.answerType = "number-family";
                q.hint = `Use ${a} and ${b} for all equations! Sum = ${sum}, Product = ${product}`;

                q.numberFamilyData = {
                    ...familyData,
                    difficulty: isEasy ? 'easy' : isMedium ? 'medium' : 'hard'
                };
                q.printFormat = "number-family-all-four";

                const difficultyLabel = isEasy ? 'Easy' : isMedium ? 'Medium' : 'Hard';

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.2rem;">Number Family - All 4 Operations <span style="font-size:0.95rem;">(${difficultyLabel})</span></div>
                    <div style="font-size:1.4rem;font-weight:700;margin-bottom:15px;padding:10px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                        Base Numbers: <span style="color:var(--accent-orange);">${a}</span> and <span style="color:var(--accent-cyan);">${b}</span>
                        <div style="font-size:1rem;color:var(--text-dim);margin-top:5px;">Sum: ${sum} | Product: ${product}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:700px;margin:0 auto;">
                        <div>
                            <div style="font-weight:600;margin-bottom:8px;color:var(--accent-purple);font-size:1.05rem;">+Add/Subtract</div>
                            <div style="display:flex;flex-direction:column;gap:10px;">
                                ${addSubHTML}
                            </div>
                        </div>
                        <div>
                            <div style="font-weight:600;margin-bottom:8px;color:var(--accent-purple);font-size:1.05rem;">Multiply/Divide</div>
                            <div style="display:flex;flex-direction:column;gap:10px;">
                                ${multDivHTML}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top:15px;">
                        <button onclick="checkNumberFamily()" style="padding:10px 25px;background:var(--accent-green);color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">✓ Check Answers</button>
                    </div>
                    <div id="numberFamilyFeedback" style="margin-top:12px;font-weight:600;"></div>
                </div>`;
                q.options = [];
                return;
            }

            // ========================================
            // ARRAYS & EQUAL GROUPS
            // ========================================
            if (mappedSkill === "arrays_groups") {
                // P8 (critic, baseline 2026-09-24). Three item kinds, every one with its picture:
                //   count_all     an array; how many in all
                //   write_mult    an array; ___ rows of ___. ___ in all.
                //   equal_groups  ringed EQUAL GROUPS (the half of the name the old skill never
                //                 drew); ___ groups of ___. ___ in all.
                // The old third kind drew an array and asked how many rows it had, which the
                // picture answered by itself, and the skill's "& Equal Groups" never appeared.
                // Every blank is a boxed slot and the key fills all three (q.keyParts, read by
                // print-sheet.js legacyKeyFill); q.ans stays the total for the single-number
                // checkers. The picture is black line art drawn at a fixed dot pitch (about
                // 9 mm) so 40 dots are still countable, with no caption telling the pupil how.
                // P11 (critic round 2): ONE frame on every item, three slots — ___ rows of ___ (or groups of
                // ___), ___ in all. The count-all item (one slot) is no longer dealt, so the slot set never
                // changes from cell to cell.
                // P12: `forms` deals arrays only or groups only when the teacher narrows it.
                const questionType = ['write_mult', 'equal_groups'][_p12Form(() => _dealRung(2))];
                // Scale array size with range but cap for visual display
                // R3 (critic round 3): 2.OA.4 bounds arrays at 5 rows and 5 columns, whatever the
                // Max Number (5 x 7 and 6 x 4 were dealt at range 100).
                const arrMaxRows = 5;
                const arrMaxCols = 5;
                const rows = rng(2, arrMaxRows);
                const cols = rng(2, arrMaxCols);
                const total = rows * cols;

                if (questionType === 'count_all') {
                    q.text = `How many dots in all?`;
                    q.ans = total;
                    q.hint = `Count the rows and columns. ${rows} rows of ${cols} = ${rows} x ${cols}`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(total);
                } else {
                    const isGroups = questionType === 'equal_groups';
                    // Three inline blanks. For an ARRAY the first two are commutative (rows of
                    // cols, or cols of rows, both describe it); for ringed GROUPS the order is
                    // fixed — so many groups, so many in each.
                    // R3: one sentence with no full stop between the blanks, so a wrapped line
                    // never starts with a stray '.' on screen; the screen instruction says what
                    // the three boxes are for (it was a bare "Solve.").
                    q.text = isGroups
                        ? `___ groups of ___ make ___ in all.`
                        : `___ rows of ___ make ___ in all.`;
                    q.screenInstr = isGroups
                        ? 'Write the groups, the number in each group, and the total.'
                        : 'Write the rows, the number in each row, and the total.';
                    // q.ans stays the product so the single-number worksheet paths still work;
                    // the per-blank acceptance lives in q.inlineBlanksData.
                    q.ans = total;
                    q.keyParts = [String(rows), String(cols), String(total)];
                    q.hint = isGroups
                        ? `Count the groups, then the dots in one group. ${rows} groups of ${cols}: ${rows} x ${cols}`
                        : `There are ${rows} rows, each with ${cols} dots. Multiply ${rows} x ${cols}`;
                    q.answerType = "inline-blanks";
                    q.inlineBlanksData = {
                        acceptedSets: isGroups
                            ? [[String(rows), String(cols), String(total)]]
                            : [
                                [String(rows), String(cols), String(total)],
                                [String(cols), String(rows), String(total)]
                            ],
                        cellWidths: [3, 3, 4]
                    };
                    q.options = [];
                }

                // The kit's `arrays` template: dots of at least 4 mm on a fixed pitch (countable
                // at any column count), equal groups ringed in a subitisable pattern, and one box
                // per blank, all keyed. The screen twin draws the same picture.
                const _agPayload = { kind: questionType, rows, cols };
                q.cell = { template: 'arrays', v: 1, payload: _agPayload };
                q.visual = _kitTwin('arrays', _agPayload);
                q.printFormat = 'arrays-groups';
                q.skillLabel = 'Arrays';
                return;
            }

            // ========================================
            // MULTIPLICATION PROPERTIES
            // ========================================
            if (mappedSkill === "mult_properties") {
                // P12: `forms` picks which properties are dealt (0 order, 1 distributive,
                // 2 identity, 3 zero); untouched, one is picked at random as before.
                const _mpTypes = ['commutative', 'distributive', 'identity', 'zero'];
                const _mpForms = _p12Narrowed('forms');
                const propType = _mpForms ? _mpTypes[_mpForms[_dealRung(_mpForms.length)]] : pick(_mpTypes);

                if (propType === 'commutative') {
                    const a = rng(2, 9);
                    const b = rng(2, 9);
                    const product = a * b;
                    q.text = `If ${a} x ${b} = ${product}, what is ${b} x ${a}?`;
                    q.ans = product;
                    q.a = b; q.b = a; q.op = '×';
                    q.hint = `Commutative property: changing the order doesn't change the product. ${a} x ${b} = ${b} x ${a}`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(product);

                    // Two arrays side by side (original and rotated)
                    const dotR = 18;
                    const gap = 48;
                    const pad = 34;
                    const w1 = pad * 2 + (b - 1) * gap + dotR * 2;
                    const h1 = pad * 2 + (a - 1) * gap + dotR * 2;
                    const w2 = pad * 2 + (a - 1) * gap + dotR * 2;
                    const h2 = pad * 2 + (b - 1) * gap + dotR * 2;

                    let dots1 = '';
                    for (let r = 0; r < a; r++) {
                        for (let c = 0; c < b; c++) {
                            dots1 += `<circle cx="${pad + dotR + c * gap}" cy="${pad + dotR + r * gap}" r="${dotR}" fill="var(--accent-green)" stroke="var(--text-bright)" stroke-width="1"/>`;
                        }
                    }
                    let dots2 = '';
                    for (let r = 0; r < b; r++) {
                        for (let c = 0; c < a; c++) {
                            dots2 += `<circle cx="${pad + dotR + c * gap}" cy="${pad + dotR + r * gap}" r="${dotR}" fill="var(--accent-orange)" stroke="var(--text-bright)" stroke-width="1"/>`;
                        }
                    }

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Commutative Property</div>
                        <div style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;">
                            <div>
                                <div style="font-size:0.9rem;margin-bottom:5px;color:var(--accent-green);">${a} x ${b}</div>
                                <svg width="${w1}" height="${h1}" viewBox="0 0 ${w1} ${h1}" style="max-width:100%;">
                                    <rect x="0" y="0" width="${w1}" height="${h1}" rx="8" fill="var(--bg-card)" stroke="var(--accent-green)" stroke-width="2"/>
                                    ${dots1}
                                </svg>
                            </div>
                            <div style="font-size:1.5rem;font-weight:700;color:var(--text-dim);">=</div>
                            <div>
                                <div style="font-size:0.9rem;margin-bottom:5px;color:var(--accent-orange);">${b} x ${a}</div>
                                <svg width="${w2}" height="${h2}" viewBox="0 0 ${w2} ${h2}" style="max-width:100%;">
                                    <rect x="0" y="0" width="${w2}" height="${h2}" rx="8" fill="var(--bg-card)" stroke="var(--accent-orange)" stroke-width="2"/>
                                    ${dots2}
                                </svg>
                            </div>
                        </div>
                        <div style="margin-top:8px;font-size:0.9rem;color:var(--text-dim);">Same product, different order!</div>
                    </div>`;

                } else if (propType === 'distributive') {
                    const a = rng(3, 8);
                    const splitPart = rng(1, a - 1);
                    const b = rng(2, 9);
                    const missingPart = a - splitPart;
                    const product = a * b;
                    q.text = `${a} x ${b} = ${splitPart} x ${b} + ___ x ${b}. What is the missing number?`;
                    q.ans = missingPart;
                    q.hint = `Distributive property: ${a} x ${b} = (${splitPart} + ?) x ${b}. Since ${splitPart} + ${missingPart} = ${a}, the missing number is ${missingPart}`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(missingPart);

                    // Array split into two parts with dotted line
                    const dotR = 18;
                    const gap = 48;
                    const pad = 34;
                    const totalCols = b;
                    const svgW = pad * 2 + (totalCols - 1) * gap + dotR * 2;
                    const svgH = pad * 2 + (a - 1) * gap + dotR * 2;

                    let splitDots = '';
                    for (let r = 0; r < a; r++) {
                        for (let c = 0; c < totalCols; c++) {
                            const color = r < splitPart ? 'var(--accent-green)' : 'var(--accent-orange)';
                            splitDots += `<circle cx="${pad + dotR + c * gap}" cy="${pad + dotR + r * gap}" r="${dotR}" fill="${color}" stroke="var(--text-bright)" stroke-width="1"/>`;
                        }
                    }
                    // Dotted line between the two sections
                    const lineY = pad + splitPart * gap;
                    splitDots += `<line x1="${pad - 5}" y1="${lineY}" x2="${svgW - pad + 5}" y2="${lineY}" stroke="var(--text-bright)" stroke-width="2" stroke-dasharray="6,4"/>`;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Distributive Property</div>
                        <div style="margin-bottom:8px;font-size:1.1rem;">${a} x ${b} = <span style="color:var(--accent-green);">${splitPart} x ${b}</span> + <span style="color:var(--accent-orange);">? x ${b}</span></div>
                        <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;">
                            <rect x="0" y="0" width="${svgW}" height="${svgH}" rx="8" fill="var(--bg-card)" stroke="var(--accent-cyan)" stroke-width="2"/>
                            ${splitDots}
                        </svg>
                        <div style="display:flex;justify-content:center;gap:15px;margin-top:8px;font-size:0.85rem;">
                            <span style="color:var(--accent-green);">${splitPart} rows</span>
                            <span style="color:var(--accent-orange);">? rows</span>
                        </div>
                    </div>`;

                } else if (propType === 'identity') {
                    const num = rng(2, 12);
                    const order = pick(['num_first', 'one_first']);
                    if (order === 'num_first') {
                        q.text = `What is ${num} x 1?`;
                    } else {
                        q.text = `What is 1 x ${num}?`;
                    }
                    q.ans = num;
                    q.hint = `Identity property: Any number times 1 equals itself. ${num} x 1 = ${num}`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(num);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Identity Property</div>
                        <div style="font-size:1.3rem;padding:15px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                            <span style="color:var(--accent-green);font-weight:700;">${num}</span>
                            <span style="margin:0 8px;">x</span>
                            <span style="color:var(--accent-orange);font-weight:700;">1</span>
                            <span style="margin:0 8px;">=</span>
                            <span style="color:var(--accent-cyan);font-weight:700;">?</span>
                        </div>
                        <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">Any number x 1 = that number</div>
                    </div>`;

                } else {
                    // zero property
                    const num = rng(1, 12);
                    const order = pick(['num_first', 'zero_first']);
                    if (order === 'num_first') {
                        q.text = `What is ${num} x 0?`;
                    } else {
                        q.text = `What is 0 x ${num}?`;
                    }
                    q.ans = 0;
                    q.hint = `Zero property: Any number times 0 equals 0. ${num} x 0 = 0`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(0);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Zero Property</div>
                        <div style="font-size:1.3rem;padding:15px;background:var(--bg-card);border-radius:10px;display:inline-block;">
                            <span style="color:var(--accent-green);font-weight:700;">${num}</span>
                            <span style="margin:0 8px;">x</span>
                            <span style="color:var(--accent-orange);font-weight:700;">0</span>
                            <span style="margin:0 8px;">=</span>
                            <span style="color:var(--accent-cyan);font-weight:700;">?</span>
                        </div>
                        <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">Any number x 0 = 0</div>
                    </div>`;
                }

                // P12: `pictures` off prints the question alone, without the arrays and the
                // property's name (the name is a hint: it tells the pupil which rule to use).
                if (_opt('pictures') === false) q.visual = '';
                q.printFormat = 'mult-properties';
                q.skillLabel = 'Mult Properties';
                return;
            }

            // MULTIPLICATION CHART (mult_chart, mult_chart_easy and the retired _medium / _hard ids):
            // see gen-mult-patterns.js genMultChart, dispatched at the top of generateOperationsQuestion.

            // ========================================
            // DIVISION WITH REMAINDERS
            // ========================================
            if (mappedSkill === "div_remainders") {
                // P8 (critic, baseline 2026-09-24): this is the VISUAL remainder skill, so every
                // item has a picture the pupil can actually use. The old draw ran the dividend to
                // Max Number (44 groups of 2, 1 mm counters) and drew the picture SOLVED — ringed
                // groups labelled with their size, the leftovers boxed "R 6" and a caption
                // "Remainder: 6" — so the pupil read the answer off the page. Now: divisor 2-9,
                // quotient 2-9 (at most nine groups to ring), a remainder from 1 up to
                // divisor − 1 (so remainder = divisor − 1, the "one more would make a group"
                // case, appears), and the counters are drawn UNGROUPED in rows of ten. The pupil
                // rings the groups and counts what is left.
                // Divisor and quotient 2-6 keep every picture countable (at most 41 counters, four
                // rows of whole groups); the remainder still reaches divisor - 1.
                // P12: a changed `constant` ("Divide by", 2-9) picks the divisor; above 6 the
                // quotient shrinks so the picture stays at 41 counters or fewer.
                const divisor = _p12Constant() || rng(2, 6);
                const quotient = rng(2, Math.max(2, Math.min(6, Math.floor((41 - (divisor - 1)) / divisor))));
                const remainder = rng(1, divisor - 1);
                const dividend = divisor * quotient + remainder;

                q.text = `Ring groups of ${divisor}. Write the quotient and the remainder.`;
                q.ans = `${quotient} R ${remainder}`;
                q.a = dividend; q.b = divisor; q.op = '÷';
                q.answerType = "text";
                // Quotient + remainder pair so answer-check can do a flexible
                // numeric comparison (accepts "8R3", "8 R3", "8 r 3", etc.).
                q.quotientRemainder = { quotient, remainder };
                // Pre-baked accepted strings (also still works via flexible parser).
                q.acceptedAnswers = [
                    `${quotient} R ${remainder}`,
                    `${quotient}R${remainder}`,
                    `${quotient} R${remainder}`,
                    `${quotient}R ${remainder}`,
                    `${quotient} r ${remainder}`,
                    `${quotient}r${remainder}`,
                    `${quotient} r${remainder}`,
                    `${quotient}r ${remainder}`,
                    `${quotient} remainder ${remainder}`,
                    `${quotient} rem ${remainder}`,
                    `${quotient} rem. ${remainder}`
                ];
                q.hint = `Divide ${dividend} by ${divisor}. How many full groups of ${divisor}? What's left over? ${divisor} × ${quotient} = ${quotient * divisor}, remainder = ${dividend} - ${quotient * divisor} = ${remainder}`;

                // The kit's `remainder` template: loose open counters in rows that are a whole
                // number of groups, 7 mm apart so every ring can be drawn, and the answer as two
                // boxes, "[q] R [r]" (VA-62). On screen the two boxes are typed and compose
                // "q R r" (data-mq-join), which is q.ans.
                const _drPayload = { dividend, divisor };
                q.printText = `Ring groups of ${divisor}.`;
                q.cell = { template: 'remainder', v: 1, payload: _drPayload };
                q.visual = _kitTwin('remainder', _drPayload);
                q.printFormat = 'div-remainders';
                q.skillLabel = 'Div Remainders';
                q.options = [];
                return;
            }

            if (mappedSkill === "missing_add_sub") {
                // Missing Numbers - Addition/Subtraction
                const positions = ['first_add', 'second_add', 'sum', 'minuend', 'subtrahend', 'difference'];
                const position = pick(positions);
                const missingMax = Math.max(10, range);
                const missingHalf = Math.max(5, Math.floor(range / 2));
                const useDec = state.decimalPlaces > 0;
                const dp = state.decimalPlaces;

                let a, b, c, text, ans;

                if (position === 'first_add') {
                    b = rng(1, missingHalf);
                    c = rng(b + 1, missingMax);
                    if (useDec) { b = applyDecimals(b); c = applyDecimals(c); if (c <= b) c = parseFloat((b + 1).toFixed(dp)); }
                    a = useDec ? parseFloat((c - b).toFixed(dp)) : c - b;
                    text = `___ + ${b} = ${c}`;
                    ans = a;
                } else if (position === 'second_add') {
                    a = rng(1, missingHalf);
                    c = rng(a + 1, missingMax);
                    if (useDec) { a = applyDecimals(a); c = applyDecimals(c); if (c <= a) c = parseFloat((a + 1).toFixed(dp)); }
                    b = useDec ? parseFloat((c - a).toFixed(dp)) : c - a;
                    text = `${a} + ___ = ${c}`;
                    ans = b;
                } else if (position === 'sum') {
                    a = rng(1, missingHalf);
                    b = rng(1, missingHalf);
                    if (useDec) { a = applyDecimals(a); b = applyDecimals(b); }
                    c = useDec ? parseFloat((a + b).toFixed(dp)) : a + b;
                    text = `${a} + ${b} = ___`;
                    ans = c;
                } else if (position === 'minuend') {
                    b = rng(1, missingHalf);
                    c = rng(1, missingHalf);
                    if (useDec) { b = applyDecimals(b); c = applyDecimals(c); }
                    a = useDec ? parseFloat((b + c).toFixed(dp)) : b + c;
                    text = `___ − ${b} = ${c}`;
                    ans = a;
                } else if (position === 'subtrahend') {
                    a = rng(10, missingMax);
                    c = rng(1, a - 1);
                    if (useDec) { a = applyDecimals(a); c = applyDecimals(c); if (c >= a) c = parseFloat((a - 1).toFixed(dp)); }
                    b = useDec ? parseFloat((a - c).toFixed(dp)) : a - c;
                    text = `${a} − ___ = ${c}`;
                    ans = b;
                } else { // difference
                    a = rng(10, missingMax);
                    b = rng(1, a - 1);
                    if (useDec) { a = applyDecimals(a); b = applyDecimals(b); if (b >= a) b = parseFloat((a - 1).toFixed(dp)); }
                    c = useDec ? parseFloat((a - b).toFixed(dp)) : a - b;
                    text = `${a} − ${b} = ___`;
                    ans = c;
                }

                q.text = text;
                q.ans = ans;
                q.hint = position.includes('add') || position === 'sum'
                    ? `Think: What number makes this addition true?`
                    : `Think: What number makes this subtraction true?`;
                q.missingNumberData = { position, a, b, c };
                q.printFormat = "missing-number";
                q.options = buildNumericOptions(ans);
                return;
            }

            // ========================================
            // CLOZE_ADDITION (DEMO: inline-cloze primitive)
            // "_ + _ = sum" — student picks each addend from a dropdown.
            // Demonstrates the reusable inline-cloze answer type. Uses
            // q.clozeOptions = [[choices for blank 0], [choices for blank 1]]
            // and q.ans = [correct value for blank 0, correct value for blank 1].
            // ========================================
            if (mappedSkill === "cloze_addition") {
                const sumMax = Math.max(10, Math.min(range, 20));
                const sum = rng(6, sumMax);
                // Pick a valid (a, b) pair where a + b = sum, 1 ≤ a ≤ sum-1
                const a = rng(1, sum - 1);
                const b = sum - a;

                // Build distractor choice lists for each blank. Always include
                // the correct value plus 2 distractors near it; shuffle.
                // P8: the two lists must admit EXACTLY ONE pair that makes the sum. The old
                // lists could hold two ({8, 6, 7} and {5, 7, 6} for 12: 6 + 6 and 7 + 5) and the
                // key named one, so a right answer was marked wrong. A distractor x in list 1 is
                // refused when sum − x is in list 2, and the other way round.
                const _near = (correct, max) => {
                    const out = [];
                    for (let off = -4; off <= 4; off++) {
                        const cand = correct + off;
                        if (off !== 0 && cand >= 1 && cand <= max) out.push(cand);
                    }
                    return shuffle(out);
                };
                const listA = [a], listB = [b];
                for (const x of _near(a, sum)) {
                    if (listA.length >= 3) break;
                    if (sum - x !== b && !listB.includes(sum - x)) listA.push(x);
                }
                for (const y of _near(b, sum)) {
                    if (listB.length >= 3) break;
                    if (!listA.includes(sum - y)) listB.push(y);
                }
                // The banks print INSIDE the cell, each under its own box, and each addend has
                // exactly one box (the kit's `cloze-bank` template; print, key and screen). The
                // bank order is sorted, so no position gives the answer away.
                const banks = [listA.slice().sort((x, y) => x - y), listB.slice().sort((x, y) => x - y)];
                q.text = `Pick one number from each bank to make ${sum}.`;
                q.printText = 'Pick one number from each bank.';
                q.ans = `${a}, ${b}`;
                q.acceptedAnswers = [`${a}, ${b}`, `${a},${b}`, `${a} ${b}`];
                q.keyParts = [String(a), String(b)];
                q.a = a; q.b = b; q.op = '+';
                q.answerType = 'text';
                q.hint = `Pick two numbers that add up to ${sum}.`;
                q.printFormat = 'inline-cloze';   // the worksheet host shows the visual for this format
                q.skillLabel = 'Pick Missing Addends';
                q.options = [];
                const _czPayload = { sum, a, b, banks };
                q.cell = { template: 'cloze-bank', v: 1, payload: _czPayload };
                q.visual = _kitTwin('cloze-bank', _czPayload);
                return;
            }

            if (mappedSkill === "missing_mult_div") {
                // Missing Factors - Multiplication/Division
                const positions = ['first_factor', 'second_factor', 'product', 'dividend', 'divisor', 'quotient'];
                // P11: when the teacher ticks a ÷ notation other than Across alone, the ÷ items are
                // DEALT on alternate cells and the ticked notations are dealt over those ÷ cells
                // only, so every ticked notation reaches the page (three ticked: all three). The
                // default (Across) keeps the old free pick.
                const _mmTicked = (() => {
                    const def = _optDef('notation');
                    const legal = def ? def.values.map(v => v.v) : ['across'];
                    let t = _opt('notation');
                    if (typeof t === 'string') t = [t];
                    t = Array.isArray(t) ? t.filter(v => legal.includes(v)) : [];
                    return t.length ? t : legal.slice();
                })();
                const _mmDeal = !(_mmTicked.length === 1 && _mmTicked[0] === 'across');
                const _mmAt = _optAt();
                const position = !_mmDeal ? pick(positions)
                    : (_mmAt % 2 === 0 ? pick(['dividend', 'divisor', 'quotient']) : pick(['first_factor', 'second_factor', 'product']));
                const _mmNotation = _mmDeal ? _mmTicked[(Math.floor(_mmAt / 2) % _mmTicked.length + _mmTicked.length) % _mmTicked.length] : null;
                // Scale factor range: for range<=100 use 2-12 (times tables), for larger ranges scale up
                const mmFactorMax = range <= 100 ? 12 : Math.min(Math.ceil(Math.sqrt(range)), 25);

                let a, b, c, text, ans, displayText;

                if (position === 'first_factor') {
                    b = rng(2, mmFactorMax);
                    c = rng(2, mmFactorMax) * b;
                    a = c / b;
                    text = `___ × ${b} = ${c}`;
                    ans = a;
                } else if (position === 'second_factor') {
                    a = rng(2, mmFactorMax);
                    c = a * rng(2, mmFactorMax);
                    b = c / a;
                    text = `${a} × ___ = ${c}`;
                    ans = b;
                } else if (position === 'product') {
                    a = rng(2, mmFactorMax);
                    b = rng(2, mmFactorMax);
                    c = a * b;
                    text = `${a} × ${b} = ___`;
                    ans = c;
                } else if (position === 'dividend') {
                    b = rng(2, mmFactorMax);
                    c = rng(2, mmFactorMax);
                    a = b * c;
                    text = `___ ÷ ${b} = ${c}`;
                    ans = a;
                } else if (position === 'divisor') {
                    c = rng(2, mmFactorMax);
                    b = rng(2, mmFactorMax);
                    a = b * c;
                    text = `${a} ÷ ___ = ${c}`;
                    ans = b;
                } else { // quotient
                    b = rng(2, mmFactorMax);
                    c = rng(2, mmFactorMax);
                    a = b * c;
                    text = `${a} ÷ ${b} = ___`;
                    ans = c;
                }
                
                // Apply division notation variety for division problems.
                // For HTML display, replace ___ placeholders with a styled
                // inline answer-blank so the bare underscores don't render.
                const _blankHtml = '<span class="answer-blank-inline"></span>';
                const _textToHtml = (s) => String(s).replace(/_{3,}/g, _blankHtml);
                if (position === 'dividend' || position === 'divisor' || position === 'quotient') {
                    // NOTATION (was: one of three picked per item, so a single page held all
                    // three — catalogue mult-div-integers.md, "silent type mixing"). The
                    // teacher's choice decides it; 'across' is this skill's bare ÷ sentence.
                    const _mmN = _mmNotation || notationFor('÷');
                    const notation = _mmN === 'across' ? 'symbol' : _mmN;
                    q.notation = _mmN;
                    if (notation === 'fraction') {
                        const dividend = position === 'dividend' ? _blankHtml : a;
                        const divisor = position === 'divisor' ? _blankHtml : b;
                        const quotient = position === 'quotient' ? _blankHtml : c;
                        displayText = `<div style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:5px;"><span style="border-bottom:2px solid currentColor;padding:2px 8px;">${dividend}</span><span style="padding:2px 8px;">${divisor}</span></div> = ${quotient}`;
                    } else if (notation === 'bracket') {
                        const dividend = position === 'dividend' ? _blankHtml : a;
                        const divisor = position === 'divisor' ? _blankHtml : b;
                        const quotient = position === 'quotient' ? _blankHtml : c;
                        displayText = `<span style="margin-right:2px;">${divisor}</span><span style="border-top:2px solid currentColor;border-left:2px solid currentColor;padding:2px 8px;border-top-left-radius:5px;">${dividend}</span> = ${quotient}`;
                    } else {
                        displayText = _textToHtml(text);
                    }
                } else {
                    displayText = _textToHtml(text);
                }

                q.text = text;
                q.ans = ans;
                // Store full equation for solution-display: a OP b = c
                if (position === 'first_factor' || position === 'second_factor' || position === 'product') {
                    q.a = a; q.b = b; q.op = '×';
                    q.missing = position === 'first_factor' ? 'a' : (position === 'second_factor' ? 'b' : null);
                } else {
                    q.a = a; q.b = b; q.op = '÷';
                    q.missing = position === 'dividend' ? 'a' : (position === 'divisor' ? 'b' : null);
                }
                q.hint = position.includes('factor') || position === 'product'
                    ? `Think: What number completes this multiplication?`
                    : `Think: What number completes this division?`;
                q.missingNumberData = { position, a, b, c, displayText };
                q.printFormat = "missing-factor";
                // P11: a ÷ item written on a bracket or a fraction bar prints that way too (the kit's
                // `equation` cell, its ÷ notation branch); Across keeps the one-line legacy cell.
                if ((q.notation === 'bracket' || q.notation === 'fraction') && q.op === '÷') {
                    q.cell = { template: 'equation', v: 1, payload: {
                        a, b, op: '/', result: c, notation: q.notation, digits: String(ans).length,
                        unknown: position === 'dividend' ? 'a' : position === 'divisor' ? 'b' : 'result',
                    } };
                }
                
                q.visual = `<div style="text-align:center;font-size:1.5rem;font-weight:600;margin:20px 0;">
                    ${displayText || text}
                </div>`;
                q.options = buildNumericOptions(ans);
                return;
            }
            
            // Area Model Multiplication
            if (mappedSkill === "area_model_mult") {
                // Generate appropriate numbers for area model
                // Type 1: single digit × 2-digit (e.g., 4 × 16)
                // Type 2: single digit × 3-digit (e.g., 3 × 135)
                // LRU rotation across the two problem-size variants.
                // P12: `tiles` 21 / 31 fixes the size (2- or 3-digit × 1-digit); unset, both rotate.
                const _amT = Number(_opt('tiles'));
                const problemType = _amT === 21 ? '2digit' : _amT === 31 ? '3digit'
                    : (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('area_model_mult', ['2digit', '3digit'], [3, 2])
                    : (Math.random() < 0.6 ? '2digit' : '3digit');
                q._variant = problemType;
                
                let multiplier, multiplicand, parts;
                const colors = ['#5fd4c3', '#f8b878', '#f8a0c8']; // teal, orange, pink
                
                if (problemType === '2digit') {
                    multiplier = rng(2, 9);
                    const tens = rng(1, 9) * 10;
                    const ones = rng(1, 9);
                    multiplicand = tens + ones;
                    parts = [{ value: tens }, { value: ones }];
                } else {
                    multiplier = rng(2, 6);
                    const hundreds = rng(1, 3) * 100;
                    const tens = rng(1, 9) * 10;
                    const ones = rng(1, 9);
                    multiplicand = hundreds + tens + ones;
                    parts = [{ value: hundreds }, { value: tens }, { value: ones }];
                }
                
                const product = multiplier * multiplicand;
                q.ans = product;
                q.text = `Use the area model to find ${multiplier} × ${multiplicand}`;
                q.hint = `Break ${multiplicand} into parts: ${parts.map(p => p.value).join(' + ')}. Multiply each part by ${multiplier}, then add the results.`;
                q.answerType = "area-model";
                q.areaModelData = { multiplier, multiplicand, parts, product };
                q.printFormat = "area-model-mult";
                
                // Calculate partial products for answers
                const partialProducts = parts.map(p => multiplier * p.value);
                // P8: the key fills every partial product and the total, in slot order.
                q.keyParts = partialProducts.map(String).concat(String(product));

                // The kit's `area-model` template: black line art with a minimum width (labels
                // and part boxes never stack in a narrow column), one box per partial product
                // and one for the total, all keyed. The screen twin keeps the
                // `area-model-input` / `area-model-total` inputs the checkers read.
                const _amPayload = { multiplier, parts: parts.map(p => p.value), product, uid: `am${multiplier}x${multiplicand}` };
                q.cell = { template: 'area-model', v: 1, payload: _amPayload };
                q.visual = _kitTwin('area-model', _amPayload);
                q.options = [];
                return;
            }
            
            // Area Model Multiplication - Hard (2×2 and 2×3 grids)
            if (mappedSkill === "area_model_mult_hard") {
                // Type: 2-digit × 2-digit (2×2 grid) or 2-digit × 3-digit (2×3 grid)
                // LRU-rotated so students see both grid sizes in a fair pattern.
                // P12: `tiles` 22 / 23 fixes the grid (2 × 2 or 2 × 3); unset, both rotate.
                const _amhT = Number(_opt('tiles'));
                const problemType = _amhT === 22 ? '2x2' : _amhT === 23 ? '2x3'
                    : (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('area_model_mult_hard', ['2x2', '2x3'], [3, 2])
                    : (Math.random() < 0.6 ? '2x2' : '2x3');
                q._variant = problemType;
                const colors = [
                    ['#f8e473', '#5fd4c3'],  // Row 1: yellow, teal
                    ['#f8b878', '#f8a0c8']   // Row 2: orange, pink
                ];
                
                let num1, num2, rowParts, colParts;
                
                if (problemType === '2x2') {
                    // 2-digit × 2-digit (e.g., 31 × 29)
                    const tens1 = rng(1, 9) * 10;
                    const ones1 = rng(1, 9);
                    const tens2 = rng(1, 9) * 10;
                    const ones2 = rng(1, 9);
                    num1 = tens1 + ones1;
                    num2 = tens2 + ones2;
                    rowParts = [tens1, ones1];  // Left side (rows)
                    colParts = [tens2, ones2];  // Top (columns)
                } else {
                    // 2-digit × 3-digit (e.g., 24 × 135)
                    const tens1 = rng(1, 9) * 10;
                    const ones1 = rng(1, 9);
                    const hundreds2 = rng(1, 3) * 100;
                    const tens2 = rng(1, 9) * 10;
                    const ones2 = rng(1, 9);
                    num1 = tens1 + ones1;
                    num2 = hundreds2 + tens2 + ones2;
                    rowParts = [tens1, ones1];  // Left side (rows)
                    colParts = [hundreds2, tens2, ones2];  // Top (columns)
                }
                
                const product = num1 * num2;
                q.ans = product;
                q.text = `Use the area model to find ${num1} × ${num2}`;
                q.hint = `Break ${num1} into ${rowParts.join(' + ')} and ${num2} into ${colParts.join(' + ')}. Find each rectangle's area, then add them all.`;
                q.answerType = "area-model";
                q.areaModelData = { 
                    num1, num2, rowParts, colParts, product,
                    isGrid: true,
                    gridType: problemType
                };
                q.printFormat = "area-model-mult-hard";
                
                // Calculate all partial products (row × col)
                const partialProducts = [];
                for (let r = 0; r < rowParts.length; r++) {
                    for (let c = 0; c < colParts.length; c++) {
                        partialProducts.push({
                            row: r,
                            col: c,
                            value: rowParts[r] * colParts[c]
                        });
                    }
                }
                
                const uniqueIdArea = Date.now() + Math.random().toString(36).substr(2, 9);
                const baseBoxWidth = 120; // bumped from 85
                const baseBoxHeight = 105; // bumped from 75
                
                // Generate the 2D grid visual
                q.visual = `<div class="area-model-container" style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${num1} × ${num2}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the area of each rectangle.</div>

                    <!-- Area Model 2D Grid -->
                    <div class="area-model-grid" style="display:inline-block;position:relative;">
                        <!-- Top labels (column values) -->
                        <div style="display:flex;margin-left:45px;margin-bottom:5px;">
                            ${colParts.map((col, c) => {
                                const digitCount = Math.max(...rowParts.map(r => (r * col).toString().length));
                                const cellWidth = baseBoxWidth + (digitCount - 2) * 8;
                                return `<div style="width:${cellWidth}px;text-align:center;font-weight:700;font-size:1.1rem;">${col}</div>`;
                            }).join('')}
                        </div>

                        <!-- Grid rows -->
                        ${rowParts.map((row, r) => {
                            return `
                            <div style="display:flex;align-items:center;${r > 0 ? '' : ''}">
                                <!-- Row label -->
                                <div style="font-weight:700;font-size:1.2rem;margin-right:10px;width:35px;text-align:center;">${row}</div>
                                <!-- Row cells -->
                                <div style="display:flex;border:2px solid #555;${r === 0 ? 'border-radius:4px 4px 0 0;' : 'border-top:none;border-radius:0 0 4px 4px;'}overflow:hidden;">
                                    ${colParts.map((col, c) => {
                                        const partialVal = row * col;
                                        const digitCount = partialVal.toString().length;
                                        const cellWidth = baseBoxWidth + (digitCount - 2) * 8;
                                        const inputWidth = 50 + digitCount * 10;
                                        const colorRow = r % 2;
                                        const colorCol = c % 2;
                                        const bgColor = colors[colorRow][colorCol] || colors[0][0];
                                        return `
                                        <div style="width:${cellWidth}px;height:${baseBoxHeight}px;background:${bgColor};display:flex;align-items:center;justify-content:center;${c > 0 ? 'border-left:2px solid #555;' : ''}">
                                            <input type="text" class="area-model-input" data-area-idx="${uniqueIdArea}-cell-${r}-${c}" data-answer="${partialVal}"
                                                style="width:${inputWidth}px;height:36px;border:2px solid #fff;border-radius:6px;background:rgba(255,255,255,0.9);text-align:center;font-size:1rem;font-weight:600;" placeholder="">
                                        </div>
                                    `}).join('')}
                                </div>
                            </div>`;
                        }).join('')}
                    </div>

                    <!-- Total calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the total area.</div>
                    <div class="area-model-total-row" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${num1} × ${num2} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdArea}-total" data-answer="${product}"
                            style="width:${60 + product.toString().length * 12}px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                return;
            }
            
            // Area Model Division - 2-digit by 1-digit (e.g., 55 ÷ 5)
            if (mappedSkill === "area_model_div_2by1") {
                // Pre-defined friendly division problems for 2-digit ÷ 1-digit
                // Format: [dividend, divisor] where dividend splits into nice parts
                const friendlyProblems = [
                    // Divisor 2: splits into even tens + even ones
                    [24, 2], [36, 2], [48, 2], [52, 2], [64, 2], [76, 2], [84, 2], [96, 2],
                    // Divisor 3: splits into multiples of 3
                    [36, 3], [39, 3], [45, 3], [48, 3], [54, 3], [57, 3], [63, 3], [69, 3], [72, 3], [75, 3], [78, 3], [81, 3], [84, 3], [93, 3], [96, 3],
                    // Divisor 4: splits into multiples of 4  
                    [48, 4], [52, 4], [56, 4], [64, 4], [68, 4], [72, 4], [76, 4], [84, 4], [88, 4], [92, 4], [96, 4],
                    // Divisor 5: splits into multiples of 5
                    [55, 5], [65, 5], [75, 5], [85, 5], [95, 5], [60, 5], [70, 5], [80, 5], [90, 5],
                    // Divisor 6: splits into multiples of 6
                    [42, 6], [48, 6], [54, 6], [66, 6], [72, 6], [78, 6], [84, 6], [96, 6],
                    // Divisor 7: splits into multiples of 7
                    [42, 7], [49, 7], [56, 7], [63, 7], [77, 7], [84, 7], [91, 7], [98, 7],
                    // Divisor 8: splits into multiples of 8
                    [48, 8], [56, 8], [64, 8], [72, 8], [80, 8], [88, 8], [96, 8],
                    // Divisor 9: splits into multiples of 9
                    [45, 9], [54, 9], [63, 9], [72, 9], [81, 9], [90, 9], [99, 9]
                ];
                
                // P12: a changed `constant` ("Divide by") keeps only the problems with that divisor.
                const _am2 = _p12Narrowed('constant');
                const _am2List = _am2 ? friendlyProblems.filter(p => _am2.includes(p[1])) : [];
                const [dividend, divisor] = pick(_am2List.length ? _am2List : friendlyProblems);
                const quotient = dividend / divisor;
                
                // Split into friendly parts (largest multiple of divisor*10 that fits, plus remainder)
                // For example: 55 ÷ 5 → 50 + 5
                const tensBase = Math.floor(dividend / 10) * 10;
                let part1 = Math.floor(tensBase / divisor) * divisor;
                // Make sure part1 is a "round" number when possible
                if (part1 === 0) part1 = divisor * Math.floor(dividend / divisor / 2);
                const part2 = dividend - part1;
                
                const parts = [
                    { value: part1, quotient: part1 / divisor },
                    { value: part2, quotient: part2 / divisor }
                ];
                
                const colors = ['#f8b878', '#f8a0c8']; // orange, pink
                const uniqueIdDiv = Date.now() + Math.random().toString(36).substr(2, 9);
                
                q.ans = quotient;
                q.text = `Use the area model to find ${dividend} ÷ ${divisor}`;
                q.hint = `Break ${dividend} into parts: ${parts[0].value} + ${parts[1].value}. Find what times ${divisor} equals each part, then add.`;
                q.answerType = "area-model-div";
                q.areaModelDivData = { divisor, dividend, quotient, parts };
                q.printFormat = "area-model-div";
                
                // Visual with area model for division
                q.visual = `<div class="area-model-container" style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${dividend} ÷ ${divisor}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the missing side lengths.</div>

                    <!-- Area Model Grid -->
                    <div class="area-model-grid" style="display:inline-block;position:relative;">
                        <!-- Top labels (unknown - to be filled in) -->
                        <div style="display:flex;margin-left:40px;margin-bottom:5px;">
                            ${parts.map((p, i) => `
                                <div style="width:${80 + (i === 0 ? 20 : 0)}px;text-align:center;">
                                    <input type="text" class="area-model-input" data-area-idx="${uniqueIdDiv}-top-${i}" data-answer="${p.quotient}"
                                        style="width:50px;height:28px;border:2px solid #888;border-radius:4px;background:white;text-align:center;font-size:0.95rem;font-weight:600;">
                                </div>
                            `).join('')}
                        </div>

                        <!-- Main grid with divisor on left -->
                        <div style="display:flex;align-items:center;">
                            <div style="font-weight:700;font-size:1.3rem;margin-right:10px;width:30px;text-align:center;">${divisor}</div>
                            <div style="display:flex;border:2px solid #888;border-radius:4px;overflow:hidden;">
                                ${parts.map((p, i) => `
                                    <div style="width:${80 + (i === 0 ? 20 : 0)}px;height:70px;background:${colors[i]};display:flex;align-items:center;justify-content:center;${i > 0 ? 'border-left:2px solid #888;' : ''}">
                                        <span style="font-weight:700;font-size:1.2rem;">${p.value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Quotient calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the quotient.</div>
                    <div class="area-model-total-row" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${dividend} ÷ ${divisor} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdDiv}-total" data-answer="${quotient}"
                            style="width:60px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                return;
            }
            
            // Area Model Division - 3-digit by 1-digit (e.g., 927 ÷ 9)
            if (mappedSkill === "area_model_div_3by1") {
                // Pre-defined friendly division problems for 3-digit ÷ 1-digit
                // Format: [dividend, divisor, part1, part2] - pre-calculated friendly splits
                const friendlyProblems = [
                    // Divisor 2: nice even splits
                    [124, 2, 100, 24], [136, 2, 100, 36], [148, 2, 100, 48], [162, 2, 100, 62], [174, 2, 100, 74], [186, 2, 100, 86],
                    [246, 2, 200, 46], [258, 2, 200, 58], [264, 2, 200, 64], [276, 2, 200, 76],
                    // Divisor 3: multiples of 3
                    [126, 3, 90, 36], [135, 3, 90, 45], [144, 3, 90, 54], [153, 3, 120, 33], [162, 3, 120, 42], [171, 3, 150, 21],
                    [213, 3, 180, 33], [234, 3, 180, 54], [243, 3, 180, 63], [261, 3, 180, 81], [279, 3, 270, 9],
                    // Divisor 4: multiples of 4
                    [124, 4, 80, 44], [136, 4, 80, 56], [148, 4, 120, 28], [156, 4, 120, 36], [168, 4, 120, 48],
                    [212, 4, 160, 52], [236, 4, 200, 36], [248, 4, 200, 48], [264, 4, 200, 64],
                    // Divisor 5: multiples of 5
                    [125, 5, 100, 25], [135, 5, 100, 35], [145, 5, 100, 45], [155, 5, 100, 55], [165, 5, 150, 15],
                    [215, 5, 200, 15], [235, 5, 200, 35], [255, 5, 200, 55], [275, 5, 250, 25], [295, 5, 250, 45],
                    // Divisor 6: multiples of 6
                    [126, 6, 90, 36], [138, 6, 90, 48], [156, 6, 120, 36], [174, 6, 120, 54], [186, 6, 180, 6],
                    [234, 6, 180, 54], [252, 6, 180, 72], [276, 6, 240, 36], [294, 6, 240, 54],
                    // Divisor 7: multiples of 7
                    [126, 7, 70, 56], [147, 7, 70, 77], [168, 7, 140, 28], [189, 7, 140, 49], 
                    [231, 7, 210, 21], [252, 7, 210, 42], [273, 7, 210, 63], [294, 7, 280, 14],
                    // Divisor 8: multiples of 8
                    [128, 8, 80, 48], [152, 8, 80, 72], [168, 8, 160, 8], [184, 8, 160, 24],
                    [232, 8, 160, 72], [248, 8, 240, 8], [264, 8, 240, 24], [296, 8, 240, 56],
                    // Divisor 9: multiples of 9
                    [126, 9, 90, 36], [153, 9, 90, 63], [171, 9, 90, 81], [189, 9, 180, 9],
                    [234, 9, 180, 54], [261, 9, 180, 81], [279, 9, 270, 9], [297, 9, 270, 27]
                ];
                
                // P12: a changed `constant` ("Divide by") keeps only the problems with that divisor.
                const _am3 = _p12Narrowed('constant');
                const _am3List = _am3 ? friendlyProblems.filter(p => _am3.includes(p[1])) : [];
                const problem = pick(_am3List.length ? _am3List : friendlyProblems);
                const dividend = problem[0];
                const divisor = problem[1];
                const part1 = problem[2];
                const part2 = problem[3];
                const quotient = dividend / divisor;
                
                const parts = [
                    { value: part1, quotient: part1 / divisor },
                    { value: part2, quotient: part2 / divisor }
                ];
                
                const colors = ['#f8b878', '#f8a0c8']; // orange, pink
                const uniqueIdDiv3 = Date.now() + Math.random().toString(36).substr(2, 9);
                
                q.ans = quotient;
                q.text = `Use the area model to find ${dividend} ÷ ${divisor}`;
                q.hint = `Break ${dividend} into parts: ${parts[0].value} + ${parts[1].value}. Find what times ${divisor} equals each part, then add.`;
                q.answerType = "area-model-div";
                q.areaModelDivData = { divisor, dividend, quotient, parts };
                q.printFormat = "area-model-div";
                
                // Visual with area model for division
                q.visual = `<div class="area-model-container" style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--text-primary);">Use the model to find <span style="font-size:1.2rem;">${dividend} ÷ ${divisor}</span></div>
                    <div style="font-style:italic;color:var(--text-secondary);margin-bottom:15px;">First, find the missing side lengths.</div>

                    <!-- Area Model Grid -->
                    <div class="area-model-grid" style="display:inline-block;position:relative;">
                        <!-- Top labels (unknown - to be filled in) -->
                        <div style="display:flex;margin-left:40px;margin-bottom:5px;">
                            ${parts.map((p, i) => `
                                <div style="width:${90 + (i === 0 ? 30 : 0)}px;text-align:center;">
                                    <input type="text" class="area-model-input" data-area-idx="${uniqueIdDiv3}-top-${i}" data-answer="${p.quotient}"
                                        style="width:55px;height:28px;border:2px solid #888;border-radius:4px;background:white;text-align:center;font-size:0.95rem;font-weight:600;">
                                </div>
                            `).join('')}
                        </div>

                        <!-- Main grid with divisor on left -->
                        <div style="display:flex;align-items:center;">
                            <div style="font-weight:700;font-size:1.3rem;margin-right:10px;width:30px;text-align:center;">${divisor}</div>
                            <div style="display:flex;border:2px solid #888;border-radius:4px;overflow:hidden;">
                                ${parts.map((p, i) => `
                                    <div style="width:${90 + (i === 0 ? 30 : 0)}px;height:75px;background:${colors[i]};display:flex;align-items:center;justify-content:center;${i > 0 ? 'border-left:2px solid #888;' : ''}">
                                        <span style="font-weight:700;font-size:1.2rem;">${p.value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Quotient calculation -->
                    <div style="margin-top:20px;font-style:italic;color:var(--text-secondary);">Then, find the quotient.</div>
                    <div class="area-model-total-row" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.2rem;font-weight:600;">
                        <span>${dividend} ÷ ${divisor} = </span>
                        <input type="text" class="area-model-total" data-area-idx="${uniqueIdDiv3}-total" data-answer="${quotient}"
                            style="width:70px;height:40px;border:2px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;font-weight:700;">
                    </div>
                </div>`;
                q.options = [];
                return;
            }
            
            // ===== WORD PROBLEMS WITH VISUALS =====
            
            // Addition Word Problems
            if (mappedSkill === "add_word_problems") {
                // The "click the numbers you need" variant is a teacher tick now, not a 20% roll (P4).
                if (_responseMode() === 'which-numbers') {
                    const _msc_w = _msc_addWordProblem(rng);
                    if (_applyMscQuestion(q, _msc_w)) return;
                }

                // [worksheet-feedback §8.3] Expanded context variety: money, distance,
                // time, science, school, food, plus original toy/animal contexts.
                // Each scenario carries a 'category' so templates can adapt phrasing.
                // 'unit' is the noun used after numbers (e.g., "dollars", "miles").
                // 'icon' / 'color' are used for the on-screen visual (toys only show icons).
                const scenarios = [
                    // Original toy/everyday contexts (kept for visual support)
                    { category: 'toy', icon: bwIcon('apples'), unit: 'apples', color: 'pink', context: 'fruit basket' },
                    { category: 'toy', icon: bwIcon('stars'), unit: 'stars', color: 'yellow', context: 'sticker chart' },
                    { category: 'toy', icon: bwIcon('books'), unit: 'books', color: 'blue', context: 'library' },
                    { category: 'toy', icon: bwIcon('cookies'), unit: 'cookies', color: 'orange', context: 'cookie jar' },
                    { category: 'toy', icon: bwIcon('balloons'), unit: 'balloons', color: 'purple', context: 'party' },
                    { category: 'toy', icon: bwIcon('flowers'), unit: 'flowers', color: 'pink', context: 'garden' },
                    { category: 'toy', icon: bwIcon('balls'), unit: 'balls', color: 'orange', context: 'gym' },
                    { category: 'toy', icon: bwIcon('pencils'), unit: 'pencils', color: 'yellow', context: 'desk' },
                    // Money contexts
                    { category: 'money', icon: bwIcon('coins'), unit: 'dollars', color: 'yellow', context: 'piggy bank' },
                    { category: 'money', icon: bwIcon('coins'), unit: 'dollars', color: 'yellow', context: 'wallet' },
                    { category: 'money', icon: bwIcon('coins'), unit: 'cents', color: 'yellow', context: 'jar' },
                    // Distance / measurement contexts
                    { category: 'distance', icon: bwIcon('balls'), unit: 'miles', color: 'blue', context: 'trip' },
                    { category: 'distance', icon: bwIcon('balls'), unit: 'kilometers', color: 'blue', context: 'route' },
                    { category: 'distance', icon: bwIcon('pencils'), unit: 'feet', color: 'blue', context: 'hallway' },
                    // Time contexts
                    { category: 'time', icon: bwIcon('stars'), unit: 'minutes', color: 'purple', context: 'practice' },
                    { category: 'time', icon: bwIcon('stars'), unit: 'hours', color: 'purple', context: 'project' },
                    { category: 'time', icon: bwIcon('stars'), unit: 'days', color: 'purple', context: 'trip' },
                    // Science contexts
                    { category: 'science', icon: bwIcon('flowers'), unit: 'seeds', color: 'pink', context: 'garden bed' },
                    { category: 'science', icon: bwIcon('flowers'), unit: 'plants', color: 'pink', context: 'greenhouse' },
                    { category: 'science', icon: bwIcon('coins'), unit: 'rock samples', color: 'orange', context: 'collection' },
                    // School contexts
                    { category: 'school', icon: bwIcon('books'), unit: 'students', color: 'blue', context: 'class' },
                    { category: 'school', icon: bwIcon('books'), unit: 'books', color: 'blue', context: 'classroom' },
                    { category: 'school', icon: bwIcon('pencils'), unit: 'school supplies', color: 'yellow', context: 'supply closet' },
                    // Food / cooking contexts
                    { category: 'food', icon: bwIcon('cookies'), unit: 'cookies', color: 'orange', context: 'tray' },
                    { category: 'food', icon: bwIcon('apples'), unit: 'servings', color: 'pink', context: 'pot' },
                    { category: 'food', icon: bwIcon('apples'), unit: 'cups of flour', color: 'pink', context: 'recipe' },
                ];

                const scenario = pick(scenarios);
                // Back-compat alias: older code below references scenario.name and scenario.item.
                scenario.name = scenario.unit;
                scenario.item = scenario.icon;
                const [name1, name2] = pickTwoNames();

                // Scale with range setting
                const maxNum = Math.max(10, range);
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('add_word_problems', ["join","start_unknown","part_part_whole"], [1,1,1])
                    : (Math.random() < 0.5 ? 'join' : (Math.random() < 0.5 ? 'start_unknown' : 'part_part_whole'));
                q._variant = roll;
                let a, b, answer;

                if (roll === 'join') {
                    // Type 1: Result-unknown / join — "X and Y, how many altogether?"
                    a = rng(2, maxNum);
                    b = rng(2, maxNum);
                    if (state.decimalPlaces > 0) { a = applyDecimals(a); b = applyDecimals(b); }
                    answer = state.decimalPlaces > 0 ? parseFloat((a + b).toFixed(state.decimalPlaces)) : a + b;
                    let joinTemplates;
                    if (scenario.category === 'money') {
                        joinTemplates = [
                            `${name1} saved ${a} ${scenario.unit}. Then ${name1} earned ${b} more ${scenario.unit}. How many ${scenario.unit} does ${name1} have now?`,
                            `${name1} had ${a} ${scenario.unit} in a ${scenario.context}. ${name2} gave ${name1} ${b} more ${scenario.unit}. What is the total?`,
                        ];
                    } else if (scenario.category === 'distance') {
                        joinTemplates = [
                            `${name1} walked ${a} ${scenario.unit} on Monday. ${name1} walked ${b} ${scenario.unit} on Tuesday. How many ${scenario.unit} did ${name1} walk in all?`,
                            `${name1} ran ${a} ${scenario.unit} in the morning. Then ${name1} ran ${b} more ${scenario.unit}. What is the total distance?`,
                        ];
                    } else if (scenario.category === 'time') {
                        joinTemplates = [
                            `${name1} spent ${a} ${scenario.unit} on a ${scenario.context}. Then ${name1} spent ${b} more ${scenario.unit}. How many ${scenario.unit} in total?`,
                            `A ${scenario.context} took ${a} ${scenario.unit} on day one and ${b} ${scenario.unit} on day two. How many ${scenario.unit} did it take in all?`,
                        ];
                    } else if (scenario.category === 'science') {
                        joinTemplates = [
                            `${name1} planted ${a} ${scenario.unit} in a ${scenario.context}. ${name2} added ${b} more ${scenario.unit}. How many ${scenario.unit} are in the ${scenario.context}?`,
                            `${name1} collected ${a} ${scenario.unit}. ${name2} collected ${b} more ${scenario.unit}. How many ${scenario.unit} are there in all?`,
                        ];
                    } else if (scenario.category === 'school') {
                        joinTemplates = [
                            `A ${scenario.context} has ${a} ${scenario.unit}. ${b} more ${scenario.unit} arrived. How many ${scenario.unit} are there now?`,
                            `${name1} counted ${a} ${scenario.unit}. ${name2} counted ${b} more. How many ${scenario.unit} did they count in all?`,
                        ];
                    } else if (scenario.category === 'food') {
                        joinTemplates = [
                            `${name1} used ${a} ${scenario.unit} for breakfast. ${name1} used ${b} more ${scenario.unit} for lunch. How many ${scenario.unit} did ${name1} use in all?`,
                            `A ${scenario.context} needs ${a} ${scenario.unit}. ${name1} adds ${b} more ${scenario.unit}. How many ${scenario.unit} are needed altogether?`,
                        ];
                    } else {
                        joinTemplates = [
                            `${name1} has ${a} ${scenario.unit}. ${name2} gives ${name1} ${b} more ${scenario.unit}. How many ${scenario.unit} does ${name1} have now?`,
                            `There are ${a} ${scenario.unit} in the ${scenario.context}. ${name1} adds ${b} more. How many ${scenario.unit} are there in all?`,
                            `${name1} picks ${a} ${scenario.unit}. Then ${name1} picks ${b} more. How many ${scenario.unit} did ${name1} pick altogether?`,
                        ];
                    }
                    q.text = pick(joinTemplates);
                    q.hint = `Add the two amounts: ${a} + ${b} = ?`;
                } else if (roll === 'start_unknown') {
                    // Type 2: Compare more — "Sam has X. Mia has Y more than Sam. How many does Mia have?"
                    a = rng(2, maxNum);
                    b = rng(1, Math.max(1, Math.floor(maxNum / 2)));
                    if (state.decimalPlaces > 0) { a = applyDecimals(a); b = applyDecimals(b); }
                    answer = state.decimalPlaces > 0 ? parseFloat((a + b).toFixed(state.decimalPlaces)) : a + b;
                    let compareTemplates;
                    if (scenario.category === 'money') {
                        compareTemplates = [
                            `${name1} saved ${a} ${scenario.unit}. ${name2} saved ${b} more ${scenario.unit} than ${name1}. How many ${scenario.unit} did ${name2} save?`,
                            `${name1} earned ${a} ${scenario.unit} this week. ${name2} earned ${b} more. How many ${scenario.unit} did ${name2} earn?`,
                        ];
                    } else if (scenario.category === 'distance') {
                        compareTemplates = [
                            `${name1} drove ${a} ${scenario.unit}. ${name2} drove ${b} more ${scenario.unit} than ${name1}. How many ${scenario.unit} did ${name2} drive?`,
                            `${name1} ran ${a} ${scenario.unit}. ${name2} ran ${b} more ${scenario.unit}. How many ${scenario.unit} did ${name2} run?`,
                        ];
                    } else if (scenario.category === 'time') {
                        compareTemplates = [
                            `${name1} spent ${a} ${scenario.unit} on homework. ${name2} spent ${b} more ${scenario.unit} than ${name1}. How many ${scenario.unit} did ${name2} spend?`,
                        ];
                    } else if (scenario.category === 'school') {
                        compareTemplates = [
                            `Class A has ${a} ${scenario.unit}. Class B has ${b} more ${scenario.unit} than Class A. How many ${scenario.unit} are in Class B?`,
                        ];
                    } else if (scenario.category === 'food') {
                        compareTemplates = [
                            `${name1}'s recipe uses ${a} ${scenario.unit}. ${name2}'s recipe uses ${b} more ${scenario.unit}. How many ${scenario.unit} does ${name2}'s recipe use?`,
                        ];
                    } else if (scenario.category === 'science') {
                        compareTemplates = [
                            `${name1} grew ${a} ${scenario.unit}. ${name2} grew ${b} more ${scenario.unit} than ${name1}. How many ${scenario.unit} did ${name2} grow?`,
                        ];
                    } else {
                        compareTemplates = [
                            `${name1} has ${a} ${scenario.unit}. ${name2} has ${b} more ${scenario.unit} than ${name1}. How many ${scenario.unit} does ${name2} have?`,
                            `${name1} collected ${a} ${scenario.unit}. ${name2} collected ${b} more than ${name1}. How many did ${name2} collect?`,
                        ];
                    }
                    q.text = pick(compareTemplates);
                    q.hint = `${name2} has more, so add: ${a} + ${b} = ?`;
                } else if (roll < 0.72) {
                    // Type 3: Missing addend — "Sam has X stickers. He needs Y total. How many more?"
                    const part = rng(2, Math.max(3, maxNum - 2));
                    const missing = rng(1, Math.max(1, maxNum - part));
                    a = part;
                    b = part + missing; // b is total needed
                    if (state.decimalPlaces > 0) { a = applyDecimals(a); b = applyDecimals(b); if (b <= a) b = parseFloat((a + 1).toFixed(state.decimalPlaces)); }
                    answer = state.decimalPlaces > 0 ? parseFloat((b - a).toFixed(state.decimalPlaces)) : b - a;
                    let missingTemplates;
                    if (scenario.category === 'money') {
                        missingTemplates = [
                            `${name1} has ${a} ${scenario.unit}. ${name1} needs ${b} ${scenario.unit} in total. How many more ${scenario.unit} does ${name1} need?`,
                            `${name1} saved ${a} ${scenario.unit}. ${name1} wants to save ${b} ${scenario.unit}. How many more ${scenario.unit} does ${name1} need to save?`,
                        ];
                    } else {
                        missingTemplates = [
                            `${name1} has ${a} ${scenario.unit}. ${name1} needs ${b} ${scenario.unit} in total. How many more ${scenario.unit} does ${name1} need?`,
                            `There are ${a} ${scenario.unit} in the ${scenario.context}. ${name1} wants ${b} ${scenario.unit}. How many more are needed?`,
                        ];
                    }
                    q.text = pick(missingTemplates);
                    q.hint = `Find the missing part: ${a} + ? = ${b}. Subtract: ${b} − ${a} = ?`;
                } else if (roll < 0.86) {
                    // Type 4: Start unknown — "Some were in a tree. X more came. Now there are Y. How many at start?"
                    const total = rng(5, maxNum);
                    b = rng(1, total - 1);
                    a = total - b; // a is the unknown start
                    answer = a;
                    const places = ['tree', 'table', 'shelf', 'plate', 'desk'];
                    const place = pick(places);
                    const startTemplates = [
                        `Some ${scenario.unit} were on a ${place}. ${b} more ${scenario.unit} were added. Now there are ${total} ${scenario.unit}. How many were on the ${place} at the start?`,
                        `${name1} had some ${scenario.unit}. ${name2} gave ${name1} ${b} more. Now ${name1} has ${total} ${scenario.unit}. How many did ${name1} have at first?`,
                    ];
                    q.text = pick(startTemplates);
                    q.hint = `Find the start: ? + ${b} = ${total}. Subtract: ${total} − ${b} = ?`;
                } else {
                    // Type 5: Change-unknown — start known, end known, change is the unknown.
                    // Per worksheet-feedback §4.4 — explicit add change-unknown templates.
                    a = rng(2, maxNum - 2);
                    b = rng(1, Math.max(1, maxNum - a));
                    const total = a + b;
                    answer = b;
                    let changeTemplates;
                    if (scenario.category === 'money') {
                        changeTemplates = [
                            `${name1} had ${a} ${scenario.unit}. After earning more, ${name1} has ${total} ${scenario.unit}. How many ${scenario.unit} did ${name1} earn?`,
                            `${name1} started with ${a} ${scenario.unit}. ${name1} now has ${total} ${scenario.unit}. How many ${scenario.unit} did ${name1} get?`,
                        ];
                    } else if (scenario.category === 'time') {
                        changeTemplates = [
                            `${name1} read for ${a} ${scenario.unit}. After reading more, ${name1} has read for ${total} ${scenario.unit} in total. How many more ${scenario.unit} did ${name1} read?`,
                        ];
                    } else if (scenario.category === 'distance') {
                        changeTemplates = [
                            `${name1} had walked ${a} ${scenario.unit}. After walking more, ${name1} has walked ${total} ${scenario.unit}. How many more ${scenario.unit} did ${name1} walk?`,
                        ];
                    } else {
                        changeTemplates = [
                            `${name1} had ${a} ${scenario.unit}. After getting more, ${name1} has ${total} ${scenario.unit}. How many more ${scenario.unit} did ${name1} get?`,
                            `${name1} started with ${a} ${scenario.unit}. ${name2} gave ${name1} some more. Now ${name1} has ${total} ${scenario.unit}. How many ${scenario.unit} did ${name2} give?`,
                        ];
                    }
                    q.text = pick(changeTemplates);
                    q.hint = `Find the change: ${a} + ? = ${total}. Subtract: ${total} − ${a} = ?`;
                    // Set b for the visual to show the answer change.
                    b = answer;
                }

                // Create visual with pastel groups (use a and b for icon display)
                // For start-unknown (0.72-0.86) and change-unknown (>=0.86), show the answer
                // in the unknown slot so the visual stays meaningful.
                const isStartUnknown = roll >= 0.72 && roll < 0.86;
                const displayA = isStartUnknown ? answer : a;
                const displayB = b;
                const group1Items = Array(Math.min(Math.floor(typeof displayA === 'number' ? displayA : a), 15)).fill(scenario.item).join('');
                const group2Items = Array(Math.min(Math.floor(typeof displayB === 'number' ? displayB : b), 15)).fill(scenario.item).join('');

                q.ans = answer;
                q.a = a; q.b = b; q.op = '+';
                q.visual = `<div class="word-problem-visual">
                    <div class="word-problem-scene">
                        <div class="visual-group group-${scenario.color}">
                            <div style="font-size:1.1rem;letter-spacing:2px;color:#000;text-align:center;">${group1Items}</div>
                            <div class="visual-label">${displayA} ${scenario.name}</div>
                        </div>
                        <div style="font-size:2rem;color:#7209b7;font-weight:700;">+</div>
                        <div class="visual-group group-${scenario.color}">
                            <div style="font-size:1.1rem;letter-spacing:2px;color:#000;text-align:center;">${group2Items}</div>
                            <div class="visual-label">${displayB} ${scenario.name}</div>
                        </div>
                    </div>
                    ${_equationBuilderHTML(displayA, displayB)}
                </div>`;

                q.options = buildNumericOptions(answer);

                // ── Column workmat (col-arith) ──
                // Wire the unified column-arithmetic widget so the student
                // works the addition vertically with per-digit GREEN/RED
                // validation. Variants where the unknown isn't the SUM
                // (start-unknown, change-unknown, missing-addend) fall
                // back to the standard single-input flow because the
                // workmat would mislead them about which slot to fill.
                const _addUnknownIsSum = (roll === 'join' || roll === 'start_unknown');
                if (_addUnknownIsSum && answer >= 0 && Number.isFinite(a) && Number.isFinite(b)) {
                    q.answerType = 'col-arith';
                    q.colMode = 'add';
                    q.operands = [a, b];
                    q.decimalPlaces = state.decimalPlaces > 0 ? state.decimalPlaces : 0;
                    q.dollarSign = scenario.category === 'money' && q.decimalPlaces > 0;
                }
                return;
            }

            // Subtraction Word Problems
            if (mappedSkill === "sub_word_problems") {
                // The "click the numbers you need" variant is a teacher tick now, not a 20% roll (P4).
                if (_responseMode() === 'which-numbers') {
                    const _msc_w = _msc_subWordProblem(rng);
                    if (_applyMscQuestion(q, _msc_w)) return;
                }

                // [worksheet-feedback §8.3] Expanded contexts: money, distance, time,
                // science, school, food, plus original toy/animal contexts.
                const scenarios = [
                    // Original toy / everyday contexts
                    { category: 'toy', icon: bwIcon('apples'), unit: 'apples', color: 'pink', verb: 'ate' },
                    { category: 'toy', icon: bwIcon('cookies'), unit: 'cookies', color: 'orange', verb: 'ate' },
                    { category: 'toy', icon: bwIcon('balloons'), unit: 'balloons', color: 'purple', verb: 'popped' },
                    { category: 'toy', icon: bwIcon('books'), unit: 'books', color: 'blue', verb: 'returned' },
                    { category: 'toy', icon: bwIcon('stickers'), unit: 'stickers', color: 'yellow', verb: 'gave away' },
                    { category: 'toy', icon: bwIcon('flowers'), unit: 'flowers', color: 'pink', verb: 'picked' },
                    { category: 'toy', icon: bwIcon('balls'), unit: 'balls', color: 'orange', verb: 'lost' },
                    // Money
                    { category: 'money', icon: bwIcon('coins'), unit: 'dollars', color: 'yellow', verb: 'spent' },
                    { category: 'money', icon: bwIcon('coins'), unit: 'dollars', color: 'yellow', verb: 'gave away' },
                    { category: 'money', icon: bwIcon('coins'), unit: 'cents', color: 'yellow', verb: 'spent' },
                    // Distance / measurement
                    { category: 'distance', icon: bwIcon('balls'), unit: 'miles', color: 'blue', verb: 'traveled' },
                    { category: 'distance', icon: bwIcon('balls'), unit: 'kilometers', color: 'blue', verb: 'traveled' },
                    { category: 'distance', icon: bwIcon('pencils'), unit: 'feet', color: 'blue', verb: 'cut off' },
                    // Time
                    { category: 'time', icon: bwIcon('stars'), unit: 'minutes', color: 'purple', verb: 'used' },
                    { category: 'time', icon: bwIcon('stars'), unit: 'hours', color: 'purple', verb: 'used' },
                    { category: 'time', icon: bwIcon('stars'), unit: 'days', color: 'purple', verb: 'passed' },
                    // Science
                    { category: 'science', icon: bwIcon('flowers'), unit: 'plants', color: 'pink', verb: 'wilted' },
                    { category: 'science', icon: bwIcon('flowers'), unit: 'seeds', color: 'pink', verb: 'sprouted' },
                    { category: 'science', icon: bwIcon('coins'), unit: 'rock samples', color: 'orange', verb: 'studied' },
                    // School
                    { category: 'school', icon: bwIcon('books'), unit: 'students', color: 'blue', verb: 'went home' },
                    { category: 'school', icon: bwIcon('books'), unit: 'books', color: 'blue', verb: 'were checked out' },
                    { category: 'school', icon: bwIcon('pencils'), unit: 'school supplies', color: 'yellow', verb: 'were used' },
                    // Food / cooking
                    { category: 'food', icon: bwIcon('cookies'), unit: 'cookies', color: 'orange', verb: 'were eaten' },
                    { category: 'food', icon: bwIcon('apples'), unit: 'servings', color: 'pink', verb: 'were served' },
                    { category: 'food', icon: bwIcon('apples'), unit: 'cups of flour', color: 'pink', verb: 'were used' },
                ];

                const scenario = pick(scenarios);
                // Back-compat alias for downstream visual code.
                scenario.name = scenario.unit;
                scenario.item = scenario.icon;
                const [name1, name2] = pickTwoNames();

                // Scale with range setting
                const maxNum = Math.max(10, range);
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('sub_word_problems', ["take_away","compare","start_unknown"], [1,1,1])
                    : (Math.random() < 0.5 ? 'take_away' : (Math.random() < 0.5 ? 'compare' : 'start_unknown'));
                q._variant = roll;
                let total, taken, answer;

                if (roll === 'take_away') {
                    // Type 1: Take away (result-unknown) — "Had X, removed Y, how many left?"
                    total = rng(10, maxNum);
                    taken = rng(2, total - 1);
                    if (state.decimalPlaces > 0) { total = applyDecimals(total); taken = applyDecimals(Math.floor(taken)); if (taken >= total) taken = parseFloat((total - 0.1).toFixed(state.decimalPlaces)); }
                    answer = state.decimalPlaces > 0 ? parseFloat((total - taken).toFixed(state.decimalPlaces)) : total - taken;
                    let takeTemplates;
                    if (scenario.category === 'money') {
                        takeTemplates = [
                            `${name1} had ${total} ${scenario.unit}. ${name1} ${scenario.verb} ${taken} ${scenario.unit}. How many ${scenario.unit} does ${name1} have left?`,
                            `${name1} started with ${total} ${scenario.unit} and ${scenario.verb} ${taken} ${scenario.unit}. How many ${scenario.unit} remain?`,
                        ];
                    } else if (scenario.category === 'distance') {
                        takeTemplates = [
                            `A ${pick(['hike', 'race', 'route', 'trip'])} is ${total} ${scenario.unit} long. ${name1} has already traveled ${taken} ${scenario.unit}. How many ${scenario.unit} are left?`,
                        ];
                    } else if (scenario.category === 'time') {
                        takeTemplates = [
                            `A movie lasts ${total} ${scenario.unit}. ${taken} ${scenario.unit} have already passed. How many ${scenario.unit} are left?`,
                            `${name1} has ${total} ${scenario.unit} of homework time. ${name1} has used ${taken} ${scenario.unit}. How many ${scenario.unit} are left?`,
                        ];
                    } else if (scenario.category === 'science') {
                        takeTemplates = [
                            `${name1} had ${total} ${scenario.unit}. ${taken} ${scenario.unit} ${scenario.verb}. How many ${scenario.unit} are left?`,
                        ];
                    } else if (scenario.category === 'school') {
                        takeTemplates = [
                            `A class has ${total} ${scenario.unit}. ${taken} ${scenario.unit} ${scenario.verb}. How many ${scenario.unit} are left?`,
                        ];
                    } else if (scenario.category === 'food') {
                        takeTemplates = [
                            `A pot has ${total} ${scenario.unit}. ${taken} ${scenario.unit} ${scenario.verb}. How many ${scenario.unit} are left?`,
                        ];
                    } else {
                        takeTemplates = [
                            `${name1} has ${total} ${scenario.unit}. ${name1} ${scenario.verb} ${taken} of them. How many ${scenario.unit} does ${name1} have left?`,
                            `There were ${total} ${scenario.unit}. ${taken} were ${scenario.verb}. How many are left?`,
                            `${name1} started with ${total} ${scenario.unit} and ${scenario.verb} ${taken}. How many ${scenario.unit} remain?`,
                        ];
                    }
                    q.text = pick(takeTemplates);
                    q.hint = `Take away: ${total} − ${taken} = ?`;
                } else if (roll === 'compare') {
                    // Type 2: Compare difference — "Team A scored X. Team B scored Y. How many more?"
                    total = rng(5, maxNum);
                    taken = rng(1, total - 1);
                    if (state.decimalPlaces > 0) { total = applyDecimals(total); taken = applyDecimals(Math.floor(taken)); if (taken >= total) taken = parseFloat((total - 0.1).toFixed(state.decimalPlaces)); }
                    answer = state.decimalPlaces > 0 ? parseFloat((total - taken).toFixed(state.decimalPlaces)) : total - taken;
                    let compareTemplates;
                    if (scenario.category === 'money') {
                        compareTemplates = [
                            `${name1} saved ${total} ${scenario.unit}. ${name2} saved ${taken} ${scenario.unit}. How many more ${scenario.unit} did ${name1} save?`,
                        ];
                    } else if (scenario.category === 'distance') {
                        compareTemplates = [
                            `${name1} ran ${total} ${scenario.unit}. ${name2} ran ${taken} ${scenario.unit}. How many more ${scenario.unit} did ${name1} run?`,
                        ];
                    } else if (scenario.category === 'time') {
                        compareTemplates = [
                            `${name1} practiced for ${total} ${scenario.unit}. ${name2} practiced for ${taken} ${scenario.unit}. How many more ${scenario.unit} did ${name1} practice?`,
                        ];
                    } else if (scenario.category === 'school') {
                        compareTemplates = [
                            `${name1} scored ${total} on the test. ${name2} scored ${taken}. What is the difference between their scores?`,
                            `Class A has ${total} ${scenario.unit}. Class B has ${taken} ${scenario.unit}. How many more ${scenario.unit} are in Class A?`,
                        ];
                    } else {
                        compareTemplates = [
                            `${name1} has ${total} ${scenario.unit}. ${name2} has ${taken} ${scenario.unit}. How many more ${scenario.unit} does ${name1} have than ${name2}?`,
                            `${name1} scored ${total} points. ${name2} scored ${taken} points. What is the difference between their scores?`,
                        ];
                    }
                    q.text = pick(compareTemplates);
                    q.hint = `Find the difference: ${total} − ${taken} = ?`;
                } else if (roll < 0.72) {
                    // Type 3: Missing subtrahend (change-unknown for subtraction) —
                    // "Had X, now has Y. How many were removed?"
                    total = rng(10, maxNum);
                    answer = rng(2, total - 1);
                    taken = answer; // the unknown
                    const remaining = total - answer;
                    let missingTemplates;
                    if (scenario.category === 'money') {
                        missingTemplates = [
                            `${name1} had ${total} ${scenario.unit}. After spending some, ${name1} has ${remaining} ${scenario.unit} left. How many ${scenario.unit} did ${name1} spend?`,
                        ];
                    } else if (scenario.category === 'distance') {
                        missingTemplates = [
                            `A trail is ${total} ${scenario.unit} long. After hiking part of it, ${name1} has ${remaining} ${scenario.unit} left. How many ${scenario.unit} did ${name1} hike?`,
                        ];
                    } else if (scenario.category === 'time') {
                        missingTemplates = [
                            `A class is ${total} ${scenario.unit} long. After working for a while, ${remaining} ${scenario.unit} are left. How many ${scenario.unit} have passed?`,
                        ];
                    } else {
                        missingTemplates = [
                            `${name1} had ${total} ${scenario.unit}. After giving some away, ${name1} has ${remaining} left. How many ${scenario.unit} did ${name1} give away?`,
                            `There were ${total} ${scenario.unit} in the ${pick(['jar', 'box', 'bag', 'basket'])}. Now there are ${remaining}. How many were taken out?`,
                        ];
                    }
                    q.text = pick(missingTemplates);
                    q.hint = `Find what was removed: ${total} − ? = ${remaining}. Subtract: ${total} − ${remaining} = ?`;
                } else if (roll < 0.86) {
                    // Type 4: Compare fewer — "Sam has X. Mia has Y fewer. How many does Mia have?"
                    total = rng(5, maxNum);
                    const fewer = rng(1, total - 1);
                    taken = fewer; // for visual
                    answer = total - fewer;
                    let fewerTemplates;
                    if (scenario.category === 'money') {
                        fewerTemplates = [
                            `${name1} earned ${total} ${scenario.unit}. ${name2} earned ${fewer} fewer ${scenario.unit} than ${name1}. How many ${scenario.unit} did ${name2} earn?`,
                        ];
                    } else if (scenario.category === 'distance') {
                        fewerTemplates = [
                            `${name1} drove ${total} ${scenario.unit}. ${name2} drove ${fewer} fewer ${scenario.unit}. How many ${scenario.unit} did ${name2} drive?`,
                        ];
                    } else {
                        fewerTemplates = [
                            `${name1} has ${total} ${scenario.unit}. ${name2} has ${fewer} fewer ${scenario.unit} than ${name1}. How many ${scenario.unit} does ${name2} have?`,
                            `${name1} collected ${total} ${scenario.unit}. ${name2} collected ${fewer} fewer. How many did ${name2} collect?`,
                        ];
                    }
                    q.text = pick(fewerTemplates);
                    q.hint = `Fewer means subtract: ${total} − ${fewer} = ?`;
                } else {
                    // Type 5: Start-unknown for subtraction — "Some birds were on a wire.
                    // ${b} flew away. Now there are ${a-b}. How many were there at first?"
                    // Per worksheet-feedback §4.4 — explicit start-unknown templates.
                    // Note: even though this is in the SUBTRACTION generator, the
                    // start-unknown structure is solved by ADDING (start = remaining + away),
                    // which mirrors the bar-model thinking the spec emphasizes.
                    const start = rng(5, maxNum);
                    const away = rng(1, start - 1);
                    const remaining = start - away;
                    answer = start;
                    total = start; // bookkeeping for visual
                    taken = away;
                    let startTemplates;
                    if (scenario.category === 'money') {
                        startTemplates = [
                            `${name1} had some ${scenario.unit}. After spending ${away} ${scenario.unit}, ${name1} has ${remaining} ${scenario.unit} left. How many ${scenario.unit} did ${name1} have to start?`,
                        ];
                    } else if (scenario.category === 'school') {
                        startTemplates = [
                            `Some ${scenario.unit} were in the ${pick(['classroom', 'gym', 'library'])}. ${away} ${scenario.unit} left. Now there are ${remaining} ${scenario.unit}. How many ${scenario.unit} were there at first?`,
                        ];
                    } else if (scenario.category === 'time') {
                        startTemplates = [
                            `A ${pick(['movie', 'class', 'game', 'practice'])} had some ${scenario.unit} planned. After ${away} ${scenario.unit} passed, ${remaining} ${scenario.unit} were left. How many ${scenario.unit} were planned at the start?`,
                        ];
                    } else {
                        startTemplates = [
                            `Some ${scenario.unit} were on a ${pick(['wire', 'shelf', 'table', 'plate'])}. ${away} ${scenario.unit} were taken away. Now there are ${remaining} ${scenario.unit}. How many ${scenario.unit} were there at first?`,
                            `${name1} had some ${scenario.unit}. ${name1} ${scenario.verb} ${away} of them. Now ${name1} has ${remaining} ${scenario.unit}. How many ${scenario.unit} did ${name1} have at first?`,
                        ];
                    }
                    q.text = pick(startTemplates);
                    q.hint = `Find the start: ? − ${away} = ${remaining}. Add: ${remaining} + ${away} = ?`;
                }

                // Visual showing crossing out items
                const vizTotal = Math.floor(typeof total === 'number' ? total : 0);
                const vizTaken = Math.floor(typeof taken === 'number' ? taken : 0);
                const totalItems = Array(Math.min(vizTotal, 20)).fill(scenario.item);
                const remainingHTML = totalItems.map((item, i) =>
                    i < Math.min(vizTaken, vizTotal)
                        ? `<span style="opacity:0.3;position:relative;display:inline-block;">${item}<span style="position:absolute;left:0;right:0;top:50%;border-top:2px solid #000;"></span></span>`
                        : `<span>${item}</span>`
                ).join('');

                q.ans = answer;
                q.a = total; q.b = taken; q.op = '-';
                q.visual = `<div class="word-problem-visual">
                    <div style="text-align:center;margin-bottom:10px;">
                        <div style="font-size:0.9rem;color:#666;margin-bottom:8px;">Started with ${total}:</div>
                        <div class="visual-group group-${scenario.color}" style="max-width:300px;">
                            <div style="font-size:1.1rem;letter-spacing:2px;color:#000;text-align:center;">${remainingHTML}</div>
                        </div>
                    </div>
                    ${_equationBuilderHTML(vizTotal, vizTaken)}
                </div>`;

                q.options = buildNumericOptions(answer);

                // ── Column workmat (col-arith / 'sub' mode) ──
                // Wire the workmat for the variants where the unknown is
                // the difference (take_away, compare). Variants where the
                // unknown is the START or where the operation flips to
                // addition (start_unknown) fall back to the single-input
                // flow because the col-sub layout would mislead the
                // student about which slot to fill.
                const _subUnknownIsDiff = (roll === 'take_away' || roll === 'compare');
                if (_subUnknownIsDiff && Number.isFinite(total) && Number.isFinite(taken) && total >= taken) {
                    q.answerType = 'col-arith';
                    q.colMode = 'sub';
                    q.minuend = total;
                    q.subtrahend = taken;
                    q.decimalPlaces = state.decimalPlaces > 0 ? state.decimalPlaces : 0;
                    q.dollarSign = scenario.category === 'money' && q.decimalPlaces > 0;
                }
                return;
            }

            // ============================================================
            // UNKNOWN START WORD PROBLEMS (Grade 2) — Phase 5 batch 2
            // "X started with ___, gave away N, now has M" — solve for start
            // Band 171-180, OA domain
            // ============================================================
            if (mappedSkill === "unknown_start_wp") {
                const items = [
                    { name: 'crayons', verbGive: 'gave', verbHave: 'has', verbGet: 'got' },
                    { name: 'stickers', verbGive: 'gave', verbHave: 'has', verbGet: 'got' },
                    { name: 'marbles', verbGive: 'gave', verbHave: 'has', verbGet: 'got' },
                    { name: 'cookies', verbGive: 'shared', verbHave: 'has', verbGet: 'baked' },
                    { name: 'cards', verbGive: 'traded away', verbHave: 'has', verbGet: 'collected' },
                    { name: 'shells', verbGive: 'gave away', verbHave: 'has', verbGet: 'found' },
                    { name: 'pencils', verbGive: 'gave away', verbHave: 'has', verbGet: 'bought' },
                    { name: 'apples', verbGive: 'gave away', verbHave: 'has', verbGet: 'picked' },
                ];
                const name = pickName();
                const item = pick(items);

                // Scale with state.range — default keeps within 100, low range stays within 20
                const cap = Math.max(20, Math.min(100, range));
                // Pick whether the unknown is start of "give away" or start of "got more".
                // LRU-rotated so students see both forms in alternation rather than clusters.
                const variant = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('unknown_start_wp', ['give', 'get'])
                    : pick(['give', 'get']);
                q._variant = variant;
                let answer, given, now, text, hint;

                if (variant === 'give') {
                    // start = ?, gave away N, now has M
                    given = randInt(2, Math.max(2, Math.floor(cap / 4)));
                    now = randInt(1, cap - given);
                    answer = given + now;
                    const templates = [
                        `${name} had some ${item.name}. ${name} ${item.verbGive} ${given} of them. Now ${name} ${item.verbHave} ${now} ${item.name}. How many ${item.name} did ${name} have to start?`,
                        `${name} started with some ${item.name}. After giving ${given} away, ${name} has ${now} left. How many ${item.name} did ${name} start with?`,
                        `${name} ${item.verbGive} ${given} ${item.name}. ${name} now ${item.verbHave} ${now} ${item.name}. How many did ${name} have at the start?`,
                    ];
                    text = pick(templates);
                    hint = `If ${name} has ${now} after giving ${given} away, the start was ${now} + ${given} = ${answer}.`;
                } else {
                    // start = ?, got N more, now has M
                    given = randInt(2, Math.max(2, Math.floor(cap / 4)));
                    answer = randInt(1, cap - given);
                    now = answer + given;
                    const templates = [
                        `${name} had some ${item.name}. Then ${name} ${item.verbGet} ${given} more. Now ${name} ${item.verbHave} ${now} ${item.name}. How many ${item.name} did ${name} have to start?`,
                        `${name} started with some ${item.name} and ${item.verbGet} ${given} more. Now ${name} ${item.verbHave} ${now}. How many ${item.name} did ${name} have at the start?`,
                    ];
                    text = pick(templates);
                    hint = `If ${name} has ${now} after getting ${given} more, the start was ${now} − ${given} = ${answer}.`;
                }

                q.text = text;
                q.ans = answer;
                q.a = answer; q.b = given; q.op = (variant === 'give') ? '-' : '+';
                q.missing = 'a';
                q.hint = hint;

                // Vary answer type: 50% number, 50% multiple-choice (4 options)
                const useMC = Math.random() < 0.5;
                if (useMC) {
                    const optsSet = new Set([answer]);
                    // Common errors: forgot to add/sub, off-by-one, used wrong op
                    const candidates = [now, given, Math.max(1, answer - 1), answer + 1, Math.max(1, answer - given), answer + given];
                    for (const c of shuffle(candidates)) {
                        if (optsSet.size >= 4) break;
                        if (c >= 1 && c !== answer) optsSet.add(c);
                    }
                    while (optsSet.size < 4) {
                        const c = randInt(1, Math.max(answer + 5, cap));
                        if (c !== answer) optsSet.add(c);
                    }
                    q.answerType = "multiple-choice";
                    q.options = shuffle([...optsSet]);
                    // Tag known-misconception distractors with diagnostic messages.
                    if (typeof window !== 'undefined' && typeof window.tagDistractor === 'function') {
                        window.tagDistractor(q, String(now), "That's the total NOW — the question asks how many there were at the START.");
                        window.tagDistractor(q, String(given), "That's the number that was added or taken away — not the starting amount. Try the opposite operation on the total.");
                        window.tagDistractor(q, String(Math.max(1, answer - 1)), "Off by one — re-count carefully. Did you include or skip an item by accident?");
                        window.tagDistractor(q, String(answer + 1), "Off by one — re-count carefully. Did you include or skip an item by accident?");
                        window.tagDistractor(q, String(answer + given), (variant === 'give')
                            ? "Looks like you added when you should have subtracted. Since some were given AWAY, take the given amount away from the total to find the start."
                            : "Looks like you added when you should have subtracted. Since more were received, subtract the received amount from the total to find the start.");
                        window.tagDistractor(q, String(Math.max(1, answer - given)), "That's the wrong direction — undo the change with the OPPOSITE operation to find the start.");
                    }
                } else {
                    q.answerType = "number";
                    q.options = buildNumericOptions(answer);
                }

                // Visual: simple "?" box → minus/plus → equals → result, with item icon row hint
                const opSym = variant === 'give' ? '−' : '+';
                const resultColor = variant === 'give' ? '#e76f51' : '#2a9d8f';
                q.visual = `<div class="word-problem-visual" style="text-align:center;">
                    <div style="background:var(--bg-card);padding:14px;border-radius:10px;margin-bottom:10px;text-align:left;max-width:480px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:1rem;line-height:1.55;">${text}</div>
                    </div>
                    <div style="display:inline-flex;align-items:center;gap:14px;background:var(--bg-card);border-radius:10px;padding:12px 18px;">
                        <span style="display:inline-block;min-width:54px;border:2.5px dashed #888;border-radius:8px;padding:6px 14px;font-size:1.4rem;font-weight:800;color:#444;">?</span>
                        <span style="font-size:1.6rem;font-weight:800;color:${resultColor};">${opSym}</span>
                        <span style="font-size:1.4rem;font-weight:700;">${given}</span>
                        <span style="font-size:1.6rem;font-weight:800;color:#555;">=</span>
                        <span style="font-size:1.4rem;font-weight:700;">${now}</span>
                    </div>
                    <div style="margin-top:8px;font-size:0.85rem;color:var(--text-dim);">Find the unknown start.</div>
                </div>`;
                q.printFormat = "unknown-start-wp";
                q.unknownStartData = { name, item: item.name, given, now, answer, variant };
                return;
            }

            // Multiplication Word Problems
            if (mappedSkill === "mult_word_problems") {
                // The "click the numbers you need" variant is a teacher tick now, not a 20% roll (P4).
                if (_responseMode() === 'which-numbers') {
                    const _msc_w = _msc_multWordProblem(rng);
                    if (_applyMscQuestion(q, _msc_w)) return;
                }

                // [worksheet-feedback §8.3] Expanded contexts: money, distance, time,
                // science, school, food, plus original toy contexts.
                const scenarios = [
                    // Original toy / everyday contexts
                    { category: 'toy', icon: bwIcon('apples'), unit: 'apples', container: 'basket', containerPlural: 'baskets' },
                    { category: 'toy', icon: bwIcon('cookies'), unit: 'cookies', container: 'box', containerPlural: 'boxes' },
                    { category: 'toy', icon: bwIcon('stickers'), unit: 'stickers', container: 'sheet', containerPlural: 'sheets' },
                    { category: 'toy', icon: bwIcon('flowers'), unit: 'flowers', container: 'vase', containerPlural: 'vases' },
                    { category: 'toy', icon: bwIcon('books'), unit: 'books', container: 'shelf', containerPlural: 'shelves' },
                    { category: 'toy', icon: bwIcon('balloons'), unit: 'balloons', container: 'bunch', containerPlural: 'bunches' },
                    { category: 'toy', icon: bwIcon('balls'), unit: 'balls', container: 'bag', containerPlural: 'bags' },
                    // Money
                    { category: 'money', icon: bwIcon('coins'), unit: 'dollars', container: 'envelope', containerPlural: 'envelopes' },
                    { category: 'money', icon: bwIcon('coins'), unit: 'cents', container: 'jar', containerPlural: 'jars' },
                    // Science
                    { category: 'science', icon: bwIcon('flowers'), unit: 'seeds', container: 'pot', containerPlural: 'pots' },
                    { category: 'science', icon: bwIcon('flowers'), unit: 'plants', container: 'tray', containerPlural: 'trays' },
                    { category: 'science', icon: bwIcon('coins'), unit: 'rock samples', container: 'bin', containerPlural: 'bins' },
                    // School
                    { category: 'school', icon: bwIcon('books'), unit: 'students', container: 'group', containerPlural: 'groups' },
                    { category: 'school', icon: bwIcon('books'), unit: 'books', container: 'shelf', containerPlural: 'shelves' },
                    { category: 'school', icon: bwIcon('pencils'), unit: 'school supplies', container: 'box', containerPlural: 'boxes' },
                    // Food / cooking
                    { category: 'food', icon: bwIcon('cookies'), unit: 'cookies', container: 'tray', containerPlural: 'trays' },
                    { category: 'food', icon: bwIcon('apples'), unit: 'servings', container: 'pot', containerPlural: 'pots' },
                    { category: 'food', icon: bwIcon('apples'), unit: 'cups of flour', container: 'bag', containerPlural: 'bags' },
                ];

                const scenario = pick(scenarios);
                // Back-compat alias for downstream visual code.
                scenario.name = scenario.unit;
                scenario.item = scenario.icon;
                const [name1, name2] = pickTwoNames();

                // Scale with range: small range uses facts, large range scales up
                let wpMultMax = range <= 100 ? 8 : Math.min(Math.ceil(Math.sqrt(range)), 15);
                // A grid the pupil taps out one icon at a time stops being a model somewhere
                // around eight by eight, so the builder only accepts 2-8 groups of 2-10. Above
                // "within 100" the dims outgrew that and those items fell through to the column
                // workmat, so the page mixed two cells again; the tick caps the dims instead.
                if (_responseMode() === 'array-builder') wpMultMax = Math.min(wpMultMax, 8);
                // LRU rotation across 3 sub-types (was Math.random() chain).
                let roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('mult_word_problems', ["equal_groups","arrays","comparison"], [1,1,1])
                    : (Math.random() < 0.5 ? 'equal_groups' : (Math.random() < 0.5 ? 'arrays' : 'comparison'));
                // When the teacher has ticked "Build the array, then answer", every cell on the
                // page has to be buildable. The comparison story ("4 times as many") has no array
                // in it, so it was falling through to the column workmat and a six-item page came
                // out four array builders and two workmats — the same page mixing the response
                // option exists to end ("One choice per page", skill-options.js responseOption).
                if (_responseMode() === 'array-builder' && roll === 'comparison') roll = 'equal_groups';
                q._variant = roll;
                let groups, perGroup, answer;

                if (roll === 'equal_groups') {
                    // Type 1: Equal groups — "X bags with Y items each"
                    groups = rng(2, Math.min(wpMultMax, 10));
                    perGroup = rng(2, wpMultMax);
                    answer = groups * perGroup;
                    let groupTemplates;
                    if (scenario.category === 'money') {
                        groupTemplates = [
                            `${name1} has ${groups} ${scenario.containerPlural}. Each ${scenario.container} holds ${perGroup} ${scenario.unit}. How many ${scenario.unit} does ${name1} have in all?`,
                            `${name1} earned ${perGroup} ${scenario.unit} a day for ${groups} days. How many ${scenario.unit} did ${name1} earn in all?`,
                        ];
                    } else if (scenario.category === 'school') {
                        groupTemplates = [
                            `A school has ${groups} ${scenario.containerPlural}. Each ${scenario.container} has ${perGroup} ${scenario.unit}. How many ${scenario.unit} are there in all?`,
                        ];
                    } else if (scenario.category === 'science') {
                        groupTemplates = [
                            `${name1} planted ${perGroup} ${scenario.unit} in each of ${groups} ${scenario.containerPlural}. How many ${scenario.unit} did ${name1} plant?`,
                        ];
                    } else if (scenario.category === 'food') {
                        groupTemplates = [
                            `A recipe makes ${perGroup} ${scenario.unit} per batch. ${name1} made ${groups} batches. How many ${scenario.unit} did ${name1} make in all?`,
                            `Each ${scenario.container} has ${perGroup} ${scenario.unit}. There are ${groups} ${scenario.containerPlural}. How many ${scenario.unit} in all?`,
                        ];
                    } else {
                        groupTemplates = [
                            `${name1} has ${groups} ${groups === 1 ? scenario.container : scenario.containerPlural}. Each ${scenario.container} has ${perGroup} ${scenario.unit}. How many ${scenario.unit} does ${name1} have in all?`,
                            `There are ${groups} ${scenario.containerPlural} with ${perGroup} ${scenario.unit} in each. How many ${scenario.unit} are there altogether?`,
                            `${name1} bought ${groups} ${scenario.containerPlural} of ${scenario.unit}. Each ${scenario.container} contains ${perGroup} ${scenario.unit}. What is the total number of ${scenario.unit}?`,
                        ];
                    }
                    q.text = pick(groupTemplates);
                    q.hint = `Multiply: ${groups} groups x ${perGroup} in each = ?`;
                } else if (roll === 'arrays') {
                    // Type 2: Array — "X rows of Y"
                    groups = rng(2, Math.min(wpMultMax, 8));
                    perGroup = rng(2, Math.min(wpMultMax, 8));
                    answer = groups * perGroup;
                    const arrayContexts = [
                        { place: 'garden', thing: scenario.unit },
                        { place: 'classroom', thing: 'desks' },
                        { place: 'parking lot', thing: 'cars' },
                    ];
                    const ctx = pick(arrayContexts);
                    const arrayTemplates = [
                        `${name1} arranged ${ctx.thing} in ${groups} rows with ${perGroup} in each row. How many ${ctx.thing} are there?`,
                        `A ${ctx.place} has ${groups} rows of ${ctx.thing} with ${perGroup} in each row. How many ${ctx.thing} are there in total?`,
                    ];
                    q.text = pick(arrayTemplates);
                    q.hint = `Think of it as an array: ${groups} rows x ${perGroup} columns = ?`;
                } else if (roll < 0.70) {
                    // Type 3: Price/rate — "Each costs $X. Buy Y. Total cost?"
                    const price = rng(2, Math.min(wpMultMax, 10));
                    const qty = rng(2, Math.min(wpMultMax, 10));
                    groups = qty;
                    perGroup = price;
                    answer = price * qty;
                    const items = ['pencils', 'erasers', 'markers', 'notebooks', 'rulers', 'folders'];
                    const storeItem = pick(items);
                    const priceTemplates = [
                        `Each ${storeItem.slice(0, -1)} costs $${price}. ${name1} buys ${qty} ${storeItem}. How much does ${name1} spend in all?`,
                        `${name1} wants to buy ${qty} ${storeItem} that cost $${price} each. What is the total cost?`,
                    ];
                    q.text = pick(priceTemplates);
                    q.hint = `Multiply the price by the quantity: $${price} x ${qty} = ?`;
                } else if (roll < 0.85) {
                    // Type 4: Multiplicative comparison — "X times as many as Y"
                    const base = rng(2, Math.min(wpMultMax, 8));
                    const multiplier = rng(2, Math.min(wpMultMax, 6));
                    groups = multiplier;
                    perGroup = base;
                    answer = base * multiplier;
                    let compTemplates;
                    if (scenario.category === 'money') {
                        compTemplates = [
                            `${name1} saved ${base} ${scenario.unit}. ${name2} saved ${multiplier} times as many ${scenario.unit}. How many ${scenario.unit} did ${name2} save?`,
                        ];
                    } else if (scenario.category === 'school') {
                        compTemplates = [
                            `${name1} read ${base} ${scenario.unit}. ${name2} read ${multiplier} times as many ${scenario.unit}. How many ${scenario.unit} did ${name2} read?`,
                        ];
                    } else {
                        compTemplates = [
                            `${name1} has ${base} ${scenario.unit}. ${name2} has ${multiplier} times as many ${scenario.unit} as ${name1}. How many ${scenario.unit} does ${name2} have?`,
                            `${name1} read ${base} books. ${name2} read ${multiplier} times as many. How many books did ${name2} read?`,
                        ];
                    }
                    q.text = pick(compTemplates);
                    q.hint = `"Times as many" means multiply: ${base} x ${multiplier} = ?`;
                } else {
                    // Type 5: Rate/measurement — distance / time / per-unit context.
                    // Pulls in distance & time domains naturally for multiplication.
                    const rate = rng(2, Math.min(wpMultMax, 10));
                    const units = rng(2, Math.min(wpMultMax, 10));
                    groups = units;
                    perGroup = rate;
                    answer = rate * units;
                    const rateTemplates = [
                        `${name1} walks ${rate} miles each day. How many miles does ${name1} walk in ${units} days?`,
                        `A car uses ${rate} gallons of gas per trip. How much gas does it use in ${units} trips?`,
                        `A factory makes ${rate} items per hour. How many items does it make in ${units} hours?`,
                        `${name1} reads ${rate} pages per day. How many pages does ${name1} read in ${units} days?`,
                        `Each box weighs ${rate} pounds. How much do ${units} boxes weigh in all?`,
                    ];
                    q.text = pick(rateTemplates);
                    q.hint = `Multiply the rate by the number of units: ${rate} x ${units} = ?`;
                }

                q.ans = answer;
                q.a = groups; q.b = perGroup; q.op = '×';

                // Create array visual
                const arrayRows = [];
                for (let r = 0; r < Math.min(groups, 6); r++) {
                    const rowItemsArr = Array(Math.min(perGroup, 8)).fill(scenario.item).join('');
                    arrayRows.push(`<div class="array-row" style="font-size:1.1rem;letter-spacing:2px;color:#000;">${rowItemsArr}</div>`);
                }

                q.visual = `<div class="word-problem-visual">
                    <div class="array-visual">
                        <div class="array-label">${groups} rows x ${perGroup} in each row</div>
                        ${arrayRows.join('')}
                    </div>
                    ${_equationBuilderHTML(groups, perGroup)}
                </div>`;

                q.options = buildNumericOptions(answer);

                // ── Array-builder (interactive manipulative) for "rows of N"
                // and equal-groups variants. Student clicks cells in a blank
                // grid to place icons until count == product, then types the
                // total below. Skips the col-arith workmat for these.
                // The array builder is a second response mode, so it is a teacher tick too (P4):
                // otherwise this one skill printed 'array-builder', 'multi-select' and the plain
                // word-problem cell on the same page.
                const _useArrayBuilder = _responseMode() === 'array-builder'
                    && (roll === 'arrays' || roll === 'equal_groups')
                    && Number.isFinite(groups) && Number.isFinite(perGroup)
                    && groups >= 2 && groups <= 8
                    && perGroup >= 2 && perGroup <= 10;

                if (_useArrayBuilder) {
                    // Pick a context-appropriate icon. Strip emoji from
                    // scenario.icon; if it's an SVG/img string, fall back to
                    // a neutral dot.
                    const _icon = (() => {
                        const raw = String(scenario.icon || '');
                        // Match a leading emoji or character that is NOT html.
                        const m = raw.match(/^([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}])/u);
                        if (m) return m[1];
                        // Common single-char fruit/object emojis by unit
                        const u = (scenario.unit || '').toLowerCase();
                        if (u.includes('apple')) return '🍎';
                        if (u.includes('cookie')) return '🍪';
                        if (u.includes('flower') || u.includes('seed') || u.includes('plant')) return '🌸';
                        if (u.includes('book')) return '📕';
                        if (u.includes('balloon')) return '🎈';
                        if (u.includes('sticker')) return '⭐';
                        if (u.includes('ball')) return '⚽';
                        if (u.includes('coin') || u.includes('cent') || u.includes('dollar')) return '🪙';
                        return '●';
                    })();

                    q.useArrayBuilder = true;
                    q.arrayDims = { rows: groups, cols: perGroup };
                    q.arrayIcon = _icon;
                    q.answerType = 'array-builder';
                    q.printFormat = 'array-builder';
                    // Keep q.ans = product for grading.
                    return;
                }

                // ── Column workmat (col-arith / 'mult' mode) ──
                // The unknown is always the PRODUCT here. Operands match the
                // order they appear in the word text so the student can copy
                // them straight into the boxes.
                if (Number.isFinite(groups) && Number.isFinite(perGroup) && answer >= 0) {
                    q.answerType = 'col-arith';
                    q.colMode = 'mult';
                    q.factorTop = groups;
                    q.factorBottom = perGroup;
                    q.decimalPlaces = 0;
                    q.operandsEditable = true;  // student types both numbers
                    q.hint = (q.hint ? q.hint + ' ' : '')
                        + 'Read the word problem and place the two numbers in the boxes.';
                }
                return;
            }

            // MAP-style "Interpret the Remainder" word problems (Grade 4-5, RIT 211-220).
            // Direct sample item: "Shay needs 50 hot dogs; buns come 8 per pack. Fewest
            // packs?" → answer 7 (round UP, the remainder forces an extra container).
            // Three remainder-interpretation patterns: round-up, drop, use-the-remainder.
            if (mappedSkill === "remainder_interpret") {
                const nameRI = pickName();
                const variant = pick(["roundup", "drop", "use_remainder"]);
                const wpRiMax = range <= 100 ? 12 : Math.min(Math.ceil(Math.sqrt(range)), 20);
                let divisor, dividend, quotient, remainder, answer, txt, hintMsg;
                let safety = 0;
                do {
                    divisor = rng(3, wpRiMax);
                    dividend = rng(divisor + 1, divisor * 10);
                    quotient = Math.floor(dividend / divisor);
                    remainder = dividend % divisor;
                    safety++;
                } while (remainder === 0 && safety < 20);
                if (remainder === 0) { dividend += 1; remainder = 1; quotient = Math.floor(dividend / divisor); }

                if (variant === "roundup") {
                    // Containers needed — round UP
                    const ctxs = [
                        { item: 'hot dogs', container: 'packs of buns', per: divisor },
                        { item: 'students', container: 'minivans', per: divisor },
                        { item: 'apples', container: 'baskets', per: divisor },
                        { item: 'cookies', container: 'boxes', per: divisor },
                        { item: 'books', container: 'shelves', per: divisor },
                    ];
                    const c = pick(ctxs);
                    answer = quotient + 1;
                    txt = `${nameRI} needs ${dividend} ${c.item}. ${c.container.charAt(0).toUpperCase() + c.container.slice(1)} hold ${c.per} each. What is the FEWEST number of ${c.container} ${nameRI} needs?`;
                    hintMsg = `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}. Since there are leftovers, you need one MORE ${c.container.replace(/s$/, '')} for them. Answer: ${quotient} + 1 = ${answer}.`;
                } else if (variant === "drop") {
                    // Full groups only — DROP the remainder
                    const ctxs = [
                        { item: 'cards', container: 'complete decks', one: 'deck', per: divisor },
                        { item: 'cookies', container: 'full boxes', one: 'box', per: divisor },
                        { item: 'eggs', container: 'full cartons', one: 'carton', per: divisor },
                        { item: 'pencils', container: 'full packs', one: 'pack', per: divisor },
                    ];
                    const c = pick(ctxs);
                    answer = quotient;
                    // P8b: "Each pack holds ... How many full cartons" named two containers.
                    txt = `${nameRI} has ${dividend} ${c.item}. Each ${c.one} holds exactly ${c.per}. How many ${c.container} can ${nameRI} fill?`;
                    hintMsg = `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}. Only complete groups count, so the leftover ${remainder} doesn't make a full pack. Answer: ${quotient}.`;
                } else {
                    // Use the remainder itself
                    const ctxs = [
                        { item: 'cookies', verb: 'shared equally between', recipients: 'friends' },
                        { item: 'pieces of candy', verb: 'shared equally between', recipients: 'kids' },
                        { item: 'stickers', verb: 'split equally among', recipients: 'students' },
                    ];
                    const c = pick(ctxs);
                    answer = remainder;
                    txt = `${nameRI} has ${dividend} ${c.item} ${c.verb} ${divisor} ${c.recipients}. How many ${c.item} are LEFT OVER?`;
                    hintMsg = `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}. The leftover IS the answer. Answer: ${remainder}.`;
                }

                q.text = txt;
                q.ans = answer;
                q.a = dividend; q.b = divisor; q.op = '÷';
                q.hint = hintMsg;
                q.options = buildNumericOptions(answer);
                q.skillLabel = 'Interpret Remainder';
                q.printFormat = 'word-problem';
                return;
            }

            // ============================================================
            // remainder_contexts (Grade 4): Expanded remainder contexts
            // beyond round-up/drop/use-remainder — Buses, Boxes, Cookies,
            // Money, Cars. Multi-choice answers with plausible distractors
            // built from the wrong remainder interpretation.
            // ============================================================
            if (mappedSkill === "remainder_contexts") {
                const ctxKey = pick(["buses", "boxes", "cookies", "money", "cars"]);
                // P11: above Max Number 100 every story shares a bigger total (the measured Max
                // Number option on this skill moved only the money story, so a printed page of six
                // often did not change at all). At 100 and below nothing moves (R2).
                const _rcF = range > 100 ? 4 : 1;
                let dividend, divisor, quotient, remainder;
                let safety = 0;
                do {
                    if (ctxKey === "buses") {
                        divisor = pick([10, 12, 15]);
                        dividend = rng(divisor + 3, divisor * 5 * _rcF + 5);
                    } else if (ctxKey === "boxes") {
                        divisor = pick([4, 5, 6, 8]);
                        dividend = rng(divisor + 2 + (_rcF > 1 ? divisor * 8 : 0), divisor * 8 * _rcF + 4);
                    } else if (ctxKey === "cookies") {
                        divisor = pick([3, 4, 5, 6]);
                        dividend = rng(divisor + 2 + (_rcF > 1 ? divisor * 8 : 0), divisor * 8 * _rcF + 3);
                    } else if (ctxKey === "money") {
                        divisor = pick([3, 4, 5, 6, 8]);
                        const perPersonRange = range <= 100 ? rng(2, 12) : rng(2, 20);
                        dividend = divisor * perPersonRange + rng(1, divisor - 1);
                    } else { // cars
                        divisor = pick([4, 5]);
                        dividend = rng(divisor + 2 + (_rcF > 1 ? divisor * 6 : 0), divisor * 6 * _rcF + 3);
                    }
                    quotient = Math.floor(dividend / divisor);
                    remainder = dividend % divisor;
                    safety++;
                } while ((remainder === 0 || quotient < 1) && safety < 25);
                if (remainder === 0) { dividend += 1; quotient = Math.floor(dividend / divisor); remainder = dividend % divisor; }

                let txt, answer, hintMsg;
                if (ctxKey === "buses") {
                    answer = quotient + 1;
                    txt = `${dividend} students need to ride buses to a field trip. Each bus seats ${divisor} students. What is the FEWEST number of buses needed?`;
                    hintMsg = `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}. The leftover ${remainder} student${remainder===1?'':'s'} still need a bus, so round UP. Answer: ${quotient} + 1 = ${answer}.`;
                } else if (ctxKey === "boxes") {
                    answer = quotient;
                    txt = `A library has ${dividend} books to pack in boxes. Each box holds exactly ${divisor} books. How many FULL boxes can be filled?`;
                    hintMsg = `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}. Only complete boxes count, so the leftover ${remainder} doesn't make a full box. Answer: ${quotient}.`;
                } else if (ctxKey === "cookies") {
                    answer = remainder;
                    txt = `${dividend} cookies are shared equally by ${divisor} friends. How many cookies are LEFT OVER?`;
                    hintMsg = `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}. Each friend gets ${quotient} cookies, and ${remainder} cookie${remainder===1?'':'s'} are left over. Answer: ${remainder}.`;
                } else if (ctxKey === "money") {
                    answer = remainder;
                    txt = `$${dividend} is split equally among ${divisor} people. After each person gets the same whole-dollar amount, how many dollars are LEFT OVER?`;
                    hintMsg = `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}. Each person gets $${quotient}, and $${remainder} is left over. Answer: ${remainder}.`;
                } else { // cars
                    answer = quotient + 1;
                    txt = `${dividend} people are traveling in cars. Each car holds ${divisor} passengers. What is the FEWEST number of cars needed?`;
                    hintMsg = `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}. The extra ${remainder} passenger${remainder===1?'':'s'} still need a car, so round UP. Answer: ${quotient} + 1 = ${answer}.`;
                }

                // Build 4 options including the right answer + 2-3 plausible
                // wrong interpretations: quotient (drop), remainder (use), quotient+1 (round up).
                const candidates = new Set([answer, quotient, quotient + 1, remainder]);
                // Also include the dividend ÷ divisor decimal-like wrong (quotient + 2 as filler) if too few
                let safety2 = 0;
                while (candidates.size < 4 && safety2 < 20) {
                    safety2++;
                    candidates.add(quotient + safety2 + 1);
                }
                const opts = shuffle([...candidates].slice(0, 4));

                q.text = txt;
                q.ans = answer;
                q.a = dividend; q.b = divisor; q.op = '÷';
                q.hint = hintMsg;
                q.answerType = "multiple-choice";
                q.options = opts;
                q.skillLabel = 'Remainder Context';
                q.printFormat = 'word-problem';
                return;
            }

            // Division Word Problems
            if (mappedSkill === "div_word_problems") {
                // The "click the numbers you need" variant is a teacher tick now, not a 20% roll (P4).
                if (_responseMode() === 'which-numbers') {
                    const _msc_w = _msc_divWordProblem(rng);
                    if (_applyMscQuestion(q, _msc_w)) return;
                }

                // [worksheet-feedback §8.3] Expanded contexts: money, distance, time,
                // science, school, food, plus original toy contexts.
                const scenarios = [
                    // Original toy / everyday contexts
                    { category: 'toy', icon: bwIcon('apples'), unit: 'apples', action: 'share equally among' },
                    { category: 'toy', icon: bwIcon('cookies'), unit: 'cookies', action: 'divide equally among' },
                    { category: 'toy', icon: bwIcon('stickers'), unit: 'stickers', action: 'give equally to' },
                    { category: 'toy', icon: bwIcon('flowers'), unit: 'flowers', action: 'put equally in' },
                    { category: 'toy', icon: bwIcon('books'), unit: 'books', action: 'place equally on' },
                    { category: 'toy', icon: bwIcon('balloons'), unit: 'balloons', action: 'give equally to' },
                    // Money
                    { category: 'money', icon: bwIcon('coins'), unit: 'dollars', action: 'split equally between' },
                    { category: 'money', icon: bwIcon('coins'), unit: 'cents', action: 'split equally between' },
                    // Science
                    { category: 'science', icon: bwIcon('flowers'), unit: 'seeds', action: 'plant equally in' },
                    { category: 'science', icon: bwIcon('flowers'), unit: 'plants', action: 'put equally in' },
                    { category: 'science', icon: bwIcon('coins'), unit: 'rock samples', action: 'sort equally into' },
                    // School
                    { category: 'school', icon: bwIcon('books'), unit: 'students', action: 'split equally into' },
                    { category: 'school', icon: bwIcon('books'), unit: 'books', action: 'place equally on' },
                    { category: 'school', icon: bwIcon('pencils'), unit: 'school supplies', action: 'pack equally into' },
                    // Food / cooking
                    { category: 'food', icon: bwIcon('cookies'), unit: 'cookies', action: 'divide equally among' },
                    { category: 'food', icon: bwIcon('apples'), unit: 'servings', action: 'serve equally to' },
                    { category: 'food', icon: bwIcon('apples'), unit: 'cups of flour', action: 'split equally into' },
                ];

                const scenario = pick(scenarios);
                // Back-compat alias for downstream visual code.
                scenario.name = scenario.unit;
                scenario.item = scenario.icon;
                const name1 = pickName();

                // Ensure clean division - scale with range
                const wpDivMax = range <= 100 ? 8 : Math.min(Math.ceil(Math.sqrt(range)), 15);
                // LRU rotation across 3 sub-types (was Math.random() chain).
                const roll = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('div_word_problems', ["equal_share","grouping","remainder"], [1,1,1])
                    : (Math.random() < 0.5 ? 'equal_share' : (Math.random() < 0.5 ? 'grouping' : 'remainder'));
                q._variant = roll;
                let groups, perGroup, total, answer;

                const recipients = ['friends', 'boxes', 'bags', 'plates', 'shelves', 'children'];
                const recipient = pick(recipients);
                const recipientSingular = recipient.endsWith('ren') ? 'child' : _singularOf(recipient);   // P8b: not "boxe" / "shelve"

                if (roll === 'equal_share') {
                    // Type 1: Equal sharing — "X items among Y friends, how many each?"
                    groups = rng(2, Math.min(wpDivMax, 10));
                    perGroup = rng(2, wpDivMax);
                    total = groups * perGroup;
                    answer = perGroup;
                    let shareTemplates;
                    if (scenario.category === 'money') {
                        shareTemplates = [
                            `${name1} has ${total} ${scenario.unit} to share equally between ${groups} friends. How many ${scenario.unit} does each friend get?`,
                            `${groups} students earned ${total} ${scenario.unit} together. They split the ${scenario.unit} equally. How many ${scenario.unit} does each student get?`,
                        ];
                    } else if (scenario.category === 'school') {
                        shareTemplates = [
                            `A school has ${total} ${scenario.unit} to ${scenario.action} ${groups} ${recipient}. How many ${scenario.unit} are in each group?`,
                        ];
                    } else if (scenario.category === 'food') {
                        shareTemplates = [
                            `A pot has ${total} ${scenario.unit}. ${name1} serves them equally to ${groups} people. How many ${scenario.unit} does each person get?`,
                        ];
                    } else if (scenario.category === 'science') {
                        shareTemplates = [
                            `${name1} has ${total} ${scenario.unit} to plant equally in ${groups} pots. How many ${scenario.unit} go in each pot?`,
                        ];
                    } else {
                        shareTemplates = [
                            `${name1} has ${total} ${scenario.unit} to ${scenario.action} ${groups} ${recipient}. How many ${scenario.unit} will each ${recipientSingular} get?`,
                            `There are ${total} ${scenario.unit}. They need to be shared equally among ${groups} ${recipient}. How many does each get?`,
                            `${name1} wants to divide ${total} ${scenario.unit} into ${groups} equal groups. How many ${scenario.unit} will be in each group?`,
                        ];
                    }
                    q.text = pick(shareTemplates);
                    q.hint = `Divide to find how many in each group: ${total} / ${groups} = ?`;
                } else if (roll === 'grouping') {
                    // Type 2: Equal grouping — "X items, Y per group, how many groups?"
                    groups = rng(2, Math.min(wpDivMax, 10));
                    perGroup = rng(2, wpDivMax);
                    total = groups * perGroup;
                    answer = groups;
                    const containers = ['bags', 'boxes', 'packs', 'bundles', 'groups'];
                    const container = pick(containers);
                    const containerSingular = _singularOf(container);
                    let groupingTemplates;
                    if (scenario.category === 'money') {
                        groupingTemplates = [
                            `${name1} has ${total} ${scenario.unit}. ${name1} puts ${perGroup} ${scenario.unit} in each ${containerSingular}. How many ${container} does ${name1} need?`,
                        ];
                    } else if (scenario.category === 'food') {
                        groupingTemplates = [
                            `A bakery made ${total} ${scenario.unit}. Each ${containerSingular} holds ${perGroup} ${scenario.unit}. How many ${container} are needed?`,
                        ];
                    } else {
                        groupingTemplates = [
                            `${name1} has ${total} ${scenario.unit}. ${name1} puts ${perGroup} ${scenario.unit} in each ${containerSingular}. How many ${container} does ${name1} need?`,
                            `There are ${total} ${scenario.unit}. If each ${containerSingular} holds ${perGroup} ${scenario.unit}, how many ${container} are needed?`,
                        ];
                    }
                    q.text = pick(groupingTemplates);
                    q.hint = `Divide to find how many groups: ${total} / ${perGroup} = ?`;
                } else if (roll < 0.75) {
                    // Type 3: Measurement — "X total, each gets Y, how many people can share?"
                    groups = rng(2, Math.min(wpDivMax, 10));
                    perGroup = rng(2, wpDivMax);
                    total = groups * perGroup;
                    answer = groups;
                    const measureTemplates = [
                        `${name1} has ${total} ${scenario.unit}. Each ${recipientSingular} gets ${perGroup} ${scenario.unit}. How many ${recipient} can share?`,
                        `A teacher has ${total} ${scenario.unit} to hand out. Each student gets ${perGroup}. How many students get ${scenario.unit}?`,
                    ];
                    q.text = pick(measureTemplates);
                    q.hint = `Divide total by the amount each person gets: ${total} / ${perGroup} = ?`;
                } else if (roll < 0.90) {
                    // Type 4: Array inverse — "X items in Y rows, how many per row?"
                    groups = rng(2, Math.min(wpDivMax, 8));
                    perGroup = rng(2, Math.min(wpDivMax, 8));
                    total = groups * perGroup;
                    answer = perGroup;
                    const arrayInvTemplates = [
                        `${name1} arranged ${total} ${scenario.unit} into ${groups} equal rows. How many ${scenario.unit} are in each row?`,
                        `A display has ${total} ${scenario.unit} in ${groups} rows. Each row has the same number. How many ${scenario.unit} are in one row?`,
                    ];
                    q.text = pick(arrayInvTemplates);
                    q.hint = `Find items per row: ${total} / ${groups} = ?`;
                } else {
                    // Type 5: Rate / unit-rate — distance / time / per-unit division.
                    groups = rng(2, Math.min(wpDivMax, 10));
                    perGroup = rng(2, Math.min(wpDivMax, 10));
                    total = groups * perGroup;
                    answer = perGroup;
                    const rateTemplates = [
                        `${name1} walked ${total} miles in ${groups} days. ${name1} walked the same number of miles each day. How many miles did ${name1} walk each day?`,
                        `A factory made ${total} items in ${groups} hours. How many items did it make per hour?`,
                        `A car drove ${total} miles in ${groups} hours at the same speed. How many miles did it drive each hour?`,
                        `${name1} read ${total} pages in ${groups} days. ${name1} read the same number each day. How many pages did ${name1} read each day?`,
                    ];
                    q.text = pick(rateTemplates);
                    q.hint = `Divide total by the number of units: ${total} / ${groups} = ?`;
                }

                q.ans = answer;
                q.a = total; q.b = groups; q.op = '÷';

                // P8b (mixed_division critic): the picture drew min(groups, 5) groups of
                // min(perGroup, 6) items under a caption "36 books in 6 equal groups" — a picture
                // of 30 books for a story about 36, a caption that stated the answer on every
                // grouping item, and an equation builder that prefilled the divisor with the
                // answer. The picture is now the TOTAL, drawn ungrouped in rows of ten (the pupil
                // makes the groups), and only when it is small enough to count (<= 100).
                if (total <= 100) {
                    const pitch = 22, r = 7;
                    const cols = Math.min(10, total), rows = Math.ceil(total / 10);
                    let dots = '';
                    for (let k = 0; k < total; k++) {
                        const cx = pitch * (k % 10) + pitch / 2 + (k % 10 >= 5 ? 6 : 0);
                        const cy = pitch * Math.floor(k / 10) + pitch / 2;
                        dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${_WS_INK}" stroke-width="1.5"/>`;
                    }
                    const w = cols * pitch + (cols > 5 ? 6 : 0), h = rows * pitch;
                    q.visual = `<div class="word-problem-visual" style="text-align:center;">`
                        + `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${total} counters" `
                        + `style="display:block;margin:6px auto;max-width:100%;height:auto;">${dots}</svg></div>`;
                } else {
                    q.visual = '';
                }

                q.options = buildNumericOptions(answer);

                // ── Column workmat (col-arith / 'div' mode) ──
                // Divisor depends on which factor the WP names. equal_share
                // and the rate fallback divide by `groups`; grouping divides
                // by `perGroup`. Both produce a clean integer quotient.
                let _divisorWP;
                if (roll === 'grouping') _divisorWP = perGroup;
                else _divisorWP = groups;
                if (Number.isFinite(total) && Number.isFinite(_divisorWP) && _divisorWP > 0
                    && total % _divisorWP === 0 && answer >= 0) {
                    q.answerType = 'col-arith';
                    q.colMode = 'div';
                    q.dividend = total;
                    q.divisor = _divisorWP;
                    q.remainder = 0;
                    q.decimalPlaces = 0;
                }
                return;
            }

            // Regular operations (original logic)
            let ops = [];
            let factsMode = false; // For limiting to fact ranges
            let factsRange = 20; // Default for addition/subtraction facts
            let addSub10s = false; // For add/subtract by 10s skill
            let addSub100s = false; // For add/subtract by 100s skill
            
            if (mappedSkill === "mixed" || mappedSkill === "operations_all" || state.skill === "operations_all") ops = ["+", "-", "×", "÷"];
            else if (mappedSkill === "mixed_add_sub") ops = ["+", "-"];
            else if (mappedSkill === "mixed_mult_div") ops = ["×", "÷"];
            // Facts skills - restricted ranges for quick recall
            // P11: the fact band ("Facts to", skill-options.js) bounds the sum / the number you start from.
            else if (mappedSkill === "add_facts") { ops = ["+"]; factsMode = true; factsRange = Number(_opt('band')) || 20; }
            else if (mappedSkill === "add_sub_10s") { ops = ["+", "-"]; addSub10s = true; }
            else if (mappedSkill === "add_sub_100s") { ops = ["+", "-"]; addSub100s = true; }
            else if (mappedSkill === "sub_facts") { ops = ["-"]; factsMode = true; factsRange = Number(_opt('band')) || 20; }
            else if (mappedSkill === "mult_facts") { ops = ["×"]; factsMode = true; factsRange = 12; }
            else if (mappedSkill === "div_facts") { ops = ["÷"]; factsMode = true; factsRange = 12; }
            else if (mappedSkill === "add" || mappedSkill === "addition") ops = ["+"];
            else if (mappedSkill === "subtract" || mappedSkill === "subtraction") ops = ["-"];
            else if (mappedSkill === "multiply" || mappedSkill === "multiplication") ops = ["×"];
            else if (mappedSkill === "divide" || mappedSkill === "division") ops = ["÷"];
            // Handle category-based mixed modes
            else if (state.category === "number_ops_mixed") ops = ["+", "-", "×", "÷"];
            else if (state.category === "addition") ops = ["+"];
            else if (state.category === "subtraction") ops = ["-"];
            else if (state.category === "multiplication") ops = ["×"];
            else if (state.category === "division") ops = ["÷"];
            else ops = ["+"]; // Default to addition if skill not recognized
            const op = pick(ops);
            
            // Handle Add/Subtract by 10s skill
            if (addSub10s) {
                const isAdd = Math.random() < 0.5;
                if (isAdd) {
                    const base = rng(0, 9) * 10; // 0, 10, 20, ..., 90
                    q.text = `${base} + 10 = ?`;
                    q.ans = base + 10;
                    q.a = base; q.b = 10; q.op = '+';
                    q.hint = `When adding 10, the tens digit goes up by 1. ${base} + 10 = ${base + 10}`;
                    q.options = buildNumericOptions(q.ans, 10);
                    q.skillLabel = '+/− 10s';
                } else {
                    const base = rng(1, 10) * 10; // 10, 20, ..., 100
                    q.text = `${base} − 10 = ?`;
                    q.ans = base - 10;
                    q.a = base; q.b = 10; q.op = '-';
                    q.hint = `When subtracting 10, the tens digit goes down by 1. ${base} − 10 = ${base - 10}`;
                    q.options = buildNumericOptions(q.ans, 10);
                    q.skillLabel = '+/− 10s';
                }
                return;
            }
            
            // Handle Add/Subtract by 100s skill
            if (addSub100s) {
                const isAdd = Math.random() < 0.5;
                if (isAdd) {
                    const base = rng(0, 9) * 100; // 0, 100, 200, ..., 900
                    q.text = `${base} + 100 = ?`;
                    q.ans = base + 100;
                    q.a = base; q.b = 100; q.op = '+';
                    q.hint = `When adding 100, the hundreds digit goes up by 1. ${base} + 100 = ${base + 100}`;
                    q.options = buildNumericOptions(q.ans, 100);
                    q.skillLabel = '+/− 100s';
                } else {
                    const base = rng(1, 10) * 100; // 100, 200, ..., 1000
                    q.text = `${base} − 100 = ?`;
                    q.ans = base - 100;
                    q.a = base; q.b = 100; q.op = '-';
                    q.hint = `When subtracting 100, the hundreds digit goes down by 1. ${base} − 100 = ${base - 100}`;
                    q.options = buildNumericOptions(q.ans, 100);
                    q.skillLabel = '+/− 100s';
                }
                return;
            }

            // ========================================
            // MISSING NUMBER / MISSING OPERATOR — MOVED OUT (P4, item 3 + 4)
            // ========================================
            // `add`, `subtract`, `multiply` and `divide` used to divert 10% of their items
            // into a missing-OPERATOR question and another 20% into a missing-NUMBER one. The
            // missing-operator branch picked its operation at random AFTER the skill had already
            // chosen one, so "Basic Addition" printed "12 ? 7 = 84" answered × — the audit read
            // it as "mixes operations in one skill" and "silently mixes 3 print formats", and
            // both branches turned a write-the-number item into multiple choice on screen, which
            // P-29 forbids in that direction. Both jobs already have their own skills, so the
            // branches are gone rather than re-gated:
            //   missing number, + and −   →  subtraction:missing_add_sub
            //   missing number, × and ÷   →  division:missing_mult_div
            //   missing operator          →  no skill today; design/catalogue/addition.md and
            //                                mult-div-integers.md both say to drop it from this
            //                                family, not to move it.

            // For facts mode, use restricted ranges
            let a, b;
            if (factsMode) {
                if (op === "+" || op === "-") {
                    // The teacher's ticked fact set decides the constant (ruling 4); the band
                    // still bounds the ANSWER (ruling 1), so the other number is whatever is
                    // left inside `factsRange`. Nothing here can leave the band, which is what
                    // the old `a = rng(1, 20); b = rng(1, 20 - a); if (b < 1) b = 1;` could not
                    // say — a = 20 left no room for b, the guard fired, and a sheet headed
                    // "within 20" printed 20 + 1 = 21.
                    // P8: a FACT pairs the constant with a single-digit partner (operations-facts-v2
                    // §2.2: n from 0 to min(9, band − c)). The old partner ran to the band, so
                    // "Addition Facts (within 20)" printed 2 + 13 and 1 + 12 — teen + ones, not
                    // facts. On a mixed page (every set ticked) the constants are the single-digit
                    // ones, 2 to 9, the partner is 2 to 9 too, and one cell in ten deals a +0/+1/+10
                    // fact so those still appear without filling a quarter of the sheet.
                    const _mixedFacts = _factsAllTicked();
                    const _trivial = _mixedFacts && _factTrivialSlot();
                    // P11: a mixed page deals only the constants the fact band can hold ("facts to 5").
                    let factC = factConstantFor(_mixedFacts ? (_trivial ? [0, 1, 10] : [2, 3, 4, 5, 6, 7, 8, 9]).filter(c => c <= factsRange) : undefined);
                    if (factC !== null && op === "+") {
                        const hi = Math.max(0, Math.min(9, factsRange - factC));
                        // P11: under a small band ("facts to 5") a partner of 2+ would pin every sum to the band.
                        const lo = (_mixedFacts && !_trivial) ? Math.min(factsRange >= 10 ? 2 : 1, hi) : 0;
                        const other = rng(lo, hi);
                        // The constant sits on either side, so the pupil meets 6 + 4 and 4 + 6.
                        if (rng(0, 1) === 1) { a = factC; b = other; } else { a = other; b = factC; }
                    } else if (factC !== null) {
                        // "Subtract 6": the constant is what is taken away, and the minuend is
                        // large enough that the difference is never negative.
                        b = factC;
                        const _sHi = Math.max(0, Math.min(9, factsRange - factC));
                        a = factC + rng((_mixedFacts && !_trivial) ? Math.min(factsRange >= 10 ? 2 : 1, _sHi) : 0, _sHi);
                        if (a === 0) a = rng(1, factsRange);   // never print 0 − 0
                    } else {
                        // No constant option on this skill: draw the SUM first and split it, so
                        // the sums spread evenly over the band instead of bunching low.
                        const factSum = rng(2, factsRange);
                        a = rng(1, factSum - 1);
                        b = factSum - a;
                    }
                } else {
                    // Multiplication/division facts (1-12 tables)
                    a = rng(1, factsRange);
                    b = rng(1, factsRange);
                }
            } else {
                a = rng(1, range);
                b = rng(1, range);
            }

            if (op === "×") {
                // Determine if this is a basic fact (12×12 or less) or needs column multiplication
                // For ranges 10, 20, 50, 100: use basic 12×12 tables
                const useFullTables = factsMode || [10, 20, 50, 100].includes(range); // R3: the fact band wins over Max Number (768 × 5 on a facts page)
                // NOTATION (CONTRACT 2). Column multiplication is not a notation choice: beyond
                // 12 × 12 the item needs partial-product rows, so it stays stacked.
                const _multAsked = notationFor('×');
                const multNotation = useFullTables ? _multAsked : 'stacked';
                q.notation = multNotation;
                if (multNotation !== _multAsked) q.notationClampedFrom = _multAsked;

                if (useFullTables) {
                    // Basic multiplication facts (1-12 × 1-12) - can be horizontal or simple vertical
                    // The ticked TIMES set decides the table (ruling 4). The Number Selection
                    // grid still narrows it when the teacher has narrowed it, and is the whole
                    // source when this skill declares no constant option.
                    const _tables = ensureTables();
                    // P8: on a mixed page (every set ticked) the × 0 and × 1 facts are capped at
                    // one cell in ten; see _factsAllTicked. A ticked 0s or 1s set is dealt in full.
                    const _mixedM = factsMode && _factsAllTicked();
                    const _trivialM = _mixedM && _factTrivialSlot();
                    const _untouched = !_tables || _tables.length >= 12;
                    // P11: "Tables to 10 × 10" (band 100) keeps both factors to 10.
                    const _tMax = factsMode && Number(_opt('band')) === 100 ? 10 : 12;
                    const _mNarrow = ((_mixedM && !_trivialM && _untouched) ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : (_tables || Array.from({ length: 13 }, (_, i) => i))).filter(v => v <= _tMax);
                    const multC = factConstantFor(_tMax < 12 ? (_mNarrow.length >= 12 ? _mNarrow.slice(0, 11) : _mNarrow) : ((_mixedM && !_trivialM && _untouched) ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : _tables));
                    if (multC !== null) {
                        a = multC;
                        b = _mixedM ? (_trivialM ? rng(0, 1) : rng(2, _tMax))
                            : rng(0, _tMax);     // from 0, so the zero facts are actually drilled
                    } else {
                        a = pick(_tables);
                        b = rng(1, 12);
                    }
                    q.ans = a * b;
                    q.hint = (a === 0 || b === 0)
                        ? `Any number of groups of 0 is 0, and 0 groups of any number is 0. ${a} × ${b} = 0`
                        : `Think: ${b} groups of ${a}. Count by ${a}s: ${Array.from({length: Math.min(b, 5)}, (_, i) => a * (i + 1)).join(", ")}${b > 5 ? ", ..." : ""}`;

                    // Add visual hint with array for smaller numbers. A zero fact has no array
                    // to draw, so it takes the sentence instead.
                    if (a >= 1 && b >= 1 && a <= 10 && b <= 10) {
                        q.hintVisual = createDotArray(b, a, `${b} rows × ${a} = ${a * b}`);
                    } else {
                        q.hintVisual = `<div style="font-weight:600;text-align:center;">${b} groups of ${a}:<br>${Array.from({length: Math.min(b, 4)}, () => a).join(" + ")}${b > 4 ? " + ..." : ""} = <span style="color:var(--accent-green);">${a * b}</span></div>`;
                    }
                    // PRINT: a one-line fact, written the way the teacher chose
                    // (CONTRACT 2). Stacked is the default for ×.
                    if (multNotation === 'across') {
                        q.printFormat = "mult-facts-horizontal";
                        q.visual = '';
                    } else {
                        q.printFormat = "mult-facts-vertical";
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                            <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                                <div style="padding:2px 0;">${a}</div>
                                <div style="border-bottom:3px solid var(--text-bright);padding:2px 0;"><span style="margin-right:10px;color:var(--accent-purple);">×</span>${b}</div>
                            </div>
                        </div>`;
                    }
                } else {
                    // ALWAYS use column multiplication for problems beyond 12×12
                    // Per-grade caps (worksheet-feedback §8.1):
                    //   Grade 3: 1-digit × up to 3-digit  → a ∈ [13,999], b ∈ [2,9]
                    //   Grade 4: 2-digit × 2-digit         → a, b ∈ [11,99]
                    const _multCaps = multCapsForGrade(_skillGrade);
                    const _aCap = _multCaps.aMax !== null ? Math.min(range, _multCaps.aMax) : range;
                    const _bCap = _multCaps.bMax !== null ? Math.min(range, _multCaps.bMax) : range;
                    const colMultMax2d = Math.max(13, Math.min(_aCap, 999));
                    const colMultMax2x2a = Math.max(11, Math.min(Math.floor(_aCap / 2), 99));
                    const colMultMax2x2b = Math.max(11, Math.min(Math.floor(_bCap / 3), 99));

                    // Grade 3: stick to 2x1 (1-digit × 3-digit). Grade 4+: mix 2x1 and 2x2.
                    const _allowTwoByTwo = (_bCap >= 11);
                    const problemType = (!_allowTwoByTwo || Math.random() < 0.7) ? '2x1' : '2x2';

                    if (problemType === '2x1') {
                        a = rng(13, colMultMax2d);
                        b = rng(2, Math.max(2, Math.min(9, _bCap)));
                    } else {
                        a = rng(11, colMultMax2x2a);
                        b = rng(11, colMultMax2x2b);
                    }
                    
                    q.ans = a * b;
                    const uniqueIdMult = Date.now() + Math.random().toString(36).substr(2, 9);
                    
                    // Parse digits for display
                    const ones_b = b % 10;
                    const tens_b = Math.floor(b / 10);
                    const isTwoDigitMultiplier = b >= 10;
                    
                    // Calculate partial products with EXACT digit counts
                    const partial1 = a * ones_b;
                    const partial2 = isTwoDigitMultiplier ? a * tens_b * 10 : 0; // Include the 0
                    const answerLen = q.ans.toString().length;
                    const partial1Len = partial1.toString().length;
                    const partial2Len = isTwoDigitMultiplier ? partial2.toString().length : 0;
                    
                    // Display width based on largest number we need to show
                    const displayWidth = Math.max(a.toString().length, b.toString().length, answerLen);
                    const paddedMultA = a.toString().padStart(displayWidth, ' ').split('');
                    const paddedMultB = b.toString().padStart(displayWidth, ' ').split('');
                    
                    // Carry boxes = one fewer than the number of digits in what we're multiplying
                    const carryBoxCount = a.toString().length;
                    
                    q.hint = isTwoDigitMultiplier 
                        ? `Multiply ${a} × ${ones_b} first, then ${a} × ${tens_b}0, then add the partial products.`
                        : `Multiply each digit: ${a} × ${b}. Carry when needed.`;
                    
                    q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1rem;">
                        <div style="font-weight:700;margin-bottom:10px;">Column Multiplication</div>
                        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-purple);">
                            <!-- Carry boxes for first multiplication -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                                ${Array(carryBoxCount).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-carry-input" data-col="${uniqueIdMult}-carry1-${i}" style="width:22px;height:16px;border:1px dashed var(--accent-purple);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.65rem;color:var(--accent-purple);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            <!-- First number -->
                            <div style="padding-bottom:5px;">
                                <span style="margin-right:10px;">&nbsp;</span>${paddedMultA.map(d => `<span style="display:inline-block;width:22px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <!-- Second number with × -->
                            <div style="border-bottom:3px solid #444;padding:5px 0;">
                                <span style="margin-right:10px;">×</span>${paddedMultB.map(d => `<span style="display:inline-block;width:22px;text-align:center;">${d}</span>`).join('')}
                            </div>

                            <!-- Partial Product 1: multiply by ones digit -->
                            <div style="padding-top:6px;font-size:0.7rem;color:var(--accent-orange);text-align:left;">
                                <span style="margin-left:4px;">${a} × ${ones_b} =</span>
                            </div>
                            <div style="padding-top:2px;${isTwoDigitMultiplier ? '' : 'border-bottom:3px solid #444;padding-bottom:6px;'}">
                                <span style="margin-right:10px;">&nbsp;</span>${Array(partial1Len).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-work-input" data-col="${uniqueIdMult}-p1-${i}" style="width:22px;height:22px;border:1px solid var(--accent-orange);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.9rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                            </div>

                            ${isTwoDigitMultiplier ? `
                            <!-- Partial Product 2: multiply by tens digit (with trailing 0) -->
                            <div style="padding-top:6px;font-size:0.7rem;color:var(--accent-cyan);text-align:left;">
                                <span style="margin-left:4px;">${a} × ${tens_b}0 =</span>
                            </div>
                            <div style="border-bottom:3px solid #444;padding-top:2px;padding-bottom:6px;">
                                <span style="margin-right:10px;">+</span>${Array(partial2Len).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-work-input" data-col="${uniqueIdMult}-p2-${i}" style="width:22px;height:22px;border:1px solid var(--accent-cyan);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.9rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                            </div>
                            
                            <!-- Carry boxes for final addition -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-top:4px;margin-bottom:2px;padding-right:2px;">
                                ${Array(answerLen - 1).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-carry-input" data-col="${uniqueIdMult}-carry2-${i}" style="width:22px;height:16px;border:1px dashed var(--accent-green);border-radius:3px;background:var(--bg-card-light);text-align:center;font-size:0.65rem;color:var(--accent-green);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            ` : ''}

                            <!-- Final Answer row -->
                            <div style="padding-top:${isTwoDigitMultiplier ? '2px' : '8px'};font-size:0.7rem;color:var(--accent-green);text-align:left;font-weight:700;">
                                <span style="margin-left:4px;">Final Answer:</span>
                            </div>
                            <div style="padding-top:2px;color:var(--accent-green);font-weight:700;">
                                <span style="margin-right:10px;">=</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdMult}-ans-${i}" style="width:22px;height:24px;border:2px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.8rem;color:var(--text-secondary);">
                            ${isTwoDigitMultiplier ? 'Step 1: Multiply by ones • Step 2: Multiply by tens (add 0) • Step 3: Add' : 'Multiply each digit, carry when needed'}
                        </div>
                    </div>`;
                    
                    q.options = []; // No multiple choice for column multiplication
                    // PRINT: this branch already teaches column multiplication on
                    // screen; say so, so print renders the stacked cell instead of
                    // the screen visual (partial-product rows and all).
                    q.printFormat = "column-mult";
                }
            } else if (op === "÷") {
                // For ranges 10, 20, 50, 100: ignore range and use full 12×12 tables
                const useFullTables = factsMode || [10, 20, 50, 100].includes(range); // R3: the fact band wins over Max Number (768 × 5 on a facts page)

                // NOTATION (was: 50/50 coin toss between the bracket and a bare sentence, so one
                // page mixed them). The teacher's choice now decides it. A multi-digit dividend
                // is not a notation choice: it keeps the bracket, because that is where the
                // working goes.
                const _divAsked = notationFor('÷');
                const divNotation = useFullTables ? _divAsked : 'bracket';
                const useLongDiv = divNotation === 'bracket';
                q.notation = divNotation;
                // Say so rather than ignoring it in silence: print-generate.js reads
                // notationClampedFrom so the dialog can tell the teacher what was overruled.
                if (divNotation !== _divAsked) q.notationClampedFrom = _divAsked;

                if (useLongDiv && useFullTables) {
                    // Simple long division style for 12×12 facts (divisor⟌dividend with answer on top)
                    const divisor = pick(ensureTables());
                    const result = rng(1, 12);
                    a = divisor * result;  // Dividend (up to 144)
                    b = divisor;
                    q.ans = result;
                    q.hint = `How many times does ${b} go into ${a}? Think: ${b} × ? = ${a}. Use the multiplication fact: ${b} × ${result} = ${a}`;
                    // Add visual hint with grouping/array
                    if (a <= 60 && b <= 10) {
                        q.hintVisual = createDotArray(result, b, `${a} ÷ ${b} = ${result} groups`);
                    } else {
                        q.hintVisual = `<div style="font-weight:600;text-align:center;">Split ${a} into groups of ${b}:<br>${b} × <span style="color:var(--accent-green);font-weight:700;">${result}</span> = ${a}</div>`;
                    }

                    const uniqueIdSimpleDiv = Date.now() + Math.random().toString(36).substr(2, 9);
                    const divDigitsSimple = a.toString().split('');
                    q.visual = `<!-- Long Division --><div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.2rem;">
                        <div style="font-weight:700;margin-bottom:10px;color:var(--accent-cyan);">Long Division</div>
                        <div style="display:inline-block;background:var(--bg-card);padding:25px 30px;border-radius:12px;border:2px solid var(--accent-cyan);">
                            <div style="display:flex;align-items:flex-start;gap:6px;">
                                <!-- Divisor on the left -->
                                <div style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);padding-top:50px;">${b}</div>

                                <!-- Division bracket with answer on top -->
                                <div>
                                    <!-- Answer boxes on top -->
                                    <div style="display:flex;justify-content:center;gap:4px;margin-bottom:4px;">
                                        ${divDigitsSimple.map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdSimpleDiv}-quot-${i}" style="width:36px;height:36px;border:2px solid var(--accent-green);border-radius:6px;background:var(--bg-card-light);text-align:center;font-size:1.3rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                                    </div>
                                    <!-- Division bracket (top line and left hook) with dividend -->
                                    <div style="border-top:3px solid #444;border-left:3px solid #444;padding:10px 15px 8px 12px;border-top-left-radius:8px;">
                                        <div style="display:flex;gap:4px;">
                                            ${divDigitsSimple.map(d => `<span style="display:inline-block;width:36px;text-align:center;font-size:1.5rem;font-weight:700;">${d}</span>`).join('')}
                                        </div>
                                    </div>
                                    ${divDigitsSimple.length === 1 ? '' : `<!-- Work area for subtraction -->
                                    <div style="padding:8px 15px 0 12px;">
                                        <div style="position:relative;display:flex;gap:4px;align-items:center;">
                                            <span style="position:absolute;right:100%;padding-right:6px;font-size:0.9rem;color:var(--text-dim);">−</span>
                                            ${divDigitsSimple.map(() => `<input type="text" maxlength="2" class="column-work-input" style="width:36px;height:28px;border:1px solid var(--text-dim);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                                        </div>
                                        <div style="border-top:2px solid #444;margin:4px 0;width:${divDigitsSimple.length * 36 + (divDigitsSimple.length - 1) * 4}px;"></div>
                                        <div style="display:flex;gap:4px;">
                                            ${divDigitsSimple.map(() => `<input type="text" maxlength="2" class="column-work-input" style="width:36px;height:28px;border:1px dashed var(--text-dim);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                                        </div>
                                    </div>`}
                                </div>
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
                            ${b} ) ${a} &nbsp;•&nbsp; Divide, Multiply, Subtract
                        </div>
                    </div>`;
                    // PRINT: bracket division on screen, bracket division on paper. The item is a
                    // one-line fact written under a bracket, so it prints as the compact
                    // div-facts-long cell (CONTRACT 2), not the multi-digit working layout.
                    q.printFormat = "div-facts-long";
                } else if (useLongDiv && !useFullTables) {
                    // Long division for larger problems - scale quotient with range
                    // Per-grade caps (worksheet-feedback §8.1):
                    //   Grade 3: 2-digit ÷ 1-digit (dividend ≤ 99, divisor ≤ 9)
                    //   Grade 4: 4-digit ÷ 1-digit (dividend ≤ 9999, divisor ≤ 9)
                    //   Grade 5+: multi-digit dividends and divisors
                    const _divCaps = divCapsForGrade(_skillGrade);
                    const _divisorMax = _divCaps.divisorMax !== null ? Math.min(9, _divCaps.divisorMax) : 9;
                    const _dividendCap = _divCaps.dividendMax !== null ? Math.min(range, _divCaps.dividendMax) : range;
                    b = rng(2, Math.max(2, _divisorMax)); // divisor
                    const ldMaxQ = Math.max(2, Math.min(Math.floor(_dividendCap / b), 99));
                    const result = rng(2, ldMaxQ); // quotient scaled by range
                    a = b * result; // dividend (ensures clean division)
                    q.ans = result;
                    q.hint = `Use long division: How many times does ${b} go into ${a}? Think: ${b} × ? = ${a}`;

                    // Visual long division - format depends on problem size
                    const divDigits = a.toString().split('');
                    const quotientLen = result.toString().length;
                    const uniqueIdDiv = Date.now() + Math.random().toString(36).substr(2, 9);
                    const needsWorkingArea = a > 144; // Only show working area for problems larger than 144/12

                    // Worked example hint with steps
                    const firstDigit = parseInt(divDigits[0]);
                    const quotientFirstDigit = Math.floor(firstDigit / b);
                    const remainder1 = firstDigit - (quotientFirstDigit * b);
                    q.hintVisual = `<div style="text-align:left;font-size:0.85rem;line-height:1.6;">
                        <div style="font-weight:700;color:var(--accent-cyan);margin-bottom:8px;">Worked Example: ${a} ÷ ${b}</div>
                        <div style="padding-left:10px;">
                            <div><strong>Step 1:</strong> How many ${b}s in ${a}?</div>
                            <div><strong>Step 2:</strong> ${b} × ${result} = ${a}</div>
                            <div><strong>Answer:</strong> <span style="color:var(--accent-green);font-weight:700;">${result}</span></div>
                            <div style="margin-top:8px;padding:8px;background:rgba(0,0,0,0.1);border-radius:6px;text-align:center;font-family:monospace;">
                                <div style="display:flex;align-items:center;justify-content:center;gap:8px;">
                                    <span>${b}</span>
                                    <span style="border-top:2px solid currentColor;border-left:2px solid currentColor;padding:4px 12px 4px 8px;border-top-left-radius:6px;">${a}</span>
                                </div>
                                <div style="color:var(--accent-green);font-weight:700;margin-top:4px;">= ${result}</div>
                            </div>
                        </div>
                    </div>`;

                    if (needsWorkingArea) {
                        // Full format with working area for larger problems
                        q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.2rem;">
                            <div style="font-weight:700;margin-bottom:15px;">Long Division</div>
                            <div style="display:inline-block;background:var(--bg-card);padding:25px 30px;border-radius:12px;border:2px solid var(--accent-cyan);">
                                <div style="display:flex;align-items:flex-end;gap:8px;">
                                    <!-- Divisor on the left -->
                                    <div style="font-size:1.5rem;font-weight:700;color:var(--accent-orange);padding-bottom:10px;">${b}</div>

                                    <div style="min-width:${divDigits.length * 40 + 20}px;">
                                        <!-- Quotient (answer) on top with label -->
                                        <div style="font-size:0.75rem;color:var(--accent-green);text-align:left;margin-bottom:2px;font-weight:700;">
                                            Answer:
                                        </div>
                                        <div style="display:flex;gap:4px;padding-left:15px;margin-bottom:4px;">
                                            ${divDigits.map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdDiv}-quot-${i}" style="width:36px;height:36px;border:2px solid var(--accent-green);border-radius:6px;background:var(--bg-card-light);text-align:center;font-size:1.2rem;color:var(--accent-green);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                                        </div>

                                        <!-- Division bracket (top line and left hook) with dividend -->
                                        <div style="border-top:3px solid #444;border-left:3px solid #444;padding:8px 10px 8px 15px;border-top-left-radius:8px;margin-bottom:10px;">
                                            ${divDigits.map(d => `<span style="display:inline-block;width:36px;text-align:center;font-size:1.3rem;font-weight:700;">${d}</span>`).join('')}
                                        </div>

                                        <!-- Working area label -->
                                        <div style="font-size:0.75rem;color:var(--text-dim);text-align:left;margin-bottom:4px;padding-left:4px;">
                                            Work area:
                                        </div>

                                        <!-- Working area for multiply/subtract steps (interactive) -->
                                        <div style="padding-left:15px;">
                                            ${Array(4).fill(0).map((_, rowIdx) => `
                                                <div style="display:flex;gap:4px;margin-bottom:8px;">
                                                    ${divDigits.map((_, colIdx) => `<input type="text" maxlength="2" class="column-work-input" data-col="${uniqueIdDiv}-work-${rowIdx}-${colIdx}" style="width:36px;height:30px;border:1px solid var(--text-dim);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;">`).join('')}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="margin-top:12px;font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">
                                Divide • Multiply • Subtract • Bring down • Repeat
                            </div>
                        </div>`;
                    } else {
                        // Simple format without working area for smaller problems (≤144)
                        q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.2rem;">
                            <div style="font-weight:700;margin-bottom:15px;">Long Division</div>
                            <div style="display:inline-block;background:var(--bg-card);padding:25px 30px;border-radius:12px;border:2px solid var(--accent-cyan);">
                                <div style="display:flex;align-items:flex-end;gap:4px;">
                                    <!-- Divisor on the left -->
                                    <div style="font-size:1.8rem;font-weight:700;color:var(--accent-orange);padding-bottom:8px;">${b}</div>

                                    <!-- Division bracket with answer on top -->
                                    <div>
                                        <!-- Answer box on top -->
                                        <div style="display:flex;justify-content:center;margin-bottom:4px;">
                                            <input type="text" maxlength="2" class="column-answer-input" data-col="${uniqueIdDiv}-quot-0" style="width:70px;height:45px;border:3px solid var(--accent-green);border-radius:8px;background:var(--bg-card-light);text-align:center;font-size:1.5rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">
                                        </div>
                                        <!-- Division bracket (top line and left hook) with dividend -->
                                        <div style="border-top:3px solid #444;border-left:3px solid #444;padding:10px 20px 8px 15px;border-top-left-radius:8px;">
                                            <span style="font-size:1.8rem;font-weight:700;">${a}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style="margin-top:12px;font-size:0.9rem;color:var(--text-secondary);">
                                ${b} ) ${a} = ?
                            </div>
                        </div>`;
                    }
                    // PRINT: bracket division with a work grid (see the
                    // 'long-division' handler in print-generate.js).
                    q.printFormat = "long-division";
                } else {
                    // Regular division facts (based on 1-12 tables, ignores max number range)
                    // The ticked DIVIDE BY set decides the divisor (ruling 4). Ticking 0 cannot
                    // mean "divide by 0" — that is not a fact, it is undefined — so the zero set
                    // for division is the one it actually is: 0 shared into any number of groups
                    // is 0. The quotient also runs from 0, which is the other zero fact.
                    const _divTables = ensureTables();
                    // P8: as for ×, a mixed page caps 0 ÷ n, n ÷ 1 and n ÷ n at one cell in ten.
                    const _mixedD = factsMode && _factsAllTicked();
                    const _trivialD = _mixedD && _factTrivialSlot();
                    const _untouchedD = !_divTables || _divTables.length >= 12;
                    // P11: "Tables to 10 × 10" (band 100) keeps the divisor and the quotient to 10.
                    const _dMax = factsMode && Number(_opt('band')) === 100 ? 10 : 12;
                    const _dNarrow = ((_mixedD && !_trivialD && _untouchedD) ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : (_divTables || Array.from({ length: 13 }, (_, i) => i))).filter(v => v <= _dMax);
                    const divC = factConstantFor(_dMax < 12 ? (_dNarrow.length >= 12 ? _dNarrow.slice(0, 11) : _dNarrow) : ((_mixedD && !_trivialD && _untouchedD) ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : _divTables));
                    let divisor, result;
                    if (divC === 0) {
                        divisor = rng(1, _dMax);
                        result = 0;
                    } else if (divC !== null) {
                        divisor = divC;
                        result = _mixedD ? (_trivialD ? rng(0, 1) : rng(2, _dMax)) : rng(0, _dMax);
                    } else {
                        divisor = pick(_divTables);
                        result = rng(1, 12);
                    }
                    a = divisor * result;  // Dividend can be up to 144, regardless of range setting
                    b = divisor;
                    q.ans = result;
                    q.hint = a === 0
                        ? `There is nothing to share. 0 shared into ${b} equal groups puts 0 in each group.`
                        : `How many groups of ${b} can you make from ${a}? Think: ${b} × ? = ${a}. Use the multiplication fact: ${b} × ${result} = ${a}`;
                    // Add visual hint with grouping/array. A zero dividend has no groups to draw.
                    if (result >= 1 && a <= 60 && b <= 10) {
                        q.hintVisual = createDotArray(result, b, `${a} ÷ ${b} = ${result} groups`);
                    } else {
                        q.hintVisual = `<div style="font-weight:600;text-align:center;">Split ${a} into groups of ${b}:<br>${b} × <span style="color:var(--accent-green);font-weight:700;">${result}</span> = ${a}</div>`;
                    }
                    // PRINT: a recall fact, not column work. The teacher's notation decides
                    // whether it is written across or on a fraction bar (CONTRACT 2). Clear any
                    // visual the branches above left behind so the format is clean.
                    if (divNotation === 'fraction') {
                        q.printFormat = "div-facts-fraction";
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:2rem;font-weight:700;">
                            <div style="display:inline-flex;flex-direction:column;align-items:center;">
                                <span style="padding:0 15px;">${a}</span>
                                <span style="border-top:3px solid var(--text-bright);padding:4px 15px;">${b}</span>
                            </div>
                            <span style="margin-left:12px;vertical-align:middle;">= ?</span>
                        </div>`;
                    } else {
                        q.printFormat = "div-facts-horizontal";
                        q.visual = '';
                    }
                }
            } else if (op === "-") {
                // NOTATION (was: a 50/50 coin toss between column and horizontal inside one
                // page). The teacher's choice decides it now. Above Max Number 100 the item is
                // multi-digit column work and stays stacked whatever was chosen; decimals keep
                // the one-line cell, because the column widget cannot render a decimal point.
                const subNotation = factsMode ? 'stacked' : notationFor('−');
                const useColumnSub = factsMode ? false : (state.decimalPlaces > 0 ? false : (range > 100 ? true : (range >= 20 && subNotation === 'stacked')));
                q.notation = useColumnSub ? 'stacked' : (state.decimalPlaces > 0 ? 'across' : subNotation);
                if (useColumnSub && subNotation === 'across') q.notationClampedFrom = 'across';

                if (useColumnSub) {
                    // Column subtraction: larger numbers
                    // Fix range calculation - ensure min is less than max for random numbers
                    const minSubVal = Math.max(10, Math.floor(range / 4));
                    // Worksheet-feedback §8.2: Strategic regrouping gate.
                    // ~50% of column-subtraction problems should require
                    // regrouping in at least 2 columns; ~15% of those (when
                    // range >= 1000) should regroup across a zero digit.
                    const _wantRegroupSub = range >= 100 && Math.random() < 0.5;
                    const _wantAcrossZeroSub = _wantRegroupSub && range >= 1000 && Math.random() < 0.15;
                    let _pickedSub = false;
                    for (let _att = 0; _att < 20 && !_pickedSub; _att++) {
                        a = rng(Math.min(minSubVal, range - 1), range);
                        b = rng(Math.max(1, Math.floor(a / 4)), Math.max(2, Math.floor(a * 0.7)));
                        if (a <= b) continue;
                        if (!_wantRegroupSub) { _pickedSub = true; break; }
                        if (_wantAcrossZeroSub) {
                            if (_subHasAcrossZero(a, b) && _subRequiresRegrouping(a, b, 1)) {
                                _pickedSub = true; break;
                            }
                        } else if (_subRequiresRegrouping(a, b, 2)) {
                            _pickedSub = true; break;
                        }
                    }
                    if (!_pickedSub) {
                        // Fallback: ensure a > b at minimum.
                        a = rng(Math.min(minSubVal, range - 1), range);
                        b = rng(Math.max(1, Math.floor(a / 4)), Math.max(2, Math.floor(a * 0.7)));
                        if (a < b) [a, b] = [b, a];
                    }
                    q.ans = a - b;
                    q.hint = `Use column subtraction: Line up the digits by place value. Start from the ones column and work left. Borrow if needed!`;

                    // Visual column subtraction with EXACT digit counts
                    const answerLen = q.ans.toString().length;
                    const displayLen = a.toString().length; // Minuend determines width
                    const subDigitsA = a.toString().split('');
                    const subDigitsB = b.toString().padStart(displayLen, ' ').split('');
                    const uniqueIdSub = Date.now() + Math.random().toString(36).substr(2, 9);
                    q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.1rem;">
                        <div style="font-weight:700;margin-bottom:10px;">Column Subtraction</div>
                        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-pink);">
                            <!-- Regrouping boxes for borrowing (interactive inputs) -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                                ${subDigitsA.map((_, i) => `<input type="text" maxlength="2" class="column-carry-input" data-col="${uniqueIdSub}-borrow-${i}" style="width:24px;height:18px;border:1px dashed var(--accent-orange);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:0.65rem;color:var(--accent-orange);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            <div style="padding-bottom:5px;">
                                <span style="margin-right:12px;">&nbsp;</span>${subDigitsA.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="border-bottom:3px solid #444;padding:5px 0;">
                                <span style="margin-right:12px;">−</span>${subDigitsB.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="padding-top:8px;color:var(--accent-green);font-weight:700;">
                                <span style="margin-right:12px;">&nbsp;</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueIdSub}-ans-${i}" style="width:24px;height:24px;border:1px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
                            Type in boxes • Use top row for borrowing
                        </div>
                    </div>`;
                    // PRINT: the skill is teaching column subtraction here, so
                    // print the stacked cell (place-value heads + regroup boxes),
                    // not the screen widget.
                    q.printFormat = "column-sub";
                    // P8: below Max Number 100 this is a Grade 1-2 basic-facts page (the
                    // regrouping gate above only fires from 100), so the regroup row is a hint
                    // scaffold with nothing to hold — the critic found it over 19 − 4 and 15 − 3.
                    // Boxes stay on regrouping pages, where VA-10/VA-22 put them over every column.
                    if (range < 100) q.regroup = false;
                } else {
                    // Regular subtraction (mental math)
                    if (state.decimalPlaces > 0 && !factsMode) { a = applyDecimals(a); b = applyDecimals(b); }
                    if (a < b) [a, b] = [b, a];
                    q.ans = state.decimalPlaces > 0 ? parseFloat((a - b).toFixed(state.decimalPlaces)) : a - b;
                    q.hint = `Start at ${a.toLocaleString()} and count back ${b.toLocaleString()}. Or think: ${q.ans.toLocaleString()} + ${b.toLocaleString()} = ${a.toLocaleString()}`;
                    q.visual = `<div style="font-weight:700;">${a.toLocaleString()} − ${b.toLocaleString()}<br>Start at ${a.toLocaleString()}, count back ${b.toLocaleString()}</div>`;
                    // PRINT: a one-line item, written the way the teacher chose (CONTRACT 2).
                    // Decimals keep 'basic-sub', whose cell carries a decimal point and a wide
                    // answer rule; the fact cells do not. factsMode overrides this below.
                    if (state.decimalPlaces > 0) {
                        q.printFormat = "basic-sub";
                    } else if (subNotation === 'across') {
                        q.printFormat = "sub-facts-horizontal";
                    } else {
                        q.printFormat = "sub-facts-vertical";
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                            <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                                <div style="padding:2px 0;">${a}</div>
                                <div style="border-bottom:3px solid var(--text-bright);padding:2px 0;"><span style="margin-right:10px;color:var(--accent-orange);">−</span>${b}</div>
                            </div>
                        </div>`;
                    }
                }
            } else {
                // NOTATION (was: a 50/50 coin toss between column and horizontal inside one
                // page). Same rule as subtraction above: above Max Number 100 the item is
                // multi-digit column work and stays stacked; decimals keep the one-line cell.
                const addNotation = factsMode ? 'stacked' : notationFor('+');
                const useColumnAdd = factsMode ? false : (state.decimalPlaces > 0 ? false : (range > 100 ? true : (range >= 20 && addNotation === 'stacked')));
                q.notation = useColumnAdd ? 'stacked' : (state.decimalPlaces > 0 ? 'across' : addNotation);
                if (useColumnAdd && addNotation === 'across') q.notationClampedFrom = 'across';

                if (useColumnAdd) {
                    // Column addition: larger numbers
                    // Fix range calculation - ensure min is less than max for random numbers
                    const minAddVal = Math.max(5, Math.floor(range / 4));
                    // Worksheet-feedback §8.2: Strategic regrouping gate.
                    // ~50% of column-addition problems should require carrying
                    // in at least 2 columns (e.g., 4,867 + 3,548).
                    const _wantRegroupAdd = range >= 100 && Math.random() < 0.5;
                    let _pickedAdd = false;
                    for (let _att = 0; _att < 20 && !_pickedAdd; _att++) {
                        a = rng(Math.min(minAddVal, range - 1), range);
                        b = rng(Math.min(minAddVal, range - 1), range);
                        if (!_wantRegroupAdd) { _pickedAdd = true; break; }
                        if (_addRequiresRegrouping(a, b, 2)) { _pickedAdd = true; break; }
                    }
                    if (!_pickedAdd) {
                        a = rng(Math.min(minAddVal, range - 1), range);
                        b = rng(Math.min(minAddVal, range - 1), range);
                    }
                    q.ans = a + b;
                    q.hint = `Use column addition: Line up the digits by place value. Start from the ones column and work left. Carry if the sum is 10 or more!`;

                    // Visual column addition with interactive input boxes
                    // Use EXACT digit counts for each number
                    const answerLen = q.ans.toString().length;
                    const displayLen = Math.max(a.toString().length, b.toString().length);
                    const paddedAddA = a.toString().padStart(displayLen, ' ').split('');
                    const paddedAddB = b.toString().padStart(displayLen, ' ').split('');
                    const carryBoxCount = displayLen; // One carry box per column
                    const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
                    q.visual = `<div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:1.1rem;">
                        <div style="font-weight:700;margin-bottom:10px;">Column Addition</div>
                        <div style="display:inline-block;text-align:right;background:var(--bg-card);padding:15px 20px;border-radius:12px;border:2px solid var(--accent-green);">
                            <!-- Regrouping boxes for carrying (interactive inputs) -->
                            <div style="display:flex;justify-content:flex-end;gap:2px;margin-bottom:4px;padding-right:2px;">
                                ${Array(carryBoxCount).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-carry-input" data-col="${uniqueId}-carry-${i}" style="width:24px;height:18px;border:1px dashed var(--accent-cyan);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:0.75rem;color:var(--accent-cyan);font-family:inherit;padding:0;" placeholder="">`).join('')}
                            </div>
                            <div style="padding-bottom:5px;">
                                <span style="margin-right:12px;">&nbsp;</span>${paddedAddA.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="border-bottom:3px solid #444;padding:5px 0;">
                                <span style="margin-right:12px;">+</span>${paddedAddB.map(d => `<span style="display:inline-block;width:24px;text-align:center;">${d}</span>`).join('')}
                            </div>
                            <div style="padding-top:8px;color:var(--accent-green);font-weight:700;">
                                <span style="margin-right:12px;">&nbsp;</span>${Array(answerLen).fill(0).map((_, i) => `<input type="text" maxlength="1" class="column-answer-input" data-col="${uniqueId}-ans-${i}" style="width:24px;height:24px;border:1px solid var(--accent-green);border-radius:4px;background:var(--bg-card-light);text-align:center;font-size:1rem;color:var(--text-primary);font-family:inherit;padding:0;font-weight:700;">`).join('')}
                            </div>
                        </div>
                        <div style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);">
                            Type in boxes • Use top row for carrying
                        </div>
                    </div>`;
                    // PRINT: the skill is teaching column addition here, so print
                    // the stacked cell (carry boxes and all), not the screen widget.
                    q.printFormat = "column-add";
                    // P8: as for subtraction, no carry row on a below-100 basic page (the critic
                    // found carry boxes over 5 + 20 and 10 + 6, which cannot regroup).
                    if (range < 100) q.regroup = false;
                } else {
                    // Regular addition (mental math)
                    if (state.decimalPlaces > 0 && !factsMode) { a = applyDecimals(a); b = applyDecimals(b); }
                    q.ans = state.decimalPlaces > 0 ? parseFloat((a + b).toFixed(state.decimalPlaces)) : a + b;
                    q.hint = `Start at ${a.toLocaleString()} and count up ${b.toLocaleString()}. Or: ${a.toLocaleString()} + ${b.toLocaleString()} = ?`;
                    q.visual = `<div style="font-weight:700;">${a.toLocaleString()} + ${b.toLocaleString()}<br>Start at ${a.toLocaleString()}, count up ${b.toLocaleString()}</div>`;
                    // PRINT: a one-line item, written the way the teacher chose (CONTRACT 2).
                    // Decimals keep 'basic-add', whose cell carries a decimal point and a wide
                    // answer rule; the fact cells do not. factsMode overrides this below.
                    if (state.decimalPlaces > 0) {
                        q.printFormat = "basic-add";
                    } else if (addNotation === 'across') {
                        q.printFormat = "add-facts-horizontal";
                    } else {
                        q.printFormat = "add-facts-vertical";
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                            <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                                <div style="padding:2px 0;">${a}</div>
                                <div style="border-bottom:3px solid var(--text-bright);padding:2px 0;"><span style="margin-right:10px;color:var(--accent-green);">+</span>${b}</div>
                            </div>
                        </div>`;
                    }
                }
            }
            // P8: the printed/read minus is the true minus sign U+2212, never the hyphen (the
            // critic found "19 - 4" on Basic Subtraction). q.op keeps '-' for the renderers.
            q.text = `${a.toLocaleString()} ${op === '-' ? '−' : op} ${b.toLocaleString()} = ?`;
            q.a = a;
            q.b = b;
            q.op = op;
            
            // NOTATION for the four fact drills. These used to roll the format per item — add /
            // sub / mult 50-50 stacked-or-across, div three ways 1:1:1 — so one printed page
            // mixed them (owner report, 2026-09-19; catalogue addition.md "horizontal and
            // vertical mixed on the same page"). The teacher chooses it once instead.
            if (factsMode) {
                // Clear any previous visual (number line, Long Division, etc.) so format is clean
                const savedHintVisual = q.hintVisual; // Preserve hint visual

                if (op === '+') {
                    const useVertical = notationFor('+') !== 'across';
                    q.notation = useVertical ? 'stacked' : 'across';
                    q.printFormat = useVertical ? 'add-facts-vertical' : 'add-facts-horizontal';
                    q.skillLabel = 'Add Facts';
                    if (useVertical) {
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                            <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                                <div style="padding:2px 0;">${a}</div>
                                <div style="border-bottom:3px solid var(--text-bright);padding:2px 0;"><span style="margin-right:10px;color:var(--accent-green);">+</span>${b}</div>
                            </div>
                        </div>`;
                    } else {
                        // Horizontal: clear column/long-div visuals, keep only hint visual
                        q.visual = '';
                    }
                } else if (op === '-' || op === '\u2212') {
                    const useVertical = notationFor('\u2212') !== 'across';
                    q.notation = useVertical ? 'stacked' : 'across';
                    q.printFormat = useVertical ? 'sub-facts-vertical' : 'sub-facts-horizontal';
                    q.skillLabel = 'Sub Facts';
                    if (useVertical) {
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                            <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                                <div style="padding:2px 0;">${a}</div>
                                <div style="border-bottom:3px solid var(--text-bright);padding:2px 0;"><span style="margin-right:10px;color:var(--accent-orange);">\u2212</span>${b}</div>
                            </div>
                        </div>`;
                    } else {
                        q.visual = '';
                    }
                } else if (op === '\u00d7') {
                    const useVertical = notationFor('\u00d7') !== 'across';
                    q.notation = useVertical ? 'stacked' : 'across';
                    q.printFormat = useVertical ? 'mult-facts-vertical' : 'mult-facts-horizontal';
                    q.skillLabel = 'Mult Facts';
                    if (useVertical) {
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                            <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                                <div style="padding:2px 0;">${a}</div>
                                <div style="border-bottom:3px solid var(--text-bright);padding:2px 0;"><span style="margin-right:10px;color:var(--accent-purple);">\u00d7</span>${b}</div>
                            </div>
                        </div>`;
                    } else {
                        q.visual = '';
                    }
                } else if (op === '\u00f7') {
                    // The three division notations are three ladder steps, not a per-item
                    // shuffle (catalogue mult-div-integers.md, DV-A4). The teacher picks one.
                    const _divNot = notationFor('\u00f7');
                    const roll = _divNot === 'bracket' ? 'long' : (_divNot === 'fraction' ? 'fraction' : 'horiz');
                    q.notation = _divNot;
                    q._variant = roll;
                    q.skillLabel = 'Div Facts';
                    // Clear any Long Division visual from operator-specific code above
                    q.visual = '';
                    if (roll === 'horiz') {
                        q.printFormat = 'div-facts-horizontal';
                    } else if (roll === 'fraction') {
                        q.printFormat = 'div-facts-fraction';
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:2rem;font-weight:700;">
                            <div style="display:inline-flex;flex-direction:column;align-items:center;">
                                <span style="padding:0 15px;">${a}</span>
                                <span style="border-top:3px solid var(--text-bright);padding:4px 15px;">${b}</span>
                            </div>
                            <span style="margin-left:12px;vertical-align:middle;">= ?</span>
                        </div>`;
                    } else {
                        q.printFormat = 'div-facts-long';
                        q.visual = `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:2rem;font-weight:700;">
                            <div style="display:inline-flex;align-items:flex-end;gap:4px;">
                                <span style="color:var(--accent-orange);padding-bottom:8px;">${b}</span>
                                <div style="border-top:3px solid var(--text-bright);border-left:3px solid var(--text-bright);padding:8px 20px 8px 15px;border-top-left-radius:8px;">${a}</div>
                            </div>
                            <div style="margin-top:8px;font-size:1rem;color:var(--text-dim);">${a} \u00f7 ${b} = ?</div>
                        </div>`;
                    }
                }

                q.hintVisual = savedHintVisual; // Restore hint visual
            }
            q.options = buildNumericOptions(q.ans);
            return;
}

export function generateIntegersQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // Integers Category
            const intSkill = mappedSkill === "mixed" ? pick(["number_line_int", "compare_int", "add_int", "sub_int", "integer_nl_drag"]) : mappedSkill;
            
            // Scale integer range: range 10→10, 100→20, 1000→50
            // O2 (2026-09-25): the skill's own "Numbers from" band (skill-options.js, `band`: −N to N)
            // replaces the Max Number scaling. It bounds EVERY number on the item, the answer too;
            // unset (the default) the old scaling runs unchanged.
            const intBand = (mappedSkill !== 'mixed' && state.skillOptions && typeof state.skillOptions.band === 'number'
                && state.skillOptions.band > 0) ? state.skillOptions.band : null;
            const intMax = intBand || Math.max(10, Math.min(Math.ceil(range / 5), 50));

            if (intSkill === "number_line_int") {
                // Number lines with negatives
                const target = rng(-intMax, intMax);
                q.ans = target;
                q.text = `What integer is shown on the number line?`;
                q.hint = `Zero is in the middle. Numbers to the left are negative!`;
                
                // Dynamic number line based on target range
                const nlRange = Math.max(10, Math.abs(target) + 5);
                const nlMin = -nlRange;
                const nlMax = nlRange;
                const nlSpan = nlMax - nlMin;
                const tickPos = ((target - nlMin) / nlSpan) * 100;
                const nlTickStep = nlRange <= 10 ? 1 : nlRange <= 25 ? 5 : 10;
                // Landmark labels: always 0, leftmost, rightmost, plus ±5 and ±10 if within range
                const landmarkSet = new Set([0, nlMin, nlMax]);
                for (const lm of [-10, -5, 5, 10]) {
                    if (lm >= nlMin && lm <= nlMax) landmarkSet.add(lm);
                }
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Integer Number Line</div>
                    <svg width="340" height="80" viewBox="0 0 340 80" style="max-width:100%;">
                        <line x1="20" y1="40" x2="320" y2="40" stroke="currentColor" stroke-width="2"/>
                        ${(() => {
                            let ticks = '';
                            for (let val = nlMin; val <= nlMax; val += nlTickStep) {
                                const x = 20 + ((val - nlMin) / nlSpan) * 300;
                                const isLandmark = landmarkSet.has(val);
                                // Major (labeled) ticks are taller and thicker; minor ticks shorter
                                ticks += `<line x1="${x}" y1="${isLandmark ? 28 : 35}" x2="${x}" y2="${isLandmark ? 52 : 45}" stroke="currentColor" stroke-width="${isLandmark ? 2.5 : 1}"/>`;
                                // Label landmark ticks, but skip the one at the arrow position to avoid revealing the answer
                                if (isLandmark && val !== target) {
                                    ticks += `<text x="${x}" y="68" text-anchor="middle" fill="currentColor" font-size="12" font-weight="600">${val}</text>`;
                                }
                            }
                            return ticks;
                        })()}
                        <polygon points="${20 + tickPos * 3 - 6},18 ${20 + tickPos * 3 + 6},18 ${20 + tickPos * 3},28" fill="var(--accent-green)"/>
                        <text x="${20 + tickPos * 3}" y="12" text-anchor="middle" fill="var(--accent-green)" font-size="12" font-weight="bold">?</text>
                    </svg>
                </div>`;
                q.options = buildNumericOptions(target);
                q.integerData = { target };
                q.printFormat = "integer-number-line";
            } else if (intSkill === "integer_nl_drag") {
                // Drag-onto-number-line — integers on [-10, 10] with whole-number ticks.
                // ~35% multi-target so single-marker stays the dominant flow.
                const lineMin = -(intBand || 10);
                const lineMax = intBand || 10;
                const isMulti = Math.random() < 0.35;
                const numCount = isMulti ? 3 : 1;
                // Sample distinct non-zero integers in (lineMin, lineMax) so the
                // student is always placing meaningful negatives/positives.
                const candidates = [];
                for (let v = lineMin + 1; v <= lineMax - 1; v++) {
                    if (v !== 0) candidates.push(v);
                }
                shuffle(candidates);
                const chosen = candidates.slice(0, numCount).sort((a, b) => a - b);
                const targets = chosen.map(v => ({ value: v, label: String(v) }));

                q.text = isMulti
                    ? `Drag each integer onto the correct tick on the number line.`
                    : `Drag ${chosen[0]} onto the correct tick on the number line.`;
                q.printText = isMulti
                    ? `Mark each integer on the correct tick of the number line.`
                    : `Mark ${chosen[0]} on the correct tick of the number line.`;
                q.ans = targets.map(t => t.value);
                q.answerType = "nl-drag";
                q.nlData = {
                    min: lineMin, max: lineMax, tickStep: 1, labelStep: 5,
                    mode: 'integer',
                    ...(intBand && intBand !== 10 ? { labelStep: intBand <= 5 ? 1 : 5 } : {}),
                    targets,
                };
                q.hint = `Zero is in the middle. Negative numbers are to the LEFT of zero, positive to the RIGHT.`;
                q.printFormat = "nl-drag";
                q.skillLabel = isMulti ? "Drag Integers on Number Line (Multi)" : "Drag Integer on Number Line";
                return;
            } else if (intSkill === "compare_int" && Math.random() < 0.30) {
                const threshold = rng(-Math.floor(intMax / 2), Math.floor(intMax / 2));
                const direction = pick(['greater', 'less']);
                const correctCount = randInt(2, 4);
                const totalCount = randInt(6, 8);
                const candidates = new Set();
                let safety = 0;
                while (candidates.size < correctCount && safety < 100) {
                    safety++;
                    const v = direction === 'greater'
                        ? rng(threshold + 1, intMax)
                        : rng(-intMax, threshold - 1);
                    candidates.add(v);
                }
                safety = 0;
                while (candidates.size < totalCount && safety < 200) {
                    safety++;
                    const v = direction === 'greater'
                        ? rng(-intMax, threshold)
                        : rng(threshold, intMax);
                    candidates.add(v);
                }
                const arr = shuffle(Array.from(candidates));
                const options = arr.map((v, i) => ({
                    id: 'opt' + i,
                    label: String(v),
                    correct: direction === 'greater' ? v > threshold : v < threshold
                }));
                const ans = options.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL integers ${direction === 'greater' ? 'greater than' : 'less than'} ${threshold}.`;
                q.ans = ans;
                q.options = options;
                q.answerType = 'multi-select-check';
                q.hint = `On a number line, numbers further to the right are greater.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Compare Integers';
                return;
            } else if (intSkill === "compare_int") {
                // Comparing integers - scale with range
                let a = rng(-intMax, intMax);
                let b = rng(-intMax, intMax);
                while (a === b) b = rng(-intMax, intMax);
                const symbol = a > b ? ">" : "<";
                q.ans = symbol;
                q.answerType = "choice";
                q.text = `Compare: ${a} ___ ${b}`;
                q.hint = `On a number line, the number further RIGHT is greater!`;
                q.options = [">", "<", "="];
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Compare Integers</div>
                    <div style="font-size:2.2rem;margin:20px 0;">
                        <span style="color:${a < 0 ? 'var(--accent-orange)' : 'var(--accent-green)'};font-weight:700;">${a}</span>
                        <span style="margin:0 20px;border:2px dashed var(--text-dim);padding:8px 20px;border-radius:8px;">?</span>
                        <span style="color:${b < 0 ? 'var(--accent-orange)' : 'var(--accent-green)'};font-weight:700;">${b}</span>
                    </div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-top:10px;">Think: Which is further right on the number line?</div>
                </div>`;
                q.integerData = { a, b, answer: symbol };
                q.printFormat = "integer-compare";
            } else if (intSkill === "add_int") {
                // Adding integers - scale with range
                const intAddMax = intBand || Math.max(10, Math.floor(intMax * 0.75));
                let a = rng(-intAddMax, intAddMax);
                let b = rng(-intAddMax, intAddMax);
                // A band bounds the answer too.
                for (let t = 0; intBand && Math.abs(a + b) > intBand && t < 50; t++) b = rng(-intAddMax, intAddMax);
                const result = a + b;
                q.ans = result;
                q.text = `${a} + ${b >= 0 ? b : '(' + b + ')'} = ?`;
                q.hint = `Same signs: add and keep sign. Different signs: subtract and keep sign of larger!`;
                
                const aColor = a < 0 ? '#e74c3c' : '#27ae60';
                const bColor = b < 0 ? '#e74c3c' : '#27ae60';
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Adding Integers</div>
                    <div style="font-size:1.8rem;margin:15px 0;">
                        <span style="color:${aColor};font-weight:700;padding:5px 12px;background:rgba(${a < 0 ? '231,76,60' : '39,174,96'},0.15);border-radius:8px;">${a}</span>
                        <span style="margin:0 10px;font-weight:700;">+</span>
                        <span style="color:${bColor};font-weight:700;padding:5px 12px;background:rgba(${b < 0 ? '231,76,60' : '39,174,96'},0.15);border-radius:8px;">${b >= 0 ? b : '(' + b + ')'}</span>
                        <span style="margin:0 10px;">=</span>
                        <span style="border-bottom:3px solid #444;padding:0 15px;font-weight:700;">?</span>
                    </div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin-top:15px;font-size:0.85rem;">
                        <div style="color:var(--text-dim);">(+)Positive chips: ${a >= 0 ? a : 0} + ${b >= 0 ? b : 0} = ${(a >= 0 ? a : 0) + (b >= 0 ? b : 0)}</div>
                        <div style="color:var(--text-dim);">(-)Negative chips: ${a < 0 ? Math.abs(a) : 0} + ${b < 0 ? Math.abs(b) : 0} = ${(a < 0 ? Math.abs(a) : 0) + (b < 0 ? Math.abs(b) : 0)}</div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.integerData = { a, b, result, op: '+' };
                q.a = a; q.b = b; q.op = '+';
                q.printFormat = "integer-add";
            } else if (intSkill === "sub_int") {
                // Subtracting integers - scale with range
                const intSubMax = intBand || Math.max(10, Math.floor(intMax * 0.75));
                let a = rng(-intSubMax, intSubMax);
                let b = rng(-intSubMax, intSubMax);
                for (let t = 0; intBand && Math.abs(a - b) > intBand && t < 50; t++) b = rng(-intSubMax, intSubMax);
                const result = a - b;
                q.ans = result;
                q.text = `${a} − ${b >= 0 ? b : '(' + b + ')'} = ?`;
                q.hint = `Subtracting is the same as adding the opposite! ${a} − ${b} = ${a} + ${-b}`;
                
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Subtracting Integers</div>
                    <div style="font-size:1.6rem;margin:15px 0;">
                        <span style="font-weight:700;">${a}</span>
                        <span style="margin:0 8px;font-weight:700;">−</span>
                        <span style="font-weight:700;">${b >= 0 ? b : '(' + b + ')'}</span>
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:280px;">
                        <div style="font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">Add the Opposite!</div>
                        <div style="font-size:1.3rem;">${a} + <span style="color:var(--accent-orange);font-weight:700;">${-b >= 0 ? '(+' + (-b) + ')' : '(' + (-b) + ')'}</span> = <span style="border-bottom:2px dashed var(--accent-green);padding:0 10px;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(result);
                q.integerData = { a, b, result, op: '-' };
                q.a = a; q.b = b; q.op = '-';
                q.printFormat = "integer-sub";
            }
            return;
}
