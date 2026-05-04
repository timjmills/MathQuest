// ufli-content.js — UFLI Foundations corpus loader.
//
// Wraps the auto-generated bundle at data/literacy-content/reading/ufli/bundle.js
// and exposes:
//   - getDecodablePassage(lessonNum)        → { text, paragraphs, heart_words, ... } | null
//   - getRollReadWords(lessonNum)           → string[] (deduped)
//   - getDecodablePassagesForSet(setKey)    → array of passages for that lesson set
//   - getRollReadWordsForSet(setKey)        → flat deduped string[] across all lessons
//   - getRollReadWordsForPattern(pattern)   → flat deduped string[] (pattern key map)
//   - getUfliIndex()                        → metadata index
//
// "setKey" is the literacy-fluency atom suffix (e.g., "set5" / "set9" / "set11").
// "patternKey" is the phonics atom infix (e.g., "short_a", "digraph_sh",
// "long_a_vce", "vowel_team_ai_ay").

import * as _bundle from '../../../data/literacy-content/reading/ufli/bundle.js';

const UFLI_DECODABLE     = _bundle.UFLI_DECODABLE     || {};
const UFLI_ROLL_READ     = _bundle.UFLI_ROLL_READ     || {};
const UFLI_HOME_PRACTICE = _bundle.UFLI_HOME_PRACTICE || {};
const UFLI_SLIDES        = _bundle.UFLI_SLIDES        || {};
const UFLI_INDEX         = _bundle.UFLI_INDEX         || {};

// ─── Set → lesson-range mapping ──────────────────────────────────────────────
//
// UFLI organizes 128 lessons into named sets. Fluency atoms reference these
// sets by short suffix; we map suffix → array of lesson keys present in
// the bundle.

const SET_FOLDERS = {
    set1:  'Lessons_A-J_Getting_Ready',         // PA / pre-alphabet
    set2:  'Lessons_01-34_Alphabet',            // letter-sound, CVC short vowels
    set3:  'Lessons_35-41_Alphabet_Review',
    set4:  'Lessons_42-53_Digraphs',
    set5:  'Lessons_42-53_Digraphs',            // alias used by fluency atoms (digraph passages)
    set6:  'Lessons_54-62_VCe',
    set7:  'Lessons_63-68',
    set8:  'Lessons_69-76',
    set9:  'Lessons_54-62_VCe',                 // alias (VCe passages, post-Lesson 70 → still VCe folder)
    set10: 'Lessons_77-83_R-Controlled_Vowels',
    set11: 'Lessons_84-88_Long_Vowel_Teams',    // vowel-team passages
    set12: 'Lessons_89-94_Other_Vowel_Teams',
    set13: 'Lessons_95-98_Diphthongs_Silent_Letters',
    set14: 'Lessons_99-106_Suffixes_Prefixes',
    set15: 'Lessons_107-110_Suffix_Spelling_Changes',
    set16: 'Lessons_111-118',
    set17: 'Lessons_119-128',
};

// Phonics atom infix → folder for word-bank lookup.
const PATTERN_FOLDERS = {
    // alphabet / short-vowel
    short_a:        'Lessons_01-34_Alphabet',
    short_e:        'Lessons_01-34_Alphabet',
    short_i:        'Lessons_01-34_Alphabet',
    short_o:        'Lessons_01-34_Alphabet',
    short_u:        'Lessons_01-34_Alphabet',
    alphabet:       'Lessons_01-34_Alphabet',
    alphabet_review: 'Lessons_35-41_Alphabet_Review',
    // digraphs
    digraph_sh:     'Lessons_42-53_Digraphs',
    digraph_ch:     'Lessons_42-53_Digraphs',
    digraph_th:     'Lessons_42-53_Digraphs',
    digraph_wh:     'Lessons_42-53_Digraphs',
    digraphs:       'Lessons_42-53_Digraphs',
    // VCe
    long_a_vce:     'Lessons_54-62_VCe',
    long_i_vce:     'Lessons_54-62_VCe',
    long_o_vce:     'Lessons_54-62_VCe',
    long_e_vce:     'Lessons_54-62_VCe',
    long_u_vce:     'Lessons_54-62_VCe',
    vce:            'Lessons_54-62_VCe',
    // r-controlled
    r_controlled:   'Lessons_77-83_R-Controlled_Vowels',
    // vowel teams
    vowel_team_ai_ay: 'Lessons_84-88_Long_Vowel_Teams',
    vowel_team_ee_ea: 'Lessons_84-88_Long_Vowel_Teams',
    vowel_team_oa_ow: 'Lessons_84-88_Long_Vowel_Teams',
    vowel_team_ie:    'Lessons_84-88_Long_Vowel_Teams',
    vowel_team_oo_long:  'Lessons_89-94_Other_Vowel_Teams',
    vowel_team_oo_short: 'Lessons_89-94_Other_Vowel_Teams',
    vowel_team_ue_ew:    'Lessons_89-94_Other_Vowel_Teams',
    vowel_team_igh:      'Lessons_89-94_Other_Vowel_Teams',
    long_vowel_teams: 'Lessons_84-88_Long_Vowel_Teams',
    other_vowel_teams: 'Lessons_89-94_Other_Vowel_Teams',
    // diphthongs & silent letters
    diphthong_oi_oy: 'Lessons_95-98_Diphthongs_Silent_Letters',
    diphthong_ou_ow: 'Lessons_95-98_Diphthongs_Silent_Letters',
    diphthong_au:    'Lessons_95-98_Diphthongs_Silent_Letters',
    diphthong_aw:    'Lessons_95-98_Diphthongs_Silent_Letters',
    diphthongs:      'Lessons_95-98_Diphthongs_Silent_Letters',
    // morphology
    morphology_basic:    'Lessons_99-106_Suffixes_Prefixes',
    morphology_advanced: 'Lessons_107-110_Suffix_Spelling_Changes',
};

