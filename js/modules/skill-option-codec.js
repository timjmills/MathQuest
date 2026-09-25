// skill-option-codec.js — how a skill's chosen options travel inside a share code.
//
// Owner, 2026-09-24: "On the quick links that you send to students the skill options need to be
// available ... so that you can pick specific things like only work on multiplying 8s and 7s in the
// mixed skill code and mixed skill print. Right now it's all or nothing."
//
// Every share form names skills one at a time, so the options ride on the skill they belong to as an
// OPTIONAL SUFFIX. The full format is in design/SHARE_CODES.md; in short:
//
//     <skill reference>[~<payload>]          payload = field ( "_" field )*
//                                            field   = KEY value      (KEY is one letter)
//
//   EA~C78            mult_facts, fact set {7, 8}                         (2-char skill code)
//   EA3~C78_NA        ... weight 3, written across                        (weight digits sit before ~)
//   T00~C78           the same skill in an MX- mixed code                 (category letter + position)
//   T00403M~C78       the same skill in a 7-char settings code
//
// WHY IT IS BACKWARD COMPATIBLE BOTH WAYS
//   - A code without "~" is a code with every option at its default, which is exactly what it
//     generated before this existed. Old codes therefore decode byte-for-byte as they did.
//   - Only what DIFFERS from the default is written (packOptions), so a skill at its defaults
//     produces the old code exactly and nothing that is shared today changes shape.
//   - The pre-existing parsers read a skill part as "2 chars + digits": "EA~C78" still yields EA,
//     and parseInt('~C78') is NaN -> weight 0, which is what they did with no weight. An old app
//     opening a new code gets the right skills with default options, never the wrong skill.
//
// CHARACTERS. A-Z 0-9 plus "~" and "_" only: all four share parsers upper-case the code and split
// on "-", "|" and ".", and none of those may appear inside a payload. "~" and "_" are unreserved in
// URLs (RFC 3986), so a link carrying options needs no percent-escaping.
//
// VERSIONING. A payload whose first character is a DIGIT names a later format version. This is
// version 1, which has no version digit (it is the compact common case). A decoder that meets a
// version it does not know ignores the whole payload — the skill loads at its defaults — rather than
// misreading it. Unknown KEYS inside a v1 payload are skipped, so a later option can be added to v1
// without a version bump. Values are written BY VALUE, never by list position, so an option can gain
// values later without moving any existing code.
import { optionsFor, normalizeOptions, packOptions } from './skill-options.js';

export const OPTION_PAYLOAD_VERSION = 1;

// Option id -> its one-letter key. APPEND-ONLY: a key, once shipped, means that option for ever.
export const OPTION_KEYS = {
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
    // P9 place value + rounding (2026-09-25)
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
    // P11 K-2 counting (2026-09-25): the last free letter.
    objects: 'J',

    // ---- EXTENDED KEYS: "X" + a second letter (P12, 2026-09-25) --------------------------------
    // The alphabet ran out at `objects`. An extended key is TWO characters, "X" followed by a
    // letter, which gives 26 more keys (XA … XZ) without a format version bump. It is backward
    // compatible both ways:
    //   - An old decoder reads "XA…" as a field for `op` (the one-letter X). Every skill that is
    //     not place_value_10x has no `op`, so the field is skipped as unknown; and no skill may
    //     declare both `op` and an extended option (assertExtendedKeys below lists offenders, and
    //     the encoder refuses to write one), so place_value_10x never sees one. The skill loads
    //     with that option at its default, which is what an old app should do.
    //   - This decoder reads a field that starts with "X" as `op` when the skill declares `op`,
    //     and as an extended key otherwise, so every code written before P12 decodes exactly as
    //     it did (ws-code-snapshot).
    // APPEND-ONLY, like the one-letter keys. When XA … XZ run out, the next escape is "XX" + a
    // letter, read the same way ("XX" is never itself assigned below, so it stays free for that).
    members: 'XA',       // mixed pools: which member skills / categories the pool draws from
    forms: 'XB',         // which of a skill's item forms are dealt (a set of form numbers)
    denoms: 'XC',        // fractions: which denominators
    model: 'XD',         // the picture model drawn (area / bar / circle / number line / none)
    labels: 'XE',        // geometry, graphs: the labels drawn on a figure
    precision: 'XF',     // time: to the hour / half / quarter / 5 min / 1 min
    coins: 'XG',         // money: which coins
    shapes: 'XH',        // geometry: which shapes
    points: 'XI',        // data: how many data points / categories
    scale: 'XJ',         // data, measurement: the scale step
    digits: 'XK',        // how many digits (area models, box division)
    units: 'XL',         // measurement: which units
    parts: 'XM',         // equal parts (halves / thirds / fourths), or the parts a figure is split into
};
const KEY_TO_OPTION = Object.fromEntries(Object.entries(OPTION_KEYS).map(([id, k]) => [k, id]));
/** True for a two-character extended key (see above). */
const _isExtendedKey = (k) => typeof k === 'string' && k.length === 2 && k[0] === 'X';

