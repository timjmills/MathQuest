// phoneme-tts.js — Speak English phonemes as sounds (not letter names) using
// the Web Speech API.
//
// Web Speech can't reliably pronounce isolated IPA characters or single
// letters as phonemes — speaking 'b' will say "bee", speaking 'k' says "kay".
// This module provides:
//   1. A canonical IPA → spoken-approximation map for all 44 English phonemes,
//      designed so Web Speech pronounces each one correctly as a sound.
//   2. Per-phoneme example words ("/b/ as in bat") for K-2 phonemic awareness.
//   3. Sequential playback for sound segmenting ("cat" → /k/ /æ/ /t/).
//   4. A word → phoneme decomposition table for the most common K-2 words.
//
// All speech goes through Math Quest's existing hints-speech.js infrastructure
// (Web Speech API with voice warming + cancel-stall workarounds).

import { state } from '../state.js';

// ─── The 44 English phonemes ──────────────────────────────────────────────────
//
// Each entry maps:
//   ipa:        canonical IPA notation (the lookup key)
//   tts:        the string to feed the speech synthesizer; chosen so TTS
//               pronounces it phonetically as the sound, not as letter names
//   example:    a familiar word starting with this phoneme (for K-2 prompts:
//               "/b/ as in ball")
//   description: human-readable description (for tooltips, captions)

export const PHONEMES = Object.freeze({
    // ─── 24 consonants ────────────────────────────────────────────────────────
    'b':   { ipa: '/b/',   tts: 'buh',    example: 'ball',     description: 'b as in ball' },
    'd':   { ipa: '/d/',   tts: 'duh',    example: 'dog',      description: 'd as in dog' },
    'f':   { ipa: '/f/',   tts: 'ffff',   example: 'fish',     description: 'f as in fish' },
    'g':   { ipa: '/g/',   tts: 'guh',    example: 'goat',     description: 'g as in goat' },
    'h':   { ipa: '/h/',   tts: 'huh',    example: 'hat',      description: 'h as in hat' },
    'dʒ':  { ipa: '/dʒ/',  tts: 'juh',    example: 'jam',      description: 'j as in jam' },
    'k':   { ipa: '/k/',   tts: 'kuh',    example: 'cat',      description: 'k as in cat' },
    'l':   { ipa: '/l/',   tts: 'lll',    example: 'lion',     description: 'l as in lion' },
    'm':   { ipa: '/m/',   tts: 'mmm',    example: 'moon',     description: 'm as in moon' },
    'n':   { ipa: '/n/',   tts: 'nnn',    example: 'nest',     description: 'n as in nest' },
    'p':   { ipa: '/p/',   tts: 'puh',    example: 'pig',      description: 'p as in pig' },
    'r':   { ipa: '/r/',   tts: 'rrr',    example: 'rain',     description: 'r as in rain' },
    's':   { ipa: '/s/',   tts: 'sss',    example: 'sun',      description: 's as in sun' },
    't':   { ipa: '/t/',   tts: 'tuh',    example: 'top',      description: 't as in top' },
    'v':   { ipa: '/v/',   tts: 'vvv',    example: 'van',      description: 'v as in van' },
    'w':   { ipa: '/w/',   tts: 'wuh',    example: 'water',    description: 'w as in water' },
    'j':   { ipa: '/j/',   tts: 'yuh',    example: 'yes',      description: 'y as in yes' },
    'z':   { ipa: '/z/',   tts: 'zzz',    example: 'zoo',      description: 'z as in zoo' },
    'ʃ':   { ipa: '/ʃ/',   tts: 'shh',    example: 'ship',     description: 'sh as in ship' },
    'ʒ':   { ipa: '/ʒ/',   tts: 'zhh',    example: 'measure',  description: 'zh as in measure' },
    'tʃ':  { ipa: '/tʃ/',  tts: 'chuh',   example: 'chair',    description: 'ch as in chair' },
    'θ':   { ipa: '/θ/',   tts: 'thhh',   example: 'thin',     description: 'th as in thin (voiceless)' },
    'ð':   { ipa: '/ð/',   tts: 'thuhh',  example: 'this',     description: 'th as in this (voiced)' },
    'ŋ':   { ipa: '/ŋ/',   tts: 'nguh',   example: 'sing',     description: 'ng as in sing' },

    // ─── 5 short vowels ───────────────────────────────────────────────────────
    'æ':   { ipa: '/æ/',   tts: 'aaa',    example: 'apple',    description: 'short a as in apple' },
    'ɛ':   { ipa: '/ɛ/',   tts: 'ehh',    example: 'egg',      description: 'short e as in egg' },
    'ɪ':   { ipa: '/ɪ/',   tts: 'ihh',    example: 'igloo',    description: 'short i as in igloo' },
    'ɒ':   { ipa: '/ɒ/',   tts: 'ahh',    example: 'octopus',  description: 'short o as in octopus' },
    'ʌ':   { ipa: '/ʌ/',   tts: 'uhh',    example: 'umbrella', description: 'short u as in umbrella' },

    // ─── 5 long vowels ────────────────────────────────────────────────────────
    'eɪ':  { ipa: '/eɪ/',  tts: 'ay',     example: 'ape',      description: 'long a as in ape' },
    'iː':  { ipa: '/iː/',  tts: 'eee',    example: 'eat',      description: 'long e as in eat' },
    'aɪ':  { ipa: '/aɪ/',  tts: 'eye',    example: 'ice',      description: 'long i as in ice' },
    'oʊ':  { ipa: '/oʊ/',  tts: 'oh',     example: 'open',     description: 'long o as in open' },
    'uː':  { ipa: '/uː/',  tts: 'oo',     example: 'unicorn',  description: 'long u as in unicorn' },

    // ─── R-controlled vowels ──────────────────────────────────────────────────
    'ɑr':  { ipa: '/ɑr/',  tts: 'ar',     example: 'arm',      description: 'ar as in arm' },
    'ɔr':  { ipa: '/ɔr/',  tts: 'or',     example: 'or',       description: 'or as in for' },
    'ɝ':   { ipa: '/ɝ/',   tts: 'er',     example: 'her',      description: 'er as in her' },
    'ɪr':  { ipa: '/ɪr/',  tts: 'eer',    example: 'ear',      description: 'eer as in deer' },
    'ɛr':  { ipa: '/ɛr/',  tts: 'air',    example: 'air',      description: 'air as in chair' },

    // ─── Diphthongs ───────────────────────────────────────────────────────────
    'ɔɪ':  { ipa: '/ɔɪ/',  tts: 'oy',     example: 'oil',      description: 'oy as in boy' },
    'aʊ':  { ipa: '/aʊ/',  tts: 'ow',     example: 'out',      description: 'ow as in cow' },

    // ─── Other vowels ─────────────────────────────────────────────────────────
    'ə':   { ipa: '/ə/',   tts: 'uh',     example: 'about',    description: 'schwa, the unstressed uh' },
    'ʊ':   { ipa: '/ʊ/',   tts: 'oo',     example: 'book',     description: 'short oo as in book' },
});

