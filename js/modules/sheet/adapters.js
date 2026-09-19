// js/modules/sheet/adapters.js
// The DEFAULT ADAPTERS (SKILL_CELL_CONTRACT.md section 4): what a skill that declares nothing
// still supplies, so all 573 skills reach every page role on day one, before a single family
// has been rewritten.
//
// Each default is derived from something the app ALREADY has:
//
//   renderCell    the legacy print handler, wrapped in a standard cell (the `legacy` template)
//   workedSteps   generateWorkedSolution, then generateSolutionSteps, then q.hint
//   wrongAnswer   tagged distractors, then q.options, then a typed perturbation
//   strings       the skill label + the CONTROLLED instruction library (never free composition)
//   footprint     SKILL_PRINT_SIZE, then PRINT_FORMAT_SIZE, then 'standard'
//   options       optionsFor() from skill-options.js
//
// THE INJECTION DECISION (SCC-01, SCC-A1).
// Four of those six live above this layer: `formatProblemForPrint`, `generateWorkedSolution`
// and `extractAnswerKeyHint` are in `print-generate.js`; `generateSolutionSteps` is in
// `solution-display.js`; `getSkillPrintSize` and the label tables are in `data.js`;
// `optionsFor` is in `skill-options.js`. Importing any of them here would drag `state.js`,
// `storage.js`, `window` and DOM work into the kit and break its purity rule - and it would
// make the import graph cyclic, because those modules will eventually want to call the kit.
//
// So the host INJECTS them, once, before bootstrap:
//
//     import { installLegacyAdapters } from './modules/sheet/adapters.js';
//     installLegacyAdapters({
//         formatLegacy:   formatProblemForPrint,      // print-generate.js
//         workedSolution: generateWorkedSolution,     // print-generate.js
//         solutionSteps:  generateSolutionSteps,      // solution-display.js
//         answerKeyHint:  extractAnswerKeyHint,       // print-generate.js
//         printSize:      getSkillPrintSize,          // data.js
//         sizeColumns:    PRINT_SIZE_COLUMNS,         // data.js
//         fullLabels:     SKILL_FULL_LABELS,          // data.js
//         shortLabel:     getSkillLabelForQuestion,   // game-control.js
//         skillOptions:   optionsFor,                 // skill-options.js
//     });
//
// Nothing is injected yet in the shipping app: this phase adds a PARALLEL path and a later
// agent wires the strangler hook. Until then the adapters answer with their empty forms
// (SCC-A1), which is exactly what the dev gallery and the coverage harness exercise.
//
// Pure module (SCC-01): no `window`, no `state`, no DOM, no `Math.random`. Randomness comes
// from `rng.js` under a seed derived from the question, so the same question always yields the
// same wrong answer - an answer key and the page it belongs to can never disagree.

import { register } from './registry.js';
import { esc, blank, cell } from './cell.js';
import { resolveCtx, PAPER, DEFAULT_PAPER, SIZES } from './tokens.js';
import { rng, int, deriveSeed } from './rng.js';
import { installDefaultAdapters, instructionFor } from './contract.js';

/* =========================================================== the injected legacy surface */

const DEP_KEYS = [
    'formatLegacy', 'workedSolution', 'solutionSteps', 'answerKeyHint',
    'printSize', 'printSizeTable', 'formatSizeTable', 'sizeColumns',
    'fullLabels', 'shortLabel', 'skillOptions',
];

/** @type {Object<string, *>} */
const DEPS = Object.create(null);
for (const k of DEP_KEYS) DEPS[k] = null;

/**
 * Install the legacy functions the default adapters borrow. Unknown keys are ignored, so a
 * host that injects more than this build knows about does not crash it.
 * @returns {string[]} the keys that are now installed
 */
export function installLegacyAdapters(fns = {}) {
    for (const k of DEP_KEYS) if (fns[k] !== undefined && fns[k] !== null) DEPS[k] = fns[k];
    return installedLegacy();
}

/** Which injected dependencies are present. The coverage report prints this. */
export const installedLegacy = () => DEP_KEYS.filter((k) => DEPS[k] != null);

/** Test seam: forget every injected function and go back to the empty forms. */
export function resetLegacyAdapters() { for (const k of DEP_KEYS) DEPS[k] = null; }

/** Read-only view, for tests and the gallery banner. */
export const legacyDeps = () => Object.assign({}, DEPS);

