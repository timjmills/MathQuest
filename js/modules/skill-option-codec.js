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
//                                            field   = KEY value      (KEY: one letter, or a
//                                                                        digit + letter, see
//                                                                        skill-option-keys.js)
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
// values later without moving any existing code. A multi-character key (digit + letter) is such an
// unknown key to the deployed decoder; the encoder writes those fields LAST, behind a leading empty
// field when there is no one-letter field ("~_5A12"), so the payload never starts with a digit.
import { optionsFor, normalizeOptions, packOptions } from './skill-options.js';
import { OPTION_KEYS, VALUE_TOKENS, MULTI_KEY_RE } from './skill-option-keys.js';

export const OPTION_PAYLOAD_VERSION = 1;

// The keys and value tokens live in ONE registry, skill-option-keys.js: the 26 one-letter keys,
// the digit + letter keys (one digit block per wave), and every option id's union token table.
// Re-exported so existing callers keep importing them from here.
export { OPTION_KEYS, VALUE_TOKENS };
const KEY_TO_OPTION = Object.fromEntries(Object.entries(OPTION_KEYS).map(([id, k]) => [k, id]));
/** True for a multi-character (digit + letter) key. */
const _isMultiKey = (k) => typeof k === 'string' && k.length === 2 && MULTI_KEY_RE.test(k);

// A def may carry its OWN tokens (`def.tokens`: value -> token, every token `def.tokenWidth`
// characters). P12 uses it for a mixed pool's `members`, whose values are skill ids: each is
// written as its position in SKILLS[category] in two base-36 characters, which is stable
// because a skill is never spliced out of its category (CLAUDE.md), only tombstoned.
function _defToken(def, v) {
    return def && def.tokens && Object.prototype.hasOwnProperty.call(def.tokens, v) ? def.tokens[v] : null;
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
    const fields = [];      // one-letter fields
    const multi = [];       // digit + letter fields, written after them
    for (const def of optionsFor(categoryId, skillId)) {
        if (!(def.id in packed)) continue;
        const key = OPTION_KEYS[def.id];
        if (!key) continue;
        const out = _isMultiKey(key) ? multi : fields;
        const v = packed[def.id];
        try {
            if (def.type === 'set') {
                const order = (def.values || []).map(x => x.v);
                const list = (Array.isArray(v) ? v : []).slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
                if (def.tokens) {
                    const toks = list.map(x => _defToken(def, x));
                    if (toks.some(t => t === null)) continue;
                    out.push(key + toks.join(''));
                    continue;
                }
                out.push(key + list.map(x => _setToken(def.id, x)).join(''));
            } else if (def.type === 'bool') {
                out.push(key + (v ? '1' : '0'));
            } else if (v !== null && v !== undefined && def.tokens) {
                const t = _defToken(def, v);
                if (t !== null) out.push(key + t);
            } else if (v !== null && v !== undefined) {
                out.push(key + _scalarToken(def.id, v));
            }
        } catch (e) { /* an unencodable value stays at its default rather than corrupting the code */ }
    }
    if (!multi.length) return fields.join('_');
    // A payload may not START with a digit: the deployed decoder reads that as a later format
    // version and drops every option. With no one-letter field in front, a leading EMPTY field
    // keeps the first character "_" ("~_5A12"), which every decoder skips.
    return fields.length ? fields.concat(multi).join('_') : '_' + multi.join('_');
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
    for (const field of p.split('_')) {
        if (!field) continue;                  // the leading empty field of "~_5A…"
        // A digit then a letter is a multi-character key (skill-option-keys.js); else one letter.
        const keyLen = MULTI_KEY_RE.test(field) ? 2 : 1;
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
