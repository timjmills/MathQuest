// Content gate for the + - x / skills: does a skill generate what its own NAME promises?
//
// The owner's page holds SIX items. One item outside the band is a sixth of the lesson, so this
// runs as a gate, not a report: any skill with a failing class exits non-zero.
//
//   node tests/scripts/ws-content-audit.cjs                       # every operations skill
//   node tests/scripts/ws-content-audit.cjs --category addition    # one category
//   node tests/scripts/ws-content-audit.cjs --skill add_20_regroup # one skill
//   node tests/scripts/ws-content-audit.cjs --n 600 --json out.json
//   node tests/scripts/ws-content-audit.cjs --report-only          # print, always exit 0
//
// THE NAME IS THE CONTRACT. A skill's id and label are what the teacher picks from and what the
// pupil reads at the top of the sheet, so they are the declaration this gate checks against:
//   * "within N" / "to N" bounds the ANSWER, never the operands (owner ruling 2026-09-19):
//     the sum for +, the minuend for -, the product for x, the dividend for division.
//   * "(1-12)" on a fact drill bounds the TABLE, not the product.
//   * the operation words in the name are the only operations the skill may emit. "Mixed
//     Addition & Subtraction" declares + and -; if it also deals x, that is still a failure.
//   * "Mixed ..." (the word leading the name) additionally declares that the CELL SHAPE varies.
//     "Add within 10" ending in _mixed does not: there "mixed" is the regrouping, not the page.
//
// DETERMINISM. Every item is generated through generateQuestionFor({ seed }), and the seed is
// hash(category:skill) + itemIndex. Item 7 of add_20_regroup is therefore the same item in a
// full run, in a --skill run and at any --n: two runs over the same tree produce byte-identical
// output, so a threshold can be zero-tolerance without flapping.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const { ROOT, open, listSkills, hideOverlays } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes('--' + k);

// 240 items = 40 six-item pages, more of one skill than a term of lessons uses. A defect that
// afflicts 1 item in 100 is expected ~2.4 times here, and the whole 146-skill sweep still runs
// in well under a minute. Sampling is deterministic, so N only changes how deep we look, never
// whether a given item appears.
const N = parseInt(arg('n', '240'), 10);
const PAGE = 6;                       // items on one of the owner's pages
const ONLY_SKILL = arg('skill', null);
const ONLY_CAT = arg('category', null);
const JSON_OUT = arg('json', null);
const CATS = ['addition', 'subtraction', 'multiplication', 'division'];

// ---------------------------------------------------------------------------
// Reading the promise out of the name
// ---------------------------------------------------------------------------
const GLYPH = { '+': '+', '-': '−', '−': '−', '–': '−', x: '×', '*': '×', '×': '×', '/': '÷', '÷': '÷' };
const norm = op => GLYPH[String(op)] || String(op);

// Words that name an operation. Matched against the label and against the id with underscores
// turned into spaces, so `missing_add_sub` and "Missing Numbers (+/-)" both read as + and -.
const OP_WORDS = {
    '+': [/\badd(?:s|ed|ing|ition|itions)?\b/, /\baddend/, /\bsum\b/, /\bplus\b/, /\+/],
    '−': [/\bsub\b/, /\bsubtract(?:s|ed|ing|ion)?\b/, /\bminus\b/, /\bdifference\b/, /\btake away\b/, /\bfewer\b/, /[−–]/],
    '×': [/\bmult\b/, /\bmultipl(?:y|ies|ied|ication)\b/, /\btimes\b/, /\bproduct\b/, /\barrays?\b/, /\bequal groups\b/, /\bfactors?\b/, /×/],
    '÷': [/\bdiv\b/, /\bdivid(?:e|es|ed|ing)\b/, /\bdivision\b/, /\bquotient\b/, /\bremainders?\b/, /÷/],
};
const INVERSE = { '+': '−', '−': '+', '×': '÷', '÷': '×' };
const CAT_OP = { addition: '+', subtraction: '−', multiplication: '×', division: '÷' };

// A handful of names describe a CONSTRUCT rather than an operation. Each line says why the
// construct carries an operation the words do not. This is the whole override table: everything
// else is read straight off the name, so nothing here can drift out of step with a skill.
const CONSTRUCTS = [
    // A fact / number family IS the inverse pair in one cell. "Addition Fact Families" prints
    // 3+4=7 and 7-4=3 together; that is the skill, not a silent mix.
    { test: /fact.famil|number.famil/, add: ops => ops.map(o => INVERSE[o]) },
    // An unknown-start story ("? + 5 = 12") is written as addition and solved by subtraction;
    // both signs legitimately appear on the page.
    { test: /unknown.start/, add: () => ['+', '−'] },
    // An equation to judge true or false is built from whatever fact the pupil has met, so the
    // inverse is fair game inside the same equation ("9 - 4 = 5" tests the same fact as 4+5).
    { test: /equal.sign|true.false/, add: ops => ops.map(o => INVERSE[o]) },
];

function declaredOps(id, label, categoryId) {
    // A numeric range is punctuation, not an operator: the en dash in "(sums 11-18)" must not
    // read as a minus sign and quietly license subtraction on an addition skill.
    const hay = `${String(id).replace(/_/g, ' ')} ${String(label)}`.toLowerCase()
        .replace(/\d+\s*[-–—]\s*\d+/g, ' ');
    const found = new Set();
    for (const [op, res] of Object.entries(OP_WORDS)) if (res.some(r => r.test(hay))) found.add(op);
    if (!found.size && CAT_OP[categoryId]) found.add(CAT_OP[categoryId]);
    for (const c of CONSTRUCTS) if (c.test.test(hay)) for (const o of c.add([...found])) if (o) found.add(o);
    return found;
}