// ─── Lazy lesson-set index ───────────────────────────────────────────────────
//
// Builds, on first access, a map of folderName → { decodableLessons[], rollReadLessons[] }
// from UFLI_INDEX so we don't repeatedly walk the full sets object.

let _setLessonCache = null;
function _setLessonsByFolder() {
    if (_setLessonCache) return _setLessonCache;
    _setLessonCache = {};
    const sets = (UFLI_INDEX && UFLI_INDEX.sets) || {};
    for (const folderName of Object.keys(sets)) {
        const decodable = [];
        const rollRead = [];
        const lessons = sets[folderName].lessons || {};
        for (const lessonKey of Object.keys(lessons)) {
            const files = lessons[lessonKey].files || {};
            if (files.decodable) decodable.push(lessonKey);
            if (files.roll_read) rollRead.push(lessonKey);
        }
        _setLessonCache[folderName] = { decodable, rollRead };
    }
    return _setLessonCache;
}

function _foldersForSet(setKey) {
    const folder = SET_FOLDERS[setKey];
    return folder ? [folder] : [];
}

function _foldersForPattern(patternKey) {
    const folder = PATTERN_FOLDERS[patternKey];
    return folder ? [folder] : [];
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Return a UFLI decodable passage by lesson number.
 * @param {number|string} lessonNum
 * @returns {{ lesson, pattern, text, paragraphs, heart_words, word_count, source_file, set } | null}
 */
export function getDecodablePassage(lessonNum) {
    const key = String(lessonNum);
    return UFLI_DECODABLE[key] || null;
}

/**
 * Return roll-and-read words for a UFLI lesson, deduped + cleaned.
 * @param {number|string} lessonNum
 * @returns {string[]}
 */
export function getRollReadWords(lessonNum) {
    const key = String(lessonNum);
    const entry = UFLI_ROLL_READ[key];
    if (!entry || !Array.isArray(entry.words)) return [];
    return Array.from(new Set(entry.words.map(w => w.toLowerCase()))).filter(Boolean);
}

/**
 * Return all UFLI decodable passages for a fluency set (e.g., "set5").
 * @param {string} setKey
 * @returns {Array}
 */
export function getDecodablePassagesForSet(setKey) {
    const folders = _foldersForSet(setKey);
    if (folders.length === 0) return [];
    const cache = _setLessonsByFolder();
    const out = [];
    for (const folder of folders) {
        const lessonKeys = (cache[folder] && cache[folder].decodable) || [];
        for (const k of lessonKeys) {
            const p = UFLI_DECODABLE[k];
            if (p) out.push(p);
        }
    }
    return out;
}

/**
 * Return roll-and-read words for a fluency set.
 * @param {string} setKey
 * @returns {string[]}
 */
export function getRollReadWordsForSet(setKey) {
    const folders = _foldersForSet(setKey);
    if (folders.length === 0) return [];
    const cache = _setLessonsByFolder();
    const all = new Set();
    for (const folder of folders) {
        const lessonKeys = (cache[folder] && cache[folder].rollRead) || [];
        for (const k of lessonKeys) {
            const e = UFLI_ROLL_READ[k];
            if (!e || !Array.isArray(e.words)) continue;
            for (const w of e.words) all.add(w.toLowerCase());
        }
    }
    return Array.from(all).filter(Boolean);
}

/**
 * Return all roll-and-read words across all lessons that fall under a
 * phonics atom's pattern key (e.g., "digraph_sh", "long_a_vce").
 * @param {string} patternKey
 * @returns {string[]}
 */
export function getRollReadWordsForPattern(patternKey) {
    const folders = _foldersForPattern(patternKey);
    if (folders.length === 0) return [];
    const cache = _setLessonsByFolder();
    const all = new Set();
    for (const folder of folders) {
        const lessonKeys = (cache[folder] && cache[folder].rollRead) || [];
        for (const k of lessonKeys) {
            const e = UFLI_ROLL_READ[k];
            if (!e || !Array.isArray(e.words)) continue;
            for (const w of e.words) all.add(w.toLowerCase());
        }
    }
    return Array.from(all).filter(Boolean);
}

/**
 * Return all UFLI decodable passages whose folder matches a phonics pattern.
 * @param {string} patternKey
 * @returns {Array}
 */
export function getDecodablePassagesForPattern(patternKey) {
    const folders = _foldersForPattern(patternKey);
    if (folders.length === 0) return [];
    const cache = _setLessonsByFolder();
    const out = [];
    for (const folder of folders) {
        const lessonKeys = (cache[folder] && cache[folder].decodable) || [];
        for (const k of lessonKeys) {
            const p = UFLI_DECODABLE[k];
            if (p) out.push(p);
        }
    }
    return out;
}

/**
 * Return a UFLI Home Practice sheet for a lesson (sample words, irregular
 * words, word chains, sentences).
 * @param {number|string} lessonNum
 */
export function getHomePractice(lessonNum) {
    const key = String(lessonNum);
    return UFLI_HOME_PRACTICE[key] || null;
}

/**
 * Return all UFLI word-work chains across lessons that fall under a phonics
 * pattern. Each chain is an ordered string[] (e.g., ["fell","tell","sell","spell"]).
 * @param {string} patternKey
 * @returns {string[][]}
 */
export function getWordChainsForPattern(patternKey) {
    const folders = _foldersForPattern(patternKey);
    if (folders.length === 0) return [];
    const cache = _setLessonsByFolder();
    const out = [];
    for (const folder of folders) {
        const lessonKeys = Object.keys(UFLI_HOME_PRACTICE).filter(k => {
            const hp = UFLI_HOME_PRACTICE[k];
            return hp && hp.set === folder;
        });
        for (const k of lessonKeys) {
            const hp = UFLI_HOME_PRACTICE[k];
            if (hp && Array.isArray(hp.word_chains)) {
                for (const chain of hp.word_chains) out.push(chain);
            }
        }
        // Suppress unused 'cache' warning while keeping consistent traversal pattern
        void cache[folder];
    }
    return out;
}

/**
 * Return all UFLI sample (heart/concept) words for a phonics pattern.
 * @param {string} patternKey
 */
export function getSampleWordsForPattern(patternKey) {
    const folders = _foldersForPattern(patternKey);
    if (folders.length === 0) return [];
    const all = new Set();
    for (const k of Object.keys(UFLI_HOME_PRACTICE)) {
        const hp = UFLI_HOME_PRACTICE[k];
        if (!hp || !folders.includes(hp.set)) continue;
        for (const w of hp.sample_words || []) all.add(w.toLowerCase());
    }
    return Array.from(all).filter(Boolean);
}

/**
 * Return all UFLI sentences (one per item) for a phonics pattern.
 * Useful for sentence-level fluency atoms.
 * @param {string} patternKey
 */
export function getSentencesForPattern(patternKey) {
    const folders = _foldersForPattern(patternKey);
    if (folders.length === 0) return [];
    const all = [];
    for (const k of Object.keys(UFLI_HOME_PRACTICE)) {
        const hp = UFLI_HOME_PRACTICE[k];
        if (!hp || !folders.includes(hp.set)) continue;
        for (const s of hp.sentences || []) all.push(s);
    }
    return all;
}

/**
 * Return UFLI slide deck metadata for a lesson (titles + flat text per slide).
 * Slides are the teacher-led intro deck — useful for instruction phrasing.
 * @param {number|string} lessonNum
 */
export function getSlideDeck(lessonNum) {
    const key = String(lessonNum);
    return UFLI_SLIDES[key] || null;
}

/** Return the entire master UFLI index (frozen). */
export function getUfliIndex() {
    return UFLI_INDEX;
}

/**
 * Quick stats — useful for the skill browser and dashboards.
 * @returns {{ decodableCount, rollReadCount, homePracticeCount, slidesCount, setCount }}
 */
export function getUfliStats() {
    return {
        decodableCount:    Object.keys(UFLI_DECODABLE).length,
        rollReadCount:     Object.keys(UFLI_ROLL_READ).length,
        homePracticeCount: Object.keys(UFLI_HOME_PRACTICE).length,
        slidesCount:       Object.keys(UFLI_SLIDES).length,
        setCount:          Object.keys((UFLI_INDEX && UFLI_INDEX.sets) || {}).length,
    };
}