// String values get a one-letter token per option. APPEND-ONLY, unique within an option.
// Integer values are written as themselves: base 36, one character, inside a set ({7, 8} -> "78",
// {10, 11} -> "AB"); decimal digits for a single enum / int value (Max Number 1,000 -> "1000").
export const VALUE_TOKENS = {
    notation: { stacked: 'S', across: 'A', bracket: 'B', fraction: 'F' },
    response: { standard: 'S', 'which-numbers': 'W', 'array-builder': 'A', write: 'R', 'circle-all': 'C' },
    regroup: { none: 'N', always: 'A', mixed: 'M' },
    orientation: { vertical: 'V', horizontal: 'H',
        // P11 count_objects arrangement (appended)
        rows: 'R', line: 'L', scattered: 'S' },
    unknown: { answer: 'A', first: 'F', second: 'S', mixed: 'M' },
    wordform: { to_number: 'N', to_words: 'W' },
    dir: { more: 'M', less: 'L', both: 'B',
        // P11 counting / comparing (appended)
        fewer: 'F', same: 'S', mixed: 'X', forward: 'W', back: 'K' },
    task: { read: 'R', count: 'C', compute: 'P', closest: 'N', reasonable: 'E',
        // P11 compare_objects (appended)
        length: 'L', height: 'H', thickness: 'T', all: 'A' },
    zeroPlace: { none: 'N', some: 'S', always: 'A' },
    op: { x: 'M', '/': 'D' },
    order: { largest: 'L', scrambled: 'S' },
    midpoint: { never: 'N', seeded: 'S', only: 'O' },
    support: { cut: 'C', line: 'L', none: 'N', labels: 'B', chart: 'T',
        // P11 operations hint pictures (appended)
        tile: 'D', frame: 'R', skip: 'K', array: 'A', think: 'H', bar: 'M' },
    objects: { shapes: 'S', pictures: 'P', frame: 'F', dice: 'D' },
    // P12 (appended). String-valued P12 options; numeric ones are written as themselves.
    model: { none: 'N', area: 'A', bar: 'B', circle: 'C', line: 'L', set: 'S', grid: 'G', blocks: 'K', analog: 'H', digital: 'D' },
    labels: { all: 'A', some: 'S', none: 'N' },
    precision: { hour: 'H', half: 'F', quarter: 'Q', five: 'V', one: 'O' },
    coins: { p: 'P', n: 'N', d: 'D', q: 'Q' },
    units: { metric: 'M', customary: 'C', mixed: 'X' },
    // Numeric sets whose members are not all under 36: one digit per power of ten.
    power: { 10: '1', 100: '2', 1000: '3' },
    places: { 1: '0', 10: '1', 100: '2', 1000: '3', 10000: '4', 100000: '5' },
};

// A def may carry its OWN tokens (`def.tokens`: value -> token, every token `def.tokenWidth`
// characters). P12 uses it for a mixed pool's `members`, whose values are skill ids: each is
// written as its position in SKILLS[category] in two base-36 characters, which is stable
// because a skill is never spliced out of its category (CLAUDE.md), only tombstoned.
function _defToken(def, v) {
    return def && def.tokens && Object.prototype.hasOwnProperty.call(def.tokens, v) ? def.tokens[v] : null;
}

function _defsHave(categoryId, skillId, id) {
    return optionsFor(categoryId, skillId).some(d => d.id === id);
}

/**
 * The skills that break the extended-key rule: a skill that declares `op` AND an option with an
 * extended ("X" + letter) key. An old decoder would read the extended field as `op` there, so the
 * encoder never writes it; this lists offenders so a gate can fail loudly. Empty when the rule holds.
 * `skillRefs` is a list of [categoryId, skillId].
 */
export function assertExtendedKeys(skillRefs) {
    const bad = [];
    for (const [categoryId, skillId] of skillRefs) {
        const defs = optionsFor(categoryId, skillId);
        if (!defs.some(d => d.id === 'op')) continue;
        const ext = defs.filter(d => _isExtendedKey(OPTION_KEYS[d.id])).map(d => d.id);
        if (ext.length) bad.push(`${categoryId}:${skillId} declares op and ${ext.join(', ')}`);
    }
    return bad;
}

function _setToken(optId, v) {
    const own = VALUE_TOKENS[optId] && VALUE_TOKENS[optId][v];
    if (own) return own;
    if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 36) return v.toString(36).toUpperCase();
    const t = VALUE_TOKENS[optId] && VALUE_TOKENS[optId][v];
    if (t) return t;
    throw new Error(`skill-option-codec: no one-character token for ${optId}=${JSON.stringify(v)}`);
}

function _scalarToken(optId, v) {
    if (typeof v === 'number' && Number.isInteger(v) && v >= 0) return String(v);
    const t = VALUE_TOKENS[optId] && VALUE_TOKENS[optId][v];
    if (t) return t;
    throw new Error(`skill-option-codec: no token for ${optId}=${JSON.stringify(v)}`);
}