// "Mixed" only declares a varied PAGE when it leads the name. `add_10_mixed` / "Add within 10"
// is mixed REGROUPING and must still hold one cell shape.
const declaresMixedPage = (id, label) => /^mixed[_ ]/.test(String(id)) || /^mixed\b/i.test(String(label));

const ID_BANDS = [[/_1m(_|$)/, 1000000], [/_100k(_|$)/, 100000], [/_10k(_|$)/, 10000], [/_1k(_|$)/, 1000],
    [/_100(_|$)/, 100], [/_50(_|$)/, 50], [/_20(_|$)/, 20], [/_10(_|$)/, 10], [/_5(_|$)/, 5]];

// A name whose id band no longer describes the skill. Owner ruling 2 turned "Add within 10
// (With Regrouping)" into BRIDGING TEN - single-digit addends, sums 11-18 - and the id
// `add_10_regroup` can never change, because four share-code systems index by position. So when
// the label says bridging, the 10 in the id is history and only the label is read.
const ID_BAND_VOID = /bridging|crossing|cross(?:ing)? (?:the )?ten|making (?:a )?ten|over the ten/i;

// The noun a label uses for the number "within N" is about. Naming it lets a label state BOTH
// ends of the band, which is what a bridging step needs: "(sums 11-18)" is not satisfied by a
// sum of 5, and reading the 18 as an operand bound would assert nothing at all, because every
// single-digit addend is under 18 by definition.
const BOUNDED_NOUN = '(?:sums?|totals?|differences?|minuends?|dividends?|products?|quotients?|answers?)';

// The band the name promises: min..value. `bounds: 'answer'` is the owner's ruling;
// `bounds: 'operand'` is the fact-table phrasing "(1-12)", where the 12 is the table and the
// product legitimately reaches 144. "within N" always means 0..N.
function declaredBand(id, label) {
    const L = String(label);
    const num = s => parseInt(String(s).replace(/,/g, ''), 10);
    // "(sums 11-18)" / "minuends 11 to 18": a band with a FLOOR as well as a ceiling.
    const span = L.match(new RegExp(`\\b${BOUNDED_NOUN}\\s+([\\d,]+)\\s*(?:[-–—]|to)\\s*([\\d,]+)`, 'i'));
    const m = span ? null
        : L.match(/\bwithin\s+([\d,]+)/i) || L.match(/\bup to\s+([\d,]+)/i) || L.match(/[≤<]=?\s*([\d,]+)/)
        // "sums to 18", "differences to 18": a ceiling only.
        || L.match(new RegExp(`\\b${BOUNDED_NOUN}\\s+(?:up to|to)\\s+([\\d,]+)`, 'i'));
    const fromLabel = span ? { min: num(span[1]), value: num(span[2]), bounds: 'answer', from: 'label' }
        : m ? { min: 0, value: num(m[1]), bounds: 'answer', from: 'label' } : null;
    const table = L.match(/\(\s*\d+\s*[-–]\s*(\d+)\s*\)/);
    const fromTable = table ? { min: 0, value: num(table[1]), bounds: 'operand', from: 'label' } : null;
    let fromId = null;
    if (!ID_BAND_VOID.test(L)) {
        for (const [re, v] of ID_BANDS) if (re.test(String(id))) { fromId = { min: 0, value: v, bounds: 'answer', from: 'id' }; break; }
    }
    const band = fromLabel || fromTable || fromId;
    const mismatch = fromLabel && fromId && fromLabel.value !== fromId.value
        ? `the id says ${fromId.value} but the label says ${fromLabel.value}` : null;
    return { band, mismatch };
}

const promisesRegroup = (id, label) => /with regrouping/i.test(label) || (/_regroup(_|$)/.test(id) && !/no_regroup/.test(id));
const promisesNoRegroup = (id, label) => /no regrouping/i.test(label) || /no_regroup/.test(id);
// A fact drill claims to cover a whole table, and the constant option that selects the table runs
// from 0 (skill-options.js constantOption; owner ruling 4). So a fact page, left on its default
// "Mixed (all of them)", must be able to deal the zero facts.
// A fact FAMILY is not a fact drill: 0, 5, 5 would make the family 0+5=5 / 5-5=0, which teaches
// nothing, and the constant option belongs to the drill, not to the family cell.
const isFactDrill = (id, label) => !/famil/i.test(`${id} ${label}`)
    && (/(^|_)facts?(_|$)/.test(String(id)) || /\bfacts\b/i.test(String(label)));

