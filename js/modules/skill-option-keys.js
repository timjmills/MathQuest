// skill-option-keys.js — THE registry of share-code option keys and value tokens.  (2026-09-25)
//
// Every option a skill can carry in a share code has a KEY here, and every value it can take has a
// TOKEN here. skill-option-codec.js reads nothing else. The format is in design/SHARE_CODES.md.
//
// WHY ONE REGISTRY. The 26 one-letter keys are all used. Several waves were each about to invent
// their own second-character scheme ("X" + letter, "0" + letter, "9" + letter ...), and two of them
// would sooner or later have handed the same key, or the same value character, to two different
// things. A key or token, once shipped, means that thing for ever: a link printed on a worksheet
// must still decode next year. So every key and every token is allocated HERE, in one place, and
// tests/scripts/ws-codec-registry.mjs pins every entry (append-only: a changed or removed entry
// fails; a new one is reported and must be pinned in the same change).
//
// THE KEYS
//   One letter (A–Z)   the original keys, all 26 taken. Frozen.
//   Digit + letter     a MULTI-CHARACTER key: a digit 0–9, then a letter A–Z. One digit BLOCK per
//                      wave (KEY_BLOCKS), 26 keys a block. A decoder reads a field as a two-character
//                      key exactly when it matches /^\d[A-Z]/ (MULTI_KEY_RE).
//
// OLD APPS STAY SAFE (no format version bump). The deployed decoder reads a field's FIRST character
// as its key; no one-letter key is a digit, so it skips every "5A…" field as an option it does not
// know, and the skill loads with that option at its default — never a misread. The one trap is the
// payload's first character: a payload that STARTS with a digit is "a later format version" and
// is ignored whole. So the encoder writes the one-letter fields first, and when only multi-character
// fields remain it writes a leading EMPTY field: "~_5A12". An old decoder skips the empty field and
// then the unknown one. (tests/scripts/ws-codec-registry.mjs runs the deployed decoder, copied from
// git, against new codes to prove it.)
//
// VALUE TOKENS. One UNION token table per option id: every value the id takes on ANY skill has one
// character, unique within that id, so two skills that share an id never read one character two
// ways. String values are listed in VALUE_TOKENS; the members of a numeric SET are written as
// themselves in base 36 (NUMERIC_SET_VALUES lists every one in use, so the union is checkable);
// a numeric SCALAR (enum / int) is written as its decimal digits and needs no token. `members`
// carries its own two-character tokens on the def (the pool position; skill-options-pools.js).
//
// This file imports nothing, so node and the browser load it bare.

/** A field whose key is a digit then a letter. */
export const MULTI_KEY_RE = /^\d[A-Z]/;

// ---- ONE-LETTER KEYS: all 26 used, frozen -----------------------------------------------------
export const ONE_LETTER_KEYS = Object.freeze({
    constant: 'C',
    notation: 'N',
    level: 'L',
    response: 'R',
    range: 'M',          // Max Number override
    decimals: 'D',
    wordform: 'W',
    regroup: 'G',
    orientation: 'O',
    unknown: 'U',
    simplestForm: 'S',
    pictures: 'P',
    band: 'B',
    // P9 place value + rounding
    step: 'T',
    dir: 'I',
    task: 'K',
    zeroPlace: 'Z',
    op: 'X',
    power: 'E',
    places: 'A',
    order: 'V',
    place: 'Q',
    midpoint: 'H',
    support: 'F',
    tiles: 'Y',
    // P11 K-2 counting: the last free letter.
    objects: 'J',
});