function _fromToken(optId, def, tok, inSet) {
    const tokens = VALUE_TOKENS[optId];
    if (tokens) {
        const hit = Object.entries(tokens).find(([, t]) => t === tok);
        // A numeric set's token map is keyed by the number (object keys are strings).
        if (hit) return /^\d+$/.test(hit[0]) && (def.values || []).some(x => x.v === Number(hit[0])) ? Number(hit[0]) : hit[0];
    }
    const n = inSet ? parseInt(tok, 36) : (/^\d+$/.test(tok) ? parseInt(tok, 10) : NaN);
    return Number.isFinite(n) ? n : undefined;
}

/**
 * The payload for a skill's options, WITHOUT the leading "~": '' when every option is at its
 * default (so the skill's code is exactly the old code). Options the skill does not declare, and
 * values with no token, are left out rather than written wrongly.
 */
export function encodeOptionPayload(categoryId, skillId, opts) {
    const packed = packOptions(categoryId, skillId, opts);
    const fields = [];
    for (const def of optionsFor(categoryId, skillId)) {
        if (!(def.id in packed)) continue;
        const key = OPTION_KEYS[def.id];
        if (!key) continue;
        // An extended key on a skill that also declares `op` would be read as `op` by an old
        // decoder, so it is never written (see OPTION_KEYS and assertExtendedKeys).
        if (_isExtendedKey(key) && _defsHave(categoryId, skillId, 'op')) continue;
        const v = packed[def.id];
        try {
            if (def.type === 'set') {
                const order = (def.values || []).map(x => x.v);
                const list = (Array.isArray(v) ? v : []).slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
                if (def.tokens) {
                    const toks = list.map(x => _defToken(def, x));
                    if (toks.some(t => t === null)) continue;
                    fields.push(key + toks.join(''));
                    continue;
                }
                fields.push(key + list.map(x => _setToken(def.id, x)).join(''));
            } else if (def.type === 'bool') {
                fields.push(key + (v ? '1' : '0'));
            } else if (v !== null && v !== undefined && def.tokens) {
                const t = _defToken(def, v);
                if (t !== null) fields.push(key + t);
            } else if (v !== null && v !== undefined) {
                fields.push(key + _scalarToken(def.id, v));
            }
        } catch (e) { /* an unencodable value stays at its default rather than corrupting the code */ }
    }
    return fields.join('_');
}

/** "~" + payload, or '' — the form every share-code writer appends to a skill reference. */
export function optionSuffix(categoryId, skillId, opts) {
    const p = encodeOptionPayload(categoryId, skillId, opts);
    return p ? '~' + p : '';
}

/**
 * Decode a payload (with or without its leading "~") into the skill's PACKED options — only the
 * values that differ from the defaults, normalised, so nothing impossible can come out of a
 * hand-edited link. An unknown version returns {} (the skill's defaults).
 */
export function decodeOptionPayload(categoryId, skillId, payload) {
    let p = String(payload == null ? '' : payload).trim().toUpperCase();
    if (p.startsWith('~')) p = p.slice(1);
    if (!p) return {};
    if (/^\d/.test(p)) return {};             // a later format version: ignore, never misread
    const defs = optionsFor(categoryId, skillId);
    const raw = {};
    const hasOp = defs.some(d => d.id === 'op');
    for (const field of p.split('_')) {
        if (!field) continue;
        // "X" is `op` on a skill that declares it; on every other skill it opens a two-character
        // extended key (OPTION_KEYS, P12).
        const keyLen = field[0] === 'X' && !hasOp && field.length >= 2 ? 2 : 1;
        const optId = KEY_TO_OPTION[field.slice(0, keyLen)];
        const def = optId && defs.find(d => d.id === optId);
        if (!def) continue;                    // an option this skill (or this app) does not know
        const body = field.slice(keyLen);
        if (def.tokens) {
            const w = def.tokenWidth || 1;
            const byTok = {};
            for (const [v, t] of Object.entries(def.tokens)) byTok[String(t).toUpperCase()] = v;
            const back = (t) => {
                const v = byTok[t];
                return v === undefined ? undefined : (def.values || []).map(x => x.v).find(x => String(x) === v);
            };
            if (def.type === 'set') {
                const out = [];
                for (let i = 0; i + w <= body.length; i += w) { const v = back(body.slice(i, i + w)); if (v !== undefined) out.push(v); }
                raw[optId] = out;
            } else {
                const v = back(body);
                if (v !== undefined) raw[optId] = v;
            }
            continue;
        }
        if (def.type === 'set') {
            raw[optId] = [...body].map(t => _fromToken(optId, def, t, true)).filter(v => v !== undefined);
        } else if (def.type === 'bool') {
            raw[optId] = body === '1';
        } else {
            const v = _fromToken(optId, def, body, false);
            if (v !== undefined) raw[optId] = v;
        }
    }
    return packOptions(categoryId, skillId, normalizeOptions(categoryId, skillId, raw));
}

/**
 * Split one skill part of a code into its reference and its option payload:
 *   "EA3~C78" -> { head: "EA3", payload: "C78" }      "EA" -> { head: "EA", payload: "" }
 */
export function splitOptionSuffix(part) {
    const s = String(part == null ? '' : part);
    const at = s.indexOf('~');
    return at === -1 ? { head: s, payload: '' } : { head: s.slice(0, at), payload: s.slice(at + 1) };
}