// ─── Aliases ──────────────────────────────────────────────────────────────────
//
// Make lookup forgiving: support both bracketed and bare IPA, single-letter
// shortcuts, and common alternate symbols.

const PHONEME_ALIASES = Object.freeze({
    // bracketed IPA → bare key
    '/b/': 'b',  '/d/': 'd',  '/f/': 'f',  '/g/': 'g',  '/h/': 'h',
    '/dʒ/': 'dʒ', '/k/': 'k', '/l/': 'l',  '/m/': 'm',  '/n/': 'n',
    '/p/': 'p',  '/r/': 'r',  '/s/': 's',  '/t/': 't',  '/v/': 'v',
    '/w/': 'w',  '/j/': 'j',  '/z/': 'z',  '/ʃ/': 'ʃ',  '/ʒ/': 'ʒ',
    '/tʃ/': 'tʃ','/θ/': 'θ',  '/ð/': 'ð',  '/ŋ/': 'ŋ',
    '/æ/': 'æ',  '/ɛ/': 'ɛ',  '/ɪ/': 'ɪ',  '/ɒ/': 'ɒ',  '/ʌ/': 'ʌ',
    '/ɑ/': 'ɒ',                    // /ɑ/ (American hot) maps to /ɒ/ (British hot) entry
    '/eɪ/': 'eɪ','/iː/': 'iː','/i/': 'iː', '/aɪ/': 'aɪ','/oʊ/': 'oʊ','/uː/': 'uː','/u/': 'uː',
    '/ɑr/': 'ɑr','/ɔr/': 'ɔr','/ɝ/': 'ɝ', '/ɜr/': 'ɝ', '/ɪr/': 'ɪr','/ɛr/': 'ɛr',
    '/ɔɪ/': 'ɔɪ','/aʊ/': 'aʊ',
    '/ə/': 'ə',  '/ʊ/': 'ʊ',

    // common digraph spellings → phoneme key
    'sh': 'ʃ', 'ch': 'tʃ', 'th': 'θ', 'wh': 'w', 'ng': 'ŋ', 'ph': 'f',
    'qu': 'k',  // qu typically /kw/ but commonly modeled as /k/+/w/

    // short vowel spellings → phoneme key
    'short_a': 'æ', 'short_e': 'ɛ', 'short_i': 'ɪ', 'short_o': 'ɒ', 'short_u': 'ʌ',

    // long vowel spellings → phoneme key
    'long_a': 'eɪ', 'long_e': 'iː', 'long_i': 'aɪ', 'long_o': 'oʊ', 'long_u': 'uː',
});