// ---- MULTI-CHARACTER KEYS: one digit block per wave --------------------------------------------
// `status`: 'assigned' (ids below), 'reserved' (the wave owns `keys` and fills in its ids when it
// merges — nobody else may take one), 'spare' (unallocated; claim a whole block here first).
export const KEY_BLOCKS = Object.freeze({
    0: Object.freeze({ owner: 'P9 place value (second wave)', status: 'assigned', keys: '0A-0Q' }),
    1: Object.freeze({ owner: 'P10 time and money', status: 'assigned', keys: '1A-1O' }),
    2: Object.freeze({ owner: 'count-by, patterns, multiplication chart', status: 'assigned', keys: '2A-2F' }),
    3: Object.freeze({ owner: 'function tables', status: 'assigned', keys: '3A-3A' }),
    4: Object.freeze({ owner: 'supports', status: 'assigned', keys: '4A-4D' }),
    5: Object.freeze({ owner: 'P12 every other family', status: 'assigned', keys: '5A-5M' }),
    6: Object.freeze({ owner: 'O2 easier / harder ladders (vocabulary, integers, geometry, graphs, algebra, number theory)', status: 'assigned', keys: '6A-6B' }),
    7: Object.freeze({ owner: 'option-panel round 3 (pools, function tables)', status: 'assigned', keys: '7A-7E' }),
    8: Object.freeze({ owner: 'word problems (word-work cell, 2026-09-25)', status: 'assigned', keys: '8A-8C' }),
    9: Object.freeze({ owner: 'O6 appearance lanes (AP1 9A-9E, AP2 9F-9J, AP3 9K-9O, AP4 9P-9T) and the options verifier (9U-9Z)', status: 'assigned', keys: '9A-9Z' }),
});

// SUB-RANGES (2026-09-25). All ten digit blocks are allocated, but most waves used only a few of
// their 26 letters. A later wave takes a SUB-RANGE of the unused letters inside an existing block:
// the block's own range and owner never change (they are pinned), the sub-range lies in the same
// digit, after the block's own keys, and never overlaps another sub-range. APPEND-ONLY, pinned by
// ws-codec-registry like everything else. A key is valid when it lies in its block's own range OR in
// a sub-range of that digit.
export const KEY_SUBRANGES = Object.freeze([
    Object.freeze({ keys: '3B-3M', owner: 'build lane k2 (BUILD_LIST.md)' }),
    Object.freeze({ keys: '3N-3Z', owner: 'build lane operations' }),
    Object.freeze({ keys: '4E-4O', owner: 'build lane placevalue' }),
    Object.freeze({ keys: '4P-4Z', owner: 'build lane algebra' }),
    Object.freeze({ keys: '6C-6P', owner: 'build lane fractions' }),
    Object.freeze({ keys: '2G-2T', owner: 'build lane geometry' }),
    Object.freeze({ keys: '7F-7S', owner: 'build lane measurement' }),
    Object.freeze({ keys: '7T-7Z', owner: 'build lane timemoney' }),
    Object.freeze({ keys: '8D-8O', owner: 'build lane data' }),
    Object.freeze({ keys: '8P-8Z', owner: 'build lane numtheory' }),
    Object.freeze({ keys: '5N-5Z', owner: 'lessons, support ladder and later waves' }),
]);

