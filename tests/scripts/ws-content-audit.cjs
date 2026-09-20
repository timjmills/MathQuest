// Content gate: does a skill generate what its own NAME promises?
//
// The owner's page holds SIX items. One item outside the band is a sixth of the lesson, so this
// runs as a gate, not a report: any skill with a failing class exits non-zero.
//
//   node tests/scripts/ws-content-audit.cjs                       # every audited skill
//   node tests/scripts/ws-content-audit.cjs --family operations    # + - x / only
//   node tests/scripts/ws-content-audit.cjs --family k2            # counting & cardinality only
//   node tests/scripts/ws-content-audit.cjs --category addition    # one category
//   node tests/scripts/ws-content-audit.cjs --category composing   # ...including a K-2 one
//   node tests/scripts/ws-content-audit.cjs --skill add_20_regroup # one skill
//   node tests/scripts/ws-content-audit.cjs --n 600 --json out.json
//   node tests/scripts/ws-content-audit.cjs --report-only          # print, always exit 0
//
// TWO FAMILIES, ONE GATE. It was written for + - x /, whose core checks assume an operation, two
// operands and an answer. P6 added the K-2 number-sense family, which mostly has none of those:
// "count the objects" has no operands, a ten frame has no operation, and "which group has more"
// answers with a word. Running the arithmetic rules over that family unchanged would have passed
// all 26 skills vacuously, so the K-2 family is judged by rules of its own (see "The K-2 family"
// below) and the arithmetic rules that cannot mean anything there are switched off by family
// rather than left to return an empty true. Nothing in the K-2 section can change an operations
// verdict: every K-2 rule is gated on family === 'k2'.
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
const ONLY_FAMILY = arg('family', null);
const JSON_OUT = arg('json', null);
const OPS_CATS = ['addition', 'subtraction', 'multiplication', 'division'];
// Counting & Cardinality, the owner's youngest and most vulnerable pupils. `counting_mixed` holds
// the one domain-wide pool skill.
const K2_CATS = ['counting', 'comparing', 'composing', 'counting_mixed'];
const CATS = [...OPS_CATS, ...K2_CATS];
const familyOf = cat => (OPS_CATS.includes(cat) ? 'operations' : 'k2');
const FAMILY_CATS = { operations: OPS_CATS, k2: K2_CATS };

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

// ===========================================================================
// THE K-2 FAMILY: counting, comparing, composing
// ===========================================================================
// WHAT A K-2 NAME DECLARES, and what of that is provable.
//
// "Count Objects (1-20)" is the same kind of promise as "Add within 20": a BAND. It is the most
// valuable check in this family for exactly the reason the operations band is — a page of six
// where one cell draws 34 objects is a sixth of the lesson spent on something the teacher did not
// choose, and the pupil who cannot yet read the title has no way to tell.
//
// The rest of a K-2 name declares a REPRESENTATION rather than an operation: a ten frame, two ten
// frames, base-10 blocks, a hundreds chart, rods of ten. A representation has an arithmetic of its
// own and it is checkable without any notion of operands: a ten frame holds ten, a hundreds chart
// is a hundred cells, a rod is ten. Those are the checks below.
//
// Three candidate checks were considered and are NOT here, with the reason, so nobody re-adds them
// thinking they were forgotten:
//   * "the number of objects drawn equals the answer" as a GENERAL rule. It is only provable where
//     the cell draws everything it asks about. Measured over 120 items each: it holds 98/98 on
//     count_objects and 62/98 on classify_count, because "How many are Vehicles?" asks for a
//     SUBSET of what is drawn and counting the whole picture is the wrong number. So the rule is
//     scoped to the count-everything wording (COUNT_ALL_WORDING) and classify_count is reported as
//     not-checked rather than passed on a coin flip.
//   * an operation check. K-2 items carry no q.op, so declaredOps() would read nothing from the
//     name, see nothing dealt, and pass every skill while asserting nothing.
//   * regrouping. `base10_regroup` matches the operations promisesRegroup() regex on its id, and
//     would then be judged by a rule about carrying in a column sum. Gated off by family.

// The band a K-2 name promises, and the NUMBER it bounds. Unlike the operations band this is not
// "the answer": the answer to "how many more to make 10?" is the part, not the ten. It is the
// largest number the CELL SHOWS THE PUPIL — see k2Quantity() for why that is the honest reading.
function k2Band(id, label) {
    const L = String(label);
    const hay = `${String(id).replace(/_/g, ' ')} ${L}`;
    const num = s => parseInt(String(s).replace(/,/g, ''), 10);
    // "(1-20)" on a counting skill is the COUNT range, not the fact table the same punctuation
    // means on "Multiplication Facts (1-12)". That is why this reader is K-2 only.
    const par = L.match(/\(\s*([\d,]+)\s*(?:[-–—]|to)\s*([\d,]+)\s*\)/);
    if (par) return { min: num(par[1]), value: num(par[2]), from: `the range "${par[0]}" in the name` };
    // A teen number is 11 to 19. Twenty is not a teen, and a skill called "Build a Teen Number"
    // that deals 20 is teaching the one number the name excludes.
    if (/\bteens?\b/i.test(hay)) return { min: 11, value: 19, from: '"teen" (11-19)' };
    if (/\b(?:3|three)[-\s]?digit\b/i.test(hay)) return { min: 100, value: 999, from: '"3-digit"' };
    if (/\b(?:2|two)[-\s]?digit\b/i.test(hay)) return { min: 10, value: 99, from: '"2-digit"' };
    if (/hundreds chart/i.test(L)) return { min: 1, value: 100, from: '"Hundreds Chart"' };
    const w = L.match(/\bwithin\s+([\d,]+)/i) || L.match(/\bup to\s+([\d,]+)/i);
    if (w) return { min: 0, value: num(w[1]), from: `"within ${w[1]}"` };
    // "Make 10" — the whole being made is the ceiling.
    const mk = L.match(/^make\s+(?:a\s+)?([\d,]+)\b/i);
    if (mk) return { min: 0, value: num(mk[1]), from: `"Make ${mk[1]}"` };
    return null;
}

// THE NUMBER A K-2 BAND BOUNDS is the largest number the cell puts in front of the pupil.
//
// The obvious candidates both fail, and it is worth saying why, because both were tried:
//   * the ANSWER alone. "Teen Numbers: 10 + Ones" writes "10 + ___ = 13" and answers 3. Three is
//     not a teen, and a band of 11-19 read against the answer calls a perfectly good cell broken.
//   * every number in the TEXT. The same skill writes "What is 10 + 7?", and the 10 is below the
//     floor of 11 for the same reason — it is a part, not the teen.
// The largest number survives both: the teen cell's largest number IS the teen (13, 17), the
// counting cell's largest is the count, the 3-digit build's largest is the number built. It
// catches everything the band exists to catch — a count above the ceiling, a "teen" of 20, a
// 3-digit build that deals 87 — and it cannot be fooled by a decomposition, because a part is by
// definition smaller than the whole it is part of.
//
// The visual is deliberately NOT read. The rods picture prints "80" beside eight rods and the
// hundreds chart prints all hundred numbers; both are the representation talking, not the item.
const K2_QUANTITY_KEYS = ['target', 'ans'];
function k2Quantity(it) {
    const seen = [];
    const wording = `${it.text || ''} ${it.printText || ''}`;
    for (const m of wording.matchAll(/\d[\d,]*/g)) {
        const v = parseInt(m[0].replace(/,/g, ''), 10);
        if (Number.isFinite(v)) seen.push(v);
    }
    for (const k of K2_QUANTITY_KEYS) {
        const v = asNumber(it[k]);
        if (v !== null) seen.push(Math.abs(v));
    }
    if (it.chartTarget !== undefined && it.chartTarget !== null) seen.push(Math.abs(it.chartTarget));
    return seen.length ? Math.max(...seen) : null;
}