/**
 * Resolve any phoneme reference (bracketed IPA, bare IPA, digraph spelling,
 * "short_a"-style key) to a canonical PHONEMES key.
 *
 * @param {string} ref
 * @returns {string|null}
 */
export function resolvePhoneme(ref) {
    if (!ref) return null;
    if (PHONEMES[ref]) return ref;
    if (PHONEME_ALIASES[ref]) return PHONEME_ALIASES[ref];
    // Try lowercased lookup for things like 'SH'
    const lower = String(ref).toLowerCase();
    if (PHONEMES[lower]) return lower;
    if (PHONEME_ALIASES[lower]) return PHONEME_ALIASES[lower];
    return null;
}

// ─── Speech helpers ────────────────────────────────────────────────────────────
//
// These prefer Math Quest's window.speakAnswerOption() (which already handles
// voice warming, paused-synth resume, and TTS-disabled state). If that isn't
// available, fall back to a direct SpeechSynthesisUtterance call.

function _speakRaw(text) {
    if (!text || typeof window === 'undefined') return;
    if (!state || state.audio_enabled === false) return;
    if (typeof window.speakAnswerOption === 'function') {
        window.speakAnswerOption(text);
        return;
    }
    if (!('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
    } catch (_) {}
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1.0;
    try { window.speechSynthesis.speak(u); } catch (_) {}
}

/**
 * Speak a single phoneme as its sound.
 *
 * Examples:
 *   speakPhoneme('/k/')   → "kuh"
 *   speakPhoneme('æ')     → "aaa"
 *   speakPhoneme('sh')    → "shh"
 *   speakPhoneme('short_a') → "aaa"
 *
 * @param {string} phoneme
 */
export function speakPhoneme(phoneme) {
    const key = resolvePhoneme(phoneme);
    if (!key) return;
    _speakRaw(PHONEMES[key].tts);
}

/**
 * Speak a phoneme followed by its example word: "/b/ as in ball".
 * Useful for K-2 phonemic-awareness prompts where the student needs both
 * the sound and an anchor word.
 *
 * @param {string} phoneme
 */
export function speakPhonemeWithExample(phoneme) {
    const key = resolvePhoneme(phoneme);
    if (!key) return;
    const p = PHONEMES[key];
    _speakRaw(`${p.tts} as in ${p.example}`);
}

/**
 * Speak a sequence of phonemes one at a time, with a configurable gap
 * between them. Used by sound-box / segmentation widgets.
 *
 * Returns a Promise that resolves when the last phoneme has been queued
 * (not when audio finishes — Web Speech queues utterances internally).
 *
 * @param {string[]} phonemes
 * @param {object} [options]
 * @param {number} [options.gapMs=600]  delay between phonemes
 * @param {boolean} [options.withExample=false]  speak example after each
 * @returns {Promise<void>}
 */
export function speakPhonemeSequence(phonemes, options = {}) {
    const gap = typeof options.gapMs === 'number' ? options.gapMs : 600;
    const withExample = !!options.withExample;
    return new Promise(resolve => {
        if (!Array.isArray(phonemes) || phonemes.length === 0) { resolve(); return; }
        let i = 0;
        const tick = () => {
            if (i >= phonemes.length) { resolve(); return; }
            const fn = withExample ? speakPhonemeWithExample : speakPhoneme;
            fn(phonemes[i]);
            i += 1;
            setTimeout(tick, gap);
        };
        tick();
    });
}

/**
 * Speak a phoneme sequence followed by the blended word.
 * Pattern: /k/ /æ/ /t/ ... cat
 * Standard "blend the sounds" routine for K-2 phonics.
 *
 * @param {string[]} phonemes  the segmented phonemes
 * @param {string} blendedWord the resulting word, spoken after the sequence
 * @param {object} [options]
 * @param {number} [options.gapMs=600]
 * @param {number} [options.beforeWordMs=900]  pause before the blended word
 */
export function speakBlend(phonemes, blendedWord, options = {}) {
    const gap = typeof options.gapMs === 'number' ? options.gapMs : 600;
    const beforeWord = typeof options.beforeWordMs === 'number' ? options.beforeWordMs : 900;
    speakPhonemeSequence(phonemes, { gapMs: gap }).then(() => {
        setTimeout(() => _speakRaw(blendedWord), beforeWord);
    });
}

// ─── Word → phoneme decomposition ─────────────────────────────────────────────
//
// Hardcoded for the most common K-2 words. The phonics generators reference
// this when they need to segment a word into phonemes for sound-box / blending
// activities. For words not in the table, callers can pass an explicit phoneme
// array to speakPhonemeSequence() / speakBlend().
//
// Coverage: ~150 high-frequency CVC + CVCe + CCVC + digraph words drawn from
// the existing word banks in gen-phonics.js.

export const WORD_PHONEMES = Object.freeze({
    // Short a (CVC)
    'cat':  ['k', 'æ', 't'],   'hat':  ['h', 'æ', 't'],   'bag':  ['b', 'æ', 'g'],
    'can':  ['k', 'æ', 'n'],   'pan':  ['p', 'æ', 'n'],   'mad':  ['m', 'æ', 'd'],
    'tap':  ['t', 'æ', 'p'],   'map':  ['m', 'æ', 'p'],   'bat':  ['b', 'æ', 't'],
    'cap':  ['k', 'æ', 'p'],   'apple':['æ', 'p', 'l'],   'ant':  ['æ', 'n', 't'],
    'axe':  ['æ', 'k', 's'],   'add':  ['æ', 'd'],
    // Short e (CVC)
    'bed':  ['b', 'ɛ', 'd'],   'red':  ['r', 'ɛ', 'd'],   'pen':  ['p', 'ɛ', 'n'],
    'hen':  ['h', 'ɛ', 'n'],   'wet':  ['w', 'ɛ', 't'],   'vet':  ['v', 'ɛ', 't'],
    'net':  ['n', 'ɛ', 't'],   'jet':  ['dʒ', 'ɛ', 't'],  'peg':  ['p', 'ɛ', 'g'],
    'men':  ['m', 'ɛ', 'n'],
    // Short i (CVC)
    'sit':  ['s', 'ɪ', 't'],   'big':  ['b', 'ɪ', 'g'],   'pig':  ['p', 'ɪ', 'g'],
    'fish': ['f', 'ɪ', 'ʃ'],   'win':  ['w', 'ɪ', 'n'],   'hit':  ['h', 'ɪ', 't'],
    'pin':  ['p', 'ɪ', 'n'],   'lid':  ['l', 'ɪ', 'd'],   'dip':  ['d', 'ɪ', 'p'],
    'fig':  ['f', 'ɪ', 'g'],
    // Short o (CVC)
    'hot':  ['h', 'ɒ', 't'],   'dog':  ['d', 'ɒ', 'g'],   'top':  ['t', 'ɒ', 'p'],
    'pot':  ['p', 'ɒ', 't'],   'box':  ['b', 'ɒ', 'k', 's'], 'log': ['l', 'ɒ', 'g'],
    'rock': ['r', 'ɒ', 'k'],   'sock': ['s', 'ɒ', 'k'],   'hop':  ['h', 'ɒ', 'p'],
    'nod':  ['n', 'ɒ', 'd'],
    // Short u (CVC)
    'sun':  ['s', 'ʌ', 'n'],   'bug':  ['b', 'ʌ', 'g'],   'cup':  ['k', 'ʌ', 'p'],
    'run':  ['r', 'ʌ', 'n'],   'fun':  ['f', 'ʌ', 'n'],   'mud':  ['m', 'ʌ', 'd'],
    'tub':  ['t', 'ʌ', 'b'],   'gum':  ['g', 'ʌ', 'm'],   'rug':  ['r', 'ʌ', 'g'],
    'pup':  ['p', 'ʌ', 'p'],
    // VCe long vowels
    'cake': ['k', 'eɪ', 'k'],  'tape': ['t', 'eɪ', 'p'],  'name': ['n', 'eɪ', 'm'],
    'kite': ['k', 'aɪ', 't'],  'time': ['t', 'aɪ', 'm'],  'ride': ['r', 'aɪ', 'd'],
    'hope': ['h', 'oʊ', 'p'],  'rope': ['r', 'oʊ', 'p'],  'bone': ['b', 'oʊ', 'n'],
    'cube': ['k', 'j', 'uː', 'b'], 'tune': ['t', 'uː', 'n'],
    // Digraphs sh / ch / th / wh
    'ship': ['ʃ', 'ɪ', 'p'],   'shop': ['ʃ', 'ɒ', 'p'],   'shut': ['ʃ', 'ʌ', 't'],
    'chip': ['tʃ', 'ɪ', 'p'],  'chin': ['tʃ', 'ɪ', 'n'],  'chat': ['tʃ', 'æ', 't'],
    'thin': ['θ', 'ɪ', 'n'],   'this': ['ð', 'ɪ', 's'],   'that': ['ð', 'æ', 't'],
    'when': ['w', 'ɛ', 'n'],   'what': ['w', 'ʌ', 't'],   'why':  ['w', 'aɪ'],
    // R-controlled
    'car':  ['k', 'ɑr'],       'star': ['s', 't', 'ɑr'],  'park': ['p', 'ɑr', 'k'],
    'corn': ['k', 'ɔr', 'n'],  'fork': ['f', 'ɔr', 'k'],  'horn': ['h', 'ɔr', 'n'],
    'her':  ['h', 'ɝ'],        'bird': ['b', 'ɝ', 'd'],   'turn': ['t', 'ɝ', 'n'],
    // Vowel teams
    'rain': ['r', 'eɪ', 'n'],  'tree': ['t', 'r', 'iː'],  'see':  ['s', 'iː'],
    'boat': ['b', 'oʊ', 't'],  'snow': ['s', 'n', 'oʊ'],  'play': ['p', 'l', 'eɪ'],
    'eat':  ['iː', 't'],       'read': ['r', 'iː', 'd'],
    // Common heart words (with the irregular grapheme noted in HEART_WORDS_BANK)
    'said': ['s', 'ɛ', 'd'],   'was':  ['w', 'ʌ', 'z'],   'have': ['h', 'æ', 'v'],
    'of':   ['ʌ', 'v'],        'the':  ['ð', 'ə'],        'to':   ['t', 'uː'],
    'you':  ['j', 'uː'],       'are':  ['ɑr'],            'were': ['w', 'ɝ'],
});

/**
 * Decompose a word into its phoneme sequence using WORD_PHONEMES, falling
 * back to a heuristic letter-by-letter decomposition for unknown words.
 *
 * @param {string} word
 * @returns {string[]} array of canonical PHONEMES keys
 */
export function decomposeWord(word) {
    if (!word) return [];
    const w = String(word).toLowerCase().trim();
    if (WORD_PHONEMES[w]) return WORD_PHONEMES[w].slice();
    // Heuristic fallback: process common digraphs first, then fall back to
    // letter-by-letter mapping. Imperfect but better than letter names.
    const out = [];
    let i = 0;
    while (i < w.length) {
        const two = w.slice(i, i + 2);
        const three = w.slice(i, i + 3);
        if (three === 'igh') { out.push('aɪ'); i += 3; continue; }
        if (PHONEME_ALIASES[two]) { out.push(PHONEME_ALIASES[two]); i += 2; continue; }
        const ch = w[i];
        if (PHONEMES[ch]) { out.push(ch); }
        // simple vowel letter → short vowel sound (default)
        else if (ch === 'a') out.push('æ');
        else if (ch === 'e') out.push('ɛ');
        else if (ch === 'i') out.push('ɪ');
        else if (ch === 'o') out.push('ɒ');
        else if (ch === 'u') out.push('ʌ');
        else if (ch === 'y') out.push('aɪ');  // final-y as long-i is more common
        else if (ch === 'c') out.push('k');
        else if (ch === 'q') out.push('k');
        else if (ch === 'x') { out.push('k'); out.push('s'); }
        // skip silent letters and unmapped chars
        i += 1;
    }
    return out;
}

/**
 * Speak a word by sounding out each phoneme, then blending into the word.
 * The most common phonemic-awareness routine: "/k/ /æ/ /t/ ... cat".
 *
 * @param {string} word
 * @param {object} [options]  passed through to speakBlend
 */
export function soundOutWord(word, options = {}) {
    const phonemes = decomposeWord(word);
    if (phonemes.length === 0) return;
    speakBlend(phonemes, word, options);
}

// ─── window attachment for inline onclick handlers ─────────────────────────────
//
// All four public functions plus the data tables are attached to window so
// HTML inline handlers (and other widgets that don't import this module) can
// call them directly.

if (typeof window !== 'undefined') {
    window.speakPhoneme            = speakPhoneme;
    window.speakPhonemeWithExample = speakPhonemeWithExample;
    window.speakPhonemeSequence    = speakPhonemeSequence;
    window.speakBlend              = speakBlend;
    window.soundOutWord            = soundOutWord;
    window.decomposeWord           = decomposeWord;
    window.PHONEMES                = PHONEMES;
}
