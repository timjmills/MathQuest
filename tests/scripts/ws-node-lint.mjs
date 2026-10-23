// ws-node-lint — the machine checks that need NO browser (IMPROVEMENT_PLAN §1.4 S2, §1.6.3 C4, §1.7 step 1;
// design/audit/LESSONS_LEARNED.md L1 / L3 / L6 / L10). Plain node over the generators (generateQuestionFor, seeded)
// and the pure sheet kit (renderCell, cellFootprint, the layout engine, the providers).
//
//   node tests/scripts/ws-node-lint.mjs                         # every live skill, every rule, against the baseline
//   node tests/scripts/ws-node-lint.mjs --skill addition:add --skill multiplication:mult_facts
//   node tests/scripts/ws-node-lint.mjs --skill addition:add,subtraction:subtract --rules NOTATION,L10
//   node tests/scripts/ws-node-lint.mjs --category fractions --n 30 --page 12
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/notation.fail.mjs
//   node tests/scripts/ws-node-lint.mjs --json /tmp/out.json --report-only
//   node tests/scripts/ws-node-lint.mjs --write-baseline        # re-pin design/audit/baselines/node-lint.json
//   node tests/scripts/ws-node-lint.mjs --self-test             # the rule helpers on known inputs, no app modules
//   node tests/scripts/ws-node-lint.mjs --root /path/to/other/checkout   # lint another tree (or MQ_ROOT=...)
//
// Rules (each finding carries its rule id and the standard it cites):
//   NOTATION  (C4)  printed text — the pupil cell drawn by the kit (or the legacy cell), and the item text the screen
//                   shows — uses a letter x or * for times, a spaced / for divide, a hyphen for minus (TY-6), an inline
//                   a/b fraction (TY-7, fractions are stacked), or an instruction that is not a controlled-library
//                   string (PEDAGOGY 10.1, P-14: a provider's instruction, an item's own instructionKey).
//   L1        sizes: for a skill drawn by the kit, Size S must fit more items or more columns than L
//                   (resolveSectionLayout, the Independent page, Auto), and the drawing must scale: its footprint at S
//                   may not equal its footprint at L (DN-1a, LESSONS_LEARNED L1). One finding per skill per sub-check.
//                   Skipped (counted): legacy-drawn skills and footprints the host measures in the browser.
//   L3        key in the drawing: the pupil cell (blank state) shows the answer as visible text more often than the
//                   question itself prints it (its text, its printed choices); a scale of labelled numbers round the
//                   answer (a number line, a clock face, a chart) is not a give-away. Skipped (counted): answers that
//                   are lists, signs or one choice letter.
//   L6        instruction follows the item: the worked steps, the steps, the instruction and the Say line the
//                   provider gives an item mention only numbers that item holds or derives (its numbers, their digits
//                   and place values, one operation between two of them, a count between them, a count-by of one).
//   L10       answer cycles: over the dealt items (--n, default 30) the answer, and the position of the right choice
//                   on a choice item, is never constant and never repeats with a period of 2 to 5.
//   REPEATS   the first --page items (default 12) of a page deal — print-sheet's generateRun, emulated: seed
//                   base + i, a duplicate retried 12 times under base + i + 7919k — hold no problem twice (the same
//                   signature, or the same printed text with numbers and the same answer).
//
// Baseline: design/audit/baselines/node-lint.json pins today's counts per skill per rule. A run FAILS only on findings
// beyond it (a new skill with findings, or a raised count). --baseline <file> picks another file, --no-baseline
// ignores it. A fixture run (--fixture) never uses the baseline: any finding FAILS.
//
// Fixture modules (tests/fixtures/precritic/*.mjs) export default
//   { name, skill: 'fixture:id', rules: [...], setup({kit}), items: [q...] | generate({i, seed, rng}) -> q }
// setup may register a cell template or a provider through the kit it is handed (the same kit the lint draws with).
//
// Prints `ws-node-lint: OK` or `ws-node-lint: FAIL (n)` and exits non-zero on FAIL (unless --report-only).

import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const T0 = Date.now();
const SCRIPT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const argAll = (f) => args.flatMap((a, i) => (a === f && i + 1 < args.length ? String(args[i + 1]).split(',') : [])).map((s) => s.trim()).filter(Boolean);

const ALL_RULES = ['NOTATION', 'L1', 'L3', 'L6', 'L10', 'REPEATS'];
const RULE_CITES = {
    NOTATION: 'C4; WORKSHEET_DESIGN_STANDARD TY-6, TY-7; PEDAGOGY_STANDARD 10.1 (P-14)',
    L1: 'LESSONS_LEARNED L1; WORKSHEET_DESIGN_STANDARD DN-1a',
    L3: 'LESSONS_LEARNED L3',
    L6: 'LESSONS_LEARNED L6',
    L10: 'LESSONS_LEARNED L10',
    REPEATS: 'IMPROVEMENT_PLAN §1.4 backtest "Repeats"; PAGE_TYPES no repeated problem on a page',
};
const RETRIES = 12;                 // print-sheet.js generateRun: duplicate retries per item

/* ================================================================== pure helpers (self-tested) */

const ENTITIES = { nbsp: ' ', times: '×', divide: '÷', minus: '−', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", frasl: '⁄', ndash: '–', mdash: '—', middot: '·', le: '≤', ge: '≥', ne: '≠', deg: '°', cent: '¢', pound: '£', euro: '€', hellip: '…', rarr: '→', larr: '←' };
export function decodeEntities(s) {
    return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
        if (e[0] === '#') {
            const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
            return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
        }
        const v = ENTITIES[e.toLowerCase()];
        return v === undefined ? m : v;
    });
}

// print-sheet.js STAMP_RE: a legacy cell's hidden answer stamp, removed before the pupil page is drawn.
const STAMP_RE_G = /<div class="ws-legacy-answer" data-ws-stamp="1"[^>]*>[\s\S]*?<\/span><\/div>/g;

/** The text a pupil can see in a cell's HTML: tags dropped (each a word break), entities decoded. */
export function visibleText(html) {
    let h = String(html || '').replace(STAMP_RE_G, ' ');
    h = h.replace(/<(style|script|title|desc)\b[\s\S]*?<\/\1>/gi, ' ');
    h = h.replace(/<!--[\s\S]*?-->/g, ' ');
    h = h.replace(/<[^>]*>/g, ' ');
    return decodeEntities(h).replace(/\s+/g, ' ').trim();
}

/** Plain text of a string that may hold markup (an item's text). */
export const plainText = (s) => visibleText(String(s || ''));