// ---------------------------------------------------------------------------
// Cell shapes: what the pupil's cell LOOKS like
// ---------------------------------------------------------------------------
// Two print formats in the same shape are the same cell written differently (column-add and
// add-facts-vertical are both a stacked sum). Two shapes on one page is the defect that matters:
// the pupil's cell changes kind halfway down the sheet.
const SHAPE_OF = {
    column: ['column-add', 'column-sub', 'add-facts-vertical', 'sub-facts-vertical', 'mult-facts-vertical', 'long-division'],
    across: ['(none)', 'add-facts-horizontal', 'sub-facts-horizontal', 'mult-facts-horizontal', 'div-facts-horizontal',
        'div-facts-fraction', 'missing-number', 'missing-operator', 'missing-factor', 'inline-cloze', 'build-expr'],
    word: ['word-add', 'word-sub', 'word-problem', 'word-plain', 'unknown-start-wp'],
    model: ['area-model-mult', 'area-model-mult-hard', 'area-model-div', 'box-division', 'array-builder', 'arrays-groups',
        'dot-array-visual', 'add-5-pictures', 'sub-5-pictures', 'div-remainders', 'mult-properties', 'mult-chart', 'mult-chart-tier'],
    numberline: ['nl-add', 'nl-sub', 'nl-mult', 'nl-div', 'number-line-visual'],
    family: ['fact-family-add-sub', 'fact-family-mult-div', 'number-family-add-sub', 'number-family-mult-div'],
    select: ['multi-select'],
};
const FORMAT_SHAPE = new Map();
for (const [shape, fmts] of Object.entries(SHAPE_OF)) for (const f of fmts) FORMAT_SHAPE.set(f, shape);
// A format nobody has classified yet is reported as a note rather than guessed at, so the table
// above stays honest instead of silently swallowing a new cell.
const shapeOf = f => FORMAT_SHAPE.get(f) || null;
// column vs across is the `notation` option (skill-options.js): a SET the teacher ticks, and
// several ticked deliberately writes one page both ways. So it is judged separately from the
// shape groups below.
const ARITH = new Set(['column', 'across']);

// ---------------------------------------------------------------------------
// Arithmetic helpers (run on the node side, on the sampled items)
// ---------------------------------------------------------------------------
// Any column, not just the ones: 190 + 120 regroups in the tens even though the ones do not.
function regroups(a, b, op) {
    let x = Math.abs(a), y = Math.abs(b);
    if (op === '+') {
        let carry = 0;
        while (x > 0 || y > 0) { const s = (x % 10) + (y % 10) + carry; if (s >= 10) return true; carry = 0; x = Math.floor(x / 10); y = Math.floor(y / 10); }
        return false;
    }
    if (op === '−') {
        let borrow = 0;
        while (y > 0 || borrow) { const top = (x % 10) - borrow, bot = y % 10; if (top < bot) return true; borrow = 0; x = Math.floor(x / 10); y = Math.floor(y / 10); }
        return false;
    }
    return null;                        // regrouping is not a promise x and / make by name
}
// The one number "within N" is about (owner ruling 1).
const bounded = (a, b, op) => op === '+' ? a + b : op === '−' ? a : op === '÷' ? a : a * b;
const asNumber = v => (typeof v === 'number' && Number.isFinite(v)) ? v
    : (typeof v === 'string' && /^-?\d+$/.test(v.trim())) ? parseInt(v.trim(), 10) : null;

// IS THE ANSWER KEY RIGHT?
//
// Every other rule here asks what a skill DEALS. None of them asks whether the answer it ships
// is the right one, so a generator could deal a perfectly banded, correctly regrouped `3 + 8`
// and answer 12 - and every page AND its answer key would be wrong with the gate still green.
//
// The check is driven by the item's OWN printed equation rather than by a/b, because the blank
// is not always in the result: `? + 9 = 16` answers 7 and `20 ÷ ___ = 4` answers 5, and asserting
// ans === a op b would call both of those wrong. So: read `X op Y = Z` off the text, drop the
// answer into whichever slot is blank, and require the equation to balance. An item with no such
// equation (a word problem, a chart, a family cell) is simply not checked - this rule reports
// only what it can prove, so it can be zero-tolerance.
const BLANK_SLOT = /^(?:\?|_+|\[\s*\]|□)$/;
const SLOT = '(\\?|_+|\\[\\s*\\]|□|\\d[\\d,]*)';
const EQUATION = new RegExp(`^${SLOT}\\s*([+\\-−–×x*÷/])\\s*${SLOT}\\s*=\\s*${SLOT}\\s*[.?!]?$`);

function equationCheck(it) {
    const t = String(it.text || '').trim();
    const m = t.match(EQUATION);
    if (!m) return null;                       // not a bare equation: nothing provable here
    const slots = [m[1], m[3], m[4]];
    if (slots.filter(s => BLANK_SLOT.test(s)).length !== 1) return null;  // 0 or 2 blanks: skip
    const ans = asNumber(it.ans);
    if (ans === null) return null;             // a non-numeric answer is another rule's problem
    const op = norm(m[2]);
    const [X, Y, Z] = slots.map(s => BLANK_SLOT.test(s) ? ans : parseInt(s.replace(/,/g, ''), 10));
    if (![X, Y, Z].every(Number.isFinite)) return null;
    const shown = `${X} ${op} ${Y} = ${Z}`;
    if (op === '÷') {
        if (Y === 0) return { ok: false, shown: `${shown}  (divides by zero)` };
        // A quotient-and-remainder cell legitimately prints the whole-number quotient in the
        // result slot (477 ÷ 8 -> 59 r 5), so floor is accepted THERE and nowhere else.
        if (Z === X / Y) return { ok: true };
        const resultBlank = BLANK_SLOT.test(slots[2]);
        if (resultBlank && Z === Math.floor(X / Y)) return { ok: true, remainder: true };
        return { ok: false, shown: `${shown}  (${X} ÷ ${Y} = ${+(X / Y).toFixed(4)})` };
    }
    const want = op === '+' ? X + Y : op === '−' ? X - Y : X * Y;
    return want === Z ? { ok: true } : { ok: false, shown: `${shown}  (should be ${want})` };
}