const callDep = (name, args, fallback = null) => {
    const fn = DEPS[name];
    if (typeof fn !== 'function') return fallback;
    try { return fn(...args); } catch (e) { return fallback; }
};

/* ============================================================== helpers (pure, no DOM) */

const stripTags = (html) => String(html == null ? '' : html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * SCC-A2: the legacy formatter REWRITES `problem.text` and `problem.visual` in place, so every
 * call gets a shallow clone. Without it a second render (the answer key, a thumbnail) would
 * double-process the same strings.
 * The `cell` key is dropped so the payload can never cycle back into itself (SCC-Q5).
 */
function legacyClone(q) {
    const out = {};
    for (const k of Object.keys(q || {})) if (k !== 'cell') out[k] = q[k];
    return out;
}

/**
 * SCC-A: remove the legacy problem-number header. The contract's own note says to do this with
 * a detached `<template>` element, but that is DOM, and SCC-01 forbids the kit from touching
 * the DOM. The header is a single flat `<div class="p-head ...">` whose children are `<span>`s
 * (print-generate.js, `headerHtml`), so a non-greedy string match removes exactly it and
 * nothing else. Recorded here because it is a deliberate departure from the written note.
 */
const stripLegacyHead = (html) => String(html || '').replace(/<div class="p-head[\s\S]*?<\/div>\s*/i, '');

const isNumeric = (v) => typeof v === 'number'
    ? Number.isFinite(v)
    : typeof v === 'string' && /^-?[\d,]+(\.\d+)?$/.test(v.trim());
const toNumber = (v) => Number(String(v).replace(/,/g, ''));

/** A seed that depends only on the question, so a wrong answer is stable across renders. */
const questionSeed = (q) => deriveSeed(
    (q && q.categoryId) || '', (q && q.skillId) || '', String((q && q.text) || ''),
    String((q && q.ans) === undefined ? '' : q.ans), (q && q.seed) || 0,
);

/* =================================================== 1. renderCell: the `legacy` template */

/** PRINT_SIZE_COLUMNS (data.js), repeated only as the fallback when it is not injected. */
const SIZE_COLS = { compact: 3, standard: 2, medium: 2, wide: 1, spacious: 1 };

/**
 * Formats that ARE one-line facts (gen-operations.js writes them), plus the four fact skills.
 * Only these are eligible for the 5-10 column fact layouts by default (section 4.6).
 */
const FACT_FORMAT_RE = /-facts-(vertical|horizontal|fraction|long)$/;
const FACT_SKILLS = new Set(['add_facts', 'sub_facts', 'mult_facts', 'div_facts']);

/**
 * A key `PRINT_FORMAT_SIZE` can never hold, used to ask `getSkillPrintSize` what the SKILL
 * alone would answer. Only reached when the host injects the function but not the tables.
 */
const NO_SUCH_FORMAT = '__ws_no_such_print_format__';

/**
 * The stamped answer row a legacy cell grows in the three non-blank states (section 4.2).
 *
 * KNOWN LIMITATION, recorded rather than hidden: many legacy branches already draw their own
 * "Answer: ____" line, and the adapter cannot fill it without parsing 230 different shapes of
 * HTML. So a legacy cell in state `answered` shows the answer twice - once as the legacy
 * blank, left empty, and once as this stamp. The geometry therefore does NOT match the pupil
 * page, which means the legacy default does not satisfy SCC-T10 (the key is a facsimile). Only
 * a real cell template fixes that; the stamp is tagged `data-ws-stamp` so the lint can find
 * every cell where it still applies.
 */
function stamp(key, ctx) {
    if (ctx.state === 'blank') return '';
    const value = ctx.state === 'wrong'
        ? (ctx.wrong && ctx.wrong.value !== undefined ? ctx.wrong.value : '')
        : (key && key.display !== undefined ? key.display : '');
    if (value === '' || value === null || value === undefined) return '';
    const ink = ctx.state === 'traced' ? 'trace' : 'solid';
    const cls = ctx.state === 'traced' && ctx.photocopySafe ? ' ws-dotted' : ctx.state === 'traced' ? ' ws-trace' : '';
    return `<div class="ws-legacy-answer" data-ws-stamp="1" data-ws-slot="answer" data-ws-shape="line" data-ws-ink="${ink}">`
        + `<span class="ws-zone">Answer</span><span class="ws-legacy-value${cls}">${esc(value)}</span></div>`;
}

/**
 * The `legacy` template. `register()` returns the stored object, so `LEGACY_TEMPLATE` is the
 * very same template the registry serves - `defaultRenderCell` calls straight through it
 * instead of resolving the registry again on every cell.
 */
const LEGACY_TEMPLATE = register('legacy', {
    /**
     * SCC-Q5: the ONE template whose payload is not plain data - it is the whole legacy problem
     * object, HTML and all. Everything else in the kit carries data only.
     */
    fromQuestion: legacyClone,

    render(p, ctx) {
        const key = this.answerKey(p);
        if (ctx.mode === 'screen') {
            // The screen hosts keep today's path: they already print `q.visual` (or the text)
            // inside their own card. The cell reproduces that, so print and screen show the
            // same picture, and adds the parity slot.
            const body = p.visual ? String(p.visual) : `<span class="ws-legacy-text">${esc(stripTags(p.text))}</span>`;
            const slot = blank({ id: 'answer', kind: 'text', shape: 'line', digits: 4, graded: true, order: 0, scopes: ['full', 'answer-only'] }, ctx, key);
            return `<div class="ws-legacy" data-ws-legacy-mode="screen">${body}<div class="ws-legacy-slot">${slot}</div></div>`;
        }
        const size = p.__sizeCategory || 'standard';
        // SCC-A3: columns capped at 9 so the legacy ten-column shortcut never fires in a cell.
        // SCC-A4: showSkillLabels is always false - the kit owns labels.
        const cols = Math.max(1, Math.min(9, Number(ctx.columns) || SIZE_COLS[size] || 2));
        const html = callDep('formatLegacy', [legacyClone(p), 0, cols, size, false], null);
        if (html == null) {
            // SCC-A1: nothing injected. Answer honestly with the text and one line, never a blank box.
            const slot = blank({ id: 'answer', kind: 'text', shape: 'line', digits: 4, graded: true, order: 0, scopes: ['full', 'answer-only'] }, ctx, key);
            return `<div class="ws-legacy ws-legacy--bare">${p.text ? `<span class="ws-legacy-text">${esc(stripTags(p.text))}</span>` : ''}${slot}</div>`;
        }
        // `print-edition` is the host class the legacy print markup is written against: every
        // rule for `.stack`, `.rg-box`, `.stack-answer`, `.eq .blank-box` and the rest is
        // scoped under it in css/print-worksheet.css. Without it a column-addition cell draws
        // the digits and NOTHING to write in - the regroup boxes, the sum rule and the answer
        // blanks all vanish. The class carries no colour: `.print-edition`'s tokens are already
        // retargeted onto the standard's black / white / single-grey palette.
        return `<div class="ws-legacy print-edition">${stripLegacyHead(html)}${stamp(key, ctx)}</div>`;
    },

    answerKey(p) {
        const value = p && p.ans !== undefined ? p.ans : '';
        // SCC-A7: a simple value stamps itself; anything else is stamped with the legacy hint.
        let display;
        if (value !== null && typeof value === 'object') {
            const hint = callDep('answerKeyHint', [p], '');
            display = hint ? `${hint} = ${JSON.stringify(value)}` : JSON.stringify(value);
        } else {
            display = typeof value === 'number' ? value.toLocaleString('en-US') : String(value);
        }
        return { value, display, slots: { answer: { value: String(display), graded: true, accept: [String(value)] } } };
    },

    footprint(p, ctx) {
        // Reached either from `defaultRenderCell` (which has already resolved the size class
        // onto the payload) or straight from `cellFootprint()`, where nothing has. Resolve it
        // here too, so the two paths can never disagree about a cell's width.
        const resolved = p.__sizeCategory ? null : defaultFootprint(p);
        const size = p.__sizeCategory || (resolved && resolved.size) || 'standard';
        const factLike = p.__sizeCategory ? !!p.__factLike : !!(resolved && resolved.factLike);
        const cols = DEPS.sizeColumns;
        const live = (PAPER[ctx.paper] || PAPER[DEFAULT_PAPER]).liveWMm;
        const maxCols = (cols && cols[size]) || SIZE_COLS[size] || 2;
        return {
            wMm: Math.round(live / maxCols), hMm: null,
            measure: true,                                    // SCC-A6: the paginator measures it
            factLike, maxCols,
            workRows: size === 'spacious' ? 4 : 0,
        };
    },

    inputs() {
        return [{ id: 'answer', kind: 'text', shape: 'line', graded: true, order: 0, scopes: ['full', 'answer-only'] }];
    },

    layout(p) { return { card: p && p.__card ? p.__card : 'card-simple', checker: 'value' }; },
});

/**
 * The default `renderCell`. A provider overrides this only to CHOOSE a template; it never
 * emits HTML of its own (SCC-P3).
 *
 * The cell frame, label and skill name belong to `cell.js`, never to a template (SCC-T5), so
 * this wraps the template output in the standard box and marks it `data-ws-legacy="1"`
 * (SCC-A5) - which is also the hook the mono stylesheet needs, because a legacy cell still
 * carries whatever colour its generator baked into `q.visual`.
 */
export function defaultRenderCell(q, ctx = {}) {
    const c = ctx && ctx.metrics ? ctx : resolveCtx(ctx);
    const payload = legacyClone(q);
    const fp = defaultFootprint(q);
    payload.__sizeCategory = fp.size;
    payload.__factLike = fp.factLike;
    const inner = LEGACY_TEMPLATE.render(payload, c);
    const lab = c.label && c.label.style && c.label.style !== 'none'
        ? `<span class="ws-${c.label.style === 'tab' ? 'tab' : 'letter'}" data-ws-label="${c.label.style}">${esc(c.label.text || '')}</span>`
        : '';
    return cell(inner, {
        label: lab,
        template: 'legacy',
        state: c.state,
        look: c.look,
        size: c.size,
        skill: q && q.skillId ? `${q.categoryId || ''}:${q.skillId}` : '',
        scope: (q && q.responseScope) || 'full',
        legacy: true,
    });
}

/* ==================================================================== 2. workedSteps */

/** The generators' own fallback lines: a Problem line and an Answer line and nothing between. */
const IS_PROBLEM_LINE = (t) => /^\s*problem\s*:?/i.test(t);
const IS_ANSWER_LINE = (t) => /^\s*answer\s*:?/i.test(t);
const IS_HINT_LINE = (t) => /^\s*hint\s*:?/i.test(t);

/** P-LG-9 / SCC-P5: the step says "regroup", never "carry" or "borrow". */
const regroupWording = (t) => t
    .replace(/\bcarry the (\d+)\b/gi, 'regroup $1')
    .replace(/\bborrow(?:ing)? from\b/gi, 'regroup from')
    .replace(/\bcarry(?:ing)?\b/gi, 'regroup')
    .replace(/\bborrow(?:ed|ing)?\b/gi, 'regroup')
    .replace(/\(\s*regroup\s*\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Normalise one raw HTML line into step text, or '' when nothing is left.
 * A continuation line keeps its own case, because it is appended to the step above it and a
 * capital in the middle of a sentence reads as a mistake.
 */
function normaliseStep(raw, isDetail = false) {
    let t = stripTags(raw);
    if (!t) return '';
    t = t.replace(/^step\s*\d+\s*:?\s*/i, '');
    t = regroupWording(t);
    if (!t) return '';
    return isDetail ? t : t.charAt(0).toUpperCase() + t.slice(1);
}

/** Detail lines are the indented continuations the generators emit; they merge into the parent. */
const IS_DETAIL = (raw) => /^(?:&nbsp;|\s)*(?:&nbsp;)/i.test(String(raw)) || /^\s{2,}/.test(String(raw));

/**
 * The default `workedSteps` (section 4.3). Returns 1-6 steps, each `{text, marks}`.
 * The array carries a non-enumerable `source` so the coverage report can say WHERE the steps
 * came from without changing the shape the contract promises.
 */
export function defaultWorkedSteps(q) {
    const problem = legacyClone(q);
    let source = 'none';
    let raw = callDep('workedSolution', [problem], null);
    let lines = Array.isArray(raw) ? raw.slice() : [];
    const onlyFallback = lines.length > 0 && lines.every((l) => {
        const t = stripTags(l);
        return IS_PROBLEM_LINE(t) || IS_ANSWER_LINE(t) || IS_HINT_LINE(t);
    });
    if (lines.length && !onlyFallback) source = 'worked';
    if (!lines.length || onlyFallback) {
        const alt = callDep('solutionSteps', [problem], null);
        const altLines = Array.isArray(alt) ? alt.slice() : [];
        const altOnlyFallback = altLines.length > 0 && altLines.every((l) => {
            const t = stripTags(l);
            return IS_PROBLEM_LINE(t) || IS_ANSWER_LINE(t) || IS_HINT_LINE(t);
        });
        if (altLines.length && !altOnlyFallback) { lines = altLines; source = 'solution'; }
        else if (!lines.length) { lines = altLines; source = altLines.length ? 'answer-only' : 'none'; }
        else source = 'answer-only';
    }

    const steps = [];
    let answerValue = q && q.ans !== undefined ? q.ans : null;
    for (const rawLine of lines) {
        const detail = IS_DETAIL(rawLine) && steps.length > 0;
        const text = normaliseStep(rawLine, detail);
        if (!text) continue;
        if (IS_PROBLEM_LINE(text) || IS_HINT_LINE(text)) continue;
        if (IS_ANSWER_LINE(text)) {
            const m = text.match(/answer\s*:?\s*(.+)$/i);
            if (m && m[1]) answerValue = m[1].trim();
            continue;
        }
        if (detail) {
            const prev = steps[steps.length - 1];
            prev.text = `${prev.text.replace(/\.$/, '')} ${text}`.replace(/\s+/g, ' ');
            continue;
        }
        steps.push({ text, marks: [] });
    }

    // Nothing usable: split the hint into sentences (section 4.3 step 5).
    if (!steps.length && q && q.hint) {
        const sentences = stripTags(q.hint).split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean).slice(0, 4);
        for (const s of sentences) steps.push({ text: regroupWording(s), marks: [] });
        if (steps.length) source = 'hint';
    }

    const capped = steps.slice(0, 5);
    capped.push({
        text: 'Write the answer.',
        marks: [{ slot: 'answer', value: answerValue === null ? '' : String(answerValue) }],
    });
    Object.defineProperty(capped, 'source', { value: source, enumerable: false });
    return capped;
}

/* ==================================================================== 3. wrongAnswer */

/** Word sets a wrong answer may step sideways within. */
const WORD_SETS = [
    ['yes', 'no'], ['true', 'false'], ['odd', 'even'],
    ['greater', 'less'], ['greater than', 'less than'], ['more', 'fewer'],
    ['>', '<'], ['prime', 'composite'], ['equal', 'not equal'],
];

const sameSet = (value) => {
    const v = String(value).trim().toLowerCase();
    for (const set of WORD_SETS) if (set.includes(v)) return set;
    return null;
};

/**
 * Which bases are a REAL misconception, and which are only a nudged number. This is the honest
 * line the owner asked for: a wrong answer that is just "the answer plus one" teaches nothing
 * on an error-analysis page, so the result is flagged and a page role may decline the item.
 */
const MISCONCEPTION_BASES = new Set(['tagged', 'inverse-op', 'place-value', 'swap', 'clock']);

function perturbNumber(q, value, rand) {
    const n = toNumber(value);
    const a = q && isNumeric(q.a) ? toNumber(q.a) : null;
    const b = q && isNumeric(q.b) ? toNumber(q.b) : null;
    const op = q && q.op;

    // The other operation of the pair: the commonest real error in +/-/x/÷ work.
    if (a !== null && b !== null && op) {
        const inverse = op === '+' ? a - b
            : (op === '-' || op === '−') ? a + b
                : (op === '*' || op === 'x' || op === '×') ? a + b
                    : (op === '/' || op === '÷') ? a - b : null;
        if (inverse !== null && inverse !== n && inverse >= 0) {
            return { value: inverse, basis: 'inverse-op', misconception: 'used-the-other-operation',
                explain: `Used ${op === '+' ? 'subtraction' : op === '-' ? 'addition' : op === '/' ? 'subtraction' : 'addition'} instead.` };
        }
    }

    // A decimal: the place-value slip, not a random number.
    if (/\./.test(String(value))) {
        const moved = n * 10;
        if (moved !== n) return { value: Number(moved.toFixed(4)), basis: 'place-value', misconception: 'decimal-point-moved', explain: 'Moved the decimal point one place.' };
    }

    // Last resort: a nudge. NOT a misconception, and it says so.
    const step = Math.abs(n) >= 20 ? 10 : 1;
    const up = rand() < 0.5 ? -1 : 1;
    let out = n + up * step;
    if (out === n) out = n + step;
    if (out < 0 && n >= 0) out = n + step;
    return { value: out, basis: 'nudge', misconception: 'unknown', explain: 'A near miss, not a named error.' };
}

/**
 * The default `wrongAnswer` (section 4.4). Sources, in order: tagged distractors, `q.options`,
 * a typed perturbation.
 *
 * @returns {null|{value, misconception, basis, misconceptionBased, explain, slots?}}
 *   `misconceptionBased: false` means the value is plausible but NOT diagnostic. Error
 *   analysis, True or False? and Reason It must check this flag and decline the item rather
 *   than print a meaningless one.
 */
export function defaultWrongAnswer(q) {
    if (!q || q.ans === undefined || q.ans === null) return null;
    const rand = rng(questionSeed(q));
    const ans = q.ans;
    const ansKey = String(typeof ans === 'object' ? JSON.stringify(ans) : ans).trim();
    const differs = (v) => String(typeof v === 'object' ? JSON.stringify(v) : v).trim() !== ansKey;

    // 1. Tagged distractors: an author already named this error (answer-check.js tagDistractor).
    if (q.distractorTags && typeof q.distractorTags === 'object') {
        const entries = q.distractorTags instanceof Map ? [...q.distractorTags.entries()] : Object.entries(q.distractorTags);
        for (const [value, message] of entries) {
            if (differs(value)) {
                return { value: isNumeric(value) ? toNumber(value) : value, misconception: 'tagged', basis: 'tagged',
                    misconceptionBased: true, explain: stripTags(message) };
            }
        }
    }

    // 2. Options: a distractor the generator offered. Plausible, but not named, so not diagnostic.
    if (Array.isArray(q.options) && q.options.length > 1) {
        const wrong = q.options.filter(differs);
        if (wrong.length) {
            return { value: wrong[int(rand, 0, wrong.length - 1)], misconception: 'unknown', basis: 'option',
                misconceptionBased: false, explain: 'An offered distractor; the error behind it is not named.' };
        }
    }

    // 3. Typed perturbation, by the SHAPE of the answer.
    // 3a. a fraction object or an "n/d" string
    const fracString = typeof ans === 'string' && /^\s*-?\d+\s*\/\s*\d+\s*$/.test(ans);
    if (fracString || (ans && typeof ans === 'object' && ans.num !== undefined && ans.den !== undefined)) {
        const num = fracString ? Number(ans.split('/')[0]) : Number(ans.num);
        const den = fracString ? Number(ans.split('/')[1]) : Number(ans.den);
        const fd = q.fractionData;
        let wrongNum = den, wrongDen = num;                      // numerator and denominator swapped
        let misconception = 'numerator-denominator-swapped';
        if (fd && fd.op && fd.denom1 !== undefined && fd.denom2 !== undefined) {
            wrongNum = Number(fd.num1) + Number(fd.num2);        // added the denominators too
            wrongDen = Number(fd.denom1) + Number(fd.denom2);
            misconception = 'added-the-denominators';
        }
        if (Number.isFinite(wrongNum) && Number.isFinite(wrongDen) && wrongDen !== 0 && differs(`${wrongNum}/${wrongDen}`)) {
            const value = fracString ? `${wrongNum}/${wrongDen}` : { num: wrongNum, den: wrongDen };
            return { value, misconception, basis: 'swap', misconceptionBased: true,
                explain: misconception === 'added-the-denominators' ? 'Added the denominators as well as the numerators.' : 'Wrote the parts the wrong way round.' };
        }
    }

    // 3b. a time
    if (typeof ans === 'string' && /^\d{1,2}:\d{2}$/.test(ans.trim())) {
        const [h, m] = ans.trim().split(':').map(Number);
        if (m % 5 === 0 && m / 5 >= 1 && m / 5 <= 12 && h >= 1 && h <= 12) {
            const swapped = `${m / 5}:${String(h * 5).padStart(2, '0')}`;
            if (differs(swapped)) return { value: swapped, misconception: 'hands-read-the-wrong-way', basis: 'clock', misconceptionBased: true, explain: 'Read the hour hand as minutes.' };
        }
        const shifted = `${h}:${String((m + 5) % 60).padStart(2, '0')}`;
        return { value: shifted, misconception: 'unknown', basis: 'nudge', misconceptionBased: false, explain: 'Five minutes out; the error is not named.' };
    }

    // 3c. one of a fixed word set
    const set = sameSet(ans);
    if (set) {
        const other = set.find((v) => v !== String(ans).trim().toLowerCase());
        if (other !== undefined) {
            return { value: other, misconception: 'unknown', basis: 'fixed-set', misconceptionBased: false,
                explain: 'The only other choice, so it shows nothing about the thinking.' };
        }
    }

    // 3d. a number
    if (isNumeric(ans)) {
        const out = perturbNumber(q, ans, rand);
        if (!differs(out.value)) return null;
        return Object.assign({ misconceptionBased: MISCONCEPTION_BASES.has(out.basis) }, out);
    }

    // 3e. anything else: no sensible wrong answer exists (SCC-P6).
    return null;
}

/* ======================================================================== 4. strings */

/** The verbs an "I Can" line may start with (section 4.5). Anything else takes "work on". */
const ICAN_VERBS = new Set([
    'add', 'subtract', 'multiply', 'divide', 'count', 'compare', 'order', 'round', 'estimate',
    'find', 'identify', 'name', 'sort', 'read', 'write', 'tell', 'measure', 'convert',
    'simplify', 'solve', 'make', 'build', 'plot', 'graph', 'classify', 'partition', 'compose',
    'decompose',
]);

/** Instruction key by screen answer type (section 4.5). The ONLY five the default may pick. */
function defaultInstructionKey(ref) {
    const type = String((ref && (ref.answerType || ref.type)) || '');
    const interactive = String((ref && ref.interactiveType) || '');
    const fmt = String((ref && ref.printFormat) || '');
    if (interactive === 'ordering' || /order/.test(fmt)) return 'default-order';
    if (/match/.test(type) || /match/.test(fmt)) return 'match';
    if (type === 'number-line-place' || /number-line-place/.test(fmt)) return 'line-mark';
    if (/multi-select/.test(type)) return 'default-circle-all';
    if (type === 'multiple-choice' || type === 'clock-choice') return 'default-circle';
    if (type === 'number' || type === 'text' || type === 'dual' || type === 'dual-fraction' || type === '') return 'default-write';
    return 'default-solve';
}

/** Strip the decorations a label carries for the skill grid: emoji, "(Visual)", bracketed ranges. */
function cleanLabel(label) {
    return String(label || '')
        .replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{2BFF}\u{FE0F}]/gu, '')
        .replace(/\s*\((?:visual|no visuals?|advanced|easy|hard|medium)\)\s*/gi, ' ')
        .replace(/\s*\([^)]*\d[^)]*\)\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * The default `strings` (section 4.5).
 * `whatsNew`, `vocabulary` and `oralFrame` are LEFT EMPTY on purpose: the band, box or line is
 * omitted, never filled with placeholder text.
 *
 * @param {Object} ref  a question, or `{categoryId, skillId, label, answerType, printFormat}`
 */
export function defaultStrings(ref = {}) {
    const skillId = ref.skillId || ref.skill || '';
    const categoryId = ref.categoryId || ref.category || '';
    const table = DEPS.fullLabels;
    const fromTable = table && typeof table === 'object' ? table[skillId] : null;
    const fromFn = fromTable ? null : callDep('shortLabel', [skillId, categoryId], null);
    const label = cleanLabel(ref.label || fromTable || fromFn || skillId.replace(/_/g, ' '));
    const lower = label ? label.charAt(0).toLowerCase() + label.slice(1) : '';
    const firstWord = lower.split(/\s+/)[0].replace(/[^a-z]/gi, '').toLowerCase();
    const iCan = !lower ? 'I Can work on this skill'
        : ICAN_VERBS.has(firstWord) ? `I Can ${lower}` : `I Can work on ${lower}`;
    const key = defaultInstructionKey(ref);
    const print = instructionFor(key);
    return {
        iCan,
        instructionKey: key,
        instruction: print,
        // Page code never composes an instruction; it takes the library string and, for the
        // screen, the fixed verb swap of PEDAGOGY_STANDARD.md 10.2.
        whatsNew: '',
        vocabulary: [],
        oralFrame: '',
        // Flagged so a family migration can find every string it still has to write.
        isDefault: true,
        iCanIsVerb: ICAN_VERBS.has(firstWord),
    };
}

/* ====================================================================== 5. footprint */

/**
 * The default `footprint` (section 4.6), keyed off SKILL_PRINT_SIZE -> PRINT_FORMAT_SIZE ->
 * 'standard'. Returns the static shape plus the per-look, per-size grid units a page packer
 * needs, all as plain data.
 *
 * `basis` says WHICH of the three sources answered, because a size that came from the
 * `'standard'` fallback is a guess and the coverage report must not pretend otherwise.
 */
export function defaultFootprint(ref = {}) {
    const skillId = ref.skillId || ref.skill || '';
    const printFormat = ref.printFormat || '';
    const fn = DEPS.printSize;
    const cols = DEPS.sizeColumns;

    let size = 'standard';
    let basis = 'fallback-standard';
    if (typeof fn === 'function') {
        const got = fn(skillId, printFormat);
        if (got) size = got;
    }
    // WHICH of the three sources answered. The tables are read directly when they are injected,
    // because a skill whose SKILL_PRINT_SIZE entry happens to be `standard` is an AUTHORED
    // classification and must not be reported as the blind fallback.
    const skillTable = DEPS.printSizeTable;
    const formatTable = DEPS.formatSizeTable;
    if (skillTable && typeof skillTable === 'object' && Object.prototype.hasOwnProperty.call(skillTable, skillId)) {
        basis = 'skill-print-size';
        if (!fn) size = skillTable[skillId];
    } else if (formatTable && typeof formatTable === 'object' && printFormat
        && Object.prototype.hasOwnProperty.call(formatTable, printFormat)) {
        basis = 'print-format-size';
        if (!fn) size = formatTable[printFormat];
    } else if (!skillTable && typeof fn === 'function') {
        // No tables injected: probe the function with a key that can never be a printFormat.
        const bySkill = fn(skillId, NO_SUCH_FORMAT);
        basis = bySkill !== 'standard' ? 'skill-print-size'
            : size !== 'standard' ? 'print-format-size' : 'fallback-standard';
    }
    const maxCols = (cols && cols[size]) || SIZE_COLS[size] || 2;
    const live = PAPER[DEFAULT_PAPER].liveWMm;
    const wMm = Math.round(live / maxCols);
    const factLike = FACT_SKILLS.has(skillId) || FACT_FORMAT_RE.test(printFormat);

    // Units per look and size: how many of the six live-width columns one cell occupies, and
    // how many writing heights tall it is. Plain data (SCC-Q3), derived from the size class.
    const hUnits = { compact: 1, standard: 2, medium: 3, wide: 3, spacious: 4 }[size] || 2;
    const units = {};
    for (const look of ['ican', 'daily']) {
        units[look] = {};
        for (const s of ['S', 'M', 'L']) {
            units[look][s] = {
                w: Math.max(1, Math.round(6 / maxCols)),
                h: hUnits,
                hMm: Math.round(hUnits * SIZES[s].writeMm + (look === 'daily' ? 2 : 4)),
            };
        }
    }
    return {
        kind: 'legacy', size, basis, factLike, maxCols, wMm,
        measure: true, hMm: null,
        workRows: size === 'spacious' ? 4 : 0,
        units,
        perPage: { ican: maxCols * (size === 'compact' ? 8 : size === 'standard' ? 5 : 3), daily: maxCols * (size === 'compact' ? 10 : 6) },
    };
}

/* ======================================================================== 6. options */

/**
 * The default `options`: the skill's own schema from `skill-options.js`, injected as
 * `skillOptions`. It already exists and is already the right shape, so the default adapter is
 * a pass-through - the only one of the six that is not a reconstruction.
 */
export function defaultOptions(ref = {}) {
    const skillId = ref.skillId || ref.skill || '';
    const categoryId = ref.categoryId || ref.category || '';
    const list = callDep('skillOptions', [categoryId, skillId], null);
    return Array.isArray(list) ? list : [];
}

/** The option declarations a skill owns, with the universal ones removed (coverage input). */
export function ownOptionCount(ref = {}) {
    return defaultOptions(ref).filter((o) => o && o.id !== 'level').length;
}

/* ========================================================= wire the defaults into contract */

installDefaultAdapters({
    renderCell: defaultRenderCell,
    workedSteps: defaultWorkedSteps,
    wrongAnswer: defaultWrongAnswer,
    strings: defaultStrings,
    footprint: defaultFootprint,
    options: defaultOptions,
});