const UNIT = '(?:cm|mm|km|m|in|ft|yd|units?)';
const NOTATION_PATTERNS = [
    // TY-6: a letter x or an asterisk for times, between a number (or a unit, or a bracket) and a number / slot.
    // ("6x ?" is a variable: an x written against its number and spaced from what follows is algebra.)
    { kind: 'times', cite: 'TY-6', re: new RegExp(`(?:(?:\\d|\\))\\s+(?:${UNIT}\\s*)?x\\s*(?=[\\d(?_□])|\\d${UNIT}?x(?=\\d)|(?:\\d|\\))\\s*\\*\\s*(?=[\\d(?_□]))`, 'g') },
    // TY-6: a slash between spaced numbers is a divide sign.
    { kind: 'divide', cite: 'TY-6', re: /\d\s+\/\s+(?=\d)/g },
    // TY-7: an inline a/b fraction (not a date a/b/c, not a unit rate like km/h).
    { kind: 'fraction', cite: 'TY-7', re: /(?<![\d/.:])\d+\/\d+(?![\d/])/g },
    // TY-6: a hyphen for minus: between spaced numbers, or as the sign of a negative number.
    { kind: 'minus', cite: 'TY-6', re: /(?:\d\s+-\s+(?=\d))|(?:(?:^|[\s(=,:])-(?=\d))/g },
];

/** NOTATION hits in one plain text: [{kind, cite, match}]. */
export function notationHits(text) {
    const t = String(text || '');
    const out = [];
    for (const p of NOTATION_PATTERNS) {
        p.re.lastIndex = 0;
        let m;
        while ((m = p.re.exec(t))) {
            out.push({ kind: p.kind, cite: p.cite, match: t.slice(Math.max(0, m.index - 8), m.index + m[0].length + 8).trim() });
            if (m[0].length === 0) p.re.lastIndex++;
        }
    }
    return out;
}

/** Numbers written in a text ("1,000" is one number; "3:45" is 3 and 45). */
export function numbersIn(text) {
    const out = [];
    for (const m of String(text || '').matchAll(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g)) {
        const v = Number(m[0].replace(/,/g, ''));
        if (Number.isFinite(v)) out.push(v);
    }
    return out;
}

/** Whole-token count of `needle` in a text (case-insensitive for words). */
export function tokenCount(text, needle) {
    const n = String(needle);
    if (!n) return 0;
    const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const word = /^[A-Za-z]/.test(n);
    const re = new RegExp(`(?<![A-Za-z0-9.,:/])${esc}(?![A-Za-z0-9]|[.,:/]\\d)`, word ? 'gi' : 'g');
    return (String(text).match(re) || []).length;
}

/** The smallest period 2..5 of a sequence that repeats exactly (and is not constant), or 0. */
export function cyclePeriod(seq, maxP = 5) {
    if (seq.length < 6) return 0;
    if (seq.every((v) => v === seq[0])) return 0;
    for (let p = 2; p <= maxP; p++) {
        if (seq.length < 3 * p) break;
        let ok = true;
        for (let i = 0; i + p < seq.length; i++) if (seq[i] !== seq[i + p]) { ok = false; break; }
        if (ok) return p;
    }
    return 0;
}
export const isConstant = (seq) => seq.length >= 6 && seq.every((v) => v === seq[0]);

/** Is `n` one tick of a labelled scale in `nums` (n - d and n + d, or n +/- d and +/- 2d, for some step d)? */
export function onScale(n, nums) {
    const r = (x) => Math.round(x * 1e6) / 1e6;
    const set = new Set(nums.map(r));
    const steps = new Set();
    for (const x of set) { const d = r(Math.abs(x - n)); if (d > 0 && d <= 1000) steps.add(d); }
    const at = (x) => set.has(r(x));
    for (const d of steps) {
        if (at(n - d) && at(n + d)) return true;
        if (at(n + d) && at(n + 2 * d)) return true;
        if (at(n - d) && at(n - 2 * d)) return true;
    }
    return false;
}
/** Clock times in a text, in minutes ("9:00" -> 540). */
export const timesIn = (text) => [...String(text || '').matchAll(/\b(\d{1,2}):(\d{2})\b/g)].map((m) => Number(m[1]) * 60 + Number(m[2]));

/**
 * The numbers an item holds or derives (L6): its own numbers, their digits and place values, one operation between
 * two of them (+ − × ÷, a carry either side), a count between its smallest and largest number, and the count-by of
 * one of them, plus 0, 1, 2, 10, 100, 1000.
 */
/** An item's own numbers with their digits and place values (no arithmetic between them). */
export function atomsOf(base) {
    const out = new Set();
    for (const v of base) {
        if (!Number.isFinite(v)) continue;
        out.add(v);
        if (!Number.isInteger(v) || v < 0) continue;
        const s = String(v);
        for (let i = 0; i < s.length; i++) out.add(Number(s[i]) * 10 ** (s.length - 1 - i));
    }
    return out;
}
export function numberUniverse(base, texts = []) {
    const own = [...new Set(base.filter((v) => Number.isFinite(v)))];
    const atoms = new Set(own);
    for (const v of own) {
        if (!Number.isInteger(v) || v < 0) continue;
        const s = String(v);
        for (let i = 0; i < s.length; i++) {
            const d = Number(s[i]);
            atoms.add(d);
            atoms.add(d * 10 ** (s.length - 1 - i));
        }
        if (v >= 1000) { atoms.add(Math.floor(v / 1000)); atoms.add(Math.floor(v / 1e6)); }
        if (v >= 10) { atoms.add(v % 10); atoms.add(v - (v % 10)); atoms.add(Math.floor(v / 10)); atoms.add(v % 100); atoms.add(v - (v % 100)); }
    }
    const U = new Set([0, 1, 2, 10, 100, 1000, ...atoms]);
    const A = [...atoms].slice(0, 80);
    const add = (x) => { if (Number.isFinite(x)) { U.add(Math.round(x * 1e6) / 1e6); } };
    for (let i = 0; i < A.length; i++) {
        for (let j = i; j < A.length; j++) {
            const a = A[i], b = A[j];
            add((a + b) / 2);
            add(a + b); add(a + b + 1); add(Math.abs(a - b)); add(Math.abs(a - b) - 1); add(a * b);
            if (a < 10 && b < 10) { add((a + b) * 10); add((a + b + 1) * 10); add(Math.abs(a - b) * 10); }
            if (b !== 0 && Number.isInteger(a / b)) add(a / b);
            if (a !== 0 && Number.isInteger(b / a)) add(b / a);
        }
    }
    // a fraction's own working: the improper numerator of a mixed number, the scale to tenths / hundredths
    for (const t of texts) {
        for (const m of String(t).matchAll(/(?:(\d+)\s+)?(\d+)\/(\d+)/g)) {
            const w = Number(m[1] || 0), nn = Number(m[2]), d = Number(m[3]);
            add(w * d + nn);
            for (const k of [10, 100, 1000]) if (d && k % d === 0) { add(k / d); add((k / d) * nn); }
        }
    }
    const ints = own.filter((v) => Number.isInteger(v));
    if (ints.length) {
        const lo = Math.min(...ints), hi = Math.max(...ints);
        if (hi - lo <= 20) for (let v = lo; v <= hi; v++) U.add(v);
        if (hi <= 30) for (let v = 0; v <= hi; v++) U.add(v);
    }
    for (const v of own) if (Number.isInteger(v) && v >= 2 && v <= 1000) for (let k = 1; k <= 12; k++) U.add(v * k);
    return U;
}

/** Every number written anywhere in an item (its text, its fields, its cell payload), but not its seed or picture. */
const SKIP_KEYS = new Set(['seed', 'itemSeed', 'itemIndex', 'itemCount', 'visual', 'printVisual', 'hint', 'skillOptions', 'solution', 'explanation', 'steps', 'workedSteps', 'style', 'svg', 'html']);
export function itemNumbers(q, depth = 0, out = []) {
    if (q === null || q === undefined || depth > 7) return out;
    if (typeof q === 'number') { if (Number.isFinite(q)) out.push(q); return out; }
    if (typeof q === 'string') { out.push(...numbersIn(plainText(q))); return out; }
    if (Array.isArray(q)) { for (const v of q) itemNumbers(v, depth + 1, out); return out; }
    if (typeof q === 'object') {
        for (const [k, v] of Object.entries(q)) {
            if (SKIP_KEYS.has(k) || typeof v === 'function') continue;
            itemNumbers(v, depth + 1, out);
        }
    }
    return out;
}

/** FNV-1a, so a skill's seed is the same in a full sweep and in a --skill run. */
export function hashSeed(s) {
    let h = 0x811c9dc5;
    for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h >>> 0;
}

/** print-sheet.js signature(): text | answer | payload. */
export function signature(q) {
    const payload = q.cell && q.cell.payload ? JSON.stringify(q.cell.payload) : '';
    const ans = typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans);
    return `${String(q.text || '').replace(/\s+/g, ' ').trim()}|${ans}|${payload}`;
}
/** The problem a pupil sees: its text, when the text carries numbers, and its answer. */
export function visibleKey(q) {
    const t = plainText(q && q.text);
    if (!/\d/.test(t)) return null;
    const ans = q && typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q && q.ans);
    // the numbers the drawing carries: two clock rows under one instruction are two problems
    const drawn = itemNumbers(q && q.cell && q.cell.payload).join(',');
    return `${t}|${ans}|${drawn}`;
}

