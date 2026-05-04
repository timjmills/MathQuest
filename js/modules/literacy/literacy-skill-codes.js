// literacy-skill-codes.js — Stub for unified ?code= URL extension.
//
// Extends Math Quest's existing skill-codes.js encoding scheme with a
// subject prefix character:
//
//   M:AB3-CD5|T300-N20-Gp-R100-D0   (Math — existing format, M: prefix optional)
//   R:EF7-GH2|T300-RB180             (Reading — new)
//   L:IJ4-KL9|T300-RB200             (Language — new)
//
// Phase 2 Stage 2 will integrate this with the existing skill-codes.js parser
// so that a single parseCode() call handles all three subject prefixes.
// For now this is a standalone stub with encode/decode helpers.
//
// Exports:
//   buildLiteracyCode(deckConfig)  → string
//   parseLiteracyCode(codeStr)     → { subject, skill_ids, settings } | null
//   SUBJECT_PREFIX                 → { math: 'M', reading: 'R', language: 'L' }

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Maps subject name → single-character URL prefix. */
export const SUBJECT_PREFIX = Object.freeze({
    math:     'M',
    reading:  'R',
    language: 'L',
});

/** Reverse map: prefix char → subject name. */
const PREFIX_TO_SUBJECT = Object.freeze({
    M: 'math',
    R: 'reading',
    L: 'language',
});

// ─── Settings token encoder / decoder ─────────────────────────────────────────
//
// Reuses Math Quest's token conventions (T, N, G, R, D) and adds literacy-only
// tokens (RB, GR, EL, SP, AU) per ARCHITECTURE.md §9.

const SETTINGS_ENCODERS = {
    timer:       v => v != null ? `T${v}` : null,
    count:       v => v != null ? `N${v}` : null,
    ritBand:     v => v != null ? `RB${v}` : null,     // e.g., RB180
    grade:       v => v != null ? `GR${v}` : null,     // e.g., GRK, GR2
    ellScaffold: v => v === true ? 'EL' : null,
    spedScaffold:v => v === true ? 'SP' : null,
    audioDefault:v => v === true ? 'AU' : null,
};

function _encodeSettings(settings) {
    if (!settings || typeof settings !== 'object') return '';
    const tokens = Object.entries(SETTINGS_ENCODERS)
        .map(([key, fn]) => fn(settings[key]))
        .filter(t => t != null);
    return tokens.join('-');
}

function _parseSettingsTokens(str) {
    if (!str) return {};
    const settings = {};
    for (const token of str.split('-')) {
        if (!token) continue;
        if (/^T(\d+)$/.test(token))   { settings.timer = parseInt(token.slice(1), 10); continue; }
        if (/^N(\d+)$/.test(token))   { settings.count = parseInt(token.slice(1), 10); continue; }
        if (/^RB(\d+)$/.test(token))  { settings.ritBand = parseInt(token.slice(2), 10); continue; }
        if (/^GR(.+)$/.test(token))   { settings.grade = token.slice(2); continue; }
        if (token === 'EL')            { settings.ellScaffold = true; continue; }
        if (token === 'SP')            { settings.spedScaffold = true; continue; }
        if (token === 'AU')            { settings.audioDefault = true; continue; }
        // Math Quest legacy tokens — preserved for round-trip compatibility
        if (/^G(.+)$/.test(token))    { settings.gameMode = token.slice(1); continue; }
        if (/^R(\d+)$/.test(token))   { settings.range = parseInt(token.slice(1), 10); continue; }
        if (/^D(\d+)$/.test(token))   { settings.decimalPlaces = parseInt(token.slice(1), 10); continue; }
    }
    return settings;
}

// ─── Skill pair encoder / decoder ─────────────────────────────────────────────
//
// Same compact format as Math Quest: 2-char base-36 skill code + 1-char weight.
// Literacy skill codes use the skill_id hashed to a 2-char base-36 key.
// Full code table lives in skill-codes.js for Math; literacy uses the same
// structure but in a separate namespace.
//
// For Phase 2 Stage 2, this will be unified with Math Quest's code table.
// For now, encode as raw skill_id strings (URL-encoded) separated by '-'.
// This produces longer URLs than Math Quest but is fully reversible without
// a lookup table.

const SKILL_ID_SEP = '.';  // separator within a skill pair token
const PAIR_SEP = '-';

function _encodeSkillPairs(skill_ids) {
    if (!Array.isArray(skill_ids) || skill_ids.length === 0) return '';
    return skill_ids.map(entry => {
        const id = typeof entry === 'string' ? entry : (entry.skill_id || entry.id || '');
        const w  = typeof entry === 'object' && entry.weight != null ? entry.weight : 1;
        // Encode skill_id as base64url to keep it compact in the URL
        const encoded = typeof btoa !== 'undefined'
            ? btoa(id).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
            : encodeURIComponent(id);
        return `${encoded}${SKILL_ID_SEP}${w}`;
    }).join(PAIR_SEP);
}