// ---------------------------------------------------------------------------
// Sampling (runs inside the page)
// ---------------------------------------------------------------------------
function sampleInPage({ categoryId, skillId, n, baseSeed, range }) {
    const out = [];
    for (let i = 0; i < n; i++) {
        let q = null;
        try {
            q = window.generateQuestionFor({ category: categoryId, skill: skillId, range, decimals: 0, seed: baseSeed + i, itemIndex: i });
        } catch (e) { out.push({ error: String((e && e.message) || e) }); continue; }
        if (!q) { out.push({ empty: true }); continue; }
        const text = String(q.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        // An item's identity. Most items are a+b, but a number family, a chart or a picture
        // carries its numbers in the VISUAL and prints the same sentence every time, so falling
        // back to the text alone would call 240 different cells one item.
        let fp;
        if (q.a !== undefined && q.b !== undefined && q.op) {
            fp = `${q.a}${q.op}${q.b}`;
        } else {
            const carrier = `${text} ${String(q.visual || '').replace(/<[^>]+>/g, ' ')} ${JSON.stringify(q.ans === undefined ? '' : q.ans)}`;
            const nums = carrier.match(/\d+/g);
            fp = nums ? `${text.slice(0, 40)}|${nums.join(',')}` : text;
        }
        out.push({
            a: q.a, b: q.b, op: q.op, ans: q.ans, fp,
            fmt: q.printFormat || '(none)', type: q.answerType || '(none)',
            text: text.slice(0, 120),
        });
    }
    return out;
}

// fnv1a: a per-skill seed that depends on the skill id alone, so --skill reproduces the full run
function seedFor(key) {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) % 1000000;
}