// The count-everything wording. Only here is "objects drawn === answer" provable: the cell asks
// for the whole picture, so the whole picture is the answer.
//
// This started life as an ALLOW-list of phrasings ("are there", "do you see", "altogether"),
// written off the wordings the app was shipping that morning. By the afternoon count_objects had
// been reworded from "How many hearts are there? Count them!" to "How many hearts?" and the rule
// had stopped matching a single item — not failing, just silently no longer applying, which is
// the exact shape of the bug P6 exists to stop. An allow-list of wordings is a list of the ways a
// question has been asked so far, and a generator is free to invent another one tomorrow.
//
// So it is a DENY-list instead, over the two readings that are genuinely not the whole picture:
//   "How many ARE Vehicles?"      - a subset of what is drawn
//   "How many MORE to make 10?"   - a difference, not a count
// Anything else that asks how many is asking about everything in front of the pupil. A new
// phrasing now arrives inside the rule rather than outside it, and k2Rules() additionally raises
// a not-checked note if a skill whose NAME says counting never matched at all, so this can never
// go quiet again without saying so.
const COUNT_ALL_WORDING = /\bhow many\b(?!\s+(?:are|more|less|fewer|other)\b)/i;

// Wording that only means something on a screen. A printed cell that says "drag counters from the
// palette" is asking a pupil holding a pencil to do something the paper cannot do. A skill that
// ships a `printText` has already answered this, so only the fallback wording is read.
const SCREEN_ONLY_WORDING = /\b(?:drag|click|tap|drop|button|palette|press)\b/i;

