// Content gate: does a skill generate what its own NAME promises?
//
// The owner's page holds SIX items. One item outside the band is a sixth of the lesson, so this
// runs as a gate, not a report: any skill with a failing class exits non-zero.
//
//   node tests/scripts/ws-content-audit.cjs                       # every audited skill
//   node tests/scripts/ws-content-audit.cjs --family operations    # + - x / only
//   node tests/scripts/ws-content-audit.cjs --family k2            # counting & cardinality only
//   node tests/scripts/ws-content-audit.cjs --family pv            # place value, rounding, estimation (P9)
//   node tests/scripts/ws-content-audit.cjs --family tm            # time and money (P10)
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
// P9: place value + rounding + estimation (design/research/place-value-rounding.md §17). Declared
// with the rest of the pv family further down; PV_CATS is hoisted here so the family table is one
// place.
const PV_FAMILY_CATS = ['placevalue', 'number_sense'];
// P10: time + money (design/research/time-money.md §17). `measurement` is shared with rulers,
// conversions and capacity, so the family is an ID LIST inside it, not a category.
const TM_CATS = ['measurement'];
const TM_IDS = new Set([
    'time_hour', 'time_half_hour', 'time_quarter', 'time_5min', 'time_1min', 'time_analog_digital', 'time_match_clock',
    'order_clocks_analog_asc', 'order_clocks_analog_desc', 'order_clocks_digital_asc', 'order_clocks_digital_desc',
    'elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed', 'elapsed_find_duration',
    'elapsed_visual_easy', 'elapsed_visual_medium', 'elapsed_visual_hard',
    'money_count', 'money', 'equiv_coin_sets', 'enough_money', 'make_change_least_coins', 'mixed_time',
    'clock_parts', 'time_fives_ring', 'time_sense', 'elapsed_find_start', 'coin_value', 'money_notation', 'money_change', 'money_compare',
]);
const CATS = [...OPS_CATS, ...K2_CATS, ...PV_FAMILY_CATS, ...TM_CATS];
const familyOf = cat => (OPS_CATS.includes(cat) ? 'operations' : PV_FAMILY_CATS.includes(cat) ? 'pv' : TM_CATS.includes(cat) ? 'tm' : 'k2');
const FAMILY_CATS = { operations: OPS_CATS, k2: K2_CATS, pv: PV_FAMILY_CATS, tm: TM_CATS };

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
    grid: ['grid-fill', 'seq-strip'],
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
function sampleInPage({ categoryId, skillId, n, baseSeed, range, k2, pv, tm }) {
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
        // A short run of numerals is kept whole: a hundred-chart WINDOW (P8) is judged on it.
        if (nums.length >= 4 && nums.length <= 30) out.nums = nums;
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
        // A pv item's identity is its description plus what it prints: a sort prints the same
        // sentence every time and its whole variation is the tiles.
        if (pv) fp = `${text}|${printText}|${JSON.stringify(q.pv || null)}|${JSON.stringify(q.tiles || null)}|${JSON.stringify(q.numbers || null)}|${String(q.visual || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')}`;
        const item = {
            a: q.a, b: q.b, op: q.op, ans: q.ans, fp,
            fmt: q.printFormat || '(none)', type: q.answerType || '(none)',
            text: text.slice(0, 120),
        };
        // P8: what the KEY-COMPLETENESS, ONE-RIGHT-ANSWER and GIVEAWAY rules read (see
        // p8Rules). Each is the item's own declaration, never a reading of its picture's style.
        const blanks = (String(q.text || '').match(/_{3,}/g) || []).length;
        if (blanks) item.blanks = blanks;
        if (Array.isArray(q.keyParts)) item.keyParts = q.keyParts.map(String);
        if (q.factFamilyData && Array.isArray(q.factFamilyData.equations)) {
            item.ffEquations = q.factFamilyData.equations.length;
            item.ffNumbers = (q.factFamilyData.numbers || []).map(Number);
            item.ffAdd = q.factFamilyData.equations.some(e => /\+/.test(String(e && e.text)));
        }
        if (Array.isArray(q.clozeOptions)) item.cloze = q.clozeOptions.map(l => (l || []).map(Number));
        if (q.quotientRemainder && typeof q.quotientRemainder === 'object') {
            const rem = q.quotientRemainder.remainder;
            const vis = String(q.visual || '').replace(/<[^>]+>/g, ' ');
            item.remainderShown = new RegExp(`Remainder:?\\s*${rem}\\b|(^|\\s)R\\s*${rem}(\\s|$)`).test(vis);
        }
        if (q.printText) item.printTextAll = String(q.printText).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
        // P10: a K-2 picture cell drawn by a sheet-kit template carries its plain-data payload
        // (SCC-Q3), which the picture rules read instead of the drawing, and the words and
        // numerals its screen twin prints (the caption-giveaway rule).
        if (q.cell && q.cell.template && ['counters', 'tenframe', 'base10', 'bond', 'chartwindow', 'seqstrip', 'compare', 'wordpic'].includes(q.cell.template)) {
            item.cellT = q.cell.template;
            try { item.cellP = JSON.parse(JSON.stringify(q.cell.payload || {})); } catch (e) { item.cellP = {}; }
            item.visPlain = String(q.visual || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400);
        }
        if (tm) {
            // P10: the kit cell's plain payload is the item's declaration; the rules recompute
            // from it and read what the pupil sees (text, hint, the twin's words).
            const strip = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
            const visRaw = String(q.visual || '');
            item.fp = `${JSON.stringify(q.cell || null)}|${JSON.stringify(q.ans)}`;
            item.tmT = q.cell ? q.cell.template : '';
            try { item.tmP = JSON.parse(JSON.stringify(q.cell ? q.cell.payload : null)); } catch (e) { item.tmP = null; }
            item.fullText = text;
            item.hint = strip(q.hint);
            item.visText = strip(visRaw);
            item.optLen = Array.isArray(q.options) ? q.options.length : 0;
            item.colors = [...new Set((visRaw.match(/#[0-9a-fA-F]{3,6}\b|rgb\([^)]*\)/g) || []).map(c => c.toLowerCase()))];
            item.emoji = (visRaw.match(/\p{Extended_Pictographic}/gu) || []).length;
            item.refused = q.refused || '';
            item.skillId = q.skillId;
            out.push(item);
            continue;
        }
        if (pv) {
            const strip = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            const vis = String(q.visual || '');
            item.pv = q.pv || null;
            item.printText = printText;
            item.fullText = text;
            item.hint = strip(q.hint);
            item.visText = strip(vis);
            item.refused = q.refused || '';
            if (Array.isArray(q.options)) {
                item.labels = q.options.map(o => String(o && typeof o === 'object' ? (o.label !== undefined ? o.label : '') : o));
                if (q.options.some(o => o && typeof o === 'object' && 'correct' in o)) item.optCorrect = q.options.map(o => ({ label: String(o.label), correct: !!o.correct }));
            }
            if (Array.isArray(q.tiles)) item.tiles = q.tiles.map(t => String(t && t.label !== undefined ? t.label : t));
            // An ordering item prints its numbers as cards, not in its sentence.
            if (Array.isArray(q.numbers)) item.labels = (item.labels || []).concat(q.numbers.map(v => String(v)));
            if (Array.isArray(q.bins)) {
                item.bins = q.bins.map(b => String(b && b.label !== undefined ? b.label : b));
                if (Array.isArray(q.tiles) && q.ans && typeof q.ans === 'object') {
                    const binLabel = Object.fromEntries(q.bins.map(b => [b.id, String(b.label)]));
                    item.sortPairs = q.tiles.map(t => [String(t.label), binLabel[q.ans[t.id]]]);
                }
            }
            if (q.interactiveType === 'expanded' && Array.isArray(q.expandedValues)) item.expanded = { n: q.expandedNumber, values: q.expandedValues.slice() };
            // The disks the DRAWING has, recounted from its own circles, and the line's two labels.
            const drawn = {};
            for (const m of vis.matchAll(/data-pv-disk="(\d+)"/g)) drawn[m[1]] = (drawn[m[1]] || 0) + 1;
            item.drawnDisks = drawn;
            item.lineEnds = [...vis.matchAll(/data-pv-end="([\d.]+)"/g)].map(m => parseFloat(m[1]));
            // `pv-support` (a support picture over the `pv` cell) carries the `pv` payload as `base`.
            const cp = q.cell && q.cell.template === 'pv' ? (q.cell.payload || {})
                : q.cell && q.cell.template === 'pv-support' ? ((q.cell.payload || {}).base || {}) : null;
            item.cellKind = cp ? cp.kind : '';
            item.cellBank = cp && Array.isArray(cp.bank) ? cp.bank.length : 0;
            out.push(item);
            continue;
        }
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

// ---------------------------------------------------------------------------
// P8 rules: the classes of defect the P8 content pass fixed, held so they cannot come back.
// ---------------------------------------------------------------------------
// Every rule reads the item's own declaration and is zero-tolerance, like answer-wrong.
//   key-blanks     every blank the item prints has a key. A fact family prints four blanks and
//                  keyed one number on 40 % of items; an array item printed three and keyed the
//                  total. The key is `q.keyParts` when the item names it, else its answer list.
//   one-right      a pick-from-lists item admits exactly one right pair: {8, 6, 7} and {5, 7, 6}
//                  for 12 hold both 6 + 6 and 7 + 5, and the key named one of them.
//   giveaway       the picture states the answer. A remainder item's caption read "Remainder: 6".
//   fact-family    a family has three different numbers, two parts of 2 or more, and at Grade 1
//                  a whole within 20 ("1, 1, 2" and "6, 6, 12" are not families of four facts).
//   one-plural     "1 flowers": a count of one takes the singular noun (the wording is read by
//                  pupils still learning English).
const NOT_PLURAL = /^(is|was|has|does|plus|minus|less|times|this|its|us|as|yes|always|equals|makes|gives|goes|comes|means|shows|tells)$/i;
function p8Rules(items, F) {
    const bad = { keys: [], one: [], give: [], fam: [], plural: [] };
    for (const it of items) {
        if (!it || it.error || it.empty) continue;
        const ansList = Array.isArray(it.ans) ? it.ans.map(String)
            : typeof it.ans === 'string' && it.ans.includes(',') ? it.ans.split(',').map(t => t.trim())
                : [String(it.ans)];
        if (it.ffEquations && ansList.length !== it.ffEquations) bad.keys.push(`${it.ffEquations} facts keyed with ${ansList.length} number(s): "${ansList.join(', ')}"`);
        if (it.blanks >= 2 && it.type !== 'grid-fill') {
            const parts = it.keyParts || ansList;
            if (parts.length !== it.blanks) bad.keys.push(`${it.blanks} blanks keyed with ${parts.length} value(s) ("${it.text.slice(0, 40)}")`);
        }
        if (it.cloze && it.cloze.length === 2) {
            const m = String(it.text).match(/=\s*(\d+)/);
            const sum = m ? Number(m[1]) : NaN;
            if (Number.isFinite(sum)) {
                let pairs = 0;
                for (const x of it.cloze[0]) for (const y of it.cloze[1]) if (x + y === sum) pairs++;
                if (pairs !== 1) bad.one.push(`${pairs} right pairs for ${sum} in {${it.cloze[0].join(', ')}} + {${it.cloze[1].join(', ')}}`);
            }
        }
        if (it.remainderShown) bad.give.push(`the picture states the remainder ("${it.text.slice(0, 30)}")`);
        if (it.ffNumbers && it.ffNumbers.length === 3) {
            const [x, y, w] = it.ffNumbers;
            // An addition family only (w = x + y); a x / family is judged by its own table band.
            if (it.ffAdd && (x === y || x < 2 || y < 2 || w > 20)) bad.fam.push(`${x}, ${y}, ${w}`);
        }
        for (const t of [it.text, it.printTextAll || '']) {
            const m = String(t).match(/(?:^|[^\d,.])1 (?:more )?([a-z]+s)\b/i);
            if (m && !NOT_PLURAL.test(m[1])) { bad.plural.push(`"${m[0].trim()}"`); break; }
        }
    }
    const show = (a) => [...new Set(a)].slice(0, 4).join('; ');
    if (bad.keys.length) F('key-blanks', `${bad.keys.length} items print more answer blanks than their key fills: ${show(bad.keys)}`);
    if (bad.one.length) F('one-right', `${bad.one.length} pick-from-lists items do not have exactly one right answer: ${show(bad.one)}`);
    if (bad.give.length) F('giveaway', `${bad.give.length} items show the answer in the picture: ${show(bad.give)}`);
    if (bad.fam.length) F('fact-family', `${bad.fam.length} fact families are not three different numbers with parts of 2+ and a whole within 20: ${show(bad.fam)}`);
    if (bad.plural.length) F('one-plural', `${bad.plural.length} items put a plural noun after 1: ${show(bad.plural)}`);
}

/**
 * P10: the K-2 picture cells (count_objects, number_seq_fill, compare_groups, number_bonds,
 * base10_build, hundreds_chart_fill, ten_frame_build, share_into_groups, add_wp_10,
 * sub_5_pictures), each drawn by a sheet-kit template and judged on its own payload.
 *
 *   answer-spread     no single numeric answer on more than 1 item in 5 (a label answer from a
 *                     two-box bank, "A" / "B", is a choice, not a spread, and is not counted)
 *   caption-giveaway  a fill-the-gaps cell (keyParts) never prints one of its answers, and no
 *                     picture carries a range caption ("10s: 3-93", "Numbers 71-80") naming the
 *                     ends of the run
 *   chart-window      a 3 x 5 window of the 1-100 chart: every gap is inside the window, the key
 *                     lists the gaps in reading order, each gap has a printed neighbour in its row
 *                     or column, and the gaps are not all in one place across the skill
 *   seq-track         a number track is one arithmetic run, its key is the run at the gaps, two
 *                     printed neighbours show the step, and the skill deals several steps
 */
const K2_PICTURE_SKILLS = new Set(['count_objects', 'number_seq_fill', 'compare_groups', 'number_bonds', 'base10_build',
    'hundreds_chart_fill', 'ten_frame_build', 'share_into_groups', 'add_wp_10', 'sub_5_pictures']);
function pictureRules(items, F) {
    const live = items.filter(it => it && !it.error && !it.empty);
    if (!live.length) return;
    const show = (a) => [...new Set(a)].slice(0, 4).join('; ');
    // answer-spread
    const nums = live.map(it => asNumber(it.ans)).filter(v => v !== null);
    if (nums.length >= live.length * 0.8) {
        const tally = {};
        for (const v of nums) tally[v] = (tally[v] || 0) + 1;
        const [top, n] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
        if (n / nums.length > 0.2) F('answer-spread', `the answer ${top} is dealt on ${n} of ${nums.length} items (more than 1 in 5): spread the answers`);
    }
    // caption-giveaway
    const give = [];
    for (const it of live) {
        const vis = it.visPlain || '';
        if (/\b\d+s?\s*:\s*\d[\d,]*\s*[-–]\s*\d/.test(vis) || /\bNumbers\s+\d+\s*[-–]\s*\d+/i.test(vis)) give.push(`range caption "${vis.slice(0, 40)}"`);
        if (Array.isArray(it.keyParts) && it.cellT) {
            const printed = new Set((vis.match(/\d[\d,]*/g) || []).map(t => t.replace(/,/g, '')));
            const hit = it.keyParts.find(k => printed.has(String(k).replace(/,/g, '')));
            if (hit !== undefined) give.push(`the answer ${hit} is printed in the cell`);
        }
    }
    if (give.length) F('caption-giveaway', `${give.length} items print their own answer or the ends of their run: ${show(give)}`);
    // chart-window
    const chart = live.filter(it => it.cellT === 'chartwindow');
    if (chart.length) {
        const bad = [];
        const spots = new Set();
        for (const it of chart) {
            const p = it.cellP || {};
            const rows = p.rows || [], cols = p.cols || [], blanks = (p.blanks || []).map(Number);
            const inWin = (n) => rows.includes(Math.floor((n - 1) / 10)) && cols.includes((n - 1) % 10);
            const key = (it.keyParts || [String(it.ans)]).map(Number);
            if (rows.length !== 3 || cols.length !== 5 || rows.some(r => r < 0 || r > 9) || cols.some(c => c < 0 || c > 9)) bad.push('the window is not 3 x 5 on the chart');
            if (!blanks.length || blanks.some(b => !inWin(b))) bad.push(`a gap outside its window (${blanks.join(', ')})`);
            if (key.join(',') !== blanks.slice().sort((a, b) => a - b).join(',')) bad.push(`the key ${key.join(', ')} is not the gaps ${blanks.join(', ')} in reading order`);
            for (const b of blanks) {
                const row = (n) => Math.floor((n - 1) / 10);
                const nb = [b - 1, b + 1].filter(n => row(n) === row(b)).concat([b - 10, b + 10]).filter(inWin);
                if (!nb.some(n => !blanks.includes(n))) bad.push(`the gap ${b} has no printed neighbour`);
                spots.add(`${rows.indexOf(Math.floor((b - 1) / 10))}:${cols.indexOf((b - 1) % 10)}`);
            }
        }
        if (bad.length) F('chart-window', `${bad.length} chart windows are wrong: ${show(bad)}`);
        if (chart.length >= 20 && spots.size < 8) F('chart-window', `the gaps sit in only ${spots.size} of the window's 15 places across ${chart.length} items: deal them over the window`);
    }
    // seq-track
    const seq = live.filter(it => it.cellT === 'seqstrip');
    if (seq.length) {
        const bad = [];
        const steps = new Set();
        for (const it of seq) {
            const v = (it.cellP.values || []).map(Number), bl = (it.cellP.blanks || []).map(Number);
            const d = v[1] - v[0];
            steps.add(Math.abs(d));
            if (v.length < 5 || !d || v.some((x, i) => i && x - v[i - 1] !== d)) bad.push(`not one arithmetic run (${v.join(', ')})`);
            const key = (it.keyParts || [String(it.ans)]).map(Number);
            if (key.join(',') !== bl.map(i => v[i]).join(',')) bad.push(`the key ${key.join(', ')} is not the run at its gaps`);
            if (bl.includes(0) && bl.includes(v.length - 1)) bad.push('both ends are gaps');
            if (!v.some((_, i) => i < v.length - 1 && !bl.includes(i) && !bl.includes(i + 1))) bad.push('no two printed neighbours show the step');
        }
        if (bad.length) F('seq-track', `${bad.length} number tracks are wrong: ${show(bad)}`);
        if (seq.length >= 20 && steps.size < 3) F('seq-track', `every track counts by ${[...steps].join(' or ')}: deal several steps`);
    }
}

/**
 * P8b: a number-bond page asks for the WHOLE as well as a part, and spreads its answers (the
 * baseline page hid only parts and answered 1 on six items of twenty). The item's sentence is
 * "part + part = whole", so a missing whole is the one that ends "= ?".
 */
function bondRules(items, F) {
    const live = items.filter(it => it && !it.error && !it.empty);
    if (!live.length) return;
    const whole = live.filter(it => /=\s*\?\s*$/.test(String(it.text || ''))).length;
    if (whole / live.length < 0.2) F('bond-whole', `${whole} of ${live.length} bonds ask for the whole; a bond page asks for the whole as well as a part (at least 1 in 5)`);
    const tally = {};
    for (const it of live) tally[String(it.ans)] = (tally[String(it.ans)] || 0) + 1;
    const [top, n] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    if (n / live.length > 0.2) F('bond-spread', `the answer ${top} is dealt on ${n} of ${live.length} bonds (more than 1 in 5): spread the answers`);
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
    // A hundred-chart WINDOW (P8): a block of whole rows x whole columns cut from the 1-100
    // chart. Its invariant: the numerals printed plus the answer fill that block exactly, the
    // answer is not printed, and the gap has a neighbour on all four sides (one more / one less
    // across, ten more / ten less down), which is what the window exists to make the pupil use.
    for (const it of items) {
        if (it.error || it.empty || it.chartTarget === undefined || !it.vis || !it.vis.nums || it.vis.numerals >= 50) continue;
        chartItems++;
        const ans = asNumber(it.ans);
        const shown = it.vis.nums;
        const all = new Set(shown.concat(ans === null ? [] : [ans]));
        const rowsOf = [...new Set([...all].map(n => Math.floor((n - 1) / 10)))].sort((x, y) => x - y);
        const colsOf = [...new Set([...all].map(n => (n - 1) % 10))].sort((x, y) => x - y);
        const contiguous = (a) => a.every((v, i) => i === 0 || v === a[i - 1] + 1);
        const why = ans === null ? 'the answer is not a number'
            : shown.includes(ans) ? `the answer ${ans} is already printed in the window`
                : asNumber(it.chartTarget) !== ans ? `the window's gap is ${it.chartTarget} but the answer key says ${ans}`
                    : [...all].some(n => n < 1 || n > 100) ? 'the window runs off the 1-100 chart'
                        : !contiguous(rowsOf) || !contiguous(colsOf) || all.size !== rowsOf.length * colsOf.length || shown.length !== all.size - 1
                            ? `the numerals are not one block of the chart with one gap (${shown.slice(0, 8).join(', ')}...)`
                            : ![ans - 1, ans + 1, ans - 10, ans + 10].every(n => shown.includes(n))
                                ? `the gap ${ans} sits on the window's edge, so it lacks a neighbour`
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


// ===========================================================================
// THE PV FAMILY: place value, rounding and estimation (P9, design/research/place-value-rounding.md §17)
// ===========================================================================
// `placevalue` + `number_sense`, minus P4's three strategy ladders (make_a_ten,
// doubles_near_doubles, compensation), which sit in number_sense but are operations content and
// are named in PV_EXCLUDED so the coverage line says they were left out rather than passed.
//
// WHAT A PV NAME DECLARES. "Round to Nearest 100" declares a PLACE, and the place declares a
// floor: a nearest-100 item is at least three digits, so the skill needs numbers to 1,000.
// THE BAND (owner ruling of 2026-09-25, superseding ruling 2 of 2026-09-24): the skill's own band
// option SETS its working range, and its default is the place's natural band (nearest_100 -> to
// 1,000). Max Number at its app default (100) is "not chosen", so at Max Number 100 every skill
// DEALS, judged against its default band; only a Max Number the teacher explicitly LOWERED below
// the floor refuses (skill-options.js pvCap / pvRefusal), and that is checked at Max Number 50.
//
// HOW IT IS READ. Every rewritten generator publishes `q.pv`, a plain description of the item
// (the number, the place, the parts, the disks), and every rule below RECOMPUTES the answer from
// that description and from what is printed — it never trusts q.ans. A skill whose name is on
// the §17 list but whose items carry no description fails `pv-payload`: nothing about it could be
// proved. Numbers are read off what the pupil sees (printText, the visual's text, the printed
// choices and tiles), and the disk drawing is recounted from its own circles.
const PV_CATS = ['placevalue', 'number_sense'];
const PV_EXCLUDED = new Set(['make_a_ten', 'doubles_near_doubles', 'compensation']);
const PV_WORD = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands', 1000000: 'millions' };
const PV_PLACE_WORDS = /\b(?:ones|tens|hundreds|thousands|millions)\b/i;
// The §17 answer-in-item list, and every id the P9 generator describes (so it must describe).
const PV_AII = /^(?:identify|value|more_less_10|more_less_100|rounding_visual|nearest_(?:10|100|1000|10000|100000|million))$/;
const PV_DESCRIBED = /^(?:identify|value|expand|combine|more_less_10|more_less_100|place_value_disks|pv_disks_build|place_value_10x|rounding_visual|nearest_\w+|round_sort_\w+)$/;
const PV_OP_NAME = { '+': /\bsums?\b|\badd/, '−': /\bdiff(?:erences?)?\b|\bsubtract/, '×': /\bproducts?\b|\bmultipl/, '÷': /\bquotients?\b|\bdivi/ };
const PV_OP_GLYPH = { '+': /\+/, '−': /[−–]|\s-\s/, '×': /×/, '÷': /÷/ };

/** The place a pv NAME rounds to, or 0. The id is read first: it is the permanent declaration. */
function pvNamePlace(id, label) {
    const hay = `${String(id).replace(/_/g, ' ')} ${label}`.toLowerCase();
    if (/\bhundredths?\b/.test(hay)) return 0.01;
    if (/\btenths?\b/.test(hay)) return 0.1;
    const m = hay.match(/nearest\s+(million|1,000,000|100,000|100000|10,000|10000|1,000|1000|100|10)\b/);
    if (!m) return 0;
    return m[1] === 'million' ? 1000000 : parseInt(m[1].replace(/,/g, ''), 10);
}
/** The Max Number a place needs: ten times the place (§2.1). Decimal places have none. */
const pvNameFloor = (id, label) => { const P = pvNamePlace(id, label); return P >= 10 ? P * 10 : 0; };

/** Round to a place, halfway up (owner ruling 6), exact for decimal places too. */
function pvRound(n, P) {
    const k = P < 1 ? Math.round(10 / P) : 1;
    const nu = Math.round(n * k), pu = Math.round(P * k);
    return (Math.floor((nu + pu / 2) / pu) * pu) / k;
}
const pvNums = (s) => (String(s || '').match(/\d[\d,]*(?:\.\d+)?/g) || []).map(t => parseFloat(t.replace(/,/g, ''))).filter(Number.isFinite);
const pvDigitAt = (n, place) => Math.floor(Math.abs(n) / place) % 10;
const PV_CAPS = /\b[A-Z]{2,}\b/;

/**
 * @param {Object} ctx {R: the biggest number allowed (the default band), refusedLow: {floor, at, dealt, sample}|null,
 *                      midpointSeeded: boolean, geom: in-page disk geometry, buildMax10k: number}
 */
function pvRules(skill, items, live, r, F, NOTE, ctx) {
    const { skillId: id, label } = skill;
    const R = ctx.R;
    const P = pvNamePlace(id, label);
    const mixed = skill.isMetaSkill || declaresMixedPage(id, label);
    r.pvMaxNumber = R;
    r.pvPlace = P || null;

    // pv-refusal: below the floor the skill must return nothing at all.
    if (ctx.refusedLow && ctx.refusedLow.dealt) {
        F('pv-band', `needs numbers to ${ctx.refusedLow.floor.toLocaleString('en-US')} (its place), but with Max Number explicitly lowered to ${ctx.refusedLow.at} it still dealt ${ctx.refusedLow.dealt} items instead of refusing: ${ctx.refusedLow.sample.join('; ')}`);
    }
    if (ctx.deadAtDefault) F('pv-band', `refuses at the app default Max Number 100: a stand-alone skill must deal at its default band`);

    const bad = {};
    const add = (cls, msg) => { (bad[cls] = bad[cls] || []).push(msg); };
    let twoDigit = 0, withPv = 0;
    const types = new Set(), formats = new Set();
    const live6 = [];
    for (const it of items) {
        if (it.error || it.empty) { live6.push(null); continue; }
        live6.push(it);
        types.add(it.type); formats.add(it.fmt);
        const printedText = it.printText || it.fullText || '';
        const printed = [printedText, it.visText, ...(it.labels || []), ...(it.tiles || []), ...(it.bins || [])].join(' ');
        const ns = pvNums(printed);
        const pv = it.pv;
        if (pv) withPv++;

        // ---- pv-band: nothing printed past Max Number; rounding numbers at least their place.
        // The number the item is ABOUT counts even when its digits are printed one per track.
        const shown = pv && Number.isFinite(pv.n) ? [...ns, pv.n] : ns;
        const maxP = shown.length ? Math.max(...shown) : null;
        if (maxP !== null && maxP > R) add('pv-band', `prints ${maxP.toLocaleString('en-US')} past its default band ${R.toLocaleString('en-US')} (${printedText.slice(0, 50)})`);
        if (maxP !== null && maxP >= 10 && maxP <= 99) twoDigit++;
        if (pv && pv.kind === 'round' && (pv.n < pv.place || pv.n % pv.place === 0)) add('pv-band', `rounds ${pv.n} to the nearest ${pv.place}: below the place, or already rounded`);
        if (pv && pv.kind === 'moreless') {
            const a = pv.dir === 'more' ? pv.n + pv.step : pv.n - pv.step;
            if (pv.n < 0 || a < 0 || pv.n > R || a > R) add('pv-band', `${pv.step} ${pv.dir} than ${pv.n} leaves 0-${R}`);
        }

        // ---- pv-place-name: the place the name declares is the place dealt.
        if (P) {
            const said = (printedText.match(/nearest\s+([\d,.]*\d|hundred thousand|ten thousand|hundredth|tenth|thousand|hundred|million|ten)\b/i) || [])[1];
            const WORDP = { ten: 10, hundred: 100, thousand: 1000, 'ten thousand': 10000, 'hundred thousand': 100000, million: 1000000, tenth: 0.1, hundredth: 0.01 };
            const saidP = said === undefined ? null : (WORDP[String(said).toLowerCase()] || parseFloat(String(said).replace(/,/g, '')));
            if (pv && pv.place !== undefined && Math.abs(pv.place - P) > 1e-9) add('pv-place-name', `dealt the nearest ${pv.place}, the name says ${P}`);
            else if (saidP !== null && Math.abs(saidP - P) > 1e-9) add('pv-place-name', `prints "nearest ${said}", the name says ${P}`);
            else if (!pv && saidP === null) add('pv-place-name', `the item names no place and describes none: "${printedText.slice(0, 50)}"`);
        }
        if (/^estimate_/.test(id)) {
            const hay = `${String(id).replace(/_/g, ' ')} ${label}`.toLowerCase();
            const declared = Object.keys(PV_OP_NAME).filter(o => PV_OP_NAME[o].test(hay));
            const seen = Object.keys(PV_OP_GLYPH).filter(o => PV_OP_GLYPH[o].test(printedText));
            const stray = seen.filter(o => !declared.includes(o));
            if (!seen.some(o => declared.includes(o)) || stray.length) add('pv-place-name', `"${printedText.slice(0, 50)}" is not ${declared.join(' / ')} estimation`);
            const an = asNumber(it.ans);
            if (typeof it.ans === 'number' && !Number.isInteger(it.ans)) add('pv-place-name', `answers ${it.ans}: an estimate to a place is a whole number`);
            void an;
        }

        // ---- pv-recompute / pv-expanded-shape / answer-matches-picture, from the description.
        const ans = it.ans;
        if (pv) {
            const s = String(pv.n);
            switch (pv.kind) {
                case 'place':
                    if (pvDigitAt(pv.n, pv.place) !== pv.digit || ans !== PV_WORD[pv.place]) add('pv-recompute', `the ${pv.digit} of ${pv.n} is in the ${PV_WORD[pv.place]} place, keyed "${ans}"`);
                    break;
                case 'value':
                    if (pvDigitAt(pv.n, pv.place) !== pv.digit || Number(ans) !== pv.digit * pv.place) add('pv-recompute', `the ${pv.digit} of ${pv.n} is worth ${pv.digit * pv.place}, keyed ${ans}`);
                    break;
                case 'combine': {
                    const sum = (pv.parts || []).reduce((a, b) => a + b, 0);
                    const oneDigit = (pv.parts || []).every(p => p > 0 && /^[1-9]0*$/.test(String(p)));
                    if (sum !== pv.n || Number(ans) !== pv.n || !oneDigit) add('pv-recompute', `${(pv.parts || []).join(' + ')} = ${sum}, keyed ${ans}`);
                    break;
                }
                case 'moreless': {
                    const want = pv.dir === 'more' ? pv.n + pv.step : pv.n - pv.step;
                    if (Number(ans) !== want) add('pv-recompute', `${pv.step} ${pv.dir} than ${pv.n} is ${want}, keyed ${ans}`);
                    break;
                }
                case 'x10': {
                    const want = pv.op === 'x' ? pv.n * pv.power : pv.n / pv.power;
                    if (Math.abs(Number(ans) - want) > 1e-9) add('pv-recompute', `${pv.n} ${pv.op === 'x' ? '×' : '÷'} ${pv.power} = ${want}, keyed ${ans}`);
                    const big = Math.max(Math.abs(pv.n), Math.abs(want));
                    if (big > R) add('pv-band', `${pv.n} ${pv.op === 'x' ? '×' : '÷'} ${pv.power}: ${big} is past its default band ${R}`);
                    break;
                }
                case 'round':
                    if (Number(ans) !== pvRound(pv.n, pv.place)) add('pv-recompute', `${pv.n} to the nearest ${pv.place} is ${pvRound(pv.n, pv.place)} (halfway up), keyed ${ans}`);
                    break;
                case 'disks': {
                    const n = Object.entries(pv.counts || {}).reduce((a, [p, c]) => a + Number(p) * c, 0);
                    const want = pv.task === 'count' ? (pv.counts || {})[pv.place] : n;
                    if (n !== pv.n || Number(ans) !== want) add('pv-recompute', `the disks make ${n}${pv.task === 'count' ? ` (${(pv.counts || {})[pv.place]} ${PV_WORD[pv.place]})` : ''}, keyed ${ans}`);
                    // answer-matches-picture: recount the circles the drawing actually has.
                    const drawn = it.drawnDisks || {};
                    for (const p of pv.places || []) {
                        if ((drawn[p] || 0) !== pvDigitAt(n, p)) { add('answer-matches-picture', `${pv.n}: the ${PV_WORD[p]} zone draws ${drawn[p] || 0} disks, the number has ${pvDigitAt(n, p)}`); break; }
                    }
                    break;
                }
                case 'build':
                    if (Number(ans) !== pv.n || (pv.places || []).length !== s.length) add('pv-recompute', `build ${pv.n}: keyed ${ans} on a mat of ${(pv.places || []).length} places`);
                    break;
                case 'circle': {
                    const wrong = (it.optCorrect || []).filter(o => (pvRound(parseFloat(String(o.label).replace(/,/g, '')), pv.place) === pv.target) !== !!o.correct);
                    if (wrong.length) add('pv-recompute', `rounds to ${pv.target}: ${wrong.map(o => o.label).join(', ')} keyed the wrong way`);
                    break;
                }
                case 'sort': {
                    const miss = (it.sortPairs || []).filter(([t, b]) => Math.abs(pvRound(parseFloat(String(t).replace(/,/g, '')), pv.place) - parseFloat(String(b).replace(/,/g, ''))) > 1e-9);
                    if (miss.length) add('answer-matches-picture', `${miss.map(([t, b]) => `${t} keyed under ${b}`).join(', ')}`);
                    if (!(it.sortPairs || []).length) add('answer-matches-picture', 'no tile is keyed to a bin');
                    break;
                }
                default: break;
            }
            // answer-matches-picture: the rounding line's two labels are the multiples either side.
            if (pv.kind === 'round' && it.lineEnds && it.lineEnds.length) {
                const lo = Math.floor(pv.n / pv.place) * pv.place;
                if (it.lineEnds.length !== 2 || it.lineEnds[0] !== lo || it.lineEnds[1] !== lo + pv.place) add('answer-matches-picture', `${pv.n}: the line is labelled ${it.lineEnds.join(' and ')}, not ${lo} and ${lo + pv.place}`);
            }
        }
        // pv-expanded-shape: one part per place, zeros included, and the key writes them — read off
        // the screen payload (expandedValues) as well as the description, so a generator that drops
        // the zero part from the widget is caught even when its description is right.
        if (it.expanded) {
            const n = it.expanded.n;
            const digits = String(n).split('').map(Number);
            const want = digits.map((d, i) => d * 10 ** (digits.length - 1 - i));
            const got = it.expanded.values || [];
            const keyParts = pvNums(String(ans).replace(/\s*\+\s*/g, ' '));
            if (got.length !== want.length || got.some((v, i) => v !== want[i])) add('pv-expanded-shape', `${n} = ${want.join(' + ')}, the boxes hold ${got.join(' + ')}`);
            else if (keyParts.length !== want.length || keyParts.some((v, i) => v !== want[i])) add('pv-expanded-shape', `${n}: the key reads "${ans}", not ${want.join(' + ')}`);
        }

        // ---- answer-in-item (Q-8), for the §17 list.
        if (PV_AII.test(id)) {
            const ansStr = String(ans);
            const ansNum = asNumber(ans);
            const hintNums = pvNums(it.hint);
            if ((ansNum !== null && hintNums.includes(ansNum)) || (ansNum === null && ansStr && new RegExp(`\\b${ansStr}\\b`, 'i').test(it.hint || ''))) add('answer-in-item', `the hint gives it away: "${String(it.hint).slice(0, 60)}"`);
            if (/round (?:up|down)|closer|midpoint|shorter bar|×|=/i.test(it.visText || '')) add('answer-in-item', `the picture carries the method: "${String(it.visText).slice(0, 60)}"`);
            if (pv && (pv.kind === 'place' || pv.kind === 'value') && PV_PLACE_WORDS.test(it.visText || '')) add('answer-in-item', `the picture names the place: "${String(it.visText).slice(0, 60)}"`);
            if (ansNum === null && ansStr && pv && pv.kind === 'place' && new RegExp(`\\b${ansStr}\\b`, 'i').test(`${printedText} ${it.visText || ''}`)) add('answer-in-item', `"${ansStr}" is printed in the item`);
            // The picture may print only the item's own numbers: the number, its digits, the step,
            // and a rounding line's two ends. A midpoint label or a neighbour is the answer's method.
            if (pv) {
                const allowed = new Set([pv.n, pv.step, pv.place, ...String(pv.n).split('').map(Number)].filter(v => v !== undefined));
                if (pv.kind === 'round') { const lo = Math.floor(pv.n / pv.place) * pv.place; allowed.add(lo); allowed.add(lo + pv.place); }
                const extra = pvNums(it.visText).filter(v => !allowed.has(v));
                if (extra.length) add('answer-in-item', `the picture prints ${extra.slice(0, 4).join(', ')} beside ${pv.n}`);
                const printedNums = pvNums(printedText.replace(/nearest\s+[\d,]+/i, ' ')).filter(v => v !== pv.n && v !== pv.step && v !== pv.place);
                if (ansNum !== null && printedNums.includes(ansNum)) add('answer-in-item', `the printed item holds the answer ${ansNum}: "${printedText.slice(0, 50)}"`);
            } else if (ansNum !== null && pvNums(it.visText).includes(ansNum)) {
                add('answer-in-item', `the picture prints the answer ${ansNum}`);
            }
        }

        // ---- banned-verb: nothing a pencil cannot do, and no words in capitals.
        const words = bannedPrintWords(printedText);
        if (words.length) add('banned-verb', `"${printedText.slice(0, 60)}" (${words.join(', ')})`);
        else if (PV_CAPS.test(printedText)) add('banned-verb', `words in capitals: "${printedText.slice(0, 60)}"`);

        // ---- prints-something: a sort has its tiles and bins on paper; a build has its empty mat.
        if (!printedText.trim() && !(it.visText || '').trim() && !it.cellKind) add('prints-something', 'nothing printable');
        if (/^round_sort_/.test(id) && !(it.cellKind === 'sort' && it.cellBank === (it.tiles || []).length && (it.tiles || []).length >= 6 && (it.bins || []).length === 2)) {
            add('prints-something', `the paper cell carries ${it.cellBank || 0} of ${(it.tiles || []).length} tiles and ${(it.bins || []).length} bins`);
        }
        if (id === 'pv_disks_build' && !(it.cellKind === 'build')) add('prints-something', 'no empty mat to draw in');
    }

    for (const [cls, list] of Object.entries(bad)) F(cls, `${list.length} of ${live} items: ${[...new Set(list)].slice(0, 4).join('; ')}`);

    // "to 99" means two-digit items exist (§17 pv-band), for the place-value names that carry no place.
    if (skill.categoryId === 'placevalue' && !mixed && !P && R === 100 && live && !twoDigit) {
        F('pv-band', `never deals a two-digit number at Max Number 100 (band 99 is unreachable)`);
    }
    if (PV_DESCRIBED.test(id) && live && withPv < live) {
        F('pv-payload', `${live - withPv} of ${live} items carry no q.pv description, so nothing about them can be recomputed`);
    }
    if (!PV_DESCRIBED.test(id) && live) NOTE('not-checked', 'no q.pv description (§19.4 step 8): pv-recompute and answer-in-item could not be applied; band, verbs, one-response and variety were');

    // one-response (P-28): one answer type and one print format per non-mixed page.
    if (!mixed && live && (types.size > 1 || formats.size > 1)) F('one-response', `${types.size} answer types (${[...types].join(', ')}) and ${formats.size} print formats (${[...formats].join(', ')}) on one page`);
    if (!mixed && types.has('multi-select-check')) F('one-response', 'a multi-select item on a page whose response is "write" (circle-all is its own step, response: circle-all)');

    // midpoint-seeded: every page of six carries a halfway number and a round-up-across-a-place.
    if (ctx.midpointSeeded) {
        const pages = [];
        for (let i = 0; i + PAGE <= live6.length; i += PAGE) pages.push(live6.slice(i, i + PAGE));
        let noMid = 0, noAcross = 0;
        for (const pg of pages) {
            if (pg.some(x => !x || !x.pv)) continue;
            const mid = pg.some(x => x.pv.kind === 'round' ? pvRound(x.pv.n, x.pv.place) - x.pv.n === x.pv.place / 2
                : x.pv.kind === 'sort' ? (x.pv.tiles || []).some(t => Math.abs(t - x.pv.bins[0] - x.pv.place / 2) < 1e-9) : false);
            const across = pg.some(x => x.pv.kind !== 'round' || (Number(x.ans) > x.pv.n && Number(x.ans) % (10 * x.pv.place) === 0));
            if (!mid) noMid++;
            if (!across) noAcross++;
        }
        if (noMid) F('midpoint-seeded', `${noMid} of ${pages.length} pages of six have no number exactly halfway`);
        if (noAcross) F('midpoint-seeded', `${noAcross} of ${pages.length} pages of six have no number that rounds up across a place (96 -> 100)`);
    }

    // disk-fits: nine disks at the size's diameter fit every zone; drawing stops at 999.
    if ((id === 'place_value_disks' || id === 'pv_disks_build') && ctx.geom) {
        const g = ctx.geom;
        if (g.error) F('disk-fits', `could not measure the disk mat: ${g.error}`);
        for (const row of g.rows || []) {
            if (row.d < 8 || row.capacity < 9 || row.zone + 1e-6 < 3 * (row.d + 2) + 2) F('disk-fits', `${row.size} ${row.place}s: ${row.d} mm disks, zone ${row.zone} mm holds ${row.capacity}`);
        }
        for (const cellRow of g.cells || []) {
            if (cellRow.minZone + 1e-6 < cellRow.need) F('disk-fits', `${cellRow.size}: the printed build mat's zones are ${cellRow.minZone} mm, nine disks need ${cellRow.need} mm`);
        }
        if (id === 'pv_disks_build' && ctx.buildMax10k > 999) F('disk-fits', `builds ${ctx.buildMax10k.toLocaleString('en-US')} at Max Number 10,000: drawing stops at 999 (owner ruling 3)`);
    }
    if (/^estimate_(sums_diffs|products|quotient)$/.test(id)) NOTE('not-checked', 'reasonable-balance: task "reasonable" is off by default (§19.4 step 8 builds its 40-60% balance)');
}

// ===========================================================================
// THE TM FAMILY: time and money (P10, design/research/time-money.md §17)
// ===========================================================================
// Every rewritten item carries `q.cell`: a `clock`, `timeline`, `coins` or `money-columns`
// template with a plain payload. The rules RECOMPUTE the answer from that payload (the hands'
// h:m, the elapsed start + duration, the coin total, the fewest set by dynamic programming, the
// change in integer minor units) and never trust q.ans; they hold every step to its NAME's
// precision, band and response. Each is zero-tolerance at the audit's deterministic seeds.
const TM_T = (h, m) => `${((h % 12) + 12) % 12 || 12}:${String(m).padStart(2, '0')}`;
const TM_MIN = (t) => ((t.h * 60 + t.m) % 1440 + 1440) % 1440;
const TM_READ = { time_hour: [0], time_half_hour: [30], time_quarter: [15, 45], time_5min: [5, 10, 20, 25, 35, 40, 50, 55] };
const TM_PLAIN_COINS = new Set([1, 5, 10, 25]);
const TM_BANNED = /\b(click|drag|tap|select|press)\b/i;
const tmSum = (l) => (l || []).reduce((a, b) => a + b, 0);
function tmFewest(values, target) {
    const best = new Array(target + 1).fill(Infinity); best[0] = 0;
    for (let a = 1; a <= target; a++) for (const v of values) if (v <= a && best[a - v] + 1 < best[a]) best[a] = best[a - v] + 1;
    return best[target];
}
/** The answer the payload implies, recomputed independently of the generator. */
function tmExpected(t, p) {
    if (!p) return undefined;
    if (t === 'clock') {
        switch (p.kind) {
            case 'read': case 'words': return TM_T(p.h, p.m);
            case 'draw': return JSON.stringify({ hour: p.h % 12, minute: p.m });
            case 'choose': { const f = (p.faces || [])[p.correct]; return f && f.h % 12 === p.h % 12 && f.m === p.m ? 'ABC'[p.correct] : '?'; }
            case 'order': {
                const mins = (p.times || []).map(x => x.h * 60 + x.m);
                const sorted = mins.slice().sort((a, b) => (p.dir === 'desc' ? b - a : a - b));
                return mins.map(v => sorted.indexOf(v) + 1).join(', ');
            }
            case 'parts': return p.task === 'hands' ? p.hourLetter : (p.missing || []).join(', ');
            case 'fives': { const g = new Set(p.given || []); const v = []; for (let i = 1; i <= 12; i++) if (!g.has(i)) v.push(i === 12 ? 0 : i * 5); return v.join(', '); }
            case 'sense': return ['a.m.', 'p.m.'].includes(p.ap) ? p.ap : '?';
            default: return undefined;
        }
    }
    if (t === 'timeline') {
        const d = ((TM_MIN(p.end) - TM_MIN(p.start)) % 1440 + 1440) % 1440;
        if (d !== p.total) return '?duration';
        if (p.mode === 'duration') return p.answer === 'minutes' ? String(p.total) : `${Math.floor(p.total / 60)} h ${p.total % 60} min`;
        const u = p.mode === 'later' ? p.end : p.start;
        return p.response === 'draw' ? JSON.stringify({ hour: u.h % 12, minute: u.m }) : TM_T(u.h, u.m);
    }
    if (t === 'coins') {
        switch (p.kind) {
            case 'count': {
                if (p.answer === 'two') return `${tmSum(p.notes)}, ${tmSum(p.coins)}`;
                return String(p.answer === 'major' ? tmSum(p.notes) : tmSum(p.coins));
            }
            case 'find': return String((p.coins || []).filter(v => v === p.target).length);
            case 'order': { const l = p.notes && p.notes.length ? p.notes : p.coins; const s = l.slice().sort((a, b) => a - b); return l.map(v => s.indexOf(v) + 1).join(', '); }
            case 'tally': {
                const made = (p.values || []).reduce((a, v, i) => a + v * (p.counts || [])[i], 0);
                const n = tmSum(p.counts);
                return made === p.target && n === tmFewest(p.values, p.target) ? (p.counts || []).join(', ') : '?fewest';
            }
            case 'enough': return tmSum(p.coins) >= p.price ? 'Enough' : 'Not enough';
            case 'check': return tmSum(p.coins) === p.target ? 'Yes' : 'No';
            case 'compare': { const a = tmSum(p.a.coins), b = tmSum(p.b.coins); return p.response === 'sign' ? (a > b ? '>' : a < b ? '<' : '=') : (a > b ? 'A' : b > a ? 'B' : '?'); }
            case 'notation': {
                const tot = p.words ? p.total : tmSum(p.notes) * 100 + tmSum(p.coins);
                return `${Math.floor(tot / 100)}.${String(tot % 100).padStart(2, '0')}`;
            }
            default: return undefined;
        }
    }
    if (t === 'money-columns') {
        const v = p.op === '-' ? p.a - p.b : p.a + p.b;
        return p.cents ? `${Math.floor(v / 100)}.${String(v % 100).padStart(2, '0')}` : String(v / 100);
    }
    return undefined;
}

function tmRules(skill, items, live, r, F, NOTE) {
    const id = skill.skillId;
    const ok = items.filter(it => !it.error && !it.empty && !it.refused);
    if (!ok.length) return;
    const bad = (cls, list, msg) => { if (list.length) F(cls, `${list.length} of ${ok.length} items ${msg}: ${list.slice(0, 3).join('; ')}`); };
    // tm-payload: every item is a kit cell
    bad('tm-payload', ok.filter(it => !it.tmT || !it.tmP).map(it => it.fullText.slice(0, 40)), 'carry no kit cell (q.cell)');
    const cells = ok.filter(it => it.tmT && it.tmP);
    // tm-recompute
    bad('tm-recompute', cells.filter(it => {
        const want = tmExpected(it.tmT, it.tmP);
        if (want === undefined) return false;
        const got = typeof it.ans === 'object' ? JSON.stringify(it.ans) : String(it.ans);
        return got !== want;
    }).map(it => `${JSON.stringify(it.ans)} vs ${tmExpected(it.tmT, it.tmP)}`), 'ship an answer their own cell does not produce');
    // tm-precision: a reading step deals only its new positions (review off by default)
    if (TM_READ[id]) bad('tm-precision', cells.filter(it => !TM_READ[id].includes(it.tmP.m)).map(it => TM_T(it.tmP.h, it.tmP.m)), `show a minute outside the step's positions (${TM_READ[id].join(', ')})`);
    if (id === 'time_1min') bad('tm-precision', cells.filter(it => it.tmP.m % 5 === 0).map(it => TM_T(it.tmP.h, it.tmP.m)), 'show a five-minute time on the 1-minute step');
    // tm-band: coins within the plain set, within the band and the coin cap; elapsed within the span
    if (cells.some(it => it.tmT === 'coins')) {
        bad('tm-band', cells.filter(it => [...(it.tmP.coins || []), ...((it.tmP.a || {}).coins || []), ...((it.tmP.b || {}).coins || [])].some(v => !TM_PLAIN_COINS.has(v))).map(it => JSON.stringify(it.tmP.coins)), 'deal a coin outside 1, 5, 10, 25 at Plain numbers');
        if (id === 'money_count') bad('tm-band', cells.filter(it => (it.tmP.coins || []).length > 6 || tmSum(it.tmP.coins) > 100).map(it => JSON.stringify(it.tmP.coins)), 'go over the default 6 coins / total 100');
    }
    if (cells.some(it => it.tmT === 'timeline')) {
        const cap = { elapsed_30min: 30, elapsed_15min: 45, elapsed_hour: 180 }[id] || 180;
        bad('tm-band', cells.filter(it => it.tmP.total > cap).map(it => `${it.tmP.total} min`), `run longer than the default span (${cap} min)`);
    }
    // answer-in-item: the hint and the screen text never hold the answer
    bad('answer-in-item', cells.filter(it => {
        if (typeof it.ans === 'object') return false;
        const a = String(it.ans);
        if (a.length < 3 && !/:/.test(a)) return false;
        // a label from a printed bank (check one box) is on the page by design
        if (['Enough', 'Not enough', 'Yes', 'No', 'a.m.', 'p.m.'].includes(a)) return false;
        return it.hint.includes(a) || (it.tmT !== 'clock' || it.tmP.kind !== 'draw') && it.fullText.includes(a);
    }).map(it => `${it.ans} in "${it.hint.slice(0, 50)}"`), 'print their answer in the hint or the text');
    // one-response: one answer type and one cell kind per page (a mixed review excepted)
    if (!/^mixed/.test(id)) {
        const kinds = new Set(cells.map(it => `${it.type}/${it.tmT}/${it.tmP.kind || it.tmP.mode || it.tmP.op}`));
        if (kinds.size > 1 && !/^elapsed/.test(id)) F('one-response', `${kinds.size} different responses on one page: ${[...kinds].join(', ')}`);
        const ts = new Set(cells.map(it => it.type));
        if (ts.size > 1) F('one-response', `${ts.size} answer types on one page: ${[...ts].join(', ')}`);
    }
    // production-stays-production
    bad('production-stays-production', cells.filter(it => it.optLen > 0).map(it => it.fullText.slice(0, 30)), 'turn a written answer into buttons (q.options)');
    // banned-verb (paper and screen text alike) and capitals
    bad('banned-verb', cells.filter(it => TM_BANNED.test(it.fullText) || /\b[A-Z]{3,}\b/.test(it.fullText)).map(it => it.fullText.slice(0, 50)), 'use a screen verb or capitals');
    // currency-sign: the default is Plain numbers
    bad('currency-sign', cells.filter(it => /[$¢]|\bQR\b|\bcents?\b|\bdollars?\b|\briyals?\b|\bdirhams?\b/i.test(`${it.fullText} ${it.visText}`)).map(it => it.visText.slice(0, 40)), 'print a currency sign or word at Plain numbers');
    // ink: no colour, no emoji inside the cell
    bad('ink', cells.filter(it => it.emoji || it.colors.some(c => !['#000', '#000000', '#fff', '#ffffff', '#949494'].includes(c))).map(it => `${it.colors.join(' ')}${it.emoji ? ' emoji' : ''}`), 'draw with a colour or an emoji');
    // balanced-decision: a check-one-box decision is 40-60% each way
    const DEC = { enough_money: 'Enough', equiv_coin_sets: 'Yes', time_sense: 'a.m.', money_compare: 'A' };
    if (DEC[id] && cells.length >= 12) {
        const share = cells.filter(it => it.ans === DEC[id]).length / cells.length;
        if (share < 0.4 || share > 0.6) F('balanced-decision', `"${DEC[id]}" is the answer on ${Math.round(100 * share)}% of items (40-60% required)`);
    }
    // edge-seeded: every seeded page of six carries the step's edge case (§2.3)
    const EDGE = {
        time_hour: (p) => p.h % 12 === 0, time_half_hour: (p) => p.h % 12 === 0, time_quarter: (p) => p.h % 12 === 0,
        time_5min: (p) => p.m === 5 || p.m === 55, time_1min: (p) => p.m === 58,
        money_notation: (p) => { const t = p.words ? p.total : tmSum(p.notes) * 100 + tmSum(p.coins); return t % 100 < 10 || t < 100; },
        elapsed_30min: (p) => p.start.m + 30 >= 60,
    };
    if (EDGE[id]) {
        const pages = [];
        for (let i = 0; i + 6 <= cells.length; i += 6) pages.push(cells.slice(i, i + 6));
        const miss = pages.filter(pg => !pg.some(it => EDGE[id](it.tmP)));
        if (miss.length) F('edge-seeded', `${miss.length} of ${pages.length} pages of six lack the step's edge case`);
    }
}

// ---------------------------------------------------------------------------
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
        // The pv family has no shape table: one-response (pvRules) is its cell-shape rule.
        const shape = isOps ? shapeOf(it.fmt) : (family === 'pv' || family === 'tm') ? null : k2ShapeOf(it);
        if (shape) bump(r.shapes, shape); else if (family !== 'pv' && family !== 'tm') unknownFormats.add(it.fmt);

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

    if (live === 0) F('empty', `generates nothing (${r.errors} threw, ${r.empty} came back empty)${family === 'pv' ? ` at Max Number ${(skill.pvCtx || {}).R}` : ''}`);
    if (r.errors) F('throws', `${r.errors} of ${r.n} generations threw`);

    // The worst defect there is: the printed page and its answer key disagree. Zero tolerance,
    // and it leads the finding list because no other complaint matters if the answer is wrong.
    if (r.eqWrong) F('answer-wrong', `${r.eqWrong} of ${r.eqChecked} checkable equations do not balance with the answer shipped: ${r.eqExamples.join('; ')}`);
    // A bare `A / B = ?` answered with the floor when B does not divide A is FORGIVEN above,
    // because that is how a quotient-and-remainder cell reads. Today every such cell ships the
    // remainder in the answer itself ("59 R 5"), so this never fires; if it starts firing, a
    // generator has begun dropping remainders silently and the owner should see it.
    p8Rules(items, F);
    if (id === 'number_bonds') bondRules(items, F);
    if (K2_PICTURE_SKILLS.has(id)) pictureRules(items, F);

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
    // P8 name-hold: a mixed page named after ONE operation ("Mixed Division") is held to its
    // own name, not to the pool union. The union licensed "9 × 8 = ___" on a Mixed Division page
    // because a sibling in the category ("Mixed Multiplication & Division") promises ×; the app
    // now narrows the pool (data.js getMixedPoolSkills), and this keeps it narrowed.
    // Scoped to × and ÷ for now: Mixed Addition / Subtraction still draw add_sub_10s and
    // unknown_start_wp, whose names promise both signs (a P8 leftover, owner to rule).
    if (skill.pool && /^mixed_(multiplication|division)$/.test(id)) {
        const own = declaredOps(id, label, categoryId);
        const off = Object.keys(r.seenOps).filter(o => !own.has(o));
        if (off.length) {
            const list = Object.entries(r.seenOps).map(([k, v]) => `${k} x${v}`).join(', ');
            F('name-hold', `"${label}" deals ${off.join(' and ')}, which its own name does not promise (dealt ${list}); narrow the pool in getMixedPoolSkills`);
        }
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

    if (family === 'k2' && live) k2Rules(skill, items, live, r, F, NOTE);
    if (family === 'pv') pvRules(skill, items, live, r, F, NOTE, skill.pvCtx || { R: 100 });
    if (family === 'tm') tmRules(skill, items, live, r, F, NOTE);
    // A skill whose generator lives in another domain's file. Reported and never moved: four
    // positional share-code systems index SKILLS[category], so a move re-points every saved code.
    if (skill.routedTo && skill.routedTo !== categoryId) NOTE('misfiled', `sits in the ${categoryId} category but its generator is the ${skill.routedTo} one (skillCategoryOverride in generate-question.js). Report only - moving it would re-point every saved share code.`);

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

    // ---- the pv family (P9) -----------------------------------------------------------------
    eq('pv place: nearest_100', pvNamePlace('nearest_100', 'Round to Nearest 100'), '100');
    eq('pv place: nearest_10000 reads the id, not a shorter prefix', pvNamePlace('nearest_10000', 'Round to Nearest 10,000'), '10000');
    eq('pv place: nearest_million', pvNamePlace('nearest_million', 'Round to Nearest 1,000,000'), '1000000');
    eq('pv place: a sort names its place', pvNamePlace('round_sort_1000', 'Rounding Sort: Nearest 1,000'), '1000');
    eq('pv place: tenths', pvNamePlace('round_sort_tenths', 'Rounding Sort: Nearest Tenth'), '0.1');
    eq('pv place: a number line names none', pvNamePlace('rounding_visual', 'Round on a Number Line'), '0');
    eq('pv floor: nearest 1,000 needs 10,000', pvNameFloor('nearest_1000', 'Round to Nearest 1,000'), '10000');
    eq('pv floor: a decimal sort has none', pvNameFloor('round_sort_hundredths', 'Rounding Sort: Nearest Hundredth'), '0');
    eq('pv round: halfway rounds up', pvRound(45, 10), '50');
    eq('pv round: across a place', pvRound(96, 10), '100');
    eq('pv round: a zero in the deciding place', pvRound(305, 100), '300');
    eq('pv round: tenths, halfway up', pvRound(0.25, 0.1), '0.3');
    eq('pv round: hundredths', pvRound(0.444, 0.01), '0.44');
    eq('pv family of number_sense', familyOf('number_sense'), 'pv');

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
    let skills = (await listSkills(app.page)).filter(s => CATS.includes(s.categoryId)
        && (!TM_CATS.includes(s.categoryId) || TM_IDS.has(s.skillId))
        && !(PV_FAMILY_CATS.includes(s.categoryId) && PV_EXCLUDED.has(s.skillId)));
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
    const { optionsFor, pvBandFloor, pvBand } = await import(pathToFileURL(mjs).href);
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
            // P8: the app narrows a one-operation pool ("Mixed Division" never draws from "Mixed
            // Multiplication & Division"); read the narrowed pool back when the app has one.
            const pool = (id) => {
                if (typeof window.getMixedPoolSkills !== 'function') return playable;
                const keep = new Set(window.getMixedPoolSkills(cat, id));
                return playable.filter(x => keep.has(x.v));
            };
            for (const s of list) if (/^mixed[_ ]/.test(s.v) && playable.length) out[`${cat}:${s.v}`] = pool(s.v);
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

    // The disk mat's geometry at S / M / L, read from the kit itself in the page (disk-fits), and
    // a printed build cell at each size measured from its own zone rectangles.
    const pvGeom = skills.some(s => s.skillId === 'pv_disks_build' || s.skillId === 'place_value_disks')
        ? await app.page.evaluate(async () => {
            try {
                const kit = await import('/js/modules/sheet/index.js');
                const rows = [];
                for (const size of ['S', 'M', 'L']) {
                    for (const place of [1, 10, 100, 1000]) {
                        rows.push({ size, place, d: kit.diskDiameter(place, size), zone: kit.zoneSide(place, size), capacity: kit.zoneCapacity(place, size) });
                    }
                }
                const q = window.generateQuestionFor({ category: 'placevalue', skill: 'pv_disks_build', range: 1000, decimals: 0, seed: 7, itemIndex: 0 });
                const cells = [];
                for (const size of ['S', 'M', 'L']) {
                    const html = kit.renderCell(q, { mode: 'print', size, state: 'blank' });
                    const zones = [...html.matchAll(/<rect[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"[^>]*data-pv-zone="(\d+)"/g)]
                        .map(m => Math.min(parseFloat(m[1]), parseFloat(m[2])));
                    const need = 3 * (kit.diskDiameter(100, size) + 2) + 2;
                    cells.push({ size, minZone: zones.length ? Math.min(...zones) : 0, need });
                }
                return { rows, cells };
            } catch (e) { return { error: String(e && e.message || e) }; }
        })
        : null;

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
        const baseSeed = seedFor(`${s.categoryId}:${s.skillId}`);
        if (family === 'pv') {
            // TWO RUNS. At Max Number 100 (the app default, "not chosen") every skill DEALS and is
            // judged against its default band R (owner ruling 2026-09-25). A skill with a floor is
            // then run with Max Number explicitly LOWERED to 50 and must REFUSE there when its
            // place needs more. The floor is read off the NAME ("Nearest 1,000" needs 10,000);
            // where the name carries no place, the skill's own declaration (pvBandFloor) says.
            const floor = Math.max(pvNameFloor(s.skillId, s.label), pvBandFloor(s.categoryId, s.skillId, {}) || 0);
            const R = Math.max(100, floor, pvBand(s.categoryId, s.skillId, {}, 0) || 0);
            const LOW = 50;
            const items = await app.page.evaluate(sampleInPage, { categoryId: s.categoryId, skillId: s.skillId, n: N, baseSeed, range: 100, pv: true });
            const low = floor > LOW ? await app.page.evaluate(sampleInPage, { categoryId: s.categoryId, skillId: s.skillId, n: Math.min(N, 60), baseSeed, range: LOW, pv: true }) : [];
            const dealt = low.filter(x => !x.error && !x.empty);
            const deadAtDefault = items.length > 0 && items.every(x => x.error || x.empty);
            let buildMax10k = 0;
            if (s.skillId === 'pv_disks_build') {
                const big = await app.page.evaluate(sampleInPage, { categoryId: s.categoryId, skillId: s.skillId, n: 60, baseSeed, range: 10000, pv: true });
                buildMax10k = Math.max(0, ...big.filter(x => x.pv).map(x => x.pv.n));
            }
            skill.pvCtx = {
                R, geom: pvGeom, buildMax10k,
                refusedLow: floor > LOW ? { floor, at: LOW, dealt: dealt.length, sample: dealt.slice(0, 3).map(x => x.fullText.slice(0, 40)) } : null,
                deadAtDefault,
                midpointSeeded: optionsFor(s.categoryId, s.skillId).some(o => o.id === 'midpoint' && o.default === 'seeded'),
            };
            out.push({ ...skill, ...audit(skill, items) });
            continue;
        }
        const items = await app.page.evaluate(sampleInPage, {
            categoryId: s.categoryId, skillId: s.skillId, n: N, baseSeed, range: 100,
            k2: family === 'k2', tm: family === 'tm',
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
        || [...new Set(out.map(s => s.family))].map(f => ({ operations: 'operations', k2: 'K-2', pv: 'place value', tm: 'time and money' })[f] || f).join(' + ');
    const noteCount = out.reduce((n, s) => n + s.notes.length, 0);
    // "lying about itself" vs "legitimately mixed": a failing skill contradicts its own name; a
    // mixed pool is held to the union of its pool's names and is counted separately, so the
    // owner can see at a glance that the mixed pools are not what is failing.
    const badMixed = bad.filter(s => s.pool).length;
    const summary = `${out.length} ${scope} skills, ${N} items each, Max Number 100${out.some(s => s.family === 'pv') ? ' (a pv skill with a place floor also at its floor)' : ''}`;
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