// ---------------------------------------------------------------------------
// The rules
// ---------------------------------------------------------------------------
function audit(skill, items) {
    const { skillId: id, label, categoryId } = skill;
    // A category pool ("Mixed Division") deals a random playable sibling from its own category,
    // and those siblings legitimately carry the inverse: Missing Factors and Multiplication Fact
    // Families both live in `division`. So a pool declares the UNION of what its members declare,
    // computed from the pool itself so it cannot rot when a sibling is added or renamed. The
    // teeth stay: an operation NO member can produce is still a failure.
    const ops = declaredOps(id, label, categoryId);
    if (skill.pool) for (const o of skill.pool.ops) ops.add(o);
    const { band, mismatch } = declaredBand(id, label);
    const mixedPage = declaresMixedPage(id, label);
    const factDrill = isFactDrill(id, label);

    const r = {
        n: items.length, errors: 0, empty: 0, withAB: 0, maxBounded: 0,
        declaredOps: [...ops].join(''), band: band ? band.value : null, bandBounds: band ? band.bounds : null,
        seenOps: {}, formats: {}, shapes: {}, types: {},
        overBand: [], textOverBand: 0, zeroOK: 0, ragged: 0, regroupYes: 0, regroupNo: 0, regroupExamples: [],
        eqChecked: 0, eqWrong: 0, eqExamples: [], eqRemainder: 0,
    };
    const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
    const unknownFormats = new Set();

    for (const it of items) {
        if (it.error) { r.errors++; continue; }
        if (it.empty) { r.empty++; continue; }
        bump(r.formats, it.fmt); bump(r.types, it.type);
        const shape = shapeOf(it.fmt);
        if (shape) bump(r.shapes, shape); else unknownFormats.add(it.fmt);

        // Does the cell's own equation balance with the answer it ships? (see equationCheck)
        const eq = equationCheck(it);
        if (eq) {
            r.eqChecked++;
            if (eq.remainder) r.eqRemainder++;
            if (!eq.ok) { r.eqWrong++; if (r.eqExamples.length < 4) r.eqExamples.push(eq.shown); }
        }

        const op = it.op ? norm(it.op) : null;
        const a = Number(it.a), b = Number(it.b);
        const pair = op && Number.isFinite(a) && Number.isFinite(b);
        if (op) bump(r.seenOps, op);

        if (pair) {
            r.withAB++;
            const value = bounded(a, b, op);
            r.maxBounded = Math.max(r.maxBounded, value);
            // A fact-table promise "(1-12)" bounds the TABLE. For x that is both operands; for /
            // it is the divisor and the quotient, because the dividend of a 12-table fact is the
            // product and legitimately reaches 144.
            const measured = !band ? 0
                : band.bounds !== 'operand' ? value
                    : op === '÷' ? Math.max(Math.abs(b), b ? Math.abs(a / b) : Infinity)
                        : Math.max(Math.abs(a), Math.abs(b));
            if (Number.isFinite(measured)) { r.maxMeasured = Math.max(r.maxMeasured || 0, measured); r.minMeasured = Math.min(r.minMeasured === undefined ? Infinity : r.minMeasured, measured); }
            if (band && (measured > band.value || measured < band.min)) {
                if (r.overBand.length < 4) r.overBand.push(`${a} ${op} ${b} = ${op === '÷' ? a / b : op === '−' ? a - b : op === '+' ? a + b : a * b}`);
                r.overBandCount = (r.overBandCount || 0) + 1;
                if (measured < band.min) r.underBandCount = (r.underBandCount || 0) + 1;
            }
            // 0 is a fact of every table. For division only the dividend can be 0.
            if (op === '÷' ? a === 0 : (a === 0 || b === 0)) r.zeroOK++;
            if (String(Math.abs(a)).length !== String(Math.abs(b)).length) r.ragged++;
            const rg = regroups(a, b, op);
            if (rg === true) { r.regroupYes++; if (r.regroupExamples.length < 4 && !promisesRegroup(id, label)) r.regroupExamples.push(`${a} ${op} ${b}`); }
            if (rg === false) { r.regroupNo++; if (r.regroupExamples.length < 4 && promisesRegroup(id, label)) r.regroupExamples.push(`${a} ${op} ${b}`); }
        } else {
            // A word problem or a visual rarely exposes a and b. The owner's ruling still bites:
            // the ANSWER may not leave the band.
            const ans = asNumber(it.ans);
            if (band && band.bounds === 'answer' && ans !== null && (Math.abs(ans) > band.value || Math.abs(ans) < band.min)) {
                if (r.overBand.length < 4) r.overBand.push(`answer ${ans} (${it.text.slice(0, 44)})`);
                r.overBandCount = (r.overBandCount || 0) + 1;
            }
        }
        // Numbers printed in the story are a weaker signal (a year, a page number), so they are
        // only ever a note.
        if (band && band.bounds === 'answer') {
            const nums = (it.text.match(/\d[\d,]*/g) || []).map(s => parseInt(s.replace(/,/g, ''), 10));
            if (nums.some(v => v > band.value)) r.textOverBand++;
        }
    }

    const live = r.n - r.errors - r.empty;
    r.distinct = new Set(items.filter(i => !i.error && !i.empty).map(i => i.fp)).size;

    const fails = [];
    const notes = [];
    const F = (cls, msg) => fails.push({ cls, msg });
    const NOTE = (cls, msg) => notes.push({ cls, msg });

    if (live === 0) F('empty', `generates nothing (${r.errors} threw, ${r.empty} came back empty)`);
    if (r.errors) F('throws', `${r.errors} of ${r.n} generations threw`);

    // The worst defect there is: the printed page and its answer key disagree. Zero tolerance,
    // and it leads the finding list because no other complaint matters if the answer is wrong.
    if (r.eqWrong) F('answer-wrong', `${r.eqWrong} of ${r.eqChecked} checkable equations do not balance with the answer shipped: ${r.eqExamples.join('; ')}`);
    // A bare `A / B = ?` answered with the floor when B does not divide A is FORGIVEN above,
    // because that is how a quotient-and-remainder cell reads. Today every such cell ships the
    // remainder in the answer itself ("59 R 5"), so this never fires; if it starts firing, a
    // generator has begun dropping remainders silently and the owner should see it.
    if (r.eqRemainder) NOTE('answer-floor', `${r.eqRemainder} of ${r.eqChecked} equations answer with the whole-number quotient and drop the remainder`);

    if (r.overBandCount) {
        const operand = band.bounds === 'operand';
        const w = operand ? `a table of ${band.value}`
            : band.min > 0 ? `${band.min}-${band.value}` : `"within ${band.value.toLocaleString('en-US')}"`;
        const biggest = operand ? Math.round(r.maxMeasured || 0) : r.maxBounded;
        const range = band.min > 0 ? `, range seen ${Math.round(r.minMeasured)}-${Math.round(r.maxMeasured)}` : '';
        const under = r.underBandCount ? `, ${r.underBandCount} of them BELOW ${band.min}` : '';
        F('band', `${r.overBandCount} of ${live} items land outside ${w}${under}: ${r.overBand.join(', ')} (largest ${operand ? 'table number' : 'bounded value'} ${biggest.toLocaleString('en-US')}${range})`);
    }

    const stray = Object.keys(r.seenOps).filter(o => !ops.has(o));
    if (stray.length) {
        const list = Object.entries(r.seenOps).map(([k, v]) => `${k} x${v}`).join(', ');
        F('ops', skill.pool
            ? `deals ${stray.join(' and ')}, which no skill in its pool of ${skill.pool.size} can produce (pool declares ${[...ops].join(' ')}; dealt ${list})`
            : `deals ${stray.join(' and ')}, which the name does not promise (name declares ${[...ops].join(' ') || 'nothing'}; dealt ${list})`);
    }
    if (skill.pool) NOTE('mixed-pool', `deliberately mixed: draws from ${skill.pool.size} sibling skills in ${categoryId}, whose names together declare ${[...ops].join(' ')}`);

    if (promisesRegroup(id, label)) {
        if (band && band.bounds === 'answer' && band.min === 0 && band.value <= 10) F('regroup-impossible', `promises regrouping inside a band of ${band.value}: two single digits summing within 10 can never regroup (owner ruling 2 - this skill is bridging ten, sums 11-18)`);
        else if (r.regroupNo) F('regroup-promised', `promises regrouping but ${r.regroupNo} of ${r.regroupYes + r.regroupNo} items do not: ${r.regroupExamples.join(', ')}`);
    }
    if (promisesNoRegroup(id, label) && r.regroupYes) F('regroup-forbidden', `promises no regrouping but ${r.regroupYes} of ${r.regroupYes + r.regroupNo} items regroup: ${r.regroupExamples.join(', ')}`);

    const shapes = Object.keys(r.shapes);
    const groups = [...new Set(shapes.map(s => ARITH.has(s) ? 'arith' : s))];
    const share = s => `${s} ${Math.round(100 * r.shapes[s] / Math.max(1, live))}%`;
    if (groups.length > 1) {
        const msg = `${groups.length} different cell shapes on one page: ${shapes.map(share).join(', ')} (${Object.keys(r.formats).join(', ')})`;
        (mixedPage ? NOTE : F)('cell-shape', mixedPage ? `mixed practice, so ${msg}` : msg);
    }
    if (shapes.includes('column') && shapes.includes('across')) {
        const msg = `writes the same item stacked AND across: ${share('column')}, ${share('across')}`;
        // The teacher ticks notation; a skill that offers the choice may honour several. One
        // that does not offer it is flipping a coin per item, which is the defect the option
        // was introduced to kill.
        (mixedPage || skill.hasNotationOption ? NOTE : F)('notation-mix', msg);
    }
    if (unknownFormats.size) NOTE('unknown-format', `print formats this audit has no cell shape for: ${[...unknownFormats].join(', ')} (add them to SHAPE_OF)`);

    if ((r.types['multiple-choice'] || 0) > 0) F('mc-parity', `${r.types['multiple-choice']} of ${live} items are multiple choice on screen; a written-answer item is never converted to multiple choice (P-29)`);

    // Variety is the one property the NAME cannot settle: "Add within 5 with Pictures" has only
    // about ten legal items and a page of six is bound to repeat, which is the skill, not a bug.
    // So the gate only fails what is unarguable - the generator cannot even fill one page with
    // different items - and everything thinner than half the sample is a note the owner reads.
    if (live >= PAGE && r.distinct < PAGE) F('variety', `only ${r.distinct} distinct items in ${live}: it cannot fill one page of ${PAGE} without repeating`);
    else if (live >= 20 && r.distinct < live * 0.5) NOTE('variety', `${r.distinct} distinct items in ${live}; a page of ${PAGE} is likely to repeat one`);

    // P-AT-5 (PEDAGOGY_STANDARD.md): "Fact ladders introduce one fact set per step (Add 3; the 4
    // times table). A set's pages contain only that set until its cumulative review, which mixes
    // it with earlier sets." It says nothing about zero on its own; what makes zero compulsory is
    // that the constant that names the set runs from 0 (skill-options.js constantOption, owner
    // ruling 4), and the default is every set ticked. So this is a failure for a fact drill left
    // on "Mixed (all of them)" and a note for everything else, where a zero operand is often
    // meaningless (a divisor of 0) or simply not this step's job.
    if (r.withAB >= 20 && r.zeroOK === 0) {
        (factDrill ? F : NOTE)('zero-facts', factDrill
            ? `never deals a zero fact in ${r.withAB} items; the fact constant runs from 0 and every set is ticked by default (owner ruling 4)`
            : `no zero operand in ${r.withAB} items (fine unless this step teaches the zero case)`);
    }
    if (r.withAB >= 20 && r.ragged === 0 && band && band.value >= 100) NOTE('ragged', `operands are always the same length in ${r.withAB} items (no 4-digit + 2-digit)`);
    if (mismatch) NOTE('name-mismatch', mismatch);
    if (r.textOverBand && !r.overBandCount) NOTE('band-text', `${r.textOverBand} of ${live} items print a number above ${band.value.toLocaleString('en-US')} in the story`);

    return { ...r, live, mixedPage, factDrill, fails, notes };
}