// Option id -> its multi-character key. APPEND-ONLY. Take the next letter of your OWN block.
export const MULTI_KEYS = Object.freeze({
    // Block 0 — P9 place value, rounding and estimation, step 8 (place-value-rounding.md §2.5)
    repeatDigit: '0A',   // identify: a repeated digit (747: which 7?)
    form: '0B',          // value: 700 / 7 hundreds / 7 x 100; expand: sum / expanded notation
    zeroDigit: '0C',     // value: may ask the value of a 0
    frame: '0D',         // expand: one box per place / a ruled line
    responseScope: '0E', // nearest_*: full / notation / decision / judge
    bins: '0F',          // round_sort_*: adjacent / one apart / three bins
    blank: '0G',         // rounding_table: a whole column / a whole row
    line: '0H',          // rounding_visual: dot plotted / pupil marks / ends only
    midLabel: '0J',      // rounding_visual: the midpoint labelled (hint H2)
    closeness: '0K',     // compare / order: far / close
    lengths: '0L',       // compare / order: equal / mixed digit counts
    count: '0M',         // order: how many numbers
    source: '0N',        // pv_digit_drag: word / expanded / numeral
    rename: '0P',        // unit_form: standard / more than 9 of one place
    span: '0Q',          // place_on_number_line: one ten / hundred / thousand to the next
    // NEXT FREE IN BLOCK 0: 0R.

    // Block 1 — P10 time and money (design/research/time-money.md §20). Its other options reuse
    // keys already allocated: response / dir / task / support / notation / step / order / tiles /
    // band (one letter), precision (5F), members (5A, with def tokens). 1D, 1K and 1M were
    // P10's pre-registry keys for precision, sign and members; none ever shipped, and they stay
    // unassigned rather than be handed out again.
    review: '1A',        // time reading: 1 in 6 items from the steps before
    stimulus: '1B',      // time reading: a clock / the time in words (three spoken forms)
    words: '1C',         // time_match_clock: the words said as numerals / past / oh
    hours: '1E',         // elapsed time: the longest time that passes (enum of minutes)
    noon: '1F',          // elapsed / order clocks: cross 12 noon
    currency: '1G',      // money: plain numbers / Qatari riyal / US dollar
    kind: '1H',          // money_count: like / two / mixed coins, notes, notes and coins
    values: '1I',        // money: which coins (a numeric set)
    paid: '1J',          // money_change: paid with the next unit / the next note
    gap: '1L',           // money_compare: far / near
    numerals: '1N',      // clocks: all 12 numerals / 12, 3, 6, 9 / 12 only
    // time_quarter: quarter past / quarter to. A SET, so it may not ride on `dir` (I): the deployed
    // decoder would read the unknown past / to tokens as an EMPTY set, i.e. "no restriction".
    quarters: '1O',
    // NEXT FREE IN BLOCK 1: 1P.

    // Block 2 — count by 1-12, number patterns, the multiplication chart, x / ÷ hop lines (2026-09-25)
    missing: '2A',       // count_by_tables, number_patterns_rule, mult_chart(_easy): % of numbers left blank
    pattern: '2B',       // number_patterns_rule: add / sub / double / times10 / grow
    rule: '2C',          // number_patterns_rule: the pupil writes the rule
    chart: '2D',         // mult_chart: a window / the whole chart
    ticks: '2E',         // nl_mult, nl_div: labels every step / every number
    shape: '2F',         // count_by_tables, number_patterns_rule, number_seq_fill: box / circle / hexagon
    // NEXT FREE IN BLOCK 2: 2G.

    // Block 3 — function tables (2026-09-25). Their other options reuse one-letter keys with value
    // tokens only (task, response, order: inorder, support); `ops` is its own key because the
    // deployed decoder would read an unknown `op` token as an EMPTY set (every operation).
    ops: '3A',           // function_table_easy / _hard: the operations a rule may use (+ − × ÷)
    // NEXT FREE IN BLOCK 3: 3B.

    // Block 4 — SUPPORTS (S2: `cover` and `mix` are live; `touch` is unused - touch dots are
    // values of the unified `support` set; `anchors` is the sheet-level S6 request field)
    touch: '4A',
    cover: '4B',
    mix: '4C',
    anchors: '4D',
    // NEXT FREE IN BLOCK 4: 4E.

    // Block 5 — P12 (were "XA"–"XM" before any of them shipped)
    members: '5A',       // mixed pools: which member skills / categories the pool draws from
    forms: '5B',         // which of a skill's item forms are dealt (a set of form numbers)
    denoms: '5C',        // fractions: which denominator families
    model: '5D',         // the picture model drawn (area / bar / circle / number line / none)
    labels: '5E',        // geometry, graphs: the labels drawn on a figure
    precision: '5F',     // time: to the hour / half / quarter / 5 min / 1 min
    coins: '5G',         // money: which coins
    shapes: '5H',        // geometry: which shapes
    points: '5I',        // data: how many data points / categories
    scale: '5J',         // data, measurement: the scale step
    digits: '5K',        // how many digits (area models, box division)
    units: '5L',         // measurement: which units
    parts: '5M',         // equal parts, or the parts a figure is split into
    // NEXT FREE IN BLOCK 5: 5N.

    // Block 6 — O2 easier / harder ladders (design/audit/OPTIONS-CRITIC-R2.md §5 #5, #13; 2026-09-25).
    // The other new ladders reuse `band` (B, a scalar: every number on the item, the answer too).
    wordSet: '6A',       // vocabulary: the first N words of the skill's list (the core words)
    most: '6B',          // graphs: the largest count one bar / row / mark may show
    // 6C-6P: build lane fractions (KEY_SUBRANGES).
    partLabels: '6C',    // fraction bars: each part labelled with its size (1/4), a hint
    lineHops: '6D',      // fraction number lines: an arc over each part from 0 to the dot, a hint
    barModel: '6E',      // a fraction of an amount / find the whole: the bar model with braces, a hint
    opArcs: '6F',        // equivalent fractions / simplify: operator arcs blank / with the value / none
    countLine: '6G',     // count in fractions: the number line over the row of counts (a hint)
    // NEXT FREE FOR LANE fractions: 6H (to 6P).

    // Block 7 — option-panel round 3 (design/audit/OPTIONS-CRITIC-R2.md §5 #7, #20)
    poolSize: '7A',      // mixed pools: every member one step easier / as set / harder
    poolSupport: '7B',   // mixed pools: every member's support level (2 / 1 / 0), or as set
    ftRules: '7C',       // function tables: the rule kinds, one- and two-step (was ops + step)
    ftTable: '7D',       // function tables: rows and the In-number order (was tiles + order)
    ftTask: '7E',        // function tables: the task, with or without a Check row (was task + response)
    // NEXT FREE IN BLOCK 7: 7F.

    // Block 8 — word problems: the keyword supports of the word-work cell (2026-09-25), all bools
    wpCues: '8A',        // bold + underline the key words in the story
    wpBank: '8B',        // the keyword bank box beside the story
    wpBar: '8C',         // a bar model with blank labels under the story
    // NEXT FREE IN BLOCK 8: 8D.

    // Block 9 — O6 appearance (2026-09-25). 9F-9J: lane AP2 (figures and data). Figure labels
    // ride on the reserved `labels` (5E).
    bars: '9F',          // bar graphs: bars standing up (vertical) / lying down (horizontal)
    // NEXT FREE FOR AP2: 9G (to 9J).
});