/** An instruction written by a library template ({n}, {place}, {unit} filled)? */
export function libraryMatcher(library) {
    const res = Object.entries(library).map(([key, raw]) => {
        const esc = String(raw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{(\w+)\\\}/g, '(.+?)');
        return { key, re: new RegExp(`^${esc}$`) };
    });
    return (text) => {
        const t = String(text || '').trim();
        const hit = res.find((r) => r.re.test(t));
        return hit ? hit.key : '';
    };
}

/* ============================================================================ self-test */

function selfTest() {
    const fails = [];
    const eq = (got, want, what) => { const g = JSON.stringify(got), w = JSON.stringify(want); if (g !== w) fails.push(`${what}: expected ${w}, got ${g}`); };
    const kinds = (t) => notationHits(t).map((h) => h.kind);
    // NOTATION: real defects
    eq(kinds('3 x 4 ='), ['times'], 'letter x between numbers');
    eq(kinds('3x4'), ['times'], 'letter x unspaced');
    eq(kinds('5 * 6 = ?'), ['times'], 'asterisk');
    eq(kinds('3 cm x 4 cm'), ['times'], 'x between lengths');
    eq(kinds('4 x ___'), ['times'], 'x before a blank');
    eq(kinds('12 / 3 ='), ['divide'], 'spaced slash');
    eq(kinds('Shade 1/2 of the shape.'), ['fraction'], 'inline fraction');
    eq(kinds('What is 3/4 + 1/4?'), ['fraction', 'fraction'], 'two inline fractions');
    eq(kinds('9 - 4 = ?'), ['minus'], 'hyphen minus');
    eq(kinds('The temperature is -5 degrees.'), ['minus'], 'hyphen negative');
    // NOTATION: not defects
    eq(kinds('3 × 4 = 12'), [], 'times sign');
    eq(kinds('12 ÷ 3 = 4'), [], 'divide sign');
    eq(kinds('9 − 4 = 5'), [], 'minus sign');
    eq(kinds('Solve 3x + 5 = 11'), [], 'algebra 3x');
    eq(kinds('x = 4'), [], 'variable x');
    eq(kinds('Simplify 8y + 6x ?'), [], 'variable 6x before a slot');
    eq(kinds('3cmx4cm'), ['times'], 'x between unit lengths, unspaced');
    eq(kinds('The time is 3:45.'), [], 'clock time');
    eq(kinds('The ratio is 3:4.'), [], 'ratio');
    eq(kinds('Born on 3/4/2020'), [], 'date');
    eq(kinds('60 km/h'), [], 'unit rate');
    eq(kinds('the numbers 1-10'), [], 'range with a hyphen, unspaced');
    eq(kinds('Box 5 extra large'), [], 'letter x inside a word');
    eq(kinds('Write the number 4.5'), [], 'decimal');
    // visibleText
    eq(visibleText('<div>4&nbsp;&times;&nbsp;3</div><style>.x{a:1}</style><svg><title>12</title><text>7</text></svg>'), '4 × 3 7', 'visibleText');
    eq(visibleText('<div class="ws-legacy-answer" data-ws-stamp="1" style="x"><span>12</span></div>9'), '9', 'stamp removed');
    // numbersIn / tokenCount
    eq(numbersIn('1,000 and 3:45 and 2.5'), [1000, 3, 45, 2.5], 'numbersIn');
    eq(tokenCount('12 + 2 = 14, 2', '2'), 2, 'tokenCount whole tokens');
    eq(tokenCount('Square, square!', 'square'), 2, 'tokenCount words');
    eq(tokenCount('4:50', '50'), 0, 'tokenCount not inside a time');
    eq(tokenCount('4:50', '4:50'), 1, 'tokenCount a time');
    // cycles
    eq(cyclePeriod(['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']), 2, 'A/B alternation');
    eq(cyclePeriod([1, 2, 3, 1, 2, 3, 1, 2, 3, 1]), 3, 'period 3');
    eq(cyclePeriod([3, 3, 3, 3, 3, 3]), 0, 'constant is not a cycle');
    eq(isConstant([3, 3, 3, 3, 3, 3]), true, 'constant');
    eq(cyclePeriod([1, 2, 2, 1, 2, 1, 1, 2, 2, 2, 1, 1]), 0, 'no cycle');
    // scale
    eq(onScale(7, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), true, 'number line scale');
    eq(onScale(7, [4, 3, 7]), false, 'not a scale');
    eq(onScale(30, [10, 20, 30, 40]), true, 'tens scale');
    eq(onScale(10.2, [10.17, 10.1, 10.15, 10.2]), true, 'decimal scale (float steps)');
    eq(onScale(600, timesIn('9:00 10:00 11:00')), true, 'a time line of hours');
    // universe
    const U = numberUniverse([47, 38, 85]);
    eq([15, 8, 85, 4, 7, 40, 30, 1].every((v) => U.has(v)), true, 'universe holds the column work of 47 + 38');
    eq([263, 215, 341, 523].some((v) => U.has(v)), false, 'universe excludes other numbers');
    // library matcher
    const lib = libraryMatcher({ a: 'Count by {n}. Write the missing numbers.', b: 'Add.' });
    eq([lib('Count by 5. Write the missing numbers.'), lib('Add.'), lib('Work out the sum.')], ['a', 'b', ''], 'library matcher');
    eq(hashSeed('addition:add') === hashSeed('addition:add'), true, 'seed stable');
    if (fails.length) {
        for (const f of fails) console.log('  ' + f);
        console.log(`ws-node-lint --self-test: FAIL (${fails.length})`);
        process.exit(1);
    }
    console.log('ws-node-lint --self-test: OK');
    process.exit(0);
}
if (has('--self-test')) selfTest();

