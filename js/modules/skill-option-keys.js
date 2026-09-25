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
    0: Object.freeze({ owner: 'P9 place value (second wave)', status: 'reserved', keys: '0A-0Q' }),
    1: Object.freeze({ owner: 'P10 time and money', status: 'reserved', keys: '1A-1M' }),
    2: Object.freeze({ owner: 'count-by, patterns, multiplication chart', status: 'reserved', keys: '2A-2F' }),
    3: Object.freeze({ owner: 'function tables', status: 'reserved', keys: '' }),
    4: Object.freeze({ owner: 'supports', status: 'assigned', keys: '4A-4D' }),
    5: Object.freeze({ owner: 'P12 every other family', status: 'assigned', keys: '5A-5M' }),
    6: Object.freeze({ owner: '', status: 'spare', keys: '' }),
    7: Object.freeze({ owner: '', status: 'spare', keys: '' }),
    8: Object.freeze({ owner: '', status: 'spare', keys: '' }),
    9: Object.freeze({ owner: '', status: 'spare', keys: '' }),
});

// Option id -> its multi-character key. APPEND-ONLY. Take the next letter of your OWN block.
export const MULTI_KEYS = Object.freeze({
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
});

/** Every option id -> its key (one letter, or digit + letter). */
export const OPTION_KEYS = Object.freeze({ ...ONE_LETTER_KEYS, ...MULTI_KEYS });

// ---- VALUE TOKENS -----------------------------------------------------------------------------
// String values, one character each, unique within the option id (across every skill that uses
// it). APPEND-ONLY. `power` / `places` are numeric sets with members past 35, so they carry their
// own digit tokens (one per power of ten).
export const VALUE_TOKENS = Object.freeze({
    notation: Object.freeze({ stacked: 'S', across: 'A', bracket: 'B', fraction: 'F' }),
    response: Object.freeze({ standard: 'S', 'which-numbers': 'W', 'array-builder': 'A', write: 'R', 'circle-all': 'C' }),
    regroup: Object.freeze({ none: 'N', always: 'A', mixed: 'M' }),
    orientation: Object.freeze({ vertical: 'V', horizontal: 'H',
        // P11 count_objects arrangement
        rows: 'R', line: 'L', scattered: 'S' }),
    unknown: Object.freeze({ answer: 'A', first: 'F', second: 'S', mixed: 'M' }),
    wordform: Object.freeze({ to_number: 'N', to_words: 'W' }),
    dir: Object.freeze({ more: 'M', less: 'L', both: 'B',
        // P11 counting / comparing
        fewer: 'F', same: 'S', mixed: 'X', forward: 'W', back: 'K' }),
    task: Object.freeze({ read: 'R', count: 'C', compute: 'P', closest: 'N', reasonable: 'E',
        // P11 compare_objects
        length: 'L', height: 'H', thickness: 'T', all: 'A' }),
    zeroPlace: Object.freeze({ none: 'N', some: 'S', always: 'A' }),
    op: Object.freeze({ x: 'M', '/': 'D' }),
    order: Object.freeze({ largest: 'L', scrambled: 'S' }),
    midpoint: Object.freeze({ never: 'N', seeded: 'S', only: 'O' }),
    support: Object.freeze({ cut: 'C', line: 'L', none: 'N', labels: 'B', chart: 'T',
        // P11 operations hint pictures
        tile: 'D', frame: 'R', skip: 'K', array: 'A', think: 'H', bar: 'M',
        // P12 (the one-label caption; it had no token, so it could not travel in a link)
        label: 'E',
        // S2 supports model: `support` became the ONE multi-select set of supports (an old one-cue
        // code, "~FD", decodes to that one tick). Touch dots (two rungs) and the S4 panes.
        touch: 'P', touchall: 'Q', boxsign: 'X', startarrow: 'S', steps: 'U',
        'round-pv': 'O', 'round-mark': 'Z' }),
    // S2 supports model (block 4): which problems carry the supports, and how clashing ones mix.
    cover: Object.freeze({ whole: 'W', needed: 'N', fade: 'F' }),
    mix: Object.freeze({ section: 'S', problem: 'P' }),
    objects: Object.freeze({ shapes: 'S', pictures: 'P', frame: 'F', dice: 'D' }),
    // P12
    model: Object.freeze({ none: 'N', area: 'A', bar: 'B', circle: 'C', line: 'L', set: 'S', grid: 'G', blocks: 'K', analog: 'H', digital: 'D' }),
    labels: Object.freeze({ all: 'A', some: 'S', none: 'N' }),
    precision: Object.freeze({ hour: 'H', half: 'F', quarter: 'Q', five: 'V', one: 'O' }),
    coins: Object.freeze({ p: 'P', n: 'N', d: 'D', q: 'Q' }),
    units: Object.freeze({ metric: 'M', customary: 'C', mixed: 'X' }),
    // Numeric sets whose members are not all under 36: one digit per power of ten.
    power: Object.freeze({ 10: '1', 100: '2', 1000: '3' }),
    places: Object.freeze({ 1: '0', 10: '1', 100: '2', 1000: '3', 10000: '4', 100000: '5' }),
});

// Every member a numeric SET option takes on any skill, written as itself in base 36 (7 -> "7",
// 10 -> "A"). Listed so the union below is complete: a later string token may not take a
// character one of these already uses. APPEND a value here when a skill starts offering it.
export const NUMERIC_SET_VALUES = Object.freeze({
    constant: Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]),
    level: Object.freeze([0, 1, 2, 3]),
    step: Object.freeze([0, 1, 2]),
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
});

// Option ids whose values are written as decimal digits (a numeric scalar) or 1 / 0 (a bool), or
// that carry their own tokens on the def: they have no one-character union table of their own.
export const SCALAR_ONLY = Object.freeze({
    range: 'decimal', decimals: 'decimal', band: 'decimal', tiles: 'decimal', place: 'decimal',
    simplestForm: 'bool', pictures: 'bool',
    members: 'def-tokens',   // two base-36 characters per member: its position (skill-options-pools.js)
    // reserved ids (block 4): their values are allocated when they are built. (Pinned history:
    // `cover` and `mix` were built by S2 and now carry VALUE_TOKENS; `touch` rides in `support`.)
    touch: 'reserved', cover: 'reserved', mix: 'reserved', anchors: 'reserved',
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