/** Every option id -> its key (one letter, or digit + letter). */
export const OPTION_KEYS = Object.freeze({ ...ONE_LETTER_KEYS, ...MULTI_KEYS });

// ---- VALUE TOKENS -----------------------------------------------------------------------------
// String values, one character each, unique within the option id (across every skill that uses
// it). APPEND-ONLY. `power` / `places` are numeric sets with members past 35, so they carry their
// own digit tokens (one per power of ten).
export const VALUE_TOKENS = Object.freeze({
    notation: Object.freeze({ stacked: 'S', across: 'A', bracket: 'B', fraction: 'F',
        // block 1 P10 elapsed_visual_*: the start and end shown on
        analog: 'G', digital: 'D', mixed: 'M' }),
    response: Object.freeze({ standard: 'S', 'which-numbers': 'W', 'array-builder': 'A', write: 'R', 'circle-all': 'C',
        // P9 step 8 identify
        circle: 'L', bank: 'B',
        // block 2 (2026-09-25): x / ÷ on a number line
        draw: 'Q', sentence: 'Z', missing: 'X',
        // block 3 (2026-09-25): a function table's Check row
        check: 'K',
        // block 1 P10 time + money (draw and write reuse Q and R)
        hm: 'H', minutes: 'T', ring: 'Y', sign: 'G' }),
    regroup: Object.freeze({ none: 'N', always: 'A', mixed: 'M' }),
    orientation: Object.freeze({ vertical: 'V', horizontal: 'H',
        // P11 count_objects arrangement
        rows: 'R', line: 'L', scattered: 'S' }),
    unknown: Object.freeze({ answer: 'A', first: 'F', second: 'S', mixed: 'M',
        // P9 step 8 more / less
        start: 'T' }),
    wordform: Object.freeze({ to_number: 'N', to_words: 'W' }),
    dir: Object.freeze({ more: 'M', less: 'L', both: 'B',
        // P11 counting / comparing
        fewer: 'F', same: 'S', mixed: 'X', forward: 'W', back: 'K',
        // block 1 P10 time + money (enums only)
        later: 'A', earlier: 'E', 'to-digital': 'G', 'to-analog': 'D' }),
    task: Object.freeze({ read: 'R', count: 'C', compute: 'P', closest: 'N', reasonable: 'E',
        // P11 compare_objects
        length: 'L', height: 'H', thickness: 'T', all: 'A',
        // block 2 (2026-09-25): the multiplication chart
        fill: 'Q', headers: 'Z', shade: 'X', pattern: 'J',
        // block 3 (2026-09-25): function tables (O U I W F D left to P10 and count-by)
        outputs: 'G', rule: 'Y', inputs: 'V', mixed: 'M', make: 'K',
        // block 1 P10 time + money (`all` reuses A)
        find: 'F', order: 'O', collection: 'D', words: 'W', missing: 'I', numerals: 'U', hands: 'B' }),
    zeroPlace: Object.freeze({ none: 'N', some: 'S', always: 'A' }),
    op: Object.freeze({ x: 'M', '/': 'D', both: 'B' }),
    order: Object.freeze({ largest: 'L', scrambled: 'S',
        // block 2 (2026-09-25): count by 1-12 rows
        inorder: 'Q', mixed: 'Z',
        // block 7 money_count: the coins set out, with the count-by-five dots on every page
        'largest-dots': 'D', 'scrambled-dots': 'T' }),
    midpoint: Object.freeze({ never: 'N', seeded: 'S', only: 'O' }),
    support: Object.freeze({ cut: 'C', line: 'L', none: 'N', labels: 'B', chart: 'T',
        // P11 operations hint pictures
        tile: 'D', frame: 'R', skip: 'K', array: 'A', think: 'H', bar: 'M',
        // P12 (the one-label caption; it had no token, so it could not travel in a link)
        label: 'E',
        // P9 step 8: the more/less chart strip, the x10 shift chart, the estimation rewrite line
        strip: 'P', shift: 'F', rewrite: 'W',
        // block 2 (2026-09-25): hop numbers on a x / ÷ number line
        numbers: 'Z',
        // block 1 P10 time + money: the minute ring, the time line's labels, the coin dots
        plain: 'Y', ring: 'G', pupil: 'U', auto: 'Q', dots: 'O',
        // block 7 function tables: the frame or line without the machine picture
        'frame-bare': 'S', 'line-bare': 'X',
        // S2 supports model: `support` became the ONE multi-select set of supports (an old one-cue
        // code, "~FD", decodes to that one tick). Touch dots (two rungs) and the S4 panes. The
        // letters left were I J V; the rest take digits (never a field's first character, so a
        // payload never starts with one).
        touch: 'V', touchall: '3', boxsign: 'J', startarrow: '4', steps: 'I',
        'round-pv': '1', 'round-mark': '2' }),
    // S2 supports model (block 4): which problems carry the supports, and how clashing ones mix.
    cover: Object.freeze({ whole: 'W', needed: 'N', fade: 'F' }),
    mix: Object.freeze({ section: 'S', problem: 'P' }),
    objects: Object.freeze({ shapes: 'S', pictures: 'P', frame: 'F', dice: 'D',
        // O6 AP1 (2026-09-25): teen_compose draws the ten as a rod and the ones as cubes
        blocks: 'B' }),
    // P12
    model: Object.freeze({ none: 'N', area: 'A', bar: 'B', circle: 'C', line: 'L', set: 'S', grid: 'G', blocks: 'K', analog: 'H', digital: 'D',
        // lane fractions: the fraction wall (bars one under the other)
        wall: 'W' }),
    labels: Object.freeze({ all: 'A', some: 'S', none: 'N' }),
    // lane fractions: operator arcs
    opArcs: Object.freeze({ blank: 'B', value: 'V', none: 'N' }),
    // block 9 (O6 appearance, AP2): bar graphs
    bars: Object.freeze({ vertical: 'V', horizontal: 'H' }),
    precision: Object.freeze({ hour: 'H', half: 'F', quarter: 'Q', five: 'V', one: 'O' }),
    coins: Object.freeze({ p: 'P', n: 'N', d: 'D', q: 'Q' }),
    units: Object.freeze({ metric: 'M', customary: 'C', mixed: 'X' }),
    // Numeric sets whose members are not all under 36: one digit per power of ten.
    // P9 step 8 (block 0)
    form: Object.freeze({ value: 'V', unit: 'U', notation: 'N', sum: 'S' }),
    frame: Object.freeze({ boxes: 'B', line: 'L' }),
    responseScope: Object.freeze({ full: 'F', notation: 'N', decision: 'D', judge: 'J' }),
    bins: Object.freeze({ adjacent: 'A', apart: 'P', three: 'T' }),
    blank: Object.freeze({ column: 'C', row: 'R' }),
    line: Object.freeze({ plotted: 'P', mark: 'M', ends: 'E' }),
    closeness: Object.freeze({ far: 'F', close: 'C', some: 'S' }),
    lengths: Object.freeze({ equal: 'E', mixed: 'M' }),
    source: Object.freeze({ word: 'W', expanded: 'E', numeral: 'N' }),
    rename: Object.freeze({ standard: 'S', more: 'M' }),
    // block 2 (2026-09-25)
    pattern: Object.freeze({ add: 'A', sub: 'S', double: 'D', times10: 'T', grow: 'G' }),
    chart: Object.freeze({ window: 'W', whole: 'F' }),
    ticks: Object.freeze({ step: 'S', one: 'O',
        // O6 appearance (lane AP3): "Numbers on the line" on + / − lines, drag-onto-the-line and read-the-line items
        some: 'M', ends: 'E' }),
    shape: Object.freeze({ box: 'B', circle: 'C', hex: 'H', mixed: 'M' }),
    // block 3 (2026-09-25)
    ops: Object.freeze({ '+': 'A', '-': 'S', x: 'M', '/': 'D' }),
    // block 7 (option-panel round 3)
    poolSize: Object.freeze({ easier: 'E', set: 'S', harder: 'H' }),
    ftRules: Object.freeze({ '+': 'A', '-': 'S', x: 'M', '/': 'D', 'x+': 'P', 'x-': 'N', '/+': 'Q', '/-': 'R' }),
    ftTask: Object.freeze({ outputs: 'G', 'outputs-check': 'H', rule: 'Y', 'rule-check': 'Z', inputs: 'V', 'inputs-check': 'W',
        mixed: 'M', 'mixed-check': 'N', make: 'K' }),
    // block 1 (P10 time + money)
    review: Object.freeze({ none: 'N', some: 'S' }),
    stimulus: Object.freeze({ clock: 'C', words: 'W', 'words-past': 'P', 'words-oh': 'O' }),
    words: Object.freeze({ numerals: 'M', past: 'P', oh: 'O' }),
    noon: Object.freeze({ never: 'N', seeded: 'S', across: 'A' }),
    currency: Object.freeze({ plain: 'P', qar: 'Q', usd: 'U' }),
    kind: Object.freeze({ like: 'L', two: 'T', mixed: 'M', notes: 'N', 'notes-coins': 'C', notes100: 'H', notes500: 'F',
        // block 7: notes / notes and coins totalled by "Totals to" (the old notes kinds fold into these)
        note: 'O', both: 'B' }),
    paid: Object.freeze({ unit: 'U', note: 'N' }),
    gap: Object.freeze({ far: 'F', near: 'N' }),
    numerals: Object.freeze({ all: 'A', quarters: 'Q', twelve: 'T' }),
    quarters: Object.freeze({ past: 'P', to: 'T' }),
    // `step` is a numeric SET on elapsed_mixed (15, 30, 45 minutes): 15 and 30 go base 36, 45 has
    // no one-character base-36 form and takes X.
    step: Object.freeze({ 45: 'X' }),
    power: Object.freeze({ 10: '1', 100: '2', 1000: '3' }),
    places: Object.freeze({ 1: '0', 10: '1', 100: '2', 1000: '3', 10000: '4', 100000: '5' }),
});