/* ===================================================================== load the app in node */

const ROOT = resolve(arg('--root', process.env.MQ_ROOT || SCRIPT_ROOT));
const M = (p) => pathToFileURL(join(ROOT, 'js', 'modules', p)).href;

// A DOM that answers everything and does nothing: the generators and the legacy print path touch `document` / `window`
// at import or for a widget the lint never draws. The kit itself is pure (SCC-01).
const stub = () => new Proxy(function () {}, {
    get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === Symbol.iterator ? undefined : stub()),
    apply: () => stub(), construct: () => stub(), set: () => true,
});
const store = {};
globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
globalThis.sessionStorage = globalThis.localStorage;
globalThis.window = globalThis;
globalThis.document = stub();

const realConsole = { log: console.log, warn: console.warn, error: console.error, info: console.info, debug: console.debug };
const mute = () => { console.log = console.warn = console.error = console.info = console.debug = () => {}; };
const unmute = () => Object.assign(console, realConsole);
const say = (...a) => realConsole.log(...a);

mute();
let gq, data, pg, kit, layout;
try {
    gq = await import(M('generate-question.js'));
    data = await import(M('data.js'));
    pg = await import(M('print-generate.js'));   // installs the legacy adapters (the legacy cell, default providers)
    kit = await import(M('sheet/index.js'));
    layout = await import(M('sheet/layout.js'));
} catch (e) {
    unmute();
    say(`ws-node-lint: cannot load the app modules from ${ROOT}: ${e && e.stack ? e.stack : e}`);
    say('ws-node-lint: FAIL (load)');
    process.exit(1);
}
unmute();
const LOAD_MS = Date.now() - T0;
const inLibrary = libraryMatcher(kit.INSTRUCTION_LIBRARY);

/* ======================================================================= what to lint */

const N = Math.max(6, Number(arg('--n', 30)) || 30);
const PAGE = Math.max(2, Number(arg('--page', 12)) || 12);
const wantRules = argAll('--rules').map((r) => r.toUpperCase());
const badRule = wantRules.find((r) => !ALL_RULES.includes(r));
if (badRule) { say(`ws-node-lint: unknown rule "${badRule}" (rules: ${ALL_RULES.join(', ')})`); process.exit(2); }
const fixtures = argAll('--fixture');

/** A skill is the generator's (live SKILLS entry) or a fixture's. */
const subjects = [];
if (fixtures.length) {
    for (const f of fixtures) {
        const file = isAbsolute(f) ? f : resolve(process.cwd(), f);
        if (!existsSync(file)) { say(`ws-node-lint: no fixture ${file}`); process.exit(2); }
        let mod;
        if (/\.json$/i.test(file)) mod = JSON.parse(readFileSync(file, 'utf8'));
        else mod = (await import(pathToFileURL(file).href)).default;
        if (typeof mod.setup === 'function') mod.setup({ kit, layout });
        subjects.push({ key: mod.skill || `fixture:${mod.name || f}`, fixture: mod, file: f });
    }
} else {
    const onlySkills = new Set(argAll('--skill'));
    const onlyCats = new Set(argAll('--category'));
    for (const [cat, list] of Object.entries(data.SKILLS)) {
        if (onlyCats.size && !onlyCats.has(cat)) continue;
        for (const s of list) {
            if (!s || s.retired || !s.v) continue;
            const key = `${cat}:${s.v}`;
            if (onlySkills.size && !onlySkills.has(key)) continue;
            subjects.push({ key, cat, skill: s.v });
        }
    }
    for (const k of argAll('--skill')) if (!subjects.some((s) => s.key === k)) { say(`ws-node-lint: "${k}" is not a live skill`); process.exit(2); }
}
const rules = wantRules.length ? wantRules : fixtures.length && subjects[0].fixture.rules ? subjects[0].fixture.rules.map((r) => r.toUpperCase()) : ALL_RULES;

/* ========================================================================= the deal */

/** Generate one item, quietly. */
function gen(cat, skill, seed, itemIndex, itemCount) {
    mute();
    try { return gq.generateQuestionFor({ category: cat, skill, seed, itemIndex, itemCount }); } catch (e) { return { __error: String(e && e.message || e) }; } finally { unmute(); }
}