function _parseSkillPairs(str) {
    if (!str) return [];
    return str.split(PAIR_SEP).map(token => {
        const dotIdx = token.lastIndexOf(SKILL_ID_SEP);
        if (dotIdx === -1) {
            // No weight suffix — treat whole token as an encoded skill_id with weight 1
            const id = _decodeSkillId(token);
            return { skill_id: id, weight: 1 };
        }
        const encoded = token.slice(0, dotIdx);
        const weight  = parseInt(token.slice(dotIdx + 1), 10) || 1;
        const id      = _decodeSkillId(encoded);
        return { skill_id: id, weight };
    }).filter(e => e.skill_id);
}

function _decodeSkillId(encoded) {
    try {
        if (typeof atob !== 'undefined') {
            // Reverse base64url → base64 → original
            const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
            // Pad to multiple of 4
            const padded = b64 + '==='.slice(0, (4 - b64.length % 4) % 4);
            return atob(padded);
        }
    } catch (_) { /* fall through */ }
    return decodeURIComponent(encoded);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Encode a DeckConfig into a compact URL code string with subject prefix.
 *
 * @param {{
 *   subject: 'reading' | 'language' | 'math',
 *   skill_ids: Array<{ skill_id?: string, id?: string, weight?: number } | string>,
 *   settings?: object,
 * }} deckConfig
 * @returns {string} e.g., "R:EF7-GH2|T300-N20-RB180"
 */
export function buildLiteracyCode(deckConfig) {
    if (!deckConfig || typeof deckConfig !== 'object') return '';

    const subject = deckConfig.subject || 'reading';
    const prefix  = SUBJECT_PREFIX[subject] || 'R';

    const skillPart    = _encodeSkillPairs(deckConfig.skill_ids || []);
    const settingsPart = _encodeSettings(deckConfig.settings || {});

    const body = settingsPart ? `${skillPart}|${settingsPart}` : skillPart;
    return `${prefix}:${body}`;
}

/**
 * Decode a URL code string that may carry a subject prefix.
 *
 * @param {string} codeStr — e.g., "R:EF7-GH2|T300-N20-RB180" or legacy "AB3-CD5|T300"
 * @returns {{ subject: string, skill_ids: Array<{ skill_id: string, weight: number }>, settings: object } | null}
 *   Returns null only if the code is empty or unparseable.
 *   If no prefix, assumes 'math' for backward compatibility.
 */
export function parseLiteracyCode(codeStr) {
    if (!codeStr || typeof codeStr !== 'string') return null;

    const trimmed = codeStr.trim();
    if (!trimmed) return null;

    let subject = 'math';
    let rest    = trimmed;

    // Check for subject prefix (single letter + colon at start)
    const prefixMatch = /^([MRLmrl]):(.*)$/.exec(trimmed);
    if (prefixMatch) {
        const prefixChar = prefixMatch[1].toUpperCase();
        subject = PREFIX_TO_SUBJECT[prefixChar] || 'math';
        rest    = prefixMatch[2];
    }

    // Split skill pairs from settings tokens at the '|' boundary
    const pipeIdx = rest.indexOf('|');
    const skillPart    = pipeIdx >= 0 ? rest.slice(0, pipeIdx)  : rest;
    const settingsPart = pipeIdx >= 0 ? rest.slice(pipeIdx + 1) : '';

    const skill_ids = _parseSkillPairs(skillPart);
    const settings  = _parseSettingsTokens(settingsPart);

    return { subject, skill_ids, settings };
}

/**
 * Round-trip test: encode then decode a DeckConfig.
 * Returns true if the decoded skill_ids match the originals (weight-normalized).
 * Useful in unit tests and during Phase 2 integration verification.
 *
 * @param {object} deckConfig
 * @returns {boolean}
 */
export function verifyRoundTrip(deckConfig) {
    try {
        const code    = buildLiteracyCode(deckConfig);
        const decoded = parseLiteracyCode(code);
        if (!decoded) return false;
        if (decoded.subject !== deckConfig.subject) return false;
        const origIds   = (deckConfig.skill_ids || []).map(e =>
            typeof e === 'string' ? e : (e.skill_id || e.id || ''));
        const decodedIds = (decoded.skill_ids || []).map(e => e.skill_id);
        return origIds.every((id, i) => decodedIds[i] === id);
    } catch (_) {
        return false;
    }
}