// ---------------------------------------------------------------------------
// --self-test: the gate now READS NAMES, so a slipped regex would quietly change every verdict
// without failing anything. These run in a second, with no browser.
// ---------------------------------------------------------------------------
function selfTest() {
    const bad = [];
    let TESTS = 0;
    const eq = (what, got, want) => { TESTS++; if (String(got) !== String(want)) bad.push(`${what}: got ${got}, expected ${want}`); };
    const ops = (id, label, cat) => [...declaredOps(id, label, cat)].sort().join('');
    eq('add_facts ops', ops('add_facts', 'Addition Facts (within 20)', 'addition'), '+');
    eq('mixed_add_sub ops', ops('mixed_add_sub', 'Mixed Addition & Subtraction', 'subtraction'), '+−');
    eq('mixed_mult_div ops', ops('mixed_mult_div', 'Mixed Multiplication & Division', 'division'), '×÷');
    eq('mixed_addition ops', ops('mixed_addition', 'Mixed Addition', 'addition'), '+');
    eq('number_families_add ops', ops('number_families_add', 'Number Families - Easy', 'addition'), '+−');
    eq('mult_div_fact_family ops', ops('mult_div_fact_family', 'Multiplication Fact Families', 'multiplication'), '×÷');
    eq('missing_mult_div ops', ops('missing_mult_div', 'Missing Factors (×/÷)', 'division'), '×÷');
    eq('div_remainders ops', ops('div_remainders', 'Division with Remainders (Visual)', 'division'), '÷');
    eq('mult_chart ops', ops('mult_chart', 'Multiplication Chart (Visual)', 'multiplication'), '×');
    eq('bare id falls back to category', ops('long_div_2digit', 'Box Method', 'division'), '÷');
    // The en dash of a numeric range must not read as a minus sign.
    eq('a range dash is not a minus', ops('add_10_regroup', 'Add — Bridging Ten (sums 11–18)', 'addition'), '+');

    const band = (id, label) => { const b = declaredBand(id, label).band; return b ? `${b.min}-${b.value}/${b.bounds}` : 'none'; };
    eq('add_20_regroup band', band('add_20_regroup', 'Add within 20 (With Regrouping)'), '0-20/answer');
    eq('add_wp_1m band', band('add_wp_1m', 'Addition Word Problems (within 1,000,000)'), '0-1000000/answer');
    eq('mult_facts band', band('mult_facts', 'Multiplication Facts (1-12)'), '0-12/operand');
    eq('add_three band', band('add_three', 'Add Three Numbers (≤20)'), '0-20/answer');
    eq('add_sub_10s has no band', band('add_sub_10s', 'Add & Subtract by 10s'), 'none');
    eq('add_sub_100s has no band', band('add_sub_100s', 'Add & Subtract by 100s'), 'none');
    eq('mult_chart_hard has no band', band('mult_chart_hard', 'Multiplication Chart - Hard (22 missing)'), 'none');
    // Owner ruling 2: once the label says bridging, the 10 frozen into the id is not the band.
    eq('bridging voids the id band', band('add_10_regroup', 'Add bridging 10 (sums 11–18)'), '11-18/answer');
    eq('a floor-and-ceiling label keeps its floor', band('sub_10_regroup', 'Subtract bridging 10 (minuends 11 to 18)'), '11-18/answer');
    eq('"sums to 18" is a ceiling only', band('add_10_regroup', 'Add bridging ten (sums to 18)'), '0-18/answer');
    eq('unrenamed add_10_regroup still reads as 10', band('add_10_regroup', 'Add within 10 (With Regrouping)'), '0-10/answer');
    // The titles the twins agent is giving the two bridging skills, exactly as written.
    eq('bridging add, em dash title', band('add_10_regroup', 'Add — Bridging Ten (sums 11–18)'), '11-18/answer');
    eq('bridging sub, em dash title', band('sub_10_regroup', 'Subtract — Bridging Ten (minuends 11–18)'), '11-18/answer');
    eq('bridging with a plain hyphen', band('add_10_regroup', 'Add - Bridging Ten (sums 11-18)'), '11-18/answer');
    eq('within N is untouched by the floor work', band('add_50_mixed', 'Add within 50'), '0-50/answer');

    eq('mixed_addition is a mixed page', declaresMixedPage('mixed_addition', 'Mixed Addition'), 'true');
    eq('add_10_mixed is NOT a mixed page', declaresMixedPage('add_10_mixed', 'Add within 10'), 'false');
    eq('fact drill: add_facts', isFactDrill('add_facts', 'Addition Facts (within 20)'), 'true');
    eq('fact drill: not add_sub_fact_family', isFactDrill('add_sub_fact_family', 'Addition Fact Families'), 'false');

    eq('190+120 regroups in the tens', regroups(190, 120, '+'), 'true');
    eq('23+45 does not regroup', regroups(23, 45, '+'), 'false');
    eq('300-124 borrows', regroups(300, 124, '−'), 'true');
    eq('89-23 does not borrow', regroups(89, 23, '−'), 'false');
    eq('bounded(-) is the minuend', bounded(95, 7, '−'), 95);
    eq('bounded(/) is the dividend', bounded(96, 8, '÷'), 96);
    eq('bounded(x) is the product', bounded(9, 8, '×'), 72);

    // The answer-key rule. The false-positive cases matter as much as the true positives: a rule
    // that cried wolf on `? + 9 = 16` would have been switched off within a day.
    const ec = (text, ans) => { const v = equationCheck({ text, ans }); return v === null ? 'skip' : v.ok ? 'ok' : 'WRONG'; };
    eq('right answer in the result slot', ec('3 + 8 = ?', 11), 'ok');
    eq('off-by-one in the result slot', ec('3 + 8 = ?', 12), 'WRONG');
    eq('a sum that is plainly wrong', ec('9 + 9 = ?', 19), 'WRONG');
    eq('missing FIRST addend', ec('? + 9 = 16', 7), 'ok');
    eq('missing first addend, wrong', ec('? + 9 = 16', 8), 'WRONG');
    eq('missing SECOND addend', ec('5 + ? = 8', 3), 'ok');
    eq('missing subtrahend', ec('12 − ? = 11', 1), 'ok');
    eq('missing minuend', ec('? − 10 = 8', 18), 'ok');
    eq('missing divisor', ec('20 ÷ ___ = 4', 5), 'ok');
    eq('missing divisor, wrong', ec('20 ÷ ___ = 4', 4), 'WRONG');
    eq('missing dividend', ec('? ÷ 9 = 7', 63), 'ok');
    eq('missing factor', ec('___ × 4 = 12', 3), 'ok');
    eq('exact quotient', ec('56 ÷ 7 = ?', 8), 'ok');
    // A quotient-and-remainder cell prints the whole-number quotient: 477 = 8x59 + 5.
    eq('quotient with a remainder', ec('477 ÷ 8 = ?', 59), 'ok');
    eq('a quotient rounded the WRONG way', ec('477 ÷ 8 = ?', 60), 'WRONG');
    // Floor is only forgiven in the result slot; a missing divisor must divide exactly.
    eq('floor is not forgiven in an operand slot', ec('477 ÷ ? = 59', 8), 'WRONG');
    eq('a word problem is not checkable', ec('Sofia had 79 cookies. She got 9 more.', 88), 'skip');
    eq('two blanks is not checkable', ec('? + ? = 10', 4), 'skip');
    eq('a non-numeric answer is skipped', ec('3 + 8 = ?', '3/4'), 'skip');
    eq('a comma-grouped sum', ec('1,200 + 1,300 = ?', 2500), 'ok');
    eq('subtraction across the ten', ec('15 − 6 = ?', 9), 'ok');
    eq('a product', ec('7 × 6 = ?', 42), 'ok');
    eq('a wrong product', ec('7 × 6 = ?', 48), 'WRONG');

    if (bad.length) { console.error(`ws-content-audit: FAIL - ${bad.length} self-test(s)`); bad.forEach(b => console.error('  - ' + b)); process.exit(1); }
    console.log(`ws-content-audit: OK (self-test, ${TESTS} name-reading assertions)`);
}