/** A tiny seeded stream for fixtures (mulberry32). */
function mulberry(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** The page deal of print-sheet.js generateRun (one skill, no lesson floors): N items. */
function deal(subject) {
    const base = hashSeed(subject.key);
    if (subject.fixture) {
        const fx = subject.fixture;
        if (Array.isArray(fx.items)) return fx.items.map((q) => Object.assign({ categoryId: 'fixture', skillId: subject.key.split(':')[1] }, q));
        const rng = mulberry(base);
        return Array.from({ length: N }, (_, i) => Object.assign({ categoryId: 'fixture', skillId: subject.key.split(':')[1] }, fx.generate({ i, seed: base + i, rng, n: N })));
    }
    const out = [];
    const seen = new Set();
    let errors = 0;
    for (let i = 0; i < N; i++) {
        let got = null;
        for (let k = 0; k <= RETRIES; k++) {
            const q = gen(subject.cat, subject.skill, (base + i + 7919 * k) >>> 0, out.length, N);
            if (!q) continue;
            if (q.__error) { errors++; continue; }
            got = q;
            if (!seen.has(signature(q))) break;
        }
        if (!got) continue;
        seen.add(signature(got));
        out.push(got);
    }
    subject.genErrors = errors;
    return out;
}

/** The item with the cell the print path would draw: its kit template, or the legacy cell. */
function withCell(q) {
    let spec = null;
    try { spec = pg.kitCellSpec(q); } catch (e) { spec = null; }
    if (spec) return { q: Object.assign({}, q, { cell: { template: spec.template, payload: spec.payload, v: 1 } }), kit: true, template: spec.template };
    if (q.cell && q.cell.template && kit.hasCell(q.cell.template)) return { q, kit: true, template: q.cell.template };
    return { q: Object.assign({}, q, { cell: { template: 'legacy', v: 1 } }), kit: false, template: 'legacy' };
}

const CTX = {};
const ctxFor = (size) => CTX[size] || (CTX[size] = kit.resolveCtx({ mode: 'print', size, look: 'ican', state: 'blank' }));
function pupilHtml(cq, size = 'M') {
    try { return kit.renderCell(cq, ctxFor(size)); } catch (e) { return ''; }
}

/* ============================================================================ the rules */

const findings = [];          // {skill, rule, item, kind, detail}
const skipped = {};           // rule -> reason -> count (skills or items, as named)
const checked = {};           // rule -> {skills, items}
const skip = (rule, reason, n = 1) => { skipped[rule] = skipped[rule] || {}; skipped[rule][reason] = (skipped[rule][reason] || 0) + n; };
const tick = (rule, items) => { checked[rule] = checked[rule] || { skills: 0, items: 0 }; checked[rule].skills++; checked[rule].items += items; };
const find = (skill, rule, item, kind, detail) => findings.push({ skill, rule, item, kind, detail });

function ruleNotation(key, cells) {
    let n = 0;
    cells.forEach(({ q, html }, i) => {
        const texts = [['cell', visibleText(html)], ['text', plainText(q.text)]];
        const seen = new Set();
        for (const [where, t] of texts) {
            for (const h of notationHits(t)) {
                const id = `${h.kind}`;
                if (seen.has(id)) continue;
                seen.add(id);
                find(key, 'NOTATION', i, h.kind, `${h.cite} ${where}: "${h.match}"`);
            }
        }
        // P-14: the item's own instruction key is a library key.
        if (typeof q.instructionKey === 'string' && q.instructionKey && !kit.INSTRUCTION_LIBRARY[q.instructionKey]) {
            find(key, 'NOTATION', i, 'instruction', `P-14 item instructionKey "${q.instructionKey}" is not in INSTRUCTION_LIBRARY`);
        }
        n++;
    });
    tick('NOTATION', n);
}

function providerStrings(p, ref) {
    try { return typeof p.strings === 'function' ? p.strings(ref) : p.strings; } catch (e) { return null; }
}

function ruleInstructionWording(key, cat, skill, cells) {
    // P-14: the provider's instruction for each item is a library string.
    let p;
    try { p = kit.getProvider(cat, skill); } catch (e) { p = null; }
    if (!p) return;
    const seen = new Set();
    cells.forEach(({ q }, i) => {
        const s = providerStrings(p, { categoryId: cat, skillId: skill, q });
        const ins = s && s.instruction;
        if (typeof ins !== 'string' || !ins.trim()) return;
        if (inLibrary(ins) || seen.has(ins)) return;
        seen.add(ins);
        find(key, 'NOTATION', i, 'instruction', `P-14 instruction "${ins}" is not a library string`);
    });
}

function ruleL1(key, cells) {
    const kitCells = cells.filter((c) => c.kit);
    if (kitCells.length < cells.length / 2) {
        // A legacy cell is sized by measurement in the browser (the grid check needs it), and nothing scales its
        // drawing by size: a picture with a fixed width / height drawn the same at S as at L is the L1 defect.
        skip('L1', 'legacy-drawn: grid check needs the browser (drawing-scale check run)');
        const legacy = cells.filter((c) => !c.kit).slice(0, 4).map((c) => c.q);
        tick('L1', legacy.length);
        const hS = legacy.map((q) => pupilHtml(q, 'S')), hL = legacy.map((q) => pupilHtml(q, 'L'));
        const fixedPic = (h) => /<svg[^>]*\b(?:width|height)="\d+(?:\.\d+)?(?:px)?"|<svg[^>]*style="[^"]*(?:width|height):\s*\d+(?:\.\d+)?px|<img[^>]*\b(?:width|height)="\d+/.test(h);
        const idx = hS.map((h, i) => (h && h === hL[i] && fixedPic(h) ? i : -1)).filter((i) => i >= 0);
        if (idx.length && idx.length === legacy.length) find(key, 'L1', 0, 'scale', `legacy cell: the picture is drawn at a fixed size, the same at S and at L (${(/<svg[^>]*>/.exec(hS[idx[0]]) || [''])[0].slice(0, 90)})`);
        return;
    }
    const sample = kitCells.slice(0, 12).map((c) => c.q);
    const fpAt = (q, size) => { try { return kit.cellFootprint(q, kit.resolveCtx({ mode: 'print', size, look: 'ican' })); } catch (e) { return null; } };
    const fps = sample.map((q) => ({ S: fpAt(q, 'S'), L: fpAt(q, 'L') }));
    if (fps.some((f) => !f.S || !f.L)) { skip('L1', 'footprint threw'); return; }
    // The drawing scales: a template draws from ctx.metrics, so its markup at S differs from its markup at L (a size
    // written in mm / pt / px from the metrics), unless it sizes itself only through the page's CSS custom properties.
    const htmlS = sample.slice(0, 4).map((q) => pupilHtml(q, 'S'));
    const htmlL = sample.slice(0, 4).map((q) => pupilHtml(q, 'L'));
    const fixedDrawing = htmlS.every((h, i) => h && h === htmlL[i]) && !htmlS.some((h) => /var\(--|\b\d*\.?\d+em\b|class="[^"]*\bws-(?:S|M|L)\b/.test(h)) && htmlS.some((h) => /<svg|width="|height="|style="[^"]*(?:width|height|font-size)/.test(h));
    if (fps.some((f) => f.S.measure || f.L.measure)) {
        skip('L1', 'measured footprint: grid check needs the browser (drawing-scale check run)');
        tick('L1', Math.min(4, sample.length));
        if (fixedDrawing) find(key, 'L1', 0, 'scale', `template ${kitCells[0].template}: the pupil cell is drawn the same at S and at L (fixed sizes, no ctx.metrics)`);
        return;
    }
    tick('L1', sample.length);
    if (fixedDrawing) find(key, 'L1', 0, 'scale', `template ${kitCells[0].template}: the pupil cell is drawn the same at S and at L (fixed sizes, no ctx.metrics)`);
    const lay = (size) => {
        try {
            return layout.resolveSectionLayout({ role: 'independent', columns: 'auto', count: 30, dense: true }, sample.map((q) => ({ q })), 'A4', layout.LIVE_W_MM,
                { size, look: 'ican', header: layout.FULL_HEADER });
        } catch (e) { return null; }
    };
    const S = lay('S'), L = lay('L');
    if (!S || !L) { find(key, 'L1', 0, 'layout', 'resolveSectionLayout threw'); return; }
    if (!(S.perPage > L.perPage || S.cols > L.cols)) {
        find(key, 'L1', 0, 'grid', `S fits ${S.cols} x ${S.rows} = ${S.perPage}, L fits ${L.cols} x ${L.rows} = ${L.perPage}: S must fit more items or more columns`);
    }
    const same = fps.every((f) => f.S.wMm === f.L.wMm && f.S.hMm === f.L.hMm && Number.isFinite(f.S.wMm));
    if (same) find(key, 'L1', 0, 'scale', `footprint ${fps[0].S.wMm} x ${fps[0].S.hMm} mm at S and at L: the drawing does not scale with ctx.metrics`);
}