// Every member a numeric SET option takes on any skill, written as itself in base 36 (7 -> "7",
// 10 -> "A"). Listed so the union below is complete: a later string token may not take a
// character one of these already uses. APPEND a value here when a skill starts offering it.
export const NUMERIC_SET_VALUES = Object.freeze({
    constant: Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]),
    level: Object.freeze([0, 1, 2, 3]),
    step: Object.freeze([0, 1, 2, 15, 30]),
    dir: Object.freeze([0, 1]),
    task: Object.freeze([0, 1, 2, 3]),
    unknown: Object.freeze([0, 1, 2]),
    forms: Object.freeze([0, 1, 2, 3, 4]),
    denoms: Object.freeze([2, 3, 5, 7]),
    parts: Object.freeze([0, 1, 2]),
    shapes: Object.freeze([0, 1, 2, 3, 4]),
    points: Object.freeze([0, 1]),
    precision: Object.freeze([0, 1, 2, 3]),
    digits: Object.freeze([1, 2]),
    units: Object.freeze([0, 1, 2]),
    scale: Object.freeze([0, 1, 2, 3]),
    // block 1 (P10): the coins a money page uses
    values: Object.freeze([1, 5, 10, 25]),
});

// Option ids whose values are written as decimal digits (a numeric scalar) or 1 / 0 (a bool), or
// that carry their own tokens on the def: they have no one-character union table of their own.
export const SCALAR_ONLY = Object.freeze({
    range: 'decimal', decimals: 'decimal', band: 'decimal', tiles: 'decimal', place: 'decimal',
    simplestForm: 'bool', pictures: 'bool',
    // P9 step 8 (block 0)
    count: 'decimal', span: 'decimal', repeatDigit: 'bool', zeroDigit: 'bool', midLabel: 'bool',
    // block 2 (2026-09-25)
    missing: 'decimal', rule: 'bool',
    // block 1 (P10): the longest elapsed time, in minutes
    hours: 'decimal',
    // block 6 (O2 ladders)
    wordSet: 'decimal', most: 'decimal',
    // block 7: rows × 10 + order (31 … 52); a member support level 0-2
    ftTable: 'decimal', poolSupport: 'decimal',
    members: 'def-tokens',   // two base-36 characters per member: its position (skill-options-pools.js)
    // reserved ids (block 4): their values are allocated when they are built. (Pinned history:
    // `cover` and `mix` were built by S2 and now carry VALUE_TOKENS; `touch` rides in `support`.)
    touch: 'reserved', cover: 'reserved', mix: 'reserved', anchors: 'reserved',
    // block 8 (word problems)
    wpCues: 'bool', wpBank: 'bool', wpBar: 'bool',
    // lane fractions (6C-6P)
    partLabels: 'bool', lineHops: 'bool', barModel: 'bool', countLine: 'bool',
});

/**
 * The UNION token table of one option id: value -> character, for every string value and every
 * numeric set member. `{}` for an id in SCALAR_ONLY. Throws if two values share a character.
 */
export function tokenUnion(optId) {
    const out = {};
    const seen = {};
    const put = (v, t) => {
        if (seen[t] !== undefined && seen[t] !== String(v)) throw new Error(`skill-option-keys: ${optId} gives "${t}" to both ${seen[t]} and ${v}`);
        seen[t] = String(v);
        out[v] = t;
    };
    const own = VALUE_TOKENS[optId] || {};
    for (const [v, t] of Object.entries(own)) put(v, t);
    // power / places already token their numbers; the rest go base 36.
    if (!(optId === 'power' || optId === 'places')) {
        for (const n of NUMERIC_SET_VALUES[optId] || []) put(n, n.toString(36).toUpperCase());
    }
    return out;
}

/** Every option id the registry knows. */
export const OPTION_IDS = Object.freeze(Object.keys(OPTION_KEYS));