// A printed cell running to 50 words is a defect (owner, P6). A word problem legitimately tells a
// story, so the limit is generous: this is the "the instruction has been copied into the cell"
// tripwire (BD-10), not a style preference.
const MAX_CELL_WORDS = 50;
const wordsIn = s => String(s || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

// THE 12-WORD CAP, AND WHY IT IS NOT THE SAME NUMBER IN BOTH FAMILIES.
//
// BD-10 and P-LG-1 cap an INSTRUCTION at 12 words. An instruction is not the same thing as a
// cell: BD-10 also says the instruction "is never inside a cell", because it sits in the
// instruction block above the section. A word problem's cell holds a STORY, which is capped
// somewhere else entirely and by the sentence rather than by the cell (P-WP-18: 8 words at
// Levels K-1, 10 at 2-3, 12 at 4-6).
//
// Measured before it was written, over all 189 audited skills: 56 skills print a cell of more
// than 12 words and every one of them is an operations word problem ("There are 5 apples in the
// fruit basket. Layla adds 92 more. How many apples are there in all?" — 19 words, and correct).
// Not one K-2 cell exceeds 12, because every K-2 cell IS a bare instruction: "Count. Write how
// many.", "Write how many tens.", "Draw 16 counters in the ten frames."
//
// So the cap is applied where it is the right rule and not where it is the wrong one. Reading
// the story cap off a whole cell would have failed 56 healthy operations skills, which is the
// mistake this file keeps warning about in the other direction.
const MAX_K2_INSTRUCTION_WORDS = 12;

// BD-12 and BD-17: words that may never appear in something a pupil reads on PAPER.
//   * the screen verbs (BD-12). A printed cell that says "Click ALL the ODD numbers" is asking a
//     pupil holding a pencil to do something the paper cannot do. This is the same defect the
//     `screen-wording` note describes, but it is the PRINTED string that is judged, so a skill
//     cannot escape it by shipping a printText that still says "click".
//   * the composed-language verbs (BD-12 / P-LG-4): explain, describe, justify, discuss, prove.
//   * "Tick" (BD-17, owner ruling 2026-09-19): `Check` replaces `Tick` everywhere a pupil reads.
// BD-17 keeps "tick" for the marks on a scale, a ruler, a clock or a number line, so that sense
// is excluded rather than the rule being dropped — "clicking the correct tick mark" on
// fraction_number_line is a number line's tick and not the banned verb.
// `select`, `press` and `highlight` are screen actions a pencil cannot perform, and the failure
// message already promised them. `choose` and `enter` are deliberately NOT banned: both occur
// innocently in a word-problem story ("Ben chooses 4 marbles", "12 pupils enter the hall"),
// and a gate that fires on a legitimate story teaches people to ignore it.
const PRINT_BANNED = /\b(?:tap|taps|tapped|click|clicks|clicked|clicking|type|types|typed|drag|drags|dragged|swipe|swipes|scroll|scrolls|hover|hovers|select|selects|selected|selecting|press|presses|pressed|pressing|highlight|highlights|highlighted|highlighting|explain|describe|justify|discuss|prove)\b/i;
const PRINT_TICK = /\btick(?:s|ed|ing)?\b/i;
const TICK_MARK = /\btick(?:s)?[-\s]?mark/i;
function bannedPrintWords(printed) {
    const s = String(printed || '');
    const hits = [];
    for (const m of s.matchAll(new RegExp(PRINT_BANNED.source, 'gi'))) hits.push(m[0].toLowerCase());
    // "tick mark" is a number line's tick, which BD-17 keeps; "Tick the box" is the banned verb.
    if (PRINT_TICK.test(s) && !TICK_MARK.test(s)) hits.push('tick');
    return [...new Set(hits)];
}

// The capacity a representation's NAME promises, in cells. "a Ten Frame" is ten; "Two Ten Frames"
// is twenty. Returns null when the name does not name a frame, and the payload is then only
// checked for internal consistency.
function framesPromised(id, label) {
    const hay = `${String(id).replace(/_/g, ' ')} ${label}`.toLowerCase();
    if (!/ten[-\s]?frames?/.test(hay)) return null;
    if (/\b(?:two|2|double)\b[^.]{0,20}ten[-\s]?frames?/.test(hay) || /ten[-\s]?frames\b/.test(hay)) return 20;
    return 10;
}

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

// The K-2 cell shapes. The table above cannot be reused: it maps '(none)' to 'across', which is
// right for a bare `7 + 8 = __` and wrong for every picture cell in this family — half the K-2
// items carry no printFormat at all and would all have been called the same shape, which is how a
// cell-shape rule passes a page that changes kind halfway down.
//
// So a K-2 item with no printFormat is classified by what the pupil DOES with it (the answer
// type), which is what actually differs: "How many hearts?" (write a number under a picture) and
// "Click ALL groups that show 7" (pick several from a row of pictures) are two different cells,
// and a page of six holding both is the defect this rule is for.
const K2_SHAPE_OF = {
    tenframe: ['ten-frame', 'ten-frame-build'],
    base10: ['base10-build'],
    chart: ['hundreds-chart-fill'],
    grid: ['grid-fill'],
    rods: ['tens-foundation'],
    select: ['multi-select'],
    oddeven: ['odd-even'],
    numberline: ['fraction-number-line'],
    tiles: ['compose-fraction-tiles'],
};
const K2_FORMAT_SHAPE = new Map();
for (const [shape, fmts] of Object.entries(K2_SHAPE_OF)) for (const f of fmts) K2_FORMAT_SHAPE.set(f, shape);
function k2ShapeOf(it) {
    const known = K2_FORMAT_SHAPE.get(it.fmt);
    if (known) return known;
    if (it.fmt !== '(none)') return null;               // an unclassified format: reported, not guessed
    return `${it.hasVisual ? 'picture' : 'plain'}:${it.type}`;
}
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
function sampleInPage({ categoryId, skillId, n, baseSeed, range, k2 }) {
    // What a K-2 cell carries INSTEAD of a and b. These are the fields the generators already
    // publish so the renderers can draw the representation, and they are exactly what the
    // representation rules need, so the audit reads the item's own declaration rather than
    // guessing from its picture.
    const PAYLOAD = ['target', 'maxDots', 'initialDots', 'maxPlace', 'allowRegroup', 'targetNum', 'targetDen'];

    // MEASURE THE PICTURE IN THE PAGE, NOT IN NODE. A hundreds chart is 27 kB of SVG; 240 of them
    // per skill is 6.5 MB crossing the bridge for facts that are a dozen integers. Everything the
    // rules need is counted here and only the counts are shipped.
    function measure(vis, ans) {
        if (!vis) return null;
        // NOTHING HERE MAY DEPEND ON HOW THE PICTURE IS DRAWN. The first version of this counted
        // base-10 rods by looking for `height:52px` and counted a hundreds chart's blank by
        // looking for a "?" in a <text>. Both were measured off the live app and both were wrong
        // within the hour, because the family was being repainted black-and-white in Andika at
        // the same time: the rods became outlined <rect>s with no inline height and the chart's
        // blank cell stopped carrying a <text> at all. Every rule that reads this object is
        // therefore built on counts of SVG primitives and on the numerals actually printed -
        // things a restyle does not move - and a rule that cannot be stated that way is reported
        // as not-checked instead of guessed at.
        const tally = {};
        for (const m of vis.matchAll(/<(path|polygon|circle|rect|ellipse|line|image|use)\b/g)) tally[m[1]] = (tally[m[1]] || 0) + 1;
        const emoji = (vis.match(/\p{Extended_Pictographic}/gu) || []).length;
        if (emoji) tally.emoji = emoji;
        // The numerals the picture prints, whatever element carries them.
        const texts = [...vis.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m => m[1].trim());
        const nums = texts.filter(s => /^\d+$/.test(s)).map(Number);
        // fnv1a over the whole drawing: the item's identity for the variety rule. See the
        // fingerprint below for why nothing shorter than the whole picture survived contact.
        let h = 2166136261;
        for (let i = 0; i < vis.length; i++) { h ^= vis.charCodeAt(i); h = Math.imul(h, 16777619); }
        const out = { tally, textCells: texts.length, numerals: nums.length, len: vis.length, hash: (h >>> 0).toString(36) };
        // A GRID OF NUMERALS WITH GAPS IN IT — a hundreds chart, a number track, a fill-the-run
        // grid. The invariant is the RUN, not the cells: whatever the blank looks like, the
        // numbers printed run from lo to hi and the ones missing from that run are the ones the
        // pupil writes. That holds whether the empty cell carries a "?", an underscore or
        // nothing at all.
        if (nums.length >= 20) {
            const lo = Math.min(...nums), hi = Math.max(...nums);
            const have = new Set(nums);
            const missing = [];
            for (let v = lo; v <= hi && missing.length < 12; v++) if (!have.has(v)) missing.push(v);
            out.grid = { lo, hi, span: hi - lo + 1, missing, ansPrinted: ans !== null && have.has(ans) };
        }
        return out;
    }

    const out = [];
    for (let i = 0; i < n; i++) {
        let q = null;
        try {
            q = window.generateQuestionFor({ category: categoryId, skill: skillId, range, decimals: 0, seed: baseSeed + i, itemIndex: i });
        } catch (e) { out.push({ error: String((e && e.message) || e) }); continue; }
        if (!q) { out.push({ empty: true }); continue; }
        const text = String(q.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const printText = q.printText ? String(q.printText).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
        // The K-2 payload, as a stable string. It is BOTH a rule input and part of the item's
        // identity below: a drag-a-tile cell prints the same sentence and the same answer every
        // time, and its whole variation lives here.
        const vis = k2 ? measure(String(q.visual || ''), typeof q.ans === 'number' ? q.ans : null) : null;
        let payload = '';
        if (k2) {
            const bits = [];
            for (const key of PAYLOAD) if (q[key] !== undefined && q[key] !== null) bits.push(`${key}=${JSON.stringify(q[key])}`);
            if (q.places) bits.push(`places=${JSON.stringify(q.places)}`);
            if (q.tensData) bits.push(`tens=${JSON.stringify(q.tensData)}`);
            if (q.chartData) bits.push(`chart=${JSON.stringify(q.chartData)}`);
            if (q.gridFill) bits.push(`grid=${JSON.stringify(q.gridFill).slice(0, 200)}`);
            if (Array.isArray(q.palette)) bits.push(`palette=${JSON.stringify(q.palette).slice(0, 160)}`);
            payload = bits.join(' ');
        }
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
            // ...and where even that is constant — "Drag fraction tiles into the bar to make 1
            // whole", answered "1 whole", over a picture that never changes — the payload is the
            // only thing that varies, or fails to. Appended only when there IS a payload, so an
            // operations fingerprint is byte-identical to what it was before P6.
            if (payload) fp += `#${payload}`;
            // A K-2 PICTURE CELL IS THE ITEM, so the picture is its identity.
            //
            // This one was got wrong twice, and both wrong answers failed a healthy generator
            // rather than passing a broken one, which is the dangerous direction for a rule whose
            // job is to catch repetition:
            //   * text and digits alone. "Which group has MORE?" draws six circles beside nine
            //     squares and prints no number at all; stripping the tags off an SVG leaves an
            //     empty string. 240 varied items fingerprinted as THREE.
            //   * text plus the count of each SVG primitive. That fixed compare_groups, whose
            //     groups differ in how MANY shapes they hold, and still failed compare_objects,
            //     whose two bars differ in how LONG they are: two rects every time, so 240 items
            //     again fingerprinted as three.
            // Both attempts were summarising the drawing, and each summary threw away exactly the
            // dimension the next skill varied in. The definition that needs no summary is the
            // plain one: two cells are the same cell when the pupil would see the same thing. So
            // the whole visual is hashed.
            //
            // The residual risk runs the safe way. Cosmetic jitter would make identical cells
            // look distinct and turn a failure into silence — bad, but a quieter kind of bad than
            // failing a generator that is working; and the constant case that must keep failing
            // still does, because a picture that never changes hashes the same every time
            // (compose_whole: one distinct item in 240, and it stays one).
            if (vis) fp += `@${vis.hash}`;
        }
        const item = {
            a: q.a, b: q.b, op: q.op, ans: q.ans, fp,
            fmt: q.printFormat || '(none)', type: q.answerType || '(none)',
            text: text.slice(0, 120),
        };
        if (!k2) { out.push(item); continue; }

        item.printText = printText.slice(0, 200);
        item.fullText = text;                        // the band reads the whole wording, not a prefix
        item.hasVisual = !!q.visual;
        item.payload = payload;
        for (const key of PAYLOAD) if (q[key] !== undefined) item[key] = q[key];
        if (Array.isArray(q.places)) item.places = q.places;
        if (q.tensData && typeof q.tensData === 'object') item.rodsDeclared = q.tensData.rods;
        if (q.chartData && typeof q.chartData === 'object') item.chartTarget = q.chartData.target;
        if (Array.isArray(q.palette)) item.paletteLen = q.palette.length;
        item.vis = vis;
        // Are the options the pupil picks from NUMBERS, or labels from a bank? A number turned
        // into a button is a production item converted to multiple choice (P-29); "Group A /
        // Group B" is a label from a bank, which is a response the owner's rules allow.
        if (Array.isArray(q.options) && q.options.length) {
            const labels = q.options.map(o => String(o && typeof o === 'object' ? (o.label !== undefined ? o.label : '') : o).trim());
            item.optCount = labels.length;
            item.optNumeric = labels.every(s => s !== '' && /^-?\d+(?:[.,]\d+)?$/.test(s));
        }
        out.push(item);
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
// ---------------------------------------------------------------------------
// The K-2 rules
// ---------------------------------------------------------------------------
// Every one of these reports only what it can PROVE from the item's own declaration, and every
// one keeps a tally of the items it could not reach. That tally is not cosmetic: rule (2) of P6
// is that a check which cannot apply must SAY SO rather than return quietly true, because a gate
// that passes everything it does not understand is how 421 skills stayed unaudited. So each rule
// ends by pushing either a failure or a not-checked note, never nothing.
function k2Rules(skill, items, live, r, F, NOTE) {
    const { skillId: id, label } = skill;
    const band = k2Band(id, label);
    const frames = framesPromised(id, label);
    r.k2Band = band ? `${band.min}-${band.value}` : null;

    // -- the count band -----------------------------------------------------
    if (!band) {
        NOTE('not-checked', 'no count band: the name promises no range of numbers, so nothing bounds what this skill may deal');
    } else {
        const out = [];
        let checked = 0, unreadable = 0;
        for (const it of items) {
            if (it.error || it.empty) continue;
            const q = k2Quantity(it);
            if (q === null) { unreadable++; continue; }
            checked++;
            r.k2Max = Math.max(r.k2Max || 0, q);
            r.k2Min = Math.min(r.k2Min === undefined ? Infinity : r.k2Min, q);
            if (q > band.value || q < band.min) {
                if (out.length < 4) out.push(`${q} ("${(it.fullText || it.text || '').slice(0, 50)}")`);
                r.k2OverBand = (r.k2OverBand || 0) + 1;
            }
        }
        r.k2BandChecked = checked;
        if (r.k2OverBand) {
            F('k2-band', `${r.k2OverBand} of ${checked} items show a number outside ${band.min}-${band.value}, which is what ${band.from} promises: ${out.join(', ')} (largest seen ${r.k2Max}, smallest ${r.k2Min})`);
        }
        if (!checked) NOTE('not-checked', `count band ${band.min}-${band.value} from ${band.from}: no item put a readable number in its wording, its target or its answer, so the band was never tested`);
        else if (unreadable) NOTE('band-unreadable', `${unreadable} of ${live} items carry no readable number, so the ${band.min}-${band.value} band could not be checked on them`);
    }

    // -- the representations ------------------------------------------------
    // A ten frame. Ten cells, or twenty on a pair of them; never eleven dots in ten boxes. The
    // frame itself is a STRUCTURAL scaffold (WORKSHEET_DESIGN_STANDARD), so its capacity is a
    // property of the cell and not of the item's difficulty.
    let frameItems = 0;
    const frameBad = [];
    for (const it of items) {
        if (it.error || it.empty || it.maxDots === undefined) continue;
        frameItems++;
        const cap = Number(it.maxDots);
        const shown = asNumber(it.target !== undefined ? it.target : it.ans);
        const start = asNumber(it.initialDots);
        const why = !Number.isFinite(cap) || cap <= 0 || cap % 10 !== 0
            ? `a frame of ${it.maxDots} cells is not a whole number of tens`
            : (frames !== null && cap !== frames)
                ? `the name promises ${frames} cells but the frame holds ${cap}`
                : (shown !== null && (shown > cap || shown < 0))
                    ? `${shown} counters in a frame of ${cap} cells`
                    : (start !== null && (start > cap || start < 0))
                        ? `${start} counters already placed in a frame of ${cap} cells`
                        : null;
        if (why && frameBad.length < 4) frameBad.push(why);
        if (why) r.frameBadCount = (r.frameBadCount || 0) + 1;
    }
    r.frameItems = frameItems;
    if (r.frameBadCount) F('ten-frame', `${r.frameBadCount} of ${frameItems} ten-frame items do not fit their frame: ${[...new Set(frameBad)].join('; ')}`);
    else if (frames !== null && !frameItems) NOTE('not-checked', `the name promises a ten frame of ${frames} cells but no item declared a frame capacity, so it was never checked`);

    // Base-10 blocks. The board offers a fixed set of places; a number that needs a place the
    // board does not offer cannot be built at all.
    let b10 = 0;
    const b10Bad = [];
    for (const it of items) {
        if (it.error || it.empty || !Array.isArray(it.places) || !it.places.length) continue;
        b10++;
        const top = Math.max(...it.places.map(Number).filter(Number.isFinite));
        const t = asNumber(it.target !== undefined ? it.target : it.ans);
        if (t === null) continue;
        const why = t < 0 ? `a negative number (${t}) cannot be built from blocks`
            : t >= top * 10 ? `${t} needs a place above ${top}, and the board only offers ${it.places.join(', ')}`
                : null;
        if (why) { r.b10BadCount = (r.b10BadCount || 0) + 1; if (b10Bad.length < 4) b10Bad.push(why); }
    }
    r.b10Items = b10;
    if (r.b10BadCount) F('base10', `${r.b10BadCount} of ${b10} base-10 items cannot be built on their own board: ${[...new Set(b10Bad)].join('; ')}`);

    // Rods of ten. "How many tens?" answers with the rod count, so the item's own declaration and
    // its answer key must agree, and ten rods is one hundred rather than an answer to the
    // question the name asks.
    //
    // The picture is deliberately NOT counted here. A rod's drawing has already changed once
    // under this gate (a coloured div of a fixed height became an outlined rect subdivided by
    // lines), and a rule that would have to be rewritten on every restyle is a rule that reports
    // the paint rather than the maths. What the picture draws is reported as a note instead.
    let rodItems = 0;
    const rodBad = [];
    const rodShapes = new Set();
    for (const it of items) {
        if (it.error || it.empty || it.rodsDeclared === undefined) continue;
        rodItems++;
        const rods = asNumber(it.rodsDeclared);
        const ans = asNumber(it.ans);
        if (it.vis) rodShapes.add(Object.entries(it.vis.tally).map(([k, v]) => `${v} ${k}`).join(' + ') || 'nothing');
        const why = rods === null ? 'the rod count is not a number'
            : (rods < 1 || rods > 9) ? `${rods} rods: ten rods is one hundred, not an answer to "how many tens"`
                : (ans !== null && ans !== rods) ? `the item draws ${rods} rods but the answer key says ${ans}`
                    : null;
        if (why) { r.rodBadCount = (r.rodBadCount || 0) + 1; if (rodBad.length < 4) rodBad.push(why); }
    }
    r.rodItems = rodItems;
    r.rodShapes = [...rodShapes].slice(0, 3);
    if (r.rodBadCount) F('rods', `${r.rodBadCount} of ${rodItems} rod items disagree with themselves: ${[...new Set(rodBad)].join('; ')}`);

    // A hundreds chart. The invariant is the RUN of numerals, not the cells: the numbers printed
    // run 1 to 100, exactly one of them is missing, and the one missing is the one the answer key
    // gives. Reading it this way survives the blank being a "?", an underscore or an empty cell.
    let chartItems = 0;
    const chartBad = [];
    for (const it of items) {
        if (it.error || it.empty || !it.vis || !it.vis.grid || it.vis.numerals < 50) continue;
        chartItems++;
        const g = it.vis.grid;
        const ans = asNumber(it.ans);
        const why = g.span !== 100 ? `the chart runs ${g.lo}-${g.hi}, which is ${g.span} numbers, not 100`
            : g.missing.length !== 1 ? `${g.missing.length} numbers are missing (${g.missing.slice(0, 6).join(', ')}) from a chart whose name asks for THE missing number`
                : g.ansPrinted ? `the answer ${ans} is already printed in the chart, so there is nothing to work out`
                    : (ans !== null && g.missing[0] !== ans) ? `the blank is at ${g.missing[0]} but the answer key says ${ans}`
                        : (it.chartTarget !== undefined && ans !== null && asNumber(it.chartTarget) !== ans) ? `the chart targets ${it.chartTarget} but the answer key says ${ans}`
                            : null;
        if (why) { r.chartBadCount = (r.chartBadCount || 0) + 1; if (chartBad.length < 4) chartBad.push(why); }
    }
    r.chartItems = chartItems;
    if (r.chartBadCount) F('chart', `${r.chartBadCount} of ${chartItems} chart items are wrong: ${[...new Set(chartBad)].join('; ')}`);

    // -- does the answer match the picture? ---------------------------------
    // The one rule that catches a defect the pupil meets head on: the cell draws seventeen hearts
    // and the key says sixteen. See COUNT_ALL_WORDING for why it is scoped as tightly as it is.
    let countable = 0, uncountable = 0;
    const countBad = [];
    for (const it of items) {
        if (it.error || it.empty) continue;
        const ans = asNumber(it.ans);
        if (ans === null || !COUNT_ALL_WORDING.test(it.fullText || it.text || '')) continue;
        if (!it.vis) { uncountable++; continue; }
        const tallies = Object.entries(it.vis.tally).filter(([, v]) => v > 0);
        if (!tallies.length) { uncountable++; continue; }
        countable++;
        if (!tallies.some(([, v]) => v === ans)) {
            r.pictureBadCount = (r.pictureBadCount || 0) + 1;
            if (countBad.length < 4) countBad.push(`answer ${ans}, but the picture draws ${tallies.map(([k, v]) => `${v} ${k}`).join(' / ')} ("${(it.fullText || '').slice(0, 40)}")`);
        }
    }
    r.pictureChecked = countable;
    if (r.pictureBadCount) F('picture-count', `${r.pictureBadCount} of ${countable} "count them all" items draw a different number of things from the one their answer key gives: ${countBad.join('; ')}`);
    if (uncountable) NOTE('not-checked', `${uncountable} "count them all" items draw nothing countable, so the answer could not be checked against the picture`);
    // THE RULE GOING QUIET IS ITSELF A FINDING. A skill whose name is about counting, on which
    // not one item reached the picture check, has not passed it - the check never ran. That is
    // what happened when count_objects was reworded out from under the old wording regex, and it
    // is reported here so the next rewording is visible the day it lands rather than whenever
    // somebody next reads the rule.
    if (/count/i.test(`${id} ${label}`) && !countable) {
        NOTE('not-checked', `this skill's name is about counting, but NOT ONE of its ${live} items was in a form whose answer could be checked against its picture. The picture check did not pass here; it never ran.`);
    }
    // The rods, reported here rather than beside their own rule, because whether the PICTURE was
    // independently counted is only known once the picture rule above has run. "How many tens?"
    // is a how-many question, so the generic count reaches it and the rods are compared to the
    // key twice over, from the payload and from the drawing. Saying otherwise - as an earlier
    // draft of this note did - would have understated the coverage, which is the same class of
    // mistake as overstating it.
    if (rodItems && !r.rodBadCount) {
        NOTE(countable ? 'checked' : 'not-checked', countable
            ? `${rodItems} rod items: the declared rod count, the answer key and the drawing all agree. Shapes seen: ${r.rodShapes.join(' | ')}`
            : `${rodItems} rod items: the declared rod count matches the answer key, but no item was in a form that let the DRAWING be counted independently. Shapes seen: ${r.rodShapes.join(' | ')}`);
    }
    // Named explicitly, because this is the subset wording the count rule deliberately refuses to
    // guess at rather than the wording it happens not to have met.
    const subset = items.filter(it => !it.error && !it.empty && /how many are\b/i.test(it.fullText || it.text || '')).length;
    if (subset) NOTE('not-checked', `${subset} items ask how many of the drawn things are of ONE kind; the answer is a subset of the picture, which this gate cannot count, so their answer keys are unverified`);

    // -- the printed cell ---------------------------------------------------
    // The wording a PAPER cell carries. print-generate.js prefers printText, so that is what is
    // read, and a skill with no printText is judged on the text it will actually print.
    let longest = 0, longestText = '';
    const screenOnly = [];
    const banned = new Map();                       // word -> an example cell that printed it
    let over12 = '', over12Words = 0;
    for (const it of items) {
        if (it.error || it.empty) continue;
        const printed = it.printText || it.fullText || it.text || '';
        const w = wordsIn(printed);
        if (w > longest) { longest = w; longestText = printed; }
        if (w > MAX_CELL_WORDS) r.longCells = (r.longCells || 0) + 1;
        if (w > MAX_K2_INSTRUCTION_WORDS) {
            r.wordyCells = (r.wordyCells || 0) + 1;
            if (w > over12Words) { over12Words = w; over12 = printed; }
        }
        for (const bad of bannedPrintWords(printed)) if (!banned.has(bad)) banned.set(bad, printed);
        if (!it.printText && SCREEN_ONLY_WORDING.test(printed)) {
            r.screenOnly = (r.screenOnly || 0) + 1;
            if (screenOnly.length < 3) screenOnly.push(`"${printed.slice(0, 70)}"`);
        }
    }
    r.maxCellWords = longest;
    if (r.longCells) F('cell-words', `${r.longCells} of ${live} printed cells run past ${MAX_CELL_WORDS} words (longest ${longest}: "${longestText.slice(0, 90)}")`);
    // The 12-word instruction cap, K-2 only. See MAX_K2_INSTRUCTION_WORDS for why an operations
    // word problem is not judged by it.
    if (r.wordyCells) F('cell-words', `${r.wordyCells} of ${live} printed cells run past the ${MAX_K2_INSTRUCTION_WORDS}-word instruction cap (BD-10, P-LG-1); every K-2 cell is a bare instruction, so the cap applies to the cell here (longest ${over12Words}: "${over12.slice(0, 90)}")`);
    if (banned.size) {
        r.bannedWords = [...banned.keys()];
        // Cite the rule that was actually broken. BD-17 is quoted only when "tick" is one of the
        // hits, or a skill that merely says "click" carries a paragraph about tick marks.
        const why = banned.has('tick')
            ? 'BD-17, owner ruling 2026-09-19: Check replaces Tick everywhere a pupil reads; only a number line, ruler, clock or scale keeps its tick marks'
            : 'BD-12 / P-LG-4: a printed instruction never says tap, click, type, drag, select, press, highlight, swipe, scroll or hover, and never asks the pupil to explain, describe, justify, discuss or prove';
        F('print-verb', `the printed cell uses ${banned.size === 1 ? 'a word' : 'words'} a paper page may never say: ${[...banned].map(([w2, ex]) => `"${w2}" in "${ex.slice(0, 60)}"`).join('; ')} (${why})`);
    }
    if (r.screenOnly) NOTE('screen-wording', `${r.screenOnly} of ${live} items have no printText and their on-screen wording asks for something paper cannot do, so that is what the printed cell will say: ${screenOnly.join('; ')}`);

    // -- what the pupil writes ----------------------------------------------
    // P-29 keeps its teeth where it belongs: a NUMBER turned into a row of buttons. A label from
    // a bank ("Group A", "Even") is one of the four responses the owner's rules allow, so it is
    // named rather than failed - but it is named, because it is still screen-only on paper unless
    // the print side draws the same bank.
    const mcNumeric = items.filter(it => it.type === 'multiple-choice' && it.optNumeric === true).length;
    const mcLabel = items.filter(it => it.type === 'multiple-choice' && it.optNumeric === false).length;
    if (mcNumeric) F('mc-parity', `${mcNumeric} of ${live} items turn a NUMBER into a row of buttons; a written-answer item is never converted to multiple choice (P-29)`);
    if (mcLabel) NOTE('mc-label', `${mcLabel} of ${live} items answer by picking a label from a bank rather than writing; allowed, but the printed cell must draw the same bank`);

    // -- a last resort: did anything at all get checked? ---------------------
    const touched = (r.k2BandChecked || 0) + (r.frameItems || 0) + (r.b10Items || 0) + (r.rodItems || 0)
        + (r.chartItems || 0) + (r.pictureChecked || 0) + (r.eqChecked || 0);
    r.k2Touched = touched;
    if (!touched) NOTE('unaudited', `NOTHING in this skill could be checked against its name: no count band, no declared representation, no countable picture and no readable equation. It is listed as passing only because there is nothing here to fail it.`);
}

function audit(skill, items) {
    const { skillId: id, label, categoryId } = skill;
    // A category pool ("Mixed Division") deals a random playable sibling from its own category,
    // and those siblings legitimately carry the inverse: Missing Factors and Multiplication Fact
    // Families both live in `division`. So a pool declares the UNION of what its members declare,
    // computed from the pool itself so it cannot rot when a sibling is added or renamed. The
    // teeth stay: an operation NO member can produce is still a failure.
    const family = skill.family || familyOf(categoryId);
    const isOps = family === 'operations';
    const ops = declaredOps(id, label, categoryId);
    if (skill.pool) for (const o of skill.pool.ops) ops.add(o);
    // The operations name-readers are switched off outside their family rather than left to say
    // nothing: declaredBand() would read "Multiplication Facts (1-12)"'s punctuation out of
    // "Count Objects (1-20)" and call the 20 a times table, and promisesRegroup() matches
    // `base10_regroup` on its id and would judge a block board by the rules of a column sum.
    const { band, mismatch } = isOps ? declaredBand(id, label) : { band: null, mismatch: null };
    const mixedPage = skill.isMetaSkill || declaresMixedPage(id, label);
    const factDrill = isOps && isFactDrill(id, label);

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
        const shape = isOps ? shapeOf(it.fmt) : k2ShapeOf(it);
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

    if (isOps && promisesRegroup(id, label)) {
        if (band && band.bounds === 'answer' && band.min === 0 && band.value <= 10) F('regroup-impossible', `promises regrouping inside a band of ${band.value}: two single digits summing within 10 can never regroup (owner ruling 2 - this skill is bridging ten, sums 11-18)`);
        else if (r.regroupNo) F('regroup-promised', `promises regrouping but ${r.regroupNo} of ${r.regroupYes + r.regroupNo} items do not: ${r.regroupExamples.join(', ')}`);
    }
    if (isOps && promisesNoRegroup(id, label) && r.regroupYes) F('regroup-forbidden', `promises no regrouping but ${r.regroupYes} of ${r.regroupYes + r.regroupNo} items regroup: ${r.regroupExamples.join(', ')}`);

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
    if (unknownFormats.size) NOTE('unknown-format', `print formats this audit has no cell shape for: ${[...unknownFormats].join(', ')} (add them to ${isOps ? 'SHAPE_OF' : 'K2_SHAPE_OF'})`);

    // For operations this is unchanged and unconditional: no + - x / skill emits a multiple-choice
    // item at all today, so there is nothing here to soften. The K-2 family answers with words as
    // well as numbers, so it gets the finer-grained version in k2Rules() instead.
    if (isOps && (r.types['multiple-choice'] || 0) > 0) F('mc-parity', `${r.types['multiple-choice']} of ${live} items are multiple choice on screen; a written-answer item is never converted to multiple choice (P-29)`);

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

    if (!isOps && live) k2Rules(skill, items, live, r, F, NOTE);
    // A skill whose generator lives in another domain's file. Reported and never moved: four
    // positional share-code systems index SKILLS[category], so a move re-points every saved code.
    if (skill.routedTo) NOTE('misfiled', `sits in the ${categoryId} category but its generator is the ${skill.routedTo} one (skillCategoryOverride in generate-question.js). Report only - moving it would re-point every saved share code.`);

    return { ...r, live, family, mixedPage, factDrill, fails, notes };
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

    // ---- the K-2 family -------------------------------------------------------------------
    const kb = (id, label) => { const b = k2Band(id, label); return b ? `${b.min}-${b.value}` : 'none'; };
    eq('count_objects band', kb('count_objects', 'Count Objects (1-20) (Visual)'), '1-20');
    eq('a count band to 120', kb('count_objects', 'Count Objects (1-120) (Visual)'), '1-120');
    eq('teen is 11-19, not 11-20', kb('ten_frame_build_teen', 'Build a Teen Number on Two Ten Frames (Drag)'), '11-19');
    eq('teen in the label too', kb('teen_compose', 'Teen Numbers: 10 + Ones (Visual)'), '11-19');
    eq('3-digit build', kb('base10_build_hundreds', 'Build 3-Digit Numbers with Flats (Drag)'), '100-999');
    eq('hundreds chart', kb('hundreds_chart_fill', 'Hundreds Chart - Find the Missing Number (Visual)'), '1-100');
    eq('number bonds within 10', kb('number_bonds', 'Number Bonds within 10 (Visual)'), '0-10');
    eq('Make 10', kb('make_ten', 'Make 10 (Visual)'), '0-10');
    eq('no band promised', kb('count_sequence', 'Next/Before/After Number (Visual)'), 'none');
    eq('no band promised (sort & count)', kb('classify_count', 'Sort & Count by Category (Visual)'), 'none');
    // The K-2 reader must not be let loose on an operations name: "(1-12)" there is the TABLE,
    // and reading it as a count band would assert 1-12 over products that reach 144. k2Band is
    // only ever called for a K-2 category, and this records the difference deliberately.
    eq('an operations fact table is NOT a count band', band('mult_facts', 'Multiplication Facts (1-12)'), '0-12/operand');

    // The quantity a K-2 band bounds: the largest number the cell shows. Both failing readings
    // are pinned here, because both looked right until a real item disproved them.
    const q = (text, extra) => k2Quantity({ text, fullText: text, ...(extra || {}) });
    eq('a count is its own quantity', q('How many hearts are there? Count them!', { ans: 17 }), 17);
    eq('a teen decomposition reads as the teen, not the part', q('10 + ___ = 13', { ans: 3 }), 13);
    eq('...and not as the ten either', q('What is 10 + 7?', { ans: 17 }), 17);
    eq('a build reads its target', q('Build the number 20 on the ten frames.', { target: 20, ans: 20 }), 20);
    eq('no number at all is unreadable', q('Which group has MORE?', { ans: 'Group A' }), null);
    eq('a chart blank reads its target', q('What number goes in the blank?', { ans: 79, chartTarget: 79 }), 79);

    eq('one ten frame holds 10', framesPromised('ten_frame_build', 'Build a Number on a Ten Frame (Drag)'), 10);
    eq('two ten frames hold 20', framesPromised('ten_frame_build_teen', 'Build a Teen Number on Two Ten Frames (Drag)'), 20);
    eq('no frame in the name', framesPromised('base10_build', 'Build a Number with Base-10 Blocks (Drag)'), 'null');

    eq('count-them-all wording', COUNT_ALL_WORDING.test('How many circles are there? Count them!'), 'true');
    // The rewording that silently switched the old allow-list version of this rule off.
    eq('...and the shorter wording it became', COUNT_ALL_WORDING.test('How many stars?'), 'true');
    eq('...and a wording nobody has written yet', COUNT_ALL_WORDING.test('How many counters can you find?'), 'true');
    eq('a subset question is NOT count-them-all', COUNT_ALL_WORDING.test('How many are Vehicles?'), 'false');
    eq('a difference is NOT count-them-all', COUNT_ALL_WORDING.test('How many more to make 10? You have 7.'), 'false');
    eq('rods are counted like anything else', COUNT_ALL_WORDING.test('How many tens?'), 'true');
    eq('screen-only wording', SCREEN_ONLY_WORDING.test('Drag counters from the palette into the cells.'), 'true');
    eq('plain wording is not screen-only', SCREEN_ONLY_WORDING.test('How many tens?'), 'false');

    const k2s = it => k2ShapeOf({ fmt: it.fmt || '(none)', type: it.type || '(none)', hasVisual: !!it.hasVisual });
    eq('a ten frame is its own shape', k2s({ fmt: 'ten-frame-build' }), 'tenframe');
    eq('a picture-and-number cell', k2s({ type: 'number', hasVisual: true }), 'picture:number');
    eq('...differs from a picture-and-pick cell', k2s({ type: 'multiple-choice', hasVisual: true }), 'picture:multiple-choice');
    eq('an unclassified format is not guessed at', k2s({ fmt: 'brand-new-thing' }), 'null');
    // The operations table must not be reachable from the K-2 one, or '(none)' would read as a
    // bare `7 + 8 = __` on a page of pictures.
    eq('(none) is still "across" for operations', shapeOf('(none)'), 'across');

    eq('the family of a K-2 category', familyOf('composing'), 'k2');
    eq('the family of an operations category', familyOf('division'), 'operations');
    eq('words in a printed cell', wordsIn('Build 83 with base-10 blocks, then regroup.'), 7);

    // BD-12 / BD-17: what a paper page may never say.
    const bw = s => bannedPrintWords(s).join(',');
    eq('a printed cell may not say click', bw('Click ALL the ODD numbers.'), 'click');
    eq('...nor tap, drag or type', bw('Tap the answer, then drag it and type it.'), 'tap,drag,type');
    eq('...nor ask the pupil to explain', bw('Explain how you know.'), 'explain');
    eq('Tick is a defect (BD-17: Check replaces Tick)', bw('Tick the box with more.'), 'tick');
    eq('...including in a decide instruction', bw('Tick same or not the same.'), 'tick');
    // BD-17 keeps "tick" for the marks on a number line, a ruler, a clock or a scale.
    eq('a number line keeps its tick marks', bw('Place 1/4 on the number line by clicking the correct tick mark.'), 'clicking');
    eq('...and a bare tick mark is clean', bw('Mark 6 on the tick marks.'), '');
    eq('an ordinary instruction is clean', bw('Count. Write how many.'), '');
    eq('Check is the allowed verb', bw('Check one box: True or False.'), '');
    // The cap is a cell cap only where the cell IS the instruction.
    eq('a K-2 instruction is inside the cap', wordsIn('Draw 16 counters in the ten frames.') <= MAX_K2_INSTRUCTION_WORDS, 'true');
    eq('an operations story is not judged by it', wordsIn('There are 5 apples in the fruit basket. Layla adds 92 more. How many apples are there in all?') > MAX_K2_INSTRUCTION_WORDS, 'true');

    if (bad.length) { console.error(`ws-content-audit: FAIL - ${bad.length} self-test(s)`); bad.forEach(b => console.error('  - ' + b)); process.exit(1); }
    console.log(`ws-content-audit: OK (self-test, ${TESTS} name-reading assertions)`);
}

// ---------------------------------------------------------------------------
(async () => {
    if (has('self-test')) return selfTest();
    if (ONLY_FAMILY && !FAMILY_CATS[ONLY_FAMILY]) {
        console.error(`ws-content-audit: FAIL - unknown --family ${ONLY_FAMILY} (expected ${Object.keys(FAMILY_CATS).join(' or ')})`);
        process.exit(1);
    }
    const app = await open({ seed: 4242 });
    await hideOverlays(app.page);
    let skills = (await listSkills(app.page)).filter(s => CATS.includes(s.categoryId));
    if (ONLY_FAMILY) skills = skills.filter(s => FAMILY_CATS[ONLY_FAMILY].includes(s.categoryId));
    if (ONLY_CAT) skills = skills.filter(s => s.categoryId === ONLY_CAT);
    if (ONLY_SKILL) skills = skills.filter(s => s.skillId === ONLY_SKILL);
    if (!skills.length) { console.error(`ws-content-audit: FAIL - no skill matched ${[ONLY_FAMILY, ONLY_CAT, ONLY_SKILL].filter(Boolean).join(' ')}`); await app.close(); process.exit(1); }

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

    // Which skills the APP itself treats as mixed meta skills. `counting_all` ("All Counting &
    // Cardinality") declares a varied page as plainly as "Mixed Counting" does but does not start
    // with the word, and judged as a single-shape skill it would fail cell-shape for doing exactly
    // what its name says. Read from the app rather than from another regex. Checked against the
    // operations family: isMixedMetaSkill picks out mixed_addition / _subtraction / _multiplication
    // / _division and nothing else there, all four of which /^mixed[_ ]/ already matched, so no
    // operations verdict moves.
    const metaSkills = new Set(await app.page.evaluate(() => {
        const out = [];
        for (const [cat, list] of Object.entries(window.SKILLS)) {
            if (!Array.isArray(list)) continue;
            for (const s of list) if (window.isMixedMetaSkill && window.isMixedMetaSkill(s.v)) out.push(`${cat}:${s.v}`);
        }
        return out;
    }));

    // Skills whose generator lives in another domain's file. Six of the K-2 ids are in this table
    // - three fractions skills and two patterns ones sitting in `composing`, plus number_word_form
    // routed to placevalue - and the audit reports them rather than moving them, because four
    // positional share-code systems index SKILLS[category]. Parsed out of the real table so the
    // note cannot drift from what generate-question.js actually does.
    const routed = new Map();
    {
        const src = fs.readFileSync(path.join(ROOT, 'js', 'modules', 'generate-question.js'), 'utf8');
        const block = src.match(/const skillCategoryOverride\s*=\s*\{([\s\S]*?)\n\s*\};/);
        if (block) for (const m of block[1].matchAll(/^\s*'([^']+)'\s*:\s*'([^']+)'/gm)) routed.set(m[1], m[2]);
    }

    const out = [];
    for (const s of skills) {
        const family = familyOf(s.categoryId);
        const isMetaSkill = metaSkills.has(`${s.categoryId}:${s.skillId}`);
        const members = declaresMixedPage(s.skillId, s.label) ? pools[`${s.categoryId}:${s.skillId}`] : null;
        const pool = members ? {
            size: members.length,
            ops: new Set(members.flatMap(m => [...declaredOps(m.v, m.l, s.categoryId)])),
        } : null;
        const skill = {
            ...s, pool, family, isMetaSkill,
            routedTo: routed.get(s.skillId) || null,
            hasNotationOption: withNotation.has(`${s.categoryId}:${s.skillId}`),
        };
        const items = await app.page.evaluate(sampleInPage, {
            categoryId: s.categoryId, skillId: s.skillId, n: N, baseSeed: seedFor(`${s.categoryId}:${s.skillId}`), range: 100,
            k2: family === 'k2',
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
    const tally = (list, rows = out) => {
        const t = {};
        for (const s of rows) for (const f of s[list]) t[f.cls] = (t[f.cls] || 0) + 1;
        return Object.entries(t).sort((a, b) => b[1] - a[1]);
    };
    console.log('\nFailures by class:');
    for (const [k, v] of tally('fails')) console.log(`  ${String(v).padStart(4)}  ${k}`);
    if (!bad.length) console.log('     0  (none)');
    console.log('\nNotes by class:');
    for (const [k, v] of tally('notes')) console.log(`  ${String(v).padStart(4)}  ${k}`);

    // PER FAMILY, ALWAYS, even when only one was run. The operations family is finished and the
    // K-2 one is not; a single blended number would hide a regression in the finished half behind
    // the churn in the other, which is the whole reason the split is printed rather than summed.
    console.log('\nBy family:');
    for (const fam of Object.keys(FAMILY_CATS)) {
        const rows = out.filter(s => s.family === fam);
        if (!rows.length) continue;
        const f = rows.filter(s => s.fails.length);
        console.log(`  ${fam.padEnd(11)} ${String(rows.length).padStart(3)} skills, ${f.length} failing` + (f.length ? `: ${f.map(s => s.skillId).join(', ')}` : ''));
        const cls = tally('fails', rows);
        for (const [k, v] of cls) console.log(`        ${String(v).padStart(4)}  ${k}`);
    }

    // What the gate could NOT check. Printed in the summary and not only beside each skill,
    // because this is the number that says how much of the family is really covered: a skill
    // nothing could be checked on is not a passing skill, it is an unexamined one.
    const unaudited = out.filter(s => s.notes.some(n => n.cls === 'unaudited'));
    const partial = out.filter(s => s.notes.some(n => n.cls === 'not-checked'));
    console.log(`\nCoverage: ${unaudited.length} skills where NOTHING could be checked against the name` +
        (unaudited.length ? ` (${unaudited.map(s => `${s.categoryId}/${s.skillId}`).join(', ')})` : '') +
        `; ${partial.length} more with at least one check that could not be applied.`);

    if (JSON_OUT) { fs.writeFileSync(path.resolve(ROOT, JSON_OUT), JSON.stringify(out, null, 1)); console.log('wrote', JSON_OUT); }

    const scope = [ONLY_FAMILY, ONLY_CAT, ONLY_SKILL].filter(Boolean).join('/')
        || `${new Set(out.map(s => s.family)).size > 1 ? 'operations + K-2' : out[0].family}`;
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