const JUDGE_WORDS = /^(yes|no|true|false|correct|not correct|fix it|always|sometimes|never|same|not the same|more|fewer|less|reasonable|not reasonable|even|odd|enough|not enough|a\.m\.|p\.m\.|am|pm)$/i;
function answerToken(q) {
    const a = q.ans;
    if (a === undefined || a === null) return { skip: 'no answer' };
    if (typeof a === 'object') return { skip: 'answer is a list or object' };
    const s = String(a).trim();
    if (!s) return { skip: 'empty answer' };
    if (/^[<>=≤≥≠+−×÷-]$/.test(s)) return { skip: 'answer is a sign' };
    if (/^[A-Za-z]$/.test(s)) return { skip: 'answer is one choice letter' };
    if (JUDGE_WORDS.test(s)) return { skip: 'answer is a judge word (a check-box label)' };
    if (/,/.test(s) && !/^\d{1,3}(,\d{3})+$/.test(s)) return { skip: 'answer is a list' };
    if (/\//.test(s)) return { skip: 'answer is a fraction (drawn stacked)' };
    return { token: s };
}
/** How many times the question itself prints the answer: its text, and a printed list holding it (choices). */
function allowance(q, tok) {
    let n = tokenCount(plainText(q.text), tok);
    if (/^\d$/.test(tok)) n = Math.max(n, (plainText(q.text).match(new RegExp(tok, 'g')) || []).length);
    const lists = [];
    const walk = (v, d) => {
        if (!v || d > 6) return;
        if (Array.isArray(v)) {
            if (v.length >= 2 && v.some((x) => x !== null && typeof x !== 'object' && String(x).trim().toLowerCase() === tok.toLowerCase())) lists.push(v);
            for (const x of v) walk(x, d + 1);
        } else if (typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (!SKIP_KEYS.has(k)) walk(x, d + 1); }
    };
    // Any printed list the answer is one of (choices, a chart's categories, a table's labels), anywhere in the item;
    // an object keyed by labels counts as a list of its keys.
    const walkAll = (v, d) => {
        if (!v || d > 6 || typeof v !== 'object') return;
        if (!Array.isArray(v)) {
            const keys = Object.keys(v);
            if (keys.length >= 2 && keys.some((k) => k.trim().toLowerCase() === tok.toLowerCase())) lists.push(keys);
        }
        walk(v, d);
    };
    walkAll(q.options, 0);
    for (const [k, v] of Object.entries(q)) if (!SKIP_KEYS.has(k) && k !== 'options' && v && typeof v === 'object') walkAll(v, 0);
    return n + lists.length;
}
/** Templates that draw a number one digit per track (a one-digit answer meets the operands' own digits there). */
const TRACK_TEMPLATES = new Set(['stack', 'fact', 'pv', 'pv-support', 'count-row', 'mult-grid', 'chartwindow', 'seqstrip', 'division', 'area-model', 'add-three', 'remainder', 'money-columns', 'mult-chart', 'long-division']);
function ruleL3(key, cells) {
    let n = 0;
    cells.forEach(({ q, html, template }, i) => {
        const at = answerToken(q);
        if (at.skip) { skip('L3', at.skip + ' (items)'); return; }
        const tok = at.token;
        if (q.target !== undefined && String(q.target) === tok) { skip('L3', 'answer is the given target (a build task) (items)'); return; }
        // An answer equal to a number the question gives (1 × 12 = 12, a + 5 = 10) is printed because the question is.
        const given = [...numbersIn(plainText(q.text)), ...[q.a, q.b].filter((v) => typeof v === 'number'), ...(Array.isArray(q.operands) ? q.operands : [])].map(String);
        if (given.includes(tok.replace(/,/g, ''))) { skip('L3', 'answer equals a number the question gives (items)'); return; }
        n++;
        const text = visibleText(html);
        const shown = tokenCount(text, tok);
        if (!shown) return;
        const num = Number(tok.replace(/,/g, ''));
        if (/^\d$/.test(tok) && TRACK_TEMPLATES.has(template)) { skip('L3', 'one-digit answer in a digit-track cell (items)'); return; }
        if (/^-?\d[\d,]*(\.\d+)?$/.test(tok) && Number.isFinite(num) && onScale(num, numbersIn(text.replace(/−/g, '-')).concat(numbersIn(text).map((x) => -x)))) return;
        const tm = /^(\d{1,2}):(\d{2})$/.exec(tok);
        if (tm && onScale(Number(tm[1]) * 60 + Number(tm[2]), timesIn(text))) return;
        const allowed = allowance(q, tok);
        if (shown > allowed) find(key, 'L3', i, 'key-shown', `answer "${tok}" visible ${shown}x in the pupil cell (${allowed}x printed by the question): "${text.slice(0, 120)}"`);
    });
    tick('L3', n);
}

function stepTexts(p, cat, skill, q) {
    const out = [];
    try {
        const ws = p.workedSteps ? p.workedSteps(q) : [];
        if (Array.isArray(ws)) ws.forEach((s, k) => { const t = s && (typeof s === 'string' ? s : s.text); if (t) out.push(['worked step ' + (k + 1), String(t)]); });
    } catch (e) { /* a throwing provider is providers-unit's finding */ }
    const s = providerStrings(p, { categoryId: cat, skillId: skill, q });
    if (s) {
        if (typeof s.instruction === 'string') out.push(['instruction', s.instruction]);
        if (Array.isArray(s.steps)) s.steps.forEach((t, k) => { if (typeof t === 'string') out.push(['step ' + (k + 1), t]); });
        for (const f of ['say', 'oralFrame']) if (typeof s[f] === 'string') out.push([f, s[f]]);
    }
    return out;
}
/** Facts every page may state (a right angle, the clock, a day, a hundred): never another item's numbers. */
const DOMAIN_CONSTANTS = new Set([10, 12, 24, 60, 90, 100, 180, 360, 1000, 10000, 100000, 1000000]);
function ruleL6(key, cat, skill, cells) {
    let p;
    try { p = kit.getProvider(cat, skill); } catch (e) { p = null; }
    if (!p) { skip('L6', 'no provider'); return; }
    let n = 0;
    // A number the item neither holds nor derives is a defect when it is FIXED: the same stray number on several
    // items is a step list written for other numbers (an example baked into the string). A stray number that changes
    // with the item is that item's own multi-step working (a long-division remainder) and is let through.
    const per = [];
    const freq = new Map();
    cells.forEach(({ q }, i) => {
        const texts = stepTexts(p, cat, skill, q).map(([w, t]) => [w, plainText(t)]);
        if (!texts.length) return;
        n++;
        const U = numberUniverse(itemNumbers(q), [plainText(q.text), typeof q.ans === 'string' ? q.ans : '']);
        const stray = [];
        for (const [where, t] of texts) {
            for (const v of numbersIn(t)) if (v >= 10 && !DOMAIN_CONSTANTS.has(v) && !U.has(Math.round(v * 1e6) / 1e6)) stray.push({ v, where, t });
        }
        for (const v of new Set(stray.map((x) => x.v))) freq.set(v, (freq.get(v) || 0) + 1);
        per.push({ i, q, stray, texts });
    });
    const fixedAt = Math.max(3, Math.ceil(n / 10));
    // the numbers each dealt item prints in its own question: a stray number that another item of the page prints
    // and this one does not is that other item's working (a provider reading a stale item)
    const givenOf = cells.map(({ q }) => new Set(numbersIn(plainText(q.text))));
    for (const { i, q, stray } of per) {
        const fixed = stray.filter((x) => freq.get(x.v) >= fixedAt);
        const other = stray.filter((x) => !fixed.includes(x) && givenOf.some((g, j) => j !== i && g.has(x.v)));
        if (fixed.length) find(key, 'L6', i, 'other-numbers', `item "${plainText(q.text).slice(0, 50)}" ans ${JSON.stringify(q.ans)}; on ${freq.get(fixed[0].v)} items: ${fixed.slice(0, 3).map((x) => `${x.v} (${x.where}: "${x.t.slice(0, 60)}")`).join('; ')}`);
        else if (other.length >= 2 || (other.length === 1 && stray.length === 1)) find(key, 'L6', i, 'neighbour-numbers', `item "${plainText(q.text).slice(0, 50)}" ans ${JSON.stringify(q.ans)}; another item's numbers: ${other.slice(0, 3).map((x) => `${x.v} (${x.where}: "${x.t.slice(0, 60)}")`).join('; ')}`);
    }
    // A step written with numbers, word for word the same on several different items, is an example baked into the
    // string: flagged on every item that does not itself print the number (a fact such as 90 degrees is let through).
    // A number with a unit after it ("1 yard = 36 inches", "15 minutes") is a measurement fact, not an example.
    const exampleNumbers = (t) => [...String(t).matchAll(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g)]
        .filter((m) => !/^\s*(?:°|degrees?|minutes?|min\b|hours?|seconds?|inch(?:es)?|feet|foot|ft\b|yards?|miles?|cm\b|mm\b|m\b|km\b|g\b|kg\b|mL\b|ml\b|L\b|liters?|oz\b|ounces?|lb\b|pounds?|cups?|pints?|quarts?|gallons?|cents?|¢|%|days?|weeks?|months?|years?)/i.test(t.slice(m.index + m[0].length)))
        .map((m) => Number(m[0].replace(/,/g, ''))).filter((v) => v >= 10 && !DOMAIN_CONSTANTS.has(v));
    const halfAt = Math.max(3, Math.ceil(n / 2));
    const textFreq = new Map();
    for (const { q, texts } of per) for (const t of new Set(texts.map(([, t]) => t))) {
        if (!exampleNumbers(t).length) continue;
        const e = textFreq.get(t) || { n: 0, items: new Set() };
        e.n++; e.items.add(plainText(q.text) + '|' + JSON.stringify(q.ans));
        textFreq.set(t, e);
    }
    for (const { i, q, texts } of per) {
        if (findings.some((f) => f.skill === key && f.rule === 'L6' && f.item === i)) continue;
        const own = atomsOf(itemNumbers(q));
        const hit = texts.find(([, t]) => { const e = textFreq.get(t); return e && e.n >= halfAt && e.items.size >= halfAt && exampleNumbers(t).some((v) => !own.has(v)); });
        if (hit) find(key, 'L6', i, 'fixed-example', `item "${plainText(q.text).slice(0, 50)}" ans ${JSON.stringify(q.ans)}; the same ${hit[0]} on ${textFreq.get(hit[1]).n} items: "${hit[1].slice(0, 80)}"`);
    }
    // the operation the instruction names is the item's own (an "Add." over a subtraction)
    const OPS = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
    cells.forEach(({ q }, i) => {
        const s = providerStrings(p, { categoryId: cat, skillId: skill, q });
        const k = s && (s.instructionKey || inLibrary(s.instruction || ''));
        if (!OPS[k]) return;
        const t = plainText(q.text).replace(/(\d)\s*-\s*(?=\d)/g, '$1 − ').replace(/(\d)\s*[x*]\s*(?=\d)/g, '$1 × ');
        const ops = new Set((t.match(/[+−×÷]/g) || []));
        if (ops.size === 1 && !ops.has(OPS[k])) find(key, 'L6', i, 'other-operation', `instruction "${s.instruction}" on "${t.slice(0, 50)}"`);
    });
    if (!n) skip('L6', 'provider gives no steps, instruction or Say line');
    else tick('L6', n);
}

function ruleL10(key, cells) {
    const items = cells.map((c) => c.q);
    if (items.length < 10) { skip('L10', `fewer than 10 items dealt`); return; }
    tick('L10', items.length);
    const vals = items.map((q) => (typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans)));
    if (isConstant(vals)) find(key, 'L10', 0, 'constant-answer', `the answer is "${vals[0]}" on all ${vals.length} items`);
    const pv = cyclePeriod(vals);
    if (pv) find(key, 'L10', 0, 'answer-cycle', `the answer repeats every ${pv} items: ${vals.slice(0, 2 * pv).join(', ')} ...`);
    const pos = items.map((q) => (Array.isArray(q.options) && q.options.length >= 2 ? q.options.map(String).indexOf(String(q.ans)) : -1));
    const choice = pos.filter((x) => x >= 0);
    if (choice.length >= 10) {
        if (isConstant(choice)) find(key, 'L10', 0, 'constant-position', `the right choice is always option ${'ABCDEFGH'[choice[0]]} (${choice.length} choice items)`);
        const pp = cyclePeriod(choice);
        if (pp) find(key, 'L10', 0, 'position-cycle', `the right choice cycles every ${pp} items: ${choice.slice(0, 2 * pp).map((x) => 'ABCDEFGH'[x]).join(' ')} ...`);
    }
}