// ---------------------------------------------------------------------------
(async () => {
    if (has('self-test')) return selfTest();
    const app = await open({ seed: 4242 });
    await hideOverlays(app.page);
    let skills = (await listSkills(app.page)).filter(s => CATS.includes(s.categoryId));
    if (ONLY_CAT) skills = skills.filter(s => s.categoryId === ONLY_CAT);
    if (ONLY_SKILL) skills = skills.filter(s => s.skillId === ONLY_SKILL);
    if (!skills.length) { console.error(`ws-content-audit: FAIL - no skill matched ${ONLY_CAT || ''} ${ONLY_SKILL || ''}`.trim()); await app.close(); process.exit(1); }

    // Which skills let the teacher tick a notation, so stacked+across on one page is a choice
    // and not a coin flip. skill-options.js imports nothing, so it loads straight into node.
    // Importing it as `.js` makes node print a MODULE_TYPELESS_PACKAGE_JSON warning stamped with
    // the process id, and two runs of the same tree then differ on paper. Reading it through a
    // throwaway `.mjs` copy keeps the gate's whole output diffable, which is the point of the
    // deterministic sampling below. The copy is made fresh each run, so it cannot drift.
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-audit-'));
    const mjs = path.join(tmp, 'skill-options.mjs');
    fs.writeFileSync(mjs, fs.readFileSync(path.join(ROOT, 'js', 'modules', 'skill-options.js')));
    const { optionsFor } = await import(pathToFileURL(mjs).href);
    fs.rmSync(tmp, { recursive: true, force: true });
    const withNotation = new Set(skills
        .filter(s => optionsFor(s.categoryId, s.skillId).some(o => o.id === 'notation'))
        .map(s => `${s.categoryId}:${s.skillId}`));

    // The pool a category-level mixed skill deals from. generate-question.js builds it as
    // getSkillsForCategory(cat) - every entry of SKILLS[cat] that is not itself a meta skill -
    // so it is read back the same way, from the app's own isMixedMetaSkill.
    const pools = await app.page.evaluate(() => {
        const out = {};
        for (const [cat, list] of Object.entries(window.SKILLS)) {
            if (!Array.isArray(list)) continue;
            const playable = list.filter(x => !window.isMixedMetaSkill(x.v)).map(x => ({ v: x.v, l: x.l }));
            for (const s of list) if (/^mixed[_ ]/.test(s.v) && playable.length) out[`${cat}:${s.v}`] = playable;
        }
        return out;
    });

    const out = [];
    for (const s of skills) {
        const members = declaresMixedPage(s.skillId, s.label) ? pools[`${s.categoryId}:${s.skillId}`] : null;
        const pool = members ? {
            size: members.length,
            ops: new Set(members.flatMap(m => [...declaredOps(m.v, m.l, s.categoryId)])),
        } : null;
        const skill = { ...s, pool, hasNotationOption: withNotation.has(`${s.categoryId}:${s.skillId}`) };
        const items = await app.page.evaluate(sampleInPage, {
            categoryId: s.categoryId, skillId: s.skillId, n: N, baseSeed: seedFor(`${s.categoryId}:${s.skillId}`), range: 100,
        });
        out.push({ ...skill, ...audit(skill, items) });
    }
    await app.close();

    for (const s of out) {
        const tag = s.fails.length ? 'FAIL' : s.notes.length ? 'note' : ' ok ';
        const kind = s.pool ? '  [mixed pool]' : '';
        const lines = [...s.fails.map(f => `       - [${f.cls}] ${f.msg}`), ...s.notes.map(n => `       . [${n.cls}] ${n.msg}`)];
        console.log(`${tag} ${s.categoryId}/${s.skillId}  "${s.label}"${kind}${lines.length ? '\n' + lines.join('\n') : ''}`);
    }

    const bad = out.filter(s => s.fails.length);
    const mixed = out.filter(s => s.pool);
    const tally = (list) => {
        const t = {};
        for (const s of out) for (const f of s[list]) t[f.cls] = (t[f.cls] || 0) + 1;
        return Object.entries(t).sort((a, b) => b[1] - a[1]);
    };
    console.log('\nFailures by class:');
    for (const [k, v] of tally('fails')) console.log(`  ${String(v).padStart(4)}  ${k}`);
    if (!bad.length) console.log('     0  (none)');
    console.log('\nNotes by class:');
    for (const [k, v] of tally('notes')) console.log(`  ${String(v).padStart(4)}  ${k}`);

    if (JSON_OUT) { fs.writeFileSync(path.resolve(ROOT, JSON_OUT), JSON.stringify(out, null, 1)); console.log('wrote', JSON_OUT); }

    const scope = [ONLY_CAT, ONLY_SKILL].filter(Boolean).join('/') || 'operations';
    const noteCount = out.reduce((n, s) => n + s.notes.length, 0);
    // "lying about itself" vs "legitimately mixed": a failing skill contradicts its own name; a
    // mixed pool is held to the union of its pool's names and is counted separately, so the
    // owner can see at a glance that the mixed pools are not what is failing.
    const badMixed = bad.filter(s => s.pool).length;
    const summary = `${out.length} ${scope} skills, ${N} items each, Max Number 100`;
    const split = `${bad.length - badMixed} contradict their own name, ${badMixed} of ${mixed.length} mixed pools deal outside their pool`;
    if (bad.length && !has('report-only')) {
        console.error(`\nws-content-audit: FAIL - ${bad.length} of ${summary} (${split}; ${noteCount} notes)`);
        process.exit(1);
    }
    // --report-only still exits 0, but it never says OK when something failed: a line the owner
    // can misread as a pass is worse than no line at all.
    console.log(bad.length
        ? `\nws-content-audit: WOULD FAIL - ${bad.length} of ${summary} (${split}; ${noteCount} notes) [report-only, exit 0]`
        : `\nws-content-audit: OK (${summary}, 0 failing, ${mixed.length} mixed pools held to their pool union, ${noteCount} notes)${has('report-only') ? ' [report-only]' : ''}`);
})().catch(e => { console.error('ws-content-audit: FAIL -', e && e.stack || e); process.exit(1); });