function ruleRepeats(key, cells) {
    const page = cells.slice(0, PAGE).map((c) => c.q);
    if (page.length < 2) { skip('REPEATS', 'fewer than 2 items dealt'); return; }
    tick('REPEATS', page.length);
    const sigs = new Map(), vis = new Map();
    page.forEach((q, i) => {
        const s = signature(q), v = visibleKey(q);
        if (sigs.has(s)) find(key, 'REPEATS', i, 'same-item', `item ${i + 1} repeats item ${sigs.get(s) + 1}: "${plainText(q.text).slice(0, 60)}"`);
        else if (v && vis.has(v)) find(key, 'REPEATS', i, 'same-problem', `item ${i + 1} prints the same problem as item ${vis.get(v) + 1}: "${plainText(q.text).slice(0, 60)}"`);
        if (!sigs.has(s)) sigs.set(s, i);
        if (v && !vis.has(v)) vis.set(v, i);
    });
}

/* ============================================================================== run */

const T1 = Date.now();
for (const subject of subjects) {
    const items = deal(subject);
    if (!items.length) { for (const r of rules) skip(r, 'skill dealt no items (skills)'); continue; }
    const cells = items.map((q) => { const c = withCell(q); return Object.assign(c, { html: pupilHtml(c.q, 'M') }); });
    const cat = subject.fixture ? subject.key.split(':')[0] : subject.cat;
    const skill = subject.fixture ? subject.key.split(':')[1] : subject.skill;
    if (rules.includes('NOTATION')) { ruleNotation(subject.key, cells); ruleInstructionWording(subject.key, cat, skill, cells); }
    if (rules.includes('L1')) ruleL1(subject.key, cells);
    if (rules.includes('L3')) ruleL3(subject.key, cells);
    if (rules.includes('L6')) ruleL6(subject.key, cat, skill, cells);
    if (rules.includes('L10')) ruleL10(subject.key, cells);
    if (rules.includes('REPEATS')) ruleRepeats(subject.key, cells);
}
const RUN_MS = Date.now() - T1;

/* ======================================================================== the baseline */

const counts = {};
for (const f of findings) { counts[f.skill] = counts[f.skill] || {}; counts[f.skill][f.rule] = (counts[f.skill][f.rule] || 0) + 1; }

const BASELINE_DEFAULT = join(SCRIPT_ROOT, 'design', 'audit', 'baselines', 'node-lint.json');
const baselineFile = arg('--baseline', BASELINE_DEFAULT);
const useBaseline = !fixtures.length && !has('--no-baseline') && !has('--write-baseline') && existsSync(baselineFile);
let base = null;
if (useBaseline) {
    try { base = JSON.parse(readFileSync(baselineFile, 'utf8')); } catch (e) { say(`ws-node-lint: unreadable baseline ${baselineFile}: ${e.message}`); process.exit(2); }
}

const newFindings = [];      // {skill, rule, count, base}
const improved = [];
if (base) {
    const bc = base.counts || {};
    const keys = new Set([...Object.keys(counts), ...subjects.map((s) => s.key)]);
    for (const k of keys) {
        for (const r of rules) {
            const got = (counts[k] && counts[k][r]) || 0;
            const was = (bc[k] && bc[k][r]) || 0;
            if (got > was) newFindings.push({ skill: k, rule: r, count: got, base: was });
            else if (got < was) improved.push({ skill: k, rule: r, count: got, base: was });
        }
    }
}

/* ============================================================================ report */

const pad = (s, w) => String(s).padEnd(w);
const padL = (s, w) => String(s).padStart(w);
say(`ws-node-lint: ${subjects.length} ${fixtures.length ? 'fixture' : 'skill'}(s), ${N} items each, page ${PAGE}, root ${ROOT}`);
say('');
say(`${pad('rule', 10)}${padL('skills', 8)}${padL('items', 8)}${padL('findings', 10)}${padL('skills hit', 12)}  skipped`);
for (const r of rules) {
    const c = checked[r] || { skills: 0, items: 0 };
    const fs = findings.filter((f) => f.rule === r);
    const hit = new Set(fs.map((f) => f.skill)).size;
    const sk = Object.entries(skipped[r] || {}).map(([why, n]) => `${n} ${why}`).join('; ') || '-';
    say(`${pad(r, 10)}${padL(c.skills, 8)}${padL(c.items, 8)}${padL(fs.length, 10)}${padL(hit, 12)}  ${sk}`);
}
const genErr = subjects.reduce((a, s) => a + (s.genErrors || 0), 0);
if (genErr) say(`\n(generator threw on ${genErr} attempt(s); those attempts were retried under the next seed)`);
say('');

const show = (list, max) => {
    for (const f of list.slice(0, max)) say(`  ${f.rule} ${f.skill} #${f.item + 1} [${f.kind}] ${f.detail}`);
    if (list.length > max) say(`  ... ${list.length - max} more (--json for all)`);
};
let failCount = 0;
if (base) {
    say(`baseline: ${baselineFile.replace(SCRIPT_ROOT + '/', '')} (pinned at n=${base.n}, page=${base.page})`);
    if (base.n !== N || base.page !== PAGE) say(`  note: this run uses n=${N}, page=${PAGE}; counts are compared as they stand`);
    if (newFindings.length) {
        say(`NEW beyond the baseline (${newFindings.length} skill/rule pairs):`);
        for (const nf of newFindings) {
            say(`  ${nf.rule} ${nf.skill}: ${nf.count} (baseline ${nf.base})`);
            show(findings.filter((f) => f.skill === nf.skill && f.rule === nf.rule), 4);
        }
    } else say('no finding beyond the baseline');
    if (improved.length) say(`improved below the baseline (${improved.length}; re-pin with --write-baseline): ${improved.slice(0, 12).map((x) => `${x.rule} ${x.skill} ${x.base}->${x.count}`).join(', ')}${improved.length > 12 ? ' ...' : ''}`);
    failCount = newFindings.reduce((a, x) => a + (x.count - x.base), 0);
} else {
    if (findings.length) { say('findings:'); show(findings, has('--verbose') ? 1e9 : 40); }
    failCount = findings.length;
    if (!fixtures.length && !has('--write-baseline')) say(`(no baseline${has('--no-baseline') ? ' (--no-baseline)' : ` at ${baselineFile}`}: every finding counts)`);
}
if (has('--verbose') && base) { say('all findings:'); show(findings, 1e9); }

if (has('--write-baseline')) {
    let prev = { counts: {} };
    if (existsSync(baselineFile) && (argAll('--skill').length || argAll('--category').length || wantRules.length)) {
        try { prev = JSON.parse(readFileSync(baselineFile, 'utf8')); } catch (e) { prev = { counts: {} }; }
    }
    const merged = Object.assign({}, prev.counts || {});
    for (const s of subjects) {
        const cur = Object.assign({}, merged[s.key] || {});
        for (const r of rules) { const v = (counts[s.key] && counts[s.key][r]) || 0; if (v) cur[r] = v; else delete cur[r]; }
        if (Object.keys(cur).length) merged[s.key] = cur; else delete merged[s.key];
    }
    const sorted = Object.fromEntries(Object.keys(merged).sort().map((k) => [k, merged[k]]));
    const out = {
        about: 'ws-node-lint pinned findings per skill per rule (IMPROVEMENT_PLAN §1.4 S2). A run fails only on counts above these. Re-pin with node tests/scripts/ws-node-lint.mjs --write-baseline after a fix lowers a count; never raise a count by hand.',
        generated: new Date().toISOString().slice(0, 10), n: N, page: PAGE, rules: ALL_RULES,
        totals: Object.fromEntries(ALL_RULES.map((r) => [r, Object.values(sorted).reduce((a, c) => a + (c[r] || 0), 0)])),
        counts: sorted,
    };
    mkdirSync(dirname(baselineFile), { recursive: true });
    writeFileSync(baselineFile, JSON.stringify(out, null, 1) + '\n');
    say(`wrote ${baselineFile} (${Object.keys(sorted).length} skills with findings)`);
    failCount = 0;
}

const jsonOut = arg('--json', null);
if (jsonOut) {
    writeFileSync(jsonOut, JSON.stringify({ root: ROOT, n: N, page: PAGE, rules, subjects: subjects.map((s) => s.key), checked, skipped, counts, findings, newFindings, improved, ms: { load: LOAD_MS, run: RUN_MS } }, null, 1));
    say(`json: ${jsonOut}`);
}
say(`time: load ${(LOAD_MS / 1000).toFixed(1)} s, lint ${(RUN_MS / 1000).toFixed(1)} s, total ${((Date.now() - T0) / 1000).toFixed(1)} s`);
say(failCount ? `ws-node-lint: FAIL (${failCount})` : 'ws-node-lint: OK');
process.exit(failCount && !has('--report-only') ? 1 : 0);
